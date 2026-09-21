from pathlib import Path
import csv, json, subprocess, sys

root=Path(__file__).resolve().parents[1]
BASELINE='CEP-FR-E14-W4-FAMILY-INTERACTION'

def load(path): return json.loads((root/path).read_text())
def dump(path,value): (root/path).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def read_csv(path):
    with (root/path).open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
def write_csv(path,rows):
    rows=list(rows)
    with (root/path).open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)

def upsert(items,key,value):
    for i,item in enumerate(items):
        if item.get(key)==value.get(key): items[i]=value; return
    items.append(value)

# Component registry: keep conceptual IDs but bind accepted executable physical owners.
components=load(Path('contracts/COMPONENT_REGISTRY.json'))
updates={
 'ContextInspector':dict(component_id='ContextInspector',semantic_core='SC-004',implementation='dist/foundation/global/context-inspector.js + dist/adapters/context-library-structured.js + dist/adapters/context-spatial.js',slots=['RIGHT','TRANSIENT'],status='CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER',duplicate_policy='ContextInspectorHost is the only reusable inspector lifecycle/presentation owner; descriptor payload truth remains provider/domain-owned'),
 'BottomShelf':dict(component_id='BottomShelf',semantic_core='SC-005',implementation='dist/foundation/global/bottom-shelf.js + dist/adapters/structured-bottom-provider.js + dist/adapters/operational-bottom-provider.js',slots=['BOTTOM'],status='CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER',duplicate_policy='BottomDeepWorkOwner owns open/close/inert/focus/provider lifecycle; provider content remains family/domain-owned'),
 'StatusFeedback':dict(component_id='StatusFeedback',semantic_core='SC-022',implementation='dist/foundation/global/feedback.js',slots=['GLOBAL','TRANSIENT'],status='CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER',duplicate_policy='AccessibilityFeedbackOwner projects source truth only; no domain status invention or duplicate aria-live owner'),
 'GlobalInputKeymap':dict(component_id='GlobalInputKeymap',semantic_core='SC-020',implementation='dist/foundation/global/input-keymap.js + dist/foundation/global/region-cycle.js + dist/foundation/global/input-ownership-contract.js',slots=['TOP','TOOLBAR','LEFT','CENTER','RIGHT','BOTTOM','TRANSIENT'],status='CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER',duplicate_policy='GlobalInputKeymapOwner alone owns global shortcuts/F6/Escape routing; family keymaps keep family semantics'),
 'UIScalePolicy':dict(component_id='UIScalePolicy',semantic_core='SC-007',implementation='dist/foundation/global/preferences/ui-scale.js + dist/foundation/global/tokens/scale.css',slots=['GLOBAL'],status='CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_POLICY',duplicate_policy='UIScalePolicyOwner projects application-chrome scale only; no document/canvas zoom, density or responsive ownership')
}
for v in updates.values():upsert(components,'component_id',v)
dump(Path('contracts/COMPONENT_REGISTRY.json'),components);write_csv(Path('contracts/COMPONENT_REGISTRY.csv'),components)

# State ownership: keep canonical/provider truth separate from reusable presentation owners.
states=read_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'))
def state_row(state,owner,persistence,forbidden):
    return {'state':state,'owner':owner,'persistence':persistence,'forbidden_write':forbidden}
for row in [
 state_row('global input routing and region-cycle receipts','GlobalInputKeymapOwner','session/derived only','Structured caret semantics; Spatial geometry semantics; domain mutation'),
 state_row('accessibility feedback presentation','AccessibilityFeedbackOwner','transient presentation only','canonical save/error/relation/runtime/status truth invention'),
 state_row('context inspector presentation lifecycle','ContextInspectorHost','session presentation only','document/relation/runtime/selection canonical truth'),
 state_row('bottom deep-work presentation lifecycle','BottomDeepWorkOwner','session presentation only','Structured history content; runtime/session canonical truth'),
 state_row('application chrome UI scale projection','UIScalePolicyOwner','derived from ScopedPreferencesOwner scale value','document zoom; Spatial/canvas zoom; density; responsive breakpoints')]:
    found=False
    for i,x in enumerate(states):
        if x['state']==row['state']:states[i]=row;found=True;break
    if not found:states.append(row)
write_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'),states)

# Runtime executable registry.
runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
runtime['baselineId']=BASELINE
runtime['status']='CONTROLLER_ACCEPTED_WAVE3_SUCCESSOR_CONTENT'
runtime['stackStatus']='STACK_NOT_FROZEN'
runtime['wave3Status']='CONTROLLER_ACCEPTED_AND_CLOSED_WAVE4_PENDING'
runtime.setdefault('registries',{})['wave3ControllerAssemblyProof']='assurance/W3_CONTROLLER_ASSEMBLY_BROWSER_PROOF.json'
rc={
 'GlobalInputKeymap':{'id':'GlobalInputKeymap','presentationOwner':None,'stateOwner':'GlobalInputKeymapOwner active global keymap context + region-cycle receipts','implementation':['dist/foundation/global/input-keymap.js','dist/foundation/global/region-cycle.js','dist/foundation/global/input-ownership-contract.js'],'duplicatePolicy':'ONE_GLOBAL_KEYDOWN_SEMANTIC_OWNER; FAMILY_KEYMAPS_KEEP_FAMILY_SEMANTICS'},
 'AccessibilityFeedback':{'id':'AccessibilityFeedback','presentationOwner':'AccessibilityFeedbackOwner','stateOwner':'Transient feedback presentation only; source truth remains supplying owner','implementation':['dist/foundation/global/feedback.js','dist/foundation/global/feedback-contract.js'],'duplicatePolicy':'ONE_ACCESSIBLE_FEEDBACK_PROJECTOR; NO_CANONICAL_STATUS_INVENTION'},
 'ContextInspector':{'id':'ContextInspector','presentationOwner':'ContextInspectorHost','stateOwner':'Active descriptor/lens presentation only; descriptor payload remains provider/domain-owned','implementation':['dist/foundation/global/context-inspector.js','dist/foundation/global/context-descriptor-contract.js','dist/adapters/context-library-structured.js','dist/adapters/context-spatial.js'],'duplicatePolicy':'ONE_CONTEXT_INSPECTOR_HOST; DOMAIN_FIELDS_VIA_DESCRIPTOR_ONLY'},
 'BottomDeepWork':{'id':'BottomDeepWork','presentationOwner':'BottomDeepWorkOwner','stateOwner':'Open/closed/inert/focus/provider presentation lifecycle only','implementation':['dist/foundation/global/bottom-shelf.js','dist/foundation/global/bottom-provider-contract.js','dist/adapters/structured-bottom-provider.js','dist/adapters/operational-bottom-provider.js'],'duplicatePolicy':'ONE_BOTTOM_LIFECYCLE_OWNER; PROVIDER_CONTENT_REMAINS_EXTERNAL'},
 'UIScalePolicy':{'id':'UIScalePolicy','presentationOwner':'UIScalePolicyOwner','stateOwner':'Derived application-chrome scale projection; value/persistence owned by ScopedPreferencesOwner','implementation':['dist/foundation/global/preferences/ui-scale.js','dist/foundation/global/tokens/scale.css'],'duplicatePolicy':'ONE_UI_SCALE_POLICY; NEVER_ALIAS_TO_DOCUMENT_OR_CANVAS_ZOOM_OR_DENSITY'},
 'Wave3GlobalAssembly':{'id':'Wave3GlobalAssembly','presentationOwner':'ControllerIntegrationHost composition only','stateOwner':'NONE_SEMANTIC; composes accepted owners','implementation':['dist/foundation/wave3-assembly.js','dist/main.js'],'duplicatePolicy':'COMPOSITION_ONLY_NOT_A_PARALLEL_SEMANTIC_OWNER'}
}
# Update prior ContextInspector record and append the rest.
for v in rc.values():upsert(runtime['components'],'id',v)
runtime['controllerConvergence']={'wave':'WAVE_3','order':['GlobalInputKeymapOwner','AccessibilityFeedbackOwner','ContextInspectorHost','BottomDeepWorkOwner','UIScalePolicyOwner'],'compositionOwner':'ControllerIntegrationHost','semanticOwner':False,'browserLegacy':'6/6 PASS','browserWave3Integration':'5/5 PASS','model':'210/210 PASS'}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)

# Versioned contracts.
versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'));versions['baselineId']=BASELINE
for c in [
 {'id':'GlobalInputKeymapOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_GLOBAL_INPUT_OWNER','consumers':['structured','spatial','operational','global-proof'],'breakingRule':'Global shortcut/F6/Escape/input-ownership semantics require affected-family migration.'},
 {'id':'AccessibilityFeedbackOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_PRESENTATION_FEEDBACK_OWNER','consumers':['all-composed-surfaces'],'breakingRule':'Source-truth validation or announcement lifecycle changes require presentation-consumer review; canonical truth may never move here.'},
 {'id':'ContextInspectorHost','version':'1.0.0','changeType':'INITIAL_ACCEPTED_GLOBAL_CONTEXT_HOST','consumers':['library','visualize','future-context-aware'],'breakingRule':'Host lifecycle/descriptor projection changes require provider compatibility proof; domain payload semantics remain provider-owned.'},
 {'id':'BottomDeepWorkOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_GLOBAL_BOTTOM_OWNER','consumers':['structured','operational','future-deep-work'],'breakingRule':'Open/close/inert/focus/provider lifecycle changes require provider migration proof.'},
 {'id':'UIScalePolicyOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_GLOBAL_UI_SCALE_POLICY','consumers':['all-application-chrome'],'breakingRule':'Scale token/projection changes require chrome geometry proof and must not alter document/canvas zoom, density or responsive semantics.'}
]:upsert(versions['contracts'],'id',c)
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)

