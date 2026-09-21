from pathlib import Path
from collections import Counter, defaultdict
import csv, hashlib, json
import subprocess, sys

root = Path(__file__).resolve().parents[1]
controller = root / 'authority/controller'

def dump(path, value):
    (root / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def dump_csv(path, rows):
    rows = list(rows)
    with (root / path).open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows({key: json.dumps(value, ensure_ascii=False) if isinstance(value, (list, dict)) else value for key, value in row.items()} for row in rows)

def csv_rows(name):
    with (controller / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle))

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

# Correct only profiles whose executable owners changed in this bounded wave.
for name in ['visualize', 'enterprise']:
    path = root / f'profiles/{name}.json'
    profile = json.loads(path.read_text())
    for key in ['SC-027', 'SelectionActionSurface']:
        profile['foundation'][key].update(classification='INHERIT_AND_BIND', reason='Shared selection action surface consumes one ActionAvailability result; canonical mutation remains in the domain adapter')
    profile['proof_consumer'] = True
    profile['host_contract'] = 'WorkspaceFoundationHost@1.0.0'
    if name == 'enterprise':
        profile['domain_implementation'] = 'V3_4_DERIVED_LOCAL_DRAFT_ADAPTER'
    else:
        profile['domain_commands'] = ['spatial.connect', 'spatial.relation.commit', 'relation.edit', 'relation.undo', 'relation.redo', 'spatial.fit', 'spatial.align', 'spatial.distribute']
    dump(path.relative_to(root), profile)

for name in ['learn', 'runs']:
    path = root / f'profiles/{name}.json'
    profile = json.loads(path.read_text())
    profile['host_contract'] = 'WorkspaceFoundationHost@1.0.0'
    if name == 'learn':
        profile['domain_implementation'] = 'LEARN_DOMAIN_ADAPTER_LIBRARY_INDEPENDENT'
    else:
        profile['domain_implementation'] = 'V3_4_DERIVED_INTERNAL_SIMULATION'
        profile['domain_commands'] = ['OPEN_TERMINAL', 'runtime.input', 'runtime.disconnect', 'runtime.reconnect', 'runs.pause', 'runs.resume', 'view.recorded']
    dump(path.relative_to(root), profile)

component_path = root / 'contracts/COMPONENT_REGISTRY.json'
components = json.loads(component_path.read_text())
for component in components:
    if component['component_id'] == 'WorkspaceFrame':
        component['implementation'] = 'dist/foundation/workspace-host.js + dist/foundation/workspace.js'
        component['status'] = 'EXECUTABLE_DONOR_FREE_HOST_WITH_LIBRARY_COMPATIBILITY_DEVIATION'
    if component['component_id'] == 'SidePaneShell':
        component['implementation'] = 'dist/foundation/workspace-host.js'
        component['status'] = 'EXECUTABLE_PREFERRED_EFFECTIVE_PANE_OWNER'
    if component['component_id'] == 'CommandPalette':
        component['implementation'] = 'dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)'
        component['status'] = 'EXECUTABLE_SHARED_CONTRACT_WITH_LIBRARY_COMPATIBILITY_DEVIATION'
    if component['component_id'] in {'InsertionPalette', 'LensHost', 'StickyNotes'}:
        component['implementation'] = 'dist/foundation/accepted-runtime.js (Library compatibility only)'
        component['status'] = 'EXECUTABLE_LIBRARY_COMPATIBILITY_ONLY_NOT_GLOBAL_OWNER'
    if component['component_id'] == 'BottomShelf':
        component['implementation'] = 'dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)'
        component['status'] = 'EXECUTABLE_SHARED_SLOT_WITH_LIBRARY_COMPATIBILITY_DEVIATION'
    if component['component_id'] == 'SelectionActionSurface':
        component['implementation'] = 'dist/foundation/spatial/relation-interaction.js + dist/foundation/models.js'
        component['status'] = 'EXECUTABLE_CENTRAL_AVAILABILITY_PRESENTATION'
    if component['component_id'] == 'FocusAndDismissal':
        component['implementation'] = 'dist/foundation/workspace-host.js + dist/foundation/workspace.js'
        component['status'] = 'EXECUTABLE_TRANSIENT_FOCUS_LIFECYCLE'
    if component['component_id'] == 'UnifiedEditor':
        component['implementation'] = 'dist/foundation/structured.js + dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)'
        component['status'] = 'EXECUTABLE_STRUCTURED_BOUNDARY_WITH_LIBRARY_COMPATIBILITY_DEVIATION'
    if component['component_id'] == 'OperationalSurface':
        component['implementation'] = 'dist/foundation/operational.js'
        component['status'] = 'EXECUTABLE_WITH_RENDERER_AND_RUNTIME_ADAPTER_BOUNDARIES'
dump(component_path.relative_to(root), components)
dump_csv(Path('contracts/COMPONENT_REGISTRY.csv'), components)

dump_csv(Path('contracts/STATE_OWNERSHIP_REGISTRY.csv'), [
    {'state': 'presentation preferences', 'owner': 'ScopedPreferencesOwner', 'persistence': 'versioned localStorage/export', 'forbidden_write': 'domain runtime configuration'},
    {'state': 'preferred pane state', 'owner': 'ScopedPreferencesOwner', 'persistence': 'versioned localStorage/export', 'forbidden_write': 'responsive effective projection'},
    {'state': 'effective pane geometry', 'owner': 'WorkspacePaneLayoutOwner', 'persistence': 'derived only', 'forbidden_write': 'preferred value overwrite'},
    {'state': 'global transient/focus lifecycle', 'owner': 'TransientFocusOwner', 'persistence': 'session only', 'forbidden_write': 'domain family selection/history/session state'},
    {'state': 'context inspector content', 'owner': 'ContextDescriptorProvider', 'persistence': 'derived from family/domain canonical state', 'forbidden_write': 'parallel inspector domain store'},
    {'state': 'structured working document', 'owner': 'StructuredDocumentDomainAdapter', 'persistence': 'adapter commit/recovery boundary', 'forbidden_write': 'published canonical revision'},
    {'state': 'Library compatibility editor state', 'owner': 'LibraryDomainAdapter + accepted donor compatibility host', 'persistence': 'Library adapter boundary', 'forbidden_write': 'shared Structured engine ownership'},
    {'state': 'representation nodes/edges/camera', 'owner': 'SpatialModel', 'persistence': 'session memory', 'forbidden_write': 'canonical relationship mutation'},
    {'state': 'provider runtime state', 'owner': 'RuntimeAdapter implementation (InternalSimulationAdapter active here)', 'persistence': 'provider-defined', 'forbidden_write': 'authored baseline or presentation-owned duplicate truth'},
    {'state': 'session identity/output', 'owner': 'RuntimeAdapter stable session boundary', 'persistence': 'provider-defined', 'forbidden_write': 'renderer-owned duplicate sessions'},
    {'state': 'session geometry/tabs', 'owner': 'SessionPresentation + WindowMotion', 'persistence': 'session memory', 'forbidden_write': 'provider lifecycle inferred from hide/close'},
    {'state': 'recorded result', 'owner': 'detached snapshot', 'persistence': 'session memory', 'forbidden_write': 'live execution'},
    {'state': 'learning attempt/progress', 'owner': 'LearnAdapter', 'persistence': 'session fixture', 'forbidden_write': 'Mastery write'},
    {'state': 'canonical domain truth', 'owner': 'typed Structured/Relation/Runtime adapters', 'persistence': 'adapter-defined', 'forbidden_write': 'shared universal domain store'},
])

