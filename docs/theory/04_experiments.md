# Experiments

The evaluation treats complete software episodes as the primary unit. Compare policies on the same registered tools, visible evidence, variants and seeds; separate demonstration agreement from verified task success; record failed, cancelled and unavailable runs; and interpret confidence intervals under the actual sampling design. The Benchmark page hydrates the measured records.

> ES: La evaluación considera episodios completos como unidad principal. Compara políticas con herramientas, evidencia, variantes y semillas iguales; separa acuerdo demostrado de éxito verificado; registra fallos, cancelaciones y ausencias; interpreta intervalos según muestreo real. La página Benchmark carga los registros medidos.

## Paired evaluation design

*ES: Diseño de evaluación emparejada*

The owned workload defines twenty case families and six variants: nominal, delayed observation, duplicate event, stale conflict, unavailable dependency and boundary conditions. A case-seed-variant tuple identifies a reproducible environment specification. Every method receives the same allowed observations and candidate registry. The task checker examines actual filesystem, process or local HTTP effects; it does not merely ask the policy whether it succeeded. A valid output schema and a correct demonstration label are auxiliary properties rather than substitutes for task completion.

> ES: La carga define veinte familias y seis variantes: nominal, observación tardía, evento duplicado, conflicto obsoleto, dependencia ausente y límites. La combinación caso-semilla-variante identifica especificación reproducible. Cada método recibe iguales observaciones y candidatos. El verificador examina efectos de archivos, procesos o HTTP local; no pregunta a la política si tuvo éxito. Esquema válido y etiqueta demostrada son propiedades auxiliares.

Pair methods by exact environment specification before comparing outcomes. Use the same external capability and slow-call budgets, and retain environment setup and provider failures in the record. A trained policy may receive training data that an exact baseline does not need, but that data and its collection cost remain part of the evidence. A narrow candidate-ranking benchmark is explicitly distinct from end-to-end tool grounding, where systems must also identify resources and construct arguments.

> ES: Emparejar métodos por especificación antes de comparar. Usar mismas capacidades y presupuestos de llamadas, conservando preparación y fallos. Las políticas aprendidas reciben datos que una referencia exacta no necesita, pero esos datos y costos forman evidencia. Comparar candidatos es distinto de identificar recursos y construir argumentos de extremo a extremo.

The canonical index lists the cells actually executed. The full design target is twelve methods across all families and variants; sample count is read from evidence rather than assumed from the design. Missing cells, unavailable checkpoints and planner failures are visible. Re-running a cached episode requires an identical lineage signature. Any code, model or specification change invalidates reuse and creates a different experiment.

> ES: El índice enumera celdas ejecutadas. El diseño completo contempla doce métodos y todas las familias y variantes; la cantidad se lee de evidencia, no se presume. Celdas ausentes, modelos no disponibles y fallos son visibles. Reusar episodios exige firma de procedencia idéntica; cambios de código, modelo o especificación crean experimento distinto.

$$
\Delta_j=Y_j^{(A)}-Y_j^{(B)},\qquad\overline\Delta=\frac1N\sum_{j=1}^{N}\Delta_j
$$

Y is the declared episode outcome, j a matched case-variant-seed instance, A and B two policies and N the number of complete pairs. Do not silently replace missing pairs with successes or zeros.

> ES: Y es resultado declarado, j instancia emparejada, A y B políticas y N pares completos. No sustituir pares ausentes por éxitos ni ceros.


**Evidence limit:** Designed integration fixtures are not a random sample of all software use. Their average is a workload result, not a universal agent score.

> ES: Escenarios diseñados no son muestra aleatoria del uso de software. Su promedio describe la carga, no inteligencia universal.

