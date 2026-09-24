# Repository structure

- `frontend/`: React/Vite shared CAOS shell, bilingual workbench, browser execution and trace rendering.
- `app/`: FastAPI composition of the separately published reflexmesh service. No internal engine package.
- `data-pipeline/run.py`: script orchestration for scientific stages and verified export.
- `data/raw/`: external source acquisitions, excluded from Git.
- `data/cache/`: training/evaluation workspace, excluded from Git.
- `data/derived/`: compact canonical index, episode manifests, execution traces and evaluation summaries.
- `models/`: model acquisition/lineage documentation; binary training outputs are release assets.
- `manifests/`: release and data lineage contracts.
- `scripts/`: setup, service, validation, build and reproduction entry points.
- `tests/`: application composition and artifact-boundary checks.
- `docs/`: research, scientific method, cases, architecture, operation and workbench documentation.
- `deploy/`: static serving configurations and independent deployment instructions.

The offline scientific lane generates immutable artifacts. Frontend builds only validate/copy them. Request handlers load checkpoints and run bounded instances; they never train or silently rewrite canonical benchmark results.