# Mechanic ownership registry.
mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'));mechanics['baselineId']=BASELINE
records=mechanics['records']
for r in [
 {'mechanicId':'global.input-keymap','status':'FOUNDATION_OWNER','familyOwner':'GlobalInputKeymapOwner','semanticCommandOwner':'SemanticCommandBus for dispatched global commands','canonicalStateOwner':'GlobalInputKeymapOwner transient input context/receipts only','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':'family input-ownership descriptor only','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/global/input-keymap.js','dist/foundation/global/region-cycle.js']},
 {'mechanicId':'global.accessibility-feedback','status':'FOUNDATION_OWNER','familyOwner':'AccessibilityFeedbackOwner','semanticCommandOwner':'supplying command/domain owner; feedback only projects','canonicalStateOwner':'supplying source truth; AccessibilityFeedbackOwner owns no domain truth','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':None,'approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/global/feedback.js']},
 {'mechanicId':'workspace.context-inspector','status':'FOUNDATION_OWNER','familyOwner':'ContextInspectorHost','semanticCommandOwner':'ContextInspectorHost host actions only','canonicalStateOwner':'Domain/family ContextDescriptorProvider payload; host owns presentation lifecycle only','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':'ContextDescriptorProvider','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/global/context-inspector.js']},
 {'mechanicId':'workspace.bottom-deep-work','status':'FOUNDATION_OWNER','familyOwner':'BottomDeepWorkOwner','semanticCommandOwner':'BottomDeepWorkOwner bounded bottom lifecycle actions','canonicalStateOwner':'provider-owned content; owner holds presentation lifecycle only','applicableFamilies':['Structured','OperationalTerminal','SpatialRelation'],'requiredAdapter':'BottomDeepWorkProviderContract','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/global/bottom-shelf.js']},
 {'mechanicId':'global.ui-scale','status':'FOUNDATION_OWNER','familyOwner':'UIScalePolicyOwner','semanticCommandOwner':'ScopedPreferencesOwner remains preference value/persistence authority','canonicalStateOwner':'derived chrome token/geometry projection only','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':None,'approvedDeviations':[],'implementation':['dist/foundation/global/preferences/ui-scale.js','dist/foundation/global/tokens/scale.css']}
]:upsert(records,'mechanicId',r)
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)

# Core conceptual registry -> current executable truth for accepted Wave 3 owners.
core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
core_updates={
 'SC-004':('ContextInspectorHost','dist/foundation/global/context-inspector.js','Context payload/canonical meaning remains provider/domain-owned; host owns presentation lifecycle only.'),
 'SC-005':('BottomDeepWorkOwner','dist/foundation/global/bottom-shelf.js','Provider history/runtime/analysis content remains provider-owned; owner owns shell lifecycle/focus only.'),
 'SC-020':('GlobalInputKeymapOwner','dist/foundation/global/input-keymap.js + dist/foundation/global/region-cycle.js','Family caret/geometry semantics remain in family keymaps; IME composition is never globally reinterpreted.'),
 'SC-022':('AccessibilityFeedbackOwner','dist/foundation/global/feedback.js','Canonical error/save/relation/runtime truth remains with supplying owner; feedback is presentation-only.'),
 'SC-007':('ScopedPreferencesOwner + UIScalePolicyOwner','dist/foundation/global/preferences/store.js + dist/foundation/global/preferences/ui-scale.js','Preference value/persistence stays ScopedPreferencesOwner; UI scale is derived application-chrome projection only.')
}
for row in core:
    if row.get('foundation_id') in core_updates:
        owner,impl,boundary=core_updates[row['foundation_id']]
        row['current_executable_owner']=owner;row['implementation']=impl;row['implementation_status']='CONTROLLER_ACCEPTED_EXECUTABLE_OWNER_M6';row['physical_implementation_status']='CONTROLLER_ACCEPTED_EXECUTABLE_OWNER';row['new_foundation_authority']='CONTROLLER_ACCEPTED_EXECUTABLE_OWNER';row['effective_hard_boundary']=boundary
dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)

# Writer intake + schema and deviation baseline.
writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json'));writer['foundationBaseline']=BASELINE
for item in ['GlobalInputKeymap','AccessibilityFeedback','ContextInspector','BottomDeepWork','UIScalePolicy']:
    if item not in writer['inheritedGlobalComponents']:writer['inheritedGlobalComponents'].append(item)
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)
schema=load(Path('contracts/schemas/writer_intake.schema.json'));schema['properties']['foundationBaseline']['const']=BASELINE;dump(Path('contracts/schemas/writer_intake.schema.json'),schema)
dev=load(Path('contracts/DEVIATION_REGISTER.json'));dev['baselineId']=BASELINE;dump(Path('contracts/DEVIATION_REGISTER.json'),dev)

# Wave 4 accepted owner truth. This block intentionally runs after Wave 3 reconciliation.
# It MUST preserve the bounded maturity ceiling for OperationalSessionOwner.

