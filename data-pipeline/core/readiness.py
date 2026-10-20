"""The readiness document (catalog row readiness, ADR-0080 decisions 3 and 4): what is real in this build, computed from
docs/contracts/catalog.md and the repository state, never written by hand.

A pure function of its inputs: no clock, no randomness, rows in catalog order, ``missing`` sorted. The rules, their order
(first match wins) and their reasons are the catalog's ``## Missing-data states`` table; tests/contracts/test_readiness.py
parses that table and holds every reason here to it. Stdlib only, so scripts/check_readiness.py runs in CI without the
training stack (no numpy, no torch, no reflexmesh) and without a bake: it reads the committed documents, nothing else.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

SCHEMA = "neuraxis.readiness/v1"
CATALOG_REL = "docs/contracts/catalog.md"
STATUSES = ("real", "active")  # the catalog's status vocabulary (its Contracts section), exactly, lower case
STATIC_MISSING = ("operations-api", "release-manifest")  # exist only while the service runs or after packaging
DERIVED_ROWS = ("episode-index", "episode", "lineage")
OPERATION_ROWS = ("operation-index", "operation-run")

# the catalog's reasons as (en, es) templates, in the order of its Missing-data table
T_PROVIDER = ("Served by its provider ({provider}); the real producer is not built yet.",
              "Lo sirve su proveedor ({provider}); el productor real aún no está construido.")
T_STATIC = ("Not part of the static site; it exists only while the service runs or after packaging.",
            "No forma parte del sitio estático; existe solo mientras el servicio funciona o tras empaquetar.")
T_NOT_EXPORTED = ("The pipeline has not exported this build.", "El pipeline no ha exportado esta versión.")
T_NO_SEMANTIC = ("The semantic-transfer evidence has not been exported.",
                 "La evidencia de transferencia semántica no se ha exportado.")
T_NO_LINEAGE = ("The evaluation lineage is absent.", "Falta el linaje de la evaluación.")
T_LINEAGE = ("{n} of {total} lineage documents are absent.", "Faltan {n} de {total} documentos de linaje.")
T_EPISODES = ("{n} of {total} episodes are absent.", "Faltan {n} de {total} episodios.")
T_NO_OPERATIONS = ("The recorded operations have not been executed.", "Las operaciones registradas no se han ejecutado.")
T_RUNS = ("{n} of {total} operation runs are absent.", "Faltan {n} de {total} ejecuciones de operación.")
T_STALE = ("Recorded by {engine}; the product pins {pinned}.", "Registrado con {engine}; el producto fija {pinned}.")
T_NO_DOCUMENT = ("The document is absent from this build.", "El documento no está en esta versión.")


def parse_catalog(text: str) -> list[dict[str, str]]:
    """The rows of the ``## Contracts`` table, one dict per row keyed by the lower-cased header cells."""
    lines = text.replace("\r\n", "\n").split("\n")
    start = next(i for i, ln in enumerate(lines) if ln.strip() == "## Contracts")
    table: list[list[str]] = []
    for ln in lines[start + 1:]:
        if ln.startswith("## "):
            break
        if ln.startswith("|"):
            table.append([c.strip() for c in ln.strip().strip("|").split("|")])
    header = [c.lower() for c in table[0]]
    return [dict(zip(header, cells)) for cells in table[2:]]  # table[1] is the separator


def _fill(tpl: tuple[str, str], **vals: object) -> dict[str, str]:
    out = []
    for text in tpl:
        for k, v in vals.items():
            text = text.replace("{" + k + "}", str(v))
        out.append(text)
    return {"en": out[0], "es": out[1]}


def _json(path: Path) -> Any | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def _listed(index: Any) -> list[str]:
    """The episode or run paths an index lists, in order."""
    if not isinstance(index, dict):
        return []
    rows = index.get("episodes", index.get("runs", []))
    return [r["path"] for r in rows if isinstance(r, dict) and isinstance(r.get("path"), str)]


class _Facts:
    """What the repository says, read once: the indexes, the absent episodes, lineages and runs, the engine pin."""

    def __init__(self, repo_root: Path, data_root: Path) -> None:
        derived, semantic, operations = data_root / "derived", data_root / "derived" / "semantic-transfer", data_root / "operations"
        self.data_root = data_root
        index = _json(derived / "index.json")
        self.index_present = isinstance(index, dict)
        st = _json(semantic / "index.json")
        self.semantic_present = isinstance(st, dict)
        listed = [("", p) for p in _listed(index)] + [("semantic-transfer/", p) for p in _listed(st)]
        self.episodes_total = len(listed)
        self.episodes_missing = sorted(prefix + p for prefix, p in listed if not (derived / prefix / p).is_file())
        self.lineage_present = (derived / "lineage.json").is_file()
        self.semantic_lineage_present = (semantic / "lineage.json").is_file()
        ops = _json(operations / "index.json")
        self.ops_present = isinstance(ops, dict)
        runs = _listed(ops)
        self.runs_total = len(runs)
        self.runs_missing = sorted(p for p in runs if not (operations / p).is_file())
        self.engine = str(ops.get("engine")) if self.ops_present else ""
        pin = re.search(r"^reflexmesh(?:\[[^\]]*\])?==([0-9][0-9A-Za-z.]*)", self._read(repo_root / "requirements.txt"), re.MULTILINE)
        self.pinned = f"reflexmesh {pin.group(1)}" if pin else ""

    @staticmethod
    def _read(path: Path) -> str:
        try:
            return path.read_text(encoding="utf-8")
        except OSError:
            return ""

    def document_absent(self, row: dict[str, str], repo_root: Path) -> bool:
        """True when the row's ``documents`` cell is one fixed path and that file is absent."""
        entries = [e.strip().strip("`") for e in row.get("documents", "").split(", ") if e.strip()]
        if len(entries) != 1 or entries[0] == "-" or any(c in entries[0] for c in "*?[!#"):
            return False
        rel = entries[0]
        target = self.data_root / rel.removeprefix("data/") if rel.startswith("data/") else repo_root / rel
        return not target.is_file()


