"""JSON Schema validation helpers shared by document guards and contract tests."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]


@lru_cache(maxsize=1)
def _registry() -> Registry[Any]:
    """Resolve product-local schema references without network access."""
    registry: Registry[Any] = Registry()
    schema_dir = ROOT / "docs" / "contracts" / "schemas"
    for schema_path in schema_dir.glob("*.schema.json"):
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        identifier = schema.get("$id")
        if isinstance(identifier, str):
            registry = registry.with_resource(identifier, Resource.from_contents(schema))
    return registry


@lru_cache(maxsize=64)
def _load(schema: str | Path) -> dict[str, Any]:
    path = Path(str(schema).partition("#")[0])
    if not path.is_absolute():
        path = ROOT / path
    if not path.is_file() and not path.suffix:
        path = ROOT / "docs" / "contracts" / "schemas" / f"{path.name}.schema.json"
    elif not path.is_file() and path.parent == Path("."):
        path = ROOT / "docs" / "contracts" / "schemas" / f"{path.stem}.schema.json"
    return json.loads(path.read_text(encoding="utf-8"))


def errors(schema: str | Path, document: Any) -> list[str]:
    """Return stable, readable errors for a document against a repository schema."""
    validator = Draft202012Validator(_load(schema), registry=_registry())
    found = sorted(validator.iter_errors(document), key=lambda error: (list(map(str, error.absolute_path)), error.message))
    return [f"/{'/'.join(map(str, error.absolute_path))}: {error.message}" for error in found]


def component_errors(schema: str | Path, document: Any) -> list[str]:
    """Validate a named OpenAPI component when a catalog row explicitly requests one."""
    schema_path, separator, component_name = str(schema).partition("#")
    if not separator or not component_name:
        return ["component reference must use schema.json#ComponentName"]
    spec = _load(schema_path)
    components = spec.get("components", {}).get("schemas", {}) if isinstance(spec, dict) else {}
    component = components.get(component_name) if isinstance(components, dict) else None
    if not isinstance(component, dict):
        return [f"OpenAPI component {component_name!r} is missing"]
    if not isinstance(spec, dict):
        return ["OpenAPI document is not an object"]
    validator = Draft202012Validator(component, registry=_registry())
    found = sorted(validator.iter_errors(document), key=lambda error: (list(map(str, error.absolute_path)), error.message))
    return [f"/{'/'.join(map(str, error.absolute_path))}: {error.message}" for error in found]
