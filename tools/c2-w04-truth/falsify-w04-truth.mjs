import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  W04EvidenceDomain,
  createW04EvidenceDemoRecords
} from '../../dist/adapters/evidence/domain.js';
import {
  W04ReviewDomain,
  createW04ReviewDemoRecords,
  REVIEW_DECISION_OUTCOMES
} from '../../dist/adapters/reviews/domain.js';
import {
  W04MasteryDomain,
  createW04MasteryDemoRecords
} from '../../dist/adapters/mastery/domain.js';
import {
  W04PortfolioDomain,
  createW04PortfolioDemoRecords
} from '../../dist/adapters/portfolio/domain.js';
import {createW04RescueComposition} from '../../dist/surfaces/composition/w04-rescue.js';
import {AnalyticalCompareOwner} from '../../dist/foundation/analytical/compare.js';

const result={schemaVersion:1,mission:'CORR02_C2_W04_PRODUCT_DATA_ACTION_TRUTH',checks:[]};
const check=(id,fn)=>{try{const detail=fn();result.checks.push({id,pass:true,detail:detail??null});}catch(error){result.checks.push({id,pass:false,error:String(error?.stack||error)});}};

check('normal-defaults-empty',()=>{
  assert.equal(new W04EvidenceDomain().records.length,0);
  assert.equal(new W04ReviewDomain().records.length,0);
  assert.equal(new W04MasteryDomain().records.length,0);
  assert.equal(new W04PortfolioDomain().records.length,0);
  return {evidence:0,reviews:0,mastery:0,portfolio:0};
});

check('demo-fixtures-explicit-only',()=>{
  assert.ok(createW04EvidenceDemoRecords().length>0);
  assert.ok(createW04ReviewDemoRecords().length>0);
  assert.ok(createW04MasteryDemoRecords().every(row=>row.truthClass==='SYNTHETIC_DEMO_SEED'));
  assert.ok(createW04PortfolioDemoRecords().every(row=>row.truthClass==='SYNTHETIC_DEMO_SEED'));
  return {explicitFactories:true};
});

check('evidence-unverified-candidate-truth',()=>{
  const d=new W04EvidenceDomain();
  const imported=d.importEvidence({id:'candidate-c2',revisionId:'candidate-r1',sourceId:'local-source',sourceRevision:'r1',title:'Local candidate',subject:'subject:local',evidenceClaim:'Declared candidate claim',criterionRefs:[],governedPurpose:'Candidate intake preparation',verification:{status:'UNVERIFIED'}});
  assert.equal(imported.ok,true);
  assert.equal(imported.record.status,'CANDIDATE');
  assert.equal(imported.record.verification.status,'UNVERIFIED');
  assert.equal(imported.record.digest,null);
  assert.equal(imported.record.sourceBytesAvailable,null);
  assert.equal(imported.record.schemaValid,null);
  assert.equal(imported.record.producerIdentity,null);
  const submitted=d.submitCandidate('candidate-c2');
  assert.equal(submitted.ok,true);
  const admission=d.admit('candidate-c2');
  assert.equal(admission.ok,false);
  assert.equal(admission.code,'SOURCE_VERIFICATION_REQUIRED');
  return {importVerification:imported.record.verification.status,admission:admission.code};
});

check('evidence-presentation-assertions-rejected',()=>{
  const d=new W04EvidenceDomain();
  const rejected=d.importEvidence({id:'forged',revisionId:'r1',sourceId:'s',sourceRevision:'sr1',subject:'subject:x',evidenceClaim:'x',governedPurpose:'test',digest:'sha256:3333333333333333',sourceBytesAvailable:true,schemaValid:true,producerIdentity:'owner:local'});
  assert.equal(rejected.ok,false);
  assert.equal(rejected.code,'VERIFICATION_ASSERTION_REQUIRES_PROVIDER_ENVELOPE');
  assert.equal(d.records.length,0);
  return {code:rejected.code,assertions:rejected.assertions};
});

check('evidence-verified-assertion-requires-bound-provider',()=>{
  const d=new W04EvidenceDomain();
  const rejected=d.importEvidence({id:'verified',revisionId:'r1',sourceId:'s',sourceRevision:'sr1',subject:'subject:x',evidenceClaim:'verified candidate',governedPurpose:'test',verification:{status:'VERIFIED',providerId:'forged-provider',proofRef:'forged-proof',digest:'sha256:abcd',sourceBytesAvailable:true,schemaValid:true,producerIdentity:'forged-producer'}});
  assert.equal(rejected.ok,false);
  assert.equal(rejected.code,'VERIFICATION_PROVIDER_UNBOUND');
  assert.equal(d.records.length,0);
  return {code:rejected.code,verifiedRecordCreated:false};
});

