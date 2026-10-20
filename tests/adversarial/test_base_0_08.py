"""Plants for the base-0-08 feature (BR): one planted defect per requirement of ``docs/design/features/base-0-08`` that has a
Python gate. The other 22 requirements are web gates (``frontend/src/adversarial/base-0-08.test.ts``) or existing tests.

The guard rows (BR-004, BR-008, BR-011, BR-030, BR-034, BR-035) plant the defect in a throwaway copy of the files the guard reads
and run the real guard on it. The committed tree is not always clean for every guard (a version literal in a test of the evidence
provenance, a stale source digest of the operation corpus), so a guard test compares the findings of the copy before and after
its plant: what the plant adds must name what was planted, and the clean copy must not name it. The writer rows (BR-028, BR-029)
feed hostile documents to the real import and the real writers and assert the refusal and that nothing was written."""
from __future__ import annotations

import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from planting import ROOT, add_gate_module, edit, guard

NODE = shutil.which("node")
needs_frontend = pytest.mark.skipif(
    NODE is None or not (ROOT / "frontend" / "node_modules" / "openapi-typescript").is_dir(),
    reason="needs node and `npm ci` in frontend/",
)
EXEC = "content/executive.json"
PUBLIC = "frontend/public"
# a product version literal is X.XX.XXX; written in two parts so that this file holds none in code (BR-004's own guard scans tests/)
LITERAL = "9.99" + ".999"


def new_lines(clean: str, planted: str) -> str:
    """The lines a planted run adds to the clean run's output, as one text."""
    seen = set(clean.splitlines())
    return "\n".join(line for line in planted.splitlines() if line not in seen)


def findings(repo: Path, script: str, *args: str) -> tuple[int, str]:
    r = guard(repo, script, *args)
    return r.returncode, r.stdout + r.stderr


def test_adversarial_a_version_literal_in_code_fails_the_coherence_check(repo: Path) -> None:
    code, clean = findings(repo, "check_version_coherence.py")
    assert "app/config.py" not in clean and "planted_version.ts" not in clean, clean
    edit(repo, "app/config.py", 'ARTIFACTS = ROOT / "data" / "derived"', f'ARTIFACTS = ROOT / "data" / "derived"\nPLANTED_VERSION = "{LITERAL}"')
    (repo / "frontend" / "src" / "planted_version.ts").write_text(f'export const plantedVersion = "{LITERAL}";\n', encoding="utf-8")
    code, planted = findings(repo, "check_version_coherence.py")
    added = new_lines(clean, planted)
    assert code == 1, planted
    assert re.search(r"app/config\.py:\d+: a version literal in code; read VERSION instead", added), added
    assert re.search(r"frontend/src/planted_version\.ts:1: a version literal in code", added), added
    # a literal in a comment or a docstring is history, not a source: the guard does not name it
    (repo / "app" / "config.py").write_text("# once " + LITERAL + "\n" + (repo / "app" / "config.py").read_text(encoding="utf-8"), encoding="utf-8")
    edit(repo, "app/config.py", f'PLANTED_VERSION = "{LITERAL}"', "PLANTED_VERSION = None")
    (repo / "frontend" / "src" / "planted_version.ts").unlink()
    code, history = findings(repo, "check_version_coherence.py")
    assert "app/config.py" not in new_lines(clean, history), history


def load_executive(repo: Path) -> dict:
    return json.loads((repo / EXEC).read_text(encoding="utf-8"))


def save_executive(repo: Path, data: dict) -> None:
    (repo / EXEC).write_bytes((json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))


