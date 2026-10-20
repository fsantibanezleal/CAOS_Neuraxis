"""Plants for the reliability-audit feature (RA): one planted defect per requirement of ``docs/design/features/reliability-audit``
that has a Python gate. The other five requirements are web gates (``frontend/src/adversarial/reliability-audit.test.ts``).

RA-001 to RA-003 feed hostile uploads to the real analyzers through the native controller (small inputs, about a second a run).
RA-007 races real requests against one run through the in-process ASGI application. RA-008 drives the real installer with a
recorder in place of the system commands and the symlink switch (the switch is POSIX-only); RA-009 plants a source byte in a
throwaway copy of the recorded operation corpus. The native runtime and the web stack are pinned in
``requirements-operations.txt``, which the CI step installs."""
from __future__ import annotations

import hashlib
import importlib.util
import io
import json
import subprocess
import sys
import tarfile
import time
import types
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pytest
from planting import ROOT, guard

pytest.importorskip("reflexmesh")  # a precondition of the documented setup (requirements-operations.txt), not a bake
pytest.importorskip("fastapi")

from fastapi.testclient import TestClient

HEADERS = {"X-Neuraxis-Client": "operations-v1"}
COMMIT = "a" * 40


@pytest.fixture(autouse=True)
def _import_root(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT))


def execute(tmp_path: Path, files: dict[str, str]) -> dict:
    from app.services.operations import execute_operation

    result = execute_operation(tmp_path, "release", [{"path": p, "content": t} for p, t in files.items()])
    assert result["status"] == "succeeded", [(n["id"], n.get("error")) for n in result["nodes"]]
    assert result["artifacts"]["verify"]["passed"], "the valid checks still run and verify"
    return result


def test_adversarial_a_malformed_csv_exports_rejections_without_aborting(tmp_path: Path) -> None:
    source = 'id,name\n1,"A\nB"\n2,C,extra\n\n3,\n4,D\n'  # a quoted newline, an extra field, a blank line, a short row
    result = execute(tmp_path, {"data.csv": source, "settings.json": '{"enabled": true}'})
    output = result["artifacts"]["normalize"]["outputs"]["data.csv"]
    assert output["content"] == 'id,name\n1,"A\nB"\n4,D\n', "the valid rows, one with a multiline field, are kept"
    assert [r["line"] for r in output["rejected"]] == [4, 6], "the physical source lines, counted past the quoted newline"
    assert [r["record"] for r in output["rejected"]] == [2, 3]
    assert output["rejected"][0]["extra_values"] == ["extra"], "the extra value is exported, not dropped"
    assert [f["line"] for f in result["findings"]] == [4, 6]
    assert result["artifacts"]["syntax"], "the syntax check of the valid file ran"


def test_adversarial_rejection_propagates_to_a_fixed_point(tmp_path: Path) -> None:
    result = execute(
        tmp_path,
        {
            "customers.csv": "id,name\nC1,\nC2,Valid\n",  # C1 is rejected: it has no name
            "orders.csv": "id,customer_id\nO1,C1\nO2,C2\n",  # O1 references the rejected parent
            "payments.csv": "id,order_id\nP1,O1\nP2,O2\n",  # P1 references O1, rejected in turn: two tables away
            "b/customers.csv": "id,name\nC1,Valid\n",  # the same ids in another namespace
            "b/orders.csv": "id,customer_id\nO1,C1\n",
        },
    )
    outputs = result["artifacts"]["normalize"]["outputs"]
    assert outputs["orders.csv"]["content"] == "id,customer_id\nO2,C2\n"
    assert outputs["payments.csv"]["content"] == "id,order_id\nP2,O2\n", "the rejection reached the table two steps away"
    assert outputs["b/orders.csv"]["content"] == "id,customer_id\nO1,C1\n", "the other namespace kept its row: no collision"
    assert [f["code"] for f in result["findings"]].count("unknown_reference") == 2


