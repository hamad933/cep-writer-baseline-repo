/**
 * W03-SCENARIOS carrier proof — required surface semantics present AND donor/debug/foreign
 * semantics absent (WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD §10).
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
const check=(id,ok,detail='')=>results.push({id,status:ok?'PASS':'FAIL',detail:String(detail).slice(0,200)});

const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
const run=async(locale)=>{
  const ctx=await browser.newContext({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
  await ctx.addInitScript(l=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:l,chromeDirection:l==='ar'?'rtl':'ltr',contentDirection:l==='ar'?'rtl':'ltr'}}}))}catch{}},locale);
  const page=await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=scenarios`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='scenarios',null,{timeout:30000});
  await page.waitForTimeout(700);
  const d=await page.evaluate(()=>{
    const vis=sel=>[...document.querySelectorAll(sel)].filter(n=>!n.hidden&&n.offsetParent!==null);
    const txt=sel=>(document.querySelector(sel)?.innerText||'').replace(/\s+/g,' ').trim();
    const bodyText=(document.body.innerText||'').toLowerCase();
    return {
      consumer:document.body.dataset.consumer,
      leftHead:txt('#leftPane .phead h2'),
      rightHead:txt('#rightPane .phead h2'),
      bottomTitle:txt('#bottomShelf .bottomtitle'),
      structureRows:document.querySelectorAll('[data-scenario-structure] .w03-srow').length,
      structureText:txt('[data-scenario-structure]'),
      scen:document.querySelectorAll('#m0StructuredSpatial .w03-scen').length,
      rows:document.querySelectorAll('.w03-row').length,
      nodes:document.querySelectorAll('.w03-node').length,
      adders:document.querySelectorAll('.w03-add').length,
      legend:txt('.w03-legend'),
      inspectorSections:document.querySelectorAll('#domainContext .w03-isec').length,
      toolbar:txt('#domainToolbar'),
      tabs:[...document.querySelectorAll('.w03-tab')].filter(n=>n.offsetParent!==null).map(n=>n.textContent.trim()),
      palette:[...document.querySelectorAll('.w03-palette [data-tool]')].filter(n=>n.offsetParent!==null).map(n=>n.textContent.trim()),
      // ABSENCE probes
      donorLeft:[...document.querySelectorAll('#leftPane .structurewrap,#leftPane #kuList,#leftPane .library-search,#leftPane #structureTree,#leftPane .m0-domain-nav')].filter(n=>!n.hidden&&n.offsetParent!==null).map(n=>n.id||n.className),
      donorRight:[...document.querySelectorAll('#rightPane .pbody > *')].filter(n=>!n.hidden&&n.offsetParent!==null).map(n=>n.id||n.className),
      visibleEditor:!!(document.querySelector('#editorDocument')&&!document.querySelector('#editorDocument').hidden&&document.querySelector('#editorDocument').offsetParent!==null),
      filler:/(studio-node-[123]|lorem ipsum|placeholder text)/i.test(bodyText),
      foreignClasses:[...document.querySelectorAll('[class*="enterprise-"],[class*="today-"],[class*="w03-lab-"],[class*="s11-"]')].map(n=>String(n.className)).slice(0,6),
      genericCenter:[...document.querySelectorAll('#centerPane .m0-domain-nav,#centerPane .state-token')].filter(n=>n.offsetParent!==null).length
    };
  });
  const p=`${locale}:`;
  check(p+'consumer',d.consumer==='scenarios',d.consumer);
  check(p+'left-head',d.leftHead===(locale==='ar'?'بنية السيناريو':'Scenario Structure'),d.leftHead);
  check(p+'right-head',d.rightHead===(locale==='ar'?'مفتش السيناريو':'Scenario Inspector'),d.rightHead);
  check(p+'bottom-title',d.bottomTitle===(locale==='ar'?'منضدة عمل السيناريو':'Scenario workbench'),d.bottomTitle);
  check(p+'structure-rows',d.structureRows>=20,`rows=${d.structureRows}`);
  check(p+'structure-references',/Knowledge Units|وحدات المعرفة/.test(d.structureText)&&/Lab Library|مكتبة المختبرات/.test(d.structureText));
  check(p+'identity-present',d.scen===1);
  check(p+'timeline-structure',d.rows===4&&d.nodes===9&&d.adders===4,`${d.rows}/${d.nodes}/${d.adders}`);
  check(p+'legend-relations',/Sequence|التسلسل/.test(d.legend)&&/Conditional|الشرطي/.test(d.legend));
  check(p+'inspector-sections',d.inspectorSections>=4,`sections=${d.inspectorSections}`);
  check(p+'toolbar-commands',/Author Scenario|تأليف السيناريو/.test(d.toolbar)&&/Revise Scenario|مراجعة السيناريو/.test(d.toolbar),d.toolbar.slice(0,90));
  check(p+'view-tabs',JSON.stringify(d.tabs)===JSON.stringify(locale==='ar'?['الخط الزمني','التدفق','الطوبولوجيا','اللوحة']:['Timeline','Flow','Topology','Canvas']),JSON.stringify(d.tabs));
  check(p+'palette-tools',d.palette.length===7&&/Connect|ربط/.test(d.palette.join(' ')),JSON.stringify(d.palette));
  // absence
  check(p+'no-donor-left',d.donorLeft.length===0,JSON.stringify(d.donorLeft));
  check(p+'only-scenarios-right',JSON.stringify(d.donorRight)===JSON.stringify(['domainContext']),JSON.stringify(d.donorRight));
  check(p+'no-donor-document',d.visibleEditor===false,`visible=${d.visibleEditor}`);
  check(p+'no-filler-text',d.filler===false);
  check(p+'no-foreign-surface-classes',d.foreignClasses.length===0,JSON.stringify(d.foreignClasses));
  check(p+'no-generic-center',d.genericCenter===0,`count=${d.genericCenter}`);
  await ctx.close();
};
try{
  await run('en');
  await run('ar');
}finally{await browser.close();server.kill()}
const receipt={schemaVersion:1,proof:'W03-SCENARIOS-CARRIER',capturedAt:new Date().toISOString(),
  route:'/?surface=scenarios',pass:results.every(r=>r.status==='PASS'),
  passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results};
await writeFile(new URL('./CARRIER.json',import.meta.url),JSON.stringify(receipt,null,2));
console.log(results.map(r=>`${r.status} ${r.id}${r.detail?' · '+r.detail:''}`).join('\n'));
console.log(`\n${receipt.passed}/${results.length} PASS`);
