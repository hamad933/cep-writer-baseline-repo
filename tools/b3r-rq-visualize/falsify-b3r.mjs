import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {RQDomainAdapter} from '../../dist/adapters/rq/domain.js';
import {VisualizeDomainAdapter} from '../../dist/adapters/visualize/domain.js';
import {createBalanced6VisualizeProvider,BALANCED6_VISUALIZE_REPRESENTATIONS} from '../../dist/adapters/balanced6-acceptance-data.js';
import {AnalyticalCompareOwner} from '../../dist/foundation/analytical/compare.js';
import {CommandRegistry} from '../../dist/foundation/models.js';
import {bindRqSurface} from '../../dist/surfaces/rq/surface.js';

const result={schemaVersion:1,mission:'CORR02_B3R_RQ_VISUALIZE_TRUTH_CONVERGENCE',checks:[]};
const check=(id,fn)=>{try{const detail=fn();result.checks.push({id,pass:true,detail:detail??null});}catch(error){result.checks.push({id,pass:false,error:String(error?.stack||error)});}};
const rqRecord=(id,revision,digest)=>({sourceId:id,revision,digest,locator:`sources/${id}/${revision}.md`,schemaVersion:'rq-test/1',status:'CURRENT',comparable:{claim:{label:'Claim',type:'string',value:`${id}-${revision}`,provenanceRefs:[digest]}},provenanceRefs:[digest]});

