import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
let playwright, playwrightResolution = 'package-local';
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: run npm ci, or set CEP_PLAYWRIGHT_MODULE_PATH to an explicitly managed compatible Playwright module path. ${primaryError.message}`);
  playwright = require(path.resolve(override));
  playwrightResolution = 'explicit-environment-override';
}
const { chromium } = playwright;
const root = new URL('../', import.meta.url), port = 43173, base = `http://127.0.0.1:${port}`;
const runtimeRegistry = JSON.parse(await readFile(new URL('contracts/FOUNDATION_RUNTIME_REGISTRY.json', root), 'utf8'));
const browserTransport = process.env.CEP_BROWSER_TRANSPORT === 'in-memory' ? 'in-memory' : 'localhost-http';
const server = browserTransport === 'localhost-http'
  ? spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root), stdio: ['ignore', 'pipe', 'pipe'] })
  : null;
const moduleUrlMemo = new Map();
const relativeSpecifiers = source => [...new Set([
  ...[...source.matchAll(/(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g)].map(match => match[1]),
  ...[...source.matchAll(/import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g)].map(match => match[1])
])];
const rewriteModuleSource = async relativePath => {
  let source = await readFile(new URL(`dist/${relativePath}`, root), 'utf8');
  for (const specifier of relativeSpecifiers(source)) {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), specifier));
    const dependencyUrl = await rewriteModule(resolved);
    source = source.split(specifier).join(dependencyUrl);
  }
  return source;
};
const rewriteModule = async relativePath => {
  if (moduleUrlMemo.has(relativePath)) return moduleUrlMemo.get(relativePath);
  const source = await rewriteModuleSource(relativePath);
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  moduleUrlMemo.set(relativePath, url);
  return url;
};
const loadInMemory = async (page, surface) => {
  let html = await readFile(new URL('dist/index.html', root), 'utf8');
  const donorCss = await readFile(new URL('dist/foundation/donor.css', root), 'utf8');
  const extensionCss = await readFile(new URL('dist/foundation/extensions.css', root), 'utf8');
  html = html
    .replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i, `<style data-browser-inline="donor">${donorCss}</style>`)
    .replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i, `<style data-browser-inline="extensions">${extensionCss}</style>`)
    .replace(/<script type="module" src="main\.js"><\/script>/i, '');
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(value => { try { delete globalThis.CEPFoundation; } catch {} history.replaceState({}, '', `about:blank?surface=${encodeURIComponent(value)}`); }, surface);
  const mainSource = await rewriteModuleSource('main.js');
  await page.addScriptTag({ type: 'module', content: `${mainSource}\n// browser-harness-surface:${surface}:${Date.now()}` });
};
const flows = [];
const screenshots = [];
const declaredFlows = ['workspace.transient-and-pane-lifecycle', 'spatial.selection-connect-canonical-edge', 'relation.route-convergence-and-label-scope', 'central-change-reuse', 'runtime-causal-consequence', 'spatial-input-bidi-preference-and-structured-isolation'];

const assert = (condition, message) => { if (!condition) throw Error(message); };
const capture = async (page, filename, flowId, property) => {
  const file = new URL(`assurance/${filename}`, root);
  await page.screenshot({ path: file.pathname, fullPage: false });
  const bytes = await readFile(file);
  screenshots.push({ filename, flowId, property, viewport: await page.viewportSize(), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), scope: 'EXACT_CURRENT_CANDIDATE_TARGETED_VISUAL_EVIDENCE' });
};
const waitForServer = async () => {
  if (browserTransport === 'in-memory') return;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('PROOF_SERVER_DID_NOT_START');
};
const ready = async (page, surface) => {
  if (browserTransport === 'in-memory') await loadInMemory(page, surface);
  else await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface);
};
const selectEligiblePair = async page => {
  const ids = await page.evaluate(() => {
    const nodes = CEPFoundation.relations.nodes;
    for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) if (CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) return [nodes[i].id, nodes[j].id];
    return null;
  });
  assert(ids?.length === 2, 'no eligible relation endpoint pair exists');
  await page.locator(`#objectList [data-object="${ids[0]}"]`).click();
  await page.locator(`#objectList [data-object="${ids[1]}"]`).click({ modifiers: ['Control'] });
  return ids;
};
const flow = async (_browser, definition, run) => {
  let isolatedBrowser,context;
  const errors = [];
  try {
    isolatedBrowser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
    context = await isolatedBrowser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    const evidence = await run(page);
    assert(errors.length === 0, `browser page errors: ${errors.join(' | ')}`);
    flows.push({ ...definition, status: 'PASS', evidence });
  } catch (error) {
    flows.push({ ...definition, status: 'FAIL', error: String(error.message || error), pageErrors: errors });
  } finally {
    try { if(context) await context.close(); } catch {}
    try { if(isolatedBrowser) await isolatedBrowser.close(); } catch {}
  }
};

