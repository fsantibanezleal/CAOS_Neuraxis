# Implementation and convergence

- Research and audit before code: complete; see the dated operational dossier.
- Domain operation DAG and native effect evidence: R-002, R-003, R-005.
- Bounded session service and actual exports: R-004, R-010.
- Task-first visual workbench, graph and findings: R-001, R-006, R-009.
- Canonical incident investigations: R-008.
- Executed compound experiment pipeline and artifact validation: R-007.
- Browser interaction, isolation, fault and live release checks: all requirements.

Implementation and local convergence (2026-09-24):

- R-001..009: three native tasks, supplied-file byte checks, per-node evidence,
  cancellation and 36 persisted runs implemented. Operation tests passed.
- R-008: 48 matched investigation views passed with hash-verified traces.
- R-011: 296 scientific tab views passed across five routes, two widths, two
  languages and two themes, including section citations and final references.
- R-012: 120 route/viewport checks passed, including wheel, keyboard and phone
  touch scrolling. No full-width document or fixed-height override remains.
- R-013: full workflow verification, stale preview 409, cancellation across route
  navigation, evidence mismatch 422, recovery and subsequent readmission passed.
- R-014..015: installer allowlist adversarial tests and combined local API authority
  tests passed. 36 Python tests pass; the POSIX atomic symlink test is Windows-skipped
  and passed on the Linux deployment host with all 10 installer tests. 21 frontend unit tests pass.
- R-010: service configuration and API limits implemented and tested locally;
  the same-source static and native releases are deployed at
  1fb6f7226ab8cfba88ee87fdf9031a0f48cc908f. Live HTTPS uploads, findings, verified CSV
  bytes, ZIP export, session isolation and deletion passed in eight browser
  language/theme/width combinations. First compound run peak memory was about
  42 MiB under a 512 MiB service bound. Main run 35957971063 executed no job
  steps because of the then-current billing block. All 296 scientific
  tab views and 120 navigation/scrolling combinations also passed on live HTTPS.

Machine-readable reports are under docs/validation/0.02.000. These are engineering
checks, not user design acceptance or a claim of general intelligence.

Current release 0.02.005 passed hosted develop CI, main CI and the static-build
workflow. Its static and native deployments match source
`feb31096d4a85a1fcd9b85ff5b721a36f93a2839`; see the
[0.02.005 release receipt](../../../validation/0.02.005/release.json). The
earlier billing failure is historical. User design acceptance remains separate.
