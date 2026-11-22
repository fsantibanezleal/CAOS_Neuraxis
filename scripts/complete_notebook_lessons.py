#!/usr/bin/env python3
"""Add the missing method derivations and developer exercises to Neuraxis lessons.

This is deliberately content-first: the blocks below are topic-specific teaching
material, while every plot and computed quantity is regenerated from indexed,
hash-verified product episodes by the notebook kernel.
"""
from __future__ import annotations

import json
import re
from pathlib import Path


LESSONS = {
    "01-fast-event-control": {
        "en": {
            "equations": r"""### Deriving the guarded choice

The finite-state controller first removes actions that violate the observation's authority and freshness conditions. It then applies its declared state-to-action rule to the remaining set. Let $s_t$ be the typed observation at decision $t$, $A(s_t)$ the candidate actions, and $G(s_t,a)$ the conjunction of permission, schema, resource-revision, and task-state guards. The executable choice is

$$
\mathcal{A}_{safe}(s_t)=\{a\in A(s_t):G(s_t,a)=1\},\qquad
a_t=\pi_{FSM}(s_t,\mathcal{A}_{safe}(s_t)).
$$

The first expression is a safety filter; it does not say the surviving action will succeed. The second expression is the finite-state policy that orders admissible operations. If the set is empty, a correct controller abstains or requests a fresh observation rather than inventing an operation. The case verifier checks the effect afterward, so a policy's own status string is not treated as ground truth.

For a document move, let $r_o$ be the revision observed during preview and $r_c$ the current revision at admission. A compare-and-swap guard rejects a stale preview:

$$
G_{rev}(s_t,a)=\mathbb{1}[r_o=r_c]\,\mathbb{1}[destination(a)\in permissions(s_t)].
$$

Here $\mathbb{1}$ is an indicator, revisions are opaque version identifiers rather than elapsed time, and the permission predicate is evaluated by the broker. A safe rejection can leave the task incomplete. Report admission, effect receipt, and final postcondition as separate events.

### Sensitivity: when the input changes

This controller has no fitted numeric threshold to sweep. Its meaningful sensitivity variable is the state presented to the guard: delayed observations, duplicate delivery, a changed resource revision, a missing dependency, and a boundary state. The existing indexed variants perturb those conditions while retaining the C01 task identity. Read the third plot as a designed perturbation analysis: it pairs the verified completion fraction with the empirical controller-time tail for each variant. It is not an estimate of how often stale files occur in production. A flat success curve can conceal different rejection paths, and a low latency tail cannot compensate for an unauthorized effect. To inspect a boundary, open one failed or rejected trace and compare its observation revision, candidate set, selected action, receipt, and verifier result in that order.

### Use the guarded policy with your own data

Build a case adapter that emits the public observation and candidate schema rather than passing arbitrary filesystem paths into a policy. For each candidate, include a stable operation name, typed arguments, and the resource revision used to create the preview. Register allowed roots and effects with the broker before execution. Call the same `make_policy` factory and `run_episode` evaluator used in the lesson, but point the evaluator at a disposable fixture directory. Preserve the raw observation and receipt in the episode record. The postcondition should independently inspect the destination bytes and verify that the source is handled according to the case contract.

Before adapting the method to a real workspace, exercise a changed-revision case between preview and admission. The expected result is refusal followed by a fresh observation, not a forced move. Include duplicate events and a missing destination parent as separate fixtures. Your own-data report should record the case id, method id, exact package version, seed, permission set, revision token, outcome, and elapsed controller time. Never mix these new episodes into the frozen benchmark index; use a separate experiment manifest and hash its source inputs.

For the published-policy comparison, M01 and M02 share the same candidate and authority interface but use different decision organizations: explicit state transitions versus behavior-tree traversal. Compare their action paths and guard outcomes, not only terminal success. The benchmark's repeated seeds are designed executions, not independent samples of real file operations. Identical outcomes therefore establish robustness only to the enumerated variants. A new claim needs unfamiliar state combinations, paired seeds, retained failures, and a predeclared oracle. If the two methods tie on completion, state exactly what the comparison resolves and what remains unidentified.""",
            "extra_sources": ["https://doi.org/10.1016/0167-6423(87)90035-9", "https://doi.org/10.1109/32.60317"],
        },
        "es": {
            "equations": r"""### Derivación de la elección con guardas

El controlador de estados finitos primero elimina las acciones que infringen las condiciones de autoridad y vigencia de la observación. Después aplica su regla declarada a las acciones restantes. Sea $s_t$ la observación tipada en la decisión $t$, $A(s_t)$ las acciones candidatas y $G(s_t,a)$ la conjunción de las guardas de permiso, esquema, revisión del recurso y estado de tarea. La elección ejecutable es

$$
\mathcal{A}_{segura}(s_t)=\{a\in A(s_t):G(s_t,a)=1\},\qquad
a_t=\pi_{FSM}(s_t,\mathcal{A}_{segura}(s_t)).
$$

La primera expresión es un filtro de seguridad; no afirma que la acción restante vaya a tener éxito. La segunda expresa la política de estados finitos que ordena las operaciones admisibles. Si el conjunto queda vacío, el controlador debe abstenerse o pedir una observación nueva en vez de inventar una operación. El verificador del caso comprueba el efecto después; por eso el estado informado por la política no es la verdad de referencia.

Para mover un documento, sea $r_o$ la revisión observada durante la vista previa y $r_c$ la revisión vigente al admitir la acción. Una guarda compare-and-swap rechaza una vista previa obsoleta:

$$
G_{rev}(s_t,a)=\mathbb{1}[r_o=r_c]\,\mathbb{1}[destino(a)\in permisos(s_t)].
$$

$\mathbb{1}$ es un indicador, las revisiones son identificadores opacos de versión y no tiempo transcurrido, y el intermediario evalúa el permiso. Un rechazo seguro puede dejar la tarea incompleta. Informa admisión, recibo del efecto y postcondición final como eventos separados.

### Sensibilidad: cuándo cambia la entrada

Este controlador no tiene un umbral numérico ajustado que barrer. Su variable de sensibilidad es el estado entregado a las guardas: observación retrasada, entrega duplicada, revisión modificada, dependencia ausente y estado límite. El tercer gráfico cruza la fracción de finalización verificada con la cola empírica del tiempo del controlador para cada variante. Es un análisis de perturbaciones diseñadas, no una estimación de la frecuencia de archivos obsoletos en producción. Una curva plana de éxito puede ocultar rutas de rechazo distintas y una cola de latencia baja no compensa un efecto no autorizado. Para inspeccionar un límite, abre un rastro rechazado y compara, en orden, la revisión observada, las candidatas, la acción elegida, el recibo y el resultado del verificador.

### Usa la política con tus propios datos

Construye un adaptador de caso que emita la observación pública y el esquema de candidatas, en vez de entregar rutas arbitrarias del sistema de archivos a la política. Cada candidata debe incluir un nombre estable de operación, argumentos tipados y la revisión del recurso usada para crear la vista previa. Registra raíces y efectos permitidos en el intermediario antes de ejecutar. Usa la misma fábrica pública `make_policy` y el evaluador `run_episode` de la lección, pero apunta a un directorio de pruebas desechable. Conserva la observación original y el recibo en el episodio. La postcondición debe inspeccionar independientemente los bytes del destino y verificar el tratamiento del origen según el contrato.

Antes de adaptar el método a un espacio real, cambia la revisión entre la vista previa y la admisión. El resultado esperado es rechazo seguido de una observación nueva, no un movimiento forzado. Añade duplicados y un directorio padre ausente como pruebas separadas. El informe debe registrar id del caso y del método, versión exacta del paquete, semilla, permisos, token de revisión, resultado y tiempo del controlador. No mezcles episodios nuevos con el índice congelado: usa un manifiesto experimental separado y calcula hashes de sus entradas.

En la comparación publicada, M01 y M02 comparten la interfaz de candidatas y autoridad, pero organizan la decisión de forma distinta: transiciones explícitas frente a recorrido de árbol de comportamiento. Compara rutas de acción y resultados de las guardas, no solo el éxito terminal. Las semillas repetidas del benchmark son ejecuciones diseñadas, no muestras independientes de operaciones reales. Por tanto, los mismos resultados solo acreditan robustez ante las variantes enumeradas. Una afirmación nueva exige combinaciones de estado no vistas, semillas emparejadas, fallos conservados y un oráculo preespecificado. Si ambos métodos empatan en finalización, indica qué resuelve la comparación y qué queda sin identificar.""",
            "extra_sources": ["https://doi.org/10.1016/0167-6423(87)90035-9", "https://doi.org/10.1109/32.60317"],
        },
    },
    "02-learned-action-policies": {
        "en": {
            "equations": r"""### From action scores to an admitted operation

For a learned action scorer, the candidate set is supplied by the environment and the policy estimates a score from a bounded feature vector. Let $x_t$ encode the current typed observation, $A_t$ the offered actions, and $f_\theta(x_t,a)$ the learned score. The policy chooses only among actions that the broker says are admissible:

$$
a_t=\arg\max_{a\in A_t,\;G(s_t,a)=1} f_\theta(x_t,a).
$$

The mask $G$ is not learned. It enforces authority, schema, freshness, and state constraints before any scored action executes. This separation matters because a high score means preference under the training objective, not safety, permission, or a verified effect. If every candidate is masked, the correct behavior is typed abstention. The scorer, the safety filter, and the independent task oracle are three different components and should be measured separately.

When a model produces normalized action probabilities, a temperature $\tau>0$ converts logits $z_a$ into a distribution over admissible actions:

$$
p_\theta(a\mid x_t,A_t)=\frac{\exp(z_a/\tau)}{\sum_{b\in A_t:G(s_t,b)=1}\exp(z_b/\tau)}.
$$

Lower temperature makes the distribution concentrate on its largest logit; higher temperature spreads mass. Neither setting changes the permission mask. The selected retry in C05 must still match the declared response schedule, and the final HTTP predicate must be evaluated from the observed response rather than the predicted class. Agreement with a demonstration is a proxy objective, not operational success.

### Sensitivity: ranking, mask, and data shift

Three changes can alter the result for different reasons. First, changing the feature vector can reorder two close logits even if the candidate set is fixed. Second, changing the admissibility mask can remove the preferred action entirely; the policy must then select among the remaining operations or abstain. Third, a response sequence not represented in training changes the label distribution and can invalidate the learned ranking. The C05 indexed variants test a small, explicit response and timing family, not live service reliability. The third plot pairs verified completion with the controller-time tail across those variants, allowing a reader to see whether a fragile decision coincides with greater computational cost.

For an actual parameter sweep, clone the lesson's disposable response sequence and vary retry delay or transient-failure count while holding the model, feature schema, timeout, and seed fixed. Recompute predictions for every point and evaluate each resulting episode with the independent HTTP postcondition. Do not tune temperature on the held-out test result. Record logit margins and calibration on a disjoint calibration split, since a high-confidence mistake can have a different cost from an uncertain prediction. A demonstration-accuracy gain without a change in validated outcome is not evidence of operational improvement.

### Use the scorer with your own data

Create examples from the public candidate and observation schema. Each row must preserve the candidate list, feature values, teacher action, episode identity, and source split. Keep all events from one task composition in exactly one split; otherwise near-duplicate traces leak across train and test. Build labels only from permitted demonstrations, not from the final oracle outcome, unless the learning protocol explicitly defines an outcome-based target. Fit preprocessing on training data and serialize its parameters alongside the classifier.

Use the product's training entrypoint to fit a new checkpoint in a data-root location outside the repository, then create a manifest with source hashes, package versions, feature order, class map, split ids, and checkpoint digest. Evaluate through the public policy factory and bounded episode runner on a disposable HTTP fixture. The fixture must expose deterministic responses and must not contact an external service. Compare the selected action, admitted action, response receipt, and final postcondition. Add a novel status code or response body as a failure-boundary test. Preserve those new runs in their own index so they cannot silently alter the frozen result table.

M03 and M04 provide a same-case comparison between linear and boosted score functions. Their agreement on a nominal response does not establish equal calibration or transfer. The broader frozen suite and held-out compositions are separate evidence lanes; report their denominators separately. In particular, the current transfer lane favors M04 over M12, which is a reason to study the allocation proposal rather than to hide the comparator. A useful report includes per-family success, decision time, mask violations, and uncertainty at the task-composition level. If this small rerun ties, it teaches how to call the APIs; it does not settle which model is better.""",
            "extra_sources": ["https://proceedings.mlr.press/v15/ross11a.html", "https://arxiv.org/abs/1406.1078"],
        },
        "es": {
            "equations": r"""### De los puntajes a una operación admitida

Un puntuador aprendido recibe las candidatas del entorno y estima un valor a partir de un vector acotado de características. Sea $x_t$ la observación tipada, $A_t$ las acciones ofrecidas y $f_\theta(x_t,a)$ el puntaje aprendido. La política elige únicamente entre acciones que el intermediario declara admisibles:

$$
a_t=\arg\max_{a\in A_t,\;G(s_t,a)=1} f_\theta(x_t,a).
$$

La máscara $G$ no se aprende. Aplica las restricciones de autoridad, esquema, vigencia y estado antes de ejecutar una acción puntuada. Un puntaje alto expresa preferencia según el objetivo de entrenamiento; no significa seguridad, permiso ni efecto verificado. Si todas las candidatas quedan enmascaradas, la respuesta correcta es una abstención tipada. El puntuador, el filtro de seguridad y el oráculo independiente son componentes distintos y deben medirse por separado.

Cuando el modelo entrega probabilidades normalizadas, una temperatura $\tau>0$ transforma los logits $z_a$ en una distribución sobre acciones admisibles:

$$
p_\theta(a\mid x_t,A_t)=\frac{\exp(z_a/\tau)}{\sum_{b\in A_t:G(s_t,b)=1}\exp(z_b/\tau)}.
$$

Una temperatura baja concentra la distribución en el logit mayor; una alta reparte masa. Ningún valor cambia la máscara de permisos. El reintento elegido en C05 debe seguir la secuencia declarada de respuestas HTTP, y el predicado final se evalúa con la respuesta observada, no con la clase predicha. El acuerdo con demostraciones es una función objetivo intermedia, no éxito operativo.

### Sensibilidad: orden, máscara y cambio de datos

Tres cambios pueden alterar el resultado por razones distintas. Cambiar las características puede invertir dos logits cercanos aunque las candidatas sean iguales. Cambiar la máscara puede quitar la acción preferida; la política debe elegir otra operación admisible o abstenerse. Una secuencia de respuestas no presente durante el entrenamiento puede cambiar la distribución de etiquetas e invalidar el ranking aprendido. Las variantes indexadas de C05 prueban una familia pequeña y explícita de respuestas y tiempos, no la fiabilidad de un servicio real. El tercer gráfico cruza la finalización verificada con la cola de tiempo del controlador para cada variante y permite ver si una decisión frágil coincide con mayor coste computacional.

Para un barrido paramétrico real, clona la secuencia desechable y varía el retraso de reintento o la cantidad de fallos transitorios; conserva modelo, esquema, plazo y semilla. Recalcula predicciones en cada punto y evalúa cada episodio con la postcondición HTTP independiente. No ajustes temperatura mirando el resultado reservado para prueba. Registra márgenes entre logits y calibración en una partición separada, porque una equivocación segura y una equivocación confiada pueden tener costes diferentes. Mejorar el acierto frente a demostraciones sin cambiar los resultados verificados no demuestra mejora operativa.

### Usa el puntuador con tus propios datos

Construye ejemplos con el esquema público de observaciones y candidatas. Cada fila conserva lista de acciones, características, acción docente, identidad del episodio y partición de origen. Mantén cada composición de tarea en una sola partición para evitar que rastros casi duplicados filtren información. Forma etiquetas con demostraciones permitidas, no con el resultado final del oráculo, salvo que el protocolo defina explícitamente un objetivo por resultado. Ajusta el preprocesamiento solo con entrenamiento y serializa sus parámetros junto al clasificador.

Usa el punto de entrada de entrenamiento del producto para generar el checkpoint en una ubicación de datos externa al repositorio. Crea un manifiesto con hashes de origen, versiones, orden de características, mapa de clases, ids de partición y digest del checkpoint. Evalúa con la fábrica pública y el ejecutor acotado sobre una respuesta HTTP desechable y determinista, sin contactar servicios externos. Compara acción elegida, acción admitida, recibo y postcondición. Incorpora un código de estado o cuerpo nuevo como caso límite. Guarda las ejecuciones en un índice aparte para que no modifiquen los resultados congelados.

M03 y M04 permiten comparar funciones lineales y potenciadas sobre el mismo caso. Coincidir ante una respuesta nominal no demuestra igual calibración ni transferencia. La suite congelada y las composiciones reservadas son carriles de evidencia distintos; informa sus denominadores por separado. El carril de transferencia actual favorece M04 sobre M12: es una razón para estudiar la propuesta de asignación, no para ocultar el comparador. Un análisis útil incluye éxito por familia, tiempo de decisión, infracciones de máscara e incertidumbre por composición. Si esta repetición pequeña empata, enseña a usar las API; no determina cuál modelo es mejor.""",
            "extra_sources": ["https://proceedings.mlr.press/v15/ross11a.html", "https://arxiv.org/abs/1406.1078"],
        },
    },
    "03-sequential-control": {
        "en": {
            "equations": r"""### Event-time model for cancellation

Cancellation is a sequential decision because the job state can change between observation and effect. Let $T_c$ be the time the controller requests cancellation, $T_j$ the time the job naturally terminates, and $T_o$ the time a terminal state is observed. A cancellation task succeeds only when the case-specific postcondition is true; the request itself is not the outcome. The observable race can be represented as

$$
Y_{stop}=\mathbb{1}[T_c<T_j]\,\mathbb{1}[\text{terminal state confirms stopped}],\qquad
L_{decision}=T_{action}-T_{observation}.
$$

The first quantity is a verified task condition, while the second is controller decision latency. They have different units and answer different questions. A task may complete naturally before cancellation, making a generic terminal-state check look successful even though the requested cancellation did not occur. C07 therefore requires the cancellation-specific oracle and event order.

For a recurrent policy, the hidden state summarizes earlier observations. In the simplest gated recurrent unit, update gate $z_t$, reset gate $r_t$, candidate state $\tilde h_t$, and hidden state $h_t$ are

$$
z_t=\sigma(W_zx_t+U_zh_{t-1}),\quad r_t=\sigma(W_rx_t+U_rh_{t-1}),\quad
h_t=(1-z_t)\odot h_{t-1}+z_t\odot\tanh(W_hx_t+U_h(r_t\odot h_{t-1})).
$$

The state is episode-local and is reset between independent runs. Memory is useful only when event history contains information absent from the current observation; otherwise it adds cost and a new failure surface without improving the decision.

### Sensitivity: event ordering and observation delay

The main stress variable is the gap between cancellation admission and the next job-state transition. A delayed observation can make the controller act on a state that is already obsolete; a delayed effect can allow natural completion to win the race. The indexed C07 variants vary the event schedule and retain every seed, so the per-variant rates expose a boundary that a pooled mean would conceal. The added sensitivity plot places completion next to the p95 controller decision time. It does not show the job's full runtime. Inspect the event sequence for each failed variant and identify whether the cancellation request was absent, rejected, accepted too late, or accepted without a confirming terminal observation.

A useful controlled sweep changes one timing factor at a time: polling interval, observation delay, or job completion time. Keep the other two fixed and repeat paired seeds. Report both the fraction satisfying the cancellation oracle and the distribution of decision latency. If an implementation labels natural completion as cancellation success, the experiment is invalid even if its aggregate success increases. Treat timeout as censoring or failure according to a rule written before execution, never as an omitted row.

### Use sequential control with your own data

Represent a job with a stable identity, monotonic event sequence, current lifecycle state, and an explicit cancellation capability. Deliver events through the public observation contract and make every action pass the same permission and freshness broker. The task adapter should distinguish `cancel_requested`, `cancel_accepted`, `process_stopped`, and `completed_normally`; collapsing them into a single Boolean removes the race the policy is supposed to handle.

Run the public policy through `run_episode` against a disposable child process that emits a deterministic sequence of progress and termination events. The independent verifier should inspect the process handle and confirm the requested terminal condition. Include cases where the child exits just before the request, just after it, and while a poll is outstanding. Record timestamps from one monotonic clock, cancellation receipts, observations, and terminal evidence. Reset recurrent state at the start of each episode and verify that no hidden state leaks between jobs.

For comparison, align the observation schedule, cancellation authority, timeout, and oracle across M05/M07 or another declared pair. Report the method's success and latency separately. The current M12 failures are concentrated in C07 variants, while M01 solves the frozen core matrix; this means the result supports a concrete limitation, not a claim that recurrence is generally ineffective. A stronger experiment needs event schedules where current state alone is insufficient, genuinely varied histories, and held-out timing combinations. Keep test schedules sealed until the controller and stopping rule are fixed.""",
            "extra_sources": ["https://doi.org/10.1038/nature12742", "https://doi.org/10.1109/TPAMI.2014.2321376"],
        },
        "es": {
            "equations": r"""### Modelo temporal de la cancelación

La cancelación es una decisión secuencial porque el trabajo puede cambiar entre la observación y el efecto. Sea $T_c$ el instante en que el controlador solicita cancelar, $T_j$ el instante de término natural y $T_o$ el instante en que se observa un estado terminal. La tarea solo tiene éxito si se cumple la postcondición específica del caso; la solicitud no es el resultado. La carrera observable puede expresarse como

$$
Y_{detenido}=\mathbb{1}[T_c<T_j]\,\mathbb{1}[\text{estado terminal confirma detención}],\qquad
L_{decisión}=T_{acción}-T_{observación}.
$$

La primera cantidad es una condición de tarea verificada y la segunda es latencia de decisión. Tienen unidades y significados distintos. Una tarea puede terminar naturalmente antes de la cancelación, haciendo que un chequeo terminal genérico parezca exitoso aunque la cancelación solicitada no haya ocurrido. Por eso C07 requiere un oráculo específico y orden temporal de eventos.

En una política recurrente, el estado oculto resume observaciones anteriores. En una unidad GRU, la compuerta de actualización $z_t$, la de reinicio $r_t$, el estado candidato $\tilde h_t$ y el estado $h_t$ siguen

$$
z_t=\sigma(W_zx_t+U_zh_{t-1}),\quad r_t=\sigma(W_rx_t+U_rh_{t-1}),\quad
h_t=(1-z_t)\odot h_{t-1}+z_t\odot\tanh(W_hx_t+U_h(r_t\odot h_{t-1})).
$$

El estado es local al episodio y se reinicia entre ejecuciones independientes. La memoria ayuda solo cuando el historial contiene información ausente de la observación actual; de otro modo añade coste y otra superficie de fallo.

### Sensibilidad: orden de eventos y retraso de observación

La principal variable de estrés es la distancia entre la admisión de la cancelación y la siguiente transición del trabajo. Una observación retrasada puede hacer que el controlador actúe sobre un estado obsoleto; un efecto retrasado permite que gane el término natural. Las variantes indexadas de C07 modifican el calendario de eventos y conservan todas las semillas, de modo que sus tasas muestran límites que un promedio conjunto ocultaría. El gráfico nuevo cruza la finalización con el percentil 95 del tiempo de decisión del controlador; no muestra la duración completa del trabajo. Inspecciona cada variante fallida y determina si faltó la solicitud, fue rechazada, llegó tarde o se aceptó sin confirmar el estado terminal.

Un barrido controlado cambia un solo factor temporal: intervalo de consulta, retraso de observación o tiempo de término. Conserva los otros dos y repite semillas emparejadas. Informa la fracción que satisface el oráculo de cancelación y la distribución de latencia. Si la implementación etiqueta término natural como cancelación exitosa, el experimento es inválido aunque aumente el éxito agregado. Trata un vencimiento como censura o fallo según una regla escrita antes de ejecutar, nunca como una fila omitida.

### Usa el control secuencial con tus propios datos

Representa cada trabajo con identidad estable, secuencia monótona de eventos, estado de ciclo de vida y capacidad explícita de cancelación. Entrega eventos mediante el contrato público de observación y exige que toda acción pase por el mismo intermediario de permisos y vigencia. El adaptador debe distinguir `cancel_requested`, `cancel_accepted`, `process_stopped` y `completed_normally`; reducirlos a un Booleano borra justamente la carrera que debe resolver la política.

Ejecuta la política pública mediante `run_episode` ante un proceso hijo desechable que emita una secuencia determinista de progreso y término. El verificador independiente inspecciona el identificador del proceso y confirma la condición terminal requerida. Incluye casos donde el hijo termina justo antes de la solicitud, justo después y mientras hay una consulta pendiente. Registra tiempos de un reloj monótono, recibos de cancelación, observaciones y prueba terminal. Reinicia el estado recurrente por episodio y comprueba que no se filtre entre trabajos.

Para comparar, alinea calendario de observación, autoridad de cancelación, plazo y oráculo entre M05/M07 u otro par declarado. Informa éxito y latencia por separado. Los fallos actuales de M12 se concentran en variantes C07, mientras M01 resuelve la matriz congelada; la evidencia muestra una limitación concreta, no que la recurrencia sea inútil en general. Un experimento más fuerte necesita calendarios donde el estado actual no baste, historiales realmente variados y combinaciones temporales reservadas. Mantén ocultos los calendarios de prueba hasta fijar política y regla de detención.""",
            "extra_sources": ["https://doi.org/10.1038/nature12742", "https://doi.org/10.1109/TPAMI.2014.2321376"],
        },
    },
    "04-deliberation-allocation": {
        "en": {
            "equations": r"""### Decision rule for bounded delegation

The allocation problem compares a fast action with a slower proposal. Let $U_f$ be the expected utility of acting immediately, $U_d$ the expected utility after requesting deliberation, $C_d$ the cost of the request, and $D$ the deadline penalty. Deferral is justified only when its expected incremental value is positive under the declared budget:

$$
\Delta U=\mathbb{E}[U_d-U_f\mid x_t]-C_d-D,\qquad defer\;\Leftrightarrow\;\Delta U>0.
$$

The expectation must be learned or calibrated on training data and the threshold chosen on a separate calibration split. It cannot be estimated by relabeling test outcomes after observing them. A timeout, malformed response, stale proposal, or proposal that is never used contributes its actual cost and no benefit. A syntactically valid LLM output is only a candidate; the normal candidate schema and effect broker remain authoritative.

When the gate estimates the probability $q(x_t)$ that deliberation changes a verified outcome by benefit $B$, and uses a fixed request cost $C$, a simple threshold form is

$$
defer\;\Leftrightarrow\;q(x_t)B>C,\qquad q(x_t)=\sigma(w^\top x_t+b).
$$

This rule assumes a stable estimate of benefit and cost. If the observed gate threshold is 1.01 on a probability scale, the gate never defers; that is a fitted negative finding, not evidence of a useful learned allocation policy. M12 also includes persistent resource and outcome state, so it should not be reduced to the gate alone.

### Sensitivity: planner delay, failure, and threshold

The allocation result depends on at least three quantities: how often a proposal changes a verified action, how long the request delays the task, and whether the proposal remains valid when it returns. Change them independently. The C13 variants provide an explicit deadline and planner-response stress family, but the fixed benchmark does not show a general advantage for deferral. The third plot reads success and decision-time tails together; it cannot establish causal value because each indexed trace is a designed episode and the learned threshold was selected from a very small training sample.

For a sensitivity study, pre-register threshold values and planner-delay levels, then execute paired cases with the same initial state and tool permissions. Count the request, response, validation, admission, effect, deadline status, and final oracle separately. Include no-response, malformed-response, stale-resource, and useful-response conditions with balanced representation. Plot net utility and verified task success; do not optimize the threshold against the final test lane. A deployment policy should also have a hard budget and cancellation path so a slow reasoner cannot block urgent or safety-critical control.

### Use bounded delegation with your own data

Implement a planner adapter that accepts only the current bounded observation, a finite candidate list, a deadline, and a token or compute budget. The adapter returns a typed candidate plus provenance, elapsed time, and completion status. It receives no ambient credentials and cannot invoke arbitrary tools. The controller revalidates the resource revision and permission immediately before admission. If the proposal is late or stale, record it as unused and continue through the declared fast policy.

Use a deterministic local planner stub first to exercise timeout, malformed JSON, invalid action, and late response paths. Then, if evaluating a real model is part of the study, record the exact model revision, prompt template, decoding settings, hardware, and request logs with secrets removed. Compare the delegated policy against both the fast controller and fixed delegation using paired task instances. Keep model-call cost, task latency, successful outcomes, and safe refusals as distinct outcomes. The current negative result remains intact until an adequately powered, novel task-family study demonstrates a counterexample.

The level-3 comparison should include the fixed asynchronous method and learned gate, not merely a planner transcript. All methods need the same candidate set, deadline, and independent postcondition. If the gate chooses never to defer, do not hide that behavior behind an illustrative successful response. Report the gate's training positives, calibration partition, threshold, and the held-out result. For C13, the question is whether spending computation changes a consequential outcome enough to pay for its delay; a call count by itself is not value.""",
            "extra_sources": ["https://doi.org/10.1016/j.neuron.2013.11.028", "https://doi.org/10.1016/j.neuron.2014.10.039"],
        },
        "es": {
            "equations": r"""### Regla de decisión para delegación acotada

La asignación compara una acción rápida con una propuesta más lenta. Sea $U_f$ la utilidad esperada de actuar de inmediato, $U_d$ la utilidad tras deliberar, $C_d$ el coste de la solicitud y $D$ la penalización por plazo. Solo se justifica diferir si el valor incremental esperado es positivo dentro del presupuesto declarado:

$$
\Delta U=\mathbb{E}[U_d-U_f\mid x_t]-C_d-D,\qquad diferir\;\Leftrightarrow\;\Delta U>0.
$$

La expectativa debe aprenderse o calibrarse con datos de entrenamiento y el umbral elegirse en otra partición. No puede estimarse cambiando etiquetas de prueba después de observar resultados. Un vencimiento, respuesta malformada, propuesta obsoleta o propuesta sin uso aporta su coste real y ningún beneficio. Una salida LLM sintácticamente válida es solo candidata; el esquema de acciones y el intermediario de efectos conservan autoridad.

Si la compuerta estima la probabilidad $q(x_t)$ de que deliberar cambie un resultado verificado en un beneficio $B$, con coste fijo $C$, una forma sencilla es

$$
diferir\;\Leftrightarrow\;q(x_t)B>C,\qquad q(x_t)=\sigma(w^\top x_t+b).
$$

La regla presupone estimaciones estables de beneficio y coste. Si el umbral ajustado es 1.01 en escala de probabilidad, la compuerta nunca difiere; es un resultado negativo ajustado, no evidencia de una política útil. M12 también incorpora estado persistente de recursos y resultados, por lo que no debe reducirse solo a la compuerta.

### Sensibilidad: demora, fallo y umbral del planificador

La asignación depende al menos de tres cantidades: cuántas veces la propuesta cambia una acción verificada, cuánto retrasa la solicitud y si aún es válida al regresar. Cámbialas de forma independiente. Las variantes C13 constituyen una familia explícita de plazos y respuestas, pero el benchmark fijo no demuestra una ventaja general de diferir. El tercer gráfico muestra éxito y colas de decisión juntas; no identifica valor causal porque los rastros son episodios diseñados y el umbral se eligió con una muestra de entrenamiento pequeña.

Preespecifica valores de umbral y demora del planificador; ejecuta casos emparejados con igual estado inicial y permisos. Cuenta por separado solicitud, respuesta, validación, admisión, efecto, plazo y oráculo final. Incluye ausencia de respuesta, respuesta malformada, recurso obsoleto y respuesta útil con representación equilibrada. Grafica utilidad neta y éxito verificado; no optimices contra la partición de prueba final. Una política desplegada también necesita presupuesto rígido y cancelación para que el razonador no bloquee el control urgente o sensible a seguridad.

### Usa delegación acotada con tus propios datos

Implementa un adaptador que reciba solo la observación acotada, una lista finita de candidatas, plazo y presupuesto de cómputo. Devuelve una candidata tipada, procedencia, tiempo y estado de término. No recibe credenciales ambientales ni invoca herramientas arbitrarias. Antes de admitirla, el controlador vuelve a comprobar revisión y permiso. Si la propuesta llega tarde o está obsoleta, se registra como no utilizada y continúa la política rápida declarada.

Primero usa un planificador local determinista para ejercitar vencimiento, JSON malformado, acción inválida y respuesta tardía. Si el estudio evalúa un modelo real, registra revisión exacta, plantilla de prompt, decodificación, hardware y solicitudes sin secretos. Compara contra control rápido y delegación fija con tareas emparejadas. Mantén separados coste de llamada, latencia de tarea, resultados exitosos y rechazos seguros. El resultado negativo actual permanece hasta que un estudio con potencia y familias novedosas demuestre lo contrario.

La comparación de nivel 3 incluye delegación asíncrona fija y compuerta aprendida, no solo una transcripción del planificador. Todos reciben las mismas candidatas, plazo y postcondición. Si la compuerta nunca difiere, no ocultes ese comportamiento tras una respuesta ilustrativa exitosa. Informa positivos de entrenamiento, partición de calibración, umbral y resultado reservado. Para C13, la pregunta es si el cómputo adicional cambia un resultado importante lo suficiente como para pagar su demora; contar llamadas no mide valor.""",
            "extra_sources": ["https://doi.org/10.1016/j.neuron.2013.11.028", "https://doi.org/10.1016/j.neuron.2014.10.039"],
        },
    },
    "05-evaluation-and-transfer": {
        "en": {
            "equations": r"""### Estimand and denominator

The benchmark estimates success over a finite, designed matrix, not over all software operations. For method $m$, let $y_{m,i}$ be the independently verified postcondition for attempted episode $i$ and let $N_m$ include every attempted episode, including failures, timeouts, and abstentions:

        $$
        \hat p_m=\frac{1}{N_m}\sum_{i=1}^{N_m}y_{m,i}.
        $$

        $$
        \widehat{\Delta}_{A,B}=\frac{1}{N}\sum_{i=1}^{N}(y_{A,i}-y_{B,i}).
        $$

The first fraction is a descriptive completion rate for the indexed suite. The second is a paired difference only when both methods ran on the same task, variant, and seed. Neither expression turns repeated deterministic outcomes into independent evidence. Report the number of distinct task families and seed-variable cells beside the episode denominator.

The split boundary is part of the estimand. Core episodes answer how methods compare on the frozen twenty-family matrix. Transfer episodes use held-out compositions and answer a different question. Do not pool them: a larger combined denominator would change the task distribution and obscure transfer performance. For uncertainty, a bootstrap over environment-seed clusters describes variation under those clusters; it does not create more independent families than were designed.

### Sensitivity: matrix composition and seed variation

A saturated suite can rank methods on latency or violations while providing no success-rate discrimination. The adequacy audit found five methods solve all 1,200 core episodes, while the proposed controller solves 1,160; outcomes are identical across nominal seeds for most method-case-variant cells. Therefore a conventional episode-level interval can be misleadingly narrow. The third plot preserves per-variant denominators and puts decision cost beside outcome; it is a diagnostic slice, not a replacement for the full matrix.

Test adequacy by leaving out complete task families, not randomly splitting episodes from the same template. Count cells whose outcome changes across seeds and identify where randomness enters the environment. Then construct new cases with a known failure surface: ambiguous state, delayed tool behavior, resource mutation during a pending proposal, and a useful-versus-costly deliberation choice. Pre-register what observation would count as a win, retain all failures, and use new family identifiers for held-out evaluation. A controller that wins only after thresholds are tuned on those outcomes has not passed a fair test.

### Evaluate your own data without leakage

Create an immutable experiment manifest before running: method versions, data and code digests, environment configuration, seeds, split assignments, oracle definitions, metrics, and exclusion policy. Assign whole task compositions to train, calibration, and test. If a case template contributes several variants, keep those variants in one split unless the protocol explicitly studies variant transfer. Ensure all compared methods receive the same observation budget, action permissions, deadline, and hardware limits.

Compute each outcome from an independent postcondition, not a policy label. Store raw episodes separately from aggregates; validate identities, byte hashes, matrix completeness, and lineage before calculating tables. Report both numerator and denominator, median and tail latency, safe refusal, unauthorized-effect count, and missing evidence. For paired comparisons, align exact episode keys and show the distribution of within-pair differences. If seeds do not vary a cell, state that plainly rather than presenting a nominal seed count as replicated stochastic evidence.

In the current results, M01 completes 1,200/1,200 core episodes and M12 completes 1,160/1,200. The transfer lane has only 24 held-out episodes per method and favors M04 over M12. These are specific observed findings; neither establishes broad software reliability. A meaningful extension should increase task diversity and vary the conditions that caused the observed cancellation failures, while preserving the frozen suite as a historical reference.""",
            "extra_sources": ["https://doi.org/10.1080/01621459.1997.10474074", "https://doi.org/10.1111/1467-9868.00297"],
        },
        "es": {
            "equations": r"""### Estimando y denominador

El benchmark estima éxito en una matriz finita diseñada, no en todas las operaciones de software. Para el método $m$, sea $y_{m,i}$ la postcondición verificada independientemente del episodio intentado $i$, y sea $N_m$ el total de intentos, incluidos fallos, vencimientos y abstenciones:

$$
\hat p_m=\frac{1}{N_m}\sum_{i=1}^{N_m}y_{m,i},\qquad
\widehat{\Delta}_{A,B}=\frac{1}{N}\sum_{i=1}^{N}(y_{A,i}-y_{B,i}).
$$

La primera fracción es una tasa descriptiva para la suite indexada. La segunda es diferencia emparejada solo si ambos métodos ejecutaron la misma tarea, variante y semilla. Ninguna expresión convierte resultados deterministas repetidos en evidencia independiente. Informa familias distintas y celdas cuyo resultado varía entre semillas junto al denominador de episodios.

La separación de datos forma parte del estimando. Los episodios centrales responden cómo se comparan los métodos en veinte familias congeladas. Los episodios de transferencia usan composiciones reservadas y contestan otra pregunta. No los combines: el denominador mayor cambiaría la distribución de tareas y ocultaría la transferencia. Un bootstrap por grupos de entorno y semilla describe variación en esos grupos; no crea más familias independientes que las diseñadas.

### Sensibilidad: composición y variación por semilla

Una suite saturada puede distinguir latencia o infracciones, pero no tasas de éxito. La auditoría encontró cinco métodos que resuelven 1.200 episodios, mientras la propuesta resuelve 1.160; la mayoría de las celdas método-caso-variante repite resultados entre semillas. Por eso un intervalo calculado como si todos los episodios fueran muestras independientes puede ser engañosamente estrecho. El tercer gráfico conserva denominadores por variante y muestra coste de decisión junto al resultado; es un diagnóstico, no reemplaza la matriz completa.

Evalúa la adecuación dejando familias completas fuera, no repartiendo episodios del mismo molde al azar. Cuenta celdas cuyo resultado cambia entre semillas e identifica dónde entra aleatoriedad. Diseña casos nuevos con límites conocidos: estado ambiguo, herramienta retrasada, mutación del recurso durante una propuesta pendiente y una decisión entre deliberación útil y costosa. Preespecifica el criterio de éxito, conserva fallos y reserva ids de familia para evaluación. Ganar solo después de ajustar umbrales contra esos resultados no supera una prueba justa.

### Evalúa tus propios datos sin filtraciones

Antes de ejecutar crea un manifiesto inmutable con versiones de método, hashes de datos y código, entorno, semillas, particiones, oráculos, métricas y exclusiones. Asigna composiciones completas a entrenamiento, calibración y prueba. Si una plantilla produce variantes, mantenlas juntas salvo que el protocolo estudie explícitamente transferencia de variantes. Los métodos comparados deben recibir iguales observaciones, permisos, plazo y límites de hardware.

Calcula cada resultado mediante una postcondición independiente, no con una etiqueta de política. Guarda episodios crudos separados de agregados; valida identidad, hashes de bytes, matriz completa y procedencia antes de calcular tablas. Informa numerador y denominador, mediana y cola de latencia, rechazo seguro, efectos no autorizados y evidencia faltante. En comparaciones emparejadas, alinea claves exactas y muestra diferencias dentro de cada pareja. Si las semillas no cambian una celda, dilo; no presentes el número nominal de semillas como replicación estocástica.

En los resultados actuales, M01 completa 1.200/1.200 episodios centrales y M12 1.160/1.200. La transferencia tiene solo 24 episodios reservados por método y favorece a M04 sobre M12. Son hallazgos concretos, no garantías amplias sobre software. Una extensión útil aumenta diversidad de tareas y altera las condiciones vinculadas a los fallos de cancelación, manteniendo la suite congelada como referencia histórica.""",
            "extra_sources": ["https://doi.org/10.1080/01621459.1997.10474074", "https://doi.org/10.1111/1467-9868.00297"],
        },
    },
    "06-ablation-and-export-parity": {
        "en": {
            "equations": r"""### Ablation and numerical export answer different questions

An ablation estimates the effect of removing component $k$ under a controlled paired protocol. Let $Y_F(i)$ be full-system outcome on episode $i$ and $Y_{-k}(i)$ the outcome with only component $k$ removed. The paired effect is

$$
\hat\delta_k=\frac{1}{N}\sum_{i=1}^{N}(Y_F(i)-Y_{-k}(i)).
$$

If this value is zero on a suite where almost all outcomes are already successes, it means the benchmark did not identify a success contribution. It does not prove that component $k$ is useless in every environment. The ablated system must keep all other code, data, seeds, budgets, and evaluation rules fixed; otherwise the contrast is confounded.

Native export parity instead measures numeric agreement of an exported scorer with its source model. For reference output $f(x)$ and exported output $\tilde f(x)$ over declared domain $\mathcal{X}$, a basic error measure is

$$
E_{max}=\max_{x\in\mathcal{X}}\lvert f(x)-\tilde f(x)\rvert,\qquad
E_{rel}(x)=\frac{\lvert f(x)-\tilde f(x)\rvert}{\max(\epsilon,\lvert f(x)\rvert)}.
$$

Passing a numeric tolerance validates only the tested input domain and arithmetic path. It does not establish calibration, safe action admission, correct receipts, or task success. Keep parity vectors, whole-episode outcomes, and authority checks as separate evidence.

### Sensitivity: component interactions and input domain

The frozen ablations remove memory, effects, deferral, or invalidation one at a time. Their identical task-success outcomes on the current suite show no measured marginal success difference, but saturation can mask a contribution. A more informative design adds paired tasks where a component's predicted role is necessary: resource revision changes while a planner is pending for invalidation; event history is required for memory; a proposal arrives before versus after a deadline for deferral. Factorial combinations can reveal interactions that one-at-a-time ablations miss.

For export parity, sensitivity means extending $\mathcal{X}$ to boundary feature values, sparse vectors, extreme but valid magnitudes, and inputs near class-score ties. Compare both maximum absolute error and the selected action after applying the same admissibility mask. Test malformed shape and non-finite values as rejection cases, not as numeric samples. The third plot diagnoses outcome and decision-time changes across the selected C07 or C13 variants; it is distinct from the numerical parity report and must not be described as validating the native export.

### Use ablation and export with your own data

Choose an intervention before execution and identify one component that changes. Clone every task instance with the same initial state and seed, run the full and ablated implementation, and calculate paired outcome differences from independent oracles. Preserve action receipts and verify that only the declared component differs. Repeat on cases where the component should matter and cases where it should not; a global average can cancel opposite effects.

For native parity, export the trained model through the product's supported converter and compare it against the Python reference over a versioned test-vector file. Record feature schema, compiler/runtime versions, architecture, tolerance, and artifact hashes. Include representative production-domain vectors only when their provenance and license permit; otherwise label the vectors synthetic and make no real-data accuracy claim. Finally run both implementations through identical policy masks on a disposable environment, since a scorer-level match does not prove that native admission and effect handling are equivalent.

The current four ablations match M12's task success exactly, and the learned gate chooses never to defer. Those facts are central negative results. Do not edit the frozen episode records to make a component appear useful. A next experiment should introduce a valid counterfactual workload, preregister its expected mechanism, and preserve a comparison against the M01 guard and M04 learned policy.""",
            "extra_sources": ["https://onnxruntime.ai/docs/tutorials/tf-get-started.html", "https://doi.org/10.48550/arXiv.2101.00001"],
        },
        "es": {
            "equations": r"""### La ablación y la paridad numérica responden preguntas distintas

Una ablación estima el efecto de retirar el componente $k$ bajo un protocolo emparejado. Sea $Y_F(i)$ el resultado del sistema completo en el episodio $i$ y $Y_{-k}(i)$ el resultado al retirar solo $k$. El efecto emparejado es

$$
\hat\delta_k=\frac{1}{N}\sum_{i=1}^{N}(Y_F(i)-Y_{-k}(i)).
$$

Si vale cero en una suite donde casi todos los resultados son éxitos, significa que el benchmark no identificó una contribución al éxito. No demuestra que el componente sea inútil en cualquier entorno. La ablación debe conservar código restante, datos, semillas, presupuestos y reglas; de otro modo, el contraste tiene factores de confusión.

La paridad de exportación mide en cambio el acuerdo numérico entre un puntuador exportado y su modelo fuente. Para la salida de referencia $f(x)$ y la exportada $\tilde f(x)$ en el dominio declarado $\mathcal{X}$, un error básico es

$$
E_{max}=\max_{x\in\mathcal{X}}\lvert f(x)-\tilde f(x)\rvert,\qquad
E_{rel}(x)=\frac{\lvert f(x)-\tilde f(x)\rvert}{\max(\epsilon,\lvert f(x)\rvert)}.
$$

Cumplir una tolerancia numérica valida solo el dominio probado y la ruta aritmética. No demuestra calibración, admisión segura, recibos correctos ni éxito de tarea. Conserva vectores de paridad, resultados de episodios completos y permisos como evidencias separadas.

### Sensibilidad: interacciones y dominio de entrada

Las ablaciones congeladas quitan memoria, efectos, diferimiento o invalidación, una a la vez. Que tengan igual éxito en la suite actual no muestra diferencia marginal medida, pero la saturación puede ocultar contribuciones. Un diseño informativo añade tareas emparejadas donde se necesita el mecanismo predicho: cambia una revisión mientras espera el planificador para probar invalidación; requiere historial para memoria; devuelve una propuesta antes o después del plazo para diferimiento. Un diseño factorial detecta interacciones que una ablación aislada no ve.

Para la paridad, sensibilidad significa ampliar $\mathcal{X}$ a límites, vectores dispersos, magnitudes válidas extremas y entradas cercanas a empates de puntajes. Compara error absoluto máximo y acción elegida tras aplicar la misma máscara de admisión. Forma mal hecha y valores no finitos deben rechazarse, no contarse como muestras numéricas. El tercer gráfico diagnostica cambio de resultado y decisión entre variantes C07 o C13; es distinto del informe de paridad y no valida la exportación nativa.

### Usa ablación y exportación con tus propios datos

Define la intervención antes de ejecutar e identifica el único componente modificado. Clona cada instancia con mismo estado inicial y semilla, ejecuta versión completa y ablacionada, y calcula diferencias emparejadas con oráculos independientes. Conserva recibos y comprueba que solo cambió el componente declarado. Repite en casos donde debería importar y donde no; un promedio global puede cancelar efectos opuestos.

Para paridad nativa, exporta mediante el conversor compatible y compara contra Python con un archivo versionado de vectores. Registra esquema de características, versiones de compilador y runtime, arquitectura, tolerancia y hashes. Incluye vectores de producción solo cuando procedencia y licencia lo permitan; en caso contrario, rotúlalos como sintéticos y no afirmes precisión con datos reales. Finalmente ejecuta ambas versiones con máscaras idénticas en un entorno desechable: coincidir como puntuador no demuestra equivalencia en admisión ni efectos.

Las cuatro ablaciones actuales coinciden exactamente con el éxito de M12 y la compuerta aprendida nunca difiere. Son resultados negativos centrales. No edites episodios congelados para aparentar utilidad. El siguiente experimento requiere una carga contrafactual válida, mecanismo preinscrito y comparación con la guarda M01 y el puntuador M04.""",
            "extra_sources": ["https://onnxruntime.ai/docs/tutorials/tf-get-started.html", "https://doi.org/10.48550/arXiv.2101.00001"],
        },
    },
}


