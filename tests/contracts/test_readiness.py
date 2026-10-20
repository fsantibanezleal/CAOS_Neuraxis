"""Catalog row readiness 1.0.0 (producer side): data-pipeline/core/readiness.py computes every row's declared state from
docs/contracts/catalog.md and the repository. One test per state, each reached through the real ``compute`` on a temporary
repository (the catalog, VERSION, requirements.txt and a copy of the provider tree as its ``data/``); each document is
checked against the schema and each reason against the catalog's own Missing-data table (parsed here, never copied)."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import contract_schemas as cs
import pytest
from contract_schemas import ROOT, errors

sys.path.insert(0, str(ROOT / "data-pipeline"))
from core import readiness

CATALOG = ROOT / "docs" / "contracts" / "catalog.md"
STATIC_MISSING = ("operations-api", "release-manifest")


def _table(section: str) -> list[list[str]]:
    text = CATALOG.read_text(encoding="utf-8").replace("\r\n", "\n")
    body = text.split(f"## {section}\n", 1)[1].split("\n## ", 1)[0]
    rows = [[c.strip() for c in ln.strip().strip("|").split("|")] for ln in body.splitlines() if ln.startswith("|")]
    return rows[2:]


def template(condition: str) -> tuple[str, str]:
    """The English and Spanish reason of the Missing-data row whose condition contains ``condition``."""
    for cells in _table("Missing-data states"):
        if len(cells) == 6 and condition in cells[1]:
            return cells[4], cells[5]
    raise AssertionError(f"no Missing-data row mentions {condition!r}")


def fill(tpl: tuple[str, str], **vals: object) -> dict:
    out = {}
    for lang, text in zip(("en", "es"), tpl):
        for k, v in vals.items():
            text = text.replace("{" + k + "}", str(v))
        out[lang] = text
    return out


def _set_status(text: str, rid: str, status: str) -> str:
    return re.sub(rf"(^\| {re.escape(rid)} \|.*)\| \w* \|$", rf"\1| {status} |", text, flags=re.MULTILINE)


@pytest.fixture()
def repo(tmp_path: Path) -> Path:
    """A temporary repository: an all-real catalog copy, VERSION, requirements.txt and the provider tree as ``data/``."""
    r = tmp_path / "repo"
    (r / "docs" / "contracts").mkdir(parents=True)
    text = re.sub(r"\| active \|$", "| real |", CATALOG.read_text(encoding="utf-8"), flags=re.MULTILINE)
    (r / "docs" / "contracts" / "catalog.md").write_text(text, encoding="utf-8", newline="\n")
    shutil.copy(ROOT / "VERSION", r / "VERSION")
    shutil.copy(ROOT / "requirements.txt", r / "requirements.txt")
    shutil.copytree(cs.DATA_ROOTS["fixture"], r / "data")
    return r


def run(r: Path) -> dict:
    doc = readiness.compute(repo_root=r)
    assert errors("readiness", doc) == [], doc
    return doc


def entry(doc: dict, rid: str) -> dict:
    return next(e for e in doc["contracts"] if e["id"] == rid)


def test_committed_readiness_is_current():
    fresh = readiness.compute(repo_root=ROOT)
    committed = (ROOT / "data" / "derived" / "readiness.json").read_bytes()
    assert committed == json.dumps(fresh, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    assert errors("readiness", json.loads(committed)) == []


def test_catalog_rows_in_order_without_readiness():
    ids = [c[0] for c in _table("Contracts")]
    doc = readiness.compute(repo_root=ROOT)
    assert [e["id"] for e in doc["contracts"]] == [i for i in ids if i != "readiness"]
    assert [e["version"] for e in doc["contracts"]] == ["1.0.0"] * len(doc["contracts"])


def test_the_committed_build_says_what_is_real():
    doc = readiness.compute(repo_root=ROOT)
    states = {e["id"]: (e["state"], e["provenance"]) for e in doc["contracts"]}
    for rid in STATIC_MISSING:
        assert states[rid] == ("missing", None), rid
    for rid in ("episode-index", "episode", "lineage", "research-summary", "benchmark-adequacy", "routing-study",
                "semantic-transfer-index", "semantic-transfer-report", "operation-index", "operation-run"):
        assert states[rid] == ("available", "real"), rid


def test_state_available(repo):
    doc = run(repo)
    for e in doc["contracts"]:
        if e["id"] in STATIC_MISSING:
            continue
        assert (e["state"], e["provenance"], e["reason"], e["missing"]) == ("available", "real", None, []), e["id"]


def test_static_rows_are_missing_in_the_static_document(repo):
    doc = run(repo)
    for rid in STATIC_MISSING:
        e = entry(doc, rid)
        assert (e["state"], e["provenance"], e["missing"]) == ("missing", None, [])
        assert e["reason"] == fill(template("always, in the static document"))


def test_adversarial_state_provider_through_a_catalog_copy(repo):
    cat = repo / "docs" / "contracts" / "catalog.md"
    cat.write_text(_set_status(cat.read_text(encoding="utf-8"), "episode-index", "active"), encoding="utf-8", newline="\n")
    e = entry(run(repo), "episode-index")
    assert (e["state"], e["provenance"], e["status"]) == ("provider", "fixture", "active")
    assert e["reason"] == fill(template("the catalog `status` is `active`"),
                               provider="fixture:docs/contracts/fixtures/data/derived/index.json")


def test_adversarial_state_missing_without_an_index(repo):
    (repo / "data" / "derived" / "index.json").unlink()
    doc = run(repo)
    for rid in ("episode-index", "episode", "lineage"):
        e = entry(doc, rid)
        assert (e["state"], e["provenance"]) == ("missing", None), rid
        assert e["reason"] == fill(template("`data/derived/index.json` is absent")), rid
    assert entry(doc, "operation-index")["state"] == "available"


def test_state_missing_without_the_semantic_transfer_index(repo):
    (repo / "data" / "derived" / "semantic-transfer" / "index.json").unlink()
    e = entry(run(repo), "semantic-transfer-index")
    assert (e["state"], e["reason"]) == ("missing", fill(template("semantic-transfer/index.json` is absent")))


def test_state_missing_without_the_operation_index(repo):
    (repo / "data" / "operations" / "index.json").unlink()
    doc = run(repo)
    for rid in ("operation-index", "operation-run"):
        e = entry(doc, rid)
        assert (e["state"], e["reason"]) == ("missing", fill(template("`data/operations/index.json` is absent"))), rid


def test_state_missing_without_the_derived_lineage(repo):
    (repo / "data" / "derived" / "lineage.json").unlink()
    e = entry(run(repo), "lineage")
    assert (e["state"], e["reason"]) == ("missing", fill(template("`data/derived/lineage.json` is absent")))


def test_adversarial_state_partial_episodes(repo):
    index = cs.load_json(repo / "data" / "derived" / "index.json")
    gone = sorted(e["path"] for e in index["episodes"])[:2]
    for rel in gone:
        (repo / "data" / "derived" / rel).unlink()
    st = cs.load_json(repo / "data" / "derived" / "semantic-transfer" / "index.json")
    st_gone = st["episodes"][0]["path"]
    (repo / "data" / "derived" / "semantic-transfer" / st_gone).unlink()
    total = len(index["episodes"]) + len(st["episodes"])
    e = entry(run(repo), "episode")
    assert (e["state"], e["provenance"]) == ("partial", "real")
    assert e["missing"] == sorted(gone + ["semantic-transfer/" + st_gone])
    assert e["reason"] == fill(template("an episode an index lists is absent"), n=3, total=total)


def test_state_partial_lineage(repo):
    (repo / "data" / "derived" / "semantic-transfer" / "lineage.json").unlink()
    e = entry(run(repo), "lineage")
    assert (e["state"], e["provenance"], e["missing"]) == ("partial", "real", ["semantic-transfer/lineage.json"])
    assert e["reason"] == fill(template("its lineage is absent"), n=1, total=2)


def test_adversarial_state_partial_operation_runs(repo):
    index = cs.load_json(repo / "data" / "operations" / "index.json")
    gone = index["runs"][0]["path"]
    (repo / "data" / "operations" / gone).unlink()
    e = entry(run(repo), "operation-run")
    assert (e["state"], e["provenance"], e["missing"]) == ("partial", "real", [gone])
    assert e["reason"] == fill(template("a run the operation index lists is absent"), n=1, total=len(index["runs"]))
    assert entry(run(repo), "operation-index")["state"] == "available"


def test_adversarial_state_stale(repo):
    path = repo / "data" / "operations" / "index.json"
    doc = cs.load_json(path)
    doc["engine"] = "reflexmesh 0.0.1"
    path.write_text(json.dumps(doc), encoding="utf-8")
    pinned = re.search(r"reflexmesh==([\d.]+)", (repo / "requirements.txt").read_text(encoding="utf-8")).group(1)
    for rid in ("operation-index", "operation-run"):
        e = entry(run(repo), rid)
        assert (e["state"], e["provenance"]) == ("stale", "real"), rid
        assert e["reason"] == fill(template("differs from the engine pinned"), engine="reflexmesh 0.0.1", pinned=f"reflexmesh {pinned}")


def test_state_missing_for_a_real_row_whose_fixed_document_is_absent(repo):
    (repo / "data" / "derived" / "research.json").unlink()
    e = entry(run(repo), "research-summary")
    assert (e["state"], e["reason"]) == ("missing", fill(template("that file is absent")))


def test_first_matching_rule_wins(repo):
    """An absent index beats a stale engine; the active status beats an absent document."""
    (repo / "data" / "operations" / "index.json").unlink()
    cat = repo / "docs" / "contracts" / "catalog.md"
    cat.write_text(_set_status(cat.read_text(encoding="utf-8"), "research-summary", "active"), encoding="utf-8", newline="\n")
    (repo / "data" / "derived" / "research.json").unlink()
    doc = run(repo)
    assert entry(doc, "operation-index")["state"] == "missing"
    assert entry(doc, "research-summary")["state"] == "provider"


@pytest.mark.parametrize("bad", ["Real", "live", "", "planned"])
def test_a_status_other_than_real_or_active_fails(repo, bad):
    cat = repo / "docs" / "contracts" / "catalog.md"
    cat.write_text(_set_status(cat.read_text(encoding="utf-8"), "lineage", bad), encoding="utf-8", newline="\n")
    with pytest.raises(ValueError, match="status"):
        readiness.compute(repo_root=repo)


def test_determinism_and_normalised_hash(repo):
    first = run(repo)
    assert run(repo) == first
    cat = repo / "docs" / "contracts" / "catalog.md"
    cat.write_bytes(cat.read_bytes().replace(b"\n", b"\r\n"))
    assert run(repo)["catalog_sha256"] == first["catalog_sha256"]


def test_the_provider_document_says_provider_for_every_row_but_the_static_ones():
    doc = readiness.compute(repo_root=ROOT, data_root=cs.DATA_ROOTS["fixture"], providers=True)
    assert errors("readiness", doc) == []
    for e in doc["contracts"]:
        want = ("missing", None) if e["id"] in STATIC_MISSING else ("provider", "fixture")
        assert (e["state"], e["provenance"]) == want, e["id"]


def test_adversarial_drifted_readiness_documents_are_rejected():
    doc = readiness.compute(repo_root=ROOT)
    assert errors("readiness", doc) == []
    wrong = json.loads(json.dumps(doc))
    wrong["contracts"][0].update(state="partial", missing=[])
    assert errors("readiness", wrong)
    wrong = json.loads(json.dumps(doc))
    wrong["contracts"][0].update(state="available", reason={"en": "x", "es": "x"})
    assert errors("readiness", wrong)
    wrong = json.loads(json.dumps(doc))
    wrong["contracts"][0]["unexpected"] = 1
    assert errors("readiness", wrong)
    wrong = json.loads(json.dumps(doc))
    del wrong["catalog_sha256"]
    assert errors("readiness", wrong)


def test_check_readiness_passes_on_the_repository():
    out = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_readiness.py")], capture_output=True, text=True, check=False)
    assert out.returncode == 0 and "readiness: current" in out.stdout, out.stdout + out.stderr


def test_adversarial_check_readiness_runs_without_the_training_stack():
    """Stdlib only: CI runs it with nothing installed (ADR-0074); numpy, torch, reflexmesh and jsonschema are blocked here."""
    blocked = ("import sys, runpy\nfor m in ('numpy', 'torch', 'reflexmesh', 'jsonschema', 'fastapi'):\n    sys.modules[m] = None\n"
               "path = sys.argv[1]; sys.argv = sys.argv[1:]\nrunpy.run_path(path, run_name='__main__')")
    out = subprocess.run([sys.executable, "-c", blocked, str(ROOT / "scripts" / "check_readiness.py")], capture_output=True, text=True, check=False)
    assert out.returncode == 0, out.stdout + out.stderr


def test_adversarial_check_readiness_fails_on_a_changed_catalog(tmp_path):
    r = tmp_path / "repo"
    (r / "docs" / "contracts").mkdir(parents=True)
    shutil.copy(ROOT / "VERSION", r / "VERSION")
    shutil.copy(ROOT / "requirements.txt", r / "requirements.txt")
    shutil.copytree(cs.DATA_ROOTS["fixture"], r / "data")
    (r / "docs" / "contracts" / "catalog.md").write_text(CATALOG.read_text(encoding="utf-8") + "\nA changed sentence.\n",
                                                          encoding="utf-8", newline="\n")
    out = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_readiness.py"), str(r)], capture_output=True, text=True, check=False)
    assert out.returncode == 1 and "stale" in out.stdout, out.stdout
