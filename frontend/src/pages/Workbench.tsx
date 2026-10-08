import { useEffect, useMemo, useRef, useState } from 'react';
import { CaseSelector, Tabs, usePausedViz } from '@fasl-work/caos-app-shell';
import {
  Play,
  Pause,
  SkipForward,
  Square,
  RotateCcw,
  Download,
  Upload,
  Zap,
  Maximize2,
} from 'lucide-react';
import { localSession } from '../lib/session';
import EffectEvidence from '../components/EffectEvidence';
import Workspace from '../components/Workspace';
import { CASES, FAMILIES, METHODS, VARIANTS, VARIANT_IDS } from '../data/registry';
import { useCopy } from '../i18n';
import {
  api,
  downloadJSON,
  episodeReferences,
  loadEpisode,
  normalizeEpisode,
  useArtifacts,
} from '../api/artifacts';
import {
  advanceSimulation,
  cancelSimulation,
  startSimulation,
  type Simulation,
} from '../lib/simulator';
import { DEFAULT_PARAMETERS, type Episode, type Lane, type Parameters } from '../lib/types';
import {
  CandidatePlot,
  Coordination,
  PolicyDiagnostics,
  format,
  Panel,
  Readout,
  ResourceGraph,
  Series,
  Timeline,
} from '../components/Instruments';
const terminal = (status: string) =>
  ['completed', 'succeeded', 'failed', 'cancelled', 'unavailable'].includes(status);
