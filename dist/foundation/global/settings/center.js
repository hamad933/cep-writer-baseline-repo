import {projectSettingsSections,SETTINGS_CENTER_GROUPS,SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT} from './sections.js';
import {searchSettingsSections,normalizeSettingsSearchText,SETTINGS_CENTER_SEARCH_POLICY} from './search.js';

export const SETTINGS_CENTER_OWNER='SettingsCenterOwner';
export const SETTINGS_CENTER_TRANSIENT_ID='global.settings-center';
export const SETTINGS_CENTER_CONTRACT=Object.freeze({
  id:SETTINGS_CENTER_OWNER,
  version:'1.2.0',
  scope:'GLOBAL_PRESENTATION_DISCLOSURE_SEARCH_INTERACTION_ONLY',
  productRole:'GLOBAL_DURABLE_FAMILY_PREFERENCES_AND_DISCOVERABILITY',
  detailsBoundary:'CURRENT_SURFACE_OBJECT_CONTEXT_REMAINS_EXTERNAL',
  domainConfigurationBoundary:'UI_PREFERENCES_NEVER_MUTATE_OPERATIONAL_CONFIGURATION',
  stateClass:'PRESENTATION_ONLY',
  preferenceValueOwner:'ScopedPreferencesOwner',
  preferencePersistenceOwner:'ScopedPreferencesOwner',
  commandOwner:'SemanticCommandBus',
  globalShortcutOwner:'GlobalInputKeymapOwner',
  focusReturnOwner:'TransientFocusOwner',
  familyDescriptorContract:SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT.id,
  searchPolicy:SETTINGS_CENTER_SEARCH_POLICY,
  donorPresentationAnchors:Object.freeze(['#overflowMenu','.preferences-scroll','.prefsection','.transient-panel-head']),
  excludes:Object.freeze(['preference-values','preference-persistence','command-semantics','structured-keyboard-semantics','domain-configuration'])
});

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const keyOf=event=>String(event?.key||event?.code||'');
const prevent=event=>{event?.preventDefault?.();event?.stopPropagation?.();};
const isDirection=value=>value==='rtl'||value==='ltr';
const bool=value=>value===true||value==='true';
const valueToken=value=>typeof value==='string'?value:JSON.stringify(value);

function renderPreferenceControl(item){
  const current=item.value,control=item.control||{};
  if(control.type==='boolean')return `<button type="button" class="btn settings-value-toggle" data-settings-preference="${esc(item.key)}" data-settings-value="${current?'false':'true'}" aria-pressed="${current===true}">${current?'ON':'OFF'}</button>`;
  if(control.type==='number')return `<label class="settings-range"><input type="range" min="${esc(control.min)}" max="${esc(control.max)}" step="${esc(control.step||.05)}" value="${esc(current)}" data-settings-preference-range="${esc(item.key)}"><output>${esc(current)}</output></label>`;
  if(Array.isArray(control.values)&&control.values.length)return `<div class="prefbuttons settings-choice-row" role="radiogroup" aria-label="${esc(item.label)}">${control.values.map(value=>`<button type="button" class="btn" role="radio" data-settings-preference="${esc(item.key)}" data-settings-value="${esc(valueToken(value))}" aria-checked="${String(current===value)}" aria-pressed="${String(current===value)}"><bdi dir="auto">${esc(value)}</bdi></button>`).join('')}</div>`;
  return `<bdi class="settings-read-value" dir="auto">${esc(current)}</bdi>`;
}
function renderItem(item){
  if(item.kind==='preference')return `<li class="settings-item settings-preference-item" data-settings-item="${esc(item.id)}" data-source-owner="${esc(item.sourceOwner)}"><div class="settings-item-copy"><strong>${esc(item.label)}</strong><small><bdi dir="ltr">${esc(item.key)}</bdi> · ${esc(item.sourceScope||'default')}</small></div>${renderPreferenceControl(item)}</li>`;
  if(item.kind==='command')return `<li class="settings-item" data-settings-item="${esc(item.id)}" data-source-owner="${esc(item.commandOwner||item.sourceOwner||'SemanticCommandBus')}"><div class="settings-item-copy"><strong>${esc(item.label)}</strong><small><bdi dir="ltr">${esc(item.commandId)}</bdi>${item.reason?` · ${esc(item.reason)}`:''}</small></div><span class="settings-state" data-state="${item.enabled?'available':'unavailable'}">${item.enabled?'Available':'Unavailable'}</span></li>`;
  return `<li class="settings-item" data-settings-item="${esc(item.id)}" data-source-owner="${esc(item.sourceOwner||item.shortcutOwner||'descriptor')}"><div class="settings-item-copy"><strong>${esc(item.label)}</strong>${item.commandId?`<small><bdi dir="ltr">${esc(item.commandId)}</bdi></small>`:''}</div>${item.chord?`<kbd class="kbd"><bdi dir="ltr">${esc(item.chord)}</bdi></kbd>`:''}</li>`;
}

