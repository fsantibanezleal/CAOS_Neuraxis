# CAOS Neuraxis software design
Date: 2026-09-24; benchmark extension 2026-09-28. Candidate display release: 0.02.006; deployment evidence is recorded separately.

## Review and migration record
This records the existing research-backed implementation authorized before ADR-0075 was adopted on September 22. It is a September 23 migration of the current design, not a backdated pre-development review. The current user instruction explicitly continues the full implementation. Requirement convergence records distinguish local verification from publication and deployment.

## Problem and non-goals
Provide an inspectable software-control workbench, scientific explanation, complete measured comparison and authenticated local workspace operation. The public companion replays evidence; actual user tools run on the user's loopback service. A browser simulation is visibly labeled and never substituted for native effect evidence.
Non-goals: remotely controlling arbitrary visitors' machines, publishing credentials, browser execution of full training or local planner weights, or presenting a scientific hypothesis as AGI.

## Contracts
The product consumes the separately versioned reflexmesh PyPI dependency and declares no engine package. Offline export validates the complete matrix and byte hashes. The artifact index identifies every trace, method, case, variant, seed and frozen lineage; missing or malformed evidence fails export. Browser canonical replay checks SHA-256 and identity before loading. Imported files are explicitly unverified.
The local API uses a session bearer token, same-origin/loopback validation, bounded requests and immutable host registration. Workspace previews bind the entire validated recipe and current file hashes and expire after 120 seconds. Submission consumes a preview once. Recovery requires current unresolved-record identity, observed file evidence, effect review and process quiescence attestation.

## Lanes and measured basis
The browser contains interactive simulation, immutable canonical replay and visualization. The static payload includes 14,400 trace files, about 243 MB before compression, plus the 5 MB index. Training and planner inference run locally, never in CI. Public file tasks execute the installed native package under a separate fixed-tool service; user workspace authority stays local.
The workspace local lane executes user-authored DAG recipes and displays actual native receipts. Static public requests to /api return 404. Offline research, model fitting and transfer workloads are retained in the package evidence.

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

## Case taxonomy and coverage
The twenty [case contracts](../cases/cases.md) cover files, builds, HTTP, processes, dependencies, conflicts, planners, untrusted text and crash recovery. Each has six variants and ten core seeds per method. Export rejects missing cells. The independent structural-transfer and ablation results remain separately labeled in the scientific report.

The benchmark adequacy audit diagnoses the frozen core's state-machine ceiling and seed sensitivity without altering its traces. A new eight-family semantic-transfer lane uses the same twelve frozen methods with opaque, type-compatible operations and actual file effects. Its 1,536 episodes have a separate index, lineage, SHA-256 checks and result view. Results from these lanes are never pooled.

## Evaluation oracle
The package evaluates actual environment postconditions. The app validates immutable receipt-bearing traces and displays outcomes unchanged, including failure, cancellation and abstention. Demonstration reliability is labeled as such. Native runs are checked with actual API responses; workspace/recovery browser tests verify real filesystem effects. Screenshots and viewport checks cover six routes, both languages and both themes.

## Deploy driver
Private repository visibility excludes GitHub Pages. The 243 MB trace payload exceeds the 100 MB small-static-data planning threshold; the measured ML VPS has 37 GB free disk, 8 GB RAM and four CPUs. Deploy immutable compressed static releases to neuraxis.ml.fasl-work.com on that host. Archive installation enforces a 2 GiB unpacked limit, 100,000-file limit, exact hashes and atomic current-release switching. TLS must be verified externally for this hostname. The additional operation service has two concurrent native runs, 24 retained directories, one-hour retention, 512 MiB memory and one CPU quota. No training service or general user workspace is deployed there. The separately reviewed [operational requirements](features/operational-workbench/requirements.md) govern its input and authority boundaries.

## Risks and kill criteria
Reject incomplete matrices, wrong run identities, hash drift, tokenless effects, stale previews, clipped controls and invalid mathematics. Do not release with an unresolved artifact or process ownership defect. A green build alone cannot establish deployment, usable controls or scientific superiority. Actual PyPI publication, verified TLS and final remote branch state remain separate completion gates.

## Requirements
```text
R-001 WHEN the local API starts without explicit authentication, THE application SHALL reject startup.
Gate: tests/test_application.py::test_app_requires_explicit_local_auth
R-002 WHEN artifacts lack complete coverage, THE validator SHALL reject them.
Gate: tests/test_application.py::test_artifact_validator_rejects_empty_or_incomplete_matrix
R-003 WHEN a product dependency is declared, THE product SHALL consume reflexmesh without declaring its own installable engine.
Gate: tests/test_application.py::test_product_has_no_installable_engine
R-004 WHEN canonical trace bytes or identity differ, THE browser SHALL reject replay.
Gate: frontend/src/test/artifact-integrity.test.ts
R-005 WHILE viewing supported routes, THE interface SHALL fit the viewport in both languages and themes.
Gate: frontend/verify-browser.mjs
R-006 WHEN deep scientific content is visited, THE content gate SHALL inspect the rendered methods and equations.
Gate: frontend/verify-content.mjs
R-007 WHEN a workspace recipe is executed, THE workbench SHALL display actual file evidence and receipts.
Gate: frontend/verify-workspace.mjs
R-008 WHEN an unknown effect is reconciled, THE workbench SHALL require current evidence and operator review.
Gate: frontend/verify-recovery.mjs
R-009 WHEN a deployment archive is invalid, THE installer SHALL reject it before replacing the active release.
Gate: tests/test_static_deploy.py
R-010 WHEN canonical evidence is packaged, THE package builder SHALL validate the complete trace matrix.
Gate: scripts/package_static.py
R-011 WHEN CI executes, THE workflows SHALL respect the no-training budget.
Gate: scripts/check_ci_budget.py
R-012 WHEN the frozen core is presented, THE workbench SHALL expose a source-bound audit of its method ceiling and seed sensitivity.
Gate: scripts/check_artifacts.py
R-013 WHEN semantic-transfer results are packaged, THE product SHALL verify all 1,536 episode hashes, identities and lineage before release.
Gate: scripts/check_semantic_transfer.py
R-014 WHEN the default task route is displayed, THE interface SHALL identify its deterministic ReadyPolicy and distinguish it from learned-controller evidence.
Gate: frontend/verify-benchmark.mjs
```

Feature convergence lives under [features](features/). Scientific conclusions are in [corrected results](../evaluation/corrected-results.md).
