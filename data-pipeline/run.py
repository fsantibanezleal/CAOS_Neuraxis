"""Product pipeline driver. Scientific algorithms belong to reflexmesh."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from core.validation import check_document


def _load_checks():
    spec = importlib.util.spec_from_file_location("artifact_checks", ROOT / "scripts" / "check_artifacts.py")
    checks = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checks)
    return checks


def validate_export_documents(index: dict, lineage: dict) -> None:
    """The documents export copies are checked against their schemas before anything is written."""
    check_document("episode-index", index, "index.json")
    check_document("lineage", lineage, "lineage.json")


def export(source: Path, destination: Path) -> dict:
    _load_checks().validate(source)
    index_path = source / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("schema_version") != 1 or len(index.get("aggregate_results", [])) != 12:
        raise ValueError("export requires the complete 12-method evaluation index")
    lineage_path = source / "lineage.json"
    validate_export_documents(index, json.loads(lineage_path.read_text(encoding="utf-8")))
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
    parser.add_argument("stage", choices=["collect", "train", "ppo", "gates", "evaluate", "export", "readiness", "import-evidence", "all"])
    parser.add_argument("--artifacts", type=Path, default=ROOT / "data" / "cache" / "science")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "derived")
    parser.add_argument("--model", default="qwen3.5:4b")
    parser.add_argument("--seeds", type=int, default=10)
    parser.add_argument("--out", type=Path, default=ROOT, help="import-evidence: the root the documents are written under")
    parser.add_argument("--offline", type=Path, help="import-evidence: a reflexmesh checkout at the pinned commit, read instead of the network")
    parser.add_argument("--provenance", type=Path, default=ROOT / "docs" / "contracts" / "evidence-provenance.json")
    args = parser.parse_args(argv)
    if args.stage == "export":
        print(json.dumps(export(args.source or args.artifacts / "evaluation", args.output)))
        return 0
    if args.stage == "import-evidence":
        from core import evidence

        try:
            commits = {e["engine_commit"] for e in evidence.load_provenance(args.provenance)}
            read = evidence.offline_reader(args.offline, commits.pop()) if args.offline else evidence.online_reader()
            summary = evidence.import_evidence(args.provenance, args.out, read)
        except ValueError as exc:
            print(f"import-evidence: {exc}", file=sys.stderr)
            return 1
        print(json.dumps({"documents": summary["documents"], "out": str(args.out)}))
        return 0
    if args.stage == "readiness":
        # computed from docs/contracts/catalog.md and the committed documents: no bake, no training stack
        from core import readiness

        doc = readiness.compute(repo_root=ROOT, data_root=args.output.parent)
        written = readiness.write(args.output, doc)
        print(json.dumps({"readiness": os.path.relpath(args.output / "readiness.json", ROOT).replace(os.sep, "/"),
                          "bytes": written, "states": sorted({e["state"] for e in doc["contracts"]})}))
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