runtime = {
    'schemaVersion': 4,
    'baselineId': 'CEP-FOUNDATION-0.2.1c-BROWSER-TRUTHFULNESS-CORRECTED-CANDIDATE',
    'status': 'INDEPENDENT_REVIEW_REQUIRED',
    'architectureLaw': ['GLOBAL_EXECUTABLE_FOUNDATION', 'SURFACE_FAMILY_ENGINE', 'THIN_DOMAIN_ADAPTER', 'SURFACE_COMPOSITION'],
    'stackStatus': 'STACK_NOT_FROZEN',
    'acceptedDonor': {'path': 'dist/reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html', 'bytes': 672893, 'sha256': 'ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd'},
    'w03Baseline': {'identity': 'CEP_W03_UNIFIED_EXECUTABLE_BLUEPRINT_SYSTEM_v3.4_OWNER_DIRECT_REVIEW_CORRECTED_CANDIDATE.zip', 'sha256': '23b66696a9cc72cb343c74e70f380ccb248e1fbc378d8ce7839ba74111a3d716', 'authority': 'W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY', 'intake': 'authority/W03_V34_TARGETED_INTAKE.json'},
    'controllerDelta': {'identity': 'CEP_FOUNDATION_PRE_WORK_RESUME_CONTROLLER_PACKET_v2.0.zip', 'bytes': 122721, 'sha256': '0bbb013cc767d9d7047a5a5f24fe67865f0ee4e75f9522978e6bd2ceafee406b'},
    'registries': {'conceptualComponents': 'contracts/COMPONENT_REGISTRY.json', 'commands': 'contracts/COMMAND_REGISTRY.seed.json', 'preferences': 'contracts/PREFERENCE_REGISTRY.seed.json', 'surfaceProfiles': 'profiles/<surface>.json', 'inheritanceMatrix': 'contracts/23_SURFACE_INHERITANCE_MATRIX.json', 'deviations': 'contracts/DEVIATION_REGISTER.json', 'newAbstractionAdmission': 'authority/controller/10_NEW_ABSTRACTION_ADMISSION_REGISTER.csv', 'controllerResumeDelta': 'authority/controller/17_MASTER_WORK_RESUME_DELTA.md', 'activeDeferred': 'assurance/HIGH_VALUE_DEFERRED_LEDGER.json', 'excludedTraceability': 'assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json'},
    'components': [
        {'id': 'WorkspaceFrame', 'presentationOwner': 'WorkspaceFoundation', 'stateOwner': 'WorkspacePaneLayoutOwner + TransientFocusOwner', 'implementation': ['dist/foundation/workspace-host.js', 'dist/foundation/workspace.js'], 'duplicatePolicy': 'FORBID_SURFACE_LOCAL_PANE_CONTEXT_TRANSIENT_OWNER'},
        {'id': 'ContextInspector', 'presentationOwner': 'ContextInspectorPresentation', 'stateOwner': 'ContextDescriptorProvider domain/family source', 'implementation': ['dist/foundation/workspace.js'], 'duplicatePolicy': 'ONE_SHARED_PRESENTATION_DOMAIN_FIELDS_VIA_DESCRIPTOR'},
        {'id': 'SemanticCommandRegistry', 'presentationOwner': None, 'stateOwner': 'SemanticCommandBus', 'implementation': ['dist/foundation/models.js'], 'duplicatePolicy': 'ONE_ID_ONE_OWNER'},
        {'id': 'CapabilityRegistry', 'presentationOwner': None, 'stateOwner': 'CapabilityRegistry', 'implementation': ['dist/foundation/models.js'], 'duplicatePolicy': 'ONE_CAPABILITY_ONE_RESOLVER'},
        {'id': 'ActionSurfaceRegistry', 'presentationOwner': 'WorkspaceFoundation / RelationInteractionOwner', 'stateOwner': 'ActionSurfaceRegistry', 'implementation': ['dist/foundation/models.js', 'dist/foundation/workspace.js', 'dist/foundation/relations.js'], 'duplicatePolicy': 'ONE_SURFACE_ID_ONE_PRESENTATION_OWNER'},
        {'id': 'UnifiedEditor', 'presentationOwner': 'StructuredSurfaceHost; accepted donor for Library compatibility only', 'stateOwner': 'StructuredDocumentDomainAdapter bound working document', 'implementation': ['dist/foundation/workspace-host.js', 'dist/foundation/structured.js', 'dist/adapters/structured-documents.js', 'dist/foundation/accepted-runtime.js'], 'duplicatePolicy': 'CONSUME_STRUCTURED_BOUNDARY; LIBRARY_DONOR_ONLY_BY_APPROVED_DEVIATION'},
        {'id': 'StructuredDocumentDomainAdapter', 'presentationOwner': None, 'stateOwner': 'StructuredDocumentDomainAdapter identity/revision/commit/recovery boundary', 'implementation': ['dist/foundation/structured.js', 'dist/adapters/structured-documents.js'], 'duplicatePolicy': 'ONE_DOCUMENT_DOMAIN_OWNER_PER_STRUCTURED_CONSUMER'},
        {'id': 'SpatialEngine', 'presentationOwner': 'SpatialView', 'stateOwner': 'SpatialModel representation state', 'implementation': ['dist/foundation/spatial.js', 'dist/foundation/models.js'], 'duplicatePolicy': 'ONE_POINTER_CAMERA_SELECTION_OWNER'},
        {'id': 'RelationEngine', 'presentationOwner': 'RelationInteractionOwner', 'stateOwner': 'RelationDomainAdapter', 'implementation': ['dist/foundation/relations.js'], 'duplicatePolicy': 'NEVER_MUTATE_ONLY_RENDERED_EDGE'},
        {'id': 'ActionAvailabilityResolver', 'presentationOwner': None, 'stateOwner': 'Derived result; no canonical store', 'implementation': ['dist/foundation/models.js', 'dist/foundation/relations.js'], 'duplicatePolicy': 'NO_SURFACE_LOCAL_SELECTION_ACTION_ELIGIBILITY'},
        {'id': 'OperationalSurfaceManager', 'presentationOwner': 'OperationalView', 'stateOwner': 'SessionPresentation + RuntimeProviderDescriptor', 'implementation': ['dist/foundation/operational.js', 'dist/foundation/models.js'], 'duplicatePolicy': 'PRESENTATION_NEVER_PARSES_COMMAND_OR_NAMES_PROVIDER'},
        {'id': 'TerminalRendererAdapter', 'presentationOwner': 'DomTerminalRendererAdapter', 'stateOwner': 'RuntimeAdapter session lines', 'implementation': ['dist/foundation/operational.js'], 'duplicatePolicy': 'RENDERER_NEVER_BECOMES_RUNTIME'},
        {'id': 'SimulatedDeviceEngine', 'presentationOwner': None, 'stateOwner': 'SimulatedDeviceEngine.devices', 'implementation': ['dist/adapters/simulation.js'], 'duplicatePolicy': 'ONE_CANONICAL_SIMULATED_DEVICE_TRUTH_OWNER'},
        {'id': 'InternalSimulationAdapter', 'presentationOwner': None, 'stateOwner': 'InternalSimulationAdapter parser/sessions/events/receipts', 'implementation': ['dist/adapters/simulation.js'], 'duplicatePolicy': 'ONE_RUNTIME_ADAPTER_PER_PROVIDER'},
        {'id': 'StructuredNoteBindingSeam', 'presentationOwner': 'Structured hosts', 'stateOwner': 'Structured adapter/domain note binding', 'implementation': ['dist/foundation/structured.js', 'dist/foundation/workspace-host.js'], 'duplicatePolicy': 'FULL_CROSS_FAMILY_NOTES_CORE_DEFERRED'}
    ],
    'capabilities': [
        {'id': 'STRUCTURED_EDIT', 'owner': 'StructuredDocumentDomainAdapter', 'resolver': 'domain adapter capability and mode', 'consumers': ['library', 'learn']},
        {'id': 'RELATION_AUTHOR', 'owner': 'RelationDomainAdapter', 'resolver': 'adapter capability + endpoint types + canonical constraints', 'consumers': ['visualize', 'enterprise']},
        {'id': 'OPEN_TERMINAL', 'owner': 'RuntimeProviderDescriptor', 'resolver': 'provider descriptor capability + live state', 'consumers': ['runs']},
        {'id': 'NOTES_LINK', 'owner': 'StructuredNoteBindingSeam', 'resolver': 'active structured block or domain object binding', 'consumers': ['library', 'learn', 'visualize', 'enterprise', 'runs']}
    ],
    'actionSurfaces': [
        {'id': 'command-palette', 'owner': 'WorkspaceFoundation', 'commands': 'registry-derived', 'routes': ['global button', 'keyboard'], 'exitRoutes': ['close button', 'Escape', 'backdrop']},
        {'id': 'context-actions', 'owner': 'WorkspaceFoundation', 'commands': 'context-derived', 'routes': ['RMB', 'Shift+F10', 'global action'], 'exitRoutes': ['Close item', 'Escape', 'outside pointer']},
        {'id': 'selection-actions', 'owner': 'RelationInteractionOwner + ActionAvailabilityCore', 'commands': ['spatial.connect'], 'routes': ['exactly two eligible endpoints unless deterministic bulk declared'], 'exitRoutes': ['dismiss button', 'selection change', 'composer transition']},
        {'id': 'relation-composer', 'owner': 'RelationInteractionOwner', 'commands': ['relation.edit', 'spatial.relation.commit'], 'routes': ['selection Connect', 'label double-click', 'edge Enter/F2', 'RMB', 'Inspector', 'Command Palette'], 'exitRoutes': ['Cancel', 'close button', 'Escape', 'safe outside pointer', 'Apply']}
    ],
    'familyEngines': [
        {'id': 'Structured', 'engine': 'StructuredSurfaceHost + StructuredDocumentDomainAdapter', 'requiresAdapter': 'StructuredDocumentDomainAdapter', 'proofConsumers': ['library', 'learn'], 'nonLibraryIsolation': 'Learn uses donor-free WorkspaceFoundationHost and has no Library state/search/KU dependency'},
        {'id': 'SpatialRelation', 'engine': 'SpatialSelectionNavigationKernel + SpatialInteractionKernel + RelationInteractionOwner', 'requiresAdapter': 'RelationDomainAdapter', 'proofConsumers': ['visualize', 'enterprise']},
        {'id': 'OperationalTerminal', 'engine': 'OperationalView + TerminalRendererAdapter', 'requiresAdapter': 'RuntimeAdapter', 'defaultAdapter': 'InternalSimulationAdapter', 'proofConsumers': ['runs']}
    ],
    'domainAdapterContracts': [
        {'id': 'StructuredDocumentDomainAdapter', 'version': '1.1.0', 'mustSupply': ['document identity', 'working revision', 'structured schema/capabilities', 'commit/save boundary', 'family-local undo/redo/history', 'recovery boundary', 'minimum notes/source binding', 'domain metadata', 'command availability', 'structured selection descriptor', 'copy/cut/paste structured fragment boundary', 'read-only/schema clipboard eligibility'], 'mustNotOwn': ['workspace panes', 'toolbar grammar', 'Library search/tree state for non-Library consumers']},
        {'id': 'ContextDescriptorProvider', 'version': '1.0.0', 'mustSupply': ['subject', 'domain/family fields', 'canonical owner'], 'mustNotOwn': ['Context Inspector presentation', 'workspace pane state']},
        {'id': 'RelationDomainAdapter', 'version': '1.1.0', 'mustSupply': ['canonical relation store', 'eligible endpoints/types', 'capability and compatibility rules', 'duplicate constraints', 'version/transaction', 'projection'], 'mustNotOwn': ['pointer gestures', 'composer presentation', 'semantic route duplication']},
        {'id': 'RuntimeAdapter', 'version': '1.0.0', 'mustSupply': ['provider descriptor', 'capabilities', 'stable session identity', 'input parser', 'semantic command', 'effect boundary', 'receipts', 'recorded projection'], 'mustNotOwn': ['terminal rendering', 'window/tabs', 'host shell claims']}
    ]
}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'), runtime)

