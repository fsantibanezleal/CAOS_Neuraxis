# C17 · Novel registered capability

Use an explicitly registered capability presented with a different tool identity. The controller still operates within the same action schema and trusted native admission rules.

## Initial state and inputs

The invocation tool is named `novel.registered` instead of `sandbox.invoke`. Candidates in this family carry `known=0` in their explicit features. The trusted environment registers the operation before observation, and the capability requirement remains `sandbox`.

All cases expose the shared preparation operations `refresh`, `ack_event`, and `wait_dependency`. Candidate order is shuffled reproducibly by seed and step. The default episode limit is 16 transitions. The native journal directory is excluded from workload fingerprints; separate event-transport files do not cause accidental stale rejection during a readiness wait.

## Registered actions and expected control

| Operation | Actual behavior |
| --- | --- |
| `invoke` | Dispatches through `novel.registered` and writes `invoked.json` with the seed and `registered=true`. |
| `inspect, report` | Registered distractors without applicable C17 effects. |

A supported nominal sequence is **invoke**. This is an inspectable M01 rule sequence, not a claimed learned discovery. Native admission checks trusted registration, capability, resource scope and current binding before effects. Most fixture operations hold a conservative `workspace` write lease.

## Independent outcome truth

`verify()` requires exact parsed output `{value: seed, registered: true}`. A plausible new tool name or a policy decision to invoke is not completion; the operation must have been registered and its actual output must match.

At seed 40000 the exact invocation output is `{value: 40000, registered: true}` under the `novel.registered` action registration.

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
spec = CaseSpec("C17", "nominal", 40000)
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
{"case_id":"C17","method_id":"M01","variant":"nominal","seed":40000,"parameters":{"max_steps":16}}
```

Use the local bearer token and poll `GET /api/events?run_id=<returned-id>&after=0`. See [the executable API procedure](../cases.md#authenticated-local-api). A request acknowledgement is not a completed episode.

## Failure evidence and interpretation limits

An unregistered tool name supplied through another path is not authorized by this family. Within the fixture, choosing inspect or report raises `operation_has_no_applicable_effect`. Inspect the actual registered action ID, capability requirement, native receipt, and resulting JSON.

The family is part of the owned training/evaluation schema and uses a visible known-feature marker. Its name does not establish that a held-out capability was discovered in the open world. It tests adaptation to a registered identity within declared inputs, not autonomous tool installation, permission grant, or general zero-shot capability discovery.

Retain failed, denied, unknown and step-limit outcomes. Native `effect_unknown` retains its lease until independent reconciliation. A task predicate, a tool receipt and a model score answer different questions.

Implementation reviewed: [environment handlers and predicates](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/software.py), [actual shared fault driver](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/faults.py), pinned to the corrected environment revision. Corresponding tests are `test_environments_causal_faults.py`. Supporting context: [Generalization and structural transfer design](../research/03-learning-and-control.md). [All case contracts](../cases.md).

