import hashlib
import importlib.util
import io
import json
import os
import tarfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("operations_installer", ROOT / "deploy/install_operations.py")
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


@pytest.mark.parametrize("malice", ["extra", "symlink", "duplicate", "oversize", "commit", "hash"])
def test_operation_bundle_rejects_unowned_content(tmp_path, malice):
    archive = tmp_path / "bundle.tar.gz"
    with tarfile.open(archive, "w:gz") as bundle:
        for name in sorted(installer.FILES):
            raw = b"a" * 40 if name == "commit.txt" else b"source"
            if name == "commit.txt" and malice == "commit":
                raw = b"../other"
            if name == "VERSION" and malice == "oversize":
                raw = b"x" * 1_048_577
            member = tarfile.TarInfo(name)
            member.size = len(raw)
            if name == "VERSION" and malice == "symlink":
                member.type, member.linkname = tarfile.SYMTYPE, "/etc/passwd"
            bundle.addfile(member, io.BytesIO(raw))
        if malice in {"extra", "duplicate"}:
            member = tarfile.TarInfo("../outside" if malice == "extra" else "VERSION")
            bundle.addfile(member, io.BytesIO())
    target = tmp_path / "staging"
    target.mkdir()
    digest = "0" * 64 if malice == "hash" else hashlib.sha256(archive.read_bytes()).hexdigest()
    with pytest.raises(ValueError):
        installer.unpack(archive, digest, target)
    assert not (tmp_path / "outside").exists()


def test_operation_bundle_extracts_only_allowlisted_source(tmp_path):
    archive = tmp_path / "bundle.tar.gz"
    with tarfile.open(archive, "w:gz") as bundle:
        for name in sorted(installer.FILES):
            raw = b"a" * 40 if name == "commit.txt" else b"source"
            member = tarfile.TarInfo(name)
            member.size = len(raw)
            bundle.addfile(member, io.BytesIO(raw))
    target = tmp_path / "staging"
    target.mkdir()
    assert installer.unpack(archive, hashlib.sha256(archive.read_bytes()).hexdigest(), target) == "a" * 40
    assert {p.relative_to(target).as_posix() for p in target.rglob("*") if p.is_file()} == installer.FILES


@pytest.mark.skipif(os.name == "nt", reason="POSIX deployment symlinks and pwd")
@pytest.mark.parametrize("healthy", [True, False])
def test_release_dependencies_and_rollback_are_isolated(tmp_path, monkeypatch, healthy):
    import pwd

    base = tmp_path / "service"
    previous = base / "releases" / "previous"
    previous.mkdir(parents=True)
    (previous / ".venv").mkdir()
    (previous / ".venv" / "identity").write_text("original dependencies")
    current = base / "current"
    current.symlink_to(previous, target_is_directory=True)
    unit, nginx = tmp_path / "unit", tmp_path / "nginx"
    unit.write_text("old unit")
    nginx.write_text("old nginx")
    monkeypatch.setattr(installer, "BASE", base)
    monkeypatch.setattr(installer, "SERVICE_UNIT", unit)
    monkeypatch.setattr(installer, "NGINX_CONFIG", nginx)
    monkeypatch.setattr(pwd, "getpwnam", lambda _: object())
    calls = []
    monkeypatch.setattr(installer, "run", lambda *args: calls.append(args))
    monkeypatch.setattr(installer.subprocess, "check_output", lambda *a, **kw: "reflexmesh==0.1.0\n")
    config = {"tasks": [1, 2, 3], "commit": "a" * 40 if healthy else "b" * 40}
    monkeypatch.setattr(
        installer.urllib.request, "urlopen", lambda *a, **kw: io.BytesIO(json.dumps(config).encode())
    )
    archive = tmp_path / "bundle.tar.gz"
    with tarfile.open(archive, "w:gz") as bundle:
        for name in sorted(installer.FILES):
            raw = b"a" * 40 if name == "commit.txt" else b"new content"
            member = tarfile.TarInfo(name)
            member.size = len(raw)
            bundle.addfile(member, io.BytesIO(raw))
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if healthy:
        result = installer.install(archive, digest)
        assert current.resolve() == Path(result["release"])
        assert (current / "installed-requirements.txt").read_text() == "reflexmesh==0.1.0\n"
    else:
        with pytest.raises(ValueError, match="Incorrect operation service"):
            installer.install(archive, digest)
        assert current.resolve() == previous
        assert unit.read_text() == "old unit" and nginx.read_text() == "old nginx"
    venv_call = next(c for c in calls if c[:3] == ("python3", "-m", "venv"))
    assert Path(venv_call[3]).parent.parent == base / "releases"
    assert (previous / ".venv" / "identity").read_text() == "original dependencies"
