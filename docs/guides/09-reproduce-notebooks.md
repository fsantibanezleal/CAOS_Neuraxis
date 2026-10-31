# Reproduce the research notebooks

The curriculum has six ordered topics, in English and Spanish, with a fundamentals notebook, a method-in-practice notebook, and a sourced prior-methods comparison in each topic. Level 1 verifies and inspects the topic's hash-audited decision traces. Level 2 executes the named Reflexmesh methods in an isolated software case environment and compares their independent outcomes with the matching frozen run. Level 3 verifies all 14,400 core traces, recomputes paired method outcomes and seed variation, examines structural and semantic transfer in separate denominators, audits four M12 ablations, and checks native M03/M04 numerical parity. The notebooks import the released algorithms; they do not contain copied policy implementations or claim to refit the published checkpoints.

## Environment

The environment is pinned in `notebooks/requirements.txt`. Build it without installing into the global Python environment:

```powershell
scripts/setup.ps1 -Notebooks
```

```sh
scripts/setup.sh --notebooks
```

Learned methods use the separately released model bundle. Fetch the pinned release and direct the notebook runner to it:

```sh
python -m reflexmesh.cli fetch-models --destination models/checkpoints --version v0.01.000
```

Set `NEURAXIS_CHECKPOINTS` to `models/checkpoints`. The `M09` and `M10` planners stay on their frozen recorded traces by default. Live planning is opt-in through `NEURAXIS_NOTEBOOK_MODEL` after configuring a local Ollama model.

## Authoring, running, and checking

`scripts/build_notebooks.py` writes bilingual notebook source cells without execution outputs. The fresh-kernel runner is the only tool that writes outputs. Its release check requires a caller-designated temporary directory and runs copies, preserving the checkout:

```sh
python scripts/build_notebooks.py
python scripts/run_notebooks.py
python scripts/check_notebooks.py
python scripts/run_notebooks.py --check --tmp <device-temp-root>
python scripts/check_notebooks.py --pypi
```

The static check covers the required topic tree, language mirror, numbering, level progression, SDD claim coverage, notebook anatomy, package pins, citation binding, committed data paths, clean outputs, and method-package reuse. The runner executes every notebook in a fresh kernel and compares its output with the committed result. Check mode copies `data/`, `data-pipeline/`, `docs/`, `content/`, `models/`, and `notebooks/` into the caller's external temporary root, then removes that isolated copy; the ignored `models/checkpoints/` directory must contain the pinned local release for lessons that load learned policies. `--pypi` is an optional network check for exact published package versions. These are local release checks; notebooks do not execute during CI. The underlying immutable episode traces remain in `data/derived/`.
