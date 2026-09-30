/**
 * W05-RELEASES audit — renders the RELEASES surface in the real app shell and records
 * functional, structural, responsive and RTL/LTR truth with hash-bound captures.
 * Output: writer-output/W05-RELEASES/evidence/audit/*.png + audit.json
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
const OUT=path.join(root,'writer-output/W05-RELEASES/evidence/audit');
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
const deltaFiles=execSync('git status --porcelain -- stack/native-typescript/surfaces/releases stack/native-typescript/adapters/releases',{cwd:root}).toString().trim().split('\n').filter(Boolean);
const results={lineage:{commit,short,treeSha,branch:execSync('git branch --show-current',{cwd:root}).toString().trim(),capturedAt:new Date().toISOString(),viewport:'1536x1024',runtime:'playwright-chromium-headless',deltaFiles},checks:[],captures:[],geometry:{}};

const browser=await chromium.launch({headless:true});
const shot=async(page,name)=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file,fullPage:false});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);return rec;
};
const elShot=async(page,selector,name)=>{
  const el=await page.$(selector);
  if(!el){results.captures.push({name,error:'missing '+selector});return null}
  const file=path.join(OUT,`${name}.png`);
  await el.screenshot({path:file});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);return rec;
};
const push=(id,ok,detail)=>results.checks.push({id,status:ok?'PASS':'FAIL',detail});

const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
const pageErrors=[],consoleErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
await page.goto(`http://127.0.0.1:${port}/?surface=releases&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
try{await page.waitForFunction(()=>window.CEPFoundation?.consumer==='releases',undefined,{timeout:30000})}catch(e){push('function.route-opens-on-releases',false,String(e))}
await page.waitForTimeout(2600);

const measure=()=>page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  const style=(sel,props)=>{const e=document.querySelector(sel);if(!e)return null;const c=getComputedStyle(e);const o={};for(const p of props)o[p]=c[p];return o};
  const stage=document.querySelector('#foundationStage');
  const blocks=[...document.querySelectorAll('#foundationStage .rel-block')].map(b=>{const r=b.getBoundingClientRect();return {t:(b.querySelector('h2')?.textContent||'').trim(),w:Math.round(r.width),h:Math.round(r.height)}});
  const cardHeights=[...document.querySelectorAll('#domainLeftRegion .rel-cand')].map(c=>Math.round(c.getBoundingClientRect().height));
  return {
    consumer:window.CEPFoundation?.consumer||null,lang:document.documentElement.lang,dir:document.documentElement.dir,
    generic:{studio:!!stage?.querySelector('.m0-studio'),title:(stage?.querySelector('h1')?.textContent||'').trim()},
    regions:{banner:rect('#topBanner'),toolbar:rect('#domainToolbar'),left:rect('#leftPane'),stage:rect('#foundationStage'),right:rect('#rightPane'),bottom:rect('#bottomShelf')},
    center:{root:rect('.rel-root'),head:rect('.rel-head'),title:rect('.rel-title-row h1'),strip:rect('.rel-strip'),truths:rect('.rel-truths'),grid:rect('.rel-grid'),colA:rect('.rel-grid .rel-col:nth-child(1)'),colB:rect('.rel-grid .rel-col:nth-child(2)'),records:rect('#foundationStage .rel-block:last-of-type'),foot:rect('.rel-foot'),blocks,
      blockCount:blocks.length,stripFacts:document.querySelectorAll('.rel-strip .rel-f').length,truthCards:document.querySelectorAll('.rel-truth').length,
      gates:document.querySelectorAll('.rel-gate').length,resultRows:document.querySelectorAll('.rel-block .rel-r').length,steps:document.querySelectorAll('.rel-step').length,
      notes:document.querySelectorAll('.rel-notes li').length},
    left:{root:rect('#domainLeftRegion .rel-pane'),sections:document.querySelectorAll('#domainLeftRegion .rel-sec').length,
      stateRows:document.querySelectorAll('.rel-state').length,channels:document.querySelectorAll('.rel-chan').length,envs:document.querySelectorAll('.rel-env').length,
      cards:document.querySelectorAll('.rel-cand').length,cardHeights,search:rect('.rel-search input'),sort:rect('.rel-sort')},
    right:{root:rect('#domainContext .rel-ctx'),items:document.querySelectorAll('.rel-ctx-item').length,kv:document.querySelectorAll('.rel-ctx-kv').length,next:rect('.rel-ctx-next')},
    toolbar:[...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b=>({id:b.dataset.foundationCommand,label:(b.textContent||'').trim(),disabled:b.disabled,title:b.title})),
    type:{h1:style('.rel-title-row h1',['fontSize','fontWeight','lineHeight']),h2:style('.rel-block-h h2',['fontSize','fontWeight']),body:style('.rel-root',['fontSize','lineHeight','color']),meta:style('.rel-f>span',['fontSize','color'])},
    spacing:{rootGap:style('.rel-root',['rowGap','paddingTop','paddingInlineStart']),blockPad:style('.rel-block',['paddingTop','paddingInlineStart','borderRadius']),gridGap:style('.rel-grid',['columnGap','rowGap'])},
    overflow:{stageScroll:stage?stage.scrollHeight:0,stageClient:stage?stage.clientHeight:0,hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      clipped:[...document.querySelectorAll('#foundationStage *,#domainLeftRegion *,#domainContext *')].filter(e=>e.scrollWidth>e.clientWidth+4&&getComputedStyle(e).overflowX==='visible'&&e.clientWidth>0).map(e=>(e.className||e.tagName)+'').slice(0,8)}
  };
});

results.geometry.en=await measure();
push('structure.surface-owned-stage',results.geometry.en.generic.studio===false&&/REL-/.test(results.geometry.en.generic.title),results.geometry.en.generic);
push('structure.blocks',results.geometry.en.center.blockCount>=8&&results.geometry.en.center.stripFacts===4&&results.geometry.en.center.truthCards===3,results.geometry.en.center);
{
  const c=results.geometry.en.center;
  const twoCol=Boolean(c.colA&&c.colB&&c.colB.x>c.colA.x+50&&Math.abs(c.colA.h-c.colB.h)<900);
  push('structure.two-column-reference-composition',twoCol,{colA:c.colA,colB:c.colB});
  push('structure.center-density',c.grid.h<1700,{gridHeight:c.grid.h,note:'reference detail area is one scrollable workbench, not a 3000px single column'});
}
push('structure.left-pane',results.geometry.en.left.stateRows===6&&results.geometry.en.left.channels===3&&results.geometry.en.left.cards>=5,results.geometry.en.left);
{
  const h=results.geometry.en.left.cardHeights||[];
  push('structure.card-rhythm-uniform',h.length>=5&&Math.max(...h)-Math.min(...h)<=4,h);
}
push('structure.right-pane',results.geometry.en.right.items>=4&&results.geometry.en.right.kv>=3,results.geometry.en.right);
push('structure.toolbar-localized',results.geometry.en.toolbar.some(b=>b.label==='Inspect candidate'),results.geometry.en.toolbar);
await shot(page,'en-1536-top');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');s.scrollTop=s.scrollHeight});
await page.waitForTimeout(400);
await shot(page,'en-1536-bottom');
await page.evaluate(()=>{document.querySelector('#foundationStage').scrollTop=0});await page.waitForTimeout(300);
await elShot(page,'#leftPane','crop-left-en');
await elShot(page,'#foundationStage','crop-center-en');
await elShot(page,'#rightPane','crop-right-en');
await elShot(page,'.rel-strip','crop-strip-en');
await elShot(page,'.rel-truths','crop-truths-en');

/* ── FUNCTIONAL ── */
const title=()=>page.evaluate(()=>(document.querySelector('#foundationStage h1')?.textContent||'').trim());
const first=await title();
await page.click('#domainLeftRegion .rel-cands li:nth-child(3) .rel-cand');
await page.waitForTimeout(500);
const afterSelect=await title();
push('function.select-candidate-updates-workbench',afterSelect!==first&&/REL-/.test(afterSelect),{first,afterSelect});

