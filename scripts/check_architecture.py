#!/usr/bin/env python3
"""Enforce the CAOS architecture-diagram floor and the bilingual SVG contract."""
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "frontend" / "src" / "architecture"
PUBLIC = ROOT / "frontend" / "public" / "svg" / "tech"
NAMES = (
    "01-the-app.svg",
    "02-lanes.svg",
    "03-web-flow.svg",
    "04-the-science.svg",
    "05-data-contracts.svg",
)
SVG = "http://www.w3.org/2000/svg"
REQUIRED_STYLES = (
    ".bx{", ".bx-hi{", ".bx-eng{", ".bx-gate{", ".bx-store{",
    ".ttl{", ".sub{", ".it{", ".cd,", ".mu{", ".flow{", ".lbl{",
)
PATH = re.compile(r"(?:[A-Za-z0-9_./-]+\.(?:py|ts|tsx|rs|json)|/[a-z][a-z/-]+)")


def fail(message: str) -> None:
    print(f"check_architecture: FAIL: {message}")
    raise SystemExit(1)


def main() -> int:
    errors: list[str] = []
    if not SOURCE.is_dir():
        fail(f"missing canonical diagram directory: {SOURCE.relative_to(ROOT)}")
    for name in NAMES:
        path = SOURCE / name
        if not path.is_file():
            errors.append(f"{name}: missing canonical SVG")
            continue
        try:
            tree = ET.parse(path)
        except ET.ParseError as exc:
            errors.append(f"{name}: invalid SVG/XML: {exc}")
            continue
        root = tree.getroot()
        if root.tag != f"{{{SVG}}}svg":
            errors.append(f"{name}: root is not SVG")
            continue
        if root.attrib.get("width") != "880":
            errors.append(f"{name}: canvas width is not 880")
        if not root.attrib.get("viewBox", "").startswith("0 0 880 "):
            errors.append(f"{name}: viewBox must start at 0 0 880")
        if root.find(f"{{{SVG}}}title") is None:
            errors.append(f"{name}: missing accessible SVG title")
        style = root.find(f"{{{SVG}}}style")
        css = style.text or "" if style is not None else ""
        for token in REQUIRED_STYLES:
            if token not in css:
                errors.append(f"{name}: missing semantic style {token}")
        if 'orient="auto-start-reverse"' not in path.read_text(encoding="utf-8"):
            errors.append(f"{name}: arrow marker must support either flow direction")

        boxes = [node for node in root.iter(f"{{{SVG}}}rect") if "bx-" in node.attrib.get("class", "")]
        flows = [node for node in root.iter(f"{{{SVG}}}path") if "flow" in node.attrib.get("class", "").split()]
        english_labels = [
            node for node in root.iter(f"{{{SVG}}}text")
            if "lbl" in node.attrib.get("class", "").split() and "l-en" in node.attrib.get("class", "").split()
        ]
        path_labels = [
            node.text or "" for node in root.iter(f"{{{SVG}}}text")
            if "l-neutral" in node.attrib.get("class", "").split()
        ]
        if len(boxes) < 5:
            errors.append(f"{name}: only {len(boxes)} type-coded boxes; minimum is 5")
        if len(flows) < 5:
            errors.append(f"{name}: only {len(flows)} explicit flows; minimum is 5")
        if len(english_labels) < len(flows):
            errors.append(f"{name}: {len(english_labels)} English edge labels for {len(flows)} flows")
        if sum(bool(PATH.search(label)) for label in path_labels) < 5:
            errors.append(f"{name}: fewer than five real module, artifact or route paths")

        pairs: dict[str, dict[tuple[str, str], str]] = {"l-en": {}, "l-es": {}}
        for node in root.iter(f"{{{SVG}}}text"):
            classes = set(node.attrib.get("class", "").split())
            languages = classes.intersection(pairs)
            if len(languages) > 1:
                errors.append(f"{name}: one text node carries both languages")
                continue
            if not languages:
                if "l-neutral" not in classes:
                    errors.append(f"{name}: untagged diagram text: {node.text or ''}")
                continue
            lang = languages.pop()
            coords = (node.attrib.get("x", ""), node.attrib.get("y", ""))
            if coords in pairs[lang]:
                errors.append(f"{name}: duplicate {lang} text coordinates {coords}")
            pairs[lang][coords] = " ".join((node.text or "").split())
        if pairs["l-en"].keys() != pairs["l-es"].keys():
            missing_es = sorted(pairs["l-en"].keys() - pairs["l-es"].keys())
            missing_en = sorted(pairs["l-es"].keys() - pairs["l-en"].keys())
            errors.append(f"{name}: unpaired bilingual coordinates, missing ES={missing_es}, missing EN={missing_en}")
        else:
            repeated = [coord for coord, en in pairs["l-en"].items() if en == pairs["l-es"][coord]]
            if repeated:
                errors.append(f"{name}: English and Spanish labels are identical at {repeated}")

        public = PUBLIC / name
        if not public.is_file() or public.read_bytes() != path.read_bytes():
            errors.append(f"{name}: public documentation copy is not byte-for-byte mirrored")

    if errors:
        for error in errors:
            print(f"  {error}")
        return 1
    print(f"check_architecture: OK, {len(NAMES)} bilingual, themed, flow-labelled diagrams")
    return 0


if __name__ == "__main__":
    sys.exit(main())
