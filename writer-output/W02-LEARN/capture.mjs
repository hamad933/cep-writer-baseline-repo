/**
 * W02-LEARN local visual capture harness (writer-local instrument).
 *
 * Renders the genuine local route `/?surface=learn` at matched viewports and both
 * first-class locales/directions, captures PNGs, and binds every capture to
 * candidate + commit + viewport + timestamp + image identity (path + sha256 + dims).
 *
 * Usage:
 *   node writer-output/W02-LEARN/capture.mjs --label baseline
 *   node writer-output/W02-LEARN/capture.mjs --label after --viewports 1505x1045,1280x860
 *   node writer-output/W02-LEARN/capture.mjs --label after --locales en,ar
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
const outRoot=path.join(root,'writer-output/W02-LEARN/evidence');
const args=process.argv.slice(2);
const argValue=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const label=argValue('--label')||'probe';
const viewports=(argValue('--viewports')||'1505x1045,1440x1000,1280x860,1024x800').split(',').map(v=>{const [w,h]=v.split('x').map(Number);return [w,h]});
const locales=(argValue('--locales')||'en,ar').split(',');
const surfaces=(argValue('--surfaces')||'learn').split(',');

const commit=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim()}catch{return 'UNKNOWN'}};
const dirty=()=>{try{return execFileSync('git',['status','--porcelain','--','stack/native-typescript/surfaces/learn','stack/native-typescript/adapters/learn.ts','stack/native-typescript/adapters/context-learn-structured.ts'],{cwd:root}).toString().trim()}catch{return ''}};
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
    sourceAvailable:window.CEPFoundation?.learn?.sourceAvailable??null,
    left:text('#leftPane .pbody').slice(0,1600),
    leftOrder:[...document.querySelectorAll('#leftPane .pbody > *')].map(n=>({tag:n.tagName,id:n.id||'',cls:(n.className||'').toString().slice(0,40),hidden:!!n.hidden,h:Math.round(n.getBoundingClientRect().height)})),
    center:text('#centerPane').slice(0,2600),
    right:text('#rightPane .pbody').slice(0,1600),
    inspector:(document.querySelector('#wave3ContextInspectorHost')?.innerText||'').replace(/\s+/g,' ').slice(0,900),
    scopeHidden:!!document.querySelector('#rightPane .contextscope')?.hidden,
    toolbar:text('.toolbar').slice(0,600),
    banner:text('#topBanner').slice(0,600),
    bannerParts:{
      secondary:(document.querySelector('#topBanner .secondary')?.innerText||'').replace(/\s+/g,' ').slice(0,240),
      secondaryDisplay:document.querySelector('#topBanner .secondary')?getComputedStyle(document.querySelector('#topBanner .secondary')).display:'missing',
      tags:(document.querySelector('#topBanner .tags')?.innerText||'').replace(/\s+/g,' ').slice(0,240),
      tagsDisplay:document.querySelector('#topBanner .tags')?getComputedStyle(document.querySelector('#topBanner .tags')).display:'missing',
      state:document.querySelector('#topBanner')?.getAttribute('data-state')
    },
    bottom:text('#bottomShelf').slice(0,800),
    boxes:{
      left:box('#leftPane'),center:box('#centerPane'),right:box('#rightPane'),toolbar:box('.toolbar'),bottom:box('#bottomShelf'),
      leftRegion:box('#domainLeftRegion'),context:box('#domainContext'),
      practice:box('.learn-practice'),editor:box('#editorDocument'),docScroll:box('#docScroll'),
      learnRail:box('[data-learn="rail"]'),learnCanvas:box('[data-learn="canvas"]'),learnCtx:box('[data-learn="context"]'),
      work:box('[data-learn="work"]'),wave3Host:box('#wave3ContextInspectorHost'),pathHead:box('.lsr-pathhead'),objective:box('.lsr-objective'),practicePanel:box('.lsr-panel')
    },
    counts:{
      leftRows:document.querySelectorAll('#leftPane .pbody button,#leftPane .pbody [role=button]').length,
      accordion:document.querySelectorAll('[data-learn-lesson]').length,
      blocks:document.querySelectorAll('#blockList [data-block-id]').length
    },
    donors:{
      kuList:!!document.querySelector('#kuList'),
      m0DomainNav:!!document.querySelector('#leftPane .pbody .m0-domain-nav'),
      donorOutline:!!document.querySelector('#learnStructureTree'),
      editorVisible:!!document.querySelector('#editorDocument')&&!document.querySelector('#editorDocument').hidden
    },
    scroll:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ch:document.documentElement.clientHeight},
    overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth+1
  };
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
    schemaVersion:1,proof:'W02-LEARN-CAPTURE',label,
    route:'/?surface=<surface>',
    renderMethod:'GENUINE_ROUTE_LOCAL_BROWSER',
    commit:commit(),writableRootDiff:dirty(),
    node:process.version,viewportMatrix:viewports.map(v=>`${v[0]}x${v[1]}`),locales,
    capturedAt:new Date().toISOString(),
    frames
  };
  await writeFile(path.join(dir,'CAPTURE_MANIFEST.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({label,frames:frames.length,dir:path.relative(root,dir),commit:manifest.commit.slice(0,12)},null,2));
};

await capture();
