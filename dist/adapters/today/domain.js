const clone=value=>value===undefined?undefined:structuredClone(value);
const frozen=value=>Object.freeze(value);

export const TODAY_PROJECTION_OWNER='TodayProjectionDomainAdapter';
export const TODAY_PROJECTION_STATES=Object.freeze(['FETCHING','AVAILABLE_DATA','AVAILABLE_EMPTY','PARTIAL','STALE','UNAVAILABLE','ERROR']);
export const TODAY_CONTINUATION_STATES=Object.freeze(['RESOLVABLE','TARGET_REMOVED','TARGET_FORBIDDEN']);
export const TODAY_PROJECTION_KINDS=Object.freeze(['CONTINUE_SESSION','RECOMMENDATION','ATTENTION','RECENT_CONTEXT','PROGRESS']);
const KIND_ALIASES=Object.freeze({CONTINUATION:'CONTINUE_SESSION',CURRENT_SESSION:'CONTINUE_SESSION',NEXT_ACTION:'RECOMMENDATION',RECOMMENDED_ACTION:'RECOMMENDATION',ATTENTION_ITEM:'ATTENTION',RECENT:'RECENT_CONTEXT',PROGRESS_PROJECTION:'PROGRESS'});
const observedAtValue=value=>value?String(value):null;
const normalizeState=value=>{const raw=String(value||'').toUpperCase();return TODAY_PROJECTION_STATES.includes(raw)?raw:null;};
const normalizeKind=value=>{const raw=String(value||'').toUpperCase();const mapped=KIND_ALIASES[raw]||raw;return TODAY_PROJECTION_KINDS.includes(mapped)?mapped:null;};
const normalizeContinuationState=value=>{const raw=String(value||'').toUpperCase();return TODAY_CONTINUATION_STATES.includes(raw)?raw:null;};
const descriptorFor=value=>{try{return typeof value?.descriptor==='function'?(value.descriptor()||{}):{}}catch{return {}}};
const authorityFor=value=>String(descriptorFor(value)?.authority||'').toUpperCase();
const isFixtureAuthority=value=>/LOCAL_(DEV_)?ACCEPTANCE|FIXTURE|DEMO/.test(authorityFor(value));
const normalizeProvider=(provider,{allowFixtureProviders=false}={})=>provider&&typeof provider.read==='function'&&(allowFixtureProviders||!isFixtureAuthority(provider))?provider:null;
const normalizeResolver=(resolver,{allowFixtureResolvers=false}={})=>resolver&&typeof resolver.resolve==='function'&&(allowFixtureResolvers||!isFixtureAuthority(resolver))?resolver:null;

const aggregateState=sources=>{
  const states=sources.map(source=>source.state);
  if(!states.length||states.every(state=>state==='UNAVAILABLE'))return 'UNAVAILABLE';
  if(states.every(state=>state==='ERROR'))return 'ERROR';
  if(states.every(state=>state==='FETCHING'))return 'FETCHING';
  if(states.every(state=>state==='STALE'))return 'STALE';
  if(states.every(state=>state==='AVAILABLE_EMPTY'))return 'AVAILABLE_EMPTY';
  if(states.every(state=>state==='AVAILABLE_DATA'||state==='AVAILABLE_EMPTY'))return states.includes('AVAILABLE_DATA')?'AVAILABLE_DATA':'AVAILABLE_EMPTY';
  return 'PARTIAL';
};

/**
 * Surface-owned, read-side orchestration adapter. It projects provider observations and emits
 * handoff instructions only. It never becomes a canonical progress/Mastery/recommendation store.
 */
