import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import net from 'node:net';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo';
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const PREFS={en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'}};
const port=await freePort();
const server=spawn(process.execPath,[root+'/tools/serve.mjs','--port',String(port)],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,1500));
const browser=await chromium.launch();
const out={};
for(const locale of ['en','ar']){
  const ctx=await browser.newContext({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
  await ctx.addInitScript(p=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:p}}))}catch{}},PREFS[locale]);
  const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/?surface=labs`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:20000});
  await page.waitForTimeout(1600);
  out[locale]=await page.evaluate(()=>{
    const vis=el=>{if(!el)return false;const r=el.getBoundingClientRect();const c=getComputedStyle(el);return !el.hidden&&r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
    const pbody=sel=>{const p=document.querySelector(sel);return p?[...p.children].map(c=>({tag:c.tagName,id:c.id,cls:String(c.className).slice(0,50),vis:vis(c),h:Math.round(c.getBoundingClientRect().height),top:Math.round(c.getBoundingClientRect().top)})):[]};
    const t=sel=>(document.querySelector(sel)?.innerText||'').replace(/\s+/g,' ').trim().slice(0,260);
    // node title overflow check
    const nodes=[...document.querySelectorAll('[data-lab-graph] g[data-node]')].map(g=>{
      const r=g.getBoundingClientRect();
      const title=g.querySelector('.node-title');
      const tr=title?.getBoundingClientRect();
      const surface=g.querySelector('.node-surface')?.getBoundingClientRect();
      return {id:g.dataset.node,card:surface?[Math.round(surface.width),Math.round(surface.height)]:null,
        titleW:tr?Math.round(tr.width):null,titleRight:surface&&tr?Math.round(tr.right-surface.right):null,
        text:title?.textContent};
    });
    return {
      dir:document.documentElement.dir,lang:document.documentElement.lang,
      leftChildren:pbody('#leftPane .pbody'),rightChildren:pbody('#rightPane .pbody'),
      paneHeadLeft:t('#leftPane .phead h2'),paneHeadRight:t('#rightPane .phead h2'),
      toolbar:t('.toolbar'),banner:t('#topBanner'),bottom:t('#bottomShelf'),
      donorVisible:[...document.querySelectorAll('#editorDocument,.m0-domain-nav,#kuList,.structurewrap')].filter(vis).map(e=>e.tagName+'.'+String(e.className).slice(0,30)),
      nodes, overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
      vOverflow:Math.max(0,document.documentElement.scrollHeight-document.documentElement.clientHeight)
    };
  });
  out[locale].pageErrors=errs;
  await ctx.close();
}
console.log(JSON.stringify(out,null,1));
await browser.close();server.kill();process.exit(0);
