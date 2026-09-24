import {assertFeedbackSourceTruth} from '../global/feedback-contract.js';

export const EPISTEMIC_STATE_CONTRACT_ID='EpistemicStateContract';
export const EPISTEMIC_STATE_KINDS=Object.freeze(['EMPTY','LOADING','STALE','UNAVAILABLE','ERROR']);
export const EPISTEMIC_STATE_SET=new Set(EPISTEMIC_STATE_KINDS);

export const EPISTEMIC_PRESENTATION_POLICY=Object.freeze({
  id:'EpistemicStatePresentationPolicy',
  revision:'w4g-epistemic-presentation-v1',
  states:Object.freeze({
    EMPTY:Object.freeze({role:'status',ariaLive:'polite',ariaBusy:'false',tone:'neutral'}),
    LOADING:Object.freeze({role:'status',ariaLive:'polite',ariaBusy:'true',tone:'progress'}),
    STALE:Object.freeze({role:'status',ariaLive:'polite',ariaBusy:'false',tone:'warning'}),
    UNAVAILABLE:Object.freeze({role:'status',ariaLive:'polite',ariaBusy:'false',tone:'unavailable'}),
    ERROR:Object.freeze({role:'alert',ariaLive:'assertive',ariaBusy:'false',tone:'error'})
  }),
  feedbackOutcome:Object.freeze({EMPTY:'info',LOADING:'info',STALE:'warning',UNAVAILABLE:'unavailable',ERROR:'error'}),
  refusal:Object.freeze({retryUndeclared:'EPISTEMIC_RETRY_NOT_DECLARED'})
});

export const EPISTEMIC_STATE_CONTRACT=Object.freeze({
  id:EPISTEMIC_STATE_CONTRACT_ID,
  version:'1.0.1',
  compatibility:'SEMVER',
  scope:'GLOBAL_VOCABULARY_PRESENTATION_REFUSAL_ONLY',
  stateKinds:EPISTEMIC_STATE_KINDS,
  ownsDomainCause:false,
  ownsSemanticMeaning:false,
  ownsDomainCopy:false,
  ownsRetryCapability:false,
  ownsCanonicalTruth:false,
  ownsAsyncLifecycle:false,
  ownsRetryExecution:false,
  ownsDomainStatusStore:false,
  ownsTruthMerge:false,
  truthCompatibility:'EXPLICIT_COMPARABLE_SOURCE_TRUTH_CONTRADICTION_REFUSAL',
  feedbackBridgeValidation:'ACCESSIBILITY_FEEDBACK_OWNER_SOURCE_TRUTH_BOUNDARY'
});

const isObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const requiredText=(value,code)=>{const text=String(value??'').trim();if(!text)throw Error(code);return text};
const clone=value=>value==null?value:structuredClone(value);
const freeze=value=>Object.freeze(value);

const SUCCESS_TRUTH_STATUSES=new Set(['PASS','SUCCESS','SUCCEEDED','APPLIED','SAVED','PERSISTED','COMMITTED']);
const FAILURE_TRUTH_STATUSES=new Set(['FAIL','FAILED','ERROR','REJECTED']);
const explicitTrue=(value,key)=>isObject(value)&&value[key]===true;
const explicitFalse=(value,key)=>isObject(value)&&value[key]===false;
const explicitStatus=value=>isObject(value)?String(value.status??'').trim().toUpperCase():'';

function explicitTruthViews(canonicalTruth){
  return [canonicalTruth,canonicalTruth.feedbackSourceTruth].filter(isObject);
}

/**
 * Refuses only contradictions that are explicitly comparable with the shared
 * presentation state. Missing proof is not converted into success/failure.
 * No canonical field is rewritten and no domain meaning is inferred.
 */
