"""Product-specific file investigations, executed by the published native controller.

Inputs are text data. This module never imports or executes uploaded source.
"""

from __future__ import annotations

import ast
import asyncio
import csv
import hashlib
import io
import json
import math
import re
import threading
import time
import tomllib
from collections import defaultdict, deque
from pathlib import Path, PurePosixPath

from reflexmesh import __version__ as engine_version
from reflexmesh.contracts import Decision, Observation
from reflexmesh.controller import Controller, Event, Goal
from reflexmesh.runtime import EffectReceipt, Runtime, ToolSpec

TASKS = {
    "release": {
        "en": "Verify a software release",
        "es": "Verificar una entrega de software",
        "nodes": [
            "inventory",
            "syntax",
            "tables",
            "dependencies",
            "integrity",
            "normalize",
            "manifest",
            "report",
            "verify",
        ],
    },
    "source": {
        "en": "Audit a source workspace",
        "es": "Auditar un proyecto de código",
        "nodes": ["inventory", "syntax", "dependencies", "integrity", "manifest", "report", "verify"],
    },
    "data": {
        "en": "Reconcile a data delivery",
        "es": "Conciliar una entrega de datos",
        "nodes": ["inventory", "tables", "integrity", "normalize", "manifest", "report", "verify"],
    },
}
NODE_INFO = {
    "inventory": ("Map input files", "Mapear archivos", []),
    "syntax": ("Validate source & configuration", "Validar código y configuración", ["inventory"]),
    "tables": ("Check records & relationships", "Comprobar registros y relaciones", ["inventory"]),
    "dependencies": ("Resolve task dependencies", "Resolver dependencias", ["syntax"]),
    "integrity": ("Verify declared file hashes", "Verificar huellas declaradas", ["inventory"]),
    "normalize": ("Separate accepted & rejected rows", "Separar filas aceptadas y rechazadas", ["tables"]),
    "manifest": ("Build content manifest", "Construir manifiesto", ["inventory"]),
    "report": ("Assemble actionable findings", "Reunir hallazgos verificables", []),
    "verify": ("Independently verify deliverables", "Verificar entregables independientemente", ["report"]),
}
VARIANTS = ("clean", "corrupt", "conflict", "compound")
MAX_FILES, MAX_BYTES, MAX_FILE_BYTES = 256, 1_048_576, 131_072


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def encoded(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n").encode()


def validate_files(value: list[dict]) -> list[dict]:
    if not isinstance(value, list) or not 1 <= len(value) <= MAX_FILES:
        raise ValueError("Select between 1 and 256 text files")
    total, seen, result = 0, set(), []
    for item in value:
        if not isinstance(item, dict) or set(item) != {"path", "content"}:
            raise ValueError("Every file requires only path and UTF-8 content")
        path, content = item["path"], item["content"]
        if (
            not isinstance(path, str)
            or not 1 <= len(path) <= 180
            or not re.fullmatch(r"[A-Za-z0-9_./ -]+", path)
            or path.startswith(("/", "."))
            or "\\" in path
            or any(p in {"", ".", ".."} or p.endswith((" ", ".")) for p in path.split("/"))
            or any(
                re.fullmatch(r"(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?", p) for p in path.split("/")
            )
            or not isinstance(content, str)
            or "\x00" in content
        ):
            raise ValueError("Use portable relative file names and text content")
        size = len(content.encode("utf-8"))
        total += size
        if path.casefold() in seen or size > MAX_FILE_BYTES or total > MAX_BYTES:
            raise ValueError("Duplicate path or file size limit (128 KiB/file, 1 MiB total)")
        seen.add(path.casefold())
        result.append({"path": path, "content": content})
    for path in seen:
        if any(
            parent.as_posix().casefold() in seen
            for parent in PurePosixPath(path).parents
            if parent.as_posix() != "."
        ):
            raise ValueError("A file cannot also be a directory")
    return sorted(result, key=lambda x: x["path"])


def fixture(task="release", variant="compound", seed=17):
    if task not in TASKS or variant not in VARIANTS or type(seed) is not int or not 0 <= seed <= 99999:
        raise ValueError("Unknown task, condition or seed")
    files = [
        {"path": f"src/module_{i:02d}.py", "content": f"def transform(value):\n    return value * {i + 1}\n"}
        for i in range(32)
    ]
    files += [
        {
            "path": f"config/shard_{i:02d}.json",
            "content": json.dumps({"shard": i, "batch_size": 32 + seed % 7, "enabled": True}) + "\n",
        }
        for i in range(16)
    ]
    customers = "id,name\n" + "".join(f"C{i:03d},Customer {i}\n" for i in range(80))
    orders = "id,customer_id,quantity\n" + "".join(
        f"O{i:04d},C{i % 80:03d},{1 + (i + seed) % 9}\n" for i in range(320)
    )
    files += [
        {"path": "data/customers.csv", "content": customers},
        {"path": "data/orders.csv", "content": orders},
    ]
    jobs = [{"id": f"job-{i}", "depends_on": [] if i < 3 else [f"job-{i - 3}"]} for i in range(18)]
    files += [
        {"path": "workflow.json", "content": json.dumps({"jobs": jobs}, indent=2) + "\n"},
        {
            "path": "pyproject.toml",
            "content": '[project]\nname = "owned-release-bundle"\nversion = "1.0.0"\n',
        },
        {
            "path": "README.md",
            "content": "# Owned compound workload\n32 Python modules, 16 configurations, 400 records and 18 dependent jobs.\n",
        },
    ]
    manifest = {f["path"]: digest(f["content"].encode()) for f in files}
    files.append({"path": "release-manifest.json", "content": json.dumps(manifest, indent=2) + "\n"})
    by_path = {f["path"]: f for f in files}
    if variant in {"corrupt", "compound"}:
        by_path["src/module_07.py"]["content"] = "def transform(value)\n    return value * 8\n"
        by_path["config/shard_03.json"]["content"] = '{"shard": 3, "batch_size": }\n'
        by_path["data/orders.csv"]["content"] += "O0900,C999,3\nO0901,,2\n"
    if variant in {"conflict", "compound"}:
        by_path["data/orders.csv"]["content"] += "O0000,C000,7\n"
        jobs[0]["depends_on"] = ["job-15"]
        by_path["workflow.json"]["content"] = json.dumps({"jobs": jobs}, indent=2) + "\n"
    return validate_files(files)


def graph(task):
    names = TASKS[task]["nodes"]
    result = []
    for name in names:
        en, es, dependencies = NODE_INFO[name]
        dependencies = [d for d in dependencies if d in names]
        if name == "report":
            dependencies = [n for n in names if n not in {"report", "verify"}]
        result.append(
            {
                "id": name,
                "title": {"en": en, "es": es},
                "depends_on": dependencies,
                "output": f"output/{name}.json",
                "state": "pending",
            }
        )
    return result


def finding(code, path, message, severity="error", line=None, **extra):
    return {"code": code, "path": path, "message": message, "severity": severity, "line": line, **extra}


def strict_json(text):
    def constant(_):
        raise ValueError("Non-finite JSON number")

    def pairs(items):
        output = {}
        for k, v in items:
            if k in output:
                raise ValueError(f"Duplicate JSON key: {k}")
            output[k] = v
        return output

    def number(value):
        parsed = float(value)
        if not math.isfinite(parsed):
            raise ValueError("JSON number exceeds finite range")
        return parsed

    value = json.loads(text, parse_float=number, parse_constant=constant, object_pairs_hook=pairs)
    pending = [value]
    while pending:
        item = pending.pop()
        if isinstance(item, str):
            item.encode("utf8")  # Escaped lone surrogates are not portable UTF-8 text.
        elif isinstance(item, dict):
            pending.extend(item.keys())
            pending.extend(item.values())
        elif isinstance(item, list):
            pending.extend(item)
    return value


def read_table(text):
    reader = csv.reader(io.StringIO(text, newline=""), strict=True)
    headers = next(reader, [])
    if (
        not headers
        or len(headers) > 256
        or any(not h.strip() for h in headers)
        or len(set(headers)) != len(headers)
    ):
        raise ValueError("Expected 1..256 unique, nonblank column names")
    records = []
    while True:
        line = reader.line_num + 1
        raw = next(reader, None)
        if raw is None:
            break
        if not raw:  # Empty physical lines are not CSV records.
            continue
        records.append(
            {
                "record": len(records) + 1,
                "line": line,
                "end_line": reader.line_num,
                "values": {h: raw[i] if i < len(raw) else None for i, h in enumerate(headers)},
                "extra_values": raw[len(headers) :],
                "reasons": [],
            }
        )
        if len(records) > 20000:
            raise ValueError("Table exceeds 20,000 records")
    return headers, records


def analyze_tables(files, cancelled):
    tables, findings = {}, []
    for path, text in files.items():
        if not path.lower().endswith(".csv"):
            continue
        try:
            headers, records = read_table(text)
            seen = set()
            for row in records:
                if row["extra_values"] or any(v is None or not v.strip() for v in row["values"].values()):
                    row["reasons"].append("missing_or_extra_value")
                key = row["values"].get("id")
                if key is not None and key in seen:
                    row["reasons"].append("duplicate_id")
                if key is not None and not row["reasons"]:
                    seen.add(key)
            tables[path] = {"headers": headers, "rows": records}
        except (csv.Error, ValueError) as exc:
            findings.append(finding("invalid_table", path, str(exc)))

    aliases = defaultdict(set)
    for path, table in tables.items():
        if "id" in table["headers"]:
            stem = PurePosixPath(path).stem
            aliases[stem].add(path)
            aliases[stem.removesuffix("s")].add(path)
    available = {
        (path, row["values"].get("id"))
        for path, table in tables.items()
        for row in table["rows"]
        if not row["reasons"]
    }
    reverse, invalid, relationships = defaultdict(list), deque(), []

    def reject(path, row, code):
        if code not in row["reasons"]:
            was_valid = not row["reasons"]
            row["reasons"].append(code)
            if was_valid:
                invalid.append((path, row))

    for path, table in tables.items():
        if cancelled.is_set():
            raise InterruptedError("cancelled")
        for col in table["headers"]:
            if not col.endswith("_id"):
                continue
            candidates = aliases[col[:-3]]
            local = {p for p in candidates if PurePosixPath(p).parent == PurePosixPath(path).parent}
            targets = local or candidates
            if len(targets) != 1:
                code = "ambiguous_reference" if targets else "unchecked_reference"
                findings.append(
                    finding(
                        code,
                        path,
                        f"Column {col}: expected one target table, found {len(targets)}",
                        "warning",
                    )
                )
                relationships.append({"path": path, "column": col, "target": None, "status": code})
                if targets:
                    for row in table["rows"]:
                        reject(path, row, code)
                continue
            target = next(iter(targets))
            relationships.append({"path": path, "column": col, "target": target, "status": "checked"})
            for row in table["rows"]:
                value = row["values"].get(col)
                if value:
                    reverse[(target, value)].append((path, row))
                    if (target, value) not in available:
                        reject(path, row, "unknown_reference")
    # A rejected parent invalidates all dependents, including multi-table chains.
    while invalid:
        if cancelled.is_set():
            raise InterruptedError("cancelled")
        path, row = invalid.popleft()
        key = (path, row["values"].get("id"))
        available.discard(key)
        for child_path, child in reverse[key]:
            reject(child_path, child, "unknown_reference")
    for path, table in tables.items():
        records = table.pop("rows")
        table["accepted"] = [r for r in records if not r["reasons"]]
        table["rejected"] = [r for r in records if r["reasons"]]
        for row in table["rejected"]:
            for code in row["reasons"]:
                findings.append(
                    finding(code, path, f"Record {row['record']}: {code.replace('_', ' ')}", line=row["line"])
                )
    return {"tables": tables, "relationships": relationships, "findings": findings}


def analyze(node, files, prior, cancelled):
    """All findings derive from the supplied bytes, never from fixture labels."""
    findings = []
    if node == "inventory":
        return {
            "files": [
                {
                    "path": p,
                    "bytes": len(t.encode()),
                    "sha256": digest(t.encode()),
                    "kind": PurePosixPath(p).suffix or "text",
                }
                for p, t in files.items()
            ],
            "total_bytes": sum(len(t.encode()) for t in files.values()),
            "findings": [],
        }
    if node == "syntax":
        checked = []
        for path, text in files.items():
            if cancelled.is_set():
                raise InterruptedError("cancelled")
            suffix = PurePosixPath(path).suffix.lower()
            if suffix not in {".py", ".json", ".toml"}:
                continue
            try:
                if suffix == ".py":
                    ast.parse(text, filename=path)
                elif suffix == ".json":
                    strict_json(text)
                else:
                    tomllib.loads(text)
                checked.append({"path": path, "valid": True})
            except (SyntaxError, ValueError, RecursionError) as exc:
                findings.append(
                    finding("invalid_syntax", path, str(exc)[:240], line=getattr(exc, "lineno", None))
                )
                checked.append({"path": path, "valid": False})
        return {"checked": checked, "findings": findings}
    if node == "tables":
        return analyze_tables(files, cancelled)
    if node == "dependencies":
        workflows, graph_findings = {}, []
        for path, text in files.items():
            if PurePosixPath(path).name != "workflow.json":
                continue
            jobs = {}
            try:
                value = strict_json(text)
                entries = value.get("jobs") if isinstance(value, dict) else None
                if not isinstance(entries, list) or len(entries) > 256:
                    raise ValueError("workflow.json requires at most 256 jobs")
                for entry in entries:
                    if (
                        not isinstance(entry, dict)
                        or not isinstance(entry.get("id"), str)
                        or not entry["id"].strip()
                        or not isinstance(entry.get("depends_on", []), list)
                        or len(entry.get("depends_on", [])) > 256
                        or any(not isinstance(d, str) for d in entry.get("depends_on", []))
                        or entry["id"] in jobs
                    ):
                        raise ValueError("Invalid or duplicated job declaration")
                    jobs[entry["id"]] = entry.get("depends_on", [])
                for job, deps in jobs.items():
                    for dep in deps:
                        if dep not in jobs:
                            graph_findings.append(
                                finding("missing_dependency", path, f"{job} requires missing {dep}")
                            )
                remaining, done = dict(jobs), set()
                while remaining:
                    ready = [j for j, deps in remaining.items() if all(d in done for d in deps)]
                    if not ready:
                        graph_findings.append(
                            finding(
                                "blocked_dependency_graph",
                                path,
                                "Unresolved jobs: " + ", ".join(sorted(remaining)),
                            )
                        )
                        break
                    for j in ready:
                        done.add(j)
                        del remaining[j]
            except (ValueError, RecursionError) as exc:
                graph_findings.append(finding("invalid_workflow", path, str(exc)))
            workflows[path] = jobs
        jobs = {f"{path}::{job}": deps for path, items in workflows.items() for job, deps in items.items()}
        return {"jobs": jobs, "workflows": workflows, "findings": graph_findings, "job_count": len(jobs)}
    if node == "integrity":
        checks = []
        text = files.get("release-manifest.json")
        if text is not None:
            try:
                declared = strict_json(text)
                if not isinstance(declared, dict) or len(declared) > MAX_FILES:
                    raise ValueError("Expected an object mapping relative paths to SHA-256")
                for path, expected in declared.items():
                    if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
                        raise ValueError("Manifest contains invalid SHA-256")
                    actual = digest(files[path].encode()) if path in files else None
                    match = expected == actual
                    checks.append({"path": path, "expected": expected, "actual": actual, "match": match})
                    if not match:
                        findings.append(
                            finding(
                                "digest_mismatch" if actual else "missing_file",
                                path,
                                "Declared release bytes do not match supplied file",
                                expected=expected,
                                actual=actual,
                            )
                        )
                for path in files:
                    if path != "release-manifest.json" and path not in declared:
                        findings.append(
                            finding(
                                "unlisted_file",
                                path,
                                "File is absent from the declared release manifest",
                                "warning",
                            )
                        )
            except (ValueError, RecursionError) as exc:
                findings.append(finding("invalid_manifest", "release-manifest.json", str(exc)))
        return {"checks": checks, "manifest_present": text is not None, "findings": findings}
    if node == "normalize":
        outputs = {}
        for path, table in prior["tables"]["tables"].items():
            stream = io.StringIO(newline="")
            writer = csv.DictWriter(stream, fieldnames=table["headers"], lineterminator="\n")
            writer.writeheader()
            writer.writerows(r["values"] for r in table["accepted"])
            outputs[path] = {
                "content": stream.getvalue(),
                "accepted_rows": len(table["accepted"]),
                "rejected_rows": len(table["rejected"]),
                "rejected": table["rejected"],
            }
        return {"outputs": outputs, "findings": []}
    if node == "manifest":
        return {
            "algorithm": "sha256",
            "files": {p: digest(t.encode()) for p, t in files.items()},
            "findings": [],
        }
    if node == "report":
        for value in prior.values():
            findings.extend(value.get("findings", []))
        return {
            "file_count": len(files),
            "findings": findings,
            "disposition": "attention_required" if findings else "checks_passed",
            "checks_performed": sorted(prior),
            "originals_changed": False,
            "model_calls": 0,
            "controller": "registered dependency policy / native reflexmesh",
            "table_policy": "First structurally valid ID wins; later duplicates are rejected. References resolve to the same directory first, otherwise a unique table alias. Rejection propagates through references. Missing or ambiguous targets are explicit findings.",
            "scope": "Static source/config syntax, declared workflow graph, CSV shape/IDs/available foreign keys and declared SHA-256; uploaded code is never executed.",
        }
    if node == "verify":
        inventory = {f["path"]: f for f in prior["inventory"]["files"]}
        checks = [
            {
                "name": "input_bytes_unchanged",
                "passed": set(inventory) == set(files)
                and all(inventory[p]["sha256"] == digest(t.encode()) for p, t in files.items()),
            },
            {
                "name": "manifest_matches_inputs",
                "passed": prior["manifest"]["files"] == {p: digest(t.encode()) for p, t in files.items()},
            },
            {"name": "report_covers_inputs", "passed": prior["report"]["file_count"] == len(files)},
        ]
        for path, output in prior.get("normalize", {}).get("outputs", {}).items():
            source_headers, source_rows = read_table(files[path])
            output_headers, accepted = read_table(output["content"])
            rejected = output["rejected"]
            accounted = len(accepted) + len(rejected) == len(source_rows)
            selected = {r["record"] for r in rejected}
            expected = [row["values"] for row in source_rows if row["record"] not in selected]
            authentic_rejections = len(selected) == len(rejected) and all(
                1 <= r["record"] <= len(source_rows)
                and all(
                    r[k] == source_rows[r["record"] - 1][k]
                    for k in ("values", "extra_values", "line", "end_line")
                )
                for r in rejected
            )
            checks.append(
                {
                    "name": "row_conservation:" + path,
                    "passed": accounted
                    and authentic_rejections
                    and source_headers == output_headers
                    and output["accepted_rows"] == len(accepted)
                    and output["rejected_rows"] == len(rejected)
                    and all(not r["extra_values"] for r in accepted)
                    and [r["values"] for r in accepted] == expected,
                }
            )
        return {"checks": checks, "passed": all(c["passed"] for c in checks), "findings": []}
    raise ValueError("Unknown registered analyzer")


class ReadyPolicy:
    def predict(self, observation):
        return Decision(
            "verified-operation-fsm",
            observation.admissible[0].action_id,
            reason="prerequisites_verified; registered_read_transform_verify",
        )


def execute_operation(
    root: Path, task: str, supplied: list[dict], *, cancel=None, on_event=None, concurrency=3
):
    if task not in TASKS or concurrency not in {1, 3}:
        raise ValueError("Unknown operation or concurrency")
    inputs = validate_files(supplied)
    cancelled = cancel or threading.Event()
    started = time.perf_counter()
    (root / "input").mkdir(parents=True, exist_ok=False)
    (root / "output").mkdir()
    for item in inputs:
        target = root / "input" / item["path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(item["content"].encode())
    nodes, artifacts, events = graph(task), {}, []
    lock = threading.RLock()

    def emit(value):
        with lock:
            event = {
                **value,
                "sequence": len(events) + 1,
                "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
            }
            events.append(event)
            if on_event:
                on_event(event)

    # Decode exact bytes so CRLF inputs retain their original hashes.
    def file_texts():
        return {item["path"]: (root / "input" / item["path"]).read_bytes().decode("utf8") for item in inputs}

    def fingerprint(resource):
        if resource == "bundle:input":
            return digest(encoded({p: digest(t.encode()) for p, t in file_texts().items()}))
        path = root / resource.removeprefix("file:")
        return "sha256:" + digest(path.read_bytes()) if path.exists() else "absent"

    capabilities = tuple("operation." + n["id"] for n in nodes)
    with Runtime(root, capabilities) as runtime:
        controller = Controller(runtime, ReadyPolicy(), max_effects=concurrency)
        controller.subscribe(emit)
        for node in nodes:
            name, output = node["id"], node["output"]
            # The verifier reads predecessors too; all are registered read leases.
            dependencies = node["depends_on"]
            if name == "verify":
                dependencies = [n["id"] for n in nodes if n["id"] != "verify"]

            def resources(_args, output=output, dependencies=tuple(dependencies)):
                return {
                    "bundle:input": "read",
                    **{"file:output/" + d + ".json": "read" for d in dependencies},
                    "file:" + output: "write",
                }

            def validate(args):
                if args != {}:
                    raise ValueError("This registered analyzer accepts no executable arguments")
                return {}

            def effect(_args, stop, name=name, output=output):
                if stop.is_set() or cancelled.is_set():
                    return EffectReceipt("cancelled_verified", {"dispatched": False})
                before = time.perf_counter()
                emit({"kind": "tool_started", "node": name})
                with lock:
                    prior = json.loads(json.dumps(artifacts))
                value = analyze(name, file_texts(), prior, cancelled)
                if stop.is_set() or cancelled.is_set():
                    return EffectReceipt("cancelled_verified", {"dispatched": True, "output_written": False})
                raw = encoded(value)
                if len(raw) > 4_194_304:
                    raise ValueError("Analyzer output exceeds 4 MiB")
                (root / output).write_bytes(raw)
                with lock:
                    artifacts[name] = value
                evidence = {
                    "path": output,
                    "bytes": len(raw),
                    "sha256": digest((root / output).read_bytes()),
                    "duration_ms": round((time.perf_counter() - before) * 1000, 3),
                    "findings": len(value.get("findings", [])),
                }
                emit({"kind": "tool_finished", "node": name, "evidence": evidence})
                return EffectReceipt("completed_verified", evidence, ("file:" + output,))

            runtime.register(
                ToolSpec(
                    "operation." + name,
                    ("operation." + name,),
                    validate,
                    resources,
                    effect,
                    fingerprint,
                    allow_write=True,
                )
            )

            def observe(_runtime, event, history, name=name):
                candidate = runtime.candidate("operation." + name, {}, action_id=name)
                return Observation(
                    event.event_id,
                    name,
                    sum(candidate.resource_versions.values()),
                    event.kind,
                    {"goal": name},
                    (candidate,),
                    capabilities,
                    deadline_remaining_ms=45000,
                )

            def verify(_runtime, name=name, output=output):
                path = root / output
                if not path.exists():
                    return False
                value = strict_json(path.read_text(encoding="utf8"))
                if not isinstance(value, dict) or not isinstance(value.get("findings"), list):
                    return False
                return name != "verify" or value.get("passed") is True

            controller.submit(
                Goal(name, observe, verify, tuple(dependencies), max_steps=1, timeout_seconds=45)
            )

        async def run():
            job = asyncio.create_task(controller.run(until_idle=True))
            while not job.done():
                if cancelled.is_set():
                    controller.publish(Event("shutdown"))
                    break
                await asyncio.sleep(0.01)
            return await job

        states = asyncio.run(run())
        for node in nodes:
            goal = controller.goals[node["id"]]
            node.update(state=states[node["id"]], error=goal.error, history=goal.history)
        success = all(s == "succeeded" for s in states.values())
        report = artifacts.get("report", {})
        return {
            "schema_version": 1,
            "task": task,
            "status": "cancelled" if cancelled.is_set() else "succeeded" if success else "failed",
            "disposition": report.get("disposition", "incomplete")
            if success and not cancelled.is_set()
            else "incomplete",
            "nodes": nodes,
            "events": events,
            "inputs": inputs,
            "artifacts": artifacts,
            "findings": report.get("findings", []),
            "metrics": {
                "wall_ms": round((time.perf_counter() - started) * 1000, 3),
                "files": len(inputs),
                "verified_nodes": sum(s == "succeeded" for s in states.values()),
                "model_calls": 0,
                "native_receipts": sum(sum(h["kind"] == "effect" for h in n["history"]) for n in nodes),
                "journal_sequence": runtime.snapshot()["journal_sequence"],
                "concurrency": concurrency,
            },
            "engine": f"reflexmesh {engine_version} native authority",
            "policy": "verified-operation-fsm",
            "input_sha256": digest(encoded(inputs)),
            "scope": report.get("scope", ""),
        }
