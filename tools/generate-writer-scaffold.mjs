import {readFile,writeFile} from 'node:fs/promises';
import {resolve,isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=new URL('../',import.meta.url),args=process.argv.slice(2);
const valueAfter=flag=>{const i=args.indexOf(flag);return i>=0?args[i+1]:null};
const surface=valueAfter('--surface'),output=valueAfter('--output'),authorityArg=valueAfter('--authority-file');
if(!surface||surface.startsWith('--'))throw Error('USAGE: node tools/generate-writer-scaffold.mjs --surface <surface> --authority-file <json> [--output <path>]');
if(!authorityArg||authorityArg.startsWith('--'))throw Error('EXACT_CONTROLLER_AUTHORITY_FILE_REQUIRED');
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const authorityUrl=isAbsolute(authorityArg)?pathToFileURL(resolve(authorityArg)):new URL(authorityArg,root);
const [runtime,profile,commands,preferences,mechanics,deviations,deferred,versions,readiness,core,components,authority]=await Promise.all([
 read('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),read(`profiles/${surface}.json`),read('contracts/COMMAND_REGISTRY.seed.json'),read('contracts/PREFERENCE_REGISTRY.seed.json'),read('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),read('contracts/DEVIATION_REGISTER.json'),read('assurance/DEFERRED_WORK_LEDGER.json'),read('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),read('contracts/SURFACE_READINESS_REGISTRY.json'),read('contracts/CORE_OWNER_REGISTRY.json'),read('contracts/COMPONENT_REGISTRY.json'),JSON.parse(await readFile(authorityUrl,'utf8'))
]);
const readyRow=readiness.rows.find(x=>x.surface===surface);if(!readyRow)throw Error(`SURFACE_READINESS_ROW_MISSING:${surface}`);
const requiredAuthority=['controlEpochId','successorId','successorPath','successorBytes','successorSha256','canonicalSourceRoot','canonicalSourceSha256','contentTreeSha256'];
if(!requiredAuthority.every(k=>authority[k]))throw Error('INCOMPLETE_CONTROLLER_AUTHORITY');
const isFinalGateTestParent=authority.authorityPurpose==='FINAL_GATE_TEST_PARENT_ONLY_NOT_SURFACE_RELEASE_AUTHORITY';
if(isFinalGateTestParent){
 const exactTestParent=authority.controlEpochId==='CEP-FR-EXEC-20260913-E17-FINAL-GATE-CLOSED'&&authority.successorId==='CEP-FR-E17-FFG-5dcc401a'&&authority.successorSha256==='692a2acc7ca9c10253ee115c81d2c3c1fd720927e5d5189a9cb1b0b2043c4cd4'&&authority.canonicalSourceSha256==='5dcc401a95f6b7b38bbd2f64d9140c29182eb459042dc6e3dd7be5460c6bca5f';
 if(!exactTestParent)throw Error('INVALID_FINAL_GATE_TEST_PARENT_AUTHORITY');
}else if(authority.canonicalSourceSha256!==readiness.canonicalSourceSha256)throw Error('AUTHORITY_SOURCE_HASH_NOT_READINESS_BASELINE');
const familyMap={UnifiedEditor:'Structured',Structured:'Structured',SpatialInteraction:'SpatialRelation',SpatialRelation:'SpatialRelation',OperationalSurface:'OperationalTerminal',OperationalTerminal:'OperationalTerminal',AnalyticalCompare:'AnalyticalCompare'};
const families=[...new Set((profile.family_engines||[]).map(x=>familyMap[x]||x))],familyContracts=runtime.familyEngines.filter(x=>families.includes(x.id));
const domainCommands=[...new Set([...(profile.domain_commands||[]),...commands.filter(x=>String(x.id).startsWith('foundation.')).map(x=>x.id)])].sort();
const applicableMechanics=mechanics.records.filter(item=>item.applicableFamilies.some(f=>families.includes(f))||item.applicableFamilies.length>1);
const deferredApplies=item=>{if(item.activeFutureObligation!==true)return false;const a=item.applicability;if(!a)return false;return a.global===true||(a.targetSurfaces||[]).includes(surface)||a.targetSurfaceMode==='SELF'||(a.surfaceFamilies||[]).some(f=>families.includes(f))||(a.affectedConsumers||[]).includes(surface)};
const ownerBindings=Object.entries(profile.foundation||{}).map(([sc,rule])=>{const c=core.find(x=>x.foundation_id===sc)||{};return {mechanicId:sc,profileOwner:rule.owner,classification:rule.classification,disposition:c.final_gate_disposition||'UNRECONCILED',ownerIds:c.final_gate_current_owners||[],reason:rule.reason,prohibitedDuplicateSymbols:applicableMechanics.filter(m=>m.semanticCore===sc||m.mechanicId===sc).flatMap(m=>m.implementation||[])};});
for(const f of familyContracts){ownerBindings.push({mechanicId:`FAMILY:${f.id}`,profileOwner:f.id,classification:'MANDATORY_INHERIT',disposition:'READY_BY_ACCEPTED_FAMILY_ENGINE',ownerIds:[f.engine],contract:f.requiresAdapter,contractVersion:versions.contracts.find(c=>c.id===f.requiresAdapter)?.version||null,prohibitedDuplicateSymbols:[]})}
const componentOwners=components.filter(c=>c.status!=='OPEN_NOT_IMPLEMENTED').map(c=>c.component_id);
const packet={
 schemaVersion:'2.1.0',generator:'tools/generate-writer-scaffold.mjs',
 authority:{...authority,allowedBuildOutputs:['dist/','dist-ts/']},
 mission:{surface,workspace:profile.workspace,familySet:families,mode:'SURFACE_COMPOSITION',selfPromotion:false,githubWrite:false},
 readiness:{overall:readyRow.overall,dimensions:readyRow.dimensions,blockers:readyRow.blockers,unresolvedDomainDecisions:readyRow.unresolvedDomainDecisions},
 ownerBindings,
 domainTruth:{canonicalStateOwner:readyRow.domainAdapter.name,adapterPath:readyRow.domainAdapter.path,identitySchema:readyRow.domainTruth.identitySchema,persistenceBoundary:readyRow.domainTruth.persistenceBoundary,epistemicStates:readyRow.domainTruth.epistemicStates,forbiddenInference:readyRow.domainTruth.forbiddenInference},
 composition:{slots:profile.slots||{},familyHosts:familyContracts.map(f=>f.engine),domainAdapters:[readyRow.domainAdapter.path],surfaceOwned:['copy','approved placement','domain-specific composition','surface-only styling','thin domain adapter implementation'],foundationOwned:componentOwners},
 commands:domainCommands.map(id=>{const c=commands.find(x=>x.id===id);return {id,owner:c?.owner||c?.semanticOwner||'PROFILE_DOMAIN_ADAPTER',availabilityOwner:c?.availabilityOwner||'SEMANTIC_OWNER',routes:c?.entryRoutes||c?.routes||[],negativeReceiptRule:'unavailable creates no mutation receipt'}}),
 capabilities:(runtime.capabilities||[]).filter(x=>!x.family||families.includes(x.family)),
 preferences:preferences.map(p=>({key:p.key,owner:p.owner||'ScopedPreferencesOwner',applicability:p.applicability,scopes:p.scope,resetTarget:p.resetTarget||p.reset_target})),
 valuableDeferredRequirements:deferred.items.filter(deferredApplies),approvedDeviations:deviations.records.filter(x=>(x.affectedConsumers||[]).includes(surface)),
 writableScope:readyRow.overall==='READY'?readyRow.writableScope:{...readyRow.writableScope,allowed:[]},
 collisionLocks:['FOUNDATION_SHARED_PATHS_READ_ONLY','CURRENT_CONTROL_CONTROLLER_ONLY','SHARED_REGISTRIES_CONTROLLER_ONLY','OTHER_SURFACES_READ_ONLY'],
 proof:{requiredScenarios:readyRow.requiredR3Scenarios,centralReuseReceipts:['assurance/W6_CONTROLLER_FINAL_ACCEPTANCE.json','assurance/E18_ANALYTICAL_COMPARE_CONTROLLER_ACCEPTANCE.json','assurance/FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY.json'],domainAdapterTests:['before/action/owner/after/visible/negative'],visualBaselines:readyRow.requiredR3Scenarios.includes('G01')?['R3:G01@1440x1000','R3:G20@responsive-bands']:['R3 applicable inherited interaction baselines'],accessibility:['keyboard equivalence','focus return','live feedback','RTL/LTR','reduced motion'],negativeAssertions:readyRow.negativeAssertions},
 sourceScopeProhibitions:['CURRENT_FOUNDATION_SOURCES_ONLY','STACK_NOT_FROZEN','W03_EVIDENCE_DONOR_ONLY','OLD_PRODUCTION_IMPLEMENTATION_NOT_AUTHORITY','NO_SHARED_FOUNDATION_WRITE'],
 compositionOrder:['Foundation','Surface Profile','Family Engine','Thin Domain Adapter','Surface Composition'],
 handoff:{candidateOnly:true,changedPaths:[],sourceDigest:null,testReceipts:[],deviations:[],controllerDecisionRequired:true},
 status:readyRow.overall==='READY'?'SURFACE_INTAKE_READY_FOR_WRITER':'SURFACE_INTAKE_BLOCKED'
};
// Compatibility aliases for older Controller tooling; they are derived, not separate truth.
packet.foundationIdentity={baseline:runtime.baselineId,controllerDelta:runtime.controllerDelta,stackStatus:runtime.stackStatus};packet.foundationBaseline=runtime.baselineId;packet.targetSurface=surface;packet.surfaceProfile=`profiles/${surface}.json`;packet.profile=profile;packet.inheritedGlobalComponents=runtime.components.filter(x=>['WorkspaceFrame','ContextInspector','SemanticCommandRegistry','CapabilityRegistry','ActionSurfaceRegistry'].includes(x.id)).map(x=>x.id);packet.inheritedFamilyEngines=familyContracts;packet.registeredCommands=domainCommands;packet.requiredDomainAdapters=familyContracts.map(x=>({family:x.id,contract:x.requiresAdapter,contractVersion:versions.contracts.find(c=>c.id===x.requiresAdapter)?.version||null}));packet.applicablePreferences=preferences.map(x=>x.key).sort();packet.forbiddenDuplicateMechanics=applicableMechanics.map(x=>({mechanicId:x.mechanicId,owner:x.familyOwner,implementations:x.implementation}));packet.minimumConformanceProof=readyRow.requiredR3Scenarios;
const text=JSON.stringify(packet,null,2)+'\n';
if(output){if(output.startsWith('--'))throw Error('--output requires a path');await writeFile(isAbsolute(output)?pathToFileURL(resolve(output)):new URL(output,root),text)}else process.stdout.write(text);