export function assertEpistemicTruthCompatibility(state,canonicalTruth){
  const views=explicitTruthViews(canonicalTruth);
  for(const truth of views){
    const status=explicitStatus(truth);
    const positiveOutcome=explicitTrue(truth,'ok')||SUCCESS_TRUTH_STATUSES.has(status);
    const negativeOutcome=explicitFalse(truth,'ok')||FAILURE_TRUTH_STATUSES.has(status)||Boolean(truth.error);
    if(positiveOutcome&&negativeOutcome)throw Error('EPISTEMIC_TRUTH_CONFLICT:SOURCE_TRUTH_SELF_CONTRADICTION');
    if(state==='ERROR'&&positiveOutcome)throw Error('EPISTEMIC_TRUTH_CONFLICT:ERROR_PROVEN_SUCCESS');
    if(state==='UNAVAILABLE'&&(explicitTrue(truth,'enabled')||explicitTrue(truth,'available')||explicitTrue(truth,'healthy')))throw Error('EPISTEMIC_TRUTH_CONFLICT:UNAVAILABLE_PROVEN_AVAILABLE');
    if(state==='STALE'&&(explicitFalse(truth,'stale')||explicitTrue(truth,'fresh')||explicitTrue(truth,'current')))throw Error('EPISTEMIC_TRUTH_CONFLICT:STALE_PROVEN_CURRENT');
    if(state==='LOADING'&&(explicitTrue(truth,'complete')||explicitTrue(truth,'completed')))throw Error('EPISTEMIC_TRUTH_CONFLICT:LOADING_PROVEN_COMPLETE');
  }
  return canonicalTruth;
}

function assertExplicitTruth(descriptor){
  if(!isObject(descriptor.canonicalTruth))throw Error('EPISTEMIC_CANONICAL_TRUTH_REQUIRED');
  const truth=descriptor.canonicalTruth;
  const truthOwner=requiredText(truth.owner,'EPISTEMIC_TRUTH_OWNER_REQUIRED');
  const truthState=requiredText(truth.state,'EPISTEMIC_TRUTH_STATE_REQUIRED').toUpperCase();
  if(truthState!==descriptor.state)throw Error(`EPISTEMIC_TRUTH_STATE_MISMATCH:${truthState}:${descriptor.state}`);
  if(!isObject(truth.feedbackSourceTruth))throw Error('EPISTEMIC_FEEDBACK_SOURCE_TRUTH_REQUIRED');
  assertEpistemicTruthCompatibility(descriptor.state,truth);
  return {truthOwner,truthState};
}

/**
 * Validates only the cross-domain contract shape. It never derives a cause,
 * semantic meaning, copy, retry capability or canonical truth from state kind.
 */
export function validateEpistemicStateDescriptor(input){
  if(!isObject(input))throw Error('EPISTEMIC_DESCRIPTOR_REQUIRED');
  const state=requiredText(input.state,'EPISTEMIC_STATE_REQUIRED').toUpperCase();
  if(!EPISTEMIC_STATE_SET.has(state))throw Error(`EPISTEMIC_STATE_UNSUPPORTED:${state}`);
  if(!isObject(input.domain))throw Error('EPISTEMIC_DOMAIN_REQUIRED');
  const domain={
    id:requiredText(input.domain.id,'EPISTEMIC_DOMAIN_ID_REQUIRED'),
    owner:requiredText(input.domain.owner,'EPISTEMIC_DOMAIN_OWNER_REQUIRED'),
    family:requiredText(input.domain.family,'EPISTEMIC_DOMAIN_FAMILY_REQUIRED')
  };
  if(!isObject(input.cause))throw Error('EPISTEMIC_CAUSE_REQUIRED');
  const cause={...clone(input.cause),code:requiredText(input.cause.code,'EPISTEMIC_CAUSE_CODE_REQUIRED')};
  if(!isObject(input.meaning))throw Error('EPISTEMIC_MEANING_REQUIRED');
  const meaning={...clone(input.meaning),code:requiredText(input.meaning.code,'EPISTEMIC_MEANING_CODE_REQUIRED'),summary:requiredText(input.meaning.summary,'EPISTEMIC_MEANING_SUMMARY_REQUIRED')};
  if(!isObject(input.copy))throw Error('EPISTEMIC_COPY_REQUIRED');
  const copy={...clone(input.copy),title:requiredText(input.copy.title,'EPISTEMIC_COPY_TITLE_REQUIRED'),message:requiredText(input.copy.message,'EPISTEMIC_COPY_MESSAGE_REQUIRED')};
  if(!isObject(input.retry)||typeof input.retry.available!=='boolean')throw Error('EPISTEMIC_RETRY_CAPABILITY_REQUIRED');
  const retry={available:input.retry.available};
  if(input.retry.available){
    retry.actionId=requiredText(input.retry.actionId,'EPISTEMIC_RETRY_ACTION_ID_REQUIRED');
    retry.label=requiredText(input.retry.label,'EPISTEMIC_RETRY_LABEL_REQUIRED');
  }else{
    if(input.retry.actionId!=null||input.retry.label!=null)throw Error('EPISTEMIC_RETRY_METADATA_WITHOUT_CAPABILITY');
  }
  const canonicalTruth=clone(input.canonicalTruth);
  const normalized={state,domain,cause,meaning,copy,retry,canonicalTruth};
  assertExplicitTruth(normalized);
  return freeze({
    contract:EPISTEMIC_STATE_CONTRACT,
    state,
    domain:freeze(domain),
    cause:freeze(cause),
    meaning:freeze(meaning),
    copy:freeze(copy),
    retry:freeze(retry),
    canonicalTruth:freeze(canonicalTruth)
  });
}

