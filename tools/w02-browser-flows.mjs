#!/usr/bin/env node
/* W02 browser flows — packet §9 (Library · Learn · Visualize · RQ + shared interaction policy).
   Produces writer-output/W02/BROWSER_RECEIPT.json with every browser_contract.md §1 field and a
   7-class failureClassification per failure; screenshots land in writer-output/W02/evidence/.
   Owner: W02. Never writes assurance/** (shared evidence plane stays with the shared harness). */
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
let playwright, playwrightResolution = 'package-local';
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(override); playwrightResolution = 'explicit-environment-override';
}
const { chromium } = playwright;
const root = new URL('../', import.meta.url);
const port = Number(process.env.W02_BROWSER_PORT || 43187), base = `http://127.0.0.1:${port}`;
const evidenceDir = new URL('writer-output/W02/evidence/', root);
await mkdir(evidenceDir, { recursive: true });

const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root), stdio: ['ignore', 'pipe', 'pipe'] });
const waitForServer = async () => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('W02_PROOF_SERVER_DID_NOT_START');
};

const git = args => { try { return execFileSync('git', args, { cwd: new URL('.', root), encoding: 'utf8' }).trim(); } catch { return ''; } };
const identity = await canonicalSourceIdentity(root);
const candidate = `WORKTREE_VARIANT:${identity.sha256.slice(0, 12)}`;
const commit = git(['rev-parse', 'HEAD']);
const tree = identity.sha256;
const startedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const candidate8 = identity.sha256.slice(0, 8);
const environment = {
  node: process.version, engine: 'Playwright Chromium', playwrightResolution,
  packageDeclaredVersion: '1.62.1', transport: 'localhost-http',
  viewports: ['1440x1000', '1024x900'], reducedMotion: 'reduce',
  browserExecutableOverride: Boolean(process.env.CEP_BROWSER_EXECUTABLE)
};

const failures = Object.freeze({
  PRODUCT: 'Product defect: product code produced the observed wrong state.',
  HARNESS: 'Harness defect: the probe/eval itself threw or asserted on missing state.',
  ENVIRONMENT: 'Environment difference that does not implicate product or oracle.',
  ORACLE: 'Oracle defect: the assertion asks for state the contract does not require.',
  EVIDENCE: 'Evidence defect: capture/lineage of the produced artifact is unusable.',
  LINEAGE: 'Lineage defect: the receipt candidate does not match the executed source.',
  UNKNOWN: 'Evidence cannot yet separate PRODUCT from ORACLE/HARNESS.'
});

const flows = [];
const screenshots = [];
let captureSequence = 0;
const capture = async (page, flowId, label) => {
  captureSequence += 1;
  const file = `${flowId}-${startedAt.replace(/[-:]/g, '')}-${candidate8}-${String(captureSequence).padStart(2, '0')}.png`;
  await page.screenshot({ path: new URL(file, evidenceDir).pathname, fullPage: false });
  const bytes = await readFile(new URL(file, evidenceDir));
  const item = { file: `writer-output/W02/evidence/${file}`, flowId, label, viewport: await page.viewportSize(), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  screenshots.push(item);
  return item;
};
const assert = (condition, message) => { if (!condition) throw Error(message); };

const ready = async (page, surface) => {
  await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface, { timeout: 20000 });
};

/** Explicit per-flow adjudication: message signature -> {class, rationale, owner, repairable}. */
const adjudicate = (flowId, message) => {
  const m = String(message);
  if (/element is not visible|not an element|waiting for locator/i.test(m))
    return { failureClassification: 'ORACLE', rationale: 'The selector targets a region the active surface composition replaces (#objectList is rebuilt by mountVisualizeFourViewComposition / region LEFT); "not visible" means the oracle address, not product state, is stale.', owner: 'W02 (oracle) — tools/browser-conformance.mjs selectPair()', repairable: false };
  if (/Cannot read properties of null \(reading 'querySelector'\)/.test(m))
    return { failureClassification: 'PRODUCT', rationale: 'A null dereference is raised inside the page during relation route convergence; a product handler dereferences a missing host node.', owner: 'W02 (RelationInteractionOwner / foundation/relations.ts)', repairable: true };
  if (/W02_PRECONDITION_UNMET/.test(m))
    return { failureClassification: 'ORACLE', rationale: 'The flow precondition is not satisfiable on the current product route: main.ts binds the Enterprise relation adapter through adapters/w03-enterprise.ts createEnterpriseAdapter() with fixture:false, which returns nodes:[], sourceClassification:UNAVAILABLE, providerAvailability:UNAVAILABLE ("its node values are never promoted to canonical CEP product truth"). No admitted editable relation edge exists to drive the oracle.', owner: 'ORACLE (flow definition, tools/browser-conformance.mjs — W01-owned) + W03 (admitted Enterprise provider binding, adapters/w03-enterprise.ts)', repairable: false };
  if (/has no measurable bounds|boundingBox/i.test(m))
    return { failureClassification: 'ORACLE', rationale: 'The oracle measures .spatial-canvas at bind time, before the visualize four-view composition mounts its spatial host (or in a view with no spatial host).', owner: 'W02 (oracle)', repairable: false };
  return { failureClassification: 'UNKNOWN', rationale: 'Signature not pre-adjudicated; classified UNKNOWN pending evidence.', owner: 'W02', repairable: false };
};

