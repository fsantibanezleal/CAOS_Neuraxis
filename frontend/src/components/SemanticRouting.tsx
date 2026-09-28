import { useEffect, useState } from 'react';
import { Callout } from '@fasl-work/caos-app-shell';
import { Download } from 'lucide-react';
import { downloadJSON } from '../api/artifacts';
import { useCopy } from '../i18n';
import { format, Panel } from './Instruments';

const REPORT_SHA256 = '2caa9039f64ba57e41d453b826eef3b9d30f8b02bde706a477da833f42b69d86';
const ORDER = [
  'always_fast_M04',
  'learned_gate',
  'hash_half',
  'always_planner_M09',
  'post_hoc_oracle_upper_bound',
] as const;

interface Result {
  episodes: number;
  planner_episodes: number;
  verified_successes: number;
  invalid_policy_outputs: number;
  mean_wall_ms: number;
}
interface Report {
  schema_version: number;
  status: string;
  source: { index_sha256: string };
  split: { fit: string[]; calibration: string[]; test: string[] };
  fit_positives: number;
  calibration_positives: number;
  test_positives: number;
  selected_threshold: number;
  model_sha256: string;
  test: Record<(typeof ORDER)[number], Result>;
}

const label = (key: (typeof ORDER)[number], en: boolean) =>
  ({
    always_fast_M04: en ? 'Always fast (M04)' : 'Siempre rápido (M04)',
    learned_gate: en ? 'Fitted gate' : 'Umbral ajustado',
    hash_half: en ? 'Hash-half allocation' : 'Asignación mitad por hash',
    always_planner_M09: en ? 'Always planner (M09)' : 'Siempre planificador (M09)',
    post_hoc_oracle_upper_bound: en ? 'Post-hoc oracle ceiling' : 'Techo oráculo retrospectivo',
  })[key];

