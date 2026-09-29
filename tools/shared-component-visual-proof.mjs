/**
 * Shared-component visual proof — before/after capture for the serialized
 * `stack/native-typescript/surfaces/m0-controller-composition.ts` hotspot fixes:
 *
 *   RC-1  CENTER/RIGHT duplication (ONE INFORMATION ITEM -> ONE AUTHORITATIVE DISPLAY LOCATION)
 *   RC-2  authored typed table matrix suppressed by collectionMode:'list'
 *   RC-3  semanticProjection generic filler + broken bare EMPTY / State empty treatment
 *
 * Usage:
 *   node tools/shared-component-visual-proof.mjs --label before
 *   node tools/shared-component-visual-proof.mjs --label after
 *   node tools/shared-component-visual-proof.mjs --compare
 *
 * Captures evidence · reviews · manual_ai · releases · configuration at 1440x1000 and
 * 1024x900 in EMPTY and FIXTURE-POPULATED states into
 *   writer-output/_coordinator/shared-component-fix/evidence/<label>/
 * and records measured DOM metrics per frame in metrics-<label>.json.
 *
 * --compare loads every before/after PNG pair through a canvas and reports
 * changed-pixel ratio + mean absolute channel delta into comparison.json.
 *
 * Every populated state is created through the live product domain inside the page and is
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

const root=fileURLToPath(new URL('../',import.meta.url));
const outRoot=path.join(root,'writer-output/_coordinator/shared-component-fix/evidence');
const args=process.argv.slice(2);
const argValue=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null};
const label=argValue('--label');
const compareMode=args.includes('--compare');
const SURFACES=['evidence','reviews','manual_ai','releases','configuration'];
const VIEWPORTS=[[1440,1000],[1024,900]];

const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})});

/* ------------------------------------------------------------------ in-page measurement */

const measureScript=()=>{
  const textOf=selector=>(document.querySelector(selector)?.innerText||'').replace(/[ \t]+/g,' ').trim();
  const centerText=textOf('#foundationStage .m0-workbench');
  const rightText=textOf('#rightPane .pbody');
  const leftText=textOf('#leftPane .pbody');
  return {
    centerText,
    rightText,
    leftText,
    tables:document.querySelectorAll('table.m0-table').length,
    tableHeaders:[...document.querySelectorAll('table.m0-table th')].map(node=>node.textContent.trim()),
    tableRows:document.querySelectorAll('table.m0-table tbody tr').length,
    listRows:document.querySelectorAll('.m0-row').length,
    centerSemanticRows:document.querySelectorAll('#foundationStage .m0-semantic-list dt').length,
    centerGroups:document.querySelectorAll('#foundationStage .m0-semantic-group').length,
    centerListItems:document.querySelectorAll('#foundationStage .m0-region-list li').length,
    rightSemanticRows:document.querySelectorAll('#rightPane .m0-semantic-list dt').length,
    rightGroups:document.querySelectorAll('#rightPane .m0-semantic-group').length,
    rightStateTokens:document.querySelectorAll('#rightPane .state-token').length,
    centerStateTokens:document.querySelectorAll('#foundationStage .state-token').length,
    guidance:document.querySelector('#foundationStage')?.textContent.includes('How this workspace works')||false,
    emptyMessageVisible:document.querySelector('#foundationStage .m0-empty-state')!==null,
    toolbarButtons:document.querySelectorAll('#domainToolbar [data-foundation-command]').length
  };
};

/* ------------------------------------------------------------------ labelled FIXTURE seeding */

