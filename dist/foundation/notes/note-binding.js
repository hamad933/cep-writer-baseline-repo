export const NOTE_BINDING_CONTRACT=Object.freeze({
  id:'NoteBindingAdapter',
  version:'1.0.0',
  owner:'NoteBindingAdapter',
  policyRevision:'W6-B-NOTE-BINDING-01',
  responsibilities:Object.freeze(['note-to-source-binding-truth','binding-availability-provenance','fail-atomic-rebind','presentation-stable-binding-projection']),
  excludedOwnership:Object.freeze(['note-content','note-document','sticky-note-window-geometry','sticky-note-window-lifecycle','source-domain-mutation','source-deletion','structured-mutation','structured-history','structured-selection','structured-clipboard','structured-input','persistence-storage','dom-focus','dom-scroll'])
});

const OWNER_INSTANCES=new WeakSet();
const DOMAIN_INPUT_ADAPTERS=new WeakSet();
const SOURCE_FIELDS=Object.freeze(['documentId','objectId','blockId','sourceRange']);
const SOURCE_ID_FIELDS=Object.freeze(['documentId','objectId','blockId']);
const AVAILABILITY_STATES=new Set(['available','stale','unresolved','not-applicable']);

const fail=(code,detail='')=>{throw Error(detail?`${code}:${detail}`:code)};
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);

function scalar(value,label,{optional=false}={}){
  if(value===undefined||value===null){if(optional)return undefined;fail('MISSING_BINDING_IDENTITY',label)}
  if(typeof value!=='string')fail('MALFORMED_BINDING_IDENTITY_TYPE',label);
  if(!value.length||value.trim()!==value||/[\u0000-\u001f\u007f]/.test(value))fail('MALFORMED_BINDING_IDENTITY_VALUE',label);
  return value;
}

function canonicalJson(value,path='value'){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){if(!Number.isFinite(value))fail('NON_SERIALIZABLE_BINDING_METADATA',path);return value}
  if(Array.isArray(value))return value.map((item,index)=>canonicalJson(item,`${path}[${index}]`));
  if(!isObject(value))fail('NON_SERIALIZABLE_BINDING_METADATA',path);
  const out={};
  for(const key of Object.keys(value).sort()){
    const item=value[key];
    if(item===undefined||typeof item==='function'||typeof item==='symbol'||typeof item==='bigint')fail('NON_SERIALIZABLE_BINDING_METADATA',`${path}.${key}`);
    out[key]=canonicalJson(item,`${path}.${key}`);
  }
  return out;
}

