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

function metric(episode: Episode, key: string, digits = 0) {
  const n = episode.metrics[key];
  return typeof n === 'number'
    ? n.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '…';
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
                <th>{c('Admitted candidate', 'Candidato admitido')}</th>
                <th>{c('Score', 'Puntaje')}</th>
                <th>{c('Probability', 'Probabilidad')}</th>
              </tr>
            </thead>
            <tbody>
              {decision.candidates.map((candidate, i) => (
                <tr key={i} className={decision.action === candidate.action ? 'nx-active-row' : ''}>
                  <td>{candidate.action}</td>
                  <td>{String(candidate.allowed)}</td>
                  <td>{candidate.score?.toFixed(4) ?? '…'}</td>
                  <td>{candidate.probability?.toFixed(4) ?? '…'}</td>
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
  const refs = useMemo(() => episodeReferences(index), [index]);
  const [caseId, setCase] = useState('C07');
  const [variant, setVariant] = useState('noisy');
  const [seed, setSeed] = useState(40000);
  const [method, setMethod] = useState('M12');
  const [comparison, setComparison] = useState('M01');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedSide, setSide] = useState(0);
  const [step, setStep] = useState(0);
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
    if (!refs.length || actualSeed === undefined) return;
    let alive = true;
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
    void Promise.all(pair.map((r) => loadEpisode(r!)))
      .then((value) => {
        if (alive) setEpisodes(value);
      })
      .catch((e) => {
        if (alive) setError(String(e));
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [refs, caseId, actualVariant, actualSeed, method, comparison]);
  const spec = CASES.find((item) => item.id === caseId)!;
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
          {c('Software incident', 'Incidente de software')}
          <select value={caseId} onChange={(e) => setCase(e.target.value)}>
            {CASES.map((item) => (
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
            'The complete core matrix contains 12 controllers × 20 task families × 6 conditions × 10 seeds. New task runs are separate from this frozen study.',
            'La matriz principal contiene 12 controladores × 20 familias × 6 condiciones × 10 semillas. Las nuevas tareas están separadas de este estudio congelado.',
          )}
        </p>
      </aside>
      <main className="op-main">
        <header className="op-heading">
          <div>
            <span className="nx-kicker">
              {c('Measured incident investigation', 'Investigación de incidentes medidos')}
            </span>
            <h1>{spec.name[lang]}</h1>
            <p>{spec.goal[lang]}</p>
          </div>
        </header>
        {(indexError || error) && (
          <div className="nx-error" role="alert">
            {indexError || error}
          </div>
        )}
        {(loading || busy) && (
          <p role="status">
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
                setStep(0);
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
            <div className="invest-action-strip">
              {episode.decisions.map((d, i) => (
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
                  <strong>{d.action.replace(/^a-/, '').replaceAll('_', ' ')}</strong>
                  <small>
                    {d.timestamp_ms.toFixed(1)} ms · {d.status}
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
      </main>
    </div>
  );
}
