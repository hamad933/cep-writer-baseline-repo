/**
 * Shared-component visual proof 2 — before/after capture for the shared-cause fixes:
 *
 *   F1  adapters/structured-documents.ts scaffold honesty (scenarios/labs seed)
 *   F2  foundation/workspace.ts .phead h2 direction-aware labels (LTR clipping in RTL)
 *     F3  foundation/spatial/presentation.ts node-card slots + edge label/class vocabulary
 *   F4  surfaces/visualize/surface.ts consumes the shared outline host
 *   F5  surfaces/m0-controller-composition.ts W04/W05 bottom shelf provider registration
 *
 * Usage:
 *   node tools/shared-component-visual-proof2.mjs --label before --root /tmp/opencode/before-repo
 *   node tools/shared-component-visual-proof2.mjs --label after
 *   node tools/shared-component-visual-proof2.mjs --compare
 *
 * Captures scenarios · labs · learn · rq · evidence · configuration · visualize · results
 * at 1440x1000 and 1024x900 into
 *   writer-output/_coordinator/shared-component-fix2/evidence/<label>/
 * and records measured DOM metrics per frame in metrics-<label>.json.
 *
 * All populated states are created through the live product domain inside the page and are
 * labelled FIXTURE in the metrics output. No product source is modified by this tool.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright')}catch(primaryError){const override=process.env.CEP_PLAYWRIGHT_MODULE_PATH;if(!override)throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);playwright=require(path.resolve(override))}
const {chromium}=playwright;

const repoRoot=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);
const argValue=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null};
const label=argValue('--label');
const compareMode=args.includes('--compare');
const root=path.resolve(argValue('--root')||repoRoot);
const outRoot=path.join(repoRoot,'writer-output/_coordinator/shared-component-fix2/evidence');
const SURFACES=[
  {surface:'scenarios',states:['empty']},
  {surface:'labs',states:['empty']},
  {surface:'learn',states:['empty']},
  {surface:'rq',states:['empty']},
  {surface:'evidence',states:['empty','populated','populated-bottom']},
  {surface:'configuration',states:['empty','populated','populated-bottom']},
  {surface:'visualize',states:['tree','canvas']},
  {surface:'runs',states:['empty']},
  {surface:'results',states:['empty']}
];
const VIEWPORTS=[[1440,1000],[1024,900]];

const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})});

/* ------------------------------------------------------------------ in-page measurement */

const measureScript=()=>{
  const headings=[...document.querySelectorAll('#leftPane .phead h2, #rightPane .phead h2')].map(node=>{const cs=getComputedStyle(node),rect=node.getBoundingClientRect();return {text:(node.textContent||'').trim(),clientWidth:node.clientWidth,scrollWidth:node.scrollWidth,clipped:node.scrollWidth>node.clientWidth+1,clippedFraction:node.scrollWidth>node.clientWidth+1?Number(((node.scrollWidth-node.clientWidth)/node.scrollWidth).toFixed(3)):0,direction:cs.direction,dirAttr:node.getAttribute('dir'),unicodeBidi:cs.unicodeBidi,rect:{x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)}}});
  const shelf=document.querySelector('#bottomShelf');
  const nodes=[...document.querySelectorAll('.spatial-node-card')];
  const edges=[...document.querySelectorAll('.spatial-relation')];
  const docTitle=(document.querySelector('#centerPane .docscroll .doctitle')?.textContent||document.querySelector('#centerPane .doctitle')?.textContent||'').trim();
  const docText=(document.querySelector('#centerPane .docscroll')?.innerText||'').replace(/\s+/g,' ').trim();
  return {
    headings,
    clippedHeadings:headings.filter(h=>h.clipped).map(h=>h.text),
    bottomShelf:shelf?{availability:shelf.dataset.bottomAvailability||null,providerOwner:shelf.dataset.bottomProviderOwner||null,state:shelf.dataset.state||null,toggleDisabled:document.querySelector('#bottomToggle')?.disabled??null,summary:(document.querySelector('#bottomSummary')?.textContent||'').trim(),contentText:(document.querySelector('#bottomContent')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,500)}:null,
    spatial:{nodeCount:nodes.length,idChips:document.querySelectorAll('.node-id-chip').length,iconTiles:document.querySelectorAll('.node-icon-tile').length,titles:document.querySelectorAll('.node-title').length,statusChips:document.querySelectorAll('.node-status-chip').length,secondaryLines:document.querySelectorAll('.node-secondary-line').length,progressMeters:document.querySelectorAll('.node-progress').length,tagRows:document.querySelectorAll('.node-tags').length,duplicateCards:document.querySelectorAll('.spatial-node-duplicate').length,
      edgeCount:edges.length,labelledEdges:edges.filter(e=>(e.querySelector('[data-relation-label]')?.textContent||'').trim().length>0).length,edgeClasses:edges.map(e=>e.getAttribute('data-edge-class'))},
    outline:{hosts:document.querySelectorAll('[data-outline-owner]').length,treeItems:document.querySelectorAll('.treeitem').length,visualizeOutline:document.querySelectorAll('[data-visualize-outline]').length,auxDetails:document.querySelectorAll('#domainView details.visualize-tree-aux').length,treeStatus:document.querySelector('[data-visualize-projection="TREE"]')?.getAttribute('data-tree-hierarchy-status')||null,legacyBespokeRows:document.querySelectorAll('#domainView .visualize-tree-rows .visualize-tree-row').length},
    scaffold:{docTitle,hasFoundationHostTitle:docTitle.includes('Foundation document host'),hasHonestScaffoldTitle:docTitle.includes('empty Structured scaffold'),docTextHead:docText.slice(0,220)},
    selectableRows:document.querySelectorAll('#domainView [data-visualize-select]').length
  };
};

