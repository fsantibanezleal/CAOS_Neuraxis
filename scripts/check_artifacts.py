"""Verify full method/case/variant/seed coverage, provenance and artifact bytes."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METHODS = {f"M{i:02d}" for i in range(1, 13)}
CASES = {f"C{i:02d}" for i in range(1, 21)}
VARIANTS = {
    "nominal",
    "delayed_observation",
    "duplicate_event",
    "stale_conflict",
    "unavailable_dependency",
    "boundary",
}


def validate(root: Path, required_seeds: int = 10) -> dict:
    root = root.resolve()
    index = json.loads((root / "index.json").read_text(encoding="utf-8"))
    if index.get("schema_version") != 1:
        raise ValueError("unsupported index schema")
    if {m["id"] for m in index["methods"]} != METHODS or {c["id"] for c in index["cases"]} != CASES:
        raise ValueError("method/case registry is incomplete")
    seen, cells, counts = set(), Counter(), Counter()
    for entry in index["episodes"]:
        relative = Path(entry["path"])
        path = (root / relative).resolve()
        if relative.is_absolute() or not path.is_relative_to(root):
            raise ValueError("artifact path escapes root")
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != entry["sha256"]:
            raise ValueError("episode digest mismatch: " + entry["run_id"])
        episode = json.loads(raw)
        identity = tuple(episode[k] for k in ("method_id", "case_id", "variant", "seed"))
        if identity in seen or any(
            episode[k] != entry[k] for k in ("run_id", "method_id", "case_id", "variant", "seed", "status")
        ):
            raise ValueError("duplicate cell or episode identity drift")
        if identity[0] not in METHODS or identity[1] not in CASES or identity[2] not in VARIANTS:
            raise ValueError("unexpected matrix dimension")
        if episode["provenance"].get("split") != "test" or not episode.get("provenance", {}).get("truth"):
            raise ValueError("episode lacks held-out truth provenance")
        receipts = episode["metrics"].get("native_receipts")
        if episode["metrics"].get("task_success") not in {0, 1} or type(receipts) is not int or receipts < 0:
            raise ValueError("episode has invalid success or native receipt evidence")
        # A policy can fail by abstaining or by proposing an inadmissible action.
        # Those observed failures belong in the denominator, including when no
        # native intent was admitted. Never invent a receipt to fill a matrix.
        if receipts == 0 and (
            episode["status"] not in {"failed", "cancelled"}
            or episode["metrics"]["task_success"] != 0
            or any(d.get("status") == "completed_verified" for d in episode["decisions"])
        ):
            raise ValueError("successful effects require native receipt evidence")
        if not episode["decisions"] or not episode["events"]:
            raise ValueError("empty executed trace")
        seen.add(identity)
        cells[identity[:3]] += 1
        counts[identity[0]] += 1
    expected = {(m, c, v) for m in METHODS for c in CASES for v in VARIANTS}
    if set(cells) != expected or any(n < required_seeds for n in cells.values()):
        raise ValueError("required complete method/case/variant/seed matrix is missing")
    aggregates = {a["method_id"]: a for a in index["aggregate_results"]}
    if set(aggregates) != METHODS or any(aggregates[m]["episodes"] != counts[m] for m in METHODS):
        raise ValueError("aggregate episode counts differ from raw trace evidence")
    return {
        "episodes": len(seen),
        "cells": len(cells),
        "methods": len(METHODS),
        "cases": len(CASES),
        "minimum_seeds": min(cells.values()),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT / "data" / "derived")
    parser.add_argument("--seeds", type=int, default=10)
    args = parser.parse_args()
    try:
        print(json.dumps(validate(args.root, args.seeds)))
    except (ValueError, KeyError, OSError) as exc:
        print("Artifact validation failed: " + str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
