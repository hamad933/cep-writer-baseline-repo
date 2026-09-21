const clone=value=>value===undefined?undefined:structuredClone(value);
const deepFreeze=value=>{
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    for(const child of Object.values(value))deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};
const requiredText=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value.trim();};
const optionalText=value=>typeof value==='string'&&value.trim()?value.trim():null;
const textArray=(value,code)=>{
  if(value===undefined||value===null)return [];
  if(!Array.isArray(value)||value.some(item=>typeof item!=='string'||!item.trim()))throw Error(code);
  return [...new Set(value.map(item=>item.trim()))];
};
const recordObject=(value,code)=>{
  if(value===undefined||value===null)return {};
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error(code);
  return clone(value);
};

export const AUDIT_PROVENANCE_PRESENTATION_OWNER=Object.freeze({
  id:'AuditProvenanceInteractionCore',
  token:'AuditProvenancePresentation',
  semanticCore:'SC-033 / AuditProvenanceInteractionCore',
  authority:'PRESENTATION_AND_INSPECTION_INTERACTION_ONLY',
  truthBoundary:'DOMAIN_PROVIDER_OWNS_AUDIT_MEANING_IMMUTABILITY_REVIEW_AUTHORITY_AND_DATA_TRUTH'
});

export const AUDIT_PROVENANCE_PRESENTATION_CONTRACT=Object.freeze({
  version:'AP-PRESENTATION-2-CANDIDATE',
  states:Object.freeze(['READY','EMPTY','STALE','ERROR','UNAVAILABLE','CONFLICT']),
  domainVocabulary:'DOMAIN_PROVIDER_ONLY',
  auditEventDomainAuthority:false,
  localInteraction:Object.freeze(['FILTER_VISIBLE_RECORDS','SELECT_RECORD','KEYBOARD_NAVIGATION','DISMISS_DETAILS']),
  forbiddenAuthority:Object.freeze(['CREATE_AUDIT_EVENT','MUTATE_AUDIT_EVENT','DELETE_AUDIT_EVENT','APPROVE_REVIEW','REJECT_REVIEW','ASSERT_IMMUTABILITY','INFER_CAUSALITY','PERSIST_DOMAIN_STATE'])
});

function validateDescriptor(descriptor){
  if(!descriptor||typeof descriptor!=='object'||Array.isArray(descriptor))throw Error('AUDIT_PROVENANCE_DESCRIPTOR_REQUIRED');
  return deepFreeze({
    providerId:requiredText(descriptor.providerId,'AUDIT_PROVENANCE_PROVIDER_ID_REQUIRED'),
    domainKind:requiredText(descriptor.domainKind,'AUDIT_PROVENANCE_DOMAIN_KIND_REQUIRED'),
    schemaVersion:requiredText(descriptor.schemaVersion,'AUDIT_PROVENANCE_SCHEMA_VERSION_REQUIRED'),
    authorityRef:requiredText(descriptor.authorityRef,'AUDIT_PROVENANCE_AUTHORITY_REF_REQUIRED'),
    label:optionalText(descriptor.label)
  });
}

export function validateAuditProvenanceProvider(provider){
  if(!provider||typeof provider!=='object')throw Error('AUDIT_PROVENANCE_PROVIDER_REQUIRED');
  if(typeof provider.descriptor!=='function'||typeof provider.read!=='function')throw Error('AUDIT_PROVENANCE_PROVIDER_CONTRACT_INVALID');
  return validateDescriptor(provider.descriptor());
}

function normalizeEntry(entry,index){
  if(!entry||typeof entry!=='object'||Array.isArray(entry))throw Error(`AUDIT_PROVENANCE_ENTRY_INVALID:${index}`);
  const id=requiredText(entry.id,`AUDIT_PROVENANCE_ENTRY_ID_REQUIRED:${index}`);
  return deepFreeze({
    id,
    label:requiredText(entry.label,`AUDIT_PROVENANCE_ENTRY_LABEL_REQUIRED:${id}`),
    kind:optionalText(entry.kind),
    timestamp:optionalText(entry.timestamp),
    actorLabel:optionalText(entry.actorLabel),
    summary:optionalText(entry.summary),
    parentIds:Object.freeze(textArray(entry.parentIds,`AUDIT_PROVENANCE_ENTRY_PARENT_IDS_INVALID:${id}`)),
    correlationIds:Object.freeze(textArray(entry.correlationIds,`AUDIT_PROVENANCE_ENTRY_CORRELATION_IDS_INVALID:${id}`)),
    provenanceRefs:Object.freeze(textArray(entry.provenanceRefs,`AUDIT_PROVENANCE_ENTRY_PROVENANCE_REFS_INVALID:${id}`)),
    attributes:deepFreeze(recordObject(entry.attributes,`AUDIT_PROVENANCE_ENTRY_ATTRIBUTES_INVALID:${id}`))
  });
}

