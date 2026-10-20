- Contract-first layer of ADR-0080 (template 0.08.002 with the `documents` column of 0.09.000): `docs/contracts/catalog.md` with one
  row per boundary (`episode-index`, `episode`, `lineage`, `research-summary`, `benchmark-adequacy`, `routing-study`,
  `semantic-transfer-index`, `semantic-transfer-report`, `operation-index`, `operation-run`, `operations-api`, `release-manifest`,
  `readiness`), each at 1.0.0 with its History row, a JSON Schema 2020-12 file per contract in `docs/contracts/schemas/` (nested
  events, decisions, candidates, receipts, aggregates and findings described to the depth the engine writes them), the OpenAPI
  document of the nine `/operations-api` routes, an example of each contract that has no committed document, and
  `versions.lock.json`. The four documents no code in this repository or in reflexmesh 0.1.2 writes (`research.json`,
  `benchmark-adequacy.json`, `semantic-routing-study/analysis.json`, `semantic-transfer/report.json`) are `active` rows served by a
  provider until their producers exist.
- Producer tests in `tests/contracts/`: every committed document, all 15,981 of them (the 15,936 episodes in parallel, about 15 s
  on 16 cores), validates against its schema; digests, identity, lineage binding and the audits' bindings to the indexes they
  name are asserted too. The same assertions run on the provider tree `docs/contracts/fixtures/data/` (the swap tests), which
  `python data-pipeline/fixtures.py` generates from the committed documents. Each route of `app/operations_api.py` is called through
  FastAPI's test client and each response, error statuses included, is validated against the OpenAPI document; a live and a
  cancelled run are validated against `operation-run`.
- `data/derived/readiness.json`, written by `python data-pipeline/run.py readiness` (`data-pipeline/core/readiness.py`, standard
  library only, no bake): what is real in a build, row by row, in one of six states, computed from the catalog and the committed
  documents. `scripts/check_readiness.py` fails when it is stale.
- Guards wired into CI: `check_contract_versions.py --base`, `check_contracts.py`, `check_readiness.py`, `check_skeleton.py` (exit 2
  allowed, an error on `main`) and `check_documents.py` on the provider tree. On the 15,981 committed documents the serial
  `check_documents.py` takes about three minutes, so it runs locally and through the parallel tests, not in CI.
- `app/operations_api.py` gains pydantic response models (`ConfigResponse`, `SessionResponse`, `FixtureResponse`, `RunSnapshot`,
  `RunHistory`, `DeletedResponse`) on its routes; the dicts it returns are unchanged. `jsonschema` 4.26.0 is pinned in
  `requirements-dev.txt` and `requirements-api.txt`, `openapi-spec-validator` 0.9.0 in `requirements-dev.txt`.