export function resolveEpistemicPresentation(state,policy=EPISTEMIC_PRESENTATION_POLICY){
  const key=requiredText(state,'EPISTEMIC_STATE_REQUIRED').toUpperCase();
  if(!EPISTEMIC_STATE_SET.has(key))throw Error(`EPISTEMIC_STATE_UNSUPPORTED:${key}`);
  const rule=policy?.states?.[key];
  if(!isObject(rule))throw Error(`EPISTEMIC_PRESENTATION_RULE_REQUIRED:${key}`);
  for(const keyName of ['role','ariaLive','ariaBusy','tone'])requiredText(rule[keyName],`EPISTEMIC_PRESENTATION_${keyName.toUpperCase()}_REQUIRED:${key}`);
  return freeze({...rule,state:key,policyRevision:requiredText(policy.revision,'EPISTEMIC_POLICY_REVISION_REQUIRED')});
}

/** Projection preserves domain-owned fields verbatim-by-value and adds only shared presentation semantics. */
export function projectEpistemicState(input,policy=EPISTEMIC_PRESENTATION_POLICY){
  const descriptor=validateEpistemicStateDescriptor(input);
  const presentation=resolveEpistemicPresentation(descriptor.state,policy);
  return freeze({
    contract:EPISTEMIC_STATE_CONTRACT,
    policyRevision:presentation.policyRevision,
    state:descriptor.state,
    domain:descriptor.domain,
    cause:descriptor.cause,
    meaning:descriptor.meaning,
    copy:descriptor.copy,
    retry:descriptor.retry,
    canonicalTruth:descriptor.canonicalTruth,
    presentation,
    canonicalTruthOwner:descriptor.canonicalTruth.owner,
    ownsCanonicalTruth:false,
    ownsDomainCopy:false,
    ownsRetryExecution:false
  });
}

/** AccessibilityFeedbackOwner input bridge. Source truth is passed through, never synthesized. */
export function toAccessibilityFeedbackInput(input,{channel='status',policy=EPISTEMIC_PRESENTATION_POLICY}={}){
  const descriptor=validateEpistemicStateDescriptor(input);
  const outcome=policy?.feedbackOutcome?.[descriptor.state];
  if(!outcome)throw Error(`EPISTEMIC_FEEDBACK_OUTCOME_RULE_REQUIRED:${descriptor.state}`);
  const sourceTruth=clone(descriptor.canonicalTruth.feedbackSourceTruth);
  try{assertFeedbackSourceTruth(outcome,sourceTruth)}catch(error){throw Error(`EPISTEMIC_FEEDBACK_BRIDGE_REFUSED:${String(error?.message||error)}`)}
  return freeze({
    channel,
    outcome,
    message:descriptor.copy.message,
    sourceFamily:descriptor.domain.family,
    sourceOwner:descriptor.domain.owner,
    sourceCode:descriptor.cause.code,
    operation:`epistemic.${descriptor.state.toLowerCase()}`,
    sourceTruth
  });
}

