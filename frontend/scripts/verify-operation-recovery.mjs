import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [];
for (const width of [1600, 360]) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const owned = new Map();
  let releaseHeldHistory = () => {};
  let token;
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', request => {
    const auth = request.headers().authorization;
    if (auth) token = auth;
  });
  page.on('response', async response => {
    if (response.url().endsWith('/operations-api/runs') && response.request().method() === 'POST' && response.ok()) {
      const run = await response.json();
      owned.set(run.id, response.request().headers().authorization);
    }
  });
  await page.addInitScript(({ theme, lang }) => {
    localStorage.setItem('caos.theme', theme); localStorage.setItem('caos.lang', lang);
  }, { theme, lang });
  async function startRun() {
    for (let retry = 0; retry < 8; retry++) {
      const response = page.waitForResponse(r => r.url().endsWith('/operations-api/runs') && r.request().method() === 'POST');
      await page.locator('.op-run').click();
      const started = await response;
      if (started.status() === 429) {
        await page.waitForTimeout(10000);
        continue;
      }
      expect(started.status()).toBe(200);
      const run = await started.json();
      await expect(page.locator('.op-view-select > span')).toContainText(run.id.slice(0, 10));
      await expect(page.locator('.op-run-badge[data-state=succeeded]')).toBeVisible({ timeout: 60000 });
      return;
    }
    throw new Error('Execution capacity remained unavailable');
  }
  try {
    await page.goto(`${base}/app`);
    await expect(page.locator('.op-run')).toBeEnabled({ timeout: 20000 });
    await startRun();
    await page.locator('input[type=file]').first().setInputFiles([
      { name: 'records.csv', mimeType: 'text/csv', buffer: Buffer.from('id,name\n1,"A\nB"\n2,C,extra\n\n3,\n4,D\n') },
      { name: 'config.json', mimeType: 'application/json', buffer: Buffer.from('{"x":1e999}') },
    ]);
    await expect(page.locator('.op-run')).toBeEnabled();
    await startRun();
    await expect(page.locator('.op-outcome strong')).toContainText('3');
    await page.locator('.op-view-select select').selectOption('findings');
    await page.locator('.op-finding').filter({ hasText: 'records.csv:6' }).click();
    await expect(page.locator('.op-source-line.selected')).toHaveAttribute('data-line', '6');
    await expect(page.locator('.op-source-line.selected')).toContainText('3,');
    await page.getByRole('button', { name: 'accepted/records.csv' }).click();
    await expect(page.locator('.op-file-content pre')).toHaveText('id,name\n1,"A\nB"\n4,D\n');
    await page.locator('.op-history summary').click();
    await expect(page.locator('.op-history-run')).toHaveCount(2);
    await page.locator('.op-history-run').last().click();
    await expect(page.locator('.op-outcome strong')).toContainText('10');
    await page.locator('.op-view-select select').selectOption('files');
    await expect(page.getByRole('button', { name: 'input/release-manifest.json', exact: true })).toBeVisible();
    await page.locator('.op-history-run').first().click();
    await expect(page.locator('.op-outcome strong')).toContainText('3');
    await expect(page.getByRole('button', { name: 'input/config.json', exact: true })).toBeVisible();
    await page.locator('.op-sidebar select').first().selectOption('source');
    await page.locator('.op-view-select select').selectOption('graph');
    await expect(page.locator('.op-node')).toHaveCount(7);
    let heldHistoryDelivered;
    if (width === 1600 && theme === 'light' && lang === 'en') {
      let historyStarted, resolveHeldHistory;
      const started = new Promise(resolve => { historyStarted = resolve; });
      heldHistoryDelivered = new Promise(resolve => { resolveHeldHistory = resolve; });
      const released = new Promise(resolve => { releaseHeldHistory = resolve; });
      let held = false;
      await page.route('**/operations-api/runs', async route => {
        if (route.request().method() !== 'GET' || held) return route.fallback();
        held = true;
        const response = await route.fetch();
        historyStarted();
        await released;
        await route.fulfill({ response });
        resolveHeldHistory();
      });
      await page.locator('.op-history-run').first().click();
      await started;
    } else {
      await page.locator('.op-history-run').first().click();
    }
    await expect(page.locator('.op-outcome strong')).toContainText('3');
    let expired = true, expireAll = false;
    await page.route('**/operations-api/runs**', route => expired && (expireAll || route.request().url().endsWith('/export'))
      ? route.fulfill({ status: 401, contentType: 'application/json', body: '{"detail":"Operation session expired"}' })
      : route.continue());
    await page.getByRole('button', { name: lang === 'en' ? 'Download results' : 'Descargar resultados' }).click();
    await expect(page.locator('.op-run-badge[data-state=unavailable]')).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: lang === 'en' ? 'Save cached evidence' : 'Guardar evidencia en memoria' }).click();
    await (await download).saveAs(`qa/cached-evidence-${width}-${theme}-${lang}.json`);
    expireAll = true;
    await page.getByRole('button', { name: lang === 'en' ? 'Refresh history' : 'Actualizar historial' }).click();
    await expect(page.locator('.op-history-run')).toHaveCount(0);
    const oldResponse = heldHistoryDelivered
      ? page.waitForResponse(r => r.url().endsWith('/operations-api/runs') && r.request().method() === 'GET' && r.status() === 200)
      : null;
    releaseHeldHistory();
    if (heldHistoryDelivered) {
      await heldHistoryDelivered;
      await (await oldResponse).finished();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await expect(page.locator('.op-history-run')).toHaveCount(0);
    }
    expired = false;
    await startRun();
    await expect(page.locator('.op-outcome strong')).toContainText('3');
    await expect(page.locator('.op-history-run')).toHaveCount(1);
    await page.locator('.op-view-select select').selectOption('findings');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.screenshot({ path: `qa/operation-recovery-${width}-${theme}-${lang}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.locator('.op-scope').scrollIntoViewIfNeeded();
    await expect(page.locator('.op-scope')).toBeInViewport();
    checks.push({ width, theme, lang, history: true, distinctInputs: true, physicalLines: true, uploadedGraph: true,
      simulatedExpiry: true, delayedHistoryIgnored: Boolean(heldHistoryDelivered),
      cachedExport: true, freshExecution: true, verticalAccess: true });
    console.log(JSON.stringify(checks.at(-1)));
  } finally {
    releaseHeldHistory();
    for (const [id, authorization] of owned) {
      const response = await page.request.delete(`${base}/operations-api/runs/${id}`, {
        headers: { Authorization: authorization, 'X-Neuraxis-Client': 'operations-v1' },
      });
      expect([200, 404]).toContain(response.status());
    }
    await page.close();
  }
}
await browser.close();
writeFileSync('qa/operation-recovery-report.json', JSON.stringify({ base, checks, errors }, null, 2));
if (errors.length) throw new Error(JSON.stringify(errors));
