export const BOTTOM_DEEP_WORK_PROVIDER_CONTRACT=Object.freeze({
  id:'BottomDeepWorkProviderContract',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'BottomDeepWorkOwner',
  projectionMode:'READ_ONLY_LIVE_PROJECTION'
});

export const BOTTOM_DEEP_WORK_PROVIDER_FAMILIES=Object.freeze(['structured','operational']);
export const BOTTOM_DEEP_WORK_FORBIDDEN_PROVIDER_METHODS=Object.freeze([
  'undo','redo','commit','captureRecovery','recoverAsNew','restoreHistoryAsNew',
  'input','open','lifecycle','mutate','update','write','save','execute'
]);

const clone=value=>structuredClone(value);

export function validateBottomDeepWorkProvider(provider){
  if(!provider||typeof provider!=='object')throw Error('BOTTOM_PROVIDER_REQUIRED');
  if(typeof provider.descriptor!=='function'||typeof provider.read!=='function')throw Error('INVALID_BOTTOM_PROVIDER_CONTRACT');
  const descriptor=provider.descriptor();
  if(!descriptor||descriptor.contract?.id!==BOTTOM_DEEP_WORK_PROVIDER_CONTRACT.id)throw Error('INVALID_BOTTOM_PROVIDER_CONTRACT');
  if(typeof descriptor.id!=='string'||!descriptor.id)throw Error('BOTTOM_PROVIDER_ID_REQUIRED');
  if(!BOTTOM_DEEP_WORK_PROVIDER_FAMILIES.includes(descriptor.family))throw Error('UNSUPPORTED_BOTTOM_PROVIDER_FAMILY');
  if(descriptor.readOnly!==true||descriptor.ownsCanonicalContent===true)throw Error('BOTTOM_PROVIDER_MUST_BE_READ_ONLY');
  for(const method of BOTTOM_DEEP_WORK_FORBIDDEN_PROVIDER_METHODS)if(typeof provider[method]==='function')throw Error(`BOTTOM_PROVIDER_MUTATION_METHOD_FORBIDDEN:${method}`);
  return Object.freeze(clone(descriptor));
}

export function readBottomDeepWorkProvider(provider){
  const descriptor=validateBottomDeepWorkProvider(provider),projection=provider.read();
  if(!projection||typeof projection!=='object')throw Error('INVALID_BOTTOM_PROVIDER_PROJECTION');
  if(projection.providerId!==descriptor.id)throw Error('BOTTOM_PROVIDER_PROJECTION_ID_MISMATCH');
  if(projection.readOnly!==true||projection.ownsCanonicalContent===true)throw Error('BOTTOM_PROVIDER_PROJECTION_MUST_BE_READ_ONLY');
  if(projection.sourceOwner!==descriptor.sourceOwner)throw Error('BOTTOM_PROVIDER_SOURCE_OWNER_MISMATCH');
  return clone(projection);
}
