"""Validate the separate event-response audit, exact source hashes and scoring reproducibility."""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"data-pipeline"))
from pipeline.event_response import score_episode, summarize

def validate(root: Path=ROOT) -> dict:
    base=root/"data"/"derived"/"event-responses"
    index=json.loads((base/"index.json").read_text(encoding="utf-8"))
    report_path=base/"report.json"
    report_bytes=report_path.read_bytes()
    report=json.loads(report_bytes)
    if hashlib.sha256(report_bytes).hexdigest()!=index["report_sha256"]:
        raise ValueError("event-response report hash differs from its index")
    if index["source_episode_count"]!=report["coverage"]["episodes"]:
        raise ValueError("event-response index count differs from report")
    schema=json.loads((root/"docs/contracts/schemas/event-response-report.schema.json").read_text(encoding="utf-8"))
    Draft202012Validator(schema).validate(report)
    if len(report["coverage"]["episode_sha256"])!=4320:
        raise ValueError("event-response source manifest must bind all eligible episodes")
    rows=[]
    for name,digest in report["coverage"]["episode_sha256"].items():
        if Path(name).name!=name:
            raise ValueError("event-response source path is not a basename")
        path=root/"data"/"derived"/"episodes"/name
        raw=path.read_bytes()
        if hashlib.sha256(raw).hexdigest()!=digest:
            raise ValueError(f"changed source episode: {name}")
        scored=score_episode(json.loads(raw))
        if scored is None:
            raise ValueError(f"unsupported source episode: {name}")
        rows.append(scored)
    if summarize(rows)!=report["methods"]:
        raise ValueError("event-response scores do not reproduce from bound source episodes")
    manifest=(root/"frontend"/"src"/"data"/"event-response-manifest.ts").read_text(encoding="utf-8")
    if index["report_sha256"] not in manifest:
        raise ValueError("frontend report digest is stale")
    if report["coverage"]["events_observed"]+report["coverage"]["events_not_observed"]!=4320:
        raise ValueError("event-exposure denominator is incomplete")
    return {"eligible_episodes":4320,"events_observed":report["coverage"]["events_observed"],"methods":12,"cases":6,"report_sha256":index["report_sha256"]}

if __name__=="__main__":
    print("event-response audit: "+json.dumps(validate(),sort_keys=True))
