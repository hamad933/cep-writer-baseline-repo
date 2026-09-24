import {PREFERENCE_DEFINITIONS} from '../preferences/schema.js';
export const SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'SettingsCenterSectionDescriptor',
  version:'1.0.0',
  stateClass:'PRESENTATION_DESCRIPTOR_ONLY',
  valueAuthority:'ScopedPreferencesOwner',
  commandAuthority:'SemanticCommandBus',
  shortcutAuthorities:Object.freeze(['GlobalInputKeymapOwner','family-keymap-descriptor'])
});

export const SETTINGS_CENTER_GROUPS=Object.freeze([
  Object.freeze({id:'preferences',label:'Preferences',order:10}),
  Object.freeze({id:'settings',label:'Settings',order:20}),
  Object.freeze({id:'commands',label:'Commands',order:30}),
  Object.freeze({id:'editor-shortcuts',label:'Editor Shortcuts',order:40,structuredOnly:true}),
  Object.freeze({id:'shortcuts',label:'Shortcuts',order:50})
]);

// Central presentation catalog only. No values, persistence or command semantics live here.
export const SETTINGS_CENTER_SECTION_CATALOG=Object.freeze([
  Object.freeze({id:'preferences.appearance',groupId:'preferences',label:'Appearance & access',order:10,sourceKind:'preferences',keys:Object.freeze(['locale','theme','density','scale','font','highContrast','motion'])}),
  Object.freeze({id:'preferences.editor',groupId:'preferences',label:'Editor preferences',order:20,sourceKind:'preferences',structuredOnly:true,keys:Object.freeze(['contentDirection','alignment','documentWidth','customWidth','emptyBlockDirection','clipboardMode','richPaste','codeSyntax','codeLineNumbers','codeWrap','codeFocusLines','codeShowCopyControls','defaultBlockDirection','defaultBlockType','autosave','recoveryEnabled','focusOnInput','focusOnCommandRail','focusOnBlockSelection','deleteConfirmation','disclosureMode'])}),
  Object.freeze({id:'settings.general',groupId:'settings',label:'General',order:10,sourceKind:'preferences',keys:Object.freeze(['guidance','focusIndicators','themeBehavior','systemDarkTheme'])}),
  Object.freeze({id:'settings.layout',groupId:'settings',label:'Layout',order:20,sourceKind:'preferences',keys:Object.freeze(['chromeDirection','toolbar','toolbarOrder','left','right'])}),
  Object.freeze({id:'commands.catalog',groupId:'commands',label:'Command catalog',order:10,sourceKind:'commands'}),
  Object.freeze({id:'shortcuts.global',groupId:'shortcuts',label:'Global shortcuts',order:10,sourceKind:'global-shortcuts'})
]);

const clone=value=>structuredClone(value);
const asText=value=>value===null||value===undefined?'':String(value);
const titleFromKey=key=>String(key).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
const groupById=id=>SETTINGS_CENTER_GROUPS.find(group=>group.id===id)||null;
export const settingsProfileSupportsStructuredEditor=profile=>profile?.family==='structured'&&profile?.capabilities?.structuredEditor!==false;
const profileExplicitlyMatchesFamily=(profile,family)=>!family||(typeof profile?.family==='string'&&profile.family===family);
const applicable=(descriptor,profile)=>profileExplicitlyMatchesFamily(profile,descriptor.family)&&(!descriptor.structuredOnly||settingsProfileSupportsStructuredEditor(profile));
const stableSectionSort=(a,b)=>a.groupOrder-b.groupOrder||a.order-b.order||a.id.localeCompare(b.id);

