import {AnalyticalCompareOwner} from './foundation/analytical/compare.js';
import {canonicalAnalyticalIdentityKey,createAnalyticalProviderBoundary} from './foundation/contracts/analysis-provider.js';
import {createRqCompareProvider} from './adapters/analytical/rq-compare-provider.js';
import {analyticalCompareFixtures} from './analytical-compare-tests.js';

const clone=value=>structuredClone(value);
const json=value=>JSON.stringify(value);
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message);};
const throws=(fn,pattern)=>{let error;try{fn();}catch(e){error=e;}assert(error,'expected throw');if(pattern)assert(pattern.test(String(error.message)),`unexpected error ${error.message}`);return error;};

function setupRq(){
  const {rqRecords}=analyticalCompareFixtures();
  const provider=createRqCompareProvider(rqRecords),owner=new AnalyticalCompareOwner();owner.registerProvider(provider);
  const r1={sourceId:'SRC-001',revision:'r1',digest:'sha256-rq-001-r1',locator:'rq://sources/SRC-001/r1'};
  const r2={sourceId:'SRC-001',revision:'r2',digest:'sha256-rq-001-r2',locator:'rq://sources/SRC-001/r2'};
  const pair=owner.createPair({left:{providerId:'rq.source-revision.compare',ref:r1},right:{providerId:'rq.source-revision.compare',ref:r2}});
  return {owner,provider,r1,r2,pair};
}

function genericProvider({providerId='correction.generic',refKey=(ref)=>canonicalAnalyticalIdentityKey('generic-ref',[ref.id,ref.rev]),resolve,preflightCompatibility=()=>({compatible:true,comparatorVersion:'generic/1'})}={}){
  return createAnalyticalProviderBoundary({
    descriptor:{providerId,domainKind:'correction',schemaVersion:'generic/1',comparatorVersion:'generic/1',identityShape:'id + rev'},
    validateExactRef(ref){if(!ref||typeof ref.id!=='string'||typeof ref.rev!=='string')throw Error('GENERIC_REF_INVALID');return {id:ref.id,rev:ref.rev};},
    refKey,
    resolve:resolve||((ref)=>({state:'RESOLVED',objectId:ref.id,revisionId:ref.rev,schemaVersion:'generic/1',fields:[{path:'value',label:'Value',type:'number',present:true,value:1,provenanceRefs:[]}],provenanceRefs:[]})),
    preflightCompatibility
  });
}

function ownerWith(provider){const owner=new AnalyticalCompareOwner();owner.registerProvider(provider);return owner;}
function pairFor(owner,providerId,left,right){return owner.createPair({left:{providerId,ref:left},right:{providerId,ref:right}});}

