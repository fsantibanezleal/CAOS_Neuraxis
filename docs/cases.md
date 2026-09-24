# Workload and case contracts

The owned suite executes real disposable file, process and HTTP effects through native admission. Its goals, inputs and fault schedules are designed experiments. They are not production traces or a universal agent benchmark. The numbered pages below specify actual inputs, registered actions, output truth, six causal variants, reproducible commands and important limits.

| Case | Contract | Independent completion evidence |
| --- | --- | --- |
| C01 | [Workspace document routing](cases/01-workspace-document-routing.md) | Exact destination bytes; source absent |
| C02 | [Incremental file indexing](cases/02-incremental-file-indexing.md) | Full current hash mapping plus two reused, two changed/new and one deleted entry |
| C03 | [Data validation and quarantine](cases/03-data-validation-and-quarantine.md) | Correct category bytes; incompatible category absent |
| C04 | [Build and test recovery](cases/04-build-and-test-recovery.md) | Passing real test process after configuration repair |
| C05 | [Transient HTTP retry](cases/05-transient-http-retry.md) | Actual HTTP response value after controlled failure |
| C06 | [Ambiguous write reconciliation](cases/06-ambiguous-write-reconciliation.md) | One remote write and independently queried status |
| C07 | [Long job cancellation](cases/07-long-job-cancellation.md) | Owned child terminated; delayed output absent |
| C08 | [Process restart](cases/08-process-restart.md) | Restarted child exited and wrote its expected result |
| C09 | [Bounded storage pressure](cases/09-bounded-storage-pressure.md) | Required 2048-byte report exists; disposable cache removed |
| C10 | [Dependency ordered workflow](cases/10-dependency-ordered-workflow.md) | Extract/transform/report result equals independently computed value |
| C11 | [Concurrent file revision](cases/11-concurrent-file-revision.md) | Real intervening writer rejected; final revision/value match |
| C12 | [Agent job collection](cases/12-agent-job-collection.md) | Both actual workers exited and collected sum is 13 |
| C13 | [Planner deadline pressure](cases/13-planner-deadline-pressure.md) | Bound asynchronous proposal observed before collection |
| C14 | [Unsupported planner argument](cases/14-unsupported-planner-argument.md) | Actual argument-validation rejection precedes valid invocation |
| C15 | [Untrusted tool text](cases/15-untrusted-tool-text.md) | Reported checksum, policy-visible untrusted text and both preserved canaries |
| C16 | [Missing evidence](cases/16-missing-evidence.md) | Exact registered result after evidence inspection |
| C17 | [Novel registered capability](cases/17-novel-registered-capability.md) | Exact result from an explicitly registered new tool identity |
| C18 | [Observation ordering](cases/18-observation-ordering.md) | Native source-sequence rejection preserves the latest result |
| C19 | [Reliability drift](cases/19-reliability-drift.md) | Observed baseline, online failure transition and recovered response |
| C20 | [Crash recovery](cases/20-crash-recovery.md) | Real worker crash, reopened unknown intent and exactly one verified durable effect |

## Fault variants and outcome interpretation

Every family has nominal, delayed observation, duplicate event, stale conflict, unavailable dependency and boundary variants. Delayed delivery uses a real independent producer and a later source event; stale conflict changes a resource after a candidate is bound and exercises native rejection. Duplicate delivery has an actual two-record inbox, persistent deduplication and native duplicate detection. Dependency readiness is produced independently of the wait action. The boundary variant supplies a real oversized payload, visible truncation and a rejected schema probe.

These mechanisms are deliberately controlled. Their durations are scheduling inputs, not hard real-time guarantees. The rule-policy sweep covers all 120 family/variant combinations; the standard held-out outcome matrix repeats them over ten disjoint test seeds, giving 1,200 episodes per method. See the release manifest for what was actually executed. Planned matrix size is not a measured score.

A verified task predicate differs from a tool receipt. A successful HTTP tool can return 503; a request timeout can occur after a write; an admitted action can fail its goal. Preserve failures, denied actions, step limits and unknown effects in traces. An unknown effect retains its logical lease until independently verified reconciliation. Native types, capability declarations and a hash chain do not by themselves establish external truth or isolate arbitrary untrusted code.

