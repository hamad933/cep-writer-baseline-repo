import {spawn,execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const OUT='/tmp/opencode/w05-config/audit2';
await mkdir(OUT,{recursive:true});
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort(),runtimePort=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime=spawn(process.execPath,[path.join(root,'stack/local-runtime/server.mjs')],{cwd:root,env:{...process.env,CEP_LOCAL_RUNTIME_PORT:String(runtimePort),CEP_SQLITE_PATH:path.join(root,'writer-output/W05/.runtime-proof/probe.sqlite')},stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
const results={lineage:{commit:execSync('git rev-parse HEAD',{cwd:root}).toString().trim(),capturedAt:new Date().toISOString()},checks:[],captures:[],geometry:{}};
const push=(id,ok,detail)=>results.checks.push({id,status:ok?'PASS':'FAIL',detail});
const shot=async(page,name)=>{
  const file=path.join(OUT,`${name}.png`);
  await page.screenshot({path:file});
  const b=await readFile(file);
  const rec={name,file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);return rec;
};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1536,height:1024},reducedMotion:'reduce'});
const page=await context.newPage();
const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?surface=configuration&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='configuration',undefined,{timeout:30000});
await page.waitForTimeout(2200);

/* ── SETTINGS PANEL ── */
await page.click('#domainToolbar [data-foundation-command="foundation.settings"]');await page.waitForTimeout(700);
const geo=await page.evaluate(()=>{
  const r=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}};
  const panel=document.querySelector('.settings-center');
  return {
    panel:r('.settings-center'),panelDir:panel?.getAttribute('dir'),title:document.querySelector('#settings-center-title')?.textContent,
    subtitle:document.querySelector('.settings-head-copy small')?.textContent,
    searchPlaceholder:document.querySelector('[data-settings-search]')?.getAttribute('placeholder'),
    languageBlock:r('[data-settings-language-block]'),
    languageAuthority:document.querySelector('[data-settings-language-block]')?.dataset.languageAuthority,
    directionAuthority:document.querySelector('[data-settings-language-block]')?.dataset.directionAuthority,
    fields:[...document.querySelectorAll('[data-settings-field]')].map(f=>({key:f.dataset.settingsField,btns:f.querySelectorAll('[data-settings-preference]').length,labels:[...f.querySelectorAll('bdi')].map(b=>b.textContent)})),
    groups:[...document.querySelectorAll('.settings-center-group')].map(g=>({id:g.dataset.settingsGroup,label:g.querySelector('.settings-center-group-title')?.textContent,note:g.querySelector('.settings-center-group-note')?.textContent})),
    sections:[...document.querySelectorAll('.settings-center-section')].map(s=>({id:s.dataset.settingsSection,label:s.querySelector('strong')?.textContent,note:s.querySelector('small')?.textContent,summary:s.querySelector('.prefsection-values')?.textContent||null,open:s.dataset.open})),
    localeOutside:[...document.querySelectorAll('[data-settings-preference="locale"]')].filter(b=>!b.closest('[data-settings-language-block]')).length,
    directionOutside:[...document.querySelectorAll('[data-settings-preference="chromeDirection"]')].filter(b=>!b.closest('[data-settings-language-block]')).length,
    foot:[...document.querySelectorAll('.settings-foot-row')].map(f=>f.textContent.replace(/\s+/g,' ').trim()),
    chips:[...document.querySelectorAll('.settings-language-state .settings-chip')].map(c=>c.textContent.trim()),
    overflow:document.querySelector('.settings-center')?.scrollWidth>document.querySelector('.settings-center')?.clientWidth+1
  };
});
results.geometry.settings=geo;
push('settings.purpose-and-language-block',geo.title==='Settings & Preferences'&&!!geo.languageBlock&&geo.fields.length===2&&geo.localeOutside===0&&geo.directionOutside===0,{title:geo.title,fields:geo.fields.map(f=>f.key),localeOutside:geo.localeOutside,directionOutside:geo.directionOutside});
push('settings.localised-groups-and-summaries',geo.groups.length>=4&&geo.groups.every(g=>g.label&&g.note)&&geo.sections.filter(s=>s.summary).length>=4,{groups:geo.groups.map(g=>g.label),summarised:geo.sections.filter(s=>s.summary).length,total:geo.sections.length});
push('settings.footer-authority',geo.foot.length===4&&geo.foot.join(' ').includes('ScopedPreferencesOwner'),geo.foot);
push('settings.no-horizontal-overflow',geo.overflow===false,geo.overflow);
await shot(page,'settings-en');

