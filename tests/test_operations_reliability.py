import threading

import pytest

from app.services.operations import analyze, execute_operation, strict_json


def execute(tmp_path, files):
    result = execute_operation(tmp_path, "release", [{"path": p, "content": t} for p, t in files.items()])
    assert result["status"] == "succeeded", [(n["id"], n.get("error")) for n in result["nodes"]]
    assert result["artifacts"]["verify"]["passed"]
    return result


def test_extra_values_and_physical_lines_are_preserved(tmp_path):
    source = 'id,name\n1,"A\nB"\n2,C,extra\n\n3,\n4,D\n'
    result = execute(tmp_path, {"data.csv": source})
    output = result["artifacts"]["normalize"]["outputs"]["data.csv"]
    assert output["content"] == 'id,name\n1,"A\nB"\n4,D\n'
    assert [r["line"] for r in output["rejected"]] == [4, 6]
    assert [r["record"] for r in output["rejected"]] == [2, 3]
    assert output["rejected"][0]["extra_values"] == ["extra"]
    assert [f["line"] for f in result["findings"]] == [4, 6]


def test_rejected_references_propagate_through_multiple_tables(tmp_path):
    result = execute(
        tmp_path,
        {
            "customers.csv": "id,name\nC1,\nC2,Valid\n",
            "orders.csv": "id,customer_id\nO1,C1\nO2,C2\n",
            "payments.csv": "id,order_id\nP1,O1\nP2,O2\n",
        },
    )
    output = result["artifacts"]["normalize"]["outputs"]
    assert output["orders.csv"]["content"] == "id,customer_id\nO2,C2\n"
    assert output["payments.csv"]["content"] == "id,order_id\nP2,O2\n"
    assert [f["code"] for f in result["findings"]].count("unknown_reference") == 2


def test_table_namespaces_and_unchecked_references(tmp_path):
    result = execute(
        tmp_path,
        {
            "a/customers.csv": "id,name\nA,Alice\n",
            "b/customers.csv": "id,name\nB,Bob\n",
            "a/orders.csv": "id,customer_id\nO1,A\nO2,B\n",
            "orders.csv": "id,customer_id\nO3,A\n",
            "external.csv": "id,vendor_id\nX,V1\n",
        },
    )
    outputs = result["artifacts"]["normalize"]["outputs"]
    assert outputs["a/orders.csv"]["content"] == "id,customer_id\nO1,A\n"
    assert outputs["orders.csv"]["accepted_rows"] == 0
    assert {"ambiguous_reference", "unchecked_reference"} <= {f["code"] for f in result["findings"]}


@pytest.mark.parametrize("raw", ['{"x":1e999}', '{"x":-1e999}', '{"x":NaN}', '{"x":"\\ud800"}'])
def test_nonportable_json_is_rejected(raw):
    with pytest.raises(ValueError):
        strict_json(raw)


def test_independent_workflow_namespaces(tmp_path):
    content = '{"jobs":[{"id":"build"},{"id":"test","depends_on":["build"]}]}'
    result = execute(tmp_path, {"a/workflow.json": content, "b/workflow.json": content})
    assert result["findings"] == []
    assert result["artifacts"]["dependencies"]["job_count"] == 4


def test_warnings_require_attention(tmp_path):
    result = execute(tmp_path, {"release-manifest.json": "{}", "README.md": "Unlisted"})
    assert result["disposition"] == "attention_required"
    assert result["findings"][0]["severity"] == "warning"


def test_verifier_rejects_changed_quarantine_evidence(tmp_path):
    result = execute(tmp_path, {"data.csv": "id,name\n1,A,extra\n2,B\n"})
    artifacts = result["artifacts"]
    artifacts["normalize"]["outputs"]["data.csv"]["rejected"][0]["extra_values"] = ["tampered"]
    verified = analyze("verify", {"data.csv": "id,name\n1,A,extra\n2,B\n"}, artifacts, threading.Event())
    assert verified["passed"] is False


def test_cancel_after_report_remains_incomplete(tmp_path):
    cancel = threading.Event()
    result = execute_operation(
        tmp_path,
        "source",
        [{"path": "a.py", "content": "x=1\n"}],
        cancel=cancel,
        on_event=lambda e: (
            cancel.set() if e.get("kind") == "tool_finished" and e.get("node") == "report" else None
        ),
    )
    assert result["status"] == "cancelled"
    assert result["disposition"] == "incomplete"
