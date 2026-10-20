import { bi as b } from './registry';
import type { ContentPage, ContentSection } from './content.types';
const moduleNodes: Record<string, ReturnType<typeof b>[]> = {
  runtime: [
    b('Versioned observation', 'Observación versionada'),
    b('Admissible candidates', 'Candidatos admisibles'),
    b('Native admission', 'Admisión nativa'),
    b('Registered effect', 'Efecto registrado'),
    b('Receipt and verification', 'Recibo y verificación'),
  ],
  features: [
    b('Observed state', 'Estado observado'),
    b('Scale and clip', 'Escalar y limitar'),
    b('Candidate features', 'Características candidatas'),
    b('Frozen checkpoint', 'Modelo congelado'),
    b('Versioned episode', 'Episodio versionado'),
  ],
  classical: [
    b('Training demonstrations', 'Demostraciones'),
    b('Linear / boosted trees', 'Lineal / árboles'),
    b('Held-out calibration', 'Calibración separada'),
    b('Candidate ranking', 'Orden de candidatos'),
    b('Actual action reward', 'Recompensa observada'),
  ],
  recurrent: [
    b('Goal state and history', 'Estado e historial'),
    b('GRU hidden state', 'Estado oculto GRU'),
    b('Candidate logits', 'Logits candidatos'),
    b('Masked action', 'Acción enmascarada'),
    b('ONNX parity audit', 'Auditoría ONNX'),
  ],
  planning: [
    b('Observed transition', 'Transición observada'),
    b('Predicted effect', 'Efecto predicho'),
    b('Bounded search', 'Búsqueda limitada'),
    b('Async planner proposal', 'Propuesta asíncrona'),
    b('Revalidate revision', 'Revalidar revisión'),
  ],
  browser: [
    b('Files and selected task', 'Archivos y tarea'),
    b('Immutable input bundle', 'Entradas inmutables'),
    b('Dependency controller', 'Control de dependencias'),
    b('Verified artifacts', 'Artefactos verificados'),
    b('Inspect and export', 'Inspeccionar y exportar'),
  ],
  pipeline: [
    b('Whole-group split', 'División por grupos'),
    b('Fit and calibrate', 'Ajustar y calibrar'),
    b('Freeze checkpoints', 'Congelar modelos'),
    b('Native evaluation', 'Evaluación nativa'),
    b('Checksummed replay', 'Reproducción verificada'),
  ],
  deployment: [
    b('Offline evaluation', 'Evaluación fuera de línea'),
    b('Immutable static assets', 'Artefactos inmutables'),
    b('TLS origin', 'Origen TLS'),
    b('Bounded native service', 'Servicio nativo limitado'),
    b('Browser result review', 'Revisión del resultado'),
  ],
};
const section = (
  s: Omit<ContentSection, 'nodes' | 'figure'> & Partial<Pick<ContentSection, 'nodes' | 'figure'>>,
): ContentSection => ({
  ...s,
  nodes: s.nodes ?? moduleNodes[s.id],
  figure:
    s.figure ??
    b(
      'The module consumes versioned inputs and emits an inspectable record at the next boundary.',
      'El módulo consume entradas versionadas y emite un registro inspeccionable en el siguiente límite.',
    ),
});
export const implementation: ContentPage = {
  title: b('Implementation', 'Implementación'),
  lede: b(
    'The product separates a Rust execution core, Python policy and evaluation modules, an authenticated local API and a React workbench. Each lane carries its own provenance. Browser simulation, trained native inference and static replay are deliberately distinct execution modes, while portable observations and episodes make their differences inspectable.',
    'El producto separa núcleo de ejecución Rust, módulos Python de políticas y evaluación, API local autenticada y banco React. Cada modo conserva procedencia. Simulación del navegador, inferencia nativa entrenada y reproducción estática son modos distintos; observaciones y episodios portables permiten inspeccionar sus diferencias.',
  ),
  sections: [
    section({
      id: 'runtime',
      area: 'architecture',
      title: b('Runtime and event admission', 'Motor y admisión de eventos'),
      paragraphs: [
        b(
          'The reflexmesh package owns policy contracts, resource state and effect dispatch. Python modules contracts.py, runtime.py and controller.py expose typed observations and decisions; Rust modules core.rs, contracts.rs and policy.rs provide the compiled execution boundary. The app imports this package rather than duplicating the native policy engine. A candidate names a registered action, arguments, effects, required capabilities and expected resource versions. Observation.admissible intersects the supplied capability set with allowed candidates; validation is repeated by effectors before a mutation.',
          'El paquete reflexmesh controla contratos, recursos y efectos. contracts.py, runtime.py y controller.py exponen observaciones y decisiones; core.rs, contracts.rs y policy.rs proporcionan el límite compilado. La app importa el paquete sin duplicar políticas. Un candidato identifica acción, argumentos, efectos, capacidades y revisiones. Observation.admissible intersecta capacidades y candidatos; los efectores verifican otra vez antes de modificar.',
        ),
        b(
          'Observation identifiers, goal identifiers and nonnegative revisions are validated. Candidate identifiers must be unique within an observation. The decision mode belongs to act, observe, wait, delegate or stop; an act decision requires a candidate. These exact constraints reject malformed proposals but do not establish that a semantically valid action is useful. A dispatch record and an independently checked outcome close the gap. A timeout retains an unresolved state rather than being converted into an automatic retry of a potentially committed write.',
          'Se validan identificadores y revisiones no negativas; los candidatos son únicos. El modo pertenece a actuar, observar, esperar, delegar o detener y actuar exige candidato. Estas restricciones rechazan propuestas malformadas sin demostrar utilidad semántica. Un registro de ejecución y resultado comprobado cierran esa diferencia. El vencimiento conserva incertidumbre en lugar de reintentar una escritura posiblemente confirmada.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\mathcal A_t=\{a\in\mathcal C_t:\operatorname{allowed}(a)\land\operatorname{requires}(a)\subseteq\operatorname{capabilities}(g)\}`,
          caption: b(
            'C is the registered candidate set, A the admitted subset and g the goal. Required capabilities are supplied by configuration, never inferred from tool text or a model score.',
            'C es conjunto candidato, A subconjunto admitido y g objetivo. Las capacidades provienen de configuración, nunca del texto de herramientas ni del puntaje.',
          ),
        },
      ],
      refs: ['pyo32026', 'behaviortree2026'],
      limit: b(
        'Admission guarantees are limited to modeled checks and platform assumptions. Filesystem races, external services and interrupted remote effects require adapter-specific defenses and reconciliation.',
        'Las garantías de admisión se limitan a comprobaciones modeladas y supuestos de plataforma. Carreras de archivos, servicios externos y efectos interrumpidos requieren defensas específicas y conciliación.',
      ),
    }),
    section({
      id: 'features',
      area: 'contract',
      title: b('Feature and artifact contracts', 'Contratos de características y artefactos'),
      paragraphs: [
        b(
          'features.py fixes the causal feature ordering. State predicates include stale, duplicate, dependency_missing, cancel_requested, running, write_unknown, confirmed, pressure, validation status, conflict and progress. Additional features encode remaining budget, deadline, history length, goal-action token overlap and candidate cost, duration, effects and prerequisites. Operation indicators and operation-state interactions allow the same candidate-conditioned scorer to rank multiple registered actions. Family IDs, filenames, future outcomes and evaluator labels are excluded.',
          'features.py fija el orden causal. Predicados incluyen obsolescencia, duplicado, dependencia, cancelación, ejecución, escritura incierta, confirmación, presión, validación, conflicto y progreso. Otras características codifican presupuesto, plazo, historial, coincidencia textual, costo, duración, efectos y requisitos. Indicadores e interacciones permiten ordenar acciones registradas. Se excluyen familias, nombres de archivo, resultados futuros y etiquetas del evaluador.',
        ),
        b(
          'Numeric preprocessing replaces nonfinite or unparsable values with zero and clips normalized values to [-10, 10]. Attempts divide by 10, deadline by 10,000 ms, history length by 20 and candidate duration by 1,000 ms. These constants are feature units, not measured performance targets. Exported checkpoints record feature names, state keys, model configuration and calibration. Canonical index.json records source, model and specification hashes; each referenced episode has its own checksum so a build can verify that evidence has not silently changed.',
          'El preprocesamiento sustituye valores no finitos o inválidos por cero y limita a [-10,10]. Intentos se dividen por 10, plazo por 10000 ms, historial por 20 y duración por 1000 ms. Son unidades de características, no metas medidas. Los modelos registran nombres, claves, configuración y calibración. index.json registra hashes de código, modelos y especificación; cada episodio lleva suma de comprobación.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\widetilde z=\operatorname{clip}(z/d,-10,10)`,
          caption: b(
            'z is a finite numeric input and d its declared scaling divisor; nonnumeric or nonfinite values map to zero. Missingness must also be represented by an explicit state predicate when semantically meaningful.',
            'z es entrada finita y d divisor declarado; valores inválidos se convierten en cero. La ausencia semántica también requiere predicado explícito.',
          ),
        },
      ],
      table: {
        headers: [b('Record', 'Registro'), b('Required evidence', 'Evidencia requerida')],
        rows: [
          [
            b('Observation', 'Observación'),
            b(
              'event_id, goal_id, revision, state, candidates, capabilities, history',
              'event_id, goal_id, revision, state, candidates, capabilities, history',
            ),
          ],
          [
            b('Decision', 'Decisión'),
            b(
              'policy_id, candidate_id, mode, scores, reason, diagnostics',
              'policy_id, candidate_id, mode, scores, reason, diagnostics',
            ),
          ],
          [
            b('Episode', 'Episodio'),
            b(
              'run_id, case_id, method_id, variant, seed, lane, decisions, metrics, provenance',
              'run_id, case_id, method_id, variant, seed, lane, decisions, metrics, provenance',
            ),
          ],
          [
            b('Index', 'Índice'),
            b(
              'schema_version, generated_at, episodes, aggregate_results, lineage hashes',
              'schema_version, generated_at, episodes, aggregate_results, hashes de procedencia',
            ),
          ],
        ],
      },
      refs: ['guo2017', 'onnx2026'],
      limit: b(
        'A schema version and checksum identify a record; they do not prove that its labels are correct or its split is leakage free.',
        'Versión y checksum identifican registros; no demuestran etiquetas correctas ni ausencia de contaminación.',
      ),
    }),
    section({
      id: 'classical',
      area: 'engine',
      title: b('Linear, tree and bandit engines', 'Motores lineales, árboles y bandidos'),
      paragraphs: [
        b(
          'The supervised training module uses LogisticRegression with C=5 and max_iter=600 for M03. M04 uses 160 XGBoost trees, maximum depth 5, learning rate 0.08, histogram tree construction, two CPU threads and random_state=17. Candidate labels are derived from demonstration preference, which is narrower than verified action success. A separate logistic calibrator with C=10 and max_iter=300 fits the logit of each model probability on the calibration partition. The exported training report records the actual candidate count and elapsed training time.',
          'El entrenamiento usa LogisticRegression con C=5 y max_iter=600 en M03. M04 usa 160 árboles XGBoost, profundidad 5, tasa 0,08, construcción por histogramas, dos hilos y semilla 17. Las etiquetas expresan preferencia demostrada, más estrecha que éxito verificado. Un calibrador logístico separado con C=10 y max_iter=300 ajusta logits en calibración. El informe registra cantidad real de candidatos y tiempo.',
        ),
        b(
          'The probability contract is explicit: agreement with a demonstrated preferred action is not a safety bound. The bandit starts from a 64-dimensional representation with seed 17 and updates only from the action actually executed and its observed one-step reward. It never receives full-information rewards for unexecuted actions. This makes the logged feedback auditable, while the interpretation remains myopic when the policy is embedded in a multistep task. Compare candidate scoring overhead and complete episode outcomes rather than folding them into one latency number.',
          'El contrato probabilístico es explícito: acuerdo con acción preferida no es seguridad. El bandido usa representación de 64 dimensiones y semilla 17; actualiza solo desde acción ejecutada y recompensa observada. No recibe recompensas contrafactuales no ejecutadas. Esto permite auditar retroalimentación, aunque la interpretación sigue siendo miope en tareas de varios pasos. Comparar costo de puntuar y episodios completos por separado.',
        ),
      ],
      equations: [
        {
          tex: String.raw`p_{cal}=\sigma(\alpha\operatorname{logit}(p_{raw})+\beta)`,
          caption: b(
            'p_raw is the fitted scorer output, alpha and beta the coefficients fitted only on calibration data, and p_cal the calibrated demonstration-preference probability. Inputs to logit are clipped away from zero and one.',
            'p_raw es salida del puntuador; alpha y beta se ajustan solo en calibración; p_cal es probabilidad de preferencia demostrada. La entrada logit se aleja de cero y uno.',
          ),
        },
      ],
      refs: ['chen2016', 'guo2017', 'li2010'],
      limit: b(
        'The documented constants describe the shipped fitting code. The manifest is authoritative for the checkpoint actually used by a particular run.',
        'Las constantes describen el código de ajuste. El manifiesto identifica el modelo realmente utilizado por una ejecución.',
      ),
    }),
    section({
      id: 'recurrent',
      area: 'engine',
      title: b('Recurrent and reinforcement engines', 'Motores recurrentes y por refuerzo'),
      paragraphs: [
        b(
          'The recurrent network uses one GRU with 32 hidden units. The current state enters the recurrent encoder; each candidate enters a 48-unit tanh projection; the candidate representation and recurrent state concatenate into a 48-unit scoring layer and one scalar logit. A hidden state is kept per goal and reset at episode boundaries. The default fitting routine uses 25 epochs and seed 17. Calibration evaluates 41 temperatures on an exponential grid from exp(-2) to exp(2), choosing the lowest held-out calibration negative log likelihood.',
          'La red recurrente usa GRU de 32 unidades. El estado entra al codificador; cada candidato a proyección tanh de 48; ambas representaciones se concatenan en capa de 48 y logit escalar. Hay estado oculto por objetivo, reiniciado entre episodios. El ajuste predeterminado usa 25 épocas y semilla 17. Calibración evalúa 41 temperaturas entre exp(-2) y exp(2), eligiendo menor pérdida en su partición.',
        ),
        b(
          'Export uses ONNX opset 17 with state, candidates and hidden inputs; logits and next_hidden are outputs. Candidate count is dynamic. Export parity is measured against Python inference and must include changing candidate counts and hidden-state reset behavior. M07 uses SB3-Contrib MaskablePPO through the software Gym environment, with mask-aware evaluation. Its training steps, seed and reward configuration belong to the actual training report. The browser does not run these checkpoints unless a separately validated browser inference path is present; native execution and measured replay remain available.',
          'Se exporta ONNX opset 17 con entradas state, candidates, hidden y salidas logits, next_hidden. La cantidad candidata es dinámica. La paridad se mide contra Python incluyendo cantidades variables y reinicio. M07 usa MaskablePPO mediante Gym, con evaluación consciente de máscara. Pasos, semilla y recompensa pertenecen al informe real. El navegador no ejecuta esos pesos sin una ruta validada; permanecen ejecución nativa y reproducción medida.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\ell_{t,a}=q_\theta([\tanh(W_c\phi_{t,a}+b_c);h_t]),\qquad p_{t,a}=\operatorname{softmax}(\ell_t/T)_a`,
          caption: b(
            'phi is candidate input, W_c and b_c candidate projection parameters, h the 32-unit recurrent state, q the scoring network, ell logits and T the fitted temperature. Softmax normalizes only the current candidate set.',
            'phi es entrada candidata, W_c y b_c proyectan, h tiene 32 unidades, q puntúa, ell son logits y T temperatura. Softmax normaliza solo candidatos actuales.',
          ),
        },
      ],
      refs: ['cho2014', 'ross2011', 'maskableppo2026', 'onnx2026'],
      limit: b(
        'An exported graph is not browser parity evidence. Device, runtime version, numerical tolerance and tested inputs must accompany any portability claim.',
        'Un grafo exportado no demuestra paridad en navegador. Toda afirmación de portabilidad requiere dispositivo, versión, tolerancia y entradas probadas.',
      ),
    }),
    section({
      id: 'planning',
      area: 'engine',
      title: b('Prediction, planning and deferral', 'Predicción, planificación y derivación'),
      paragraphs: [
        b(
          'policies/control.py implements learned prediction and bounded lookahead, direct planner selection, asynchronous planner coordination, learned deferral and the persistent metacontroller. A missing required model raises ModelRequiredError rather than falling back to an unrelated heuristic under the same method ID. The local planner records its model identity and runtime registry metadata. Counterfactual planner benefit is learned from paired resettable executions; a planner self-rating is not used as environmental truth.',
          'policies/control.py implementa predicción, anticipación, selección directa, coordinación asíncrona, derivación y metacontrol. Un modelo requerido ausente produce ModelRequiredError sin sustituir heurísticas bajo el mismo identificador. El planificador registra identidad y metadatos. El beneficio contrafactual se aprende en ejecuciones reiniciables emparejadas, no desde autoevaluaciones del planificador.',
        ),
        b(
          'The runner records controller inference duration before executing the selected action. It then records tool duration, observed effects, contract violations, delegation diagnostics and demonstration agreement. Pending asynchronous work is synchronized and accounted for at the episode boundary, including proposals that became stale. Total wall time therefore has a different meaning from summed controller time. The UI preserves that distinction and exposes raw diagnostics instead of inferring unreported effects or interpreting every score as a probability.',
          'El evaluador registra duración de inferencia antes de ejecutar. Luego registra herramienta, efectos, violaciones, delegación y acuerdo demostrado. El trabajo asíncrono pendiente se sincroniza y contabiliza al final, incluso propuestas obsoletas. Tiempo total y suma de inferencia significan cosas distintas. La interfaz conserva esa distinción y expone diagnósticos sin inventar efectos ni interpretar cada puntaje como probabilidad.',
        ),
      ],
      equations: [
        {
          tex: String.raw`T_{wall}=t_{episode\ end}-t_{episode\ start},\qquad T_{policy}=\sum_t(t_{predict\ end,t}-t_{predict\ start,t})`,
          caption: b(
            'Wall time spans the full episode and pending planner accounting. Policy time sums measured predict calls. Overlap, execution and environment setup explain why these are not interchangeable.',
            'Tiempo total abarca episodio y planificación pendiente. Tiempo de política suma predict medidos. Superposición, ejecución y preparación explican su diferencia.',
          ),
        },
      ],
      refs: ['daw2005', 'kool2016', 'ong2024'],
      limit: b(
        'An available model adapter is not a completed benchmark cell. Unavailable methods, missing checkpoints and failed planner calls retain explicit status.',
        'Un adaptador disponible no es una celda evaluada. Métodos no disponibles, modelos ausentes y llamadas fallidas conservan estado explícito.',
      ),
    }),
    section({
      id: 'browser',
      area: 'lanes',
      title: b('Tasks and browser interaction', 'Tareas e interacción del navegador'),
      paragraphs: [
        b(
          'The default Tasks view uses ReadyPolicy: it selects the first admissible dependency-ready action. The native broker executes and verifies it, but this view does not invoke the fitted allocation gate or a language model. Investigations displays separately measured controller traces without rerunning effects.',
          'La vista principal Tareas usa ReadyPolicy: selecciona la primera acción admisible con dependencias listas. El núcleo nativo la ejecuta y verifica, pero esta vista no invoca el umbral de asignación ajustado ni un modelo de lenguaje. Investigaciones muestra trazas de controladores medidas por separado sin volver a ejecutar efectos.',
        ),
        b(
          'Tasks is the entry point for three concrete operations: source audit, data reconciliation and release verification. A run snapshots up to 256 UTF-8 files, with a 128 KiB per-file and 1 MiB total limit. The native controller admits only dependency-ready registered actions. Source analysis parses Python, strict JSON and TOML without executing uploaded code; CSV analysis checks missing fields, repeated identifiers and resolvable cross-table references. Normalization writes accepted rows to separate outputs and keeps rejected rows with their original line and reason. The final verifier rereads input bytes and checks their hashes, output manifests and row conservation independently of the action that produced them.',
          'Tareas ofrece tres operaciones concretas: auditar código, conciliar datos y verificar entregas. Cada ejecución conserva hasta 256 archivos UTF-8, con límites de 128 KiB por archivo y 1 MiB total. El controlador nativo admite solo acciones registradas cuyas dependencias estén listas. El análisis procesa Python, JSON estricto y TOML sin ejecutar código cargado; CSV comprueba campos ausentes, identificadores repetidos y referencias entre tablas presentes. La normalización escribe filas aceptadas en salidas separadas y conserva las rechazadas con línea y motivo. El verificador relee las entradas y comprueba hashes, manifiestos y conservación de filas independientemente de la acción productora.',
        ),
        b(
          'An analysis can finish correctly while rejecting its input delivery. The interface therefore separates execution status from the attention-required disposition, exposes each finding at its file and line, and exports original inputs, accepted data and the full decision journal together. The dependency graph shows actual action states rather than simulated progress. Investigations compares two frozen methods on the same case, fault condition and seed, showing observed state changes, native receipts, planner requests and failures. The advanced engine view retains the virtual simulator and authenticated native cases for controlled interventions; their timing and authority are labeled separately.',
          'Un análisis puede terminar correctamente y rechazar la entrega. La interfaz separa estado de ejecución y necesidad de atención, muestra cada hallazgo en archivo y línea y exporta entradas, datos aceptados y diario completo. El grafo muestra estados reales de acciones. Investigaciones compara dos métodos congelados con caso, condición y semilla iguales, exponiendo cambios observados, recibos nativos, solicitudes al planificador y fallos. La vista avanzada conserva simulación y casos nativos autenticados para intervenciones controladas, con tiempos y autoridad identificados por separado.',
        ),
        b(
          'src/lib/simulator.ts implements the virtual workspace as a serializable state machine. A linear-congruential random generator uses multiplier 1664525, increment 1013904223 and unsigned 32-bit state. The seed, case, method, variant and continuous parameters determine the virtual sequence. A step records its event, action, candidate priorities, resource revision, simulated time and outcome. Fault injection marks the next effect unknown or failed; cancellation stops new transitions while preserving already observed state.',
          'src/lib/simulator.ts implementa el espacio virtual serializable. El generador congruencial usa multiplicador 1664525, incremento 1013904223 y estado de 32 bits sin signo. Semilla, caso, método, variante y parámetros determinan la secuencia. Cada paso registra evento, acción, prioridades, revisión, tiempo y resultado. Inyectar fallo marca un efecto desconocido o fallido; cancelar detiene transiciones conservando estado observado.',
        ),
        b(
          'The workbench uses the shared pause-aware visualization loop, starts paused and stops playback when the browser tab is hidden. Run advances a finite episode; Step admits one transition; the cursor links every instrument to a recorded decision. Import accepts bounded JSON data, validates the episode shape and never dispatches its contents. Canonical fetch paths must remain relative to the published data directory. The app uses ordinary SVG for readable, keyboard-focusable diagrams and charts; no model inference or training happens as a side effect of opening a documentation page.',
          'El banco usa el ciclo visual compartido que comienza pausado y se detiene al ocultar pestaña. Ejecutar avanza episodio finito; Paso admite transición; el cursor vincula instrumentos. Importar acepta JSON acotado, valida forma y nunca ejecuta contenido. Las rutas canónicas son relativas al directorio publicado. SVG permite lectura y teclado; abrir documentación no entrena ni ejecuta modelos.',
        ),
      ],
      equations: [
        {
          tex: String.raw`s_{n+1}=(1664525s_n+1013904223)\bmod 2^{32},\qquad u_n=s_{n+1}/2^{32}`,
          caption: b(
            's is the seeded unsigned generator state and u a reproducible uniform variate used only by the virtual environment. This generator is not used for authentication or cryptographic purposes.',
            's es estado sin signo con semilla y u variable uniforme reproducible del entorno virtual. No se usa para autenticación ni criptografía.',
          ),
        },
      ],
      refs: ['behaviortree2026'],
      limit: b(
        'Virtual milliseconds are model time. They must never be plotted as measured native policy latency or interpreted as actual operating-system scheduling guarantees.',
        'Los milisegundos virtuales son tiempo del modelo. Nunca equivalen a latencia nativa medida ni garantía de planificación del sistema.',
      ),
    }),
    section({
      id: 'pipeline',
      area: 'architecture',
      title: b('Offline evidence pipeline', 'Canalización de evidencia fuera de línea'),
      paragraphs: [
        b(
          'The pipeline collects bounded software episodes, splits groups before fitting, trains supported methods, calibrates on distinct data, freezes checkpoints and executes held-out cases. The source specification defines twenty families and six variants. Generated episodes record the actual lane and truth boundary; configured quota pressure and scheduled planner availability are disclosed as fixtures. Source hashes, model hashes, package versions, platform and the specification hash form the lineage signature used to reject stale cached episodes.',
          'La canalización recolecta episodios, separa grupos antes de ajustar, entrena, calibra con datos distintos, congela pesos y ejecuta casos reservados. La especificación define veinte familias y seis variantes. Los episodios registran modo y límite de verdad; cuota configurada y disponibilidad programada se declaran escenarios. Hashes de código y modelos, versiones, plataforma y especificación forman la firma que rechaza caché obsoleta.',
        ),
        b(
          'The evaluator exports episodes/<run_id>.json and index.json. The app prebuild copies canonical derived data into the static public directory without training, recomputing benchmark truth or changing metrics. Benchmark aggregation operates only on saved measured records. Descriptive intervals must disclose their independence assumptions; repeated variants from a designed family are not a random sample of all software tasks. A release can preserve a negative scientific result while still providing useful tools and a reproducible evaluation framework.',
          'El evaluador exporta episodes/<run_id>.json e index.json. Antes de compilar, la app copia datos canónicos al directorio público sin entrenar ni cambiar métricas. La agregación usa registros medidos. Intervalos descriptivos declaran independencia; variantes de una familia diseñada no son muestra aleatoria de todas las tareas. Una publicación puede conservar resultados negativos y ofrecer herramientas útiles y evaluación reproducible.',
        ),
      ],
      equations: [
        {
          tex: String.raw`H_{lineage}=\mathrm{SHA256}(\operatorname{canonicalJSON}(\text{code, models, configuration, versions}))`,
          caption: b(
            'H_lineage identifies the frozen evaluation inputs. Cryptographic identity supports reproducibility but does not validate scientific assumptions or make wall-clock measurements deterministic.',
            'H_lineage identifica entradas congeladas. La identidad apoya reproducibilidad sin validar supuestos ni volver deterministas las mediciones temporales.',
          ),
        },
      ],
      steps: [
        b(
          'Collect observed transitions and record unsuccessful outcomes.',
          'Recolectar transiciones y resultados fallidos.',
        ),
        b(
          'Partition complete groups before fitting or tuning.',
          'Particionar grupos completos antes de ajustar.',
        ),
        b(
          'Fit, calibrate, freeze and record model provenance.',
          'Ajustar, calibrar, congelar y registrar procedencia.',
        ),
        b(
          'Execute held-out episodes with independent effect predicates.',
          'Ejecutar episodios reservados con predicados independientes.',
        ),
        b(
          'Validate and publish immutable evidence for replay.',
          'Validar y publicar evidencia inmutable.',
        ),
      ],
      refs: ['ross2011', 'guo2017', 'agarwal2021'],
      limit: b(
        'A generated index is not evidence that every requested cell succeeded. Coverage, unavailable methods and failed episodes must be inspected explicitly.',
        'Un índice generado no demuestra éxito de cada celda. Cobertura, métodos ausentes y episodios fallidos se inspeccionan explícitamente.',
      ),
    }),
    section({
      id: 'deployment',
      area: 'deployment',
      title: b('API, deployment and reproducibility', 'API, despliegue y reproducibilidad'),
      paragraphs: [
        b(
          'The public operations service uses the same HTTPS origin as the frontend and accepts only the three declared task types. Each browser receives an unguessable session capability; every run read, cancellation, download and deletion checks ownership. Inputs are data, never shell commands or imported modules. Two runs may execute concurrently, a session has one active run, at most 24 retained runs occupy the service, and at most 20 runs start per minute. Completed directories and session capabilities expire after one hour, including orphaned directories after restart. A dedicated unprivileged Linux service bounds memory and CPU. Its state directory is separate from static releases and from the private local workspace.',
          'El servicio público usa el mismo origen HTTPS y acepta solo los tres tipos declarados. Cada navegador recibe una capacidad de sesión impredecible; toda lectura, cancelación, descarga y eliminación verifica propiedad. Las entradas son datos, nunca órdenes de shell ni módulos importados. Se ejecutan dos tareas concurrentes, una por sesión, con hasta 24 resultados retenidos y 20 inicios por minuto. Directorios y capacidades caducan tras una hora, incluidos huérfanos después de reiniciar. Un servicio Linux sin privilegios limita memoria y CPU. Su almacenamiento está separado de las versiones estáticas y del espacio local privado.',
        ),
        b(
          'The native workbench uses the API on its own origin. GET /api/config reports capabilities and authentication requirements. POST /api/run starts a case with method, variant, seed and parameters. GET /api/events polls a run after a sequence number; POST /api/cancel/{id} requests cancellation; POST /api/replay validates a record without repeating its effects. The session token remains in browser memory. The public site also runs bounded file operations on its own server through a separate API; the general workspace and trained-model APIs remain local. It does not probe arbitrary localhost services or expose a remote shell.',
          'El banco nativo usa API del mismo origen. GET /api/config informa capacidades y autenticación. POST /api/run inicia caso con método, variante, semilla y parámetros. GET /api/events consulta después de secuencia; POST /api/cancel/{id} solicita cancelación; POST /api/replay valida sin repetir efectos. El token permanece en memoria. El sitio público ejecuta operaciones de archivos limitadas en su propio servidor mediante otra API; las API de espacio general y modelos entrenados permanecen locales. No sondea servicios locales arbitrarios ni expone shell.',
        ),
        b(
          'A static build contains application code, translated content, SVG diagrams and validated canonical artifacts. Training environments, external datasets, caches, secrets and local runtime authority stay outside the published assets. Direct route loads must resolve to the SPA entry and then fetch the same versioned data as in-app navigation. Theme and language are persistent shared-shell preferences. Reproducibility records distinguish code and seeded virtual determinism from hardware-dependent latency, concurrent scheduling and probabilistic external model responses.',
          'Una compilación estática contiene código, traducciones, SVG y artefactos validados. Entrenamiento, datos externos, caché, secretos y autoridad local quedan fuera. Cargar rutas directas debe resolver la entrada SPA y los mismos datos versionados que navegar internamente. Tema e idioma persisten. Los registros distinguen determinismo virtual de latencia dependiente de equipo, concurrencia y respuestas probabilísticas externas.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\text{same inputs + seed + code}\Rightarrow\text{same virtual decisions};\qquad T_{wall}\not\equiv\text{constant}`,
          caption: b(
            'The deterministic claim concerns virtual decision records under identical inputs. Native timing remains a measured random quantity with platform and load provenance.',
            'El determinismo se refiere a decisiones virtuales con entradas iguales. El tiempo nativo es una cantidad medida con procedencia de plataforma y carga.',
          ),
        },
      ],
      refs: ['onnx2026', 'pyo32026'],
      limit: b(
        'Successful compilation, HTTP availability and policy unit tests are separate from authenticated runtime integration, route hydration and browser interaction validation.',
        'Compilación, disponibilidad HTTP y pruebas unitarias son distintas de integración autenticada, hidratación de rutas y validación de interacción.',
      ),
    }),
  ],
};
implementation.sections
  .find((s) => s.id === 'deployment')!
  .paragraphs.push(
    b(
      'The Workspace editor adds native user-authored workflows. The operator supplies an existing root with --workspace and optionally a local --process-config containing immutable process registrations. GET /api/workspace/config reports that authority; the browser cannot widen it. POST /api/workspace/preview validates a dependency recipe and captures fingerprints, then POST /api/workspace/run consumes the reviewed preview once within 120 seconds. Each goal has an independently checked relative-path SHA-256 postcondition. A predicate that already holds completes without redispatch. The workflow uses verified-workflow-fsm, not an unevaluated learned policy. Its journal, cancellation state, receipt and verification result remain inspectable through /api/workspace/events. Route navigation preserves the live run and token in application memory; a full page reload discards those credentials.',
      'El editor Archivos incorpora flujos nativos definidos por el usuario. El operador indica una raíz existente con --workspace y, opcionalmente, --process-config con procesos inmutables. GET /api/workspace/config informa autoridad que el navegador no amplía. POST /api/workspace/preview valida dependencias y captura huellas; POST /api/workspace/run consume una vez la previsualización en 120 segundos. Cada objetivo tiene una poscondición SHA-256 independiente sobre una ruta relativa. Si ya se cumple, no se repite la herramienta. El controlador es verified-workflow-fsm, no una política aprendida sin evaluar. Diario, cancelación, recibos y verificación se inspeccionan mediante /api/workspace/events. Navegar conserva ejecución y token en memoria; recargar la página descarta esas credenciales.',
    ),
  );
