"""Repository-level artifact locations; no engine implementation lives here."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "data" / "derived"
CHECKPOINTS = ROOT / "models" / "checkpoints"
FRONTEND = ROOT / "frontend" / "dist"
