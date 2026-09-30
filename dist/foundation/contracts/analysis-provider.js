const providerInstances=new WeakSet();
const clone=value=>value===undefined?undefined:structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const requiredText=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value;};
const exactRefAlias=/^(latest|current|active|head)$/i;

export const ANALYTICAL_PROVIDER_CONTRACT=Object.freeze({
  id:'AnalyticalCompareProvider',
  version:'1.0.0',
  compatibility:'EXACT_MAJOR',
  owner:'AnalyticalCompareOwner',
  semanticCore:'SC-032 / AnalyticalWorkbenchCore',
  authority:'DOMAIN_SEMANTICS_REMAIN_PROVIDER_OWNED'
});

export const ANALYTICAL_RESOLUTION_STATES=Object.freeze(['RESOLVED','MISSING','UNRESOLVABLE']);

function plainObject(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}

/**
 * Analytical comparison accepts deterministic normalized data only.
 * Dates, Maps, Sets, class instances, sparse arrays, undefined, BigInt,
 * Symbols, functions, NaN and infinities are rejected instead of being
 * silently collapsed by JSON/string coercion.
 */
export function assertAnalyticalCanonicalValue(value,code='ANALYTICAL_NON_DETERMINISTIC_VALUE',seen=new WeakSet()){
  if(value===null)return value;
  const type=typeof value;
  if(type==='string'||type==='boolean')return value;
  if(type==='number'){
    if(!Number.isFinite(value))throw Error(code);
    return value;
  }
  if(type!=='object')throw Error(code);
  if(seen.has(value))throw Error(`${code}:CYCLE`);
  seen.add(value);
  try{
    if(Array.isArray(value)){
      for(let index=0;index<value.length;index++){
        if(!Object.prototype.hasOwnProperty.call(value,index))throw Error(`${code}:SPARSE_ARRAY`);
        assertAnalyticalCanonicalValue(value[index],code,seen);
      }
      return value;
    }
    if(!plainObject(value))throw Error(code);
    for(const key of Object.keys(value))assertAnalyticalCanonicalValue(value[key],code,seen);
    return value;
  }finally{seen.delete(value);}
}

/** Type-tagged deterministic token; object keys are sorted. */
export function analyticalCanonicalValueToken(value,code='ANALYTICAL_NON_DETERMINISTIC_VALUE'){
  assertAnalyticalCanonicalValue(value,code);
  const token=current=>{
    if(current===null)return 'null';
    if(typeof current==='string')return `s:${JSON.stringify(current)}`;
    if(typeof current==='boolean')return current?'b:1':'b:0';
    if(typeof current==='number')return `n:${Object.is(current,-0)?'-0':String(current)}`;
    if(Array.isArray(current))return `a:[${current.map(token).join(',')}]`;
    return `o:{${Object.keys(current).sort().map(key=>`${JSON.stringify(key)}:${token(current[key])}`).join(',')}}`;
  };
  return token(value);
}

/** Collision-safe identity string for exact refs, provider indexes and pairs. */
export function canonicalAnalyticalIdentityKey(namespace,parts){
  requiredText(namespace,'ANALYTICAL_IDENTITY_NAMESPACE_REQUIRED');
  if(!Array.isArray(parts))throw Error('ANALYTICAL_IDENTITY_PARTS_ARRAY_REQUIRED');
  return `ACID1:${analyticalCanonicalValueToken([namespace,...parts],'ANALYTICAL_IDENTITY_PART_NON_DETERMINISTIC')}`;
}

function validateDescriptor(descriptor){
  if(!descriptor||typeof descriptor!=='object')throw Error('ANALYTICAL_PROVIDER_DESCRIPTOR_REQUIRED');
  requiredText(descriptor.providerId,'ANALYTICAL_PROVIDER_ID_REQUIRED');
  requiredText(descriptor.domainKind,'ANALYTICAL_PROVIDER_DOMAIN_KIND_REQUIRED');
  requiredText(descriptor.schemaVersion,'ANALYTICAL_PROVIDER_SCHEMA_VERSION_REQUIRED');
  requiredText(descriptor.comparatorVersion,'ANALYTICAL_PROVIDER_COMPARATOR_VERSION_REQUIRED');
  requiredText(descriptor.identityShape,'ANALYTICAL_PROVIDER_IDENTITY_SHAPE_REQUIRED');
  if(descriptor.contract?.id!==ANALYTICAL_PROVIDER_CONTRACT.id||descriptor.contract?.version!==ANALYTICAL_PROVIDER_CONTRACT.version)throw Error('ANALYTICAL_PROVIDER_CONTRACT_MISMATCH');
  return descriptor;
}

