import {readFileSync} from 'node:fs';
import {SemanticCommandBus,SEMANTIC_COMMAND_BUS_OWNER,SEMANTIC_COMMAND_BUS_DI_CONTRACT,assertCanonicalSemanticCommandBus} from '../../../foundation/global/commands.js';
import {SettingsCenterOwner,SETTINGS_CENTER_OWNER,SETTINGS_CENTER_CONTRACT,SETTINGS_CENTER_TRANSIENT_ID} from '../../../foundation/global/settings/center.js';
import {ScopedPreferencesOwner,SCOPED_PREFERENCES_OWNER} from '../../../foundation/global/preferences/store.js';
import {GlobalInputKeymapOwner} from '../../../foundation/global/input-keymap.js';
import {TransientFocusOwner} from '../../../foundation/global/transient-focus.js';
import {createManualAiSurfaceComposition} from '../../../surfaces/manual_ai/composition.js';
import {createReleasesSurfaceComposition} from '../../../surfaces/releases/composition.js';
import {createConfigurationSurfaceComposition} from '../../../surfaces/configuration/composition.js';

const assert=(v:any,m='assertion failed')=>{if(!v)throw Error(m)};
const run=(name:string,fn:()=>void,out:any[])=>{try{fn();out.push({name,status:'PASS'})}catch(e){out.push({name,status:'FAIL',error:String((e as any)?.message||e)})}};
const throws=(fn:()=>void,code:string)=>{let caught:any;try{fn()}catch(e){caught=String((e as any)?.message||e)}assert(typeof caught==='string'&&caught.includes(code),`expected ${code}, got ${caught}`)};

const memoryStorage=(fail=false):any=>({data:{} as Record<string,string>,getItem(k:string){return this.data[k]??null},setItem(k:string,v:string){if(fail)throw Error('WRITE_DENIED');this.data[k]=String(v)}});
const makeSettings=(storage:any=null,bus=new SemanticCommandBus())=>{const preferences=new ScopedPreferencesOwner(storage),keymap=new GlobalInputKeymapOwner({commands:bus}),transientFocus=new TransientFocusOwner();return {settings:new SettingsCenterOwner({preferences,commands:bus,keymap,transientFocus}),preferences,bus}};

