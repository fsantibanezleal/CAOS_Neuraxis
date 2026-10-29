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
          'The application starts with work that produces inspectable deliverables: audit a source workspace, reconcile a tabular delivery, or verify a release bundle. Supply UTF-8 files or inspect the owned compound workload before running it. The controller executes registered analyzers through the native broker, coordinates dependent stages, and produces actionable findings, preserved input bytes, accepted records and a SHA-256 manifest. A completed investigation may correctly identify a broken delivery; success of the analysis is separate from acceptance of the input. The Investigations view compares actual recorded controllers under matching task conditions, including failed outcomes.',
          'La aplicación comienza con trabajo que produce entregables inspeccionables: auditar un proyecto, conciliar datos tabulares o verificar una entrega. Proporcionar archivos UTF-8 o inspeccionar la carga propia antes de ejecutarla. El controlador ejecuta analizadores registrados mediante el núcleo nativo, coordina dependencias y produce hallazgos, entradas conservadas, registros aceptados y un manifiesto SHA-256. Una investigación completada puede identificar correctamente una entrega defectuosa; el éxito del análisis se separa de la aceptación de la entrada. Investigaciones compara controladores realmente ejecutados bajo condiciones emparejadas, incluidos fallos.',
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
        'Hosted tasks process only the text files explicitly submitted to a bounded native service. Arbitrary code execution and access to the viewer’s filesystem are not granted. Broader local workflows require an operator-configured authenticated runtime.',
        'Las tareas alojadas procesan solo archivos de texto enviados explícitamente a un servicio nativo acotado. No conceden ejecución arbitraria ni acceso al sistema de archivos del visitante. Los flujos locales amplios requieren un motor autenticado configurado por el operador.',
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
      glossary: [
        {
          term: b('xₜ', 'xₜ'),
          definition: b(
            'Exact state assembled only from received, source-bound observations.',
            'Estado exacto construido solo con observaciones recibidas y vinculadas a su fuente.',
          ),
        },
        {
          term: b('hₜ', 'hₜ'),
          definition: b(
            'Bounded learned summary of decision history; it grants no tool authority.',
            'Resumen aprendido y acotado del historial; no concede autoridad sobre herramientas.',
          ),
        },
        {
          term: b('bₜ', 'bₜ'),
          definition: b(
            'Controller summary containing exact state, learned state and remaining budget.',
            'Resumen del controlador con estado exacto, aprendido y presupuesto restante.',
          ),
        },
        {
          term: b('oₜ', 'oₜ'),
          definition: b(
            'Observation or event received at decision step t.',
            'Observación o evento recibido en el paso de decisión t.',
          ),
        },
        {
          term: b('aₜ', 'aₜ'),
          definition: b(
            'Registered action bound to a specific tool, resource and validated arguments.',
            'Acción registrada y vinculada a herramienta, recurso y argumentos validados.',
          ),
        },
        {
          term: b('yₜ', 'yₜ'),
          definition: b(
            'Observed effect outcome, including an explicitly unresolved result.',
            'Resultado observado del efecto, incluido un resultado explícitamente pendiente.',
          ),
        },
        {
          term: b('Aₜ', 'Aₜ'),
          definition: b(
            'Candidate actions admissible under current authority, goal and resource revisions.',
            'Acciones candidatas admisibles según autoridad, objetivo y revisiones actuales.',
          ),
        },
        {
          term: b('Bₜ', 'Bₜ'),
          definition: b(
            'Remaining compute or resource budget available before the declared deadline.',
            'Presupuesto de cómputo o recursos disponible antes del plazo declarado.',
          ),
        },
        {
          term: b('R', 'R'),
          definition: b(
            'Exact state reducer that incorporates a newly received observation.',
            'Reductor exacto que incorpora una observación recién recibida.',
          ),
        },
        {
          term: b('fθ', 'fθ'),
          definition: b(
            'Learned temporal update function evaluated on causal history.',
            'Función aprendida de actualización temporal evaluada sobre historial causal.',
          ),
        },
        {
          term: b('π', 'π'),
          definition: b(
            'Policy selecting an admissible action or computation from the available state.',
            'Política que elige una acción o cómputo admisible desde el estado disponible.',
          ),
        },
        {
          term: b('J(π)', 'J(π)'),
          definition: b(
            'Expected task loss under policy π and its declared cost weights.',
            'Pérdida esperada de la tarea bajo π y sus ponderaciones declaradas.',
          ),
        },
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
          'Choose a concrete task and inspect its inputs. The compound release bundle contains 32 Python modules, 16 JSON configurations, 400 initial CSV records, 18 declared jobs and a release manifest. Clean, corrupt, conflicting and combined conditions alter the actual bytes; findings are computed from those bytes, not looked up from a condition label. A release investigation has nine dependency-ordered stages. Independent checks run when their prerequisites have succeeded, while report assembly waits for every relevant analyzer. Cancelling stops new admissions and retains effects already recorded. Uploaded source is parsed as text and never executed.',
          'Elegir una tarea concreta e inspeccionar sus entradas. La entrega compuesta contiene 32 módulos Python, 16 configuraciones JSON, 400 registros CSV iniciales, 18 tareas declaradas y un manifiesto. Las condiciones válida, dañada, conflictiva y combinada modifican bytes reales; los hallazgos se calculan con esos bytes, no con una etiqueta. La investigación tiene nueve etapas ordenadas por dependencias. Comprobaciones independientes se ejecutan al cumplir prerrequisitos, mientras el informe espera a todos los analizadores. Cancelar detiene nuevas admisiones y conserva efectos registrados. El código enviado se analiza como texto y nunca se ejecuta.',
        ),
        b(
          'Inspect a finding to open the relevant original file, select an execution node to inspect its verified artifact, and download the result bundle to retain inputs, reports and accepted data. The source audit checks Python syntax, strict JSON and TOML; it does not claim to run a repository’s test suite. CSV reconciliation checks shape, identifiers and foreign keys when a matching input table is present. Release verification compares supplied files with declared digests. For controller research, switch to Investigations: select the same case, condition and seed for two methods, then compare their actual outcomes, actions and planner work. Missing evidence remains absent.',
          'Inspeccionar un hallazgo abre el archivo original; seleccionar un nodo muestra su artefacto verificado; descargar conserva entradas, informes y datos aceptados. La auditoría comprueba sintaxis Python, JSON estricto y TOML; no afirma ejecutar las pruebas de un repositorio. La conciliación CSV comprueba estructura, identificadores y claves externas cuando existe una tabla correspondiente. La verificación compara archivos y huellas declaradas. Para investigación, abrir Investigaciones: elegir caso, condición y semilla iguales para dos métodos y comparar resultados, acciones y trabajo del planificador reales. La evidencia ausente permanece ausente.',
        ),
      ],
      equations: [],
      steps: [
        b(
          'Choose a useful task and inspect the selected input files.',
          'Elegir una tarea útil e inspeccionar los archivos seleccionados.',
        ),
        b(
          'Review the task’s declared checks and expected deliverables.',
          'Revisar comprobaciones declaradas y entregables esperados.',
        ),
        b(
          'Execute the task and follow its real dependencies; cancel if needed.',
          'Ejecutar y seguir dependencias reales; cancelar si es necesario.',
        ),
        b(
          'Inspect admission, execution and verified outcome as separate records.',
          'Inspeccionar admisión, ejecución y resultado como registros separados.',
        ),
        b(
          'Download results; use matched investigations to study controller behavior.',
          'Descargar resultados; usar investigaciones emparejadas para estudiar controladores.',
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
      refs: [
        'typesafe2026',
        'typesafeconfidence2026',
        'agarwal2021',
        'angelopoulos2024',
        'neuraxisreport2026',
      ],
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
