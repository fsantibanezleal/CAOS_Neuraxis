# CAOS Neuraxis software design
Date: 2026-09-24; benchmark extension 2026-09-28; the design area completed to the template 0.08.002 guards on 2026-10-20. The deployed release at this writing is 0.02.008 (`VERSION`); this document covers it and the 0.03.000 migration onto the shared shell (0.15.0 pinned exactly, 0.16.0 at its release) and the product template (0.08.002 recorded in `.template-version`). The layout of this area is in [`README.md`](README.md).

## Review and migration record
This records the existing research-backed implementation authorized before ADR-0075 was adopted on September 22. It is a September 23 migration of the current design, not a backdated pre-development review. The current user instruction explicitly continues the full implementation. Requirement convergence records distinguish local verification from publication and deployment.

The 0.03.000 units were sized before they were built: the sizing (`plans/system-one/sizing.md` in the coordination repository) fixed the modules, thirteen boundaries, the technology versions and the parallel units on 2026-10-19. This document and the feature folder [`features/base-0-08/`](features/base-0-08/requirements.md) were completed after the units that are in this tree (the wiring on the shell, the contract catalog with its consumer side and the producers of the four evidence documents, the executive data and its illustrations, the documentation framework and the Implementation page's reproducibility area), on 2026-10-20, from the code, the tests, the catalog and the measurements, and say so where it matters. The Methodology page unit, the Experiments and Benchmark unit and the Focus mode of the App (shell 0.16.0) are not in this tree and have no requirement here.

## Problem and non-goals
Provide an inspectable software-control workbench, scientific explanation, complete measured comparison and authenticated local workspace operation. The public companion replays evidence; actual user tools run on the user's loopback service. A browser simulation is visibly labeled and never substituted for native effect evidence.
Non-goals: remotely controlling arbitrary visitors' machines, publishing credentials, browser execution of full training or local planner weights, or presenting a scientific hypothesis as AGI.

## Executive brief
The executive view of the Introduction is data, kept apart from this document: one file frames, for a decision maker and in English and Spanish, the industry problem Neuraxis answers, with a linked source for every figure and claim. It was written from the problem-context research before the view was built, is valid against the shell's `executive.schema.json` 2.0.0, and is rendered by the shell as the first view of the Introduction, where the product lands. This document names the file and restates nothing of it.

Data file: content/executive.json

## Research basis
Done before the plan and kept here so a reader can re-check it (ADR-0075). The research is the dossiers under [`../research/`](../research/README.md) (Jev and typed decision models, neuroscience, learning and control, benchmarks and engineering, architecture, the operational rebuild and the reliability audit, 2026-09-20 to 2026-09-24, with the source ledgers `sources-*.json`) and the problem-context research of the executive view (2026-10-19). The table is their decisions claim by claim, each with its source. A source is a vendor report, a primary paper or documentation as the dossier labels it; reading a source does not make a claim a result of this product.

| decision | what the research found | source |
|---|---|---|
| The controller is a software controller on typed, already authorized actions; fast and slow name computational roles, not model species | A fast deterministic controller beside an asynchronous language-model reflection is already published for a collaborative game, and a controller that splits planning between direct and searched subgoals is published for maze and blocks tasks, so neither the split nor its existence is a contribution | DPT-Agent, 2025, https://doi.org/10.18653/v1/2025.acl-long.206; System-1.x, 2024, https://doi.org/10.48550/arXiv.2407.14414 |
| Sparse slow guidance with autonomous fast execution is not claimed as new | A fast world-model controller conditioned on sparse high-level instructions is published for embodied environments | Instruct-to-Act, https://arxiv.org/abs/2608.26788 |
| A learned model ranks candidate actions and never grants a capability; a deterministic binder owns paths, identifiers and validated arguments; an unknown outcome is not a success | The vendor's own jaggedness page lists numeric and date reasoning, irrelevant context, adversarial state and cross-question invariants as weak areas | TypeSafe, Jev 1.13 jaggedness, https://docs.typesafe.ai/model-jaggedness/jev-1.13 |
| Schema validity, probability quality, decision quality, authorization and trajectory reliability are five separate quantities | The confidence of a typed answer is computed from the shape of the returned distribution and is not documented as an independent estimate of epistemic uncertainty | TypeSafe, confidence, https://docs.typesafe.ai/confidence |
| Routing by threshold among handlers is prior art, so the product claims a persistent controller with outcome-grounded allocation of deliberation as a hypothesis only | The vendor documents intent routing and confidence-gated routing as existing patterns | TypeSafe, intent routing, https://docs.typesafe.ai/patterns/intent-routing; TypeSafe, confidence routing, https://docs.typesafe.ai/patterns/confidence-routing |
| The product does not claim to reproduce Jev | The inspected launch, documentation and public repository listing expose no training recipe, architecture or weights | TypeSafe, introducing System One models and Jev, https://typesafe.ai/blog/introducing-system-one-models-and-jev |
| Allocation between a cheap and a costly controller is by estimated reliability and value, and the interface shows why an action was admitted or escalated | Arbitration models compare the uncertainty or the reliability of cached and model-based evaluators; the dossier states the anatomical mapping is a hypothesis | Daw, Niv and Dayan 2005, https://doi.org/10.1038/nn1560; Lee, Shimojo and O'Doherty 2014, https://doi.org/10.1016/j.neuron.2013.11.028 |
| A benchmark is held to answer whether deliberation pays, not only to separate algorithms | A common two-step task did not reliably give extra model-based control a reward advantage, and a redesigned task did | Kool, Cushman and Gershman 2016, https://doi.org/10.1371/journal.pcbi.1005090 |
| Interruption is a separate service from deciding, with checkpoint-preserving cancellation, and a timeout does not mean a write failed | Stop-signal and surprise studies associate stopping with a frontal and subthalamic pathway and show a surprise cost; the dossier derives the engineering protocol and marks it as engineering, not biology | Aron and Poldrack 2006, https://doi.org/10.1523/JNEUROSCI.4682-05.2006; Wessel et al. 2016, https://doi.org/10.1038/ncomms11195 |
| The method ladder has classical, fitted, recurrent, bandit, reinforcement, model-based, deferral and metacontrol rungs, each with a measured failure mode | Rules, behavior trees, logistic and boosted scorers, a small recurrent policy, a contextual bandit, masked policy optimization and learned deferral are the dossier's comparison families | XGBoost, 2016, https://doi.org/10.48550/arXiv.1603.02754; the GRU encoder-decoder, 2014, https://doi.org/10.48550/arXiv.1406.1078; LinUCB contextual bandit, 2010, https://doi.org/10.1145/1772690.1772758; Schulman et al., PPO, 2017, https://doi.org/10.48550/arXiv.1707.06347 |
| The behavior-cloning rung needs labels on states the student visits, and failed traces are not positive targets | DAgger collects labels on policy-induced states to address the mismatch between demonstration states and visited states | DAgger, 2011, https://proceedings.mlr.press/v15/ross11a.html |
| Logged propensities, overlap and a stated estimator are required before a bandit statement is made; a bandit is a myopic baseline for file actions | The doubly robust estimator combines a reward model with importance weighting under stated assumptions | Doubly robust policy evaluation and learning, 2011, https://doi.org/10.48550/arXiv.1103.4601 |
| Invalid actions are masked in the reinforcement rung and evaluation is mask-aware | The invalid-action masking analysis is theoretical and empirical; the library notes that recurrent policies are unsupported by the masked variant | A closer look at invalid action masking, 2022, https://doi.org/10.32473/flairs.v35i.130584; Stable Baselines3-Contrib, maskable PPO, https://sb3-contrib.readthedocs.io/en/master/modules/ppo_mask.html |
| The learned gate is trained and scored against downstream expert performance, and its negative result is preserved | Deferral should account for downstream decision-maker performance, not only uncertainty | Madras et al., learning to defer, https://arxiv.org/abs/1711.06664; Consistent estimators for learning to defer to an expert, 2020, https://proceedings.mlr.press/v119/mozannar20b.html |
| Probabilities are calibrated on episodes disjoint from the fit | Modern neural classifiers can be miscalibrated and temperature scaling is evaluated | On calibration of modern neural networks, 2017, https://proceedings.mlr.press/v70/guo17a.html |
| Results are aggregated over seeds with uncertainty, and few-run point estimates are not trusted | Few-run point estimates can mislead and an uncertainty-aware aggregate is needed | Deep reinforcement learning at the edge of the statistical precipice, 2021, https://doi.org/10.48550/arXiv.2108.13264 |
| Stateful tool use is judged by milestones and final state, and external benchmark subsets stay separate lanes with their own evaluators | Stateful tool execution with milestone evaluation exposes failures that isolated tool-call accuracy misses; user and agent can both change shared state | ToolSandbox, 2024, https://arxiv.org/html/2408.04682v1; tau2-bench, 2025, https://arxiv.org/html/2506.07982v1 |
| Tool text is untrusted, and a task with tool-mediated injection is a case | A tool-mediated prompt-injection benchmark scores utility and attacker success | AgentDojo, 2024, https://arxiv.org/html/2406.13352v3 |
| The statistical unit is the episode, splits are disjoint by workflow family, and no evaluator state reaches a policy feature | The dossier's experiment design: bootstrap by episode or task family, split before paraphrase, distillation or embedding | Research dossier 04, section 4, `docs/research/04-benchmarks-and-engineering.md` |
| The resident runtime is native code behind a Python package built with setuptools and PyO3, and a small policy runs on ONNX Runtime after a parity check | Packaging of Rust extensions with setuptools-rust and PyO3 is documented; the Rust ONNX binding is a community crate | setuptools-rust, https://setuptools-rust.readthedocs.io/en/latest/; PyO3 distribution, https://pyo3.rs/main/building-and-distribution.html; ONNX Runtime API index, https://onnxruntime.ai/docs/api/ |
| Windows process limits and termination are the native supervision primitive; a Wasmtime sandbox is not claimed | Job objects group processes with limits, termination and notification; Wasmtime fuel and epoch interruption do not interrupt blocking host calls by themselves | Microsoft, Job Objects, https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects; Wasmtime Config, https://docs.wasmtime.dev/api/wasmtime/struct.Config.html |
| The first screen of the App names a task, its inputs and its expected outputs; results lead and diagnostics are disclosed progressively | Validated guidelines for human-AI interaction cover capabilities, context, correction, control and consequences | Amershi et al. 2019, https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf |
| A source audit reads actual source and reports actual findings; it never claims to fix arbitrary issues | Repository tasks are scored by execution-based outcomes | SWE-bench, https://arxiv.org/abs/2310.06770 |
| CSV rows keep extra fields and physical line numbers, and numeric admission is finite | The standard CSV module stores extra fields and counts physical lines; the JSON decoder offers separate float and constant hooks | Python csv, https://docs.python.org/3/library/csv.html; Python json, https://docs.python.org/3/library/json.html |
| The executive view states how far current agents get on long professional workflows | The best agent completed 20.6 percent of 108 long professional workflows in the 2026 benchmark, as `content/executive.json` records | OSWorld 2.0, https://arxiv.org/abs/2606.29537 |
| The executive view states the cost of outages and the date of the European duties of oversight and logging | 57 percent of surveyed operators put their latest major outage above 100,000 US dollars; the duties apply from 2027-12-02 to the listed high-risk uses, as `content/executive.json` records | Uptime Institute 2026, https://uptimeinstitute.com/about-ui/press-releases/uptime-announces-annual-outage-analysis-report-2026; European Commission, AI Act Article 113, https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-113 |
| Requirements are written in EARS form, each with its gate | The five EARS patterns used in the requirements files | Mavin et al. 2009, https://doi.org/10.1109/RE.2009.9 |

Choices with no source because they are the product's own or are original analysis recorded in the dossiers: the five-quantity separation as an engineering analysis (dossier 01, section 2), the bound on a zero-failure frozen policy (dossier 03, section 5), the twenty case families and their six variants (`docs/cases.md`), the thirteen-row catalog and the six declared states (ADR-0080).

UNVERIFIED: the page text of vendor documents (TypeSafe) is a vendor report, not an independent measurement; the dossiers record launch latency and evaluation claims as the vendor's.
UNVERIFIED: no authenticated Jev request was made; endpoint latency from Chile, quotas and workload calibration are unmeasured (dossier 01, section 7).
UNVERIFIED: the DOIs and URLs above were not resolved again by this unit; they are as `docs/research/sources-*.json` and the dossiers record them (verified_on 2026-09-20 to 2026-09-24). The author lists of the works are as the dossiers name them where they name them and otherwise the first-author form of the cited record.
UNVERIFIED: the performance targets of dossier 05, section 8 (warm p99 of 2 ms, 10 ms and 25 ms) are design targets, not measurements, and are not requirements here.

## Sizing and contracts
The design rests on two artifacts of contract-first parallel delivery (ADR-0080): the sizing, kept with the coordination records outside the product (`plans/system-one/sizing.md`: the modules with their owner units, thirteen boundaries, the technology versions read from the registries on 2026-10-19, the machine limits and the parallel units with disjoint write scopes), and the contract catalog kept here, [`docs/contracts/catalog.md`](../contracts/catalog.md). The catalog has thirteen rows, one per kind of committed document under `data/` (15,981 files of eleven kinds), the operations API and the release manifest. Each row has one schema file in `docs/contracts/schemas/` (the OpenAPI document for the API), an example or a provider, a producer test, a consumer test, its missing-data behavior and a swap test. All thirteen are at version 1.0.0 with an `initial` history row dated 2026-10-19.

| id | version | boundary | schema file |
|---|---|---|---|
| episode-index | 1.0.0 | the evaluation index of the engine, `data/derived/index.json`: methods, cases, the episode manifest with digests, aggregate results and the lineage in its provenance | `docs/contracts/schemas/episode-index.schema.json` |
| episode | 1.0.0 | one executed episode (events, decisions, planner work, resources, metrics, provenance) of the 14,400 canonical and the 1,536 semantic-transfer episodes | `docs/contracts/schemas/episode.schema.json` |
| lineage | 1.0.0 | the model, code, native and package digests an evaluation ran with | `docs/contracts/schemas/lineage.schema.json` |
| research-summary | 1.0.0 | the corrected-science summary `data/derived/research.json` | `docs/contracts/schemas/research-summary.schema.json` |
| benchmark-adequacy | 1.0.0 | the audit of seed variability per case, variant and method | `docs/contracts/schemas/benchmark-adequacy.schema.json` |
| routing-study | 1.0.0 | the held-out analysis of the delegation gate | `docs/contracts/schemas/routing-study.schema.json` |
| semantic-transfer-index | 1.0.0 | the evaluation index of the semantic-transfer suite | `docs/contracts/schemas/semantic-transfer-index.schema.json` |
| semantic-transfer-report | 1.0.0 | the audit of the semantic-transfer matrix: methods, families and paired M12 contrasts | `docs/contracts/schemas/semantic-transfer-report.schema.json` |
| operation-index | 1.0.0 | the index of the recorded compound-operation runs under `data/operations/` | `docs/contracts/schemas/operation-index.schema.json` |
| operation-run | 1.0.0 | one recorded operation run: events, nodes, findings, inputs and per-task artifacts | `docs/contracts/schemas/operation-run.schema.json` |
| operations-api | 1.0.0 | the nine routes of the bounded public operations service under `/operations-api` | `docs/contracts/api.openapi.json` |
| release-manifest | 1.0.0 | the manifest of a static deployment archive, written at packaging and never committed | `docs/contracts/schemas/release-manifest.schema.json` |
| readiness | 1.0.0 | `data/derived/readiness.json`: what is real in a build, row by row, in one of six declared states | `docs/contracts/schemas/readiness.schema.json` |

Two boundaries of the sizing are not catalog rows. The executive file `content/executive.json` is held by the shell's own schema (`scripts/check_sdd.py` and `frontend/src/content/executive.test.ts`). The browser simulation is its own execution lane, not a replay (the sizing's boundary B13, decided 2026-10-20): its episode carries `lane: browser` and no host effects, the Engine view labels it as the browser's virtual workspace and a committed record as a canonical measured run (requirement BR-036). Decision parity with the committed episode is not a property of the product: the measurement of 2026-10-20 found 2400 of 2400 committed M01 and M02 episodes differing from the simulation from step 1, by design. The local engine API under `/api` is reflexmesh's own contract and is not in the catalog.

