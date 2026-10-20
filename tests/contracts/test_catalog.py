"""The catalog and its files: every schema file is a valid Draft 2020-12 schema with its own $id, the versions lock is
current, every file under docs/contracts is UTF-8 without a BOM and with LF line endings, and the guards that read the
catalog accept it."""
from __future__ import annotations

import subprocess
import sys

import contract_schemas as cs
from jsonschema import Draft202012Validator

sys.path.insert(0, str(cs.ROOT / "scripts"))
from check_contracts import check_text


def _rows():
    rows, problems = check_text((cs.CONTRACTS / "catalog.md").read_text(encoding="utf-8"), cs.ROOT)
    return rows, problems


def test_the_catalog_is_sound_and_has_the_thirteen_rows():
    rows, problems = _rows()
    assert problems == []
    assert [r["id"] for r in rows] == [
        "episode-index", "episode", "lineage", "research-summary", "benchmark-adequacy", "routing-study",
        "semantic-transfer-index", "semantic-transfer-report", "operation-index", "operation-run", "operations-api",
        "release-manifest", "readiness",
    ]
    assert {r["status"] for r in rows} == {"real"}  # every row has a producer of record since U3c


def test_every_schema_file_is_a_valid_schema_named_after_its_file():
    files = sorted(cs.SCHEMAS.glob("*.schema.json"))
    assert len(files) == 12  # the thirteenth contract is the OpenAPI document
    for path in files:
        schema = cs.load_json(path)
        Draft202012Validator.check_schema(schema)
        assert schema["$id"] == path.name, path.name
        assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
        assert schema["title"] and schema["description"], path.name


def test_the_rows_name_their_schema_files():
    rows, _ = _rows()
    for row in rows:
        assert (cs.ROOT / row["schema file"]).is_file(), row["id"]


def test_the_versions_lock_is_current():
    out = subprocess.run([sys.executable, str(cs.ROOT / "scripts" / "check_contract_versions.py")], capture_output=True, text=True, check=False)
    assert out.returncode == 0, out.stdout + out.stderr


def test_the_contract_files_are_utf8_without_bom_and_lf():
    for path in sorted(cs.CONTRACTS.rglob("*")):
        if path.is_file():
            raw = path.read_bytes()
            assert not raw.startswith(b"\xef\xbb\xbf"), path
            assert b"\r\n" not in raw, path
            raw.decode("utf-8")


def test_no_em_dash_or_emoji_in_the_contract_files():
    for path in sorted(cs.CONTRACTS.rglob("*.md")) + sorted(cs.SCHEMAS.glob("*.json")):
        text = path.read_text(encoding="utf-8")
        assert "\u2014" not in text and "\u2192" not in text, path
        assert not any(ord(c) > 0x1F000 for c in text), path
