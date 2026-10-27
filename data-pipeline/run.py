"""Compatibility entry point for the product-owned pipeline coordinator."""

from __future__ import annotations

from pipeline.export import export
from pipeline.runner import main

__all__ = ["export", "main"]


if __name__ == "__main__":
    raise SystemExit(main())
