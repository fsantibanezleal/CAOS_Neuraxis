"""Producer-side tests of the operations API (catalog row operations-api): every route of ``app/operations_api.py`` is called
through FastAPI's test client and each response, success and error, validates against the response the OpenAPI document
(docs/contracts/api.openapi.json) declares for that method, path and status. The document and the app list the same nine
routes. The local engine API under /api is reflexmesh's own contract and is not part of this document."""
from __future__ import annotations

import io
import json
import time
import zipfile

import contract_schemas as cs
import pytest
from fastapi.testclient import TestClient
from openapi_spec_validator import validate

from app.operations_api import create_app

HEADERS = {"X-Neuraxis-Client": "operations-v1"}
PREFIX = "/operations-api"
TERMINAL = {"succeeded", "failed", "cancelled"}


class Recorder:
    """A test client that remembers every (path template, method, status, body) it saw."""

    def __init__(self, client: TestClient):
        self.client, self.seen = client, []

    def call(self, method: str, template: str, url: str, **kwargs):
        response = self.client.request(method, url, **kwargs)
        body = response.json() if response.headers.get("content-type", "").startswith("application/json") else None
        self.seen.append((template, method, response.status_code, body, response))
        return response


def _session(rec: Recorder) -> dict:
    token = rec.call("POST", PREFIX + "/session", PREFIX + "/session", headers=HEADERS).json()["token"]
    return {**HEADERS, "Authorization": "Bearer " + token}


def _wait(rec: Recorder, owner: dict, key: str) -> dict:
    for _ in range(400):
        run = rec.call("GET", PREFIX + "/runs/{run_id}", f"{PREFIX}/runs/{key}", headers=owner).json()
        if run["status"] in TERMINAL:
            return run
        time.sleep(0.05)
    raise AssertionError("the run did not finish")


@pytest.fixture(scope="module")
def observed(tmp_path_factory):
    root = tmp_path_factory.mktemp("operations")
    with TestClient(create_app(root, host="testserver")) as client:
        rec = Recorder(client)
        rec.call("GET", PREFIX + "/config", PREFIX + "/config")
        rec.call("GET", PREFIX + "/fixture", PREFIX + "/fixture?task=data&variant=clean&seed=3")
        rec.call("GET", PREFIX + "/fixture", PREFIX + "/fixture?task=shell")
        rec.call("GET", PREFIX + "/fixture", PREFIX + "/fixture?seed=abc")
        rec.call("POST", PREFIX + "/session", PREFIX + "/session")  # no client header: 403
        rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=HEADERS, json={})  # no session: 401
        owner, other = _session(rec), _session(rec)
        started = rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=owner,
                           json={"task": "source", "files": [{"path": "settings.json", "content": '{"name":"uploaded"}'}]})
        key = started.json()["id"]
        rec.call("DELETE", PREFIX + "/runs/{run_id}", f"{PREFIX}/runs/{key}", headers=owner)  # running: 409 (or 200 if done)
        rec.call("GET", PREFIX + "/runs/{run_id}", f"{PREFIX}/runs/{key}", headers=other)  # not the owner: 404
        rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=owner, json={"task": "shell"})  # 422
        rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=owner, content="x" * 1600001)  # 413
        done = _wait(rec, owner, key)
        rec.call("GET", PREFIX + "/runs", PREFIX + "/runs", headers=owner)
        rec.call("GET", PREFIX + "/runs/{run_id}/export", f"{PREFIX}/runs/{key}/export", headers=owner)
        rec.call("POST", PREFIX + "/runs/{run_id}/cancel", f"{PREFIX}/runs/{key}/cancel", headers=owner)
        rec.call("DELETE", PREFIX + "/runs/{run_id}", f"{PREFIX}/runs/{key}", headers=owner)
        rec.call("GET", PREFIX + "/runs/{run_id}", f"{PREFIX}/runs/{key}", headers=owner)  # deleted: 404
        # a second run, left running while the first is cancelled, shows the 429 and the cancelling snapshot
        first = rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=owner, json={}).json()["id"]
        rec.call("POST", PREFIX + "/runs", PREFIX + "/runs", headers=owner, json={})  # 429: one active run per owner
        rec.call("POST", PREFIX + "/runs/{run_id}/cancel", f"{PREFIX}/runs/{first}/cancel", headers=owner)
        _wait(rec, owner, first)
        rec.done = done
        yield rec


def test_the_openapi_document_is_valid_and_lists_the_routes_of_the_app(tmp_path):
    doc = cs.load_json(cs.OPENAPI)
    validate(doc, base_uri=cs.OPENAPI.as_uri())
    with TestClient(create_app(tmp_path, host="testserver")) as client:
        app_routes = {(r.path, m.lower()) for r in client.app.routes if r.path.startswith(PREFIX) for m in r.methods if m != "HEAD"}
    doc_routes = {(p, m) for p, item in doc["paths"].items() for m in item}
    assert len(doc_routes) == 9
    assert doc_routes == app_routes


