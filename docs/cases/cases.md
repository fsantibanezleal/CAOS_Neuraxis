# Case contracts

This directory contains the twenty executable workload contracts used by CAOS Neuraxis. Each page links the actual implementation, distinguishes initial fixture state from observed evidence, specifies the registered actions and independent completion predicate, and gives a complete Python reproduction plus its local API request.

Read [the workload guide](../cases.md) for split isolation, outcome interpretation, authentication and release-evidence rules. A case family is not a claim of production equivalence. Its six variants introduce actual controlled delivery, duplicate, resource-conflict, dependency and input-boundary mechanisms around the family workload. Failures remain part of the measured evidence.

| Number | Case page |
| --- | --- |
| C01 | [Workspace document routing](01-workspace-document-routing.md) |
| C02 | [Incremental file indexing](02-incremental-file-indexing.md) |
| C03 | [Data validation and quarantine](03-data-validation-and-quarantine.md) |
| C04 | [Build and test recovery](04-build-and-test-recovery.md) |
| C05 | [Transient HTTP retry](05-transient-http-retry.md) |
| C06 | [Ambiguous write reconciliation](06-ambiguous-write-reconciliation.md) |
| C07 | [Long job cancellation](07-long-job-cancellation.md) |
| C08 | [Process restart](08-process-restart.md) |
| C09 | [Bounded storage pressure](09-bounded-storage-pressure.md) |
| C10 | [Dependency ordered workflow](10-dependency-ordered-workflow.md) |
| C11 | [Concurrent file revision](11-concurrent-file-revision.md) |
| C12 | [Agent job collection](12-agent-job-collection.md) |
| C13 | [Planner deadline pressure](13-planner-deadline-pressure.md) |
| C14 | [Unsupported planner argument](14-unsupported-planner-argument.md) |
| C15 | [Untrusted tool text](15-untrusted-tool-text.md) |
| C16 | [Missing evidence](16-missing-evidence.md) |
| C17 | [Novel registered capability](17-novel-registered-capability.md) |
| C18 | [Observation ordering](18-observation-ordering.md) |
| C19 | [Reliability drift](19-reliability-drift.md) |
| C20 | [Crash recovery](20-crash-recovery.md) |

Start with C01 for a single real file transition, C06 for ambiguous HTTP writes, C11 for a real change between candidate binding and native admission, and C20 for an actual process crash after a durable effect. C15 exposes malicious tool text to the next policy observation while trusted registration continues to define authority.

The corrected handlers are pinned to package revision `81af4cfb5d356c8ae19ae0d06e36131a01843c6f`. Training and evaluation additionally record their exact Python, Rust, native binary, dependency, data and checkpoint hashes. Results from the earlier fixture design are superseded and must not be mixed into corrected-case outcomes.

The package's ToolSandbox and tau2 adapters remain separate upstream transfer evidence with distinct task selections, licenses and evaluators. Owned case completion cannot substitute for those external results, and small eligible upstream subsets are not official full-benchmark scores.

