#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -x .venv/bin/python ]]; then python3 -m venv .venv; fi
.venv/bin/python -m pip install -r requirements-api.txt -r requirements-dev.txt
if [[ "${1:-}" != "--skip-models" ]]; then
  # The published checkpoint archive is an engine release asset, not an app-version asset.
  model_release="v0.01.000"
  checkpoints="${NEURAXIS_CHECKPOINTS:-$(.venv/bin/python -c 'from app.config import CHECKPOINTS; print(CHECKPOINTS)')}"
  .venv/bin/python -m reflexmesh.cli fetch-models --destination "$checkpoints" --version "$model_release"
fi
cd frontend
npm ci
printf '%s\n' 'Setup complete. Build with npm run build from frontend/.' 'Start from the repository root: .venv/bin/python scripts/serve.py'