const clone=value=>value===undefined?undefined:structuredClone(value);
const canonicalClone=value=>canonicalJson(clone(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function normalizeSourceField(source,input,field){
  const aliases={documentId:['sourceDocumentId','documentId'],objectId:['sourceObjectId','objectId'],blockId:['sourceBlockId','blockId'],sourceRange:['sourceRange']}[field];
  const values=[];
  if(source&&own(source,field)&&source[field]!==undefined&&source[field]!==null)values.push({origin:`source.${field}`,value:source[field]});
  for(const alias of aliases)if(own(input,alias)&&input[alias]!==undefined&&input[alias]!==null)values.push({origin:alias,value:input[alias]});
  if(!values.length)return undefined;
  const normalized=values.map(item=>field==='sourceRange'?canonicalClone(item.value):scalar(item.value,item.origin));
  const first=normalized[0];
  for(let index=1;index<normalized.length;index++)if(!same(first,normalized[index]))fail('CONTRADICTORY_SOURCE_IDENTITY',field);
  return first;
}

function normalizeAvailability(value,{previous=null,explicitSourceValidated=false}={}){
  if(!isObject(value))fail('MALFORMED_AVAILABILITY','object-required');
  const state=scalar(value.state,'availability.state');
  if(!AVAILABILITY_STATES.has(state))fail('MALFORMED_AVAILABILITY_STATE',state);
  const out={state};
  if(own(value,'reason'))out.reason=scalar(value.reason,'availability.reason',{optional:true});
  if(own(value,'evidence'))out.evidence=canonicalClone(value.evidence);
  if(own(value,'provenance'))out.provenance=canonicalClone(value.provenance);
  if(previous&&['stale','unresolved'].includes(previous.state)&&state==='available'){
    if(!explicitSourceValidated)fail('EXPLICIT_SOURCE_REVALIDATION_REQUIRED');
    if(!own(out,'evidence'))fail('RESOLUTION_EVIDENCE_REQUIRED');
  }
  return out;
}

function assertSourceAvailabilityInvariant(source,availability){
  const sourceIdentityCount=SOURCE_ID_FIELDS.filter(field=>own(source,field)).length;
  if(!sourceIdentityCount&&!['unresolved','not-applicable'].includes(availability.state))fail('SOURCE_IDENTITY_REQUIRED_FOR_AVAILABLE_BINDING');
}

function validateMetadataCoherence(metadata,domainKind,surfaceId,label){
  if(metadata===undefined)return undefined;
  const next=canonicalClone(metadata);
  if(isObject(next)){
    if(own(next,'domainKind')&&next.domainKind!==domainKind)fail('CONTRADICTORY_DOMAIN_METADATA',`${label}.domainKind`);
    if(own(next,'surfaceId')&&next.surfaceId!==surfaceId)fail('CONTRADICTORY_SURFACE_METADATA',`${label}.surfaceId`);
    if(own(next,'surface')&&next.surface!==surfaceId)fail('CONTRADICTORY_SURFACE_METADATA',`${label}.surface`);
  }
  return next;
}

function assertAdapter(adapter){
  if(!adapter||!DOMAIN_INPUT_ADAPTERS.has(adapter))fail('NON_CANONICAL_DOMAIN_BINDING_ADAPTER');
  return adapter;
}

export function createDomainBindingInputAdapter({id,domainKind,surfaceId,allowedSourceFields=SOURCE_FIELDS}={}){
  const adapter={
    id:scalar(id,'domainAdapter.id'),
    domainKind:scalar(domainKind,'domainAdapter.domainKind'),
    surfaceId:scalar(surfaceId,'domainAdapter.surfaceId'),
    allowedSourceFields:Object.freeze([...new Set(allowedSourceFields.map(field=>{if(!SOURCE_FIELDS.includes(field))fail('UNKNOWN_SOURCE_FIELD',field);return field}))]),
    input(fields={}){
      if(!isObject(fields))fail('MALFORMED_BINDING_INPUT');
      return {...fields,adapter};
    }
  };
  DOMAIN_INPUT_ADAPTERS.add(adapter);
  return Object.freeze(adapter);
}

export function isCanonicalDomainBindingInputAdapter(value){return !!value&&DOMAIN_INPUT_ADAPTERS.has(value)}
export function isCanonicalNoteBindingOwner(value){return !!value&&OWNER_INSTANCES.has(value)}
export function assertCanonicalNoteBindingOwner(value){if(!isCanonicalNoteBindingOwner(value))fail('NON_CANONICAL_NOTE_BINDING_OWNER');return value}

function normalizedBinding(requestedNoteId,input){
  if(!isObject(input))fail('MALFORMED_BINDING_INPUT');
  const adapter=assertAdapter(input.adapter);
  const requested=scalar(requestedNoteId,'requestedNoteId');
  const noteId=scalar(input.noteId,'noteId');
  if(requested!==noteId)fail('NOTE_ID_MISMATCH',`${requested}!=${noteId}`);
  const domainKind=scalar(input.domainKind??adapter.domainKind,'domainKind');
  const surfaceId=scalar(input.surfaceId??adapter.surfaceId,'surfaceId');
  if(domainKind!==adapter.domainKind)fail('DOMAIN_ADAPTER_MISMATCH',domainKind);
  if(surfaceId!==adapter.surfaceId)fail('SURFACE_ADAPTER_MISMATCH',surfaceId);
  const route=scalar(input.route,'route');
  const sourceInput=isObject(input.source)?input.source:{};
  if(input.source!==undefined&&!isObject(input.source))fail('MALFORMED_SOURCE_IDENTITY');
  const source={};
  for(const field of SOURCE_FIELDS){
    const value=normalizeSourceField(sourceInput,input,field);
    if(value===undefined)continue;
    if(!adapter.allowedSourceFields.includes(field))fail('SOURCE_FIELD_NOT_APPLICABLE',field);
    source[field]=value;
  }
  const availability=normalizeAvailability(input.availability);
  assertSourceAvailabilityInvariant(source,availability);
  if(own(source,'blockId')&&!own(source,'documentId'))fail('BLOCK_REQUIRES_DOCUMENT_IDENTITY');
  const descriptor={
    noteId,
    domain:{kind:domainKind,surfaceId},
    source,
    route,
    availability,
    provenance:{kind:'EXPLICIT_VALIDATED_BINDING',domainAdapterId:adapter.id},
    owner:NOTE_BINDING_CONTRACT.owner,
    policyRevision:NOTE_BINDING_CONTRACT.policyRevision
  };
  if(own(input,'sourceLabel'))descriptor.sourceLabel=scalar(input.sourceLabel,'sourceLabel',{optional:true});
  if(own(input,'sourceMetadata'))descriptor.sourceMetadata=validateMetadataCoherence(input.sourceMetadata,domainKind,surfaceId,'sourceMetadata');
  if(own(input,'contextMetadata'))descriptor.contextMetadata=validateMetadataCoherence(input.contextMetadata,domainKind,surfaceId,'contextMetadata');
  if(own(input,'revisions'))descriptor.revisions=canonicalClone(input.revisions);
  return canonicalClone(descriptor);
}

function sourceFromDescriptor(descriptor){return canonicalClone(descriptor.source)}

function validateExplicitSameSource(descriptor,input){
  if(!isObject(input)||!isObject(input.source))return false;
  const explicit={};
  for(const field of SOURCE_FIELDS)if(own(input.source,field)&&input.source[field]!==undefined&&input.source[field]!==null)explicit[field]=field==='sourceRange'?canonicalClone(input.source[field]):scalar(input.source[field],`source.${field}`);
  return Object.keys(explicit).length>0&&same(canonicalClone(explicit),sourceFromDescriptor(descriptor));
}

function normalizePresentation(value){
  if(!isObject(value))fail('MALFORMED_PRESENTATION_CONTEXT');
  const forbidden=['documentId','objectId','blockId','sourceDocumentId','sourceObjectId','sourceBlockId','source','domainKind','surfaceId'];
  for(const key of forbidden)if(own(value,key))fail('PRESENTATION_IDENTITY_CANNOT_BECOME_SOURCE_IDENTITY',key);
  const out={};
  for(const key of ['presentationId','windowInstanceId','hostKind','visibility'])if(own(value,key))out[key]=scalar(value[key],`presentation.${key}`,{optional:true});
  if(own(value,'metadata'))out.metadata=canonicalClone(value.metadata);
  return canonicalClone(out);
}

export class NoteBindingAdapter {
  constructor(){this.owner=NOTE_BINDING_CONTRACT.owner;this.contract=NOTE_BINDING_CONTRACT;this.bindings=new Map();this.sequence=0;OWNER_INSTANCES.add(this)}
  assertCanonicalOwner(){assertCanonicalNoteBindingOwner(this);return {owner:this.owner,policyRevision:this.contract.policyRevision}}
  has(noteId){return this.bindings.has(scalar(noteId,'noteId'))}
  descriptor(noteId){const id=scalar(noteId,'noteId'),value=this.bindings.get(id);if(!value)fail('UNKNOWN_NOTE_BINDING',id);return clone(value)}
  snapshot(){return [...this.bindings.keys()].sort().map(noteId=>this.descriptor(noteId))}
  bind(requestedNoteId,input){
    this.assertCanonicalOwner();const next=normalizedBinding(requestedNoteId,input);if(this.bindings.has(next.noteId))fail('NOTE_BINDING_ALREADY_EXISTS',next.noteId);
    this.bindings.set(next.noteId,next);return {ok:true,changed:true,status:'BOUND',receipt:this._receipt('bind',next),binding:clone(next)};
  }
  rebind(requestedNoteId,input){
    this.assertCanonicalOwner();const id=scalar(requestedNoteId,'requestedNoteId');const before=this.descriptor(id);const next=normalizedBinding(id,input);
    const changed=!same(before,next);if(changed)this.bindings.set(id,next);
    return {ok:true,changed,status:changed?'REBOUND':'NO_CHANGE',receipt:this._receipt('rebind',changed?next:before),binding:this.descriptor(id)};
  }
  projectAvailability(noteId,input){
    this.assertCanonicalOwner();const id=scalar(noteId,'noteId'),before=this.descriptor(id);if(!isObject(input))fail('MALFORMED_AVAILABILITY_INPUT');
    const explicitSourceValidated=validateExplicitSameSource(before,input);
    if(input.source&& !explicitSourceValidated)fail('AVAILABILITY_SOURCE_IDENTITY_MISMATCH');
    const availability=normalizeAvailability(input.availability??input,{previous:before.availability,explicitSourceValidated});
    const next=canonicalClone({...before,availability});
    assertSourceAvailabilityInvariant(next.source,next.availability);
    const changed=!same(before,next);if(changed)this.bindings.set(id,next);
    return {ok:true,changed,status:changed?'AVAILABILITY_PROJECTED':'NO_CHANGE',receipt:this._receipt('availability',changed?next:before),binding:this.descriptor(id)};
  }
  projectForPresentation(noteId,presentation){
    this.assertCanonicalOwner();const binding=this.descriptor(noteId),context=normalizePresentation(presentation);
    return {noteId:binding.noteId,binding,presentation:context,bindingOwner:this.owner,bindingPolicyRevision:this.contract.policyRevision,presentationSemanticOwnership:'NONE'};
  }
  _receipt(operation,binding){return {sequence:++this.sequence,operation,noteId:binding.noteId,owner:this.owner,policyRevision:this.contract.policyRevision,domainKind:binding.domain.kind,surfaceId:binding.domain.surfaceId,availability:binding.availability.state,sourceIdentity:sourceFromDescriptor(binding)}}
}