def _source(cell: dict) -> str:
    value = cell.get("source", "")
    return "".join(value) if isinstance(value, list) else value


METACONTROL_L4 = {
    "en": r"""### Utility and resource versioning

M12 proposes that a controller should reason about the outcome and the cost of computation while preserving the version of the resource on which a proposal depends. Let $v_t$ identify that resource version, $a_f$ be the fast action, $a_d$ a deferred proposal, and $J(a,v)$ the independently evaluated task value. A pending proposal is usable only when its basis still matches the live resource:

$$
valid(a_d,t)=\mathbb{1}[v_{proposal}=v_t]\,\mathbb{1}[G(s_t,a_d)=1].
$$

The controller's allocation choice can be expressed as expected marginal value after delay and compute cost:

$$
\Delta_t=\mathbb{E}[J(a_d,v_t)-J(a_f,v_t)\mid h_t]-\lambda_c C_d-\lambda_t T_d,
\qquad defer_t\Leftrightarrow(valid=1\land\Delta_t>0).
$$

Here $h_t$ is the retained event and outcome history, $C_d$ compute expenditure, $T_d$ added delay, and the two $\lambda$ values convert them into the task's declared utility units. The frozen results do not establish these quantities as well calibrated: the fitted gate had only seven positive labels among 228 states and selected threshold 1.01, equivalent to never deferring. Thus the equation is the proposal's decision principle, not a claim that its current learned estimate is useful.

### Sensitivity and failure boundary

The proposal should be stressed where its components can matter: mutate a resource after a request but before its answer; vary planner delay around the task deadline; inject a valid answer, a malformed answer, and no answer; and vary whether event history is needed to distinguish two otherwise identical observations. Cross these factors factorially so invalidation, memory, and allocation can be separated. The existing frozen task matrix is saturated for success, M12 fails 40 C07 episodes, and the four ablations match its task success. Those findings are retained rather than repaired by changing old records.

An informative follow-up must preserve paired initial states and the same action authority, then measure stale-proposal rejection, verified task completion, additional decision time, and resource cost. A claimed win requires both a changed outcome on cases where deliberation is useful and no unauthorized or stale effect. Report uncertainty clustered by new task composition; repeated seeds of an unchanged fixture cannot substitute for independent case families. A safety improvement with no task completion improvement may still be meaningful, but only if that safety endpoint was specified before evaluating the controller.

### Use resource-versioned metacontrol with your own data

Represent the resource basis as an opaque revision token returned by the provider, not as a wall-clock timestamp guessed by the controller. Each request carries the token, the bounded candidate set, a deadline, and a unique operation id. On response, compare the original token with the current provider revision, validate the candidate against the live permission set, and record whether the response was accepted, rejected, or unused. Never let the model's free text authorize an effect.

Use a deterministic local planner and mutable fixture to reproduce all four cases: on-time valid proposal, late proposal, malformed candidate, and resource revision change during the wait. Add a fast-path action that can finish safely while deliberation is outstanding, then verify cancellation and cleanup of the pending task. Capture the event history and compute the postcondition independently. Keep the old frozen matrix immutable; write new episodes to a new experiment directory with a separate index and hashes. Include an explicit utility scale and explain how delay and compute cost are converted before fitting an allocation threshold.

Comparison with fixed delegation and M01 must use the same budget and deadline. Report the M12 1,160/1,200 core result next to M01's 1,200/1,200, the never-defer gate, and unchanged ablations. A proposed method is not validated by being implemented or by matching its own replay. The next test should be designed to make the hypothesis falsifiable and to give all policies a genuine opportunity to help or fail.""",
    "es": r"""### Utilidad y versionado de recursos

M12 propone que el controlador razone sobre resultados y coste de cómputo sin perder la versión del recurso que sustenta una propuesta. Sea $v_t$ la versión, $a_f$ la acción rápida, $a_d$ la propuesta diferida y $J(a,v)$ el valor de tarea evaluado independientemente. Una propuesta pendiente solo sirve si su base coincide con el recurso vigente:

$$
valida(a_d,t)=\mathbb{1}[v_{propuesta}=v_t]\,\mathbb{1}[G(s_t,a_d)=1].
$$

La asignación puede expresarse como valor marginal esperado después de demora y coste:

$$
\Delta_t=\mathbb{E}[J(a_d,v_t)-J(a_f,v_t)\mid h_t]-\lambda_c C_d-\lambda_t T_d,
\qquad diferir_t\Leftrightarrow(valida=1\land\Delta_t>0).
$$

$h_t$ es el historial retenido de eventos y resultados, $C_d$ el gasto de cómputo, $T_d$ la demora añadida y $\lambda$ convierte ambos a unidades de utilidad. Los resultados congelados no muestran que estas cantidades estén bien calibradas: la compuerta tuvo solo siete etiquetas positivas entre 228 estados y eligió umbral 1,01, equivalente a nunca diferir. La ecuación expresa la propuesta, no prueba que su estimación actual sea útil.

### Sensibilidad y límite de fallo

Estresa la propuesta donde sus componentes podrían importar: modifica el recurso después de solicitar y antes de recibir la respuesta; varía la demora alrededor del plazo; inyecta respuesta válida, malformada o ausente; y cambia si el historial distingue observaciones actuales idénticas. Cruza factores para separar invalidación, memoria y asignación. La matriz congelada está saturada en éxito, M12 falla 40 episodios C07 y las cuatro ablaciones igualan su éxito. Esos hallazgos se conservan; no se corrigen alterando registros antiguos.

El seguimiento debe mantener estados iniciales emparejados y la misma autoridad de acciones. Mide rechazo de propuestas obsoletas, finalización verificada, tiempo adicional y coste de recursos. Una mejora exige cambiar resultados donde deliberar ayude sin causar efectos no autorizados ni obsoletos. Informa incertidumbre agrupada por nuevas composiciones; repetir semillas de la misma fixture no reemplaza familias independientes. Una mejora de seguridad sin más finalización podría ser relevante, pero solo si ese resultado de seguridad se definió antes de evaluar.

### Usa metacontrol con versión de recursos y tus propios datos

Representa la base del recurso mediante un token opaco de revisión que devuelve el proveedor, no con una marca temporal inventada. Cada solicitud incluye el token, candidatas acotadas, plazo e id único. Al volver la respuesta, compara el token original con la revisión actual, valida la candidata contra permisos vigentes y registra si fue aceptada, rechazada o no utilizada. El texto libre del modelo nunca autoriza efectos.

Con un planificador determinista local y una fixture mutable, reproduce cuatro situaciones: propuesta válida oportuna, tardía, candidata malformada y cambio de revisión durante la espera. Agrega una acción rápida que pueda terminar mientras la deliberación sigue pendiente y verifica cancelación y limpieza. Captura historial y calcula postcondición de forma independiente. Mantén inmutable la matriz antigua; guarda episodios nuevos en otro directorio con índice y hashes propios. Declara la escala de utilidad y explica cómo se convierten demora y cómputo antes de ajustar un umbral.

Compara con delegación fija y M01 bajo igual presupuesto y plazo. Informa 1.160/1.200 de M12 junto a 1.200/1.200 de M01, la compuerta que nunca difiere y las ablaciones sin cambio. Implementar una propuesta o reproducirla no la valida. La siguiente prueba debe poder refutar la hipótesis y dar a todas las políticas una oportunidad real de ayudar o fallar.""",
}


