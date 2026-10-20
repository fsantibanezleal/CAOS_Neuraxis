# static-release requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

| ID | Requirement | Gate |
|---|---|---|
| SR-001 | WHEN the release is packaged, THE builder SHALL bind every published byte to a digest. | `scripts/package_static.py` |
| SR-002 | WHEN an archive violates paths or digests, THE installer SHALL reject it. | `tests/test_static_deploy.py` |
| SR-003 | WHEN CI runs, THE workflow SHALL avoid fitting and product test suites. | `scripts/check_ci_budget.py` |
| SR-004 | WHEN canonical evidence is packaged, THE package builder SHALL validate the complete trace matrix. | `scripts/package_static.py` |
