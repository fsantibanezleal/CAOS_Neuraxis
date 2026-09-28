"""Verify every separately published semantic-transfer trace and its audit."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "derived" / "semantic-transfer"
METHODS = {f"M{i:02d}" for i in range(1, 13)}
FAMILIES = {f"D{i:02d}" for i in range(1, 9)}
VARIANTS = {"nominal", "boundary"}
SEEDS = set(range(82000, 82008))


def validate(root: Path = ROOT) -> dict:
    root = root.resolve()
    index_bytes = (root / "index.json").read_bytes()
    index = json.loads(index_bytes)
    report = json.loads((root / "report.json").read_text(encoding="utf8"))
    lineage = json.loads((root / "lineage.json").read_text(encoding="utf8"))
    signature = hashlib.sha256(json.dumps(lineage, sort_keys=True).encode()).hexdigest()
    provenance = index.get("provenance", {})
    if (
        index.get("schema_version") != 1
        or report.get("schema_version") != 1
        or provenance.get("split") != "semantic_transfer"
        or provenance.get("lineage") != lineage
        or provenance.get("lineage_signature") != signature
        or set(provenance.get("complete_method_ids", [])) != METHODS
        or report.get("lineage_signature") != signature
        or report.get("index_sha256") != hashlib.sha256(index_bytes).hexdigest()
    ):
        raise ValueError("semantic transfer lineage or audit binding differs")
    expected = {(method, family, variant, seed) for method in METHODS for family in FAMILIES for variant in VARIANTS for seed in SEEDS}
    outcomes = {}
    by_method = defaultdict(list)
    for entry in index.get("episodes", []):
        relative = Path(entry["path"])
        path = (root / relative).resolve()
        if relative.is_absolute() or not path.is_relative_to(root):
            raise ValueError("semantic trace path escapes root")
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != entry["sha256"]:
            raise ValueError("semantic trace digest mismatch")
        episode = json.loads(raw)
        key = tuple(episode[field] for field in ("method_id", "case_id", "variant", "seed"))
        if key in outcomes or key not in expected:
            raise ValueError("duplicate or unexpected semantic trace")
        if any(episode[field] != entry[field] for field in ("run_id", "method_id", "case_id", "variant", "seed", "status")):
            raise ValueError("semantic trace identity differs from index")
        if (
            episode.get("lane") != "owned-semantic-transfer"
            or episode.get("provenance", {}).get("lineage_signature") != signature
            or episode["metrics"].get("task_success") not in (0, 1)
            or type(episode["metrics"].get("native_receipts")) is not int
            or not episode.get("decisions")
        ):
            raise ValueError("semantic trace lacks actual execution evidence")
        outcomes[key] = episode["metrics"]["task_success"]
        by_method[key[0]].append(episode)
    if set(outcomes) != expected or report.get("episodes_checked") != len(expected):
        raise ValueError("complete semantic-transfer matrix is missing")
    rows = {row["method_id"]: row for row in report.get("methods", [])}
    aggregates = {row["method_id"]: row for row in index.get("aggregate_results", [])}
    if set(rows) != METHODS or set(aggregates) != METHODS:
        raise ValueError("semantic method coverage differs")
    for method in METHODS:
        episodes = by_method[method]
        successes = sum(e["metrics"]["task_success"] for e in episodes)
        if (
            rows[method]["episodes"] != len(episodes)
            or rows[method]["successes"] != successes
            or rows[method]["invalid_policy_outputs"]
            != sum(e["metrics"]["invalid_policy_output"] for e in episodes)
            or rows[method]["planner_delegations"]
            != sum(e["metrics"]["delegations"] for e in episodes)
            or rows[method]["native_receipts"]
            != sum(e["metrics"]["native_receipts"] for e in episodes)
            or abs(
                rows[method]["mean_steps"]
                - sum(e["metrics"]["steps"] for e in episodes) / len(episodes)
            ) > 1e-9
            or abs(
                rows[method]["mean_wall_ms"]
                - sum(e["metrics"]["wall_ms"] for e in episodes) / len(episodes)
            ) > 1e-6
            or aggregates[method]["episodes"] != len(episodes)
            or abs(aggregates[method]["task_success"] - successes / len(episodes)) > 1e-12
        ):
            raise ValueError("semantic aggregate differs from raw trace evidence")
    variable = sum(
        len({outcomes[(method, family, variant, seed)] for seed in SEEDS}) > 1
        for method in METHODS for family in FAMILIES for variant in VARIANTS
    )
    if (
        report.get("seed_variable_cells") != variable
        or set(report.get("perfect_methods", []))
        != {method for method in METHODS if rows[method]["successes"] == 128}
    ):
        raise ValueError("semantic discrimination counts differ")
    family_rows = {row["family"]: row for row in report.get("by_family", [])}
    if set(family_rows) != FAMILIES or any(
        family_rows[family]["episodes_per_method"] != 16
        or any(
            family_rows[family]["methods"][method]
            != sum(outcomes[(method, family, variant, seed)] for variant in VARIANTS for seed in SEEDS)
            for method in METHODS
        )
        for family in FAMILIES
    ):
        raise ValueError("semantic family result differs from traces")
    for comparator in ("M01", "M04", "M09"):
        counts = Counter()
        for family in FAMILIES:
            for variant in VARIANTS:
                for seed in SEEDS:
                    left = outcomes[("M12", family, variant, seed)]
                    right = outcomes[(comparator, family, variant, seed)]
                    counts["m12_wins" if left > right else "m12_losses" if left < right else "ties"] += 1
        if report.get("m12_paired", {}).get(comparator) != dict(counts):
            raise ValueError("semantic paired comparison differs from traces")
    return {"episodes": len(expected), "methods": len(METHODS), "families": len(FAMILIES), "seed_variable_cells": variable}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    arguments = parser.parse_args()
    print(json.dumps(validate(arguments.root)))
