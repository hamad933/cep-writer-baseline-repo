/**
 * RES-1 evidence capture — Results studio presentation + live Results route.
 * Method: local static server (tools/serve.mjs on an ephemeral port) + Playwright Chromium
 * (cached). Every capture is hash-bound to the exact candidate commit/tree.
 *
 *   node writer-output/_coordinator/closure-T3/res1-capture.mjs
 */
import {createRequire} from 'node:module';
import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSourceIdentity} from '../../../tools/source-tree-identity.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');

const root=new URL('../../../',import.meta.url);
const rootPath=fileURLToPath(root);
const outDir=new URL('evidence/',new URL('./',import.meta.url));
const {sha256:treeSha256,files:canonicalSourceFileCount}=await canonicalSourceIdentity(root);
const commit=execSync('git rev-parse HEAD',{cwd:new URL('.',root).pathname}).toString().trim();
const stamp=()=>new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');

const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})});
/* dist-root server (tools/serve.mjs) for the live product route — same method as tools/w03-browser-flows.mjs */
const distPort=await freePort();
const distBase=`http://127.0.0.1:${distPort}`;
const distServer=spawn(process.execPath,[new URL('tools/serve.mjs',root).pathname,'--port',String(distPort)],{cwd:new URL('.',root),stdio:['ignore','pipe','pipe']});
/* repo-root server so the RES-1 studio harness (writer-output/W03-RESULTS) can import ../../dist/* */
const harnessPort=await freePort();
const harnessBase=`http://127.0.0.1:${harnessPort}`;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const harnessServer=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(rootPath,pathname.slice(1));
    if(!file.startsWith(rootPath))throw Error('outside root');
    const body=await readFile(file);
    res.writeHead(200,{'content-type':MIME[extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});
    res.end(body);
  }catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found')}
});
await new Promise(resolve=>harnessServer.listen(harnessPort,'127.0.0.1',resolve));
const waitForServer=async url=>{for(let i=0;i<100;i++){try{if((await fetch(url)).ok)return}catch{};await new Promise(r=>setTimeout(r,100))}throw Error(`PROOF_SERVER_DID_NOT_START:${url}`)};
await waitForServer(distBase);await waitForServer(`${harnessBase}/writer-output/W03-RESULTS/studio-harness.html`);

const VIEWPORTS=[{width:1440,height:1000},{width:1024,height:900}];
const LOCALES=[{lang:'en',dir:'ltr'},{lang:'ar',dir:'rtl'}];
const MODES=['result','replay','aar','compare'];
const shots=[];
const probes={studio:{},live:{},scrub:{}};
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
const dims=buffer=>({width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)});

const save=async(page,name,meta)=>{
  await mkdir(outDir,{recursive:true});
  const file=new URL(`${name}.png`,outDir);
  await page.screenshot({path:file.pathname,fullPage:false});
  const buffer=await readFile(file);
  const shot={id:name,path:`writer-output/W03-RESULTS/evidence/${name}.png`,sha256:sha(buffer),bytes:buffer.length,...dims(buffer),...meta,capturedAt:new Date().toISOString()};
  shots.push(shot);return shot;
};

