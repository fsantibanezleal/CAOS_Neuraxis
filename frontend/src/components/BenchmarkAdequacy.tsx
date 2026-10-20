import { ReadinessNote } from '../readiness/ReadinessNote';
import { VIEW_ROWS } from '../readiness/readiness';
import { useEffect, useState } from 'react';
import { Callout } from '@fasl-work/caos-app-shell';
import { Download } from 'lucide-react';
import { downloadJSON } from '../api/artifacts';
import { useCopy } from '../i18n';
import type { BenchmarkAdequacy } from '../lib/contract.types';
import { Panel } from './Instruments';

// The audit document is the generated type (docs/contracts/schemas/benchmark-adequacy.schema.json).
type AdequacyAudit = BenchmarkAdequacy;

export default function BenchmarkAdequacy() {
  const { lang } = useCopy();
  const en = lang === 'en';
  const [report, setReport] = useState<AdequacyAudit | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/benchmark-adequacy.json`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
          throw new Error(`HTTP ${response.status}`);
        const value = (await response.json()) as AdequacyAudit;
        if (
          value.schema_version !== 1 ||
          value.episodes_checked !== 14400 ||
          value.methods.length !== 12 ||
          !/^[a-f0-9]{64}$/.test(value.index_sha256)
        )
          throw new Error('Invalid adequacy audit');
        setReport(value);
      })
      .catch((reason) => {
        if (!abort.signal.aborted) setError(String(reason));
      });
    return () => abort.abort();
  }, []);
  if (!report)
    return <p role="status">{error || (en ? 'Loading audit...' : 'Cargando auditoría...')}</p>;
  return (
    <div className="nx-research-results">
      <ReadinessNote ids={VIEW_ROWS['benchmark-adequacy']} />
      <Callout
        variant="honest"
        title={en ? 'What this matrix can establish' : 'Qué puede establecer esta matriz'}
      >
        {en
          ? 'The frozen core matrix measures execution and failure handling, but it cannot show a success gain from learned allocation: seven methods, including the guarded state machine, solve every core episode. This is a benchmark limitation, not evidence that learned allocation is impossible.'
          : 'La matriz principal congelada mide ejecución y manejo de fallos, pero no puede mostrar una mejora de éxito por asignación aprendida: siete métodos, incluida la máquina de estados, resuelven todos los episodios principales. Es un límite del benchmark, no evidencia de que aprender la asignación sea imposible.'}
      </Callout>
      <div className="nx-metrics">
        <div className="nx-metric">
          <span>{en ? 'Hash-checked episodes' : 'Episodios verificados por hash'}</span>
          <b>{report.episodes_checked.toLocaleString(lang)}</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Perfect methods' : 'Métodos sin fallos'}</span>
          <b>{report.perfect_methods.length}/12</b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'Seed-varying cells' : 'Celdas que varían por semilla'}</span>
          <b>
            {report.seed_variable_cells}/{report.case_variant_method_cells}
          </b>
        </div>
        <div className="nx-metric">
          <span>{en ? 'M12 C07 failures' : 'Fallos M12 en C07'}</span>
          <b>{report.m12_failures.reduce((sum, row) => sum + row.failures, 0)}</b>
        </div>
      </div>
      <Panel title={en ? 'Success and seed sensitivity' : 'Éxito y sensibilidad a semillas'}>
        <p>
          {en
            ? 'A cell is one method, case and variant across ten seeds. A changing input is not the same as a changing success outcome. These repetitions cannot be treated as independent evidence of generalization.'
            : 'Una celda es un método, caso y variante con diez semillas. Cambiar la entrada no equivale a cambiar el resultado. Las repeticiones no son evidencia independiente de generalización.'}
        </p>
        <div className="nx-table-scroll">
          <table className="nx-table">
            <thead>
              <tr>
                <th>{en ? 'Method' : 'Método'}</th>
                <th>{en ? 'Verified successes' : 'Éxitos verificados'}</th>
                <th>{en ? 'Seed-varying cells / 120' : 'Celdas variables / 120'}</th>
              </tr>
            </thead>
            <tbody>
              {report.methods.map((row) => (
                <tr key={row.method_id}>
                  <th>{row.method_id}</th>
                  <td>
                    {row.successes}/{row.episodes}
                  </td>
                  <td>{row.seed_variable_case_variant_cells}/120</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel
        title={
          en
            ? 'Failure localization and research boundary'
            : 'Localización de fallos y límite de investigación'
        }
      >
        <p>
          {en
            ? 'All 40 frozen M12 core failures occur in C07 long-job cancellation: ten each in delayed observation, duplicate event, stale conflict and unavailable dependency. The implementation now clears those preconditions before cancellation, but that repair is post hoc and does not rewrite the frozen result.'
            : 'Los 40 fallos principales congelados de M12 ocurren en C07, cancelación de trabajos largos: diez en cada condición de observación demorada, evento duplicado, conflicto obsoleto y dependencia no disponible. La implementación ahora resuelve esas condiciones antes de cancelar, pero esa reparación es posterior y no altera el resultado congelado.'}
        </p>
        <p>
          {en
            ? 'The fitted gate had seven positive cases among 228 fit states and selected threshold 1.01, so it never deferred. Four fixed-gate ablations matched full M12 success. A separate semantic transfer lane exercises unseen candidate meanings and real file effects; its outcomes remain separate from this historical matrix.'
            : 'El umbral ajustado tuvo siete casos positivos entre 228 estados de ajuste y seleccionó 1,01, por lo que nunca delegó. Cuatro ablaciones con umbral fijo igualaron el éxito de M12. Una línea de transferencia semántica separada prueba significados nuevos de acciones y efectos reales en archivos; sus resultados se mantienen separados de esta matriz histórica.'}
        </p>
        <button
          className="nx-button"
          onClick={() => downloadJSON(report, 'neuraxis-benchmark-adequacy.json')}
        >
          <Download size={14} /> {en ? 'Download audited counts' : 'Descargar conteos auditados'}
        </button>
        <p className="nx-caption">
          index.json SHA-256: <code>{report.index_sha256}</code>
        </p>
      </Panel>
    </div>
  );
}
