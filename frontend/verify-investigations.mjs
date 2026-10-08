import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const out = process.env.NEURAXIS_QA_OUTPUT ?? join(tmpdir(), 'neuraxis-investigations');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const checks = [], errors = [];
try {
  for (const width of [390,768,1280,1600,2560]) for (const theme of ['light','dark']) for (const lang of ['en','es']) {
    const page = await browser.newPage({viewport:{width,height:900}});
    page.on('pageerror', e => errors.push({width,theme,lang,message:e.message}));
    await page.addInitScript(({theme,lang}) => { localStorage.setItem('caos.theme',theme); localStorage.setItem('caos.lang',lang); },{theme,lang});
    await page.goto(`${base}/?mode=investigations&suite=semantic_transfer&incident=D01&controller=M12&compare=M09`);
    await expect(page.locator('.invest-result')).toHaveCount(2,{timeout:20000});
    for (const family of ['D01','D02','D03','D04','D05','D06','D07','D08']) {
      await page.getByRole('combobox', {name:lang==='en'?'Software incident':'Incidente de software',exact:true}).selectOption(family);
      await expect(page.locator('.op-heading h1')).toContainText(family);
      await expect(page.locator('[data-state="loading"]')).toHaveCount(0,{timeout:20000});
      await expect(page.locator('.invest-result')).toHaveCount(2);
      await expect(page.locator('.invest-file')).toHaveCount(6);
      await expect(page.locator('.invest-decision')).toBeVisible();
      const url = new URL(page.url());
      expect(url.searchParams.get('incident')).toBe(family);
      expect(url.searchParams.get('compare')).toBe('M09');
      checks.push({width,theme,lang,family,matched:true,fileOutputs:true});
    }
    await page.reload();
    await expect(page.getByRole('combobox', {name:lang==='en'?'Software incident':'Incidente de software',exact:true})).toHaveValue('D08');
    await expect(page.locator('.invest-result')).toHaveCount(2,{timeout:20000});
    await page.getByRole('combobox', {name:lang==='en'?'Evidence suite':'Estudio de evidencia',exact:true}).selectOption('core');
    await expect(page.locator('[data-state="loading"]')).toHaveCount(0,{timeout:20000});
    for (const method of ['M01','M03','M05','M07','M09','M12']) {
      await page.getByRole('combobox', {name:lang==='en'?'Controller':'Controlador',exact:true}).selectOption(method);
      await expect(page.locator('.invest-result').first().locator('.nx-kicker')).toContainText(method,{timeout:20000});
      checks.push({width,theme,lang,method,core:true});
    }
    await page.screenshot({path:join(out,`investigations-${width}-${theme}-${lang}.png`)});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
    await page.close();
  }
} finally { await browser.close(); writeFileSync(join(out,'report.json'),JSON.stringify({base,checks,errors},null,2)); }
console.log(JSON.stringify({checks:checks.length,errors}));
if(errors.length)process.exitCode=1;
