# Neuraxis

A scientific workbench and local software-control application for fast learned policies, real tools and asynchronous language-model coordination. The reusable Rust/Python engine is the separate [reflexmesh](https://github.com/fsantibanezleal/reflexmesh) package.

The default Tasks view audits supplied source/configuration files, reconciles CSV deliveries, and verifies software-release manifests through native registered tools. Findings identify files and rows; accepted CSV data, checksums and the complete decision journal are downloadable. Investigations compares matched measured runs from the full scientific matrix. See [operational tasks](docs/workbench/operations.md) for formats and limits.

Neuraxis exposes live decisions, candidate scores, exact resource state, effects, unresolved outcomes and planner delegations. Its scientific repository contains reproducible collection, training, calibration, inference, evaluation and export. The six bilingual workbench routes connect the implementation to neuroscience, machine learning, reinforcement learning and prior agent architectures. The Introduction opens with an evidence-led executive view and a technical view. The operations workbench lives at `/app`; the benchmark and scientific pages preserve direct routes. Scientific sections use the shared shell tabs, with cited sources scoped to the currently open section rather than a duplicate bibliography page.

## Areas

| Area | Folder | Status | What it holds |
| --- | --- | --- | --- |
| Web | [frontend](frontend/) | active | The six bilingual research routes and local operations workbench; [route guide](docs/workbench/workbench.md). |
| API | [app](app/) | active | The authenticated local service and bounded native operations; [API behavior](docs/workbench/operations.md). |
| Core pipelines | [data-pipeline](data-pipeline/) | active | Collection, training delegation, evaluation and artifact export; [pipeline guide](data-pipeline/README.md). |
| Packages | [reflexmesh 0.1.2 on PyPI](https://pypi.org/project/reflexmesh/0.1.2/) | active | Native action broker and policy package consumed by Neuraxis; [engine repository](https://github.com/fsantibanezleal/reflexmesh). |
| Notebooks | [notebooks](notebooks/) | active | The [bilingual ordered research curriculum](notebooks/README.md) with package-backed replay and benchmark analysis. |
| Data | [data](data/) | active | Frozen episodes, derived indexes and lineage manifests; [artifact contract](docs/contracts/catalog.md). |
| Contracts | [docs/contracts](docs/contracts/) | active | Persisted schema catalog, version lock and readiness boundaries; [catalog](docs/contracts/catalog.md). |
| Documentation | [docs](docs/) | active | The SDD, architecture wiki, case studies, research dossiers and operational guides; [documentation index](docs/README.md). |
| Tests and gates | [tests](tests/) and [scripts](scripts/) | active | Contract, adversarial, scientific, frontend and release gates; [gate entry point](scripts/README.md). |
| Deploy | [deploy](deploy/) | active | Public static release and bounded operations-service topology; [target](deploy/TARGET). |

## Run locally

Install Python 3.12 and Node 24, then run `scripts/setup.ps1` on Windows or `bash scripts/setup.sh` on Linux/macOS. Setup installs the pinned PyPI engine and hash-verified trained checkpoints from reflexmesh release `v0.01.000`; app versions are independent of the checkpoint archive. Checkpoints default to an external user cache; use NEURAXIS_CHECKPOINTS or -Checkpoints to select a model directory. See [investigations and storage](docs/workbench/investigations.md). Build the frontend with `cd frontend && npm run build`. Activate `.venv` (`.venv/Scripts/Activate.ps1` on Windows or `source .venv/bin/activate` on Linux/macOS), return to the repository root and start the local workbench with:

```sh
python scripts/serve.py --model qwen3.5:4b
```

The service opens a loopback browser with a generated local capability held only in application memory. No account password or PyPI login is needed. The URL fragment is removed immediately after the UI reads it. Use --no-browser with an operator-supplied REFLEXMESH_LOCAL_TOKEN for manual sessions. A configured Ollama model is required for slow-model methods; unavailable models are reported explicitly. Exported static workbench artifacts have no host-tool authority.

To fit checkpoints yourself, setup accepts `-SkipModels` on Windows or `--skip-models` on Linux/macOS. Run the scientific stages below before selecting a learned method. For operator-owned files, add `--workspace /absolute/existing/directory`; the Workspace tab provides dependency recipes, effect verification, cancellation and reviewed recovery.

The browser lane executes bounded virtual-workspace policies. The native lane executes real disposable files, child processes and local HTTP services through the engine's registered capabilities. Canonical and imported replay execute no effects. These lanes are identified throughout the interface.

## Reproduce the science

```sh
python data-pipeline/run.py collect
python data-pipeline/run.py train
python data-pipeline/run.py ppo
python data-pipeline/run.py gates --model qwen3.5:4b
python data-pipeline/run.py evaluate --seeds 10
python data-pipeline/run.py export
python scripts/check_artifacts.py
```

The declared matrix is 12 methods x 20 case families x six variants x ten held-out seeds, with disjoint training, validation and calibration environments. Every learned method has a fitted checkpoint and inference path. Every effect is checked against a concrete workload postcondition. The native broker is shared by all methods so that safety engineering is not credited to only one policy.

The proposed contribution is persistent outcome-aware allocation of deliberation under asynchronous resource changes. Fast/slow routing and dual-process agents already exist. Evidence must come from matched baselines, component ablations and independent transfer evaluation. Controlled software workloads do not establish general intelligence or production reliability.

Read the [documentation index](docs/README.md), [architecture](docs/architecture.md), [scientific pipeline](data-pipeline/README.md), [case contracts](docs/cases.md), [methods](docs/frameworks.md), and [research dossiers](docs/research/README.md). Source code and authored content are Apache-2.0; external models and benchmarks retain their licenses.

The [contract catalog](docs/contracts/catalog.md) defines persisted interfaces and the generated readiness report. Run `python scripts/check_product_gates.py --scope source` for source, contract, readiness and research artifact validation. Rebuild, inspect and execute the bilingual read-only notebooks with `python scripts/build_notebooks.py`, `python scripts/check_notebooks.py` and `python scripts/run_notebooks.py`. The selected hosting topology is documented in [deploy/TARGET](deploy/TARGET).
