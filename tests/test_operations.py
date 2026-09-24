import threading

import pytest

from app.services.operations import digest, execute_operation, fixture, validate_files


@pytest.mark.parametrize("task", ["release", "source", "data"])
def test_native_operation_outputs(tmp_path, task):
    supplied = fixture(task, "compound", 17)
    result = execute_operation(tmp_path, task, supplied)
    assert result["status"] == "succeeded"
    assert result["disposition"] == "attention_required"
    assert result["metrics"]["native_receipts"] == len(result["nodes"])
    assert result["artifacts"]["verify"]["passed"]
    assert all(n["state"] == "succeeded" for n in result["nodes"])
    for item in supplied:
        assert (tmp_path / "input" / item["path"]).read_bytes() == item["content"].encode()
    codes = {f["code"] for f in result["findings"]}
    assert "digest_mismatch" in codes
    if task != "data":
        assert "invalid_syntax" in codes and "blocked_dependency_graph" in codes
    if task != "source":
        assert {"duplicate_id", "unknown_reference", "missing_or_extra_value"} <= codes
        rows = result["artifacts"]["normalize"]["outputs"]["data/orders.csv"]
        assert rows["accepted_rows"] == 320
        assert rows["rejected_rows"] == 3
    assert result["metrics"]["model_calls"] == 0


def test_uploaded_source_is_data(tmp_path):
    target = tmp_path / "must-not-exist"
    content = f"from pathlib import Path\r\nPath({str(target)!r}).write_text('executed')\r\n"
    result = execute_operation(
        tmp_path,
        "source",
        [{"path": "untrusted.py", "content": content}, {"path": "bad.json", "content": "{broken"}],
    )
    assert not target.exists()
    assert result["artifacts"]["manifest"]["files"]["untrusted.py"] == digest(content.encode())
    assert result["findings"][0]["path"] == "bad.json"
    assert result["artifacts"]["verify"]["passed"]


def test_cancel_preserves_evidence(tmp_path):
    stop = threading.Event()

    def on_event(event):
        if event["kind"] == "tool_finished":
            stop.set()

    result = execute_operation(tmp_path, "release", fixture(), cancel=stop, on_event=on_event)
    assert result["status"] == "cancelled"
    assert result["metrics"]["native_receipts"] >= 1
    assert result["metrics"]["verified_nodes"] < len(result["nodes"])
    assert (tmp_path / "output" / "inventory.json").exists()
    assert result["disposition"] == "incomplete"


@pytest.mark.parametrize(
    "path",
    [
        "../outside",
        "/absolute",
        "C:/escape",
        "a/../../outside",
        ".reflexmesh/journal",
        "a\\b",
        "CON.txt",
        "a./file",
        "a//file",
    ],
)
def test_path_rejection(path):
    with pytest.raises(ValueError):
        validate_files([{"path": path, "content": "data"}])


def test_duplicate_keys_and_values_reported(tmp_path):
    files = [
        {"path": "settings.json", "content": '{"x":1,"x":2}'},
        {"path": "table.csv", "content": "id,name\n1,A\n1,B\n2,\n"},
    ]
    result = execute_operation(tmp_path, "release", files)
    assert {"invalid_syntax", "duplicate_id", "missing_or_extra_value"} <= {
        f["code"] for f in result["findings"]
    }
    assert result["artifacts"]["normalize"]["outputs"]["table.csv"]["accepted_rows"] == 1


def test_clean_delivery_checks_pass(tmp_path):
    result = execute_operation(tmp_path, "release", fixture(variant="clean"))
    assert result["status"] == "succeeded"
    assert result["disposition"] == "checks_passed"
    assert result["findings"] == []
    assert len(result["artifacts"]["integrity"]["checks"]) == 53


def test_duplicate_and_parent_paths_rejected():
    for paths in [("A.txt", "a.txt"), ("directory", "directory/file.txt")]:
        with pytest.raises(ValueError):
            validate_files([{"path": p, "content": ""} for p in paths])
