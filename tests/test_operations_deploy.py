import hashlib
import importlib.util
import io
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
