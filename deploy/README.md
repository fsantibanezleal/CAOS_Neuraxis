# Deployment boundaries

The public frontend and checked scientific data are static. A separate fixed-tool service runs source/configuration audits, CSV reconciliation and release-integrity checks; it produces session-owned findings and downloadable outputs. The authenticated native execution service runs locally with registered workloads and explicitly configured checkpoints/model. Do not expose the local bearer service as a public multi-tenant agent host.

The selected target is the dedicated nginx static host `neuraxis.ml.fasl-work.com`. The private app repository does not use GitHub Pages. The release workflow verifies the complete artifact matrix and builds a content-hashed archive from `main`; its artifact is then deployed with `python scripts/deploy_static.py --archive dist/neuraxis-static.tar.gz --identity /path/to/operator/ssh/key`. The SSH key remains with the operator, outside the app and CI. No deployment runs training, changes benchmark results or needs model credentials.

`scripts/package_static.py` enumerates every static file and its SHA256 in `release.json`. The server installer rejects archive links, traversal, duplicate members, missing evidence and digest mismatches, then atomically switches `current` to an immutable release folder. Prior releases remain available for explicit rollback. Initial host setup installs `neuraxis.nginx` and obtains a hostname-specific TLS certificate; the final served commit is visible at `/release.json`. The backend is never deployed with the static archive.

Before release, verify in-app navigation and bookmarked routes, canonical hydration, actual method/case/variant coverage, both languages/themes and phone/desktop containment. HTTP 200 and a build alone do not establish a working deployment. TLS must be checked with the actual hostname/SNI.


## Bounded operation service

After validated sources are committed, run `python scripts/deploy_operations.py
--identity /path/to/operator/ssh/key` (one command). The installer accepts only its
seven explicitly named regular files, checks the archive digest and source commit,
installs the published `reflexmesh[server]==0.1.2`, and runs under the dedicated
`neuraxis-operations` account. Code and venv are read-only to the service. Only
`/var/lib/neuraxis-operations` is persistent writable state.

The unit binds loopback port 8174, uses one worker, 512 MiB MemoryMax, 100% CPUQuota
and 32 TasksMax. The application bounds concurrency (2), retained runs (24), input
size (1 MiB), files (256), starts (20/minute), sessions (128) and retention (1 hour).
Nginx exposes `/operations-api/` on the existing TLS hostname after a service health
check, with a 2 MiB request bound. `/api/` remains unavailable publicly. Failure
restores the previous service link and hostname configuration. Static release and
service bundles carry the same committed source identity but install separately.

Run real uploaded-file and owned-compound tasks after installation, check the ZIP
contents, verify cross-session reads are rejected, and delete the QA runs. Inspect
`systemctl show neuraxis-operations -p MemoryPeak -p MemoryCurrent -p CPUUsageNSec`
and disk usage after the workload. A health response alone is insufficient.
