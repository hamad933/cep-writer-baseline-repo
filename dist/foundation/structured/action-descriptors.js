import {StructuredInsertionTargetOwner,STRUCTURED_INSERTION_TARGET_CONTRACT} from './insertion-targets.js';

const clone=value=>structuredClone(value);

export const STRUCTURED_ACTION_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'StructuredActionDescriptorOwner',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-action-descriptor-w4b-r1'
});

const policyState={subtreeConfirmThreshold:2};
export const STRUCTURED_ACTION_DESCRIPTOR_POLICY=Object.freeze({
  get subtreeConfirmThreshold(){return policyState.subtreeConfirmThreshold;}
});
export function structuredActionDescriptorPolicy(){return Object.freeze({subtreeConfirmThreshold:policyState.subtreeConfirmThreshold});}
export function setStructuredSubtreeConfirmThreshold(value){
  const next=Number(value);
  if(!Number.isInteger(next)||next<2||next>1000)throw Error('INVALID_STRUCTURED_SUBTREE_CONFIRM_THRESHOLD');
  const previous=policyState.subtreeConfirmThreshold;
  policyState.subtreeConfirmThreshold=next;
  return Object.freeze({previous,current:next,revert(){policyState.subtreeConfirmThreshold=previous;return previous;}});
}
export function requiresStructuredSubtreeConfirmation(subtreeCount){return Number(subtreeCount||0)>=policyState.subtreeConfirmThreshold;}

const DEFINITIONS=Object.freeze([
  Object.freeze({actionId:'insert.before',commandId:'block.insert',label:'Insert before',group:'insert',targetPosition:'before'}),
  Object.freeze({actionId:'insert.after',commandId:'block.insert',label:'Insert after',group:'insert',targetPosition:'after'}),
  Object.freeze({actionId:'insert.firstChild',commandId:'block.insert',label:'Insert first child',group:'insert',targetPosition:'first-child'}),
  Object.freeze({actionId:'insert.lastChild',commandId:'block.insert',label:'Insert last child',group:'insert',targetPosition:'last-child'}),
  Object.freeze({actionId:'block.duplicate',commandId:'block.duplicate',label:'Duplicate block',group:'block'}),
  Object.freeze({actionId:'block.moveUp',commandId:'block.moveUp',label:'Move up',group:'block'}),
  Object.freeze({actionId:'block.moveDown',commandId:'block.moveDown',label:'Move down',group:'block'}),
  Object.freeze({actionId:'block.moveStart',commandId:'block.moveStart',label:'Move to start',group:'block'}),
  Object.freeze({actionId:'block.moveEnd',commandId:'block.moveEnd',label:'Move to end',group:'block'}),
  Object.freeze({actionId:'block.indent',commandId:'block.indent',label:'Indent',group:'structure'}),
  Object.freeze({actionId:'block.outdent',commandId:'block.outdent',label:'Outdent',group:'structure'}),
  Object.freeze({actionId:'block.delete',commandId:'block.delete',label:'Delete block',group:'danger',danger:true,destructive:true})
]);
export const STRUCTURED_ACTION_DEFINITIONS=DEFINITIONS;
const DEFINITION_BY_ID=new Map(DEFINITIONS.map(item=>[item.actionId,item]));
const SUPPORTED_SURFACES=new Set(['palette','block-menu','shift-f10','keyboard']);

const stableTruth=descriptor=>JSON.stringify({
  actionId:descriptor.actionId,
  commandId:descriptor.commandId,
  group:descriptor.group,
  danger:descriptor.danger,
  destructive:descriptor.destructive,
  enabled:descriptor.enabled,
  code:descriptor.availability?.code||null,
  target:descriptor.target||null,
  confirmation:descriptor.confirmation||null,
  availabilityOwner:descriptor.availabilityOwner
});

/**
 * Canonical Structured FAMILY action semantics.
 * This owner projects presentation-neutral descriptors and delegates all command
 * availability and execution to the already accepted Structured owners.
 */
