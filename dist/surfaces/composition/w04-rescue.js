import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {CollectionTableMatrixPresentationCore} from '../../foundation/collection/table-matrix.js';
import {W04EvidenceDomain} from '../../adapters/evidence/domain.js';
import {W04ReviewDomain} from '../../adapters/reviews/domain.js';
import {W04MasteryDomain} from '../../adapters/mastery/domain.js';
import {W04PortfolioDomain} from '../../adapters/portfolio/domain.js';
import {composeEvidenceSurface} from '../evidence/index.js';
import {composeReviewsSurface} from '../reviews/index.js';
import {createMasterySurfaceComposition} from '../mastery/composition.js';
import {createPortfolioSurfaceComposition} from '../portfolio/composition.js';

export const W04_RESCUE_AUTHORITY='ORACLE-011/A03';
export const W04_CAUSAL_CHAIN=Object.freeze(['Candidate Evidence','Evidence','Review','Decision','Mastery State']);
export const W04_ROUTE_BINDINGS=Object.freeze({
  evidence:Object.freeze({route:'/progress/evidence',centralWiring:'R6_REQUIRED'}),
  reviews:Object.freeze({route:'/progress/reviews',centralWiring:'R6_REQUIRED'}),
  mastery:Object.freeze({route:'/progress/mastery',centralWiring:'R6_REQUIRED'}),
  portfolio:Object.freeze({route:'/progress/portfolio',centralWiring:'R6_REQUIRED'})
});

function evidenceProvenanceProvider(domain){
  return Object.freeze({
    descriptor:()=>({providerId:'w04.evidence.provenance',domainKind:'Evidence',schemaVersion:'1.0.0',authorityRef:W04_RESCUE_AUTHORITY,label:'Evidence provenance'}),
    read:({id}={})=>{
      const target=id||domain.records[0]?.id;if(!target)return {state:'EMPTY',identity:{id:'evidence:none',label:'No Evidence selected',revision:null,provenanceRefs:[]},entries:[],message:'No governed Evidence record is selected.'};
      const row=domain.inspect(target),revision=row?.currentRevision;
      if(!row)return {state:'EMPTY',identity:{id:'evidence:none',label:'No Evidence selected',revision:null,provenanceRefs:[]},entries:[],message:'No governed Evidence record is selected.'};
      const sourceRef=revision?`${revision.source.sourceId}@${revision.source.sourceRevision}`:`${row.sourceId||row.id}@${row.sourceRevision||row.revisionId}`;
      const entries=[{id:`source:${sourceRef}`,label:'Pinned source revision',kind:'SOURCE_REVISION',summary:`Source status: ${row.sourceStatus}`,provenanceRefs:[sourceRef],attributes:{digest:revision?.source.digest||row.digest,sourceStatus:row.sourceStatus}}];
      if(revision?.previousRevisionRef)entries.push({id:`previous:${revision.previousRevisionRef}`,label:'Previous immutable Evidence revision',kind:'EVIDENCE_REVISION',summary:'Superseding lineage is preserved; prior revision remains immutable.',provenanceRefs:[revision.previousRevisionRef],attributes:{immutable:true}});
      return {state:'READY',identity:{id:row.evidenceId||row.id,label:row.title||row.id,revision:revision?.revisionId||row.revisionId,provenanceRefs:[sourceRef]},entries,message:'Evidence provenance is projected read-only from the W04 domain; presentation owns no Evidence mutation authority.'};
    }
  });
}

function reviewsProvenanceProvider(domain){
  return Object.freeze({
    descriptor:()=>({providerId:'w04.reviews.provenance',domainKind:'FormalReview',schemaVersion:'1.0.0',authorityRef:W04_RESCUE_AUTHORITY,label:'Formal Review provenance'}),
    read:({id}={})=>{
      const target=id||domain.records[0]?.id;if(!target)return {state:'EMPTY',identity:{id:'review:none',label:'No Review selected',revision:null,provenanceRefs:[]},entries:[],message:'No formal Review is selected.'};
      const row=domain.inspect(target);
      if(!row)return {state:'EMPTY',identity:{id:'review:none',label:'No Review selected',revision:null,provenanceRefs:[]},entries:[],message:'No formal Review is selected.'};
      const entries=[...row.evidenceRefs.map(ref=>({id:`evidence:${ref}`,label:'Pinned Evidence revision',kind:'EVIDENCE_REVISION_REF',summary:'Exact Evidence revision pinned to this Review.',provenanceRefs:[ref]})),...row.decisionHistory.map(decision=>({id:`decision:${decision.decisionId}`,label:`Decision ${decision.decisionId}`,kind:'REVIEW_DECISION',summary:`${decision.outcome}${decision.supersedesDecisionRef?` · supersedes ${decision.supersedesDecisionRef}`:''}`,provenanceRefs:[decision.decisionId,...(decision.supersedesDecisionRef?[decision.supersedesDecisionRef]:[])],attributes:{immutable:true,outcome:decision.outcome}}))];
      return {state:entries.length?'READY':'EMPTY',identity:{id:row.id,label:`Review ${row.id}`,revision:row.revisionId,provenanceRefs:[...row.evidenceRefs,...row.criteriaRefs]},entries,message:'Issued Decisions are read-only provenance records here; correction uses superseding Decision lineage.'};
    }
  });
}

