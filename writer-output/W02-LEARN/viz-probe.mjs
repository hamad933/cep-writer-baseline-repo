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
  page.on('pageerror',e=>console.log('PAGEERROR',String(e?.message||e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=visualize`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='visualize',null,{timeout:30000});
  await page.waitForTimeout(1200);
  const out=await page.evaluate(()=>{
    const left=document.querySelector('#leftPane');
    return {
      leftHTMLLen:left?(left.querySelector('.pbody')?.innerHTML||'').length:0,
      leftText:(left?.innerText||'').slice(0,300),
      objectList:document.querySelectorAll('.visualize-object-list').length,
      selectBtns:document.querySelectorAll('.visualize-object-list [data-visualize-select]').length,
      leftRegionChildren:[...(left?.querySelector('.pbody')?.children||[])].map(n=>({tag:n.tagName,id:n.id,cls:String(n.className).slice(0,50)})),
      nodes:(CEPFoundation.relations?.nodes||[]).length,
      repProj:(()=>{try{return CEPFoundation.m0Composition?.adapter?.representationProjection('TREE').representations.length}catch(e){return 'ERR'}})(),
      spatialHostHidden:document.querySelector('#spatialHost')?.hidden,
      cdp:!!document.querySelector('[data-visualize-projection]'),
      stage:document.querySelector('#foundationStage')?.className
    };
  });
  console.log(JSON.stringify(out,null,2));
}finally{await browser.close();server.kill()}