# Components.
components=load(Path('contracts/COMPONENT_REGISTRY.json'))
w4_components=[
 {'component_id':'SettingsCenter','semantic_core':'SC-009','implementation':'dist/foundation/global/settings/center.js + dist/foundation/global/settings/sections.js + dist/foundation/global/settings/search.js','slots':['TRANSIENT'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER_M6','duplicate_policy':'SettingsCenterOwner owns presentation/disclosure/search only; ScopedPreferencesOwner owns values/persistence; family applicability must be explicit.'},
 {'component_id':'InputDirectionResolver','semantic_core':'SC-013','implementation':'dist/foundation/global/input-direction.js + dist/foundation/contracts/platform-input-direction-bridge.js','slots':['CENTER','TRANSIENT'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER_M6','duplicate_policy':'One transient direction resolver; explicit content direction wins; no semantic-language inference or surface-local heuristic owner.'},
 {'component_id':'StructuredInputKeymap','semantic_core':'SC-020','implementation':'dist/foundation/structured/input-keymap.js + dist/foundation/structured/caret-bridge.js + dist/foundation/structured/shorthand.js','slots':['CENTER'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_OWNER_M6','duplicate_policy':'StructuredInputKeymapOwner alone owns Structured editor key/caret/composition/shorthand semantics; global shortcuts remain GlobalInputKeymapOwner.'},
 {'component_id':'StructuredActionDescriptors','semantic_core':'SC-017','implementation':'dist/foundation/structured/action-descriptors.js + dist/foundation/structured/insertion-targets.js','slots':['CENTER','TRANSIENT'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_OWNER_M6','duplicate_policy':'One Structured action descriptor truth for palette/menu/keyboard/Shift+F10; mutation and confirmation presentation remain delegated.'},
 {'component_id':'StructuredRichContent','semantic_core':'SC-030','implementation':'dist/foundation/structured/rich-content.js + dist/foundation/structured/code-block.js + dist/foundation/structured/sanitization-policy.js + dist/foundation/structured/direction-adapter.js','slots':['CENTER'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_OWNER_M6','duplicate_policy':'StructuredRichContentOwner owns safe rich/code/bidi presentation policy; ClipboardTrust owns clipboard trust and document mutation stays outside renderer.'},
 {'component_id':'StructuredDragDrop','semantic_core':'SC-030','implementation':'dist/foundation/structured/drag-drop.js + dist/foundation/structured/drop-target.js','slots':['CENTER'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_OWNER_M6','duplicate_policy':'StructuredDragDropOwner owns drag intent/target/autoscroll projection; StructuredMutationKernel owns actual document mutation.'},
 {'component_id':'OperationalSessionBoundary','semantic_core':'SC-006','implementation':'dist/foundation/operational/session-owner.js + dist/foundation/operational/terminal-host.js + dist/foundation/contracts/runtime-adapter.js','slots':['CENTER','BOTTOM','TRANSIENT'],'status':'CONTROLLER_ACCEPTED_BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN','duplicate_policy':'OperationalSessionOwner owns provider-neutral session presentation/attachment identity only; RuntimeAdapter owns causal runtime truth; no fake second provider.'},
 {'component_id':'EpistemicStateContract','semantic_core':'SC-023','implementation':'dist/foundation/contracts/epistemic-state.js','slots':['GLOBAL'],'status':'CONTROLLER_ACCEPTED_CONTRACT_M4_IMPLEMENT_ON_DEMAND','duplicate_policy':'Shared epistemic vocabulary/refusal contract only; domain supplies cause/status/copy; no generic async/status engine.'},
 {'component_id':'ConfirmationSafetyHost','semantic_core':'SC-026','implementation':'dist/foundation/global/confirmation-host.js','slots':['TRANSIENT'],'status':'CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_PRESENTATION_HOST','duplicate_policy':'Consumes explicit destructive-risk descriptors only; never guesses risk and never becomes mutation/action semantic owner.'},
 {'component_id':'Wave4FamilyInteractionAssembly','semantic_core':'SC-017','implementation':'dist/foundation/wave4-assembly.js + dist/main.js','slots':['GLOBAL'],'status':'CONTROLLER_ACCEPTED_COMPOSITION_ONLY','duplicate_policy':'Controller composition only; semanticOwner=false; never a substitute for Global/Family/Domain owners.'}
]
for v in w4_components: upsert(components,'component_id',v)
dump(Path('contracts/COMPONENT_REGISTRY.json'),components);write_csv(Path('contracts/COMPONENT_REGISTRY.csv'),components)

# State ownership.
states=read_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'))
for row in [
 state_row('settings center disclosure/search presentation','SettingsCenterOwner','session presentation only','preference values/persistence; command semantics; family keyboard semantics; domain configuration'),
 state_row('transient input direction hint','InputDirectionResolver','derived/transient only','persisted content direction; semantic language inference; domain language truth'),
 state_row('structured editor key/caret/composition state','StructuredInputKeymapOwner','composition/caret transient state only','canonical document mutation; global shortcut routing; canonical selection truth'),
 state_row('structured action descriptor truth','StructuredActionDescriptorOwner','derived descriptors only','canonical mutation; global transient lifecycle; domain state'),
 state_row('structured rich/code/bidi presentation policy','StructuredRichContentOwner','derived presentation/safe portable representation only','clipboard trust ownership; canonical document truth; domain language truth'),
 state_row('structured drag/drop intent and target projection','StructuredDragDropOwner','pointer/drag transient state only','canonical document mutation; canonical selection; DOM identity as block identity'),
 state_row('operational session presentation attachment','OperationalSessionOwner','session presentation only; BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN','RuntimeAdapter causal runtime/device/session truth; command interpretation; fabricated output'),
 state_row('epistemic state descriptor vocabulary','EpistemicStateContract','contract/derived descriptor only','domain cause/status/copy; async lifecycle engine; invented truth'),
 state_row('confirmation presentation lifecycle','ConfirmationSafetyHost','transient presentation only','destructive-risk meaning; action semantics; mutation ownership')]:
    found=False
    for i,x in enumerate(states):
        if x['state']==row['state']: states[i]=row;found=True;break
    if not found: states.append(row)
write_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'),states)

# Runtime registry.
runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
runtime['baselineId']=BASELINE
runtime['status']='CONTROLLER_ACCEPTED_WAVE4_SUCCESSOR_CONTENT'
runtime['stackStatus']='STACK_NOT_FROZEN'
runtime['wave3Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave4Status']='CONTROLLER_ACCEPTED_AND_CLOSED_WAVE5_PENDING'
runtime.setdefault('registries',{})['wave4ControllerConvergenceProof']='assurance/W4_CONTROLLER_CONVERGENCE_BROWSER_PROOF.json'
for v in [
 {'id':'SettingsCenter','presentationOwner':'SettingsCenterOwner','stateOwner':'Presentation/disclosure/search only; ScopedPreferencesOwner owns values/persistence','implementation':['dist/foundation/global/settings/center.js','dist/foundation/global/settings/sections.js','dist/foundation/global/settings/search.js'],'duplicatePolicy':'ONE_SETTINGS_CENTER; EXPLICIT_PROFILE_APPLICABILITY; NO_SECOND_PREFERENCE_STORE'},
 {'id':'InputDirectionResolver','presentationOwner':'InputDirectionResolver','stateOwner':'Transient direction hint only; persisted content direction remains content-owned','implementation':['dist/foundation/global/input-direction.js','dist/foundation/contracts/platform-input-direction-bridge.js'],'duplicatePolicy':'ONE_DIRECTION_POLICY; INVALID_HINTS_USE_TRUTHFUL_POLICY_FALLBACK; NO_LANGUAGE_INFERENCE'},
 {'id':'StructuredInputKeymap','presentationOwner':'StructuredInputKeymapOwner','stateOwner':'Composition/caret transient behavior only','implementation':['dist/foundation/structured/input-keymap.js','dist/foundation/structured/caret-bridge.js','dist/foundation/structured/shorthand.js'],'duplicatePolicy':'ONE_STRUCTURED_KEY_SEMANTIC_OWNER; GLOBAL_KEYS_REMAIN_GLOBAL'},
 {'id':'StructuredActionDescriptors','presentationOwner':'StructuredActionDescriptorOwner','stateOwner':'Derived insertion/action/confirmation descriptors only','implementation':['dist/foundation/structured/action-descriptors.js','dist/foundation/structured/insertion-targets.js'],'duplicatePolicy':'ONE_STRUCTURED_ACTION_DESCRIPTOR_TRUTH; MUTATION_DELEGATED'},
 {'id':'StructuredRichContent','presentationOwner':'StructuredRichContentOwner','stateOwner':'Safe rich/code/bidi projection only','implementation':['dist/foundation/structured/rich-content.js','dist/foundation/structured/code-block.js','dist/foundation/structured/sanitization-policy.js','dist/foundation/structured/direction-adapter.js'],'duplicatePolicy':'ONE_STRUCTURED_RICH_POLICY; CLIPBOARD_TRUST_AND_DOCUMENT_TRUTH_EXTERNAL'},
 {'id':'StructuredDragDrop','presentationOwner':'StructuredDragDropOwner','stateOwner':'Drag intent/target/autoscroll transient projection only','implementation':['dist/foundation/structured/drag-drop.js','dist/foundation/structured/drop-target.js'],'duplicatePolicy':'ONE_STRUCTURED_DROP_TARGET_POLICY; ACTUAL_MUTATION_DELEGATED'},
 {'id':'OperationalSessionBoundary','presentationOwner':'OperationalSessionOwner','stateOwner':'Provider-neutral session presentation + provider attachment identity only; BELOW M6','implementation':['dist/foundation/operational/session-owner.js','dist/foundation/operational/terminal-host.js','dist/foundation/contracts/runtime-adapter.js'],'duplicatePolicy':'SECOND_REAL_PROVIDER_NOT_PROVEN; RUNTIME_ADAPTER_OWNS_CAUSAL_TRUTH; NO_FAKE_TERMINAL'},
 {'id':'EpistemicStateContract','presentationOwner':None,'stateOwner':'Typed epistemic descriptor/refusal vocabulary only; domain supplies canonical truth','implementation':['dist/foundation/contracts/epistemic-state.js'],'duplicatePolicy':'CONTRACT_ONLY_M4; NO_GENERIC_ASYNC_ENGINE; CONTRADICTORY_SOURCE_TRUTH_REFUSED'},
 {'id':'ConfirmationSafetyHost','presentationOwner':'ConfirmationSafetyHost','stateOwner':'Explicit destructive-risk presentation only','implementation':['dist/foundation/global/confirmation-host.js'],'duplicatePolicy':'NEVER_GUESS_RISK; NEVER_OWN_MUTATION_OR_FAMILY_ACTION_MEANING'},
 {'id':'Wave4FamilyInteractionAssembly','presentationOwner':'Controller composition only','stateOwner':'NONE_SEMANTIC; composes accepted Wave4 owners','implementation':['dist/foundation/wave4-assembly.js','dist/main.js'],'duplicatePolicy':'COMPOSITION_ONLY_SEMANTIC_OWNER_FALSE'}
]: upsert(runtime['components'],'id',v)
# Family engines: subordinate Structured mechanics accepted, final StructuredSurfaceHost still Wave 5.
for eng in runtime.get('familyEngines',[]):
    if eng.get('id')=='Structured':
        eng['engine']='Structured Tree/Mutation/Transaction/Availability/Selection/Clipboard + StructuredInputKeymapOwner + StructuredActionDescriptorOwner + StructuredRichContentOwner + StructuredDragDropOwner; final StructuredSurfaceHost convergence remains Wave5'
        eng['proofConsumers']=['library','learn']
        eng['wave5HostPending']=True
    if eng.get('id')=='OperationalTerminal':
        eng['engine']='OperationalSessionOwner bounded provider-neutral presentation + RuntimeAdapter causal truth'
        eng['proofConsumers']=['runs']
        eng['maturity']='BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN'
runtime['controllerConvergence']={
 'wave':'WAVE_4',
 'order':['StructuredInputKeymapOwner','StructuredActionDescriptorOwner','InputDirectionResolver + StructuredRichContentOwner','StructuredDragDropOwner','SettingsCenterOwner','OperationalSessionOwner(boundary-only)','EpistemicStateContract + ConfirmationSafetyHost'],
 'compositionOwner':'Wave4FamilyInteractionAssembly','semanticOwner':False,
 'operationalMaturity':'BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN',
 'wave5StructuredSurfaceHostPending':True,
 'browserLegacy':'6/6 PASS','browserWave3Integration':'5/5 PASS','browserWave4Integration':'5/5 PASS','model':'210/210 PASS'
}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)

# Versioned contracts.
versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'));versions['baselineId']=BASELINE
for c in [
 {'id':'StructuredInputKeymapOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_STRUCTURED_INPUT_OWNER','consumers':['library','learn','future-structured'],'breakingRule':'Enter/Tab/Backspace/caret/composition/shorthand changes require Structured consumer migration and IME proof.'},
 {'id':'StructuredActionDescriptorOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_STRUCTURED_ACTION_DESCRIPTOR_OWNER','consumers':['library','learn','future-structured'],'breakingRule':'Insertion/action/confirmation descriptor changes require route convergence and mutation-delegation proof.'},
 {'id':'InputDirectionResolver','version':'1.0.0','changeType':'INITIAL_ACCEPTED_INPUT_DIRECTION_OWNER','consumers':['structured','notes-fixture','mixed-script-forms'],'breakingRule':'Direction precedence/provenance changes require explicit rtl/ltr/platform/fallback proof and must never infer semantic language.'},
 {'id':'StructuredRichContentOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_STRUCTURED_RICH_CONTENT_OWNER','consumers':['library','learn','note-content-fixture'],'breakingRule':'Sanitization/code/bidi/portable-rich changes require security and clipboard-boundary proof.'},
 {'id':'StructuredDragDropOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_STRUCTURED_DRAG_DROP_OWNER','consumers':['library','learn'],'breakingRule':'Drop-target/autoscroll/drag semantics changes require pointer-keyboard parity and canonical mutation delegation proof.'},
 {'id':'SettingsCenterOwner','version':'1.0.0','changeType':'INITIAL_ACCEPTED_GLOBAL_SETTINGS_CENTER','consumers':['all-applicable-profiles'],'breakingRule':'Group/search/disclosure/applicability changes require Structured and non-Structured profile proof; preference storage may never move here.'},
 {'id':'OperationalSessionOwner','version':'0.9.0','changeType':'ACCEPTED_BOUNDED_PROVIDER_NEUTRAL_BOUNDARY_BELOW_M6','consumers':['runs'],'breakingRule':'No M6 claim until a second genuine runtime provider exists; RuntimeAdapter causal truth and raw input semantics remain provider-owned.'},
 {'id':'EpistemicStateContract','version':'0.4.0','changeType':'ACCEPTED_CONTRACT_M4_IMPLEMENT_ON_DEMAND','consumers':['local-fixture-domain','runtime-backed-domain','future-domains'],'breakingRule':'State vocabulary/truth-conflict rules may not infer cause/copy/retry/status or build a generic async engine.'},
 {'id':'ConfirmationSafetyHost','version':'1.0.0','changeType':'INITIAL_ACCEPTED_CONFIRMATION_PRESENTATION_HOST','consumers':['structured-actions','future-explicit-risk-descriptors'],'breakingRule':'Host only consumes explicit destructive-risk descriptors; risk meaning and mutation remain external.'}
]: upsert(versions['contracts'],'id',c)
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)

# Mechanic ownership.
mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'));mechanics['baselineId']=BASELINE
records=mechanics['records']
for r in [
 {'mechanicId':'structured.input-keymap','status':'FAMILY_OWNER','familyOwner':'StructuredInputKeymapOwner','semanticCommandOwner':'StructuredInputKeymapOwner delegates commands through SemanticCommandBus/accepted Structured owners','canonicalStateOwner':'StructuredInputKeymapOwner transient caret/composition only; StructuredSelectionKernel/document owners retain canonical state','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/input-keymap.js','dist/foundation/structured/caret-bridge.js','dist/foundation/structured/shorthand.js']},
 {'mechanicId':'structured.action-descriptors','status':'FAMILY_OWNER','familyOwner':'StructuredActionDescriptorOwner','semanticCommandOwner':'StructuredCommandAvailabilityOwner + StructuredMutationKernel/transaction owner for execution','canonicalStateOwner':'Derived descriptors only','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/action-descriptors.js','dist/foundation/structured/insertion-targets.js']},
 {'mechanicId':'global.input-direction','status':'FOUNDATION_OWNER','familyOwner':'InputDirectionResolver','semanticCommandOwner':'none','canonicalStateOwner':'Transient input-direction hint only; persisted direction stays content-owned','applicableFamilies':['Structured','Notes'],'requiredAdapter':'optional PlatformInputDirectionBridge','approvedDeviations':[],'implementation':['dist/foundation/global/input-direction.js','dist/foundation/contracts/platform-input-direction-bridge.js']},
 {'mechanicId':'structured.rich-content','status':'FAMILY_OWNER','familyOwner':'StructuredRichContentOwner','semanticCommandOwner':'Structured family commands; ClipboardTrust remains clipboard owner','canonicalStateOwner':'Derived safe rich/code/bidi representation only','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/rich-content.js','dist/foundation/structured/code-block.js','dist/foundation/structured/sanitization-policy.js','dist/foundation/structured/direction-adapter.js']},
 {'mechanicId':'structured.drag-drop','status':'FAMILY_OWNER','familyOwner':'StructuredDragDropOwner','semanticCommandOwner':'StructuredMutationKernel + StructuredTransactionHistoryRecoveryOwner for actual reorder','canonicalStateOwner':'StructuredDragDropOwner transient intent/target; selection/document truth external','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter + thin DOM geometry bridge','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/drag-drop.js','dist/foundation/structured/drop-target.js']},
 {'mechanicId':'global.settings-center','status':'FOUNDATION_OWNER','familyOwner':'SettingsCenterOwner','semanticCommandOwner':'SemanticCommandBus; ScopedPreferencesOwner owns values/persistence','canonicalStateOwner':'Settings presentation/disclosure/search only','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':'profile/family descriptor applicability','approvedDeviations':[],'implementation':['dist/foundation/global/settings/center.js','dist/foundation/global/settings/sections.js','dist/foundation/global/settings/search.js']},
 {'mechanicId':'operational.sessions','status':'BOUNDED_BELOW_M6','familyOwner':'OperationalSessionOwner','semanticCommandOwner':'RuntimeAdapter provider owns input meaning; session owner owns presentation routes only','canonicalStateOwner':'RuntimeAdapter owns causal session/device/output truth; OperationalSessionOwner owns presentation/attachment identity','applicableFamilies':['OperationalTerminal'],'requiredAdapter':'RuntimeAdapter','approvedDeviations':[],'implementation':['dist/foundation/operational/session-owner.js','dist/foundation/operational/terminal-host.js','dist/foundation/contracts/runtime-adapter.js'],'maturityBoundary':'SECOND_REAL_PROVIDER_NOT_PROVEN'},
 {'mechanicId':'global.epistemic-state-contract','status':'CONTRACT_M4','familyOwner':'EpistemicStateContract','semanticCommandOwner':'none','canonicalStateOwner':'Domain supplies truth; contract validates vocabulary/contradictions only','applicableFamilies':['Structured','SpatialRelation','OperationalTerminal'],'requiredAdapter':'domain epistemic descriptor source','approvedDeviations':[],'implementation':['dist/foundation/contracts/epistemic-state.js']},
 {'mechanicId':'global.confirmation-safety','status':'FOUNDATION_OWNER','familyOwner':'ConfirmationSafetyHost','semanticCommandOwner':'Supplying family/domain action descriptor owns destructive-risk meaning','canonicalStateOwner':'Transient confirmation presentation only','applicableFamilies':['Structured','OperationalTerminal'],'requiredAdapter':'explicit destructive-risk descriptor','approvedDeviations':[],'implementation':['dist/foundation/global/confirmation-host.js']}
]: upsert(records,'mechanicId',r)
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)

# Core conceptual owner mappings.
core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
core_updates={
 'SC-009':('SettingsCenterOwner','dist/foundation/global/settings/center.js + dist/foundation/global/settings/sections.js + dist/foundation/global/settings/search.js','SettingsCenter owns presentation/search/disclosure only; ScopedPreferencesOwner retains preference values/persistence and domain configuration remains outside Settings.' ,'CONTROLLER_ACCEPTED_EXECUTABLE_OWNER_M6'),
 'SC-013':('InputDirectionResolver','dist/foundation/global/input-direction.js','Transient input direction only; explicit persisted content direction wins and semantic/domain language is never inferred.','CONTROLLER_ACCEPTED_EXECUTABLE_OWNER_M6'),
 'SC-017':('StructuredActionDescriptorOwner + ConfirmationSafetyHost','dist/foundation/structured/action-descriptors.js + dist/foundation/global/confirmation-host.js','Structured action meaning remains family-owned; confirmation host consumes explicit risk only; mutation remains canonical Structured owner responsibility.','CONTROLLER_ACCEPTED_EXECUTABLE_OWNER_M6'),
 'SC-020':('GlobalInputKeymapOwner + StructuredInputKeymapOwner','dist/foundation/global/input-keymap.js + dist/foundation/structured/input-keymap.js','Global routing and Structured editor semantics remain separate owners; IME/composition and preventDefault ownership are explicit.','CONTROLLER_ACCEPTED_EXECUTABLE_OWNER_M6'),
 'SC-023':('EpistemicStateContract','dist/foundation/contracts/epistemic-state.js','Contract vocabulary/refusal only; domain supplies status/cause/copy and no generic async engine is authorized.','CONTROLLER_ACCEPTED_CONTRACT_M4'),
 'SC-026':('ConfirmationSafetyHost','dist/foundation/global/confirmation-host.js','Host presents explicit destructive-risk descriptors only; it never guesses risk or owns mutation/action semantics.','CONTROLLER_ACCEPTED_EXECUTABLE_PRESENTATION_HOST'),
 'SC-030':('Structured family subordinate owners (Tree/Mutation/Transaction/Availability/Selection/Clipboard/Input/Actions/Rich/Drag)','dist/foundation/structured.js + dist/foundation/structured/*','Subordinate Structured semantics are accepted; final StructuredSurfaceHost renderer/event convergence remains Wave 5 and is not claimed here.','CONTROLLER_ACCEPTED_SUBORDINATE_OWNERS_WAVE5_HOST_PENDING')
}
for row in core:
    fid=row.get('foundation_id')
    if fid in core_updates:
        owner,impl,boundary,status=core_updates[fid]
        row['current_executable_owner']=owner;row['implementation']=impl;row['implementation_status']=status;row['physical_implementation_status']=status;row['new_foundation_authority']=status;row['effective_hard_boundary']=boundary
dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)

# Settings command owner.
commands=load(Path('contracts/COMMAND_REGISTRY.seed.json'))
for command in commands:
    if command.get('id')=='foundation.settings':
        command['owner']='SettingsCenterOwner'
        command['effect']='Opens the single SettingsCenterOwner presentation; preference values/persistence remain ScopedPreferencesOwner-owned'
dump(Path('contracts/COMMAND_REGISTRY.seed.json'),commands)

# Writer intake/schema/deviation truth.
writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json'));writer['foundationBaseline']=BASELINE
for item in ['SettingsCenter','InputDirectionResolver','EpistemicStateContract','ConfirmationSafetyHost']:
    if item not in writer['inheritedGlobalComponents']: writer['inheritedGlobalComponents'].append(item)
writer['wave4StructuredSubordinateOwners']=['StructuredInputKeymapOwner','StructuredActionDescriptorOwner','StructuredRichContentOwner','StructuredDragDropOwner']
writer['wave4OperationalBoundary']={'owner':'OperationalSessionOwner','status':'BOUNDED_BELOW_M6','secondRealProviderProven':False}
writer['wave5Requirement']='StructuredSurfaceHost final convergence remains required before Structured Surface release.'
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)
schema=load(Path('contracts/schemas/writer_intake.schema.json'));schema['properties']['foundationBaseline']['const']=BASELINE;dump(Path('contracts/schemas/writer_intake.schema.json'),schema)
dev=load(Path('contracts/DEVIATION_REGISTER.json'));dev['baselineId']=BASELINE;dump(Path('contracts/DEVIATION_REGISTER.json'),dev)

# Wave 5 final Controller reconciliation: supersedes Wave 4 pending truth in current registries.
W5_BASELINE='CEP-FR-E15-W5-STRUCTURED-FAMILY-COMPLETION'

# Final executable component registry truth.
components=load(Path('contracts/COMPONENT_REGISTRY.json'))
for v in [
 dict(component_id='UnifiedEditor',semantic_core='SC-030',implementation='dist/foundation/structured.js + dist/foundation/structured/surface-host.js + dist/foundation/structured/block-renderer.js + dist/foundation/structured/presentation-bridge.js + dist/foundation/structured/read-inspection.js + dist/foundation/structured/outline-descriptor.js + dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility integration only)',slots=['CENTER','NOTES'],status='CONTROLLER_ACCEPTED_EXECUTABLE_STRUCTURED_FAMILY_BOUNDARY_M6',duplicate_policy='StructuredSurfaceHost/StructuredNavigationDescriptorOwner orchestrate presentation/descriptors only; StructuredDocumentDomainAdapter and accepted subordinate owners retain canonical truth; Library donor integration remains bounded compatibility glue'),
 dict(component_id='StructuredSurfaceHost',semantic_core='SC-030',implementation='dist/foundation/structured/surface-host.js + dist/foundation/structured/block-renderer.js + dist/foundation/structured/presentation-bridge.js',slots=['CENTER'],status='CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_HOST_M6',duplicate_policy='ONE_STRUCTURED_SURFACE_HOST; presentation/orchestration only; document/mutation/selection/history/domain truth remain accepted Structured owners'),
 dict(component_id='StructuredNavigationDescriptorOwner',semantic_core='SC-030',implementation='dist/foundation/structured/read-inspection.js + dist/foundation/structured/outline-descriptor.js',slots=['CENTER','RIGHT','TRANSIENT'],status='CONTROLLER_ACCEPTED_EXECUTABLE_FAMILY_DESCRIPTOR_OWNER_M6',duplicate_policy='ONE_STRUCTURED_NAVIGATION_DESCRIPTOR_TRUTH; descriptor/read/outline/quick-jump only; no DOM scroll/focus/document/domain-reference/transaction mutation')
]: upsert(components,'component_id',v)
dump(Path('contracts/COMPONENT_REGISTRY.json'),components);write_csv(Path('contracts/COMPONENT_REGISTRY.csv'),components)

# Final Wave 5 derived-state ownership rows.
states=read_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'))
for row in [
 state_row('structured surface presentation orchestration','StructuredSurfaceHost','derived/presentation only','canonical document; mutation; selection; history; domain truth'),
 state_row('structured read-navigation descriptor truth','StructuredNavigationDescriptorOwner','derived descriptors only','DOM scroll/focus; canonical document; domain-reference mutation; transaction history')
]:
    found=False
    for i,x in enumerate(states):
        if x['state']==row['state']: states[i]=row;found=True;break
    if not found: states.append(row)
write_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'),states)

# Final runtime registry.
runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
runtime['baselineId']=W5_BASELINE
runtime['status']='CONTROLLER_ACCEPTED_WAVE5_SUCCESSOR_CONTENT'
runtime['stackStatus']='STACK_NOT_FROZEN'
runtime['wave3Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave4Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave5Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime.setdefault('registries',{})['wave5ControllerFinalAcceptanceProof']='assurance/W5_CONTROLLER_FINAL_ACCEPTANCE.json'
for v in [
 {'id':'UnifiedEditor','presentationOwner':'StructuredSurfaceHost + StructuredNavigationDescriptorOwner; accepted donor integration for Library compatibility only','stateOwner':'StructuredDocumentDomainAdapter bound working document','implementation':['dist/foundation/structured.js','dist/foundation/structured/surface-host.js','dist/foundation/structured/block-renderer.js','dist/foundation/structured/presentation-bridge.js','dist/foundation/structured/read-inspection.js','dist/foundation/structured/outline-descriptor.js','dist/foundation/workspace-host.js','dist/adapters/structured-documents.js','dist/foundation/accepted-runtime.js'],'duplicatePolicy':'CONSUME_FINAL_STRUCTURED_FAMILY_BOUNDARY; LIBRARY_DONOR_INTEGRATION_ONLY_BY_APPROVED_DEVIATION'},
 {'id':'StructuredSurfaceHost','presentationOwner':'StructuredSurfaceHost','stateOwner':'Presentation/orchestration only; canonical Structured truth remains StructuredDocumentDomainAdapter + accepted subordinate owners','implementation':['dist/foundation/structured/surface-host.js','dist/foundation/structured/block-renderer.js','dist/foundation/structured/presentation-bridge.js'],'duplicatePolicy':'ONE_STRUCTURED_SURFACE_HOST; NO_SECOND_STRUCTURED_ENGINE'},
 {'id':'StructuredNavigationDescriptorOwner','presentationOwner':'StructuredNavigationDescriptorOwner','stateOwner':'Derived read-inspection/outline/quick-jump descriptor truth only','implementation':['dist/foundation/structured/read-inspection.js','dist/foundation/structured/outline-descriptor.js'],'duplicatePolicy':'ONE_STRUCTURED_NAV_DESCRIPTOR_OWNER; NO_CANONICAL_MUTATION_OR_DOM_FOCUS_SCROLL_OWNERSHIP'}
]: upsert(runtime['components'],'id',v)
for eng in runtime.get('familyEngines',[]):
    if eng.get('id')=='Structured':
        eng['engine']='StructuredSurfaceHost + StructuredNavigationDescriptorOwner over accepted Tree/Mutation/Transaction/Availability/Selection/Clipboard/Input/Actions/Direction/Rich/Drag owners'
        eng['requiresAdapter']='StructuredDocumentDomainAdapter'
        eng['proofConsumers']=['library','learn','note-content-compatible']
        eng['wave5HostPending']=False
        eng['navigationDescriptorOwner']='StructuredNavigationDescriptorOwner'
        eng['noteContentCompatibility']='PROVEN_CONTENT_ONLY_NO_STICKY_NOTE_WINDOW_OWNER'
    if eng.get('id')=='OperationalTerminal':
        eng['maturity']='BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN'
runtime['controllerConvergence']={
 'wave':'WAVE_5',
 'order':['StructuredSurfaceHost','StructuredNavigationDescriptorOwner','Library + Learn + Note-content compatibility','donor retirement adjudication'],
 'compositionOwner':'Controller final convergence','semanticOwner':False,
 'operationalMaturity':'BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN',
 'wave5StructuredSurfaceHostPending':False,
 'noteContentCompatibility':'CONTENT_ONLY_PROVEN_NO_STICKY_NOTE_WINDOW_OWNER',
 'donorRetirement':{'retireReady':['D12'],'keepUntilWave6OrFinalConvergence':45,'physicalDonorDeletionPerformed':False,'D12Disposition':'SEMANTIC_ROUTE_RETIRED_READY_INTEGRATION_PRESENTATION_GLUE_RETAINED'},
 'browserLegacy':'6/6 PASS','browserWave3Integration':'5/5 PASS','browserWave4Integration':'5/5 PASS','browserWave5LaneC':'9 steps / 26 executable cases PASS','model':'210/210 PASS'
}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)

# Final Wave 5 contracts.
versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'));versions['baselineId']=W5_BASELINE
for c in [
 {'id':'StructuredSurfaceHost','version':'1.0.1','changeType':'CONTROLLER_ACCEPTED_FINAL_STRUCTURED_FAMILY_HOST','consumers':['library','learn','note-content-compatible','future-structured'],'breakingRule':'Host orchestration/renderer/bridge changes require real-consumer, owner-graph, read/edit, command-bus and browser proof; canonical document truth may never move into the host.'},
 {'id':'StructuredNavigationDescriptorOwner','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_STRUCTURED_NAVIGATION_DESCRIPTOR_OWNER','consumers':['library','learn','note-content-compatible','future-structured-read-surfaces'],'breakingRule':'Read-inspection/outline/quick-jump descriptor changes require canonical tree/identity coherence proof and must not acquire DOM focus/scroll or canonical mutation ownership.'},
 {'id':'StructuredNoteContentCompatibility','version':'1.0.0','changeType':'BOUNDED_CONTENT_COMPATIBILITY_PROOF_CONTRACT','consumers':['note-content-compatible-proof'],'breakingRule':'This proves Structured content compatibility only; it must never imply StickyNoteWindowOwner, NoteBindingAdapter, pin/always-on-top or separate-window lifecycle ownership.'}
]: upsert(versions['contracts'],'id',c)
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)

mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'));mechanics['baselineId']=W5_BASELINE
for r in [
 {'mechanicId':'structured.surface-host','status':'FAMILY_HOST','familyOwner':'StructuredSurfaceHost','semanticCommandOwner':'SemanticCommandBus + accepted Structured semantic owners','canonicalStateOwner':'StructuredDocumentDomainAdapter + accepted subordinate Structured owners; host owns no canonical document truth','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/surface-host.js','dist/foundation/structured/block-renderer.js','dist/foundation/structured/presentation-bridge.js']},
 {'mechanicId':'structured.navigation-descriptors','status':'FAMILY_DESCRIPTOR_OWNER','familyOwner':'StructuredNavigationDescriptorOwner','semanticCommandOwner':'none; presentation/descriptor derivation only','canonicalStateOwner':'Derived descriptor truth only; canonical document/tree/identity remain supplying Structured owners','applicableFamilies':['Structured'],'requiredAdapter':'StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/structured/read-inspection.js','dist/foundation/structured/outline-descriptor.js']}
]: upsert(mechanics['records'],'mechanicId',r)
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)

