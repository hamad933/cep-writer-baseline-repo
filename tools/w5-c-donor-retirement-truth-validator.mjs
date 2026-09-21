import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const RETIRE_READY='RETIRE_READY';
export const KEEP='KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE';
export const ALLOWED_DISPOSITIONS=new Set([RETIRE_READY,KEEP]);
const EXPECTED_IDS=Array.from({length:46},(_,i)=>`D${String(i+1).padStart(2,'0')}`);

const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
const nonEmptyArray=v=>Array.isArray(v)&&v.length>0;
const evidenceRefsPass=(refs,evidenceIndex)=>nonEmptyArray(refs)&&refs.every(id=>evidenceIndex.get(id)==='PASS');
const coverageChannel=(entry,key)=>String(entry.coverage?.[key]??'').trim();
const isNA=v=>/^n\/?a(?:\b|\s|:|-)|^not applicable\b/i.test(v);

export function buildEvidenceIndex(executableProof,browserProof){
 const index=new Map();
 for(const c of executableProof?.cases??[]) if(nonEmpty(c?.id)) index.set(c.id,c.status);
 for(const s of browserProof?.proof?.steps??browserProof?.steps??[]) if(nonEmpty(s?.id)) index.set(s.id,s.status);
 return index;
}

export function evaluateRetirementInvariants(entry,evidenceIndex=new Map()){
 const replacementOwnerPath=nonEmpty(entry?.replacement?.owner)&&nonEmpty(entry?.replacement?.path);
 const replacementExecutable=evidenceRefsPass(entry?.replacementExecutableEvidenceRefs,evidenceIndex);
 const realConsumerProof=nonEmptyArray(entry?.realConsumerProof)&&evidenceRefsPass(entry?.realConsumerEvidenceRefs,evidenceIndex);
 const channels=['pointer','keyboard','accessibility','browser'];
 const channelChecks=channels.map(channel=>{
  const value=coverageChannel(entry,channel);
  if(!value) return {channel,pass:false,reason:'COVERAGE_EMPTY'};
  if(isNA(value)){
   const reason=entry?.coverageNARationale?.[channel];
   return {channel,pass:nonEmpty(reason),reason:nonEmpty(reason)?reason:'N_A_REASON_REQUIRED'};
  }
  const refs=entry?.interactionEvidenceRefs?.[channel]??entry?.interactionEvidenceRefs?.all;
  return {channel,pass:evidenceRefsPass(refs,evidenceIndex),reason:evidenceRefsPass(refs,evidenceIndex)?'EVIDENCE_PASS':'PASSING_INTERACTION_EVIDENCE_REQUIRED'};
 });
 const interactionCoverage=channelChecks.every(x=>x.pass);
 let centralChange=false;
 if(entry?.centralChangeApplicable===false) centralChange=nonEmpty(entry?.centralChangeNotApplicableReason);
 else centralChange=entry?.centralChangeProofReachesReplacement===true&&evidenceRefsPass(entry?.centralChangeEvidenceRefs,evidenceIndex);
 const visualPreservation=nonEmpty(entry?.visualInteractionPreservation)&&evidenceRefsPass(entry?.visualPreservationEvidenceRefs,evidenceIndex);
 const hiddenOwnerFalse=entry?.hiddenDonorSemanticOwnerPathRemains===false&&entry?.hiddenOwnerAssessment?.remains===false&&nonEmptyArray(entry?.hiddenOwnerAssessment?.sourceEvidence)&&entry?.hiddenOwnerAssessment?.conclusion==='NO_HIDDEN_DONOR_SEMANTIC_OWNER_PATH';
 const checks={replacementOwnerPath,replacementExecutable,realConsumerProof,interactionCoverage,centralChange,visualPreservation,hiddenOwnerFalse};
 return {pass:Object.values(checks).every(Boolean),checks,interactionChannels:channelChecks};
}