contract_versions = {
    'schemaVersion': 1, 'baselineId': runtime['baselineId'], 'compatibilityModel': 'SEMVER_LIGHTWEIGHT',
    'contracts': [
        {'id': 'WorkspaceFoundationHost', 'version': '1.0.0', 'changeType': 'INITIAL_GLOBAL_HOST_BOUNDARY', 'consumers': ['learn', 'visualize', 'enterprise', 'runs'], 'breakingRule': 'Pane, transient/focus or context boundary changes require consumer migration.'},
        {'id': 'ContextDescriptorProvider', 'version': '1.0.0', 'changeType': 'INITIAL_DESCRIPTOR_BOUNDARY', 'consumers': ['structured', 'spatial', 'operational'], 'breakingRule': 'Descriptor field semantics changes require provider disposition.'},
        {'id': 'RelationDomainAdapter', 'version': '1.1.0', 'changeType': 'COMPATIBLE_EXTENSION', 'consumers': ['visualize', 'enterprise'], 'breakingRule': 'Endpoint/canonical mutation changes require migration and consumer disposition.'},
        {'id': 'StructuredDocumentDomainAdapter', 'version': '1.1.0', 'changeType': 'INITIAL_STABLE_BOUNDARY', 'consumers': ['library', 'learn'], 'breakingRule': 'Identity, schema, history, recovery or commit changes require migration and consumer disposition.'},
        {'id': 'RuntimeAdapter', 'version': '1.0.0', 'changeType': 'INITIAL_PROVIDER_NEUTRAL_BOUNDARY', 'consumers': ['runs'], 'breakingRule': 'Provider descriptor, session identity or input/effect changes require migration and consumer disposition.'},
        {'id': 'ActionAvailability', 'version': '1.2.1', 'changeType': 'COMPATIBLE_BUGFIX_STRICT_DECLARED_CAPABILITY', 'consumers': ['visualize', 'enterprise'], 'breakingRule': 'Visibility or eligibility semantic changes require affected-surface disposition.'},
        {'id': 'SurfaceProfile', 'version': '1.0.0', 'changeType': 'UNCHANGED_COMPATIBLE', 'consumers': ['23-surface-scaffold'], 'breakingRule': 'Classification vocabulary or required-slot changes require profile migration.'},
        {'id': 'SemanticCommand', 'version': '1.0.0', 'changeType': 'UNCHANGED_COMPATIBLE', 'consumers': ['all-composed-surfaces'], 'breakingRule': 'Command identity, owner, availability or effect changes require registry migration.'}
    ],
    'fixtures': {'compatible': {'change': 'add optional descriptor field', 'result': 'PASS'}, 'breaking': {'change': 'rename required canonical state field', 'required': ['affectedConsumers', 'migrationPlan', 'disposition', 'conformanceProof'], 'result': 'REQUIRES_MIGRATION'}},
    'breakingChangeGate': {'required': ['affectedConsumers', 'migrationPlan', 'disposition', 'conformanceProof'], 'status': 'ENFORCED_BY_CONTRACT_CHECK'}
}
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'), contract_versions)

