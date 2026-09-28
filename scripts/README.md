# Scripts

- `setup.ps1` / `setup.sh`: isolated Python dependencies and frontend installation.
- `dev.ps1` / `dev.sh`: frontend development server.
- `serve.py`: authenticated loopback native service with built frontend.
- `precompute.ps1` / `precompute.sh`: full scientific pipeline and artifact verification.
- `smoke.ps1` / `smoke.sh`: canonical artifacts, application tests and frontend build.
- `check_artifacts.py`: exact matrix coverage, trace digests and provenance.
- `check_semantic_transfer.py`: separate 1,536-cell semantic matrix, lineage, hashes, aggregate results and paired comparisons.
- `check_semantic_routing.py`: binds the exploratory 32-case held-out arm-selection study to hashed M04/M09 execution traces and recomputes every comparator.
- `check_template_residue.py`: inherited archetype-residue guard.
- `check_content_standards.py`: source/content typography guard.

No script uploads secrets or trains during deployment. Use explicit pipeline stages for research and checked canonical export for release.
