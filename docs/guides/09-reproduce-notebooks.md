# Reproduce the evidence notebooks

Neuraxis publishes four notebooks: core results and semantic transfer/routing, in English and Spanish. They are generated from the committed, hash-audited evidence files. They report the measured outcomes and retain the documented limits; they do not fit a model or execute tools.

From the repository root, rebuild their cells and stored output, check structure and provenance, then execute the cells against current committed evidence:

```sh
python scripts/build_notebooks.py
python scripts/check_notebooks.py
python scripts/run_notebooks.py
```

The runner permits one code cell per notebook and rejects common write, network and subprocess calls before executing it. It compares fresh output to the output committed in the notebook. `scripts/check_product_gates.py --scope source` includes notebook validation and should pass before committing a regenerated notebook. The underlying evidence remains in `data/derived/`; notebooks are a readable analysis view, not a replacement dataset.
