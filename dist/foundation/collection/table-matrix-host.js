import {CollectionTableMatrixPresentationCore,COLLECTION_TABLE_MATRIX_OWNER_ID,                                                                     } from './table-matrix.js';
import {TransientHostOwner,TRANSIENT_HOST_OWNER} from '../global/transient-host.js';
import {TRANSIENT_FOCUS_OWNER} from '../global/transient-focus.js';

export const COLLECTION_TABLE_MATRIX_HOST_OWNER_ID='CollectionTableMatrixHost'         ;
export const COLLECTION_TABLE_MATRIX_HOST_CONTRACT={
  owner:COLLECTION_TABLE_MATRIX_HOST_OWNER_ID,
  core:COLLECTION_TABLE_MATRIX_OWNER_ID,
  role:'REUSABLE_PRESENTATION_HOST',
  fixtureProofDoesNotEqualRealConsumer:true,
  dataOwnership:'DOMAIN_ADAPTER_ONLY',
  sharedTransientOwner:TRANSIENT_HOST_OWNER,
  sharedFocusOwner:TRANSIENT_FOCUS_OWNER,
  transientPolicyOwnership:'GLOBAL_G2_ONLY'
}         ;

                                                    
                   
                                                   
                
                            
                                   
                                                                                
                                   
                      
  

const esc=(value       )=>value.replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char] ));
const cssId=(value       )=>value.replace(/[^a-zA-Z0-9_-]/g,'_');
const projectionText=(cell                         )=>`${cell.text}${cell.secondary?` ${cell.secondary}`:''}`;
let hostSequence=0;

export class CollectionTableMatrixHost      {
           core                                            ;
                   root            ;
                   options                                       ;
                   transientHost                   ;
                   transientId       ;
          menuObserver                      =null;
          menuRowId            =null;
          menuTrigger                 =null;
          mounted=false;

  constructor(options                                       ){
    if(!options?.root)throw Error('COLLECTION_HOST_ROOT_REQUIRED');
    if(!options?.transientHost||options.transientHost.owner!==TRANSIENT_HOST_OWNER)throw Error('COLLECTION_SHARED_TRANSIENT_HOST_REQUIRED');
    this.options=options;this.root=options.root;this.transientHost=options.transientHost;this.transientId=options.transientId?.trim()||`collection.table-matrix.row-actions.${++hostSequence}`;this.core=new CollectionTableMatrixPresentationCore(options.adapter);
  }

  mount(){if(this.mounted)return this;ensureStyles();this.mounted=true;this.root.dataset.collectionTableMatrixOwner=COLLECTION_TABLE_MATRIX_HOST_OWNER_ID;this.render();return this;}
  destroy(){this.closeMenu(false,'destroy',true);this.root.replaceChildren();delete this.root.dataset.collectionTableMatrixOwner;this.mounted=false;}
  snapshot(){return this.core.snapshot();}
  setFilter(query       ){this.core.setFilter(query);this.render({preserveFocus:true});return this.snapshot();}

