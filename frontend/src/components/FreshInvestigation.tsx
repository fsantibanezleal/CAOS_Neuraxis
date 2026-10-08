import { useEffect, useState } from 'react';
import { api, downloadJSON, normalizeEpisode } from '../api/artifacts';
import { localSession } from '../lib/session';
import { useCopy } from '../i18n';
import type { Episode } from '../lib/types';

/** Fresh runs never replace, append to, or relabel the frozen comparison. */
export default function FreshInvestigation({
  suite,
  caseId,
  variant,
  seed,
  method,
}: {
  suite: string;
  caseId: string;
  variant: string;
  seed: number;
  method: string;
}) {
  const { lang } = useCopy();
  const c = (en: string, es: string) => (lang === 'en' ? en : es);
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const [run, setRun] = useState<{ run_id: string; status: string; label: string } | null>(
    localSession.investigation ?? null,
  );
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!run || !local) return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const state = await api(
          `events?run_id=${encodeURIComponent(run.run_id)}`,
          localSession.token,
        );
        if (abort.signal.aborted) return;
        const next = { ...run, status: state.status };
        localSession.investigation = next;
        setRun(next);
        if (state.episode) setEpisode(normalizeEpisode(state.episode));
        if (state.error) setError(state.error);
        if (['queued', 'running', 'cancelling'].includes(state.status))
          timer = setTimeout(poll, 500);
      } catch (reason) {
        if (!abort.signal.aborted) setError(String(reason));
      }
    };
    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [run?.run_id, local]);
  const active = busy || (!!run && ['queued', 'running', 'cancelling'].includes(run.status));
  async function launch() {
    setBusy(true);
    setError('');
    setEpisode(null);
    try {
      const result = await api('run', localSession.token, {
        suite,
        case_id: caseId,
        variant,
        seed,
        method_id: method,
      });
      const next = { ...result, label: `${suite} · ${caseId} · ${variant} · ${seed} · ${method}` };
      localSession.investigation = next;
      setRun(next);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="invest-planner"
      aria-label={c('Fresh local investigation', 'Investigación local nueva')}
    >
      <h2>{c('Execute this selection locally', 'Ejecutar esta selección localmente')}</h2>
      <p>
        {c(
          'A fresh native run uses the selected controller and writes disposable files. It is separate from the published comparison. M09–M12 require an explicitly configured planner; trained policies require verified checkpoints.',
          'Una ejecución nativa nueva usa el controlador seleccionado y escribe archivos desechables. Se mantiene separada de la comparación publicada. M09–M12 requieren un planificador configurado; las políticas entrenadas requieren modelos verificados.',
        )}
      </p>
      {local ? (
        <button
          className="nx-button"
          disabled={active || !localSession.token}
          onClick={() => void launch()}
        >
          {c('Run selected controller', 'Ejecutar controlador seleccionado')}
        </button>
      ) : (
        <p>
          {c(
            'Start scripts/serve.py on your computer to enable authenticated execution. The public site provides immutable replay.',
            'Iniciar scripts/serve.py en su equipo para habilitar ejecución autenticada. El sitio público ofrece reproducción inmutable.',
          )}
        </p>
      )}
      {local && !localSession.token && (
        <p role="status">
          {c(
            'Open the session URL provided by scripts/serve.py.',
            'Abrir la URL de sesión proporcionada por scripts/serve.py.',
          )}
        </p>
      )}
      {run && (
        <p role="status">
          {run.label} · {run.status}
        </p>
      )}
      {active && run && (
        <button
          className="nx-button"
          onClick={() =>
            void api(`cancel/${run.run_id}`, localSession.token, {}).catch((reason) =>
              setError(String(reason)),
            )
          }
        >
          {c('Cancel fresh run', 'Cancelar ejecución nueva')}
        </button>
      )}
      {error && (
        <p className="nx-error" role="alert">
          {error}
        </p>
      )}
      {episode && (
        <>
          <p>
            {c('Independent goal check', 'Comprobación independiente del objetivo')}:{' '}
            {episode.metrics.task_success === 1 ? c('passed', 'correcta') : c('failed', 'fallida')}{' '}
            · {String(episode.metrics.native_receipts ?? 0)}{' '}
            {c('native receipts', 'recibos nativos')}
          </p>
          <button
            className="nx-button"
            onClick={() => downloadJSON(episode, `fresh-${episode.run_id}.json`)}
          >
            {c('Export fresh evidence', 'Exportar evidencia nueva')}
          </button>
          <details>
            <summary>
              {c('Actual decisions and file effects', 'Decisiones y efectos reales sobre archivos')}
            </summary>
            <pre className="nx-code">{JSON.stringify(episode.decisions, null, 2)}</pre>
          </details>
        </>
      )}
    </section>
  );
}
