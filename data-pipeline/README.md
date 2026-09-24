# Scientific pipeline

`run.py` is a script driver for the separately released reflexmesh engine. It is not an internal package. `collect`, `train`, `ppo`, `gates` and `evaluate` invoke the package's scientific stages in the current Python environment. `export` verifies source episode hashes before copying the complete twelve-method result set to `data/derived/`.

The baseline split uses 600 training episodes, 120 validation episodes, 120 calibration episodes and 1,200 held-out episodes per method. Environments group by disjoint seed identity; hidden oracle labels and future outcomes are never policy observation features. Teacher actions generate training demonstrations, while independent filesystem/process/HTTP predicates determine task outcomes. Demonstration agreement and task success are reported separately.

Each exported episode records case/method/variant/seed, actual event/decision/effect history, native receipts, latency components, planner evidence, uncertainty target and provenance. Canonical metrics are computed from these episodes. Missing outcomes, rejected actions and unresolved effects remain explicit. The complete result matrix includes unsuccessful episodes rather than filtering them out.

Checkpoint and source digests are part of resume identity. External benchmarks use pinned upstream code and separate dependency environments. Their evaluation scores remain separate from the owned matrix. Deployment never recomputes scientific results or silently substitutes a different model.