export function normalizeAuditProvenanceProjection(input,descriptor){
  const ownerDescriptor=validateDescriptor(descriptor);
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('AUDIT_PROVENANCE_PROJECTION_REQUIRED');
  const state=requiredText(input.state,'AUDIT_PROVENANCE_STATE_REQUIRED').toUpperCase();
  if(!AUDIT_PROVENANCE_PRESENTATION_CONTRACT.states.includes(state))throw Error(`AUDIT_PROVENANCE_STATE_INVALID:${state}`);
  const entries=Array.isArray(input.entries)?input.entries.map(normalizeEntry):(()=>{throw Error('AUDIT_PROVENANCE_ENTRIES_REQUIRED');})();
  const ids=new Set();
  for(const entry of entries){if(ids.has(entry.id))throw Error(`AUDIT_PROVENANCE_ENTRY_DUPLICATE_ID:${entry.id}`);ids.add(entry.id);}
  if(state==='EMPTY'&&entries.length)throw Error('AUDIT_PROVENANCE_EMPTY_STATE_WITH_ENTRIES');
  if(['UNAVAILABLE','CONFLICT'].includes(state)&&!optionalText(input.message))throw Error(`AUDIT_PROVENANCE_${state}_MESSAGE_REQUIRED`);
  const identity=input.identity;
  if(!identity||typeof identity!=='object'||Array.isArray(identity))throw Error('AUDIT_PROVENANCE_IDENTITY_REQUIRED');
  const normalized=deepFreeze({
    owner:AUDIT_PROVENANCE_PRESENTATION_OWNER.id,
    provider:ownerDescriptor,
    state,
    identity:deepFreeze({
      id:requiredText(identity.id,'AUDIT_PROVENANCE_IDENTITY_ID_REQUIRED'),
      label:requiredText(identity.label,'AUDIT_PROVENANCE_IDENTITY_LABEL_REQUIRED'),
      revision:optionalText(identity.revision),
      correlationIds:Object.freeze(textArray(identity.correlationIds,'AUDIT_PROVENANCE_IDENTITY_CORRELATION_IDS_INVALID')),
      provenanceRefs:Object.freeze(textArray(identity.provenanceRefs,'AUDIT_PROVENANCE_IDENTITY_PROVENANCE_REFS_INVALID'))
    }),
    entries:Object.freeze(entries),
    message:optionalText(input.message),
    observedAt:optionalText(input.observedAt),
    freshness:deepFreeze(recordObject(input.freshness,'AUDIT_PROVENANCE_FRESHNESS_INVALID')),
    truth:Object.freeze({
      source:'DOMAIN_PROVIDER',
      immutableClaimMadeByPresentation:false,
      reviewAuthorityClaimMadeByPresentation:false,
      causalInferenceMadeByPresentation:false
    })
  });
  return normalized;
}

const searchableText=entry=>[
  entry.id,entry.label,entry.kind,entry.timestamp,entry.actorLabel,entry.summary,
  ...entry.parentIds,...entry.correlationIds,...entry.provenanceRefs,
  ...Object.entries(entry.attributes).flatMap(([key,value])=>[key,typeof value==='string'?value:''])
].filter(Boolean).join('\u0000').toLocaleLowerCase('en-US');
const normalizeFilter=value=>String(value??'').trim().toLocaleLowerCase('en-US');

