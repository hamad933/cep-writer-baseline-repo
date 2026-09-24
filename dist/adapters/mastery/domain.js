import {ActionAvailabilityCore} from '../../foundation/models.js';
import {createAnalyticalProviderBoundary,canonicalAnalyticalIdentityKey} from '../../foundation/contracts/analysis-provider.js';

export const MASTERY_DOMAIN_OWNER='W04MasteryDomain';
export const MASTERY_JUDGMENTS=Object.freeze(['NOT_EVALUATED','INSUFFICIENT_EVIDENCE','INCONCLUSIVE','NOT_MASTERED','MASTERED']);
export const MASTERY_FRESHNESS=Object.freeze(['CURRENT','REVALIDATION_REQUIRED']);
export const MASTERY_AUTHORITY_REF='ORACLE-011/A03';
const clone=value=>structuredClone(value), freeze=value=>Object.freeze(clone(value));
const demoInitial=()=>[
 {id:'mastery-crypto',revisionId:'mr-001',subject:'user:self',capability:'crypto-basics',judgment:'MASTERED',freshness:'REVALIDATION_REQUIRED',policyRef:'policy:mastery-v3',truthClass:'SYNTHETIC_DEMO_SEED',basis:{evidenceRefs:['ev-beta@evr-002'],decisionRefs:['decision-17'],digest:'basis:aaa'}},
 {id:'mastery-network',revisionId:'mr-002',subject:'user:self',capability:'network-analysis',judgment:'NOT_MASTERED',freshness:'CURRENT',policyRef:'policy:mastery-v3',truthClass:'SYNTHETIC_DEMO_SEED',basis:{evidenceRefs:['ev-alpha@evr-001'],decisionRefs:['decision-18'],digest:'basis:bbb'}}
];
const exactText=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value.trim();};
const validRecord=(record)=>{
 if(!MASTERY_JUDGMENTS.includes(record.judgment))throw Error('MASTERY_JUDGMENT_INVALID:'+record.judgment);
 if(!MASTERY_FRESHNESS.includes(record.freshness))throw Error('MASTERY_FRESHNESS_INVALID:'+record.freshness);
 if(!record?.basis||!Array.isArray(record.basis.evidenceRefs)||!Array.isArray(record.basis.decisionRefs)||typeof record.basis.digest!=='string')throw Error('MASTERY_BASIS_REQUIRED');
 return record;
};
const evaluatorDescriptor=(evaluator)=>{
 if(!evaluator)return null;
 if(typeof evaluator.descriptor!=='function'||typeof evaluator.requestEvaluation!=='function')throw Error('MASTERY_EVALUATOR_CONTRACT_INVALID');
 const d=evaluator.descriptor();
 if(d?.authority!=='AUTHORIZED_MASTERY_EVALUATOR'||!d.providerId||!d.revision)throw Error('MASTERY_EVALUATOR_AUTHORITY_INVALID');
 return freeze(d);
};
const refResolution=(provider,method,ref)=>{
 if(!provider||typeof provider[method]!=='function')return {ref,state:'UNVERIFIED_PROVIDER_UNBOUND'};
 try{
  const result=provider[method](ref);
  if(result===true||result?.state==='RESOLVED'||result?.ok===true)return {ref,state:'RESOLVED'};
  if(result===false||result===null||result===undefined||result?.state==='MISSING'||result?.ok===false)return {ref,state:'MISSING',reason:result?.reason||null};
  return {ref,state:String(result?.state||'UNVERIFIED')};
 }catch(error){return {ref,state:'UNAVAILABLE',reason:String(error?.message||error)};}
};

export const createW04MasteryDemoRecords=()=>freeze(demoInitial());

