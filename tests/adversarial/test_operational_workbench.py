"""Plants for the operational-workbench feature (OW): one planted defect per requirement of
``docs/design/features/operational-workbench`` that has a Python gate. The other seven requirements are web gates
(``frontend/src/adversarial/operational-workbench.test.ts``).

The behaviour rows (OW-002 to OW-005, OW-010, OW-014, OW-015) feed a hostile input to the real service, API, installer or
composition and assert the refusal and the absence of the effect; the corpus row (OW-007) and the metadata row (OW-016) plant
the defect in a throwaway copy of the committed files and run the guard on it. Uploads are one or two small files, so a run of
the native controller takes about a second. A service a test starts is the in-process ASGI application of ``TestClient``: it
binds no port. The native runtime and the web stack are pinned in ``requirements-operations.txt``, which the CI step installs."""
from __future__ import annotations

import hashlib
import importlib.util
import io
import json
import sys
import tarfile
import threading
import time
import types
from pathlib import Path

import pytest
from planting import ROOT, guard

pytest.importorskip("reflexmesh")  # a precondition of the documented setup (requirements-operations.txt), not a bake
pytest.importorskip("fastapi")

from fastapi.testclient import TestClient  # noqa: E402

HEADERS = {"X-Neuraxis-Client": "operations-v1"}
TOKEN = "adversarial-token-with-more-than-24-characters"
TERMINAL = {"succeeded", "failed", "cancelled"}
SMALL = {"task": "source", "files": [{"path": "a.py", "content": "x=1\n"}]}


@pytest.fixture(autouse=True)
def _import_root(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT))


def service():
    from app.services import operations

    return operations


def load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def session(client) -> dict:
    token = client.post("/operations-api/session", headers=HEADERS).json()["token"]
    return {**HEADERS, "Authorization": "Bearer " + token}


@pytest.fixture
def client(tmp_path):
    from app.operations_api import create_app

    with TestClient(create_app(tmp_path / "runs", host="testserver")) as value:
        yield value


def settle(client, owner, key) -> dict:
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        run = client.get(f"/operations-api/runs/{key}", headers=owner).json()
        if run["status"] in TERMINAL:
            return run
        time.sleep(0.05)
    raise AssertionError("the operation did not finish")


def wait_for_directories(root: Path, *keys: str) -> None:
    """The worker creates a run's directory on its own thread; a listing taken before that would count a refusal's effect."""
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline and not all((root / key).is_dir() for key in keys):
        time.sleep(0.01)
    assert all((root / key).is_dir() for key in keys)


def test_adversarial_a_tampered_output_fails_goal_verification(tmp_path: Path) -> None:
    ops = service()
    files = [{"path": "a.py", "content": "x=1\n"}]
    clean = ops.execute_operation(tmp_path / "clean", "source", files)
    assert clean["status"] == "succeeded" and all(n["state"] == "succeeded" for n in clean["nodes"])
    root = tmp_path / "planted"
    written: list[str] = []

    def on_event(event):
        # the output a native node wrote is replaced by wrong bytes before the goal is verified
        if event["kind"] == "tool_finished" and event["node"] == "inventory":
            (root / "output" / "inventory.json").write_bytes(b'{"findings": "tampered"}\n')
            written.append(event["evidence"]["sha256"])

    result = ops.execute_operation(root, "source", files, on_event=on_event)
    assert written, "the plant never ran"
    assert ops.digest((root / "output" / "inventory.json").read_bytes()) != written[0], "the plant changed nothing"
    states = {n["id"]: n["state"] for n in result["nodes"]}
    assert states["inventory"] != "succeeded", states
    assert result["status"] != "succeeded" and result["disposition"] == "incomplete", (result["status"], states)
    assert result["metrics"]["verified_nodes"] < len(result["nodes"])


