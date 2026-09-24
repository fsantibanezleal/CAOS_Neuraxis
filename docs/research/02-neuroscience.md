# Neuroscience and cognitive science for a fast software controller

Research date: 2026-09-20. Status: research and engineering hypotheses, not an implemented or validated architecture. Companion source ledger: [sources-neuroscience.json](sources-neuroscience.json).

## 1. The defensible scientific starting point

The useful objective is an event-driven controller that maintains task state, selects a bounded action, notices when its assumptions fail, interrupts execution when necessary, and recruits more expensive computation when that computation is likely to help. Calling this a "System One" tool is a product metaphor. The design should be evaluated as a software controller, not as a reproduction of a human cognitive system.

There are three distinctions that must remain separate:

1. **Decision latency:** a precomputed policy can answer quickly; search, simulation, or token generation can take longer.
2. **Learning timescale:** a policy may require expensive training but execute quickly; a recurrent controller may adapt its state immediately without changing its weights.
3. **Representation and control:** an algorithm may use a learned transition model, cached values, explicit rules, episodic retrieval, or several of these together.

Fast execution does not imply model-free learning, lack of memory, lack of reasoning, or absence of context. Slow execution does not imply greater correctness. An LLM is not categorically "System Two": an immediate learned response can function as an amortized policy, while an agent loop using search and verification can provide deliberative control. Those are functional descriptions of the deployed computation. They do not identify a biological counterpart or establish consciousness.

**Recommendation derived from the review:** use a small, stateful, calibrated controller with a separate execution gate and a slower planning service. Make each claimed neuroscience contribution falsifiable through an ablation. Avoid naming every software module after a brain region; that invites a false claim of mechanistic fidelity.

## 2. Review method and evidence boundaries

This is a targeted primary-source review organized around engineering decisions, not a systematic review or a claim to exhaust neuroscience. It covers original behavioral experiments, imaging/electrophysiology, one causal optogenetic study, and original computational models. One explicitly identified opinion article provides criticism of the binary typology. Publication years range from 1995 to 2025.

The ledger contains 22 papers: 21 original empirical/computational contributions and one opinion article. Seventeen have directly obtained full-text documents with relevant sections inspected. Five have more restricted access: primary abstracts and/or indexed sections, explicitly marked below and in the ledger. "Full text" means that the complete document was obtainable and the relevant portions were read; it does not mean independent reproduction, extraction of every result, or review of every supplement.

PMC repeatedly returned a browser verification page on direct access. No challenge was bypassed. Author and institutional PDFs were used where available. Some PDFs parsed through the web tool but subsequent reads timed out; direct public PDF retrieval and in-memory PyMuPDF text extraction were used for Bago, Mante, Dehaene, Yu, and Wang. The ledger records the actual accessible URLs. No paper text or figure is redistributed here. Secondary reviews and search-result summaries were not used as substitutes for empirical evidence.

Evidence labels used below:

- **Empirical:** the paper reports a measurement or intervention in a specific task and population.
- **Computational:** the paper proposes or analyzes a model; fit or qualitative agreement does not establish that the brain implements it.
- **Engineering inference:** a proposal for this software project. It needs its own experiment and is not a finding of the cited paper.
- **Access-limited:** only the listed primary abstract/indexed sections were inspected; detailed effect-size or implementation claims are withheld.

## 3. What the System 1/System 2 metaphor misses