export class StructuredActionDescriptorOwner{
  constructor(adapter){
    if(!adapter?.commandAvailabilityOwner||!adapter?.mutationKernel||!adapter?.transactionOwner||typeof adapter.executeSharedCommand!=='function')throw Error('STRUCTURED_ACTION_DESCRIPTOR_ADAPTER_REQUIRED');
    this.owner='StructuredActionDescriptorOwner';
    this.contract=STRUCTURED_ACTION_DESCRIPTOR_CONTRACT;
    this.adapter=adapter;
    this.insertionTargets=new StructuredInsertionTargetOwner(adapter);
  }
  assertDelegation(){
    if(this.adapter.commandAvailabilityOwner?.owner!=='StructuredCommandAvailabilityOwner')throw Error('SECOND_STRUCTURED_COMMAND_AVAILABILITY_OWNER_DETECTED');
    if(this.adapter.mutationKernel?.owner!=='StructuredMutationKernel')throw Error('SECOND_STRUCTURED_MUTATION_OWNER_DETECTED');
    if(this.adapter.transactionOwner?.owner!=='StructuredTransactionHistoryRecoveryOwner')throw Error('SECOND_STRUCTURED_TRANSACTION_HISTORY_RECOVERY_OWNER_DETECTED');
    return true;
  }
  _availability(definition,context,target=null){
    const commandContext={...context,mode:context.mode||'edit'};
    delete commandContext.surface;delete commandContext.route;delete commandContext.confirmed;
    if(target)commandContext.target=clone(target);
    if(definition.commandId==='block.insert'&&!commandContext.type&&!commandContext.block)commandContext.type='paragraph';
    return this.adapter.commandAvailabilityOwner.inspect(definition.commandId,commandContext);
  }
  _confirmation(definition,availability){
    if(definition.commandId!=='block.delete'||!availability.enabled)return null;
    const subtreeCount=Math.max(1,Number(availability.subtreeCount)||1),threshold=policyState.subtreeConfirmThreshold,required=requiresStructuredSubtreeConfirmation(subtreeCount);
    return Object.freeze({
      required,
      kind:required?'STRUCTURED_SUBTREE_DELETE':'NONE',
      subtreeCount,
      threshold,
      reason:required?'Deleting this block removes a governed subtree.':'Single-block deletion is below the subtree confirmation threshold.',
      presentationOwner:'GLOBAL_CONFIRMATION_HOST_NOT_OWNED_BY_W4_B'
    });
  }
  describe(actionId,context={}){
    this.assertDelegation();
    const definition=DEFINITION_BY_ID.get(actionId);if(!definition)return Object.freeze({owner:this.owner,contract:this.contract,actionId,enabled:false,code:'UNKNOWN_ACTION',reason:'Unknown Structured action'});
    let target=null,targetResolution=null;
    if(definition.targetPosition){
      targetResolution=this.insertionTargets.resolve(definition.targetPosition,context);
      if(!targetResolution.ok)return Object.freeze({owner:this.owner,contract:this.contract,...definition,enabled:false,code:targetResolution.code,reason:targetResolution.reason,target:null,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,policy:structuredActionDescriptorPolicy()});
      target=targetResolution.target;
    }
    const availability=this._availability(definition,context,target),confirmation=this._confirmation(definition,availability);
    const descriptor={
      owner:this.owner,
      contract:this.contract,
      policy:structuredActionDescriptorPolicy(),
      insertionContract:definition.targetPosition?STRUCTURED_INSERTION_TARGET_CONTRACT:null,
      actionId:definition.actionId,
      commandId:definition.commandId,
      label:definition.label,
      group:definition.group,
      danger:!!definition.danger,
      destructive:!!definition.destructive,
      enabled:!!availability.enabled,
      code:availability.code,
      reason:availability.reason||'',
      target:target?clone(target):null,
      availability:clone(availability),
      availabilityOwner:availability.owner||this.adapter.commandAvailabilityOwner.owner,
      commandOwner:'StructuredDocumentDomainAdapter',
      mutationOwner:this.adapter.mutationKernel.owner,
      transactionOwner:this.adapter.transactionOwner.owner,
      confirmation
    };
    descriptor.truthKey=stableTruth(descriptor);
    return Object.freeze(descriptor);
  }
  project(surface,context={}){
    if(!SUPPORTED_SURFACES.has(surface))throw Error('UNKNOWN_STRUCTURED_ACTION_SURFACE');
    const descriptors=DEFINITIONS.map(definition=>this.describe(definition.actionId,context));
    return Object.freeze({owner:this.owner,contract:this.contract,surface,route:surface,policy:structuredActionDescriptorPolicy(),descriptors:Object.freeze(descriptors),truthKeys:Object.freeze(descriptors.map(item=>item.truthKey))});
  }
  palette(context={}){return this.project('palette',context);}
  blockMenu(context={}){return this.project('block-menu',context);}
  shiftF10(context={}){return this.project('shift-f10',context);}
  keyboard(context={}){return this.project('keyboard',context);}
  execute(actionId,context={}){
    const descriptor=this.describe(actionId,context);
    if(!descriptor.enabled)return {ok:false,status:'UNAVAILABLE',owner:this.owner,actionId,commandId:descriptor.commandId||null,code:descriptor.code,reason:descriptor.reason,availability:descriptor.availability||null};
    if(descriptor.confirmation?.required&&context.confirmed!==true)return {ok:false,status:'CONFIRMATION_REQUIRED',owner:this.owner,actionId,commandId:descriptor.commandId,confirmation:clone(descriptor.confirmation),mutationDelegated:false};
    if(descriptor.commandId==='block.insert'&&!context.block&&!context.intent)return {ok:false,status:'ACTION_PAYLOAD_REQUIRED',owner:this.owner,actionId,commandId:descriptor.commandId,code:'INSERT_BLOCK_REQUIRED',reason:'Insertion execution requires a canonical Structured block payload.',mutationDelegated:false};
    const payload={...context,route:context.route||`structured-action:${context.surface||'direct'}`};
    delete payload.surface;delete payload.confirmed;
    if(descriptor.target)payload.target=clone(descriptor.target);
    const before=JSON.stringify(this.adapter.snapshot());
    const result=this.adapter.executeSharedCommand(descriptor.commandId,payload);
    return {...result,actionId,descriptorOwner:this.owner,descriptorTruthKey:descriptor.truthKey,delegation:{availabilityOwner:this.adapter.commandAvailabilityOwner.owner,commandOwner:'StructuredDocumentDomainAdapter',mutationOwner:this.adapter.mutationKernel.owner,transactionOwner:this.adapter.transactionOwner.owner},domainMutationByDescriptorOwner:false,beforeSnapshotDigest:before===JSON.stringify(this.adapter.snapshot())&&!result?.changed?'UNCHANGED':'CHANGED_BY_DELEGATE'};
  }
}
