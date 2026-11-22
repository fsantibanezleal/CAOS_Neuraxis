#!/usr/bin/env python3
"""Regenerate manuscript result tables from audited Neuraxis JSON reports."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def esc(value: object) -> str:
    return str(value).replace("_", r"\\_")

def method(rows: list[dict], key: str) -> dict:
    return next(row for row in rows if row["method_id"] == key)

def pct(successes: int, episodes: int) -> str:
    return f"{100 * successes / episodes:.2f}\\%"

def table(label: str, caption: str, columns: str, head: str, rows: list[str]) -> str:
    slash = chr(92)
    row = slash * 2
    body = slash + "begin{table}[H]" + slash + "centering" + slash + "small" + "\n"
    body += slash + "begin{tabularx}{.96" + slash + "linewidth}{" + columns + "}" + slash + "toprule" + "\n"
    body += head + row + slash + "midrule" + "\n"
    body += (row + "\n").join(rows) + row + slash + "bottomrule" + "\n"
    body += slash + "end{tabularx}" + slash + "caption{" + caption + "}" + slash + "label{" + label + "}" + slash + "end{table}"
    return body

def main() -> None:
    research = read("data/derived/research.json")
    semantic = read("data/derived/semantic-transfer/report.json")
    event = read("data/derived/event-responses/report.json")
    core = research["core"]["methods"]
    structural = research["transfer"]["methods"]
    sem_methods = semantic["methods"]
    m12_core = method(core, "M12")
    m12_struct = method(structural, "M12")
    m12_sem = method(sem_methods, "M12")
    lane_rows = [
        f"Core & {m12_core['episodes']:,} & {m12_core['successes']:,} & M01 records {method(core,'M01')['successes']:,} verified successes",
        f"Structural transfer & {m12_struct['episodes']:,} & {m12_struct['successes']:,} & M04 records {method(structural,'M04')['successes']:,} verified successes",
        f"Semantic transfer & {m12_sem['episodes']:,} & {m12_sem['successes']:,} & M09 records {method(sem_methods,'M09')['successes']:,} verified successes",
    ]
    out = [table("tab:lane-results", "M12 success by evaluation lane, preserving separate denominators and the strongest measured comparator in each frozen population.", "lrrX", "Lane & Scheduled & M12 & Comparator result", lane_rows)]
    selected = ["M01", "M04", "M11", "M12"]
    latency_rows=[]
    for mid in selected:
        x=method(core,mid)
        names={"M01":"Guarded finite-state", "M04":"XGBoost", "M11":"Cost-sensitive deferral", "M12":"Proposed metacontroller"}
        latency_rows.append(f"{names[mid]} & {x['successes']:,} & {x['decision_latency_ms']['p50']:.4f} & {x['decision_latency_ms']['p95']:.4f}")
    out.append(table("tab:latency-results", "Success and recorded policy decision latency for representative core controllers from the same frozen benchmark population.", "lrrX", "Core method & Successes & p50 ms & p95 ms", latency_rows))
    core_rows=[]
    for mid in selected:
        x=method(core,mid)
        names={"M01":"Guarded finite-state", "M04":"XGBoost", "M11":"Cost-sensitive deferral", "M12":"Proposed metacontroller"}
        core_rows.append(f"{names[mid]} & {x['successes']:,}/{x['episodes']:,} & {pct(x['successes'],x['episodes'])} & {x['contract_violations']}")
    out.append(table("tab:core-results", "Verified task success and contract violations for representative controllers on the full 1,200-episode core population.", "lrrX", "Core method & Successes & Rate & Contract violations", core_rows))
    ablation_names={"full":"Full composite", "no_memory":"No memory", "no_effects":"No effect model", "no_deferral":"No deferral", "no_invalidation":"No invalidation"}
    full=m12_core["successes"]
    ablation_rows=[f"Full composite & {full:,} & 0 & Reference method"]
    for key,name in ablation_names.items():
        if key=="full": continue
        x=research["ablations"][key]["methods"][0]
        ablation_rows.append(f"{name} & {x['successes']:,} & {x['successes']-full:+,} & {x['episodes']:,} scheduled episodes")
    out.append(table("tab:ablation-results", "Core success totals for the full controller and four one-component ablations, with task-success changes against the same frozen cells.", "lrrX", "M12 configuration & Successes & Delta & Evaluation denominator", ablation_rows))
    pair=semantic["m12_paired"]
    paired_rows=[]
    for mid,name in [("M09","Direct planner"),("M04","Boosted policy")]:
        x=pair[mid]
        wins=x["m12_wins"]; losses=x.get("m12_losses",128-wins-x["ties"]); ties=x["ties"]
        paired_rows.append(f"M12 versus {name} & {wins} & {ties} & {losses}")
    out.append(table("tab:semantic-pairs", "Paired outcomes for M12 against measured methods on matched semantic-transfer cases, separate from the 14,400-episode core denominator.", "lrrX", "Paired comparison & Wins & Ties & Losses", paired_rows))
    event_rows=[]
    for mid in ("M01","M12"):
        x=event["methods"][mid]
        event_rows.append(f"{mid} & {x['eligible_episodes']:,} & {x['events_observed']:,} & {x['response_pass']:,} & {x['reverify_pass']:,} & {x['task_success_all_eligible']:,}")
    out.append(table("tab:event-response-counts", "Exploratory response checks and verified completion over eligible frozen episodes, with their distinct event and task denominators.", "lrrrrr", "Method & Eligible & Events & Response passes & Reverified & Goal success", event_rows))
    target=ROOT/"manuscripts/neuraxis-technical-report/results-tables.tex"
    target.write_text("\n\n".join(out)+"\n",encoding="utf-8",newline="\n")
    print(f"generated {len(out)} result tables from hashed JSON report sources: {target.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
