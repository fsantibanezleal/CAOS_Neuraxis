# evidence-workbench requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

```text
R-001 WHEN an index is exported, THE exporter SHALL preserve complete canonical coverage.
Gate: scripts/check_artifacts.py
R-002 WHEN a trace is loaded, THE viewer SHALL validate raw-byte SHA-256 and reference identity.
Gate: frontend/src/test/artifact-integrity.test.ts
R-003 WHEN scientific content is rendered, THE workbench SHALL provide functional navigation and equations.
Gate: frontend/verify-content.mjs
R-004 WHEN canonical results are selected, THE workbench SHALL render all 240 method-family pairs and the measured findings.
Gate: frontend/verify-evidence.mjs
```
