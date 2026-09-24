"""Transfer and install an already built static archive through authenticated SSH."""

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--identity", type=Path, required=True)
    parser.add_argument("--host", default="root@89.167.4.175")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+", args.host):
        parser.error("host must be an explicit SSH user@host")
    archive = args.archive.resolve(strict=True)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    remote_archive = f"/tmp/neuraxis-{digest}.tar.gz"
    helper = ROOT / "deploy" / "install_static.py"
    helper_hash = hashlib.sha256(helper.read_bytes()).hexdigest()
    remote_helper = f"/tmp/neuraxis-install-{helper_hash}.py"
    common = ["-i", str(args.identity.resolve(strict=True)), "-o", "BatchMode=yes"]
    subprocess.run(["scp", *common, str(archive), args.host + ":" + remote_archive], check=True)
    subprocess.run(["scp", *common, str(helper), args.host + ":" + remote_helper], check=True)
    result = subprocess.check_output(
        ["ssh", *common, args.host, "python3", remote_helper, remote_archive, digest], text=True
    )
    print(json.dumps(json.loads(result), indent=2))


if __name__ == "__main__":
    main()
