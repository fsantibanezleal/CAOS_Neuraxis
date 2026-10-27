# Neuraxis contract catalog

This catalog names the persisted boundaries that connect scientific production, evidence, application behavior and deployment. Versions identify the data shape at that boundary. The Python engine remains a separate PyPI project; Neuraxis owns the product pipeline orchestration, catalog, artifact validation and workbench consumption.

## Contracts

| id | version | scope | schema | producer | consumer | validator | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| product-metadata | 1.0.0 | Product identity, public visibility, bilingual summary, license and package provenance | `docs/contracts/schemas/product.schema.json` | `product.json` | `scripts/check_contract_catalog.py` | `tests/contracts/test_catalog.py` | real |
| canonical-index | 1.0.0 | The frozen 12-method, 20-family, six-variant, ten-seed core evaluation index, summaries, lineage and trace references | `docs/contracts/schemas/canonical-index.schema.json` | `data-pipeline/run.py`, `data/derived/index.json` | `frontend/src/api/artifacts.ts`, `frontend/src/components/ScientificEvidence.tsx` | `scripts/check_artifacts.py`, `tests/contracts/test_catalog.py` | real |
| canonical-episode | 1.0.0 | An executed policy episode with events, decisions, native receipt metrics, truth split and source-bound lineage | `docs/contracts/schemas/episode.schema.json` | `external:reflexmesh==0.1.2`, `data/derived/episodes` | `frontend/src/api/artifacts.ts` | `scripts/check_artifacts.py`, `frontend/src/test/artifact-integrity.test.ts` | real |
| semantic-transfer | 1.0.0 | Separate 1,536-episode semantic transfer index and report, not pooled with the frozen core | `docs/contracts/schemas/semantic-index.schema.json` | `external:reflexmesh==0.1.2`, `data/derived/semantic-transfer` | `frontend/src/components/ScientificEvidence.tsx` | `scripts/check_semantic_transfer.py`, `frontend/src/test/artifact-integrity.test.ts` | real |
| semantic-routing | 1.0.0 | Held-out controller routing analysis and matched comparator predictions | `docs/contracts/schemas/semantic-routing.schema.json` | `external:reflexmesh==0.1.2`, `data/derived/semantic-routing-study/analysis.json` | `frontend/src/components/ScientificEvidence.tsx` | `scripts/check_semantic_routing.py` | real |
| operation-study-index | 1.0.0 | Index of hash-bound native operation runs, inputs, policy, faults, findings and latency | `docs/contracts/schemas/operation-index.schema.json` | `data/operations/index.json` | `frontend/src/components/ScientificEvidence.tsx` | `scripts/check_operations.py`, `tests/contracts/test_catalog.py` | real |
| operation-study-detail | 1.0.0 | Concrete executed operation graph, effect receipts, findings and verified outputs | `docs/contracts/schemas/operation-detail.schema.json` | `data/operations` | `frontend/src/components/ScientificEvidence.tsx` | `scripts/check_operations.py`, `frontend/src/test/artifact-integrity.test.ts` | real |
| operations-api | 1.0.0 | Local bounded native operation session, run lifecycle, cancellation, export and ownership | `-` | `app/operations_api.py`, `app/services/operations.py` | `frontend/src/components/Operations.tsx` | `tests/test_operations_api.py`, `tests/test_operations_reliability.py` | real |
| workspace-authority | 1.0.0 | Authenticated local workspace authority, immutable registrations, preview tokens, effects and recovery | `-` | `app/main.py`, `external:reflexmesh==0.1.2` | `frontend/src/components/Workspace.tsx` | `tests/test_application.py`, `frontend/verify-workspace.mjs`, `frontend/verify-recovery.mjs` | real |
| product-readiness | 1.0.0 | Deterministic contract availability derived from this catalog and repository evidence | `docs/contracts/schemas/readiness.schema.json` | `data-pipeline/pipeline/readiness.py`, `data/derived/readiness.json` | `docs/`, CI checks | `scripts/check_readiness.py`, `tests/contracts/test_catalog.py` | real |
| static-release | 1.0.0 | Exact static release file set, SHA-256 manifest, product version and source revision | `-` | `scripts/package_static.py`, `deploy/TARGET` | `scripts/deploy_static.py`, live release manifest | `tests/test_static_deploy.py`, `scripts/verify_live_static.py` | real |
| template-adoption | 1.0.0 | Product metadata, features, architecture, notebooks, deployment target and adversarial gates | `-` | `.template-version`, `docs/design/features` | maintainers and CI | `scripts/check_product_gates.py`, `scripts/check_sdd.py` | real |

## Trust and version rules

The artifact validators are stronger than a JSON shape check: they verify exact raw-byte SHA-256 values, identity, matrix coverage, lineage, outcomes and denominators. A valid schema therefore does not establish that an episode is true or a method is superior. The native API and workspace authority are distinct boundaries; a replayed public trace has no local effect authority.

Increment a contract's minor version for compatible optional fields and its major version for changed meaning, required fields, identity semantics or hash rules. Update the corresponding schema, producer, consumer, tests and readiness in the same change. Do not rewrite frozen result indexes to make a new contract appear satisfied.

## Readiness

`data/derived/readiness.json` records the versioned state of every row and the SHA-256 of this catalog. `python data-pipeline/run.py readiness` regenerates it; `python scripts/check_readiness.py` recomputes it and fails on drift. `available` means the declared code and evidence paths exist. It does not certify owner acceptance, a live deployment or scientific adequacy.
