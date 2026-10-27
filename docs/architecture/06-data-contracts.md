# 06. Data contracts

The complete boundary inventory is in [the contract catalog](../contracts/catalog.md). The catalog links each data shape to its producer, consumer, schema or runtime contract, and validator. `product.json` binds public identity and the declared Apache-2.0 license. The version lock prevents a schema change from silently diverging from its consumers.

The core index refers to each executed episode by stable identity and SHA-256 of its exact serialized bytes. Validation checks the full method/case/variant/seed matrix, lineage and independent outcome evidence before an export is accepted. Transfer and routing studies have independent contracts. The compound-operation index similarly binds each detailed run by digest; the web view loads the grouped summary immediately and verifies the selected detail before showing it.

`data/derived/readiness.json` is deterministic output of the catalog and repository file state. It records the catalog hash, product version, available contract evidence and any missing evidence. It does not claim that a hosted deployment is live or that a scientific hypothesis is supported. Regenerate it with `python data-pipeline/run.py readiness`; check it with `python scripts/check_readiness.py`.