COMPARISON_DETAILS = {
    "01-fast-event-control": {
        "en": r"""### Matched controller comparison

M01 and M02 solve C01 through different control representations. M01 encodes explicit state transitions; M02 traverses a behavior tree. The comparison is informative only if both receive the same observation, candidate actions, permission state, resource revision, and independent postcondition. The episode trace should therefore be read as a sequence: observation acquired, stale or unauthorized candidates removed, policy decision recorded, native admission returned, effect receipt written, and final document state checked. Compare the first point where their traces diverge. A different action order with the same terminal file can reveal a control-organization difference, but it does not establish a safety advantage unless an authorization or freshness outcome also differs.

The frozen C01 family is intentionally narrow. If both policies succeed on its six designed variants, their completion rates cannot rank them; latency, refusal correctness, and trace complexity then become separate descriptive outcomes. Report medians and tails from the same indexed conditions, preserving rejected attempts and the full denominator. Avoid treating repeated seeds as independent production incidents. The new paired run is an API walkthrough that checks the currently installed policy path; it is not added to the immutable benchmark index.

For a stronger experiment, construct held-out document tasks in which an observation becomes stale between preview and admission, the destination permission changes, or two valid actions have different downstream consequences. Freeze the task generator and independent oracle before controller tuning. Pair initial states and permission masks across policies, include abstention as an outcome, and report unauthorized effects separately from task completion. A state machine may remain the best policy for a small stable domain; the question is whether the behavior-tree representation changes maintainability or boundary behavior under novel compositions, not whether one label is inherently more intelligent.""",
        "es": r"""### Comparación emparejada de controladores

M01 y M02 resuelven C01 con representaciones distintas. M01 codifica transiciones de estado explícitas; M02 recorre un árbol de comportamiento. La comparación solo es informativa si ambos reciben la misma observación, acciones candidatas, permisos, revisión del recurso y poscondición independiente. Por eso conviene leer cada episodio como una secuencia: observación adquirida, descarte de candidatas obsoletas o no autorizadas, decisión de política, admisión nativa, recibo del efecto y comprobación final del documento. Compara el primer punto donde divergen las trazas. Un orden distinto con el mismo archivo final puede revelar una diferencia organizativa, pero no demuestra mayor seguridad salvo que también cambie una decisión de autorización o vigencia.

La familia congelada C01 es acotada deliberadamente. Si ambas políticas completan sus seis variantes diseñadas, la tasa de finalización no permite ordenarlas; latencia, corrección del rechazo y complejidad de la traza son resultados descriptivos separados. Informa mediana y cola bajo las mismas condiciones indexadas, conserva intentos rechazados y mantiene el denominador completo. No trates semillas repetidas como incidentes de producción independientes. La ejecución emparejada nueva es una guía de uso de la API y comprueba la política instalada; no se agrega al índice inmutable del benchmark.

Un experimento más fuerte debe crear tareas documentales retenidas donde la observación quede obsoleta entre vista previa y admisión, cambie el permiso del destino o dos acciones válidas tengan consecuencias distintas. Congela el generador de tareas y el oráculo independiente antes de ajustar controladores. Empareja estados y permisos, incluye abstención como resultado e informa efectos no autorizados aparte de finalización. Una máquina de estados puede seguir siendo la mejor política en un dominio pequeño y estable; la pregunta es si el árbol cambia mantenibilidad o conducta de frontera bajo composiciones nuevas, no si una etiqueta es intrínsecamente más inteligente.""",
    },
    "02-learned-action-policies": {
        "en": r"""### Comparing learned action scorers

M03 and M04 share the same feature contract, legal-action mask, and episode oracle, so their contrast isolates the fitted scoring family only when preprocessing and split boundaries are held constant. M03 applies a logistic score; M04 uses gradient-boosted trees. Inspect feature values before the score, ranking before the mask, the admitted action after the mask, and the observed HTTP postcondition after execution. This ordering distinguishes a model disagreement from a broker rejection or an environment failure. A high score is not a confidence estimate unless separately calibrated, and agreement with a demonstration label is not task success.

The lesson's fresh comparison uses one selected case and seed to make the package interface executable. Its result must remain separate from the frozen episodes. For the full core matrix, several methods, including M03 and M04, solve every episode; that ceiling leaves little success-rate room for ranking them. The held-out transfer compositions provide a different test: the stored aggregate reports M04 at 24/24 and M12 at 21/24. Those 24 cases are useful evidence that the proposed controller does not dominate every comparator, but they are too few and too composition-specific to support a population claim. Keep transfer denominators separate from core results.

A discriminating scorer study should hold the training corpus and candidate mask fixed, then vary task composition, feature missingness, delayed observations, and action availability in sealed test groups. Evaluate calibration on data disjoint from fitting and threshold selection. Report per-family verified outcomes, ranking loss, invalid-action proposals, controller time, and paired confidence intervals clustered by task composition. Include a rule-based baseline and a prespecified tie policy. If the boosted model wins only on the current fixtures, say so; if it transfers, the held-out design must make that result independently reproducible.""",
        "es": r"""### Comparación de puntuadores de acciones

M03 y M04 comparten el contrato de atributos, la máscara de acciones legales y el oráculo del episodio. Su contraste aísla la familia de puntuación solo si se mantienen el preprocesamiento y los límites de partición. M03 aplica una puntuación logística; M04 usa árboles potenciados por gradiente. Inspecciona los atributos antes del puntaje, el orden antes de la máscara, la acción admitida después de aplicarla y la poscondición HTTP observada tras ejecutar. Esta secuencia separa desacuerdo del modelo, rechazo del intermediario y fallo del entorno. Un puntaje alto no es una confianza calibrada sin evaluación independiente, y coincidir con una etiqueta demostrada no equivale a completar la tarea.

La comparación ejecutada en esta lección usa un caso y una semilla para hacer reproducible la interfaz del paquete. Su resultado queda separado de los episodios congelados. En la matriz central completa, varios métodos, incluidos M03 y M04, resuelven todos los episodios; ese techo deja poco margen para ordenarlos por éxito. Las composiciones de transferencia retenidas son otra prueba: el agregado persistido informa M04 con 24/24 y M12 con 21/24. Estos 24 casos muestran que el controlador propuesto no domina a todo comparador, pero son pocos y específicos para sostener una afirmación poblacional. Conserva separados los denominadores de transferencia y núcleo.

Un estudio más discriminante debe fijar corpus de entrenamiento y máscara, y variar composición, atributos ausentes, observaciones retrasadas y acciones disponibles en grupos de prueba sellados. Evalúa calibración con datos separados del ajuste y selección de umbral. Informa resultados verificados por familia, pérdida de ranking, propuestas inválidas, tiempo del controlador e intervalos emparejados agrupados por composición de tarea. Incluye una base reglada y una política de empate predefinida. Si el árbol potenciado solo gana en las fixtures actuales, decláralo; si transfiere, el diseño retenido debe permitir reproducirlo de forma independiente.""",
    },
    "03-sequential-control": {
        "en": r"""### Cancellation policy comparison

The C07 task is a race between a cancellation request, asynchronous state changes, and the terminal-state oracle. M05's recurrent policy can condition its decision on within-episode history; M07's masked PPO policy is trained from executed transitions. To compare them, align the initial job state, cancellation authority, polling schedule, deadline, and termination oracle. Read each trace in event-time order. A job that exits naturally after a cancellation request is not evidence that the request caused termination; a request receipt without a verified terminal state is not a completed cancellation.

The benchmark concentrates M12's 40 core failures in C07 variants while M01 solves the frozen core matrix. That concentration motivates a timing study but does not show that recurrence itself caused the failures or that a particular learned baseline fixes them. Within a small fixed set of event schedules, policies may receive identical outcomes across seeds. Report the number of distinct schedules and outcome sequences beside the nominal episode count. Separate cancellation-admission latency, process lifetime, termination latency, and final task success; they are different estimands. The plotted controller p95 is not the time until the job stops.

To test genuine sequential control, create unseen traces where the same current observation follows different causal histories, vary polling and effect delays independently, and include a state change immediately before and after admission. Seal the transition schedules and use an oracle that distinguishes requested, accepted, effective, and verified cancellation. Pair methods on each schedule and preserve race failures. Analyze task families as the sampling unit and publish event traces with hashes. A controller that reacts to history should improve a prespecified outcome or cost without increasing stale actions; a more complex hidden state alone is not evidence of useful memory.""",
        "es": r"""### Comparación de políticas de cancelación

La tarea C07 es una carrera entre la solicitud de cancelación, los cambios asíncronos de estado y el oráculo terminal. La política recurrente M05 puede condicionar su decisión al historial del episodio; PPO enmascarado M07 se entrena con transiciones ejecutadas. Para compararlas, iguala estado inicial del trabajo, autoridad de cancelación, calendario de consulta, plazo y oráculo de término. Lee cada traza por tiempo de evento. Que un proceso termine naturalmente después de solicitar cancelación no prueba que la solicitud lo terminó; un recibo de solicitud sin estado terminal verificado tampoco es cancelación completada.

Los 40 fallos centrales de M12 se concentran en variantes C07, mientras M01 resuelve la matriz congelada. Esa concentración motiva estudiar tiempos, pero no demuestra que la recurrencia cause los fallos ni que una base aprendida concreta los corrija. En un conjunto pequeño de calendarios fijos, las políticas pueden repetir resultados idénticos entre semillas. Informa el número de calendarios y secuencias de resultado distintos junto con los episodios nominales. Separa latencia de admisión, duración del proceso, latencia de término y éxito final: son estimandos diferentes. El p95 del controlador que se grafica no es el tiempo hasta la detención.

Para probar control secuencial real, crea trazas nuevas donde una observación actual idéntica siga historias causales distintas, varía por separado consulta y efecto e incluye cambios justo antes y después de admitir. Sella calendarios y usa un oráculo que diferencie cancelación solicitada, aceptada, efectiva y verificada. Empareja métodos y conserva fallos de carrera. Analiza familias como unidad de muestreo y publica trazas con hashes. Una política que usa historial debe mejorar un resultado o coste predefinido sin aumentar acciones obsoletas; un estado oculto más complejo no demuestra memoria útil.""",
    },
    "04-deliberation-allocation": {
        "en": r"""### Delegation comparison under a deadline

M10 delegates on a fixed asynchronous schedule; M12 is intended to allocate deliberation using predicted outcome and cost while retaining resource versions. Their comparison is meaningful only when both receive the same bounded candidate set, deadline, tool permissions, and independent verifier. For each request, record start, response, schema validation, resource revision, permission recheck, admission, effect, cancellation, and final postcondition. A fluent proposal can be malformed, stale, unauthorized, late, unused, or simply irrelevant. Count each state separately instead of turning a request into a success.

The fitted M12 allocation gate was trained from 228 states with seven positive labels and selected threshold 1.01, which means it never defers. The four reported ablations preserve core task success. These are substantive negative findings about the current fit and frozen task distribution. They do not establish that bounded deliberation can never help, because the benchmark offers few consequential cases where a planner can repair a fast-policy failure. Nor does a rare helpful proposal establish value: planner delay, computation, invalidation, and opportunity cost belong in the outcome.

An informative new study should preregister a utility scale and threshold-selection protocol, then cross planner delay, answer validity, resource revision, and whether the fast policy's candidate is actually wrong. Use paired states and a sealed task-composition holdout. Record request-to-response and response-to-effect time separately, and evaluate verified success, unauthorized or stale effects, deadline misses, and compute cost. Compare the learned gate with fixed delegation, no delegation, and a guarded finite-state policy. If no method helps, report a clean null result; do not raise the complexity or rename an unvalidated gate as an achieved capability.""",
        "es": r"""### Comparación de delegación con plazo

M10 delega con calendario asíncrono fijo; M12 busca asignar deliberación según resultado y coste previstos, conservando versiones de recursos. La comparación requiere igual conjunto acotado de candidatas, plazo, permisos y verificador independiente. Para cada solicitud registra inicio, respuesta, validación de esquema, revisión del recurso, nueva comprobación de permisos, admisión, efecto, cancelación y poscondición. Una propuesta fluida puede ser malformada, obsoleta, no autorizada, tardía, no utilizada o irrelevante. Cuenta cada estado por separado; una solicitud no es un éxito.

La compuerta M12 se ajustó con 228 estados y siete etiquetas positivas, y eligió umbral 1,01: nunca difiere. Las cuatro ablaciones reportadas conservan el éxito central. Son resultados negativos importantes sobre el ajuste actual y la distribución congelada. No demuestran que la deliberación acotada nunca ayude, pues el benchmark ofrece pocos casos relevantes donde el planificador pueda reparar un fallo rápido. Tampoco basta una propuesta útil aislada: demora, cómputo, invalidación y coste de oportunidad forman parte del resultado.

Un estudio informativo debe preinscribir escala de utilidad y selección de umbral, y cruzar demora del planificador, validez de respuesta, revisión del recurso y error real de la política rápida. Usa estados emparejados y una composición retenida sellada. Separa tiempo solicitud-respuesta de respuesta-efecto; mide éxito verificado, efectos obsoletos o no autorizados, plazos incumplidos y coste de cómputo. Compara compuerta aprendida con delegación fija, sin delegación y política con guardas. Si ningún método ayuda, informa un nulo limpio; no aumentes complejidad ni presentes una compuerta no validada como capacidad lograda.""",
    },
    "05-evaluation-and-transfer": {
        "en": r"""### Core and transfer evidence are separate

This case-level comparison is not the transfer result. The core matrix contains repeated executions of designed software-operation families; the transfer lane holds out new task compositions. A method may tie on C01 or C05 and diverge on a new composition, so a case plot cannot stand in for the full transfer index. Keep method version, composition identity, seed, verifier, and raw episode hash attached to each observation. Report success numerators and denominators, safe refusal, action violations, median and tail decision time, and the cluster structure used for uncertainty.

The stored transfer aggregate reports 24/24 outcomes for M04 and 21/24 for M12. Preserve this contrast alongside the core result (M01: 1,200/1,200; M12: 1,160/1,200). It shows the proposed method has no uniform advantage in the available evidence. The small transfer count and narrow composition generator limit precision and external validity; three episode outcomes do not justify a broad ranking. Identical seeds within many cells further reduce the amount of independent variation. An interval should be based on independently generated task compositions, not a naive binomial model over repeated deterministic fixtures.

A credible next evaluation would freeze a generator that creates semantically new goals, resource structures, asynchronous dependencies, and permission boundaries. Use one development split for model and threshold choices, one calibration split, and a sealed composition-level test. Predeclare primary outcomes and noninferiority margins before running. Publish a per-family table and paired differences with uncertainty clustered by composition. Include a fixed policy and strong learned scorers as baselines. The purpose is to test where controller representations transfer, while ensuring any negative outcome remains available to users.""",
        "es": r"""### La evidencia central y de transferencia se separa

Esta comparación de un caso no es el resultado de transferencia. La matriz central repite ejecuciones de familias diseñadas de operaciones de software; el carril de transferencia retiene composiciones nuevas. Un método puede empatar en C01 o C05 y divergir en una composición nueva, por lo que un gráfico de caso no reemplaza el índice completo de transferencia. Mantén versión del método, identidad de composición, semilla, verificador y hash del episodio bruto junto a cada observación. Informa numerador y denominador de éxito, rechazo seguro, violaciones, mediana y cola de decisión, y agrupamiento usado para incertidumbre.

El agregado retenido informa 24/24 para M04 y 21/24 para M12. Conserva este contraste junto al resultado central (M01: 1.200/1.200; M12: 1.160/1.200). Muestra que la evidencia disponible no da ventaja uniforme al método propuesto. El bajo número y generador estrecho limitan precisión y validez externa; tres resultados de episodio no justifican un ranking amplio. Semillas idénticas en muchas celdas reducen aún más variación independiente. Un intervalo debe basarse en composiciones de tarea generadas independientemente, no en un modelo binomial ingenuo sobre fixtures deterministas repetidas.

La próxima evaluación debe congelar un generador de objetivos semánticamente nuevos, estructuras de recursos, dependencias asíncronas y límites de permisos. Usa un split de desarrollo para modelo y umbral, uno de calibración y una prueba sellada por composición. Preinscribe resultados primarios y márgenes de no inferioridad. Publica tabla por familia y diferencias emparejadas con incertidumbre agrupada por composición. Incluye política fija y puntuadores aprendidos fuertes. El objetivo es probar transferencia entre representaciones de control y mantener disponibles los resultados negativos.""",
    },
    "06-ablation-and-export-parity": {
        "en": r"""### Ablation and export parity answer different questions

The task ablations ask whether a named component changes verified outcomes or costs when all other execution conditions are fixed. Numerical export parity asks whether two implementations compute sufficiently similar scores on a declared input domain. Keep these experiments separate. For an ablation, pair full and reduced configurations on identical initial states and candidate masks; report paired outcome differences, resource cost, stale-action rate, and failures by task family. If the configurations tie on a saturated suite, the correct interpretation is that the suite does not identify contribution. A successful native action cannot establish score parity.

The reported four M12 ablations leave core task success unchanged, while the full controller remains below M01 on the 1,200-episode core matrix. This does not prove that each internal component is useless in every domain; it means the persisted experiment supplies no task-success evidence that these components add value under the tested distribution. Do not turn post-hoc differences in hidden metrics into primary evidence unless those metrics and thresholds were prespecified. If safety is the intended benefit, define an independent safety outcome and test it with enough adverse cases.

For export parity, publish the vector schema, training and conversion versions, compiler target, tolerance, and hash of every vector set. Compare maximum and percentile absolute error plus action ranking after applying identical admissibility masks. Include boundary magnitudes, sparse and dense inputs, near-ties, and invalid shapes as separate rejection cases. Then test the integrated broker on a disposable fixture: numerical equality does not prove effect equivalence, and effect success does not prove conversion accuracy. Keep raw outputs so any claimed discrepancy can be independently reproduced.""",
        "es": r"""### Ablación y paridad de exportación responden preguntas distintas

Las ablaciones preguntan si un componente identificado cambia resultados verificados o costes bajo iguales condiciones de ejecución. La paridad numérica pregunta si dos implementaciones calculan puntajes suficientemente similares en un dominio declarado. Mantén experimentos separados. Para una ablación, empareja configuración completa y reducida con estados y máscaras idénticos; informa diferencias de resultado, coste, acciones obsoletas y fallos por familia. Si empatan en una suite saturada, la interpretación correcta es que la suite no identifica contribución. Una acción nativa exitosa no demuestra paridad de puntajes.

Las cuatro ablaciones M12 reportadas no cambian éxito central, mientras el controlador completo queda por debajo de M01 en la matriz de 1.200 episodios. Esto no prueba que todo componente sea inútil en cualquier dominio; significa que el experimento persistido no aporta evidencia de que añadan valor de éxito bajo la distribución probada. No conviertas diferencias post hoc en métricas ocultas en evidencia primaria sin preinscribirlas. Si el beneficio buscado es seguridad, define resultado independiente y prueba suficientes casos adversos.

Para paridad de exportación, publica esquema vectorial, versiones de entrenamiento y conversión, destino de compilación, tolerancia y hash de cada conjunto. Compara error absoluto máximo y percentiles, además del ranking tras aplicar máscaras idénticas. Incluye magnitudes límite, entradas dispersas y densas, casi empates y formas inválidas como rechazos separados. Luego prueba el intermediario integrado en una fixture desechable: igualdad numérica no demuestra igualdad de efectos y éxito del efecto no demuestra precisión de conversión. Conserva salidas brutas para reproducir discrepancias.""",
    },
}

