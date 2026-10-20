// The route table (ADR-0016, shell 0.15.0): the App is the leftmost tab and lives at /app, the five documentation routes keep
// their paths, and the root and every unknown path render the shell's <Landing />, which opens the Introduction and forwards an
// old App link (/?mode=investigations&incident=C07) to /app with its query string and hash. The forward itself is measured in a
// browser by scripts/verify-routes.mjs; here the table, the header order and the version source are checked.
import { APP_ROUTE, LANDING_ROUTE, STANDARD_ROUTES } from '@fasl-work/caos-app-shell';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

const html = (path: string) =>
  renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

const HEADER_ORDER = [
  '/app',
  '/introduction',
  '/methodology',
  '/implementation',
  '/experiments',
  '/benchmark',
];
/** The header check of BR-002, exported so the planted-defect suite runs the gate's own function: every route has a link and the links keep the standard order. */
export function headerOrderProblems(page: string): string[] {
  const hrefs = [...page.matchAll(/<a [^>]*href="(\/[a-z]*)(?:[?#][^"]*)?"/g)].map((m) => m[1]);
  const seen = HEADER_ORDER.map((p) => hrefs.indexOf(p));
  const out = HEADER_ORDER.filter((_, i) => seen[i] < 0).map((p) => `no header link for ${p}`);
  const found = seen.filter((i) => i >= 0);
  if (found.join() !== [...found].sort((a, b) => a - b).join())
    out.push('header links out of order');
  return out;
}

const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

describe('the route table', () => {
  it('the routes are the shell standard ones: the App first and at /app, the landing on the Introduction', () => {
    expect(LANDING_ROUTE).toBe('/introduction');
    expect(APP_ROUTE).toBe('/app');
    expect(STANDARD_ROUTES.map((r) => r.path)).toEqual([
      '/app',
      '/introduction',
      '/methodology',
      '/implementation',
      '/experiments',
      '/benchmark',
    ]);
    expect(source).toMatch(/routes: STANDARD_ROUTES/);
  });

  it('the header lists the six routes in the standard order, the App leftmost', () => {
    expect(headerOrderProblems(html('/introduction'))).toEqual([]);
  });

  it('the root and the catch-all render the shell landing, and /app renders the App', () => {
    expect(source).toMatch(/<Route path="\/" element=\{<Landing \/>\} \/>/);
    expect(source).toMatch(/<Route path="\/app" element=\{<OperationsWorkbench \/>\} \/>/);
    expect(source).toMatch(/<Route path="\*" element=\{<Landing \/>\} \/>/);
    expect(source).not.toMatch(/<Route path="\/" element=\{<OperationsWorkbench/);
    expect(source).not.toMatch(/<Route path="\*" element=\{<OperationsWorkbench/);
  });

  it('every old App link shape stays on one /app route that reads the same query (the App holds the view in ?mode=)', () => {
    const app = html('/app?mode=investigations&suite=core&incident=C07');
    expect(app).toContain('data-surface');
    expect(app).toContain('aria-selected="true"');
  });

  it('adversarial: the root alone and an unknown path do not render the App', () => {
    expect(html('/')).not.toContain('data-surface');
    expect(html('/nowhere')).not.toContain('data-surface');
  });

  it('the version is read from VERSION at build time, never written in the code', () => {
    expect(source).toMatch(/version: __APP_VERSION__/);
    expect(source).not.toMatch(/\b\d+\.\d{2}\.\d{3}\b/);
  });
});
