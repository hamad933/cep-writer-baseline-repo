import {RUNTIME_ADAPTER_CONTRACT} from '../operational.js';

const clone=value=>structuredClone(value);
const text=(value,name)=>{if(typeof value!=='string'||!value.trim())throw Error(`RUNTIME_ADAPTER_${name}_REQUIRED`);return value};

/**
 * Boundary validator for provider-neutral Operational presentation.
 * RuntimeAdapter remains canonical runtime/device/session causal truth.
 * This module exposes read/projection helpers only; it never parses or executes input.
 */
export {RUNTIME_ADAPTER_CONTRACT};
export const OPERATIONAL_RUNTIME_PRESENTATION_BOUNDARY=Object.freeze({
  id:'OperationalRuntimePresentationBoundary',
  version:'1.0.0',
  compatibility:'SEMVER',
  scope:'PRESENTATION_READ_BOUNDARY_ONLY',
  canonicalTruthOwner:'RuntimeAdapter'
});

export function validateRuntimeAdapterForPresentation(provider){
  if(!provider||typeof provider!=='object')throw Error('RUNTIME_ADAPTER_PROVIDER_REQUIRED');
  if(typeof provider.descriptor!=='function')throw Error('RUNTIME_ADAPTER_DESCRIPTOR_REQUIRED');
  if(typeof provider.session!=='function')throw Error('RUNTIME_ADAPTER_SESSION_READER_REQUIRED');
  const descriptor=provider.descriptor();
  if(descriptor?.contract?.id!==RUNTIME_ADAPTER_CONTRACT.id)throw Error('INVALID_RUNTIME_ADAPTER_CONTRACT');
  if(descriptor.contract.version!==RUNTIME_ADAPTER_CONTRACT.version)throw Error('RUNTIME_ADAPTER_VERSION_MISMATCH');
  text(descriptor.id,'ID');text(descriptor.label,'LABEL');text(descriptor.sessionOwner||descriptor.id,'SESSION_OWNER');
  return Object.freeze({
    contract:clone(descriptor.contract),
    id:descriptor.id,
    label:descriptor.label,
    sessionOwner:descriptor.sessionOwner||descriptor.id,
    commandOwner:descriptor.commandOwner||null,
    inputLabel:typeof descriptor.inputLabel==='string'?descriptor.inputLabel:'',
    help:typeof descriptor.help==='string'?descriptor.help:'',
    capabilities:Array.isArray(descriptor.capabilities)?[...descriptor.capabilities]:[],
    connected:provider.connected!==false
  });
}

export class RuntimeAdapterPresentationBoundary {
  constructor(provider){
    this.provider=provider;
    this.presentationDescriptor=validateRuntimeAdapterForPresentation(provider);
  }
  descriptor(){
    const next=validateRuntimeAdapterForPresentation(this.provider);
    return clone({...next,connected:this.provider.connected!==false});
  }
  readSession(sessionId){
    text(sessionId,'SESSION_ID');
    const session=this.provider.session(sessionId);
    if(!session)throw Error('RUNTIME_SESSION_UNAVAILABLE:'+sessionId);
    if(session.id!==sessionId)throw Error('RUNTIME_SESSION_IDENTITY_MISMATCH');
    if(typeof session.deviceId!=='string'||!session.deviceId)throw Error('RUNTIME_SESSION_DEVICE_ID_REQUIRED');
    return clone(session);
  }
  prompt(sessionId){
    const session=this.readSession(sessionId),descriptor=this.provider.descriptor();
    if(typeof descriptor.prompt!=='function')return '';
    const value=descriptor.prompt(clone(session));
    return typeof value==='string'?value:'';
  }
  connectionState(){return this.provider.connected===false?'DISCONNECTED':'CONNECTED';}
}
