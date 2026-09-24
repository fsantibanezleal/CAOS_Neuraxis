import type { ArchitectureConfig } from '@fasl-work/caos-app-shell';
// The shared Architecture modal resolves paths against Vite BASE_URL itself.
const svg = (name: string) => `svg/tech/${name}.svg`;
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
        'The browser operates a deterministic virtual workspace with exact policies. The authenticated runtime executes registered software cases with trained policies, or user-authored recipes under a strict dependency controller in an operator-configured workspace. Offline computation fits and evaluates models. Canonical replay never repeats effects.',
      body_es:
        'El navegador opera un espacio virtual determinista. El motor autenticado ejecuta casos con políticas entrenadas o recetas del usuario mediante dependencias estrictas en un espacio configurado por el operador. El cómputo fuera de línea ajusta y evalúa. La reproducción canónica nunca repite efectos.',
      svg: svg('02-lanes'),
    },
    {
      id: 'web',
      en: 'Workbench flow',
      es: 'Flujo del banco',
      body_en:
        'A selected case, policy, lane and parameter set determine a run. Run, step, fault and cancel modify the appropriate live lane. Timeline, resource, probability, effect and coordination instruments share a decision cursor. Import is data only; export preserves parameters and provenance.',
      body_es:
        'Caso, política, modo y parámetros determinan la ejecución. Ejecutar, paso, fallo y cancelar modifican el modo correspondiente. Instrumentos de cronología, recursos, probabilidades, efectos y coordinación comparten cursor. Importar solo carga datos; exportar conserva procedencia.',
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
