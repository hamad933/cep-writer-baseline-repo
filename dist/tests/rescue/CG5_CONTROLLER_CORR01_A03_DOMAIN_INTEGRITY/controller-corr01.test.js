import assert from 'node:assert/strict';
import {W04EvidenceDomain} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain} from '../../../adapters/portfolio/domain.js';
import {createW04RescueComposition} from '../../../surfaces/composition/w04-rescue.js';

const e=new W04EvidenceDomain();
const base={revisionId:'cand-r0',title:'Candidate',sourceBytesAvailable:true,schemaValid:true,digest:'sha256:candidate',sourceId:'source-x',sourceRevision:'source-r1',actor:'owner:local',subject:'user:self',evidenceClaim:'Demonstrates criterion X',criterionRefs:['criteria:x'],selectedMaterialRefs:['source-x@source-r1'],admissionAuthority:{available:true,proofRef:'auth:x'}};
const c=e.importEvidence({id:'cand-x',...base});assert.equal(c.ok,true);assert.equal(c.record.candidateState,'PREPARED');
assert.equal(e.admit('cand-x',{expectedPriorRevisionId:null}).code,'CANDIDATE_NOT_SUBMITTED_FOR_INTAKE');
assert.equal(e.markCandidateValidated('cand-x',{validationProofRef:'validate:x'}).ok,true);assert.equal(e.inspect('cand-x').candidateState,'PREPARED');
assert.equal(e.submitCandidate('cand-x',{expectedCandidateRevision:1}).ok,true);const admitted=e.admit('cand-x',{expectedPriorRevisionId:null});assert.equal(admitted.ok,true);
const dup=e.importEvidence({id:'cand-dup',...base});assert.equal(dup.code,'SEMANTIC_DUPLICATE_CANDIDATE');
const editable=e.importEvidence({id:'cand-edit',...base,sourceId:'source-edit',sourceRevision:'r1',selectedMaterialRefs:['source-edit@r1']});assert.equal(editable.ok,true);assert.equal(e.updateCandidate('cand-edit',{expectedCandidateRevision:1,evidenceClaim:'Updated claim'}).ok,true);assert.equal(e.inspect('cand-edit').sourceId,'source-edit');assert.equal(e.updateCandidate('cand-edit',{sourceId:'evil'}).code,'SOURCE_FACT_MUTATION_FORBIDDEN');
const amendment=e.amend('cand-x',{expectedBaseRevisionId:admitted.revision.revisionId,candidateId:'cand-x-amend',reason:'clarify',admissionAuthority:{available:true,proofRef:'auth:x'}});assert.equal(amendment.ok,true);e.markCandidateValidated('cand-x-amend',{validationProofRef:'validate:amend'});e.submitCandidate('cand-x-amend');const admitted2=e.admit('cand-x-amend',{expectedPriorRevisionId:admitted.revision.revisionId});assert.equal(admitted2.ok,true);assert.equal(e.inspectRevision('cand-x',admitted.revision.revisionId).lifecycle,'SUPERSEDED');assert.equal(e.inspectRevision('cand-x',admitted2.revision.revisionId).lifecycle,'ACTIVE');

const r=new W04ReviewDomain(undefined,{evidenceResolver:ref=>e.resolveReviewableEvidenceRef(ref)});
const ghost=r.review('ghost',{action:'request',evidenceRefs:['ghost@r9'],criteriaRefs:['criteria:x'],reviewer:{identity:'r',permissionProofRef:'p',authorityAvailable:true,assignmentPermissionAvailable:true}});assert.equal(ghost.ok,false);assert.equal(ghost.code,'ADMITTED_IMMUTABLE_EVIDENCE_REQUIRED');
const candidateRef=r.review('candidate-review',{action:'request',evidenceRefs:['cand-edit@cand-r0'],criteriaRefs:['criteria:x'],reviewer:{identity:'r',permissionProofRef:'p',authorityAvailable:true,assignmentPermissionAvailable:true}});assert.equal(candidateRef.ok,false);
const ref=`cand-x@${admitted2.revision.revisionId}`;const req=r.review('review-x',{action:'request',evidenceRefs:[ref],criteriaRefs:['criteria:x'],reviewer:{identity:'r',permissionProofRef:'p',authorityAvailable:true,assignmentPermissionAvailable:true}});assert.equal(req.record.state,'REQUESTED');
assert.equal(r.review('review-x',{action:'bogus'}).code,'REVIEW_ACTION_UNKNOWN');assert.equal(r.supersede('review-x',{expectedDecisionId:null,newDecision:{decisionId:'d0',outcome:'ACCEPT'}}).code,'REVIEW_NOT_READY_FOR_DECISION');
assert.equal(r.review('review-x',{action:'assign'}).record.state,'ASSIGNED');assert.equal(r.review('review-x',{action:'start'}).record.state,'IN_REVIEW');assert.equal(r.review('review-x',{action:'ready'}).code,'REVIEW_FINDINGS_REQUIRED');assert.equal(r.finding('review-x',{findingId:'f1',text:'meets criterion',criterionRef:'criteria:x',state:'SATISFIED'}).ok,true);assert.equal(r.review('review-x',{action:'ready'}).record.state,'READY_FOR_DECISION');const issued=r.supersede('review-x',{expectedDecisionId:null,newDecision:{decisionId:'d1',outcome:'ACCEPT'}});assert.equal(issued.ok,true);assert.equal(issued.record.state,'CLOSED');
const before=JSON.stringify(r.inspect('review-x'));const rr=r.review('review-x',{action:'rereview',newReviewId:'review-x-rereview'});assert.equal(rr.ok,true);assert.equal(rr.record.state,'REQUESTED');assert.equal(rr.record.previousReviewRef,'review-x');assert.equal(JSON.stringify(r.inspect('review-x')),before);

const composition=createW04RescueComposition({evidenceDomain:e,reviewsDomain:r});const projection=e.inspect('cand-x-amend');assert.equal(projection.reviewProjection.state,'RESOLVED');
const unboundMastery=new W04MasteryDomain(undefined,{evaluator:{descriptor:()=>({providerId:'eval',revision:'r1',authority:'AUTHORIZED_MASTERY_EVALUATOR'}),requestEvaluation:()=>({accepted:true})}});assert.equal(unboundMastery.reevaluate('mastery-crypto').code,'BASIS_UNAVAILABLE');
const portfolio=new W04PortfolioDomain();const added=portfolio.curate({action:'add',member:{id:'ghost-member',revisionId:'pm-x',refType:'Evidence',sourceRef:'ghost@r9'}});assert.equal(added.ok,true);assert.equal(added.record.state,'UNVERIFIED_PROVIDER_UNBOUND');assert.notEqual(added.record.state,'RESOLVABLE');
console.log('CG5_CONTROLLER_CORR01_A03_DOMAIN_INTEGRITY: PASS');
