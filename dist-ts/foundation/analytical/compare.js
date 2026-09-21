import {ActionAvailabilityCore} from '../models.js';
import {ANALYTICAL_PROVIDER_CONTRACT,analyticalCanonicalValueToken,canonicalAnalyticalIdentityKey,validateAnalyticalProvider} from '../contracts/analysis-provider.js';

const clone=value=>value===undefined?undefined:structuredClone(value);
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
const stable=value=>value===undefined?'absent:undefined':analyticalCanonicalValueToken(value,'ANALYTICAL_COMPARE_VALUE_NON_DETERMINISTIC');
const normalizeFilter=value=>String(value||'').trim().toLocaleLowerCase('en-US');
const requiredText=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value;};

export const ANALYTICAL_COMPARE_OWNER=Object.freeze({
  id:'AnalyticalCompareOwner',
  token:'AnalyticalCompare',
  semanticCore:'SC-032 / AnalyticalWorkbenchCore',
  providerContract:ANALYTICAL_PROVIDER_CONTRACT,
  authority:'REUSABLE_COMPARE_INSPECTION_MECHANIC_ONLY'
});
export const ANALYTICAL_COMPARE_RESULT_STATES=Object.freeze(['EXACT','DIFFERENT','INCOMPATIBLE','MISSING_LEFT','MISSING_RIGHT','MISSING_BOTH','ERROR']);
export const ANALYTICAL_DIFFERENCE_KINDS=Object.freeze(['ADDED','REMOVED','CHANGED']);

const policyState={ordering:'PATH_ASC',revision:1};
export function analyticalComparePolicy(){return Object.freeze({ordering:policyState.ordering,revision:`AC-POLICY-${policyState.revision}`});}
export function setAnalyticalCompareOrdering(ordering){
  if(!['PATH_ASC','LABEL_DESC','KIND_THEN_PATH'].includes(ordering))throw Error('ANALYTICAL_COMPARE_ORDERING_INVALID');
  const previous=policyState.ordering;
  policyState.ordering=ordering;policyState.revision+=1;
  let reverted=false;
  return Object.freeze({previous,current:ordering,revert(){if(!reverted){policyState.ordering=previous;policyState.revision+=1;reverted=true;}return policyState.ordering;}});
}

function pairIdFor(descriptor,leftKey,rightKey){
  return canonicalAnalyticalIdentityKey('analytical-compare-pair',[descriptor.providerId,leftKey,rightKey,descriptor.comparatorVersion]);
}

function sortDifferences(items){
  const mode=policyState.ordering,kindOrder={ADDED:0,REMOVED:1,CHANGED:2};
  const sorted=[...items].sort((a,b)=>{
    if(mode==='LABEL_DESC')return b.label.localeCompare(a.label,'en')||a.path.localeCompare(b.path,'en');
    if(mode==='KIND_THEN_PATH')return kindOrder[a.kind]-kindOrder[b.kind]||a.path.localeCompare(b.path,'en');
    return a.path.localeCompare(b.path,'en')||a.kind.localeCompare(b.kind,'en');
  });
  return sorted.map((item,index)=>deepFreeze({...item,sortKey:`${String(index).padStart(6,'0')}:${item.path}`}));
}

function deriveDifferences(left,right){
  const leftFields=new Map(left.fields.map(field=>[field.path,field])),rightFields=new Map(right.fields.map(field=>[field.path,field])),paths=[...new Set([...leftFields.keys(),...rightFields.keys()])];
  const diffs=[];
  for(const path of paths){
    const l=leftFields.get(path),r=rightFields.get(path);
    if(l&&r&&(l.type!==r.type||l.label!==r.label))throw Error(`ANALYTICAL_FIELD_SCHEMA_CONTRADICTION:${path}`);
    const lp=!!l?.present,rp=!!r?.present;
    if(!lp&&!rp)continue;
    const shared={path,label:(r||l).label,type:(r||l).type,leftPresent:lp,rightPresent:rp,leftValue:lp?clone(l.value):undefined,rightValue:rp?clone(r.value):undefined,leftProvenanceRefs:clone(l?.provenanceRefs||[]),rightProvenanceRefs:clone(r?.provenanceRefs||[])};
    if(!lp&&rp)diffs.push({...shared,kind:'ADDED'});
    else if(lp&&!rp)diffs.push({...shared,kind:'REMOVED'});
    else if(stable(l.value)!==stable(r.value))diffs.push({...shared,kind:'CHANGED'});
  }
  return sortDifferences(diffs);
}

