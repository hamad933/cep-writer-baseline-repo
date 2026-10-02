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
const state=()=>page.evaluate(()=>({
  pressed:[...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"]')].map(g=>g.getAttribute('data-node')),
  readout:(document.querySelector('.spatial-readout')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,160),
  boundary:!!document.querySelector('.spatial-multi-selection-group .group-boundary'),
  boundaryRect:(()=>{const b=document.querySelector('.spatial-multi-selection-group .group-boundary');if(!b)return null;const r=b.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),t:Math.round(r.top),b:Math.round(r.bottom)}})(),
}));
console.log('initial', JSON.stringify(await state()));
await page.locator('[data-lab-graph] [data-node="TASK-1"]').click();
await page.waitForTimeout(400);
console.log('after click TASK-1', JSON.stringify(await state()));
await page.locator('[data-lab-graph] [data-node="TASK-2"]').click({modifiers:['Shift']});
await page.waitForTimeout(400);
console.log('after shift+click TASK-2', JSON.stringify(await state()));
await page.locator('[data-lab-graph] [data-node="TASK-3"]').click({modifiers:['Shift']});
await page.waitForTimeout(400);
console.log('after shift+click TASK-3', JSON.stringify(await state()));
// keyboard path: focus a node, then Shift+Arrow to extend
await page.locator('[data-lab-graph] [data-node="TASK-1"]').click();
await page.waitForTimeout(300);
await page.keyboard.press('Shift+ArrowRight');
await page.waitForTimeout(400);
console.log('after shift+arrow', JSON.stringify(await state()));
// diagnostic: how does the kernel define selection?
const diag=await page.evaluate(()=>{
  const svg=document.querySelector('[data-lab-graph] .spatial-canvas');
  return {hasSvg:!!svg, instance:svg?.getAttribute('data-spatial-instance'),
    multiGroupCss:!!document.querySelector('.spatial-multi-selection-group'),
    nodeAttrs:[...document.querySelectorAll('[data-lab-graph] [data-node]')].map(g=>({id:g.getAttribute('data-node'),pressed:g.getAttribute('aria-pressed')}))};
});
console.log('diag', JSON.stringify(diag));
await browser.close();server.kill();process.exit(0);
