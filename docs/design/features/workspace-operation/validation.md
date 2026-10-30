# Workspace Operation adversarial validation

Candidate: 0.02.016. Workspace authority is an authenticated local capability and is never included in static artifacts.

| requirement | adversarial check | gate |
|---|---|---|
| WO-001 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_operations_api.py::test_adversarial_boundary_and_invalid_inputs` |
| WO-002 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_operations_api.py::test_adversarial_boundary_and_invalid_inputs` |
| WO-003 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_operations_api.py::test_adversarial_boundary_and_invalid_inputs` |
