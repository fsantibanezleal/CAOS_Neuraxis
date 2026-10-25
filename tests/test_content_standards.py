from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_emoji_diagnostic_survives_windows_ansi_pipe(tmp_path: Path) -> None:
    repo = tmp_path / "content-standards"
    (repo / "scripts").mkdir(parents=True)
    shutil.copy2(ROOT / "scripts" / "check_content_standards.py", repo / "scripts" / "check_content_standards.py")
    (repo / "README.md").write_text("planted character: \U0001f600\n", encoding="utf-8")
    subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
    subprocess.run(["git", "add", "README.md", "scripts/check_content_standards.py"], cwd=repo, check=True)

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "cp1252"
    result = subprocess.run(
        [sys.executable, "scripts/check_content_standards.py"],
        cwd=repo,
        env=env,
        capture_output=True,
        timeout=30,
        check=False,
    )

    output = result.stdout.decode("utf-8")
    assert result.returncode == 1
    assert "README.md:1:20" in output
    assert "emoji (U+1F600" in output
