export const OPERATIONAL_TERMINAL_STATES=Object.freeze(['idle','running','completed','error','unavailable','read-only']);
const valid=new Set(OPERATIONAL_TERMINAL_STATES);
const clone=value=>value==null?value:structuredClone(value);

export const OPERATIONAL_RUNTIME_TRUTH=Object.freeze({
  owner:'RuntimeAdapter',
  presentationOwner:'OperationalSessionOwner',
  capabilityAuthority:'PROVIDER_DESCRIPTOR_ONLY',
  currentDefault:'InternalSimulationAdapter'
});

export function operationalStateLabel(state){return ({idle:'Ready',running:'Running',completed:'Completed',error:'Error',unavailable:'Unavailable','read-only':'Read only'})[state]||'Ready';}

export function normalizeOperationalTerminalState(providerOrDescriptor,session){
  const connected=providerOrDescriptor?.connected!==false;
  const raw=session?.presentation?.state||session?.presentationState||session?.executionState;
  let state=valid.has(raw)?raw:(session?.recorded?'read-only':(Array.isArray(session?.lines)&&session.lines.length?'completed':'idle'));
  let detail=String(session?.presentation?.detail||'').trim();
  if(!connected){state='unavailable';detail=detail||'Runtime provider is unavailable.';}
  if(session?.recorded){state='read-only';detail=detail||'Recorded runtime evidence is read only.';}
  return {state,label:operationalStateLabel(state),detail,sequence:Number(session?.presentation?.sequence||0),transitions:clone(session?.presentation?.transitions||[])};
}

export function operationalInputAvailability(providerOrDescriptor,session){
  const state=normalizeOperationalTerminalState(providerOrDescriptor,session);
  if(providerOrDescriptor?.connected===false)return {enabled:false,reason:'Runtime provider is unavailable.',state};
  if(!session)return {enabled:false,reason:'Runtime session is unavailable.',state:{...state,state:'unavailable',label:'Unavailable'}};
  if(session.recorded||state.state==='read-only')return {enabled:false,reason:'Recorded runtime evidence is read only.',state};
  if(state.state==='running')return {enabled:false,reason:'A simulated command is already running.',state};
  return {enabled:true,reason:'',state};
}

export function operationalStateData(state){
  if(state==='error'||state==='unavailable')return 'error';
  if(state==='running')return 'stale';
  return state;
}
