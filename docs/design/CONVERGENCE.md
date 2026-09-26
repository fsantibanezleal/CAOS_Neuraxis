# Release convergence, updated September 26, 2026

| Product SDD requirement | Named gate result |
| --- | --- |
| R-001 | Application startup rejects missing authentication; local tests passed. |
| R-002 | Incomplete matrices and mismatched lineage are rejected; full 14,400-episode export passed. |
| R-003 | Product contains no installable engine; reflexmesh 0.1.0 published to PyPI and clean installation verified. |
| R-004 | Artifact-integrity tests passed; 240 method-family selections replayed with matching canonical run IDs. |
| R-005 | 72 desktop and 12 phone control checks passed. The user subsequently rejected reading-page containment; 120 document-flow, gesture and navigation checks now cover its correction. |
| R-006 | 200 local scientific section checks verify final-reference focus, viewport presence and hit testing. The old 100 DOM-count checks were insufficient to prove content access. |
| R-007 | Actual workspace file write, SHA verification, stale-preview rejection and cancellation passed. |
| R-008 | Incorrect recovery evidence returned 422; reviewed reconciliation and subsequent execution passed, including 360px viewport. |
| R-009 | Archive traversal/digest rejection passed; positive immutable release installation ran on the Linux target. |
| R-010 | Canonical packaging and 14,479-file install passed; external live manifest matched promoted main. |
| R-011 | CI budget guard passed. Earlier account-billing failures are historical; 0.02.002 develop CI 36268651421, main CI 36268735437 and static build 36268735379 completed successfully. |

The current release manifest at https://neuraxis.ml.fasl-work.com/release.json identifies the exact deployed commit, version, canonical coverage and every published file digest. Installation retains prior releases and switches current atomically. TLS hostname verification succeeded with TLS 1.3 and a certificate expiring December 23, 2026. Certbot renewal is enabled and the deployment hook reloads nginx after a successful renewal.

Local validation includes seven product tests, 21 frontend tests, the complete experiment integrity audit, native/workspace/recovery browser flows and desktop/mobile content checks. One POSIX-only product test is skipped on Windows and exercised separately on Linux. No hosted CI pass is inferred from local results, and no credentials are embedded in these reports.

The corrected research report records 19,488 episodes and the negative M12/ablation/learned-allocation findings. Implementation completion is distinct from evidence of a new algorithmic advantage or AGI.

## 0.02.002 operation-history correction

The deployed static manifest and native service config both identify app commit
`fa20c09486ee37e44788e03b33ce6dd2a0e5dcba` and version 0.02.002. A live
browser check passed eight language, theme and width combinations. One case
held an older successful history response until after an expired-session 401;
the old response did not restore stale run entries. HTTPS task verification
checked actual outputs, exports, session isolation and deletion. Direct routes
and fetched entry-asset hashes match the release manifest. The frozen research
matrix, 36 operation runs, native API and reflexmesh 0.1.0 are unchanged. See
[release evidence](../validation/0.02.002/release.json). This does not establish
user design acceptance or learned superiority.
