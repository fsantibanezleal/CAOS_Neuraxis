"""Author the bilingual Neuraxis notebook curriculum from product evidence and the pinned engine API.

This authoring step creates empty notebook cells only. ``run_notebooks.py`` is the sole writer of
executed outputs. The notebooks teach and inspect published methods; this script contains no
controller implementation.
"""

from __future__ import annotations

import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKPOINT_RELEASE = json.loads((ROOT / "product.json").read_text(encoding="utf-8"))["model_artifacts"]["checkpoint_release"]
PACKAGES = ["reflexmesh==0.1.2", "numpy==2.4.6", "matplotlib==3.11.2", "torch==2.14.1", "joblib==1.6.0", "gymnasium==1.4.0", "scikit-learn==1.9.1", "stable-baselines3==2.9.2", "sb3-contrib==2.9.2"]
SOURCES = {
    "jev": "https://typesafe.ai/blog/introducing-system-one-models-and-jev",
    "lee": "https://doi.org/10.1016/j.neuron.2013.11.028",
    "dpt": "https://aclanthology.org/2025.acl-long.206/",
    "xgb": "https://arxiv.org/abs/1603.02754",
    "gru": "https://arxiv.org/abs/1406.1078",
    "ppo": "https://arxiv.org/abs/1707.06347",
    "linucb": "https://arxiv.org/abs/1003.0146",
    "voc": "https://arxiv.org/abs/1711.06892",
    "defer": "https://proceedings.mlr.press/v119/mozannar20b.html",
    "toolsandbox": "https://arxiv.org/abs/2408.04682",
    "swe": "https://arxiv.org/abs/2310.06770",
    "tau2": "https://arxiv.org/abs/2506.07982",
}

