"""Hash-verified export of the canonical 12-method matrix from an offline engine run."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def export(source: Path, destination: Path) -> dict:
    source = source.resolve(strict=True)
    destination = destination.resolve()
    spec = importlib.util.spec_from_file_location("neuraxis_artifact_checks", ROOT / "scripts" / "check_artifacts.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load the canonical artifact validator")
    checks = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checks)
    coverage = checks.validate(source)
    index_path = source / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    if index.get("schema_version") != 1 or len(index.get("aggregate_results", [])) != 12:
        raise ValueError("export requires the complete 12-method evaluation index")
    for entry in index["episodes"]:
        relative = Path(entry["path"])
        origin = (source / relative).resolve()
        target = (destination / relative).resolve()
        if relative.is_absolute() or not origin.is_relative_to(source) or not target.is_relative_to(destination):
            raise ValueError("artifact path escapes its root")
        raw = origin.read_bytes()
        if hashlib.sha256(raw).hexdigest() != entry["sha256"]:
            raise ValueError(f"source episode digest mismatch: {entry['run_id']}")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origin, target)
    destination.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(index_path, destination / "index.json")
    for name in ("lineage.json", "ablations.json", "external.json", "timing.json", "evaluation-report.json"):
        if (source / name).is_file():
            shutil.copyfile(source / name, destination / name)
    return {"episodes": len(index["episodes"]), "methods": len(index["aggregate_results"]), "coverage": coverage}
