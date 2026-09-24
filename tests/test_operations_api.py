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


def test_boundary_and_invalid_inputs(client):
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