// bilingual search
await page.fill('[data-settings-search]','locale');await page.waitForTimeout(400);
const searchEn=await page.evaluate(()=>({rows:document.querySelectorAll('.settings-preference-item,.settings-center-section').length,matched:document.querySelector('.settings-search-count')?.textContent||null}));
await page.fill('[data-settings-search]','اللغة');await page.waitForTimeout(400);
const searchAr=await page.evaluate(()=>({matched:document.querySelector('.settings-search-count')?.textContent||null,hasLocale:!![...document.querySelectorAll('[data-settings-preference="locale"]')].length}));
await page.fill('[data-settings-search]','');await page.waitForTimeout(300);
push('settings.bilingual-search',!!searchEn.matched&&!!searchAr.matched&&searchAr.hasLocale,{searchEn,searchAr});
await shot(page,'settings-search-ar-term');

// direction control flips the document shell
await page.click('[data-settings-preference="chromeDirection"][data-settings-value="rtl"]');await page.waitForTimeout(700);
const dirRtl=await page.evaluate(()=>({dir:document.documentElement.dir,panelDir:document.querySelector('.settings-center')?.getAttribute('dir'),stageDir:getComputedStyle(document.querySelector('.cfg-root')).direction}));
await page.click('[data-settings-preference="chromeDirection"][data-settings-value="auto"]');await page.waitForTimeout(600);
const dirAuto=await page.evaluate(()=>({dir:document.documentElement.dir}));
push('settings.direction-control-follows-preference',dirRtl.dir==='rtl'&&dirRtl.panelDir==='rtl'&&dirRtl.stageDir==='rtl'&&dirAuto.dir==='ltr',{dirRtl,dirAuto});
await shot(page,'settings-direction-rtl');
await page.keyboard.press('Escape');await page.waitForTimeout(500);
push('function.page-errors-none-audit2',errs.length===0,errs.slice(0,5));

/* ── COLLAPSED STATES ── */
const widths=async()=>page.evaluate(()=>({left:Math.round(document.querySelector('#leftPane').getBoundingClientRect().width),right:Math.round(document.querySelector('#rightPane').getBoundingClientRect().width),stage:Math.round(document.querySelector('#foundationStage').getBoundingClientRect().width),leftState:document.body.dataset.left,rightState:document.body.dataset.right,hScroll:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,tableW:Math.round(document.querySelector('.cfg-table')?.getBoundingClientRect().width||0),overlap:[...document.querySelectorAll('.cfg-row')].some(r=>r.scrollWidth>r.clientWidth+2)}));
const open=await widths();
await page.evaluate(()=>{CEPFoundation.preferences.set('left','collapsed','global');CEPFoundation.workspace.applyPreferences()});await page.waitForTimeout(700);
const leftCollapsed=await widths();
await shot(page,'collapsed-left');
await page.evaluate(()=>{CEPFoundation.preferences.set('right','collapsed','global');CEPFoundation.workspace.applyPreferences()});await page.waitForTimeout(700);
const bothCollapsed=await widths();
await shot(page,'collapsed-both');
push('collapsed.left-pane-grows-centre',leftCollapsed.leftState==='collapsed'&&leftCollapsed.stage>open.stage&&leftCollapsed.hScroll===false&&leftCollapsed.overlap===false,{open:open.stage,left:leftCollapsed.stage});
push('collapsed.both-panes-centre-holds',bothCollapsed.leftState==='collapsed'&&bothCollapsed.rightState==='collapsed'&&bothCollapsed.stage>open.stage&&bothCollapsed.hScroll===false&&bothCollapsed.overlap===false,{openStage:open.stage,both:bothCollapsed});
await page.evaluate(()=>{CEPFoundation.preferences.set('left','open','global');CEPFoundation.preferences.set('right','open','global');CEPFoundation.workspace.applyPreferences()});await page.waitForTimeout(700);
const restored=await widths();
push('collapsed.restored',restored.leftState==='open'&&restored.rightState==='open'&&restored.stage===open.stage,{restored:restored.stage,open:open.stage});

await writeFile(path.join(OUT,'audit2.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results.checks.map(c=>`${c.status} ${c.id}`),null,2));
await context.close();await browser.close();runtime.kill('SIGTERM');server.kill('SIGTERM');