const browser=await chromium.launch({headless:true});
try{
  /* ------------------------------------------------ studio presentation */
  for(const locale of LOCALES){
    for(const viewport of VIEWPORTS){
      const context=await browser.newContext({viewport,reducedMotion:'reduce'});
      const page=await context.newPage();
      const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
      await page.goto(`${harnessBase}/writer-output/W03-RESULTS/studio-harness.html?lang=${locale.lang}`,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>window.__ready===true,null,{timeout:20000});
      if(viewport.width===1440){
        const hashBefore=await page.evaluate(()=>window.__studio.hash());
        const scrub=await page.evaluate(()=>window.__studio.scrub());
        const hashAfter=await page.evaluate(()=>window.__studio.hash());
        probes.scrub[locale.lang]={hashBefore,hashAfter,identical:hashBefore===hashAfter,replayState:{state:scrub.state,index:scrub.index,event:scrub.event?.id??null,replayExecutesRuntime:scrub.replayExecutesRuntime,owner:scrub.replayOwner}};
      }
      for(const mode of MODES){
        await page.evaluate(m=>window.__studio.setMode(m),mode);
        await page.waitForTimeout(120);
        const dom=await page.evaluate(()=>({
          locale:document.documentElement.lang,
          dir:document.documentElement.dir,
          rootDir:document.querySelector('#studioMount')?.dir,
          mode:window.__studio.state().mode,
          ownership:document.querySelector('[data-results-ownership]')?.innerText||'',
          centerText:(document.querySelector('[data-results-center]')?.innerText||'').slice(0,400),
          contextText:(document.querySelector('[data-results-context]')?.innerText||'').slice(0,400),
          timelineStatus:document.querySelector('[data-timeline-replay-host]')?.dataset?.timelineStatus||null,
          truthClass:document.querySelector('[data-timeline-replay-host]')?.dataset?.truthClass||null,
          compareOwnerNote:document.querySelector('[data-compare-owner]')?.innerText||''
        }));
        probes.studio[`${mode}-${locale.lang}-${viewport.width}x${viewport.height}`]=dom;
        await save(page,`studio-${mode}-${locale.lang}-${locale.dir}-${viewport.width}x${viewport.height}`,{surface:'results',view:'studio-harness',mode,locale:locale.lang,dir:locale.dir,viewport:`${viewport.width}x${viewport.height}`,fixture:'RECORDED_CONSUMER_FIXTURE__NOT_PRODUCT_TRUTH'});
      }
      const proof=await page.evaluate(()=>window.STUDIO_PROOF);
      probes.studio[`proof-${locale.lang}`]={...proof,pageErrors};
      await context.close();
    }
  }

  /* ------------------------------------------------------------ live route */
  for(const locale of LOCALES){
    for(const viewport of VIEWPORTS){
      const context=await browser.newContext({viewport,reducedMotion:'reduce'});
      const page=await context.newPage();
      const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
      await page.goto(`${distBase}/?surface=results`,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>window.CEPFoundation?.consumer==='results',null,{timeout:20000});
      await page.evaluate(lang=>{
        CEPFoundation.preferences.set('locale',lang,'global');
        CEPFoundation.workspace.applyPreferences();
      },locale.lang);
      await page.waitForTimeout(250);
      const probe=await page.evaluate(()=>{
        const ids=['results.replay','results.step','results.compare','results.annotate','results.handoff','results.verifyDeterminism'];
        const availability=Object.fromEntries(ids.map(id=>[id,CEPFoundation.registry.availability(id,{})]));
        const review=CEPFoundation.registry.availability('reviews.decide',{});
        const before=JSON.stringify({relations:CEPFoundation.relations?{version:CEPFoundation.relations.version,records:CEPFoundation.relations.records.length}:null,stage:document.querySelector('[data-r6-workbench],.m0-workbench')?.innerText?.length||0});
        return {
          consumer:CEPFoundation.consumer,realStudio:CEPFoundation.m0Composition?.realStudio===true,
          locale:document.documentElement.lang,dir:document.documentElement.dir,
          providerState:CEPFoundation.m0Composition?.domain?.providerAvailability?.()?.state??null,
          replayOwner:CEPFoundation.sharedOwners?.timelineReplayOwner?.owner??null,
          compareOwner:CEPFoundation.sharedOwners?.analyticalCompareOwner?.owner??null,
          compareOwnerIsSingleton:CEPFoundation.sharedOwners?.analyticalCompareOwner===CEPFoundation.m0Composition?.domain?.compareOwner,
          replayOwnerIsSingleton:CEPFoundation.sharedOwners?.timelineReplayOwner===CEPFoundation.m0Composition?.domain?.replayOwner,
          availability,reviewAuthorityAvailable:review.enabled,canonicalBefore:before
        };
      });
      const after=await page.evaluate(()=>JSON.stringify({relations:CEPFoundation.relations?{version:CEPFoundation.relations.version,records:CEPFoundation.relations.records.length}:null,stage:document.querySelector('[data-r6-workbench],.m0-workbench')?.innerText?.length||0}));
      probe.canonicalAfter=after;
      probe.canonicalUnchanged=probe.canonicalBefore===after;
      probe.pageErrors=pageErrors;
      probes.live[`${locale.lang}-${viewport.width}x${viewport.height}`]=probe;
      await save(page,`live-results-${locale.lang}-${locale.dir}-${viewport.width}x${viewport.height}`,{surface:'results',view:'live-route',locale:locale.lang,dir:locale.dir,viewport:`${viewport.width}x${viewport.height}`,route:'/?surface=results'});
      await context.close();
    }
  }
}finally{
  try{await browser.close()}catch{}
  try{distServer.kill()}catch{}
  try{harnessServer.close()}catch{}
}

const receipt={
  schemaVersion:1,
  lane:'RES-1',
  unit:'W03-RESULTS',
  classification:'CANDIDATE_ONLY__NOT_OWNER_ACCEPTANCE',
  command:'node writer-output/_coordinator/closure-T3/res1-capture.mjs',
  commit,tree:treeSha256,canonicalSourceFileCount,
  environment:{node:process.version,engine:'Playwright Chromium',browserVersion:require('playwright/package.json').version,transport:'localhost-http over tools/serve.mjs (ephemeral port)',reducedMotion:true},
  viewports:VIEWPORTS.map(v=>`${v.width}x${v.height}`),
  locales:LOCALES.map(l=>`${l.lang}/${l.dir}`),
  modes:MODES,
  fixture:'RECORDED_CONSUMER_FIXTURE__NOT_PRODUCT_TRUTH — studio harness only; live route reports its own provider truth',
  probes,shots,
  summary:{shots:shots.length,hashBound:shots.every(s=>s.sha256&&s.bytes>0)}
};
await writeFile(new URL('CAPTURE_RECEIPT.json',new URL('./',import.meta.url)),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({commit,tree:treeSha256.slice(0,12),shots:shots.length,studioProof:probes.studio['proof-en'],liveEn:probes.live['en-1440x1000'],scrub:probes.scrub},null,2));
