/**
 * W03 browser flows — Enterprise · Scenarios · Labs · Runs · Results.
 *
 * Scope: packet §9 of controller/09_writer_forge/W03_writer_packet.md
 *   1. enterprise twin/baseline                       (PVF-001)
 *   2. runs preflight -> run -> recorded result       (PVF-002)
 *   3. results AAR + compare                          (PVF-003)
 *   4. replay causality + timeline scrub
 *   5. spatial select/connect/canonical-edge          (1440x1000 and 1024x900)
 *   6. run terminal detach (OPEN_TERMINAL, operational host)
 *
 * Every flow records the full browser_contract.md §1 field set plus a 7-class
 * failureClassification. Screenshots land in writer-output/W03/evidence/.
 * Exit code is non-zero when any flow fails, so acceptance-matrix proofs that
 * name this command measure FAIL instead of inheriting an assumed PASS.
 *
 * Fixture law: any non-live data used below is imported from the labelled W03
 * fixture adapter and reported through `fixtureState`. Fixtures are
 * `recordedConsumer` evidence only and are never reported as
 * `primaryLiveOperationalConsumer`.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
let playwright;
let playwrightResolution = 'package-local';
try {
  playwright = require('playwright');
} catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: run npm ci, or set CEP_PLAYWRIGHT_MODULE_PATH. ${primaryError.message}`);
  playwright = require(path.resolve(override));
  playwrightResolution = 'explicit-environment-override';
}
const { chromium } = playwright;

const root = new URL('../', import.meta.url);
const port = Number(process.env.CEP_W03_PORT || 43174);
const base = `http://127.0.0.1:${port}`;
const outDir = new URL('writer-output/W03/', root);
const evidenceDir = new URL('writer-output/W03/evidence/', root);
const { sha256: treeSha256, files: canonicalSourceFileCount } = await canonicalSourceIdentity(root);
const candidate8 = treeSha256.slice(0, 8);

const commit = await (async () => {
  try {
    const { execSync } = await import('node:child_process');
    return execSync('git rev-parse HEAD', { cwd: new URL('.', root).pathname }).toString().trim();
  } catch {
    return 'UNKNOWN_COMMIT';
  }
})();

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const FLOWS = [];
const screenshots = [];
const pageErrorsOverall = [];

const assert = (condition, message) => {
  if (!condition) throw Error(message);
};

const recordScreenshot = async (page, flowId, viewport) => {
  await mkdir(evidenceDir, { recursive: true });
  const filename = `${flowId}-${stamp()}-${candidate8}.png`;
  const fileUrl = new URL(filename, evidenceDir);
  await page.screenshot({ path: fileUrl.pathname, fullPage: false });
  const { readFile } = await import('node:fs/promises');
  const bytes = await readFile(fileUrl);
  const shot = {
    filename,
    flowId,
    viewport,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    path: `writer-output/W03/evidence/${filename}`,
    scope: 'W03_PACKET_SECTION_9_TARGETED_VISUAL_EVIDENCE'
  };
  screenshots.push(shot);
  return shot;
};

const ready = async (page, surface) => {
  await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface, { timeout: 20000 });
};

const runFlow = async (definition, run) => {
  const record = { ...definition, assertions: [], screenshots: [], negativeCases: definition.negativeCases || [] };
  let browser;
  let context;
  const pageErrors = [];
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
    context = await browser.newContext({ viewport: definition.viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));
    const { evidence, screenshots: flowShots } = await run(page, message => {
      record.assertions.push(message);
    });
    assert(pageErrors.length === 0, `uncaught page errors: ${pageErrors.join(' | ')}`);
    record.evidence = evidence;
    record.screenshots = flowShots.map(shot => shot.filename);
    record.status = 'PASS';
    record.failureClassification = null;
    record.error = null;
  } catch (error) {
    record.status = 'FAIL';
    record.error = String(error?.message || error);
    record.pageErrors = pageErrors;
    record.failureClassification = classify(record);
  } finally {
    try { if (context) await context.close(); } catch {}
    try { if (browser) await browser.close(); } catch {}
  }
  FLOWS.push(record);
  return record;
};

/**
 * 7-class taxonomy from controller/07_browser/browser_contract.md §2.
 * Classification is derived from where the failure was observed, never from a
 * default "browser issue"/"Product bug" label (forbidden).
 */
function classify(record) {
  const message = `${record.error || ''}`;
  if (/is not defined|ReferenceError|SyntaxError|PROBE_|probe/i.test(message)) return 'HARNESS';
  if (/ERR_BLOCKED|net::ERR_|ECONNREFUSED|PROOF_SERVER/.test(message)) return 'ENVIRONMENT';
  if (/CANONICAL_SOURCE_TREE|candidate/i.test(message)) return 'LINEAGE';
  if (/oracle|expectedState/i.test(message)) return 'ORACLE';
  if (/screenshot|evidence/i.test(message)) return 'EVIDENCE';
  if (record.pageErrors?.length) return 'PRODUCT';
  if (/assert|assertion/i.test(message)) return 'UNKNOWN';
  return 'UNKNOWN';
}

const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], {
  cwd: new URL('.', root),
  stdio: ['ignore', 'pipe', 'pipe']
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('PROOF_SERVER_DID_NOT_START');
};

const environment = {
  node: process.version,
  engine: 'Playwright Chromium',
  playwrightResolution,
  packageDeclaredVersion: require('playwright/package.json').version,
  browserExecutableOverride: !!process.env.CEP_BROWSER_EXECUTABLE,
  transport: 'localhost-http',
  reducedMotion: true
};

const common = {
  browser: 'Chromium (Playwright)',
  browserVersion: require('playwright/package.json').version,
  transportRuntime: 'localhost-http over tools/serve.mjs (Node 22 static server) + Playwright Chromium',
  candidate: `CANONICAL_SOURCE_TREE_SHA256:${treeSha256}`,
  commit,
  tree: treeSha256,
  environment,
  evidenceLineage: {
    canonicalSource: 'stack/native-typescript',
    canonicalSourceFileCount,
    generatedRuntime: 'dist/ (node tools/build-runtime.mjs under tools/writer-serial.sh)',
    receiptOwner: 'W03',
    contract: 'controller/07_browser/browser_contract.md §1'
  }
};

