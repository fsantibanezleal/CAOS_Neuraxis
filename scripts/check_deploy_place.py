#!/usr/bin/env python3
"""One declared deployment topology, decided first (ADR-0055).

deploy/TARGET names the place: `pages`, `vps`, or the product's explicit `vps-static+vps-service` topology. A Pages
product carries the Pages workflow and no VPS files. A VPS product carries its unit/site files and no Pages workflow.
The split static/service topology must declare both the static host and the bounded service on its VPS deployment.
Stdlib only. Usage: python scripts/check_deploy_place.py
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    target_file = ROOT / "deploy" / "TARGET"
    if not target_file.exists():
        print("deploy place: deploy/TARGET is missing (pages or vps, decided before the first deploy)")
        return 1
    # TARGET is a small YAML-like record.  Its first non-empty line is the
    # topology key; parsing the whole record as the key rejects valid records.
    target = next((line.split(":", 1)[1].strip() for line in target_file.read_text(encoding="utf-8").splitlines()
                   if line.strip().startswith("target:") and ":" in line), "")
    if target not in {"pages", "vps", "vps-static+vps-service"}:
        print(f"deploy place: unsupported target {target!r}; expected pages, vps, or vps-static+vps-service")
        return 1
    if (ROOT / ".template-source").exists():
        print(f"deploy place: OK, {target} (template: both on-ramps kept until instantiation)")
        return 0
    pages_workflow = (ROOT / ".github" / "workflows" / "deploy-pages.yml").exists()
    deploy = ROOT / "deploy"
    vps_files = sorted(p.name for p in deploy.glob("*") if p.suffix in {".service", ".nginx"} or p.name.endswith(".nginx.tls"))
    errs = []
    if target == "pages":
        if not pages_workflow:
            errs.append("the target is pages and .github/workflows/deploy-pages.yml is missing")
        if vps_files:
            errs.append(f"the target is pages and VPS files remain: {', '.join(vps_files)}")
    else:
        if pages_workflow:
            errs.append("the target is vps and the Pages workflow remains (two deploy places)")
        if not vps_files:
            errs.append("the target is vps and deploy/ holds no unit or site file")
        if target == "vps-static+vps-service":
            if not any(p.suffix == ".service" for p in deploy.glob("*")):
                errs.append("the split VPS target has no bounded service unit")
            if not any(p.suffix == ".nginx" or p.name.endswith(".nginx.tls") for p in deploy.glob("*")):
                errs.append("the split VPS target has no static host configuration")
    for e in errs:
        print(f"deploy place: {e}")
    if not errs:
        print(f"deploy place: OK, {target} only")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
