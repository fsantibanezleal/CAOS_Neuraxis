"""Execute the compound operation suite offline; never called by CI/deployment.

Use --output for a candidate bake, validate it, then promote the complete tree.
"""

import argparse
import json
import platform
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.services.operations import TASKS, VARIANTS, digest, encoded, execute_operation, fixture


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--seeds", type=int, default=3)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    target = args.output or ROOT / "data" / "operations"
    target.mkdir(parents=True, exist_ok=True)
    rows = []
    for task in TASKS:
        for variant in VARIANTS:
            for seed in range(args.seeds):
                with tempfile.TemporaryDirectory(prefix="neuraxis-evaluation-") as directory:
                    result = execute_operation(Path(directory), task, fixture(task, variant, 70000 + seed))
                run_id = f"{task}-{variant}-{70000 + seed}"
                raw = encoded(result)
                (target / (run_id + ".json")).write_bytes(raw)
                rows.append(
                    {
                        "run_id": run_id,
                        "task": task,
                        "variant": variant,
                        "seed": 70000 + seed,
                        "path": run_id + ".json",
                        "sha256": digest(raw),
                        "status": result["status"],
                        "disposition": result["disposition"],
                        "findings": len(result["findings"]),
                        **result["metrics"],
                    }
                )
                print(run_id, result["status"], len(result["findings"]), flush=True)
    index = {
        "schema_version": 1,
        "study": "compound file operations",
        "engine": "reflexmesh 0.1.1",
        "platform": platform.platform(),
        "policy": "verified-operation-fsm",
        "seeds": args.seeds,
        "source_sha256": {
            str(p.relative_to(ROOT)).replace("\\", "/"): digest(p.read_bytes())
            for p in [ROOT / "app/services/operations.py", Path(__file__)]
        },
        "runs": rows,
        "boundary": "Application integration and fault detection, separate from frozen learned-policy experiments. No model calls or learned superiority claimed.",
    }
    (target / "index.json").write_bytes(encoded(index))
    print(json.dumps({"runs": len(rows), "succeeded": sum(r["status"] == "succeeded" for r in rows)}))


if __name__ == "__main__":
    main()