function receipt(pair,provider,state,extra={}){
  const descriptor=provider.descriptor();
  return deepFreeze({
    owner:ANALYTICAL_COMPARE_OWNER.id,
    ownerToken:ANALYTICAL_COMPARE_OWNER.token,
    semanticCore:ANALYTICAL_COMPARE_OWNER.semanticCore,
    providerId:descriptor.providerId,
    domainKind:descriptor.domainKind,
    pairId:pair.pairId,
    comparatorVersion:descriptor.comparatorVersion,
    state,
    policy:analyticalComparePolicy(),
    leftRef:clone(pair.left.ref),rightRef:clone(pair.right.ref),
    ...clone(extra)
  });
}

function errorReceipt(pair,provider,error,suppliedPair){
  const descriptor=provider?.descriptor?.()||{providerId:typeof suppliedPair?.providerId==='string'?suppliedPair.providerId:'UNKNOWN',domainKind:'UNKNOWN',comparatorVersion:'UNKNOWN'};
  return deepFreeze({
    owner:ANALYTICAL_COMPARE_OWNER.id,
    ownerToken:ANALYTICAL_COMPARE_OWNER.token,
    semanticCore:ANALYTICAL_COMPARE_OWNER.semanticCore,
    providerId:descriptor.providerId,
    domainKind:descriptor.domainKind,
    pairId:pair?.pairId||'UNVERIFIED',
    suppliedPairId:typeof suppliedPair?.pairId==='string'?suppliedPair.pairId:null,
    comparatorVersion:descriptor.comparatorVersion,
    state:'ERROR',policy:analyticalComparePolicy(),diffExecuted:false,published:false,
    reason:String(error?.message||error)
  });
}

