import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const base = process.env.NEURAXIS_QA_URL ?? 'http://127.0.0.1:4176';
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1600,height:900}});
const errors=[]; page.on('pageerror', error=>errors.push(error.message));
const response=await page.request.get(`${base}/data/index.json`);
const index=await response.json();
if(index.episodes.length!==14400) throw Error('Incomplete live evidence index');
await page.goto(base+'/app');await page.getByRole('tab',{name:/Engine & local workspace|Motor y espacio local/}).click();
await page.getByLabel('Execution lane').selectOption('canonical');
const verified=[];
for(let method=1;method<=12;method++) {
  const methodId=`M${String(method).padStart(2,'0')}`;
  await page.getByLabel('Decision method').selectOption(methodId);
  for(let caseNumber=1;caseNumber<=20;caseNumber++) {
    const caseId=`C${String(caseNumber).padStart(2,'0')}`;
    await page.getByRole('combobox',{name:'Selected case',exact:true}).selectOption(caseId);
    const ref=index.episodes.find(x=>x.method_id===methodId&&x.case_id===caseId&&x.variant==='nominal'&&x.seed===40000);
    await page.waitForFunction(id=>document.querySelector('.nx-diagnosis')?.getAttribute('data-run-id')===id,ref.run_id,{timeout:15000});
    const status=await page.locator('.nx-diagnosis').getAttribute('data-status');
    if(status!==ref.status)throw Error(`Rendered outcome drift ${methodId}/${caseId}`);
    verified.push({method:methodId,case:caseId,run_id:ref.run_id,status});
  }
}
mkdirSync('qa',{recursive:true});
await page.screenshot({path:'qa/canonical-final.png'});
const findings=[];
for(const lang of ['en','es'])for(const theme of ['light','dark']) {
  await page.evaluate(({lang,theme})=>{localStorage.setItem('caos.lang',lang);localStorage.setItem('caos.theme',theme);},{lang,theme});
  await page.goto(`${base}/benchmark`);
  await page.getByRole('tab',{name:lang==='en'?'Findings':'Hallazgos',exact:true}).click();
  await page.getByRole('button',{name:lang==='en'?'Download full evidence report':'Descargar informe completo',exact:true}).waitFor();
  const rows=await page.locator('.nx-research-results table tbody tr').count();
  if(rows!==16) throw Error(`Missing transfer/ablation rows: ${rows}`);
  const bounds=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));
  if(bounds.width!==bounds.scrollWidth)throw Error('Evidence view horizontal overflow');
  await page.screenshot({path:`qa/findings-${lang}-${theme}.png`});
  findings.push({lang,theme,rows,...bounds});
}
if(errors.length)throw Error(errors.join('\n'));
writeFileSync('qa/evidence-report.json',JSON.stringify({base,canonical_verified:verified,findings,page_errors:errors},null,2));
console.log(JSON.stringify({canonical_verified:verified.length,findings:findings.length,page_errors:errors}));
await browser.close();