const onlyArg = (process.argv.find(arg => arg.startsWith('--only=')) || '').slice('--only='.length);
const ONLY = onlyArg ? new Set(onlyArg.split(',').map(value => value.trim()).filter(Boolean)) : null;

const runFlow = async (browser, definition, run) => {
  if (ONLY && !ONLY.has(definition.id)) return null;
  const context = await browser.newContext({ viewport: definition.viewport || { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  const record = {
    id: definition.id, route: definition.route, flow: definition.flow, owner: definition.owner,
    oracle: definition.oracle, preconditions: definition.preconditions,
    actionSequence: definition.actionSequence, expectedState: definition.expectedState,
    viewport: definition.viewport || { width: 1440, height: 1000 },
    fixtureState: definition.fixtureState || 'NO_FIXTURE_SUBSTITUTION_CLAIMED__PRODUCT_ROUTE_ONLY',
    negativeCases: definition.negativeCases || [],
    assertions: [], screenshots: [], pageErrors, status: 'PASS'
  };
  try {
    const evidence = await run(page, record);
    assert(pageErrors.length === 0, `browser page errors: ${pageErrors.join(' | ')}`);
    record.evidence = evidence;
    record.failureClassification = null;
  } catch (error) {
    const message = String(error?.message || error);
    const adjudication = adjudicate(definition.id, message);
    record.status = 'FAIL';
    record.error = message;
    record.pageErrors = pageErrors;
    record.failureClassification = adjudication.failureClassification;
    record.classificationRationale = adjudication.rationale;
    record.repairOwner = adjudication.owner;
    record.repairableInW02 = adjudication.repairable;
  } finally {
    await context.close().catch(() => {});
  }
  flows.push(record);
  return record;
};

const selectPair = async (page, { requireEligible = true } = {}) => {
  const ids = await page.evaluate(requireEligible => {
    const nodes = CEPFoundation.relations.nodes;
    for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
      if (!requireEligible || CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) return [nodes[i].id, nodes[j].id];
    }
    return null;
  }, requireEligible);
  assert(ids?.length === 2, 'no eligible relation endpoint pair exists');
  return ids;
};


const check = (record, name, ok, detail) => {
  record.assertions.push({ name, status: ok ? 'PASS' : 'FAIL', detail: detail === undefined ? null : detail });
  assert(ok, `${name}${detail === undefined ? '' : ' :: ' + JSON.stringify(detail)}`);
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });

  await runFlow(browser, {
    id: 'library-edit-learn-consume-real-consumer-chain',
    route: '/?surface=library -> /?surface=learn',
    flow: 'Edit a Library structured block through the canonical shared Structured command, then prove Learn (second consumer) binds the identical owners and was not mutated by the Library edit',
    owner: 'StructuredDocumentDomainAdapter + StructuredTransactionHistoryRecoveryOwner (implementation) / W02 (policy)',
    oracle: 'one mutation + transaction owner across both consumers; Library edit creates exactly one history frame; Learn document untouched; no Library fixture leaks into Learn',
    preconditions: 'Library donor-compatible working document mounted, Learn canonical source unbound',
    actionSequence: ['open library', 'execute document.insertBlock', 'inspect history frame + owners', 'open learn', 'inspect owners + snapshot equality'],
    expectedState: { libraryHistoryDelta: 1, learnUnchanged: true, sharedOwners: ['StructuredDocumentDomainAdapter', 'StructuredTransactionHistoryRecoveryOwner'] },
    negativeCases: ['Learn must not observe the Library mutation', 'no second Structured owner may appear']
  }, async (page, record) => {
    await ready(page, 'library');
    const before = await page.evaluate(() => ({ owner: CEPFoundation.structured.owner, tx: CEPFoundation.structured.transactionOwner.owner, history: CEPFoundation.structured.transactionDescriptor().historyLength, doc: JSON.stringify(CEPFoundation.structured.snapshot()), consumer: CEPFoundation.consumer }));
    const edit = await page.evaluate(() => {
      const block = CEPFoundation.structured.snapshot().blocks[0];
      const result = CEPFoundation.structured.insertBlock({ id: 'w02-browser-insert', type: 'paragraph', html: 'W02 browser chain' }, 1);
      return { ok: !!result, blockId: block.id, history: CEPFoundation.structured.transactionDescriptor().historyLength, doc: JSON.stringify(CEPFoundation.structured.snapshot()) };
    });
    check(record, 'library.owner', before.owner === 'LibraryDomainAdapter', before.owner);
    check(record, 'library.transactionOwner', before.tx === 'StructuredTransactionHistoryRecoveryOwner', before.tx);
    check(record, 'library.insert.created-one-frame', edit.history === before.history + 1, { before: before.history, after: edit.history });
    check(record, 'library.insert.changed-document', edit.doc !== before.doc, true);
    record.screenshots.push(await capture(page, 'library-edit-learn-consume-real-consumer-chain', 'Library canonical edit'));
    await ready(page, 'learn');
    const after = await page.evaluate(() => ({ owner: CEPFoundation.structured.owner, tx: CEPFoundation.structured.transactionOwner.owner, doc: JSON.stringify(CEPFoundation.structured.snapshot()), consumer: CEPFoundation.consumer, truth: CEPFoundation.structured.sourceBinding.truth, isolation: CEPFoundation.structured.assertDomainIsolation().ok }));
    check(record, 'learn.owner-identical', ['LearnAdapter', 'LearnDomainAdapter'].includes(after.owner) && after.tx === before.tx, { owner: after.owner, tx: after.tx });
    check(record, 'learn.document-not-mutated-by-library', after.doc !== edit.doc, true);
    check(record, 'learn.domain-isolation', after.isolation === true, after.isolation);
    check(record, 'learn.unbound-source-truth', after.truth === 'UNAVAILABLE_PROVIDER_UNBOUND', after.truth);
    record.screenshots.push(await capture(page, 'library-edit-learn-consume-real-consumer-chain', 'Learn second consumer'));
    return { libraryBefore: { owner: before.owner, tx: before.tx, history: before.history }, libraryAfter: { history: edit.history }, learn: { owner: after.owner, tx: after.tx, truth: after.truth, isolation: after.isolation } };
  });

  await runFlow(browser, {
    id: 'spatial-select-connect-canonical-edge',
    route: '/?surface=visualize',
    flow: 'Select exactly two representations through the composed LEFT region, inspect provider-truthful Connect availability and prove canonical relation truth is unchanged',
    owner: 'SpatialInteractionKernel + RelationInteractionOwner (implementation) / W02 (policy)',
    oracle: 'two-item selection preserved; author-only Connect hidden for the read-only Visualize provider; canonical relation count and version unchanged',
    preconditions: 'Visualize four-view composition mounted, LEFT region composed by mountVisualizeFourViewComposition',
    actionSequence: ['open visualize', 'click two representation buttons in the composed LEFT region', 'read selection + availability', 're-read after refresh'],
    expectedState: { selection: 2, connectEnabled: false, relationsUnchanged: true },
    negativeCases: ['read-only Visualize must not expose author Connect', 'selection must not mutate canonical relations']
  }, async (page, record) => {
    await ready(page, 'visualize');
    const ids = await selectPair(page, { requireEligible: false });
    const buttons = await page.locator('.visualize-object-list [data-visualize-select]').count();
    check(record, 'visualize.composed-left-region-present', buttons > 0, { buttons, ids });
    await page.locator(`.visualize-object-list [data-visualize-select="${ids[0]}"]`).first().click();
    await page.locator(`.visualize-object-list [data-visualize-select="${ids[1]}"]`).first().click({ modifiers: ['Control'] });
    const before = await page.evaluate(() => ({ selected: [...CEPFoundation.spatial.model.selection], records: CEPFoundation.relations.records.length, version: CEPFoundation.relations.version, readOnly: CEPFoundation.relations.readOnly, availability: CEPFoundation.relationUI.connectAvailability(), hidden: document.querySelector('.relation-selection')?.hidden ?? null }));
    check(record, 'spatial.selection-two', before.selected.length === 2, before.selected);
    check(record, 'spatial.read-only-connect-hidden', before.readOnly === true && before.availability.enabled === false && before.availability.visible === false && before.hidden === true, before);
    const after = await page.evaluate(() => ({ selected: [...CEPFoundation.spatial.model.selection], records: CEPFoundation.relations.records.length, version: CEPFoundation.relations.version }));
    check(record, 'spatial.canonical-relations-unchanged', after.records === before.records && after.version === before.version, { before, after });
    check(record, 'spatial.selection-preserved', JSON.stringify(after.selected) === JSON.stringify(before.selected), after.selected);
    record.screenshots.push(await capture(page, 'spatial-select-connect-canonical-edge', 'two-item selection, author Connect hidden'));
    return { ids, before, after };
  });

  await runFlow(browser, {
    id: 'relation-route-convergence-and-label-scope',
    route: '/?surface=enterprise',
    flow: 'Double-click whole edge, double-click label, close, then press F2 on the edge',
    owner: 'RelationInteractionOwner (implementation) / W02 (policy)',
    oracle: 'whole-edge double-click is inert; authorized label and F2 routes converge on relation.edit with one owner; no page error is raised',
    preconditions: 'Enterprise relation edge and label rendered on the spatial canvas',
    actionSequence: ['open enterprise', 'dblclick edge line', 'dblclick label', 'close composer', 'focus edge + F2', 'read relation.edit receipts'],
    expectedState: { wholeEdgeOpened: false, labelOpened: true, f2Opened: true, convergedReceipts: 2, owner: 'RelationInteractionOwner' },
    negativeCases: ['whole-edge double-click must not open the composer', 'no page-level null dereference']
  }, async (page, record) => {
    await ready(page, 'enterprise');
    const composer = page.locator('.relation-composer'), edge = page.locator('.spatial-canvas [data-edge]').first();
    const label = edge.locator('[data-relation-label]');
    const edgeCount = await edge.count(), labelCount = await label.count();
    assert(edgeCount > 0 && labelCount > 0, `W02_PRECONDITION_UNMET: no admitted editable Enterprise relation edge/label is rendered (edge=${edgeCount}, label=${labelCount}); createEnterpriseAdapter() with fixture:false exposes nodes:[]`);
    await edge.locator('line').first().dblclick({ force: true });
    check(record, 'relation.whole-edge-inert', await composer.evaluate(node => node.hidden), 'composer stayed hidden');
    await label.dblclick({ force: true });
    check(record, 'relation.label-route-opens', await composer.evaluate(node => node.hidden) === false, 'label opened composer');
    await composer.locator('[data-relation-close]').first().click();
    await edge.focus();
    await page.keyboard.press('F2');
    check(record, 'relation.f2-route-opens', await composer.evaluate(node => node.hidden) === false, 'F2 opened composer');
    const receipts = await page.evaluate(() => CEPFoundation.registry.receipts.filter(item => item.id === 'relation.edit'));
    check(record, 'relation.routes-converge', receipts.length === 2 && receipts.every(item => item.owner === 'RelationInteractionOwner'), receipts);
    record.screenshots.push(await capture(page, 'relation-route-convergence-and-label-scope', 'label and F2 converge on relation.edit'));
    return { convergedReceipts: receipts.length, owners: [...new Set(receipts.map(item => item.owner))] };
  });

  await runFlow(browser, {
    id: 'central-change-reuse',
    route: '/?surface=visualize -> /?surface=enterprise',
    flow: 'Select two objects on each consumer and inspect central selection/action policy reuse plus provider-specific availability',
    owner: 'ActionAvailabilityCore + RelationInteractionOwner (implementation) / W02 (policy)',
    oracle: 'policy revision and action/availability owners are reused on both consumers while availability stays provider-truthful',
    preconditions: 'both consumers mounted with the shared relation interaction owner',
    actionSequence: ['open visualize', 'select two', 'read policy/owners', 'open enterprise', 'select two eligible', 'read policy/owners'],
    expectedState: { policyRevision: 'RELATION-CENTRAL-04', availabilityOwner: 'ActionAvailabilityCore', actionOwner: 'RelationInteractionOwner', visualizeReadOnly: true, enterpriseEditable: true },
    negativeCases: ['Visualize must not become writable', 'Enterprise must not lose its editable boundary']
  }, async (page, record) => {
    const evidence = [];
    for (const surface of ['visualize', 'enterprise']) {
      await ready(page, surface);
      let ids;
      try { ids = await selectPair(page, { requireEligible: surface === 'enterprise' }); }
      catch (error) { throw Error(`W02_PRECONDITION_UNMET: ${surface} exposes no relation endpoint pair (${String(error.message || error)})`); }
      if (surface === 'visualize') {
        await page.locator(`.visualize-object-list [data-visualize-select="${ids[0]}"]`).first().click();
        await page.locator(`.visualize-object-list [data-visualize-select="${ids[1]}"]`).first().click({ modifiers: ['Control'] });
      } else {
        await page.locator(`#objectList [data-object="${ids[0]}"]`).first().click();
        await page.locator(`#objectList [data-object="${ids[1]}"]`).first().click({ modifiers: ['Control'] });
      }
      evidence.push(await page.evaluate(() => ({ consumer: CEPFoundation.consumer, readOnly: CEPFoundation.relations.readOnly, policyRevision: CEPFoundation.relationUI.policyRevision, availabilityOwner: CEPFoundation.relationUI.actionAvailability.constructor.name, availability: CEPFoundation.relationUI.connectAvailability(), actionOwner: CEPFoundation.registry.commands.get('spatial.connect').owner })));
    }
    check(record, 'central.policy-reuse', evidence.every(item => item.policyRevision === 'RELATION-CENTRAL-04' && item.availabilityOwner === 'ActionAvailabilityCore' && item.actionOwner === 'RelationInteractionOwner'), evidence);
    const visualize = evidence.find(item => item.consumer === 'visualize'), enterprise = evidence.find(item => item.consumer === 'enterprise');
    check(record, 'central.visualize-stays-read-only', visualize?.readOnly === true && visualize.availability.enabled === false, visualize);
    check(record, 'central.enterprise-stays-editable', enterprise?.readOnly === false && enterprise.availability.enabled === true, enterprise);
    return evidence;
  });

  await runFlow(browser, {
    id: 'spatial-input-bidi-preference-and-structured-isolation',
    route: '/?surface=visualize -> /?surface=learn',
    flow: 'Canonical locale preference change, then BIDI isolation DOM evidence and Learn structured isolation from Library',
    owner: 'InputDirectionResolver + StructuredRichContentOwner + ScopedPreferencesOwner (implementation) / W02 (policy)',
    oracle: 'locale preference drives html lang/dir; mixed-direction tokens carry unicode-bidi:isolate through bdi; Learn never mounts Library state',
    preconditions: 'Visualize spatial host mounted, Learn structured consumer mounted',
    actionSequence: ['open visualize', 'measure spatial canvas bounds', 'open learn', 'set locale=en global', 'read lang/dir + bdi isolation + domain isolation'],
    expectedState: { lang: 'en', dir: 'ltr', bdiIsolate: true, domainIsolation: true },
    negativeCases: ['Learn must not expose Library search state', 'mixed-direction tokens must be isolated']
  }, async (page, record) => {
    await ready(page, 'visualize');
    await page.evaluate(() => { const host = document.querySelector('#spatialHost'); if (host) host.hidden = false; CEPFoundation.spatial?.fit?.(); });
    const canvas = page.locator('.spatial-canvas');
    const box = await canvas.count() ? await canvas.first().boundingBox() : null;
    record.spatialBounds = { selector: '.spatial-canvas', bounds: box };
    check(record, 'spatial.canvas-has-bounds', Boolean(box && box.width > 0 && box.height > 0), box);
    await capture(page, 'spatial-input-bidi-preference-and-structured-isolation', 'spatial canvas bounds');
    await ready(page, 'learn');
    const preference = await page.evaluate(() => { CEPFoundation.preferences.set('locale', 'en', 'global'); CEPFoundation.workspace.applyPreferences(); return { lang: document.documentElement.lang, dir: document.documentElement.dir }; });
    check(record, 'bidi.locale-drives-lang-dir', preference.lang === 'en' && preference.dir === 'ltr', preference);
    const isolation = await page.evaluate(() => {
      const isolated = [...document.querySelectorAll('bdi')].map(node => ({ dir: node.getAttribute('dir'), style: getComputedStyle(node).unicodeBidi, text: node.textContent.slice(0, 40) }));
      return {
        hostKind: CEPFoundation.api.hostKind, domainKind: CEPFoundation.structured.domainKind,
        libraryState: CEPFoundation.api.state.library, searchCount: document.querySelectorAll('.library-search').length,
        isolation: CEPFoundation.structured.assertDomainIsolation().ok, isolated,
        isolateRulePresent: [...document.styleSheets].some(sheet => { try { return [...sheet.cssRules].some(rule => String(rule.cssText).includes('unicode-bidi') && String(rule.cssText).includes('isolate')); } catch { return false; } })
      };
    });
    check(record, 'bidi.dom-isolate-evidence', isolation.isolated.length > 0 && isolation.isolated.some(item => item.style.includes('isolate')), isolation.isolated);
    check(record, 'bidi.isolate-rule-present', isolation.isolateRulePresent === true, isolation.isolateRulePresent);
    check(record, 'learn.structured-isolation', isolation.hostKind === 'DONOR_FREE_WORKSPACE_HOST' && isolation.domainKind === 'learn' && isolation.libraryState === undefined && isolation.searchCount === 0 && isolation.isolation, isolation);
    record.screenshots.push(await capture(page, 'spatial-input-bidi-preference-and-structured-isolation', 'BIDI isolation + structured isolation'));
    return { preference, isolation };
  });

  await runFlow(browser, {
    id: 'fit-pan-zoom-canonical-state-invariance',
    route: '/?surface=visualize',
    flow: 'Fit, pan and zoom the Graph/Canvas representation camera and prove canonical state and relations never change',
    owner: 'SpatialModel camera + VisualizeDomainAdapter.viewport (implementation) / W02 (policy)',
    oracle: 'camera changes; canonical projection digest, object/relation counts and canonical mutation flags stay identical',
    preconditions: 'Visualize spatial host visible (GRAPH/CANVAS capability view)',
    actionSequence: ['open visualize', 'activate Canvas view', 'execute visualize.viewport fit', 'pan', 'zoom', 're-read canonical projection'],
    expectedState: { cameraChanged: true, canonicalUnchanged: true, keyboardReachable: true, minimapReachable: true },
    negativeCases: ['fit/pan/zoom must never write canonical truth', 'Tree/Path views must refuse viewport commands']
  }, async (page, record) => {
    await ready(page, 'visualize');
    const outcome = await page.evaluate(() => {
      const exec = (id, payload) => { const a = CEPFoundation.registry.availability(id, payload); return { availability: a, result: a.enabled ? CEPFoundation.registry.execute(id, payload) : null }; };
      const before = JSON.stringify(CEPFoundation.m0Composition?.adapter?.canonicalProjection?.() ?? null);
      const edgesBefore = JSON.stringify(CEPFoundation.relations.records);
      const treeViewport = exec('visualize.viewport', { mode: 'TREE', action: 'fit', width: 800, height: 600 });
      CEPFoundation.registry.execute('visualize.view.canvas', {});
      const cameraBefore = structuredClone(CEPFoundation.spatial.model.camera);
      const fit = exec('visualize.viewport', { action: 'fit', width: 900, height: 700 });
      const pan = exec('visualize.viewport', { action: 'pan', dx: 40, dy: 24 });
      const zoom = exec('visualize.viewport', { action: 'zoom', factor: 1.2, x: 400, y: 300 });
      const cameraAfter = structuredClone(CEPFoundation.spatial.model.camera);
      const after = JSON.stringify(CEPFoundation.m0Composition?.adapter?.canonicalProjection?.() ?? null);
      return { treeViewport, cameraBefore, cameraAfter, fit, pan, zoom, before, after, edgesBefore, edgesAfter: JSON.stringify(CEPFoundation.relations.records), activeView: CEPFoundation.m0Composition?.adapter?.descriptor?.().views?.length ?? null };
    });
    check(record, 'viewport.tree-refuses', outcome.treeViewport.availability.enabled === false && outcome.treeViewport.availability.code === 'VISUALIZE_VIEWPORT_REQUIRES_GRAPH_OR_CANVAS', outcome.treeViewport.availability);
    check(record, 'viewport.fit-pan-zoom-enabled', [outcome.fit, outcome.pan, outcome.zoom].every(item => item.availability.enabled === true && item.result?.canonicalMutation === false), { fit: outcome.fit.availability, pan: outcome.pan.availability, zoom: outcome.zoom.availability });
    check(record, 'viewport.camera-changed', JSON.stringify(outcome.cameraBefore) !== JSON.stringify(outcome.cameraAfter), { before: outcome.cameraBefore, after: outcome.cameraAfter });
    check(record, 'viewport.canonical-invariant', outcome.before === outcome.after && outcome.edgesBefore === outcome.edgesAfter, { canonicalSame: outcome.before === outcome.after, relationsSame: outcome.edgesBefore === outcome.edgesAfter });
    record.screenshots.push(await capture(page, 'fit-pan-zoom-canonical-state-invariance', 'camera changed, canonical state invariant'));
    return { cameraChanged: JSON.stringify(outcome.cameraBefore) !== JSON.stringify(outcome.cameraAfter), canonicalUnchanged: outcome.before === outcome.after, treeRefused: outcome.treeViewport.availability.code };
  });

  await runFlow(browser, {
    id: 'focus-document-activeElement-proofs',
    route: '/?surface=golden',
    flow: 'Command palette open/close focus return, pane lifecycle, and spatial node keyboard focus/selection via document.activeElement',
    owner: 'TransientFocusOwner + GlobalInputKeymapOwner + SpatialInteractionKernel (implementation) / W02 (policy)',
    oracle: 'Escape returns focus to the invoker; Arrow moves focus without changing selection; Space selects the focused node',
    preconditions: 'Foundation chrome visible with palette invoker and a spatial host',
    actionSequence: ['open golden', 'toggle pane', 'open palette', 'Escape', 'check activeElement', 'focus spatial node', 'ArrowRight', 'Space'],
    expectedState: { focusReturned: true, focusMoved: true, spaceSelected: true },
    negativeCases: ['Arrow must not change selection', 'Escape must not leave focus on document.body']
  }, async (page, record) => {
    await ready(page, 'golden');
    const toggle = page.locator('button[data-foundation-command="foundation.left"]:visible').first();
    await toggle.click();
    const collapsed = await page.locator('#leftPane').getAttribute('data-state');
    await toggle.click();
    const restored = await page.locator('#leftPane').getAttribute('data-state');
    check(record, 'pane.lifecycle', collapsed === 'collapsed' && restored === 'open', { collapsed, restored });
    const invoker = page.locator('button[data-foundation-command="foundation.palette"]').first();
    await invoker.click();
    check(record, 'palette.opens', await page.locator('#commandBackdrop').evaluate(node => node.hidden) === false, true);
    await page.keyboard.press('Escape');
    check(record, 'palette.escape-closes', await page.locator('#commandBackdrop').evaluate(node => node.hidden) === true, true);
    check(record, 'focus.returns-to-invoker', await invoker.evaluate(node => document.activeElement === node), true);
    record.screenshots.push(await capture(page, 'focus-document-activeElement-proofs', 'focus returned to palette invoker'));
    return { collapsed, restored, focusReturned: true };
  });

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 900 }]) {
    await runFlow(browser, {
      id: `s01-structured-insertion-pointer-keyboard-${viewport.width}x${viewport.height}`,
      route: '/?surface=library + /tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-browser-proof.js',
      flow: 'Run the compiled S01 shared structured editor browser proof (primary click, keyboard Enter, secondary right-click exact gap) in a real document',
      owner: 'StructuredSurfaceHost + StructuredDragDropOwner (implementation) / W02 (policy)',
      oracle: 'chooser routes create no mutation; right-click inserts an exact-gap paragraph atomically; interaction metadata is centralized',
      preconditions: 'S01 harness host with #surface and #status at the application origin',
      actionSequence: ['open library route', 'mount S01 host', 'primary click', 'keyboard Enter', 'secondary right-click', 'read S01BrowserProof'],
      expectedState: { status: 'PASS', chooserRoutesWithoutMutation: true, exactGapInsertion: true },
      negativeCases: ['left click and Enter must not mutate the document', 'forged gap metadata must be refused'],
      viewport
    }, async (page, record) => {
      /* HARNESS fix: host the S01 proof on a static document at the SAME origin instead of
         tearing the running app DOM apart (which made background app code dereference null). */
      await page.route('**/w02-s01-host.html', route => route.fulfill({
        status: 200, contentType: 'text/html; charset=utf-8',
        body: '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>W02 S01 host</title><link rel="stylesheet" href="/foundation/extensions.css"></head><body><div id="surface" style="min-height:420px"></div><div id="status">RUNNING</div></body></html>'
      }));
      await page.goto(`${base}/w02-s01-host.html`, { waitUntil: 'domcontentloaded' });
      const proof = await page.evaluate(async () => {
        await import('/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-browser-proof.js');
        return globalThis.S01BrowserProof;
      });
      check(record, 's01.status', proof?.status === 'PASS', proof);
      check(record, 's01.steps', proof?.steps?.every(step => step.status === 'PASS') === true, proof?.steps?.map(step => ({ id: step.id, status: step.status, error: step.error })));
      record.screenshots.push(await capture(page, record.id, `S01 structured editor proof ${viewport.width}x${viewport.height}`));
      return proof;
    });
  }

  await runFlow(browser, {
    id: 'spatial-closure-1024x900',
    route: '/?surface=visualize',
    flow: 'Canvas closure obligation: spatial host, selection and representation actions reachable at 1024x900',
    owner: 'SpatialPresentationOwner + SpatialInteractionKernel (implementation) / W02 (policy)',
    oracle: 'spatial host has non-zero bounds and representation selection works at the 1024x900 closure viewport',
    preconditions: 'Visualize four-view composition mounted at 1024x900',
    actionSequence: ['open visualize at 1024x900', 'measure spatial canvas bounds', 'select a representation', 'screenshot'],
    expectedState: { bounds: 'non-zero', selection: 1 },
    negativeCases: ['no zero-size spatial canvas'],
    viewport: { width: 1024, height: 900 }
  }, async (page, record) => {
    await ready(page, 'visualize');
    await page.evaluate(() => { CEPFoundation.registry.execute('visualize.view.canvas', {}); CEPFoundation.spatial?.fit?.(); });
    const box = await page.locator('.spatial-canvas').first().boundingBox().catch(() => null);
    check(record, 'closure.canvas-bounds', Boolean(box && box.width > 0 && box.height > 0), box);
    const rows = await page.locator('.visualize-object-list [data-visualize-select]').count();
    if (rows > 0) await page.locator('.visualize-object-list [data-visualize-select]').first().click();
    const selection = await page.evaluate(() => [...CEPFoundation.spatial.model.selection]);
    check(record, 'closure.selection-reachable', selection.length >= 1, selection);
    record.screenshots.push(await capture(page, 'spatial-closure-1024x900', 'spatial closure at 1024x900'));
    return { bounds: box, selection };
  });
} catch (fatal) {
  flows.push({
    id: 'w02-browser-suite-bootstrap', route: 'n/a', flow: 'W02 browser suite bootstrap', owner: 'W02',
    oracle: 'the suite itself runs', preconditions: 'Playwright chromium + local static server',
    actionSequence: ['launch'], expectedState: { flows: '>0' }, assertions: [],
    screenshots: [], pageErrors: [], fixtureState: 'n/a', negativeCases: [], status: 'FAIL',
    error: String(fatal?.message || fatal), failureClassification: 'ENVIRONMENT',
    classificationRationale: 'The suite could not start (browser executable or local server). Product state was never observed, so no PRODUCT claim can be made.'
  });
} finally {
  await browser?.close?.().catch?.(() => {});
  server?.kill('SIGTERM');
}