/* ------------------------------------------------------------------ labelled FIXTURE seeding */

const seedScript=state=>{
  if(state==='populated-evidence')return ()=>{
    const registry=window.CEPFoundation.registry;
    for(const id of ['cand-proof-1','cand-proof-2'])registry.execute('evidence.import',{route:'shared-component-visual-proof2',input:{id,revisionId:`${id}-r1`,title:`Fixture candidate ${id}`,sourceId:`fixture-source-${id}`,sourceRevision:'r1',subject:'owner:fixture',evidenceClaim:`Fixture evidence claim for ${id}`,criterionRefs:['criteria:v4#integrity'],governedPurpose:'shared-component visual proof fixture capture'}});
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:(window.CEPFoundation.m0Composition.surface.collectionCore||window.CEPFoundation.m0Composition.surface.collection).snapshot().visibleRows.length};
  };
  if(state==='populated-configuration')return ()=>{
    const adapter=window.CEPFoundation.m0Composition.group.surfaces.configuration.adapter;
    const observation=(key,version)=>({key,presentVersion:version,source:'fixture-runtime-observer',observedAt:'2026-09-29T00:00:00.000Z',state:'AVAILABLE',redactedValue:'[REDACTED]',restartRequired:false});
    adapter.observations.push(observation('telemetry.sampleRate','v3'),observation('session.idleMinutes','v7'));
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:adapter.rows().length};
  };
  return ()=>{
    const registry=window.CEPFoundation.registry,composition=window.CEPFoundation.m0Composition,adapter=composition&&composition.adapter;
    let canvasLinkAttempted=false;
    if(adapter&&typeof adapter.view==='function'){
      const ids=adapter.view('CANVAS').representationIds();
      if(ids.length>=2){
        registry.execute('visualize.select',{mode:'CANVAS',representationIds:[ids[0]],action:'replace',route:'visualize-proof2'});
        registry.execute('visualize.select',{mode:'CANVAS',representationIds:[ids[1]],action:'add',route:'visualize-proof2'});
        registry.execute('visualize.canvasLink',{mode:'CANVAS',route:'visualize-proof2'});
        canvasLinkAttempted=true;
      }
    }
    composition?.presentation?.render?.();
    return {fixture:true,canvasLinkAttempted};
  };
};

/* ------------------------------------------------------------------ capture run */