await page.click('#domainLeftRegion .rel-state[data-rel-state="released"]');
await page.waitForTimeout(450);
const releasedCount=await page.evaluate(()=>({cards:document.querySelectorAll('.rel-cand').length,title:(document.querySelector('#foundationStage h1')?.textContent||'').trim(),selected:document.querySelector('.rel-state[data-rel-state="released"]')?.getAttribute('aria-pressed')}));
push('function.state-filter',releasedCount.cards===1&&/RC1/.test(releasedCount.title)&&releasedCount.selected==='true',releasedCount);

await page.click('#domainLeftRegion .rel-state[data-rel-state="released"]');
await page.waitForTimeout(400);
await page.click('#domainLeftRegion .rel-chan[data-rel-chan="beta"]');
await page.waitForTimeout(450);
const chanCount=await page.evaluate(()=>document.querySelectorAll('.rel-cand').length);
push('function.channel-filter',chanCount===2,{chanCount});
await page.click('#domainLeftRegion .rel-chan[data-rel-chan="beta"]');
await page.waitForTimeout(400);

await page.fill('#domainLeftRegion [data-rel-search]','zzzz');
await page.waitForTimeout(500);
const emptyState=await page.evaluate(()=>({cards:document.querySelectorAll('.rel-cand').length,
  empty:(document.querySelector('#foundationStage .rel-empty strong')?.textContent||document.querySelector('#domainLeftRegion .rel-empty-compact strong')?.textContent||'').trim(),
  focus:document.activeElement?.getAttribute('data-rel-search')!==null}));
