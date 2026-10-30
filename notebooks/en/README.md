# Notebooks, English

This index follows the Neuraxis method ladder and the persisted research. Each topic moves from fundamentals (level 1), to package behavior on a real trace (level 2), to sourced comparison with prior work and matched Neuraxis evidence (level 3). The mirror is [`../es/README.md`](../es/README.md); execution is explained in [`../README.md`](../README.md).

## Topics

| Topic | Prerequisites | Level 3 |
|---|---|---|
| [01-fast-event-control](01-fast-event-control/) | none; entry topic | [prior-methods comparison](01-fast-event-control/03-prior-methods-comparison.ipynb) |
| [02-learned-action-policies](02-learned-action-policies/) | topic 01 | [prior-methods comparison](02-learned-action-policies/03-prior-methods-comparison.ipynb) |
| [03-sequential-control](03-sequential-control/) | topic 02 | [prior-methods comparison](03-sequential-control/03-prior-methods-comparison.ipynb) |
| [04-deliberation-allocation](04-deliberation-allocation/) | topic 03 | [prior-methods comparison](04-deliberation-allocation/03-prior-methods-comparison.ipynb) · [M12 method evaluation](04-deliberation-allocation/04-resource-versioned-metacontrol.ipynb) |
| [05-evaluation-and-transfer](05-evaluation-and-transfer/) | topics 01–04 | [prior-methods comparison](05-evaluation-and-transfer/03-prior-methods-comparison.ipynb) |
| [06-ablation-and-export-parity](06-ablation-and-export-parity/) | topic 05 | [prior-methods comparison](06-ablation-and-export-parity/03-prior-methods-comparison.ipynb) |

## Notebooks

| Notebook | Level | What it teaches |
|---|---:|---|
| [01-fast-event-control/01-the-problem-and-the-data.ipynb](01-fast-event-control/01-the-problem-and-the-data.ipynb) | 1 | hash-verified M01/M02 C01 decisions, capability-filtered candidates, and independent outcomes |
| [01-fast-event-control/02-the-method-in-practice.ipynb](01-fast-event-control/02-the-method-in-practice.ipynb) | 2 | fresh M01/M02 package executions on the matched C01 case and comparison with their frozen runs |
| [01-fast-event-control/03-prior-methods-comparison.ipynb](01-fast-event-control/03-prior-methods-comparison.ipynb) | 3 | Jev, arbitration and asynchronous fast/slow prior art compared with matched Neuraxis outcomes |
| [02-learned-action-policies/01-the-problem-and-the-data.ipynb](02-learned-action-policies/01-the-problem-and-the-data.ipynb) | 1 | hash-verified M03/M04 C05 decisions, candidate scores and independently verified outcomes |
| [02-learned-action-policies/02-the-method-in-practice.ipynb](02-learned-action-policies/02-the-method-in-practice.ipynb) | 2 | fresh M03/M04 checkpoint-backed package executions on matched C05 conditions |
| [02-learned-action-policies/03-prior-methods-comparison.ipynb](02-learned-action-policies/03-prior-methods-comparison.ipynb) | 3 | matched FSM, logistic, XGBoost, GRU and bandit outcomes with published method boundaries |
| [03-sequential-control/01-the-problem-and-the-data.ipynb](03-sequential-control/01-the-problem-and-the-data.ipynb) | 1 | M05–M08 C07 cancellation traces, recurrent state, action masking and effect outcomes |
| [03-sequential-control/02-the-method-in-practice.ipynb](03-sequential-control/02-the-method-in-practice.ipynb) | 2 | fresh M05–M08 package executions on C07 and independent verification of cancellation |
| [03-sequential-control/03-prior-methods-comparison.ipynb](03-sequential-control/03-prior-methods-comparison.ipynb) | 3 | measured sequential-policy outcomes, failure clusters and limitations of the frozen task suite |
| [04-deliberation-allocation/01-the-problem-and-the-data.ipynb](04-deliberation-allocation/01-the-problem-and-the-data.ipynb) | 1 | M09–M12 C13 traces, planner work, latency and the routing-gate evidence |
| [04-deliberation-allocation/02-the-method-in-practice.ipynb](04-deliberation-allocation/02-the-method-in-practice.ipynb) | 2 | fresh M11/M12 package execution; M09/M10 remain frozen unless a local planner is configured |
| [04-deliberation-allocation/03-prior-methods-comparison.ipynb](04-deliberation-allocation/03-prior-methods-comparison.ipynb) | 3 | value of computation and learning-to-defer prior art against Neuraxis's negative gate result |
| [04-deliberation-allocation/04-resource-versioned-metacontrol.ipynb](04-deliberation-allocation/04-resource-versioned-metacontrol.ipynb) | 4 | falsifiable M12 method, matched outcomes, ablations, latency and the evidence that currently rejects a superiority claim |
| [05-evaluation-and-transfer/01-the-problem-and-the-data.ipynb](05-evaluation-and-transfer/01-the-problem-and-the-data.ipynb) | 1 | matched M01/M04/M09/M12 C01 traces plus core and semantic-transfer provenance |
| [05-evaluation-and-transfer/02-the-method-in-practice.ipynb](05-evaluation-and-transfer/02-the-method-in-practice.ipynb) | 2 | fresh deterministic and learned package runs plus independent frozen planner results |
| [05-evaluation-and-transfer/03-prior-methods-comparison.ipynb](05-evaluation-and-transfer/03-prior-methods-comparison.ipynb) | 3 | full 14,400-episode hash audit, paired core outcomes, structural and semantic transfer by method |
| [06-ablation-and-export-parity/01-the-problem-and-the-data.ipynb](06-ablation-and-export-parity/01-the-problem-and-the-data.ipynb) | 1 | matched ablation scope, native export vectors and limits of parity evidence |
| [06-ablation-and-export-parity/02-the-method-in-practice.ipynb](06-ablation-and-export-parity/02-the-method-in-practice.ipynb) | 2 | fresh M03/M04/M11/M12 package executions and comparison with frozen C07 runs |
| [06-ablation-and-export-parity/03-prior-methods-comparison.ipynb](06-ablation-and-export-parity/03-prior-methods-comparison.ipynb) | 3 | four paired M12 ablations, grouped uncertainty and native M03/M04 parity and timing scope |

## Resource-versioned outcome-aware metacontrol

M12 combines persistent state, resource revision tracking and outcome-aware computation allocation. The level 4 lesson examines its mechanisms, benchmark results, matched runs, ablations and cost. The existing evidence is negative or inconclusive: M12 does not beat the guarded baseline and no component-level advantage is established. This notebook evaluates M12; it does not claim that the method is superior.
