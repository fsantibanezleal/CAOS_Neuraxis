# Methodology

Twelve controllers share observations, registered actions and outcome checks. Their differences concern representation, learning, planning and computation allocation. Compare each method at the same environment boundary: the selector must never receive privileged evaluator state, and an appealing score must never substitute for authorization or a verified effect.

> ES: Doce controladores comparten observaciones, acciones registradas y verificación de resultados. Difieren en representación, aprendizaje, planificación y asignación de cómputo. Comparar cada método con el mismo límite de entorno: el selector nunca recibe estado privilegiado del evaluador y un puntaje atractivo nunca sustituye la autorización ni un efecto verificado.

## Exact control: M01 / M02

*ES: Control exacto: M01 / M02*

M01 is a guarded finite-state controller. Its state is an explicit record of observed resource revisions, workflow progress, outstanding effects, remaining budget and cancellation. An event enters a reducer; a state-dependent branch proposes one registered action; the executor repeats capability and revision checks immediately before the effect. This separation makes a familiar path inexpensive without claiming that all unfamiliar paths are representable. The browser implementation uses a seeded virtual clock, bounded retries and a small in-memory workspace. Those are actual simulator transitions, not measurements of the host operating system.

> ES: M01 es un controlador de estados finitos con guardas. Su estado registra revisiones observadas, progreso, efectos pendientes, presupuesto y cancelación. Un reductor incorpora eventos; una rama propone una acción registrada; el ejecutor repite comprobaciones de capacidad y revisión inmediatamente antes del efecto. Esta separación abarata rutas conocidas sin afirmar que representa cualquier ruta nueva. La implementación del navegador usa reloj virtual con semilla, reintentos acotados y memoria virtual. Son transiciones reales del simulador, no mediciones del sistema operativo.

M02 organizes registered skills into a reactive behavior tree. A sequence advances only after the current child reports success; a running child retains its execution identity; failure selects a recovery or fallback branch. A selector is not a probability model. Re-evaluating guards makes a tree responsive to changed circumstances, but a careless restart can duplicate an effect. Accordingly, completion records and idempotency state belong to the executor rather than to the visual tree position. The browser variant deliberately revisits a prerequisite after a failed action, while the FSM retries its current state.

> ES: M02 organiza habilidades registradas en un árbol reactivo. Una secuencia avanza solo tras el éxito del hijo actual; un hijo activo conserva su identidad; el fallo selecciona recuperación o alternativa. Un selector no es un modelo probabilístico. Reevaluar guardas responde a cambios, pero reiniciar sin cuidado duplica efectos. Los registros de finalización y la idempotencia pertenecen al ejecutor, no a la posición visual del árbol. La variante del navegador revisita un prerrequisito tras un fallo mientras la FSM reintenta el estado actual.

Temporal abstraction is useful when a skill has a declared initiation set, an internal policy and a termination rule. A file-validation skill may inspect, parse, validate and quarantine over several observations. Its declared read/write resources, timeout and cancellation semantics are as important as its nominal success path. A skill that remains running after cancellation cannot be treated as stopped merely because the tree has moved elsewhere. The same shared event and outcome records support comparing primitive actions against temporally extended skills.

> ES: La abstracción temporal es útil cuando una habilidad declara conjunto de inicio, política interna y terminación. La validación de archivos puede inspeccionar, analizar, validar y aislar a través de varias observaciones. Recursos de lectura y escritura, tiempo límite y cancelación importan tanto como la ruta nominal. Una habilidad todavía activa tras cancelar no está detenida porque el árbol avanzó. Los mismos registros permiten comparar acciones primitivas y habilidades extendidas.

The baseline must be competent. Use exact code for known schemas, argument binding, arithmetic, revision comparison and explicit business predicates. Measure failures on unseen variants, concurrent writes and missing observations rather than disabling recovery to make a learned method appear superior. In this release the browser exact policies make no calibrated probability claim: the candidate chart labels their branch priority as a score. Their strongest role is a reproducible reference and a fallback for supported tasks, not an assertion that hand-written logic alone solves open-world autonomy.

