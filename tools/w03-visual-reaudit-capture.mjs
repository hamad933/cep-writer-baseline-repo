/**
 * W03 visual re-audit capture + probe (R2/R6 capture, R3/R7 re-comparison input).
 *
 * Usage:
 *   node tools/w03-visual-reaudit-capture.mjs --label before          # probe + screenshots
 *   node tools/w03-visual-reaudit-capture.mjs --label after
 *   node tools/w03-visual-reaudit-capture.mjs --probe                # probe only (no PNG)
 *   node tools/w03-visual-reaudit-capture.mjs --compare before after  # byte/dHash/ink diff
 *
 * Writes:
 *   writer-output/W03/reaudit-evidence/<label>/*.png
 *   writer-output/W03/reaudit-evidence/metrics-<label>.json
 *
 * Grounding law: every claim in the metrics file is measured from file bytes
 * (sha256, dimensions, dHash, edge-ink fraction) or from live DOM text, never from
 * the harness image-render channel (controller/12_execution/11_evidence_channel_integrity.md).
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
const outRoot=path.join(root,'writer-output/W03/reaudit-evidence');
const args=process.argv.slice(2);
const argValue=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null};
const label=argValue('--label')||'probe';
const probeOnly=args.includes('--probe');
const SURFACES=['enterprise','scenarios','labs','runs','results'];
const VIEWPORTS=[[1440,1000],[1024,900]];

const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})});

/* ------------------------------------------------------------------ in-page probe */
const probeScript=surface=>{
  const regionText=sel=>(document.querySelector(sel)?.innerText||'').replace(/[ \t]+/g,' ').trim();
  const visible=sel=>[...document.querySelectorAll(sel)].filter(n=>n.offsetParent!==null||n.getClientRects().length);
  const words=text=>text.split(/\s+/).filter(Boolean).length;
  const left=regionText('#leftPane .pbody'),center=regionText('#centerPane'),right=regionText('#rightPane .pbody'),
        top=regionText('#topBanner'),toolbar=regionText('.toolbar');
  const svgNodes=document.querySelectorAll('#centerPane svg .node,#centerPane .spatial-node,#centerPane [data-m0-spatial] svg g,#centerPane .spatial-host svg g').length;
  const list=sel=>[...document.querySelectorAll(sel)];
  const all=left+center+right;
  return {
    consumer:document.body.dataset.consumer||window.CEPFoundation?.consumer||null,
    top,left,center,right,toolbar,
    words:{left:words(left),center:words(center),right:words(right),toolbar:words(toolbar),total:words(all)},
    counts:{
      toolbarButtons:visible('.toolbar [data-foundation-command],.toolbar button').length,
      toolbarLabels:list('.toolbar [data-foundation-command],.toolbar button').map(n=>n.textContent.trim()),
      leftButtons:visible('#leftPane .pbody button').length,
      centerButtons:visible('#centerPane button').length,
      tables:document.querySelectorAll('#centerPane table').length,
      tableHeaders:list('#centerPane table th').map(n=>n.textContent.trim()),
      tableRows:document.querySelectorAll('#centerPane table tbody tr').length,
      semanticRows:document.querySelectorAll('#centerPane .m0-semantic-list dt').length,
      semanticGroups:list('#centerPane .m0-semantic-group h3,#centerPane .m0-semantic-group h4,#leftPane .m0-semantic-group h3,#leftPane .m0-domain-nav h2').map(n=>n.textContent.trim()),
      listItems:document.querySelectorAll('#centerPane .m0-region-list li').length,
      stateTokens:list('#centerPane .state-token,#leftPane .state-token,#rightPane .state-token').map(n=>n.textContent.replace(/\s+/g,' ').trim()),
      spatialNodes:svgNodes,
      spatialEdges:document.querySelectorAll('#centerPane .spatial-host svg line,#centerPane [data-m0-spatial] svg line,#centerPane [data-m0-spatial] svg path,#centerPane .spatial-host svg path').length,
      spatialHosts:document.querySelectorAll('#centerPane [data-m0-spatial],#centerPane .spatial-host').length,
      clipped:[...document.querySelectorAll('#centerPane .enterprise-right,#centerPane .enterprise-context dt,#centerPane .enterprise-context dd,#centerPane .enterprise-context h3,#centerPane .enterprise-context p,#rightPane .pbody dt,#rightPane .pbody dd,#rightPane .pbody h3')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>`${n.tagName}.${n.className||''}:${(n.textContent||'').trim().slice(0,26)}`),
      banners:document.querySelector('#topBanner .title')?.textContent||'',
      badge:document.querySelector('#topBanner .badge')?.textContent||''
    }
  };
};

/* ------------------------------------------------------------------ state enaction
 * NOTE: playwright serialises the callback with fn.toString() — it must be fully
 * self-contained (no closures over capture-scope variables). Pass state via the arg. */
