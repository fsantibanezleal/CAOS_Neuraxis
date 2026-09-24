# static-release convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

Seven product tests passed, with the positive Linux install case skipped on Windows and separately exercised on Linux. Archive creation, external TLS, live hydration and final release commit verification remain pending until deployed.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/package_static.py | Packaging implemented; final archive pending. |
| R-002 | tests/test_static_deploy.py | Implemented and locally verified; see evidence above. |
| R-003 | scripts/check_ci_budget.py | Policy migration implemented; run guard before commit. |