COMPARISON_APPENDIX = {
    "01-fast-event-control": {
        "en": r"""### Sensitivity and failure boundary

Stress the observation-to-admission interval, because C01's guard depends on current revision and permission. Let $r_o$ be the preview revision and $r_a$ the revision at admission; the stale-action rate is

$$
R_{stale}=\frac{\sum_i \mathbb{1}[r_{o,i}\ne r_{a,i}\land a_i\text{ admitted}]}{N_{eligible}}.
$$

Also compare abstention and false rejection. Raising stale-revision frequency may increase safe rejection while lowering task completion, so report both rather than optimizing one. The exact frozen C01 outcomes remain a benchmark result; the sweep below is a separate experiment.

### Use the comparison with your own data

Create a disposable document fixture with versioned revisions and explicit destination permissions. Replay a valid move, a stale preview, revoked permission, duplicate request, and an unavailable destination. Give M01 and M02 the same initial bytes and action candidates; save broker receipts and verify final bytes with an independent hash oracle. Add the condition only to a new index with its own seed and hash manifest. Read one trace where the policies diverge, identify the decision and admission boundary, then aggregate by task composition. Never infer field incidence from this designed fixture.""",
        "es": r"""### Sensibilidad y límite de fallo

Estresa el intervalo entre observación y admisión, porque la guarda C01 depende de revisión y permiso actuales. Sea $r_o$ la revisión de vista previa y $r_a$ la revisión al admitir; la tasa de acción obsoleta es

$$
R_{obsoleta}=\frac{\sum_i \mathbb{1}[r_{o,i}\ne r_{a,i}\land a_i\text{ admitida}]}{N_{elegible}}.
$$

Compara también abstención y rechazo falso. Elevar la frecuencia de revisiones obsoletas puede aumentar rechazos seguros y reducir finalización; informa ambos resultados en lugar de optimizar uno solo. Los resultados C01 congelados permanecen como benchmark; el barrido es otro experimento.

### Usa la comparación con tus propios datos

Crea una fixture documental desechable con revisiones versionadas y permisos de destino explícitos. Reproduce movimiento válido, vista previa obsoleta, permiso revocado, solicitud duplicada y destino no disponible. Entrega a M01 y M02 mismos bytes iniciales y candidatas; guarda recibos y verifica bytes finales con un hash independiente. Agrega cada condición a un índice nuevo con semillas y manifiesto propios. Lee una traza divergente, identifica decisión y admisión y agrega por composición. No infieras frecuencia de terreno de esta fixture diseñada.""",
    },
    "02-learned-action-policies": {
        "en": r"""### Sensitivity and calibration limits

Score comparison must be separated from postcondition success. For a candidate set $A_t$ and admissibility mask $m_t$, a permitted policy action can be written

$$
a_t=\arg\max_{a\in A_t:m_t(a)=1} s_\theta(x_t,a),\qquad y_t=\mathbb{1}[V(\tau_t)=1].
$$

The first quantity is a ranking decision; $y_t$ comes from the independent verifier. Sweep missing features, class imbalance, and candidate-set size after fitting, while keeping a separate calibration partition. Report expected calibration error only when probability semantics are defined; raw margins are not probabilities. Include invalid proposals even when the broker safely rejects them.

### Adapt the comparison to your own data

Prepare a versioned set of permissible action candidates and independently labeled postconditions. Split by task composition before fitting; do not place near-duplicate episodes across train and test. Fit preprocessing and models only on training records, calibrate on a second partition, and freeze a third partition for evaluation. Compare M03, M04, and the guarded baseline under identical masks. Store feature schema, split IDs, model hashes, action ranking, admitted action, verifier output, and latency. Inspect mistakes by HTTP failure mode and state region before changing labels. If no licensed and representative production data exist, retain synthetic labels and say so.""",
        "es": r"""### Sensibilidad y límites de calibración

La comparación de puntajes debe separarse del éxito de poscondición. Para candidatas $A_t$ y máscara de admisibilidad $m_t$, una acción permitida puede escribirse

$$
a_t=\arg\max_{a\in A_t:m_t(a)=1}s_\theta(x_t,a),\qquad y_t=\mathbb{1}[V(\tau_t)=1].
$$

La primera cantidad ordena acciones; $y_t$ proviene del verificador independiente. Varía atributos ausentes, desbalance de clases y tamaño de candidatas después del ajuste, conservando una partición de calibración separada. Informa error de calibración solo si hay semántica probabilística; un margen bruto no es probabilidad. Incluye propuestas inválidas aunque el intermediario las rechace de forma segura.

### Adapta la comparación a tus propios datos

Prepara candidatas permitidas y poscondiciones etiquetadas de forma independiente. Divide por composición antes de ajustar; no repartas episodios casi duplicados entre entrenamiento y prueba. Ajusta preprocesamiento y modelos solo en entrenamiento, calibra en una segunda partición y congela una tercera para evaluación. Compara M03, M04 y la base con guardas bajo máscaras idénticas. Guarda esquema, IDs de partición, hashes de modelos, ranking, acción admitida, verificador y latencia. Inspecciona errores por modo de fallo HTTP y región de estado antes de cambiar etiquetas. Si no hay datos productivos representativos y licenciados, conserva etiquetas sintéticas y decláralas.""",
    },
    "03-sequential-control": {
        "en": r"""### Sensitivity and event ordering

Count cancellation only when the terminal oracle confirms the intended stop before the deadline. For episode $i$ with request time $t_r$, accepted time $t_a$, and verified terminal time $t_v$, distinguish the intervals

$$
L_{admit}=t_a-t_r,\qquad L_{stop}=t_v-t_r,\qquad C_i=\mathbb{1}[t_v\le d_i\land state_i=cancelled].
$$

Vary observation delay and effect delay independently; a single combined delay cannot identify which boundary caused a miss. Include a natural-completion control, a rejected request, and no terminal receipt. Preserve event order even when timestamps tie, using a stable sequence number.

### Apply the comparison to your own event traces

Use a disposable asynchronous job service whose state machine and cancellation receipt are inspectable. Replay the same job trace for each policy, then vary only one timing factor at a time. Record monotonic timestamps, poll count, cancellation authority, receipt identity, final state, and whether natural completion would have occurred without the request. Group results by schedule family, not by repeated execution of one schedule. Extend the trace set only after freezing the oracle and policy configuration. Do not reuse historical core outcomes as if they were fresh trials.""",
        "es": r"""### Sensibilidad y orden de eventos

Cuenta cancelación solo cuando el oráculo terminal confirma la detención antes del plazo. Para episodio $i$, con solicitud $t_r$, aceptación $t_a$ y término verificado $t_v$, separa intervalos

$$
L_{adm}=t_a-t_r,\qquad L_{det}=t_v-t_r,\qquad C_i=\mathbb{1}[t_v\le d_i\land estado_i=cancelado].
$$

Varía por separado demora de observación y demora del efecto; una demora combinada no identifica qué frontera causó el fallo. Incluye control de término natural, solicitud rechazada y ausencia de recibo terminal. Conserva orden incluso con tiempos iguales mediante secuencia estable.

### Aplica la comparación a tus propias trazas

Usa un servicio asíncrono desechable cuya máquina de estados y recibo de cancelación sean inspeccionables. Reproduce la misma traza para cada política y cambia un factor temporal por vez. Registra tiempos monotónicos, consultas, autoridad, identidad del recibo, estado final y si habría ocurrido término natural sin solicitud. Agrupa por familia de calendario, no por repeticiones de uno. Amplía trazas solo después de congelar oráculo y configuración. No reutilices resultados centrales históricos como ensayos nuevos.""",
    },
    "04-deliberation-allocation": {
        "en": r"""### Sensitivity and deadline trade-off

The value of a deliberation call is incremental verified utility minus its cost, not the probability that a response arrives. For state history $h$, fast action $a_f$, delegated action $a_d$, added compute $c$, and delay $\delta$, compare

$$
\Delta U(h)=\mathbb{E}[U(a_d)-U(a_f)\mid h]-\lambda_c c-\lambda_t\delta.
$$

Sweep planner delay across the deadline, resource changes while waiting, and response validity as separate factors. A stale proposal must be rejected even when it would otherwise succeed. Report helpful, harmful, unused, late, malformed, and invalidated responses as distinct counts; retain cancellation and opportunity-cost measurements.

### Reproduce the comparison with your own planner

Use a deterministic stub planner first, with versioned responses for correct, wrong, malformed, late, and never-returning proposals. Keep the action space bounded and permissions fixed. Change the resource revision during one pending request and verify that its returned action is rejected. Pair each condition with M01, fixed delegation, and the current M12 policy. Record the raw request/response bytes, timing, revision tokens, admission decision, receipt, verifier outcome, and compute budget. Only replace the stub with a live model after preserving this test harness.""",
        "es": r"""### Sensibilidad y costo del plazo

El valor de deliberar es utilidad verificada incremental menos su coste, no la probabilidad de recibir respuesta. Para historial $h$, acción rápida $a_f$, acción delegada $a_d$, cómputo $c$ y demora $\delta$, compara

$$
\Delta U(h)=\mathbb{E}[U(a_d)-U(a_f)\mid h]-\lambda_c c-\lambda_t\delta.
$$

Varía demora del planificador respecto del plazo, cambios de recurso mientras espera y validez como factores separados. Una propuesta obsoleta se rechaza aunque pudiera acertar. Informa respuestas útiles, dañinas, tardías, malformadas, no usadas e invalidadas como recuentos distintos; conserva cancelación y coste de oportunidad.

### Reproduce la comparación con tu propio planificador

Empieza con un planificador simulado determinista y respuestas versionadas: correcta, incorrecta, malformada, tardía o ausente. Mantén acotado el espacio de acciones y fijos los permisos. Cambia revisión durante una solicitud pendiente y verifica rechazo de la propuesta devuelta. Empareja condición con M01, delegación fija y política M12 actual. Registra bytes de solicitud y respuesta, tiempos, revisiones, admisión, recibo, verificador y presupuesto. Sustituye el simulador por un modelo vivo solo después de conservar esta batería.""",
    },
    "05-evaluation-and-transfer": {
        "en": r"""### Sensitivity and sampling unit

The relevant replication unit is a task composition when many seeds replay the same fixture. Let $d_{jk}$ be the paired method difference for composition $j$ and replay $k$; aggregate replays within composition before estimating variation across compositions:

$$
\bar d_j=\frac{1}{K_j}\sum_k d_{jk},\qquad \widehat{Var}_{task}=\frac{1}{J-1}\sum_j(\bar d_j-\bar d)^2.
$$

This prevents deterministic replays from masquerading as independent task evidence. Vary the held-out composition generator, family mixture, and resource topology while preserving a frozen evaluation protocol. Report cell-level counts alongside the composition-level uncertainty.

### Extend the evaluation with your own task families

Define a task schema and postcondition oracle before collecting policy outcomes. Split by a stable composition identifier, then freeze training, calibration, and holdout manifests. Add task families that change resource relations or asynchronous dependencies rather than merely renaming inputs. Pair all policies on initial state and permissions. Publish generation code, exclusion criteria, and failures. If you only have the repository fixtures, the result is a test of this designed suite, not a claim about all software operations.""",
        "es": r"""### Sensibilidad y unidad de muestreo

La unidad de réplica pertinente es composición cuando muchas semillas repiten la misma fixture. Sea $d_{jk}$ la diferencia emparejada por método en composición $j$ y repetición $k$; agrega repeticiones dentro de composición antes de estimar variación entre composiciones:

$$
\bar d_j=\frac{1}{K_j}\sum_k d_{jk},\qquad \widehat{Var}_{tarea}=\frac{1}{J-1}\sum_j(\bar d_j-\bar d)^2.
$$

Así las repeticiones deterministas no parecen evidencia independiente. Varía generador retenido, mezcla de familias y topología de recursos con protocolo congelado. Informa recuentos por celda junto a incertidumbre por composición.

### Extiende la evaluación con tus propias familias

Define esquema de tarea y oráculo de poscondición antes de recopilar resultados. Divide por identificador estable de composición y congela manifiestos de ajuste, calibración y prueba retenida. Añade familias que cambien relaciones entre recursos o dependencias asíncronas, no solo nombres de entrada. Empareja políticas por estado inicial y permisos. Publica generación, exclusiones y fallos. Si solo usas fixtures del repositorio, el resultado evalúa esta suite diseñada, no todas las operaciones de software.""",
    },
    "06-ablation-and-export-parity": {
        "en": r"""### Sensitivity and paired component effect

For a full policy and ablation paired on task $i$, define the outcome difference before inspecting results:

$$
\tau_i=Y_i^{full}-Y_i^{ablated},\qquad \hat\tau=\frac{1}{N}\sum_i\tau_i.
$$

Stratify this quantity by task family and report safety effects separately. For export parity, measure $e(x)=\max_a|s_{py}(x,a)-s_{native}(x,a)|$ and also whether the selected admissible action changes. Sweep feature magnitudes and near ties without pooling invalid-shape rejection tests into numeric error. A passing vector tolerance cannot substitute for matched task outcomes.

### Reproduce component and export checks on your own data

Choose an ablation by a source-controlled configuration flag and verify that all other code paths remain identical. Use paired seeds and a predeclared outcome oracle. For a model export, write a small versioned vector file covering ordinary, boundary, sparse, and near-tie inputs; run both implementations and save raw scores, selected actions, max error, and artifact hashes. Keep fixtures synthetic unless a license and provenance record allow real task traces. Run the broker integration separately in a disposable workspace and compare receipts and final state.""",
        "es": r"""### Sensibilidad y efecto emparejado del componente

Para política completa y ablación emparejadas en tarea $i$, define diferencia antes de mirar resultados:

$$
\tau_i=Y_i^{completa}-Y_i^{ablacion},\qquad \hat\tau=\frac{1}{N}\sum_i\tau_i.
$$

Estratifica por familia e informa efectos de seguridad aparte. Para paridad, mide $e(x)=\max_a|s_{py}(x,a)-s_{nativo}(x,a)|$ y si cambia la acción admisible elegida. Varía magnitudes y casi empates; no mezcles rechazo de formas inválidas con error numérico. Una tolerancia vectorial aprobada no sustituye resultados de tareas emparejadas.

### Reproduce ablación y paridad con tus propios datos

Elige ablación mediante bandera versionada y comprueba que las demás rutas sean idénticas. Usa semillas emparejadas y oráculo preinscrito. Para exportación, crea archivo vectorial versionado con entradas ordinarias, límite, dispersas y casi empatadas; ejecuta ambas implementaciones y guarda puntajes, acciones, error máximo y hashes. Mantén fixtures sintéticas salvo que licencia y procedencia permitan trazas reales. Prueba integración del intermediario por separado en espacio desechable y compara recibos y estado final.""",
    },
}

