"""Validation at every writer: a document is checked against the schema file its catalog row names before it is written
(docs/contracts/catalog.md, Contracts). The schema registry is the contract tests' own (``tests/contracts/
contract_schemas.py``), loaded from the repository so there is one source of every shape; it needs ``jsonschema``
(requirements-dev.txt, requirements-api.txt)."""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]


def _schemas():
    path = str(ROOT / "tests" / "contracts")
    if path not in sys.path:
        sys.path.insert(0, path)
    import contract_schemas

    return contract_schemas


def check_document(name: str, document: Any, label: str) -> None:
    """Raise ValueError naming ``label`` and every field path when ``document`` departs from schema ``name``."""
    problems = _schemas().errors(name, document)
    if problems:
        shown = "; ".join(problems[:5]) + (f"; and {len(problems) - 5} more" if len(problems) > 5 else "")
        raise ValueError(f"{label}: refused, it departs from the {name} schema: {shown}")
