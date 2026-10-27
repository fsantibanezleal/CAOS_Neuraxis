# 02. Control loop

Each decision starts from an observation snapshot containing the goal, typed events, resource versions, capabilities, pending work and bounded execution budget. The engine reducer applies exact transitions and computes the admissible candidate set before any policy receives state. A policy cannot add a capability or resurrect a stale resource.

The fast path scores or selects from that supported candidate set. A fixed state machine, behaviour tree, fitted classifier, recurrent model, reinforcement-learning method, and persistent metacontroller share the same action contract and independent postcondition oracle. Their predictions do not constitute receipts. Decision records preserve candidate scores, selected action, observed outcome, resource revision and elapsed time.

An explicit wait lets I/O or a background task resolve without blocking the event loop. A delegation request carries the goal identity and causal revision. A returned proposal is discarded if the goal changed or the proposal no longer matches the latest supported candidates. Accepted proposals pass the same exact admission path as fast decisions. Timeouts and unused planner completions are recorded rather than counted as successful work.

The safety invariant is that uncertain state narrows authority. The performance objective is a separate empirical question: routing deliberation is only useful when a matched experiment shows additional task utility after its latency and failure costs.