COMPARISON_CHECKS = {
    "01-fast-event-control": {
        "en": r"$R_{false}=N_{valid\,rejected}/N_{valid}$ quantifies false rejection separately from safe stale-action blocking.",
        "es": r"$R_{falso}=N_{válidas\,rechazadas}/N_{válidas}$ cuantifica rechazo falso separado del bloqueo seguro de acciones obsoletas.",
    },
    "02-learned-action-policies": {
        "en": r"The paired action-disagreement rate is $D=N_{M03\ne M04}/N$; pair it with verifier disagreement rather than treating it as an error by itself.",
        "es": r"La tasa emparejada de desacuerdo es $D=N_{M03\ne M04}/N$; acompáñala con desacuerdo del verificador, no la trates como error por sí sola.",
    },
    "03-sequential-control": {
        "en": r"The deadline margin is $M_i=d_i-t_{v,i}$; a missing terminal time is censored and must not be encoded as zero.",
        "es": r"El margen al plazo es $M_i=d_i-t_{v,i}$; si falta tiempo terminal, el dato está censurado y no debe codificarse como cero.",
    },
    "04-deliberation-allocation": {
        "en": r"The realized routing label is $z_i=\mathbb{1}[U_i^{delegated}-U_i^{fast}-\lambda_c c_i-\lambda_t\delta_i>0\land valid_i]$.",
        "es": r"La etiqueta de enrutamiento observada es $z_i=\mathbb{1}[U_i^{delegada}-U_i^{rápida}-\lambda_c c_i-\lambda_t\delta_i>0\land valida_i]$.",
    },
    "05-evaluation-and-transfer": {
        "en": r"Use the composition-level standard error $SE(\bar d)=s_{\bar d_j}/\sqrt{J}$, not the episode count $\sum_j K_j$ as if all replays were independent.",
        "es": r"Usa error estándar por composición $EE(\bar d)=s_{\bar d_j}/\sqrt{J}$, no el total de episodios $\sum_j K_j$ como si cada repetición fuese independiente.",
    },
    "06-ablation-and-export-parity": {
        "en": r"The export gate is $\max_{x\in X}|s_{py}(x)-s_{native}(x)|\le\epsilon$, with action agreement evaluated as a separate condition.",
        "es": r"La compuerta de exportación es $\max_{x\in X}|s_{py}(x)-s_{nativo}(x)|\le\epsilon$, y el acuerdo de acción se evalúa aparte.",
    },
}


