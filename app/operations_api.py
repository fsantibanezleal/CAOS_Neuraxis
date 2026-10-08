"""Bounded public operations. Never exposes the authenticated host workspace API."""

from __future__ import annotations

import asyncio
import hmac
import io
import json
import os
import secrets
import shutil
import threading
import time
import zipfile
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from reflexmesh import __version__ as engine_version

from app.services.operations import (
    TASKS,
    VARIANTS,
    encoded,
    execute_operation,
    fixture,
    graph,
    strict_json,
    validate_files,
)


class Operations:
    def __init__(self, root: Path, capacity=2, ttl=3600):
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        self.capacity, self.ttl = capacity, ttl
        self.lock = threading.RLock()
        self.sessions, self.runs, self.starts = {}, {}, []

    def _remove(self, run):
        path = (self.root / run["id"]).resolve()
        if (
            path.parent != self.root
            or not all(c in "0123456789abcdef" for c in path.name)
            or len(path.name) != 32
        ):
            raise RuntimeError("Invalid owned run directory")
        if path.exists():
            shutil.rmtree(path)

    def collect(self):
        now = time.monotonic()
        with self.lock:
            for key, run in list(self.runs.items()):
                if now - run["created"] > self.ttl and run["status"] not in {
                    "queued",
                    "running",
                    "cancelling",
                }:
                    self._remove(run)
                    del self.runs[key]
            live_owners = {r["owner"] for r in self.runs.values()}
            self.sessions = {k: v for k, v in self.sessions.items() if now - v < self.ttl or k in live_owners}
            self.starts = [t for t in self.starts if now - t < 60]
            # Prior-process runs have no surviving session capabilities. Keep the
            # same one-hour retention promise after a service restart as well.
            for path in self.root.iterdir():
                if (
                    path.is_dir()
                    and not path.is_symlink()
                    and len(path.name) == 32
                    and all(c in "0123456789abcdef" for c in path.name)
                    and path.name not in self.runs
                    and time.time() - path.stat().st_mtime > self.ttl
                ):
                    self._remove({"id": path.name})

    def session(self):
        self.collect()
        with self.lock:
            if len(self.sessions) >= 128:
                raise HTTPException(429, "Session capacity reached; try later")
            token = secrets.token_urlsafe(32)
            self.sessions[token] = time.monotonic()
            return token

    def owner(self, request):
        self.collect()
        token = request.headers.get("authorization", "").removeprefix("Bearer ")
        with self.lock:
            if token not in self.sessions:
                raise HTTPException(401, "Operation session expired")
            self.sessions[token] = time.monotonic()
        return token

    def owned(self, run_id, owner):
        with self.lock:
            run = self.runs.get(run_id)
            if run is None or not hmac.compare_digest(run["owner"], owner):
                raise HTTPException(404, "Unknown operation")
            return run

    def history(self, owner):
        with self.lock:
            return [
                {
                    **{k: run[k] for k in ("id", "task", "variant", "seed", "status")},
                    "created_at": run["created_at"],
                    "expires_at": run["created_at"] + self.ttl,
                    "findings": len((run["result"] or {}).get("findings", [])),
                    "disposition": (run["result"] or {}).get("disposition", "incomplete"),
                }
                for run in sorted(self.runs.values(), key=lambda r: r["created"], reverse=True)
                if hmac.compare_digest(run["owner"], owner)
            ]

    def start(self, owner, value):
        if set(value) - {"task", "variant", "seed", "files"}:
            raise ValueError("Unsupported operation fields")
        task, variant, seed = (
            value.get("task", "release"),
            value.get("variant", "compound"),
            value.get("seed", 17),
        )
        if task not in TASKS or variant not in VARIANTS or type(seed) is not int or not 0 <= seed <= 99999:
            raise ValueError("Unknown task, condition or seed")
        files = validate_files(value["files"]) if "files" in value else fixture(task, variant, seed)
        self.collect()
        with self.lock:
            active = [r for r in self.runs.values() if r["status"] in {"queued", "running", "cancelling"}]
            if len(active) >= self.capacity or any(r["owner"] == owner for r in active):
                raise HTTPException(429, "Execution capacity occupied; wait for the current task")
            if len(self.runs) >= 24 or len(self.starts) >= 20:
                raise HTTPException(
                    429, "Operation retention or rate limit reached; delete completed runs or retry later"
                )
            key = secrets.token_hex(16)
            run = {
                "id": key,
                "owner": owner,
                "created": time.monotonic(),
                "created_at": time.time(),
                "status": "queued",
                "task": task,
                "variant": "uploaded" if "files" in value else variant,
                "seed": seed,
                "events": [],
                "result": None,
                "cancel": threading.Event(),
                "inputs": files,
                "nodes": graph(task),
                "error": None,
            }
            self.runs[key] = run
            self.starts.append(time.monotonic())
            thread = threading.Thread(target=self._execute, args=(run,), daemon=True)
            run["thread"] = thread
            try:
                thread.start()
            except RuntimeError:
                del self.runs[key]
                self.starts.pop()
                raise HTTPException(503, "Execution worker unavailable; retry later") from None
            return self.snapshot(run)

    def _execute(self, run):
        def event(value):
            with self.lock:
                if len(run["events"]) >= 512:
                    run["cancel"].set()
                    return
                run["events"].append(value)
                node = next(
                    (n for n in run["nodes"] if n["id"] == value.get("node", value.get("goal_id"))), None
                )
                if node:
                    if value["kind"] == "tool_started":
                        node["state"] = "running"
                    if value["kind"] == "tool_finished":
                        node["evidence"] = value["evidence"]
                    if value["kind"] == "goal_state":
                        node["state"] = value["state"]

        try:
            with self.lock:
                run["status"] = "running"
            root = self.root / run["id"]
            root.mkdir()
            result = execute_operation(root, run["task"], run["inputs"], cancel=run["cancel"], on_event=event)
            with self.lock:
                run["result"] = result
                run["nodes"] = result["nodes"]
                run["status"] = result["status"]
        except Exception as exc:  # noqa: BLE001 - preserve worker failure as an explicit run outcome
            with self.lock:
                run["error"] = type(exc).__name__ + ": " + str(exc)[:300]
                run["status"] = "cancelled" if run["cancel"].is_set() else "failed"

    def snapshot(self, run):
        with self.lock:
            return json.loads(
                json.dumps(
                    {
                        k: run[k]
                        for k in (
                            "id",
                            "created_at",
                            "status",
                            "task",
                            "variant",
                            "seed",
                            "events",
                            "result",
                            "inputs",
                            "nodes",
                            "error",
                        )
                    }
                )
            )

    def close(self):
        with self.lock:
            jobs = list(self.runs.values())
            for run in jobs:
                run["cancel"].set()
        deadline = time.monotonic() + 50
        for run in jobs:
            run["thread"].join(timeout=max(0, deadline - time.monotonic()))


