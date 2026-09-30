import {projectSettingsSections,SETTINGS_CENTER_GROUPS,SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT} from './sections.js';
import {searchSettingsSections,normalizeSettingsSearchText,SETTINGS_CENTER_SEARCH_POLICY} from './search.js';
import {SETTINGS_GROUP_LABELS,SETTINGS_GROUP_NOTES,SETTINGS_SECTION_LABELS,SETTINGS_SECTION_DESCRIPTIONS,PREFERENCE_LABELS,SETTINGS_COPY,preferenceValueLabel,type Bilingual} from './labels.js';
import {resolveActiveLocale,resolveActiveDirection,systemLocaleSource,LANGUAGE_POLICY_OWNER} from '../preferences/language-policy.js';

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
  sc011PreferenceTransferActionHome:'settings.transfer',
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

/* Presentation-only localisation. The section/group/preference MODEL stays English + stable
   (contracts and tests bind to those ids/labels); every user-visible string is resolved here. */
const localeOf=locale=>locale==='en'?'en':'ar';
const L=(value:Bilingual|null|undefined,locale:'ar'|'en')=>value?value[locale]:'';
const sectionLabel=(id,fallback,locale)=>L(SETTINGS_SECTION_LABELS[id],locale)||String(fallback||id);
const sectionNote=(id,fallback,locale)=>L(SETTINGS_SECTION_DESCRIPTIONS[id],locale)||String(fallback||'');
const preferenceLabel=(key,fallback,locale)=>L(PREFERENCE_LABELS[key],locale)||String(fallback||key);
/** Keys rendered in the always-visible language/direction block; suppressed inside their sections
    so each preference still has EXACTLY ONE control instance (one action home, one value owner). */
const LANGUAGE_BLOCK_KEYS=Object.freeze(['locale','chromeDirection']);