def complete(root: Path) -> int:
    changed_count = 0
    for topic, languages in LESSONS.items():
        for language, content in languages.items():
            for level in (2, 3):
                path = root / "notebooks" / language / topic / (
                    "02-the-method-in-practice.ipynb" if level == 2 else "03-prior-methods-comparison.ipynb"
                )
                notebook = json.loads(path.read_text(encoding="utf-8"))
                marker = (
                    "### Deriving the guarded choice" if topic.startswith("01-") and language == "en" else
                    "### Derivación de la elección con guardas" if topic.startswith("01-") else
                    "### From action scores to an admitted operation" if topic.startswith("02-") and language == "en" else
                    "### De los puntajes a una operación admitida" if topic.startswith("02-") else
                    "### Event-time model for cancellation" if topic.startswith("03-") and language == "en" else
                    "### Modelo temporal de la cancelación" if topic.startswith("03-") else
                    "### Decision rule for bounded delegation" if topic.startswith("04-") and language == "en" else
                    "### Regla de decisión para delegación acotada" if topic.startswith("04-") else
                    "### Estimand and denominator" if topic.startswith("05-") and language == "en" else
                    "### Estimando y denominador" if topic.startswith("05-") else
                    "### Ablation and numerical export answer different questions" if language == "en" else
                    "### La ablación y la paridad numérica responden preguntas distintas"
                )
                current_marker = COMPARISON_DETAILS[topic][language].splitlines()[0]
                existing = next((i for i,c in enumerate(notebook["cells"]) if c.get("cell_type") == "markdown" and (marker in _source(c) or (level == 3 and current_marker in _source(c)))), None)
                if existing is not None:
                    notebook["cells"].pop(existing)
                result_heading = "## Results\n" if language == "en" else "## Resultados\n"
                insert_at = next((i for i, c in enumerate(notebook["cells"]) if c.get("cell_type") == "markdown" and _source(c).startswith(result_heading)), len(notebook["cells"]))
                text = content["equations"] if level == 2 else COMPARISON_DETAILS[topic][language]
                if level == 3:
                    appendix = COMPARISON_APPENDIX[topic][language]
                    lines = appendix.splitlines()
                    heading_count = 0
                    for i, line in enumerate(lines):
                        if line.startswith("### "):
                            heading_count += 1
                            if heading_count == 2:
                                lines[i] = ("### Apply the comparison to your own data" if language == "en"
                                            else "### Aplica la comparación con tus propios datos")
                    appendix = "\n".join(lines)
                    parts = appendix.split("\n### ", 1)
                    if len(parts) == 2:
                        check = COMPARISON_CHECKS[topic][language]
                        start, end = check.find("$"), check.find("$", check.find("$") + 1)
                        if start >= 0 and end > start:
                            check = check[:start] + "$$\n" + check[start + 1:end] + "\n$$" + check[end + 1:]
                        appendix = parts[0].rstrip() + "\n\n" + check + "\n\n### " + parts[1]
                    text += "\n\n" + appendix + "\n"
                elif topic == "05-evaluation-and-transfer" and language == "en":
                    text += r"""

For paired evaluation, preserve task-family strata and state the oracle before inspecting policy outcomes. A score comparison is not an effectiveness result unless it changes a verified postcondition. Report the development and transfer lanes separately so selecting thresholds on one cannot silently tune the other."""
                elif topic == "06-ablation-and-export-parity" and language == "en":
                    text += r"""

The action mask is part of the evaluator contract: compare admissible choices after applying the same mask, and retain any proposal the broker rejects. This distinguishes numerical approximation from policy-path and authority failures."""
                elif topic == "05-evaluation-and-transfer" and language == "es":
                    text += r"""

Para evaluación emparejada, conserva estratos por familia y define el oráculo antes de inspeccionar resultados. Comparar puntajes no demuestra eficacia si no cambia una poscondición verificada. Informa por separado desarrollo y transferencia para evitar ajustar umbrales con la prueba."""
                if level == 2 and topic == "05-evaluation-and-transfer":
                    equation = r"$$\hat{\Delta}=\frac{1}{N}\sum_{i=1}^{N}(Y_{A,i}-Y_{B,i}),\qquad Y_i=\mathbb{1}[V(\tau_i)=1].$$" if language == "en" else r"$$\hat{\Delta}=\frac{1}{N}\sum_{i=1}^{N}(Y_{A,i}-Y_{B,i}),\qquad Y_i=\mathbb{1}[V(\tau_i)=1].$$"
                    distinct = r"$$R_{cell}=N_{variable\ outcomes}/N_{method-case-variant\ cells}.$$" if language == "en" else r"$$R_{celda}=N_{resultados\ variables}/N_{celdas\ método-caso-variante}.$$"
                    text += "\n\n" + equation + "\n\n" + distinct + "\n"
                notebook["cells"].insert(insert_at, {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True)})
                references = next((c for c in notebook["cells"] if c.get("cell_type") == "markdown" and _source(c).strip().startswith(("## References", "## Referencias"))), None)
                if references is not None:
                    body = _source(references).rstrip()
                    for source in content["extra_sources"]:
                        if source not in body:
                            body += f"\n- [{source}]({source})"
                    references["source"] = (body + "\n").splitlines(keepends=True)
                path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
                if existing is None:
                    changed_count += 1
            for level in (2, 3):
                path = root / "notebooks" / language / topic / (
                    "02-the-method-in-practice.ipynb" if level == 2 else "03-prior-methods-comparison.ipynb"
                )
                notebook = json.loads(path.read_text(encoding="utf-8"))
                code_marker = "# Input-perturbation sensitivity: verified completion versus latency tail."
                existing_plot = next((i for i,c in enumerate(notebook["cells"]) if c.get("cell_type") == "code" and code_marker in _source(c)), None)
                ids = {
                    "01-fast-event-control": ["M01", "M02"],
                    "02-learned-action-policies": ["M03", "M04"],
                    "03-sequential-control": ["M05", "M07"],
                    "04-deliberation-allocation": ["M10", "M12"],
                    "05-evaluation-and-transfer": ["M01", "M04"],
                    "06-ablation-and-export-parity": ["M11", "M12"],
                }[topic]
                case_id = {"01-fast-event-control": "C01", "02-learned-action-policies": "C05", "03-sequential-control": "C07", "04-deliberation-allocation": "C13", "05-evaluation-and-transfer": "C01", "06-ablation-and-export-parity": "C07"}[topic]
                heading = "### Sensitivity to input perturbations" if language == "en" else "### Sensibilidad a perturbaciones de entrada"
                explanations = {
                    "01-fast-event-control": ("For C01, a changed revision or delayed event is the perturbation; the paired success and decision-tail axes expose whether a fast rule remains safe as the observation becomes less current.", "En C01, el cambio de revisión o el evento retrasado es la perturbación; los ejes de éxito y cola muestran si la regla rápida conserva seguridad cuando la observación pierde vigencia."),
                    "02-learned-action-policies": ("For C05, the perturbation changes the retry context while the learned scorer and admissibility mask remain fixed; a score shift is not a verified HTTP effect.", "En C05, la perturbación cambia el contexto del reintento mientras el puntuador y la máscara quedan fijos; un cambio de puntaje no es un efecto HTTP verificado."),
                    "03-sequential-control": ("For C07, event timing is the stress variable; the decision-time tail excludes the asynchronous job's lifetime and the stop oracle distinguishes cancellation from natural completion.", "En C07, el tiempo de eventos es la variable de estrés; la cola excluye la duración del trabajo y el oráculo distingue cancelación de término natural."),
                    "04-deliberation-allocation": ("For C13, the deadline and planner response schedule define the perturbation; a delegation request counts as cost until a timely proposal changes the verified outcome.", "En C13, el plazo y calendario del planificador definen la perturbación; una solicitud es coste hasta que una propuesta oportuna cambia el resultado verificado."),
                    "05-evaluation-and-transfer": ("For C01, each variant is a separate stratum, not an independent population sample; the panel keeps denominators visible while exposing whether latency changes with the input condition.", "En C01, cada variante es un estrato separado, no una muestra poblacional independiente; el panel conserva denominadores y muestra cambios de latencia."),
                    "06-ablation-and-export-parity": ("For C07, the trace-level outcome plot is a task stress view, while native numeric parity remains a separate test over its declared input domain.", "En C07, el gráfico de resultados es una vista de estrés de tarea; la paridad numérica nativa sigue siendo una prueba separada de su dominio declarado."),
                }
                explanation = explanations[topic][0 if language == "en" else 1]
                md = {"cell_type": "markdown", "metadata": {}, "source": (heading + "\n\n" + explanation).splitlines(keepends=True)}
                code = f'''{code_marker}\nimport numpy as np\nidx = json.loads((ROOT / "data/derived/index.json").read_text(encoding="utf-8"))\nmethod_ids = {ids!r}\ncase_id = {case_id!r}\nvariants = sorted({{r["variant"] for r in idx["episodes"] if r["case_id"] == case_id}})\nfig, ax = plt.subplots(figsize=(9, 4.2), constrained_layout=True)\nax2 = ax.twinx()\nfor offset, method_id in enumerate(method_ids):\n    rates, tails = [], []\n    for variant in variants:\n        target = (case_id, method_id, variant)\n        rows = [r for r in idx["episodes"] if (r["case_id"], r["method_id"], r["variant"]) == target]\n        traces = [json.loads((ROOT / "data/derived" / r["path"]).read_text(encoding="utf-8")) for r in rows]\n        rates.append(float(np.mean([bool(e["metrics"]["task_success"]) for e in traces])))\n        tails.append(float(np.percentile([e["metrics"]["controller_ms"] for e in traces], 95)))\n    positions = np.arange(len(variants)) + (offset - 0.5) * 0.34\n    ax.bar(positions, rates, width=0.34, label=f"{{method_id}} success")\n    ax2.plot(np.arange(len(variants)), tails, marker="o", linestyle="--", label=f"{{method_id}} p95 decision ms")\nax.set_xticks(np.arange(len(variants)), variants, rotation=25, ha="right")\nax.set_ylim(0, 1.08)\nax.set_ylabel("Verified task completion fraction")\nax2.set_ylabel("Controller decision p95 (ms)")\nax.set_title(f"{{case_id}} input sensitivity: outcome and decision tail")\nax.legend(loc="upper left", fontsize=8)\nax2.legend(loc="upper right", fontsize=8)\nax.grid(axis="y", alpha=0.22)\nimage_buffer = BytesIO()\nfig.savefig(image_buffer, format="png", dpi=160)\ndisplay(Image(data=image_buffer.getvalue()))\nplt.close(fig)\n'''
                plot = {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": code.splitlines(keepends=True)}
                reads = {
                    "01-fast-event-control": ("C01 shows how each policy handles delayed events and revision conflicts. The completion bars use all indexed seeds within a variant; the line uses controller time only. The same final rate can arise through different guard and rejection paths, so inspect the episode trace before inferring equivalent safety.", "C01 muestra cómo cada política responde a eventos tardíos y conflictos de revisión. Las barras usan todas las semillas indexadas de cada variante; la línea mide solo tiempo del controlador. Una misma tasa final puede provenir de guardas distintas, por eso revisa el rastro antes de inferir seguridad equivalente."),
                    "02-learned-action-policies": ("C05 pairs the observed HTTP postcondition with the controller's decision tail under each response variant. A changed score is not plotted as success unless the retry produces the expected response. The aggregate cannot establish calibration; that requires disjoint labeled observations and a reliability analysis.", "C05 vincula la postcondición HTTP con la cola de decisión para cada variante. Un puntaje distinto no cuenta como éxito si el reintento no produce la respuesta esperada. El agregado no demuestra calibración: requiere observaciones etiquetadas independientes y análisis de confiabilidad."),
                    "03-sequential-control": ("C07 separates the verified stop condition from controller decision time. The plot excludes the process lifetime, so a short line does not mean that the job terminated quickly. Read each failed variant's ordered cancellation receipt and terminal event to classify the race.", "C07 separa la detención verificada del tiempo de decisión. El gráfico excluye la vida del proceso; una línea corta no significa que el trabajo terminó pronto. Lee el recibo de cancelación y evento terminal, en orden, para clasificar la carrera."),
                    "04-deliberation-allocation": ("C13's bars must be read with its deadline semantics: a proposal returned after the cutoff cannot improve task success. The latency tail is controller cost, not a utility estimate. To claim value, compare paired outcomes and costs under a preregistered threshold and retain unused or stale responses.", "Las barras de C13 deben leerse con su plazo: una propuesta tardía no mejora el éxito. La cola de latencia es coste del controlador, no utilidad. Para afirmar valor compara resultados y costes emparejados con umbral preinscrito y conserva respuestas obsoletas o no utilizadas."),
                    "05-evaluation-and-transfer": ("C01 is one stratum within the core matrix. The panel keeps each variant's denominator visible but does not replace paired estimates across all task families. Transfer compositions are excluded here and must be reported in their own lane.", "C01 es un estrato de la matriz central. El panel conserva el denominador por variante, pero no reemplaza estimaciones emparejadas de todas las familias. Las composiciones de transferencia se excluyen y deben informarse en su propio carril."),
                    "06-ablation-and-export-parity": ("C07 is used here as a stress slice for task outcomes and controller cost. It does not measure native scorer parity, whose error is calculated over declared input vectors. Do not infer that a component contributes because one variant changes, or that export is correct because an action succeeds.", "C07 se usa como estrés de resultados y coste del controlador. No mide paridad del puntuador nativo, cuyo error se calcula sobre vectores declarados. No infieras contribución por una variante ni exportación correcta porque una acción tuvo éxito."),
                }[topic][0 if language == "en" else 1]
                reads += (
                    f" In this level-{level} view of {case_id}, the paired axes describe only the indexed variants, not operational prevalence."
                    if language == "en" else
                    f" En esta vista de nivel {level} de {case_id}, los ejes emparejados describen las variantes indexadas, no la prevalencia operativa."
                )
                after = {"cell_type": "markdown", "metadata": {}, "source": reads.splitlines(keepends=True)}
                if existing_plot is not None:
                    notebook["cells"][existing_plot] = plot
                    notebook["cells"][existing_plot - 1] = md
                    if existing_plot + 1 < len(notebook["cells"]) and _source(notebook["cells"][existing_plot + 1]) == reads:
                        notebook["cells"][existing_plot + 1] = after
                    else:
                        notebook["cells"].insert(existing_plot + 1, after)
                    changed_count += 1
                    path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
                    continue
                anchor = next((i for i,c in enumerate(notebook["cells"]) if c.get("cell_type") == "markdown" and ("Controller latency by variant" in _source(c) or "Latencia del controlador por variante" in _source(c))), None)
                insertion = anchor + 2 if anchor is not None else len(notebook["cells"])
                notebook["cells"][insertion:insertion] = [md, plot, after]
                changed_count += 1
                path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
            path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for language, block in METACONTROL_L4.items():
        path = root / "notebooks" / language / "04-deliberation-allocation" / "04-resource-versioned-metacontrol.ipynb"
        notebook = json.loads(path.read_text(encoding="utf-8"))
        marker = "### Utility and resource versioning" if language == "en" else "### Utilidad y versionado de recursos"
        method_cell = next(c for c in notebook["cells"] if c.get("cell_type") == "markdown" and _source(c).startswith("## Method\n" if language == "en" else "## Método\n"))
        if marker not in _source(method_cell):
            method_cell["source"] = (_source(method_cell).rstrip() + "\n\n" + block + "\n").splitlines(keepends=True)
            changed_count += 1
        comparison_heading = "## Comparison" if language == "en" else "## Comparación"
        found = next((i for i,c in enumerate(notebook["cells"]) if c.get("cell_type") == "markdown" and comparison_heading in _source(c)), None)
        if found is not None:
            comparison_cell = notebook["cells"].pop(found)
        else:
            paragraph = "M12 is evaluated against the fixed asynchronous and guarded controllers on identical task outcomes. The comparison preserves failures, costs, and component ablations; it does not use a tier label as evidence." if language == "en" else "M12 se compara con controladores asíncronos y con guardas sobre resultados idénticos. La comparación conserva fallos, costes y ablaciones; una etiqueta metodológica no constituye evidencia."
            comparison_cell = {"cell_type": "markdown", "metadata": {}, "source": (comparison_heading + "\n\n" + paragraph + "\n").splitlines(keepends=True)}
            changed_count += 1
        comparison_cell["source"] = _source(comparison_cell).replace("## Comparison", "## Comparison").replace("## Comparaci\ufffdn", "## Comparación").splitlines(keepends=True)
        comparison_text = _source(comparison_cell)
        results_heading = "## Results" if language == "en" else "## Resultados"
        split_token = "\n" + results_heading
        result_cell = None
        if split_token in comparison_text:
            comparison_text, results_text = comparison_text.split(split_token, 1)
            result_cell = {"cell_type": "markdown", "metadata": {}, "source": (results_heading + results_text).splitlines(keepends=True)}
            comparison_cell["source"] = (comparison_text.rstrip() + "\n").splitlines(keepends=True)
        evidence_heading = "## Evidence" if language == "en" else "## Evidencia"
        notebook["cells"].insert(len(notebook["cells"]), comparison_cell)
        if result_cell is not None:
            notebook["cells"].append(result_cell)
        order = (
            ["Objectives", "Setup", "Data", "Method", "Comparison", "Evidence", "Results", "Summary", "References"]
            if language == "en" else
            ["Objetivos", "Preparación", "Datos", "Método", "Comparación", "Evidencia", "Resultados", "Resumen", "Referencias"]
        )
        rank = {name.casefold(): i for i, name in enumerate(order)}
        prefix: list[dict] = []
        groups: list[tuple[str, list[dict]]] = []
        current_name: str | None = None
        current: list[dict] = []
        for cell in notebook["cells"]:
            heading = next((line[3:].strip() for line in _source(cell).splitlines() if line.startswith("## ")), None) if cell.get("cell_type") == "markdown" else None
            if heading is not None:
                if current_name is not None:
                    groups.append((current_name, current))
                elif current:
                    prefix = current
                current_name, current = heading, [cell]
            elif current_name is None:
                current.append(cell)
            else:
                current.append(cell)
        if current_name is not None:
            groups.append((current_name, current))
        groups.sort(key=lambda item: rank.get(item[0].casefold(), len(rank)))
        notebook["cells"] = prefix + [cell for _, group in groups for cell in group]
        path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    topic_labels = {
        "01-fast-event-control": {"en": "guarded document actions", "es": "acciones documentales con guardas"},
        "02-learned-action-policies": {"en": "learned HTTP action scoring", "es": "puntuación aprendida de acciones HTTP"},
        "03-sequential-control": {"en": "asynchronous cancellation", "es": "cancelación asíncrona"},
        "04-deliberation-allocation": {"en": "bounded planner delegation", "es": "delegación acotada al planificador"},
        "05-evaluation-and-transfer": {"en": "core and transfer evaluation", "es": "evaluación central y de transferencia"},
        "06-ablation-and-export-parity": {"en": "component ablation and export parity", "es": "ablación de componentes y paridad de exportación"},
    }
    for language in ("en", "es"):
        for path in sorted((root / "notebooks" / language).rglob("*.ipynb")):
            notebook = json.loads(path.read_text(encoding="utf-8"))
            topic = path.parent.name
            label = topic_labels.get(topic, {}).get(language, topic)
            level = path.name[:2]
            i = 1
            while i < len(notebook["cells"]):
                previous, current = notebook["cells"][i - 1], notebook["cells"][i]
                if previous.get("cell_type") == "code" and current.get("cell_type") == "code":
                    explanation = (
                        f"This level-{level} {label} panel aggregates each indexed variant after the preceding matched-run summary. It lets readers compare the single executed case with the frozen distribution while keeping their denominators separate."
                        if language == "en" else
                        f"Este panel de nivel {level} sobre {label} agrega cada variante indexada después del resumen emparejado anterior. Permite comparar el caso ejecutado con la distribución congelada y conservar denominadores separados."
                    )
                    notebook["cells"].insert(i, {"cell_type": "markdown", "metadata": {}, "source": (explanation + "\n").splitlines(keepends=True)})
                    changed_count += 1
                    i += 1
                i += 1
            path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    figure_readers = {
        "01-fast-event-control": {
            "en": ("The bars report verified completion for each indexed C01 variant; they do not show how often revision conflicts occur in deployed workspaces. Compare a point with the exact denominator and inspect the corresponding receipt when admission differs.", "The timing curves summarize recorded controller decisions for this guarded document case. They exclude filesystem and user wait time, so use the event receipt and final file hash to interpret whether a fast decision actually completed the requested move."),
            "es": ("Las barras muestran finalización verificada por variante C01; no indican cuántos conflictos de revisión ocurren en espacios desplegados. Compara cada punto con su denominador e inspecciona el recibo cuando difiera la admisión.", "Las curvas resumen decisiones registradas para este caso documental con guardas. Excluyen espera del sistema y del usuario; interpreta junto al recibo del evento y hash final si la decisión completó el movimiento solicitado."),
        },
        "02-learned-action-policies": {
            "en": ("Each bar uses the independent HTTP postcondition for one indexed C05 variant. It does not treat a larger action score or a broker-accepted request as success; inspect the response and retry receipt before interpreting a changed outcome.", "The timing curves show controller decision time for the learned action policies, not network round-trip or server completion. Read this cost with the C05 postcondition panel and keep the fixed candidate mask in view when comparing variants."),
            "es": ("Cada barra usa la poscondición HTTP independiente de una variante C05. No considera exitoso un puntaje alto ni una solicitud admitida; revisa respuesta y recibo de reintento antes de interpretar cambios.", "Las curvas muestran tiempo de decisión del controlador aprendido, no ida y vuelta de red ni término del servidor. Lee este coste junto a las poscondiciones C05 y conserva visible la máscara de candidatas al comparar variantes."),
        },
        "03-sequential-control": {
            "en": ("A C07 bar is successful only when the independent oracle confirms cancellation; natural process exit is a separate outcome. Preserve the full variant denominator and inspect request receipt, terminal event, and deadline for every apparent policy difference.", "The plotted time is the policy's decision latency, not the duration of the asynchronous job. A controller can decide quickly while cancellation takes longer or loses the race, so pair this chart with verified terminal-state evidence."),
            "es": ("Una barra C07 solo cuenta si el oráculo independiente confirma cancelación; la salida natural es otro resultado. Conserva denominadores e inspecciona recibo, evento terminal y plazo ante diferencias.", "El tiempo graficado es latencia de decisión, no duración del trabajo asíncrono. El controlador puede decidir rápido mientras la cancelación tarda o pierde la carrera; acompaña esta figura con estado terminal verificado."),
        },
        "04-deliberation-allocation": {
            "en": ("The C13 completion bars count verified task outcomes by indexed deadline and response variant. They do not count planner requests as successes; a proposal must be timely, valid for the current resource revision, admitted, and confirmed by the independent postcondition.", "The latency distribution measures the controller's recorded decision cost; it is not the external planner's complete response delay or a utility estimate. Interpret it alongside deadline misses, invalidated proposals, and verified outcomes before judging delegation."),
            "es": ("Las barras C13 cuentan resultados verificados por plazo y respuesta indexados. No suman solicitudes como éxitos: la propuesta debe llegar a tiempo, corresponder a revisión vigente, admitirse y superar la poscondición independiente.", "La distribución mide coste de decisión registrado, no toda la demora del planificador externo ni utilidad. Interprétala con plazos vencidos, propuestas invalidadas y resultados verificados antes de juzgar delegación."),
        },
        "05-evaluation-and-transfer": {
            "en": ("Each plotted C01 condition is a stratum of the frozen core matrix, not an independent task population. Use the full report for method ranking and the separate transfer index for changed compositions; do not extrapolate this panel to unseen task families.", "Controller timing here is descriptive for this selected core slice. It is not uncertainty over task populations and cannot replace composition-level paired estimates; read its denominators with the benchmark-adequacy and transfer reports."),
            "es": ("Cada condición C01 es un estrato de la matriz central congelada, no una población independiente. Usa el informe completo para comparar métodos y el índice separado para transferencia; no extrapoles a familias inéditas.", "El tiempo es descriptivo para este estrato central. No representa incertidumbre poblacional ni reemplaza diferencias emparejadas por composición; lee denominadores junto a los informes de adecuación y transferencia."),
        },
        "06-ablation-and-export-parity": {
            "en": ("The C07 outcome plot is a task-stress slice and cannot establish that an ablated component contributes. Compare paired full and reduced configurations over the declared family; evaluate native score parity separately on its versioned vector domain.", "This timing view records controller cost under the selected C07 stress conditions. It cannot establish native export correctness, which requires score-error and action-agreement checks on boundary and near-tie vectors."),
            "es": ("El gráfico C07 es un estrato de estrés y no establece contribución de una ablación. Compara configuraciones completas y reducidas emparejadas; evalúa paridad nativa por separado sobre vectores versionados.", "Esta vista registra coste bajo condiciones C07 seleccionadas. No demuestra corrección de exportación nativa; se requieren error de puntaje y acuerdo de acción en vectores límite y casi empatados."),
        },
    }
    for language in ("en", "es"):
        for path in sorted((root / "notebooks" / language).rglob("*.ipynb")):
            notebook = json.loads(path.read_text(encoding="utf-8"))
            topic = path.parent.name
            if topic not in figure_readers:
                continue
            case = {"01-fast-event-control": "C01", "02-learned-action-policies": "C05", "03-sequential-control": "C07", "04-deliberation-allocation": "C13", "05-evaluation-and-transfer": "C01", "06-ablation-and-export-parity": "C07"}[topic]
            i = 0
            while i < len(notebook["cells"]):
                cell = notebook["cells"][i]
                if cell.get("cell_type") != "code":
                    i += 1
                    continue
                code = _source(cell)
                kind = "first" if "# Compare verified completion rates over every seed in each case variant." in code else None
                if "# Compare median and upper-tail controller time across" in code or "# Compare median and upper-tail controller time across all matched case variants." in code:
                    kind = "latency"
                if kind is None:
                    i += 1
                    continue
                following = notebook["cells"][i + 1] if i + 1 < len(notebook["cells"]) else None
                following_text = _source(following) if following and following.get("cell_type") == "markdown" else ""
                normalized_following = following_text.casefold()
                aligned = (
                    ("outcomes by variant" in normalized_following or "resultados registrados por variante" in normalized_following)
                    if kind == "first" else
                    ("controller latency by variant" in normalized_following or "latencia del controlador por variante" in normalized_following)
                )
                if not aligned or len(re.findall(r"\b[\w'-]+\b", following_text)) < 40:
                    detail = figure_readers[topic][language][0 if kind == "first" else 1]
                    level = path.name[:2]
                    contextual = (
                        f"For {case}, this level-{level} {topic.replace('-', ' ')} view: {detail}"
                        if language == "en" else
                        f"Para {case}, esta vista de nivel {level} sobre {topic.replace('-', ' ')}: {detail}"
                    )
                    notebook["cells"].insert(i + 1, {"cell_type": "markdown", "metadata": {}, "source": (contextual + "\n").splitlines(keepends=True)})
                    changed_count += 1
                    i += 1
                i += 1
            path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return changed_count


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    args = parser.parse_args()
    print(f"Updated {complete(Path(args.root).resolve())} topic-specific lesson blocks")
