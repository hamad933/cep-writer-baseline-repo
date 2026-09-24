import {SettingsCenterOwner,SETTINGS_CENTER_CONTRACT} from '../../../foundation/global/settings/center.js';
import {ScopedPreferencesOwner} from '../../../foundation/global/preferences/store.js';
import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {GlobalInputKeymapOwner} from '../../../foundation/global/input-keymap.js';
import {TransientFocusOwner} from '../../../foundation/global/transient-focus.js';
import {AccessibilityFeedbackOwner} from '../../../foundation/global/feedback.js';
import {ConfirmationSafetyHost} from '../../../foundation/global/confirmation-host.js';
import {InputDirectionResolver} from '../../../foundation/global/input-direction.js';

const assert=(condition,message='ASSERTION_FAILED')=>{if(!condition)throw Error(message)};
const throws=(fn,fragment)=>{let error    =null;try{fn()}catch(value){error=value}assert(error&&String(error.message||error).includes(fragment),`EXPECTED_THROW:${fragment}:${error}`)};
const run=(id,kind,fn)=>{try{return {id,kind,status:'PASS',evidence:fn()??null}}catch(error){return {id,kind,status:'FAIL',error:String((error       )?.stack||error)}}};

class MemoryStorage{value            =null;getItem(){return this.value}setItem(_key       ,value       ){this.value=value}}

class FakeClassList{
  values            ;constructor(values         =[]){this.values=new Set(values)}contains(value       ){return this.values.has(value)}
}
class FakeElement{
  tagName       ;nodeName       ;id='';attrs=new Map               ();children              =[];parentElement                 =null;classList              ;hidden=false;disabled=false;readOnly=false;isConnected=true;inert=false;offsetParent    ={};tabIndex=0;focusCount=0;listeners=new Map                      ();doc    ;
  constructor(tag='div',doc    =null,classes         =[]){this.tagName=tag.toUpperCase();this.nodeName=this.tagName;this.doc=doc;this.classList=new FakeClassList(classes)}
  append(...nodes              ){for(const node of nodes){node.parentElement=this;node.doc=this.doc;this.children.push(node)}}
  setAttribute(name       ,value    ){this.attrs.set(name,String(value));if(name==='id')this.id=String(value)}
  getAttribute(name       ){if(name==='id'&&this.id)return this.id;return this.attrs.has(name)?this.attrs.get(name) :null}
  hasAttribute(name       ){return name==='id'?!!this.id:this.attrs.has(name)}
  removeAttribute(name       ){if(name==='id')this.id='';this.attrs.delete(name)}
  focus(){this.focusCount+=1;if(this.doc)this.doc.activeElement=this}
  contains(candidate    ){if(candidate===this)return true;return this.children.some(child=>child.contains(candidate))}
  matches(selector       ){return selector==='.dialog'?this.classList.contains('dialog'):false}
  addEventListener(type       ,listener         ){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type) .add(listener)}
  removeEventListener(type       ,listener         ){this.listeners.get(type)?.delete(listener)}
  listenerCount(type       ){return this.listeners.get(type)?.size||0}
  descendants(){return this.children.flatMap(child=>[child,...child.descendants()])}
  querySelectorAll(selector       ){
    const all=this.descendants();
    if(selector.includes(',')||selector.includes(':not('))return all.filter(node=>['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(node.tagName)||node.hasAttribute('tabindex'));
    const attr=selector.match(/^([a-z0-9-]+)\[([^\]]+)\]$/i);if(attr)return all.filter(node=>node.tagName.toLowerCase()===attr[1].toLowerCase()&&node.hasAttribute(attr[2]));
    if(selector.startsWith('#'))return all.filter(node=>node.id===selector.slice(1));
    if(selector.startsWith('.'))return all.filter(node=>node.classList.contains(selector.slice(1)));
    return [];
  }
  querySelector(selector       ){return this.querySelectorAll(selector)[0]||null}
}
class FakeDocument{
  activeElement    =null;body            ;app            ;notes                 =null;
  constructor(){this.body=new FakeElement('body',this);this.app=new FakeElement('main',this,['app']);this.body.append(this.app)}
  querySelector(selector       ){if(selector==='.app')return this.app;if(selector==='#stickyNoteHost')return this.notes;return this.body.querySelector(selector)}
  querySelectorAll(selector       ){return this.body.querySelectorAll(selector)}
  getElementById(id       ){return [this.body,...this.body.descendants()].find(node=>node.id===id)||null}
  replaceApp(next            ){this.app.isConnected=false;this.app=next;next.doc=this;next.parentElement=this.body;this.body.children=this.body.children.filter(child=>!child.classList.contains('app'));this.body.children.push(next)}
}

