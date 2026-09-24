# Learning and control for a software System One

Research date: 2026-09-20. Authoring scope: learning, control, uncertainty, delegation, and comparative evaluation. This is a research dossier, not an implementation or a claim of measured product performance. Source records, access depth, and caveats are in `sources-learning.json`.

## 1. Decision supported by the literature

Build an event-driven controller that selects and supervises typed, already authorized software actions, retains bounded state, measures outcomes, and allocates expensive reasoning when its expected benefit exceeds its cost. Use a small discriminative scorer and, where history matters, a small recurrent policy. Keep execution contracts and authorization outside the learned score. The slow side can be an LLM, symbolic planner, search procedure, or human decision. The fast side need not generate text.

This is an engineering recommendation inferred from the literature. It is not evidence of a new general intelligence mechanism. Fast inference, learned routing, reactive policies, policy distillation, hierarchical control, bounded metareasoning, and asynchronous fast/slow compositions all have substantial prior art. Novelty must therefore concern a specifically defined mechanism and a reproducible result on software control, not the existence of a fast module beside an LLM.

The deployable core should include genuine learned behavior but should not require a new foundation model: compact typed features; deterministic validity checks; logistic and tree scorers; a recurrent behavior-cloning policy; outcome-based deferral; persistent task state; and complete software-action traces. Full RL and learned forward models are meaningful comparative methods inside a controlled software simulator. Spiking, liquid, RWKV, and Mamba policies are research comparisons with separate justification requirements, not prerequisites for a useful controller.

## 2. Fast and slow are operating modes, not model species

A feedforward LLM pass can perform amortized pattern matching, while a very small program can conduct explicit search. Conversely, a recurrent neural network can do substantial computation. Model size, architecture, latency, deliberation, and adaptation are different axes. A product should publish operational definitions: whether it searches, how much history it consumes, whether it generates tokens, which state it retains, and how latency was measured.

