import { useEffect, useState } from 'react';
import { Callout, Cite, Refs, ReferenceList } from '@fasl-work/caos-app-shell';
import { useArtifacts } from '../api/artifacts';
import { useCopy } from '../i18n';
import { taskLabels, conditionLabels } from '../lib/operations';

const groups: Record<string, string[]> = {
  exact: ['M01', 'M02'],
  supervised: ['M03', 'M04'],
  sequential: ['M05', 'M06', 'M07'],
  modelbased: ['M08'],
  slow: ['M09', 'M10'],
  metacontrol: ['M11', 'M12'],
};
export function MethodEvidence({ section }: { section: string }) {
  const { lang } = useCopy();
  const { index, error } = useArtifacts();
  const records = (Array.isArray(index?.aggregate_results) ? index.aggregate_results : []) as {
    method_id: string;
    episodes: number;
    task_success: number;
    wall_ms: number;
    delegations: number;
    steps: number;
  }[];
  const rows = records.filter((r) => groups[section]?.includes(r.method_id));
  if (!rows.length)
    return (
      <div className="science-measurement" role={error ? 'alert' : 'status'}>
        {error
          ? lang === 'en'
            ? 'Measured evidence could not be loaded. Reload to retry.'
            : 'No se pudo cargar la evidencia medida. Recargar para reintentar.'
          : lang === 'en'
            ? 'Loading measured evidence…'
            : 'Cargando evidencia medida…'}
      </div>
    );
  return (
    <section className="science-measurement">
      <h3>
        {lang === 'en'
          ? 'What the frozen implementation achieved'
          : 'Resultados de la implementación congelada'}
      </h3>
      <p className="measure">
        {lang === 'en'
          ? 'These measurements come from the published core experiment, using actual files, processes and local HTTP. They test the implementation described above; they do not establish a general advantage over other controllers.'
          : 'Estas mediciones provienen del experimento principal publicado, con archivos, procesos y HTTP local reales. Evalúan la implementación descrita; no establecen una ventaja general sobre otros controladores.'}{' '}
        <Cite id="reflexmesh2026" />
      </p>
      <div className="nx-table-scroll">
        <table className="nx-table">
          <thead>
            <tr>
              <th>{lang === 'en' ? 'Method' : 'Método'}</th>
              <th>{lang === 'en' ? 'Episodes' : 'Episodios'}</th>
              <th>{lang === 'en' ? 'Verified success' : 'Éxito verificado'}</th>
              <th>{lang === 'en' ? 'Mean elapsed' : 'Tiempo medio'}</th>
              <th>{lang === 'en' ? 'Mean planner starts' : 'Inicios medios del planificador'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.method_id}>
                <th>{r.method_id}</th>
                <td>{r.episodes}</td>
                <td>{(r.task_success * 100).toFixed(2)}%</td>
                <td>{r.wall_ms.toFixed(2)} ms</td>
                <td>{r.delegations.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section === 'metacontrol' && (
        <Callout
          variant="honest"
          title={
            lang === 'en'
              ? 'Negative learned-advantage finding'
              : 'Resultado negativo sobre ventaja aprendida'
          }
        >
          {lang === 'en'
            ? 'Both learned gates selected threshold 1.01 and never delegated through the fitted gate. M12 still used separately declared surprise/evidence triggers. It completed 1,160 of 1,200 core episodes, and none of the four fixed-gate ablations changed success. These results do not demonstrate that the combined architecture improves task completion.'
            : 'Ambas puertas aprendidas eligieron umbral 1,01 y nunca delegaron mediante esa puerta. M12 utilizó disparadores separados de sorpresa y evidencia. Completó 1.160 de 1.200 episodios y ninguna de las cuatro ablaciones cambió el éxito. Los resultados no demuestran que combinar mecanismos mejore la finalización.'}
        </Callout>
      )}
    </section>
  );
}
type StudyRow = {
  run_id: string;
  task: keyof typeof taskLabels;
  variant: string;
  seed: number;
  path: string;
  sha256: string;
  status: string;
  disposition: string;
  findings: number;
  wall_ms: number;
  files: number;
  verified_nodes: number;
  native_receipts: number;
};
export function OperationStudy() {
  const { lang } = useCopy();
  const c = (en: string, es: string) => (lang === 'en' ? en : es);
  const [study, setStudy] = useState<{
    runs: StudyRow[];
    boundary: string;
    source_sha256: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    let alive = true;
    void fetch(`${import.meta.env.BASE_URL}operations/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((v) => {
        if (alive) {
          setStudy(v);
          setSelected(
            v.runs.find((r: StudyRow) => r.task === 'release' && r.variant === 'compound')
              ?.run_id ?? v.runs[0]?.run_id,
          );
        }
      })
      .catch((e) => {
        if (alive) setError(String(e));
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const row = study?.runs.find((r) => r.run_id === selected);
    if (!row) return;
    let alive = true;
    setDetail(null);
    void (async () => {
      if (!/^[a-z0-9-]+\.json$/.test(row.path)) throw new Error('Invalid evidence path');
      const r = await fetch(`${import.meta.env.BASE_URL}operations/${row.path}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const bytes = await r.arrayBuffer();
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');
      if (hash !== row.sha256) throw new Error('Compound evidence hash mismatch');
      const v = JSON.parse(new TextDecoder().decode(bytes));
      if (alive) setDetail(v);
    })().catch((e) => {
      if (alive) setError(String(e));
    });
    return () => {
      alive = false;
    };
  }, [study, selected]);
  return (
    <article className="nx-doc-section">
      <h2>
        {c(
          'Compound tasks: executed files, faults and deliverables',
          'Tareas compuestas: archivos, fallos y entregables ejecutados',
        )}
      </h2>
      <p className="measure">
        {c(
          'This additional study evaluates the operational application end to end. Three task graphs are executed against clean, corrupted, conflicting and combined deliveries with three distinct seeds. Each release bundle contains 54 text files, 400 initial table rows and an 18-job declared dependency graph. The nine-stage release operation checks source syntax, structured configuration, row identities, cross-table relationships, dependency cycles and declared file hashes before assembling and independently checking its deliverables.',
          'Este estudio adicional evalúa la aplicación operativa de extremo a extremo. Tres grafos se ejecutan con entregas válidas, dañadas, conflictivas y combinadas y tres semillas distintas. Cada entrega contiene 54 archivos de texto, 400 filas iniciales y un grafo declarado de 18 tareas. La operación de nueve etapas comprueba sintaxis, configuración, identidades de filas, relaciones entre tablas, ciclos y huellas antes de reunir y verificar independientemente sus entregables.',
        )}{' '}
        <Cite id="neuraxis2026" />
      </p>
      <p className="measure">
        {c(
          'The oracle distinguishes successful analysis from valid input. Corrupted deliveries should produce specific findings while keeping original bytes intact; a correctly detected problem is not an execution failure. Separate tests verify cancellation after a recorded effect, untrusted source remaining unexecuted, session isolation, export fidelity and deletion. These deterministic application workflows are separate from the trained twelve-controller benchmark.',
          'El oráculo distingue análisis exitoso de entrada válida. Las entregas dañadas deben producir hallazgos concretos conservando bytes originales; detectar correctamente un problema no es fallar en la ejecución. Pruebas separadas verifican cancelación tras efectos, código no ejecutado, aislamiento, exportación y eliminación. Estos flujos deterministas se separan del benchmark de doce controladores entrenados.',
        )}{' '}
        <Cite id="reflexmesh2026" />
      </p>
      {error && (
        <div className="nx-error" role="alert">
          {error}
        </div>
      )}
      <div className="science-study-summary">
        <div>
          <b>{study?.runs.length ?? '…'}</b>
          <span>{c('executed compound runs', 'ejecuciones compuestas')}</span>
        </div>
        <div>
          <b>{study?.runs.filter((r) => r.status === 'succeeded').length ?? '…'}</b>
          <span>{c('analyses completed', 'análisis completados')}</span>
        </div>
        <div>
          <b>{study?.runs.filter((r) => r.disposition === 'attention_required').length ?? '…'}</b>
          <span>{c('deliveries needing attention', 'entregas que requieren atención')}</span>
        </div>
      </div>
      <label className="nx-control">
        {c('Inspect an executed experiment', 'Inspeccionar un experimento ejecutado')}
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {study?.runs.map((r) => (
            <option key={r.run_id} value={r.run_id}>
              {taskLabels[r.task][lang]} · {conditionLabels[r.variant][lang]} · {r.seed}
            </option>
          ))}
        </select>
      </label>
      {detail && (
        <>
          <div className="nx-table-scroll">
            <table className="nx-table">
              <thead>
                <tr>
                  <th>{c('Native stage', 'Etapa nativa')}</th>
                  <th>{c('Prerequisites', 'Prerrequisitos')}</th>
                  <th>{c('Verified state', 'Estado verificado')}</th>
                  <th>{c('Receipts', 'Recibos')}</th>
                </tr>
              </thead>
              <tbody>
                {detail.nodes.map((n: any) => (
                  <tr key={n.id}>
                    <th>{n.title[lang]}</th>
                    <td>{n.depends_on.join(', ') || '…'}</td>
                    <td>{n.state}</td>
                    <td>{n.history.filter((h: any) => h.kind === 'effect').length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>{c('Concrete detected failures', 'Fallos concretos detectados')}</h3>
          {detail.findings.length ? (
            <ul>
              {detail.findings.map((f: any, i: number) => (
                <li key={i}>
                  <code>
                    {f.path}
                    {f.line ? `:${f.line}` : ''}
                  </code>{' '}
                  … {f.code.replaceAll('_', ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {c(
                'No findings in the completed checks for this input.',
                'Sin hallazgos en las comprobaciones de esta entrada.',
              )}
            </p>
          )}
          <p>
            {c('Measured elapsed time', 'Tiempo medido')}: {detail.metrics.wall_ms.toFixed(2)} ms ·{' '}
            {c('Native receipts', 'Recibos nativos')}: {detail.metrics.native_receipts} ·{' '}
            {c('Model calls', 'Llamadas a modelos')}: {detail.metrics.model_calls}
          </p>
        </>
      )}
      <Callout
        variant="honest"
        title={c('What this experiment establishes', 'Lo que establece este experimento')}
      >
        {c(
          'These runs establish execution and detection on the declared owned workload. They are not external real-world benchmark results, a learned-controller comparison, or proof of broad source-code repair. Runtime varies with filesystem synchronization and host load.',
          'Estas ejecuciones establecen operación y detección en la carga propia declarada. No son resultados de un benchmark externo, una comparación aprendida ni prueba de reparación general de código. El tiempo varía con sincronización del disco y carga del equipo.',
        )}
      </Callout>
      <Refs ids={['neuraxis2026', 'reflexmesh2026']} label={c('Sources', 'Fuentes')} />
      <ReferenceList
        ids={['neuraxis2026', 'reflexmesh2026']}
        heading={c('Section bibliography', 'Bibliografía de la sección')}
      />
    </article>
  );
}
