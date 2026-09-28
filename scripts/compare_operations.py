"""Compare a candidate operation rebake with the previous release's verified outputs.

Native intent identifiers and wall times vary between executions. Accepted outputs,
findings, inputs, status and non-timing metrics must remain identical for a version-only
engine update. Run this after ``check_operations.validate`` on both trees.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from check_operations import validate

ROOT = Path(__file__).resolve().parents[1]
STABLE = ("schema_version", "task", "inputs", "input_sha256", "policy", "scope",
          "status", "disposition", "findings", "artifacts")


def compare(baseline: Path, candidate: Path) -> dict:
    baseline, candidate = baseline.resolve(), candidate.resolve()
    validate(ROOT, candidate)
    before_raw = (baseline / "index.json").read_bytes()
    after_raw = (candidate / "index.json").read_bytes()
    before, after = json.loads(before_raw), json.loads(after_raw)
    old = {row["run_id"]: row for row in before["runs"]}
    new = {row["run_id"]: row for row in after["runs"]}
    if set(old) != set(new) or len(old) != 36:
        raise ValueError("operation rebake does not preserve the full 36-run grid")
    for row in old.values():
        if hashlib.sha256((baseline / row["path"]).read_bytes()).hexdigest() != row["sha256"]:
            raise ValueError("baseline operation digest mismatch: " + row["run_id"])
    differences = []
    for run_id in sorted(old):
        previous = json.loads((baseline / old[run_id]["path"]).read_bytes())
        current = json.loads((candidate / new[run_id]["path"]).read_bytes())
        for key in STABLE:
            if previous[key] != current[key]:
                differences.append(f"{run_id}: {key}")
        for key, value in previous["metrics"].items():
            if key not in {"wall_ms", "journal_sequence"} and value != current["metrics"].get(key):
                differences.append(f"{run_id}: metrics.{key}")
    if differences:
        raise ValueError("operation outputs changed: " + ", ".join(differences))
    return {
        "schema": "neuraxis.operation-rebake-comparison/v1",
        "runs": len(old),
        "stable_outputs_unchanged": True,
        "baseline_engine": before["engine"],
        "candidate_engine": after["engine"],
        "baseline_index_sha256": hashlib.sha256(before_raw).hexdigest(),
        "candidate_index_sha256": hashlib.sha256(after_raw).hexdigest(),
        "variable_fields": ["native event/intent identifiers", "native event order",
                            "journal sequence under concurrent scheduling",
                            "per-event and episode wall times"],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--baseline", type=Path, default=ROOT / "data/operations")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = compare(args.baseline, args.candidate)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report))
