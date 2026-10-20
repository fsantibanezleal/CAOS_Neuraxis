// Planted-defect tests of the reliability-audit requirements (docs/design/features/reliability-audit/validation.md, ADR-0075).
// The functions the Operations view relies on are called with a stubbed network; the parts of the view that live inside a component
// are checked on the markup it renders on the server or, where only a click reaches them, on the source expression it runs.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OperationError,
  activeRun,
  ensureOperationSession,
  operationAPI,
  operationOutcome,
  type OperationRun,
} from '../lib/operations';
import { localSession } from '../lib/session';
import { read, readJSON, renderIn } from './support';

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

// ---- RA-004: a model of the service that lists only the runs a session owns
type Store = Record<string, string[]>; // token -> run ids
const service = (store: Store, calls: Array<{ url: string; method: string; token: string }>) =>
  vi.fn(async (url: string, init: RequestInit) => {
    const token = String((init.headers as Record<string, string>).Authorization ?? '').replace(
      'Bearer ',
      '',
    );
    calls.push({ url, method: init.method ?? 'GET', token });
    if (!(token in store)) return json({ detail: 'expired' }, 401);
    if (url.endsWith('/runs')) return json({ runs: store[token].map((id) => ({ id })) });
    const id = url.split('/runs/')[1];
    return store[token].includes(id) ? json({ id }) : json({ detail: 'gone' }, 404);
  });