def _entry(row: dict[str, str], state: str, provenance: str | None, reason: dict | None,
           missing: list[str] | None = None) -> dict:
    return {"id": row["id"], "version": row["version"], "status": row["status"], "provenance": provenance,
            "state": state, "reason": reason, "missing": sorted(missing or [])}


def _rule(row: dict[str, str], f: _Facts, repo_root: Path, providers: bool) -> dict:
    """The first rule of the catalog's Missing-data table that matches ``row``."""
    rid = row["id"]
    provider = row.get("provider", "").replace("`", "")
    if row["status"] not in STATUSES:
        raise ValueError(f"catalog row {rid!r}: status {row['status']!r} is not one of "
                         f"{' or '.join(repr(s) for s in STATUSES)} (lower case, no other value)")
    if row["status"] == "active" or (providers and rid not in STATIC_MISSING):
        return _entry(row, "provider", provider.split(":", 1)[0] or "stub", _fill(T_PROVIDER, provider=provider))
    if rid in STATIC_MISSING:
        return _entry(row, "missing", None, _fill(T_STATIC))
    if rid in DERIVED_ROWS and not f.index_present:
        return _entry(row, "missing", None, _fill(T_NOT_EXPORTED))
    if rid == "semantic-transfer-index" and not f.semantic_present:
        return _entry(row, "missing", None, _fill(T_NO_SEMANTIC))
    if rid == "lineage" and not f.lineage_present:
        return _entry(row, "missing", None, _fill(T_NO_LINEAGE))
    if rid == "lineage" and f.semantic_present and not f.semantic_lineage_present:
        return _entry(row, "partial", "real", _fill(T_LINEAGE, n=1, total=2), ["semantic-transfer/lineage.json"])
    if rid == "episode" and f.episodes_missing:
        return _entry(row, "partial", "real", _fill(T_EPISODES, n=len(f.episodes_missing), total=f.episodes_total),
                      f.episodes_missing)
    if rid in OPERATION_ROWS and not f.ops_present:
        return _entry(row, "missing", None, _fill(T_NO_OPERATIONS))
    if rid == "operation-run" and f.runs_missing:
        return _entry(row, "partial", "real", _fill(T_RUNS, n=len(f.runs_missing), total=f.runs_total), f.runs_missing)
    if rid in OPERATION_ROWS and f.engine != f.pinned:
        return _entry(row, "stale", "real", _fill(T_STALE, engine=f.engine, pinned=f.pinned))
    if f.document_absent(row, repo_root):
        return _entry(row, "missing", None, _fill(T_NO_DOCUMENT))
    return _entry(row, "available", "real", None)


def compute(*, repo_root: str | Path, data_root: str | Path | None = None, catalog_path: str | Path | None = None,
            version: str | None = None, providers: bool = False) -> dict:
    """The readiness document of the repository at ``repo_root``, whose committed documents are under ``data_root``
    (default ``<repo_root>/data``). ``providers`` computes the provider tree's document: every row but the static ones is
    served by its provider. ``catalog_path`` and ``version`` default to the repository's."""
    root = Path(repo_root)
    catalog = Path(catalog_path) if catalog_path else root / CATALOG_REL
    raw = catalog.read_bytes().replace(b"\r\n", b"\n")
    ver = version if version is not None else (root / "VERSION").read_text(encoding="utf-8").strip()
    facts = _Facts(root, Path(data_root) if data_root else root / "data")
    rows = [r for r in parse_catalog(raw.decode("utf-8")) if r["id"] != "readiness"]
    return {"schema": SCHEMA, "product_version": ver, "catalog_sha256": hashlib.sha256(raw).hexdigest(),
            "contracts": [_rule(r, facts, root, providers) for r in rows]}


def serialise(doc: dict) -> bytes:
    """The committed form: compact JSON, UTF-8, no BOM, no trailing newline (scripts/check_readiness.py compares bytes)."""
    return json.dumps(doc, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def write(derived_root: str | Path, doc: dict) -> int:
    """Write ``<derived_root>/readiness.json``; return its byte size."""
    raw = serialise(doc)
    path = Path(derived_root) / "readiness.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    return len(raw)