implementation.sections
  .find((s) => s.id === 'planning')!
  .paragraphs.push(
    b(
      'The shipped forward predictor uses two hidden layers of 64 and 48 ReLU units and emits state-transition features plus reward and completion outputs. The bounded search uses horizon 2 and an expansion cap of 24. The persistent metacontroller combines current evidence with an exponentially weighted residual, using 0.8 of the previous summary and 0.2 of the newly observed residual. The default surprise threshold is 0.25. These are implementation constants, not neurobiological estimates or calibrated risk limits. A manual evidence/surprise trigger is reported separately from the learned incremental-utility gate, particularly when paired calibration finds no positive planner benefit.',
      'El predictor distribuido utiliza capas ocultas de 64 y 48 unidades ReLU y produce características de transición, recompensa y finalización. La búsqueda usa horizonte 2 y máximo 24 expansiones. El metacontrolador combina evidencia con un residuo ponderado exponencialmente: 0,8 del resumen anterior y 0,2 del residuo observado. El umbral predeterminado es 0,25. Son constantes de implementación, no estimaciones neurobiológicas ni límites de riesgo calibrados. El disparador manual de evidencia o sorpresa se informa separado de la puerta aprendida de utilidad incremental, especialmente cuando la calibración emparejada no encuentra beneficio positivo del planificador.',
    ),
  );

implementation.sections
  .find((section) => section.id === 'runtime')!
  .paragraphs.push(
    b(
      'Investigations compares two hash-verified controllers on the same core or semantic family, variant and seed. Semantic choices display the observed goal, tool descriptions and actual JSON writes. Expand waiting events without changing the exported trace. On the authenticated loopback service, POST /api/run accepts suite=semantic_transfer. Fresh native provenance remains separate from frozen matrices. Setup stores models outside Git; --checkpoints, --operations-root and --temp-root configure external storage.',
      'Investigaciones compara dos controladores verificados por hash en la misma familia principal o semántica, variante y semilla. Las elecciones semánticas muestran el objetivo, las herramientas y las escrituras JSON reales. Expandir eventos de espera no cambia la traza exportada. En el servicio local autenticado, POST /api/run acepta suite=semantic_transfer. La procedencia nativa nueva queda separada de las matrices congeladas. La instalación guarda modelos fuera de Git; --checkpoints, --operations-root y --temp-root configuran almacenamiento externo.',
    ),
  );