TOPICS = [
    {
        "slug": "01-fast-event-control", "sample_case": "C01", "methods": ["M01", "M02"],
        "data": ["data/derived/index.json", "data/derived/episodes/M01-C01-nominal-40000.json"],
        "sources": ["jev", "lee", "dpt"],
        "en": {
            "name": "Fast event control", "needs": "none; entry topic",
            "problem": "A controller receives an event, reduces only observed state, filters registered candidates by their capability contract, then emits an inspectable decision. Fast is an operational budget, not a brain label or a claim that the action is correct.",
            "method": "The package's guarded FSM is the executable reference for this first run. The canonical C01 trace supplies the exact pre-decision event and candidate set; the notebook reconstructs the public Reflexmesh contracts and asks the released policy to decide again.",
            "equation": "\\(a_t=\\arg\\max_{a\\in\\mathcal A_t^{adm}} U(a\\mid o_t)\\), with \u201cstop\u201d when no supported action remains. The authorization set is computed independently of learned scores.",
            "sota": "Jev is a vendor-described typed fast-decision product and is a useful starting reference, not an independently validated baseline here. DPT-Agent already combines code/FSM control with asynchronous LLM reasoning. Reliability-sensitive arbitration is also studied in model-based/model-free neuroscience. Neuraxis therefore does not claim to invent System One, typed decisions, or fast/slow composition.",
            "limit": "This package replay checks one exact guarded decision on the same frozen observation. It does not demonstrate general transfer, a biological mechanism, or superiority over a matched deployed system.",
            "summary": "An admissible action is a bounded capability, not generated text. The released package reproduces the selected guard on a real frozen trace; that is a mechanics check, not an intelligence claim.",
        },
        "es": {
            "name": "Control rápido por eventos", "needs": "ninguno; tema de entrada",
            "problem": "El controlador recibe un evento, reduce solo el estado observado, filtra candidatos registrados mediante su contrato de capacidades y emite una decisión inspeccionable. Rápido es un presupuesto operativo, no una etiqueta cerebral ni una afirmación de corrección.",
            "method": "La FSM protegida del paquete es la referencia ejecutable de esta primera corrida. La traza canónica C01 aporta el evento exacto anterior a la decisión y sus candidatos; el notebook reconstruye los contratos públicos de Reflexmesh y vuelve a pedir una decisión a la política publicada.",
            "equation": "\\(a_t=\\arg\\max_{a\\in\\mathcal A_t^{adm}} U(a\\mid o_t)\\), con «stop» cuando no queda una acción respaldada. El conjunto autorizado se calcula independientemente de los puntajes aprendidos.",
            "sota": "Jev es un producto descrito por su proveedor para decisiones rápidas tipadas y sirve como referencia inicial, no como baseline validado aquí de forma independiente. DPT-Agent ya combina control FSM/código con razonamiento LLM asíncrono. La neurociencia también estudia la arbitraje sensible a fiabilidad entre aprendizaje basado en modelo y libre de modelo. Por ello, Neuraxis no afirma inventar System One, las decisiones tipadas ni la composición rápido/lento.",
            "limit": "Esta repetición con el paquete comprueba una decisión protegida exacta sobre la misma observación congelada. No demuestra transferencia general, un mecanismo biológico ni superioridad frente a un sistema desplegado y emparejado.",
            "summary": "Una acción admisible es una capacidad acotada, no texto generado. El paquete publicado reproduce la regla seleccionada en una traza real congelada; es una comprobación mecánica, no una afirmación de inteligencia.",
        },
    },
    {
        "slug": "02-learned-action-policies", "sample_case": "C05", "methods": ["M03", "M04"],
        "data": ["data/derived/index.json", "data/derived/benchmark-adequacy.json"],
        "sources": ["xgb", "gru", "linucb"],
        "en": {
            "name": "Learned action policies", "needs": "01-fast-event-control",
            "problem": "The product compares a deterministic FSM and behavior tree with fitted logistic and boosted-tree scorers, a recurrent policy, and a contextual bandit. The task outcome is the independent software postcondition; matching the demonstration is a different target.",
            "method": "For a scorer, the released package maps an observation and its currently admissible candidates to candidate features, scores those candidates, and returns a typed decision. The frozen episodes preserve the exact chosen action, score, policy identity and eventual task outcome. This notebook analyzes those records without copying the scoring algorithm.",
            "equation": "For the logistic baseline, \\(p(a\\mid x)=\\sigma(w^T\\phi(x,a))\\); for gradient-boosted trees, the logit is an additive tree score. These models rank registered actions; neither equation grants authority or makes demonstration agreement equivalent to verified success.",
            "sota": "XGBoost is a strong established tree-boosting baseline; GRU sequence models and LinUCB contextual-bandit policies are also prior art. Their published results use different datasets and protocols. The only valid Neuraxis comparison here is the matched policy matrix on the same frozen software episodes, with the target and split caveats retained.",
            "limit": "The package checkpoints are separately released assets and are not committed in this product repository. The displayed fitted-method outcomes are the hash-verified recorded evaluations, not a freshly refitted model. A rate on designed families is not an estimate for arbitrary software tasks.",
            "summary": "Learned scorers are evaluated beside strong simple baselines. The fitted artifacts produced full core success for some scorers, but the benchmark ceiling limits any superiority inference.",
        },
        "es": {
            "name": "Políticas de acción aprendidas", "needs": "01-fast-event-control",
            "problem": "El producto compara una FSM determinista y un árbol de comportamiento con puntajes logísticos y de árboles potenciados ajustados, una política recurrente y un bandido contextual. El resultado de la tarea es la poscondición independiente del software; coincidir con la demostración es otro objetivo.",
            "method": "Para un puntuador, el paquete publicado transforma una observación y sus candidatos actualmente admisibles en características por candidato, los puntúa y devuelve una decisión tipada. Los episodios congelados conservan la acción elegida, el puntaje, la identidad de política y el resultado final. Este notebook analiza esos registros sin copiar el algoritmo de puntuación.",
            "equation": "Para el baseline logístico, \\(p(a\\mid x)=\\sigma(w^T\\phi(x,a))\\); para árboles potenciados, el logit es una suma de puntajes de árboles. Estos modelos ordenan acciones registradas; ninguna ecuación concede autoridad ni equipara la coincidencia con una demostración al éxito verificado.",
            "sota": "XGBoost es un baseline establecido y sólido de árboles potenciados; los modelos secuenciales GRU y las políticas de bandido contextual LinUCB también son trabajo previo. Sus resultados publicados usan otros datos y protocolos. La comparación válida aquí es la matriz de políticas emparejada sobre los mismos episodios congelados, conservando las limitaciones del objetivo y de la partición.",
            "limit": "Los checkpoints del paquete se publican como activos separados y no están versionados en este repositorio. Los resultados de los métodos ajustados son evaluaciones registradas y verificadas por hash, no modelos reajustados ahora. Una tasa en familias diseñadas no estima el rendimiento en tareas de software arbitrarias.",
            "summary": "Los puntuadores aprendidos se evalúan junto a baselines simples y sólidos. Algunos artefactos ajustados lograron éxito total en el núcleo, pero el techo del benchmark limita cualquier inferencia de superioridad.",
        },
    },
    {
        "slug": "03-sequential-control", "sample_case": "C07", "methods": ["M05", "M06", "M07", "M08"],
        "data": ["data/derived/index.json", "data/derived/benchmark-adequacy.json"],
        "sources": ["gru", "ppo", "linucb"],
        "en": {
            "name": "Sequential control and memory", "needs": "02-learned-action-policies",
            "problem": "Delayed observations, evolving job state and action consequences make software control sequential. The matrix distinguishes recurrent imitation, a myopic contextual bandit, masked PPO and bounded learned-model lookahead instead of grouping them under a generic ‘AI’ label.",
            "method": "Read the C07 cancellation slice, then inspect success by variant and the saved decision/effect sequence. The traces show which controller action actually ran and whether the independent outcome verifier accepted it. The notebook uses episode-level denominators and keeps seed and family structure visible.",
            "equation": "Sequential RL optimizes \\(G_t=\\sum_{k=0}^{T-t}\\gamma^k r_{t+k}\\); a learned transition policy instead uses \\(\\hat s_{t+1}=f_\\phi(s_t,a_t)\\) to score a bounded search. These are package methods M07 and M08, not the same objective and not equivalent to a one-step bandit.",
            "sota": "GRU, PPO and model-based planning are mature method families with extensive prior art. The relevant evidence is their executed performance on the same controlled postconditions, not their algorithm names. The frozen matrix exposes the difficult cancellation family and preserves the weak methods rather than hiding them.",
            "limit": "All 40 M12 failures are in C07, while several methods succeed on all 200 C07 episodes. The result identifies a concrete gap; aggregate success alone does not establish whether recurrence, action masking, model error or cancellation timing caused it.",
            "summary": "History and future consequences matter in principle, but complexity is not proof of useful memory. Read the trace and the verified task result together; inspect failure variants before proposing a new mechanism.",
        },
        "es": {
            "name": "Control secuencial y memoria", "needs": "02-learned-action-policies",
            "problem": "Las observaciones demoradas, el estado cambiante de trabajos y las consecuencias de las acciones hacen que el control de software sea secuencial. La matriz distingue imitación recurrente, bandido contextual miope, PPO con máscara y búsqueda acotada con modelo aprendido, sin agruparlos como una ‘IA’ genérica.",
            "method": "Lee la porción C07 de cancelación, inspecciona el éxito por variante y la secuencia guardada de decisiones y efectos. Las trazas muestran qué acción del controlador se ejecutó y si el verificador independiente aceptó el resultado. El notebook usa denominadores por episodio y mantiene visibles familias y semillas.",
            "equation": "El RL secuencial optimiza \\(G_t=\\sum_{k=0}^{T-t}\\gamma^k r_{t+k}\\); una política con transición aprendida usa \\(\\hat s_{t+1}=f_\\phi(s_t,a_t)\\) para puntuar una búsqueda acotada. Son métodos distintos del paquete, M07 y M08, con objetivos diferentes y no equivalentes a un bandido de un paso.",
            "sota": "GRU, PPO y planificación basada en modelos son familias maduras con amplia investigación previa. La evidencia relevante es su ejecución frente a las mismas poscondiciones controladas, no sus nombres algorítmicos. La matriz congelada expone la familia difícil de cancelación y conserva los métodos débiles.",
            "limit": "Los 40 fallos centrales de M12 están en C07, mientras varios métodos tienen éxito en los 200 episodios C07. El resultado identifica una brecha concreta; el éxito agregado no establece si la causó la recurrencia, la máscara de acciones, el error del modelo o el tiempo de cancelación.",
            "summary": "La historia y las consecuencias futuras pueden importar, pero la complejidad no demuestra que la memoria sea útil. Lee juntas la traza y la tarea verificada; inspecciona las variantes fallidas antes de proponer un mecanismo nuevo.",
        },
    },
    {
        "slug": "04-deliberation-allocation", "sample_case": "C13", "methods": ["M11", "M12", "M09", "M10"],
        "data": ["data/derived/index.json", "data/derived/semantic-routing-study/analysis.json"],
        "sources": ["jev", "dpt", "voc", "defer"],
        "en": {
            "name": "Deliberation allocation", "needs": "03-sequential-control",
            "problem": "A slow planner can return a useful proposal, a late response, invalid output or no answer. A controller must account for the planner's own outcome and latency while the environment changes; uncertainty alone does not prove that delegation helps.",
            "method": "Inspect M09 direct planning, M10 asynchronous delegation, M11 learned deferral and M12 metacontrol as separate methods. Recompute the observed routing-study counts from the persisted report and compare its held-out arms without pooling them into the core benchmark.",
            "equation": "A value-of-computation estimate is \\(VOC(c\\mid x)=\\mathbb E[V(x'\\mid c,x)]-V_{act}(x)-\\lambda_c cost(c)-\\lambda_d delay(c)\\). The expected value must include failed, late, invalid and superseded plans. This is the research formulation; this notebook does not refit or silently improve the historical gate.",
            "sota": "Metalevel computation allocation and cost-sensitive learning to defer are established research areas. DPT-Agent is a close asynchronous fast/slow architectural precedent. The relevant claim is not that Neuraxis invented routing, but whether its particular persistent, versioned coordination produces a measured advantage under matched software changes.",
            "limit": "The gate fit used 228 states with seven positive labels and selected threshold 1.01, meaning it never delegated through that gate. M12's other trigger is separate. Report planner calls, latency and verified success; a configured LLM is not evidence of useful deliberation.",
            "summary": "Delegation must earn its cost from paired outcomes. The current evidence reports a negative learned-gate result and no demonstrated task-success advantage for M12.",
        },
        "es": {
            "name": "Asignación de deliberación", "needs": "03-sequential-control",
            "problem": "Un planificador lento puede devolver una propuesta útil, una respuesta tardía, una salida inválida o no responder. El controlador debe considerar el resultado y la latencia del planificador mientras el entorno cambia; la incertidumbre no demuestra por sí sola que delegar ayude.",
            "method": "Inspecciona M09 planificación directa, M10 delegación asíncrona, M11 aplazamiento aprendido y M12 metacontrol como métodos separados. Recalcula los conteos observados del estudio de enrutamiento desde su informe persistido y compara sus brazos retenidos sin mezclarlos con el benchmark central.",
            "equation": "Una estimación de valor de cómputo es \\(VOC(c\\mid x)=\\mathbb E[V(x'\\mid c,x)]-V_{act}(x)-\\lambda_c cost(c)-\\lambda_d delay(c)\\). El valor esperado debe incluir planes fallidos, tardíos, inválidos y reemplazados. Esta es la formulación de investigación; el notebook no reajusta ni mejora en silencio la puerta histórica.",
            "sota": "La asignación de cómputo metanivel y el aprendizaje sensible al costo para aplazar decisiones son áreas establecidas. DPT-Agent es un antecedente arquitectónico cercano de composición rápida/lenta asíncrona. La pregunta no es si Neuraxis inventó el enrutamiento, sino si su coordinación persistente y versionada obtiene una ventaja medida ante cambios de software emparejados.",
            "limit": "El ajuste de la puerta usó 228 estados con siete etiquetas positivas y seleccionó el umbral 1,01, por lo que nunca delegó a través de esa puerta. El otro disparador de M12 es independiente. Informa llamadas al planificador, latencia y éxito verificado; configurar un LLM no demuestra que deliberar sea útil.",
            "summary": "La delegación debe justificar su costo con resultados emparejados. La evidencia actual informa un resultado negativo para la puerta aprendida y ninguna ventaja demostrada de M12 en éxito de tareas.",
        },
    },
    {
        "slug": "05-evaluation-and-transfer", "sample_case": "C01", "methods": ["M01", "M04", "M09", "M12"],
        "data": ["data/derived/index.json", "data/derived/benchmark-adequacy.json", "data/derived/research.json", "data/derived/semantic-transfer/index.json", "data/derived/semantic-transfer/report.json"],
        "sources": ["toolsandbox", "swe", "tau2"],
        "en": {
            "name": "Evaluation, transfer and limits", "needs": "01–04 in order",
            "problem": "A useful controller claim needs a valid denominator, independent outcomes, a fair baseline, disjoint evaluation and a task distribution where the baseline can fail. Many episodes from a few fixed templates do not create many independent situations.",
            "method": "Verify source digests, compare the core and semantic-transfer lanes separately, measure per-method outcomes and expose the paired transfer report. The package's independent outcome checks are authoritative; a successful teacher match, planner response or method label is not.",
            "equation": "For a rate estimate, \\(\\hat p=\\sum_i y_i/n\\); the denominator includes failed, invalid and unresolved episodes according to the report contract. The Wilson interval in the core index is descriptive under an independent-episode assumption; clustered templates and identical seed outcomes reduce the effective information.",
            "sota": "ToolSandbox and tau2 benchmark stateful tool interaction; SWE-bench evaluates repository changes with execution-based tests. These are complementary evaluation protocols, not interchangeable scores. Neuraxis's small designed transfer lane is useful for controlled stress but is not a full run of any external benchmark.",
            "limit": "The core matrix is saturated: seven methods solve all 1,200 episodes and only 71/1,440 method/case/variant cells vary by seed. In semantic transfer, M04 solves 24/24 structural cases while M12 solves 21/24; the larger opaque semantic lane also favors M09 over M12. No learned-superiority claim is supported.",
            "summary": "The strongest result here is an honest diagnosis: the frozen core cannot answer the proposed superiority question. Transfer is bounded, separate, and presently favors simpler or alternative methods on key comparisons.",
        },
        "es": {
            "name": "Evaluación, transferencia y límites", "needs": "01–04 en orden",
            "problem": "Una afirmación útil sobre un controlador requiere denominador válido, resultados independientes, baseline justo, evaluación disjunta y una distribución donde el baseline pueda fallar. Muchos episodios de pocas plantillas fijas no crean muchas situaciones independientes.",
            "method": "Verifica los digest de origen, compara por separado los carriles central y de transferencia semántica, mide los resultados por método y expone el informe de transferencia emparejado. Las comprobaciones independientes del paquete son autoritativas; coincidir con el profesor, obtener respuesta del planificador o llevar un nombre de método no lo es.",
            "equation": "Para una tasa, \\(\\hat p=\\sum_i y_i/n\\); el denominador incluye episodios fallidos, inválidos y sin resolver según el contrato del informe. El intervalo de Wilson del índice central es descriptivo bajo independencia entre episodios; las plantillas agrupadas y los resultados idénticos por semilla reducen la información efectiva.",
            "sota": "ToolSandbox y tau2 evalúan interacción estatal con herramientas; SWE-bench evalúa cambios de repositorio mediante pruebas de ejecución. Son protocolos complementarios, no puntajes intercambiables. El pequeño carril diseñado de transferencia de Neuraxis sirve para estrés controlado, pero no es una corrida completa de ningún benchmark externo.",
            "limit": "La matriz central está saturada: siete métodos resuelven los 1.200 episodios y solo 71/1.440 celdas método/caso/variante cambian por semilla. En transferencia estructural, M04 resuelve 24/24 casos y M12 21/24; el carril semántico opaco mayor también favorece M09 frente a M12. No hay respaldo para afirmar superioridad aprendida.",
            "summary": "El resultado más sólido es un diagnóstico honesto: la matriz central congelada no responde la pregunta de superioridad propuesta. La transferencia es acotada, separada y en comparaciones clave actualmente favorece métodos más simples o alternativos.",
        },
    },
    {
        "slug": "06-ablation-and-export-parity", "sample_case": "C07", "methods": ["M03", "M04", "M11", "M12"],
        "data": ["data/derived/index.json", "data/derived/research.json", "docs/evaluation/corrected-results.json"],
        "sources": ["xgb", "ppo"],
        "en": {
            "name": "Ablations and native export parity", "needs": "05-evaluation-and-transfer",
            "problem": "A complete evaluation must test whether each proposed component contributes and whether optimized model exports preserve the reference scorer. A matching score is numerical evidence only; it does not establish safer decisions, better task outcomes or generalization.",
            "method": "Audit the canonical index digest against the research report, compare all four matched M12 ablations with the full controller, then inspect the native M03/M04 export vectors, threshold coverage, error tolerance and warmed latency scope.",
            "equation": r"For matched outcome \(Y\), the ablation contrast is \(\Delta=Y_{full}-Y_{ablated}\); paired seeds and fixed task templates determine the unit of uncertainty. Export parity is \(\max_i |p_i^{native}-p_i^{reference}|\le\epsilon\), a separate numerical criterion.",
            "sota": "XGBoost and PPO are published method families; this lesson evaluates the released Neuraxis implementation and its export path. Component ablations and reference-versus-optimized implementation checks answer different questions, and neither alone demonstrates a useful change in verified task outcomes.",
            "limit": "All four ablations preserve the same 1,160/1,200 task successes, so this experiment does not show success contribution by memory, effects, deferral or invalidation. Runtime budgets differ across variants, and measured export timings exclude Python feature construction. Numerical parity is not policy safety calibration.",
            "summary": "The negative ablation result is material: the proposed components do not change success on this saturated suite. Native exports meet their recorded numerical tolerance, which supports implementation consistency only.",
        },
        "es": {
            "name": "Ablaciones y paridad de exportación nativa", "needs": "05-evaluation-and-transfer",
            "problem": "Una evaluación completa debe comprobar si cada componente propuesto contribuye y si las exportaciones optimizadas del modelo preservan el puntuador de referencia. La coincidencia de puntajes es evidencia numérica; no demuestra decisiones más seguras, mejores resultados de tarea ni generalización.",
            "method": "Audita el digest del índice canónico frente al informe de investigación, compara las cuatro ablaciones emparejadas de M12 con el controlador completo y luego inspecciona los vectores de exportación nativa M03/M04, cobertura de umbrales, tolerancia de error y alcance de latencia en caliente.",
            "equation": r"Para el resultado emparejado \(Y\), el contraste de ablación es \(\Delta=Y_{completo}-Y_{ablacionado}\); las semillas emparejadas y las plantillas fijas determinan la unidad de incertidumbre. La paridad de exportación es \(\max_i |p_i^{nativo}-p_i^{referencia}|\le\epsilon\), un criterio numérico separado.",
            "sota": "XGBoost y PPO son familias de métodos establecidas; esta lección evalúa la implementación publicada de Neuraxis y su ruta de exportación, sin afirmar un algoritmo de aprendizaje nuevo. Las ablaciones y las comparaciones de implementación de referencia frente a optimizada son evidencia necesaria, pero ninguna demuestra por sí sola un avance del estado del arte.",
            "limit": "Las cuatro ablaciones conservan los mismos 1.160/1.200 éxitos de tarea, así que este experimento no muestra contribución al éxito por memoria, efectos, aplazamiento o invalidación. Los presupuestos de ejecución difieren entre variantes, y las latencias medidas excluyen la construcción de características en Python. La paridad numérica no calibra la seguridad de la política.",
            "summary": "El resultado negativo de ablación importa: los componentes propuestos no cambian el éxito en esta suite saturada. Las exportaciones nativas cumplen la tolerancia numérica registrada, lo que respalda solo consistencia de implementación.",
        },
    },
]