export function validateInventoryData(inventory,{evidenceIndex=new Map(),runNegativeFixtures=false}={}){
 const entries=Array.isArray(inventory?.entries)?inventory.entries:[];
 const ids=entries.map(e=>e.id);
 const uniqueIds=new Set(ids);
 const coverageComplete=entries.length===46&&uniqueIds.size===46&&EXPECTED_IDS.every(id=>uniqueIds.has(id));
 const unknownDisposition=entries.filter(e=>!ALLOWED_DISPOSITIONS.has(e.disposition)).map(e=>e.id);
 const evaluations=entries.map(entry=>({id:entry.id,disposition:entry.disposition,evaluation:evaluateRetirementInvariants(entry,evidenceIndex)}));
 const invalidRetireReady=evaluations.filter(x=>x.disposition===RETIRE_READY&&!x.evaluation.pass).map(x=>x.id);
 const incompleteNotKeep=evaluations.filter(x=>!x.evaluation.pass&&x.disposition!==KEEP).map(x=>x.id);
 const hiddenContradictions=entries.filter(e=>e.disposition===RETIRE_READY&&e.hiddenDonorSemanticOwnerPathRemains!==false).map(e=>e.id);
 const requirements={
  17:{status:coverageComplete&&unknownDisposition.length===0?'PASS':'FAIL',coverageComplete,classifiedExactlyOnce:coverageComplete,unknownDisposition},
  18:{status:invalidRetireReady.length===0&&hiddenContradictions.length===0?'PASS':'FAIL',invalidRetireReady,hiddenContradictions},
  19:{status:incompleteNotKeep.length===0?'PASS':'FAIL',incompleteNotKeep}
 };
 let negativeFixtures=null;
 if(runNegativeFixtures){
  const base={
   id:'NEG',replacement:{owner:'Owner',path:'path.ts'},realConsumerProof:['Library'],coverage:{pointer:'n/a',keyboard:'n/a',accessibility:'n/a',browser:'n/a'},coverageNARationale:{pointer:'fixture N/A',keyboard:'fixture N/A',accessibility:'fixture N/A',browser:'fixture N/A'},replacementExecutableEvidenceRefs:['NEG_PASS'],realConsumerEvidenceRefs:['NEG_PASS'],interactionEvidenceRefs:{all:['NEG_PASS']},centralChangeApplicable:false,centralChangeNotApplicableReason:'fixture N/A',visualInteractionPreservation:'fixture preserved',visualPreservationEvidenceRefs:['NEG_PASS'],hiddenOwnerAssessment:{remains:false,sourceEvidence:['fixture source'],conclusion:'NO_HIDDEN_DONOR_SEMANTIC_OWNER_PATH'},hiddenDonorSemanticOwnerPathRemains:false,disposition:RETIRE_READY
  };
  const idx=new Map(evidenceIndex);idx.set('NEG_PASS','PASS');
  const hiddenTrue={...base,hiddenDonorSemanticOwnerPathRemains:true,hiddenOwnerAssessment:{...base.hiddenOwnerAssessment,remains:true,conclusion:'HIDDEN_DONOR_SEMANTIC_OWNER_REMAINS'}};
  const incomplete={...base,replacementExecutableEvidenceRefs:[]};
  const hiddenRejected=!evaluateRetirementInvariants(hiddenTrue,idx).pass;
  const incompleteRejected=!evaluateRetirementInvariants(incomplete,idx).pass;
  const injectedEntries=entries.map(e=>structuredClone(e));
  const injectTarget=injectedEntries[0]??structuredClone(base);
  Object.assign(injectTarget,{disposition:RETIRE_READY,hiddenDonorSemanticOwnerPathRemains:true,hiddenOwnerAssessment:{remains:true,sourceEvidence:['deliberate injected contradiction'],conclusion:'HIDDEN_DONOR_SEMANTIC_OWNER_REMAINS'}});
  if(injectedEntries.length===0) injectedEntries.push(injectTarget);
  const injectedInventory={...inventory,entries:injectedEntries};
  const injectedValidation=validateInventoryData(injectedInventory,{evidenceIndex:idx,runNegativeFixtures:false});
  const requirement18Fails=injectedValidation.requirements[18].status==='FAIL';
  negativeFixtures={
   hiddenTrueRetireReadyRejected:hiddenRejected,
   incompleteRetireReadyRejected:incompleteRejected,
   injectedInvalidRetireReadyMakesRequirement18Fail:requirement18Fails,
   status:hiddenRejected&&incompleteRejected&&requirement18Fails?'PASS':'FAIL'
  };
 }
 const readyEvaluations=evaluations.filter(x=>x.disposition===RETIRE_READY);
 const mandatoryChecks=[
  {id:1,title:'zero RETIRE_READY entries have hiddenDonorSemanticOwnerPathRemains !== false',status:hiddenContradictions.length===0?'PASS':'FAIL',detail:hiddenContradictions},
  {id:2,title:'every RETIRE_READY has non-empty replacement owner/path and executable proof',status:readyEvaluations.every(x=>x.evaluation.checks.replacementOwnerPath&&x.evaluation.checks.replacementExecutable)?'PASS':'FAIL'},
  {id:3,title:'every RETIRE_READY has real-consumer proof',status:readyEvaluations.every(x=>x.evaluation.checks.realConsumerProof)?'PASS':'FAIL'},
  {id:4,title:'every RETIRE_READY has applicable browser/interaction evidence or explicit N/A reasons',status:readyEvaluations.every(x=>x.evaluation.checks.interactionCoverage)?'PASS':'FAIL'},
  {id:5,title:'every RETIRE_READY satisfies central-change evidence where applicable',status:readyEvaluations.every(x=>x.evaluation.checks.centralChange)?'PASS':'FAIL'},
  {id:6,title:'every RETIRE_READY has visual/interaction preservation evidence',status:readyEvaluations.every(x=>x.evaluation.checks.visualPreservation)?'PASS':'FAIL'},
  {id:7,title:'every entry not fully satisfying retirement invariants is KEEP',status:incompleteNotKeep.length===0?'PASS':'FAIL',detail:incompleteNotKeep},
  {id:8,title:'all 46 donor candidate branches are classified exactly once',status:coverageComplete?'PASS':'FAIL',detail:{entryCount:entries.length,uniqueIds:uniqueIds.size}},
  {id:9,title:'no unknown disposition exists',status:unknownDisposition.length===0?'PASS':'FAIL',detail:unknownDisposition},
  {id:10,title:'negative fixture RETIRE_READY + hidden owner true is rejected',status:negativeFixtures?negativeFixtures.hiddenTrueRetireReadyRejected?'PASS':'FAIL':'NOT_RUN'},
  {id:11,title:'deliberate incomplete RETIRE_READY fixture is rejected',status:negativeFixtures?negativeFixtures.incompleteRetireReadyRejected?'PASS':'FAIL':'NOT_RUN'},
  {id:12,title:'Requirement 18 fails when an invalid RETIRE_READY is injected',status:negativeFixtures?negativeFixtures.injectedInvalidRetireReadyMakesRequirement18Fail?'PASS':'FAIL':'NOT_RUN'}
 ];
 const status=Object.values(requirements).every(r=>r.status==='PASS')&&(!negativeFixtures||negativeFixtures.status==='PASS')&&mandatoryChecks.every(c=>c.status==='PASS'||(!runNegativeFixtures&&c.status==='NOT_RUN'))?'PASS':'FAIL';
 return {status,requirements,evaluations,negativeFixtures,mandatoryChecks,summary:{entries:entries.length,retireReady:entries.filter(e=>e.disposition===RETIRE_READY).length,keep:entries.filter(e=>e.disposition===KEEP).length,unknownDisposition:unknownDisposition.length}};
}

