"""The import stage of the four evidence documents the product commits but does not compute: the research summary, the
benchmark adequacy audit, the semantic-routing study and the semantic-transfer report.

Each is written by a script of the engine repository over the engine's own large ``artifacts/`` (the producer of record is
named in ``docs/contracts/evidence-provenance.json``). Copying that code here is not allowed and the artifacts are not the
product's, so the product's producer is this import of the engine's published file at a pinned commit: read, verified by
full SHA-256 against the provenance file, validated against its schema, then written. Any failure stops before anything
is written. A release operation: never run in CI (CI only checks the committed digests, offline, through a test)."""
from __future__ import annotations

import hashlib
import json
import subprocess
import urllib.error
import urllib.request
from collections.abc import Callable
from pathlib import Path

from .validation import check_document

ROOT = Path(__file__).resolve().parents[2]
PROVENANCE = ROOT / "docs" / "contracts" / "evidence-provenance.json"
RAW_URL = "https://raw.githubusercontent.com/{repository}/{commit}/{path}"
TIMEOUT_SECONDS = 60

Reader = Callable[[dict], bytes]


def load_provenance(path: Path = PROVENANCE) -> list[dict]:
    return json.loads(Path(path).read_text(encoding="utf-8"))["documents"]


def online_reader() -> Reader:
    """Read an engine file from the public raw URL at its pinned commit."""

    def read(entry: dict) -> bytes:
        url = RAW_URL.format(repository=entry["engine_repository"], commit=entry["engine_commit"], path=entry["engine_path"])
        try:
            with urllib.request.urlopen(url, timeout=TIMEOUT_SECONDS) as response:
                return response.read()
        except (urllib.error.URLError, OSError) as exc:
            raise ValueError(f"cannot read {url}: {exc}; use --offline <engine checkout> on a machine without network") from exc

    return read


def offline_reader(checkout: Path, commit: str) -> Reader:
    """Read an engine file from a local checkout whose HEAD is the pinned commit, as git stores it (no line-ending change)."""
    head = subprocess.run(["git", "-C", str(checkout), "rev-parse", "HEAD"], capture_output=True, text=True, check=False)
    if head.returncode != 0 or head.stdout.strip() != commit:
        raise ValueError(f"{checkout} is not at the pinned commit {commit} (HEAD is {head.stdout.strip() or head.stderr.strip()})")

    def read(entry: dict) -> bytes:
        shown = subprocess.run(["git", "-C", str(checkout), "show", f"{commit}:{entry['engine_path']}"], capture_output=True, check=False)
        if shown.returncode != 0:
            raise ValueError(f"cannot read {entry['engine_path']} at {commit} in {checkout}: {shown.stderr.decode().strip()}")
        return shown.stdout

    return read


def import_evidence(provenance: Path, out_root: Path, read: Reader) -> dict:
    """Verify and validate every document first, then write them all under ``out_root`` at their repository paths."""
    verified: list[tuple[Path, bytes]] = []
    for entry in load_provenance(provenance):
        raw = read(entry)
        digest = hashlib.sha256(raw).hexdigest()
        if digest != entry["sha256"]:
            raise ValueError(f"{entry['neuraxis_path']}: digest {digest} differs from the provenance digest {entry['sha256']}")
        try:
            document = json.loads(raw)
        except ValueError as exc:
            raise ValueError(f"{entry['neuraxis_path']}: not JSON ({exc})") from exc
        check_document(entry["contract"], document, entry["neuraxis_path"])
        verified.append((Path(out_root) / entry["neuraxis_path"], raw))
    for target, raw in verified:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
    return {"documents": len(verified), "paths": [t.as_posix() for t, _ in verified]}