export default function SemanticRouting({ indexSha }: { indexSha: string }) {
  const { lang } = useCopy();
  const en = lang === 'en';
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    void fetch(`${import.meta.env.BASE_URL}data/semantic-routing-study/analysis.json`, {
      signal: abort.signal,
    })
      .then(async (response) => {
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
          throw new Error(`HTTP ${response.status}`);
        if (!globalThis.crypto?.subtle) throw new Error('Secure context required for SHA-256');
        const bytes = await response.arrayBuffer();
        const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
          .map((value) => value.toString(16).padStart(2, '0'))
          .join('');
        if (digest !== REPORT_SHA256) throw new Error('Routing study SHA-256 mismatch');
        const result = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(bytes),
        ) as Report;
        if (
          result.schema_version !== 1 ||
          result.status !== 'exploratory_offline_paired_selection_not_an_online_M12_result' ||
          result.source.index_sha256 !== indexSha ||
          result.split.test.join(',') !== 'D07,D08' ||
          ORDER.some((key) => result.test[key]?.episodes !== 32)
        )
          throw new Error('Routing study source or held-out coverage differs');
        setReport(result);
      })
      .catch((reason) => {
        if (!abort.signal.aborted) setError(String(reason));
      });
    return () => abort.abort();
  }, [indexSha]);
  if (!report)
    return (
      <p role={error ? 'alert' : 'status'}>
        {error || (en ? 'Loading routing study…' : 'Cargando estudio de encaminamiento…')}
      </p>
    );

  const point = (key: (typeof ORDER)[number]) => {
    const row = report.test[key];
    return {
      x: 75 + (570 * row.planner_episodes) / 32,
      y: 245 - (170 * row.verified_successes) / 10,
    };
  };
  return (
    <div className="nx-research-results">
      <Callout
        variant="honest"
        title={en ? 'The fitted router did not hand off' : 'El umbral ajustado no delegó'}
      >
        {en
          ? 'On 32 held-out episodes from two unseen compositions, it chose the fast arm every time and solved none. The always-planner arm solved 10, with eight invalid outputs. This is an offline initial-arm selection over already executed episodes, not an online M12 improvement.'
          : 'En 32 episodios reservados de dos composiciones nuevas, eligió siempre la vía rápida y no resolvió ninguno. La vía siempre planificadora resolvió 10, con ocho salidas inválidas. Es una selección retrospectiva de la vía inicial entre episodios ya ejecutados, no una mejora de M12 en línea.'}
      </Callout>
      <div className="nx-metrics">
        <div className="nx-metric">
          <span>{en ? 'Held-out episodes' : 'Episodios reservados'}</span>
          <b>32</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Fit utility-positive' : 'Mejoras en ajuste'}</span>
          <b>{report.fit_positives}/64</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Calibration utility-positive' : 'Mejoras en calibración'}</span>
          <b>{report.calibration_positives}/32</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Held-out utility-positive' : 'Mejoras reservadas'}</span>
          <b>{report.test_positives}/32</b>
        </div>
      </div>
      <Panel title={en ? 'Success against planner use' : 'Éxito frente al uso del planificador'}>
        <div className="nx-routing-scroll">
          <svg
            className="nx-chart"
            viewBox="0 0 720 300"
            role="img"
            aria-label={
              en
                ? 'Verified successes versus planner episodes for five selectors'
                : 'Éxitos verificados frente a episodios con planificador para cinco selectores'
            }
          >
            <path d="M75 60 V245 H645" className="nx-axis" fill="none" />
            {[0, 8, 16, 24, 32].map((n) => (
              <g key={n}>
                <line
                  x1={75 + (570 * n) / 32}
                  x2={75 + (570 * n) / 32}
                  y1="65"
                  y2="245"
                  className="nx-grid"
                />
                <text x={75 + (570 * n) / 32} y="266" textAnchor="middle" className="nx-axis-label">
                  {n}
                </text>
              </g>
            ))}
            {[0, 5, 10].map((n) => (
              <g key={n}>
                <line
                  x1="75"
                  x2="645"
                  y1={245 - (170 * n) / 10}
                  y2={245 - (170 * n) / 10}
                  className="nx-grid"
                />
                <text x="57" y={249 - (170 * n) / 10} textAnchor="end" className="nx-axis-label">
                  {n}
                </text>
              </g>
            ))}
            {ORDER.filter((key) => key !== 'always_fast_M04').map((key) => {
              const { x, y } = point(key);
              return (
                <g key={key}>
                  <circle
                    cx={x}
                    cy={y}
                    r={key === 'learned_gate' ? 11 : 8}
                    fill={key === 'learned_gate' ? 'var(--color-accent)' : 'var(--color-fg)'}
                    stroke="var(--color-bg)"
                    strokeWidth="2"
                  >
                    <title>{`${key === 'learned_gate' ? `${label('always_fast_M04', en)} + ` : ''}${label(key, en)}: ${report.test[key].verified_successes}/32, ${report.test[key].planner_episodes} planner episodes`}</title>
                  </circle>
                  <text
                    x={key === 'always_planner_M09' ? x - 11 : x + 11}
                    y={key === 'learned_gate' ? y - 13 : y - 12}
                    textAnchor={key === 'always_planner_M09' ? 'end' : 'start'}
                    className="nx-axis-label"
                  >
                    {key === 'learned_gate'
                      ? en
                        ? 'Always fast + fitted gate'
                        : 'Siempre rápido + umbral ajustado'
                      : label(key, en)}
                  </text>
                </g>
              );
            })}
            <text x="360" y="294" textAnchor="middle" className="nx-axis-label">
              {en ? 'Episodes sent to planner / 32' : 'Episodios delegados al planificador / 32'}
            </text>
          </svg>
        </div>
        <p className="nx-caption nx-routing-hint">
          {en
            ? 'Swipe the plot to see the full allocation range.'
            : 'Desliza el gráfico para ver todo el rango de delegación.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Selector' : 'Selector'}</th>
                <th>{en ? 'Verified success' : 'Éxito verificado'}</th>
                <th>{en ? 'Planner episodes' : 'Episodios delegados'}</th>
                <th>{en ? 'Invalid outputs' : 'Salidas inválidas'}</th>
                <th>{en ? 'Mean wall time' : 'Tiempo total medio'}</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((key) => {
                const row = report.test[key];
                return (
                  <tr key={key}>
                    <th>{label(key, en)}</th>
                    <td>
                      {row.verified_successes}/{row.episodes}
                    </td>
                    <td>{row.planner_episodes}</td>
                    <td>{row.invalid_policy_outputs}</td>
                    <td>{format(row.mean_wall_ms / 1000, 2)} s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="nx-caption">
          {en
            ? 'The oracle selects with knowledge of outcomes and is only a ceiling. Times are observed episode wall times; routing and inference latency are omitted.'
            : 'El oráculo selecciona conociendo los resultados y solo representa un techo. Los tiempos son duraciones observadas; no incluyen la latencia de inferencia ni de selección.'}
        </p>
        <button
          className="nx-button"
          onClick={() => downloadJSON(report, 'neuraxis-semantic-routing.json')}
        >
          <Download size={14} /> {en ? 'Download audited study' : 'Descargar estudio auditado'}
        </button>
      </Panel>
      <p className="nx-caption">
        {en
          ? 'Fit: D01–D04; calibration: D05–D06; held-out: D07–D08. This study was designed after exploratory smoke and has only two held-out families. A prespecified online test with more positive utility cases is still required.'
          : 'Ajuste: D01–D04; calibración: D05–D06; reserva: D07–D08. Este estudio se diseñó después de una prueba exploratoria y solo tiene dos familias reservadas. Falta una evaluación en línea predefinida con más casos de mejora.'}
      </p>
    </div>
  );
}