# SC-030 now points at the accepted final family boundary without moving canonical truth into presentation owners.
core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
for row in core:
    if row.get('foundation_id')=='SC-030':
        row['current_executable_owner']='StructuredSurfaceHost + StructuredNavigationDescriptorOwner + accepted Structured subordinate owners'
        row['implementation']='dist/foundation/structured.js + dist/foundation/structured/surface-host.js + dist/foundation/structured/block-renderer.js + dist/foundation/structured/presentation-bridge.js + dist/foundation/structured/read-inspection.js + dist/foundation/structured/outline-descriptor.js + dist/foundation/structured/*'
        status='CONTROLLER_ACCEPTED_EXECUTABLE_STRUCTURED_FAMILY_M6'
        row['implementation_status']=status;row['physical_implementation_status']=status;row['new_foundation_authority']=status
        row['effective_hard_boundary']='StructuredSurfaceHost owns presentation/orchestration and StructuredNavigationDescriptorOwner owns derived read-navigation descriptors only; canonical document/tree/mutation/selection/clipboard/history truth remains StructuredDocumentDomainAdapter and accepted subordinate owners. Note-content compatibility is content-only and does not authorize StickyNoteWindowOwner.'
dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)

# Writer/deviation current truth.
writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json'));writer['foundationBaseline']=W5_BASELINE
writer['wave5Requirement']='SATISFIED_CONTROLLER_ACCEPTED: StructuredSurfaceHost + StructuredNavigationDescriptorOwner + Library/Learn/Note-content compatibility; Wave 6 Sticky Notes/window work remains separate.'
writer['wave5StructuredOwners']=['StructuredSurfaceHost','StructuredNavigationDescriptorOwner']
writer['wave5Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
writer['wave5NoteContentCompatibility']='CONTENT_ONLY_PROVEN_NO_STICKY_NOTE_WINDOW_OWNER'
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)
schema=load(Path('contracts/schemas/writer_intake.schema.json'));schema['properties']['foundationBaseline']['const']=W5_BASELINE
schema['properties'].setdefault('wave4StructuredSubordinateOwners',{'type':'array','items':{'type':'string'}})
schema['properties'].setdefault('wave4OperationalBoundary',{'type':'object'})
schema['properties'].setdefault('wave5Requirement',{'type':'string'})
schema['properties'].setdefault('wave5StructuredOwners',{'type':'array','items':{'type':'string'}})
schema['properties'].setdefault('wave5Status',{'type':'string'})
schema['properties'].setdefault('wave5NoteContentCompatibility',{'type':'string'})
dump(Path('contracts/schemas/writer_intake.schema.json'),schema)
dev=load(Path('contracts/DEVIATION_REGISTER.json'));dev['baselineId']=W5_BASELINE;dump(Path('contracts/DEVIATION_REGISTER.json'),dev)

