# Measured resources of Neuraxis

The evidence behind the numbers that [`SDD.md`](SDD.md) states in its Resources section. Measured on 2026-10-20 on the development
workstation (Windows 11 10.0.26300, Intel Core i9-14900HX, Python 3.12.15 in the venv `neuraxis-base`, Node v24.14.1, npm 11.11.0), in a
worktree at commit `1cf3060` plus this unit's documentation changes (none of which any measured command reads). Sizes are bytes of file content.
The peak is `PeakJobMemoryUsed` of a Windows job object that holds the measured command and every process it starts: the largest sum of
committed memory over the job's processes, which is not the working set and is larger than it. The processes counted are every process
started in the job (`TotalProcesses`). The measuring script was a throwaway of the unit and is not part of the product; it assigned the
command's first process to the job right after the start, so a child created in that first instant is not counted.

## Stored size

Computed with a walk of the tree (`os.walk` and `os.path.getsize`):

| tree | files | bytes |
|---|---|---|
| `data/derived` (the committed evidence) | 15,947 | 367,501,655 |
| `data/operations` (the recorded operation runs) | 37 | 6,449,678 |
| `frontend/public/data` (the copy of `data/derived` made by the build) | 15,947 | 367,501,655 |
| `frontend/dist` (the built site) | 16,056 | 376,318,835 |
| `frontend/node_modules` | 8,282 | 165,525,550 |

## Commands and results

```
$ python data-pipeline/run.py readiness
{"readiness": "data/derived/readiness.json", "bytes": 2054, "states": ["available", "missing"]}
MEASURE exit=0 wall_s=0.5 peak_job_commit_mb=27 processes=2
```

The file is rewritten from the catalog and the repository with the standard library only; `git status` after the run shows no change, so
the committed readiness document is current.

```
$ python scripts/check_artifacts.py
{"episodes": 14400, "cells": 1440, "methods": 12, "cases": 20, "minimum_seeds": 10}
MEASURE exit=0 wall_s=7.2 peak_job_commit_mb=35 processes=2
```

Read with the operating system's file cache warm (a second reading of the tree); the sizing (`plans/system-one/sizing.md`, machine limits)
records about 160 seconds for the same check on a cold cache. The cold time was not re-measured here.

```
$ python -m pytest -q -p no:cacheprovider
(166 tests collected; exit 0; the progress line shows 6 skipped, the rest passed)
MEASURE exit=0 wall_s=134.1 peak_job_commit_mb=392 processes=80
```

The suite includes the 87 contract tests of `tests/contracts`, which read the 15,981 committed documents and the provider tree.

```
$ npm ci --cache D:/_Temp/npm-cache        (in frontend/, the cache warm)
added 96 packages, and audited 97 packages in 18s
MEASURE exit=0 wall_s=18.5 peak_job_commit_mb=363 processes=4

$ npm run build                            (generator --check, copy-data, tsc --noEmit, vite build)
built in 11.47s
MEASURE exit=0 wall_s=26.3 peak_job_commit_mb=971 processes=13

$ npm test                                 (vitest run)
Test Files  17 passed (17); Tests  156 passed (156)
MEASURE exit=0 wall_s=2.6 peak_job_commit_mb=1113 processes=26
```

## Deploy figures taken from the committed records

Not re-measured here, because the deploy runs on the ML host with an operator key:

- The operation service on the host, after the browser checks of release 0.02.000: `MemoryPeak=50360320` bytes against `MemoryMax=536870912`
  (`docs/validation/0.02.000/service-environment.txt`, `docs/validation/0.02.000/live-release.json`).
- The unit file sets `MemoryMax=512M`, `CPUQuota=100%` and `TasksMax=32` (`deploy/neuraxis-operations.service`).
- The static release of 0.02.006 lists 16,059 manifest files (`docs/validation/0.02.006/release.json`, `live-static.json`).
- The time of a static deploy was not recorded in any committed file the unit read.

## Not measured

The engine's training and evaluation stages (`collect`, `train`, `ppo`, `gates`, `evaluate`) and `run.py export` need the engine's workspace
(`data/cache/science`), which is not present in this checkout and is not rebuilt for a design document. The browser gate (`npm run gate`)
was not run. The memory and time of `import-evidence` were not measured (it needs the network or an engine checkout at the pinned commit).
