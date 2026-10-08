# Investigating controller behavior

The App's Investigations view compares two controllers on the same family, condition and seed. Choose **Core software incidents** to inspect the frozen 14,400-episode matrix, or **Semantic tool choices** to inspect the separate 1,536-episode study. These studies are never pooled. Every replayed trace is checked against its index SHA-256 and episode identity before display.

The semantic suite offers opaque, type-compatible tools with different operation descriptions. Read the recorded goal, inspect each candidate's capability, then compare the observed JSON writes and independent goal check. An admitted action or native receipt proves an effect was attempted; it does not prove the requested transformation was correct. M01 can abstain because its rules do not recognize these tools. Failures, unused planner arrivals and negative comparisons remain visible.

Select either result card to inspect its decisions, candidates, file effects and slow-planner requests. Export preserves the verified episode record. The URL records the investigation suite and selection; it never contains a credential.

## Fresh execution

Start the local service with `scripts/serve.py` and open its session URL. **Run selected controller** creates a new disposable workload through the authenticated native run API. It uses the selected suite, family, variant, seed and method. The result appears separately and has `execution_origin: fresh-local` provenance. It never replaces the frozen comparison. Cancel requests stop future work; they do not claim to undo completed effects. Export the fresh evidence to retain its actual decisions and outcomes.

M03–M08 and learned hybrid methods need the verified checkpoint archive; M09–M12 also need an explicitly installed Ollama model selected with `--model`. Missing prerequisites return an explicit error. The public site serves replay and bounded file tasks; it cannot launch planner research runs on your computer.

## External storage

Setup and local execution default to the user's external cache/data directories, under `neuraxis`. Existing repository-local checkpoints are not silently migrated or deleted. Use `NEURAXIS_CHECKPOINTS` or setup's `-Checkpoints` argument to select a verified checkpoint directory. Use `--checkpoints`, `--operations-root` and `--temp-root` when launching to select model, retained task and disposable-workload storage. Corresponding environment overrides are `NEURAXIS_CHECKPOINTS`, `NEURAXIS_OPERATIONS_ROOT` and `NEURAXIS_TEMP_ROOT`. On Linux, XDG cache/data roots are respected; on Windows, LOCALAPPDATA is respected. Published immutable scientific artifacts are separate from mutable runtime files.

## Interpretation

Neither a new interface nor a fresh successful run demonstrates general intelligence or learned superiority. The frozen semantic study reports M12 18/128 and M09 38/128 successes. See [semantic transfer](../evaluation/semantic-transfer.md) and the benchmark's complete methods and paired outcomes. Generalization requires new disjoint evaluation and an independently justified comparator.
