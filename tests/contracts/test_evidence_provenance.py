"""Producer-side tests of the four evidence documents that the product imports from the engine release (catalog rows
research-summary, benchmark-adequacy, routing-study, semantic-transfer-report): the provenance file binds each committed
document to a file of reflexmesh at a pinned commit by digest, and the import stage (``python data-pipeline/run.py
import-evidence``) reproduces the committed bytes from that commit or refuses. Nothing here uses the network: the online
reader is replaced, and the offline mode reads a local engine checkout given by the environment variable REFLEXMESH_CHECKOUT
(a temporary worktree of it is detached at the pinned tag; those tests are skipped when the variable is not set)."""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
from pathlib import Path

import contract_schemas as cs
import pytest
import support
from contract_schemas import ROOT

sys.path.insert(0, str(ROOT / "data-pipeline"))
from core import evidence

PROVENANCE = ROOT / "docs" / "contracts" / "evidence-provenance.json"
ENTRY_KEYS = {"contract", "neuraxis_path", "engine_repository", "engine_tag", "engine_commit", "engine_path",
              "engine_script", "sha256"}
CONTRACTS = {"research-summary", "benchmark-adequacy", "routing-study", "semantic-transfer-report"}


def _pinned_engine_tag() -> str:
    """The engine's release tag, derived from the PyPI pin of requirements.txt (the single source): 0.1.2 is tag v0.01.002."""
    pin = re.search(r"^reflexmesh==(\d+)\.(\d+)\.(\d+)$", (ROOT / "requirements.txt").read_text(encoding="utf-8"), re.MULTILINE)
    assert pin, "requirements.txt does not pin reflexmesh"
    major, minor, patch = (int(x) for x in pin.groups())
    return f"v{major}.{minor:02d}.{patch:03d}"


def _doc() -> dict:
    return cs.load_json(PROVENANCE)


def test_provenance_has_one_complete_entry_per_document():
    entries = _doc()["documents"]
    assert {e["contract"] for e in entries} == CONTRACTS and len(entries) == 4
    for e in entries:
        assert set(e) == ENTRY_KEYS, e
        assert re.fullmatch(r"[0-9a-f]{64}", e["sha256"]) and re.fullmatch(r"[0-9a-f]{40}", e["engine_commit"])
        assert e["engine_repository"] == "fsantibanezleal/reflexmesh" and e["engine_tag"] == _pinned_engine_tag()
        assert e["engine_script"].startswith("scripts/") and e["engine_script"].endswith(".py")
    assert len({e["neuraxis_path"] for e in entries}) == 4


def test_every_committed_document_matches_its_provenance_digest():
    for e in _doc()["documents"]:
        path = ROOT / e["neuraxis_path"]
        assert path.is_file(), f"missing {path}"
        assert support.sha(path.read_bytes()) == e["sha256"], f"{e['neuraxis_path']} differs from its engine source"


def test_provenance_matches_the_catalog_rows():
    text = (ROOT / "docs" / "contracts" / "catalog.md").read_text(encoding="utf-8")
    for e in _doc()["documents"]:
        row = next(ln for ln in text.splitlines() if ln.startswith(f"| {e['contract']} |"))
        assert e["neuraxis_path"] in row and e["engine_script"] in row and "import-evidence" in row
        assert row.rstrip().endswith("| real |")


def _provenance_copy(tmp_path: Path, mutate=None) -> Path:
    doc = _doc()
    if mutate:
        mutate(doc)
    path = tmp_path / "provenance.json"
    path.write_text(json.dumps(doc), encoding="utf-8")
    return path


def _reader_of(contents: dict[str, bytes]):
    return lambda entry: contents[entry["engine_path"]]


def _true_contents() -> dict[str, bytes]:
    return {e["engine_path"]: (ROOT / e["neuraxis_path"]).read_bytes() for e in _doc()["documents"]}


def _nothing_written(out: Path) -> bool:
    return not out.exists() or not any(out.rglob("*.json"))


def test_import_writes_the_four_files_byte_identical(tmp_path):
    out = tmp_path / "out"
    summary = evidence.import_evidence(PROVENANCE, out, _reader_of(_true_contents()))
    assert summary["documents"] == 4
    for e in _doc()["documents"]:
        assert (out / e["neuraxis_path"]).read_bytes() == (ROOT / e["neuraxis_path"]).read_bytes()


