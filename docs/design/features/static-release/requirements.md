# static-release requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

```text
R-001 WHEN the release is packaged, THE builder SHALL bind every published byte to a digest.
Gate: scripts/package_static.py
R-002 WHEN an archive violates paths or digests, THE installer SHALL reject it.
Gate: tests/test_static_deploy.py
R-003 WHEN CI runs, THE workflow SHALL avoid fitting and product test suites.
Gate: scripts/check_ci_budget.py
```
