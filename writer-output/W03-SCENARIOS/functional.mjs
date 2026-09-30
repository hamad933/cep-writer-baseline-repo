/**
 * W03-SCENARIOS functional proof — real interactions on the genuine local route.
 * Each step asserts a DOM/state change; failures are reported, never assumed.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {writeFile} from 'node:fs/promises';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const results=[];
const check=(name,ok,detail='')=>{results.push({id:name,status:ok?'PASS':'FAIL',detail:String(detail).slice(0,220)})};

const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
const open=async(locale='en',w=1505,h=1045)=>{
  const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
  await ctx.addInitScript(l=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:l,chromeDirection:l==='ar'?'rtl':'ltr',contentDirection:l==='ar'?'rtl':'ltr'}}}))}catch{}},locale);
  const page=await ctx.newPage();
  page.on('pageerror',e=>results.push({id:'pageerror',status:'FAIL',detail:String(e?.message||e)}));
  await page.goto(`http://127.0.0.1:${port}/?surface=scenarios`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='scenarios',null,{timeout:30000});
  await page.waitForTimeout(700);
  return {ctx,page};
};
const txt=(page,sel)=>page.evaluate(s=>document.querySelector(s)?.textContent?.replace(/\s+/g,' ').trim()||null,sel);

try{
  /* ---------------- 1. identity + regions */
  let {ctx,page}=await open('en');
  check('left-pane-region',await txt(page,'#leftPane .phead h2')==='Scenario Structure');
  check('right-pane-region',await txt(page,'#rightPane .phead h2')==='Scenario Inspector');
  check('donor-panes-suppressed',await page.evaluate(()=>[...document.querySelectorAll('#rightPane .pbody > *')].filter(c=>!c.hidden&&c.offsetParent!==null).every(c=>c.id==='domainContext')));
  check('donor-document-hidden',await page.evaluate(()=>document.querySelector('#editorDocument').hidden===true));
  check('timeline-rows',await page.locator('.w03-row').count()===4);
  check('element-cards',await page.locator('.w03-node').count()===9);
  check('add-element-per-phase',await page.locator('.w03-add').count()===4);

  /* ---------------- 2. selection drives the inspector */
  await page.locator('.w03-node').nth(1).click();
  await page.waitForTimeout(200);
  const insp=await txt(page,'#domainContext');
  check('inspect-select-element',insp.includes('Inject')&&insp.includes('Malicious Link Delivery'),insp.slice(0,120));
  check('inspect-shows-recipient',insp.includes('Recipient')&&insp.includes('SOC Analyst'));
  check('inspect-shows-branch',insp.includes('Branch impact'));
  check('card-aria-pressed',await page.locator('.w03-node').nth(1).getAttribute('aria-pressed')==='true');

  /* ---------------- 3. structure pane → phase selection */
  await page.locator('[data-scenario-structure] [data-phase="PHASE-03"]').click();
  await page.waitForTimeout(200);
  check('select-phase',await page.locator('.w03-row[data-phase-row="PHASE-03"]').getAttribute('data-selected')==='true');
  const insp2=await txt(page,'#domainContext');
  check('inspect-phase-contents',insp2.includes('Contents')&&insp2.includes('Detection'),insp2.slice(0,120));

  /* ---------------- 4. view switching (4 real projections) */
  const views={flow:'.w03-flow',topology:'.w03-topo',canvas:'.w03-columns',timeline:'.w03-lanes'};
  for(const [view,sel] of Object.entries(views)){
    await page.locator(`.w03-tab[data-view="${view}"]`).click();
    await page.waitForTimeout(view==='topology'?600:250);
    check(`view-${view}`,await page.locator(sel).count()===1,`selector ${sel}`);
    if(view==='topology')check('topology-nodes',await page.evaluate(()=>document.querySelectorAll('.w03-topo [data-node]').length)>=9,`nodes=${await page.evaluate(()=>document.querySelectorAll('.w03-topo [data-node]').length)}`);
    if(view==='topology')check('topology-edges',await page.evaluate(()=>document.querySelectorAll('.w03-topo [data-edge]').length)>=8,`edges=${await page.evaluate(()=>document.querySelectorAll('.w03-topo [data-edge]').length)}`);
  }
  await page.locator('.w03-tab[data-view="timeline"]').click();
  await page.waitForTimeout(250);

  /* ---------------- 5. authoring: add element + add phase */
  const cardsBefore=await page.locator('.w03-node').count();
  await page.locator('.w03-add').first().click();
  await page.waitForTimeout(250);
  check('add-element',await page.locator('.w03-node').count()===cardsBefore+1,`before ${cardsBefore}`);
  check('add-element-status',String(await txt(page,'.w03-status')||'').includes('added'),await txt(page,'.w03-status'));
  await page.locator('[data-tool="phase"]').click();
  await page.waitForTimeout(250);
  check('add-phase',await page.locator('.w03-row').count()===5);

  /* ---------------- 6. overflow menu authoring (still DRAFT) */
  await page.locator('[data-menu="authoring"]').click();
  await page.waitForTimeout(150);
  check('authoring-menu-opens',await page.locator('[data-menu-panel="authoring"]').isVisible());
  await page.locator('[data-menu-panel="authoring"] [data-tool="task"]').click();
  await page.waitForTimeout(300);
  check('menu-add-task',await page.locator('.w03-node').count()===cardsBefore+2,`count ${await page.locator('.w03-node').count()}`);

  /* ---------------- 7. validation lifecycle (bound environment fixture) */
  await page.locator('[data-action="validate"]').click();
  await page.waitForTimeout(250);
  check('validate-status',String(await txt(page,'.w03-status')||'').includes('Validation complete'),await txt(page,'.w03-status'));
  const publishEnabled=await page.locator('[data-action="publish"]').isEnabled();
  check('publish-enabled-after-validate',publishEnabled===true,String(publishEnabled));
  await page.locator('[data-action="publish"]').click();
  await page.waitForTimeout(250);
  check('publish-status',String(await txt(page,'.w03-status')||'').includes('published'),await txt(page,'.w03-status'));
  const prepareEnabled=await page.locator('[data-action="prepare"]').isEnabled();
  check('prepare-enabled-after-publish',prepareEnabled===true,String(prepareEnabled));
  await page.locator('[data-action="prepare"]').click();
  await page.waitForTimeout(250);
  check('prepare-no-run',String(await txt(page,'.w03-status')||'').includes('no run started'),await txt(page,'.w03-status'));

  /* ---------------- 7. connect two elements (shared relation kernel) */
  await page.locator('[data-tool="connect"]').click();
  await page.waitForTimeout(200);
  await page.locator('.w03-node').nth(0).click();
  await page.waitForTimeout(200);
  check('connect-source-status',String(await txt(page,'.w03-status')||'').toLowerCase().includes('target'),await txt(page,'.w03-status'));
  await page.locator('.w03-node').nth(5).click();
  await page.waitForTimeout(300);
  check('connect-committed',String(await txt(page,'.w03-status')||'').toLowerCase().includes('connected'),await txt(page,'.w03-status'));
  check('link-count-updated',String(await txt(page,'.w03-board-meta')||'').includes('1 link'),await txt(page,'.w03-board-meta'));

  /* ---------------- 8. published revision is immutable (truthful blocked feedback) */
  const cardsPublished=await page.locator('.w03-node').count();
  await page.locator('.w03-add').first().click();
  await page.waitForTimeout(300);
  check('published-authoring-blocked',await page.locator('.w03-node').count()===cardsPublished,`count ${await page.locator('.w03-node').count()}`);
  check('published-authoring-status',/immutable|IMMUTABLE|published/i.test(String(await txt(page,'.w03-status')||'')),await txt(page,'.w03-status'));

  /* ---------------- 9. shell toolbar contract */
  const toolbar=await page.locator('#domainToolbar').innerText().catch(()=>'');
  check('toolbar-scenario-commands',/Author Scenario/.test(toolbar)&&/Revise Scenario/.test(toolbar),toolbar.replace(/\s+/g,' ').slice(0,120));

  /* ---------------- 10. narrow viewport: right pane collapse + no overlap */
  await page.setViewportSize({width:1024,height:800});
  await page.waitForTimeout(400);
  const narrow=await page.evaluate(()=>({
    rightState:document.querySelector('#rightPane')?.dataset.state,
    bodyRight:document.body.dataset.right,
    overlap:(()=>{const r=document.querySelector('.centerrail')?.getBoundingClientRect(),t=document.querySelector('.w03-tab')?.getBoundingClientRect();return r&&t?r.y<t.bottom&&t.y<r.bottom&&r.x<t.right&&t.x<r.right:false})(),
    rows:document.querySelectorAll('.w03-row').length,
    clipped:[...document.querySelectorAll('#m0StructuredSpatial .w03-node .tt,#m0StructuredSpatial .w03-srow,#m0StructuredSpatial .w03-btn')].filter(n=>n.scrollWidth>n.clientWidth+2).length
  }));
  check('narrow-no-centerrail-overlap',narrow.overlap===false,JSON.stringify(narrow));
  check('narrow-no-clipped-controls',narrow.clipped===0,`clipped=${narrow.clipped}`);
  check('narrow-rows-preserved',narrow.rows===5,`rows=${narrow.rows}`);
  await ctx.close();

  /* ---------------- 11. RTL mirror */
  ({ctx,page}=await open('ar'));
  const rtl=await page.evaluate(()=>({
    dir:document.documentElement.dir,
    leftHead:document.querySelector('#leftPane .phead h2')?.textContent,
    tabX:Math.round(document.querySelector('.w03-tab')?.getBoundingClientRect().x||0),
    actionsX:Math.round(document.querySelector('.w03-bar-actions')?.getBoundingClientRect().x||0),
    addX:Math.round(document.querySelector('.w03-add')?.getBoundingClientRect().x||0),
    railX:Math.round(document.querySelector('.w03-rail')?.getBoundingClientRect().x||0),
    laneX:Math.round(document.querySelector('.w03-lane')?.getBoundingClientRect().x||0),
    bodyDir:document.body.dataset.foundationDirection
  }));
  check('rtl-direction',rtl.dir==='rtl'&&rtl.bodyDir==='rtl',JSON.stringify(rtl));
  check('rtl-localized-structure',rtl.leftHead==='بنية السيناريو',rtl.leftHead);
  check('rtl-tabs-mirrored',rtl.tabX>rtl.actionsX+400,`tabX=${rtl.tabX} actionsX=${rtl.actionsX}`);
  check('rtl-actions-mirrored',rtl.actionsX<600,`actionsX=${rtl.actionsX}`);
  check('rtl-rail-mirrored',rtl.railX>rtl.laneX,`rail=${rtl.railX} lane=${rtl.laneX}`);
  check('rtl-add-mirrored',rtl.addX<600,`addX=${rtl.addX}`);
  const rtlToolbar=await page.locator('#domainToolbar').innerText().catch(()=>'');
  check('rtl-toolbar-localized',/تأليف السيناريو/.test(rtlToolbar)&&/تحضير تشغيل|مراجعة السيناريو/.test(rtlToolbar),rtlToolbar.replace(/\s+/g,' ').slice(0,140));
  await page.locator('.w03-node').nth(3).click();
  await page.waitForTimeout(250);
  const arInsp=await txt(page,'#domainContext');
  check('rtl-inspector-localized',/النوع|الموضع|التحقق/.test(arInsp||''),(arInsp||'').slice(0,120));
  await ctx.close();
}finally{
  await browser.close();
  server.kill();
}

const receipt={schemaVersion:1,proof:'W03-SCENARIOS-FUNCTIONAL',capturedAt:new Date().toISOString(),
  route:'/?surface=scenarios',renderMethod:'GENUINE_ROUTE_LOCAL_BROWSER',
  pass:results.every(r=>r.status==='PASS'),passed:results.filter(r=>r.status==='PASS').length,
  failed:results.filter(r=>r.status==='FAIL').length,results};
await writeFile(new URL('./FUNCTIONAL.json',import.meta.url),JSON.stringify(receipt,null,2));
console.log(results.map(r=>`${r.status} ${r.id}${r.detail?' · '+r.detail:''}`).join('\n'));
console.log(`\n${receipt.passed}/${results.length} PASS`);
