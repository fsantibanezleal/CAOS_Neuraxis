import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4176';
const browser = await chromium.launch({ headless: true });
const findings = [];
mkdirSync('qa', { recursive: true });

const matrix = ['en', 'es'].flatMap((language) =>
  ['light', 'dark'].flatMap((theme) =>
    [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1600, height: 900 }]
      .map((viewport) => ({ language, theme, viewport })),
  ),
);
for (const { language, theme, viewport } of matrix) {
    const page = await browser.newPage({ viewport, colorScheme: theme });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(({ language, theme }) => {
      localStorage.setItem('caos.lang', language);
      localStorage.setItem('caos.theme', theme);
    }, { language, theme });
    await page.reload();
    const routing = language === 'en' ? 'Routing here is deterministic' : 'Aquí la selección es determinista';
    await page.getByText(routing, { exact: false }).first().waitFor();
    await page.goto(`${base}/benchmark`);
    await page.getByRole('tab', { name: language === 'en' ? 'Adequacy' : 'Adecuación' }).click();
    await page.getByText(language === 'en' ? 'Hash-checked episodes' : 'Episodios verificados por hash').waitFor();
    await page.getByRole('tab', { name: language === 'en' ? 'Semantic transfer' : 'Transferencia semántica' }).click();
    await page.getByText(
      language === 'en' ? 'Separate semantic transfer evidence' : 'Evidencia separada de transferencia semántica',
      { exact: true },
    ).waitFor();
    await page.getByText(
      language === 'en' ? 'The fitted router did not hand off' : 'El umbral ajustado no delegó',
      { exact: true },
    ).waitFor();
    await page.getByText(language === 'en' ? 'Inspect an executed choice' : 'Inspeccionar una elección ejecutada').waitFor();
    await page.getByText(language === 'en' ? 'Task outcome:' : 'Resultado:', { exact: true }).waitFor();
    const lastEvidence = page.getByText(
      language === 'en'
        ? 'A prespecified online test with more positive utility cases is still required.'
        : 'Falta una evaluación en línea predefinida con más casos de mejora.',
      { exact: false },
    );
    await lastEvidence.scrollIntoViewIfNeeded();
    const bounds = await page.evaluate(() => ({
      viewport: innerWidth,
      viewportHeight: innerHeight,
      document: document.documentElement.scrollWidth,
      scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      lastPanelBottom: 0,
    }));
    bounds.lastPanelBottom = await lastEvidence.evaluate((element) => element.getBoundingClientRect().bottom);
    const chartScrollRange = await page.locator('.nx-routing-scroll').evaluate((element) => element.scrollWidth - element.clientWidth);
    const hintVisible = await page.locator('.nx-routing-hint').isVisible();
    if (bounds.document > bounds.viewport + 2 || bounds.lastPanelBottom > bounds.viewportHeight + 2 || errors.length ||
        (viewport.width <= 700 && (chartScrollRange < 100 || !hintVisible)))
      findings.push({ language, theme, viewport, bounds, chartScrollRange, hintVisible, errors });
    await page.locator('.nx-research-results').last().screenshot({
      path: `qa/routing-${language}-${theme}-${viewport.width}.png`,
    });
    await page.screenshot({ path: `qa/semantic-${language}-${theme}-${viewport.width}.png`, fullPage: true });
    await page.close();
}
await browser.close();
writeFileSync('qa/benchmark-report.json', JSON.stringify({ base, findings }, null, 2));
console.log(JSON.stringify({ checks: matrix.length, findings }));
if (findings.length) process.exitCode = 1;