def test_adversarial_uploaded_source_with_a_side_effect_is_never_executed(tmp_path: Path) -> None:
    ops = service()
    marker = tmp_path / "must-not-exist"
    code = {
        "writes.py": f"from pathlib import Path\r\nPath({str(marker)!r}).write_text('executed')\r\n",
        "exits.py": "raise SystemExit('import-time side effect')\n",
        "shell.py": f"import os\nos.system('echo executed > {marker.as_posix()}')\n",
    }
    files = [{"path": name, "content": text} for name, text in code.items()]
    result = ops.execute_operation(tmp_path / "run", "source", files)
    assert not marker.exists(), "an uploaded source file was executed"
    assert result["status"] == "succeeded" and result["artifacts"]["verify"]["passed"]
    manifest = result["artifacts"]["manifest"]["files"]
    for name, text in code.items():
        assert manifest[name] == ops.digest(text.encode()), f"{name} is reported as data, by the digest of its bytes"


def test_adversarial_invalid_requests_leave_no_effect(client) -> None:
    manager = client.app.state.operations
    root = manager.root
    owner = session(client)
    # a traversal path
    traversal = {"task": "source", "files": [{"path": "../outside", "content": "x"}]}
    assert client.post("/operations-api/runs", headers=owner, json=traversal).status_code == 422
    # an oversized payload, past the request limit and past the file limit
    assert client.post("/operations-api/runs", headers=owner, content="x" * 1_600_001).status_code == 413
    large = {"task": "source", "files": [{"path": "large.txt", "content": "x" * 131_073}]}
    assert client.post("/operations-api/runs", headers=owner, json=large).status_code == 422
    # an expired session
    expired = session(client)
    manager.sessions[expired["Authorization"].removeprefix("Bearer ")] -= 4000
    assert client.post("/operations-api/runs", headers=expired, json=SMALL).status_code == 401
    assert not manager.runs and list(root.iterdir()) == [], "a refused request left a run or a file behind"
    # a request past capacity: the owner has one active run, so a second is refused and adds no directory
    first = client.post("/operations-api/runs", headers=owner, json=SMALL)
    assert first.status_code == 200, first.text
    wait_for_directories(root, first.json()["id"])
    after_first = sorted(p.name for p in root.iterdir())
    assert client.post("/operations-api/runs", headers=owner, json=SMALL).status_code == 429
    assert sorted(p.name for p in root.iterdir()) == after_first, "the refused request added a directory"
    assert len(manager.runs) == 1
    client.post(f"/operations-api/runs/{first.json()['id']}/cancel", headers=owner)


def test_adversarial_cancel_after_a_write_keeps_the_file_and_says_cancelled(tmp_path: Path) -> None:
    ops = service()
    stop = threading.Event()
    written: list[dict] = []

    def on_event(event):
        if event["kind"] == "tool_finished":
            written.append(event["evidence"])
            stop.set()  # cancelled after a node wrote its file

    result = ops.execute_operation(tmp_path, "release", ops.fixture("release", "clean", 3), cancel=stop, on_event=on_event)
    assert written, "the plant never ran"
    kept = tmp_path / written[0]["path"]
    assert kept.is_file() and ops.digest(kept.read_bytes()) == written[0]["sha256"], "the observed file stays, byte for byte"
    assert result["status"] == "cancelled"
    assert result["disposition"] == "incomplete"
    assert result["metrics"]["native_receipts"] >= 1
    assert result["metrics"]["verified_nodes"] < len(result["nodes"])


