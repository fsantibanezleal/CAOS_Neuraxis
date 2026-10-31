"""Run the named source, scientific artifact, frontend and browser gates for a Neuraxis release."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PY = sys.executable
NPM = "npm.cmd" if os.name == "nt" and shutil.which("npm.cmd") else "npm"


def run(label: str, command: list[str], cwd: Path = ROOT, env: dict[str, str] | None = None) -> None:
    print(f"\n== {label} ==", flush=True)
    subprocess.run(command, cwd=cwd, check=True, env=env)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scope", choices=("source", "frontend", "release"), default="release")
    parser.add_argument("--live-url", help="run browser/content gates against a deployed QA origin")
    args = parser.parse_args()
    notebook_temp = os.environ.get("CAOS_TEMP_ROOT", "").strip()
    if args.scope in {"source", "release"}:
        if not notebook_temp:
            parser.error("set CAOS_TEMP_ROOT to a device temp directory outside the repository before the fresh-kernel notebook gate")
        temp_path = Path(notebook_temp).resolve()
        if temp_path == ROOT or ROOT in temp_path.parents:
            parser.error("CAOS_TEMP_ROOT must be outside the repository")
    source_checks = [
        ("content rules", [PY, "scripts/check_content_standards.py"]),
        ("CI budget", [PY, "scripts/check_ci_budget.py"]),
        ("version coherence", [PY, "scripts/check_version_coherence.py"]),
        ("deployment place", [PY, "scripts/check_deploy_place.py"]),
        ("software design", [PY, "scripts/check_sdd.py"]),
        ("manuscripts", [PY, "scripts/check_manuscripts.py"]),
        ("schema contract versions", [PY, "scripts/check_contract_versions.py"]),
        ("contract declarations", [PY, "scripts/check_contracts.py", "docs/contracts/catalog.md", "--repo-root", "."]),
        ("persisted document schemas", [PY, "scripts/check_documents.py"]),
        ("contract catalog", [PY, "scripts/check_contract_catalog.py"]),
        ("contract readiness", [PY, "scripts/check_readiness.py"]),
        ("base integrity", [PY, "scripts/check_base_integrity.py"]),
        ("documentation paths", [PY, "scripts/check_doc_paths.py"]),
        ("shell and web baseline", [PY, "scripts/check_web_baseline.py"]),
        ("SVG motion accessibility", [PY, "scripts/check_svg_animation.py"]),
        ("provider skeleton", [PY, "scripts/check_skeleton.py", "docs/contracts/catalog.md"]),
        ("template residue", [PY, "scripts/check_template_residue.py"]),
        ("contract and adversarial tests", [PY, "-m", "pytest", "tests/contracts", "tests/adversarial", "-q"]),
        ("notebook structure", [PY, "scripts/check_notebooks.py"]),
        ("reader-facing method names", [PY, "scripts/check_internal_names.py"]),
        ("notebook execution and output freshness", [PY, "scripts/run_notebooks.py", "--check", "--tmp", notebook_temp]),
        ("README repository areas", [PY, "scripts/check_readme_areas.py"]),
        ("template adoption and deployment target", [PY, "scripts/check_template_adoption.py"]),
        ("core research artifacts", [PY, "scripts/check_artifacts.py"]),
        ("research reports", [PY, "scripts/check_research.py"]),
        ("semantic transfer", [PY, "scripts/check_semantic_transfer.py"]),
        ("semantic routing", [PY, "scripts/check_semantic_routing.py"]),
        ("native operation study", [PY, "scripts/check_operations.py"]),
        ("complete Python test suite", [PY, "-m", "pytest", "tests", "-q"]),
    ]
    for label, command in source_checks:
        run(label, command)
    if args.scope == "source":
        return 0
    frontend = ROOT / "frontend"
    live_env = os.environ.copy()
    if args.live_url:
        live_env["NEURAXIS_QA_URL"] = args.live_url
    run("frontend formatting", [NPM, "run", "format:check"], frontend)
    run("frontend tests", [NPM, "test", "--", "--reporter=dot"], frontend)
    run("frontend production build", [NPM, "run", "build"], frontend)
    if args.scope == "release":
        run("audited static package", [PY, "scripts/package_static.py"])
        if args.live_url:
            run("live shell interaction gate", ["node", "scripts/gate.mjs", "--require-focus"], frontend, live_env)
            run("live scientific content gate", ["node", "verify-content.mjs"], frontend, live_env)
    print("product gates: all selected gates passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        raise SystemExit(exc.returncode or 1)