const stateAction=({surface,state})=>{
  const list=sel=>[...document.querySelectorAll(sel)];
  if(surface==='enterprise'){
    if(state==='Published'){
      const R=window.CEPFoundation.registry;
      const steps=[
        R.execute('enterprise.create',{enterpriseId:'ENT-ATLAS-FINANCE',revisionId:'ENT-REV-005-DRAFT',twinId:'TWIN-TRAINING-01',route:'w03-reaudit'}),
        R.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:'BL-APPSEC-R5',revision:'5',digest:'sha256:9f2c1a7d4e8b3c5a6f0d1e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'},route:'w03-reaudit'}),
        R.execute('enterprise.validate',{route:'w03-reaudit'}),
        R.execute('enterprise.publish',{route:'w03-reaudit'})
      ];
      window.CEPFoundation.m0Composition?.presentation?.refresh?.();
      const rev=[...document.querySelectorAll('#centerPane [data-mode]')].find(b=>b.dataset.mode==='revisions');
      if(rev)rev.click();
      return {ok:true,mode:'published',results:steps.map(s=>s&&s.ok===false?String(s.code||s.reason):Boolean(s&&s.ok))};
    }
    const mode={Revisions:'revisions',Baselines:'baselines',DigitalTwins:'twins'}[state];
    if(!mode)return {ok:true,noop:true};
    const btn=list('#centerPane [data-mode]').find(b=>b.dataset.mode===mode);
    if(!btn)return {ok:false,reason:'no mode button'};
    btn.click();return {ok:true,mode};
  }
  if(surface==='runs'){
    const label={'Topology':'topology','Objects':'table','History':'history','Recorded result':'recorded','Preflight':'preflight'}[state];
    if(!label)return {ok:true,noop:true};
    if(label==='preflight'){
      const btn=list('.toolbar [data-foundation-command]').find(b=>/preflight/i.test(b.textContent));
      if(!btn)return {ok:false,reason:'no runs.preflight toolbar control'};
      btn.click();return {ok:true,label,cmd:btn.dataset.foundationCommand};
    }
    const btn=list('#centerPane [data-view]').find(b=>b.dataset.view===label);
    if(!btn)return {ok:false,reason:'no view button'};
    btn.click();return {ok:true,label};
  }
  if(surface==='results'){
    const ids={'Replay':'results.replay','AAR':'results.annotate','Compare':'results.compare'};
    const id=ids[state];
    if(!id)return {ok:false,reason:`no mapping for ${state}`};
    // Disabled toolbar buttons are correct (provider unavailable); the capability request is made
    // through the semantic bus so the surface's truthful capability state is recorded and visible.
    let r;try{r=window.CEPFoundation.commandBus.execute(id,{route:'w03-reaudit'})}catch(error){r={ok:false,code:error?.code||'THROWN',reason:String(error?.message||error)}}
    const rejected=Boolean(r&&r.ok===false);
    return {ok:!rejected,cmd:id,enacted:!rejected,result:rejected?`${r.code||r.status||'BLOCKED'} · capability gated by RESULTS_PROVIDER_UNAVAILABLE`:'accepted'};
  }
  return {ok:true,noop:true};
};

/* ------------------------------------------------------------------ PNG byte measures (no render channel) */
const pngMeasures=async file=>{
  const bytes=await readFile(file);
  const sha=createHash('sha256').update(bytes).digest('hex');
  // decode via playwright canvas for deterministic pixel metrics
  return {bytes:bytes.length,sha256:sha};
};

