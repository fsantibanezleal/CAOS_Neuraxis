- Producers of record for the four committed evidence documents that had none (research summary, benchmark adequacy, semantic-routing
  study, semantic-transfer report): `python data-pipeline/run.py import-evidence` reads each from reflexmesh tag v0.01.002 (commit
  447cc08), verifies the full SHA-256 against `docs/contracts/evidence-provenance.json`, validates it against its schema and writes
  it, online or with `--offline <engine checkout>`. A release operation, never run in CI; CI compares the committed digests offline.
- The four catalog rows are `real` (owner: the import stage, with the engine script as upstream producer); readiness and the provider
  tree are regenerated; `check_skeleton.py` exits 0.
- Every writer validates before it writes: `run.py export` (index and lineage) and `scripts/evaluate_operations.py` (operation runs
  and index) refuse a document that departs from its schema and name the field path (`data-pipeline/core/validation.py`).
