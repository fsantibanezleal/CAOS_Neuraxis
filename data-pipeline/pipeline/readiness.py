"""Deterministic product readiness derived from the catalog and current source tree."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from .contracts import CATALOG, parse_catalog, resolve_local

ROOT = Path(__file__).resolve().parents[2]


def build_readiness(root: Path = ROOT) -> dict:
    root = root.resolve()
    catalog_path = root / CATALOG
    raw = catalog_path.read_bytes().replace(b"\r\n", b"\n")
    rows = parse_catalog(raw.decode("utf-8"))
    contracts = []
    for row in rows:
        # Schema, producer, consumer and validator cells all declare the executable evidence boundary.
        missing_paths = sorted(
            {
                path
                for key in ("schema", "producer", "consumer", "validator")
                for path in resolve_local(root, row[key])
            }
        )
        state = "missing" if row["status"] == "active" and missing_paths else "partial" if missing_paths else "available"
        if state == "available":
            reason = None
        else:
            reason = {
                "en": f"Missing contract evidence: {', '.join(missing_paths)}.",
                "es": f"Falta evidencia del contrato: {', '.join(missing_paths)}.",
            }
        contracts.append(
            {
                "id": row["id"],
                "version": row["version"],
                "state": state,
                "evidence": [
                    path
                    for key in ("schema", "producer", "consumer", "validator")
                    for path in referenced_paths_for_readiness(row[key])
                ],
                "missing": missing_paths,
                "reason": reason,
            }
        )
    return {
        "schema": "neuraxis.readiness/v1",
        "schema_version": 1,
        "product_version": (root / "VERSION").read_text(encoding="utf-8").strip(),
        "catalog_sha256": hashlib.sha256(raw).hexdigest(),
        "contracts": contracts,
    }


def referenced_paths_for_readiness(value: str) -> list[str]:
    from .contracts import referenced_paths

    return referenced_paths(value)


def write_readiness(root: Path = ROOT) -> dict:
    result = build_readiness(root)
    destination = root / "data" / "derived" / "readiness.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(result, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    destination.write_bytes(payload)
    return result
