"""Start the authenticated local workbench and explicit slow model adapter."""

import argparse
from pathlib import Path

from reflexmesh.cli import main

ROOT = Path(__file__).resolve().parents[1]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="qwen3.5:4b")
    parser.add_argument("--port", type=int, default=8151)
    parser.add_argument("--checkpoints", default=str(ROOT / "models" / "checkpoints"))
    parser.add_argument(
        "--workspace", help="operator-selected existing directory for verified user workflows"
    )
    parser.add_argument("--process-config", help="local JSON file of immutable process templates")
    args = parser.parse_args()
    raise SystemExit(
        main(
            [
                "serve",
                "--port",
                str(args.port),
                "--model",
                args.model,
                "--checkpoints",
                args.checkpoints,
                "--artifacts",
                str(ROOT / "data" / "derived"),
                "--static",
                str(ROOT / "frontend" / "dist"),
            ]
            + (["--workspace", args.workspace] if args.workspace else [])
            + (["--process-config", args.process_config] if args.process_config else [])
        )
    )
