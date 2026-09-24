import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  Download,
  File,
  Files,
  FolderOpen,
  GitBranch,
  LoaderCircle,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useCopy } from '../i18n';
import { localSession } from '../lib/session';
import {
  activeRun,
  conditionLabels,
  statusLabels,
  findingLabels,
  ensureOperationSession,
  exportOperation,
  fileSummary,
  operationAPI,
  operationOutcome,
  OperationError,
  saveCachedOperation,
  taskLabels,
  type InputFile,
  type OperationNode,
  type OperationRun,
  type OperationSummary,
} from '../lib/operations';
import OperationGraph from './OperationGraph';

const empty: InputFile[] = [];
function shown(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
export default function Operations() {
  const { lang } = useCopy();
  const c = (en: string, es: string) => (lang === 'en' ? en : es);
  const saved = localSession.operations;
  const [task, setTask] = useState((saved?.task as keyof typeof taskLabels) ?? 'release');
  const [variant, setVariant] = useState((saved?.variant as string) ?? 'compound');
  const [seed, setSeed] = useState((saved?.seed as number) ?? 17);
  const [files, setFiles] = useState<InputFile[]>((saved?.files as InputFile[]) ?? empty);
  const [nodes, setNodes] = useState<OperationNode[]>((saved?.nodes as OperationNode[]) ?? []);
  const [run, setRun] = useState<OperationRun | null>((saved?.run as OperationRun) ?? null);
  const [uploaded, setUploaded] = useState(Boolean(saved?.uploaded));
  const [online, setOnline] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(Boolean(saved?.unavailable));
  const [history, setHistory] = useState<OperationSummary[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [selected, setSelected] = useState('inventory');
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [resultView, setResultView] = useState('graph');
  const input = useRef<HTMLInputElement>(null);
  const folder = useRef<HTMLInputElement>(null);
  const sourceLine = useRef<HTMLSpanElement>(null);
  const active = activeRun(run) && !unavailable;
  const outcome = operationOutcome(run);
  const summary = fileSummary(files);
  const result = run?.result;
  const displayNodes = run?.nodes ?? nodes;
  const selectedNode = displayNodes.find((n) => n.id === selected) ?? displayNodes[0];
  useEffect(() => {
    if (resultView === 'files' && selectedLine)
      sourceLine.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedLine, selectedFile, resultView]);
  useEffect(() => {
    localSession.operations = { task, variant, seed, files, nodes, run, uploaded, unavailable };
  }, [task, variant, seed, files, nodes, run, uploaded, unavailable]);
  function handleError(e: unknown) {
    if (e instanceof OperationError && [401, 404].includes(e.status)) {
      setUnavailable(true);
      setError(
        c(
          'This hosted run is no longer available. Its retention period or session ended. Cached evidence is kept here; refresh history or run your selected files in a new session.',
          'Esta ejecución ya no está disponible. Terminó su retención o sesión. La evidencia en memoria se conserva; actualizar el historial o ejecutar los archivos en una sesión nueva.',
        ),
      );
    } else setError(String(e));
  }
  async function refreshHistory() {
    if (!localSession.operationToken) {
      setHistory([]);
      return;
    }
    try {
      setHistory((await operationAPI('runs')).runs);
      setHistoryError('');
    } catch (e) {
      if (e instanceof OperationError && e.status === 401) {
        setHistory([]);
        handleError(e);
      } else setHistoryError(String(e));
    }
  }
  useEffect(() => {
    void refreshHistory();
  }, [run?.id, run?.status]);
  useEffect(() => {
    let alive = true;
    void operationAPI('config')
      .then(() => {
        if (alive) setOnline(true);
      })
      .catch(() => {
        if (alive) setOnline(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (run) return;
    let alive = true;
    setBusy(true);
    void operationAPI(`fixture?task=${task}&variant=${variant}&seed=${seed}`)
      .then((value) => {
        if (alive) {
          if (!uploaded) setFiles(value.files);
          setNodes(value.nodes);
          setError('');
          setOnline(true);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(String(e));
          setOnline(false);
        }
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [task, variant, seed, uploaded, run?.id]);
  useEffect(() => {
    if (!active || !run) return;
    let alive = true,
      pending = false;
    const timer = setInterval(() => {
      if (pending) return;
      pending = true;
      void operationAPI(`runs/${run.id}`)
        .then((value) => {
          if (alive) {
            setRun(value);
            setError('');
          }
        })
        .catch((e) => {
          if (alive) handleError(e);
        })
        .finally(() => {
          pending = false;
        });
    }, 400);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [active, run?.id]);
  async function start() {
    setBusy(true);
    setError('');
    try {
      await ensureOperationSession();
      const value = await operationAPI('runs', {
        task,
        variant,
        seed,
        ...(uploaded ? { files } : {}),
      });
      setRun(value);
      setUnavailable(false);
      setResultView('graph');
    } catch (e) {
      handleError(e);
      // A timed-out start may have been admitted. History is the authority;
      // never retry an uncertain POST automatically.
      await refreshHistory();
    } finally {
      setBusy(false);
    }
  }
  async function removeRun() {
    if (!run) return;
    setBusy(true);
    try {
      await operationAPI(`runs/${run.id}`, undefined, 'DELETE');
      setRun(null);
      setUnavailable(false);
      await refreshHistory();
      setError('');
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }
  async function restoreRun(id: string) {
    setBusy(true);
    try {
      const value: OperationRun = await operationAPI(`runs/${id}`);
      setRun(value);
      setTask(value.task as keyof typeof taskLabels);
      setVariant(value.variant === 'uploaded' ? 'compound' : value.variant);
      setSeed(value.seed);
      setFiles(value.inputs);
      setNodes(value.nodes);
      setUploaded(value.variant === 'uploaded');
      setSelectedLine(null);
      setSelectedFile('');
      setUnavailable(false);
      setError('');
    } catch (e) {
      handleError(e);
      await refreshHistory();
    } finally {
      setBusy(false);
    }
  }
  async function upload(chosen: FileList | null) {
    if (!chosen?.length) return;
    setBusy(true);
    try {
      if (
        chosen.length > 256 ||
        Array.from(chosen).some((f) => f.size > 131072) ||
        Array.from(chosen).reduce((s, f) => s + f.size, 0) > 1048576
      )
        throw new Error(
          c(
            'Select at most 256 text files, 128 KiB each and 1 MiB total.',
            'Seleccionar hasta 256 archivos de texto, 128 KiB cada uno y 1 MiB total.',
          ),
        );
      const incoming = await Promise.all(
        Array.from(chosen).map(async (f) => ({
          path: f.webkitRelativePath || f.name,
          content: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
            await f.arrayBuffer(),
          ),
        })),
      );
      // A selected folder is a bundle root, not part of the analyzer-relative path.
      if (Array.from(chosen).every((f) => f.webkitRelativePath))
        incoming.forEach((f) => {
          f.path = f.path.split('/').slice(1).join('/');
        });
      if (incoming.some((f) => f.content.includes('\0')))
        throw new Error(c('Binary files are not supported.', 'No se admiten archivos binarios.'));
      setFiles(incoming);
      setUploaded(true);
      setRun(null);
      setUnavailable(false);
      setSelectedFile(incoming[0]?.path ?? '');
      setResultView('files');
      setError('');
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
      if (folder.current) folder.current.value = '';
    }
  }
  const fileRows = [
    ...files.map((f) => ({ path: `input/${f.path}`, content: f.content, kind: 'input' })),
    ...Object.entries(result?.artifacts ?? {}).map(([key, value]) => ({
      path: `output/${key}.json`,
      content: shown(value),
      kind: 'output',
    })),
  ];
  const normalized = result?.artifacts.normalize?.outputs as
    Record<string, { content: string }> | undefined;
  Object.entries(normalized ?? {}).forEach(([path, value]) =>
    fileRows.push({ path: `accepted/${path}`, content: value.content, kind: 'output' }),
  );
  const currentFile =
    fileRows.find((f) => f.path === selectedFile) ??
    fileRows.find((f) => f.path === `input/${selectedFile}`) ??
    fileRows[0];
  const completed = displayNodes.filter((n) => n.state === 'succeeded').length;
  const progress = displayNodes.length ? Math.round((100 * completed) / displayNodes.length) : 0;
  return (
    <div className="op-layout">
      <aside className="op-sidebar">
        <div className="op-side-heading">
          <Zap size={17} />
          <span>{c('Choose the work', 'Elegir el trabajo')}</span>
        </div>
        <label className="nx-control">
          {c('Task', 'Tarea')}
          <select
            value={task}
            disabled={active || busy}
            onChange={(e) => {
              setTask(e.target.value as typeof task);
              setRun(null);
            }}
          >
            {Object.entries(taskLabels).map(([key, title]) => (
              <option key={key} value={key}>
                {title[lang]}
              </option>
            ))}
          </select>
        </label>
        <div className="op-input-card">
          <Files size={23} />
          <strong>
            {uploaded
              ? c('Your selected files', 'Tus archivos seleccionados')
              : c('Owned release bundle', 'Entrega de evaluación propia')}
          </strong>
          <span>
            {summary.count} {c('files', 'archivos')} · {(summary.bytes / 1024).toFixed(1)} KiB
          </span>
          <p>
            {uploaded
              ? c(
                  'Text files are uploaded only when you run the task. Source is analyzed as data.',
                  'Los archivos se envían solo al ejecutar. El código se analiza como datos.',
                )
              : c(
                  '32 source modules, 16 configurations, 400 records and 18 dependent jobs. Inspect every input.',
                  '32 módulos, 16 configuraciones, 400 registros y 18 tareas dependientes. Inspeccionar cada entrada.',
                )}
          </p>
          <button className="op-text-link" onClick={() => setResultView('files')}>
            {c('Inspect input files', 'Inspeccionar archivos')}
            <ArrowUpRight size={14} />
          </button>
        </div>
        {!uploaded && (
          <>
            <label className="nx-control">
              {c('Incident condition', 'Condición del incidente')}
              <select
                value={variant}
                disabled={active || busy}
                onChange={(e) => {
                  setVariant(e.target.value);
                  setRun(null);
                }}
              >
                {Object.entries(conditionLabels).map(([key, title]) => (
                  <option key={key} value={key}>
                    {title[lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="nx-control">
              {c('Workload seed', 'Semilla de la carga')}
              <input
                type="number"
                min="0"
                max="99999"
                value={seed}
                disabled={active || busy}
                onChange={(e) => {
                  setSeed(Math.floor(Math.max(0, Math.min(99999, Number(e.target.value) || 0))));
                  setRun(null);
                }}
              />
            </label>
          </>
        )}
        <div className="op-upload-actions">
          <button
            className="nx-button"
            disabled={active || busy}
            onClick={() => input.current?.click()}
          >
            <Upload size={15} />
            {c('Select files', 'Elegir archivos')}
          </button>
          <button
            className="nx-button"
            disabled={active || busy}
            onClick={() => folder.current?.click()}
          >
            <FolderOpen size={15} />
            {c('Select folder', 'Elegir carpeta')}
          </button>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(e) => void upload(e.target.files)}
        />
        <input
          ref={folder}
          type="file"
          multiple
          hidden
          {...{ webkitdirectory: '' }}
          onChange={(e) => void upload(e.target.files)}
        />
        {uploaded && (
          <button
            className="op-text-link"
            disabled={active || busy}
            onClick={() => {
              setUploaded(false);
              setRun(null);
            }}
          >
            {c('Use the owned workload', 'Usar la carga propia')}
          </button>
        )}
        <div className="op-contract">
          <ShieldCheck size={18} />
          <div>
            <strong>{c('Original files stay unchanged', 'Archivos originales sin cambios')}</strong>
            <p>
              {c(
                'The controller writes its report, checksums and accepted data into a separate run. Hosted results expire after one hour; you can delete them sooner.',
                'El controlador escribe informes, huellas y datos aceptados en una ejecución separada. Los resultados caducan en una hora y puedes eliminarlos antes.',
              )}
            </p>
          </div>
        </div>
        <details className="op-history">
          <summary>
            {c('Session runs', 'Ejecuciones de la sesión')} ({history.length})
          </summary>
          <button className="op-text-link" disabled={busy} onClick={() => void refreshHistory()}>
            {c('Refresh history', 'Actualizar historial')}
          </button>
          {historyError && <p role="alert">{historyError}</p>}
          {history.length ? (
            history.map((item) => (
              <button
                key={item.id}
                className="op-history-run"
                aria-pressed={run?.id === item.id}
                disabled={busy || (active && run?.id !== item.id)}
                onClick={() => void restoreRun(item.id)}
              >
                <strong>{taskLabels[item.task][lang]}</strong>
                <span>
                  {new Date(item.created_at * 1000).toLocaleTimeString(lang)} ·{' '}
                  {item.id.slice(0, 6)}
                </span>
                <span>
                  {c(`${item.findings} findings`, `${item.findings} hallazgos`)} ·{' '}
                  {statusLabels[item.status]?.[lang] ?? item.status}
                </span>
              </button>
            ))
          ) : (
            <p>
              {c(
                'Runs remain accessible here for one hour within this session.',
                'Las ejecuciones están disponibles aquí durante una hora dentro de esta sesión.',
              )}
            </p>
          )}
        </details>
        <div className={`op-service ${online ? 'online' : ''}`}>
          <i className="op-dot" />
          {online === null
            ? c('Checking execution service', 'Comprobando servicio')
            : online
              ? c('Native execution available', 'Ejecución nativa disponible')
              : c('Execution service unavailable', 'Servicio no disponible')}
        </div>
      </aside>
      <main className="op-main">
        <header className="op-heading">
          <div>
            <span className="nx-kicker">
              {c('Observe → act → verify', 'Observar → actuar → verificar')}
            </span>
            <h1>{taskLabels[task][lang]}</h1>
            <p>
              {c(
                'Find what is broken. Preserve the evidence. Produce a checked delivery.',
                'Encontrar los fallos. Conservar la evidencia. Producir una entrega comprobada.',
              )}
            </p>
          </div>
          <span
            className="op-run-badge"
            data-state={unavailable && run ? 'unavailable' : (run?.status ?? 'ready')}
          >
            {active ? <LoaderCircle size={15} className="op-spin" /> : <ShieldCheck size={15} />}{' '}
            {unavailable && run
              ? c('Hosted run unavailable', 'Ejecución no disponible')
              : run?.status === 'succeeded'
                ? c('Analysis verified', 'Análisis verificado')
                : run?.status === 'cancelled'
                  ? c('Cancelled', 'Cancelado')
                  : run?.status === 'failed'
                    ? c('Execution failed', 'La ejecución falló')
                    : active
                      ? c('Executing tools', 'Ejecutando herramientas')
                      : c('Ready to inspect', 'Listo para inspeccionar')}
          </span>
        </header>
        <div className="op-command-bar">
          <button
            className="nx-button nx-primary op-run"
            onClick={() => void start()}
            disabled={active || busy || !online || !files.length}
          >
            <Zap size={16} />
            {run && !active ? c('Run again', 'Ejecutar de nuevo') : c('Run task', 'Ejecutar tarea')}
            <ArrowRight size={16} />
          </button>
          {active && (
            <button
              className="nx-button"
              onClick={() =>
                void operationAPI(`runs/${run!.id}/cancel`, {}).then(setRun).catch(handleError)
              }
            >
              <Square size={14} />
              {c('Cancel', 'Cancelar')}
            </button>
          )}
          {run && !active && (
            <>
              <button
                className="nx-button"
                onClick={() =>
                  unavailable
                    ? saveCachedOperation(run)
                    : void exportOperation(run).catch(handleError)
                }
              >
                <Download size={15} />
                {unavailable
                  ? c('Save cached evidence', 'Guardar evidencia en memoria')
                  : c('Download results', 'Descargar resultados')}
              </button>
              <button
                className="nx-button"
                onClick={() => void removeRun()}
                disabled={busy || unavailable}
                aria-label={c('Delete this hosted run', 'Eliminar esta ejecución')}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <span className="op-command-note">
            {c(
              'Exact controller · registered tools · verified effects',
              'Controlador exacto · herramientas registradas · efectos verificados',
            )}
          </span>
        </div>
        {error && (
          <div className="nx-error" role="alert">
            {error}
          </div>
        )}
        {run?.error && (
          <div className="nx-error" role="alert">
            {run.error}
          </div>
        )}
        <div className="op-outcome" data-attention={result?.disposition === 'attention_required'}>
          <div>
            <span>
              {result
                ? c('Outcome', 'Resultado')
                : c('Expected deliverables', 'Entregables esperados')}
            </span>
            <strong>
              {result
                ? outcome === 'incomplete'
                  ? c('Verification incomplete', 'Verificación incompleta')
                  : outcome === 'attention'
                    ? c(
                        `${result.findings.length} findings need attention`,
                        `${result.findings.length} hallazgos requieren atención`,
                      )
                    : c('Completed checks passed', 'Comprobaciones superadas')
                : c(
                    'Findings + verified manifest + output evidence',
                    'Hallazgos + manifiesto verificado + evidencia',
                  )}
            </strong>
            <p>
              {result
                ? c(
                    `${result.metrics.verified_nodes} verified actions · ${(result.metrics.wall_ms / 1000).toFixed(2)} s · ${result.metrics.model_calls} model calls`,
                    `${result.metrics.verified_nodes} acciones verificadas · ${(result.metrics.wall_ms / 1000).toFixed(2)} s · ${result.metrics.model_calls} llamadas a modelos`,
                  )
                : c(
                    'Source and configuration errors, broken relationships and changed release bytes become concrete findings.',
                    'Errores de código y configuración, relaciones rotas y cambios de archivos se convierten en hallazgos concretos.',
                  )}
            </p>
          </div>
          <div className="op-progress">
            <b>
              {completed}
              <small>/{displayNodes.length || '…'}</small>
            </b>
            <span>{c('verified steps', 'pasos verificados')}</span>
            <progress
              value={progress}
              max="100"
              aria-label={c('Verified progress', 'Avance verificado')}
            />
          </div>
        </div>
        <div className="op-view-select">
          <label>
            {c('Inspect', 'Inspeccionar')}
            <select value={resultView} onChange={(e) => setResultView(e.target.value)}>
              <option value="graph">{c('Execution map', 'Mapa de ejecución')}</option>
              <option value="findings">
                {c('Findings & consequences', 'Hallazgos y consecuencias')}
              </option>
              <option value="files">{c('Files & outputs', 'Archivos y resultados')}</option>
              <option value="journal">{c('Decision journal', 'Registro de decisiones')}</option>
            </select>
          </label>
          <span>
            {run
              ? `${run.id.slice(0, 10)} · ${run.variant}`
              : c(
                  'Select a node to inspect its work',
                  'Seleccionar un nodo para inspeccionar su trabajo',
                )}
          </span>
        </div>
        {resultView === 'graph' && (
          <div className="op-map-layout">
            <OperationGraph
              nodes={displayNodes}
              selected={selected}
              onSelect={setSelected}
              artifacts={result?.artifacts}
            />
            <aside className="op-inspector">
              <GitBranch size={21} />
              <span className="nx-kicker">{c('Action inspector', 'Inspector de acciones')}</span>
              <h2>{selectedNode?.title[lang]}</h2>
              <p>
                {c('Runs after', 'Se ejecuta después de')}:{' '}
                {selectedNode?.depends_on.join(' → ') ||
                  c('input admission', 'admisión de entradas')}
              </p>
              <code>{selectedNode?.output}</code>
              {selectedNode?.error && <div className="nx-error">{selectedNode.error}</div>}
              {selectedNode && result?.artifacts[selectedNode.id] ? (
                <>
                  <div className="op-inspector-stat">
                    <CheckCheck size={17} />
                    {c('Output produced and checked', 'Resultado producido y comprobado')}
                  </div>
                  <button
                    className="op-text-link"
                    onClick={() => {
                      setSelectedFile(selectedNode.output);
                      setResultView('files');
                    }}
                  >
                    {c('Open output', 'Abrir resultado')}
                    <ArrowUpRight size={14} />
                  </button>
                  <details>
                    <summary>{c('Native receipt', 'Recibo nativo')}</summary>
                    <pre className="nx-code">{JSON.stringify(selectedNode.history, null, 2)}</pre>
                  </details>
                </>
              ) : (
                <p>
                  {c(
                    'This action receives only its declared inputs. Its file output is checked before dependent actions can run.',
                    'Esta acción recibe solo sus entradas declaradas. Su salida se comprueba antes de ejecutar acciones dependientes.',
                  )}
                </p>
              )}
            </aside>
          </div>
        )}
        {resultView === 'findings' && (
          <div className="op-findings">
            {result ? (
              result.findings.length ? (
                result.findings.map((f, i) => (
                  <button
                    key={i}
                    className="op-finding"
                    onClick={() => {
                      setSelectedFile(`input/${f.path}`);
                      setSelectedLine(f.line);
                      setResultView('files');
                    }}
                  >
                    <span className={`op-severity ${f.severity}`}>
                      {f.severity === 'warning' ? c('Warning', 'Advertencia') : c('Error', 'Error')}
                    </span>
                    <div>
                      <strong>
                        {findingLabels[f.code]?.[lang] ?? f.code.replaceAll('_', ' ')}
                      </strong>
                      <code>
                        {f.path}
                        {f.line ? `:${f.line}` : ''}
                      </code>
                      <p>{f.message}</p>
                      {f.expected && (
                        <small>
                          SHA-256: {f.expected.slice(0, 12)} →{' '}
                          {f.actual?.slice(0, 12) ?? c('absent', 'ausente')}
                        </small>
                      )}
                    </div>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              ) : (
                <div className="op-empty">
                  <ShieldCheck size={32} />
                  <h2>
                    {c(
                      'No issues in the completed checks',
                      'Sin problemas en las comprobaciones realizadas',
                    )}
                  </h2>
                  <p>{result.scope}</p>
                </div>
              )
            ) : (
              <div className="op-empty">
                <Search size={32} />
                <h2>
                  {c(
                    'Run the checks to produce findings',
                    'Ejecutar las comprobaciones para obtener hallazgos',
                  )}
                </h2>
                <p>
                  {c(
                    'Findings are computed from file contents; none are inferred from the selected condition.',
                    'Los hallazgos se calculan con los archivos; ninguno se deduce de la condición elegida.',
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        {resultView === 'files' && (
          <div className="op-file-browser">
            <aside>
              <label className="op-search">
                <Search size={14} />
                <input
                  placeholder={c('Filter files', 'Filtrar archivos')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="op-file-list">
                {fileRows
                  .filter((f) => f.path.toLowerCase().includes(query.toLowerCase()))
                  .map((f) => (
                    <button
                      key={f.path}
                      className={f.path === currentFile?.path ? 'selected' : ''}
                      onClick={() => {
                        setSelectedFile(f.path);
                        setSelectedLine(null);
                      }}
                    >
                      <File size={13} />
                      <span>{f.path}</span>
                      <i>{f.kind === 'output' ? '+' : ''}</i>
                    </button>
                  ))}
              </div>
            </aside>
            <div className="op-file-content">
              <div>
                <strong>{currentFile?.path}</strong>
                <span>
                  {currentFile?.kind === 'output'
                    ? c('Produced by this run', 'Producido por esta ejecución')
                    : c('Original input', 'Entrada original')}
                </span>
              </div>
              <pre tabIndex={0}>
                {currentFile
                  ? currentFile.content.split('\n').map((line, i, lines) => (
                      <span
                        key={i}
                        className={
                          i + 1 === selectedLine ? 'op-source-line selected' : 'op-source-line'
                        }
                        data-line={i + 1}
                        ref={i + 1 === selectedLine ? sourceLine : undefined}
                      >
                        {line}
                        {i < lines.length - 1 ? '\n' : ''}
                      </span>
                    ))
                  : c('Select a file', 'Seleccionar un archivo')}
              </pre>
            </div>
          </div>
        )}
        {resultView === 'journal' && (
          <div className="op-journal">
            {run?.events.length ? (
              run.events.map((e, i) => (
                <details key={i}>
                  <summary>
                    <span>{Number(e.elapsed_ms).toFixed(0)} ms</span>
                    <strong>{String(e.kind).replaceAll('_', ' ')}</strong>
                    <code>{String(e.node ?? e.goal_id ?? '')}</code>
                  </summary>
                  <pre className="nx-code">{JSON.stringify(e, null, 2)}</pre>
                </details>
              ))
            ) : (
              <p>
                {c(
                  'The journal appears when real execution begins.',
                  'El registro aparece al comenzar la ejecución real.',
                )}
              </p>
            )}
          </div>
        )}
        <p className="op-scope">
          {c(
            'These tasks use exact, registered policies. Slow-model decisions and learned-controller comparisons are available in Investigations. A completed audit may correctly find an invalid delivery; execution success does not mean the input passed.',
            'Estas tareas usan políticas exactas registradas. Las decisiones de modelos y comparaciones aprendidas están en Investigaciones. Una auditoría completada puede detectar una entrega inválida; ejecutar con éxito no significa que la entrada sea válida.',
          )}
        </p>
      </main>
    </div>
  );
}