def test_adversarial_non_finite_values_and_shared_job_names(tmp_path: Path) -> None:
    from app.services.operations import strict_json

    for raw in ('{"x":1e999}', '{"x":-1e999}', '{"x":NaN}'):
        with pytest.raises(ValueError):
            strict_json(raw)
    overflow = execute(tmp_path / "overflow", {"settings.json": '{"limit": 1e999}'})
    assert [f["code"] for f in overflow["findings"]] == ["invalid_syntax"], overflow["findings"]
    assert overflow["findings"][0]["path"] == "settings.json"
    workflow = '{"jobs":[{"id":"build"},{"id":"test","depends_on":["build"]}]}'
    apart = execute(tmp_path / "apart", {"a/workflow.json": workflow, "b/workflow.json": workflow})
    assert apart["findings"] == [], "two independent workflows may share a job name"
    assert apart["artifacts"]["dependencies"]["job_count"] == 4, "the namespaces stay apart: four jobs, not two"


def test_adversarial_concurrent_list_export_delete_and_retention(tmp_path: Path) -> None:
    from app.operations_api import create_app

    with TestClient(create_app(tmp_path / "runs", host="testserver")) as client:
        def session() -> dict:
            token = client.post("/operations-api/session", headers=HEADERS).json()["token"]
            return {**HEADERS, "Authorization": "Bearer " + token}

        owner, other = session(), session()
        started = client.post("/operations-api/runs", headers=owner, json={"task": "source", "files": [{"path": "a.py", "content": "x=1\n"}]})
        assert started.status_code == 200, started.text
        key = started.json()["id"]
        deadline = time.monotonic() + 30
        while client.get(f"/operations-api/runs/{key}", headers=owner).json()["status"] not in {"succeeded", "failed", "cancelled"}:
            assert time.monotonic() < deadline, "the run did not finish"
            time.sleep(0.05)
        manager = client.app.state.operations
        manager.runs[key]["created"] -= 4000  # past retention: every request's sweep now races the delete
        url = f"/operations-api/runs/{key}"

        def request(kind: str) -> tuple[str, int]:
            who = other if kind.startswith("other") else owner
            if kind.endswith("delete"):
                return kind, client.delete(url, headers=who).status_code
            if kind.endswith("export"):
                return kind, client.get(url + "/export", headers=who).status_code
            if kind.endswith("cancel"):
                return kind, client.post(url + "/cancel", headers=who).status_code
            if kind == "sweep":
                manager.collect()
                return kind, 200
            return kind, client.get("/operations-api/runs", headers=who).status_code

        kinds = ["delete", "list", "export", "sweep", "other-delete", "other-export", "other-cancel", "delete", "list", "export",
                 "sweep", "other-delete", "delete", "export", "list", "other-cancel"] * 3
        with ThreadPoolExecutor(max_workers=12) as pool:
            outcomes = list(pool.map(request, kinds))
    by_kind: dict[str, set[int]] = {}
    for kind, status in outcomes:
        by_kind.setdefault(kind, set()).add(status)
    assert all(s < 500 for statuses in by_kind.values() for s in statuses), by_kind
    assert by_kind["list"] <= {200}, by_kind
    assert by_kind["export"] <= {200, 404} and by_kind["delete"] <= {200, 404}, by_kind
    assert sum(1 for k, s in outcomes if k == "delete" and s == 200) <= 1, "a run is deleted once"
    for kind in ("other-delete", "other-export", "other-cancel"):
        assert by_kind[kind] == {404}, f"{kind}: another owner reached the run: {by_kind[kind]}"
    assert key not in manager.runs and not (manager.root / key).exists(), "a stale run survived the delete and the sweep"


