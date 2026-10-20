"""Producer-side tests of the recorded operations (catalog rows operation-index and operation-run): the index and all
36 runs of ``data/operations/`` and of the provider tree validate against their schema files and agree with each
other (digest, identity, metrics). The same assertions run on both trees."""
from __future__ import annotations

import copy

import contract_schemas as cs
import pytest
import support

TREES = {"committed": cs.DATA_ROOTS["committed"], "fixture": cs.DATA_ROOTS["fixture"]}


@pytest.mark.parametrize("label", TREES)
def test_operation_index_validates(label):
    path = TREES[label] / "operations" / "index.json"
    assert path.is_file(), f"{label}: missing {path}"
    index = cs.load_json(path)
    assert cs.errors("operation-index", index) == []
    assert index["runs"] and index["policy"] == "verified-operation-fsm"
    assert index["engine"].startswith("reflexmesh ")


@pytest.mark.parametrize("label", TREES)
def test_operation_runs_validate(label):
    assert support.operation_problems(TREES[label] / "operations") == []


def test_the_committed_runs_are_the_36_the_study_records():
    index = cs.load_json(cs.DATA_ROOTS["committed"] / "operations" / "index.json")
    assert len(index["runs"]) == 36
    assert {r["task"] for r in index["runs"]} == {"data", "release", "source"}


def test_adversarial_drifted_operation_documents_are_rejected():
    root = cs.DATA_ROOTS["fixture"] / "operations"
    index = cs.load_json(root / "index.json")
    run = cs.load_json(root / index["runs"][0]["path"])
    for name, doc in (("operation-index", index), ("operation-run", run)):
        assert cs.errors(name, doc) == [], name
        extra = copy.deepcopy(doc)
        extra["unexpected_key"] = 1
        assert cs.errors(name, extra), name
        missing = copy.deepcopy(doc)
        del missing["schema_version"]
        assert cs.errors(name, missing), name
    wrong = copy.deepcopy(run)
    wrong["status"] = 7
    assert cs.errors("operation-run", wrong)
    wrong = copy.deepcopy(run)
    wrong["nodes"][0]["unexpected"] = 1
    assert cs.errors("operation-run", wrong)
    wrong = copy.deepcopy(run)
    wrong["findings"] = [{"code": "x"}]
    assert cs.errors("operation-run", wrong)
    wrong = copy.deepcopy(index)
    wrong["runs"][0]["sha256"] = "short"
    assert cs.errors("operation-index", wrong)


def test_adversarial_a_changed_run_breaks_its_digest(tmp_path):
    import shutil

    base = tmp_path / "operations"
    shutil.copytree(cs.DATA_ROOTS["fixture"] / "operations", base)
    assert support.operation_problems(base) == []
    victim = next(p for p in base.glob("*.json") if p.name != "index.json")
    victim.write_bytes(victim.read_bytes() + b" ")
    assert any("sha256 differs" in p for p in support.operation_problems(base))
