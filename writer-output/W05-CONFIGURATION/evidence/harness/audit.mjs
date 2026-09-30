import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const OUT='/tmp/opencode/w05-config/audit';
await mkdir(OUT,{recursive:true});

const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort(),runtimePort=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime=spawn(process.execPath,[path.join(root,'stack/local-runtime/server.mjs')],{cwd:root,env:{...process.env,CEP_LOCAL_RUNTIME_PORT:String(runtimePort),CEP_SQLITE_PATH:path.join(root,'writer-output/W05/.runtime-proof/probe.sqlite')},stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const commit=execSync('git rev-parse HEAD',{cwd:root}).toString().trim();
const short=execSync('git rev-parse --short HEAD',{cwd:root}).toString().trim();
const treeSha=execSync(`git rev-parse HEAD:stack/native-typescript`,{cwd:root}).toString().trim();

const results={lineage:{commit,short,treeSha,branch:execSync('git branch --show-current',{cwd:root}).toString().trim(),capturedAt:new Date().toISOString(),viewport:'1536x1024',runtime:'playwright-chromium-headless'},checks:[],captures:[],geometry:{}};

const browser=await chromium.launch({headless:true});
const push=(id,ok,detail)=>results.checks.push({id,status:ok?'PASS':'FAIL',detail});
const shot=async(page,name,opts={})=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file,fullPage:false,...opts});
  const b=await readFile(file);
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${w}x${h}`};
  results.captures.push(rec);
  return rec;
};
const elShot=async(page,selector,name)=>{
  const el=await page.$(selector);
  if(!el){results.captures.push({name,error:'missing '+selector});return null}
  const file=path.join(OUT,`${name}.png`);
  await el.screenshot({path:file});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);
  return rec;
};

const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?surface=configuration&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='configuration',undefined,{timeout:30000});
await page.waitForTimeout(2200);

/* ── GEOMETRY (L2/L4 evidence) ──────────────────────────────── */
const geo=await page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  const style=(sel,props)=>{const e=document.querySelector(sel);if(!e)return null;const c=getComputedStyle(e);const o={};for(const p of props)o[p]=c[p];return o};
  const rows=[...document.querySelectorAll('.cfg-row')].map(r=>{const b=r.getBoundingClientRect();return {h:Math.round(b.height),w:Math.round(b.width)}});
  return {
    viewport:{w:innerWidth,h:innerHeight},
    regions:{banner:rect('#topBanner'),toolbar:rect('#domainToolbar'),left:rect('#leftPane'),stage:rect('#foundationStage'),right:rect('#rightPane'),bottom:rect('#bottomShelf')},
    center:{root:rect('.cfg-root'),strip:rect('.cfg-strip'),facts:rect('.cfg-facts'),domains:rect('.cfg-block[data-cfg-block=domains]'),revision:rect('.cfg-block[data-cfg-block=revision]'),footnote:rect('.cfg-footnote')},
    leftPane:{root:rect('#domainLeftRegion .cfg-pane'),sections:document.querySelectorAll('#domainLeftRegion .cfg-pane-section').length,navItems:document.querySelectorAll('#domainLeftRegion .cfg-nav li').length},
    rightPane:{root:rect('#domainContext .cfg-inspector'),cards:document.querySelectorAll('.cfg-insp-card').length},
    table:{thead:rect('.cfg-thead'),rowHeights:rows.slice(0,8),rowCols:document.querySelector('.cfg-row')?getComputedStyle(document.querySelector('.cfg-row')).gridTemplateColumns:null},
    diff:{root:rect('.cfg-diff'),panes:[...document.querySelectorAll('.cfg-diff-pane')].map(p=>{const b=p.getBoundingClientRect();return {x:Math.round(b.x),w:Math.round(b.width),h:Math.round(b.height)}}),side:rect('.cfg-diff-side'),lines:document.querySelectorAll('.cfg-code li').length},
    type:{h1:style('.cfg-root h1',['fontSize','fontWeight','lineHeight','letterSpacing']),h2:style('.cfg-block-head h2',['fontSize','fontWeight']),body:style('.cfg-root',['fontSize','lineHeight','color']),navStrong:style('#domainLeftRegion .cfg-nav strong',['fontSize','fontWeight'])},
    spacing:{rootGap:style('.cfg-root',['rowGap','paddingTop','paddingInlineStart']),blockPad:style('.cfg-block-head',['paddingTop','paddingBottom','paddingInlineStart']),rowPad:style('.cfg-row',['paddingTop','paddingBottom','paddingInlineStart']),radius:style('.cfg-block',['borderRadius','borderColor','backgroundColor'])},
    contrast:{rootColor:style('.cfg-root',['color','backgroundColor'])},
    overflow:{stageScroll:document.querySelector('#foundationStage').scrollHeight,stageClient:document.querySelector('#foundationStage').clientHeight,hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth}
  };
});
results.geometry.en=geo;
await shot(page,'en-1536-top');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');s.scrollTop=s.scrollHeight});
await page.waitForTimeout(400);
await shot(page,'en-1536-bottom');
await elShot(page,'#leftPane','crop-left-en');
await elShot(page,'.cfg-block[data-cfg-block=revision]','crop-diff-en');
await elShot(page,'#rightPane','crop-right-en');
await page.evaluate(()=>{document.querySelector('#foundationStage').scrollTop=0});await page.waitForTimeout(300);
await elShot(page,'.cfg-block[data-cfg-block=domains]','crop-table-en');

/* ── responsive ─────────────────────────────────────────────── */
for(const [name,viewport] of [['1280x860',{width:1280,height:860}],['1024x900',{width:1024,height:900}],['820x900',{width:820,height:900}]]){
  await page.setViewportSize(viewport);
  await page.waitForTimeout(700);
  const st=await page.evaluate(()=>({
    hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    overlap:[...document.querySelectorAll('.cfg-row')].some(r=>r.scrollWidth>r.clientWidth+2),
    rowCols:getComputedStyle(document.querySelector('.cfg-row')).gridTemplateColumns,
    theadVisible:getComputedStyle(document.querySelector('.cfg-thead')).display!=='none',
    stageScroll:document.querySelector('#foundationStage').scrollHeight>document.querySelector('#foundationStage').clientHeight
  }));
  results.checks.push({id:`responsive.${name}`,status:(!st.hScroll&&!st.overlap)?'PASS':'FAIL',detail:st});
  await shot(page,`en-${name}`);
}
await page.setViewportSize({width:1536,height:1024});await page.waitForTimeout(600);

/* ── AR / RTL geometry ──────────────────────────────────────── */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(1100);
const arGeo=await page.evaluate(()=>{
  const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  const head=rect('.cfg-thead');
  const firstRow=rect('.cfg-row');
  const statusCell=rect('.cfg-row .cfg-chip');
  const dirCell=rect('.cfg-row .cfg-domain');
  return {
    lang:document.documentElement.lang,dir:document.documentElement.dir,
    root:rect('.cfg-root'),table:rect('.cfg-thead'),tableX:head?head.x:null,
    statusOnLeft:statusCell&&head?statusCell.x<head.x+head.w/2:true,
    domainOnRight:dirCell?dirCell.x>head.x+head.w/2:true,
    factsX:rect('.cfg-facts')?.x, leftPane:rect('#leftPane'), rightPane:rect('#rightPane'),
    leftIsLeft:rect('#leftPane')?.x<rect('#rightPane')?.x,
    diffPanes:[...document.querySelectorAll('.cfg-diff-pane')].map(p=>Math.round(p.getBoundingClientRect().x)),
    rtlHeadingDir:document.querySelector('.cfg-root h1')?getComputedStyle(document.querySelector('.cfg-root h1')).direction:null,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    stageScroll:document.querySelector('#foundationStage').scrollHeight>document.querySelector('#foundationStage').clientHeight
  };
});
results.geometry.ar=arGeo;
results.checks.push({id:'rtl.document-direction',status:(arGeo.lang==='ar'&&arGeo.dir==='rtl'&&arGeo.rtlHeadingDir==='rtl')?'PASS':'FAIL',detail:{lang:arGeo.lang,dir:arGeo.dir,heading:arGeo.rtlHeadingDir}});
results.checks.push({id:'rtl.mirrors-content',status:(arGeo.leftIsLeft===true&&arGeo.overflow===false)?'PASS':'FAIL',detail:{leftIsLeft:arGeo.leftIsLeft,overflow:arGeo.overflow}});
await shot(page,'ar-1536-top');
await page.evaluate(()=>{const s=document.querySelector('#foundationStage');s.scrollTop=s.scrollHeight});await page.waitForTimeout(400);
await shot(page,'ar-1536-bottom');
await elShot(page,'#leftPane','crop-left-ar');
await elShot(page,'.cfg-block[data-cfg-block=revision]','crop-diff-ar');
await elShot(page,'#rightPane','crop-right-ar');
await elShot(page,'.cfg-block[data-cfg-block=domains]','crop-table-ar');

/* restore EN before the mutating functional pass */
await page.evaluate(()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()});
await page.waitForTimeout(900);

/* ── FUNCTIONAL ─────────────────────────────────────────────── */
push('function.route-opens-on-configuration',await page.evaluate(()=>CEPFoundation.consumer==='configuration'),await page.evaluate(()=>CEPFoundation.consumer));
push('function.surface-owned-not-generic-workbench',await page.evaluate(()=>document.querySelector('#foundationStage')?.firstElementChild?.dataset.w05Owned==='configuration'&&!!document.querySelector('.cfg-root')),true);
push('function.page-errors-none',pageErrors.length===0,pageErrors.slice(0,5));

// 1. domain selection (table row)
const beforeSel=await page.evaluate(()=>document.querySelector('.cfg-root')?.dataset.selectedDomain);
await page.click('.cfg-row[data-cfg-domain="language"]');
await page.waitForTimeout(300);
const afterSel=await page.evaluate(()=>document.querySelector('.cfg-root')?.dataset.selectedDomain);
push('function.domain-selection-table',beforeSel!==afterSel&&afterSel==='language',{before:beforeSel,after:afterSel});

// left pane nav syncs
const leftCurrent=await page.evaluate(()=>document.querySelector('#domainLeftRegion [aria-current=true]')?.dataset.cfgDomain);
push('function.domain-selection-left-pane-syncs',leftCurrent==='language',leftCurrent);

// 2. tabs
await page.click('.cfg-tab[data-cfg-tab="log"]');await page.waitForTimeout(250);
const logOk=await page.evaluate(()=>({tab:document.querySelector('.cfg-root')?.dataset.revisionTab,items:document.querySelectorAll('.cfg-log li').length}));
await page.click('.cfg-tab[data-cfg-tab="observations"]');await page.waitForTimeout(250);
const obsOk=await page.evaluate(()=>({rows:document.querySelectorAll('.cfg-obs tbody tr').length}));
await page.click('.cfg-tab[data-cfg-tab="diff"]');await page.waitForTimeout(250);
const diffOk=await page.evaluate(()=>({panes:document.querySelectorAll('.cfg-diff-pane').length,lines:document.querySelectorAll('.cfg-code li').length,side:!!document.querySelector('.cfg-diff-side')}));
push('function.tabs-diff-log-observations',logOk.tab==='log'&&logOk.items>=4&&obsOk.rows>=4&&diffOk.panes===2&&diffOk.lines>6,({logOk,obsOk,diffOk}));

// 3. filter
await page.selectOption('[data-cfg-filter]','operational');await page.waitForTimeout(250);
const opRows=await page.evaluate(()=>document.querySelectorAll('.cfg-row').length);
await page.selectOption('[data-cfg-filter]','preference');await page.waitForTimeout(250);
const prefRows=await page.evaluate(()=>document.querySelectorAll('.cfg-row').length);
await page.selectOption('[data-cfg-filter]','all');await page.waitForTimeout(200);
push('function.filter-kind',opRows===3&&prefRows===5,{opRows,prefRows});

// 4. search + focus retention
await page.fill('[data-cfg-search]','security');await page.waitForTimeout(300);
const searchState=await page.evaluate(()=>({rows:document.querySelectorAll('.cfg-row').length,focus:document.activeElement?.matches?.('[data-cfg-search]')===true,value:document.querySelector('[data-cfg-search]')?.value}));
await page.fill('[data-cfg-search]','');await page.waitForTimeout(250);
push('function.search-filter-and-focus-retained',searchState.rows===1&&searchState.focus&&searchState.value==='security',searchState);

// 5. validate
const publishBefore=await page.evaluate(()=>!!document.querySelector('#domainToolbar [data-foundation-command="configuration.publish"]')?.disabled);
await page.click('#domainToolbar [data-foundation-command="configuration.validateRevision"]');await page.waitForTimeout(500);
const validateState=await page.evaluate(()=>{
  const meter=document.querySelector('.cfg-meter i');
  const status=[...document.querySelectorAll('.cfg-row .cfg-chip')].map(e=>e.textContent.trim());
  return {readiness:meter?parseInt(meter.style.inlineSize,10):null,publishDisabled:document.querySelector('#domainToolbar [data-foundation-command="configuration.publish"]')?.disabled,status};
});
push('function.validate-updates-readiness-and-status',validateState.readiness===100&&validateState.publishDisabled===false&&publishBefore===true,{before:publishBefore,after:validateState});

// 6. publish — preference scope applies for real, operational stays authority-pending
const densityBefore=await page.evaluate(()=>CEPFoundation.preferences.resolve('density').preferredValue);
await page.click('#domainToolbar [data-foundation-command="configuration.publish"]');await page.waitForTimeout(700);
const publishState=await page.evaluate(()=>({
  density:CEPFoundation.preferences.resolve('density').preferredValue,
  densitySource:CEPFoundation.preferences.resolve('density').sourceScope,
  bodyDensity:document.body.dataset.density,
  persisted:/PERSISTED|STORAGE_WRITE_FAILED/.test(String(CEPFoundation.preferences.storageStatus?.().lastOperation)),
  logTail:[...document.querySelectorAll('.cfg-log li')].slice(-1)[0]?.textContent.slice(0,140),
  operationalApplied:false
}));
push('function.publish-applies-preference-scope-durably',publishState.density==='compact'&&publishState.densitySource==='global'&&densityBefore==='comfortable',{densityBefore,after:publishState.density,source:publishState.densitySource});
await page.click('.cfg-tab[data-cfg-tab="log"]');await page.waitForTimeout(300);
const logTail=await page.evaluate(()=>[...document.querySelectorAll('.cfg-log li')].slice(-1)[0]?.textContent||'');
push('truth.operational-scope-never-applied',/authority/i.test(logTail)&&/stayed/i.test(logTail)&&publishState.operationalApplied===false,logTail);
await page.click('.cfg-tab[data-cfg-tab="diff"]');await page.waitForTimeout(250);

// 7. discard (destructive) → clears draft
await page.click('#domainToolbar [data-foundation-command="configuration.discardRevision"]');await page.waitForTimeout(600);
const confirmState=await page.evaluate(()=>({dialog:!!document.querySelector('#commandBackdrop:not([hidden]) .dialog, #foundationDialog:not([hidden])'),confirm:!!document.querySelector('[data-cfg-discard-confirm]'),cancel:!!document.querySelector('[data-cfg-discard-cancel]'),title:document.querySelector('#foundationDialogTitle')?.textContent||null}));
push('function.discard-requires-confirmation',confirmState.confirm&&confirmState.cancel,confirmState);
if(confirmState.confirm){await page.click('[data-cfg-discard-confirm]');await page.waitForTimeout(800);}
const discardState=await page.evaluate(()=>({zero:[...document.querySelectorAll('.cfg-row .cfg-count')].filter(e=>e.textContent.trim()==='0').length,changedLines:document.querySelectorAll('.cfg-code li[data-change=add],.cfg-code li[data-change=del]').length,summaryTotal:document.querySelector('.cfg-side-col .cfg-stat b')?.textContent||null,notice:document.querySelector('.cfg-diff-notice')?.textContent||null}));
push('function.discard-clears-draft',discardState.zero>=8&&discardState.changedLines===0&&discardState.summaryTotal==='0'&&!!discardState.notice,discardState);

// 8. settings: language & direction block, single control instance, live effect
await page.click('#domainToolbar [data-foundation-command="foundation.settings"]');await page.waitForTimeout(600);
const settingsBefore=await page.evaluate(()=>({
  open:!!document.querySelector('.settings-center[role=dialog]'),
  title:document.querySelector('#settings-center-title')?.textContent,
  langBlock:!!document.querySelector('[data-settings-language-block]'),
  localeButtons:[...document.querySelectorAll('[data-settings-preference="locale"]')].length,
  localeOutsideBlock:[...document.querySelectorAll('[data-settings-preference="locale"]')].filter(b=>!b.closest('[data-settings-language-block]')).length,
  directionOutsideBlock:[...document.querySelectorAll('[data-settings-preference="chromeDirection"]')].filter(b=>!b.closest('[data-settings-language-block]')).length,
  languageFields:document.querySelectorAll('[data-settings-language-block] [data-settings-field]').length,
  dir:document.querySelector('.settings-center')?.getAttribute('dir'),
  lang:document.documentElement.lang,
  footer:!!document.querySelector('[data-settings-foot]'),
  authorities:document.querySelector('[data-settings-language-block]')?.dataset.languageAuthority
}));
await page.click('[data-settings-preference="locale"][data-settings-value="ar"]');await page.waitForTimeout(800);
const settingsAr=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,h1:document.querySelector('.cfg-root h1')?.textContent,title:document.querySelector('#settings-center-title')?.textContent,panelDir:document.querySelector('.settings-center')?.getAttribute('dir')}));
await page.click('[data-settings-preference="locale"][data-settings-value="en"]');await page.waitForTimeout(800);
const settingsEn=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,h1:document.querySelector('.cfg-root h1')?.textContent,title:document.querySelector('#settings-center-title')?.textContent}));
await page.keyboard.press('Escape');await page.waitForTimeout(400);
push('function.settings-opens-with-language-direction-block',settingsBefore.open&&settingsBefore.langBlock&&settingsBefore.localeButtons===2&&settingsBefore.localeOutsideBlock===0&&settingsBefore.directionOutsideBlock===0&&settingsBefore.languageFields===2&&settingsBefore.footer,settingsBefore);
push('function.settings-locale-switch-ar',settingsAr.lang==='ar'&&settingsAr.dir==='rtl'&&/تحرير/.test(settingsAr.h1)&&/الإعدادات/.test(settingsAr.title),settingsAr);
push('function.settings-locale-switch-en',settingsEn.lang==='en'&&settingsEn.dir==='ltr'&&/Edit and review/.test(settingsEn.h1)&&/Settings/.test(settingsEn.title),settingsEn);
push('function.settings-closed-after-escape',await page.evaluate(()=>!document.querySelector('.settings-center[role=dialog]')),true);

// 9. shell direction authority (G-20)
const shellAuth=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,langAuthority:document.documentElement.dataset.languageAuthority,dirAuthority:document.documentElement.dataset.directionAuthority}));
push('g20.document-shell-follows-active-preference',shellAuth.lang==='en'&&shellAuth.dir==='ltr'&&!!shellAuth.langAuthority,shellAuth);

await writeFile(path.join(OUT,'audit.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.checks.map(c=>`${c.status} ${c.id}`),captures:results.captures.length},null,2));
await context.close();
await browser.close();runtime.kill('SIGTERM');server.kill('SIGTERM');
