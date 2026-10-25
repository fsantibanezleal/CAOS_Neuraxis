import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4176';
const routes = ['/app', '/introduction', '/methodology', '/implementation', '/experiments', '/benchmark'];
const sizes = [
  { width: 1280, height: 800 }, { width: 1600, height: 900 },
  { width: 2560, height: 1440 }, { width: 360, height: 800 },
  { width: 390, height: 844 }, { width: 430, height: 932 },
];
const qaRoot = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-qa');
mkdirSync(qaRoot, { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [], keyboardEndFallbacks = [];
for (const viewport of sizes) for (const theme of ['light', 'dark']) for (const lang of ['en', 'es']) {
  const page = await browser.newPage({ viewport, hasTouch: viewport.width < 761 });
  const navigationErrors = [];
  page.on('pageerror', e => {
    const detail = { viewport, theme, lang, error: e.message };
    errors.push(detail);
    navigationErrors.push(detail);
  });
  page.on('requestfailed', request => navigationErrors.push({
    url: request.url(), failure: request.failure() ?? 'request failed',
  }));
  page.on('response', response => {
    if (response.status() >= 400) navigationErrors.push({
      url: response.url(), status: response.status(),
    });
  });
  await page.addInitScript(({ theme, lang }) => {
    localStorage.setItem('caos.theme', theme);
    localStorage.setItem('caos.lang', lang);
  }, { theme, lang });
  await page.goto(base);
  for (const route of routes) {
    console.log(JSON.stringify({ route, viewport, theme, lang, phase: 'navigation' }));
    // Exercise navigation out of fixed mode, not only direct URL loads.
    const destination = page.locator(`.site-header a[href="${route}"]`);
    const heading = (await destination.innerText()).trim();
    await destination.click();
    try {
      await expect(page).toHaveURL(new URL(route, base).href);
      await expect.poll(() => page.locator('.app-shell > main.page').evaluate(el => el.scrollTop)).toBe(0);
      // A previous lazy route can remain visible briefly after the URL changes.
      if (route === '/benchmark')
        await expect(page.locator('[data-doc-page] .page-head h1')).toHaveText(heading);
      else if (route === '/app')
        await expect(page.locator('.op-layout')).toBeVisible();
      else
        await expect(page.locator('[data-doc-page] .page-head h1')).toHaveText(heading);
      await page.locator(route === '/app' ? '.op-layout' : route === '/benchmark' ? '.nx-benchmark .nx-metrics' : route === '/introduction' ? '[data-executive-valid="true"]' : '.nx-doc-section').waitFor();
      if (route === '/methodology')
        await expect(page.locator('.science-measurement table tbody tr').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
    } catch (error) {
      await page.screenshot({ path: qaRoot + '/layout-failure.png', fullPage: true });
      console.log(JSON.stringify({
        url: page.url(), text: (await page.locator('body').innerText()).slice(0, 1800),
        navigationErrors: navigationErrors.slice(-20),
      }));
      throw error;
    }
    await expect(page.locator('.app-shell')).toHaveClass(/contain/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    const before = await page.evaluate(() => ({ height: innerHeight, document: document.documentElement.scrollHeight, width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
    if (before.documentWidth > before.width + 1) errors.push({ route, viewport, theme, lang, horizontalOverflow: before });
    if (lang === 'en' && [360, 1600].includes(viewport.width)) await page.screenshot({ path: `${qaRoot}/layout-${route.slice(1)}-${viewport.width}-${theme}-top.png` });
    if (before.document > before.height + 2) {
      await page.mouse.move(viewport.width * .75, viewport.height * .6);
      await page.mouse.wheel(0, 700);
      await expect.poll(() => page.evaluate(() => scrollY), { message: JSON.stringify({ route, viewport, theme, lang, before }) }).toBeGreaterThan(0);
      await page.keyboard.press('Control+End');
      let remaining = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY);
      if (remaining >= 3) {
        keyboardEndFallbacks.push({ route, viewport, theme, lang, remaining });
        // A smooth document scroll can still be settling when Control+End is sent immediately after a wheel.
        // Confirm actual user scrolling reaches the end, while recording the keyboard-only limitation explicitly.
        for (let attempt = 0; attempt < 8 && remaining >= 3; attempt += 1) {
          await page.mouse.wheel(0, Math.max(500, Math.round(viewport.height * 0.8)));
          await page.waitForTimeout(120);
          remaining = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY);
        }
      }
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
    // Desktop shell contains a scrollable main; mobile uses document flow.
    const scrollable = page.locator('main').filter({visible:true}).first();
    const mainScroll = await scrollable.evaluate(el => ({height:el.clientHeight, content:el.scrollHeight}));
    if (before.document <= before.height + 2 && mainScroll.content > mainScroll.height + 2) {
      await scrollable.hover();
      await page.mouse.wheel(0, 700);
      await expect.poll(() => scrollable.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    }
    const last = page.locator(route === '/app' ? '.op-layout a[href]' : '.nx-doc-section:visible a[href]').last();
    if (await last.count()) { await last.focus(); await expect(last).toBeInViewport(); }
    if (lang === 'en' && [360, 1600].includes(viewport.width)) await page.screenshot({ path: `${qaRoot}/layout-${route.slice(1)}-${viewport.width}-${theme}-end.png` });
    checks.push({ route, viewport, theme, lang, verticalScrollVerified: true, finalSourceVisible: true, ...before });
  }
  await page.locator('.site-header .nav-link[href="/introduction"]').click();
  await expect(page.locator('[data-executive-valid="true"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.app-shell')).toHaveClass(/contain/);
  await page.close();
}
await browser.close();
writeFileSync(qaRoot + '/layout-report.json', JSON.stringify({ base, checks, errors, keyboardEndFallbacks }, null, 2));
console.log(JSON.stringify({ checks: checks.length, errors, keyboardEndFallbacks: keyboardEndFallbacks.length }, null, 2));
if (errors.length) process.exitCode = 1;
