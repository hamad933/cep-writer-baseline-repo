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
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:20000});
await page.waitForTimeout(2000);
const out=await page.evaluate(()=>{
  const g=[...document.querySelectorAll('[data-lab-graph] g[data-node]')];
  const cards=g.map(n=>{const r=n.querySelector('.node-surface').getBoundingClientRect();
    const title=n.querySelector('.node-title'),sub=n.querySelector('.node-secondary-line');
    const tr=title.getBoundingClientRect(),sr=sub.getBoundingClientRect();
    return {id:n.dataset.node,box:[Math.round(r.x),Math.round(r.y),Math.round(r.right),Math.round(r.bottom)],
      title:title.textContent, titleLines:title.querySelectorAll('tspan').length||1,
      titleBox:[Math.round(tr.x),Math.round(tr.right)],
      sub:sub.textContent, subLines:sub.querySelectorAll('tspan').length||1,
      over:Math.max(0,Math.round(tr.right-r.right)), subOver:Math.max(0,Math.round(sr.right-r.right)),
      aria:n.getAttribute('aria-label')};});
  const overlaps=[];
  for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
    const a=cards[i].box,b=cards[j].box;
    const ox=Math.min(a[2],b[2])-Math.max(a[0],b[0]),oy=Math.min(a[3],b[3])-Math.max(a[1],b[1]);
    if(ox>0&&oy>0)overlaps.push([cards[i].id,cards[j].id,ox,oy]);
  }
  const edges=[...document.querySelectorAll('[data-lab-graph] line.relation-line')].map(l=>({x1:+l.getAttribute('x1'),y1:+l.getAttribute('y1'),x2:+l.getAttribute('x2'),y2:+l.getAttribute('y2')}));
  const markers=[...document.querySelectorAll('[data-lab-graph] marker')].length;
  const canvas=document.querySelector('[data-lab-graph]').getBoundingClientRect();
  const allIn=cards.every(c=>c.box[0]>=canvas.left-1&&c.box[2]<=canvas.right+1&&c.box[1]>=canvas.top-1&&c.box[3]<=canvas.bottom+1);
  return {cards,overlaps,edgeCount:edges.length,edges:edges.slice(0,4),markers,canvas:[Math.round(canvas.width),Math.round(canvas.height)],allInsideCanvas:allIn};
});
console.log(JSON.stringify(out,null,1));
await browser.close();server.kill();process.exit(0);
