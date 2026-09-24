# Operational workbench requirements

2026-09-24. Authorized by the user's explicit instruction to research and reimplement
all necessary work. Replaces the rejected simulation-first product interaction.

```text
R-001 WHEN the App opens, THE interface SHALL identify a useful task, its concrete inputs and expected outputs before execution.
Gate: frontend/verify-operations.mjs
R-002 WHEN a task runs, THE application SHALL execute registered tools through the installed reflexmesh native runtime and verify file-derived outputs.
Gate: tests/test_operations.py::test_native_operation_outputs
R-003 WHEN user-selected text files are supplied, THE application SHALL analyze those bytes and export findings without executing uploaded source.
Gate: tests/test_operations.py::test_uploaded_source_is_data
R-004 IF a path, payload, session or capacity is invalid, THEN THE operation service SHALL reject it before executing effects.
Gate: tests/test_operations_api.py
R-005 WHEN execution is cancelled or fails, THE application SHALL preserve observed effects and report an honest terminal state.
Gate: tests/test_operations.py::test_cancel_preserves_evidence
R-006 WHEN a graph node or output file is selected, THE interface SHALL show its measured dependencies, status and content evidence.
Gate: frontend/verify-operations.mjs
R-007 WHEN compound experiments are exported, THE pipeline SHALL record actual inputs, fault conditions, outcomes and hashes separately from frozen policy benchmarks.
Gate: scripts/check_operations.py
R-008 WHEN canonical research is inspected, THE interface SHALL compare hash-verified matched runs and expose failures without executing replayed actions.
Gate: frontend/verify-investigations.mjs
R-009 WHILE using any operation view, THE interface SHALL preserve keyboard access, vertical reachability, EN/ES and light/dark rendering.
Gate: frontend/verify-operations.mjs
R-010 WHEN hosted operations are deployed, THE service SHALL constrain capabilities, concurrent execution, memory, disk retention and hostname routing.
Gate: tests/test_operations_api.py
R-011 WHEN the five scientific pages are rendered, THE interface SHALL use shared tabs, inline citations and full bibliographic entries with readable equations and reachable final sources in EN/ES and both themes.
Gate: frontend/verify-content.mjs
R-012 WHILE navigating documentation and the workbench, THE interface SHALL preserve ordinary vertical scrolling and a centered shell width across desktop and phone viewports.
Gate: frontend/verify-layout.mjs
R-013 WHEN a local workspace run is active across route navigation, THE App SHALL restore the selected workbench mode and retain cancellation authority.
Gate: frontend/verify-workspace.mjs
R-014 IF a service deployment bundle contains undeclared files or invalid identity, THEN THE installer SHALL reject it before activation.
Gate: tests/test_operations_deploy.py
R-015 WHEN a local combined app starts, THE service SHALL route the bounded task API separately from authenticated workspace authority.
Gate: tests/test_application.py::test_local_composition_routes_both_authority_domains
```
