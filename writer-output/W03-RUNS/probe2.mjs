import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import net from 'node:net';
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort();
const server=spawn(process.execPath,['tools/serve.mjs','--port',String(port)],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,900));
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1505,height:1045}});
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
await p.goto(`http://127.0.0.1:${port}/?surface=runs`,{waitUntil:'networkidle'});
await p.waitForFunction(()=>window.CEPFoundation?.consumer==='runs',null,{timeout:30000});
await p.waitForTimeout(500);
const out=await p.evaluate(async()=>{
  const cf=window.CEPFoundation;
  const [{W03RunDomain},{composeRunsSurface},{renderRunsSurface}]=await Promise.all([
    import('/adapters/runs/domain.js'),import('/surfaces/runs/index.js'),import('/surfaces/runs/presentation.js')]);
  const domain=new W03RunDomain({runtime:cf.simulation,sessionOwner:cf.sharedOwners?.operationalSessionOwner||undefined});
  const composition=composeRunsSurface({domain,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
  const stage=document.querySelector('#foundationStage');
  const ctrl=renderRunsSurface(stage,composition,{dir:'ltr',workspace:cf.workspace});
  await new Promise(r=>setTimeout(r,300));
  const cp=document.querySelector('#centerPane');
  const kids=[...cp.children].map(n=>({tag:n.tagName,id:n.id,cls:n.className,txt:(n.innerText||'').replace(/\s+/g,' ').slice(0,60),r:(()=>{const r=n.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()}));
  const kv=document.querySelector('.runs-shell-right .runs-kv');
  const r=kv?kv.getBoundingClientRect():null;
  const note=document.querySelector('.runs-shell-right .runs-note');
  const kvCols=kv?getComputedStyle(kv).gridTemplateColumns:null;
  const pager=document.querySelector('.runs-pager');
  return {kids,
    truth:{kvRect:r?[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]:null,
      noteRect:note?[Math.round(note.getBoundingClientRect().x),Math.round(note.getBoundingClientRect().width)]:null,
      cols:kvCols, text:kv?kv.innerText.replace(/\s+/g,' ').slice(0,200):null},
    pagerInScroller: pager?{inScroller:!!pager.closest('.runs-tablewrap'),rect:(()=>{const q=pager.getBoundingClientRect();return [Math.round(q.y),Math.round(q.height)]})()}:null,
    provider: JSON.parse(JSON.stringify(domain.workspace().provider))
  };
});
console.log(JSON.stringify(out,null,1));
await b.close();server.kill();
