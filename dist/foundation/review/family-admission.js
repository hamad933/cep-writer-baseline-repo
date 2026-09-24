export const REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER='ReviewAuditFamilyComposition';
export const REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION='RA-FAMILY-CANDIDATE-2';
/** Compatibility export only. The shared family owns no domain-surface allowlist. */
export const REVIEW_AUDIT_AUTHORIZED_SURFACES=Object.freeze([]);

const required=(value,code)=>{const text=String(value??'').trim();if(!text)throw Error(code);return text;};
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};

export function assertCandidateReviewAuditConsumer(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('REVIEW_AUDIT_CONSUMER_DESCRIPTOR_REQUIRED');
  const descriptor={
    surface:required(input.surface,'REVIEW_AUDIT_SURFACE_REQUIRED'),
    routeKind:required(input.routeKind,'REVIEW_AUDIT_ROUTE_KIND_REQUIRED'),
    consumerKind:required(input.consumerKind,'REVIEW_AUDIT_CONSUMER_KIND_REQUIRED'),
    domainImplementation:required(input.domainImplementation,'REVIEW_AUDIT_DOMAIN_IMPLEMENTATION_REQUIRED'),
    candidateConsumerEvidence:input.proofConsumer===true,
    synthetic:input.synthetic===true,
    fixture:input.fixture===true,
    contractOnly:input.contractOnly===true,
    profileUse:required(input.profileUse,'REVIEW_AUDIT_PROFILE_USE_REQUIRED')
  };
  if(descriptor.routeKind!=='PRODUCT'||descriptor.consumerKind!=='GENUINE_REAL_PRODUCT'||descriptor.domainImplementation!=='REAL_PRODUCT_COMPOSITION'||!descriptor.candidateConsumerEvidence||descriptor.synthetic||descriptor.fixture||descriptor.contractOnly)throw Error('REVIEW_AUDIT_REAL_CONSUMER_CANDIDATE_REQUIRED');
  if(descriptor.profileUse!=='READ_ONLY_EVIDENCE_NOT_PROOF')throw Error('REVIEW_AUDIT_PROFILE_CANNOT_CREATE_PROOF');
  return freeze({...descriptor,owner:REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER,presentationRevision:REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION,controllerAdmissionRequired:true,realConsumerAccepted:false});
}

/** Legacy name retained for existing adapters; it does not grant admission. */
export function assertGenuineReviewAuditConsumer(input){return assertCandidateReviewAuditConsumer(input)}

export const REVIEW_AUDIT_FAMILY_CONTRACT=freeze({
  id:'ReviewAuditFamilyCompositionContract',
  version:'2.0.0-candidate',
  owner:REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER,
  candidateOnly:true,
  referenceOnlyUntilControllerAdjudication:true,
  presentationRevision:REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION,
  requiredRealConsumers:'CONTROLLER_ADJUDICATED_EXTERNALLY',
  authorizedSurfaces:'NOT_OWNED_BY_SHARED_FAMILY',
  surfaceAdmissionAuthority:'CONTROLLER_AND_DOMAIN_PROFILE',
  reuses:Object.freeze(['AuditProvenanceInteractionCore','ReviewDecisionPresentationOwner']),
  ownsDomainVocabulary:false,
  ownsFormalReviewDecisionAuthority:false,
  ownsAuditEventDomain:false,
  ownsAuditMeaning:false,
  ownsTechnicalFindingMeaning:false,
  convertsTechnicalFindingToFormalReviewFinding:false,
  ownsPersistence:false,
  acceptsSyntheticConsumerProof:false,
  acceptsContractOnlyConsumerProof:false,
  proofConsumerFlagCreatesAcceptance:false
});
