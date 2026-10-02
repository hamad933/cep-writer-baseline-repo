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
  for(const [w,h] of [[1440,1000],[1024,900]]){
    const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
    const page=await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/?surface=learn`,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.CEPFoundation?.consumer==='learn',null,{timeout:60000});
    await page.waitForTimeout(1500);
    const out=await page.evaluate(()=>{
      const chain=el=>{const a=[];let n=el;while(n&&n!==document.body){a.push(`${n.tagName}${n.id?'#'+n.id:''}.${String(n.className||'').split(' ').filter(Boolean).join('.')}`);n=n.parentElement;}return a;};
      return [...document.querySelectorAll('#rightPane .contextscope, .contextscope')].map(el=>{
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return {chain:chain(el),text:(el.innerText||'').replace(/\s+/g,' ').slice(0,70),
          hidden:el.hidden,inert:!!el.inert,display:cs.display,inlineDisplay:el.style.display,
          suppressed:el.dataset.learnDonorScopeSuppressed||null,
          w:Math.round(r.width),h:Math.round(r.height),visible:(r.width>0&&r.height>0&&cs.display!=='none')};
      });
    });
    console.log(`=== ${w}x${h} ===`);
    console.log(JSON.stringify(out,null,1));
    await ctx.close();
  }
}finally{await browser.close();server.kill()}
