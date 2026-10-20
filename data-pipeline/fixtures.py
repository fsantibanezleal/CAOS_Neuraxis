"""Generate the provider tree ``docs/contracts/fixtures/data/`` (catalog, Providers): a small stand-in for ``data/`` with the
same layout, derived from the committed documents so it validates against the same schemas as they do.

    python data-pipeline/fixtures.py            # rewrite docs/contracts/fixtures/data
    python data-pipeline/fixtures.py --check    # exit 1 when the tree on disk differs from what this would write

What is kept: an episode index with three episodes (methods M01, M09 and M12 on the first case and the boundary variant), its
lineage, the three episode files, a semantic-transfer index with one episode and its lineage and report, the four evidence
documents, an operation index with one run and that run, and a readiness document that says ``provider`` for every row but the
static ones. What is shrunk: an episode keeps its first two events and decisions (its metrics are the real run's), a list of more
than three items in an evidence document keeps three, the aggregate results keep the kept methods with the episode count
recomputed; the digests that bind the documents (episode and index digests, the index each audit names, the lineage signature)
are recomputed for the shrunk files. Stdlib only; deterministic; never run in CI (``tests/contracts/test_swap.py`` regenerates into a
temporary directory and compares bytes).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from core import readiness

FIXTURE_REL = "docs/contracts/fixtures/data"
DERIVED_METHODS = ("M01", "M09", "M12")
SEMANTIC_METHODS = ("M12",)
KEEP = 3  # items kept of a long list in an evidence document
OPERATION_RUN = "data-clean-70000"


def _load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _episode_bytes(episode: dict) -> bytes:
    """An episode in the engine's own form (evaluation/runner.py:376: compact separators)."""
    return json.dumps(episode, separators=(",", ":")).encode("utf-8")


def _json_bytes(doc: object, indent: int | None = 2, sort_keys: bool = False) -> bytes:
    text = json.dumps(doc, indent=indent, sort_keys=sort_keys, ensure_ascii=True) if indent else json.dumps(doc, separators=(",", ":"))
    return (text + "\n").encode("utf-8") if indent else text.encode("utf-8")