export function runD03ACommandSettingsConvergenceTests(){const t:any[]=[];
  run('d03a.command-owner-uniqueness-one-injected-shared-bus',()=>{
    const bus=new SemanticCommandBus();
    const m=createManualAiSurfaceComposition({commands:bus});
    const r=createReleasesSurfaceComposition({commands:bus});
    const c=createConfigurationSurfaceComposition({commands:bus});
    assert(m.commands===bus&&r.commands===bus&&c.commands===bus,'compositions must bind the injected canonical bus');
  },t);
  run('d03a.receipt-uniqueness-single-authoritative-ledger',()=>{
    const bus=new SemanticCommandBus();
    createManualAiSurfaceComposition({commands:bus});
    createReleasesSurfaceComposition({commands:bus});
    createConfigurationSurfaceComposition({commands:bus});
    const before=bus.receipts.length;
    const manual=bus.execute('manual_ai.draft',{proposalId:'p1',revision:'r1',sourceDigest:'f'.repeat(64),sourceId:'KU-1'});
    assert(manual&&manual.state==='PREPARED'&&bus.receipts.length===before+1&&bus.lastReceipt().id==='manual_ai.draft'&&bus.lastReceipt().owner==='ManualAiDomainAdapter'&&bus.lastReceipt().policyTag==='semantic-command-v1','one execution must produce exactly one canonical receipt');
    const again=bus.execute('manual_ai.export',{id:'p1'});
    assert(again&&again.ok===false&&again.code==='EXPORT_HELPER_UNAVAILABLE'&&bus.receipts.length===before+2&&bus.lastReceipt().id==='manual_ai.export'&&bus.lastReceipt().owner==='ManualAiDomainAdapter','a second allowed execution produces exactly one more receipt on the same ledger');
    const deniedBefore=bus.receipts.length,denied=bus.execute('manual_ai.review',{});
    assert(denied.ok===false&&denied.code==='UNKNOWN_COMMAND'||denied.enabled===false&&bus.receipts.length===deniedBefore,'availability-denied or unknown execution emits no receipt');
  },t);
  run('d03a.negative.composition-requires-canonical-bus-instance',()=>{
    throws(()=>createManualAiSurfaceComposition(),'CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED:manual_ai.composition');
    throws(()=>createReleasesSurfaceComposition(),'CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED:releases.composition');
    throws(()=>createConfigurationSurfaceComposition(),'CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED:configuration.composition');
    throws(()=>createManualAiSurfaceComposition({commands:{items:()=>[]} as any}),'CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED');
    assert(assertCanonicalSemanticCommandBus(new SemanticCommandBus(),'test') instanceof SemanticCommandBus);
    assert(SEMANTIC_COMMAND_BUS_DI_CONTRACT.canonicalOwner===SEMANTIC_COMMAND_BUS_OWNER&&SEMANTIC_COMMAND_BUS_DI_CONTRACT.policy.includes('NO_COMPOSITION_LOCAL_COMPETING_BUS'));
  },t);
  run('d03a.negative.no-new-semantic-command-bus-in-target-compositions',()=>{
    for(const file of ['surfaces/manual_ai/composition.ts','surfaces/releases/composition.ts','surfaces/configuration/composition.ts']){
      const source=readFileSync(new URL('../../../../stack/native-typescript/'+file,import.meta.url),'utf8');
      assert(!source.includes('new SemanticCommandBus'),file+' still constructs an independent canonical bus');
      assert(source.includes('assertCanonicalSemanticCommandBus'),file+' must use the canonical DI contract guard');
    }
  },t);
  run('d03a.settings-owner-uniqueness-canonical-identities',()=>{
    const {settings,bus}=makeSettings(memoryStorage());
    bus.register('foundation.settings','WorkspaceHostKernel','Open settings',()=>({ok:true}),()=>true);
    assert(settings.owner===SETTINGS_CENTER_OWNER&&SETTINGS_CENTER_OWNER==='SettingsCenterOwner');
    assert(settings.contract.preferenceValueOwner===SCOPED_PREFERENCES_OWNER&&settings.contract.preferencePersistenceOwner===SCOPED_PREFERENCES_OWNER&&settings.contract.commandOwner===SEMANTIC_COMMAND_BUS_OWNER);
    assert(settings.transientFocus&&SETTINGS_CENTER_TRANSIENT_ID==='global.settings-center');
    assert(settings.sections().filter((s:any)=>s.id===settings.contract.sc011PreferenceTransferActionHome).length===1,'exactly one SC-011 transfer action-home');
  },t);
  run('d03a.sc011-exposure-through-canonical-settings',()=>{
    const {settings}=makeSettings(memoryStorage());
    const section=settings.sections().find((s:any)=>s.id==='settings.transfer');
    assert(section&&section.sourceOwner===SETTINGS_CENTER_OWNER&&section.groupId==='settings','settings.transfer section must exist under canonical Settings group');
    const actionIds=section.items.map((i:any)=>i.actionId);
    assert(['settings.preferences.export','settings.preferences.import','settings.preferences.reset'].every((id,i)=>actionIds[i]===id),'all three SC-011 actions exposed');
    assert(section.items.every((i:any)=>i.delegatesTo===SCOPED_PREFERENCES_OWNER&&i.kind==='preference-transfer-action'),'actions declare delegation to canonical preference owner');
    assert(settings.search('export').some((h:any)=>h.sectionId==='settings.transfer'),'Settings search must reach the SC-011 action-home');
    const html=settings.render({family:'global'},[],{embedded:true});
    assert(html.includes('data-settings-action="settings.preferences.export"')&&html.includes('data-settings-action="settings.preferences.import"')&&html.includes('data-settings-action="settings.preferences.reset"'),'rendered Settings must expose the three SC-011 actions');
  },t);
  run('d03a.sc011-delegation-to-scoped-preferences-owner',()=>{
    const storage=memoryStorage();const {settings,preferences}=makeSettings(storage);
    settings.setPreference('theme','notion-dark',{scope:'global'});
    const exported=settings.exportPreferences();
    assert(exported.ok===true&&exported.code==='EXPORTED'&&exported.durablePersistenceClaim===false&&exported.data.kind==='cep-foundation-preferences'&&exported.data.overrides.global.theme==='notion-dark','export delegates to ScopedPreferencesOwner.export without durability claim');
    preferences.set('density','compact','global');
    const imported=settings.importPreferences(exported.data);
    assert(imported.ok===true&&imported.code==='PERSISTED'&&imported.durable===true&&preferences.resolve('density').preferredValue==='comfortable'&&preferences.resolve('theme').preferredValue==='notion-dark','import replaces overrides and reports settled persistence truth');
    assert(JSON.parse(storage.data['cep-foundation.preferences.v1']).overrides.global.theme==='notion-dark','imported state is durably persisted through the canonical store');
    const reset=settings.resetPreferences();
    assert(reset.ok===true&&reset.code==='PERSISTED'&&reset.resetCount===1&&preferences.resolve('theme').preferredValue!=='notion-dark','reset delegates to ScopedPreferencesOwner.reset per key with settled truth');
  },t);
  run('d03a.sc011-no-fabricated-persistence',()=>{
    const {settings}=makeSettings(null);
    const exported=settings.exportPreferences();
    assert(exported.ok===true&&exported.durablePersistenceClaim===false,'export stays a read-side snapshot');
    const imported=settings.importPreferences(exported.data);
    assert(imported.ok===false&&imported.code==='STORAGE_UNAVAILABLE'&&imported.durable===false,'import with unavailable storage must not claim durable settlement');
    const reset=settings.resetPreferences();
    assert(reset.ok===true&&reset.code==='NOTHING_TO_RESET'&&reset.durable===false,'empty reset reports durable:false without storage');
  },t);
  run('d03a.sc011-failing-storage-import-reported',()=>{
    const store:any={data:{} as Record<string,string>,getItem(k:string){return this.data[k]??null},setItem(){throw Error('WRITE_DENIED')}};
    const {settings,preferences}=makeSettings(store);
    const before=preferences.export();
    const imported=settings.importPreferences({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{theme:'notion-dark'}}});
    assert(imported.ok===false&&imported.code==='STORAGE_WRITE_FAILED'&&imported.durable===false,'failed storage write must surface STORAGE_WRITE_FAILED');
    assert(JSON.stringify(before)!==JSON.stringify(preferences.export()),'pre-persistence import mutation is acknowledged');
    const rejected=settings.importPreferences({schemaVersion:99,kind:'wrong',overrides:{}});
    assert(rejected.ok===false&&rejected.code==='IMPORT_REJECTED'&&rejected.overridesUnchanged===true,'invalid snapshots are rejected before mutation');
  },t);
  run('d03a.regression.semantic-command-bus-routes-and-guards',()=>{
    const bus=new SemanticCommandBus();let effects=0;
    bus.registerCommand('OPEN_TERMINAL','RuntimeAdapter','Open terminal',()=>++effects);
    for(const route of ['toolbar','menu','palette','context','object-doubleclick'])bus.execute('OPEN_TERMINAL',{route});
    assert(effects===5&&bus.receipts.length===5&&new Set(bus.receipts.map(r=>r.id)).size===1&&bus.receipts.map(r=>r.route).join()==='toolbar,menu,palette,context,object-doubleclick');
    assert(bus.execute('missing',{}).code==='UNKNOWN_COMMAND'&&bus.receipts.length===5);
    throws(()=>bus.registerCommand('OPEN_TERMINAL','OtherOwner','dup',()=>true),'DUPLICATE_COMMAND_OWNER:OPEN_TERMINAL');
  },t);
  run('d03a.regression.settings-center-lifecycle-and-boundaries',()=>{
    const {settings}=makeSettings(memoryStorage());
    const opened=settings.open(null,{profile:{family:'global'},familySections:[]});
    assert(opened.kind==='open'&&opened.transientId===SETTINGS_CENTER_TRANSIENT_ID&&settings.presentation.open===true);
    const closed=settings.close('explicit');
    assert(closed.kind==='close'&&closed.closed===true&&settings.presentation.open===false);
    throws(()=>settings.toggleSection('not.a.section',{family:'global'},[]),'SETTINGS_SECTION_NOT_APPLICABLE:not.a.section');
    const set=settings.setPreference('highContrast',true,{scope:'global'});
    assert(set.kind==='preference-delegated-set'&&set.valueOwner===SCOPED_PREFERENCES_OWNER&&set.storageResult.ok===true);
  },t);
  return t;
}
if(import.meta.url===new URL(process.argv[1],'file:').href){const tests=runD03ACommandSettingsConvergenceTests();const report={mission:'D03A',kind:'MODEL_NOT_BROWSER',pass:tests.filter((x:any)=>x.status==='PASS').length,fail:tests.filter((x:any)=>x.status==='FAIL').length,tests};console.log(JSON.stringify(report,null,2));if(tests.some((x:any)=>x.status==='FAIL'))process.exitCode=1;}