def test_adversarial_a_planted_defect_in_the_executive_file_fails_check_sdd(repo: Path) -> None:
    _, clean = findings(repo, "check_sdd.py")
    assert EXEC not in clean, "the committed executive file is accepted by the guard"
    # a fifth C: the schema allows exactly four rows
    data = load_executive(repo)
    data["proposal"]["four_cs"].append(dict(data["proposal"]["four_cs"][0]))
    save_executive(repo, data)
    code, planted = findings(repo, "check_sdd.py")
    assert code == 1 and "proposal.four_cs" in new_lines(clean, planted), planted
    # the content rules read a structurally sound file: an over-long sentence, weights that add to 110, an uncited source
    data = load_executive(repo)
    data["proposal"]["four_cs"].pop()
    data["pain"]["key_message"]["en"] = " ".join(["words"] * 31) + "."
    data["pain"]["causes"][0]["weight"] += 10
    data["sources"].append({"id": "planted-orphan", "title": {"en": "A report nobody cites.", "es": "Un informe que nadie cita."},
                            "url": "https://example.org/report"})
    save_executive(repo, data)
    code, planted = findings(repo, "check_sdd.py")
    added = new_lines(clean, planted)
    assert code == 1, planted
    assert "pain.key_message.en: a sentence of 31 words; the limit is 30" in added, added
    assert "pain.causes: the weights add to 110 percent" in added, added
    assert f"sources[{len(data['sources']) - 1}].id" in added and "planted-orphan" in added and "is cited by no figure" in added, added


ANIMATED = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><style>.a{animation:fade @@SECONDS@@s ease-in-out infinite}'
            '@keyframes fade{0%{opacity:0}100%{opacity:1}}@@REDUCED@@</style><rect class="a" x="0" y="0" width="10" height="10" '
            'fill="var(--color-fg)"/></svg>')
REDUCED = "@media (prefers-reduced-motion: reduce){.a{animation:none;opacity:1}}"


def test_adversarial_an_animation_without_reduced_motion_fails_the_svg_check(repo: Path) -> None:
    add_gate_module(repo)
    clean = guard(repo, "check_svg_animation.py", ok_marker="check_svg_animation: OK")
    assert clean.returncode == 0 and "check_svg_animation: OK" in clean.stdout, clean.stdout
    (repo / PUBLIC / "planted-good.svg").write_text(ANIMATED.replace("@@SECONDS@@", "4").replace("@@REDUCED@@", REDUCED), encoding="utf-8")
    good = guard(repo, "check_svg_animation.py")
    assert good.returncode == 0 and "planted-good.svg" not in good.stdout, good.stdout
    (repo / PUBLIC / "planted-bare.svg").write_text(ANIMATED.replace("@@SECONDS@@", "4").replace("@@REDUCED@@", ""), encoding="utf-8")
    bare = guard(repo, "check_svg_animation.py")
    assert bare.returncode == 1 and "planted-bare.svg" in bare.stdout and "prefers-reduced-motion" in bare.stdout, bare.stdout
    assert "planted-slow.svg" not in bare.stdout
    (repo / PUBLIC / "planted-slow.svg").write_text(ANIMATED.replace("@@SECONDS@@", "12").replace("@@REDUCED@@", REDUCED), encoding="utf-8")
    slow = guard(repo, "check_svg_animation.py")
    assert slow.returncode == 1 and "planted-slow.svg" in slow.stdout and "limit is 10 s" in slow.stdout, slow.stdout


def load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def evidence_module(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "data-pipeline"))
    from core import evidence

    return evidence


def test_adversarial_a_tampered_digest_stops_the_import_and_writes_nothing(monkeypatch, tmp_path: Path) -> None:
    evidence = evidence_module(monkeypatch)
    provenance = ROOT / "docs" / "contracts" / "evidence-provenance.json"
    documents = json.loads(provenance.read_text(encoding="utf-8"))
    true_bytes = {e["engine_path"]: (ROOT / e["neuraxis_path"]).read_bytes() for e in documents["documents"]}

    def read(contents):
        return lambda entry: contents[entry["engine_path"]]

    clean = tmp_path / "clean"
    assert evidence.import_evidence(provenance, clean, read(true_bytes))["documents"] == 4
    assert all((clean / e["neuraxis_path"]).read_bytes() == true_bytes[e["engine_path"]] for e in documents["documents"])
    # a provenance digest is tampered
    tampered = json.loads(provenance.read_text(encoding="utf-8"))
    tampered["documents"][2]["sha256"] = "0" * 64
    copy = tmp_path / "provenance.json"
    copy.write_text(json.dumps(tampered), encoding="utf-8")
    out = tmp_path / "tampered-out"
    with pytest.raises(ValueError, match=r"semantic-routing-study/analysis\.json.*digest"):
        evidence.import_evidence(copy, out, read(true_bytes))
    assert not out.exists(), "a tampered digest left files behind"
    # the engine bytes are changed, the last document of the four: nothing is written for the first three either
    changed = dict(true_bytes)
    last = documents["documents"][-1]["engine_path"]
    changed[last] = changed[last] + b" "
    out = tmp_path / "changed-out"
    with pytest.raises(ValueError, match="digest"):
        evidence.import_evidence(provenance, out, read(changed))
    assert not out.exists(), "changed engine bytes left files behind"


