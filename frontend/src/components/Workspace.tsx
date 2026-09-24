import { useEffect, useRef, useState } from 'react';
import { Download, Play, RefreshCw, Square, Upload } from 'lucide-react';
import { localSession } from '../lib/session';
import { api, downloadJSON } from '../api/artifacts';
import { useCopy } from '../i18n';
import Recovery from './Recovery';
import { Panel, format } from './Instruments';
interface RecipeStep {
  id: string;
  tool: string;
  arguments: Record<string, unknown>;
  depends_on?: string[];
  verify: { path: string; sha256: string };
  timeout_seconds?: number;
}
interface Recipe {
  schema_version: 1;
  steps: RecipeStep[];
}
interface Configuration {
  enabled: boolean;
  workspace_label?: string;
  canonical_root?: string;
  tools?: string[];
  schema_version?: number;
}
interface Preview {
  preview_id: string;
  canonical_root: string;
  steps: unknown[];
  capabilities: unknown;
  preconditions: unknown;
  expires_in_seconds: number;
}
interface Journal {
  sequence?: number;
  kind?: string;
  event_kind?: string;
  type?: string;
  [key: string]: unknown;
}
interface WorkflowRun {
  run_id: string;
  status: string;
  events: Journal[];
  error?: string;
  workflow?: Record<string, unknown>;
}
const isTerminal = (status: string) =>
  ['succeeded', 'completed', 'failed', 'cancelled', 'unavailable'].includes(status);