function validateProvenanceRefs(value){
  if(value===undefined)return [];
  if(!Array.isArray(value))throw Error('ANALYTICAL_FIELD_PROVENANCE_ARRAY_REQUIRED');
  assertAnalyticalCanonicalValue(value,'ANALYTICAL_PROVENANCE_NON_DETERMINISTIC');
  return clone(value);
}

function validateField(field){
  if(!field||typeof field!=='object')throw Error('ANALYTICAL_FIELD_DESCRIPTOR_REQUIRED');
  requiredText(field.path,'ANALYTICAL_FIELD_PATH_REQUIRED');
  requiredText(field.label,'ANALYTICAL_FIELD_LABEL_REQUIRED');
  requiredText(field.type,'ANALYTICAL_FIELD_TYPE_REQUIRED');
  if(typeof field.present!=='boolean')throw Error('ANALYTICAL_FIELD_EXPLICIT_PRESENCE_REQUIRED');
  if(field.present&&!Object.prototype.hasOwnProperty.call(field,'value'))throw Error('ANALYTICAL_FIELD_VALUE_REQUIRED');
  if(!field.present&&Object.prototype.hasOwnProperty.call(field,'value')&&field.value!==undefined)throw Error('ANALYTICAL_ABSENT_FIELD_MUST_NOT_HAVE_VALUE');
  if(field.present)assertAnalyticalCanonicalValue(field.value,`ANALYTICAL_FIELD_VALUE_NON_DETERMINISTIC:${field.path}`);
  const normalized={...clone(field),provenanceRefs:validateProvenanceRefs(field.provenanceRefs)};
  return freeze(normalized);
}

function validateResolution(resolution,exactRef){
  if(!resolution||typeof resolution!=='object')throw Error('ANALYTICAL_PROVIDER_RESOLUTION_REQUIRED');
  if(!ANALYTICAL_RESOLUTION_STATES.includes(resolution.state))throw Error('ANALYTICAL_PROVIDER_RESOLUTION_STATE_INVALID');
  const base={...clone(resolution),exactRef:clone(exactRef)};
  if(resolution.state==='RESOLVED'){
    requiredText(resolution.objectId,'ANALYTICAL_RESOLVED_OBJECT_ID_REQUIRED');
    requiredText(resolution.revisionId,'ANALYTICAL_RESOLVED_REVISION_ID_REQUIRED');
    requiredText(resolution.schemaVersion,'ANALYTICAL_RESOLVED_SCHEMA_VERSION_REQUIRED');
    if(!Array.isArray(resolution.fields))throw Error('ANALYTICAL_RESOLVED_FIELDS_REQUIRED');
    base.fields=resolution.fields.map(validateField);
    const seenPaths=new Set();
    for(const field of base.fields){
      if(seenPaths.has(field.path))throw Error(`ANALYTICAL_DUPLICATE_FIELD_PATH:${field.path}`);
      seenPaths.add(field.path);
    }
    base.provenanceRefs=validateProvenanceRefs(resolution.provenanceRefs);
    if(base.domainContext!==undefined&&base.domainContext!==null)assertAnalyticalCanonicalValue(base.domainContext,'ANALYTICAL_DOMAIN_CONTEXT_NON_DETERMINISTIC');
    if(base.successorHint!==undefined&&base.successorHint!==null)assertAnalyticalCanonicalValue(base.successorHint,'ANALYTICAL_SUCCESSOR_HINT_NON_DETERMINISTIC');
  }else{
    requiredText(resolution.reason,'ANALYTICAL_UNRESOLVED_REASON_REQUIRED');
    requiredText(resolution.reasonCode,'ANALYTICAL_UNRESOLVED_REASON_CODE_REQUIRED');
    base.fields=[];
    base.provenanceRefs=validateProvenanceRefs(resolution.provenanceRefs);
    if(base.successorHint!==undefined&&base.successorHint!==null)assertAnalyticalCanonicalValue(base.successorHint,'ANALYTICAL_SUCCESSOR_HINT_NON_DETERMINISTIC');
  }
  return freeze(base);
}