check('F027.normal-rq-provider-unavailable',()=>{
  const a=new RQDomainAdapter([],{analyticalCompareOwner:new AnalyticalCompareOwner(),providerId:'rq.current-unavailable',providerAdmitted:false,providerClassification:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'}),d=a.descriptor(),s=a.search('anything');
  assert.equal(d.providerAdmitted,false);assert.equal(d.providerTruth,'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER');assert.equal(d.providerClassification,'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER');
  assert.equal(a.records.length,0);assert.equal(s.items.length,0);assert.equal(s.status,'RQ_CURRENT_PROVIDER_UNAVAILABLE');
  return {providerId:d.providerId,providerTruth:d.providerTruth,records:a.records.length};
});

check('F027.search-command-disabled-without-admitted-provider',()=>{
  const a=new RQDomainAdapter([],{analyticalCompareOwner:new AnalyticalCompareOwner(),providerAdmitted:false,providerClassification:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'}),r=new CommandRegistry();bindRqSurface({commands:r,adapter:a});
  const availability=r.availability('rq.search',{});assert.equal(availability.enabled,false);assert.equal(availability.code,'RQ_CURRENT_PROVIDER_UNAVAILABLE');
  return {enabled:availability.enabled,code:availability.code};
});

check('F027.compare-disabled-without-admitted-provider',()=>{
  const a=new RQDomainAdapter([],{analyticalCompareOwner:new AnalyticalCompareOwner(),providerAdmitted:false,providerClassification:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'}),availability=a.compareAvailability({workingAnalysisId:'working-1',scope:['claims'],left:{sourceId:'a',revision:'r1',digest:'a'.repeat(64),locator:'a.md'},right:{sourceId:'b',revision:'r1',digest:'b'.repeat(64),locator:'b.md'}});
  assert.equal(availability.enabled,false);assert.equal(availability.code,'RQ_CURRENT_PROVIDER_UNAVAILABLE');
  return availability.code;
});

check('F027.admitted-provider-still-requires-exact-revisions',()=>{
  const left=rqRecord('source-a','r1','a'.repeat(64)),right=rqRecord('source-b','r2','b'.repeat(64)),a=new RQDomainAdapter([left,right],{analyticalCompareOwner:new AnalyticalCompareOwner(),providerId:'rq.test.admitted'});
  const missing=a.compareAvailability({workingAnalysisId:'w',scope:['claims'],left:{sourceId:left.sourceId},right});assert.equal(missing.enabled,false);assert.equal(missing.code,'RQ_COMPARE_EXACT_SOURCE_REVISION_PAIR_REQUIRED');
  const exact=a.compare({workingAnalysisId:'w',scope:['claims'],left,right});assert.equal(exact.ok,true);assert.equal(exact.formalReview,false);assert.equal(exact.persisted,false);
  assert.equal(a.saveAnalysisSession('w').status,'RQ_ANALYSIS_SESSION_PERSISTENCE_UNAVAILABLE');
  return {compare:exact.status,formalReview:exact.formalReview,durableSave:false};
});

const normalVisualize=()=>new VisualizeDomainAdapter({provider:createBalanced6VisualizeProvider(),representations:BALANCED6_VISUALIZE_REPRESENTATIONS});

check('F034.local-acceptance-is-not-canonical',()=>{
  const a=normalVisualize(),truth=a.providerTruth(),projection=a.canonicalProjection();
  assert.equal(truth.providerId,'balanced6.local-acceptance.visualize');assert.equal(truth.authority,'LOCAL_ACCEPTANCE_PROJECTION_ONLY');assert.equal(truth.canonical,false);assert.equal(projection.canonical,false);assert.equal(truth.representationTruth,'LOCAL_ACCEPTANCE_REPRESENTATION_ONLY');
  return truth;
});

check('F035.local-acceptance-provider-remains-read-only',()=>{
  const a=normalVisualize(),link=a.linkAvailability({sourceObjectId:'KU-D03-0001',targetObjectId:'KU-D03-0004',type:'related'}),edit=a.editAvailability({objectId:'KU-D03-0001'}),truth=a.providerTruth();
  assert.equal(truth.editability,'READ_ONLY');assert.equal(truth.relationMutation,'READ_ONLY');assert.equal(truth.objectEdit,'READ_ONLY');
  assert.equal(link.enabled,false);assert.equal(link.code,'VISUALIZE_LOCAL_ACCEPTANCE_PROVIDER_READ_ONLY');assert.equal(edit.enabled,false);assert.equal(edit.code,'VISUALIZE_LOCAL_ACCEPTANCE_PROVIDER_READ_ONLY');
  return {editability:truth.editability,link:link.code,edit:edit.code};
});

check('F035.noncanonical-writable-provider-is-still-read-only',()=>{
  const state={commits:0,edits:0},provider={descriptor:()=>({providerId:'b3r.noncanonical-writable',authority:'BOUNDED_FIXTURE'}),read:()=>({ok:true,status:'LOCAL',canonical:false,objects:[{objectId:'a'},{objectId:'b'}],relations:[]}),validateRelation:()=>({ok:true,token:'unexpected'}),commitRelation:()=>{state.commits++;return {ok:true,status:'UNEXPECTED_COMMIT'};},editObject:()=>{state.edits++;return {ok:true,status:'UNEXPECTED_EDIT'};}},a=new VisualizeDomainAdapter({provider,representations:[{representationId:'ra',canonicalRef:{objectId:'a'}},{representationId:'rb',canonicalRef:{objectId:'b'}}]});
  const truth=a.providerTruth(),link=a.linkAvailability({sourceObjectId:'a',targetObjectId:'b',type:'related'}),edit=a.editAvailability({objectId:'a'}),linkResult=a.link({sourceObjectId:'a',targetObjectId:'b',type:'related'}),editResult=a.edit({objectId:'a',patch:{label:'x'}});
  assert.equal(truth.canonical,false);assert.equal(truth.editability,'READ_ONLY');assert.equal(link.enabled,false);assert.equal(link.code,'VISUALIZE_CANONICAL_PROVIDER_REQUIRED');assert.equal(edit.enabled,false);assert.equal(edit.code,'VISUALIZE_CANONICAL_PROVIDER_REQUIRED');assert.equal(linkResult.canonicalMutation,false);assert.equal(editResult.canonicalMutation,false);assert.equal(state.commits,0);assert.equal(state.edits,0);
  return {truth,link:link.code,edit:edit.code,commits:state.commits,edits:state.edits};
});

check('F034.representation-move-does-not-mutate-provider-truth',()=>{
  const a=normalVisualize(),id=BALANCED6_VISUALIZE_REPRESENTATIONS[0].representationId,before=a.canonicalDigest(),edges=JSON.stringify(a.model.edges),moved=a.move([id],25,-10,{mode:'CANVAS'}),after=a.canonicalDigest();
  assert.equal(moved.ok,true);assert.equal(moved.canonicalMutation,false);assert.equal(moved.canonicalTruthUnchanged,true);assert.equal(moved.relationsUnchanged,true);assert.equal(before,after);assert.equal(JSON.stringify(a.model.edges),edges);
  return {status:moved.status,canonicalMutation:moved.canonicalMutation,relationsUnchanged:moved.relationsUnchanged};
});

check('F034.one-spatial-engine-four-view-adapters',()=>{
  const a=normalVisualize(),views=a.viewDescriptors(),owners=new Set(views.map(v=>v.engineOwner));
  assert.deepEqual(views.map(v=>v.mode),['TREE','PATH','GRAPH','CANVAS']);assert.equal(owners.size,1);assert.equal([...owners][0],a.model.interactionKernel.ownerId);assert.ok(views.every(v=>v.representationOnly===true));
  return {engineOwner:[...owners][0],views:views.map(v=>v.mode)};
});

check('F035.authorized-test-provider-is-isolated',()=>{
  const state={objects:[{objectId:'obj-a'},{objectId:'obj-b'}],relations:[],edits:[]};
  const provider={descriptor:()=>({providerId:'b3r.test-only.editable',authority:'TEST_ONLY_EDITABLE_PROVIDER'}),read:()=>({ok:true,status:'TEST_ONLY',canonical:true,objects:structuredClone(state.objects),relations:structuredClone(state.relations)}),validateRelation:p=>({ok:p.sourceObjectId!==p.targetObjectId&&p.type==='relates',token:'test-only'}),commitRelation:p=>{state.relations.push({id:'rel-test',sourceObjectId:p.sourceObjectId,targetObjectId:p.targetObjectId,type:p.type});return {ok:true,status:'TEST_ONLY_RELATION_COMMITTED'};},editObject:p=>{state.edits.push(structuredClone(p));return {ok:true,status:'TEST_ONLY_OBJECT_EDITED'};}};
  const reps=[{representationId:'rep-a',canonicalRef:{objectId:'obj-a'},views:['TREE','PATH','GRAPH','CANVAS']},{representationId:'rep-b',canonicalRef:{objectId:'obj-b'},views:['TREE','PATH','GRAPH','CANVAS']}],a=new VisualizeDomainAdapter({provider,representations:reps});
  assert.equal(a.providerTruth().authority,'TEST_ONLY_EDITABLE_PROVIDER');assert.equal(a.providerTruth().editability,'PROVIDER_COMMAND_BOUND');
  assert.equal(a.link({sourceObjectId:'obj-a',targetObjectId:'obj-b',type:'relates'}).ok,true);assert.equal(a.edit({objectId:'obj-a',patch:{label:'x'}}).ok,true);assert.equal(state.relations.length,1);assert.equal(state.edits.length,1);
  const normal=normalVisualize();assert.equal(normal.providerTruth().authority,'LOCAL_ACCEPTANCE_PROJECTION_ONLY');assert.equal(normal.providerTruth().editability,'READ_ONLY');
  return {testProvider:a.providerTruth().authority,normalProvider:normal.providerTruth().authority,normalEditability:normal.providerTruth().editability};
});

const m0Source=await readFile(new URL('../../stack/native-typescript/surfaces/m0-controller-composition.ts',import.meta.url),'utf8');
const browserSource=await readFile(new URL('../browser-conformance.mjs',import.meta.url),'utf8');
check('F027.composition-does-not-bind-balanced6-rq-records',()=>{
  assert.equal(m0Source.includes('BALANCED6_RQ_RECORDS'),false);assert.ok(m0Source.includes("providerClassification:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'"));assert.ok(m0Source.includes('Non-production acceptance data is excluded'));
  return {balanced6RqBinding:false,classification:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'};
});

check('F034.visualize-presentation-copy-is-truthful',()=>{
  assert.ok(m0Source.includes("LOCAL_ACCEPTANCE_PROJECTION_ONLY")||m0Source.includes('truth.authority'));assert.ok(m0Source.includes('canonical:false'));assert.ok(m0Source.includes("heading.textContent='Spatial representation workspace'"));
  assert.equal(m0Source.includes('Canonical relationship workspace'),false);assert.equal(m0Source.includes('Canonical relationships'),false);
  return {canonicalCopy:false,readOnlyCopy:true};
});

check('F036.browser-harness-preserves-readonly-and-editable-route-oracles',()=>{
  assert.ok(browserSource.includes("await ready(page, 'visualize')"));assert.ok(browserSource.includes("author-only Connect action surface became visible against the read-only Visualize provider"));assert.ok(browserSource.includes("await ready(page, 'enterprise')"));assert.ok(browserSource.includes("harnessDomain:'enterprise.editable-provider-boundary'"));assert.ok(browserSource.includes("visualize.availability.enabled === false"));assert.ok(browserSource.includes("enterprise.availability.enabled === true"));
  assert.ok(browserSource.includes('before.availability.visible === false'));return {normalVisualize:'READ_ONLY_AUTHOR_ACTION_HIDDEN',editingHarness:'enterprise.editable-provider-boundary',centralOwnerPreserved:true};
});

result.pass=result.checks.every(item=>item.pass);result.summary={total:result.checks.length,pass:result.checks.filter(item=>item.pass).length,fail:result.checks.filter(item=>!item.pass).length};
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exitCode=1;
