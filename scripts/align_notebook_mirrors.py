#!/usr/bin/env python3
"""Align EN/ES notebook cell boundaries without changing lesson content.

The bilingual lessons sometimes split a prose section into different numbers
of adjacent Markdown cells. This changes rendering boundaries but not content,
and the mirror gate correctly requires the same cell-kind sequence. This tool
merges only surplus adjacent Markdown cells within the same code-delimited
section. It never edits source text or moves/changes executable cells.
"""
from __future__ import annotations

import json
from pathlib import Path


def groups(cells: list[dict]) -> list[list[dict]]:
    result: list[list[dict]] = []
    prose: list[dict] = []
    for cell in cells:
        if cell["cell_type"] == "code":
            result.append(prose)
            prose = []
        else:
            prose.append(cell)
    result.append(prose)
    return result


def merge_pair(left: dict, right: dict) -> dict:
    merged = dict(left)
    a = "".join(left.get("source", []))
    b = "".join(right.get("source", []))
    merged["source"] = (a.rstrip() + "\n\n" + b.lstrip()).strip().splitlines(keepends=True)
    tags = list(dict.fromkeys(left.get("metadata", {}).get("tags", []) + right.get("metadata", {}).get("tags", [])))
    merged["metadata"] = dict(left.get("metadata", {}))
    if tags:
        merged["metadata"]["tags"] = tags
    elif "tags" in merged["metadata"]:
        merged["metadata"].pop("tags")
    return merged


def reduce_group(cells: list[dict], target: int) -> list[dict]:
    cells = [dict(cell) for cell in cells]
    while len(cells) > target:
        # Merge the shortest adjacent pair, minimizing the amount of distinct
        # prose that loses its individual cell boundary while preserving order.
        index = min(
            range(len(cells) - 1),
            key=lambda i: len("".join(cells[i].get("source", [])))
            + len("".join(cells[i + 1].get("source", []))),
        )
        cells[index:index + 2] = [merge_pair(cells[index], cells[index + 1])]
    return cells


def align_pair(en_path: Path, es_path: Path) -> bool:
    en = json.loads(en_path.read_text(encoding="utf-8"))
    es = json.loads(es_path.read_text(encoding="utf-8"))
    changed = False
    for notebook in (en, es):
        before = notebook["cells"]
        notebook["cells"] = [
            cell for cell in before
            if cell["cell_type"] == "code" or "".join(cell.get("source", [])).strip()
        ]
        changed |= len(notebook["cells"]) != len(before)
    en_groups, es_groups = groups(en["cells"]), groups(es["cells"])
    if len(en_groups) != len(es_groups):
        raise ValueError(f"executable-cell counts differ: {en_path} / {es_path}")
    if [c["cell_type"] for c in en["cells"] if c["cell_type"] == "code"] != [
        c["cell_type"] for c in es["cells"] if c["cell_type"] == "code"
    ]:
        raise ValueError(f"code-cell counts differ: {en_path} / {es_path}")

    en_result: list[dict] = []
    es_result: list[dict] = []
    for gap, (en_md, es_md) in enumerate(zip(en_groups, es_groups)):
        target = min(len(en_md), len(es_md))
        if len(en_md) != target or len(es_md) != target:
            en_groups[gap] = reduce_group(en_md, target)
            es_groups[gap] = reduce_group(es_md, target)
            changed = True
        en_result.extend(en_groups[gap])
        es_result.extend(es_groups[gap])
        code_index = gap
        en_codes = [c for c in en["cells"] if c["cell_type"] == "code"]
        es_codes = [c for c in es["cells"] if c["cell_type"] == "code"]
        if code_index < len(en_codes):
            en_result.append(en_codes[code_index])
            es_result.append(es_codes[code_index])

    if [c["cell_type"] for c in en_result] != [c["cell_type"] for c in es_result]:
        raise AssertionError(f"normalization failed: {en_path} / {es_path}")
    if changed:
        en["cells"] = en_result
        es["cells"] = es_result
        en_path.write_text(json.dumps(en, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        es_path.write_text(json.dumps(es, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    root = Path(__file__).resolve().parents[1] / "notebooks"
    changed = 0
    for en_path in sorted((root / "en").glob("*/*.ipynb")):
        es_path = root / "es" / en_path.relative_to(root / "en")
        if es_path.is_file() and align_pair(en_path, es_path):
            changed += 1
            print(f"aligned {en_path.relative_to(root)}")
    print(f"aligned {changed} bilingual notebook pairs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
