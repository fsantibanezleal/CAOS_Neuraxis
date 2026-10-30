# workspace-operation requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

| ID | Requirement | Gate |
|---|---|---|
| WO-001 | WHEN actual local execution is requested, THE app SHALL enforce session authentication. | `tests/test_application.py` |
| WO-002 | WHEN a user submits a workflow, THE UI SHALL show preview, execution and verified effects. | `frontend/scripts/gate.mjs` |
| WO-003 | WHEN reconciliation is requested, THE UI SHALL reject incorrect evidence and require explicit review. | `frontend/scripts/gate.mjs` |
