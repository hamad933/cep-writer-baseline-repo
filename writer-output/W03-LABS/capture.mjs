/**
 * W03-LABS local visual capture harness (writer-local instrument).
 *
 * Renders the genuine local route `/?surface=labs` at matched viewports and both
 * first-class locales/directions, captures PNGs, and binds every capture to
 * candidate + commit + viewport + timestamp + image identity (path + sha256 + dims).
 *
 * Usage:
 *   node writer-output/W03-LABS/capture.mjs --label baseline
 *   node writer-output/W03-LABS/capture.mjs --label after --viewports 1505x1045,1280x860
 *   node writer-output/W03-LABS/capture.mjs --label after --locales en,ar
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
const outRoot=path.join(root,'writer-output/W03-LABS/evidence');
const args=process.argv.slice(2);
const argValue=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const label=argValue('--label')||'probe';
const viewports=(argValue('--viewports')||'1505x1045,1440x1000,1280x860,1024x800').split(',').map(v=>{const [w,h]=v.split('x').map(Number);return [w,h]});
const locales=(argValue('--locales')||'en,ar').split(',');
const surfaces=(argValue('--surfaces')||'labs').split(',');
/* Writer-private capture site (shared dist/ may be transiently red from another unit's file). */
const siteRoot=argValue('--root')||'/tmp/opencode/labs-site';

const commit=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim()}catch{return 'UNKNOWN'}};
const dirty=()=>{try{return execFileSync('git',['status','--porcelain','--','stack/native-typescript/surfaces/labs','stack/native-typescript/adapters/labs'],{cwd:root}).toString().trim()}catch{return ''}};
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const PREFS={
  en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},
  ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'},
};

const PROBE=()=>{
  const box=sel=>{const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),hidden:!!el.hidden}};
  const text=sel=>(document.querySelector(sel)?.innerText||'').replace(/\s+/g,' ').trim();
  return {
    dir:document.documentElement.dir||document.body.dir||'',
    lang:document.documentElement.lang||'',
    consumer:document.body.dataset.consumer||window.CEPFoundation?.consumer||null,
    left:text('#leftPane .pbody').slice(0,900),
    center:text('#centerPane').slice(0,1400),
    right:text('#rightPane .pbody').slice(0,900),
    toolbar:text('.toolbar').slice(0,500),
    bottom:text('#bottomShelf').slice(0,400),
    boxes:{
      left:box('#leftPane'),center:box('#centerPane'),right:box('#rightPane'),
      spatial:box('#m0StructuredSpatial'),toolbar:box('.toolbar'),bottom:box('#bottomShelf'),
      graph:box('[data-lab-graph]'),scen:box('.w03-lab'),
      leftRegion:box('#domainLeftRegion'),context:box('#domainContext')
    },
    counts:{
      navRows:document.querySelectorAll('#leftPane .pbody button,#leftPane .pbody [role=button]').length,
      graphNodes:document.querySelectorAll('[data-lab-graph] g[role=button],.w03-lab-node').length,
      cards:document.querySelectorAll('.w03-taskcard,.w03-node,.w03-lab-card').length
    },
    donors:{
      structurewrap:!!document.querySelector('.structurewrap'),
      kuList:!!document.querySelector('#kuList'),
      editorDocument:!!document.querySelector('#editorDocument')&&!document.querySelector('#editorDocument').hidden,
      m0DomainNav:!!document.querySelector('#leftPane .pbody .m0-domain-nav')
    },
    scroll:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ch:document.documentElement.clientHeight}
  };
};

const capture=async()=>{
  const dir=path.join(outRoot,label);
  await mkdir(dir,{recursive:true});
  const port=await freePort();
  const server=spawn(process.execPath,[path.join(root,'writer-output/W03-LABS/serve-site.mjs'),'--port',String(port),'--root',siteRoot],{cwd:root,stdio:'ignore'});
  await new Promise(r=>setTimeout(r,700));
  const browser=await chromium.launch();
  const frames=[];
  const ts=()=>new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  try{
    for(const surface of surfaces){
      for(const [width,height] of viewports){
        for(const locale of locales){
          const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
          await context.addInitScript(prefs=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:prefs}}))}catch{}},PREFS[locale]||PREFS.en);
          const page=await context.newPage();
          const pageErrors=[];
          page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
          const started=ts();
          await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`,{waitUntil:'networkidle'});
          await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,surface,{timeout:30000});
          await page.waitForTimeout(900);
          const info=await page.evaluate(PROBE);
          const file=`${surface}-${locale}-${width}x${height}-${started}.png`;
          const filePath=path.join(dir,file);
          await page.screenshot({path:filePath,fullPage:false});
          const bytes=await readFile(filePath);
          frames.push({
            surface,locale,viewport:`${width}x${height}`,
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
    schemaVersion:1,proof:'W03-LABS-CAPTURE',label,
    route:'/?surface=<surface>',
    renderMethod:'GENUINE_ROUTE_LOCAL_BROWSER',
    serveRoot:siteRoot,
    sharedDistWritten:false,
    commit:commit(),writableRootDiff:dirty(),
    node:process.version,viewportMatrix:viewports.map(v=>`${v[0]}x${v[1]}`),locales,
    capturedAt:new Date().toISOString(),
    frames
  };
  await writeFile(path.join(dir,'CAPTURE_MANIFEST.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({label,frames:frames.length,dir:path.relative(root,dir),commit:manifest.commit.slice(0,12)},null,2));
};

await capture();