const seedScript=surface=>{
  if(surface==='evidence')return ()=>{
    const registry=window.CEPFoundation.registry;
    for(const id of ['cand-proof-1','cand-proof-2'])registry.execute('evidence.import',{route:'shared-component-visual-proof',input:{id,revisionId:`${id}-r1`,title:`Fixture candidate ${id}`,sourceId:`fixture-source-${id}`,sourceRevision:'r1',subject:'owner:fixture',evidenceClaim:`Fixture evidence claim for ${id}`,criterionRefs:['criteria:v4#integrity'],governedPurpose:'shared-component visual proof fixture capture'}});
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:(window.CEPFoundation.m0Composition.surface.collectionCore||window.CEPFoundation.m0Composition.surface.collection).snapshot().visibleRows.length};
  };
  if(surface==='reviews')return ()=>{
    const M=window.CEPFoundation.m0Composition,d=M.group.evidence.domain,r=M.group.reviews.domain;
    d.importEvidence({id:'ev-proof-1',revisionId:'ev-proof-1-r1',title:'Fixture Evidence for Review',sourceId:'fixture-source',sourceRevision:'r1',subject:'owner:fixture',evidenceClaim:'Fixture evidence claim pinned to the fixture Review',criterionRefs:['criteria:v4#integrity'],governedPurpose:'shared-component visual proof fixture capture',verification:{status:'UNVERIFIED'}});
    d.verifySource('ev-proof-1',{status:'VERIFIED',providerId:'provider:fixture-visual-proof',providerRevision:'1.0.0',proofId:'proof:fixture:ev-proof-1',digest:'sha256:1111111111111111111111111111111111111111111111111111111111111111',schemaValid:true,sourceBytesAvailable:true});
    d.submitCandidate('ev-proof-1');
    d.markCandidateValidated('ev-proof-1',{validator:'fixture-visual-proof',validationProofRef:'proof:fixture:intake'});
    d.admissionAuthorityRegistry={resolveAdmissionAuthority:()=>({state:'AUTHORIZED',testOnly:false})};
    d.setAdmissionAuthority('ev-proof-1',true,'authority:fixture:visual-proof',{testOnly:false});
    d.admit('ev-proof-1');
    const row=d.inspect('ev-proof-1');
    window.CEPFoundation.sharedOwners.reviewAuthorityRegistry.registerReviewer('reviewer:fixture-proof',{authorized:true,canAssign:true,permissionProofRef:'perm:fixture-proof',testOnly:false});
    r.review('rv-proof-1',{action:'request',evidenceRefs:[`${row.evidenceId}@${row.revisionId}`],criteriaRefs:['criteria:v4#integrity'],reviewer:{identity:'reviewer:fixture-proof',permissionProofRef:'perm:fixture-proof',authorityAvailable:true,assignmentPermissionAvailable:true}});
    r.review('rv-proof-1',{action:'assign'});
    r.review('rv-proof-1',{action:'start'});
    r.finding('rv-proof-1',{findingId:'f-proof-1',text:'Fixture reviewer-authored finding recorded against the pinned criterion.',state:'SATISFIED',criterionRef:'criteria:v4#integrity',scopeDisposition:'IN_SCOPE'});
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:(M.surface.collectionCore||M.surface.collection).snapshot().visibleRows.length};
  };
  if(surface==='manual_ai')return ()=>{
    const composition=window.CEPFoundation.m0Composition.group.surfaces.manual_ai;
    composition.commands.execute('manual_ai.draft',{proposalId:'manual-proof-1',revision:'r1',sourceDigest:'a'.repeat(64),sourceId:'KU-D03-0001'});
    composition.commands.execute('manual_ai.draft',{proposalId:'manual-proof-2',revision:'r1',sourceDigest:'b'.repeat(64),sourceId:'KU-D03-0002'});
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:composition.collection.snapshot().visibleRows.length};
  };
  if(surface==='releases')return ()=>{
    const adapter=window.CEPFoundation.m0Composition.group.surfaces.releases.adapter;
    const candidate=(id,commit)=>({candidateId:id,commitSHA:commit,treeSHA:commit.split('').reverse().join(''),artifactDigest:commit.replace(/./g,'c'),state:'TECHNICALLY_READY',evidenceDigest:commit.replace(/./g,'e'),evidenceBinding:{digest:commit.replace(/./g,'e'),candidateRef:{candidateId:id,commitSHA:commit,treeSHA:commit.split('').reverse().join(''),artifactDigest:commit.replace(/./g,'c')},method:'FIXTURE_VISUAL_PROOF',evidenceRefs:['fixture-evidence']},authorization:'NONE',deployment:'UNKNOWN',deploymentObservedAt:null});
    adapter.candidates.set('REL-PROOF-1',candidate('REL-PROOF-1','a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'));
    adapter.candidates.set('REL-PROOF-2',candidate('REL-PROOF-2','b2c3d4e5f60718293a4b5c6d7e8f901234567890'));
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:adapter.rows().length};
  };
  return ()=>{
    const adapter=window.CEPFoundation.m0Composition.group.surfaces.configuration.adapter;
    const observation=(key,version)=>({key,presentVersion:version,source:'fixture-runtime-observer',observedAt:'2026-09-29T00:00:00.000Z',state:'AVAILABLE',redactedValue:'[REDACTED]',restartRequired:false});
    adapter.observations.push(observation('telemetry.sampleRate','v3'),observation('session.idleMinutes','v7'));
    window.CEPFoundation.m0Composition.mounted.render();
    return {fixture:true,rows:adapter.rows().length};
  };
};

