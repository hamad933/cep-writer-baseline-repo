/* W05-MANUAL-AI addendum capture: scroll-bound region captures (section C stepper, E gate),
   plus a compact-viewport and RTL stage capture. All hash-bound. */
import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,appendFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const OUT=path.join(root,'writer-output/W05-MANUAL-AI/evidence');
await mkdir(OUT,{recursive:true});
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close();res(p)})});
const port=await freePort(),runtimePort=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime=spawn(process.execPath,[path.join(root,'stack/local-runtime/server.mjs')],{cwd:root,env:{...process.env,CEP_LOCAL_RUNTIME_PORT:String(runtimePort),CEP_SQLITE_PATH:path.join(root,'writer-output/W05/.runtime-proof/audit.sqlite')},stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
const lineage={commit:execSync('git rev-parse HEAD',{cwd:root}).toString().trim(),short:execSync('git rev-parse --short HEAD',{cwd:root}).toString().trim(),
  treeSha:execSync('git rev-parse HEAD:stack/native-typescript',{cwd:root}).toString().trim(),capturedAt:new Date().toISOString(),viewport:null};
const out=[];
const browser=await chromium.launch({headless:true});
const shot=async(page,name,clip)=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file,fullPage:false,clip});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`,...lineage};
  out.push(rec);return rec;
};
const box=async(page,sel)=>page.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
  return {x:Math.max(0,Math.round(r.x)),y:Math.max(0,Math.round(r.y)),width:Math.round(r.width),height:Math.round(Math.min(r.height,window.innerHeight-Math.max(0,r.y)))}},sel);

const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>console.log('PAGEERR',String(e)));
await page.goto(`http://127.0.0.1:${port}/?surface=manual_ai&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='manual_ai',undefined,{timeout:30000});
await page.waitForTimeout(2400);
lineage.viewport='1536x1024';
let b=await box(page,'[data-sec="C"]');if(b)await shot(page,'en-secC-stepper-v2',b);
b=await box(page,'[data-sec="E"]');if(b)await shot(page,'en-secE-gate',b);
b=await box(page,'[data-sec="D"]');if(b)await shot(page,'en-secD-intake',b);
await page.evaluate(()=>document.querySelector('#foundationStage').scrollTop=0);await page.waitForTimeout(300);
await shot(page,'en-L1-whole',{x:0,y:0,width:1536,height:1024});

/* RTL */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1400);
await shot(page,'ar-L1-whole',{x:0,y:0,width:1536,height:1024});
b=await box(page,'[data-sec="C"]');if(b)await shot(page,'ar-secC-stepper',b);
b=await box(page,'[data-sec="A"]');if(b)await shot(page,'ar-secA-identity',b);
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1200);

/* compact responsive + collapsed right pane state */
await page.setViewportSize({width:760,height:900});await page.waitForTimeout(800);
lineage.viewport='760x900';
await shot(page,'compact-L1',{x:0,y:0,width:760,height:900});
b=await box(page,'[data-sec="C"]');if(b)await shot(page,'compact-secC',b);
const compact=await page.evaluate(()=>({hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
  steps:getComputedStyle(document.querySelector('.ma-steps')).gridTemplateColumns.split(' ').length,
  actions:[...document.querySelectorAll('[data-ma-disposition]')].every(x=>x.getBoundingClientRect().width>0),
  overlap:[...document.querySelectorAll('.ma-sec')].some(el=>el.scrollWidth>el.clientWidth+2)}));
await appendFile(path.join(OUT,'audit.json'),`\n${JSON.stringify({addendum:{lineage,compact,captures:out}},null,2)}`);
console.log(JSON.stringify({compact,captures:out.map(c=>({name:c.name,sha256:c.sha256,dims:c.dims}))},null,2));
await browser.close();server.kill();runtime.kill();
