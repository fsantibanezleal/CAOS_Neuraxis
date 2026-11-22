import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const qaRoot = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-verify-architecture');
mkdirSync(qaRoot, { recursive: true });
const browser = await chromium.launch();
const checks = [];
const errors = [];

try {
  for (const width of [1600, 360]) {
    for (const theme of ['light', 'dark']) {
      for (const lang of ['en', 'es']) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        page.on('pageerror', error => errors.push({ width, theme, lang, pageError: error.message }));
        await page.addInitScript(
          ({ theme: selectedTheme, lang: selectedLang }) => {
            localStorage.setItem('caos.theme', selectedTheme);
            localStorage.setItem('caos.lang', selectedLang);
          },
          { theme, lang },
        );
        await page.goto(`${base}/app`);
        const trigger = page.getByRole('button', { name: /Architecture \/|Arquitectura \// });
        await trigger.click();
        const modal = page.getByRole('dialog');
        const tabs = modal.getByRole('tab');
        await expect(tabs).toHaveCount(5);
        await expect(modal.locator('[data-arch-lang]')).toHaveAttribute('data-arch-lang', lang);

        for (let index = 0; index < 5; index++) {
          await tabs.nth(index).click();
          const drawing = modal.locator('.arch-svg');
          await expect(drawing).toBeVisible();
          await expect(drawing.locator(`text.l-${lang}`).first()).toBeVisible();
          await expect(drawing.locator(`text.l-${lang === 'en' ? 'es' : 'en'}`).first()).toBeHidden();

          const layoutIssues = await drawing.evaluate(svg => {
            const view = svg.viewBox.baseVal;
            const bounds = [];
            const outOfView = [];
            const cardOverflow = [];
            const flowOverlaps = [];
            for (const text of svg.querySelectorAll('text')) {
              const style = getComputedStyle(text);
              if (style.display === 'none' || style.visibility === 'hidden') continue;
              const box = text.getBBox();
              if (box.width <= 0 || box.height <= 0) continue;
              bounds.push({ x: box.x, y: box.y, width: box.width, height: box.height });
              if (
                box.x < view.x - 1 ||
                box.y < view.y - 1 ||
                box.x + box.width > view.x + view.width + 1 ||
                box.y + box.height > view.y + view.height + 1
              ) {
                outOfView.push({ text: text.textContent, box });
              }
              if (text.classList.contains('lbl')) {
                for (const card of svg.querySelectorAll('rect.bx')) {
                  const cardBox = card.getBBox();
                  if (
                    box.x < cardBox.x + cardBox.width &&
                    box.x + box.width > cardBox.x &&
                    box.y < cardBox.y + cardBox.height &&
                    box.y + box.height > cardBox.y
                  ) {
                    flowOverlaps.push({
                      text: text.textContent,
                      box: { x: box.x, y: box.y, width: box.width, height: box.height },
                      cardBox: {
                        x: cardBox.x,
                        y: cardBox.y,
                        width: cardBox.width,
                        height: cardBox.height,
                      },
                    });
                  }
                }
              }
              const group = text.closest('g');
              const card = group?.querySelector(':scope > rect.bx');
              if (!card) continue;
              const cardBox = card.getBBox();
              if (
                box.x < cardBox.x + 8 ||
                box.x + box.width > cardBox.x + cardBox.width - 8 ||
                box.y < cardBox.y + 8 ||
                box.y + box.height > cardBox.y + cardBox.height - 8
              ) {
                cardOverflow.push({ text: text.textContent, box, cardBox });
              }
            }
            return { textCount: bounds.length, outOfView, cardOverflow, flowOverlaps };
          });
          if (
            layoutIssues.outOfView.length ||
            layoutIssues.cardOverflow.length ||
            layoutIssues.flowOverlaps.length
          ) {
            errors.push({ width, theme, lang, tab: index, ...layoutIssues });
          }

          await modal.getByRole('button', { name: /Read at full size|Leer a tamaño completo/ }).click();
          const region = modal.getByRole('region');
          await region.focus();
          await expect(region).toBeInViewport();
          if (width === 360) {
            await page.keyboard.press('ArrowRight');
            await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
          }
          await modal.getByRole('button', { name: /Fit diagram|Ajustar diagrama/ }).click();
          await page.screenshot({ path: `${qaRoot}/architecture-${index}-${width}-${theme}-${lang}.png` });
          expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
          checks.push({ width, theme, lang, tab: index, fullSizeKeyboardAccess: true, textCount: layoutIssues.textCount });
        }
        await page.keyboard.press('Escape');
        await expect(modal).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  writeFileSync(join(qaRoot, 'architecture-report.json'), JSON.stringify({ base, checks, errors }, null, 2));
}

console.log(JSON.stringify({ checks: checks.length, errors }));
if (errors.length) process.exitCode = 1;
