import type { ArchitectureConfig } from '@fasl-work/caos-app-shell';
import app from './diagrams/01-the-app.svg?raw';
import lanes from './diagrams/02-lanes.svg?raw';
import web from './diagrams/03-web-flow.svg?raw';
import science from './diagrams/04-the-science.svg?raw';
import contracts from './diagrams/05-data-contracts.svg?raw';
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
        'Whole workflow groups are separated before fitting. Training, calibration and frozen evaluation have different roles. Persistent state, effect prediction and learned deferral are compared with exact, supervised, recurrent, bandit, PPO and planner baselines. Report task outcomes independently of demonstration agreement.',
      body_es:
        'Los grupos se separan antes de ajustar. Entrenamiento, calibración y evaluación cumplen roles distintos. Persistencia, predicción y derivación se comparan con referencias exactas, supervisadas, recurrentes, bandidos, PPO y planificadores. Resultados de tarea se separan del acuerdo demostrado.',
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
