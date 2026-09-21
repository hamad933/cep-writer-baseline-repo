import {esc} from '../workspace.js';
import {ActionAvailabilityCore} from '../models.js';

export const RELATION_INTERACTION_OWNER_ID='RelationInteractionOwner';
export const RELATION_INTERACTION_CONTRACT=Object.freeze({
  id:'RelationInteractionOwner',
  version:'1.1.0',
  owner:RELATION_INTERACTION_OWNER_ID,
  compatibility:'SEMVER',
  responsibilities:Object.freeze(['selection-action-projection','relation-composer-draft','relation-action-routing','relation-reverse-routing','presentation-workflow-delegation'])
});

const clone=x=>structuredClone(x);

/**
 * Presentation-only owner. Canonical relation records, type eligibility,
 * versions, validation, commit and history stay on the supplied domain adapter.
 */
export class RelationInteractionOwner {
  static createDraft(adapter,selectionDescriptor,id=null){
    const relation=id?adapter.records.find(record=>record.id===id):null;
    if(id&&!relation)throw Error('UNKNOWN_RELATION');
    const selected=[...selectionDescriptor.selectedIds];
    return {
      owner:RELATION_INTERACTION_OWNER_ID,
      transient:true,
      id:id||null,
      source:relation?.source||selected[0]||adapter.nodes[0]?.id||'',
      target:relation?.target||selected[1]||adapter.nodes[1]?.id||adapter.nodes[0]?.id||'',
      type:relation?.type||adapter.types[0]||'',
      direction:relation?.direction||'directed',
      expectedVersion:adapter.version,
      fields:Object.fromEntries(adapter.fields.map(field=>[field.name,String(relation?.[field.name]||'')]))
    };
  }

  static actionContext({adapter,selectionDescriptor,commandRegistered=true}){
    return {
      selection:[...selectionDescriptor.selectedIds],
      entities:adapter.nodes,
      domain:adapter,
      activeMode:adapter.readOnly?'recorded':'author',
      domainCapability:adapter.capabilities.relationAuthoring,
      commandRegistered,
      canonicalState:{relations:adapter.project(),version:adapter.version},
      customContext:{selectionDescriptor}
    };
  }

