# evidence-workbench requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

| ID | Requirement | Gate |
|---|---|---|
| EW-001 | WHEN an index is exported, THE exporter SHALL preserve complete canonical coverage. | `scripts/check_artifacts.py` |
| EW-002 | WHEN a trace is loaded, THE viewer SHALL validate raw-byte SHA256 and reference identity. | `frontend/src/test/artifact-integrity.test.ts` |
| EW-003 | WHEN scientific content is rendered, THE workbench SHALL provide functional navigation and equations. | `frontend/scripts/verify-content.mjs` |
| EW-004 | WHEN canonical results are selected, THE workbench SHALL render all 240 method-family pairs and the measured findings. | `frontend/scripts/verify-evidence.mjs` |
| EW-005 | WHILE using narrow screens, THE controls SHALL remain visible and keyboard reachable in both languages and themes. | `frontend/scripts/verify-mobile.mjs` |
| EW-006 | WHEN reading documentation or benchmark results, THE document SHALL scroll vertically with wheel, touch, and keyboard input, including after navigation from the workbench. | `frontend/scripts/verify-layout.mjs` |
| EW-007 | WHEN presenting reading pages, THE app SHALL use the shared shell typography and content measures without custom section width caps or clipped prose. | `frontend/scripts/verify-layout.mjs` |
| EW-008 | WHEN changing a scientific section, THE selected content and its final references SHALL remain reachable at desktop and phone sizes in both languages and themes. | `frontend/scripts/verify-content.mjs` |
| EW-009 | WHEN artifacts lack complete coverage, THE validator SHALL reject them. | `tests/test_application.py::test_artifact_validator_rejects_empty_or_incomplete_matrix` |
| EW-010 | WHILE viewing supported routes, THE interface SHALL fit the viewport in both languages and themes. | `frontend/scripts/verify-browser.mjs` |

## User-directed layout correction

The user's September 23 review rejects global fixed containment on reading pages and
unreachable vertical content. Fixed containment is scoped to the desktop workbench;
documentation, results, and compact screens use normal document flow. This explicit
instruction takes precedence over applying ADR-0071's document-height equality to
every route. Shared shell primitives, typography, navigation, and content remain in use.
Earlier document-height checks did not demonstrate reachability and are superseded
by actual wheel, keyboard, touch, navigation, and final-reference access checks.