export class W04MasteryDomain{
 constructor(records=[],{basisResolver=null,evaluator=null}={}){
  this.owner=MASTERY_DOMAIN_OWNER;
  this.records=clone(records).map(validRecord);
  this.basisResolver=basisResolver;
  this.evaluator=evaluator;
  this.evaluatorDescriptor=evaluatorDescriptor(evaluator);
  this.history=this.records.map(r=>({evaluationId:`eval:${r.id}:0`,recordId:r.id,revisionId:r.revisionId,judgment:r.judgment,freshness:r.freshness,policyRef:r.policyRef,evidenceRefs:[...r.basis.evidenceRefs],decisionRefs:[...r.basis.decisionRefs],basisDigest:r.basis.digest,truthClass:r.truthClass||'PROVIDER_BOUND'}));
  this.receipts=[];
  this.seq=0;
  this.persistence={mode:'SESSION_LOCAL_PROJECTION',durable:false,status:'UNAVAILABLE',reason:'No surface-local persistence or canonical Mastery publisher is authorized.'};
  this.availability=new ActionAvailabilityCore();
  for(const id of ['mastery.inspect','mastery.explain','mastery.reevaluate'])this.availability.register(id,{selection:{exact:1},activeModes:['review']});
 }
 snapshot(){return freeze({owner:this.owner,authorityRef:MASTERY_AUTHORITY_REF,records:this.records,history:this.history,persistence:this.persistence,receipts:this.receipts,evaluator:this.evaluatorDescriptor});}
 get(id){const r=this.records.find(x=>x.id===id);if(!r)throw Error('MASTERY_UNKNOWN:'+id);return r;}
 inspect(id){return freeze(this.get(id));}
 explain(id,{basisAvailable=true,policyAvailable=true,conflictingDecisions=false}={}){
  const r=this.get(id);
  const evidence=r.basis.evidenceRefs.map(ref=>refResolution(this.basisResolver,'readEvidence',ref));
  const decisions=r.basis.decisionRefs.map(ref=>refResolution(this.basisResolver,'readDecision',ref));
  const policy=policyAvailable?refResolution(this.basisResolver,'readPolicy',r.policyRef):{ref:r.policyRef,state:'MISSING',reason:'Policy unavailable'};
  if(basisAvailable===false)for(const item of evidence)if(item.state==='UNVERIFIED_PROVIDER_UNBOUND')item.state='MISSING';
  const missingRefs=[...evidence,...decisions,[policy]].flat().filter(item=>item.state!=='RESOLVED').map(item=>item.ref);
  return freeze({ok:true,owner:this.owner,authorityRef:MASTERY_AUTHORITY_REF,id,subject:r.subject,masteryTarget:r.capability,judgment:r.judgment,freshness:r.freshness,policyRef:r.policyRef,basisDigest:r.basis.digest,evidence,decisions,policy,missingRefs,conflict:!!conflictingDecisions,causalLaw:'EFFECTIVE_DECISIONS+EVIDENCE+VERSIONED_POLICY_ONLY',completionOrActivityUsed:false,institutionalAuthorityInferred:false});
 }
 reevaluate(id,options={}){
  const r=this.get(id),before=freeze(r),historyCount=this.history.length;
  const explanation=this.explain(id,options);
  if(options.basisAvailable===false||options.policyAvailable===false||explanation.missingRefs.length){
   return freeze({ok:false,code:'BASIS_UNAVAILABLE',action:'INSPECT_REQUIREMENTS',mutated:false,record:before,requirements:explanation,historyCount});
  }
  if(options.conflictingDecisions){
   return freeze({ok:false,code:'CONFLICT_REQUIRES_GOVERNED_EVALUATION',action:'REQUEST_REVIEW_OR_EVALUATION',mutated:false,record:before,requirements:explanation,historyCount});
  }
  if(!this.evaluatorDescriptor){
   return freeze({ok:false,code:'AUTHORIZED_EVALUATOR_UNBOUND',action:'INSPECT_OR_REQUEST',mutated:false,record:before,requirements:explanation,historyCount});
  }
  const request=freeze({requestId:`mastery-request:${id}:${++this.seq}`,subject:r.subject,masteryTarget:r.capability,currentStateRef:`${r.id}@${r.revisionId}`,policyRef:r.policyRef,evidenceRefs:[...r.basis.evidenceRefs],decisionRefs:[...r.basis.decisionRefs],basisDigest:r.basis.digest,trigger:String(options.trigger||'USER_REEVALUATE_REQUEST'),requestedJudgment:null,completionOrActivityInputsAccepted:false});
  const providerReceipt=this.evaluator.requestEvaluation(clone(request));
  const receipt=freeze({sequence:this.seq,command:'mastery.reevaluate',owner:this.owner,providerId:this.evaluatorDescriptor.providerId,providerRevision:this.evaluatorDescriptor.revision,requestId:request.requestId,canonicalWriteOwner:this.evaluatorDescriptor.providerId,localMasteryWrite:false});
  this.receipts.push(receipt);
  return freeze({ok:true,code:'EVALUATION_REQUESTED',action:'REQUEST',delegated:true,mutated:false,record:before,request,providerReceipt,receipt,historyCount});
 }
 setFreshness(id,freshness){
  this.get(id);
  if(!MASTERY_FRESHNESS.includes(freshness))return freeze({ok:false,code:'MASTERY_FRESHNESS_INVALID',mutated:false});
  return freeze({ok:false,code:'CANONICAL_MASTERY_WRITE_FORBIDDEN',mutated:false,reason:'Freshness is a Mastery State dimension and may change only through a new governed Mastery State.'});
 }
}

