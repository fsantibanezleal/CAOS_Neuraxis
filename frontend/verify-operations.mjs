import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [];
for (const width of [1600, 360]) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', e => errors.push({ width, theme, lang, error: e.message }));
  await page.addInitScript(({ theme, lang }) => { localStorage.setItem('caos.theme', theme); localStorage.setItem('caos.lang', lang); }, { theme, lang });
  await page.goto(base);
  await expect(page.locator('.op-run')).toBeEnabled({ timeout: 15000 });
  await expect(page.locator('.op-node')).toHaveCount(9);
  await page.getByRole('button', { name: lang === 'en' ? 'Inspect input files' : 'Inspeccionar archivos' }).click();
  const sourceRows = await page.locator('.op-source-line').evaluateAll(rows =>
    rows.slice(0, 3).map(row => row.getBoundingClientRect().top));
  expect(sourceRows[1]).toBeGreaterThan(sourceRows[0]);
  expect(sourceRows[2]).toBeGreaterThan(sourceRows[1]);
  await page.locator('.op-view-select select').selectOption('graph');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: `qa/operations-${width}-${theme}-${lang}-before.png`, fullPage: true });
  await page.locator('.op-run').click();
  await expect(page.locator('.op-run-badge[data-state="succeeded"]')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('.op-outcome strong')).toContainText('10');
  await expect(page.locator('.op-view-select select')).toHaveValue('findings');
  await expect(page.locator('.op-finding')).toHaveCount(10);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: `qa/operations-${width}-${theme}-${lang}-findings.png`, fullPage: true });
  await page.locator('.op-view-select select').selectOption('graph');
  await expect(page.locator('.op-node[data-state="succeeded"]')).toHaveCount(9);
  await page.locator('.op-node').last().click();
  await expect(page.locator('.op-inspector code').first()).toHaveText('output/verify.json');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: `qa/operations-${width}-${theme}-${lang}-result.png`, fullPage: true });
  await page.locator('.op-view-select select').selectOption('findings');
  await expect(page.locator('.op-finding')).toHaveCount(10);
  await page.locator('.op-finding').nth(2).click();
  await expect(page.locator('.op-file-content strong')).toHaveText('input/data/orders.csv');
  await expect(page.locator('.op-source-line.selected')).toHaveAttribute('data-line', '322');
  const sourceInPane = await page.locator('.op-source-line.selected').evaluate(row => {
    const line = row.getBoundingClientRect();
    const pane = row.closest('pre').getBoundingClientRect();
    return { visible: line.top >= pane.top - 1 && line.bottom <= pane.bottom + 1, lineTop: line.top, lineBottom: line.bottom, paneTop: pane.top, paneBottom: pane.bottom, scrollTop: row.closest('pre').scrollTop };
  });
  expect(sourceInPane.visible, JSON.stringify(sourceInPane)).toBe(true);
  await expect(page.locator('.op-file-content pre')).not.toBeEmpty();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: lang === 'en' ? 'Download results' : 'Descargar resultados' }).click();
  const file = await download;
  await file.saveAs(`qa/operation-export-${width}-${theme}-${lang}.zip`);
  expect(await file.failure()).toBeNull();
  await page.getByRole('button', { name: lang === 'en' ? 'Delete this hosted run' : 'Eliminar esta ejecución' }).click();
  await expect(page.locator('.op-run-badge[data-state="ready"]')).toBeVisible();
  await page.locator('input[type=file]').first().setInputFiles([
    { name: 'supplied.json', mimeType: 'application/json', buffer: Buffer.from('{broken') },
    { name: 'records.csv', mimeType: 'text/csv', buffer: Buffer.from('id,name\n1,A\n1,B\n2,\n') },
  ]);
  await expect(page.locator('.op-file-content pre')).toHaveText('{broken');
  await page.locator('.op-run').click();
  await expect(page.locator('.op-run-badge[data-state="succeeded"]')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('.op-outcome strong')).toContainText('3');
  await page.locator('.op-view-select select').selectOption('files');
  await page.getByRole('button', { name: 'accepted/records.csv' }).click();
  expect(await page.locator('.op-source-line').allTextContents()).toEqual(['id,name', '1,A', '']);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) errors.push({ width, theme, lang, horizontalOverflow: true });
  await page.locator('.op-scope').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.op-scope').last()).toBeInViewport();
  await page.getByRole('button', { name: lang === 'en' ? 'Delete this hosted run' : 'Eliminar esta ejecución' }).click();
  checks.push({ width, theme, lang, evidenceFirst: true, verticalSourceLines: true, ownedFindings: 10, userFindings: 3, normalizedData: true, export: true, delete: true, overflow });
  console.log(JSON.stringify(checks.at(-1)));
  await page.close();
}
await browser.close();
writeFileSync('qa/operations-report.json', JSON.stringify({ base, checks, errors }, null, 2));
if (errors.length) throw new Error(JSON.stringify(errors));
