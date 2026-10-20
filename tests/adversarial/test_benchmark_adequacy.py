"""Plants for the benchmark-adequacy feature (BA): one planted defect per requirement of ``docs/design/features/benchmark-adequacy``,
run through the requirement's own guard (``scripts/check_artifacts.py``, ``scripts/check_semantic_transfer.py``).

BA-003 and BA-004 are web gates (``frontend/src/adversarial/benchmark-adequacy.test.ts``). The core guard reads 14,400 episodes
(6 s warm), so the plant that must reach its final audit reads a hard-link mirror of the committed tree and replaces one small
file; the plants that must fail before any count is made keep only the first listed episode."""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from planting import ROOT, guard, replace_file

ARTIFACTS = "check_artifacts.py"
TRANSFER = "check_semantic_transfer.py"
SEMANTIC = ROOT / "data" / "derived" / "semantic-transfer"


def run_artifacts(root: Path):
    """The committed guard (read only) on a root of the test's making."""
    return guard(ROOT, ARTIFACTS, "--root", str(root))


def flip_one_byte(path: Path) -> None:
    """Change one byte of a copied document: the last digit before the closing brace becomes a different digit."""
    raw = path.read_bytes()
    at = max(i for i, b in enumerate(raw) if 48 <= b <= 57)
    path.write_bytes(raw[:at] + (b"0" if raw[at:at + 1] != b"0" else b"1") + raw[at + 1:])


def test_the_core_guard_passes_the_committed_tree(canonical_mirror: Path) -> None:
    """The clean control of BA-001, BA-005 and EW-001: the mirror of the committed tree is accepted, so a failure is the plant's."""
    r = run_artifacts(canonical_mirror)
    assert r.returncode == 0 and '"episodes": 14400' in r.stdout, r.stdout + r.stderr


def test_adversarial_a_changed_core_episode_fails_the_artifact_check(first_episode_tree: Path) -> None:
    index = json.loads((first_episode_tree / "index.json").read_bytes())
    first = index["episodes"][0]
    episode = first_episode_tree / first["path"]
    assert hashlib.sha256(episode.read_bytes()).hexdigest() == first["sha256"], "the copy starts consistent with its index"
    flip_one_byte(episode)
    assert hashlib.sha256(episode.read_bytes()).hexdigest() != first["sha256"], "the plant changed nothing"
    r = run_artifacts(first_episode_tree)
    assert r.returncode == 1, r.stdout + r.stderr
    assert "episode digest mismatch: " + first["run_id"] in r.stderr, r.stderr
    # before any count is made: no coverage, aggregate or audit message, and no summary on stdout
    assert "matrix" not in r.stderr and "aggregate" not in r.stderr and "audit" not in r.stderr and not r.stdout.strip(), r.stderr


def test_adversarial_a_changed_semantic_episode_fails_the_transfer_check(tmp_path: Path) -> None:
    clean = guard(ROOT, TRANSFER, "--root", str(SEMANTIC))
    assert clean.returncode == 0 and '"episodes": 1536' in clean.stdout, clean.stdout + clean.stderr
    root = tmp_path / "semantic-transfer"
    root.mkdir()
    for name in ("index.json", "report.json", "lineage.json"):
        shutil.copy2(SEMANTIC / name, root / name)
    first = json.loads((root / "index.json").read_bytes())["episodes"][0]
    (root / first["path"]).parent.mkdir(parents=True)
    shutil.copy2(SEMANTIC / first["path"], root / first["path"])
    flip_one_byte(root / first["path"])
    assert hashlib.sha256((root / first["path"]).read_bytes()).hexdigest() != first["sha256"], "the plant changed nothing"
    r = guard(ROOT, TRANSFER, "--root", str(root))
    assert r.returncode != 0, r.stdout
    assert "semantic trace digest mismatch" in r.stderr, r.stderr


def test_adversarial_an_audit_that_differs_from_the_episodes_fails_the_artifact_check(canonical_mirror: Path) -> None:
    audit = canonical_mirror / "benchmark-adequacy.json"
    original = audit.read_bytes()
    document = json.loads(original)
    document["methods"][0]["successes"] -= 1  # one count of the audit; the episodes and the index are untouched
    replace_file(audit, json.dumps(document, indent=2).encode("utf-8"))
    try:
        r = run_artifacts(canonical_mirror)
    finally:
        replace_file(audit, original)
    assert r.returncode == 1, r.stdout + r.stderr
    assert "benchmark adequacy audit differs from canonical episodes" in r.stderr, r.stderr
