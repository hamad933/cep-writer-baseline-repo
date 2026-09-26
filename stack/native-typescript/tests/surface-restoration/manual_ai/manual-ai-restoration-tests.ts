import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {ManualAiDomainAdapter} from '../../../adapters/manual_ai/domain-adapter.js';
import {createManualAiSurfaceComposition} from '../../../surfaces/manual_ai/composition.js';
import {describeContextProvider} from '../../../foundation/global/context-descriptor-contract.js';

const assert=(value:any,message='assertion failed')=>{if(!value)throw Error(message)};
const digest='a'.repeat(64);
const packageDigest='b'.repeat(64);
const run=(name:string,fn:()=>void,out:any[])=>{try{fn();out.push({name,status:'PASS'})}catch(error){out.push({name,status:'FAIL',error:String((error as any)?.message||error)})}};

function exportedAdapter({draftSink=null as any}={}){
  let exportCalls=0;
  const adapter=new ManualAiDomainAdapter({
    io:{exportPackage:(packet:any)=>{exportCalls+=1;assert(packet.mode==='MANUAL_ONLY');return {artifactId:'manual-export-1',digest:packageDigest}}},
    draftSink
  });
  adapter.prepare({proposalId:'AIB-001',revision:'rev-7',sourceDigest:digest,sourceId:'source-42',content:'مراجعة Architecture يدوية'});
  return {adapter,getExportCalls:()=>exportCalls};
}

