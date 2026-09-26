# File operations and investigations

Tasks executes three useful fixed-tool workflows through the published reflexmesh
0.1.0 native runtime. It does not execute uploaded source, ask an LLM to invent
findings or grant a model arbitrary computer access.

## Run a task

1. Select release verification, source audit or data reconciliation.
2. Inspect the owned incident or select your UTF-8 files or a folder. A folder's
   common root is removed; relative paths are preserved. Selection remains in the
   browser until Run task is pressed.
3. Run the native tools. A completed run opens its findings, or its files and
   outputs when no findings were produced. The execution map remains available
   in the Inspect selector; selecting a node shows dependencies, effect history
   and its artifact.
4. Click a finding to open the exact input file and highlighted line. Findings
   preserve original line numbers. The file view includes generated JSON records
   and accepted CSV outputs. A successful analysis may still reject a delivery.
5. Download the ZIP before closing or reloading the browser. It includes original
   inputs, structured outputs, accepted CSV rows and the execution journal. Delete
   the run to remove its hosted data immediately.
6. Open **Session runs** to return to an earlier execution, inspect its own inputs,
   download it or delete it. Changing the task does not discard hosted history.
   If the service session expires, cached evidence remains downloadable as JSON;
   explicitly starting again obtains fresh authority. An interrupted submission
   is never retried automatically: refresh history to check whether it was accepted.

The memory-only session capability survives route changes but not a full reload.
Reloaded sessions cannot regain old runs. The service removes completed or orphaned
run directories after one hour (checked every 30 seconds). Never use the service as
long-term storage. Concurrent execution is two runs globally and one per session;
at most 24 runs and 128 sessions are retained, with 20 run starts per minute.

## Accepted input and actual checks

Each run accepts 1 to 256 unique relative UTF-8 files, each at most 128 KiB and at
most 1 MiB in total. Absolute paths, traversal, hidden path components, reserved
Windows names, backslashes, NUL bytes, case-insensitive duplicate names and file/directory
collisions are rejected. Original bytes, including CRLF, are hashed without newline
normalization. Binary files are outside the contract.

| Input | Actual behavior | Limit |
|---|---|---|
| Python | AST syntax parsing | No execution, import, lint or semantic correctness claim |
| JSON | Strict parse, rejecting duplicate keys and nonfinite values | No application-specific schema unless declared below |
| TOML | Standard parser | No package installation or dependency resolution |
| CSV | Shape, nonempty fields, duplicate `id`, scoped foreign keys and propagated rejection | Up to 256 columns and 20,000 records; no inferred units or numeric ranges |
| `workflow.json` | Declared jobs, prerequisites and cycles, up to 256 jobs | No execution of commands in that file |
| `release-manifest.json` | Relative file paths and lowercase SHA-256 values | Establishes byte identity, not authenticity or software safety |

A workflow has `{"jobs":[{"id":"build","depends_on":[]}]}`. A release manifest
maps paths to SHA-256 strings. See the Inputs inspector for complete examples.
For a foreign key such as `customer_id`, a corresponding `customers.csv` table with
an `id` column must be present; absent relationships are not invented.
Targets in the same directory take precedence; otherwise exactly one matching
alias must exist. Missing tables produce an unchecked-reference warning and
ambiguous targets quarantine affected records. References to rejected parents
propagate through dependent tables. Duplicate IDs retain the first structurally
valid record and quarantine later duplicates, so input order is significant.
Separate `workflow.json` files have separate job namespaces.

Data normalization preserves the original header and valid rows in input order.
Invalid rows are quarantined with their line and reason. Accepted plus quarantined
rows must equal the source row count. No attempt is made to guess a replacement
identifier or silently repair malformed source.
Extra fields remain in `extra_values`; physical start/end lines and record numbers
are distinct, including quoted multiline fields and blank lines. The verifier
checks rejected values as well as exact accepted rows. Warnings require attention;
cancelled or incomplete execution cannot certify a passed delivery.

## Meaning of execution evidence

The source and data tasks use seven actions; release verification uses nine.
Each action reads the immutable bundle and declared predecessor outputs, emits a
JSON artifact and returns a native effect receipt. The final verifier separately
rereads source hashes, checks the generated manifest and verifies row conservation.
Cancellation prevents further actions and retains already written evidence.

`succeeded` describes a completed analysis. `attention_required` describes input
findings. Neither is a claim of general software correctness. The task policy is
an exact dependency controller with zero model calls. It shares the native engine
with learned research controllers without attributing those methods to this task.

## Investigations and scientific experiments

Investigations compares two canonical method executions with identical case,
condition and seed. Each trace is hash checked. Selecting an action exposes the
observed state before and after it, candidate evidence and planner diagnostics.
Failures remain available; replay dispatches no effects.

Experiments contains a separate 36-run compound study: three tasks, four conditions
and three seeds. Every owned input bundle contains 54 files: 32 Python modules,
16 JSON configurations, two CSV tables with 400 base rows, an 18-job workflow,
project metadata, README and release manifest. Corruption and dependency/ID
conflicts change real bytes. This is an authored workload, not an external benchmark.

Reproduce it outside CI:

```sh
python scripts/evaluate_operations.py
python scripts/check_operations.py
```

The frozen controller research is unchanged: 14,400 core, 288 structural-transfer
and 4,800 ablation episodes. Its negative learned-gate and transfer findings are
preserved. The additional operation study must not be pooled into that comparison.

## Local workspace and models

Start `python scripts/serve.py` after installation and frontend build. The launcher
opens a generated local session without an account login. To operate an existing
host workspace, add `--workspace /absolute/existing/directory`. The advanced view
offers reviewed dependency recipes and unknown-effect reconciliation. Immutable
process registrations may be supplied through `--process-config`; the browser
cannot add process authority. Model-dependent native methods require an explicitly
configured installed Ollama model and their matching frozen checkpoints.
