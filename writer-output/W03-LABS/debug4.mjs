import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'writer-output/W03-LABS/serve-site.mjs'),'--port',String(port),'--root',path.join(root,'dist')],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,900));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
page.on('pageerror',e=>console.log('PAGEERROR:',String(e.message).slice(0,300)));
await page.goto(`http://127.0.0.1:${port}/?surface=labs`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:30000});
await page.waitForSelector('[data-lab-graph] g[data-node]',{timeout:20000});
await page.waitForTimeout(1500);

const edges=()=>page.evaluate(()=>[...document.querySelectorAll('[data-lab-graph] [data-edge]')].map(g=>({edge:g.getAttribute('data-edge'),cls:g.getAttribute('data-edge-class'),label:(g.querySelector('.relation-label')?.textContent||'').trim(),dash:g.querySelector('line.relation-line')?.getAttribute('stroke-dasharray')||'',aria:(g.getAttribute('aria-label')||'').slice(0,120)})));
console.log('edges initial', JSON.stringify(await edges(),null,1));

/* --- R10 path: pointerdown with Shift held, measure before pointerup --- */
const box2=await page.locator('[data-lab-graph] [data-node="TASK-2"] .node-surface').boundingBox();
const box5=await page.locator('[data-lab-graph] [data-node="TASK-5"] .node-surface').boundingBox();
await page.mouse.move(box2.x+box2.width/2, box2.y+box2.height/2);
await page.keyboard.down('Shift');
await page.mouse.down();
await page.waitForTimeout(250);
const during=await page.evaluate(()=>{
  const b=document.querySelector('.spatial-multi-selection-group .group-boundary');
  const pressed=[...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"]')].map(g=>g.getAttribute('data-node'));
  const cards=[...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"] .node-surface')].map(r=>{const q=r.getBoundingClientRect();return {l:Math.round(q.left),r:Math.round(q.right)}});
  const rect=b?b.getBoundingClientRect():null;
  const minimap=[...document.querySelectorAll('.minimap rect')].map(t=>({w:+t.getAttribute('width'),h:+t.getAttribute('height')}));
  return {pressed,boundary:rect?{l:Math.round(rect.left),r:Math.round(rect.right),t:Math.round(rect.top),b:Math.round(rect.bottom)}:null,cards,minimapCount:minimap.length,tiles:minimap.slice(0,2)};
});
console.log('during shift+pointerdown', JSON.stringify(during));
await page.mouse.up();
await page.keyboard.up('Shift');
await page.waitForTimeout(250);
const after=await page.evaluate(()=>({pressed:[...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"]')].map(g=>g.getAttribute('data-node')),boundary:!!document.querySelector('.spatial-multi-selection-group .group-boundary'),readout:(document.querySelector('.spatial-readout')?.innerText||'').trim()}));
console.log('after release', JSON.stringify(after));

/* --- R09 path: author a conditional edge through the bus, then re-render --- */
// pick a usable pair by trying candidates until the domain accepts (duplicate/unknown pairs throw)
const ids=await page.evaluate(()=>[...document.querySelectorAll('[data-lab-graph] [data-node]')].map(g=>g.getAttribute('data-node')));
let chosen=null,connectResult=null;
for(const [i,a] of ids.entries()){
  if(chosen)break;
  for(const b of ids.slice(i+1)){
    const r=await page.evaluate(([from,to])=>{
      const bus=window.CEPFoundation.commandBus;
      try{const res=bus.execute('labs.author',{op:'connect',edge:{id:'EDGE-COND-PROBE',from,to,type:'conditional',condition:'when generated signals are already explained'}});
        return {accepted:true,ok:res?.ok??null,snapshot:res?.snapshot?{lifecycle:res.snapshot.lifecycle}:null}}
      catch(e){return {accepted:false,error:String(e.message).slice(0,120)}}
    },[a,b]);
    if(r.accepted){chosen=[a,b];connectResult=r;break}
    if(!/LAB_EDGE_DUPLICATE/.test(r.error||''))console.log('connect rejected', a, b, JSON.stringify(r));
  }
}
console.log('chosen pair', JSON.stringify(chosen), 'connect', JSON.stringify(connectResult));
// re-render via structure rail click
await page.locator('#domainLeftRegion [data-step="TASK-3"]').click();
await page.waitForTimeout(600);
console.log('edges after conditional author', JSON.stringify(await edges(),null,1));
await browser.close();server.kill();process.exit(0);
