"""Create a separately indexed event-response audit of frozen episodes."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "data-pipeline"))
from pipeline.event_response import CONTRACTS, score_episode, summarize  # noqa: E402

SOURCE = ROOT / "data" / "derived" / "episodes"
TARGET = ROOT / "data" / "derived" / "event-responses"
GENERATED_AT = "2026-11-02T03:10:46.269687+00:00"


def main() -> int:
    rows = []
    digests = {}
    files_by_case = Counter()
    case_ids = {item.case_id for item in CONTRACTS}
    for path in sorted(SOURCE.glob("*.json")):
        if not any(f"-{case}-" in path.name for case in case_ids) or not re.search(r"-400\d{2}\.json$", path.name):
            continue
        episode = json.loads(path.read_text(encoding="utf-8"))
        if episode.get("case_id") not in {item.case_id for item in CONTRACTS}:
            continue
        row = score_episode(episode)
        if row is not None:
            rows.append(row)
            digests[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
            files_by_case[row["case_id"]] += 1

    methods = sorted({row["method_id"] for row in rows})
    if len(methods) != 12 or any(files_by_case[c.case_id] == 0 for c in CONTRACTS):
        raise SystemExit(f"coverage failure: {len(methods)} methods; per-case={dict(files_by_case)}")

    report = {
        "schema_version": 1,
        "study": "event-response-audit",
        "status": "exploratory_posthoc",
        "generated_at": GENERATED_AT,
        "source": "immutable test-split episode JSON; original denominators unchanged",
        "contract_source": "documented native case effect and independent verifier behavior",
        "contracts": [
            {
                "case_id": c.case_id,
                "trigger": c.event,
                "required_response": c.response_action,
                "preservation": c.preserve,
                "verification": c.verify,
            }
            for c in CONTRACTS
        ],
        "dimensions": ["response", "contract_invariants", "reverify", "task_success", "violations"],
        "coverage": {
            "episodes": len(rows),
            "methods": len(methods),
            "cases": len(files_by_case),
            "episodes_by_case": dict(sorted(files_by_case.items())),
            "events_observed": sum(row["event_observed"] for row in rows),
            "events_not_observed": sum(not row["event_observed"] for row in rows),
            "episode_sha256": digests,
        },
        "methods": summarize(rows),
        "limitations": [
            "This is exploratory post-hoc scoring of an existing test split, not a preregistered confirmatory result.",
            "Contracts were operationalized from the documented fixture effects and verifiers; they are not evaluator-only labels from independently authored new tasks.",
            "The six selected cases do not represent all asynchronous software events, user changes, or production workloads.",
            "The score does not establish controller novelty, superiority, real-time guarantees, or safety outside these fixtures.",
            "Counts from this study are not added to the frozen 14,400-episode core or any transfer denominator.",
        ],
    }
    TARGET.mkdir(parents=True, exist_ok=True)
    report_path = TARGET / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    index = {
        "schema_version": 1,
        "study": "event-response-audit",
        "report": "report.json",
        "report_sha256": hashlib.sha256(report_path.read_bytes()).hexdigest(),
        "source_episode_count": len(rows),
        "contract_cases": sorted(files_by_case),
        "status": report["status"],
    }
    (TARGET / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"index": index, "coverage": {k: report["coverage"][k] for k in ("episodes", "methods", "cases", "events_observed", "events_not_observed")}, "methods": {k: {n: v[n] for n in ("eligible_episodes", "events_observed", "response_pass", "contract_invariant_pass", "reverify_pass", "task_success_all_eligible", "violations_all_eligible")} for k, v in report["methods"].items()}}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
