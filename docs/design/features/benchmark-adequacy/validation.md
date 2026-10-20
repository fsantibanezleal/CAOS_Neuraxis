# Adversarial validation: benchmark adequacy and semantic transfer

For each requirement of [`requirements.md`](requirements.md), the check that tries to break it: what was planted or refuted, and the test that plants it. `scripts/check_sdd.py` fails when a requirement has no row here (or two), when a check is empty, and when a gate names a test that does not exist. The gates under `tests/adversarial/` and `frontend/src/adversarial/` are the planted-defect tests of the suite that follows this document; until a test exists the guard reports its row, and the names here are the ones that suite is to create.

| requirement | adversarial check | gate |
|---|---|---|
| BA-001 | one byte of a copied core episode is changed and the index digest left alone: the artifact check exits non-zero naming the episode digest mismatch before any count is made | `tests/adversarial/test_benchmark_adequacy.py::test_adversarial_a_changed_core_episode_fails_the_artifact_check` |
| BA-002 | one byte of a copied semantic-transfer episode is changed: the transfer check exits non-zero naming the semantic trace digest mismatch | `tests/adversarial/test_benchmark_adequacy.py::test_adversarial_a_changed_semantic_episode_fails_the_transfer_check` |
| BA-003 | the default-route text is planted without the ReadyPolicy statement, and again with ReadyPolicy labelled a learned controller: the route check rejects both | `frontend/src/adversarial/benchmark-adequacy.test.ts::adversarial: a default route that omits ReadyPolicy or calls it learned is rejected` |
| BA-004 | a semantic trace with one changed byte is requested: the browser refuses it before it shows an outcome or an effect | `frontend/src/adversarial/benchmark-adequacy.test.ts::adversarial: a semantic trace with one changed byte is refused before display` |
| BA-005 | one count of the committed adequacy audit is changed with the episodes untouched: the artifact check exits non-zero naming the audit that differs from the canonical episodes | `tests/adversarial/test_benchmark_adequacy.py::test_adversarial_an_audit_that_differs_from_the_episodes_fails_the_artifact_check` |
