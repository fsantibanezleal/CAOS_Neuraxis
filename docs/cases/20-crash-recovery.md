# C20 · Crash recovery

Recover the actual durable native broker after a worker crashes between committing an effect and reporting its outcome. Verify the effect independently before releasing the unknown intent's lease.

## Initial state and inputs

Setup starts an owned child in `crash-recovery/`. The worker admits `crash.append` through Runtime, persists its running intent, appends one record to `effects.jsonl`, flushes and fsyncs it, then calls `os._exit(23)` before returning a receipt. The parent waits for exit, reopens the same SQLite journal, and observes the original intent as `effect_unknown`. Visible `crash_evidence` records that state.

All cases expose the shared preparation operations `refresh`, `ack_event`, and `wait_dependency`. Candidate order is shuffled reproducibly by seed and step. The default episode limit is 16 transitions. The native journal directory is excluded from workload fingerprints; separate event-transport files do not cause accidental stale rejection during a readiness wait.

## Registered actions and expected control

| Operation | Actual behavior |
| --- | --- |
| `reconcile` | Reads the real effect ledger and proves exactly one expected record. Calls `Runtime.reconcile` on the original crashed intent with verified evidence, then updates visible state. |
| `write, finish` | Registered distractors without an applicable C20 effect; the recovered writer is explicitly prohibited from execution. |

A supported nominal sequence is **reconcile**. This is an inspectable M01 rule sequence, not a claimed learned discovery. Native admission checks trusted registration, capability, resource scope and current binding before effects. Most fixture operations hold a conservative `workspace` write lease.

## Independent outcome truth

The completion predicate requires both the original native intent to be `completed_verified` and actual ledger bytes to contain exactly one canonical expected record. A completed outer reconciliation action, a recovered flag, or a nonempty effect file alone is insufficient.

One fsynced record remains, containing the fixed intent key and episode seed. The recovered inner intent transitions unknown → completed_verified, and no recovery operation appends another record.

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
spec = CaseSpec("C20", "nominal", 40000)
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
{"case_id":"C20","method_id":"M01","variant":"nominal","seed":40000,"parameters":{"max_steps":16}}
```

Use the local bearer token and poll `GET /api/events?run_id=<returned-id>&after=0`. See [the executable API procedure](../cases.md#authenticated-local-api). A request acknowledgement is not a completed episode.

## Failure evidence and interpretation limits

Missing, altered, malformed, oversized or duplicated effect evidence causes reconciliation to fail while the original intent remains unknown. A competing write receives `lease_conflict`. Pure replay and repeated journal reopen do not invoke an effector. Inspect `worker.json`, `effects.jsonl`, both native journals, and `crash_evidence`.

This is a real process crash, not a simulated power failure or arbitrary database-corruption recovery test. SQLite FULL commits and file fsync support the tested process-crash boundary; they do not create distributed exactly-once semantics. Exclusive OS journal ownership prevents cooperating concurrent runtimes from using competing state copies. The host verifier and registered code remain trusted.

Retain failed, denied, unknown and step-limit outcomes. Native `effect_unknown` retains its lease until independent reconciliation. A task predicate, a tool receipt and a model score answer different questions.

Implementation reviewed: [environment handlers and predicates](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/software.py), [actual shared fault driver](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/faults.py), and [crash/restart helper](https://github.com/fsantibanezleal/reflexmesh/blob/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments/crash.py), pinned to the corrected environment revision. Corresponding tests are `test_environments_causal_faults.py`, `test_environments_crash.py` and `test_runtime_ownership.py`. Supporting context: [Unknown effects and replay research context](../research/05-architecture-and-research-program.md). [All case contracts](../cases.md).

