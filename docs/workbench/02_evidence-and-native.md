# Evidence and native connection

## Canonical records

The application loads the canonical index, `data/derived/index.json` (served at `/data/index.json`), which references immutable episode JSON and measured aggregate results. Episode references include case, method, variant, seed, path, status and checksum. Episode provenance includes the execution lane, split, source and checkpoint lineage. The loader rejects absolute and parent-traversing artifact paths.

Canonical playback moves a cursor over saved observations. It never repeats a file write, process launch or network operation. Scenario parameters are locked because editing them would no longer describe the measured record. To change native execution, start a new run with a new run identity.

The Benchmark page renders measured method comparisons, per-variant success, confidence calibration, coarse risk-coverage derived from reported bin counts, action confusion and provenance. Calibration and confusion use their declared demonstration-agreement target. No target is silently promoted to a software safety probability. Missing evidence remains unavailable rather than being estimated from literature.

## Native service

Serve the compiled frontend from the local reflexmesh service. The browser calls only that origin. `GET /api/config` reports local capability metadata. The Evidence control group accepts the bearer token; it remains in memory and is never put in a URL, artifact or persistent storage. Executable endpoints require `Authorization: Bearer <token>`.

`POST /api/run` starts the selected registered disposable workload. The request includes case, method, variant, seed and the API-supported bounded `max_steps` parameter. Browser-only latency, reliability and noise controls are not sent to the native service. The current service is a workload runner, not an unrestricted workstation shell.

`GET /api/events?run_id=...&after=...` returns new event/decision records and current status. The first sequence cursor is zero. Completed runs include the final episode and resource evidence. `POST /api/cancel/{id}` requests cancellation. A cancelling status is not terminal until the service observes termination or completion; already committed effects remain recorded.

## Import and export

Export saves the current episode with parameters, resource evidence and provenance. Review it for sensitive content before sharing. Import accepts a bounded JSON file with a valid episode shape. Imported content is treated as untrusted data and never dispatched as instructions. Origin authenticity is not inferred merely because a record parses successfully.

The API also exposes `/api/replay` for bounded server-side validation without effects. Browser replay remains usable without an API connection. Static hosting publishes browser simulation and canonical evidence; it does not expose local native authority.

## Reproducibility

A seed controls the virtual environment, not CPU scheduling or model-provider nondeterminism. Reproduce native results with the recorded package versions, model hashes, environment specification and split. Report cold/warm latency, machine and sample count with percentile values. A checksum identifies content; it does not establish scientific correctness.

![Runtime and artifact records](../../frontend/public/svg/tech/05-data-contracts.svg)