let browser;
try {
  await waitForServer();

  await flow(browser, {
    id: 'workspace.transient-and-pane-lifecycle',
    before: 'Golden consumer with visible Foundation chrome',
    action: 'toggle pane, open and escape command palette, then restore pane',
    owner: 'WorkspaceFoundationHost + PaneLayoutController + TransientFocusController',
    oracle: 'pane truth changes, transient reverses, focus returns'
  }, async page => {
    await ready(page, 'golden');
    const toggle = page.locator('button[data-foundation-command="foundation.left"]:visible').first();
    await toggle.click();
    const collapsed = await page.locator('#leftPane').getAttribute('data-state');
    await toggle.click();
    const restored = await page.locator('#leftPane').getAttribute('data-state');
    const paletteInvoker = page.locator('button[data-foundation-command="foundation.palette"]').first();
    await paletteInvoker.click();
    assert(!(await page.locator('#commandBackdrop').evaluate(node => node.hidden)), 'command palette did not open');
    await page.keyboard.press('Escape');
    assert(await page.locator('#commandBackdrop').evaluate(node => node.hidden), 'Escape did not close command palette');
    assert(await paletteInvoker.evaluate(node => document.activeElement === node), 'focus did not return to palette invoker');
    assert(collapsed === 'collapsed' && restored === 'open', `pane lifecycle mismatch: ${collapsed}/${restored}`);
    await page.setViewportSize({ width: 900, height: 980 });
    const responsive = await page.evaluate(() => CEPFoundation.api.panes.snapshot());
    assert(responsive.right.preferred === 'open' && responsive.right.effective === 'collapsed', `preferred/effective pane state collapsed incorrectly: ${JSON.stringify(responsive)}`);
    await capture(page, 'browser-workspace-pane-context.png', 'workspace.transient-and-pane-lifecycle', 'preferred/effective pane state and shared workspace chrome');
    return { collapsed, restored, paletteExit: 'Escape', focusReturned: true, responsive };
  });

  await flow(browser, {
    id: 'spatial.selection-connect-canonical-edge',
    before: 'Visualize graph with no current selection',
    action: 'select exactly two objects, use compact Connect, submit composer',
    owner: 'ActionAvailabilityCore + RelationInteractionOwner + RelationDomainAdapter',
    oracle: 'one canonical relation is committed and its edge is projected'
  }, async page => {
    await ready(page, 'visualize');
    const selectedIds = await selectEligiblePair(page);
    const selection = page.locator('.relation-selection');
    assert(!(await selection.evaluate(node => node.hidden)), 'selection action surface was not shown for two objects');
    assert(await selection.locator('[data-connect]').isEnabled(), 'Connect was not enabled for the compatible pair');
    await capture(page, 'browser-selection-connect.png', 'spatial.selection-connect-canonical-edge', 'exactly-two central ActionAvailability presentation');
    const before = await page.evaluate(() => CEPFoundation.relations.records.length);
    await selection.locator('[data-connect]').click();
    assert(!(await page.locator('.relation-composer').evaluate(node => node.hidden)), 'relation composer did not open');
    await page.locator('.relation-composer button[type="submit"]').click();
    const after = await page.evaluate(() => ({ records: CEPFoundation.relations.records.length, latest: CEPFoundation.relations.records.at(-1), projected: CEPFoundation.spatial.model.edges.at(-1), version: CEPFoundation.relations.version }));
    assert(after.records === before + 1, 'canonical relation count did not increment once');
    assert(after.projected.canonicalId === after.latest.id && after.projected.kind === 'domain-projection', 'visible edge is not a canonical projection');
    return { selectedIds, before, after: after.records, relationId: after.latest.id, canonicalVersion: after.version, projectedKind: after.projected.kind };
  });

  await flow(browser, {
    id: 'relation.route-convergence-and-label-scope',
    before: 'Existing canonical Visualize relation edge',
    action: 'double-click whole edge, double-click label, close, then press F2 on edge',
    owner: 'RelationInteractionOwner',
    oracle: 'whole-edge double-click is inert; label and F2 converge on relation.edit'
  }, async page => {
    await ready(page, 'visualize');
    const composer = page.locator('.relation-composer'), edge = page.locator('.spatial-canvas [data-edge]').first(), line = edge.locator('line').first(), label = edge.locator('[data-relation-label]');
    await line.dblclick({ force: true });
    assert(await composer.evaluate(node => node.hidden), 'whole-edge double-click incorrectly opened the composer');
    await label.dblclick({ force: true });
    assert(!(await composer.evaluate(node => node.hidden)), 'label double-click did not open the composer');
    await composer.locator('[data-relation-close]').first().click();
    await edge.focus();
    await page.keyboard.press('F2');
    assert(!(await composer.evaluate(node => node.hidden)), 'F2 did not open the relation composer');
    const receipts = await page.evaluate(() => CEPFoundation.registry.receipts.filter(item => item.id === 'relation.edit'));
    assert(receipts.length === 2 && receipts.every(item => item.owner === 'RelationInteractionOwner'), `relation routes did not converge: ${JSON.stringify(receipts)}`);
    return { wholeEdgeOpened: false, convergedReceipts: receipts.length, owners: [...new Set(receipts.map(item => item.owner))] };
  });

  await flow(browser, {
    id: 'central-change-reuse',
    before: 'Visualize and Enterprise consumers use different domain adapters',
    action: 'select two objects on each consumer and inspect selection action policy',
    owner: 'ActionAvailabilityCore + RelationInteractionOwner',
    oracle: 'both consumers expose the same policy revision and action owner'
  }, async page => {
    const evidence = [];
    for (const surface of ['visualize', 'enterprise']) {
      await ready(page, surface);
      const selectedIds = await selectEligiblePair(page);
      evidence.push(await page.evaluate(selectedIds => ({ consumer: CEPFoundation.consumer, selectedIds, policyRevision: CEPFoundation.relationUI.policyRevision, availabilityOwner: CEPFoundation.relationUI.actionAvailability.constructor.name, availability: CEPFoundation.relationUI.connectAvailability(), actionOwner: CEPFoundation.registry.commands.get('spatial.connect').owner }), selectedIds));
    }
    assert(evidence.every(item => item.policyRevision === 'RELATION-CENTRAL-04' && item.availabilityOwner === 'ActionAvailabilityCore' && item.actionOwner === 'RelationInteractionOwner' && item.availability.enabled), `central reuse mismatch: ${JSON.stringify(evidence)}`);
    return evidence;
  });

  await flow(browser, {
    id: 'runtime-causal-consequence',
    before: 'RUN-0042 DEV-WEB-01 is selected and UP',
    action: 'open terminal through visible command and submit shutdown',
    owner: 'W03V34RunsAdapter via provider-neutral OperationalView',
    oracle: 'canonical device, spatial projection, terminal output, event and recorded projection agree'
  }, async page => {
    await ready(page, 'runs');
    const open = page.locator('button[data-foundation-command="OPEN_TERMINAL"]').filter({ visible: true }).first();
    await open.click();
    const input = page.locator('#operationalHost .xterm-helper-textarea').first();
    await input.focus();
    await page.keyboard.type('shutdown');
    await page.keyboard.press('Enter');
    const state = await page.evaluate(() => {
      const device = CEPFoundation.simulation.devices.find(item => item.id === 'DEV-WEB-01');
      const node = CEPFoundation.spatial.model.nodes.find(item => item.id === 'DEV-WEB-01');
      const event = CEPFoundation.simulation.events.at(-1);
      const recorded = CEPFoundation.simulation.recorded().devices.find(item => item.id === 'DEV-WEB-01');
      return { up: device.up, nodeStatus: node.status, semanticCommand: event.semanticCommand, eventOutput: event.output, recordedUp: recorded.up, provider: CEPFoundation.operational.providerDescriptor.id };
    });
    const terminalText = await page.locator('#operationalHost .terminal-output').innerText();
    assert(state.up === false && state.nodeStatus === 'DOWN' && state.recordedUp === false, `causal state mismatch: ${JSON.stringify(state)}`);
    assert(state.semanticCommand === 'device.shutdown' && state.eventOutput.includes('DOWN') && terminalText.includes('DOWN'), 'semantic event or visible terminal output is inconsistent');
    await capture(page, 'browser-operational-shutdown.png', 'runtime-causal-consequence', 'provider-neutral terminal and canonical shutdown consequence');
    return { ...state, terminalVisibleDown: true };
  });

  await flow(browser, {
    id: 'spatial-input-bidi-preference-and-structured-isolation',
    before: 'Visualize canvas and independent Learn structured consumer',
    action: 'Ctrl+RMB drag, normal RMB, keyboard focus/selection/camera/move, then canonical locale preference change in Learn',
    owner: 'SpatialInteraction + ContextSuppressionGate + ScopedPreferences + StructuredDocumentDomainAdapter',
    oracle: 'only own context is suppressed; keyboard intents stay distinct; Learn remains Library-free and Bidi-correct'
  }, async page => {
    await ready(page, 'visualize');
    const svg = page.locator('.spatial-canvas'), box = await svg.boundingBox();
    assert(box, 'spatial canvas has no measurable bounds');
    const start = { x: box.x + box.width - 130, y: box.y + box.height - 120 };
    await page.keyboard.down('Control');
    await page.mouse.move(start.x, start.y);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(start.x - 70, start.y - 30, { steps: 5 });
    await page.mouse.up({ button: 'right' });
    await page.keyboard.up('Control');
    assert(await page.locator('#foundationMenu').evaluate(node => node.hidden), 'Ctrl+RMB pan opened a context menu');
    await page.mouse.click(start.x - 10, start.y - 10, { button: 'right' });
    assert(!(await page.locator('#foundationMenu').evaluate(node => node.hidden)), 'next normal RMB was swallowed');
    await page.keyboard.press('Escape');

    await page.evaluate(() => { CEPFoundation.spatial.model.selection.clear(); CEPFoundation.spatial.render(); document.querySelector('.spatial-canvas [data-node]')?.focus(); });
    const beforeFocus = await page.evaluate(() => ({ focus: document.activeElement?.dataset?.node, selection: [...CEPFoundation.spatial.model.selection], camera: structuredClone(CEPFoundation.spatial.model.camera) }));
    await page.keyboard.press('ArrowRight');
    const afterFocus = await page.evaluate(() => ({ focus: document.activeElement?.dataset?.node, selection: [...CEPFoundation.spatial.model.selection] }));
    assert(afterFocus.focus && afterFocus.focus !== beforeFocus.focus && afterFocus.selection.length === 0, 'Arrow focus changed selection or failed to move focus');
    await page.keyboard.press('Space');
    const selectedId = await page.evaluate(() => [...CEPFoundation.spatial.model.selection][0]);
    assert(selectedId === afterFocus.focus, 'Space did not select the focused object');
    const beforeAlt = await page.evaluate(() => ({ camera: structuredClone(CEPFoundation.spatial.model.camera), node: structuredClone(CEPFoundation.spatial.model.nodes.find(item => item.id === [...CEPFoundation.spatial.model.selection][0])) }));
    await page.keyboard.press('Alt+ArrowRight');
    const afterAlt = await page.evaluate(() => ({ camera: structuredClone(CEPFoundation.spatial.model.camera), node: structuredClone(CEPFoundation.spatial.model.nodes.find(item => item.id === [...CEPFoundation.spatial.model.selection][0])) }));
    assert(afterAlt.camera.x !== beforeAlt.camera.x && afterAlt.node.x === beforeAlt.node.x, 'Alt+Arrow did not isolate camera movement');
    await page.keyboard.press('Control+ArrowRight');
    const afterControl = await page.evaluate(() => ({ camera: structuredClone(CEPFoundation.spatial.model.camera), node: structuredClone(CEPFoundation.spatial.model.nodes.find(item => item.id === [...CEPFoundation.spatial.model.selection][0])) }));
    assert(afterControl.camera.x === afterAlt.camera.x && afterControl.node.x !== afterAlt.node.x, 'Control+Arrow did not isolate object movement');

    await ready(page, 'learn');
    const preference = await page.evaluate(() => {
      CEPFoundation.preferences.set('locale', 'en', 'global');
      CEPFoundation.workspace.applyPreferences();
      return { lang: document.documentElement.lang, dir: document.documentElement.dir };
    });
    assert(preference.lang === 'en' && preference.dir === 'ltr', 'canonical locale preference did not update language/direction');
    const isolation = await page.evaluate(() => ({ hostKind: CEPFoundation.api.hostKind, domainKind: CEPFoundation.structured.domainKind, libraryState: CEPFoundation.api.state.library, searchCount: document.querySelectorAll('.library-search').length, treeLabel: document.querySelector('#structureTree')?.getAttribute('aria-label'), bdi: [...document.querySelectorAll('bdi[dir="ltr"]')].some(node => /KU|TCP\/IP|policy|learn-document/.test(node.textContent)), isolation: CEPFoundation.structured.assertDomainIsolation().ok }));
    assert(isolation.hostKind === 'DONOR_FREE_WORKSPACE_HOST' && isolation.domainKind === 'learn' && isolation.libraryState === undefined && isolation.searchCount === 0 && isolation.isolation, `Learn leaked Library state or mounted the donor host: ${JSON.stringify(isolation)}`);
    assert(isolation.bdi, 'mixed-direction technical token is not isolated with bdi');
    await ready(page, 'library');
    const libraryParity = await page.evaluate(() => ({ consumer: CEPFoundation.consumer, activeDocument: CEPFoundation.api.state.route.activeKu, blockCount: CEPFoundation.api.state.editor.blocks.length, editorCore: document.querySelector('#editorDocument')?.dataset.editorCore, donorHost: CEPFoundation.api.hostKind === undefined }));
    assert(libraryParity.activeDocument && libraryParity.blockCount > 0 && libraryParity.editorCore === 'UnifiedEditorCore' && libraryParity.donorHost, `Library donor compatibility path regressed: ${JSON.stringify(libraryParity)}`);
    return { contextSuppression: 'own-event-only', keyboard: { focusOnly: true, spaceSelect: true, altCameraOnly: true, controlMoveOnly: true }, preference, structured: isolation, libraryParity };
  });
} catch (fatal) {
  flows.push({ id: 'browser-suite-bootstrap', status: 'FAIL', error: String(fatal.message || fatal) });
} finally {
  if (browser) await browser.close();
  server?.kill('SIGTERM');
}

