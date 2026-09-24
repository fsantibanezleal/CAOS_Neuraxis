"""Install an allowlisted operation bundle; health check before nginx exposure."""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request
from pathlib import Path

FILES = {
    "app/operations_api.py",
    "app/services/operations.py",
    "requirements-operations.txt",
    "deploy/neuraxis-operations.service",
    "deploy/neuraxis.nginx.tls",
    "VERSION",
    "commit.txt",
}
BASE = Path("/opt/neuraxis-operations")


def unpack(archive, expected, directory):
    if (
        not re.fullmatch(r"[0-9a-f]{64}", expected)
        or hashlib.sha256(archive.read_bytes()).hexdigest() != expected
    ):
        raise ValueError("Operation archive hash mismatch")
    with tarfile.open(archive, "r:gz") as bundle:
        members = bundle.getmembers()
        if {m.name for m in members} != FILES or len(members) != len(FILES):
            raise ValueError("Operation archive must match the source allowlist")
        if any(not m.isfile() or m.size > 1_048_576 for m in members):
            raise ValueError("Operation archive contains nonregular or oversized members")
        for member in members:
            target = directory / member.name
            target.parent.mkdir(parents=True, exist_ok=True)
            source = bundle.extractfile(member)
            with source, target.open("wb") as output:
                shutil.copyfileobj(source, output)
            target.chmod(0o644)
    commit = (directory / "commit.txt").read_text().strip()
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Invalid source commit")
    return commit


def run(*args):
    subprocess.run(args, check=True, stdout=sys.stderr)


def switch(path, target):
    candidate = path.with_name(path.name + ".next")
    candidate.unlink(missing_ok=True)
    candidate.symlink_to(target, target_is_directory=True)
    os.replace(candidate, path)


def install(archive, digest):
    import pwd

    releases = BASE / "releases"
    releases.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="incoming-", dir=releases) as temporary:
        staging = Path(temporary)
        commit = unpack(archive, digest, staging)
        release = releases / (commit[:12] + "-" + digest[:12])
        if release.exists():
            raise ValueError("Operation release already exists")
        for directory in [staging, *[p for p in staging.rglob("*") if p.is_dir()]]:
            directory.chmod(0o755)
        staging.rename(release)
    try:
        pwd.getpwnam("neuraxis-operations")
    except KeyError:
        run(
            "useradd",
            "--system",
            "--home-dir",
            "/var/lib/neuraxis-operations",
            "--shell",
            "/usr/sbin/nologin",
            "neuraxis-operations",
        )
    venv = BASE / "venv"
    if not (venv / "bin/python").exists():
        run("python3", "-m", "venv", str(venv))
    run(
        str(venv / "bin/python"),
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "-r",
        str(release / "requirements-operations.txt"),
    )
    current = BASE / "current"
    previous = current.resolve() if current.is_symlink() else None
    unit = Path("/etc/systemd/system/neuraxis-operations.service")
    nginx = Path("/etc/nginx/sites-available/neuraxis")
    old_unit = unit.read_bytes() if unit.exists() else None
    old_nginx = nginx.read_bytes()
    try:
        switch(current, release)
        unit.write_bytes((release / "deploy/neuraxis-operations.service").read_bytes())
        run("systemctl", "daemon-reload")
        run("systemctl", "restart", "neuraxis-operations")
        for attempt in range(30):
            try:
                request = urllib.request.Request(
                    "http://127.0.0.1:8174/operations-api/config",
                    headers={"Host": "neuraxis.ml.fasl-work.com"},
                )
                with urllib.request.urlopen(request, timeout=2) as response:
                    config = json.load(response)
                if len(config["tasks"]) != 3:
                    raise ValueError("Incorrect operation service")
                break
            except OSError:
                if attempt == 29:
                    raise
                time.sleep(1)
        nginx.write_bytes((release / "deploy/neuraxis.nginx.tls").read_bytes())
        run("nginx", "-t")
        run("systemctl", "reload", "nginx")
        run("systemctl", "enable", "neuraxis-operations")
    except Exception:  # Restore this service and hostname before surfacing failure.
        nginx.write_bytes(old_nginx)
        if old_unit is not None:
            unit.write_bytes(old_unit)
        if previous:
            switch(current, previous)
            run("systemctl", "daemon-reload")
            run("systemctl", "restart", "neuraxis-operations")
        else:
            run("systemctl", "stop", "neuraxis-operations")
        run("nginx", "-t")
        run("systemctl", "reload", "nginx")
        raise
    return {"commit": commit, "release": str(release), "archive_sha256": digest, "port": 8174}


if __name__ == "__main__":
    print(json.dumps(install(Path(sys.argv[1]), sys.argv[2])))
