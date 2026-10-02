/** LRN-1 read-only probe: why `.spatial-canvas` reports height 0 on /?surface=visualize.
 *  Writes nothing outside writer-output/W02-LEARN. */
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
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>console.log('PAGEERROR',String(e?.message||e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=visualize`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='visualize',null,{timeout:30000});
  await page.waitForTimeout(900);
  const pre=await page.evaluate(()=>{
    const q=s=>document.querySelector(s);
    return {hostHidden:q('#spatialHost')?.hidden, viewButtons:[...document.querySelectorAll('[data-view],[data-representation],.viz-view,[role=tab]')].map(n=>({t:(n.textContent||'').trim().slice(0,30),a:[...n.attributes].map(x=>`${x.name}=${x.value}`).join(' '),sel:n.getAttribute('aria-selected')})).slice(0,20),
      stageClass:document.querySelector('#foundationStage')?.className};
  });
  console.log('PRE',JSON.stringify(pre,null,2));
  const out=await page.evaluate(()=>{
    const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
    const host=document.querySelector('#spatialHost');
    host.hidden=false;
    try{CEPFoundation.spatial?.fit?.()}catch(e){}
    const canvas=document.querySelector('.spatial-canvas');
    const chain=[];let n=canvas;
    while(n&&n!==document.body){const cs=getComputedStyle(n);chain.push({tag:n.tagName,id:n.id||'',cls:(n.className||'').toString().slice(0,60),box:box(n),display:cs.display,position:cs.position,hidden:!!n.hidden,overflow:cs.overflow});n=n.parentElement;}
    return {
      consumer:CEPFoundation.consumer,
      hostHidden:host?host.hidden:'NO_HOST',
      hostBox:box(host),
      canvasBox:box(canvas),
      representation:CEPFoundation.m0Composition?.adapter?.view??CEPFoundation.m0Composition?.view??null,
      vizKeys:Object.keys(CEPFoundation).filter(k=>/vis|spatial|repres|m0/i.test(k)),
      adapterView:(()=>{try{return CEPFoundation.m0Composition?.adapter?.descriptor?.().view??null}catch(e){return 'ERR'}})(),
      svgAttrs:canvas?[...canvas.attributes].map(a=>`${a.name}=${a.value}`):null,
      svgStyle:canvas?(()=>{const cs=getComputedStyle(canvas);return {display:cs.display,width:cs.width,height:cs.height,position:cs.position}})():null,
      hostStyle:host?(()=>{const cs=getComputedStyle(host);return {display:cs.display,width:cs.width,height:cs.height}})():null,
      spatialState:(()=>{const s=CEPFoundation.spatial;if(!s)return null;const o={};for(const k of ['view','mode','representation','camera','zoom','nodes','records']){try{const v=s[k];o[k]=typeof v==='function'?String(v()).slice(0,200):(v&&typeof v==='object'?'[obj]':v)}catch(e){o[k]='ERR'}}try{o.keys=Object.keys(s).slice(0,60)}catch(e){}return o})(),
      stageAfter:document.querySelector('#foundationStage')?.className,
      chain
    };
  });
  console.log(JSON.stringify(out,null,2));
}finally{await browser.close();server.kill()}
