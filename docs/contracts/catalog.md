# Contract catalog: Neuraxis

Phase 2 of contract-first parallel delivery (ADR-0080; rule 11 sections 11 to 20 in CAOS_MANAGE), taken from the product
template 0.08.002 with the `documents` column of 0.09.000. One row per boundary: every kind of committed document under
`data/` (15,981 files of eleven kinds), the operations API and the release manifest. Each schema file is the
single source of its contract: the Python producers and consumers validate against it in their tests, and the TypeScript
types are generated from it (U3b, from `docs/contracts/api.openapi.json`, whose components reference the schema files). A
change to a contract bumps its row's version and updates both sides in one pull request.

Checks: `python scripts/check_contracts.py docs/contracts/catalog.md --repo-root .` (every field, every path),
`python scripts/check_documents.py` (every committed document against the schema its row names, by the `documents` column)
and `python scripts/check_skeleton.py docs/contracts/catalog.md` (exit 2 lists the rows still served by a provider; allowed
while a product is being built, never at a release). The readiness document (`data/derived/readiness.json`) is computed
from this file; editing the catalog makes it stale until `python data-pipeline/run.py readiness` runs again
(`scripts/check_readiness.py` fails meanwhile).

The `documents` column says which committed files a row's schema governs, so that `scripts/check_documents.py` names no
document. A cell is `-` (a contract with no committed document) or globs relative to the repository root separated by
`, ` (`pathlib` glob semantics); a glob starting with `!` excludes what the row's other globs match; on the row whose
schema file is the OpenAPI document each glob is `path#ComponentName`. A glob under `data/` is applied twice: at the
repository root and at the provider tree `docs/contracts/fixtures/`.

Versions and history: a contract's version moves with its schema, by semver (a removed or renamed field, a narrowed type
or a new required field is major; a new optional field is minor; a description or example change is patch), and every
version has a row in the History section below, whose `kind` is the semver step from the contract's previous row (the
first row is `initial`). `docs/contracts/versions.lock.json` holds each schema's version and digest (line endings
normalised to LF); `python scripts/check_contract_versions.py` fails when a schema changed under the same version, when a
version went down, when the lock is not current with the catalog, or when a row has no History entry for its current
version. After a deliberate bump and its History row, run `python scripts/check_contract_versions.py --update` and commit
the lock with the schema and both sides in one pull request. CI also runs
`python scripts/check_contract_versions.py --base <ref>` (the push's `before` SHA, or `origin/develop`, on a checkout with
`fetch-depth: 0`); a contract with no row at the ref is a first release.

Scope of this catalog. The operations API in `app/operations_api.py` (nine routes under `/operations-api`) is a row. The
local engine API under `/api` (served by `reflexmesh.server`, mounted at app/main.py lines 33 to 37) is reflexmesh's own contract
and is not in this catalog; it is not enumerated here because its routes are not defined in `app/`. The documents
`research.json`, `benchmark-adequacy.json`, `semantic-routing-study/analysis.json` and `semantic-transfer/report.json` are
written by scripts of the engine repository (`export_science_report.py`, `audit_benchmark_adequacy.py`, `study_semantic_routing.py`,
`audit_semantic_transfer.py`) over its own `artifacts/`, which are not the product's; the product's producer of record is the
import stage `python data-pipeline/run.py import-evidence` (U3c), a release operation never run in CI, which reads each file at
reflexmesh tag v0.01.002 (commit 447cc08), verifies its SHA-256 against `docs/contracts/evidence-provenance.json`, validates it
against its schema and writes it; CI only compares the committed digests with that file. The semantic-transfer
index, its episodes and its lineage are written by the engine's `evaluate` with the `semantic-transfer` stage, so they
are real.

