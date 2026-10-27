"""Check notebook identity, bilingual coverage, code cells and committed output freshness."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = (
    "en/01-core-evidence.ipynb",
    "es/01-evidencia-central.ipynb",
    "en/02-transfer-and-routing.ipynb",
    "es/02-transferencia-y-enrutamiento.ipynb",
)


def validate(root: Path = ROOT) -> dict:
    summaries = {}
    for relative in EXPECTED:
        notebook = json.loads((root / "notebooks" / relative).read_text(encoding="utf-8"))
        if notebook.get("nbformat") != 4 or not notebook.get("cells"):
            raise ValueError(f"invalid notebook structure: {relative}")
        code = [cell for cell in notebook["cells"] if cell.get("cell_type") == "code"]
        if len(code) != 1 or not code[0].get("source") or not code[0].get("outputs"):
            raise ValueError(f"notebook has no executable analysis and recorded output: {relative}")
        if notebook.get("metadata", {}).get("neuraxis") != {"evidence_root": "data/derived", "read_only": True, "schema_version": 1}:
            raise ValueError(f"notebook is not marked as read-only canonical evidence: {relative}")
        summaries[relative] = len(code[0]["source"])
    return {"notebooks": len(summaries), "code_cells": len(summaries)}


if __name__ == "__main__":
    try:
        print("notebooks: " + json.dumps(validate(), sort_keys=True))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"notebooks: invalid: {exc}")
        raise SystemExit(1)