export class TodayProjectionDomainAdapter{
  constructor({providers=[],actorId='local-user',continuationResolver=null,allowFixtureProviders=false,allowFixtureResolvers=false}={}){
    this.owner=TODAY_PROJECTION_OWNER;
    this.actorId=String(actorId||'local-user');
    const candidates=Array.isArray(providers)?providers:[];
    this.providers=candidates.map(provider=>normalizeProvider(provider,{allowFixtureProviders})).filter(Boolean);
    this.rejectedProviderIds=candidates.filter(provider=>!normalizeProvider(provider,{allowFixtureProviders})).map(provider=>String(provider?.id||descriptorFor(provider)?.providerId||'provider'));
    this.continuationResolver=normalizeResolver(continuationResolver,{allowFixtureResolvers});
    this.rejectedContinuationResolver=!!continuationResolver&&!this.continuationResolver;
    this.filter='ALL';
    this.lastProjection=null;
    this.lastSuccessfulObservation=null;
    this.lastSuccessfulByProvider=new Map();
    this.selectedRecommendation=null;
    this.errorSequence=0;
  }
  descriptor(){return frozen({
    owner:this.owner,actorId:this.actorId,providerCount:this.providers.length,rejectedProviderIds:clone(this.rejectedProviderIds),canonicalWrites:false,masteryWrites:false,
    recommendationJudgment:false,accessDecisionOwner:false,states:TODAY_PROJECTION_STATES,continuationStates:TODAY_CONTINUATION_STATES,kinds:TODAY_PROJECTION_KINDS,
    providerBoundary:'READ_SIDE_OBSERVATION_ONLY',continuationResolverBound:!!this.continuationResolver,rejectedContinuationResolver:this.rejectedContinuationResolver
  });}
  setFilter(value='ALL'){
    const next=String(value||'ALL').toUpperCase();
    if(next!=='ALL'&&!TODAY_PROJECTION_KINDS.includes(next))throw Error('TODAY_FILTER_KIND_UNRECOGNIZED:'+next);
    this.filter=next;return this.filter;
  }
  _unavailable(providerId='today.current-provider',reason='TODAY_PROVIDER_UNBOUND'){return {providerId,state:'UNAVAILABLE',reason,observedAt:null,errorRef:null,items:[]};}
  _errorSource(providerId='provider',reason='TODAY_PROVIDER_READ_FAILED',observedAt=null,errorRef=null){
    this.errorSequence+=1;
    return {providerId:String(providerId||'provider'),state:'ERROR',reason:String(reason||'TODAY_PROVIDER_READ_FAILED'),observedAt:observedAtValue(observedAt),errorRef:String(errorRef||`today-error:${this.errorSequence}:${providerId||'provider'}`),items:[]};
  }
  _read(provider){
    const providerId=String(provider?.id||descriptorFor(provider)?.providerId||'provider');
    try{
      const raw=provider.read({actorId:this.actorId});
      if(raw&&typeof raw.then==='function')return this._errorSource(providerId,'TODAY_ASYNC_PROVIDER_REQUIRES_REFRESH_ASYNC');
      const state=normalizeState(raw?.state);
      if(!raw||!state)return this._errorSource(providerId,'TODAY_PROVIDER_STATE_INVALID',raw?.observedAt,raw?.errorRef);
      if(state==='ERROR')return this._errorSource(raw.providerId||providerId,raw.reason||'TODAY_PROVIDER_REPORTED_ERROR',raw.observedAt,raw.errorRef);
      if(state==='STALE'&&!observedAtValue(raw.observedAt))return this._errorSource(raw.providerId||providerId,'TODAY_STALE_OBSERVED_AT_REQUIRED',null,raw.errorRef);
      const allowItems=['AVAILABLE_DATA','PARTIAL','STALE'].includes(state);
      const items=allowItems&&Array.isArray(raw.items)?clone(raw.items):[];
      return {providerId:String(raw.providerId||providerId),state,reason:String(raw.reason||''),observedAt:observedAtValue(raw.observedAt),errorRef:raw.errorRef?String(raw.errorRef):null,items};
    }catch{return this._errorSource(providerId);}
  }
  _normalizeItem(source,item){
    const id=String(item?.id||'').trim(),kind=normalizeKind(item?.kind);
    if(!id||!kind)return null;
    const continuation=item.continuation?{
      destination:String(item.continuation.destination||''),objectId:String(item.continuation.objectId||''),bookmark:clone(item.continuation.bookmark??null),
      exists:item.continuation.exists===true,readable:item.continuation.readable===true,targetState:String(item.continuation.targetState||'').toUpperCase()
    }:null;
    const recommendation=item.recommendation?{
      sourceRef:String(item.recommendation.sourceRef||''),reasonCode:String(item.recommendation.reasonCode||''),rationale:String(item.recommendation.rationale||''),
      version:String(item.recommendation.version||item.recommendation.revision||''),observedAt:observedAtValue(item.recommendation.observedAt||source.observedAt),
      providerId:source.providerId
    }:null;
    return {...clone(item),id,kind,continuation,recommendation,providerId:source.providerId,providerState:source.state,sourceObservedAt:source.observedAt};
  }
  _filterItems(items){return this.filter==='ALL'?items:items.filter(item=>item.kind===this.filter);}
  project(){
    const sources=this.providers.length?this.providers.map(provider=>this._read(provider)):[this._unavailable(this.rejectedProviderIds[0]||'today.current-provider',this.rejectedProviderIds.length?'TODAY_FIXTURE_PROVIDER_NOT_ADMITTED':'TODAY_PROVIDER_UNBOUND')];
    const freshItems=[],retainedItems=[],retainedSources=[];
    for(const source of sources){
      const normalized=[];
      for(const raw of source.items){const item=this._normalizeItem(source,raw);if(item){normalized.push(item);freshItems.push(item);}}
      if(['AVAILABLE_DATA','AVAILABLE_EMPTY','PARTIAL','STALE'].includes(source.state))this.lastSuccessfulByProvider.set(source.providerId,{source:clone(source),items:clone(normalized)});
      if(source.state==='ERROR'&&this.lastSuccessfulByProvider.has(source.providerId)){
        const prior=this.lastSuccessfulByProvider.get(source.providerId);
        retainedSources.push(clone(prior.source));
        for(const item of prior.items)retainedItems.push({...clone(item),retainedStale:true,retainedBecause:'PROVIDER_ERROR'});
      }
    }
    const state=aggregateState(sources);
    const projectionVersion=`providers:${sources.map(s=>`${s.providerId}:${s.observedAt||s.state}:${s.errorRef||''}`).join('|')}`;
    const effectiveItems=[...freshItems,...retainedItems],items=this._filterItems(effectiveItems),sourceTotalCount=effectiveItems.length;
    const filteredEmpty=this.filter!=='ALL'&&sourceTotalCount>0&&items.length===0;
    const retaining=retainedItems.length>0;
    const projection={
      owner:this.owner,projectionId:`today:${this.actorId}`,actorId:this.actorId,projectionVersion,
      state,filter:this.filter,viewState:filteredEmpty?'FILTERED_EMPTY':state,sourceTotalCount,visibleCount:items.length,filteredEmpty,
      items,sources,retainedFromLastSuccess:retaining,retainedProjectionVersion:retaining?this.lastSuccessfulObservation?.projectionVersion||null:null,
      retainedSources,retainedSourceProviderIds:retainedSources.map(source=>source.providerId),errorRefs:sources.filter(source=>source.state==='ERROR'&&source.errorRef).map(source=>source.errorRef),
      canonicalWrites:false,progress:'PROJECTED_NOT_OWNED',mastery:'NOT_INFERRED__W04_OWNED',recommendationAuthority:'SOURCE_VERSION_BOUND_PROJECTION_ONLY',
      accessAuthority:'NOT_OWNED_BY_TODAY'
    };
    if(['AVAILABLE_DATA','AVAILABLE_EMPTY','PARTIAL','STALE'].includes(state))this.lastSuccessfulObservation={items:clone(freshItems),sources:clone(sources),projectionVersion};
    this.lastProjection=clone(projection);
    if(this.selectedRecommendation&&!items.some(item=>item.id===this.selectedRecommendation.itemId&&item.recommendation?.version===this.selectedRecommendation.version&&item.recommendation?.sourceRef===this.selectedRecommendation.sourceRef&&item.providerId===this.selectedRecommendation.providerId))this.selectedRecommendation=null;
    return frozen(projection);
  }
  refresh(){return this.project();}
  selectRecommendation(itemId,version=''){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId&&entry.kind==='RECOMMENDATION');
    const recommendation=item?.recommendation,exact=String(version||recommendation?.version||'');
    if(!recommendation||!exact||recommendation.version!==exact||!recommendation.sourceRef||!recommendation.providerId||!recommendation.observedAt){this.selectedRecommendation=null;return {ok:false,status:'RECOMMENDATION_PROVENANCE_UNRESOLVED',mutated:false};}
    this.selectedRecommendation={itemId:item.id,version:exact,sourceRef:recommendation.sourceRef,providerId:recommendation.providerId,observedAt:recommendation.observedAt};
    return {ok:true,status:'RECOMMENDATION_SELECTED',...clone(this.selectedRecommendation),mutated:false};
  }
  _resolveContinuation(item){
    const continuation=item?.continuation;
    if(!item||!continuation)return {enabled:false,reason:'Continuation is unavailable',code:'CONTINUATION_UNAVAILABLE'};
    if(!continuation.destination||!continuation.objectId)return {enabled:false,reason:'Continuation target identity is incomplete',code:'CONTINUATION_INVALID'};
    if(!this.continuationResolver)return {enabled:false,reason:'No admitted current continuation resolver is bound',code:this.rejectedContinuationResolver?'CONTINUATION_FIXTURE_RESOLVER_NOT_ADMITTED':'CONTINUATION_RESOLVER_UNBOUND'};
    let raw;
    try{raw=this.continuationResolver.resolve({actorId:this.actorId,itemId:item.id,providerId:item.providerId,destination:continuation.destination,objectId:continuation.objectId,bookmark:clone(continuation.bookmark),projectionVersion:this.lastProjection?.projectionVersion||null});}
    catch{return {enabled:false,reason:'Continuation target resolution failed',code:'CONTINUATION_RESOLUTION_ERROR'};}
    if(raw&&typeof raw.then==='function')return {enabled:false,reason:'Asynchronous continuation resolution is not available in this boundary',code:'CONTINUATION_ASYNC_RESOLUTION_UNSUPPORTED'};
    const state=normalizeContinuationState(raw?.state);
    if(!state)return {enabled:false,reason:'Continuation target resolution is invalid',code:'CONTINUATION_TARGET_UNRESOLVED'};
    if(String(raw?.destination||'')!==continuation.destination||String(raw?.objectId||'')!==continuation.objectId)return {enabled:false,reason:'Continuation resolution does not bind the exact requested target',code:'CONTINUATION_TARGET_MISMATCH'};
    const resolution={state,destination:continuation.destination,objectId:continuation.objectId,providerId:String(raw?.providerId||descriptorFor(this.continuationResolver)?.providerId||''),observedAt:observedAtValue(raw?.observedAt),resolutionRef:String(raw?.resolutionRef||'')};
    if(!resolution.providerId||!resolution.observedAt||!resolution.resolutionRef)return {enabled:false,reason:'Continuation resolution proof is incomplete',code:'CONTINUATION_RESOLUTION_PROOF_INCOMPLETE',resolution};
    if(state==='TARGET_REMOVED')return {enabled:false,reason:'Continuation target was removed',code:'CONTINUATION_TARGET_REMOVED',resolution};
    if(state==='TARGET_FORBIDDEN')return {enabled:false,reason:'Continuation target is not readable in the current context',code:'CONTINUATION_TARGET_FORBIDDEN',resolution};
    return {enabled:true,reason:'',code:'AVAILABLE',resolution};
  }
  canResume(itemId){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId);
    return frozen(this._resolveContinuation(item));
  }
  resume(itemId){
    const projection=this.lastProjection||this.project(),availability=this.canResume(itemId),item=projection.items.find(entry=>entry.id===itemId);
    if(!availability.enabled)return {ok:false,status:availability.code,mutated:false,progressMutation:false,masteryMutation:false,accessDecisionMade:false};
    const continuation=clone(item.continuation);
    return {
      ok:true,status:'CONTINUATION_READY',mutated:false,continuation,resolution:clone(availability.resolution),
      returnBookmark:continuation.bookmark||{surface:'today',projectionVersion:projection.projectionVersion,itemId:item.id},
      progressMutation:false,masteryMutation:false,accessDecisionMade:false
    };
  }
  canExplain(itemId,version=''){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId&&entry.kind==='RECOMMENDATION'),recommendation=item?.recommendation;
    if(!recommendation)return {enabled:false,reason:'Recommendation rationale is unavailable',code:'RECOMMENDATION_RATIONALE_UNAVAILABLE'};
    const selected=this.selectedRecommendation;
    if(!selected||selected.itemId!==itemId)return {enabled:false,reason:'Select the exact recommendation before requesting rationale',code:'RECOMMENDATION_NOT_SELECTED'};
    const exact=String(version||selected.version||'');
    if(!exact||selected.version!==exact||recommendation.version!==exact)return {enabled:false,reason:'Exact recommendation version is not selected or no longer resolves',code:'RECOMMENDATION_VERSION_UNRESOLVED'};
    if(!recommendation.sourceRef||!recommendation.providerId||!recommendation.observedAt||(!recommendation.reasonCode&&!recommendation.rationale))return {enabled:false,reason:'Source-backed rationale is unavailable',code:'RECOMMENDATION_RATIONALE_UNAVAILABLE'};
    if(selected.sourceRef!==recommendation.sourceRef||selected.providerId!==recommendation.providerId||selected.observedAt!==recommendation.observedAt)return {enabled:false,reason:'Recommendation provenance no longer matches the selected version',code:'RECOMMENDATION_PROVENANCE_MISMATCH'};
    return {enabled:true,reason:'',code:'AVAILABLE'};
  }
  why(itemId,version=''){
    const projection=this.lastProjection||this.project(),availability=this.canExplain(itemId,version),item=projection.items.find(entry=>entry.id===itemId);
    if(!availability.enabled)return {ok:false,status:availability.code,mutated:false,unlockLogicFabricated:false,accessDecisionMade:false};
    return {ok:true,status:'RATIONALE_PROJECTION',mutated:false,recommendation:clone(item.recommendation),sourceBinding:{providerId:item.providerId,sourceRef:item.recommendation.sourceRef,version:item.recommendation.version,observedAt:item.recommendation.observedAt},unlockLogicFabricated:false,accessDecisionMade:false};
  }
}
