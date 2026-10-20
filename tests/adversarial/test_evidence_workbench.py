"""Plants for the evidence-workbench feature (EW): one planted defect per requirement of ``docs/design/features/evidence-workbench``
that has a Python gate, run through ``scripts/check_artifacts.py``. The other eight requirements are web gates
(``frontend/src/adversarial/evidence-workbench.test.ts``).

EW-001 removes one cell of the matrix from the index, so the guard reads every episode before it can say the matrix is incomplete:
it runs on the hard-link mirror of the committed tree (``canonical_mirror``) with one replaced file, as the audit plant of
``test_benchmark_adequacy.py`` does. EW-009 stops at the registry or at the first count, so its trees hold an index only."""
from __future__ import annotations

import json
from pathlib import Path

from planting import ROOT, guard, replace_file

ARTIFACTS = "check_artifacts.py"
INDEX = ROOT / "data" / "derived" / "index.json"


def run_artifacts(root: Path):
    return guard(ROOT, ARTIFACTS, "--root", str(root))


def test_adversarial_an_index_missing_a_cell_fails_the_artifact_check(canonical_mirror: Path) -> None:
    index_path = canonical_mirror / "index.json"
    original = index_path.read_bytes()
    index = json.loads(original)
    cells = {(e["method_id"], e["case_id"], e["variant"]) for e in index["episodes"]}
    assert len(cells) == 1440 and len(index["episodes"]) == 14400, "the copy starts with the complete matrix"
    removed = index["episodes"].pop(7200)  # one cell of the method, case, variant and seed matrix
    assert len(index["episodes"]) == 14399
    replace_file(index_path, json.dumps(index, indent=2).encode("utf-8"))
    try:
        r = run_artifacts(canonical_mirror)
    finally:
        replace_file(index_path, original)
    assert r.returncode == 1, f"the export of an index without {removed['run_id']} was accepted: {r.stdout}"
    assert "required complete method/case/variant/seed matrix is missing" in r.stderr, r.stderr
    assert not r.stdout.strip(), "a refused export prints no coverage summary"


def test_adversarial_an_empty_or_incomplete_matrix_is_rejected(tmp_path: Path) -> None:
    committed = json.loads(INDEX.read_bytes())
    # the matrix is empty: no episode is listed
    empty = tmp_path / "empty"
    empty.mkdir()
    document = {**committed, "episodes": [], "aggregate_results": []}
    (empty / "index.json").write_text(json.dumps(document), encoding="utf-8")
    r = run_artifacts(empty)
    assert r.returncode == 1 and "matrix is missing" in r.stderr, r.stdout + r.stderr
    # one method is missing from the registry
    short = tmp_path / "short"
    short.mkdir()
    document = {**committed, "methods": committed["methods"][:-1]}
    assert len(document["methods"]) == len(committed["methods"]) - 1
    (short / "index.json").write_text(json.dumps(document), encoding="utf-8")
    r = run_artifacts(short)
    assert r.returncode == 1 and "method/case registry is incomplete" in r.stderr, r.stdout + r.stderr
