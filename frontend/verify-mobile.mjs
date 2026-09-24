import {chromium} from '@playwright/test';
import {readFileSync, writeFileSync} from 'node:fs';
const token=readFileSync('qa/.native-token','utf8');
const base='http://127.0.0.1:4177';
const browser=await chromium.launch();
const report=[]; const failures=[];
for(const size of [{width:360,height:800},{width:390,height:844},{width:430,height:932}]) for(const theme of ['light','dark']) for(const lang of ['en','es']) {
 const page=await browser.newPage({viewport:size}); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.evaluate(({theme,lang})=>{localStorage.setItem('caos.theme',theme);localStorage.setItem('caos.lang',lang);},{theme,lang});
 await page.reload();
 const toggle=page.locator('.nx-mobile-switch button');
 await toggle.click();
 for(let i=0;i<4;i++) {
  await page.locator('.nx-sidebar [role=tab]').nth(i).click();
  const clipped=await page.locator('.nx-sidebar').evaluate(el=>{const b=el.getBoundingClientRect();return Array.from(el.querySelectorAll('button,input,select')).filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&(r.left<b.left-1||r.right>b.right+1||r.bottom>b.bottom+1);}).map(n=>n.textContent?.slice(0,60)||n.getAttribute('aria-label')||n.tagName);});
  if(clipped.length)failures.push({size,theme,lang,tab:i,clipped});
 }
 await page.locator('.nx-sidebar [role=tab]').nth(0).focus(); await page.keyboard.press('Escape');
 if(await toggle.getAttribute('aria-expanded')!=='false'||!(await toggle.evaluate(el=>el===document.activeElement))) failures.push({size,theme,lang,keyboard:'Escape did not close/return focus'});
 await page.keyboard.press('Enter');
 await page.locator('.nx-sidebar [role=tab]').nth(2).click();
 await page.locator('.nx-sidebar input[type=password]').fill(token);
 await page.locator('.nx-sidebar [role=tab]').nth(3).click();
 await page.getByRole('button',{name:/Open workflow editor|Abrir editor de flujos/}).click();
 await page.locator('.nx-workspace .nx-view-bar select').selectOption('recovery');
 await page.getByRole('button',{name:/Refresh unknown intents|Actualizar intenciones desconocidas/}).waitFor();
 const initial=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));
 if(initial.width!==initial.scrollWidth) failures.push({size,theme,lang,overflow:initial});
 await page.screenshot({path:`qa/phone-recovery-${size.width}-${theme}-${lang}.png`});
 const fields=page.locator('.nx-workspace .nx-instrument button,.nx-workspace .nx-instrument input,.nx-workspace .nx-instrument select,.nx-workspace .nx-instrument textarea');
 const labels=[];
 for(let i=0;i<await fields.count();i++){
  const f=fields.nth(i); if(!(await f.isVisible())) continue;
  await f.scrollIntoViewIfNeeded();
  const bounds=await f.boundingBox();
  if(bounds&&(bounds.x<0||bounds.x+bounds.width>size.width+1)) failures.push({size,theme,lang,field:await f.getAttribute('aria-label'),bounds});
  const a=await f.evaluate(el=>({name:el.getAttribute('aria-label')||el.labels?.[0]?.textContent||el.textContent,disabled:el.disabled,tag:el.tagName}));
  if(!a.name?.trim())failures.push({size,theme,lang,unlabelled:a});
  labels.push(a);
 }
 const checks=page.locator('.nx-workspace .nx-instrument input[type=checkbox]');
 for(let i=0;i<await checks.count();i++){await checks.nth(i).focus();await page.keyboard.press('Space');if(!(await checks.nth(i).isChecked()))failures.push({size,theme,lang,checkbox:i});}
 report.push({size,theme,lang,fields:labels.length,errors});if(errors.length)failures.push({size,theme,lang,errors});await page.close();
}
await browser.close();writeFileSync('qa/phone-report.json',JSON.stringify({report,failures},null,2));console.log(JSON.stringify({checks:report.length,failures},null,2));if(failures.length)process.exitCode=1;