  render({preserveFocus=false}                         ={}){
    const active=preserveFocus?this.activeToken():null;this.closeMenu(false,'rerender',true);
    const s=this.core.snapshot(),columns=this.options.adapter.columns;
    const selectedVisible=s.visibleRowIds.filter(id=>s.selectedRowIds.includes(id)).length;
    this.root.innerHTML=`<section class="ctm-shell" data-density="${this.options.density??'compact'}" aria-label="${esc(this.options.title??'Collection table')}">
      <header class="ctm-toolbar">
        <div class="ctm-heading"><strong>${esc(this.options.title??'Collection')}</strong><span class="ctm-count">${s.visibleRows.length}/${s.totalRows}</span></div>
        <label class="ctm-filter"><span class="ctm-sr">Filter rows</span><input data-ctm-filter type="search" value="${esc(s.filterQuery)}" placeholder="${esc(this.options.filterPlaceholder??'Filter…')}" autocomplete="off"></label>
        <div class="ctm-selection" aria-live="polite">${s.selectedRowIds.length?`${s.selectedRowIds.length} selected`:'No selection'}${selectedVisible!==s.selectedRowIds.length?` · ${selectedVisible} visible`:''}</div>
        <button type="button" class="ctm-clear" data-ctm-clear ${s.selectedRowIds.length?'':'disabled'}>Clear selection</button>
      </header>
      <div class="ctm-scroll" tabindex="0" aria-label="Scrollable collection matrix">
        <table class="ctm-grid" role="grid" aria-rowcount="${s.visibleRows.length+1}" aria-colcount="${columns.length+2}" aria-multiselectable="true">
          <thead><tr role="row"><th class="ctm-select-col" role="columnheader"><input data-ctm-select-all type="checkbox" aria-label="Select all visible rows" ${s.visibleRows.length&&selectedVisible===s.visibleRows.length?'checked':''}></th>${columns.map(c=>`<th role="columnheader" style="${c.width?`width:${esc(c.width)};`:''}${c.minWidth?`min-width:${c.minWidth}px;`:''}" data-align="${c.align??'start'}">${c.compareRows?`<button type="button" class="ctm-sort" data-ctm-sort="${esc(c.id)}" aria-label="Sort by ${esc(c.label)}">${esc(c.label)}${s.sort?.columnId===c.id?` <span aria-hidden="true">${s.sort.direction==='asc'?'↑':'↓'}</span>`:''}</button>`:esc(c.label)}</th>`).join('')}<th class="ctm-actions-col" role="columnheader"><span class="ctm-sr">Row actions</span></th></tr></thead>
          <tbody>${s.visibleRows.map((row,index)=>this.rowHtml(row,index)).join('')}</tbody>
        </table>
        ${s.visibleRows.length?'':`<div class="ctm-empty" role="status">No rows match the current filter.</div>`}
      </div>
      <div class="ctm-live ctm-sr" data-ctm-live aria-live="polite"></div>
      <div class="ctm-menu-layer" data-ctm-menu-layer></div>
    </section>`;
    this.bind();if(active)this.restoreToken(active);else this.syncRovingFocus();
  }

          rowHtml(row     ,index       ){
    const id=this.options.adapter.rowId(row),s=this.core.snapshot(),selected=s.selectedRowIds.includes(id),focused=s.focusedRowId===id,columns=this.options.adapter.columns;
    return `<tr role="row" data-ctm-row="${esc(id)}" aria-selected="${selected}" tabindex="${focused||(!s.focusedRowId&&index===0)?'0':'-1'}">
      <td role="gridcell" class="ctm-select-col"><input data-ctm-check="${esc(id)}" type="checkbox" aria-label="Select ${esc(this.options.adapter.rowLabel(row))}" ${selected?'checked':''}></td>
      ${columns.map(column=>{const cell=this.core.cell(row,column.id);return `<td role="gridcell" data-align="${column.align??'start'}" data-tone="${cell.tone??'default'}" dir="${cell.direction??'auto'}" aria-label="${esc(cell.ariaLabel??projectionText(cell))}"><span class="ctm-primary">${esc(cell.text)}</span>${cell.secondary?`<span class="ctm-secondary">${esc(cell.secondary)}</span>`:''}</td>`}).join('')}
      <td role="gridcell" class="ctm-actions-col"><button type="button" class="ctm-more" data-ctm-menu="${esc(id)}" aria-haspopup="menu" aria-expanded="${this.menuRowId===id}">•••<span class="ctm-sr"> Actions for ${esc(this.options.adapter.rowLabel(row))}</span></button></td>
    </tr>`;
  }

