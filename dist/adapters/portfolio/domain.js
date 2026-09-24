import {ActionAvailabilityCore} from '../../foundation/models.js';
import {createAnalyticalProviderBoundary,canonicalAnalyticalIdentityKey} from '../../foundation/contracts/analysis-provider.js';

export const PORTFOLIO_DOMAIN_OWNER='W04PortfolioDomain';
export const PORTFOLIO_AUTHORITY_REF='ORACLE-011/A03';
const clone=value=>structuredClone(value), freeze=value=>Object.freeze(clone(value));
const demoInitial=()=>[
 {id:'member-1',revisionId:'pm-001',refType:'Evidence',sourceRef:'ev-beta@evr-002',state:'RESOLVABLE',groupingRef:null,groupingState:'AUTHORITY_PENDING',title:'Configuration transcript',truthClass:'SYNTHETIC_DEMO_SEED'},
 {id:'member-2',revisionId:'pm-002',refType:'Mastery',sourceRef:'mastery-crypto@mr-001',state:'SOURCE_SUPERSEDED',groupingRef:null,groupingState:'AUTHORITY_PENDING',title:'Crypto mastery snapshot',truthClass:'SYNTHETIC_DEMO_SEED'}
];
const validRefType=value=>['Evidence','Mastery','Project'].includes(value);
const exactSourceRef=value=>typeof value==='string'&&/^[^\s@]+@[^\s@]+$/.test(value);
const groupingDescriptor=(provider)=>{
 if(!provider)return null;
 if(typeof provider.descriptor!=='function'||typeof provider.resolve!=='function')throw Error('PORTFOLIO_GROUPING_PROVIDER_CONTRACT_INVALID');
 const d=provider.descriptor();
 if(d?.authority!=='APPROVED_GROUPING_REGISTRY'||!d.providerId||!d.registryId||!d.revision)throw Error('PORTFOLIO_GROUPING_PROVIDER_AUTHORITY_INVALID');
 return freeze(d);
};
const sourceSnapshot=(provider,ref)=>{
 if(!provider||typeof provider.inspect!=='function')return {state:'UNVERIFIED_PROVIDER_UNBOUND',ref};
 try{const observed=provider.inspect(ref);if(!observed||typeof observed!=='object'||typeof observed.digest!=='string'||!observed.digest||!Number.isInteger(observed.rowCount)||observed.rowCount<0)return freeze({state:'UNAVAILABLE',ref,reason:'SOURCE_INTEGRITY_ENVELOPE_UNAVAILABLE'});return freeze({state:'RESOLVED',ref,...observed});}catch(error){return freeze({state:'UNAVAILABLE',ref,reason:String(error?.message||error)});}
};
const sameSourceSnapshot=(a,b)=>a.state==='RESOLVED'&&b.state==='RESOLVED'?a.digest===b.digest&&a.rowCount===b.rowCount:null;

export const createW04PortfolioDemoRecords=()=>freeze(demoInitial());