[System-1.x](https://arxiv.org/abs/2407.14414) uses a controller to decompose planning into easier and harder subgoals, trading direct planning against search under a user-selected mixture. Its experiments concern Maze Navigation and Blocksworld. This establishes relevant architectural precedent, not evidence of reliable file or operating-system control. [L13]

[DPT-Agent](https://aclanthology.org/2025.acl-long.206/) combines an FSM/code-policy fast process with asynchronous LLM reflection and human-intention inference. The study evaluates simultaneous collaboration, including a cooking environment and human collaborators. This is a particularly important baseline: a fast deterministic controller plus asynchronous language reasoning is already published. An adaptation to software tasks must be labeled an adaptation, with the original environment and implementation distinguished. [L14]

The recent [Instruct-to-Act paper](https://arxiv.org/abs/2608.26788), posted 2026-08-27 and identified by its record as COLM 2026, conditions a fast world-model controller on sparse high-level VLM instructions. Synthetic instruction relabeling, behavior cloning, reward learning, and world modeling train the controller; the study includes multi-agent environments and planner substitution. Its scope is embodied environments. It is strong prior art against claiming that sparse slow guidance plus autonomous fast execution is itself novel. [L29]

## 3. Comparative method families

| Method | What actually learns or runs | Useful regime | Failure mode to measure |
|---|---|---|---|
| Rules and FSM | Explicit guards and state transitions | Stable contracts, small action sets, exact recovery rules | Rule gaps, brittle state explosion, hidden history |
| Behavior tree | Composable condition/action nodes, reactive reevaluation, cancellation | Reusable bounded skills and failure recovery | Livelock, starvation, accidental repeated side effects |
| Logistic candidate scorer | Outcome likelihood from context-action features | Limited data, interpretable effects, CPU inference | Misspecified interactions, extrapolation, poor calibration |
| Gradient-boosted tree scorer | Nonlinear tabular context-action ranking | Mixed discrete/numeric features and moderate data | Distribution shift, sparse rare actions, feature leakage |
| Small recurrent policy | Compact history representation and action scores | Partial observability, delayed completion, repeated events | State drift, unobserved resets, forgotten commitments |
| Contextual bandit | Action utility from immediate observed feedback | One-step recoverable choices, model routing | Delayed consequences invalidate myopic formulation |
| Model-free sequential RL | Return-based policy/value learning | Cheap accurate simulator, long-term effects | Sample cost, reward hacking, unsafe exploration |
| Learned forward model plus search | Predict event transitions, search bounded futures | Repeated causal dynamics, alternative actions with delayed effects | Compounding model error and simulator exploitation |
| Learned deferral | Whether another solver is worth its cost | Complementary experts and observed outcome labels | Slow expert failures, biased paired data, changing providers |
| Persistent metacontroller | Chooses action/skill/observation/reasoner using state and budget | Mixed asynchronous software workflows | Stale decisions, control oscillation, escalating endlessly |

[BehaviorTree.CPP documentation](https://www.behaviortree.dev/docs/intro/) provides a mature implementation precedent for asynchronous actions, state-transition recording, replay, and hierarchical composition. Those capabilities should be baselines, not presented as inventions. [L01] [XGBoost](https://arxiv.org/abs/1603.02754) is an established tree-boosting system, providing a strong tabular comparator. [L43] A GRU is a conventional recurrent unit, originating in the [RNN Encoder-Decoder work](https://arxiv.org/abs/1406.1078); using it for controller state is an adaptation. [L44]

## 4. Proposed mathematical contract

The notation and engineering composition in this section are our proposed design, informed by the cited methods. They are not a theorem of universal safety or an implemented algorithm.

### 4.1 Observation, memory, and candidate actions

Let an incoming event be

\[
e_t=(\text{source},\text{kind},\text{payload},\text{event time},\text{arrival time},\text{sequence},\text{provenance}).
\]

The controller state contains two different kinds of memory:

\[
x_t=(s_t,h_t,b_t,g_t),\qquad
s_t=\operatorname{reduce}(s_{t-1},e_t),\qquad
h_t=f_\theta(h_{t-1},\phi(e_t,s_t),\Delta t).
\]

Here `s` is explicit authoritative state, `h` is optional learned state, `b` is the remaining resource budget, and `g` is a typed task or subgoal. Keep paths, permissions, immutable object IDs, committed operations, active leases, and deadlines in explicit state. Do not entrust these facts exclusively to a lossy hidden vector. Reset or migrate learned state on model/schema changes and record that operation.

Define a bounded candidate set from the registered capabilities and current task:

\[
\mathcal A_t=\operatorname{candidates}(s_t,g_t),\qquad
\mathcal A_t^{\rm adm}=\{a\in\mathcal A_t: C(a,s_t,b_t)=1\}.
\]

`C` checks schema, authorization, resource scope, preconditions, version freshness, execution limits, and available capabilities. Authorization is not a reward penalty. Candidate generation is a separate measured stage: ranking cannot recover an action that the generator omitted. An unknown tool description does not become an executable capability by embedding similarity.

### 4.2 Scores, uncertainty, and admissibility

Train outcome heads for success, harmful failure, duration, resource use, and expected progress, conditioned on both state and action. A practical score is

\[
\widehat U(a,x)=v(x)\widehat p_{\rm success}(a,x)
-\lambda_T\widehat T(a,x)-\lambda_C\widehat C(a,x)
-\lambda_R\widehat L_{\rm residual}(a,x).
\]

The utility is a task-specific engineering model; publish units and sensitivity to every weight. Reject actions that fail hard contracts before optimizing this score. A risk head does not license a forbidden action.

Distinguish four uncertainty sources: ambiguous outcomes even with full knowledge; incomplete model knowledge; missing observations; and stale or invalid action contracts. A softmax entropy or ensemble disagreement is only a diagnostic. It is not automatically a probability of failure or a statistical bound. A calibrated action-success estimate refers to a specified population and model version; it is not an assurance about a particular action.

Use a validated abstention gate, for example requiring an admissible action, sufficient support, valid freshness, and a calibrated risk threshold. If the gate fails, choose among observation, delegation, waiting, cancellation, or a structured request for missing input. Do not conflate abstention with task failure, and do not count a request for clarification as a completed task.

### 4.3 Delegation and value of computation

For a computation `c`, including a reasoner call, define

\[
\operatorname{VOC}(c\mid x)=
\mathbb E_{z,\Delta\mid c,x}\left[V(x'_{\Delta},z,b-\operatorname{cost}(c))\right]
-V_{\rm act}(x,b)-\lambda_C C(c).
\]

`z` is the computation result, and `x'_Delta` is the state when it arrives. This formulation includes the fact that software keeps changing while a planner thinks. For a simpler one-step implementation, learn the paired incremental task benefit of each expert and subtract its measured latency and resource cost. Treat uncertainty in this increment explicitly. A lower-confidence decision rule can reduce unsupported delegation claims, but is only as sound as its estimator and evaluation assumptions.

[Learning to select computations](https://arxiv.org/abs/1711.06892) develops Bayesian metalevel policy search for stopping, allocating computation, and planning. It is an important precedent for optimizing computation itself and recognizes that exact metareasoning is intractable. [L09] [Learning to defer](https://proceedings.mlr.press/v119/mozannar20b.html) formalizes joint prediction and referral to an imperfect downstream expert using cost-sensitive learning. Expert-specific error matters; uncertainty about the fast model alone is insufficient. [L10]

The [2026 Top-k Learning-to-Defer work](https://proceedings.iclr.cc/paper_files/paper/2026/hash/6dc129f0383f9fa270347bb09f0030d4-Abstract-Conference.html) studies selection of several cost-effective experts and adaptive expert counts. This is prior art for multi-expert allocation, but its reported consistency results are tied to its learning formulation. They do not establish safe concurrent execution of software tools. [L11]

Operationally, every delegation needs a task ID, state revision, budget, deadline, accepted response schema, and cancellation semantics. Revalidate a returned plan against current state. Slow results may be discarded when superseded. Use hysteresis or minimum dwell times to avoid repeated fast/slow switching, with exemptions for invalidated contracts. Hysteresis is a control heuristic that must be tested for delayed necessary intervention.

## 5. Learning data and the teacher boundary

Start from actual task outcomes and executable checks. Demonstrations may come from human operators, deterministic planners, existing agents, and LLM teachers, but teacher agreement is not ground truth. Persist the intended task, pre-action observation, candidate set, chosen action, exact tool and policy versions, execution result, postcondition, latency, costs, and any repair. Keep a distinction between an action proposed by a teacher, allowed by the contract, executed by the adapter, and successful under the task oracle.

[DAgger](https://proceedings.mlr.press/v15/ross11a.html) addresses the mismatch between expert demonstration states and states visited by the learned policy through iterative data aggregation. Its guarantees require its stated online-learning and oracle assumptions. [L03] [Policy distillation](https://arxiv.org/abs/1511.06295) transfers trained policies into smaller models and combines task specialists. Its empirical setting is Atari, not safe arbitrary software interaction. [L04]

Our adaptation: run the student in resettable software environments; request teacher labels on states the student actually encounters; validate proposed actions and outcomes; add verified cases to the training corpus. Keep a held-out task-family split untouched. Teacher-generated rationales are optional explanatory annotations, never substitutes for observable outcomes. Distill into candidate scores or typed option parameters, avoiding unnecessary text generation. Query teachers preferentially on disagreement, missing coverage, novelty, and consequential boundaries, while reserving an unbiased audit sample.

For multi-step demonstrations, distinguish a good local action from a globally successful trajectory. Failed traces are useful for failure prediction but must not silently become positive imitation targets. Duplicate templates, paraphrases, shared repositories, and common tool traces can leak across random row splits. Split by workflow family, repository or environment instance, temporal period, and capability version before deriving windows and features.

### Sample efficiency is an empirical result

Report verified training decisions, completed trajectories, teacher calls, simulator steps, GPU hours, and human annotation effort separately. Publish learning curves at fixed data and compute budgets. Transfer embeddings can reduce data needs, but their own inference time, licensing, and domain shift belong in the accounting.

A proposed starting measurement ladder is 100, 300, 1,000, 3,000, and 10,000 independent training episodes per environment family, stopping only according to a preregistered uncertainty/learning-curve rule. These are experiment design points, not a claim that a given count is sufficient. The number of rows is not the number of independent episodes.

For a frozen policy with zero observed failures in `n` independent Bernoulli trials, the exact one-sided 95% upper bound is

\[
p_{\rm fail}\leq 1-0.05^{1/n}.
\]

Thus 300 zero-failure independent trials support approximately a 1% upper bound, not a 0.1% claim. Roughly 2,995 are needed for a 0.1% upper bound. Repeated events from the same workflow, adaptive policy selection, distribution shift, and unobserved failures invalidate a naive use of this calculation. This is an original application of the binomial model, not a certification rule for the proposed product.

## 6. Contextual bandits and offline policy evaluation

[LinUCB's original contextual-bandit study](https://arxiv.org/abs/1003.0146) models context-sensitive recommendation and evaluates from randomized logged traffic. It supports a small, efficient adaptive baseline. It does not make every software workflow a contextual bandit. [L41] [Vowpal Wabbit's documentation](https://vowpalwabbit.org/docs/vowpal_wabbit/python/9.0.1/tutorials/python_Contextual_bandits_and_Vowpal_Wabbit.html) exposes context, action, probability, and reward/cost and supports changing action sets through action-dependent features. The linked documentation version is explicit. [L36]

Use a contextual bandit when the chosen action's relevant consequence can be captured in a well-defined feedback endpoint without modeling its effects on future states, for example routing an independent classification task to one of several solvers. If a tool action modifies files, changes available actions, acquires a lock, or creates future work, the full problem is sequential. A bandit remains a useful *myopic baseline*, but its regret story must not be applied to long-term return.

Let a logged sample be `(x_i,A_i,a_i,r_i,mu_i)` where `mu_i` is the actual probability of selecting the executed action after masks and exploration. A contextual-bandit doubly robust estimator is

\[
\widehat V_{DR}(\pi)=\frac1n\sum_i\left[
\sum_{a\in A_i}\pi(a\mid x_i)\widehat q(x_i,a)
+\frac{\pi(a_i\mid x_i)}{\mu_i}\left(r_i-\widehat q(x_i,a_i)\right)
\right].
\]

[Doubly Robust Policy Evaluation and Learning](https://arxiv.org/abs/1103.4601) combines direct reward modeling with importance weighting to reduce weaknesses of either alone. Robustness concerns the estimator under its assumptions; it does not manufacture missing action support. [L05]

For use here, require correct logged probabilities or justified propensity estimation, consistency of outcomes, sufficient overlap `mu(a|x)>0` wherever the target policy may act, pre-decision context, and no unmeasured confounding for an observational interpretation. Cross-fit reward models. Keep policy tuning separate from final evaluation. Report weight distributions, clipping sensitivity, effective sample size `(sum w)^2/sum w^2`, and task-cluster uncertainty. A deterministic log provides no counterfactual coverage for unchosen alternatives. Never turn an unobserved action into a labeled failure or success.

Sequential importance weights can have severe variance as horizons grow. Bandit DR on individual workflow rows is not valid evaluation of a new sequential controller's total return. Prefer prospective paired sandbox rollouts from matched starting states for this product, and use sequential OPE only with its separate assumptions and diagnostics. Matching seeds helps variance but does not mean two divergent policies encounter identical states.

## 7. Sequential RL, options, and learned forward models

[PPO](https://arxiv.org/abs/1707.06347) is an established policy-gradient family that alternates interaction and surrogate-objective optimization. Its empirical simplicity makes it a reasonable simulator baseline; clipping is not a safety guarantee. [L42] [CQL](https://arxiv.org/abs/2006.04779) regularizes value estimates to address offline distribution shift. [L06] [IQL](https://arxiv.org/abs/2110.06169) uses expectile value estimation and advantage-weighted behavior cloning without querying out-of-dataset actions during its value-learning procedure. [L07] Neither should be marketed as solving unsupported behavior under arbitrary deployment shift.

[Options](https://www.sciencedirect.com/science/article/pii/S0004370299000521) extend actions to temporally extended closed-loop policies and relate them to semi-Markov decision processes. They provide the right vocabulary for bounded software skills with initiation conditions, internal policies, and termination rules. [L02]

For the proposed controller, an option is `o=(I_o,pi_o,beta_o,contract_o)`. Its value obeys the usual duration-aware form

\[
Q(x,o)=\mathbb E\left[\sum_{k=0}^{\tau-1}\gamma^k r_{t+k}+\gamma^\tau V(x_{t+\tau})\right].
\]

In continuous wall time, use a stated time discount such as `exp(-rho * elapsed)` if appropriate. Report actual completion delay separately. Attach maximum duration, allowed resource scope, cancelability, and idempotency requirements to each software skill. Option learning may improve reuse, but does not eliminate the need for a well-defined reward and transition model.

[Dreamer's world-model study](https://www.nature.com/articles/s41586-025-08744-2) demonstrates broad control learning through learned latent dynamics and imagined trajectories. It supports the value of world models in appropriate environments, not the assumption that a small software-event dataset reproduces its capability. [L08]

The recommended software comparison learns action-conditioned distributions over typed next events, completion status, cost, and selected state changes. It performs bounded lookahead over admissible candidates. Measure transition error, calibration, rollout error by depth, and planning overhead. Supply exact transition rules where the system already knows them; learning deterministic file existence semantics from scratch has no inherent scientific merit. Never execute imagined successful results as if they were observed. Deep imagined rollouts can amplify a modest one-step error.

Use RL exploration only in resettable fixtures or other explicitly scoped environments with enforceable capability limits. A live deployment can collect outcomes under its frozen approved policy without changing weights. [Shielding research](https://arxiv.org/abs/1708.08611) illustrates enforcing formal properties around a learning policy. Its guarantees depend on the specification and environment abstraction; calling a schema validator a formally verified shield would overstate the evidence. [L35]

## 8. Calibration, selective prediction, and conformal limits

[Guo et al.](https://proceedings.mlr.press/v70/guo17a.html) show that modern neural classification probabilities can be miscalibrated and evaluate post-hoc calibration, including temperature scaling. This supports holding out calibration data. It does not establish that a controller's top softmax score equals task success probability. [L17]

For an acceptance rule `g(x)` and loss `ell`, report both

\[
\operatorname{coverage}=\mathbb E[g(X)],\qquad
\operatorname{selectiveRisk}=\frac{\mathbb E[g(X)\ell(X)]}{\mathbb E[g(X)]}.
\]

Also report end-to-end risk after referral, referral frequency, deadline misses, and cost. A reject-all system can have no automated mistakes and zero useful coverage. A low global calibration error can conceal severe failures on rare actions or important subgroups. Use reliability diagrams, Brier score, log loss, and risk-coverage curves; report per-family calibration where there is enough independent evidence. Missing labels and delayed failures need their own accounting.

[Conformal Risk Control](https://arxiv.org/html/2208.02814v4) controls expected monotone bounded loss under its stated sampling conditions; the theorem is not a per-action or conditional guarantee. [L18] [Conformal prediction beyond exchangeability](https://arxiv.org/abs/2202.13415) studies weakened assumptions and weighted methods for drift, including degradation of coverage. It does not justify distribution-free certainty under arbitrary adversarial software changes. [L19]

Our design implication: use conformal sets only for precisely stated prediction problems with held-out calibration units and a valid mapping from set output to control. A set containing the correct action with marginal probability `1-alpha` does not certify every action in the set, nor the success of a long action sequence. Conditional error among accepted actions is a ratio and is not automatically controlled by a theorem for an unconditional monotone loss. For sequential workflows, calibrate and evaluate at workflow level or justify a sequential theorem. Do not reuse the calibration set to select architectures and then advertise its nominal guarantee.

## 9. Open-world tools and learned affordances

[SayCan](https://arxiv.org/abs/2204.01691) grounds language-guided skill choice in learned feasibility/value information. This is direct precedent for combining goal relevance with an affordance estimate. Its robot skill library is not arbitrary tool discovery. [L15] [Voyager](https://arxiv.org/abs/2305.16291) develops an embodied Minecraft agent with an automatic curriculum, a reusable skill library, and execution-feedback-driven improvement. This motivates persistent verified skills, while its environment and generated-code execution boundary must be respected. [L16]

For software, separate `relevant`, `available`, `authorized`, `well-formed`, `likely to succeed`, and `observed successful`. A textual match only concerns some of those predicates. Tool descriptions and results are untrusted observations, not policy updates. New tool registration requires schema/version metadata, effects, failure semantics, and adapter tests. Cold-start tools should not inherit confidence from semantically similar tools without validation.

Use factorized scoring over `(context, candidate descriptor)` to accommodate a changing capability set, plus a reject/unknown candidate. Candidate descriptors should include effect class, object type, observed health, dependency status, and required authority. Free-form action synthesis belongs to a slower proposal process that must pass the same registration and execution checks. Open-world *recognition* and open-world *authority* are different problems.

## 10. Recurrent state and hardware choices

| Family | Evidence reviewed | Relevance to software control | Decision |
|---|---|---|---|
| Small GRU | Established gated recurrence [L44] | Cheap sequential baseline with an explicit hidden-state contract | Mandatory comparator |
| Mamba-2 | Structured state-space duality and efficient kernels [L22] | Long event streams may benefit; language-model throughput is not batch-one controller latency | Optional comparative study |
| Mamba-3 | 2026 inference-oriented SSM advances [L23] | Current adjacent architecture, important for an up-to-date review | Optional comparative study |
| RWKV-7 | Dynamic recurrent state evolution [L24] | Fixed-size recurrent state; parameter and state precision still matter | Optional comparative study |
| Liquid time-constant network | Continuous-time recurrent dynamics [L25] | Irregular event timing is a plausible use | Research comparison |
| Closed-form continuous-time network | Approximate closed-form dynamics [L26] | Avoids an ODE solver in its intended formulation | Preferred liquid comparator if tested |
| Spiking network | PyTorch-based snnTorch implementation [L27] | Event-oriented representation does not by itself give sparse hardware execution | Excluded from core runtime |

[Mamba-2](https://arxiv.org/abs/2405.21060) reports efficient structured state-space layers and connections to attention. Its reported speed advantage is specific to tested kernels and workloads. [L22] [Mamba-3](https://arxiv.org/abs/2603.15569) is current 2026 primary work and must be included if claiming a frontier SSM comparison. [L23] The [official repository](https://github.com/state-spaces/mamba) lists Linux and PyTorch requirements; its current installation distinguishes the core package from opt-in CUDA selective-scan extensions and includes Mamba-3. Installation success is not evidence of full CPU/native-Windows support or favorable latency. [L37]

[RWKV-7](https://arxiv.org/html/2503.14456v1) discusses bounded recurrent state and explicitly identifies numerical precision sensitivity in its state-update kernel. Its paper's models are base models; paper evaluation should not be conflated with later instruction-tuned releases. [L24] The [official RWKV repository](https://github.com/BlinkDL/RWKV-LM) is the implementation source to pin for any comparison. Constant memory with sequence length does not mean small absolute memory or perfect retention of all history. [L38]

[Liquid Time-constant Networks](https://arxiv.org/abs/2006.04439) model adaptive continuous-time dynamics. [L25] [Closed-form continuous-time networks](https://doi.org/10.1038/s42256-022-00556-7) approximate the relevant dynamics in a form that avoids repeated numerical DE solving; a reported advantage over ODE models is not a blanket advantage over a small GRU. [L26] The [author repository](https://github.com/raminmh/CfC) exposes PyTorch/TensorFlow implementations useful for a reproducible comparison. [L40]

[snnTorch](https://snntorch.readthedocs.io/en/latest/) supplies trainable spiking neurons, surrogate gradients, and explicit time-step examples in PyTorch. [L27] Our inference is that ordinary CPU/GPU execution can pay for time steps, spike encoding, and framework dispatch without receiving neuromorphic energy savings. Any energy advantage needs wall-plug or device-energy measurement on the actual hardware, including encoding and data transfer. Biological inspiration is not a performance measurement.

Recommended deployment split: Python for data preparation, training, calibration, and research; a typed compiled event/execution service where its latency and concurrency advantages are measured; a versioned portable inference artifact for a small scorer or recurrent policy. Rust is a reasonable systems-language choice, but a Rust/Python bridge is not inherently faster than an in-process compact model. Benchmark complete round trips, warm/cold starts, batching, serialization, concurrent tasks, and cancellation. Do not train a language model simply to obtain a recurrent state.

## 11. Continual learning without uncontrolled adaptation

[Elastic weight consolidation](https://arxiv.org/abs/1612.00796) addresses forgetting by penalizing changes to parameters important to older tasks. [L20] [CLS-ER](https://arxiv.org/abs/2201.12604) studies complementary semantic and episodic memories with experience replay in continual-learning benchmarks. [L21] These support evaluating retention and replay; neither proves safety of self-modifying controllers on live software.

Separate three update timescales: event-state updates during execution; append-only outcome collection; and offline weight or policy updates. New events can change state immediately without changing the learned policy. Promotion of new weights should require versioned training data, leakage-safe held-out cases, calibration, performance and risk regression checks, and reversible deployment. Keep a stable reference model alongside a candidate. A shadow policy can make predictions on observed states, but cannot provide counterfactual action outcomes without execution or additional assumptions.

Monitor input schema changes, feature distribution, action frequencies, score distributions, latency, delayed outcome rates, and task-specific failures. Unsupervised drift is a reason to investigate, not proof of degraded accuracy; stable feature distributions do not prove stable conditional outcomes. Recovery might require removing a capability, invalidating a cached skill, resetting state, recalibrating, or retraining. Report forgetting on old families and adaptation on new families separately.

## 12. Routing prior art and September 2026 update

[RouteLLM](https://arxiv.org/html/2406.18665v4) learns strong/weak model routing from preference data. Its paper explicitly reports degraded out-of-domain performance for some training sets and gains from domain-relevant augmentation. Thus a cheap router is a credible baseline, and conversational preference data alone is not a software-control outcome dataset. The [official code](https://github.com/lm-sys/RouteLLM) provides reusable routing/evaluation implementations. [L12, L39]

[BoundaryRouter](https://arxiv.org/abs/2605.07180), posted 2026-05-08, uses paired early experiences and retrieval-guided routing between direct LLM inference and full agent execution. The paper introduces RouteBench with in-domain, paraphrased, and out-of-domain settings. This is direct prior art for capability-boundary learning from observed solver outcomes. Its reported task improvements do not establish performance on this product's event streams. [L30]

[ODAR](https://arxiv.org/abs/2602.23681), posted 2026-02-27, proposes difficulty-based fast/slow routing and a free-energy-inspired answer-selection mechanism. Treat its headline benchmark figures as author-reported, unreproduced results. Active-inference terminology alone is insufficient justification for importing its scoring function into a software controller. [L31]

[FARE](https://arxiv.org/abs/2601.14681) combines an LLM's global exploration guidance with fast local RL and reports simulation plus hardware robot evaluation. [L32] [Agentic Fast-Slow Planning](https://arxiv.org/abs/2604.01681) separates semantic guidance, search, and MPC in CARLA. [L33] [Two-timescale SDN-IoT governance](https://arxiv.org/abs/2604.01127) describes fast action-masked PPO and slower structured policy updates. Its claims require domain-specific replication and do not transfer safety guarantees to software tools. [L34]

Search also located a 2026 bioRxiv item titled `Learning to select computations in recurrent neural circuits`, DOI `10.64898/2026.04.14.718499`. The primary page failed to open in this session. It is a discovery lead only; no theorem, result, or design choice here relies on it. This distinction is recorded to avoid upgrading a snippet into verified full-text evidence.

## 13. Mandatory baseline matrix and fair evaluation

Recommended 12-method implementation scope, contingent on the complete product plan:

| ID | Method | Minimum completed implementation and evidence |
|---|---|---|
| M01 | Explicit FSM/rules | Hand-authored competent workflow and recovery rules, shared adapters, same contracts |
| M02 | Behavior tree | Composed asynchronous skills, timeout/cancellation, identical action capabilities |
| M03 | Logistic candidate scorer | Train/calibrate/export/infer; context-action features and abstention |
| M04 | XGBoost candidate scorer | Same split and feature budget; tuning logged; calibrated output |
| M05 | GRU behavior cloning | Causal event history, state reset/replay, held-out trajectory tests |
| M06 | LinUCB | Correct propensities, actual feedback endpoint; one-step and myopic sequential results separated |
| M07 | Action-masked PPO | Trained in software simulator; learning curves, reward specification, transfer evaluation |
| M08 | Learned forward model and bounded lookahead | Model fit, transition/rollout validation, planning overhead and horizon sensitivity |
| M09 | Structured LLM-only action selection | Identical tool schemas and authority, per-event calls, retries/costs counted |
| M10 | Asynchronous FSM plus LLM | Honest DPT-style adaptation; stale-plan handling; comparable fixed slow-call budget |
| M11 | Calibrated learned deferral/cascade | Paired solver outcomes, frozen calibration, risk/coverage/cost frontier |
| M12 | Full persistent outcome-aware metacontroller | Same components and tools, explicit resource state, incremental value-based delegation |

The strongest current architectural adjacent source is Instruct-to-Act. Add a named sparse-instruction-conditioned recurrent-controller variant within M08/M12 comparisons. It should reuse M05's controller and the shared goal interface so that its extra contribution is measurable. Call it an `Instruct-to-Act-inspired software adaptation`, not a reproduction of the embodied paper. A full Dreamer or Instruct-to-Act reproduction would require its actual architecture, objectives, tasks, training budget, and artifact licensing, and must be a separate explicit scope.

Concrete engine choices are [scikit-learn `LogisticRegression`](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html) for M03 [L45], [XGBoost `XGBClassifier` or `XGBRanker`](https://xgboost.readthedocs.io/en/stable/python/python_api.html) for M04 [L46], and [PyTorch `nn.GRU`](https://docs.pytorch.org/docs/2.14/generated/torch.nn.modules.rnn.GRU.html) for M05 [L47]. A ranker's score needs a separately fitted probability/calibration model when used as risk evidence. Implement M06 as the documented LinUCB linear-algebra algorithm, checked against fixed small reference calculations; do not relabel an unrelated bandit algorithm as LinUCB. Use PyTorch for M08's transition and outcome heads with explicitly bounded search.

For M07, [SB3-Contrib `MaskablePPO`](https://sb3-contrib.readthedocs.io/en/master/modules/ppo_mask.html) is a concrete supported engine. Its documentation requires mask-aware evaluation, notes that recurrent policies are unsupported, and specifies in-environment masks for subprocess vectorization. Therefore M07 uses its supported nonrecurrent policy and explicit causal state or history features; it must not silently claim recurrent masked PPO. [L48] The [invalid-action-masking paper](https://arxiv.org/abs/2006.14171) provides method-specific analysis. An action mask handles modeled validity, not unmodeled effects or authorization errors. [L49]

Pin package versions and model-export formats after compatibility checks. The documentation versions observed in this research are evidence of available interfaces, not a tested dependency lock. M11 can use the same calibrated logistic/tree families with paired expert-outcome labels; M12 can combine those fitted heads with M05 state. A new biological label on the composition does not constitute a new learning algorithm, and no RLCD or other published algorithm is claimed reproduced without its actual procedure and evidence.

Every method must face the same task families, action registry, task success checker, event information, external capability limits, and wall-time accounting. Published methods may receive their appropriate training data, but the amount and cost must be recorded. Tune all trainable baselines with comparable search budgets. A weak FSM built only to make a learned controller look good is not a fair comparison.

Report end-to-end task success, actual contract violations, denied proposals, irreversible unintended effects, time to useful action, p50/p95/p99 controller overhead, total completion latency, stale actions prevented, recovery time, memory, CPU/GPU load, expert calls, tokens, energy where measured, and expense. Separate policy inference from perception/encoding, candidate generation, networking, tools, and durable logging. Publish warm and cold latency. No percentile is meaningful without sample count and workload.

Evaluate: held-out workflow families; new repositories and object names; tool renames and schema evolution; missing and out-of-order events; duplicate messages; delayed and failed reasoners; ambiguous task intent; irrelevant text; budget exhaustion; concurrency; changed solver quality; task interruption; and genuinely new capabilities. Keep malicious content tests separate from normal accuracy so a policy cannot improve safety scores by refusing everything.

[Agarwal et al.](https://arxiv.org/abs/2108.13264) demonstrate why point estimates from a few RL runs can mislead and recommend uncertainty-aware aggregate reporting. [L28] Use paired task comparisons, multiple seeds for stochastic training, stratified task-cluster resampling, confidence intervals, and sensitivity analyses. Independent workflow families are the principal sampling units; thousands of events from one workflow are not thousands of independent confirmations.

## 14. Falsifiable research claims

These are proposed hypotheses, not verified findings or established novelty:

1. **Persistent causal state helps:** M12 outperforms its stateless variant on delayed, duplicated, and reordered events at the same tool and reasoner budget. If explicit FSM state explains the gain, do not attribute it to learned recurrence.
2. **Outcome-grounded deferral helps:** measured incremental solver benefit beats confidence-only and fixed-interval delegation at matched completion quality. Report whether paired-outcome data costs erase the runtime savings.
3. **Bounded temporal skills help:** skill termination and cancellation improve recovery without sacrificing task success; compare primitive-only control and competent behavior trees.
4. **Learning adds value beyond engineering:** M12 improves the quality/latency/cost frontier over M01/M02/M10 under held-out variations, with uncertainty intervals. If rules win, document that result and deploy rules for those families.
5. **New tools can be handled conservatively:** candidate-conditioned scoring plus validated registration adapts to held-out capabilities with measured calibration and sample complexity. Similar text labels alone do not establish this claim.
6. **The fast path is actually fast:** total controller overhead, including encoding and logging, meets a preregistered budget on named CPU hardware at realistic concurrency. No GPU throughput figure substitutes for this measurement.

The likely publishable contribution is a reproducible software-control benchmark and a specific validated method for persistent outcome-based computation allocation under asynchronous state changes. Existing literature prevents asserting that the broad fast/slow architecture, memory, tools, options, or learned routing is new. A systematic patent or exhaustive priority review was not performed.

## 15. Research completion boundary

This dossier verifies source identities and records the evidence actually accessed. No upstream experimental result has been independently reproduced in this session. No policies have been trained, no performance has been measured, and no product or package code is included. A design built from these sources must preserve the distinction between literature evidence, derived mathematics, proposed implementation, and measured results.