          bind(){
    const filter=this.root.querySelector                  ('[data-ctm-filter]');
    filter?.addEventListener('input',()=>{this.core.setFilter(filter.value);this.render({preserveFocus:true});});
    this.root.querySelector('[data-ctm-clear]')?.addEventListener('click',()=>{this.core.clearSelection();this.announce('Selection cleared');this.render({preserveFocus:true});});
    this.root.querySelector                  ('[data-ctm-select-all]')?.addEventListener('change',event=>{const input=event.currentTarget                    ;if(input.checked)this.core.selectAllVisible();else this.core.clearSelection();this.announce(input.checked?'All visible rows selected':'Selection cleared');this.render({preserveFocus:true});});
    this.root.querySelectorAll                   ('[data-ctm-sort]').forEach(button=>button.addEventListener('click',()=>{this.core.toggleSort(button.dataset.ctmSort );this.render({preserveFocus:true});}));
    this.root.querySelectorAll                  ('[data-ctm-check]').forEach(check=>check.addEventListener('click',event=>{event.stopPropagation();const id=check.dataset.ctmCheck ;if((event              ).shiftKey)this.core.selectRange(id,{additive:(event              ).ctrlKey||(event              ).metaKey});else this.core.toggleSelection(id);this.announce(`${this.core.snapshot().selectedRowIds.length} rows selected`);this.render({preserveFocus:true});}));
    this.root.querySelectorAll             ('[data-ctm-row]').forEach(row=>{
      row.addEventListener('click',event=>{if((event.target               ).closest('button,input,a'))return;const id=row.dataset.ctmRow ;const mouse=event              ;if(mouse.shiftKey)this.core.selectRange(id,{additive:mouse.ctrlKey||mouse.metaKey});else if(mouse.ctrlKey||mouse.metaKey)this.core.toggleSelection(id);else this.core.selectOnly(id);this.render({preserveFocus:true});});
      row.addEventListener('focus',()=>{this.core.focusRow(row.dataset.ctmRow );this.syncRovingFocus();});
      row.addEventListener('keydown',event=>this.onRowKey(event,row.dataset.ctmRow ));
    });
    this.root.querySelectorAll                   ('[data-ctm-menu]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();this.openMenu(button.dataset.ctmMenu ,button);}));
  }

          onRowKey(event              ,rowId       ){
    const mod=event.ctrlKey||event.metaKey;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();this.core.focusRow(rowId);this.core.moveFocus(event.key==='ArrowDown'?1:-1);this.render();this.focusCurrentRow();return;}
    if(event.key==='Home'||event.key==='End'){event.preventDefault();this.core.focusBoundary(event.key==='Home'?'first':'last');this.render();this.focusCurrentRow();return;}
    if(event.key===' '){event.preventDefault();if(event.shiftKey)this.core.selectRange(rowId,{additive:mod});else this.core.toggleSelection(rowId);this.render();this.focusCurrentRow();return;}
    if(mod&&event.key.toLowerCase()==='a'){event.preventDefault();this.core.selectAllVisible();this.render();this.focusCurrentRow();return;}
    if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();const trigger=this.root.querySelector             (`[data-ctm-menu="${CSS.escape(rowId)}"]`);if(trigger)this.openMenu(rowId,trigger);return;}
    if(event.key==='Escape'&&this.core.snapshot().selectedRowIds.length){event.preventDefault();this.core.clearSelection();this.render();this.focusCurrentRow();}
  }

          openMenu(rowId       ,trigger            ){
    const actions=this.core.rowActions(rowId),layer=this.root.querySelector             ('[data-ctm-menu-layer]');if(!layer)return;
    this.closeMenu(false,'replace',true);this.menuRowId=rowId;this.menuTrigger=trigger;
    if(actions.length===0){this.menuRowId=null;this.menuTrigger=null;this.announce('No row actions available');return;}
    layer.innerHTML=`<div class="ctm-menu" role="menu" data-ctm-menu-popover data-transient-owner="${TRANSIENT_HOST_OWNER}" data-focus-owner="${TRANSIENT_FOCUS_OWNER}" hidden>${actions.map(action=>`<button type="button" role="menuitem" data-ctm-action="${esc(action.id)}" ${action.enabled===false?'disabled':''} data-destructive="${action.destructive?'true':'false'}" aria-label="${esc(action.ariaLabel??action.label)}">${esc(action.label)}</button>`).join('')}</div>`;
    trigger.setAttribute('aria-expanded','true');
    const menu=layer.firstElementChild               ;const rect=trigger.getBoundingClientRect(),rootRect=this.root.getBoundingClientRect();const direction=getComputedStyle(this.root).direction;const inlineEndOffset=direction==='rtl'?rect.left-rootRect.left:rootRect.right-rect.right;menu.style.insetInlineEnd=`${Math.max(8,inlineEndOffset)}px`;menu.style.top=`${Math.max(8,rect.bottom-rootRect.top+6)}px`;
    menu.querySelectorAll                   ('[data-ctm-action]').forEach(button=>button.addEventListener('click',async()=>{const row=this.core.rowById(rowId);if(row&&button.dataset.ctmAction&&this.options.onAction)await this.options.onAction({actionId:button.dataset.ctmAction,row,rowId});this.closeMenu(true,'action');}));
    this.menuObserver?.disconnect();this.menuObserver=new MutationObserver(()=>{if(menu.hidden)this.finalizeMenuProjection();});this.menuObserver.observe(menu,{attributes:true,attributeFilter:['hidden']});
    this.transientHost.open({id:this.transientId,element:menu,invoker:trigger,kind:'collection-row-actions',modal:false,outsideDismiss:true,escapeDismiss:true,fallbackFocus:()=>trigger.isConnected?trigger:null});
    queueMicrotask(()=>menu.querySelector                   ('[role=menuitem]:not(:disabled)')?.focus());
  }

  /** Integration route only: policy, ordering, dismissal and focus restoration stay owned by corrected G2. */
  dismissRowActions(reason                              ='explicit',{restore=true}                   ={}){
    if(!this.menuRowId)return false;
    const focus=this.transientHost.snapshot().focus;if((reason==='outside'||reason==='escape')&&focus.top!==this.transientId)return false;
    const closed=reason==='outside'||reason==='escape'?this.transientHost.dismissTop(reason,{restore}):this.transientHost.close(this.transientId,{restore,reason});
    if(closed)this.finalizeMenuProjection();return closed;
  }

          closeMenu(returnFocus        ,reason='explicit',force=false){
    if(!this.menuRowId&&!this.menuTrigger)return false;
    const closed=this.transientHost.close(this.transientId,{restore:returnFocus,reason,force});this.finalizeMenuProjection();return closed;
  }
          finalizeMenuProjection(){
    this.menuObserver?.disconnect();this.menuObserver=null;
    const layer=this.root.querySelector             ('[data-ctm-menu-layer]');if(layer)layer.replaceChildren();
    if(this.menuTrigger)this.menuTrigger.setAttribute('aria-expanded','false');this.menuRowId=null;this.menuTrigger=null;
  }
          announce(message       ){const live=this.root.querySelector             ('[data-ctm-live]');if(live)live.textContent=message;}
          syncRovingFocus(){const focused=this.core.snapshot().focusedRowId;this.root.querySelectorAll             ('[data-ctm-row]').forEach((row,index)=>row.tabIndex=(focused?row.dataset.ctmRow===focused:index===0)?0:-1);}
          focusCurrentRow(){const id=this.core.snapshot().focusedRowId;if(id)this.root.querySelector             (`[data-ctm-row="${CSS.escape(id)}"]`)?.focus();}
          activeToken(){const active=document.activeElement                    ;if(!active||!this.root.contains(active))return null;if(active.matches('[data-ctm-filter]'))return {kind:'filter',value:''};const row=active.closest             ('[data-ctm-row]');if(row)return {kind:'row',value:row.dataset.ctmRow??''};return null;}
          restoreToken(token                           ){if(token.kind==='filter'){this.root.querySelector                  ('[data-ctm-filter]')?.focus();return;}if(token.kind==='row'){const row=this.root.querySelector             (`[data-ctm-row="${CSS.escape(token.value)}"]`);if(row){this.core.focusRow(token.value);this.syncRovingFocus();row.focus();return;}}this.syncRovingFocus();}
}

