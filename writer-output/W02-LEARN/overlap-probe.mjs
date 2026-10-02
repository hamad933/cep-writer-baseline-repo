import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=process.cwd()+'/';
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=learn`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='learn',null,{timeout:60000});
  await page.waitForTimeout(1500);
  const out=await page.evaluate(()=>{
    const desc=el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className||'').slice(0,70),id:el.id||'',text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),pos:getComputedStyle(el).position,own:(el.childNodes.length?[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join('|'):'')}};
    const hits=[];
    const walk=n=>{if(n.nodeType!==1)return;const t=(n.textContent||'');
      if(/learn-unavailable/.test(t)||/طي الكل/.test(t))hits.push(desc(n));
      for(const c of n.children)walk(c)};
    walk(document.querySelector('.toolbar')||document.body);
    const tb=document.querySelector('.toolbar');
    const tbBox=tb?desc(tb):null;
    const overlap=(a,b)=>a&&b&&!(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);
    const fold=hits.filter(h=>h.text.includes('طي الكل')&&h.own.includes('طي الكل')).pop();
    const chip=hits.filter(h=>h.own.includes('learn-unavailable')).pop();
    return {toolbar:tbBox,fold,chip,overlap:overlap(fold,chip),hitCount:hits.length,hits:hits.slice(0,14)};
  });
  console.log(JSON.stringify(out,null,1));
}finally{await browser.close();server.kill()}
