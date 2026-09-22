import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {createRqCompareProvider} from '../analytical/rq-compare-provider.js';
const clone=value=>value===undefined?undefined:structuredClone(value);
const nonEmpty=value=>typeof value==='string'&&value.trim().length>0;
const exactSourceRevision=ref=>!!ref&&['sourceId','revision','digest','locator'].every(key=>nonEmpty(ref[key]));
const normalizeScope=scope=>Array.isArray(scope)?[...new Set(scope.map(value=>String(value||'').trim()).filter(Boolean))].sort():[];

export const RQ_DOMAIN_OWNER='RQDomainAdapter';
export class RQDomainAdapter{
  constructor(records=[],options={}){
    this.owner=RQ_DOMAIN_OWNER;
    const {analyticalCompareOwner=null,providerClassification='ADMITTED_CURRENT_PROVIDER',providerAdmitted=Array.isArray(records)&&records.length>0,...providerOptions}=options||{};
    this.providerAdmitted=providerAdmitted===true;
    this.providerClassification=String(providerClassification||'UNSPECIFIED_PROVIDER_CLASSIFICATION');
    this.records=clone(this.providerAdmitted?records:[]);
    this.compareOwner=analyticalCompareOwner||new AnalyticalCompareOwner();
    if(this.compareOwner?.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
    this.provider=createRqCompareProvider(this.records,providerOptions);
    this.compareOwner.registerProvider(this.provider);
    this.providerId=this.provider.descriptor().providerId;
    this.sessions=new Set();
    this.sessionContexts=new Map();
    this.workingConflicts=new Map();
  }
  descriptor(){return {
    owner:this.owner,
    compareOwner:this.compareOwner.owner,
    providerId:this.providerId,
    providerAdmitted:this.providerAdmitted,
    providerClassification:this.providerClassification,
    providerTruth:this.providerAdmitted?'ADMITTED_CURRENT_PROVIDER':'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER',
    analysisSessionPersistence:'UNAVAILABLE',
    formalReviewAuthority:false,
    visualReferenceCeiling:'REVIEWED_FINAL_CANDIDATE',
    exactCompareContext:{left:'SourceRevision',right:'SourceRevision',workingAnalysisId:'required',scope:'required-non-empty'}
  };}
  providerAvailability(){return this.providerAdmitted?{enabled:true,code:'AVAILABLE',reason:'Admitted current RQ provider is bound.'}:{enabled:false,code:'RQ_CURRENT_PROVIDER_UNAVAILABLE',reason:'No admitted current RQ provider is bound; non-production acceptance data is not Product truth.'};}
  search(query='',options={}){
    const q=String(query||'').trim().toLocaleLowerCase('en-US'),includeExcluded=options.includeExcluded===true,requestedExcludedIds=new Set((options.includeExcludedIds||[]).map(String));
    const list=clone(this.records),matches=item=>!q||JSON.stringify(item).toLocaleLowerCase('en-US').includes(q),isExcluded=item=>item?.excluded===true||String(item?.status||'').toUpperCase()==='EXCLUDED';
    const trace=list.filter(matches).map(item=>({sourceRevision:clone(item),excluded:isExcluded(item),included:!isExcluded(item)||includeExcluded||requestedExcludedIds.has(String(item?.sourceId||'')),reason:isExcluded(item)?'EXCLUDED_SOURCE_TRACEABLE':'IN_SCOPE_SOURCE'}));
    return {ok:true,status:this.providerAdmitted?'WORKING_SEARCH':'RQ_CURRENT_PROVIDER_UNAVAILABLE',query,items:trace.filter(item=>item.included).map(item=>clone(item.sourceRevision)),excluded:trace.filter(item=>item.excluded&&!item.included),trace,providerAdmitted:this.providerAdmitted,providerClassification:this.providerClassification,persisted:false,formalReview:false};
  }
  compareContext(payload={}){
    const workingAnalysisId=String(payload.workingAnalysisId||payload.sessionId||'').trim(),scope=normalizeScope(payload.scope),left=payload.left,right=payload.right;
    return {workingAnalysisId,scope,left:clone(left),right:clone(right),exactPair:exactSourceRevision(left)&&exactSourceRevision(right)};
  }
  compareAvailability(payload={}){
    const context=this.compareContext(payload);
    if(!this.providerAdmitted)return {enabled:false,code:'RQ_CURRENT_PROVIDER_UNAVAILABLE',reason:'No admitted current RQ provider is bound; compare cannot resolve Product SourceRevision truth.',context};
    if(!context.exactPair)return {enabled:false,code:'RQ_COMPARE_EXACT_SOURCE_REVISION_PAIR_REQUIRED',reason:'rq.compare requires two exact SourceRevision references.'};
    if(!context.workingAnalysisId)return {enabled:false,code:'RQ_COMPARE_WORKING_ANALYSIS_CONTEXT_REQUIRED',reason:'rq.compare requires a workingAnalysisId/sessionId.'};
    if(!context.scope.length)return {enabled:false,code:'RQ_COMPARE_SCOPE_REQUIRED',reason:'rq.compare requires explicit non-empty scope context.'};
    try{
      const left=this.provider.resolve(context.left),right=this.provider.resolve(context.right);
      if(left?.state!=='RESOLVED')return {enabled:false,code:`RQ_COMPARE_LEFT_${String(left?.state||'UNAVAILABLE')}`,reason:left?.reason||'Left SourceRevision is not resolved by the bound provider.',context};
      if(right?.state!=='RESOLVED')return {enabled:false,code:`RQ_COMPARE_RIGHT_${String(right?.state||'UNAVAILABLE')}`,reason:right?.reason||'Right SourceRevision is not resolved by the bound provider.',context};
      const compatibility=this.provider.preflightCompatibility?.(left,right);
      if(compatibility&&compatibility.compatible===false)return {enabled:false,code:compatibility.reasonCode||'RQ_COMPARE_INCOMPATIBLE',reason:compatibility.reason||'SourceRevision pair is not comparable.',context};
      return {enabled:true,code:'AVAILABLE',reason:'',context,providerResolution:{left:'RESOLVED',right:'RESOLVED'}};
    }catch(error){return {enabled:false,code:'RQ_COMPARE_PROVIDER_RESOLUTION_ERROR',reason:String(error?.message||error),context};}
  }
  compare(payload={}){
    const availability=this.compareAvailability(payload);
    if(!availability.enabled)return {ok:false,status:availability.code,reason:availability.reason,persisted:false,formalReview:false,canonicalMutation:false};
    const context=availability.context,sessionId=context.workingAnalysisId;
    try{
      const pair=this.compareOwner.createPair({left:{providerId:this.providerId,ref:context.left},right:{providerId:this.providerId,ref:context.right}});
      const result=this.compareOwner.openSession(sessionId,pair);
      if(result.state!=='ERROR'){
        this.sessions.add(sessionId);
        this.sessionContexts.set(sessionId,{workingAnalysisId:sessionId,scope:clone(context.scope),left:clone(context.left),right:clone(context.right)});
      }
      return {ok:result.state!=='ERROR',status:result.state,sessionId,pair,result,context:this.sessionContexts.get(sessionId)||clone(context),persisted:false,formalReview:false,canonicalMutation:false};
    }catch(error){return {ok:false,status:'RQ_COMPARE_REJECTED',reason:String(error?.message||error),sessionId,persisted:false,formalReview:false,canonicalMutation:false};}
  }
  project(sessionId){return this.compareOwner.projectSession(sessionId);}
  filter(sessionId,value){return this.compareOwner.setFilter(sessionId,value);}
  review(sessionId,payload={}){
    if(!this.sessions.has(sessionId))return {ok:false,status:'ANALYSIS_SESSION_UNKNOWN',sessionId,formalReview:false,reviewDecisionAuthority:false,evidenceDecisionWrites:0};
    const projection=this.project(sessionId),conflict=payload?.conflict;
    let workingConflict=null;
    if(conflict){
      if(!nonEmpty(conflict.id)||!nonEmpty(conflict.author)||!nonEmpty(conflict.revision))return {ok:false,status:'RQ_WORKING_CONFLICT_IDENTITY_REQUIRED',sessionId,formalReview:false,reviewDecisionAuthority:false,evidenceDecisionWrites:0};
      workingConflict={id:String(conflict.id),author:String(conflict.author),revision:String(conflict.revision),classification:String(conflict.classification||'UNRESOLVED'),rationale:String(conflict.rationale||''),workingAnalysisId:sessionId,formalReview:false};
      this.workingConflicts.set(`${sessionId}:${workingConflict.id}`,clone(workingConflict));
    }
    return {ok:true,status:'WORKING_REVIEW_ONLY',sessionId,projection,workingConflict,formalReview:false,reviewDecisionAuthority:false,evidenceDecisionWrites:0,persisted:false};
  }
  provenance(sessionId,payload={}){
    if(!this.sessions.has(sessionId))return {ok:false,status:'ANALYSIS_SESSION_UNKNOWN',sessionId,formalReview:false};
    const projection=this.project(sessionId),originalBytesAvailable=payload.originalBytesAvailable===true;
    return {ok:true,status:'PROVENANCE_PROJECTION',sessionId,provenance:clone(projection.provenance),receipt:clone(projection.receipt),formalReview:false,sourceAuthority:originalBytesAvailable?'ORIGINAL_BYTES_VERIFIED':'DERIVED_ONLY',originalHashAssertion:originalBytesAvailable?String(payload.originalHash||'UNSPECIFIED'):'FORBIDDEN_DERIVED_ONLY',persisted:false};
  }
  saveAnalysisSession(sessionId){if(!this.sessions.has(sessionId))return {ok:false,status:'ANALYSIS_SESSION_UNKNOWN',persisted:false};return {ok:false,status:'RQ_ANALYSIS_SESSION_PERSISTENCE_UNAVAILABLE',persisted:false,canonicalMutation:false,sessionId};}
}
