import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash, webcrypto } from 'node:crypto';
import { loadEpisode, loadVerifiedIndex, type EpisodeReference } from '../api/artifacts';

const episode = {
  schema_version: 1,
  run_id: 'verified-run',
  case_id: 'C01',
  method_id: 'M01',
  variant: 'nominal',
  seed: 11,
  decisions: [],
  status: 'succeeded',
};
const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const sha256 = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const reference = (bytes = serialize(episode)): EpisodeReference => ({
  run_id: episode.run_id,
  case_id: episode.case_id,
  method_id: episode.method_id,
  variant: episode.variant,
  seed: episode.seed,
  path: 'episodes/verified-run.json',
  sha256: sha256(bytes),
});
function serve(bytes: string) {
  vi.stubGlobal('crypto', webcrypto);
  const fetcher = vi.fn(
    async () => new Response(bytes, { headers: { 'Content-Type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
afterEach(() => vi.unstubAllGlobals());

describe('canonical artifact integrity', () => {
  it('hash-checks a separate index before accepting its episode references', async () => {
    const index = serialize({ schema_version: 1, episodes: [reference()] });
    serve(index);
    expect(await loadVerifiedIndex('semantic-transfer/index.json', sha256(index))).toMatchObject({
      episodes: [reference()],
    });
    serve(index.replace('verified-run', 'tampered-run'));
    await expect(loadVerifiedIndex('semantic-transfer/index.json', sha256(index))).rejects.toThrow(
      'SHA-256 mismatch',
    );
  });
  it('verifies the exact serialized bytes, including whitespace, before normalization', async () => {
    serve(serialize(episode));
    expect(await loadEpisode(reference())).toMatchObject(episode);
    serve(JSON.stringify(episode));
    await expect(loadEpisode(reference())).rejects.toThrow('SHA-256 mismatch');
  });

  it('adversarial: rejects changed content and an unparseable response before attempting JSON parsing', async () => {
    serve(serialize({ ...episode, status: 'failed' }));
    await expect(loadEpisode(reference())).rejects.toThrow('SHA-256 mismatch');
    serve('{');
    await expect(loadEpisode(reference())).rejects.toThrow('SHA-256 mismatch');
  });

  it.each(['run_id', 'case_id', 'method_id', 'variant', 'seed'] as const)(
    'rejects correctly hashed evidence bound to the wrong %s',
    async (key) => {
      const bytes = serialize({ ...episode, [key]: key === 'seed' ? 42 : 'other' });
      serve(bytes);
      await expect(loadEpisode(reference(bytes))).rejects.toThrow(`identity mismatch: ${key}`);
    },
  );

  it('fails closed when the manifest digest or browser verification capability is unavailable', async () => {
    const fetcher = serve(serialize(episode));
    await expect(loadEpisode({ ...reference(), sha256: undefined })).rejects.toThrow(
      'requires a SHA-256 digest',
    );
    expect(fetcher).not.toHaveBeenCalled();
    vi.stubGlobal('crypto', undefined);
    await expect(loadEpisode(reference())).rejects.toThrow('secure browser context');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
