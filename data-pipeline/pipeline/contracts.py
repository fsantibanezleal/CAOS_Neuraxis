"""Strict reader and local path checks for the versioned product contract catalog."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG = Path("docs/contracts/catalog.md")
HEADER = ("id", "version", "scope", "schema", "producer", "consumer", "validator", "status")
BACKTICK_PATH = re.compile(r"`([^`]+)`")


def parse_catalog(text: str) -> list[dict[str, str]]:
    lines = text.replace("\r\n", "\n").splitlines()
    try:
        start = lines.index("## Contracts")
    except ValueError as exc:
        raise ValueError("catalog must contain a ## Contracts table") from exc
    rows: list[list[str]] = []
    for line in lines[start + 1 :]:
        if line.startswith("## "):
            break
        if line.startswith("|"):
            rows.append([cell.strip() for cell in line.strip().strip("|").split("|")])
    if len(rows) < 3 or not set(HEADER).issubset({cell.lower() for cell in rows[0]}):
        raise ValueError("catalog table must include the legacy runtime columns and contract rows")
    columns = tuple(cell.lower() for cell in rows[0])
    result = []
    for number, cells in enumerate(rows[2:], start=1):
        if len(cells) != len(columns):
            raise ValueError(f"catalog row {number} has {len(cells)} cells, expected {len(columns)}")
        row = dict(zip(columns, cells, strict=True))
        if any(not value for value in row.values()):
            raise ValueError(f"catalog row {row['id'] or number} contains a blank cell")
        if not re.fullmatch(r"[a-z][a-z0-9-]+", row["id"]):
            raise ValueError(f"invalid contract id: {row['id']!r}")
        if not re.fullmatch(r"\d+\.\d+\.\d+", row["version"]):
            raise ValueError(f"invalid contract version for {row['id']}: {row['version']!r}")
        if row["status"] not in {"real", "active"}:
            raise ValueError(f"invalid status for {row['id']}: {row['status']!r}")
        result.append(row)
    ids = [row["id"] for row in result]
    if len(ids) != len(set(ids)):
        raise ValueError("contract ids must be unique")
    return result


def referenced_paths(value: str) -> list[str]:
    """Return backtick-delimited local paths, excluding explicit external package references."""
    found = []
    for match in BACKTICK_PATH.finditer(value):
        path = match.group(1).strip()
        if path in {"-", "reflexmesh==0.1.2", "external:reflexmesh==0.1.2"}:
            continue
        if path.startswith("external:"):
            continue
        found.append(path)
    return found


def resolve_local(root: Path, value: str) -> list[str]:
    """Reject absolute or escaping paths and return absent paths relative to root."""
    missing = []
    for raw in referenced_paths(value):
        candidate = Path(raw)
        if candidate.is_absolute() or ".." in candidate.parts:
            raise ValueError(f"contract path escapes the repository: {raw}")
        resolved = (root / candidate).resolve()
        if not resolved.is_relative_to(root.resolve()):
            raise ValueError(f"contract path escapes the repository: {raw}")
        if not resolved.exists():
            missing.append(candidate.as_posix())
    return missing
