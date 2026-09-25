const clone=value=>structuredClone(value);

import { WorkspaceHostKernel, WORKSPACE_HOST_CONTRACT } from './global/workspace-host-kernel.js';
import { WorkspacePaneLayoutOwner, WORKSPACE_PANE_WIDTH_LIMITS } from './global/pane-layout.js';
import { createWorkspaceFamilyBinding, WORKSPACE_REGION_CONTRACT } from './global/region-contract.js';
import { TransientFocusOwner } from './global/transient-focus.js';
import { eventTargetElement } from './global/input-ownership-contract.js';
import { StructuredSurfaceHost as CanonicalStructuredSurfaceHost } from './structured/surface-host.js';
import { StructuredActionSurfacePresentationHost } from './structured/action-surfaces/presentation-host.js';

export { WORKSPACE_HOST_CONTRACT, WorkspaceHostKernel, WORKSPACE_REGION_CONTRACT };

/** One reversible transient owner. It restores the exact invoker when still focusable. */

/** Backward-compatible facade only; canonical pane owner identity is WorkspacePaneLayoutOwner. */
export class PaneLayoutController extends WorkspacePaneLayoutOwner {
  constructor(preferences,{width=()=>globalThis.innerWidth||1440}={}){super(preferences,{viewportWidth:width()});this.width=width;}
  preferred(side){return this.preferredState(side);}
  effective(side,viewportWidth=this.width()){return super.effective(side,viewportWidth);}
  setPreferred(side,state,scope='global'){super.setPreferredState(side,state,scope);return this.snapshot();}
  snapshot(viewportWidth=this.width()){
    const value=super.snapshot(viewportWidth);
    return {...value,left:{...value.left,preferred:value.left.preferredState,effective:value.left.effectiveState},right:{...value.right,preferred:value.right.preferredState,effective:value.right.effectiveState}};
  }
}

/** Backward-compatible facade only; canonical transient owner identity is TransientFocusOwner. */
export class TransientFocusController extends TransientFocusOwner {}

/**
 * Thin donor-free bridge to the canonical StructuredSurfaceHost.
 * Before Wave4 attaches the canonical input owner, the initial bootstrap render remains minimal;
 * the first post-Wave4 preference/render pass atomically cuts over to the shared Structured host.
 * No Structured semantic owner is implemented here.
 */
