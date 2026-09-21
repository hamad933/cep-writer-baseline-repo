import {mkdtemp,cp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url),rootPath=fileURLToPath(root);
const proofPath=new URL('assurance/W2A_BROWSER_PROOF.json',root);
const browserProof=JSON.parse(await readFile(proofPath,'utf8'));
const browserProofSha256=createHash('sha256').update(await readFile(proofPath)).digest('hex');
const before=await canonicalSourceIdentity(root);
const temp=await mkdtemp(path.join(tmpdir(),'cep-w2a-central-probe-'));
const tempRoot=path.join(temp,'candidate');
const sourceDir=path.join(rootPath,'stack','native-typescript');
await mkdir(path.join(tempRoot,'stack'),{recursive:true});
await cp(sourceDir,path.join(tempRoot,'stack','native-typescript'),{recursive:true});
await mkdir(path.join(tempRoot,'tools'),{recursive:true});
await cp(path.join(rootPath,'tools','build-runtime.mjs'),path.join(tempRoot,'tools','build-runtime.mjs'));

const replaceOne=async(relative,from,to)=>{
  const file=path.join(tempRoot,'stack','native-typescript',relative),source=await readFile(file,'utf8');
  if(!source.includes(from))throw Error(`PROBE_TARGET_NOT_FOUND:${relative}:${from}`);
  await writeFile(file,source.replace(from,to));
};