export class SettingsCenterOwner{
  constructor({preferences,commands,keymap,transientFocus,onClose=null}={}){
    if(!preferences||typeof preferences.resolve!=='function'||typeof preferences.set!=='function')throw Error('SCOPED_PREFERENCES_OWNER_REQUIRED');
    if(!commands||typeof commands.items!=='function')throw Error('SEMANTIC_COMMAND_BUS_REQUIRED');
    if(!keymap||typeof keymap.descriptor!=='function')throw Error('GLOBAL_INPUT_KEYMAP_OWNER_REQUIRED');
    if(!transientFocus||typeof transientFocus.open!=='function'||typeof transientFocus.close!=='function')throw Error('TRANSIENT_FOCUS_OWNER_REQUIRED');
    this.owner=SETTINGS_CENTER_OWNER;this.contract=SETTINGS_CENTER_CONTRACT;
    this.preferences=preferences;this.commands=commands;this.keymap=keymap;this.transientFocus=transientFocus;
    this.presentation={open:false,openSectionId:null,focusedSectionId:null,query:''};this.onClose=typeof onClose==='function'?onClose:null;
    this.sequence=0;this.receipts=[];this.lastProfile=null;this.familySections=[];
  }
  configurePresentation({profile=this.lastProfile||{},familySections=this.familySections}={}){
    this.lastProfile=profile||{};this.familySections=[...(familySections||[])];
    const ids=this.visibleSections(this.lastProfile,this.familySections).map(section=>section.id);
    if(this.presentation.openSectionId&&!ids.includes(this.presentation.openSectionId))this.presentation.openSectionId=ids[0]||null;
    if(!ids.includes(this.presentation.focusedSectionId))this.presentation.focusedSectionId=ids[0]||null;
    return this.snapshot(this.lastProfile,this.familySections);
  }
  sections(profile=this.lastProfile||{},familySections=this.familySections){return projectSettingsSections({preferences:this.preferences,commands:this.commands,keymap:this.keymap,profile,familySections});}
  visibleSections(profile=this.lastProfile||{},familySections=this.familySections){
    const sections=this.sections(profile,familySections),query=this.presentation.query;if(!query)return sections;
    const ids=new Set(this.search(query,profile,familySections).map(row=>row.sectionId));return Object.freeze(sections.filter(section=>ids.has(section.id)));
  }
  groups(profile=this.lastProfile||{},familySections=this.familySections){
    const sections=this.visibleSections(profile,familySections),groups=[];
    for(const group of SETTINGS_CENTER_GROUPS){const children=sections.filter(section=>section.groupId===group.id);if(children.length)groups.push(Object.freeze({id:group.id,label:group.label,order:group.order,sections:Object.freeze(children)}));}
    return Object.freeze(groups);
  }
  direction(){
    const configured=this.preferences.resolve('chromeDirection').preferredValue;
    if(isDirection(configured))return configured;
    return this.preferences.resolve('locale').preferredValue==='ar'?'rtl':'ltr';
  }
  record(detail){const receipt=Object.freeze({sequence:++this.sequence,owner:this.owner,...detail});this.receipts.push(receipt);return receipt;}
  open(invoker=null,{profile=this.lastProfile||{},familySections=this.familySections,element=null,modal=true,outsideDismiss=true}={}){
    this.configurePresentation({profile,familySections});
    if(!this.presentation.open)this.transientFocus.open(SETTINGS_CENTER_TRANSIENT_ID,{kind:'settings-center',invoker,element,modal,outsideDismiss,escapeDismiss:true,onClose:({reason})=>{this.presentation.open=false;this.presentation.openSectionId=null;this.onClose?.(reason);}});
    const visible=this.visibleSections(profile,familySections);this.presentation.open=true;
    if(!visible.some(section=>section.id===this.presentation.focusedSectionId))this.presentation.focusedSectionId=visible[0]?.id||null;
    return this.record({kind:'open',transientId:SETTINGS_CENTER_TRANSIENT_ID,focusReturnOwner:'TransientFocusOwner',focusedSectionId:this.presentation.focusedSectionId,modal:modal===true});
  }
  activate(invoker=null,options={}){if(this.presentation.open)return this.close('second-activation');return this.open(invoker,options);}
  close(reason='explicit'){
    if(!this.presentation.open)return this.record({kind:'close',closed:false,reason,code:'ALREADY_CLOSED'});
    const delegated=this.transientFocus.close(SETTINGS_CENTER_TRANSIENT_ID,{restore:true,reason});
    if(delegated){this.presentation.open=false;this.presentation.openSectionId=null;}
    return this.record({kind:'close',closed:delegated===true,reason,focusReturnOwner:'TransientFocusOwner'});
  }
  setQuery(query=''){
    this.presentation.query=normalizeSettingsSearchText(query);const first=this.search(this.presentation.query)?.[0]?.sectionId||null;
    if(this.presentation.query){this.presentation.openSectionId=first;this.presentation.focusedSectionId=first;}else if(!this.presentation.focusedSectionId)this.presentation.focusedSectionId=this.sections()?.[0]?.id||null;
    return this.record({kind:'search-query',query:this.presentation.query,openSectionId:this.presentation.openSectionId});
  }
  search(query=this.presentation.query,profile=this.lastProfile||{},familySections=this.familySections){return searchSettingsSections(this.sections(profile,familySections),query);}
  setPreference(key,value,{scope='global'}={}){
    const resolved=this.preferences.resolve(key),safeDefault=resolved.safeDefault;let next=value;
    if(typeof safeDefault==='boolean')next=bool(value);else if(typeof safeDefault==='number')next=Number(value);
    const result=this.preferences.set(key,next,scope);return this.record({kind:'preference-delegated-set',key,value:next,scope,valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner',storageResult:result});
  }
  toggleSection(sectionId,profile=this.lastProfile||{},familySections=this.familySections){
    const sections=this.visibleSections(profile,familySections);if(!sections.some(section=>section.id===sectionId))throw Error('SETTINGS_SECTION_NOT_APPLICABLE:'+sectionId);
    const previous=this.presentation.openSectionId;this.presentation.openSectionId=previous===sectionId?null:sectionId;this.presentation.focusedSectionId=sectionId;
    return this.record({kind:'disclosure',from:previous,to:this.presentation.openSectionId,oneOpen:true});
  }
  handleDisclosureKey(event={},profile=this.lastProfile||{},familySections=this.familySections){
    const ids=this.visibleSections(profile,familySections).map(section=>section.id);if(!ids.length)return {handled:false,code:'NO_VISIBLE_SECTIONS',owner:this.owner};
    let index=Math.max(0,ids.indexOf(this.presentation.focusedSectionId));const key=keyOf(event);
    if(key==='ArrowDown'){index=(index+1)%ids.length;this.presentation.focusedSectionId=ids[index];prevent(event);return {handled:true,code:'FOCUS_NEXT',focusSectionId:ids[index],owner:this.owner};}
    if(key==='ArrowUp'){index=(index-1+ids.length)%ids.length;this.presentation.focusedSectionId=ids[index];prevent(event);return {handled:true,code:'FOCUS_PREVIOUS',focusSectionId:ids[index],owner:this.owner};}
    if(key==='Home'){this.presentation.focusedSectionId=ids[0];prevent(event);return {handled:true,code:'FOCUS_FIRST',focusSectionId:ids[0],owner:this.owner};}
    if(key==='End'){this.presentation.focusedSectionId=ids.at(-1);prevent(event);return {handled:true,code:'FOCUS_LAST',focusSectionId:ids.at(-1),owner:this.owner};}
    if(key==='Enter'||key===' '||key==='Spacebar'){const sectionId=this.presentation.focusedSectionId||ids[0];prevent(event);const receipt=this.toggleSection(sectionId,profile,familySections);return {handled:true,code:'DISCLOSURE_TOGGLED',focusSectionId:sectionId,openSectionId:this.presentation.openSectionId,owner:this.owner,receipt};}
    return {handled:false,code:'KEY_NOT_OWNED',owner:this.owner};
  }
  snapshot(profile=this.lastProfile||{},familySections=this.familySections){
    const groups=this.groups(profile,familySections);
    return {owner:this.owner,contract:this.contract,presentation:{...this.presentation,direction:this.direction()},groups,search:this.search(this.presentation.query,profile,familySections)};
  }
  render(profile=this.lastProfile||{},familySections=this.familySections,{embedded=false}={}){
    const groups=this.groups(profile,familySections),direction=this.direction(),focused=this.presentation.focusedSectionId,query=this.presentation.query;
    const body=groups.map(group=>`<section class="settings-center-group" data-settings-group="${esc(group.id)}"><h2 class="settings-center-group-title">${esc(group.label)}</h2>${group.sections.map(section=>{const open=this.presentation.openSectionId===section.id;const panelId=`settings-panel-${section.id.replace(/[^a-z0-9_-]/gi,'-')}`;const items=section.items.map(renderItem).join('');return `<section class="prefsection settings-center-section" data-pref-section="${esc(section.id)}" data-settings-section="${esc(section.id)}" data-open="${open}"><button type="button" class="preftitle prefsection-toggle" data-settings-disclosure="${esc(section.id)}" aria-expanded="${open}" aria-controls="${esc(panelId)}" tabindex="${focused===section.id?'0':'-1'}"><span class="prefsection-icon" aria-hidden="true">•</span><span class="prefsection-copy"><strong>${esc(section.label)}</strong><small>${esc(section.description||section.groupLabel||'Preference group')}</small></span><span class="prefsection-chev" aria-hidden="true">›</span></button><div class="prefsection-body" id="${esc(panelId)}" role="region" aria-label="${esc(section.label)}"${open?'':' hidden'}><ul class="settings-item-list">${items||'<li class="settings-empty">No applicable items</li>'}</ul></div></section>`}).join('')}</section>`).join('');
    const inner=`<div class="transient-panel-head"><strong id="settings-center-title">Settings / التفضيلات</strong><button type="button" class="btn iconbtn" data-action="close-settings-panel" aria-label="Close settings / إغلاق الإعدادات">×</button></div><div class="settings-search-row"><label><span class="sr">Search settings</span><input type="search" data-settings-search value="${esc(query)}" placeholder="Search settings / بحث الإعدادات" autocomplete="off"></label>${query?`<span class="settings-search-count" aria-live="polite">${this.search(query,profile,familySections).length} matches</span>`:''}</div><div class="preferences-scroll" aria-label="Grouped settings" role="region" tabindex="0">${body||'<p class="settings-empty">No matching settings.</p>'}</div>`;
    if(embedded)return inner;
    return `<aside class="settings-center" role="dialog" aria-modal="true" aria-labelledby="settings-center-title" data-settings-center-owner="${SETTINGS_CENTER_OWNER}" dir="${direction}">${inner}</aside>`;
  }
}
