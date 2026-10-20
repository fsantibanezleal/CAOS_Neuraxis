# Reliability requirements

| ID | Requirement | Gate |
|---|---|---|
| RA-001 | WHEN uploaded CSV contains malformed rows or multiline fields, THE analyzer SHALL export explicit rejected values and exact source lines without aborting valid checks. | `tests/test_operations_reliability.py` |
| RA-002 | WHEN accepted rows contain inferred foreign keys, THE analyzer SHALL resolve namespaces without collisions and propagate rejected references to a fixed point. | `tests/test_operations_reliability.py` |
| RA-003 | WHEN source/configuration or workflows are checked, THE analyzer SHALL reject non-finite values and isolate independent workflow namespaces. | `tests/test_operations_reliability.py` |
| RA-004 | WHEN a user creates multiple runs, THE interface SHALL restore and delete every retained owned run through a bounded history list. | `frontend/scripts/verify-operation-recovery.mjs`, `frontend/src/adversarial/reliability-audit.test.ts::adversarial: the history list restores every owned run and only those` |
| RA-005 | IF authority expires or a run disappears, THEN THE interface SHALL stop polling, explain recovery, retain selected inputs and permit explicit fresh execution. | `frontend/scripts/verify-operation-recovery.mjs`, `frontend/src/adversarial/reliability-audit.test.ts::adversarial: expired authority stops polling and never replays a submission` |
| RA-006 | IF execution is incomplete or cancelled, THEN THE interface SHALL never label the input as passed. | `frontend/src/lib/operations.test.ts` |
| RA-007 | WHEN concurrent list, export, delete and retention requests occur, THE service SHALL preserve ownership and avoid stale mutations. | `tests/test_operations_api.py` |
| RA-008 | WHEN a backend version is deployed, THE installer SHALL use a separate dependency environment and identify the exact active commit during health validation. | `tests/test_operations_deploy.py` |
| RA-009 | WHEN operation analysis changes, THE scientific corpus SHALL be regenerated and retain exact source and artifact provenance separately from policy benchmarks. | `scripts/check_operations.py` |
| RA-010 | WHEN scientific tabs share the frozen index, THE interface SHALL reuse the same loaded index, retry after network failure and visibly report evidence loading or failure. | `frontend/src/api/artifacts.test.ts` |
| RA-011 | IF a finding references a file absent from the input bundle, THEN THE inspector SHALL retain that path and explicitly show absence instead of another file's bytes. | `frontend/scripts/verify-missing-file.mjs`, `frontend/src/adversarial/reliability-audit.test.ts::adversarial: a finding on an absent file shows absence` |
