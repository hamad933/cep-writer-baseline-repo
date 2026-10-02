/**
 * W03-RUNS local visual capture harness (writer-local instrument).
 *
 * Renders the genuine local route `/?surface=runs` at matched viewports and both
 * first-class locales/directions, captures PNGs, and binds every capture to
 * candidate + commit + viewport + timestamp + image identity (path+sha256+dims).
 *
 * Usage:
 *   node writer-output/W03-RUNS/capture.mjs --label baseline
 *   node writer-output/W03-RUNS/capture.mjs --label final --states operations
 *   node writer-output/W03-RUNS/capture.mjs --label final --viewports 1505x1045,1280x860
 */
import {createRequire} from 'node:module';
import {spawn, execFileSync} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright')}catch(e){const o=process.env.CEP_PLAYWRIGHT_MODULE_PATH;if(!o)throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${e.message}`);playwright=require(path.resolve(o))}
const {chromium}=playwright;

const root=fileURLToPath(new URL('../../',import.meta.url));
const outRoot=path.join(root,'writer-output/W03-RUNS/evidence');
const args=process.argv.slice(2);
const argValue=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const label=argValue('--label')||'probe';
const viewports=(argValue('--viewports')||'1505x1045').split(',').map(v=>{const [w,h]=v.split('x').map(Number);return [w,h]});
const locales=(argValue('--locales')||'en,ar').split(',');
const states=(argValue('--states')||'operations').split(',');

const commit=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim()}catch{return 'UNKNOWN'}};
const dirty=()=>{try{return execFileSync('git',['status','--porcelain','--','stack/native-typescript/surfaces/runs','stack/native-typescript/adapters/runs'],{cwd:root}).toString().trim()}catch{return ''}};
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const PREFS={
  en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},
  ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'},
};

/** Switch the runs workspace into a named mode (data-runs-tab id) before capture. */
const applyState=async(page,state)=>{
  if(state==='operations')return;
  const id=state.replace(/^mode:/,'');
  const clicked=await page.evaluate(name=>{
    const tab=document.querySelector(`[data-runs-tab="${name}"]`);
    if(!tab)return false;tab.click();return true;
  },id);
  if(!clicked)console.warn(`state tab not found: ${state}`);
  await page.waitForTimeout(450);
};

const capture=async()=>{
  const dir=path.join(outRoot,label);
  await mkdir(dir,{recursive:true});
  const port=await freePort();
  const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
  const browser=await chromium.launch();
  const frames=[];
  const ts=()=>new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  try{
    for(const [width,height] of viewports){
      for(const locale of locales){
        for(const state of states){
          const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
          await context.addInitScript(prefs=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:prefs}}))}catch{}},PREFS[locale]||PREFS.en);
          const page=await context.newPage();
          const pageErrors=[];
          page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
          const started=ts();
          // GENUINE_ROUTE navigation: domcontentloaded + explicit consumer gate. `networkidle` is
          // not used because the foundation platform probe (GET /v1/platform/input-direction →
          // 127.0.0.1:4174) keeps a request in flight whenever a local runtime (this lane's or a
          // sibling lane's) answers slowly or not at all on the shared machine.
          await page.goto(`http://127.0.0.1:${port}/?surface=runs`,{waitUntil:'domcontentloaded',timeout:45000});
          await page.waitForFunction(()=>window.CEPFoundation?.consumer==='runs',null,{timeout:45000});
          await page.waitForTimeout(700);
          await applyState(page,state);
          const info=await page.evaluate(()=>({
            dir:document.documentElement.dir||document.body.dir||'',
            lang:document.documentElement.lang||'',
            consumer:document.body.dataset.consumer||window.CEPFoundation?.consumer||null,
            left:(document.querySelector('#leftPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
            center:(document.querySelector('#centerPane')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,1400),
            right:(document.querySelector('#rightPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
            toolbar:(document.querySelector('.toolbar')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
            scroll:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ch:document.documentElement.clientHeight}
          }));
          const file=`runs-${locale}-${state}-${width}x${height}-${started}.png`;
          const filePath=path.join(dir,file);
          await page.screenshot({path:filePath,fullPage:false});
          const bytes=await readFile(filePath);
          frames.push({
            locale,viewport:`${width}x${height}`,state,
            path:path.relative(root,filePath),
            bytes:bytes.length,
            sha256:createHash('sha256').update(bytes).digest('hex'),
            capturedAt:started,
            pageErrors,info
          });
          await context.close();
        }
      }
    }
  }finally{await browser.close();server.kill()}

  const manifest={
    schemaVersion:1,proof:'W03-RUNS-CAPTURE',label,
    route:'/?surface=runs',
    renderMethod:'GENUINE_ROUTE_LOCAL_BROWSER',
    commit:commit(),writableRootDiff:dirty(),
    node:process.version,viewportMatrix:viewports.map(v=>`${v[0]}x${v[1]}`),locales,states,
    capturedAt:new Date().toISOString(),
    frames
  };
  await writeFile(path.join(dir,'CAPTURE_MANIFEST.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({label,frames:frames.length,dir:path.relative(root,dir),commit:manifest.commit.slice(0,12)},null,2));
};

await capture();
