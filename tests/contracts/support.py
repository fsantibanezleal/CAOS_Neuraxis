"""Shared assertions of the producer-side contract tests: the cross-field rules a schema cannot state (digests, identity,
bindings), written once and run on both trees, the committed ``data/`` and the provider tree ``docs/contracts/fixtures/data/``
(the swap tests). Every function returns a list of problems; an empty list is a pass. Top-level functions only, so a process
pool can run them."""
from __future__ import annotations

import hashlib
import json
import os
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from typing import Any

import contract_schemas as cs

IDENTITY = ("run_id", "case_id", "method_id", "variant", "seed", "status")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def lineage_signature(lineage: Any) -> str:
    """The digest reflexmesh evaluation/runner.py:337 stamps on every episode of an evaluation."""
    return sha(json.dumps(lineage, sort_keys=True).encode())


def episode_problems(args: tuple[str, str, str, dict]) -> list[str]:
    """One episode file against its schema and its index entry: bytes digest, identity, file name, lineage binding."""
    base, signature, lane, entry = args
    path = Path(base) / entry["path"]
    label = f"{path.name}"
    if not path.is_file():
        return [f"{label}: listed by the index and absent"]
    raw = path.read_bytes()
    out = [f"{label}: sha256 differs from the index entry"] if sha(raw) != entry["sha256"] else []
    try:
        doc = json.loads(raw)
    except ValueError as exc:
        return out + [f"{label}: not JSON ({exc})"]
    out += [f"{label}: {e}" for e in cs.errors("episode", doc)]
    out += [f"{label}: {k} is {doc.get(k)!r}, the index says {entry[k]!r}" for k in IDENTITY if doc.get(k) != entry[k]]
    if doc.get("lane") != lane:
        out.append(f"{label}: lane is {doc.get('lane')!r}, expected {lane!r}")
    if doc.get("run_id") != path.stem:
        out.append(f"{label}: run_id {doc.get('run_id')!r} is not the file name")
    prov = doc.get("provenance", {})
    if prov.get("lineage_signature") != signature:
        out.append(f"{label}: lineage_signature differs from the lineage document")
    if prov.get("lineage_document") != "../lineage.json":
        out.append(f"{label}: lineage_document is {prov.get('lineage_document')!r}")
    return out


def episode_set_problems(base: Path, lane: str, split: str, workers: int | None = None) -> list[str]:
    """The index at ``base/index.json`` and every episode it lists, plus the orphans on disk. ``lane`` and ``split`` are
    the values the set's episodes carry (the derived set or the semantic-transfer set)."""
    index_path, lineage_path = base / "index.json", base / "lineage.json"
    for p in (index_path, lineage_path):
        if not p.is_file():
            return [f"missing {p}"]
    index = cs.load_json(index_path)
    lineage = cs.load_json(lineage_path)
    signature = lineage_signature(lineage)
    out = [f"index: {e}" for e in cs.errors("episode-index" if split == "test" else "semantic-transfer-index", index)]
    out += [f"lineage: {e}" for e in cs.errors("lineage", lineage)]
    prov = index.get("provenance", {})
    if prov.get("lineage") != lineage:
        out.append("index: provenance.lineage differs from lineage.json")
    if prov.get("lineage_signature") != signature:
        out.append("index: provenance.lineage_signature differs from the digest of lineage.json")
    if prov.get("split") != split:
        out.append(f"index: provenance.split is {prov.get('split')!r}, expected {split!r}")
    entries = index.get("episodes", [])
    paths = [e["path"] for e in entries]
    if len(set(paths)) != len(paths) or len({e["run_id"] for e in entries}) != len(entries):
        out.append("index: a path or a run_id is listed twice")
    method_ids = {m["id"] for m in index.get("methods", [])}
    if {a["method_id"] for a in index.get("aggregate_results", [])} - method_ids:
        out.append("index: aggregate_results name a method the registry does not list")
    if set(prov.get("complete_method_ids", [])) - method_ids:
        out.append("index: provenance.complete_method_ids name a method the registry does not list")
    case_ids = {c["id"] for c in index.get("cases", [])}
    if {e["case_id"] for e in entries} - case_ids or {e["method_id"] for e in entries} - method_ids:
        out.append("index: an episode names a case or a method the registry does not list")
    counts: dict[str, int] = {}
    for e in entries:
        counts[e["method_id"]] = counts.get(e["method_id"], 0) + 1
    for a in index.get("aggregate_results", []):
        if a["episodes"] != counts.get(a["method_id"], 0):
            out.append(f"index: aggregate_results of {a['method_id']} count {a['episodes']} episodes, the index lists {counts.get(a['method_id'], 0)}")
    on_disk = {p.name for p in (base / "episodes").glob("*.json")}
    if on_disk != {Path(p).name for p in paths}:
        out.append(f"episodes: {len(on_disk - {Path(p).name for p in paths})} file(s) the index does not list, "
                   f"{len({Path(p).name for p in paths} - on_disk)} listed and absent")
    jobs = [(str(base), signature, lane, e) for e in entries]
    if len(jobs) < 64:
        results = [episode_problems(j) for j in jobs]
    else:
        with ProcessPoolExecutor(max_workers=workers or min(os.cpu_count() or 1, 16)) as pool:
            results = list(pool.map(episode_problems, jobs, chunksize=32))
    for problems in results:
        out += problems
    return out


