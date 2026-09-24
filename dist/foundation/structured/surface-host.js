import {
  STRUCTURED_SHARED_COMMAND_IDS,
  StructuredDocumentDomainAdapter,
  STRUCTURED_TREE_KERNEL,
  STRUCTURED_MUTATION_KERNEL,
  StructuredCommandAvailabilityOwner
} from '../structured.js';
import {SemanticCommandBus,SEMANTIC_COMMAND_BUS_OWNER} from '../global/commands.js';
import {GlobalInputKeymapOwner,GLOBAL_INPUT_KEYMAP_OWNER} from '../global/input-keymap.js';
import {InputDirectionResolver} from '../global/input-direction.js';
import {StructuredSelectionKernel} from './selection-kernel.js';
import {StructuredRichContentOwner} from './rich-content.js';
import {StructuredBlockRenderer} from './block-renderer.js';
import {StructuredPresentationBridge,structuredInteractionGapKey,STRUCTURED_INTERACTION_PRESENTATION_CONTRACT} from './presentation-bridge.js';

const clone=value=>structuredClone(value);
const CLIPBOARD_COMMANDS=Object.freeze(['document.copy','document.cut','document.paste']);
const STRUCTURED_COMMAND_IDS=Object.freeze([...STRUCTURED_SHARED_COMMAND_IDS,...CLIPBOARD_COMMANDS]);
const CONTENT_PATCH_KEYS=new Set(['html','title','titleHtml','codeText','open','annotations']);
const FORMAT_PATCH_KEYS=new Set(['align','dir','bg','background']);
const CODE_ANNOTATION_KINDS=new Set(['color','highlight','bold','italic','underline','strike']);
const HTML_CONTENT_BLOCK_TYPES=new Set(['paragraph','h2','h3','bullet','number','callout','quote','reference']);

export const STRUCTURED_SURFACE_HOST_CONTRACT=Object.freeze({
  id:'StructuredSurfaceHost',
  version:'1.2.0',
  compatibility:'SEMVER',
  owner:'Structured Family Presentation/Orchestration',
  policyRevision:'structured-surface-host-od054-gap-routing-r3',
  canonicalTruthOwnership:false
});

const isPlainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const exactPrototype=(value,prototype)=>!!value&&Object.getPrototypeOf(value)===prototype;

const assertCanonicalCommandBus=commands=>{
  if(!exactPrototype(commands,SemanticCommandBus.prototype)||!(commands.commands instanceof Map)||typeof commands.execute!=='function'||typeof commands.availability!=='function')throw Error('CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED');
  return true;
};

const assertCanonicalGlobalInputOwner=(owner,commands)=>{
  if(!exactPrototype(owner,GlobalInputKeymapOwner.prototype)||owner.owner!==GLOBAL_INPUT_KEYMAP_OWNER)throw Error('CANONICAL_GLOBAL_INPUT_KEYMAP_OWNER_REQUIRED');
  if(owner.commands!==commands)throw Error('GLOBAL_INPUT_KEYMAP_COMMAND_BUS_MISMATCH');
  return true;
};

const assertCanonicalAdapterGraph=(adapter,{requireInput=false,commands=null,globalInputKeymapOwner=null}={})=>{
  if(!exactPrototype(adapter,StructuredDocumentDomainAdapter.prototype))throw Error('CANONICAL_STRUCTURED_DOMAIN_ADAPTER_REQUIRED');
  const criticalMethods=['assertCanonicalMutationOwner','assertCanonicalTransactionOwner','assertCanonicalClipboardOwner','assertCanonicalActionDescriptorOwner','assertCanonicalDragDropOwner','assertCanonicalInputKeymapOwner','attachInputKeymap','bindSharedCommands','bindSemanticCommands','updateBlock','_allocateCommandBlockId'];
  for(const method of criticalMethods)if(adapter[method]!==StructuredDocumentDomainAdapter.prototype[method])throw Error(`STRUCTURED_DOMAIN_ADAPTER_CANONICAL_METHOD_DRIFT:${method}`);
  adapter.assertCanonicalMutationOwner();
  adapter.assertCanonicalTransactionOwner();
  adapter.assertCanonicalClipboardOwner();
  adapter.assertCanonicalActionDescriptorOwner();
  adapter.assertCanonicalDragDropOwner();
  if(adapter.treeKernel!==STRUCTURED_TREE_KERNEL)throw Error('SECOND_STRUCTURED_TREE_KERNEL_DETECTED');
  if(adapter.mutationKernel!==STRUCTURED_MUTATION_KERNEL)throw Error('SECOND_STRUCTURED_MUTATION_OWNER_DETECTED');
  if(!(adapter.commandAvailabilityOwner instanceof StructuredCommandAvailabilityOwner)||adapter.commandAvailabilityOwner.adapter!==adapter)throw Error('SECOND_STRUCTURED_COMMAND_AVAILABILITY_OWNER_DETECTED');
  if(!(adapter.selection instanceof StructuredSelectionKernel)||adapter.selection.treeKernel!==adapter.treeKernel)throw Error('SECOND_STRUCTURED_SELECTION_OWNER_DETECTED');
  if(!(adapter.inputDirectionResolver instanceof InputDirectionResolver))throw Error('SECOND_INPUT_DIRECTION_RESOLVER_DETECTED');
  if(!(adapter.richContentOwner instanceof StructuredRichContentOwner)||adapter.richContentOwner.clipboardOwner!==adapter.clipboardOwner||adapter.richContentOwner.directionResolver!==adapter.inputDirectionResolver||adapter.richContentOwner.directionAdapter?.resolver!==adapter.inputDirectionResolver)throw Error('SECOND_STRUCTURED_RICH_CONTENT_OWNER_DETECTED');
  if(adapter.dropTargetOwner?.treeKernel!==adapter.treeKernel||adapter.dropTargetOwner?.mutationKernel!==adapter.mutationKernel||adapter.dropTargetOwner?.commandAvailabilityOwner!==adapter.commandAvailabilityOwner)throw Error('SECOND_STRUCTURED_DROP_TARGET_OWNER_DETECTED');
  if(adapter.inputKeymapOwner){
    adapter.assertCanonicalInputKeymapOwner();
    if(commands&&adapter.inputKeymapOwner.commands!==commands)throw Error('SECOND_STRUCTURED_INPUT_KEYMAP_OWNER_DETECTED');
    if(globalInputKeymapOwner&&adapter.inputKeymapOwner.globalInputKeymapOwner!==globalInputKeymapOwner)throw Error('SECOND_STRUCTURED_INPUT_KEYMAP_OWNER_DETECTED');
  }else if(requireInput)throw Error('SECOND_STRUCTURED_INPUT_KEYMAP_OWNER_DETECTED');
  return true;
};

