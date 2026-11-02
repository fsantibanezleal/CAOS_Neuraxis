# Event-response audit requirements

The Benchmark route adds an independently labeled audit of event responses over the frozen test episodes. It preserves the core benchmark denominator and does not present post-hoc scores as confirmatory or as proof of a superior method.

| ID | Requirement | Validation evidence |
| --- | --- | --- |
| ERA-001 | Each eligible test episode SHALL remain in the denominator whether or not its policy-visible target event occurred. | `scripts/check_event_responses.py` reproduces all 4,320 episode records and counts 3,915 observed events. |
| ERA-002 | The audit SHALL report required action selection, event-specific invariants, final verifier success and policy violations as distinct fields. | `tests/test_event_response.py::test_adversarial_cancellation_intent_and_effect_completion_are_distinct`. |
| ERA-003 | Every source episode SHALL be bound by a content digest; the aggregate report SHALL be checked before browser rendering. | `tests/test_event_response.py::test_adversarial_bound_report_recomputes_from_hashed_episodes`. |
| ERA-004 | Missing or changed evidence SHALL be hidden and reported unavailable; no stale result may be shown as current. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects absolute and escaping paths for separately hashed artifacts`. |
| ERA-005 | The audit SHALL disclose post-hoc status, fixture limits and separation from the canonical core total in both languages. | `frontend/src/test/artifact-integrity.test.ts::adversarial: bilingual audit scope remains separate from the core denominator`. |
