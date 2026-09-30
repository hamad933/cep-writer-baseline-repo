/**
 * W03-SCENARIOS geometry probe — deterministic layout evidence (no vision channel needed).
 * Reports: region rects, wrap/line grouping, clipping, overlap, fold position, direction facts.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {writeFile} from 'node:fs/promises';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPathRoot();
function fileURLToPathRoot(){return new URL('../../',import.meta.url).pathname}

const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const cases=[
  {w:1505,h:1045,locale:'en'},
  {w:1280,h:860,locale:'en'},
  {w:1024,h:800,locale:'en'},
  {w:1505,h:1045,locale:'ar'},
  {w:1024,h:800,locale:'ar'}
];

const inspect=()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),r:Math.round(r.right)}};
  const lines=nodes=>{const map=new Map();nodes.forEach(el=>{const y=Math.round(el.getBoundingClientRect().y);if(!map.has(y))map.set(y,[]);map.get(y).push(el)});return [...map.entries()].sort((a,b)=>a[0]-b[0]).map(([y,els])=>({y,items:els.map(e=>(e.textContent||'').trim().slice(0,22)),x:els.map(e=>Math.round(e.getBoundingClientRect().x))}))};
  const clipped=[...document.querySelectorAll('#m0StructuredSpatial *,#leftPane .pbody #domainLeftRegion *,#rightPane .pbody #domainContext *')].filter(n=>n.scrollWidth>n.clientWidth+2&&n.clientWidth>0).map(n=>({tag:n.tagName,cls:String(n.className).slice(0,40),txt:(n.textContent||'').trim().slice(0,40),sw:n.scrollWidth,cw:n.clientWidth}));
  const rail=document.querySelector('.centerrail');
  const railRect=rail?rect(rail):null;
  const tab=document.querySelector('.w03-tab');
  const overlap=(a,b)=>a&&b&&a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b;
  const doc=document.querySelector('#centerPane .docscroll');
  const laneAdd=[...document.querySelectorAll('.w03-lane')].map(lane=>{
    const nodes=[...lane.querySelectorAll('.w03-node,.w03-arrow')];
    const add=lane.querySelector('.w03-add');
    const last=nodes[nodes.length-1];
    return add&&last?{sameLine:Math.abs(add.getBoundingClientRect().y-last.getBoundingClientRect().y)<12,addX:Math.round(add.getBoundingClientRect().x),lastR:Math.round(last.getBoundingClientRect().right),laneR:Math.round(lane.getBoundingClientRect().right)}:null;
  });
  const paletteLines=lines([...document.querySelectorAll('.w03-palette .w03-btn,.w03-palette .w03-sep')]);
  const barLines=lines([...document.querySelectorAll('.w03-bar .w03-tab,.w03-bar .w03-btn')]);
  const rows=[...document.querySelectorAll('.w03-row')].map(r=>({h:Math.round(r.getBoundingClientRect().height),phase:r.dataset.phaseRow}));
  const legend=document.querySelector('.w03-legend');
  const visibleLegend=legend?legend.getBoundingClientRect().bottom<=innerHeight:false;
  return {
    dir:document.documentElement.dir,lang:document.documentElement.lang,
    viewport:{w:innerWidth,h:innerHeight},
    railRect,tabRect:tab?rect(tab):null,railTabOverlap:overlap(railRect,tab?rect(tab):null),
    structureHead:(document.querySelector('#leftPane .phead h2')||{}).textContent,
    inspectorHead:(document.querySelector('#rightPane .phead h2')||{}).textContent,
    bottomTitle:(document.querySelector('#bottomShelf .bottomtitle')||{}).textContent,
    centerrailLabels:[...document.querySelectorAll('[data-pane-toggle-label]')].map(n=>n.textContent),
    docFold:{scroll:doc?.scrollHeight,client:doc?.clientHeight,overflow:(doc?.scrollHeight||0)-(doc?.clientHeight||0)},
    legendVisible:visibleLegend,legendRect:legend?rect(legend):null,
    rows,paletteLines,barLines,laneAdd,clipped:clipped.slice(0,14),
    boardRect:document.querySelector('.w03-board')?rect(document.querySelector('.w03-board')):null,
    leftRect:document.querySelector('#leftPane')?rect(document.querySelector('#leftPane')):null,
    rightRect:document.querySelector('#rightPane')?rect(document.querySelector('#rightPane')):null,
    rightVisibleKids:[...document.querySelectorAll('#rightPane .pbody > *')].filter(c=>!c.hidden&&c.offsetParent!==null).map(c=>c.id||c.className),
    leftVisibleKids:[...document.querySelectorAll('#leftPane .pbody > *')].filter(c=>!c.hidden&&c.offsetParent!==null).map(c=>c.id||c.className),
    structureRows:document.querySelectorAll('[data-scenario-structure] .w03-srow').length,
    inspectorSections:document.querySelectorAll('#domainContext .w03-isec').length,
    status:(document.querySelector('.w03-status')||{}).textContent
  };
};

const out=[];
const server0=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(await freePort())],{cwd:root,stdio:'ignore'});
server0.kill();
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
try{
  for(const c of cases){
    const ctx=await browser.newContext({viewport:{width:c.w,height:c.h},reducedMotion:'reduce'});
    await ctx.addInitScript(p=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:p.locale,chromeDirection:p.locale==='ar'?'rtl':'ltr',contentDirection:p.locale==='ar'?'rtl':'ltr'}}}))}catch{}},c);
    const page=await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/?surface=scenarios`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.CEPFoundation?.consumer==='scenarios',null,{timeout:30000});
    await page.waitForTimeout(800);
    out.push({case:`${c.w}x${c.h}:${c.locale}`,data:await page.evaluate(inspect)});
    await ctx.close();
  }
}finally{await browser.close();server.kill()}
await writeFile(new URL('./GEOMETRY.json',import.meta.url),JSON.stringify({schemaVersion:1,proof:'W03-SCENARIOS-GEOMETRY',capturedAt:new Date().toISOString(),cases:out},null,2));
for(const row of out){
  const d=row.data;
  console.log(`\n=== ${row.case} dir=${d.dir} lang=${d.lang}`);
  console.log(' heads:',JSON.stringify([d.structureHead,d.inspectorHead,d.bottomTitle,d.centerrailLabels]));
  console.log(' railTabOverlap:',d.railTabOverlap,'tabRect:',JSON.stringify(d.tabRect),'railRect:',JSON.stringify(d.railRect));
  console.log(' docFold:',JSON.stringify(d.docFold),'legendVisible:',d.legendVisible);
  console.log(' rows:',JSON.stringify(d.rows));
  console.log(' paletteLines:',JSON.stringify(d.paletteLines));
  console.log(' laneAdd:',JSON.stringify(d.laneAdd));
  console.log(' clipped:',JSON.stringify(d.clipped));
  console.log(' panes:',JSON.stringify({left:d.leftVisibleKids,right:d.rightVisibleKids,structureRows:d.structureRows,inspectorSections:d.inspectorSections}));
  console.log(' status:',JSON.stringify(d.status));
}