def test_adversarial_the_writers_refuse_a_broken_document_and_write_nothing(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.syspath_prepend(str(ROOT / "data-pipeline"))
    monkeypatch.syspath_prepend(str(ROOT / "scripts"))
    run_module = load("neuraxis_run_under_plant", ROOT / "data-pipeline" / "run.py")
    monkeypatch.setattr(run_module, "_load_checks", lambda: type("NoChecks", (), {"validate": staticmethod(lambda source: {})}))
    index = json.loads((ROOT / "data" / "derived" / "index.json").read_bytes())
    lineage = json.loads((ROOT / "data" / "derived" / "lineage.json").read_bytes())

    def source(name: str, mutate) -> Path:
        directory = tmp_path / name
        directory.mkdir()
        i, lin = json.loads(json.dumps(index)), json.loads(json.dumps(lineage))
        mutate(i, lin)
        (directory / "index.json").write_text(json.dumps(i), encoding="utf-8")
        (directory / "lineage.json").write_text(json.dumps(lin), encoding="utf-8")
        return directory

    # a broken index and a broken lineage are fed to the export writer
    out = tmp_path / "export-index"
    with pytest.raises(ValueError, match=r"index\.json.*generated_at"):
        run_module.export(source("src-index", lambda i, lin: i.pop("generated_at")), out)
    assert not out.exists()
    out = tmp_path / "export-lineage"
    with pytest.raises(ValueError, match=r"lineage\.json.*source_sha256"):
        run_module.export(source("src-lineage", lambda i, lin: lin.pop("source_sha256")), out)
    assert not out.exists()
    # a broken run and a broken operation index are fed to the operation writer
    ops = load("neuraxis_evaluate_under_plant", ROOT / "scripts" / "evaluate_operations.py")
    first = next(iter(ops.TASKS))
    monkeypatch.setattr(ops, "TASKS", {first: ops.TASKS[first]})
    monkeypatch.setattr(ops, "VARIANTS", ops.VARIANTS[:1])
    recorded = json.loads((ROOT / "data" / "operations" / f"{first}-{ops.VARIANTS[0]}-70000.json").read_bytes())
    broken = {k: v for k, v in recorded.items() if k != "disposition"}
    monkeypatch.setattr(ops, "fixture", lambda *a, **k: [])
    monkeypatch.setattr(ops, "execute_operation", lambda *a, **k: json.loads(json.dumps(broken)))
    monkeypatch.setattr(sys, "argv", ["evaluate_operations.py", "--seeds", "1", "--output", str(tmp_path / "ops-run")])
    with pytest.raises(ValueError, match=r"operation-run.*disposition"):
        ops.main()
    assert not list((tmp_path / "ops-run").glob("*.json")), "a broken run was written"
    monkeypatch.setattr(ops, "execute_operation", lambda *a, **k: json.loads(json.dumps(recorded)))
    monkeypatch.setattr(ops.platform, "platform", lambda: 17)  # an index whose platform is not a string
    monkeypatch.setattr(sys, "argv", ["evaluate_operations.py", "--seeds", "1", "--output", str(tmp_path / "ops-index")])
    with pytest.raises(ValueError, match=r"operation-index"):
        ops.main()
    assert not (tmp_path / "ops-index" / "index.json").exists(), "a broken operation index was written"


@needs_frontend
def test_adversarial_a_schema_change_without_regenerated_types_fails_the_build_check(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    (repo / "frontend" / "scripts").mkdir(parents=True)
    (repo / "frontend" / "src" / "lib").mkdir(parents=True)
    shutil.copytree(ROOT / "docs" / "contracts", repo / "docs" / "contracts", ignore=shutil.ignore_patterns("fixtures", "examples"))
    shutil.copy2(ROOT / "frontend" / "src" / "lib" / "contract.gen.ts", repo / "frontend" / "src" / "lib" / "contract.gen.ts")
    # the copy resolves the generator's one dependency from the installed frontend, by file URL
    resolved = subprocess.run([NODE, "--input-type=module", "-e", "console.log(import.meta.resolve('openapi-typescript'))"],
                              cwd=ROOT / "frontend", capture_output=True, encoding="utf-8", check=True).stdout.strip()
    script = (ROOT / "frontend" / "scripts" / "gen-contract-types.mjs").read_text(encoding="utf-8")
    assert "from 'openapi-typescript'" in script
    (repo / "frontend" / "scripts" / "gen-contract-types.mjs").write_text(script.replace("from 'openapi-typescript'", f"from '{resolved}'"), encoding="utf-8")

    def check() -> subprocess.CompletedProcess:
        return subprocess.run([NODE, "scripts/gen-contract-types.mjs", "--check"], cwd=repo / "frontend", capture_output=True,
                              encoding="utf-8", errors="replace", timeout=120)

    clean = check()
    assert clean.returncode == 0 and "contract types: current" in clean.stdout, clean.stdout + clean.stderr
    schema = repo / "docs" / "contracts" / "schemas" / "readiness.schema.json"
    document = json.loads(schema.read_text(encoding="utf-8"))
    document["properties"]["planted_property"] = {"type": "string"}  # a property added, the types not regenerated
    schema.write_text(json.dumps(document, indent=2), encoding="utf-8")
    planted = check()
    assert planted.returncode == 1 and "not current" in planted.stderr, planted.stdout + planted.stderr


def test_adversarial_a_pin_changed_without_the_table_fails_the_tech_matrix_check(repo: Path) -> None:
    clean = guard(repo, "check_tech_matrix.py", ok_marker="check_tech_matrix: OK")
    assert clean.returncode == 0 and "check_tech_matrix: OK" in clean.stdout, clean.stdout
    # a pin is changed in a copy of the requirements, the table kept
    edit(repo, "requirements-operations.txt", "fastapi==0.141.1", "fastapi==0.141.2")
    r = guard(repo, "check_tech_matrix.py")
    assert r.returncode == 1 and "fastapi" in r.stdout and "0.141.2" in r.stdout and "0.141.1" in r.stdout, r.stdout
    # a table row is added for a package that no requirements file pins
    edit(repo, "requirements-operations.txt", "fastapi==0.141.2", "fastapi==0.141.1")
    edit(repo, "docs/design/SDD.md", "| API | fastapi | 0.141.1 |",
         "| API | planted-ghost | 1.2.3 | a package nobody pins | none |\n| API | fastapi | 0.141.1 |")
    r = guard(repo, "check_tech_matrix.py")
    assert r.returncode == 1 and "planted-ghost" in r.stdout and "fastapi" not in r.stdout.replace("planted-ghost", ""), r.stdout


def test_adversarial_a_requirement_naming_a_missing_gate_fails_the_sdd_check(repo: Path) -> None:
    _, clean = findings(repo, "check_sdd.py")
    assert "test_that_was_never_written" not in clean and "test_planted_skip" not in clean
    features = "docs/design/features"
    # a requirement naming a test that does not exist
    edit(repo, f"{features}/workspace-operation/requirements.md", "test_app_requires_explicit_local_auth", "test_that_was_never_written")
    # a requirement naming a skipped test
    edit(repo, f"{features}/operational-workbench/requirements.md", "tests/test_application.py::test_product_has_no_installable_engine",
         "tests/test_application.py::test_planted_skip")
    with (repo / "tests" / "test_application.py").open("a", encoding="utf-8") as handle:
        handle.write("\n\n@pytest.mark.skip(reason='planted')\ndef test_planted_skip():\n    pass\n")
    # a requirement naming a document as its gate
    edit(repo, f"{features}/operational-workbench/requirements.md",
         "tests/test_application.py::test_local_composition_routes_both_authority_domains", "docs/design/SDD.md")
    code, planted = findings(repo, "check_sdd.py")
    added = new_lines(clean, planted)
    assert code == 1, planted
    assert re.search(r"workspace-operation/requirements\.md WO-004: .*test_that_was_never_written", added), added
    assert re.search(r"operational-workbench/requirements\.md OW-016: .*test_planted_skip.* is skipped or todo", added), added
    assert re.search(r"operational-workbench/requirements\.md OW-015: .*docs/design/SDD\.md is neither a test file nor a script", added), added
