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
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const pending=new Map();const done=[];
page.on('request',r=>pending.set(r,Date.now()));
page.on('requestfinished',r=>{done.push({url:r.url().slice(0,120),ms:Date.now()-(pending.get(r)||0)});pending.delete(r)});
page.on('requestfailed',r=>{done.push({url:r.url().slice(0,120),failed:r.failure()?.errorText,ms:Date.now()-(pending.get(r)||0)});pending.delete(r)});
const t0=Date.now();
try{
  await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`,{waitUntil:'networkidle',timeout:25000});
  console.log('networkidle OK after',Date.now()-t0,'ms');
}catch(e){console.log('networkidle FAILED after',Date.now()-t0,'ms:',String(e.message).split('\n')[0])}
console.log('pending now:',[...pending.keys()].map(r=>r.url().slice(0,120)));
console.log('finished count:',done.length,'slowest:',JSON.stringify(done.sort((a,b)=>b.ms-a.ms).slice(0,6)));
/* how often does the platform bridge poll? that decides whether networkidle can ever settle */
const mark=done.length;
await page.waitForTimeout(10000);
const pollDone=done.filter(d=>d.url.includes('input-direction'));
const pollPending=[...pending.keys()].filter(r=>r.url().includes('input-direction')).map(r=>r.url());
const after=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('input-direction')).length);
console.log('input-direction: finishedEvents='+pollDone.length,'resourceTiming='+after,'pendingPolls='+pollPending.length);
console.log('recent poll timings:',JSON.stringify(pollDone.slice(-4)));
console.log('pending after wait:',[...pending.keys()].map(r=>r.url().slice(0,120)));
console.log('consumer:',await page.evaluate(()=>window.CEPFoundation?.consumer||null));
await browser.close();server.kill();process.exit(0);
