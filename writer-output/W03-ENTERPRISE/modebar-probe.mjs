import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const port = await new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p));});});
const server = spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const b = await chromium.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
for (const vp of [{width:1503,height:1046},{width:1440,height:1000},{width:1024,height:900},{width:820,height:900}]) {
  const ctx = await b.newContext({viewport:vp,reducedMotion:'reduce'});
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='enterprise',null,{timeout:30000});
  await page.waitForTimeout(400);
  const r = await page.evaluate(()=>{
    const nav=document.querySelector('.enterprise-modebar');
    const nb=nav.getBoundingClientRect();
    const items=[...nav.children].map(n=>{const r=n.getBoundingClientRect();return {t:(n.textContent||'').trim().slice(0,24),cls:n.className,x:Math.round(r.x),w:Math.round(r.width),right:Math.round(r.right),visible:r.right<=nb.right+1&&r.left>=nb.left-1};});
    return {nav:{x:Math.round(nb.x),w:Math.round(nb.width),scrollW:nav.scrollWidth,clientW:nav.clientWidth,scrollLeft:nav.scrollLeft,overflowX:getComputedStyle(nav).overflowX},items};
  });
  console.log(vp.width+'x'+vp.height, JSON.stringify(r));
  await ctx.close();
}
await b.close(); server.kill();