export class DonorFreeStructuredSurfaceHost {
  constructor(adapter,state,{openInsertionChooser=null}={}){this.adapter=adapter;this.state=state;this.openInsertionChooser=openInsertionChooser;this.canonicalHost=null;this.root=null;this.boundRoot=null;this.suppressContentCommit=false;}
  _canonical(){
    if(this.canonicalHost)return this.canonicalHost;
    const input=this.adapter.inputKeymapOwner,commands=input?.commands,globalInputKeymapOwner=input?.globalInputKeymapOwner;
    if(!input||!commands||!globalInputKeymapOwner)return null;
    this.canonicalHost=new CanonicalStructuredSurfaceHost({adapter:this.adapter,commands,globalInputKeymapOwner,mode:this.state.surface.mode});
    return this.canonicalHost;
  }
  _syncState(blockId=null){
    const documentState=this.adapter.snapshot(),selection=this.adapter.selectedFragmentIdentity?.();
    this.state.editor={...clone(documentState),selectedBlock:blockId||selection?.blockIds?.[0]||this.state.editor?.selectedBlock||null,dirty:this.adapter.transactionDescriptor?.().dirty??this.state.editor?.dirty??false,committedRevision:this.adapter.committedRevision};
    return documentState;
  }
  _caretContext(editable,blockId){
    const text=editable?.textContent||'',selection=editable?.ownerDocument?.defaultView?.getSelection?.();let offset=0;
    if(selection?.rangeCount){const range=selection.getRangeAt(0);if(editable.contains(range.startContainer)){const prefix=range.cloneRange();prefix.selectNodeContents(editable);prefix.setEnd(range.startContainer,range.startOffset);offset=prefix.toString().length;}}
    offset=Math.max(0,Math.min(text.length,offset));
    return {blockId,offset,anchorOffset:offset,focusOffset:offset,beforeText:text.slice(0,offset),afterText:text.slice(offset),atStart:offset===0,atEnd:offset===text.length,target:editable};
  }
  _bindCanonicalContent(root,host){
    if(this.boundRoot===root)return;this.boundRoot=root;
    root.addEventListener('blur',event=>{
      const editable=eventTargetElement(event.target)?.closest('[data-structured-editable],[data-editable-block]');if(this.suppressContentCommit||!editable||!root.contains(editable)||this.state.surface.mode!=='edit')return;
      const row=editable.closest('[data-structured-block-id]'),blockId=row?.getAttribute('data-structured-block-id');if(!blockId)return;
      const result=host.updateContent(blockId,{html:editable.innerHTML});if(result?.ok)this._syncState(blockId);
    },true);
    root.addEventListener('keydown',event=>{
      const editable=eventTargetElement(event.target)?.closest('[data-structured-editable],[data-editable-block]'),historyChord=!!(event.ctrlKey||event.metaKey)&&!event.altKey&&['z','y'].includes(String(event.key||'').toLowerCase());
      if(editable&&!root.contains(editable))return;if(!editable&&!(this.state.surface.mode==='read'&&historyChord&&root.contains(event.target)))return;
      const row=editable?.closest?.('[data-structured-block-id]'),blockId=row?.getAttribute('data-structured-block-id')||this.adapter.selectedFragmentIdentity?.()?.blockIds?.[0]||this.adapter.snapshot()?.blocks?.[0]?.id;if(!blockId)return;
      const routed=host.routeKeydown(event,{...(editable?this._caretContext(editable,blockId):{blockId,offset:0,anchorOffset:0,focusOffset:0,beforeText:'',afterText:'',atStart:true,atEnd:true,target:root}),mode:this.state.surface.mode,target:editable||root});
      const result=routed?.result;
      if(result?.handled&&/^history\.(undo|redo)$/.test(String(result.command||''))){
        this.suppressContentCommit=true;this._syncState(blockId);queueMicrotask(()=>{try{this.render();const next=root.querySelector(`[data-structured-block-id=\"${CSS.escape(blockId)}\"] [data-structured-editable=\"true\"], [data-structured-block-id=\"${CSS.escape(blockId)}\"] [data-editable-block]`);(next||root)?.focus?.({preventScroll:true});}finally{this.suppressContentCommit=false}});
      }
    },true);
    for(const [name,kind] of [['compositionstart','start'],['compositionupdate','update'],['compositionend','end']])root.addEventListener(name,event=>{
      const editable=eventTargetElement(event.target)?.closest('[data-structured-editable],[data-editable-block]');if(!editable||!root.contains(editable))return;
      const row=editable.closest('[data-structured-block-id]'),blockId=row?.getAttribute('data-structured-block-id');if(!blockId)return;
      host.routeComposition(kind,event,{...this._caretContext(editable,blockId),mode:this.state.surface.mode,target:editable});
    },true);
    root.addEventListener('structured-action-surface-request',event=>{
      const blockId=event.detail?.blockId;if(blockId)this._syncState(blockId);
    });
    root.addEventListener('structured-insertion-request',event=>{
      const detail=event.detail||{},target=detail.target;if(!target)return;root.dataset.pendingStructuredInsertion=detail.request?.code||'INSERTION_REQUEST';
      const consumed=this.openInsertionChooser?.({host,target,request:detail.request,invoker:detail.invoker,returnFocus:detail.returnFocus,root});
      if(consumed){event.preventDefault();root.dataset.pendingStructuredInsertion='CHOOSER_BOUND';}
    });
  }
  _bootstrapRender(host,title){
    const documentState=this._syncState();title.textContent=documentState.title;title.contentEditable=String(this.state.surface.mode==='edit');
    host.innerHTML=documentState.blocks.map(block=>`<article class="block" data-block-id="${escapeAttribute(block.id)}" data-selected="${this.state.editor.selectedBlock===block.id}"><div class="blockcontent"><div class="blockbody" data-editable-block contenteditable="${this.state.surface.mode==='edit'}" dir="${escapeAttribute(block.dir||'auto')}">${block.html||''}</div></div></article>`).join('');
    host.querySelectorAll('[data-block-id]').forEach(row=>{
      row.addEventListener('click',()=>{this.state.editor.selectedBlock=row.dataset.blockId;host.querySelectorAll('[data-block-id]').forEach(item=>item.dataset.selected=String(item===row));});
      row.querySelector('[data-editable-block]')?.addEventListener('blur',event=>{if(this.state.surface.mode!=='edit')return;this.adapter.updateBlock(row.dataset.blockId,{html:event.currentTarget.innerHTML});this._syncState(row.dataset.blockId);});
    });
  }
  render(){
    const host=document.querySelector('#blockList'),title=document.querySelector('#documentTitle');if(!host||!title)return;
    this.root=host;const canonical=this._canonical();
    if(!canonical){this._bootstrapRender(host,title);return;}
    if(canonical.mode!==this.state.surface.mode)canonical.setMode(this.state.surface.mode);
    const documentState=this._syncState();title.textContent=documentState.title;title.contentEditable=String(this.state.surface.mode==='edit');
    canonical.renderInto(host);host.tabIndex=0;host.dataset.structuredSurfaceOwner=canonical.owner;host.dataset.structuredPresentationOwner=canonical.presentationBridge.owner;this._bindCanonicalContent(host,canonical);
    title.onblur=()=>{if(this.state.surface.mode!=='edit')return;this.adapter.updateTitle(title.textContent||'');this._syncState();};
  }
  descriptor(){return this.canonicalHost?.descriptor?.()||{owner:'DonorFreeStructuredSurfaceHostBootstrap',canonicalPending:true};}
}