def test_responses_match_the_openapi_document(observed):
    for template, method, status, body, response in observed.seen:
        if status == 200 and template.endswith("/export"):
            assert response.headers["content-type"] == "application/zip"
            assert "application/zip" in cs.load_json(cs.OPENAPI)["paths"][template]["get"]["responses"]["200"]["content"]
            assert response.headers["content-disposition"].startswith('attachment; filename="neuraxis-')
            continue
        assert body is not None, (template, method, status)
        assert cs.response_errors(template, method, status, body) == [], (template, method, status, body)


def test_every_route_and_the_error_statuses_were_exercised(observed):
    got = {(t, m, s) for t, m, s, _, _ in observed.seen}
    for template, method in [(p, m.upper()) for p, item in cs.load_json(cs.OPENAPI)["paths"].items() for m in item]:
        assert any(t == template and mm == method and s == 200 for t, mm, s in got), (template, method)
    assert {403, 401, 404, 413, 422, 429} <= {s for _, _, s in got}


def test_the_live_run_result_is_an_operation_run_document(observed):
    """The snapshot's ``result`` is what scripts/evaluate_operations.py records: the same schema holds for both."""
    result = observed.done["result"]
    assert cs.errors("operation-run", result) == []
    assert result["status"] == "succeeded" and result["task"] == "source"


def test_a_cancelled_run_is_an_operation_run_document_too(observed):
    """What the producer writes when a run is cancelled (goal_cancel events, receipts without an outcome, no artifacts yet)."""
    cancelled = [b for t, m, s, b, _ in observed.seen if m == "GET" and s == 200 and t.endswith("{run_id}") and b["status"] == "cancelled"]
    assert cancelled, "no cancelled snapshot was seen"
    result = cancelled[-1]["result"]
    assert result["status"] == "cancelled" and result["artifacts"] == {}
    assert any(e["kind"] == "goal_cancel" for e in result["events"])
    assert cs.errors("operation-run", result) == []


def test_the_export_archive_holds_what_the_document_promises(observed):
    archive = next(r for t, m, s, _, r in observed.seen if t.endswith("/export") and s == 200)
    with zipfile.ZipFile(io.BytesIO(archive.content)) as z:
        names = z.namelist()
        assert "execution.json" in names and "input/settings.json" in names and "output/verify.json" in names
        execution = json.loads(z.read("execution.json"))
    assert cs.response_errors(PREFIX + "/runs/{run_id}", "get", 200, execution) == []


def test_adversarial_a_drifted_response_is_rejected(observed):
    config = next(b for t, m, s, b, _ in observed.seen if t.endswith("/config") and s == 200)
    assert cs.response_errors(PREFIX + "/config", "get", 200, config) == []
    for mutate in (lambda d: d.pop("engine"), lambda d: d.update(unexpected=1), lambda d: d.update(max_files="256"),
                   lambda d: d.update(tasks="data")):
        wrong = json.loads(json.dumps(config))
        mutate(wrong)
        assert cs.response_errors(PREFIX + "/config", "get", 200, wrong), wrong
    snapshot = observed.done
    for mutate in (lambda d: d.pop("nodes"), lambda d: d.update(status="paused"), lambda d: d.update(seed="1"),
                   lambda d: d["events"].append({"kind": "unknown_kind"})):
        wrong = json.loads(json.dumps(snapshot))
        mutate(wrong)
        assert cs.response_errors(PREFIX + "/runs/{run_id}", "get", 200, wrong), "a drifted snapshot is accepted"
    assert cs.response_errors(PREFIX + "/runs/{run_id}", "delete", 200, {"deleted": "yes"})
    assert cs.response_errors(PREFIX + "/runs/{run_id}", "get", 404, {"message": "x"})


def test_swap_fixture_run_and_live_run(observed):
    """The recorded run of the provider tree and a live run answer to the same schema, and the snapshot that carries a
    recorded run in its ``result`` validates against the same response the API declares."""
    index = cs.load_json(cs.DATA_ROOTS["fixture"] / "operations" / "index.json")
    recorded = cs.load_json(cs.DATA_ROOTS["fixture"] / "operations" / index["runs"][0]["path"])
    live = observed.done["result"]
    assert cs.errors("operation-run", recorded) == [] and cs.errors("operation-run", live) == []
    assert set(recorded) == set(live)
    snapshot = {**observed.done, "result": recorded}
    assert cs.response_errors(PREFIX + "/runs/{run_id}", "get", 200, snapshot) == []