def create_app(root=None, host=None, prefix="/operations-api"):
    manager = Operations(Path(root or os.environ.get("NEURAXIS_OPERATIONS_ROOT", ".runtime/operations")))
    allowed_host = host or os.environ.get("NEURAXIS_OPERATIONS_HOST", "127.0.0.1:4178")

    @asynccontextmanager
    async def lifespan(app):
        async def cleanup():
            while True:
                await asyncio.sleep(30)
                await asyncio.to_thread(manager.collect)

        task = asyncio.create_task(cleanup())
        yield
        task.cancel()
        await asyncio.to_thread(manager.close)

    app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.operations = manager

    @app.middleware("http")
    async def boundary(request, next_call):
        actual = request.headers.get("host", "")
        origin = request.headers.get("origin")
        if actual != allowed_host or origin and origin not in {"https://" + actual, "http://" + actual}:
            return JSONResponse({"detail": "Same-origin operation required"}, status_code=403)
        if (
            request.method not in {"GET", "HEAD"}
            and request.headers.get("x-neuraxis-client") != "operations-v1"
        ):
            return JSONResponse({"detail": "Operation client header required"}, status_code=403)
        response = await next_call(request)
        response.headers.update(
            {
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
                "Referrer-Policy": "no-referrer",
            }
        )
        return response

    async def body(request):
        raw = bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw) > 1_600_000:
                raise HTTPException(413, "Input exceeds request limit")
        try:
            value = strict_json(raw.decode("utf8"))
            if not isinstance(value, dict):
                raise TypeError("Expected JSON object")
            return value
        except (ValueError, TypeError, UnicodeDecodeError, RecursionError):
            raise HTTPException(422, "Expected a bounded JSON object") from None

    @app.get(prefix + "/config")
    def config():
        commit_file = Path(__file__).resolve().parents[1] / "commit.txt"
        return {
            "schema_version": 1,
            "engine": f"reflexmesh {engine_version}",
            "commit": commit_file.read_text().strip() if commit_file.is_file() else "local",
            "tasks": TASKS,
            "variants": VARIANTS,
            "max_files": 256,
            "max_bytes": 1048576,
            "retention_seconds": manager.ttl,
            "execution": "native isolated run directory",
            "model_available": False,
        }

    @app.post(prefix + "/session")
    def session():
        return {"token": manager.session(), "retention_seconds": manager.ttl}

    @app.get(prefix + "/fixture")
    def example(task: str = "release", variant: str = "compound", seed: int = 17):
        try:
            return {"files": fixture(task, variant, seed), "nodes": graph(task)}
        except (ValueError, KeyError):
            raise HTTPException(422, "Unknown fixture") from None

    @app.post(prefix + "/runs")
    async def start(request: Request):
        owner = manager.owner(request)
        try:
            value = await body(request)
            return await asyncio.to_thread(manager.start, owner, value)
        except (ValueError, TypeError, UnicodeEncodeError):
            raise HTTPException(
                422, "Invalid operation input; check names, counts and UTF-8 byte limits"
            ) from None

    @app.get(prefix + "/runs")
    def history(request: Request):
        return {"runs": manager.history(manager.owner(request))}

    @app.get(prefix + "/runs/{run_id}")
    def snapshot(run_id: str, request: Request):
        owner = manager.owner(request)
        with manager.lock:
            return manager.snapshot(manager.owned(run_id, owner))

    @app.post(prefix + "/runs/{run_id}/cancel")
    def cancel(run_id: str, request: Request):
        owner = manager.owner(request)
        with manager.lock:
            run = manager.owned(run_id, owner)
            if run["status"] in {"queued", "running", "cancelling"}:
                run["cancel"].set()
                run["status"] = "cancelling"
        return manager.snapshot(run)

    @app.delete(prefix + "/runs/{run_id}")
    def delete(run_id: str, request: Request):
        owner = manager.owner(request)
        with manager.lock:
            run = manager.owned(run_id, owner)
            if run["status"] in {"queued", "running", "cancelling"}:
                raise HTTPException(409, "Cancel and await completion before deletion")
            manager._remove(run)
            del manager.runs[run_id]
        return {"deleted": True}

    @app.get(prefix + "/runs/{run_id}/export")
    def export(run_id: str, request: Request):
        owner = manager.owner(request)
        with manager.lock:
            snapshot = manager.snapshot(manager.owned(run_id, owner))
        if snapshot["status"] in {"queued", "running", "cancelling"}:
            raise HTTPException(409, "Wait for a terminal run")
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("execution.json", encoded(snapshot))
            for name, artifact in (snapshot["result"] or {}).get("artifacts", {}).items():
                archive.writestr("output/" + name + ".json", encoded(artifact))
            for path, output in (
                (snapshot["result"] or {})
                .get("artifacts", {})
                .get("normalize", {})
                .get("outputs", {})
                .items()
            ):
                archive.writestr("accepted/" + path, output["content"].encode())
            for item in snapshot["inputs"]:
                archive.writestr("input/" + item["path"], item["content"].encode())
        return Response(
            stream.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="neuraxis-{run_id}.zip"'},
        )

    return app