print(json.dumps({'status':'PASS','baselineId':W5_BASELINE,'wave3Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave4Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave5Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave5StructuredOwners':['StructuredSurfaceHost','StructuredNavigationDescriptorOwner'],'wave5Pending':False,'noteContentCompatibility':'CONTENT_ONLY_PROVEN_NO_STICKY_NOTE_WINDOW_OWNER','donorRetirement':{'retireReady':['D12'],'keep':45,'physicalDeletion':False},'operationalSecondRealProvider':False},indent=2))

# Wave 6 final Controller reconciliation: Notes/floating-window family completion.
W6_BASELINE='CEP-FR-E16-W6-NOTES-FAMILY-COMPLETION'

# Executable component registry truth.
components=load(Path('contracts/COMPONENT_REGISTRY.json'))
for v in [
 dict(component_id='StickyNoteWindowOwner',semantic_core='SC-006',implementation='dist/foundation/notes/sticky-note-window.js + dist/foundation/window-motion.js',slots=['NOTES','TRANSIENT'],status='CONTROLLER_ACCEPTED_EXECUTABLE_NOTES_WINDOW_OWNER_M6',duplicate_policy='ONE_STICKY_NOTE_WINDOW_OWNER_PER_CANONICAL_HOST_GRAPH; WindowMotion remains the one generic geometry owner; CEP pin is not OS always-on-top; close/hide is presentation-only'),
 dict(component_id='NoteBindingAdapter',semantic_core='SC-038',implementation='dist/foundation/notes/note-binding.js + dist/adapters/note-binding-domains.js',slots=['NOTES'],status='CONTROLLER_ACCEPTED_EXECUTABLE_NOTE_BINDING_OWNER_M6',duplicate_policy='ONE_CANONICAL_NOTE_BINDING_TRUTH_PER_NOTE; presentation/window IDs never become source identity; available bindings require validated source identity where applicable'),
 dict(component_id='StructuredNoteContentAdapter',semantic_core='SC-038',implementation='dist/adapters/structured-note-content.js + dist/foundation/structured.js + dist/foundation/structured/surface-host.js',slots=['NOTES'],status='CONTROLLER_ACCEPTED_EXECUTABLE_STRUCTURED_NOTE_CONTENT_ADAPTER_M6',duplicate_policy='ONE_FINAL_NOTE_CONTENT_ADAPTER_PER_CANONICAL_BINDING+WINDOW+NOTE GRAPH; no second Structured editor/document engine; document identity collision is rejected fail-atomically'),
 dict(component_id='NotesFamilyComposition',semantic_core='SC-038',implementation='dist/adapters/library-note-runtime-composition.js + dist/foundation/accepted-runtime.js + dist/main.js',slots=['NOTES','TRANSIENT'],status='CONTROLLER_ACCEPTED_INTEGRATION_COMPOSITION_M6',duplicate_policy='COMPOSITION_GLUE_ONLY_NOT_A_SEMANTIC_OWNER; note content/binding/window truth remains in accepted Wave6 owners')
]: upsert(components,'component_id',v)
dump(Path('contracts/COMPONENT_REGISTRY.json'),components);write_csv(Path('contracts/COMPONENT_REGISTRY.csv'),components)

