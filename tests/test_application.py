import hashlib
import importlib.util
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]


def module(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


def test_app_requires_explicit_local_auth(monkeypatch):
    app = module(ROOT / "app" / "main.py")
    monkeypatch.delenv("REFLEXMESH_LOCAL_TOKEN", raising=False)
    with pytest.raises(RuntimeError, match="REFLEXMESH_LOCAL_TOKEN"):
        app.create_app()


def test_local_app_metadata_and_effect_boundary(monkeypatch):
    monkeypatch.setenv("REFLEXMESH_LOCAL_TOKEN", "integration-token-with-more-than-24-characters")
    app = module(ROOT / "app" / "main.py")
    with TestClient(app.create_app(), base_url="http://127.0.0.1") as client:
        config = client.get("/api/config").json()
        assert len(config["methods"]) == 12
        assert len(config["cases"]) == 20
        assert config["local_auth_required"]
        assert client.post("/api/run", json={"case_id": "C01", "method_id": "M01"}).status_code == 401


def test_artifact_validator_rejects_empty_or_incomplete_matrix(tmp_path):
    validator = module(ROOT / "scripts" / "check_artifacts.py")
    index = {
        "schema_version": 1,
        "methods": [{"id": m} for m in validator.METHODS],
        "cases": [{"id": c} for c in validator.CASES],
        "episodes": [],
        "aggregate_results": [],
    }
    (tmp_path / "index.json").write_text(json.dumps(index))
    with pytest.raises(ValueError, match="complete"):
        validator.validate(tmp_path)


def test_product_has_no_installable_engine():
    import tomllib

    value = tomllib.loads((ROOT / "pyproject.toml").read_text())
    assert "project" not in value and "build-system" not in value
    assert "reflexmesh==" in (ROOT / "requirements.txt").read_text()


def test_failed_abstention_counts_but_success_without_receipts_is_rejected(tmp_path, monkeypatch):
    validator = module(ROOT / "scripts" / "check_artifacts.py")
    monkeypatch.setattr(validator, "METHODS", {"M01"})
    monkeypatch.setattr(validator, "CASES", {"C01"})
    monkeypatch.setattr(validator, "VARIANTS", {"nominal"})
    episode = {
        "run_id": "observed-abstention",
        "method_id": "M01",
        "case_id": "C01",
        "variant": "nominal",
        "seed": 20000,
        "status": "failed",
        "provenance": {"split": "test", "truth": "actual predicate"},
        "metrics": {"task_success": 0, "native_receipts": 0},
        "events": [{"sequence": 1}],
        "decisions": [{"mode": "stop", "action": None, "status": "failed"}],
    }

    def write():
        raw = json.dumps(episode).encode()
        (tmp_path / "episode.json").write_bytes(raw)
        entry = {k: episode[k] for k in ("run_id", "method_id", "case_id", "variant", "seed", "status")}
        entry.update(path="episode.json", sha256=hashlib.sha256(raw).hexdigest())
        index = {
            "schema_version": 1,
            "methods": [{"id": "M01"}],
            "cases": [{"id": "C01"}],
            "episodes": [entry],
            "aggregate_results": [{"method_id": "M01", "episodes": 1}],
        }
        (tmp_path / "index.json").write_text(json.dumps(index))

    write()
    assert validator.validate(tmp_path, 1)["episodes"] == 1
    episode["status"] = "succeeded"
    episode["metrics"]["task_success"] = 1
    write()
    with pytest.raises(ValueError, match="require native receipt"):
        validator.validate(tmp_path, 1)
