# Event-response audit validation

Candidate: 0.02.021. The audit is a post-hoc diagnostic over existing frozen episodes, not a new confirmatory benchmark.

| requirement | adversarial check | gate |
| --- | --- | --- |
| ERA-001 | Delete target events from a trace and assert eligibility stays fixed while event exposure becomes zero. | `tests/test_event_response.py::test_adversarial_missing_event_exposure_remains_separate_from_task_failure` |
| ERA-002 | Simulate selected cancellation with a failed effect and assert selection and final verification differ. | `tests/test_event_response.py::test_adversarial_cancellation_intent_and_effect_completion_are_distinct` |
| ERA-003 | Corrupt a bound source/report and require the recomputation check to reject it. | `tests/test_event_response.py::test_adversarial_bound_report_recomputes_from_hashed_episodes` |
| ERA-004 | Supply an unsafe report path and require artifact loading to reject it. | `frontend/src/test/artifact-integrity.test.ts::adversarial: rejects absolute and escaping paths for separately hashed artifacts` |
| ERA-005 | Remove bilingual scope text or merge the audit denominator with core results and require the UI evidence test to fail. | `frontend/src/test/artifact-integrity.test.ts::adversarial: bilingual audit scope remains separate from the core denominator` |
