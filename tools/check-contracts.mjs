import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const root = new URL('../', import.meta.url), tests = [];
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const text = async path => readFile(new URL(path, root), 'utf8');
const check = (id, ok, detail) => tests.push({ id, status: ok ? 'PASS' : 'FAIL', detail });
const unique = items => new Set(items.map(item => item.id)).size === items.length;
async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await walk(new URL(entry.name + '/', directory), relative + '/'));
    else files.push(relative);
  }
  return files;
}

const profiles = (await readdir(new URL('profiles/', root))).filter(name => name.endsWith('.json'));
check('profiles.count', profiles.length === 23, profiles.length);
const profileClasses = new Set(['MANDATORY_INHERIT', 'INHERIT_AND_BIND', 'ADAPT', 'SPECIALIZE', 'OPTIONAL', 'NOT_APPLICABLE', 'OWNER_DECISION_REQUIRED']);
for (const name of profiles) {
  const profile = await read('profiles/' + name);
  check('profile.' + profile.surface, Object.keys(profile.foundation).length === 61 && Object.values(profile.foundation).every(item => profileClasses.has(item.classification) && item.reason) && ['TOP', 'TOOLBAR', 'LEFT', 'CENTER', 'RIGHT', 'BOTTOM', 'TRANSIENT'].every(slot => profile.slots[slot]), '61 explicit dispositions and 7 slots');
  check('profile.na_reason.' + profile.surface, Object.values(profile.foundation).filter(item => item.classification === 'NOT_APPLICABLE').every(item => item.reason.length >= 20 && !/^(n\/?a|not applicable)$/i.test(item.reason)), 'substantive N/A reasons');
  check('profile.family_match.' + profile.surface, profile.family_engines.every(id => ['INHERIT_AND_BIND', 'MANDATORY_INHERIT', 'ADAPT', 'SPECIALIZE'].includes(profile.foundation[id]?.classification)), 'family engines match profile inheritance');
}

const commands = await read('contracts/COMMAND_REGISTRY.seed.json');
check('commands.unique', new Set(commands.map(item => item.id)).size === commands.length, commands.length);
check('commands.schema', commands.every(item => ['id', 'owner', 'intent', 'availability', 'effect'].every(key => key in item)), 'required command fields');
const preferences = await read('contracts/PREFERENCE_REGISTRY.seed.json');
check('preferences.schema', preferences.every(item => ['key', 'safeDefault', 'scope', 'applicability', 'persistenceOwner'].every(key => key in item)), preferences.length);

const donor = await readFile(new URL('dist/reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html', root));
check('donor.identity', donor.length === 672893 && createHash('sha256').update(donor).digest('hex') === 'ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd', 'exact accepted donor bytes/hash');
const census = await read('archaeology/ACCEPTED_LIBRARY_FULL_MECHANIC_CENSUS.json');
check('donor.census', census.function_dispositions.length === 330 && census.function_dispositions.every(item => item.symbol_present), '330 preserved named function dispositions');
const build = await read('contracts/BUILD_RECEIPT.json');
check('matrix.complete', build.matrix_rows === 1403, '23 × (40 conceptual owners + 21 executable component families)');

const modules = [
  'dist/main.js', 'dist/model-tests.js',
  ...['models', 'workspace', 'workspace-host', 'spatial', 'relations', 'operational', 'accepted-runtime', 'window-motion', 'structured'].map(name => `dist/foundation/${name}.js`),
  ...['simulation', 'structured-documents', 'learn', 'w03-enterprise', 'w03-runs', 'w03-v34/domain-kernel', 'w03-v34/runs-fixture', 'w03-v34/enterprise-fixture'].map(name => `dist/adapters/${name}.js`)
];
for (const path of modules) {
  const result = spawnSync(process.execPath, ['--check', new URL(path, root).pathname], { encoding: 'utf8' });
  check('syntax.' + path, result.status === 0, result.stderr || 'valid');
}

