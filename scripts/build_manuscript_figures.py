#!/usr/bin/env python3
"""Build publication figures from the repository's hash-audited aggregates."""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "manuscripts" / "shared" / "figures"
COLORS = {"navy": "#18324B", "blue": "#2D6D9B", "teal": "#178F83", "gold": "#D28A24", "red": "#B84848", "gray": "#7D8992", "light": "#DCE5EA"}
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9, "axes.titlesize": 11, "axes.labelsize": 9,
                    "figure.facecolor": "white", "axes.facecolor": "white", "savefig.facecolor": "white",
                    "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True,
                    "grid.color": "#DCE5EA", "grid.linewidth": .6})


def source(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def save(fig, name: str):
    OUT.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    fig.savefig(OUT / f"{name}.pdf", bbox_inches="tight")
    plt.close(fig)


def main():
    research = source("data/derived/research.json")
    adequacy = source("data/derived/benchmark-adequacy.json")
    transfer = source("data/derived/semantic-transfer/report.json")
    events = source("data/derived/event-responses/report.json")
    routing = source("data/derived/semantic-routing-study/analysis.json")
    methods = research["core"]["methods"]
    ids = [m["method_id"] for m in methods]

    fig, ax = plt.subplots(figsize=(8.0, 4.0))
    rates = [100 * m["success_rate"] for m in methods]
    colors = [COLORS["teal"] if r == 100 else COLORS["red"] if m["method_id"] == "M12" else COLORS["blue"] for m, r in zip(methods, rates)]
    bars = ax.barh(ids, rates, color=colors)
    ax.invert_yaxis(); ax.set_xlim(0, 108); ax.set_xlabel("Verified task postconditions (%)")
    ax.set_title("Core task completion across all frozen methods")
    for bar, m in zip(bars, methods):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, f"{m['successes']}/{m['episodes']}", va="center", fontsize=8)
    save(fig, "core-success")

    fig, ax = plt.subplots(figsize=(8.0, 4.1))
    y = np.arange(len(methods)); p50 = np.array([m["decision_latency_ms"]["p50"] for m in methods]); p95 = np.array([m["decision_latency_ms"]["p95"] for m in methods])
    ax.hlines(y, p50, p95, color=COLORS["light"], linewidth=4); ax.scatter(p50, y, color=COLORS["blue"], label="p50", zorder=3); ax.scatter(p95, y, color=COLORS["gold"], label="p95", zorder=3)
    ax.set_yticks(y, ids); ax.invert_yaxis(); ax.set_xscale("log"); ax.set_xlabel("Decision latency (ms, logarithmic axis)"); ax.set_title("Decision-time distribution by controller")
    ax.legend(frameon=False, loc="lower right")
    save(fig, "core-latency")

    seed_rows = adequacy["methods"]
    fig, ax = plt.subplots(figsize=(8.0, 4.0))
    invariant = np.array([x["seed_invariant_case_variant_cells"] for x in seed_rows]); variable = np.array([x["seed_variable_case_variant_cells"] for x in seed_rows])
    ax.bar(ids, invariant, color=COLORS["light"], label="No binary outcome change over seeds")
    ax.bar(ids, variable, bottom=invariant, color=COLORS["gold"], label="Outcome varies over seeds")
    ax.set_ylim(0, 130); ax.set_ylabel("Case × variant cells (120 total)"); ax.set_title("Seed sensitivity is concentrated in a small method subset")
    ax.tick_params(axis="x", rotation=0); ax.legend(frameon=False, fontsize=8)
    save(fig, "seed-variation")

    failures = next(m["failed_by_case"] for m in methods if m["method_id"] == "M12")
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    ax.bar(list(failures), list(failures.values()), color=COLORS["red"])
    ax.set_ylim(0, max(failures.values(), default=1) + 5); ax.set_ylabel("Failed episodes"); ax.set_title("Every core M12 failure is assigned to long-job cancellation")
    save(fig, "m12-failures")

    ablations = research["ablations"]
    labels = ["Full M12"] + [k.replace("no_", "without ").replace("_", " ") for k in ablations]
    successes = [next(m["successes"] for m in methods if m["method_id"] == "M12")] + [next(iter(v["methods"]))["successes"] for v in ablations.values()]
    fig, ax = plt.subplots(figsize=(7.2, 3.2))
    ax.bar(labels, successes, color=[COLORS["navy"]] + [COLORS["blue"]] * (len(labels)-1))
    ax.set_ylim(1100, 1205); ax.set_ylabel("Verified successes / 1,200"); ax.set_title("All four component ablations retain the same task-success total")
    ax.tick_params(axis="x", rotation=12)
    save(fig, "m12-ablations")

    fit = [research["routing"]["M11"]["positive_fit_states"], research["routing"]["M12"]["positive_fit_states"]]
    fig, ax = plt.subplots(figsize=(6.4, 3.2))
    ax.bar(["M11 gate", "M12 gate"], fit, color=COLORS["gold"])
    ax.set_ylim(0, 10); ax.set_ylabel("Positive fit states (of 228)"); ax.set_title("The learned allocation gates had seven positive training states")
    for i, n in enumerate(fit): ax.text(i, n + .25, f"{n}/228", ha="center")
    save(fig, "gate-positive-states")

    tm = transfer["methods"]
    tids = [m["method_id"] for m in tm]
    fig, ax = plt.subplots(figsize=(8.0, 4.0))
    ts = [m["successes"] for m in tm]
    cols = [COLORS["teal"] if m["method_id"] == "M09" else COLORS["red"] if m["method_id"] == "M12" else COLORS["blue"] for m in tm]
    bars = ax.barh(tids, ts, color=cols); ax.invert_yaxis(); ax.set_xlim(0, 135); ax.set_xlabel("Verified successes (of 128)"); ax.set_title("Semantic-transfer outcomes, kept separate from the core benchmark")
    for bar, m in zip(bars, tm): ax.text(bar.get_width()+2, bar.get_y()+bar.get_height()/2, str(m["successes"]), va="center", fontsize=8)
    save(fig, "semantic-transfer-success")

    paired = transfer["m12_paired"]
    compares = ["M01", "M04", "M09"]
    wins = [paired[m].get("m12_wins", 128-paired[m].get("m12_losses",0)-paired[m]["ties"]) for m in compares]
    losses = [paired[m].get("m12_losses", 128-paired[m].get("m12_wins",0)-paired[m]["ties"]) for m in compares]
    ties = [paired[m]["ties"] for m in compares]
    fig, ax = plt.subplots(figsize=(6.8, 3.5))
    y=np.arange(len(compares)); ax.barh(y,wins,color=COLORS["teal"],label="M12 wins"); ax.barh(y,ties,left=wins,color=COLORS["light"],label="Tie"); ax.barh(y,losses,left=np.array(wins)+np.array(ties),color=COLORS["red"],label="M12 losses")
    ax.set_yticks(y, ["M12 vs "+x for x in compares]); ax.set_xlim(0,128); ax.set_xlabel("Paired transfer episodes (of 128)"); ax.set_title("Pairwise semantic-transfer outcomes"); ax.legend(frameon=False,ncol=3,fontsize=8)
    save(fig,"semantic-transfer-pairs")

    methods_event=events["methods"]
    selected=["M01","M12"]
    cols_event=["response_pass","contract_invariant_pass","reverify_pass","task_success_all_eligible"]
    fig,ax=plt.subplots(figsize=(7.2,3.8)); x=np.arange(len(cols_event)); width=.34
    for i,mid in enumerate(selected):
        values=[methods_event[mid][k] for k in cols_event]
        ax.bar(x+(i-.5)*width,values,width,label=mid,color=[COLORS["navy"],COLORS["red"]][i])
    ax.set_xticks(x,["Response\nselection","Contract\ninvariant","Re-verification","Task\nsuccess"]); ax.set_ylabel("Passing episodes (of 360)"); ax.set_title("Exploratory event audit separates response choice from final success"); ax.legend(frameon=False)
    save(fig,"event-response-audit")

    native=research["native_parity"]["results"]
    names=[x for x in native if x in {"M03","M04","M05","M07","M08","M12"}]
    errors=[native[x]["max_abs_probability_error"] for x in names]
    fig,ax=plt.subplots(figsize=(6.8,3.5)); ax.bar(names,errors,color=COLORS["blue"]); ax.axhline(1e-5,color=COLORS["red"],linestyle="--",label="declared tolerance")
    ax.set_yscale("log"); ax.set_ylabel("Maximum absolute probability error"); ax.set_title("Native export parity is numerical agreement, not outcome evidence"); ax.legend(frameon=False)
    save(fig,"native-export-parity")

    test=routing["test"]
    labels=["Fast M04","Planner M09","Hash half","Learned gate","Oracle ceiling"]
    keys=["always_fast_M04","always_planner_M09","hash_half","learned_gate","post_hoc_oracle_upper_bound"]
    values=[test[k]["verified_successes"] for k in keys]
    fig,ax=plt.subplots(figsize=(7.0,3.5)); ax.bar(labels,values,color=[COLORS["blue"],COLORS["gold"],COLORS["gray"],COLORS["red"],COLORS["teal"]])
    ax.set_ylim(0,12); ax.set_ylabel("Verified successes (of 32)"); ax.set_title("Post-hoc initial-arm routing audit remains exploratory")
    ax.tick_params(axis="x",rotation=12)
    save(fig,"routing-audit")

    print(f"built 11 figures from core index {research['core']['index_sha256']} and transfer index {transfer['index_sha256']}")


if __name__ == "__main__":
    main()