function settingsFixture(){
  const preferences=new ScopedPreferencesOwner(new MemoryStorage(),{workspace:'W05',surface:'configuration',view:'main',component:'workspace',family:'operational'});
  const commands=new SemanticCommandBus();let configEffects=0;
  commands.register('foundation.settings','WorkspaceHostKernel','Open settings',()=>({ok:true}),()=>true);
  commands.register('configuration.requestApply','W05ConfigurationDomain','Request apply',()=>{configEffects+=1;return {ok:true}},()=>true);
  const transientFocus=new TransientFocusOwner();
  const keymap=new GlobalInputKeymapOwner({commands,transientFocus,globalBindings:[{id:'settings',chord:'Ctrl+Comma',commandId:'foundation.settings',allow:true}]});
  const owner=new SettingsCenterOwner({preferences,commands,keymap,transientFocus});owner.configurePresentation({profile:{id:'configuration',family:'operational',capabilities:{structuredEditor:false}}});
  return {owner,preferences,commands,keymap,transientFocus,getConfigEffects:()=>configEffects};
}

function fakeBridge(hint            ,available=true){return {capability:()=>({available,code:available?'AVAILABLE':'UNAVAILABLE'}),read:()=>available?({available:true,recognized:hint==='rtl'||hint==='ltr',code:'AVAILABLE',hint}):({available:false,recognized:false,code:'UNAVAILABLE',hint:null})}}