/* ------------------------------------------------------------------ capture run */

const failures=[];
const capture=async()=>{
  const evidenceDir=path.join(outRoot,label);
  await mkdir(evidenceDir,{recursive:true});
  const port=await freePort();
  const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:'ignore'});
  const browser=await chromium.launch();
  const frames=[];
  try{
    for(const [width,height] of VIEWPORTS){
      for(const surface of SURFACES){
        const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
        const page=await context.newPage();
        const pageErrors=[];
        page.on('pageerror',error=>pageErrors.push(String(error?.message||error)));
        await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`,{waitUntil:'networkidle'});
        await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,surface,{timeout:20000});
        await page.waitForTimeout(300);
        for(const state of ['empty','populated']){
          if(state==='populated'){
            const seeded=await page.evaluate(seedScript(surface));
            await page.waitForTimeout(250);
            frames.push({surface,viewport:`${width}x${height}`,state:'seed',fixture:true,seeded});
          }
          const metrics=await page.evaluate(measureScript);
          const file=`${surface}-${width}x${height}-${state}.png`;
          await page.screenshot({path:path.join(evidenceDir,file),fullPage:false});
          const bytes=await readFile(path.join(evidenceDir,file));
          const centerLines=metrics.centerText.split('\n').map(s=>s.trim()).filter(Boolean);
          const rightLines=metrics.rightText.split('\n').map(s=>s.trim()).filter(Boolean);
          const shared=rightLines.filter(line=>centerLines.includes(line));
          frames.push({
            surface,viewport:`${width}x${height}`,state,
            file:`evidence/${label}/${file}`,
            sha256:createHash('sha256').update(bytes).digest('hex'),
            bytes:bytes.length,
            tables:metrics.tables,
            tableHeaders:metrics.tableHeaders,
            tableRows:metrics.tableRows,
            listRows:metrics.listRows,
            centerSemanticRows:metrics.centerSemanticRows,
            centerGroups:metrics.centerGroups,
            centerListItems:metrics.centerListItems,
            rightSemanticRows:metrics.rightSemanticRows,
            rightGroups:metrics.rightGroups,
            rightStateTokens:metrics.rightStateTokens,
            centerStateTokens:metrics.centerStateTokens,
            guidance:metrics.guidance,
            emptyMessageVisible:metrics.emptyMessageVisible,
            toolbarButtons:metrics.toolbarButtons,
            rightIsExactCenterCopy:metrics.rightText===metrics.centerText&&metrics.rightText.length>0,
            rightLineCount:rightLines.length,
            rightLinesAlsoInCenter:shared.length,
            rightLineOverlapRatio:rightLines.length?Number((shared.length/rightLines.length).toFixed(3)):0,
            pageErrors
          });
        }
        await context.close();
      }
    }
  }finally{
    await browser.close();
    server.kill();
  }
  const receipt={schemaVersion:1,proof:'shared-component-visual-fix',label,route:'/?surface=<consumer>',viewports:VIEWPORTS.map(v=>`${v[0]}x${v[1]}`),surfaces:SURFACES,fixturePolicy:'populated states are labelled FIXTURE seeds driven through the live product domain inside the page',frames};
  await writeFile(path.join(outRoot,`metrics-${label}.json`),JSON.stringify(receipt,null,2));
  console.log(`captured ${frames.filter(f=>f.file).length} frames -> ${evidenceDir}`);
  if(failures.length)process.exitCode=1;
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
    pairs.push({surface:before.surface,viewport:before.viewport,state:before.state,beforeBytes:before.bytes,afterBytes:after.bytes,...delta});
  }
  await browser.close();
  const result={schemaVersion:1,proof:'shared-component-visual-fix',comparison:'before-vs-after',pairs};
  await writeFile(path.join(outRoot,'comparison.json'),JSON.stringify(result,null,2));
  console.log(`compared ${pairs.length} frame pairs -> ${path.join(outRoot,'comparison.json')}`);
};

if(compareMode)await compare();
else if(label)await capture();
else{console.error('usage: --label <name> | --compare');process.exit(2)}
