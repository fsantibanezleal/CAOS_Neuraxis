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
)
ARCHITECTURE = tuple(f"docs/architecture/{index:02d}-" for index in range(1, 9))
NOTEBOOKS = (
    "notebooks/en/01-fast-event-control/01-the-problem-and-the-data.ipynb",
    "notebooks/es/01-fast-event-control/01-the-problem-and-the-data.ipynb",
    "notebooks/en/05-evaluation-and-transfer/03-state-of-the-art-comparison.ipynb",
    "notebooks/es/05-evaluation-and-transfer/03-state-of-the-art-comparison.ipynb",
)


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
    missing_notebooks = [path for path in NOTEBOOKS if not (root / path).is_file()]
    if missing_notebooks:
        raise ValueError("notebooks are missing: " + ", ".join(missing_notebooks))
    catalog = root / "docs/contracts/catalog.md"
    if not catalog.is_file() or not (root / "docs/contracts/versions.lock.json").is_file():
        raise ValueError("contract catalog or version lock is missing")
    if not (root / "data-pipeline/pipeline/__init__.py").is_file() or not (root / "data-pipeline/pipeline/runner.py").is_file():
        raise ValueError("pipeline orchestration package is incomplete")
    if not (root / "tests/contracts/test_catalog.py").is_file() or not (root / "tests/adversarial/test_contract_catalog.py").is_file():
        raise ValueError("contract and adversarial test suites are required")
    return {"features": len(FEATURES), "architecture_pages": len(ARCHITECTURE), "notebooks": len(NOTEBOOKS), "target": "vps-static+vps-service"}


if __name__ == "__main__":
    try:
        print("template adoption: " + json.dumps(validate(), sort_keys=True))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"template adoption: invalid: {exc}")
        raise SystemExit(1)
