import { useEffect, useState } from 'react';
import { Callout } from '@fasl-work/caos-app-shell';
import { useCopy } from '../i18n';
import { downloadJSON } from '../api/artifacts';
import { format, Panel } from './Instruments';

interface Measurement {
  method_id: string;
  successes: number;
  episodes: number;
  mean_wall_ms: number;
}
interface ResearchReport {
  kind: string;
  completed_episodes: number;
  transfer: { episodes: number; methods: Measurement[] };
  ablations: Record<
    string,
    {
      methods: Measurement[];
      paired_full_minus_ablation: {
        success_difference_left_minus_right: number;
        paired_seed_bootstrap95: number[];
        mean_wall_difference_ms_left_minus_right: number;
      };
    }
  >;
  routing: Record<string, { threshold: number; fit_states: number; positive_fit_states: number }>;
  external: {
    aggregates: Record<string, { evaluated_cases: number; mean_upstream_metric: number }>;
  };
}

export function ResearchResults() {
  const { lang } = useCopy();
  const en = lang === 'en';
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/research.json`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
          throw new Error(`HTTP ${response.status}`);
        const value = (await response.json()) as ResearchReport;
        if (value.kind !== 'reflexmesh-corrected-science' || value.completed_episodes !== 19488)
          throw new Error('Invalid research evidence');
        setReport(value);
      })
      .catch((reason) => {
        if (!abort.signal.aborted) setError(String(reason));
      });
    return () => abort.abort();
  }, []);
  if (!report)
    return (
      <p role="status">
        {error || (en ? 'Loading measured findings...' : 'Cargando resultados medidos...')}
      </p>
    );
  return (
    <div className="nx-research-results">
      <Callout
        variant="honest"
        title={en ? 'Measured contribution verdict' : 'Veredicto medido de contribución'}
      >
        {en
          ? 'The system is implemented and measured. M12 solved 1,160/1,200 core episodes; several simpler baselines solved all 1,200. All four component ablations matched M12 core success. These experiments do not demonstrate a learned performance advantage, AGI or biological equivalence.'
          : 'El sistema está implementado y medido. M12 resolvió 1.160/1.200 episodios principales; varias bases más simples resolvieron los 1.200. Las cuatro ablaciones igualaron su éxito. Estos experimentos no demuestran una ventaja aprendida, AGI ni equivalencia biológica.'}
      </Callout>
      <Panel
        title={en ? 'Unseen structural compositions' : 'Composiciones estructurales no vistas'}
      >
        <p>
          {en
            ? 'Four new compositions, two variants, three seeds. Separate from core training templates.'
            : 'Cuatro composiciones nuevas, dos variantes, tres semillas. Separadas de las plantillas principales.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Method' : 'Método'}</th>
                <th>{en ? 'Verified success' : 'Éxito verificado'}</th>
                <th>{en ? 'Mean wall ms' : 'Tiempo total medio ms'}</th>
              </tr>
            </thead>
            <tbody>
              {report.transfer.methods.map((row) => (
                <tr key={row.method_id}>
                  <td>{row.method_id}</td>
                  <td>
                    {row.successes}/{row.episodes}
                  </td>
                  <td>{format(row.mean_wall_ms, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={en ? 'Component ablations' : 'Ablaciones de componentes'}>
        <p>
          {en
            ? 'Frozen models and gates; 1,200 paired core cells per ablation. Differences are full M12 minus ablation. No held-out retuning.'
            : 'Modelos y umbrales congelados; 1.200 casos emparejados por ablación. Diferencias: M12 completo menos ablación. Sin reajuste con datos de evaluación.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Removed component' : 'Componente retirado'}</th>
                <th>{en ? 'Success' : 'Éxito'}</th>
                <th>{en ? 'Paired success difference' : 'Diferencia de éxito emparejada'}</th>
                <th>{en ? 'Mean wall difference ms' : 'Diferencia temporal media ms'}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.ablations).map(([name, value]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    {value.methods[0].successes}/{value.methods[0].episodes}
                  </td>
                  <td>
                    {format(
                      value.paired_full_minus_ablation.success_difference_left_minus_right,
                      4,
                    )}
                  </td>
                  <td>
                    {format(
                      value.paired_full_minus_ablation.mean_wall_difference_ms_left_minus_right,
                      2,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          {en
            ? 'Ten seed groups; identical success differences yield degenerate bootstrap intervals. Sequential timings and unequal compute budgets do not establish a causal latency ranking.'
            : 'Diez grupos de semillas; diferencias idénticas producen intervalos bootstrap degenerados. Tiempos secuenciales y presupuestos desiguales no establecen una clasificación causal de latencia.'}
        </p>
      </Panel>
      <Panel
        title={
          en
            ? 'Learned allocation and external evidence'
            : 'Asignación aprendida y evidencia externa'
        }
      >
        {Object.entries(report.routing).map(([name, gate]) => (
          <p key={name}>
            <strong>{name}:</strong> {gate.positive_fit_states}/{gate.fit_states}{' '}
            {en ? 'positive fit states; threshold' : 'estados positivos de ajuste; umbral'}{' '}
            {format(gate.threshold)}.{' '}
            {en
              ? 'The learned gate never defers. M12 surprise/evidence triggers remain separate.'
              : 'El umbral aprendido nunca delega. Los disparadores de sorpresa/evidencia de M12 son independientes.'}
          </p>
        ))}
        {Object.entries(report.external.aggregates).map(([name, data]) => (
          <p key={name}>
            <strong>{name}:</strong> {data.evaluated_cases}{' '}
            {en ? 'cases; mean upstream metric' : 'casos; métrica externa media'}{' '}
            {format(data.mean_upstream_metric, 6)}.
          </p>
        ))}
        <p>
          {en
            ? 'Upstream subsets use a local System Two agent with native admission. They are not M12 transfer or full leaderboard results. Similarity and reward are separate metrics.'
            : 'Los subconjuntos externos usan un agente local de Sistema Dos con admisión nativa. No son transferencia de M12 ni resultados del benchmark completo. Similitud y recompensa son métricas distintas.'}
        </p>
        <button
          className="nx-button"
          onClick={() => downloadJSON(report, 'neuraxis-corrected-research.json')}
        >
          {en ? 'Download full evidence report' : 'Descargar informe completo'}
        </button>
      </Panel>
    </div>
  );
}