const [mainSource, modelsSource, relationSource, relationInteractionSource, spatialSource, operationalSource, simulationSource, structuredSource, structuredAdapterSource, acceptedSource, hostSource, workspaceSource, browserSource] = await Promise.all([
  text('dist/main.js'), text('dist/foundation/models.js'), text('dist/foundation/relations.js'), text('dist/foundation/spatial/relation-interaction.js'), text('dist/foundation/spatial.js'), text('dist/foundation/operational.js'), text('dist/adapters/simulation.js'), text('dist/foundation/structured.js'), text('dist/adapters/structured-documents.js'), text('dist/foundation/accepted-runtime.js'), text('dist/foundation/workspace-host.js'), text('dist/foundation/workspace.js'), text('tools/browser-conformance.mjs')
]);
check('runtime.no_host_provider', !/(child_process|fetch\(|WebSocket|XMLHttpRequest|execFile|spawn\()/g.test(simulationSource), 'simulation source has no host/network execution integration');
check('operational.provider_neutral', !/(InternalSimulation|\bsimulation\b|\.sessions\.get\()/i.test(operationalSource) && /providerDescriptor|provider\.descriptor\(\)/.test(operationalSource) && /provider\.session\(/.test(operationalSource), 'shared Operational presentation consumes only the RuntimeAdapter contract');
check('structured.boundary', /class\s+StructuredDocumentDomainAdapter\b/.test(structuredSource) && ['identity', 'workingRevision', 'schema', 'capabilities', 'commit', 'undo', 'redo', 'recovery', 'noteBinding', 'metadata', 'availability', 'StructuredSelectionModel', 'STRUCTURED_CLIPBOARD_CONTRACT', 'copySelection', 'cutSelection', 'pasteStructured', 'bindSemanticCommands'].every(token => structuredSource.includes(token)), 'executable structured ownership boundary is explicit');
check('structured.non_library_isolation', !structuredAdapterSource.includes('library-fixtures') && /libraryIndependent:true/.test(structuredAdapterSource) && /import\('\.\/adapters\/library-fixtures\.js'\)/.test(mainSource) && /mountWorkspaceHost/.test(mainSource), 'Learn path has no Library fixture import/state/search dependency');
check('structured.contract_version', /STRUCTURED_DOCUMENT_CONTRACT/.test(structuredSource) && /version:\s*'1\.1\.0'/.test(structuredSource) && /StructuredSelectionModel/.test(structuredSource) && /StructuredClipboardContract/.test(structuredSource), 'Structured contract plus selection/clipboard seam are versioned');
check('workspace.donor_free_bootstrap', !/^import\s+\{mountAcceptedRuntime\}/m.test(mainSource) && /if\(consumer==='library'\)[\s\S]{0,180}import\('\.\/foundation\/accepted-runtime\.js'\)/.test(mainSource) && /else api=mountWorkspaceHost/.test(mainSource), 'accepted runtime is conditionally imported for Library only');
check('workspace.host_owners', /class\s+PaneLayoutController/.test(hostSource) && /class\s+TransientFocusController/.test(hostSource) && /class\s+ContextDescriptorProvider/.test(workspaceSource) && /class\s+ContextInspectorPresentation/.test(workspaceSource), 'pane, transient/focus and context descriptor owners are executable');
const componentCsv = await text('contracts/COMPONENT_REGISTRY.csv'), stateOwnerCsv = await text('contracts/STATE_OWNERSHIP_REGISTRY.csv'), writerGeneratorSource = await text('tools/build-writer-contracts.py'), compilerSource = await text('tools/compile-contracts.py');
check('registries.current_owner_consistency', componentCsv.includes('WorkspaceFrame,SC-002,dist/foundation/workspace-host.js') && componentCsv.includes('SidePaneShell,SC-003,dist/foundation/workspace-host.js') && componentCsv.includes('ContextInspector,SC-004,dist/foundation/global/context-inspector.js') && componentCsv.includes('BottomShelf,SC-005,dist/foundation/global/bottom-shelf.js') && componentCsv.includes('StatusFeedback,SC-022,dist/foundation/global/feedback.js') && componentCsv.includes('GlobalInputKeymap,SC-020,dist/foundation/global/input-keymap.js') && componentCsv.includes('UIScalePolicy,SC-007,dist/foundation/global/preferences/ui-scale.js') && stateOwnerCsv.includes('effective pane geometry,WorkspacePaneLayoutOwner') && stateOwnerCsv.includes('global transient/focus lifecycle,TransientFocusOwner') && stateOwnerCsv.includes('global input routing and region-cycle receipts,GlobalInputKeymapOwner') && stateOwnerCsv.includes('accessibility feedback presentation,AccessibilityFeedbackOwner') && stateOwnerCsv.includes('context inspector presentation lifecycle,ContextInspectorHost') && stateOwnerCsv.includes('bottom deep-work presentation lifecycle,BottomDeepWorkOwner') && stateOwnerCsv.includes('application chrome UI scale projection,UIScalePolicyOwner') && !stateOwnerCsv.includes('accepted-runtime workspace'), 'CSV registries name the accepted Wave 1-3 executable owners and preserve provider/domain truth boundaries');
check('generators.current_owner_consistency', writerGeneratorSource.includes('reconcile-current-owner-registries.py') && compilerSource.includes('reconcile-current-owner-registries.py') && writerGeneratorSource.includes("'effective pane geometry', 'owner': 'WorkspacePaneLayoutOwner'") && compilerSource.includes("('effective pane geometry','WorkspacePaneLayoutOwner'") && !compilerSource.includes("('effective pane geometry','accepted-runtime workspace'"), 'both active registry generators preserve base generation then apply the Controller-accepted current-owner reconciliation');
check('generators.deferred_applicability_preserved', writerGeneratorSource.includes('deferred_applicability') && ['DEF-HV-001','DEF-HV-004','DEF-HV-006','DEF-HV-009','DEF-HV-010'].every(id => writerGeneratorSource.includes(id)) && writerGeneratorSource.includes("item['applicability'] = deferred_applicability[item['id']]"), 'active registry generator preserves target-relevance metadata instead of regenerating a global-only deferred ledger');

const runtime = await read('contracts/FOUNDATION_RUNTIME_REGISTRY.json');
check('runtime.baseline', runtime.baselineId === 'CEP-FR-E18-ANALYTICAL-COMPARE-COMPLETION' && runtime.status === 'CONTROLLER_ACCEPTED_POST_FINAL_GATE_FOUNDATION_SUCCESSOR_CONTENT' && runtime.finalFoundationGateStatus === 'CONTROLLER_ACCEPTED_AND_CLOSED_ALL_SURFACES_READY' && runtime.stackStatus === 'STACK_NOT_FROZEN' && runtime.wave3Status === 'CONTROLLER_ACCEPTED_AND_CLOSED' && runtime.wave4Status === 'CONTROLLER_ACCEPTED_AND_CLOSED' && runtime.wave5Status === 'CONTROLLER_ACCEPTED_AND_CLOSED' && runtime.wave6Status === 'CONTROLLER_ACCEPTED_AND_CLOSED', runtime.baselineId);
const [globalInputSource, feedbackSource, contextHostSource, bottomSource, uiScaleSource, wave3AssemblySource] = await Promise.all([
  text('dist/foundation/global/input-keymap.js'), text('dist/foundation/global/feedback.js'), text('dist/foundation/global/context-inspector.js'), text('dist/foundation/global/bottom-shelf.js'), text('dist/foundation/global/preferences/ui-scale.js'), text('dist/foundation/wave3-assembly.js')
]);
check('wave3.global_owners_physical', /class\s+GlobalInputKeymapOwner/.test(globalInputSource) && /class\s+AccessibilityFeedbackOwner/.test(feedbackSource) && /class\s+ContextInspectorHost/.test(contextHostSource) && /class\s+BottomDeepWorkOwner/.test(bottomSource) && /class\s+UIScalePolicyOwner/.test(uiScaleSource), 'five accepted Wave 3 Global owners are physically executable');
check('wave3.composition_not_semantic_owner', /owner:'ControllerIntegrationHost'/.test(wave3AssemblySource) && /owners:Object\.freeze\(\['GlobalInputKeymapOwner','AccessibilityFeedbackOwner','ContextInspectorHost','BottomDeepWorkOwner','UIScalePolicyOwner'\]\)/.test(wave3AssemblySource), 'Controller assembly composes the five owners without becoming a parallel semantic owner');
check('wave3.input_single_route', /if\(e\.defaultPrevented\)return/.test(acceptedSource) && /GlobalInputKeymapOwner/.test(globalInputSource), 'Library donor key router yields when the accepted GlobalInputKeymapOwner already handled the event');
check('wave3.context_single_route', /if\(wave3Assembly\)wave3Assembly\.refreshContext\(\);else workspace\.inspectorDescriptor\(provider\)/.test(mainSource), 'legacy inspector presentation is fallback-only after ContextInspectorHost assembly');
check('wave3.bottom_single_route', /bottomSet/.test(acceptedSource) && /setBottomOpen/.test(wave3AssemblySource) && /BottomDeepWorkOwner/.test(bottomSource), 'legacy bottom entry routes delegate lifecycle to BottomDeepWorkOwner when Wave 3 assembly is present');
check('wave3.ui_scale_boundary', /UIScalePolicyOwner/.test(uiScaleSource) && /documentZoom|canvasZoom|density|responsive/i.test(uiScaleSource), 'UI scale policy explicitly separates application chrome scale from document/canvas zoom, density and responsive semantics');
const [structuredInputSource, structuredActionSource, inputDirectionSource, richContentSource, dragDropSource, settingsCenterSource, operationalSessionSource, epistemicSource, confirmationSource, wave4AssemblySource] = await Promise.all([
  text('dist/foundation/structured/input-keymap.js'), text('dist/foundation/structured/action-descriptors.js'), text('dist/foundation/global/input-direction.js'), text('dist/foundation/structured/rich-content.js'), text('dist/foundation/structured/drag-drop.js'), text('dist/foundation/global/settings/center.js'), text('dist/foundation/operational/session-owner.js'), text('dist/foundation/contracts/epistemic-state.js'), text('dist/foundation/global/confirmation-host.js'), text('dist/foundation/wave4-assembly.js')
]);
check('wave4.owners_physical', /class\s+StructuredInputKeymapOwner/.test(structuredInputSource) && /class\s+StructuredActionDescriptorOwner/.test(structuredActionSource) && /class\s+InputDirectionResolver/.test(inputDirectionSource) && /class\s+StructuredRichContentOwner/.test(richContentSource) && /class\s+StructuredDragDropOwner/.test(dragDropSource) && /class\s+SettingsCenterOwner/.test(settingsCenterSource) && /class\s+OperationalSessionOwner/.test(operationalSessionSource) && /EpistemicStateContract|validateEpistemic/.test(epistemicSource) && /class\s+ConfirmationSafetyHost/.test(confirmationSource), 'Wave 4 accepted Global/Structured/bounded-Operational/contract owners are physically executable');
check('wave4.composition_not_semantic_owner', /Wave4FamilyInteractionAssembly|mountWave4FamilyInteractionAssembly/.test(wave4AssemblySource) && /semanticOwner:false/.test(wave4AssemblySource), 'Wave4 assembly is Controller composition only and does not become a parallel semantic owner');
check('wave4.settings_owner_truth', runtime.components.some(item => item.id === 'SettingsCenter' && item.presentationOwner === 'SettingsCenterOwner') && runtime.components.some(item => item.id === 'InputDirectionResolver' && item.presentationOwner === 'InputDirectionResolver'), 'Settings and direction are registered to their accepted Global owners');
check('wave4.operational_maturity_ceiling', runtime.components.some(item => item.id === 'OperationalSessionBoundary' && /BELOW M6|below M6|SECOND_REAL_PROVIDER_NOT_PROVEN/i.test(JSON.stringify(item))) && runtime.familyEngines.find(item => item.id === 'OperationalTerminal')?.maturity === 'BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN', 'OperationalSessionOwner remains explicitly below M6 because a second genuine provider is not proven');
check('wave5.structured_family_accepted', runtime.wave5Status === 'CONTROLLER_ACCEPTED_AND_CLOSED' && runtime.familyEngines.find(item => item.id === 'Structured')?.wave5HostPending === false && /StructuredSurfaceHost/.test(runtime.familyEngines.find(item => item.id === 'Structured')?.engine || '') && /StructuredNavigationDescriptorOwner/.test(runtime.familyEngines.find(item => item.id === 'Structured')?.engine || '') && runtime.familyEngines.find(item => item.id === 'Structured')?.proofConsumers?.includes('structured-note-content') && runtime.familyEngines.find(item => item.id === 'Structured')?.noteContentCompatibility === 'FINAL_STRUCTURED_NOTE_CONTENT_ADAPTER_PROVEN_SAME_ENGINE', 'Wave5 Structured host/navigation ownership remains accepted and Wave6 final note content consumes the same accepted Structured engine');
check('wave4.registry_owner_consistency', componentCsv.includes('SettingsCenter,SC-009,dist/foundation/global/settings/center.js') && componentCsv.includes('InputDirectionResolver,SC-013,dist/foundation/global/input-direction.js') && componentCsv.includes('StructuredInputKeymap,SC-020,dist/foundation/structured/input-keymap.js') && componentCsv.includes('StructuredRichContent,SC-030,dist/foundation/structured/rich-content.js') && componentCsv.includes('StructuredDragDrop,SC-030,dist/foundation/structured/drag-drop.js') && stateOwnerCsv.includes('settings center disclosure/search presentation,SettingsCenterOwner') && stateOwnerCsv.includes('operational session presentation attachment,OperationalSessionOwner') && stateOwnerCsv.includes('epistemic state descriptor vocabulary,EpistemicStateContract'), 'Wave4 CSV registries name executable owners while preserving bounded maturity/truth boundaries');

const [structuredSurfaceHostSource, structuredNavigationSource, noteContentCompatibilitySource, reconcileGeneratorSource] = await Promise.all([
  text('dist/foundation/structured/surface-host.js'), text('dist/foundation/structured/outline-descriptor.js'), text('dist/adapters/structured-note-content-compatibility.js'), text('tools/reconcile-current-owner-registries.py')
]);
check('wave5.owners_physical', /class\s+StructuredSurfaceHost/.test(structuredSurfaceHostSource) && /class\s+StructuredNavigationDescriptorOwner/.test(structuredNavigationSource), 'Wave5 Structured host and navigation descriptor owner are physically executable');
check('wave5.note_content_boundary', /createStructuredNoteContentCompatibilityAdapter/.test(noteContentCompatibilitySource) && /StructuredNoteContentCompatibilityFixture/.test(noteContentCompatibilitySource) && /stickyNoteWindowOwnerImplemented:false/.test(noteContentCompatibilitySource) && /finalNoteBindingAdapterImplemented:false/.test(noteContentCompatibilitySource) && /secondEditorEngineImplemented:false/.test(noteContentCompatibilitySource) && !/class\s+StickyNoteWindowOwner|class\s+NoteBindingAdapter|new\s+StickyNoteWindowOwner|new\s+NoteBindingAdapter/.test(noteContentCompatibilitySource), 'Note-content compatibility is content-only and does not implement Wave6 window/binding ownership');
check('wave5.registry_owner_consistency', componentCsv.includes('StructuredSurfaceHost,SC-030,dist/foundation/structured/surface-host.js') && componentCsv.includes('StructuredNavigationDescriptorOwner,SC-030,dist/foundation/structured/read-inspection.js') && stateOwnerCsv.includes('structured surface presentation orchestration,StructuredSurfaceHost') && stateOwnerCsv.includes('structured read-navigation descriptor truth,StructuredNavigationDescriptorOwner'), 'Wave5 registries name final Structured presentation/descriptor owners without moving canonical truth');
check('wave5.generator_final_reconciliation', /W5_BASELINE='CEP-FR-E15-W5-STRUCTURED-FAMILY-COMPLETION'/.test(reconcileGeneratorSource) && /eng\['wave5HostPending'\]=False/.test(reconcileGeneratorSource) && /runtime\['wave5Status'\]='CONTROLLER_ACCEPTED_AND_CLOSED'/.test(reconcileGeneratorSource), 'active reconciliation generator ends in Wave5 accepted truth');
check('wave5.generator_delegation', /reconcile-current-owner-registries\.py/.test(writerGeneratorSource) && /subprocess\.run/.test(writerGeneratorSource) && /reconcile-current-owner-registries\.py/.test(compilerSource) && /subprocess\.run/.test(compilerSource), 'both registry-generating entry points delegate their final current-owner truth to the Wave5 reconciliation generator');


const controllerIdentity = await read('authority/controller/CONTROLLER_INPUT_IDENTITY.json');
const originalControllerIdentity = await read('authority/controller/CONTROLLER_PACKAGE_ORIGINAL_INPUT_IDENTITY.json');
const semanticCorrectionReceipt = await read('assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json');
let controllerCopiesMatch = controllerIdentity.package.bytes === 122721 && controllerIdentity.package.sha256 === '0bbb013cc767d9d7047a5a5f24fe67865f0ee4e75f9522978e6bd2ceafee406b' && Object.keys(originalControllerIdentity.copiedInputs).length === 9;
for (const [name, expected] of Object.entries(originalControllerIdentity.copiedInputs)) {
  if (name === '07_W03_69_REQUIREMENT_REUSE_MAP.csv') {
    const bytes = await readFile(new URL(`authority/controller/${name}`, root)), actualSha = createHash('sha256').update(bytes).digest('hex'), guard = semanticCorrectionReceipt.controllerCompilationIdentity;
    controllerCopiesMatch &&= guard?.preCorrectionMap?.bytes === expected.bytes && guard?.preCorrectionMap?.sha256 === expected.sha256 && guard?.correctedCompilation?.bytes === bytes.length && guard?.correctedCompilation?.sha256 === actualSha && semanticCorrectionReceipt.noReatomization === true;
  } else {
    const bytes = await readFile(new URL(`authority/controller/${name}`, root)), actualSha = createHash('sha256').update(bytes).digest('hex');
    controllerCopiesMatch &&= bytes.length === expected.bytes && actualSha === expected.sha256;
  }
}
check('controller.identity_and_copies', controllerCopiesMatch && controllerIdentity.mode === 'READ_ONLY_GUIDANCE_EVIDENCE', {package:controllerIdentity.package,intentionalWorkingCompilationCorrection:'07_W03_69_REQUIREMENT_REUSE_MAP.csv',originalPackageIdentityPreserved:true});
check('runtime.component_owners', unique(runtime.components) && runtime.components.every(item => item.stateOwner && item.implementation.length && item.duplicatePolicy), 'runtime component owners are unique and complete');
check('runtime.capability_owners', unique(runtime.capabilities) && runtime.capabilities.every(item => item.owner && item.resolver), 'capability owners are unique');
check('runtime.action_surface_owners', unique(runtime.actionSurfaces) && runtime.actionSurfaces.every(item => item.owner && item.routes.length && item.exitRoutes.length >= 2), 'action surfaces have owner, routes and exits');
check('runtime.action_commands', runtime.actionSurfaces.flatMap(item => Array.isArray(item.commands) ? item.commands : []).every(id => commands.some(command => command.id === id)), 'every declared action command is registered');

const versions = await read('contracts/FOUNDATION_CONTRACT_VERSIONS.json');
check('contracts.versioned', unique(versions.contracts) && versions.contracts.every(item => /^\d+\.\d+\.\d+$/.test(item.version) && item.breakingRule && item.consumers.length), versions.contracts.map(item => `${item.id}@${item.version}`));
check('contracts.breaking_gate', ['affectedConsumers', 'migrationPlan', 'disposition', 'conformanceProof'].every(item => versions.breakingChangeGate.required.includes(item)), versions.breakingChangeGate.status);
check('contracts.version_fixtures', versions.fixtures?.compatible?.result === 'PASS' && versions.fixtures?.breaking?.result === 'REQUIRES_MIGRATION' && versions.fixtures.breaking.required.every(item => versions.breakingChangeGate.required.includes(item)), versions.fixtures);
const mechanics = await read('contracts/MECHANIC_OWNERSHIP_REGISTRY.json');
check('mechanics.registry', new Set(mechanics.records.map(item => item.mechanicId)).size === mechanics.records.length && mechanics.records.every(item => item.familyOwner && item.canonicalStateOwner && item.implementation.length), mechanics.records.length);
const duplicate = await read('assurance/DUPLICATE_MECHANIC_SCAN.json');
check('mechanics.duplicate_scan', duplicate.status === 'PASS' && duplicate.findings.length === 0 && duplicate.fixtureTests?.length === 5 && duplicate.fixtureTests.every(item => item.status === 'PASS') && duplicate.fixtureTests.some(item => item.mechanicId === 'structured.mutation') && duplicate.ownershipGuards?.length === 3 && duplicate.ownershipGuards.every(item => item.status === 'PASS') && duplicate.ownershipFixture?.status === 'PASS' && Array.isArray(duplicate.deferredExceptions) && duplicate.deferredExceptions.length === 0, duplicate.status);

const deviations = await read('contracts/DEVIATION_REGISTER.json');
check('deviations.explained', deviations.records.every(item => item.id && item.source && item.reason && item.proof && item.status), 'no unexplained Foundation deviation');
const deferred = await read('assurance/HIGH_VALUE_DEFERRED_LEDGER.json'), excluded = await read('assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json'), deferredGovernance = await read('contracts/DEFERRED_WORK_GOVERNANCE.json');
const activeClasses = new Set(deferredGovernance.activeClasses), excludedClasses = new Set(deferredGovernance.excludedClasses), fixture = deferredGovernance.fixture;
const fixtureActive = fixture.input.filter(item => activeClasses.has(item.classification)).map(item => item.id), fixtureExcluded = fixture.input.filter(item => excludedClasses.has(item.classification)).map(item => item.id);
check('deferred.value_filter', deferred.policy === 'VALUE_FILTERED_DEFERRED_WORK' && deferred.items.length === 10 && deferred.items.every(item => activeClasses.has(item.classification) && item.activeFutureObligation === true) && JSON.stringify(fixtureActive) === JSON.stringify(fixture.expectedActiveIds) && JSON.stringify(fixtureExcluded) === JSON.stringify(fixture.expectedExcludedIds), deferred.summary);
check('deferred.exclusion_traceability', excluded.items.length === 15 && excluded.items.every(item => excludedClasses.has(item.classification) && item.activeFutureObligation === false) && excluded.summary.activeFutureObligations === 0, excluded.summary);
const staleDeferredToken = 'DEFERRED_WORK_' + 'ZERO_LOSS', staleDeferredPaths = [];
const staleDeferredScanPaths = ['FINAL_HANDOFF_AR.md','README_START_HERE_AR.md','checkpoints/CURRENT_HIGH_LEVERAGE.json','tools/build-correction-registers.py','tools/finalize-candidate.py','assurance/HIGH_VALUE_DEFERRED_LEDGER.json','assurance/DEFERRED_WORK_LEDGER.json','tools/generate-writer-scaffold.mjs'];
for (const path of staleDeferredScanPaths) {
  try {
    if ((await text(path)).includes(staleDeferredToken)) staleDeferredPaths.push(path);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    // Historical/root lineage artifacts may be intentionally absent from the
    // current working baseline after content-forensic cleanup. Absence cannot
    // carry the stale active token this gate is designed to reject.
  }
}
check('deferred.stale_active_status_absent', staleDeferredPaths.length === 0, staleDeferredPaths);

const correctAuthority = 'W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY';
const intake = await read('authority/W03_V34_TARGETED_INTAKE.json');
check('w03.identity', intake.sha256 === '23b66696a9cc72cb343c74e70f380ccb248e1fbc378d8ce7839ba74111a3d716' && intake.sources.length === 5 && intake.sources.every(source => source.classification === correctAuthority), 'exact v3.4 evidence donor identity, five sources and corrected authority');
for (const source of intake.sources) {
  const bytes = await readFile(new URL(source.reference, root));
  check('w03.reference.' + source.surface, createHash('sha256').update(bytes).digest('hex') === source.sha256, source.reference);
}
const disposition = await read('authority/W03_69_318_REQUIREMENT_REUSE_DISPOSITION.json'), allowedW03 = new Set(['RECONCILED_CURRENT', 'PARTIALLY_RECONCILED', 'DEFERRED_TO_NAMED_FUTURE_OWNER']);
check('w03.dispositions_69_318', disposition.sections.length === 69 && disposition.atoms.length === 318 && new Set(disposition.sections.map(row => row.sectionId)).size === 69 && new Set(disposition.atoms.map(row => row.sourceAtomId)).size === 318 && disposition.sections.every(row => allowedW03.has(row.disposition) && row.exactPointer && row.atomCount > 0 && (row.disposition === 'RECONCILED_CURRENT' || row.futureOwnerPointers.length > 0)) && disposition.atoms.every(row => row.owner && row.disposition && row.sourcePointer), disposition.sectionSummary);
check('w03.no_atom_task_expansion', new Set(disposition.atoms.flatMap(row => row.historicalAdmittedTaskIds)).size <= 7 && disposition.atoms.every(row => row.historicalAdmittedTaskIds.length <= 2), '318 atoms remain grouped under admitted task owners');
check('w03.truth_ceiling', disposition.truthCeiling.includes('SEMANTIC_ADJUDICATION_PARTIAL'), disposition.truthCeiling);
const admissionPolicy = await read('authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json');
check('w03.work_admission_provenance_only', admissionPolicy.notCurrentBacklog === true && admissionPolicy.workAdmissionSemantics === 'HISTORICAL_PRE_V0_2_1_CONTROLLER_ADMISSION_PROVENANCE_ONLY' && disposition.workAdmissionSemantics === admissionPolicy.workAdmissionSemantics && disposition.currentActiveDeferredTruth === 'assurance/HIGH_VALUE_DEFERRED_LEDGER.json', admissionPolicy.workAdmissionSemantics);
check('w03.generated_historical_fields', disposition.atoms.every(row => 'historicalWorkAdmission' in row && 'historicalAdmittedTaskIds' in row && !('workAdmission' in row) && !('admittedTaskIds' in row)), 'raw admissions remain provenance only');
const oldAuthority = 'SOLE_SAME_LINEAGE_' + 'IMPLEMENTATION_VALUE_BASELINE_NOT_ACCEPTED', activeOld = [];
for (const path of await walk(root)) {
  if (path === 'assurance/AUTHORITY_BEFORE_AFTER_REGISTER.json' || path.includes('/__pycache__/') || /\.(png|jpg|jpeg|zip|pyc)$/i.test(path)) continue;
  try { if ((await text(path)).includes(oldAuthority)) activeOld.push(path); } catch {}
}
check('w03.old_authority_zero_active', activeOld.length === 0, activeOld);
const semanticAuthorityAliases=[];
const aliasPattern=/W03[^\n]{0,100}(?:is|as|=)\s+(?:the\s+)?(?:implementation|design|UI|layout|interaction|visual|component|stack)\s+(?:authority|baseline)/ig;
for (const path of ['FOUNDATION_ARCHITECTURE.md','FINAL_HANDOFF_AR.md','README_START_HERE_AR.md','tools/build-writer-contracts.py','tools/finalize-candidate.py']) { const value=await text(path); if(aliasPattern.test(value))semanticAuthorityAliases.push(path); aliasPattern.lastIndex=0; }
check('w03.semantic_authority_alias_zero', semanticAuthorityAliases.length === 0, semanticAuthorityAliases);

const writer = await read('writer/WRITER_INTAKE_TEMPLATE.json'), writerKeys = ['foundationBaseline', 'targetSurface', 'surfaceProfile', 'inheritedGlobalComponents', 'familyEngines', 'domainAdapter', 'allowedDeviations', 'ownerDeltas', 'requiredProof'];
check('writer.intake', writerKeys.every(key => key in writer) && writer.foundationBaseline === runtime.baselineId && writer.requiredProof.every(item => ['before', 'action', 'owner', 'after', 'visible', 'negative'].every(key => key in item)), 'lintable Writer intake matches current Foundation baseline');
const scaffold = await read('assurance/WRITER_SCAFFOLD_TEST_RESULTS.json');
check('writer.scaffold', scaffold.fail === 0 && scaffold.pass >= 38, `${scaffold.pass}/${scaffold.fail}`);
const resumedTasks = await read('assurance/WORK_RESUME_TASK_CLASSIFICATION.json');
check('resume.exact_ten_completed', resumedTasks.controllerTaskCount === 10 && resumedTasks.tasks.length === 10 && resumedTasks.candidateStatus === 'ALL_10_COMPLETED_FOR_BOUNDED_CANDIDATE' && resumedTasks.tasks.every(item => item.candidateTaskStatus === 'COMPLETED_FOR_BOUNDED_CANDIDATE'), resumedTasks.candidateStatus);

check('relations.central_reuse', relationInteractionSource.includes("this.policyRevision='RELATION-CENTRAL-04'") && /new ActionAvailabilityCore\(\)/.test(relationInteractionSource) && /RelationInteractionOwner/.test(relationInteractionSource) && ['visualize','enterprise'].every(id => runtime.familyEngines.find(item => item.id === 'SpatialRelation')?.proofConsumers.includes(id)), 'one extracted RelationInteractionOwner policy serves Visualize and Enterprise');
check('relations.availability_inputs', ['selectionCount','selectedTypes','commandRegistered','domainCapability','canonicalState','destructivePolicy'].every(token => modelsSource.includes(token)||relationSource.includes(token)), 'central resolver covers selection, domain, command, canonical and destructive inputs');
check('relations.route_scope', /dblclick[\s\S]*data-relation-label/.test(spatialSource) && !/dblclick[\s\S]{0,180}e\.target\.closest\('\[data-edge\]'\)/.test(spatialSource), 'relation double-click is label-scoped');
check('spatial.context_lifecycle', /class\s+ContextSuppressionGate/.test(spatialSource) && /pointercancel[\s\S]*contextGate\.cancel/.test(spatialSource) && /visibilitychange[\s\S]*contextGate\.cancel/.test(spatialSource), 'context suppression clears on cancel and abnormal lifecycle');
check('spatial.keyboard_semantics', ['Shift+Arrow', 'Alt+Arrow', 'Control+Arrow', 'Shift+F10', 'F2', 'Escape'].every(token => spatialSource.includes(token)), 'distinct focus/selection/camera/move/context/edit/reverse semantics');
check('ownership.single_relation_commands', (mainSource.match(/spatial\.relation\.commit/g) || []).length === 1 && (relationInteractionSource.match(/registry\.register\(commitCommandId/g) || []).length === 1 && (relationSource.match(/\.register\(/g) || []).length === 0, 'one relation commit registration in RelationInteractionOwner; main only declares action route and relations facade registers none');
check('ownership.single_open_terminal', (mainSource.match(/reg\('OPEN_TERMINAL'/g) || []).length === 1, 'one OPEN_TERMINAL semantic owner');

const browserReceipt = await read('assurance/BROWSER_CONFORMANCE_RECEIPT.json'), browserFlowIds = ['workspace.transient-and-pane-lifecycle', 'spatial.selection-connect-canonical-edge', 'relation.route-convergence-and-label-scope', 'central-change-reuse', 'runtime-causal-consequence', 'spatial-input-bidi-preference-and-structured-isolation'];
check('browser.suite_definition', browserFlowIds.every(id => browserSource.includes(`id: '${id}'`)) && (browserSource.match(/await flow\(browser,/g) || []).length === 6, 'six deterministic critical browser flows are rerunnable');
check('browser.portable_resolution', !browserSource.includes('/opt/codex/') && browserSource.includes("require('playwright')") && browserSource.includes('CEP_PLAYWRIGHT_MODULE_PATH'), 'package-local Playwright first; explicit environment override only');
const currentCanonicalSourceIdentity = await canonicalSourceIdentity(root);
const browserLineageExact = browserReceipt.sourceFoundationBaseline === runtime.baselineId && browserReceipt.sourceCanonicalTreeSha256 === currentCanonicalSourceIdentity.sha256 && browserReceipt.sourceCandidate === `CANONICAL_SOURCE_TREE_SHA256:${currentCanonicalSourceIdentity.sha256}` && Number(browserReceipt.canonicalSourceFileCount) === Number(currentCanonicalSourceIdentity.files);
const browserExecutedPass = browserReceipt.currentUse === 'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT' && browserReceipt.executionStatus === 'EXECUTED_PASS' && browserReceipt.summary?.total === browserReceipt.flows?.length && browserReceipt.summary?.total === 6 && browserReceipt.summary?.pass === 6 && browserReceipt.summary?.fail === 0;
const browserEnvironmentBlocked = browserReceipt.currentUse === 'EXACT_CURRENT_CANONICAL_SOURCE_ENVIRONMENT_BLOCK_RECEIPT' && browserReceipt.executionStatus === 'OPEN_ENVIRONMENT__LOOPBACK_BLOCKED_BEFORE_PRODUCT_RECEIPT' && browserReceipt.summary?.total === 6 && browserReceipt.summary?.pass === 0 && browserReceipt.summary?.fail === 0 && browserReceipt.summary?.blocked === 6 && browserReceipt.environment?.error === 'net::ERR_BLOCKED_BY_ADMINISTRATOR' && browserReceipt.declaredFlows?.length === 6 && browserReceipt.flows?.every(flow => flow.status === 'OPEN_ENVIRONMENT');
check('browser.lineage_receipt_truthful', browserLineageExact && (browserExecutedPass || browserEnvironmentBlocked), { sourceFoundationBaseline: browserReceipt.sourceFoundationBaseline, sourceCanonicalTreeSha256: browserReceipt.sourceCanonicalTreeSha256, currentCanonicalTreeSha256: currentCanonicalSourceIdentity.sha256, executionStatus: browserReceipt.executionStatus, summary: browserReceipt.summary, error:browserReceipt.environment?.error||null });
check('browser.current_candidate_claim_truthful', browserLineageExact && ['EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT','EXACT_CURRENT_CANONICAL_SOURCE_ENVIRONMENT_BLOCK_RECEIPT'].includes(browserReceipt.currentUse), { currentUse: browserReceipt.currentUse, sourceCandidate: browserReceipt.sourceCandidate, canonicalSourceFileCount: browserReceipt.canonicalSourceFileCount });
const screenshotManifest = await read('assurance/SCREENSHOT_MANIFEST.json');
let screenshotsMatch = screenshotManifest.count === screenshotManifest.screenshots.length;
for (const shot of screenshotManifest.screenshots) { const screenshotPath = screenshotManifest.basePath ? `${screenshotManifest.basePath}/${shot.filename}` : `assurance/${shot.filename}`; const bytes = await readFile(new URL(screenshotPath, root)); screenshotsMatch &&= bytes.length === shot.bytes && createHash('sha256').update(bytes).digest('hex') === shot.sha256; }
const presentationEvidence = screenshotManifest.classification === 'VISUAL_PRESENTATION_EVIDENCE__IN_MEMORY_RENDERER__NOT_GENUINE_ROUTE' && screenshotManifest.count >= 46;
const legacyRouteEvidence = !browserEnvironmentBlocked && screenshotManifest.count === 3 && screenshotManifest.count <= 4 && screenshotManifest.screenshots.every(shot => browserReceipt.screenshots?.some(item => item.filename === shot.filename && item.sha256 === shot.sha256));
check('browser.targeted_visual_evidence', screenshotsMatch && (presentationEvidence || legacyRouteEvidence), `${screenshotManifest.count} hash-bound screenshots; class=${screenshotManifest.classification||'legacy'}`);
const model = await read('assurance/MODEL_TEST_RESULTS.json');
check('model.required_regressions', model.fail === 0 && ['structured.independent', 'structured.compatibility-mutation-owner', 'structured.update-block-structural-guard', 'structured.selection-clipboard', 'structured.clipboard-readonly-schema', 'structured.semantic-command-route', 'structured.library-clipboard-consumer', 'runtime.w03-v34-causal', 'actions.availability-matrix', 'actions.generic-policy', 'actions.preflight-presentation-convergence', 'actions.declared-domain-capability-required', 'relation.canonical-constraints', 'workspace.panes-preferred-effective', 'workspace.transient-focus', 'workspace.context-descriptors', 'gesture.context-suppression', 'spatial.keyboard-contract'].every(id => model.tests.some(item => item.id === id && item.status === 'PASS')), `${model.pass}/${model.fail}`);

const authorityReceipt = await read('assurance/CURRENT_AUTHORITY_ISOLATION_RECEIPT.json');
check('authority.intake_guard', authorityReceipt.fail === 0 && authorityReceipt.pass >= 5, authorityReceipt);
check('w03.semantic_review_318', disposition.semanticReview?.rowsReviewed === 318 && disposition.semanticReview?.rowsChanged > 0 && disposition.sourceAtoms === 318 && disposition.sourceSections === 69, disposition.semanticReview);
const result = { date: new Date().toISOString(), pass: tests.filter(item => item.status === 'PASS').length, fail: tests.filter(item => item.status === 'FAIL').length, tests, limits: 'Bounded structural/model/browser receipt validation; no Owner acceptance or final-product completeness claim.' };
await writeFile(new URL('assurance/CONTRACT_TEST_RESULTS.json', root), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.fail) process.exitCode = 1;
