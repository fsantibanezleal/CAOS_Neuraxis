#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
.venv/bin/python data-pipeline/run.py all --model "${NEURAXIS_MODEL:-qwen3.5:4b}"
.venv/bin/python scripts/check_artifacts.py
