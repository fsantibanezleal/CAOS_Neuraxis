import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const base=process.env.NEURAXIS_QA_URL??'http://127.0.0.1:4180';
const out=process.env.NEURAXIS_QA_OUTPUT??join(tmpdir(),'neuraxis-tabs');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
const checks=[],errors=[];
try {
 for(const width of [390,768,1280,1600,2560]) for(const lang of ['en','es']) for(const theme of ['light','dark']) {
  const page=await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',error=>errors.push({width,lang,theme,error:error.message}));
  await page.addInitScript(({lang,theme})=>{localStorage.setItem('caos.lang',lang);localStorage.setItem('caos.theme',theme);},{lang,theme});
  for(const route of ['introduction','methodology','implementation','experiments','benchmark']) {
   await page.goto(`${base}/${route}`);
   const root=page.locator(route==='benchmark'?'.nx-benchmark':'[data-doc-page]');
   const list=root.locator('[role="tablist"]').first();
   const tabs=list.getByRole('tab');
   await expect(tabs.first()).toBeVisible();
   await tabs.first().focus(); await page.keyboard.press('End');
   await expect(tabs.last()).toBeFocused();
   const revealed=await tabs.last().evaluate(el=>{const b=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return b.left>=p.left-2&&b.right<=p.right+2;});
   expect(revealed).toBe(true);
   await tabs.last().click();
   await expect(tabs.last()).toHaveAttribute('aria-selected','true');
   const bibliography=tabs.filter({hasText:lang==='en'?'Bibliography':'Bibliografía'});
   await bibliography.click();
   await expect(root.locator('[role="tabpanel"]:visible .th-refs a, [role="tabpanel"]:visible .caos-doc-references a').first()).toBeVisible();
   await tabs.first().click();
   const nested=root.locator('[role="tabpanel"]:visible [role="tablist"]').first();
   if(await nested.count()) {
    const children=nested.getByRole('tab');
    await children.first().focus(); await page.keyboard.press('End');
    await expect(children.last()).toBeFocused(); await children.last().click();
    await expect(children.last()).toHaveAttribute('aria-selected','true');
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
   checks.push({route,width,lang,theme,keyboard:true,bibliography:true,nested:true});
  }
  await page.close();
 }
} finally {await browser.close();writeFileSync(join(out,'report.json'),JSON.stringify({base,checks,errors},null,2));}
console.log(JSON.stringify({checks:checks.length,errors}));
if(errors.length)process.exitCode=1;
