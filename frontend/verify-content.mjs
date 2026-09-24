import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4176';
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
const sections = [], errors = [];
for (const viewport of [{ width: 1280, height: 800 }, { width: 360, height: 800 }]) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', e => errors.push(e.message));
  for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
    await page.goto(base);
    await page.evaluate(({ theme, lang }) => {
      localStorage.setItem('caos.theme', theme);
      localStorage.setItem('caos.lang', lang);
    }, { theme, lang });
    for (const route of ['introduction', 'methodology', 'implementation', 'experiments']) {
      await page.goto(`${base}/${route}`);
      await page.locator('.nx-doc-section:visible').waitFor();
      const tabs = page.locator('.nx-doc .subtab');
      for (let i = 0; i < await tabs.count(); i++) {
        await tabs.nth(i).click();
        const selector = page.locator('.nx-doc-nav-select select:visible');
        const options = await selector.count() ? await selector.locator('option').count() : 1;
        for (let j = 0; j < options; j++) {
          if (await selector.count()) await selector.selectOption({ index: j });
          const article = page.locator('.nx-doc-section:visible');
          const record = await article.evaluate(el => ({
            title: el.querySelector('h2').textContent,
            paragraphs: el.querySelectorAll(':scope>p').length,
            equations: el.querySelectorAll('.katex-display').length,
            svg: el.querySelectorAll('svg').length,
            katexErrors: el.querySelectorAll('.katex-error').length,
          }));
          if (record.paragraphs < 2 || (route !== 'introduction' && record.equations < 1) || !record.svg || record.katexErrors) errors.push(record);
          // Check actual access to the final source, rather than its DOM presence.
          const last = article.locator('a[href]').last();
          await last.focus();
          await expect(last).toBeInViewport();
          const reachable = await last.evaluate(el => {
            const b = Array.from(el.getClientRects()).find(r => r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth);
            if (!b) return false;
            const hit = document.elementFromPoint(Math.max(0, b.left) + Math.min(b.width, innerWidth - b.left) / 2, Math.max(0, b.top) + Math.min(b.height, innerHeight - b.top) / 2);
            return !!hit && (el === hit || el.contains(hit));
          });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          if (!reachable || overflow) errors.push({ route, theme, lang, viewport, title: record.title, reachable, overflow });
          sections.push({ route, theme, lang, viewport, ...record, finalReferenceReachable: reachable });
        }
      }
    }
  }
  await page.close();
}
await browser.close();
writeFileSync('qa/content-report.json', JSON.stringify({ base, sections, errors }, null, 2));
console.log(JSON.stringify({ section_checks: sections.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
