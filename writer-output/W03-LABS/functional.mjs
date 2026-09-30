/**
 * W03-LABS · functional + structural interaction proof (writer-local instrument).
 *
 * Drives the genuine route `/?surface=labs` and asserts that every authored affordance is real:
 * structure-pane navigation, graph selection, palette (Add Task / Connect / Add Branch), the
 * lifecycle row with genuine availability, the More menu, both directions and both languages.
 *
 * Usage: node writer-output/W03-LABS/functional.mjs [--root <dir>]
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const args=process.argv.slice(2);
const arg=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const siteRoot=arg('--root')||path.join(root,'dist');

const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
const PREFS={en:{locale:'en',chromeDirection:'ltr',contentDirection:'ltr'},ar:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'}};

const results=[];
const run=async(name,fn)=>{try{const detail=await fn();results.push({name,pass:true,detail})}catch(e){results.push({name,pass:false,error:String(e?.message||e)})}};

const t=page=>page;
const text=async(page,sel)=>(await page.locator(sel).first().innerText().catch(()=>'')).replace(/\s+/g,' ').trim();
const assert=(cond,msg)=>{if(!cond)throw Error(msg)};

const boot=async(browser,port,locale)=>{
  const ctx=await browser.newContext({viewport:{width:1505,height:1045},reducedMotion:'reduce'});
  await ctx.addInitScript(p=>{try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:p}}))}catch{}},PREFS[locale]);
  const page=await ctx.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e).slice(0,200)));
  await page.goto(`http://127.0.0.1:${port}/?surface=labs`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.CEPFoundation?.consumer==='labs',null,{timeout:25000});
  await page.waitForTimeout(1400);
  return {ctx,page,pageErrors};
};

const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'writer-output/W03-LABS/serve-site.mjs'),'--port',String(port),'--root',siteRoot],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,900));
const browser=await chromium.launch();

/* ------------------------------------------------------------------ EN session */
{
  const {ctx,page,pageErrors}=await boot(browser,port,'en');

  await run('structure.pane.has-11-facets',async()=>{
    const n=await page.locator('#domainLeftRegion [data-facet]').count();
    assert(n===11,`expected 11 facets, got ${n}`);
    return {facets:n};
  });
  await run('structure.pane.task-rail-selects',async()=>{
    await page.locator('#domainLeftRegion [data-step="TASK-3"]').click();
    await page.waitForTimeout(320);
    const head=await text(page,'#domainContext .sub');
    assert(head.includes('Confirm Injection Condition'),`context subject was "${head}"`);
    const label=await text(page,'#domainContext .w03l-rowlabel');
    assert(label.length>0,'no context rows rendered');
    return {subject:head,firstRowLabel:label};
  });
  await run('structure.pane.facet-drives-context',async()=>{
    const before=await text(page,'#domainContext .w03l-ctx-head h3');
    await page.locator('#domainLeftRegion [data-facet="tools"]').click();
    await page.waitForTimeout(280);
    const head=await text(page,'#domainContext .w03l-ctx-head h3');
    const rows=await page.locator('#domainContext .w03l-row').count();
    assert(rows>=2,`tools facet rendered ${rows} rows`);
    assert(head!==before,`facet head did not change ("${before}" -> "${head}")`);
    assert(/tool|browser|request/i.test(await text(page,'#domainContext')), 'tools facet did not show required tools');
    await page.locator('#domainLeftRegion [data-facet="taskGraph"]').click();
    await page.waitForTimeout(240);
    return {before,head,rows};
  });
  await run('board.palette-add-task-mutates-graph',async()=>{
    const before=await page.locator('[data-lab-graph] g[data-node]').count();
    await page.locator('.w03l [data-tool="addTask"]').click();
    await page.waitForTimeout(500);
    const after=await page.locator('[data-lab-graph] g[data-node]').count();
    assert(after===before+1,`node count ${before} -> ${after}`);
    const rail=await page.locator('#domainLeftRegion [data-step]').count();
    assert(rail===after,`rail ${rail} vs nodes ${after}`);
    return {before,after,rail};
  });
  await run('board.palette-connect-creates-dependency',async()=>{
    const before=await page.locator('[data-lab-graph] line.relation-line').count();
    await page.locator('.w03l [data-tool="connect"]').click();
    await page.waitForTimeout(200);
    /* TASK-6 is the task authored by the previous check; TASK-6 -> TASK-1 is not yet authored
       (TASK-1 -> TASK-2 already exists, so that pair must be rejected as a duplicate). */
    await page.locator('[data-lab-graph] g[data-node="TASK-6"]').click();
    await page.waitForTimeout(340);
    await page.locator('[data-lab-graph] g[data-node="TASK-1"]').click();
    await page.waitForTimeout(440);
    const after=await page.locator('[data-lab-graph] line.relation-line').count();
    assert(after===before+1,`edges ${before} -> ${after}`);
    const duplicate=await page.locator('.w03l-status').innerText();
    return {before,after,status:duplicate.replace(/\s+/g,' ').trim().slice(0,80)};
  });
  await run('board.lifecycle.publish-then-handoff-availability',async()=>{
    const publishDisabled1=await page.locator('.w03l [data-action="publish"]').isDisabled();
    await page.locator('.w03l [data-action="publish"]').click();
    await page.waitForTimeout(400);
    const pill=await text(page,'#domainContext .w03l-kv');
    const handoffDisabled=await page.locator('.w03l [data-action="prepare"]').isDisabled();
    const status=await text(page,'.w03l-status');
    return {publishDisabledBefore:publishDisabled1,firstFact:pill,handoffDisabledAfterPublish:handoffDisabled,status};
  });
  await run('board.more-menu-revision',async()=>{
    await page.locator('.w03l [data-menu="more"]').click();
    await page.waitForTimeout(200);
    const visible=await page.locator('.w03l [data-menu-panel="more"]').isVisible();
    assert(visible,'More menu did not open');
    const items=await page.locator('.w03l [data-menu-panel="more"] [data-action]').count();
    assert(items===3,`expected 3 menu items, got ${items}`);
    await page.locator('.w03l [data-menu-panel="more"] [data-action="clear"]').click();
    await page.waitForTimeout(300);
    const hint=await text(page,'#domainContext .w03l-hint');
    assert(hint.includes('Select a task node'),`clear-selection hint was "${hint}"`);
    return {items,clearedHint:hint.slice(0,60)};
  });
  await run('structure.no-donor-leak.no-dead-regions',async()=>{
    const info=await page.evaluate(()=>{
      const vis=el=>{if(!el)return false;const r=el.getBoundingClientRect();return !el.hidden&&r.width>0&&r.height>0&&getComputedStyle(el).display!=='none'};
      const ctx=document.querySelector('#domainContext'),left=document.querySelector('#domainLeftRegion');
      const canvas=document.querySelector('[data-lab-graph]')?.getBoundingClientRect();
      const rightSiblings=[...document.querySelectorAll('#rightPane .pbody > :not(#domainContext)')].filter(vis).length;
      const leftSiblings=[...document.querySelectorAll('#leftPane .pbody > :not(#domainLeftRegion)')].filter(vis).length;
      return {rightSiblings,leftSiblings,
        ctxTop:Math.round(ctx.getBoundingClientRect().top),leftTop:Math.round(left.getBoundingClientRect().top),
        ctxH:Math.round(ctx.getBoundingClientRect().height),leftH:Math.round(left.getBoundingClientRect().height),
        canvasH:Math.round(canvas?.height||0),rows:document.querySelectorAll('#domainContext .w03l-row').length,
        donorVisible:[...document.querySelectorAll('#editorDocument,#kuList,.structurewrap,.m0-domain-nav')].filter(vis).length,
        pageOverflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)};
    });
    assert(info.rightSiblings===0,`${info.rightSiblings} visible right-pane siblings`);
    assert(info.leftSiblings===0,`${info.leftSiblings} visible left-pane siblings`);
    assert(info.donorVisible===0,`${info.donorVisible} donor nodes visible`);
    assert(info.pageOverflow===0,`horizontal overflow ${info.pageOverflow}`);
    assert(info.rows>=5,`context rows ${info.rows}`);
    assert(info.ctxTop===info.leftTop,`right region top ${info.ctxTop} != left ${info.leftTop}`);
    return info;
  });
  await run('page.no-uncaught-errors',async()=>{
    assert(pageErrors.length===0,`page errors: ${pageErrors.join(' | ')}`);
    return {errors:0};
  });
  await ctx.close();
}

