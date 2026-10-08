"""Exercise hosted native work, export bytes, ownership and deletion over HTTPS."""

import argparse
import io
import json
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from reflexmesh import __version__ as engine_version


def verify(base, commit):
    def request(path, body=None, token=None, method=None):
        headers = {"Content-Type": "application/json", "X-Neuraxis-Client": "operations-v1"}
        if token:
            headers["Authorization"] = "Bearer " + token
        req = urllib.request.Request(
            base.rstrip("/") + path,
            data=json.dumps(body).encode() if body is not None else None,
            headers=headers,
            method=method or ("POST" if body is not None else "GET"),
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                raw = response.read()
                return response.status, json.loads(raw) if "json" in response.headers.get(
                    "Content-Type", ""
                ) else raw
        except urllib.error.HTTPError as error:
            return error.code, error.read()

    status, release = request("/release.json")
    assert status == 200 and release["commit"] == commit
    assert release["operation_coverage"]["runs"] == 36
    assert request("/api/config")[0] == 404
    assert request("/operations-api/config")[1]["engine"] == f"reflexmesh {engine_version}"
    assert request("/operations-api/config")[1]["commit"] == commit
    owner = request("/operations-api/session", {})[1]["token"]
    other = request("/operations-api/session", {})[1]["token"]
    results = []
    inputs = [
        {"path": "supplied.json", "content": "{broken"},
        {"path": "records.csv", "content": "id,name\n1,A\n1,B\n2,\n"},
    ]
    for body, findings in [
        ({"task": "release", "variant": "compound", "seed": 29}, 10),
        ({"task": "release", "files": inputs}, 3),
    ]:
        status, started = request("/operations-api/runs", body, owner)
        assert status == 200, (status, started)
        path = "/operations-api/runs/" + started["id"]
        try:
            assert request(path, token=other)[0] == 404
            assert request(path + "/export", token=other)[0] == 404
            deadline = time.monotonic() + 65
            while time.monotonic() < deadline:
                status, snapshot = request(path, token=owner)
                assert status == 200
                if snapshot["status"] in {"succeeded", "failed", "cancelled"}:
                    break
                time.sleep(0.3)
            assert snapshot["status"] == "succeeded", snapshot.get("error")
            result = snapshot["result"]
            assert result["engine"] == f"reflexmesh {engine_version} native authority"
            assert result["disposition"] == "attention_required"
            assert len(result["findings"]) == findings
            assert result["metrics"]["native_receipts"] == 9
            assert result["artifacts"]["verify"]["passed"]
            status, raw = request(path + "/export", token=owner)
            assert status == 200
            with zipfile.ZipFile(io.BytesIO(raw)) as archive:
                exported = json.loads(archive.read("execution.json"))
                assert exported["result"]["input_sha256"] == result["input_sha256"]
                if "files" in body:
                    assert archive.read("accepted/records.csv") == b"id,name\n1,A\n"
                    assert archive.read("input/supplied.json") == b"{broken"
            results.append(
                {
                    "task": body["task"],
                    "uploaded": "files" in body,
                    "findings": findings,
                    "metrics": result["metrics"],
                    "export_verified": True,
                    "other_session_rejected": True,
                }
            )
        finally:
            assert request(path, token=owner, method="DELETE")[0] == 200
            assert request(path, token=owner)[0] == 404
    return {
        "base": base,
        "commit": commit,
        "version": release["version"],
        "public_workspace_status": 404,
        "runs": results,
        "deleted": True,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="https://neuraxis.ml.fasl-work.com")
    parser.add_argument("--commit", required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = json.dumps(verify(args.base, args.commit), indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result + "\n", encoding="utf8")
    print(result)
