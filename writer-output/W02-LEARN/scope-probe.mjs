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
  await page.waitForTimeout(1200);
  const out=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('.contextscope')];
    return els.map(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      return {hidden:el.hidden,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,w:r.width,h:r.height,x:Math.round(r.x),y:Math.round(r.y),
        text:(el.innerText||'').replace(/\s+/g,' ').slice(0,120),buttons:el.querySelectorAll('button').length,
        parentHidden:el.parentElement?.hidden,parentDisplay:getComputedStyle(el.parentElement).display, cls:el.className,
        inLeft:!!el.closest('#leftPane'), inCenter:!!el.closest('#centerPane'), inRight:!!el.closest('#rightPane'), inInspector:!!el.closest('#wave3ContextInspectorHost')};
    });
  });
  console.log(JSON.stringify(out,null,2));
}finally{await browser.close();server.kill()}