LABELS = {
    "en": {"objectives": "Objectives", "setup": "Setup", "data": "Data", "method": "Method", "sota": "Comparison", "results": "Results", "summary": "Summary", "references": "References", "language": "English", "level": "Level", "needs": "Prerequisites", "time": "Reading time", "source": "The notebook reads committed product artifacts. Owner: Neuraxis. Repository: https://github.com/fsantibanezleal/CAOS_Neuraxis. License: Apache-2.0. The JSON is a first-party, frozen experiment artifact; no external benchmark data are redistributed in this notebook.", "data_read": "Load the canonical index, verify its SHA-256 against the separately produced adequacy audit, and select the topic's declared case slice.", "package_run": "Rebuild the exact recorded M01 observation with Reflexmesh's public typed contracts. Invoke the released guard and compare its action with the independently recorded trace.", "compare": "Compute the published method-level outcomes from the canonical aggregate, retaining the original episodes as denominators. This is analysis of frozen package runs, not a new fit.", "variant": "Expose the case-by-variant slice so a strong aggregate cannot hide the failure mode relevant to this topic.", "transfer": "Read the separately hashed transfer lane. Never pool it with the core matrix.", "install": "The versions below are pinned in `notebooks/requirements.txt` and are also recorded in this notebook's metadata.", "empty": "No generated outputs are committed by this authoring step; `scripts/run_notebooks.py` executes and stores them from a fresh kernel."},
    "es": {"objectives": "Objetivos", "setup": "Preparación", "data": "Datos", "method": "Método", "sota": "Comparación", "results": "Resultados", "summary": "Resumen", "references": "Referencias", "language": "Español", "level": "Nivel", "needs": "Requisitos previos", "time": "Tiempo de lectura", "source": "El notebook lee artefactos comprometidos del producto. Propietario: Neuraxis. Repositorio: https://github.com/fsantibanezleal/CAOS_Neuraxis. Licencia: Apache-2.0. El JSON es un artefacto experimental propio y congelado; este notebook no redistribuye datos de benchmarks externos.", "data_read": "Carga el índice canónico, verifica su SHA-256 frente a la auditoría de adecuación generada por separado y selecciona la porción declarada del tema.", "package_run": "Reconstruye la observación M01 registrada con los contratos tipados públicos de Reflexmesh. Ejecuta la regla publicada y compara la acción con la traza registrada de forma independiente.", "compare": "Calcula los resultados publicados por método desde el agregado canónico, conservando los episodios originales como denominadores. Es análisis de corridas congeladas del paquete, no un ajuste nuevo.", "variant": "Expone la porción por caso y variante para que un agregado sólido no oculte el modo de fallo pertinente al tema.", "transfer": "Lee por separado el carril de transferencia con hash. Nunca lo combina con la matriz central.", "install": "Las versiones siguientes están fijadas en `notebooks/requirements.txt` y también constan en los metadatos de este notebook.", "empty": "Este paso de autoría no compromete salidas generadas; `scripts/run_notebooks.py` las ejecuta y guarda desde un kernel nuevo."},
}


