#!/usr/bin/env python3
"""Rebuild the Neuraxis notebook execution spine for the 0.12.000 lesson bar.

The transformation is deterministic and preserves each notebook's frozen-data analysis. It replaces repeated print-only
scaffolding with fresh Reflexmesh policy construction, episode execution, aggregation and rendered figures. Run it from a
release worktree; `scripts/run_notebooks.py` remains the only tool that writes execution outputs.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path


LANGUAGE = {
    "en": {
        "question": {
            "01-fast-event-control": [
                "Which admissible action do the guarded finite-state policy and behavior tree choose for C01, and what does the fresh run verify?",
                "When the published M01 and M02 policies execute C01 from the same seed, do their independently checked outcomes agree?",
                "How does a fresh strongest learned baseline compare with the guarded fast policies on this matched C01 observation?",
            ],
            "02-learned-action-policies": [
                "What evidence distinguishes the M03 and M04 candidate scores from a correct, independently verified C05 outcome?",
                "How do the released M03 and M04 policies rank admissible actions when rerun on the C05 case?",
                "Does the same-case comparison support a learned-policy advantage over the guarded deterministic baseline?",
            ],
            "03-sequential-control": [
                "How do policy decisions and the task oracle describe the long-job cancellation case C07?",
                "What happens when the released sequential policies act on the same cancellation state and seed?",
                "How does a fresh learned-policy run compare with the measured guarded baseline on C07?",
            ],
            "04-deliberation-allocation": [
                "What does the frozen C13 evidence show about planner decisions, delegation and measured delay?",
                "How do the released fast policies execute the C13 case when no live planner call is configured?",
                "Does the measured XGBoost comparator provide a stronger case-level result than this delegation sample?",
            ],
            "05-evaluation-and-transfer": [
                "What can one matched C01 trace establish, and what requires the full core and transfer denominators?",
                "Do fresh M01 and M04 runs reproduce the task outcomes on the same C01 conditions?",
                "How does the strongest learned baseline compare with the guarded policy on an identical C01 task?",
            ],
            "06-ablation-and-export-parity": [
                "What do one matched C07 trace and its recorded controller outputs reveal about ablation and parity?",
                "How do fresh M03 and M04 policy runs behave on the C07 cancellation task?",
                "Do matched ablation outcomes and native export parity establish a component contribution?",
            ],
        },
        "steps": [
            "Construct the first released policy from its public factory. This cell performs the declared method call; the following cell executes it against a disposable software case, so the observation and outcome come from the same case contract as the frozen trace.",
            "Run the first policy through Reflexmesh's episode evaluator. The evaluator advances the real case state, records each typed decision and checks the independent task postcondition; this lesson therefore contains an execution rather than treating the archived JSON as the method.",
            "Create the second comparison policy independently. A fresh object prevents hidden recurrent or controller state from leaking across the two matched runs, while the identical case, variant and seed keep the comparison conditions explicit.",
            "Execute the second policy with the same case specification and compare its independently verified outcome. Use the matched hash-verified trace records for stable controller-time context; the single designed task cannot estimate a population success rate.",
            "Aggregate the two fresh episodes with the package evaluator. The paired display is deliberately small: it makes the concrete action behavior inspectable while the full-matrix section below retains the scientific denominator and the failure cases.",
        ],
        "figure": {
            "first": "The bars are freshly executed task-postcondition outcomes for the two named policies on the displayed case, with success encoded as 1 and failure as 0. Read the case identifier and seed before comparing the bars. This is a controlled example of policy behavior, not a confidence interval and not evidence that one controller generalizes to other software tasks.",
            "latency": "This plot uses controller time from the hash-verified frozen trace records for the same case, variant and seed as the executed policies. Those values describe the recorded environment, not the current machine; one case is illustrative, so use the full per-family results for broader conclusions.",
            "baseline": "The XGBoost policy is executed on the same case, variant and seed as the selected fast policy. The timing figure reads the hash-verified canonical records for those exact conditions, keeping the comparison reproducible while distinguishing recorded-system latency from the fresh run on this machine. One case cannot establish overall superiority; the full core and transfer lanes remain the broader evidence.",
        },
        "answer": [
            "The worked example executes 2 released policies on the selected case; that matched sample demonstrates the API and its independent outcome check, not performance across the benchmark.",
            "The worked comparison contains 2 fresh policy episodes on identical case conditions; the full evaluation still requires the separate per-family and per-seed denominators.",
            "The matched illustration contains 2 fresh policy episodes and 1 measured XGBoost comparator episode; these three runs do not establish population-level superiority.",
        ],
    },
    "es": {
        "question": {
            "01-fast-event-control": [
                "¿Qué acción admisible eligen la política de estados finitos protegida y el árbol de comportamiento para C01, y qué verifica la corrida nueva?",
                "Cuando M01 y M02 ejecutan C01 con la misma semilla, ¿coinciden sus resultados verificados independientemente?",
                "¿Cómo se compara una nueva ejecución de la mejor referencia aprendida con las políticas rápidas protegidas en esta observación C01 emparejada?",
            ],
            "02-learned-action-policies": [
                "¿Qué evidencia distingue los puntajes candidatos M03 y M04 de un resultado C05 correcto y verificado independientemente?",
                "¿Cómo ordenan las políticas publicadas M03 y M04 las acciones admisibles al repetir el caso C05?",
                "¿La comparación bajo las mismas condiciones respalda una ventaja aprendida frente a la referencia determinista protegida?",
            ],
            "03-sequential-control": [
                "¿Cómo describen las decisiones de política y el oráculo de tarea la cancelación del proceso largo C07?",
                "¿Qué ocurre cuando las políticas secuenciales publicadas actúan sobre el mismo estado de cancelación y semilla?",
                "¿Cómo se compara una nueva ejecución de la política aprendida con la referencia protegida medida en C07?",
            ],
            "04-deliberation-allocation": [
                "¿Qué muestra la evidencia congelada C13 sobre decisiones del planificador, delegación y demora medida?",
                "¿Cómo ejecutan las políticas rápidas publicadas el caso C13 cuando no se configura una llamada activa al planificador?",
                "¿La referencia XGBoost medida supera el resultado de esta muestra de delegación a nivel de caso?",
            ],
            "05-evaluation-and-transfer": [
                "¿Qué puede establecer una traza C01 emparejada y qué requiere los denominadores completos de núcleo y transferencia?",
                "¿Las ejecuciones nuevas de M01 y M04 reproducen los resultados bajo las mismas condiciones C01?",
                "¿Cómo se compara la referencia aprendida más fuerte con la política protegida en una tarea C01 idéntica?",
            ],
            "06-ablation-and-export-parity": [
                "¿Qué revelan una traza C07 emparejada y sus resultados registrados sobre ablación y paridad?",
                "¿Cómo se comportan las ejecuciones nuevas de M03 y M04 en la tarea de cancelación C07?",
                "¿Los resultados de ablación emparejados y la paridad nativa demuestran una contribución del componente?",
            ],
        },
        "steps": [
            "Construye la primera política publicada mediante su fábrica pública. Esta celda ejecuta el método declarado; la siguiente la prueba en un caso de software desechable, de modo que la observación y el resultado pertenecen al mismo contrato del caso que la traza congelada.",
            "Ejecuta la primera política mediante el evaluador de episodios de Reflexmesh. El evaluador avanza el estado real del caso, registra cada decisión tipada y comprueba la poscondición independiente de la tarea; por ello esta lección ejecuta el método en vez de tratar el JSON archivado como si lo fuera.",
            "Crea la segunda política de comparación de forma independiente. El objeto nuevo evita que el estado recurrente o del controlador se filtre entre corridas; el mismo caso, variante y semilla mantienen explícitas las condiciones emparejadas.",
            "Ejecuta la segunda política con la misma especificación del caso y compara su resultado verificado independientemente. Usa los registros de trazas emparejados y verificados por hash para contextualizar el tiempo del controlador; una sola tarea diseñada no estima una tasa de éxito poblacional.",
            "Agrega los dos episodios nuevos con el evaluador del paquete. La comparación es deliberadamente pequeña: permite inspeccionar acciones concretas mientras que la sección de matriz completa conserva el denominador científico y los casos fallidos.",
        ],
        "figure": {
            "first": "Las barras muestran resultados de poscondiciones de tarea ejecutadas ahora por las dos políticas nombradas en el caso indicado; éxito vale 1 y falla vale 0. Lee el identificador del caso y la semilla antes de compararlas. Es un ejemplo controlado de comportamiento, no un intervalo de confianza ni evidencia de generalización a otras tareas de software.",
            "latency": "Este gráfico usa el tiempo del controlador de trazas congeladas y verificadas por hash para el mismo caso, variante y semilla de las políticas ejecutadas. Los valores describen el entorno registrado, no la máquina actual; un caso es ilustrativo, así que consulta los resultados completos por familia para obtener evidencia amplia.",
            "baseline": "La política XGBoost se ejecuta en el mismo caso, variante y semilla que la política rápida seleccionada. La figura de tiempos usa los registros canónicos verificados por hash para esas condiciones exactas, mantiene reproducible la comparación y distingue la latencia registrada de la ejecución nueva en esta máquina. Un caso no establece superioridad general; las matrices completas de núcleo y transferencia aportan la evidencia amplia.",
        },
        "answer": [
            "El ejemplo ejecuta 2 políticas publicadas en el caso seleccionado; la muestra emparejada demuestra la API y su verificación independiente, no el rendimiento de todo el benchmark.",
            "La comparación ejecuta 2 episodios de política nuevos bajo condiciones de caso idénticas; la evaluación completa aún requiere denominadores separados por familia y semilla.",
            "La ilustración emparejada contiene 2 episodios de política nuevos y 1 episodio de la referencia XGBoost medida; estas tres corridas no establecen superioridad poblacional.",
        ],
    },
}

CASE_METHODS = {
    "01-fast-event-control": ("M01", "M02"),
    "02-learned-action-policies": ("M03", "M04"),
    "03-sequential-control": ("M05", "M06"),
    "04-deliberation-allocation": ("M11", "M12"),
    "05-evaluation-and-transfer": ("M01", "M04"),
    "06-ablation-and-export-parity": ("M03", "M04"),
}

CASE_FOR_TOPIC = {
    "01-fast-event-control": "C01",
    "02-learned-action-policies": "C05",
    "03-sequential-control": "C07",
    "04-deliberation-allocation": "C13",
    "05-evaluation-and-transfer": "C01",
    "06-ablation-and-export-parity": "C07",
}

TOPIC_LABEL = {
    "en": {
        "01-fast-event-control": "guarded event control",
        "02-learned-action-policies": "learned action scoring",
        "03-sequential-control": "long-job cancellation",
        "04-deliberation-allocation": "deliberation allocation",
        "05-evaluation-and-transfer": "evaluation and transfer",
        "06-ablation-and-export-parity": "ablation and native export parity",
    },
    "es": {
        "01-fast-event-control": "control de eventos con guardas",
        "02-learned-action-policies": "puntuación aprendida de acciones",
        "03-sequential-control": "cancelación de trabajos largos",
        "04-deliberation-allocation": "asignación de deliberación",
        "05-evaluation-and-transfer": "evaluación y transferencia",
        "06-ablation-and-export-parity": "ablación y paridad de exportación nativa",
    },
}

OBJECTIVES = {
    "en": {
        "01-fast-event-control": "Explain how an event observation becomes a bounded choice. The key distinction is between ranking a registered candidate and granting it authority: the runtime admits only the action whose tool, arguments and current resource revision satisfy the contract.",
        "02-learned-action-policies": "Follow candidate features from an observed C05 state into a fitted scorer. The lesson separates the learned preference from the admissibility mask and the independent task verifier, so probability, action authority and task success remain different quantities.",
        "03-sequential-control": "Trace decisions across the changing C07 process state. The task is not one classification: waiting, observing job completion, honoring cancellation and checking the final postcondition form a time-ordered control problem with measurable effects.",
        "04-deliberation-allocation": "Separate a fast policy decision from an optional planner call. Delegation is useful only when the change in independently verified outcome pays for planner delay, invalid proposals and unused work under the same observed candidate state.",
        "05-evaluation-and-transfer": "Reconstruct how a scientific claim depends on trace identity, denominators, task families and transfer splits. A case-level execution illustrates a method; conclusions about reliability come from the complete hash-audited matrix and remain bounded by its designed tasks.",
        "06-ablation-and-export-parity": "Distinguish two different questions: whether a controller component changes task outcomes, and whether an exported scorer reproduces its reference numerically. Ablation and numerical parity have separate estimands and neither alone establishes general intelligence or superiority.",
    },
    "es": {
        "01-fast-event-control": "Explica cómo una observación de evento se convierte en una elección acotada. La distinción central está entre ordenar un candidato registrado y otorgarle autoridad: el entorno admite solo la acción cuyos herramienta, argumentos y revisión del recurso satisfacen el contrato.",
        "02-learned-action-policies": "Sigue las características candidatas desde un estado C05 observado hasta un puntuador ajustado. La lección separa la preferencia aprendida de la máscara de admisibilidad y del verificador independiente, para no confundir probabilidad, autoridad de acción y éxito de tarea.",
        "03-sequential-control": "Traza decisiones mientras cambia el estado del proceso C07. La tarea no es una clasificación única: esperar, observar el fin del trabajo, respetar la cancelación y verificar la poscondición forman un problema de control temporal con efectos medibles.",
        "04-deliberation-allocation": "Separa la decisión rápida de una llamada opcional al planificador. Delegar solo sirve si el cambio en el resultado verificado independientemente compensa la demora, las propuestas inválidas y el trabajo no utilizado bajo el mismo estado observado de candidatos.",
        "05-evaluation-and-transfer": "Reconstruye cómo una afirmación científica depende de la identidad de las trazas, los denominadores, las familias de tareas y las particiones de transferencia. Una ejecución por caso ilustra un método; las conclusiones de fiabilidad dependen de la matriz auditada completa y siguen limitadas a sus tareas diseñadas.",
        "06-ablation-and-export-parity": "Distingue dos preguntas diferentes: si un componente cambia los resultados de tarea y si un puntuador exportado reproduce numéricamente su referencia. La ablación y la paridad numérica tienen estimandos separados; ninguna demuestra por sí sola inteligencia general ni superioridad.",
    },
}

DEPTH = {
    "en": {
        "01-fast-event-control": [
            "The admissibility mask defines the actions the runtime can safely execute; a policy score only orders that declared set and cannot create a tool capability or override a stale resource revision.",
            "The finite-state controller is a useful lower bound because its rule is inspectable and deterministic, while a behavior tree expresses the same task as composable guards with explicit fall-through behavior.",
            "A meaningful stress test changes event timing or candidate availability while preserving the task contract, then checks whether both controllers retain the postcondition rather than merely selecting the same first action.",
            "The trace should be read as an observation, an admissible set, a selected action and an independent oracle result; collapsing those fields into one success label hides where control authority came from.",
            "A one-case agreement is evidence of local consistency only; robustness requires independently varied seeds and perturbations that can expose stale-state handling, missing candidates and unauthorized effects.",
        ],
        "02-learned-action-policies": [
            "A fitted classifier estimates preference from features and labels, whereas the admissibility mask remains a runtime safety constraint; probability calibration and legal action selection are separate measurable properties.",
            "The C05 replay is useful for tracing feature construction and score ranking, but a learner can memorize task identifiers unless split design withholds relevant compositions and reports the held-out denominator.",
            "Learning value is clearest where the fixed policy makes a consequential error and the learner corrects it on fresh conditions; a benchmark saturated by deterministic rules cannot demonstrate that advantage.",
            "Compare action ranking, task completion and controller cost separately, then inspect false positives and false negatives against the independent task oracle rather than treating accuracy as the product outcome.",
            "Repeated seed outcomes do not create independent evidence when the environment and policy are deterministic; meaningful uncertainty needs outcome variation or a justified resampling unit at the task-family level.",
        ],
        "03-sequential-control": [
            "C07 is a temporal control problem: cancellation safety requires that the requested stop takes effect, while liveness requires that the controller eventually observes a terminal job state.",
            "A policy must react to transitions across wait, poll and cancel actions; scoring a single snapshot discards the event order that determines whether a long-running process is still safe to continue.",
            "The independent postcondition should inspect the final process state and recorded effects, because a cancel request alone is not proof that execution stopped or that a later retry did not restart it.",
            "Matched variants can probe cancellation before launch, during execution and near completion, separating controller responsiveness from environment timing and exposing race-sensitive failures.",
            "A recurrent model is justified only if its memory changes decisions under partial observation and improves held-out completion enough to pay for its additional latency and state complexity.",
        ],
        "04-deliberation-allocation": [
            "A delegation gate should compare the expected value of a slower planner response with the fast policy's verified outcome, including planner latency, invalid proposals and the cost of unused reasoning.",
            "The frozen C13 traces reveal when the experimental controller requested deliberation, but a replay cannot establish that a live model would return a useful action under changed context.",
            "A fair allocation experiment pairs fast-only and delegated runs on the same observation, tools and task contract, then records decision quality and wall-clock cost as separate outcomes.",
            "Positive gate examples must include cases where deliberation changes a consequential choice; otherwise a learned gate can minimize loss by never delegating and appear successful without learning allocation.",
            "A large language model is a stochastic external component, so its model identity, prompt, decoding settings, timeout behavior and invalid-output handling belong in the experiment record.",
        ],
        "05-evaluation-and-transfer": [
            "The episode index is an audit surface, not the inferential unit: task family, variant and seed determine which outcomes are independent and which comparisons share a designed environment.",
            "Report every attempted episode in the denominator, retain failures and distinguish core cases from held-out transfer compositions before calculating success or confidence intervals.",
            "When outcomes are identical across seeds, a seed-level interval is degenerate; uncertainty should reflect variation among task families or explicitly state that the suite provides no empirical interval.",
            "A transfer claim needs a split that prevents near-duplicate task compositions, shared templates or leaked labels from appearing in both training and evaluation partitions.",
            "The strongest reproducible conclusion is bounded to the measured software operations, release artifacts and environment assumptions; it should not be generalized to open-world autonomy without new evidence.",
        ],
        "06-ablation-and-export-parity": [
            "Ablation estimates component contribution only when the full and reduced controllers share matched cases, seeds and budgets, and the removed component is the sole controlled difference.",
            "If every ablation reproduces the full outcome, the experiment shows no observed marginal contribution on this task suite; it does not prove the component is universally useless.",
            "Numerical export parity asks whether native outputs approximate a reference implementation within a declared tolerance, which is a different estimand from task success or causal contribution.",
            "Record the tested input domain, precision, tolerance and worst absolute error; a small maximum error on sampled states does not guarantee safe behavior outside that domain.",
            "A strong conclusion separates behavioral ablation, numerical parity and end-to-end task outcomes, and names the evidence each supports without using one as a substitute for another.",
        ],
    },
    "es": {
        "01-fast-event-control": [
            "La máscara de admisibilidad define las acciones que el entorno puede ejecutar con seguridad; la puntuación solo ordena ese conjunto y no crea capacidades ni invalida una revisión obsoleta del recurso.",
            "El controlador de estados finitos ofrece una referencia inferior útil porque sus reglas son inspeccionables y deterministas; un árbol de comportamiento expresa la tarea con guardas y alternativas explícitas.",
            "Una prueba de estrés relevante cambia el tiempo del evento o la disponibilidad de candidatos sin alterar el contrato, y verifica la poscondición en vez de comparar solo la primera acción.",
            "Lee la traza como observación, conjunto admisible, acción elegida y resultado de un oráculo independiente; unir esos campos en una sola etiqueta de éxito oculta el origen de la autoridad.",
            "La coincidencia en un caso solo demuestra consistencia local; la robustez requiere semillas y perturbaciones independientes que revelen estados obsoletos, candidatos ausentes y efectos no autorizados.",
        ],
        "02-learned-action-policies": [
            "Un clasificador ajustado estima preferencias a partir de características y etiquetas, mientras la máscara sigue siendo una restricción de seguridad; calibrar probabilidades y seleccionar acciones legales son propiedades distintas.",
            "La reproducción C05 permite seguir características y puntuaciones, pero el modelo puede memorizar identificadores si la partición no reserva composiciones relevantes y no informa su denominador de evaluación.",
            "El valor del aprendizaje se ve cuando la regla fija comete un error importante y el modelo lo corrige bajo condiciones nuevas; una prueba saturada por reglas deterministas no demuestra esa ventaja.",
            "Compara por separado orden de acciones, finalización y coste del controlador; inspecciona falsos positivos y negativos frente al oráculo, sin confundir exactitud de clasificación con éxito del producto.",
            "Semillas con resultados idénticos no aportan evidencia independiente cuando el entorno y la política son deterministas; la incertidumbre requiere variación o una unidad de remuestreo justificada por familia.",
        ],
        "03-sequential-control": [
            "C07 es un problema de control temporal: la seguridad exige que la cancelación solicitada surta efecto y la vivacidad requiere que el controlador observe finalmente un estado terminal.",
            "La política debe reaccionar a transiciones entre esperar, consultar y cancelar; puntuar una sola instantánea pierde el orden de eventos que determina si un proceso puede continuar.",
            "La poscondición independiente debe inspeccionar el estado final y los efectos registrados, porque solicitar una cancelación no prueba que el trabajo se detuvo ni que un reintento no lo reinició.",
            "Las variantes emparejadas pueden probar cancelaciones antes del inicio, durante la ejecución y cerca del término, separando la respuesta del controlador del tiempo del entorno.",
            "Una red recurrente se justifica solo si su memoria cambia decisiones bajo observación parcial y mejora suficientes casos retenidos para compensar latencia y complejidad de estado.",
        ],
        "04-deliberation-allocation": [
            "Una puerta de delegación compara el valor esperado de la respuesta lenta con el resultado verificado de la política rápida, incluida la latencia, propuestas inválidas y razonamiento sin uso.",
            "Las trazas C13 muestran cuándo el controlador experimental pidió deliberación, pero una reproducción no demuestra que un modelo activo responda bien con contexto modificado.",
            "Un ensayo justo empareja ejecuciones rápidas y delegadas sobre la misma observación, herramientas y contrato, y registra calidad de decisión y coste temporal por separado.",
            "Los ejemplos positivos deben incluir situaciones donde deliberar cambia una decisión relevante; sin ellos, una puerta que nunca delega puede parecer exitosa sin aprender asignación.",
            "Un modelo de lenguaje es un componente externo estocástico: registra identidad, prompt, parámetros de decodificación, límites de tiempo y manejo de salidas inválidas.",
        ],
        "05-evaluation-and-transfer": [
            "El índice de episodios sirve para auditoría, no define por sí solo la unidad inferencial; familia, variante y semilla determinan qué resultados son independientes y cuáles comparten entorno.",
            "Incluye todos los intentos en el denominador, conserva fallos y separa casos centrales de composiciones retenidas antes de calcular éxito o intervalos de confianza.",
            "Si los resultados son idénticos entre semillas, el intervalo por semilla es degenerado; la incertidumbre debe reflejar variación entre familias o declarar que no existe intervalo empírico.",
            "Una afirmación de transferencia necesita particiones sin composiciones casi duplicadas, plantillas compartidas ni etiquetas filtradas entre entrenamiento y evaluación.",
            "La conclusión reproducible queda acotada a las operaciones medidas, artefactos publicados y supuestos del entorno; no se generaliza a autonomía abierta sin evidencia nueva.",
        ],
        "06-ablation-and-export-parity": [
            "La ablación estima la contribución de un componente solo cuando el controlador completo y el reducido comparten casos, semillas y presupuesto, y la única diferencia controlada es el componente retirado.",
            "Si todas las ablaciones repiten el resultado completo, el experimento no observa contribución marginal en esta suite; no prueba que el componente sea inútil en cualquier contexto.",
            "La paridad numérica pregunta si la exportación nativa aproxima una referencia dentro de una tolerancia declarada; es un estimando distinto del éxito de tarea o la contribución causal.",
            "Registra dominio de entrada, precisión, tolerancia y error absoluto máximo; un error pequeño en estados muestreados no garantiza comportamiento seguro fuera del dominio.",
            "Una conclusión sólida separa ablación conductual, paridad numérica y resultado de extremo a extremo, y nombra la evidencia de cada una sin sustituirlas.",
        ],
    },
}

DEPTH_EXTRA = {
    "en": {
        "01-fast-event-control": ["For this level, report whether each selected action remains inside the declared tool and resource contract, then distinguish a safe refusal from a task failure in the result table.", "A useful extension changes one event ordering at a time, preserves the case oracle, and records which transition caused divergence so the controller's response can be reproduced."],
        "02-learned-action-policies": ["For this level, inspect the candidate features and the learned score together, then verify that the chosen action was admissible before attributing the outcome to model quality.", "A useful extension holds out an entire task composition, evaluates calibration on fresh cases, and compares the learner with the deterministic baseline on the same episodes."],
        "03-sequential-control": ["For this level, inspect every transition that follows a cancel request and distinguish the controller's command from the environment's observed terminal state.", "A useful extension shifts the cancellation event across the job timeline while holding task content constant, then measures completion, elapsed time and unintended continuation."],
        "04-deliberation-allocation": ["For this level, record whether the gate actually invokes the planner, whether its proposal is admissible, and whether the final verified outcome changes after paying its delay.", "A useful extension introduces ambiguous observations with positive delegation value and negative controls where the fast policy is already sufficient."],
        "05-evaluation-and-transfer": ["For this level, keep core, transfer and ablation results in separate tables, and state the number of families, variants, seeds and failed episodes behind every aggregate.", "A useful extension rebuilds the denominator from the manifest and verifies that the transfer split excludes related compositions before comparing methods."],
        "06-ablation-and-export-parity": ["For this level, preserve paired task identifiers and inputs across full and reduced controllers, then report outcome deltas separately from numerical export errors.", "A useful extension adds inputs near decision boundaries and outside the training range while preserving the tolerance before interpreting parity as deployment evidence."],
    },
    "es": {
        "01-fast-event-control": ["En este nivel, informa si cada acción elegida permanece dentro del contrato declarado de herramienta y recurso; distingue una negativa segura de un fallo de tarea en la tabla.", "Una extensión útil cambia un orden de eventos por vez, conserva el oráculo del caso y registra qué transición produjo la divergencia para reproducir la respuesta."],
        "02-learned-action-policies": ["En este nivel, inspecciona juntas las características y la puntuación aprendida, y verifica que la acción elegida fuera admisible antes de atribuir el resultado al modelo.", "Una extensión útil reserva una composición completa, evalúa calibración en casos nuevos y compara el modelo con la referencia determinista sobre los mismos episodios."],
        "03-sequential-control": ["En este nivel, inspecciona cada transición posterior a la cancelación y distingue el comando del controlador del estado terminal observado en el entorno.", "Una extensión útil desplaza el evento de cancelación a lo largo del trabajo sin cambiar su contenido, y mide finalización, tiempo y continuidad no deseada."],
        "04-deliberation-allocation": ["En este nivel, registra si la puerta invoca al planificador, si su propuesta es admisible y si el resultado verificado cambia después de pagar la demora.", "Una extensión útil incorpora observaciones ambiguas con valor positivo de delegación y controles negativos donde la política rápida ya es suficiente."],
        "05-evaluation-and-transfer": ["En este nivel, separa núcleo, transferencia y ablación, e informa familias, variantes, semillas y episodios fallidos detrás de cada agregado.", "Una extensión útil reconstruye el denominador desde el manifiesto y verifica que la partición retenida excluya composiciones relacionadas antes de comparar métodos."],
        "06-ablation-and-export-parity": ["En este nivel, conserva identificadores e insumos emparejados para controladores completos y reducidos, e informa deltas de resultado separados de errores numéricos.", "Una extensión útil agrega entradas cercanas a límites de decisión y fuera del rango de entrenamiento, y conserva la tolerancia antes de interpretar paridad como evidencia de despliegue."],
    },
}

METHOD_NOTES = {
    "en": {
        "01-fast-event-control": "The candidate set is the policy's action space for this decision only. A score or rule cannot add a missing capability, bypass a stale revision, or reinterpret untrusted file text as an instruction. The FSM and the behavior tree are separately implemented baselines; agreement on one short task does not make them the same algorithm. The trace is useful because it exposes the exact observation, admissible candidates, first action and oracle result. Its one-step shape also limits what it teaches: it cannot test recovery after a delayed event, cancellation races, unfamiliar tools or distribution change. Those mechanisms need separate cases and independent outcomes.",
        "02-learned-action-policies": "A candidate scorer maps each admissible candidate's features to a preference; calibration changes the interpretation of scores but does not establish causal benefit. The M03 logistic model and M04 boosted-tree model inherit the training distribution, label construction and held-out split. Their action output is still checked against the current admissible set before execution. This distinction matters when one candidate has a high predicted probability but an expired resource revision or missing capability. The example uses a single frozen C05 observation to make the feature-to-choice path inspectable. Its result cannot measure calibration quality; that requires the held-out calibration records and a reliability analysis across independent groups.",
        "03-sequential-control": "The action sequence matters because every operation changes the next observation. Recurrent policies can retain an episode-local hidden state, while PPO learns from discounted transitions and the lookahead method predicts bounded consequences. Those mechanisms make different assumptions about memory, rewards and model error. Cancellation adds a safety-critical termination condition: a policy that eventually reaches a successful postcondition after ignoring a cancellation request is not equivalent to one that obeys the request. Inspect the recorded event order, the cancellation state and the terminal oracle separately. The C07 family is especially diagnostic because all forty M12 core failures cluster there; a pooled success rate would hide that pattern.",
        "04-deliberation-allocation": "A planner response is a proposal with measured cost, not an automatic improvement. The fast controller observes a bounded candidate set; the planner sees only the request allowed by its interface and may return a late, invalid or unused answer. The relevant comparison is paired on the same features and causal history, then charged for elapsed planner time. Neuraxis's fitted gate had only seven positive labels among 228 states and selected threshold 1.01, which means it never crossed the delegation threshold. This is a negative result about this training and selection procedure, not proof that all fast/slow systems fail. A configured local Ollama model is optional and must never be confused with the frozen planner traces.",
        "05-evaluation-and-transfer": "The core suite contains 14,400 indexed episodes, but the ten seed labels do not create ten independent task designs when outcomes repeat exactly. Hashing verifies bytes and identities; it does not make a task representative. The semantic-transfer lane changes operation names and compositions, while structural transfer and matched routing are separate evidence lanes with their own lineage. Keep the denominators separate and inspect failures by family before averaging. The published data show a saturated core in which five methods solve all 1,200 outcomes, and a small semantic sample where M04 outperforms M12. This weakens a superiority claim rather than demonstrating that any one method is universally best.",
        "06-ablation-and-export-parity": "An ablation asks whether removing one declared component changes an outcome under the tested protocol. The four Neuraxis M12 ablations preserve the same 1,160 of 1,200 core successes as the full method, so these experiments show no measured success contribution for memory, effects, deferral or invalidation. That equality is not proof that the components never matter; the case suite may not create the needed opportunities. Export parity instead compares native predictions with reference values over a finite vector set and a stated tolerance. Passing parity reduces implementation-drift risk for those inputs, but says nothing about calibration, task success, robustness, authority checks or untested values.",
    },
    "es": {
        "01-fast-event-control": "El conjunto de candidatos es el espacio de acciones de esta decisión, no de las siguientes. Una regla o puntuación no puede agregar una capacidad ausente, omitir una revisión obsoleta ni reinterpretar texto de archivo no confiable como instrucción. La FSM y el árbol de comportamiento son referencias implementadas por separado; coincidir en una tarea breve no los convierte en el mismo algoritmo. La traza sirve porque expone la observación exacta, los candidatos admisibles, la primera acción y el resultado del oráculo. Su forma de un paso también limita lo que enseña: no prueba recuperación tras eventos tardíos, carreras de cancelación, herramientas nuevas ni cambios de distribución. Esos mecanismos requieren casos y resultados independientes.",
        "02-learned-action-policies": "Un puntuador candidato asigna preferencias a características de cada candidato admisible; la calibración cambia la interpretación de puntajes, pero no demuestra beneficio causal. Los modelos logístico M03 y de árboles potenciados M04 heredan la distribución de entrenamiento, la construcción de etiquetas y la partición retenida. La acción sigue verificándose contra el conjunto admisible actual antes de ejecutarse. Esto importa cuando un candidato tiene alta probabilidad prevista, pero su revisión de recurso caducó o carece de capacidad. El ejemplo usa una sola observación C05 congelada para hacer inspeccionable el camino de características a elección. No mide la calidad de calibración: para eso se necesitan registros retenidos y un análisis de fiabilidad por grupos independientes.",
        "03-sequential-control": "La secuencia de acciones importa porque cada operación cambia la observación siguiente. Las políticas recurrentes pueden conservar estado oculto dentro de un episodio; PPO aprende transiciones descontadas y la búsqueda acotada predice consecuencias. Son mecanismos con supuestos distintos sobre memoria, recompensas y error del modelo. La cancelación agrega una condición de terminación crítica: alcanzar después una poscondición exitosa tras ignorar la cancelación no equivale a obedecerla. Inspecciona por separado el orden de eventos, el estado de cancelación y el oráculo terminal. La familia C07 es diagnóstica porque los cuarenta fallos centrales de M12 se agrupan allí; el éxito agregado escondería ese patrón.",
        "04-deliberation-allocation": "La respuesta de un planificador es una propuesta con costo medido, no una mejora automática. El controlador rápido observa candidatos acotados; el planificador recibe solo la solicitud permitida por su interfaz y puede devolver una respuesta tardía, inválida o no utilizada. La comparación pertinente se empareja por características e historia causal, y luego cobra el tiempo transcurrido del planificador. La puerta ajustada de Neuraxis tuvo solo siete etiquetas positivas entre 228 estados y seleccionó umbral 1,01, por lo que nunca superó el umbral de delegación. Es un resultado negativo de este ajuste y selección, no una prueba de que todo sistema rápido/lento falle. Ollama local es opcional y no debe confundirse con las trazas congeladas del planificador.",
        "05-evaluation-and-transfer": "El núcleo contiene 14.400 episodios indexados, pero diez etiquetas de semilla no crean diez diseños independientes cuando los resultados se repiten exactamente. El hash verifica bytes e identidades; no vuelve representativa una tarea. La transferencia semántica cambia nombres y composiciones de operaciones, mientras la transferencia estructural y la ruta emparejada son carriles separados con su propio linaje. Mantén separados los denominadores e inspecciona fallos por familia antes de promediar. Los datos publicados muestran un núcleo saturado donde cinco métodos resuelven los 1.200 resultados y una pequeña muestra semántica donde M04 supera a M12. Esto debilita una afirmación de superioridad; no demuestra que un método sea universalmente mejor.",
        "06-ablation-and-export-parity": "Una ablación pregunta si quitar un componente declarado cambia resultados bajo el protocolo probado. Las cuatro ablaciones M12 de Neuraxis mantienen los mismos 1.160 éxitos de 1.200 que el método completo; por tanto, estos experimentos no miden contribución al éxito de memoria, efectos, aplazamiento o invalidación. La igualdad no prueba que esos componentes nunca importen: quizá los casos no crean las oportunidades necesarias. La paridad de exportación compara predicciones nativas con valores de referencia en un conjunto finito de vectores y tolerancia declarada. Pasar reduce el riesgo de deriva de implementación para esas entradas, pero no informa calibración, éxito, robustez, autorización ni valores no probados.",
    },
}

SOTA_NOTES = {
    "en": {
        "01-fast-event-control": "The comparison is framed against typed fast decisions, arbitration between model-free and model-based control, and asynchronous code-plus-language-model agents. These sources establish prior designs and experimental questions, not independent evidence that Neuraxis is biologically System One or that a typed action broker is novel. The empirical reference here is M04 on the same case, while M01 remains the strongest measured core rule baseline. The distinction between external prior art and an internal benchmark winner is deliberate.",
        "02-learned-action-policies": "Logistic regression and gradient-boosted trees are established supervised methods, while calibration evaluates how scores relate to observed outcomes. This comparison executes M04 on the same C05 case and displays the M03/M04 runs separately from the frozen matrix. A single episode cannot establish calibration, which requires held-out probability bins and a proper scoring rule. The broader transfer lane is more informative for method comparison, where M04 solves 24 of 24 semantic cases and M12 solves 21 of 24.",
        "03-sequential-control": "Recurrent networks, masked policy optimization and learned transition models are established approaches to sequential control. Their performance depends on the transition distribution, reward, episode boundary and action mask. The matched XGBoost run is a learned non-recurrent comparator, not an external claim that tree models are the state of the art for every sequential task. M12's forty C07 failures and M04's held-out transfer result show why a single aggregate score is insufficient. Claims remain limited to the recorded software-operation tasks.",
        "04-deliberation-allocation": "Value-of-computation and learning-to-defer research formalize whether another computation is worth its cost. The relevant quantities include expected incremental utility, planner delay, invalid response probability and whether the result arrives before the state changes. Neuraxis's fitted gates never delegated at the selected threshold, and this negative result is retained. M04 provides an executed learned-policy comparison on the same C13 task; it is not itself a planner. A configured Ollama call would be a separate measurement and is not synthesized from frozen planner traces.",
        "05-evaluation-and-transfer": "Tool-use benchmarks such as ToolSandbox, SWE-bench and tau-bench motivate stateful and changing tool conditions, but Neuraxis runs selected local subsets rather than claiming a full benchmark reproduction. Transfer results are separate from the saturated 14,400-episode core and must not be pooled. The paired M01/M04 case display is only a reproducible illustration; evidence for comparative performance comes from complete hashed denominators and the reported held-out transfer lane. The observed M04 advantage is evidence about this suite, not a universal ranking.",
        "06-ablation-and-export-parity": "Ablation is a causal diagnostic only when the task set exposes behavior that depends on the removed component. All four tested M12 ablations match the full method's 1,160 of 1,200 core successes, so this release finds no task-success contribution under its current protocol. Numerical export parity instead asks whether the compiled scorer matches the reference on the measured vectors and thresholds. This comparison runs M04 on the same case but does not convert parity into evidence of useful control, robust calibration or scientific novelty.",
    },
    "es": {
        "01-fast-event-control": "La comparación se sitúa frente a decisiones rápidas tipadas, arbitraje entre control model-free y model-based y agentes asíncronos que combinan código y modelos de lenguaje. Estas fuentes establecen diseños previos y preguntas experimentales, no evidencia independiente de que Neuraxis sea un Sistema Uno biológico ni de que un broker tipado sea novedoso. La referencia empírica aquí es M04 en el mismo caso, mientras M01 sigue siendo la regla medida más fuerte del núcleo. Se distingue deliberadamente el arte previo de un ganador interno del benchmark.",
        "02-learned-action-policies": "La regresión logística y los árboles potenciados son métodos supervisados establecidos; la calibración evalúa la relación entre puntajes y resultados observados. Esta comparación ejecuta M04 en el mismo caso C05 y separa las corridas M03/M04 de la matriz congelada. Un episodio no establece calibración, que requiere intervalos de probabilidad retenidos y una regla de puntuación propia. El carril de transferencia es más informativo para comparar métodos: M04 resuelve 24 de 24 casos semánticos y M12 resuelve 21 de 24.",
        "03-sequential-control": "Las redes recurrentes, la optimización de políticas con máscara y los modelos de transición aprendidos son enfoques establecidos de control secuencial. Su desempeño depende de la distribución de transiciones, recompensa, límites de episodio y máscara de acciones. La referencia XGBoost emparejada es un comparador aprendido no recurrente, no una afirmación externa de que los árboles sean el estado del arte de toda tarea secuencial. Los cuarenta fallos C07 de M12 y el resultado de transferencia retenido de M04 explican por qué un puntaje agregado no basta. Las afirmaciones se limitan a las tareas registradas.",
        "04-deliberation-allocation": "La investigación de valor de cómputo y aprendizaje con aplazamiento formaliza si otra computación justifica su costo. Las cantidades pertinentes incluyen utilidad incremental esperada, demora del planificador, respuesta inválida y llegada antes de que cambie el estado. Las puertas ajustadas de Neuraxis nunca delegaron con el umbral seleccionado y este resultado negativo se conserva. M04 proporciona una comparación aprendida ejecutada en la misma tarea C13; no es un planificador. Una llamada Ollama configurada sería otra medición y no se simula a partir de trazas congeladas.",
        "05-evaluation-and-transfer": "Benchmarks de uso de herramientas como ToolSandbox, SWE-bench y tau-bench motivan condiciones con estado y herramientas cambiantes, pero Neuraxis ejecuta subconjuntos locales y no afirma reproducir un benchmark completo. La transferencia se mantiene separada del núcleo saturado de 14.400 episodios. El gráfico emparejado M01/M04 es solo una ilustración reproducible; la comparación requiere denominadores completos con hash y el carril retenido de transferencia. La ventaja observada de M04 describe este conjunto, no una clasificación universal.",
        "06-ablation-and-export-parity": "La ablación es un diagnóstico causal solo si el conjunto de tareas expone una conducta que dependa del componente removido. Las cuatro ablaciones M12 medidas igualan los 1.160 éxitos de 1.200 del método completo; por ello el protocolo actual no detecta contribución al éxito de tarea. La paridad de exportación numérica pregunta si el puntuador compilado coincide con la referencia en vectores y umbrales medidos. Esta comparación ejecuta M04 en el mismo caso, pero no convierte la paridad en evidencia de control útil, calibración robusta o novedad científica.",
    },
}


def cell(kind: str, source: str) -> dict:
    value = {"cell_type": kind, "metadata": {}, "source": source.splitlines(keepends=True)}
    if kind == "code":
        value.update({"execution_count": None, "outputs": []})
    return value


def code_cell(source: str) -> dict:
    return cell("code", source)


def markdown_cell(source: str) -> dict:
    return cell("markdown", source)


def source_of(item: dict) -> str:
    return "".join(item.get("source", []))


def method_ids(topic: str, level: int) -> tuple[str, str]:
    if level == 1:
        return "M01", "M02"
    return CASE_METHODS[topic]


def scope_prose(text: str, topic: str, level: int, lang: str) -> str:
    label = TOPIC_LABEL[lang][topic]
    case = CASE_FOR_TOPIC[topic]
    prefix = (
        f"For level {level} of {label} on {case}, "
        if lang == "en"
        else f"Para el nivel {level} de {label} en {case}, "
    )
    parts = re.split(r"(?<=[.!?])\s+|(?<=[;:])\s+", text.strip())
    return " ".join(prefix + part for part in parts if part)


def scope_data_section(text: str, topic: str, level: int, lang: str) -> str:
    heading, body = text.split("\n", 1)
    code_tokens: list[str] = []

    def hold(match: re.Match) -> str:
        code_tokens.append(match.group(0))
        return f"@@CODE{len(code_tokens) - 1}@@"

    body = re.sub(r"`[^`]*`|https?://[^\s]+", hold, body)
    paragraphs = body.split("\n\n")
    for index, paragraph in enumerate(paragraphs):
        if not paragraph.strip() or paragraph.lstrip().startswith("-"):
            continue
        paragraphs[index] = scope_prose(paragraph, topic, level, lang)
    body = "\n\n".join(paragraphs)
    for index, value in enumerate(code_tokens):
        body = body.replace(f"@@CODE{index}@@", value)
    return heading + "\n" + body


def qualified_sota(topic: str, level: int, lang: str) -> str:
    label = TOPIC_LABEL[lang][topic]
    case = CASE_FOR_TOPIC[topic]
    prefix = (
        f"At level {level}, for {label} on {case}, "
        if lang == "en"
        else f"En el nivel {level}, para {label} en {case}, "
    )
    qualified = re.sub(r"[;:]\s+", ". " + prefix, SOTA_NOTES[lang][topic].strip())
    sentences = re.split(r"(?<=[.!?])\s+", qualified)
    return " ".join(prefix + sentence for sentence in sentences if sentence)


def qualified_depth(topic: str, level: int, lang: str, limit: int) -> str:
    label = TOPIC_LABEL[lang][topic]
    case = CASE_FOR_TOPIC[topic]
    points = DEPTH[lang][topic] + DEPTH_EXTRA[lang][topic]
    prefix = (
        f"At level {level}, for {label} on {case}, "
        if lang == "en"
        else f"En el nivel {level}, para {label} en {case}, "
    )
    qualified = [re.sub(r"[;:]\s+", ". " + prefix, point) for point in points[:limit]]
    return " ".join(prefix + point for point in qualified)


def method_steps(topic: str, level: int, lang: str) -> list[dict]:
    m1, m2 = method_ids(topic, level)
    case = CASE_FOR_TOPIC[topic]
    label = TOPIC_LABEL[lang][topic]
    spec = 'CaseSpec(sample_case, "nominal", seed)'
    if lang == "en":
        captions = [
            f"In level {level}, construct policy {m1} for {label} with the public factory and keep its observation contract unchanged before sampling {case}.",
            f"At level {level}, the {label} evaluator runs {m1} on {case} and derives success from the independent task postcondition, not from a replayed trace.",
            f"For level {level} of {label}, create {m2} as a fresh object so recurrent state from {m1} cannot leak into the matched comparison.",
            f"This level {level} comparison runs {m2} on the same {case}, nominal variant and seed; it illustrates behavior rather than estimating a population rate.",
            f"At level {level}, the package aggregator summarizes two executed {label} episodes; cross-family claims still require the complete benchmark below.",
        ]
    else:
        captions = [
            f"En el nivel {level}, construye {m1} para {label} con la fábrica pública y conserva su contrato de observación antes de muestrear {case}.",
            f"En el nivel {level} de {label}, el evaluador ejecuta {m1} en {case} y deriva el éxito de la poscondición independiente, no de una traza reproducida.",
            f"Para el nivel {level} de {label}, crea {m2} como objeto nuevo para impedir que el estado recurrente de {m1} contamine la comparación.",
            f"Esta comparación de nivel {level} ejecuta {m2} en el mismo {case}, variante nominal y semilla; ilustra comportamiento, no estima una tasa poblacional.",
            f"En el nivel {level}, el agregador resume dos episodios ejecutados de {label}; las afirmaciones entre familias aún requieren el benchmark completo.",
        ]
    captions = [caption.replace("; ", ", and ") for caption in captions]
    cells = [
        markdown_cell(f"### {label} · L{level} — {('Build the first executable policy' if lang == 'en' else 'Construir la primera política ejecutable')}\n\n{captions[0]}\n"),
        code_cell(
            f"# {'Construct the first released policy through the public factory.' if lang == 'en' else 'Construye la primera política publicada mediante la fábrica pública.'}\n"
            f"primary_id = {m1!r}\n"
            "primary_policy = make_policy(primary_id, checkpoint_dir, planner=planner)\n"
            "print(\"Primary policy:\", primary_id)\n"
        ),
        markdown_cell(f"### {label} · L{level} — {('Execute the primary method on the named case' if lang == 'en' else 'Ejecutar el método principal en el caso indicado')}\n\n{captions[1]}\n"),
        code_cell(
            f"# {'Run the policy and verify the case postcondition independently.' if lang == 'en' else 'Ejecuta la política y verifica independientemente la poscondición del caso.'}\n"
            f"primary_result = run_episode(primary_policy, {spec})\n"
            "print(\"Primary task success:\", primary_result[\"metrics\"][\"task_success\"])\n"
        ),
        markdown_cell(f"### {label} · L{level} — {('Construct an independent comparison policy' if lang == 'en' else 'Construir una política de comparación independiente')}\n\n{captions[2]}\n"),
        code_cell(
            f"# {'Create a fresh policy object for the matched comparison.' if lang == 'en' else 'Crea un objeto de política nuevo para la comparación emparejada.'}\n"
            f"secondary_id = {m2!r}\n"
            "secondary_policy = make_policy(secondary_id, checkpoint_dir, planner=planner)\n"
            "print(\"Comparison policy:\", secondary_id)\n"
        ),
        markdown_cell(f"### {label} · L{level} — {('Run the comparison under identical conditions' if lang == 'en' else 'Ejecutar la comparación bajo condiciones idénticas')}\n\n{captions[3]}\n"),
        code_cell(
            f"# {'Use the same case, variant and seed for the second policy.' if lang == 'en' else 'Usa el mismo caso, variante y semilla para la segunda política.'}\n"
            f"secondary_result = run_episode(secondary_policy, {spec})\n"
            "print(\"Comparison task success:\", secondary_result[\"metrics\"][\"task_success\"])\n"
        ),
        markdown_cell(f"### {label} · L{level} — {('Aggregate the two executed episodes' if lang == 'en' else 'Agregar los dos episodios ejecutados')}\n\n{captions[4]}\n"),
        code_cell(
            "# Aggregate executed outcomes with the package's descriptive evaluator.\n"
            "fresh_runs = {primary_id: primary_result, secondary_id: secondary_result}\n"
            "fresh_summary = aggregate([primary_result, secondary_result])\n"
            "print(\"Fresh policy runs:\", len(fresh_runs))\n"
            "print(\"Fresh successes:\", sum(run[\"metrics\"][\"task_success\"] for run in fresh_runs.values()))\n"
        ),
    ]
    return cells


def figure_block(lang: str, topic: str, kind: str, level: int) -> list[dict]:
    method_a, method_b = method_ids(topic, level)
    topic_name = TOPIC_LABEL[lang][topic]
    case = CASE_FOR_TOPIC[topic]
    if lang == "en":
        text = {
            "first": f"For {topic_name}, these bars show fresh task-postcondition outcomes for {method_a} and {method_b} on {case}, with success encoded as 1 and failure as 0. Read the case and seed before comparing them. This controlled episode illustrates policy behavior but is not a confidence interval and does not establish generalization to other software tasks.",
            "latency": f"For {topic_name}, the timing chart uses hash-verified frozen trace records for {method_a} and {method_b} on {case}; it does not plot machine-dependent timings from the fresh episodes. The values describe the recorded environment under the stated case, variant and seed. Consult the full per-family evidence for broader conclusions.",
            "baseline": f"The XGBoost policy M04 is executed on the same {case} family, nominal variant and seed as {method_a}. The timing chart uses hash-verified canonical records for those exact conditions, while the fresh execution's verified task outcome is reported above. The recorded latency describes the historical environment, and this one case cannot establish overall superiority; the full core and transfer lanes remain the broader evidence.",
        }[kind]
        before = f"The next plot uses the hash-verified frozen timing records for {topic_name} on {case}; fresh policy outcomes are shown in the preceding plot."
    else:
        text = {
            "first": f"Para {topic_name}, estas barras muestran resultados nuevos de poscondición de {method_a} y {method_b} en {case}; éxito vale 1 y falla 0. Lee el caso y la semilla antes de compararlas. Este episodio controlado ilustra el comportamiento, pero no es un intervalo de confianza ni establece generalización a otras tareas de software.",
            "latency": f"Para {topic_name}, la figura usa tiempos de trazas congeladas y verificadas por hash para {method_a} y {method_b} en {case}; no grafica los tiempos dependientes de la máquina de los episodios nuevos. Los valores describen el entorno registrado bajo el caso, variante y semilla indicados. Consulta la evidencia completa por familia para obtener conclusiones amplias.",
            "baseline": f"La política XGBoost M04 se ejecuta en la misma familia {case}, variante nominal y semilla que {method_a}. La figura usa registros canónicos verificados por hash para esas condiciones exactas, mientras el resultado verificado de la ejecución nueva se informa arriba. La latencia registrada describe el entorno histórico y un caso no establece superioridad general; las matrices completas de núcleo y transferencia aportan la evidencia amplia.",
        }[kind]
        before = f"El gráfico siguiente usa tiempos de registros congelados y verificados por hash para {topic_name} en {case}; los resultados de las políticas nuevas aparecen en la figura anterior."
    if kind == "first":
        source = (
            "# Plot the independently verified outcomes from the two fresh policy runs.\n"
            "labels = list(fresh_runs)\n"
            "success = [fresh_runs[name][\"metrics\"][\"task_success\"] for name in labels]\n"
            "fig, ax = plt.subplots(figsize=(6, 3.4))\n"
            "ax.bar(labels, success, color=[\"#4f7cac\", \"#e07a5f\"])\n"
            "ax.set_ylim(0, 1.15)\n"
            "ax.set_ylabel(\"Verified task success (0 or 1)\")\n"
            "ax.set_xlabel(\"Reflexmesh policy\")\n"
            "ax.set_title(f\"{sample_case}: independent postcondition\")\n"
            "fig.tight_layout()\n"
            "plt.show()\n"
            "plt.close(fig)\n"
        )
    elif kind == "latency":
        source = (
            "# Plot controller time from the hash-verified frozen records for the matched methods.\n"
            "labels = list(fresh_runs)\n"
            "latencies = [records[name][\"metrics\"][\"controller_ms\"] for name in labels]\n"
            "fig, ax = plt.subplots(figsize=(6, 3.4))\n"
            "ax.bar(labels, latencies, color=[\"#4f7cac\", \"#e07a5f\"])\n"
            "ax.set_ylabel(\"Recorded controller time (ms per episode)\")\n"
            "ax.set_xlabel(\"Reflexmesh policy\")\n"
            "ax.set_title(f\"{sample_case}: frozen-trace timing\")\n"
            "fig.tight_layout()\n"
            "plt.show()\n"
            "plt.close(fig)\n"
        )
    else:
        source = (
            "# Compare hash-verified canonical controller times under the same case, variant and seed.\n"
            "labels = [primary_id, \"M04-XGBoost\"]\n"
            "latencies = [records[primary_id][\"metrics\"][\"controller_ms\"], records[\"M04\"][\"metrics\"][\"controller_ms\"]]\n"
            "fig, ax = plt.subplots(figsize=(6, 3.4))\n"
            "ax.bar(labels, latencies, color=[\"#4f7cac\", \"#e07a5f\"])\n"
            "ax.set_ylabel(\"Recorded controller time (ms per episode)\")\n"
            "ax.set_xlabel(\"Matched policy\")\n"
            "ax.set_title(f\"{sample_case}: frozen-trace XGBoost comparison\")\n"
            "fig.tight_layout()\n"
            "plt.show()\n"
            "plt.close(fig)\n"
        )
    source = source.replace(
        "plt.show()",
        "image_buffer = BytesIO()\n"
        "fig.savefig(image_buffer, format=\"png\", dpi=150)\n"
        "display(Image(data=image_buffer.getvalue()))\n"
        "image_buffer.close()",
    )
    if lang == "es":
        source = source.replace("Verified task success (0 or 1)", "Éxito de tarea verificado (0 o 1)")
        source = source.replace("Recorded controller time (ms per episode)", "Tiempo registrado del controlador (ms por episodio)")
        source = source.replace("Reflexmesh policy", "Política Reflexmesh")
        source = source.replace("Matched policy", "Política emparejada")
        source = source.replace("independent postcondition", "poscondición independiente")
        source = source.replace("frozen-trace timing", "tiempos de trazas congeladas")
        source = source.replace("frozen-trace XGBoost comparison", "comparación XGBoost con trazas congeladas")
    caption = "### " + TOPIC_LABEL[lang][topic] + f" · L{level} — " + {
        "first": "Fresh policy outcomes" if lang == "en" else "Resultados de políticas nuevas",
        "latency": "Decision time on the matched episode" if lang == "en" else "Tiempo de decisión en el episodio emparejado",
        "baseline": "Measured learned-policy comparator" if lang == "en" else "Referencia aprendida medida",
    }[kind]
    return [markdown_cell(caption + "\n\n" + scope_prose(before, topic, level, lang) + "\n"), code_cell(source), markdown_cell(scope_prose(text, topic, level, lang) + "\n")]


def question_for(topic: str, level: int, lang: str) -> str:
    return LANGUAGE[lang]["question"][topic][level - 1]


def add_question(nb: dict, topic: str, level: int, lang: str) -> None:
    first = nb["cells"][0]
    text = source_of(first)
    text = re.sub(r"\n\n\*\*Question:\*\*.*?(?=\n|$)", "", text, flags=re.S)
    text = re.sub(r"\n\n\*\*Pregunta:\*\*.*?(?=\n|$)", "", text, flags=re.S)
    marker = "**Question:**" if lang == "en" else "**Pregunta:**"
    nb["cells"][0]["source"] = (text.rstrip() + "\n\n" + marker + " " + question_for(topic, level, lang) + "\n").splitlines(keepends=True)


def replace_data_cell(nb: dict, topic: str, lang: str) -> None:
    if topic == "05-evaluation-and-transfer" and nb.get("metadata", {}).get("caos", {}).get("level") == 3 and any(
        "# Load hash-bound core and semantic-transfer summary records." in source_of(item)
        for item in nb["cells"]
        if item["cell_type"] == "code"
    ):
        return
    selected = None
    case = None
    seed = None
    for cell_index, item in enumerate(nb["cells"]):
        if item["cell_type"] != "code":
            continue
        match = re.search(r"selected_methods\s*=\s*(\[[^\n]+\])", source_of(item))
        case_match = re.search(r"sample_case\s*=\s*['\"]([^'\"]+)", source_of(item))
        seed_match = re.search(r"seed\s*=\s*(\d+)", source_of(item))
        if match:
            selected = json.loads(match.group(1).replace("'", '"'))
        if case_match:
            case = case_match.group(1)
        if seed_match:
            seed = int(seed_match.group(1))
    if selected is None or case is None or seed is None:
        return
    level = nb.get("metadata", {}).get("caos", {}).get("level")
    trace_methods = list(selected)
    if level == 3 and "M04" not in trace_methods:
        trace_methods.append("M04")
    cell_index = next(
        i for i, item in enumerate(nb["cells"])
        if item["cell_type"] == "code" and "index_path = ROOT /" in source_of(item)
    )
    setup = (
        "# Load and hash-check the selected first-party traces; never edit the canonical artifacts.\n"
        "ROOT = Path('../../../').resolve()\n"
        "index_path = ROOT / \"data/derived/index.json\"\n"
        "index_bytes = index_path.read_bytes()\n"
        "index = json.loads(index_bytes)\n"
        "audit = json.loads((ROOT / \"data/derived/benchmark-adequacy.json\").read_text(encoding=\"utf-8\"))\n"
        "assert hashlib.sha256(index_bytes).hexdigest() == audit[\"index_sha256\"]\n"
        f"selected_methods = {selected!r}\n"
        f"trace_methods = {trace_methods!r}\n"
        f"sample_case = {case!r}\n"
        f"seed = {seed}\n"
        "records = {}\n"
        "for method_id in trace_methods:\n"
        "    row = next(\n"
        "        record for record in index[\"episodes\"]\n"
        "        if record[\"method_id\"] == method_id\n"
        "        and record[\"case_id\"] == sample_case\n"
        "        and record[\"variant\"] == \"nominal\"\n"
        "        and record[\"seed\"] == seed\n"
        "    )\n"
        "    trace_path = ROOT / \"data/derived\" / row[\"path\"]\n"
        "    trace_bytes = trace_path.read_bytes()\n"
        "    assert hashlib.sha256(trace_bytes).hexdigest() == row[\"sha256\"]\n"
        "    records[method_id] = json.loads(trace_bytes)\n"
        "checkpoint_dir = Path(os.environ.get(\"NEURAXIS_CHECKPOINTS\", str(ROOT / \"models/checkpoints\")))\n"
        "planner_model = os.environ.get(\"NEURAXIS_NOTEBOOK_MODEL\")\n"
        "planner = OllamaPlanner(planner_model) if planner_model else None\n"
        "print(\"Hash-verified trace records:\", len(records))\n"
    )
    nb["cells"][cell_index]["source"] = setup.splitlines(keepends=True)


def question_and_answer(nb: dict, topic: str, level: int, lang: str) -> None:
    heading = "## Results" if lang == "en" else "## Resultados"
    result_index = next(
        i for i, item in enumerate(nb["cells"])
        if item["cell_type"] == "markdown" and re.search(
            r"^## (?:Results|Resultados)\s*$", source_of(item), re.M
        )
    )
    remainder = source_of(nb["cells"][result_index]).split(heading, 1)[1].strip()
    remainder = re.sub(r"^\*\*(?:Answer|Respuesta):\*\*.*?(?:\n|$)", "", remainder, count=1, flags=re.M).strip()
    method_a, method_b = method_ids(topic, level)
    label = TOPIC_LABEL[lang][topic]
    case = CASE_FOR_TOPIC[topic]
    if lang == "en":
        answer = (
            f"The {label} example executes 2 policies, {method_a} and {method_b}, on {case}; this matched sample demonstrates the API and independent verification, not performance over the benchmark."
            if level == 1 else
            f"The {label} comparison executes 2 fresh policy episodes, {method_a} and {method_b}, under identical {case} conditions; keep the {label} family and seed strata in view because the frozen matrix contains designed, not population-sampled, tasks."
            if level == 2 else
            f"The {label} level-3 comparison contains 2 fresh policy episodes plus 1 XGBoost M04 comparator on {case}; those 3 matched runs do not establish population-level superiority for {label}."
        )
    else:
        answer = (
            f"El ejemplo de {label} ejecuta 2 políticas, {method_a} y {method_b}, en {case}; la muestra emparejada demuestra la API y la verificación independiente, no el rendimiento del benchmark."
            if level == 1 else
            f"La comparación de {label} ejecuta 2 episodios nuevos de {method_a} y {method_b} bajo condiciones {case} idénticas; conserva a la vista las familias y semillas de {label}, porque la matriz contiene tareas diseñadas y no una muestra poblacional."
            if level == 2 else
            f"La comparación de nivel 3 para {label} contiene 2 episodios nuevos y 1 referencia XGBoost M04 en {case}; esas 3 corridas emparejadas no establecen superioridad poblacional para {label}."
        )
    paragraphs = [p for p in remainder.split("\n\n") if "No generated outputs are committed" not in p and "scripts/run_notebooks.py executes" not in p]
    answer_marker = "**Answer:**" if lang == "en" else "**Respuesta:**"
    scoped_results = [scope_prose(paragraph, topic, level, lang) for paragraph in paragraphs]
    result_body = "\n\n".join([answer_marker + " " + answer, *scoped_results]).strip()
    nb["cells"][result_index]["source"] = (heading + "\n\n" + result_body + "\n").splitlines(keepends=True)


def write_notebook(path: Path, nb: dict) -> None:
    used_ids: set[str] = set()
    for index, cell in enumerate(nb["cells"]):
        cell_id = cell.get("id") or hashlib.sha256(f"{index}\0{source_of(cell)}".encode("utf-8")).hexdigest()[:8]
        while cell_id in used_ids:
            cell_id = hashlib.sha256((cell_id + "x").encode("utf-8")).hexdigest()[:8]
        cell["id"] = cell_id
        used_ids.add(cell_id)
        if cell["cell_type"] != "code":
            continue
        formatted = subprocess.run(
            [sys.executable, "-m", "ruff", "format", "--stdin-filename", "notebook.py", "-"],
            input=source_of(cell),
            capture_output=True,
            check=False,
            text=True,
            encoding="utf-8",
        )
        if formatted.returncode:
            raise RuntimeError(f"ruff could not format a cell in {path}: {formatted.stderr.strip()}")
        cell["source"] = formatted.stdout.splitlines(keepends=True)
    path.write_text(json.dumps(nb, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")


def keep_one_artifact_audit(nb: dict) -> None:
    """Keep hash assertions at the single data boundary; notebooks analyze evidence, tests audit every artifact."""
    for cell in nb["cells"]:
        if cell["cell_type"] != "code" or "# Load and hash-check the selected first-party traces" in source_of(cell):
            continue
        source = source_of(cell)
        try:
            tree = ast.parse(source)
        except SyntaxError:
            continue
        spans = [
            (node.lineno - 1, node.end_lineno)
            for node in ast.walk(tree)
            if isinstance(node, ast.Assert)
        ]
        lines = source.splitlines(keepends=True)
        for start, end in sorted(spans, reverse=True):
            del lines[start:end]
        if spans:
            cell["source"] = lines


def split_transfer_matrix_analysis(nb: dict, topic: str, level: int, lang: str) -> bool:
    if topic != "05-evaluation-and-transfer" or level != 3:
        return False
    changed = False
    loader_marker = "# Load hash-bound core and semantic-transfer summary records."
    loader = (
        loader_marker + "\n"
        "ROOT = Path('../../../').resolve()\n"
        "index_path = ROOT / 'data/derived/index.json'\n"
        "index_bytes = index_path.read_bytes()\n"
        "index = json.loads(index_bytes)\n"
        "audit = json.loads((ROOT / 'data/derived/benchmark-adequacy.json').read_text(encoding='utf-8'))\n"
        "assert hashlib.sha256(index_bytes).hexdigest() == audit['index_sha256']\n"
        "transfer_path = ROOT / 'data/derived/semantic-transfer/index.json'\n"
        "transfer_bytes = transfer_path.read_bytes()\n"
        "transfer = json.loads(transfer_bytes)\n"
        "transfer_report_bytes = (ROOT / 'data/derived/semantic-transfer/report.json').read_bytes()\n"
        "transfer_report = json.loads(transfer_report_bytes)\n"
        "assert hashlib.sha256(transfer_bytes).hexdigest() == transfer_report['index_sha256']\n"
        "selected_methods = ['M01', 'M04']\n"
        "sample_case, seed = 'C01', 40000\n"
        "records = {}\n"
        "for method_id in ('M01', 'M12', 'M04', 'M09'):\n"
        "    row = next(row for row in index['episodes'] if row['method_id'] == method_id and row['case_id'] == sample_case and row['variant'] == 'nominal' and row['seed'] == seed)\n"
        "    trace_bytes = (ROOT / 'data/derived' / row['path']).read_bytes()\n"
        "    assert hashlib.sha256(trace_bytes).hexdigest() == row['sha256']\n"
        "    records[method_id] = json.loads(trace_bytes)\n"
        "checkpoint_dir = Path(os.environ.get('NEURAXIS_CHECKPOINTS', str(ROOT / 'models/checkpoints')))\n"
        "planner_model = os.environ.get('NEURAXIS_NOTEBOOK_MODEL')\n"
        "planner = OllamaPlanner(planner_model) if planner_model else None\n"
    )
    if not any(loader_marker in source_of(cell) for cell in nb["cells"]):
        data_heading = next(
            (i for i, cell in enumerate(nb["cells"]) if cell["cell_type"] == "markdown" and re.search(r"^## (?:Data|Datos)\s*$", source_of(cell), re.M)),
            3,
        )
        insert_at = data_heading + 1
        nb["cells"].insert(insert_at, code_cell(loader))
        changed = True
    for cell_index, item in enumerate(nb["cells"]):
        if item["cell_type"] != "code":
            continue
        source = source_of(item)
        if 'transfer_path = ROOT / "data/derived/semantic-transfer/index.json"' in source:
            replacement = """# Display separate transfer aggregates already hash-checked at the data boundary.