const commandOwnerFor=id=>CLIPBOARD_COMMANDS.includes(id)?'StructuredClipboardTrustOwner':'StructuredDocumentDomainAdapter';
const inspectCommandBindingPlan=(adapter,commands)=>{
  const map=commands.commands;
  const present=STRUCTURED_COMMAND_IDS.filter(id=>map.has(id));
  if(present.length===0)return Object.freeze({status:'BIND_REQUIRED',count:STRUCTURED_COMMAND_IDS.length});
  if(present.length!==STRUCTURED_COMMAND_IDS.length)throw Error('PARTIAL_STRUCTURED_CANONICAL_COMMAND_BINDING');
  for(const id of STRUCTURED_COMMAND_IDS){
    const binding=map.get(id),expectedOwner=commandOwnerFor(id);
    if(!binding||binding.id!==id||binding.owner!==expectedOwner||typeof binding.run!=='function'||typeof binding.available!=='function')throw Error(`STRUCTURED_CANONICAL_COMMAND_BINDING_MISMATCH:${id}`);
  }
  return Object.freeze({status:'REUSE_CANDIDATE',count:STRUCTURED_COMMAND_IDS.length});
};

const captureCommandBindings=(commands)=>new Map(STRUCTURED_COMMAND_IDS.map(id=>{
  const binding=commands.commands.get(id);
  if(!binding)throw Error(`STRUCTURED_CANONICAL_COMMAND_BINDING_MISSING:${id}`);
  return [id,Object.freeze({binding,id:binding.id,owner:binding.owner,label:binding.label,run:binding.run,available:binding.available})];
}));

const restoreMap=(target,snapshot)=>{target.clear();for(const [key,value] of snapshot)target.set(key,value);};

const assertCodeAnnotations=(annotations,codeText)=>{
  if(!Array.isArray(annotations))throw Error('STRUCTURED_CODE_ANNOTATIONS_ARRAY_REQUIRED');
  const length=String(codeText??'').length;
  for(const annotation of annotations){
    if(!isPlainObject(annotation))throw Error('STRUCTURED_CODE_ANNOTATION_INVALID');
    const keys=Object.keys(annotation);if(keys.some(key=>!['kind','start','end','value'].includes(key)))throw Error('STRUCTURED_CODE_ANNOTATION_SCHEMA_WIDENING_FORBIDDEN');
    if(!CODE_ANNOTATION_KINDS.has(annotation.kind))throw Error('STRUCTURED_CODE_ANNOTATION_KIND_INVALID');
    if(!Number.isInteger(annotation.start)||!Number.isInteger(annotation.end)||annotation.start<0||annotation.end<=annotation.start||annotation.end>length)throw Error('STRUCTURED_CODE_ANNOTATION_RANGE_INVALID');
    if('value' in annotation&&annotation.value!=null&&typeof annotation.value!=='string')throw Error('STRUCTURED_CODE_ANNOTATION_VALUE_INVALID');
  }
  return true;
};

/**
 * Final Structured family surface convergence host.
 * Owns orchestration and presentation only; all semantic routes delegate to accepted owners.
 */