C02 reuses hashes under a trusted size/mtime invalidation assumption; its independent verifier still hashes current bytes. C09 models a configured quota over real files without filling the host disk. C11 schedules a genuine intervening writer but does not implement universal filesystem compare-and-swap. C12 runs fixed owned worker programs. C13 uses an actual asynchronous proposal future whose producer is explicitly not an LLM. C17 exposes a registered tool identity under the declared schema and does not prove open-world capability discovery. C20 kills a real worker after fsync and reopens its native journal; it tests process failure, not sudden power loss or distributed exactly-once execution.

## Reproduce one case

Each numbered page contains a complete `run_case.py` example. Install the compiled package in an isolated Python environment, save the example, and run:

```powershell
python run_case.py
```

M01 and M02 need no trained checkpoint or model provider. Learned methods require the versioned checkpoints matching the source/data manifest; a missing checkpoint is reported explicitly. M09–M12 additionally need the configured local planner where applicable. Case families always use disposable owned workspaces and fixed registered effectors. Never point a case fixture at valuable user files.

The standard fixture split uses train seeds beginning at 10000, validation at 20000, calibration at 30000 and test at 40000. Split names and seed groups are recorded in episode IDs. Generating demonstrations or fitting policies from test outcomes invalidates held-out interpretation. Full pipeline stages are described in the package documentation; this page's single-case example is for inspection and does not replace the frozen release matrix.

## Authenticated local API

Start the compiled package's local service in one terminal:

```powershell
$env:REFLEXMESH_LOCAL_TOKEN = 'replace-with-a-long-random-local-token'
reflexmesh serve --checkpoints artifacts/checkpoints
```

Use a fresh long token and set the same `REFLEXMESH_LOCAL_TOKEN` in the caller's terminal. For this M01 request, no checkpoint is loaded. The service defaults to loopback port 8151. Save the following as `run_case_api.py` and run `python run_case_api.py`:

```python
import json
import os
import time
from urllib.parse import quote
from urllib.request import Request, urlopen

base = "http://127.0.0.1:8151"
headers = {
    "Authorization": "Bearer " + os.environ["REFLEXMESH_LOCAL_TOKEN"],
    "Content-Type": "application/json",
}

def request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = Request(base + path, data=data, headers=headers)
    with urlopen(req, timeout=10) as response:
        return json.load(response)

started = request("/api/run", {
    "case_id": "C20",
    "method_id": "M01",
    "variant": "nominal",
    "seed": 40000,
    "parameters": {"max_steps": 16},
})
run_id = quote(started["run_id"], safe="")
deadline = time.monotonic() + 30
while time.monotonic() < deadline:
    result = request("/api/events?run_id=" + run_id + "&after=0")
    if result["status"] in {"succeeded", "failed", "cancelled"}:
        print(json.dumps(result, indent=2))
        break
    time.sleep(0.05)
else:
    raise TimeoutError("Run is still active; inspect or cancel it explicitly")
```

The polling bound is a client example, not a runtime latency promise. To request cancellation, issue authenticated `POST /api/cancel/<run_id>`. Cancellation is not rollback; inspect the recorded result and any unknown effect. Case execution is separate from the workbench's explicit user-workspace workflow API.

## Evidence and external transfer

The corrected case implementation is pinned at [81af4cf](https://github.com/fsantibanezleal/reflexmesh/tree/81af4cfb5d356c8ae19ae0d06e36131a01843c6f/python/reflexmesh/environments). Numbered pages link exact handlers and fault mechanisms. Release evidence additionally binds Python source, Cargo/Rust source, native binary, dependencies, data and checkpoints. Superseded pre-correction episodes must not be merged into corrected-case scores.

ToolSandbox and frozen tau2 tasks form separate upstream transfer lanes with their original evaluators, pinned source and explicit eligibility selections. They do not become official full-benchmark leaderboard results through this adapter. A small local-model transfer subset is not evidence that every learned controller generalizes to those domains. See [benchmark engineering and source constraints](research/04-benchmarks-and-engineering.md) and the package's versioned transfer manifests.

A missing model, blocked dependency or absent trace remains explicitly unavailable. Never fill it with a fabricated result or silently remove failed episodes.

