# Static Release adversarial validation

Candidate: 0.02.016. A release is source-bound only after the frontend build, evidence validators, package manifest and deployment receipt all identify the same commit.

| requirement | adversarial check | gate |
|---|---|---|
| SR-001 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_static_deploy.py::test_adversarial_deploy_rejects_traversal_before_switching_release` |
| SR-002 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_static_deploy.py::test_adversarial_deploy_rejects_mismatched_manifest` |
| SR-003 | Plant a malformed, missing, stale, unauthorized, or unpaired input covered by this requirement and require the product guard to fail closed. | `tests/test_static_deploy.py::test_adversarial_deploy_rejects_traversal_before_switching_release` |
