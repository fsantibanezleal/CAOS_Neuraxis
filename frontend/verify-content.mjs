import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
const sections = [], errors = [];
const expectedTabs = { introduction: 6, methodology: 7, implementation: 9, experiments: 8, benchmark: 7 };
try {
  for (const width of [1600, 360]) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(({ theme, lang }) => {
      localStorage.setItem('caos.theme', theme); localStorage.setItem('caos.lang', lang);
    }, { theme, lang });
    for (const [route, count] of Object.entries(expectedTabs)) {
      await page.goto(`${base}/${route}`);
      const root = page.locator(route === 'benchmark' ? '.nx-benchmark' : '.nx-doc');
      const tabs = root.locator('.tablist > .tab');
      await expect(tabs).toHaveCount(count);
      for (let i = 0; i < count; i++) {
        await tabs.nth(i).click();
        await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
        const panel = root.locator('.tabpanel:visible');
        await expect(panel).toBeVisible();
        const title = await tabs.nth(i).innerText();
        const bibliography = /Bibliograph|Bibliograf/.test(title);
        const compound = /Compound|compuestas/.test(title);
        if (bibliography) {
          await expect(panel.locator('.reference-list li').first()).toBeVisible();
          expect(await panel.locator('.reference-list li').count()).toBeGreaterThan(2);
        } else if (compound) {
          await expect(panel.locator('select option')).toHaveCount(36);
          await expect(panel.locator('table tbody tr')).toHaveCount(9);
        } else if (route !== 'benchmark') {
          const article = panel.locator('.nx-doc-section');
          expect(await article.locator(':scope > p.measure').count()).toBeGreaterThanOrEqual(route === 'methodology' ? 4 : 2);
          expect(await article.locator('.katex-display').count()).toBeGreaterThanOrEqual(route === 'methodology' ? 2 : route === 'introduction' ? 0 : 1);
          await expect(article.locator('.science-figure')).toBeVisible();
          expect(await article.locator('.th-refs a').count()).toBeGreaterThan(0);
          expect(await article.locator('p.measure .cite-inline').count()).toBeGreaterThan(0);
        }
        expect(await panel.locator('.katex-error').count()).toBe(0);
        if (route === 'methodology' && !bibliography)
          await expect(panel.locator('.science-measurement table tbody tr').first()).toBeVisible();
        const last = (await panel.locator('a[href]').count() ? panel : root).locator('a[href]').last();
        await last.focus();
        await last.scrollIntoViewIfNeeded();
        await expect(last).toBeInViewport();
        const geometry = await root.evaluate(el => {
          const b = el.getBoundingClientRect();
          return { centered: Math.abs(b.left - (innerWidth - b.width) / 2) < 2,
            capped: b.width <= parseFloat(getComputedStyle(el).getPropertyValue('--maxw')) + 2,
            overflow: document.documentElement.scrollWidth > innerWidth + 1 };
        });
        if (!geometry.centered || !geometry.capped || geometry.overflow) errors.push({ route, title, width, theme, lang, ...geometry });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
        await page.screenshot({ path: `qa/content-${route}-${i}-${width}-${theme}-${lang}.png`, fullPage: true });
        sections.push({ route, title, width, theme, lang, sourcesReachable: true, ...geometry });
      }
      // The shared tab component must preserve keyboard navigation too.
      await tabs.first().focus(); await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
    }
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync('qa/content-report.json', JSON.stringify({ base, sections, errors }, null, 2));
}
console.log(JSON.stringify({ section_checks: sections.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