export function createStructuredWorkspaceBinding(adapter,{id='learn-structured-workspace'}={}){
  if(!adapter)throw Error('STRUCTURED_WORKSPACE_ADAPTER_REQUIRED');
  return createWorkspaceFamilyBinding({
    id,
    family:'structured',
    domainKind:adapter.domainKind||'learn',
    label:'Structured workspace',
    adapter,
    createState:()=>({surface:{mode:'read'},editor:{...clone(adapter.snapshot()),selectedBlock:null,dirty:false,committedRevision:adapter.committedRevision}}),
    descriptor:()=>({id,family:'structured',domainKind:adapter.domainKind||'learn',adapter:adapter.descriptor?.()||null}),
    commandContext:({state,payload})=>({mode:state.surface.mode,blockId:payload.blockId??state.editor?.selectedBlock??null,...payload}),
    setMode:({state,mode})=>{state.surface.mode=mode;}
  });
}

export function createFamilyWorkspaceBinding({id,family,domainKind,label,activeTarget=null}){
  return createWorkspaceFamilyBinding({
    id,
    family,
    domainKind,
    label:label||`${family} workspace`,
    createState:()=>({domainState:{activeTarget}}),
    descriptor:({state})=>({id,family,domainKind,activeTarget:state?.domain?.activeTarget??activeTarget}),
    commandContext:({state,payload})=>({activeTarget:payload.activeTarget??state.domain.activeTarget??activeTarget,...payload})
  });
}

function escapeAttribute(value){return String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));}

function focusReturnForPane(side){
  const pane=document.querySelector(`#${side}Pane`);
  const externalToggle=[...document.querySelectorAll(`[data-pane-toggle="${side}"]`)].find(toggle=>!pane?.contains(toggle)&&!toggle.closest('[hidden],[inert]')&&toggle.getAttribute('aria-hidden')!=='true'&&toggle.getAttribute('aria-disabled')!=='true'&&!toggle.disabled);
  return externalToggle||document.querySelector(`[data-foundation-command="foundation.${side}"]`)||document.querySelector('[data-foundation-command="foundation.focus"]')||document.querySelector('#centerPane');
}

