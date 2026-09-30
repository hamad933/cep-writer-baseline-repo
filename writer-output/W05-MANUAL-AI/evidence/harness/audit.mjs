/* W05-MANUAL-AI audit — functional · structural · responsive · RTL/LTR evidence.
   Every capture is bound to candidate + commit + tree + viewport + timestamp + image identity. */
import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
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

const commit=execSync('git rev-parse HEAD',{cwd:root}).toString().trim();
const short=execSync('git rev-parse --short HEAD',{cwd:root}).toString().trim();
const treeSha=execSync('git rev-parse HEAD:stack/native-typescript',{cwd:root}).toString().trim();
const dirty=execSync('git status --porcelain -- stack/native-typescript/surfaces/manual_ai stack/native-typescript/adapters/manual_ai',{cwd:root}).toString().trim();
const R={lineage:{unit:'W05-MANUAL-AI',surface:'manual_ai',commit,short,treeSha,branch:execSync('git branch --show-current',{cwd:root}).toString().trim(),
  dirtyFiles:dirty?dirty.trim().split('\n').length:0,dirty,argv:process.argv[2]||'audit',capturedAt:new Date().toISOString(),
  viewport:'1536x1024',runtime:'playwright-chromium-headless',host:'linux'},checks:[],captures:[]};
