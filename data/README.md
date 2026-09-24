# Data contracts

## Contract 1: recorded observations and outcomes

The collector records versioned candidate/observation/decision/outcome objects from actual registered effects. Required provenance includes environment/case identity, source ordering, causal group, split, feature schema, actual action, outcome evidence and explicit missing-outcome semantics. Validation rejects nonfinite values, duplicate candidate IDs, unknown action choices and overlap among split groups. Hidden evaluator targets are stored only as training/evaluation labels, never as observation features.

The owned workloads are designed fixtures with real disposable software effects. Their split manifests record environment seeds and episode IDs. External transfer sources are acquired into excluded directories at pinned upstream revisions; their native licenses and task inclusion/exclusion manifests remain separate. Raw user data, credentials and full external datasets do not belong in the public repository.

## Contract 2: scientific workbench artifacts

`derived/index.json` has `schema_version`, `generated_at`, provenance, a twelve-method registry, a twenty-case registry, episode manifests and aggregate results. Each manifest entry binds run/case/method/variant/seed/status to a relative trace path and SHA-256 digest. Episodes carry real events, decisions, resources, metrics and split/truth/model provenance.

`scripts/check_artifacts.py` verifies byte identity, valid dimensions, complete six-variant coverage, ten held-out seeds per cell, native effect evidence and aggregate episode counts. Canonical export rejects incomplete results. Imported replay has a separate unverified-origin label and no executable authority.

`raw/` and `cache/` are excluded from Git. `derived/` contains compact auditable results and trace exports. Learned checkpoint binaries are acquired as versioned release assets into `models/checkpoints/`, with digests recorded in their manifest. Serving and deployment consume existing outputs and never recompute benchmark truth.
