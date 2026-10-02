import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=process.cwd()+'/';
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
let stderr='';server.stderr.on('data',d=>stderr+=d);
await new Promise(r=>setTimeout(r,800));
const browser=await chromium.launch();
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  const pending=[];
  page.on('request',r=>pending.push({u:r.url(),t:Date.now(),done:false}));
  page.on('requestfinished',r=>{const e=pending.filter(x=>x.u===r.url()&&!x.done).pop();if(e)e.done=true;});
  page.on('requestfailed',r=>{const e=pending.filter(x=>x.u===r.url()&&!x.done).pop();if(e){e.done=true;e.failed=r.failure()?.errorText}});

  const t0=Date.now();
  try{
    await page.goto(`http://127.0.0.1:${port}/?surface=library`,{waitUntil:'networkidle',timeout:25000});
    console.log('NETWORKIDLE_OK ms=',Date.now()-t0);
  }catch(e){
    console.log('NETWORKIDLE_FAIL ms=',Date.now()-t0,String(e.message).slice(0,120));
    console.log('unfinished:',JSON.stringify(pending.filter(x=>!x.done).map(x=>({u:x.u.slice(0,120),age:Date.now()-x.t,failed:x.failed})),null,1));
  }
  const t1=Date.now();
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='library',null,{timeout:25000});
  console.log('CONSUMER_OK ms=',Date.now()-t1);
  console.log('server stderr:',stderr.slice(0,300));
}finally{await browser.close();server.kill()}