The four evidence documents (research summary, benchmark adequacy, routing study, semantic-transfer report) are written by scripts of the engine repository over its own artifacts. The product's producer of record is the import stage `python data-pipeline/run.py import-evidence`, a release operation never run in CI, which reads each file at reflexmesh tag v0.01.002 (commit 447cc08), verifies its SHA-256 against `docs/contracts/evidence-provenance.json`, validates it against its schema and writes it. The producers `run.py export` and `scripts/evaluate_operations.py` validate against the schema files before they write (`data-pipeline/core/validation.py`). The web's types are generated from the schema files (`frontend/src/lib/contract.gen.ts`, `frontend/scripts/gen-contract-types.mjs`, run with `--check` by `npm run build`).

Missing-data behavior is one vocabulary of six declared states (`available`, `partial`, `stale`, `provider`, `training`, `missing`), computed by `data-pipeline/core/readiness.py` from the catalog and the repository, in the catalog's order, first match wins:

- Provider: a row whose catalog status is `active` is served by its provider and says so. No row is `active` since the producers of the four evidence documents were built.
- Missing: no episode index (the site build stops at the data copy), no operation index, or a fixed-path document absent; `operations-api` and `release-manifest` are `missing` in the static document by rule. A view says not available yet with the reason, never an empty chart; the API answers 503 with the declared state.
- Partial: an episode, an operation run or a semantic-transfer lineage the index lists is absent; the readiness lists the absent paths and the count, and the view of that run says not available yet while the others work.
- Stale: the operation index records an engine other than the one `requirements.txt` pins; the view shows the version that recorded it.
- Training: not used, because the product has no model slot.