def _shrink_lists(value: object) -> object:
    """Keep the first KEEP items of every list longer than KEEP, at any depth."""
    if isinstance(value, dict):
        return {k: _shrink_lists(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_shrink_lists(v) for v in value[:KEEP]]
    return value


def _pick(entries: list[dict], methods: tuple[str, ...], variant: str | None) -> list[dict]:
    """The first entry (by run id) of each method, preferring ``variant``."""
    chosen = []
    for method in methods:
        pool = sorted((e for e in entries if e["method_id"] == method), key=lambda e: e["run_id"])
        preferred = [e for e in pool if variant and e["variant"] == variant] or pool
        chosen.append(preferred[0])
    return chosen


def _shrunk_index(index: dict, chosen: list[dict], files: dict[str, bytes], methods: tuple[str, ...]) -> dict:
    """The index with only the chosen episodes: digests of the shrunk files, registries and aggregates narrowed."""
    entries = [{**e, "sha256": _sha(files[e["path"]])} for e in chosen]
    cases = {e["case_id"] for e in entries}
    out = dict(index)
    out["episodes"] = entries
    out["methods"] = [m for m in index["methods"] if m["id"] in methods]
    out["cases"] = [c for c in index["cases"] if c["id"] in cases]
    out["aggregate_results"] = [{**a, "episodes": sum(e["method_id"] == a["method_id"] for e in entries)}
                                for a in index["aggregate_results"] if a["method_id"] in methods]
    prov = dict(index["provenance"])
    prov["complete_method_ids"] = [m for m in prov["complete_method_ids"] if m in methods]
    out["provenance"] = prov
    return out


def _shrunk_episode(episode: dict) -> dict:
    out = dict(episode)
    out["events"] = episode["events"][:2]
    out["decisions"] = episode["decisions"][:2]
    return out


def _lineage_bytes(lineage: dict) -> bytes:
    """The lineage in the engine's own form (runner.py:344: indent 2, sorted keys, no trailing newline)."""
    return json.dumps(lineage, indent=2, sort_keys=True).encode("utf-8")


def _index_bytes(index: dict) -> bytes:
    """The index in the engine's own form (runner.py:424: indent 2, no trailing newline)."""
    return json.dumps(index, indent=2).encode("utf-8")


def _set(doc: dict, path: tuple[str, ...], value: str) -> None:
    for key in path[:-1]:
        doc = doc[key]
    doc[path[-1]] = value


def _evaluation_set(src: Path, methods: tuple[str, ...], variant: str | None) -> tuple[dict[str, bytes], dict, dict]:
    """(files by relative path, shrunk index, lineage) of one evaluation directory (``derived`` or ``semantic-transfer``)."""
    index = _load(src / "index.json")
    lineage = _load(src / "lineage.json")
    chosen = _pick(index["episodes"], methods, variant)
    episodes = {e["path"]: _episode_bytes(_shrunk_episode(_load(src / e["path"]))) for e in chosen}
    shrunk = _shrunk_index(index, chosen, episodes, methods)
    files = {"index.json": _index_bytes(shrunk), "lineage.json": _lineage_bytes(lineage), **episodes}
    return files, shrunk, lineage


def generate(repo_root: Path, out: Path) -> None:
    """Write the provider tree for the repository at ``repo_root`` into ``out`` (a directory with the layout of ``data/``)."""
    src = repo_root / "data"
    files: dict[str, bytes] = {}

    derived, _, _ = _evaluation_set(src / "derived", DERIVED_METHODS, "boundary")
    files.update({f"derived/{k}": v for k, v in derived.items()})
    semantic, _, lineage = _evaluation_set(src / "derived" / "semantic-transfer", SEMANTIC_METHODS, "boundary")
    files.update({f"derived/semantic-transfer/{k}": v for k, v in semantic.items()})

    derived_index_sha = _sha(derived["index.json"])
    semantic_index_sha = _sha(semantic["index.json"])
    signature = _sha(json.dumps(lineage, sort_keys=True).encode())

    research = _shrink_lists(_load(src / "derived" / "research.json"))
    _set(research, ("core", "index_sha256"), derived_index_sha)
    adequacy = _shrink_lists(_load(src / "derived" / "benchmark-adequacy.json"))
    adequacy["index_sha256"] = derived_index_sha
    routing = _shrink_lists(_load(src / "derived" / "semantic-routing-study" / "analysis.json"))
    _set(routing, ("source", "index_sha256"), semantic_index_sha)
    report = _shrink_lists(_load(src / "derived" / "semantic-transfer" / "report.json"))
    report["index_sha256"] = semantic_index_sha
    report["lineage_signature"] = signature
    files["derived/research.json"] = _json_bytes(research)
    files["derived/benchmark-adequacy.json"] = _json_bytes(adequacy)
    files["derived/semantic-routing-study/analysis.json"] = _json_bytes(routing)
    files["derived/semantic-transfer/report.json"] = _json_bytes(report)

    operations = src / "operations"
    index = _load(operations / "index.json")
    row = next(r for r in index["runs"] if r["run_id"] == OPERATION_RUN)
    run_bytes = (operations / row["path"]).read_bytes()
    files["operations/" + row["path"]] = run_bytes
    files["operations/index.json"] = (json.dumps({**index, "runs": [row]}, indent=2) + "\n").encode("utf-8")

    for rel, raw in files.items():
        target = out / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
    doc = readiness.compute(repo_root=repo_root, data_root=out, providers=True)
    readiness.write(out / "derived", doc)


def _tree(root: Path) -> dict[str, bytes]:
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in sorted(root.rglob("*")) if p.is_file()}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--check", action="store_true", help="exit 1 when the tree on disk is not what this writes")
    args = parser.parse_args(argv)
    target = ROOT / FIXTURE_REL
    if args.check:
        import tempfile

        with tempfile.TemporaryDirectory(prefix="neuraxis-fixtures-") as tmp:
            generate(ROOT, Path(tmp) / "data")
            fresh, kept = _tree(Path(tmp) / "data"), _tree(target) if target.is_dir() else {}
        stale = sorted(k for k in fresh.keys() | kept.keys() if fresh.get(k) != kept.get(k))
        print("fixtures: current" if not stale else "fixtures: stale\n  " + "\n  ".join(stale))
        return 1 if stale else 0
    if target.is_dir():
        for path in sorted(target.rglob("*"), reverse=True):
            path.unlink() if path.is_file() else path.rmdir()
    generate(ROOT, target)
    print(f"fixtures: wrote {len(_tree(target))} files to {FIXTURE_REL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