/**
 * Family-neutral host used by representative Structured, Spatial and Operational consumers.
 * A family binding is mandatory: missing bindings fail rather than fabricating Structured state.
 * Library alone continues through the accepted donor compatibility runtime.
 */
export function mountWorkspaceHost({commands,preferences,binding,extension={}}){
  const kernel=new WorkspaceHostKernel({commands,preferences,binding,extension,viewportWidth:globalThis.innerWidth||1440});
  const {state,panes}=kernel,transients=extension.transientOwner||new TransientFocusOwner({fallbackFocus:()=>document.querySelector('#centerPane')});
  const structuredAdapter=binding.family==='structured'?binding.adapter:null;
  const structuredActionPresentation=structuredAdapter?new StructuredActionSurfacePresentationHost({transientFocus:transients,document,window}):null;
  const insertionPaletteState={target:null,host:null,invoker:null};
  const closeStructuredInsertionChooser=({restore=true,reason='explicit'}={})=>{
    const palette=document.querySelector('#insertionPalette'),invoker=insertionPaletteState.invoker;
    const closed=structuredActionPresentation?.closeSurface('insertion-palette',{restore,reason})||false;
    if(palette){palette.hidden=true;delete palette.dataset.targetKind;delete palette.dataset.surface;}
    insertionPaletteState.target=null;insertionPaletteState.host=null;insertionPaletteState.invoker=null;
    if(restore&&!closed)invoker?.focus?.({preventScroll:true});
    return true;
  };
  const makeStructuredChooserBlock=type=>{
    if(!structuredAdapter?.treeKernel?.hasType?.(type)||typeof structuredAdapter?._allocateCommandBlockId!=='function')return null;
    const id=structuredAdapter._allocateCommandBlockId(`${type}-chooser`),base={id,type,align:'start',dir:'auto',bg:'none',indent:0};
    if(type==='toggle')return {...base,title:'',titleHtml:'',open:true,children:[]};
    if(type==='code')return {...base,codeText:'',annotations:[],language:'text',dir:'ltr'};
    return {...base,html:''};
  };
  const renderStructuredInsertionChooser=(query='')=>{
    const grid=document.querySelector('#insertGrid'),target=insertionPaletteState.target,host=insertionPaletteState.host;if(!grid||!target||!host)return false;
    const q=String(query||'').trim().toLowerCase(),types=(structuredAdapter?.treeKernel?.blockTypes||[]).filter(def=>{
      if(q&&!`${def.type} ${def.label}`.toLowerCase().includes(q))return false;
      const block=makeStructuredChooserBlock(def.type);if(!block)return false;
      const canonical=host._canonicalGapState?.(target);if(!canonical?.ok)return false;
      const parentId=canonical.state.target.parentId,parent=parentId?structuredAdapter.treeKernel.findRef(structuredAdapter.snapshot().blocks,parentId)?.block:null;
      return !parent||structuredAdapter.treeKernel.canContain(parent.type,def.type);
    });
    grid.innerHTML=types.length?types.map(def=>`<button class="menuitem insertitem" type="button" role="option" data-canonical-insert-type="${escapeAttribute(def.type)}"><span><strong>${escapeAttribute(def.label)}</strong><small>${escapeAttribute(def.type)}</small></span></button>`).join(''):'<div class="insert-empty">No compatible block type for this position.</div>';
    return true;
  };
  const openStructuredInsertionChooser=({host,target,request,invoker,returnFocus}={})=>{
    if(!request?.ok||request.status!=='INSERTION_REQUEST'||!host||!target)return false;
    const palette=document.querySelector('#insertionPalette'),meta=document.querySelector('#insertMeta'),context=document.querySelector('#insertContext'),search=document.querySelector('#insertSearch'),grid=document.querySelector('#insertGrid');
    if(!palette||!search||!grid)return false;
    insertionPaletteState.target=clone(target);insertionPaletteState.host=host;insertionPaletteState.invoker=invoker||document.activeElement;
    palette.dataset.surface=binding.domainKind||structuredAdapter.domainKind||'structured';palette.dataset.targetKind='gap';palette.dataset.canonicalInsertionBinding='StructuredInsertionTargetOwner';
    if(context)context.textContent='Add block';if(meta)meta.textContent=`gap · depth ${target.depth} · index ${target.index}`;search.value='';renderStructuredInsertionChooser('');
    search.oninput=()=>renderStructuredInsertionChooser(search.value);
    grid.onclick=event=>{const button=eventTargetElement(event.target)?.closest('[data-canonical-insert-type]');if(!button)return;const type=button.dataset.canonicalInsertType,block=makeStructuredChooserBlock(type);if(!block)return;const result=host.routeInsertionGap(insertionPaletteState.target,{block,type});if(result?.changed){closeStructuredInsertionChooser({restore:false,reason:'inserted'});surface?.render();requestAnimationFrame(()=>document.querySelector(`[data-structured-block-id="${CSS.escape(block.id)}"] [data-structured-editable="true"]`)?.focus?.({preventScroll:true}));}};
    structuredActionPresentation.openInsertionPalette({element:palette,invoker:insertionPaletteState.invoker,anchorRect:insertionPaletteState.invoker?.getBoundingClientRect?.(),fallbackFocus:returnFocus,onClose:()=>{insertionPaletteState.target=null;insertionPaletteState.host=null;insertionPaletteState.invoker=null;}});
    palette.hidden=false;requestAnimationFrame(()=>search.focus({preventScroll:true}));return true;
  };
  const surface=structuredAdapter?new DonorFreeStructuredSurfaceHost(structuredAdapter,state,{openInsertionChooser:openStructuredInsertionChooser}):null;

  let lastAppliedPaneSnapshot=null,lastPaneFocusSide=null;
  const paneSnapshot=()=>panes.snapshot(globalThis.innerWidth||1440);
  const applyPanes=()=>{
    const snapshot=paneSnapshot();
    document.body.dataset.focusMode=String(panes.focusMode);
    document.body.dataset.responsiveBand=snapshot.responsiveBand;
    for(const side of ['left','right']){
      const projection=snapshot[side],pane=document.querySelector(`#${side}Pane`),resizer=document.querySelector(`#${side}Resizer`);
      document.body.dataset[side]=projection.effectiveState;
      document.documentElement.style.setProperty(`--${side}`,`${projection.effectiveWidth}px`);
      if(pane){
        pane.dataset.state=projection.effectiveState;
        pane.dataset.preferredState=projection.preferredState;
        pane.dataset.paneMode=projection.mode;
        pane.hidden=projection.effectiveState==='collapsed';
        pane.inert=projection.effectiveState==='collapsed';
        pane.setAttribute('aria-hidden',String(projection.effectiveState==='collapsed'));
      }
      if(resizer){
        const limits=projection.resizeLimits||WORKSPACE_PANE_WIDTH_LIMITS[side];
        resizer.hidden=!projection.resizeAvailability.keyboard;
        resizer.setAttribute('aria-disabled',String(!projection.resizeAvailability.keyboard));
        resizer.setAttribute('aria-valuemin',String(limits.min));
        resizer.setAttribute('aria-valuemax',String(limits.max));
        resizer.setAttribute('aria-valuenow',String(projection.effectiveWidth));
        resizer.dataset.pointerResize=String(projection.resizeAvailability.pointer);
        resizer.dataset.keyboardResize=String(projection.resizeAvailability.keyboard);
      }
      document.querySelectorAll(`[data-pane-toggle="${side}"]`).forEach(button=>{
        const internal=Boolean(pane?.contains(button));
        button.setAttribute('aria-expanded',String(projection.effectiveState==='open'));
        button.setAttribute('aria-disabled',String(Boolean(panes.focusMode)));
        button.dataset.paneMode=projection.mode;
        button.dataset.paneControlRole=internal?'collapse':'reveal-toggle';
      });
    }
    lastAppliedPaneSnapshot=snapshot;
    return snapshot;
  };

  const paneOwnsFocus=side=>{const pane=document.querySelector(`#${side}Pane`),resizer=document.querySelector(`#${side}Resizer`),active=document.activeElement;return Boolean(active&&((pane&&pane.contains(active))||active===resizer));};
  document.addEventListener('focusin',event=>{for(const side of ['left','right']){const pane=document.querySelector(`#${side}Pane`),resizer=document.querySelector(`#${side}Resizer`);if((pane&&pane.contains(event.target))||event.target===resizer){lastPaneFocusSide=side;return;}}lastPaneFocusSide=null;},true);
  const collapseFocusReturn=(side,before,after,hadFocus=false)=>{
    if(before?.effectiveState!=='open'||after?.effectiveState!=='collapsed'||!hadFocus)return false;
    focusReturnForPane(side)?.focus?.();
    return true;
  };
  const mutatePane=(side,mutation)=>{
    const before=panes.projection(side,globalThis.innerWidth||1440),hadFocus=paneOwnsFocus(side);
    mutation();
    const snapshot=applyPanes();
    collapseFocusReturn(side,before,snapshot[side],hadFocus);
    return snapshot;
  };

  const closeBackdrop=(backdrop,{restore=true,reason='explicit'}={})=>{if(!backdrop)return false;const closed=transients.close(backdrop.id,{restore,reason});if(closed||!transients.record(backdrop.id))backdrop.hidden=true;return closed;};
  const commandContext=(payload={})=>({...kernel.commandContext(payload),...payload});
  const renderCommandResults=(query='')=>{const host=document.querySelector('#commandResults');if(!host)return;const q=String(query).trim().toLowerCase();host.innerHTML=commands.items(commandContext()).filter(item=>!q||`${item.id} ${item.label} ${item.owner}`.toLowerCase().includes(q)).map(item=>`<button class="menuitem" role="option" data-foundation-command="${escapeAttribute(item.id)}" ${item.enabled?'':'disabled'}><span>${escapeAttribute(item.label)}</span><small>${escapeAttribute(item.owner)}${item.reason?' · '+escapeAttribute(item.reason):''}</small></button>`).join('');};

  const api={
    hostContract:WORKSPACE_HOST_CONTRACT,regionContract:WORKSPACE_REGION_CONTRACT,hostKind:'DONOR_FREE_WORKSPACE_HOST',state,panes,transients,binding,
    Commands:{execute:(id,p={})=>commands.execute(id,commandContext(p))},
    effectivePaneState:side=>panes.effective(side,globalThis.innerWidth||1440),
    setPaneState:(side,value)=>mutatePane(side,()=>panes.setPreferredState(side,value)),
    collapsePane:side=>mutatePane(side,()=>panes.setEffectiveState(side,'collapsed',{preferred:panes.responsiveBand()==='wide'})),
    togglePane:side=>mutatePane(side,()=>panes.toggle(side,globalThis.innerWidth||1440)),
    revealPane:side=>mutatePane(side,()=>panes.reveal(side,globalThis.innerWidth||1440)),
    toggleFocus:()=>{const before=paneSnapshot(),focused={left:paneOwnsFocus('left'),right:paneOwnsFocus('right')};state.surface.focusMode=!state.surface.focusMode;panes.setFocusMode(state.surface.focusMode);const snapshot=applyPanes();for(const side of ['left','right'])collapseFocusReturn(side,before[side],snapshot[side],focused[side]);return state.surface.focusMode;},
    applyPreferenceSnapshot:()=>{const before=paneSnapshot(),focused={left:paneOwnsFocus('left'),right:paneOwnsFocus('right')};const snapshot=applyPanes();for(const side of ['left','right'])collapseFocusReturn(side,before[side],snapshot[side],focused[side]);surface?.render();binding.render?.({state,root:document,extension});return snapshot;},
    openBackdrop:(backdrop,invoker=document.activeElement,options={})=>{if(!backdrop)return false;const modal=backdrop.querySelector?.('[aria-modal="true"]')!==null;transients.open(backdrop.id,{invoker,element:backdrop,kind:'backdrop',modal,outsideDismiss:options.outsideDismiss!==false,escapeDismiss:options.escapeDismiss!==false,fallbackFocus:()=>document.querySelector('#centerPane')});backdrop.hidden=false;requestAnimationFrame(()=>backdrop.querySelector('input,button,[tabindex]')?.focus());return true;},
    closeBackdrop,
    closePrimaryTransients:()=>{for(const selector of ['#commandBackdrop','#blockMenu','#insertionPalette']){const node=document.querySelector(selector);if(node&&!node.hidden)closeBackdrop(node,{restore:false,reason:'primary-reset'});}return transients.closeAll({restore:false,reason:'primary-reset'});},
    openCommandPalette:()=>{const backdrop=document.querySelector('#commandBackdrop');renderCommandResults('');api.openBackdrop(backdrop,document.activeElement);document.querySelector('#commandSearch')?.focus();},
    renderCommandResults,
    renderInspector:()=>{},
    renderBottom:()=>{if(extension.renderBottom?.(state))return;const shelf=document.querySelector('#bottomShelf'),content=document.querySelector('#bottomContent');if(shelf)shelf.dataset.state=state.surface.bottomOpen?'open':'closed';if(content){content.inert=!state.surface.bottomOpen;content.innerHTML=state.surface.bottomOpen?'<p>Local workspace history is empty.</p>':'';}},
    renderNotes:()=>{},
    openNote:id=>state.notes[id]||null,
    noteCapability:()=>extension.noteRuntime?.capability?.({sourceAvailable:true,routeBound:true})||(binding.domainKind==='learn'?{enabled:false,code:'FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13',reason:'The shared Structured Sticky family is compatible with Learn; final Product route binding remains reserved to D13.',availabilityOwner:'WorkspaceFoundationHost',familyAvailable:true,finalRouteBound:false}:{enabled:false,code:'STRUCTURED_STICKY_RUNTIME_UNAVAILABLE',reason:'Shared Structured Sticky runtime is not bound to this route.',availabilityOwner:'WorkspaceFoundationHost',familyAvailable:false,finalRouteBound:false}),
    setMode:mode=>{if(!['read','edit'].includes(mode))throw Error('INVALID_WORKSPACE_MODE');if(typeof binding.setMode!=='function')throw Error('WORKSPACE_MODE_UNAVAILABLE_FOR_FAMILY:'+binding.family);binding.setMode({state,mode});document.body.dataset.mode=mode;surface?.render();},
    inspect:()=>({hostKind:api.hostKind,hostContract:api.hostContract,regionContract:api.regionContract,...kernel.inspect(document),panes:paneSnapshot(),domainKind:binding.domainKind,family:binding.family,libraryState:state.library,structured:structuredAdapter?.descriptor?.()||null})
  };

  const bindPaneToggle=side=>{
    document.querySelectorAll(`[data-pane-toggle="${side}"]`).forEach(button=>{
      button.addEventListener('click',event=>{
        if(button.disabled||button.getAttribute('aria-disabled')==='true')return;
        event.preventDefault();
        const pane=document.querySelector(`#${side}Pane`);
        if(pane?.contains(button)){api.collapsePane(side);return;}
        const projection=panes.projection(side,globalThis.innerWidth||1440);
        if(projection.effectiveState==='collapsed'&&projection.responsiveSuppressed)api.revealPane(side);
        else api.togglePane(side);
      });
    });
  };

  const bindSeparator=side=>{
    const resizer=document.querySelector(`#${side}Resizer`);
    if(!resizer)return;
    resizer.addEventListener('keydown',event=>{
      const projection=panes.projection(side,globalThis.innerWidth||1440);
      if(!projection.resizeAvailability.keyboard)return;
      const limits=WORKSPACE_PANE_WIDTH_LIMITS[side];
      let next=null;
      if(event.key==='Home')next=limits.min;
      else if(event.key==='End')next=limits.max;
      else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        const physical=event.key==='ArrowRight'?1:-1;
        const signed=side==='left'?physical:-physical;
        next=projection.preferredWidth+signed*limits.step;
      }
      if(next===null)return;
      event.preventDefault();
      mutatePane(side,()=>{
        if(event.key==='Home')panes.setEffectiveState(side,'collapsed',{preferred:panes.responsiveBand()==='wide'});
        else panes.resizeBy(side,next-projection.preferredWidth);
      });
    });
    resizer.addEventListener('pointerdown',event=>{
      const projection=panes.projection(side,globalThis.innerWidth||1440);
      if(!projection.resizeAvailability.pointer)return;
      event.preventDefault();
      let lastX=event.clientX,collapsedDuringDrag=false;
      const cleanup=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
      const move=moveEvent=>{
        const delta=side==='left'?moveEvent.clientX-lastX:lastX-moveEvent.clientX;
        lastX=moveEvent.clientX;
        const before=panes.projection(side,globalThis.innerWidth||1440),hadFocus=paneOwnsFocus(side);
        panes.resizeBy(side,delta);
        const snapshot=applyPanes();
        if(before.effectiveState==='open'&&snapshot[side].effectiveState==='collapsed'){collapsedDuringDrag=true;cleanup();collapseFocusReturn(side,before,snapshot[side],hadFocus);}
      };
      const up=()=>{cleanup();if(!collapsedDuringDrag&&!resizer.hidden)resizer.focus?.();};
      window.addEventListener('pointermove',move);
      window.addEventListener('pointerup',up,{once:true});
    });
  };

  document.querySelector('.library-search')?.remove();
  document.querySelector('.library-current-actions')?.remove();
  document.querySelector('#structureTree')?.setAttribute('aria-label',binding.label||'Workspace navigation');
  document.querySelector('#commandSearch')?.addEventListener('input',event=>renderCommandResults(event.currentTarget.value));
  document.querySelector('#commandResults')?.addEventListener('click',event=>{const target=eventTargetElement(event.target);const button=target?.closest?.('[data-foundation-command]');if(!button||button.disabled)return;const result=commands.execute(button.dataset.foundationCommand,commandContext({route:'palette'}));if(result!==false){closeBackdrop(document.querySelector('#commandBackdrop'),{reason:'command-accepted'});surface?.render();binding.render?.({state,root:document,extension});}});
  document.addEventListener('keydown',event=>{const palette=document.querySelector('#commandBackdrop');if(event.key==='Escape'&&palette&&!palette.hidden&&transients.canDismiss(palette.id,'escape')){event.preventDefault();event.stopImmediatePropagation();closeBackdrop(palette,{reason:'escape'});}},true);
  for(const side of ['left','right']){bindPaneToggle(side);bindSeparator(side);}
  window.addEventListener('resize',()=>{const before=lastAppliedPaneSnapshot||paneSnapshot(),focused={left:paneOwnsFocus('left')||lastPaneFocusSide==='left',right:paneOwnsFocus('right')||lastPaneFocusSide==='right'};panes.setViewportWidth(globalThis.innerWidth||1440);const snapshot=applyPanes();for(const side of ['left','right'])collapseFocusReturn(side,before[side],snapshot[side],focused[side]);});
  surface?.render();
  binding.render?.({state,root:document,extension});
  applyPanes();
  api.renderBottom();
  extension.ready?.(api);
  return api;
}
