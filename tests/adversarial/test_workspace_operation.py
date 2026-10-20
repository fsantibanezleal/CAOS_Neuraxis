"""Plants for the workspace-operation feature (WO): one planted defect per requirement of ``docs/design/features/workspace-operation``
that has a Python gate (WO-001 and WO-004). WO-002 and WO-003 are web gates (``frontend/src/adversarial/workspace-operation.test.ts``).

Both feed the hostile request or the hostile start to the real composition (``app/main.py`` over the installed engine's server):
the application is the in-process ASGI application of ``TestClient`` and binds no port; the workspace is an empty directory the
test makes, so an effect shows as a file in it."""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest
from planting import ROOT

pytest.importorskip("reflexmesh")  # a precondition of the documented setup (requirements-operations.txt), not a bake
pytest.importorskip("fastapi")

from fastapi.testclient import TestClient  # noqa: E402

TOKEN = "workspace-token-with-more-than-24-characters"
RUN = {"case_id": "C01", "method_id": "M01"}
WORKSPACE_ROUTES = (
    ("POST", "/api/workspace/run"),
    ("POST", "/api/workspace/preview"),
    ("POST", "/api/workspace/reconcile"),
    ("POST", "/api/workspace/cancel/anything"),
    ("GET", "/api/workspace/recovery"),
    ("GET", "/api/workspace/events"),
    ("POST", "/api/run"),
    ("POST", "/api/replay"),
)


@pytest.fixture(autouse=True)
def _import_root(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT))


def main_module():
    spec = importlib.util.spec_from_file_location("neuraxis_main_under_plant", ROOT / "app" / "main.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def listing(root: Path) -> list[str]:
    return sorted(p.relative_to(root).as_posix() for p in root.rglob("*"))


def test_adversarial_a_workspace_request_without_the_token_is_refused(monkeypatch, tmp_path: Path) -> None:
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", TOKEN)
    monkeypatch.setenv("NEURAXIS_WORKSPACE", str(workspace))
    monkeypatch.setenv("NEURAXIS_OPERATIONS_ROOT", str(tmp_path / "ops"))
    monkeypatch.setenv("NEURAXIS_CHECKPOINTS", str(tmp_path / "checkpoints"))
    with TestClient(main_module().create_app(), base_url="http://127.0.0.1:8151") as client:
        # the control: the right token reaches the workspace API, which is enabled for the directory
        right = client.get("/api/workspace/config", headers={"Authorization": "Bearer " + TOKEN})
        assert right.status_code == 200 and right.json().get("enabled") is True, right.text
        files_before, runs_before = listing(workspace), dict(client.app.state.manager._runs)
        for headers in ({}, {"Authorization": "Bearer wrong-token"}, {"Authorization": "Bearer " + TOKEN[:-1]},
                        {"Authorization": TOKEN}, {"Authorization": "Basic " + TOKEN}):
            for method, path in WORKSPACE_ROUTES:
                r = client.request(method, path, headers=headers, json=RUN if method == "POST" else None)
                assert r.status_code == 401, (method, path, headers, r.status_code)
        assert listing(workspace) == files_before, "a refused request left a file in the workspace"
        assert client.app.state.manager._runs == runs_before, "a refused request started an engine run"


def test_adversarial_startup_without_explicit_auth_is_refused(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("NEURAXIS_OPERATIONS_ROOT", str(tmp_path / "ops"))
    monkeypatch.setenv("NEURAXIS_CHECKPOINTS", str(tmp_path / "checkpoints"))
    module = main_module()
    # no authentication setting at all
    monkeypatch.delenv("REFLEXMESH_LOCAL_TOKEN", raising=False)
    with pytest.raises(RuntimeError, match="REFLEXMESH_LOCAL_TOKEN"):
        module.create_app()
    # an empty authentication setting
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", "")
    with pytest.raises(RuntimeError, match="REFLEXMESH_LOCAL_TOKEN"):
        module.create_app()
    # a token too short to stand for authentication is refused by the engine
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", "short")
    with pytest.raises(ValueError, match="24 characters"):
        module.create_app()
    assert not (tmp_path / "ops").exists(), "a refused start prepared the operations service"
    # the control: an explicit token of the required length starts the application
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", TOKEN)
    assert module.create_app() is not None
