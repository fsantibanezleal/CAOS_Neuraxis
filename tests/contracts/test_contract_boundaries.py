"""Executable producer, consumer and provider-swap checks for the contract registry."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-pipeline"))

from pipeline.contracts import parse_catalog, referenced_paths  # noqa: E402


@pytest.fixture(scope="module")
def rows() -> list[dict[str, str]]:
    return parse_catalog((ROOT / "docs/contracts/catalog.md").read_text(encoding="utf-8"))


def test_producer_boundaries_exist(rows: list[dict[str, str]]) -> None:
    """Every producer is a real repository source or pinned external producer."""
    for row in rows:
        producer = row["producer"]
        if producer.startswith("external:"):
            assert "reflexmesh==0.1.2" in producer
            continue
        paths = referenced_paths(producer)
        assert paths, row["id"]
        assert all((ROOT / path).exists() for path in paths), row["id"]


def test_consumer_boundaries_exist(rows: list[dict[str, str]]) -> None:
    """Every consumer resolves to the application, release gate, or test that consumes it."""
    for row in rows:
        paths = referenced_paths(row["consumer"])
        assert paths, row["id"]
        assert all((ROOT / path).exists() for path in paths), row["id"]


def test_provider_swap_boundaries(rows: list[dict[str, str]]) -> None:
    """All replaceable providers name a supported kind and a concrete repository path."""
    allowed = {"stub", "simulator", "fixture", "baseline"}
    for row in rows:
        kind, separator, path = row["provider"].partition(":")
        assert separator and kind in allowed and path, row["id"]
        assert (ROOT / path).exists(), row["id"]
        if row.get("model io", "-") != "-":
            assert kind == "baseline", row["id"]


def test_missing_data_is_fail_closed(rows: list[dict[str, str]]) -> None:
    """Every contract states a concrete unavailable-data action, never an implicit success."""
    for row in rows:
        behavior = row["missing-data behavior"].lower()
        assert behavior.startswith("missing:") and any(
            phrase in behavior for phrase in ("fail", "block", "unavailable", "disable", "deny", "refuse")
        ), row["id"]
