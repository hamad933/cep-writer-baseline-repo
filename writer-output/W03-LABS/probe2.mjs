import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo';
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const port=await freePort();
const server=spawn(process.execPath,[root+'/tools/serve.mjs','--port',String(port)],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,1500));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
await page.goto(`http://127.0.0.1:${port}/?surface=labs`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:25000});
await page.waitForTimeout(3000);
console.log(JSON.stringify(await page.evaluate(()=>{
  const svg=document.querySelector('[data-lab-graph] .spatial-canvas');
  const surf=svg.querySelector('.node-surface');
  const cam=svg.querySelector('g[transform]').getAttribute('transform');
  const r=surf.getBoundingClientRect();
  const m=/scale\(([\d.]+)\)/.exec(cam);
  const zoom=m?parseFloat(m[1]):1;
  const halfW=r.width/zoom/2;
  const available=Math.max(48,2*halfW-31-6);
  const t=svg.querySelector('[data-node="TASK-5"] .node-title');
  const saved=t.textContent;
  t.textContent='Generated Signals';
  const w2=t.getComputedTextLength();
  t.textContent='Interpret Generated Signals';
  const wfull=t.getComputedTextLength();
  t.textContent=saved;
  return {cardW:r.width,zoom,halfW:halfW,available,w2,wfull,
    fontSize:getComputedStyle(t).fontSize,fontWeight:getComputedStyle(t).fontWeight,
    fontFamily:getComputedStyle(t).fontFamily.slice(0,60),
    styleApplied:!!document.querySelector('style[data-w03-labs-style]')};
}),null,1));
await browser.close();server.kill();process.exit(0);
