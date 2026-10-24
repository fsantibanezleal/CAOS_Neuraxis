import { useMemo, useState } from 'react';
import { Callout, Cite, DocPage, DocSection } from '@fasl-work/caos-app-shell';
import { UPlotChart } from '@fasl-work/caos-app-shell/chart';
import { Download } from 'lucide-react';
import { useArtifacts, episodeReferences, downloadJSON } from '../api/artifacts';
import { useCopy } from '../i18n';
import { METHODS, VARIANTS, VARIANT_IDS } from '../data/registry';
import { format, Panel } from '../components/Instruments';
import { ResearchResults } from '../components/ResearchResults';
import BenchmarkAdequacy from '../components/BenchmarkAdequacy';
import SemanticTransfer from '../components/SemanticTransfer';
import OverflowTabs, { OverflowSubTabs } from '../components/OverflowTabs';
type Bin = { lower: number; upper: number; count: number; confidence: number; accuracy: number };
interface Aggregate {
  method_id: string;
  episodes: number;
  task_success: number;
  controller_ms: number;
  execution_ms: number;
  wall_ms: number;
  violations: number;
  delegations: number;
  steps: number;
  controller_p50_ms: number;
  controller_p95_ms: number;
  controller_p99_ms: number;
  success_interval_descriptive?: number[];
  interval_assumption?: string;
  by_variant?: { variant: string; episodes: number; task_success: number }[];
  calibration?: { target: string; bins: Bin[] };
  confusion?: { target: string; counts: Record<string, number> };
  [key: string]: unknown;
}
function Reliability({ data }: { data: Aggregate }) {
  const { lang, t } = useCopy();
  const bins = data.calibration?.bins ?? [];
  const total = bins.reduce((n, b) => n + b.count, 0);
  const frontier = bins.map((b) => {
    const accepted = bins.filter((x) => x.lower >= b.lower);
    const n = accepted.reduce((n, x) => n + x.count, 0);
    return {
      threshold: b.lower,
      coverage: total ? n / total : 0,
      risk: n ? accepted.reduce((e, x) => e + x.count * (1 - x.accuracy), 0) / n : 0,
      n,
    };
  });
  return (
    <div className="nx-chart-grid">
      <Panel
        title={
          lang === 'en'
            ? 'Reliability: demonstration agreement'
            : 'Fiabilidad: acuerdo con demostración'
        }
      >
        <UPlotChart
          title={{ en: 'Reliability: confidence and demonstration agreement', es: 'Fiabilidad: confianza y acuerdo con demostración' }}
          x={{ label: { en: 'Emitted confidence', es: 'Confianza emitida' }, values: [0, 1], range: [0, 1] }}
          y={{ label: { en: 'Demonstration agreement', es: 'Acuerdo con demostración' }, range: [0, 1] }}
          series={[
            { id: 'calibration-identity', label: { en: 'Perfect calibration', es: 'Calibración perfecta' }, values: [0, 1], color: '--color-fg-subtle', dash: [5, 4] },
            { id: 'observed-agreement', label: { en: 'Observed agreement', es: 'Acuerdo observado' }, x: bins.map((b) => b.confidence), values: bins.map((b) => b.accuracy), mode: 'points', size: 10, color: '--color-accent' },
          ]}
          height={300}
          readout={(i) => `${lang === 'en' ? 'Bin' : 'Intervalo'} ${i + 1}: n=${bins[i]?.count ?? 0}`}
        />
        <p className="nx-caption">{data.calibration?.target ?? t.noResult}</p>
      </Panel>
      <Panel title={t.riskCoverage}>
        <UPlotChart
          title={t.riskCoverage}
          x={{ label: { en: 'Accepted fraction (binned)', es: 'Fracción aceptada (por intervalos)' }, values: frontier.map((p) => p.coverage), range: [0, 1] }}
          y={{ label: { en: 'Demonstration disagreement', es: 'Desacuerdo con demostración' }, range: [0, 1] }}
          series={[{ id: 'risk-coverage', label: { en: 'Disagreement by coverage', es: 'Desacuerdo por cobertura' }, values: frontier.map((p) => p.risk), mode: 'line', dots: true, x: frontier.map((p) => p.coverage), size: 9, color: '--color-accent' }]}
          height={300}
          readout={(i) => `${lang === 'en' ? 'Threshold' : 'Umbral'} ${format(frontier[i]?.threshold, 3)}; n=${frontier[i]?.n ?? 0}`}
        />
        <p className="nx-caption">
          {lang === 'en'
            ? 'Computed from emitted confidence-bin counts and agreement frequencies. Risk means demonstration disagreement, not unsafe effects. Coarse thresholds use bin boundaries; no per-action safety guarantee.'
            : 'Calculado con cantidades y frecuencias de intervalos de confianza. Riesgo significa desacuerdo con demostración, no efectos inseguros. Umbrales discretos usan límites; no hay garantía de seguridad por acción.'}
        </p>
      </Panel>
    </div>
  );
}
function Confusion({ data }: { data: Aggregate }) {
  const { lang, t } = useCopy();
  const [read, setRead] = useState('');
  const counts = data.confusion?.counts ?? {};
  const entries = Object.entries(counts);
  const labels = Array.from(new Set(entries.flatMap(([key]) => key.split('|')))).sort();
  const shown = labels.slice(0, 16);
  const max = Math.max(1, ...Object.values(counts));
  return (
    <Panel title={`${t.confusion}: ${data.confusion?.target ?? t.noResult}`}>
      <div className="nx-table-scroll">
        <table className="nx-table nx-confusion">
          <thead>
            <tr>
              <th>{lang === 'en' ? 'Reference / selected' : 'Referencia / elegida'}</th>
              {shown.map((s) => (
                <th key={s}>
                  <code>{s}</code>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((actual) => (
              <tr key={actual}>
                <th>
                  <code>{actual}</code>
                </th>
                {shown.map((predicted) => {
                  const n = counts[`${actual}|${predicted}`] ?? 0;
                  return (
                    <td key={predicted}>
                      <button
                        onMouseEnter={() => setRead(`${actual} → ${predicted}: ${n}`)}
                        onFocus={() => setRead(`${actual} → ${predicted}: ${n}`)}
                        className="nx-confusion-cell"
                        style={{
                          background: `color-mix(in srgb, var(--color-accent) ${8 + (72 * n) / max}%, var(--color-surface))`,
                        }}
                        title={`${actual} → ${predicted}: ${n}`}
                      >
                        {n}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="nx-readout">{read || t.readout}</div>
      <p className="nx-caption">
        {lang === 'en'
          ? `Showing ${shown.length} of ${labels.length} observed action labels. Counts are action agreement, not task-success labels.`
          : `Se muestran ${shown.length} de ${labels.length} etiquetas observadas. Son cantidades de acuerdo de acciones, no etiquetas de éxito.`}
      </p>
      {shown.length > 0 && (
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{t.decision}</th>
                <th>{lang === 'en' ? 'Recall' : 'Sensibilidad'}</th>
                <th>n</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((label) => {
                const n = entries
                  .filter(([k]) => k.split('|')[0] === label)
                  .reduce((s, [, v]) => s + v, 0);
                return (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{n ? format((counts[`${label}|${label}`] ?? 0) / n, 3) : '--'}</td>
                    <td>{n}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
export default function Benchmark() {
  const { lang, t } = useCopy();
  const { index, loading, error, reload } = useArtifacts();
  const [methodId, setMethodId] = useState('M05');
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const results = useMemo(
    () => (Array.isArray(index?.aggregate_results) ? index.aggregate_results : []) as Aggregate[],
    [index],
  );
  const selected = results.find((r) => r.method_id === methodId) ?? results[0];
  const coverage = useMemo(() => {
    const refs = episodeReferences(index);
    return {
      episodes: refs.length,
      methods: new Set(refs.map((r) => r.method_id)).size,
      cases: new Set(refs.map((r) => r.case_id)).size,
    };
  }, [index]);
  const table = (
    <Panel title={t.table}>
      <div className="nx-table-scroll">
        <table className="nx-table">
          <thead>
            <tr>
              <th>{t.method}</th>
              <th>n</th>
              <th>{t.success}</th>
              <th>p50 ms</th>
              <th>p95 ms</th>
              <th>p99 ms</th>
              <th>{lang === 'en' ? 'Wall / episode ms' : 'Tiempo / episodio ms'}</th>
              <th>{lang === 'en' ? 'Violations / episode' : 'Violaciones / episodio'}</th>
              <th>{t.calls}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.method_id}
                className={selected?.method_id === r.method_id ? 'nx-active-row' : ''}
                onClick={() => setMethodId(r.method_id)}
              >
                <th>
                  <button className="nx-text-button" onClick={() => setMethodId(r.method_id)}>
                    {r.method_id} {METHODS.find((m) => m.id === r.method_id)?.name[lang]}
                  </button>
                </th>
                <td>{r.episodes}</td>
                <td>{format(r.task_success * 100)}%</td>
                <td>{format(r.controller_p50_ms, 3)}</td>
                <td>{format(r.controller_p95_ms, 3)}</td>
                <td>{format(r.controller_p99_ms, 3)}</td>
                <td>{format(r.wall_ms)}</td>
                <td>{format(r.violations, 4)}</td>
                <td>{format(r.delegations)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nx-caption">
        {lang === 'en'
          ? 'Policy latency measures predict calls; wall duration covers the complete episode. Planner calls, violations and wall time are per-episode means. All values come from the frozen artifact.'
          : 'La latencia mide predict; la duración total incluye el episodio completo. Llamadas, violaciones y tiempo son medias por episodio. Los valores provienen del artefacto congelado.'}
      </p>
    </Panel>
  );
  const robustness = (
    <Panel title={t.robustness}>
      <svg viewBox="0 0 980 420" className="nx-chart" role="img" aria-label={t.robustness}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={format(v)}>
            <line x1="70" x2="950" y1={340 - 280 * v} y2={340 - 280 * v} className="nx-grid" />
            <text x="60" y={344 - 280 * v} textAnchor="end" className="nx-axis-label">
              {format(v)}
            </text>
          </g>
        ))}
        {(selected?.by_variant ?? []).map((v, i) => {
          const x = 100 + i * 145;
          return (
            <g
              key={v.variant}
              tabIndex={0}
              onMouseEnter={() => setSelectedVariant(v.variant)}
              onFocus={() => setSelectedVariant(v.variant)}
            >
              <rect
                x={x}
                y={340 - 280 * v.task_success}
                width="82"
                height={280 * v.task_success}
                fill="var(--color-accent)"
                opacity={selectedVariant === v.variant ? 1 : 0.65}
              />
              <text
                x={x + 41}
                y={327 - 280 * v.task_success}
                textAnchor="middle"
                className="nx-label"
              >
                {format(100 * v.task_success, 1)}%
              </text>
              <text x={x + 41} y="367" textAnchor="middle" className="nx-axis-label">
                {VARIANTS[VARIANT_IDS.indexOf(v.variant)]?.[lang] ?? v.variant}
              </text>
              <text x={x + 41} y="389" textAnchor="middle" className="nx-axis-label">
                n={v.episodes}
              </text>
              <title>{`${v.variant}: ${v.task_success}, n=${v.episodes}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="nx-readout">{selectedVariant ?? t.variant}</div>
      <p className="nx-caption">
        {lang === 'en'
          ? 'Each bar is the selected policy on a measured perturbation family. These categorical conditions are not assumed to form a continuous severity scale.'
          : 'Cada barra representa la política en una familia perturbada medida. Las categorías no se presumen una escala continua de severidad.'}
      </p>
    </Panel>
  );
  return (
    <DocPage
      title={{ en: 'Benchmark', es: 'Benchmark' }}
      lede={
        <>
          {lang === 'en'
            ? 'Compare exact and learned controllers on frozen software episodes with independently checked effects. Every value below is loaded from the measured artifact; task success, action agreement, timing and capability violations remain separate outcomes.'
            : 'Comparar controladores exactos y aprendidos en episodios congelados con efectos comprobados independientemente. Cada valor se carga del artefacto medido; éxito, acuerdo, tiempo y violaciones permanecen separados.'}{' '}
          <Cite id="agarwal2021" />
        </>
      }
    >
    <div className="nx-benchmark">
      {!results.length ? (
        <div className="nx-empty">
          <h3>{loading ? t.loading : t.artifactUnavailable}</h3>
          {error && <p>{error}</p>}
          <button className="nx-button" onClick={reload}>
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <DocSection
            title={{ en: 'Current measurement', es: 'Medición actual' }}
            area="live"
            refs={['neuraxis2026']}
          >
          <div className="nx-inline-controls">
            <label htmlFor="benchmark-method">{t.method}</label>
            <select
              id="benchmark-method"
              value={selected?.method_id ?? methodId}
              onChange={(e) => setMethodId(e.target.value)}
            >
              {results.map((r) => (
                <option key={r.method_id} value={r.method_id}>
                  {r.method_id} {METHODS.find((m) => m.id === r.method_id)?.name[lang]}
                </option>
              ))}
            </select>
            <button
              className="nx-button"
              onClick={() => downloadJSON(index, 'neuraxis-evidence-index.json')}
            >
              <Download size={14} />
              {t.downloadIndex}
            </button>
          </div>
          <div className="nx-metrics">
            <div className="nx-metric">
              <span>{t.episodes}</span>
              <b>{format(coverage.episodes, 0)}</b>
            </div>
            <div className="nx-metric">
              <span>{t.method}</span>
              <b>{coverage.methods}/12</b>
            </div>
            <div className="nx-metric">
              <span>{t.case}</span>
              <b>{coverage.cases}/20</b>
            </div>
            <div className="nx-metric">
              <span>
                {selected?.method_id} / {t.success}
              </span>
              <b>{selected ? `${format(selected.task_success * 100, 1)}%` : '--'}</b>
            </div>
          </div>
          </DocSection>
          <DocSection title={{ en: 'Benchmark evidence', es: 'Evidencia del benchmark' }} area="comparison" refs={['agarwal2021', 'guo2017', 'lu2024', 'schulman2017', 'ross2011']}>
          <div className="nx-benchmark-body">
            <OverflowTabs
              ariaLabel={t.evidence}
              tabs={[
                {
                  id: 'outcomes',
                  label: lang === 'en' ? 'Outcomes' : 'Resultados',
                  content: (
                    <OverflowSubTabs
                      ariaLabel={lang === 'en' ? 'Outcome views' : 'Vistas de resultados'}
                      tabs={[
                        { id: 'results', label: t.table, content: table },
                        {
                          id: 'adequacy',
                          label: lang === 'en' ? 'Adequacy' : 'Adecuación',
                          content: <BenchmarkAdequacy />,
                        },
                        {
                          id: 'semantic',
                          label: lang === 'en' ? 'Semantic transfer' : 'Transferencia semántica',
                          content: <SemanticTransfer />,
                        },
                        {
                          id: 'findings',
                          label: lang === 'en' ? 'Findings' : 'Hallazgos',
                          content: <ResearchResults />,
                        },
                        { id: 'robustness', label: t.robustness, content: robustness },
                      ]}
                    />
                  ),
                },
                {
                  id: 'diagnostics',
                  label: lang === 'en' ? 'Diagnostics' : 'Diagnósticos',
                  content: (
                    <OverflowSubTabs
                      ariaLabel={lang === 'en' ? 'Diagnostic views' : 'Vistas de diagnóstico'}
                      tabs={[
                        {
                          id: 'calibration',
                          label: t.probabilities,
                          content: selected ? <Reliability data={selected} /> : null,
                        },
                        {
                          id: 'confusion',
                          label: t.confusion,
                          content: selected ? <Confusion data={selected} /> : null,
                        },
                      ]}
                    />
                  ),
                },
                {
                  id: 'provenance',
                  label: t.provenance,
                  content: (
                    <Panel title={t.provenance}>
                      <pre className="nx-code">{JSON.stringify(index?.provenance, null, 2)}</pre>
                      <p>{index?.generated_at}</p>
                    </Panel>
                  ),
                },
              ]}
            />
            <Callout variant="honest" title={t.sourceBoundary}>
              {lang === 'en'
                ? 'Owned integration cases with real temporary files, processes and local HTTP. Quota pressure and planner availability include disclosed fixtures. Confidence and confusion target demonstration-action agreement, not safety. Wilson intervals are descriptive under an independent-episode assumption; designed families limit population inference.'
                : 'Casos propios con archivos temporales, procesos y HTTP local reales. Presión de cuota y disponibilidad del planificador incluyen escenarios declarados. Confianza y confusión miden acuerdo demostrado, no seguridad. Wilson es descriptivo bajo independencia; familias diseñadas limitan inferencia.'}
              {selected?.success_interval_descriptive && (
                <p>
                  {lang === 'en' ? 'Selected success interval' : 'Intervalo de éxito seleccionado'}:
                  [{selected.success_interval_descriptive.map((n) => format(n, 3)).join(', ')}]
                </p>
              )}
            </Callout>
          </div>
          </DocSection>
        </>
      )}
    </div>
    </DocPage>
  );
}