Beyond the catalog, the following contract text keeps the design of the first release. The product consumes the separately versioned reflexmesh PyPI dependency and declares no engine package. Offline export validates the complete matrix and byte hashes. The artifact index identifies every trace, method, case, variant, seed and frozen lineage; missing or malformed evidence fails export. Browser canonical replay checks SHA-256 and identity before loading. Imported files are explicitly unverified.
The local API uses a session bearer token, same-origin/loopback validation, bounded requests and immutable host registration. Workspace previews bind the entire validated recipe and current file hashes and expire after 120 seconds. Submission consumes a preview once. Recovery requires current unresolved-record identity, observed file evidence, effect review and process quiescence attestation.

## Technology and versions
Every pinned dependency of `requirements.txt`, `requirements-api.txt`, `requirements-dev.txt`, `requirements-gpu.txt`, `requirements-operations.txt`, `requirements-precompute.txt` (through `data-pipeline/requirements.txt`) and `frontend/package.json`, with the version actually pinned or installed; `scripts/check_tech_matrix.py` fails when a pin and this table disagree. A package.json range is recorded at the version `frontend/package-lock.json` resolves it to. The alternatives column is read from the sizing's technology matrix (versions current on 2026-10-19 and not adopted, with the reason it gives) and, for a transitive pin, from the installed package metadata; where the sizing records no alternative the cell says so. The product runs on Python 3.12 (`README.md`; CI and the venv `neuraxis-base` run 3.12) and Node 24 (`README.md`; 24.14.1 measured).

