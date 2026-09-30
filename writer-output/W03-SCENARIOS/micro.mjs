/**
 * W03-SCENARIOS L4 micro-detail probe — type scale, spacing scale, radius set, alignment.
 * Deterministic computed-style measurements (no vision channel involved).
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
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
let out={};
try{
  const ctx=await browser.newContext({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
  await ctx.addInitScript(()=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'}}}))}catch{}});
  const page=await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=scenarios`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='scenarios',null,{timeout:30000});
  await page.waitForTimeout(700);
  out=await page.evaluate(()=>{
    const scope=document.querySelector('#m0StructuredSpatial');
    const left=document.querySelector('#domainLeftRegion');
    const right=document.querySelector('#domainContext');
    const all=[...scope.querySelectorAll('*'),...left.querySelectorAll('*'),...right.querySelectorAll('*')];
    const sizes=new Set(),weights=new Set(),radii=new Set(),paddings=new Set(),gaps=new Set();
    for(const el of all){
      const cs=getComputedStyle(el);
      sizes.add(parseFloat(cs.fontSize).toFixed(1));
      weights.add(cs.fontWeight);
      radii.add(cs.borderTopLeftRadius);
      if(cs.paddingTop!=='0px'||cs.paddingLeft!=='0px')paddings.add(`${cs.paddingTop}/${cs.paddingLeft}`);
      if(cs.rowGap!=='normal')gaps.add(cs.rowGap);
    }
    const rect=sel=>{const n=document.querySelector(sel);if(!n)return null;const r=n.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
    const nodeLefts=[...document.querySelectorAll('.w03-row')].map(row=>Math.round(row.querySelector('.w03-node').getBoundingClientRect().x));
    const railCenters=[...document.querySelectorAll('.w03-num')].map(n=>{const r=n.getBoundingClientRect();return Math.round(r.x+r.width/2)});
    const tabBottoms=[...document.querySelectorAll('.w03-tab')].map(n=>Math.round(n.getBoundingClientRect().bottom));
    const paletteTops=[...document.querySelectorAll('.w03-palette .w03-btn')].map(n=>Math.round(n.getBoundingClientRect().top));
    const actionTops=[...document.querySelectorAll('.w03-bar-actions .w03-btn')].map(n=>Math.round(n.getBoundingClientRect().top));
    const rowPad=[...document.querySelectorAll('.w03-row')].map(n=>getComputedStyle(n.querySelector('.w03-lane')).padding);
    return {
      typeScale:[...sizes].map(Number).sort((a,b)=>a-b),
      weightScale:[...weights].sort(),
      radiusSet:[...radii].sort(),
      paddingSet:[...paddings].sort(),
      gapSet:[...gaps].sort(),
      cardLeftEdges:nodeLefts,cardLeftAligned:new Set(nodeLefts).size===1,
      railCenters,railAligned:new Set(railCenters).size<=2,
      tabBottoms,tabsAligned:new Set(tabBottoms).size===1,
      paletteTops,paletteAligned:new Set(paletteTops).size<=2,
      actionTops,actionsAligned:new Set(actionTops).size===1,
      rowPadding:rowPad,rowPaddingConsistent:new Set(rowPad).size===1,
      rects:{bar:rect('.w03-bar'),palette:rect('.w03-palette'),board:rect('.w03-board'),head:rect('.w03-board-head'),legend:rect('.w03-legend'),lane:rect('.w03-lane'),node:rect('.w03-node'),add:rect('.w03-add')},
      scroll:{sw:scope.scrollWidth,cw:scope.clientWidth}
    };
  });
}finally{await browser.close();server.kill()}
await writeFile(new URL('./MICRO.json',import.meta.url),JSON.stringify({schemaVersion:1,proof:'W03-SCENARIOS-L4-MICRO',capturedAt:new Date().toISOString(),data:out},null,2));
console.log(JSON.stringify(out,null,1));
