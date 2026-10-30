"""Live byte checks cover eager and split builds without assuming chunk names."""

import hashlib
import json
from pathlib import Path

import pytest

from scripts import verify_live_static as live

VERSION = (Path(__file__).resolve().parents[1] / "VERSION").read_text(encoding="utf-8").strip()


@pytest.mark.parametrize("split", [False, True])
def test_verify_every_emitted_bundle(monkeypatch, split):
    entry = (
        b'<div id="root"></div><script src="/assets/index-a.js"></script><link href="/assets/index-a.css">'
    )
    content = {
        "index.html": entry,
        "assets/index-a.js": b"entry",
        "assets/index-a.css": b"css",
        "assets/Workbench-b.js": b"lazy",
    }
    if split:
        content["assets/Benchmark-c.js"] = b"benchmark"
    content.update({name: b"{}" for name in live.EVIDENCE})
    manifest = {
        "commit": "source",
        "version": VERSION,
        "files": [
            {"path": p, "size": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
            for p, raw in content.items()
        ],
        **{
            name: {}
            for name in ["canonical_coverage", "semantic_coverage", "routing_coverage", "operation_coverage"]
        },
    }

    def fetch(base, path):
        if path == "release.json":
            return json.dumps(manifest).encode()
        if path in live.ROUTES:
            return entry
        return content[path]

    monkeypatch.setattr(live, "fetch", fetch)
    report = live.verify("https://example.test", "source", VERSION)
    assert "assets/Workbench-b.js" in {row["path"] for row in report["verified_files"]}
    content["assets/Workbench-b.js"] = b"tampered"
    with pytest.raises(ValueError, match="served file differs"):
        live.verify("https://example.test", "source", VERSION)
