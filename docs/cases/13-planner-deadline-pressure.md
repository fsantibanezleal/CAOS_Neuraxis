# C13 · Planner deadline pressure

Start a real asynchronous proposal future after the first observation, wait for its result, and collect only a proposal bound to the current goal and input digest. This isolates scheduling from separately measured LLM policy calls.

## Initial state and inputs

Setup creates a one-worker executor and visible `running=1`, `job_ready=0`. The first observation submits a controlled producer that waits 15 milliseconds, then returns the episode goal, input SHA-256, `a-collect`, and an explicit `not an LLM` provenance label. It runs independently of the subsequent wait action.

All cases expose the shared preparation operations `refresh`, `ack_event`, and `wait_dependency`. Candidate order is shuffled reproducibly by seed and step. The default episode limit is 16 transitions. The native journal directory is excluded from workload fingerprints; separate event-transport files do not cause accidental stale rejection during a readiness wait.

## Registered actions and expected control

| Operation | Actual behavior |
| --- | --- |
| `wait` | Obtains the actual future result with a two-second timeout, persists `proposal.json`, and exposes readiness. |
| `collect` | Requires readiness and verifies the proposal's goal identity and input SHA-256 before writing `planner.result=received_after_async_wait`. |
| `cancel` | Registered distractor without an applicable C13 effect. |

A supported nominal sequence is **wait → collect**. This is an inspectable M01 rule sequence, not a claimed learned discovery. Native admission checks trusted registration, capability, resource scope and current binding before effects. Most fixture operations hold a conservative `workspace` write lease.

## Independent outcome truth

The verifier requires exact text `received_after_async_wait` in `planner.result`. The trusted collect handler checks readiness first. The predicate does not impose a deadline-miss threshold or verify a remote planner's actual output.

The result file contains `received_after_async_wait` after the readiness observation. Timing depends on host scheduling.

## Six variants as implemented

| Variant | Actual mechanism and required response |
| --- | --- |
| `nominal` | The family-specific initial condition described above. Nominal does not imply a fault-free workload: recovery families deliberately include their named fault. |
| `delayed_observation` | After the first observation, an independent producer waits 15 ms and atomically publishes source sequence 2 to `.scenario/delivery.json`. `refresh` waits at most 250 ms for that actual file, reads it, and clears the stale-state gate. Delivery availability invalidates the cached observation. |
| `duplicate_event` | The inbox contains two records with the same delivery ID. `ack_event` consumes both into a persistent dedup ledger with one accepted ID and one duplicate, then feeds the same event twice to the native reducer and records `duplicate=true`. Repeating acknowledgment does not add an accepted event or execute the family effect twice. |
| `stale_conflict` | A separate writer changes `.scenario/revision.json` after the candidate has been bound and before native dispatch. The actual fingerprint change causes `stale_revision`; no family effector executes on that first attempt. Refresh and retry against the new binding. |
| `unavailable_dependency` | An independent producer creates `.scenario/dependency.ready` after the first observation. `wait_dependency` observes that artifact with a 250 ms bound; the action does not manufacture readiness. Other family actions remain gated until it is observed. |
| `boundary` | A real 513-byte untrusted payload is clipped to a 512-byte visible limit with explicit truncation provenance. A deliberately unsupported argument is actually rejected by registration validation; a separate `allowed=False` escape candidate cannot acquire authority. |

These are deliberately scheduled fault mechanisms over actual files, threads, processes and native admissions. They are not captured production incidents. The same family predicate is checked after preparation; clearing a fault flag cannot substitute for the requested result.

## Reproduce and inspect evidence

Install the compiled `reflexmesh` package in an isolated environment. Save this as `run_case.py`, then execute `python run_case.py`. M01 needs no trained checkpoint or model provider. The environment owns a disposable directory and cleans up its processes/services on exit.

```python
import json
from dataclasses import asdict
from reflexmesh.environments import CaseSpec, SoftwareEnvironment
from reflexmesh.policies.rules import GuardedFSMPolicy

policy = GuardedFSMPolicy()
spec = CaseSpec("C13", "nominal", 40000)
with SoftwareEnvironment(spec) as env:
    while not env.terminal:
        _, outcome = env.step(policy.predict(env.observe()))
        print(json.dumps(asdict(outcome), ensure_ascii=False))
    print(json.dumps(env.runtime.snapshot()["state"]["intents"], indent=2))
    assert env.verify(), "Actual completion predicate failed"
```

Change the variant string to any row above; use seed 40001 for a second input. To retain files, supply a newly created, empty disposable `directory=` to `SoftwareEnvironment`; it writes fixture files and must not be pointed at valuable user data.

The authenticated local workbench accepts this body at `POST /api/run`:

```json
{"case_id":"C13","method_id":"M01","variant":"nominal","seed":40000,"parameters":{"max_steps":16}}
```

Use the local bearer token and poll `GET /api/events?run_id=<returned-id>&after=0`. See [the executable API procedure](../cases.md#authenticated-local-api). A request acknowledgement is not a completed episode.

## Failure evidence and interpretation limits

Collection before readiness raises `planner_still_pending`; an altered goal or changed input digest raises `stale_producer_proposal`. A timed-out future is an explicit failure. Inspect `proposal.json`, its binding, readiness and the final receipt.

The asynchronous producer is a deterministic registered fixture, not an LLM or a production planner service. M09–M12 separately make actual local-model calls when configured. No hard deadline, planner throughput, or real-time schedulability claim follows from this controlled 15-millisecond delay.

Retain failed, denied, unknown and step-limit outcomes. Native `effect_unknown` retains its lease until independent reconciliation. A task predicate, a tool receipt and a model score answer different questions.

Implementation reviewed: [environment handlers and predicates](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/software.py), [actual shared fault driver](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/faults.py), pinned to the corrected environment revision. Corresponding tests are `test_environments_causal_faults.py`. Supporting context: [Asynchronous control and latency scope](../research/05-architecture-and-research-program.md). [All case contracts](../cases.md).

