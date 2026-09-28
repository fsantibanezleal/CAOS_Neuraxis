# Reliability design and review

Reviewed before implementation, 2026-09-24, against research dossier 07 and the
existing operational-workbench contract. Scope is correction under the user's
full improvement authorization. Shared shell, scientific tabs and bibliography
remain the governing interface components.

CSV parsing stores record number, physical start/end lines, named values and an
explicit extra-values array. Shape and duplicate admission precede relation
validation; reverse references propagate rejection in bounded linear work.
Verification separately checks exact row partition, rejected values and manifest.
Warnings require attention, and incomplete execution overrides report disposition.

The service exposes a compact owned run list, checks ownership and membership in
the same lock as mutations, and reports expiry times. The UI treats draft inputs
and selected run evidence distinctly, restores run inputs from that run, and
recovers invalid sessions without replaying a POST. Request timeouts preserve
uncertain execution until history refresh determines the server state.

Each immutable release receives its own venv and a saved dependency inventory.
Health checks compare source commit, not just route shape. Rollback restores the
old code and its old interpreter together. The 0.02.006 service installs PyPI 0.1.1.

Risks: relation inference is a naming convention, not a supplied database schema;
unknown/ambiguous relationships must remain explicit. Session loss is expected
on reload or service restart and cannot imply cancellation or successful cleanup.
Do not synthesize timing or relabel prior studies after analyzer changes.

Browser review found that every method tab refetched the full frozen index and
silently omitted measurements while loading or after failure. Reuse one promise
per page session, clear failed requests for retry, and make evidence availability
explicit. Content QA must wait for measured rows before testing final-reference
focus, otherwise late inserted data moves its target after the focus assertion.
