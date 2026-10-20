"""Producer-side test of the release manifest (catalog row release-manifest): ``scripts/package_static.py`` writes
``release.json`` into the static build at packaging time; it is never committed, so the test packages a small build and
validates what the script wrote, then swaps it with the committed example."""
from __future__ import annotations

import ast
import copy
import json
import sys

import contract_schemas as cs
import pytest

SCRIPTS = cs.ROOT / "scripts"
EXAMPLE = cs.CONTRACTS / "examples" / "release-manifest.json"
# (manifest key, the producing script, its schema property) for the four coverage records
COVERAGE_RECORDS = {
    "canonical_coverage": "check_artifacts.py",
    "operation_coverage": "check_operations.py",
    "semantic_coverage": "check_semantic_transfer.py",
    "routing_coverage": "check_semantic_routing.py",
}


def _returned_keys(script: str) -> set[str]:
    """The keys of the dict literal ``validate`` returns, read from the script's source (the producer of the record)."""
    tree = ast.parse((SCRIPTS / script).read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "validate":
            for ret in [n for n in ast.walk(node) if isinstance(n, ast.Return) and isinstance(n.value, ast.Dict)]:
                return {k.value for k in ret.value.keys if isinstance(k, ast.Constant)}
    raise AssertionError(f"{script}: no dict literal returned by validate")


@pytest.fixture()
def packaged(tmp_path, monkeypatch):
    sys.path.insert(0, str(SCRIPTS))
    try:
        import package_static
    finally:
        sys.path.remove(str(SCRIPTS))
    build = tmp_path / "dist"
    (build / "data").mkdir(parents=True)
    (build / "index.html").write_text("<!doctype html>", encoding="utf-8")
    (build / "data" / "index.json").write_text("{}", encoding="utf-8")
    (build / "assets").mkdir()
    (build / "assets" / "app.js").write_text("console.log(1)", encoding="utf-8")
    coverage = {k: {key: (1 if key != "coverage" else "3 tasks") for key in _returned_keys(script)} for k, script in COVERAGE_RECORDS.items()}
    coverage["operation_coverage"]["verified"] = True
    monkeypatch.setattr(package_static, "validate", lambda root: coverage["canonical_coverage"])
    monkeypatch.setattr(package_static, "validate_research", lambda root: {})
    monkeypatch.setattr(package_static, "validate_semantic_transfer", lambda root: coverage["semantic_coverage"])
    monkeypatch.setattr(package_static, "validate_semantic_routing", lambda root: coverage["routing_coverage"])
    monkeypatch.setattr(package_static, "validate_operations", lambda root, ops: coverage["operation_coverage"])
    package_static.package(tmp_path / "out" / "static.tar.gz", build)
    return json.loads((build / "release.json").read_text(encoding="utf-8"))


def test_packaged_manifest_validates(packaged):
    assert cs.errors("release-manifest", packaged) == []
    assert [f["path"] for f in packaged["files"]] == sorted(f["path"] for f in packaged["files"])
    assert "release.json" not in {f["path"] for f in packaged["files"]}
    assert len(packaged["commit"]) == 40


def test_example_and_packaged_manifest_swap(packaged):
    example = cs.load_json(EXAMPLE)
    assert cs.errors("release-manifest", example) == []
    assert set(example) == set(packaged)
    for key in COVERAGE_RECORDS:
        assert set(example[key]) == set(packaged[key]), key


def test_the_coverage_records_name_the_keys_their_producers_return():
    schema = cs.load_json(cs.SCHEMAS / "release-manifest.schema.json")
    for key, script in COVERAGE_RECORDS.items():
        assert set(schema["properties"][key]["properties"]) == _returned_keys(script), key


def test_adversarial_drifted_manifests_are_rejected():
    example = cs.load_json(EXAMPLE)
    extra = copy.deepcopy(example)
    extra["unexpected_key"] = 1
    assert cs.errors("release-manifest", extra)
    for key in example:
        missing = copy.deepcopy(example)
        del missing[key]
        assert cs.errors("release-manifest", missing), f"a missing {key} is accepted"
    wrong = copy.deepcopy(example)
    wrong["files"][0]["sha256"] = "abc"
    assert cs.errors("release-manifest", wrong)
    wrong = copy.deepcopy(example)
    wrong["commit"] = "HEAD"
    assert cs.errors("release-manifest", wrong)
    wrong = copy.deepcopy(example)
    wrong["version"] = "1.0"
    assert cs.errors("release-manifest", wrong)