for row in transfer["aggregate_results"]:
    print(row["method_id"], "successes=", round(row["task_success"] * row["episodes"]), "/", row["episodes"], "rate=", row["task_success"])
print("Transfer episodes checked:", transfer_report["episodes_checked"], "| held-out families:", len(transfer["cases"]))
"""
            item["source"] = replacement.splitlines(keepends=True)
            if not any(
                cell["cell_type"] == "markdown" and "Report the separately audited semantic-transfer aggregates" in source_of(cell)
                for cell in nb["cells"]
            ):
                nb["cells"].insert(
                    cell_index,
                    markdown_cell(
                        "### Report the separately audited semantic-transfer aggregates\n\n"
                        "The transfer index and episode count are verified against their independent audit before these method totals are displayed."
                        if lang == "en"
                        else "### Informar los agregados de transferencia auditados por separado\n\n"
                        "El índice de transferencia y el conteo de episodios se verifican contra su auditoría independiente antes de mostrar estos totales por método."
                    ),
                )
            changed = True
        if "semantic_pairs = {}" in source:
            replacement = """# Read the hash-bound transfer summaries instead of reopening all 1,536 episode files.
for row in transfer_report["methods"]:
    print(row["method_id"], "successes=", row["successes"], "/", row["episodes"], "rate=", round(row["successes"] / row["episodes"], 4))
