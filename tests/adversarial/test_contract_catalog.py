"""Fail-closed tests for malformed and tampered contract metadata."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-pipeline"))

from pipeline.contracts import parse_catalog, resolve_local  # noqa: E402
from pipeline.readiness import build_readiness  # noqa: E402


def test_duplicate_ids_are_rejected() -> None:
    source = (ROOT / "docs/contracts/catalog.md").read_text(encoding="utf-8")
    changed = source.replace("| canonical-index |", "| product-metadata |", 1)
    with pytest.raises(ValueError, match="unique"):
        parse_catalog(changed)


def test_absolute_and_parent_traversal_paths_are_rejected() -> None:
    for value in ("`../secret`", "`/etc/passwd`", "`C:/Users/secret`", "`docs/../../secret`"):
        with pytest.raises(ValueError, match="escapes"):
            resolve_local(ROOT, value)


def test_readiness_digest_changes_when_catalog_changes(tmp_path: Path) -> None:
    (tmp_path / "docs/contracts").mkdir(parents=True)
    (tmp_path / "docs/contracts/catalog.md").write_bytes((ROOT / "docs/contracts/catalog.md").read_bytes())
    (tmp_path / "VERSION").write_bytes((ROOT / "VERSION").read_bytes())
    original = build_readiness(tmp_path)
    catalog = tmp_path / "docs/contracts/catalog.md"
    catalog.write_text(catalog.read_text(encoding="utf-8") + "\nTampered catalog.\n", encoding="utf-8")
    changed = build_readiness(tmp_path)
    assert original["catalog_sha256"] != changed["catalog_sha256"]
