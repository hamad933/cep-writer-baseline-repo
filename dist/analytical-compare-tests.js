import {AnalyticalCompareOwner,setAnalyticalCompareOrdering,ANALYTICAL_COMPARE_OWNER} from './foundation/analytical/compare.js';
import {createAnalyticalProviderBoundary} from './foundation/contracts/analysis-provider.js';
import {createRqCompareProvider} from './adapters/analytical/rq-compare-provider.js';
import {createResultsCompareProvider} from './adapters/analytical/results-compare-provider.js';

const clone=value=>structuredClone(value);
const json=value=>JSON.stringify(value);
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message);};
const assertThrows=(fn,pattern)=>{let error=null;try{fn();}catch(e){error=e;}assert(error,'expected throw');if(pattern)assert(pattern.test(String(error.message)),`unexpected error: ${error.message}`);return error;};

export function analyticalCompareFixtures(){
  const rqRecords=[
    {sourceId:'SRC-001',revision:'r1',digest:'sha256-rq-001-r1',locator:'rq://sources/SRC-001/r1',schemaVersion:'rq-source/1',provenanceRefs:['rq-prov:SRC-001:r1'],successor:{sourceId:'SRC-001',revision:'r2',digest:'sha256-rq-001-r2',locator:'rq://sources/SRC-001/r2'},workingConflict:{classification:'SOURCE_DIVERGENCE',rationale:'Working analytical rationale only; not a W04 review decision.'},comparable:{title:{label:'Title',type:'text',value:'Alpha'},abstract:{label:'Abstract',type:'text',value:'Initial abstract'},confidence:{label:'Confidence',type:'number',value:0.8}}},
    {sourceId:'SRC-001',revision:'r2',digest:'sha256-rq-001-r2',locator:'rq://sources/SRC-001/r2',schemaVersion:'rq-source/1',provenanceRefs:['rq-prov:SRC-001:r2'],comparable:{title:{label:'Title',type:'text',value:'Alpha revised'},confidence:{label:'Confidence',type:'number',value:0.8},quality:{label:'Quality',type:'text',value:'verified'}}},
    {sourceId:'SRC-002',revision:'r1',digest:'sha256-rq-002-r1',locator:'rq://sources/SRC-002/r1',schemaVersion:'rq-source/2',comparable:{title:{label:'Title',type:'text',value:'Beta'}}}
  ];
  const resultsRecords=[
    {resultId:'RES-001',revisionId:'rev-a',manifestDigest:'sha256-result-001-a',sealed:true,schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/1.0.0',provenanceRefs:['result-manifest:RES-001:rev-a'],recordedEvents:[{stream:'terminal',sequence:1,eventId:'evt-1',causalRefs:[]}],aar:{analysisId:'AAR-1',revision:'1',anchoredEventRefs:['evt-1'],notes:'Historical AAR remains domain-owned.'},historicalTerminalBytes:'<script>globalThis.__CEP_EXECUTED__=true</script> inert historical text',comparable:{score:{label:'Score',type:'number',value:10},status:{label:'Status',type:'text',value:'PASS'},terminal:{label:'Terminal bytes',type:'bytes-as-text',value:'<script>globalThis.__CEP_EXECUTED__=true</script> inert historical text'}}},
    {resultId:'RES-002',revisionId:'rev-b',manifestDigest:'sha256-result-002-b',sealed:true,schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/1.0.0',provenanceRefs:['result-manifest:RES-002:rev-b'],recordedEvents:[{stream:'terminal',sequence:1,eventId:'evt-2',causalRefs:[]}],aar:{analysisId:'AAR-2',revision:'1',anchoredEventRefs:['evt-2']},historicalTerminalBytes:'plain historical terminal text',comparable:{score:{label:'Score',type:'number',value:20},status:{label:'Status',type:'text',value:'PASS'},terminal:{label:'Terminal bytes',type:'bytes-as-text',value:'plain historical terminal text'}}},
    {resultId:'RES-003',revisionId:'rev-c',manifestDigest:'sha256-result-003-c',sealed:true,schemaVersion:'sealed-result/2',comparatorVersion:'results-compare/1.0.0',comparable:{score:{label:'Score',type:'number',value:10}}},
    {resultId:'RES-004',revisionId:'rev-d',manifestDigest:'sha256-result-004-d',sealed:true,schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/2.0.0',comparable:{score:{label:'Score',type:'number',value:10}}}
  ];
  return {rqRecords,resultsRecords};
}

function setup(){
  const {rqRecords,resultsRecords}=analyticalCompareFixtures();
  const effects={replay:0,simulator:0,determinism:0,evidence:0};
  const rq=createRqCompareProvider(rqRecords),results=createResultsCompareProvider(resultsRecords,{effects:{replayExecute:()=>effects.replay++,simulatorRun:()=>effects.simulator++,determinismVerify:()=>effects.determinism++,candidateEvidenceHandoff:()=>effects.evidence++}});
  const owner=new AnalyticalCompareOwner();owner.registerProvider(rq);owner.registerProvider(results);
  const rq1={sourceId:'SRC-001',revision:'r1',digest:'sha256-rq-001-r1',locator:'rq://sources/SRC-001/r1'},rq2={sourceId:'SRC-001',revision:'r2',digest:'sha256-rq-001-r2',locator:'rq://sources/SRC-001/r2'},rqIncompatible={sourceId:'SRC-002',revision:'r1',digest:'sha256-rq-002-r1',locator:'rq://sources/SRC-002/r1'},rqMissing={sourceId:'SRC-404',revision:'r9',digest:'sha256-rq-missing',locator:'rq://sources/SRC-404/r9'},rqUnresolvable={...rq1,locator:'rq://broken/SRC-001/r1'};
  const res1={resultId:'RES-001',revisionId:'rev-a',manifestDigest:'sha256-result-001-a'},res2={resultId:'RES-002',revisionId:'rev-b',manifestDigest:'sha256-result-002-b'},resIncompatible={resultId:'RES-003',revisionId:'rev-c',manifestDigest:'sha256-result-003-c'},resComparatorMismatch={resultId:'RES-004',revisionId:'rev-d',manifestDigest:'sha256-result-004-d'},resMissing={resultId:'RES-404',revisionId:'rev-z',manifestDigest:'sha256-result-missing'};
  const pair=(providerId,left,right)=>owner.createPair({left:{providerId,ref:left},right:{providerId,ref:right}});
  return {owner,rq,results,effects,rqRecords,resultsRecords,rq1,rq2,rqIncompatible,rqMissing,rqUnresolvable,res1,res2,resIncompatible,resComparatorMismatch,resMissing,pair};
}

export function runAnalyticalCompareTests(){
  const tests=[];
  const test=(id,fn)=>{try{const detail=fn();tests.push({id,status:'PASS',detail:detail??'PASS'});}catch(error){tests.push({id,status:'FAIL',detail:String(error?.stack||error)});}};

  test('owner.single-semantic-owner',()=>{assert(ANALYTICAL_COMPARE_OWNER.id==='AnalyticalCompareOwner'&&ANALYTICAL_COMPARE_OWNER.token==='AnalyticalCompare');return ANALYTICAL_COMPARE_OWNER;});
  test('owner.sc032-declaration',()=>{assert(ANALYTICAL_COMPARE_OWNER.semanticCore==='SC-032 / AnalyticalWorkbenchCore');});
  test('provider.rq-accepted',()=>{const s=setup();assert(s.owner.providerIds().includes('rq.source-revision.compare'));});
  test('provider.results-accepted',()=>{const s=setup();assert(s.owner.providerIds().includes('results.sealed-result.compare'));});
  test('provider.fake-rejected',()=>{const owner=new AnalyticalCompareOwner();assertThrows(()=>owner.registerProvider({descriptor(){return {providerId:'fake'}}}),/BRAND_REJECTED/);});
  test('provider.duplicate-id-rejected',()=>{const s=setup(),before=json(s.owner.providerIds());assertThrows(()=>s.owner.registerProvider(s.rq),/DUPLICATE_ID/);assert(json(s.owner.providerIds())===before);});
  test('provider.registration-fail-atomic',()=>{const s=setup(),before=json(s.owner.providerIds());assertThrows(()=>s.owner.registerProvider({}),/BRAND_REJECTED/);assert(json(s.owner.providerIds())===before);});
  test('pair.malformed-rq-ref-rejected',()=>{const s=setup();assertThrows(()=>s.pair('rq.source-revision.compare',{sourceId:'SRC-001',revision:'r1',digest:'x'},s.rq1),/RQ_LOCATOR_REQUIRED/);});
  test('pair.latest-alias-rejected',()=>{const s=setup();assertThrows(()=>s.pair('rq.source-revision.compare',{...s.rq1,revision:'latest'},s.rq1),/EXACT_REF_ALIAS_FORBIDDEN/);});
  test('pair.cross-provider-rejected',()=>{const s=setup();assertThrows(()=>s.owner.createPair({left:{providerId:'rq.source-revision.compare',ref:s.rq1},right:{providerId:'results.sealed-result.compare',ref:s.res1}}),/CROSS_PROVIDER_COMPARISON_REJECTED/);});
  test('pair.rq-cannot-consume-results-ref',()=>{const s=setup();assertThrows(()=>s.pair('rq.source-revision.compare',s.res1,s.rq1),/RQ_SOURCE_ID_REQUIRED/);});
  test('pair.results-cannot-consume-rq-ref',()=>{const s=setup();assertThrows(()=>s.pair('results.sealed-result.compare',s.rq1,s.res1),/RESULT_ID_REQUIRED/);});
  test('availability.cross-provider-truthful',()=>{const s=setup(),a=s.owner.availability('rq.source-revision.compare','results.sealed-result.compare');assert(!a.enabled&&a.code==='CROSS_PROVIDER_COMPARISON_REJECTED'&&a.reason);return a;});

  test('rq.exact-no-diff',()=>{const s=setup(),r=s.owner.openSession('rq-exact',s.pair('rq.source-revision.compare',s.rq1,s.rq1));assert(r.state==='EXACT'&&r.differences.length===0&&r.receipt.diffExecuted===true);});
  test('rq.changed-diff',()=>{const s=setup(),r=s.owner.openSession('rq-diff',s.pair('rq.source-revision.compare',s.rq1,s.rq2));assert(r.state==='DIFFERENT'&&r.differences.some(d=>d.kind==='CHANGED'&&d.path==='title'));});
  test('rq.added-diff',()=>{const s=setup(),r=s.owner.openSession('rq-add',s.pair('rq.source-revision.compare',s.rq1,s.rq2));assert(r.differences.some(d=>d.kind==='ADDED'&&d.path==='quality'));});
  test('rq.removed-diff',()=>{const s=setup(),r=s.owner.openSession('rq-remove',s.pair('rq.source-revision.compare',s.rq1,s.rq2));assert(r.differences.some(d=>d.kind==='REMOVED'&&d.path==='abstract'));});
  test('rq.incompatible-before-diff',()=>{const s=setup(),r=s.owner.openSession('rq-incompat',s.pair('rq.source-revision.compare',s.rq1,s.rqIncompatible));assert(r.state==='INCOMPATIBLE'&&r.differences.length===0&&r.receipt.diffExecuted===false&&r.compatibility.reasonCode==='RQ_SCHEMA_INCOMPATIBLE');});
  test('rq.missing-side',()=>{const s=setup(),r=s.owner.openSession('rq-missing',s.pair('rq.source-revision.compare',s.rqMissing,s.rq1));assert(r.state==='MISSING_LEFT'&&r.leftResolution.reasonCode==='RQ_SOURCE_REVISION_ABSENT');});
  test('rq.unresolvable-distinct-from-absent',()=>{const s=setup(),r=s.owner.openSession('rq-unresolvable',s.pair('rq.source-revision.compare',s.rqUnresolvable,s.rq1));assert(r.state==='MISSING_LEFT'&&r.leftResolution.state==='UNRESOLVABLE'&&r.leftResolution.reasonCode==='RQ_LOCATOR_UNRESOLVABLE');});
  test('rq.superseded-remains-pinned',()=>{const s=setup(),p=s.pair('rq.source-revision.compare',s.rq1,s.rq2),r=s.owner.openSession('rq-stale',p);assert(r.pair.left.ref.revision==='r1'&&r.successorHints.left.revision==='r2'&&r.pair.left.ref.locator===s.rq1.locator);});
  test('rq.working-conflict-not-w04',()=>{const s=setup(),r=s.owner.openSession('rq-context',s.pair('rq.source-revision.compare',s.rq1,s.rq2)),c=r.providerContext.left;assert(c.kind==='WorkingConflict'&&c.authority==='RQ_ANALYTICAL_WORKING_STATE'&&c.formalReview===false&&c.w04Finding===false&&c.w04Decision===false);assert(!('decision' in c)&&!('finding' in c));});
  test('rq.records-unchanged',()=>{const s=setup(),before=json(s.rqRecords);s.owner.openSession('rq-immut',s.pair('rq.source-revision.compare',s.rq1,s.rq2));assert(json(s.rqRecords)===before);});
  test('rq.digest-revision-contradiction-rejected',()=>{const s=setup(),bad={...s.rq1,digest:'wrong-digest'},p=s.pair('rq.source-revision.compare',bad,s.rq2),r=s.owner.comparePair(p);assert(r.state==='ERROR'&&/DIGEST_REVISION_CONTRADICTION/.test(r.reason)&&r.receipt.published===false);});

  test('results.exact-no-diff',()=>{const s=setup(),r=s.owner.openSession('res-exact',s.pair('results.sealed-result.compare',s.res1,s.res1));assert(r.state==='EXACT'&&r.differences.length===0);});
  test('results.changed-diff',()=>{const s=setup(),r=s.owner.openSession('res-diff',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(r.state==='DIFFERENT'&&r.differences.some(d=>d.kind==='CHANGED'&&d.path==='score'));});
  test('results.schema-incompatible',()=>{const s=setup(),r=s.owner.openSession('res-incompat',s.pair('results.sealed-result.compare',s.res1,s.resIncompatible));assert(r.state==='INCOMPATIBLE'&&r.receipt.diffExecuted===false&&r.compatibility.reasonCode==='RESULT_SCHEMA_INCOMPATIBLE');});
  test('results.comparator-incompatible',()=>{const s=setup(),r=s.owner.openSession('res-cmp-incompat',s.pair('results.sealed-result.compare',s.res1,s.resComparatorMismatch));assert(r.state==='INCOMPATIBLE'&&r.compatibility.reasonCode==='RESULT_COMPARATOR_INCOMPATIBLE');});
  test('results.missing-left',()=>{const s=setup(),r=s.owner.openSession('res-left-missing',s.pair('results.sealed-result.compare',s.resMissing,s.res1));assert(r.state==='MISSING_LEFT');});
  test('results.missing-right',()=>{const s=setup(),r=s.owner.openSession('res-right-missing',s.pair('results.sealed-result.compare',s.res1,s.resMissing));assert(r.state==='MISSING_RIGHT');});
  test('results.never-replay',()=>{const s=setup();s.owner.openSession('res-no-replay',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(s.effects.replay===0);});
  test('results.never-simulator-run',()=>{const s=setup();s.owner.openSession('res-no-sim',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(s.effects.simulator===0);});
  test('results.never-determinism-verification',()=>{const s=setup();s.owner.openSession('res-no-det',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(s.effects.determinism===0);});
  test('results.never-evidence-admission',()=>{const s=setup();s.owner.openSession('res-no-evidence',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(s.effects.evidence===0);});
  test('results.aar-not-rewritten',()=>{const s=setup(),before=clone(s.resultsRecords[0].aar);s.owner.openSession('res-aar',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(json(s.resultsRecords[0].aar)===json(before));});
  test('results.historical-terminal-inert',()=>{const s=setup(),r=s.owner.openSession('res-terminal',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(r.providerContext.left.historicalTerminalBytes.includes('<script>')&&globalThis.__CEP_EXECUTED__!==true);});
  test('results.records-unchanged',()=>{const s=setup(),before=json(s.resultsRecords);s.owner.openSession('res-immut',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(json(s.resultsRecords)===before);});
  test('results.digest-revision-contradiction-rejected',()=>{const s=setup(),bad={...s.res1,manifestDigest:'wrong'},p=s.pair('results.sealed-result.compare',bad,s.res2),r=s.owner.comparePair(p);assert(r.state==='ERROR'&&/MANIFEST_DIGEST_REVISION_CONTRADICTION/.test(r.reason));});

  test('core.deterministic-ordering',()=>{const s=setup(),p=s.pair('rq.source-revision.compare',s.rq1,s.rq2),a=s.owner.comparePair(p),b=s.owner.comparePair(p);assert(json(a.differences)===json(b.differences));assert(a.differences.map(x=>x.path).join(',')==='abstract,quality,title');});
  test('core.deterministic-filter',()=>{const s=setup();s.owner.openSession('filter',s.pair('rq.source-revision.compare',s.rq1,s.rq2));const a=s.owner.setFilter('filter','title'),b=s.owner.projectSession('filter');assert(a.differences.length===1&&a.differences[0].path==='title'&&json(a.differences)===json(b.differences));});
  test('core.filter-does-not-mutate-base',()=>{const s=setup();s.owner.openSession('filter-base',s.pair('rq.source-revision.compare',s.rq1,s.rq2));const before=json(s.owner.sessionState('filter-base').baseResult);s.owner.setFilter('filter-base','quality');assert(json(s.owner.sessionState('filter-base').baseResult)===before);});
  test('core.inspection-does-not-mutate-base',()=>{const s=setup();s.owner.openSession('inspect',s.pair('rq.source-revision.compare',s.rq1,s.rq2));const before=json(s.owner.sessionState('inspect').baseResult),d=s.owner.inspectDifference('inspect','title');assert(d.difference.path==='title'&&json(s.owner.sessionState('inspect').baseResult)===before);});
  test('core.base-result-deep-frozen',()=>{const s=setup();s.owner.openSession('frozen',s.pair('rq.source-revision.compare',s.rq1,s.rq2));const r=s.owner.sessionState('frozen').baseResult;assert(Object.isFrozen(r)&&Object.isFrozen(r.differences)&&Object.isFrozen(r.receipt));});
  test('core.receipt-identities',()=>{const s=setup(),r=s.owner.openSession('receipt',s.pair('rq.source-revision.compare',s.rq1,s.rq2));assert(r.receipt.ownerToken==='AnalyticalCompare'&&r.receipt.providerId==='rq.source-revision.compare'&&r.receipt.pairId===r.pair.pairId&&r.receipt.comparatorVersion==='rq-compare/1.0.0');});
  test('core.provider-mismatch-rejected',()=>{const s=setup(),r=s.owner.comparePair({providerId:'rq.source-revision.compare',left:{providerId:'rq.source-revision.compare',ref:s.rq1},right:{providerId:'results.sealed-result.compare',ref:s.rq2},pairId:'forged',comparatorVersion:'x'});assert(r.state==='ERROR'&&/PAIR_PROVIDER_MISMATCH/.test(r.reason));});

  test('core.provider-exception-fail-atomic',()=>{
    const owner=new AnalyticalCompareOwner();
    const provider=createAnalyticalProviderBoundary({descriptor:{providerId:'fault.provider',domainKind:'fault-test',schemaVersion:'1',comparatorVersion:'1',identityShape:'id + revision'},validateExactRef:ref=>{if(!ref?.id||!ref?.revision)throw Error('FAULT_REF_INVALID');return {id:ref.id,revision:ref.revision};},refKey:ref=>`${ref.id}@${ref.revision}`,resolve:ref=>{if(ref.id==='boom')throw Error('PROVIDER_EXPLODED');return {state:'RESOLVED',objectId:ref.id,revisionId:ref.revision,schemaVersion:'1',fields:[{path:'v',label:'Value',type:'number',present:true,value:1,provenanceRefs:[]}],provenanceRefs:[]};},preflightCompatibility:()=>({compatible:true,comparatorVersion:'1'})});
    owner.registerProvider(provider);const good=owner.createPair({left:{providerId:'fault.provider',ref:{id:'a',revision:'1'}},right:{providerId:'fault.provider',ref:{id:'b',revision:'1'}}});owner.openSession('atomic',good);const before=json(owner.sessionState('atomic'));const bad=owner.createPair({left:{providerId:'fault.provider',ref:{id:'boom',revision:'1'}},right:{providerId:'fault.provider',ref:{id:'b',revision:'1'}}});const failed=owner.replaceSessionPair('atomic',bad);assert(failed.state==='ERROR'&&failed.receipt.published===false&&json(owner.sessionState('atomic'))===before);return failed.reason;
  });

  test('second-consumer.same-owner-rq-results',()=>{const s=setup();s.owner.openSession('rq',s.pair('rq.source-revision.compare',s.rq1,s.rq2));s.owner.openSession('results',s.pair('results.sealed-result.compare',s.res1,s.res2));assert(s.owner.sessionState('rq').baseResult.receipt.owner==='AnalyticalCompareOwner'&&s.owner.sessionState('results').baseResult.receipt.owner==='AnalyticalCompareOwner');});
  test('second-consumer.central-ordering-change-reaches-both',()=>{const s=setup(),change=setAnalyticalCompareOrdering('LABEL_DESC');try{const rq=s.owner.comparePair(s.pair('rq.source-revision.compare',s.rq1,s.rq2)),results=s.owner.comparePair(s.pair('results.sealed-result.compare',s.res1,s.res2));assert(rq.receipt.policy.ordering==='LABEL_DESC'&&results.receipt.policy.ordering==='LABEL_DESC');assert(rq.differences.length>=2&&results.differences.length>=2);assert(rq.differences[0].label.localeCompare(rq.differences.at(-1).label,'en')>=0);assert(results.differences[0].label.localeCompare(results.differences.at(-1).label,'en')>=0);return {rq:rq.differences.map(x=>x.label),results:results.differences.map(x=>x.label)};}finally{change.revert();}});
  test('second-consumer.domain-schemas-independent',()=>{const s=setup();assert(s.rq.descriptor().identityShape!==s.results.descriptor().identityShape&&s.rq.descriptor().domainKind==='rq'&&s.results.descriptor().domainKind==='results');});
  test('second-consumer.provider-identity-no-leak',()=>{const s=setup(),a=s.owner.comparePair(s.pair('rq.source-revision.compare',s.rq1,s.rq2)),b=s.owner.comparePair(s.pair('results.sealed-result.compare',s.res1,s.res2));assert(a.pair.providerId==='rq.source-revision.compare'&&b.pair.providerId==='results.sealed-result.compare'&&!json(a.pair).includes('RES-001')&&!json(b.pair).includes('SRC-001'));});

  test('session.two-pairs-isolated',()=>{const s=setup();s.owner.openSession('A',s.pair('rq.source-revision.compare',s.rq1,s.rq2));s.owner.openSession('B',s.pair('results.sealed-result.compare',s.res1,s.res2));s.owner.setFilter('A','title');assert(s.owner.sessionState('A').filter==='title'&&s.owner.sessionState('B').filter===''&&s.owner.sessionState('A').pair.pairId!==s.owner.sessionState('B').pair.pairId);});
  test('session.focus-isolated',()=>{const s=setup();s.owner.openSession('A',s.pair('rq.source-revision.compare',s.rq1,s.rq2));s.owner.openSession('B',s.pair('results.sealed-result.compare',s.res1,s.res2));const beforeB=s.owner.sessionState('B').focusedPath;s.owner.focusDifference('A','title');assert(s.owner.sessionState('A').focusedPath==='title'&&s.owner.sessionState('B').focusedPath===beforeB);});
  test('identity.exact-pinned-pair',()=>{const s=setup(),p=s.pair('results.sealed-result.compare',s.res1,s.res2);assert(p.pinned===true&&p.mutable===false&&p.left.ref.manifestDigest===s.res1.manifestDigest&&p.right.ref.revisionId===s.res2.revisionId);});
  test('identity.dom-not-canonical',()=>{const s=setup(),p=s.pair('rq.source-revision.compare',s.rq1,s.rq2);assert(!json(p).match(/domId|elementId|selector/i));assert(s.rq.descriptor().identityShape.includes('sourceId')&&s.results.descriptor().identityShape.includes('resultId'));});
  test('authority.no-review-mastery-audit-inference',()=>{const s=setup(),r=s.owner.openSession('authority',s.pair('rq.source-revision.compare',s.rq1,s.rq2)),text=json(r.receipt);assert(!/ReviewDecision|MasteryJudgment|AuditEvent|EvidenceAdmission/.test(text));});
  test('authority.no-persistence-owner',()=>{const owner=new AnalyticalCompareOwner();assert(!('store' in owner)&&!('persistence' in owner)&&!('save' in owner));});

  const pass=tests.filter(t=>t.status==='PASS').length,fail=tests.length-pass;
  return {suite:'E17_ANALYTICAL_COMPARE_EXECUTABLE',owner:ANALYTICAL_COMPARE_OWNER,total:tests.length,pass,fail,tests};
}
