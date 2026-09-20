"""Build an audited static deployment archive from an already validated frontend."""

import argparse
import hashlib
import json
import subprocess
import tarfile
from pathlib import Path

from check_artifacts import validate

ROOT = Path(__file__).resolve().parents[1]


def package(output: Path, build: Path | None = None):
    build = (build or ROOT / "frontend" / "dist").resolve()
    if not (build / "index.html").is_file() or not (build / "data" / "index.json").is_file():
        raise ValueError("static build requires the application and canonical evidence")
    coverage = validate(build / "data")
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    files = []
    for path in sorted(build.rglob("*")):
        if path.is_symlink():
            raise ValueError("symlinks are excluded from static deployments")
        if path.is_file() and path.name != "release.json":
            raw = path.read_bytes()
            files.append(
                {
                    "path": path.relative_to(build).as_posix(),
                    "size": len(raw),
                    "sha256": hashlib.sha256(raw).hexdigest(),
                }
            )
    manifest = {
        "schema_version": 1,
        "commit": commit,
        "version": (ROOT / "VERSION").read_text().strip(),
        "files": files,
        "canonical_coverage": coverage,
    }
    (build / "release.json").write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(output, "w:gz") as archive:
        for path in sorted(build.rglob("*")):
            if path.is_file():
                archive.add(path, arcname=path.relative_to(build).as_posix(), recursive=False)
    return {
        "archive": str(output),
        "commit": commit,
        "files": len(files),
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "neuraxis-static.tar.gz")
    args = parser.parse_args()
    print(json.dumps(package(args.output)))
