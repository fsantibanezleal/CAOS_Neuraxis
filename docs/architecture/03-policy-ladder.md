# 03. Policy ladder

The scientific comparison includes twelve methods, from guarded rules and a behaviour tree through fitted classical models, a recurrent policy, bandit and PPO methods, learned transition planning, model-backed selection, fixed delegation, a fitted gate and the proposed persistent metacontroller. Method implementations and training live in the pinned `reflexmesh` release. Product-side `data-pipeline/` controls stage invocation, artifact export and repository checks; it does not contain a second reimplementation of those algorithms.

Training, validation, calibration and held-out evaluation are separate recorded splits. Checkpoint and source digests are part of run identity. Inference logs the exact candidate scores and action that ran. Outcome labels come from independent file, process and HTTP postconditions, not teacher agreement. The core experiment fixes 20 case families, six variants and ten held-out seeds for each method.

The transfer lane uses its own case vocabulary, index, lineage and trace hashes. It is never pooled with core outcomes. The fitted routing gate and ablations retain their measured negative results. The benchmark is known to contain tasks solved by a finite-state policy and is therefore not evidence of learned superiority; see [evaluation](07-evaluation.md) and [corrected results](../evaluation/corrected-results.md).
