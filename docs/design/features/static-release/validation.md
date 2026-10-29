# Static release validation

Candidate: 0.02.016. A release is source-bound only after the frontend build, evidence validators, package manifest and deployment receipt all identify the same commit.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Verify source and artifact digests before packaging | Change an episode or use an incomplete index | `scripts/package_static.py` | Validates core, transfer, routing and operation evidence before hashing the build |
| Reject unsafe archive paths and corruption | Plant traversal paths, undeclared entries or a bad digest | `tests/test_static_deploy.py` | Archive installer rejects before activation |
| Serve missing paths as 404 while preserving extensionless routes | Probe a missing `.json` and a direct science route | `frontend/shell-gate.mjs`, `scripts/verify_live_static.py` | Local preview has SPA fallback; production evidence must use the deployed nginx endpoint |

The 0.02.013 candidate is not called deployed until the exact archive has been installed and its release manifest and live route behavior have been fetched from the public origin.
