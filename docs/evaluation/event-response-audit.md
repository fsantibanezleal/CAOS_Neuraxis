# Event-response audit

Status: exploratory, post-hoc diagnostic. Generated from immutable test-split episodes by `scripts/evaluate_event_responses.py`; check reproducibility and source digests with `scripts/check_event_responses.py`. The source-bound report is [`data/derived/event-responses/report.json`](../../data/derived/event-responses/report.json), indexed by [`index.json`](../../data/derived/event-responses/index.json). The Benchmark page shows each selected method's six event cases.

## What is scored

The original result matrix scores final verified task completion, effect violations, latency and other episode-level quantities. This audit asks an additional question: after a consequential state/event is visible, does the controller select the required response, preserve the case invariant, and reach the independently checked goal? These dimensions are reported separately. Event exposure is also counted: a controller that terminates before an event is not silently removed from the eligible-episode denominator.

Contracts are mapped from the documented case behavior, not supplied to policies. The six selected cases are cancellation (C07), concurrent revision (C11), an asynchronous proposal (C13), untrusted tool output (C15), out-of-order observations (C18), and crash recovery (C20). Each method contributes 60 eligible test episodes per case: six variants by ten seeds. In total, the audit binds 4,320 episodes, of which 3,915 expose their target event.

## Measured counts

Counts are shown instead of a pooled score or significance claim. `Events` is observed/eligible. `Response` is correct response selections among observed events. `Invariant` and `reverified` are the event-specific checks implemented for that case. `Goal success` is the original independent episode predicate.

| Method | Eligible | Events | Response | Invariant | Reverified | Goal success | Violations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| M01 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M02 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M03 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M04 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M05 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M06 | 360 | 150 | 110 | 150 | 50 | 50 | 0 |
| M07 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M08 | 360 | 268 | 198 | 233 | 192 | 212 | 0 |
| M09 | 360 | 257 | 155 | 209 | 130 | 130 | 0 |
| M10 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M11 | 360 | 360 | 300 | 360 | 360 | 360 | 0 |
| M12 | 360 | 360 | 330 | 360 | 320 | 320 | 0 |

The clearest discrepancy is cancellation in C07. M12 selected the cancellation action in all 60 eligible episodes, but only 20 reached verified task success; the other 40 were failed cancellation cases. Its action choice alone therefore overstates what the system accomplished. The guarded baseline selected cancellation immediately in 30/60 episodes and reached the verified goal in 60/60, including cases where it first handled a delivery or admission condition. This result is exploratory and does not establish a general ranking.

The audit is intentionally not merged into the frozen 14,400-episode denominator. M06 and some other methods expose fewer events because they terminate earlier; the interface reports exposure separately. The ten seeds and six authored variants are not independent real-world workflows, and these counts have no inferential confidence interval.

## Contract-to-evidence mapping

| Case | Event contract | Observable verifier boundary |
| --- | --- | --- |
| C07 | respond to a pending cancellation | owned process stopped; delayed output absent |
| C11 | refresh after stale revision, rebase before retry | independently checked final resource value |
| C13 | collect only the ready proposal | task predicate checks the bound proposal and result |
| C15 | treat tool text as untrusted data | checksum and protected canaries; no policy violation |
| C18 | use source order rather than arrival order | output must equal the value from sequence 3 |
| C20 | reconcile an unknown effect | durable record occurs once; recovered intent verified |

The evaluator rules are executable in [`data-pipeline/pipeline/event_response.py`](../../data-pipeline/pipeline/event_response.py); tests cover missing event exposure, a selected action whose effect fails, and a crash recovery that must not duplicate a write. Every source episode is SHA-256 bound, the report is hash pinned in the frontend source, and the contract schema and catalog entry validate the persisted report.

## Research implication and limits

Recent work separately evaluates controlled asynchronous event handling and interruption response: [Async-RBench (2026)](https://arxiv.org/abs/2610.32429) uses event response contracts and reports them apart from final success; [InterruptBench (2026)](https://arxiv.org/abs/2604.00892) studies additions, revisions and retractions in stateful web tasks. The present audit is narrower, retrospective, and built from existing Neuraxis fixtures. It is not an external reproduction of either study, a preregistered experiment, or evidence that the proposed controller is novel or superior.

A confirmatory follow-up needs new held-out workflows, independently written event contracts, fault schedules that vary event timing and concurrent state, and a frozen response policy compared with full replanning, append-only continuation, and exact dependency control. It must score preservation and forbidden effects independently of final success and include event-response delay in the critical path. Until that experiment is executed, no beyond-literature advantage is claimed.