# Derived/canonical state ownership truth.
states=read_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'))
for row in [
 state_row('sticky note presentation/window lifecycle','StickyNoteWindowOwner','session/presentation only; no note/source persistence claim','Structured content/history; source binding; source deletion; OS always-on-top without capability bridge'),
 state_row('note source/domain binding truth','NoteBindingAdapter','descriptor/provenance truth only; storage/persistence external','note content mutation; window geometry; source/domain mutation; fabricated source identity'),
 state_row('structured note content working document','StructuredNoteContentAdapter over StructuredDocumentDomainAdapter','Structured working-document/history boundary only; no durable storage claim','note binding truth; window lifecycle; second editor engine; source mutation')
]:
    found=False
    for i,x in enumerate(states):
        if x['state']==row['state']: states[i]=row;found=True;break
    if not found: states.append(row)
write_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'),states)

# Runtime registry final Wave 6 truth.
runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
runtime['schemaVersion']=max(int(runtime.get('schemaVersion',1)),5)
runtime['baselineId']=W6_BASELINE
runtime['status']='CONTROLLER_ACCEPTED_WAVE6_SUCCESSOR_CONTENT'
runtime['stackStatus']='STACK_NOT_FROZEN'
runtime['wave3Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave4Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave5Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime['wave6Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
runtime.setdefault('registries',{})['wave6ControllerFinalAcceptanceProof']='assurance/W6_CONTROLLER_FINAL_ACCEPTANCE.json'
for v in [
 {'id':'StickyNoteWindowOwner','presentationOwner':'StickyNoteWindowOwner','stateOwner':'Sticky Note presentation/window lifecycle only; WindowMotion owns generic pointer geometry','implementation':['dist/foundation/notes/sticky-note-window.js','dist/foundation/window-motion.js'],'duplicatePolicy':'ONE_PER_CANONICAL_HOST_GRAPH; NO_SECOND_WINDOW_MOTION_OWNER; NATIVE_ALWAYS_ON_TOP_UNAVAILABLE_WITHOUT_EXPLICIT_CAPABILITY_BRIDGE'},
 {'id':'NoteBindingAdapter','presentationOwner':None,'stateOwner':'Canonical note-to-source/domain binding/provenance descriptor truth only','implementation':['dist/foundation/notes/note-binding.js','dist/adapters/note-binding-domains.js'],'duplicatePolicy':'ONE_CANONICAL_BINDING_TRUTH; FAIL_ATOMIC_REBIND; NO_PRESENTATION_ID_AS_SOURCE_ID'},
 {'id':'StructuredNoteContentAdapter','presentationOwner':'Consumes StructuredSurfaceHost; no independent renderer/editor','stateOwner':'Thin note-content adaptation over StructuredDocumentDomainAdapter and accepted Structured owners','implementation':['dist/adapters/structured-note-content.js','dist/foundation/structured.js','dist/foundation/structured/surface-host.js'],'duplicatePolicy':'ONE_FINAL_ADAPTER_PER_CANONICAL_GRAPH_NOTE; DOCUMENT_ID_COLLISION_REFUSED; NO_SECOND_STRUCTURED_ENGINE'},
 {'id':'NotesFamilyComposition','presentationOwner':'Accepted Library note UI / Controller composition glue','stateOwner':'NONE_SEMANTIC; delegates to StickyNoteWindowOwner + NoteBindingAdapter + StructuredNoteContentAdapter','implementation':['dist/adapters/library-note-runtime-composition.js','dist/foundation/accepted-runtime.js','dist/main.js'],'duplicatePolicy':'COMPOSITION_ONLY_SEMANTIC_OWNER_FALSE'}
]: upsert(runtime['components'],'id',v)
# Record Notes as a reusable family composition without altering unrelated surface profile family assignments.
notes_engine={'id':'Notes','engine':'StickyNoteWindowOwner + NoteBindingAdapter + StructuredNoteContentAdapter over accepted Structured engine','requiresAdapter':'NoteBindingAdapter domain input + StructuredDocumentDomainAdapter through StructuredNoteContentAdapter','proofConsumers':['library-sticky-note','structured-note','learn-bound-note','spatial-bound-note'],'maturity':'CONTROLLER_ACCEPTED_M6','ownershipBoundary':'window/binding/content remain separate canonical owners; composition is non-semantic'}
upsert(runtime.setdefault('familyEngines',[]),'id',notes_engine)
for eng in runtime.get('familyEngines',[]):
    if eng.get('id')=='Structured':
        eng['proofConsumers']=['library','learn','structured-note-content']
        eng['noteContentCompatibility']='FINAL_STRUCTURED_NOTE_CONTENT_ADAPTER_PROVEN_SAME_ENGINE'
    if eng.get('id')=='OperationalTerminal': eng['maturity']='BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN'
runtime['controllerConvergence']={
 'wave':'WAVE_6',
 'order':['StickyNoteWindowOwner','NoteBindingAdapter','StructuredNoteContentAdapter','Library note runtime composition','registry/generator reconciliation','donor adjudication'],
 'compositionOwner':'Controller final convergence','semanticOwner':False,
 'notesFamily':'CONTROLLER_ACCEPTED_M6',
 'operationalMaturity':'BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN',
 'structuredNoteContent':'SAME_ACCEPTED_STRUCTURED_ENGINE_NO_SECOND_EDITOR',
 'noteWindowAlwaysOnTop':'UNAVAILABLE_UNLESS_EXPLICIT_PLATFORM_CAPABILITY_BRIDGE',
 'notePersistence':'NO_DURABLE_PERSISTENCE_OWNER_CLAIM',
 'donorPhysicalDeletionPerformed':False,
 'browserLegacy':'6/6 PASS','browserWave3Integration':'5/5 PASS','browserWave4Integration':'5/5 PASS','browserWave5LaneC':'9 steps / 26 executable cases PASS','browserWave6IntegratedNotes':'8/8 PASS','model':'210/210 PASS'
}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)

