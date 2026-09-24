"""Start all local workbench modes with a fresh in-memory browser session."""

import argparse
import os
import secrets
import sys
import threading
import webbrowser
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", help="explicit installed Ollama model for planner methods")
    parser.add_argument("--port", type=int, default=8151)
    parser.add_argument("--checkpoints", default=str(ROOT / "models" / "checkpoints"))
    parser.add_argument(
        "--workspace", help="operator-selected existing directory for verified user workflows"
    )
    parser.add_argument("--process-config", help="local JSON file of immutable process templates")
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("port must be between 1024 and 65535")
    if not (ROOT / "frontend" / "dist" / "index.html").is_file():
        parser.error("Build the frontend first: cd frontend; npm ci; npm run build")
    if args.workspace and not Path(args.workspace).is_dir():
        parser.error("workspace must be an existing directory")
    if args.process_config and not args.workspace:
        parser.error("--process-config requires --workspace")
    token = os.environ.setdefault("REFLEXMESH_LOCAL_TOKEN", secrets.token_urlsafe(32))
    os.environ["NEURAXIS_PORT"] = str(args.port)
    os.environ["NEURAXIS_CHECKPOINTS"] = str(Path(args.checkpoints).resolve())
    for name, value in [
        ("NEURAXIS_MODEL", args.model),
        ("NEURAXIS_WORKSPACE", args.workspace),
        ("NEURAXIS_PROCESS_CONFIG", args.process_config),
    ]:
        if value:
            os.environ[name] = str(Path(value).resolve()) if name != "NEURAXIS_MODEL" else value
        else:
            os.environ.pop(name, None)
    sys.path.insert(0, str(ROOT))
    url = f"http://127.0.0.1:{args.port}/"
    if not args.no_browser:
        timer = threading.Timer(1.5, webbrowser.open, args=[url + "#local-session=" + token])
        timer.daemon = True
        timer.start()
    print(f"Neuraxis: {url} (local session; no account password required)")
    uvicorn.run("app.main:create_app", factory=True, host="127.0.0.1", port=args.port)
