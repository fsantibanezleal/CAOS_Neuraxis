import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "data-pipeline"))

from pipeline.event_response import score_episode


def record(case_id, state, decision, *, success=False, violations=0):
    return {
        "run_id": f"M12-{case_id}-nominal-40000", "case_id": case_id,
        "method_id": "M12", "variant": "nominal", "seed": 40000,
        "events": [{"sequence": 1, "state": state}],
        "decisions": [decision] if decision else [],
        "metrics": {"task_success": int(success), "violations": violations},
    }


def test_adversarial_missing_event_exposure_remains_separate_from_task_failure():
    row = score_episode(record("C13", {"job_ready": 0}, None, success=False))
    assert row is not None
    assert row["event_observed"] is False
    assert row["response"] is None
    assert row["task_success"] is False


def test_adversarial_cancellation_intent_and_effect_completion_are_distinct():
    row = score_episode(record(
        "C07", {"cancel_requested": 1},
        {"sequence": 1, "action": "a-cancel", "status": "failed"},
        success=False, violations=0,
    ))
    assert row is not None
    assert row["response"] is True
    assert row["contract_invariants"] is True
    assert row["reverify"] is False


def test_crash_reconciliation_preserves_one_effect_and_keeps_failed_verification_visible():
    row = score_episode(record(
        "C20", {"write_unknown": 1, "crash_evidence": {"effect_count": 1, "effect_dispatched_during_recovery": False}},
        {"sequence": 1, "action": "a-reconcile", "status": "failed", "effect_observed": {}},
        success=False,
    ))
    assert row is not None
    assert row["response"] is True
    assert row["contract_invariants"] is True
    assert row["reverify"] is False


def test_adversarial_bound_report_recomputes_from_hashed_episodes():
    from scripts.check_event_responses import validate

    result = validate()
    assert result["eligible_episodes"] == 4320
    assert result["events_observed"] == 3915
    assert result["methods"] == 12
