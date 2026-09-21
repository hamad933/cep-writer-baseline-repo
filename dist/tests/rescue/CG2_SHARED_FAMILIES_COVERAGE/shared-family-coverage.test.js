import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ANALYTICAL_COMPARE_OWNER,AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {TIMELINE_REPLAY_OWNER,TimelineReplayOwner,defineTimelineReplayProvider} from '../../../foundation/timeline/replay.js';
import {COLLECTION_TABLE_MATRIX_OWNER_ID,COLLECTION_TABLE_MATRIX_CONTRACT} from '../../../foundation/collection/table-matrix.js';
import {AUDIT_PROVENANCE_PRESENTATION_CONTRACT} from '../../../foundation/audit/provenance.js';
import {REVIEW_DECISION_FAMILY_STATUS,REVIEW_DECISION_REAL_CONSUMER_STATUS,REVIEW_DECISION_PRESENTATION_CONTRACT} from '../../../foundation/review/decision.js';
import {REVIEW_AUDIT_AUTHORIZED_SURFACES,REVIEW_AUDIT_FAMILY_CONTRACT} from '../../../foundation/review/family-admission.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const nativeRoot=path.resolve(here,'../../..');
const readAll=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(ent=>ent.isDirectory()?readAll(path.join(dir,ent.name)):[path.join(dir,ent.name)]);
const sourceFiles=readAll(nativeRoot).filter(p=>(/\.(ts|js)$/.test(p))&&!p.includes(`${path.sep}tests${path.sep}`));
const corpus=sourceFiles.map(p=>fs.readFileSync(p,'utf8')).join('\n');
const count=needle=>(corpus.match(new RegExp(needle,'g'))||[]).length;

test('CG2 retains one Spatial family engine and no universal VirtualizationOwner',()=>{
  const spatialDir=path.join(nativeRoot,'foundation/spatial');
  assert.ok(fs.existsSync(spatialDir));
  const spatialFiles=readAll(spatialDir).filter(p=>/\.(ts|js)$/.test(p));
  assert.ok(spatialFiles.length>=5);
  assert.equal(count('VirtualizationOwner'),0);
  const ownerIds=['SpatialInteractionKernel','SpatialPresentationOwner','RelationInteractionOwner','SpatialSelectionNavigationKernel'];
  const ownerDecls=["SPATIAL_INTERACTION_OWNER_ID\\s*=\\s*['\"]","SPATIAL_PRESENTATION_OWNER_ID\\s*=\\s*['\"]","RELATION_INTERACTION_OWNER_ID\\s*=\\s*['\"]","SPATIAL_SELECTION_OWNER_ID\\s*=\\s*['\"]"];
  for(const decl of ownerDecls) assert.equal(count(decl),1,`${decl} must have one declaration across production source`);
});

test('CG2 retains exactly one generic AnalyticalCompare mechanic',()=>{
  assert.equal(ANALYTICAL_COMPARE_OWNER.id,'AnalyticalCompareOwner');
  assert.equal(ANALYTICAL_COMPARE_OWNER.authority,'REUSABLE_COMPARE_INSPECTION_MECHANIC_ONLY');
  assert.equal(count('class AnalyticalCompareOwner'),1);
  const owner=new AnalyticalCompareOwner();
  assert.equal(owner.owner,'AnalyticalCompareOwner');
});

test('CG2 retains exactly one generic TimelineReplay mechanic and domain truth boundary',()=>{
  assert.equal(TIMELINE_REPLAY_OWNER.id,'TimelineReplayOwner');
  assert.equal(TIMELINE_REPLAY_OWNER.scope,'PRESENTATION_AND_GENERIC_INTERACTION_ONLY');
  assert.equal(TIMELINE_REPLAY_OWNER.historyIdentity,'DOMAIN_OWNED');
  assert.equal(TIMELINE_REPLAY_OWNER.eventMeaning,'DOMAIN_OWNED');
  assert.equal(TIMELINE_REPLAY_OWNER.replayTruth,'DOMAIN_OWNED');
  assert.equal(TIMELINE_REPLAY_OWNER.canonicalHistoryClaim,false);
  assert.equal(TIMELINE_REPLAY_OWNER.replayExecution,false);
  assert.equal(count('class TimelineReplayOwner'),1);
  const provider=defineTimelineReplayProvider({providerId:'cg2-proof',domainKind:'CG2_SYNTHETIC_TEST_ONLY',canonicalHistory:false,readTimeline:()=>({status:'EMPTY',events:[]})});
  const owner=new TimelineReplayOwner(provider);
  const result=owner.project();
  assert.equal(result.presentationTruth.canonicalHistoryClaim,false);
  assert.equal(result.presentationTruth.eventMeaning,'DOMAIN_OWNED');
});

test('Collection family remains generic and concept-contract-only',()=>{
  assert.equal(COLLECTION_TABLE_MATRIX_OWNER_ID,'CollectionTableMatrixPresentationCore');
  assert.equal(COLLECTION_TABLE_MATRIX_CONTRACT.classification,'CONCEPT_CONTRACT_ONLY');
  assert.equal(COLLECTION_TABLE_MATRIX_CONTRACT.dataBoundary,'DOMAIN_ADAPTER_SUPPLIES_ROWS_CELLS_ACTIONS');
  assert.ok(COLLECTION_TABLE_MATRIX_CONTRACT.forbidden.includes('universal-domain-row-schema'));
  assert.ok(COLLECTION_TABLE_MATRIX_CONTRACT.forbidden.includes('persistence'));
});

test('Audit/Provenance generic family does not absorb W05 AuditEvent authority',()=>{
  assert.equal(AUDIT_PROVENANCE_PRESENTATION_CONTRACT.domainVocabulary,'DOMAIN_PROVIDER_ONLY');
  assert.equal(AUDIT_PROVENANCE_PRESENTATION_CONTRACT.auditEventDomainAuthority,false);
  assert.ok(corpus.includes("'W05_AUDIT_EVENT_DOMAIN'"));
});

test('Review/Decision generic family does not absorb W04 policy authority',()=>{
  assert.equal(REVIEW_DECISION_FAMILY_STATUS,'CONCEPT_CONTRACT_ONLY');
  assert.equal(REVIEW_DECISION_REAL_CONSUMER_STATUS,'NO_QUALIFIED_REAL_SECOND_CONSUMER_IN_THIS_MISSION');
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.canonicalProjection,'DOMAIN_NEUTRAL_SECTIONS_AND_OUTCOMES');
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.ownsCriterionVocabulary,false);
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.ownsFindingVocabulary,false);
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.ownsDecisionVocabulary,false);
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.ownsFormalDecisionAuthority,false);
  assert.deepEqual(REVIEW_AUDIT_AUTHORIZED_SURFACES,[]);
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.authorizedSurfaces,'NOT_OWNED_BY_SHARED_FAMILY');
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.ownsDomainVocabulary,false);
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.ownsFormalReviewDecisionAuthority,false);
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.ownsAuditEventDomain,false);
});