function ensureStyles(){
  if(document.querySelector('style[data-ctm-owner]'))return;
  const style=document.createElement('style');style.dataset.ctmOwner=COLLECTION_TABLE_MATRIX_HOST_OWNER_ID;style.textContent=`
  .ctm-shell{--ctm-bg:var(--surface,#111827);--ctm-panel:var(--panel,#172033);--ctm-line:var(--border,#31405a);--ctm-text:var(--text,#e7eefb);--ctm-muted:var(--muted,#97a6bd);--ctm-accent:var(--accent,#66d9c8);--ctm-focus:var(--focus,#8ec5ff);position:relative;color:var(--ctm-text);background:var(--ctm-bg);border:1px solid var(--ctm-line);border-radius:14px;overflow:hidden;font:500 13px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif}.ctm-toolbar{display:grid;grid-template-columns:minmax(180px,1fr) minmax(220px,380px) auto auto;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--ctm-line);background:color-mix(in srgb,var(--ctm-panel) 92%,transparent)}.ctm-heading{display:flex;align-items:center;gap:8px;font-size:14px}.ctm-count{color:var(--ctm-muted);font-variant-numeric:tabular-nums}.ctm-filter input{width:100%;min-height:34px;border:1px solid var(--ctm-line);border-radius:8px;background:var(--ctm-bg);color:var(--ctm-text);padding:0 10px}.ctm-filter input:focus-visible,.ctm-shell button:focus-visible,.ctm-shell [data-ctm-row]:focus-visible,.ctm-scroll:focus-visible{outline:2px solid var(--ctm-focus);outline-offset:2px}.ctm-selection{color:var(--ctm-muted);white-space:nowrap}.ctm-clear,.ctm-sort,.ctm-more,.ctm-menu button{font:inherit;color:inherit;background:transparent;border:0}.ctm-clear{border:1px solid var(--ctm-line);border-radius:8px;min-height:32px;padding:0 10px}.ctm-clear:disabled{opacity:.45}.ctm-scroll{overflow:auto;max-height:min(62vh,620px)}.ctm-grid{width:100%;border-collapse:separate;border-spacing:0;min-width:760px;background:var(--ctm-bg)}.ctm-grid th{position:sticky;top:0;z-index:2;background:color-mix(in srgb,var(--ctm-panel) 96%,black 4%);color:var(--ctm-muted);font-weight:650;text-align:start}.ctm-grid th,.ctm-grid td{padding:9px 11px;border-bottom:1px solid color-mix(in srgb,var(--ctm-line) 74%,transparent);vertical-align:middle}.ctm-shell[data-density=compact] .ctm-grid th,.ctm-shell[data-density=compact] .ctm-grid td{padding-block:7px}.ctm-grid tbody tr{background:transparent}.ctm-grid tbody tr:hover{background:color-mix(in srgb,var(--ctm-accent) 6%,transparent)}.ctm-grid tbody tr[aria-selected=true]{background:color-mix(in srgb,var(--ctm-accent) 12%,transparent)}.ctm-grid tbody tr:focus-visible{outline-offset:-2px}.ctm-select-col{width:42px;text-align:center}.ctm-actions-col{width:54px;text-align:center}.ctm-sort{display:inline-flex;align-items:center;gap:5px;font-weight:inherit;cursor:pointer}.ctm-more{width:32px;height:30px;border-radius:7px!important;cursor:pointer}.ctm-more:hover,.ctm-sort:hover{background:color-mix(in srgb,var(--ctm-text) 7%,transparent)}.ctm-primary{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px}.ctm-secondary{display:block;color:var(--ctm-muted);font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px}[data-align=center]{text-align:center}[data-align=end]{text-align:end}[data-tone=muted]{color:var(--ctm-muted)}[data-tone=success]{color:#8de0aa}[data-tone=warning]{color:#f4d27c}[data-tone=danger]{color:#ff9b9b}[data-tone=accent]{color:var(--ctm-accent)}.ctm-empty{padding:40px 20px;text-align:center;color:var(--ctm-muted)}.ctm-menu-layer{position:absolute;inset:0;pointer-events:none;z-index:5}.ctm-menu{position:absolute;min-width:180px;padding:6px;background:var(--ctm-panel);border:1px solid var(--ctm-line);border-radius:10px;box-shadow:0 14px 38px rgba(0,0,0,.35);pointer-events:auto}.ctm-menu button{display:block;width:100%;padding:8px 10px;border-radius:7px;text-align:start;cursor:pointer}.ctm-menu button:hover,.ctm-menu button:focus-visible{background:color-mix(in srgb,var(--ctm-accent) 10%,transparent)}.ctm-menu button[data-destructive=true]{color:#ffaaaa}.ctm-menu button:disabled{opacity:.45;cursor:not-allowed}.ctm-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}@media(max-width:1080px){.ctm-toolbar{grid-template-columns:1fr minmax(180px,320px);}.ctm-selection,.ctm-clear{justify-self:start}.ctm-scroll{max-height:min(58vh,540px)}}@media(prefers-reduced-motion:reduce){.ctm-shell *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}`;
  document.head.append(style);
}