const pixelMeasures=async(page,file)=>{
  const b64=(await readFile(file)).toString('base64');
  return page.evaluate(async src=>{
    const load=s=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='data:image/png;base64,'+s});
    const img=await load(src);
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
    const d=ctx.getImageData(0,0,img.width,img.height).data;
    // edge-density ink fraction (FIND_EDGES-like 3x3 gradient) + luminance sigma
    let ink=0,lumSum=0,lumSq=0,n=0;
    const lum=i=>0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
    for(let y=1;y<img.height-1;y++)for(let x=1;x<img.width-1;x++){
      const i=(y*img.width+x)*4;
      const gx=Math.abs(lum(i+4)-lum(i-4)),gy=Math.abs(lum(i+img.width*4)-lum(i-img.width*4));
      if(gx+gy>24)ink++;
      const l=lum(i);lumSum+=l;lumSq+=l*l;n++;
    }
    const mean=lumSum/n;
    // 256-bit dHash
    let dh='',bits=0,acc=0,count=0;
    for(let y=1;y<img.height&&count<256;y+=2)for(let x=1;x<img.width-1&&count<256;x+=2){
      const i=(y*img.width+x)*4;
      acc=(acc<<1)|(lum(i)>lum(i+4)?1:0);bits++;count++;
      if(bits===32){dh+=acc.toString(16).padStart(8,'0');acc=0;bits=0}
    }
    return {width:img.width,height:img.height,inkFraction:Number((ink/n).toFixed(4)),luminanceMean:Number(mean.toFixed(2)),luminanceSigma:Number(Math.sqrt(lumSq/n-mean*mean).toFixed(2)),dHash:dh};
  },b64);
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
      for(const surface of SURFACES){
        const states=['base'].concat(surface==='enterprise'?['Published','Revisions','Baselines','DigitalTwins']
          :surface==='runs'?['Objects','History','Recorded result','Preflight']   // `base` already IS the Topology view
          :surface==='results'?['Replay','AAR','Compare']
          :[]);
        for(const state of states){
          // fresh page per state so every captured frame is an independent, enacted state
          const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
          const page=await context.newPage();
          const pageErrors=[];
          page.on('pageerror',error=>pageErrors.push(String(error?.message||error)));
          await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`,{waitUntil:'networkidle'});
          await page.waitForFunction(s=>window.CEPFoundation?.consumer===s,surface,{timeout:25000});
          await page.waitForTimeout(400);
          let action={ok:true,noop:true};
          if(state!=='base'){action=await page.evaluate(stateAction,{surface,state});await page.waitForTimeout(450)}
          const probe=await page.evaluate(probeScript,surface);
          const file=`${surface}-${state==='base'?'base':state.replace(/\s+/g,'')}-${width}x${height}.png`;
          let measure=null;
          if(!probeOnly){
            await page.screenshot({path:path.join(evidenceDir,file),fullPage:false});
            const {bytes,sha256}=await pngMeasures(path.join(evidenceDir,file));
            measure={file:`${label}/${file}`,bytes,sha256,...(await pixelMeasures(page,path.join(evidenceDir,file)))};
          }
          frames.push({surface,viewport:`${width}x${height}`,state,action,pageErrors,probe,measure});
          await context.close();
        }
      }
    }
  }finally{
    await browser.close();
    server.kill();
  }
  const distinctness={};
  for(const f of frames){
    const key=`${f.surface}@${f.viewport}`;
    const row={state:f.state,sha:f.measure?.sha256?.slice(0,16)||null,enacted:f.action?.ok!==false,reason:f.action?.ok===false?String(f.action?.reason||f.action?.result||'not enacted'):null};
    (distinctness[key]??=[]).push(row);
  }
  for(const key of Object.keys(distinctness)){
    const rows=distinctness[key],enacted=rows.filter(r=>r.enacted),shas=enacted.map(r=>r.sha).filter(Boolean);
    distinctness[key]={enactedStates:enacted.map(r=>r.state),notEnacted:rows.filter(r=>!r.enacted).map(r=>({state:r.state,reason:r.reason})),allByteDistinct:new Set(shas).size===shas.length,uniqueCount:new Set(shas).size,total:shas.length};
  }
  const receipt={schemaVersion:1,proof:'w03-visual-reaudit',label,route:'/?surface=<consumer>',viewports:VIEWPORTS.map(v=>`${v[0]}x${v[1]}`),surfaces:SURFACES,distinctness,frames};
  await writeFile(path.join(outRoot,`metrics-${label}.json`),JSON.stringify(receipt,null,2));
  console.log(`captured/probed ${frames.length} frames -> ${probeOnly?'(probe only)':evidenceDir}`);
  console.log('state distinctness:',JSON.stringify(Object.fromEntries(Object.entries(distinctness).map(([k,v])=>[k,{all:v.allByteDistinct,u:`${v.uniqueCount}/${v.total}`}]))));
};

/* ------------------------------------------------------------------ byte compare */
const compare=async(a,b)=>{
  const ra=JSON.parse(await readFile(path.join(outRoot,`metrics-${a}.json`),'utf8'));
  const rb=JSON.parse(await readFile(path.join(outRoot,`metrics-${b}.json`),'utf8'));
  const rows=[];
  for(const fa of ra.frames){
    const fb=rb.frames.find(x=>x.surface===fa.surface&&x.viewport===fa.viewport&&x.state===fa.state);
    if(!fb)continue;
    if(fa.measure&&fb.measure)rows.push({surface:fa.surface,viewport:fa.viewport,state:fa.state,identicalBytes:fa.measure.sha256===fb.measure.sha256,a:fa.measure.sha256.slice(0,12),b:fb.measure.sha256.slice(0,12),inkA:fa.measure.inkFraction,inkB:fb.measure.inkFraction,wordsA:fa.probe.words.total,wordsB:fb.probe.words.total});
    else rows.push({surface:fa.surface,viewport:fa.viewport,state:fa.state,identicalBytes:null,wordsA:fa.probe.words.total,wordsB:fb.probe.words.total});
  }
  await writeFile(path.join(outRoot,`comparison-${a}-vs-${b}.json`),JSON.stringify({schemaVersion:1,a,b,rows},null,2));
  console.table(rows.map(r=>({surface:r.surface,viewport:r.viewport,state:r.state,same:r.identicalBytes,words:`${r.wordsA} -> ${r.wordsB}`,ink:`${r.inkA??'-'} -> ${r.inkB??'-'}`})));
};

if(args.includes('--compare')){
  const first=args[args.indexOf('--compare')+1],second=args[args.indexOf('--compare')+2];
  await compare(first,second);
}else await capture();
