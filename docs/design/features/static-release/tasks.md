# static-release convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

The original 14,479-file archive installed from main 8fe79a3 after seven product tests and a separate positive Linux installer test. External TLS 1.3 verified the exact hostname and a certificate expiring December 23, 2026. Those are dated 0.01.000 results, not the current deployment verdict. The current 0.02.004 static release is sourced from 96bd2fa6061132fbc867d65abb39f87738834ad0; its 14,518 declared files, live entry-asset hashes and direct routes are recorded in [the source-bound release receipt](../../../validation/0.02.004/release.json). Main CI [36338490964](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36338490964) and static build [36338490966](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36338490966) passed for that commit. The 0.02.003 release remains [dated evidence](../../../validation/0.02.003/release.json); earlier billing failures remain historical observations.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/package_static.py | Passed: canonical matrix and exact file digests verified before packaging. |
| R-002 | tests/test_static_deploy.py | Implemented and locally verified; see evidence above. |
| R-003 | scripts/check_ci_budget.py | Passed: trunk-only, no fitting or product test suites, bounded jobs. |
