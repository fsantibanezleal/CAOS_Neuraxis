"""Reproducible stage runner; science stays in reflexmesh and product checks stay in this repository."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from .export import export
from .readiness import write_readiness

ROOT = Path(__file__).resolve().parents[2]
ENGINE_STAGES = ("collect", "train", "ppo", "gates", "evaluate")
STAGES = (*ENGINE_STAGES, "export", "readiness", "all")


def run_engine_stage(stage: str, artifacts: Path, model: str, seeds: int) -> None:
    if stage not in ENGINE_STAGES:
        raise ValueError(f"unknown engine stage: {stage}")
    subprocess.run(
        [
            sys.executable,
            "-m",
            "reflexmesh.pipeline",
            stage,
            "--artifacts",
            str(artifacts),
            "--model",
            model,
            "--seeds",
            str(seeds),
        ],
        cwd=ROOT,
        check=True,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("stage", choices=STAGES)
    parser.add_argument("--artifacts", type=Path, default=ROOT / "data" / "cache" / "science")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "derived")
    parser.add_argument("--model", default="qwen3.5:4b")
    parser.add_argument("--seeds", type=int, default=10)
    args = parser.parse_args(argv)
    if args.seeds < 1:
        parser.error("--seeds must be positive")
    if args.stage == "readiness":
        print(json.dumps(write_readiness(), ensure_ascii=False, sort_keys=True))
        return 0
    if args.stage == "export":
        print(json.dumps(export(args.source or args.artifacts / "evaluation", args.output), sort_keys=True))
        return 0
    stages = ENGINE_STAGES if args.stage == "all" else (args.stage,)
    for stage in stages:
        run_engine_stage(stage, args.artifacts, args.model, args.seeds)
    if args.stage == "all":
        print(json.dumps(export(args.artifacts / "evaluation", args.output), sort_keys=True))
        print(json.dumps(write_readiness(), ensure_ascii=False, sort_keys=True))
    return 0