export function runAnalyticalCompareCorrectionTests(){
  const tests=[];const test=(id,fn)=>{try{tests.push({id,status:'PASS',detail:fn()??'PASS'});}catch(error){tests.push({id,status:'FAIL',detail:String(error?.stack||error)});}};

  test('pair.forged-pair-id-rejected-unverified-receipt',()=>{const s=setupRq(),forged=clone(s.pair);forged.pairId='FORGED-PAIR-ID';const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/PAIR_ID_DRIFT/.test(r.reason));assert(r.receipt.pairId==='UNVERIFIED'&&r.receipt.suppliedPairId==='FORGED-PAIR-ID'&&r.receipt.published===false);return r.receipt;});
  test('pair.forged-left-key-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.left.key='FORGED-LEFT';const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/LEFT_KEY_DRIFT/.test(r.reason)&&r.receipt.published===false);});
  test('pair.forged-right-key-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.right.key='FORGED-RIGHT';const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/RIGHT_KEY_DRIFT/.test(r.reason)&&r.receipt.published===false);});
  test('pair.forged-comparator-version-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.comparatorVersion='evil/999';const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/COMPARATOR_VERSION_DRIFT/.test(r.reason));assert(r.receipt.comparatorVersion==='rq-compare/1.0.0'&&r.receipt.published===false);});
  test('pair.forged-domain-kind-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.domainKind='results';const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/DOMAIN_KIND_DRIFT/.test(r.reason));});
  test('pair.ref-drift-with-stale-envelope-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.left.ref=clone(s.r2);const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&(/LEFT_KEY_DRIFT|PAIR_ID_DRIFT/.test(r.reason)));assert(r.state!=='EXACT'&&r.receipt.published===false);return r.reason;});
  test('pair.mutable-or-unpinned-rejected',()=>{const s=setupRq(),forged=clone(s.pair);forged.pinned=false;const r=s.owner.comparePair(forged);assert(r.state==='ERROR'&&/PINNED_IMMUTABLE_REQUIRED/.test(r.reason));});

  test('session.forged-open-does-not-publish',()=>{const s=setupRq(),forged=clone(s.pair);forged.pairId='FORGED';const r=s.owner.openSession('forged-open',forged);assert(r.state==='ERROR');throws(()=>s.owner.sessionState('forged-open'),/SESSION_UNKNOWN/);});
  test('session.forged-replace-fail-atomic',()=>{const s=setupRq();s.owner.openSession('atomic',s.pair);const before=json(s.owner.sessionState('atomic')),forged=clone(s.pair);forged.left.key='FORGED';const r=s.owner.replaceSessionPair('atomic',forged);assert(r.state==='ERROR'&&json(s.owner.sessionState('atomic'))===before);});

  test('identity.rq-delimiter-collision-eliminated',()=>{const records=[
    {sourceId:'A',revision:'B@C',digest:'D',locator:'L',schemaVersion:'rq-source/1',comparable:{x:{label:'X',type:'text',value:'one'}}},
    {sourceId:'A@B',revision:'C',digest:'D',locator:'L',schemaVersion:'rq-source/1',comparable:{x:{label:'X',type:'text',value:'two'}}}
  ];const provider=createRqCompareProvider(records),a={sourceId:'A',revision:'B@C',digest:'D',locator:'L'},b={sourceId:'A@B',revision:'C',digest:'D',locator:'L'};const ka=provider.refKey(a),kb=provider.refKey(b);assert(ka!==kb,'canonical ref keys collided');const owner=ownerWith(provider),pa=pairFor(owner,'rq.source-revision.compare',a,a),pb=pairFor(owner,'rq.source-revision.compare',b,b);assert(pa.pairId!==pb.pairId,'pair IDs collided');return {ka,kb};});
  test('identity.provider-ref-key-collision-detected',()=>{const provider=genericProvider({providerId:'collision.provider',refKey:()=> 'CONSTANT'});provider.refKey({id:'A',rev:'1'});throws(()=>provider.refKey({id:'B',rev:'1'}),/REF_KEY_COLLISION/);});
  test('identity.provider-ref-key-nondeterminism-detected',()=>{let n=0;const provider=genericProvider({providerId:'nondeterministic.provider',refKey:ref=>`${ref.id}:${++n}`});provider.refKey({id:'A',rev:'1'});throws(()=>provider.refKey({id:'A',rev:'1'}),/REF_KEY_NON_DETERMINISTIC/);});

  test('fields.duplicate-path-rejected-before-diff',()=>{const provider=genericProvider({providerId:'duplicate.fields',resolve:ref=>({state:'RESOLVED',objectId:ref.id,revisionId:ref.rev,schemaVersion:'generic/1',fields:[{path:'x',label:'X',type:'number',present:true,value:1,provenanceRefs:[]},{path:'x',label:'X',type:'number',present:true,value:2,provenanceRefs:[]}],provenanceRefs:[]})}),owner=ownerWith(provider),p=pairFor(owner,'duplicate.fields',{id:'A',rev:'1'},{id:'B',rev:'1'}),r=owner.comparePair(p);assert(r.state==='ERROR'&&/DUPLICATE_FIELD_PATH:x/.test(r.reason)&&r.receipt.published===false);});
  for(const [name,value] of [['date',new Date('2020-01-01T00:00:00Z')],['map',new Map([['x',1]])],['nan',Number.NaN],['infinity',Number.POSITIVE_INFINITY]]){
    test(`values.${name}-rejected`,()=>{const provider=genericProvider({providerId:`bad.${name}`,resolve:ref=>({state:'RESOLVED',objectId:ref.id,revisionId:ref.rev,schemaVersion:'generic/1',fields:[{path:'x',label:'X',type:'value',present:true,value,provenanceRefs:[]}],provenanceRefs:[]})}),owner=ownerWith(provider),p=pairFor(owner,`bad.${name}`,{id:'A',rev:'1'},{id:'B',rev:'1'}),r=owner.comparePair(p);assert(r.state==='ERROR'&&/FIELD_VALUE_NON_DETERMINISTIC/.test(r.reason)&&r.receipt.published===false);return r.reason;});
  }
  test('values.plain-object-key-order-is-deterministic',()=>{const provider=genericProvider({providerId:'plain.order',resolve:ref=>({state:'RESOLVED',objectId:ref.id,revisionId:ref.rev,schemaVersion:'generic/1',fields:[{path:'x',label:'X',type:'json',present:true,value:ref.id==='A'?{a:1,b:2}:{b:2,a:1},provenanceRefs:[]}],provenanceRefs:[]})}),owner=ownerWith(provider),p=pairFor(owner,'plain.order',{id:'A',rev:'1'},{id:'B',rev:'1'}),r=owner.comparePair(p);assert(r.state==='EXACT'&&r.differences.length===0);});
  test('values.negative-zero-distinct-from-zero',()=>{const provider=genericProvider({providerId:'zero.sign',resolve:ref=>({state:'RESOLVED',objectId:ref.id,revisionId:ref.rev,schemaVersion:'generic/1',fields:[{path:'x',label:'X',type:'number',present:true,value:ref.id==='A'?-0:0,provenanceRefs:[]}],provenanceRefs:[]})}),owner=ownerWith(provider),p=pairFor(owner,'zero.sign',{id:'A',rev:'1'},{id:'B',rev:'1'}),r=owner.comparePair(p);assert(r.state==='DIFFERENT'&&r.differences.length===1);});
  test('compatibility.comparator-version-drift-rejected',()=>{const provider=genericProvider({providerId:'compat.drift',preflightCompatibility:()=>({compatible:true,comparatorVersion:'evil/2'})}),owner=ownerWith(provider),p=pairFor(owner,'compat.drift',{id:'A',rev:'1'},{id:'B',rev:'1'}),r=owner.comparePair(p);assert(r.state==='ERROR'&&/COMPATIBILITY_COMPARATOR_VERSION_DRIFT/.test(r.reason));});

  const pass=tests.filter(t=>t.status==='PASS').length,fail=tests.length-pass;
  return {suite:'E17_ANALYTICAL_COMPARE_BOUNDED_CORRECTION',total:tests.length,pass,fail,tests};
}
