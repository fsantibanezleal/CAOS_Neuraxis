import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'node:fs';
const base=process.env.NEURAXIS_QA_URL??'http://127.0.0.1:4176';
mkdirSync('qa',{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[];const failures=[];
for(const size of [{width:1280,height:800},{width:1600,height:900},{width:2560,height:1440}]){
 const page=await browser.newPage({viewport:size});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const theme of ['light','dark'])for(const lang of ['en','es']){
  await page.goto(base);await page.evaluate(({theme,lang})=>{localStorage.setItem('caos.theme',theme);localStorage.setItem('caos.lang',lang);},{theme,lang});
  for(const route of ['/','/introduction','/methodology','/implementation','/experiments','/benchmark']){
   await page.goto(base+route);await page.waitForSelector('h1');await page.waitForTimeout(150);
   const bounds=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,title:document.querySelector('h1')?.textContent,katexErrors:document.querySelectorAll('.katex-error').length,main:document.querySelector('.nx-main')?.getBoundingClientRect().toJSON()}));
   if(route==='/'){const tabs=page.locator('.nx-sidebar [role=tab]');for(let k=0;k<await tabs.count();k++){await tabs.nth(k).click();const clipped=await page.locator('.nx-sidebar').evaluate(el=>{const box=el.getBoundingClientRect();return Array.from(el.querySelectorAll('button,input,select')).filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&(r.left<box.left-1||r.right>box.right+1||r.bottom>box.bottom+1);}).map(n=>n.textContent?.slice(0,60)||n.getAttribute('aria-label')||n.tagName);});if(clipped.length)failures.push({route,theme,lang,size,clipped});}await tabs.first().click();}
   const entry={route,theme,lang,viewport:size,...bounds};report.push(entry);if(bounds.scrollWidth!==size.width||(route==='/'&&bounds.scrollHeight!==size.height)||bounds.katexErrors)failures.push(entry);
   if(size.width===1600&&lang==='en'&&(theme==='dark'||route==='/methodology'))await page.screenshot({path:`qa/${route.replaceAll('/','')||'app'}-${theme}-${lang}.png`});
  }
 }
 if(errors.length)failures.push({size,errors});await page.close();
}
const page=await browser.newPage({viewport:{width:1600,height:900}});await page.goto(base);await page.getByRole('button',{name:'Step',exact:true}).click();await page.getByRole('button',{name:'Step',exact:true}).click();await page.getByRole('button',{name:'Step',exact:true}).click();await page.screenshot({path:'qa/app-stepped.png'});const steps=await page.locator('.nx-bottom-readout').innerText();if(!steps.includes('Actions: 3'))failures.push({interaction:'Step did not produce three actions',steps});await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.screenshot({path:'qa/app-cancelled.png'});
await page.evaluate(()=>localStorage.setItem('caos.theme','dark'));await page.reload();await page.getByRole('button',{name:'Architecture / How it works'}).click();await page.waitForSelector('.arch-svg');await page.screenshot({path:'qa/architecture-dark.png'});
await browser.close();writeFileSync('qa/browser-report.json',JSON.stringify({base,checks:report,failures},null,2));console.log(JSON.stringify({checks:report.length,failures},null,2));if(failures.length)process.exitCode=1;
