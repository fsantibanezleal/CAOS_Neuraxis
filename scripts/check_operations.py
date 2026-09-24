"""Validate persisted compound evidence without executing workloads."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def validate(root=ROOT, directory=None):
    directory = directory or root / "data/operations"
    index = json.loads((directory / "index.json").read_text(encoding="utf8"))
    rows, seeds = index["runs"], index["seeds"]
    expected = {
        (t, v, s)
        for t in ("release", "source", "data")
        for v in ("clean", "corrupt", "conflict", "compound")
        for s in range(70000, 70000 + seeds)
    }
    assert len(rows) == len(expected) and {(r["task"], r["variant"], r["seed"]) for r in rows} == expected
    for path, sha in index["source_sha256"].items():
        assert hashlib.sha256((root / path).read_bytes()).hexdigest() == sha, path
    for row in rows:
        path = (directory / row["path"]).resolve()
        assert path.parent == directory.resolve()
        raw = path.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == row["sha256"]
        value = json.loads(raw)
        assert row["status"] == value["status"]
        assert value["metrics"]["native_receipts"] == len(value["nodes"])
        assert value["artifacts"]["verify"]["passed"]
        assert value["disposition"] == (
            "checks_passed" if row["variant"] == "clean" else "attention_required"
        )
        assert (
            value["input_sha256"]
            == hashlib.sha256(
                (json.dumps(value["inputs"], ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()
            ).hexdigest()
        )
    return {
        "runs": len(rows),
        "coverage": "3 tasks x 4 fault conditions x " + str(seeds) + " seeds",
        "verified": True,
    }


if __name__ == "__main__":
    print(json.dumps(validate(), indent=2))
