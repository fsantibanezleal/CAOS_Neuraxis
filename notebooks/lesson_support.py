"""Small, auditable readers used by the Neuraxis curriculum's full-core lesson."""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any


def load_core_comparison(
    root: Path,
    index: dict[str, Any],
    methods: tuple[str, ...] = ("M01", "M12"),
    episodes_per_family: int = 60,
) -> tuple[dict[tuple[str, str], list[dict[str, Any]]], dict[str, int]]:
    """Return hash-verified family episodes and success totals for the full core slice.

    Failed episodes remain in each family's denominator. The function rejects a missing,
    truncated, or hash-mismatched family rather than silently plotting a partial sample.
    """
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in index["episodes"]:
        if row["method_id"] not in methods:
            continue
        raw = (root / "data/derived" / row["path"]).read_bytes()
        if hashlib.sha256(raw).hexdigest() != row["sha256"]:
            raise ValueError(f"episode digest mismatch: {row['path']}")
        grouped[(row["method_id"], row["case_id"])].append(json.loads(raw))

    case_ids = {row["case_id"] for row in index["episodes"]}
    expected = {(method, case) for method in methods for case in case_ids}
    if set(grouped) != expected or any(len(grouped[key]) != episodes_per_family for key in expected):
        raise ValueError("full-core comparison is incomplete or has an unexpected family denominator")

    successes = {
        method: sum(
            bool(episode["metrics"]["task_success"])
            for (family_method, _), episodes in grouped.items()
            if family_method == method
            for episode in episodes
        )
        for method in methods
    }
    return dict(grouped), successes


def load_lesson_evidence(
    root: Path,
    topic: str,
    methods: tuple[str, ...],
    sample_case: str,
    seed: int,
    include_core: bool = False,
    include_transfer: bool = False,
) -> dict[str, Any]:
    """Load a notebook's complete case slice after validating its manifest hashes."""
    index_path = root / "data/derived/index.json"
    index_bytes = index_path.read_bytes()
    index = json.loads(index_bytes)
    audit = json.loads((root / "data/derived/benchmark-adequacy.json").read_text(encoding="utf-8"))
    if hashlib.sha256(index_bytes).hexdigest() != audit["index_sha256"]:
        raise ValueError("core index digest does not match its audit")
    rows = {
        (row["method_id"], row["case_id"], row["variant"], row["seed"]): row
        for row in index["episodes"]
    }

    def read(row: dict[str, Any]) -> dict[str, Any]:
        raw = (root / "data/derived" / row["path"]).read_bytes()
        if hashlib.sha256(raw).hexdigest() != row["sha256"]:
            raise ValueError(f"episode digest mismatch: {row['path']}")
        return json.loads(raw)

    records = {
        method: read(rows[(method, sample_case, "nominal", seed)])
        for method in methods
    }
    case_records: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in index["episodes"]:
        if row["case_id"] == sample_case and row["method_id"] in methods:
            case_records.setdefault((row["method_id"], row["variant"]), []).append(read(row))
    evidence: dict[str, Any] = {
        "index": index,
        "audit": audit,
        "records": records,
        "case_records": case_records,
    }
    if include_core:
        evidence["full_core_by_family"], evidence["core_success_counts"] = load_core_comparison(root, index)
    if include_transfer:
        transfer_path = root / "data/derived/semantic-transfer/index.json"
        transfer_bytes = transfer_path.read_bytes()
        transfer = json.loads(transfer_bytes)
        report = json.loads((root / "data/derived/semantic-transfer/report.json").read_text(encoding="utf-8"))
        if hashlib.sha256(transfer_bytes).hexdigest() != report["index_sha256"]:
            raise ValueError("transfer index digest does not match its audit")
        evidence["transfer"] = transfer
        evidence["transfer_report"] = report
    return evidence


def plot_core_success(groups, labels):
    """Render paired family completion with Wilson intervals from verified episodes."""
    import matplotlib.pyplot as plt

    families = sorted({case for _, case in groups})
    fig, ax = plt.subplots(figsize=(12, 6), constrained_layout=True)
    for method, label in labels.items():
        rates, lows, highs = [], [], []
        for case in families:
            episodes = groups[(method, case)]
            n = len(episodes)
            successes = sum(bool(row["metrics"]["task_success"]) for row in episodes)
            rate = successes / n
            z = 1.96
            denom = 1 + z * z / n
            center = (rate + z * z / (2 * n)) / denom
            half = z * ((rate * (1 - rate) / n + z * z / (4 * n * n)) ** .5) / denom
            rates.append(rate)
            lows.append(rate - max(0, center - half))
            highs.append(max(0, center + half - rate))
        ax.errorbar(
            range(len(families)), rates, yerr=(lows, highs),
            marker="o", capsize=2, linestyle="none", label=label,
        )
    ax.set_xticks(range(len(families)), families, rotation=45, ha="right")
    ax.set_ylim(-.05, 1.05)
    ax.set_xlabel("Task family")
    ax.set_ylabel("Verified success rate")
    ax.set_title("Core completion by task family")
    ax.grid(axis="y", alpha=.25)
    ax.legend()
    return fig


def plot_core_latency(groups, labels):
    """Render the family latency distribution and empirical 95th percentile."""
    import matplotlib.pyplot as plt

    families = sorted({case for _, case in groups})
    positions = list(range(1, len(families) + 1))
    fig, ax = plt.subplots(figsize=(12, 6), constrained_layout=True)
    for shift, (method, label) in zip((-.18, .18), labels.items()):
        values = [
            [max(float(row["metrics"]["controller_ms"]), 1e-6)
             for row in groups[(method, case)]]
            for case in families
        ]
        box_positions = [position + shift for position in positions]
        color = "#63a6a0" if method == "M01" else "#e48e55"
        ax.boxplot(
            values, positions=box_positions, widths=.28,
            showfliers=False, manage_ticks=False, patch_artist=True,
            boxprops={"facecolor": color, "alpha": .7},
            medianprops={"color": "#17222b", "linewidth": 1.4},
        )
        p95 = [sorted(group)[min(len(group) - 1, int(.95 * (len(group) - 1)))] for group in values]
        ax.scatter(box_positions, p95, marker="x", s=24, label=label + " p95")
    ax.set_yscale("log")
    ax.set_xticks(positions, families, rotation=45, ha="right")
    ax.set_xlabel("Task family")
    ax.set_ylabel("Controller time (ms, log scale)")
    ax.set_title("Decision latency across the same core episodes")
    ax.grid(axis="y", alpha=.25)
    ax.legend(ncol=2)
    return fig