let modified,probe;
try{
  await replaceOne('foundation/global/commands.ts',"receiptPolicyTag:'semantic-command-v1'","receiptPolicyTag:'semantic-command-central-probe'");
  await replaceOne('foundation/global/transient-focus.ts',"dismissalPolicyTag:'topmost-first-v1'","dismissalPolicyTag:'topmost-first-central-probe'");
  await replaceOne('foundation/global/preferences/schema.ts',"theme:{safeDefault:'dark-blue'","theme:{safeDefault:'light'");
  modified=await canonicalSourceIdentity(pathToFileURL(tempRoot+'/'));
  if(modified.sha256===before.sha256)throw Error('TEMP_POLICY_MUTATION_DID_NOT_CHANGE_SOURCE_IDENTITY');
  const build=spawnSync(process.execPath,[path.join(tempRoot,'tools','build-runtime.mjs')],{cwd:tempRoot,encoding:'utf8'});
  if(build.status!==0)throw Error('TEMP_BUILD_FAILED:'+build.stderr);

  const {SemanticCommandBus}=await import(pathToFileURL(path.join(tempRoot,'dist','foundation','global','commands.js')).href+'?probe='+Date.now());
  const {TransientFocusOwner}=await import(pathToFileURL(path.join(tempRoot,'dist','foundation','global','transient-focus.js')).href+'?probe='+Date.now());
  const {TransientFocusController}=await import(pathToFileURL(path.join(tempRoot,'dist','foundation','workspace-host.js')).href+'?probe='+Date.now());
  const {ScopedPreferencesOwner}=await import(pathToFileURL(path.join(tempRoot,'dist','foundation','global','preferences','store.js')).href+'?probe='+Date.now());

  const bus=new SemanticCommandBus();
  bus.register('OPEN_TERMINAL','InternalSimulationAdapter','Open terminal',()=>({ok:true}),()=>({enabled:true,availabilityOwner:'InternalSimulationAdapter'}));
  const routes=['toolbar','context','object-doubleclick','menu','palette'];
  for(const route of routes)bus.execute('OPEN_TERMINAL',{route});
  const commandReceipts=bus.receipts.filter(x=>x.id==='OPEN_TERMINAL');
  if(commandReceipts.length!==5||commandReceipts.some(x=>x.policyTag!=='semantic-command-central-probe'))throw Error('COMMAND_CENTRAL_PROPAGATION_FAILED');

  const focus={isConnected:true,disabled:false,focused:false,focus(){this.focused=true},getAttribute(){return null}};
  const transient=new TransientFocusOwner();transient.open('menu',{invoker:focus});transient.close('menu',{reason:'escape'});
  const facadeFocus={isConnected:true,disabled:false,focused:false,focus(){this.focused=true},getAttribute(){return null}};
  const facade=new TransientFocusController();facade.open('dialog',{invoker:facadeFocus,modal:true});facade.close('dialog',{reason:'escape'});
  if(transient.lastDismissal?.policyTag!=='topmost-first-central-probe'||facade.lastDismissal?.policyTag!=='topmost-first-central-probe')throw Error('TRANSIENT_CENTRAL_PROPAGATION_FAILED');

  const contexts={
    structured:{workspace:'W02',surface:'learn',view:'main',component:'workspace',family:'structured'},
    spatial:{workspace:'W02',surface:'visualize',view:'main',component:'workspace',family:'spatial'},
    operational:{workspace:'W03',surface:'runs',view:'main',component:'workspace',family:'operational'}
  };
  const preferenceResults=Object.fromEntries(Object.entries(contexts).map(([name,context])=>{const owner=new ScopedPreferencesOwner(null,context);return [name,{theme:owner.resolve('theme'),grid:owner.resolve('grid'),documentWidth:owner.resolve('documentWidth')}]}));
  if(Object.values(preferenceResults).some(result=>result.theme.preferredValue!=='light'))throw Error('PREFERENCE_CENTRAL_DEFAULT_PROPAGATION_FAILED');
  if(preferenceResults.structured.grid.applicable||preferenceResults.spatial.documentWidth.applicable||preferenceResults.operational.grid.applicable)throw Error('PREFERENCE_APPLICABILITY_CHANGED_UNEXPECTEDLY');

  probe={
    command:{routes,receipts:commandReceipts},
    transient:{direct:transient.snapshot(),compatibilityFacade:facade.snapshot(),directFocusReturned:focus.focused,facadeFocusReturned:facadeFocus.focused},
    preferences:preferenceResults
  };
}finally{
  await rm(temp,{recursive:true,force:true});
}
const after=await canonicalSourceIdentity(root);
if(after.sha256!==before.sha256)throw Error(`ORIGINAL_SOURCE_NOT_REVERTED:${before.sha256}:${after.sha256}`);
if(browserProof.sourceCanonicalTreeSha256!==before.sha256||browserProof.summary.fail!==0)throw Error('REAL_CONSUMER_BROWSER_PROOF_NOT_BOUND_TO_CURRENT_SOURCE');
const receipt={
  schemaVersion:1,
  classification:'WAVE2_LANE_A_TEMPORARY_CENTRAL_MODIFICATION_PROOF_NOT_CONTROLLER_ACCEPTANCE',
  candidateSourceBefore:{sha256:before.sha256,files:before.files},
  temporaryModifiedSource:{sha256:modified.sha256,files:modified.files},
  candidateSourceAfter:{sha256:after.sha256,files:after.files},
  sourceRestoredExactly:before.sha256===after.sha256,
  realConsumerBrowserProof:{sha256:browserProofSha256,sourceCanonicalTreeSha256:browserProof.sourceCanonicalTreeSha256,summary:browserProof.summary,commandRoutes:browserProof.flows.find(x=>x.id==='w2a.browser.command-real-route-convergence')?.evidence?.routes,transientConsumers:(browserProof.flows.find(x=>x.id==='w2a.browser.transient-real-consumers')?.evidence||[]).map(x=>x.surface),preferenceLiveConsumer:browserProof.flows.find(x=>x.id==='w2a.browser.preferences-real-families')?.evidence?.live?.consumer},
  temporaryPolicies:{commandReceiptPolicy:'semantic-command-central-probe',transientDismissalPolicy:'topmost-first-central-probe',preferenceThemeDefault:'light'},
  propagation:probe,
  verdict:'PASS'
};
await writeFile(new URL('assurance/W2A_CENTRAL_MODIFICATION_PROOF.json',root),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({verdict:receipt.verdict,candidateSourceBefore:receipt.candidateSourceBefore,tempSha256:receipt.temporaryModifiedSource.sha256,candidateSourceAfter:receipt.candidateSourceAfter,sourceRestoredExactly:receipt.sourceRestoredExactly},null,2));
