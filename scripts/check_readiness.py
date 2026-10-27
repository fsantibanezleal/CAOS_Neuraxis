"""Fail when committed readiness differs from the current contract catalog and evidence paths."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "data-pipeline"))

from pipeline.readiness import build_readiness, write_readiness  # noqa: E402


def validate(root: Path = ROOT, refresh: bool = False) -> dict:
    expected = build_readiness(root)
    destination = root / "data/derived/readiness.json"
    if refresh:
        return write_readiness(root)
    actual = json.loads(destination.read_text(encoding="utf-8"))
    if actual != expected:
        raise ValueError("readiness is stale; run python data-pipeline/run.py readiness")
    if destination.read_bytes() != (json.dumps(expected, ensure_ascii=False, indent=2) + "\n").encode():
        raise ValueError("readiness bytes are not canonical; run python data-pipeline/run.py readiness")
    unavailable = [row["id"] for row in expected["contracts"] if row["state"] != "available"]
    if unavailable:
        raise ValueError("contract evidence is unavailable: " + ", ".join(unavailable))
    return {"contracts": len(expected["contracts"]), "catalog_sha256": expected["catalog_sha256"]}


if __name__ == "__main__":
    try:
        result = validate(refresh="--write" in sys.argv[1:])
        print("readiness: " + json.dumps(result, sort_keys=True))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"readiness: stale: {exc}")
        raise SystemExit(1)