/**
 * Creates a validated provider boundary and brands it by module-local identity.
 * The boundary deliberately exposes no persistence, review, mastery, audit or execution hooks.
 */
export function createAnalyticalProviderBoundary(definition){
  if(!definition||typeof definition!=='object')throw Error('ANALYTICAL_PROVIDER_DEFINITION_REQUIRED');
  const descriptor=validateDescriptor({...clone(definition.descriptor),contract:ANALYTICAL_PROVIDER_CONTRACT});
  for(const method of ['validateExactRef','refKey','resolve','preflightCompatibility'])if(typeof definition[method]!=='function')throw Error(`ANALYTICAL_PROVIDER_${method.toUpperCase()}_REQUIRED`);
  const refByKey=new Map(),keyByRefToken=new Map();
  const provider={
    descriptor(){return freeze(clone(descriptor));},
    validateExactRef(ref){
      const exact=definition.validateExactRef(clone(ref));
      if(!plainObject(exact))throw Error('ANALYTICAL_EXACT_REF_REQUIRED');
      assertAnalyticalCanonicalValue(exact,'ANALYTICAL_EXACT_REF_NON_DETERMINISTIC');
      for(const value of Object.values(exact))if(typeof value==='string'&&exactRefAlias.test(value.trim()))throw Error('ANALYTICAL_EXACT_REF_ALIAS_FORBIDDEN');
      return freeze(clone(exact));
    },
    refKey(ref){
      const exact=provider.validateExactRef(ref),key=requiredText(definition.refKey(clone(exact)),'ANALYTICAL_PROVIDER_REF_KEY_REQUIRED');
      const token=analyticalCanonicalValueToken(exact,'ANALYTICAL_EXACT_REF_NON_DETERMINISTIC');
      const priorToken=refByKey.get(key),priorKey=keyByRefToken.get(token);
      if(priorToken!==undefined&&priorToken!==token)throw Error(`ANALYTICAL_PROVIDER_REF_KEY_COLLISION:${key}`);
      if(priorKey!==undefined&&priorKey!==key)throw Error(`ANALYTICAL_PROVIDER_REF_KEY_NON_DETERMINISTIC:${priorKey}!=${key}`);
      refByKey.set(key,token);keyByRefToken.set(token,key);
      return key;
    },
    resolve(ref){
      const exact=provider.validateExactRef(ref);
      return validateResolution(definition.resolve(clone(exact)),exact);
    },
    preflightCompatibility(left,right,pair){
      const outcome=definition.preflightCompatibility(clone(left),clone(right),clone(pair));
      if(!outcome||typeof outcome!=='object'||typeof outcome.compatible!=='boolean')throw Error('ANALYTICAL_COMPATIBILITY_RESULT_INVALID');
      if(!outcome.compatible)requiredText(outcome.reason,'ANALYTICAL_INCOMPATIBILITY_REASON_REQUIRED');
      const comparatorVersion=outcome.comparatorVersion||descriptor.comparatorVersion;
      if(comparatorVersion!==descriptor.comparatorVersion)throw Error(`ANALYTICAL_COMPATIBILITY_COMPARATOR_VERSION_DRIFT:${comparatorVersion}`);
      if(outcome.reasonCode!==undefined&&outcome.reasonCode!=='')requiredText(outcome.reasonCode,'ANALYTICAL_INCOMPATIBILITY_REASON_CODE_INVALID');
      return freeze({compatible:outcome.compatible,reason:outcome.reason||'',reasonCode:outcome.reasonCode||'',comparatorVersion});
    }
  };
  Object.freeze(provider);
  providerInstances.add(provider);
  return provider;
}

export function validateAnalyticalProvider(provider){
  if(!providerInstances.has(provider))throw Error('ANALYTICAL_PROVIDER_BRAND_REJECTED');
  const descriptor=validateDescriptor(provider.descriptor());
  return freeze(clone(descriptor));
}
