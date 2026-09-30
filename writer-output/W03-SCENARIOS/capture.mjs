/**
 * W03-SCENARIOS local visual capture harness (writer-local instrument).
 *
 * Renders the genuine local route `/?surface=scenarios` at matched viewports and
 * both first-class locales/directions, captures PNGs, and binds every capture to
 * candidate + commit + viewport + timestamp + image identity (path + sha256 + dims).
 *
 * Usage:
 *   node writer-output/W03-SCENARIOS/capture.mjs --label baseline
 *   node writer-output/W03-SCENARIOS/capture.mjs --label after --viewports 1505x1045,1280x860,1024x800
 *   node writer-output/W03-SCENARIOS/capture.mjs --label after --surfaces scenarios --locales en,ar
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
const outRoot=path.join(root,'writer-output/W03-SCENARIOS/evidence');
const args=process.argv.slice(2);
const argValue=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const label=argValue('--label')||'probe';
const viewports=(argValue('--viewports')||'1505x1045,1440x1000,1280x860,1024x800').split(',').map(v=>{const [w,h]=v.split('x').map(Number);return [w,h]});
const locales=(argValue('--locales')||'en,ar').split(',');
const surfaces=(argValue('--surfaces')||'scenarios').split(',');

const commit=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim()}catch{return 'UNKNOWN'}};
const dirty=()=>{try{return execFileSync('git',['status','--porcelain','--','stack/native-typescript/surfaces/scenarios','stack/native-typescript/adapters/scenarios','stack/native-typescript/surfaces/composition/w03-rescue.ts'],{cwd:root}).toString().trim()}catch{return ''}};
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const PREFS={
  en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},
  ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'},
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
          await page.waitForTimeout(700);
          const info=await page.evaluate(()=>({
            dir:document.documentElement.dir||document.body.dir||'',
            lang:document.documentElement.lang||'',
            consumer:document.body.dataset.consumer||window.CEPFoundation?.consumer||null,
            left:(document.querySelector('#leftPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,600),
            center:(document.querySelector('#centerPane')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,900),
            right:(document.querySelector('#rightPane .pbody')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,600),
            toolbar:(document.querySelector('.toolbar')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,400),
            scroll:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ch:document.documentElement.clientHeight}
          }));
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
    schemaVersion:1,proof:'W03-SCENARIOS-CAPTURE',label,
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
