import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../foundation/models.js';
import {GLOBAL_SHELL_OWNER} from '../../../foundation/global/shell/navigation.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {composeW01W02Rescue} from '../../../surfaces/composition/w01-w02-rescue.js';

function sharedSpatial(registry){
  const owners={
    'spatial.connect':'RelationInteractionOwner','spatial.relation.commit':'RelationDomainAdapter',
    'relation.edit':'RelationInteractionOwner','relation.undo':'RelationDomainAdapter','relation.redo':'RelationDomainAdapter',
    'spatial.fit':'SpatialInteractionKernel','spatial.align':'SpatialInteractionKernel','spatial.distribute':'SpatialInteractionKernel',
    'spatial.undo':'SpatialInteractionKernel','spatial.redo':'SpatialInteractionKernel'
  };
  for(const [id,owner] of Object.entries(owners))registry.register(id,owner,id,()=>({ok:true,owner}));
  return owners;
}
function shellNavigation(){
  let dirty=false;
  const desc=(id,area)=>({id,area,labels:{ar:id,en:id},description:{ar:id,en:id}});
  const destinations=[desc('shell','W01'),desc('today','W01'),desc('library','W02'),desc('learn','W02'),desc('rq','W02'),desc('visualize','W02')];
  const areas=[{id:'W01',defaultSurfaceId:'today',labels:{ar:'W01',en:'W01'},description:{ar:'W01',en:'W01'}},{id:'W02',defaultSurfaceId:'library',labels:{ar:'W02',en:'W02'},description:{ar:'W02',en:'W02'}},{id:'W03',defaultSurfaceId:'enterprise',labels:{ar:'W03',en:'W03'},description:{ar:'W03',en:'W03'}},{id:'W04',defaultSurfaceId:'evidence',labels:{ar:'W04',en:'W04'},description:{ar:'W04',en:'W04'}},{id:'W05',defaultSurfaceId:'health',labels:{ar:'W05',en:'W05'},description:{ar:'W05',en:'W05'}}];
  const destinationRegistry={owner:'ShellDestinationRegistry',has:id=>destinations.some(x=>x.id===id),get:id=>destinations.find(x=>x.id===id)||null,list:()=>destinations,globalAreas:()=>areas};
  return {owner:GLOBAL_SHELL_OWNER,surface:'shell',destinationRegistry,destinations:()=>destinations,globalAreas:()=>areas,destination:id=>destinations.find(x=>x.id===id)||desc(id,'W02'),areaDestination:a=>areas.find(x=>x.id===a)?.defaultSurfaceId||'today',descriptor:()=>({registeredSurfaceCount:23}),navigate:t=>({ok:true,status:'NAVIGATING',destination:t}),restoreBookmark:async()=>true,focusDestinationHeading:()=>({ok:true,status:'DESTINATION_HEADING_FOCUSED'}),isDirty:()=>dirty,navigateWithPreservedRecovery:(t,r)=>r?.preserved?{ok:true,status:'NAVIGATING_WITH_VERIFIED_RECOVERY',destination:t}:{ok:false,status:'PRESERVE_RECOVERY_RECEIPT_REQUIRED'},api:{Commands:{execute:()=>({persisted:false})}},workspace:{openCommandPalette:()=>true}};
}
const librarySource={classification:'PRODUCT_RUNTIME_LOCAL_SOURCE',truth:'REAL_LIBRARY_PRODUCT_SOURCE',providerRef:'cg3-local-provider',document:{id:'LIB-CG3-001',revision:'r3',title:'CG3 Library',blocks:[{id:'p1',type:'paragraph',html:'CG3'}]},sources:[{id:'src-1',status:'BOUND'}],context:{},lifecycle:{state:'DRAFT',sourceRevision:'r3'}};
const learnSource={classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',providerRef:'cg3-learning-provider',activity:{id:'activity-cg3-01',revision:'r1',title:'CG3 learning activity',kind:'practice',editable:true,prerequisiteState:'INCOMPLETE'},document:{id:'learn-doc-cg3',revision:'r1',title:'CG3 Learn',blocks:[{id:'learn-p1',type:'paragraph',html:'CG3 learning object'}]}};
const rqRecords=[
  {sourceId:'S',revision:'r1',digest:'d1',locator:'rq://S/r1',schemaVersion:'rq-source/1',comparable:{title:{label:'Title',type:'text',value:'A'}}},
  {sourceId:'S',revision:'r2',digest:'d2',locator:'rq://S/r2',schemaVersion:'rq-source/1',comparable:{title:{label:'Title',type:'text',value:'B'}}}
];
const representations=[
  {representationId:'rep-a',canonicalRef:{objectId:'obj-a',revision:'r1'},label:'A',views:['TREE','PATH','GRAPH','CANVAS']},
  {representationId:'rep-b',canonicalRef:{objectId:'obj-b',revision:'r1'},label:'B',views:['TREE','PATH','GRAPH','CANVAS']}
];

const commands=new CommandRegistry(),expectedOwners=sharedSpatial(commands),analyticalCompareOwner=new AnalyticalCompareOwner(),composition=composeW01W02Rescue({commands,shellNavigation:shellNavigation(),librarySource,learnSource,rqRecords,visualizeRepresentations:representations,analyticalCompareOwner});
assert.deepEqual(composition.contract.surfaces,['shell','today','library','learn','rq','visualize']);
assert.equal(composition.shell.owner,GLOBAL_SHELL_OWNER);
assert.equal(composition.shell.context.canonicalDomainWrites,false);
assert.equal(composition.today.binding.canonicalWrites,false);
assert.equal(composition.today.binding.projection.state,'UNAVAILABLE');
assert.equal(composition.today.binding.projection.sources[0].reason,'TODAY_PROVIDER_UNBOUND');
assert.equal(composition.library.binding.consumerTruth,'REAL_LIBRARY_PRODUCT_SOURCE');
assert.equal(composition.library.binding.transactionOwner,'StructuredTransactionHistoryRecoveryOwner');
assert.equal(composition.learn.binding.masteryWrite,false);
assert.equal(composition.rq.binding.formalReviewAuthority,false);
assert.equal(composition.rq.binding.compareContext,'EXACT_SOURCE_REVISION_PAIR_PLUS_SCOPE');
assert.equal(composition.rq.adapter.compareAvailability({left:{sourceId:'S',revision:'r1',digest:'d1',locator:'rq://S/r1'},right:{sourceId:'S',revision:'r2',digest:'d2',locator:'rq://S/r2'},workingAnalysisId:'cg3',scope:['claims']}).enabled,true);
assert.equal(composition.visualize.binding.missingSharedCommands.length,0);
assert.equal(new Set(composition.visualize.binding.viewAdapters.map(x=>x.engineOwner)).size,1);
assert.equal(composition.visualize.binding.canonicalDataProvider,'UNAVAILABLE');
assert.equal(composition.visualize.binding.localGraphTruth,'SYNTHETIC_REPRESENTATION_ONLY');
assert.equal(composition.truth.representationStateIsCanonicalRelationTruth,false);
assert.equal(composition.truth.finalPhysicalLibraryRouteCutover,'R6_OWNED_NOT_PERFORMED');
for(const [id,owner] of Object.entries(expectedOwners))assert.equal(commands.commands.get(id).owner,owner,`shared spatial owner drift: ${id}`);
assert.equal(commands.commands.get('rq.compare').owner,'RQDomainAdapter');
assert.equal(commands.commands.get('library.insert').owner,'LibraryDomainAdapter');
assert.equal(commands.commands.get('learn.edit').owner,'LearnDomainAdapter');
assert.equal(commands.commands.get('today.refresh').owner,'TodayProjectionDomainAdapter');
assert.equal(commands.commands.get('shell.navigate').owner,GLOBAL_SHELL_OWNER);
console.log(JSON.stringify({status:'PASS',surfaceCount:6,sharedSpatialOwnerCount:new Set(Object.values(expectedOwners)).size,truth:composition.truth},null,2));
