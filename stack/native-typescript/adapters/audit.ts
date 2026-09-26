import {AuditProvenanceInteractionCore} from '../foundation/audit/provenance.js';
import {createReviewDecisionPresentationSnapshot} from '../foundation/review/decision.js';
import {assertGenuineReviewAuditConsumer} from '../foundation/review/family-admission.js';
import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';

const clone=value=>value===undefined?undefined:structuredClone(value);
const now=()=>new Date().toISOString();
const canonical=value=>JSON.stringify(canonicalize(value));
function canonicalize(value){if(Array.isArray(value))return value.map(canonicalize);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));return value;}

/* Portable SHA-256 so browser and Node verify the same AuditEvent bytes. Hashing is integrity evidence, never encryption. */
export function sha256Text(input){
  const rightRotate=(value,amount)=>(value>>>amount)|(value<<(32-amount));
  const maxWord=2**32,words=[];let result='',ascii=unescape(encodeURIComponent(String(input))),asciiBitLength=ascii.length*8,hash=[],k=[],primeCounter=0,isComposite={};
  for(let candidate=2;primeCounter<64;candidate++){if(!isComposite[candidate]){for(let i=0;i<313;i+=candidate)isComposite[i]=candidate;hash[primeCounter]=(candidate**.5*maxWord)|0;k[primeCounter++]=(candidate**(1/3)*maxWord)|0;}}
  ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(let i=0;i<ascii.length;i++){const j=ascii.charCodeAt(i);if(j>>8)throw Error('SHA256_ASCII_ENCODING_FAILED');words[i>>2]|=j<<((3-i)%4)*8;}
  words[words.length]=(asciiBitLength/maxWord)|0;words[words.length]=asciiBitLength;
  for(let j=0;j<words.length;){const w=words.slice(j,j+=16),oldHash=hash.slice(0);hash=hash.slice(0,8);for(let i=0;i<64;i++){const w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4],temp1=(hash[7]+(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=i<16?w[i]:((w[i-16]+(rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3))+w[i-7]+(rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10)))|0)))|0,temp2=((rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])))|0;hash=[(temp1+temp2)|0,a,hash[1],hash[2],(hash[3]+temp1)|0,e,hash[5],hash[6]];}for(let i=0;i<8;i++)hash[i]=(hash[i]+oldHash[i])|0;}
  for(let i=0;i<8;i++)for(let j=3;j+1;j--){const b=(hash[i]>>(j*8))&255;result+=(b<16?'0':'')+b.toString(16);}return result;
}

export const AUDIT_DOMAIN_OWNER='W05AuditDomain';
export const AUDIT_COMMANDS=Object.freeze(['audit.search','audit.verify','audit.annotate']);

