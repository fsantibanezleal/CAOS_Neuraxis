"""Producer-side tests of the derived evidence (catalog rows episode-index, episode, lineage): every committed document,
all 15,936 of the two episode sets included, and the provider tree validate against their schema files
(docs/contracts/schemas/) and obey the rules a schema cannot state (digests, identity, lineage binding). The same
assertions run on both trees (the swap tests are in test_swap.py)."""
from __future__ import annotations

import contract_schemas as cs
import pytest
import support

TREES = {"committed": cs.DATA_ROOTS["committed"], "fixture": cs.DATA_ROOTS["fixture"]}


@pytest.mark.parametrize("label", TREES)
def test_index_validates(label):
    path = TREES[label] / "derived" / "index.json"
    assert path.is_file(), f"{label}: missing {path}"
    index = cs.load_json(path)
    assert cs.errors("episode-index", index) == []
    assert index["schema_version"] == 1 and index["episodes"] and index["aggregate_results"]
    # the registry is the engine's: twelve methods; every aggregate and every episode names a registered method
    assert {a["method_id"] for a in index["aggregate_results"]} <= {m["id"] for m in index["methods"]}
    assert {e["method_id"] for e in index["episodes"]} <= {m["id"] for m in index["methods"]}


@pytest.mark.parametrize("label", TREES)
def test_lineage_validates(label):
    for rel in ("derived/lineage.json", "derived/semantic-transfer/lineage.json"):
        path = TREES[label] / rel
        assert path.is_file(), f"{label}: missing {path}"
        assert cs.errors("lineage", cs.load_json(path)) == [], f"{label}: {rel}"


@pytest.mark.parametrize("label", TREES)
def test_episodes_validate(label):
    """Every episode of both sets: schema, index digest and identity, file name, lineage binding, no orphan file."""
    root = TREES[label] / "derived"
    assert support.episode_set_problems(root, "owned-real-software", "test") == []
    assert support.episode_set_problems(root / "semantic-transfer", "owned-semantic-transfer", "semantic_transfer") == []


def test_the_committed_sets_have_the_counts_the_inventory_recorded():
    root = cs.DATA_ROOTS["committed"] / "derived"
    assert len(list((root / "episodes").glob("*.json"))) == 14400
    assert len(list((root / "semantic-transfer" / "episodes").glob("*.json"))) == 1536


def test_adversarial_drifted_episodes_are_rejected():
    import copy

    path = next((cs.DATA_ROOTS["fixture"] / "derived" / "episodes").glob("*.json"))
    doc = cs.load_json(path)
    assert cs.errors("episode", doc) == []
    extra = copy.deepcopy(doc)
    extra["unexpected_key"] = 1
    assert cs.errors("episode", extra)
    for key in ("run_id", "events", "decisions", "metrics", "provenance", "lane"):
        missing = copy.deepcopy(doc)
        del missing[key]
        assert cs.errors("episode", missing), f"a missing {key} is accepted"
    wrong = copy.deepcopy(doc)
    wrong["metrics"]["task_success"] = 2
    assert cs.errors("episode", wrong)
    wrong = copy.deepcopy(doc)
    wrong["decisions"][0]["candidates"][0]["allowed"] = "yes"
    assert cs.errors("episode", wrong)
    wrong = copy.deepcopy(doc)
    wrong["lane"] = "owned-unknown"
    assert cs.errors("episode", wrong)
    wrong = copy.deepcopy(doc)
    wrong["decisions"][0]["unexpected"] = 1
    assert cs.errors("episode", wrong)


def test_adversarial_drifted_index_and_lineage_are_rejected():
    import copy

    index = cs.load_json(cs.DATA_ROOTS["fixture"] / "derived" / "index.json")
    lineage = cs.load_json(cs.DATA_ROOTS["fixture"] / "derived" / "lineage.json")
    for name, doc in (("episode-index", index), ("lineage", lineage)):
        extra = copy.deepcopy(doc)
        extra["unexpected_key"] = 1
        assert cs.errors(name, extra), name
        missing = copy.deepcopy(doc)
        del missing[next(iter(missing))]
        assert cs.errors(name, missing), name
    wrong = copy.deepcopy(index)
    wrong["episodes"][0]["sha256"] = "xyz"
    assert cs.errors("episode-index", wrong)
    wrong = copy.deepcopy(index)
    wrong["episodes"][0]["seed"] = "40000"
    assert cs.errors("episode-index", wrong)
    wrong = copy.deepcopy(lineage)
    wrong["native_binary"]["sha256"] = "not-a-digest"
    assert cs.errors("lineage", wrong)


def test_adversarial_a_changed_episode_breaks_its_digest(tmp_path):
    import shutil

    base = tmp_path / "derived"
    shutil.copytree(cs.DATA_ROOTS["fixture"] / "derived", base)
    assert support.episode_set_problems(base, "owned-real-software", "test") == []
    victim = next((base / "episodes").glob("*.json"))
    victim.write_bytes(victim.read_bytes().replace(b'"status":"succeeded"', b'"status":"failed"', 1)
                       if b'"status":"succeeded"' in victim.read_bytes()
                       else victim.read_bytes().replace(b'"status":"failed"', b'"status":"succeeded"', 1))
    problems = support.episode_set_problems(base, "owned-real-software", "test")
    assert any("sha256 differs" in p for p in problems), problems
