#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
.venv/bin/python scripts/check_artifacts.py
.venv/bin/python -m pytest
cd frontend
npm run build
