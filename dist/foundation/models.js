import {SpatialSelectionNavigationKernel,createSpatialProjectionDescriptor} from './spatial/selection-kernel.js';
import {SpatialInteractionKernel} from './spatial/interaction-kernel.js';
import {SemanticCommandBus} from './global/commands.js';
import {ScopedPreferencesOwner,PREFERENCE_DEFINITIONS} from './global/preferences/store.js';
export {PREFERENCE_DEFINITIONS} from './global/preferences/store.js';
                               
                              
                                        
                               
                              
                                        
                               
                              
                                        
                               
                              
                                        
                               
                              
                                        
                               
                              
                                        
/** Pure shared mechanisms. No domain entities, host process, network or product backend. */
export const clone =    (x  )   => structuredClone(x);
export const clamp = (x       ,a       ,b       )        => Math.min(b,Math.max(a,x));
export class CommandRegistry {
  constructor(bus=new SemanticCommandBus()){this.bus=bus;}
  get commands(){return this.bus.commands;} get receipts(){return this.bus.receipts;} get sequence(){return this.bus.sequence;}
  register(id,owner,label,run,available=()=>true){return this.bus.registerCommand(id,owner,label,run,available);}
  availability(id,p={}){return this.bus.availability(id,p);}
  execute(id,p={}){return this.bus.execute(id,p);}
  items(p={}){return this.bus.items(p);}
}
export class CapabilityRegistry {
  constructor(bus=new SemanticCommandBus()){this.bus=bus;}
  get capabilities(){return this.bus.capabilities;}
  register(id,owner,resolve,unavailableReason='Capability unavailable'){return this.bus.registerCapability(id,owner,resolve,unavailableReason);}
  inspect(id,context={}){return this.bus.inspectCapability(id,context);}
}
export class ActionSurfaceRegistry {
  constructor(commands){this.commands=commands;this.bus=commands?.bus||commands;if(!this.bus?.registerActionSurface)throw Error('SEMANTIC_COMMAND_BUS_REQUIRED');}
  get surfaces(){return this.bus.actionSurfaces;}
  register(id,owner,descriptor){return this.bus.registerActionSurface(id,owner,descriptor);}
  validate(){return this.bus.validateActionSurfaces();}
}
export const ACTION_AVAILABILITY_CONTRACT=Object.freeze({id:'ActionAvailability',version:'1.2.1',compatibility:'SEMVER'});
const BUILTIN_ACTION_POLICIES=Object.freeze({
  connect:{id:'connect',selection:{min:2,max:2,bulkWhen:({selection,domain})=>selection.length>2&&domain?.bulkRelationSemantics?.deterministic===true},activeModes:['author'],domainCapability:'relationAuthoring',domainPredicate:({domain,selection,activeMode,canonicalState})=>domain?.connectionAvailability?.(selection,activeMode,{canonicalState})||{enabled:false,reason:'Relation adapter does not declare endpoint compatibility',code:'ADAPTER_CONTRACT_MISSING'},hideOnSelectionFailure:true},
  delete:{id:'delete',selection:{min:1},activeModes:['author'],destructive:true},
  align:{id:'align',selection:{min:2},activeModes:['author'],mixedTypePolicy:'allow'},
  inspect:{id:'inspect',selection:{min:1},activeModes:['author','recorded','review'],destructive:false}
});
/** Generic availability policy shared by presentation and SemanticCommand preflight. */
export class ActionAvailabilityCore {
  constructor(policies={}){this.policies=new Map(Object.entries(BUILTIN_ACTION_POLICIES).map(([id,policy])=>[id,{...policy,selection:{...(policy.selection||{})}}]));for(const [id,policy] of Object.entries(policies))this.register(id,policy);}
  register(action,policy){if(!action||!policy)throw Error('ACTION_POLICY_REQUIRED');this.policies.set(action,{id:action,...policy,selection:{...(policy.selection||{})}});return this;}
  declaration(action,override=null){return {...(this.policies.get(action)||{id:action,selection:{min:1}}),...(override||{}),selection:{...(this.policies.get(action)?.selection||{min:1}),...(override?.selection||{})}};}
  evaluate(action,{selection=[],entities=[],domain=null,activeMode='author',destructivePolicy='allow',commandRegistered=true,commandEnabled=true,domainCapability=true,canonicalState=null,customContext=null}={},override=null){
    const policy=this.declaration(action,override),ids=[...new Set(selection)],selected=entities.filter(entity=>ids.includes(entity.id)),types=[...new Set(selected.map(entity=>entity.type||entity.kind||'unspecified'))];
    const result=(visible,enabled,reason,code,extra={})=>({action,policyId:policy.id||action,visible,enabled,reason,code,selectionCount:ids.length,selectedTypes:types,...extra});
    const selectionRule=policy.selection||{},bulk=typeof selectionRule.bulkWhen==='function'&&selectionRule.bulkWhen({selection:ids,selected,entities,domain,canonicalState,customContext});
    const min=selectionRule.exact??selectionRule.min??0,max=bulk?Infinity:(selectionRule.exact??selectionRule.max??Infinity),countOk=ids.length>=min&&ids.length<=max;
    if(!countOk){const hidden=policy.hideOnSelectionFailure!==false;const reason=bulk?'Selection is outside declared bulk semantics':selectionRule.exact?`Select exactly ${selectionRule.exact} eligible object(s)`:`Selection cardinality must be between ${min} and ${Number.isFinite(max)?max:'unbounded'}`;return result(!hidden,false,reason,ids.length>max&&!bulk?'BULK_SEMANTICS_UNDECLARED':'SELECTION_COUNT');}
    if(selected.length!==ids.length)return result(true,false,'Selection contains an unknown entity','UNKNOWN_ENDPOINT');
    if(policy.acceptedEntityTypes){const accepted=new Set(policy.acceptedEntityTypes),bad=selected.filter(entity=>!accepted.has(entity.type||entity.kind));if(bad.length)return result(true,false,'Selection contains an unsupported entity type','ENTITY_TYPE_NOT_ACCEPTED');}
    if(policy.mixedTypePolicy==='forbid'&&types.length>1)return result(true,false,'Mixed entity types are not allowed for this action','MIXED_TYPES_FORBIDDEN');
    if(policy.activeModes&&!policy.activeModes.includes(activeMode))return result(false,false,'Active mode does not permit this action','MODE_FORBIDS_ACTION');
    if(policy.destructive&&destructivePolicy==='forbid')return result(true,false,'Destructive actions are forbidden by policy','DESTRUCTIVE_POLICY');
    if(!commandRegistered)return result(true,false,'Semantic command is not registered','COMMAND_UNREGISTERED');
    if(commandEnabled===false)return result(true,false,'Semantic command is unavailable','COMMAND_UNAVAILABLE');
    let capability=domainCapability;
    if(typeof policy.domainCapability==='string')capability=capability!==false&&domain?.capabilities?.[policy.domainCapability]===true;
    else if(typeof policy.domainCapability==='function')capability=policy.domainCapability({domain,selection:ids,selected,canonicalState,customContext});
    if(capability===false)return result(true,false,'Domain capability does not permit this action','DOMAIN_CAPABILITY_DISABLED');
    if(typeof policy.canonicalPredicate==='function'){const a=policy.canonicalPredicate({domain,selection:ids,selected,canonicalState,customContext});if(a!==true)return result(true,false,typeof a==='string'?a:a?.reason||'Canonical state does not permit this action',a?.code||'CANONICAL_STATE');}
    if(typeof policy.domainPredicate==='function'){const a=policy.domainPredicate({domain,selection:ids,selected,activeMode,canonicalState,customContext});if(a===false)return result(true,false,'Domain predicate denied this action','DOMAIN_CONSTRAINT');if(a!==true&&a?.enabled!==undefined)return result(true,!!a.enabled,a.reason||'',a.code||(a.enabled?'AVAILABLE':'DOMAIN_CONSTRAINT'));}
    if(typeof policy.customPredicate==='function'){const a=policy.customPredicate({domain,selection:ids,selected,activeMode,canonicalState,customContext});if(a!==true)return result(true,false,typeof a==='string'?a:a?.reason||'Action predicate denied this action',a?.code||'CUSTOM_CONSTRAINT');}
    return result(true,true,'','AVAILABLE');
  }
  commandGuard(action,contextProvider,override=null){return payload=>{const context=contextProvider(payload),availability=this.evaluate(action,context,override);return availability.enabled||availability.reason;};}
}
/** Backward-compatible facade only; canonical owner identity is ScopedPreferencesOwner. */
export class ScopedPreferences extends ScopedPreferencesOwner {}
export class SpatialModel {
  constructor(nodes,edges=[]){this.nodes=clone(nodes);this.edges=clone(edges);this.camera={x:24,y:36,zoom:1};this.history=[];this.future=[];this.snap=true;this.grid=20;this.activeMode='author';this.selectionKernel=new SpatialSelectionNavigationKernel(this.projectionDescriptor());this.interactionKernel=new SpatialInteractionKernel(this);this.interaction=this.interactionKernel;}
  projectionDescriptor(){return createSpatialProjectionDescriptor(this.nodes,{id:'SpatialModelProjection',owner:'SpatialModelCompatibilityProjection',activeMode:this.activeMode});}
  syncSelectionProjection(){return this.selectionKernel.reconcile(this.projectionDescriptor());}
  setActiveMode(mode='author'){return this.interactionKernel.setActiveMode(mode);}
  geometryMutationAvailability(options={}){return this.interactionKernel.geometryMutationAvailability(options);}
  canMutateGeometry(){return this.interactionKernel.canMutateGeometry();}
  get selection(){return this.selectionKernel.selected}
  set selection(value){this.selectionKernel.replace([...value],{focus:false,anchor:false,source:'compat-selection-setter'});}
  selectionReceipt(action='compatibility'){return this.selectionKernel.receipt(action)}
  snapshot(){return this.interactionKernel.snapshot();}
  checkpoint(){return this.interactionKernel.checkpoint();}
  restore(snapshot){return this.interactionKernel.restore(snapshot);}
  undo(){return this.interactionKernel.undo();}
  redo(){return this.interactionKernel.redo();}
  select(id,add=false){this.syncSelectionProjection();if(!id){if(!add)this.selectionKernel.clear({source:'compat-select-clear'});return this.selectionReceipt('compat-select-clear')}return add?this.selectionKernel.toggle(id,{source:'compat-select-toggle'}):this.selectionKernel.replace([id],{source:'compat-select-single'});}
  world(x,y){return this.interactionKernel.world(x,y);}
  pan(dx,dy){return this.interactionKernel.pan(dx,dy);}
  zoomAt(f,x,y){return this.interactionKernel.zoomAt(f,x,y);}
  fit(w,h){return this.interactionKernel.fit(w,h);}
  move(ids,dx,dy){return this.interactionKernel.move(ids,dx,dy);}
  snapSelection(){return this.interactionKernel.snapSelection();}
  marquee(a,b,add=false){return this.interactionKernel.marquee(a,b,add);}
  align(axis){return this.interactionKernel.align(axis);}
  distribute(axis){return this.interactionKernel.distribute(axis);}
  relation(source,target,type,direction='directed',id=null){if(!['directed','bidirectional'].includes(direction))throw Error('INVALID_DIRECTION');if(source===target||!this.nodes.some(n=>n.id===source)||!this.nodes.some(n=>n.id===target))throw Error('INVALID_ENDPOINTS');if(!['relates','depends','connects'].includes(type))throw Error('INVALID_RELATION_TYPE');let nextId=this.edges.length+1;while(this.edges.some(e=>e.id===`edge-${nextId}`))nextId++;if(id&&!this.edges.some(e=>e.id===id))throw Error('UNKNOWN_EDGE');this.checkpoint();const e={id:id||`edge-${nextId}`,source,target,type,direction,kind:'representation'};if(id){const i=this.edges.findIndex(e=>e.id===id);if(i<0){this.history.pop();throw Error('UNKNOWN_EDGE')}this.edges[i]=e}else this.edges.push(e);return e;}
}
export class SessionPresentation {
  constructor(){this.sessions=[];this.active=null;this.mode='dock';this.minimized=false;this.geometry={x:100,y:150,width:650,height:360};}
  attach(session){if(!this.sessions.some(s=>s.id===session.id))this.sessions.push(session);this.active=session.id;this.minimized=false;return session;}
  present(mode){if(!['dock','float','split'].includes(mode))throw Error('INVALID_PRESENTATION');this.mode=mode;}
  reorder(id,delta){const i=this.sessions.findIndex(s=>s.id===id),j=clamp(i+delta,0,this.sessions.length-1);if(i<0)return;const [s]=this.sessions.splice(i,1);this.sessions.splice(j,0,s);}
  select(id){if(!this.sessions.some(s=>s.id===id))throw Error('UNKNOWN_SESSION');this.active=id;}
  detach(id){this.sessions=this.sessions.filter(s=>s.id!==id);if(this.active===id)this.active=this.sessions[0]?.id||null;}
}
