import {AuditProvenanceInteractionCore} from '../foundation/audit/provenance.js';
import {createReviewDecisionPresentationSnapshot} from '../foundation/review/decision.js';
import {assertGenuineReviewAuditConsumer} from '../foundation/review/family-admission.js';
import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../foundation/collection/table-matrix.js';

const now=()=>new Date().toISOString();
const sha256Like=(value)=>/^[a-f0-9]{64}$/i.test(String(value||''));
const text=(value)=>String(value??'').trim();
const SHA256_K=Object.freeze([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const rotr=(value,bits)=>(value>>>bits)|(value<<(32-bits));
function sha256Hex(value){
  const bytes=new TextEncoder().encode(String(value));
  const paddedLength=Math.ceil((bytes.length+9)/64)*64;
  const data=new Uint8Array(paddedLength);data.set(bytes);data[bytes.length]=0x80;
  const view=new DataView(data.buffer),bitLow=(bytes.length*8)>>>0,bitHigh=Math.floor(bytes.length/0x20000000)>>>0;
  view.setUint32(paddedLength-8,bitHigh,false);view.setUint32(paddedLength-4,bitLow,false);
  const h=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const w=new Uint32Array(64);
  for(let offset=0;offset<paddedLength;offset+=64){
    for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4,false);
    for(let i=16;i<64;i++){const s0=rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3),s1=rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0}
    let [a,b,c,d,e,f,g,hh]=h;
    for(let i=0;i<64;i++){const s1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^((~e)&g),t1=(hh+s1+ch+SHA256_K[i]+w[i])>>>0,s0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)>>>0;hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}
    h[0]=(h[0]+a)>>>0;h[1]=(h[1]+b)>>>0;h[2]=(h[2]+c)>>>0;h[3]=(h[3]+d)>>>0;h[4]=(h[4]+e)>>>0;h[5]=(h[5]+f)>>>0;h[6]=(h[6]+g)>>>0;h[7]=(h[7]+hh)>>>0;
  }
  return Array.from(h,value=>value.toString(16).padStart(8,'0')).join('');
}
const requestDigest=value=>`sha256:${sha256Hex(value)}`;

export const VALIDATION_RULESET_IDENTITY=Object.freeze({id:'CEP_VALIDATION_RULESET_JSON_ARTIFACT',revision:'1',digest:'914d16ced1e6bd4be1c4904fd9442696b6e8da854840bf9a6bccd918a8e69cd3'});
export const VALIDATION_VALIDATOR_IDENTITY=Object.freeze({id:'CEP_BOUNDED_JSON_VALIDATOR',version:'1',digest:'3241a6e0e1eefb290cd07467a844baaed229511365afc5f617c13563e77d4d54'});
export const VALIDATION_STATES=Object.freeze(['QUEUED','RUNNING','TECHNICALLY_VALID','TECHNICALLY_INVALID','ERROR','UNAVAILABLE']);

const LOCAL_DATA_CLASSIFICATION=Object.freeze({label:'LOCAL_USER_INPUT__NON_CANONICAL',testOnly:false,deterministic:false,resettable:false,nonProduction:true,nonCanonical:true,providerAuthority:false,persistenceAuthority:false});
const DS01_DATA_CLASSIFICATION=Object.freeze({label:'TEST_ONLY__DETERMINISTIC__RESETTABLE__NON_PRODUCTION__NON_CANONICAL',testOnly:true,deterministic:true,resettable:true,nonProduction:true,nonCanonical:true,providerAuthority:false,persistenceAuthority:false});
const classifyArtifact=artifactRef=>String(artifactRef||'').startsWith('ds01://')?DS01_DATA_CLASSIFICATION:LOCAL_DATA_CLASSIFICATION;

function normalizedIdentity(parsed){
  const ruleset=parsed?.ruleset||{},validator=parsed?.validator||{};
  return {artifact:{ref:text(parsed?.artifactRef),digest:text(parsed?.artifactDigest)},ruleset:{id:text(ruleset.id??parsed?.rulesetId),revision:text(ruleset.revision??parsed?.rulesetRevision),digest:text(ruleset.digest??parsed?.rulesetDigest)},validator:{id:text(validator.id??parsed?.validatorId),version:text(validator.version??parsed?.validatorVersion),digest:text(validator.digest??parsed?.validatorDigest)}};
}
function identityFromRaw(raw){
  try{const parsed=JSON.parse(String(raw??''));return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?normalizedIdentity(parsed):null}catch{return null}
}
function sameIdentity(left,right){return !!left&&!!right&&left.artifact.ref===right.artifact.ref&&left.artifact.digest===right.artifact.digest&&left.ruleset.id===right.ruleset.id&&left.ruleset.revision===right.ruleset.revision&&left.ruleset.digest===right.ruleset.digest&&left.validator.id===right.validator.id&&left.validator.version===right.validator.version&&left.validator.digest===right.validator.digest;}

