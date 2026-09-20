# Neuraxis

A scientific workbench and local software-control application for fast learned policies, real tools and asynchronous language-model coordination. The reusable Rust/Python engine is the separate [reflexmesh](https://github.com/fsantibanezleal/reflexmesh) package.

Neuraxis exposes live decisions, candidate scores, exact resource state, effects, unresolved outcomes and planner delegations. Its scientific repository contains reproducible collection, training, calibration, inference, evaluation and export. The six bilingual workbench routes connect the implementation to neuroscience, machine learning, reinforcement learning and prior agent architectures.

## Run locally

Install Python 3.12 and Node 24, then run `scripts/setup.ps1` on Windows or `bash scripts/setup.sh` on Linux/macOS. Build the frontend with `cd frontend && npm run build`. Start the local workbench with:

```sh
python scripts/serve.py --checkpoints models/checkpoints --model qwen3.5:4b
```

The service prints a loopback URL and session token. Enter the token in the local workbench to run native methods. A configured Ollama model is required for slow-model methods; unavailable models are reported explicitly. Exported static workbench artifacts have no host-tool authority.

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
