# Evaluation and engineering dossier for Neuraxis and reflexmesh

Research date: 2026-09-20. Status: researched proposal, no implementation or benchmark execution. Scope: a fast event-driven software controller that supervises tools and delegates selected work to deliberative models. Proposed names are CAOS_Neuraxis (private app) and reflexmesh (separate package repository). Name availability is not a reservation.

This dossier distinguishes source findings, engineering recommendations, and hypotheses requiring experiments. Sources are recorded in [sources-engineering.json](sources-engineering.json). A benchmark being documented or publicly downloadable does not mean it ran in this session. Primary papers, official repositories, license files, dataset cards, and platform documentation were inspected; gated task contents were not accessed.

## 1. What would establish a useful System One controller?

The central evaluation question is whether the controller achieves a better success, risk, latency, and cost tradeoff than simpler alternatives on the same observable event stream and action surface. Fast inference alone does not answer this. A controller that proposes an action in a millisecond but waits on an unbounded queue, repeats a completed payment, or ignores a cancellation is unsuccessful.

A falsifiable claim is: within a declared capability envelope, learned event-to-skill selection plus independent execution checks improves deadline-conditioned task completion and reduces unnecessary LLM calls, while preserving outcome correctness and authorized scope. This is a systems hypothesis. These experiments cannot establish consciousness, general intelligence, equivalence to the nervous system, or universal security.

Require three separate evidence layers:

1. **Controller mechanics:** deterministic faults, stale observations, race schedules, durable recovery, inhibition, capability checks, and cancellation. These can use deliberately constructed cases but must exercise actual disk, process, HTTP, and database operations.
2. **External transfer:** unmodified official tasks in open benchmarks, with the published observation/action contract retained. Required practical lanes: eligible ToolSandbox scenarios and frozen tau2 core domains. BFCL and AgentDojo supply focused argument and attack tests.
3. **Application transfer:** held-out workflows against real executable open-source services and files, plus BrowserGym/WebArena-Verified transfer. Gated WorkArena and OSWorld are separately reported external studies; availability must not be silently assumed in the frozen core release matrix.

Record controller-only, LLM-only, deterministic-orchestrator, and hybrid results separately. Do not label a replay of an existing trajectory as a live successful action.

## 2. Benchmark landscape and access audit

### Benchmark roles