export function runManualAiRestorationTests(){
  const tests:any[]=[];

  run('default-export-helper-is-command-unavailable-and-emits-no-receipt',()=>{
    const adapter=new ManualAiDomainAdapter();
    adapter.prepare({proposalId:'AIB-001',revision:'rev-7',sourceDigest:digest,sourceId:'source-42'});
    const commands=new SemanticCommandBus();
    const surface=createManualAiSurfaceComposition({adapter,commands});
    const availability=commands.availability('manual_ai.export',{id:'AIB-001'});
    const action=surface.collection.rowActions('AIB-001').find((item:any)=>item.id==='manual_ai.export');
    const before=commands.receipts.length;
    const result=commands.execute('manual_ai.export',{id:'AIB-001'});
    assert(availability.enabled===false&&/helper unavailable/i.test(availability.reason));
    assert(action?.enabled===false);
    assert(result.ok===false&&result.code==='UNAVAILABLE');
    assert(commands.receipts.length===before);
    assert(adapter.diagnosticProjection().hiddenProviderCalls===0);
  },tests);

  run('lawful-export-helper-binds-exact-provenance-with-zero-provider-network',()=>{
    const {adapter,getExportCalls}=exportedAdapter();
    const commands=new SemanticCommandBus();
    const surface=createManualAiSurfaceComposition({adapter,commands});
    assert(commands.availability('manual_ai.export',{id:'AIB-001'}).enabled===true);
    const result=commands.execute('manual_ai.export',{id:'AIB-001'});
    const row=adapter.selected()!;
    assert(result.ok&&result.code==='EXPORTED'&&getExportCalls()===1);
    assert(result.packet.sourceId==='source-42'&&result.packet.sourceRevisionId==='rev-7'&&result.packet.sourceDigest===digest);
    assert(row.provenance.exportedPackageDigest===packageDigest&&row.provenance.exportedArtifactId==='manual-export-1');
    assert(surface.providerTruth.hiddenProviderCalls===0&&surface.providerTruth.providerNetworkCalls===0&&surface.providerTruth.backgroundCompletion===false);
  },tests);

  run('provenance-equal-import-becomes-reviewable',()=>{
    const {adapter}=exportedAdapter();
    adapter.export('AIB-001');
    const result=adapter.import({proposalId:'AIB-001',sourceId:'source-42',sourceRevisionId:'rev-7',sourceDigest:digest,exportedPackageDigest:packageDigest,content:'نتيجة خارجية يدوية'});
    const commands=new SemanticCommandBus();
    const surface=createManualAiSurfaceComposition({adapter,commands});
    const review=surface.collection.rowActions('AIB-001').find((item:any)=>item.id==='manual_ai.review');
    assert(result.ok&&result.code==='IMPORTED'&&result.provenanceEqual===true);
    assert(adapter.selected()?.state==='IMPORTED'&&review?.enabled===true);
  },tests);

  run('provenance-mismatch-fails-closed-and-retains-request-lineage',()=>{
    let drafts=0;
    const {adapter}=exportedAdapter({draftSink:{createWorkingDraft:()=>{drafts+=1;return {draftId:'draft-1',status:'CREATED' as const}}}});
    adapter.export('AIB-001');
    const result=adapter.import({proposalId:'AIB-001',sourceId:'source-42',sourceRevisionId:'rev-WRONG',sourceDigest:digest,exportedPackageDigest:packageDigest,content:'x'});
    const row=adapter.selected()!;
    const review=adapter.review({id:'AIB-001',disposition:'ACCEPT'});
    assert(!result.ok&&result.code==='PROVENANCE_INVALID'&&result.match.sourceRevisionId===false);
    assert(row.provenance.sourceId==='source-42'&&row.provenance.sourceRevisionId==='rev-7'&&row.provenance.sourceDigest===digest&&row.provenance.exportedPackageDigest===packageDigest);
    assert(!review.ok&&review.code==='PROVENANCE_INVALID'&&drafts===0);
  },tests);

  run('default-draft-sink-blocks-accept-with-no-success-receipt-or-persistence-claim',()=>{
    const {adapter}=exportedAdapter();
    adapter.export('AIB-001');
    adapter.import({proposalId:'AIB-001',sourceId:'source-42',sourceRevisionId:'rev-7',sourceDigest:digest,exportedPackageDigest:packageDigest,content:'manual result'});
    const commands=new SemanticCommandBus();
    const surface=createManualAiSurfaceComposition({adapter,commands});
    const availability=commands.availability('manual_ai.review',{id:'AIB-001',disposition:'ACCEPT'});
    const before=commands.receipts.length;
    const result=commands.execute('manual_ai.review',{id:'AIB-001',disposition:'ACCEPT'});
    assert(availability.enabled===false&&/draft sink unavailable/i.test(availability.reason));
    assert(result.ok===false&&result.code==='UNAVAILABLE'&&commands.receipts.length===before);
    assert(adapter.selected()?.state==='IMPORTED'&&adapter.selected()?.draftState==='ABSENT');
    assert(surface.providerTruth.historyPersistence==='IN_MEMORY_ONLY'&&surface.providerTruth.appendOnlyDurableHistory===false);
  },tests);

  run('admitted-draft-sink-accept-is-idempotent-draft-only',()=>{
    let drafts=0;
    const {adapter}=exportedAdapter({draftSink:{createWorkingDraft:()=>{drafts+=1;return {draftId:'draft-1',status:'CREATED' as const}}}});
    adapter.export('AIB-001');
    adapter.import({proposalId:'AIB-001',sourceId:'source-42',sourceRevisionId:'rev-7',sourceDigest:digest,exportedPackageDigest:packageDigest,content:'manual result'});
    const commands=new SemanticCommandBus();
    createManualAiSurfaceComposition({adapter,commands});
    const first=commands.execute('manual_ai.review',{id:'AIB-001',disposition:'ACCEPT',actor:'owner'});
    const second=commands.execute('manual_ai.review',{id:'AIB-001',disposition:'ACCEPT',actor:'owner'});
    assert(first.ok&&second.ok&&first.code==='ACCEPTED_AS_DRAFT'&&second.code==='ACCEPTED_AS_DRAFT');
    assert(first.canonicalPublication===false&&second.canonicalPublication===false&&second.idempotent===true);
    assert(drafts===1&&adapter.selected()?.draftId==='draft-1');
  },tests);

  run('context-exposes-manual-capability-and-in-memory-history-truth',()=>{
    const adapter=new ManualAiDomainAdapter();
    adapter.prepare({proposalId:'AIB-RTL-1',revision:'rev-عربي-1',sourceDigest:digest,sourceId:'مصدر-01',content:'تحليل Manual AI خارجي'});
    adapter.select('AIB-RTL-1');
    const surface=createManualAiSurfaceComposition({adapter,commands:new SemanticCommandBus()});
    const context=describeContextProvider(surface.contextProvider,{id:'AIB-RTL-1'});
    const fields=context.descriptor.lenses[0].tabs[0].fields;
    const values=Object.fromEntries(fields.map((field:any)=>[field.id,field.value]));
    assert(context.ok&&values['export-helper']==='UNAVAILABLE'&&values['draft-sink']==='UNAVAILABLE'&&values['history-persistence']==='IN_MEMORY_ONLY');
    assert(fields.find((field:any)=>field.id==='source-digest')?.technical===true);
    assert(surface.collection.cell(adapter.selected()!,'proposal').direction==='ltr');
    assert(surface.collection.cell(adapter.selected()!,'source').direction==='auto');
  },tests);

  run('bottom-remains-shared-owner-projection-with-no-local-workaround',()=>{
    const surface=createManualAiSurfaceComposition({commands:new SemanticCommandBus()});
    assert(surface.slots.BOTTOM==='shared-bottom-shell/domain-projection');
    assert(surface.bottomProjection().truth.historyPersistence==='IN_MEMORY_ONLY');
  },tests);

  return tests;
}

if(import.meta.url===new URL(process.argv[1],'file:').href){
  const tests=runManualAiRestorationTests();
  const report={surface:'manual_ai-restoration',pass:tests.filter(test=>test.status==='PASS').length,fail:tests.filter(test=>test.status==='FAIL').length,tests};
  console.log(JSON.stringify(report,null,2));
  if(report.fail)process.exitCode=1;
}