# Versioned Wave 6 contracts.
versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'));versions['baselineId']=W6_BASELINE
for c in [
 {'id':'StickyNoteWindowOwner','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_NOTES_WINDOW_OWNER','consumers':['sticky-notes','library-note-composition','future-notes-surfaces'],'breakingRule':'Geometry/lifecycle/z-order/pin/popout capability changes require pointer+keyboard+viewport+focus proof; close/hide may never become source deletion and OS always-on-top cannot be fabricated.'},
 {'id':'NoteBindingAdapter','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_NOTE_BINDING_OWNER','consumers':['library-note','learn-note','spatial-note','future-notes-domains'],'breakingRule':'Binding identity/availability/provenance changes require domain-shape, fail-atomic and source-identity proof; window/presentation identity can never become canonical source identity.'},
 {'id':'StructuredNoteContentAdapter','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_FINAL_STRUCTURED_NOTE_CONTENT_ADAPTER','consumers':['sticky-notes','structured-note-content','future-structured-notes'],'breakingRule':'Note content must consume the same accepted Structured engine; duplicate final adapter/document identity, second editor engines, persistence claims, binding takeover or window ownership are forbidden.'},
 {'id':'NotesFamilyComposition','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_NON_SEMANTIC_LIBRARY_NOTES_COMPOSITION','consumers':['library-runtime'],'breakingRule':'Composition may mirror/project canonical owner truth for UI compatibility only and may not reacquire note window, binding, Structured content/history or persistence ownership.'}
]: upsert(versions['contracts'],'id',c)
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)

# Mechanic ownership registry.
mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'));mechanics['baselineId']=W6_BASELINE
for r in [
 {'mechanicId':'notes.window-lifecycle','status':'NOTES_FAMILY_OWNER','familyOwner':'StickyNoteWindowOwner','semanticCommandOwner':'StickyNoteWindowOwner bounded note-window actions; global key semantics remain GlobalInputKeymapOwner','canonicalStateOwner':'StickyNoteWindowOwner presentation/window state; WindowMotion generic geometry mechanic','applicableFamilies':['Notes'],'requiredAdapter':None,'approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/foundation/notes/sticky-note-window.js','dist/foundation/window-motion.js']},
 {'mechanicId':'notes.binding','status':'NOTES_FAMILY_OWNER','familyOwner':'NoteBindingAdapter','semanticCommandOwner':'none; canonical descriptor/provenance owner','canonicalStateOwner':'NoteBindingAdapter','applicableFamilies':['Notes'],'requiredAdapter':'per-domain note binding input adapter','approvedDeviations':[],'implementation':['dist/foundation/notes/note-binding.js','dist/adapters/note-binding-domains.js']},
 {'mechanicId':'notes.structured-content','status':'NOTES_FAMILY_ADAPTER','familyOwner':'StructuredNoteContentAdapter consuming StructuredSurfaceHost + StructuredDocumentDomainAdapter','semanticCommandOwner':'accepted Structured semantic owners through same SemanticCommandBus routes','canonicalStateOwner':'StructuredDocumentDomainAdapter working document/history; final adapter only binds note identity/composition','applicableFamilies':['Notes','Structured'],'requiredAdapter':'NoteBindingAdapter + StructuredDocumentDomainAdapter','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/adapters/structured-note-content.js','dist/foundation/structured.js','dist/foundation/structured/surface-host.js']},
 {'mechanicId':'notes.library-runtime-composition','status':'INTEGRATION_GLUE','familyOwner':'NONE_SEMANTIC','semanticCommandOwner':'delegated to NoteBindingAdapter + StickyNoteWindowOwner + StructuredNoteContentAdapter','canonicalStateOwner':'accepted Wave6 owners; donor mirrors projection only','applicableFamilies':['Notes','Structured'],'requiredAdapter':'Wave6 Notes owner graph','approvedDeviations':['DEV-LIBRARY-COMPAT-HOST-001'],'implementation':['dist/adapters/library-note-runtime-composition.js','dist/foundation/accepted-runtime.js','dist/main.js']}
]: upsert(mechanics['records'],'mechanicId',r)
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)

# Core owner registry: NotesAnnotationCore is now executable; broad PresentationStateCore remains bounded.
core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
for row in core:
    if row.get('foundation_id')=='SC-038':
        status='CONTROLLER_ACCEPTED_EXECUTABLE_NOTES_FAMILY_M6'
        row['current_executable_owner']='StickyNoteWindowOwner + NoteBindingAdapter + StructuredNoteContentAdapter'
        row['implementation']='dist/foundation/notes/sticky-note-window.js + dist/foundation/notes/note-binding.js + dist/adapters/note-binding-domains.js + dist/adapters/structured-note-content.js + dist/adapters/library-note-runtime-composition.js'
        row['implementation_status']=status;row['physical_implementation_status']=status;row['new_foundation_authority']=status
        row['effective_hard_boundary']='Freeform/working note content uses the accepted Structured engine through StructuredNoteContentAdapter; binding truth remains NoteBindingAdapter; window/presentation truth remains StickyNoteWindowOwner. Formal Finding/Decision/Audit semantics remain separate domains. No durable persistence or OS always-on-top capability is implied.'
    if row.get('foundation_id')=='SC-006':
        row['effective_hard_boundary']='Must not become canonical domain persistence. Sticky Note window lifecycle is executable through StickyNoteWindowOwner; canonical domain content/binding remains outside presentation state.'
dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)

# Writer intake/schema/deviation final Wave 6 truth.
writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json'));writer['foundationBaseline']=W6_BASELINE
writer['wave5Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
writer['wave6Requirement']='SATISFIED_CONTROLLER_ACCEPTED: StickyNoteWindowOwner + NoteBindingAdapter + final StructuredNoteContentAdapter + Controller Library note composition.'
writer['wave6NotesOwners']=['StickyNoteWindowOwner','NoteBindingAdapter','StructuredNoteContentAdapter']
writer['wave6Status']='CONTROLLER_ACCEPTED_AND_CLOSED'
writer['wave6HardCeilings']={'stack':'STACK_NOT_FROZEN','operationalSessionOwner':'BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN','notePersistence':'NO_DURABLE_PERSISTENCE_OWNER_CLAIM','nativeAlwaysOnTop':'UNAVAILABLE_UNLESS_EXPLICIT_PLATFORM_CAPABILITY_BRIDGE','secondStructuredEditorEngine':False}
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)
schema=load(Path('contracts/schemas/writer_intake.schema.json'));schema['properties']['foundationBaseline']['const']=W6_BASELINE
schema['properties'].setdefault('wave6Requirement',{'type':'string'})
schema['properties'].setdefault('wave6NotesOwners',{'type':'array','items':{'type':'string'}})
schema['properties'].setdefault('wave6Status',{'type':'string'})
schema['properties'].setdefault('wave6HardCeilings',{'type':'object'})
dump(Path('contracts/schemas/writer_intake.schema.json'),schema)
dev=load(Path('contracts/DEVIATION_REGISTER.json'));dev['baselineId']=W6_BASELINE;dump(Path('contracts/DEVIATION_REGISTER.json'),dev)