const canonicalSourceIdentityReceipt = await canonicalSourceIdentity(root);
const executionStatus = flows.length === 6 && flows.every(item => item.status === 'PASS') ? 'EXECUTED_PASS' : 'BLOCKED_OR_FAILED';
const report = {
  schemaVersion: 1,
  classification: 'REPRODUCIBLE_BROWSER_CONFORMANCE_RECEIPT_NOT_OWNER_ACCEPTANCE',
  command: 'npm run browser:test',
  sourceFoundationBaseline: runtimeRegistry.baselineId,
  sourceCandidate: `CANONICAL_SOURCE_TREE_SHA256:${canonicalSourceIdentityReceipt.sha256}`,
  sourceCanonicalTreeSha256: canonicalSourceIdentityReceipt.sha256,
  canonicalSourceFileCount: canonicalSourceIdentityReceipt.files,
  currentUse: 'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT',
  executionStatus,
  prerequisite: executionStatus === 'EXECUTED_PASS'
    ? 'SATISFIED: Playwright launched a compatible local Chromium executable and completed every declared flow.'
    : 'Install the Playwright package and its matching Chromium binary (npx playwright install chromium-headless-shell), or set CEP_BROWSER_EXECUTABLE to a compatible local executable.',
  declaredFlows,
  environment: { node: process.version, engine: 'Playwright Chromium', playwrightResolution, packageDeclaredVersion: '1.62.1', browserExecutableOverride: Boolean(process.env.CEP_BROWSER_EXECUTABLE), transport: browserTransport, viewport: '1440x980', reducedMotion: true },
  summary: { total: flows.length, pass: flows.filter(item => item.status === 'PASS').length, fail: flows.filter(item => item.status === 'FAIL').length },
  flows,
  screenshots,
  limitations: ['Headless Chromium only', 'Six bounded critical flows; not exhaustive permutation certification', 'Internal simulation does not execute host commands', 'A missing browser executable is reported as failure and never converted to a pass', 'Optional in-memory transport exists for environments that administratively block localhost navigation; it rewrites the same built ESM graph without changing application source']
};
await writeFile(new URL('assurance/BROWSER_CONFORMANCE_RECEIPT.json', root), JSON.stringify(report, null, 2) + '\n');
await writeFile(new URL('assurance/SCREENSHOT_MANIFEST.json', root), JSON.stringify({ schemaVersion: 2, policy: 'TARGETED_VISUAL_EVIDENCE_MAX_4', count: screenshots.length, screenshots }, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.summary.fail) process.exitCode = 1;
