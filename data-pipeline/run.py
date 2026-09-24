"""Product pipeline driver. Scientific algorithms belong to reflexmesh."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def export(source: Path, destination: Path) -> dict:
    spec = importlib.util.spec_from_file_location("artifact_checks", ROOT / "scripts" / "check_artifacts.py")
    checks = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checks)
    checks.validate(source)
    index_path = source / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("schema_version") != 1 or len(index.get("aggregate_results", [])) != 12:
        raise ValueError("export requires the complete 12-method evaluation index")
    destination.mkdir(parents=True, exist_ok=True)
    for entry in index["episodes"]:
        relative = Path(entry["path"])
        origin = (source / relative).resolve()
        target = (destination / relative).resolve()
        if (
            relative.is_absolute()
            or not origin.is_relative_to(source.resolve())
            or not target.is_relative_to(destination.resolve())
        ):
            raise ValueError("artifact path escapes its root")
        if hashlib.sha256(origin.read_bytes()).hexdigest() != entry["sha256"]:
            raise ValueError("source episode digest mismatch")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origin, target)
    shutil.copyfile(index_path, destination / "index.json")
    for name in ("lineage.json", "ablations.json", "external.json", "timing.json", "evaluation-report.json"):
        if (source / name).is_file():
            shutil.copyfile(source / name, destination / name)
    return {"episodes": len(index["episodes"]), "methods": len(index["aggregate_results"])}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("stage", choices=["collect", "train", "ppo", "gates", "evaluate", "export", "all"])
    parser.add_argument("--artifacts", type=Path, default=ROOT / "data" / "cache" / "science")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "derived")
    parser.add_argument("--model", default="qwen3.5:4b")
    parser.add_argument("--seeds", type=int, default=10)
    args = parser.parse_args(argv)
    if args.stage == "export":
        print(json.dumps(export(args.source or args.artifacts / "evaluation", args.output)))
        return 0
    stages = ["collect", "train", "ppo", "gates", "evaluate"] if args.stage == "all" else [args.stage]
    for stage in stages:
        subprocess.run(
            [
                sys.executable,
                "-m",
                "reflexmesh.pipeline",
                stage,
                "--artifacts",
                str(args.artifacts),
                "--model",
                args.model,
                "--seeds",
                str(args.seeds),
            ],
            check=True,
        )
    if args.stage == "all":
        export(args.artifacts / "evaluation", args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