print(json.dumps({'status':'PASS','baselineId':W6_BASELINE,'wave3Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave4Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave5Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave6Status':'CONTROLLER_ACCEPTED_AND_CLOSED','wave6NotesOwners':['StickyNoteWindowOwner','NoteBindingAdapter','StructuredNoteContentAdapter'],'stackStatus':'STACK_NOT_FROZEN','operationalSecondRealProvider':False,'surfaceBuildAuthorizedByThisReconciliation':False},indent=2))



# E18 bounded Foundation completion: AnalyticalCompare / SC-032.
E18_BASELINE='CEP-FR-E18-ANALYTICAL-COMPARE-COMPLETION'

components=load(Path('contracts/COMPONENT_REGISTRY.json'))
upsert(components,'component_id',{
 'component_id':'AnalyticalCompare','semantic_core':'SC-032',
 'implementation':'dist/foundation/analytical/compare.js + dist/foundation/analytical/compare-host.js + dist/foundation/contracts/analysis-provider.js + dist/adapters/analytical/rq-compare-provider.js + dist/adapters/analytical/results-compare-provider.js',
 'slots':['CENTER','BOTTOM'],
 'status':'CONTROLLER_ACCEPTED_EXECUTABLE_ANALYTICAL_COMPARE_E18',
 'duplicate_policy':'ONE_ANALYTICAL_COMPARE_OWNER; exact pinned identity only; domain meaning stays in typed AnalysisProvider adapters; no Review/Mastery/Audit authority transfer'
})
dump(Path('contracts/COMPONENT_REGISTRY.json'),components);write_csv(Path('contracts/COMPONENT_REGISTRY.csv'),components)

states=read_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'))
for row in [
 state_row('analytical compare pair/session/result projection','AnalyticalCompareOwner','session/derived only; canonical provider records remain domain-owned','provider records; Review decisions; Mastery judgments; Evidence admission; Audit mutation; generic persistence'),
 state_row('analytical compare presentation focus/filter state','AnalyticalCompareHost','presentation/session only','canonical comparison result or provider domain truth')
]:
 found=False
 for i,x in enumerate(states):
  if x['state']==row['state']: states[i]=row;found=True;break
 if not found: states.append(row)
write_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'),states)

runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
runtime['baselineId']=E18_BASELINE
runtime['status']='CONTROLLER_ACCEPTED_POST_FINAL_GATE_FOUNDATION_SUCCESSOR_CONTENT'
runtime.setdefault('registries',{})['analyticalCompareControllerAcceptanceProof']='assurance/E18_ANALYTICAL_COMPARE_CONTROLLER_ACCEPTANCE.json'
upsert(runtime.setdefault('components',[]),'id',{
 'id':'AnalyticalCompare','presentationOwner':'AnalyticalCompareHost','stateOwner':'AnalyticalCompareOwner exact pinned pair/session/result derived truth; provider records remain domain-owned',
 'implementation':['dist/foundation/analytical/compare.js','dist/foundation/analytical/compare-host.js','dist/foundation/contracts/analysis-provider.js','dist/adapters/analytical/rq-compare-provider.js','dist/adapters/analytical/results-compare-provider.js'],
 'duplicatePolicy':'ONE_REUSABLE_ANALYTICAL_COMPARE_OWNER; NO_SURFACE_LOCAL_COMPARE_ENGINE; NO_CROSS_PROVIDER_PAIR_WITHOUT_EXPLICIT_COMPATIBILITY'
})
analytical_engine={
 'id':'AnalyticalCompare',
 'engine':'AnalyticalCompareOwner + AnalyticalCompareHost',
 'requiresAdapter':'AnalysisProviderContract',
 'proofConsumers':['rq','results'],
 'maturity':'CONTROLLER_ACCEPTED_E18_TWO_REAL_PROVIDER_PROOF',
 'ownershipBoundary':'Shared compare/diff/provenance inspection mechanic only; exact domain identity and canonical records remain provider-owned; Formal Review/Mastery/Evidence admission/Audit semantics stay separate.'
}
upsert(runtime.setdefault('familyEngines',[]),'id',analytical_engine)
runtime['analyticalCompareCompletion']={
 'status':'CONTROLLER_ACCEPTED_EXECUTABLE_OWNER',
 'semanticCore':'SC-032','owner':'AnalyticalCompareOwner','host':'AnalyticalCompareHost','providerContract':'AnalysisProviderContract',
 'realProviderProofs':['rq','results'],'crossProviderComparison':'REJECTED_BY_DEFAULT',
 'exactPinnedIdentity':True,'domainMutationOwned':False,'persistenceOwned':False,
 'reviewDecisionOwned':False,'masteryOwned':False,'evidenceAdmissionOwned':False,'auditMutationOwned':False
}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)

versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'));versions['baselineId']=E18_BASELINE
for c in [
 {'id':'AnalysisProviderContract','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_ANALYTICAL_PROVIDER_BOUNDARY','consumers':['rq','results','future-analytical-surfaces'],'breakingRule':'Exact reference/key/compatibility/value normalization changes require collision, forged-metadata, missing/incompatible and provider-nonmutation proof; domain canonical meaning may not move into the shared owner.'},
 {'id':'AnalyticalCompareOwner','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_SC032_ANALYTICAL_COMPARE_OWNER','consumers':['rq','results','evidence','reviews','mastery','portfolio','audit'],'breakingRule':'Pair/session/result changes require exact pinned identity, deterministic diff, fail-atomic session, two-real-provider and domain-noncollapse proof; must not infer Review/Mastery/Evidence/Audit semantics.'},
 {'id':'AnalyticalCompareHost','version':'1.0.0','changeType':'CONTROLLER_ACCEPTED_ANALYTICAL_PRESENTATION_HOST','consumers':['analytical-family-surfaces'],'breakingRule':'Host changes require keyboard/focus/RTL-LTR/filter/inspection browser proof and may not acquire canonical provider or decision authority.'}
]: upsert(versions['contracts'],'id',c)
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)

mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'));mechanics['baselineId']=E18_BASELINE
upsert(mechanics['records'],'mechanicId',{
 'mechanicId':'analytical.compare','status':'FAMILY_OWNER','familyOwner':'AnalyticalCompareOwner + AnalyticalCompareHost',
 'semanticCore':'SC-032','semanticCommandOwner':'AnalyticalCompareOwner for compare/session/filter/inspection mechanics only',
 'canonicalStateOwner':'Provider/domain adapters own canonical records; AnalyticalCompareOwner owns exact pinned derived compare/session result only',
 'applicableFamilies':['AnalyticalCompare'],'requiredAdapter':'AnalysisProviderContract','approvedDeviations':[],
 'implementation':['dist/foundation/contracts/analysis-provider.js','dist/foundation/analytical/compare.js','dist/foundation/analytical/compare-host.js','dist/adapters/analytical/rq-compare-provider.js','dist/adapters/analytical/results-compare-provider.js']
})
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)

core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
for row in core:
 if row.get('foundation_id')=='SC-032':
  status='CONTROLLER_ACCEPTED_EXECUTABLE_ANALYTICAL_COMPARE_E18'
  row['current_executable_owner']='AnalyticalCompareOwner + AnalyticalCompareHost + AnalysisProviderContract'
  row['implementation']='dist/foundation/contracts/analysis-provider.js + dist/foundation/analytical/compare.js + dist/foundation/analytical/compare-host.js + dist/adapters/analytical/rq-compare-provider.js + dist/adapters/analytical/results-compare-provider.js'
  row['implementation_status']=status;row['physical_implementation_status']=status;row['new_foundation_authority']=status;row['physical_historical_path_admitted']=False
  row['effective_hard_boundary']='Shared exact-pinned compare/diff/provenance/conflict inspection mechanics only. Domain providers retain canonical identity/records. Formal Review Finding/Decision, Mastery, Evidence admission, Portfolio membership and Audit immutability/mutation semantics remain separate domain authorities.'
dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)

writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json'));writer['foundationBaseline']=E18_BASELINE
writer['analyticalCompareRequirement']='SATISFIED_CONTROLLER_ACCEPTED: AnalyticalCompareOwner + AnalyticalCompareHost + AnalysisProviderContract with RQ and Results real-provider proof.'
writer['analyticalCompareOwners']=['AnalyticalCompareOwner','AnalyticalCompareHost','AnalysisProviderContract']
writer['analyticalCompareStatus']='CONTROLLER_ACCEPTED_EXECUTABLE_OWNER'
writer['analyticalCompareHardCeilings']={'crossProviderComparison':'REJECTED_BY_DEFAULT','domainCanonicalStateOwner':'PROVIDER_DOMAIN_ADAPTER','reviewDecisionOwned':False,'masteryOwned':False,'evidenceAdmissionOwned':False,'auditMutationOwned':False,'persistenceOwned':False}
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)
schema=load(Path('contracts/schemas/writer_intake.schema.json'));schema['properties']['foundationBaseline']['const']=E18_BASELINE
schema['properties']['familyEngines']['items']['enum']=list(dict.fromkeys(schema['properties']['familyEngines']['items'].get('enum',[])+['AnalyticalCompare']))
schema['properties'].setdefault('analyticalCompareRequirement',{'type':'string'});schema['properties'].setdefault('analyticalCompareOwners',{'type':'array','items':{'type':'string'}});schema['properties'].setdefault('analyticalCompareStatus',{'type':'string'});schema['properties'].setdefault('analyticalCompareHardCeilings',{'type':'object'})
dump(Path('contracts/schemas/writer_intake.schema.json'),schema)
dev=load(Path('contracts/DEVIATION_REGISTER.json'));dev['baselineId']=E18_BASELINE;dump(Path('contracts/DEVIATION_REGISTER.json'),dev)

# FINAL FOUNDATION INTAKE RECONCILIATION HOOK
subprocess.run([sys.executable, str(root / 'tools/reconcile-final-foundation-intake.py')], check=True)
