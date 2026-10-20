// The route table in a real browser (ADR-0016, shell 0.15.0): the root and an unknown path land on the Introduction, the App is
// at /app, and an old App link (the App was the root) keeps its query string and its hash and opens the same view and selection.
// Run against a built site: NEURAXIS_QA_URL=http://127.0.0.1:4188 node scripts/verify-routes.mjs
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const qaRoot = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-routes');
mkdirSync(qaRoot, { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [];
const investigation = 'mode=investigations&suite=semantic_transfer&incident=D01&controller=M12&compare=M09&condition=nominal&seed=40000';
const views = { tasks: /^Tasks$|^Tareas$/, investigations: /^Investigations$|^Investigaciones$/, advanced: /Engine & local workspace|Motor y espacio local/ };
const order = ['/app', '/introduction', '/methodology', '/implementation', '/experiments', '/benchmark'];
try {
  for (const width of [1280, 390]) for (const lang of ['en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    page.on('pageerror', e => errors.push({ width, lang, pageError: e.message }));
    await page.addInitScript(lang => localStorage.setItem('caos.lang', lang), lang);
    // what the App itself makes of a query (it fills the defaults of a view, as it did at the root): the same query opened directly at /app
    const direct = async query => {
      await page.goto(`${base}/app${query}`);
      await expect(page.getByRole('tab', { selected: true }).first()).toBeVisible();
      await page.waitForTimeout(400);
      return new URL(page.url()).search;
    };
    const land = async (from, expectPath, expectSearch, expectHash) => {
      await page.goto(`${base}${from}`);
      await expect.poll(() => new URL(page.url()).pathname).toBe(expectPath);
      await page.waitForTimeout(400);
      const url = new URL(page.url());
      if (url.hash !== expectHash) errors.push({ from, got: url.hash, want: expectHash });
      if (expectPath === '/app' && from.startsWith('/?')) {
        const query = from.slice(1).split('#')[0];
        const same = await direct(query);
        if (url.search !== same) errors.push({ from, got: url.search, want: same, note: 'the forward differs from the same query opened at /app' });
        // every key the old link named is still named (the App may add defaults, never drop a selection)
        for (const key of new URLSearchParams(query).keys()) if (!new URLSearchParams(url.search).has(key)) errors.push({ from, droppedKey: key });
        await page.goto(`${base}${from}`);
        await expect.poll(() => new URL(page.url()).pathname).toBe('/app');
        await page.waitForTimeout(400);
      } else if (url.search !== expectSearch) errors.push({ from, got: url.search, want: expectSearch });
      checks.push({ width, lang, from, path: url.pathname, search: url.search, hash: url.hash });
    };
    await land('/', '/introduction', '', '');
    await land('/nowhere', '/introduction', '', '');
    await land('/app', '/app', '', '');
    // an old App link: the same query string and hash on /app, the same view open
    for (const view of Object.keys(views)) {
      await land(`/?mode=${view}`, '/app', '', '');
      await expect(page.getByRole('tab', { name: views[view] })).toHaveAttribute('aria-selected', 'true');
    }
    await land(`/?${investigation}#anchor`, '/app', '', '#anchor');
    await expect(page.getByRole('tab', { name: views.investigations })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.site-header a[href="/app"]').first()).toHaveAttribute('aria-current', 'page');
    // the header order never changes: the App is leftmost
    const hrefs = await page.locator('.site-header a[href^="/"]').evaluateAll(links => links.map(a => new URL(a.href).pathname));
    const seen = order.map(path => hrefs.indexOf(path));
    if (seen.some(i => i < 0) || seen.join() !== [...seen].sort((a, b) => a - b).join()) errors.push({ width, lang, headerOrder: hrefs });
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync(join(qaRoot, 'routes-report.json'), JSON.stringify({ base, checks, errors }, null, 2));
}
console.log(JSON.stringify({ checks: checks.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
