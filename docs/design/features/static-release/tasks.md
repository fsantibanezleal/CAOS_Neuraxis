# static-release convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

Seven product tests passed, with the positive Linux install case skipped on Windows and separately exercised on Linux. The 14,479-file archive installed successfully from main 8fe79a3, with full manifest validation. External TLS 1.3 verified the exact hostname and a certificate expiring December 23, 2026. Live canonical hydration passed. Subsequent UI repair archives are required to pass the same installer and live checks. Private GitHub Actions remains blocked before job execution by account billing; local gates are the recorded validation, not a fabricated hosted CI pass.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/package_static.py | Passed: canonical matrix and exact file digests verified before packaging. |
| R-002 | tests/test_static_deploy.py | Implemented and locally verified; see evidence above. |
| R-003 | scripts/check_ci_budget.py | Passed: trunk-only, no fitting or product test suites, bounded jobs. |
