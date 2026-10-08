# Operation and reproduction

## Local execution

Create an isolated Python environment with `scripts/setup.ps1` or `bash scripts/setup.sh`. Setup installs the pinned engine and verified checkpoints from reflexmesh `v0.01.000`. For offline refitting, pass `-SkipModels` or `--skip-models` respectively. Build the frontend using Node 24 and `npm run build` from `frontend/`. Start `.venv/Scripts/python.exe scripts/serve.py` on Windows or `.venv/bin/python scripts/serve.py` on Linux/macOS from the repository root. Keep the server on loopback. The launcher opens a one-time fragment session URL in the browser; the app immediately removes that fragment and retains the token only in memory. Never commit the token. With --no-browser, supply REFLEXMESH_LOCAL_TOKEN explicitly and use the local connection field. Checkpoints and task files default to external user cache/data directories; use --checkpoints, --operations-root and --temp-root to select external storage.

Choose a case, method, variant and seed, connect to the local runtime, then run. The native lane limits the request to registered disposable workloads and a bounded step count. Inspect the timeline, candidates, resource revisions and observed effects. Cancellation requests are acknowledged immediately, but a running effect may remain uncertain until its receipt is reconciled. Terminal episodes can be exported and re-imported without executing tools.

For general software workflows use reflexmesh's Runtime/Controller SDK or `reflexmesh workflow recipe.json --workspace workspace`. The caller registers tools and independent postconditions. A language model cannot expand capabilities by inventing a new tool name or command string.

## Reproduce checkpoints and results

Run `python data-pipeline/run.py all --model qwen3.5:4b` after explicitly installing the model in Ollama. This collects disjoint datasets, trains classical/recurrent/transition/RL policies, fits outcome-based routing gates, executes the complete held-out matrix and exports canonical results. It can take substantial time; source, model and split lineage are recorded and changed lineage prevents stale resume.

Run individual stages when inspecting failures. Do not copy a partial evaluation directory over the canonical export. `scripts/check_artifacts.py` verifies all methods, cases, variants and seeds, identity/byte hashes, native receipts, held-out provenance and aggregate counts. Browser builds only consume these verified artifacts.

GPU use is optional for training. A compatible official Torch/CUDA runtime must be explicitly installed and measured. Policy inference, planner inference and training can use different devices; record each separately. A GPU label or installed driver does not prove that a computation ran on GPU.

## Import and extend

Imported episodes require the versioned trace shape and remain labeled unverified-origin replay. They carry no executable authority. To add a live tool, implement a registered ToolSpec in the engine with argument validation, declared resources, current fingerprints and independent effect evidence. To add a case, provide a resettable real effect environment and verifier before extending the registry. To add a learned method, provide all train/checkpoint/infer/eval/export stages and compare on unchanged held-out cases.