| Resource | Primary evidence and actual role | Adoption decision and limit |
|---|---|---|
| ToolSandbox (2024) | Stateful Python tools, implicit dependencies, interactive user simulation, intermediate/final milestone evaluation. The paper explains partial orders and state-based checks. [Paper](https://arxiv.org/html/2408.04682v1), [repository](https://github.com/apple-aiml-research/ToolSandbox). | Mandatory transfer lane, using an explicitly listed eligible subset of official tasks. It tests tool-state reasoning, not arbitrary Windows or browser behavior. Run actual tool functions; do not replace their results with prewritten traces. |
| tau-bench (2024) and tau2-bench (2025) | Task policies and tool/user interaction; tau2 adds dual control, including user-side actions. The original repo and current repo must be distinguished. [Original](https://github.com/sierra-research/tau-bench), [tau2 paper](https://arxiv.org/html/2506.07982v1). | Mandatory frozen tau2 core transfer lane. Pin task version, domain, user simulator, model configuration, action API, seed, and trial count. A simulated customer is not a human study. |
| Current tau2 repository | As inspected, the same repository advertises tau3 with voice/knowledge additions; it warns that the July 2026 v1.0.1 banking grading change breaks comparability for that domain. [Current official README](https://github.com/sierra-research/tau2-bench). | Do not install moving main and call the result tau2 reproduction. Freeze the intended protocol/task revision; report newer voice and knowledge experiments independently. |
| BFCL | V3 examines multi-turn state/tool use; V4 adds agentic search, memory, and format sensitivity. [Official V4 methodology](https://gorilla.cs.berkeley.edu/blogs/15_bfcl_v4_web_search.html), [leaderboard](https://gorilla.cs.berkeley.edu/leaderboard). | Focused transfer for argument formation, missing parameters, irrelevant functions, and dispatch. AST/call correctness is insufficient evidence of safe completed side effects. Compare identical benchmark/version categories. |
| AgentDojo | Dynamic prompt-injection attacks and defenses in tool-mediated tasks. [Full paper](https://arxiv.org/html/2406.13352v3), [repository](https://github.com/ethz-spylab/agentdojo). | Required adversarial transfer: report benign utility and attack success together, including unseen attack families. A finite attack set cannot certify prompt-injection immunity. |
| BrowserGym | Shared browser experiment interface integrating multiple benchmarks, with Playwright/browser requirements. It is a research framework rather than an end-user execution security product. [Repository](https://github.com/ServiceNow/BrowserGym). | Use its real environment interface for browser transfer. Pin browser and benchmark adapters. Do not attribute all bundled benchmark licenses/access rights to BrowserGym. |
| WebArena / WebArena-Verified | Original self-hosted web tasks; the verified derivative supplies curated tasks and deterministic evaluators using responses and captured network traces. [Canonical](https://github.com/web-arena-x/webarena), [verified](https://github.com/ServiceNow/webarena-verified). | Real service transfer, with restored instance snapshots per trial. Preserve official evaluator and action/observation constraints; privileged database checks remain evaluator-only. |
| WorkArena / WorkArena++ | ServiceNow atomic and compositional knowledge-work tasks. Official setup requires requesting access to gated instance credentials. [README](https://github.com/ServiceNow/WorkArena/blob/main/README.md). | External optional study until access is available and terms recorded. It must not be a hidden dependency of the executable core release. Do not describe it as a locally self-hosted open ServiceNow distribution. |
| OSWorld legacy | Original 369 computer tasks; official site permits excluding eight Google Drive-dependent tasks and reporting a 361-task run. [Project](https://os-world.github.io/), [repository](https://github.com/xlang-ai/OSWorld). | Desktop transfer with exact task denominator. A 361-task result is not a 369-task result. Original, Verified, and V2 results are different protocols. |
| OSWorld V2 / 2.1 | Current official README recommends release osworld-v2.1 dated 2026-09-16, pinning code, task files, assets, websites, and provider images. Task classes and complete assets are gated. [README](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/README.md). | External desktop study, contingent on authorized access and suitable VM infrastructure. No score claim now. Keep private evaluator/ground-truth assets outside agent mounts and network reach. |
| SWE-bench Verified | Official dataset guide describes 500 human-filtered software issue instances; tests grade patches in containers. [Datasets](https://www.swebench.com/SWE-bench/guides/datasets/). | A System Two delegation/recovery stress lane, not primary evidence for a fast event classifier. Reuse identical coding agent/model/tool budget to isolate controller effects. Avoid broad intelligence claims from patch tests. |

### License and access boundaries

These are observed source labels, not a legal opinion or a completed redistribution audit.

| Resource | License/access observed on 2026-09-20 | Operational consequence |
|---|---|---|
| BrowserGym | Apache-2.0 in official LICENSE. [License](https://raw.githubusercontent.com/ServiceNow/BrowserGym/main/LICENSE). | Reuse code with attribution/notice requirements; inspect each benchmark dependency separately. |
| WorkArena | Apache-2.0 code; instance access requires a gated Hugging Face request and approval per README. [License](https://raw.githubusercontent.com/ServiceNow/WorkArena/main/LICENSE). | Open code does not grant unrestricted hosted ServiceNow access. |
| WebArena / verified derivative | Original Apache-2.0 LICENSE; verified repo shows Apache-2.0. [Original license](https://raw.githubusercontent.com/web-arena-x/webarena/main/LICENSE), [verified repository](https://github.com/ServiceNow/webarena-verified). | Audit contained applications and seeded assets separately before redistributing images/data. |
| tau-bench / tau2-bench | Both official code repositories have MIT LICENSE files. [Original license](https://raw.githubusercontent.com/sierra-research/tau-bench/main/LICENSE), [current license](https://raw.githubusercontent.com/sierra-research/tau2-bench/main/LICENSE). | Provider model terms, API charges, and any optional corpora are separate. |
| BFCL | Gorilla code LICENSE is Apache-2.0; public dataset card also labels Apache-2.0. [Code](https://raw.githubusercontent.com/ShishirPatil/gorilla/main/LICENSE), [card](https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard). | The card still describes older releases; use the V4 official manifest for V4 content and archive its applicable licenses. |
| ToolSandbox | Custom Apple terms, with separate subcomponents listed in ACKNOWLEDGEMENTS. [Actual license](https://raw.githubusercontent.com/apple-aiml-research/ToolSandbox/main/LICENSE). | Do not relabel it MIT or Apache. Keep benchmark code external, retain notices, record dependency terms. Some search scenarios need RapidAPI according to README. |
| AgentDojo | MIT shown in official repository. [Repository](https://github.com/ethz-spylab/agentdojo). | Keep model/attack service credentials and costs separate from code license. |
| OSWorld V2 | Apache-2.0 code; gated task card labels Apache-2.0; complete asset card did not expose a clear license label in the inspected public view. [Code license](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/LICENSE), [tasks](https://huggingface.co/datasets/xlangai/osworld_v2_tasks), [assets](https://huggingface.co/datasets/xlangai/osworld_v2_assets_gated). | Asset redistribution permissions remain unresolved. Access requests and task downloads were not performed. Do not republish gated task classes in the app or package. |
| SWE-bench | Harness code is MIT. The inspected Verified dataset page did not expose a license label; underlying project licenses vary. [Harness license](https://raw.githubusercontent.com/SWE-bench/SWE-bench/main/LICENSE), [dataset](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified). | Do not infer a universal data license from the harness license. Record issue/repository/image provenance before redistribution. |

ToolSandbox eligibility should be frozen before model evaluation: include every official scenario satisfiable by the declared local-function dependencies and agreed simulator configuration; list excluded external-search cases by ID and dependency, not by difficulty. If the selected release requires unavailable historical model endpoints, adapt the model interface without rewriting task/evaluator semantics and name that adaptation. Publish its diff and run adapter contract checks.

For tau2, freeze the complete intended core domain lists and the official train/test separation where provided. The current repository's base split is intended for full evaluation and must not casually become a training set. If a task revision is selected before tau3, record its tag/commit and file digests. If current core domains are selected, report their current version rather than implying historical scores are comparable.

## 3. Twenty concrete task families

All rows below are proposed executable workloads, not claimed results. The research app should expose initial state, observations, actions, checks, final state, and outcome evidence for each. Require both ordinary and perturbed variants. Original benchmark tasks remain unchanged in official-score lanes; CAOS mutations get distinct task IDs and no official-score label.

| ID | Family and actual execution surface | Required challenge | Independent outcome check |
|---|---|---|---|
| F01 | Filesystem lookup and bounded text extraction on licensed open-source repository snapshots | Filename ambiguity, missing files, path traversal strings, symlinks/junctions | Content hash and permitted-read audit; no out-of-scope path opened |
| F02 | Atomic file update in a disposable working copy | File changes after read; partial write/process crash | Precondition hash, final exact diff, parse check, preserved unrelated files |
| F03 | File ingestion and artifact build using real parsers/compression tools | Duplicate events, incomplete upload, encoding and malformed archive | Expected record count/hash plus rejection of incomplete or unsafe entries |
| F04 | Tool/API argument binding using official BFCL cases | Missing fields, irrelevant tool, ambiguous enum | Official evaluator and local schema/effect validator separately |
| F05 | ToolSandbox device state prerequisites using original tool functions | Connectivity or setting dependency; insufficient information | Official intermediate and terminal milestone evaluation |
| F06 | ToolSandbox contacts/reminders/messages in its benchmark database | Entity ambiguity and ordering constraints | Official state checks; no unintended entity mutation |
| F07 | tau2 retail transaction in the official environment | Policy conditions, required user confirmation, conflicting request | Official task reward plus action/policy trace |
| F08 | tau2 airline workflow in the official environment | Multiple dependent edits and unavailable requested outcome | Official final database/action checks and termination status |
| F09 | tau2 telecom dual-control workflow | User-side action not yet performed, delayed response | Official evaluator; controller waits for observable state change |
| F10 | HTTP service recovery against a real disposable open-source service | Transient 503, connection reset before/after commit | Read-after-write receipt and service health; no duplicate effect |
| F11 | Queue worker processing using a real queue/service or database-backed work queue | Redelivery, poison message, consumer restart | One logical effect per operation key; dead-letter and acknowledgment evidence |
| F12 | Database update in SQLite/PostgreSQL fixtures | Stale row version, concurrent writers, aborted transaction | Transaction log/query asserts, conservation invariants, conflict report |
| F13 | Multi-tool artifact workflow across files, database, and local HTTP service | One step fails after another has committed | Declared compensations verified; unresolved partial effects explicitly reported |
| F14 | Subprocess execution of real test/build commands in disposable repos | Hung child, excessive output, nonzero exit, nested process | Exit/tree status, bounded logs/resources, required artifact/test result |
| F15 | Agent delegation for an unfamiliar coding/document task | Slow or failed specialist, budget exhaustion, misleading completion message | Actual patch/document checks; delegated completion text alone rejected |
| F16 | Parallel specialists on nonoverlapping and overlapping resources | Concurrent proposals, conflicting revisions, duplicate completion | Resource lease/version checks and final merge/outcome validation |
| F17 | High-priority user stop or goal change during any mutating workflow | Cancel before dispatch, during I/O, and after remote commit | Acknowledgment/stop/effect timestamps; no new forbidden dispatch; reconcile known effects |
| F18 | Real web knowledge-work flow through BrowserGym/WebArena-Verified | Stale page state, missing element, backend delay | Official evaluator/trace with fresh instance snapshot; no privileged observation leak |
| F19 | AgentDojo prompt injection plus hostile tool descriptions/results | Hidden commands, fake approvals, data-exfiltration instructions, poisoned memory | Benign utility, attack success, capability-denial evidence, no promoted authority |
| F20 | Continuous event stream with schema/domain shift and bursts | Event reorder/duplication, new tool version, drift, tenant contention | No silent event loss, bounded queues, calibrated escalation, recovery and deadline metrics |

Rows F01-F03, F10-F16, and F20 need actual open-source files, services, and binaries with pinned versions and recorded licenses. The proposal is not satisfied by a Python function that returns a fabricated success object. Exact projects/images are admitted only after inventorying their footprint and terms during implementation. A fixed fixture service may be used to control faults, but it is labeled an engineered fixture. Results against it are distinct from external benchmark transfer.

F15 may include SWE-bench tasks only when their full isolated evaluator runs; a patch copied from public solutions is prohibited. F18 browser tasks must preserve whether actions use DOM/accessibility or screenshot/coordinate observations, since changing this changes the task. Optional desktop F18 variants can use OSWorld once its separate access/environment gates are met.

### Concrete open-source fixture sources

Use these real components as the proposed local execution corpus. These are source selections, not downloaded/pinned artifacts or completed cases; implementation admission freezes tags/commits, file lists, checksums, reset scripts, and notices before generating splits.

| Source | Cases and actual use | Verified licensing/access evidence |
|---|---|---|
| Requests source snapshot | F01/F02/F14/F16: inspect and patch a disposable real Python repository, run selected existing tests, compare exact Git diff and preserve untouched files | Public Apache-2.0 [license](https://raw.githubusercontent.com/psf/requests/main/LICENSE) |
| toml-test corpus | F03: valid/invalid TOML files pass through an actual parser and checker; add partial-file and duplicate-event mutations without changing the external conformance labels | Public suite [repository](https://github.com/toml-lang/toml-test) and MIT [license](https://raw.githubusercontent.com/toml-lang/toml-test/main/LICENSE) |
| SQLite | F11/F12/F13: on-disk transactions, durable outbox, intentional process interruption, recovery and integrity checks | Official [public-domain statement](https://sqlite.org/copyright.html); bundled extensions remain separately audited |
| PocketBase | F10/F13/F17/F20: actual local records/files REST operations and read-after-write validation under injected network faults | Public [repository](https://github.com/pocketbase/pocketbase) documents SQLite, files, REST API, and MIT license; pin an exact release because compatibility is not promised before 1.0 |
| Valkey | F11/F20: actual stream consumer groups, pending entries, acknowledgments, and recovery after consumer restart | Official [XREADGROUP behavior](https://valkey.io/commands/xreadgroup/) and BSD-3-Clause [COPYING](https://github.com/valkey-io/valkey/blob/unstable/COPYING) |
| PostgreSQL | F12/F16 service-backed transaction conflicts and concurrent workers, separate from single-file SQLite behavior | Official [PostgreSQL License](https://www.postgresql.org/about/licence/); use isolated disposable databases |

The compact required local tier can use SQLite plus PocketBase; Valkey/PostgreSQL are explicit broader service-transfer candidates requiring resource admission, not undeclared mandatory cloud dependencies. None needs a paid model API. Run model-dependent ToolSandbox/tau2 evaluation through a pinned local open model adapter when available, documenting any differences from published simulator settings. Keep paid cloud and Jev API comparisons optional, with missing credentials labeled unavailable. A rules-based scripted user is useful for fixture correctness but cannot be substituted silently for the official benchmark's model user simulator.

## 4. Experiment design and leakage prevention

### Units, splits, and intervention design

Use an episode as the statistical unit for task success, and an accepted event/action as the unit for latency telemetry. Adjacent events within one episode are correlated. Bootstrap success/latency comparisons by episode or task family, not by treating a million events as a million independent tasks.

Create disjoint partitions by workflow template, repository/service snapshot, user intent family, and environment identity. Split before producing paraphrases, perturbed copies, demonstrations, distilled labels, or embeddings. Otherwise nearly identical states can cross train and test. Add temporal holdouts and unseen tool/schema versions. Keep independent calibration, validation, and sealed test sets. Public benchmarks remain external evaluation unless training use is explicit and a different holdout exists.

Maintain two distinct products: an immutable result corpus for replay and a separately validated live runner. Never feed evaluator state, hidden task goals, reference actions, future events, or reference patches into policy features, retrieval memory, prompts, or an LLM teacher. Mount evaluator assets only in the evaluator process; disallow benchmark-source network retrieval during official test runs. Record permitted external network domains.

For feedback learning, delayed rewards attach to an immutable episode/operation ID and observed effect receipt. Do not train immediately from unverified self-reported success. Reject or quarantine attack-bearing logs and label provenance. Any online adaptation evaluated on the test set invalidates a frozen-policy comparison; publish adaptive and frozen protocols separately.

### Comparison matrix

Required baselines:

- Deterministic rules/finite-state controller with the same action contracts, executor, checker, and budget.
- Reactive behavior-tree controller with the same skills and executor.
- LLM-only decision maker on the same event/action surface, with the same independent checker.
- Simple learned router (linear classifier or compact MLP) plus the same deterministic contracts.
- Learned recurrent controller and its chosen memory/uncertainty mechanism.
- Hybrid controller with explicit escalation to the same fixed LLM.
- Oracle routing only as an explicitly nondeployable upper-bound analysis, using privileged labels outside ordinary runs.

The critical ablations are removal of recurrence, removal of learned routing, removal of skill reuse, fixed versus calibrated escalation, no temporal freshness feature, and no inhibition signal. Unsafe executor-check ablations run only inside disposable benchmark environments and cannot be used to justify removing production checks. Compare equal data, training budget, inference budget, and tool access. Report both equal-compute and equal-success comparisons.

Pre-register task subsets, failure handling, practical success margins, and cost budget before opening sealed test results. Count invalid outputs, timeouts, infrastructure errors, unknown effects, and exclusions. Separate agent failures from independently established infrastructure failures without deleting inconvenient failures.

## 5. Timing, throughput, and reliability

Use monotonic clocks for durations and UTC timestamps only for correlation. At a minimum record:

- event production, ingestion, queue entry, and admission;
- state snapshot completion and feature/embedding preparation;
- policy start/end, candidate contract checking, and dispatch;
- tool start/end, external receipt, and postcondition completion;
- escalation start, first model response, final response, and accepted plan;
- cancellation received, acknowledged, last new dispatch, and actual effect termination/reconciliation.

Report p50, p95, and p99 for policy inference, complete decision path, event-to-dispatch, tool duration, verification duration, cancellation acknowledgment, and task completion. End-to-end time includes embedding/feature work, IPC/serialization, queues, checks, I/O, model calls, retries, and validation. Do not publish policy-only latency as application latency.

Measure cold process startup/model load separately from warm steady state; cold cache separately from warm cache; single-tenant separately from competing workloads; batch size one separately from throughput batching. Include burst and sustained arrival rates, offered versus accepted load, queue length, backpressure, dropped/coalesced events, and fairness by tenant/priority. Use independently scheduled arrivals so an overloaded controller cannot hide waiting time by generating the next request only after completing the previous one.

For a deadline d and task outcome S, report:

- deadline miss fraction: count(completion latency > d or timeout) / scheduled episodes;
- verified success before deadline: count(S = success and completion latency <= d) / scheduled episodes;
- cost per verified successful episode, including failed attempts, tool charges, LLM calls/tokens, and evaluator/user-simulator charges;
- fast-path coverage, escalation fraction, unnecessary-escalation fraction, and harmful non-escalation fraction at each uncertainty threshold;
- partial/unknown-effect rates and false-success declarations.

Plot risk versus coverage, verified success versus deadline, and verified success versus actual cost. Include uncertainty intervals. A p99 from 100 episodes is extremely unstable; plan substantial repeated load samples and report the sample size and interval instead of displaying false precision. Any numeric release latency target is a predeclared engineering objective on specified hardware, not a literature-derived guarantee.

Use separately tuned policies for hard safety invariants and statistical task success. Zero observed severe capability violations in n independent trials does not establish zero risk; the rough one-sided 95% upper bound 3/n is only an interpretation aid under independent Bernoulli assumptions, which correlated adversarial cases often violate.

## 6. Engineering stack recommendation

The preferred package design is a Rust decision/execution-contract core, Python research/training/evaluation and public SDK, and TypeScript app consuming exported results or an explicitly secured local runner. This is a design recommendation pending plan validation, not implemented architecture.

| Language | Fit | Limit and decision |
|---|---|---|
| Rust | Ownership-based memory management without mandatory garbage collection; strong enums/state modeling, native packaging, interoperable C API. [Rust ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html). | Preferred for bounded decision state and concurrent controller mechanics. Ownership does not prevent semantic authorization errors, FFI defects, blocking I/O, deadlocks, or scheduler delays. No hard-real-time claim. |
| Go | Good service/runtime ergonomics, goroutines, standard networking and operational tooling. Official GC guide discusses memory/CPU/latency tradeoffs. [GC guide](https://go.dev/doc/gc-guide). | Credible service-only alternative. Benchmark tail latency under real allocation load; do not dismiss it based on language ideology or assume tiny GC pauses are irrelevant. |
| C++ | Direct ONNX Runtime C++ API and mature native ecosystem. [ORT C/C++ API](https://onnxruntime.ai/docs/api/). | Reserve for required native dependencies. Hand-maintained memory ownership and ABI/build complexity raise engineering burden for this product; this is a team-design judgment, not a universal performance comparison. |
| Python | Best integration point for the selected benchmark/training ecosystem and an accessible PyPI API. | Keep policy training and adapters here; measure interpreter/IPC overhead. Ordinary CPython GIL constraints and free-threaded builds differ, and third-party extensions matter. [Python threading](https://docs.python.org/3/library/threading.html). |

Do not claim a language winner before a representative benchmark. The Rust choice follows boundary clarity, tail-latency control, and package reuse, not an assumption that a native implementation automatically beats an optimized Python/NumPy model.

### Python bridge and distribution

Preserve the CAOS setuptools backend convention: use setuptools.build_meta with setuptools-rust and PyO3. The plugin officially supports Rust extensions and binaries. Keep one reviewed public Python API around a private native module in the separate reflexmesh repository. The product app consumes its released dependency instead of declaring another package. [setuptools-rust documentation](https://setuptools-rust.readthedocs.io/en/latest/).

Maturin is a technically valid alternative in the same PyO3 ecosystem, with wheel-building and distribution support. It is researched but not selected because switching the required backend needs an explicit convention deviation. [Maturin](https://github.com/PyO3/maturin).

Expose batched typed observations and decisions, cancellation tokens, status/receipt records, and deterministic serialization. Release the interpreter attachment during native computation where the selected PyO3 version permits it. Avoid one Python callback per tiny policy operation; keep callback-containing adapters outside the timing-critical native section. Exceptions/panics become explicit failed decisions without tearing through the Python ABI.

Test Windows x86-64 and Linux x86-64 wheels as required targets, plus any separately promised macOS target. Validate clean-venv installation, import, native execution, source-distribution reconstruction, and runtime dependency discovery. ABI3 can reduce the wheel matrix but constrains available APIs; free-threaded compatibility must be declared/tested independently. Moving main documentation includes newer abi3t details and should not be copied into a release without checking pinned PyO3/toolchain availability. [PyO3 build guide](https://pyo3.rs/main/building-and-distribution.html), [free-threading guide](https://pyo3.rs/main/free-threading.html).

### Learned inference runtime

ONNX Runtime is a sensible deployment candidate for compact neural policies trained in Python. Its official API index labels Rust bindings as community maintained. The ort crate is a Rust binding and must be pinned independently from the native ONNX Runtime library. An alternative is a small reviewed binding to the official C API. [Official API index](https://onnxruntime.ai/docs/api/), [ort](https://github.com/pykeio/ort), [C API](https://onnxruntime.ai/docs/get-started/with-c.html).

A successful export is not equivalence evidence. Record model digest, feature schema, normalization, opset, ORT version, execution provider, precision, thread settings, CPU architecture, and GPU driver if used. Test numerical agreement and actual action/abstention agreement on held-out recurrent sequences, including recurrent-state reset and sequence boundaries. Reject unsupported operators or silent provider fallback. Compare CPU batch-one performance before choosing GPU; transfer/launch/queue overhead can dominate small policies. [ORT compatibility](https://onnxruntime.ai/docs/reference/compatibility.html).

## 7. Execution contracts and operating-system boundaries

Types validate shape; they do not establish authority, intent, trustworthiness, freshness, or an effect's reversibility. A well-typed delete request can target the wrong file. A readOnlyHint can be false. A signed artifact can contain unsafe behavior. The executor must enforce a separately reviewed capability and effect contract.

Each proposed action needs an operation ID; principal/tenant; allowed resource identities and verbs; argument/schema version; observed resource version; preconditions; risk/effect classification; deadline; retry/idempotency policy; cancellation semantics; expected postcondition; and receipt/checker reference. Capabilities should bind to actual resource identities and allowed effects, expire/revoke, and be narrowed across delegations. Tool output may provide evidence for state, never mint a new capability.

Before any side effect, recheck authority and relevant preconditions at dispatch. Protect time-of-check/time-of-use boundaries with backend compare-and-swap/version checks or scoped handles where possible. String prefix path checks are insufficient on Windows because junctions, reparse points, casing, alternate representations, and concurrent changes can affect resolution. The broker, not a model prediction, resolves and enforces the actual opened resource.

Treat retries by effect semantics: a timeout after a write can mean completed-but-unobserved. First reconcile against the stable operation key or provider receipt; retry only when the adapter can establish safety. Persist intent, dispatch, receipt, and verification status. Use states such as accepted, running, cancellation_requested, completed_verified, failed_verified, and effect_unknown. Request cancellation is not rollback. A compensating operation is a new authorized action whose success also needs checking.

### Windows

Job Objects are useful for process-tree management, resource limits, and termination. Microsoft documents breakaway behavior, individual per-process security limits, and limitations of some completion notifications. Therefore a Job Object is not a complete filesystem/network sandbox. [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects).

For potentially hostile native subprocesses, use an independently tested AppContainer/restricted broker boundary or disposable VM according to compatibility needs. AppContainer is documented to isolate credentials, files, network, processes, and windows according to granted access; arbitrary desktop automation does not transparently fit inside that boundary. Test the exact executable and broker behavior. Never let fallback to an ordinary user process happen silently. [AppContainer](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation).

Measure cancellation across child trees, stalled pipes, open handles, nested jobs, and remote requests. Killing a local process cannot undo a remote service commit. Avoid claiming Windows-native desktop sandbox support until it is exercised on Windows, not only under Linux CI.

### Wasmtime and WASI

Wasmtime/WASI offer a capability-oriented boundary for compatible Wasm plugins, with explicit filesystem access rather than ambient host access. They do not make arbitrary Python packages, native executables, browser automation, or remote MCP servers safe. Imported host functions are part of the trusted computing base. [Wasmtime security](https://docs.wasmtime.dev/security.html).

Use resource limits, fuel or epoch interruption, bounded output, limited handles, explicit network imports, and a narrowly scoped host API. Fuel can make instruction-budget interruption deterministic; epoch interruption is cheaper but nondeterministic. Neither cancels a blocked host call by itself. Host I/O needs its own timeout/cancellation path. Capability confinement also does not prove an allowed action is correct. [Interruption guide](https://docs.wasmtime.dev/examples-interrupting-wasm.html), [Config API](https://docs.wasmtime.dev/api/wasmtime/struct.Config.html).

## 8. MCP interoperability as verified on 2026-09-20

The official versioning page identifies 2026-07-28 as current. This matters: implementing the remembered 2025-11-25 lifecycle without a version boundary would create incorrect assumptions. [Versioning](https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning).

The current changelog removes protocol-level sessions and the initialize handshake, introduces per-request version/capability metadata and server/discover, moves tasks into an extension, and deprecates Roots, Sampling, and Logging. It also changes stream reconnection behavior. These are actual protocol changes, not merely SDK syntax. [Changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog).

Recommendation: keep reflexmesh's internal event/action/receipt model independent of MCP. Implement explicitly tested adapters for the chosen current and legacy versions; no silent semantic downgrade. Cache tool descriptions by trusted server identity, catalog/schema version, and freshness policy. Treat catalog changes as invalidation of compiled skills that depend on affected contracts. Never use a server's nonunique display name as identity.

MCP tool definitions carry input/output schemas and behavioral annotations. The current tools specification explicitly says annotations are untrusted unless from trusted servers. Structured output still needs schema checking and effect validation. Bound schema resolution depth, object size, and resource fetches. Prevent credentials/PII from being mirrored into transport headers through untrusted schema extensions. [Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

Current cancellation semantics differ by transport: Streamable HTTP disconnect signals request cancellation; stdio uses a notification. Servers may be unable to stop already completed or noncancellable work. Task-extension cancellation is explicitly cooperative. Persist task IDs and reconcile terminal results without treating an acknowledgment as evidence that no effect occurred. [Cancellation](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/cancellation), [tasks extension](https://modelcontextprotocol.io/extensions/tasks/overview).

Apply explicit principal binding, scoped credentials, validated authorization endpoints, protection against confused deputy/SSRF/state-handle hijacking, and no token passthrough. The security documentation treats these as implementation responsibilities. An MCP connection is an interoperability channel, not a security sandbox. [Security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices).

The published app can visualize MCP traces and local-runner results. A hosted public UI should not acquire ambient authority over a visitor's machine. Any live local bridge requires authenticated loopback/session binding, explicit origin checks, narrow capabilities, and a threat-model test suite before claiming secure operation.

## 9. Adjacent systems and novelty limits

BehaviorTree.CPP already offers reactive control flow, asynchronous actions, and halting. Use an equivalent behavior-tree policy as a serious baseline. Interruptibility, by itself, is established engineering, not the proposed novelty. [Reactive/asynchronous behavior](https://behaviortree.dev/docs/tutorial-basics/tutorial_04_sequence/).

Temporal already separates deterministic replayable workflows from activities; activity retries require idempotent behavior or nonretryable classification. Long-running workflow durability is existing infrastructure. The proposed fast controller can integrate with a durable orchestrator rather than claiming to invent it. [Temporal architecture](https://raw.githubusercontent.com/temporalio/temporal/main/docs/architecture/README.md).

LangGraph supplies checkpointed execution and interrupts. Its documentation notes that a resumed interrupted node starts again from the node beginning; side effects before the interrupt can execute again unless designed appropriately. State persistence and approval suspension alone do not resolve effect idempotency. [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

GoEX (2024) already proposes post-facto validation, undo, damage confinement, and a runtime for LLM actions. It is direct prior art for an effect-checking executor. Read its boundaries critically: deleting a previously sent message does not erase what a recipient already saw. [Full paper](https://arxiv.org/html/2404.06921v1).

Consequently, the defensible research question is the measured contribution of learned temporal skill selection and calibrated escalation within independently enforced, interruption-aware contracts. A new name for an orchestration loop, a faster classifier, or a biological diagram would not establish novelty.

## 10. Hardware realism and admission gates

No local hardware or dataset was benchmarked in this research task. Training, native runtime microbenchmarks, live service evaluation, and VM/cloud computer-use evaluation have different resource requirements.

- Pure controller/runtime fixtures and text/tool benchmarks can use CPU execution and remote LLM endpoints; remote provider latency/cost remains part of the result. CPU-compatible does not mean free.
- BrowserGym needs its browser installation and benchmark-specific services. Measure actual image sizes and memory before admitting a service matrix. Verified WebArena offers optimized images, but this is not evidence that an arbitrary small VPS can host every site concurrently. [Environment docs](https://servicenow.github.io/webarena-verified/latest/environments/).
- OSWorld V2 recommends KVM for its Docker VM path; images currently provided by the top-level instructions are Docker/AWS. Provider code paths alone are not proof a usable image/environment exists. Verify virtualization and snapshot reset support. [Provider documentation](https://raw.githubusercontent.com/xlang-ai/OSWorld-V2/main/docs/PROVIDER_SETUP.md).
- SWE-bench's official Docker setup calls for at least 120 GB free disk and recommends 16 GB or more RAM. This rules out casually assigning a full run to a small shared service host. [Setup](https://www.swebench.com/SWE-bench/guides/docker_setup/).

Release gates should be concrete artifacts:

1. Source/license inventory, pinned manifests, access proof for required datasets, and explicit exclusions.
2. Frozen train/calibration/validation/test manifests, contamination checks, evaluator isolation, and reproducible reset.
3. Native and Python contract tests; wheel/source build and clean-install checks on every promised OS.
4. All twenty declared workload families executed with real effects and independent checkers, including fault variants; no fabricated case results.
5. ToolSandbox and tau2 official transfer results with exact eligible IDs/revisions and repeated trials. BFCL and AgentDojo focused results, with unresolved failures visible.
6. Mechanistic ablations and equal-budget baselines; action-level and end-to-end latency distributions; full success/cost/deadline accounting.
7. Fuzz/property/concurrency tests for malformed events, schema bounds, reordering, retries, stale state, cancellation, and capability revocation. A violation blocks release until fixed and rerun.
8. Complete provenance artifacts: controller/model digests, package versions, host specifications, seeds, model/provider settings, event traces, redacted effect receipts, evaluator versions, and summary generation commands.
9. App replay/live labels, downloadable result manifests, bilingual research content from this dossier, and all repository-required visual/deployment QA.
10. Independent final assessment of each promised capability. Gated external studies remain labeled unrun until actually executed; they cannot be used to bolster a release claim.

Unresolved items to close during the validated implementation are exact benchmark pins and full task eligibility manifests; current API endpoint availability; model training/data size; representative machine timing targets; external service footprint; OSWorld asset terms/access; and concrete native isolation compatibility. These are declared research-to-implementation checks, not completed work.