export class AnalyticalCompareOwner{
  constructor(){
    this.owner=ANALYTICAL_COMPARE_OWNER.id;
    this.ownerToken=ANALYTICAL_COMPARE_OWNER.token;
    this.semanticCore=ANALYTICAL_COMPARE_OWNER.semanticCore;
    this.providers=new Map();
    this.sessions=new Map();
    this.actionAvailability=new ActionAvailabilityCore();
    this.actionAvailability.register('analytical.compare',{selection:{exact:2},activeModes:['review'],hideOnSelectionFailure:false});
  }
  providerIds(){return Object.freeze([...this.providers.keys()].sort());}
  registerProvider(provider){
    const before=this.providerIds(),descriptor=validateAnalyticalProvider(provider);
    if(this.providers.has(descriptor.providerId))throw Error(`ANALYTICAL_PROVIDER_DUPLICATE_ID:${descriptor.providerId}`);
    if(this.providers.size!==before.length)throw Error('ANALYTICAL_PROVIDER_REGISTRY_RACE');
    this.providers.set(descriptor.providerId,provider);
    return deepFreeze({status:'REGISTERED',owner:this.owner,providerId:descriptor.providerId,domainKind:descriptor.domainKind,registrySize:this.providers.size});
  }
  provider(providerId){const provider=this.providers.get(providerId);if(!provider)throw Error(`ANALYTICAL_PROVIDER_UNKNOWN:${providerId}`);return provider;}
  availability(leftProviderId,rightProviderId){
    const leftKnown=this.providers.has(leftProviderId),rightKnown=this.providers.has(rightProviderId),same=leftProviderId===rightProviderId;
    const core=this.actionAvailability.evaluate('analytical.compare',{selection:['LEFT','RIGHT'],entities:[{id:'LEFT',kind:'analytical-ref'},{id:'RIGHT',kind:'analytical-ref'}],activeMode:'review',domainCapability:leftKnown&&rightKnown&&same});
    if(!leftKnown||!rightKnown)return deepFreeze({...core,enabled:false,code:'PROVIDER_UNAVAILABLE',reason:'Both exact comparison providers must be registered.'});
    if(!same)return deepFreeze({...core,enabled:false,code:'CROSS_PROVIDER_COMPARISON_REJECTED',reason:'Cross-provider comparison requires an explicit compatibility contract; none is declared.'});
    return deepFreeze({...core,enabled:true,code:'AVAILABLE',reason:''});
  }
  _buildPair(provider,leftRefInput,rightRefInput){
    const descriptor=validateAnalyticalProvider(provider),leftRef=provider.validateExactRef(leftRefInput),rightRef=provider.validateExactRef(rightRefInput),leftKey=provider.refKey(leftRef),rightKey=provider.refKey(rightRef),pairId=pairIdFor(descriptor,leftKey,rightKey);
    return deepFreeze({pairId,providerId:descriptor.providerId,domainKind:descriptor.domainKind,comparatorVersion:descriptor.comparatorVersion,left:{providerId:descriptor.providerId,key:leftKey,ref:clone(leftRef)},right:{providerId:descriptor.providerId,key:rightKey,ref:clone(rightRef)},pinned:true,mutable:false});
  }
  _canonicalizeSuppliedPair(pair){
    if(!pair||typeof pair!=='object'||Array.isArray(pair))throw Error('ANALYTICAL_PAIR_REQUIRED');
    if(!pair.left||!pair.right)throw Error('ANALYTICAL_PAIR_SIDES_REQUIRED');
    const providerId=requiredText(pair.providerId,'ANALYTICAL_PAIR_PROVIDER_REQUIRED');
    if(pair.left?.providerId!==pair.right?.providerId||providerId!==pair.left?.providerId)throw Error('ANALYTICAL_PAIR_PROVIDER_MISMATCH');
    const provider=this.provider(providerId),descriptor=validateAnalyticalProvider(provider);
    if(pair.domainKind!==descriptor.domainKind)throw Error(`ANALYTICAL_PAIR_DOMAIN_KIND_DRIFT:${pair.domainKind}`);
    if(pair.comparatorVersion!==descriptor.comparatorVersion)throw Error(`ANALYTICAL_PAIR_COMPARATOR_VERSION_DRIFT:${pair.comparatorVersion}`);
    if(pair.pinned!==true||pair.mutable!==false)throw Error('ANALYTICAL_PAIR_PINNED_IMMUTABLE_REQUIRED');
    const canonical=this._buildPair(provider,pair.left.ref,pair.right.ref);
    if(pair.left.key!==canonical.left.key)throw Error('ANALYTICAL_PAIR_LEFT_KEY_DRIFT');
    if(pair.right.key!==canonical.right.key)throw Error('ANALYTICAL_PAIR_RIGHT_KEY_DRIFT');
    if(pair.pairId!==canonical.pairId)throw Error('ANALYTICAL_PAIR_ID_DRIFT');
    return {provider,canonical};
  }
  createPair({left,right}){
    if(!left||!right)throw Error('ANALYTICAL_PAIR_SIDES_REQUIRED');
    const availability=this.availability(left.providerId,right.providerId);
    if(!availability.enabled)throw Error(`${availability.code}:${availability.reason}`);
    const provider=this.provider(left.providerId);
    return this._buildPair(provider,left.ref,right.ref);
  }
  comparePair(pair){
    let provider,canonicalPair;
    try{
      const canonicalized=this._canonicalizeSuppliedPair(pair);provider=canonicalized.provider;canonicalPair=canonicalized.canonical;
      const left=provider.resolve(canonicalPair.left.ref),right=provider.resolve(canonicalPair.right.ref);
      if(left.state!=='RESOLVED'||right.state!=='RESOLVED'){
        const state=left.state!=='RESOLVED'&&right.state!=='RESOLVED'?'MISSING_BOTH':left.state!=='RESOLVED'?'MISSING_LEFT':'MISSING_RIGHT';
        const result={state,pair:clone(canonicalPair),differences:[],leftResolution:clone(left),rightResolution:clone(right),provenance:{left:clone(left.provenanceRefs||[]),right:clone(right.provenanceRefs||[])},successorHints:{left:clone(left.successorHint||null),right:clone(right.successorHint||null)},providerContext:{left:clone(left.domainContext||null),right:clone(right.domainContext||null)},receipt:receipt(canonicalPair,provider,state,{diffExecuted:false,published:true})};
        return deepFreeze(result);
      }
      const compatibility=provider.preflightCompatibility(left,right,canonicalPair);
      if(!compatibility.compatible){
        const state='INCOMPATIBLE',result={state,pair:clone(canonicalPair),differences:[],leftResolution:clone(left),rightResolution:clone(right),compatibility:clone(compatibility),provenance:{left:clone(left.provenanceRefs||[]),right:clone(right.provenanceRefs||[])},successorHints:{left:clone(left.successorHint||null),right:clone(right.successorHint||null)},providerContext:{left:clone(left.domainContext||null),right:clone(right.domainContext||null)},receipt:receipt(canonicalPair,provider,state,{diffExecuted:false,published:true,reason:compatibility.reason,reasonCode:compatibility.reasonCode})};
        return deepFreeze(result);
      }
      const differences=deriveDifferences(left,right),state=differences.length?'DIFFERENT':'EXACT';
      return deepFreeze({state,pair:clone(canonicalPair),differences,leftResolution:clone(left),rightResolution:clone(right),compatibility:clone(compatibility),provenance:{left:clone(left.provenanceRefs||[]),right:clone(right.provenanceRefs||[])},successorHints:{left:clone(left.successorHint||null),right:clone(right.successorHint||null)},providerContext:{left:clone(left.domainContext||null),right:clone(right.domainContext||null)},receipt:receipt(canonicalPair,provider,state,{diffExecuted:true,published:true,differenceCount:differences.length})});
    }catch(error){
      const trustedProvider=provider||this.providers.get(pair?.providerId);
      return deepFreeze({state:'ERROR',pair:clone(canonicalPair||null),differences:[],reason:String(error?.message||error),receipt:errorReceipt(canonicalPair,trustedProvider,error,pair)});
    }
  }
  openSession(sessionId,pair){
    if(typeof sessionId!=='string'||!sessionId.trim())throw Error('ANALYTICAL_SESSION_ID_REQUIRED');
    if(this.sessions.has(sessionId))throw Error(`ANALYTICAL_SESSION_DUPLICATE:${sessionId}`);
    const outcome=this.comparePair(pair);
    if(outcome.state==='ERROR')return outcome;
    this.sessions.set(sessionId,{sessionId,pair:outcome.pair,baseResult:outcome,filter:'',kindFilter:'ALL',focusedPath:outcome.differences[0]?.path||null});
    return outcome;
  }
  replaceSessionPair(sessionId,pair){
    const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);
    const outcome=this.comparePair(pair);
    if(outcome.state==='ERROR')return outcome;
    session.pair=outcome.pair;session.baseResult=outcome;session.filter='';session.kindFilter='ALL';session.focusedPath=outcome.differences[0]?.path||null;
    return outcome;
  }
  sessionState(sessionId){
    const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);
    return deepFreeze({sessionId:session.sessionId,pair:clone(session.pair),baseResult:clone(session.baseResult),filter:session.filter,kindFilter:session.kindFilter,focusedPath:session.focusedPath});
  }
  setFilter(sessionId,value){const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);session.filter=String(value||'');return this.projectSession(sessionId);}
  setDifferenceKindFilter(sessionId,kind='ALL'){const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);if(kind!=='ALL'&&!ANALYTICAL_DIFFERENCE_KINDS.includes(kind))throw Error(`ANALYTICAL_DIFFERENCE_KIND_FILTER_INVALID:${kind}`);session.kindFilter=kind;return this.projectSession(sessionId);}
  clearFocus(sessionId){const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);session.focusedPath=null;return this.projectSession(sessionId);}
  focusDifference(sessionId,path){const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);const available=this.projectSession(sessionId).differences;if(path!==null&&!available.some(item=>item.path===path))throw Error('ANALYTICAL_DIFFERENCE_NOT_VISIBLE');session.focusedPath=path;return this.projectSession(sessionId);}
  moveFocus(sessionId,delta){
    const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);
    const projected=this.projectSession(sessionId),rows=projected.differences;if(!rows.length){session.focusedPath=null;return projected;}
    const index=Math.max(0,rows.findIndex(row=>row.path===session.focusedPath)),next=Math.max(0,Math.min(rows.length-1,index+delta));session.focusedPath=rows[next].path;return this.projectSession(sessionId);
  }
  inspectDifference(sessionId,path){
    const projection=this.projectSession(sessionId),item=projection.baseResult.differences.find(row=>row.path===path);
    if(!item)throw Error('ANALYTICAL_DIFFERENCE_UNKNOWN');
    return deepFreeze({owner:this.owner,sessionId,path,difference:clone(item),pairId:projection.pair.pairId,providerId:projection.pair.providerId});
  }
  projectSession(sessionId){
    const session=this.sessions.get(sessionId);if(!session)throw Error(`ANALYTICAL_SESSION_UNKNOWN:${sessionId}`);
    const q=normalizeFilter(session.filter),base=session.baseResult,kindFilter=session.kindFilter||'ALL';
    const byKind=kindFilter==='ALL'?base.differences:base.differences.filter(row=>row.kind===kindFilter);
    const differences=!q?byKind:byKind.filter(row=>[row.path,row.label,row.kind,row.type,stable(row.leftValue),stable(row.rightValue)].some(value=>String(value||'').toLocaleLowerCase('en-US').includes(q)));
    const focused=differences.some(row=>row.path===session.focusedPath)?session.focusedPath:(session.focusedPath===null?null:(differences[0]?.path||null));
    const counts=ANALYTICAL_DIFFERENCE_KINDS.reduce((acc,kind)=>({...acc,[kind]:base.differences.filter(row=>row.kind===kind).length}),{});
    const identity=deepFreeze({providerId:session.pair.providerId,domainKind:session.pair.domainKind,pairId:session.pair.pairId,comparatorVersion:session.pair.comparatorVersion,leftKey:session.pair.left.key,rightKey:session.pair.right.key,pinned:session.pair.pinned,mutable:session.pair.mutable});
    return deepFreeze({sessionId,pair:clone(session.pair),identity,state:base.state,filter:session.filter,kindFilter,counts,totalDifferences:base.differences.length,visibleDifferences:differences.length,focusedPath:focused,differences:clone(differences),baseResult:clone(base),provenance:clone(base.provenance||{left:[],right:[]}),receipt:clone(base.receipt)});
  }
}
