"""Template guard adapter for Neuraxis' catalog-derived readiness contract."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from ..readiness import build_readiness

SCHEMA = "neuraxis.readiness/v1"


def compute(*, repo_root: Path, derived_root: Path, models_dir: Path) -> dict[str, Any]:
    """Expose the template's call shape while retaining the product's readiness semantics."""
    del derived_root, models_dir
    result = build_readiness(repo_root)
    result["schema"] = SCHEMA
    return result