export function createW04RescueComposition({
  evidenceDomain=new W04EvidenceDomain(),
  reviewsDomain=null,
  masteryDomain=new W04MasteryDomain(),
  portfolioDomain=null,
  analyticalCompareOwner=new AnalyticalCompareOwner()
}={}){
  if(analyticalCompareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
  const boundReviews=reviewsDomain||new W04ReviewDomain(undefined,{evidenceResolver:ref=>evidenceDomain.resolveReviewableEvidenceRef(ref)});
  if(!boundReviews.evidenceResolver)boundReviews.evidenceResolver=ref=>evidenceDomain.resolveReviewableEvidenceRef(ref);
  evidenceDomain.setReviewProjectionResolver(input=>boundReviews.projectionForEvidence(input));
  const boundPortfolio=portfolioDomain||new W04PortfolioDomain(undefined,{sourceResolver:{inspect:ref=>{
    const [id,revisionId,...rest]=String(ref||'').split('@');if(!id||!revisionId||rest.length)return null;
    const evidence=evidenceDomain.findRevision(id,revisionId);if(evidence)return {digest:evidence.source.digest,rowCount:1};
    const mastery=masteryDomain.records.find(row=>row.id===id&&row.revisionId===revisionId);if(mastery)return {digest:mastery.basis.digest,rowCount:1};
    return null;
  }}});
  const evidence=composeEvidenceSurface({domain:evidenceDomain,analyticalCompareOwner});
  const reviews=composeReviewsSurface({domain:boundReviews,analyticalCompareOwner});
  const mastery=createMasterySurfaceComposition({domain:masteryDomain,analyticalCompareOwner});
  const portfolio=createPortfolioSurfaceComposition({domain:boundPortfolio,analyticalCompareOwner});

  const evidenceCollection=new CollectionTableMatrixPresentationCore(evidence.collection);
  const reviewsCollection=new CollectionTableMatrixPresentationCore(reviews.collection);
  const evidenceAudit=new AuditProvenanceInteractionCore(evidenceProvenanceProvider(evidenceDomain));
  const reviewsAudit=new AuditProvenanceInteractionCore(reviewsProvenanceProvider(boundReviews));
  if(evidenceDomain.records[0])evidenceAudit.refresh({id:evidenceDomain.records[0].id});
  if(boundReviews.records[0])reviewsAudit.refresh({id:boundReviews.records[0].id});

  return Object.freeze({
    authority:W04_RESCUE_AUTHORITY,
    candidateOnly:true,
    selfPromotion:false,
    causalChain:W04_CAUSAL_CHAIN,
    routeBindings:W04_ROUTE_BINDINGS,
    shared:Object.freeze({
      analyticalCompareOwner,
      analyticalProviderIds:analyticalCompareOwner.providerIds(),
      collectionOwner:'CollectionTableMatrixPresentationCore',
      auditOwner:'AuditProvenanceInteractionCore',
      reviewDecisionOwner:'ReviewDecisionPresentationOwner'
    }),
    evidence:Object.freeze({...evidence,collectionCore:evidenceCollection,auditProvenance:evidenceAudit}),
    reviews:Object.freeze({...reviews,collectionCore:reviewsCollection,auditProvenance:reviewsAudit}),
    mastery,
    portfolio,
    invariants:Object.freeze({
      evidenceRevisionMutation:'IMMUTABLE_SUPERSEDING_ONLY',
      issuedDecisionMutation:'IMMUTABLE_SUPERSEDING_ONLY',
      masteryReevaluate:'ZERO_LOCAL_WRITE_WITHOUT_AUTHORIZED_EVALUATOR',
      portfolioCanonicalTruth:'REFERENCE_ONLY_NO_COPY_NO_DELETE',
      groupingAuthority:boundPortfolio.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED',
      finalRouteWiring:'R6_REQUIRED'
    })
  });
}
