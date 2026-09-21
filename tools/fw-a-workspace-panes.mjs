import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { ScopedPreferences } from '../dist/foundation/models.js';
import {
  WorkspaceHostKernel,
  WORKSPACE_HOST_CONTRACT
} from '../dist/foundation/global/workspace-host-kernel.js';
import {
  WorkspacePaneLayoutOwner,
  WORKSPACE_PANE_LAYOUT_OWNER,
  WORKSPACE_PANE_STATE_CONTRACT,
  WORKSPACE_PANE_WIDTH_LIMITS
} from '../dist/foundation/global/pane-layout.js';
import {
  WORKSPACE_REGION_CONTRACT,
  createWorkspaceFamilyBinding,
  assertWorkspaceFamilyBinding
} from '../dist/foundation/global/region-contract.js';
import {
  NARROW_WORKSPACE_BREAKPOINT,
  RIGHT_PANE_RESPONSIVE_BREAKPOINT,
  resolveWorkspaceResponsiveBand
} from '../dist/foundation/global/responsive-layout.js';
import { createStructuredConsumerAdapter } from '../dist/adapters/structured-documents.js';
import { createStructuredWorkspaceBinding } from '../dist/foundation/workspace-host.js';

const root = path.resolve(new URL('../', import.meta.url).pathname);
const assert = (condition, message) => { if (!condition) throw Error(message); };
const cases = [];
const check = (id, run) => {
  try { const evidence = run(); cases.push({ id, status: 'PASS', evidence }); }
  catch (error) { cases.push({ id, status: 'FAIL', error: String(error.message || error) }); }
};

const preferences = new ScopedPreferences(null, { workspace: 'W02', surface: 'proof', view: 'main', component: 'workspace' });
const panes = new WorkspacePaneLayoutOwner(preferences, { viewportWidth: 1440 });

check('pane.bands-preferred-effective', () => {
  const wide = panes.snapshot(1440), medium = panes.snapshot(900), narrow = panes.snapshot(720);
  assert(resolveWorkspaceResponsiveBand(1440) === 'wide', '1440 must be wide');
  assert(resolveWorkspaceResponsiveBand(900) === 'medium', '900 must be medium');
  assert(resolveWorkspaceResponsiveBand(720) === 'narrow', '720 must be narrow');
  assert(wide.left.effectiveState === 'open' && wide.right.effectiveState === 'open', 'wide panes must project open');
  assert(medium.left.effectiveState === 'open' && medium.right.effectiveState === 'collapsed', 'medium must preserve left and collapse right');
  assert(narrow.left.effectiveState === 'collapsed' && narrow.right.effectiveState === 'collapsed', 'narrow must collapse support panes');
  assert(medium.right.preferredState === 'open' && narrow.left.preferredState === 'open', 'responsive projection mutated preferred state');
  return { breakpoints: { narrow: NARROW_WORKSPACE_BREAKPOINT, right: RIGHT_PANE_RESPONSIVE_BREAKPOINT }, wide, medium, narrow };
});

check('pane.responsive-reopen-without-preference-mutation', () => {
  const before = panes.snapshot(720);
  panes.toggle('left', 720);
  const revealed = panes.snapshot(720);
  panes.toggle('left', 720);
  const closed = panes.snapshot(720);
  assert(before.left.preferredState === 'open', 'unexpected preferred baseline');
  assert(revealed.left.mode === 'overlay' && revealed.left.effectiveState === 'open', 'narrow pane did not reopen as overlay');
  assert(revealed.left.preferredState === 'open' && closed.left.preferredState === 'open', 'responsive reopen overwrote preferred state');
  return { before: before.left, revealed: revealed.left, closed: closed.left };
});

check('pane.focus-roundtrip', () => {
  const before = panes.snapshot(1440);
  panes.setFocusMode(true);
  const focused = panes.snapshot(1440);
  panes.setFocusMode(false);
  const restored = panes.snapshot(1440);
  assert(focused.left.effectiveState === 'collapsed' && focused.right.effectiveState === 'collapsed', 'focus mode did not collapse panes');
  assert(focused.left.preferredState === before.left.preferredState && focused.right.preferredState === before.right.preferredState, 'focus mode changed preferred state');
  assert(restored.left.effectiveState === before.left.effectiveState && restored.right.effectiveState === before.right.effectiveState, 'focus mode did not round-trip presentation');
  return { before, focused, restored };
});

