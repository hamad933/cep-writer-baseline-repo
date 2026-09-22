import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, rm, writeFile, readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { canonicalSourceIdentity } from '../source-tree-identity.mjs';

const require=createRequire(import.meta.url);
const { chromium }=require('playwright');
const root=new URL('../../',import.meta.url);
const outDir=new URL('.capsule-c2-output/',root);
const shotDir=new URL('screenshots/',outDir);
const receiptFile=new URL('c2-w04-baseline-receipt.json',outDir);
const port=43182, base=`http://127.0.0.1:${port}`;
const surfaces=['evidence','reviews','mastery','portfolio'];
const viewports=[{width:1440,height:1000},{width:1024,height:900}];

await rm(outDir,{recursive:true,force:true}); await mkdir(shotDir,{recursive:true});
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:new URL('.',root),encoding:'utf8'}).trim();
const tree=execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:new URL('.',root),encoding:'utf8'}).trim();
const product=await canonicalSourceIdentity(root);
if(product.sha256!=='5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d'||product.files!==273){
  throw Error(`C2_BOOTSTRAP_PRODUCT_IDENTITY_MISMATCH:${product.sha256}/${product.files}`);
}
function which(names){for(const n of names){try{return execFileSync('which',[n],{encoding:'utf8'}).trim()}catch{}}return null}
let executable=process.env.CEP_BROWSER_EXECUTABLE||which(['google-chrome','google-chrome-stable','chromium','chromium-browser']);
if(!executable){const p=chromium.executablePath();try{await access(p,fsConstants.X_OK);executable=p}catch{}}
if(!executable) throw Error('C2_BOOTSTRAP_BROWSER_UNAVAILABLE');
const server=spawn(process.execPath,[new URL('tools/serve.mjs',root).pathname,'--port',String(port)],{cwd:new URL('.',root),stdio:['ignore','pipe','pipe']});
let serverLog=''; server.stdout.on('data',d=>serverLog+=String(d)); server.stderr.on('data',d=>serverLog+=String(d));
async function waitServer(){for(let i=0;i<100;i++){try{if((await fetch(base)).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('C2_BOOTSTRAP_SERVER_DID_NOT_START')}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const records=[];
let browser;
try{
 await waitServer();
 browser=await chromium.launch({headless:true,executablePath:executable});
 for(const surface of surfaces){
  for(const viewport of viewports){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(); const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
   await page.goto(`${base}/?surface=${surface}`,{waitUntil:'networkidle'});
   await page.waitForFunction(s=>globalThis.CEPFoundation?.consumer===s,surface);
   const name=`${surface}-${viewport.width}x${viewport.height}.png`;
   const url=new URL('screenshots/'+name,outDir);
   await page.screenshot({path:url.pathname,fullPage:false});
   const bytes=await readFile(url);
   const probe=await page.evaluate(() => {
     const text=(document.body?.innerText||'').replace(/\s+/g,' ').trim();
     const commands=[...document.querySelectorAll('button[data-foundation-command]')].map(n=>({id:n.getAttribute('data-foundation-command'),label:(n.textContent||'').trim(),disabled:n.disabled}));
     const regions={left:document.querySelector('#leftPane')?.innerText?.slice(0,1000)||'',center:document.querySelector('#centerPane')?.innerText?.slice(0,1800)||'',right:document.querySelector('#rightPane')?.innerText?.slice(0,1000)||'',bottom:document.querySelector('#bottomShelf')?.innerText?.slice(0,1000)||''};
     return {
       consumer:globalThis.CEPFoundation?.consumer||null,
       commands,
       flags:{
         rescueBase:text.includes('rescue-base'),
         syntheticDemoSeed:text.includes('SYNTHETIC_DEMO_SEED'),
         mastered:text.includes('MASTERED'),
         fakeDigest:text.includes('sha256:3333333333333333'),
         workbenchFinding:text.includes('Workbench finding')
       },
       regions
     };
   });
   records.push({surface,viewport,file:name,bytes:bytes.length,sha256:sha(bytes),pageErrors,probe});
   await context.close();
  }
  if(surface==='evidence'){
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   const page=await context.newPage(); const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(String(e)));
   await page.goto(`${base}/?surface=evidence`,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>globalThis.CEPFoundation?.consumer==='evidence');
   const details=page.locator('details').filter({hasText:'Import candidate evidence'}).first();
   if(await details.count()) await details.evaluate(n=>n.open=true);
   const name='evidence-import-open-1440x1000.png'; const url=new URL('screenshots/'+name,outDir);
   await page.screenshot({path:url.pathname,fullPage:false}); const bytes=await readFile(url);
   const importProbe=await page.evaluate(()=>({preview:document.querySelector('[data-evidence-envelope-preview]')?.textContent||null,fields:[...document.querySelectorAll('[data-evidence-id],[data-evidence-revision],[data-evidence-source],[data-evidence-source-revision],[data-evidence-title],[data-evidence-claim]')].map(n=>({name:n.getAttributeNames().find(x=>x.startsWith('data-evidence-')),value:n.value}))}));
   records.push({surface:'evidence',state:'import-open',viewport:{width:1440,height:1000},file:name,bytes:bytes.length,sha256:sha(bytes),pageErrors,probe:importProbe});
   await context.close();
  }
 }
}finally{
 try{if(browser)await browser.close()}catch{}
 try{server.kill('SIGTERM')}catch{}
}
const receipt={
 schemaVersion:1,
 classification:'C2_CONTROLLER_PREPARED_BASELINE__BOOTSTRAP_ONLY__NOT_ACCEPTANCE',
 mission:'CORR02_C2_W04_PRODUCT_DATA_ACTION_TRUTH',
 productParentCommit:'ac888c7e622fdefdc4f958771b21db485e33f9fc',
 capsuleTransportCommit:head,
 capsuleTransportTree:tree,
 productSource:{sha256:product.sha256,files:product.files},
 browserExecutable:executable,
 route:'GENUINE_LOCALHOST',
 surfaces,
 viewports,
 records,
 serverLog:serverLog.slice(-4000)
};
await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n','utf8');
console.log(JSON.stringify({verdict:'PASS',screenshots:records.length,productSource:receipt.productSource,head,tree,browserExecutable:executable}));
