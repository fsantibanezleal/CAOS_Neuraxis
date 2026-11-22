"""The repository gate must enforce both content bars and keep scopes separate."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("neuraxis_product_gates", ROOT / "scripts" / "check_product_gates.py")
assert SPEC is not None and SPEC.loader is not None
GATES = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATES)


def test_source_scope_requires_both_depth_and_coverage_checks(monkeypatch, tmp_path):
    calls = []
    monkeypatch.setattr(GATES, "run", lambda label, command, cwd=ROOT, env=None: calls.append((label, command)))
    monkeypatch.setattr(sys, "argv", ["check_product_gates.py", "--scope", "source"])
    monkeypatch.setenv("CAOS_TEMP_ROOT", str(tmp_path))

    assert GATES.main() == 0

    checks = {label: command for label, command in calls}
    assert checks["manuscript content depth and coverage"] == [sys.executable, "scripts/check_manuscript_depth.py", "."]
    assert checks["notebook content depth and coverage"] == [sys.executable, "scripts/check_notebook_depth.py", "."]


def test_frontend_scope_does_not_run_source_or_notebook_gates(monkeypatch):
    calls = []
    monkeypatch.setattr(GATES, "run", lambda label, command, cwd=ROOT, env=None: calls.append((label, command)))
    monkeypatch.setattr(sys, "argv", ["check_product_gates.py", "--scope", "frontend"])
    monkeypatch.delenv("CAOS_TEMP_ROOT", raising=False)

    assert GATES.main() == 0
    assert [label for label, _ in calls] == ["frontend formatting", "frontend tests", "frontend production build"]


def test_ci_and_release_workflows_enforce_content_depth():
    expected = {"scripts/check_manuscript_depth.py", "scripts/check_notebook_depth.py"}
    for workflow in (ROOT / ".github/workflows/ci.yml", ROOT / ".github/workflows/build-release.yml"):
        commands = {line.strip().removeprefix("- run: python ").removesuffix(" .") for line in workflow.read_text(encoding="utf-8").splitlines() if line.startswith("      - run: python scripts/")}
        assert expected <= commands
