import { bi as b } from './registry';
import type { ContentPage } from './content.types';
export const introduction: ContentPage = {
  title: b('Introduction', 'Introducción'),
  lede: b(
    'Neuraxis studies a practical control problem: choose useful software actions quickly, retain enough history to interpret asynchronous events, and spend slower reasoning only when its expected benefit justifies the delay. The system exposes its observations, proposals, permissions and consequences so that speed, task success and uncertainty can be evaluated separately.',
    'Neuraxis estudia un problema práctico de control: elegir acciones útiles rápidamente, conservar historial para interpretar eventos asíncronos y usar razonamiento lento cuando su beneficio esperado justifica la demora. Expone observaciones, propuestas, permisos y consecuencias para evaluar velocidad, éxito e incertidumbre por separado.',
  ),
  sections: [
    {
      id: 'problem',
      title: b('The control problem', 'El problema de control'),
      paragraphs: [
        b(
          'Software automation operates on a changing world. A file is revised after it was read, a process exits while a planner is thinking, a remote write times out after committing, and two agents compete for the same resource. Choosing an action from the latest prompt is only one part of the task. A useful controller must retain unresolved effects, enforce resource versions, stop new work when cancelled and distinguish a verified consequence from a plausible statement about success.',
          'La automatización opera en un mundo cambiante. Un archivo cambia tras leerse, un proceso termina durante planificación, una escritura remota vence tras confirmarse y dos agentes compiten por recursos. Elegir una acción desde el último mensaje es solo parte de la tarea. El controlador retiene efectos pendientes, aplica versiones, detiene admisiones al cancelar y distingue consecuencias verificadas de afirmaciones plausibles.',
        ),
        b(
          'The workbench serves engineers investigating bounded software agents, researchers evaluating computation allocation and operators inspecting reproducible executions. It is organized around one selected scenario: control the virtual environment, run or step a policy, introduce an observed fault and inspect the outcome. Native executions use a separately authenticated local runtime with configured capabilities. Canonical episodes preserve actual measured software runs; their replay cannot execute the recorded effects again.',
          'El banco sirve a ingenieros de agentes acotados, investigadores de asignación de cómputo y operadores de ejecuciones reproducibles. Se organiza en un caso: controlar el entorno virtual, ejecutar por pasos, introducir fallos y examinar resultados. Las ejecuciones nativas usan motor local autenticado y capacidades configuradas. Los episodios canónicos preservan ejecuciones medidas y reproducirlos nunca repite sus efectos.',
        ),
        b(
          'The twenty task families cover document routing, indexing, data validation, recovery, retry, ambiguous writes, cancellation, resource pressure, dependencies, contention, delegation, deadlines, malformed proposals, hostile observations, missing evidence, new registered tools, event order, drift and crash recovery. They are engineered tasks with explicit truth conditions. Their value is that success can be independently checked. Their limitation is that passing them does not establish general performance on arbitrary applications or human workflows.',
          'Las veinte familias cubren clasificación, índice, validación, recuperación, reintento, escrituras ambiguas, cancelación, recursos, dependencias, contención, delegación, plazos, propuestas inválidas, observaciones hostiles, evidencia ausente, herramientas registradas nuevas, orden, deriva y caídas. Son tareas diseñadas con condiciones explícitas. Su valor es verificar éxito independientemente; superarlas no demuestra rendimiento general en aplicaciones arbitrarias.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\text{observe}\;\rightarrow\;\text{propose}\;\rightarrow\;\text{admit}\;\rightarrow\;\text{execute}\;\rightarrow\;\text{verify}`,
          caption: b(
            'Each arrow is a recorded stage. A proposal is not an execution, admission is not success and a timeout is not evidence that an effect did not occur.',
            'Cada flecha es una etapa registrada. Proponer no es ejecutar, admitir no es tener éxito y un vencimiento no demuestra ausencia de efecto.',
          ),
        },
      ],
      refs: ['lu2024', 'typesafe2026'],
      limit: b(
        "The hosted browser controls a virtual workspace. It does not acquire access to arbitrary files, processes or accounts on the viewer's computer.",
        'El navegador alojado controla un espacio virtual. No adquiere acceso a archivos, procesos ni cuentas arbitrarias del equipo.',
      ),
      nodes: [
        b('Goal + observations', 'Objetivo + observaciones'),
        b('Persistent controller', 'Controlador persistente'),
        b('Registered actions', 'Acciones registradas'),
        b('Bounded executor', 'Ejecutor acotado'),
        b('Observed result', 'Resultado observado'),
      ],
      figure: b(
        'A software controller closes the observation-action loop around actual outcome checks.',
        'Un controlador cierra el ciclo de observación y acción mediante comprobaciones del resultado.',
      ),
    },
    {
      id: 'biology',
      title: b(
        'Biological inspiration, bounded claims',
        'Inspiración biológica, afirmaciones acotadas',
      ),
      paragraphs: [
        b(
          'The familiar System One and System Two labels are a useful conversation about computational roles, but a poor literal anatomy. Evidence for rapid logical responses challenges the idea that all reasoning is slow, and critiques of dual-process taxonomies warn that automaticity, effort, consciousness and speed need not form two inseparable bundles. A language model is therefore not categorically System Two. Its runtime role depends on the computation it performs and the information it receives.',
          'Los términos Sistema Uno y Dos ayudan a discutir roles, pero describen mal una anatomía literal. Respuestas lógicas rápidas cuestionan que razonar siempre sea lento. Críticas de taxonomías duales muestran que automaticidad, esfuerzo, conciencia y velocidad no forman necesariamente dos paquetes. Un modelo de lenguaje no es categóricamente Sistema Dos: su rol depende del cómputo y la información recibida.',
        ),
        b(
          'Several narrower mechanisms are useful engineering inspirations. Reliability-sensitive arbitration suggests comparing the expected usefulness of alternative controllers. Inhibitory control suggests an interruption lane independent of the current policy. Cerebellar adaptation motivates prediction of observable effects and comparison with subsequent evidence. Recurrent cortical dynamics and a hierarchy of timescales motivate persistent causal summaries. Complementary learning systems motivate separating rapid episodic recording from slower policy consolidation. Each translation is an engineering hypothesis, not a claim that a software module reproduces a brain region.',
          'Mecanismos más específicos inspiran ingeniería. El arbitraje sensible a fiabilidad sugiere comparar utilidad esperada. La inhibición inspira interrupción independiente. La adaptación cerebelosa motiva predecir efectos y compararlos con evidencia. Dinámica recurrente y escalas temporales motivan resúmenes causales persistentes. Aprendizaje complementario separa registro rápido y consolidación lenta. Cada traducción es hipótesis de ingeniería, no reproducción de regiones cerebrales.',
        ),
        b(
          'Contradictory evidence matters. Manipulations that change surprise-related slowing need not rescue errors, so stopping latency and decision correctness require different metrics. Mixed model-based and model-free influences undermine a simple switch between pure controllers. Expected observation noise and unexpected environmental change call for different responses. The experimental program consequently separates cancellation admission from actual termination, varies noise independently of drift and includes recurrent adaptation as an alternative to a fixed two-controller architecture.',
          'La evidencia contraria importa. Cambiar la lentitud por sorpresa no necesariamente corrige errores: latencia de detención y corrección requieren métricas distintas. Influencias mixtas con y sin modelo cuestionan un interruptor puro. Ruido esperado y cambio inesperado requieren respuestas diferentes. Por eso se separa admisión de cancelación y terminación, se varía ruido independientemente de deriva y se incluye adaptación recurrente como alternativa.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\text{biological observation}\;\rightarrow\;\text{computational hypothesis}\;\rightarrow\;\text{ablation}`,
          caption: b(
            'The bridge is methodological: identify a bounded empirical observation, implement a measurable mechanism and remove it while holding other conditions fixed. A metaphor is not an evaluation result.',
            'El puente es metodológico: identificar observación acotada, implementar mecanismo medible y retirarlo manteniendo condiciones. Una metáfora no es un resultado.',
          ),
        },
      ],
      refs: [
        'bago2017',
        'melnikoff2018',
        'daw2011',
        'heston2020',
        'tseng2007',
        'mante2013',
        'murray2014',
        'yu2005',
        'wang2018',
      ],
      limit: b(
        'Neuraxis makes no claim of biological fidelity, consciousness or AGI. Its claims concern reproducible software-control behavior under declared conditions.',
        'Neuraxis no declara fidelidad biológica, conciencia ni AGI. Sus afirmaciones se refieren a control reproducible bajo condiciones declaradas.',
      ),
      nodes: [
        b('Arbitration', 'Arbitraje'),
        b('Stopping', 'Detención'),
        b('Prediction', 'Predicción'),
        b('Persistent state', 'Estado persistente'),
        b('Offline replay', 'Repetición fuera de línea'),
      ],
      figure: b(
        'Biology suggests separable functions; experiments determine whether those functions help this software workload.',
        'La biología sugiere funciones separables; los experimentos determinan su utilidad en esta carga de software.',
      ),
    },
    {
      id: 'formal',
      title: b('State, action and computation', 'Estado, acción y cómputo'),
      paragraphs: [
        b(
          'The environment state is only partially observed. The exact reducer stores what was observed, its source and revision, including conflicts and missingness. A learned temporal state can summarize history but cannot grant capabilities. Candidate binding turns registered action templates into grounded operations on particular resources. The admissibility set is evaluated under the current goal, authority and resource state, then rechecked at dispatch because the environment can change between scoring and execution.',
          'El estado del entorno se observa parcialmente. El reductor exacto conserva observaciones, fuentes, revisiones, conflictos y ausencias. Un estado temporal aprendido resume historial sin conceder capacidades. Vincular candidatos convierte plantillas en operaciones sobre recursos concretos. La admisibilidad depende del objetivo, autoridad y recursos actuales y se vuelve a verificar al ejecutar por posibles cambios.',
        ),
        b(
          'The objective is episode utility, not token generation speed. A fast incorrect action may make a workflow irrecoverable; a slow correct proposal may miss its deadline. Delay should count the critical path, not sum every overlapping worker duration. Report task success, adverse effects, unresolved outcomes, controller overhead and reasoner use separately before combining them into any weighted score. Weights express a task preference and must be declared before held-out evaluation.',
          'El objetivo es utilidad del episodio, no velocidad de tokens. Una acción rápida incorrecta puede impedir recuperación; una propuesta correcta tardía puede vencer. La demora cuenta ruta crítica, no suma trabajos superpuestos. Informar éxito, efectos adversos, resultados pendientes, costo de control y uso de razonamiento por separado antes de ponderar. Los pesos expresan preferencias y se declaran antes de evaluar.',
        ),
      ],
      equations: [
        {
          tex: String.raw`x_t=R(x_{t-1},o_t),\quad h_t=f_\theta(h_{t-1},x_t,a_{t-1},y_{t-1}),\quad b_t=(x_t,h_t,B_t)`,
          caption: b(
            'The controller summary b combines exact observed state x, learned state h and remaining budget B. R and f are update functions; o is an event, a an action and y its observed or unresolved outcome.',
            'El resumen b combina estado observado x, aprendido h y presupuesto B. R y f actualizan; o es evento, a acción e y resultado observado o pendiente.',
          ),
        },
        {
          tex: String.raw`J(\pi)=\mathbb E_\pi\!\left[L_{goal}+\sum_t(\lambda_c c_t+\lambda_d d_t+\lambda_r r_t+\lambda_m m_t)\right]`,
          caption: b(
            'J is expected loss under policy pi. L_goal is terminal goal loss; c compute/resource cost; d critical-path delay; r observed adverse-effect cost; m deadline loss. Lambda coefficients are fixed task weights.',
            'J es pérdida esperada bajo pi. L_goal es pérdida de objetivo; c costo; d demora crítica; r costo adverso observado; m pérdida por plazo. Los coeficientes lambda son pesos fijos.',
          ),
        },
      ],
      symbols: [
        b('s: hidden environment state', 's: estado oculto del entorno'),
        b('o: received observation or event', 'o: observación o evento recibido'),
        b('x: exact record of observed facts', 'x: registro exacto de hechos observados'),
        b('h: bounded learned temporal state', 'h: estado temporal aprendido acotado'),
        b('b: combined controller summary', 'b: resumen combinado del controlador'),
        b('g: declared task goal', 'g: objetivo declarado'),
        b('a: registered and bound action', 'a: acción registrada y vinculada'),
        b('y: verified or unresolved outcome', 'y: resultado verificado o pendiente'),
        b('B: remaining resource budget', 'B: presupuesto restante'),
        b('pi: action and computation policy', 'pi: política de acción y cómputo'),
        b('theta: learned policy parameters', 'theta: parámetros aprendidos'),
        b('t: causal decision index', 't: índice causal de decisión'),
      ],
      refs: ['sutton1999', 'daw2005', 'kool2016'],
      limit: b(
        'A compact state representation can lose information. Recurrent memory is measured by its behavior on held-out delayed and reordered events, not by its mere presence.',
        'Un estado compacto puede perder información. La memoria recurrente se mide en eventos demorados o desordenados reservados, no por su mera presencia.',
      ),
      nodes: [
        b('Observation o', 'Observación o'),
        b('Exact state x', 'Estado exacto x'),
        b('Temporal state h', 'Estado temporal h'),
        b('Admissible A', 'Conjunto admisible A'),
        b('Policy + outcome', 'Política + resultado'),
      ],
      figure: b(
        'Exact state and learned state have different authority. Both are causal inputs, but only configured capabilities permit effects.',
        'Estado exacto y aprendido tienen distinta autoridad. Ambos son causales, pero solo capacidades configuradas permiten efectos.',
      ),
    },
    {
      id: 'workflow',
      title: b('End-to-end workflow', 'Flujo completo'),
      paragraphs: [
        b(
          'Start with a scenario and a policy whose lane is explicit. In the browser, only faithfully implemented exact controllers operate the virtual workspace. Native and canonical lanes expose trained policies without replacing their weights with similarly named heuristics. Parameters alter the live environment: latency changes virtual action duration, reliability changes observed failures, noise changes refresh demand, concurrency introduces contention, and the deadline limits admitted work. The acceptance threshold controls the exact-policy refresh condition rather than pretending to calibrate a probability.',
          'Elegir caso y política con modo explícito. Solo controladores exactos implementados operan el espacio virtual del navegador. Modos nativos y canónicos exponen políticas entrenadas sin sustituir pesos por heurísticas. Parámetros alteran duración, fallos, observaciones, contención y plazos. El umbral controla actualización de evidencia en la política exacta sin aparentar calibración probabilística.',
        ),
        b(
          'Use the decision cursor to align events, resource versions, candidate scores and predicted effects. Missing quantities are visibly absent. A resource graph can show the snapshot recorded at the selected decision; an imported file is treated as untrusted evidence and cannot dispatch actions. Export preserves the episode, parameters and provenance so another analyst can inspect the same sequence. A canonical replay changes only the display cursor; a new native run is a distinct execution with a new identity.',
          'El cursor alinea eventos, versiones, candidatos y efectos. Los valores ausentes permanecen visibles como ausencias. El grafo muestra la instantánea registrada; archivos importados son evidencia no confiable sin ejecución. Exportar conserva episodio, parámetros y procedencia. La reproducción canónica solo cambia el cursor; ejecutar nativamente crea una identidad nueva.',
        ),
      ],
      equations: [],
      steps: [
        b(
          'Choose the case, method, execution lane, variant and seed.',
          'Elegir caso, método, modo, variante y semilla.',
        ),
        b(
          'Inspect the goal and configured authority before a native run.',
          'Inspeccionar objetivo y autoridad antes de ejecutar nativamente.',
        ),
        b(
          'Run or step, then intervene with a fault or cancellation.',
          'Ejecutar o avanzar e intervenir con fallo o cancelación.',
        ),
        b(
          'Inspect admission, execution and verified outcome as separate records.',
          'Inspeccionar admisión, ejecución y resultado como registros separados.',
        ),
        b(
          'Compare a paired canonical method and export the evidence.',
          'Comparar método canónico emparejado y exportar evidencia.',
        ),
      ],
      refs: ['lu2024', 'behaviortree2026'],
      limit: b(
        'A displayed run is not proof that another lane has identical semantics. Browser virtual time, native wall time and immutable replay are explicitly separated.',
        'Una ejecución mostrada no demuestra semántica idéntica en otro modo. Tiempo virtual, tiempo real nativo y reproducción inmutable se separan.',
      ),
      nodes: [
        b('Configure', 'Configurar'),
        b('Run / step', 'Ejecutar / paso'),
        b('Intervene', 'Intervenir'),
        b('Inspect', 'Inspeccionar'),
        b('Export', 'Exportar'),
      ],
      figure: b(
        'The interaction loop is an executable experiment with inspectable consequences.',
        'El ciclo de interacción es un experimento ejecutable con consecuencias inspeccionables.',
      ),
    },
    {
      id: 'honesty',
      title: b('Scope and evidence', 'Alcance y evidencia'),
      paragraphs: [
        b(
          'Typed output validity, probability calibration, action usefulness, authorization and trajectory success are distinct properties. Jev demonstrates a useful typed-decision interface, but schema compliance does not establish semantic correctness or permission to execute. Its launch performance claims are vendor reports, and the inspected public material does not disclose enough to reproduce its model or RLCD training. Neuraxis therefore evaluates its own controller and can treat external typed scorers as optional proposal sources, not as hidden foundations of a claimed reproduction.',
          'Validez tipada, calibración, utilidad, autorización y éxito de trayectoria son propiedades distintas. Jev ofrece una interfaz útil, pero cumplir esquema no establece corrección ni permiso. Las cifras de lanzamiento son informes del proveedor; el material inspeccionado no permite reproducir modelo ni RLCD. Neuraxis evalúa su propio controlador y trata puntuadores externos como fuentes opcionales, no fundamento oculto de una reproducción.',
        ),
        b(
          'The benchmark reports values only from generated evidence. Engineered software fixtures have explicit truth conditions and limitations: a configured quota is not a full operating-system resource model, and a scheduled planner-availability event is not an actual language-model call. The scientific question is whether persistent outcome-aware computation allocation improves a measured frontier over simpler competent methods. If evidence does not support improvement, the correct result is a documented negative or limited finding, not a stronger label.',
          'El benchmark informa valores solo desde evidencia generada. Los escenarios tienen verdad y límites explícitos: cuota configurada no equivale a modelo completo de recursos y disponibilidad programada no equivale a llamada de lenguaje. La pregunta científica es si asignar cómputo con estado y resultados mejora una frontera medida frente a métodos competentes. Si no, el resultado correcto es negativo o limitado, sin etiquetas exageradas.',
        ),
      ],
      equations: [
        {
          tex: String.raw`\text{valid type}\;\not\Rightarrow\;\text{correct action}\;\not\Rightarrow\;\text{authorized effect}`,
          caption: b(
            'The implications do not hold. Type checking, semantic validation and capability enforcement are separate obligations with separate evidence.',
            'Las implicaciones no se cumplen. Tipado, validación semántica y capacidades son obligaciones separadas con evidencia propia.',
          ),
        },
      ],
      refs: ['typesafe2026', 'typesafeconfidence2026', 'agarwal2021', 'angelopoulos2024'],
      limit: b(
        'No blanket novelty, hard real-time, biological fidelity or universal safety claim is made. The relevant unit of evidence is the versioned evaluated task under its declared assumptions.',
        'No se declara novedad absoluta, tiempo real estricto, fidelidad biológica ni seguridad universal. La unidad de evidencia es la tarea versionada bajo supuestos declarados.',
      ),
      nodes: [
        b('Typed output', 'Salida tipada'),
        b('Useful decision', 'Decisión útil'),
        b('Permission', 'Permiso'),
        b('Observed effect', 'Efecto observado'),
        b('Episode success', 'Éxito del episodio'),
      ],
      figure: b(
        'Each property has an independent test; evidence for one is not silently transferred to another.',
        'Cada propiedad tiene prueba independiente; la evidencia no se transfiere silenciosamente entre propiedades.',
      ),
    },
  ],
};