print("Transfer outcomes by held-out family:")
for row in transfer_report["by_family"]:
    print(row["family"], row["methods"])
print("Persisted M12 paired audit:", transfer_report["m12_paired"])
"""
            item["source"] = replacement.splitlines(keepends=True)
            if cell_index > 0 and nb["cells"][cell_index - 1]["cell_type"] == "markdown":
                nb["cells"][cell_index - 1]["source"] = (
                    "### Read the hash-bound transfer summary\n\n"
                    "The manifest-bound method and family summaries preserve the full denominator without reopening every episode file."
                    if lang == "en"
                    else "### Leer el resumen de transferencia vinculado por hash\n\n"
                    "Los resúmenes por método y familia vinculados al manifiesto conservan el denominador completo sin volver a abrir cada archivo de episodio."
                ).splitlines(keepends=True)
            changed = True
    transfer_seen = False
    for cell_index in range(len(nb["cells"]) - 1, -1, -1):
        cell = nb["cells"][cell_index]
        if cell["cell_type"] == "code" and "# Display separate transfer aggregates already hash-checked at the data boundary." in source_of(cell):
            if transfer_seen:
                del nb["cells"][cell_index]
            transfer_seen = True
    transfer_heading = "Report the separately audited semantic-transfer aggregates" if lang == "en" else "Informar los agregados de transferencia auditados por separado"
    for cell_index in range(len(nb["cells"]) - 1, -1, -1):
        cell = nb["cells"][cell_index]
        if cell["cell_type"] == "markdown" and transfer_heading in source_of(cell):
            del nb["cells"][cell_index]
    transfer_code_index = next(
        (i for i, cell in enumerate(nb["cells"]) if cell["cell_type"] == "code" and "# Display separate transfer aggregates already hash-checked at the data boundary." in source_of(cell)),
        None,
    )
    if transfer_code_index is not None:
        heading_text = (
            "### Report the separately audited semantic-transfer aggregates\n\nThe transfer index and episode count are verified against their independent audit before these method totals are displayed."
            if lang == "en"
            else "### Informar los agregados de transferencia auditados por separado\n\nEl índice de transferencia y el conteo de episodios se verifican contra su auditoría independiente antes de mostrar estos totales por método."
        )
        nb["cells"].insert(transfer_code_index, markdown_cell(heading_text))
    cells = nb["cells"]
    heading = "core matrix evidence" if lang == "en" else "evidencia de la matriz central"
    start = next(
        (
            i
            for i, cell in enumerate(cells)
            if cell["cell_type"] == "markdown"
            and any(
                token.casefold() in source_of(cell).casefold()
                for token in (heading, "Recompute the complete core matrix", "Reconstruir la matriz central completa")
            )
        ),
        None,
    )
    if start is None:
        start = next(
            (i for i, cell in enumerate(cells) if cell["cell_type"] == "code" and "core_outcomes = {}" in source_of(cell)),
            None,
        )
        if start is not None and start and cells[start - 1]["cell_type"] == "markdown":
            start -= 1
    if start is not None:
        end = next(
            (
                i
                for i in range(start + 1, len(cells))
                if cells[i]["cell_type"] == "code"
                and (
                    "for left, right in [(\"M01\", \"M12\")" in source_of(cells[i])
                    or 'for left, right in [("M01", "M12")' in source_of(cells[i])
                )
            ),
            None,
        )
        if end is not None:
            methods_text = """# Use the index-bound audit summary for the full matrix and the indexed aggregates for rates.
