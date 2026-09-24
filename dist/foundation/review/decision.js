export const REVIEW_DECISION_PRESENTATION_OWNER='ReviewDecisionPresentationOwner';
export const REVIEW_DECISION_FAMILY_STATUS='CONCEPT_CONTRACT_ONLY';
export const REVIEW_DECISION_REAL_CONSUMER_STATUS='NO_QUALIFIED_REAL_SECOND_CONSUMER_IN_THIS_MISSION';

export const REVIEW_DECISION_PRESENTATION_STATES=Object.freeze([
  'AVAILABLE',
  'READ_ONLY',
  'UNAVAILABLE',
  'CONFLICT',
  'SUPERSEDED'
]);

export const REVIEW_DECISION_PRESENTATION_CONTRACT=Object.freeze({
  id:'ReviewDecisionPresentationContract',
  version:'0.2.0-candidate',
  owner:REVIEW_DECISION_PRESENTATION_OWNER,
  familyStatus:REVIEW_DECISION_FAMILY_STATUS,
  scope:'PRESENTATION_INSPECTION_ONLY',
  canonicalProjection:'DOMAIN_NEUTRAL_SECTIONS_AND_OUTCOMES',
  sectionVocabulary:'DOMAIN_ADAPTER_SUPPLIED',
  legacyAdapterVocabularyAccepted:true,
  legacyAdapterVocabularyIsTransportOnly:true,
  ownsCriterionVocabulary:false,
  ownsFindingVocabulary:false,
  ownsDecisionVocabulary:false,
  ownsSupersessionVocabulary:false,
  ownsExternalWorkingReviewDomainSemantics:false,
  ownsFormalDecisionAuthority:false,
  ownsDecisionMutation:false,
  ownsProviderContract:false,
  ownsPersistence:false,
  claimsRealConsumerReuse:false,
  realConsumerStatus:REVIEW_DECISION_REAL_CONSUMER_STATUS
});

export const REVIEW_DECISION_PRESENTATION_CAPABILITIES=Object.freeze({
  inspect:true,
  expandReadOnlyDetail:true,
  mutateDecision:false,
  approve:false,
  reject:false,
  supersede:false,
  persist:false,
  registerProvider:false,
  executeDomainAction:false
});

const PRESENTATION_TONES=new Set(['neutral','info','attention','critical','quiet']);
const DIRECTIONS=new Set(['ltr','rtl','auto']);
const STATES=new Set(REVIEW_DECISION_PRESENTATION_STATES);
const isRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const requiredText=(value,code)=>{const result=String(value??'').trim();if(!result)throw Error(code);return result;};
const optionalText=value=>value==null?'':String(value).trim();

const clone=value=>value===undefined?undefined:structuredClone(value);
const deepFreeze=value=>{
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.freeze(value);
  for(const child of Object.values(value))deepFreeze(child);
  return value;
};

function assertDataOnly(value,path='snapshot'){
  if(typeof value==='function')throw Error(`REVIEW_DECISION_DATA_ONLY_REQUIRED:${path}`);
  if(!value||typeof value!=='object')return;
  if(value instanceof Date||value instanceof RegExp||value instanceof Map||value instanceof Set)throw Error(`REVIEW_DECISION_PLAIN_DATA_REQUIRED:${path}`);
  for(const [key,child] of Object.entries(value))assertDataOnly(child,`${path}.${key}`);
}

function normalizeBaseLabels(input){
  if(!isRecord(input))throw Error('REVIEW_DECISION_LABELS_REQUIRED');
  return {
    family:requiredText(input.family,'REVIEW_DECISION_LABEL_FAMILY_REQUIRED'),
    unavailable:requiredText(input.unavailable,'REVIEW_DECISION_LABEL_UNAVAILABLE_REQUIRED')
  };
}

