import { ReadinessNote } from '../readiness/ReadinessNote';
import { VIEW_ROWS } from '../readiness/readiness';
import { useEffect, useMemo, useState } from 'react';
import { Callout } from '@fasl-work/caos-app-shell';
import { Download } from 'lucide-react';
import { downloadJSON, loadEpisode, loadVerifiedIndex } from '../api/artifacts';
import { METHODS } from '../data/registry';
import { useCopy } from '../i18n';
import type { Episode } from '../lib/types';
import { format, Panel } from './Instruments';
import type { SemanticTransferIndex, SemanticTransferReport } from '../lib/contract.types';
import SemanticRouting from './SemanticRouting';

type SemanticReport = SemanticTransferReport;
type SemanticIndex = SemanticTransferIndex;

export default function SemanticTransfer() {
  const { lang } = useCopy();
  const en = lang === 'en';
  const [report, setReport] = useState<SemanticReport | null>(null);
  const [index, setIndex] = useState<SemanticIndex | null>(null);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('M12');
  const [family, setFamily] = useState('D01');
  const [variant, setVariant] = useState('nominal');
  const [seed, setSeed] = useState(82000);
  const [episode, setEpisode] = useState<Episode | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/semantic-transfer/report.json`, {
      signal: abort.signal,
    })
      .then(async (response) => {
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
          throw new Error(`HTTP ${response.status}`);
        const result = (await response.json()) as SemanticReport;
        if (
          result.schema_version !== 1 ||
          result.episodes_checked !== 1536 ||
          result.methods.length !== 12 ||
          !/^[a-f0-9]{64}$/.test(result.index_sha256)
        )
          throw new Error('Incomplete semantic-transfer audit');
        const source = await loadVerifiedIndex(
          'semantic-transfer/index.json',
          result.index_sha256,
          abort.signal,
        );
        if (!Array.isArray(source.episodes) || source.episodes.length !== 1536)
          throw new Error('Incomplete semantic-transfer index');
        setReport(result);
        setIndex(source as SemanticIndex);
      })
      .catch((reason) => {
        if (!abort.signal.aborted) setError(String(reason));
      });
    return () => abort.abort();
  }, []);
  const reference = useMemo(
    () =>
      index?.episodes.find(
        (row) =>
          row.method_id === method &&
          row.case_id === family &&
          row.variant === variant &&
          row.seed === seed,
      ),
    [index, method, family, variant, seed],
  );
  useEffect(() => {
    if (!reference) return;
    let alive = true;
    setEpisode(null);
    setError('');
    void loadEpisode({ ...reference, path: `semantic-transfer/${reference.path}` })
      .then((value) => {
        if (alive) setEpisode(value);
      })
      .catch((reason) => {
        if (alive) setError(String(reason));
      });
    return () => {
      alive = false;
    };
  }, [reference]);
  if (!report || !index)
    return (
      <p role="status">
        {error ||
          (en
            ? 'Loading separate executed study...'
            : 'Cargando estudio ejecutado por separado...')}
      </p>
    );
  return (
    <div className="nx-research-results">
      <ReadinessNote ids={VIEW_ROWS['semantic-transfer']} />
      <Callout
        variant="honest"
        title={
          en
            ? 'Separate semantic transfer evidence'
            : 'Evidencia separada de transferencia semántica'
        }
      >
        {en
          ? 'Eight new compositions × two variants × eight seeds × twelve frozen methods. Each choice acts on real JSON files; independent checks require all three stage outputs. This designed lane is not pooled with the original core, structural transfer or ablations.'
          : 'Ocho composiciones nuevas × dos variantes × ocho semillas × doce métodos congelados. Cada elección opera sobre archivos JSON reales; comprobaciones independientes exigen las tres salidas. Esta línea diseñada no se mezcla con la matriz principal, transferencia estructural ni ablaciones.'}
      </Callout>
      <div className="nx-metrics">
        <div className="nx-metric">
          <span>{en ? 'Hash-checked episodes' : 'Episodios verificados'}</span>
          <b>{report.episodes_checked.toLocaleString(lang)}</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Perfect methods' : 'Métodos sin fallos'}</span>
          <b>{report.perfect_methods.length}/12</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Seed-varying cells' : 'Celdas variables por semilla'}</span>
          <b>{report.seed_variable_cells}/192</b>
        </div>
      </div>
      <Panel title={en ? 'Complete method comparison' : 'Comparación completa de métodos'}>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Method' : 'Método'}</th>
                <th>{en ? 'Verified success' : 'Éxito verificado'}</th>
                <th>{en ? 'Invalid outputs' : 'Salidas inválidas'}</th>
                <th>{en ? 'Planner calls' : 'Llamadas al planificador'}</th>
                <th>{en ? 'Mean wall ms' : 'Tiempo total medio ms'}</th>
              </tr>
            </thead>
            <tbody>
              {report.methods.map((row) => (
                <tr key={row.method_id}>
                  <th>
                    {row.method_id} {METHODS.find((item) => item.id === row.method_id)?.name[lang]}
                  </th>
                  <td>
                    {row.successes}/{row.episodes}
                  </td>
                  <td>{row.invalid_policy_outputs}</td>
                  <td>{row.planner_delegations}</td>
                  <td>{format(row.mean_wall_ms, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          {en
            ? 'M12 paired outcomes against M01, M04 and M09 are retained in the downloadable audit. A success difference does not by itself isolate the value of learned deferral; the fitted gate and planner triggers have distinct mechanisms.'
            : 'El informe descargable conserva resultados emparejados de M12 contra M01, M04 y M09. Una diferencia de éxito no aísla el valor de la delegación aprendida; el umbral ajustado y los disparadores del planificador son mecanismos distintos.'}
        </p>
        <button
          className="nx-button"
          onClick={() => downloadJSON(report, 'neuraxis-semantic-transfer.json')}
        >
          <Download size={14} />{' '}
          {en ? 'Download audited results' : 'Descargar resultados auditados'}
        </button>
      </Panel>
      <Panel title={en ? 'Paired M12 comparison' : 'Comparación emparejada de M12'}>
        <p>
          {en
            ? 'Every pair uses the same family, variant and seed. Wins and losses are verified task outcomes; ties include both success and both failure. This comparison does not isolate learned-gate benefit.'
            : 'Cada par usa la misma familia, variante y semilla. Victorias y derrotas son resultados verificados; los empates incluyen éxito o fallo de ambos. La comparación no aísla el beneficio del umbral aprendido.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Comparator' : 'Comparador'}</th>
                <th>{en ? 'M12 wins' : 'Victorias M12'}</th>
                <th>{en ? 'M12 losses' : 'Derrotas M12'}</th>
                <th>{en ? 'Ties' : 'Empates'}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.m12_paired).map(([name, counts]) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>{counts.m12_wins ?? 0}</td>
                  <td>{counts.m12_losses ?? 0}</td>
                  <td>{counts.ties ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <SemanticRouting indexSha={report.index_sha256} />
      <Panel title={en ? 'Success by composition' : 'Éxito por composición'}>
        <p>
          {en
            ? 'Each cell is 16 paired environments: two variants and eight seeds. Select a cell to inspect a trace below. Color shows only verified task success, never action safety.'
            : 'Cada celda reúne 16 entornos emparejados: dos variantes y ocho semillas. Selecciona una celda para inspeccionar una traza. El color representa solo éxito verificado, nunca seguridad de acciones.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Family' : 'Familia'}</th>
                {report.methods.map((row) => (
                  <th key={row.method_id}>{row.method_id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.by_family.map((row) => (
                <tr key={row.family}>
                  <th>{row.family}</th>
                  {report.methods.map((item) => {
                    const success = row.methods[item.method_id] ?? 0;
                    return (
                      <td key={item.method_id}>
                        <button
                          className="nx-confusion-cell"
                          aria-label={`${row.family} ${item.method_id}: ${success}/${row.episodes_per_method}`}
                          onClick={() => {
                            setFamily(row.family);
                            setMethod(item.method_id);
                          }}
                          style={{
                            background: `color-mix(in srgb, var(--color-accent) ${8 + (72 * success) / row.episodes_per_method}%, var(--color-surface))`,
                          }}
                        >
                          {success}/{row.episodes_per_method}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={en ? 'Inspect an executed choice' : 'Inspeccionar una elección ejecutada'}>
        <div className="nx-inline-controls">
          <label>
            {en ? 'Method' : 'Método'}{' '}
            <select value={method} onChange={(event) => setMethod(event.target.value)}>
              {report.methods.map((row) => (
                <option key={row.method_id}>{row.method_id}</option>
              ))}
            </select>
          </label>
          <label>
            {en ? 'Composition' : 'Composición'}{' '}
            <select value={family} onChange={(event) => setFamily(event.target.value)}>
              {report.by_family.map((row) => (
                <option key={row.family}>{row.family}</option>
              ))}
            </select>
          </label>
          <label>
            {en ? 'Variant' : 'Variante'}{' '}
            <select value={variant} onChange={(event) => setVariant(event.target.value)}>
              <option>nominal</option>
              <option>boundary</option>
            </select>
          </label>
          <label>
            {en ? 'Seed' : 'Semilla'}{' '}
            <select value={seed} onChange={(event) => setSeed(Number(event.target.value))}>
              {Array.from({ length: 8 }, (_, offset) => (
                <option key={offset}>{82000 + offset}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        {!episode ? (
          <p role="status">{en ? 'Loading verified trace...' : 'Cargando traza verificada...'}</p>
        ) : (
          <>
            <p>
              <strong>{en ? 'Task outcome' : 'Resultado'}:</strong> {episode.status} ·{' '}
              {episode.decisions.length} {en ? 'decisions' : 'decisiones'} ·{' '}
              {String(episode.metrics.native_receipts ?? 0)}{' '}
              {en ? 'native receipts' : 'recibos nativos'}
            </p>
            <p>{String((episode.events[0] as { state?: { goal?: string } })?.state?.goal ?? '')}</p>
            <div className="nx-table-scroll">
              <table className="nx-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{en ? 'Selected action' : 'Acción elegida'}</th>
                    <th>{en ? 'Observed effect' : 'Efecto observado'}</th>
                    <th>{en ? 'Status' : 'Estado'}</th>
                  </tr>
                </thead>
                <tbody>
                  {episode.decisions.map((decision) => {
                    const choice = decision.candidates.find(
                      (candidate) => candidate.action === decision.action,
                    ) as { arguments?: { description?: string } } | undefined;
                    return (
                      <tr key={decision.sequence}>
                        <td>{decision.sequence}</td>
                        <td>
                          <code>{decision.action}</code>
                          <br />
                          {choice?.arguments?.description ?? decision.reason}
                        </td>
                        <td>
                          <code>{JSON.stringify(decision.effect_observed ?? null)}</code>
                        </td>
                        <td>{decision.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="nx-caption">
          index.json SHA-256: <code>{report.index_sha256}</code>
        </p>
      </Panel>
    </div>
  );
}
