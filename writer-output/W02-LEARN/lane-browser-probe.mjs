/**
 * LRN-1 lane browser probe (writer-local instrument).
 *
 * Re-executes the Learn/BIDI/structured-isolation assertions of the W02 flow
 * `spatial-input-bidi-preference-and-structured-isolation` plus the lane-specific
 * Library-seed no-leak falsification, because that flow's FIRST assertion
 * (`spatial.canvas-has-bounds`) is red at exact HEAD for a Visualize/spatial reason that
 * lives outside LRN-1's writable roots — see HANDOFF.md UNRESOLVED.
 *
 * Writes only under writer-output/W02-LEARN/evidence/lane-probe/.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const outDir=path.join(root,'writer-output/W02-LEARN/evidence/lane-probe');
await mkdir(outDir,{recursive:true});
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const results=[];
const check=(id,ok,detail)=>{results.push({id,status:ok?'PASS':'FAIL',detail})};
const commit=(()=>{try{return require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()}catch{return 'UNKNOWN'}})();
const shots=[];
const shot=async(page,label)=>{
  const file=`${label}-${commit.slice(0,8)}.png`;
  const p=path.join(outDir,file);
  await page.screenshot({path:p,fullPage:false});
  const b=await readFile(p);
  shots.push({label,file:`writer-output/W02-LEARN/evidence/lane-probe/${file}`,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),viewport:await page.viewportSize()});
};

const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  const ready=async surface=>{
    await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,surface,{timeout:60000});
    await page.waitForTimeout(900);
  };

  /* ---- seed: Library-only KU + scope-switch data must exist on the Library route ---- */
  await ready('library');
  const lib=await page.evaluate(()=>{
    const el=document.querySelector('.contextscope');
    const r=el?el.getBoundingClientRect():null;
    return {
      kuList:document.querySelectorAll('#kuList').length,
      scope:!!el,
      scopeHidden:!!el?.hidden,
      scopeVisible:el?((r.width>0&&r.height>0&&getComputedStyle(el).display!=='none')?'VISIBLE':'NOT_VISIBLE'):'ABSENT',
      librarySearch:document.querySelectorAll('.library-search').length,
      consumer:CEPFoundation.consumer,
      structuredDomainKind:CEPFoundation.structured?.domainKind,
      kuTokens:(document.querySelector('#leftPane')?.innerText||'').slice(0,600)
    };
  });
  check('SEED.library-route-exposes-library-only-KU-and-scope',
    Boolean(lib.scope)&&lib.scopeVisible==='VISIBLE'&&lib.librarySearch>0&&lib.kuTokens.includes('KU-D03-0001'),
    {kuListSelectorHits:lib.kuList,...lib});
  await shot(page,'seed-library-KU-scope');

  /* ---- Learn must not inherit any of it ---- */
  await ready('learn');
  const learnAfterSeed=await page.evaluate(()=>{
    const txt=document.body.innerText||'';
    return {
      consumer:CEPFoundation.consumer,
      hostKind:CEPFoundation.api?.hostKind,
      domainKind:CEPFoundation.structured?.domainKind,
      libraryState:CEPFoundation.api?.state?.library,
      librarySearch:document.querySelectorAll('.library-search').length,
      kuList:document.querySelectorAll('#kuList').length,
      scopeHidden:document.querySelector('.contextscope')?document.querySelector('.contextscope').hidden:'ABSENT',
      domainIsolation:CEPFoundation.structured?.assertDomainIsolation?.().ok,
      sourceAvailable:CEPFoundation.learn?.sourceAvailable,
      kuTokenHits:['KU-D03-0001','KU-D03-0004','الوحدة','الكتلة المحددة','library-search']
        .filter(t=>txt.includes(t)&&t!=='الوحدة'&&t!=='الكتلة المحددة').length,
      kuTextHits:['KU-D03-0001','KU-D03-0004'].filter(t=>txt.includes(t)),
      donorScope:[...document.querySelectorAll('#rightPane .contextscope')].filter(n=>!n.closest('.context-inspector')).map(n=>{const r=n.getBoundingClientRect();return (r.width>0&&r.height>0&&getComputedStyle(n).display!=='none')?'VISIBLE':'NOT_VISIBLE'}),
      learnDetailTabs:[...document.querySelectorAll('#rightPane .contextscope')].filter(n=>n.closest('.context-inspector')).map(n=>({display:getComputedStyle(n).display,hidden:n.hidden,inert:!!n.inert}))
    };
  });
  check('LANE.learn-no-library-KU-list-after-library-seed',learnAfterSeed.kuList===0,learnAfterSeed);
  check('LANE.learn-no-library-search-state',learnAfterSeed.librarySearch===0&&learnAfterSeed.libraryState===undefined,learnAfterSeed);
  check('LANE.learn-structured-domain-isolation',learnAfterSeed.domainKind==='learn'&&learnAfterSeed.domainIsolation===true,learnAfterSeed);
  check('LANE.learn-host-kind-donor-free',learnAfterSeed.hostKind==='DONOR_FREE_WORKSPACE_HOST',learnAfterSeed);
  check('LANE.learn-no-KU-identifiers-in-rendered-text',learnAfterSeed.kuTextHits.length===0,learnAfterSeed);
  check('LANE.learn-donor-scope-switch-suppressed-not-visible',
    learnAfterSeed.donorScope.length>0&&learnAfterSeed.donorScope.every(v=>v==='NOT_VISIBLE'),learnAfterSeed);
  check('LANE.learn-own-context-detail-tabs-remain-live',
    learnAfterSeed.learnDetailTabs.length>0&&learnAfterSeed.learnDetailTabs.every(t=>t.display!=='none'&&t.hidden===false&&t.inert===false),learnAfterSeed);
  check('N3.learn-route-renders-truthful-unavailable-not-synthetic',
    learnAfterSeed.sourceAvailable===false
    && /UNAVAILABLE_PROVIDER_UNBOUND/.test(await page.evaluate(()=>document.body.innerText)),
    learnAfterSeed);
  check('N3.learn-route-has-no-synthetic-learning-content',await page.evaluate(()=>{
    const t=(document.body.innerText||'').toLowerCase();
    return ['lorem ipsum','synthetic lesson','demo content','fixture lesson','acceptance seed'].filter(x=>t.includes(x));
  }).then(hits=>hits.length===0), 'banned tokens');

  /* ---- EN/LTR ---- */
  const en=await page.evaluate(()=>{
    CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences();
    const isolated=[...document.querySelectorAll('bdi')].map(n=>({dir:n.getAttribute('dir'),style:getComputedStyle(n).unicodeBidi,text:n.textContent.slice(0,40)}));
    return {
      lang:document.documentElement.lang,dir:document.documentElement.dir,
      isolatedCount:isolated.length,
      isolateCount:isolated.filter(i=>i.style.includes('isolate')).length,
      isolateRulePresent:[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>String(r.cssText).includes('unicode-bidi')&&String(r.cssText).includes('isolate'))}catch{return false}}),
      donorScope:[...document.querySelectorAll('#rightPane .contextscope')].filter(n=>!n.closest('.context-inspector')).map(n=>{const r=n.getBoundingClientRect();return (r.width>0&&r.height>0&&getComputedStyle(n).display!=='none')?'VISIBLE':'NOT_VISIBLE'}),
      sample:isolated.slice(0,4)
    };
  });
  check('BIDI.en-locale-drives-lang-and-dir',en.lang==='en'&&en.dir==='ltr',en);
  check('LANE.donor-scope-stays-suppressed-after-EN-flip',en.donorScope.length>0&&en.donorScope.every(v=>v==='NOT_VISIBLE'),en);
  check('BIDI.dom-isolate-evidence',en.isolatedCount>0&&en.isolateCount>0,en);
  check('BIDI.isolate-rule-present',en.isolateRulePresent===true,en);
  await shot(page,'learn-en-1440x1000-ltr');

  const ar=await page.evaluate(()=>{
    CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences();
    const t=document.body.innerText||'';
    return {
      lang:document.documentElement.lang,dir:document.documentElement.dir,
      domainKind:CEPFoundation.structured?.domainKind,
      domainIsolation:CEPFoundation.structured?.assertDomainIsolation?.().ok,
      hasArabic:t.includes('مسار التعلّم'),hasLatin:/Learning source unavailable/.test(t),
      donorScope:[...document.querySelectorAll('#rightPane .contextscope')].filter(n=>!n.closest('.context-inspector')).map(n=>{const r=n.getBoundingClientRect();return (r.width>0&&r.height>0&&getComputedStyle(n).display!=='none')?'VISIBLE':'NOT_VISIBLE'}),
      kuHits:['KU-D03-0001','KU-D03-0004'].filter(x=>t.includes(x))
    };
  });
  check('BIDI.ar-locale-drives-lang-and-dir',ar.lang==='ar'&&ar.dir==='rtl',ar);
  check('LANE.donor-scope-stays-suppressed-after-AR-flip',ar.donorScope.length>0&&ar.donorScope.every(v=>v==='NOT_VISIBLE'),ar);
  check('BIDI.ar-structure-and-isolation-held',ar.domainKind==='learn'&&ar.domainIsolation===true&&ar.kuHits.length===0,ar);
  await shot(page,'learn-ar-1440x1000-rtl');

  /* compact viewport, both directions */
  await page.setViewportSize({width:1024,height:900});
  await page.waitForTimeout(600);
  const compact=await page.evaluate(()=>{
    const box=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),hidden:!!el.hidden}};
    return {overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      left:box('#leftPane'),center:box('#centerPane'),right:box('#rightPane'),toolbar:box('.toolbar'),bottom:box('#bottomShelf'),
      lang:document.documentElement.lang,dir:document.documentElement.dir};
  });
  check('RESPONSIVE.1024x900-no-horizontal-overflow',compact.overflowX===false,compact);
  check('RESPONSIVE.1024x900.panes-present',Boolean(compact.left&&compact.left.w>0&&compact.center&&compact.center.w>0),compact);
  await shot(page,'learn-ar-1024x900-rtl');

  await page.evaluate(()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()});
  await page.waitForTimeout(500);
  await shot(page,'learn-en-1024x900-ltr');

  check('ENV.no-page-errors',pageErrors.length===0,{pageErrors});
}catch(fatal){
  results.push({id:'lane-probe.bootstrap',status:'FAIL',detail:String(fatal?.message||fatal)});
}finally{await browser.close();server.kill()}

const report={
  schemaVersion:1,kind:'LRN_1_LANE_BROWSER_PROBE',lane:'LRN-1',unit:'W02-LEARN',
  note:'Re-execution of the Learn/BIDI/structured-isolation assertions of flow spatial-input-bidi-preference-and-structured-isolation (that flow is red at its first, spatial assertion — outside LRN-1 roots) plus the lane Library-seed no-leak falsification.',
  commit,generatedAt:new Date().toISOString(),node:process.version,viewportMatrix:['1440x1000','1024x900'],locales:['en','ar'],
  total:results.length,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status!=='PASS').length,
  screenshots:shots,results
};
await writeFile(path.join(root,'writer-output/W02-LEARN/LANE_BROWSER_PROBE.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({total:report.total,pass:report.pass,fail:report.fail,failures:results.filter(r=>r.status!=='PASS'),shots:shots.length},null,2));
if(report.fail)process.exitCode=1;
