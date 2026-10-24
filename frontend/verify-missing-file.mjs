import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const browser = await chromium.launch();
const checks = [];
try {
  for (const width of [1600, 360]) for (const lang of ['en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    let owned;
    page.on('response', async r => {
      if (r.url().endsWith('/operations-api/runs') && r.request().method() === 'POST' && r.ok())
        owned = { id: (await r.json()).id, authorization: r.request().headers().authorization };
    });
    await page.addInitScript(lang => localStorage.setItem('caos.lang', lang), lang);
    try {
      await page.goto(base+'/app');
      await expect(page.locator('.op-run')).toBeEnabled();
      await page.locator('input[type=file]').first().setInputFiles({ name: 'release-manifest.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ 'missing.py': 'a'.repeat(64) })) });
      await expect(page.locator('.op-file-content strong')).toHaveText('input/release-manifest.json');
      await page.locator('.op-run').click();
      await expect(page.locator('.op-run-badge[data-state=succeeded]')).toBeVisible({ timeout: 60000 });
      await page.locator('.op-view-select select').selectOption('findings');
      await page.locator('.op-finding').filter({ hasText: 'missing.py' }).click();
      await expect(page.locator('.op-file-content strong')).toHaveText('input/missing.py');
      await expect(page.locator('.op-file-content pre')).toContainText(lang === 'en' ? 'absent from the current inputs' : 'no está entre las entradas');
      await expect(page.locator('.op-file-content pre')).not.toContainText('aaaa');
      await page.locator('.op-file-content').screenshot({ path: `qa/missing-file-${width}-${lang}.png` });
      checks.push({ width, lang, absentPathPreserved: true, unrelatedBytesHidden: true });
    } finally {
      if (owned) expect((await page.request.delete(`${base}/operations-api/runs/${owned.id}`, { headers: { Authorization: owned.authorization, 'X-Neuraxis-Client': 'operations-v1' } })).status()).toBe(200);
      await page.close();
    }
  }
} finally { await browser.close(); }
writeFileSync('qa/missing-file-report.json', JSON.stringify({ base, checks }, null, 2));
console.log(JSON.stringify(checks));