export class StructuredSurfaceHost{
  constructor({adapter,commands,globalInputKeymapOwner,mode='edit',renderer=null,presentationBridge=null,clipboardStore={value:null},clipboardTransport=null,allocateBlockId=null}={}){
    if(!['read','edit'].includes(mode))throw Error('INVALID_STRUCTURED_SURFACE_MODE');
    assertCanonicalCommandBus(commands);
    assertCanonicalGlobalInputOwner(globalInputKeymapOwner,commands);
    assertCanonicalAdapterGraph(adapter,{commands,globalInputKeymapOwner});
    if(!isPlainObject(clipboardStore)||!('value' in clipboardStore))throw Error('STRUCTURED_CLIPBOARD_STORE_REQUIRED');

    const resolvedRenderer=renderer??new StructuredBlockRenderer({treeKernel:adapter.treeKernel,richContentOwner:adapter.richContentOwner});
    if(!(resolvedRenderer instanceof StructuredBlockRenderer)||resolvedRenderer.treeKernel!==adapter.treeKernel||resolvedRenderer.richContentOwner!==adapter.richContentOwner)throw Error('STRUCTURED_RENDERER_CANONICAL_OWNER_MISMATCH');
    const resolvedBridge=presentationBridge??new StructuredPresentationBridge({renderer:resolvedRenderer});
    if(!(resolvedBridge instanceof StructuredPresentationBridge)||resolvedBridge.renderer!==resolvedRenderer)throw Error('STRUCTURED_PRESENTATION_BRIDGE_CANONICAL_OWNER_MISMATCH');
    const commandPlan=inspectCommandBindingPlan(adapter,commands);

    this.owner='StructuredSurfaceHost';this.contract=STRUCTURED_SURFACE_HOST_CONTRACT;this.adapter=adapter;this.commands=commands;this.globalInputKeymapOwner=globalInputKeymapOwner;this.clipboardStore=clipboardStore;this.clipboardTransport=clipboardTransport;this.mode='edit';this.sequence=0;this.receipts=[];this.renderer=resolvedRenderer;this.presentationBridge=resolvedBridge;this._boundRoots=new WeakMap();this._domDrag=new WeakMap();

    const beforeInputOwner=adapter.inputKeymapOwner,beforeCommandMap=new Map(commands.commands);
    try{
      this.inputKeymapOwner=adapter.attachInputKeymap({commands:this.commands,globalInputKeymapOwner:this.globalInputKeymapOwner,allocateBlockId});
      adapter.assertCanonicalInputKeymapOwner();
      if(this.inputKeymapOwner!==adapter.inputKeymapOwner||this.inputKeymapOwner.commands!==this.commands||this.inputKeymapOwner.globalInputKeymapOwner!==this.globalInputKeymapOwner)throw Error('STRUCTURED_INPUT_KEYMAP_OWNER_GRAPH_MISMATCH');
      this.commandBinding=this._bindCanonicalCommands(commandPlan);
      this._commandRegistry=this.commands.commands;
      this._canonicalCommandBindings=captureCommandBindings(this.commands);
      this._canonicalOwners=Object.freeze({
        treeKernel:adapter.treeKernel,mutationKernel:adapter.mutationKernel,transactionOwner:adapter.transactionOwner,commandAvailabilityOwner:adapter.commandAvailabilityOwner,
        selection:adapter.selection,clipboardOwner:adapter.clipboardOwner,actionDescriptorOwner:adapter.actionDescriptorOwner,inputDirectionResolver:adapter.inputDirectionResolver,
        richContentOwner:adapter.richContentOwner,dropTargetOwner:adapter.dropTargetOwner,dragDropOwner:adapter.dragDropOwner,inputKeymapOwner:this.inputKeymapOwner,
        renderer:this.renderer,presentationBridge:this.presentationBridge,commands:this.commands,globalInputKeymapOwner:this.globalInputKeymapOwner
      });
      this.assertCanonicalOwners();
    }catch(error){
      adapter.inputKeymapOwner=beforeInputOwner;
      restoreMap(commands.commands,beforeCommandMap);
      throw error;
    }
    this.setMode(mode);
  }
  _receipt(kind,detail={}){const receipt={sequence:++this.sequence,kind,owner:this.owner,policyRevision:this.contract.policyRevision,...clone(detail)};this.receipts.push(receipt);return receipt;}
  _assertCanonicalCommandBindings(){
    if(this.commands!==this._canonicalOwners.commands||this.commands.commands!==this._commandRegistry)throw Error('STRUCTURED_COMMAND_REGISTRY_DRIFT_DETECTED');
    for(const [id,expected] of this._canonicalCommandBindings){
      const binding=this.commands.commands.get(id);
      if(binding!==expected.binding||binding?.id!==expected.id||binding?.owner!==expected.owner||binding?.label!==expected.label||binding?.run!==expected.run||binding?.available!==expected.available)throw Error(`STRUCTURED_CANONICAL_COMMAND_BINDING_DRIFT:${id}`);
    }
    return true;
  }
  assertCanonicalOwners(){
    assertCanonicalCommandBus(this.commands);assertCanonicalGlobalInputOwner(this.globalInputKeymapOwner,this.commands);assertCanonicalAdapterGraph(this.adapter,{requireInput:true,commands:this.commands,globalInputKeymapOwner:this.globalInputKeymapOwner});
    const c=this._canonicalOwners;if(!c)throw Error('STRUCTURED_SURFACE_CANONICAL_GRAPH_UNINITIALIZED');
    for(const key of ['treeKernel','mutationKernel','transactionOwner','commandAvailabilityOwner','selection','clipboardOwner','actionDescriptorOwner','inputDirectionResolver','richContentOwner','dropTargetOwner','dragDropOwner','inputKeymapOwner'])if(this.adapter[key]!==c[key])throw Error(`STRUCTURED_CANONICAL_OWNER_DRIFT:${key}`);
    if(this.inputKeymapOwner!==c.inputKeymapOwner||this.renderer!==c.renderer||this.presentationBridge!==c.presentationBridge||this.renderer.treeKernel!==c.treeKernel||this.renderer.richContentOwner!==c.richContentOwner||this.presentationBridge.renderer!==this.renderer)throw Error('STRUCTURED_SURFACE_PRESENTATION_GRAPH_DRIFT');
    this._assertCanonicalCommandBindings();
    return true;
  }
  _bindCanonicalCommands(plan){
    if(plan.status==='BIND_REQUIRED'){
      this.adapter.bindSharedCommands(this.commands);
      this.adapter.bindSemanticCommands(this.commands,{clipboardStore:this.clipboardStore,transport:this.clipboardTransport});
      return Object.freeze({status:'BOUND_BY_ACCEPTED_ADAPTER',count:STRUCTURED_COMMAND_IDS.length});
    }
    inspectCommandBindingPlan(this.adapter,this.commands);
    return Object.freeze({status:'REUSED_EXISTING_CANONICAL_BINDINGS',count:STRUCTURED_COMMAND_IDS.length});
  }
  descriptor(){this.assertCanonicalOwners();return Object.freeze({owner:this.owner,contract:this.contract,domainOwner:this.adapter.owner,domainKind:this.adapter.domainKind,mode:this.mode,canonicalTruthOwnership:false,commands:SEMANTIC_COMMAND_BUS_OWNER,globalInputOwner:this.globalInputKeymapOwner.owner,treeOwner:this.adapter.treeKernel.owner,mutationOwner:this.adapter.mutationKernel.owner,transactionOwner:this.adapter.transactionOwner.owner,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,selectionOwner:this.adapter.selection.owner,clipboardOwner:this.adapter.clipboardOwner.owner,inputKeymapOwner:this.inputKeymapOwner.owner,actionOwner:this.adapter.actionDescriptorOwner.owner,insertionOwner:this.adapter.actionDescriptorOwner.insertionTargets.owner,directionOwner:this.adapter.inputDirectionResolver.owner,richContentOwner:this.adapter.richContentOwner.owner,dragDropOwner:this.adapter.dragDropOwner.owner,rendererOwner:this.renderer.owner,presentationBridgeOwner:this.presentationBridge.owner,interactionPresentation:STRUCTURED_INTERACTION_PRESENTATION_CONTRACT.id,commandBinding:this.commandBinding});}
  setMode(mode){this.assertCanonicalOwners();if(!['read','edit'].includes(mode))throw Error('INVALID_STRUCTURED_SURFACE_MODE');const cancelledPointerDrag=mode==='read'&&!!this.adapter.dragDropOwner.pointer;if(cancelledPointerDrag)this.adapter.dragDropOwner.cancelPointer('structured-surface-read-mode');this.mode=mode;return this._receipt('mode.project',{mode,canonicalDocumentMutation:false,cancelledPointerDrag});}
  _gapPosition(nodes,parentId,index){
    const list=Array.isArray(nodes)?nodes:[];
    if(list.length===0)return parentId?{position:'first-child',blockId:parentId,actionId:'insert.firstChild'}:{position:'document-start',blockId:null,actionId:null};
    if(index<list.length)return {position:'before',blockId:list[index].canonicalBlockId,actionId:'insert.before'};
    return {position:'after',blockId:list[list.length-1].canonicalBlockId,actionId:'insert.after'};
  }
  _interactionProjection(render){
    const blocks={},gaps={},insertionOwner=this.adapter.actionDescriptorOwner.insertionTargets;
    const walk=(nodes,parentId=null,depth=0)=>{
      const list=Array.isArray(nodes)?nodes:[];
      for(let index=0;index<=list.length;index++){
        const expectedKey=structuredInteractionGapKey({parentId,index,depth}),route=this._gapPosition(list,parentId,index),resolved=this.adapter.insertionTarget(route.position,{blockId:route.blockId,mode:this.mode,type:'paragraph'});
        const target=resolved.ok?resolved.target:null;
        if(target&&structuredInteractionGapKey(target)!==expectedKey)throw Error(`STRUCTURED_INSERTION_PRESENTATION_TARGET_DRIFT:${expectedKey}:${structuredInteractionGapKey(target)}`);
        gaps[expectedKey]=Object.freeze({key:expectedKey,enabled:this.mode==='edit'&&!!resolved.ok&&resolved.enabled===true,code:resolved.code||resolved.availability?.code||'UNAVAILABLE',reason:resolved.reason||resolved.availability?.reason||'',target:target?clone(target):null,position:route.position,anchorBlockId:route.blockId,actionId:route.actionId,insertionOwner:insertionOwner.owner,actionOwner:this.adapter.actionDescriptorOwner.owner,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,mutationOwner:this.adapter.mutationKernel.owner,transactionOwner:this.adapter.transactionOwner.owner});
      }
      for(const node of list){
        const actions=this.adapter.actionDescriptors('block-menu',{mode:this.mode,blockId:node.canonicalBlockId,route:'structured-surface-host:interaction-projection'}),enabled=this.mode==='edit'&&actions.descriptors.some(item=>item.enabled);
        blocks[node.canonicalBlockId]=Object.freeze({blockId:node.canonicalBlockId,handleEnabled:enabled,dragEnabled:enabled&&!this.adapter.readOnly,selectionOwner:this.adapter.selection.owner,actionOwner:this.adapter.actionDescriptorOwner.owner,dragDropOwner:this.adapter.dragDropOwner.owner,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,actionTruthKeys:Object.freeze(actions.truthKeys.slice())});
        if(node.childrenVisible!==false&&(node.children?.length||node.isToggle))walk(node.children||[],node.canonicalBlockId,node.depth+1);
      }
    };
    walk(render.blocks,null,0);
    return Object.freeze({owner:this.owner,presentationOwner:this.presentationBridge.owner,interactionPresentation:STRUCTURED_INTERACTION_PRESENTATION_CONTRACT.id,canonicalTruthOwnership:false,blocks:Object.freeze(blocks),gaps:Object.freeze(gaps),selectionOwner:this.adapter.selection.owner,actionOwner:this.adapter.actionDescriptorOwner.owner,insertionOwner:insertionOwner.owner,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,mutationOwner:this.adapter.mutationKernel.owner,transactionOwner:this.adapter.transactionOwner.owner,dragDropOwner:this.adapter.dragDropOwner.owner});
  }
  project(){
    this.assertCanonicalOwners();
    const before=JSON.stringify(this.adapter.snapshot()),document=this.adapter.snapshot(),selection=this.adapter.selectedFragmentIdentity(),render=this.renderer.project(document,{mode:this.mode,selection,surface:this.adapter.domainKind}),interaction=this._interactionProjection(render),html=this.presentationBridge.toHTML(render,{interaction}),after=JSON.stringify(this.adapter.snapshot());
    if(before!==after)throw Error('STRUCTURED_PRESENTATION_MUTATED_CANONICAL_DOCUMENT');
    return Object.freeze({owner:this.owner,contract:this.contract,canonicalTruthOwnership:false,mode:this.mode,documentId:document.id,identity:clone(this.adapter.identity()),transaction:clone(this.adapter.transactionDescriptor()),selection,render,interaction,html,delegates:this.descriptor()});
  }
  renderInto(root){
    this.assertCanonicalOwners();const projection=this.project(),result=this.presentationBridge.renderInto(root,projection.render,{interaction:projection.interaction});
    this._bindInteractionDOM(root);this._syncSelectionPresentation(root);
    return {...result,hostOwner:this.owner,projection};
  }
  routePointerSelection(blockId,{additive=false,toggle=false,rangeAnchor=null}={}){this.assertCanonicalOwners();let result;if(toggle)result=this.adapter.toggleSelectedBlock(blockId);else if(rangeAnchor)result=this.adapter.selectBlockRange(rangeAnchor,blockId,{mode:additive?'add':'replace'});else result=this.adapter.selectBlocks([blockId],{mode:additive?'add':'replace',anchor:blockId,focus:blockId});return {...result,routeOwner:this.owner,delegatedOwner:this.adapter.selection.owner,receipt:this._receipt('pointer.selection',{blockId,delegatedOwner:this.adapter.selection.owner})};}
  routeHandleAction(blockId,{surface='block-menu',route='handle',select=true}={}){
    this.assertCanonicalOwners();if(this.mode!=='edit')return {ok:false,code:'EDIT_MODE_REQUIRED',reason:'Structured block handles are edit-mode interaction presentation',owner:this.owner,hostOwner:this.owner,delegatedOwner:this.adapter.actionDescriptorOwner.owner,selectionOwner:this.adapter.selection.owner};
    const before=JSON.stringify(this.adapter.snapshot()),selection=select?this.routePointerSelection(blockId):this.adapter.selectedFragmentIdentity(),actions=this.adapter.actionDescriptors(surface,{mode:this.mode,blockId,route:`structured-surface-host:${route}`}),after=JSON.stringify(this.adapter.snapshot());
    if(before!==after)throw Error('STRUCTURED_HANDLE_ACTION_MUTATED_CANONICAL_DOCUMENT');
    return {ok:true,code:'ACTION_SURFACE_REQUEST',owner:this.owner,hostOwner:this.owner,blockId,surface,selection,actions,delegatedOwner:this.adapter.actionDescriptorOwner.owner,selectionOwner:this.adapter.selection.owner,mutationDelegated:false,receipt:this._receipt('handle.action.request',{blockId,surface,actionOwner:this.adapter.actionDescriptorOwner.owner,selectionOwner:this.adapter.selection.owner})};
  }
  _currentInteractionProjection(){const document=this.adapter.snapshot(),selection=this.adapter.selectedFragmentIdentity(),render=this.renderer.project(document,{mode:this.mode,selection,surface:this.adapter.domainKind});return this._interactionProjection(render);}
  _canonicalGapState(targetOrKey){
    const key=typeof targetOrKey==='string'?targetOrKey:structuredInteractionGapKey(targetOrKey||{}),state=this._currentInteractionProjection().gaps[key];
    if(!state?.target)return {ok:false,code:'UNKNOWN_STRUCTURED_GAP',key,state:null};
    if(targetOrKey&&typeof targetOrKey==='object')for(const field of ['parentId','index','depth','beforeBlockId','afterBlockId']){const expected=state.target[field]??null,actual=targetOrKey[field]??null;if(expected!==actual)return {ok:false,code:'FORGED_STRUCTURED_GAP_METADATA',key,field,expected,actual,state:null};}
    return {ok:true,key,state};
  }
  routeInsertionGap(target,{block=null,intent=null,type=null}={}){
    this.assertCanonicalOwners();const canonical=this._canonicalGapState(target);if(!canonical.ok)return {ok:false,status:'UNAVAILABLE',owner:this.owner,hostOwner:this.owner,code:canonical.code,reason:'Structured insertion gap metadata is not canonical',insertionOwner:this.adapter.actionDescriptorOwner.insertionTargets.owner};
    const state=canonical.state;if(this.mode!=='edit'||!state.enabled)return {ok:false,status:'UNAVAILABLE',owner:this.owner,hostOwner:this.owner,code:this.mode!=='edit'?'EDIT_MODE_REQUIRED':state.code,reason:this.mode!=='edit'?'Structured insertion requires edit mode':state.reason,target:clone(state.target),insertionOwner:state.insertionOwner,actionOwner:state.actionOwner,availabilityOwner:state.availabilityOwner};
    if(!block&&!intent)return {ok:true,status:'INSERTION_REQUEST',code:'INSERTION_PAYLOAD_REQUIRED',owner:this.owner,hostOwner:this.owner,target:clone(state.target),position:state.position,anchorBlockId:state.anchorBlockId,actionId:state.actionId,insertionOwner:state.insertionOwner,actionOwner:state.actionOwner,availabilityOwner:state.availabilityOwner,mutationOwner:state.mutationOwner,transactionOwner:state.transactionOwner,mutationDelegated:false,receipt:this._receipt('insertion.request',{gapKey:canonical.key,position:state.position,actionId:state.actionId,insertionOwner:state.insertionOwner})};
    let result;
    if(state.actionId&&state.anchorBlockId)result=this.routeAction(state.actionId,{blockId:state.anchorBlockId,block,intent,type:type||block?.type||'paragraph',surface:'block-menu',route:'structured-surface-host:insertion-gap'});
    else result=this.routeCommand('block.insert',{target:clone(state.target),block,intent,type:type||block?.type||'paragraph',route:'structured-surface-host:insertion-gap'});
    return {...result,hostOwner:this.owner,target:clone(state.target),insertionOwner:state.insertionOwner,actionOwner:state.actionOwner,availabilityOwner:state.availabilityOwner,mutationOwner:state.mutationOwner,transactionOwner:state.transactionOwner,receipt:this._receipt('insertion.execute',{gapKey:canonical.key,actionId:state.actionId,changed:!!result?.changed,delegatedOwner:result?.delegatedOwner||result?.descriptorOwner||result?.commandOwner||null})};
  }
  _gapTargetFromElement(element){
    const gap=element?.closest?.('[data-structured-gap-key]');if(!gap)return null;
    const key=gap.getAttribute('data-structured-gap-key'),canonical=this._canonicalGapState(key);if(!canonical.ok)return null;
    const target=clone(canonical.state.target),attr=(name)=>gap.getAttribute(name)||'';
    const expected={parentId:target.parentId||'',index:String(target.index),depth:String(target.depth),afterBlockId:target.afterBlockId||'',beforeBlockId:target.beforeBlockId||''},actual={parentId:attr('data-structured-parent-id'),index:attr('data-structured-index'),depth:attr('data-structured-depth'),afterBlockId:attr('data-structured-after-block-id'),beforeBlockId:attr('data-structured-before-block-id')};
    if(JSON.stringify(expected)!==JSON.stringify(actual))return null;
    return target;
  }
  _syncSelectionPresentation(root){
    if(!root?.querySelectorAll)return;const selection=this.adapter.selectedFragmentIdentity(),selected=new Set([...(selection?.blockIds||[]),...(selection?.coveredBlockIds||[])]);
    for(const row of root.querySelectorAll('[data-structured-block-id]')){const active=selected.has(row.getAttribute('data-structured-block-id'));row.setAttribute('data-selected',String(active));row.classList?.toggle?.('is-selected',active);}
  }
  _dispatchInteractionRequest(root,name,detail,invoker){
    const EventCtor=root?.ownerDocument?.defaultView?.CustomEvent||globalThis.CustomEvent;if(typeof EventCtor!=='function'||typeof root?.dispatchEvent!=='function')return false;
    const returnFocus=()=>{if(invoker?.isConnected!==false&&typeof invoker?.focus==='function')invoker.focus({preventScroll:true});};
    return root.dispatchEvent(new EventCtor(name,{bubbles:true,cancelable:true,detail:{...detail,returnFocus,invoker}}));
  }
  _activateHandle(root,handle,{surface='block-menu',route='handle'}={}){
    if(!handle||handle.disabled||this.mode!=='edit')return null;const blockId=handle.getAttribute('data-block-handle')||this.presentationBridge.blockIdFromTarget(handle);if(!blockId)return null;
    const request=this.routeHandleAction(blockId,{surface,route});this._syncSelectionPresentation(root);this._dispatchInteractionRequest(root,'structured-action-surface-request',{request,blockId,surface,actionOwner:this.adapter.actionDescriptorOwner.owner},handle);return request;
  }
  routeInsertionGapDirectParagraph(target){
    this.assertCanonicalOwners();const canonical=this._canonicalGapState(target);
    if(!canonical.ok)return {ok:false,status:'UNAVAILABLE',owner:this.owner,hostOwner:this.owner,code:canonical.code,reason:'Structured insertion gap metadata is not canonical',insertionOwner:this.adapter.actionDescriptorOwner.insertionTargets.owner,interaction:'SECONDARY_DIRECT_PARAGRAPH'};
    const state=canonical.state;if(this.mode!=='edit'||!state.enabled)return {ok:false,status:'UNAVAILABLE',owner:this.owner,hostOwner:this.owner,code:this.mode!=='edit'?'EDIT_MODE_REQUIRED':state.code,reason:this.mode!=='edit'?'Structured direct insertion requires edit mode':state.reason,target:clone(state.target),insertionOwner:state.insertionOwner,actionOwner:state.actionOwner,availabilityOwner:state.availabilityOwner,interaction:'SECONDARY_DIRECT_PARAGRAPH'};
    const block={id:this.adapter._allocateCommandBlockId('paragraph-gap'),type:'paragraph',html:'',align:'start',dir:'auto',bg:'none',indent:0};
    const result=this.routeInsertionGap(state.target,{block,type:'paragraph'});
    return {...result,interaction:'SECONDARY_DIRECT_PARAGRAPH',insertedBlockId:result?.changed?block.id:null,insertedBlockType:result?.changed?'paragraph':null,chooserRequested:false};
  }
  _activateGap(root,trigger,{activation='chooser'}={}){
    if(!trigger||trigger.disabled||this.mode!=='edit')return null;const target=this._gapTargetFromElement(trigger);if(!target)return null;
    if(activation==='secondary-direct-paragraph'){
      const result=this.routeInsertionGapDirectParagraph(target);if(result?.changed)this.renderInto(root);return result;
    }
    const request=this.routeInsertionGap(target);this._dispatchInteractionRequest(root,'structured-insertion-request',{request,target:clone(target),insertionOwner:this.adapter.actionDescriptorOwner.insertionTargets.owner,actionOwner:this.adapter.actionDescriptorOwner.owner},trigger);return request;
  }
  _gapElementAtPointer(root,event){
    const direct=event?.target?.closest?.('[data-structured-gap-key]');if(direct)return direct;const doc=root?.ownerDocument,hit=doc?.elementFromPoint?.(Number(event?.clientX)||0,Number(event?.clientY)||0);return hit?.closest?.('[data-structured-gap-key]')||null;
  }
  _bindInteractionDOM(root){
    if(!root?.addEventListener||this._boundRoots.has(root))return false;
    const state={suppressNextHandleClick:false};this._boundRoots.set(root,state);
    root.addEventListener('click',event=>{
      const gapTrigger=event.target?.closest?.('[data-structured-insertion-trigger="true"]');if(gapTrigger){event.preventDefault();this._activateGap(root,gapTrigger);return;}
      const handle=event.target?.closest?.('[data-structured-block-handle="true"]');if(handle){event.preventDefault();if(state.suppressNextHandleClick){state.suppressNextHandleClick=false;return;}this._activateHandle(root,handle,{surface:'block-menu',route:'handle-click'});return;}
      const row=event.target?.closest?.('[data-structured-block-id]');if(row&&this.mode==='edit'&&!event.target?.closest?.('button')){const blockId=row.getAttribute('data-structured-block-id');if(blockId){this.routePointerSelection(blockId,{additive:!!(event.ctrlKey||event.metaKey),rangeAnchor:event.shiftKey?this.adapter.selectedFragmentIdentity()?.anchorBlockId||null:null});this._syncSelectionPresentation(root);}}
    });
    root.addEventListener('keydown',event=>{
      const handle=event.target?.closest?.('[data-structured-block-handle="true"]');if(handle&&((event.key==='Enter'||event.key===' ')||(event.key==='F10'&&event.shiftKey)||event.key==='ContextMenu')){event.preventDefault();this._activateHandle(root,handle,{surface:(event.key==='F10'||event.key==='ContextMenu')?'shift-f10':'block-menu',route:'handle-keyboard'});return;}
      const gap=event.target?.closest?.('[data-structured-insertion-trigger="true"]');if(gap&&(event.key==='Enter'||event.key===' ')){event.preventDefault();this._activateGap(root,gap);}
    });
    root.addEventListener('contextmenu',event=>{
      const gapTrigger=event.target?.closest?.('[data-structured-insertion-trigger="true"]');if(gapTrigger&&this.mode==='edit'&&!gapTrigger.disabled){event.preventDefault();event.stopPropagation?.();this._activateGap(root,gapTrigger,{activation:'secondary-direct-paragraph'});return;}
      const handle=event.target?.closest?.('[data-structured-block-handle="true"]');if(handle&&this.mode==='edit'){event.preventDefault();this._activateHandle(root,handle,{surface:'shift-f10',route:'handle-contextmenu'});}
    });
    root.addEventListener('pointerdown',event=>{
      const handle=event.target?.closest?.('[data-structured-block-handle="true"]');if(!handle||event.button!==0||this.mode!=='edit'||handle.getAttribute('data-structured-drag-enabled')!=='true')return;
      const sourceBlockId=handle.getAttribute('data-block-handle');if(!sourceBlockId)return;this.routePointerSelection(sourceBlockId);this._syncSelectionPresentation(root);const begin=this.beginPointerDrag({sourceBlockId,pointerId:event.pointerId??null,startX:event.clientX,startY:event.clientY});if(!begin.ok)return;
      this._domDrag.set(root,{sourceBlockId,pointerId:event.pointerId??null,handle,active:false,target:null});handle.setPointerCapture?.(event.pointerId);
    });
    root.addEventListener('pointermove',event=>{
      const drag=this._domDrag.get(root);if(!drag)return;const gap=this._gapElementAtPointer(root,event),target=gap?this._gapTargetFromElement(gap):null,rect=root.getBoundingClientRect?.(),update=this.updatePointerDrag({clientX:event.clientX,clientY:event.clientY,target,viewportTop:rect?.top??0,viewportBottom:rect?.bottom??0});drag.active=!!update.active;drag.target=target;if(drag.active){event.preventDefault();const row=drag.handle?.closest?.('[data-structured-block-id]');row?.setAttribute?.('data-dragging','true');}}
    );
    root.addEventListener('pointerup',event=>{
      const drag=this._domDrag.get(root);if(!drag)return;this._domDrag.delete(root);const row=drag.handle?.closest?.('[data-structured-block-id]');row?.removeAttribute?.('data-dragging');drag.handle?.releasePointerCapture?.(event.pointerId);
      if(!drag.active){this.cancelPointerDrag('structured-handle-click');return;}
      event.preventDefault();state.suppressNextHandleClick=true;const result=drag.target?this.commitPointerDrag({target:drag.target,transactionLabel:'Structured handle pointer reorder'}):this.cancelPointerDrag('structured-handle-drag-no-target');if(result?.changed)this.renderInto(root);
    });
    root.addEventListener('pointercancel',()=>{const drag=this._domDrag.get(root);if(!drag)return;this._domDrag.delete(root);drag.handle?.closest?.('[data-structured-block-id]')?.removeAttribute?.('data-dragging');this.cancelPointerDrag('structured-pointer-cancel');});
    return true;
  }
  routeKeydown(event={},context={}){
    this.assertCanonicalOwners();
    const ownership=this.inputKeymapOwner.inputOwnershipDescriptor({allowedGlobalCommands:context.allowedGlobalCommands||[]}),familyKeymap=this.inputKeymapOwner.descriptor();
    const globalResult=this.globalInputKeymapOwner.handleKeydown(event,{...context,inputOwnership:ownership,familyKeymap,target:context.target||event.target});
    const result=this.inputKeymapOwner.handleKeydown(event,{...context,mode:this.mode,globalResult});
    this._receipt('keyboard.route',{key:event.key||null,globalOwner:this.globalInputKeymapOwner.owner,inputOwner:this.inputKeymapOwner.owner,globalCode:globalResult.code,structuredCode:result.code});
    return {hostOwner:this.owner,globalResult,result,inputOwner:this.inputKeymapOwner.owner};
  }
  routeComposition(kind,event={},context={}){this.assertCanonicalOwners();const method=kind==='start'?'handleCompositionStart':kind==='update'?'handleCompositionUpdate':kind==='end'?'handleCompositionEnd':null;if(!method)throw Error('UNKNOWN_COMPOSITION_ROUTE');const result=this.inputKeymapOwner[method](event,{...context,mode:this.mode});return {...result,hostOwner:this.owner,delegatedOwner:this.inputKeymapOwner.owner};}
  routeClipboard(command,payload={}){this.assertCanonicalOwners();if(!CLIPBOARD_COMMANDS.includes(command))throw Error('UNKNOWN_STRUCTURED_CLIPBOARD_COMMAND');const result=this.commands.execute(command,{...payload,mode:this.mode,route:'structured-surface-host:clipboard'});return {...result,hostOwner:this.owner,delegatedOwner:this.adapter.clipboardOwner.owner};}
  routeAction(actionId,context={}){this.assertCanonicalOwners();const result=this.adapter.executeStructuredAction(actionId,{...context,mode:this.mode,surface:context.surface||'block-menu',route:'structured-surface-host:action'});return {...result,hostOwner:this.owner,delegatedOwner:this.adapter.actionDescriptorOwner.owner};}
  routeCommand(command,payload={}){this.assertCanonicalOwners();const result=this.commands.execute(command,{...payload,mode:this.mode,route:payload.route||'structured-surface-host:command'});return {...result,hostOwner:this.owner};}
  _readModeDragDenial(route){return {ok:false,changed:false,code:'EDIT_MODE_REQUIRED',reason:'Structured reorder requires edit mode',owner:this.owner,hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner,availabilityOwner:this.adapter.commandAvailabilityOwner.owner,route};}
  beginPointerDrag(payload={}){this.assertCanonicalOwners();if(this.mode!=='edit'){if(this.adapter.dragDropOwner.pointer)this.adapter.dragDropOwner.cancelPointer('structured-surface-read-mode');return this._readModeDragDenial('pointer-begin');}return {...this.adapter.dragDropOwner.beginPointer(payload),hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner};}
  updatePointerDrag(payload={}){this.assertCanonicalOwners();if(this.mode!=='edit'){if(this.adapter.dragDropOwner.pointer)this.adapter.dragDropOwner.cancelPointer('structured-surface-read-mode');return this._readModeDragDenial('pointer-update');}return {...this.adapter.dragDropOwner.updatePointer(payload),hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner};}
  commitPointerDrag(payload={}){this.assertCanonicalOwners();if(this.mode!=='edit'){if(this.adapter.dragDropOwner.pointer)this.adapter.dragDropOwner.cancelPointer('structured-surface-read-mode');return this._readModeDragDenial('pointer-commit');}return {...this.adapter.dragDropOwner.commitPointer(payload),hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner};}
  cancelPointerDrag(reason='cancelled'){this.assertCanonicalOwners();return {...this.adapter.dragDropOwner.cancelPointer(reason),hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner};}
  reorderKeyboard(blockId,direction,options={}){this.assertCanonicalOwners();if(this.mode!=='edit'){const availability=this.adapter.commandAvailabilityOwner.inspect(direction==='up'?'block.moveUp':'block.moveDown',{mode:this.mode,blockId,route:'structured-surface-host:keyboard-reorder'});return {...this._readModeDragDenial(`keyboard-${direction}`),code:availability.code,reason:availability.reason,availability};}return {...this.adapter.dragDropOwner.reorderKeyboard(blockId,direction,options),hostOwner:this.owner,delegatedOwner:this.adapter.dragDropOwner.owner};}
  _validateContentPatch(blockId,patch){
    if(!isPlainObject(patch))throw Error('STRUCTURED_CONTENT_PATCH_MUST_USE_ACCEPTED_NON_STRUCTURAL_FIELDS');
    const keys=Object.keys(patch);if(!keys.length)throw Error('STRUCTURED_CONTENT_PATCH_MUST_USE_ACCEPTED_NON_STRUCTURAL_FIELDS');
    const formatKeys=keys.filter(key=>FORMAT_PATCH_KEYS.has(key));
    if(formatKeys.length)return {ok:false,formatKeys:formatKeys.sort()};
    if(keys.some(key=>!CONTENT_PATCH_KEYS.has(key)))throw Error('STRUCTURED_CONTENT_PATCH_MUST_USE_ACCEPTED_NON_STRUCTURAL_FIELDS');
    const document=this.adapter.snapshot(),ref=this.adapter.treeKernel.findRef(document.blocks,blockId);if(!ref)throw Error('UNKNOWN_STRUCTURED_BLOCK');
    const block=ref.block,type=block.type;
    if(type==='toggle'){
      for(const key of keys){if(!['title','titleHtml','open'].includes(key))throw Error(`STRUCTURED_CONTENT_FIELD_NOT_APPLICABLE:${type}:${key}`);if(key==='open'&&typeof patch[key]!=='boolean')throw Error('STRUCTURED_TOGGLE_OPEN_BOOLEAN_REQUIRED');if((key==='title'||key==='titleHtml')&&typeof patch[key]!=='string')throw Error(`STRUCTURED_TOGGLE_${key==='title'?'TITLE':'TITLE_HTML'}_STRING_REQUIRED`);}
    }else if(type==='code'){
      for(const key of keys)if(!['codeText','annotations'].includes(key))throw Error(`STRUCTURED_CONTENT_FIELD_NOT_APPLICABLE:${type}:${key}`);
      if('codeText' in patch&&typeof patch.codeText!=='string')throw Error('STRUCTURED_CODE_TEXT_STRING_REQUIRED');
      const effectiveText='codeText' in patch?patch.codeText:String(block.codeText??block.html??'');
      if('annotations' in patch)assertCodeAnnotations(patch.annotations,effectiveText);
    }else{
      for(const key of keys)if(key!=='html')throw Error(`STRUCTURED_CONTENT_FIELD_NOT_APPLICABLE:${type}:${key}`);
      if(!HTML_CONTENT_BLOCK_TYPES.has(type))throw Error(`STRUCTURED_HTML_CONTENT_NOT_APPLICABLE:${type}`);
      if(typeof patch.html!=='string')throw Error('STRUCTURED_HTML_CONTENT_STRING_REQUIRED');
    }
    return {ok:true,blockType:type};
  }
  updateContent(blockId,patch={}){
    this.assertCanonicalOwners();
    if(this.mode!=='edit')return {ok:false,changed:false,code:'EDIT_MODE_REQUIRED',owner:this.owner,delegatedOwner:this.adapter.transactionOwner.owner};
    const validation=this._validateContentPatch(blockId,patch);
    if(!validation.ok)return {ok:false,changed:false,code:'FORMAT_UPDATE_REQUIRES_CANONICAL_COMMAND',reason:'Direction, alignment, and background must route through StructuredCommandAvailabilityOwner-backed commands',owner:this.owner,delegatedOwner:this.adapter.commandAvailabilityOwner.owner,rejectedKeys:validation.formatKeys};
    const beforeDocument=this.adapter.snapshot(),before=this.adapter.transactionDescriptor(),document=this.adapter.updateBlock(blockId,patch),after=this.adapter.transactionDescriptor(),historyFrameDelta=after.historyLength-before.historyLength,workingRevisionDelta=after.workingRevision-before.workingRevision;
    if(historyFrameDelta===0&&workingRevisionDelta===0&&JSON.stringify(beforeDocument)===JSON.stringify(document))return {ok:true,changed:false,code:'NO_CHANGE',owner:this.owner,delegatedOwner:this.adapter.transactionOwner.owner,mutationByHost:false,historyFrameDelta:0,workingRevisionDelta:0,document};
    if(historyFrameDelta!==1||workingRevisionDelta!==1)throw Error(`STRUCTURED_CONTENT_UPDATE_NON_ATOMIC_TRANSACTION:${historyFrameDelta}:${workingRevisionDelta}`);
    return {ok:true,changed:true,code:'CONTENT_UPDATED_THROUGH_ACCEPTED_TRANSACTION_OWNER',owner:this.owner,delegatedOwner:this.adapter.transactionOwner.owner,mutationByHost:false,historyFrameDelta,workingRevisionDelta,document,receipt:this._receipt('content.update',{blockId,blockType:validation.blockType,transactionOwner:this.adapter.transactionOwner.owner,historyFrameDelta,workingRevisionDelta})};
  }
}
