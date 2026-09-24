# Reliability requirements

```text
R-001 WHEN uploaded CSV contains malformed rows or multiline fields, THE analyzer SHALL export explicit rejected values and exact source lines without aborting valid checks.
Gate: tests/test_operations_reliability.py
R-002 WHEN accepted rows contain inferred foreign keys, THE analyzer SHALL resolve namespaces without collisions and propagate rejected references to a fixed point.
Gate: tests/test_operations_reliability.py
R-003 WHEN source/configuration or workflows are checked, THE analyzer SHALL reject non-finite values and isolate independent workflow namespaces.
Gate: tests/test_operations_reliability.py
R-004 WHEN a user creates multiple runs, THE interface SHALL restore and delete every retained owned run through a bounded history list.
Gate: frontend/verify-operation-recovery.mjs
R-005 IF authority expires or a run disappears, THEN THE interface SHALL stop polling, explain recovery, retain selected inputs and permit explicit fresh execution.
Gate: frontend/verify-operation-recovery.mjs
R-006 IF execution is incomplete or cancelled, THEN THE interface SHALL never label the input as passed.
Gate: frontend/src/lib/operations.test.ts
R-007 WHEN concurrent list, export, delete and retention requests occur, THE service SHALL preserve ownership and avoid stale mutations.
Gate: tests/test_operations_api.py
R-008 WHEN a backend version is deployed, THE installer SHALL use a separate dependency environment and identify the exact active commit during health validation.
Gate: tests/test_operations_deploy.py
R-009 WHEN operation analysis changes, THE scientific corpus SHALL be regenerated and retain exact source and artifact provenance separately from policy benchmarks.
Gate: scripts/check_operations.py
R-010 WHEN scientific tabs share the frozen index, THE interface SHALL reuse the same loaded index, retry after network failure and visibly report evidence loading or failure.
Gate: frontend/src/api/artifacts.test.ts
R-011 IF a finding references a file absent from the input bundle, THEN THE inspector SHALL retain that path and explicitly show absence instead of another file's bytes.
Gate: frontend/verify-missing-file.mjs
```
