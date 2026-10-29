# Reliability audit validation

Candidate: 0.02.014. This feature reports failures and unknown outcomes as observed and preserves reproducible provenance.

| Requirement | Adversarial check | Gate | Evidence |
|---|---|---|---|
| Do not pass malformed or non-finite inputs | Plant invalid encodings, duplicate identifiers, non-finite values and bad references | `tests/test_operations_reliability.py` | Reliability API and source-analysis test group |
| Preserve cancellation, partial effects and unknown outcomes | Interrupt a run after effect dispatch and reconcile from current evidence | `tests/test_operations_reliability.py`, `tests/test_storage.py` | Journal and retained-run tests |
| Keep release evidence reproducible | Alter one source artifact, digest or result identity | `scripts/check_artifacts.py`, `scripts/check_operations.py` | Canonical and operation studies validate every indexed digest |

The public status is based on source and stored evidence. Tests that require the installed native engine or a live host are reported separately in the deployment receipt.
