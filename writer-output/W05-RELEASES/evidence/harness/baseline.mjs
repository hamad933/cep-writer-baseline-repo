/**
 * W05-RELEASES baseline capture — the CURRENT (pre-change) releases surface.
 * Binds every capture to candidate + commit/tree + viewport + timestamp + image identity.
 * Output: writer-output/W05-RELEASES/evidence/baseline/*.png + baseline.json
 */
import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const OUT=path.join(root,'writer-output/W05-RELEASES/evidence/baseline');
await mkdir(OUT,{recursive:true});

const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort(),runtimePort=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime=spawn(process.execPath,[path.join(root,'stack/local-runtime/server.mjs')],{cwd:root,env:{...process.env,CEP_LOCAL_RUNTIME_PORT:String(runtimePort),CEP_SQLITE_PATH:path.join(root,'writer-output/W05-RELEASES/.runtime-proof/probe.sqlite')},stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const commit=execSync('git rev-parse HEAD',{cwd:root}).toString().trim();
const short=execSync('git rev-parse --short HEAD',{cwd:root}).toString().trim();
const treeSha=execSync('git rev-parse HEAD:stack/native-typescript',{cwd:root}).toString().trim();
const results={lineage:{commit,short,treeSha,branch:execSync('git branch --show-current',{cwd:root}).toString().trim(),capturedAt:new Date().toISOString(),viewport:'1536x1024',runtime:'playwright-chromium-headless',stage:'BASELINE (before W05-RELEASES edits)'},checks:[],captures:[],geometry:{}};

const browser=await chromium.launch({headless:true});
const shot=async(page,name)=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file,fullPage:false});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);return rec;
};
const elShot=async(page,selector,name)=>{
  const el=await page.$(selector);if(!el){results.captures.push({name,error:'missing '+selector});return null}
  const file=path.join(OUT,`${name}.png`);await el.screenshot({path:file});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);return rec;
};

const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')pageErrors.push('console:'+m.text())});
await page.goto(`http://127.0.0.1:${port}/?surface=releases&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
try{await page.waitForFunction(()=>window.CEPFoundation?.consumer==='releases',undefined,{timeout:30000})}catch(e){results.checks.push({id:'function.route-opens-on-releases',status:'FAIL',detail:String(e)})}
await page.waitForTimeout(2500);

const probe=await page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  const stage=document.querySelector('#foundationStage');
  const text=(sel)=>{const e=document.querySelector(sel);return e?(e.textContent||'').trim().slice(0,400):null};
  return {
    consumer:window.CEPFoundation?.consumer||null,
    lang:document.documentElement.lang,dir:document.documentElement.dir,
    regions:{banner:rect('#topBanner'),toolbar:rect('#domainToolbar'),left:rect('#leftPane'),stage:rect('#foundationStage'),right:rect('#rightPane'),bottom:rect('#bottomShelf')},
    genericWorkbench:{
      studio:!!document.querySelector('.m0-studio'),
      studioTitle:text('.m0-studio-head h1'),
      workbenchHeading:text('.m0-workbench h2'),
      summary:text('.m0-studio-head p'),
      collectionPanel:!!document.querySelector('.m0-collection-panel'),
      tableRows:document.querySelectorAll('.m0-table tbody tr').length,
      contextPanel:!!document.querySelector('.m0-context-panel')
    },
    stageOwned:!!stage?.querySelector('[data-w05-owned="releases"]'),
    stageScroll:{h:stage?.scrollHeight,client:stage?.clientHeight},
    hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    leftText:text('#leftPane'),rightText:text('#domainContext'),
    banner:{title:text('#topBanner .title'),badge:text('#topBanner .badge'),detail:text('#topBanner .lock span')},
    toolbarButtons:[...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b=>({id:b.dataset.foundationCommand,label:(b.textContent||'').trim()})),
    stageHtmlLength:stage?stage.innerHTML.length:0
  };
});
results.geometry.baseline=probe;
results.checks.push({id:'function.route-opens-on-releases',status:probe.consumer==='releases'?'PASS':'FAIL',detail:probe.consumer});
results.checks.push({id:'structure.surface-owned-stage',status:probe.stageOwned?'PASS':'FAIL',detail:{stageOwned:probe.stageOwned,generic:probe.genericWorkbench.studio,title:probe.genericWorkbench.studioTitle}});
results.checks.push({id:'structure.page-errors',status:pageErrors.length===0?'PASS':'FAIL',detail:pageErrors.slice(0,10)});

await shot(page,'baseline-1536-top');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');if(s)s.scrollTop=s.scrollHeight});
await page.waitForTimeout(400);
await shot(page,'baseline-1536-bottom');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');if(s)s.scrollTop=0});await page.waitForTimeout(300);
await elShot(page,'#leftPane','crop-left');
await elShot(page,'#foundationStage','crop-center');
await elShot(page,'#rightPane','crop-right');

/* responsive baseline */
for(const [name,viewport] of [['1280x860',{width:1280,height:860}],['1024x900',{width:1024,height:900}],['820x900',{width:820,height:900}]]){
  await page.setViewportSize(viewport);await page.waitForTimeout(600);
  const st=await page.evaluate(()=>({hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    overlap:[...document.querySelectorAll('#foundationStage *')].some(e=>e.scrollWidth>e.clientWidth+4&&getComputedStyle(e).overflowX==='visible').valueOf(),
    stageScroll:document.querySelector('#foundationStage')?.scrollHeight}));
  results.checks.push({id:`responsive.${name}`,status:!st.hScroll?'PASS':'FAIL',detail:st});
  await shot(page,`baseline-${name}`);
}
await page.setViewportSize({width:1536,height:1024});await page.waitForTimeout(600);

/* AR / RTL baseline */
try{
  await page.evaluate(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences()});
  await page.waitForTimeout(1200);
  const ar=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,
    leftIsLeft:document.querySelector('#leftPane').getBoundingClientRect().x<document.querySelector('#rightPane').getBoundingClientRect().x,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}));
  results.checks.push({id:'rtl.baseline',status:'PASS',detail:ar});
  await shot(page,'baseline-ar-1536');
}catch(e){results.checks.push({id:'rtl.baseline',status:'FAIL',detail:String(e)})}

results.checks.push({id:'function.page-errors',status:pageErrors.length===0?'PASS':'FAIL',detail:pageErrors.slice(0,10)});
await writeFile(path.join(OUT,'baseline.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.checks,captures:results.captures.length,geometry:results.geometry.baseline.genericWorkbench},null,2));
await browser.close();
server.kill();runtime.kill();
