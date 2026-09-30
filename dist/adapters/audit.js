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
export const AUDIT_COMMANDS=Object.freeze(['audit.search','audit.verify','audit.annotate','audit.export']);

/* Canonical AuditEvent material. Key order is part of the hashed bytes: canonical JSON is
   key-order sensitive, so this single shape is shared by append-time hashing, chain
   verification and per-record recomputation. */
const rowMaterial=row=>({sequence:row.sequence,eventId:String(row.eventId||`audit-${row.sequence}`),previousHash:row.previousHash,actor:row.actor,action:row.action,target:row.target,correlationId:row.correlationId,time:row.time,occurredAt:String(row.occurredAt||row.time),outcome:row.outcome,details:clone(row.details||{})});

/* Session audit history — realistic structured fixture data for the W05 record surface.
   Every row is appended through AuditEventDomain.append(), so the records below are genuinely
   hash-chained and verifiable; annotations stay in the separate annotation store. This is
   session-local observed history (persistence SESSION_LOCAL), never provider/database truth. */
const SESSION_ACTORS=Object.freeze({
  system:{name:'System',type:'system',account:'platform@cep.local',role:{ar:'منصة النظام',en:'Platform System'},group:{ar:'النظام الأساسي',en:'Core Platform'},client:'Scheduler',node:'runner-01'},
  scheduler:{name:'Scheduler',type:'system',account:'scheduler@cep.local',role:{ar:'مُجدوِل المهام',en:'Job Scheduler'},group:{ar:'النظام الأساسي',en:'Core Platform'},client:'Scheduler',node:'runner-02'},
  evidence:{name:'Evidence Service',type:'system',account:'evidence-svc@cep.local',role:{ar:'خدمة الأدلة',en:'Evidence Service'},group:{ar:'النظام الأساسي',en:'Core Platform'},client:'Evidence Service',node:'runner-01'},
  policy:{name:'Policy Engine',type:'system',account:'policy-eng@cep.local',role:{ar:'محرّك السياسات',en:'Policy Engine'},group:{ar:'الحوكمة',en:'Governance'},client:'Policy Engine',node:'runner-02'},
  sara:{name:'Sara',type:'user',account:'sara@cep.local',role:{ar:'مشغّلة محاكاة',en:'Simulation Operator'},group:{ar:'فريق المحاكاة',en:'Simulation Team'},client:'Web UI',ip:'10.10.30.55',session:'sess-8f3a93c2d6b1e',timezone:'Asia/Riyadh'},
  omar:{name:'Omar',type:'user',account:'omar@cep.local',role:{ar:'مهندس التكوين',en:'Configuration Engineer'},group:{ar:'فريق التشغيل',en:'Operations Team'},client:'Web UI',ip:'10.10.30.61',session:'sess-41c07ae5b9d2f',timezone:'Asia/Riyadh'},
  fadi:{name:'Fadi',type:'user',account:'fadi@cep.local',role:{ar:'محلّل النتائج',en:'Results Analyst'},group:{ar:'فريق المحاكاة',en:'Simulation Team'},client:'Web UI',ip:'10.10.30.47',session:'sess-b72d1f0c48a63',timezone:'Asia/Riyadh'},
  ahmed:{name:'Ahmed',type:'user',account:'ahmed@cep.local',role:{ar:'مدير الإصدارات',en:'Release Manager'},group:{ar:'فريق الإصدارات',en:'Release Engineering'},client:'Web UI',ip:'10.10.30.29',session:'sess-2e59ba7f1c084',timezone:'Asia/Riyadh'},
  controller:{name:'Controller',type:'controller',account:'controller@cep.local',role:{ar:'مراقب الامتثال',en:'Compliance Controller'},group:{ar:'الحوكمة',en:'Governance'},client:'Release Bot',node:'runner-01'}
});
/* [agoMinutes, actorKey, action, target, outcome, workspace, event source, trace id, extras] */
const SESSION_HISTORY=Object.freeze([
  [96,'system','PLATFORM_STARTUP','runtime/local-runtime','SUCCESS','System & Operations','Scheduler','TRACE-4E11-9A02',{}],
  [92,'scheduler','SESSION_TOKEN_ROTATED','auth/session-token','SUCCESS','System & Operations','Policy Engine','TRACE-4E11-9A02',{}],
  [87,'omar','EDIT_CONFIGURATION_OBJECT','CFG-OBJ-1127','SUCCESS','System & Operations','Web UI','TRACE-6D4E-9F01',{before:'{"retention_days":30}',after:'{"retention_days":45}'}],
  [83,'omar','VALIDATE_CONFIGURATION_REVISION','CFG-REV-0042','SUCCESS','System & Operations','Web UI','TRACE-6D4E-9F01',{related:['CFG-OBJ-1127']}],
  [78,'system','VALIDATE_BACKUP','BKP-2026-08-30-001','SUCCESS','System & Operations','Scheduler','TRACE-3C6D-7781',{related:['POL-BKP-0004']}],
  [74,'system','RESTORE_REHEARSAL','BKP-2026-08-30-001','PARTIAL_SUCCESS','System & Operations','Scheduler','TRACE-3C6D-7781',{notice:{ar:'اكتملت إعادة التشغيل التجريبي مع فرع واحد لم يُتحقّق منه بعد. أوقات التدقيق المعتمدة 08:00 – 18:00.',en:'The rehearsal completed with one branch still unverified. Approved audit window is 08:00 – 18:00.'}}],
  [70,'ahmed','PUBLISH_CONFIGURATION_REVISION','CFG-REV-0042','SUCCESS','System & Operations','Web UI','TRACE-8F7A-91C2',{related:['CFG-OBJ-1127']}],
  [66,'controller','PROMOTE_RELEASE','REL-2026.08.30-RC1','SUCCESS','System & Operations','Release Bot','TRACE-1A2B-4D8E',{related:['SIM-0098']}],
  [62,'ahmed','APPROVE_RELEASE_CANDIDATE','REL-2026.08.30-RC1','SUCCESS','System & Operations','Web UI','TRACE-1A2B-4D8E',{}],
  [57,'fadi','UPDATE_SIMULATION_PARAMETERS','SIM-0098','SUCCESS','Simulation','Web UI','TRACE-7E9D-0F34',{before:'{"seed":1042,"steps":500}',after:'{"seed":1042,"steps":1200}'}],
  [53,'policy','POLICY_EVALUATION','POL-SEC-0021','SUCCESS','System & Operations','Policy Engine','TRACE-9C1E-44D2',{related:['POL-BKP-0004']}],
  [49,'omar','ACCESS_DENIED','CFG-OBJ-1127','DENIED','System & Operations','Web UI','TRACE-6D4E-9F01',{notice:{ar:'رُفض التعديل خارج نافذة التدقيق المعتمدة؛ السجل يبقى مفتوحًا ولا تُطبَّق أي كتابة.',en:'The edit was rejected outside the approved audit window; the record stays open and no write is applied.'}}],
  [45,'system','PROCESSING_JOB_CREATED','job-7410db25','QUEUED','System & Operations','audit-service','TRACE-A24F-6B90',{related:['attempt-55b2c1']}],
  [41,'system','ATTEMPT_SUCCEEDED','job-7410db25','SUCCESS','System & Operations','Evidence Service','TRACE-A24F-6B90',{related:['attempt-55b2c1']}],
  [37,'fadi','START_SIMULATION_RUN','SIM-0098','SUCCESS','Simulation','Web UI','TRACE-7E9D-0F34',{related:['RUN-0042']}],
  [33,'system','SIMULATION_RUN_COMPLETED','RUN-0042','SUCCESS','Simulation','Scheduler','TRACE-7E9D-0F34',{related:['SIM-0098']}],
  [29,'fadi','CREATE_CANDIDATE_RESULT','RESULT-0042-R1','SUCCESS','Simulation','Web UI','TRACE-C4F1-2E77',{related:['RUN-0042']}],
  [25,'controller','SECURITY_REVIEW_OPENED','RESULT-0042-R1','SUCCESS','System & Operations','Policy Engine','TRACE-C4F1-2E77',{related:['POL-SEC-0021']}],
  [21,'system','AUDIT_EXPORT_PREPARED','audit/log-2026-08-30','SUCCESS','System & Operations','audit-service','TRACE-B07E-31AA',{}],
  [16,'fadi','RESULT_PUBLISHED','RESULT-0042-R1','SUCCESS','Simulation','Web UI','TRACE-C4F1-2E77',{}],
  [14,'evidence','EVIDENCE_FILE_STORED','EVD-FILE-7781','SUCCESS','Evidence','Evidence Service','TRACE-5B9C-22A1',{related:['RESULT-0042-R1']}],
  [10,'evidence','EVIDENCE_METADATA_INDEXED','EVD-FILE-7781','SUCCESS','Evidence','Evidence Service','TRACE-5B9C-22A1',{related:['RESULT-0042-R1']}],
  [6,'sara','CREATE_CANDIDATE_EVIDENCE_HANDOFF','RESULT-0042-R1','SUCCESS','Simulation','Web UI','TRACE-5B9C-22A1',{related:['EVD-FILE-7781','SIM-0098']}],
  [3,'system','INTEGRITY_WATERMARK_RECORDED','audit/chain','SUCCESS','System & Operations','audit-service','TRACE-B07E-31AA',{}]
]);
const SESSION_ANNOTATIONS=Object.freeze([
  [19,'omar','Export scope agreed with governance / نَوَعَ التصدير متفق عليه مع الحوكمة'],
  [20,'controller','Evidence file sealed for review — رُبط ملف الدليل للمراجعة'],
  [6,'controller','Configuration revision verified against baseline / تحقّقت المراجعة من خط الأساس']
]);

