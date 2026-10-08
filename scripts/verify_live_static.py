"""Verify a deployed Neuraxis archive by its live release manifest and key bytes.

The full archive is checked before installation. This HTTPS check confirms the
served commit, direct science routes, entry assets, and the evidence files that
the new research panel consumes. It deliberately does not treat HTTP 200 as a
substitute for browser interaction checks.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import urllib.request
from pathlib import Path

ROUTES = ("/introduction", "/methodology", "/implementation", "/experiments", "/benchmark")
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = (
    "data/index.json",
    "data/semantic-transfer/index.json",
    "data/semantic-routing-study/analysis.json",
    "operations/index.json",
)


def fetch(base: str, path: str) -> bytes:
    with urllib.request.urlopen(base.rstrip("/") + "/" + path.lstrip("/"), timeout=30) as response:
        if response.status != 200:
            raise ValueError(f"{path}: HTTP {response.status}")
        return response.read()


def verify(base: str, commit: str, version: str) -> dict:
    manifest = json.loads(fetch(base, "release.json"))
    if manifest["commit"] != commit or manifest["version"] != version:
        raise ValueError("served release does not match the selected commit and version")
    files = {row["path"]: row for row in manifest["files"]}
    entry = fetch(base, "index.html").decode("utf-8")
    assets = re.findall(r"/assets/[A-Za-z0-9_.-]+\.(?:js|css)", entry)
    # Chunk boundaries are a build choice: verify every emitted code/style bundle,
    # including lazy views, whether Benchmark is split or in the entry module.
    bundles = [path for path in files if re.fullmatch(r"assets/[A-Za-z0-9_.-]+\.(?:js|css)", path)]
    paths = sorted(set(["index.html", *[path.lstrip("/") for path in assets], *bundles, *EVIDENCE]))
    if (
        not any(path.endswith(".js") for path in assets)
        or not any(path.endswith(".css") for path in assets)
        or any(path not in files for path in paths)
    ):
        raise ValueError("entry assets or evidence absent from release manifest")
    checked = []
    for path in paths:
        raw = fetch(base, path)
        digest = hashlib.sha256(raw).hexdigest()
        if digest != files[path]["sha256"] or len(raw) != files[path]["size"]:
            raise ValueError(f"served file differs from release manifest: {path}")
        checked.append({"path": path, "bytes": len(raw), "sha256": digest})
    for route in ROUTES:
        if '<div id="root"' not in fetch(base, route).decode("utf-8"):
            raise ValueError(f"direct route did not serve the application: {route}")
    return {
        "schema": "neuraxis.live-static-verification/v1",
        "base": base,
        "commit": commit,
        "version": manifest["version"],
        "manifest_files": len(files),
        "verified_files": checked,
        "direct_routes": list(ROUTES),
        "canonical_coverage": manifest["canonical_coverage"],
        "semantic_coverage": manifest["semantic_coverage"],
        "routing_coverage": manifest["routing_coverage"],
        "operation_coverage": manifest["operation_coverage"],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="https://neuraxis.ml.fasl-work.com")
    parser.add_argument("--commit", required=True)
    parser.add_argument("--version", default=(ROOT / "VERSION").read_text().strip())
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = verify(args.base, args.commit, args.version)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "commit": report["commit"],
                "files": report["manifest_files"],
                "verified": len(report["verified_files"]),
                "routes": len(report["direct_routes"]),
            }
        )
    )