export function createMasteryCompareProvider(domain){return createAnalyticalProviderBoundary({descriptor:{providerId:'w04.mastery.analysis',domainKind:'Mastery',schemaVersion:'1.1.0',comparatorVersion:'1.0.0',identityShape:'{id,revisionId}'},validateExactRef(ref){if(!ref||typeof ref.id!=='string'||typeof ref.revisionId!=='string')throw Error('MASTERY_EXACT_REF_REQUIRED');return {id:ref.id,revisionId:ref.revisionId};},refKey(ref){return canonicalAnalyticalIdentityKey('w04-mastery',[ref.id,ref.revisionId]);},resolve(ref){const r=domain.records.find(x=>x.id===ref.id&&x.revisionId===ref.revisionId);if(!r)return {state:'MISSING',reason:'Exact Mastery State is not present in the bound projection.',reasonCode:'EXACT_REVISION_MISSING',provenanceRefs:[]};return {state:'RESOLVED',objectId:r.id,revisionId:r.revisionId,schemaVersion:'1.1.0',fields:[['judgment','Judgment',r.judgment],['freshness','Freshness',r.freshness],['policyRef','Policy',r.policyRef],['basis.digest','Basis digest',r.basis.digest]].map(([path,label,value])=>({path,label,type:'string',present:true,value,provenanceRefs:[{masteryId:r.id,revisionId:r.revisionId}]})),provenanceRefs:[{masteryId:r.id,revisionId:r.revisionId,policyRef:r.policyRef,evidenceRefs:r.basis.evidenceRefs,decisionRefs:r.basis.decisionRefs}],domainContext:{owner:MASTERY_DOMAIN_OWNER,authorityRef:MASTERY_AUTHORITY_REF,truthClass:r.truthClass||'PROVIDER_BOUND'}};},preflightCompatibility(){return {compatible:true,comparatorVersion:'1.0.0'};}});}

export function createMasteryProvenanceProvider(domain){return Object.freeze({
 descriptor:()=>({providerId:'w04.mastery.provenance',domainKind:'Mastery',schemaVersion:'1.0.0',authorityRef:MASTERY_AUTHORITY_REF,label:'Mastery decision/evidence provenance'}),
 read:({id}={})=>{
  const r=id?domain.get(id):domain.records[0];
  if(!r)return {state:'EMPTY',identity:{id:'mastery:none',label:'No Mastery State selected',revision:null,provenanceRefs:[]},entries:[],message:'No governed Mastery projection is available.'};
  const entries=[
   {id:`policy:${r.policyRef}`,label:`Policy ${r.policyRef}`,kind:'MASTERY_POLICY',summary:'Versioned policy reference; presentation makes no policy-authority claim.',provenanceRefs:[r.policyRef],attributes:{authorityRef:MASTERY_AUTHORITY_REF}},
   ...r.basis.decisionRefs.map((ref,index)=>({id:`decision:${index}:${ref}`,label:`Decision ${ref}`,kind:'REVIEW_DECISION_REF',summary:'Effective Decision reference used by the evaluation basis.',provenanceRefs:[ref],attributes:{basisDigest:r.basis.digest}})),
   ...r.basis.evidenceRefs.map((ref,index)=>({id:`evidence:${index}:${ref}`,label:`Evidence ${ref}`,kind:'EVIDENCE_REVISION_REF',summary:'Exact Evidence revision reference used by the evaluation basis.',provenanceRefs:[ref],attributes:{basisDigest:r.basis.digest}}))
  ];
  return {state:'READY',identity:{id:r.id,label:`${r.capability} · ${r.judgment}`,revision:r.revisionId,provenanceRefs:[r.policyRef,...r.basis.decisionRefs,...r.basis.evidenceRefs]},entries,freshness:{masteryFreshness:r.freshness},message:'Mastery is explained from policy, effective Decisions and Evidence references; completion/activity is not an input.'};
 }
});}
