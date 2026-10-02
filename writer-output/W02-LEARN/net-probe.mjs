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
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await ctx.newPage();
  const events=[];
  page.on('request',r=>{if(r.url().includes('4174'))events.push({ev:'req',m:r.method(),u:r.url(),h:JSON.stringify(r.headers()).slice(0,300)})});
  page.on('requestfinished',r=>{if(r.url().includes('4174'))events.push({ev:'finished',m:r.method()})});
  page.on('requestfailed',r=>{if(r.url().includes('4174'))events.push({ev:'failed',m:r.method(),e:r.failure()?.errorText})});
  page.on('response',r=>{if(r.url().includes('4174'))events.push({ev:'resp',m:r.request().method(),s:r.status(),acao:r.headers()['access-control-allow-origin']||null})});
  await page.goto(`http://127.0.0.1:${port}/?surface=learn`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='learn',null,{timeout:60000});
  await page.waitForTimeout(6000);
  const direct=await page.evaluate(async()=>{
    const t=Date.now();
    try{const r=await fetch('http://127.0.0.1:4174/v1/platform/input-direction',{method:'GET'});return {ms:Date.now()-t,status:r.status}}
    catch(e){return {ms:Date.now()-t,error:String(e.message)}}
  });
  console.log(JSON.stringify({directFetch:direct,events},null,1));
}finally{await browser.close();server.kill()}
