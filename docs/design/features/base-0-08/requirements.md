# base-0-08 requirements

This release's changes to Neuraxis: the routes and the landing, the executive view, the documentation areas, the contract catalog with its
readiness document, the evidence import and the bilingual surfaces. The requirements were completed after the units that are in this tree, from
the code, the tests and the catalog (2026-10-20); each names the test or script that already holds it. EARS (Mavin et al., RE'09,
doi:10.1109/RE.2009.9).

| ID | Requirement | Gate |
|---|---|---|
| BR-001 | WHEN the root or an unknown path is opened, THE app SHALL render the shell landing and SHALL NOT render the App, and WHEN /app is opened THE app SHALL render the App. | `frontend/src/App.test.tsx::the root and the catch-all render the shell landing, and /app renders the App` |
| BR-002 | WHEN the header is rendered, THE app SHALL list the six routes in the shell's standard order with the App leftmost. | `frontend/src/App.test.tsx::the header lists the six routes in the standard order, the App leftmost` |
| BR-003 | WHEN an old App link with a query string and a hash is opened, THE app SHALL forward it to /app and SHALL keep every query key and the hash. | `frontend/src/App.test.tsx::every old App link shape stays on one /app route that reads the same query (the App holds the view in ?mode=)` |
| BR-004 | WHEN the app is built, THE header version SHALL be read from VERSION and no version literal SHALL remain in the code. | `frontend/src/App.test.tsx::the version is read from VERSION at build time, never written in the code`, `scripts/check_version_coherence.py` |
| BR-005 | THE product SHALL carry its identity (product.json), the template release it was built from (.template-version, in the template format) and one deploy place (deploy/TARGET). | `frontend/src/base-record.test.ts::.template-version records the template release in the template format` |
| BR-006 | THE browser-gate runner SHALL pass the requirement of Focus mode before every pass-through argument, so that the requirement cannot be turned off. | `frontend/src/gate-script.test.ts::passes --require-focus before the pass-through arguments, so the requirement cannot be turned off` |
| BR-007 | WHEN the Introduction opens, THE page SHALL open on the executive view, and THE technical view SHALL hold the five documentation areas as topics. | `frontend/src/pages/documentation.test.tsx::opens on the executive view: two tabs, executive then technical, the first selected` |
| BR-008 | THE executive file SHALL be valid against the shell's executive schema 2.0.0 and its writing limits, with the 4 C's in order, cause weights that add to at most 100, every action owner a role of the situation, and every source cited. | `frontend/src/content/executive.test.ts::is valid against schema 2.0.0 and its writing limits`, `scripts/check_sdd.py` |
| BR-009 | THE executive file SHALL name no model, no AI vendor and no client, and SHALL carry every text in English and Spanish. | `frontend/src/content/executive.test.ts::names no model, no AI vendor and no client (the view says "the best agent")` |
| BR-010 | THE three executive illustrations SHALL be SVG documents with a viewBox, coloured only by theme tokens that the shell defines, with bilingual labels of size 22 or more. | `frontend/src/content/illustrations.test.ts::colours only by theme tokens, none or currentColor, and every token exists in the shell` |
| BR-011 | WHEN an illustration animates, THE file SHALL carry a reduced-motion block that stops the animation and a loop of ten seconds at most. | `scripts/check_svg_animation.py` |
| BR-012 | THE sections of every documentation page SHALL each declare one area of that page's vocabulary, and only Methodology sections SHALL carry a kind. | `frontend/src/data/areas.test.ts::its sections are the five areas, each once, in the order problem, principles, math, pipeline, honesty` |
| BR-013 | THE paragraph sources composed from the per-page files SHALL equal the map the single file held before the split, and no section id SHALL be attributed in two pages. | `frontend/src/data/sources.test.ts::compose to exactly the map the single file held before the split` |
| BR-014 | THE citation modules SHALL hold every citation id once, define every id a section or paragraph names, and define no id that nothing references. | `frontend/src/data/citations.test.ts::no citation is defined that nothing references` |
| BR-015 | THE Implementation page SHALL cover the reproducibility area with at least two dense paragraphs per language, one limit, four ordered steps and four table rows. | `frontend/src/data/areas.test.ts::Implementation: the page covers the reproducibility area, with a dense paragraph in both languages and an honest limit` |
| BR-016 | THE committed evidence index, the lineage and every episode of the core and the semantic-transfer sets SHALL validate against their schema files, in the committed tree and in the provider tree. | `tests/contracts/test_derived_documents.py::test_episodes_validate` |
| BR-017 | WHEN an episode file changes, THE index digest check SHALL fail, so that a trace is never accepted for a digest it does not have. | `tests/contracts/test_derived_documents.py::test_adversarial_a_changed_episode_breaks_its_digest` |
| BR-018 | THE four evidence documents and the semantic-transfer index SHALL validate against their schema files and SHALL be bound to the indexes they audit. | `tests/contracts/test_evidence_documents.py::test_the_documents_are_bound_to_the_indexes_they_audit` |
| BR-019 | THE recorded operation index and its 36 runs SHALL validate against their schema files, and a run SHALL carry the digest its index row records. | `tests/contracts/test_operations_documents.py::test_operation_runs_validate` |
| BR-020 | THE nine routes of the operations service SHALL equal the routes of the OpenAPI document, and every response body SHALL validate against its declared schema. | `tests/contracts/test_api.py::test_responses_match_the_openapi_document` |
| BR-021 | WHEN a static archive is packaged, THE release manifest SHALL validate against its schema file. | `tests/contracts/test_release_manifest.py::test_packaged_manifest_validates` |
| BR-022 | THE readiness document SHALL equal a fresh computation from the catalog and the committed documents. | `tests/contracts/test_readiness.py::test_committed_readiness_is_current` |
| BR-023 | IF the episode index is absent, THEN THE readiness SHALL say missing for the rows that depend on it. | `tests/contracts/test_readiness.py::test_adversarial_state_missing_without_an_index` |
| BR-024 | IF an episode the index lists is absent, THEN THE readiness SHALL say partial with the count and the sorted absent paths. | `tests/contracts/test_readiness.py::test_adversarial_state_partial_episodes` |
| BR-025 | IF the recorded operation index names an engine other than the one the requirements pin, THEN THE readiness SHALL say stale with both versions. | `tests/contracts/test_readiness.py::test_adversarial_state_stale` |
| BR-026 | WHILE a catalog row is active, THE readiness SHALL say provider and name the provider. | `tests/contracts/test_readiness.py::test_adversarial_state_provider_through_a_catalog_copy` |
| BR-027 | THE committed tree and the provider tree SHALL pass the same assertions for every document kind. | `tests/contracts/test_swap.py::test_swap_derived_tree` |
| BR-028 | WHEN the evidence import runs, THE four documents SHALL be byte-identical to the engine files at the pinned commit, and a digest mismatch SHALL stop the import before anything is written. | `tests/contracts/test_evidence_provenance.py::test_import_writes_the_four_files_byte_identical` |
| BR-029 | THE export and the operation writers SHALL validate their documents against the schema files before writing them. | `tests/contracts/test_writer_validation.py::test_export_refuses_a_broken_index_and_writes_nothing` |
| BR-030 | WHEN a schema file changes, THE generated web types SHALL be regenerated before the build passes. | `frontend/scripts/gen-contract-types.mjs` |
| BR-031 | THE web SHALL read the committed build and the provider tree with the same assertions and SHALL refuse a drifted document with the key named. | `frontend/src/lib/contract.test.ts::the operation index and every run it lists conform` |
| BR-032 | WHILE views have evidence in several states, THE site SHALL label a view with the most severe state of its rows, in the order missing, partial, training, provider, stale, available. | `frontend/src/readiness/readiness.test.ts::adversarial: order: missing, partial, training, provider, stale, available; the most severe wins` |
| BR-033 | IF the readiness document cannot be read, THEN THE site SHALL keep every view working and say readiness unknown in both languages. | `frontend/src/readiness/readiness.test.ts::a fetch that fails resolves to null, names the cause on the console, and is asked for once` |
| BR-034 | WHEN a pinned dependency and the technology table of the SDD disagree, THE technology guard SHALL fail naming the package. | `scripts/check_tech_matrix.py` |
| BR-035 | WHEN a requirement names a gate that does not exist, is skipped or is not a test or a script, THE SDD guard SHALL fail naming the requirement. | `scripts/check_sdd.py` |

Not in this table, on purpose:

- Focus mode of the App. It belongs to the surface unit on shell 0.16.0, which is not in this tree, and has no gate yet; the gate runner's
  hold on the requirement is BR-006. Its requirement is written when that unit lands.
- The Methodology page unit and the Experiments and Benchmark unit, for the same reason.
- The parity of the browser simulation with the committed episode of the same case, variant and seed (boundary B13 of the sizing): no test
  of it exists in this tree.
