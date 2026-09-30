/**
 * W03-RUNS candidate mount harness (writer-local instrument).
 *
 * WHY: `renderRunsSurface` is not mounted by the live route — `main.ts` /
 * `surfaces/m0-controller-composition.ts` are writer-forbidden and the mount hunk is filed at
 * `writer-output/W03-RUNS/SERIALIZED_HOTSPOT_REQUEST.md` (H-RUN-1). This harness performs the
 * exact hunk in-page so the candidate composition can be rendered, captured and compared.
 *
 * CLASS: FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__GENUINE_ROUTE_SHELL__CANDIDATE_SURFACE_MOUNT__
 *        __NOT_A_COORDINATOR_APPLIED_MOUNT.
 * The shell chrome (top nav, sub-nav, toolbar, panes, bottom shelf) is the genuine route; only
 * the runs composition mount is simulated. This is stated on every capture manifest.
 *
 * Usage: node writer-output/W03-RUNS/mount.mjs --label candidate [--viewports 1505x1045] [--locales en,ar]
 */
import {createRequire} from 'node:module';
import {spawn, execFileSync} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const outRoot=path.join(root,'writer-output/W03-RUNS/evidence');
const args=process.argv.slice(2);
const argValue=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const label=argValue('--label')||'candidate';
const viewports=(argValue('--viewports')||'1505x1045').split(',').map(v=>{const [w,h]=v.split('x').map(Number);return [w,h]});
const locales=(argValue('--locales')||'en,ar').split(',');
const states=(argValue('--states')||'operations').split(',');
const panes=argValue('--panes')||'default';

const commit=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim()}catch{return 'UNKNOWN'}};
const dirty=()=>{try{return execFileSync('git',['status','--porcelain','--','stack/native-typescript/surfaces/runs','stack/native-typescript/adapters/runs'],{cwd:root}).toString().trim()}catch{return ''}};
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const PREFS={en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'}};
const PANE_OVERRIDE=panes==='refmatched'?{leftWidth:236,rightWidth:300}:{};
const ts=()=>new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');

const MOUNT=async state=>{
  const cf=window.CEPFoundation;
  if(!cf)throw new Error('CEPFoundation unavailable');
  const [{W03RunDomain},{composeRunsSurface},{renderRunsSurface}]=await Promise.all([
    import('/adapters/runs/domain.js'),
    import('/surfaces/runs/index.js'),
    import('/surfaces/runs/presentation.js')
  ]);
  const domain=new W03RunDomain({runtime:cf.simulation,sessionOwner:cf.sharedOwners?.operationalSessionOwner||undefined});
  const composition=composeRunsSurface({domain,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
  const stage=document.querySelector('#foundationStage')||document.querySelector('#centerPane');
  const controller=renderRunsSurface(stage,composition,{
    dir:document.documentElement.dir||'ltr',
    workspace:cf.workspace&&typeof cf.workspace.region==='function'?cf.workspace:null,
    initialView:state==='operations'?null:state
  });
  window.__RUNS_MOUNT={ok:true,mode:controller.mode(),state:controller.state(),domainOwner:domain.owner};
  return window.__RUNS_MOUNT;
};

const capture=async()=>{
  const dir=path.join(outRoot,label);
  await mkdir(dir,{recursive:true});
  const port=await freePort();
  const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
  await new Promise(r=>setTimeout(r,900));
  const browser=await chromium.launch();
  const frames=[];
  try{
    for(const [width,height] of viewports){
      for(const locale of locales){
        for(const state of states){
          const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
          await context.addInitScript(prefs=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:prefs}}))}catch{}},{...(PREFS[locale]||PREFS.en),...PANE_OVERRIDE});
          const page=await context.newPage();
          const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
          const started=ts();
          await page.goto(`http://127.0.0.1:${port}/?surface=runs`,{waitUntil:'networkidle'});
          await page.waitForFunction(()=>window.CEPFoundation?.consumer==='runs',null,{timeout:30000});
          await page.waitForTimeout(600);
          let mount=null,mountError=null;
          try{mount=await page.evaluate(MOUNT,state)}catch(e){mountError=String(e?.message||e)}
          await page.waitForTimeout(700);
          const info=await page.evaluate(()=>{
            const q=s=>document.querySelector(s);
            const rect=s=>{const n=q(s);if(!n)return null;const r=n.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)}};
            return {
              dir:document.documentElement.dir||'',lang:document.documentElement.lang||'',
              consumer:window.CEPFoundation?.consumer||null,
              left:(q('#leftPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
              center:(q('#centerPane')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,2000),
              right:(q('#rightPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
              toolbar:(q('.toolbar')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,400),
              mounts:{workspace:!!q('.runs-workspace'),tabs:document.querySelectorAll('.runs-tab').length,
                alerts:document.querySelectorAll('tr[data-select]').length,
                navItems:document.querySelectorAll('[data-runs-region] [data-view]').length,
                terminalTray:!!q('[data-runs-terminal]'),operationalHostInTray:!!q('[data-runs-terminal] #operationalHost')},
              rects:{workspace:rect('.runs-workspace'),split:rect('.runs-split'),bar:rect('.runs-bar'),identity:rect('.runs-identity'),
                leftPane:rect('#leftPane'),rightPane:rect('#rightPane'),terminal:rect('[data-runs-terminal]')},
              scroll:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ch:document.documentElement.clientHeight}
            };
          });
          const file=`runs-${locale}-${state}-${width}x${height}-${started}.png`;
          const filePath=path.join(dir,file);
          await page.screenshot({path:filePath,fullPage:false});
          const bytes=await readFile(filePath);
          frames.push({locale,viewport:`${width}x${height}`,state,path:path.relative(root,filePath),
            bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),
            capturedAt:started,mount,mountError,pageErrors,info});
          await context.close();
        }
      }
    }
  }finally{await browser.close();server.kill()}
  const manifest={schemaVersion:1,proof:'W03-RUNS-CANDIDATE-MOUNT',label,
    classification:'FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__GENUINE_ROUTE_SHELL__CANDIDATE_SURFACE_MOUNT__NOT_A_COORDINATOR_APPLIED_MOUNT',
    route:'/?surface=runs',renderMethod:'GENUINE_ROUTE_SHELL + IN-PAGE CANDIDATE MOUNT (equivalent of SERIALIZED_HOTSPOT_REQUEST H-RUN-1)',
    mountSeamRequest:'writer-output/W03-RUNS/SERIALIZED_HOTSPOT_REQUEST.md#h-run-1',
    paneState:panes,paneOverride:PANE_OVERRIDE,
    commit:commit(),writableRootDiff:dirty(),node:process.version,
    viewportMatrix:viewports.map(v=>`${v[0]}x${v[1]}`),locales,states,
    capturedAt:new Date().toISOString(),frames};
  await writeFile(path.join(dir,'CAPTURE_MANIFEST.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({label,frames:frames.length,dir:path.relative(root,dir),commit:manifest.commit.slice(0,12)},null,2));
};
await capture();
