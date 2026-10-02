/**
 * H03 residual F02 — LANE RUN-1 fail-closed falsification probe.
 *
 * Question under test: when shared-owner injection is absent, does the Runs Product path
 * fail closed (no silent `new OperationalSessionOwner()`)?
 *
 * The probe drives the EXACT Product construction expressions (read from the read-only Product
 * sources at runtime, so the probe cannot drift from the Product path):
 *   - m0-controller-composition runs branch ternary → `new W03RunDomain({})`
 *   - w03-rescue group default → composeW03RescueGroup({shared without operationalSessionOwner})
 * plus source-bound negatives, an injected-owner positive control, and truthful
 * INTERNAL_SIMULATION terminal/provider truth checks.
 *
 * Usage: node writer-output/W03-RUNS/f02-fail-closed-probe.mjs
 * Evidence: writer-output/W03-RUNS/evidence/f02-fail-closed-probe-<ts>.json (hash-bound)
 */
import {readFileSync} from 'node:fs';
import {writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const rel=p=>path.join(root,p);
const commit=execSync('git rev-parse HEAD',{cwd:root}).toString().trim();
const tree=execSync('git rev-parse HEAD^{tree}',{cwd:root}).toString().trim();
const writableDiff=execSync('git status --porcelain -- stack/native-typescript/surfaces/runs stack/native-typescript/adapters/runs stack/native-typescript/adapters/w03-runs.ts stack/native-typescript/adapters/w03-v34/runs-fixture.ts writer-output/W03-RUNS',{cwd:root}).toString().trim();

const load=async p=>await import(pathToFileURL(rel(p)).href);
const {W03RunDomain}=await load('dist/adapters/runs/domain.js');
const {W03V34RunsAdapter}=await load('dist/adapters/w03-runs.js');
const {composeRunsSurface}=await load('dist/surfaces/runs/index.js');
const {composeW03RescueGroup}=await load('dist/surfaces/composition/w03-rescue.js');
const {OperationalSessionOwner}=await load('dist/foundation/operational/session-owner.js');

const m0Source=readFileSync(rel('stack/native-typescript/surfaces/m0-controller-composition.ts'),'utf8');
const domainSource=readFileSync(rel('stack/native-typescript/adapters/runs/domain.ts'),'utf8');
const rescueSource=readFileSync(rel('stack/native-typescript/surfaces/composition/w03-rescue.ts'),'utf8');
const indexSource=readFileSync(rel('stack/native-typescript/surfaces/runs/index.ts'),'utf8');

const checks=[];
const record=(id,pass,detail)=>{checks.push({id,status:pass?'PASS':'FAIL',detail});return pass};
const coded=(fn)=>{try{fn();return {threw:false}}catch(error){return {threw:true,code:error.code||null,message:String(error.message||error)}}};
const sourceIdentity=source=>createHash('sha256').update(source).digest('hex');

/* ---- S1: Product path binding (static, from read-only sources) ---- */
const m0Ternary='sharedSession&&simulation&&typeof sharedSession.registerProvider===\'function\'?{runtime:simulation,sessionOwner:sharedSession}:{}';
record('S1a.m0-product-path-passes-empty-options-when-injection-absent',m0Source.includes(m0Ternary),{source:'stack/native-typescript/surfaces/m0-controller-composition.ts',sha256:sourceIdentity(m0Source),needle:m0Ternary});
record('S1b.w03-rescue-requires-shared-operational-owner',rescueSource.includes('W03_CONTROLLER_SHARED_OWNER_BINDINGS_REQUIRED')&&rescueSource.includes('sessionOwner:shared.operationalSessionOwner'),{source:'stack/native-typescript/surfaces/composition/w03-rescue.ts',sha256:sourceIdentity(rescueSource)});
record('S1c.domain-never-instantiates-operational-session-owner',!/new OperationalSessionOwner\(/.test(domainSource)&&/sessionOwner=null/.test(domainSource),{source:'stack/native-typescript/adapters/runs/domain.ts',sha256:sourceIdentity(domainSource),containsFallbackInstantiation:/new OperationalSessionOwner\(/.test(domainSource)});
record('S1d.harness-default-is-explicit-and-outside-the-domain',/harnessRunsDomain=\(\)=>new W03RunDomain\(\{sessionOwner:new OperationalSessionOwner\(\)\}\)/.test(indexSource),{source:'stack/native-typescript/surfaces/runs/index.ts',sha256:sourceIdentity(indexSource),note:'composition-level explicit harness injection; W03RunDomain itself creates no owner'});

/* ---- P1: m0 Product path behaviour (exact construction) ---- */
const product=new W03RunDomain({}); // exact options object the Product ternary passes when injection is absent
record('P1a.product-domain-session-owner-null',product.sessionOwner===null,{sessionOwner:product.sessionOwner});
const truth=product.truth();
record('P1b.product-truth-reports-absent-fail-closed',truth.sessionOwnerBinding==='ABSENT_FAIL_CLOSED'&&truth.operationalSessionOwner===null&&truth.sessionOwnerFallbackCreated===false,{sessionOwnerBinding:truth.sessionOwnerBinding,operationalSessionOwner:truth.operationalSessionOwner,sessionOwnerFallbackCreated:truth.sessionOwnerFallbackCreated});
record('P1c.product-terminal-ops-fail-closed',(()=>{
  const open=coded(()=>product.openTerminal({deviceId:'DEV-WEB-01'}));
  const input=coded(()=>product.input({deviceId:'DEV-WEB-01',command:'show status',invocationId:'f02-1'}));
  const reconnect=coded(()=>product.reconnect({deviceId:'DEV-WEB-01'}));
  const codes=[open,input,reconnect].map(r=>r.code);
  return open.threw&&input.threw&&reconnect.threw&&codes.every(c=>c==='RUNS_SESSION_OWNER_REQUIRED')&&product.presentationByDevice.size===0;
})(),{codes:['RUNS_SESSION_OWNER_REQUIRED'],presentationByDeviceSize:product.presentationByDevice.size});
record('P1d.product-availability-refuses-without-throwing',(()=>{
  const shared={spatialRelation:{owner:'RelationInteractionOwner'}};
  const surface=composeRunsSurface({domain:product,shared});
  const ids=['OPEN_TERMINAL','runtime.input','runtime.reconnect'];
  const states=ids.map(id=>({id,...surface.bus.availability(id,{deviceId:'DEV-WEB-01'})}));
  const executed=surface.bus.execute('OPEN_TERMINAL',{deviceId:'DEV-WEB-01'});
  return states.every(s=>s.enabled===false&&s.code==='RUNS_SESSION_OWNER_REQUIRED')&&executed.ok===false&&executed.code==='RUNS_SESSION_OWNER_REQUIRED';
})(),{availability:'RUNS_SESSION_OWNER_REQUIRED on OPEN_TERMINAL/runtime.input/runtime.reconnect; execute returns disabled receipt, no throw'});
record('P1e.owner-independent-projections-stay-truthful',(()=>{
  const ws=product.workspace(),rec=product.recorded(),pf=product.preflight();
  return typeof ws.run.lifecycle==='string'&&rec.recordedPlayback==='INERT'&&typeof pf.status==='string';
})(),{lifecycle:product.workspace().run.lifecycle,recordedPlayback:product.recorded().recordedPlayback,preflightStatus:product.preflight().status});

/* ---- P2: w03-rescue Product path refuses missing shared owner ---- */
const rescue=coded(()=>composeW03RescueGroup({shared:{structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'},timelineReplayOwner:{owner:'TimelineReplayOwner'},analyticalCompareOwner:{owner:'AnalyticalCompareOwner'}}}));
record('P2a.w03-rescue-fails-closed-without-shared-operational-owner',rescue.threw&&String(rescue.message||'').includes('W03_CONTROLLER_SHARED_OWNER_BINDINGS_REQUIRED'),{threw:rescue.threw,code:rescue.code,message:rescue.message});

/* ---- P3: injected owner positive control (singleton path works) ---- */
const sharedOwner=new OperationalSessionOwner();
const injected=new W03RunDomain({runtime:new W03V34RunsAdapter(),sessionOwner:sharedOwner});
const open=coded(()=>injected.openTerminal({deviceId:'DEV-WEB-01'}));
record('P3a.injected-owner-opens-terminal',open.threw===false&&injected.sessionOwner===sharedOwner&&injected.truth().sessionOwnerBinding==='INJECTED_SHARED_OWNER',{sessionOwnerIsShared:injected.sessionOwner===sharedOwner,binding:injected.truth().sessionOwnerBinding});
record('P3b.harness-composition-default-still-composes',(()=>{
  const surface=composeRunsSurface({shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
  return surface.domain.sessionOwner!=null&&surface.domain.sessionOwner!==sharedOwner&&typeof surface.domain.workspace()==='object';
})(),{note:'standalone composition injects an explicit isolated harness owner; never the Product shared owner'});

/* ---- P4: terminal/provider truth stays truthful ---- */
record('P4a.internal-simulation-truth-unchanged',(()=>{
  const d=product.truth(),i=injected.truth();
  return d.runtimeTruth==='INTERNAL_SIMULATION'&&i.runtimeTruth==='INTERNAL_SIMULATION'&&d.pty===false&&d.powershell===false&&d.ssh===false&&d.nativeWindow===false&&d.realTerminalProof==='UNVERIFIED_PLATFORM_GATE'&&i.realTerminalProof==='UNVERIFIED_PLATFORM_GATE';
})(),{productRuntimeTruth:truth.runtimeTruth,injectedRuntimeTruth:injected.truth().runtimeTruth});

const failed=checks.filter(c=>c.status==='FAIL');
const report={
  probe:'H03_RESIDUAL_F02_FAIL_CLOSED',
  unit:'W03-RUNS',lane:'RUN-1',
  question:'With shared-owner injection absent in the harness, the Product path must fail closed (no silent new OperationalSessionOwner()).',
  candidate:{commit,tree,writableRootDiff:writableDiff?writableDiff.split('\n'):[]},
  environment:{node:process.version},
  sourceBindings:{
    'stack/native-typescript/adapters/runs/domain.ts':sourceIdentity(domainSource),
    'stack/native-typescript/surfaces/runs/index.ts':sourceIdentity(indexSource),
    'stack/native-typescript/surfaces/m0-controller-composition.ts':sourceIdentity(m0Source),
    'stack/native-typescript/surfaces/composition/w03-rescue.ts':sourceIdentity(rescueSource)
  },
  summary:{total:checks.length,pass:checks.length-failed.length,fail:failed.length},
  checks,
  verdict:failed.length? 'F02_FAIL_CLOSED_PROBE_FAILED':'F02_FAIL_CLOSED_PROVEN__NO_SILENT_FALLBACK__PRODUCT_PATH_REFUSES'
};
const outDir=rel('writer-output/W03-RUNS/evidence');
await mkdir(outDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const outPath=path.join(outDir,`f02-fail-closed-probe-${stamp}.json`);
report.evidenceFile=path.relative(root,outPath);
await writeFile(outPath,JSON.stringify(report,null,2));
console.log(JSON.stringify({verdict:report.verdict,summary:report.summary,evidence:path.relative(root,outPath)},null,2));
if(failed.length)process.exitCode=1;
