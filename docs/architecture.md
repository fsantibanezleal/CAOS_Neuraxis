# Architecture

The controller receives typed events, updates exact authority state, constructs currently supported candidates, then asks a policy to act, observe, wait, stop or delegate. Exact resource versions, capability sets, cancellation and deadlines are managed by the native Rust reducer. Learned features and recurrent state are scientific estimates and cannot grant execution permission.

The Python Runtime binds validated arguments to registered resources, re-observes them at dispatch and durably records an intent before running the effector. Completed, failed, cancelled and unknown outcomes remain distinct. A missing HTTP receipt or process interruption is not proof that effects did not occur. Unknown effects retain conflicting leases until application-specific reconciliation.

The goal coordinator uses separate urgent and normal event queues. Policy inference, effects and slow-model calls execute outside the event loop. Goal dependencies, step budgets and deadlines bound work. Slow proposals must match the goal and causal revision at arrival, then pass the same exact admission checks as fast policies. A goal succeeds only when its independent verifier establishes the declared postcondition.

## Scientific and application layers

The separate reflexmesh package owns native execution, policy training, features, recurrent models, world-model prediction, RL, deferral, evaluation and external adapters. This product repository owns orchestration, canonical data, application composition and the frontend. It declares no installable Python package.

The scientific pipeline records train/validation/calibration/test separation, model files, source digests, model/runtime provenance, actual outcome traces and method summaries. A result directory cannot be silently resumed against changed source/checkpoints. Public artifacts exclude raw private data and local credentials. Heavy model acquisition and external environments are explicit offline tasks.

The frontend uses the shared CAOS app shell. It never trains models during startup or makes a replay look like host execution. Its browser lane owns a bounded virtual workspace. Native execution requires the same-origin local service and bearer session token. Canonical replay and imported replay are inspection-only lanes. The static deployment serves HTML/JS/artifacts and cannot invoke host tools.

## Failure and trust boundary

The native broker is an authority/state reducer, not a VM or kernel sandbox. Canonical paths prevent supported aliases from bypassing cooperating resource locks, but cannot isolate hostile external writers. Registered process templates have immutable argv and bounded duration/output; arbitrary untrusted code requires independently configured isolation. Capability revocation signals running cooperative workers, while cancellation remains distinct from rollback.

Models can rank supported candidates and advise when to consult a planner. Confidence calibration names a specific empirical target; demonstration agreement is not a probability of safety. The research hypothesis is evaluated against simpler policies under the same effect boundary. General intelligence, hard real-time execution and production reliability are not inferred from controlled workload scores.
