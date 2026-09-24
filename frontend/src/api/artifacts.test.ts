import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it('shares the frozen index across tabs and concurrent consumers', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response('{"aggregate_results":[]}', { headers: { 'content-type': 'application/json' } }),
    );
  vi.stubGlobal('fetch', fetch);
  const { loadIndex } = await import('./artifacts');
  const [first, second] = await Promise.all([loadIndex(), loadIndex()]);
  expect(first).toBe(second);
  expect(await loadIndex()).toBe(first);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('permits a fresh request after evidence loading fails', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
    .mockResolvedValueOnce(new Response('{}', { headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetch);
  const { loadIndex } = await import('./artifacts');
  await expect(loadIndex()).rejects.toThrow('HTTP 503');
  expect(await loadIndex()).toEqual({});
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('refreshes the cached index when explicitly requested', async () => {
  const fetch = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(new Response('{}', { headers: { 'content-type': 'application/json' } })),
    );
  vi.stubGlobal('fetch', fetch);
  const { loadIndex } = await import('./artifacts');
  await loadIndex();
  await loadIndex(true);
  expect(fetch).toHaveBeenCalledTimes(2);
});
