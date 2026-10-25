import { useMemo, useState } from 'react';
import { BarChart, Callout, Cite, DocPage, DocSection } from '@fasl-work/caos-app-shell';
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
          title={{
            en: 'Reliability: confidence and demonstration agreement',
            es: 'Fiabilidad: confianza y acuerdo con demostración',
          }}
          x={{
            label: { en: 'Emitted confidence', es: 'Confianza emitida' },
            values: [0, 1],
            range: [0, 1],
          }}
          y={{
            label: { en: 'Demonstration agreement', es: 'Acuerdo con demostración' },
            range: [0, 1],
          }}
          series={[
            {
              id: 'calibration-identity',
              label: { en: 'Perfect calibration', es: 'Calibración perfecta' },
              values: [0, 1],
              color: '--color-fg-subtle',
              dash: [5, 4],
            },
            {
              id: 'observed-agreement',
              label: { en: 'Observed agreement', es: 'Acuerdo observado' },
              x: bins.map((b) => b.confidence),
              values: bins.map((b) => b.accuracy),
              mode: 'points',
              size: 10,
              color: '--color-accent',
            },
          ]}
          height={300}
          readout={(i) =>
            `${lang === 'en' ? 'Bin' : 'Intervalo'} ${i + 1}: n=${bins[i]?.count ?? 0}`
          }
        />
        <p className="nx-caption">{data.calibration?.target ?? t.noResult}</p>
      </Panel>
      <Panel title={t.riskCoverage}>
        <UPlotChart
          title={t.riskCoverage}
          x={{
            label: { en: 'Accepted fraction (binned)', es: 'Fracción aceptada (por intervalos)' },
            values: frontier.map((p) => p.coverage),
            range: [0, 1],
          }}
          y={{
            label: { en: 'Demonstration disagreement', es: 'Desacuerdo con demostración' },
            range: [0, 1],
          }}
          series={[
            {
              id: 'risk-coverage',
              label: { en: 'Disagreement by coverage', es: 'Desacuerdo por cobertura' },
              values: frontier.map((p) => p.risk),
              mode: 'line',
              dots: true,
              x: frontier.map((p) => p.coverage),
              size: 9,
              color: '--color-accent',
            },
          ]}
          height={300}
          readout={(i) =>
            `${lang === 'en' ? 'Threshold' : 'Umbral'} ${format(frontier[i]?.threshold, 3)}; n=${frontier[i]?.n ?? 0}`
          }
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
    <DocSection
      title={{
        en: 'Success across controlled conditions',
        es: 'Éxito bajo condiciones controladas',
      }}
      area="robustness"
      refs={['agarwal2021', 'neuraxis2026']}
    >
      <BarChart
        title={{
          en: `${t.robustness}: ${selected?.method_id ?? methodId}`,
          es: `${t.robustness}: ${selected?.method_id ?? methodId}`,
        }}
        data={(selected?.by_variant ?? []).map((row) => ({
          id: row.variant,
          label: VARIANTS[VARIANT_IDS.indexOf(row.variant)] ?? { en: row.variant, es: row.variant },
          value: row.task_success,
          highlight: selectedVariant === row.variant,
          hint: {
            en: `${row.episodes} held-out episodes`,
            es: `${row.episodes} episodios reservados`,
          },
          format: { percent: true, decimals: 1 },
        }))}
        axis={{
          label: { en: 'Verified task success', es: 'Éxito verificado de la tarea' },
          format: { percent: true, decimals: 0 },
          range: [0, 1],
        }}
        onSelect={(id) => setSelectedVariant(id)}
      />
      <p className="nx-caption">
        {lang === 'en'
          ? 'Bars show the selected controller on each measured perturbation family. The categories are distinct fault conditions, not points on a continuous severity scale; every denominator is shown in the chart table.'
          : 'Las barras muestran el controlador en cada familia de perturbación medida. Son fallos distintos, no puntos de una escala continua; la tabla del gráfico muestra cada denominador.'}
      </p>
    </DocSection>
  );
  const comparison = (
    <DocSection
      title={{
        en: 'Exact, learned and proposed controllers',
        es: 'Controladores exactos, aprendidos y propuesto',
      }}
      area="comparison"
      refs={['neuraxis2026', 'agarwal2021']}
    >
      <BarChart
        title={{ en: 'Matched core task success', es: 'Éxito en las mismas tareas centrales' }}
        data={['M01', 'M04', 'M12']
          .map((id) => results.find((row) => row.method_id === id))
          .filter((row): row is Aggregate => Boolean(row))
          .map((row) => ({
            id: row.method_id,
            label: METHODS.find((method) => method.id === row.method_id)?.name ?? {
              en: row.method_id,
              es: row.method_id,
            },
            value: row.task_success,
            highlight: selected?.method_id === row.method_id,
            hint: {
              en: `${row.episodes} held-out episodes`,
              es: `${row.episodes} episodios reservados`,
            },
            format: { percent: true, decimals: 1 },
          }))}
        axis={{
          label: { en: 'Verified task success', es: 'Éxito verificado de la tarea' },
          format: { percent: true, decimals: 0 },
          range: [0, 1],
        }}
        onSelect={(id) => setMethodId(id)}
      />
      <p className="measure">
        {lang === 'en'
          ? 'M01 is the guarded state-machine baseline, M04 is XGBoost, and M12 is the proposed composite. All three use the same frozen 1,200 core episodes and independent effect checks. The separate transfer record is 24/24 for M04 and 21/24 for M12; it is not represented in this core-task chart.'
          : 'M01 es la máquina de estados con guardas, M04 es XGBoost y M12 es la composición propuesta. Los tres usan los mismos 1.200 episodios centrales congelados y comprobaciones independientes. En el registro separado de transferencia, M04 resuelve 24/24 y M12 21/24; esos datos no aparecen en este gráfico central.'}
      </p>
    </DocSection>
  );
  const caveat = (
    <DocSection
      title={{ en: 'Limits of this comparison', es: 'Límites de esta comparación' }}
      area="caveat"
      refs={['neuraxis2026', 'agarwal2021']}
    >
      <Callout variant="honest" title={t.sourceBoundary}>
        {lang === 'en'
          ? 'These are owned controlled software workloads, not an external real-world benchmark. Five methods, including the guarded state machine, solve all 1,200 core episodes. M12 solves 1,160, its learned thresholds never defer, and its ten seeds repeat the same outcomes. These records support neither a general intelligence claim nor a learned-controller advantage.'
          : 'Son cargas de software controladas y propias, no un benchmark externo. Cinco métodos, incluida la máquina de estados con guardas, resuelven los 1.200 episodios centrales. M12 resuelve 1.160, sus umbrales aprendidos nunca derivan y sus diez semillas repiten los mismos resultados. Esto no respalda inteligencia general ni ventaja del controlador aprendido.'}
      </Callout>
      {selected?.success_interval_descriptive && (
        <p className="nx-caption">
          {lang === 'en'
            ? `Selected method ${selected.method_id}: descriptive success interval ${selected.success_interval_descriptive.map((value) => `${format(value * 100, 1)}%`).join('–')}. ${selected.interval_assumption ?? 'This interval is descriptive and does not account for episode dependence.'}`
            : `Método seleccionado ${selected.method_id}: intervalo descriptivo de éxito ${selected.success_interval_descriptive.map((value) => `${format(value * 100, 1)}%`).join('–')}. ${selected.interval_assumption ?? 'Este intervalo es descriptivo y no considera la dependencia entre episodios.'}`}
        </p>
      )}
    </DocSection>
  );
  const provenance = (
    <DocSection
      title={{ en: 'Dataset and difficulty provenance', es: 'Procedencia de datos y dificultad' }}
      area="provenance"
      refs={['neuraxis2026', 'reflexmesh2026']}
    >
      <div className="nx-table-scroll">
        <table className="nx-table">
          <thead>
            <tr>
              <th>{lang === 'en' ? 'Dataset' : 'Conjunto de datos'}</th>
              <th>{lang === 'en' ? 'Rows' : 'Registros'}</th>
              <th>{lang === 'en' ? 'Difficulty source' : 'Origen de dificultad'}</th>
              <th>{lang === 'en' ? 'Redistribution' : 'Redistribución'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                {lang === 'en' ? 'Core controller matrix' : 'Matriz central de controladores'}
              </th>
              <td>14,400</td>
              <td>
                {lang === 'en'
                  ? '20 authored task families, six controlled variants and ten seeds'
                  : '20 familias de tareas diseñadas, seis variantes controladas y diez semillas'}
              </td>
              <td>
                {lang === 'en'
                  ? 'Product-owned generated traces; no external benchmark records'
                  : 'Trazas generadas por el producto; sin registros de benchmarks externos'}
              </td>
            </tr>
            <tr>
              <th>{lang === 'en' ? 'Semantic transfer' : 'Transferencia semántica'}</th>
              <td>1,536</td>
              <td>
                {lang === 'en'
                  ? 'Eight held-out compositions, nominal and boundary conditions, eight seeds'
                  : 'Ocho composiciones reservadas, condiciones nominales y de frontera, ocho semillas'}
              </td>
              <td>
                {lang === 'en'
                  ? 'Product-owned scenarios and traces, committed with source hashes'
                  : 'Escenarios y trazas del producto, versionados con hashes del código fuente'}
              </td>
            </tr>
            <tr>
              <th>{lang === 'en' ? 'Native operations' : 'Operaciones nativas'}</th>
              <td>36</td>
              <td>
                {lang === 'en'
                  ? 'Three registered tasks, four declared fault conditions and three seeds'
                  : 'Tres tareas registradas, cuatro condiciones de fallo declaradas y tres semillas'}
              </td>
              <td>
                {lang === 'en'
                  ? 'Owned disposable workload; source-bound operation receipts and postconditions'
                  : 'Carga desechable propia; recibos de operaciones y poscondiciones vinculados al código'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="nx-caption">
        {lang === 'en'
          ? `Evidence index generated ${index?.generated_at ?? 'unavailable'}; ${Object.keys((index?.provenance?.lineage as { source_sha256?: Record<string, unknown> } | undefined)?.source_sha256 ?? {}).length} implementation files are source-hash bound. Validators: scripts/check_artifacts.py, scripts/check_semantic_transfer.py and scripts/check_operations.py.`
          : `Índice generado ${index?.generated_at ?? 'no disponible'}; ${Object.keys((index?.provenance?.lineage as { source_sha256?: Record<string, unknown> } | undefined)?.source_sha256 ?? {}).length} archivos de implementación están vinculados por hash. Validadores: scripts/check_artifacts.py, scripts/check_semantic_transfer.py y scripts/check_operations.py.`}
      </p>
    </DocSection>
  );
  return (
    <DocPage
      title={{ en: 'Benchmark', es: 'Benchmark' }}
      lede={
        <>
          {lang === 'en'
            ? 'Compare exact and learned controllers on frozen software episodes with independently checked effects. Every value comes from a measured artifact. The page separates success, action agreement, timing, violations, perturbation results and dataset provenance without inferring missing outcomes.'
            : 'Comparar controladores exactos y aprendidos en episodios congelados con efectos comprobados independientemente. Cada valor proviene de un artefacto medido. La página separa éxito, acuerdo, tiempo, violaciones, perturbaciones y procedencia, sin inferir resultados ausentes.'}{' '}
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
              <div className="nx-inline-controls" data-control="benchmark-method">
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
            <div className="nx-benchmark-evidence">
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
                            {
                              id: 'results',
                              label: t.table,
                              content: (
                                <DocSection
                                  title={{
                                    en: 'Held-out controller results',
                                    es: 'Resultados reservados de controladores',
                                  }}
                                  area="results"
                                  refs={['neuraxis2026']}
                                >
                                  {table}
                                </DocSection>
                              ),
                            },
                            {
                              id: 'adequacy',
                              label: lang === 'en' ? 'Adequacy' : 'Adecuación',
                              content: <BenchmarkAdequacy />,
                            },
                            {
                              id: 'semantic',
                              label:
                                lang === 'en' ? 'Semantic transfer' : 'Transferencia semántica',
                              content: <SemanticTransfer />,
                            },
                            {
                              id: 'findings',
                              label: lang === 'en' ? 'Findings' : 'Hallazgos',
                              content: (
                                <>
                                  <ResearchResults />
                                  {comparison}
                                  {caveat}
                                </>
                              ),
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
                      content: provenance,
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DocPage>
  );
}
