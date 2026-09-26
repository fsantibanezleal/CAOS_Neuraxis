# Validation tasks

- [x] Reproduce and correct analyzer defects; 55 local application tests passed.
- [x] Owned history, race-safe lifecycle, expiry and timeout recovery.
- [x] EN/ES light/dark desktop and phone history/recovery browser verification: 8 combinations, with current-run inputs and cached evidence checked.
- [x] Dependency-isolated deployment and exact-commit health validation: 12 Linux installer tests passed, including rollback.
- [x] Recompute 36 native operation experiments and validate source provenance.
- [x] Engine 297 tests, frontend 30 tests, formatting/build, 296 scientific tabs and 120 layout/gesture combinations passed.
- [x] Scoped PRs #19/#20, 0.02.002 static and native deployment at `fa20c09`, live task/export/isolation/deletion checks, eight live recovery views including a delayed history response, and source-bound release records under `docs/validation/0.02.002`.

Earlier 0.02.001 hosted runs were blocked by account billing. The 0.02.002
develop CI 36268651421, main CI 36268735437 and static build 36268735379
completed successfully. User design acceptance remains separate.