function normalizeEntry(input,kind,index){
  if(!isRecord(input))throw Error(`REVIEW_DECISION_${kind}_ENTRY_REQUIRED:${index}`);
  const id=requiredText(input.id,`REVIEW_DECISION_${kind}_ID_REQUIRED:${index}`);
  const label=requiredText(input.label,`REVIEW_DECISION_${kind}_LABEL_REQUIRED:${id}`);
  const detail=optionalText(input.detail);
  const badge=optionalText(input.badge);
  const tone=input.tone==null?'neutral':String(input.tone).trim();
  if(!PRESENTATION_TONES.has(tone))throw Error(`REVIEW_DECISION_PRESENTATION_TONE_INVALID:${tone}`);
  return {id,label,detail,badge,tone};
}

function normalizeEntries(input,kind){
  if(input==null)return [];
  if(!Array.isArray(input))throw Error(`REVIEW_DECISION_${kind}_ARRAY_REQUIRED`);
  const entries=input.map((entry,index)=>normalizeEntry(entry,kind,index));
  const ids=new Set();
  for(const entry of entries){
    if(ids.has(entry.id))throw Error(`REVIEW_DECISION_${kind}_DUPLICATE_ID:${entry.id}`);
    ids.add(entry.id);
  }
  return entries;
}

function normalizeSingleton(input,kind){
  if(input==null)return null;
  return normalizeEntry(input,kind,0);
}

function normalizeNeutralSections(input){
  if(input==null)return null;
  if(!Array.isArray(input)||input.length===0)throw Error('REVIEW_DECISION_SECTIONS_REQUIRED');
  const ids=new Set();
  return input.map((section,index)=>{
    if(!isRecord(section))throw Error(`REVIEW_DECISION_SECTION_REQUIRED:${index}`);
    const id=requiredText(section.id,`REVIEW_DECISION_SECTION_ID_REQUIRED:${index}`);
    if(ids.has(id))throw Error(`REVIEW_DECISION_SECTION_DUPLICATE_ID:${id}`);ids.add(id);
    return {id,label:requiredText(section.label,`REVIEW_DECISION_SECTION_LABEL_REQUIRED:${id}`),entries:normalizeEntries(section.entries,`SECTION_${id.toUpperCase().replace(/[^A-Z0-9]+/g,'_')}`)};
  });
}

function normalizeNeutralOutcomes(input){
  if(input==null)return null;
  if(!Array.isArray(input))throw Error('REVIEW_DECISION_OUTCOMES_ARRAY_REQUIRED');
  const ids=new Set();
  return input.map((outcome,index)=>{
    if(!isRecord(outcome))throw Error(`REVIEW_DECISION_OUTCOME_REQUIRED:${index}`);
    const id=requiredText(outcome.id,`REVIEW_DECISION_OUTCOME_ID_REQUIRED:${index}`);
    if(ids.has(id))throw Error(`REVIEW_DECISION_OUTCOME_DUPLICATE_ID:${id}`);ids.add(id);
    return {id,label:requiredText(outcome.label,`REVIEW_DECISION_OUTCOME_LABEL_REQUIRED:${id}`),entry:normalizeSingleton(outcome.entry,`OUTCOME_${id.toUpperCase().replace(/[^A-Z0-9]+/g,'_')}`)};
  });
}

function legacyAdapterProjection(input){
  const labels=input.labels;
  const requiredLegacyLabel=(key)=>requiredText(labels?.[key],`REVIEW_DECISION_LEGACY_LABEL_${key.toUpperCase()}_REQUIRED`);
  return {
    mode:'LEGACY_ADAPTER_VOCABULARY_TRANSPORT_ONLY',
    sections:[
      {id:'primary',label:requiredLegacyLabel('criteria'),entries:normalizeEntries(input.criteria,'LEGACY_PRIMARY')},
      {id:'secondary',label:requiredLegacyLabel('findings'),entries:normalizeEntries(input.findings,'LEGACY_SECONDARY')}
    ],
    outcomes:[
      {id:'primary',label:requiredLegacyLabel('decision'),entry:normalizeSingleton(input.decision,'LEGACY_OUTCOME_PRIMARY')},
      {id:'secondary',label:requiredLegacyLabel('supersession'),entry:normalizeSingleton(input.supersession,'LEGACY_OUTCOME_SECONDARY')}
    ]
  };
}

