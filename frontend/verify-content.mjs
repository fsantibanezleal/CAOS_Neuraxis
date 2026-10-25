import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const qaRoot = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-qa');
mkdirSync(qaRoot, { recursive: true });
const browser = await chromium.launch();
const sections = [], errors = [];
const expectedGroups = {
  introduction: [5, 3],
  methodology: [4, 2],
  implementation: [2, 3, 3],
  experiments: [3, 2, 2],
  benchmark: [5, 2, 0],
};
try {
  for (const width of [1600, 360]) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', e => errors.push({ width, theme, lang, pageError: e.message }));
    await page.addInitScript(({ theme, lang }) => {
      localStorage.setItem('caos.theme', theme); localStorage.setItem('caos.lang', lang);
    }, { theme, lang });
    for (const [route, groups] of Object.entries(expectedGroups)) {
      await page.goto(`${base}/${route}`);
      const root = page.locator(route === 'benchmark' ? '.nx-benchmark' : '[data-doc-page]');
      const tabs = root.locator('.tabs > .tablist > .tab');
      if (route === 'introduction') await expect(root.locator('.tabs > .tabpanel:visible [data-executive-valid="true"]')).toBeVisible();
      await expect(tabs).toHaveCount(groups.length);
      expect(groups.length).toBeLessThanOrEqual(6);
      let leafIndex = 0;
      for (let i = 0; i < groups.length; i++) {
        await tabs.nth(i).click();
        await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
        const panel = root.locator('.tabs > .tabpanel:visible').first();
        await expect(panel).toBeVisible();
        const subtabs = panel.locator('.subtabs > .subtablist > .subtab');
        await expect(subtabs).toHaveCount(groups[i]);
        for (let j = 0; j < Math.max(1, groups[i]); j++) {
          if (groups[i]) {
            await subtabs.nth(j).click();
            await expect(subtabs.nth(j)).toHaveAttribute('aria-selected', 'true');
          }
          const leaf = groups[i] ? panel.locator('.subtabpanel:visible').first() : panel;
          const title = groups[i] ? await subtabs.nth(j).innerText() : await tabs.nth(i).innerText();
          const bibliography = false;
          expect(await tabs.filter({ hasText: /Bibliograph|Bibliograf/ }).count()).toBe(0);
          const executiveTab = route === 'introduction' && i === 0;
          const compound = /Compound|compuestas/.test(title);
          if (bibliography) {
            await expect(leaf.locator('[data-doc-section]').first()).toBeVisible();
            expect(await leaf.locator('.th-refs a').count()).toBeGreaterThan(2);
          } else if (compound) {
            await expect(leaf.locator('select option')).toHaveCount(36);
            await expect(leaf.locator('table tbody tr')).toHaveCount(9);
          } else if (/Adequacy|Adecuación/.test(title)) {
            await expect(leaf.getByText(lang === 'en' ? 'Hash-checked episodes' : 'Episodios verificados por hash')).toBeVisible();
          } else if (/Semantic transfer|Transferencia semántica/.test(title)) {
            await expect(leaf.getByText(lang === 'en' ? 'Inspect an executed choice' : 'Inspeccionar una elección ejecutada')).toBeVisible();
          } else if (route !== 'benchmark' && !executiveTab) {
            const article = leaf.locator('.nx-doc-section');
            expect(await article.locator(':scope > p.measure').count()).toBeGreaterThanOrEqual(route === 'methodology' ? 4 : 2);
            expect(await article.locator('.katex-display').count()).toBeGreaterThanOrEqual(route === 'methodology' ? 2 : route === 'introduction' ? 0 : 1);
            await expect(article.locator('.science-figure:visible')).toHaveCount(1);
            expect(await leaf.locator('[data-doc-section][data-refs]').count()).toBeGreaterThan(0);
            expect(await leaf.locator('.caos-doc-reference-list a').count()).toBeGreaterThan(0);
            expect(await article.locator('p.measure .cite-inline').count()).toBeGreaterThan(0);
            await expect(leaf.locator('.reference-list')).toHaveCount(0);
          }
          expect(await leaf.locator('.katex-error').count()).toBe(0);
          if (route === 'methodology' && !bibliography)
            await expect(leaf.locator('.science-measurement table tbody tr').first()).toBeVisible();
          const links = leaf.locator('a[href]');
          if (await links.count()) {
            const last = links.last();
            await last.focus();
            await last.scrollIntoViewIfNeeded();
            await expect(last).toBeInViewport();
          }
          const geometry = await root.evaluate(el => {
            const b = el.getBoundingClientRect();
            return { wide: b.width >= innerWidth - 48,
              overflow: document.documentElement.scrollWidth > innerWidth + 1 };
          });
          if (!geometry.wide || geometry.overflow) errors.push({ route, title, width, theme, lang, ...geometry });
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
          await page.screenshot({ path: `${qaRoot}/content-${route}-${leafIndex}-${width}-${theme}-${lang}.png`, fullPage: true });
          sections.push({ route, title, width, theme, lang, sourcesReachable: true, ...geometry });
          leafIndex++;
        }
      }
      const expectedLeaves = groups.reduce((n, count) => n + Math.max(1, count), 0);
      expect(leafIndex).toBe(expectedLeaves);
      await tabs.first().focus(); await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
    }
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync(qaRoot + '/content-report.json', JSON.stringify({ base, sections, errors }, null, 2));
}
console.log(JSON.stringify({ section_checks: sections.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
