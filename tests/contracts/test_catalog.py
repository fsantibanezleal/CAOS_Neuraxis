"""Contract catalog and readiness invariants."""

from __future__ import annotations

import json
import hashlib
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-pipeline"))

from pipeline.contracts import parse_catalog, resolve_local  # noqa: E402
from pipeline.readiness import build_readiness  # noqa: E402


def test_catalog_paths_schemas_versions_and_readiness_are_current() -> None:
    catalog = (ROOT / "docs/contracts/catalog.md").read_text(encoding="utf-8")
    rows = parse_catalog(catalog)
    assert len(rows) >= 12
    assert all(not resolve_local(ROOT, row[field]) for row in rows for field in ("schema", "producer", "consumer", "validator"))
    locked = json.loads((ROOT / "docs/contracts/versions.lock.json").read_text(encoding="utf-8"))
    assert locked == {
        row["id"]: {
            "version": row["version"],
            "schema": row["schema"].strip().strip("`"),
            "sha256": hashlib.sha256((ROOT / row["schema"].strip().strip("`")).read_bytes().replace(b"\r\n", b"\n")).hexdigest(),
        }
        for row in rows
    }
    assert build_readiness(ROOT) == json.loads((ROOT / "data/derived/readiness.json").read_text(encoding="utf-8"))
    assert all(item["state"] == "available" for item in build_readiness(ROOT)["contracts"])


@pytest.mark.parametrize("path", ["../outside", "../../etc/passwd", "C:/outside/file"])
def test_catalog_rejects_paths_outside_repository(path: str) -> None:
    with pytest.raises(ValueError, match="escapes"):
        resolve_local(ROOT, f"`{path}`")


def test_catalog_rejects_duplicate_contract_ids() -> None:
    text = (ROOT / "docs/contracts/catalog.md").read_text(encoding="utf-8")
    duplicate = text.replace("| canonical-index |", "| product-metadata |", 1)
    with pytest.raises(ValueError, match="unique"):
        parse_catalog(duplicate)
