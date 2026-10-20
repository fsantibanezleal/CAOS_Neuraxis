- The planted-defect suite of the design area, Python side: `tests/adversarial/` holds the 34 tests that the gate cells of the seven
  features' `validation.md` name (`test_base_0_08.py` 8, `test_benchmark_adequacy.py` 3, `test_evidence_workbench.py` 2,
  `test_operational_workbench.py` 9, `test_reliability_audit.py` 6, `test_static_release.py` 4, `test_workspace_operation.py` 2),
  with the harness `conftest.py` and `planting.py` (the template 0.08.002 helpers, adapted: a hard-link mirror of the 14,400
  canonical episodes so no plant copies 265 MB, and a file replaced as a new file so a plant never reaches a committed one). Each
  test plants the defect its row states in a throwaway copy, or feeds the hostile input to the real service, installer or writer,
  and shows that the requirement's gate refuses it and that nothing was written; the committed tree is never touched.
- CI runs the suite (`python -m pytest tests/adversarial -q`), the web unit tests (`npm test`) and `ruff check app data-pipeline scripts
  tests` (ruff 0.17.1). The web install and the schema validator now come before the SDD guard, which needs both. Lint-only fixes in
  the product's own scripts and tests; the files taken verbatim from the template keep their text and carry per-file rule ignores in
  `pyproject.toml`.
