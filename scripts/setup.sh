#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "${1:-}" == "--notebooks" ]]; then
  if [[ ! -x .venv-notebooks/bin/python ]]; then python3 -m venv .venv-notebooks; fi
  .venv-notebooks/bin/python -m pip install -r notebooks/requirements.txt
  printf '%s\n' 'Notebook environment ready. Run: python scripts/run_notebooks.py --check --tmp <device-temp-root>'
  exit 0
fi
if [[ ! -x .venv/bin/python ]]; then python3 -m venv .venv; fi
.venv/bin/python -m pip install -r requirements-api.txt -r requirements-dev.txt
if [[ "${1:-}" != "--skip-models" ]]; then
  # The published checkpoint archive is an engine release asset, not an app-version asset.
  # Checkpoints are independently versioned and recorded in product metadata.
  model_release="$(.venv/bin/python -c 'from app.config import CHECKPOINT_RELEASE; print(CHECKPOINT_RELEASE)')"
  checkpoints="${NEURAXIS_CHECKPOINTS:-$(.venv/bin/python -c 'from app.config import CHECKPOINTS; print(CHECKPOINTS)')}"
  .venv/bin/python -m reflexmesh.cli fetch-models --destination "$checkpoints" --version "$model_release"
fi
cd frontend
npm ci
printf '%s\n' 'Setup complete. Build with npm run build from frontend/.' 'Start from the repository root: .venv/bin/python scripts/serve.py'
