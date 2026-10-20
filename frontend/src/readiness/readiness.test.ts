// The consumer and swap test of readiness 1.0.0 (docs/contracts/catalog.md, Missing-data states): the committed
// document and the provider tree's document conform to the schema this side reads, every view's note comes from the
// document (never from a state typed in a view), and each of the six states maps to the behavior the catalog names.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  conform,
  READINESS,
  type ContractState,
  type Readiness,
  type ReadinessEntry,
} from '../lib/contract.types';
import { NoteLine } from './ReadinessNote';
import {
  behavior,
  entryFor,
  loadReadiness,
  resetReadiness,
  SEVERITY,
  viewState,
  VIEW_ROWS,
} from './readiness';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..');
const read = (rel: string): Readiness => JSON.parse(readFileSync(join(repo, rel), 'utf8'));
const committed = read('data/derived/readiness.json');
const fixture = read('docs/contracts/fixtures/data/derived/readiness.json');

const entry = (
  id: string,
  state: ContractState,
  over: Partial<ReadinessEntry> = {},
): ReadinessEntry => ({
  id,
  version: '1.0.0',
  status: 'real',
  provenance: state === 'missing' ? null : 'real',
  state,
  reason: state === 'available' ? null : { en: `${id} is ${state}`, es: `${id} esta ${state}` },
  missing: state === 'partial' ? ['x/y.json'] : [],
  ...over,
});
const doc = (...entries: ReadinessEntry[]): Readiness => ({
  schema: 'neuraxis.readiness/v1',
  product_version: '9.9.9',
  catalog_sha256: '0'.repeat(64),
  contracts: entries,
});
const html = (view: ReturnType<typeof viewState>, lang: 'en' | 'es') =>
  renderToStaticMarkup(createElement(NoteLine, { view, lang }));

describe('the committed documents', () => {
  it.each([
    ['committed', committed],
    ['provider tree', fixture],
  ])('%s conforms to READINESS', (_n, d) => {
    expect(conform(d, { object: READINESS })).toEqual([]);
  });
  it('every view names catalog rows that exist in both documents', () => {
    for (const [view, ids] of Object.entries(VIEW_ROWS)) {
      for (const id of ids) {
        expect(entryFor(committed, id), `${view}: ${id}`).toBeDefined();
        expect(entryFor(fixture, id), `${view}: ${id}`).toBeDefined();
      }
    }
  });
  it.each([
    ['committed', committed],
    ['provider tree', fixture],
  ])('%s gives each view the most severe state of its rows', (_n, d) => {
    for (const [view, ids] of Object.entries(VIEW_ROWS)) {
      const rows = ids.map((id) => entryFor(d, id)!);
      const worst = SEVERITY.find((s) => rows.some((r) => r.state === s)) ?? 'available';
      const got = viewState(d, ids);
      expect(got.state, view).toBe(worst);
      if (got.state !== 'unknown' && got.state !== 'available')
        expect(
          got.rows.every((r) => r.reason !== null),
          view,
        ).toBe(true);
    }
  });
  it('the committed build: four views say provider, the service says missing, the available views say nothing', () => {
    const states = Object.fromEntries(
      Object.entries(VIEW_ROWS).map(([v, ids]) => [v, viewState(committed, ids).state]),
    );
    expect(states).toMatchObject({
      'benchmark-adequacy': 'provider',
      'research-results': 'provider',
      'semantic-routing': 'provider',
      'semantic-transfer': 'provider',
      'operations-service': 'missing',
      'benchmark-matrix': 'available',
      investigations: 'available',
      'recorded-operations': 'available',
    });
    expect(html(viewState(committed, VIEW_ROWS['benchmark-matrix']), 'en')).toBe('');
  });
  it('the note of a provider view carries the reason the document gives, in both languages', () => {
    const row = committed.contracts.find((c) => c.id === 'research-summary')!;
    const view = viewState(committed, ['research-summary']);
    expect(html(view, 'en')).toContain(row.reason!.en);
    expect(html(view, 'es')).toContain(row.reason!.es);
    expect(html(view, 'en')).toContain('data-readiness="provider"');
  });
});

describe('the six states', () => {
  it('adversarial: order: missing, partial, training, provider, stale, available; the most severe wins', () => {
    expect(SEVERITY).toEqual(['missing', 'partial', 'training', 'provider', 'stale', 'available']);
    const d = doc(entry('a', 'stale'), entry('b', 'partial'), entry('c', 'available'));
    expect(viewState(d, ['a', 'b', 'c']).state).toBe('partial');
    expect(viewState(doc(entry('a', 'available')), ['a'])).toEqual({
      state: 'available',
      rows: [],
    });
  });
  it.each<[ContractState, boolean, boolean]>([
    ['available', true, false],
    ['partial', true, true],
    ['stale', true, true],
    ['provider', true, true],
    ['training', true, true],
    ['missing', false, true],
  ])('%s: shows the result %s, with a note %s', (state, showsResult, note) => {
    expect(behavior(state)).toEqual({ showsResult, note });
    const view = viewState(doc(entry('a', state)), ['a']);
    if (note) {
      expect(html(view, 'es')).toContain(`data-readiness="${state}"`);
      expect(html(view, 'es')).toContain(`a esta ${state}`);
      expect(html(view, 'en')).toContain(`a is ${state}`);
    } else expect(html(view, 'es')).toBe('');
  });
  it('a row of the view that is not in the document is ignored; a view with none of its rows is unknown', () => {
    expect(viewState(doc(entry('a', 'stale')), ['a', 'zzz']).state).toBe('stale');
    expect(viewState(doc(entry('a', 'stale')), ['zzz']).state).toBe('unknown');
  });
});

describe('a missing readiness document', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('adversarial: a null document is readiness unknown, in both languages', () => {
    const view = viewState(null, VIEW_ROWS['research-results']);
    expect(view.state).toBe('unknown');
    expect(html(view, 'en')).toMatch(/data-readiness="unknown".*Readiness unknown/);
    expect(html(view, 'es')).toMatch(/data-readiness="unknown".*Disponibilidad desconocida/);
  });
  it('a fetch that fails resolves to null, names the cause on the console, and is asked for once', async () => {
    resetReadiness();
    const fetch = vi.fn(async () => ({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'text/html' }),
      json: async () => ({}),
    }));
    vi.stubGlobal('fetch', fetch);
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(loadReadiness()).resolves.toBeNull();
    await expect(loadReadiness()).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(err.mock.calls.flat().join(' ')).toMatch(/HTTP 404/);
    err.mockRestore();
  });
  it('a document without contracts is treated as unreadable', async () => {
    resetReadiness();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ nope: 1 }),
      })),
    );
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(loadReadiness()).resolves.toBeNull();
    err.mockRestore();
  });
});

describe('no view types a readiness text', () => {
  it('every view takes its note from ReadinessNote and carries none of the document reasons', () => {
    const dir = join(here, '..');
    const views = [
      'components/BenchmarkAdequacy.tsx',
      'components/ResearchResults.tsx',
      'components/SemanticRouting.tsx',
      'components/SemanticTransfer.tsx',
      'components/Operations.tsx',
      'components/Investigations.tsx',
      'components/ScientificEvidence.tsx',
      'pages/Benchmark.tsx',
    ];
    const reasons = committed.contracts.flatMap((c) =>
      c.reason ? [c.reason.en, c.reason.es] : [],
    );
    for (const v of views) {
      const text = readFileSync(join(dir, v), 'utf8');
      expect(text, v).toContain('ReadinessNote');
      for (const reason of reasons) expect(text, v).not.toContain(reason);
    }
  });
});
