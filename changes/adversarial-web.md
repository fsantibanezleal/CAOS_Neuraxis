- Planted-defect tests for the frontend gates of the design area (ADR-0075, unit U10a-W): 32 vitest tests under
  `frontend/src/adversarial/` (`base-0-08`, `benchmark-adequacy`, `evidence-workbench`, `operational-workbench`,
  `reliability-audit`, `workspace-operation`), each named as its row in `docs/design/features/*/validation.md` names it. Each
  plants the defect its row states in an in-memory copy (a route table, an SVG, a section, a stylesheet, a recorded run, a
  tampered trace, a session) and shows the check reports it, after asserting the check passes on the clean copy. The shared
  helpers are `support.ts` (reads the tree, parses the product CSS, renders a component on the server in a chosen language),
  `css-checks.ts` (the static layout checks for the browser-measured rows) and `content-checks.ts`. No browser is started.
