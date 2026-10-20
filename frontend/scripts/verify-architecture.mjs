import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const qaRoot = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-'+ 'verify-architecture');
mkdirSync(qaRoot,{recursive:true});
const browser = await chromium.launch();
const checks = [], errors = [];
try {
  for (const width of [1600, 360]) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(({ theme, lang }) => { localStorage.setItem('caos.theme', theme); localStorage.setItem('caos.lang', lang); }, { theme, lang });
    await page.goto(`${base}/app`);
    const trigger = page.getByRole('button', { name: /Architecture \/|Arquitectura \// });
    await trigger.click();
    const modal = page.getByRole('dialog');
    const tabs = modal.getByRole('tab');
    await expect(tabs).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await tabs.nth(i).click();
      const drawing = modal.locator('.arch-svg');
      await expect(drawing).toBeVisible();
      await modal.getByRole('button', { name: /Read at full size|Leer a tamaño completo/ }).click();
      const region = modal.getByRole('region');
      await region.focus();
      await expect(region).toBeInViewport();
      if (width === 360) {
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
      }
      await modal.getByRole('button', { name: /Fit diagram|Ajustar diagrama/ }).click();
      await page.screenshot({ path: `${qaRoot}/architecture-${i}-${width}-${theme}-${lang}.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
      checks.push({ width, theme, lang, tab: i, fullSizeKeyboardAccess: true });
    }
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync(join(qaRoot,'architecture-report.json'), JSON.stringify({ base, checks, errors }, null, 2));
}
console.log(JSON.stringify({ checks: checks.length, errors }));
if (errors.length) process.exitCode = 1;