const push=(id,ok,detail)=>R.checks.push({id,status:ok?'PASS':'FAIL',detail});
const safeClick=async(sel,timeout=8000)=>{try{await page.click(sel,{timeout});return true}catch(e){R.checks.push({id:`click.${sel}`,status:'FAIL',detail:String(e).slice(0,160)});return false}};
const shot=async(page,name,opts={})=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file,fullPage:false,...opts});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  R.captures.push(rec);return rec;
};

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
const consoleErrors=[];page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
await page.goto(`http://127.0.0.1:${port}/?surface=manual_ai&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='manual_ai',undefined,{timeout:30000});
await page.waitForTimeout(2400);

/* ── FUNCTIONAL / STRUCTURAL ─────────────────────────────────────────────────────────── */
const snap=()=>page.evaluate(()=>{
  const stage=document.querySelector('#foundationStage');
  return {consumer:CEPFoundation.consumer,lang:document.documentElement.lang,dir:document.documentElement.dir,
    owned:stage?.getAttribute('data-ma-owned'),leftOwned:document.querySelector('#domainLeftRegion')?.getAttribute('data-ma-owned'),
    rightOwned:document.querySelector('#domainContext')?.getAttribute('data-ma-owned'),
    selected:document.querySelector('.ma-root')?.getAttribute('data-selected'),
    state:document.querySelector('.ma-root')?.getAttribute('data-state'),
    sections:[...document.querySelectorAll('.ma-sec')].map(s=>s.getAttribute('data-sec')),
    records:document.querySelectorAll('[data-ma-record]').length,
    facets:[...document.querySelectorAll('[data-ma-facet]')].map(b=>({id:b.dataset.maFacet,n:Number(b.querySelector('.ma-fcount')?.textContent||0)})),
    steps:[...document.querySelectorAll('.ma-steps li')].map(li=>li.dataset.s),
    dispositions:[...document.querySelectorAll('[data-ma-disposition]')].map(b=>({d:b.dataset.maDisposition,disabled:!!b.disabled})),
    toolbar:[...document.querySelectorAll('#domainToolbar button')].map(b=>({id:b.dataset.foundationCommand,label:b.textContent.trim(),disabled:!!b.disabled,primary:b.dataset.maPrimary||null})),
    cards:document.querySelectorAll('#domainContext .ma-card').length,
    generic:{groups:document.querySelectorAll('#foundationStage .m0-semantic-group').length,table:document.querySelectorAll('#domainLeftRegion table').length},
    banner:{title:document.querySelector('#topBanner .title')?.textContent,badge:document.querySelector('#topBanner .badge')?.textContent},
    bottom:{title:document.querySelector('#bottomShelf .bottomtitle')?.textContent,summary:document.querySelector('#bottomSummary')?.textContent},
    overflow:{h:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,stage:stage?stage.scrollHeight>stage.clientHeight+1:false}};
});
const s0=await snap();R.initial=s0;
push('function.route-opens-on-manual_ai',s0.consumer==='manual_ai',s0.consumer);
push('structure.surface-owned-not-generic',s0.owned==='manual_ai'&&s0.leftOwned==='manual_ai'&&s0.rightOwned==='manual_ai'&&s0.generic.groups===0&&s0.generic.table===0,{owned:s0.owned,generic:s0.generic});
push('structure.lettered-workbench-A-E',s0.sections.join(',').replace(/,$/,'')==='A,B,C,D,E',s0.sections);
push('structure.records-and-facets',s0.records===8&&s0.facets[0]?.n===8&&s0.facets.length===8,{records:s0.records,facets:s0.facets});
push('structure.governance-cards',s0.cards>=8,s0.cards);
push('structure.no-page-errors',pageErrors.length===0,pageErrors.slice(0,5));
push('structure.no-console-errors',consoleErrors.filter(e=>!/ERR_CONNECTION_REFUSED/.test(e)).length===0,consoleErrors.slice(0,4));
push('structure.exchange-stepper-7',s0.steps.length===7,s0.steps);
push('structure.toolbar-single-home',s0.toolbar.length===4&&s0.toolbar.filter(b=>b.id==='manual_ai.review').length===0,s0.toolbar);
push('structure.banner-identity',/Manual AI Bridge/.test(s0.banner.title||'')&&s0.banner.badge==='AI',s0.banner);
await shot(page,'en-1536');

/* ── facet filter ────────────────────────────────────────────────────────────────────── */
await page.click('[data-ma-facet="EXPORTED"]');await page.waitForTimeout(350);
const f1=await page.evaluate(()=>({records:document.querySelectorAll('[data-ma-record]').length,pressed:document.querySelector('[data-ma-facet="EXPORTED"]')?.getAttribute('aria-pressed')}));
push('function.facet-filter',f1.records===2&&f1.pressed==='true',f1);
await page.click('[data-ma-facet="ALL"]');await page.waitForTimeout(300);

/* ── record selection drives every region ────────────────────────────────────────────── */
await page.click('[data-ma-record="AIB-REQ-0044"]');await page.waitForTimeout(400);
const sel=await snap();
push('function.record-selection-drives-center',sel.selected==='AIB-REQ-0044'&&sel.state==='IMPORTED',{selected:sel.selected,state:sel.state});
push('function.human-gate-open-on-imported',sel.dispositions.length===5&&sel.dispositions.filter(d=>d.disabled===false).length>=4&&sel.dispositions.find(d=>d.d==='ACCEPT')?.disabled===true,sel.dispositions);
push('function.next-action-primary-on-import',sel.toolbar.find(t=>t.id==='manual_ai.draft')?.disabled===false,sel.toolbar);

/* ── search with focus retention ─────────────────────────────────────────────────────── */
await page.fill('[data-ma-search]','threat');await page.waitForTimeout(400);
const search=await page.evaluate(()=>({records:document.querySelectorAll('[data-ma-record]').length,
  focus:document.activeElement?.matches?.('[data-ma-search]')===true,value:document.querySelector('[data-ma-search]')?.value}));
push('function.search-filter-and-focus',search.records===1&&search.focus&&search.value==='threat',search);
await page.fill('[data-ma-search]','');await page.waitForTimeout(300);

/* ── human disposition (real canonical command, real receipt, no fabricated success) ─── */
const receiptsBefore=await page.evaluate(()=>(CEPFoundation?.commandBus?.receipts?.length??null));
await page.click('[data-ma-record="AIB-REQ-0044"]');await page.waitForTimeout(400);
const deferEnabled=await page.evaluate(()=>{const b=document.querySelector('[data-ma-disposition="DEFER"]');return b?!b.disabled:false});
if(deferEnabled)await safeClick('[data-ma-disposition="DEFER"]');
await page.waitForTimeout(600);
const deferred=await snap();
push('function.disposition-defer-changes-domain-state',deferEnabled&&deferred.selected==='AIB-REQ-0044'&&deferred.state==='DEFERRED',{selected:deferred.selected,state:deferred.state,wasEnabled:deferEnabled});
/* ACCEPT must fail closed, never fabricate a draft-creation receipt. */
const acceptMeta=await page.evaluate(()=>{const b=document.querySelector('[data-ma-disposition="ACCEPT"]');return b?{disabled:!!b.disabled,reason:b.title}:null});
if(acceptMeta&&!acceptMeta.disabled)await safeClick('[data-ma-disposition="ACCEPT"]');
await page.waitForTimeout(600);
const accept=await snap();
const acceptStatus=await page.evaluate(()=>document.querySelector('#foundationStatus')?.textContent||'');
push('function.disposition-accept-fails-closed-no-fake-success',
  acceptMeta?.disabled===true||(/DRAFT_SINK_UNAVAILABLE/.test(acceptStatus)&&accept.state!=='ACCEPTED_AS_DRAFT'),
  {meta:acceptMeta,status:acceptStatus,state:accept.state});
push('function.no-canonical-publication',await page.evaluate(()=>{
  const facts=[...document.querySelectorAll('.ma-head-facts li')].map(li=>li.textContent);
  return facts.some(t=>/automaticCanonicalPublication = false/.test(t));
}),receiptsBefore);

/* ── export never fakes success (helper unavailable is reported truthfully) ──────────── */
await page.click('[data-ma-record="AIB-REQ-0049"]');await page.waitForTimeout(350);
const beforeExport=await snap();
await safeClick('#domainToolbar [data-foundation-command="manual_ai.export"]');await page.waitForTimeout(700);
const afterExport=await page.evaluate(()=>({status:document.querySelector('#foundationStatus')?.textContent||'',
  state:document.querySelector('.ma-root')?.getAttribute('data-state'),
  artifact:[...document.querySelectorAll('.ma-row')].find(r=>/Export artifact/.test(r.textContent||''))?.querySelector('.ma-val')?.textContent||'',
  pill:[...document.querySelectorAll('.ma-pill')].map(p=>p.textContent).join(' ')}));
push('function.export-reports-helper-unavailable-no-fake-success',
  afterExport.state==='PREPARED'&&/NOT_EXPORTED/.test(afterExport.artifact)&&beforeExport.state==='PREPARED',
  {before:beforeExport.state,after:afterExport});

/* ── import is gated on an operator-declared response ────────────────────────────────── */
await page.click('[data-ma-record="AIB-REQ-0048"]');await page.waitForTimeout(350);
const importEmpty=await page.evaluate(()=>({disabled:document.querySelector('#domainToolbar [data-foundation-command="manual_ai.import"]')?.disabled,
  reason:document.querySelector('#domainToolbar [data-foundation-command="manual_ai.import"]')?.title}));
push('function.import-blocked-without-declared-response',importEmpty.disabled===true&&/intake/i.test(importEmpty.reason||''),importEmpty);
await page.fill('[data-ma-intake]','External response: three findings, all unverified input.');await page.waitForTimeout(300);
const importReady=await page.evaluate(()=>({disabled:document.querySelector('#domainToolbar [data-foundation-command="manual_ai.import"]')?.disabled,intake:document.querySelector('[data-ma-intake]')?.value}));
push('function.import-enabled-after-intake',importReady.disabled===false&&/unverified/.test(importReady.intake||''),importReady);
await safeClick('#domainToolbar [data-foundation-command="manual_ai.import"]');await page.waitForTimeout(700);
const imported=await snap();
push('function.import-produces-provenance-equal-state',imported.state==='IMPORTED',({state:imported.state,selected:imported.selected}));

/* ── prepare a new declared request ─────────────────────────────────────────────────── */
await safeClick('#domainToolbar [data-foundation-command="manual_ai.draft"]');await page.waitForTimeout(700);
const prepared=await page.evaluate(()=>({records:document.querySelectorAll('[data-ma-record]').length,
  hasDeclared:!!document.querySelector('[data-ma-record="AIB-REQ-0052"]'),count:document.querySelector('[data-ma-facet="ALL"] .ma-fcount')?.textContent}));
push('function.prepare-declared-new-request',prepared.records===9&&prepared.hasDeclared&&prepared.count==='9',prepared);

/* ── L1/L2/L4 region captures (EN) ──────────────────────────────────────────────────── */
const stageBox=await page.evaluate(()=>{const r=document.querySelector('#foundationStage').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}});
await shot(page,'en-stage',{clip:stageBox});
await page.evaluate(()=>{document.querySelector('#foundationStage').scrollTop=document.querySelector('#foundationStage').scrollHeight});
await page.waitForTimeout(400);
await shot(page,'en-stage-bottom',{clip:stageBox});
const stepper=await page.evaluate(()=>{const e=document.querySelector('[data-sec="C"]');if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(Math.max(0,r.y)),width:Math.round(r.width),height:Math.round(Math.min(r.height,window.innerHeight-Math.max(0,r.y)))}});
if(stepper)await shot(page,'en-secC-stepper',{clip:stepper});
await page.evaluate(()=>{document.querySelector('#foundationStage').scrollTop=0});
await page.waitForTimeout(300);
await shot(page,'en-left-region',{clip:await page.evaluate(()=>{const r=document.querySelector('#leftPane').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}})});
await shot(page,'en-right-region',{clip:await page.evaluate(()=>{const r=document.querySelector('#rightPane').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}})});

/* ── RESPONSIVE ─────────────────────────────────────────────────────────────────────── */
for(const [name,vp] of [['1280x860',{width:1280,height:860}],['1024x900',{width:1024,height:900}],['900x900',{width:900,height:900}],['760x900',{width:760,height:900}]]){
  await page.setViewportSize(vp);await page.waitForTimeout(700);
  const st=await page.evaluate(()=>{
    const stage=document.querySelector('#foundationStage');
    const steps=getComputedStyle(document.querySelector('.ma-steps')).gridTemplateColumns.split(' ').length;
    const overlap=[...document.querySelectorAll('.ma-sec')].some(el=>el.scrollWidth>el.clientWidth+2);
    return {hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,steps,secOverflow:overlap,
      actionsVisible:[...document.querySelectorAll('[data-ma-disposition]')].every(b=>b.getBoundingClientRect().width>0)};
  });
  push(`responsive.${name}`,!st.hScroll&&!st.secOverflow&&st.actionsVisible,st);
  await shot(page,`en-${name}`);
}
await page.setViewportSize({width:1536,height:1024});await page.waitForTimeout(700);

/* ── AR / RTL ───────────────────────────────────────────────────────────────────────── */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1400);
const ar=await page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  const text=document.querySelector('.ma-root')?.innerText||'';
  const arabic=(text.match(/[؀-ۿ]/g)||[]).length;
  return {lang:document.documentElement.lang,dir:document.documentElement.dir,
    h1Dir:getComputedStyle(document.querySelector('.ma-root h1')).direction,
    arabicGlyphs:arabic,latin:text.length,
    leftX:rect('#leftPane')?.x,rightX:rect('#rightPane')?.x,
    hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    selected:document.querySelector('.ma-root')?.getAttribute('data-selected'),
    sections:[...document.querySelectorAll('.ma-sec')].map(s=>s.getAttribute('data-sec')),
    records:document.querySelectorAll('[data-ma-record]').length,
    banner:document.querySelector('#topBanner .title')?.textContent,
    toolbar:[...document.querySelectorAll('#domainToolbar button')].map(b=>b.textContent.trim())};
});
R.ar=ar;
push('rtl.document-direction',ar.lang==='ar'&&ar.dir==='rtl'&&ar.h1Dir==='rtl',{lang:ar.lang,dir:ar.dir,h1Dir:ar.h1Dir});
push('rtl.content-localized',ar.arabicGlyphs>400&&ar.sections.join(',')==='A,B,C,D,E'&&ar.records>0,{arabic:ar.arabicGlyphs,records:ar.records,sections:ar.sections});
push('rtl.no-horizontal-overflow',ar.hScroll===false,ar.hScroll);
push('rtl.mirrors-structure',ar.leftX<ar.rightX,{leftX:ar.leftX,rightX:ar.rightX});
push('rtl.toolbar-localized',ar.toolbar.some(t=>/تجهيز/.test(t)),ar.toolbar);
await shot(page,'ar-1536');
await shot(page,'ar-stage',{clip:stageBox});
await shot(page,'ar-left-region',{clip:await page.evaluate(()=>{const r=document.querySelector('#leftPane').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}})});
await shot(page,'ar-right-region',{clip:await page.evaluate(()=>{const r=document.querySelector('#rightPane').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}})});

/* ── BIDI: back to EN, verify round-trip and technical token isolation ──────────────── */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1200);
const rt=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,
  h1:document.querySelector('.ma-root h1')?.textContent?.trim()||'',lead:document.querySelector('.ma-lead')?.textContent?.trim()||'',
  text:document.querySelector('.ma-root')?.innerText||'',isolated:document.querySelectorAll('.ma-root bdi[dir=ltr]').length,
  arabic:(document.querySelector('.ma-root')?.innerText||'').match(/[؀-ۿ]/g)?.length||0}));
R.roundTrip={lang:rt.lang,dir:rt.dir,isolatedBdi:rt.isolated,arabic:rt.arabic,arabicInAr:ar.arabicGlyphs,h1:rt.h1};
/* Bilingual pairing is intentional: h1/section headings show the other language as a secondary run.
   What must flip is the PRIMARY reading language and the dominant text mass. */
push('bidi.round-trip-restores-english',rt.lang==='en'&&rt.dir==='ltr'&&rt.h1.startsWith('Manual AI Bridge')&&rt.arabic<ar.arabicGlyphs*0.6,{lang:rt.lang,dir:rt.dir,h1:rt.h1,arabicEn:rt.arabic,arabicAr:ar.arabicGlyphs});
push('bidi.technical-tokens-isolated',rt.isolated>=8,rt.isolated);

R.pageErrors=pageErrors.slice(0,8);
R.consoleErrors=consoleErrors.filter(e=>!/ERR_CONNECTION_REFUSED/.test(e)).slice(0,8);
R.summary={total:R.checks.length,pass:R.checks.filter(c=>c.status==='PASS').length,fail:R.checks.filter(c=>c.status==='FAIL').length};
await writeFile(path.join(OUT,'audit.json'),JSON.stringify(R,null,2));
console.log(JSON.stringify({summary:R.summary,failed:R.checks.filter(c=>c.status==='FAIL').map(c=>({id:c.id,detail:c.detail})),captures:R.captures.length},null,2));
await browser.close();server.kill();runtime.kill();