[Lu et al. 2024](https://arxiv.org/abs/2408.04682); [Agarwal et al. 2021](https://arxiv.org/abs/2108.13264)

## Leakage and grouping

*ES: Contaminación y agrupación*

Split complete workflow groups before feature fitting, calibration or policy selection. Events from one episode, equivalent task templates and repeated object names can leak information even when individual rows differ. The pipeline retains group identifiers and specification hashes so overlap can be checked mechanically. Test labels and evaluator-only future state never enter candidate features. Calibration is a distinct partition and cannot be repeatedly inspected to tune arbitrary architectures while still being described as untouched.

> ES: Separar grupos completos antes de ajustar, calibrar o seleccionar. Eventos del mismo episodio, plantillas equivalentes y nombres repetidos filtran información aunque cambien filas. Se conservan grupos y hashes para revisar solapamiento. Etiquetas de prueba y futuro oculto no entran en características. Calibración es partición distinta; inspeccionarla repetidamente para ajustar arquitectura deja de ser uso intacto.

The current evidence must state exactly what is held out. Disjoint seeds within a familiar family test new instances of that family, not transfer to an unseen task family. Holding out a new tool or schema is a stronger generalization test and requires the candidate binder to remain defined. Do not describe one split as another. Demonstration collection may query an expert or evaluator for labels, but only the policy observation is allowed at inference time.

> ES: La evidencia debe precisar qué se reserva. Semillas distintas dentro de familia conocida evalúan instancias nuevas, no transferencia a familias inéditas. Reservar herramienta o esquema es prueba más fuerte y requiere vinculación definida. No describir una partición como otra. Recolección puede consultar experto para etiquetas, pero inferencia solo recibe observación permitida.

Outliers need provenance rather than automatic deletion. A long-running planner, repeated timeout or failed resource reconciliation can be the behavior of interest. Flag malformed records and nonfinite measurements separately from legitimate extreme outcomes. If filtering is necessary, publish its rule before examining the comparison and report counts before and after filtering. The export should retain unsuccessful episodes with status and reason.

> ES: Los atípicos necesitan procedencia, no borrado automático. Planificación extensa, vencimientos repetidos o conciliación fallida pueden ser el fenómeno. Separar registros inválidos de extremos legítimos. Si se filtra, publicar regla antes de comparar e informar cantidades iniciales y finales. Exportar episodios fallidos con estado y motivo.

$$
G_{train}\cap G_{cal}=G_{train}\cap G_{test}=G_{cal}\cap G_{test}=\varnothing
$$

G denotes the declared grouping unit in each partition. This assertion prevents group overlap only at that unit; it does not imply unseen-family transfer when family identity is shared.

> ES: G denota unidad de agrupación declarada. La disyunción impide solapamiento en esa unidad; no implica transferencia a familias inéditas si se comparten.


**Evidence limit:** Random event-row splitting is forbidden because shared trajectory context can contaminate both model fitting and uncertainty estimates.

> ES: Se prohíbe dividir filas de eventos aleatoriamente porque el contexto compartido contamina ajuste e incertidumbre.

[Ross et al. 2011](https://proceedings.mlr.press/v15/ross11a.html); [Guo et al. 2017](https://proceedings.mlr.press/v70/guo17a.html); [Agarwal et al. 2021](https://arxiv.org/abs/2108.13264)

## Outcome and timing metrics

*ES: Métricas de resultados y tiempo*

Task success is the independent terminal predicate. Violations count effects or decisions that breach the declared contract; denied proposals are tracked separately because preventing a bad proposal is not an executed violation. Cancellation, unknown effect and failure are different statuses. The action confusion matrix compares policy choices with the demonstration action, which can disagree with task success when several actions are valid. Its title and denominator therefore identify demonstration agreement explicitly.

> ES: El éxito es predicado terminal independiente. Violaciones cuentan incumplimientos; propuestas denegadas se separan porque prevenirlas no equivale a ejecutarlas. Cancelación, efecto desconocido y fallo son distintos. La confusión compara acciones con demostración, que puede diferir de éxito cuando varias son válidas. Título y denominador identifican acuerdo demostrado.

Controller latency measures policy prediction, while execution duration measures admitted tools and wall time covers the whole run. The index reports p50, p95 and p99 controller latency from observed calls, along with episode means and sample counts. A percentile without its workload, hardware, concurrency, sample count and warm/cold condition is incomplete. The workbench never compares virtual clock milliseconds against native wall milliseconds as if they measured the same boundary.

> ES: Latencia de controlador mide predicción; ejecución mide herramientas y tiempo total toda la tarea. El índice informa p50, p95 y p99 de llamadas observadas con promedios y cantidades. Un percentil sin carga, equipo, concurrencia, cantidad y condición térmica está incompleto. El banco nunca equipara reloj virtual y tiempo real nativo.

Calibration bins retain their count, average confidence and observed target frequency. The target here can be demonstration agreement rather than successful effect. Risk-coverage analysis additionally requires a declared loss for accepted decisions and outcomes after referral. A low error rate with negligible coverage is not useful automation. Report reasoner calls and total completion quality so a reject-everything policy cannot appear dominant by withholding nearly all actions.

> ES: Los intervalos de calibración conservan cantidad, confianza y frecuencia. El objetivo puede ser acuerdo demostrado, no efecto exitoso. Riesgo-cobertura requiere pérdida de decisiones aceptadas y resultados tras derivación. Error bajo con cobertura mínima no es automatización útil. Informar llamadas y calidad final evita favorecer rechazo total.

$$
\widehat S=\frac{\sum_{j=1}^{N}\mathbf1[\mathrm{goal}_j\ verified]}{N},\quad\widehat V=\frac{\sum_j\mathrm{violations}_j}{N}
$$

S is episode success rate, V mean violations per episode and N evaluated episodes under the declared inclusion rule. Cancelled or unavailable records need explicit denominator treatment.

> ES: S es tasa de éxito, V violaciones medias y N episodios bajo regla declarada. Cancelados o ausentes requieren tratamiento explícito del denominador.

$$
\widehat R(\tau)=\frac{\sum_i\mathbf1[p_i\ge\tau]\ell_i}{\sum_i\mathbf1[p_i\ge\tau]},\quad\widehat C(\tau)=\frac1n\sum_i\mathbf1[p_i\ge\tau]
$$

p is an emitted calibrated score, tau a threshold, ell observed loss and n eligible labeled decisions. R is undefined when no decision is accepted. This empirical ratio is not a conditional safety theorem.

> ES: p es puntaje calibrado, tau umbral, ell pérdida y n decisiones elegibles. R no se define sin aceptaciones. Esta razón empírica no es teorema de seguridad condicional.


**Evidence limit:** Demonstration agreement is not causal utility. Calibration to that target must not be relabeled probability of safe execution.

> ES: Acuerdo demostrado no es utilidad causal. Calibrar a ese objetivo no produce probabilidad de ejecución segura.

[Guo et al. 2017](https://proceedings.mlr.press/v70/guo17a.html); [Angelopoulos et al. 2024](https://arxiv.org/abs/2208.02814); [Agarwal et al. 2021](https://arxiv.org/abs/2108.13264)

## Robustness and interventions

*ES: Robustez e intervenciones*

Vary delayed observations, duplicate events, stale versions, unavailable dependencies and boundary inputs separately. A controller may remain accurate on nominal data yet repeatedly dispatch stale actions under concurrency. Include changed resource names and tool descriptions without changing the underlying capability boundary. Malicious tool output tests whether untrusted observations are promoted into instructions; it is evaluated separately from ordinary task accuracy so broad refusal does not earn a misleading success score.

> ES: Variar por separado demoras, duplicados, versiones obsoletas, dependencias ausentes y límites. Un controlador preciso nominalmente puede ejecutar acciones obsoletas bajo concurrencia. Cambiar nombres y descripciones sin modificar capacidades. La salida maliciosa evalúa si observaciones se convierten en instrucciones; se separa de precisión ordinaria para no premiar rechazo general.

The browser permits immediate interventions on one selected scenario. Latency, reliability, observation noise, deadline, threshold and worker count have causal effects on its virtual state machine. These controls are a laboratory for exact control behavior and do not pretend to re-run trained canonical checkpoints. A native rerun uses the local API and its supported workload parameters. Compare nominal and perturbed outcomes within a method, then compare their degradation between methods.

> ES: El navegador permite intervenir en un caso. Latencia, fiabilidad, ruido, plazo, umbral y trabajadores afectan causalmente su máquina virtual. Son laboratorio de control exacto, no reejecución ficticia de pesos canónicos. Una ejecución nativa usa API y parámetros admitidos. Comparar nominal y perturbado por método y luego degradación entre métodos.

Fault injection should preserve a precise interpretation. A timed-out write is unknown until reconciled; a failed read can be retried without assuming a hidden commit; a cancellation request prevents new admissions but does not reverse past writes. Track recovery duration and eventual goal success separately. A policy that stops quickly may still leave the workflow incomplete or a remote effect unresolved.

> ES: La inyección requiere interpretación precisa. Escritura vencida es desconocida hasta conciliación; lectura fallida puede reintentarse sin compromiso oculto; cancelar bloquea nuevas admisiones sin revertir escrituras. Medir duración de recuperación y éxito por separado. Detener rápido puede dejar flujo incompleto o efecto remoto sin resolver.

$$
D_{m,v}=S_{m,nominal}-S_{m,v}
$$

D is success degradation for method m under variant v relative to its own nominal success rate S. Report sample counts and paired uncertainty; a negative D means the perturbed sample happened to score higher.

> ES: D es degradación del método m bajo variante v frente a su éxito nominal S. Informar cantidades e incertidumbre; D negativo significa mayor puntaje en esa muestra perturbada.


**Evidence limit:** A single injected fault does not characterize all failure distributions. Controlled interventions establish behavior only under their declared mechanism and scope.

> ES: Un fallo inyectado no caracteriza todas las distribuciones. Intervenciones establecen conducta solo bajo mecanismo y alcance declarados.

[Heston et al. 2020](https://doi.org/10.1523/ENEURO.0159-20.2020); [Yu and Dayan 2005](https://doi.org/10.1016/j.neuron.2005.04.026); [Lu et al. 2024](https://arxiv.org/abs/2408.04682)

## Ablation and uncertainty

*ES: Ablación e incertidumbre*

The metacontroller is compared with versions lacking persistent state, effect prediction or learned deferral. A confidence-only gate and a fixed-rate asynchronous planner are necessary controls. Keep candidate construction, capabilities, evaluator predicates and planner budgets constant so the contrast isolates computation allocation. Report whether gains survive a stronger exact state machine and behavior tree. If a learned component only recovers a fact already available in exact state, the result concerns representation convenience rather than a new cognitive faculty.

> ES: Comparar metacontrol sin persistencia, predicción o derivación aprendida. Añadir confianza sola y planificador asíncrono de tasa fija. Mantener candidatos, capacidades, predicados y presupuestos para aislar asignación de cómputo. Informar si la ventaja resiste referencias exactas fuertes. Recuperar un hecho ya explícito describe conveniencia representacional, no facultad cognitiva nueva.

Resample at the independent task-group level for inferential comparisons, with paired draws across methods. Repeated event rows do not create independent evidence. The current aggregate exporter also provides a Wilson interval over episode outcomes as a descriptive summary and explicitly states its independence assumption. Do not interpret that interval as uncertainty over the population of all task families. Training-seed variation, environment variation and measurement noise should be reported as separate sources where measured.

> ES: Remuestrear grupos independientes para inferencia, emparejando métodos. Filas repetidas no crean evidencia independiente. El exportador aporta intervalo Wilson por episodios como resumen descriptivo con supuesto explícito. No interpretarlo como incertidumbre sobre todas las familias. Variación de semilla de entrenamiento, entorno y ruido se informan separadamente cuando se miden.

Predeclare a relevant quality-latency-cost frontier rather than selecting the one metric on which a favored method wins. Negative findings are useful: a linear scorer or exact fallback may dominate a recurrent composite on a particular domain. Model complexity, training cost and integration burden should remain visible alongside inference savings. Architecture inspiration does not establish novelty; the experiment must identify a precise incremental contribution.

> ES: Declarar frontera de calidad, latencia y costo antes de elegir la métrica favorable. Resultados negativos son útiles: un puntuador lineal o regla puede dominar una composición recurrente. Complejidad, entrenamiento e integración permanecen visibles junto al ahorro de inferencia. Inspiración arquitectónica no establece novedad; el experimento identifica contribución incremental.

$$
\mathrm{SE}_{cluster}(\widehat\Delta)\neq\mathrm{SE}_{iid\ rows}(\widehat\Delta)
$$

The standard error of a paired method difference depends on the independent sampling unit. Correlated event rows generally cannot be treated as independent draws.

> ES: El error estándar de diferencias emparejadas depende de la unidad independiente. Los eventos correlacionados no son muestras independientes.


**Evidence limit:** Descriptive intervals are explicitly labeled. A full hierarchical generalization claim requires a sampling design that supports it.

> ES: Los intervalos descriptivos se etiquetan. Generalizar jerárquicamente requiere diseño de muestreo que lo permita.

[Agarwal et al. 2021](https://arxiv.org/abs/2108.13264); [Kool et al. 2016](https://doi.org/10.1371/journal.pcbi.1005090); [Wang et al. 2018](https://doi.org/10.1038/s41593-018-0147-8)

## Data sources and redistribution

*ES: Fuentes y redistribución*

Owned integration fixtures use temporary files, registered subprocesses and local HTTP services with independent effect predicates. Their raw traces are exported only after removing local secrets and irrelevant paths. The browser uses a separate virtual workspace with no host effects. These are complementary forms of evidence, and the user interface identifies each lane on every run. The source manifest records exactly which method and workload versions generated the canonical artifacts.

> ES: Los escenarios propios usan archivos temporales, procesos registrados y HTTP local con predicados independientes. Se exportan tras retirar secretos y rutas irrelevantes. El navegador usa entorno virtual separado sin efectos locales. Son evidencias complementarias identificadas en cada ejecución. El manifiesto registra métodos y cargas que generaron artefactos.

External stateful benchmarks can test transfer beyond the owned families, but downloading metadata or implementing an adapter does not constitute a reproduced score. Dataset license, task content, credentials, provider requirements and permitted redistribution must be verified for the pinned version. Results belong in a separately named transfer table with their own denominators and limitations; they are never merged silently with owned integration success.

> ES: Benchmarks externos evalúan transferencia, pero descargar metadatos o escribir adaptador no reproduce puntajes. Verificar licencia, tareas, credenciales, proveedores y redistribución de versión fijada. Los resultados pertenecen a tabla de transferencia separada con denominadores y límites; no se mezclan con éxito de escenarios propios.

The benchmark page reads its coverage, aggregate metrics, calibration bins, confusion counts and variant results from canonical JSON. It never inserts literature numbers into local result cells. A method without a trained checkpoint or actual planner response remains unavailable until executed. A source citation explains a method or dataset; it is not evidence that this build reproduced the source experiment.

> ES: Benchmark lee cobertura, métricas, calibración, confusión y variantes del JSON canónico. Nunca inserta cifras bibliográficas en resultados propios. Métodos sin pesos o respuesta real permanecen ausentes hasta ejecutarse. Una cita explica método o datos; no demuestra reproducción.

$$
\mathrm{result}=(\mathrm{dataset\ version},\mathrm{split},\mathrm{method\ hash},\mathrm{execution\ record},\mathrm{metric\ definition})
$$

A result is meaningful only with all five provenance components. A displayed value alone is insufficient for comparison or replication.

> ES: Un resultado necesita cinco componentes de procedencia. Un valor mostrado no basta para comparar ni reproducir.


| Source | Execution / truth | Redistribution |
| --- | --- | --- |
| Owned software cases | Real temporary files, processes and local HTTP; disclosed quota/planner fixtures | Sanitized owned evidence; provenance in manifest |
| Browser workspace | Live deterministic virtual state; synthetic and explicitly labeled | App-owned simulator and exported records |
| ToolSandbox | External stateful benchmark; separate transfer evidence only if executed | Pinned upstream license and data terms govern use |
| Imported episode | User-provided untrusted record; origin not verified by import | Uploader must review rights and sensitive content |

**Evidence limit:** No external benchmark reproduction is implied by the presence of a reference or an adapter. The loaded artifact is the authority for measured coverage.

> ES: Referencias y adaptadores no implican reproducción externa. El artefacto cargado determina cobertura medida.

[Lu et al. 2024](https://arxiv.org/abs/2408.04682); [TypeSafe 2026](https://typesafe.ai/blog/introducing-system-one-models-and-jev); [Agarwal et al. 2021](https://arxiv.org/abs/2108.13264)
