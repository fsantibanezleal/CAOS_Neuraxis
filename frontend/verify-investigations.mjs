import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4180';
const browser = await chromium.launch();
const checks = [], errors = [];
for (const width of [1600, 360]) for (const theme of ['light','dark']) for (const lang of ['en','es']) {
  const page = await browser.newPage({ viewport: { width, height:900 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(({theme,lang})=>{localStorage.setItem('caos.theme',theme);localStorage.setItem('caos.lang',lang);},{theme,lang});
  await page.goto(base);
  await page.getByRole('tab',{name:lang==='en'?'Investigations':'Investigaciones',exact:true}).click();
  await expect(page.locator('.invest-result')).toHaveCount(2,{timeout:20000});
  const selects = page.locator('.invest-layout .op-sidebar select');
  for (const method of ['M01','M03','M05','M07','M09','M12']) {
    await selects.nth(3).selectOption(method);
    await expect(page.locator('.invest-result').first().locator('.nx-kicker')).toContainText(method);
    await expect(page.locator('.invest-decision')).toBeVisible();
    checks.push({width,theme,lang,method,matched:true});
  }
  await page.locator('.invest-result').last().click();
  if(lang==='en')await page.screenshot({path:`qa/investigations-${width}-${theme}.png`,fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errors.push({width,theme,lang,overflow:true});
  await page.close();
}
await browser.close();
writeFileSync('qa/investigations-report.json',JSON.stringify({base,checks,errors},null,2));
console.log(JSON.stringify({checks:checks.length,errors}));
if(errors.length)process.exitCode=1;