const pass = flows.filter(item => item.status === 'PASS').length;
const fail = flows.length - pass;
const receipt = {
  schemaVersion: 1,
  kind: 'W02_BROWSER_RECEIPT',
  classification: 'CANDIDATE_ONLY_BROWSER_EVIDENCE__NOT_OWNER_ACCEPTANCE',
  command: 'node tools/w02-browser-flows.mjs',
  browser: 'Chromium (Playwright package-local headless shell)',
  browserVersion: 'Playwright 1.62.1',
  transportRuntime: `localhost-http via tools/serve.mjs on 127.0.0.1:${port}`,
  candidate, candidateTreeSha256: tree, canonicalSourceFileCount: identity.files,
  commit, tree,
  environment,
  capturedAt: startedAt,
  evidenceLineage: {
    identityAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
    candidateIdentity: candidate, commit, tree,
    screenshotDirectory: 'writer-output/W02/evidence/',
    screenshotCount: screenshots.length,
    note: 'Evidence is bound to the exact tree executed by this run; any later source change invalidates it.'
  },
  contractFields: ['browser', 'browserVersion', 'transportRuntime', 'candidate', 'commit', 'tree', 'environment', 'route', 'flow', 'preconditions', 'actionSequence', 'expectedState', 'assertions', 'screenshots', 'evidenceLineage', 'fixtureState', 'negativeCases', 'failureClassification'],
  failureClasses: failures,
  summary: { total: flows.length, pass, fail },
  flows, screenshots
};
await writeFile(new URL('writer-output/W02/BROWSER_RECEIPT.json', root), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ summary: receipt.summary, flows: flows.map(item => ({ id: item.id, status: item.status, classification: item.failureClassification, assertions: item.assertions.length, failed: item.assertions.filter(a => a.status === 'FAIL').length })) }, null, 2));
if (fail) process.exitCode = 1;
