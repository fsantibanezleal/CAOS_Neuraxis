# Scripts

- `setup.ps1` / `setup.sh`: isolated Python dependencies and frontend installation.
- `dev.ps1` / `dev.sh`: frontend development server.
- `serve.py`: authenticated loopback native service with built frontend.
- `precompute.ps1` / `precompute.sh`: full scientific pipeline and artifact verification.
- `smoke.ps1` / `smoke.sh`: canonical artifacts, application tests and frontend build.
- `check_artifacts.py`: exact matrix coverage, trace digests and provenance.
- `check_template_residue.py`: inherited archetype-residue guard.
- `check_content_standards.py`: source/content typography guard.

No script uploads secrets or trains during deployment. Use explicit pipeline stages for research and checked canonical export for release.