function renderPreferenceControl(item,locale:'ar'|'en'){
  const current=item.value,control=item.control||{};
  const optionLabel=token=>preferenceValueLabel(item.key,locale,token);
  if(control.type==='boolean')return `<button type="button" class="btn settings-value-toggle" data-settings-preference="${esc(item.key)}" data-settings-value="${current?'false':'true'}" aria-pressed="${current===true}">${preferenceValueLabel(item.key,locale,current)}</button>`;
  if(control.type==='number')return `<label class="settings-range"><input type="range" min="${esc(control.min)}" max="${esc(control.max)}" step="${esc(control.step||.05)}" value="${esc(current)}" data-settings-preference-range="${esc(item.key)}"><output>${esc(current)}</output></label>`;
  if(Array.isArray(control.values)&&control.values.length)return `<div class="prefbuttons settings-choice-row" role="radiogroup" aria-label="${esc(preferenceLabel(item.key,item.label,locale))}">${control.values.map(value=>`<button type="button" class="btn" role="radio" data-settings-preference="${esc(item.key)}" data-settings-value="${esc(valueToken(value))}" aria-checked="${String(current===value)}" aria-pressed="${String(current===value)}"><bdi dir="auto">${esc(optionLabel(value))}</bdi></button>`).join('')}</div>`;
  return `<bdi class="settings-read-value" dir="auto">${esc(preferenceValueLabel(item.key,locale,current))}</bdi>`;
}
function renderItem(item,locale:'ar'|'en',scopeLabel=(item)=>esc(item.sourceScope||'default')){
  if(item.kind==='preference')return `<li class="settings-item settings-preference-item" data-settings-item="${esc(item.id)}" data-source-owner="${esc(item.sourceOwner)}"><div class="settings-item-copy"><strong>${esc(preferenceLabel(item.key,item.label,locale))}</strong><small><bdi dir="ltr">${esc(item.key)}</bdi> · ${scopeLabel(item)}</small></div>${renderPreferenceControl(item,locale)}</li>`;
  if(item.kind==='command')return `<li class="settings-item" data-settings-item="${esc(item.id)}" data-source-owner="${esc(item.commandOwner||item.sourceOwner||'SemanticCommandBus')}"><div class="settings-item-copy"><strong>${esc(item.label)}</strong><small><bdi dir="ltr">${esc(item.commandId)}</bdi>${item.reason?` · ${esc(item.reason)}`:''}</small></div><span class="settings-state" data-state="${item.enabled?'available':'unavailable'}">${item.enabled?(locale==='ar'?'متاح':'Available'):(locale==='ar'?'غير متاح':'Unavailable')}</span></li>`;
  if(item.kind==='preference-transfer-action')return `<li class="settings-item settings-transfer-action-item" data-settings-item="${esc(item.id)}" data-source-owner="${SETTINGS_CENTER_OWNER}" data-delegates-to="${esc(item.delegatesTo)}"><div class="settings-item-copy"><strong>${esc(item.label)}</strong><small><bdi dir="ltr">${esc(item.actionId)}</bdi> · ${esc(item.delegatesTo)}</small></div><button type="button" class="btn" data-settings-action="${esc(item.actionId)}">${esc(item.actionLabel||item.label)}</button></li>`;
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
  transferSections(){
    const preferences=this.preferences;
    if(typeof preferences.export!=='function'||typeof preferences.import!=='function'||typeof preferences.reset!=='function')return Object.freeze([]);
    const group=SETTINGS_CENTER_GROUPS.find(entry=>entry.id==='settings');
    const action=(actionId,label,actionLabel,order)=>Object.freeze({id:`preference-transfer:${actionId.split('.').at(-1)}`,kind:'preference-transfer-action',actionId,actionLabel,label,delegatesTo:'ScopedPreferencesOwner',sourceOwner:SETTINGS_CENTER_OWNER,order,searchableText:`${label} ${actionId} export import reset preferences data`});
    return Object.freeze([Object.freeze({
      contract:SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT,
      id:SETTINGS_CENTER_CONTRACT.sc011PreferenceTransferActionHome,
      groupId:'settings',groupLabel:group.label,groupOrder:group.order,
      label:'Export / import / reset',order:30,sourceKind:'preference-transfer',sourceOwner:SETTINGS_CENTER_OWNER,
      preferenceValueOwner:'ScopedPreferencesOwner',preferencePersistenceOwner:'ScopedPreferencesOwner',structuredOnly:false,
      items:Object.freeze([
        action('settings.preferences.export','Export preferences','Export',10),
        action('settings.preferences.import','Import preferences','Import',20),
        action('settings.preferences.reset','Reset preferences to defaults','Reset',30)
      ])
    })]);
  }
  sections(profile=this.lastProfile||{},familySections=this.familySections){
    const base=projectSettingsSections({preferences:this.preferences,commands:this.commands,keymap:this.keymap,profile,familySections});
    return Object.freeze([...base,...this.transferSections()].sort((a,b)=>a.groupOrder-b.groupOrder||a.order-b.order||a.id.localeCompare(b.id)));
  }
  visibleSections(profile=this.lastProfile||{},familySections=this.familySections){
    const sections=this.sections(profile,familySections),query=this.presentation.query;if(!query)return sections;
    const ids=new Set(this.search(query,profile,familySections).map(row=>row.sectionId));return Object.freeze(sections.filter(section=>ids.has(section.id)));
  }
  groups(profile=this.lastProfile||{},familySections=this.familySections){
    const sections=this.visibleSections(profile,familySections),groups=[];
    for(const group of SETTINGS_CENTER_GROUPS){const children=sections.filter(section=>section.groupId===group.id);if(children.length)groups.push(Object.freeze({id:group.id,label:group.label,order:group.order,sections:Object.freeze(children)}));}
    return Object.freeze(groups);
  }
  /** Direction of this panel. Never hardcoded: chrome pin → active locale → browsing context. */
  direction(){
    return resolveActiveDirection(this.preferences).direction;
  }
  /** Single-language/direction authority projection used by the panel header and by W05 evidence. */
  languagePolicy(){
    const locale=resolveActiveLocale(this.preferences),direction=resolveActiveDirection(this.preferences),environment=systemLocaleSource();
    return {
      owner:LANGUAGE_POLICY_OWNER,locale:locale.locale,direction:direction.direction,
      localeSource:locale.source,localeSourceScope:locale.sourceScope,directionSource:direction.source,
      environmentLocale:environment.locale,environmentSource:environment.source,
      productLanguageAuthority:null,privilegedProductLanguage:null,
      shellAuthority:'ACTIVE_LANGUAGE_PREFERENCE',supportedLocales:['ar','en']
    };
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
  exportPreferences(){
    try{
      const data=this.preferences.export();
      return this.record({kind:'preference-transfer',action:'export',actionId:'settings.preferences.export',ok:true,code:'EXPORTED',schemaVersion:data.schemaVersion,transferKind:data.kind,scopeCount:Object.keys(data.overrides||{}).length,valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner',durablePersistenceClaim:false,data});
    }catch(error){
      return this.record({kind:'preference-transfer',action:'export',actionId:'settings.preferences.export',ok:false,code:'EXPORT_FAILED',error:String(error?.message||error)});
    }
  }
  importPreferences(snapshot){
    const before=this.preferences.export();
    try{this.preferences.import(snapshot);}catch(error){return this.record({kind:'preference-transfer',action:'import',actionId:'settings.preferences.import',ok:false,code:'IMPORT_REJECTED',error:String(error?.message||error),overridesUnchanged:true,valueOwner:'ScopedPreferencesOwner'});}
    const settled=this.preferences.save(),changed=JSON.stringify(before)!==JSON.stringify(this.preferences.export());
    return this.record({kind:'preference-transfer',action:'import',actionId:'settings.preferences.import',ok:settled.ok===true,code:settled.code||'PERSISTED',changed,durable:settled.ok===true&&settled.durable===true,error:settled.error||null,storageResult:settled,valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner'});
  }
  resetPreferences(){
    const snapshot=this.preferences.export(),entries=[];
    for(const [scope,values] of Object.entries(snapshot.overrides||{}))for(const key of Object.keys(values||{}))entries.push([scope,key]);
    const durableBefore=this.preferences.storageStatus?.().durable===true;
    if(!entries.length)return this.record({kind:'preference-transfer',action:'reset',actionId:'settings.preferences.reset',ok:true,code:'NOTHING_TO_RESET',resetCount:0,durable:durableBefore,valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner'});
    let settled=null;
    for(const [scope,key] of entries)settled=this.preferences.reset(key,scope);
    settled=settled||this.preferences.save();
    return this.record({kind:'preference-transfer',action:'reset',actionId:'settings.preferences.reset',ok:settled.ok===true,code:settled.code||'PERSISTED',resetCount:entries.length,durable:settled.ok===true&&settled.durable===true,error:settled.error||null,storageResult:settled,valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner'});
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
  /** Always-visible Language & direction block. One control per preference — no second action home. */
  languageBlock(profile=this.lastProfile||{},familySections=this.familySections,locale:'ar'|'en'='ar'){
    const found=new Map();
    for(const section of this.sections(profile,familySections)){
      for(const item of section.items||[]){
        if(item.kind==='preference'&&LANGUAGE_BLOCK_KEYS.includes(item.key))found.set(item.key,{section,item});
      }
    }
    const entries=LANGUAGE_BLOCK_KEYS.map(key=>found.get(key)).filter(Boolean);
    if(!entries.length)return '';
    const policy=this.languagePolicy();
    const authority=locale==='ar'
      ?(policy.localeSource==='user-preference'?'اخترته أنت':'لغة جهازك — لا سلطة لغوية للمنتج')
      :(policy.localeSource==='user-preference'?'Set by you':'Your device language — no product-language authority');
    const scope=locale==='ar'?`النطاق ${policy.localeSourceScope}`:`scope ${policy.localeSourceScope}`;
    return `<section class="settings-language-block" data-settings-language-block data-language-authority="${esc(policy.localeSource)}" data-direction-authority="${esc(policy.directionSource)}" aria-label="${esc(L(SETTINGS_GROUP_LABELS.preferences,locale))} · ${esc(L({ar:'اللغة والاتجاه',en:'Language & direction'},locale))}">
<header class="settings-language-head"><span class="settings-eyebrow">${esc(L({ar:'سلطة اللغة والاتجاه',en:'Language & direction authority'},locale))}</span><h2>${esc(L({ar:'اللغة والاتجاه',en:'Language & direction'},locale))}</h2><p>${esc(L({ar:'العربية والإنجليزية لغتان أوليتان متكافئتان. لا يوجد افتراض لغوي للمنتج: يلتقط CEP لغة جهازك حتى تختار بنفسك، والاتجاه يتبع اختيارك.',en:'Arabic and English are both first-class and equal. CEP has no product-language default: it follows your device language until you choose for yourself, and direction follows that choice.'},locale))}</p></header>
<div class="settings-language-fields">${entries.map(({item})=>`<div class="settings-field" data-settings-field="${esc(item.key)}"><span class="settings-field-label" id="settings-field-${esc(item.key)}">${esc(preferenceLabel(item.key,item.label,locale))}</span>${renderPreferenceControl(item,locale)}</div>`).join('')}</div>
<div class="settings-language-state"><span class="settings-chip" data-chip="locale"><bdi dir="ltr">${esc(policy.locale)}</bdi> ${esc(policy.locale==='ar'?'العربية':'English')}</span><span class="settings-chip" data-chip="direction"><bdi dir="ltr">${esc(policy.direction.toUpperCase())}</bdi></span><span class="settings-chip settings-chip-quiet" data-chip="authority">${esc(authority)} · ${esc(scope)}</span></div>
</section>`;
  }
  valueSummary(section,items,locale:'ar'|'en'){
    if(section.sourceKind==='preferences'){
      const pairs=items.filter(item=>item.kind==='preference').slice(0,3).map(item=>`${preferenceLabel(item.key,item.label,locale)}: ${preferenceValueLabel(item.key,locale,item.value)}`);
      if(!pairs.length)return '';
      const more=items.filter(item=>item.kind==='preference').length-3;
      return pairs.join(' · ')+(more>0?(locale==='ar'?` · +${more} أخرى`:` · +${more} more`):'');
    }
    if(section.sourceKind==='commands'){
      const total=(section.items||[]).length,available=(section.items||[]).filter(item=>item.enabled).length;
      return locale==='ar'?`${total} أمر · ${available} متاح`:`${total} commands · ${available} available`;
    }
    if(section.sourceKind==='preference-transfer'){
      const count=(section.items||[]).length;
      return locale==='ar'?`${count} إجراءات تُنفَّذ عبر SettingsCenterOwner`:`${count} actions executed through SettingsCenterOwner`;
    }
    const count=(section.items||[]).length;
    return locale==='ar'?`${count} ${section.sourceKind==='global-shortcuts'?'اختصار عام':'عنصر'}`:`${count} ${section.sourceKind==='global-shortcuts'?'global shortcuts':'items'}`;
  }
  render(profile=this.lastProfile||{},familySections=this.familySections,{embedded=false}={}){
    const groups=this.groups(profile,familySections),direction=this.direction(),focused=this.presentation.focusedSectionId,query=this.presentation.query;
    const policy=this.languagePolicy(),locale: 'ar'|'en' = localeOf(policy.locale);
    const body=groups.map(group=>`<section class="settings-center-group" data-settings-group="${esc(group.id)}"><h2 class="settings-center-group-title">${esc(L(SETTINGS_GROUP_LABELS[group.id],locale)||group.label)}</h2><p class="settings-center-group-note">${esc(L(SETTINGS_GROUP_NOTES[group.id],locale)||'')}</p>${group.sections.map(section=>{
      const open=this.presentation.openSectionId===section.id;
      const panelId=`settings-panel-${section.id.replace(/[^a-z0-9_-]/gi,'-')}`;
      const items=(section.items||[]).filter(item=>!(item.kind==='preference'&&LANGUAGE_BLOCK_KEYS.includes(item.key)));
      const summary=this.valueSummary(section,items,locale);
      const label=sectionLabel(section.id,section.label,locale),note=sectionNote(section.id,section.description||section.groupLabel||'',locale);
      return `<section class="prefsection settings-center-section" data-pref-section="${esc(section.id)}" data-settings-section="${esc(section.id)}" data-open="${open}" data-source-owner="${esc(section.sourceOwner)}"><button type="button" class="preftitle prefsection-toggle" data-settings-disclosure="${esc(section.id)}" aria-expanded="${open}" aria-controls="${esc(panelId)}" tabindex="${focused===section.id?'0':'-1'}"><span class="prefsection-icon" aria-hidden="true">•</span><span class="prefsection-copy"><strong>${esc(label)}</strong><small>${esc(note)}</small>${summary?`<em class="prefsection-values" dir="auto">${esc(summary)}</em>`:''}</span><span class="prefsection-chev" aria-hidden="true">›</span></button><div class="prefsection-body" id="${esc(panelId)}" role="region" aria-label="${esc(label)}"${open?'':' hidden'}><ul class="settings-item-list">${items.map(item=>renderItem(item,locale)).join('')||`<li class="settings-empty">${esc(L(SETTINGS_COPY.noItems,locale))}</li>`}</ul></div></section>`;
    }).join('')}</section>`).join('');
    const storage=(()=>{try{return this.preferences.storageStatus?.()||null}catch{return null}})();
    const transferCount=Array.isArray(this.receipts)?this.receipts.filter(r=>r?.kind==='preference-transfer').length:0;
    const lastTransfer=this.receipts?.filter(r=>r?.kind==='preference-transfer').at(-1)?.code||'NONE';
    const foot=`<footer class="settings-foot" data-settings-foot data-settings-foot-owner="SettingsCenterOwner"><div class="settings-foot-row"><span>${esc(L(SETTINGS_COPY.footValueOwner,locale))}</span><bdi dir="ltr">ScopedPreferencesOwner</bdi></div><div class="settings-foot-row"><span>${esc(L(SETTINGS_COPY.footPersistence,locale))}</span><bdi dir="ltr">${storage?(storage.durable?'PERSISTED':storage.available?'MEMORY_ONLY':'UNAVAILABLE'):'UNAVAILABLE'}</bdi></div><div class="settings-foot-row"><span>${esc(L(SETTINGS_COPY.footLanguageAuthority,locale))}</span><bdi dir="ltr">${esc(policy.localeSource)}</bdi></div><div class="settings-foot-row"><span>${esc(L(SETTINGS_COPY.footTransfer,locale))}</span><bdi dir="ltr">${transferCount} · ${esc(lastTransfer)}</bdi></div></footer>`;
    const languageBlock=this.languageBlock(profile,familySections,locale);
    const inner=`<header class="transient-panel-head settings-head"><div class="settings-head-copy"><strong id="settings-center-title">${esc(L(SETTINGS_COPY.title,locale))}</strong><small>${esc(L(SETTINGS_COPY.subtitle,locale))}</small></div><button type="button" class="btn iconbtn" data-action="close-settings-panel" aria-label="${esc(L(SETTINGS_COPY.close,locale))}">×</button></header>
<div class="settings-search-row"><label><span class="sr">${esc(L(SETTINGS_COPY.searchPlaceholder,locale))}</span><input type="search" data-settings-search value="${esc(query)}" placeholder="${esc(L(SETTINGS_COPY.searchPlaceholder,locale))}" autocomplete="off"></label>${query?`<span class="settings-search-count" aria-live="polite">${this.search(query,profile,familySections).length} ${esc(L(SETTINGS_COPY.searchCount,locale))}</span>`:''}</div>
${languageBlock}
<div class="preferences-scroll" aria-label="Grouped settings" role="region" tabindex="0">${body||`<p class="settings-empty">${esc(L(SETTINGS_COPY.noResults,locale))}</p>`}</div>
${foot}`;
    if(embedded)return inner;
    return `<aside class="settings-center" role="dialog" aria-modal="true" aria-labelledby="settings-center-title" data-settings-center-owner="${SETTINGS_CENTER_OWNER}" data-language-policy-owner="${LANGUAGE_POLICY_OWNER}" dir="${direction}">${inner}</aside>`;
  }
}
