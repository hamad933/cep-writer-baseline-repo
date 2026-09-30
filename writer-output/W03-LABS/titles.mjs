import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo';
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const port=await freePort();
const server=spawn(process.execPath,[root+'/tools/serve.mjs','--port',String(port)],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,1500));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
await page.goto(`http://127.0.0.1:${port}/?surface=labs`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:20000});
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(()=>{
  return [...document.querySelectorAll('[data-lab-graph] g[data-node]')].map(g=>{
    const t=g.querySelector('.node-title');
    const full=t.getAttribute('data-full');
    const lines=[...t.querySelectorAll('tspan')].map(x=>x.textContent);
    return {id:g.dataset.node,full,lines,plain:t.textContent,computed:Math.round(t.getComputedTextLength()),y:t.getAttribute('y')};
  });
}),null,1));
await browser.close();server.kill();process.exit(0);