> ES: La referencia debe ser competente. Usar código exacto para esquemas conocidos, argumentos, aritmética, revisiones y predicados explícitos. Medir fallos en variantes nuevas, escrituras concurrentes y observaciones ausentes sin desactivar recuperación para favorecer métodos aprendidos. Las políticas exactas del navegador no declaran probabilidades calibradas: la gráfica identifica prioridad de rama como puntaje. Su papel es referencia reproducible y alternativa para tareas admitidas, no solución general de autonomía.

$$
x_{t+1}=R(x_t,o_{t+1}),\qquad a_t=\pi_{\mathrm{FSM}}(x_t,g)
$$

x is observed controller state, R the deterministic reducer, o an event, g the declared goal, t a decision index and a the selected registered action. Deterministic state can still contain stale or unknown facts.

> ES: x es el estado observado, R el reductor determinista, o un evento, g el objetivo declarado, t el índice de decisión y a la acción registrada. Un estado determinista puede contener hechos obsoletos o desconocidos.

$$
\omega=(I_\omega,\pi_\omega,\beta_\omega),\quad z_\omega\in\{\mathrm{running},\mathrm{success},\mathrm{failure}\}
$$

An option omega has an initiation set I, internal policy pi and termination rule beta. z is the execution status reported by the skill; it is an observation, not a success probability.

> ES: Una opción omega tiene conjunto de inicio I, política interna pi y regla de terminación beta. z es el estado informado por la habilidad; no es una probabilidad de éxito.


**Evidence limit:** Exact control is only as complete as its registered states, actions and guards. Passing a finite test suite does not establish correctness on arbitrary host software.

> ES: El control exacto depende de estados, acciones y guardas registrados. Superar pruebas finitas no demuestra corrección sobre software arbitrario.