mechanics = {
    'schemaVersion': 2, 'baselineId': runtime['baselineId'], 'statuses': ['FOUNDATION_OWNER', 'FAMILY_OWNER', 'DOMAIN_ADAPTER', 'SURFACE_COMPOSITION', 'APPROVED_DEVIATION', 'POSSIBLE_DUPLICATE_SHARED_MECHANIC'],
    'records': [
        {'mechanicId': 'workspace.panes', 'status': 'FOUNDATION_OWNER', 'familyOwner': 'WorkspacePaneLayoutOwner', 'semanticCommandOwner': 'foundation.workspace', 'canonicalStateOwner': 'ScopedPreferences preferred state + PaneLayoutController effective projection', 'applicableFamilies': ['Structured', 'SpatialRelation', 'OperationalTerminal'], 'requiredAdapter': None, 'approvedDeviations': ['DEV-LIBRARY-COMPAT-HOST-001'], 'implementation': ['dist/foundation/workspace-host.js']},
        {'mechanicId': 'workspace.transient-focus', 'status': 'FOUNDATION_OWNER', 'familyOwner': 'TransientFocusOwner', 'semanticCommandOwner': 'WorkspaceFoundation', 'canonicalStateOwner': 'TransientFocusOwner', 'applicableFamilies': ['Structured', 'SpatialRelation', 'OperationalTerminal'], 'requiredAdapter': None, 'approvedDeviations': ['DEV-LIBRARY-COMPAT-HOST-001'], 'implementation': ['dist/foundation/workspace-host.js', 'dist/foundation/workspace.js']},
        {'mechanicId': 'workspace.context-inspector', 'status': 'FOUNDATION_OWNER', 'familyOwner': 'ContextInspectorPresentation', 'semanticCommandOwner': 'WorkspaceFoundation', 'canonicalStateOwner': 'Domain/family ContextDescriptorProvider', 'applicableFamilies': ['Structured', 'SpatialRelation', 'OperationalTerminal'], 'requiredAdapter': 'ContextDescriptorProvider', 'approvedDeviations': ['DEV-LIBRARY-COMPAT-HOST-001'], 'implementation': ['dist/foundation/workspace.js']},
        {'mechanicId': 'action.availability', 'status': 'FOUNDATION_OWNER', 'familyOwner': 'ActionAvailabilityCore', 'semanticCommandOwner': 'registered SemanticCommand owner; policy preflight via ActionAvailabilityCore', 'canonicalStateOwner': 'Derived policy result only; domain canonical state remains adapter-owned', 'applicableFamilies': ['Structured', 'SpatialRelation', 'OperationalTerminal'], 'requiredAdapter': 'capability/domain predicate only when declared by policy', 'approvedDeviations': [], 'implementation': ['dist/foundation/models.js']},
        {'mechanicId': 'structured.document', 'status': 'FAMILY_OWNER', 'familyOwner': 'StructuredDocumentDomainAdapter + StructuredSurfaceHost', 'semanticCommandOwner': 'StructuredDocumentDomainAdapter', 'canonicalStateOwner': 'StructuredDocumentDomainAdapter working document', 'applicableFamilies': ['Structured'], 'requiredAdapter': 'StructuredDocumentDomainAdapter', 'approvedDeviations': ['DEV-LIBRARY-COMPAT-HOST-001'], 'implementation': ['dist/foundation/structured.js', 'dist/foundation/workspace-host.js']},
        {'mechanicId': 'structured.selection-clipboard', 'status': 'FAMILY_OWNER', 'familyOwner': 'StructuredSelectionModel + StructuredClipboardContract', 'semanticCommandOwner': 'StructuredDocumentDomainAdapter (document.copy/document.cut/document.paste)', 'canonicalStateOwner': 'StructuredDocumentDomainAdapter working document; selection is family-local derived/session state', 'applicableFamilies': ['Structured'], 'requiredAdapter': 'StructuredDocumentDomainAdapter', 'approvedDeviations': ['DEV-LIBRARY-COMPAT-HOST-001'], 'implementation': ['dist/foundation/structured.js']},
        {'mechanicId': 'spatial.selection-actions', 'status': 'FAMILY_OWNER', 'familyOwner': 'RelationInteraction consuming ActionAvailabilityCore', 'semanticCommandOwner': 'RelationInteractionOwner', 'canonicalStateOwner': 'SpatialModel.selection + RelationDomainAdapter; eligibility derived by ActionAvailabilityCore', 'applicableFamilies': ['SpatialRelation'], 'requiredAdapter': 'RelationDomainAdapter', 'approvedDeviations': [], 'implementation': ['dist/foundation/relations.js']},
        {'mechanicId': 'relation.edit', 'status': 'FAMILY_OWNER', 'familyOwner': 'RelationInteractionOwner', 'semanticCommandOwner': 'relation.edit / spatial.relation.commit', 'canonicalStateOwner': 'RelationDomainAdapter', 'applicableFamilies': ['SpatialRelation'], 'requiredAdapter': 'RelationDomainAdapter', 'approvedDeviations': [], 'implementation': ['dist/foundation/relations.js']},
        {'mechanicId': 'spatial.input', 'status': 'FAMILY_OWNER', 'familyOwner': 'SpatialInteractionKernel + SpatialSelectionNavigationKernel', 'semanticCommandOwner': 'SpatialInteractionKernel', 'canonicalStateOwner': 'SpatialModel focus/selection/camera/model state', 'applicableFamilies': ['SpatialRelation'], 'requiredAdapter': None, 'approvedDeviations': [], 'implementation': ['dist/foundation/spatial.js']},
        {'mechanicId': 'operational.sessions', 'status': 'FAMILY_OWNER', 'familyOwner': 'OperationalView + SessionPresentation', 'semanticCommandOwner': 'RuntimeAdapter descriptor', 'canonicalStateOwner': 'RuntimeAdapter session + SessionPresentation', 'applicableFamilies': ['OperationalTerminal'], 'requiredAdapter': 'RuntimeAdapter', 'approvedDeviations': [], 'implementation': ['dist/foundation/operational.js', 'dist/foundation/models.js']},
        {'mechanicId': 'runtime.internal-simulation', 'status': 'DOMAIN_ADAPTER', 'familyOwner': 'InternalSimulationAdapter', 'semanticCommandOwner': 'InternalSimulationAdapter', 'canonicalStateOwner': 'SimulatedDeviceEngine', 'applicableFamilies': ['OperationalTerminal'], 'requiredAdapter': 'RuntimeAdapter', 'approvedDeviations': [], 'implementation': ['dist/adapters/simulation.js']}
    ], 'duplicateScan': 'tools/check-duplicate-mechanics.mjs'
}
dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'), mechanics)