| component | package | version | use | alternative considered |
|---|---|---|---|---|
| engine | reflexmesh | 0.1.2 | the published runtime, with the `server` extra for the operation service and the `train` extra for the offline pipeline; consumed, never vendored | none: the engine is the separate repository (ADR-0057), read only in this migration |
| contracts | jsonschema | 4.26.0 | validates every committed document against its schema file, in the tests and at the producers | none recorded in the sizing: the template's pin |
| contracts | openapi-spec-validator | 0.9.0 | validates `docs/contracts/api.openapi.json` | none recorded in the sizing |
| tests | pytest | 9.1.1 | the product and contract tests | none recorded in the sizing: current at 2026-10-19 |
| lint | ruff | 0.17.1 | lint of the Python scripts | none recorded in the sizing: current at 2026-10-19 |
| API | httpx | 0.28.1 | the test client of the service and a dependency of the engine's server extra | none recorded in the sizing: current at 2026-10-19 |
| API | fastapi | 0.141.1 | the bounded operation service | 0.150.0, current and not adopted: the native service changes only with its own release |
| API | uvicorn | 0.53.0 | the ASGI server of the service | 0.54.0, current and not adopted, same reason |
| API | numpy | 2.5.3 | a dependency of the engine, pinned for the service install | none recorded in the sizing: current at 2026-10-19 |
| API | pydantic | 2.13.5 | models of the service and the engine (a dependency of both) | none: required by fastapi and reflexmesh |
| API | pydantic-core | 2.46.5 | the validation core of pydantic | none: required by pydantic |
| API | starlette | 1.7.0 | the ASGI toolkit under fastapi | none: required by fastapi |
| API | annotated-doc | 0.0.5 | a dependency of fastapi, pinned for the immutable service install | none: required by fastapi |
| API | annotated-types | 0.8.0 | a dependency of pydantic, pinned for the immutable service install | none: required by pydantic |
| API | anyio | 4.15.1 | a dependency of starlette and httpx, pinned for the immutable service install | none: required by starlette and httpx |
| API | certifi | 2026.7.22 | the certificate bundle of httpx, pinned for the immutable service install | none: required by httpx and httpcore |
| API | click | 8.5.0 | a dependency of uvicorn, pinned for the immutable service install | none: required by uvicorn |
| API | h11 | 0.16.0 | the HTTP/1.1 protocol library of uvicorn and httpcore, pinned for the immutable service install | none: required by uvicorn and httpcore |
| API | httpcore | 1.0.9 | the transport of httpx, pinned for the immutable service install | none: required by httpx |
| API | idna | 3.20 | a dependency of anyio and httpx, pinned for the immutable service install | none: required by anyio and httpx |
| API | typing-inspection | 0.4.4 | a dependency of pydantic and fastapi, pinned for the immutable service install | none: required by pydantic and fastapi |
| API | typing-extensions | 4.16.0 | backported typing features for the service environment, pinned for the immutable install | none: required by fastapi, pydantic and starlette |
| shell | @fasl-work/caos-app-shell | 0.15.0 | the shared app shell, pinned exactly (ADR-0078); 0.16.0 is adopted by the Focus-mode unit at the shell's release | a hand-rolled shell, forbidden by ADR-0078 |
| web | react | 19.2.7 | the UI; the spec is ^19.0.0 | 19.3.1, current at 2026-10-19; the lock resolves 19.2.7 |
| web | react-dom | 19.2.7 | the UI renderer; the spec is ^19.0.0 | none: the shell requires it |
| web | react-router | 7.18.4 | the routes (pinned exactly) | 8.5.0, current and a major change, not adopted: the shell's peer range decides |
| web | react-router-dom | 7.18.4 | the router bindings; the spec is ^7.18.4 | none recorded in the sizing |
| web | i18next | 26.4.2 | the translation core of the interface; the spec is ^26.4.2 | none recorded in the sizing |
| web | react-i18next | 17.0.14 | the React bindings of i18next; the spec is ^17.0.14 | none recorded in the sizing |
| web | katex | 0.19.0 | typeset equations on the documentation pages; an override lifts the shell's peer range of ^0.16.0 | none recorded in the sizing: current at 2026-10-19 |
| web | lucide-react | 1.47.0 | icons; the spec is ^1.47.0 | none recorded in the sizing |
| web | zustand | 5.0.15 | the workbench state store; the spec is ^5.0.15 | none recorded in the sizing: current at 2026-10-19 |
| build | vite | 8.3.0 | bundler and dev server | 8.3.4, current and not adopted |
| build | @vitejs/plugin-react | 6.1.1 | the React transform for vite | none recorded in the sizing |
| build | typescript | 5.9.3 | type check of the web and the generated contract types; the spec is ^5.7.2 | 7.0.2, current and a major change, not adopted |
| build | openapi-typescript | 7.13.0 | generates `contract.gen.ts` from the OpenAPI document and the schema files | hand-written types, which drifted from the schemas in several fields (the consumer-side unit lists them) |
| build | prettier | 3.9.8 | format check of the web sources | none recorded in the sizing |
| build | @types/node | 22.20.0 | types of the build scripts; the spec is ^22.20.0 | none recorded in the sizing |
| build | @types/react | 19.2.17 | types of React; the spec is ^19.0.0 | none recorded in the sizing |
| build | @types/react-dom | 19.2.3 | types of React DOM; the spec is ^19.0.0 | none recorded in the sizing |
| tests | vitest | 5.0.1 | the web unit tests | 5.0.5, current and not adopted |
| gate | @playwright/test | 1.63.0 | the browser gates under `frontend/scripts/`, local only | 1.64.1, current and not adopted |