def bundle(path: Path, files) -> str:
    with tarfile.open(path, "w:gz") as archive:
        for name in sorted(files):
            raw = b"a" * 40 if name == "commit.txt" else b"new content"
            info = tarfile.TarInfo(name)
            info.size = len(raw)
            archive.addfile(info, io.BytesIO(raw))
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prepare_installer(tmp_path: Path, monkeypatch, *, pip_fails: bool, commit: str = COMMIT):
    spec = importlib.util.spec_from_file_location("install_operations_under_plant", ROOT / "deploy" / "install_operations.py")
    installer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(installer)
    base = tmp_path / "service"
    previous = base / "releases" / "previous"
    (previous / ".venv").mkdir(parents=True)
    (previous / ".venv" / "identity").write_text("original dependencies")
    current = base / "current"
    try:
        current.symlink_to(previous, target_is_directory=True)
    except OSError:  # a Windows account without the symlink privilege: the recorder below stands in for the switch
        current = None
    unit, nginx = tmp_path / "unit", tmp_path / "nginx"
    unit.write_text("old unit")
    nginx.write_text("old nginx")
    calls: list[tuple] = []
    switches: list[tuple] = []

    def run(*args):
        calls.append(args)
        if pip_fails and "pip" in args and "install" in args:
            raise subprocess.CalledProcessError(1, args)

    monkeypatch.setattr(installer, "BASE", base)
    monkeypatch.setattr(installer, "SERVICE_UNIT", unit)
    monkeypatch.setattr(installer, "NGINX_CONFIG", nginx)
    monkeypatch.setattr(installer, "run", run)
    monkeypatch.setattr(installer, "switch", lambda path, target: switches.append((path, target)))
    monkeypatch.setitem(sys.modules, "pwd", types.SimpleNamespace(getpwnam=lambda name: object()))
    monkeypatch.setattr(installer.subprocess, "check_output", lambda *a, **kw: "reflexmesh==0.1.0\n")
    config = {"tasks": [1, 2, 3], "commit": commit}
    monkeypatch.setattr(installer.urllib.request, "urlopen", lambda *a, **kw: io.BytesIO(json.dumps(config).encode()))
    archive = tmp_path / "bundle.tar.gz"
    digest = bundle(archive, installer.FILES)
    return installer, archive, digest, {"base": base, "previous": previous, "current": current, "unit": unit, "nginx": nginx,
                                         "calls": calls, "switches": switches}


def test_adversarial_a_failed_dependency_install_leaves_the_active_release(tmp_path: Path, monkeypatch) -> None:
    # the clean control: the same flow with a healthy install switches to the new release, in its own environment
    installer, archive, digest, state = prepare_installer(tmp_path / "healthy", monkeypatch, pip_fails=False)
    result = installer.install(archive, digest)
    assert [target for _, target in state["switches"]] == [Path(result["release"])]
    venv_call = next(c for c in state["calls"] if c[:3] == ("python3", "-m", "venv"))
    assert Path(venv_call[3]).parent.parent == state["base"] / "releases", "the new release has an environment of its own"
    monkeypatch.undo()
    # the plant: the dependency install of the new release fails
    installer, archive, digest, state = prepare_installer(tmp_path / "failing", monkeypatch, pip_fails=True)
    with pytest.raises(subprocess.CalledProcessError):
        installer.install(archive, digest)
    assert state["switches"] == [], "the active release was switched although its dependencies did not install"
    assert not any(c and c[0] in {"systemctl", "nginx"} for c in state["calls"]), "a service command ran after the failure"
    assert state["unit"].read_text() == "old unit" and state["nginx"].read_text() == "old nginx"
    previous = state["previous"]
    assert (previous / ".venv" / "identity").read_text() == "original dependencies", "the rollback target's interpreter is untouched"
    if state["current"] is not None:
        assert state["current"].resolve() == previous.resolve(), "the active release still points at the rollback target"


def test_adversarial_a_changed_operation_source_fails_the_operation_check(operation_corpus: Path) -> None:
    repo = operation_corpus
    clean = guard(repo, "check_operations.py")
    assert clean.returncode == 0 and '"verified": true' in clean.stdout, clean.stdout + clean.stderr
    source = repo / "app" / "services" / "operations.py"
    raw = source.read_bytes()
    source.write_bytes(raw.replace(b"MAX_FILES, MAX_BYTES", b"MAX_FILES , MAX_BYTES", 1))  # one source byte of the studied code
    assert source.read_bytes() != raw, "the plant changed nothing"
    r = guard(repo, "check_operations.py")
    assert r.returncode != 0 and "AssertionError: app/services/operations.py" in r.stderr, r.stdout + r.stderr
