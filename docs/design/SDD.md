# CAOS Neuraxis software design
Date: 2026-10-31. Candidate display release: 0.02.020; deployment evidence is recorded separately.

## Problem and non-goals
Provide an inspectable software-control workbench, scientific explanation, complete measured comparison and authenticated local workspace operation. The public companion replays evidence; actual user tools run on the user's loopback service. A browser simulation is visibly labeled and never substituted for native effect evidence.
Non-goals: remotely controlling arbitrary visitors' machines, publishing credentials, browser execution of full training or local planner weights, or presenting a scientific hypothesis as AGI.

## Executive brief
Data file: content/executive.json
The executive view is the concise, bilingual account of the software-control problem, its evidence, and the decision context. The JSON is validated against the pinned shared-shell schema and is the single source for the landing view.

## Research basis
The detailed evidence, access limits and engineering inferences are persisted in [`docs/research/`](../research/README.md). Notebook comparisons use these sources only for the claims indicated here; external results are prior art, not Neuraxis measurements.

- Typed fast decisions and Jev are described by [TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev); this is a vendor description, not an independent evaluation of Neuraxis.
- Reliability-sensitive arbitration is studied by [Lee, Shimojo and O'Doherty](https://doi.org/10.1016/j.neuron.2013.11.028); task complexity and uncertainty are evaluated in [the 2019 arbitration study](https://www.nature.com/articles/s41467-019-13632-1). These findings do not establish biological equivalence of the software controller.
- [DPT-Agent](https://aclanthology.org/2025.acl-long.206/) is prior art for combining code/FSM control and asynchronous language-model reasoning.
- The policy baselines use the published [XGBoost](https://arxiv.org/abs/1603.02754), [GRU](https://arxiv.org/abs/1406.1078), [LinUCB](https://arxiv.org/abs/1003.0146), and [PPO](https://arxiv.org/abs/1707.06347) method families. The Neuraxis implementation and its exact training/evaluation protocol are documented separately in the research dossier.
- Allocation of computation is studied in [learning to select computations](https://arxiv.org/abs/1711.06892); cost-sensitive deferral is studied in [learning to defer](https://proceedings.mlr.press/v119/mozannar20b.html). Neither source implies that this product's fitted gate is useful.
- Stateful tool and task evaluation have prior art in [ToolSandbox](https://arxiv.org/abs/2408.04682), [SWE-bench](https://arxiv.org/abs/2310.06770), and [tau2-bench](https://arxiv.org/abs/2506.07982). Neuraxis's selected local subsets are not full reproductions of those benchmarks.

UNVERIFIED: current vendor documentation and independent reproduction of external benchmark results have not been re-audited for this release.

## Sizing and contracts
The product consumes the separately versioned reflexmesh PyPI dependency and declares no engine package. Offline export validates the complete matrix and byte hashes. The artifact index identifies every trace, method, case, variant, seed and frozen lineage; missing or malformed evidence fails export. Browser canonical replay checks SHA-256 and identity before loading. Imported files are explicitly unverified.
The local API uses a session bearer token, same-origin/loopback validation, bounded requests and immutable host registration. Workspace previews bind the entire validated recipe and current file hashes and expire after 120 seconds. Submission consumes a preview once. Recovery requires current unresolved-record identity, observed file evidence, effect review and process quiescence attestation.

The core release contains 14,400 immutable episodes across twelve methods, twenty task families, six variants, and ten seeds. Semantic transfer contains 1,536 separately indexed episodes. The compressed static bundle is approximately 243 MB plus the index; archive extraction is capped at 2 GiB and 100,000 files. These datasets are separately hashed and are never pooled.

## Technology and versions
Every Python requirements file is exactly pinned. Frontend ranges are constrained by the committed npm lock; the table records installed lock versions.

| component | package | version | use | alternative considered |
|---|---|---|---|---|
| Product runtime | `annotated-doc` | `0.0.5` | pinned dependency | exact environment contract |
| Product runtime | `annotated-types` | `0.8.0` | pinned dependency | exact environment contract |
| Product runtime | `anyio` | `4.15.1` | pinned dependency | exact environment contract |
| Product runtime | `certifi` | `2026.7.22` | pinned dependency | exact environment contract |
| Product runtime | `click` | `8.5.0` | pinned dependency | exact environment contract |
| Product runtime | `fastapi` | `0.141.1` | pinned dependency | exact environment contract |
| Product runtime | `gymnasium` | `1.4.0` | pinned dependency | exact environment contract |
| Product runtime | `h11` | `0.16.0` | pinned dependency | exact environment contract |
| Product runtime | `httpcore` | `1.0.9` | pinned dependency | exact environment contract |
| Product runtime | `httpx` | `0.28.1` | pinned dependency | exact environment contract |
| Product runtime | `idna` | `3.20` | pinned dependency | exact environment contract |
| Product runtime | `ipykernel` | `7.4.0` | pinned dependency | exact environment contract |
| Product runtime | `joblib` | `1.6.0` | pinned dependency | exact environment contract |
| Product runtime | `jsonschema` | `4.26.0` | pinned dependency | exact environment contract |
| Product runtime | `matplotlib` | `3.11.2` | pinned dependency | exact environment contract |
| Product runtime | `nbclient` | `0.11.0` | pinned dependency | exact environment contract |
| Product runtime | `nbformat` | `5.11.1` | pinned dependency | exact environment contract |
| Product runtime | `numpy` | `2.5.3` | pinned dependency | exact environment contract |
| Product runtime | `pydantic` | `2.13.5` | pinned dependency | exact environment contract |
| Product runtime | `pydantic-core` | `2.46.5` | pinned dependency | exact environment contract |
| Product runtime | `pytest` | `9.0.3` | pinned dependency | exact environment contract |
| Product runtime | `reflexmesh` | `0.1.2` | pinned dependency | exact environment contract |
| Product runtime | `ruff` | `0.15.11` | pinned dependency | exact environment contract |
| Product runtime | `sb3-contrib` | `2.9.2` | pinned dependency | exact environment contract |
| Product runtime | `scikit-learn` | `1.9.1` | pinned dependency | exact environment contract |
| Product runtime | `stable-baselines3` | `2.9.2` | pinned dependency | exact environment contract |
| Product runtime | `starlette` | `1.7.0` | pinned dependency | exact environment contract |
| Product runtime | `torch` | `2.14.1` | pinned dependency | exact environment contract |
| Product runtime | `typing-extensions` | `4.16.0` | pinned dependency | exact environment contract |
| Product runtime | `typing-inspection` | `0.4.4` | pinned dependency | exact environment contract |
| Product runtime | `uvicorn` | `0.53.0` | pinned dependency | exact environment contract |
| Browser build | `@fasl-work/caos-app-shell` | `0.19.9` | locked frontend dependency | exact package-lock version |
| Browser build | `@playwright/test` | `1.63.0` | locked frontend dependency | exact package-lock version |
| Browser build | `@types/node` | `22.20.0` | locked frontend dependency | exact package-lock version |
| Browser build | `@types/react` | `19.2.17` | locked frontend dependency | exact package-lock version |
| Browser build | `@types/react-dom` | `19.2.3` | locked frontend dependency | exact package-lock version |
| Browser build | `@vitejs/plugin-react` | `6.1.1` | locked frontend dependency | exact package-lock version |
| Browser build | `i18next` | `26.4.2` | locked frontend dependency | exact package-lock version |
| Browser build | `katex` | `0.19.0` | locked frontend dependency | exact package-lock version |
| Browser build | `lucide-react` | `1.47.0` | locked frontend dependency | exact package-lock version |
| Browser build | `prettier` | `3.9.8` | locked frontend dependency | exact package-lock version |
| Browser build | `react` | `19.2.7` | locked frontend dependency | exact package-lock version |
| Browser build | `react-dom` | `19.2.7` | locked frontend dependency | exact package-lock version |
| Browser build | `react-i18next` | `17.0.14` | locked frontend dependency | exact package-lock version |
| Browser build | `react-router` | `7.18.4` | locked frontend dependency | exact package-lock version |
| Browser build | `react-router-dom` | `7.18.4` | locked frontend dependency | exact package-lock version |
| Browser build | `typescript` | `5.9.3` | locked frontend dependency | exact package-lock version |
| Browser build | `uplot` | `1.6.32` | locked frontend dependency | exact package-lock version |
| Browser build | `vite` | `8.3.5` | locked frontend dependency | exact package-lock version |
| Browser build | `vitest` | `5.0.5` | locked frontend dependency | exact package-lock version |
| Browser build | `zustand` | `5.0.15` | locked frontend dependency | exact package-lock version |

## Resources
| stage | memory | disk | time | where it runs |
|---|---|---|---|---|
| bake | 8 GiB host RAM; bounded workers | 2 GiB extraction limit; 243 MB trace payload | Offline model fitting and episode generation; not a CI job | Maintainer-controlled research host |
| tests | 8 GiB host RAM | Temporary case data; cleaned after run | Python, contract, browser, and fresh-kernel checks | CI and local disposable workspaces |
| build | 8 GiB host RAM | Static bundle plus immutable evidence | Frontend build and artifact hashing | CI build runner |
| deploy | 512 MiB service memory; one CPU quota | 24 retained run directories; one-hour retention | Static switch is atomic; service health checked after install | Neuraxis deployment host |

## Lanes
The browser contains interactive simulation, immutable canonical replay and visualization. The static payload includes 14,400 trace files, about 243 MB before compression, plus the 5 MB index. Training and planner inference run locally, never in CI. Public file tasks execute the installed native package under a separate fixed-tool service; user workspace authority stays local.
The workspace local lane executes user-authored DAG recipes and displays actual native receipts. Static public requests to /api return 404. Offline research, model fitting and transfer workloads are retained in the package evidence.

## Method ladder
| id | tier | method | acceptance criterion | gate |
| --- | --- | --- | --- | --- |
| M01 | classical | Guarded finite-state controller | Maintained state rules execute independent postconditions across the complete core matrix. | `docs/evaluation/corrected-results.md` |
| M02 | classical | Behavior-tree controller | Explicit behavior-tree traversal executes the same candidate/authority contract. | `docs/evaluation/corrected-results.md` |
| M03 | sota | Logistic imitation policy | Fitted model, disjoint calibration and Rust export match within 1e-5. | `docs/evaluation/corrected-results.md` |
| M04 | sota | Gradient-boosted action policy | Fitted model, calibration and Rust export match within 1e-5. | `docs/evaluation/corrected-results.md` |
| M05 | sota | Recurrent GRU imitation | Trained GRU carries episode-local hidden state; ONNX export parity is measured. | `docs/evaluation/corrected-results.md` |
| M06 | sota | Contextual linear bandit | Logged executed rewards and propensities fit the contextual linear bandit. | `docs/evaluation/corrected-results.md` |
| M07 | sota | Masked PPO | PPO records achieved online transitions and held-out execution outcomes. | `docs/evaluation/corrected-results.md` |
| M08 | sota | Learned-model bounded lookahead | Learned observed transitions, reward and termination support bounded lookahead; prediction error is measured. | `docs/evaluation/corrected-results.md` |
| M09 | sota | Deliberative language-model planner | A real model receives the current bounded candidate set; its selected action is independently admitted. | `docs/evaluation/corrected-results.md` |
| M10 | sota | Fixed asynchronous delegation | Request, acceptance, rejection and unused completion are recorded. | `docs/evaluation/corrected-results.md` |
| M11 | sota | Cost-sensitive learned deferral gate | Paired executed incremental utility fits a calibrated gate with separate threshold selection. | `docs/evaluation/corrected-results.md` |
| BS-1 | beyond | M12: resource-versioned, outcome-aware metacontrol | Recurrent/effect preference, surprise response and learned allocation execute; compare against matched baselines and four component ablations. | `docs/evaluation/corrected-results.md` |
The app exposes the full ladder with method-specific evidence and limitations. Acceptance requires canonical results for every method and replay of a hash-verified trace, not just an attractive method selector.

## Beyond the state of the art
- **BS-1 (M12), resource-versioned, outcome-aware metacontrol.** The proposal combines persistent causal/effect state, observed resource revisions, stale-proposal invalidation, and computation allocation that includes planner outcome and delay. Its falsifiable hypothesis is that, under a fixed deliberation budget and independently verified software postconditions, this stateful controller improves the success/cost frontier over a competent guarded controller and asynchronous planner baselines without admitting stale or unauthorized effects. Evaluate on disjoint task families with paired outcomes, resource changes during pending plans, explicit planner failures, and component ablations. The existing frozen evidence does not support that hypothesis: M12 solves 1,160/1,200 core episodes while exact M01 solves 1,200/1,200; the fitted allocation gate selects never-defer; all four ablations preserve task success; and the reported transfer comparisons do not establish a consistent advantage. BS-1 is therefore a proposed method with a negative/partial result, not a claim of demonstrated superiority, biological equivalence, or general intelligence.

## Cases
The twenty [case contracts](../cases/cases.md) cover files, builds, HTTP, processes, dependencies, conflicts, planners, untrusted text and crash recovery. Each has six variants and ten core seeds per method. Export rejects missing cells. The independent structural-transfer and ablation results remain separately labeled in the scientific report.

The benchmark adequacy audit diagnoses the frozen core's state-machine ceiling and seed sensitivity without altering its traces. A new eight-family semantic-transfer lane uses the same twelve frozen methods with opaque, type-compatible operations and actual file effects. Its 1,536 episodes have a separate index, lineage, SHA-256 checks and result view. Results from these lanes are never pooled.

## Oracles
The package evaluates actual environment postconditions. The app validates immutable receipt-bearing traces and displays outcomes unchanged, including failure, cancellation and abstention. Demonstration reliability is labeled as such. Native runs are checked with actual API responses; workspace/recovery browser tests verify real filesystem effects. Screenshots and viewport checks cover six routes, both languages and both themes.

## Deploy driver
The repository is public. The 243 MB trace payload exceeds the 100 MB small-static-data planning threshold; the measured ML VPS has 37 GB free disk, 8 GB RAM and four CPUs. Deploy immutable compressed static releases to neuraxis.ml.fasl-work.com on that host. Archive installation enforces a 2 GiB unpacked limit, 100,000-file limit, exact hashes and atomic current-release switching. TLS must be verified externally for this hostname. The additional operation service has two concurrent native runs, 24 retained directories, one-hour retention, 512 MiB memory and one CPU quota. No training service or general user workspace is deployed there. The separately reviewed [operational requirements](features/operational-workbench/requirements.md) govern its input and authority boundaries.

## Risks and kill criteria
Reject incomplete matrices, wrong run identities, hash drift, tokenless effects, stale previews, clipped controls and invalid mathematics. Do not release with an unresolved artifact or process ownership defect. A green build alone cannot establish deployment, usable controls or scientific superiority. Actual PyPI publication, verified TLS and final remote branch state remain separate completion gates.

## ADR fit
| ADR | fit | product evidence |
|---|---|---|
| ADR-0070 | applicable | The operations workbench exposes the shared shell Focus control and browser gates exercise it on task and investigation routes. |
| ADR-0075 | adopted | The versioned design, feature requirements, validation evidence, and repository gates record implementation status. |
| ADR-0078 | adopted | The product adopts the template's required design sections and feature-level adversarial validation. |

## Requirements
Feature convergence lives under [features](features/). Scientific conclusions are in [corrected results](../evaluation/corrected-results.md).

## Adoption and migration history
Release 0.02.009 adopts the published CAOS App Shell 0.19.1 and the tagged CAOS Product Template 0.11.000 baseline. The root route is an executive introduction; `/app` is the bounded operations workbench. Scientific pages retain direct routes. Shell `DocSection` scopes references to the open section, and the standalone bibliography tab has been removed. Calibration and risk-coverage plots use the shell interactive chart so keyboard navigation, zoom/pan, a readable data table, localized axes and a named chart are available. The executive view summarizes canonical measurements without claiming general intelligence or unsupported superiority. Route-level imports keep research, operations and benchmark code out of the initial route; the shell, React and math runtimes are split into shared vendor chunks.



Release 0.02.010 adopts the exact published `@fasl-work/caos-app-shell` 0.19.2 and the `CAOS_PRODUCT_TEMPLATE` 0.11.002 correction relevant to this product. Shell 0.19.2 fixes gate G5's sticky-header occlusion measurement for controls inside nested static semantic headers (SHG-074). Template 0.11.002 makes content-standard diagnostics survive capture through a Windows ANSI-code-page pipe; the product checker and a planted-emoji regression test carry that behavior. The adopted template release and changed product file are recorded in `.template-version` and `CHANGELOG.md`. The built shell gate measures `/` as the document surface and `/app` as a surface App, matching the product's actual route types. Benchmark results, robustness, comparison, caveats and provenance are individually scoped evidence areas with localized charts, controls and source disclosures. Validation evidence and remaining limits belong in `docs/release-verification.md` and the release receipt.



The public Neuraxis site shows the public source repository through the shared shell's GitHub icon and footer link. The footer identifies the Apache-2.0 license in English and Spanish. Browser validation checks the exact link and license label on all routes and in both languages.



Release 0.02.012 loads the Introduction shell synchronously so the executive view is available on the first render while its technical science content stays lazy. The compound operations view renders grouped counts and measured timings from the canonical operation index immediately, then fetches the selected run detail and checks its SHA-256 against that index. Task and investigation stages opt into the shared shell Focus control. The release gate covers landing readiness, operation evidence and focus affordances.



The repository declares product identity and deployment topology, catalogs persisted contracts with a locked version map, derives readiness from actual source paths, and exposes the pipeline as an internal Python package that delegates scientific stages to reflexmesh. Each adopted feature records its validation evidence. The bilingual notebook curriculum is organized into six topics and three increasing levels, uses the released Reflexmesh policy API on a hash-verified trace, analyzes matched frozen evaluations, and compares them with the persisted research sources. The template notebook checker and fresh-kernel runner enforce the published structure and reproducibility rules. Contract and adversarial suites reject malformed catalogs, duplicate identities, path traversal and stale readiness digests. `scripts/check_product_gates.py` is the consolidated entry point for these checks and the existing research/frontend release gates.



The release candidate adopts the currently tagged `CAOS_PRODUCT_TEMPLATE` 0.12.000 and the published
`@fasl-work/caos-app-shell` 0.19.5. The template adoption adds the measured notebook lesson floors, the example-residue
guard data, adversarial notebook-bar tests, the exact technology matrix, the user-facing notebook guide and product-specific validation requirements. Neuraxis
declares `reflexmesh.pipeline.make_policy` as the callable policy factory and `reflexmesh.evaluation.runner.run_episode`
as the executed evaluation method. Its bilingual notebook set is rebuilt to meet the lesson bar; the old committed
traces remain immutable evidence, not substitutes for executed methods. The shell upgrade is checked against the actual
Neuraxis `/` document route and `/app` surface route. The candidate does not claim that UI or scientific design has user
acceptance until the live surfaces are reviewed by Felipe.
