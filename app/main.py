"""Neuraxis application composition using the separately distributed engine."""

from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

from reflexmesh.planners import OllamaPlanner
from reflexmesh.server import create_app as engine_app
from reflexmesh.workflows import process_templates
from starlette.routing import Mount

from app.operations_api import create_app as operations_app

ROOT = Path(__file__).resolve().parents[1]


def create_app():
    token = os.environ.get("REFLEXMESH_LOCAL_TOKEN")
    if not token:
        raise RuntimeError(
            "Set REFLEXMESH_LOCAL_TOKEN or start with scripts/serve.py for a fresh local session"
        )
    model = os.environ.get("NEURAXIS_MODEL")
    config = os.environ.get("NEURAXIS_PROCESS_CONFIG")
    templates = ()
    if config:
        if not os.environ.get("NEURAXIS_WORKSPACE"):
            raise ValueError("Process configuration requires a workspace")
        path = Path(config)
        if path.stat().st_size > 1_048_576:
            raise ValueError("Process configuration exceeds 1 MiB")
        templates = process_templates(json.loads(path.read_text(encoding="utf-8")))
    app = engine_app(
        checkpoints=os.environ.get("NEURAXIS_CHECKPOINTS", ROOT / "models" / "checkpoints"),
        artifacts=ROOT / "data" / "derived",
        static=ROOT / "frontend" / "dist",
        token=token,
        planner=OllamaPlanner(model) if model else None,
        workspace=os.environ.get("NEURAXIS_WORKSPACE"),
        process_templates=templates,
    )
    operations = operations_app(
        root=os.environ.get("NEURAXIS_OPERATIONS_ROOT", ROOT / ".runtime" / "operations"),
        host="127.0.0.1:" + os.environ.get("NEURAXIS_PORT", "8151"),
        prefix="",
    )
    engine_lifespan = app.router.lifespan_context

    @asynccontextmanager
    async def lifespan(application):
        async with engine_lifespan(application), operations.router.lifespan_context(operations):
            yield

    app.router.lifespan_context = lifespan
    # Mount before the engine's static SPA fallback. Both retain their own authority checks.
    app.router.routes.insert(0, Mount("/operations-api", app=operations))
    return app
