/**
 * SH-1 baseline diagnostic probe (evidence tooling, not product code).
 *
 * Answers four questions against the exact current build:
 *  1. Which sub-condition of `relation.route-convergence-and-label-scope` fails?
 *  2. SpatialView instance census on the Enterprise route (constructor count).
 *  3. Does visible Enterprise selection drive the central RelationInteractionOwner?
 *  4. Does the RQ route use the purpose-built mount or the generic typed stage?
 *  5. Does the W04 composition path fail closed when registry injection is absent?
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43191);
const base = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
const waitForServer = async () => {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw Error('PROBE_SERVER_DID_NOT_START');
};

const censusSource = source => `${source}
/* SH-1 instance census instrumentation (probe-only response rewrite) */
(function(){
  const Orig = SpatialView;
  const census = (globalThis.__CEP_SPATIAL_CENSUS = []);
  SpatialView = class extends Orig {
    constructor(...args) {
      super(...args);
      census.push({ instanceId: this.instanceId, hostId: this.host?.id ?? null, hostConnected: this.host?.isConnected === true, hasCallbacks: !!this.callbacks });
    }
  };
})();
`;

await waitForServer();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });

await context.route('**/foundation/spatial.js', async route => {
  const response = await route.fetch();
  const body = await response.text();
  await route.fulfill({ response, body: censusSource(body), headers: { ...response.headers(), 'content-type': 'text/javascript; charset=utf-8' } });
});

const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
const out = { baseline: true, capturedAt: new Date().toISOString() };

const ready = async surface => {
  await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface, { timeout: 20000 });
  await page.waitForTimeout(300);
};

/* ------------------------------------------------------------------ enterprise */
await ready('enterprise');
await page.waitForTimeout(400);

out.enterprise = await page.evaluate(() => {
  const edge = document.querySelectorAll('.spatial-canvas [data-edge]');
  const lines = [...edge].flatMap(g => [...g.querySelectorAll('line')]);
  const labels = [...edge].flatMap(g => [...g.querySelectorAll('[data-relation-label]')]);
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  return {
    consumer: CEPFoundation.consumer,
    census: globalThis.__CEP_SPATIAL_CENSUS || null,
    spatialInstance: CEPFoundation.spatial?.instanceId ?? null,
    relationUiSpatialInstance: CEPFoundation.relationUI?.spatial?.instanceId ?? null,
    relationUiSharesPublishedSpatial: CEPFoundation.relationUI?.spatial === CEPFoundation.spatial,
    relationUiSpatialConnected: Boolean(CEPFoundation.relationUI?.spatial?.host?.isConnected),
    publishedSpatialConnected: Boolean(CEPFoundation.spatial?.host?.isConnected),
    liveSpatialCanvasCount: document.querySelectorAll('.spatial-canvas').length,
    liveSpatialHostCount: document.querySelectorAll('.spatial-host').length,
    edgeCount: edge.length,
    lineCount: lines.length,
    visibleLineCount: lines.filter(visible).length,
    labelCount: labels.length,
    visibleLabelCount: labels.filter(visible).length,
    enterpriseHost: (() => { const h = document.querySelector('[data-enterprise-spatial]'); return h ? { sameAsPublished: h === CEPFoundation.spatial?.host, connected: h.isConnected, edges: h.querySelectorAll('[data-edge]').length } : null; })(),
    selection: CEPFoundation.spatial?.selectionDescriptor?.() ?? null
  };
});

/* locator replication of the failing harness assertion */
const locatorCounts = {};
locatorCounts.edge = await page.locator('.spatial-canvas [data-edge]').count();
locatorCounts.lineVisible = await page.locator('.spatial-canvas [data-edge] line').filter({ visible: true }).count();
locatorCounts.lineFirstVisible = await page.locator('.spatial-canvas [data-edge] line').filter({ visible: true }).first().count();
locatorCounts.labelFirstVisible = await page.locator('.spatial-canvas [data-edge] [data-relation-label]').filter({ visible: true }).first().count();
out.locatorCounts = locatorCounts;

/* ------------------------------------------------ selection -> central availability */
out.selectionProbe = await page.evaluate(() => {
  const nodes = CEPFoundation.relations.nodes;
  let pair = null;
  for (let i = 0; i < nodes.length && !pair; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
    if (CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) { pair = [nodes[i].id, nodes[j].id]; break; }
  }
  return { pair };
});
const pairVisible = [];
for (const id of out.selectionProbe.pair || []) {
  const loc = page.locator(`.spatial-canvas [data-node="${id}"]`).filter({ visible: true }).first();
  pairVisible.push({ id, count: await loc.count() });
}
out.selectionProbe.visibleTargets = pairVisible;
if (out.selectionProbe.pair?.length === 2) {
  const first = page.locator(`.spatial-canvas [data-node="${out.selectionProbe.pair[0]}"]`).filter({ visible: true }).first();
  const second = page.locator(`.spatial-canvas [data-node="${out.selectionProbe.pair[1]}"]`).filter({ visible: true }).first();
  if (await first.count() && await second.count()) {
    await first.click();
    await second.click({ modifiers: ['Control'] });
    out.selectionProbe.afterClick = await page.evaluate(() => ({
      publishedSelection: CEPFoundation.spatial?.selectionDescriptor?.(),
      relationUiSelection: CEPFoundation.relationUI?.selectionDescriptor?.(),
      connectAvailability: CEPFoundation.relationUI?.connectAvailability?.(),
      registryConnectAvailability: CEPFoundation.registry.availability('spatial.connect', {})
    }));
  }
}

/* ---------------------------------------------------------- relation route probe */
out.relationRouteProbe = await page.evaluate(() => ({
  relationUiSharesPublishedSpatial: CEPFoundation.relationUI?.spatial === CEPFoundation.spatial,
  relationUiSpatialConnected: Boolean(CEPFoundation.relationUI?.spatial?.host?.isConnected),
  publishedSpatialConnected: Boolean(CEPFoundation.spatial?.host?.isConnected),
  receipts: CEPFoundation.registry.receipts.filter(r => r.id === 'relation.edit').map(r => ({ id: r.id, owner: r.owner, ok: r.ok }))
}));

/* ------------------------------------------------------------------ rq route */
await ready('rq');
await page.waitForTimeout(600);
out.rq = await page.evaluate(() => {
  const stage = document.querySelector('#foundationStage');
  const toolbar = [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b => b.dataset.foundationCommand);
  return {
    stageComposition: stage?.dataset.m0Composition ?? null,
    stageRqSurface: stage?.dataset.rqSurface ?? null,
    genericTypedStage: Boolean(stage?.querySelector('[data-r6-typed-surface="rq"]')),
    rqOwnWorkspace: Boolean(stage?.querySelector('[data-rq-workspace], .rq-workspace, #rqWorkspace, [data-rq-surface]')),
    stageFirstClass: stage?.firstElementChild?.className ?? null,
    stageDatasetKeys: stage ? Object.keys(stage.dataset) : [],
    toolbar
  };
});

/* ---------------------------------------------------- F01 fail-closed probe */
await ready('evidence');
out.fallbackProbe = await page.evaluate(async () => {
  const mod = await import('/surfaces/m0-controller-composition.js');
  const context = {
    consumer: 'evidence',
    registry: CEPFoundation.registry,
    commandBus: CEPFoundation.commandBus,
    workspace: CEPFoundation.workspace,
    analyticalCompareOwner: CEPFoundation.sharedOwners?.analyticalCompareOwner,
    button: (id, label) => `<button data-foundation-command="${id}">${label}</button>`,
    esc: v => String(v ?? '')
    /* reviewAuthorityRegistry intentionally absent */
  };
  try {
    const result = await mod.mountM0ControllerComposition(context);
    return { threw: false, centralReviewAuthorityRegistry: result?.centralReviewAuthorityRegistry ?? null, keys: Object.keys(result || {}) };
  } catch (error) {
    return { threw: true, message: String(error?.message || error) };
  }
});

out.pageErrors = pageErrors;
console.log(JSON.stringify(out, null, 2));

await browser.close();
server.kill();
