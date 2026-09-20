# Deployment boundaries

The public workbench is static: built frontend plus checked canonical data. It provides bounded browser execution, scientific inspection and replay. The authenticated native execution service runs locally with registered workloads and explicitly configured checkpoints/model. Do not expose the local bearer service as a public multi-tenant agent host.

The selected target is the dedicated nginx static host `neuraxis.ml.fasl-work.com`. The private app repository does not use GitHub Pages. The release workflow verifies the complete artifact matrix and builds a content-hashed archive from `main`; its artifact is then deployed with `python scripts/deploy_static.py --archive dist/neuraxis-static.tar.gz --identity /path/to/operator/ssh/key`. The SSH key remains with the operator, outside the app and CI. No deployment runs training, changes benchmark results or needs model credentials.

`scripts/package_static.py` enumerates every static file and its SHA256 in `release.json`. The server installer rejects archive links, traversal, duplicate members, missing evidence and digest mismatches, then atomically switches `current` to an immutable release folder. Prior releases remain available for explicit rollback. Initial host setup installs `neuraxis.nginx` and obtains a hostname-specific TLS certificate; the final served commit is visible at `/release.json`. The backend is never deployed with the static archive.

Before release, verify in-app navigation and bookmarked routes, canonical hydration, actual method/case/variant coverage, both languages/themes and phone/desktop containment. HTTP 200 and a build alone do not establish a working deployment. TLS must be checked with the actual hostname/SNI.
