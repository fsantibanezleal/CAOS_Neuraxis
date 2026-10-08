import { useEffect, useState } from 'react';
import { loadVerifiedIndex, type EpisodeReference } from './artifacts';

/** The report binds the separate index; each loaded trace is verified again. */
export function useSemanticEvidence() {
  const [refs, setRefs] = useState<EpisodeReference[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    void (async () => {
      const response = await fetch(
        `${import.meta.env.BASE_URL}data/semantic-transfer/report.json`,
        { signal: abort.signal },
      );
      if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json'))
        throw new Error(`HTTP ${response.status}`);
      const report = await response.json();
      if (
        report.schema_version !== 1 ||
        report.episodes_checked !== 1536 ||
        report.methods?.length !== 12
      )
        throw new Error('Incomplete semantic evidence');
      const index = await loadVerifiedIndex(
        'semantic-transfer/index.json',
        report.index_sha256,
        abort.signal,
      );
      if (!Array.isArray(index.episodes) || index.episodes.length !== 1536)
        throw new Error('Incomplete semantic index');
      if (!abort.signal.aborted)
        setRefs(
          index.episodes.map((r: EpisodeReference) => ({
            ...r,
            path: `semantic-transfer/${r.path}`,
          })),
        );
    })()
      .catch((reason) => {
        if (!abort.signal.aborted) setError(String(reason));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, []);
  return { refs, error, loading };
}