function preferenceItems(descriptor,preferences,profile){
  const items=[];
  for(const key of descriptor.keys||[]){
    let applies=true;
    try{applies=typeof preferences.isApplicable==='function'?preferences.isApplicable(key,{...(preferences.context||{}),family:profile?.family||preferences.context?.family||'global'}):true;}catch{applies=false;}
    if(!applies)continue;
    const resolved=preferences.resolve(key);
    items.push(Object.freeze({
      id:`preference:${key}`,
      kind:'preference',
      key,
      label:titleFromKey(key),
      value:clone(resolved.preferredValue),
      effectiveValue:clone(resolved.effectiveValue),
      sourceScope:resolved.sourceScope,
      sourceOwner:resolved.applicabilityOwner||'ScopedPreferencesOwner',
      valueOwner:'ScopedPreferencesOwner',
      persistenceOwner:resolved.persistenceOwner||'ScopedPreferencesOwner',
      control:Object.freeze({type:typeof PREFERENCE_DEFINITIONS[key]?.safeDefault,values:PREFERENCE_DEFINITIONS[key]?.values?Object.freeze([...PREFERENCE_DEFINITIONS[key].values]):null,min:PREFERENCE_DEFINITIONS[key]?.min??null,max:PREFERENCE_DEFINITIONS[key]?.max??null,step:typeof PREFERENCE_DEFINITIONS[key]?.safeDefault==='number'?(key==='scale'?.05:20):null}),
      searchableText:`${key} ${titleFromKey(key)} ${asText(resolved.preferredValue)}`
    }));
  }
  return items;
}

function commandItems(commands,profile){
  return commands.items({route:'settings-center-read',family:profile?.family||null}).map((command,index)=>Object.freeze({
    id:`command:${command.id}`,
    kind:'command',
    commandId:command.id,
    label:command.label||command.id,
    enabled:command.enabled===true,
    reason:command.reason||'',
    commandOwner:command.commandOwner||command.owner||null,
    availabilityOwner:command.availabilityOwner||command.owner||null,
    order:index,
    interaction:'DISCOVERABILITY_ONLY',
    searchableText:`${command.id} ${command.label||''} ${command.owner||''}`
  }));
}

function globalShortcutItems(keymap,commands,profile){
  const descriptor=keymap.descriptor();
  const labels=new Map(commands.items({route:'settings-center-read',family:profile?.family||null}).map(item=>[item.id,item.label||item.id]));
  return (descriptor.globalBindings||[]).map((binding,index)=>Object.freeze({
    id:`shortcut:${binding.id}`,
    kind:'shortcut',
    label:labels.get(binding.commandId)||binding.commandId,
    chord:binding.chord,
    commandId:binding.commandId,
    shortcutOwner:descriptor.owner||descriptor.contract?.owner||'GlobalInputKeymapOwner',
    semanticOwner:'SemanticCommandBus',
    order:index,
    searchableText:`${binding.chord} ${binding.commandId} ${labels.get(binding.commandId)||''}`
  }));
}

export function defineSettingsFamilySectionDescriptor(input={}){
  if(!input.id||!input.label||!input.groupId||!input.sourceOwner)throw Error('SETTINGS_FAMILY_SECTION_DESCRIPTOR_INVALID');
  if(input.groupId==='editor-shortcuts'&&input.family!=='structured')throw Error('EDITOR_SHORTCUT_DESCRIPTOR_MUST_BE_STRUCTURED');
  if(!Array.isArray(input.items))throw Error('SETTINGS_FAMILY_SECTION_ITEMS_REQUIRED');
  return Object.freeze({
    contract:SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT,
    id:String(input.id),
    groupId:String(input.groupId),
    label:String(input.label),
    order:Number.isFinite(Number(input.order))?Number(input.order):100,
    family:input.family?String(input.family):null,
    structuredOnly:input.structuredOnly===true||input.groupId==='editor-shortcuts',
    sourceOwner:String(input.sourceOwner),
    items:Object.freeze(input.items.map((item,index)=>Object.freeze({
      id:String(item.id||`${input.id}:${index}`),
      kind:String(item.kind||'descriptor'),
      label:String(item.label||item.commandId||item.id||`Item ${index+1}`),
      chord:item.chord?String(item.chord):null,
      commandId:item.commandId?String(item.commandId):null,
      sourceOwner:String(item.sourceOwner||input.sourceOwner),
      semanticOwner:item.semanticOwner?String(item.semanticOwner):null,
      order:Number.isFinite(Number(item.order))?Number(item.order):index,
      searchableText:String(item.searchableText||`${item.label||''} ${item.chord||''} ${item.commandId||''}`)
    })))
  });
}