export class W04PortfolioDomain{
 constructor(records=[],{groupingAuthority=null,sourceResolver=null}={}){
  this.owner=PORTFOLIO_DOMAIN_OWNER;
  this.records=clone(records).map(record=>({...record,groupingRef:record.groupingRef??null,groupingState:record.groupingRef?'REGISTRY_BOUND':(record.groupingState||'AUTHORITY_PENDING')}));
  this.groupingAuthority=groupingAuthority;
  this.groupingAuthorityDescriptor=groupingDescriptor(groupingAuthority);
  this.sourceResolver=sourceResolver;
  this.receipts=[];
  this.seq=0;
  this.filterText='';
  this.persistence={mode:'SESSION_LOCAL_CURATED_PROJECTION',durable:false,status:'UNAVAILABLE',reason:'Portfolio owns curation references only; durable binding must use shared persistence.'};
  this.availability=new ActionAvailabilityCore();
  for(const id of ['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group'])this.availability.register(id,{selection:{min:0},activeModes:['review']});
 }
 snapshot(){return freeze({owner:this.owner,authorityRef:PORTFOLIO_AUTHORITY_REF,records:this.records,filterText:this.filterText,persistence:this.persistence,receipts:this.receipts,groupingAuthority:this.groupingAuthorityDescriptor||{status:'AUTHORITY_DECISION_REQUIRED'}});}
 get(id){const r=this.records.find(x=>x.id===id);if(!r)throw Error('PORTFOLIO_MEMBER_UNKNOWN:'+id);return r;}
 curate({action='add',member=null,id=null,expectedRevisionId=null}={}){
  if(action==='remove'){
   const i=this.records.findIndex(x=>x.id===id);if(i<0)return freeze({ok:false,code:'MEMBER_UNKNOWN',mutated:false});
   const current=this.records[i];
   if(!expectedRevisionId)return freeze({ok:false,code:'REVISION_ENVELOPE_REQUIRED',mutated:false,currentRevisionId:current.revisionId});
   if(expectedRevisionId!==current.revisionId)return freeze({ok:false,code:'REVISION_CONFLICT',mutated:false,currentRevisionId:current.revisionId,expectedRevisionId});
   const sourceBefore=sourceSnapshot(this.sourceResolver,current.sourceRef);
   const [removed]=this.records.splice(i,1);
   const sourceAfter=sourceSnapshot(this.sourceResolver,current.sourceRef),verifiedUnchanged=sameSourceSnapshot(sourceBefore,sourceAfter);
   const receipt=freeze({sequence:++this.seq,command:'portfolio.curate',action:'remove',owner:this.owner,id,sourceRef:removed.sourceRef,sourcePreserved:true,sourceVerification:verifiedUnchanged===true?'VERIFIED_DIGEST_AND_ROW_COUNT_UNCHANGED':verifiedUnchanged===false?'SOURCE_CHANGED_EXTERNALLY':'UNAVAILABLE',canonicalSourceWrite:false});
   this.receipts.push(receipt);
   return freeze({ok:true,removed,sourcePreserved:true,sourceBefore,sourceAfter,verifiedUnchanged,receipt,mutated:true});
  }
  if(action!=='add')return freeze({ok:false,code:'CURATION_ACTION_UNSUPPORTED',mutated:false});
  if(!member||!member.id||!exactSourceRef(member.sourceRef)||!validRefType(member.refType))return freeze({ok:false,code:'EXACT_SOURCE_REF_REQUIRED',mutated:false});
  if(this.records.some(x=>x.id===member.id))return freeze({ok:false,code:'MEMBERSHIP_ID_CONFLICT',mutated:false});
  const observed=sourceSnapshot(this.sourceResolver,String(member.sourceRef));
  const sourceState=observed.state==='RESOLVED'?'RESOLVABLE':observed.state;
  const rec={id:String(member.id),revisionId:String(member.revisionId||`pm-${this.seq+3}`),refType:String(member.refType),sourceRef:String(member.sourceRef),state:sourceState,groupingRef:null,groupingState:'UNGROUPED',title:String(member.title||member.sourceRef),annotation:member.annotation?String(member.annotation):null,truthClass:'CURATION_REFERENCE'};
  this.records.push(rec);
  const receipt=freeze({sequence:++this.seq,command:'portfolio.curate',action:'add',owner:this.owner,id:rec.id,sourceRef:rec.sourceRef,sourceResolution:observed.state,canonicalSourceWrite:false});
  this.receipts.push(receipt);
  return freeze({ok:true,record:rec,receipt,mutated:true});
 }
 filter(query=''){
  this.filterText=String(query);
  const q=this.filterText.trim().toLowerCase();
  return freeze({ok:true,query:this.filterText,records:this.records.filter(r=>!q||`${r.title} ${r.sourceRef} ${r.refType} ${r.state}`.toLowerCase().includes(q)),mutated:false,taxonomyCreated:false,sourceWrites:0});
 }
 export(){return freeze({ok:true,canonicalPublication:false,owner:this.owner,authorityRef:PORTFOLIO_AUTHORITY_REF,members:this.records.map(({id,revisionId,refType,sourceRef,state,groupingRef,groupingState,annotation})=>({id,revisionId,refType,sourceRef,state,groupingRef,groupingState,annotation:annotation??null})),limitations:['Projection only','Canonical Evidence/Mastery/project truth remains with source owner','Unavailable/superseded/withdrawn state is retained'],note:'Export carries exact refs, curation metadata and source disposition only; it does not duplicate canonical Evidence/Mastery truth.',mutated:false});}
 group(id,groupingRef,{expectedRevisionId=null}={}){
  const r=this.get(id);
  if(groupingRef!==null&&groupingRef!==''&&!this.groupingAuthorityDescriptor)return freeze({ok:false,code:'AUTHORITY_DECISION_REQUIRED',mutated:false,groupingState:'AUTHORITY_PENDING',groupingRef,reason:'Project/Learning Objective grouping authority is unresolved; no example ID is treated as canonical.'});
  if(!expectedRevisionId)return freeze({ok:false,code:'REVISION_ENVELOPE_REQUIRED',mutated:false,currentRevisionId:r.revisionId});
  if(expectedRevisionId!==r.revisionId)return freeze({ok:false,code:'REVISION_CONFLICT',mutated:false,currentRevisionId:r.revisionId,expectedRevisionId});
  if(groupingRef===null||groupingRef===''){
   r.groupingRef=null;r.groupingState='UNGROUPED';r.revisionId=`${r.revisionId}-u${this.seq+1}`;
   const receipt=freeze({sequence:++this.seq,command:'portfolio.group',owner:this.owner,id,groupingRef:null,groupingState:'UNGROUPED',canonicalGroupingAuthorityClaim:false});this.receipts.push(receipt);return freeze({ok:true,record:r,receipt,mutated:true});
  }
  if(!this.groupingAuthorityDescriptor)return freeze({ok:false,code:'AUTHORITY_DECISION_REQUIRED',mutated:false,groupingState:'AUTHORITY_PENDING',groupingRef,reason:'Project/Learning Objective grouping authority is unresolved; no example ID is treated as canonical.'});
  let resolved;
  try{resolved=this.groupingAuthority.resolve(groupingRef);}catch(error){return freeze({ok:false,code:'GROUPING_AUTHORITY_UNAVAILABLE',mutated:false,groupingRef,reason:String(error?.message||error)});}
  if(!resolved||resolved.state!=='APPROVED'||resolved.id!==groupingRef)return freeze({ok:false,code:'GROUPING_AUTHORITY_UNAVAILABLE',mutated:false,groupingRef,providerId:this.groupingAuthorityDescriptor.providerId,registryRevision:this.groupingAuthorityDescriptor.revision});
  r.groupingRef=groupingRef;r.groupingState='REGISTRY_BOUND';r.revisionId=`${r.revisionId}-g${this.seq+1}`;
  const receipt=freeze({sequence:++this.seq,command:'portfolio.group',owner:this.owner,id,groupingRef,groupingState:'REGISTRY_BOUND',providerId:this.groupingAuthorityDescriptor.providerId,registryId:this.groupingAuthorityDescriptor.registryId,registryRevision:this.groupingAuthorityDescriptor.revision,canonicalGroupingAuthorityClaim:true});
  this.receipts.push(receipt);return freeze({ok:true,record:r,receipt,mutated:true});
 }
 setSourceState(id,state,{expectedRevisionId=null}={}){
  if(!['RESOLVABLE','SOURCE_SUPERSEDED','SOURCE_WITHDRAWN','UNAVAILABLE'].includes(state))return freeze({ok:false,code:'PORTFOLIO_SOURCE_STATE_INVALID',mutated:false});
  const r=this.get(id);if(!expectedRevisionId)return freeze({ok:false,code:'REVISION_ENVELOPE_REQUIRED',mutated:false,currentRevisionId:r.revisionId});if(expectedRevisionId!==r.revisionId)return freeze({ok:false,code:'REVISION_CONFLICT',mutated:false,currentRevisionId:r.revisionId,expectedRevisionId});
  r.state=state;r.revisionId=`${r.revisionId}-s${this.seq+1}`;return freeze({ok:true,record:r,mutated:true,canonicalSourceWrite:false});
 }
}