export default function Workbench() {
  const saved = localSession.workbench;
  const { lang, t } = useCopy();
  const artifacts = useArtifacts();
  const [caseId, setCaseId] = useState((saved?.caseId as string) ?? 'C01');
  const [methodId, setMethodId] = useState((saved?.methodId as string) ?? 'M01');
  const [lane, setLane] = useState<Lane>((saved?.lane as Lane) ?? 'browser');
  const [variant, setVariant] = useState((saved?.variant as string) ?? 'nominal');
  const [seed, setSeed] = useState((saved?.seed as number) ?? 17);
  const [parameters, setParameters] = useState<Parameters>(
    (saved?.parameters as Parameters) ?? { ...DEFAULT_PARAMETERS },
  );
  const [simulation, setSimulation] = useState<Simulation>(
    () =>
      (saved?.simulation as Simulation) ??
      startSimulation('C01', 'M01', 'nominal', 17, DEFAULT_PARAMETERS),
  );
  const [record, setRecord] = useState<Episode | null>((saved?.record as Episode) ?? null);
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState(false);
  const [mobileControls, setMobileControls] = useState(false);
  const [workspaceActive, setWorkspaceActive] = useState(Boolean(saved?.workspaceActive));
  const [view, setView] = useState('timeline');
  const [token, setToken] = useState(localSession.token);
  const [maxSteps, setMaxSteps] = useState(16);
  const [nativeConfig, setNativeConfig] = useState<Record<string, unknown> | null>(
    (saved?.nativeConfig as Record<string, unknown>) ?? null,
  );
  const [pair, setPair] = useState<Episode | null>(null);
  const [pairMethod, setPairMethod] = useState('M02');
  const input = useRef<HTMLInputElement>(null);
  const mobileSwitch = useRef<HTMLButtonElement>(null);
  const frameClock = useRef(0);
  const configurationKey = JSON.stringify([caseId, methodId, variant, seed, parameters, lane]);
  const previousConfiguration = useRef(configurationKey);
  useEffect(() => {
    localSession.token = token;
    localSession.workbench = {
      caseId,
      methodId,
      lane,
      variant,
      seed,
      parameters,
      simulation,
      record,
      nativeConfig,
      workspaceActive,
    };
  }, [
    token,
    caseId,
    methodId,
    lane,
    variant,
    seed,
    parameters,
    simulation,
    record,
    nativeConfig,
    workspaceActive,
  ]);
  const spec = CASES.find((c) => c.id === caseId) ?? {
    id: caseId,
    name: { en: 'Imported workspace record', es: 'Registro de entorno importado' },
    family: { en: 'Imported evidence', es: 'Evidencia importada' },
    goal: {
      en: 'Inspect the imported record without dispatching its actions.',
      es: 'Inspeccionar el registro sin ejecutar sus acciones.',
    },
    actions: [],
    resource: '',
  };
  const method = METHODS.find((m) => m.id === methodId) ?? {
    id: methodId,
    name: { en: methodId, es: methodId },
    family: -1,
    learned: false,
    browser: false,
    description: {
      en: 'Method declared by the imported record; not independently verified.',
      es: 'Método declarado por el registro; no verificado de forma independiente.',
    },
  };
  const episode = lane === 'browser' ? simulation.episode : record;
  const decisions = episode?.decisions ?? [];
  const decision = decisions[Math.min(cursor, Math.max(0, decisions.length - 1))];
  const refs = useMemo(() => episodeReferences(artifacts.index), [artifacts.index]);
  const caseRefs = useMemo(
    () =>
      refs.filter((r) => r.case_id === caseId && r.method_id === methodId && r.variant === variant),
    [refs, caseId, methodId, variant],
  );
  const activeRef = caseRefs.find((r) => r.seed === seed) ?? caseRefs[0];
  const playback = usePausedViz((dt) => {
    frameClock.current += dt;
    if (frameClock.current < 350) return true;
    frameClock.current = 0;
    if (lane === 'browser') {
      if (terminal(simulation.episode.status)) return false;
      setSimulation((s) => advanceSimulation(s));
      return true;
    }
    if (!episode || cursor >= episode.decisions.length - 1) return false;
    setCursor((c) => c + 1);
    return true;
  });
  useEffect(() => {
    if (lane === 'browser') setCursor(Math.max(0, simulation.episode.decisions.length - 1));
    else if (lane === 'native' && record) setCursor(Math.max(0, record.decisions.length - 1));
  }, [simulation, lane, record?.decisions.length]);
  useEffect(() => {
    if (previousConfiguration.current === configurationKey) return;
    previousConfiguration.current = configurationKey;
    playback.pause();
    setCursor(0);
    setPair(null);
    setError('');
    if (lane === 'browser') {
      if (method.browser)
        setSimulation(startSimulation(caseId, methodId, variant, seed, parameters));
      else setLane('canonical');
    } else if (lane === 'native') {
      setRecord(null);
    }
  }, [caseId, methodId, variant, seed, parameters, lane]);
  useEffect(() => {
    if (lane !== 'canonical') return;
    let active = true;
    setRecord(null);
    if (!activeRef) return;
    setBusy(true);
    loadEpisode(activeRef)
      .then((e) => {
        if (active) setRecord(e);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [lane, activeRef?.run_id]);
  useEffect(() => {
    if (lane !== 'native' || !record || terminal(record.status)) return;
    const id = setInterval(() => {
      void api(
        `events?run_id=${encodeURIComponent(record.run_id)}&after=${record.decisions.at(-1)?.sequence ?? 0}`,
        token,
      )
        .then((value) => {
          if (value.episode) {
            setRecord(normalizeEpisode(value.episode));
            return;
          }
          setRecord((prior) => {
            if (!prior) return prior;
            const incoming = Array.isArray(value.decisions) ? value.decisions : [];
            const merged = [
              ...prior.decisions,
              ...incoming.filter(
                (d: { sequence: number }) =>
                  !prior.decisions.some((p) => p.sequence === d.sequence),
              ),
            ];
            return normalizeEpisode({ ...prior, ...value, decisions: merged });
          });
        })
        .catch((e) => setError(e.message));
    }, 700);
    return () => clearInterval(id);
  }, [lane, record?.run_id, record?.status, token]);
  const setParam = (key: keyof Parameters, value: number) =>
    setParameters((p) => ({ ...p, [key]: value }));
  async function connect() {
    setBusy(true);
    try {
      setNativeConfig(await api('config', token));
      setError('');
    } catch (e) {
      setError(`${t.offline}: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }
  async function run() {
    setError('');
    if (lane === 'native') {
      setBusy(true);
      try {
        const result = await api('run', token, {
          case_id: caseId,
          method_id: methodId,
          variant,
          seed,
          parameters: { max_steps: maxSteps },
        });
        setRecord(
          result.episode
            ? normalizeEpisode(result.episode)
            : {
                schema_version: 'neuraxis.episode.v1',
                run_id: result.run_id,
                case_id: caseId,
                method_id: methodId,
                variant,
                seed,
                parameters: { max_steps: maxSteps },
                status: result.status ?? 'running',
                lane: 'native',
                events: [],
                decisions: [],
                resources: [],
                metrics: {},
                provenance: {},
              },
        );
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
      return;
    }
    if (playback.playing) {
      playback.pause();
      return;
    }
    if (lane === 'browser' && terminal(simulation.episode.status)) {
      setSimulation(startSimulation(caseId, methodId, variant, seed, parameters));
    } else if (lane !== 'browser' && episode && cursor === episode.decisions.length - 1)
      setCursor(0);
    playback.play();
  }
  function step() {
    playback.pause();
    if (lane === 'browser') setSimulation((s) => advanceSimulation(s));
    else setCursor((c) => Math.min(c + 1, Math.max(0, decisions.length - 1)));
  }
  async function cancel() {
    playback.pause();
    if (lane === 'browser') setSimulation((s) => cancelSimulation(s));
    else if (lane === 'native' && record) {
      try {
        const r = await api(`cancel/${encodeURIComponent(record.run_id)}`, token, {});
        if (r.episode) setRecord(normalizeEpisode(r.episode));
        else setRecord({ ...record, status: r.status ?? 'cancelled' });
      } catch (e) {
        setError(String(e));
      }
    }
  }
  function reset() {
    playback.pause();
    setCursor(0);
    setPair(null);
    if (lane === 'browser')
      setSimulation(startSimulation(caseId, methodId, variant, seed, parameters));
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 20000000) throw new Error('File exceeds 20 MB');
      const e = normalizeEpisode(JSON.parse(await file.text()));
      playback.pause();
      setRecord(e);
      setCaseId(e.case_id);
      setMethodId(e.method_id);
      setVariant(e.variant);
      setSeed(e.seed);
      setLane('imported');
      setCursor(0);
      setError('');
    } catch {
      setError(t.fileImportError);
    }
  }
  async function compare() {
    const r = refs.find(
      (r) =>
        r.case_id === caseId &&
        r.method_id === pairMethod &&
        r.variant === variant &&
        r.seed === (episode?.seed ?? seed),
    );
    if (!r) {
      setError(t.waiting);
      return;
    }
    try {
      setPair(await loadEpisode(r));
    } catch (e) {
      setError(String(e));
    }
  }
  const selectedCases = [...CASES, ...(!CASES.some((c) => c.id === caseId) ? [spec] : [])].map(
    (c) => ({
      id: c.id,
      name: c.name[lang],
      category: c.family[lang],
      kind: 'synthetic' as const,
      anchor: c.goal[lang],
    }),
  );
  const nativeActive = lane === 'native' && record !== null && !terminal(record.status);
  const configurationLocked = nativeActive || lane === 'imported';
  const remaining =
    decision?.budget_remaining_ms ?? (lane === 'browser' ? parameters.budget_ms : undefined);
  const initialBudget =
    episode?.parameters.budget_ms ??
    decisions.find((d) => typeof d.budget_remaining_ms === 'number')?.budget_remaining_ms ??
    remaining;
  const budgetPercent =
    typeof remaining === 'number' && typeof initialBudget === 'number'
      ? Math.max(0, Math.min(100, (100 * remaining) / Math.max(1, initialBudget)))
      : 0;
  const controls = [
    {
      id: 'scenario',
      label: t.scenario,
      content: (
        <div className="nx-controls">
          {workspaceActive && (
            <button className="nx-button" onClick={() => setWorkspaceActive(false)}>
              {lang === 'en' ? 'Return to cases' : 'Volver a los casos'}
            </button>
          )}
          <label className="nx-control">
            {t.case}
            <div inert={configurationLocked}>
              <CaseSelector
                cases={selectedCases}
                selectedId={caseId}
                onSelect={setCaseId}
                lang={lang}
                layout="select"
                deepLink
                ariaLabel={t.case}
              />
            </div>
          </label>
          <p className="nx-goal">{spec.goal[lang]}</p>
          <label className="nx-control">
            {t.method}
            <select
              value={methodId}
              disabled={configurationLocked}
              onChange={(e) => setMethodId(e.target.value)}
            >
              {!METHODS.some((m) => m.id === methodId) && (
                <option value={methodId}>{methodId}</option>
              )}
              {FAMILIES.map((f, i) => (
                <optgroup key={i} label={f[lang]}>
                  {METHODS.filter((m) => m.family === i).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} {m.name[lang]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="nx-control">
            {t.lane}
            <select
              value={lane}
              disabled={nativeActive}
              onChange={(e) => {
                if (!CASES.some((c) => c.id === caseId)) setCaseId('C01');
                if (!METHODS.some((m) => m.id === methodId)) setMethodId('M01');
                setRecord(null);
                setLane(e.target.value as Lane);
              }}
            >
              <option value="browser" disabled={!method.browser}>
                {t.browser}
              </option>
              <option value="canonical">{t.canonical}</option>
              <option value="native">{t.native}</option>
              {lane === 'imported' && <option value="imported">{t.imported}</option>}
            </select>
          </label>
          <label className="nx-control">
            {t.variant}
            <select
              value={variant}
              disabled={configurationLocked}
              onChange={(e) => setVariant(e.target.value)}
            >
              {!VARIANT_IDS.includes(variant) && <option value={variant}>{variant}</option>}
              {VARIANTS.map((v, i) => (
                <option key={i} value={VARIANT_IDS[i]}>
                  {v[lang]}
                </option>
              ))}
            </select>
          </label>
          <label className="nx-control">
            {t.seed}
            <input
              type="number"
              value={lane === 'canonical' && record ? record.seed : seed}
              disabled={configurationLocked}
              min="0"
              max="999999"
              onChange={(e) => setSeed(Math.max(0, Math.floor(Number(e.target.value))))}
            />
          </label>
        </div>
      ),
    },
    {
      id: 'environment',
      label: t.environment,
      content: (
        <div className="nx-controls nx-environment-controls">
          {lane === 'native' && (
            <label className="nx-control">
              {lang === 'en' ? 'Maximum native steps' : 'Máximo de pasos nativos'}
              <input
                type="number"
                min="1"
                max="64"
                value={maxSteps}
                disabled={nativeActive}
                onChange={(e) => setMaxSteps(Math.max(1, Math.min(64, Number(e.target.value))))}
              />
            </label>
          )}
          {lane === 'browser' &&
            (
              [
                ['latency_ms', t.latency, 1, 600, 1],
                ['reliability', t.reliability, 0, 1, 0.01],
                ['budget_ms', t.budget, 100, 10000, 100],
                ['threshold', t.threshold, 0, 1, 0.01],
                ['noise', t.noise, 0, 0.8, 0.01],
                ['concurrency', t.concurrency, 1, 6, 1],
              ] as [keyof Parameters, string, number, number, number][]
            ).map(([key, label, min, max, step]) => (
              <label className="nx-control" key={key}>
                <span>
                  {label}
                  <b>{format(parameters[key])}</b>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={parameters[key]}
                  disabled={lane !== 'browser'}
                  onChange={(e) => setParam(key, Number(e.target.value))}
                />
              </label>
            ))}
          {lane !== 'browser' && lane !== 'native' && (
            <pre className="nx-code">{JSON.stringify(episode?.parameters ?? {}, null, 2)}</pre>
          )}
          <p className="nx-caption">
            {lane === 'native'
              ? lang === 'en'
                ? 'Environmental sliders belong to the browser simulator; native execution accepts only the step bound.'
                : 'Los deslizadores corresponden al simulador; la ejecución nativa solo acepta el límite de pasos.'
              : lane === 'canonical'
                ? t.parameterLocked
                : t.faultHint}
          </p>
          <button
            className="nx-button"
            disabled={lane !== 'browser' || terminal(simulation.episode.status)}
            onClick={() => setSimulation((s) => ({ ...s, fault: true }))}
          >
            <Zap size={14} />
            {t.inject}
          </button>
        </div>
      ),
    },
    {
      id: 'evidence',
      label: t.evidence,
      content: (
        <div className="nx-controls">
          <p className="nx-caption">{t.downloadHint}</p>
          <button
            className="nx-button"
            disabled={!episode}
            onClick={() => episode && downloadJSON(episode, `${episode.run_id}.json`)}
          >
            <Download size={14} />
            {t.export}
          </button>
          <button className="nx-button" onClick={() => input.current?.click()}>
            <Upload size={14} />
            {t.import}
          </button>
          <input
            ref={input}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void importFile(e.target.files?.[0])}
          />
          <label className="nx-control">
            {t.token}
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <p className="nx-caption">{t.nativeToken}</p>
          <button className="nx-button" onClick={() => void connect()} disabled={busy}>
            {t.connect}
          </button>
          {nativeConfig && <span className="badge live">{t.native}</span>}
          <button className="nx-button" onClick={artifacts.reload}>
            {t.retry}
          </button>
          <p className="nx-caption">
            {artifacts.index?.generated_at ?? artifacts.error ?? t.loading}
          </p>
        </div>
      ),
    },
    {
      id: 'workspace',
      label: lang === 'en' ? 'Workspace' : 'Archivos',
      content: (
        <div className="nx-controls">
          <p className="nx-goal">
            {lang === 'en'
              ? 'Author a dependency workflow for your configured local workspace. Preview exact file effects, execute with native authority, and independently verify SHA-256 targets.'
              : 'Crear un flujo de dependencias para el espacio local configurado. Revisar efectos, ejecutar con autoridad nativa y verificar objetivos SHA-256 de forma independiente.'}
          </p>
          <button
            className="btn primary"
            disabled={nativeActive}
            onClick={() => {
              playback.pause();
              setWorkspaceActive(true);
              setMobileControls(false);
              requestAnimationFrame(() => mobileSwitch.current?.focus());
            }}
          >
            {lang === 'en' ? 'Open workflow editor' : 'Abrir editor de flujos'}
          </button>
          <p className="nx-caption">
            {lang === 'en'
              ? 'Use Evidence to enter the local session token. The service operator grants the workspace root and registered tools; this page cannot grant itself wider access.'
              : 'Usar Evidencia para ingresar el token local. El operador concede la raíz y herramientas; la página no puede ampliar su propio acceso.'}
          </p>
          <p className="nx-caption">
            {lang === 'en'
              ? 'This lane uses strict dependency scheduling with independent effect checks. It does not relabel these rules as a learned policy.'
              : 'Este modo usa dependencias estrictas y verificación independiente. No presenta estas reglas como política aprendida.'}
          </p>
        </div>
      ),
    },
  ];
  const viewLabels = [
    ['timeline', t.timeline],
    ['workspace', t.state],
    ['candidates', t.probabilities],
    ['effects', t.effects],
    ['coordination', t.coordination],
    ['comparison', t.comparison],
  ];
  return (
    <div
      className={`page-body wide nx-layout ${focus ? 'nx-focus' : ''} ${mobileControls ? 'nx-mobile-controls' : ''}`}
      data-state={artifacts.loading ? 'loading' : 'ready'}
    >
      <div className="nx-mobile-switch">
        <span className="nx-kicker">NEURAXIS / {t.workbench}</span>
        <button
          ref={mobileSwitch}
          className="nx-button"
          aria-expanded={mobileControls}
          aria-controls="workbench-controls"
          onClick={() => {
            setFocus(false);
            setMobileControls(!mobileControls);
          }}
        >
          {mobileControls ? (lang === 'en' ? 'Instrument' : 'Instrumento') : t.controls}
        </button>
      </div>
      {!focus && (
        <aside
          className="nx-sidebar"
          id="workbench-controls"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && mobileControls) {
              setMobileControls(false);
              mobileSwitch.current?.focus();
            }
          }}
        >
          <div className="nx-side-title">
            <span className="nx-kicker">NEURAXIS / {t.controls}</span>
            <h1>{t.workbench}</h1>
          </div>
          <Tabs tabs={controls} ariaLabel={t.controls} />
          {!workspaceActive && (
            <div
              className="nx-diagnosis"
              data-status={episode?.status}
              data-run-id={episode?.run_id}
            >
              <div>
                <b>{episode?.status ?? t.ready}</b>
                <span>
                  {episode?.case_id ?? caseId} / {episode?.method_id ?? methodId}
                </span>
              </div>
              <p>
                {episode?.status === 'cancelled'
                  ? t.cancelNotice
                  : (decision?.reason ?? t.instruction)}
              </p>
              <div className="gauge">
                <div className="gauge-title">{t.remaining}</div>
                <div className="gauge-track">
                  <i style={{ width: `${budgetPercent}%` }} />
                </div>
                <div className="gauge-scale">
                  <span>0</span>
                  <b>{format(remaining)} ms</b>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}
      {workspaceActive ? (
        <Workspace token={token} onBack={() => setWorkspaceActive(false)} />
      ) : (
        <div className="nx-main">
          <div className="nx-work-head">
            <div>
              <span className="nx-kicker">
                {spec.family[lang]} / {caseId}
              </span>
              <h2>{spec.name[lang]}</h2>
              <p>
                {methodId} · {method.name[lang]}
              </p>
            </div>
            <button
              className="icon-btn"
              onClick={() => setFocus(!focus)}
              title={focus ? t.unfocus : t.focus}
              aria-label={focus ? t.unfocus : t.focus}
            >
              <Maximize2 size={18} />
            </button>
          </div>
          <div className="nx-runtime-bar">
            <button
              className="btn primary"
              onClick={() => void run()}
              disabled={
                busy ||
                (lane !== 'browser' && lane !== 'native' && !episode) ||
                (lane === 'native' && (!nativeConfig || !token || nativeActive))
              }
            >
              {playback.playing ? <Pause size={14} /> : <Play size={14} />}{' '}
              {nativeActive
                ? t.nativeBusy
                : playback.playing
                  ? t.pause
                  : lane === 'canonical' || lane === 'imported'
                    ? t.play
                    : t.run}
            </button>
            <button
              className="nx-button"
              onClick={step}
              disabled={lane === 'native' || (!episode && lane !== 'browser')}
            >
              <SkipForward size={14} />
              {t.step}
            </button>
            <button
              className="nx-button"
              onClick={() => void cancel()}
              disabled={
                !episode || terminal(episode.status) || !['browser', 'native'].includes(lane)
              }
            >
              <Square size={14} />
              {t.cancel}
            </button>
            <button
              className="nx-button"
              onClick={reset}
              disabled={lane === 'native' && episode !== null && !terminal(episode.status)}
            >
              <RotateCcw size={14} />
              {t.reset}
            </button>
            <span className={`badge ${lane === 'browser' ? 'live' : 'precomputed'}`}>
              {t[lane]}
            </span>
            <span className="nx-runtime-clock">{format(decision?.timestamp_ms, 0)} ms</span>
          </div>
          <div className="nx-boundary">
            {lane === 'browser'
              ? t.virtualNotice
              : lane === 'native'
                ? t.nativeNotice
                : lane === 'imported'
                  ? t.importNotice
                  : t.canonicalNotice}
          </div>
          <div className="nx-view-bar">
            <label>
              {t.overview}
              <select value={view} onChange={(e) => setView(e.target.value)}>
                {viewLabels.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="nx-cursor-control">
              {t.cursor}
              <input
                aria-label={t.cursor}
                type="range"
                min="0"
                max={Math.max(0, decisions.length - 1)}
                value={Math.min(cursor, Math.max(0, decisions.length - 1))}
                onChange={(e) => {
                  playback.pause();
                  setCursor(Number(e.target.value));
                }}
              />
              <b>
                {cursor + Number(decisions.length > 0)}/{decisions.length}
              </b>
            </label>
          </div>
          {error && (
            <div className="nx-error" role="alert">
              {error}
            </div>
          )}
          <div className="nx-instrument" key={`${view}-${methodId}`}>
            {!episode ? (
              <div className="nx-empty">
                <h3>{busy || artifacts.loading ? t.loading : t.waiting}</h3>
                <p>{method.browser ? t.artifactUnavailable : t.learnedNotice}</p>
              </div>
            ) : (
              <>
                {view === 'timeline' && (
                  <>
                    <Timeline episode={episode} cursor={cursor} onCursor={setCursor} />
                    <div className="nx-chart-grid">
                      <Series
                        episode={episode}
                        cursor={cursor}
                        onCursor={setCursor}
                        field="budget_remaining_ms"
                        title={t.remaining}
                        unit="ms"
                      />
                      <CandidatePlot decision={decision} />
                    </div>
                  </>
                )}
                {view === 'workspace' && (
                  <>
                    <ResourceGraph episode={episode} decision={decision} />
                    <Panel title={t.reason}>
                      <Readout decision={decision} />
                      <p>{decision?.reason ?? t.empty}</p>
                      <pre className="nx-code">
                        {JSON.stringify(decision?.detail ?? episode.provenance, null, 2)}
                      </pre>
                    </Panel>
                  </>
                )}
                {view === 'candidates' && (
                  <>
                    <PolicyDiagnostics episode={episode} cursor={cursor} onCursor={setCursor} />
                    <Panel title={`${methodId} / ${method.name[lang]}`}>
                      <p>{method.description[lang]}</p>
                      <div className="nx-method-flow">
                        <span>{t.observed}</span>
                        <b>→</b>
                        <span>{method.name[lang]}</span>
                        <b>→</b>
                        <span>{decision?.action ?? t.ready}</span>
                        <b>→</b>
                        <span>{t.outcome}</span>
                      </div>
                    </Panel>
                    <CandidatePlot decision={decision} />
                    <div className="nx-chart-grid">
                      <Series
                        episode={episode}
                        cursor={cursor}
                        onCursor={setCursor}
                        field="uncertainty"
                        title={t.uncertainty}
                      />
                      <Series
                        episode={episode}
                        cursor={cursor}
                        onCursor={setCursor}
                        field="threshold"
                        title={t.threshold}
                        color="warn"
                      />
                    </div>
                  </>
                )}
                {view === 'effects' && (
                  <EffectEvidence episode={episode} cursor={cursor} onCursor={setCursor} />
                )}
                {view === 'coordination' && (
                  <>
                    <Coordination episode={episode} cursor={cursor} onCursor={setCursor} />
                    <ResourceGraph episode={episode} decision={decision} />
                  </>
                )}
                {view === 'comparison' && (
                  <>
                    <Panel title={t.comparison}>
                      <div className="nx-inline-controls">
                        <select
                          aria-label={t.method}
                          value={pairMethod}
                          onChange={(e) => setPairMethod(e.target.value)}
                        >
                          {METHODS.map((m) => (
                            <option value={m.id} key={m.id}>
                              {m.id} {m.name[lang]}
                            </option>
                          ))}
                        </select>
                        <button
                          className="nx-button"
                          disabled={lane !== 'canonical'}
                          onClick={() => void compare()}
                        >
                          {t.compare}
                        </button>
                      </div>
                      <p className="nx-caption">{t.canonicalNotice}</p>
                      {pair ? (
                        <div className="nx-chart-grid">
                          {[episode, pair].map((e) => (
                            <div key={e.run_id}>
                              <h4>{e.method_id}</h4>
                              <pre className="nx-code">{JSON.stringify(e.metrics, null, 2)}</pre>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{t.comparisonEmpty}</p>
                      )}
                    </Panel>
                    {pair && (
                      <Timeline
                        episode={pair}
                        cursor={Math.min(cursor, pair.decisions.length - 1)}
                        onCursor={setCursor}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <div className="nx-bottom-readout">
            <span>
              {t.events}: {episode?.events.length ?? 0}
            </span>
            <span>
              {t.actions}: {decisions.length}
            </span>
            <span>
              {t.source}: {episode?.lane ?? lane}
            </span>
            <span>{t.pausedHint}</span>
          </div>
        </div>
      )}
    </div>
  );
}
