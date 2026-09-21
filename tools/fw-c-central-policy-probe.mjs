import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildRuntime} from './build-runtime.mjs';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url),rootPath=fileURLToPath(root),hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assert=(v,m)=>{if(!v)throw Error(m)};
const visualNodes=()=>Array.from({length:36},(_,i)=>({id:`concept-${i+1}`,label:['Identity','Trust','Network','Evidence','Protocol','Control'][i%6]+' '+(i+1),x:(i%6)*175,y:Math.floor(i/6)*112}));
const maxXId=nodes=>nodes.reduce((best,node)=>node.x>best.x?node:best,nodes[0]).id;
async function scenario(distRoot,label){
 const models=await import(pathToFileURL(path.join(distRoot,'foundation/models.js')).href+'?p='+Date.now()+Math.random()),relations=await import(pathToFileURL(path.join(distRoot,'foundation/relations.js')).href+'?p='+Date.now()+Math.random()),enterpriseModule=await import(pathToFileURL(path.join(distRoot,'adapters/w03-enterprise.js')).href+'?p='+Date.now()+Math.random()),runsModule=await import(pathToFileURL(path.join(distRoot,'adapters/w03-runs.js')).href+'?p='+Date.now()+Math.random());
 const out={};
 const vn=visualNodes(),vr=new relations.RelationDomainAdapter({owner:'VisualizeDomain.LocalGraph',nodes:vn,relations:Array.from({length:30},(_,i)=>({id:`edge-${i+1}`,source:`concept-${i+1}`,target:`concept-${i+7}`,type:'relates',direction:'directed'}))}),vh0=hash(vr.records),vm=new models.SpatialModel(vn,vr.project()),vcurrent=maxXId(vm.nodes);vm.selectionKernel.focus(vcurrent,{source:'probe-origin'});out.visualize={current:vcurrent,receipt:vm.selectionKernel.focusNeighbor('ArrowRight',{source:'probe-neighbor'}),domainBefore:vh0,domainAfter:hash(vr.records)};
 const ea=enterpriseModule.createEnterpriseAdapter(),eh0=hash(ea.records),em=new models.SpatialModel(ea.nodes,ea.project()),ecurrent=maxXId(em.nodes);em.selectionKernel.focus(ecurrent,{source:'probe-origin'});out.enterprise={current:ecurrent,receipt:em.selectionKernel.focusNeighbor('ArrowRight',{source:'probe-neighbor'}),domainBefore:eh0,domainAfter:hash(ea.records)};
 const ra=new runsModule.W03V34RunsAdapter(),runtime=()=>hash({devices:ra.devices,sessions:ra.sessions,events:ra.events,run:ra.run}),rh0=runtime(),rn=ra.devices.map((d,i)=>({id:d.id,label:d.name,x:80+i*210,y:120+(i%2)*130})),rmx=new models.SpatialModel(rn),rcurrent=maxXId(rmx.nodes);rmx.setActiveMode('live');rmx.selectionKernel.focus(rcurrent,{source:'probe-origin'});out.runs={current:rcurrent,receipt:rmx.selectionKernel.focusNeighbor('ArrowRight',{source:'probe-neighbor'}),runtimeBefore:rh0,runtimeAfter:runtime()};
 out.label=label;return out;
}
const sourceBefore=await canonicalSourceIdentity(root),baseline=await scenario(path.join(rootPath,'dist'),'baseline');
const temp=await mkdtemp(path.join(tmpdir(),'cep-fw-c-policy-'));
try{
 const tempSource=path.join(temp,'stack/native-typescript');await cp(path.join(rootPath,'stack/native-typescript'),tempSource,{recursive:true});
 const kernel=path.join(tempSource,'foundation/spatial/selection-kernel.ts'),original=await readFile(kernel,'utf8');
 const mutated=original.replace("revision:'FW-C-NEIGHBOR-01'","revision:'FW-C-NEIGHBOR-PROBE'").replace("noNeighbor:'stay'","noNeighbor:'wrap-canonical'");
 assert(mutated!==original&&mutated.includes("noNeighbor:'wrap-canonical'"),'CENTRAL_POLICY_PROBE_PATCH_NOT_APPLIED');await writeFile(kernel,mutated);
 const tempDist=path.join(temp,'dist');const build=buildRuntime({sourceRoot:tempSource,destinationRoot:tempDist}),changed=await scenario(tempDist,'mutated-temp-copy');
 const sourceAfter=await canonicalSourceIdentity(root);
 for(const name of ['visualize','enterprise','runs']){const b=baseline[name],m=changed[name];assert(b.receipt.targetId===b.current,`BASELINE_NOT_STAY:${name}`);assert(m.receipt.targetId!==m.current,`MUTATION_DID_NOT_PROPAGATE:${name}`);assert(m.receipt.policyRevision==='FW-C-NEIGHBOR-PROBE',`MUTATED_POLICY_REVISION_MISSING:${name}`);if(name==='runs')assert(b.runtimeBefore===b.runtimeAfter&&m.runtimeBefore===m.runtimeAfter,`RUNTIME_MUTATED:${name}`);else assert(b.domainBefore===b.domainAfter&&m.domainBefore===m.domainAfter,`DOMAIN_MUTATED:${name}`)}
 assert(sourceBefore.sha256===sourceAfter.sha256,'CANDIDATE_SOURCE_NOT_REVERTED');
 const proof={status:'PASS',mission:'FW-C-SPATIAL-SELECTION-NAVIGATION',probe:{temporaryCopyOnly:true,change:"SPATIAL_NEIGHBOR_POLICY noNeighbor stay -> wrap-canonical; revision FW-C-NEIGHBOR-01 -> FW-C-NEIGHBOR-PROBE",build},candidateSource:{before:sourceBefore.sha256,after:sourceAfter.sha256,unchanged:sourceBefore.sha256===sourceAfter.sha256},baseline,mutated:changed,assertions:{visualizeChangedTogether:true,enterpriseChangedTogether:true,runsChangedTogether:true,relationAndRuntimeHashesUnchanged:true,noProbeResidueInCandidate:true}};
 await writeFile(new URL('assurance/FW_C_CENTRAL_POLICY_MUTATION_REVERT_PROOF.json',root),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
}finally{await rm(temp,{recursive:true,force:true});}