export class AuditEventDomain{
  constructor({clock=now,seed=true}={}){
    this.owner=AUDIT_DOMAIN_OWNER;this.clock=clock;this.events=[];this.annotations=[];this.annotationSequence=0;
    if(!seed)return;
    this.append({actor:'Local product user',action:'AUDIT_DOMAIN_INITIALIZED',target:'audit',outcome:'READY',correlationId:'audit-session',details:{coverage:'PARTIAL_OBSERVED',persistence:'SESSION_LOCAL',databaseImmutabilityClaim:false}});
    const base=Date.now();
    SESSION_HISTORY.forEach(([ago,who,action,target,outcome,workspace,source,trace,extra={}])=>{
      const persona=SESSION_ACTORS[who]||SESSION_ACTORS.system;
      this.append({eventId:`EVT-${trace.slice(6)}-${String(this.events.length+1).padStart(4,'0')}`,occurredAt:new Date(base-ago*60000).toISOString(),actor:persona.name,action,target,outcome,correlationId:trace,details:{workspace,source,client:persona.client,node:persona.node,ip:persona.ip,session:persona.session,timezone:persona.timezone,account:persona.account,role:persona.role,group:persona.group,actorType:persona.type,service:'audit-service',environment:'prod',region:'ME-01',...extra}});
    });
    SESSION_ANNOTATIONS.forEach(([index,who,note])=>{const row=this.events[index+1];if(row)this.annotate({eventId:row.eventId,actor:(SESSION_ACTORS[who]||{}).account||who,note});});
  }
  _material(event,sequence,previousHash){const eventId=String(event.eventId||event.id||`audit-${sequence}`),occurredAt=String(event.occurredAt||event.time||this.clock());return {sequence,eventId,previousHash,actor:String(event.actor||'Local product user'),action:String(event.action||'AUDIT_EVENT'),target:String(event.target||'application'),correlationId:String(event.correlationId||`audit-${sequence}`),time:occurredAt,occurredAt,outcome:String(event.outcome||'OBSERVED'),details:clone(event.details||{})};}
  append(event={}){const sequence=this.events.length+1,previousHash=this.events.at(-1)?.recordHash||'GENESIS',material=this._material(event,sequence,previousHash),recordHash=sha256Text(canonical(material)),row=Object.freeze({...material,recordHash});this.events.push(row);return clone(row);}
  rows(){return this.events.map(clone);}
  annotationsFor(eventId){return this.annotations.filter(row=>row.eventId===eventId).map(clone);}
  search({query='',limit=100}={}){const before=this.events.length,needle=String(query||'').trim().toLocaleLowerCase('en-US'),rows=this.events.filter(row=>!needle||canonical(row).toLocaleLowerCase('en-US').includes(needle)).slice(-Math.max(1,Math.min(500,Number(limit)||100))).map(clone);return {ok:true,owner:this.owner,query:String(query||''),rows,totalObserved:this.events.length,returned:rows.length,mutatedAuditEventCount:this.events.length-before,coverage:'PARTIAL_OBSERVED'};}
  verifyObserved(rows=this.events){let previous='GENESIS';for(let i=0;i<rows.length;i++){const row=rows[i],material=rowMaterial(row),expected=sha256Text(canonical(material)),sequence=i+1;if(row.sequence!==sequence||row.previousHash!==previous||row.recordHash!==expected)return {ok:true,owner:this.owner,status:'INVALID_CHAIN',firstInvalidSequence:row.sequence||sequence,scope:{fromSequence:1,toSequence:rows.length,watermark:this.events.at(-1)?.recordHash||'GENESIS'},hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};previous=row.recordHash;}return {ok:true,owner:this.owner,status:'VALID_CHAIN',firstInvalidSequence:null,scope:{fromSequence:rows.length?1:0,toSequence:rows.length,watermark:this.events.at(-1)?.recordHash||'GENESIS'},hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};}
  verify(){return this.verifyObserved(this.events);}
  /* Per-record recomputation: real SHA-256 evidence for each row of the session chain, used by
     the surface's verification log. `ok` is the recomputed truth, never a claim. */
  checks(){let previous='GENESIS';return this.events.map((row,i)=>{const material=rowMaterial(row),expected=sha256Text(canonical(material)),sequence=i+1,sequenceOk=row.sequence===sequence,linkOk=row.previousHash===previous,hashOk=row.recordHash===expected;previous=row.recordHash;return {sequence:row.sequence,eventId:row.eventId,occurredAt:String(row.occurredAt||row.time),action:row.action,recordHash:row.recordHash,previousHash:row.previousHash,expected,sequenceOk,linkOk,hashOk,ok:sequenceOk&&linkOk&&hashOk};});}
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
    refresh:()=>provenance.refresh(),integrity:()=>clone(lastIntegrity),checks:()=>domain.checks(),annotations:()=>domain.annotations.map(clone),truth:()=>Object.freeze({...domain.truth(),surface:'audit',realProductConsumer:true,formalReviewAuthority:false,profileUsedAsProof:false,semanticCommandReceiptsAreAuditEvents:false})
  };
  return Object.freeze(api);
}


