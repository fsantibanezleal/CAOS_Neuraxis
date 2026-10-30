import io
import time
import zipfile

import pytest
from fastapi.testclient import TestClient

from app.operations_api import create_app

HEADERS = {"X-Neuraxis-Client": "operations-v1"}


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(tmp_path, host="testserver")) as value:
        yield value


def session(client):
    token = client.post("/operations-api/session", headers=HEADERS).json()["token"]
    return {**HEADERS, "Authorization": "Bearer " + token}


def test_session_isolation_export_and_deletion(client):
    owner, other = session(client), session(client)
    r = client.post(
        "/operations-api/runs",
        headers=owner,
        json={"task": "source", "files": [{"path": "settings.json", "content": '{"name":"uploaded"}'}]},
    )
    assert r.status_code == 200, r.text
    key = r.json()["id"]
    assert client.get(f"/operations-api/runs/{key}", headers=other).status_code == 404
    assert client.get(f"/operations-api/runs/{key}/export", headers=other).status_code == 404
    assert client.post(f"/operations-api/runs/{key}/cancel", headers=other).status_code == 404
    for _ in range(200):
        run = client.get(f"/operations-api/runs/{key}", headers=owner).json()
        if run["status"] in {"succeeded", "failed", "cancelled"}:
            break
        time.sleep(0.05)
    assert run["status"] == "succeeded", run
    archive = client.get(f"/operations-api/runs/{key}/export", headers=owner)
    with zipfile.ZipFile(io.BytesIO(archive.content)) as z:
        assert z.read("input/settings.json") == b'{"name":"uploaded"}'
        assert "output/verify.json" in z.namelist()
    assert client.delete(f"/operations-api/runs/{key}", headers=owner).status_code == 200
    assert client.get(f"/operations-api/runs/{key}", headers=owner).status_code == 404


def test_adversarial_boundary_and_invalid_inputs(client):
    assert client.post("/operations-api/session").status_code == 403
    assert (
        client.post(
            "/operations-api/session", headers={**HEADERS, "Origin": "https://attacker.example"}
        ).status_code
        == 403
    )
    assert client.post("/operations-api/runs", headers=HEADERS, json={}).status_code == 401
    owner = session(client)
    for value in (
        {"task": "shell"},
        {"task": "source", "command": "anything"},
        {"files": [{"path": "../outside", "content": "x"}]},
        {"files": [{"path": "large.txt", "content": "x" * 131073}]},
    ):
        assert client.post("/operations-api/runs", headers=owner, json=value).status_code == 422
    assert (
        client.post(
            "/operations-api/runs", headers=owner, content='{"task":"source","task":"release"}'
        ).status_code
        == 422
    )
    assert client.post("/operations-api/runs", headers=owner, content="x" * 1600001).status_code == 413
    assert not client.app.state.operations.runs


def test_capacity_and_cancel(client):
    owner = session(client)
    start = client.post("/operations-api/runs", headers=owner, json={}).json()
    assert client.post("/operations-api/runs", headers=owner, json={}).status_code == 429
    assert client.delete("/operations-api/runs/" + start["id"], headers=owner).status_code == 409
    assert client.post("/operations-api/runs/" + start["id"] + "/cancel", headers=owner).status_code == 200


def test_expired_orphan_directory_removed(client):
    import os

    manager = client.app.state.operations
    orphan = manager.root / ("a" * 32)
    orphan.mkdir()
    (orphan / "private.txt").write_text("private upload")
    os.utime(orphan, (time.time() - 4000, time.time() - 4000))
    manager.collect()
    assert not orphan.exists()


def completed(client, owner):
    response = client.post(
        "/operations-api/runs",
        headers=owner,
        json={"task": "source", "files": [{"path": "a.py", "content": "x=1\n"}]},
    )
    assert response.status_code == 200, response.text
    key = response.json()["id"]
    for _ in range(200):
        run = client.get(f"/operations-api/runs/{key}", headers=owner).json()
        if run["status"] not in {"queued", "running", "cancelling"}:
            assert run["status"] == "succeeded"
            return key
        time.sleep(0.025)
    pytest.fail("Operation did not finish")


def test_owned_history_and_expiry(client):
    owner, other = session(client), session(client)
    first, second = completed(client, owner), completed(client, owner)
    history = client.get("/operations-api/runs", headers=owner).json()["runs"]
    assert [r["id"] for r in history] == [second, first]
    assert "inputs" not in history[0]
    assert history[0]["expires_at"] - history[0]["created_at"] == 3600
    assert client.get("/operations-api/runs", headers=other).json()["runs"] == []
    manager = client.app.state.operations
    manager.runs[first]["created"] -= 4000
    manager.runs[second]["created"] -= 4000
    manager.sessions[owner["Authorization"].removeprefix("Bearer ")] -= 4000
    assert client.get("/operations-api/runs", headers=owner).status_code == 401
    assert not manager.runs
    assert list(manager.root.iterdir()) == []


def test_concurrent_delete_is_atomic(client):
    from concurrent.futures import ThreadPoolExecutor

    owner = session(client)
    key = completed(client, owner)
    with ThreadPoolExecutor(max_workers=6) as workers:
        statuses = list(
            workers.map(
                lambda _: client.delete(f"/operations-api/runs/{key}", headers=owner).status_code, range(6)
            )
        )
    assert sorted(statuses) == [200, 404, 404, 404, 404, 404]


@pytest.mark.parametrize(
    "value", [{"task": []}, {"task": {}}, {"variant": []}, {"seed": True}, {"seed": 1.5}, {"files": None}]
)
def test_non_scalar_admission_is_a_client_error(client, value):
    assert client.post("/operations-api/runs", headers=session(client), json=value).status_code == 422
    assert not client.app.state.operations.runs


def test_config_reports_installed_engine_version(client):
    from reflexmesh import __version__

    assert client.get("/operations-api/config").json()["engine"] == f"reflexmesh {__version__}"
