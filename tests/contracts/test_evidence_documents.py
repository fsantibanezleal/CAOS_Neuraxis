"""Producer-side tests of the evidence documents (catalog rows research-summary, benchmark-adequacy, routing-study,
semantic-transfer-index and semantic-transfer-report). Four of them have no producer in the repository or in reflexmesh
0.1.2 (U3c writes them), so these tests are what holds their committed shape; the bindings between them (the digest of the
index each one audits) are checked on both trees."""
from __future__ import annotations

import copy

import contract_schemas as cs
import pytest
import support

TREES = {"committed": cs.DATA_ROOTS["committed"], "fixture": cs.DATA_ROOTS["fixture"]}
FILES = {
    "research-summary": "derived/research.json",
    "benchmark-adequacy": "derived/benchmark-adequacy.json",
    "routing-study": "derived/semantic-routing-study/analysis.json",
    "semantic-transfer-index": "derived/semantic-transfer/index.json",
    "semantic-transfer-report": "derived/semantic-transfer/report.json",
}


def _validates(name: str, label: str) -> dict:
    path = TREES[label] / FILES[name]
    assert path.is_file(), f"{label}: missing {path}"
    doc = cs.load_json(path)
    assert cs.errors(name, doc) == [], f"{label}: {name}"
    assert doc["schema_version"] == 1
    return doc


@pytest.mark.parametrize("label", TREES)
def test_research_summary_validates(label):
    doc = _validates("research-summary", label)
    assert doc["kind"] == "reflexmesh-corrected-science"


@pytest.mark.parametrize("label", TREES)
def test_benchmark_adequacy_validates(label):
    _validates("benchmark-adequacy", label)


@pytest.mark.parametrize("label", TREES)
def test_routing_study_validates(label):
    _validates("routing-study", label)


@pytest.mark.parametrize("label", TREES)
def test_semantic_transfer_index_validates(label):
    doc = _validates("semantic-transfer-index", label)
    assert doc["provenance"]["split"] == "semantic_transfer"


@pytest.mark.parametrize("label", TREES)
def test_semantic_transfer_report_validates(label):
    _validates("semantic-transfer-report", label)


@pytest.mark.parametrize("label", TREES)
def test_the_documents_are_bound_to_the_indexes_they_audit(label):
    assert support.evidence_problems(TREES[label] / "derived") == []


@pytest.mark.parametrize("name", FILES)
def test_adversarial_drifted_evidence_documents_are_rejected(name):
    doc = cs.load_json(cs.DATA_ROOTS["fixture"] / FILES[name])
    assert cs.errors(name, doc) == []
    extra = copy.deepcopy(doc)
    extra["unexpected_key"] = 1
    assert cs.errors(name, extra), "an extra key is accepted"
    for key in list(doc)[:3] + ["schema_version"]:
        missing = copy.deepcopy(doc)
        del missing[key]
        assert cs.errors(name, missing), f"a missing {key} is accepted"
    wrong = copy.deepcopy(doc)
    wrong["schema_version"] = "1"
    assert cs.errors(name, wrong)


def test_adversarial_a_binding_to_the_wrong_index_is_caught(tmp_path):
    import shutil

    base = tmp_path / "derived"
    shutil.copytree(cs.DATA_ROOTS["fixture"] / "derived", base)
    assert support.evidence_problems(base) == []
    path = base / "benchmark-adequacy.json"
    doc = cs.load_json(path)
    doc["index_sha256"] = "0" * 64
    path.write_text(__import__("json").dumps(doc), encoding="utf-8")
    assert any("benchmark-adequacy" in p for p in support.evidence_problems(base))
