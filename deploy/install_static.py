"""Server-side immutable static release installer; never starts a tool service."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

BASE = Path("/var/www/neuraxis.ml.fasl-work.com")


def install(archive: Path, expected_sha256: str, base: Path = BASE) -> dict:
    if (
        not re.fullmatch(r"[0-9a-f]{64}", expected_sha256)
        or hashlib.sha256(archive.read_bytes()).hexdigest() != expected_sha256
    ):
        raise ValueError("deployment archive hash mismatch")
    base = base.resolve()
    releases = base / "releases"
    releases.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="incoming-", dir=releases) as temporary:
        staging = Path(temporary)
        with tarfile.open(archive, "r:gz") as bundle:
            members = bundle.getmembers()
            if not 1 <= len(members) <= 100000 or sum(m.size for m in members) > 2_147_483_648:
                raise ValueError("deployment exceeds archive bounds")
            seen = set()
            for member in members:
                name = PurePosixPath(member.name)
                if (
                    name.is_absolute()
                    or ".." in name.parts
                    or "\\" in member.name
                    or not member.isfile()
                    or member.name in seen
                ):
                    raise ValueError("deployment accepts unique regular relative files only")
                seen.add(member.name)
                target = staging / name
                if not target.resolve().is_relative_to(staging):
                    raise ValueError("archive path escapes release")
                target.parent.mkdir(parents=True, exist_ok=True)
                source = bundle.extractfile(member)
                if source is None:
                    raise ValueError("archive entry has no bytes")
                with source, target.open("wb") as out:
                    while chunk := source.read(1_048_576):
                        out.write(chunk)
                target.chmod(0o644)
        manifest = json.loads((staging / "release.json").read_text(encoding="utf-8"))
        commit = manifest["commit"]
        if manifest["schema_version"] != 1 or not re.fullmatch(r"[0-9a-f]{40}", commit):
            raise ValueError("invalid release identity")
        declared = {entry["path"] for entry in manifest["files"]}
        if declared != seen - {"release.json"} or len(declared) != len(manifest["files"]):
            raise ValueError("manifest does not enumerate every static file")
        for entry in manifest["files"]:
            raw = (staging / entry["path"]).read_bytes()
            if len(raw) != entry["size"] or hashlib.sha256(raw).hexdigest() != entry["sha256"]:
                raise ValueError("static file digest mismatch")
        if not {"index.html", "data/index.json"} <= declared:
            raise ValueError("deployment lacks app or scientific evidence")
        release = releases / (commit[:12] + "-" + expected_sha256[:12])
        if release.exists():
            raise ValueError("immutable release already exists; select the existing release explicitly")
        staging.chmod(0o755)
        staging.rename(release)
    current = base / "current"
    if current.exists() and not current.is_symlink():
        raise ValueError("current deployment path is not a managed symlink")
    candidate = base / (".current-" + commit[:12])
    candidate.symlink_to(release, target_is_directory=True)
    os.replace(candidate, current)
    return {
        "commit": commit,
        "release": release.name,
        "archive_sha256": expected_sha256,
        "files": len(declared),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("sha256")
    args = parser.parse_args()
    print(json.dumps(install(args.archive, args.sha256)))