check('review-finding-requires-explicit-content',()=>{
  const d=new W04ReviewDomain([{id:'r',revisionId:'rr1',evidenceRefs:['e@r1'],criteriaRefs:['criterion:1'],reviewer:{identity:'reviewer:test',permissionProofRef:'perm:test',authorityAvailable:true,assignmentPermissionAvailable:true},state:'IN_REVIEW',findings:[],decision:null,decisionHistory:[]}]);
  const missing=d.finding('r',{findingId:'f1',text:'',state:'NOT_ASSESSABLE',criterionRef:'criterion:1'});
  assert.equal(missing.ok,false);assert.equal(missing.code,'FINDING_INPUT_REQUIRED');
  const explicit=d.finding('r',{findingId:'f1',text:'Observed criterion gap from pinned evidence.',state:'NOT_SATISFIED',criterionRef:'criterion:1'});
  assert.equal(explicit.ok,true);assert.equal(explicit.finding.text,'Observed criterion gap from pinned evidence.');
  return {missing:missing.code,explicitState:explicit.finding.state};
});

check('review-decision-vocabulary-and-input-truth',()=>{
  assert.deepEqual([...REVIEW_DECISION_OUTCOMES],['ACCEPT','ACCEPT_WITH_LIMITATIONS','MORE_EVIDENCE_REQUIRED','REJECT']);
  const base={id:'r',revisionId:'rr1',evidenceRefs:['e@r1'],criteriaRefs:['criterion:1'],reviewer:{identity:'reviewer:test',permissionProofRef:'perm:test',authorityAvailable:true,assignmentPermissionAvailable:true},state:'READY_FOR_DECISION',findings:[{id:'f1',text:'Explicit finding',state:'NOT_ASSESSABLE',criterionRef:'criterion:1',scopeDisposition:'IN_SCOPE'}],decision:null,decisionHistory:[],effectiveDecisionId:null};
  const d=new W04ReviewDomain([base]);
  const invalid=d.supersede('r',{expectedDecisionId:null,newDecision:{decisionId:'d1',outcome:'INCONCLUSIVE',correctionReason:'basis'},correctionReason:'basis'});
  assert.equal(invalid.ok,false);assert.equal(invalid.code,'DECISION_OUTCOME_INVALID');
  const valid=d.supersede('r',{expectedDecisionId:null,newDecision:{decisionId:'d2',outcome:'MORE_EVIDENCE_REQUIRED',correctionReason:'Pinned finding requires more evidence.'},correctionReason:'Pinned finding requires more evidence.'});
  assert.equal(valid.ok,true);assert.equal(valid.decision.outcome,'MORE_EVIDENCE_REQUIRED');
  return {invalid:invalid.code,valid:valid.decision.outcome};
});

check('default-composition-empty-and-command-complete',()=>{
  const group=createW04RescueComposition({analyticalCompareOwner:new AnalyticalCompareOwner()});
  assert.equal(group.evidence.domain.records.length,0);
  assert.equal(group.reviews.domain.records.length,0);
  assert.equal(group.mastery.domain.records.length,0);
  assert.equal(group.portfolio.domain.records.length,0);
  assert.deepEqual([...group.evidence.commands],['evidence.inspect','evidence.import','evidence.amend','evidence.admit','evidence.sourceChoice']);
  assert.deepEqual([...group.reviews.commands],['reviews.review','reviews.finding','reviews.compare','reviews.supersede']);
  assert.deepEqual([...group.mastery.toolbarCommandIds],['mastery.inspect','mastery.explain','mastery.reevaluate']);
  assert.deepEqual([...group.portfolio.toolbarCommandIds],['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group']);
  return {evidence:5,reviews:4,mastery:3,portfolio:4};
});

const source=await readFile(new URL('../../stack/native-typescript/surfaces/m0-controller-composition.ts',import.meta.url),'utf8');
check('composition-static-negative-falsification',()=>{
  assert.equal(source.includes(".slice(0,3)"),false);
  assert.equal(source.includes("Workbench finding"),false);
  assert.equal(source.includes("outcome:'INCONCLUSIVE'"),false);
  assert.equal(source.includes("sha256:3333333333333333"),false);
  assert.equal(source.includes("new SemanticCommandBus"),false);
  return {truncation:false,generatedFinding:false,invalidDecision:false,fakeDigest:false,secondBus:false};
});

result.pass=result.checks.every(check=>check.pass);
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exitCode=1;
