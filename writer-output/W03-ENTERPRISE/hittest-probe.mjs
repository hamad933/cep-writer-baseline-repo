import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const port = await new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p));});});
const server = spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const b = await chromium.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const out=[];
for (const vp of [{width:1503,height:1046},{width:1440,height:1000},{width:1024,height:900},{width:820,height:900}]) {
  const ctx = await b.newContext({viewport:vp,reducedMotion:'reduce'});
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='enterprise',null,{timeout:30000});
  await page.waitForTimeout(400);
  const r = await page.evaluate(()=>{
    const nav=document.querySelector('.enterprise-modebar');
    const tabs=[...nav.querySelectorAll('.ent-tab')];
    const res=tabs.map(t=>{
      const r=t.getBoundingClientRect();
      const cx=r.x+r.width/2, cy=r.y+r.height/2;
      const top=document.elementFromPoint(cx,cy);
      const covered = top && !t.contains(top) && !t.isEqualNode(top);
      return {label:t.textContent.trim(),x:Math.round(r.x),w:Math.round(r.width),cx:Math.round(cx),cy:Math.round(cy),
              topEl: top? (top.tagName+'.'+String(top.className).slice(0,40)) : null,
              covered, ariaPressed:t.getAttribute('aria-pressed')};
    });
    // can we still activate the occluded tab by scrolling the nav into view?
    const stateTab=tabs.find(t=>t.dataset.mode==='state');
    let clickResult=null;
    if(stateTab){
      stateTab.scrollIntoView({block:'nearest',inline:'center'});
      const r2=stateTab.getBoundingClientRect();
      const top2=document.elementFromPoint(r2.x+r2.width/2,r2.y+r2.height/2);
      clickResult={afterScrollTopEl: top2?(top2.tagName+'.'+String(top2.className).slice(0,40)):null};
      try{ stateTab.click(); clickResult.pressed=stateTab.getAttribute('aria-pressed'); }catch(e){ clickResult.err=String(e.message).slice(0,80);}
    }
    return {scrollW:nav.scrollWidth,clientW:nav.clientWidth,tabs:res,clickResult};
  });
  out.push({vp:vp.width+'x'+vp.height,...r});
  await ctx.close();
}
await b.close(); server.kill();
console.log(JSON.stringify(out,null,1));
