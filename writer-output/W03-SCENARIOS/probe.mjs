/** W03-SCENARIOS diagnostic probe: DOM/layout facts only (no visual claims). */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});

const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
try{
  const context=await browser.newContext({viewport:{width:1505,height:1045}});
  await context.addInitScript(()=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'}}}))}catch{}});
  const page=await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=scenarios`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='scenarios',null,{timeout:30000});
  await page.waitForTimeout(900);
  const probe=await page.evaluate(()=>{
    const cs=(el)=>el?getComputedStyle(el):null;
    const rail=document.querySelector('.centerrail');
    const doc=document.querySelector('#centerPane .docscroll');
    const scen=document.querySelector('.w03-scen');
    const rect=el=>el?JSON.parse(JSON.stringify(el.getBoundingClientRect())):null;
    const leftToggle=document.querySelector('#leftLocalReveal');
    const ctx=document.querySelector('#rightPane .pbody');
    const visibleChildren=ctx?[...ctx.children].filter(c=>!c.hidden&&c.offsetParent!==null).map(c=>({tag:c.tagName,id:c.id,cls:c.className,text:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,120)})):[];
    const scope=document.querySelector('#rightPane .contextscope');
    return {
      rail:rail?{position:cs(rail).position,top:cs(rail).top,rect:rect(rail),cls:rail.className,parent:rail.parentElement?.id||rail.parentElement?.className}:null,
      doc:doc?{padding:cs(doc).padding,rect:rect(doc)}:null,
      center:{position:cs(document.querySelector('#centerPane')).position,rect:rect(document.querySelector('#centerPane'))},
      scen:scen?{rect:rect(scen),padding:cs(scen).padding}:null,
      tabs:rect(document.querySelector('.w03-tab')),
      leftToggle:rect(leftToggle),
      contextscope:scope?{hidden:scope.hidden,display:cs(scope).display,rect:rect(scope)}:null,
      rightChildren:visibleChildren,
      leftHead:(document.querySelector('#leftPane .phead h2')||{}).textContent,
      rightHead:(document.querySelector('#rightPane .phead h2')||{}).textContent,
      bottomTitle:(document.querySelector('#bottomShelf .bottomtitle')||{}).textContent,
      bannerTitle:(document.querySelector('#topBanner .title')||{}).textContent,
      docHeight:{scroll:doc?.scrollHeight,client:doc?.clientHeight},
      scenHeight:scen?.scrollHeight
    };
  });
  console.log(JSON.stringify(probe,null,2));
}finally{await browser.close();server.kill()}