deviation = {'id': 'DEV-LIBRARY-COMPAT-HOST-001', 'source': 'Accepted Library donor parity requirement', 'reason': 'Library alone retains the accepted donor host while representative non-Library consumers use WorkspaceFoundationHost; this is a bounded compatibility seam, not a second reusable owner.', 'affectedConsumers': ['library'], 'proof': 'Conditional dynamic import in dist/main.js; browser Library parity smoke; donor identity hash.', 'status': 'APPROVED_BOUNDED_COMPATIBILITY_DEVIATION'}
dump(Path('contracts/DEVIATION_REGISTER.json'), {'schemaVersion': 2, 'baselineId': runtime['baselineId'], 'records': [deviation], 'policy': 'Every shared-mechanic deviation requires exact source, domain reason, affected consumers and executable proof.'})

writer_schema = {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$id': 'cep://contracts/writer-intake.schema.json', 'type': 'object', 'additionalProperties': False, 'required': ['foundationBaseline', 'targetSurface', 'surfaceProfile', 'inheritedGlobalComponents', 'familyEngines', 'domainAdapter', 'registeredCommands', 'applicablePreferences', 'forbiddenDuplicateMechanics', 'valuableDeferredRequirements', 'allowedDeviations', 'ownerDeltas', 'requiredProof'], 'properties': {
    'foundationBaseline': {'type': 'string', 'const': runtime['baselineId']}, 'targetSurface': {'type': 'string', 'minLength': 1}, 'surfaceProfile': {'type': 'string', 'pattern': '^profiles/[a-z_]+\\.json$'}, 'inheritedGlobalComponents': {'type': 'array', 'minItems': 1, 'items': {'type': 'string'}}, 'familyEngines': {'type': 'array', 'items': {'type': 'string', 'enum': ['Structured', 'SpatialRelation', 'OperationalTerminal']}}, 'domainAdapter': {'type': 'object'}, 'registeredCommands': {'type': 'array', 'items': {'type': 'string'}}, 'applicablePreferences': {'type': 'array', 'items': {'type': 'string'}}, 'forbiddenDuplicateMechanics': {'type': 'array'}, 'valuableDeferredRequirements': {'type': 'array'}, 'allowedDeviations': {'type': 'array'}, 'ownerDeltas': {'type': 'array', 'items': {'type': 'string'}}, 'requiredProof': {'type': 'array', 'minItems': 1, 'items': {'type': 'object', 'required': ['before', 'action', 'owner', 'after', 'visible', 'negative']}}
}}
dump(Path('contracts/schemas/writer_intake.schema.json'), writer_schema)
dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'), {'foundationBaseline': runtime['baselineId'], 'targetSurface': '<surface>', 'surfaceProfile': 'profiles/<surface>.json', 'inheritedGlobalComponents': ['WorkspaceFrame', 'ContextInspector', 'SemanticCommandRegistry', 'CapabilityRegistry', 'ActionSurfaceRegistry'], 'familyEngines': ['<Structured|SpatialRelation|OperationalTerminal when profile requires>'], 'domainAdapter': {'contract': '<registry contract id>', 'implementation': '<thin adapter file>', 'canonicalStateOwner': '<one domain owner>', 'commands': ['<registered command ids>'], 'capabilities': ['<registered capability ids>']}, 'registeredCommands': ['<registered command ids>'], 'applicablePreferences': ['<preference keys>'], 'forbiddenDuplicateMechanics': ['<registry mechanic IDs>'], 'valuableDeferredRequirements': ['<only applicable active high-value deferred IDs>'], 'allowedDeviations': ['<approved deviation IDs only; otherwise empty>'], 'ownerDeltas': ['<active Owner decision IDs>'], 'requiredProof': [{'before': '<observable before>', 'action': '<actual pointer/keyboard action>', 'owner': '<semantic command/state owner>', 'after': '<canonical after>', 'visible': '<visible correct change>', 'negative': '<stale/duplicate/fake state absent>'}]})

