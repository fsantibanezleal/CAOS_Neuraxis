# Neuraxis documentation

Use [matched investigations and fresh local execution](workbench/investigations.md) to compare semantic decisions and actual file effects.

Read the [corrected scientific results](evaluation/corrected-results.md) for the full comparison and negative findings, and the [software design](design/SDD.md) for contracts and requirement gates. The [specification area](design/README.md) explains how the design, the requirements and their adversarial validation are guarded. The [contract catalog](contracts/catalog.md) lists the thirteen contracts (every committed document kind and the operations API) with their schemas, providers and missing-data states; `data/derived/readiness.json` says, row by row, what is real in a build and the site labels each view with it.

The [benchmark adequacy audit](evaluation/benchmark-adequacy.md) exposes the frozen core's state-machine ceiling and seed-invariant outcomes. The Benchmark page displays its source-bound counts beside the original results.

Use [operational tasks](workbench/operations.md) for the default real-file workflows and [the rebuild research](research/06-operational-rebuild.md) for their evidence boundaries.

Start with [architecture](architecture.md) to understand the authority, learned state and asynchronous planning boundaries. [Guides](guides.md) cover local execution and reproduction. [Frameworks](frameworks.md) identifies each distinct scientific method; [cases](cases.md) defines actual effect truth and controlled fault variants.

The [research dossiers](research/README.md) preserve the initial primary-source review and its evidence labels. Their historical research-only status describes that review pass. Current software behavior is documented in the architecture and code, while measured results live in the canonical artifact index with source/model/split hashes. A paper claim, implemented algorithm and reproduced experiment are distinct records.

The site lands on the Introduction (the root and every unknown path render the shell landing, which opens the Introduction), and its executive view comes first: the industry problem Neuraxis answers, framed for a decision maker in English and Spanish from `content/executive.json`, with a linked source for every figure. The header lists six routes in the shell's standard order: the App at `/app` (Tasks, Investigations and the engine and local workspace, held in `?mode=`), Introduction, Methodology, Implementation, Experiments and Benchmark; an old App link such as `/?mode=investigations` is forwarded to `/app` with its query string and hash. Content is bilingual and supports light/dark themes. It displays execution lane, raw decision evidence, calibration targets, unresolved outcomes, workload limitations and source citations. See the workbench and theory subdirectories for their linked explanations.

The reusable engine's [runtime documentation](https://github.com/fsantibanezleal/reflexmesh/blob/main/docs/runtime.md) is authoritative for registered-tool contracts, native admission and recovery semantics.

## Repository structure

- `frontend/`: React/Vite shared CAOS shell, bilingual workbench, browser execution and trace rendering. Its browser gates and generators are in `frontend/scripts/`.
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