  constructor(workspace,spatial,adapter,onChange=()=>{}){
    Object.assign(this,{workspace,spatial,adapter,onChange});
    this.ownerId=RELATION_INTERACTION_OWNER_ID;
    this.contract=RELATION_INTERACTION_CONTRACT;
    this.policyRevision='RELATION-CENTRAL-04';
    this.actionAvailability=new ActionAvailabilityCore();
    this.selectedEdge=null;
    this.dismissedSelection='';
    this.draft=null;
    this.commitDelegations=0;
    const registry=workspace.commands;

    registry.register('spatial.connect',RELATION_INTERACTION_OWNER_ID,'Connect',payload=>this.open(null,payload.invoker),this.actionAvailability.commandGuard('connect',()=>this.connectContext()));
    registry.register('relation.edit',RELATION_INTERACTION_OWNER_ID,'Edit Relationship',payload=>this.open(payload.id||this.selectedEdge,payload.invoker),payload=>!adapter.readOnly&&adapter.records.some(edge=>edge.id===(payload.id||this.selectedEdge))||'Select an editable relationship');
    registry.register('relation.reverse',RELATION_INTERACTION_OWNER_ID,'Reverse Relationship',payload=>this.reverse(payload.id||this.selectedEdge),payload=>{const availability=adapter.reverseAvailability(payload.id||this.selectedEdge);return availability.enabled||availability.reason});
    const commitCommandId='spatial.relation.'+'commit';
    registry.register(commitCommandId,'RelationDomainAdapter','Apply relationship',payload=>this.commit(payload),payload=>!adapter.readOnly&&!!payload.source||'Open Relation Composer');
    registry.register('relation.undo','RelationDomainAdapter','Undo relationship',()=>adapter.undo(),()=>!adapter.readOnly&&adapter.history.length>0||'No relation change to undo');
    registry.register('relation.redo','RelationDomainAdapter','Redo relationship',()=>adapter.redo(),()=>!adapter.readOnly&&adapter.future.length>0||'No relation change to redo');

    this.selection=document.createElement('div');
    this.selection.className='relation-selection';
    this.selection.role='toolbar';
    this.selection.setAttribute('aria-label','Selection Actions');
    this.selection.hidden=true;
    this.selection.dataset.owner=RELATION_INTERACTION_OWNER_ID;
    this.selection.innerHTML='<span data-selection-count></span><button class="btn" data-connect>Connect</button><button class="btn" data-relation-edit hidden>Edit</button><button class="btn" data-relation-reverse hidden>Reverse</button><button class="btn" data-selection-dismiss aria-label="Dismiss spatial selection actions">×</button>';
    document.body.append(this.selection);
    this.selection.querySelector('[data-connect]').onclick=event=>workspace.api.Commands.execute('spatial.connect',{invoker:event.currentTarget});
    this.selection.querySelector('[data-relation-edit]').onclick=event=>workspace.api.Commands.execute('relation.edit',{id:this.selectedEdge,invoker:event.currentTarget,route:'relation-selection-toolbar'});
    this.selection.querySelector('[data-relation-reverse]').onclick=()=>workspace.api.Commands.execute('relation.reverse',{id:this.selectedEdge,route:'relation-selection-toolbar'});
    this.selection.querySelector('[data-selection-dismiss]').onclick=()=>{this.dismissedSelection=this.selectionKey();this.selection.hidden=true;spatial.svg.focus()};

    this.composer=document.createElement('section');
    this.composer.classList.add('relation-composer');
    this.composer.setAttribute('role','dialog');
    this.composer.setAttribute('aria-modal','false');
    this.composer.setAttribute('aria-label','Relation Composer');
    this.composer.hidden=true;
    this.composer.dataset.policyRevision=this.policyRevision;
    this.composer.dataset.owner=RELATION_INTERACTION_OWNER_ID;
    document.body.append(this.composer);

    adapter.subscribe(edges=>{spatial.model.edges=edges;spatial.render();onChange()});
    document.addEventListener('pointerdown',event=>{if(!this.composer.hidden&&!this.composer.contains(event.target)&&!this.selection.contains(event.target))this.close(false)},true);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!this.composer.hidden){event.preventDefault();event.stopImmediatePropagation();this.close()}},true);
    this.composer.addEventListener('keydown',event=>{if(event.key==='Tab'){const focusable=[...this.composer.querySelectorAll('button,input,select')].filter(element=>!element.disabled);if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus()}}});
    this.spatial.svg.addEventListener('keydown',event=>{if(event.shiftKey&&event.key.toLowerCase()==='r'&&this.selectedEdge){event.preventDefault();event.stopPropagation();this.workspace.api.Commands.execute('relation.reverse',{id:this.selectedEdge,route:'spatial-keyboard'});}});
    window.addEventListener('resize',()=>this.reposition());
  }

  selectionDescriptor(){return this.spatial.selectionDescriptor();}
  selectionKey(){return this.selectedEdge?`edge:${this.selectedEdge}`:[...this.selectionDescriptor().selectedIds].join('|');}
  connectContext(){return RelationInteractionOwner.actionContext({adapter:this.adapter,selectionDescriptor:this.selectionDescriptor(),commandRegistered:this.workspace.commands.commands.has('spatial.connect')});}
  connectAvailability(){return this.actionAvailability.evaluate('connect',this.connectContext());}
  receipt(action='inspect',extra={}){return {schema:'RelationInteractionReceipt@1',ownerId:RELATION_INTERACTION_OWNER_ID,contractVersion:RELATION_INTERACTION_CONTRACT.version,policyRevision:this.policyRevision,action,...clone(extra)};}
  draftReceipt(){return this.draft?clone(this.draft):null;}
  commit(payload){this.commitDelegations++;return this.adapter.commit(payload);}
  reverse(id=this.selectedEdge){if(!id)throw Error('RELATION_SELECTION_REQUIRED');this.selectedEdge=id;this.spatial.setSelectedEdge(id);const result=this.adapter.reverse(id,this.adapter.version);this.refresh();this.onChange();return result;}

  anchor(){const svg=this.spatial.svg;const nodes=[...this.selectionDescriptor().selectedIds].map(id=>svg.querySelector(`[data-node="${CSS.escape(id)}"]`)).filter(Boolean);const edge=this.selectedEdge&&svg.querySelector(`[data-edge="${CSS.escape(this.selectedEdge)}"] text`);const rects=(edge?[edge]:nodes).map(node=>node.getBoundingClientRect());if(!rects.length)return svg.getBoundingClientRect();return {left:Math.min(...rects.map(rect=>rect.left)),right:Math.max(...rects.map(rect=>rect.right)),top:Math.min(...rects.map(rect=>rect.top)),bottom:Math.max(...rects.map(rect=>rect.bottom))};}
  place(element){const anchor=this.anchor(),rect=element.getBoundingClientRect(),width=innerWidth,height=innerHeight;element.style.left=Math.max(8,Math.min(width-rect.width-8,(anchor.left+anchor.right-rect.width)/2))+'px';const above=anchor.top-rect.height-10;element.style.top=Math.max(8,Math.min(height-rect.height-8,above>=8?above:anchor.bottom+10))+'px';}
  reposition(){if(!this.selection.hidden)this.place(this.selection);if(!this.composer.hidden)this.place(this.composer);}
  refresh(){const descriptor=this.selectionDescriptor();if(descriptor.selectionCount>0&&this.selectedEdge){this.selectedEdge=null;this.spatial.setSelectedEdge(null)}const availability=this.connectAvailability(),relation=this.selectedEdge&&this.adapter.records.find(edge=>edge.id===this.selectedEdge),notDismissed=this.dismissedSelection!==this.selectionKey(),relationMode=!!relation&&notDismissed,nodeMode=availability.visible&&notDismissed,show=(relationMode||nodeMode)&&this.composer.hidden&&!this.spatial.host.hidden;this.selection.hidden=!show;if(show){const count=this.selection.querySelector('[data-selection-count]'),connect=this.selection.querySelector('[data-connect]'),edit=this.selection.querySelector('[data-relation-edit]'),reverse=this.selection.querySelector('[data-relation-reverse]');count.textContent=relationMode?`${relation.type} relation`:this.selectionDescriptor().selectionCount+' selected';connect.hidden=relationMode;edit.hidden=!relationMode;reverse.hidden=!relationMode;connect.disabled=!availability.enabled;connect.title=availability.reason;const relationDisabled=this.adapter.readOnly,reverseAvailability=relationMode?this.adapter.reverseAvailability(this.selectedEdge):{enabled:false,reason:''};edit.disabled=relationDisabled;reverse.disabled=!reverseAvailability.enabled;const relationReason=relationDisabled?'Relationship source is read only':'';edit.title=relationReason;reverse.title=reverseAvailability.reason||'Swap canonical source and target';this.place(this.selection)}}
  selectEdge(id){this.selectedEdge=id||null;this.dismissedSelection='';if(id)this.spatial.model.selectionKernel.clear({source:'relation-edge-select'});this.spatial.setSelectedEdge(id||null);this.refresh();this.onChange();}

  open(id=null,invoker=null){
    if(this.adapter.readOnly)return false;
    const adapter=this.adapter,relation=adapter.records.find(record=>record.id===id),selection=[...this.selectionDescriptor().selectedIds];
    if(id&&!relation)throw Error('UNKNOWN_RELATION');
    this.selectedEdge=id;
    this.invoker=invoker||document.activeElement;
    this.workspace.closeMenu(false);
    this.workspace.api.closePrimaryTransients();
    const palette=document.querySelector('#commandBackdrop');
    if(palette&&!palette.hidden)this.workspace.api.closeBackdrop(palette);
    this.selection.hidden=true;
    this.draft=RelationInteractionOwner.createDraft(adapter,this.selectionDescriptor(),id);
    const options=current=>adapter.nodes.map(node=>`<option value="${esc(node.id)}" ${current===node.id?'selected':''}>${esc(node.label||node.name||node.id)}</option>`).join('');
    const composer=this.composer;
    composer.innerHTML=`<header><strong>${relation?'Edit Relationship':'Connect objects'}</strong><button class="btn" data-relation-close aria-label="Close Relation Composer">×</button></header><form><div class="relation-fields"><label>Source<select name="source">${options(this.draft.source)}</select></label><label>Target<select name="target">${options(this.draft.target)}</select></label><label>Type<select name="type">${adapter.types.map(type=>`<option ${this.draft.type===type?'selected':''}>${esc(type)}</option>`).join('')}</select></label><label>Direction<select name="direction"><option>directed</option><option ${this.draft.direction==='bidirectional'?'selected':''}>bidirectional</option></select></label>${adapter.fields.map(field=>`<label>${esc(field.label)}<input name="${esc(field.name)}" value="${esc(this.draft.fields[field.name]||'')}" dir="ltr"></label>`).join('')}</div><output role="alert"></output><footer><small>${esc(adapter.owner)} · v${adapter.version}</small><button class="btn" type="button" data-relation-close>Cancel</button><button class="btn" type="submit">Apply</button></footer></form>`;
    composer.hidden=false;
    this.place(composer);
    composer.querySelectorAll('[data-relation-close]').forEach(button=>button.onclick=()=>this.close());
    composer.querySelector('form').addEventListener('input',event=>{const form=event.currentTarget,values=Object.fromEntries(new FormData(form));this.draft={...this.draft,source:values.source,target:values.target,type:values.type,direction:values.direction,fields:Object.fromEntries(adapter.fields.map(field=>[field.name,String(values[field.name]||'')]))};});
    composer.querySelector('form').onsubmit=event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.target));try{this.workspace.api.Commands.execute('spatial.relation.commit',{...values,id,expectedVersion:this.draft.expectedVersion});this.close()}catch(error){composer.querySelector('output').textContent=error.message}};
    composer.querySelector('select').focus();
    return clone(this.draft);
  }

  close(focus=true){this.composer.hidden=true;this.draft=null;this.refresh();if(focus){if(this.invoker?.isConnected&&!this.invoker.closest('[hidden]'))this.invoker.focus();else this.spatial.svg.focus()}}
}
