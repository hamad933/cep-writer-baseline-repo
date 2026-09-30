#!/usr/bin/env node
/* W02 visual re-audit capture — R2/R6 of the R0-R7 loop.
   Captures one screenshot per ENACTED state for library / learn / visualize / rq at
   1440x1000 and 1024x900, records SHA-256 + byte size + a DOM probe per state, and writes
   writer-output/W02/reaudit-evidence/{MANIFEST.json,probe.json}.
   Owner: W02. Never writes assurance/**. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.CEP_PLAYWRIGHT_MODULE_PATH)}
const {chromium}=playwright;
const root=new URL('../',import.meta.url);
const port=Number(process.env.W02_CAPTURE_PORT||43188),base=`http://127.0.0.1:${port}`;
const outDir=new URL('writer-output/W02/reaudit-evidence/',root);
await mkdir(outDir,{recursive:true});
const tag=process.env.W02_CAPTURE_TAG||'R6';

const server=spawn(process.execPath,[new URL('tools/serve.mjs',root).pathname,'--port',String(port)],{cwd:new URL('.',root),stdio:['ignore','pipe','pipe']});
for(let i=0;i<180;i++){try{if((await fetch(base)).ok)break}catch{}await new Promise(r=>setTimeout(r,100));if(i===179)throw Error('W02_CAPTURE_SERVER_DID_NOT_START')}

const PROBE=`(()=>{
  const norm=s=>String(s||'').replace(/\\s+/g,' ').trim();
  const txt=sel=>{const el=document.querySelector(sel);return el?norm(el.innerText):''};
  const count=sel=>document.querySelectorAll(sel).length;
  const region=sel=>{const el=document.querySelector(sel);return el?norm(el.innerText).length:0};
  const items=sel=>[...document.querySelectorAll(sel)].map(el=>norm(el.innerText)).filter(Boolean);
  const centreScroll=document.querySelector('#centerPane .docscroll')||document.querySelector('#centerPane');
  const clipped=[...document.querySelectorAll('#leftPane .phead h2,#rightPane .phead h2')].map(el=>({label:norm(el.innerText),cw:el.clientWidth,sw:el.scrollWidth,clipped:el.scrollWidth>el.clientWidth+1}));
  const treeItems=[...document.querySelectorAll('.treeitem')];
  const centreNodes=[...document.querySelectorAll('#centerPane .treeitem')];
  const leftNodes=[...document.querySelectorAll('#leftPane .treeitem')];
  const labels=[...document.querySelectorAll('[data-visualize-select]')].map(el=>norm(el.innerText));
  const dupLabels=labels.filter((l,i)=>l&&labels.indexOf(l)!==i);
  const bottom=document.querySelector('#bottomShelf');
  return {
    h1:norm((document.querySelector('h1')||{}).innerText),
    chars:{left:region('#leftPane .pbody'),centre:region('#centerPane .pbody')||region('#centerPane'),right:region('#rightPane .pbody'),bottom:region('#bottomShelf'),whole:region('body')},
    words:{left:(txt('#leftPane .pbody').match(/\\S+/g)||[]).length,centre:((txt('#centerPane .pbody')||txt('#centerPane')).match(/\\S+/g)||[]).length,right:(txt('#rightPane .pbody').match(/\\S+/g)||[]).length},
    counts:{
      treeitems:treeItems.length,
      leftTreeitems:leftNodes.length,
      centreTreeitems:centreNodes.length,
      outlineHosts:count('.visualize-outline-host')+count('#structureTree'),
      bespokeRows:count('.visualize-tree-row'),
      tables:count('#centerPane table'),
      codeBlocks:count('#centerPane pre')+count('#centerPane .codeblock'),
      buttons:count('button'),
      listItems:count('#leftPane li,#centerPane li,#rightPane li'),
      headings:count('#centerPane h2,#centerPane h3,#leftPane h3,#rightPane h3'),
      kpiCards:count('#rightPane .kpi,#rightPane .lens-card,#rightPane .domain-card'),
      deadTokens:(txt('body').match(/\\bEMPTY\\b|unavailable|Hierarchy unavailable/g)||[]).length
    },
    tree:{maxLevel:Math.max(0,...treeItems.map(el=>Number(el.getAttribute('aria-level')||0))),levels:[...new Set(treeItems.map(el=>Number(el.getAttribute('aria-level')||0)))].sort((a,b)=>a-b),rows:treeItems.map(el=>norm(el.innerText))},
    rawMarkdown:(txt('#centerPane').match(/\\*\\*[^*]+\\*\\*/g)||[]),
    rawTruthStrings:(txt('body').match(/[a-z]+:[a-zA-Z0-9_.|-]{6,}\\|[a-z]/g)||[]),
    duplicateSelectLabels:[...new Set(dupLabels)],
    clipped,
    bottomOpen:bottom?.dataset?.state||null,
    bodyText:txt('body').slice(0,4000)
  };
})()`;

const states=[
  {id:'library-default',surface:'library'},
  {id:'learn-default',surface:'learn'},
  {id:'visualize-tree',surface:'visualize'},
  {id:'rq-default',surface:'rq'}
];
const viewports=[{width:1440,height:1000},{width:1024,height:900}];
const browser=await chromium.launch();
const shots=[],probes={};
let seq=0;
for(const vp of viewports){
  const ctx=await browser.newContext({viewport:vp,reducedMotion:'reduce',deviceScaleFactor:1});
  for(const s of states){
    const page=await ctx.newPage();
    await page.goto(`${base}/?surface=${s.surface}`,{waitUntil:'networkidle'});
    await page.waitForFunction(e=>window.CEPFoundation?.consumer===e,s.surface,{timeout:20000});
    await page.waitForTimeout(500);
    const id=`${s.id}-${vp.width}x${vp.height}`;
    seq+=1;
    const file=`${tag}-${id}.png`;
    await page.screenshot({path:new URL(file,outDir).pathname,fullPage:false});
    const bytes=await readFile(new URL(file,outDir));
    probes[id]=await page.evaluate(PROBE);
    shots.push({file:`writer-output/W02/reaudit-evidence/${file}`,state:id,surface:s.surface,viewport:vp,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    await page.close();
  }
  await ctx.close();
}
await browser.close();server.kill();
await writeFile(new URL('MANIFEST.json',outDir),JSON.stringify({schemaVersion:1,kind:'W02_VISUAL_REAUDIT_CAPTURE',tag,classification:'CANDIDATE_ONLY_REAUDIT_EVIDENCE__NOT_OWNER_ACCEPTANCE',capturedAt:new Date().toISOString(),viewports,screenshots:shots},null,2));
await writeFile(new URL('probe.json',outDir),JSON.stringify(probes,null,2));
console.log(JSON.stringify(shots.map(s=>({state:s.state,bytes:s.bytes,sha:s.sha256.slice(0,12)})),null,1));
