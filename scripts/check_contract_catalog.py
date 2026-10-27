"""Verify contract IDs, versions, schemas and validation references against repository files."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "data-pipeline"))

from pipeline.contracts import CATALOG, parse_catalog, resolve_local  # noqa: E402


def validate(root: Path = ROOT) -> dict:
    rows = parse_catalog((root / CATALOG).read_text(encoding="utf-8"))
    missing = []
    for row in rows:
        for field in ("schema", "producer", "consumer", "validator"):
            missing.extend((row["id"], field, path) for path in resolve_local(root, row[field]))
    product = json.loads((root / "product.json").read_text(encoding="utf-8"))
    if product["visibility"] != "public" or product["license"] != "Apache-2.0":
        raise ValueError("product metadata must match the public repository and declared license")
    lock = json.loads((root / "docs/contracts/versions.lock.json").read_text(encoding="utf-8"))
    versions = {row["id"]: row["version"] for row in rows}
    if lock.get("contracts") != versions:
        raise ValueError("contract version lock differs from the catalog")
    schemas = sorted((root / "docs/contracts/schemas").glob("*.schema.json"))
    for schema in schemas:
        parsed = json.loads(schema.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(parsed)
    product_schema = json.loads((root / "docs/contracts/schemas/product.schema.json").read_text(encoding="utf-8"))
    Draft202012Validator(product_schema).validate(product)
    readiness_schema = json.loads((root / "docs/contracts/schemas/readiness.schema.json").read_text(encoding="utf-8"))
    readiness = json.loads((root / "data/derived/readiness.json").read_text(encoding="utf-8"))
    Draft202012Validator(readiness_schema).validate(readiness)
    if missing:
        detail = "; ".join(f"{contract}/{field}: {path}" for contract, field, path in missing)
        raise ValueError("missing contract references: " + detail)
    return {"contracts": len(rows), "schemas": len(schemas)}


if __name__ == "__main__":
    try:
        print("contract catalog: " + json.dumps(validate(), sort_keys=True))
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"contract catalog: invalid: {exc}")
        raise SystemExit(1)
