const clone=value=>value===undefined?undefined:structuredClone(value);
const frozen=value=>Object.freeze(value);

export const TODAY_PROJECTION_OWNER='TodayProjectionDomainAdapter';
export const TODAY_PROJECTION_STATES=Object.freeze(['OBSERVED_DATA','OBSERVED_EMPTY','PARTIAL','STALE','UNAVAILABLE','UNOBSERVED','FAILED']);
export const TODAY_PROJECTION_KINDS=Object.freeze(['CONTINUE_SESSION','RECOMMENDATION','ATTENTION','RECENT_CONTEXT','PROGRESS']);
const LEGACY_STATE_MAP=Object.freeze({AVAILABLE_DATA:'OBSERVED_DATA',AVAILABLE_EMPTY:'OBSERVED_EMPTY',ERROR:'FAILED'});
const KIND_ALIASES=Object.freeze({CONTINUATION:'CONTINUE_SESSION',CURRENT_SESSION:'CONTINUE_SESSION',NEXT_ACTION:'RECOMMENDATION',RECOMMENDED_ACTION:'RECOMMENDATION',ATTENTION_ITEM:'ATTENTION',RECENT:'RECENT_CONTEXT',PROGRESS_PROJECTION:'PROGRESS'});
const normalizeProvider=provider=>provider&&typeof provider.read==='function'?provider:null;
const normalizeState=value=>{const raw=String(value||'').toUpperCase();return TODAY_PROJECTION_STATES.includes(raw)?raw:LEGACY_STATE_MAP[raw]||null;};
const normalizeKind=value=>{const raw=String(value||'').toUpperCase();const mapped=KIND_ALIASES[raw]||raw;return TODAY_PROJECTION_KINDS.includes(mapped)?mapped:null;};
const observedAtValue=value=>value?String(value):null;

const aggregateState=sources=>{
  const states=sources.map(source=>source.state);
  if(states.every(state=>state==='UNOBSERVED'))return 'UNOBSERVED';
  if(states.every(state=>state==='UNAVAILABLE'))return 'UNAVAILABLE';
  if(states.every(state=>state==='FAILED'))return 'FAILED';
  if(states.every(state=>state==='STALE'))return 'STALE';
  const observed=states.every(state=>state==='OBSERVED_DATA'||state==='OBSERVED_EMPTY');
  if(observed)return states.includes('OBSERVED_DATA')?'OBSERVED_DATA':'OBSERVED_EMPTY';
  return 'PARTIAL';
};

/**
 * Surface-owned, read-side orchestration adapter. It projects provider observations and emits
 * handoff instructions only. It never becomes a canonical progress/Mastery/recommendation store.
 */
