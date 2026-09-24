export const SEMANTIC_COMMAND_BUS_OWNER='SemanticCommandBus';
export const SEMANTIC_COMMAND_CONTRACT=Object.freeze({id:SEMANTIC_COMMAND_BUS_OWNER,version:'1.1.0',receiptPolicyTag:'semantic-command-v1'});

const normalizeAvailability=(value,owner)=>{
  if(value===true)return {enabled:true,reason:'',code:'AVAILABLE',availabilityOwner:owner};
  if(typeof value==='string')return {enabled:false,reason:value,code:'UNAVAILABLE',availabilityOwner:owner};
  if(value&&typeof value==='object'&&'enabled' in value)return {code:value.enabled?'AVAILABLE':'UNAVAILABLE',reason:'',availabilityOwner:value.availabilityOwner||value.owner||owner,...value,enabled:!!value.enabled};
  return {enabled:false,reason:'Unavailable in this context',code:'UNAVAILABLE',availabilityOwner:owner};
};
const commandRoute=payload=>String(payload?.route||payload?.commandRoute||payload?.context?.route||'direct');

/** Canonical Global owner for semantic command identity, discovery, availability-gated execution and receipts. */
export class SemanticCommandBus {
  constructor(){this.commands=new Map();this.capabilities=new Map();this.actionSurfaces=new Map();this.receipts=[];this.sequence=0;}
  register(id,owner,label,run,available=()=>true){return this.registerCommand(id,owner,label,run,available);}
  registerCommand(id,owner,label,run,available=()=>true){if(!id||!owner||typeof run!=='function')throw Error('INVALID_COMMAND_REGISTRATION');if(this.commands.has(id))throw Error('DUPLICATE_COMMAND_OWNER:'+id);this.commands.set(id,{id,owner,label,run,available});return this.commands.get(id);}
  availability(id,payload={}){const command=this.commands.get(id);if(!command)return {id,owner:null,commandOwner:null,availabilityOwner:SEMANTIC_COMMAND_BUS_OWNER,enabled:false,reason:'Unknown command',code:'UNKNOWN_COMMAND'};const result=normalizeAvailability(command.available(payload),command.owner);return {id,owner:command.owner,commandOwner:command.owner,...result};}
  execute(id,payload={}){const availability=this.availability(id,payload),command=this.commands.get(id);if(!availability.enabled)return {ok:false,id,owner:command?.owner||null,commandOwner:command?.owner||null,...availability};const result=command.run(payload);const receipt={sequence:++this.sequence,id,owner:command.owner,commandOwner:command.owner,availabilityOwner:availability.availabilityOwner||command.owner,route:commandRoute(payload),policyTag:SEMANTIC_COMMAND_CONTRACT.receiptPolicyTag};this.receipts.push(receipt);return result;}
  items(payload={}){return [...this.commands.values()].map(command=>({id:command.id,label:command.label,owner:command.owner,...this.availability(command.id,payload)}));}
  queryItems(query='',payload={}){const needle=String(query??'').trim().toLocaleLowerCase();return this.items(payload).filter(item=>!needle||`${item.id} ${item.label} ${item.owner} ${item.reason||''}`.toLocaleLowerCase().includes(needle));}
  lastReceipt(){return this.receipts.at(-1)||null;}
  clearReceipts(){this.receipts.length=0;this.sequence=0;}
  registerCapability(id,owner,resolve,unavailableReason='Capability unavailable'){if(this.capabilities.has(id))throw Error('DUPLICATE_CAPABILITY_OWNER:'+id);this.capabilities.set(id,{id,owner,resolve,unavailableReason});return this.capabilities.get(id);}
  inspectCapability(id,context={}){const capability=this.capabilities.get(id);if(!capability)return {id,enabled:false,owner:null,reason:'Unknown capability'};const value=capability.resolve(context);return {id,owner:capability.owner,enabled:value===true,reason:value===true?'':typeof value==='string'?value:capability.unavailableReason};}
  registerActionSurface(id,owner,{presentation,routes,commands,exitRoutes}){if(this.actionSurfaces.has(id))throw Error('DUPLICATE_ACTION_SURFACE_OWNER:'+id);if(!routes?.length||!commands?.length||!exitRoutes?.length)throw Error('INCOMPLETE_ACTION_SURFACE:'+id);const surface={id,owner,presentation,routes:[...routes],commands:[...commands],exitRoutes:[...exitRoutes]};this.actionSurfaces.set(id,surface);return surface;}
  validateActionSurfaces(){const missing=[];for(const surface of this.actionSurfaces.values())for(const id of surface.commands)if(!this.commands.has(id))missing.push(`${surface.id}:${id}`);if(missing.length)throw Error('UNREGISTERED_ACTION_ROUTE:'+missing.join(','));return true;}
}

/** Dependency-injection contract: one canonical application semantic-command owner. Compositions and hosts must receive the canonical bus; they must not silently construct competing canonical owners. */
export const SEMANTIC_COMMAND_BUS_DI_CONTRACT=Object.freeze({id:SEMANTIC_COMMAND_BUS_OWNER+':DIContract',version:'1.0.0',canonicalOwner:SEMANTIC_COMMAND_BUS_OWNER,policy:'CANONICAL_BUS_INJECTED_BY_CALLER__NO_COMPOSITION_LOCAL_COMPETING_BUS',contextualShortcutRule:'SHORTCUTS_REUSE_CANONICAL_BUS__NEVER_BECOME_OWNERS'});
export function assertCanonicalSemanticCommandBus(candidate,consumer='unknown'){
  if(candidate instanceof SemanticCommandBus)return candidate;
  throw Error('CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED:'+consumer);
}