# Read the current corrected 318-row Controller compilation; do not re-atomize or infer history.
w03_atoms = csv_rows('07_W03_69_REQUIREMENT_REUSE_MAP.csv')
semantic_receipt = json.loads((root / 'assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json').read_text())
work_admission_policy = json.loads((root / 'authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json').read_text())
sections = defaultdict(list)
for atom in w03_atoms:
    sections[atom['SECTION_ID']].append(atom)

def section_disposition(rows):
    admissions = {row['WORK_ADMISSION'] for row in rows}
    has_now = any(value.startswith('DO_NOW_') for value in admissions)
    has_defer = any(value.startswith('DEFER_') for value in admissions)
    if has_now and has_defer:
        return 'PARTIALLY_RECONCILED'
    if has_now or admissions == {'PRESENT_NEEDS_BETTER_TEST'}:
        return 'RECONCILED_CURRENT'
    if 'PRESENT_NEEDS_BETTER_TEST' in admissions:
        return 'PARTIALLY_RECONCILED'
    return 'DEFERRED_TO_NAMED_FUTURE_OWNER'

section_rows = []
for section_id, atoms in sorted(sections.items(), key=lambda item: int(item[1][0]['SECTION_NUMBER'])):
    tasks = sorted({task for atom in atoms for task in atom['ADMITTED_TASK_ID'].split(';') if task})
    owners = sorted({atom['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'] for atom in atoms})
    disposition = section_disposition(atoms)
    section_rows.append({'sectionId': section_id, 'sectionNumber': int(atoms[0]['SECTION_NUMBER']), 'title': atoms[0]['SECTION_TITLE'], 'atomCount': len(atoms), 'disposition': disposition, 'ownerGroups': owners, 'historicalWorkAdmissions': sorted({atom['WORK_ADMISSION'] for atom in atoms}), 'historicalAdmittedTaskIds': tasks, 'exactPointer': f'authority/controller/07_W03_69_REQUIREMENT_REUSE_MAP.csv#{section_id}', 'futureOwnerPointers': owners if disposition != 'RECONCILED_CURRENT' else []})

atom_output = [{'sectionId': atom['SECTION_ID'], 'sourceAtomId': atom['SOURCE_ATOM_ID'], 'requirementId': atom['REQUIREMENT_ID'], 'ownershipLayer': atom['CONTROLLER_OWNERSHIP_LAYER'], 'owner': atom['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'], 'disposition': atom['W03_DISPOSITION'], 'historicalWorkAdmission': atom['WORK_ADMISSION'], 'historicalAdmittedTaskIds': [task for task in atom['ADMITTED_TASK_ID'].split(';') if task], 'sourcePointer': f"authority/controller/07_W03_69_REQUIREMENT_REUSE_MAP.csv#{atom['SOURCE_ATOM_ID']}"} for atom in w03_atoms]
summary = Counter(row['disposition'] for row in section_rows)
w03_disposition = {'schemaVersion': 2, 'authority': runtime['w03Baseline']['authority'], 'sourceCompilation': 'Controller-validated 69-section/318-atom reuse map with bounded v0.2.1a + independent v0.2.1c high-risk semantic-owner corrections; no historical re-atomization performed.', 'sourceSections': len(section_rows), 'sourceAtoms': len(atom_output), 'sectionSummary': dict(summary), 'sections': section_rows, 'atoms': atom_output, 'semanticReview': {'rowsReviewed': semantic_receipt['rowsReviewed'], 'rowsChanged': semantic_receipt['rowsChanged'], 'unchangedRows': semantic_receipt['unchangedRows'], 'method': semantic_receipt['method']}, 'workAdmissionSemantics': work_admission_policy['workAdmissionSemantics'], 'currentActiveDeferredTruth': work_admission_policy['currentActiveDeferredTruth'], 'truthCeiling': semantic_receipt['truthCeiling']}
dump(Path('authority/W03_69_318_REQUIREMENT_REUSE_DISPOSITION.json'), w03_disposition)
dump(Path('authority/W03_FOUNDATION_RELEVANT_DISPOSITION_v0.2.1.json'), {'schemaVersion': 2, 'scope': 'GROUPED_CONTROLLER_REUSE_DISPOSITION', 'sourceSections': 69, 'sourceAtoms': 318, 'summary': dict(summary), 'rows': section_rows, 'truthCeiling': w03_disposition['truthCeiling']})