const emptyRecipe = JSON.stringify({ schema_version: 1, steps: [] }, null, 2);
export function parseRecipe(text: string): Recipe {
  const r = JSON.parse(text);
  if (
    !r ||
    r.schema_version !== 1 ||
    !Array.isArray(r.steps) ||
    r.steps.length < 1 ||
    r.steps.length > 128
  )
    throw new Error('Expected schema_version 1 and 1–128 steps');
  const known = new Set<string>();
  for (const s of r.steps) {
    if (
      !s ||
      typeof s.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(s.id) ||
      known.has(s.id) ||
      typeof s.tool !== 'string' ||
      !s.arguments ||
      typeof s.arguments !== 'object' ||
      Array.isArray(s.arguments) ||
      !s.verify ||
      typeof s.verify.path !== 'string' ||
      !/^[a-f0-9]{64}$/.test(s.verify.sha256)
    )
      throw new Error(
        'Every step needs a unique id, tool, arguments and independently verified lowercase SHA-256 target',
      );
    if (
      s.depends_on &&
      (!Array.isArray(s.depends_on) ||
        s.depends_on.some((id: unknown) => typeof id !== 'string') ||
        new Set(s.depends_on).size !== s.depends_on.length)
    )
      throw new Error('Invalid dependencies');
    known.add(s.id);
  }
  const remaining = new Map<string, RecipeStep>(r.steps.map((s: RecipeStep) => [s.id, s]));
  const complete = new Set<string>();
  while (remaining.size) {
    const ready = [...remaining.values()].filter((s) =>
      (s.depends_on ?? []).every((id) => complete.has(id)),
    );
    if (!ready.length) throw new Error('Dependency cycle or unknown step');
    for (const s of ready) {
      remaining.delete(s.id);
      complete.add(s.id);
    }
  }
  return r;
}
export async function contentDigest(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
function ReceiptEvidence({ workflow }: { workflow?: Record<string, unknown> }) {
  const { lang, t } = useCopy();
  const copy = (en: string, es: string) => (lang === 'en' ? en : es);
  const [selected, setSelected] = useState(0);
  const rows = Object.entries(asRecord(workflow?.goal_evidence)).flatMap(([goal, raw]) => {
    const evidence = asRecord(raw);
    const history = Array.isArray(evidence.history) ? evidence.history : [];
    return history
      .filter((item) => asRecord(item).kind === 'effect')
      .map((item) => {
        const receipt = asRecord(asRecord(item).receipt),
          outcome = asRecord(receipt.outcome),
          effect = asRecord(outcome.evidence),
          intent = asRecord(receipt.intent),
          args = asRecord(intent.arguments);
        const duration =
          typeof receipt.finished_ms === 'number' && typeof receipt.started_ms === 'number'
            ? receipt.finished_ms - receipt.started_ms
            : undefined;
        return { goal, state: evidence.state, receipt, effect, outcome, intent, args, duration };
      });
  });
  const row = rows[Math.min(selected, Math.max(0, rows.length - 1))];
  return (
    <Panel
      title={copy('Verified effects and native receipts', 'Efectos verificados y recibos nativos')}
    >
      <div className="nx-table-scroll">
        <table className="nx-table">
          <thead>
            <tr>
              <th>{copy('Goal / tool', 'Objetivo / herramienta')}</th>
              <th>{t.resource}</th>
              <th>{t.status}</th>
              <th>{copy('Effect duration', 'Duración del efecto')}</th>
              <th>{copy('Bytes', 'Bytes')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={selected === i ? 'nx-active-row' : ''}
                onClick={() => setSelected(i)}
              >
                <th>
                  <button className="nx-text-button" onClick={() => setSelected(i)}>
                    {r.goal}
                  </button>
                  <br />
                  <code>{String(r.intent.action_id ?? '--')}</code>
                </th>
                <td>
                  <code>{String(r.effect.path ?? r.args.path ?? '--')}</code>
                </td>
                <td>{String(r.outcome.status ?? r.receipt.status ?? '--')}</td>
                <td>{format(r.duration)} ms</td>
                <td>{format(r.effect.bytes, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {row ? (
        <>
          <div className="nx-hash-evidence">
            <span>{copy('Expected SHA-256', 'SHA-256 esperado')}</span>
            <code>{String(row.effect.expected_sha256 ?? '--')}</code>
            <span>{copy('Observed SHA-256', 'SHA-256 observado')}</span>
            <code>{String(row.effect.sha256 ?? '--')}</code>
            <span>{copy('Independent comparison', 'Comparación independiente')}</span>
            <b>
              {typeof row.effect.sha256 === 'string' &&
              typeof row.effect.expected_sha256 === 'string'
                ? row.effect.sha256 === row.effect.expected_sha256
                  ? copy('Exact byte digest match', 'Coincidencia exacta de huellas')
                  : copy('Digest mismatch', 'Discrepancia de huellas')
                : copy(
                    'See the separately recorded goal predicate',
                    'Consultar el predicado del objetivo registrado por separado',
                  )}
            </b>
          </div>
          <details className="nx-evidence-detail">
            <summary>
              {copy('Inspect the selected receipt', 'Inspeccionar el recibo seleccionado')}
            </summary>
            <pre className="nx-code">{JSON.stringify(row.receipt, null, 2)}</pre>
          </details>
        </>
      ) : (
        <p className="nx-caption">
          {copy(
            'No effect receipt was emitted. A goal that already satisfies its predicate may finish without dispatching a tool.',
            'No se emitió recibo. Un objetivo cuyo predicado ya se cumple puede finalizar sin ejecutar una herramienta.',
          )}
        </p>
      )}
    </Panel>
  );
}
export default function Workspace({ token, onBack }: { token: string; onBack: () => void }) {
  const saved = localSession.workspace;
  const { lang, t } = useCopy();
  const copy = (en: string, es: string) => (lang === 'en' ? en : es);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [recipe, setRecipe] = useState((saved?.recipe as string) ?? emptyRecipe);
  const [tool, setTool] = useState('file.write');
  const [path, setPath] = useState('neuraxis-result.txt');
  const [content, setContent] = useState('Verified by Neuraxis.\n');
  const [expected, setExpected] = useState('');
  const [argumentsJSON, setArgumentsJSON] = useState('{}');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [expires, setExpires] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [run, setRun] = useState<WorkflowRun | null>((saved?.run as WorkflowRun) ?? null);
  const [cursor, setCursor] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'author' | 'journal' | 'recovery'>(
    saved?.run ? 'journal' : 'author',
  );
  const [editor, setEditor] = useState<'helper' | 'json'>('helper');
  const input = useRef<HTMLInputElement>(null);
  const previewPanel = useRef<HTMLDivElement>(null);
  const instrument = useRef<HTMLDivElement>(null);
  const active = Boolean(run && !isTerminal(run.status));
  useEffect(() => {
    instrument.current?.scrollTo({ top: 0 });
  }, [view]);
  useEffect(() => {
    localSession.workspace = { recipe, run };
  }, [recipe, run]);
  async function connect() {
    setBusy(true);
    try {
      const c = await api('workspace/config', token);
      setConfiguration(c);
      setError('');
    } catch (e) {
      setConfiguration(null);
      setError(`${t.offline}: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (token) void connect();
    else setConfiguration(null);
  }, [token]);
  useEffect(() => {
    if (!preview) return;
    previewPanel.current?.scrollIntoView({ block: 'nearest' });
    const update = () => setSeconds(Math.max(0, Math.ceil((expires - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 500);
    return () => clearInterval(timer);
  }, [preview, expires]);
  useEffect(() => {
    if (!active || !run) return;
    let alive = true;
    const timer = setInterval(() => {
      void api(`workspace/events?run_id=${encodeURIComponent(run.run_id)}&after=0`, token)
        .then((value) => {
          if (!alive) return;
          setRun({
            ...value,
            run_id: run.run_id,
            events: Array.isArray(value.events) ? value.events : [],
          });
          if (Array.isArray(value.events)) setCursor(Math.max(0, value.events.length - 1));
        })
        .catch((e) => {
          if (alive) setError(String(e));
        });
    }, 500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [active, run?.run_id, token]);
  function changeRecipe(text: string) {
    setRecipe(text);
    setPreview(null);
    setError('');
  }
  async function addStep() {
    try {
      const r = JSON.parse(recipe) as Recipe;
      if (r.schema_version !== 1 || !Array.isArray(r.steps))
        throw new Error('Expected a recipe object');
      const sha256 =
        tool === 'file.write' ? await contentDigest(content) : expected.trim().toLowerCase();
      if (!/^[a-f0-9]{64}$/i.test(sha256))
        throw new Error(
          copy(
            'Provide the independently expected SHA-256 digest.',
            'Indicar la huella SHA-256 esperada de forma independiente.',
          ),
        );
      const prior = r.steps.at(-1);
      r.steps.push({
        id: `step_${r.steps.length + 1}`,
        tool,
        arguments:
          tool === 'file.write'
            ? { path, content }
            : tool === 'file.read'
              ? { path }
              : JSON.parse(argumentsJSON),
        depends_on: prior ? [prior.id] : [],
        verify: { path, sha256 },
        timeout_seconds: 30,
      });
      parseRecipe(JSON.stringify(r));
      changeRecipe(JSON.stringify(r, null, 2));
    } catch (e) {
      setError(String(e));
    }
  }
  async function inspect() {
    setBusy(true);
    try {
      const value = await api('workspace/preview', token, parseRecipe(recipe));
      setPreview(value);
      setExpires(Date.now() + value.expires_in_seconds * 1000);
      setError('');
    } catch (e) {
      setPreview(null);
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function execute() {
    if (!preview || seconds <= 0) return;
    setBusy(true);
    try {
      const result = await api('workspace/run', token, { preview_id: preview.preview_id });
      setRun({ ...result, events: [] });
      setView('journal');
      setPreview(null);
      setError('');
    } catch (e) {
      setError(String(e));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }
  async function cancel() {
    if (!run) return;
    try {
      const value = await api(`workspace/cancel/${encodeURIComponent(run.run_id)}`, token, {});
      setRun((prior) => (prior ? { ...prior, ...value } : prior));
    } catch (e) {
      setError(String(e));
    }
  }
  async function importRecipe(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Recipe exceeds 1 MB');
      const text = await file.text();
      parseRecipe(text);
      changeRecipe(text);
    } catch (e) {
      setError(String(e));
    }
  }
  let steps: RecipeStep[] = [];
  try {
    const parsed = JSON.parse(recipe);
    steps = Array.isArray(parsed?.steps)
      ? parsed.steps.filter(
          (s: unknown) =>
            s &&
            typeof s === 'object' &&
            typeof (s as RecipeStep).id === 'string' &&
            Array.isArray((s as RecipeStep).depends_on ?? []),
        )
      : [];
  } catch {
    /* The editable JSON can be incomplete. */
  }
  const event = run?.events[cursor];
  return (
    <div className="nx-main nx-workspace">
      <div className="nx-work-head">
        <div>
          <span className="nx-kicker">
            {copy('User workspace / native authority', 'Espacio del usuario / autoridad nativa')}
          </span>
          <h2>{copy('Verified workflow editor', 'Editor de flujos verificados')}</h2>
          <p>
            {configuration?.workspace_label ??
              copy(
                'Connect an operator-configured local workspace',
                'Conectar un espacio local configurado por el operador',
              )}
          </p>
        </div>
        <button className="nx-button" onClick={onBack} disabled={active}>
          {copy('Case workbench', 'Banco de casos')}
        </button>
      </div>
      <div className="nx-runtime-bar">
        <button
          className="nx-button"
          onClick={() => void connect()}
          disabled={busy || active || !token}
        >
          <RefreshCw size={14} />
          {t.connect}
        </button>
        {view === 'author' && (
          <button
            className="nx-button"
            onClick={() => void inspect()}
            disabled={busy || active || !configuration?.enabled}
          >
            {copy('Preview recipe', 'Previsualizar receta')}
          </button>
        )}
        {view === 'author' && (
          <button
            className="nx-button nx-primary"
            onClick={() => void execute()}
            disabled={busy || active || !preview || seconds <= 0}
          >
            <Play size={14} />
            {copy('Execute reviewed recipe', 'Ejecutar receta revisada')}
          </button>
        )}
        <button className="nx-button" onClick={() => void cancel()} disabled={!active}>
          <Square size={14} />
          {t.cancel}
        </button>
        <span className="badge">
          {run?.status ?? (configuration?.enabled ? t.ready : t.offline)}
        </span>
      </div>
      <div className="nx-boundary">
        {copy(
          'Strict dependency controller. Authority is limited to the root and tools registered by the local operator. A preview is single-use, expires after 120 seconds, and is checked again before effects.',
          'Controlador estricto de dependencias. La autoridad se limita a la raíz y herramientas registradas localmente. La previsualización se usa una vez, vence a los 120 segundos y se verifica antes de producir efectos.',
        )}
      </div>
      <div className="nx-view-bar">
        <label>
          {t.overview}
          <select value={view} onChange={(e) => setView(e.target.value as typeof view)}>
            <option value="author">{copy('Recipe and admission', 'Receta y admisión')}</option>
            <option value="journal">
              {copy('Execution and verification', 'Ejecución y verificación')}
            </option>
            <option value="recovery">
              {copy('Unknown-effect recovery', 'Recuperar efectos desconocidos')}
            </option>
          </select>
        </label>
        <span className="nx-caption">
          {configuration?.canonical_root ??
            copy('No workspace authority granted', 'Sin autoridad sobre archivos')}
        </span>
      </div>
      {error && (
        <div className="nx-error" role="alert">
          {error}
        </div>
      )}
      <div className="nx-instrument" ref={instrument}>
        {view === 'recovery' ? (
          <Recovery token={token} active={active} />
        ) : view === 'author' ? (
          <>
            <Panel title={copy('Declared workspace', 'Espacio declarado')}>
              <p className="nx-caption">
                {configuration?.enabled
                  ? copy('Registered tools: ', 'Herramientas registradas: ') +
                    (configuration.tools ?? []).join(', ')
                  : copy(
                      'Start the local service with an explicit existing workspace root. Enter its session token in Evidence. Hosted static pages have no native workspace authority.',
                      'Iniciar el servicio local con una raíz existente explícita. Ingresar su token en Evidencia. Las páginas estáticas no tienen autoridad nativa.',
                    )}
              </p>
              <div className="nx-inline-controls">
                <button
                  className="nx-button"
                  disabled={active}
                  onClick={() => input.current?.click()}
                >
                  <Upload size={14} />
                  {copy('Import recipe', 'Importar receta')}
                </button>
                <button
                  className="nx-button"
                  onClick={() => downloadJSON(JSON.parse(recipe), 'neuraxis-recipe.json')}
                  disabled={active || !steps.length}
                >
                  <Download size={14} />
                  {copy('Export recipe', 'Exportar receta')}
                </button>
                <select
                  aria-label={copy('Recipe editor', 'Editor de receta')}
                  value={editor}
                  onChange={(e) => setEditor(e.target.value as typeof editor)}
                >
                  <option value="helper">{copy('Step builder', 'Constructor de pasos')}</option>
                  <option value="json">JSON</option>
                </select>
                <input
                  type="file"
                  accept="application/json,.json"
                  hidden
                  ref={input}
                  onChange={(e) => void importRecipe(e.target.files?.[0])}
                />
              </div>
            </Panel>
            {editor === 'helper' ? (
              <Panel
                title={copy(
                  'Add an independently verified step',
                  'Agregar un paso verificado de forma independiente',
                )}
              >
                <div className="nx-workspace-fields">
                  <label className="nx-control">
                    {copy('Registered tool', 'Herramienta registrada')}
                    <select
                      value={tool}
                      disabled={active}
                      onChange={(e) => setTool(e.target.value)}
                    >
                      {(configuration?.tools ?? ['file.read', 'file.write']).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="nx-control">
                    {copy('Relative verification path', 'Ruta relativa de verificación')}
                    <input
                      value={path}
                      disabled={active}
                      onChange={(e) => setPath(e.target.value)}
                      spellCheck={false}
                    />
                  </label>
                  {tool === 'file.write' ? (
                    <label className="nx-control nx-workspace-wide">
                      {copy('Exact UTF-8 content', 'Contenido UTF-8 exacto')}
                      <textarea
                        value={content}
                        disabled={active}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                      />
                      <span className="nx-caption">
                        {copy(
                          'The helper hashes these exact UTF-8 bytes before execution; the server independently reads and hashes the resulting file.',
                          'El constructor calcula la huella de estos bytes UTF-8 antes de ejecutar; el servidor lee y calcula la huella del archivo resultante.',
                        )}
                      </span>
                    </label>
                  ) : (
                    <>
                      <label className="nx-control nx-workspace-wide">
                        {copy('Expected SHA-256', 'SHA-256 esperado')}
                        <input
                          value={expected}
                          disabled={active}
                          onChange={(e) => setExpected(e.target.value)}
                          spellCheck={false}
                        />
                      </label>
                      {tool.startsWith('process.') && (
                        <label className="nx-control nx-workspace-wide">
                          {copy('Arguments object (JSON)', 'Objeto de argumentos (JSON)')}
                          <textarea
                            rows={3}
                            value={argumentsJSON}
                            disabled={active}
                            onChange={(e) => setArgumentsJSON(e.target.value)}
                          />
                        </label>
                      )}
                    </>
                  )}
                </div>
                <button className="nx-button" onClick={() => void addStep()} disabled={active}>
                  {copy('Append dependent step', 'Agregar paso dependiente')}
                </button>
                <p className="nx-caption">
                  {copy(
                    'Each added step depends on the previous step. Use JSON to author branching dependencies or edit a step. No recipe executes on import, edit or preview.',
                    'Cada paso agregado depende del anterior. JSON permite ramificaciones o editar pasos. Importar, editar y previsualizar no ejecuta la receta.',
                  )}
                </p>
              </Panel>
            ) : (
              <Panel title={copy('Recipe JSON', 'JSON de la receta')}>
                <textarea
                  className="nx-recipe-editor"
                  aria-label="Recipe JSON"
                  value={recipe}
                  disabled={active}
                  onChange={(e) => changeRecipe(e.target.value)}
                  rows={16}
                  spellCheck={false}
                />
              </Panel>
            )}
            <Panel
              title={copy(
                'Dependency graph and verification targets',
                'Grafo de dependencias y objetivos de verificación',
              )}
            >
              <svg
                className="nx-chart"
                viewBox={`0 0 900 ${Math.max(110, Math.ceil(steps.length / 3) * 100)}`}
                role="img"
                aria-label={copy(
                  'Declared recipe dependency graph',
                  'Grafo declarado de dependencias',
                )}
              >
                {steps.map((s, i) => {
                  const x = 20 + (i % 3) * 295,
                    y = 15 + Math.floor(i / 3) * 100;
                  return (
                    <g key={`${s.id}-${i}`}>
                      <rect
                        x={x}
                        y={y}
                        width="270"
                        height="75"
                        rx="8"
                        className="nx-graph-resource"
                      />
                      <text x={x + 12} y={y + 23} className="nx-label">
                        {s.id} / {s.tool}
                      </text>
                      <text x={x + 12} y={y + 44} className="nx-axis-label">
                        {(s.verify?.path ?? '').slice(0, 34)}
                      </text>
                      <text x={x + 12} y={y + 62} className="nx-axis-label">
                        {(s.depends_on ?? []).join(', ') || copy('root step', 'paso raíz')}
                      </text>
                      {(s.depends_on ?? []).map((id) => {
                        const j = steps.findIndex((v) => v.id === id);
                        if (j < 0) return null;
                        return (
                          <path
                            key={id}
                            d={`M${155 + (j % 3) * 295},${90 + Math.floor(j / 3) * 100} L${x + 135},${y}`}
                            className="nx-edge"
                          />
                        );
                      })}
                    </g>
                  );
                })}
                {!steps.length && (
                  <text x="450" y="58" textAnchor="middle" className="nx-label">
                    {copy('No steps authored', 'Sin pasos definidos')}
                  </text>
                )}
              </svg>
              <div className="nx-table-scroll">
                <table className="nx-table">
                  <thead>
                    <tr>
                      <th>ID / tool</th>
                      <th>{copy('Dependencies', 'Dependencias')}</th>
                      <th>
                        {copy(
                          'Verification target / SHA-256',
                          'Objetivo de verificación / SHA-256',
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((s, i) => (
                      <tr key={i}>
                        <td>
                          {s.id}
                          <br />
                          <code>{s.tool}</code>
                        </td>
                        <td>{(s.depends_on ?? []).join(', ') || '·'}</td>
                        <td>
                          <code>
                            {s.verify?.path}
                            <br />
                            {s.verify?.sha256}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            {preview && (
              <div ref={previewPanel}>
                <Panel
                  title={copy(
                    `Review admitted effects · ${seconds}s remaining`,
                    `Revisar efectos admitidos · quedan ${seconds}s`,
                  )}
                >
                  <p>{preview.canonical_root}</p>
                  <pre className="nx-code">
                    {JSON.stringify(
                      {
                        steps: preview.steps,
                        capabilities: preview.capabilities,
                        preconditions: preview.preconditions,
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <p className="nx-caption">
                    {copy(
                      'Execution applies these exact admitted steps. Any editor change invalidates this preview. A changed file precondition requires a fresh preview.',
                      'La ejecución aplica exactamente estos pasos. Editar invalida la previsualización. Cambiar una precondición exige otra previsualización.',
                    )}
                  </p>
                </Panel>
              </div>
            )}
          </>
        ) : (
          <>
            <Panel title={copy('Workflow outcome', 'Resultado del flujo')}>
              <div className="nx-inline-controls">
                <b>{run?.status ?? t.noResult}</b>
                <button
                  className="nx-button"
                  disabled={!run}
                  onClick={() => run && downloadJSON(run, `${run.run_id}.json`)}
                >
                  <Download size={14} />
                  {t.export}
                </button>
              </div>
              <div className="nx-workflow-goals">
                {Object.entries((run?.workflow?.goals ?? {}) as Record<string, string>).map(
                  ([id, state]) => (
                    <div key={id} data-state={state}>
                      <b>{id}</b>
                      <span>{state}</span>
                    </div>
                  ),
                )}
              </div>
              <p className="nx-caption">{t.cancelNotice}</p>
              {run?.error && <p className="nx-error">{run.error}</p>}
              <details className="nx-evidence-detail">
                <summary>{copy('Complete workflow record', 'Registro completo del flujo')}</summary>
                <pre className="nx-code">{JSON.stringify(run?.workflow ?? {}, null, 2)}</pre>
              </details>
            </Panel>
            <ReceiptEvidence workflow={run?.workflow} />
            <Panel title={copy('Authoritative event journal', 'Diario de eventos autorizado')}>
              <svg
                className="nx-chart"
                viewBox="0 0 900 115"
                role="img"
                aria-label={copy('Journal sequence', 'Secuencia del diario')}
              >
                <line x1="30" y1="55" x2="870" y2="55" className="nx-axis" />
                {(run?.events ?? []).map((e, i) => (
                  <g
                    key={i}
                    tabIndex={0}
                    role="button"
                    aria-label={`${e.sequence ?? i}: ${e.kind ?? e.type ?? 'event'}`}
                    onFocus={() => setCursor(i)}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => setCursor(i)}
                    onKeyDown={(key) => {
                      if (key.key === 'Enter') setCursor(i);
                    }}
                  >
                    <circle
                      cx={30 + (i * 840) / Math.max(1, (run?.events.length ?? 1) - 1)}
                      cy="55"
                      r={i === cursor ? 9 : 6}
                      className="nx-node"
                    />
                    <text
                      x={30 + (i * 840) / Math.max(1, (run?.events.length ?? 1) - 1)}
                      y="83"
                      textAnchor="middle"
                      className="nx-axis-label"
                    >
                      {e.sequence ?? i}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="nx-table-scroll">
                <table className="nx-table">
                  <thead>
                    <tr>
                      <th>{copy('Sequence', 'Secuencia')}</th>
                      <th>{copy('Event', 'Evento')}</th>
                      <th>{copy('Recorded evidence', 'Evidencia registrada')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(run?.events ?? []).map((e, i) => (
                      <tr
                        key={i}
                        className={i === cursor ? 'nx-active-row' : ''}
                        onClick={() => setCursor(i)}
                      >
                        <td>
                          <button
                            className="nx-text-button"
                            onFocus={() => setCursor(i)}
                            onClick={() => setCursor(i)}
                          >
                            {e.sequence ?? i}
                          </button>
                        </td>
                        <td>{String(e.kind ?? e.event_kind ?? e.type ?? 'event')}</td>
                        <td>
                          <code>{JSON.stringify(e).slice(0, 220)}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <details className="nx-evidence-detail">
                <summary>
                  {copy('Selected event record', 'Registro del evento seleccionado')}
                </summary>
                <pre className="nx-code">{JSON.stringify(event ?? {}, null, 2)}</pre>
              </details>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
