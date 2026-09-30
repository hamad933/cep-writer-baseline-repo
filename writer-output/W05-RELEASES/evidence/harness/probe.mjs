import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort(),runtimePort=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime=spawn(process.execPath,[path.join(root,'stack/local-runtime/server.mjs')],{cwd:root,env:{...process.env,CEP_LOCAL_RUNTIME_PORT:String(runtimePort),CEP_SQLITE_PATH:'/tmp/w05probe.sqlite'},stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<120;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
const browser=await chromium.launch({headless:true});
const page=await (await browser.newContext({viewport:{width:1536,height:1024}})).newPage();
await page.goto(`http://127.0.0.1:${port}/?surface=releases&persistencePort=${runtimePort}`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='releases',undefined,{timeout:30000});
await page.waitForTimeout(2500);
const probe=await page.evaluate(()=>{
  const describe=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,cls:String(el.className||'').slice(0,80),text:(el.textContent||'').trim().slice(0,90),rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},hidden:el.hidden,inRegionStage:!!el.closest('#foundationStage')}};
  const hit=(x,y)=>{const stack=document.elementsFromPoint(x,y).slice(0,4).map(describe);return stack};
  return {
    atPrevNext:hit(1035,205),
    headSide:describe(document.querySelector('.rel-head-side')),
    headMain:describe(document.querySelector('.rel-head-main')),
    basis:describe(document.querySelector('.rel-basis')),
    rightPaneChildren:[...document.querySelectorAll('#rightPane .pbody > *')].map(describe),
    leftPaneChildren:[...document.querySelectorAll('#leftPane .pbody > *')].map(describe),
    centerPaneChildren:[...document.querySelectorAll('#centerPane > *')].map(describe),
    bottom:{title:describe(document.querySelector('#bottomShelf .bottomtitle')),summary:describe(document.querySelector('#bottomSummary')),tabs:[...document.querySelectorAll('.bottomtabs [data-action=bottom-tab]')].map(t=>(t.textContent||'').trim())},
    banner:describe(document.querySelector('#topBanner')),
    donorVisible:[...document.querySelectorAll('#centerPane [class*=nav],#centerPane [class*=donor],#centerPane .tree,#centerPane #kuList')].map(describe),
    arabicNodes:[...document.querySelectorAll('#rightPane *,#leftPane *,#centerPane *')].filter(el=>{const t=(el.textContent||'').trim();return t&&t.length<40&&/[\u0600-\u06FF]/.test(t)&&el.children.length<=2&&!el.closest('#foundationStage')}).slice(0,14).map(el=>({cls:String(el.className||''),id:el.id,text:(el.textContent||'').trim().slice(0,30),display:getComputedStyle(el).display,hidden:el.hidden,offsetParent:el.offsetParent?String(el.offsetParent.id||el.offsetParent.className).slice(0,40):null,parent:String(el.parentElement?.id||el.parentElement?.className||'').slice(0,50)})),
    pbodyKids:[...document.querySelectorAll('#rightPane .pbody,#leftPane .pbody')].map(p=>({id:p.parentElement?.id,kids:[...p.children].map(c=>({id:c.id,cls:String(c.className).slice(0,40),hidden:c.hidden,display:getComputedStyle(c).display}))}))
  };
});
console.log(JSON.stringify(probe,null,1));
await browser.close();server.kill();runtime.kill();
