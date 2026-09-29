import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ConfigurationDomainAdapter,CONFIGURATION_COMMANDS} from '../../adapters/configuration/domain-adapter.js';
export const CONFIGURATION_SURFACE_ID='configuration';

/* Representative product state for the W05 Configuration surface. The domain adapter default stays
   EMPTY (configuration.observed-default-is-never-fabricated is unchanged); the composition supplies
   records so the Owner-confirmed configuration-revision reference structure (component list,
   change summary, publication policy) has something authoritative to present. Keys and component
   names come from that reference; values stay redacted exactly as the domain requires, and every
   record states its basis in the UI. */
const RECORD_BASIS='W05_SURFACE_REPRESENTATIVE_RECORD · keys taken from the Owner-confirmed configuration reference; values are redacted, this is not a live configuration read';
const CONFIG_REPRESENTATIVE_FIXTURES      =[
  {key:'security.session.idle_timeout',presentVersion:'v3',redactedValue:'*** (30m)',source:'local-runtime-safe-config',observedAt:'2026-08-31T10:42:00Z',restartRequired:false,state:'AVAILABLE'},
  {key:'security.session.max_concurrent',presentVersion:'v3',redactedValue:'*** (5)',source:'local-runtime-safe-config',observedAt:'2026-08-31T10:42:00Z',restartRequired:false,state:'AVAILABLE'},
  {key:'security.privileged_action.confirm_required',presentVersion:'v3',redactedValue:'*** (true)',source:'local-runtime-safe-config',observedAt:'2026-08-31T10:41:00Z',restartRequired:false,state:'AVAILABLE'},
  {key:'security.audit.enforcement',presentVersion:'v3',redactedValue:'*** (log)',source:'local-runtime-safe-config',observedAt:'2026-08-31T10:40:00Z',restartRequired:true,state:'AVAILABLE'},
  {key:'simulation.runtime.profile',presentVersion:'v2',redactedValue:'*** (baseline)',source:'local-runtime-safe-config',observedAt:'2026-08-31T09:15:00Z',restartRequired:true,state:'STALE'},
  {key:'backup.retention.days',presentVersion:'v1',redactedValue:'*** (30)',source:'local-runtime-safe-config',observedAt:'2026-08-30T22:10:00Z',restartRequired:false,state:'UNAVAILABLE'}
];

/* SC-011 preference-transfer receipt projection (defect C-2).
   The canonical owner SettingsCenterOwner already records every export/import/reset receipt;
   this is a READ-ONLY single-location projection of those receipts plus the W05 session-scope
   import semantics. It creates no second action home: settings.transfer stays in Settings. */
const preferenceTransferProjection=()=>{
  try{
    const owner    =(globalThis       ).CEPFoundation?.wave4Assembly?.settings||null;
    const receipts=Array.isArray(owner?.receipts)?owner.receipts.filter((r    )=>r&&r.kind==='preference-transfer'):[];
    return {
      actionHome:'settings.transfer',actionHomeOwner:'SettingsCenterOwner',valueOwner:'ScopedPreferencesOwner',persistenceOwner:'ScopedPreferencesOwner',
      semantics:['Export never carries the context-free session scope.','Import preserves unscoped session state; only carried scopes are replaced.','A rejected import is atomic: overrides stay byte-identical.','Reset discards preference overrides only; it never mutates operational configuration.'],
      receiptCount:receipts.length,
      lastReceiptCode:String(receipts.at(-1)?.code||'NONE'),
      lastReceiptAction:String(receipts.at(-1)?.action||'NONE'),
      lastReceiptOk:String(receipts.at(-1)?.ok??''),
      lastReceiptChanged:String(receipts.at(-1)?.changed??receipts.at(-1)?.resetCount??''),
      receipts:receipts.slice(-8).map((r    )=>`${r.sequence} · ${r.action} · ${r.code} · ok=${String(r.ok)} · scopeCount=${String(r.scopeCount??'-')} · changed=${String(r.changed??'-')} · resetCount=${String(r.resetCount??'-')} · durable=${String(r.durable??'-')} · overridesUnchanged=${String(r.overridesUnchanged??'-')}${r.error?` · error=${r.error}`:''}`)
    };
  }catch{return {actionHome:'settings.transfer',actionHomeOwner:'SettingsCenterOwner',receiptCount:0,lastReceiptCode:'NONE',lastReceiptAction:'NONE',semantics:[],receipts:[],receiptSource:'UNAVAILABLE'}}
};

const COMPONENTS=Object.freeze([
  {name:'Security',count:7,tone:'ok'},{name:'Simulation',count:4,tone:'ok'},{name:'Backup & Recovery',count:3,tone:'warn'},{name:'AI Bridge',count:5,tone:'ok'},{name:'Notifications',count:2,tone:'muted'}
]);