const defaultRuntime=Object.freeze({
  descriptor:()=>Object.freeze({providerId:'CEP_BOUNDED_JSON_VALIDATOR',providerKind:'LOCAL_BOUNDED_VALIDATOR',providerAuthority:false,persistenceAuthority:false}),
  available:()=>true,
  validate:async()=>({findings:[]})
});

export function createValidationConsumerAdapter(options:any={}){
  const consumerInput=Object.freeze({surface:'validation',routeKind:'PRODUCT',consumerKind:'GENUINE_REAL_PRODUCT',domainImplementation:'REAL_PRODUCT_COMPOSITION',proofConsumer:true,synthetic:false,fixture:false,contractOnly:false,profileUse:'READ_ONLY_EVIDENCE_NOT_PROOF'});
  const consumer=assertGenuineReviewAuditConsumer(consumerInput);
  const validatorRuntime=options?.validatorRuntime||defaultRuntime;
  const state:any={sequence:0,runs:[],processing:false,last:null};
  const findingsAdapter:CollectionTableMatrixDomainAdapter<any>={adapterId:'validation.technical-findings',rows:()=>state.last?.technicalFindings||[],rowId:r=>r.id,rowLabel:r=>r.message,searchableText:r=>`${r.code} ${r.ruleId} ${r.message} ${r.locator||''}`,columns:[{id:'code',label:'Code',cell:r=>({text:r.code,direction:'ltr',tone:r.severity==='ERROR'?'danger':'warning'})},{id:'rule',label:'Rule',cell:r=>({text:r.ruleId,direction:'ltr'})},{id:'message',label:'Technical finding',cell:r=>({text:r.message,secondary:r.locator||'',direction:'auto'})}],actions:()=>[]};
  const collection=new CollectionTableMatrixPresentationCore(findingsAdapter);
  const provider={descriptor:()=>({providerId:'ValidationRunLedgerProvider',domainKind:'validation-run-ledger',schemaVersion:'1.2.0',authorityRef:'ValidationConsumerAdapter.runs',label:'Current validation run ledger',providerAuthority:false,persistenceAuthority:false}),read:()=>{const observedAt=now(),entries=state.runs.flatMap(run=>[{id:`${run.requestId}:request`,label:`Validation request ${run.requestId}`,kind:'VALIDATION_REQUEST',timestamp:run.requestedAt,actorLabel:'Local product user',summary:`Artifact ${run.identity?.artifact?.ref||'unresolved'} · ${run.status}`,parentIds:[],correlationIds:[run.requestId],provenanceRefs:['ValidationConsumerAdapter.validate'],attributes:{inputDigest:run.inputDigest,status:run.status,artifactDigest:run.identity?.artifact?.digest||null,rulesetId:run.identity?.ruleset?.id||null,validatorId:run.identity?.validator?.id||null,dataClassification:run.dataClassification?.label||LOCAL_DATA_CLASSIFICATION.label,formalReviewFinding:false}},...(run.resultId?[{id:`${run.resultId}:result`,label:`Validation result ${run.resultId}`,kind:'VALIDATION_RESULT',timestamp:run.completedAt,actorLabel:'ValidationConsumerAdapter',summary:`${run.status} · ${run.technicalFindings.length} technical finding(s)`,parentIds:[`${run.requestId}:request`],correlationIds:[run.requestId,run.resultId],provenanceRefs:['ValidationConsumerAdapter.validate'],attributes:{technicalFindingCount:run.technicalFindings.length,formalReviewFinding:false,decisionAuthority:false,acceptanceAuthority:false,masteryAuthority:false,identity:run.identity,dataClassification:run.dataClassification?.label||LOCAL_DATA_CLASSIFICATION.label}}]:[])]);return {state:entries.length?'READY':'EMPTY',identity:{id:'validation-run-ledger',label:'Current validation run ledger',revision:String(state.sequence),correlationIds:state.last?[state.last.requestId]:[],provenanceRefs:['ValidationConsumerAdapter.runs']},entries,message:entries.length?'Validation request/result history from actual product runs.':'Run validation to create the first product record.',observedAt,freshness:{source:'CURRENT_PRODUCT_SESSION',observedAt,stale:false},truth:{technicalFindingIsFormalReviewFinding:false,formalReviewAuthority:false,acceptanceAuthority:false,masteryAuthority:false,providerAuthority:false,persistenceAuthority:false}}}};
  const provenance=new AuditProvenanceInteractionCore(provider);provenance.refresh();
  const addFinding=(run,ruleId,code,message,locator='',extra:any={})=>run.technicalFindings.push({id:`TF-${run.requestId}-${String(run.technicalFindings.length+1).padStart(2,'0')}`,ruleId,code,severity:extra.severity||'ERROR',message,locator,observed:extra.observed??null,expected:extra.expected??null,formalReviewFinding:false,formalReviewAuthority:false});
  const transition=(run,status,reason='')=>{run.status=status;run.transitions.push({requestId:run.requestId,status,at:now(),reason:reason||null});};
  const complete=(run,status,reason='')=>{transition(run,status,reason);run.resultId=`RES-${String(state.sequence).padStart(4,'0')}`;run.completedAt=now();state.processing=false;state.last=run;provenance.refresh();return structuredClone(run);};
  const validate=async raw=>{
    const input=String(raw??''),requestId=`VR-${String(++state.sequence).padStart(4,'0')}`,requestedAt=now();state.processing=true;
    const run:any={requestId,resultId:null,requestedAt,completedAt:null,inputDigest:requestDigest(input),inputDigestAlgorithm:'SHA-256',identity:null,status:'QUEUED',transitions:[],technicalFindings:[],dataClassification:LOCAL_DATA_CLASSIFICATION,limitations:['Technical validation only','No admission/review/mastery authority','No provider/persistence authority inferred from local execution']};
    transition(run,'QUEUED','REQUEST_ACCEPTED');state.runs.push(run);state.last=run;provenance.refresh();await Promise.resolve();transition(run,'RUNNING','LOCAL_VALIDATOR_DISPATCH');provenance.refresh();
    let parsed=null;try{parsed=JSON.parse(input)}catch{addFinding(run,'JSON_PARSE','INVALID_JSON','Input must be valid JSON.','$')}
    if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){
      run.identity=normalizedIdentity(parsed);run.dataClassification=classifyArtifact(run.identity.artifact.ref);
      if(!run.identity.artifact.ref)addFinding(run,'ARTIFACT_REF_REQUIRED','ARTIFACT_REF_MISSING','artifactRef is required.','$.artifactRef');
      if(!sha256Like(run.identity.artifact.digest))addFinding(run,'ARTIFACT_DIGEST_REQUIRED','ARTIFACT_DIGEST_MISSING','artifactDigest must be an exact SHA-256 identity.','$.artifactDigest');
      if(!run.identity.ruleset.id||!run.identity.ruleset.revision||!sha256Like(run.identity.ruleset.digest))addFinding(run,'RULESET_IDENTITY_REQUIRED','RULESET_IDENTITY_MISSING','Exact ruleset id/revision/digest are required.','$.ruleset');
      if(!run.identity.validator.id||!run.identity.validator.version||!sha256Like(run.identity.validator.digest))addFinding(run,'VALIDATOR_IDENTITY_REQUIRED','VALIDATOR_IDENTITY_MISSING','Exact validator id/version/digest are required.','$.validator');
      const validatorAvailable=run.identity.validator.id===VALIDATION_VALIDATOR_IDENTITY.id&&run.identity.validator.version===VALIDATION_VALIDATOR_IDENTITY.version&&run.identity.validator.digest===VALIDATION_VALIDATOR_IDENTITY.digest;
      const rulesetAvailable=run.identity.ruleset.id===VALIDATION_RULESET_IDENTITY.id&&run.identity.ruleset.revision===VALIDATION_RULESET_IDENTITY.revision&&run.identity.ruleset.digest===VALIDATION_RULESET_IDENTITY.digest;
      if(run.identity.validator.id&&run.identity.validator.version&&sha256Like(run.identity.validator.digest)&&!validatorAvailable)addFinding(run,'VALIDATOR_UNAVAILABLE','VALIDATOR_UNAVAILABLE','Declared validator identity is unavailable in this bounded local consumer.','$.validator',{observed:run.identity.validator,expected:VALIDATION_VALIDATOR_IDENTITY});
      if(run.identity.ruleset.id&&run.identity.ruleset.revision&&sha256Like(run.identity.ruleset.digest)&&!rulesetAvailable)addFinding(run,'RULESET_UNAVAILABLE','RULESET_UNAVAILABLE','Declared ruleset identity is unavailable in this bounded local consumer.','$.ruleset',{observed:run.identity.ruleset,expected:VALIDATION_RULESET_IDENTITY});
      if(validatorAvailable&&rulesetAvailable&&(!('payload' in parsed)||typeof parsed.payload!=='object'||parsed.payload===null||Array.isArray(parsed.payload)))addFinding(run,'PAYLOAD_OBJECT_REQUIRED','PAYLOAD_INVALID','payload must be a JSON object for this exact ruleset.','$.payload',{observed:parsed?.payload??null,expected:'JSON object'});
      const identityUnavailable=run.technicalFindings.some(f=>['VALIDATOR_UNAVAILABLE','VALIDATOR_IDENTITY_MISSING','RULESET_UNAVAILABLE','RULESET_IDENTITY_MISSING'].includes(f.code));
      if(identityUnavailable)return complete(run,'UNAVAILABLE','IDENTITY_OR_RULESET_UNAVAILABLE');
      const preflightInvalid=run.technicalFindings.length>0;
      if(validatorAvailable&&rulesetAvailable&&!preflightInvalid){
        try{
          const runtimeAvailable=typeof validatorRuntime?.available==='function'?await validatorRuntime.available({identity:structuredClone(run.identity),payload:parsed.payload}):validatorRuntime?.available!==false;
          if(!runtimeAvailable){addFinding(run,'VALIDATOR_RUNTIME','VALIDATOR_RUNTIME_UNAVAILABLE','The exact validator is declared but its execution provider is unavailable.','$.validator');return complete(run,'UNAVAILABLE','VALIDATOR_RUNTIME_UNAVAILABLE')}
          const runtimeResult=typeof validatorRuntime?.validate==='function'?await validatorRuntime.validate({identity:structuredClone(run.identity),payload:structuredClone(parsed.payload),requestId:run.requestId,inputDigest:run.inputDigest}):{findings:[]};
          const runtimeFindings=Array.isArray(runtimeResult)?runtimeResult:Array.isArray(runtimeResult?.findings)?runtimeResult.findings:[];
          for(const finding of runtimeFindings)addFinding(run,text(finding?.ruleId)||'VALIDATOR_RULE',text(finding?.code)||'VALIDATION_NONCONFORMANCE',text(finding?.message)||'Validator reported technical nonconformance.',text(finding?.locator),{severity:text(finding?.severity)||'ERROR',observed:finding?.observed,expected:finding?.expected});
        }catch(error){
          addFinding(run,'VALIDATOR_EXECUTION','VALIDATOR_EXECUTION_ERROR','Validator execution failed. Inspect safe diagnostics and retry only after the execution dependency is healthy.','$.validator',{severity:'ERROR',observed:String((error as any)?.name||'Error'),expected:'Successful bounded validator execution'});
          return complete(run,'ERROR','VALIDATOR_EXECUTION_ERROR');
        }
      }
      return complete(run,run.technicalFindings.length?'TECHNICALLY_INVALID':'TECHNICALLY_VALID',run.technicalFindings.length?'TECHNICAL_NONCONFORMANCE':'TECHNICAL_CONFORMANCE');
    }
    if(parsed!==null)addFinding(run,'ROOT_OBJECT_REQUIRED','ROOT_NOT_OBJECT','Validation input must be a JSON object.','$');
    return complete(run,'TECHNICALLY_INVALID','INPUT_STRUCTURE_INVALID');
  };
  const resolveRun=(resultId)=>resultId?state.runs.find(run=>run.resultId===resultId||run.requestId===resultId):state.last;
  const snapshot=()=>Object.freeze({surface:'validation',state:state.processing?'RUNNING':state.last?.status||'NOT_RUN',selectedResultId:state.last?.resultId||null,requests:state.runs.map(run=>({requestId:run.requestId,requestedAt:run.requestedAt,inputDigest:run.inputDigest,inputDigestAlgorithm:run.inputDigestAlgorithm,identity:structuredClone(run.identity),status:run.status,dataClassification:structuredClone(run.dataClassification)})),results:state.runs.filter(run=>run.resultId).map(run=>({resultId:run.resultId,requestId:run.requestId,status:run.status,completedAt:run.completedAt,identity:structuredClone(run.identity),inputDigest:run.inputDigest,technicalFindings:structuredClone(run.technicalFindings),dataClassification:structuredClone(run.dataClassification),acceptance:null,formalReviewAuthority:false,masteryAuthority:false})),history:state.runs.flatMap(run=>run.transitions.map(entry=>structuredClone(entry))),truth:{formalReviewAuthority:false,acceptanceAuthority:false,masteryAuthority:false,providerAuthority:false,persistenceAuthority:false}});
  const inspect=({resultId,currentIdentity,currentRaw}:any={})=>{const run=resolveRun(resultId);if(!run)return {ok:false,code:'VALIDATION_RESULT_NOT_FOUND'};const current=currentRaw!==undefined?identityFromRaw(currentRaw):(currentIdentity?normalizedIdentity(currentIdentity):null);const currentMatches=current?sameIdentity(run.identity,current):null;const code=currentMatches===false?'STALE_FOR_CURRENT_ARTIFACT':currentRaw!==undefined&&!current?'CURRENT_IDENTITY_UNRESOLVED':'VALIDATION_RESULT';return {ok:true,code,result:structuredClone(run),currentIdentity:current?structuredClone(current):null,currentIdentityMatches:currentMatches,acceptance:null,formalReviewFinding:false,formalReviewAuthority:false,masteryAuthority:false,limitations:[...run.limitations]};};
  const findings=({resultId}:any={})=>{const run=resolveRun(resultId);if(!run)return {ok:false,code:'VALIDATION_RESULT_NOT_FOUND',technicalFindings:[]};return {ok:true,code:'TECHNICAL_FINDINGS',resultId:run.resultId,technicalFindings:structuredClone(run.technicalFindings),formalReviewFindings:[],formalReviewAuthority:false,masteryAuthority:false};};
  const reviewSnapshot=()=>{const run=state.last;const presentation=createReviewDecisionPresentationSnapshot({id:'validation-review-boundary',title:'Validation review boundary',summary:'Technical validation results remain TechnicalFindings and are never promoted into W04 formal Review Findings by this surface.',state:'READ_ONLY',stateLabel:'Read only',stateMessage:run?`${run.status} · ${run.technicalFindings.length} TechnicalFinding(s)`:'No validation run yet.',direction:'auto',locale:'en',labels:{family:'Validation inspection',criteria:'Criteria',findings:'Formal review findings',decision:'Decision',supersession:'Supersession',unavailable:'Unavailable'},criteria:[{id:'technical-result',label:'Technical validation result',detail:run?`${run.status}; request digest ${run.inputDigest}`:'No run yet.',badge:run?.status||'Empty',tone:run?.status==='TECHNICALLY_INVALID'||run?.status==='ERROR'?'critical':run?.status==='UNAVAILABLE'?'attention':'info'},{id:'boundary',label:'TechnicalFinding ≠ W04 Review Finding',detail:'The shared review projection receives zero formal findings. Any future transformation requires separate governed W04 authority.',badge:'Enforced',tone:'attention'}],findings:[],decision:null,supersession:null,sourceNote:'ReviewDecisionPresentationOwner is presentation-only here and exposes no approve/reject/supersede mutation.'});return Object.freeze({...presentation,findings:[]})};
  return {consumerInput,consumer,state,provider,provenance,collection,validate,inspect,findings,snapshot,reviewSnapshot,refresh:()=>provenance.refresh(),truth:()=>Object.freeze({surface:'validation',realProductConsumer:true,runCount:state.runs.length,processing:state.processing,technicalFindingCount:state.last?.technicalFindings.length||0,technicalFindingConvertedToFormalReviewFinding:false,formalReviewAuthority:false,acceptanceAuthority:false,masteryAuthority:false,providerAuthority:false,persistenceAuthority:false,profileUsedAsProof:false,exactArtifactRulesetValidatorIdentity:true,dataClassification:structuredClone(state.last?.dataClassification||LOCAL_DATA_CLASSIFICATION),validatorRuntime:typeof validatorRuntime?.descriptor==='function'?validatorRuntime.descriptor():{providerAuthority:false,persistenceAuthority:false}})};
}
