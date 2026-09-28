# Operational workbench design

## Review and authorization

The user rejected the simulation-first experience and explicitly requested deep
research and all necessary reimplementation. This is the implementation design
under that authorization, written before its code. Research basis:
[operational review](../../../research/06-operational-rebuild.md). User design
acceptance remains distinct from our implementation verification.

## Composition and contracts

The product consumes reflexmesh 0.1.1 as of app 0.02.006. Domain-specific analyzers belong
in the product application; native authority, policy contracts and persistent
effects remain in the separate published engine. No new internal package.

Input: operation ID, an optional bounded list of relative UTF-8 text files, owned
fixture variant and seed. Fixed operation IDs are source audit, data reconciliation
and release integrity. Output: an immutable run ID, ordered events, a DAG, measured
node evidence, findings, output files and a digest-bearing export. No arbitrary
path, URL, executable or model endpoint is accepted from the public client.

Each operation expands to an explicitly registered dependency graph. Each node
selects a fixed analyzer, reads declared predecessor outputs and writes one
bounded JSON/text artifact through a ToolSpec under Runtime. Goal verification
reads the written output and checks its independent predicate. The Controller
coordinates ready nodes with bounded concurrency and cancellation. Original input
bytes live under input/ and are immutable throughout a run.

The public API is separate from /api/workspace. It issues random, ephemeral bearer
capabilities; all run reads, downloads and cancellations check session ownership.
Bodies, file counts, file sizes, global sessions, queued/active runs and retention
are bounded. Same-origin requests only; no wildcard CORS. A dedicated unprivileged
systemd service has a dedicated writable state directory and resource limits. The
service does not execute uploaded code or possess a configured user workspace.

## User experience

App has shared-shell mode navigation: Tasks, Investigations, Advanced. Tasks starts
with a compound release-integrity job and meaningful owned inputs. Sidebar selects
task/input/fault condition. The main pane shows the goal, action controls and a
large dependency graph. Selecting a node shows its role, prerequisites, actual
receipt and artifact. Files and findings are first-class result views. Export
downloads the actual report bundle. Progress comes from server events, never a
fabricated timer. Mobile uses document flow. Advanced retains the existing engine
method workbench and authenticated local recipes; it is no longer the entry point.

Investigations loads matched canonical episodes from their existing SHA-256-bound
index. Case, condition, seed and controller selection determine all content. It
shows outcomes and planner/effect events immediately; raw telemetry is secondary.

## Verification and deployment driver

Run the bounded tools against owned compound bundles and arbitrary test uploads.
Measure a local matrix before selecting service resource limits. Export actual
operation traces, source digests and outcomes with a validator. Do not rerun or
retune frozen learned policies as part of this UI correction. Browser acceptance
requires input upload -> native execution -> inspect finding -> download result,
plus cancellation, failed input, narrow screens and both themes/languages.

The static companion remains on the ML VPS. A bounded service on that same host
is acceptable only after measured memory/disk/runtime checks and independent
session-isolation tests. Final verification includes a real HTTPS operation,
downloaded evidence and confirmed deployed commit, not just a health response.
