from __future__ import annotations

from pathlib import Path

from contract_schemas import errors

ROOT = Path(__file__).resolve().parents[2]


def test_product_contract_schema_accepts_current_metadata() -> None:
    import json

    document = json.loads((ROOT / "product.json").read_text(encoding="utf-8"))
    assert errors("docs/contracts/schemas/product.schema.json", document) == []


def test_schema_errors_identify_invalid_contract_fields() -> None:
    found = errors("docs/contracts/schemas/readiness.schema.json", {"schema": "wrong"})
    assert found
    assert any("product_version" in error for error in found)


def test_semantic_index_resolves_the_shared_episode_reference_offline() -> None:
    from contract_schemas import errors

    reference = {
        "run_id": "M01-D01-nominal-1",
        "case_id": "D01",
        "method_id": "M01",
        "variant": "nominal",
        "seed": 1,
        "status": "succeeded",
        "path": "episodes/M01-D01-nominal-1.json",
        "sha256": "a" * 64,
    }
    document = {
        "schema_version": 1,
        "provenance": {"split": "semantic_transfer", "lineage": {}, "lineage_signature": "a" * 64},
        "methods": [{}] * 12,
        "cases": [{}] * 8,
        "episodes": [reference] * 1536,
        "aggregate_results": [{}] * 12,
    }
    assert errors("semantic-index", document) == []
