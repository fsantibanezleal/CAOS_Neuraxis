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
R-005 WHILE using narrow screens, THE controls SHALL remain visible and keyboard reachable in both languages and themes.
Gate: frontend/verify-mobile.mjs
R-006 WHEN reading documentation or benchmark results, THE document SHALL scroll vertically with wheel, touch, and keyboard input, including after navigation from the workbench.
Gate: frontend/verify-layout.mjs
R-007 WHEN presenting reading pages, THE app SHALL use the shared shell typography and content measures without custom section width caps or clipped prose.
Gate: frontend/verify-layout.mjs
R-008 WHEN changing a scientific section, THE selected content and its final references SHALL remain reachable at desktop and phone sizes in both languages and themes.
Gate: frontend/verify-content.mjs
```

## User-directed layout correction

The user's September 23 review rejects global fixed containment on reading pages and
unreachable vertical content. Fixed containment is scoped to the desktop workbench;
documentation, results, and compact screens use normal document flow. This explicit
instruction takes precedence over applying ADR-0071's document-height equality to
every route. Shared shell primitives, typography, navigation, and content remain in use.
Earlier document-height checks did not demonstrate reachability and are superseded
by actual wheel, keyboard, touch, navigation, and final-reference access checks.