## Resources
What each stage needs on the development workstation (Windows 11 10.0.26300, Intel Core i9-14900HX, 2026-10-20; the peak is the largest sum of committed memory over every process of the stage, read from a job object; the commands and outputs are in [`measured-resources.md`](measured-resources.md)). No stage here uses a GPU or the network after the install, apart from the evidence import and the deploy. Training and the engine evaluation are stages of the engine's pipeline (`python data-pipeline/run.py collect, train, ppo, gates, evaluate`); they run locally, never in CI, and were not re-run for this document.

| stage | memory | disk | time | where it runs |
|---|---|---|---|---|
| bake (`data-pipeline/run.py readiness`, the stage that runs without the training stack; `run.py export` and the engine stages collect, train, ppo, gates and evaluate need the engine's workspace and were not re-run) | 27 MB peak commit | 2,054 bytes rewritten, identical to the committed `data/derived/readiness.json`; the committed evidence is 367,501,655 bytes in 15,947 files | 0.5 s | workstation; the readiness check also runs in CI |
| artifact check (`scripts/check_artifacts.py`, the 14,400 episodes, 1,440 cells) | 35 MB peak commit | reads the 367,501,655 bytes of `data/derived` | 7.2 s with the file cache warm (about 160 s cold, per the sizing) | workstation and CI |
| tests (`python -m pytest`, 166 tests of which 6 skip without the engine's workspace or a tool) | 392 MB peak commit over 80 processes | none beyond temporary copies | 134.1 s | workstation (CI runs the guards, not pytest) |
| install (`npm ci`, 96 packages) | 363 MB peak commit | 165,525,550 bytes in 8,282 files of `node_modules` | 18.5 s with a warm cache | workstation and CI |
| build (`npm run build`: contract-type check, data copy, type check, vite) | 971 MB peak commit over 13 processes | 376,318,835 bytes in 16,056 files in `frontend/dist`, 367,501,655 of them the copied evidence | 26.3 s (vite itself 11.5 s) | workstation and CI |
| web unit tests (`npm test`, 156 tests in 17 files) | 1,113 MB peak commit over 26 processes | none | 2.6 s | workstation |
| deploy (static archive on the ML host; the operation service beside it) | the service peaked at 50,360,320 bytes after the browser checks of 0.02.000, limit 536,870,912 | the site of 376,318,835 bytes, installed as an immutable release beside the previous ones | not timed in any committed record | the ML VPS (37 GB free disk, 8 GB RAM, four CPUs), by the operator with an SSH key, never CI |

## Lanes
- Offline: `data-pipeline/run.py` drives the engine's stages (collect, train, ppo, gates, evaluate), then `export`, which re-validates the evaluation and copies it into `data/derived`; `readiness` recomputes the readiness document from the catalog with the standard library only; `import-evidence` reads the four evidence documents at the pinned engine commit. Training and planner inference run locally, never in CI.
- Static evidence (replay): the committed artifacts, copied into the site by `frontend/scripts/copy-data.mjs` and fetched with the version in the address. The static payload includes 14,400 trace files, about 243 MB before compression, plus the 5 MB index. Browser canonical replay checks SHA-256 and identity before loading; the readiness document labels each view that a provider, a stale bake or an absent file affects.
- Browser simulation: the interactive simulation of the exact policies (M01, M02) and the visualization, labeled and never substituted for native effect evidence.
- Native operation lane: public file tasks execute the installed native package under a separate fixed-tool service (`app/operations_api.py`, nine routes under `/operations-api`) with session-owned runs, bounded input and no access to the host filesystem or process registration. The Tasks view reads its recorded counterpart (36 runs: 3 tasks, 4 fault conditions, 3 seeds) from `data/operations/` when the service is absent.
- Local workspace lane: `app/main.py` composes the engine's `reflexmesh.server` with the bounded task API. The workspace executes user-authored DAG recipes on explicitly registered directories and displays actual native receipts. Static public requests to /api return 404. Offline research, model fitting and transfer workloads are retained in the package evidence.

## Method ladder
| Method | Acceptance criterion |
| --- | --- |
| M01 | Maintained state rules execute independent postconditions across the complete core matrix. |
| M02 | Explicit behavior-tree traversal executes the same candidate/authority contract. |
| M03 | Fitted logistic imitation, disjoint calibration and Rust export match within 1e-5. |
| M04 | Fitted boosted-tree imitation, calibration and Rust export match within 1e-5. |
| M05 | Trained GRU carries episode-local hidden state; ONNX export parity is measured. |
| M06 | Logged executed rewards and propensities fit the contextual linear bandit. |
| M07 | Masked PPO records achieved online transitions and held-out execution outcomes. |
| M08 | Learned observed transitions, reward and termination support bounded lookahead and validation error. |
| M09 | A real model receives the current bounded candidate set; its selected action is independently admitted. |
| M10 | Fixed asynchronous delegation records request, acceptance, rejection and unused completion. |
| M11 | Paired executed incremental utility fits a calibrated gate with separate threshold selection. |
| M12 | Recurrent/effect preference, surprise response and learned allocation execute with four component ablations. |
The app exposes the full ladder with method-specific evidence and limitations. Acceptance requires canonical results for every method and replay of a hash-verified trace, not just an attractive method selector.

## Cases
The twenty [case contracts](../cases/cases.md) cover files, builds, HTTP, processes, dependencies, conflicts, planners, untrusted text and crash recovery. Every family has six variants (nominal, delayed observation, duplicate event, stale conflict, unavailable dependency and boundary) and ten core seeds per method, so the matrix is 12 methods, 20 case families, 6 variants and 10 seeds, 14,400 episodes (`scripts/check_artifacts.py` reports 1,440 cells and a minimum of 10 seeds). Export rejects missing cells. The independent structural-transfer and ablation results remain separately labeled in the scientific report.

The benchmark adequacy audit diagnoses the frozen core's state-machine ceiling and seed sensitivity without altering its traces. A new eight-family semantic-transfer lane uses the same twelve frozen methods with opaque, type-compatible operations and actual file effects. Its 1,536 episodes have a separate index, lineage, SHA-256 checks and result view. Results from these lanes are never pooled.

The operation suite is a separate set of three fixed tasks (source and configuration audit, data reconciliation, release integrity) under four fault conditions and three seeds, 36 recorded runs, never blended into the scores of the twelve methods.

## Oracles
The package evaluates actual environment postconditions. The app validates immutable receipt-bearing traces and displays outcomes unchanged, including failure, cancellation and abstention. Demonstration reliability is labeled as such. Native runs are checked with actual API responses; workspace/recovery browser tests verify real filesystem effects. Screenshots and viewport checks cover six routes, both languages and both themes.

None of these is a model judging a model: the case predicates read the written bytes, the process exits, the HTTP values and the durable effects (`docs/cases.md`, the independent completion evidence column); the artifact checker recomputes every digest and the lineage signature; the contract tests hold each committed document and a provider tree to the same schemas and cross-field rules; `scripts/check_operations.py` verifies the 36 recorded operation runs.

## Deploy driver
Private repository visibility excludes GitHub Pages. The 243 MB trace payload exceeds the 100 MB small-static-data planning threshold; the measured ML VPS has 37 GB free disk, 8 GB RAM and four CPUs. Deploy immutable compressed static releases to neuraxis.ml.fasl-work.com on that host (`deploy/TARGET` reads `vps`; `scripts/check_deploy_place.py` checks it). Archive installation enforces a 2 GiB unpacked limit, 100,000-file limit, exact hashes and atomic current-release switching. TLS must be verified externally for this hostname. The additional operation service has two concurrent native runs, 24 retained directories, one-hour retention, 512 MiB memory and one CPU quota. No training service or general user workspace is deployed there. The separately reviewed [operational requirements](features/operational-workbench/requirements.md) govern its input and authority boundaries.

## Risks and kill criteria
Reject incomplete matrices, wrong run identities, hash drift, tokenless effects, stale previews, clipped controls and invalid mathematics. Do not release with an unresolved artifact or process ownership defect. A green build alone cannot establish deployment, usable controls or scientific superiority. Actual PyPI publication, verified TLS and final remote branch state remain separate completion gates.

- Risk: a contract changes on one side only. Kill: the generated types fail the web build when they are not current, and the contract tests of both sides read the same schema files.
- Risk: a provider ships as if it were the product. Kill: the readiness document labels it on every view, and `scripts/check_skeleton.py` fails a release while a row is still on a provider.
- Risk: a committed evidence document drifts from its source. Kill: the provenance test compares every committed byte with the digest in `docs/contracts/evidence-provenance.json`.
- Risk: the executive view restates a claim the research does not support. Kill: `scripts/check_sdd.py` validates the file against the shell's schema and the writing rules, and every figure names a source.
- Risk: the shell gate is read as green when it is not. At the consumer-side unit's measurement (2026-10-20) the gate reported 116 failures in 1,019 states, 92 of class G3 (no operations service behind the static host) and 24 of class G11 (a DOI text the gate reads as a decimal); neither is a product defect that the SDD gates cover, and the release unit owns the green gate.

## ADR fit
How the product meets the ADRs it is bound by, and where the base carries the rule (ADR-0078). Source of the list: the sizing's ADR constraints.

| ADR | Rule | Carried by |
|---|---|---|
| ADR-0016 | the shared shell and content depth | `frontend/package.json` (shell pinned exactly), `frontend/src/App.tsx`, `frontend/src/pages/documentation.test.tsx` |
| ADR-0017 | documentation areas and the executive view first (sections 1, 2, 2.1, 4) | `content/executive.json`, `frontend/src/pages/Introduction.tsx`, `frontend/src/data/areas.test.ts`, `scripts/check_sdd.py` |
| ADR-0057 | named stages, no internal package, the engine on PyPI | `data-pipeline/`, `requirements.txt` (reflexmesh), `tests/test_application.py` (no installable engine) |
| ADR-0058 | architecture modal, five themed bilingual tabs | `frontend/src/architecture.ts`, `frontend/src/architecture.test.ts`, `frontend/scripts/verify-architecture.mjs` |
| ADR-0066 | English first, Spanish UI | the bilingual `{en, es}` texts of `content/executive.json` and the pages; commits, code and documents in English |
| ADR-0067 | no em-dash, no emoji | `scripts/check_content_standards.py` |
| ADR-0070 | Focus mode for a product with simulations | not met in this tree: shell 0.16.0 surface Focus belongs to the Focus-mode unit; `frontend/src/gate-script.test.ts` already holds `--require-focus` in the gate runner |
| ADR-0071 | sized containers, one row of views, the page is the viewport | the shell's gate with `contain: true` in `frontend/src/App.tsx`; `frontend/scripts/verify-layout.mjs` for the reading pages (ADR-0071's document-height equality is scoped to the desktop workbench by the user's 2026-09-23 instruction recorded in `features/evidence-workbench/requirements.md`) |
| ADR-0073 | native authority and learned metacontrol, the engine's own decision | unchanged here; the engine's runtime documentation is authoritative |
| ADR-0074 | CI runs cheap checks only | `.github/workflows/ci.yml`, `scripts/check_ci_budget.py` |
| ADR-0075 | the SDD before development, every requirement names its gate | `docs/design/features/`, `scripts/check_sdd.py` |
| ADR-0078 | rules live in the base; exact pins | shell 0.15.0 pinned exactly, `.template-version`, `frontend/src/base-record.test.ts`, `scripts/check_tech_matrix.py` |
| ADR-0080 | contract-first parallel delivery: catalog, one schema per boundary, providers, declared states, readiness | `docs/contracts/`, `tests/contracts/`, `frontend/src/readiness/`, `scripts/check_contracts.py`, `scripts/check_readiness.py`, `scripts/check_skeleton.py` |

## Requirements
The product-level requirements of the first design are held by the per-feature files, where `scripts/check_sdd.py` resolves each gate and requires an adversarial validation row. Their old identifiers map as follows.

| first-design id | requirement in the feature files |
|---|---|
| R-001 | WO-004 |
| R-002 | EW-009 |
| R-003 | OW-016 |
| R-004 | EW-002 |
| R-005 | EW-010 |
| R-006 | EW-003 |
| R-007 | WO-002 |
| R-008 | WO-003 |
| R-009 | SR-002 |
| R-010 | SR-004 |
| R-011 | SR-003 |
| R-012 | BA-005 |
| R-013 | BA-002 |
| R-014 | BA-003 |

Feature convergence lives under [features](features/). Scientific conclusions are in [corrected results](../evaluation/corrected-results.md).
