import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4176';
const routes = ['/introduction', '/methodology', '/implementation', '/experiments', '/benchmark'];
const sizes = [
  { width: 1280, height: 800 }, { width: 1600, height: 900 },
  { width: 2560, height: 1440 }, { width: 360, height: 800 },
  { width: 390, height: 844 }, { width: 430, height: 932 },
];
mkdirSync('qa', { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [];
for (const viewport of sizes) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
  const page = await browser.newPage({ viewport, hasTouch: viewport.width < 761 });
  page.on('pageerror', e => errors.push({ viewport, theme, lang, error: e.message }));
  await page.addInitScript(({ theme, lang }) => {
    localStorage.setItem('caos.theme', theme);
    localStorage.setItem('caos.lang', lang);
  }, { theme, lang });
  await page.goto(base);
  for (const route of routes) {
    // Exercise navigation out of fixed mode, not only direct URL loads.
    await page.locator(`.site-header a[href="${route}"]`).click();
    await page.locator(route === '/benchmark' ? '.nx-benchmark .nx-metrics' : '.nx-doc-section').waitFor();
    await expect(page.locator('.app-shell')).not.toHaveClass(/fixed/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    const before = await page.evaluate(() => ({ height: innerHeight, document: document.documentElement.scrollHeight, width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
    if (before.documentWidth > before.width + 1) errors.push({ route, viewport, theme, lang, horizontalOverflow: before });
    if (lang === 'en' && [360, 1600].includes(viewport.width)) await page.screenshot({ path: `qa/layout-${route.slice(1)}-${viewport.width}-${theme}-top.png` });
    if (before.document > before.height + 2) {
      await page.mouse.move(viewport.width * .75, viewport.height * .6);
      await page.mouse.wheel(0, 700);
      await expect.poll(() => page.evaluate(() => scrollY), { message: JSON.stringify({ route, viewport, theme, lang, before }) }).toBeGreaterThan(0);
      await page.keyboard.press('Control+End');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeLessThan(3);
      if (viewport.width < 761) {
        const session = await page.context().newCDPSession(page);
        const y = await page.evaluate(() => scrollY);
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: viewport.width * .75, y: 250 }] });
        for (let fingerY = 300; fingerY <= 600; fingerY += 50) {
          await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: viewport.width * .75, y: fingerY }] });
          await page.waitForTimeout(40);
        }
        // Finish the swipe without carrying momentum into the next route's wheel check.
        await page.waitForTimeout(150);
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(y);
        await page.waitForTimeout(150);
        await session.detach();
      }
    }
    const last = page.locator(route === '/benchmark' ? '.nx-benchmark a[href]' : '.nx-doc-section:visible a[href]').last();
    await last.focus();
    await expect(last).toBeInViewport();
    if (lang === 'en' && [360, 1600].includes(viewport.width)) await page.screenshot({ path: `qa/layout-${route.slice(1)}-${viewport.width}-${theme}-end.png` });
    checks.push({ route, viewport, theme, lang, documentFlow: true, finalSourceVisible: true, ...before });
  }
  await page.locator('.site-header .nav-link[href="/"]').click();
  await expect(page.locator('.op-layout')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.app-shell')).not.toHaveClass(/fixed/);
  await page.close();
}
await browser.close();
writeFileSync('qa/layout-report.json', JSON.stringify({ base, checks, errors }, null, 2));
console.log(JSON.stringify({ checks: checks.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