[BehaviorTree.CPP documentation](https://www.behaviortree.dev/docs/intro/); [Sutton et al. 1999](https://doi.org/10.1016/S0004-3702(99)00052-1)

## Supervised scores: M03 / M04

*ES: Puntajes supervisados: M03 / M04*

M03 fits a logistic candidate scorer on causal state-action features. Training examples pair the observed workspace context with a candidate descriptor, not an arbitrary fixed index that changes meaning when tools are registered. The descriptor includes action type, resource role, feasibility and observed health. The target must identify a useful supported action or its observed consequence. An evaluator-only target filename, future fault, or reference label is excluded from the input. The feature manifest and preprocessing state travel with the fitted coefficients.

> ES: M03 ajusta un puntuador logístico con características causales de estado y acción. Los ejemplos emparejan contexto observado y descriptor candidato, no un índice cuyo significado cambia al registrar herramientas. El descriptor incluye tipo, recurso, factibilidad y estado observado. La etiqueta identifica una acción útil admitida o su consecuencia. Se excluyen objetivos ocultos, fallos futuros y etiquetas de referencia. El manifiesto de características y el preprocesamiento acompañan los coeficientes.

M04 replaces the linear score with gradient boosted trees. Trees can represent interactions such as a resource conflict combined with a nearly exhausted deadline. This flexibility also creates opportunities to memorize task identifiers, split leakage or fixture-specific shortcuts. A tree model must therefore receive the same permitted evidence and candidate set as the linear baseline. Its training and calibration groups are disjoint from held-out workflow groups. Model size, inference overhead and total feature-extraction time are reported separately from task completion.

> ES: M04 sustituye el puntaje lineal por árboles potenciados. Representan interacciones como conflicto de recurso y plazo casi agotado. Esa flexibilidad permite memorizar identificadores, contaminación entre particiones o atajos del escenario. El modelo recibe la misma evidencia permitida y candidatos que la referencia lineal. Entrenamiento y calibración se separan de grupos reservados. Tamaño, inferencia y extracción de características se informan aparte del tiempo de tarea.

Discrimination and calibration answer different questions. Ranking asks whether the selected candidate is preferable to alternatives. Calibration asks whether events assigned a probability occur at the stated frequency under an evaluation distribution. Fit temperature scaling, isotonic regression or another declared calibrator on a separate calibration partition, then freeze it. A ranker margin is not a probability. Candidate-set changes can alter the meaning of a normalized score even if the raw model is unchanged, so record both the score contract and the available candidates.

> ES: Discriminación y calibración responden preguntas diferentes. Ordenar pregunta si un candidato es preferible. Calibrar pregunta si eventos asignados a una probabilidad ocurren con esa frecuencia en una distribución. Ajustar temperatura, regresión isotónica u otro calibrador declarado en una partición independiente y congelarlo. Un margen no es probabilidad. Cambiar candidatos modifica el significado de un puntaje normalizado aun con pesos iguales; registrar contrato y candidatos.

Evaluate Brier score, log loss, classwise reliability and accepted-action coverage together. A policy can reduce accepted-action error by refusing almost everything, so end-to-end task success and referral cost remain necessary. Global reliability can conceal a poorly calibrated rare action family. The workbench displays model-emitted candidate probabilities only when the episode actually contains them. A missing probability remains missing, and a high score cannot bypass a denied capability, invalid argument or stale resource version.

> ES: Evaluar Brier, pérdida logarítmica, fiabilidad por clase y cobertura conjuntamente. Una política reduce errores rechazando casi todo; siguen siendo necesarios éxito completo y costo de derivación. La fiabilidad global oculta familias raras mal calibradas. El banco muestra probabilidades solo cuando el episodio las contiene. Una probabilidad ausente permanece ausente y un puntaje alto no evita denegación de capacidad, argumentos inválidos o revisión obsoleta.

$$
p_\theta(y=1\mid x,a)=\sigma(w^\top\phi(x,a)+b),\qquad\sigma(z)=\frac{1}{1+e^{-z}}
$$

phi maps state x and candidate action a to features; w and b are fitted coefficients; y is the declared binary target; sigma is the logistic link. The target definition must accompany every exported model.

> ES: phi transforma estado x y acción a en características; w y b son coeficientes; y es la etiqueta binaria declarada; sigma es el enlace logístico. La definición de etiqueta acompaña al modelo.

$$
\mathrm{Brier}=\frac1N\sum_{i=1}^{N}(p_i-y_i)^2,\qquad\mathrm{NLL}=-\frac1N\sum_i\log p_i(y_i)
$$

N is the number of labeled held-out decisions, p the forecast and y the observed label. For multiclass NLL, p_i(y_i) is probability assigned to the observed class. Episode-cluster dependence requires separate uncertainty estimation.

> ES: N es el número de decisiones etiquetadas reservadas, p la predicción e y la etiqueta observada. En NLL multiclase, p_i(y_i) es la probabilidad de la clase observada. La dependencia por episodio requiere estimación de incertidumbre separada.


**Evidence limit:** Empirical calibration is distribution dependent and does not prove per-action safety or correctness after arbitrary drift.

> ES: La calibración empírica depende de la distribución y no demuestra seguridad por acción ni corrección tras deriva arbitraria.

[Chen and Guestrin 2016](https://doi.org/10.1145/2939672.2939785); [Guo et al. 2017](https://proceedings.mlr.press/v70/guo17a.html); [TypeSafe confidence documentation](https://docs.typesafe.ai/confidence)

## Sequential learning: M05 / M06 / M07

*ES: Aprendizaje secuencial: M05 / M06 / M07*

M05 is a small GRU trained by behavior cloning. It consumes causal event features and a bounded hidden state, resetting that state at episode boundaries. The recurrent state can summarize earlier observations or unresolved effects, but it cannot override the exact resource registry. Supervised action imitation is vulnerable to covariate shift: an early mistake takes the controller into states absent from successful demonstrations. Include recovery and failed trajectories, then measure closed-loop outcomes rather than reporting only action accuracy on teacher states.

> ES: M05 es una GRU compacta entrenada por clonación de conducta. Consume eventos causales y estado oculto acotado, reiniciado por episodio. Resume observaciones previas o efectos pendientes, sin reemplazar el registro exacto. Imitar acciones sufre cambio de distribución: un error temprano lleva a estados ausentes de demostraciones exitosas. Incluir recuperación y fallos; medir resultados en ciclo cerrado además de precisión sobre estados del maestro.

M06 implements LinUCB as a contextual bandit. A linear reward estimate plus an uncertainty bonus selects the next candidate, and observed feedback updates sufficient statistics. Its objective is immediate expected reward under its feature assumptions. Software workflows have delayed consequences, so a bandit evaluation must distinguish true one-step endpoints from myopic routing inside a sequential task. Logged propensities, unavailable actions and delayed feedback matter when estimating the value of a policy that was not actually executed.

> ES: M06 implementa LinUCB como bandido contextual. La recompensa lineal estimada y una bonificación de incertidumbre seleccionan candidatos; la retroalimentación actualiza estadísticas. Optimiza recompensa inmediata bajo supuestos de características. Los flujos tienen consecuencias tardías: distinguir objetivos de un paso del enrutamiento miope dentro de tareas secuenciales. Propensiones registradas, acciones ausentes y retroalimentación tardía importan al estimar políticas no ejecutadas.

M07 uses action-masked PPO in the controlled training environment. The admissibility mask removes currently unsupported actions before sampling. The implementation uses a supported nonrecurrent policy with explicit causal features; it is not described as recurrent MaskablePPO. Reward combines declared progress, completion, latency and adverse-action costs. These coefficients specify a task preference, not a universal intelligence measure. Compare learning curves over several seeds and hold out workflow groups before tuning the reward, architecture or stopping rule.

> ES: M07 usa PPO con máscara de acciones en entrenamiento controlado. La máscara elimina acciones no admitidas antes de muestrear. Se usa una política no recurrente admitida con características causales explícitas; no se presenta como MaskablePPO recurrente. La recompensa combina progreso, finalización, latencia y costos adversos. Los coeficientes expresan preferencias, no inteligencia universal. Comparar curvas con semillas múltiples y reservar grupos antes de ajustar recompensa, arquitectura o terminación.

All three methods must preserve cancellation, resource revisions and independent admission checks. Recurrence does not make stale observations fresh, an exploration bonus does not create authorization, and a validity mask does not predict every side effect. Browser replay consumes measured records of these trained policies; it never renames an exact rule as a neural policy. Online weight updates on a user workstation are not part of this workbench. New observations can update controller state immediately while a changed model still requires an offline versioned release.

> ES: Los tres métodos conservan cancelación, revisiones y admisión independiente. La recurrencia no actualiza observaciones obsoletas, explorar no crea autoridad y una máscara no predice todos los efectos. La reproducción consume registros medidos; nunca renombra una regla como red neuronal. No se actualizan pesos en línea sobre el equipo del usuario. Observaciones nuevas actualizan estado, mientras cambiar modelos requiere una publicación versionada fuera de línea.

$$
h_t=\mathrm{GRU}_\theta(h_{t-1},\phi(o_t,a_{t-1},y_{t-1})),\qquad\mathcal L_{BC}=-\sum_t\log\pi_\theta(a_t^*\mid h_t)
$$

h is recurrent state; o is the current observation; a and y are the previous action and outcome; phi is causal preprocessing; a* is a demonstrated action; BC denotes behavior cloning. Hidden evaluator state is excluded.

> ES: h es estado recurrente; o la observación actual; a e y la acción y resultado anteriores; phi es preprocesamiento causal; a* es acción demostrada; BC indica clonación de conducta. Se excluye estado oculto del evaluador.

$$
a_t=\arg\max_{a\in\mathcal A_t}\left[x_{t,a}^{\top}\widehat\theta+\alpha\sqrt{x_{t,a}^{\top}A^{-1}x_{t,a}}\right]
$$

This shared action-feature LinUCB uses a seeded 64-dimensional projection x, one fitted reward vector theta and one regularized covariance A across actions; alpha=0.2 controls exploration and A_t is the admissible set. Updates use only executed-action feedback.

> ES: LinUCB comparte una proyección de 64 dimensiones x, vector de recompensa theta y covarianza regularizada A entre acciones; alpha=0.2 controla exploración y A_t es el conjunto admisible. Solo se actualiza con acciones ejecutadas.

$$
L^{CLIP}=\mathbb E_t\left[\min\left(r_t\widehat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\widehat A_t\right)\right]
$$

PPO uses the new/old policy probability ratio r, estimated advantage A-hat and clipping width epsilon. The expectation is over collected trajectories. Both policies use the same declared action mask.

> ES: PPO usa razón de probabilidades nueva/anterior r, ventaja estimada A y ancho epsilon. La esperanza se toma sobre trayectorias recolectadas. Ambas políticas usan la misma máscara declarada.


**Evidence limit:** Simulator return, teacher agreement and action accuracy are different outcomes. None alone establishes reliable native workflow completion or generalization to new tools.

> ES: Retorno simulado, acuerdo con maestro y precisión son resultados distintos. Ninguno demuestra por sí solo finalización nativa fiable ni generalización a herramientas nuevas.

[Cho et al. 2014](https://arxiv.org/abs/1406.1078); [Ross et al. 2011](https://proceedings.mlr.press/v15/ross11a.html); [Li et al. 2010](https://arxiv.org/abs/1003.0146); [Schulman et al. 2017](https://arxiv.org/abs/1707.06347); [Huang and Ontanon 2020](https://arxiv.org/abs/2006.14171); [SB3-Contrib MaskablePPO](https://sb3-contrib.readthedocs.io/en/master/modules/ppo_mask.html)

## Prediction and lookahead: M08

*ES: Predicción y anticipación: M08*

M08 fits a forward model of action outcomes and evaluates a bounded number of candidate continuations. The model predicts observable effects, not an omniscient replica of the operating system. For a file operation, useful targets include version change, validator outcome or unresolved status; for a process, they include observed exit or continued activity. A model that predicts a fluent description of success is insufficient. Its output must be scored against recorded consequences, with missing outcomes retained as missing rather than silently assigned zero error.

> ES: M08 ajusta un modelo de resultados y evalúa continuaciones candidatas acotadas. Predice efectos observables, no una réplica omnisciente del sistema. Para archivos, objetivos útiles son cambios de versión, validación o estado sin resolver; para procesos, salida observada o actividad. Describir éxito fluidamente es insuficiente. Se puntúa contra consecuencias registradas y los resultados ausentes permanecen ausentes, sin asignarles error cero.

Planning expands only registered, bound candidates up to a declared depth and expansion budget. Accumulated predicted reward is penalized by action cost and deadline pressure. Deeper search can amplify model error, especially when a candidate sequence leaves the training distribution. Measure one-step prediction quality and closed-loop completion separately, and sweep horizon at a fixed computation allowance. A short reliable model can be more useful than an inaccurate long rollout. Unknown capabilities are rejected or sent for registration rather than hallucinated into the transition graph.

> ES: La planificación expande candidatos registrados y vinculados hasta profundidad y presupuesto declarados. Penaliza recompensa prevista por costo y presión del plazo. Buscar más amplifica errores, especialmente fuera de la distribución de entrenamiento. Medir predicción de un paso y finalización por separado; variar horizonte con cómputo fijo. Un modelo corto fiable puede superar una trayectoria larga imprecisa. Capacidades desconocidas se rechazan o registran, sin inventarlas en el grafo.

Prediction error is a useful interruption signal, but it is not a diagnosis. A large residual may reflect observation noise, a delayed report, an inaccurate predictor or a genuinely changed service. The system should refresh evidence, reconcile an unresolved effect or ask a planner, depending on the affected resource and remaining time. Neuroscience motivates separating predicted and observed consequences, including cerebellar adaptation and predictive coding. Those studies concern specific neural and behavioral tasks; they do not validate a general software world model.

> ES: El error predictivo sirve para interrumpir, pero no diagnostica. Un residuo grande puede reflejar ruido, demora, predictor impreciso o cambio del servicio. El sistema actualiza evidencia, concilia un efecto o solicita planificación según recurso y tiempo. Neurociencia motiva separar consecuencias previstas y observadas, incluyendo adaptación cerebelosa y codificación predictiva. Esos estudios se refieren a tareas específicas y no validan un modelo general del software.

The effects view links predicted value, observed value, residual and deadline to the same decision cursor. An unknown outcome deliberately leaves the observation and residual undefined. A control comparison removes the effect head while keeping the same state and action registry. A second comparison replaces learned prediction with a known simulator transition model; that is an oracle-model diagnostic and must be labeled accordingly. Gains over a weak predictor do not establish gains over competent exact recovery or a model-free policy with adequate history.

> ES: La vista de efectos vincula predicción, observación, residuo y plazo al mismo cursor. Un resultado desconocido deja observación y residuo indefinidos. Una ablación retira la cabeza predictiva conservando estado y registro. Otra sustituye la predicción por transición conocida del simulador; es diagnóstico con modelo oráculo y debe etiquetarse. Ganar frente a predictor débil no demuestra ventaja sobre recuperación exacta ni política sin modelo con historial suficiente.

$$
\widehat p_\phi(o_{t+1},y_t\mid b_t,a_t),\qquad e_t=-\log\widehat p_\phi(y_t\mid b_t,a_t)
$$

phi parameterizes the transition model; b is the causal controller summary; a is an action; o the next observation; y the observed outcome; e is categorical surprise. e is undefined until y is observed.

> ES: phi parametriza el modelo; b resume estado causal; a es acción; o la observación siguiente; y el resultado observado; e la sorpresa categórica. e no se define hasta observar y.

$$
\widehat Q_H(b,a)=\mathbb E_{\widehat p}\left[\sum_{k=0}^{H-1}\gamma^k(r_{t+k}-\lambda c_{t+k})\right]
$$

H is the bounded planning horizon, gamma the discount, r the declared reward, c the action/computation cost and lambda its weight. Expectations use the fitted model, so predicted value is not ground truth.

> ES: H es horizonte acotado, gamma descuento, r recompensa declarada, c costo y lambda su peso. La esperanza usa el modelo ajustado: valor previsto no equivale a verdad.


**Evidence limit:** A residual detects mismatch under a chosen observation model. It does not certify safety, identify an attacker or prove which action caused a change.

> ES: Un residuo detecta discrepancia bajo un modelo observado. No certifica seguridad, identifica atacantes ni demuestra causalidad.

[Tseng et al. 2007](https://doi.org/10.1152/jn.00266.2007); [Rao and Ballard 1999](https://doi.org/10.1038/4580); [Daw et al. 2005](https://doi.org/10.1038/nn1560)

## Slow coordination: M09 / M10

*ES: Coordinación lenta: M09 / M10*

M09 invokes a pinned local language model to choose a structured next action from the same candidate set as the other policies. The prompt includes observable state, the user goal, available actions and an explicit output schema. Parsing, argument binding, authority and outcome verification remain outside the language model. This controlled experiment measures candidate selection, not unconstrained end-to-end tool discovery. Report failed parsing, retries, prompt and response tokens, cold loading and actual wall time; exclude no failed call from the denominator.

> ES: M09 invoca un modelo local fijado para elegir una acción estructurada entre los mismos candidatos. El mensaje incluye estado observable, objetivo, acciones y esquema de salida. Análisis, argumentos, autoridad y verificación permanecen fuera del modelo. Este experimento mide selección de candidatos, no descubrimiento libre de herramientas. Informar análisis fallido, reintentos, tokens, carga inicial y tiempo real sin excluir llamadas fallidas.

M10 continues exact control while a slow planner works asynchronously. A planner result is a versioned proposal containing supported action references, assumptions, dependencies and expiry. Before admitting it, the controller compares the input revision with current resources. An obsolete proposal may be repaired, revalidated or discarded. The mere fact that a large model took longer does not make its answer more authoritative. The slow path can be wrong, fail to return, or arrive after the task has already been cancelled.

> ES: M10 mantiene control exacto mientras un planificador trabaja asíncronamente. Su resultado es propuesta versionada con acciones admitidas, supuestos, dependencias y vencimiento. Antes de admitirla, se compara revisión de entrada y recursos actuales. Una propuesta obsoleta se repara, revalida o descarta. Tardar más no otorga autoridad. La ruta lenta puede equivocarse, no volver o llegar después de cancelar.

Separate provider duration from incremental critical-path delay. If useful work continues during planning, the whole call duration is not necessarily added to task completion. Conversely, a planner can hold a scarce worker or block a required resource even before its response is used. The coordination view exposes delegation and resource events beside the action timeline. Budget accounting includes failed and stale proposals, and cancellation admission is measured separately from provider termination or billing. A cooperative cancellation request cannot undo an already committed remote effect.

> ES: Separar duración del proveedor y demora incremental en ruta crítica. Si continúa trabajo útil, no se añade necesariamente toda la llamada al tiempo final. Un planificador también retiene trabajadores o bloquea recursos antes de usarse su respuesta. La coordinación muestra delegación y recursos junto a acciones. El presupuesto incluye propuestas fallidas u obsoletas; admisión de cancelación se mide aparte de terminación o cobro. Cancelar cooperativamente no deshace efectos remotos confirmados.

The engineering distinction is compute allocation, not a biological partition between an intuitive module and a rational language model. Fast logical responses and recurrent meta-learning are documented alternatives to a simple two-system picture. Language models can make fast habitual predictions, while an exact planner may perform expensive search. Jev supplies a useful typed-decision interface precedent, but its unpublished training cannot be inferred from the interface. Neuraxis does not claim to reproduce RLCD, Jev weights or a general model of human consciousness.

> ES: La distinción es asignación de cómputo, no división biológica entre intuición y lenguaje racional. Respuestas lógicas rápidas y metaaprendizaje recurrente son alternativas documentadas. Modelos de lenguaje predicen hábitos rápidamente y un planificador exacto puede buscar con alto costo. Jev ofrece antecedente de interfaz tipada, pero esta no revela su entrenamiento. Neuraxis no reproduce RLCD, pesos Jev ni conciencia humana.

$$
P=(g,v,\mathcal D,\mathcal A,\tau),\qquad\mathrm{admit}(P,x_t)=\mathrm{valid}(P)\land\mathrm{fresh}(v,x_t)\land(t<\tau)
$$

A proposal P records goal g, originating revision v, dependency graph D, registered actions A and expiry tau. Admission requires schema validity, current preconditions and an unexpired proposal; the symbolic conjunction does not replace adapter checks.

> ES: La propuesta P registra objetivo g, revisión v, dependencias D, acciones A y vencimiento tau. La admisión requiere esquema válido, precondiciones actuales y vigencia; la conjunción no reemplaza verificaciones del adaptador.

$$
\Delta T_k=T_{\mathrm{task}\mid k}-T_{\mathrm{task}\mid\mathrm{baseline}}
$$

Delta T is the paired incremental task duration associated with computation k. It differs from standalone provider latency because execution may overlap. A resettable paired environment is required to observe both terms.

> ES: Delta T es duración incremental emparejada asociada al cómputo k. Difiere de latencia del proveedor por superposición. Observar ambos términos requiere entorno reiniciable.


**Evidence limit:** An asynchronous planner is a proposed-action source. Its confidence, fluent rationale and larger parameter count grant no additional capability.

> ES: Un planificador asíncrono propone acciones. Su confianza, explicación fluida y tamaño no conceden capacidades adicionales.

[Bago and De Neys 2017](https://doi.org/10.1016/j.cognition.2016.10.014); [Melnikoff and Bargh 2018](https://doi.org/10.1016/j.tics.2018.02.001); [Wang et al. 2018](https://doi.org/10.1038/s41593-018-0147-8); [TypeSafe 2026](https://typesafe.ai/blog/introducing-system-one-models-and-jev); [Ong et al. 2024](https://arxiv.org/abs/2406.18665)

## Deferral and metacontrol: M11 / M12

*ES: Derivación y metacontrol: M11 / M12*

M11 learns whether referring a state to a slower solver improves the outcome enough to justify its cost. Useful supervision compares fast and slow solvers on paired resettable states with identical tools, budgets and fault realizations. Confidence alone is insufficient: both solvers can be wrong on the same states, and a slow solver can have no useful advantage despite high uncertainty. A deferral target should therefore include measured incremental utility, late arrival and rejected proposals. Outside resettable environments the unchosen outcome is usually unobserved.

> ES: M11 aprende si derivar a un resolvedor lento mejora suficiente para justificar costo. La supervisión compara rutas rápidas y lentas sobre estados reiniciables emparejados, con herramientas, presupuestos y fallos iguales. La confianza no basta: ambas rutas pueden fallar juntas y la lenta no mejorar pese a incertidumbre alta. La etiqueta incluye utilidad incremental, llegada tardía y propuestas rechazadas. Fuera de entornos reiniciables el resultado no elegido suele ser desconocido.

M12 combines persistent causal state, candidate scoring, effect prediction and an estimate of computation value. Supported computations include observation refresh, bounded lookahead and planner delegation; acting, waiting, stopping and abstaining remain explicit alternatives. Resource state and cancellation are exact inputs, not facts reconstructed solely from a recurrent vector. The architecture is a testable composition of existing ideas. A claim of a new algorithm requires a precisely specified update rule and a comparison showing contribution beyond the exact controller and learned components.

> ES: M12 combina estado causal persistente, puntuación, predicción de efectos y valor de cómputo. Incluye actualizar observaciones, anticipación acotada y delegación; actuar, esperar, detener y abstenerse son alternativas explícitas. Recursos y cancelación son entradas exactas, no hechos reconstruidos solo del vector recurrente. Es una composición comprobable. Declarar algoritmo nuevo requiere regla precisa y comparación que demuestre aporte adicional a componentes conocidos.

Reliability-based arbitration, multiscale cortical dynamics and complementary learning systems motivate separable responsibilities and update timescales. They do not prescribe a particular Rust class, threshold or reward. Separate within-episode state changes, append-only outcome collection and offline policy training. Prioritized replay may focus learning on transitions likely to change a useful decision, but training-set prioritization can distort the deployment distribution. Calibration consequently uses an untouched sample reflecting the declared evaluation mixture rather than the prioritized training buffer.

> ES: Arbitraje por fiabilidad, dinámica multiescala y aprendizaje complementario motivan responsabilidades y escalas separadas. No prescriben clases Rust, umbrales ni recompensas. Separar estado dentro del episodio, recolección de resultados y entrenamiento fuera de línea. La repetición priorizada enfoca transiciones útiles, pero distorsiona distribución. Por eso se calibra con muestra intacta de la mezcla declarada y no con el búfer priorizado.

The decisive experiment is a matched quality-latency-cost frontier. Remove persistent state, remove effect prediction, replace learned deferral with confidence-only referral, and compare against a competent FSM plus asynchronous LLM at the same slow-call budget. Report uncertainty at the workflow-family level. If a simpler method wins, the workbench must show that result and the deployment policy should favor the simpler method on that domain. Marginal calibration or a conformal prediction set does not establish a conditional safety bound for each accepted action in a changing workflow.

> ES: El experimento decisivo compara calidad, latencia y costo. Retirar persistencia, predicción de efectos, sustituir derivación aprendida por confianza y comparar FSM más LLM con el mismo presupuesto de llamadas. Informar incertidumbre por familia. Si gana un método simple, el banco debe mostrarlo y favorecerlo en ese dominio. Calibración marginal o conjuntos conformes no establecen seguridad condicional de cada acción aceptada en un flujo cambiante.

$$
\widehat{\mathrm{VOC}}(k,b)=\widehat Q_{act}(b)-\widehat{\mathbb E}[Q_{act}(b\prime)\mid k]-\lambda_c\widehat c_k-\lambda_d\widehat d_k
$$

VOC is estimated value of computation k; b is current controller state and b-prime the state when computation returns; Q_act is expected action loss; c and d are compute cost and critical-path delay; lambda values are declared task weights. Positive estimated value does not grant authority.

> ES: VOC es valor estimado del cómputo k; b es estado actual y b-prima el estado al retornar; Q_act es pérdida esperada; c y d son costo y demora crítica; lambda son pesos declarados. Valor positivo no concede autoridad.

$$
\mathrm{coverage}=\mathbb E[g(X)],\qquad R_{sel}=\frac{\mathbb E[g(X)\ell(X)]}{\mathbb E[g(X)]}
$$

g is the binary acceptance rule, X the evaluated state and ell the observed action loss. Selective risk R is undefined at zero coverage; report coverage and end-to-end outcomes alongside it.

> ES: g es regla binaria de aceptación, X el estado y ell la pérdida observada. Riesgo selectivo R no se define con cobertura cero; informar cobertura y resultados completos.


**Evidence limit:** Estimated computation value and learned risk are empirical forecasts. No AGI claim or distribution-free software safety guarantee follows from combining these modules.

> ES: Valor de cómputo y riesgo aprendido son predicciones empíricas. Combinar módulos no demuestra AGI ni seguridad de software independiente de la distribución.

[Daw et al. 2005](https://doi.org/10.1038/nn1560); [Lee et al. 2014](https://doi.org/10.1016/j.neuron.2013.11.028); [Kool et al. 2016](https://doi.org/10.1371/journal.pcbi.1005090); [Murray et al. 2014](https://doi.org/10.1038/nn.3862); [McClelland et al. 1995](https://doi.org/10.1037/0033-295X.102.3.419); [Mattar and Daw 2018](https://doi.org/10.1038/s41593-018-0232-z); [Angelopoulos et al. 2024](https://arxiv.org/abs/2208.02814); [Agarwal et al. 2021](https://arxiv.org/abs/2108.13264)
