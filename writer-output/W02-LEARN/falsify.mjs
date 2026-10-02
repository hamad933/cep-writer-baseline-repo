/**
 * LRN-1 mandatory falsification battery (writer-local instrument).
 * Runs against the exact compiled candidate in dist/. Writes only under writer-output/W02-LEARN/.
 *
 * N1 non-owned route refuses · N2 boundary input safe · N3 missing canonical provider → truthful
 * unavailable (never synthetic learning content) · N4 duplicate mechanics (separate shell tool) ·
 * N5 suite twice identical (separate shell step) ·
 * LANE: seed Library-only KU/scope-switch data → Learn must not leak Library-only semantics.
 */
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../../',import.meta.url));
const dist=rel=>path.join(root,'dist',rel);
const {CommandRegistry}=await import(dist('foundation/models.js'));
const {createLearnRuntimeComposition}=await import(dist('adapters/learn.js'));
const {bindLearnSurface}=await import(dist('surfaces/learn/surface.js'));
const {createLearnStructuredContextProvider}=await import(dist('adapters/context-learn-structured.js'));
const {createLibraryRuntimeComposition}=await import(dist('surfaces/library/runtime-composition.js'));

const results=[];
const record=(id,status,detail)=>results.push({id,status,detail});
const guard=(id,fn)=>{
  try{const d=fn();record(id,'PASS',d)}catch(e){record(id,'FAIL',{error:String(e?.message||e)})}
};
const expect=(cond,msg)=>{if(!cond)throw Error(msg)};
const json=v=>JSON.stringify(v);

/* ---------- N1: non-owned route mutation attempt must refuse ---------- */
guard('N1.learn-registers-only-learn-owned-routes',()=>{
  const c=createLearnRuntimeComposition(),reg=new CommandRegistry();
  const bound=bindLearnSurface({commands:reg,learn:c.learn,structured:c.structured});
  const ids=[...bound.commands];
  expect(ids.every(id=>id.startsWith('learn.')),'non-learn route registered: '+ids.join(','));
  expect(bound.owner==='LearnDomainAdapter','learn surface owner changed');
  expect(bound.transactionOwner==='StructuredTransactionHistoryRecoveryOwner','learn transaction owner changed');
  return {routes:ids,owner:bound.owner,transactionOwner:bound.transactionOwner};
});
guard('N1.foreign-route-execution-refused',()=>{
  const c=createLearnRuntimeComposition(),reg=new CommandRegistry();
  bindLearnSurface({commands:reg,learn:c.learn,structured:c.structured});
  const before=json(c.structured.snapshot());
  const attempts={};
  for(const id of ['library.insert','library.save','mastery.states','visualize.viewport','rq.compare']){
    let out;
    try{out=reg.execute(id,{block:{id:'x',type:'paragraph',html:'owned-by-no-one'},index:0})}
    catch(e){out={threw:String(e?.message||e)}}
    attempts[id]=out?.ok===true?'ACCEPTED':(out?.threw?'REFUSED_THREW':'REFUSED');
    expect(out?.ok!==true,`${id} was accepted by the Learn registry`);
  }
  expect(json(c.structured.snapshot())===before,'Learn document mutated by a foreign route');
  return {attempts,learnDocumentUnchanged:true};
});
guard('N1.cross-surface-block-edit-refused-or-inert',()=>{
  const c=createLearnRuntimeComposition(),reg=new CommandRegistry();
  bindLearnSurface({commands:reg,learn:c.learn,structured:c.structured});
  const before=json(c.structured.snapshot());
  const foreignBlockId='lib-p1';
  const availability=reg.availability('learn.edit',{blockId:foreignBlockId,patch:{html:'injected'}});
  let executed=null;
  try{executed=reg.execute('learn.edit',{blockId:foreignBlockId,patch:{html:'injected'}})}catch(e){executed={threw:String(e?.message||e)}}
  const after=json(c.structured.snapshot());
  const documentIntact=after===before;
  const patchLanded=!documentIntact&&after.includes('injected');
  expect(!patchLanded,'foreign block id wrote into the Learn document');
  expect(executed?.ok!==true,'learn.edit accepted a block id that does not exist');
  return {availabilityEnabled:availability.enabled,availabilityCode:availability.code,executed,documentIntact,patchLanded};
});

