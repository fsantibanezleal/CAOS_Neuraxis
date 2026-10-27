# 05. Journal and recovery

The broker durably records an accepted intent before starting an effect. Its journal distinguishes accepted, started, completed, failed, cancelled and unknown outcomes. Process death between an external effect and receipt persistence is an unknown result, not proof of rollback or non-execution.

Resource leases and intent identifiers prevent a second cooperating writer from silently duplicating an unresolved effect. Recovery reads the current journal record, verifies that the record is still the unresolved one, collects current file or process evidence, and requires an explicit operator disposition before reopening authority. A receipt names changed resources and postcondition evidence; a terminal success requires an independent verifier.

The evidence workbench displays exact effect status, cancellation, receipts, exports and cleanup state. Tests exercise the actual temporary files, child processes and local HTTP endpoint. Browser replay is inspection-only and never dispatches recorded effects.