check('pane.width-clamp-and-resize-availability', () => {
  panes.setPreferredWidth('left', 999);
  panes.setPreferredWidth('right', 1);
  const clamped = panes.snapshot(1440);
  assert(clamped.left.preferredWidth === WORKSPACE_PANE_WIDTH_LIMITS.left.max, 'left width did not clamp max');
  assert(clamped.right.preferredWidth === WORKSPACE_PANE_WIDTH_LIMITS.right.min, 'right width did not clamp min');
  assert(clamped.left.resizeAvailability.pointer && clamped.left.resizeAvailability.keyboard, 'wide open pane must expose pointer and keyboard resize');
  const medium = panes.snapshot(900);
  assert(!medium.right.resizeAvailability.pointer && !medium.right.resizeAvailability.keyboard, 'collapsed medium right pane must not expose resize');
  panes.setPreferredWidth('left', 304);
  panes.setPreferredWidth('right', 420);
  return { clamped, mediumRight: medium.right, limits: WORKSPACE_PANE_WIDTH_LIMITS };
});

check('pane.persistence-excludes-content-and-effective-projection', () => {
  const exported = preferences.export();
  const text = JSON.stringify(exported);
  assert(!text.includes('effectiveState') && !text.includes('responsiveBand') && !text.includes('paneContentMarker'), 'projected/content state leaked into persistence');
  return { contract: WORKSPACE_PANE_STATE_CONTRACT, persisted: exported };
});

check('pane.invalid-side-state-rejected-without-mutation', () => {
  const before = JSON.stringify(preferences.export());
  const failures = [];
  for (const [label, run, expected] of [
    ['invalid-set-side', () => panes.setPreferredState('bogus', 'collapsed'), 'INVALID_PANE_STATE'],
    ['invalid-set-state', () => panes.setPreferredState('left', 'bogus'), 'INVALID_PANE_STATE'],
    ['invalid-read-side', () => panes.preferredState('bogus'), 'INVALID_PANE_SIDE'],
    ['invalid-width-side', () => panes.setPreferredWidth('bogus', 300), 'INVALID_PANE_SIDE']
  ]) {
    let code = null;
    try { run(); } catch (error) { code = error.message; }
    assert(code === expected, `${label}: expected ${expected}, got ${code}`);
    failures.push({ label, code });
  }
  const after = JSON.stringify(preferences.export());
  assert(after === before, 'invalid pane input mutated preferences');
  return { failures, preferenceStateUnchanged: true };
});

check('host.canonical-pane-owner-truth', () => {
  assert(WORKSPACE_PANE_LAYOUT_OWNER === 'WorkspacePaneLayoutOwner', 'canonical pane owner constant drifted');
  assert(WORKSPACE_HOST_CONTRACT.stateOwners.panes === WORKSPACE_PANE_LAYOUT_OWNER, 'host contract reports non-canonical pane owner');
  assert(WORKSPACE_PANE_STATE_CONTRACT.owner === WORKSPACE_PANE_LAYOUT_OWNER, 'pane state contract reports non-canonical pane owner');
  return { canonicalOwner: WORKSPACE_PANE_LAYOUT_OWNER, hostOwner: WORKSPACE_HOST_CONTRACT.stateOwners.panes, paneContractOwner: WORKSPACE_PANE_STATE_CONTRACT.owner };
});

check('host.explicit-binding-required', () => {
  let code = null;
  try { assertWorkspaceFamilyBinding(null); } catch (error) { code = error.message; }
  assert(code === 'WORKSPACE_FAMILY_BINDING_REQUIRED', `unexpected missing-binding failure: ${code}`);
  return { failure: code };
});

check('host.three-real-family-bindings', () => {
  const learnAdapter = createStructuredConsumerAdapter('learn', null);
  const bindings = [
    ['learn', createStructuredWorkspaceBinding(learnAdapter, { id: 'learn-structured-workspace' }), true],
    ['visualize', createWorkspaceFamilyBinding({ id: 'visualize-spatial-workspace', family: 'spatial', domainKind: 'visualize' }), false],
    ['runs', createWorkspaceFamilyBinding({ id: 'runs-operational-workspace', family: 'operational', domainKind: 'runs' }), false]
  ];
  const evidence = [];
  for (const [consumer, binding, expectsEditor] of bindings) {
    const prefs = new ScopedPreferences(null, { workspace: consumer === 'runs' ? 'W03' : 'W02', surface: consumer, view: 'main', component: 'workspace' });
    const kernel = new WorkspaceHostKernel({ commands: null, preferences: prefs, binding, viewportWidth: 1440 });
    assert(Boolean(kernel.state.editor) === expectsEditor, `${consumer} family state ownership mismatch`);
    assert(kernel.state.library === undefined, `${consumer} leaked Library state`);
    evidence.push({ consumer, binding: binding.descriptor({ state: kernel.state }), hasEditor: Boolean(kernel.state.editor), hasLibraryState: kernel.state.library !== undefined });
  }
  assert(WORKSPACE_HOST_CONTRACT.familyNeutral === true, 'host contract is not family-neutral');
  assert(WORKSPACE_REGION_CONTRACT.slots.join('|') === 'TOP|TOOLBAR|LEFT|CENTER|RIGHT|BOTTOM|TRANSIENT', 'region contract is incomplete');
  return { hostContract: WORKSPACE_HOST_CONTRACT, regionContract: WORKSPACE_REGION_CONTRACT, consumers: evidence };
});

