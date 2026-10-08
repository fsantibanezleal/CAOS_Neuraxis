"""Repository-level artifact locations; no engine implementation lives here."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "data" / "derived"


def storage_path(name: str, category: str, child: str) -> Path:
    """Explicit product overrides win; user cache/data never defaults into Git."""
    if os.environ.get(name):
        return Path(os.environ[name]).expanduser().resolve()
    base = (
        os.environ.get("LOCALAPPDATA")
        if os.name == "nt"
        else os.environ.get("XDG_CACHE_HOME" if category == "cache" else "XDG_DATA_HOME")
    )
    fallback = Path.home() / (".cache" if category == "cache" else ".local/share")
    return (Path(base) if base else fallback) / "neuraxis" / child


CHECKPOINTS = storage_path("NEURAXIS_CHECKPOINTS", "cache", "checkpoints")
OPERATIONS_ROOT = storage_path("NEURAXIS_OPERATIONS_ROOT", "data", "operations")
FRONTEND = ROOT / "frontend" / "dist"