export class AuditEventDomain{
  constructor({clock=now,seed=true}={}){this.owner=AUDIT_DOMAIN_OWNER;this.clock=clock;this.events=[];this.annotations=[];this.annotationSequence=0;if(seed)this.append({actor:'Local product user',action:'AUDIT_DOMAIN_INITIALIZED',target:'audit',outcome:'READY',correlationId:'audit-session',details:{coverage:'PARTIAL_OBSERVED',persistence:'SESSION_LOCAL',databaseImmutabilityClaim:false}});}
  _material(event,sequence,previousHash){const eventId=String(event.eventId||event.id||`audit-${sequence}`),occurredAt=String(event.occurredAt||event.time||this.clock());return {sequence,eventId,previousHash,actor:String(event.actor||'Local product user'),action:String(event.action||'AUDIT_EVENT'),target:String(event.target||'application'),correlationId:String(event.correlationId||`audit-${sequence}`),time:occurredAt,occurredAt,outcome:String(event.outcome||'OBSERVED'),details:clone(event.details||{})};}
  append(event={}){const sequence=this.events.length+1,previousHash=this.events.at(-1)?.recordHash||'GENESIS',material=this._material(event,sequence,previousHash),recordHash=sha256Text(canonical(material)),row=Object.freeze({...material,recordHash});this.events.push(row);return clone(row);}
  rows(){return this.events.map(clone);}
  annotationsFor(eventId){return this.annotations.filter(row=>row.eventId===eventId).map(clone);}
  search({query='',limit=100}={}){const before=this.events.length,needle=String(query||'').trim().toLocaleLowerCase('en-US'),rows=this.events.filter(row=>!needle||canonical(row).toLocaleLowerCase('en-US').includes(needle)).slice(-Math.max(1,Math.min(500,Number(limit)||100))).map(clone);return {ok:true,owner:this.owner,query:String(query||''),rows,totalObserved:this.events.length,returned:rows.length,mutatedAuditEventCount:this.events.length-before,coverage:'PARTIAL_OBSERVED'};}
  verifyObserved(rows=this.events){let previous='GENESIS';for(let i=0;i<rows.length;i++){const row=rows[i],material={sequence:row.sequence,eventId:String(row.eventId||`audit-${row.sequence}`),previousHash:row.previousHash,actor:row.actor,action:row.action,target:row.target,correlationId:row.correlationId,time:row.time,occurredAt:String(row.occurredAt||row.time),outcome:row.outcome,details:clone(row.details||{})},expected=sha256Text(canonical(material)),sequence=i+1;if(row.sequence!==sequence||row.previousHash!==previous||row.recordHash!==expected)return {ok:true,owner:this.owner,status:'INVALID_CHAIN',firstInvalidSequence:row.sequence||sequence,scope:{fromSequence:1,toSequence:rows.length,watermark:this.events.at(-1)?.recordHash||'GENESIS'},hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};previous=row.recordHash;}return {ok:true,owner:this.owner,status:'VALID_CHAIN',firstInvalidSequence:null,scope:{fromSequence:rows.length?1:0,toSequence:rows.length,watermark:this.events.at(-1)?.recordHash||'GENESIS'},hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};}
  verify(){return this.verifyObserved(this.events);}
  annotate({eventId,note,actor='Local product user'}={}){const target=this.events.find(row=>String(row.sequence)===String(eventId)||row.eventId===String(eventId)||row.recordHash===eventId);if(!target)return {ok:false,code:'AUDIT_EVENT_REQUIRED'};const text=String(note||'').trim();if(!text)return {ok:false,code:'ANNOTATION_TEXT_REQUIRED'};const originalHash=target.recordHash,row=Object.freeze({annotationId:`audit-note-${++this.annotationSequence}`,eventId:target.eventId,revision:this.annotations.filter(item=>item.eventId===target.eventId).length+1,note:text,actor:String(actor),createdAt:this.clock(),auditRecordHash:originalHash});this.annotations.push(row);return {ok:true,owner:this.owner,annotation:clone(row),auditRecordHashUnchanged:this.events.find(item=>item.sequence===target.sequence)?.recordHash===originalHash,separateFromAuditEvent:true};}
  truth(){return {owner:this.owner,eventCount:this.events.length,annotationCount:this.annotations.length,coverage:'PARTIAL_OBSERVED',persistence:'SESSION_LOCAL',appendOnlyApplicationContract:true,databaseImmutabilityClaim:false,hashChain:'SHA-256',hashIsEncryption:false,commandReceiptsAreAuditTruth:false,canonicalEventId:true,canonicalOccurredAt:true};}
}

