# Neuraxis notebook curriculum requirements

The notebooks are the product's executable teaching layer. They teach released Reflexmesh policies on Neuraxis cases and
hash-audited artifacts. They are bilingual mirrors, not a second implementation of policy code and not a gallery of printed
JSON. The binding lesson bar and measured floors are in CAOS_MANAGE `conventions/product-notebooks.md`, section 1; this
product adopts the checks from CAOS_PRODUCT_TEMPLATE 0.12.000.

```text
R-032 WHEN English and Spanish notebooks are published, THE checker SHALL ensure both trees mirror topic order, relative notebook paths, level, package pins and evidence scope.
Gate: scripts/check_notebooks.py
R-033 WHEN notebook lessons are released, product.json SHALL declare the actual Reflexmesh policy factory and evaluation entrypoints used by executable lessons.
Gate: scripts/check_notebooks.py
R-034 WHEN a lesson is released, THE notebook SHALL ask one distinct case-specific question and answer it with a number produced by that notebook.
Gate: scripts/check_notebooks.py
R-035 WHEN a lesson demonstrates a frozen trace, THE notebook SHALL also execute the released policy or evaluator on its stated Neuraxis case.
Gate: scripts/run_notebooks.py
R-036 WHEN a lesson is released, THE checker SHALL enforce level-specific method and labelled-figure floors.
Gate: scripts/notebook_bar.json
R-037 WHEN a figure is presented, THE lesson SHALL interpret it in original prose; level 3 SHALL compare and visualize a named method under matched conditions.
Gate: scripts/check_notebooks.py
R-038 WHEN lessons are published, THE checker SHALL enforce topic-specific prose for method, assumptions, data scope, units, computed result and limitations.
Gate: scripts/check_notebooks.py
R-039 WHEN a source artifact is used, THE lesson SHALL retain the SDD research references and bounded claims.
Gate: scripts/check_notebooks.py
R-040 WHEN notebook outputs are committed, THE fresh-kernel runner SHALL reproduce them without errors or source-artifact mutation.
Gate: scripts/run_notebooks.py
R-041 WHEN public model files are fetched, THE setup flow SHALL verify their release-manifest digests and keep weights and scratch data outside Git.
Gate: scripts/setup.ps1
R-042 WHEN CI validates the product, THE workflow SHALL run the static notebook gate without fitting models or executing notebook kernels.
Gate: .github/workflows/ci.yml
```
