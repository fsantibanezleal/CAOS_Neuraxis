"""Plants for the static-release feature (SR): one planted defect per requirement of ``docs/design/features/static-release``,
run through the real package builder (``scripts/package_static.py``), the real installer (``deploy/install_static.py``) and the
real CI budget guard (``scripts/check_ci_budget.py``).

SR-001 isolates the digest binding: the five evidence validators of the builder are replaced by stubs that return their summary
(they are exercised by SR-004 and by ``test_benchmark_adequacy.py``), over a three-file build. SR-004 runs the real validator on
the hard-link mirror of the committed canonical tree. Archives are built in memory, with the standard library. The installer
ends with a POSIX symlink switch, so a clean install is observed through a recorder in place of ``Path.symlink_to``; a rejection
never reaches it, which is the property under test."""
from __future__ import annotations

import hashlib
import importlib.util
import io
import json
import tarfile
from pathlib import Path

import pytest
from planting import ROOT, edit, guard, make_tree, replace_file

COMMIT = "a" * 40
CI_BUDGET_OK = "ci budget: OK"


def load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def installer():
    return load("install_static_under_plant", ROOT / "deploy" / "install_static.py")


@pytest.fixture
def packager(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "scripts"))
    return load("package_static_under_plant", ROOT / "scripts" / "package_static.py")


def archive_of(path: Path, members: list[tuple[str, bytes]]) -> str:
    """A .tar.gz of the members, in order (a name may repeat); returns its SHA-256."""
    with tarfile.open(path, "w:gz") as archive:
        for name, raw in members:
            info = tarfile.TarInfo(name)
            info.size = len(raw)
            archive.addfile(info, io.BytesIO(raw))
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifest_of(files: dict[str, bytes]) -> bytes:
    rows = [{"path": n, "size": len(r), "sha256": hashlib.sha256(r).hexdigest()} for n, r in files.items()]
    return json.dumps({"schema_version": 1, "commit": COMMIT, "files": rows}).encode()


def good_members() -> list[tuple[str, bytes]]:
    files = {"index.html": b"<html>app</html>", "data/index.json": b"{}"}
    return [*files.items(), ("release.json", manifest_of(files))]


def unbound(archive: Path) -> list[str]:
    """The files of the archive that its release.json does not bind to a digest, or binds to a different one."""
    with tarfile.open(archive, "r:gz") as bundle:
        raw = {m.name: bundle.extractfile(m).read() for m in bundle.getmembers() if m.isfile()}
    bound = {row["path"]: row["sha256"] for row in json.loads(raw["release.json"])["files"]}
    return sorted(n for n, data in raw.items() if n != "release.json" and bound.get(n) != hashlib.sha256(data).hexdigest())


def no_switch(installer, base: Path) -> None:
    assert not (base / "current").exists() and not (base / "current").is_symlink(), "the current release switched"


def test_a_good_archive_is_installed_up_to_the_switch(installer, tmp_path: Path, monkeypatch) -> None:
    """The clean control of SR-001 and SR-002: the installer accepts the good archive and reaches its switch."""
    archive = tmp_path / "good.tar.gz"
    digest = archive_of(archive, good_members())
    switched: list[Path] = []
    monkeypatch.setattr(Path, "symlink_to", lambda self, target, target_is_directory=False: switched.append(Path(target)))
    monkeypatch.setattr(installer.os, "replace", lambda *a: None)
    result = installer.install(archive, digest, tmp_path / "site")
    assert result["commit"] == COMMIT and len(switched) == 1 and (switched[0] / "index.html").is_file()
    assert unbound(archive) == []


def test_adversarial_a_file_outside_the_manifest_is_refused(packager, installer, tmp_path: Path, monkeypatch) -> None:
    build = tmp_path / "build"
    (build / "data").mkdir(parents=True)
    (build / "index.html").write_text("<html>app</html>", encoding="utf-8")
    (build / "data" / "index.json").write_text("{}", encoding="utf-8")
    for name in ("validate", "validate_research", "validate_semantic_transfer", "validate_semantic_routing"):
        monkeypatch.setattr(packager, name, lambda *a, **k: {})
    monkeypatch.setattr(packager, "validate_operations", lambda *a, **k: {})
    # the clean build: every published byte is bound to a digest
    clean = tmp_path / "clean.tar.gz"
    packager.package(clean, build)
    assert unbound(clean) == []
    (build / "release.json").unlink()
    # the plant: a file appears in the build output after the manifest is enumerated and before the archive is written
    real_dumps = packager.json.dumps

    def dumps_then_add_a_file(value, *args, **kwargs):
        (build / "late.bin").write_bytes(b"added after the manifest")
        return real_dumps(value, *args, **kwargs)

    monkeypatch.setattr(packager.json, "dumps", dumps_then_add_a_file)
    planted = tmp_path / "planted.tar.gz"
    with pytest.raises(ValueError, match="late.bin"):
        packager.package(planted, build)
    monkeypatch.undo()
    assert not planted.exists(), "the builder wrote an archive that holds a file with no digest"
    # the installer still refuses an archive built by hand with the same defect, before the current release switches
    hand = tmp_path / "hand.tar.gz"
    files = {"index.html": b"<html>app</html>", "data/index.json": b"{}"}
    digest = archive_of(hand, [*files.items(), ("late.bin", b"added after the manifest"), ("release.json", manifest_of(files))])
    assert unbound(hand) == ["late.bin"], "the file with no digest is the planted one"
    with pytest.raises(ValueError, match="manifest does not enumerate every static file"):
        installer.install(hand, digest, tmp_path / "site")
    no_switch(installer, tmp_path / "site")


