# evidence-workbench convergence

1. Bind input and authority contracts (R-001, R-002, R-003).
2. Execute the named contract gates before release.
3. Check persisted artifacts and user-visible behavior, then record external release gates separately.

Full 14,400-episode export passed. Twenty-one frontend tests and a production build passed September 23. Canonical hydration and final browser checks remain release gates.

| Requirement | Gate | Current verdict |
| --- | --- | --- |
| R-001 | scripts/check_artifacts.py | Implemented and locally verified; see evidence above. |
| R-002 | frontend/src/test/artifact-integrity.test.ts | Implemented and locally verified; see evidence above. |
| R-003 | frontend/verify-content.mjs | Prior browser pass; final release rerun pending. |
