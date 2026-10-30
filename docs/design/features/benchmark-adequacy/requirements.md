# Benchmark adequacy and semantic transfer requirements

| ID | Requirement | Gate |
|---|---|---|
| BA-001 | WHEN the frozen matrix is exported, THE audit SHALL verify all indexed core trace hashes before counting method and seed outcomes. | `scripts/check_artifacts.py` |
| BA-002 | WHEN a complete semantic lane is published, THE static package SHALL verify each episode digest, identity, lineage and aggregate against the separate report. | `scripts/check_semantic_transfer.py` |
| BA-003 | WHEN a task user opens the default route, THE interface SHALL say that ReadyPolicy chooses a dependency-ready action without the learned gate or a language model. | `frontend/scripts/gate.mjs` |
| BA-004 | WHEN a researcher opens the semantic view, THE browser SHALL hash-check the index and selected trace before displaying its outcome and actual effects. | `frontend/src/test/artifact-integrity.test.ts` |