push('function.empty-state-is-truthful',emptyState.cards===0&&emptyState.empty.length>0&&emptyState.focus,emptyState);
await shot(page,'en-empty-state');
await page.click('#foundationStage [data-rel-clear]').catch(()=>page.click('#domainLeftRegion [data-rel-clear]'));
await page.waitForTimeout(500);
const cleared=await page.evaluate(()=>({cards:document.querySelectorAll('.rel-cand').length,q:document.querySelector('[data-rel-search]')?.value}));
push('function.clear-filters',cleared.cards>=5&&cleared.q==='',cleared);

await page.click('#foundationStage [data-rel-tab="events"]');
await page.waitForTimeout(400);
const tabEvents=await page.evaluate(()=>({rows:document.querySelectorAll('#foundationStage .rel-block:last-of-type .rel-r').length,sel:document.querySelector('[data-rel-tab="events"]')?.getAttribute('aria-selected')}));
push('function.records-tab-events',tabEvents.sel==='true'&&tabEvents.rows>=4,tabEvents);
await shot(page,'en-records-events');
await page.click('#foundationStage [data-rel-tab="files"]');
await page.waitForTimeout(300);

await page.click('#foundationStage [data-rel-problems]');
await page.waitForTimeout(400);
const problems=await page.evaluate(()=>({pressed:document.querySelector('[data-rel-problems]')?.getAttribute('aria-pressed'),rows:document.querySelectorAll('.rel-block .rel-r').length}));
push('function.problems-only-toggle',problems.pressed==='true',problems);
await page.click('#foundationStage [data-rel-problems]');
await page.waitForTimeout(300);

const truthChip=await page.evaluate(()=>{const c=document.querySelector('.rel-chip[title]');return c?{tone:c.getAttribute('data-tone'),title:c.getAttribute('title')}:{missing:true}});
push('function.compare-truth-shown',!!truthChip.title&&/pinned|UNAVAILABLE|Select|bound/i.test(truthChip.title||''),truthChip);

/* command availability truth */
const availability=await page.evaluate(()=>[...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b=>({id:b.dataset.foundationCommand,disabled:b.disabled,title:b.title})));
push('function.command-availability-reasons',availability.filter(b=>b.disabled).every(b=>b.title&&b.title.length>3),availability);

