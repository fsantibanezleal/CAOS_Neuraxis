# workspace-operation convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

The final installed wheel passed native auth/cancellation, actual workspace writes, stale-preview rejection, failed evidence rejection, reviewed recovery and verified readmission on September 23. A clean published PyPI installation separately executed and verified a real file workflow.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | tests/test_application.py | Implemented and locally verified; see evidence above. |
| R-002 | frontend/verify-workspace.mjs | Passed: actual write, 409 stale preview, cancellation and receipts. |
| R-003 | frontend/verify-recovery.mjs | Passed: 422 invalid evidence, reviewed reconciliation and readmission. |