/* CG6 durable provider binding. AuditEvent storage/hash-chain ownership remains in the
   approved app-wide AuditEventProvider; this adapter owns only W05 search/verify/annotate semantics. */
export class DurableAuditRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport()}={}){this.owner='W05DurableAuditRuntimeAdapter';this.transport=transport;this.state={events:[],pagination:null,filters:{},integrity:{status:'UNVERIFIED',firstInvalidSequence:null,scope:null},annotations:[],lastError:null};}
  descriptor(){return {owner:this.owner,semanticOwner:AUDIT_DOMAIN_OWNER,providerOwner:'AuditEventProvider',providerStorage:'DURABLE_JSONL',semanticCommandReceiptsAreAuditEvents:false,hashAlgorithm:'SHA-256',hashIsEncryption:false,databaseImmutabilityProven:false,annotationsStoredSeparately:true,surfaceSemanticsMovedIntoProvider:false};}
  snapshot(){return clone(this.state);}
  async search(filters={}){const params=new URLSearchParams();for(const key of ['actor','action','target','outcome','correlationId','from','to','limit','cursor'])if(filters[key]!=null&&filters[key]!=='')params.set(key,String(filters[key]));const r=await this.transport.request('GET',`/v1/audit/events${params.size?`?${params.toString()}`:''}`);if(r.ok){this.state.events=(r.events||[]).map(clone);this.state.pagination=clone(r.pagination||null);this.state.filters=clone(r.filters||filters);this.state.lastError=null;}else this.state.lastError=clone(r);return r;}
  async verify(){const r=await this.transport.request('GET','/v1/audit/verify');if(r.ok){this.state.integrity={status:r.valid?'VALID_CHAIN':'INVALID_CHAIN',valid:r.valid,firstInvalidSequence:r.firstInvalidSequence??null,scope:clone(r.observedScope||null)};this.state.lastError=null;}else this.state.lastError=clone(r);return r;}
  async annotate({eventId,note,actor='Local product user'}={}){const r=await this.transport.request('POST','/v1/audit/annotations',{eventId,actor,note});if(r.ok){this.state.annotations.push(clone(r.annotation));this.state.lastError=null;}else this.state.lastError=clone(r);return r;}
  /* AuditEventProvider recomputes every record server side; no client-side per-record claim is made. */
  checks(){return null;}
  truth(){return {owner:this.owner,providerOwner:'AuditEventProvider',eventCount:this.state.events.length,integrityStatus:this.state.integrity.status,firstInvalidSequence:this.state.integrity.firstInvalidSequence,persistence:'PROVIDER_DURABLE_JSONL',appendOnlyApplicationContract:true,databaseImmutabilityClaim:false,hashChain:'SHA-256',hashIsEncryption:false,commandReceiptsAreAuditTruth:false,annotationsSeparate:true};}
}
export function createDurableAuditRuntimeAdapter(options={}){return new DurableAuditRuntimeAdapter(options);}
