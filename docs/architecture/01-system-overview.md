# 01. System overview

Neuraxis is a software-control research workbench. It connects a deterministic authority layer to fast policies and optional asynchronous language-model planning, then records what each decision actually changed. The web UI is a view over that system and over frozen scientific evidence; it does not grant the public browser access to the host machine.

The executable engine is distributed separately as `reflexmesh==0.1.2` from PyPI. Rust implements typed state reduction and native admission; Python coordinates the local runtime and research stages. This repository owns product orchestration, benchmark cases and evidence, the authenticated application composition, release packaging, and the bilingual CAOS workbench. The application intentionally does not publish a second Python engine package.

The main runtime path is `app/main.py` -> the engine's local server and `app/operations_api.py` -> the independently bounded compound-operation service. The static site uses `frontend/src/api/` for authenticated local APIs and `frontend/src/api/artifacts.ts` for hash-checked, effect-free canonical replay. Offline collection, fitting, calibration, evaluation and export are orchestrated by `data-pipeline/pipeline/runner.py` and executed by the pinned engine dependency.

The authority boundary is not a learned-model boundary. Policies may choose among currently supported candidates; only the registered native broker can admit a concrete effect. The static website contains no host-tool authority, user workspace, training environment, or credentials.
