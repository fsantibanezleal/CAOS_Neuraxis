# Adversarial validation: static release

For each requirement of [`requirements.md`](requirements.md), the check that tries to break it: what was planted or refuted, and the test that plants it. `scripts/check_sdd.py` fails when a requirement has no row here (or two), when a check is empty, and when a gate names a test that does not exist. The gates under `tests/adversarial/` and `frontend/src/adversarial/` are the planted-defect tests of the suite that follows this document; until a test exists the guard reports its row, and the names here are the ones that suite is to create.

| requirement | adversarial check | gate |
|---|---|---|
| SR-001 | a file added to the build output after the manifest is enumerated is planted: the packaging check names the file that has no digest | `tests/adversarial/test_static_release.py::test_adversarial_a_file_outside_the_manifest_is_refused` |
| SR-002 | an archive with a traversal member, one with a duplicate member and one with a digest that differs are each rejected before the current release switches | `tests/adversarial/test_static_release.py::test_adversarial_a_bad_archive_never_switches_the_release` |
| SR-003 | a workflow step that runs fitting or the product test suite is planted: the CI budget check fails | `tests/adversarial/test_static_release.py::test_adversarial_a_workflow_step_that_trains_fails_the_ci_budget_check` |
| SR-004 | a trace matrix missing one cell is planted in the build input: the package builder refuses to build | `tests/adversarial/test_static_release.py::test_adversarial_an_incomplete_matrix_is_not_packaged` |