def md(text: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True)}


def code(text: str) -> dict:
    return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": text.splitlines(keepends=True)}


def code_cells(topic: dict, lang: str, level: int) -> list[dict]:
    sample_case, methods = topic["sample_case"], topic["methods"]
    es = lang == "es"
    root_setup = (
        "# Lee la evidencia comprometida y usa la API publicada; nunca define otra política."
        if es else "# Read committed evidence and use the released API; never define another policy."
    )
    install_versions = " / ".join(PACKAGES)
    prose = {
        "versions": "Comprueba las versiones fijadas del entorno." if es else "Check the pinned analysis environment.",
        "evidence": "Verifica la auditoría y los bytes de cada traza antes de interpretar resultados." if es else "Verify the audit and each trace's bytes before interpreting outcomes.",
        "run": "Ejecuta cada método disponible del paquete en un entorno de caso aislado y compara su resultado independiente con la corrida congelada." if es else "Run each available package method in an isolated case environment and compare its independent outcome with the frozen run.",
        "analysis": "Calcula la matriz completa por variante para este caso; cada celda conserva fallos y denominador." if es else "Compute the complete per-variant matrix for this case; every cell retains failures and its denominator.",
    }
    code_lang = "# " + ("Los resultados de planificación se leen de las trazas congeladas; no hay llamada implícita a un LLM." if es else "Planner outcomes come from frozen traces; no LLM call is implicit.")
    cells = [md("### " + prose["versions"]), code("# Setup is performed outside the notebook; report the exact runtime pins.\nimport importlib.metadata\nfor distribution in ('reflexmesh', 'numpy', 'matplotlib', 'torch', 'joblib', 'gymnasium', 'scikit-learn', 'stable-baselines3', 'sb3-contrib'):\n    print('{}=={}'.format(distribution, importlib.metadata.version(distribution)))")]
    cells += [md("### " + prose["evidence"])]
    prep = (
        f"{root_setup}\nimport hashlib, json\nfrom pathlib import Path\nROOT = Path('../../../').resolve()\nindex_path = ROOT / 'data/derived/index.json'\nindex_bytes = index_path.read_bytes()\nindex = json.loads(index_bytes)\naudit = json.loads((ROOT / 'data/derived/benchmark-adequacy.json').read_text(encoding='utf-8'))\nassert hashlib.sha256(index_bytes).hexdigest() == audit['index_sha256']\nselected_methods = {methods!r}\nsample_case = {sample_case!r}\nseed = 40000\nrecords = {{}}\nfor method_id in selected_methods:\n    row = next(r for r in index['episodes'] if r['method_id'] == method_id and r['case_id'] == sample_case and r['variant'] == 'nominal' and r['seed'] == seed)\n    trace_path = ROOT / 'data/derived' / row['path']\n    trace_bytes = trace_path.read_bytes()\n    assert hashlib.sha256(trace_bytes).hexdigest() == row['sha256']\n    records[method_id] = json.loads(trace_bytes)\nprint('Index digest:', hashlib.sha256(index_bytes).hexdigest())\nprint('Evidence records:', len(records), '| case:', sample_case, '| seed:', seed)\nprint('Methods:', ', '.join(selected_methods))"
    )
    cells.append(code(prep))
    cells.append(md("### " + ("Inspecciona las decisiones y resultados originales" if es else "Inspect the original decisions and outcomes")))
    inspect = (
        "# Resume la primera acción registrada, los candidatos autorizados y el resultado del oráculo independiente.\nfor method_id, episode in records.items():\n    first = episode['decisions'][0]\n    allowed = [candidate['action'] for candidate in first['candidates'] if candidate['allowed']]\n    print(method_id, '| action=', first['action'], '| reason=', first['reason'], '| allowed=', allowed)\n    print('  success=', episode['metrics']['task_success'], '| steps=', episode['metrics']['steps'], '| violations=', episode['metrics']['violations'])"
        if es else
        "# Summarize the recorded first action, authorized candidates, and independent oracle outcome.\nfor method_id, episode in records.items():\n    first = episode['decisions'][0]\n    allowed = [candidate['action'] for candidate in first['candidates'] if candidate['allowed']]\n    print(method_id, '| action=', first['action'], '| reason=', first['reason'], '| allowed=', allowed)\n    print('  success=', episode['metrics']['task_success'], '| steps=', episode['metrics']['steps'], '| violations=', episode['metrics']['violations'])"
    )
    cells.append(code(inspect))

    if level >= 2:
        cells.append(md("### " + ("Ejecuta las políticas publicadas y compara la corrida" if es else "Execute the released policies and compare the run")))
        run = (
            f"{code_lang}\nimport os\nfrom pathlib import Path\nfrom reflexmesh.environments import CaseSpec, SoftwareEnvironment\nfrom reflexmesh.pipeline import make_policy\nfrom reflexmesh.planners import OllamaPlanner\ncheckpoint_dir = Path(os.environ.get('NEURAXIS_CHECKPOINTS', str(ROOT / 'models/checkpoints')))\nplanner_model = os.environ.get('NEURAXIS_NOTEBOOK_MODEL')\nreruns = {{}}\nfor method_id in selected_methods:\n    if method_id in ('M09', 'M10') and not planner_model:\n        print(method_id, 'not rerun: planner needs explicit NEURAXIS_NOTEBOOK_MODEL; frozen result remains above')\n        continue\n    planner = OllamaPlanner(planner_model) if planner_model and method_id in ('M09', 'M10', 'M11', 'M12') else None\n    policy = make_policy(method_id, checkpoint_dir, planner=planner)\n    policy.reset('neuraxis-notebook-' + method_id)\n    with SoftwareEnvironment(CaseSpec(sample_case, 'nominal', seed)) as env:\n        while not env.terminal:\n            _, outcome = env.step(policy.predict(env.observe()))\n        success = env.verify()\n    recorded = records[method_id]\n    reruns[method_id] = {{'success': success, 'recorded_success': bool(recorded['metrics']['task_success']), 'recorded_first_action': recorded['decisions'][0]['action']}}\n    print(method_id, reruns[method_id])"
        )
        cells.append(code(run))
        cells.append(md("### " + ("Compara la secuencia completa y no solo la primera acción" if es else "Compare the full sequence, not only the first action")))
        sequence = (
            "# La igualdad de secuencia es diagnóstica; la verificación independiente decide el éxito.\nfor method_id, episode in records.items():\n    actions = [decision['action'] for decision in episode['decisions']]\n    print(method_id, ' -> '.join(actions), '| terminal=', episode['status'], '| verified=', episode['metrics']['task_success'])"
            if es else
            "# Sequence equality is diagnostic; the independent verifier determines task success.\nfor method_id, episode in records.items():\n    actions = [decision['action'] for decision in episode['decisions']]\n    print(method_id, ' -> '.join(actions), '| terminal=', episode['status'], '| verified=', episode['metrics']['task_success'])"
        )
        cells.append(code(sequence))

    if level >= 3:
        cells.append(md("### " + ("Recalcula resultados por variante desde todas las trazas del caso" if es else "Recompute per-variant outcomes from every trace in the case")))
        analysis = (
            "# Lee todas las semillas del caso elegido y conserva cada episodio fallido en el denominador.\nfrom collections import defaultdict\ngroups = defaultdict(list)\nfor row in index['episodes']:\n    if row['case_id'] not in (sample_case,) or row['method_id'] not in selected_methods:\n        continue\n    raw = (ROOT / 'data/derived' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    episode = json.loads(raw)\n    groups[(row['method_id'], row['variant'])].append(int(bool(episode['metrics']['task_success'])))\nfor (method_id, variant), values in sorted(groups.items()):\n    print(method_id, variant, 'successes=', sum(values), 'episodes=', len(values), 'rate=', round(sum(values)/len(values), 3))"
            if es else
            "# Read every seed for the selected case and keep each failed episode in the denominator.\nfrom collections import defaultdict\ngroups = defaultdict(list)\nfor row in index['episodes']:\n    if row['case_id'] not in (sample_case,) or row['method_id'] not in selected_methods:\n        continue\n    raw = (ROOT / 'data/derived' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    episode = json.loads(raw)\n    groups[(row['method_id'], row['variant'])].append(int(bool(episode['metrics']['task_success'])))\nfor (method_id, variant), values in sorted(groups.items()):\n    print(method_id, variant, 'successes=', sum(values), 'episodes=', len(values), 'rate=', round(sum(values)/len(values), 3))"
        )
        cells.append(code(analysis))
        cells.append(md("### " + ("Visualiza el estrés por variante sin mezclar familias" if es else "Plot the variant stress without pooling families")))
        plot = (
            "# Cada punto resume las semillas de una sola variante del caso, no el benchmark completo.\nimport matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom IPython.display import display\nvariants = sorted(set(key[1] for key in groups))\nfig, ax = plt.subplots(figsize=(9, 4.5), constrained_layout=True)\nfor method_id in selected_methods:\n    rates = [sum(groups[(method_id, variant)])/len(groups[(method_id, variant)]) if groups[(method_id, variant)] else float('nan') for variant in variants]\n    ax.plot(variants, rates, marker='o', label=method_id)\nax.set_ylim(-0.05, 1.05)\nax.set_ylabel('Tasa de éxito verificado')\nax.set_title(sample_case + ' por variante')\nax.tick_params(axis='x', rotation=25)\nax.grid(axis='y', alpha=.25)\nax.legend()\ndisplay(fig)\nplt.close(fig)"
            if es else
            "# Each point summarizes the seeds from one case variant, not the full benchmark.\nimport matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nfrom IPython.display import display\nvariants = sorted(set(key[1] for key in groups))\nfig, ax = plt.subplots(figsize=(9, 4.5), constrained_layout=True)\nfor method_id in selected_methods:\n    rates = [sum(groups[(method_id, variant)])/len(groups[(method_id, variant)]) if groups[(method_id, variant)] else float('nan') for variant in variants]\n    ax.plot(variants, rates, marker='o', label=method_id)\nax.set_ylim(-0.05, 1.05)\nax.set_ylabel('Verified success rate')\nax.set_title(sample_case + ' by variant')\nax.tick_params(axis='x', rotation=25)\nax.grid(axis='y', alpha=.25)\nax.legend()\ndisplay(fig)\nplt.close(fig)"
        )
        cells.append(code(plot))
        if topic["slug"] == "04-deliberation-allocation":
            cells.extend([md("### " + ("Audita el estudio de enrutamiento por separado" if es else "Audit the routing study separately")), code(
                "# Este experimento offline no se combina con el benchmark central.\nrouting = json.loads((ROOT / 'data/derived/semantic-routing-study/analysis.json').read_text(encoding='utf-8'))\nprint('threshold=', routing['selected_threshold'], '| fit positives=', routing['fit_positives'], '| calibration positives=', routing['calibration_positives'])\nfor arm, result in routing['test'].items():\n    print(arm, result)" if es else
                "# This offline experiment is never pooled with the core benchmark.\nrouting = json.loads((ROOT / 'data/derived/semantic-routing-study/analysis.json').read_text(encoding='utf-8'))\nprint('threshold=', routing['selected_threshold'], '| fit positives=', routing['fit_positives'], '| calibration positives=', routing['calibration_positives'])\nfor arm, result in routing['test'].items():\n    print(arm, result)")])
        if topic["slug"] == "05-evaluation-and-transfer":
            cells.extend([md("### " + ("Conserva transferencia semántica en su propio carril" if es else "Keep semantic transfer in its own lane")), code(
                "# Verifica el índice y muestra los agregados de transferencia sin combinarlos con el núcleo.\ntransfer_path = ROOT / 'data/derived/semantic-transfer/index.json'\ntransfer_bytes = transfer_path.read_bytes()\ntransfer = json.loads(transfer_bytes)\ntransfer_report = json.loads((ROOT / 'data/derived/semantic-transfer/report.json').read_text(encoding='utf-8'))\nassert hashlib.sha256(transfer_bytes).hexdigest() == transfer_report['index_sha256']\nfor row in transfer['aggregate_results']:\n    if row['method_id'] in selected_methods:\n        print(row['method_id'], 'successes=', round(row['task_success'] * row['episodes']), 'episodes=', row['episodes'], 'rate=', row['task_success'])\nprint('transfer episodes=', transfer_report['episodes_checked'], '| families=', len(transfer['cases']))" if es else
                "# Verify the index and display transfer aggregates without pooling them with core.\ntransfer_path = ROOT / 'data/derived/semantic-transfer/index.json'\ntransfer_bytes = transfer_path.read_bytes()\ntransfer = json.loads(transfer_bytes)\ntransfer_report = json.loads((ROOT / 'data/derived/semantic-transfer/report.json').read_text(encoding='utf-8'))\nassert hashlib.sha256(transfer_bytes).hexdigest() == transfer_report['index_sha256']\nfor row in transfer['aggregate_results']:\n    print(row['method_id'], 'successes=', round(row['task_success'] * row['episodes']), 'episodes=', row['episodes'], 'rate=', row['task_success'])\nprint('transfer episodes=', transfer_report['episodes_checked'], '| families=', len(transfer['cases']))")])
            cells.extend([md("### " + ("Verifica trazas semánticas y comparaciones emparejadas" if es else "Verify semantic traces and paired comparisons")), code(
                "# Relee todas las trazas semánticas, verifica sus hashes y empareja por caso, variante y semilla.\nsemantic_pairs = {}\nfor row in transfer['episodes']:\n    raw = (ROOT / 'data/derived/semantic-transfer' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    outcome = int(bool(json.loads(raw)['metrics']['task_success']))\n    semantic_pairs[(row['method_id'], row['case_id'], row['variant'], row['seed'])] = outcome\nassert len(semantic_pairs) == transfer_report['episodes_checked'] == 1536\nfor method_id in sorted({key[0] for key in semantic_pairs}):\n    vals = [value for key, value in semantic_pairs.items() if key[0] == method_id]\n    print(method_id, 'successes=', sum(vals), '/', len(vals), 'rate=', round(sum(vals)/len(vals), 4))\nfor opponent in ('M04', 'M09'):\n    paired = [(semantic_pairs[(opponent, case, variant, seed)], semantic_pairs[('M12', case, variant, seed)]) for _, case, variant, seed in semantic_pairs if _ == opponent]\n    wins = sum(a > b for a, b in paired); losses = sum(a < b for a, b in paired)\n    print('M12 vs', opponent, '| pairs=', len(paired), '| M12 wins=', losses, '| M12 losses=', wins, '| ties=', len(paired)-wins-losses)\nprint('Persisted M12 paired audit:', transfer_report['m12_paired'])" if es else
                "# Re-read every semantic trace, verify its hash, and pair by case, variant, and seed.\nsemantic_pairs = {}\nfor row in transfer['episodes']:\n    raw = (ROOT / 'data/derived/semantic-transfer' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    outcome = int(bool(json.loads(raw)['metrics']['task_success']))\n    semantic_pairs[(row['method_id'], row['case_id'], row['variant'], row['seed'])] = outcome\nassert len(semantic_pairs) == transfer_report['episodes_checked'] == 1536\nfor method_id in sorted({key[0] for key in semantic_pairs}):\n    vals = [value for key, value in semantic_pairs.items() if key[0] == method_id]\n    print(method_id, 'successes=', sum(vals), '/', len(vals), 'rate=', round(sum(vals)/len(vals), 4))\nfor opponent in ('M04', 'M09'):\n    paired = [(semantic_pairs[(opponent, case, variant, seed)], semantic_pairs[('M12', case, variant, seed)]) for _, case, variant, seed in semantic_pairs if _ == opponent]\n    wins = sum(a > b for a, b in paired); losses = sum(a < b for a, b in paired)\n    print('M12 vs', opponent, '| pairs=', len(paired), '| M12 wins=', losses, '| M12 losses=', wins, '| ties=', len(paired)-wins-losses)\nprint('Persisted M12 paired audit:', transfer_report['m12_paired'])")])
            cells.extend([md("### " + ("Recalcula la matriz central completa y sus pares" if es else "Recompute the complete core matrix and paired outcomes")), code(
                "# Verifica SHA-256 por episodio, recalcula resultados y mide variación entre semillas.\nfrom collections import defaultdict\nassert hashlib.sha256(index_bytes).hexdigest() == audit['index_sha256']\ncore_outcomes = {}\nseed_variation = defaultdict(set)\nfor row in index['episodes']:\n    raw = (ROOT / 'data/derived' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    outcome = int(bool(json.loads(raw)['metrics']['task_success']))\n    key = (row['method_id'], row['case_id'], row['variant'], row['seed'])\n    core_outcomes[key] = outcome\n    seed_variation[key[:3]].add(outcome)\nassert len(core_outcomes) == 14400 and len(seed_variation) == 1440\nprint('Hash-verified episodes:', len(core_outcomes))\nfor row in sorted(index['aggregate_results'], key=lambda r: r['method_id']):\n    print(row['method_id'], round(row['task_success']*row['episodes']), '/', row['episodes'], '| rate=', round(row['task_success'],4), '| decision p50/p95 ms=', round(row['controller_p50_ms'],4), round(row['controller_p95_ms'],4))\nvariable_cells = sum(len(values) > 1 for values in seed_variation.values())\nassert variable_cells == audit['seed_variable_cells'] == 71\nprint('Seed-variable method/case/variant cells:', variable_cells, '/', len(seed_variation))\nfor left, right in [('M01','M12'), ('M04','M12'), ('M09','M12')]:\n    pairs = [(core_outcomes[(left,c,v,s)], core_outcomes[(right,c,v,s)]) for _,c,v,s in core_outcomes if _ == left]\n    wins = sum(a > b for a,b in pairs); losses = sum(a < b for a,b in pairs)\n    print(left, 'vs', right, '| paired=',len(pairs),'| left wins=',wins,'| right wins=',losses,'| ties=',len(pairs)-wins-losses)\nresearch = json.loads((ROOT / 'data/derived/research.json').read_text(encoding='utf-8'))\nprint('Structural transfer (separate 288-episode lane):')\nfor row in research['transfer']['methods']:\n    print(row['method_id'], row['successes'], '/', row['episodes'], '| rate=', row['success_rate'])" if es else
                "# Verify per-episode SHA-256, recompute outcomes, and measure variation across seeds.\nfrom collections import defaultdict\nassert hashlib.sha256(index_bytes).hexdigest() == audit['index_sha256']\ncore_outcomes = {}\nseed_variation = defaultdict(set)\nfor row in index['episodes']:\n    raw = (ROOT / 'data/derived' / row['path']).read_bytes()\n    assert hashlib.sha256(raw).hexdigest() == row['sha256']\n    outcome = int(bool(json.loads(raw)['metrics']['task_success']))\n    key = (row['method_id'], row['case_id'], row['variant'], row['seed'])\n    core_outcomes[key] = outcome\n    seed_variation[key[:3]].add(outcome)\nassert len(core_outcomes) == 14400 and len(seed_variation) == 1440\nprint('Hash-verified episodes:', len(core_outcomes))\nfor row in sorted(index['aggregate_results'], key=lambda r: r['method_id']):\n    print(row['method_id'], round(row['task_success']*row['episodes']), '/', row['episodes'], '| rate=', round(row['task_success'],4), '| decision p50/p95 ms=', round(row['controller_p50_ms'],4), round(row['controller_p95_ms'],4))\nvariable_cells = sum(len(values) > 1 for values in seed_variation.values())\nassert variable_cells == audit['seed_variable_cells'] == 71\nprint('Seed-variable method/case/variant cells:', variable_cells, '/', len(seed_variation))\nfor left, right in [('M01','M12'), ('M04','M12'), ('M09','M12')]:\n    pairs = [(core_outcomes[(left,c,v,s)], core_outcomes[(right,c,v,s)]) for _,c,v,s in core_outcomes if _ == left]\n    wins = sum(a > b for a,b in pairs); losses = sum(a < b for a,b in pairs)\n    print(left, 'vs', right, '| paired=',len(pairs),'| left wins=',wins,'| right wins=',losses,'| ties=',len(pairs)-wins-losses)\nresearch = json.loads((ROOT / 'data/derived/research.json').read_text(encoding='utf-8'))\nprint('Structural transfer (separate 288-episode lane):')\nfor row in research['transfer']['methods']:\n    print(row['method_id'], row['successes'], '/', row['episodes'], '| rate=', row['success_rate'])")])
        if topic["slug"] == "06-ablation-and-export-parity":
            cells.extend([md("### " + ("Recalcula las ablaciones emparejadas" if es else "Recompute the matched ablations")), code(
                "# La investigación está ligada al digest del índice canónico y conserva emparejamiento por celda.\nresearch = json.loads((ROOT / 'data/derived/research.json').read_text(encoding='utf-8'))\nassert research['core']['index_sha256'] == hashlib.sha256(index_bytes).hexdigest()\nfull = next(row for row in research['core']['methods'] if row['method_id']=='M12')\nprint('Full M12:', full['successes'], '/', full['episodes'], '| rate=', full['success_rate'])\nfor name, result in research['ablations'].items():\n    ablated = next(row for row in result['methods'] if row['method_id']=='M12')\n    paired = result['paired_full_minus_ablation']\n    assert paired['paired_cells'] == ablated['episodes'] == 1200\n    assert ablated['successes'] == full['successes']\n    print(name, '| successes=', ablated['successes'], '/', ablated['episodes'], '| paired delta=', paired['success_difference_left_minus_right'], '| seed bootstrap95=', paired['paired_seed_bootstrap95'], '| full-minus-ablation wall ms=', round(paired['mean_wall_difference_ms_left_minus_right'],3), '| scope=', paired['scope'])\nassert len(research['ablations']) == 4" if es else
                "# Research is bound to the canonical index digest and preserves cell-level pairing.\nresearch = json.loads((ROOT / 'data/derived/research.json').read_text(encoding='utf-8'))\nassert research['core']['index_sha256'] == hashlib.sha256(index_bytes).hexdigest()\nfull = next(row for row in research['core']['methods'] if row['method_id']=='M12')\nprint('Full M12:', full['successes'], '/', full['episodes'], '| rate=', full['success_rate'])\nfor name, result in research['ablations'].items():\n    ablated = next(row for row in result['methods'] if row['method_id']=='M12')\n    paired = result['paired_full_minus_ablation']\n    assert paired['paired_cells'] == ablated['episodes'] == 1200\n    assert ablated['successes'] == full['successes']\n    print(name, '| successes=', ablated['successes'], '/', ablated['episodes'], '| paired delta=', paired['success_difference_left_minus_right'], '| seed bootstrap95=', paired['paired_seed_bootstrap95'], '| full-minus-ablation wall ms=', round(paired['mean_wall_difference_ms_left_minus_right'],3), '| scope=', paired['scope'])\nassert len(research['ablations']) == 4")])
            cells.extend([md("### " + ("Audita la paridad numérica de M03/M04" if es else "Audit M03/M04 numerical parity")), code(
                "# La paridad numérica no demuestra seguridad, calibración de decisiones ni generalización.\nfor method_id, result in research['native_parity']['results'].items():\n    assert result['passed'] and result['vectors'] == 484 and result['split_thresholds'] == 76\n    assert result['max_abs_probability_error'] <= result['tolerance']\n    timing = result['warmed_latency_ms']\n    print(method_id, '| vectors=',result['vectors'],'| thresholds=',result['split_thresholds'],'| max error=',result['max_abs_probability_error'],'<=',result['tolerance'])\n    print('  warmed p50/p95 ms native=',timing['native_cached']['50'],timing['native_cached']['95'],'| Python=',timing['python_reference']['50'],timing['python_reference']['95'])\n    print('  scope:',result['warmed_timing_scope'])\nprint(research['native_parity']['note'])" if es else
                "# Numerical parity does not establish safety, decision calibration, or generalization.\nfor method_id, result in research['native_parity']['results'].items():\n    assert result['passed'] and result['vectors'] == 484 and result['split_thresholds'] == 76\n    assert result['max_abs_probability_error'] <= result['tolerance']\n    timing = result['warmed_latency_ms']\n    print(method_id, '| vectors=',result['vectors'],'| thresholds=',result['split_thresholds'],'| max error=',result['max_abs_probability_error'],'<=',result['tolerance'])\n    print('  warmed p50/p95 ms native=',timing['native_cached']['50'],timing['native_cached']['95'],'| Python=',timing['python_reference']['50'],timing['python_reference']['95'])\n    print('  scope:',result['warmed_timing_scope'])\nprint(research['native_parity']['note'])")])
    return cells