/**
 * Presentation-only host. It has no timer, transition machine, fetcher, status
 * store, retry executor or truth merge. Each projection must be supplied anew
 * by its domain adapter.
 */
export class EpistemicStateHost{
  constructor({policy=EPISTEMIC_PRESENTATION_POLICY}={}){this.policy=policy;this.current=null;this.receipts=[];}
  project(input){const projection=projectEpistemicState(input,this.policy);this.current=projection;const receipt=freeze({accepted:true,code:'EPISTEMIC_PROJECTED',state:projection.state,domainId:projection.domain.id,policyRevision:projection.policyRevision});this.receipts.push(receipt);return projection;}
  retryIntent(){
    if(!this.current)throw Error('EPISTEMIC_PROJECTION_REQUIRED');
    if(!this.current.retry.available){const receipt=freeze({accepted:false,code:this.policy?.refusal?.retryUndeclared||'EPISTEMIC_RETRY_NOT_DECLARED',state:this.current.state,domainId:this.current.domain.id,policyRevision:this.current.policyRevision});this.receipts.push(receipt);return receipt;}
    const receipt=freeze({accepted:true,code:'EPISTEMIC_RETRY_INTENT',actionId:this.current.retry.actionId,state:this.current.state,domainId:this.current.domain.id,policyRevision:this.current.policyRevision,executesRetry:false});this.receipts.push(receipt);return receipt;
  }
  clear(){this.current=null;return freeze({accepted:true,code:'EPISTEMIC_PRESENTATION_CLEARED'});}
  snapshot(){return freeze({contract:EPISTEMIC_STATE_CONTRACT,policyRevision:this.policy.revision,current:this.current,canonicalTruthOwned:false,asyncLifecycleOwned:false,retryExecutionOwned:false});}
}

const setText=(node,value)=>{node.textContent=String(value)};

/** DOM projector for shared accessible rendering only. */
export class EpistemicStateProjector{
  constructor(host,{document:doc=globalThis.document,root=null}={}){if(!(host instanceof EpistemicStateHost))throw Error('EPISTEMIC_HOST_REQUIRED');if(!doc?.createElement)throw Error('EPISTEMIC_DOCUMENT_REQUIRED');this.host=host;this.document=doc;this.root=root||doc.body;this.container=null;this.onRetryIntent=null;}
  mount(){if(this.container)return this;const section=this.document.createElement('section');section.dataset.epistemicStateHost='EpistemicStateContract';const title=this.document.createElement('h2');title.id=`epistemic-title-${Math.random().toString(36).slice(2)}`;const message=this.document.createElement('p');message.id=`epistemic-message-${Math.random().toString(36).slice(2)}`;const retry=this.document.createElement('button');retry.type='button';retry.hidden=true;retry.onclick=()=>{const receipt=this.host.retryIntent();if(receipt.accepted&&typeof this.onRetryIntent==='function')this.onRetryIntent(receipt)};section.append(title,message,retry);this.root.append(section);this.container=section;this.nodes={title,message,retry};return this;}
  render(input){if(!this.container)this.mount();const projection=this.host.project(input),{presentation}=projection;this.container.dataset.state=projection.state;this.container.dataset.tone=presentation.tone;this.container.setAttribute('role',presentation.role);this.container.setAttribute('aria-live',presentation.ariaLive);this.container.setAttribute('aria-busy',presentation.ariaBusy);this.container.setAttribute('aria-labelledby',this.nodes.title.id);this.container.setAttribute('aria-describedby',this.nodes.message.id);setText(this.nodes.title,projection.copy.title);setText(this.nodes.message,projection.copy.message);if(projection.retry.available){this.nodes.retry.hidden=false;setText(this.nodes.retry,projection.retry.label);this.nodes.retry.dataset.retryActionId=projection.retry.actionId}else{this.nodes.retry.hidden=true;this.nodes.retry.removeAttribute('data-retry-action-id');setText(this.nodes.retry,'')}return projection;}
}
