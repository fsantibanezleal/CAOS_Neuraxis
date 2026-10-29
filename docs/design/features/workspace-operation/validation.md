# Workspace operation validation

Candidate: 0.02.014. Workspace authority is an authenticated local capability and is never included in static artifacts.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Require explicit session authentication at startup | Start without a token and request workspace configuration without a session | `tests/test_application.py`, `tests/test_operations_api.py` | Startup and API boundary tests |
| Bind a run to the reviewed preview and current workspace evidence | Change an input after preview, replay a preview token or submit a path escape | `frontend/verify-workspace.mjs`, `frontend/verify-recovery.mjs` | Preview consumption, file verification and recovery flows |
| Keep web distribution free of local authority | Inspect static manifest and query public API paths | `scripts/check_artifacts.py`, `scripts/verify_live_static.py` | Static release contains no local token; public workspace API remains disabled |

The static browser suite cannot demonstrate a user's local filesystem. Native workspace verification is performed only against a disposable local workspace with the installed engine.