def test_adversarial_a_bad_archive_never_switches_the_release(installer, tmp_path: Path) -> None:
    base = tmp_path / "site"
    good = good_members()
    manifest_files = {n: r for n, r in good if n != "release.json"}
    # a traversal member
    traversal = tmp_path / "traversal.tar.gz"
    digest = archive_of(traversal, [("../outside.txt", b"bad"), *good])
    with pytest.raises(ValueError, match="unique regular relative files only"):
        installer.install(traversal, digest, base)
    assert not (tmp_path / "outside.txt").exists()
    # a duplicate member
    duplicate = tmp_path / "duplicate.tar.gz"
    digest = archive_of(duplicate, [good[0], good[0], *good[1:]])
    with pytest.raises(ValueError, match="unique regular relative files only"):
        installer.install(duplicate, digest, base)
    # a digest that differs: the archive against the digest the operator passed
    wrong_archive = tmp_path / "wrong-archive.tar.gz"
    archive_of(wrong_archive, good)
    with pytest.raises(ValueError, match="archive hash mismatch"):
        installer.install(wrong_archive, "0" * 64, base)
    # a digest that differs: a file against the one the manifest records
    tampered = tmp_path / "tampered.tar.gz"
    changed = [(n, (b"<html>CHANGED</html>" if n == "index.html" else r)) for n, r in good]
    digest = archive_of(tampered, changed)
    assert manifest_files["index.html"] != dict(changed)["index.html"], "the plant changed nothing"
    with pytest.raises(ValueError, match="static file digest mismatch"):
        installer.install(tampered, digest, base)
    no_switch(installer, base)
    assert [p.name for p in (base / "releases").iterdir()] == [], "a rejected archive leaves no release behind"


def test_adversarial_a_workflow_step_that_trains_fails_the_ci_budget_check(tmp_path: Path) -> None:
    repo = make_tree(tmp_path / "repo", ".github/workflows", "scripts/check_ci_budget.py", "data-pipeline/requirements.txt")
    clean = guard(repo, "check_ci_budget.py", ok_marker=CI_BUDGET_OK)
    assert clean.returncode == 0 and CI_BUDGET_OK in clean.stdout, clean.stdout
    workflow = repo / ".github" / "workflows" / "ci.yml"
    text = workflow.read_bytes().decode("utf-8")
    planted = (text.rstrip("\n") + "\n      - name: Fit the models\n        run: python data-pipeline/run.py train\n"
               "      - name: The product test suite\n        run: python -m pytest tests -q\n")
    replace_file(workflow, planted.encode("utf-8"))
    r = guard(repo, "check_ci_budget.py")
    assert r.returncode == 1, r.stdout
    assert "trains, bakes or runs the pipeline" in r.stdout, r.stdout
    # the second plant alone: the product test suite
    edit(repo, ".github/workflows/ci.yml", "run: python data-pipeline/run.py train", "run: echo skipped")
    r = guard(repo, "check_ci_budget.py")
    assert r.returncode == 1 and "runs the test suite in CI" in r.stdout, r.stdout


def test_adversarial_an_incomplete_matrix_is_not_packaged(packager, canonical_mirror: Path, tmp_path: Path) -> None:
    build = canonical_mirror.parent
    index_path = canonical_mirror / "index.json"
    original = index_path.read_bytes()
    index = json.loads(original)
    del index["episodes"][3000]  # one cell of the trace matrix is missing from the build input
    replace_file(index_path, json.dumps(index, indent=2).encode("utf-8"))
    output = tmp_path / "out" / "neuraxis-static.tar.gz"
    try:
        with pytest.raises(ValueError, match="complete method/case/variant/seed matrix is missing"):
            packager.package(output, build)
    finally:
        replace_file(index_path, original)
    assert not output.exists() and not output.parent.exists(), "the builder wrote an archive for an incomplete matrix"
    assert not (build / "release.json").exists(), "the builder wrote a manifest for an incomplete matrix"
