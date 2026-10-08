"""Package only the bounded operation service and install over authenticated SSH."""

import argparse
import hashlib
import io
import json
import re
import subprocess
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "app/operations_api.py",
    "app/services/operations.py",
    "requirements-operations.txt",
    "deploy/neuraxis-operations.service",
    "deploy/neuraxis.nginx.tls",
    "VERSION",
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--identity", type=Path, required=True)
    parser.add_argument("--output", type=Path, help="external location for the service archive")
    parser.add_argument("--host", default="root@89.167.4.175")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+", args.host):
        parser.error("Expected SSH user@host")
    if subprocess.check_output(["git", "status", "--porcelain", "--", *FILES], cwd=ROOT).strip():
        raise ValueError("Commit validated service sources before deployment")
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    archive = args.output or ROOT / "dist" / "neuraxis-operations.tar.gz"
    archive.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive, "w:gz") as bundle:
        for name in FILES:
            bundle.add(ROOT / name, arcname=name, recursive=False)
        raw = commit.encode()
        info = tarfile.TarInfo("commit.txt")
        info.size = len(raw)
        bundle.addfile(info, io.BytesIO(raw))
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    helper = ROOT / "deploy" / "install_operations.py"
    remote_archive = f"/tmp/neuraxis-operations-{digest}.tar.gz"
    remote_helper = f"/tmp/neuraxis-operations-install-{hashlib.sha256(helper.read_bytes()).hexdigest()}.py"
    common = ["-i", str(args.identity.resolve(strict=True)), "-o", "BatchMode=yes"]
    subprocess.run(["scp", *common, str(archive), args.host + ":" + remote_archive], check=True)
    subprocess.run(["scp", *common, str(helper), args.host + ":" + remote_helper], check=True)
    output = subprocess.check_output(
        ["ssh", *common, args.host, "python3", remote_helper, remote_archive, digest], text=True
    )
    print(json.dumps(json.loads(output), indent=2))


if __name__ == "__main__":
    main()