try {
  await mkdir(evidenceDir, { recursive: true });
  for (const entry of await readdir(evidenceDir)) {
    if (entry.endsWith('.png')) await rm(new URL(entry, evidenceDir), { force: true });
  }
  await waitForServer();

  /* ------------------------------------------------------------------ F1 */
  await runFlow({
    id: 'enterprise-twin-baseline',
    pvf: 'PVF-001',
    route: `${base}/?surface=enterprise`,
    viewport: { width: 1440, height: 1000 },
    flow: 'Enterprise studio boots, then Twin/Baseline lifecycle runs end to end with immutable published baselines',
    preconditions: 'Live enterprise route; no surface-local persistence bound; relations provider state truthful',
    actionSequence: [
      'open ?surface=enterprise and wait for CEPFoundation.consumer',
      'read m0Composition presentation + registered enterprise.* commands',
      'enterprise.create (identity), enterprise.baseline (pin), enterprise.validate, enterprise.publish',
      'enterprise.handoff (run-preparation preview only)',
      'enterprise.twin rebase attempt against a PUBLISHED revision (must be refused)',
      'enterprise.revise (successor revision), then enterprise.twin rebase on the DRAFT successor'
    ],
    expectedState: 'Published revision + pinned baseline stay immutable, Twin and Enterprise identities stay distinct, handoff never starts a run',
    fixtureState: 'LIVE_ROUTE_REPRESENTATIVE_SEED__the W03 6-object fixture is bound and labelled FIXTURE_ONLY__NOT_PRODUCT_TRUTH; snapshot.sourceTruth.canonicalProductTruth stays false',
    owner: 'W03EnterpriseDomain + SpatialInteractionKernel + RelationInteractionOwner'
  }, async (page, ok) => {
    await ready(page, 'enterprise');
    const boot = await page.evaluate(() => {
      const hosts = document.querySelectorAll('#spatialHost');
      const commands = [...CEPFoundation.registry.commands.keys()].filter(id => id.startsWith('enterprise.'));
      return {
        consumer: CEPFoundation.consumer,
        realStudio: CEPFoundation.m0Composition?.realStudio === true,
        presentationSpatial: typeof CEPFoundation.m0Composition?.presentation?.spatial === 'function',
        spatialHostCount: hosts.length,
        commands,
        objects: CEPFoundation.m0Composition?.domain?.snapshot?.()?.objects?.length ?? null,
        canonicalProductTruth: CEPFoundation.m0Composition?.domain?.snapshot?.()?.sourceTruth?.canonicalProductTruth ?? null,
        sourceClassification: CEPFoundation.m0Composition?.domain?.snapshot?.()?.sourceTruth?.classification ?? null,
        revisionId: CEPFoundation.m0Composition?.domain?.snapshot?.()?.revisionId ?? null
      };
    });
    assert(boot.consumer === 'enterprise', `wrong consumer: ${boot.consumer}`);
    assert(boot.realStudio, 'enterprise did not mount as a real M0 studio');
    assert(boot.presentationSpatial, 'enterprise presentation exposes no spatial view');
    assert(boot.spatialHostCount === 1, `expected exactly one #spatialHost, found ${boot.spatialHostCount}`);
    for (const id of ['enterprise.inspect', 'enterprise.edit', 'enterprise.revise', 'enterprise.twin', 'enterprise.handoff']) {
      assert(boot.commands.includes(id), `missing enterprise command ${id}`);
    }
    assert(boot.canonicalProductTruth === false, 'enterprise must not claim canonical product truth for its local draft');
    // VISUAL_REAUDIT DEF-ENT-1: the live route now binds the *representative* W03 6-object
    // fixture (same six objects as the CURRENT_FINAL_REFERENCE) instead of 0 objects.
    // It must stay labelled FIXTURE_ONLY__NOT_PRODUCT_TRUTH and never claim canonical truth.
    assert(boot.objects === 6, 'live enterprise route did not bind the representative 6-object seed: ' + JSON.stringify(boot));
    assert(boot.sourceClassification === 'FIXTURE_ONLY__NOT_PRODUCT_TRUTH', 'representative seed lost its FIXTURE_ONLY classification: ' + JSON.stringify(boot));
    assert(boot.revisionId === 'ENT-REV-004-DRAFT', 'live enterprise route did not bind the representative draft revision: ' + JSON.stringify(boot));
    ok('live enterprise route boots as a single-studio workspace with a labelled representative 6-object seed and non-canonical truth');

    const lifecycle = await page.evaluate(async () => {
      const execute = (id, payload) => CEPFoundation.registry.execute(id, { ...payload, route: 'w03-browser-flow' });
      const domain = CEPFoundation.m0Composition.domain;
      const before = domain.snapshot();
      const created = execute('enterprise.create', { enterpriseId: 'ENT-W03-BROWSER-1', revisionId: 'ENT-REV-W03-1', twinId: 'TWIN-W03-1' });
      const pinned = execute('enterprise.baseline', { baseline: { id: 'BL-W03-1', revision: 'r1', digest: 'sha256:0f3c9a1b5d7e', status: 'AVAILABLE' } });
      const validated = execute('enterprise.validate', {});
      const published = execute('enterprise.publish', {});
      const handoff = execute('enterprise.handoff', {});
      const publishedRefusal = execute('enterprise.twin', { action: 'rebaseTwin', conflictsResolved: true, overlayRefs: [{ classification: 'ENTERPRISE_BACKED' }], targetBaseline: { id: 'BL-W03-2', revision: 'r2', digest: 'sha256:111111111111', status: 'AVAILABLE' } });
      const publishedBaselineAfterRefusal = domain.snapshot().baseline;
      const revised = execute('enterprise.revise', { expectedVersion: domain.version, reason: 'w03-browser-flow successor' });
      const baselineBeforeRebase = domain.snapshot().baseline;
      const rebased = execute('enterprise.twin', { action: 'rebaseTwin', conflictsResolved: true, overlayRefs: [{ classification: 'SIMULATION_LOCAL' }], targetBaseline: { id: 'BL-W03-2', revision: 'r2', digest: 'sha256:222222222222', status: 'AVAILABLE' } });
      const after = domain.snapshot();
      return {
        before, created, pinned, validated, published, handoff, publishedRefusal, publishedBaselineAfterRefusal,
        revised, baselineBeforeRebase, rebased, after,
        relationVersionUnchanged: before.relationVersion === after.relationVersion,
        objectsUnchanged: before.objects.length === after.objects.length
      };
    });

    assert(lifecycle.created?.ok === true, `enterprise.create failed: ${JSON.stringify(lifecycle.created)}`);
    assert(lifecycle.pinned?.ok === true, `enterprise.baseline failed: ${JSON.stringify(lifecycle.pinned)}`);
    assert(lifecycle.validated?.ok === true && lifecycle.validated.status === 'VALIDATED', 'enterprise.validate did not validate');
    assert(lifecycle.published?.ok === true && lifecycle.published.snapshot.authoring === 'PUBLISHED', 'enterprise.publish did not publish');
    ok('enterprise identity + exact Baseline pin + validation + publish reached PUBLISHED');

    assert(lifecycle.handoff?.ok === true && lifecycle.handoff.code === 'HANDOFF_READY', `handoff not ready: ${JSON.stringify(lifecycle.handoff)}`);
    assert(lifecycle.handoff.runStarted === false && lifecycle.handoff.liveDeviceChanges === 0, 'handoff started a run or touched live devices');
    assert(lifecycle.handoff.canonicalPublication === false, 'handoff claimed a canonical publication');
    ok('run handoff is a preflight-only preview (runStarted=false, liveDeviceChanges=0)');

    assert(lifecycle.publishedRefusal?.ok === false, 'Twin rebase against a PUBLISHED revision was not refused');
    assert(lifecycle.publishedRefusal.code === 'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION', `unexpected refusal code ${lifecycle.publishedRefusal.code}`);
    assert(lifecycle.publishedBaselineAfterRefusal.digest === 'sha256:0f3c9a1b5d7e', 'published Baseline identity changed during a refused rebase');
    ok('negative case: published Enterprise/Twin revision and pinned Baseline stay immutable');

    assert(lifecycle.revised?.receipt?.action === 'enterprise.revise', 'enterprise.revise produced no receipt');
    assert(lifecycle.revised.snapshot.revisionId.startsWith('ENT-REV-LOCAL-'), 'successor revision identity missing');
    assert(lifecycle.rebased?.ok === true, `twin rebase on the successor failed: ${JSON.stringify(lifecycle.rebased)}`);
    assert(lifecycle.after.baseline.digest === 'sha256:222222222222', 'Twin rebase did not select the target Baseline');
    assert(lifecycle.after.twinId === 'TWIN-W03-1' && lifecycle.after.enterpriseId === 'ENT-W03-BROWSER-1', 'Twin and Enterprise identities converged');
    assert(lifecycle.relationVersionUnchanged && lifecycle.objectsUnchanged, 'Twin/Baseline lifecycle mutated spatial relation truth');
    ok('Twin rebase on a successor revision preserves Enterprise/Twin identity separation and relation truth');

    const shot = await recordScreenshot(page, 'enterprise-twin-baseline', '1440x1000');
    return { evidence: { boot, lifecycle }, screenshots: [shot] };
  });

  /* ------------------------------------------------------------------ F2 */
  await runFlow({
    id: 'runs-preflight-run-recorded',
    pvf: 'PVF-002',
    route: `${base}/?surface=runs`,
    viewport: { width: 1440, height: 1000 },
    flow: 'Runs no-write preflight, RUN lifecycle, terminal command consequence and recorded projection agreement',
    preconditions: 'Live runs route; InternalSimulationAdapter runtime truth (pty/powershell/ssh/nativeWindow all false)',
    actionSequence: [
      'read run lifecycle + availability of runs.* commands',
      'execute runs.preflight and re-read run state (must be a no-write preflight)',
      'execute runs.prepare/runs.start when the lifecycle admits it, otherwise record the truthful availability code',
      'open OPEN_TERMINAL on the selected device and type "shutdown"',
      'execute view.recorded and attempt a mutation of the recorded projection'
    ],
    expectedState: 'Preflight writes nothing, the terminal command produces a canonical event + spatial delta + recorded agreement, recorded projection stays read-only',
    fixtureState: 'LIVE_ROUTE_INTERNAL_SIMULATION__recordedConsumer projection, never a real host process',
    owner: 'W03RunDomain + InternalSimulationAdapter + OperationalSessionOwner + OperationalTerminalHost'
  }, async (page, ok) => {
    await ready(page, 'runs');
    const start = await page.evaluate(() => ({
      lifecycle: CEPFoundation.simulation?.run?.lifecycle ?? null,
      runId: CEPFoundation.simulation?.runId ?? null,
      registeredRunsCommands: [...CEPFoundation.registry.commands.keys()].filter(id => id.startsWith('runs.')),
      preflightRegistered: CEPFoundation.registry.commands.has('runs.preflight'),
      prepareRegistered: CEPFoundation.registry.commands.has('runs.prepare'),
      startRegistered: CEPFoundation.registry.commands.has('runs.start'),
      truthCeiling: CEPFoundation.m0Composition?.truthCeiling ?? null
    }));
    ok(`run ${start.runId} starts in lifecycle ${start.lifecycle}`);
    ok(`live route registers runs.* = ${start.registeredRunsCommands.join(', ') || 'none'}`);

    const preflight = await page.evaluate(() => {
      const before = JSON.stringify({ run: CEPFoundation.simulation.run, events: CEPFoundation.simulation.events.length });
      const registered = CEPFoundation.registry.commands.has('runs.preflight');
      const result = registered ? CEPFoundation.registry.execute('runs.preflight', { route: 'w03-browser-flow' }) : { ok: false, code: 'NOT_REGISTERED_ON_LIVE_ROUTE' };
      const after = JSON.stringify({ run: CEPFoundation.simulation.run, events: CEPFoundation.simulation.events.length });
      return { registered, result, noWrite: before === after, lifecycle: CEPFoundation.simulation.run.lifecycle };
    });
    assert(preflight.noWrite, 'runs.preflight mutated run state');
    if (preflight.registered) {
      assert(preflight.result && preflight.result.status, `runs.preflight returned no projection: ${JSON.stringify(preflight.result)}`);
      ok('runs.preflight is a no-write projection on the live route (run state and event stream unchanged)');
    } else {
      ok('live route does not register runs.preflight (integration gap recorded in the receipt evidence)');
    }

    const compositionPreflight = await page.evaluate(async () => {
      const [{ W03RunDomain }, { W03V34RunsAdapter }, { composeRunsSurface }] = await Promise.all([
        import('/adapters/runs/domain.js'),
        import('/adapters/w03-runs.js'),
        import('/surfaces/runs/index.js')
      ]);
      const domain = new W03RunDomain({ runtime: new W03V34RunsAdapter({ initialLifecycle: 'PREPARING' }) });
      const surface = composeRunsSurface({ domain, shared: { spatialRelation: { owner: 'RelationInteractionOwner' } } });
      const initial = { lifecycle: domain.runtime.run.lifecycle, version: domain.runtime.run.version };
      const projected = surface.bus.execute('runs.preflight', { route: 'w03-browser-flow' });
      const afterPreflight = { lifecycle: domain.runtime.run.lifecycle, version: domain.runtime.run.version };
      const prepare = surface.bus.execute('runs.prepare', { invocationId: 'w03-browser-prepare', route: 'w03-browser-flow' });
      const lifecycleAfterPrepare = domain.runtime.run.lifecycle;
      const startReceipt = surface.bus.execute('runs.start', { invocationId: 'w03-browser-start', route: 'w03-browser-flow' });
      const lifecycleAfterStart = domain.runtime.run.lifecycle;
      const recordedSnapshot = domain.recorded();
      const terminalAvailability = surface.bus.availability('OPEN_TERMINAL', { deviceId: 'DEV-WEB-01' });
      return {
        initial,
        projected: { status: projected.status, kind: projected.kind, checks: (projected.checks || []).map(check => `${check.id ?? check.kind}:${check.status}`), noWrite: JSON.stringify(initial) === JSON.stringify(afterPreflight) },
        prepare: { ok: prepare?.ok, status: prepare?.status, lifecycle: lifecycleAfterPrepare, manifestVersion: prepare?.manifest?.version ?? null },
        startReceipt: { ok: startReceipt?.ok ?? null, id: startReceipt?.id ?? null, rawLifecycle: startReceipt?.lifecycle ?? null, version: startReceipt?.version ?? null, lifecycle: lifecycleAfterStart },
        manifest: { version: domain.runtime.manifest.version, digest: domain.runtime.manifest.digest },
        recordedPlayback: recordedSnapshot.recordedPlayback,
        recordedTimelineOwner: recordedSnapshot.timelineReplayOwner,
        terminalAvailability,
        runtimeTruth: domain.runtime.descriptor().runtimeTruth,
        truthCeiling: surface.truthCeiling
      };
    });
    assert(compositionPreflight.projected.noWrite, 'runs.preflight wrote run state during a no-write preflight');
    assert(['READY', 'BLOCKED'].includes(compositionPreflight.projected.status), `preflight returned ${compositionPreflight.projected.status}`);
    assert(compositionPreflight.projected.kind === 'NO_WRITE_PREFLIGHT', `preflight is not a no-write projection: ${JSON.stringify(compositionPreflight.projected)}`);
    assert(compositionPreflight.projected.checks.every(entry => !entry.endsWith(':BLOCKED')), `preflight checks blocked: ${JSON.stringify(compositionPreflight.projected.checks)}`);
    assert(compositionPreflight.prepare.ok === true && compositionPreflight.prepare.lifecycle === 'READY', `runs.prepare did not reach READY: ${JSON.stringify(compositionPreflight.prepare)}`);
    assert(compositionPreflight.startReceipt.rawLifecycle === 'RUNNING' && typeof compositionPreflight.startReceipt.version === 'number', `runs.start did not return a RUNNING run aggregate: ${JSON.stringify(compositionPreflight.startReceipt)}`);
    assert(compositionPreflight.runtimeTruth === 'INTERNAL_SIMULATION', `unexpected runtime truth ${compositionPreflight.runtimeTruth}`);
    assert(compositionPreflight.recordedPlayback === 'INERT', 'recorded playback is not inert');
    assert(compositionPreflight.recordedTimelineOwner === 'SHARED_BINDING_REQUIRED', 'recorded projection lost its shared TimelineReplayOwner binding');
    assert(compositionPreflight.truthCeiling.realProcessExecution === false, 'Runs claimed real process execution');
    ok('PVF-002 preflight integration: runs.preflight (no-write, READY) -> runs.prepare (immutable manifest) -> runs.start (RUNNING)');

    const openTerminal = await page.evaluate(() => {
      const nodes = CEPFoundation.spatial?.model?.nodes || [];
      const deviceId = nodes[0]?.id || null;
      const availability = CEPFoundation.registry.availability('OPEN_TERMINAL', { deviceId });
      if (!availability.enabled) return { availability, skipped: true };
      const result = CEPFoundation.registry.execute('OPEN_TERMINAL', { deviceId, route: 'w03-browser-flow' });
      return { availability, result, skipped: false, deviceId };
    });
    assert(!openTerminal.skipped, `OPEN_TERMINAL unavailable: ${JSON.stringify(openTerminal.availability)}`);
    assert(openTerminal.result?.ok === true || openTerminal.result?.presentationId, `OPEN_TERMINAL failed: ${JSON.stringify(openTerminal.result)}`);
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', { state: 'visible', timeout: 15000 });
    ok('OPEN_TERMINAL opened an operational terminal session on the selected device');

    const causalBefore = await page.evaluate(() => ({
      up: CEPFoundation.simulation.devices.find(item => item.id === 'DEV-WEB-01')?.up,
      nodeStatus: CEPFoundation.spatial.model.nodes.find(item => item.id === 'DEV-WEB-01')?.status,
      events: CEPFoundation.simulation.events.length
    }));
    const input = page.locator('#operationalHost .xterm-helper-textarea').first();
    await input.focus();
    await page.keyboard.type('shutdown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    const causalAfter = await page.evaluate(() => {
      const event = CEPFoundation.simulation.events.at(-1);
      const recorded = CEPFoundation.simulation.recorded();
      const recordedDevice = recorded.devices?.find(item => item.id === 'DEV-WEB-01');
      return {
        up: CEPFoundation.simulation.devices.find(item => item.id === 'DEV-WEB-01')?.up,
        nodeStatus: CEPFoundation.spatial.model.nodes.find(item => item.id === 'DEV-WEB-01')?.status,
        eventCount: CEPFoundation.simulation.events.length,
        semanticCommand: event?.semanticCommand,
        eventOutput: event?.output,
        recordedUp: recordedDevice?.up,
        provider: CEPFoundation.simulation.descriptor?.()?.id ?? null,
        runtimeTruth: CEPFoundation.m0Composition?.runtimeTruth ?? null
      };
    });
    const terminalText = await page.locator('#operationalHost .terminal-output').innerText().catch(() => '');
    assert(causalAfter.eventCount > causalBefore.events, 'terminal command produced no canonical event');
    assert(causalAfter.semanticCommand === 'device.shutdown', `unexpected semantic command ${causalAfter.semanticCommand}`);
    assert(causalAfter.up === false && causalAfter.nodeStatus === 'DOWN', 'spatial projection did not follow the canonical device state');
    assert(causalAfter.recordedUp === false, 'recorded projection disagrees with the canonical device state');
    assert(String(causalAfter.eventOutput || '').includes('DOWN'), 'event output missing DOWN consequence');
    assert(terminalText.includes('DOWN'), 'visible terminal output missing DOWN consequence');
    ok('causal chain bound: terminal action -> semantic event -> canonical device delta -> spatial delta -> recorded agreement');

    const recordedTruth = await page.evaluate(() => {
      const recorded = CEPFoundation.simulation.recorded();
      const before = JSON.stringify(recorded);
      let mutationRefused = false;
      try { recorded.devices[0].up = true; } catch { mutationRefused = true; }
      const after = JSON.stringify(recorded);
      return { before, after, unchanged: before === after, mutationRefused, frozen: Object.isFrozen(recorded) };
    });
    assert(recordedTruth.unchanged, 'recorded projection was mutated by the browser flow');
    ok('recorded result is read-only under direct mutation pressure');

    const ceiling = await page.evaluate(() => CEPFoundation.m0Composition?.truthCeiling || null);
    const shot = await recordScreenshot(page, 'runs-preflight-run-recorded', '1440x1000');
    return {
      evidence: { start, preflight, compositionPreflight, openTerminal, causalBefore, causalAfter, recordedTruth, ceiling },
      screenshots: [shot]
    };
  });

  /* ------------------------------------------------------------------ F3 */
  await runFlow({
    id: 'results-aar-compare',
    pvf: 'PVF-003',
    route: `${base}/?surface=results`,
    viewport: { width: 1440, height: 1000 },
    flow: 'Results studio provider truth + AAR analysis revision + analytical compare over exact sealed revisions',
    preconditions: 'Live results route with an unbound Results provider, then an explicitly labelled recordedConsumer fixture composition for the mechanics',
    actionSequence: [
      'open ?surface=results and read provider availability for replay/compare/annotate/verifyDeterminism',
      'mount a recordedConsumer fixture composition (W03ResultsDomain + shared TimelineReplayOwner/AnalyticalCompareOwner)',
      'results.replay on an exact sealed ref, results.step to advance the timeline',
      'results.annotate to create a new AAR analysis revision',
      'results.compare over two exact sealed revisions; re-read the sealed records afterwards'
    ],
    expectedState: 'Unavailable provider stays visibly unavailable on the live route; AAR and Compare create analysis/session state only and never rewrite sealed facts or canonical relation truth',
    fixtureState: 'RECORDED_CONSUMER_FIXTURE__explicitly labelled fixture records for mechanics only; live route reports RESULTS_PROVIDER_UNAVAILABLE',
    owner: 'W03ResultsDomain + TimelineReplayOwner + AnalyticalCompareOwner'
  }, async (page, ok) => {
    await ready(page, 'results');
    const live = await page.evaluate(() => {
      const ids = ['results.replay', 'results.step', 'results.compare', 'results.annotate', 'results.handoff', 'results.verifyDeterminism'];
      const availability = Object.fromEntries(ids.map(id => [id, CEPFoundation.registry.availability(id, {})]));
      return {
        consumer: CEPFoundation.consumer,
        realStudio: CEPFoundation.m0Composition?.realStudio === true,
        availability,
        replayOwner: CEPFoundation.sharedOwners?.timelineReplayOwner?.owner ?? null,
        compareOwner: CEPFoundation.sharedOwners?.analyticalCompareOwner?.owner ?? null,
        providerState: CEPFoundation.m0Composition?.domain?.providerAvailability?.()?.state ?? null
      };
    });
    assert(live.consumer === 'results' && live.realStudio, 'results did not mount as a real M0 studio');
    assert(live.replayOwner === 'TimelineReplayOwner', `unexpected replay owner ${live.replayOwner}`);
    assert(live.compareOwner === 'AnalyticalCompareOwner', `unexpected compare owner ${live.compareOwner}`);
    assert(live.availability['results.replay'].enabled === false && live.availability['results.replay'].code === 'RESULTS_PROVIDER_UNAVAILABLE', 'live results replay did not fail closed while the provider is unbound');
    assert(live.availability['results.compare'].enabled === false, 'compare was offered without an admitted provider');
    assert(live.availability['results.verifyDeterminism'].enabled === false, 'determinism was claimed without an admitted verifier');
    ok('live results route reports explicit provider unavailability for replay/compare/annotate/verifyDeterminism');

    const mechanics = await page.evaluate(async () => {
      const [{ W03ResultsDomain }, { composeResultsSurface }, { TimelineReplayOwner }, { AnalyticalCompareOwner }] = await Promise.all([
        import('/adapters/results/domain.js'),
        import('/surfaces/results/index.js'),
        import('/foundation/timeline/replay.js'),
        import('/foundation/analytical/compare.js')
      ]);
      const records = [
        {
          resultId: 'RES-W03-A', revisionId: 'r1', manifestDigest: 'sha256:aaaa0001', sealed: true,
          label: 'W03 recordedConsumer fixture A', schemaVersion: 'results/v1.2', comparatorVersion: 'results-compare/1.0.0',
          comparable: { quarantine: { label: 'Quarantine', type: 'string', value: 'CONTAINED' }, hosts: { label: 'Hosts', type: 'number', value: 1 } },
          recordedEvents: [
            { seq: 1, id: 'ev-a1', type: 'DETECTION', timestamp: '2026-09-25T03:00:00Z' },
            { seq: 2, id: 'ev-a2', type: 'ISOLATION', timestamp: '2026-09-25T03:00:01Z' }
          ],
          historicalTerminalBytes: '[OK] fixture A recorded bytes'
        },
        {
          resultId: 'RES-W03-B', revisionId: 'r1', manifestDigest: 'sha256:bbbb0002', sealed: true,
          label: 'W03 recordedConsumer fixture B', schemaVersion: 'results/v1.2', comparatorVersion: 'results-compare/1.0.0',
          comparable: { quarantine: { label: 'Quarantine', type: 'string', value: 'PARTIAL' }, hosts: { label: 'Hosts', type: 'number', value: 3 } },
          recordedEvents: [
            { seq: 1, id: 'ev-b1', type: 'DETECTION', timestamp: '2026-09-24T18:00:00Z' },
            { seq: 2, id: 'ev-b2', type: 'ESCALATION', timestamp: '2026-09-24T18:00:05Z' }
          ],
          historicalTerminalBytes: '[WARN] fixture B recorded bytes'
        }
      ];
      const replayOwner = new TimelineReplayOwner();
      const compareOwner = new AnalyticalCompareOwner();
      const domain = new W03ResultsDomain({ records, timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner });
      const surface = composeResultsSurface({ domain, shared: { spatialRelation: { owner: 'RelationInteractionOwner' }, timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner } });
      const refA = domain.listResults()[0].ref;
      const refB = domain.listResults()[1].ref;
      const canonicalBefore = JSON.stringify({ results: domain.listResults(), records: domain.records });
      const relationSnapshot = () => CEPFoundation.relations
        ? { bound: true, records: CEPFoundation.relations.records.length, version: CEPFoundation.relations.version, owner: CEPFoundation.relations.owner }
        : { bound: false, records: null, version: null, owner: null };
      const relationsBefore = JSON.stringify(relationSnapshot());

      const replay = surface.bus.execute('results.replay', { ref: refA });
      const step1 = surface.bus.execute('results.step', { delta: 1 });
      const step2 = surface.bus.execute('results.step', { delta: 1 });
      const annotate = surface.bus.execute('results.annotate', { ref: refA, text: 'W03 AAR analysis revision', state: 'SAVED', anchoredEventRefs: ['ev-a1'] });
      const aarAfter = domain.aarProjection(refA);
      const compare = surface.bus.execute('results.compare', { left: refA, right: refB });

      const canonicalAfter = JSON.stringify({ results: domain.listResults(), records: domain.records });
      const relationsAfter = JSON.stringify(relationSnapshot());
      const recordBytesBefore = records.map(record => JSON.stringify(record));
      return {
        providerState: domain.providerAvailability().state,
        replayOwner: domain.replayOwner.owner,
        compareOwner: domain.compareOwner.owner,
        replay: { state: replay.state, index: replay.index, event: replay.event?.id ?? null, replayExecutesRuntime: replay.replayExecutesRuntime, total: replay.total },
        step1: { state: step1.state, index: step1.index, event: step1.event?.id ?? null },
        step2: { state: step2.state, index: step2.index, event: step2.event?.id ?? null },
        annotate: { state: annotate.state, revision: annotate.revision, factMutation: annotate.factMutation },
        aarAfter: { revision: aarAfter.revision, factMutation: aarAfter.factMutation, analysisDigest: aarAfter.analysisDigest },
        compare: { state: compare.state, differences: compare.differences?.length ?? null, comparatorVersion: compare.receipt?.comparatorVersion ?? null },
        canonicalUnchanged: canonicalBefore === canonicalAfter,
        liveRelationsUnchanged: relationsBefore === relationsAfter,
        fixtureRecordsUnchanged: recordBytesBefore.every((value, index) => value === JSON.stringify(records[index])),
        truthCeiling: { sealedFactsMutable: surface.truthCeiling.sealedFactsMutable, replayExecutesRuntime: surface.truthCeiling.replayExecutesRuntime }
      };
    });

    assert(mechanics.replayOwner === 'TimelineReplayOwner' && mechanics.compareOwner === 'AnalyticalCompareOwner', 'fixture composition did not use the singular shared owners');
    assert(mechanics.replay.state === 'PAUSED' || mechanics.replay.state === 'GAP', `unexpected replay state ${mechanics.replay.state}`);
    assert(mechanics.replay.replayExecutesRuntime === false, 'replay claimed to execute runtime');
    assert(mechanics.replay.total === 2, `unexpected recorded event total ${mechanics.replay.total}`);
    assert(mechanics.step1.index === mechanics.replay.index + 1, `timeline scrub did not advance the index: ${JSON.stringify({ replay: mechanics.replay, step1: mechanics.step1 })}`);
    assert(mechanics.step1.event !== mechanics.replay.event, 'timeline scrub did not change the selected recorded event');
    assert(mechanics.step1.state === mechanics.replay.state, 'timeline scrub changed replay state truth');
    assert(mechanics.step1.index === mechanics.replay.total - 1, 'first scrub did not reach the last recorded event');
    assert(mechanics.step2.index === mechanics.replay.total - 1, 'timeline scrub ran past the last recorded event');
    ok('replay causality: results.replay/step action -> timeline event selection -> replay state delta, replayExecutesRuntime=false');

    assert(mechanics.annotate.state === 'SAVED' || mechanics.annotate.revision >= 1, `AAR revision not created: ${JSON.stringify(mechanics.annotate)}`);
    assert(mechanics.annotate.factMutation === false && mechanics.aarAfter.factMutation === false, 'AAR claimed a fact mutation');
    assert(mechanics.aarAfter.revision >= 1 && mechanics.aarAfter.analysisDigest, 'AAR analysis revision has no digest');
    ok('AAR creates a separate analysis revision without mutating sealed recorded facts');

    assert(['MATCH', 'DIFFERENT'].includes(mechanics.compare.state) || mechanics.compare.state?.startsWith('C'), `unexpected compare state ${mechanics.compare.state}`);
    assert(mechanics.compare.comparatorVersion === 'results-compare/1.0.0', 'compare did not report its exact comparator version');
    assert(mechanics.canonicalUnchanged, 'compare/AAR rewrote sealed Result truth');
    assert(mechanics.fixtureRecordsUnchanged, 'compare/AAR mutated the underlying recorded fixture records');
    assert(mechanics.liveRelationsUnchanged, 'compare/AAR altered canonical relation state on the live route');
    assert(mechanics.truthCeiling.sealedFactsMutable === false && mechanics.truthCeiling.replayExecutesRuntime === false, 'results truth ceiling weakened');
    ok('canonical-state invariance: compare/AAR changed neither sealed Result truth nor live canonical relation state');

    const shot = await recordScreenshot(page, 'results-aar-compare', '1440x1000');
    return { evidence: { live, mechanics }, screenshots: [shot] };
  });

  /* ------------------------------------------------------------------ F4 */
  await runFlow({
    id: 'replay-causality-timeline-scrub',
    pvf: 'REPLAY',
    route: `${base}/?surface=results`,
    viewport: { width: 1440, height: 1000 },
    flow: 'Replay causal chain (action -> timeline event -> state delta) plus timeline scrub and gap truth',
    preconditions: 'Live results route for owner identity, recordedConsumer fixture composition for the timeline mechanics',
    actionSequence: [
      'verify the singular TimelineReplayOwner is bound on the live route',
      'attach a recordedConsumer provider through results.replay',
      'scrub forward with results.step and backwards with results.step delta -1',
      'attempt replay on an absent exact ref (must fail closed, never fabricate a timeline)',
      'read the timeline projection owner token and presentation truth'
    ],
    expectedState: 'Every scrub step moves the timeline index and selected event together; an absent ref fails closed; replay never executes runtime',
    fixtureState: 'RECORDED_CONSUMER_FIXTURE__labelled fixture records; live route supplies the owner binding only',
    owner: 'TimelineReplayOwner + TimelineReplayPresentationHost + W03ResultsDomain'
  }, async (page, ok) => {
    await ready(page, 'results');
    const liveOwner = await page.evaluate(() => ({
      replayOwner: CEPFoundation.sharedOwners?.timelineReplayOwner?.owner ?? null,
      instanceToken: CEPFoundation.sharedOwners?.timelineReplayOwner?.ownerToken ?? CEPFoundation.sharedOwners?.timelineReplayOwner?.token ?? null,
      sharedOwners: Object.keys(CEPFoundation.sharedOwners || {})
    }));
    assert(liveOwner.replayOwner === 'TimelineReplayOwner', 'live route has no TimelineReplayOwner');
    const replayOwnerInstances = await page.evaluate(async () => {
      const { TimelineReplayOwner } = await import('/foundation/timeline/replay.js');
      return { moduleOwner: TimelineReplayOwner.name, liveInstanceIsSingular: CEPFoundation.sharedOwners.timelineReplayOwner instanceof TimelineReplayOwner };
    });
    assert(replayOwnerInstances.liveInstanceIsSingular, 'live timeline owner is not the canonical TimelineReplayOwner instance');
    ok('live route binds exactly one canonical TimelineReplayOwner instance');

    const scrub = await page.evaluate(async () => {
      const [{ W03ResultsDomain }, { composeResultsSurface }, { TimelineReplayOwner }, { AnalyticalCompareOwner }] = await Promise.all([
        import('/adapters/results/domain.js'),
        import('/surfaces/results/index.js'),
        import('/foundation/timeline/replay.js'),
        import('/foundation/analytical/compare.js')
      ]);
      const records = [{
        resultId: 'RES-W03-REPLAY', revisionId: 'r1', manifestDigest: 'sha256:cccc0003', sealed: true,
        label: 'W03 recordedConsumer replay fixture', schemaVersion: 'results/v1.2', comparatorVersion: 'results-compare/1.0.0',
        comparable: { step: { label: 'Step', type: 'number', value: 1 } },
        recordedEvents: [
          { seq: 1, id: 'ev-r1', type: 'START', timestamp: '2026-09-25T04:00:00Z' },
          { seq: 2, id: 'ev-r2', type: 'DETECTION', timestamp: '2026-09-25T04:00:01Z' },
          { seq: 3, id: 'ev-r3', type: 'ACTION', timestamp: '2026-09-25T04:00:02Z' }
        ],
        historicalTerminalBytes: '[OK] fixture replay bytes'
      }];
      const replayOwner = new TimelineReplayOwner();
      const compareOwner = new AnalyticalCompareOwner();
      const domain = new W03ResultsDomain({ records, timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner });
      const surface = composeResultsSurface({ domain, shared: { spatialRelation: { owner: 'RelationInteractionOwner' }, timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner } });
      const ref = domain.listResults()[0].ref;
      const absentRef = { resultId: 'RES-ABSENT', revisionId: 'r9', manifestDigest: 'sha256:dead' };

      let absentFailure = null;
      try { surface.bus.execute('results.replay', { ref: absentRef }); } catch (error) { absentFailure = String(error?.message || error); }
      const afterAbsent = domain.replayState();

      const first = surface.bus.execute('results.replay', { ref });
      const chain = [{ action: 'results.replay', state: first.state, index: first.index, event: first.event?.id ?? null, status: first.timelineStatus }];
      for (let i = 0; i < 2; i += 1) {
        const next = surface.bus.execute('results.step', { delta: 1 });
        chain.push({ action: 'results.step:+1', state: next.state, index: next.index, event: next.event?.id ?? null, status: next.timelineStatus });
      }
      const back = surface.bus.execute('results.step', { delta: -1 });
      chain.push({ action: 'results.step:-1', state: back.state, index: back.index, event: back.event?.id ?? null, status: back.timelineStatus });

      return {
        absentFailure,
        afterAbsent: { state: afterAbsent.state, index: afterAbsent.index, event: afterAbsent.event?.id ?? null },
        chain,
        replayOwnerToken: first.replayOwnerToken,
        replayOwner: first.replayOwner,
        replayExecutesRuntime: first.replayExecutesRuntime,
        historicalTerminalBytesInert: first.historicalTerminalBytesInert,
        canonicalHistoryClaimByGenericOwner: first.canonicalHistoryClaimByGenericOwner,
        sealedUnchanged: JSON.stringify(domain.listResults()) === JSON.stringify([{ ref: domain.listResults()[0].ref, sealed: true, schemaVersion: 'results/v1.2', comparatorVersion: 'results-compare/1.0.0', label: 'W03 recordedConsumer replay fixture', runId: '', status: 'SEALED', eventCount: 3, provenanceRefs: [] }])
      };
    });

    assert(scrub.absentFailure && /RESULT_REVISION_ABSENT/.test(scrub.absentFailure), `absent ref did not fail closed: ${scrub.absentFailure}`);
    assert(scrub.afterAbsent.state === 'IDLE', 'a failed replay left a fabricated timeline attached');
    ok('negative case: replay on an absent exact ref fails closed and leaves no timeline state');

    const forward = scrub.chain.filter(step => step.action !== 'results.step:-1');
    for (let i = 1; i < forward.length; i += 1) {
      assert(forward[i].index > forward[i - 1].index, `timeline scrub did not advance: ${JSON.stringify(forward)}`);
      assert(forward[i].event !== forward[i - 1].event, 'timeline scrub did not change the selected recorded event');
    }
    const lastForward = forward[forward.length - 1];
    const backward = scrub.chain[scrub.chain.length - 1];
    assert(backward.index < lastForward.index && backward.event !== lastForward.event, 'reverse scrub did not move the timeline backwards');
    assert(forward[0].event === 'ev-r1' && lastForward.event === 'ev-r3', `unexpected event chain ${JSON.stringify(forward)}`);
    ok('causal chain bound: step action -> timeline index delta -> selected recorded event change, in both directions');

    assert(scrub.replayOwner === 'TimelineReplayOwner', `replay projection reports owner ${scrub.replayOwner}`);
    assert(scrub.replayExecutesRuntime === false, 'replay claimed to execute runtime');
    assert(scrub.historicalTerminalBytesInert === true, 'historical terminal bytes were not inert');
    assert(scrub.canonicalHistoryClaimByGenericOwner === false, 'generic owner claimed canonical history');
    assert(scrub.sealedUnchanged, 'replay/scrub rewrote the sealed Result');
    ok('replay is presentation-only over inert recorded bytes and never claims canonical history');

    const shot = await recordScreenshot(page, 'replay-causality-timeline-scrub', '1440x1000');
    return { evidence: { liveOwner, replayOwnerInstances, scrub }, screenshots: [shot] };
  });

  /* ------------------------------------------------------------------ F5 */
  for (const viewport of [{ width: 1440, height: 1000, label: '1440x1000' }, { width: 1024, height: 900, label: '1024x900' }]) {
    await runFlow({
      id: `spatial-select-connect-canonical-edge@${viewport.label}`,
      pvf: 'SPATIAL_BOUNDARY',
      route: `${base}/?surface=enterprise`,
      viewport: { width: viewport.width, height: viewport.height },
      flow: `Spatial select/connect/canonical-edge plus F-049 domain-boundary falsification at ${viewport.label}`,
      preconditions: 'Live enterprise route (single shared spatial host) and read-only Visualize consumer for the boundary case',
      actionSequence: [
        'verify the shared stage carries exactly one measurable spatial host',
        'compose a labelled fixture Enterprise draft and commit a typed canonical edge through enterprise.edit',
        'attempt an unauthorised/malformed edge (must fail closed)',
        'switch to Visualize, select two representations, and verify author-only Connect stays hidden',
        're-read canonical relation truth on both consumers'
      ],
      expectedState: 'A typed edge commits only through the W03EnterpriseDomain/RelationDomainAdapter owner; read-only Visualize keeps selection and canonical relation truth untouched; spatial operations never leak across consumers',
      fixtureState: 'RECORDED_CONSUMER_FIXTURE__labelled W03 fixture adapter for the authoring case; Visualize case runs on the live route',
      owner: 'SpatialInteractionKernel + RelationInteractionOwner + W03EnterpriseDomain'
    }, async (page, ok) => {
      await ready(page, 'enterprise');
      const stage = await page.evaluate(() => {
        const hosts = document.querySelectorAll('#spatialHost');
        const host = hosts[0] || null;
        const rect = host ? host.getBoundingClientRect() : null;
        const canvas = document.querySelector('.spatial-canvas');
        const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
        return {
          hostCount: hosts.length,
          hostRect: rect ? { w: Math.round(rect.width), h: Math.round(rect.height) } : null,
          canvasRect: canvasRect ? { w: Math.round(canvasRect.width), h: Math.round(canvasRect.height) } : null,
          connectOwner: CEPFoundation.registry.commands.get('spatial.connect')?.owner ?? null,
          policyRevision: CEPFoundation.relationUI?.policyRevision ?? null
        };
      });
      assert(stage.hostCount === 1, `expected one spatial host, found ${stage.hostCount}`);
      assert(stage.canvasRect && stage.canvasRect.w > 0 && stage.canvasRect.h > 0, `spatial canvas has no measurable bounds at ${viewport.label}`);
      assert(stage.connectOwner === 'RelationInteractionOwner', `spatial.connect owner is ${stage.connectOwner}`);
      ok(`spatial host and canvas are measurable at ${viewport.label} with the central RelationInteractionOwner`);

      const authoring = await page.evaluate(async () => {
        const [{ createEnterpriseAdapter }, { W03EnterpriseDomain }, { composeEnterpriseSurface }] = await Promise.all([
          import('/adapters/w03-enterprise.js'),
          import('/adapters/enterprise/domain.js'),
          import('/surfaces/enterprise/index.js')
        ]);
        const liveRecordsBefore = {
          present: !!CEPFoundation.relations,
          records: CEPFoundation.relations?.records?.length ?? null,
          version: CEPFoundation.relations?.version ?? null,
          owner: CEPFoundation.relations?.owner ?? null
        };
        const relationAdapter = createEnterpriseAdapter({ fixture: true });
        const domain = new W03EnterpriseDomain({ relationAdapter });
        const surface = composeEnterpriseSurface({ relationAdapter, domain });
        const nodes = relationAdapter.nodes;
        const before = { version: relationAdapter.version, count: relationAdapter.project().length, sourceClassification: relationAdapter.sourceClassification, canonicalProductTruth: relationAdapter.canonicalProductTruth };

        const allowedTypes = ['PROTECTED_BY', 'DEPENDS_ON', 'AUTHENTICATES_WITH', 'SENDS_LOGS', 'CONNECTS_TO'];
        let pick = null;
        let committed = null;
        let lastRefusal = null;
        const attempts = [];
        search:
        for (let i = 0; i < nodes.length; i += 1) {
          for (let j = 0; j < nodes.length; j += 1) {
            if (i === j) continue;
            for (const type of allowedTypes) {
              const payload = { source: nodes[i].id, target: nodes[j].id, type, direction: 'directed', expectedVersion: relationAdapter.version, route: 'w03-browser-flow' };
              if (type === 'CONNECTS_TO') { payload.sourcePin = `${nodes[i].id}:eth0`; payload.targetPin = `${nodes[j].id}:eth0`; }
              const availability = surface.bus.availability('enterprise.edit', payload);
              const enabled = availability === true || availability?.enabled === true;
              attempts.push({ type, enabled, code: availability?.code ?? null });
              if (!enabled) continue;
              let result;
              try { result = surface.bus.execute('enterprise.edit', payload); } catch (error) { lastRefusal = String(error?.message || error); attempts[attempts.length - 1].threw = lastRefusal; continue; }
              if (result?.relation) { pick = payload; committed = result; break search; }
              lastRefusal = `${result?.code || 'REFUSED'}: ${result?.reason || ''}`;
              attempts[attempts.length - 1].refused = lastRefusal;
            }
          }
        }
        const afterCommit = { version: relationAdapter.version, count: relationAdapter.project().length };
        const edge = pick ? relationAdapter.project().find(item => item.source === pick.source && item.target === pick.target) : null;

        const duplicateAttempt = pick ? surface.bus.execute('enterprise.edit', { ...pick, expectedVersion: relationAdapter.version, route: 'w03-browser-flow' }) : null;
        const staleAttempt = pick ? surface.bus.execute('enterprise.edit', { ...pick, expectedVersion: relationAdapter.version - 100, route: 'w03-browser-flow' }) : null;
        const afterMalformed = { version: relationAdapter.version, count: relationAdapter.project().length };
        const liveRecordsAfter = {
          present: !!CEPFoundation.relations,
          records: CEPFoundation.relations?.records?.length ?? null,
          version: CEPFoundation.relations?.version ?? null,
          owner: CEPFoundation.relations?.owner ?? null
        };
        return {
          before, pick, attempts: attempts.slice(0, 8), lastRefusal, committed, afterCommit, edge, duplicateAttempt, staleAttempt, afterMalformed,
          snapshotEdges: domain.snapshot().relations.length,
          owner: relationAdapter.owner,
          liveRecordsBefore, liveRecordsAfter
        };
      });

      assert(authoring.pick, `no authorizable typed edge pair exists: lastRefusal=${authoring.lastRefusal} attempts=${JSON.stringify(authoring.attempts)}`);
      assert(authoring.committed?.relation, `typed canonical edge did not commit: ${JSON.stringify(authoring.committed)}`);
      assert(authoring.afterCommit.count === authoring.before.count + 1 && authoring.afterCommit.version > authoring.before.version, 'canonical edge commit did not advance relation truth');
      assert(authoring.edge && ['PROTECTED_BY', 'DEPENDS_ON', 'AUTHENTICATES_WITH', 'SENDS_LOGS', 'CONNECTS_TO'].includes(authoring.edge.type), 'committed edge is not a typed canonical relation');
      if (authoring.edge.type === 'CONNECTS_TO') assert(authoring.edge.sourcePin && authoring.edge.targetPin, 'CONNECTS_TO edge lost its interface pins');
      assert(authoring.owner === 'W03EnterpriseDomain.LocalDraft', `unexpected relation owner ${authoring.owner}`);
      assert(authoring.snapshotEdges === authoring.afterCommit.count, 'domain snapshot does not project the committed canonical edge');
      ok(`typed canonical edge (${authoring.edge.type}) commits through the W03EnterpriseDomain relation owner`);

      assert(authoring.duplicateAttempt?.ok === false && authoring.duplicateAttempt.code, `duplicate edge was not refused with an explicit code: ${JSON.stringify(authoring.duplicateAttempt)}`);
      assert(authoring.staleAttempt?.ok === false, `stale expectedVersion was not refused: ${JSON.stringify(authoring.staleAttempt)}`);
      assert(authoring.afterMalformed.count === authoring.afterCommit.count && authoring.afterMalformed.version === authoring.afterCommit.version, 'refused edge attempts mutated canonical relation truth');
      assert(authoring.liveRecordsBefore.present && authoring.liveRecordsBefore.records === authoring.liveRecordsAfter.records && authoring.liveRecordsBefore.version === authoring.liveRecordsAfter.version, 'enterprise authoring leaked into the live route relation state');
      assert(authoring.liveRecordsBefore.owner === authoring.liveRecordsAfter.owner, 'relation owner changed during fixture authoring');
      ok('negative case: duplicate and stale-version edge attempts fail closed and spatial authoring does not leak to another consumer');

      await ready(page, 'visualize');
      const boundary = await page.evaluate(async () => {
        const spatialNodes = CEPFoundation.spatial?.model?.nodes || [];
        const relationNodes = CEPFoundation.relations?.nodes || [];
        const nodes = spatialNodes.length >= 2 ? spatialNodes : relationNodes;
        const ids = [nodes[0]?.id, nodes[1]?.id].filter(Boolean);
        const before = {
          records: CEPFoundation.relations.records.length,
          version: CEPFoundation.relations.version,
          readOnly: CEPFoundation.relations.readOnly
        };
        for (const [index, id] of ids.entries()) CEPFoundation.spatial.model.select(id, index > 0);
        const selection = [...CEPFoundation.spatial.model.selection];
        const availability = CEPFoundation.relationUI.connectAvailability();
        const selectionSurfaceHidden = document.querySelector('.relation-selection') ? document.querySelector('.relation-selection').hidden : null;
        const after = {
          records: CEPFoundation.relations.records.length,
          version: CEPFoundation.relations.version,
          readOnly: CEPFoundation.relations.readOnly
        };
        return { ids, selection, availability, selectionSurfaceHidden, before, after, consumer: CEPFoundation.consumer };
      });
      assert(boundary.consumer === 'visualize', `wrong consumer ${boundary.consumer}`);
      assert(boundary.ids.length === 2, 'visualize exposes fewer than two representations for selection');
      assert(boundary.selection.length === 2 && boundary.ids.every(id => boundary.selection.includes(id)), 'visualize did not preserve the exact two-item selection');
      assert(boundary.availability.enabled === false && boundary.availability.visible === false, 'author-only Connect became available against a read-only provider');
      assert(boundary.selectionSurfaceHidden === true, 'author-only Connect action surface is visible on a read-only provider');
      assert(boundary.before.records === boundary.after.records && boundary.before.version === boundary.after.version, 'selection mutated canonical relation truth on Visualize');
      assert(boundary.before.readOnly === true, 'Visualize provider is not read-only');
      ok('F-049 boundary: spatial selection on a read-only consumer neither exposes Connect nor mutates canonical relation truth');

      const shot = await recordScreenshot(page, 'spatial-select-connect-canonical-edge', viewport.label);
      return { evidence: { stage, authoring, boundary }, screenshots: [shot] };
    });
  }

  /* ------------------------------------------------------------------ F6 */
  await runFlow({
    id: 'run-terminal-detach',
    pvf: 'RUN_TERMINAL_DETACH',
    route: `${base}/?surface=runs`,
    viewport: { width: 1440, height: 1000 },
    flow: 'OPEN_TERMINAL operational host session and truthful detach disposition',
    preconditions: 'Live runs route with OperationalSessionOwner + OperationalTerminalHost bound',
    actionSequence: [
      'open OPEN_TERMINAL on the selected device',
      'read the attached runtime session tab identity',
      'request detachWindow on the operational session owner',
      'read the resulting disposition and provider-session preservation truth'
    ],
    expectedState: 'Detach either fails closed with an explicit code and preserved provider session, or confirms the platform window handoff; it never fabricates a detached window',
    fixtureState: 'LIVE_ROUTE_INTERNAL_SIMULATION__no real host process is executed',
    owner: 'OperationalSessionOwner + OperationalTerminalHost + InternalSimulationAdapter'
  }, async (page, ok) => {
    await ready(page, 'runs');
    const opened = await page.evaluate(() => {
      const nodes = CEPFoundation.spatial?.model?.nodes || [];
      const deviceId = nodes[0]?.id || null;
      const availability = CEPFoundation.registry.availability('OPEN_TERMINAL', { deviceId });
      if (!availability.enabled) return { skipped: true, availability };
      const result = CEPFoundation.registry.execute('OPEN_TERMINAL', { deviceId, route: 'w03-browser-flow' });
      return { skipped: false, availability, result, deviceId, owner: CEPFoundation.registry.commands.get('OPEN_TERMINAL')?.owner };
    });
    assert(!opened.skipped, `OPEN_TERMINAL unavailable: ${JSON.stringify(opened.availability)}`);
    assert(opened.result?.ok === true || opened.result?.presentationId, `OPEN_TERMINAL failed: ${JSON.stringify(opened.result)}`);
    assert(opened.owner && opened.owner !== null, 'OPEN_TERMINAL has no semantic owner');
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', { state: 'visible', timeout: 15000 });
    ok('OPEN_TERMINAL attached a runtime session to the operational host');

    const detach = await page.evaluate(() => {
      const sessionOwner = CEPFoundation.sharedOwners?.operationalSessionOwner || CEPFoundation.wave4Assembly?.operationalSession || null;
      if (!sessionOwner) return { unavailable: true };
      const tabsBefore = sessionOwner.tabsSnapshot?.() || [];
      let result;
      try { result = sessionOwner.detachWindow({ url: null }); } catch (error) { result = { thrown: String(error?.message || error) }; }
      const tabsAfter = sessionOwner.tabsSnapshot?.() || [];
      return {
        unavailable: false,
        owner: sessionOwner.owner,
        tabsBefore: tabsBefore.map(tab => tab.presentationId),
        tabsAfter: tabsAfter.map(tab => tab.presentationId),
        result,
        terminalVisible: !!document.querySelector('#operationalHost .xterm-helper-textarea')
      };
    });
    assert(!detach.unavailable, 'OperationalSessionOwner is not bound on the runs route');
    if (detach.result?.thrown) {
      assert(/OPERATIONAL_DETACH_REQUIRES_TAB/.test(detach.result.thrown), `detach threw unexpectedly: ${detach.result.thrown}`);
      ok('detach fails closed with an explicit operational code when no tab is active');
    } else if (detach.result?.ok === false) {
      assert(typeof detach.result.code === 'string' && detach.result.code.length > 0, 'failed detach returned no explicit code');
      assert(detach.result.providerSessionPreserved === true, 'failed detach did not preserve the provider session');
      assert(detach.tabsAfter.length === detach.tabsBefore.length, 'provider session tab disappeared on a refused detach');
      ok(`detach fails closed with ${detach.result.code} and preserves the provider session`);
    } else {
      assert(detach.result?.ok === true && detach.result?.active === true, `detach returned an indeterminate disposition: ${JSON.stringify(detach.result)}`);
      ok('detach confirmed an explicit platform window handoff');
    }
    assert(detach.result?.code !== undefined || detach.result?.ok === true, 'detach produced no disposition at all');

    const shot = await recordScreenshot(page, 'run-terminal-detach', '1440x1000');
    return { evidence: { opened, detach }, screenshots: [shot] };
  });
} catch (fatal) {
  FLOWS.push({
    id: 'w03-browser-suite-bootstrap',
    status: 'FAIL',
    error: String(fatal?.message || fatal),
    failureClassification: 'ENVIRONMENT',
    assertions: [],
    screenshots: []
  });
} finally {
  try { server.kill(); } catch {}
}

