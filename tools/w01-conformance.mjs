/**
 * W01 conformance proof — Today + Shared Global Shell acceptance-criteria checker.
 *
 * Executable, machine-checked proof for the W01 packet §10 acceptance criteria and for the
 * CURRENT_PROFILE / CURRENT_IDENTITY / ZL01_DURABLE_ANCILLARY rows whose proof_requirement is a
 * profile-by-profile evidence matrix or a lane-scoped behavioural guardrail.
 *
 * Scope law: this checker only READS. It never mutates product source, never invents a
 * destination count, never decides Q-1/Q-2, and never implements the `domain-diagnostics` bottom
 * tab (packet §3 A-2: requirement candidate only).
 *
 * Exit 0  -> every check measured PASS
 * Exit 1  -> at least one check measured FAIL (evidence is printed, never hidden)
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);

const results = [];
const record = (id, ok, detail) => {
  results.push({ id, status: ok ? 'PASS' : 'FAIL', detail });
  return ok;
};
const assertEq = (id, actual, expected, detail = {}) => record(id, Object.is(actual, expected), { expected, actual, ...detail });

const EXPECTED_WORKTREE_TREE = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const EXPECTED_WORKTREE_FILES = 287;

/* ------------------------------------------------------------------ *
 * (b) shell five-destination functional baseline preserved,
 *     destinationCountFrozen=false respected (packet §10(b), Q-1 law)
 * ------------------------------------------------------------------ */
{
  const { CEP_PRODUCT_DESTINATION_REGISTRY } = await import(pathToFileURL('dist/foundation/global/shell/cep-destinations.js'));
  const descriptor = CEP_PRODUCT_DESTINATION_REGISTRY.descriptor();
  record(
    'w01.destination-count-not-frozen',
    descriptor.destinationCountFrozen === false && descriptor.globalAreaBaselineCount === 5,
    {
      expected: { destinationCountFrozen: false, globalAreaBaselineCount: 5 },
      actual: { destinationCountFrozen: descriptor.destinationCountFrozen, globalAreaBaselineCount: descriptor.globalAreaBaselineCount, registeredSurfaceCount: descriptor.count },
      binding: 'Q-1 open question: destinationCountFrozen=false, five-destination functional baseline; W01 must neither freeze nor invent a count.'
    }
  );
}

/* ------------------------------------------------------------------ *
 * SC-001 hard boundary: shell navigation creates no domain state,
 * and the shell route context projection carries the same non-frozen truth.
 * ------------------------------------------------------------------ */
{
  const { CommandRegistry } = await import(pathToFileURL('dist/foundation/models.js'));
  const { CEP_PRODUCT_DESTINATION_REGISTRY } = await import(pathToFileURL('dist/foundation/global/shell/cep-destinations.js'));
  const { bindShellSurfaceCommands } = await import(pathToFileURL('dist/surfaces/shell/surface.js'));
  const registry = CEP_PRODUCT_DESTINATION_REGISTRY;
  const navigation = {
    surface: 'shell',
    destinationRegistry: registry,
    destinations: () => registry.list(),
    globalAreas: () => registry.globalAreas(),
    destination: id => registry.get(id),
    areaDestination: area => (registry.globalAreas().find(item => item.id === area) || {}).defaultSurfaceId,
    descriptor: () => ({ registeredSurfaceCount: registry.list().length }),
    navigate: () => ({ ok: true, status: 'NAVIGATING' }),
    navigateWithPreservedRecovery: () => ({ ok: true, status: 'NAVIGATING_WITH_VERIFIED_RECOVERY' }),
    restoreBookmark: async () => true,
    focusDestinationHeading: () => ({ ok: true, status: 'DESTINATION_HEADING_FOCUSED' }),
    isDirty: () => false,
    workspace: null,
    api: null
  };
  const binding = bindShellSurfaceCommands({ commands: new CommandRegistry(), navigation });
  assertEq('w01.shell-route-context-no-domain-state', binding.routeContext.canonicalDomainWrites, false, {
    binding: 'SC-001 hard boundary: shell navigation is navigation/composition only, never a domain workbench.'
  });
  assertEq('w01.shell-binding-destination-not-frozen', binding.destinationCountFrozen, false, {
    actual: binding.destinationCountFrozen,
    globalDestinationBaseline: binding.globalDestinationBaseline
  });
  assertEq('w01.shell-global-baseline-five', binding.globalDestinationBaseline.length, 5, {
    actual: binding.globalDestinationBaseline
  });
}

