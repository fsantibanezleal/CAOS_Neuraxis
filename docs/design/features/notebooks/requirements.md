# Neuraxis notebook curriculum requirements

The notebooks are the product's executable teaching layer. They teach released Reflexmesh policies on Neuraxis cases and

| ID | Requirement | Gate |
|---|---|---|
| NB-001 | WHEN English and Spanish notebooks are published, THE checker SHALL ensure both trees mirror topic order, relative notebook paths, level, package pins and evidence scope. | `scripts/check_notebooks.py` |
| NB-002 | WHEN notebook lessons are released, product.json SHALL declare the actual Reflexmesh policy factory and evaluation entrypoints used by executable lessons. | `scripts/check_notebooks.py` |
| NB-003 | WHEN a lesson is released, THE notebook SHALL ask one distinct case-specific question and answer it with a number produced by that notebook. | `scripts/check_notebooks.py` |
| NB-004 | WHEN a lesson demonstrates a frozen trace, THE notebook SHALL also execute the released policy or evaluator on its stated Neuraxis case. | `scripts/run_notebooks.py` |
| NB-005 | WHEN a lesson is released, THE checker SHALL enforce level-specific method and labelled-figure floors. | `scripts/check_notebooks.py` |
| NB-006 | WHEN a figure is presented, THE lesson SHALL interpret it in original prose; level 3 SHALL compare and visualize a named method under matched conditions. | `scripts/check_notebooks.py` |
| NB-007 | WHEN lessons are published, THE checker SHALL enforce topic-specific prose for method, assumptions, data scope, units, computed result and limitations. | `scripts/check_notebooks.py` |
| NB-008 | WHEN a source artifact is used, THE lesson SHALL retain the SDD research references and bounded claims. | `scripts/check_notebooks.py` |
| NB-009 | WHEN notebook outputs are committed, THE fresh-kernel runner SHALL reproduce them without errors or source-artifact mutation. | `scripts/run_notebooks.py` |
| NB-010 | WHEN public model files are fetched, THE setup flow SHALL verify their release-manifest digests and keep weights and scratch data outside Git. | `scripts/check_notebooks.py` |
| NB-011 | WHEN CI validates the product, THE workflow SHALL run the static notebook gate without fitting models or executing notebook kernels. | `scripts/check_notebooks.py` |
