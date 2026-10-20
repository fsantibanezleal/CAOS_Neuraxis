"""The swap tests of the catalog: the same assertions run on the committed ``data/`` and on the provider tree
``docs/contracts/fixtures/data/`` (a stand-in with the same layout), so a consumer that works on one works on the other.
A swap test that passed on one tree only would prove nothing: each test first shows the trees are two different trees with
the same layout, then runs the same checks on both."""
from __future__ import annotations

import importlib.util
import shutil
import subprocess
import sys

import contract_schemas as cs
import support

sys.path.insert(0, str(cs.ROOT / "data-pipeline"))
from core import readiness

COMMITTED, FIXTURE = cs.DATA_ROOTS["committed"], cs.DATA_ROOTS["fixture"]


def _layout(root, pattern):
    return sorted(p.relative_to(root).as_posix() for p in root.glob(pattern))


def test_the_two_trees_are_different_trees_with_one_layout():
    assert COMMITTED.resolve() != FIXTURE.resolve()
    top = [
        "derived/index.json",
        "derived/lineage.json",
        "derived/research.json",
        "derived/benchmark-adequacy.json",
        "derived/semantic-routing-study/analysis.json",
        "derived/semantic-transfer/index.json",
        "derived/semantic-transfer/lineage.json",
        "derived/semantic-transfer/report.json",
        "derived/readiness.json",
        "operations/index.json",
    ]
    for rel in top:
        assert (COMMITTED / rel).is_file() and (FIXTURE / rel).is_file(), rel
    assert len(_layout(COMMITTED, "derived/episodes/*.json")) == 14400
    assert len(_layout(FIXTURE, "derived/episodes/*.json")) == 3
    assert len(_layout(FIXTURE, "derived/semantic-transfer/episodes/*.json")) == 1
    assert len(_layout(FIXTURE, "operations/*.json")) == 2  # the index and one run


def test_swap_derived_tree():
    for root in (COMMITTED, FIXTURE):
        derived = root / "derived"
        assert support.episode_set_problems(derived, "owned-real-software", "test") == [], root
        assert support.episode_set_problems(derived / "semantic-transfer", "owned-semantic-transfer", "semantic_transfer") == [], root
        for rel in ("lineage.json", "semantic-transfer/lineage.json"):
            assert cs.errors("lineage", cs.load_json(derived / rel)) == [], (root, rel)


def test_swap_evidence_documents():
    for root in (COMMITTED, FIXTURE):
        assert support.evidence_problems(root / "derived") == [], root
        assert cs.errors("semantic-transfer-index", cs.load_json(root / "derived" / "semantic-transfer" / "index.json")) == []


def test_swap_operations_tree():
    for root in (COMMITTED, FIXTURE):
        assert support.operation_problems(root / "operations") == [], root


def test_swap_readiness():
    for root in (COMMITTED, FIXTURE):
        doc = cs.load_json(root / "derived" / "readiness.json")
        assert cs.errors("readiness", doc) == [], root
        rows = [r["id"] for r in readiness.parse_catalog((cs.CONTRACTS / "catalog.md").read_text(encoding="utf-8"))]
        assert [e["id"] for e in doc["contracts"]] == [r for r in rows if r != "readiness"], root
    fixture = cs.load_json(FIXTURE / "derived" / "readiness.json")
    assert {e["state"] for e in fixture["contracts"]} == {"provider", "missing"}


def test_the_provider_tree_is_what_the_generator_writes(tmp_path):
    """docs/contracts/fixtures/data is generated (data-pipeline/fixtures.py), never edited: regenerate and compare bytes."""
    spec = importlib.util.spec_from_file_location("fixtures_generator", cs.ROOT / "data-pipeline" / "fixtures.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.generate(cs.ROOT, tmp_path / "data")
    fresh = {p.relative_to(tmp_path / "data").as_posix(): p.read_bytes() for p in (tmp_path / "data").rglob("*") if p.is_file()}
    kept = {p.relative_to(FIXTURE).as_posix(): p.read_bytes() for p in FIXTURE.rglob("*") if p.is_file()}
    assert sorted(fresh) == sorted(kept)
    assert [k for k in kept if kept[k] != fresh[k]] == []


def test_check_documents_accepts_the_provider_tree_as_a_repository(tmp_path):
    """The CI step: the guard run on a temporary root whose ``data/`` is the provider tree (seconds). The committed
    documents are validated, in parallel, by the tests of this directory; the serial guard takes minutes on them."""
    shutil.copytree(cs.CONTRACTS, tmp_path / "docs" / "contracts")
    shutil.copytree(FIXTURE, tmp_path / "data")
    out = subprocess.run([sys.executable, str(cs.ROOT / "scripts" / "check_documents.py"), str(tmp_path)], capture_output=True, text=True, check=False)
    assert out.returncode == 0, out.stdout + out.stderr
    assert out.stdout.startswith("documents: ") and out.stdout.strip().endswith(" valid")


def test_adversarial_check_documents_names_a_drifted_document(tmp_path):
    shutil.copytree(cs.CONTRACTS, tmp_path / "docs" / "contracts")
    shutil.copytree(FIXTURE, tmp_path / "data")
    victim = tmp_path / "data" / "derived" / "benchmark-adequacy.json"
    doc = cs.load_json(victim)
    doc["unexpected_key"] = 1
    victim.write_text(__import__("json").dumps(doc), encoding="utf-8")
    out = subprocess.run([sys.executable, str(cs.ROOT / "scripts" / "check_documents.py"), str(tmp_path)], capture_output=True, text=True, check=False)
    assert out.returncode == 1 and "benchmark-adequacy.json" in out.stdout, out.stdout