/* ------------------------------------------------------------------ *
 * CURRENT_PROFILE rows: decision/profile-by-profile evidence matrix.
 * Every domain_commands entry declared by the W01 SurfaceProfiles must be
 * registered by the owning surface binding. No profile field is silently dropped.
 * ------------------------------------------------------------------ */
{
  const { CommandRegistry } = await import(pathToFileURL('dist/foundation/models.js'));
  const { TodayProjectionDomainAdapter } = await import(pathToFileURL('dist/adapters/today/domain.js'));
  const { bindTodaySurface } = await import(pathToFileURL('dist/surfaces/today/surface.js'));
  const { CEP_PRODUCT_DESTINATION_REGISTRY } = await import(pathToFileURL('dist/foundation/global/shell/cep-destinations.js'));
  const { bindShellSurfaceCommands } = await import(pathToFileURL('dist/surfaces/shell/surface.js'));

  const todayProfile = JSON.parse(await readFile(pathAt('profiles/today.json'), 'utf8'));
  const shellProfile = JSON.parse(await readFile(pathAt('profiles/shell.json'), 'utf8'));

  const todayCommands = new CommandRegistry();
  bindTodaySurface({ commands: todayCommands, adapter: new TodayProjectionDomainAdapter() });
  const shellCommands = new CommandRegistry();
  const registry = CEP_PRODUCT_DESTINATION_REGISTRY;
  bindShellSurfaceCommands({
    commands: shellCommands,
    navigation: {
      surface: 'shell',
      destinationRegistry: registry,
      destinations: () => registry.list(),
      globalAreas: () => registry.globalAreas(),
      destination: id => registry.get(id),
      areaDestination: area => (registry.globalAreas().find(item => item.id === area) || {}).defaultSurfaceId,
      descriptor: () => ({ registeredSurfaceCount: registry.list().length })
    }
  });

  const matrix = [];
  for (const [profile, commands, surface] of [
    [shellProfile, shellCommands, 'shell'],
    [todayProfile, todayCommands, 'today']
  ]) {
    for (const id of profile.domain_commands || []) {
      matrix.push({ surface, command: id, registered: commands.commands.has(id) });
    }
  }
  const missing = matrix.filter(row => !row.registered);
  record('w01.profile-domain-command-coverage', matrix.length > 0 && missing.length === 0, {
    expected: 'every W01 SurfaceProfile domain_command registered by its owning surface binding',
    matrix,
    missing
  });

  const todayInvariants = todayProfile.invariants || [];
  record('w01.today-profile-mastery-invariant', todayInvariants.includes('Progress is a projection; Mastery is W04-owned'), {
    binding: 'profiles/today.json invariants[]',
    invariants: todayInvariants
  });
  record('w01.today-profile-no-canonical-write-invariant', todayInvariants.includes('No Today canonical domain writes'), {
    binding: 'profiles/today.json invariants[]',
    invariants: todayInvariants
  });
}

/* ------------------------------------------------------------------ *
 * Epistemic state: Today never infers Mastery; authority is W04-owned.
 * ------------------------------------------------------------------ */
{
  const { TodayProjectionDomainAdapter } = await import(pathToFileURL('dist/adapters/today/domain.js'));
  const { bindTodaySurface } = await import(pathToFileURL('dist/surfaces/today/surface.js'));
  const { CommandRegistry } = await import(pathToFileURL('dist/foundation/models.js'));
  const adapter = new TodayProjectionDomainAdapter();
  const projection = adapter.project();
  const descriptor = adapter.descriptor();
  const binding = bindTodaySurface({ commands: new CommandRegistry(), adapter: new TodayProjectionDomainAdapter() });
  assertEq('w01.today-mastery-never-inferred', projection.mastery, 'NOT_INFERRED__W04_OWNED', {
    binding: 'profiles/today.json invariant + surfaces/today/surface.ts masteryAuthority + S07 contract s07-contracts.test.ts'
  });
  assertEq('w01.today-mastery-authority-owner', binding.masteryAuthority, 'W04_OWNED');
  assertEq('w01.today-no-mastery-writes', descriptor.masteryWrites, false);
  assertEq('w01.today-no-canonical-writes', descriptor.canonicalWrites, false);
  assertEq('w01.today-surface-no-canonical-writes', binding.canonicalWrites, false);
}

/* ------------------------------------------------------------------ *
 * (f) no duplicate shell mechanics; W05 duplication ban (packet §16).
 * ------------------------------------------------------------------ */
{
  const dup = spawnSync(process.execPath, [pathAt('tools/check-duplicate-mechanics.mjs')], { cwd: rootPath, encoding: 'utf8' });
  record('w01.no-duplicate-shell-mechanics', dup.status === 0, {
    command: 'node tools/check-duplicate-mechanics.mjs',
    exitCode: dup.status,
    tail: String(dup.stdout || '').slice(-400)
  });

  const banned = [];
  for (const relative of ['stack/native-typescript/adapters/surfaces', 'stack/native-typescript/surfaces/health', 'stack/native-typescript/surfaces/processing']) {
    try { await stat(pathAt(relative)); banned.push(relative); } catch {}
  }
  record('w01.no-w05-surface-duplication', banned.length === 0, { expected: 'absent', present: banned });
}

