"""Neuraxis application composition using the separately distributed engine."""

from __future__ import annotations

import os
from pathlib import Path

from reflexmesh.planners import OllamaPlanner
from reflexmesh.server import create_app as engine_app

ROOT = Path(__file__).resolve().parents[1]


def create_app():
    token = os.environ.get("REFLEXMESH_LOCAL_TOKEN")
    if not token:
        raise RuntimeError(
            "Set REFLEXMESH_LOCAL_TOKEN or start with scripts/serve.py for a fresh local session"
        )
    model = os.environ.get("NEURAXIS_MODEL")
    return engine_app(
        checkpoints=os.environ.get("NEURAXIS_CHECKPOINTS", ROOT / "models" / "checkpoints"),
        artifacts=ROOT / "data" / "derived",
        static=ROOT / "frontend" / "dist",
        token=token,
        planner=OllamaPlanner(model) if model else None,
        workspace=os.environ.get("NEURAXIS_WORKSPACE"),
    )