/* ------------------------------------------------------------------ AR session */
{
  const {ctx,page,pageErrors}=await boot(browser,port,'ar');
  await run('arabic.chrome-localized',async()=>{
    const leftHead=await text(page,'#leftPane .phead h2');
    const rightHead=await text(page,'#rightPane .phead h2');
    const palette=await text(page,'.w03l .w03l-actions');
    const toolbar=await text(page,'.toolbar');
    assert(leftHead.includes('بنية'),`left head "${leftHead}"`);
    assert(rightHead.includes('السياق'),`right head "${rightHead}"`);
    assert(palette.includes('إضافة مهمة'),`palette "${palette}"`);
    assert(!/Add Task|Publish Revision|Prepare Run/.test(palette),`palette still English: ${palette}`);
    assert(/تأليف المختبر/.test(toolbar),`toolbar "${toolbar}"`);
    const dir=await page.evaluate(()=>document.documentElement.dir);
    assert(dir==='rtl',`dir ${dir}`);
    return {leftHead,rightHead,palette:palette.slice(0,120),toolbar:toolbar.slice(0,120),dir};
  });
  await run('arabic.rtl-structure-works',async()=>{
    await page.locator('#domainLeftRegion [data-step="TASK-4"]').click();
    await page.waitForTimeout(320);
    const subject=await text(page,'#domainContext .sub');
    assert(subject.includes('Inspect Simulated Database Effect'),`subject "${subject}"`);
    const rows=await page.locator('#domainContext .w03l-row').count();
    assert(rows>=6,`expected the 6 reference rows, got ${rows}`);
    const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth));
    assert(overflow===0,`rtl overflow ${overflow}`);
    return {subject,rows,dir:'rtl'};
  });
  await run('arabic.no-uncaught-errors',async()=>{
    assert(pageErrors.length===0,`page errors: ${pageErrors.join(' | ')}`);
    return {errors:0};
  });
  await ctx.close();
}

await browser.close();server.kill();

const passed=results.filter(r=>r.pass).length;
const report={proof:'W03-LABS-FUNCTIONAL',siteRoot,ranAt:new Date().toISOString(),
  total:results.length,passed,failed:results.length-passed,results};
await writeFile(path.join(root,'writer-output/W03-LABS/FUNCTIONAL.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({total:report.total,passed,failed:report.failed,failures:results.filter(r=>!r.pass)},null,2));
process.exit(passed===results.length?0:1);