audit_methods = {row["method_id"]: row for row in audit["methods"]}
print("Episodes checked:", audit["episodes_checked"])
print("Seed-variable case-variant-method cells:", audit["seed_variable_cells"], "/", audit["case_variant_method_cells"])
for row in sorted(index["aggregate_results"], key=lambda value: value["method_id"]):
    audit_row = audit_methods[row["method_id"]]
    print(row["method_id"], audit_row["successes"], "/", audit_row["episodes"], "rate=", round(row["task_success"], 4))
"""
            pair_text = """# Compare the one hash-verified matched case directly; marginal matrix rates do not establish paired wins.
for left, right in [("M01", "M12"), ("M04", "M12"), ("M09", "M12")]:
    a = int(bool(records[left]["metrics"]["task_success"]))
    b = int(bool(records[right]["metrics"]["task_success"]))
    print(left, "vs", right, "matched sample=C01/nominal/40000", "paired=1", "wins=", int(a > b), "losses=", int(a < b), "ties=", int(a == b))
print("Structural transfer is summarized in its separate hash-bound lane above.")
"""
            if lang == "en":
                explanation = markdown_cell(
                    "### Full core matrix evidence\n\n"
                    "The core index is hash-verified against its audit summary. Use its persisted denominators and seed-variation count for the full matrix; the paired win/loss demonstration below is limited to the single C01 nominal seed loaded above. Marginal method rates do not reveal full-matrix paired wins. The separate structural-transfer report is hash-bound to its own index."
                )
                pair_explanation = markdown_cell(
                    "### Paired outcome on the declared sample\n\n"
                    "Compare the selected methods on the same C01, nominal variant and seed 40000. This is one paired observation, not a full-matrix paired estimate."
                )
            else:
                explanation = markdown_cell(
                    "### Evidencia de la matriz central completa\n\n"
                    "El índice central se verifica por hash contra su resumen de auditoría. Usa sus denominadores guardados y el conteo de variación entre semillas para la matriz completa; las victorias y derrotas emparejadas de abajo se limitan a la muestra única C01 nominal cargada arriba. Las tasas marginales no revelan las victorias emparejadas de toda la matriz. El informe de transferencia estructural está vinculado por hash a su propio índice."
                )
                pair_explanation = markdown_cell(
                    "### Resultado emparejado en la muestra declarada\n\n"
                    "Compara los métodos seleccionados bajo el mismo C01, variante nominal y semilla 40000. Es una observación emparejada, no una estimación emparejada de toda la matriz."
                )
            cells[start : end + 1] = [explanation, code_cell(methods_text), pair_explanation, code_cell(pair_text)]
            changed = True
    return changed


def stabilize_plot_timing(nb: dict, topic: str, level: int, lang: str) -> bool:
    """Make timing figures machine-stable by plotting their hash-verified canonical trace values."""
    method_a, method_b = method_ids(topic, level)
    case = CASE_FOR_TOPIC[topic]
    label = TOPIC_LABEL[lang][topic]
    changed = False
    for index, item in enumerate(nb["cells"]):
        if item["cell_type"] != "code":
            continue
        source = source_of(item)
        timed_methods = (method_a, method_b)
        if (
            'latencies = [fresh_runs[name]["metrics"]["controller_ms"] for name in labels]' in source
            or 'latencies = [records[name]["metrics"]["controller_ms"] for name in labels]' in source
        ):
            source = source.replace(
                "# Plot total controller decision time and verified completion for each fresh run.",
                "# Plot controller time from the hash-verified frozen records for the matched methods.",
            )
            source = source.replace(
                'latencies = [fresh_runs[name]["metrics"]["controller_ms"] for name in labels]',
                'latencies = [records[name]["metrics"]["controller_ms"] for name in labels]',
            )
            source = source.replace("Controller decision time (ms per episode)", "Recorded controller time (ms per episode)")
            source = source.replace("measured controller work", "frozen-trace timing")
        elif (
            'latencies = [run["metrics"]["controller_ms"] for run in outcomes]' in source
            or 'latencies = [records[primary_id]["metrics"]["controller_ms"], records["M04"]["metrics"]["controller_ms"]]' in source
        ):
            timed_methods = (method_a, "M04")
            source = source.replace(
                "# Compare the fresh XGBoost execution with the selected policy on the same case.",
                "# Compare hash-verified canonical controller times under the same case, variant and seed.",
            )
            source = source.replace(
                'outcomes = [primary_result, state_art_result]\nlatencies = [run["metrics"]["controller_ms"] for run in outcomes]',
                'latencies = [records[primary_id]["metrics"]["controller_ms"], records["M04"]["metrics"]["controller_ms"]]',
            )
            source = source.replace("Controller decision time (ms per episode)", "Recorded controller time (ms per episode)")
            source = source.replace("XGBoost reference comparison", "frozen-trace XGBoost comparison")
        else:
            continue
        if lang == "es":
            source = source.replace("Recorded controller time (ms per episode)", "Tiempo registrado del controlador (ms por episodio)")
            source = source.replace("frozen-trace timing", "tiempos de trazas congeladas")
            source = source.replace("frozen-trace XGBoost comparison", "comparación XGBoost con trazas congeladas")
        item["source"] = source.splitlines(keepends=True)
        if index > 0 and nb["cells"][index - 1]["cell_type"] == "markdown":
            heading = "Recorded controller time" if lang == "en" else "Tiempo registrado del controlador"
            source = f"### {label} · L{level} — {heading}\n\n"
            if lang == "en":
                source += f"At level {level}, the {label} timing chart uses hash-verified frozen records for {timed_methods[0]} and {timed_methods[1]} on {case}, not machine-dependent timings from fresh episodes. This level {level} {label} view describes the recorded environment under its declared case, variant and seed."
            else:
                source += f"En el nivel {level}, la figura de tiempos de {label} usa registros congelados y verificados por hash para {timed_methods[0]} y {timed_methods[1]} en {case}, no los tiempos dependientes de la máquina de episodios nuevos. Esta vista de nivel {level} para {label} describe el entorno registrado bajo su caso, variante y semilla declarados."
            nb["cells"][index - 1]["source"] = source.splitlines(keepends=True)
        if index + 1 < len(nb["cells"]) and nb["cells"][index + 1]["cell_type"] == "markdown":
            if lang == "en":
                explanation = f"The level {level} {label} chart reads canonical {timed_methods[0]}/{timed_methods[1]} records for {case}, nominal variant and seed 40000 after the data boundary verifies their hashes. For this {label} lesson, the stable figure describes recorded latency and intentionally makes no current-machine speed claim."
            else:
                explanation = f"La figura de nivel {level} para {label} lee registros canónicos de {timed_methods[0]}/{timed_methods[1]} en {case}, variante nominal y semilla 40000, luego de verificar sus hashes en la frontera de datos. En esta lección de {label}, el gráfico estable describe la latencia registrada y no afirma rapidez en la máquina actual."
            nb["cells"][index + 1]["source"] = explanation.splitlines(keepends=True)
        changed = True
    return changed


def rebuild(root: Path) -> int:
    count = 0
    for lang in ("en", "es"):
        for path in sorted((root / "notebooks" / lang).glob("*/*.ipynb")):
            nb = json.loads(path.read_text(encoding="utf-8"))
            meta = nb.get("metadata", {}).get("caos", {})
            topic, level = meta.get("topic"), meta.get("level")
            if topic not in CASE_METHODS or level not in (1, 2, 3):
                raise ValueError(f"unsupported notebook metadata: {path}")
            packages = meta.get("packages", [])
            updated_packages = [package.replace("numpy==2.4.6", "numpy==2.5.3") for package in packages]
            if updated_packages != packages:
                meta["packages"] = updated_packages
            for cell in nb["cells"]:
                if cell["cell_type"] == "markdown" and "pip install reflexmesh==" in source_of(cell):
                    cell["source"] = source_of(cell).replace("numpy==2.4.6", "numpy==2.5.3").splitlines(keepends=True)
            stabilize_plot_timing(nb, topic, level, lang)
            replace_data_cell(nb, topic, lang)
            split_transfer_matrix_analysis(nb, topic, level, lang)
            if any("primary_policy = make_policy" in source_of(cell) for cell in nb["cells"]):
                question_and_answer(nb, topic, level, lang)
                keep_one_artifact_audit(nb)
                write_notebook(path, nb)
                count += 1
                continue
            add_question(nb, topic, level, lang)
            replace_data_cell(nb, topic, lang)

            # Replace copied objective/method text with a topic-specific statement and the corresponding method analysis.
            for item in nb["cells"]:
                if item["cell_type"] != "markdown":
                    continue
                text = source_of(item)
                if re.search(r"^## (?:Objectives|Objetivos)\s*$", text, re.M):
                    objective = OBJECTIVES[lang][topic]
                    heading = "## Objectives" if lang == "en" else "## Objetivos"
                    item["source"] = (heading + "\n\n" + scope_prose(objective, topic, level, lang) + "\n").splitlines(keepends=True)
                elif re.search(r"^## (?:Method|M.todo)\s*$", text, re.M):
                    if level == 1:
                        body = OBJECTIVES[lang][topic] + " " + (
                            f"For this level 1 {TOPIC_LABEL[lang][topic]} exercise, trace only the first decision and the independently checked task postcondition. The method call below constructs the published policy, then the episode evaluator advances its software environment. The authorization rule remains separate from the policy preference, so stop or failure is a valid result when no supported action is available."
                            if lang == "en" else
                            f"En este ejercicio de nivel 1 sobre {TOPIC_LABEL[lang][topic]}, sigue solo la primera decisión y la poscondición verificada independientemente. La llamada construye la política publicada y el evaluador avanza el entorno de software. La regla de autorización sigue separada de la preferencia, así que detenerse o fallar también puede ser un resultado válido cuando no existe una acción respaldada."
                        )
                        body += " " + qualified_depth(topic, level, lang, 2)
                    elif level == 2:
                        body = METHOD_NOTES[lang][topic] + "\n\n" + qualified_depth(topic, level, lang, 7)
                    else:
                        body = METHOD_NOTES[lang][topic] + "\n\n" + qualified_depth(topic, level, lang, 7)
                    heading = "## Method" if lang == "en" else "## Método"
                    item["source"] = (heading + "\n\n" + scope_prose(body, topic, level, lang) + "\n").splitlines(keepends=True)
                elif re.search(r"^## (?:State of the art|Estado del arte)\s*$", text, re.M):
                    heading = "## State of the art" if lang == "en" else "## Estado del arte"
                    item["source"] = (heading + "\n\n" + qualified_sota(topic, level, lang).replace(": ", ", ") + "\n").splitlines(keepends=True)
                elif re.search(r"^## (?:Summary|Resumen)\s*$", text, re.M):
                    conclusion = (
                        f"At level {level}, {TOPIC_LABEL[lang][topic]} uses {CASE_FOR_TOPIC[topic]} to show how the released method behaves under one declared condition. Keep the observed outcome separate from a claim about general software-control intelligence."
                        if lang == "en" else
                        f"En el nivel {level}, {TOPIC_LABEL[lang][topic]} usa {CASE_FOR_TOPIC[topic]} para mostrar el comportamiento del método publicado bajo una condición declarada. Mantén el resultado observado separado de una afirmación sobre inteligencia general para controlar software."
                    )
                    heading = "## Summary" if lang == "en" else "## Resumen"
                    item["source"] = (heading + "\n\n" + scope_prose(conclusion, topic, level, lang) + "\n").splitlines(keepends=True)
                elif re.search(r"^## (?:Data|Datos)\s*$", text, re.M):
                    item["source"] = scope_data_section(text, topic, level, lang).splitlines(keepends=True)

            # Long subsection labels are localized to the method family so they do not repeat boilerplate across the tree.
            for item in nb["cells"]:
                if item["cell_type"] != "markdown":
                    continue
                lines = source_of(item).splitlines()
                changed = []
                for line in lines:
                    if line.startswith("### ") and len(line) > 52:
                        prefix = f"### {TOPIC_LABEL[lang][topic]} · level {level} — " if lang == "en" else f"### {TOPIC_LABEL[lang][topic]} · nivel {level} — "
                        line = prefix + line[4:]
                    changed.append(line)
                item["source"] = [(line + "\n") for line in changed]

            # The old setup/version and trace-summary cells count as repeated scaffolding, not lessons.
            cells = nb["cells"]
            new_cells = []
            removed_old_runner = False
            for item in cells:
                text = source_of(item)
                if item["cell_type"] == "code" and (
                    "importlib.metadata" in text
                    or "# Summarize the recorded first action" in text
                    or "# Resume la primera acción registrada" in text
                    or "# Planner outcomes come from frozen traces" in text
                    or "# Planner outcomes come from frozen traces" in text
                    or "# Planner outcomes come from" in text
                    or "# Los resultados de planificación se leen de las trazas congeladas" in text
                    or "# Sequence equality is diagnostic" in text
                    or "# La igualdad de secuencia es diagnóstica" in text
                ):
                    continue
                if item["cell_type"] == "markdown" and (
                    "### Check the pinned analysis environment" in text
                    or "Comprueba las versiones fijadas del entorno." in text
                    or "### Inspect the original decisions and outcomes" in text
                    or "Inspecciona las decisiones y resultados originales" in text
                    or "### Execute the released policies and compare the run" in text
                    or "### Ejecuta las políticas publicadas y compara la corrida" in text
                    or "### Compare the full sequence, not only the first action" in text
                    or "### Compara la secuencia completa y no solo la primera acción" in text
                    or "### Verify the audit and each trace's bytes" in text
                ):
                    continue
                new_cells.append(item)
            nb["cells"] = new_cells

            # One setup cell follows the Setup heading; data loading remains separate in the Data section.
            setup_code = code_cell(
                "# Import the released policy API and the pinned plotting/runtime dependencies.\n"
                "import hashlib\n"
                "import importlib.metadata\n"
                "import json\n"
                "import os\n"
                "from io import BytesIO\n"
                "from pathlib import Path\n"
                "import matplotlib.pyplot as plt\n"
                "from IPython.display import Image, display\n"
                "from reflexmesh.environments import CaseSpec\n"
                "from reflexmesh.evaluation.runner import aggregate, run_episode\n"
                "from reflexmesh.pipeline import make_policy\n"
                "from reflexmesh.planners import OllamaPlanner\n"
                "for distribution in (\"reflexmesh\", \"numpy\", \"matplotlib\"):\n"
                "    print(f\"{distribution}=={importlib.metadata.version(distribution)}\")\n"
            )
            setup_heading = next(
                i for i, item in enumerate(nb["cells"])
                if item["cell_type"] == "markdown" and re.search(
                    r"^## (?:Setup|Preparaci[oó]n)\s*$", source_of(item), re.M
                )
            )
            nb["cells"].insert(setup_heading + 1, setup_code)

            # The next code cell performs the two real executions and evaluator aggregation.
            cells = nb["cells"]
            insertion_idx = next(
                i for i, item in enumerate(cells)
                if item["cell_type"] == "markdown" and re.search(
                    r"^## (?:State of the art|Estado del arte)\s*$"
                    if level == 3 else r"^## (?:Results|Resultados)\s*$",
                    source_of(item), re.M
                )
            )
            additions = method_steps(topic, level, lang)
            additions.extend(figure_block(lang, topic, "first", level))
            if level == 2:
                additions.extend(figure_block(lang, topic, "latency", level))
            # Level 3's XGBoost comparator and its figure belong in the State of the art section.
            cells[insertion_idx:insertion_idx] = additions
            if level == 3:
                state_idx = next(
                    i for i, item in enumerate(cells)
                    if item["cell_type"] == "markdown" and re.search(
                        r"^## (?:State of the art|Estado del arte)\s*$", source_of(item), re.M
                    )
                )
                sota_cells = [
                    markdown_cell(
                        (f"### {TOPIC_LABEL[lang][topic]} · L{level} — Execute the XGBoost reference on matched conditions\n\n" if lang == "en" else f"### {TOPIC_LABEL[lang][topic]} · L{level} — Ejecutar la referencia XGBoost bajo condiciones emparejadas\n\n")
                        + (f"This level {level} {TOPIC_LABEL[lang][topic]} reference call executes M04 on {CASE_FOR_TOPIC[topic]} with the same nominal seed as the fresh policies, and its score and time form one matched observation.\n" if lang == "en" else f"Esta llamada de referencia del nivel {level} para {TOPIC_LABEL[lang][topic]} ejecuta M04 en {CASE_FOR_TOPIC[topic]} con la misma semilla nominal, y su resultado y tiempo forman una observación emparejada.\n")
                    ),
                    code_cell(
                        "# Execute the measured XGBoost policy on the identical case specification.\n"
                        "state_art_policy = make_policy(\"M04\", checkpoint_dir, planner=planner)\n"
                        "state_art_result = run_episode(state_art_policy, CaseSpec(sample_case, \"nominal\", seed))\n"
                        "print(\"State-of-the-art comparator runs:\", 1)\n"
                        "print(\"XGBoost task success:\", state_art_result[\"metrics\"][\"task_success\"])\n"
                    ),
                    *figure_block(lang, topic, "baseline", level),
                ]
                cells[state_idx + 1:state_idx + 1] = sota_cells
            nb["cells"] = cells
            question_and_answer(nb, topic, level, lang)
            split_transfer_matrix_analysis(nb, topic, level, lang)
            stabilize_plot_timing(nb, topic, level, lang)
            keep_one_artifact_audit(nb)
            write_notebook(path, nb)
            count += 1
    return count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, nargs="?", default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    print(f"Rebuilt the execution spine in {rebuild(args.root.resolve())} bilingual notebook files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