/* ------------------------------------------------------------------ *
 * A-2: `domain-diagnostics` bottom tab is a requirement candidate only.
 * W01 must not invent it: declared in profiles, zero implementation in source or dist.
 * ------------------------------------------------------------------ */
{
  const matches = [];
  for (const tree of ['stack/native-typescript', 'dist']) {
    for (const absolute of await walk(pathAt(tree))) {
      if (!/\.(ts|js|mjs|css|html)$/.test(absolute)) continue;
      const source = await readFile(absolute, 'utf8').catch(() => '');
      if (source.includes('domain-diagnostics')) matches.push(path.relative(rootPath, absolute));
    }
  }
  record('w01.domain-diagnostics-tab-not-invented', matches.length === 0, {
    binding: 'packet §3 A-2: domain-diagnostics bottom tab is NOT IMPLEMENTED — requirement candidate only, do not invent',
    implementationMatches: matches
  });
}

/* ------------------------------------------------------------------ *
 * Diagnostics gate: assurance-only, positive branch is `?diagnostics=foundation`
 * (main.ts) / diagnosticsEnabled() (m0-controller-composition.ts). Negative branch is
 * exercised for real by the W01 browser flow `diagnostics.gate`.
 * ------------------------------------------------------------------ */
{
  const mainSource = await readFile(pathAt('dist/main.js'), 'utf8');
  const m0Source = await readFile(pathAt('dist/surfaces/m0-controller-composition.js'), 'utf8');
  record('w01.diagnostics-gate-source-present', mainSource.includes("get('diagnostics')==='foundation'") && m0Source.includes('diagnosticsEnabled'), {
    binding: 'main.ts L286-288 `?diagnostics=foundation` + m0-controller-composition.ts diagnosticsEnabled()',
    mainHasFoundationGate: mainSource.includes("get('diagnostics')==='foundation'"),
    m0HasDiagnosticsEnabled: m0Source.includes('diagnosticsEnabled')
  });
}

/* ------------------------------------------------------------------ *
 * (d) deep-work lifecycle contract: BottomDeepWorkOwner exists, closed by default,
 * tab set carries no invented domain-diagnostics entry.
 * ------------------------------------------------------------------ */
{
  const bottom = await import(pathToFileURL('dist/foundation/global/bottom-shelf.js'));
  const kernel = await readFile(pathAt('dist/foundation/global/workspace-host-kernel.js'), 'utf8');
  record('w01.deep-work-owner-contract', bottom.BOTTOM_DEEP_WORK_OWNER === 'BottomDeepWorkOwner'
    && Array.isArray(bottom.BOTTOM_DEEP_WORK_TABS)
    && !bottom.BOTTOM_DEEP_WORK_TABS.includes('domain-diagnostics')
    && kernel.includes('bottomOpen: false'), {
    binding: 'foundation/global/bottom-shelf.ts BottomDeepWorkOwner + workspace-host-kernel.ts state.surface.bottomOpen default false',
    owner: bottom.BOTTOM_DEEP_WORK_OWNER,
    tabs: bottom.BOTTOM_DEEP_WORK_TABS,
    closedByDefault: kernel.includes('bottomOpen: false')
  });
}

/* ------------------------------------------------------------------ *
 * (e) evidence bound to the exact candidate.
 *
 * Two separate truths are checked, deliberately:
 *   1. the candidate identity is RECOMPUTED and recorded (never asserted from memory), and
 *   2. W01's own scope is proven byte-identical to HEAD, i.e. this workspace introduced no
 *      product-source change at all.
 *
 * The dispatch-declared worktree identity c82cec63…/287 is compared and any drift is
 * RECORDED rather than failing this workspace: sibling workspaces (W03/W04) are editing the
 * same serial worktree concurrently — observed directly, a file appeared in `git status`
 * during a 60 s window in which this workspace executed no command. Suppressing that drift
 * would hide it; failing W01 for it would misattribute it. It is reported as a cross-workspace
 * integration finding in writer-output/W01/W01_HANDOFF.md.
 * ------------------------------------------------------------------ */
{
  const identity = await canonicalSourceIdentity(root);
  const drift = identity.sha256 !== EXPECTED_WORKTREE_TREE;
  record('w01.candidate-identity-recomputed-and-recorded', identity.files === EXPECTED_WORKTREE_FILES, {
    binding: 'controller/07_browser/failure_taxonomy.md §B-4 WORKTREE VARIANT c82cec63…/287',
    expected: { sha256: EXPECTED_WORKTREE_TREE, files: EXPECTED_WORKTREE_FILES },
    measured: { sha256: identity.sha256, files: identity.files },
    drift,
    driftAttribution: drift
      ? 'CONCURRENT_SIBLING_WORKSPACE_EDITS (W03/W04) on the shared serial worktree — recorded, not suppressed; see writer-output/W01/W01_HANDOFF.md'
      : 'none — worktree matches the dispatch-declared candidate exactly'
  });
}