def test_adversarial_a_changed_operation_run_fails_the_operation_check(operation_corpus: Path) -> None:
    repo = operation_corpus
    clean = guard(repo, "check_operations.py")
    assert clean.returncode == 0 and '"verified": true' in clean.stdout, clean.stdout + clean.stderr
    index = json.loads((repo / "data/operations/index.json").read_bytes())
    row = next(r for r in index["runs"] if r["variant"] == "compound")
    path = repo / "data/operations" / row["path"]
    run = json.loads(path.read_bytes())
    assert run["findings"], "the recorded compound run has findings to change"
    run["findings"][0]["message"] += " (planted)"
    path.write_bytes(json.dumps(run, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")  # the index digest is kept
    assert hashlib.sha256(path.read_bytes()).hexdigest() != row["sha256"], "the plant changed nothing"
    r = guard(repo, "check_operations.py")
    assert r.returncode != 0 and "AssertionError" in r.stderr and 'row["sha256"]' in r.stderr, r.stdout + r.stderr


def test_adversarial_requests_past_the_service_bounds_are_refused(client) -> None:
    manager = client.app.state.operations
    root = manager.root
    first, second, third = session(client), session(client), session(client)
    # a third concurrent run: capacity is two, one active run per owner
    one = client.post("/operations-api/runs", headers=first, json=SMALL)
    two = client.post("/operations-api/runs", headers=second, json=SMALL)
    assert one.status_code == 200 and two.status_code == 200, (one.text, two.text)
    wait_for_directories(root, one.json()["id"], two.json()["id"])
    before = sorted(p.name for p in root.iterdir())
    refused = client.post("/operations-api/runs", headers=third, json=SMALL)
    assert refused.status_code == 429 and "capacity" in refused.json()["detail"], refused.text
    assert sorted(p.name for p in root.iterdir()) == before, "the third run created a directory"
    for key, owner in ((one.json()["id"], first), (two.json()["id"], second)):
        client.post(f"/operations-api/runs/{key}/cancel", headers=owner)
        settle(client, owner, key)
    # a retained run beyond the cap of 24: the cap is on retained runs, each with a directory on disk
    done = threading.Thread(target=lambda: None)
    done.start()
    done.join()
    for i in range(24):
        key = f"{i:032x}"
        (root / key).mkdir()
        manager.runs[key] = {"id": key, "owner": "retained", "created": time.monotonic(), "created_at": time.time(),
                             "status": "succeeded", "result": None, "cancel": threading.Event(), "thread": done}
    retained = sorted(p.name for p in root.iterdir())
    refused = client.post("/operations-api/runs", headers=third, json=SMALL)
    assert refused.status_code == 429 and "retention" in refused.json()["detail"], refused.text
    assert sorted(p.name for p in root.iterdir()) == retained, "a refused run left a directory behind"
    # a payload past the bound: the request limit and the file-count limit
    assert client.post("/operations-api/runs", headers=third, content="x" * 1_600_001).status_code == 413
    many = {"task": "source", "files": [{"path": f"f{i}.txt", "content": "x"} for i in range(257)]}
    assert client.post("/operations-api/runs", headers=third, json=many).status_code == 422
    assert sorted(p.name for p in root.iterdir()) == retained


def bundle(path: Path, members: list[tuple[str, bytes]]) -> str:
    with tarfile.open(path, "w:gz") as archive:
        for name, raw in members:
            info = tarfile.TarInfo(name)
            info.size = len(raw)
            archive.addfile(info, io.BytesIO(raw))
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_adversarial_a_bundle_with_an_undeclared_file_is_rejected_before_activation(tmp_path: Path, monkeypatch) -> None:
    installer = load("install_operations_under_plant", ROOT / "deploy" / "install_operations.py")
    declared = [(n, b"a" * 40 if n == "commit.txt" else b"source") for n in sorted(installer.FILES)]
    calls: list[tuple] = []
    base = tmp_path / "service"
    monkeypatch.setattr(installer, "BASE", base)
    monkeypatch.setattr(installer, "run", lambda *args: calls.append(args))
    monkeypatch.setitem(sys.modules, "pwd", types.SimpleNamespace(getpwnam=lambda name: object()))  # POSIX only; never reached on a rejection
    plants = {
        "an undeclared file": (declared + [("app/backdoor.py", b"print(1)")], None),
        "a traversal member": ([*declared[:-1], ("../escape.txt", b"bad")], None),
        "a wrong digest": (declared, "0" * 64),
    }
    for label, (members, forced) in plants.items():
        archive = tmp_path / (label.replace(" ", "-") + ".tar.gz")
        digest = bundle(archive, members)
        with pytest.raises(ValueError):
            installer.install(archive, forced or digest)
        assert calls == [], f"{label}: a service command ran before the bundle was rejected"
        assert not (base / "current").exists() and not (tmp_path / "escape.txt").exists(), label
        assert list((base / "releases").iterdir()) == [], f"{label}: a release directory was activated"
    # the clean control: the declared files only, under their own digest, unpack into a staging directory
    archive = tmp_path / "declared.tar.gz"
    target = tmp_path / "staging"
    target.mkdir()
    assert installer.unpack(archive, bundle(archive, declared), target) == "a" * 40


@pytest.fixture
def local_app(monkeypatch, tmp_path):
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", TOKEN)
    monkeypatch.setenv("NEURAXIS_OPERATIONS_ROOT", str(tmp_path / "ops"))
    monkeypatch.setenv("NEURAXIS_PORT", "8151")
    module = load("neuraxis_main_under_plant", ROOT / "app" / "main.py")
    with TestClient(module.create_app(), base_url="http://127.0.0.1:8151") as client:
        yield client


def test_adversarial_the_task_api_cannot_reach_workspace_authority(local_app, tmp_path: Path) -> None:
    client = local_app
    ops = tmp_path / "ops"
    task = {**HEADERS, "Authorization": "Bearer " + client.post("/operations-api/session", headers=HEADERS).json()["token"]}
    runs_before = dict(client.app.state.manager._runs)
    # a task API request that asks for workspace authority is refused, and creates no run and no file
    for plant in ({"task": "source", "workspace": "/", "command": "id"}, {"task": "source", "command": "anything"},
                  {"task": "workspace", "files": [{"path": "a.txt", "content": "x"}]}):
        assert client.post("/operations-api/runs", headers=task, json=plant).status_code == 422, plant
    assert list(ops.iterdir()) == [], "a refused task request wrote a file"
    # the task API session grants nothing on the workspace API, which still demands its own token
    for headers in ({}, {"Authorization": task["Authorization"]}, {"Authorization": "Bearer wrong"}):
        assert client.get("/api/workspace/config", headers=headers).status_code == 401, headers
        assert client.post("/api/run", json={"case_id": "C01", "method_id": "M01"}, headers=headers).status_code == 401, headers
    # the workspace routes are not reachable through the task API's prefix
    assert client.post("/operations-api/api/run", headers=task).status_code in (404, 405)
    assert client.app.state.manager._runs == runs_before, "a refused request started an engine run"
    # the control: the local token opens the workspace API
    assert client.get("/api/workspace/config", headers={"Authorization": "Bearer " + TOKEN}).status_code == 200


def test_adversarial_a_declared_engine_package_fails_the_no_engine_check(tmp_path: Path) -> None:
    source = (ROOT / "pyproject.toml").read_text(encoding="utf-8")
    copy = tmp_path / "repo"
    copy.mkdir()
    (copy / "requirements.txt").write_text((ROOT / "requirements.txt").read_text(encoding="utf-8"), encoding="utf-8")
    (copy / "pyproject.toml").write_text(source, encoding="utf-8")
    # the requirement's own gate, run with its repository root moved to the copy
    gate = load("test_application_under_plant", ROOT / "tests" / "test_application.py")
    gate.ROOT = copy
    gate.test_product_has_no_installable_engine()  # the committed metadata declares none
    # the plant: a declaration of an installable engine package in the copy of the project metadata
    (copy / "pyproject.toml").write_text('[project]\nname = "neuraxis-engine"\nversion = "1.0.0"\n\n[build-system]\n'
                                         'requires = ["setuptools"]\n\n' + source, encoding="utf-8")
    with pytest.raises(AssertionError):
        gate.test_product_has_no_installable_engine()
