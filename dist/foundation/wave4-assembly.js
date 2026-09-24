import {SettingsCenterOwner} from './global/settings/center.js';
import {editorShortcutSectionFromKeymapDescriptor} from './global/settings/sections.js';
import {OperationalSessionOwner} from './operational/session-owner.js';
import {ConfirmationSafetyHost,ConfirmationSafetyProjector} from './global/confirmation-host.js';
import {validateEpistemicStateDescriptor,projectEpistemicState,toAccessibilityFeedbackInput} from './contracts/epistemic-state.js';

export const WAVE4_ASSEMBLY_CONTRACT=Object.freeze({
  id:'Wave4FamilyInteractionAssembly',version:'1.0.0',kind:'CONTROLLER_COMPOSITION_ONLY',
  semanticOwner:false,structuredHostOwner:false,
  owners:Object.freeze(['StructuredInputKeymapOwner','StructuredActionDescriptorOwner','InputDirectionResolver','StructuredRichContentOwner','StructuredDragDropOwner','SettingsCenterOwner','OperationalSessionOwner','EpistemicStateContract','ConfirmationSafetyHost'])
});

const PROFILE=({family,structured})=>Object.freeze({family,capabilities:{structuredEditor:!!structured}});
export class Wave4FamilyInteractionAssembly{
  constructor({commandBus,transientOwner,preferences,wave3Assembly,structured=null,consumer='library',family='structured',simulation=null,document:doc=globalThis.document}={}){
    if(!commandBus||!transientOwner||!preferences||!wave3Assembly)throw Error('WAVE4_ACCEPTED_GLOBAL_PREREQUISITES_REQUIRED');
    this.owner='ControllerComposition';this.contract=WAVE4_ASSEMBLY_CONTRACT;this.commandBus=commandBus;this.transientOwner=transientOwner;this.preferences=preferences;this.wave3=wave3Assembly;this.structured=structured;this.consumer=consumer;this.family=family;this.simulation=simulation;this.document=doc;
    this.structuredInput=null;this.settings=null;this.operationalSession=null;this.confirmationHost=new ConfirmationSafetyHost();this.confirmationProjector=null;this.settingsBackdrop=null;this.settingsEscapeListener=null;this.profile=PROFILE({family,structured});this.familySettings=[];
  }
  mount(){
    if(this.structured){
      this.structuredInput=this.structured.attachInputKeymap({commands:this.commandBus,globalInputKeymapOwner:this.wave3.inputOwner});
      this.structured.assertCanonicalInputKeymapOwner();
      this.familySettings=[editorShortcutSectionFromKeymapDescriptor({keymapDescriptor:this.structuredInput.descriptor(),sourceOwner:'StructuredInputKeymapOwner'})];
    }
    this.settings=new SettingsCenterOwner({preferences:this.preferences,commands:this.commandBus,keymap:this.wave3.inputOwner,transientFocus:this.transientOwner,onClose:()=>{this.settingsBackdrop?.remove?.();this.settingsBackdrop=null;}});
    this.settings.configurePresentation({profile:this.profile,familySections:this.familySettings});
    const view=this.document?.defaultView||globalThis;this.settingsEscapeListener=event=>{if(event.key==='Escape'&&this.settings?.presentation?.open)this.closeSettings('escape')};view?.addEventListener?.('keydown',this.settingsEscapeListener,true);
    if(this.simulation){
      this.operationalSession=new OperationalSessionOwner();
      this.operationalSession.registerProvider(this.simulation,{classification:'REAL_RUNTIME_PROVIDER',evidenceRole:'Runs canonical runtime provider'});
      const bottom=this.wave3.bottomOwner;
      if(bottom&&!bottom.providerDescriptors().some(p=>p.id==='operational.session-presentation'))bottom.registerProvider(this.operationalSession.asBottomDeepWorkProvider());
    }
    if(this.document?.body)this.confirmationProjector=new ConfirmationSafetyProjector(this.confirmationHost,{document:this.document,root:this.document.body});
    return this;
  }
  structuredInputOwnership(){return this.structuredInput?.inputOwnershipDescriptor?.()||null;}
  handleStructuredKeydown(event,context={}){return this.structuredInput?this.structuredInput.handleKeydown(event,context):{handled:false,code:'STRUCTURED_INPUT_OWNER_UNAVAILABLE'};}
  handleCompositionStart(event,context={}){return this.structuredInput?.handleCompositionStart(event,context)||null;}
  handleCompositionEnd(event,context={}){return this.structuredInput?.handleCompositionEnd(event,context)||null;}
  actionDescriptors(surface,context={}){return this.structured?.actionDescriptorOwner?.project(surface,context)||null;}
  describeStructuredAction(actionId,context={}){return this.structured?.actionDescriptorOwner?.describe(actionId,context)||null;}
  executeStructuredAction(actionId,context={}){return this.structured?.actionDescriptorOwner?.execute(actionId,context)||null;}
  confirmStructuredAction(actionId,context={},options={}){
    const descriptor=this.describeStructuredAction(actionId,context);if(!descriptor)return null;
    if(!descriptor.enabled)return {ok:false,status:'UNAVAILABLE',descriptor};
    if(!descriptor.confirmation?.required)return this.executeStructuredAction(actionId,{...context,confirmed:true});
    const subtreeCount=descriptor.confirmation.subtreeCount||1;
    const risk={actionId,sourceOwner:descriptor.owner,destructive:true,confirmationRequired:true,riskCode:descriptor.confirmation.kind||'STRUCTURED_DESTRUCTIVE_ACTION',copy:{title:'Confirm destructive action',message:`This action affects ${subtreeCount} Structured block(s).`,confirmLabel:'Confirm',cancelLabel:'Cancel'},canonicalTruth:{owner:descriptor.availabilityOwner,enabled:descriptor.enabled,code:descriptor.code,subtreeCount,threshold:descriptor.confirmation.threshold},scope:{family:'structured',blockId:context.blockId||null,surface:context.surface||null}};
    return this.requestConfirmation({actionId,risk},{onReceipt:receipt=>{let result=null;if(receipt?.accepted&&receipt.code==='CONFIRMED')result=this.executeStructuredAction(actionId,{...context,confirmed:true});options.onExecuted?.(result,receipt);options.onReceipt?.(receipt,result);}});
  }
  validateDrop(sourceBlockId,target,context={}){return this.structured?.dropTargetOwner?.validate(sourceBlockId,target,context)||null;}
  beginDrag(input){return this.structured?.dragDropOwner?.beginPointer(input)||null;}
  updateDrag(input){return this.structured?.dragDropOwner?.updatePointer(input)||null;}
  cancelDrag(reason){return this.structured?.dragDropOwner?.cancelPointer(reason)||null;}
  commitDrag(input){return this.structured?.dragDropOwner?.commitPointer(input)||null;}
  resolveDirection(input){return this.structured?.inputDirectionResolver?.resolve(input)||null;}
  projectRichBlock(block,options={}){return this.structured?.richContentOwner?.projectBlock(block,options)||null;}
  sanitizeRichInline(html){return this.structured?.richContentOwner?.sanitizeInline(html)||null;}
  attachRuntimeSession(session){const sessionId=typeof session==='string'?session:session?.id;if(!this.operationalSession||!sessionId)return null;return this.operationalSession.attachProviderSession(this.simulation,sessionId,{classification:'REAL_RUNTIME_PROVIDER',evidenceRole:'Runs canonical runtime provider'});}
  operationalSnapshot(){return this.operationalSession?.snapshot()||null;}
  validateEpistemic(input){return validateEpistemicStateDescriptor(input);}
  projectEpistemic(input){return projectEpistemicState(input);}
  feedbackFromEpistemic(input,options={}){return toAccessibilityFeedbackInput(input,options);}
  requestConfirmation(input,{onReceipt=null}={}){if(!this.confirmationProjector)return this.confirmationHost.request(input);this.confirmationProjector.onReceipt=onReceipt;return this.confirmationProjector.present(input);}
  closeSettings(reason='explicit'){if(!this.settings)return false;const r=this.settings.close(reason);this.settingsBackdrop?.remove?.();this.settingsBackdrop=null;return r;}
  openSettings(invoker=null){
    if(!this.settings||!this.document?.body)return false;
    if(this.settings.presentation.open)return this.closeSettings('second-activation');
    this.settingsBackdrop?.remove?.();const backdrop=this.document.createElement('div');backdrop.className='backdrop';backdrop.dataset.wave4Settings='SettingsCenterOwner';backdrop.innerHTML=`<section class="dialog" data-settings-host></section>`;this.document.body.append(backdrop);this.settingsBackdrop=backdrop;
    const host=backdrop.querySelector('[data-settings-host]');
    this.settings.open(invoker,{profile:this.profile,familySections:this.familySettings,element:backdrop,modal:true,outsideDismiss:true});
    const focusPreference=(key,value=null,range=false)=>{const selector=range?'[data-settings-preference-range]':'[data-settings-preference]',controls=[...host.querySelectorAll(selector)],matches=controls.filter(control=>(range?control.dataset.settingsPreferenceRange:control.dataset.settingsPreference)===key),target=value===null?matches[0]:matches.find(control=>control.dataset.settingsValue===String(value))||matches[0];target?.focus?.();};
    const applyPreference=(key,value)=>{this.settings.setPreference(key,value);this.wave3.workspace.applyPreferences();const applied=this.preferences.values();this.document.body.dataset.density=applied.density;this.document.body.dataset.motion=applied.motion;this.document.body.dataset.contrast=applied.highContrast?'high':'normal';this.document.body.dataset.focusIndicators=String(applied.focusIndicators);return this.preferences.resolve(key).preferredValue;};
    const render=({focusSearch=false,focusSectionId=null,focusPreferenceKey=null,focusPreferenceValue=null,focusRange=false}={})=>{host.innerHTML=this.settings.render(this.profile,this.familySettings);this.wave3?.applyScale?.();if(focusSearch){const search=host.querySelector('[data-settings-search]');search?.focus?.();const end=search?.value?.length??0;search?.setSelectionRange?.(end,end);}else if(focusSectionId){[...host.querySelectorAll('[data-settings-disclosure]')].find(button=>button.dataset.settingsDisclosure===focusSectionId)?.focus?.();}else if(focusPreferenceKey)focusPreference(focusPreferenceKey,focusPreferenceValue,focusRange);};
    backdrop.addEventListener('click',event=>{const target=event.target?.closest?.('[data-action="close-settings-panel"],[data-settings-preference],[data-settings-disclosure]');if(!target||!backdrop.contains(target))return;if(target.matches('[data-action="close-settings-panel"]')){event.preventDefault();this.closeSettings('explicit');return}if(target.matches('[data-settings-preference]')){event.preventDefault();const key=target.dataset.settingsPreference,value=applyPreference(key,target.dataset.settingsValue);render({focusPreferenceKey:key,focusPreferenceValue:value});return}const sectionId=target.dataset.settingsDisclosure;this.settings.toggleSection(sectionId,this.profile,this.familySettings);render({focusSectionId:sectionId});});
    backdrop.addEventListener('input',event=>{const target=event.target;if(target?.matches?.('[data-settings-search]')){this.settings.setQuery(target.value);render({focusSearch:true});return}if(!target?.matches?.('[data-settings-preference-range]'))return;const key=target.dataset.settingsPreferenceRange,value=applyPreference(key,target.value);target.value=String(value);const output=target.closest('.settings-range')?.querySelector('output');if(output)output.textContent=String(value);});
    backdrop.addEventListener('change',event=>{const target=event.target;if(!target?.matches?.('[data-settings-preference-range]'))return;const key=target.dataset.settingsPreferenceRange,current=this.preferences.resolve(key).preferredValue;if(Number(target.value)!==Number(current))applyPreference(key,target.value);render({focusPreferenceKey:key,focusRange:true});});
    backdrop.addEventListener('keydown',event=>{const disclosure=event.target?.closest?.('[data-settings-disclosure]');if(!disclosure||!backdrop.contains(disclosure))return;const result=this.settings.handleDisclosureKey(event,this.profile,this.familySettings);if(result.handled)render({focusSectionId:result.focusSectionId});});
    backdrop.addEventListener('pointerdown',event=>{if(event.target===backdrop)this.closeSettings('outside-pointer')});render();host.querySelector('[data-settings-search]')?.focus();return this.settings.snapshot(this.profile,this.familySettings);
  }
  snapshot(){return {contract:this.contract,structuredInput:this.structuredInput?.descriptor?.()||null,structuredOwners:this.structured?{action:this.structured.actionDescriptorOwner?.owner||null,direction:this.structured.inputDirectionResolver?.owner||null,rich:this.structured.richContentOwner?.owner||null,dropTarget:this.structured.dropTargetOwner?.owner||null,dragDrop:this.structured.dragDropOwner?.owner||null}:null,settings:this.settings?.snapshot(this.profile,this.familySettings)||null,operational:this.operationalSnapshot(),confirmation:this.confirmationHost.snapshot(),operationalMaturity:this.operationalSession?'BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN':null};}
}

export function mountWave4FamilyInteractionAssembly(options){return new Wave4FamilyInteractionAssembly(options).mount();}