def operation_problems(base: Path) -> list[str]:
    """The operation index, every run it lists and the orphans: schema, digest, identity and metrics against the index row."""
    index_path = base / "index.json"
    if not index_path.is_file():
        return [f"missing {index_path}"]
    index = cs.load_json(index_path)
    out = [f"index: {e}" for e in cs.errors("operation-index", index)]
    listed = set()
    for row in index.get("runs", []):
        path = base / row["path"]
        listed.add(path.name)
        if not path.is_file():
            out.append(f"{row['run_id']}: listed by the index and absent")
            continue
        raw = path.read_bytes()
        if sha(raw) != row["sha256"]:
            out.append(f"{row['run_id']}: sha256 differs from the index row")
        run = json.loads(raw)
        out += [f"{row['run_id']}: {e}" for e in cs.errors("operation-run", run)]
        if path.stem != row["run_id"]:
            out.append(f"{row['run_id']}: file name differs from run_id")
        if f"{run.get('task')}-{row['variant']}-{row['seed']}" != row["run_id"] or run.get("task") != row["task"]:
            out.append(f"{row['run_id']}: task, variant and seed do not spell the run_id")
        for key in ("status", "disposition"):
            if run.get(key) != row.get(key):
                out.append(f"{row['run_id']}: {key} is {run.get(key)!r} in the run and {row.get(key)!r} in the index")
        if len(run.get("findings", [])) != row["findings"]:
            out.append(f"{row['run_id']}: findings count differs from the index row")
        for key, value in run.get("metrics", {}).items():
            if row.get(key) != value:
                out.append(f"{row['run_id']}: metrics.{key} {value!r} differs from the index row {row.get(key)!r}")
        if run.get("engine") != index.get("engine") and not str(run.get("engine", "")).startswith(index.get("engine", "?")):
            out.append(f"{row['run_id']}: engine {run.get('engine')!r} does not match the index engine {index.get('engine')!r}")
    on_disk = {p.name for p in base.glob("*.json") if p.name != "index.json"}
    if on_disk != listed:
        out.append(f"runs: files and index rows differ ({sorted(on_disk ^ listed)[:5]})")
    return out


def evidence_problems(derived: Path) -> list[str]:
    """The four evidence documents and the semantic-transfer report: schema and the digests that bind them to the indexes."""
    out: list[str] = []
    files = {
        "research-summary": derived / "research.json",
        "benchmark-adequacy": derived / "benchmark-adequacy.json",
        "routing-study": derived / "semantic-routing-study" / "analysis.json",
        "semantic-transfer-report": derived / "semantic-transfer" / "report.json",
    }
    docs = {}
    for name, path in files.items():
        if not path.is_file():
            out.append(f"missing {path}")
            continue
        docs[name] = cs.load_json(path)
        out += [f"{name}: {e}" for e in cs.errors(name, docs[name])]
    index_sha = sha((derived / "index.json").read_bytes()) if (derived / "index.json").is_file() else None
    st_index = derived / "semantic-transfer" / "index.json"
    st_sha = sha(st_index.read_bytes()) if st_index.is_file() else None
    st_lineage = derived / "semantic-transfer" / "lineage.json"
    if "benchmark-adequacy" in docs and docs["benchmark-adequacy"].get("index_sha256") != index_sha:
        out.append("benchmark-adequacy: index_sha256 differs from the digest of index.json")
    if "research-summary" in docs and docs["research-summary"].get("core", {}).get("index_sha256") != index_sha:
        out.append("research-summary: core.index_sha256 differs from the digest of index.json")
    if "routing-study" in docs and docs["routing-study"].get("source", {}).get("index_sha256") != st_sha:
        out.append("routing-study: source.index_sha256 differs from the digest of the semantic-transfer index")
    if "semantic-transfer-report" in docs:
        report = docs["semantic-transfer-report"]
        if report.get("index_sha256") != st_sha:
            out.append("semantic-transfer-report: index_sha256 differs from the digest of the semantic-transfer index")
        if st_lineage.is_file() and report.get("lineage_signature") != lineage_signature(cs.load_json(st_lineage)):
            out.append("semantic-transfer-report: lineage_signature differs from the digest of the semantic-transfer lineage")
    return out
