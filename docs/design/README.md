# The specification area

Where Neuraxis states what it builds and proves the statement can fail. It is written before the code (ADR-0075) and kept current with it: a guard
fails when a part is missing or disagrees with the repository. The area is `docs/design/` (the design), `docs/contracts/` (the contracts as code)
and `tests/` (the tests, with `tests/adversarial/` for the planted defects). The layout and the guards follow the product template 0.08.002
(`.template-version`); the guards `scripts/check_sdd.py` and `scripts/check_tech_matrix.py` are the template's, taken verbatim.

## The order

Research, then the executive brief, then sizing, contracts and the units.

1. **Research basis.** What was researched before the plan and what it decided: each claim with a source (a DOI or a URL), at least three distinct
   sources (one work cited as a DOI and as its URL counts once; example and localhost hosts count for none), and a line starting `UNVERIFIED:` for
   what stayed unverified. Section `Research basis` of [`SDD.md`](SDD.md); the dossiers it summarises are in [`../research/`](../research/README.md).
2. **Executive view.** The problem space in its real context, framed for a decision maker, before any development: one data file,
   `content/executive.json`, valid against the shell's `executive.schema.json` 2.0.0, with its three illustrations under `frontend/public/executive/`.
   Section `Executive brief` of [`SDD.md`](SDD.md), right after `Problem and non-goals`, names the file in a `Data file: content/executive.json`
   line and restates nothing. Checked by `scripts/check_sdd.py` (it needs `npm ci` in `frontend/` for the schema, and the `jsonschema` package).
3. **Sizing, summarised.** The product dimensioned before it was built: its boundaries, the technology and version matrix and the resources of each
   stage. The sizing's coordination records (the parallel units and who owns them) live with the coordination repository, not here. Sections
   `Sizing and contracts`, `Technology and versions` and `Resources` of [`SDD.md`](SDD.md); the measurements are in
   [`measured-resources.md`](measured-resources.md). Checked by `scripts/check_sdd.py` (the twelve sections are headings outside code fences,
   once, in order, each with a body; the resources table has a row for each of bake, tests, build and deploy and no empty or placeholder cell)
   and `scripts/check_tech_matrix.py` (the technology table is the pinned dependencies, version for version: every `requirements*.txt` and
   `frontend/package.json`; Python pins are exact; a package.json range is allowed only when the lock records the same spec and the table holds
   the locked version).
4. **Contracts.** One row per boundary in [`../contracts/catalog.md`](../contracts/catalog.md) (thirteen rows), one schema file each, an example or
   a provider tree, a test on each side, the missing-data behavior and a swap test. A contract is versioned by semver and
   [`../contracts/versions.lock.json`](../contracts/versions.lock.json) holds the digest of each schema. Checked by `scripts/check_contracts.py`,
   `scripts/check_documents.py`, `scripts/check_readiness.py`, `scripts/check_skeleton.py` and `scripts/check_contract_versions.py`.
5. **Requirements.** Per feature, `features/<feature>/requirements.md`: `| ID | Requirement | Gate |`, every statement with SHALL, every gate a
   test or guard that exists and can fail: a `path::name` that names a live test in a test file, or a plain path that is a test file or a script
   under `scripts/` or `frontend/scripts/`. A malformed, indented or split row is a finding, and so is a status other than live without an entry in
   `features/.status-allow`. Checked by `scripts/check_sdd.py`.
6. **Tests, red first.** Each requirement and edge case becomes a test that fails for the right reason before the code exists (`tests/`,
   `frontend/src/**/*.test.ts`).
7. **Adversarial validation.** Per feature, `features/<feature>/validation.md`: `| requirement | adversarial check | gate |`, one row per requirement,
   the check stated as what was planted or refuted and the gate the test that plants it: a test under `tests/adversarial/`, or one named
   `test_adversarial_...` (Python) or `it('adversarial: ...')` (TypeScript). An ordinary test proves a requirement passes, not that it can fail. A
   row that names a plant not yet written fails the guard until the plant exists; that is how the guard reports the work still owed.

## The features

| feature folder | what it holds | requirement ids |
|---|---|---|
| [`features/benchmark-adequacy/`](features/benchmark-adequacy/requirements.md) | the audit of the frozen core and the semantic-transfer lane | BA |
| [`features/evidence-workbench/`](features/evidence-workbench/requirements.md) | the hash-checked replay of the canonical evidence and the reading pages | EW |
| [`features/operational-workbench/`](features/operational-workbench/requirements.md) | the Tasks, Investigations and Engine views and the bounded operation service | OW |
| [`features/reliability-audit/`](features/reliability-audit/requirements.md) | the corrections of the operation analyzers, the run history and the deployment | RA |
| [`features/static-release/`](features/static-release/requirements.md) | packaging and installing the static release | SR |
| [`features/workspace-operation/`](features/workspace-operation/requirements.md) | the authenticated local workspace and its recovery | WO |
| [`features/base-0-08/`](features/base-0-08/requirements.md) | this release's changes: the routes and the landing, the executive view, the documentation areas, the contract catalog and readiness, the evidence import and the bilingual surfaces | BR |

Each folder holds `requirements.md`, `validation.md` and `design.md`.

## Where each part lives

| part | file | guard |
|---|---|---|
| research basis | `docs/design/SDD.md`, `Research basis` | `scripts/check_sdd.py` |
| executive view | `content/executive.json`, `docs/design/SDD.md`, `Executive brief` | `scripts/check_sdd.py`, the shell's gate |
| sizing summary, technology, resources | `docs/design/SDD.md`, `Sizing and contracts`, `Technology and versions`, `Resources` | `scripts/check_sdd.py`, `scripts/check_tech_matrix.py` |
| contracts, providers, states | `docs/contracts/catalog.md`, `docs/contracts/schemas/` | `scripts/check_contracts.py`, `scripts/check_skeleton.py`, `scripts/check_readiness.py` |
| contract versions and history | `docs/contracts/catalog.md` (`History`), `docs/contracts/versions.lock.json` | `scripts/check_contract_versions.py` |
| requirements | `docs/design/features/<feature>/requirements.md` | `scripts/check_sdd.py` |
| adversarial validation | `docs/design/features/<feature>/validation.md` | `scripts/check_sdd.py` |

## Changing a contract

Edit the schema, bump the version in the catalog by the semver rule (removed or renamed field, narrowed type or new required field: major; new
optional field: minor; description or example: patch), add the History row, then `python scripts/check_contract_versions.py --update` and
`python data-pipeline/run.py readiness`, and update both sides in the same pull request. The check fails on a schema that changed under the same
version, a version that went down, a lock that is not current, and a row without a History entry for its version.

## Known limits of the guards

- `check_sdd.py`, the executive view: the shell's schema is read from `frontend/node_modules`, so the check needs `npm ci` first and the
  `jsonschema` package; the acronym rule, whether a figure says what its source says, and what an illustration draws are the shell's gate and a
  reviewer's judgement.
- `check_tech_matrix.py`: it has no `--base`; it does not check that `resolved` in `frontend/package-lock.json` names the locked version.
- A gate that skips for lack of a tool counts as not run; the row names a second gate that runs without the tool, or says `local-only: <why>`.
