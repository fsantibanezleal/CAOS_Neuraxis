# Jev, decision models and the boundary of a software controller

Reviewed: 2026-09-20. Source identifiers resolve in `sources-jev.json`. This audit concerns the public interface and documentation, not undisclosed internals.

## 1. What the reference establishes

TypeSafe introduced Jev on 2026-09-15. It reports a non-generative, typed decision service with parallel answers and a training method named Reinforcement Learning for Calibrated Decisions (RLCD). Launch latency and efficiency comparisons are vendor measurements, not measurements made here. The launch's evaluation compares workflow outputs with frontier-model reference judgments; the launch also acknowledges baseline and workflow-selection limitations. Its schema-validity claim does not establish semantic correctness. [J01](https://typesafe.ai/blog/introducing-system-one-models-and-jev)

The documented primitives are Choice, Score and Noul. Multiple questions see the same supplied state; their answers are evaluated independently within a call. Dependency between decisions belongs in subsequent calls or program logic. This is an excellent interface pattern for bounded semantic judgments. [J02](https://docs.typesafe.ai/primitives)

The API accepts textual/JSON state and declared questions. Choice supports at most 255 options; Score accepts two through ten rubric levels. Question identifiers are routing keys and are not instructions to the model. [J03](https://docs.typesafe.ai/api)

The current model page names `jev-1.13.0`, with `jev-latest` and `jev-preview` pointing to it at inspection. It lists $0.042 per million input tokens, uncharged output, a 64k total-request budget and a 32k state-plus-longest-question budget. Input is text, not native images/audio. Per-customer fine-tuning is not offered. These are a dated documentation snapshot, not a price or availability promise. [J04](https://docs.typesafe.ai/models)

## 2. Probability, confidence and correctness are different contracts

TypeSafe explains that Choice/Score confidence is computed from the returned distribution's shape. Noul has no separate confidence field. The inspected page does not specify that this scalar is an independent epistemic uncertainty estimator. It recommends choosing thresholds for the actual use case. [J05](https://docs.typesafe.ai/confidence)

For the proposed system, keep five quantities separate:

| Quantity | Meaning | Evidence needed |
|---|---|---|
| Schema validity | The answer inhabits the allowed type/set | Exhaustive constructors, parser tests and invalid-input handling |
| Probability quality | Forecasts correspond to observed outcomes | Proper scoring rules and held-out calibration |
| Decision quality | The chosen action has acceptable utility | Actual environment outcomes and regret |
| Authorization | The executor is permitted to perform this action | Capability and policy checks outside the model |
| Trajectory reliability | The whole workflow satisfies its goal and constraints | End-to-end episode evaluation |

A distribution with maximum probability 0.99 can be confidently wrong, omit the correct option entirely, or select a permitted type whose real action is forbidden. These are different failure classes and require different controls. This is our engineering analysis, not an assertion about hidden Jev implementation.

An elementary composition counterexample illustrates the evaluation gap. If two success events each have probability 0.9, their joint success can range from 0.8 to 0.9, depending on dependence. Multiplying them to obtain 0.81 requires independence. In an adaptive workflow, later state and candidate sets depend on earlier actions; evaluate conditional predictions and complete trajectories. Good marginal calibration alone is insufficient. This calculation is original analysis using probability bounds, not a measured model result.

## 3. Documented failure modes matter more than the slogan

The Jev jaggedness page, reviewed by its authors on 2026-09-17, identifies numerical/date reasoning, indirection, irrelevant context, adversarial state, contradictory instructions and cross-question invariants as problem areas. It warns that hostile content can steer answers and that independently worded probabilities need not satisfy expected identities. It recommends exact arithmetic in code and candidate extraction before bounded selection. [J06](https://docs.typesafe.ai/model-jaggedness/jev-1.13)

Consequences for our design are explicit:

1. A learned model ranks candidate actions; it cannot grant capabilities.
2. A deterministic binder owns paths, IDs, amounts, time comparisons and validated arguments.
3. State has provenance and freshness, not merely a longer prompt.
4. Contradictory observations are retained as conflict evidence; the policy can refresh or abstain.
5. Free-form plans are proposals until their preconditions and effects have been checked.
6. Unknown outcomes do not count as success. A network timeout after a remote write requires reconciliation before retry.

## 4. What the evaluation shows, and what it does not

The vendor evaluation page averages across four workflows and measures agreement with consensus labels generated from two large models. Its method assumes the workflow harness is correct. This establishes a particular model-agreement comparison; it is not independently adjudicated environment success, a causal test of RLCD, or general software-control reliability. [J07](https://evals.typesafe.ai/)

The public LLM adapter exposes structured-output configuration, probability versus discrete answer modes, retries, timing and debug records. This is useful for matched baselines. Both answer modes should be reported because making an LLM serialize every probability changes the task and its cost. [J08](https://github.com/typesafe-ai/system-one-adapter-python)

Our benchmark must compare at least these distinct settings:

- Same state, same candidate set, same requested information, same validators.
- Discrete decisions for every method when only a decision is consumed.
- Distribution-returning decisions when probability quality is the objective.
- Full episode success with the same executor, tool observations and deadlines.
- Local policy compute separately from remote API round-trip and end-to-end completion.

Do not compare a warm local controller against a cold remote reasoning model and attribute the whole difference to intelligence. Do not reward a fast controller for receiving an oracle action shortlist unavailable to competitors.

## 5. The new product must go beyond routing, but routing is already prior art

TypeSafe already documents routing among deterministic handlers, specialist LLMs and people. Its confidence-routing pattern applies thresholds to action categories. Therefore neither an LLM router nor confidence gating is a novel contribution by itself. [J09](https://docs.typesafe.ai/patterns/intent-routing), [J10](https://docs.typesafe.ai/patterns/confidence-routing)

Our proposed extension is a persistent control runtime: observe changing environments, preserve entity state, select skills, check action preconditions, manage concurrent work, interrupt, verify effects and learn from consequences. Jev can be an optional semantic sensor or comparison provider inside that architecture. We should neither depend on its availability nor claim to reproduce its unpublished training.

## 6. Public alternatives: inspect what they actually implement

| Project | Verified public scope | What it does not establish |
|---|---|---|
| [SemIf, formerly OpenJev](https://github.com/TheoLeeCJ/SemIf) (J11) | Reads bounded option logits from frozen open models; publishes owned fixtures and timing/quality artifacts; explicitly disclaims reproducing Jev's undisclosed model/training | No proof of equivalent RLCD training, universal calibration, or submillisecond software control |
| [mini-Jev](https://github.com/r-ms/mini-jev) (J12) | Preregistered comparison of option-letter scores with constrained generation on a frozen model; includes raw records and known out-of-scope/dependent-field weaknesses | Not a learned persistent controller and not evidence that every task benefits from direct logits |
| [jev-on-a-laptop](https://github.com/rorshopping/jev-on-a-laptop) (J13) | Unofficial study of parallel typed decisions on open models on Apple Silicon | Results must be reproduced on matching hardware/workloads before comparison |

The distinctions are useful experimentally. A frozen semantic model with a direct score readout tests whether generation overhead is avoidable. A small policy trained from transitions tests whether repeated software behavior can be compiled into a cheaper controller. These are different hypotheses. Our main fast path chooses the second while retaining a semantic scoring baseline.

A recent independent position paper explicitly discusses temporal hidden state and composition/calibration limits around Jev. It is a relevant novelty warning, not established evidence for its proposed architecture. [J14](https://github.com/dnakhoa/jev-deferred-crispification)

## 7. Disclosure audit and reproducibility limits

The inspected launch, documentation and public TypeSafe organization repository listing did not expose a Jev training recipe, full architecture specification or downloadable weights. Therefore exact reproduction of Jev or RLCD is **unverified and presently unsupported by the inspected public material**. This is a bounded search finding, not proof that no disclosure exists anywhere. Public organization forks such as vLLM or LLaDA do not identify Jev's architecture.

No authenticated Jev request was made in this research pass. Endpoint availability, request latency from Chile, account quotas and workload calibration remain unmeasured. No third-party claimed benchmark number is entered as our own result.

## 8. The appropriate starting guide

For a software team implementing this idea:

1. Specify environment observations, the finite action families, and machine-checkable task completion.
2. Implement exact known logic first and measure its ceiling.
3. Log episodes, including unsuccessful and interrupted work, without leaking sensitive payloads.
4. Fit a small candidate-scoring policy and calibrate on distinct episodes.
5. Delegate novel or complex work asynchronously, with bounded context and budget.
6. Treat every slow-model response as a versioned proposal, then revalidate current state.
7. Verify consequences before rewarding, caching or distilling a behavior.
8. Benchmark whole tasks and adverse cases, then compare against the same tools driven directly by LLMs.

The detailed mathematical and implementation contracts are in [the architecture synthesis](05-architecture-and-research-program.md), and the broader prior art is in [the learning dossier](03-learning-and-control.md).