check('negative.non-structured-bootstrap-static-scan', () => {
  const main = requireText('stack/native-typescript/main.ts');
  const host = requireText('stack/native-typescript/foundation/workspace-host.ts');
  const kernel = requireText('stack/native-typescript/foundation/global/workspace-host-kernel.ts');
  assert(main.includes("structured=structuredConsumer?createStructuredConsumerAdapter(consumer,libraryBundle):null"), 'Structured adapter is not guarded by structuredConsumer');
  assert(main.includes("consumer==='visualize'") && main.includes("family:'spatial'") && main.includes("consumer==='runs'") && main.includes("family:'operational'"), 'real non-Structured family bindings are missing');
  assert(main.includes('mountWorkspaceHost({commands:registry,preferences,binding:familyBinding,extension})'), 'bootstrap is not binding-driven');
  assert(!host.includes('mountWorkspaceHost({commands,preferences,structured'), 'host still requires universal Structured input');
  assert(!kernel.includes('structured.snapshot('), 'family-neutral kernel calls Structured snapshot');
  return { guardedStructuredConstruction: true, bindingDrivenMount: true, kernelStructuredSnapshotCalls: 0 };
});

function requireText(relative) {
  return globalThis.__FW_A_SOURCE?.[relative];
}

const sourcePaths = [
  'stack/native-typescript/main.ts',
  'stack/native-typescript/foundation/workspace-host.ts',
  'stack/native-typescript/foundation/global/workspace-host-kernel.ts'
];
globalThis.__FW_A_SOURCE = Object.fromEntries(await Promise.all(sourcePaths.map(async relative => [relative, await readFile(path.join(root, relative), 'utf8')])));
// Re-run the static scan now that source text is loaded.
const staticIndex = cases.findIndex(item => item.id === 'negative.non-structured-bootstrap-static-scan');
if (staticIndex >= 0 && cases[staticIndex].status === 'FAIL') {
  cases.splice(staticIndex, 1);
  check('negative.non-structured-bootstrap-static-scan', () => {
    const main = globalThis.__FW_A_SOURCE['stack/native-typescript/main.ts'];
    const host = globalThis.__FW_A_SOURCE['stack/native-typescript/foundation/workspace-host.ts'];
    const kernel = globalThis.__FW_A_SOURCE['stack/native-typescript/foundation/global/workspace-host-kernel.ts'];
    assert(main.includes("structured=structuredConsumer?createStructuredConsumerAdapter(consumer,libraryBundle):null"), 'Structured adapter is not guarded by structuredConsumer');
    assert(main.includes("consumer==='visualize'") && main.includes("family:'spatial'") && main.includes("consumer==='runs'") && main.includes("family:'operational'"), 'real non-Structured family bindings are missing');
    assert(main.includes('mountWorkspaceHost({commands:registry,preferences,binding:familyBinding,extension})'), 'bootstrap is not binding-driven');
    assert(!host.includes('mountWorkspaceHost({commands,preferences,structured'), 'host still requires universal Structured input');
    assert(!kernel.includes('structured.snapshot('), 'family-neutral kernel calls Structured snapshot');
    return { guardedStructuredConstruction: true, bindingDrivenMount: true, kernelStructuredSnapshotCalls: 0 };
  });
}

const summary = { total: cases.length, pass: cases.filter(item => item.status === 'PASS').length, fail: cases.filter(item => item.status === 'FAIL').length };
const receipt = {
  schemaVersion: 1,
  mission: 'FW-A-FAMILY-NEUTRAL-WORKSPACE-PANES',
  classification: 'LANE_A_EXECUTABLE_MODEL_AND_NEGATIVE_PROOF_NOT_CONTROLLER_ACCEPTANCE',
  contracts: { host: WORKSPACE_HOST_CONTRACT, panes: WORKSPACE_PANE_STATE_CONTRACT, regions: WORKSPACE_REGION_CONTRACT },
  summary,
  cases
};
if (process.argv.includes('--write')) {
  const dir = path.join(root, 'assurance', 'FW_A_EXECUTABLE');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'FW_A_EXECUTABLE_PROOF.json'), JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify(receipt, null, 2));
if (summary.fail) process.exitCode = 1;