export function createAuditConsumerAdapter({domain=new AuditEventDomain(),commandBus=null}={}){
  // R6 compatibility seam: keep the CG2 shared Review/Audit family facade while the
  // W05 domain/provider remains authoritative. commandBus is accepted only for legacy
  // call-shape compatibility and is never read as durable AuditEvent truth.
  void commandBus;
  const consumer=assertGenuineReviewAuditConsumer({surface:'audit',routeKind:'PRODUCT',consumerKind:'GENUINE_REAL_PRODUCT',domainImplementation:'REAL_PRODUCT_COMPOSITION',proofConsumer:true,synthetic:false,fixture:false,contractOnly:false,profileUse:'READ_ONLY_EVIDENCE_NOT_PROOF'});
  let searchQuery='';let lastIntegrity=domain.verify();
  const provider={
    descriptor:()=>({providerId:'W05AuditEventProvider',domainKind:'cep-audit-events',schemaVersion:'1.0.0',authorityRef:'W05AuditDomain.events',label:'Application AuditEvent chain'}),
    read:()=>{const result=domain.search({query:searchQuery,limit:200}),observedAt=now(),eventIdByHash=new Map(domain.rows().map(row=>[row.recordHash,row.eventId]));return {state:result.rows.length?'READY':'EMPTY',identity:{id:'w05-audit-event-chain',label:'Application AuditEvent chain',revision:String(domain.truth().eventCount),correlationIds:[],provenanceRefs:['W05AuditDomain.events','AuditProvenanceInteractionCore']},entries:result.rows.map(row=>({id:row.eventId,label:`#${row.sequence} · ${row.action}`,kind:'AUDIT_EVENT',timestamp:row.occurredAt,actorLabel:row.actor,summary:`${row.outcome} · ${row.target}`,parentIds:row.previousHash==='GENESIS'?[]:[eventIdByHash.get(row.previousHash)].filter(Boolean),correlationIds:[row.correlationId],provenanceRefs:[row.recordHash],attributes:{sequence:row.sequence,eventId:row.eventId,occurredAt:row.occurredAt,hash:row.recordHash,recordHash:row.recordHash,previousHash:row.previousHash,outcome:row.outcome,annotationRevisions:domain.annotationsFor(row.eventId).length,hashAlgorithm:'SHA-256',hashIsEncryption:false,databaseImmutabilityClaim:false}})),message:result.rows.length?'Application AuditEvents from the W05 Audit domain. Hash-chain integrity is inspectable; hashing is not encryption.':'No AuditEvent matches the domain search.',observedAt,freshness:{source:'CURRENT_PRODUCT_SESSION_W05_AUDIT_DOMAIN',observedAt,stale:false},truth:{domainSource:'W05AuditDomain.events',commandReceiptSource:false,coverage:'PARTIAL_OBSERVED',databaseImmutabilityClaim:false}};}
  };
  const provenance=new AuditProvenanceInteractionCore(provider);provenance.refresh();
  const reviewSnapshot=()=>createReviewDecisionPresentationSnapshot({id:'audit-review-boundary',title:'Audit review boundary',summary:'Durable AuditEvents are inspectable through the shared Audit/Provenance presentation family; no formal Review Decision is created here.',state:'READ_ONLY',stateLabel:'Read only',stateMessage:'Formal Review authority remains separate from W05 AuditEvent semantics.',direction:'auto',locale:'en',labels:{family:'Audit inspection',criteria:'Criteria',findings:'Formal review findings',decision:'Decision',supersession:'Supersession',unavailable:'Unavailable'},criteria:[{id:'source',label:'Provenance source',detail:'W05 AuditEvent domain/provider projection; SemanticCommandBus receipts are explicitly non-authoritative.',badge:'Provider truth',tone:'info'},{id:'boundary',label:'Shared-family authority boundary',detail:'AuditProvenanceInteractionCore owns presentation/local inspection only.',badge:'Separate',tone:'attention'}],findings:[],decision:null,supersession:null,sourceNote:'AuditProvenanceInteractionCore does not own W05 AuditEvent semantics, persistence, provider data truth or formal Review authority.'});
  const api={
    owner:AUDIT_DOMAIN_OWNER,domain,provider,provenance,consumer,reviewSnapshot,
    search:(query='')=>{searchQuery=String(query||'');const result=domain.search({query:searchQuery});provenance.refresh();return result;},
    verify:()=>{lastIntegrity=domain.verify();return clone(lastIntegrity);},
    annotate:payload=>{const result=domain.annotate(payload);provenance.refresh();return result;},
    refresh:()=>provenance.refresh(),integrity:()=>clone(lastIntegrity),annotations:()=>domain.annotations.map(clone),truth:()=>Object.freeze({...domain.truth(),surface:'audit',realProductConsumer:true,formalReviewAuthority:false,profileUsedAsProof:false,semanticCommandReceiptsAreAuditEvents:false})
  };
  return Object.freeze(api);
}


/* CG6 durable provider binding. AuditEvent storage/hash-chain ownership remains in the
   approved app-wide AuditEventProvider; this adapter owns only W05 search/verify/annotate semantics. */