export class AuditProvenanceInteractionCore{
  constructor(provider){
    this.provider=provider;
    this.descriptor=validateAuditProvenanceProvider(provider);
    this.projection=null;
    this.filterText='';
    this.selectedId=null;
  }
  refresh(query={}){
    try{
      this.descriptor=validateAuditProvenanceProvider(this.provider);
      const next=normalizeAuditProvenanceProjection(this.provider.read(clone(query)),this.descriptor);
      this.projection=next;
      if(this.selectedId&&!next.entries.some(entry=>entry.id===this.selectedId))this.selectedId=null;
      return this.view();
    }catch(error){
      this.projection=deepFreeze({
        owner:AUDIT_PROVENANCE_PRESENTATION_OWNER.id,
        provider:this.descriptor,
        state:'ERROR',
        identity:deepFreeze({id:'presentation-boundary',label:'Provider read unavailable',revision:null,correlationIds:Object.freeze([]),provenanceRefs:Object.freeze([])}),
        entries:Object.freeze([]),
        message:'The provenance provider could not be read by the presentation boundary.',
        observedAt:null,
        freshness:deepFreeze({}),
        truth:Object.freeze({
          source:'PRESENTATION_BOUNDARY',
          immutableClaimMadeByPresentation:false,
          reviewAuthorityClaimMadeByPresentation:false,
          causalInferenceMadeByPresentation:false,
          providerErrorCode:optionalText(error?.message)||'AUDIT_PROVENANCE_PROVIDER_READ_FAILED'
        })
      });
      this.selectedId=null;
      return this.view();
    }
  }
  setFilter(value){this.filterText=String(value??'');return this.view();}
  clearFilter(){this.filterText='';return this.view();}
  select(id){
    const target=optionalText(id);
    if(target&&!this._entries().some(entry=>entry.id===target))throw Error(`AUDIT_PROVENANCE_SELECTION_UNKNOWN:${target}`);
    this.selectedId=target;
    return this.view();
  }
  dismissDetails(){this.selectedId=null;return this.view();}
  _entries(){return this.projection?.entries||[];}
  _visibleEntries(){
    const filter=normalizeFilter(this.filterText);
    return this._entries().filter(entry=>!filter||searchableText(entry).includes(filter));
  }
  relativeId(currentId,delta){
    const ids=this._visibleEntries().map(entry=>entry.id);
    if(!ids.length)return null;
    const currentIndex=ids.indexOf(currentId);
    if(currentIndex<0)return delta<0?ids.at(-1):ids[0];
    return ids[Math.max(0,Math.min(ids.length-1,currentIndex+delta))];
  }
  edgeId(which){
    const entries=this._visibleEntries();
    if(!entries.length)return null;
    return which==='last'?entries.at(-1).id:entries[0].id;
  }
  view(){
    const projection=this.projection;
    if(!projection)return deepFreeze({
      owner:AUDIT_PROVENANCE_PRESENTATION_OWNER.id,
      provider:this.descriptor,
      state:'EMPTY',
      identity:null,
      entries:Object.freeze([]),visibleEntries:Object.freeze([]),filterText:this.filterText,selectedId:null,selected:null,
      message:'No provenance projection has been read.',observedAt:null,freshness:deepFreeze({}),truth:Object.freeze({source:'PRESENTATION_LOCAL',immutableClaimMadeByPresentation:false,reviewAuthorityClaimMadeByPresentation:false,causalInferenceMadeByPresentation:false})
    });
    const visibleEntries=this._visibleEntries().map(entry=>deepFreeze({...entry,selected:entry.id===this.selectedId}));
    const selected=projection.entries.find(entry=>entry.id===this.selectedId)||null;
    return deepFreeze({
      owner:projection.owner,provider:projection.provider,state:projection.state,identity:projection.identity,
      entries:projection.entries,visibleEntries:Object.freeze(visibleEntries),filterText:this.filterText,selectedId:this.selectedId,selected,
      message:projection.message,observedAt:projection.observedAt,freshness:projection.freshness,truth:projection.truth
    });
  }
  boundaryReceipt(){
    return deepFreeze({
      owner:AUDIT_PROVENANCE_PRESENTATION_OWNER.id,
      providerId:this.descriptor.providerId,
      domainKind:this.descriptor.domainKind,
      authorityRef:this.descriptor.authorityRef,
      owns:Object.freeze(['PRESENTATION','LOCAL_INSPECTION_INTERACTION']),
      doesNotOwn:Object.freeze(['W05_AUDIT_EVENT_DOMAIN','AUDIT_IMMUTABILITY','FORMAL_REVIEW_AUTHORITY','DOMAIN_MEANING','DOMAIN_VOCABULARY','PROVIDER_DATA_TRUTH','PERSISTENCE']),
      mutationApiExposed:false,
      reviewDecisionApiExposed:false
    });
  }
}