w03_csv_path = root / 'authority/W03_PROPOSAL_69_SECTION_DISPOSITION.csv'
with w03_csv_path.open('w', encoding='utf-8', newline='') as handle:
    fieldnames = ['section_id', 'section_number', 'title', 'atom_count', 'historical_reconciliation_disposition', 'owner_groups', 'historical_work_admissions', 'historical_admitted_task_ids', 'exact_pointer', 'notes']
    writer = csv.DictWriter(handle, fieldnames=fieldnames)
    writer.writeheader()
    for row in section_rows:
        writer.writerow({'section_id': row['sectionId'], 'section_number': row['sectionNumber'], 'title': row['title'], 'atom_count': row['atomCount'], 'historical_reconciliation_disposition': row['disposition'], 'owner_groups': '; '.join(row['ownerGroups']), 'historical_work_admissions': '; '.join(row['historicalWorkAdmissions']), 'historical_admitted_task_ids': '; '.join(row['historicalAdmittedTaskIds']), 'exact_pointer': row['exactPointer'], 'notes': 'Historical reconciliation only; WORK_ADMISSION is provenance, not current backlog. Current active deferred truth: assurance/HIGH_VALUE_DEFERRED_LEDGER.json.'})

active_rows = csv_rows('13_HIGH_VALUE_DEFERRED_WORK.csv')
active = [{'id': row['DEFERRED_ID'], 'item': row['ITEM'], 'classification': row['CLASSIFICATION'], 'futureOwner': row['FUTURE_OWNER'], 'whyValuable': row['WHY_VALUABLE'], 'reactivationTrigger': row['REACTIVATION_TRIGGER'], 'source': row['SOURCE'], 'activeFutureObligation': True} for row in active_rows]
# Explicit applicability is current Writer-routing metadata only. It does not implement any deferred feature.
deferred_applicability = {
    'DEF-HV-001': {'surfaceFamilies': ['Structured', 'SpatialRelation', 'OperationalTerminal'], 'global': False, 'reason': 'Cross-family Notes seam is relevant only to families named by the deferred item.'},
    'DEF-HV-002': {'surfaceFamilies': ['OperationalTerminal'], 'global': False},
    'DEF-HV-003': {'surfaceFamilies': ['OperationalTerminal'], 'global': False},
    'DEF-HV-004': {'global': True, 'reason': 'Explicit GLOBAL_FOUNDATION layout-profile obligation.'},
    'DEF-HV-005': {'surfaceFamilies': ['Analytical'], 'global': False},
    'DEF-HV-006': {'surfaceFamilies': ['ReviewAudit'], 'targetSurfaces': ['reviews', 'audit', 'evidence', 'validation'], 'global': False},
    'DEF-HV-007': {'global': True, 'reason': 'Explicit GLOBAL_FOUNDATION guidance layer obligation.'},
    'DEF-HV-008': {'surfaceFamilies': ['Analytical', 'ReviewAudit'], 'global': False},
    'DEF-HV-009': {'surfaceFamilies': ['OperationalTerminal'], 'global': False},
    'DEF-HV-010': {'targetSurfaceMode': 'SELF', 'global': False, 'reason': 'Each target Writer adjudicates only its own SurfaceProfile semantics.'},
}
for item in active:
    item['applicability'] = deferred_applicability[item['id']]

excluded_rows = csv_rows('14_DROPPED_SUPERSEDED_LOW_VALUE_ITEMS.csv')
excluded = [{'id': row['ITEM_ID'], 'item': row['ITEM'], 'classification': row['CLASSIFICATION'], 'whyExcluded': row['WHY_EXCLUDED'], 'traceabilityOnlyRule': row['TRACEABILITY_ONLY_RULE'], 'activeFutureObligation': False} for row in excluded_rows]
active_classes = ['DEFER_HIGH_VALUE', 'DEFER_TO_FAMILY_BUILD', 'DEFER_TO_SURFACE_BUILD']
excluded_classes = ['DROP_LOW_VALUE', 'DROP_DUPLICATE', 'SUPERSEDED', 'HISTORICAL_ONLY']
dump(Path('contracts/DEFERRED_WORK_GOVERNANCE.json'), {'schemaVersion': 1, 'policy': 'VALUE_FILTERED_DEFERRED_WORK', 'activeClasses': active_classes, 'excludedClasses': excluded_classes, 'fixture': {'input': [{'id': 'valuable', 'classification': 'DEFER_HIGH_VALUE'}, {'id': 'low', 'classification': 'DROP_LOW_VALUE'}, {'id': 'duplicate', 'classification': 'DROP_DUPLICATE'}, {'id': 'superseded', 'classification': 'SUPERSEDED'}, {'id': 'historical', 'classification': 'HISTORICAL_ONLY'}], 'expectedActiveIds': ['valuable'], 'expectedExcludedIds': ['low', 'duplicate', 'superseded', 'historical']}})
dump(Path('assurance/HIGH_VALUE_DEFERRED_LEDGER.json'), {'schemaVersion': 2, 'policy': 'VALUE_FILTERED_DEFERRED_WORK', 'source': 'authority/controller/13_HIGH_VALUE_DEFERRED_WORK.csv', 'items': active, 'summary': {'items': len(active), 'classifications': dict(Counter(item['classification'] for item in active)), 'activeFutureObligations': len(active)}})
dump(Path('assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json'), {'schemaVersion': 1, 'policy': 'TRACEABILITY_ONLY_NOT_FUTURE_IMPLEMENTATION_OBLIGATION', 'source': 'authority/controller/14_DROPPED_SUPERSEDED_LOW_VALUE_ITEMS.csv', 'items': excluded, 'summary': {'items': len(excluded), 'classifications': dict(Counter(item['classification'] for item in excluded)), 'activeFutureObligations': 0}})
dump(Path('assurance/DEFERRED_WORK_LEDGER.json'), {'schemaVersion': 2, 'policy': 'VALUE_FILTERED_DEFERRED_WORK', 'canonicalLedger': 'assurance/HIGH_VALUE_DEFERRED_LEDGER.json', 'items': active, 'summary': {'items': len(active), 'activeFutureObligations': len(active), 'excludedTraceability': 'assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json'}})

