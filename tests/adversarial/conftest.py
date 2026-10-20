"""Fixtures of the adversarial tests (template 0.08.002, adapted to Neuraxis): a throwaway copy of the files a guard reads, one
planted defect, the real guard or the real code path run on it.

Cost (ADR-0074): a fixture copies only the paths its gate reads. The provider tree holds 15,981 documents, so the canonical
episodes (14,400 files, 265 MB) are mirrored by hard links, never copied, and the plants that need them replace a single small
file; the plants that stop at the first episode copy that one file. Nothing here writes into the repository: every plant lives
under pytest's temporary directory."""
from __future__ import annotations

import shutil
from pathlib import Path

import pytest
from planting import ROOT, add_schema, link_tree, link_tree_file, make_tree

SKIP = shutil.ignore_patterns("node_modules", "dist", "gate-output", "__pycache__", ".venv*", ".git", ".pytest_cache",
                              ".ruff_cache", "*.pyc", "build")
# what the guards of the design area and of the contracts read: the documents, the tests they name, the scripts, the web sources
COPIED = ("scripts", "docs", "tests", "content", "app", "data-pipeline", "deploy", ".github", "frontend/src", "frontend/public",
          "frontend/scripts")
FILES = ("VERSION", "product.json", "CHANGELOG.md", "pyproject.toml", "requirements.txt", "requirements-api.txt",
         "requirements-dev.txt", "requirements-gpu.txt", "requirements-operations.txt", "requirements-precompute.txt",
         "frontend/package.json", "frontend/package-lock.json")


@pytest.fixture(scope="session")
def base_copy(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """The repository's documents, scripts and web sources, without the heavy trees (the data, node_modules, dist)."""
    base = tmp_path_factory.mktemp("repo-base")
    for name in COPIED:
        if (ROOT / name).exists():
            shutil.copytree(ROOT / name, base / name, ignore=SKIP)
    for name in FILES:
        if (ROOT / name).exists():
            (base / name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, base / name)
    return add_schema(base)


@pytest.fixture
def repo(base_copy: Path, tmp_path: Path) -> Path:
    """A fresh copy of the repository's relevant files, to plant one defect in."""
    dest = tmp_path / "repo"
    shutil.copytree(base_copy, dest)
    return dest


@pytest.fixture(scope="session")
def canonical_mirror(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """``data/derived`` as hard links: the 14,400 canonical episodes, the index, the lineage and the adequacy audit, read by
    ``check_artifacts.py`` and never written. It is the ``data`` folder of a build (``<build>/index.html`` beside it), so
    ``package_static.package(output, build=mirror.parent)`` takes it as its input. A test that plants replaces one file with
    ``replace_file`` and restores it."""
    build = tmp_path_factory.mktemp("canonical") / "build"
    (build / "data").mkdir(parents=True)
    (build / "index.html").write_text("<!doctype html><title>mirror</title>", encoding="utf-8")  # the build input of package_static
    dest = build / "data"
    src = ROOT / "data" / "derived"
    link_tree(src / "episodes", dest / "episodes")
    for name in ("index.json", "lineage.json", "benchmark-adequacy.json"):
        link_tree_file(src / name, dest / name)
    return dest


@pytest.fixture
def first_episode_tree(tmp_path: Path) -> Path:
    """The inputs of ``check_artifacts.py`` up to its first episode: the registry and lineage documents and the first listed
    episode, as real copies. A plant in that episode stops the guard before any count is made."""
    import json

    root = make_tree(tmp_path / "derived", "data/derived/index.json", "data/derived/lineage.json",
                     "data/derived/benchmark-adequacy.json")
    src = ROOT / "data" / "derived"
    dest = root / "data" / "derived"
    first = json.loads((src / "index.json").read_bytes())["episodes"][0]["path"]
    (dest / first).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src / first, dest / first)
    return dest


@pytest.fixture
def operation_corpus(tmp_path: Path) -> Path:
    """A throwaway copy of what ``scripts/check_operations.py`` reads: the guard, the recorded operation runs and the sources whose
    digests the index records. The copy starts clean: a recorded source digest that no longer matches the committed file (the
    corpus was recorded before that file last changed) is rebased in the copy, so the plant under test is the only defect. That
    drift of the committed corpus is a finding of the unit's report, not something a planted-defect test may mask by passing."""
    import hashlib
    import json

    index = json.loads((ROOT / "data" / "operations" / "index.json").read_bytes())
    repo = make_tree(tmp_path / "repo", "scripts/check_operations.py", "data/operations", *index["source_sha256"])
    copied = json.loads((repo / "data" / "operations" / "index.json").read_bytes())
    for rel in copied["source_sha256"]:
        copied["source_sha256"][rel] = hashlib.sha256((repo / rel).read_bytes()).hexdigest()
    (repo / "data" / "operations" / "index.json").write_bytes(json.dumps(copied, indent=2).encode("utf-8") + b"\n")
    return repo