export class TodayProjectionDomainAdapter{
  constructor({providers=[],actorId='local-user'}={}){
    this.owner=TODAY_PROJECTION_OWNER;
    this.actorId=String(actorId||'local-user');
    this.providers=providers.map(normalizeProvider).filter(Boolean);
    this.filter='ALL';
    this.lastProjection=null;
    this.selectedRecommendation=null;
  }
  descriptor(){return frozen({
    owner:this.owner,actorId:this.actorId,providerCount:this.providers.length,canonicalWrites:false,masteryWrites:false,
    recommendationJudgment:false,accessDecisionOwner:false,states:TODAY_PROJECTION_STATES,kinds:TODAY_PROJECTION_KINDS,
    providerBoundary:'READ_SIDE_OBSERVATION_ONLY'
  });}
  setFilter(value='ALL'){
    const next=String(value||'ALL').toUpperCase();
    if(next!=='ALL'&&!TODAY_PROJECTION_KINDS.includes(next))throw Error('TODAY_FILTER_KIND_UNRECOGNIZED:'+next);
    this.filter=next;return this.filter;
  }
  _unobserved(providerId='UNBOUND',reason='TODAY_PROJECTION_PROVIDER_UNOBSERVED'){return {providerId,state:'UNOBSERVED',reason,observedAt:null,items:[]};}
  _read(provider){
    try{
      const raw=provider.read({actorId:this.actorId});
      if(raw&&typeof raw.then==='function')throw Error('TODAY_ASYNC_PROVIDER_REQUIRES_REFRESH_ASYNC');
      const state=normalizeState(raw?.state);
      if(!raw||!state)throw Error('TODAY_PROVIDER_STATE_INVALID');
      const items=Array.isArray(raw.items)?clone(raw.items):[];
      return {providerId:String(raw.providerId||provider.id||'provider'),state,reason:String(raw.reason||''),observedAt:observedAtValue(raw.observedAt),items};
    }catch(error){return {providerId:String(provider.id||'provider'),state:'FAILED',reason:String(error?.message||error),observedAt:null,items:[]};}
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
      version:String(item.recommendation.version||item.recommendation.revision||''),observedAt:observedAtValue(item.recommendation.observedAt||source.observedAt)
    }:null;
    return {...clone(item),id,kind,continuation,recommendation,providerId:source.providerId,sourceObservedAt:source.observedAt};
  }
  project(){
    const sources=this.providers.length?this.providers.map(provider=>this._read(provider)):[this._unobserved()];
    const allItems=[];
    for(const source of sources)for(const raw of source.items){const item=this._normalizeItem(source,raw);if(item)allItems.push(item);}
    const state=aggregateState(sources),sourceTotalCount=allItems.length;
    const items=this.filter==='ALL'?allItems:allItems.filter(item=>item.kind===this.filter);
    const filteredEmpty=this.filter!=='ALL'&&sourceTotalCount>0&&items.length===0;
    const projection={
      owner:this.owner,projectionId:`today:${this.actorId}`,actorId:this.actorId,
      projectionVersion:`providers:${sources.map(s=>`${s.providerId}:${s.observedAt||s.state}`).join('|')}`,
      state,filter:this.filter,viewState:filteredEmpty?'FILTERED_EMPTY':state,sourceTotalCount,visibleCount:items.length,filteredEmpty,
      items,sources,canonicalWrites:false,progress:'PROJECTED_NOT_OWNED',mastery:'NOT_INFERRED__W04_OWNED',recommendationAuthority:'SOURCE_BACKED_PROJECTION_ONLY',
      accessAuthority:'NOT_OWNED_BY_TODAY'
    };
    this.lastProjection=clone(projection);
    if(this.selectedRecommendation&&!items.some(item=>item.id===this.selectedRecommendation.itemId&&item.recommendation?.version===this.selectedRecommendation.version))this.selectedRecommendation=null;
    return frozen(projection);
  }
  refresh(){return this.project();}
  selectRecommendation(itemId,version=''){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId&&entry.kind==='RECOMMENDATION');
    const exact=String(version||item?.recommendation?.version||'');
    if(!item?.recommendation||!exact||item.recommendation.version!==exact){this.selectedRecommendation=null;return {ok:false,status:'RECOMMENDATION_VERSION_UNRESOLVED',mutated:false};}
    this.selectedRecommendation={itemId:item.id,version:exact};return {ok:true,status:'RECOMMENDATION_SELECTED',itemId:item.id,version:exact,mutated:false};
  }
  canResume(itemId){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId),continuation=item?.continuation;
    if(!item||!continuation)return {enabled:false,reason:'Continuation is unavailable',code:'CONTINUATION_UNAVAILABLE'};
    if(!continuation.destination||!continuation.objectId)return {enabled:false,reason:'Continuation target identity is incomplete',code:'CONTINUATION_INVALID'};
    const resolvable=continuation.targetState==='RESOLVABLE'||(continuation.exists===true&&continuation.readable===true);
    if(!resolvable)return {enabled:false,reason:'Continuation target has not been proven readable',code:'CONTINUATION_TARGET_UNRESOLVED'};
    return {enabled:true,reason:'',code:'AVAILABLE'};
  }
  resume(itemId){
    const projection=this.lastProjection||this.project(),availability=this.canResume(itemId),item=projection.items.find(entry=>entry.id===itemId);
    if(!availability.enabled)return {ok:false,status:availability.code,mutated:false};
    const continuation=clone(item.continuation);
    return {
      ok:true,status:'CONTINUATION_READY',mutated:false,continuation,
      returnBookmark:continuation.bookmark||{surface:'today',projectionVersion:projection.projectionVersion,itemId:item.id},
      progressMutation:false,accessDecisionMade:false
    };
  }
  canExplain(itemId,version=''){
    const projection=this.lastProjection||this.project(),item=projection.items.find(entry=>entry.id===itemId&&entry.kind==='RECOMMENDATION'),recommendation=item?.recommendation;
    if(!recommendation)return {enabled:false,reason:'Recommendation rationale is unavailable',code:'RECOMMENDATION_RATIONALE_UNAVAILABLE'};
    const selected=this.selectedRecommendation;
    if(!selected||selected.itemId!==itemId)return {enabled:false,reason:'Select the exact recommendation before requesting rationale',code:'RECOMMENDATION_NOT_SELECTED'};
    const exact=String(version||selected.version||'');
    if(!exact||selected.version!==exact||recommendation.version!==exact)return {enabled:false,reason:'Exact recommendation version is not selected or no longer resolves',code:'RECOMMENDATION_VERSION_UNRESOLVED'};
    if(!recommendation.sourceRef||(!recommendation.reasonCode&&!recommendation.rationale))return {enabled:false,reason:'Source-backed rationale is unavailable',code:'RECOMMENDATION_RATIONALE_UNAVAILABLE'};
    return {enabled:true,reason:'',code:'AVAILABLE'};
  }
  why(itemId,version=''){
    const projection=this.lastProjection||this.project(),availability=this.canExplain(itemId,version),item=projection.items.find(entry=>entry.id===itemId);
    if(!availability.enabled)return {ok:false,status:availability.code,mutated:false,unlockLogicFabricated:false};
    return {ok:true,status:'RATIONALE_PROJECTION',mutated:false,recommendation:clone(item.recommendation),unlockLogicFabricated:false,accessDecisionMade:false};
  }
}