const capture=async()=>{
  const evidenceDir=path.join(outRoot,label);
  await mkdir(evidenceDir,{recursive:true});
  const port=await freePort();
  const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
  const browser=await chromium.launch();
  const frames=[];
  try{
    for(const [width,height] of VIEWPORTS){
      for(const spec of SURFACES){
        const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
        const page=await context.newPage();
        const pageErrors=[];
        page.on('pageerror',error=>pageErrors.push(String(error?.message||error)));
        await page.goto(`http://127.0.0.1:${port}/?surface=${spec.surface}`,{waitUntil:'networkidle'});
        try{await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,spec.surface,{timeout:20000})}catch(error){throw Error(`SURFACE_BOOTSTRAP_FAILED:${spec.surface}:${width}x${height}: ${error.message} :: pageErrors=${JSON.stringify(pageErrors)} :: href=${page.url()}`)}
        await page.waitForTimeout(300);
        for(const state of spec.states){
          if(state==='populated'){
            const seeded=await page.evaluate(seedScript(`populated-${spec.surface}`));
            await page.waitForTimeout(250);
            frames.push({surface:spec.surface,viewport:`${width}x${height}`,state:'seed',fixture:true,seeded});
          }else if(state==='canvas'){
            await page.click('[data-visualize-view-tab="CANVAS"]');
            await page.waitForTimeout(350);
            const seeded=await page.evaluate(seedScript('canvas-seed'));
            await page.waitForTimeout(250);
            frames.push({surface:spec.surface,viewport:`${width}x${height}`,state:'seed',fixture:true,seeded});
          }else if(state==='tree'){
            await page.click('[data-visualize-view-tab="TREE"]');
            await page.waitForTimeout(250);
          }else if(state==='populated-bottom'){
            await page.click('#bottomToggle',{force:true});
            await page.waitForTimeout(350);
          }
          const metrics=await page.evaluate(measureScript);
          const file=`${spec.surface}-${width}x${height}-${state}.png`;
          await page.screenshot({path:path.join(evidenceDir,file),fullPage:false});
          const bytes=await readFile(path.join(evidenceDir,file));
          frames.push({surface:spec.surface,viewport:`${width}x${height}`,state,file:`evidence/${label}/${file}`,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,metrics,pageErrors});
        }
        await context.close();
      }
    }
  }finally{
    await browser.close();
    server.kill();
  }
  const receipt={schemaVersion:1,proof:'shared-component-visual-fix2',label,root,route:'/?surface=<consumer>',viewports:VIEWPORTS.map(v=>`${v[0]}x${v[1]}`),surfaces:SURFACES.map(s=>s.surface),fixturePolicy:'populated states are labelled FIXTURE seeds driven through the live product domain inside the page',frames};
  await writeFile(path.join(outRoot,`metrics-${label}.json`),JSON.stringify(receipt,null,2));
  console.log(`captured ${frames.filter(f=>f.file).length} frames -> ${evidenceDir}`);
};

/* ------------------------------------------------------------------ compare mode (pixel delta) */

const compare=async()=>{
  const beforeDir=path.join(outRoot,'before'),afterDir=path.join(outRoot,'after');
  const beforeReceipt=JSON.parse(await readFile(path.join(outRoot,'metrics-before.json'),'utf8'));
  const afterReceipt=JSON.parse(await readFile(path.join(outRoot,'metrics-after.json'),'utf8'));
  const browser=await chromium.launch();
  const page=await browser.newPage();
  const pairs=[];
  for(const before of beforeReceipt.frames.filter(f=>f.file)){
    const after=afterReceipt.frames.find(f=>f.surface===before.surface&&f.viewport===before.viewport&&f.state===before.state);
    if(!after)continue;
    const read=async dir=>(await readFile(path.join(dir,path.basename(before.file)))).toString('base64');
    const [a,b]=[await read(beforeDir),await read(afterDir)];
    const delta=await page.evaluate(async([one,two])=>{
      const load=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.src='data:image/png;base64,'+src});
      const [imgA,imgB]=await Promise.all([load(one),load(two)]);
      const canvasA=document.createElement('canvas'),canvasB=document.createElement('canvas');
      canvasA.width=canvasB.width=imgA.width;canvasA.height=canvasB.height=imgA.height;
      canvasA.getContext('2d').drawImage(imgA,0,0);canvasB.getContext('2d').drawImage(imgB,0,0);
      const dataA=canvasA.getContext('2d').getImageData(0,0,imgA.width,imgA.height).data;
      const dataB=canvasB.getContext('2d').getImageData(0,0,imgA.width,imgA.height).data;
      let changed=0,total=0,deltaSum=0;
      for(let i=0;i<dataA.length;i+=4){const d=Math.abs(dataA[i]-dataB[i])+Math.abs(dataA[i+1]-dataB[i+1])+Math.abs(dataA[i+2]-dataB[i+2]);if(d>0)changed++;deltaSum+=d;total++}
      return {width:imgA.width,height:imgA.height,changedPixelRatio:Number((changed/total).toFixed(4)),meanAbsChannelDelta:Number((deltaSum/total/3).toFixed(3))};
    },[a,b]);
    pairs.push({surface:before.surface,viewport:before.viewport,state:before.state,beforeBytes:before.bytes,afterBytes:after.bytes,beforeSha256:before.sha256,afterSha256:after.sha256,...delta});
  }
  await browser.close();
  const result={schemaVersion:1,proof:'shared-component-visual-fix2',comparison:'before-vs-after',pairs};
  await writeFile(path.join(outRoot,'comparison.json'),JSON.stringify(result,null,2));
  console.log(`compared ${pairs.length} frame pairs -> ${path.join(outRoot,'comparison.json')}`);
};

if(compareMode)await compare();
else if(label)await capture();
else{console.error('usage: --label <name> [--root <dir>] | --compare');process.exit(2)}
