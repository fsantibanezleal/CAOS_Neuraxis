# Method names, design ladder and manuscript validation

Each row points to a test that plants the stated defect or exercises the documented exception.

| requirement | adversarial check | gate |
|---|---|---|
| MT-001 | Remove the required ladder column, plant a prose ladder and verify the guard identifies the missing column. | `tests/adversarial/test_method_ladder.py::test_adversarial_ladder_without_tier_column_fails` |
| MT-002 | Plant an unrecognized method family and verify that the product check rejects it. | `tests/adversarial/test_method_ladder.py::test_adversarial_product_missing_one_method_tier_fails` |
| MT-003 | Remove a proposed method row while retaining its claim and verify the mismatch is rejected. | `tests/adversarial/test_method_ladder.py::test_adversarial_unpaired_claim_fails` |
| MT-004 | Run the template exception with an explicit template marker and verify only the documented exception passes. | `tests/adversarial/test_method_ladder.py::test_adversarial_template_exception_is_explicit` |
| MT-005 | Remove the named comparator call or figure from a level-three lesson and verify the notebook guard fails. | `tests/test_check_notebooks.py::test_adversarial_nb059_level_three_runs_a_named_method_and_draws_it` |
| MT-006 | Remove the technical-report record from product metadata and verify the manuscript guard fails. | `tests/test_check_manuscripts.py::test_adversarial_a_product_without_the_field_fails_with_the_rule` |
| MT-007 | Plant a malformed manuscript field and verify the guard reports the field and entry. | `tests/test_check_manuscripts.py::test_adversarial_a_malformed_entry_fails_naming_the_field` |
| MT-008 | Plant a mismatched report version under release validation and verify it fails. | `tests/test_check_manuscripts.py::test_adversarial_a_report_version_behind_the_release_passes_unless_the_release_changes_a_result` |
| MT-009 | Patch a network call into the default manuscript check and verify the offline contract rejects it. | `tests/test_check_manuscripts.py::test_adversarial_the_default_run_never_touches_the_network` |
| MT-010 | Plant an internal method label in a manuscript and verify the reader-facing name guard fails. | `tests/test_check_internal_names.py::test_adversarial_a_manuscript_with_a_tier_name_fails` |
| MT-011 | Plant exempt bibliography and internal-name examples and verify they remain accepted. | `tests/test_check_internal_names.py::test_adversarial_a_cited_title_in_references_a_key_string_a_fence_and_a_marked_line_pass` |