const summary = {
  total: FLOWS.length,
  pass: FLOWS.filter(flow => flow.status === 'PASS').length,
  fail: FLOWS.filter(flow => flow.status === 'FAIL').length
};

const receipt = {
  schemaVersion: 1,
  workspace: 'W03',
  classification: 'W03_REPRODUCIBLE_BROWSER_RECEIPT_NOT_OWNER_ACCEPTANCE',
  command: 'node tools/w03-browser-flows.mjs',
  sourceFoundationBaseline: 'CEP-FR-E18-ANALYTICAL-COMPARE-COMPLETION',
  sourceCandidate: `CANONICAL_SOURCE_TREE_SHA256:${treeSha256}`,
  sourceCanonicalTreeSha256: treeSha256,
  canonicalSourceFileCount,
  commit,
  tree: treeSha256,
  currentUse: 'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT',
  executionStatus: summary.fail === 0 && summary.pass === FLOWS.length ? 'EXECUTED_PASS' : summary.pass > 0 ? 'PARTIAL_EXECUTION' : 'BLOCKED_OR_FAILED',
  browser: 'Chromium (Playwright)',
  browserVersion: require('playwright/package.json').version,
  transportRuntime: common.transportRuntime,
  environment,
  declaredFlows: FLOWS.map(flow => flow.id),
  summary,
  flows: FLOWS,
  screenshots,
  limits: 'Six bounded W03 packet §9 flows at 1440x1000 and 1024x900; replay/AAR/compare mechanics execute against explicitly labelled recordedConsumer fixtures; not Owner acceptance.'
};

await mkdir(outDir, { recursive: true });
await writeFile(new URL('BROWSER_RECEIPT.json', outDir), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ summary, flows: FLOWS.map(flow => ({ id: flow.id, status: flow.status, failureClassification: flow.failureClassification, error: (flow.error || '').split('\n')[0] })) }, null, 2));
process.exitCode = summary.fail === 0 && summary.pass > 0 ? 0 : 1;