export function runS03SharedSettingsTransientTests(){
  const tests      =[];
  tests.push(run('s03.settings.role-boundary','positive',()=>{const {owner,getConfigEffects}=settingsFixture();assert(SETTINGS_CENTER_CONTRACT.productRole==='GLOBAL_DURABLE_FAMILY_PREFERENCES_AND_DISCOVERABILITY');assert(SETTINGS_CENTER_CONTRACT.domainConfigurationBoundary==='UI_PREFERENCES_NEVER_MUTATE_OPERATIONAL_CONFIGURATION');const command=owner.sections().flatMap((section    )=>section.items).find((item    )=>item.commandId==='configuration.requestApply');assert(command&&command.interaction==='DISCOVERABILITY_ONLY');assert(typeof (owner       ).execute!=='function'&&getConfigEffects()===0);return {productRole:SETTINGS_CENTER_CONTRACT.productRole,commandInteraction:command.interaction,domainConfigEffects:getConfigEffects()}}));
  tests.push(run('s03.settings.one-open-reclick-keyboard-search','positive',()=>{const {owner}=settingsFixture(),ids=owner.sections().map((section    )=>section.id);assert(ids.length>=2);owner.toggleSection(ids[0]);assert(owner.presentation.openSectionId===ids[0]);owner.toggleSection(ids[0]);assert(owner.presentation.openSectionId===null);owner.presentation.focusedSectionId=ids[0];const event    ={key:'ArrowDown',preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};const routed=owner.handleDisclosureKey(event);assert(routed.handled&&routed.focusSectionId===ids[1]&&event.prevented);owner.setQuery('direction');assert(owner.presentation.query==='direction');return {reclickClosed:true,keyboard:routed.code,query:owner.presentation.query,openSectionId:owner.presentation.openSectionId}}));
  tests.push(run('s03.focus.modal-isolation-restores-prior-state','negative-falsification',()=>{const doc=new FakeDocument(),preHidden=new FakeElement('section',doc),normal=new FakeElement('section',doc),backdrop=new FakeElement('div',doc,['backdrop']),dialog=new FakeElement('section',doc,['dialog']),button=new FakeElement('button',doc);preHidden.inert=true;preHidden.setAttribute('aria-hidden','true');doc.app.append(preHidden,normal,backdrop);backdrop.append(dialog);dialog.append(button);const focus=new TransientFocusOwner({document:doc       });focus.open('modal',{element:backdrop,modal:true});assert(preHidden.inert===true&&preHidden.getAttribute('aria-hidden')==='true');assert(normal.inert===true&&normal.getAttribute('aria-hidden')==='true');focus.close('modal',{restore:false});assert(preHidden.inert===true&&preHidden.getAttribute('aria-hidden')==='true','pre-existing hidden/inert state was clobbered');assert(normal.inert===false&&normal.getAttribute('aria-hidden')===null,'normal state was not restored exactly');return {preExistingStatePreserved:true,normalStateRestored:true,isolationSnapshots:focus.snapshot().isolationSnapshotCount}}));
  tests.push(run('s03.focus.reused-modal-root-rebinds-listeners','negative-falsification',()=>{const doc=new FakeDocument(),root=new FakeElement('div',doc),dialog=new FakeElement('section',doc,['dialog']),button=new FakeElement('button',doc);root.append(dialog);dialog.append(button);const focus=new TransientFocusOwner({document:doc       });focus.open('first',{element:root,modal:true});assert(root.listenerCount('keydown')===1&&root.listenerCount('focusout')===1);focus.close('first',{restore:false});assert(root.listenerCount('keydown')===0&&root.listenerCount('focusout')===0,'stale focus-containment listeners retained after close');focus.open('second',{element:root,modal:true});assert(root.listenerCount('keydown')===1&&root.listenerCount('focusout')===1);focus.close('second',{restore:false});return {releasedAfterClose:true,reboundForNewTransient:true}}));
  tests.push(run('s03.focus.detached-invoker-rebind-safe','positive',()=>{const doc=new FakeDocument(),shell=new FakeElement('section',doc),oldInvoker=new FakeElement('button',doc);oldInvoker.setAttribute('data-foundation-command','foundation.settings');doc.app.append(shell);shell.append(oldInvoker);const modal=new FakeElement('div',doc),dialog=new FakeElement('section',doc,['dialog']),button=new FakeElement('button',doc);modal.append(dialog);dialog.append(button);const focus=new TransientFocusOwner({document:doc       });focus.open('settings',{invoker:oldInvoker,element:modal,modal:true});const nextApp=new FakeElement('main',doc,['app']),nextInvoker=new FakeElement('button',doc);nextInvoker.setAttribute('data-foundation-command','foundation.settings');nextApp.append(nextInvoker);doc.replaceApp(nextApp);oldInvoker.isConnected=false;shell.isConnected=false;focus.close('settings',{reason:'escape'});assert(nextInvoker.focusCount===1&&focus.lastDismissal?.restored===true);return {focusTargetKind:focus.lastDismissal?.focusTargetKind,reboundFocusCount:nextInvoker.focusCount}}));
  tests.push(run('s03.input.ime-no-global-leak','positive',()=>{const commands=new SemanticCommandBus();let effects=0;commands.register('global.search','GlobalShellDomain','Search',()=>{effects+=1;return {ok:true}},()=>true);const keymap=new GlobalInputKeymapOwner({commands,globalBindings:[{id:'search',chord:'Ctrl+KeyK',commandId:'global.search',allow:true}]});const event    ={key:'Process',code:'KeyK',ctrlKey:true,isComposing:true,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};const result=keymap.handleKeydown(event);assert(result.code==='IME_COMPOSITION_PASSTHROUGH'&&!event.prevented&&!event.stopped&&effects===0&&commands.receipts.length===0);return {code:result.code,prevented:event.prevented,stopped:event.stopped,effects}}));
  tests.push(run('s03.direction.persisted-bridge-fallback-truth','positive',()=>{const persisted=new InputDirectionResolver({bridge:fakeBridge('rtl')       }).resolve({persistedDirection:'ltr',content:'',surface:'structured',blockId:'b1'});assert(persisted.direction==='ltr'&&persisted.source==='PERSISTED_EXPLICIT_DIRECTION'&&!persisted.bridgeUsed);const hinted=new InputDirectionResolver({bridge:fakeBridge('rtl')       }).resolve({content:'English العربية',surface:'structured',blockId:'b2'});assert(hinted.direction==='rtl'&&hinted.source==='PLATFORM_OS_KEYBOARD_HINT'&&!hinted.semanticInference&&!hinted.contentInspectedForLanguage);const fallback=new InputDirectionResolver({bridge:fakeBridge(null,false)       }).resolve({content:'العربية English',surface:'structured'});assert(fallback.source==='POLICY_FALLBACK'&&!fallback.bridgeUsed&&!fallback.semanticInference);return {persisted:persisted.source,hinted:hinted.source,fallback:fallback.source,semanticInference:false}}));
  tests.push(run('s03.direction.note-provenance-not-fixture','positive',()=>{const initialized=new InputDirectionResolver({bridge:fakeBridge(null,false)       }).initializeEmptyNoteContent({id:'note-1',html:''});assert(initialized.resolution.surface==='note-content');return {surface:initialized.resolution.surface,direction:initialized.content.dir,platformProof:'NOT_EXECUTED',oe001:'ACTIVE_PLATFORM_GATED_PRESERVED'}}));
  tests.push(run('s03.feedback.truth-refusal-and-dedupe','negative-falsification',()=>{let now=1000;const owner=new AccessibilityFeedbackOwner({now:()=>now});throws(()=>owner.publish({channel:'toast',outcome:'success',message:'Saved',sourceFamily:'structured',sourceOwner:'LibraryDomain',sourceTruth:{ok:false}}),'FEEDBACK_TRUTH_CONFLICT');const first=owner.publish({channel:'toast',outcome:'success',message:'Saved',sourceFamily:'structured',sourceOwner:'LibraryDomain',sourceTruth:{ok:true,status:'SAVED'}});now=1100;const second=owner.publish({channel:'toast',outcome:'success',message:'Saved',sourceFamily:'structured',sourceOwner:'LibraryDomain',sourceTruth:{ok:true,status:'SAVED'}});assert(first.accepted===true&&second.accepted===false&&second.code==='DUPLICATE_SUPPRESSED');return {truthConflictRefused:true,dedupe:second.code,canonicalTruthOwned:false}}));
  tests.push(run('s03.confirmation.no-risk-guess-or-action-execution','negative-falsification',()=>{const host=new ConfirmationSafetyHost(),missing=host.request({actionId:'configuration.requestApply'});assert(!missing.accepted&&missing.code==='CONFIRMATION_RISK_DESCRIPTOR_REQUIRED');assert(host.snapshot().guessesDestructiveRisk===false&&host.snapshot().executesAction===false);return {missingRisk:missing.code,guessesDestructiveRisk:false,executesAction:false}}));
  const pass=tests.filter(test=>test.status==='PASS').length,fail=tests.length-pass;
  return {schemaVersion:1,lane:'S03_SHARED_SETTINGS_TRANSIENT',status:fail?'FAIL':'PASS',pass,fail,windowsInputLayoutProof:'NOT_EXECUTED',oe001:'ACTIVE_PLATFORM_GATED_PRESERVED',tests};
}

const report=runS03SharedSettingsTransientTests();
console.log(JSON.stringify(report,null,2));
if(report.fail)process.exitCode=1;
