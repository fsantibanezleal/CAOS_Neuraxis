"""Every writer validates before it writes (catalog, Contracts): ``data-pipeline/run.py export`` (the engine's index and
lineage) and ``scripts/evaluate_operations.py`` (the operation index and runs) refuse a document that departs from its
schema, name the field path, and leave the target untouched."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import contract_schemas as cs
import pytest
from contract_schemas import ROOT

sys.path.insert(0, str(ROOT / "data-pipeline"))


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture()
def run_module():
    return _load("neuraxis_run", ROOT / "data-pipeline" / "run.py")


def _source(tmp_path: Path, mutate=None) -> Path:
    source = tmp_path / "source"
    source.mkdir()
    index = cs.load_json(ROOT / "data" / "derived" / "index.json")
    lineage = cs.load_json(ROOT / "data" / "derived" / "lineage.json")
    if mutate:
        mutate(index, lineage)
    (source / "index.json").write_text(json.dumps(index), encoding="utf-8")
    (source / "lineage.json").write_text(json.dumps(lineage), encoding="utf-8")
    return source


class _NoChecks:
    @staticmethod
    def validate(source):
        return {}


def test_export_refuses_a_broken_index_and_writes_nothing(run_module, monkeypatch, tmp_path):
    monkeypatch.setattr(run_module, "_load_checks", lambda: _NoChecks)
    source = _source(tmp_path, lambda index, lineage: index.pop("generated_at"))
    destination = tmp_path / "out"
    with pytest.raises(ValueError, match=r"index\.json.*generated_at"):
        run_module.export(source, destination)
    assert not destination.exists()


def test_export_refuses_a_broken_lineage_and_writes_nothing(run_module, monkeypatch, tmp_path):
    monkeypatch.setattr(run_module, "_load_checks", lambda: _NoChecks)
    source = _source(tmp_path, lambda index, lineage: lineage.pop("source_sha256"))
    destination = tmp_path / "out"
    with pytest.raises(ValueError, match=r"lineage\.json.*source_sha256"):
        run_module.export(source, destination)
    assert not destination.exists()


def test_the_committed_index_and_lineage_pass_the_export_validation(run_module):
    index = cs.load_json(ROOT / "data" / "derived" / "index.json")
    lineage = cs.load_json(ROOT / "data" / "derived" / "lineage.json")
    run_module.validate_export_documents(index, lineage)


@pytest.fixture()
def operations_module(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "scripts"))
    module = _load("neuraxis_evaluate_operations", ROOT / "scripts" / "evaluate_operations.py")
    first = next(iter(module.TASKS))
    monkeypatch.setattr(module, "TASKS", {first: module.TASKS[first]})
    monkeypatch.setattr(module, "VARIANTS", module.VARIANTS[:1])
    return module


def test_evaluate_operations_refuses_a_broken_run_before_writing_it(operations_module, monkeypatch, tmp_path):
    real = operations_module.execute_operation

    def broken(root, task, supplied, **kwargs):
        result = real(root, task, supplied, **kwargs)
        result.pop("disposition")
        return result

    monkeypatch.setattr(operations_module, "execute_operation", broken)
    monkeypatch.setattr(sys, "argv", ["evaluate_operations.py", "--seeds", "1", "--output", str(tmp_path / "ops")])
    with pytest.raises(ValueError, match=r"operation-run.*disposition"):
        operations_module.main()
    assert not list((tmp_path / "ops").glob("*.json"))


def test_evaluate_operations_refuses_a_broken_index_before_writing_it(operations_module, monkeypatch, tmp_path):
    real = operations_module.check_document

    def drop_policy(name, doc, label):
        if name == "operation-index":
            doc = {k: v for k, v in doc.items() if k != "policy"}
        return real(name, doc, label)

    monkeypatch.setattr(operations_module, "check_document", drop_policy)
    monkeypatch.setattr(sys, "argv", ["evaluate_operations.py", "--seeds", "1", "--output", str(tmp_path / "ops")])
    with pytest.raises(ValueError, match=r"operation-index.*policy"):
        operations_module.main()
    assert not (tmp_path / "ops" / "index.json").exists()
