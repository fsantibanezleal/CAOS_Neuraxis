# Operational workbench validation

Candidate: 0.02.016. Native effects require the authenticated local or bounded hosted operations service; the static preview is not a native-effect test environment.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Reject unauthorized, oversized, malformed or cross-owner requests | Omit session authority, alter payload size, use another run id or submit invalid UTF-8 | `tests/test_operations_api.py` | API and ownership contract tests |
| Preserve actual effects and cancellation state | Cancel after dispatch and inspect receipts and files | `tests/test_operations.py`, `tests/test_operations_reliability.py` | Native operation fixtures and independent output checks |
| Keep Focus panels within the app's main landmark | Open Tasks and Investigations Focus on phone and desktop | `frontend/shell-gate.mjs --require-focus` | No nested-main or Focus availability findings; local API 502s remain an expected local-preview limitation |
| Declare registered task fixtures as loading until task data arrives | Walk `/app` through G7/G8 while its fixture is fetched | `frontend/shell-gate.mjs` | The task surface declares `data-state="loading"` during the fetch and reaches a stable settled state afterward |

The candidate changes frontend readiness signaling, not native effectors. Full live-service confirmation remains bound to the promoted static/service commit in the release receipt.
