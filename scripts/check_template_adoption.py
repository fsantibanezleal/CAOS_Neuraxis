"""Verify the concrete CAOS product-template structures declared for Neuraxis."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FEATURES = (
    "benchmark-adequacy",
    "evidence-workbench",
    "operational-workbench",
    "reliability-audit",
    "static-release",
    "workspace-operation",
    "notebooks",
)
ARCHITECTURE = tuple(f"docs/architecture/{index:02d}-" for index in range(1, 9))
NOTEBOOK_LANGUAGES = ("en", "es")
EXPECTED_NOTEBOOKS_PER_LANGUAGE = 19
EXPECTED_NOTEBOOK_LEVELS = {"01-fast-event-control": (1, 2, 3), "02-learned-action-policies": (1, 2, 3),
                           "03-sequential-control": (1, 2, 3), "04-deliberation-allocation": (1, 2, 3, 4),
                           "05-evaluation-and-transfer": (1, 2, 3), "06-ablation-and-export-parity": (1, 2, 3)}


def validate(root: Path = ROOT) -> dict:
    product = json.loads((root / "product.json").read_text(encoding="utf-8"))
    app_version = (root / "VERSION").read_text(encoding="utf-8").strip()
    if product.get("version") != app_version:
        raise ValueError("product.json version differs from VERSION")
    package = json.loads((root / "frontend/package.json").read_text(encoding="utf-8"))
    parts = app_version.split(".")
    expected_frontend_version = ".".join(str(int(part)) for part in parts)
    if package.get("version") != expected_frontend_version:
        raise ValueError("frontend package version does not correspond to product version")
    target = (root / "deploy/TARGET").read_text(encoding="utf-8")
    required = ("target:", "hostname:", "static:", "service:", "source_visibility: public")
    if any(token not in target for token in required):
        raise ValueError("deploy/TARGET omits required public topology fields")
    if re.search(r"(?i)(password|token|secret|private[_ -]?key)\s*[:=]\s*\S+", target):
        raise ValueError("deploy/TARGET must not contain credentials")
    missing_features = [name for name in FEATURES if not (root / f"docs/design/features/{name}/validation.md").is_file()]
    if missing_features:
        raise ValueError("feature validation is missing: " + ", ".join(missing_features))
    missing_architecture = [prefix for prefix in ARCHITECTURE if not any(p.name.startswith(prefix.split("/")[-1]) for p in (root / "docs/architecture").glob("*.md"))]
    if missing_architecture:
        raise ValueError("architecture wiki pages are missing: " + ", ".join(missing_architecture))
    notebook_trees = {}
    for language in NOTEBOOK_LANGUAGES:
        base = root / "notebooks" / language
        notebook_trees[language] = {
            path.relative_to(base).as_posix(): path
            for path in base.rglob("*.ipynb")
            if path.is_file()
        }
        if len(notebook_trees[language]) != EXPECTED_NOTEBOOKS_PER_LANGUAGE:
            raise ValueError(
                f"{language} notebook tree has {len(notebook_trees[language])} lessons; "
                f"expected {EXPECTED_NOTEBOOKS_PER_LANGUAGE} (six topics by three levels)"
            )
    if set(notebook_trees["en"]) != set(notebook_trees["es"]):
        raise ValueError("English and Spanish notebook paths do not mirror")
    for language, tree in notebook_trees.items():
        for rel, path in tree.items():
            notebook = json.loads(path.read_text(encoding="utf-8"))
            level = notebook.get("metadata", {}).get("caos", {}).get("level")
            if level not in {1, 2, 3, 4}:
                raise ValueError(f"{language}/{rel} has missing or unsupported lesson level {level!r}")
        for topic in {Path(rel).parent for rel in tree}:
            levels = sorted(
                json.loads(path.read_text(encoding="utf-8")).get("metadata", {}).get("caos", {}).get("level")
                for rel, path in tree.items()
                if Path(rel).parent == topic
            )
            expected_levels = list(EXPECTED_NOTEBOOK_LEVELS.get(topic.as_posix(), (1, 2, 3)))
            if levels != expected_levels:
                raise ValueError(f"{language}/{topic.as_posix()} has levels {levels}; expected {expected_levels}")
    catalog = root / "docs/contracts/catalog.md"
    if not catalog.is_file() or not (root / "docs/contracts/versions.lock.json").is_file():
        raise ValueError("contract catalog or version lock is missing")
    if not (root / "data-pipeline/pipeline/__init__.py").is_file() or not (root / "data-pipeline/pipeline/runner.py").is_file():
        raise ValueError("pipeline orchestration package is incomplete")
    if not (root / "tests/contracts/test_catalog.py").is_file() or not (root / "tests/adversarial/test_contract_catalog.py").is_file():
        raise ValueError("contract and adversarial test suites are required")
    return {
        "features": len(FEATURES),
        "architecture_pages": len(ARCHITECTURE),
        "notebooks": sum(map(len, notebook_trees.values())),
        "target": "vps-static+vps-service",
    }


if __name__ == "__main__":
    try:
        print("template adoption: " + json.dumps(validate(), sort_keys=True))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"template adoption: invalid: {exc}")
        raise SystemExit(1)
