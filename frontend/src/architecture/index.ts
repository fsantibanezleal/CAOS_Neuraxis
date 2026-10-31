import type { ArchitectureConfig } from '@fasl-work/caos-app-shell';
import app from './01-the-app.svg?raw';
import lanes from './02-lanes.svg?raw';
import web from './03-web-flow.svg?raw';
import science from './04-the-science.svg?raw';
import contracts from './05-data-contracts.svg?raw';
const diagrams: Record<string, string> = {
  '01-the-app': app,
  '02-lanes': lanes,
  '03-web-flow': web,
  '04-the-science': science,
  '05-data-contracts': contracts,
};
const svg = (name: string) => diagrams[name];
export const architecture: ArchitectureConfig = {
  tabs: [
    {
      id: 'app',
      en: 'The app',
      es: 'La aplicación',
      body_en:
        'Neuraxis is an inspectable software-control workbench. Observations feed persistent state; policies propose bounded actions; the execution broker checks capabilities and revisions; independent outcomes produce replayable evidence. A policy score never grants authority.',
      body_es:
        'Neuraxis es un banco de control inspeccionable. Observaciones actualizan estado; políticas proponen acciones; el ejecutor comprueba capacidades y revisiones; resultados independientes producen evidencia reproducible. Un puntaje no concede autoridad.',
      svg: svg('01-the-app'),
    },
    {
      id: 'lanes',
      en: 'Execution lanes',
      es: 'Modos de ejecución',
      body_en:
        'Tasks runs bounded file checks and produces verified outputs through the native engine on the same origin. Investigations compares measured controller executions without repeating effects. The advanced view retains deterministic virtual experiments, authenticated trained policies and user-authored recipes in an operator-selected local workspace. Offline computation fits and evaluates models.',
      body_es:
        'Tareas comprueba archivos y produce salidas verificadas mediante el motor nativo del mismo origen. Investigaciones compara ejecuciones medidas sin repetir efectos. La vista avanzada conserva experimentos virtuales, políticas entrenadas autenticadas y recetas en un espacio local seleccionado por el operador. El cómputo fuera de línea ajusta y evalúa modelos.',
      svg: svg('02-lanes'),
    },
    {
      id: 'web',
      en: 'Workbench flow',
      es: 'Flujo del banco',
      body_en:
        'Select a task and supply text files or inspect the owned compound incident. Run the native tools, follow their dependencies and inspect findings at their original file and line. Review accepted CSV rows, rejected rows and independent hash checks; download the evidence or delete the run. Investigations connects each controller decision to an observed state change, receipt and planner request.',
      body_es:
        'Elegir tarea y cargar archivos de texto o inspeccionar el incidente compuesto propio. Ejecutar herramientas nativas, seguir dependencias e inspeccionar hallazgos en archivo y línea originales. Revisar filas aceptadas, rechazadas y hashes; descargar evidencia o eliminar la ejecución. Investigaciones conecta decisiones con cambios observados, recibos y solicitudes al planificador.',
      svg: svg('03-web-flow'),
    },
    {
      id: 'science',
      en: 'Learning and control',
      es: 'Aprendizaje y control',
      body_en:
        'M12 ranks contract-admissible actions and can hand work to a slower planner when expected value exceeds latency cost. On the current benchmark, its learned gate never defers: M12 solves 1,160 of 1,200 core episodes while a guarded finite-state baseline solves 1,200. XGBoost leads M12 on the small transfer set, and four ablations match its task success. The diagrams show the measured mechanism and these limits.',
      body_es:
        'M12 ordena acciones permitidas por contrato y puede delegar al planificador cuando el valor esperado supera el costo de latencia. En la prueba actual, el umbral aprendido nunca delega: M12 resuelve 1.160 de 1.200 episodios y una máquina finita con guardas resuelve los 1.200. XGBoost supera a M12 en la pequeña prueba de transferencia y cuatro ablaciones igualan su éxito. Los diagramas muestran el mecanismo medido y sus límites.',
      svg: svg('04-the-science'),
    },
    {
      id: 'contracts',
      en: 'Contracts and evidence',
      es: 'Contratos y evidencia',
      body_en:
        'Observation, candidate, decision and outcome records define the runtime contract. The artifact contract adds immutable episode identity, model and source hashes, split and metric definitions. Unknown outcomes remain unknown. The native API uses same-origin bearer authentication and limited registered capabilities.',
      body_es:
        'Observación, candidato, decisión y resultado definen el contrato. Los artefactos añaden identidad, hashes, partición y métricas. Resultados desconocidos permanecen desconocidos. La API nativa usa autenticación bearer del mismo origen y capacidades limitadas.',
      svg: svg('05-data-contracts'),
    },
  ],
};
