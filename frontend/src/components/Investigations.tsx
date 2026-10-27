import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  GitCompareArrows,
  ShieldCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import { CASES, METHODS, VARIANTS, VARIANT_IDS } from '../data/registry';
import { episodeReferences, loadEpisode, useArtifacts, downloadJSON } from '../api/artifacts';
import type { Decision, Episode } from '../lib/types';
import { useCopy } from '../i18n';
import { format, formatFixed } from './Instruments';
import { useSemanticEvidence } from '../api/semantic';
import FreshInvestigation from './FreshInvestigation';
import { replaceQueryParam } from '@fasl-work/caos-app-shell';

function metric(episode: Episode, key: string, digits = 0) {
  const n = episode.metrics[key];
  return typeof n === 'number' ? format(n, digits) : '…';
}
function ActionEvidence({ episode, decision }: { episode: Episode; decision?: Decision }) {
  const { lang } = useCopy();
  const c = (en: string, es: string) => (lang === 'en' ? en : es);
  if (!decision)
    return (
      <p>
        {c(
          'No action was recorded. Inspect the terminal outcome and policy errors.',
          'No se registró una acción. Inspeccionar el resultado final y los errores.',
        )}
      </p>
    );
  const event = episode.events.find((e: any) => e.sequence === decision.sequence) as
    { state?: Record<string, unknown> } | undefined;
  return (
    <div className="invest-decision">
      <h3>{c('Why this action?', '¿Por qué esta acción?')}</h3>
      <p className="invest-reason">{decision.reason.replaceAll('_', ' ')}</p>
      <div className="invest-evidence-pair">
        <section>
          <h4>{c('Observed before action', 'Observado antes de actuar')}</h4>
          <dl>
            {Object.entries(event?.state ?? {}).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replaceAll('_', ' ')}</dt>
                <dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h4>{c('Observed consequence', 'Consecuencia observada')}</h4>
          <pre className="nx-code">
            {decision.effect_observed
              ? JSON.stringify(decision.effect_observed, null, 2)
              : c(
                  'No effect evidence recorded for this decision.',
                  'Sin evidencia de efecto para esta decisión.',
                )}
          </pre>
          <span className="op-run-badge">{decision.status}</span>
        </section>
      </div>
      <details>
        <summary>
          {c(
            'Candidate actions and measured policy evidence',
            'Acciones candidatas y evidencia de la política',
          )}
        </summary>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{c('Action', 'Acción')}</th>
                <th>{c('Tool capability', 'Capacidad de la herramienta')}</th>
                <th>{c('Admitted candidate', 'Candidato admitido')}</th>
                <th>{c('Score', 'Puntaje')}</th>
                <th>{c('Probability', 'Probabilidad')}</th>
              </tr>
            </thead>
            <tbody>
              {decision.candidates.map((candidate, i) => (
                <tr key={i} className={decision.action === candidate.action ? 'nx-active-row' : ''}>
                  <td>{candidate.action}</td>
                  <td>
                    {String(
                      candidate.arguments?.description ?? candidate.arguments?.operation ?? '…',
                    )}
                  </td>
                  <td>{String(candidate.allowed)}</td>
                  <td>{candidate.score == null ? '…' : formatFixed(candidate.score, 4)}</td>
                  <td>
                    {candidate.probability == null ? '…' : formatFixed(candidate.probability, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
export default function Investigations() {
  const { lang } = useCopy();
  const c = (en: string, es: string) => (lang === 'en' ? en : es);
  const { index, error: indexError, loading } = useArtifacts();
  const semantic = useSemanticEvidence();
  const [suite, setSuite] = useState(() =>
    new URLSearchParams(location.search).get('suite') === 'semantic_transfer'
      ? 'semantic_transfer'
      : 'core',
  );
  const refs = useMemo(
    () => (suite === 'core' ? episodeReferences(index) : semantic.refs),
    [index, semantic.refs, suite],
  );
  const [caseId, setCase] = useState(() => {
    const value = new URLSearchParams(location.search).get('incident') ?? '';
    return (suite === 'core' ? CASES.some((item) => item.id === value) : /^D0[1-8]$/.test(value))
      ? value
      : suite === 'core'
        ? 'C07'
        : 'D01';
  });
  const [variant, setVariant] = useState(
    () => new URLSearchParams(location.search).get('condition') ?? 'noisy',
  );
  const [seed, setSeed] = useState(() =>
    Number(new URLSearchParams(location.search).get('seed') ?? 40000),
  );
  const [method, setMethod] = useState(() => {
    const value = new URLSearchParams(location.search).get('controller');
    return METHODS.some((m) => m.id === value) ? value! : 'M12';
  });
  const [comparison, setComparison] = useState(() => {
    const value = new URLSearchParams(location.search).get('compare');
    return METHODS.some((m) => m.id === value) ? value! : 'M01';
  });
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedSide, setSide] = useState(0);
  const [step, setStep] = useState(0);
  const [showWaiting, setShowWaiting] = useState(false);
  const available = refs.filter((r) => r.case_id === caseId && r.method_id === method);
  const variants = [...new Set(available.map((r) => r.variant ?? 'nominal'))];
  const actualVariant = variants.includes(variant)
    ? variant
    : (variants.find((v) => available.some((r) => r.variant === v && r.status === 'failed')) ??
      variants[0]);
  const seeds = [
    ...new Set(available.filter((r) => r.variant === actualVariant).map((r) => r.seed ?? 40000)),
  ].sort((a, b) => a - b);
  const actualSeed = seeds.includes(seed) ? seed : seeds[0];
  useEffect(() => {
    replaceQueryParam('suite', suite);
    replaceQueryParam('incident', caseId);
    replaceQueryParam('controller', method);
    replaceQueryParam('compare', comparison);
    if (actualVariant) replaceQueryParam('condition', actualVariant);
    if (actualSeed !== undefined) replaceQueryParam('seed', String(actualSeed));
  }, [suite, caseId, method, comparison, actualVariant, actualSeed]);
  useEffect(() => {
    if (!refs.length || actualSeed === undefined) return;
    let alive = true;
    const abort = new AbortController();
    setBusy(true);
    setError('');
    setEpisodes([]);
    setStep(0);
    const pair = [method, comparison].map((m) =>
      refs.find(
        (r) =>
          r.case_id === caseId &&
          r.method_id === m &&
          r.variant === actualVariant &&
          r.seed === actualSeed,
      ),
    );
    if (pair.some((r) => !r)) {
      setError(c('A matched comparison is unavailable.', 'No hay comparación emparejada.'));
      setBusy(false);
      return;
    }
    void Promise.all(pair.map((r) => loadEpisode(r!, abort.signal)))
      .then((value) => {
        if (alive) {
          setEpisodes(value);
          setStep(
            Math.max(
              0,
              value[selectedSide]?.decisions.findIndex((d) => d.action.startsWith('a-')) ?? 0,
            ),
          );
        }
      })
      .catch((e) => {
        if (alive) setError(String(e));
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
      abort.abort();
    };
  }, [refs, caseId, actualVariant, actualSeed, method, comparison]);
  const spec = CASES.find((item) => item.id === caseId);
  const episode = episodes[selectedSide];
  const planner = episode && (episode as unknown as { planner_work?: unknown }).planner_work;
  return (
    <div className="op-layout invest-layout">
      <aside className="op-sidebar">
        <div className="op-side-heading">
          <GitCompareArrows size={18} />
          {c('Investigate measured behavior', 'Investigar conducta medida')}
        </div>
        <label className="nx-control">
          {c('Evidence suite', 'Estudio de evidencia')}
          <select
            value={suite}
            onChange={(e) => {
              setSuite(e.target.value);
              setCase(e.target.value === 'core' ? 'C07' : 'D01');
              setComparison(e.target.value === 'core' ? 'M01' : 'M09');
              setEpisodes([]);
            }}
          >
            <option value="core">
              {c('Core software incidents', 'Incidentes de software principales')}
            </option>
            <option value="semantic_transfer">
              {c('Semantic tool choices', 'Elecciones semánticas de herramientas')}
            </option>
          </select>
        </label>
        {suite === 'semantic_transfer' && (
          <div className="op-input-card">
            <strong>{c('Inspect measured contrasts', 'Inspeccionar contrastes medidos')}</strong>
            {[
              {
                label: c(
                  'Planner succeeds, M12 fails',
                  'El planificador logra el objetivo, M12 falla',
                ),
                a: 'failed',
                b: 'succeeded',
              },
              {
                label: c(
                  'M12 succeeds, planner fails',
                  'M12 logra el objetivo, el planificador falla',
                ),
                a: 'succeeded',
                b: 'failed',
              },
              { label: c('Both fail', 'Ambos fallan'), a: 'failed', b: 'failed' },
            ].map((example) => {
              const row = refs.find(
                (r) =>
                  r.method_id === 'M12' &&
                  r.status === example.a &&
                  refs.some(
                    (other) =>
                      other.method_id === 'M09' &&
                      other.case_id === r.case_id &&
                      other.variant === r.variant &&
                      other.seed === r.seed &&
                      other.status === example.b,
                  ),
              );
              return (
                <button
                  key={example.label}
                  className="op-text-link"
                  disabled={!row}
                  onClick={() => {
                    setCase(row!.case_id);
                    setVariant(row!.variant!);
                    setSeed(row!.seed!);
                    setMethod('M12');
                    setComparison('M09');
                    setSide(0);
                  }}
                >
                  {example.label}
                  <ArrowRight size={14} />
                </button>
              );
            })}
          </div>
        )}
        <label className="nx-control">
          {c('Software incident', 'Incidente de software')}
          <select value={caseId} onChange={(e) => setCase(e.target.value)}>
            {(suite === 'core'
              ? CASES
              : Array.from({ length: 8 }, (_, i) => ({
                  id: `D0${i + 1}`,
                  name: {
                    en: `File transformation ${i + 1}`,
                    es: `Transformación de archivos ${i + 1}`,
                  },
                }))
            ).map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="nx-control">
          {c('Condition', 'Condición')}
          <select value={actualVariant ?? ''} onChange={(e) => setVariant(e.target.value)}>
            {variants.map((v) => (
              <option key={v} value={v}>
                {VARIANTS[VARIANT_IDS.indexOf(v)]?.[lang] ?? v}
              </option>
            ))}
          </select>
        </label>
        <label className="nx-control">
          {c('Matched seed', 'Semilla emparejada')}
          <select value={actualSeed ?? ''} onChange={(e) => setSeed(Number(e.target.value))}>
            {seeds.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="nx-control">
          {c('Controller', 'Controlador')}
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} · {m.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="nx-control">
          {c('Compare against', 'Comparar con')}
          <select value={comparison} onChange={(e) => setComparison(e.target.value)}>
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} · {m.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <div className="op-contract">
          <ShieldCheck size={20} />
          <div>
            <strong>{c('Recorded native execution', 'Ejecución nativa registrada')}</strong>
            <p>
              {c(
                'Each run is verified against its published SHA-256 before display. Inspection never re-executes its tools.',
                'Se verifica la huella SHA-256 publicada antes de mostrar cada ejecución. Inspeccionar nunca repite sus herramientas.',
              )}
            </p>
          </div>
        </div>
        <p className="op-scope">
          {c(
            suite === 'core'
              ? 'Frozen core: 12 controllers × 20 families × 6 conditions × 10 seeds.'
              : 'Separate semantic study: 12 controllers × 8 families × 2 conditions × 8 seeds. Fresh runs do not change these results.',
            suite === 'core'
              ? 'Matriz principal congelada: 12 controladores × 20 familias × 6 condiciones × 10 semillas.'
              : 'Estudio semántico separado: 12 controladores × 8 familias × 2 condiciones × 8 semillas. Las ejecuciones nuevas no cambian estos resultados.',
          )}
        </p>
      </aside>
      <div className="op-main">
        <header className="op-heading">
          <div>
            <span className="nx-kicker">
              {c('Measured incident investigation', 'Investigación de incidentes medidos')}
            </span>
            <h1>
              {spec?.name[lang] ??
                `${caseId} · ${c('Semantic file transformation', 'Transformación semántica de archivos')}`}
            </h1>
            <p>
              {suite === 'core'
                ? spec?.goal[lang]
                : c(
                    'Compare controllers choosing between opaque, type-compatible tools. Success requires three independently checked JSON file outputs.',
                    'Comparar controladores que eligen herramientas opacas con tipos compatibles. El éxito requiere tres salidas JSON comprobadas de forma independiente.',
                  )}
            </p>
          </div>
        </header>
        {(indexError || semantic.error || error) && (
          <div className="nx-error" role="alert">
            {indexError || semantic.error || error}
          </div>
        )}
        {(loading || (suite !== 'core' && semantic.loading) || busy) && (
          <p role="status" data-state="loading">
            {c(
              'Loading and verifying matched evidence…',
              'Cargando y verificando evidencia emparejada…',
            )}
          </p>
        )}
        <div className="invest-comparison">
          {episodes.map((e, side) => (
            <button
              key={side}
              className={`invest-result ${selectedSide === side ? 'selected' : ''}`}
              onClick={() => {
                setSide(side);
                setStep(
                  Math.max(
                    0,
                    e.decisions.findIndex((d) => d.action.startsWith('a-')),
                  ),
                );
              }}
              aria-pressed={side === selectedSide}
            >
              <span className="nx-kicker">
                {e.method_id} · {METHODS.find((m) => m.id === e.method_id)?.name[lang]}
              </span>
              <div className="invest-verdict" data-success={e.metrics.task_success === 1}>
                {e.metrics.task_success === 1 ? <CheckCircle2 size={27} /> : <XCircle size={27} />}
                <strong>
                  {e.metrics.task_success === 1
                    ? c('Goal verified', 'Objetivo verificado')
                    : c('Goal not achieved', 'Objetivo no alcanzado')}
                </strong>
              </div>
              <dl>
                <div>
                  <dt>{c('Elapsed', 'Tiempo')}</dt>
                  <dd>{metric(e, 'wall_ms', 1)} ms</dd>
                </div>
                <div>
                  <dt>{c('Planner starts', 'Inicios del planificador')}</dt>
                  <dd>{metric(e, 'delegations')}</dd>
                </div>
                <div>
                  <dt>{c('Native receipts', 'Recibos nativos')}</dt>
                  <dd>{metric(e, 'native_receipts')}</dd>
                </div>
                <div>
                  <dt>{c('Invalid outputs', 'Salidas inválidas')}</dt>
                  <dd>{metric(e, 'invalid_policy_output')}</dd>
                </div>
              </dl>
              <span className="op-text-link">
                {c('Inspect these decisions', 'Inspeccionar decisiones')}
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
        {suite === 'semantic_transfer' && episodes.length === 2 && (
          <section
            className="invest-files"
            aria-label={c('Observed JSON outputs', 'Salidas JSON observadas')}
          >
            <h2>{c('Files actually written', 'Archivos realmente escritos')}</h2>
            <p>
              {c(
                'Latest recorded value for each output. Missing evidence stays unknown; the independent goal check above determines overall success.',
                'Último valor registrado de cada salida. La evidencia ausente queda desconocida; la comprobación independiente anterior determina el éxito total.',
              )}
            </p>
            <div className="invest-comparison">
              {episodes.map((record, side) => (
                <div key={record.run_id}>
                  <h3>{record.method_id}</h3>
                  {['stage-1.json', 'stage-2.json', 'final.json'].map((file) => {
                    const write = record.decisions
                      .map((decision, index) => ({ decision, index }))
                      .filter(
                        ({ decision }) =>
                          typeof decision.effect_observed === 'object' &&
                          decision.effect_observed?.written === file,
                      )
                      .at(-1);
                    return (
                      <button
                        className="invest-file"
                        key={file}
                        disabled={!write}
                        onClick={() => {
                          setSide(side);
                          setStep(write!.index);
                        }}
                      >
                        <strong>{file}</strong>
                        <code>
                          {write
                            ? JSON.stringify(
                                (write.decision.effect_observed as Record<string, unknown>)
                                  .observed_value,
                              )
                            : c('No recorded write', 'Sin escritura registrada')}
                        </code>
                        {write && (
                          <small>
                            {c('Inspect write', 'Inspeccionar escritura')} #{write.index + 1}
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}
        <FreshInvestigation
          suite={suite}
          caseId={caseId}
          variant={actualVariant ?? 'nominal'}
          seed={actualSeed ?? 82000}
          method={method}
        />
        {episode && (
          <>
            <div className="invest-trace-head">
              <h2>{c('What actually happened', 'Lo que ocurrió')}</h2>
              <button
                className="nx-button"
                onClick={() => downloadJSON(episode, `${episode.run_id}.json`)}
              >
                <Download size={14} />
                {c('Export evidence', 'Exportar evidencia')}
              </button>
            </div>
            <label className="nx-control">
              <span>
                <input
                  type="checkbox"
                  checked={showWaiting}
                  onChange={(event) => setShowWaiting(event.target.checked)}
                />{' '}
                {c('Show every waiting event', 'Mostrar cada evento de espera')} (
                {episode.decisions.filter((d) => d.status === 'planner_pending').length})
              </span>
            </label>
            <div className="invest-action-strip">
              {episode.decisions
                .map((d, i) => ({ d, i }))
                .filter(
                  ({ d, i }) =>
                    showWaiting || d.status !== 'planner_pending' || i === 0 || i === step,
                )
                .map(({ d, i }) => (
                  <button
                    key={i}
                    className={step === i ? 'selected' : ''}
                    onClick={() => setStep(i)}
                    aria-pressed={step === i}
                  >
                    <span>
                      {String(i + 1).padStart(2, '0')}
                      <Zap size={13} />
                    </span>
                    <strong>
                      {String(
                        d.candidates.find((candidate) => candidate.action === d.action)?.arguments
                          ?.description ?? d.action,
                      )
                        .split(':')[0]
                        .replace(/^a-/, '')
                        .replaceAll('_', ' ')}
                    </strong>
                    <small>
                      {formatFixed(d.timestamp_ms, 1)} ms · {d.status}
                    </small>
                  </button>
                ))}
            </div>
            <ActionEvidence episode={episode} decision={episode.decisions[step]} />
            <details className="invest-planner">
              <summary>
                {c(
                  'Slow planner requests, arrivals and use',
                  'Solicitudes, llegadas y uso del planificador lento',
                )}
              </summary>
              <pre className="nx-code">{JSON.stringify(planner ?? [], null, 2)}</pre>
            </details>
            <p className="op-scope">
              {c(
                'A fast result is useful only when the task succeeds. These are owned controlled cases, not a claim of general intelligence or learned superiority. The benchmark includes unsuccessful controllers and negative ablations.',
                'La rapidez es útil cuando la tarea se resuelve. Son casos propios controlados, no una afirmación de inteligencia general o superioridad aprendida. El benchmark incluye fallos y ablaciones negativas.',
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