export function editorShortcutSectionFromKeymapDescriptor({id='editor-shortcuts.structured',label='Structured editor',order=10,keymapDescriptor,sourceOwner='BoundedStructuredKeymapDescriptor'}={}){
  if(!keymapDescriptor?.id||keymapDescriptor.family!=='structured'||!Array.isArray(keymapDescriptor.bindings))throw Error('STRUCTURED_KEYMAP_DESCRIPTOR_REQUIRED');
  return defineSettingsFamilySectionDescriptor({
    id,groupId:'editor-shortcuts',label,order,family:'structured',structuredOnly:true,sourceOwner,
    items:keymapDescriptor.bindings.map((binding,index)=>({
      id:binding.id||`${id}:${index}`,
      kind:'shortcut',
      label:binding.label||binding.commandId,
      chord:binding.chord,
      commandId:binding.commandId,
      sourceOwner,
      semanticOwner:keymapDescriptor.semanticOwner||null,
      order:index,
      searchableText:`${binding.chord} ${binding.commandId} ${binding.label||''}`
    }))
  });
}

export function projectSettingsSections({preferences,commands,keymap,profile={},familySections=[]}={}){
  if(!preferences||typeof preferences.resolve!=='function')throw Error('SCOPED_PREFERENCES_OWNER_REQUIRED');
  if(!commands||typeof commands.items!=='function')throw Error('SEMANTIC_COMMAND_BUS_REQUIRED');
  if(!keymap||typeof keymap.descriptor!=='function')throw Error('GLOBAL_INPUT_KEYMAP_OWNER_REQUIRED');
  const sections=[];
  for(const descriptor of SETTINGS_CENTER_SECTION_CATALOG){
    if(!applicable(descriptor,profile))continue;
    const group=groupById(descriptor.groupId);if(!group||!applicable(group,profile))continue;
    const items=descriptor.sourceKind==='preferences'?preferenceItems(descriptor,preferences,profile):descriptor.sourceKind==='commands'?commandItems(commands,profile):globalShortcutItems(keymap,commands,profile);
    sections.push(Object.freeze({
      contract:SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT,
      id:descriptor.id,
      groupId:descriptor.groupId,
      groupLabel:group.label,
      groupOrder:group.order,
      label:descriptor.label,
      order:descriptor.order,
      sourceKind:descriptor.sourceKind,
      sourceOwner:descriptor.sourceKind==='preferences'?'ScopedPreferencesOwner':descriptor.sourceKind==='commands'?'SemanticCommandBus':'GlobalInputKeymapOwner',
      structuredOnly:descriptor.structuredOnly===true,
      items:Object.freeze(items)
    }));
  }
  for(const descriptor of familySections){
    if(!descriptor||descriptor.contract?.id!==SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT.id||descriptor.contract?.version!==SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT.version)throw Error('UNTRUSTED_SETTINGS_FAMILY_SECTION_DESCRIPTOR');
    if(!applicable(descriptor,profile))continue;
    const group=groupById(descriptor.groupId);if(!group||!applicable(group,profile))continue;
    sections.push(Object.freeze({
      contract:SETTINGS_CENTER_SECTION_DESCRIPTOR_CONTRACT,
      id:descriptor.id,
      groupId:descriptor.groupId,
      groupLabel:group.label,
      groupOrder:group.order,
      label:descriptor.label,
      order:descriptor.order,
      sourceKind:'family-descriptor',
      sourceOwner:descriptor.sourceOwner,
      structuredOnly:descriptor.structuredOnly===true,
      items:descriptor.items
    }));
  }
  return Object.freeze(sections.sort(stableSectionSort));
}
