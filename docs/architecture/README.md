# System architecture

Neuraxis is the product layer for the separate `reflexmesh` engine. Read the overview first, then follow the bounded path from an observation through policy selection, effect admission, journaling, evaluation and deployment.

| Document | Responsibility |
|---|---|
| [01 System overview](01-system-overview.md) | Repository and runtime boundaries |
| [02 Control loop](02-control-loop.md) | Fast decision path and deliberation handoff |
| [03 Policy ladder](03-policy-ladder.md) | Methods, training and evidence ownership |
| [04 Effect authority](04-effect-authority.md) | Capability admission and execution boundaries |
| [05 Journal and recovery](05-journal-and-recovery.md) | Uncertain effects, receipts and reconciliation |
| [06 Data contracts](06-data-contracts.md) | Catalog, artifact hashes and readiness |
| [07 Evaluation](07-evaluation.md) | Cases, denominators and scientific limits |
| [08 Application and deployment](08-application-and-deployment.md) | UI, local API and release layout |
