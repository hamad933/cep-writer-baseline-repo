#!/usr/bin/env node
/* W02 quick probe — print region/component measurements for the four W02 surfaces.
   Development probe only; evidence capture lives in tools/w02-visual-reaudit.mjs. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.CEP_PLAYWRIGHT_MODULE_PATH)}
const root=new URL('../',import.meta.url);
const port=Number(process.env.W02_PROBE_PORT||43199),base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,[new URL('tools/serve.mjs',root).pathname,'--port',String(port)],{cwd:new URL('.',root),stdio:['ignore','pipe','pipe']});
for(let i=0;i<120;i++){try{if((await fetch(base)).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const browser=await playwright.chromium.launch();
const surfaces=process.argv.slice(2).length?process.argv.slice(2):['library','learn','visualize','rq'];
for(const vp of [{width:1440,height:1000}]){
  const ctx=await browser.newContext({viewport:vp,reducedMotion:'reduce',deviceScaleFactor:1});
  for(const surface of surfaces){
    const page=await ctx.newPage();
    await page.goto(`${base}/?surface=${surface}`,{waitUntil:'networkidle'});
    await page.waitForFunction(e=>window.CEPFoundation?.consumer===e,surface,{timeout:20000});
    await page.waitForTimeout(400);
    const probe=await page.evaluate(()=>{
      const txt=sel=>{const el=document.querySelector(sel);return el?el.innerText.replace(/\s+/g,' ').trim().length:0};
      const count=sel=>document.querySelectorAll(sel).length;
      const centre=document.querySelector('#centerPane');
      // blank band geometry inside centre content
      const scroll=document.querySelector('#centerPane .docscroll')||centre;
      let blank=0,run=0,max=0;
      if(scroll){const r=scroll.getBoundingClientRect();
        for(let y=Math.ceil(r.top);y<Math.floor(r.bottom);y+=4){
          const line=document.elementFromPoint(Math.min(r.left+20,innerWidth-2),Math.min(Math.max(y,0),innerHeight-2));
          const empty=!line||line===scroll||(!line.innerText||!line.innerText.trim());
          if(empty){run+=4;if(run>max)max=run}else run=0;
        }}
      return {
        left:txt('#leftPane .pbody'),centre:txt('#centerPane .pbody')||txt('#centerPane'),right:txt('#rightPane .pbody'),
        bottom:txt('#bottomShelf'),
        treeitems:count('#leftPane .treeitem'),outlineHosts:count('.visualize-outline-host,[data-component="StructureTree"]'),
        bespokeRows:count('.visualize-tree-row'),hierRows:count('.visualize-tree-hierarchy > li'),
        tables:count('#centerPane table'),codeBlocks:count('#centerPane pre,#centerPane .codeblock,#centerPane code'),
        treeitemLevelMax:Math.max(0,...[...document.querySelectorAll('.treeitem')].map(x=>Number(x.getAttribute('aria-level')||0))),
        centreMaxBlankRun:max,
        h1:(document.querySelector('h1')||{}).innerText||'',
        bodyHead:document.body.innerText.replace(/\s+/g,' ').slice(0,300)
      };
    });
    console.log(surface,vp.width+'x'+vp.height,JSON.stringify(probe,null,1));
    await page.close();
  }
  await ctx.close();
}
await browser.close();server.kill();