/* ---------- N2: boundary / invalid input must not corrupt or fake a receipt ---------- */
guard('N2.boundary-source-inputs-fail-closed',()=>{
  const cases=[
    ['empty-object',{}],
    ['no-activity',{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',activity:{id:'a'},document:{id:'d',revision:'r',blocks:[]}}],
    ['no-document-revision',{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',activity:{id:'a',revision:1},document:{id:'d',blocks:[]}}],
    ['blocks-not-array',{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',activity:{id:'a',revision:1},document:{id:'d',revision:'r',blocks:'nope'}}],
    ['null-source',{source:null}]
  ];
  const out={};
  for(const [name,source] of cases){
    const comp=createLearnRuntimeComposition('source' in source?source:{source});
    expect(comp.learn.sourceAvailable===false,`${name} was admitted as an available source`);
    expect(comp.descriptor.realConsumer===false,`${name} claimed realConsumer`);
    out[name]={reason:comp.learn.source.rejectionReason||comp.learn.sourceAvailable,truth:comp.structured.sourceBinding.truth,documentId:comp.structured.snapshot().id};
    expect(out[name].documentId==='learn-unavailable',`${name} produced a non-unavailable document id: ${out[name].documentId}`);
  }
  return out;
});
guard('N2.boundary-learn-commands-do-not-corrupt-document',()=>{
  const source={classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',providerRef:'n2',activity:{id:'act-1',revision:1,title:'Boundary',kind:'practice',editable:true},document:{id:'doc-1',revision:'r1',title:'Boundary',blocks:[{id:'b1',type:'paragraph',html:'Stable text.'}]}};
  const c=createLearnRuntimeComposition({source}),reg=new CommandRegistry();
  bindLearnSurface({commands:reg,learn:c.learn,structured:c.structured});
  const before=json(c.structured.snapshot());
  const probes={};
  probes['edit-missing-block']=(()=>{try{return reg.execute('learn.edit',{blockId:'no-such-block',patch:{html:'x'}})}catch(e){return{threw:String(e?.message||e)}}})();
  probes['edit-unknown-patch-key']=(()=>{try{return reg.execute('learn.edit',{blockId:'b1',patch:{nosuchkey:1}})}catch(e){return{threw:String(e?.message||e)}}})();
  probes['practice-blank-answer']=(()=>{try{reg.execute('learn.practice',{});return reg.execute('learn.practice',{action:'submit',answer:'   '})}catch(e){return{threw:String(e?.message||e)}}})();
  probes['review-without-attempt']=(()=>{try{return reg.execute('learn.review',{})}catch(e){return{threw:String(e?.message||e)}}})();
  probes['outline-query-injection']=(()=>{const d=c.learn.outlineDescriptor({query:'<script>alert(1)</script>'});return {nodes:d.nodes.length,ariaLabel:d.ariaLabel}})();
  const after=json(c.structured.snapshot());
  expect(probeUnchanged('edit-missing-block',probes,after,before),'missing block id mutated the document');
  expect(probeUnchanged('edit-unknown-patch-key',probes,after,before),'unknown patch key mutated the document');
  const stability={documentUnchanged:after===before,probes};
  expect(after.includes('Stable text.'),'baseline document text lost');
  expect(!after.includes('alert(1)'),'query injection reached the document');
  expect(probes['practice-blank-answer']?.threw==='ANSWER_REQUIRED'||probes['practice-blank-answer']?.ok===false,'blank answer was accepted without ANSWER_REQUIRED');
  return stability;
});
function probeUnchanged(name,probes,after,before){
  const p=probes[name];
  return !(p&&p.ok===true&&p.status==='LEARNING_DOCUMENT_EDITED')||after===before;
}

/* ---------- N3: missing canonical provider → truthful unavailable, never synthetic content ---------- */
guard('N3.unbound-provider-is-truthfully-unavailable',()=>{
  const c=createLearnRuntimeComposition(),reg=new CommandRegistry();
  const bound=bindLearnSurface({commands:reg,learn:c.learn,structured:c.structured});
  expect(c.learn.sourceAvailable===false,'unbound composition claimed an available source');
  expect(c.descriptor.sourceAvailability==='UNAVAILABLE','unbound composition claimed AVAILABLE');
  expect(c.descriptor.realConsumer===false,'unbound composition claimed a real consumer');
  expect(c.descriptor.fixtureFallback===false,'unbound composition claimed a fixture fallback');
  expect(c.learn.source.rejectionReason==='LEARN_PROVIDER_UNBOUND','unbound rejection reason changed');
  expect(c.structured.sourceBinding.truth==='UNAVAILABLE_PROVIDER_UNBOUND','source truth changed');
  const edit=reg.availability('learn.edit',{blockId:'learn-unavailable-p1',patch:{html:'x'}});
  const practice=reg.availability('learn.practice',{});
  expect(edit.enabled===false&&edit.code!=='AVAILABLE','learn.edit enabled without a provider');
  expect(practice.enabled===false,'learn.practice enabled without a provider');
  const refusal=reg.execute('learn.practice',{});
  expect(refusal.ok===false&&refusal.code==='LEARN_CANONICAL_SOURCE_UNAVAILABLE','practice did not refuse');
  expect(refusal.masteryWrite===undefined,'refusal carried a mastery write claim');
  const doc=JSON.stringify(c.structured.snapshot());
  const banned=['lorem','ipsum','demo content','synthetic lesson','fixture lesson','acceptance seed'];
  const hits=banned.filter(t=>doc.toLowerCase().includes(t));
  expect(hits.length===0,'synthetic content in the unavailable document: '+hits.join(','));
  const ctx=createLearnStructuredContextProvider({learn:c.learn,structured:c.structured,assessment:c.learn.assessmentDescriptor(),lab:c.learn.labDescriptor()});
  const described=JSON.stringify(ctx.describe({}));
  expect(!banned.some(t=>described.toLowerCase().includes(t)),'synthetic content in the Learn context descriptor');
  return {sourceTruth:c.structured.sourceBinding.truth,edit:edit.code,practice:practice.code,refusalCode:refusal.code,documentId:c.structured.snapshot().id,syntheticHits:hits};
});
guard('N3.synthetic-classification-is-hard-rejected',()=>{
  let code=null;
  try{createLearnRuntimeComposition({source:{classification:'SYNTHETIC_DEMO',truth:'DEMO',activity:{id:'x',revision:'r1'},document:{id:'d',revision:'r1',blocks:[]}}})}
  catch(e){code=String(e.message)}
  expect(code&&code.includes('LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN'),'synthetic classification was not hard rejected');
  return {code};
});
guard('N3.non-production-truth-fails-closed-not-throws',()=>{
  const c=createLearnRuntimeComposition({source:{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'ACCEPTANCE_SEED',activity:{id:'a1',revision:1},document:{id:'d1',revision:'r1',blocks:[]}}});
  expect(c.learn.sourceAvailable===false,'non-production truth was admitted');
  expect(String(c.learn.source.rejectionReason).includes('LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN'),'rejection code changed');
  expect(c.descriptor.sourceAvailability==='UNAVAILABLE','composition did not fail closed');
  return {rejectionReason:c.learn.source.rejectionReason,sourceAvailability:c.descriptor.sourceAvailability};
});

/* ---------- LANE: seed Library-only KU/scope-switch data → Learn must not leak it ---------- */
guard('LANE.library-kU-scope-seed-does-not-reach-learn',()=>{
  const librarySource={
    classification:'PRODUCT_RUNTIME_LOCAL_SOURCE',truth:'REAL_LIBRARY_PRODUCT_SOURCE',providerRef:'lane-seed',
    document:{id:'LIB-SEED-1',revision:'r17',title:'Seeded Library working document',tags:['Knowledge'],
      blocks:[{id:'lib-seed-p1',type:'paragraph',html:'Library-only seeded KU body.'}]},
    sources:[{id:'KU-D03-0001',title:'Seeded knowledge unit',kind:'KnowledgeUnit',status:'BOUND'}],
    context:{relations:[],labs:[],projects:[],evidence:[],notes:[]},lifecycle:{state:'PUBLISHED',sourceRevision:'r17'}
  };
  const library=createLibraryRuntimeComposition({source:librarySource});
  const learnBefore=createLearnRuntimeComposition();
  const learnBeforeSnap=json(learnBefore.structured.snapshot());
  const learnBeforeMeta=json(learnBefore.structured.metadata||{});

  // Seed Library-only state: KU-bearing source, scope-bearing working document edits.
  library.structured.updateBlock('lib-seed-p1',{html:'Library-only seeded KU body · edited under scope switch'});
  const libraryAfter={snapshot:json(library.structured.snapshot()),sourceIdentity:library.descriptor().sourceIdentity};

  const learnAfter=createLearnRuntimeComposition();
  const learnAfterSnap=json(learnAfter.structured.snapshot());
  const learnAfterMeta=json(learnAfter.structured.metadata||{});
  expect(learnAfterSnap===learnBeforeSnap,'Learn document changed after Library-only seeding');
  expect(learnAfterMeta===learnBeforeMeta,'Learn metadata changed after Library-only seeding');
  const leaked=['KU-D03-0001','Seeded knowledge unit','LIB-SEED-1','scope switch'].filter(t=>learnAfterSnap.includes(t)||learnAfterMeta.includes(t));
  expect(leaked.length===0,'Library-only tokens leaked into Learn: '+leaked.join(','));
  expect(learnAfter.structured.metadata?.libraryIndependent===true,'Learn still reports libraryIndependent:false');
  expect(learnAfter.structured.metadata?.domainKind==='learn'||learnAfter.structured.domainKind==='learn'||learnAfter.structured.owner==='LearnAdapter','Learn adapter identity changed');
  const ctx=JSON.stringify(createLearnStructuredContextProvider({learn:learnAfter.learn,structured:learnAfter.structured}).describe({}));
  const ctxLeak=['KU-D03-0001','LIB-SEED-1','الوحدة','الكتلة المحددة'].filter(t=>ctx.includes(t));
  expect(ctxLeak.length===0,'Library-only scope/KU semantics leaked into the Learn context descriptor: '+ctxLeak.join(','));
  return {
    librarySourceTruth:libraryAfter.sourceIdentity.truth,
    libraryWorkingRevision:JSON.parse(libraryAfter.snapshot).id,
    learnDocumentUnchanged:true,learnMetadataUnchanged:true,
    leakedTokens:leaked,contextLeakTokens:ctxLeak,
    learnLibraryIndependent:learnAfter.structured.metadata?.libraryIndependent
  };
});
guard('LANE.learn-context-descriptor-owns-no-library-scope',()=>{
  const c=createLearnRuntimeComposition();
  const p=createLearnStructuredContextProvider({learn:c.learn,structured:c.structured,assessment:c.learn.assessmentDescriptor(),lab:c.learn.labDescriptor()});
  const d=p.describe({});
  const text=JSON.stringify(d);
  expect(p.owner==='LearnContextDescriptorProvider','context provider owner changed');
  expect(d.domainOwner==='LearnAdapter','context descriptor domain owner changed');
  expect(!/kuScope|libraryScope|scopeSwitch|contextscope/i.test(text),'library scope semantics present in the Learn context descriptor');
  return {providerId:d.providerId,owner:p.owner,domainOwner:d.domainOwner,family:d.family};
});
guard('LANE.h03-ceiling-held-no-relation-propagation-claim',()=>{
  const c=createLearnRuntimeComposition();
  const d=JSON.stringify(c.descriptor);
  const ctx=JSON.stringify(createLearnStructuredContextProvider({learn:c.learn,structured:c.structured}).describe({}));
  const forbidden=['relation propagation','H03-R2-PROP-001 proven','H03-R2-FALSIFY-001 proven','PROP_PROVEN','FALSIFY_PROVEN'];
  const hits=[...forbidden,...forbidden].filter(t=>(d+ctx).toLowerCase().includes(t.toLowerCase()));
  expect(hits.length===0,'H03 ceiling violated: '+hits.join(','));
  return {hits,ceiling:'H03 PROP/FALSIFY remain NOT_PROVEN'};
});

const report={
  schemaVersion:1,kind:'LRN_1_FALSIFICATION',lane:'LRN-1',unit:'W02-LEARN',
  generatedAt:new Date().toISOString(),node:process.version,
  total:results.length,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status!=='PASS').length,
  results
};
await writeFile(path.join(root,'writer-output/W02-LEARN/FALSIFICATION.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({total:report.total,pass:report.pass,fail:report.fail,failures:results.filter(r=>r.status!=='PASS')},null,2));
if(report.fail)process.exitCode=1;