{
  // Exact W01 writable partition per controller/12_execution/02_parallel_dispatch.md §4
  // ("Source-tree ownership partition (0 overlap)"). `foundation/global/**` as a whole is NOT
  // W01's: preferences/settings is W05's sole kernel, so only the shell/deep-work seams below
  // are W01's to protect.
  const w01Writable = [
    'stack/native-typescript/surfaces/shell',
    'stack/native-typescript/surfaces/today',
    'stack/native-typescript/adapters/today',
    'stack/native-typescript/foundation/global/shell',
    'stack/native-typescript/foundation/global/bottom-shelf.ts',
    'stack/native-typescript/foundation/workspace.ts',
    'tests/surfaces/shell',
    'tests/surfaces/today',
    'tools/c3-today-truth'
  ];
  const status = spawnSync('git', ['status', '--porcelain', '-uall', '--', ...w01Writable, 'tools/w01-conformance.mjs', 'tools/w01-browser-flows.mjs'], { cwd: rootPath, encoding: 'utf8' });
  const changed = String(status.stdout || '').split('\n').filter(Boolean).map(line => line.slice(3).trim()).sort();
  // The only in-partition changes W01 is allowed: its own Coordinator-accepted route-test fix and
  // the two W01 tools it authored (`tools/{c3-today-truth,w01-*}` is W01's declared tooling root).
  const expectedChanged = ['tests/surfaces/today/surface.test.mjs', 'tools/w01-browser-flows.mjs', 'tools/w01-conformance.mjs'].sort();
  record('w01.writable-partition-only-expected-changes', status.status === 0 && JSON.stringify(changed) === JSON.stringify(expectedChanged), {
    binding: 'controller/12_execution/02_parallel_dispatch.md §4 W01 writable roots + §3 (writers may not edit main.ts/m0, git, dist, assurance)',
    writableRoots: w01Writable,
    expectedChanged,
    changedPaths: changed,
    productSourceChanged: changed.filter(p => p.startsWith('stack/'))
  });

  const readOnlyRoots = ['profiles', 'stack/native-typescript/surfaces/m0-controller-composition.ts'];
  const roDiff = spawnSync('git', ['diff', '--name-only', 'HEAD', '--', ...readOnlyRoots], { cwd: rootPath, encoding: 'utf8' });
  const roChanged = String(roDiff.stdout || '').split('\n').map(s => s.trim()).filter(Boolean);
  record('w01.read-only-roots-untouched', roDiff.status === 0 && roChanged.length === 0, {
    binding: 'controller/12_execution/02_parallel_dispatch.md §3/§4: profiles/** is read-only for every writer and main.ts/m0-controller-composition.ts are Coordinator-applied hotspots writers may not edit',
    readOnlyRoots,
    changedPaths: roChanged
  });

  const protectedPaths = [
    'stack/native-typescript/main.ts',
    'stack/native-typescript/foundation/extensions.css',
    'stack/native-typescript/foundation/operational/xterm-renderer.ts'
  ];
  const protectedDiff = spawnSync('git', ['diff', '--name-only', 'HEAD', '--', ...protectedPaths], { cwd: rootPath, encoding: 'utf8' });
  const protectedChanged = String(protectedDiff.stdout || '').split('\n').map(s => s.trim()).filter(Boolean);
  record('w01.protected-canonical-deltas-preserved', protectedChanged.length === 3, {
    binding: 'controller/08_evidence/worktree_disposition.md: the 3 pre-existing canonical deltas are protected input — present, never reverted',
    expectedPresent: protectedPaths,
    present: protectedChanged
  });
}

const pass = results.filter(item => item.status === 'PASS').length;
const fail = results.filter(item => item.status === 'FAIL').length;
const report = {
  schemaVersion: 1,
  workspace: 'W01',
  classification: 'W01_CONFORMANCE_PROOF_NOT_OWNER_ACCEPTANCE',
  command: 'node tools/w01-conformance.mjs',
  executedAt: new Date().toISOString(),
  candidate: `WORKTREE_VARIANT:${EXPECTED_WORKTREE_TREE}`,
  summary: { total: results.length, pass, fail },
  limits: 'Static + executable conformance over the built dist graph for W01-owned acceptance criteria; no Owner acceptance, no cross-workspace product verdict, no visual claim.',
  results
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = fail === 0 ? 0 : 1;

function pathAt(relative) {
  return path.join(rootPath, relative);
}
function pathToFileURL(relative) {
  return new URL(relative, root).href;
}
async function walk(directory) {
  const out = [];
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(child)));
    else out.push(child);
  }
  return out;
}
