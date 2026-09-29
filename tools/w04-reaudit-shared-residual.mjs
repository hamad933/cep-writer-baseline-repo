/** Read-only probe: are the SHARED-routed residual defects (D4/D5/D7/D8) still visible on the four
 *  W04 surfaces? These are reported, never patched, because they live in shared code. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
const browser=await chromium.launch();
const out=[];
for(const surface of ['evidence','reviews','mastery','portfolio']){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`,{waitUntil:'networkidle'});
  await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,surface,{timeout:20000});
  await page.waitForTimeout(300);
  const probe=await page.evaluate(()=>{
    const heads=[...document.querySelectorAll('.phead h2')].filter(n=>n.offsetParent!==null);
    const scope=document.querySelector('#rightPane .contextscope');
    const scopeVisible=!!scope&&scope.offsetParent!==null&&!scope.hidden;
    const english=[...document.querySelectorAll('#foundationStage .m0-studio-head p, #foundationStage .m0-empty-guidance li, #foundationStage .m0-empty-state')]
      .map(n=>({text:(n.textContent||'').trim().slice(0,120),dir:n.getAttribute('dir')||'',computed:getComputedStyle(n).direction,
                trailingPunctMisplaced:/\.\s|•\s/.test((n.textContent||''))}));
    const palette=[...document.querySelectorAll('#commandResults [data-foundation-command]')].slice(0,3).map(n=>n.textContent);
    return {
      regionHeadings:heads.map(n=>({text:n.textContent,clipped:n.scrollWidth>n.clientWidth+2,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})),
      donorScopeTabs:{present:!!scope,visible:scopeVisible,text:scope?(scope.innerText||'').replace(/\s+/g,' ').trim():null},
      englishDirection:english,
      paletteLabels:palette
    };
  });
  out.push({surface,...probe});
  await ctx.close();
}
await browser.close();server.kill();
await writeFile(path.join(root,'writer-output/W04/reaudit-evidence/SHARED_RESIDUAL_PROBE.json'),JSON.stringify({schemaVersion:1,proof:'w04-shared-residual-defects',note:'D4/D5/D7/D8 are SHARED_COMPONENT-routed; reported, never patched by a surface Writer',surfaces:out},null,2));
console.log(JSON.stringify(out.map(o=>({surface:o.surface,heads:o.regionHeadings,scope:o.donorScopeTabs.visible})),null,1));
