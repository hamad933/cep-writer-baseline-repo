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
const browserTransport = process.env.CEP_BROWSER_TRANSPORT === 'in-memory' ? 'in-memory' : process.env.CEP_BROWSER_TRANSPORT === 'file' ? 'file' : 'localhost-http';
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
  if (browserTransport === 'in-memory' || browserTransport === 'file') return;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('PROOF_SERVER_DID_NOT_START');
};
const ready = async (page, surface) => {
  if (browserTransport === 'in-memory') {
    await loadInMemory(page, surface);
  } else if (browserTransport === 'file') {
    const fileUrl = new URL(`dist/index.html?surface=${encodeURIComponent(surface)}`, root).href;
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'networkidle' });
  }
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface);
};
const selectPair = async (page,{requireEligible=true}={}) => {
  const {ids,consumer} = await page.evaluate(requireEligible => {
    const nodes = CEPFoundation.relations.nodes;
    for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
      if (!requireEligible || CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) return {ids:[nodes[i].id,nodes[j].id],consumer:CEPFoundation.consumer};
    }
    return {ids:null,consumer:CEPFoundation.consumer};
  }, requireEligible);
  assert(ids?.length === 2, requireEligible?'no eligible relation endpoint pair exists':'fewer than two relation endpoint objects exist');
  const visibleTarget = id => consumer === 'visualize'
    ? page.locator(`[data-visualize-select="${id}"]`).filter({ visible: true }).first()
    : page.locator(`.spatial-canvas [data-node="${id}"]`).filter({ visible: true }).first();
  const first=visibleTarget(ids[0]),second=visibleTarget(ids[1]);
  assert(await first.count() > 0 && await second.count() > 0, `visible surface-owned selection controls unavailable for ${consumer}: ${JSON.stringify(ids)}`);
  await first.click();
  await second.click({ modifiers: ['Control'] });
  return ids;
};
const selectEligiblePair = page => selectPair(page,{requireEligible:true});
const flow = async (_browser, definition, run) => {
  let isolatedBrowser,context;
  const errors = [];
  try {
    isolatedBrowser = await chromium.launch({
      headless: true,
      ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}),
      ...(browserTransport === 'file' ? { args: ['--allow-file-access-from-files'] } : {})
    });
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
    before: 'Visualize local-acceptance projection with no current selection',
    action: 'select exactly two representations and inspect provider-truthful Connect availability without mutating provider truth',
    owner: 'ActionAvailabilityCore + RelationInteractionOwner + RelationDomainAdapter',
    oracle: 'read-only Visualize preserves the two-item selection, hides author-only Connect UI, and leaves relation count/version unchanged'
  }, async page => {
    await ready(page, 'visualize');
    const selectedIds = await selectPair(page,{requireEligible:false});
    const selection = page.locator('.relation-selection');
    const before = await page.evaluate(() => ({selectedIds:[...CEPFoundation.spatial.model.selection],records:CEPFoundation.relations.records.length,version:CEPFoundation.relations.version,availability:CEPFoundation.relationUI.connectAvailability(),readOnly:CEPFoundation.relations.readOnly}));
    assert(before.selectedIds.length === 2 && selectedIds.every(id => before.selectedIds.includes(id)), `Visualize did not preserve the exact two-item representation selection: ${JSON.stringify({selectedIds,before})}`);
    assert(before.readOnly === true && before.availability.enabled === false && before.availability.visible === false, `Visualize read-only availability mismatch: ${JSON.stringify(before)}`);
    assert(await selection.evaluate(node => node.hidden), 'author-only Connect action surface became visible against the read-only Visualize provider');
    await capture(page, 'browser-selection-connect.png', 'spatial.selection-connect-canonical-edge', 'exactly-two selection with author-only Connect hidden by provider-truthful ActionAvailability');
    const after = await page.evaluate(() => ({selectedIds:[...CEPFoundation.spatial.model.selection],records:CEPFoundation.relations.records.length,version:CEPFoundation.relations.version,composerHidden:document.querySelector('.relation-composer')?.hidden}));
    assert(after.selectedIds.length === 2 && selectedIds.every(id => after.selectedIds.includes(id)), `read-only Visualize lost the selected representations: ${JSON.stringify({selectedIds,after})}`);
    assert(after.records === before.records && after.version === before.version && after.composerHidden !== false, `read-only Visualize mutated relation truth: ${JSON.stringify({before,after})}`);
    return { selectedIds, readOnly:before.readOnly, availability:before.availability, actionSurfaceVisible:false, canonicalRelationCount:after.records, canonicalVersion:after.version };
  });

  await flow(browser, {
    id: 'relation.route-convergence-and-label-scope',
    before: 'Enterprise relation edge under its admitted editable domain adapter',
    action: 'double-click whole edge, double-click label, close, then press F2 on edge',
    owner: 'RelationInteractionOwner',
    oracle: 'whole-edge double-click is inert; authorized label and F2 edit routes converge on relation.edit'
  }, async page => {
    await ready(page, 'enterprise');
    /* Controller bounded correction (OD-20260916-044; F-SH1-01; precedent db41d0f/490b6a4 oracle repairs).
       Ground truth (probed): edge 0 (`APP-WEB-01:relation:0`) is HORIZONTAL — its `<line>` geometric
       bounding box is {w:249,h:0} — Playwright visibility requires a non-empty box, so a genuinely
       painted horizontal SVG line (1.5px stroke / 18px transparent hit-target) is always "invisible"
       to the actionability model even though elementFromPoint hittably returns it for a human cursor.
       The oracle's INTENT is: a rendered, editable relation edge + label exists to falsify the
       whole-edge/label/F2 routes on. Correction: select the FIRST edge carrying a PAINTED
       (non-transparent stroke), non-degenerate (width>0 AND height>0, i.e. diagonal) `relation-line`
       with computed visibility plus a rendered label — such edges exist (probe: edges 2/3/4) and are
       fully actionability-valid. No fixture data, geometry, adapter or DOM order is touched; if no
       such rendered edge exists the guard fails truthfully. */
    const renderedEdge = await page.evaluate(() => {
      const edges = [...document.querySelectorAll('.spatial-canvas [data-edge]')];
      for (let i = 0; i < edges.length; i++) {
        const lines = [...edges[i].querySelectorAll('line')];
        const li = lines.findIndex(l => {
          const r = l.getBoundingClientRect(), cs = getComputedStyle(l);
          const painted = cs.stroke && cs.stroke !== 'none' && cs.stroke !== 'transparent' && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(cs.stroke) && Number(cs.strokeOpacity || 1) > 0;
          const visible = cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
          return painted && visible && r.width > 0 && r.height > 0;
        });
        if (li >= 0 && edges[i].querySelector('[data-relation-label]')) return { edge: i, line: li };
      }
      return { edge: -1, line: -1 };
    });
    const composer = page.locator('.relation-composer').filter({ visible: true }).first(),
      edge = page.locator('.spatial-canvas [data-edge]').nth(renderedEdge.edge),
      line = edge.locator('line').nth(renderedEdge.line),
      label = edge.locator('[data-relation-label]').filter({ visible: true }).first();
    if (renderedEdge.edge < 0) assert(false, `no painted non-degenerate relation edge exists on the enterprise canvas :: ${JSON.stringify(renderedEdge)}`);
    const routeProbe = await page.evaluate(() => ({
      relationUiSharesPublishedSpatial: CEPFoundation.relationUI?.spatial === CEPFoundation.spatial,
      relationUiSpatialConnected: Boolean(CEPFoundation.relationUI?.spatial?.host?.isConnected),
      publishedSpatialConnected: Boolean(CEPFoundation.spatial?.host?.isConnected),
      relationUiSelection: CEPFoundation.relationUI?.selectionDescriptor?.() || null,
      publishedSpatialSelection: CEPFoundation.spatial?.selectionDescriptor?.() || null,
      adapterRelationCount: CEPFoundation.relations?.records?.length ?? null,
      publishedSpatialEdgeCount: CEPFoundation.spatial?.model?.edges?.length ?? null,
      canvases: [...document.querySelectorAll('.spatial-canvas')].map(node => ({
        connected: node.isConnected,
        hidden: Boolean(node.closest('[hidden]')),
        edges: node.querySelectorAll('[data-edge]').length,
        labels: node.querySelectorAll('[data-relation-label]').length,
        visibleRect: (() => { const r=node.getBoundingClientRect(); return {width:r.width,height:r.height}; })()
      }))
    }));
    assert(await edge.count() > 0 && await line.count() > 0 && await label.count() > 0, `visible editable Enterprise relation edge/label is unavailable for route falsification :: ${JSON.stringify(routeProbe)}`);
    await line.dblclick();
    assert(await composer.count() === 0 || await composer.evaluate(node => node.hidden), 'whole-edge double-click incorrectly opened the composer');
    await label.dblclick();
    assert(!(await composer.evaluate(node => node.hidden)), 'authorized label double-click did not open the composer');
    await composer.locator('[data-relation-close]').first().click();
    await edge.focus();
    await page.keyboard.press('F2');
    assert(!(await composer.evaluate(node => node.hidden)), 'authorized F2 route did not open the relation composer');
    const receipts = await page.evaluate(() => CEPFoundation.registry.receipts.filter(item => item.id === 'relation.edit'));
    assert(receipts.length === 2 && receipts.every(item => item.owner === 'RelationInteractionOwner'), `relation routes did not converge: ${JSON.stringify(receipts)}`);
    return { harnessDomain:'enterprise.editable-provider-boundary', wholeEdgeOpened:false, convergedReceipts:receipts.length, owners:[...new Set(receipts.map(item => item.owner))] };
  });

  await flow(browser, {
    id: 'central-change-reuse',
    before: 'Visualize read-only and Enterprise editable consumers share the central relation interaction owner',
    action: 'select two objects on each consumer and inspect central selection policy plus provider-specific availability',
    owner: 'ActionAvailabilityCore + RelationInteractionOwner',
    oracle: 'policy revision/action owner are reused while availability remains provider-truthful'
  }, async page => {
    const evidence = [];
    for (const surface of ['visualize', 'enterprise']) {
      await ready(page, surface);
      const selectedIds = surface === 'visualize' ? await selectPair(page,{requireEligible:false}) : await selectEligiblePair(page);
      evidence.push(await page.evaluate(selectedIds => ({ consumer: CEPFoundation.consumer, selectedIds, readOnly:CEPFoundation.relations.readOnly, policyRevision: CEPFoundation.relationUI.policyRevision, availabilityOwner: CEPFoundation.relationUI.actionAvailability.constructor.name, availability: CEPFoundation.relationUI.connectAvailability(), actionOwner: CEPFoundation.registry.commands.get('spatial.connect').owner, relationUiSharesPublishedSpatial: CEPFoundation.relationUI?.spatial === CEPFoundation.spatial, relationUiSelection: CEPFoundation.relationUI?.selectionDescriptor?.() || null, publishedSpatialSelection: CEPFoundation.spatial?.selectionDescriptor?.() || null, relationUiSpatialConnected: Boolean(CEPFoundation.relationUI?.spatial?.host?.isConnected), publishedSpatialConnected: Boolean(CEPFoundation.spatial?.host?.isConnected) }), selectedIds));
    }
    assert(evidence.every(item => item.policyRevision === 'RELATION-CENTRAL-04' && item.availabilityOwner === 'ActionAvailabilityCore' && item.actionOwner === 'RelationInteractionOwner'), `central reuse owner mismatch: ${JSON.stringify(evidence)}`);
    const visualize=evidence.find(item=>item.consumer==='visualize'),enterprise=evidence.find(item=>item.consumer==='enterprise');
    assert(visualize?.readOnly === true && visualize.availability.enabled === false, `Visualize did not preserve read-only availability: ${JSON.stringify(visualize)}`);
    assert(enterprise?.readOnly === false && enterprise.availability.enabled === true, `Enterprise editable boundary did not remain available: ${JSON.stringify(enterprise)}`);
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
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', {
      state: 'visible',
      timeout: 10000
    });
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', {
      state: 'visible',
      timeout: 10000
    });
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', {
      state: 'visible',
      timeout: 10000
    });
    await page.waitForSelector('#operationalHost .xterm-helper-textarea', {
      state: 'visible',
      timeout: 10000
    });
    const input = page.locator('#operationalHost .xterm-helper-textarea').first();
    await input.focus();
    await page.keyboard.type('shutdown');
    await page.keyboard.press('Enter');
    const state = await page.evaluate(() => {
      const domain = CEPFoundation.m0Composition?.composition?.domain;
      if (!domain || typeof domain.workspace !== 'function' || typeof domain.recorded !== 'function') throw Error('CURRENT_RUNS_DOMAIN_UNAVAILABLE');
      const workspace = domain.workspace();
      const recordedSnapshot = domain.recorded();
      const device = workspace.devices.find(item => item.id === 'DEV-WEB-01');
      const event = recordedSnapshot.events.at(-1);
      const recorded = recordedSnapshot.devices.find(item => item.id === 'DEV-WEB-01');
      return { up:device?.up, recordedUp:recorded?.up, semanticCommand:event?.semanticCommand, eventOutput:event?.output||'', provider:workspace.provider?.id||workspace.provider?.providerId||'UNKNOWN', domainOwner:domain.owner, runtimeTruth:workspace.provider?.runtimeTruth };
    });
    await page.waitForFunction(() => {
      const owner = CEPFoundation.sharedOwners?.operationalSessionOwner;
      const presentationId = owner?.activePresentationId || owner?.activeTab?.()?.presentationId;
      const buffer = CEPFoundation.operational?.renderer?.instances?.get?.(presentationId)?.term?.buffer?.active;
      if (!buffer) return false;
      for (let index = 0; index < buffer.length; index++) {
        if ((buffer.getLine(index)?.translateToString(true) || '').includes('DOWN')) return true;
      }
      return false;
    }, null, { timeout: 5000 });
    const terminalText = await page.evaluate(() => {
      const owner = CEPFoundation.sharedOwners?.operationalSessionOwner;
      const presentationId = owner?.activePresentationId || owner?.activeTab?.()?.presentationId;
      const buffer = CEPFoundation.operational?.renderer?.instances?.get?.(presentationId)?.term?.buffer?.active;
      if (!buffer) return '';
      const rows = [];
      for (let index = 0; index < buffer.length; index++) rows.push(buffer.getLine(index)?.translateToString(true) || '');
      return rows.join('\n');
    });
    assert(state.up === false && state.recordedUp === false, `Runs domain/recorded causal state mismatch: ${JSON.stringify({...state,terminalText})}`);
    assert(state.semanticCommand === 'device.shutdown' && state.eventOutput.includes('DOWN') && terminalText.includes('DOWN'), `Runs domain event or rendered xterm buffer is inconsistent: ${JSON.stringify({...state,terminalText})}`);
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
    const canvasTab = page.locator('[data-visualize-view-tab="CANVAS"]').filter({ visible: true }).first();
    assert(await canvasTab.count() > 0, 'visible Visualize CANVAS view control is unavailable');
    await canvasTab.click();
    await page.waitForFunction(() => document.querySelector('[data-visualize-active-view="CANVAS"] .spatial-canvas')?.getBoundingClientRect().width > 0);
    const svg = page.locator('[data-visualize-active-view="CANVAS"] .spatial-canvas').filter({ visible: true }).first(), box = await svg.boundingBox();
    assert(box, 'active Visualize CANVAS has no measurable bounds');
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
    const isolation = await page.evaluate(() => ({ hostKind: CEPFoundation.api.hostKind, domainKind: CEPFoundation.structured.domainKind, libraryState: CEPFoundation.api.state.library, searchCount: document.querySelectorAll('.library-search').length, treeLabel: document.querySelector('#structureTree')?.getAttribute('aria-label'), bdiCount: [...document.querySelectorAll('bdi[dir="ltr"]')].filter(node => String(node.textContent||'').trim().length > 0).length, isolation: CEPFoundation.structured.assertDomainIsolation().ok }));
    assert(isolation.hostKind === 'DONOR_FREE_WORKSPACE_HOST' && isolation.domainKind === 'learn' && isolation.libraryState === undefined && isolation.searchCount === 0 && isolation.isolation, `Learn leaked Library state or mounted the donor host: ${JSON.stringify(isolation)}`);
    assert(isolation.bdiCount > 0, `Learn did not render any non-empty technical/directional token through bdi[dir=ltr]: ${JSON.stringify(isolation)}`);
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