The two episode sets (`data/derived/episodes/`, 14,400 files, and `data/derived/semantic-transfer/episodes/`, 1,536 files)
and the two lineage files carry one shape each (the engine's `run_episode` and `lineage`), so each is one row; the
episode schema is the union of the keys of the two sets, the `lane` and `split` values say which set a file belongs to.

A product instantiated from the template replaces these rows with its own, keeps the columns, the states and the checks.

## Contracts

| id | version | owner | schema file | example | documents | producer test | consumer test | missing-data behavior | provider | model io | swap test | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| episode-index | 1.0.0 | reflexmesh 0.1.2 (installed engine) evaluation/runner.py:391-424 (`evaluate`), copied by data-pipeline/run.py:41 | docs/contracts/schemas/episode-index.schema.json | docs/contracts/fixtures/data/derived/index.json | data/derived/index.json | tests/contracts/test_derived_documents.py::test_index_validates | frontend/src/api/artifacts.test.ts, frontend/src/test/artifact-integrity.test.ts | missing: the site build stops at copy-data (no evidence without the index), the Workbench says not available yet, readiness says missing. partial: an episode the index lists is absent; readiness lists its path and the count | fixture:docs/contracts/fixtures/data/derived/index.json | - | tests/contracts/test_swap.py::test_swap_derived_tree | real |
| episode | 1.0.0 | reflexmesh 0.1.2 (installed engine) evaluation/runner.py:342-376 (`evaluate`, `run_episode`) | docs/contracts/schemas/episode.schema.json | docs/contracts/fixtures/data/derived/episodes/M01-C01-boundary-40000.json | data/derived/episodes/*.json, data/derived/semantic-transfer/episodes/*.json | tests/contracts/test_derived_documents.py::test_episodes_validate | frontend/src/api/artifacts.test.ts, frontend/src/test/artifact-integrity.test.ts | partial: an episode an index lists is absent; readiness lists its path and the count, the trace view of that run says not available yet and the other runs work. missing: no index, as episode-index | fixture:docs/contracts/fixtures/data/derived/episodes | - | tests/contracts/test_swap.py::test_swap_derived_tree | real |
| lineage | 1.0.0 | reflexmesh 0.1.2 (installed engine) evaluation/runner.py:342-345 (`evaluate` writes `lineage.json`), pipeline.py:85 (`lineage()`) | docs/contracts/schemas/lineage.schema.json | docs/contracts/fixtures/data/derived/lineage.json | data/derived/lineage.json, data/derived/semantic-transfer/lineage.json | tests/contracts/test_derived_documents.py::test_lineage_validates | frontend/src/test/artifact-integrity.test.ts | missing: the derived lineage is absent; readiness says missing and the episodes cannot be bound to their model and code digests. partial: the semantic-transfer index is present and its lineage is absent | fixture:docs/contracts/fixtures/data/derived/lineage.json | - | tests/contracts/test_swap.py::test_swap_derived_tree | real |
| research-summary | 1.0.0 | data-pipeline/core/evidence.py (`python data-pipeline/run.py import-evidence`): imports the engine's file at reflexmesh v0.01.002 (447cc08), verified by digest in docs/contracts/evidence-provenance.json; upstream producer scripts/export_science_report.py of the engine | docs/contracts/schemas/research-summary.schema.json | docs/contracts/fixtures/data/derived/research.json | data/derived/research.json | tests/contracts/test_evidence_documents.py::test_research_summary_validates, tests/contracts/test_evidence_provenance.py::test_every_committed_document_matches_its_provenance_digest, tests/contracts/test_evidence_provenance.py::test_import_writes_the_four_files_byte_identical | frontend/src/test/artifact-integrity.test.ts | missing: the document is absent, scripts/check_research.py fails and readiness says missing (run import-evidence). stale: a committed byte that differs from the provenance digest fails test_every_committed_document_matches_its_provenance_digest | fixture:docs/contracts/fixtures/data/derived/research.json | - | tests/contracts/test_swap.py::test_swap_evidence_documents | real |
| benchmark-adequacy | 1.0.0 | data-pipeline/core/evidence.py (`python data-pipeline/run.py import-evidence`): imports the engine's file at reflexmesh v0.01.002 (447cc08), verified by digest in docs/contracts/evidence-provenance.json; upstream producer scripts/audit_benchmark_adequacy.py of the engine | docs/contracts/schemas/benchmark-adequacy.schema.json | docs/contracts/fixtures/data/derived/benchmark-adequacy.json | data/derived/benchmark-adequacy.json | tests/contracts/test_evidence_documents.py::test_benchmark_adequacy_validates, tests/contracts/test_evidence_provenance.py::test_every_committed_document_matches_its_provenance_digest, tests/contracts/test_evidence_provenance.py::test_import_writes_the_four_files_byte_identical | frontend/src/test/artifact-integrity.test.ts | missing: the document is absent, scripts/check_artifacts.py fails and readiness says missing (run import-evidence). stale: a committed byte that differs from the provenance digest fails test_every_committed_document_matches_its_provenance_digest | fixture:docs/contracts/fixtures/data/derived/benchmark-adequacy.json | - | tests/contracts/test_swap.py::test_swap_evidence_documents | real |
| routing-study | 1.0.0 | data-pipeline/core/evidence.py (`python data-pipeline/run.py import-evidence`): imports the engine's file at reflexmesh v0.01.002 (447cc08), verified by digest in docs/contracts/evidence-provenance.json; upstream producer scripts/study_semantic_routing.py of the engine | docs/contracts/schemas/routing-study.schema.json | docs/contracts/fixtures/data/derived/semantic-routing-study/analysis.json | data/derived/semantic-routing-study/analysis.json | tests/contracts/test_evidence_documents.py::test_routing_study_validates, tests/contracts/test_evidence_provenance.py::test_every_committed_document_matches_its_provenance_digest, tests/contracts/test_evidence_provenance.py::test_import_writes_the_four_files_byte_identical | frontend/src/test/artifact-integrity.test.ts | missing: the document is absent, scripts/check_semantic_routing.py fails and readiness says missing (run import-evidence). stale: a committed byte that differs from the provenance digest fails test_every_committed_document_matches_its_provenance_digest | fixture:docs/contracts/fixtures/data/derived/semantic-routing-study/analysis.json | - | tests/contracts/test_swap.py::test_swap_evidence_documents | real |
| semantic-transfer-index | 1.0.0 | reflexmesh 0.1.2 (installed engine) evaluation/runner.py:391-424 (`evaluate` with the `semantic-transfer` stage of pipeline.py:300-316) | docs/contracts/schemas/semantic-transfer-index.schema.json | docs/contracts/fixtures/data/derived/semantic-transfer/index.json | data/derived/semantic-transfer/index.json | tests/contracts/test_evidence_documents.py::test_semantic_transfer_index_validates | frontend/src/api/artifacts.test.ts, frontend/src/test/artifact-integrity.test.ts | missing: the semantic-transfer evidence is absent, the Semantic transfer view says not available yet and readiness says missing. partial: an episode it lists is absent (counted under the episode row) | fixture:docs/contracts/fixtures/data/derived/semantic-transfer/index.json | - | tests/contracts/test_swap.py::test_swap_evidence_documents | real |
| semantic-transfer-report | 1.0.0 | data-pipeline/core/evidence.py (`python data-pipeline/run.py import-evidence`): imports the engine's file at reflexmesh v0.01.002 (447cc08), verified by digest in docs/contracts/evidence-provenance.json; upstream producer scripts/audit_semantic_transfer.py of the engine | docs/contracts/schemas/semantic-transfer-report.schema.json | docs/contracts/fixtures/data/derived/semantic-transfer/report.json | data/derived/semantic-transfer/report.json | tests/contracts/test_evidence_documents.py::test_semantic_transfer_report_validates, tests/contracts/test_evidence_provenance.py::test_every_committed_document_matches_its_provenance_digest, tests/contracts/test_evidence_provenance.py::test_import_writes_the_four_files_byte_identical | frontend/src/test/artifact-integrity.test.ts | missing: the document is absent, scripts/check_semantic_transfer.py fails and readiness says missing (run import-evidence). stale: a committed byte that differs from the provenance digest fails test_every_committed_document_matches_its_provenance_digest | fixture:docs/contracts/fixtures/data/derived/semantic-transfer/report.json | - | tests/contracts/test_swap.py::test_swap_evidence_documents | real |
| operation-index | 1.0.0 | scripts/evaluate_operations.py:51-65 (the index dict and its `write_bytes`) | docs/contracts/schemas/operation-index.schema.json | docs/contracts/fixtures/data/operations/index.json | data/operations/index.json | tests/contracts/test_operations_documents.py::test_operation_index_validates | frontend/src/lib/operations.test.ts | missing: the recorded operations are absent, the Operations view keeps the live tool and says the recorded evidence is not available yet, readiness says missing. stale: the index `engine` differs from the engine pinned in requirements.txt; readiness says stale with both | fixture:docs/contracts/fixtures/data/operations/index.json | - | tests/contracts/test_swap.py::test_swap_operations_tree | real |
| operation-run | 1.0.0 | scripts/evaluate_operations.py:35 (`write_bytes`), the dict built by app/services/operations.py:561 `execute_operation` | docs/contracts/schemas/operation-run.schema.json | docs/contracts/fixtures/data/operations/data-clean-70000.json | data/operations/*.json, !data/operations/index.json | tests/contracts/test_operations_documents.py::test_operation_runs_validate | frontend/src/lib/operations.test.ts | partial: a run the operation index lists is absent; readiness lists its path and the count, the view of that run says not available yet. missing: no operation index, as operation-index. stale: as operation-index | fixture:docs/contracts/fixtures/data/operations | - | tests/contracts/test_swap.py::test_swap_operations_tree | real |
| operations-api | 1.0.0 | app/operations_api.py:234-385 (nine routes under `/operations-api`) | docs/contracts/api.openapi.json | docs/contracts/examples/operations-api-config.json | docs/contracts/examples/operations-api-config.json#ConfigResponse | tests/contracts/test_api.py::test_responses_match_the_openapi_document | frontend/src/lib/operations.test.ts | missing: the operations service is not running (the static site has no API); the Operations view says so and keeps the recorded evidence. A run that does not exist answers 404, an expired session 401, an unknown fixture or a malformed body 422; the static readiness says missing for this row | fixture:docs/contracts/fixtures/data/operations | - | tests/contracts/test_api.py::test_swap_fixture_run_and_live_run | real |
| release-manifest | 1.0.0 | scripts/package_static.py:52 (`release.json`, written at packaging, never committed) | docs/contracts/schemas/release-manifest.schema.json | docs/contracts/examples/release-manifest.json | - | tests/contracts/test_release_manifest.py::test_packaged_manifest_validates | scripts/verify_live_static.py | missing: no packaging has run and there is no release.json; verify_live_static.py fails on a host without it. The static readiness says missing for this row | fixture:docs/contracts/examples/release-manifest.json | - | tests/contracts/test_release_manifest.py::test_example_and_packaged_manifest_swap | real |
| readiness | 1.0.0 | data-pipeline/core/readiness.py (`python data-pipeline/run.py readiness`) | docs/contracts/schemas/readiness.schema.json | docs/contracts/fixtures/data/derived/readiness.json | data/derived/readiness.json | tests/contracts/test_readiness.py::test_committed_readiness_is_current | frontend/src/test/artifact-integrity.test.ts | missing: the site build stops at copy-data; if the document cannot be loaded at run time the views keep working and each says readiness unknown | fixture:docs/contracts/fixtures/data/derived/readiness.json | - | tests/contracts/test_swap.py::test_swap_readiness | real |

The consumer-test cells name the existing consumers of each document (the frontend tests and the product's own guards,
all present today); U3b replaces or extends them with the generated-type contract tests.

## Missing-data states

One vocabulary for every row (ADR-0080 decision 3). `data-pipeline/core/readiness.py` computes each row's state from this
catalog and the repository; the frontend and the API show it. Rules, applied in this order, first match wins:

| Row kind | Condition | state | provenance | reason en | reason es |
|---|---|---|---|---|---|
| any | the catalog `status` is `active` | `provider` | the provider kind | Served by its provider ({provider}); the real producer is not built yet. | Lo sirve su proveedor ({provider}); el productor real aún no está construido. |
| operations-api, release-manifest | always, in the static document | `missing` | null | Not part of the static site; it exists only while the service runs or after packaging. | No forma parte del sitio estático; existe solo mientras el servicio funciona o tras empaquetar. |
| episode-index, episode, lineage | `data/derived/index.json` is absent | `missing` | null | The pipeline has not exported this build. | El pipeline no ha exportado esta versión. |
| semantic-transfer-index | `data/derived/semantic-transfer/index.json` is absent | `missing` | null | The semantic-transfer evidence has not been exported. | La evidencia de transferencia semántica no se ha exportado. |
| lineage | `data/derived/lineage.json` is absent | `missing` | null | The evaluation lineage is absent. | Falta el linaje de la evaluación. |
| lineage | the semantic-transfer index is present and its lineage is absent | `partial` | `real` | {n} of {total} lineage documents are absent. | Faltan {n} de {total} documentos de linaje. |
| episode | an episode an index lists is absent | `partial` | `real` | {n} of {total} episodes are absent. | Faltan {n} de {total} episodios. |
| operation-index, operation-run | `data/operations/index.json` is absent | `missing` | null | The recorded operations have not been executed. | Las operaciones registradas no se han ejecutado. |
| operation-run | a run the operation index lists is absent | `partial` | `real` | {n} of {total} operation runs are absent. | Faltan {n} de {total} ejecuciones de operación. |
| operation-index, operation-run | the index `engine` differs from the engine pinned in `requirements.txt` | `stale` | `real` | Recorded by {engine}; the product pins {pinned}. | Registrado con {engine}; el producto fija {pinned}. |
| any with a fixed-path `documents` cell | that file is absent | `missing` | null | The document is absent from this build. | El documento no está en esta versión. |
| any | otherwise | `available` | `real` | null | null |

The `status` column holds `real` or `active` only, in lower case; any other value fails the readiness computation (and so
`scripts/check_readiness.py`), because a status the rules do not know would be published as real. `{provider}` is the
row's provider cell (`kind:path`); `{n}`, `{total}`, `{engine}` and `{pinned}` are filled from the repository. `missing` is
a list of strings, non-empty exactly when the state is `partial`: the absent paths relative to `data/derived/` (episodes,
lineage) or `data/operations/` (operation runs), sorted. A row whose `documents` cell is a fixed path that is absent is
`missing` by the generic rule of its kind (the four `active` rows are `provider` first). What each surface does:

| state | the frontend shows | the API answers |
|---|---|---|
| `available` | the result | 200 |
| `partial` | the result for what exists; each absent run says not available yet | 200 for what exists, 404 for the absent paths |
| `stale` | the result and a note with the version that recorded it | 200 |
| `provider` | the result and a note naming the provider kind | 200 |
| `training` | not used by this catalog (no model slot) | 200 |
| `missing` | an explicit not available yet with the reason, never an empty chart | 503 with `{"detail": {"state": "missing", "reason": {...}}}` |

## Providers

- `docs/contracts/fixtures/data/`: a provider tree in the layout of `data/` (derived: an index with three episodes, the
  episodes, the lineage, the four evidence documents, a semantic-transfer index with one episode, its lineage and its
  report; operations: an index with one run and the run; and a readiness document that says `provider` for every row but
  `operations-api` and `release-manifest`, which are `missing` in the static document). It is generated by
  `python data-pipeline/fixtures.py` from the committed documents (shrunk, digests recomputed), so it validates against
  the same schemas; the contract tests run against it and against `data/` with the same assertions (the swap tests).
- `docs/contracts/examples/release-manifest.json` and `docs/contracts/examples/operations-api-config.json`: one example
  of the two contracts that have no committed document.

A provider is scaffolding: labelled on every surface by the readiness document, never counted as done for the unit that
owes the real producer (every row is real since U3c).

## History

One row per version of every contract, newest last within a contract. `kind` is initial, major, minor or patch, per the
rules above.

| contract | version | date | change | kind |
|---|---|---|---|---|
| episode-index | 1.0.0 | 2026-10-19 | the evaluation index of the engine: methods, cases, episode manifest with digests, aggregate results and the lineage in its provenance | initial |
| episode | 1.0.0 | 2026-10-19 | one executed episode: events, decisions, planner work, resources, metrics and provenance, for the derived and the semantic-transfer sets | initial |
| lineage | 1.0.0 | 2026-10-19 | the model, code, native and package digests an evaluation ran with | initial |
| research-summary | 1.0.0 | 2026-10-19 | the corrected-science summary: core, transfer, ablations, paired contrasts, training, routing, native parity, external benchmarks and the verdict | initial |
| benchmark-adequacy | 1.0.0 | 2026-10-19 | the audit of seed variability per case, variant and method | initial |
| routing-study | 1.0.0 | 2026-10-19 | the held-out analysis of the delegation gate | initial |
| semantic-transfer-index | 1.0.0 | 2026-10-19 | the evaluation index of the semantic-transfer suite | initial |
| semantic-transfer-report | 1.0.0 | 2026-10-19 | the audit of the semantic-transfer matrix: methods, families and paired M12 contrasts | initial |
| operation-index | 1.0.0 | 2026-10-19 | the index of the recorded compound-operation runs | initial |
| operation-run | 1.0.0 | 2026-10-19 | one recorded operation run: events, nodes, findings, inputs and the per-task artifacts | initial |
| operations-api | 1.0.0 | 2026-10-19 | the nine routes of the bounded public operations service | initial |
| release-manifest | 1.0.0 | 2026-10-19 | the manifest of a static deployment archive: commit, version, files and the four coverage records | initial |
| readiness | 1.0.0 | 2026-10-19 | what is real in a build, row by row, in one of six declared states | initial |