def create(topic: dict, lang: str, level: int) -> None:
    t, lab = topic[lang], LABELS[lang]
    suffix = ["the-problem-and-the-data", "the-method-in-practice", "prior-methods-comparison"][level - 1]
    filename = f"{level:02d}-{suffix}.ipynb"
    title = f"{t['name']}: {['fundamentals', 'method in practice', 'comparison of prior methods'][level-1]}" if lang == "en" else f"{t['name']}: {['fundamentos', 'método en la práctica', 'comparación de métodos previos'][level-1]}"
    prereq = t["needs"] if level == 1 else topic[lang]["name"] + (" level 1" if lang == "en" else " nivel 1")
    reading = ("15 minutes" if lang == "en" else "15 minutos") if level == 1 else ("25 minutes" if lang == "en" else "25 minutos")
    headings = lab
    cells = [md(f"# {title}\n\n**{lab['level']}:** {level}  \n**{lab['needs']}:** {prereq}  \n**{lab['time']}:** {reading}")]
    sample_traces = [f"data/derived/episodes/{method}-{topic['sample_case']}-nominal-40000.json" for method in topic["methods"]]
    topic["data"] = list(dict.fromkeys([*topic["data"], *sample_traces]))
    data_text = (
        f"{lab['source']}\n\nThis notebook reads `{topic['data'][0]}` and the listed trace artifacts. The method run uses an isolated Reflexmesh case workspace. For learned methods, fetch the exact public release assets with `python -m reflexmesh.cli fetch-models --destination models/checkpoints --version {CHECKPOINT_RELEASE}`, then set `NEURAXIS_CHECKPOINTS` to that folder. The release manifest verifies asset hashes. Planner methods M09/M10 are read from frozen traces unless `NEURAXIS_NOTEBOOK_MODEL` explicitly names a configured local Ollama model."
        if lang == "en" else
        f"{lab['source']}\n\nEste notebook lee `{topic['data'][0]}` y las trazas listadas. La ejecución usa un espacio aislado de caso Reflexmesh. Para métodos aprendidos, descarga los activos públicos exactos con `python -m reflexmesh.cli fetch-models --destination models/checkpoints --version {CHECKPOINT_RELEASE}` y define `NEURAXIS_CHECKPOINTS` hacia esa carpeta. El manifiesto de publicación verifica los hashes. M09/M10 se leen desde trazas congeladas, salvo que `NEURAXIS_NOTEBOOK_MODEL` indique explícitamente un modelo Ollama local configurado."
    )
    artifact_heading = "Artefactos de esta lección:" if lang == "es" else "Artifacts for this lesson:"
    data_text += "\n\n" + artifact_heading + "\n\n" + "\n".join(f"- `{path}`" for path in topic["data"])
    sections = [
        (headings["objectives"], f"The learning objective is to explain the problem and its data, then inspect and, at higher levels, execute the released method on its matched task. {t['problem']}" if lang == "en" else f"El objetivo es explicar el problema y sus datos, inspeccionar y, en niveles superiores, ejecutar el método publicado en su tarea emparejada. {t['problem']}"),
        (headings["setup"], f"{lab['install']}\n\n```bash\npip install {' '.join(PACKAGES)}\n```"),
        (headings["data"], data_text),
        (headings["method"], f"{t['method']}\n\n{t['equation']}"),
    ]
    if level >= 3:
        sections.append((headings["sota"], t["sota"]))
    sections.append((headings["results"], f"{t['limit']}\n\n{lab['empty']}"))
    sections.append((headings["summary"], t["summary"]))
    references = "\n".join(f"- [{key.upper()}]({SOURCES[key]})" for key in topic["sources"])
    sections.append((headings["references"], references))
    for heading, body in sections:
        cells.append(md(f"## {heading}\n\n{body}"))
        if heading == headings["method"]:
            cells.extend(code_cells(topic, lang, level))
    for number, cell in enumerate(cells, 1):
        cell["id"] = f"cell-{number:03d}"
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python"},
            "caos": {"language": lang, "topic": topic["slug"], "level": level, "title": title,
                     "packages": PACKAGES, "data": topic["data"], "sources": [SOURCES[s] for s in topic["sources"]], "beyond": []},
        },
        "nbformat": 4, "nbformat_minor": 5,
    }
    path = ROOT / "notebooks" / lang / topic["slug"] / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(nb, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    for topic in TOPICS:
        for lang in ("en", "es"):
            for level in (1, 2, 3):
                create(topic, lang, level)
    print(f"authored {len(TOPICS) * 2 * 3} bilingual, topic-ordered notebook sources; outputs are left to run_notebooks.py")
