import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ensureOperationSession,
  operationAPI,
  operationOutcome,
  type OperationRun,
} from './operations';
import { localSession } from './session';

afterEach(() => {
  vi.unstubAllGlobals();
  localSession.operationToken = undefined;
});
describe('operation evidence and recovery', () => {
  it.each(['failed', 'cancelled', 'running'])('never certifies %s execution', (status) => {
    const run = {
      status,
      result: { disposition: 'checks_passed', findings: [] },
    } as unknown as OperationRun;
    expect(operationOutcome(run)).toBe('incomplete');
  });
  it('does not hide warning findings behind a passed disposition', () => {
    const run = {
      status: 'succeeded',
      result: { disposition: 'checks_passed', findings: [{}] },
    } as unknown as OperationRun;
    expect(operationOutcome(run)).toBe('attention');
  });
  it('refreshes expired authority before an explicit new execution', async () => {
    localSession.operationToken = 'expired';
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'expired' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'fresh' })));
    vi.stubGlobal('fetch', fetch);
    await ensureOperationSession();
    expect(localSession.operationToken).toBe('fresh');
    expect(fetch.mock.calls.map((c) => c[0])).toEqual([
      '/operations-api/runs',
      '/operations-api/session',
    ]);
  });
  it('never retries an uncertain execution POST', async () => {
    const fetch = vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', fetch);
    await expect(operationAPI('runs', {})).rejects.toThrow('Timed out');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
