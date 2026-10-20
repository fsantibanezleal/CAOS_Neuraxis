# Operational workbench requirements

2026-09-24. Authorized by the user's explicit instruction to research and reimplement
all necessary work. Replaces the rejected simulation-first product interaction.

| ID | Requirement | Gate |
|---|---|---|
| OW-001 | WHEN the App opens, THE interface SHALL identify a useful task, its concrete inputs and expected outputs before execution. | `frontend/scripts/verify-operations.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a first screen without task, input or expected output is rejected` |
| OW-002 | WHEN a task runs, THE application SHALL execute registered tools through the installed reflexmesh native runtime and verify file-derived outputs. | `tests/test_operations.py::test_native_operation_outputs` |
| OW-003 | WHEN user-selected text files are supplied, THE application SHALL analyze those bytes and export findings without executing uploaded source. | `tests/test_operations.py::test_uploaded_source_is_data` |
| OW-004 | IF a path, payload, session or capacity is invalid, THEN THE operation service SHALL reject it before executing effects. | `tests/test_operations_api.py` |
| OW-005 | WHEN execution is cancelled or fails, THE application SHALL preserve observed effects and report an honest terminal state. | `tests/test_operations.py::test_cancel_preserves_evidence` |
| OW-006 | WHEN a graph node or output file is selected, THE interface SHALL show its measured dependencies, status and content evidence. | `frontend/scripts/verify-operations.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a node without a receipt shows nothing invented` |
| OW-007 | WHEN compound experiments are exported, THE pipeline SHALL record actual inputs, fault conditions, outcomes and hashes separately from frozen policy benchmarks. | `scripts/check_operations.py` |
| OW-008 | WHEN canonical research is inspected, THE interface SHALL compare hash-verified matched runs and expose failures without executing replayed actions. | `frontend/scripts/verify-investigations.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a matched run that fails its digest is not shown` |
| OW-009 | WHILE using any operation view, THE interface SHALL preserve keyboard access, vertical reachability, EN/ES and light/dark rendering. | `frontend/scripts/verify-operations.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a control without an accessible name in both languages is reported` |
| OW-010 | WHEN hosted operations are deployed, THE service SHALL constrain capabilities, concurrent execution, memory, disk retention and hostname routing. | `tests/test_operations_api.py` |
| OW-011 | WHEN the five scientific pages are rendered, THE interface SHALL use shared tabs, inline citations and full bibliographic entries with readable equations and reachable final sources in EN/ES and both themes. | `frontend/scripts/verify-content.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a missing full entry or an unreadable equation fails the page check` |
| OW-012 | WHILE navigating documentation and the workbench, THE interface SHALL preserve ordinary vertical scrolling and a centered shell width across desktop and phone viewports. | `frontend/scripts/verify-layout.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a page that traps vertical scrolling is reported` |
| OW-013 | WHEN a local workspace run is active across route navigation, THE App SHALL restore the selected workbench mode and retain cancellation authority. | `frontend/scripts/verify-workspace.mjs`, `frontend/src/adversarial/operational-workbench.test.ts::adversarial: a route change that drops the mode or the cancel handle is caught` |
| OW-014 | IF a service deployment bundle contains undeclared files or invalid identity, THEN THE installer SHALL reject it before activation. | `tests/test_operations_deploy.py` |
| OW-015 | WHEN a local combined app starts, THE service SHALL route the bounded task API separately from authenticated workspace authority. | `tests/test_application.py::test_local_composition_routes_both_authority_domains` |
| OW-016 | WHEN a product dependency is declared, THE product SHALL consume reflexmesh without declaring its own installable engine. | `tests/test_application.py::test_product_has_no_installable_engine` |