export function createPortfolioCompareProvider(domain){return createAnalyticalProviderBoundary({descriptor:{providerId:'w04.portfolio.analysis',domainKind:'Portfolio',schemaVersion:'1.1.0',comparatorVersion:'1.0.0',identityShape:'{id,revisionId}'},validateExactRef(ref){if(!ref||typeof ref.id!=='string'||typeof ref.revisionId!=='string')throw Error('PORTFOLIO_EXACT_REF_REQUIRED');return {id:ref.id,revisionId:ref.revisionId};},refKey(ref){return canonicalAnalyticalIdentityKey('w04-portfolio',[ref.id,ref.revisionId]);},resolve(ref){const r=domain.records.find(x=>x.id===ref.id&&x.revisionId===ref.revisionId);if(!r)return {state:'MISSING',reason:'Exact Portfolio membership revision is not present.',reasonCode:'EXACT_REVISION_MISSING',provenanceRefs:[]};return {state:'RESOLVED',objectId:r.id,revisionId:r.revisionId,schemaVersion:'1.1.0',fields:[['refType','Reference type',r.refType],['sourceRef','Source reference',r.sourceRef],['state','Source state',r.state],['groupingState','Grouping state',r.groupingState],['groupingRef','Grouping',r.groupingRef??'UNGROUPED']].map(([path,label,value])=>({path,label,type:'string',present:true,value,provenanceRefs:[{membershipId:r.id,sourceRef:r.sourceRef}]})),provenanceRefs:[{membershipId:r.id,sourceRef:r.sourceRef}],domainContext:{owner:PORTFOLIO_DOMAIN_OWNER,authorityRef:PORTFOLIO_AUTHORITY_REF,canonicalSourceCopied:false}};},preflightCompatibility(){return {compatible:true,comparatorVersion:'1.0.0'};}});}

