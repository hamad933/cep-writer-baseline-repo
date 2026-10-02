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
    const chain=el=>{const a=[];let n=el;while(n&&n!==document.body){a.push(`${n.tagName}${n.id?'#'+n.id:''}.${String(n.className||'').split(' ').filter(Boolean).join('.')}`);n=n.parentElement;}return a;};
    const rules=[];
    const sheets=[...document.styleSheets];
    for(const sheet of sheets){
      let list=null;
      try{list=sheet.cssRules;}catch(e){continue;}
      if(!list)continue;
      for(const r of list){
        if(r.selectorText&&/contextscope/.test(r.selectorText)){
          rules.push({sel:r.selectorText,css:String(r.style&&r.style.cssText||'').slice(0,240),href:sheet.href?'external':'inline'});
        }
      }
    }
    return {
      nodes:[...document.querySelectorAll('#rightPane .contextscope')].map(el=>({
        chain:chain(el),text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
        display:getComputedStyle(el).display,hidden:el.hidden,inert:!!el.inert,
        label:el.getAttribute('aria-label'),tabCount:el.querySelectorAll('button,[role=tab]').length
      })),
      rules
    };
  });
  console.log(JSON.stringify(out,null,2));
}finally{await browser.close();server.kill()}