def test_a_tampered_digest_stops_the_import_and_writes_nothing(tmp_path):
    def tamper(doc):
        doc["documents"][2]["sha256"] = "0" * 64

    out = tmp_path / "out"
    with pytest.raises(ValueError, match=r"semantic-routing-study/analysis\.json.*digest"):
        evidence.import_evidence(_provenance_copy(tmp_path, tamper), out, _reader_of(_true_contents()))
    assert _nothing_written(out)


def test_changed_engine_bytes_stop_the_import_and_write_nothing(tmp_path):
    contents = _true_contents()
    key = _doc()["documents"][0]["engine_path"]
    contents[key] = contents[key] + b" "
    out = tmp_path / "out"
    with pytest.raises(ValueError, match="digest"):
        evidence.import_evidence(PROVENANCE, out, _reader_of(contents))
    assert _nothing_written(out)


def test_a_document_that_fails_its_schema_is_refused_even_with_a_matching_digest(tmp_path):
    contents = _true_contents()
    entry = _doc()["documents"][1]
    broken = json.loads(contents[entry["engine_path"]])
    del broken["schema_version"]
    raw = json.dumps(broken).encode()
    contents[entry["engine_path"]] = raw

    def rebind(doc):
        doc["documents"][1]["sha256"] = support.sha(raw)

    out = tmp_path / "out"
    with pytest.raises(ValueError, match=r"benchmark-adequacy.*schema_version"):
        evidence.import_evidence(_provenance_copy(tmp_path, rebind), out, _reader_of(contents))
    assert _nothing_written(out)


def test_an_unreachable_url_fails_with_the_url_and_points_to_offline(monkeypatch):
    def refuse(*args, **kwargs):
        raise urllib.error.URLError("no route")

    monkeypatch.setattr(evidence.urllib.request, "urlopen", refuse)
    entry = _doc()["documents"][0]
    with pytest.raises(ValueError) as caught:
        evidence.online_reader()(entry)
    message = str(caught.value)
    assert f"raw.githubusercontent.com/fsantibanezleal/reflexmesh/{entry['engine_commit']}/{entry['engine_path']}" in message
    assert "no route" in message and "--offline" in message


@pytest.fixture(scope="module")
def engine_worktree(tmp_path_factory):
    source = os.environ.get("REFLEXMESH_CHECKOUT")
    if not source or not Path(source).is_dir():
        pytest.skip("REFLEXMESH_CHECKOUT is not set to a reflexmesh checkout")
    tag = _doc()["documents"][0]["engine_tag"]
    target = tmp_path_factory.mktemp("engine") / "engine"
    subprocess.run(["git", "-C", source, "worktree", "add", "--detach", str(target), tag], check=True,
                   capture_output=True)
    yield target
    subprocess.run(["git", "-C", source, "worktree", "remove", "--force", str(target)], check=False,
                   capture_output=True)


def test_offline_import_from_the_engine_checkout_is_byte_identical(engine_worktree, tmp_path):
    out = tmp_path / "out"
    commit = _doc()["documents"][0]["engine_commit"]
    summary = evidence.import_evidence(PROVENANCE, out, evidence.offline_reader(engine_worktree, commit))
    assert summary["documents"] == 4
    for e in _doc()["documents"]:
        assert (out / e["neuraxis_path"]).read_bytes() == (ROOT / e["neuraxis_path"]).read_bytes()


def test_offline_refuses_a_checkout_that_is_not_at_the_pinned_ref(engine_worktree):
    with pytest.raises(ValueError, match="not at the pinned"):
        evidence.offline_reader(engine_worktree, "0" * 40)


def test_the_command_runs_offline_and_a_tampered_provenance_exits_non_zero(engine_worktree, tmp_path):
    run = ROOT / "data-pipeline" / "run.py"
    out = tmp_path / "out"
    ok = subprocess.run([sys.executable, str(run), "import-evidence", "--out", str(out), "--offline",
                         str(engine_worktree)], capture_output=True, text=True, check=False)
    assert ok.returncode == 0, ok.stderr
    assert json.loads(ok.stdout.strip().splitlines()[-1])["documents"] == 4

    def tamper(doc):
        doc["documents"][0]["sha256"] = "f" * 64

    out2 = tmp_path / "out2"
    bad = subprocess.run([sys.executable, str(run), "import-evidence", "--out", str(out2), "--offline",
                          str(engine_worktree), "--provenance", str(_provenance_copy(tmp_path, tamper))],
                         capture_output=True, text=True, check=False)
    assert bad.returncode != 0 and "research.json" in bad.stderr and not out2.exists()
