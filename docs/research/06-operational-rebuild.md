# Operational rebuild: research, failure analysis and design decisions

Reviewed 2026-09-24 against primary sources and the shipped implementation.

## The product failure

The initial interface selected a virtual document-routing case and foregrounded a
timeline. Native execution required discovering a token field and authoring a JSON
recipe. The user could not immediately identify a useful input, action or output.
Scientific breadth and scroll tests did not answer that product question. The
rebuild must change the interaction and the executed work, not animate the plot.

## Primary-source review

| Source | What it supports | Consequence for this implementation |
| --- | --- | --- |
| [TypeSafe, introducing Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) | The vendor describes typed, fast decisions and calibrated-decision reinforcement learning. These are vendor claims, not independent evidence for our controller. | A decision must identify an executable bounded action. A text response or impressive animation is not a completed task. No claim to reproduce Jev's unpublished training architecture. |
| [Lee, Shimojo & O'Doherty, 2014](https://doi.org/10.1016/j.neuron.2013.11.028) | Computational and neural evidence for reliability-sensitive arbitration between model-based and model-free learning. Full PMC access was challenged during this refresh; the earlier neuroscience dossier contains the detailed review. | Show why an action was admitted or escalated. Do not label every non-LLM action a biological reflex or every LLM call deliberation. |
| [Task complexity and state-space uncertainty, 2019](https://www.nature.com/articles/s41467-019-13632-1) | Both complexity and uncertainty affect arbitration in the studied task. | Evaluate changing dependency structure and ambiguous inputs separately from increasing the number of routine files. |
| [Stachenfeld, Botvinick & Gershman, 2017](https://www.nature.com/articles/nn.4650) | Predictive representations offer a computational account of aspects of hippocampal coding. | A dependency map is an engineering view of expected consequences. It is not a brain simulation; measured before/after effects remain authoritative. |
| [Lieder & Griffiths, resource-rational analysis](https://cocosci.princeton.edu/papers/liederresource.pdf) | Cognitive strategies can be analyzed under computation costs and finite resources. | Report achieved outcomes, actual model calls and elapsed time separately. Do not imply a saved LLM cost without a matched executed comparison. |
| [Madras et al., learning to defer](https://arxiv.org/abs/1711.06664) | Deferral should account for downstream decision-maker performance, not merely uncertainty. | Preserve the negative learned-gate result. A configured planner is not automatically useful; expose unavailable, late and invalid responses. |
| [Schulman et al., PPO](https://arxiv.org/abs/1707.06347) | Policy learning requires sampled interactions and optimization; an interface selection is not reinforcement learning. | Keep the frozen PPO evaluation and checkpoints. New application workflows are exact policies unless separately trained and validated. |
| [DPT-Agent](https://arxiv.org/abs/2502.11882) | Combines an FSM/code policy with asynchronous language-model reasoning for a specific collaborative environment. | Fast/slow coordination is prior art. Our practical contribution must be observable work, versioned proposals and verifiable effects, not novelty by renaming the components. |
| [SWE-bench](https://arxiv.org/abs/2310.06770) | Repository tasks are evaluated with execution-based outcomes. | A source audit must read actual source and report actual syntax/configuration findings. Never describe static analysis as fixing arbitrary GitHub issues. |
| [ToolSandbox](https://arxiv.org/abs/2408.04682) | Stateful tool execution and intermediate/final milestones expose failures missed by isolated tool-call accuracy. | Show dependency progress, actual output files, native receipts and independent terminal checks. |
| [tau-bench](https://arxiv.org/abs/2406.12045), [tau2-bench](https://arxiv.org/abs/2506.07982) | Stateful interaction, repeated reliability and shared-state coordination require explicit evaluation. | Bake compound jobs across fault conditions and seeds; report execution failure separately from correctly identifying bad input. External benchmark subsets remain separate. |
| [Amershi et al., CHI 2019](https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf) | Validated interaction guidelines cover capabilities, context, correction, control and consequences. | The first screen identifies a task, its input and expected outputs. Results lead; receipts and raw diagnostics are progressively disclosed. |

## Decisions derived from the review

1. Add actual bounded operations for source/configuration audit, tabular delivery
   validation and release-integrity verification. Accept user-selected text files;
   treat uploaded code as data. Each run has its own disposable directory, native
   journal, dependency graph, cancellation and exportable results. Original files
   are retained unchanged. No user-supplied code or shell command is executed.
2. The default is a compound release investigation using a realistic owned bundle,
   with all input files visible before execution. The same tool chain accepts
   other user files. A task produces findings, normalized data where applicable,
   content manifests and a downloadable report, not only graph points.
3. Provide a public bounded operation service and an authenticated local workspace
   lane. The public service grants no access to the host filesystem, process
   registration or existing workspace APIs. Session capabilities, limits, TTL,
   cancellation and per-run ownership are checked server-side.
4. Preserve the twelve-method scientific ladder and all 19,488 frozen episodes.
   Add a selected-case investigation view with matched conditions, actual action
   receipts and failures visible by default. Never blend a new operational run
   into the old trained-method scores.
5. Compound-operation experiments are a separate reproducible workload suite.
   Use executed dependency nodes, content-derived independent checks, injected
   corruption, cancellation and isolation tests. Publish failures as failures.
6. Keep EN/ES, themes, the shared shell, architecture explanation and six routes.
   Use a task sidebar, a large interactive dependency map and an evidence inspector.
   Reading pages and compact viewports retain normal document scrolling.

## Limits and adversarial review

These workflows deliver useful bounded analysis and artifact preparation. They do
not autonomously repair arbitrary code, understand every natural-language goal or
establish AGI. The existing engine already exposes slow planning for registered
research environments; the new deterministic operations must not claim model
reasoning when no model was called. Deep source verification, source provenance,
meaningful UI tests and a live deployed run are distinct acceptance gates.

The largest risk is repeating the original mistake with prettier node cards.
Therefore acceptance requires user-file input, downloadable useful outputs,
independent content checks, actionable failure findings, actual native receipts,
and compound fault experiments. Screenshot quality alone cannot satisfy it.
