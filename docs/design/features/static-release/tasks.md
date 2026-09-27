# static-release convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

The original 14,479-file archive installed from main 8fe79a3 after seven product tests and a separate positive Linux installer test. External TLS 1.3 verified the exact hostname and a certificate expiring December 23, 2026. Those are dated 0.01.000 results, not the current deployment verdict. The 0.02.003 static release is sourced from b6180eb92186d63bfb7fce724728af041276300a; its 14,517 declared files, live entry-asset hashes and direct routes are recorded in [the source-bound release receipt](../../../validation/0.02.003/release.json). Main CI [36271829388](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36271829388) and static build [36271829401](https://github.com/fsantibanezleal/CAOS_Neuraxis/actions/runs/36271829401) passed for that commit. Earlier billing failures remain historical observations.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/package_static.py | Passed: canonical matrix and exact file digests verified before packaging. |
| R-002 | tests/test_static_deploy.py | Implemented and locally verified; see evidence above. |
| R-003 | scripts/check_ci_budget.py | Passed: trunk-only, no fitting or product test suites, bounded jobs. |
