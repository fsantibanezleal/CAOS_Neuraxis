"""Execute the repository's bounded, read-only notebook cells and compare their stored outputs."""

from __future__ import annotations

import contextlib
import io
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

EXPECTED = (
    "en/01-core-evidence.ipynb",
    "es/01-evidencia-central.ipynb",
    "en/02-transfer-and-routing.ipynb",
    "es/02-transferencia-y-enrutamiento.ipynb",
)


def execute(source: str) -> str:
    output = io.StringIO()
    old = os.environ.get("NEURAXIS_REPO_ROOT")
    os.environ["NEURAXIS_REPO_ROOT"] = str(ROOT)
    try:
        with contextlib.redirect_stdout(output):
            exec(compile(source, "<notebook-cell>", "exec"), {"__name__": "__main__", "os": os})
    finally:
        if old is None:
            os.environ.pop("NEURAXIS_REPO_ROOT", None)
        else:
            os.environ["NEURAXIS_REPO_ROOT"] = old
    return output.getvalue()


def main() -> int:
    failures = []
    for relative in EXPECTED:
        path = ROOT / "notebooks" / relative
        notebook = json.loads(path.read_text(encoding="utf-8"))
        code_cells = [cell for cell in notebook["cells"] if cell.get("cell_type") == "code"]
        if len(code_cells) != 1:
            failures.append(f"{relative}: expected one bounded read-only analysis cell")
            continue
        cell = code_cells[0]
        source = "".join(cell["source"])
        if any(marker in source for marker in ("write_text(", "to_csv(", "subprocess.", "requests.")):
            failures.append(f"{relative}: notebook code is not read-only")
            continue
        actual = execute(source)
        stored = "".join(cell["outputs"][0].get("text", []))
        if actual != stored:
            failures.append(f"{relative}: recorded output differs from current source evidence; run scripts/build_notebooks.py")
        else:
            print(f"notebook: {relative}: current")
    if failures:
        for error in failures:
            print(f"notebook: {error}")
        return 1
    print(f"notebooks: {len(EXPECTED)} executed, all source-bound outputs current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
