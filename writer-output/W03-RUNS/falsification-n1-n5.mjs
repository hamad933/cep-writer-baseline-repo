/**
 * RUN-1 mandatory falsification battery (N1–N5) + terminal/provider truth.
 *
 * N1  non-owned-route mutation attempt → must refuse (live write-scope census + recorded refusal)
 * N2  boundary/invalid input → no corruption, no false receipt
 * N3  act without prerequisite data/provider → unavailable, never fabricated
 * N4  tools/check-duplicate-mechanics.mjs → no duplicate owner introduced
 * N5  suite run twice → identical results, no leakage
 *     + terminal/provider truth truthful (INTERNAL_SIMULATION, no real-process claim)
 *
 * Usage: node writer-output/W03-RUNS/falsification-n1-n5.mjs
 * Evidence: writer-output/W03-RUNS/evidence/falsification-n1-n5-<ts>.json
 */
import {readFileSync} from 'node:fs';
import {writeFile, mkdir} from 'node:fs/promises';
import {execSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const rel=p=>path.join(root,p);
const git=args=>execSync(`git ${args}`,{cwd:root}).toString();
const commit=git('rev-parse HEAD').trim();
const tree=git('rev-parse HEAD^{tree}').trim();

const OWNED=[
  'stack/native-typescript/surfaces/runs/',
  'stack/native-typescript/adapters/runs/',
  'stack/native-typescript/adapters/w03-runs.ts',
  'stack/native-typescript/adapters/w03-v34/runs-fixture.ts',
  'writer-output/W03-RUNS/'
];
const RESTORABLE=['dist/','assurance/','stack/MEASURED_COMPARISON.json','writer-output/W03/'];
const classify=p=>{
  if(OWNED.some(prefix=>p===prefix.replace(/\/$/,'')||p.startsWith(prefix)))return 'OWNED_ROOT';
  if(RESTORABLE.some(prefix=>p===prefix.replace(/\/$/,'')||p.startsWith(prefix)))return 'TRANSIENT_RESTORE_PENDING';
  return 'OUT_OF_SCOPE';
};

const checks=[];
const record=(id,pass,detail)=>{checks.push({id,status:pass?'PASS':'FAIL',detail});return pass};
const coded=fn=>{try{const value=fn();return{threw:false,value}}catch(error){return{threw:true,code:error.code||null,message:String(error.message||error)}}};

/* ---------------- N1 — write scope: everything outside owned roots is refused ---------------- */
const porcelain=git('status --porcelain').split('\n').filter(Boolean);
const census=porcelain.map(line=>({entry:line,path:line.slice(3).replace(/^"|"$/g,''),scope:classify(line.slice(3).replace(/^"|"$/g,''))}));
const outOfScope=census.filter(c=>c.scope==='OUT_OF_SCOPE');
record('N1.no-out-of-scope-mutation',outOfScope.length===0,{
  policy:'Writable = surfaces/runs/ · adapters/runs/ · adapters/w03-runs.ts · adapters/w03-v34/runs-fixture.ts · writer-output/W03-RUNS/; dist//assurance//writer-output/W03 are tool-generated transients restored to HEAD before commit.',
  refusedInstance:'F02 originates partly in surfaces/m0-controller-composition.ts (Product ternary passes `{}` when shared-owner injection is absent). That file is owned by another lane (never edit m0-controller-composition.ts / main.ts), so the fallback was neutralized inside adapters/runs/domain.ts instead — the out-of-root edit was refused, not taken.',
  census,
  outOfScopeCount:outOfScope.length
});

/* ---------------- N2 — boundary / invalid input ---------------- */
const {W03RunDomain}=await import(pathToFileURL(rel('dist/adapters/runs/domain.js')).href);
const {W03V34RunsAdapter}=await import(pathToFileURL(rel('dist/adapters/w03-runs.js')).href);
const {composeRunsSurface}=await import(pathToFileURL(rel('dist/surfaces/runs/index.js')).href);
const {OperationalSessionOwner}=await import(pathToFileURL(rel('dist/foundation/operational/session-owner.js')).href);

const invalidOwner=coded(()=>new W03RunDomain({sessionOwner:{}}));
record('N2a.invalid-injected-owner-rejected',invalidOwner.threw&&invalidOwner.code==='RUNS_SESSION_OWNER_INVALID',{code:invalidOwner.code,message:invalidOwner.message});

const noSpatial=coded(()=>composeRunsSurface({shared:{}}));
record('N2b.missing-required-shared-binding-refused',noSpatial.threw&&String(noSpatial.message||'').includes('RUNS_SHARED_SPATIAL_REQUIRED'),{message:noSpatial.message});

const injected=new W03RunDomain({runtime:new W03V34RunsAdapter(),sessionOwner:new OperationalSessionOwner()});
const unknownDevice=coded(()=>injected.openTerminal({deviceId:'NO-SUCH-DEVICE'}));
record('N2c.unknown-device-boundary-refused',unknownDevice.threw&&String(unknownDevice.message||'').includes('CAPABILITY_UNAVAILABLE')&&injected.presentationByDevice.size===0,{message:unknownDevice.message,presentationByDeviceSize:injected.presentationByDevice.size});
const noPresentation=coded(()=>injected.input({deviceId:'DEV-WEB-01',command:'show status',invocationId:'n2-1'}));
record('N2d.terminal-input-without-open-presentation-refused',noPresentation.threw&&noPresentation.message==='RUN_TERMINAL_NOT_OPEN',{message:noPresentation.message});
const badStart=coded(()=>new W03V34RunsAdapter({initialLifecycle:'PREPARING'}).requestLifecycle('start',{invocationId:'n2-start',expectedVersion:999}));
record('N2e.version-boundary-on-start-refused',badStart.threw&&badStart.code==='409',{code:badStart.code});

/* ---------------- N3 — no prerequisite data/provider → unavailable, never fabricated ---------------- */
const prep=new W03RunDomain({runtime:new W03V34RunsAdapter({initialLifecycle:'PREPARING'}),sessionOwner:new OperationalSessionOwner()});
const surface=composeRunsSurface({domain:prep,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
const terminalBefore=surface.bus.availability('OPEN_TERMINAL',{deviceId:'DEV-WEB-01'});
const startBefore=surface.bus.availability('runs.start',{deviceId:'DEV-WEB-01'});
record('N3a.terminal-unavailable-before-run-is-running',terminalBefore.enabled===false&&terminalBefore.code==='RUN_NOT_RUNNING',{code:terminalBefore.code});
record('N3b.start-unavailable-before-ready',startBefore.enabled===false&&startBefore.code==='RUN_NOT_READY',{code:startBefore.code});
const liveRuntime=new W03V34RunsAdapter({initialLifecycle:'PREPARING'});
liveRuntime.prepare({invocationId:'n3-prepare'});
const live=new W03RunDomain({runtime:liveRuntime,sessionOwner:new OperationalSessionOwner()});
const liveSurface=composeRunsSurface({domain:live,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
live.start({invocationId:'n3-start'});
const lifecycleWhenRunning=live.runtime.run.lifecycle;
live.disconnect();
const inputDisconnected=liveSurface.bus.availability('runtime.input',{deviceId:'DEV-WEB-01'});
record('N3c.provider-loss-unavailable-and-not-run-completion',inputDisconnected.enabled===false&&inputDisconnected.code==='PROVIDER_DISCONNECTED'&&lifecycleWhenRunning==='RUNNING'&&live.runtime.run.lifecycle==='RUNNING'&&liveRuntime.connected===false,{code:inputDisconnected.code,lifecycleAfterProviderLoss:live.runtime.run.lifecycle,providerConnected:liveRuntime.connected});

/* ---------------- N4 — no duplicate owner introduced ---------------- */
const dup=spawnSync(process.execPath,[rel('tools/check-duplicate-mechanics.mjs')],{cwd:root,encoding:'utf8'});
record('N4.no-duplicate-mechanics-owner',dup.status===0,{exitCode:dup.status,stdout:(dup.stdout||'').trim().slice(-600),stderr:(dup.stderr||'').trim().slice(-300)});

/* ---------------- N5 — suite twice → identical ---------------- */
const runSuite=()=>{
  const result=spawnSync(process.execPath,[rel('tools/test-models.mjs')],{cwd:root,encoding:'utf8'});
  const report=JSON.parse(readFileSync(rel('assurance/MODEL_TEST_RESULTS.json'),'utf8'));
  return {exitCode:result.status,pass:report.pass,fail:report.fail,tests:report.tests.map(t=>`${t.id}:${t.status}`)};
};
const first=runSuite(),second=runSuite();
const identical=first.exitCode===second.exitCode&&first.pass===second.pass&&first.fail===second.fail&&JSON.stringify(first.tests)===JSON.stringify(second.tests);
record('N5.suite-run-twice-identical',identical&&first.fail===0&&first.pass===210,{
  first:{exitCode:first.exitCode,pass:first.pass,fail:first.fail,digest:createHash('sha256').update(first.tests.join('\n')).digest('hex')},
  second:{exitCode:second.exitCode,pass:second.pass,fail:second.fail,digest:createHash('sha256').update(second.tests.join('\n')).digest('hex')}
});

/* ---------------- terminal / provider truth ---------------- */
const truth=prep.truth();
record('T1.terminal-provider-truth-truthful',truth.runtimeTruth==='INTERNAL_SIMULATION'&&truth.pty===false&&truth.powershell===false&&truth.ssh===false&&truth.nativeWindow===false&&truth.realTerminalProof==='UNVERIFIED_PLATFORM_GATE'&&truth.sessionOwnerBinding==='INJECTED_SHARED_OWNER',{runtimeTruth:truth.runtimeTruth,pty:truth.pty,powershell:truth.powershell,ssh:truth.ssh,nativeWindow:truth.nativeWindow,realTerminalProof:truth.realTerminalProof});

const failed=checks.filter(c=>c.status==='FAIL');
const report={
  battery:'RUN1_N1_N5_FALSIFICATION',unit:'W03-RUNS',lane:'RUN-1',
  candidate:{commit,tree},
  environment:{node:process.version},
  summary:{total:checks.length,pass:checks.length-failed.length,fail:failed.length},
  checks,
  verdict:failed.length?'FALSIFICATION_FAILED':'N1_N5_PLUS_LANE_AND_TRUTH__ALL_PASS'
};
const outDir=rel('writer-output/W03-RUNS/evidence');
await mkdir(outDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const outPath=path.join(outDir,`falsification-n1-n5-${stamp}.json`);
report.evidenceFile=path.relative(root,outPath);
await writeFile(outPath,JSON.stringify(report,null,2));
console.log(JSON.stringify({verdict:report.verdict,summary:report.summary,failed:failed.map(c=>c.id),evidence:path.relative(root,outPath)},null,2));
if(failed.length)process.exitCode=1;