intake = json.loads((root / 'authority/W03_V34_TARGETED_INTAKE.json').read_text())
for source in intake['sources']:
    source['classification'] = runtime['w03Baseline']['authority']
dump(Path('authority/W03_V34_TARGETED_INTAKE.json'), intake)
dump(Path('assurance/AUTHORITY_BEFORE_AFTER_REGISTER.json'), {'schemaVersion': 2, 'status': 'SUPERSEDED_AUTHORITY_REMOVED', 'activeForbiddenOccurrences': 0, 'changes': [{'scope': 'W03 v3.4 generators and generated artifacts', 'before': 'Superseded W03 same-lineage implementation-baseline claim (identifier intentionally not reproduced)', 'after': runtime['w03Baseline']['authority'], 'authority': 'OWNER_W03_AUTHORITY_CORRECTION', 'semanticChange': 'W03 v3.4 contributes independently dispositioned value/domain/requirement evidence only.'}], 'negativeGate': {'scan': 'all candidate text files', 'expectedExactOccurrences': 0, 'expectedSemanticAuthorityAliases': 0}})
surface_status = {'ENTERPRISE': 'BOUNDED_RELATION_DOMAIN_ADAPTER_PROVEN', 'RUNS': 'BOUNDED_INTERNAL_SIMULATION_CAUSAL_PATH_PROVEN', 'SCENARIOS': 'DEFER_TO_SURFACE_BUILD', 'LABS': 'DEFER_TO_SURFACE_BUILD', 'RESULTS': 'DEFER_TO_SURFACE_BUILD'}
dump(Path('authority/W03_V34_CONTINUATION_MAP.json'), {'baseline': runtime['w03Baseline'], 'surfaces': [dict(source, status=surface_status[source['surface']], continuationProfile='profiles/' + source['surface'].lower() + '.json') for source in intake['sources']]})

original_controller_identity = json.loads((controller / 'CONTROLLER_PACKAGE_ORIGINAL_INPUT_IDENTITY.json').read_text())
controller_files = {path.name: {'bytes': path.stat().st_size, 'sha256': sha256(path)} for path in sorted(controller.glob('*')) if path.name not in {'CONTROLLER_INPUT_IDENTITY.json','CONTROLLER_PACKAGE_ORIGINAL_INPUT_IDENTITY.json'}}
dump(Path('authority/controller/CONTROLLER_INPUT_IDENTITY.json'), {'schemaVersion': 2, 'package': runtime['controllerDelta'], 'mode': 'READ_ONLY_GUIDANCE_EVIDENCE', 'originalPackageInputs': original_controller_identity['copiedInputs'], 'currentWorkingCopies': controller_files, 'workingCompilationPolicy': '07 W03 map is an intentionally corrected derivative; all original Controller package input identities remain preserved in CONTROLLER_PACKAGE_ORIGINAL_INPUT_IDENTITY.json.'})

task_classification = [
    {'taskId': 'FND-RSM-P0-001', 'checkpointClass': 'ALREADY_COMPLETED_IN_WORK', 'deltaApplied': 'Preserved generator correction; expanded exact and semantic negative gate.'},
    {'taskId': 'FND-RSM-P0-002', 'checkpointClass': 'NEWLY_ADMITTED_BY_THIS_CONTROLLER', 'deltaApplied': 'Replaced active backlog with value-filtered ledger plus exclusion traceability.'},
    {'taskId': 'FND-RSM-P0-003', 'checkpointClass': 'ALREADY_COMPLETED_IN_WORK', 'deltaApplied': 'Preserved Structured boundary and moved Learn to donor-free host.'},
    {'taskId': 'FND-RSM-P1-004', 'checkpointClass': 'IN_PROGRESS_AT_PAUSE', 'deltaApplied': 'Completed central availability matrix and canonical duplicate/domain/command gates.'},
    {'taskId': 'FND-RSM-P1-005', 'checkpointClass': 'NEWLY_ADMITTED_BY_THIS_CONTROLLER', 'deltaApplied': 'Added WorkspaceFoundationHost, PaneLayoutController, transient/focus and ContextDescriptor owners.'},
    {'taskId': 'FND-RSM-P1-006', 'checkpointClass': 'ALREADY_COMPLETED_IN_WORK', 'deltaApplied': 'Preserved provider-neutral presentation and causal state proofs.'},
    {'taskId': 'FND-RSM-P1-007', 'checkpointClass': 'ALREADY_COMPLETED_IN_WORK', 'deltaApplied': 'Preserved Ctrl+RMB and semantic keyboard fixes.'},
    {'taskId': 'FND-RSM-P1-008', 'checkpointClass': 'IN_PROGRESS_AT_PAUSE', 'deltaApplied': 'Bound 69 sections and 318 atoms to Controller-grouped owners/dispositions.'},
    {'taskId': 'FND-RSM-P1-009', 'checkpointClass': 'IN_PROGRESS_AT_PAUSE', 'deltaApplied': 'Retained six-flow harness; final browser receipt is generated by execution.'},
    {'taskId': 'FND-RSM-P1-010', 'checkpointClass': 'IN_PROGRESS_AT_PAUSE', 'deltaApplied': 'Updated owner/version/scaffold governance after runtime owners stabilized.'}
]
dump(Path('assurance/WORK_RESUME_TASK_CLASSIFICATION.json'), {'schemaVersion': 1, 'liveCheckpointAuthority': 'EXISTING_WORK_CHAT_LIVE_STATE', 'controllerTaskCount': 10, 'candidateStatus': 'ALL_10_COMPLETED_FOR_BOUNDED_CANDIDATE', 'tasks': [dict(row, candidateTaskStatus='COMPLETED_FOR_BOUNDED_CANDIDATE') for row in task_classification]})

# Preserve Controller-accepted current owner truth after legacy/base registry generation.
subprocess.run([sys.executable, str(root / 'tools/reconcile-current-owner-registries.py')], check=True)
