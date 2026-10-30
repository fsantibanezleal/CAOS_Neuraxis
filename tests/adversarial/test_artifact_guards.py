from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]


def run_guard(script: str, tmp_path: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run([sys.executable, str(ROOT / "scripts" / script), "--root", str(tmp_path)], capture_output=True, text=True, check=False)


def test_adversarial_core_matrix_guard_fails_closed(tmp_path: Path) -> None:
    result = run_guard("check_artifacts.py", tmp_path)
    assert result.returncode != 0
    assert "index.json" in result.stdout + result.stderr


def test_adversarial_transfer_guard_fails_closed(tmp_path: Path) -> None:
    result = run_guard("check_semantic_transfer.py", tmp_path)
    assert result.returncode != 0
    assert "index.json" in result.stdout + result.stderr
