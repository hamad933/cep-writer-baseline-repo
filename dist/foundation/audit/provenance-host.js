const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeAttr=value=>escapeHtml(value).replace(/`/g,'&#96;');
const dirAttr=value=>/^[\x00-\x7F]*$/.test(String(value??''))?'ltr':'auto';
const stateLabel=state=>({READY:'Ready',EMPTY:'Empty',STALE:'Stale',ERROR:'Error',UNAVAILABLE:'Unavailable',CONFLICT:'Conflict'}[state]||state);
const entryMeta=entry=>[entry.kind,entry.actorLabel,entry.timestamp].filter(Boolean);

export const AUDIT_PROVENANCE_HOST_CONTRACT=Object.freeze({
  id:'AuditProvenanceHost',
  owner:'AuditProvenanceInteractionCore',
  presentationOnly:true,
  fixtureIndependent:true,
  dismissesDetailsWithoutDeleting:true
});

export const AUDIT_PROVENANCE_HOST_STYLE=`
.ap-host{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ap-fg,#e8edf5);background:var(--ap-bg,#10151d);border:1px solid var(--ap-border,#273141);border-radius:16px;overflow:hidden;min-width:0;box-shadow:0 18px 44px rgba(0,0,0,.22)}
.ap-host *{box-sizing:border-box}.ap-host button,.ap-host input{font:inherit}.ap-host__top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 20px;border-block-end:1px solid var(--ap-border,#273141);background:linear-gradient(180deg,rgba(255,255,255,.035),transparent)}
.ap-host__eyebrow{margin:0 0 4px;font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--ap-muted,#97a3b6)}.ap-host__title{margin:0;font-size:18px;line-height:1.3}.ap-host__identity{margin:6px 0 0;color:var(--ap-muted,#97a3b6);font-size:13px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.ap-host__identity code{direction:ltr;unicode-bidi:isolate;color:var(--ap-accent,#8dd6ff)}
.ap-host__state{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--ap-border,#273141);border-radius:999px;padding:6px 10px;font-size:12px;white-space:nowrap}.ap-host__state-dot{inline-size:7px;block-size:7px;border-radius:50%;background:var(--ap-state,#77d7b3)}.ap-host[data-state="STALE"] .ap-host__state-dot{background:#f1bd6a}.ap-host[data-state="ERROR"] .ap-host__state-dot,.ap-host[data-state="UNAVAILABLE"] .ap-host__state-dot{background:#f18b8b}.ap-host[data-state="CONFLICT"] .ap-host__state-dot{background:#f1bd6a}.ap-host[data-state="EMPTY"] .ap-host__state-dot{background:#7e8a9c}
.ap-host__toolbar{display:flex;align-items:center;gap:10px;padding:12px 16px;border-block-end:1px solid var(--ap-border,#273141)}.ap-host__search{position:relative;flex:1;min-width:0}.ap-host__search input{inline-size:100%;background:var(--ap-field,#151c26);color:inherit;border:1px solid var(--ap-border,#273141);border-radius:10px;padding:9px 11px;outline:none}.ap-host__search input:focus-visible{border-color:var(--ap-accent,#8dd6ff);box-shadow:0 0 0 3px color-mix(in srgb,var(--ap-accent,#8dd6ff) 22%,transparent)}.ap-host__count{font-size:12px;color:var(--ap-muted,#97a3b6);white-space:nowrap}
.ap-host__notice{margin:0;padding:12px 16px;background:rgba(255,255,255,.025);border-block-end:1px solid var(--ap-border,#273141);color:var(--ap-muted,#97a3b6);font-size:13px}.ap-host__notice strong{color:var(--ap-fg,#e8edf5)}
.ap-host__body{display:grid;grid-template-columns:1fr;min-block-size:420px}.ap-host__body--detail{grid-template-columns:minmax(0,1fr) minmax(300px,.72fr)}.ap-host__list{list-style:none;margin:0;padding:8px;min-width:0}.ap-host__empty{padding:34px 22px;color:var(--ap-muted,#97a3b6);text-align:center}.ap-row{position:relative;margin:0}.ap-row:not(:last-child)::after{content:"";position:absolute;inset-inline-start:25px;inset-block-start:51px;inline-size:1px;block-size:calc(100% - 34px);background:var(--ap-border,#273141)}.ap-row__button{inline-size:100%;text-align:start;display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:start;border:1px solid transparent;background:transparent;color:inherit;border-radius:12px;padding:10px 10px;cursor:pointer;position:relative;z-index:1}.ap-row__button:hover{background:rgba(255,255,255,.035)}.ap-row__button[aria-current="true"]{background:rgba(123,194,238,.09);border-color:color-mix(in srgb,var(--ap-accent,#8dd6ff) 38%,var(--ap-border,#273141))}.ap-row__button:focus-visible,.ap-chip:focus-visible,.ap-detail__close:focus-visible{outline:2px solid var(--ap-accent,#8dd6ff);outline-offset:2px}.ap-row__node{inline-size:14px;block-size:14px;border-radius:50%;background:var(--ap-node,#73859d);margin:5px 0 0 7px;box-shadow:0 0 0 4px var(--ap-bg,#10151d),0 0 0 5px var(--ap-border,#273141)}.ap-row__label{display:block;font-weight:650;line-height:1.35}.ap-row__summary{display:block;margin-block-start:4px;color:var(--ap-muted,#97a3b6);font-size:12px;line-height:1.45}.ap-row__meta{display:flex;flex-wrap:wrap;gap:6px;margin-block-start:7px}.ap-row__meta span{font-size:11px;color:var(--ap-muted,#97a3b6);border:1px solid var(--ap-border,#273141);border-radius:999px;padding:2px 6px}.ap-row__corr{font-size:11px;color:var(--ap-accent,#8dd6ff);direction:ltr;unicode-bidi:isolate;white-space:nowrap;padding-block-start:4px}
.ap-detail{border-inline-start:1px solid var(--ap-border,#273141);background:var(--ap-panel,#0d1219);padding:18px;min-width:0}.ap-detail[hidden]{display:none}.ap-detail__head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ap-detail__head h3{margin:0;font-size:16px}.ap-detail__close{border:1px solid var(--ap-border,#273141);background:transparent;color:inherit;border-radius:9px;inline-size:32px;block-size:32px;cursor:pointer}.ap-detail__section{margin-block-start:18px}.ap-detail__section h4{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--ap-muted,#97a3b6)}.ap-detail__section p{margin:0;color:var(--ap-muted,#97a3b6);font-size:13px;line-height:1.55}.ap-chipset{display:flex;flex-wrap:wrap;gap:7px}.ap-chip{border:1px solid var(--ap-border,#273141);background:rgba(255,255,255,.025);color:inherit;border-radius:999px;padding:5px 8px;font-size:11px;direction:ltr;unicode-bidi:isolate}.ap-chip[data-action]{cursor:pointer}.ap-kv{display:grid;grid-template-columns:minmax(90px,.45fr) minmax(0,1fr);gap:7px 10px;font-size:12px}.ap-kv dt{color:var(--ap-muted,#97a3b6)}.ap-kv dd{margin:0;overflow-wrap:anywhere}.ap-boundary{padding:10px 12px;border:1px dashed var(--ap-border,#273141);border-radius:10px;color:var(--ap-muted,#97a3b6);font-size:11px;line-height:1.5}
@media(max-width:1100px){.ap-host__body--detail{grid-template-columns:1fr}.ap-detail{border-inline-start:0;border-block-start:1px solid var(--ap-border,#273141)}}
@media(max-width:680px){.ap-host__top{padding:15px;flex-direction:column}.ap-host__toolbar{padding-inline:12px}.ap-row__button{grid-template-columns:30px minmax(0,1fr)}.ap-row__corr{grid-column:2}.ap-detail{padding:15px}}
@media(prefers-reduced-motion:reduce){.ap-host *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;

function chips(values,action){
  if(!values?.length)return '<span class="ap-row__summary">None supplied</span>';
  return values.map(value=>action?`<button class="ap-chip" type="button" data-action="${safeAttr(action)}" data-value="${safeAttr(value)}">${escapeHtml(value)}</button>`:`<span class="ap-chip">${escapeHtml(value)}</span>`).join('');
}

function attributesList(attributes){
  const entries=Object.entries(attributes||{});
  if(!entries.length)return '<span class="ap-row__summary">None supplied</span>';
  return `<dl class="ap-kv">${entries.map(([key,value])=>`<dt dir="auto">${escapeHtml(key)}</dt><dd dir="auto">${escapeHtml(typeof value==='string'?value:JSON.stringify(value))}</dd>`).join('')}</dl>`;
}

export class AuditProvenanceHost{
  constructor(root,core,callbacks={}){
    if(!root||typeof root.addEventListener!=='function')throw Error('AUDIT_PROVENANCE_HOST_ROOT_REQUIRED');
    if(!core||typeof core.view!=='function')throw Error('AUDIT_PROVENANCE_HOST_CORE_REQUIRED');
    this.root=root;this.core=core;this.callbacks=callbacks;this.lastTriggerId=null;
    this.onInput=event=>this._input(event);this.onClick=event=>this._click(event);this.onKeyDown=event=>this._keyDown(event);
    this.root.addEventListener('input',this.onInput);this.root.addEventListener('click',this.onClick);this.root.addEventListener('keydown',this.onKeyDown);
  }
  destroy(){this.root.removeEventListener('input',this.onInput);this.root.removeEventListener('click',this.onClick);this.root.removeEventListener('keydown',this.onKeyDown);this.root.replaceChildren();}
  refresh(query={}){this.core.refresh(query);return this.render();}
  render(){
    const view=this.core.view(),identity=view.identity;
    const rows=view.visibleEntries.map(entry=>{
      const meta=entryMeta(entry).map(value=>`<span dir="${dirAttr(value)}">${escapeHtml(value)}</span>`).join('');
      return `<li class="ap-row"><button type="button" class="ap-row__button" data-entry-id="${safeAttr(entry.id)}" aria-current="${entry.selected?'true':'false'}"><span class="ap-row__node" aria-hidden="true"></span><span><span class="ap-row__label" dir="${dirAttr(entry.label)}">${escapeHtml(entry.label)}</span>${entry.summary?`<span class="ap-row__summary" dir="${dirAttr(entry.summary)}">${escapeHtml(entry.summary)}</span>`:''}${meta?`<span class="ap-row__meta">${meta}</span>`:''}</span><span class="ap-row__corr">${entry.correlationIds.length?escapeHtml(entry.correlationIds[0]):''}</span></button></li>`;
    }).join('');
    const selected=view.selected;
    this.root.innerHTML=`<section class="ap-host" data-state="${safeAttr(view.state)}" aria-label="Audit and provenance inspection">
      <style>${AUDIT_PROVENANCE_HOST_STYLE}</style>
      <header class="ap-host__top"><div><p class="ap-host__eyebrow">Audit / Provenance</p><h2 class="ap-host__title">Inspection chain</h2><p class="ap-host__identity">${identity?`<span dir="${dirAttr(identity.label)}">${escapeHtml(identity.label)}</span><code>${escapeHtml(identity.id)}</code>${identity.revision?`<span>rev ${escapeHtml(identity.revision)}</span>`:''}`:'<span>No identity supplied</span>'}</p></div><span class="ap-host__state"><span class="ap-host__state-dot"></span>${escapeHtml(stateLabel(view.state))}</span></header>
      <div class="ap-host__toolbar"><label class="ap-host__search"><span class="ap-host__eyebrow">Filter visible records</span><input data-filter type="search" value="${safeAttr(view.filterText)}" autocomplete="off" aria-label="Filter visible provenance records"></label><span class="ap-host__count">${view.visibleEntries.length} / ${view.entries.length}</span></div>
      ${view.message?`<p class="ap-host__notice" dir="${dirAttr(view.message)}"><strong>${escapeHtml(stateLabel(view.state))}:</strong> ${escapeHtml(view.message)}</p>`:''}
      <div class="ap-host__body${selected?' ap-host__body--detail':''}"><ol class="ap-host__list" aria-label="Provider-supplied provenance records">${rows||`<li class="ap-host__empty">${view.state==='EMPTY'?'No records were supplied by the bound provider.':'No visible records match this local filter.'}</li>`}</ol>
      <aside class="ap-detail" aria-label="Selected provenance record" ${selected?'':'hidden'}>${selected?this._detail(selected):''}</aside></div>
    </section>`;
    return view;
  }
  _detail(entry){
    return `<div class="ap-detail__head"><div><p class="ap-host__eyebrow">Selected record</p><h3 dir="${dirAttr(entry.label)}">${escapeHtml(entry.label)}</h3></div><button class="ap-detail__close" type="button" data-dismiss-detail aria-label="Close record details">×</button></div>
      ${entry.summary?`<div class="ap-detail__section"><h4>Provider summary</h4><p dir="${dirAttr(entry.summary)}">${escapeHtml(entry.summary)}</p></div>`:''}
      <div class="ap-detail__section"><h4>Identity & correlation</h4><div class="ap-chipset"><span class="ap-chip">${escapeHtml(entry.id)}</span>${chips(entry.correlationIds,'correlation')}</div></div>
      <div class="ap-detail__section"><h4>Parent references</h4><div class="ap-chipset">${chips(entry.parentIds)}</div></div>
      <div class="ap-detail__section"><h4>Provenance references</h4><div class="ap-chipset">${chips(entry.provenanceRefs,'provenance')}</div></div>
      <div class="ap-detail__section"><h4>Provider attributes</h4>${attributesList(entry.attributes)}</div>
      <div class="ap-detail__section"><div class="ap-boundary">Inspection only. This Presentation does not assert audit immutability, review authority, causal meaning, or persistence.</div></div>`;
  }
  _input(event){
    if(!event.target?.matches?.('[data-filter]'))return;
    const value=event.target.value;this.core.setFilter(value);this.render();
    const input=this.root.querySelector('[data-filter]');if(input){input.focus();input.setSelectionRange?.(value.length,value.length);}
  }
  _click(event){
    const dismiss=event.target.closest?.('[data-dismiss-detail]');
    if(dismiss){const returnId=this.lastTriggerId||this.core.view().selectedId;this.core.dismissDetails();this.render();this._focusRow(returnId);return;}
    const action=event.target.closest?.('[data-action]');
    if(action){const kind=action.dataset.action,value=action.dataset.value;if(kind==='provenance')this.callbacks.onOpenProvenanceRef?.(value);if(kind==='correlation')this.callbacks.onOpenCorrelation?.(value);return;}
    const row=event.target.closest?.('[data-entry-id]');
    if(row){this.lastTriggerId=row.dataset.entryId;this.core.select(row.dataset.entryId);this.render();this._focusRow(this.lastTriggerId);}
  }
  _keyDown(event){
    const row=event.target.closest?.('[data-entry-id]');
    if(event.key==='Escape'&&this.core.view().selectedId){event.preventDefault();const returnId=this.lastTriggerId||this.core.view().selectedId;this.core.dismissDetails();this.render();this._focusRow(returnId);return;}
    if(!row)return;
    const current=row.dataset.entryId;
    let next=null;
    if(event.key==='ArrowDown')next=this.core.relativeId(current,1);
    if(event.key==='ArrowUp')next=this.core.relativeId(current,-1);
    if(event.key==='Home')next=this.core.edgeId('first');
    if(event.key==='End')next=this.core.edgeId('last');
    if(next){event.preventDefault();this._focusRow(next);return;}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();this.lastTriggerId=current;this.core.select(current);this.render();this._focusRow(current);}
  }
  _focusRow(id){if(!id)return;this.root.querySelector(`[data-entry-id="${CSS.escape(id)}"]`)?.focus();}
}
