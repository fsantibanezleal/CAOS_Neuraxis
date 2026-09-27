import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const routes = ['introduction', 'methodology', 'implementation', 'experiments', 'benchmark'];
const checks = [];
const errors = [];
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of [1600, 360]) for (const lang of ['en', 'es']) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width === 360 });
    page.on('pageerror', error => errors.push({ width, lang, theme, pageError: error.message }));
    await page.addInitScript(({ lang, theme }) => {
      localStorage.setItem('caos.lang', lang);
      localStorage.setItem('caos.theme', theme);
    }, { lang, theme });
    for (const route of routes) {
      await page.goto(`${base}/${route}`);
      const root = page.locator(route === 'benchmark' ? '.nx-benchmark' : '.nx-doc');
      const navigator = root.locator('.nx-overflow-tabs');
      const list = navigator.locator(':scope > .tabs > .tablist');
      const tabs = list.locator(':scope > .tab');
      await expect(tabs.first()).toBeVisible();
      const overflow = await list.evaluate(el => el.scrollWidth > el.clientWidth + 2);
      const controls = navigator.locator('.nx-tab-scroll-controls');
      if ((route === 'introduction' || route === 'methodology') && lang === 'en' && theme === 'dark') {
        await page.screenshot({ path: `qa/tab-navigation-initial-${route}-${width}.png` });
      }
      if (overflow) {
        await expect(controls).toBeVisible();
        const next = controls.getByRole('button', { name: lang === 'en' ? 'More sections' : 'Más secciones' });
        for (let attempt = 0; attempt < 12 && await next.isEnabled(); attempt++) {
          const rect = await next.boundingBox();
          if (!rect) throw new Error(`${route}: next-sections control has no pointer target`);
          const x = rect.x + rect.width / 2;
          const y = rect.y + rect.height / 2;
          if (width === 360) await page.touchscreen.tap(x, y);
          else await page.mouse.click(x, y);
          await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
          await page.waitForTimeout(180);
        }
        await expect(next).toBeDisabled();
      } else {
        await expect(controls).toHaveCount(0);
      }
      const last = tabs.last();
      const visible = await last.evaluate((el) => {
        const tab = el.getBoundingClientRect();
        const strip = el.parentElement.getBoundingClientRect();
        const controls = el.closest('.nx-overflow-tabs').querySelector('.nx-tab-scroll-controls');
        const usableRight = controls ? controls.getBoundingClientRect().left : strip.right;
        return tab.left >= strip.left - 2 && tab.right <= usableRight + 2;
      });
      if (!visible) errors.push({ route, width, lang, theme, lastTabHiddenAfterScrolling: true });
      await last.click();
      await expect(last).toHaveAttribute('aria-selected', 'true');
      await expect(navigator.locator(':scope > .tabs > .tabpanel:visible')).toBeVisible();
      const bibliography = tabs.filter({ hasText: /Bibliograph|Bibliograf/ });
      await bibliography.click();
      await expect(bibliography).toHaveAttribute('aria-selected', 'true');
      await expect(navigator.locator('.tabpanel:visible .reference-list li').first()).toBeVisible();
      await tabs.first().focus();
      await page.keyboard.press('End');
      await expect(last).toBeFocused();
      await expect(last).toHaveAttribute('aria-selected', 'true');
      const keyboardVisible = await expect.poll(() => last.evaluate(el => {
        const tab = el.getBoundingClientRect();
        const strip = el.parentElement.getBoundingClientRect();
        const controls = el.closest('.nx-overflow-tabs').querySelector('.nx-tab-scroll-controls');
        const usableRight = controls ? controls.getBoundingClientRect().left : strip.right;
        return tab.left >= strip.left - 2 && tab.right <= usableRight + 2;
      })).toBe(true).then(() => true, () => false);
      if (!keyboardVisible) errors.push({ route, width, lang, theme, selectedTabHiddenAfterKeyboard: true });
      const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (pageOverflow) errors.push({ route, width, lang, theme, pageOverflow: true });
      if ((route === 'introduction' || route === 'methodology') && lang === 'en' && theme === 'dark') {
        await page.screenshot({ path: `qa/tab-navigation-${route}-${width}.png` });
      }
      checks.push({ route, width, lang, theme, overflow, pointerReachable: visible, keyboardReachable: keyboardVisible, bibliographyReachable: true });
    }
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync('qa/tab-navigation-report.json', JSON.stringify({ base, checks, errors }, null, 2));
}
console.log(JSON.stringify({ checks: checks.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