**N01, Bago and De Neys (2017), empirical.** Across four reasoning experiments using a two-response design and manipulations including response deadlines and cognitive load, correct logical answers sometimes appeared in the initial response. This challenges the assumption that an intuitive answer must be erroneous before deliberation corrects it. These were constrained reasoning tasks; they do not show that immediate reasoning is generally reliable. [Paper and DOI](https://doi.org/10.1016/j.cognition.2016.10.014), [author full text](https://www.wdeneys.org/data/Fast_logic%20reprint.pdf).

**N02, Melnikoff and Bargh (2018), opinion.** The authors argue that efficiency, awareness, intention, and controllability do not form an established pair of perfectly aligned psychological categories. This is a critique of a broad typology, not an experimental refutation of every dual-process model. Its practical value is to prevent the project from treating several independent properties as one label. [Paper and DOI](https://doi.org/10.1016/j.tics.2018.02.001), [author full text](https://acmelab.yale.edu/sites/default/files/melnikoff_bargh_2018_mythical_number_2_0.pdf).

**Engineering inference:** describe every controller using measured dimensions: response-time distribution, state retained, training data, action vocabulary, adaptation rule, calibration, permitted effects, and abstention behavior. The UI should distinguish "local policy", "retrieved procedure", "planner consultation", and "blocked action". A fast lane may contain a neural network, a classifier, a verified rule, or a cached plan. None earns scientific legitimacy merely from its speed.

## 4. Arbitration: choose computation by reliability and value

**N03, Daw, Niv, and Dayan (2005), computational.** Their model arbitrates between cached action values and a transition-model-based evaluator using estimated uncertainty. Statistical efficiency and the cost/error of deeper computation can favor different controllers at different points in training. The paper explicitly approximates uncertainty; the proposed anatomical mapping is a hypothesis. It is not evidence that confidence alone is a safe execution criterion. [Paper and DOI](https://doi.org/10.1038/nn1560), [full text with supplement](https://worthylab.org/wp-content/uploads/2020/12/dawetal_2005_uncertaintybasedcompetition.pdf).

**N04, Daw et al. (2011), empirical plus model.** Human choices in a two-stage task reflected both model-based and model-free influences. Striatal BOLD prediction-error signals also contained model-based information, weakening a strict separation between a planning system and a purely cached-value striatum. BOLD is not a direct dopamine measurement, and the task does not isolate all possible algorithms. [Paper and DOI](https://doi.org/10.1016/j.neuron.2011.02.027), [author full text](https://gershmanlab.com/pubs/Daw11.pdf).

**N05, Lee, Shimojo, and O'Doherty (2014), empirical plus model, access-limited.** The reported arbitration model compares reliability derived from prediction-error histories. Inferior lateral prefrontal and frontopolar activity covaried with reliability-related signals. The indexed methods describe model-free SARSA, model-based learning/planning, and a push-pull arbitration scheme. Model comparison and fMRI covariation support this account within the experiment; they do not uniquely identify a universal neural arbiter. [Paper and DOI](https://doi.org/10.1016/j.neuron.2013.11.028), [primary indexed manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC3968946/).

**N06, Kool, Cushman, and Gershman (2016), empirical plus simulation.** The commonly used two-step task did not reliably provide the presumed reward advantage for additional model-based control across their parameter exploration. A redesigned task created a clearer benefit, and participants used more model-based control. A benchmark can separate algorithms while failing to test whether deliberation is worth its cost. [Full text and DOI](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1005090), [paper's code/data](https://github.com/wkool/tradeoffs).

### A controller objective derived for this project

The following is an **engineering objective**, not an equation claimed to describe these brain regions. Let `z` be the current observable/belief state, `A_safe(z)` the actions admitted by deterministic permission and precondition checks, and `U(a,z)` the task utility. Let `Y` be a possible result from a planner consultation and `z_Y` the resulting revised state. Then an idealized value of consultation is

\[
\operatorname{VoC}(z)=
\mathbb E_Y\left[\max_{a\in A_{\mathrm{safe}}(z_Y)}U(a,z_Y)\right]
-\max_{a\in A_{\mathrm{safe}}(z)}U(a,z)
-C_{\mathrm{compute}}(z)-C_{\mathrm{delay}}(z).
\]

This quantity is generally unavailable exactly. Learn an estimate from paired evaluations of local actions and planner-assisted actions. Preserve the distinction between the planner's information value and the cost of waiting. If the local policy and the planner are both uncertain, consultation is not automatically useful; a read-only observation, abstention, or human clarification may have higher value.

Execution constraints should not be traded for reward by placing a very large penalty in the utility function. First restrict the action set using authorization, current resource versions, tool schemas, effect class, and reversibility. Then optimize among admitted actions. The arbiter estimates usefulness; the executor establishes admissibility.

**Required ablation:** compare always-local, always-planner, fixed threshold, learned reliability gate, and learned value-of-consultation gate under the same task distribution. Include a cheap reliable planner and an expensive unreliable planner as controlled conditions. Report completion, violations, dollars/tokens, p50/p95/p99 decision latency, unnecessary consultations, and missed necessary consultations. A gate that saves calls only by abandoning hard tasks fails.

## 5. Basal ganglia and interrupt control: separate stopping from deciding

**N07, Aron and Poldrack (2006), empirical, access-limited.** Two fMRI experiments associated stop-signal inhibition with right inferior frontal cortex and activation near the subthalamic nucleus. The authors proposed a stopping pathway and explicitly noted limits of activation-based inference and anatomical resolution. This paper did not establish a monosynaptic hyperdirect route as the unique implementation. [Paper and DOI](https://doi.org/10.1523/JNEUROSCI.4682-05.2006), [primary abstract](https://pubmed.ncbi.nlm.nih.gov/16510720/), [indexed discussion](https://pmc.ncbi.nlm.nih.gov/articles/PMC6793670/).

**N08, Wessel et al. (2016), empirical.** Unexpected events impaired verbal working-memory performance; scalp EEG and subthalamic recordings implicated signals also associated with stopping. Intracranial recordings came from Parkinson's patients. The authors discuss the difficulty of distinguishing suppression from attentional detection. The finding supports studying interruption costs, not assuming every surprising event should abort everything. [Paper and DOI](https://doi.org/10.1038/ncomms11195), [institutional full text](https://pure-oai.bham.ac.uk/ws/files/31763763/Wessel_et_al_Surprise_disrupts_cognition_Nature_Communications.pdf).

**N09, Heston et al. (2020), empirical causal intervention.** In mice performing delayed match-to-position, brief optogenetic STN activation increased errors and slowed responses. Inhibition attenuated surprise-related slowing but did not rescue the error pattern and itself impaired performance. Thus response speed and correct retained task state dissociate. Motor, engagement, and memory explanations are not fully separated. [Paper and DOI](https://doi.org/10.1523/ENEURO.0159-20.2020), [author full text](https://neurosciences.ucsd.edu/research/labs/hnasko/_files/Activation-of-Subthalamic-Nucleus-Stop-Circuit-Disrupts-Cognitive-Performance.pdf).

**Engineering inference:** an interrupt service should be independent of model inference and able to revoke future dispatch rights immediately. Running a large inference must not delay processing an explicit user cancellation or a revoked capability. Preserve a durable task checkpoint before cancellation rather than wiping all working state.

Use explicit execution states: `proposed -> admitted -> dispatched -> acknowledged -> verified`, with separate `cancel_requested`, `cancel_acknowledged`, and `effect_unknown` states. A network timeout does not mean an external write failed. A killed child process does not prove a remote request was cancelled. Retrying a non-idempotent operation while its effect is unknown can duplicate it.

Three distinct mechanisms are required:

- **Local pause:** hold one task while checking an unexpected observation.
- **Scope cancellation:** revoke an action family, task lease, or resource lease.
- **Global emergency stop:** block all new effectful dispatch until a known recovery condition is satisfied.

The analogy suggests separation of fast suppression and slower reorientation. Software correctness dictates the actual protocol: idempotency keys, cancellation acknowledgement, leases, version checks, and recovery records. Those are engineering requirements, not biological claims.

**Required ablation:** inject cancellations before admission, during inference, during dispatch, after remote acknowledgement, and during verification. Compare a shared event queue against independent interrupt priority, and checkpoint preservation against state reset. Measure time to block new effects, effects occurring after revocation, duplicate writes, false stops, resumed-task success, and lost task state. Stopping faster while losing the user's objective is not a successful controller.

## 6. Cerebellar and predictive mechanisms: predict consequences, inspect residuals

**N10, Tseng et al. (2007), empirical.** Seven participants with hereditary cerebellar ataxia and seven matched controls performed reaching with visuomotor perturbation. Comparing movements with and without online correction implicated sensory prediction error in adaptation; cerebellar participants were impaired in both conditions. This is evidence about a small motor-adaptation study, not evidence that cerebellar learning directly solves tool use. [Paper and DOI](https://doi.org/10.1152/jn.00266.2007), [author full text](https://reprints.shadmehrlab.org/CerebellarLearning_JNP07.pdf).

**N11, Rao and Ballard (1999), computational.** A hierarchical predictive-coding model learned from natural images and reproduced selected receptive-field phenomena. Top-down predictions and residual signals provide one possible account. The paper also discusses alternative recurrent mechanisms. It does not demonstrate a universal cortical algorithm, prove active inference, or establish that minimizing prediction error alone produces useful goals. [Paper and DOI](https://doi.org/10.1038/4580), [institutional full text](https://www.ni.cmu.edu/~tai/microns_papers/rao_ballard.pdf).

**Engineering inference:** learn action-conditioned predictions of observable tool consequences. Predict structured fields, not unrestricted explanatory text: expected exit-status family, files created or changed, response schema, resource version transition, latency interval, process liveness, and expected checkpoint. The predictor should see the actual admitted action and state snapshot. It must not predict success from a planner's claim that an action ought to succeed.

For an observed outcome `o_(t+1)`, one candidate surprise score is

\[
s_t=-\log p_\theta(o_{t+1}\mid z_t,a_t),
\qquad
e_t=o_{t+1}-\hat o_{t+1}
\]

where the residual expression applies only to meaningful numerical fields. These are proposed implementation choices. A categorical schema violation, authorization failure, or unexpected resource target should remain a separate hard event rather than being diluted into a single average score.

Prediction errors have different meanings. A legitimate rare outcome can be surprising. A malicious or unauthorized operation can be highly predictable. A reward miss can occur with an accurately predicted state transition. Therefore maintain separate state-prediction error, task-outcome error, permission violation, and sensor-quality signals.

**Required ablation:** outcome prediction versus exit-code-only verification; unconditioned versus action-conditioned prediction; raw surprise versus uncertainty-normalized surprise. Perturb tool response formats, delayed acknowledgements, stale files, partial writes, and benign output noise. Measure detection lead time, precision-recall at a fixed false-stop budget, downstream damage, and overhead. Keep a deterministic postcondition checker baseline.

## 7. Recurrent state and multiple timescales

**N12, Mante et al. (2013), empirical plus model.** Recordings from two macaques performing context-dependent motion/color decisions were analyzed as population dynamics. A trained recurrent network reproduced important features and showed how context could select information through dynamics rather than filtering all irrelevant input before it reached prefrontal cortex. Most neurons were recorded in separate sessions. The mechanism is sufficient in the model, not uniquely established for all cognition. [Paper and DOI](https://doi.org/10.1038/nature12742), [institutional full text](https://neurophysics.ucsd.edu/courses/physics_171/Newsome_line_decision.pdf).

**N13, Murray et al. (2014), empirical.** Spiking data from 26 monkeys across seven cortical areas and six research groups exhibited a hierarchy of intrinsic autocorrelation timescales. Sensory areas tended toward shorter timescales than association areas. Their definition concerns recorded population statistics, not fixed universal processing deadlines or proof of two clocks. [Paper and DOI](https://doi.org/10.1038/nn.3862), [author full text with methods](https://johndmurray.org/papers/murray_2014_nn.pdf).

**N14, Smith, Ghazizadeh, and Shadmehr (2006), empirical plus model.** A two-rate model, with differing sensitivity to error and retention, predicted spontaneous recovery in human motor adaptation. The experiments support more than one learning timescale in that task. A good two-state fit does not identify two unique neural populations, and these timescales are not the System 1/System 2 distinction. [Full text and DOI](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.0040179).

**Engineering inference:** retain several forms of state with independently controlled lifetimes:

| State | Examples | Retention and invalidation |
|---|---|---|
| Immediate execution | Current observation, action phase, pending interrupt | Updated per event; invalidated by resource/version change |
| Task episode | Goal, dependencies, attempted actions, current subproblem | Durable until task closure; resumable across process restart |
| Recent operating regime | Latency, schema reliability, failure bursts | Sliding/adaptive window with explicit change detection |
| Learned procedure | Policy weights, verified skill metadata, calibration | Versioned artifact promoted after offline validation |
| Episodic evidence | Observation-action-result records and provenance | Append-only lineage with retention/redaction policy |

A small GRU or state-space network is a candidate for the learned state update. A finite-state machine plus engineered rolling features is the mandatory simpler baseline. Context should influence which information is retained and which actions are considered, while permissions remain outside the learned hidden state.

An optional multi-rate feature update is

\[
h_t^{(k)}=(1-\alpha_k)h_{t-1}^{(k)}+\alpha_k\phi_k(o_t,a_{t-1}),
\quad 0<\alpha_k\leq 1.
\]

This is an engineering baseline, not a neural model. It assumes regular event semantics; elapsed-time decay is preferable when event timing varies. Sudden context changes may invalidate state and require a reset or context-specific memory rather than a slow average.

**Required ablation:** memoryless classifier, hand-designed state, recurrent state, and multi-timescale state, matched for parameter count or computational budget. Use the same latest observation after different histories so a memoryless policy cannot solve the task. Test interleaved projects, regime reversals, delayed tool results, and restart/resume. Report context confusion, adaptation delay, old-task retention, and state drift.

## 8. Episodic memory, consolidation, and replay

**N15, McClelland, McNaughton, and O'Reilly (1995), computational synthesis.** Complementary learning systems explain why rapid storage of individual episodes can coexist with gradual learning of shared structure. Their connectionist simulations emphasize interference and interleaving. This foundational account includes simplified models and does not establish that every new fact must always be learned slowly by cortex. [Paper and DOI](https://doi.org/10.1037/0033-295X.102.3.419), [author full text](https://web.stanford.edu/~jlmcc/papers/McCMcNaughtonOReilly95.pdf).

**N16, Mattar and Daw (2018), computational.** Their normative model prioritizes memory access by an expected value of a backup, decomposed into gain and need, and qualitatively reproduces several replay patterns. The paper explicitly does not supply an efficient process-level solution for finding the optimal memory. Grid-world simulations are not direct proof that biological replay computes this objective. [Paper and DOI](https://doi.org/10.1038/s41593-018-0232-z), [author full text](https://www.princeton.edu/~ndaw/md18.pdf), [paper code](https://github.com/marcelomattar/PrioritizedReplay).

**Engineering inference:** separate evidence capture from policy promotion. Store a validated execution trace immediately, but do not let a single successful LLM-generated action automatically become a trusted habit. Candidate procedures should include preconditions, typed parameters, tool-version constraints, expected postconditions, effect class, failure evidence, and an expiry/invalidation rule.

Consolidation can train a policy from planner-guided traces, counterexamples, and controlled exploration in isolated environments. Sample both valuable new experiences and retained old skills; retain rare failures rather than balancing them away. An approximate replay priority can combine expected recurrence, estimated learning gain, and severity of the failure being prevented. Treat this as a measurable scheduling heuristic. Computing priority over an enormous memory can cost more than uniform sampling, so the scheduler itself needs an overhead budget.

**Required ablation:** uniform replay, prediction-error replay, recurrence-only replay, and gain-times-need-inspired replay under equal update counts and wall-clock budgets. Compare immediate online weight updates against offline versioned promotion. Test an A -> B -> A sequence of tool regimes, rare failures, and removal of a once-valid capability. Evaluate forgetting, unsafe transfer, learning curves, recovery after rollback, and whether old permissions accidentally survive in retrieved skills.

## 9. Uncertainty and neuromodulation: several signals, not a confidence scalar

**N17, Yu and Dayan (2005), computational.** Their Bayesian account distinguishes expected unreliability within a context from unexpected changes of context, proposing roles for acetylcholine and norepinephrine. These chemical assignments are theoretical hypotheses; the useful transferable distinction is between noisy observations and a changing data-generating process. [Paper and DOI](https://doi.org/10.1016/j.neuron.2005.04.026), [author full text](https://www.gatsby.ucl.ac.uk/~dayan/papers/yud2005.pdf).

**N18, Nassar et al. (2012), empirical plus model, access-limited.** In a human predictive-inference task, pupil metrics covaried with model-derived instability/reliability quantities and with subsequent updating; the paper also reports an arousal manipulation. Pupil diameter is an indirect measure. These findings do not identify a unique neurotransmitter for each uncertainty variable or justify reading confidence directly from arousal. [Paper and DOI](https://doi.org/10.1038/nn.3130), [primary abstract](https://pubmed.ncbi.nlm.nih.gov/22660479/), [indexed methods/discussion](https://pmc.ncbi.nlm.nih.gov/articles/PMC3386464/).

**Engineering inference:** expose at least four different quantities to the arbiter: lack of knowledge about a decision, irreducible observation variability, evidence of context change, and expected action harm. A probability distribution over actions is not automatically calibrated uncertainty. High softmax confidence on an unseen tool schema is not grounds for execution.

Fit confidence against held-out decisions with observed outcomes. Use a separate calibration set and evaluate coverage-risk tradeoffs across tool families and action-effect classes. Monitor schema version, adapter identity, and resource provenance as explicit drift indicators. More sensor noise should not always cause more planner calls; if the planner receives the same uninformative data, a targeted new observation may be preferable. Hard authorization changes invalidate capability immediately, regardless of statistical confidence.

**Required ablation:** one uncertainty score versus separate noise/change/knowledge signals. Cross two independent experimental factors: observation noise and environment change rate. Add confident out-of-distribution errors. Measure calibration, abstention utility, context-change detection, false alarms, and recovery time. This is the test that determines whether the biological distinction contributes beyond a generic entropy threshold.

## 10. Salience and workspace: coordination analogies with strict limits

**N19, Sridharan, Levitin, and Menon (2008), empirical, access-limited.** Across fMRI experiments the authors associated right fronto-insular activity with transitions involving central-executive and default-mode networks, including directional analyses. A lagged predictive relationship in BOLD is not equivalent to a causal intervention. The result motivates prioritizing salient state changes, not a literal single brain switch or a direct mapping from default-mode activity to an LLM. [Paper and DOI](https://doi.org/10.1073/pnas.0800005105), [publisher](https://www.pnas.org/doi/10.1073/pnas.0800005105), [primary indexed text](https://pmc.ncbi.nlm.nih.gov/articles/PMC2527952/).

**N20, Dehaene, Kerszberg, and Changeux (1998), computational.** Their workspace model coordinates specialized processors and simulates changes in recruitment during a Stroop task, learning, and errors. This is a proposed neural architecture and simulation, not evidence that a software blackboard creates conscious experience. [Paper and DOI](https://doi.org/10.1073/pnas.95.24.14529), [institutional full text](https://www.ugr.es/~emadrid/dehaene%20etg.pdf).

**N21, Cogitate Consortium et al. (2025), empirical, access-limited.** This preregistered adversarial comparison used multiple recording methods to test selected predictions of global neuronal workspace and integrated information theories. The published account reports support for some predictions and challenges to both theories. Its conclusions are specific to the tested predictions and tasks. It supplies no validated test for AGI or consciousness in software. [Paper and DOI](https://doi.org/10.1038/s41586-025-08888-1), [publisher text](https://www.nature.com/articles/s41586-025-08888-1), [project](https://www.arc-cogitate.com/).

**Engineering inference:** a bounded task workspace can broadcast a compact decision record to the planner, verifier, and relevant specialist agents. Include goal, current evidence, resource versions, proposed action, uncertainties, and outstanding commitments. Do not broadcast the complete file archive or every agent message. Use provenance, access control, causal event IDs, and resource ownership to prevent a salient but untrusted message from becoming an instruction.

Salience is a scheduling signal, not permission. Repeated alarms must be deduplicated so an event storm cannot starve cancellation handling or useful progress. Conflicting agents should submit proposals to one resource owner rather than executing competing writes from their own copies of the context.

**Required ablation:** unrestricted broadcast, shared bounded state, and dependency-directed event delivery. Introduce simultaneous agents, noisy notifications, misleading tool text, and conflicting resource updates. Measure duplicate work, stale-context actions, queue growth, provenance loss, planner context cost, and successful resolution. A visually brain-like network diagram is not a result.

## 11. Meta-reinforcement learning as an alternative to a strict two-controller split

**N22, Wang et al. (2018), computational.** Their recurrent-network account shows how slower reinforcement learning across tasks can produce rapid adaptation through network dynamics on new instances, without changing weights during those instances. It offers a possible relationship between dopamine-driven learning and prefrontal computation. It is a computational account tested against selected behavioral/neural phenomena, not a causal identification of the brain's complete learning algorithm. [Paper and DOI](https://doi.org/10.1038/s41593-018-0147-8), [institutional manuscript](https://web.stanford.edu/class/cs379c/archive/2018/calendar_invited_talks/lectures/04/26/papers/WangetalPRETEXT.pdf).

**Engineering inference:** a recurrent policy trained across software-task families could learn an adaptive routing rule in its hidden state, including when to consult a planner. This is a candidate competitor to hand-designed arbitration, not an obligation to implement a more opaque controller. Distribution shift, hidden-state poisoning, and changing action schemas make frozen-weight adaptation insufficient by itself.

**Required ablation:** fixed contextual policy, explicit Bayesian/change-point features, recurrent meta-RL, and recurrent policy with a learned consultation action. Hold out entire tool families, workflow templates, and environment versions. Reset hidden state deliberately and measure whether adaptation was actually in recurrence or merely memorized task identifiers. Keep the same deterministic execution gate for every method.

## 12. Mechanism-to-experiment map

All mechanisms in the middle column are proposed software designs. They are not statements of biological equivalence.

| Biological/computational inspiration | Proposed mechanism | Necessary comparator and observable outcome |
|---|---|---|
| Reliability arbitration, N03-N06 | Calibrated local-policy/planner selection | Fixed gate and always-planner; utility per cost at matched safety |
| Stopping/reorientation, N07-N09 | Independent cancellation and checkpoint protocol | Shared queue and state reset; time to block effects and resumed correctness |
| Sensory prediction error, N10 | Action-conditioned postcondition predictor | Exit-code checks; early detection of partial/stale outcomes |
| Predictive residuals, N11 | Separate observed-versus-expected state signals | Generic anomaly detector; false alarms under benign novelty |
| Context-sensitive recurrence, N12 | Compact history state influencing policy | Memoryless and finite-state baselines; history-dependent task success |
| Multiple timescales, N13-N14 | Separate execution/task/regime state | Single-window state; noise resistance versus adaptation speed |
| Complementary learning, N15 | Episodic traces plus versioned policy consolidation | Immediate updates; forgetting and unsafe promotion |
| Prioritized replay, N16 | Estimated gain and recurrence replay budget | Uniform and error-only replay; learning per unit compute |
| Expected versus unexpected uncertainty, N17-N18 | Noise, novelty, drift, and risk as separate features | One entropy score; calibration under crossed noise/drift conditions |
| Salience/workspace, N19-N21 | Bounded, permissioned state dissemination | Full broadcast; stale-state errors and event overload |
| Meta-RL, N22 | Policy adaptation in recurrent state | Explicit adaptive rules; transfer to unseen workflows |

## 13. Concrete experimental suite for software interaction

This proposed suite tests the controller, not human neuroscience. Implement it using isolated files, local test services, deterministic event replays, and explicitly controlled fault injection. Real external actions require the same authorization contract as deployment. Synthetic cases must be labeled, while captured real traces require provenance and a defensible redistribution policy.

1. **Routine and reversal.** Learn a valid operation, then change a schema, working directory, target resource, or dependency. A good controller keeps routine latency low and stops using a stale habit before it creates a wrong effect.
2. **Perceptual aliasing.** Present identical latest tool responses after different histories: completed, pending, cancelled, or stale request. This isolates memory use from pattern classification.
3. **Interrupt timing.** Inject cancellation at every action phase and measure acknowledged effect state. This exposes the difference between cancelling thought and cancelling an operation.
4. **Planner utility crossover.** Vary planner reliability, latency, price, and task ambiguity independently. Include tasks where a local observation resolves uncertainty more cheaply than planning.
5. **Surprise versus harm.** Cross rare harmless events with common unauthorized actions. If the controller merely equates unusual with dangerous, the design is inadequate.
6. **Continual learning and return.** Train on environment A, switch to B, then return to A with some capabilities revoked. Separate retained competence from obsolete authority.
7. **Multiple concurrent agents.** Compete for the same resource, deliver observations out of order, replay duplicated events, and introduce stale planner responses. Test ownership and causal ordering.
8. **Overload and missing evidence.** Burst notifications, remove an observation, drop an acknowledgement, and restart a worker. The controller must expose uncertainty rather than fabricate completion.

Split by workflow and resource family, not random rows from the same trace. A recorded episode and its paraphrases or derived teacher labels belong to one split. Keep training, calibration, validation, and final test separate. Evaluate paired seeds and confidence intervals; do not optimize thresholds on the reported test suite. Report the action-effect class of every violation and the number of opportunities for that violation. Zero observed violations in a finite test set is not a proof of safety.

## 14. Architecture implications and language boundary

Neuroscience does not choose a programming language. It suggests separating a bounded reactive path from slower learning/planning and preserving meaningful state between them. The language choice follows runtime and integration measurements.

An independently scheduled Rust execution/event core is a reasonable candidate where predictable dispatch, typed action contracts, resource ownership, and cancellation dominate. Python is appropriate for scientific training, model comparison, calibration, offline replay, and adapters to existing ML tools. A Python-only baseline is still necessary to demonstrate that introducing a second language materially improves latency or isolation rather than only increasing complexity. These are engineering recommendations, not results of the reviewed papers.

Across a Python/native boundary, preserve one versioned action schema, stable event IDs, monotonic timing, explicit error/effect status, deterministic replay, and a small interface. An LLM should return a proposal with verifiable preconditions and expected postconditions. It should not mutate controller permissions or directly replace a trusted policy artifact.

The public scientific claim should initially be: **a neuroscience-informed, experimentally evaluated architecture for fast software action selection and selective planner recruitment**. Stronger novelty requires comparisons against existing controllers and routing systems. Neither a low latency result nor an anatomical analogy supports a claim of AGI, human-like cognition, biological fidelity, or consciousness.

## 15. Outstanding research limits and implementation gates

- Obtain and inspect complete methods/supplements for N05, N07, N18, N19, and N21 before implementing reproductions of their exact models or publishing detailed numerical claims about them. Current broad claims are limited to the accessible primary text.
- Most cited tasks are much smaller and better specified than open-ended software work. Partial observability, non-idempotent effects, adversarial input, changing schemas, and external authority are additional engineering problems.
- Similar behavior can arise from different mechanisms. Ablations establish the usefulness of a software component, not that it matches a brain circuit.
- An adaptive gate can learn dataset shortcuts. Test counterfactual cases that separate latency, uncertainty, expected benefit, and permission.
- Treat full cost as training, calibration, memory indexing, inference, planner use, verification, and recovery. Reporting local-policy inference time alone would misrepresent the system.
- Before calling a procedure a learned skill, require a reproducible training trace, defined applicability boundary, retained failure examples, calibrated selection, effect-aware execution, and rollbackable artifact version.

The immediate deliverable from this dossier is a set of testable design constraints and experiments. Product implementation and performance claims remain separate work.