export function createPortfolioProvenanceProvider(domain){return Object.freeze({
 descriptor:()=>({providerId:'w04.portfolio.provenance',domainKind:'Portfolio',schemaVersion:'1.0.0',authorityRef:PORTFOLIO_AUTHORITY_REF,label:'Portfolio reference provenance'}),
 read:({id}={})=>{
  const r=id?domain.get(id):domain.records[0];
  if(!r)return {state:'EMPTY',identity:{id:'portfolio:none',label:'No Portfolio member selected',revision:null,provenanceRefs:[]},entries:[],message:'Portfolio is an empty curation projection.'};
  const entries=[{id:`source:${r.sourceRef}`,label:`Canonical source ${r.sourceRef}`,kind:`${r.refType.toUpperCase()}_REFERENCE`,summary:`Source state: ${r.state}. Portfolio stores the reference, not a canonical copy.`,provenanceRefs:[r.sourceRef],attributes:{sourceState:r.state,canonicalCopy:false}}];
  if(r.groupingRef)entries.push({id:`group:${r.groupingRef}`,label:`Grouping ${r.groupingRef}`,kind:'GROUPING_REFERENCE',summary:`Grouping state: ${r.groupingState}.`,provenanceRefs:[r.groupingRef],attributes:{groupingState:r.groupingState}});
  return {state:r.state==='UNAVAILABLE'?'STALE':'READY',identity:{id:r.id,label:r.title,revision:r.revisionId,provenanceRefs:[r.sourceRef,...(r.groupingRef?[r.groupingRef]:[])]},entries,freshness:{sourceState:r.state,groupingState:r.groupingState},message:'Portfolio membership is curation metadata over canonical references; source truth is never duplicated or deleted here.'};
 }
});}