export function createConfigurationSurfaceComposition({adapter=null,commands=null}={}){
  commands=assertCanonicalSemanticCommandBus(commands,'configuration.composition');
  adapter=adapter||new ConfigurationDomainAdapter({observations:[...CONFIG_REPRESENTATIVE_FIXTURES]});
  adapter.bindCommands(commands);
  const tableAdapter                                        ={adapterId:'configuration.observations',rows:()=>adapter.rows(),rowId:r=>r.key,rowLabel:r=>r.key,searchableText:r=>`${r.key} ${r.source} ${r.state}`,columns:[{id:'key',label:'Operational key',cell:r=>({text:r.key,secondary:`${r.source} · ${r.observedAt}`,direction:'ltr'})},{id:'state',label:'Observation',cell:r=>({text:r.state,tone:r.state==='AVAILABLE'?'success':r.state==='STALE'?'warning':'danger'})}],actions:r=>[{id:'configuration.diff',label:'Diff proposal',enabled:true},{id:'configuration.edit',label:'Edit proposal',enabled:r.state==='AVAILABLE'||r.state==='STALE'}]};
  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({id:'configuration.context',family:'configuration',owner:adapter.owner,describe:({key}    ={})=>{
    const row=adapter.rows().find(item=>item.key===(key??adapter.selected()?.key));
    const proposal=row?adapter.proposal(row.key):null;
    const fields=(entries                            )=>entries.map(([label,value,technical])=>({id:label.replace(/\s+/g,'-').toLowerCase(),label,value,technical:technical===true}));
    return {id:`configuration:${row?.key||'empty'}`,providerId:'configuration.context',family:'configuration',subject:row?row.key:'No ConfigObservation selected',eyebrow:'Operational Configuration · إعداد تشغيلي',summary:row?`${row.state} · observed from ${row.source} · present is not approved`:'Operational configuration truth remains explicit and separate from Global Settings.',domainOwner:adapter.owner,revisionToken:row?.presentVersion||null,
      lenses:[
        {id:'identity',label:'المشروع المُرصد · Observation',tabs:[{id:'observed',label:'Observed',fields:row?fields([['Key',row.key,true],['Present version',row.presentVersion,true],['Redacted value',row.redactedValue,true],['Source',row.source,true],['Observed at',row.observedAt,true],['Restart if applied',row.restartRequired?'REQUIRED':'NO',false]]):[]}]},
        {id:'proposal',label:'الاقتراح المربوط · Bound proposal',tabs:[{id:'proposal',label:'Proposal state',fields:fields([['Proposal state',proposal?.state||'ABSENT',false],['Base version',proposal?.baseVersion||'—',true],['Application state',proposal?.application||'NOT_APPLIED',false],['Validation reason',proposal?.validation?.reason||'NOT_VALIDATED',true]])}]},
        {id:'ceilings',label:'سقوبات الحقيقة · Truth ceilings',tabs:[{id:'ceilings',label:'Declared ceilings',fields:fields([['editMutatesOperationalConfig','false',true],['validateImpliesApply','false',true],['resetFactoryResetsOperationalConfig','false',true],['requestApplyRequiresExplicitAuthority','true',true],['duplicateSettingsEngine','false',true],['settingsCanDispatchOperationalConfigApply','false',true]])}]},
        {id:'boundary',label:'حدود الإعدادات · Settings boundary',tabs:[{id:'owner',label:'Owner separation',fields:fields([['Global settings owner','SettingsCenterOwner',true],['Global settings role','DURABLE_GLOBAL_AND_FAMILY_PREFERENCES',true],['Operational config owner','ConfigurationDomainAdapter',true],['Operational config role','OBSERVE_PROPOSE_VALIDATE_REQUEST_AUTHORITY',true]])}]},
        {id:'record',label:'أساس السجل · Record basis',tabs:[{id:'basis',label:'Provenance of this record',fields:fields([['Record basis',RECORD_BASIS]])}]}
      ]};}});
  return {surface:CONFIGURATION_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'configuration.workspace',family:'global',domainKind:'configuration',label:'Configuration'}),adapter,commands,collection,tableAdapter,contextProvider,toolbarCommandIds:[...CONFIGURATION_COMMANDS],bottomProjection:(keyId    )=>{const d    =adapter.diagnosticProjection();delete d.history;const transfer    =preferenceTransferProjection();return {selectedKey:String(keyId||d.selectedKey||'NONE'),recordBasis:RECORD_BASIS,providerTruth:d.providerTruth,settingsBoundary:d.settingsBoundary,operationalConfigEdit:'LOCAL_PROPOSAL_ONLY',operationalConfigValidate:'DOES_NOT_APPLY',operationalConfigReset:'DISCARDS_PROPOSAL_ONLY',lastAction:adapter.lastAction?`${adapter.lastAction.commandId} · ok=${String(adapter.lastAction.ok)} · ${adapter.lastAction.code} · ${adapter.lastAction.key||''}`:'NONE',timeline:(d.proposals||[]).map((p    )=>`${p.key} · ${p.state} · ${p.application}`),components:COMPONENTS.map((c    )=>`${c.name} · ${c.count} settings`),preferenceTransferSummary:`actionHome=${transfer.actionHome} · owner=${transfer.actionHomeOwner} · valueOwner=${transfer.valueOwner} · receipts=${String(transfer.receiptCount)} · last=${String(transfer.lastReceiptCode)}`,preferenceTransfer:transfer}},settingsBoundary:{globalSettingsOwner:'SettingsCenterOwner',globalSettingsRole:'DURABLE_GLOBAL_AND_FAMILY_PREFERENCES',operationalConfigurationOwner:adapter.owner,operationalConfigurationRole:'OBSERVE_PROPOSE_VALIDATE_REQUEST_AUTHORITY',duplicateSettingsEngine:false,settingsCanDispatchOperationalConfigApply:false,shortcutRule:'Any Settings shortcut must bind the existing canonical Settings/command owner; this surface creates none.'},truthCeiling:{editMutatesOperationalConfig:false,validateImpliesApply:false,resetFactoryResetsOperationalConfig:false,requestApplyRequiresExplicitAuthority:true},platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'OperationalConfigInspectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}};
}
