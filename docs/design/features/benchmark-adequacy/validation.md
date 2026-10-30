# Benchmark Adequacy adversarial validation

Candidate: 0.02.016. Evidence gates are source-bound and preserve the separate core, transfer and routing datasets.

| requirement | adversarial check | gate |
|---|---|---|
| BA-001 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/adversarial/test_artifact_guards.py::test_adversarial_core_matrix_guard_fails_closed` |
| BA-002 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/adversarial/test_artifact_guards.py::test_adversarial_transfer_guard_fails_closed` |
| BA-003 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/adversarial/test_artifact_guards.py::test_adversarial_core_matrix_guard_fails_closed` |
| BA-004 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/adversarial/test_artifact_guards.py::test_adversarial_core_matrix_guard_fails_closed` |
