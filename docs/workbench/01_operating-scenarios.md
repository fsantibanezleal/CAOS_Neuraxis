# Operating a scenario

Choose one of twenty categorized cases, a method, an execution lane, a fault variant and a seed. The sidebar uses three bounded control groups: Scenario, Environment and Evidence. Method choices are grouped into exact control, supervised scoring, sequential learning, model-based prediction, slow coordination and metacontrol.

## Browser virtual workspace

The browser executes M01 and M02 against a deterministic in-memory workspace. M01 retains a guarded workflow stage; M02 revisits a prerequisite after a failed action. Every step generates an actual event, candidate set, chosen action, versioned resource update and explicit outcome. This lane never opens arbitrary local files, invokes native processes or contacts a tool provider.

Run advances the finite scenario. Step admits one transition. Pause stops playback, and hidden tabs stop the visualization loop. Reset reconstructs the virtual state from the selected case, variant, seed and parameters. Cancellation stops new admissions while preserving effects already observed; it does not claim rollback.

Environment controls affect the simulation rather than cosmetic labels:

| Control | Effect |
| --- | --- |
| Tool latency | Changes seeded virtual action duration |
| Reliability | Changes observed failure and bounded retry events |
| Deadline budget | Stops admission when the virtual budget is exhausted |
| Acceptance threshold | Changes the exact-policy evidence-refresh condition |
| Observation noise | Introduces bounded refresh requirements |
| Competing workers | Introduces resource lease acquisition |

Inject fault marks the next effect unresolved or failed, retaining uncertainty in the record. In the ambiguous-write case, reconciliation is explicit. The predictor is not assigned a fabricated zero residual when the outcome is unknown.

## Reading the instruments

The decision cursor is shared by the timeline, score bars, effect plots and coordination diagram. Hover or focus a plotted point to expose its values; select a timeline point to inspect the corresponding resource snapshot. The workspace table shows recorded identifiers, versions, ownership and values. Technical action identifiers remain identifiers in either language.

Candidate priorities from exact policies are scores, not probabilities. Learned probabilities are displayed only when the source record declares them. The probability target and diagnostics remain available for inspection; demonstration agreement must not be interpreted as probability of safe execution.

Effects can be numeric predictions, categorical outcomes or structured receipts. Missing values remain absent. The virtual clock is clearly labeled and must not be compared directly with native controller latency.

## Scope

The browser is a live laboratory for bounded exact control. Learned methods use their trained native implementation or canonical measured episodes. Selecting a learned method never silently substitutes a browser heuristic under its name.

![Execution lanes](../../frontend/public/svg/tech/02-lanes.svg)
