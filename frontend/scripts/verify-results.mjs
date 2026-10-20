import {chromium,expect} from '@playwright/test';import {writeFileSync} from 'node:fs';
const base=process.env.NEURAXIS_QA_URL??'http://127.0.0.1:4176';
const browser=await chromium.launch();const checks=[];
for(const width of [360,1600])for(const theme of ['light','dark'])for(const lang of ['en','es']){
 const p=await browser.newPage({viewport:{width,height:900}});await p.addInitScript(({theme,lang})=>{localStorage.setItem('caos.theme',theme);localStorage.setItem('caos.lang',lang);},{theme,lang});await p.goto(`${base}/benchmark`);await p.locator('.nx-metrics').waitFor();
 const tabs=p.locator('.nx-benchmark .tab');for(let i=0;i<await tabs.count();i++){
 await tabs.nth(i).click();if(i===1)await p.getByRole('button',{name:/Download full evidence report|Descargar informe completo/}).waitFor();const panel=p.locator('.nx-benchmark .tabpanel:visible');await panel.waitFor();
 const last=panel.locator('p,button,td,pre,svg,li,a').last();await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();
 const w=await p.evaluate(()=>({actual:document.documentElement.scrollWidth,expected:innerWidth}));if(w.actual>w.expected+1)throw Error(JSON.stringify({width,theme,lang,tab:i,w}));
 if(lang==='en')await p.screenshot({path:`qa/result-tab-${i}-${width}-${theme}.png`});checks.push({width,theme,lang,tab:i});
 }await p.close();
}await browser.close();writeFileSync('qa/results-review.json',JSON.stringify({base,checks,errors:[]},null,2));console.log(JSON.stringify({checks:checks.length,errors:[]}));