const sourceOf = (name: string) => read(`frontend/src/components/${name}.tsx`);
/** The guards of the history refresh: a late or foreign response never replaces the list. */
const historyGuards = (source: string) => {
  const body = /async function refreshHistory\(\) \{[\s\S]*?\n  \}\n/.exec(source)?.[0] ?? '';
  const out: string[] = [];
  if (!/request !== historyRequest\.current \|\| token !== localSession\.operationToken/.test(body))
    out.push('a response of an older request or another session can replace the list');
  if (!/if \(!token\) \{\s*setHistory\(\[\]\)/.test(body))
    out.push('a missing token does not empty the list');
  return out;
};

// ---- RA-005: when authority expires, the view stops polling and never replays a submission
const pollsOnlyWhileActive = (source: string) =>
  /const active = activeRun\(run\) && !unavailable;/.test(source) &&
  /if \(!active \|\| !run\) return;\s*let alive = true/.test(source) &&
  /if \(e instanceof OperationError && \[401, 404\]\.includes\(e\.status\)\) \{\s*setUnavailable\(true\)/.test(
    source,
  );

// ---- RA-011: the file pane of a finding on an absent file
const currentFileExpression = (source: string) => {
  const m = /const currentFile =\n([\s\S]*?);\n/.exec(source);
  return m ? m[1] : '';
};
const pick = (
  expression: string,
  fileRows: Array<{ path: string; content: string }>,
  selectedFile: string,
) =>
  new Function('fileRows', 'selectedFile', `return ${expression};`)(fileRows, selectedFile) as
    { path: string; content: string } | undefined;

const clean = readJSON('data/operations/data-clean-70000.json') as {
  inputs: unknown[];
  nodes: unknown[];
  events: unknown[];
};
const snapshot = (status: string, disposition: string) => ({
  id: 'recorded0000',
  task: 'data',
  variant: 'clean',
  seed: 70000,
  status,
  inputs: clean.inputs,
  nodes: clean.nodes,
  events: clean.events,
  result: { ...clean, status, disposition, findings: [] },
  error: null,
});
const renderRun = (status: string, disposition: string) =>
  renderIn('en', () => import('../components/Operations'), {
    prepare: async () => {
      const { localSession: session } = await import('../lib/session');
      session.operations = {
        task: 'data',
        variant: 'clean',
        seed: 70000,
        files: clean.inputs,
        nodes: clean.nodes,
        uploaded: false,
        run: snapshot(status, disposition),
      };
    },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  localSession.operationToken = undefined;
  localSession.operations = undefined;
});

describe('reliability-audit planted defects', () => {
  it('adversarial: the history list restores every owned run and only those', async () => {
    const calls: Array<{ url: string; method: string; token: string }> = [];
    const store: Store = { mine: ['r1', 'r2', 'r3'], theirs: ['x9'] };
    vi.stubGlobal('fetch', service(store, calls));
    localSession.operationToken = 'mine';
    expect(((await operationAPI('runs')).runs as Array<{ id: string }>).map((r) => r.id)).toEqual([
      'r1',
      'r2',
      'r3',
    ]);
    // one run deleted: the list no longer carries it, and restoring it is refused as gone (the view reads 404 as unavailable)
    store.mine = store.mine.filter((id) => id !== 'r2');
    expect(((await operationAPI('runs')).runs as Array<{ id: string }>).map((r) => r.id)).toEqual([
      'r1',
      'r3',
    ]);
    await expect(operationAPI('runs/r2')).rejects.toMatchObject({ status: 404 });
    // planted: a run of another session is requested with this session's token, and refused
    await expect(operationAPI('runs/x9')).rejects.toBeInstanceOf(OperationError);
    expect(calls.every((c) => c.token === 'mine')).toBe(true);
    // the view's guards against a late or foreign list
    const source = sourceOf('Operations');
    expect(historyGuards(source)).toEqual([]);
    expect(
      historyGuards(
        source.replace(
          'request !== historyRequest.current || token !== localSession.operationToken',
          'false',
        ),
      ),
    ).toEqual(['a response of an older request or another session can replace the list']);
    expect(
      historyGuards(
        source.replace('if (!token) {\n      setHistory([]);', 'if (!token) {\n      void 0;'),
      ),
    ).toEqual(['a missing token does not empty the list']);
  });

  it('adversarial: expired authority stops polling and never replays a submission', async () => {
    localSession.operationToken = 'expired';
    localSession.operations = { files: [{ path: 'a.csv', content: 'x' }], uploaded: true };
    const calls: Array<{ url: string; method: string; token: string }> = [];
    vi.stubGlobal('fetch', service({}, calls));
    // a poll answered 401: the token is dropped and the error is explicit, the inputs stay, and nothing was sent twice
    await expect(operationAPI('runs/r1')).rejects.toMatchObject({ status: 401 });
    expect(localSession.operationToken).toBeUndefined();
    expect(localSession.operations).toEqual({
      files: [{ path: 'a.csv', content: 'x' }],
      uploaded: true,
    });
    expect(calls).toHaveLength(1);
    // a submission that was refused is not replayed: a fresh run needs the explicit session call
    await expect(operationAPI('runs', { task: 'data' })).rejects.toBeInstanceOf(OperationError);
    expect(calls.filter((c) => c.method === 'POST' && c.url.endsWith('/runs'))).toHaveLength(1);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/session') ? json({ token: 'fresh' }) : json({ runs: [] }),
      ),
    );
    await ensureOperationSession();
    expect(localSession.operationToken).toBe('fresh');
    // the view polls only while a run is active and available, and reads 401 and 404 as unavailable
    const source = sourceOf('Operations');
    expect(pollsOnlyWhileActive(source)).toBe(true);
    expect(
      pollsOnlyWhileActive(
        source.replace(
          'const active = activeRun(run) && !unavailable;',
          'const active = activeRun(run);',
        ),
      ),
    ).toBe(false);
    expect(
      pollsOnlyWhileActive(
        source.replace('[401, 404].includes(e.status)', '[404].includes(e.status)'),
      ),
    ).toBe(false);
    expect(activeRun({ status: 'cancelled' } as OperationRun)).toBe(false);
  });

  it('adversarial: an incomplete or cancelled run is never labelled passed', async () => {
    const run = (status: string, disposition: string, findings: unknown[] = []) =>
      ({ status, result: { disposition, findings } }) as unknown as OperationRun;
    expect(operationOutcome(run('succeeded', 'checks_passed'))).toBe('passed');
    for (const [status, disposition] of [
      ['cancelled', 'checks_passed'],
      ['failed', 'checks_passed'],
      ['running', 'checks_passed'],
      ['succeeded', 'incomplete'],
      ['cancelling', 'checks_passed'],
    ])
      expect(operationOutcome(run(status, disposition)), `${status}/${disposition}`).toBe(
        'incomplete',
      );
    // the rendered view says the same: a cancelled run with all checks green is not "Completed checks passed"
    const passed = await renderRun('succeeded', 'checks_passed');
    expect(passed).toContain('Completed checks passed');
    for (const [status, disposition] of [
      ['cancelled', 'checks_passed'],
      ['succeeded', 'incomplete'],
    ]) {
      const html = await renderRun(status, disposition);
      expect(html, `${status}/${disposition}`).toContain('Verification incomplete');
      expect(html, `${status}/${disposition}`).not.toContain('Completed checks passed');
    }
  });

  it('adversarial: a failed index load is retried and a concurrent load is shared', async () => {
    const ok = () =>
      new Response('{"aggregate_results":[]}', { headers: { 'content-type': 'application/json' } });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockImplementation(async () => ok());
    vi.stubGlobal('fetch', fetch);
    const { loadIndex } = await import('../api/artifacts');
    // two tabs ask while the first request is failing: they share it, and both see the failure
    const [a, b] = await Promise.allSettled([loadIndex(), loadIndex()]);
    expect([a.status, b.status]).toEqual(['rejected', 'rejected']);
    expect(fetch).toHaveBeenCalledTimes(1);
    // the next tab asks again instead of reusing the failure; two concurrent tabs then share one request
    const [c, d] = await Promise.all([loadIndex(), loadIndex()]);
    expect(c).toBe(d);
    expect(fetch).toHaveBeenCalledTimes(2);
    // planted: a failure kept forever would show as a single call; the count above refutes it
    expect(await loadIndex()).toBe(c);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('adversarial: a finding on an absent file shows absence', () => {
    const source = sourceOf('Operations');
    const expression = currentFileExpression(source);
    expect(expression).toContain('selectedFile ? undefined : fileRows[0]');
    const rows = [
      { path: 'input/release-manifest.json', content: '{"missing.py":"aaaa"}' },
      { path: 'output/verify.json', content: '{}' },
    ];
    // clean: the present file is found, the first file shows only when nothing was selected
    expect(pick(expression, rows, 'input/release-manifest.json')?.path).toBe(
      'input/release-manifest.json',
    );
    expect(pick(expression, rows, '')?.path).toBe('input/release-manifest.json');
    // a finding on a file that is not in the bundle selects its path: nothing is returned, so no other bytes can show
    expect(pick(expression, rows, 'input/missing.py')).toBeUndefined();
    // planted: a fallback to the first file would show another file's bytes for the absent path
    const fallback = expression.replace('(selectedFile ? undefined : fileRows[0])', 'fileRows[0]');
    expect(fallback).not.toBe(expression);
    expect(pick(fallback, rows, 'input/missing.py')?.content).toContain('aaaa');
    // the pane keeps the path and says the file is absent, in both languages
    expect(source).toContain('{currentFile?.path ?? selectedFile}');
    expect(source).toContain(
      'This path is absent from the current inputs and outputs. No substitute file is shown.',
    );
    expect(source).toContain(
      'Esta ruta no está entre las entradas ni las salidas actuales. No se muestra un archivo sustituto.',
    );
  });
});