export class DurableAuditRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport()}={}){this.owner='W05DurableAuditRuntimeAdapter';this.transport=transport;this.state={events:[],pagination:null,filters:{},observedScope:null,integrity:{status:'UNVERIFIED',valid:null,firstInvalidSequence:null,scope:null,errorCode:null},annotations:[],errors:{search:null,verify:null,annotate:null},lastError:null};}
  descriptor(){return {owner:this.owner,semanticOwner:AUDIT_DOMAIN_OWNER,providerOwner:'AuditEventProvider',providerStorage:'DURABLE_JSONL',semanticCommandReceiptsAreAuditEvents:false,hashAlgorithm:'SHA-256',hashIsEncryption:false,databaseImmutabilityProven:false,annotationsStoredSeparately:true,surfaceSemanticsMovedIntoProvider:false};}
  snapshot(){return clone(this.state);}
  async search(filters={}){
    const params=new URLSearchParams();for(const key of ['actor','action','target','outcome','correlationId','from','to','limit','cursor'])if(filters[key]!=null&&filters[key]!=='')params.set(key,String(filters[key]));
    try{
      const r=await this.transport.request('GET',`/v1/audit/events${params.size?`?${params.toString()}`:''}`);
      if(r?.ok===true){this.state.events=(r.events||[]).map(clone);this.state.pagination=clone(r.pagination||null);this.state.filters=clone(r.filters||filters);this.state.observedScope=clone(r.observedScope||null);this.state.errors.search=null;this.state.lastError=null;}
      else {this.state.errors.search=clone(r||{ok:false,code:'AUDIT_SEARCH_PROVIDER_ERROR'});this.state.lastError=clone(this.state.errors.search);}
      return r;
    }catch(error){const r={ok:false,code:'AUDIT_SEARCH_PROVIDER_ERROR',error:String(error?.message||error)};this.state.errors.search=clone(r);this.state.lastError=clone(r);return r;}
  }
  async verify(){
    try{
      const r=await this.transport.request('GET','/v1/audit/verify');
      if(r?.ok===true&&typeof r.valid==='boolean'){
        this.state.observedScope=clone(r.observedScope||this.state.observedScope||null);
        this.state.integrity={status:r.valid?'VALID_CHAIN':'INVALID_CHAIN',valid:r.valid,firstInvalidSequence:r.firstInvalidSequence??null,scope:clone(r.observedScope||null),errorCode:null};this.state.errors.verify=null;this.state.lastError=null;
      }else{
        const code=String(r?.code||r?.status||'AUDIT_VERIFICATION_PROVIDER_ERROR');
        this.state.integrity={status:'VERIFICATION_ERROR',valid:null,firstInvalidSequence:null,scope:clone(r?.observedScope||this.state.observedScope||null),errorCode:code};this.state.errors.verify=clone(r||{ok:false,code});this.state.lastError=clone(this.state.errors.verify);
      }
      return r;
    }catch(error){const r={ok:false,code:'AUDIT_VERIFICATION_PROVIDER_ERROR',error:String(error?.message||error)};this.state.integrity={status:'VERIFICATION_ERROR',valid:null,firstInvalidSequence:null,scope:clone(this.state.observedScope||null),errorCode:r.code};this.state.errors.verify=clone(r);this.state.lastError=clone(r);return r;}
  }
  async annotate({eventId,note,actor='Local product user'}={}){
    const canonicalEventId=String(eventId||'').trim(),text=String(note||'').trim();
    if(!canonicalEventId)return {ok:false,code:'AUDIT_CANONICAL_EVENT_ID_REQUIRED'};
    if(!text)return {ok:false,code:'AUDIT_ANNOTATION_FIELDS_REQUIRED'};
    const aliasMatch=this.state.events.find(row=>row.eventId!==canonicalEventId&&(String(row.sequence)===canonicalEventId||String(row.hash||row.recordHash||'')===canonicalEventId||String(row.previousHash||'')===canonicalEventId));
    if(aliasMatch)return {ok:false,code:'AUDIT_CANONICAL_EVENT_ID_REQUIRED',requiredEventId:aliasMatch.eventId||null};
    try{
      const r=await this.transport.request('POST','/v1/audit/annotations',{eventId:canonicalEventId,actor,note:text});if(r?.ok===true){this.state.annotations.push(clone(r.annotation));this.state.errors.annotate=null;this.state.lastError=null;}else {this.state.errors.annotate=clone(r||{ok:false,code:'AUDIT_ANNOTATION_PROVIDER_ERROR'});this.state.lastError=clone(this.state.errors.annotate);}return r;
    }catch(error){const r={ok:false,code:'AUDIT_ANNOTATION_PROVIDER_ERROR',error:String(error?.message||error)};this.state.errors.annotate=clone(r);this.state.lastError=clone(r);return r;}
  }
  truth(){
    const scope=this.state.observedScope||this.state.integrity.scope||null,pagination=this.state.pagination||null,filters=this.state.filters||{},filtered=Object.entries(filters).some(([key,value])=>key!=='limit'&&key!=='cursor'&&value!=null&&value!==''),observedCount=scope&&Number.isFinite(Number(scope.count))?Number(scope.count):null,returned=this.state.events.length,observedCoverage=!scope?'UNKNOWN':(!filtered&&!pagination?.nextCursor&&observedCount===returned?'COMPLETE_OBSERVED':'PARTIAL_OBSERVED');
    return {owner:this.owner,providerOwner:'AuditEventProvider',eventCount:returned,returnedEventCount:returned,observedEventCount:observedCount,observedCoverage,upstreamCoverage:'UNKNOWN',totalUpstreamKnown:false,zeroObservedProvesCompleteCoverage:false,searchPageComplete:pagination?pagination.nextCursor==null:null,integrityStatus:this.state.integrity.status,firstInvalidSequence:this.state.integrity.firstInvalidSequence,persistence:'PROVIDER_DURABLE_JSONL',appendOnlyApplicationContract:true,databaseImmutabilityClaim:false,hashChain:'SHA-256',hashIsEncryption:false,commandReceiptsAreAuditTruth:false,annotationsSeparate:true,canonicalEventId:true,canonicalOccurredAt:true};
  }
}
export function createDurableAuditRuntimeAdapter(options={}){return new DurableAuditRuntimeAdapter(options);}