/* ── RESPONSIVE ── */
for(const [name,viewport] of [['1280x860',{width:1280,height:860}],['1024x900',{width:1024,height:900}],['820x900',{width:820,height:900}]]){
  await page.setViewportSize(viewport);await page.waitForTimeout(700);
  const st=await page.evaluate(()=>({hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    gridCols:getComputedStyle(document.querySelector('.rel-grid')).gridTemplateColumns.split(' ').length,
    clipped:[...document.querySelectorAll('#foundationStage *,#domainLeftRegion *,#domainContext *')].filter(e=>e.scrollWidth>e.clientWidth+4&&getComputedStyle(e).overflowX==='visible'&&e.clientWidth>0).map(e=>`${e.tagName}.${(e.className||'').toString().split(' ').join('.')}:${(e.textContent||'').trim().slice(0,40)}`).slice(0,6),
    stageScroll:document.querySelector('#foundationStage').scrollHeight>document.querySelector('#foundationStage').clientHeight}));
  push(`responsive.${name}`,!st.hScroll&&st.clipped.length===0,st);
  await shot(page,`en-${name}`);
}
await page.setViewportSize({width:1536,height:1024});await page.waitForTimeout(700);

/* ── AR / RTL ── */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1400);
const ar=await page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),w:Math.round(r.width)}};
  const text=(document.querySelector('#foundationStage')?.textContent||'')+(document.querySelector('#domainLeftRegion')?.textContent||'')+(document.querySelector('#domainContext')?.textContent||'');
  return {lang:document.documentElement.lang,dir:document.documentElement.dir,
    arabicChars:(text.match(/[؀-ۿ]/g)||[]).length,totalChars:text.length,
    leftX:rect('#leftPane')?.x,rightX:rect('#rightPane')?.x,stageX:rect('#foundationStage')?.x,
    leftIsLeft:(rect('#leftPane')||{x:0}).x<(rect('#rightPane')||{x:1}).x,
    titleDir:getComputedStyle(document.querySelector('.rel-title-row h1')).direction,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    eyebrowTransform:getComputedStyle(document.querySelector('.rel-eyebrow')).textTransform,
    hScroll:document.querySelector('#foundationStage').scrollWidth>document.querySelector('#foundationStage').clientWidth+2};
});
push('rtl.document-direction',ar.lang==='ar'&&ar.dir==='rtl'&&ar.titleDir==='rtl',ar);
push('rtl.mirrors-and-no-overflow',ar.leftIsLeft===true&&ar.overflow===false&&ar.hScroll===false,ar);
push('rtl.no-allcaps-arabic',ar.eyebrowTransform==='none',ar.eyebrowTransform);
push('rtl.content-present',ar.arabicChars>400,{arabicChars:ar.arabicChars,totalChars:ar.totalChars});
results.geometry.ar=ar;
await shot(page,'ar-1536-top');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');s.scrollTop=s.scrollHeight});
await page.waitForTimeout(400);
await shot(page,'ar-1536-bottom');
await page.evaluate(()=>{document.querySelector('#foundationStage').scrollTop=0});await page.waitForTimeout(300);
await elShot(page,'#leftPane','crop-left-ar');
await elShot(page,'#foundationStage','crop-center-ar');
await elShot(page,'#rightPane','crop-right-ar');

/* back to EN and verify no Arabic leakage in the surface */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1300);
const enText=await page.evaluate(()=>((document.querySelector('#foundationStage')?.textContent||'')+(document.querySelector('#domainLeftRegion')?.textContent||'')+(document.querySelector('#domainContext')?.textContent||'')+(document.querySelector('#domainToolbar')?.textContent||'')));
push('ltr.no-arabic-leakage',((enText.match(/[؀-ۿ]/g)||[]).length===0),{arabicChars:(enText.match(/[؀-ۿ]/g)||[]).length,sample:enText.slice(0,180)});
const roundTrip=await page.evaluate(()=>(document.querySelector('#foundationStage')?.textContent||'').length);
results.geometry.enTextLength=roundTrip;

push('function.page-errors-none',pageErrors.length===0,pageErrors.slice(0,8));
results.consoleErrors=consoleErrors.slice(0,8);
await writeFile(path.join(OUT,'audit.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.checks.map(c=>({id:c.id,status:c.status})),captures:results.captures.length},null,2));
await browser.close();
server.kill();runtime.kill();
