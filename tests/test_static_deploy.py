import hashlib
import importlib.util
import io
import json
import tarfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


def installer():
    spec = importlib.util.spec_from_file_location("install_static", ROOT / "deploy" / "install_static.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def bundle(path, files):
    with tarfile.open(path, "w:gz") as archive:
        for name, raw in files.items():
            info = tarfile.TarInfo(name)
            info.size = len(raw)
            archive.addfile(info, io.BytesIO(raw))
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_adversarial_deploy_rejects_traversal_before_switching_release(tmp_path):
    archive = tmp_path / "bad.tar.gz"
    digest = bundle(archive, {"../outside.txt": b"bad"})
    with pytest.raises(ValueError, match="relative files"):
        installer().install(archive, digest, tmp_path / "site")
    assert not (tmp_path / "outside.txt").exists()
    assert not (tmp_path / "site" / "current").exists()


def test_adversarial_deploy_rejects_mismatched_manifest(tmp_path):
    archive = tmp_path / "bad.tar.gz"
    manifest = {
        "schema_version": 1,
        "commit": "a" * 40,
        "files": [{"path": "index.html", "size": 4, "sha256": "0" * 64}],
    }
    digest = bundle(archive, {"index.html": b"test", "release.json": json.dumps(manifest).encode()})
    with pytest.raises(ValueError, match="digest mismatch"):
        installer().install(archive, digest, tmp_path / "site")
    assert not (tmp_path / "site" / "current").exists()


@pytest.mark.skipif(__import__("os").name == "nt", reason="target deployment uses POSIX symlink replacement")
def test_deploy_switches_to_verified_immutable_release(tmp_path):
    archive = tmp_path / "valid.tar.gz"
    files = {"index.html": b"app", "data/index.json": b"{}"}
    manifest = {
        "schema_version": 1,
        "commit": "b" * 40,
        "files": [
            {"path": name, "size": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
            for name, raw in files.items()
        ],
    }
    files["release.json"] = json.dumps(manifest).encode()
    digest = bundle(archive, files)
    result = installer().install(archive, digest, tmp_path / "site")
    assert result["commit"] == "b" * 40
    assert (tmp_path / "site" / "current" / "index.html").read_bytes() == b"app"
    with pytest.raises(ValueError, match="already exists"):
        installer().install(archive, digest, tmp_path / "site")