/**
 * Creates an immutable, data-only Presentation snapshot. Canonical family
 * mechanics know only neutral sections/outcomes. Any criterion/finding/
 * decision/supersession words arrive through an adapter compatibility seam and
 * remain domain-owned transport labels rather than family semantics.
 */
export function createReviewDecisionPresentationSnapshot(input){
  if(!isRecord(input))throw Error('REVIEW_DECISION_SNAPSHOT_INPUT_REQUIRED');
  assertDataOnly(input);
  const state=requiredText(input.state,'REVIEW_DECISION_STATE_REQUIRED');
  if(!STATES.has(state))throw Error(`REVIEW_DECISION_STATE_INVALID:${state}`);
  const direction=input.direction==null?'auto':String(input.direction).trim();
  if(!DIRECTIONS.has(direction))throw Error(`REVIEW_DECISION_DIRECTION_INVALID:${direction}`);
  const labels=normalizeBaseLabels(input.labels);
  const neutralSections=normalizeNeutralSections(input.sections);
  const neutralOutcomes=normalizeNeutralOutcomes(input.outcomes);
  const legacy=!neutralSections&&!neutralOutcomes?legacyAdapterProjection(input):null;
  if((neutralSections===null)!==(neutralOutcomes===null))throw Error('REVIEW_DECISION_NEUTRAL_SECTIONS_OUTCOMES_MUST_BE_PAIRED');
  const sections=neutralSections??legacy.sections;
  const outcomes=neutralOutcomes??legacy.outcomes;
  const snapshot={
    owner:REVIEW_DECISION_PRESENTATION_OWNER,
    contract:REVIEW_DECISION_PRESENTATION_CONTRACT,
    familyStatus:REVIEW_DECISION_FAMILY_STATUS,
    presentationOnly:true,
    semanticsOwner:'DOMAIN_OWNED_EXTERNAL',
    vocabularyOwner:'DOMAIN_ADAPTER',
    authorityCeiling:'NO_FORMAL_DECISION_AUTHORITY_OR_MUTATION',
    providerTruth:'NO_PROVIDER_CONTRACT_CLAIM',
    realConsumerStatus:REVIEW_DECISION_REAL_CONSUMER_STATUS,
    capabilities:REVIEW_DECISION_PRESENTATION_CAPABILITIES,
    id:requiredText(input.id,'REVIEW_DECISION_ID_REQUIRED'),
    title:requiredText(input.title,'REVIEW_DECISION_TITLE_REQUIRED'),
    summary:optionalText(input.summary),
    state,
    stateLabel:requiredText(input.stateLabel,'REVIEW_DECISION_STATE_LABEL_REQUIRED'),
    stateMessage:optionalText(input.stateMessage),
    direction,
    locale:optionalText(input.locale)||'und',
    labels,
    sections,
    outcomes,
    adapterVocabularyMode:legacy?.mode??'NEUTRAL_SECTION_API',
    sourceNote:optionalText(input.sourceNote)
  };
  if(state==='UNAVAILABLE'&&!snapshot.stateMessage)throw Error('REVIEW_DECISION_UNAVAILABLE_MESSAGE_REQUIRED');
  return deepFreeze(clone(snapshot));
}

export function isReviewDecisionPresentationSnapshot(value){
  return !!value&&value.owner===REVIEW_DECISION_PRESENTATION_OWNER&&value.contract?.id===REVIEW_DECISION_PRESENTATION_CONTRACT.id&&value.presentationOnly===true&&Array.isArray(value.sections)&&Array.isArray(value.outcomes);
}
