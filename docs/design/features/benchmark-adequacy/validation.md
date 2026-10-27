# Benchmark adequacy validation

Candidate: 0.02.012. Evidence gates are source-bound and preserve the separate core, transfer and routing datasets.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Core matrix hashes, identity, lineage, complete cells and denominators remain valid | Change an indexed digest, omit a seed or alter lineage | `scripts/check_artifacts.py` | 14,400 episodes, 1,440 method/case/variant cells, twelve methods, twenty cases and six variants |
| Transfer results remain separate and hash-audited | Alter a transfer trace or merge a core path into its index | `scripts/check_semantic_transfer.py` | 1,536 indexed episodes and separate transfer lineage |
| Routing results bind to matched execution traces | Change a predicted arm or source trace digest | `scripts/check_semantic_routing.py` | Held-out routing report and recomputed comparators |

The checked results do not support a learned-controller superiority claim. New tasks must create independent opportunities for delegation to improve utility before another superiority test is meaningful.