async function cli(){
 const root=new URL('../',import.meta.url);
 const inventoryPath=new URL('assurance/W5_C_DONOR_RETIREMENT_INVENTORY.json',root);
 const proofPath=new URL('assurance/W5_C_STRUCTURED_CONSUMER_PARITY_PROOF.json',root);
 const browserPath=new URL('assurance/W5_C_BROWSER/W5_C_BROWSER_PROOF.json',root);
 const [inventory,proof,browser]=await Promise.all([inventoryPath,proofPath,browserPath].map(async u=>JSON.parse(await readFile(u,'utf8'))));
 const result=validateInventoryData(inventory,{evidenceIndex:buildEvidenceIndex(proof,browser),runNegativeFixtures:true});
 const output={schemaVersion:1,kind:'W5_C_DONOR_RETIREMENT_TRUTH_VALIDATOR_PROOF',status:result.status,sourceCanonicalTreeSha256:inventory.sourceCanonicalTreeSha256,requirements:result.requirements,negativeFixtures:result.negativeFixtures,mandatoryChecks:result.mandatoryChecks,summary:result.summary,retireReadyEvaluations:result.evaluations.filter(x=>x.disposition===RETIRE_READY)};
 await writeFile(new URL('assurance/W5_C_DONOR_RETIREMENT_TRUTH_VALIDATOR_PROOF.json',root),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify(output,null,2));
 if(result.status!=='PASS') process.exitCode=1;
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url));
if(invoked) await cli();
