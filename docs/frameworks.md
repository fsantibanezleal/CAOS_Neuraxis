# Methods and frameworks

All methods share candidate availability, exact capability/resource admission and independent task truth. That isolates policy differences from the surrounding safety engineering. A method's label refers to its actual algorithm; the project does not present a small model as a reproduction of an unrelated foundation-model paper.

| ID | Implemented method | Fit and inference | Interpretation |
|---|---|---|---|
| M01 | Guarded finite-state policy | Explicit causal guards and registered transitions | Competent exact baseline; no learned weights |
| M02 | Reactive behavior tree | Compositional condition/action nodes with node trace | Reactive baseline whose recovery path can be inspected |
| M03 | Calibrated logistic scorer | Fitted causal candidate features and held-out probability calibration | Demonstration preference, not safety probability |
| M04 | Calibrated boosted-tree scorer | XGBoost on the same candidate/state feature contract | Nonlinear tabular comparator |
| M05 | Recurrent behavior policy | PyTorch GRU over causal state with candidate scoring and temperature calibration | Persistent learned state, independent of exact authority |
| M06 | LinUCB | Ridge sufficient statistics and an upper-confidence exploration term | Contextual action ranking; utility is not probability |
| M07 | Masked PPO | SB3-Contrib MaskablePPO over the real resettable environment | Nonrecurrent RL baseline with valid-action masking |
| M08 | Learned-transition lookahead | Action-conditioned PyTorch effect model and bounded expansion | Predictive control with separately measured model error |
| M09 | Direct structured LLM | Actual local model call per decision with constrained candidate schema | Slow baseline with measured model/runtime cost |
| M10 | Asynchronous FSM plus LLM | Fast finite-state continuation and bounded background proposals | Prior-art fast/slow composition comparator |
| M11 | Learned deferral | Measured paired fast/slow branches and fitted incremental-benefit gate | Outcome-grounded routing under a declared utility |
| M12 | Persistent outcome-aware metacontroller | Recurrent policy, predicted effects/residuals, computation allocation and versioned proposals | Research candidate requiring component ablations |

## Shared causal features

Features contain only the state available before a decision, public tool operation descriptors, declared cost/duration, current budget/deadline and causal history. Episode/family IDs, filenames, seeds, teacher targets and future outcomes are excluded. Operation-state interaction features are explicit and shared. Candidate permutation should permute scores rather than change the problem. Missing/nonfinite values have a declared preprocessing policy.

## Training, calibration and effect truth

Behavior cloning learns demonstrated preferences. It is not rewarded merely for predicting a success flag. Each executed choice is evaluated against independently read files, subprocess exit/results or service state. Predicted state and reward heads are trained on observed transitions, with missing-outcome handling documented in the engine. Calibration sets are distinct from model fitting and testing.

The routing experiments execute both branches from resettable equivalent states and use shared continuation. Their utility includes declared task/step terms and measured planner time. It is an estimate for that decision and continuation, not an unrestricted causal claim about an entire agent. A constant fitted gate is reported honestly if data provide only one class; no positive examples are manufactured.

## Research and library provenance

Rust/PyO3 supplies the authority reducer and native scoring export. NumPy/scikit-learn/XGBoost/PyTorch support fitting and inference. Gymnasium/SB3-Contrib supplies the masked policy optimizer. ONNX/ONNX Runtime provides selected portable model exports with parity checks. Ollama serves the explicitly configured open-weight slow baseline. Pin actual package, model, feature and source versions in the exported lineage rather than relying on the framework name.

Read the [learning dossier](research/03-learning-and-control.md) for primary sources, alternatives and novelty boundaries, and [neuroscience dossier](research/02-neuroscience.md) for the evidence supporting and limiting biological inspiration. System One/System Two are operational metaphors here, not asserted anatomical divisions.
