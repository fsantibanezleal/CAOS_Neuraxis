import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import check_sdd
from check_sdd import ladder_findings


def table(tier="classical"):
    return f"""## Method ladder
| id | tier | method | acceptance criterion | gate |
|---|---|---|---|---|
| M01 | {tier} | Guarded policy | Independent postconditions | results |
| M03 | sota | Fitted policy | Matched holdout | results |
| BS-1 | beyond | Proposed controller | Paired outcomes and ablations | results |

## Beyond the state of the art
BS-1 is a proposed controller with a falsifiable evaluation.
"""


def test_adversarial_ladder_without_tier_column_fails():
    text = "## Method ladder\n| id | method | acceptance criterion | gate |\n|---|---|---|---|\n| M01 | Guard | Verify outcome | results |"
    assert any("add the tier column" in finding for finding in ladder_findings(text))


def test_adversarial_unknown_tier_fails():
    assert any("must be one of" in finding for finding in ladder_findings(table("unknown")))


def test_adversarial_product_missing_one_method_tier_fails():
    text = table().replace("| M01 | classical | Guarded policy | Independent postconditions | results |", "")
    assert any("no classical method" in finding for finding in ladder_findings(text))


def test_adversarial_unpaired_claim_fails():
    text = table().replace("| BS-1 | beyond | Proposed controller | Paired outcomes and ablations | results |", "")
    assert any("no beyond method row" in finding for finding in ladder_findings(text))


def test_adversarial_template_exception_is_explicit(tmp_path, monkeypatch):
    (tmp_path / ".template-source").touch()
    monkeypatch.setattr(check_sdd, "ROOT", tmp_path)
    text = "## Method ladder\n| id | tier | method | acceptance criterion | gate |\n|---|---|---|---|---|\n| M01 | classical | Guard | Verify | results |\n\n## Beyond the state of the art\nNone claimed."
    assert ladder_findings(text) == []
