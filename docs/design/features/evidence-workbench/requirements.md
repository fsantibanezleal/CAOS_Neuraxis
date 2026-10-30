# evidence-workbench requirements

Date: 2026-09-23. Migration of the authorized existing implementation.

| ID | Requirement | Gate |
|---|---|---|
| EW-001 | WHEN an index is exported, THE exporter SHALL preserve complete canonical coverage. | `scripts/check_artifacts.py` |
| EW-002 | WHEN a trace is loaded, THE viewer SHALL validate raw-byte digest and reference identity. | `frontend/src/test/artifact-integrity.test.ts` |
| EW-003 | WHEN scientific content is rendered, THE workbench SHALL provide functional navigation and equations. | `frontend/scripts/gate.mjs` |
| EW-004 | WHEN canonical results are selected, THE workbench SHALL render all 240 method-family pairs and the measured findings. | `frontend/scripts/gate.mjs` |
| EW-005 | WHILE using narrow screens, THE controls SHALL remain visible and keyboard reachable in both languages and themes. | `frontend/scripts/gate.mjs` |
| EW-006 | WHEN reading documentation or benchmark results, THE document SHALL scroll vertically with wheel, touch, and keyboard input, including after navigation from the workbench. | `frontend/scripts/gate.mjs` |
| EW-007 | WHEN presenting reading pages, THE app SHALL use the shared shell typography and content measures without custom section width caps or clipped prose. | `frontend/scripts/gate.mjs` |
| EW-008 | WHEN changing a scientific section, THE selected content and its final references SHALL remain reachable at desktop and phone sizes in both languages and themes. | `frontend/scripts/gate.mjs` |
