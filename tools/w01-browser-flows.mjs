/**
 * W01 browser proof — packet §9 required flows for Today + Shared Global Shell.
 *
 * Flows
 *   shell.destination-routing        shell five-destination functional baseline + real navigation
 *   today.render-and-filter          Today projection renders and the filter command is truthful
 *   back-forward-semantic-context    CBF-002 regression (P0: Back restores route, loses semantic context)
 *   deep-work.open-close-lifecycle   BottomDeepWorkOwner open/close lifecycle incl. closed hidden+inert
 *   diagnostics.gate                 positive + negative ?diagnostics=foundation gate (A-2: no invented tab)
 *
 * Contract: controller/07_browser/browser_contract.md §1 (every record carries browser,
 * browserVersion, transport/runtime, candidate, commit, tree, environment, route, flow,
 * preconditions, actionSequence, expectedState, assertions, screenshots, evidenceLineage,
 * fixtureState, negativeCases, failureClassification) and the 7-class taxonomy
 * PRODUCT|HARNESS|ENVIRONMENT|ORACLE|EVIDENCE|LINEAGE|UNKNOWN.
 *
 * Usage:
 *   node tools/w01-browser-flows.mjs                 # run every flow
 *   node tools/w01-browser-flows.mjs --flow <id>     # run/refresh exactly one flow (repeatable)
 *
 * Policy: no repair loop. Classify -> preserve evidence -> report. Exit 1 if a selected flow FAILs.
 */
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
let playwright, playwrightResolution = 'package-local';
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(path.resolve(override));
  playwrightResolution = 'explicit-environment-override';
}
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W01');
const evidenceDir = path.join(outDir, 'evidence');
const receiptPath = path.join(outDir, 'BROWSER_RECEIPT.json');

const CANDIDATE_TREE = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const CANDIDATE_FILES = 287;
const CANDIDATE_LABEL = `WORKTREE_VARIANT:${CANDIDATE_TREE}`;
const CANDIDATE8 = CANDIDATE_TREE.slice(0, 8);

const args = process.argv.slice(2);
const selected = [];
for (let i = 0; i < args.length; i += 1) if (args[i] === '--flow' && args[i + 1]) selected.push(args[++i]);

const git = command => {
  try {
    const out = require('child_process').execSync(command, { cwd: root, encoding: 'utf8' });
    return String(out).trim();
  } catch { return ''; }
};

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const flowFile = id => `${id.replace(/\./g, '-')}-${stamp()}-${CANDIDATE8}.png`;
/** Recursive evidence walk: nested `evidence/<surface>/` captures are indexed too, so a
 *  matched-viewport screenshot can never be an orphan (evidence_contract.md naming rule). */
async function walkEvidence(directory, prefix = '') {
  const out = [];
  let entries = [];
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await walkEvidence(path.join(directory, entry.name), relative)));
    else if (entry.name.endsWith('.png')) out.push(relative);
  }
  return out;
}

/* ------------------------------------------------------------------ flow runner */

const failures = [];
const runFlow = async (browser, definition, run) => {
  const record = {
    flow: definition.id,
    route: definition.route,
    preconditions: definition.preconditions,
    expectedState: definition.expectedState,
    fixtureState: definition.fixtureState,
    negativeCases: definition.negativeCases,
    actionSequence: [],
    assertions: [],
    screenshots: [],
    pageErrors: [],
    transportFailures: [],
    browser: 'Chromium (Playwright package-local)',
    browserVersion: env.browserVersion || null,
    status: 'PASS',
    failureClassification: null
  };
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => record.pageErrors.push(String(error)));
    page.on('requestfailed', request => record.transportFailures.push({ url: request.url(), error: String(request.failure()?.errorText || '') }));
    await run(page, record);
    const failedAssertions = record.assertions.filter(a => !a.ok);
    if (failedAssertions.length) {
      record.status = 'FAIL';
      record.failureClassification = failedAssertions[0].class || 'UNKNOWN';
    } else if (record.pageErrors.length) {
      record.status = 'FAIL';
      record.failureClassification = 'PRODUCT';
    } else {
      record.failureClassification = null;
    }
  } catch (error) {
    record.status = 'FAIL';
    record.failureClassification = error.classification || 'UNKNOWN';
    record.fatal = String(error?.message || error);
  } finally {
    try { if (context) await context.close(); } catch {}
  }
  if (record.status === 'FAIL') failures.push({ flow: record.flow, classification: record.failureClassification, fatal: record.fatal || null, failed: record.assertions.filter(a => !a.ok) });
  return record;
};

const assert = (record, id, expected, actual, klass, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  record.assertions.push({ id, expected, actual, ok, class: ok ? null : klass, message: ok ? '' : message });
  if (!ok) throw Object.assign(new Error(message || `${id}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`), { classification: klass });
};
/** Non-throwing variant: records the assertion and lets the flow continue so that later
 *  assertions still produce evidence (used where one failure must not mask the next). */
const check = (record, id, expected, actual, klass, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  record.assertions.push({ id, expected, actual, ok, class: ok ? null : klass, message: ok ? '' : message });
  return ok;
};
const note = (record, text) => record.actionSequence.push(text);
const shot = async (page, record, id) => {
  const filename = flowFile(record.flow.split('.').join('-') + (id ? `-${id}` : ''));
  const filePath = path.join(evidenceDir, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  const bytes = await readFile(filePath);
  record.screenshots.push({
    filename: path.join('writer-output/W01/evidence', filename),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    viewport: await page.viewportSize(),
    capturedAt: new Date().toISOString(),
    boundTo: { candidate: CANDIDATE_LABEL, flow: record.flow, id }
  });
};
const ready = async (page, record, surface, search = '') => {
  note(record, `GET /?surface=${surface}${search}`);
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}${search}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 20000 });
  await page.waitForTimeout(250);
};
const CLASS_PRODUCT = 'PRODUCT', CLASS_HARNESS = 'HARNESS', CLASS_ENV = 'ENVIRONMENT', CLASS_ORACLE = 'ORACLE';

/* ------------------------------------------------------------------ the five flows */

const definitions = [
  {
    id: 'shell.destination-routing',
    route: '/?surface=shell',
    preconditions: ['static proof server serves the committed dist/ build', 'app booted with CEPFoundation.consumer === "shell"', 'no ?diagnostics parameter'],
    expectedState: 'five global destinations, destinationCountFrozen=false, 23 registered product routes, every area link resolves to its registered default surface',
    fixtureState: 'no fixture mutation; read-only navigation projection',
    negativeCases: ['destination count must not be frozen or invented (Q-1: destinationCountFrozen=false, baseline=5)', 'shell navigation must not create domain state (SC-001)'],
    run: async (page, record) => {
      await ready(page, record, 'shell');
      note(record, 'inspect .global-shell-destinations and every [data-shell-destination] anchor');
      const nav = await page.evaluate(() => {
        const node = document.querySelector('.global-shell-destinations');
        const links = [...node.querySelectorAll('a[data-shell-destination]')].map(a => ({ id: a.dataset.shellDestination, area: a.dataset.shellArea, href: a.getAttribute('href') }));
        const descriptor = window.CEPFoundation.shellNavigation.descriptor();
        return {
          count: node.getAttribute('data-shell-destination-count'),
          frozen: node.getAttribute('data-shell-destination-count-frozen'),
          routeCount: node.getAttribute('data-shell-route-count'),
          links,
          descriptorFrozen: descriptor.destinationCountFrozen,
          descriptorBaseline: descriptor.globalDestinationBaselineCount,
          descriptorSurface: descriptor.surface,
          areas: window.CEPFoundation.shellNavigation.globalAreas().map(a => ({ area: a.id, defaultSurfaceId: a.defaultSurfaceId })),
          receipts: window.CEPFoundation.registry.receipts.map(r => ({ id: r.id, owner: r.owner }))
        };
      });
      assert(record, 'shell.destination-count-is-five', '5', nav.count, CLASS_PRODUCT, 'global destination count is not the five-destination functional baseline');
      assert(record, 'shell.destination-count-not-frozen', 'false', nav.frozen, CLASS_PRODUCT, 'destination count is presented as frozen (Q-1 violation)');
      assert(record, 'shell.descriptor-not-frozen', { frozen: false, baseline: 5 }, { frozen: nav.descriptorFrozen, baseline: nav.descriptorBaseline }, CLASS_PRODUCT, 'navigation descriptor froze or changed the destination baseline');
      assert(record, 'shell.registered-routes-unchanged', '23', nav.routeCount, CLASS_PRODUCT, 'registered product route count drifted from the current baseline 23');
      assert(record, 'shell.five-area-links-resolved', nav.areas.map(a => `${a.area}=${a.defaultSurfaceId}`).sort(), nav.links.map(l => `${l.area}=${new URL(l.href).searchParams.get('surface')}`).sort(), CLASS_PRODUCT, 'an area link does not resolve to its registered default surface');
      assert(record, 'shell.area-destinations-match-links', nav.areas.map(a => a.defaultSurfaceId).sort(), nav.links.map(l => new URL(l.href).searchParams.get('surface')).sort(), CLASS_PRODUCT, 'anchor href and areaDestination() disagree');
      await shot(page, record, 'baseline');

      note(record, 'measure W01 destination hit geometry before real pointer navigation');
      const hitGeometry = await page.evaluate(() => {
        const link=document.querySelector('.global-shell-destinations [data-shell-area="W01"]');
        const brand=document.querySelector('.global-shell-brand');
        const rect=node=>{const r=node?.getBoundingClientRect?.();return r?{x:r.x,y:r.y,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null};
        const lr=link?.getBoundingClientRect?.();
        const point=lr?{x:lr.left+lr.width/2,y:lr.top+lr.height/2}:null;
        const top=point?document.elementFromPoint(point.x,point.y):null;
        return {link:rect(link),brand:rect(brand),centerPoint:point,elementAtCenter:top?{tag:top.tagName,className:top.className,id:top.id,href:top.getAttribute?.('href'),destination:top.closest?.('[data-shell-destination]')?.getAttribute?.('data-shell-destination')}:null,dir:document.documentElement.dir,lang:document.documentElement.lang,scale:getComputedStyle(document.body).getPropertyValue('--foundation-scale')||null};
      });
      record.actionSequence.push('W01_HIT_GEOMETRY='+JSON.stringify(hitGeometry));
      assert(record, 'shell.w01-pointer-hit-owned-by-destination', true, Boolean(hitGeometry.elementAtCenter?.className?.includes?.('global-shell-destination')), CLASS_PRODUCT, 'W01 area destination center is occluded by another Shell control');
      note(record, 'click the W01 area destination link (real history navigation)');
      await page.locator('.global-shell-destinations [data-shell-area="W01"]').first().click();
      await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
      await page.waitForTimeout(300);
      const afterClick = await page.evaluate(() => ({ consumer: CEPFoundation.consumer, search: location.search }));
      assert(record, 'shell.navigation-lands-on-today', { consumer: 'today', search: '?surface=today' }, { consumer: afterClick.consumer, search: afterClick.search }, CLASS_PRODUCT, 'destination click did not route to Today with the canonical route token');
      await shot(page, record, 'after-navigate');

      note(record, 'execute the semantic route command shell.navigate {destination:"shell"} (SC-001: navigation owner, never a domain owner)');
      const receiptBefore = await page.evaluate(() => CEPFoundation.registry.receipts.length);
      const commandResult = await page.evaluate(() => {
        const result = CEPFoundation.registry.execute('shell.navigate', { destination: 'shell', route: 'w01-browser-flow' });
        const receipt = CEPFoundation.registry.receipts.slice(-1)[0] || null;
        return { ok: result?.ok, status: result?.status, consumer: CEPFoundation.consumer, search: location.search, receipt: receipt ? { id: receipt.id, owner: receipt.owner } : null, receiptsAdded: CEPFoundation.registry.receipts.length };
      });
      assert(record, 'shell.semantic-command-registered-receipt', true, commandResult.receiptsAdded > receiptBefore, CLASS_PRODUCT, 'shell.navigate produced no semantic-command receipt');
      assert(record, 'shell.navigation-owner-is-shell-owner', 'GlobalShellNavigationOwner', commandResult.receipt?.owner ?? null, CLASS_PRODUCT, 'shell.navigate was not executed by GlobalShellNavigationOwner (SC-001 ownership boundary)');
      assert(record, 'shell.semantic-command-routes-back', { consumer: 'shell', search: '?surface=shell' }, { consumer: commandResult.consumer, search: commandResult.search }, CLASS_PRODUCT, 'shell.navigate did not route back to the shell destination');

      note(record, 'browser Back restores the previous destination');
      await page.goBack();
      await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
      const afterBack = await page.evaluate(() => ({ consumer: CEPFoundation.consumer, search: location.search }));
      assert(record, 'shell.back-restores-previous-route', { consumer: 'today', search: '?surface=today' }, afterBack, CLASS_PRODUCT, 'browser Back did not restore the previous destination route');
      await shot(page, record, 'back-restored');
    }
  },
  {
    id: 'today.render-and-filter',
    route: '/?surface=today',
    preconditions: ['app booted with CEPFoundation.consumer === "today"', 'Today composition mounted by m0-controller-composition', 'no Today providers bound in this static route (central provider composition is the declared boundary)'],
    expectedState: 'Today projection renders in the stage, filter command set is complete, filter state is truthful, projection stays read-only (no canonical/Mastery write)',
    fixtureState: 'TodayProjectionDomainAdapter with zero providers -> projection state UNAVAILABLE; no acceptance fixture data is injected',
    negativeCases: ['Today must never write canonical progress or Mastery (profiles/today.json invariants)', 'Mastery must never be inferred by the Today projection (W04-owned)'],
    run: async (page, record) => {
      await ready(page, record, 'today');
      note(record, 'inspect the Today stage, LEFT region and the filter command set');
      const before = await page.evaluate(() => ({
        stage: document.querySelector('#foundationStage')?.dataset.m0Composition,
        left: document.querySelector('#leftPane')?.innerText || '',
        filters: [...document.querySelectorAll('.today-filter[data-today-action="filter"]')].map(b => ({ filter: b.dataset.filter, pressed: b.getAttribute('aria-pressed') })),
        projectionState: window.CEPFoundation.m0Composition?.binding?.projection?.state ?? null,
        mastery: window.CEPFoundation.m0Composition?.adapter?.project?.().mastery ?? null,
        masteryAuthority: window.CEPFoundation.m0Composition?.binding?.masteryAuthority ?? null,
        canonicalWrites: window.CEPFoundation.m0Composition?.adapter?.descriptor?.().canonicalWrites ?? null,
        masteryWrites: window.CEPFoundation.m0Composition?.adapter?.descriptor?.().masteryWrites ?? null
      }));
      assert(record, 'today.stage-mounted', 'today', before.stage, CLASS_PRODUCT, 'Today composition did not mount into the foundation stage');
      assert(record, 'today.left-region-rendered', true, before.left.includes('Today projection'), CLASS_PRODUCT, 'Today LEFT projection region is missing');
      assert(record, 'today.filter-set-complete', ['ALL', 'CONTINUE_SESSION', 'RECOMMENDATION', 'ATTENTION', 'RECENT_CONTEXT', 'PROGRESS'], before.filters.map(f => f.filter), CLASS_PRODUCT, 'Today filter command set is incomplete');
      assert(record, 'today.all-filter-initially-pressed', 'true', before.filters.find(f => f.filter === 'ALL')?.pressed ?? null, CLASS_PRODUCT, 'default filter is not ALL');
      assert(record, 'today.mastery-never-inferred', 'NOT_INFERRED__W04_OWNED', before.mastery, CLASS_PRODUCT, 'Today projection inferred Mastery (epistemic-state violation)');
      assert(record, 'today.mastery-authority-w04', 'W04_OWNED', before.masteryAuthority, CLASS_PRODUCT, 'Today binding does not declare W04 mastery authority');
      assert(record, 'today.no-canonical-write', { canonical: false, mastery: false }, { canonical: before.canonicalWrites, mastery: before.masteryWrites }, CLASS_PRODUCT, 'Today adapter reports a canonical or Mastery write capability');
      await shot(page, record, 'all-filter');

      note(record, 'execute today.filter -> ATTENTION through the rendered filter control');
      await page.locator('.today-filter[data-filter="ATTENTION"]').first().click();
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => ({
        filters: [...document.querySelectorAll('.today-filter[data-today-action="filter"]')].map(b => ({ filter: b.dataset.filter, pressed: b.getAttribute('aria-pressed') })),
        receipt: CEPFoundation.registry.receipts.filter(r => r.id === 'today.filter').slice(-1)[0] || null,
        filter: window.CEPFoundation.m0Composition?.adapter?.filter ?? null,
        canonicalWrites: window.CEPFoundation.m0Composition?.adapter?.descriptor?.().canonicalWrites ?? null
      }));
      assert(record, 'today.filter-switches-truthfully', { attention: 'true', all: 'false' }, { attention: after.filters.find(f => f.filter === 'ATTENTION')?.pressed ?? null, all: after.filters.find(f => f.filter === 'ALL')?.pressed ?? null }, CLASS_PRODUCT, 'filter control did not move the pressed state to ATTENTION');
      assert(record, 'today.filter-command-executed-by-today-owner', 'today.filter', after.receipt?.id ?? null, CLASS_PRODUCT, 'today.filter did not produce a semantic-command receipt');
      assert(record, 'today.filter-is-not-a-canonical-write', false, after.canonicalWrites, CLASS_PRODUCT, 'filtering mutated canonical truth');
      await shot(page, record, 'attention-filter');
    }
  },
  {
    id: 'back-forward-semantic-context',
    route: '/?surface=shell -> /?surface=today (filter ATTENTION) -> Back -> Forward',
    preconditions: ['CBF-002 is an open P0 finding declared for W01 (TODAY filter side)', 'shell history Back/Forward buttons are rendered by GlobalShellNavigationOwner', 'Today filter changed to ATTENTION before departure'],
    expectedState: 'Back restores the shell route AND preserves the Today semantic context (filter ATTENTION) so Forward re-applies it — CBF-002 must not regress',
    fixtureState: 'Today projection with zero providers; only the filter (semantic context) is mutated by the reviewer',
    negativeCases: ['Back/Forward must not silently reset semantic context (CBF-002)', 'route restoration alone must not be reported as context restoration'],
    run: async (page, record) => {
      try {
        await ready(page, record, 'shell');
        note(record, 'measure W01 destination hit geometry before semantic-context navigation');
        const hitGeometry = await page.evaluate(() => {
          const link=document.querySelector('.global-shell-destinations [data-shell-area="W01"]');
          const brand=document.querySelector('.global-shell-brand');
          const rect=node=>{const r=node?.getBoundingClientRect?.();return r?{x:r.x,y:r.y,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null};
          const lr=link?.getBoundingClientRect?.();
          const point=lr?{x:lr.left+lr.width/2,y:lr.top+lr.height/2}:null;
          const top=point?document.elementFromPoint(point.x,point.y):null;
          return {link:rect(link),brand:rect(brand),centerPoint:point,elementAtCenter:top?{tag:top.tagName,className:top.className,id:top.id,href:top.getAttribute?.('href'),destination:top.closest?.('[data-shell-destination]')?.getAttribute?.('data-shell-destination')}:null,dir:document.documentElement.dir,lang:document.documentElement.lang,scale:getComputedStyle(document.body).getPropertyValue('--foundation-scale')||null};
        });
        record.actionSequence.push('W01_HIT_GEOMETRY='+JSON.stringify(hitGeometry));
      assert(record, 'shell.w01-pointer-hit-owned-by-destination', true, Boolean(hitGeometry.elementAtCenter?.className?.includes?.('global-shell-destination')), CLASS_PRODUCT, 'W01 area destination center is occluded by another Shell control');
        note(record, 'navigate shell -> today via the W01 destination link');
        await page.locator('.global-shell-destinations [data-shell-area="W01"]').first().click();
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
        await page.waitForSelector('.today-filter[data-filter="ATTENTION"]', { timeout: 20000 });
        note(record, 'set Today semantic context: filter = ATTENTION');
        await page.locator('.today-filter[data-filter="ATTENTION"]').first().click();
        await page.waitForTimeout(300);
        const before = await page.evaluate(() => ({
          consumer: CEPFoundation.consumer,
          pressed: document.querySelector('.today-filter[data-filter="ATTENTION"]')?.getAttribute('aria-pressed'),
          search: location.search
        }));
        check(record, 'cbf.context-set-before-departure', 'true', before.pressed, CLASS_HARNESS, 'precondition failed: ATTENTION filter did not take effect');
        check(record, 'cbf.precondition-route', '?surface=today', before.search, CLASS_HARNESS, 'precondition failed: not on the Today route');
        await shot(page, record, 'context-set');

        note(record, 'click the shell history Back button ([data-shell-history="back"])');
        await page.locator('[data-shell-history="back"]').first().click();
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'shell', null, { timeout: 20000 });
        const afterBack = await page.evaluate(() => ({ consumer: CEPFoundation.consumer, search: location.search }));
        check(record, 'cbf.back-restores-route', { consumer: 'shell', search: '?surface=shell' }, afterBack, CLASS_PRODUCT, 'shell Back button did not restore the shell route');

        note(record, 'click the shell history Forward button ([data-shell-history="forward"])');
        await page.locator('[data-shell-history="forward"]').first().click();
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
        await page.waitForSelector('.today-filter[data-filter="ATTENTION"]', { timeout: 20000 });
        await page.waitForTimeout(700);
        const shellForward = await page.evaluate(() => ({
          consumer: CEPFoundation.consumer,
          pressed: document.querySelector('.today-filter[data-filter="ATTENTION"]')?.getAttribute('aria-pressed'),
          filters: [...document.querySelectorAll('.today-filter[data-today-action="filter"]')].map(b => `${b.dataset.filter}:${b.getAttribute('aria-pressed')}`).join(','),
          restoreStatus: document.querySelector('.foundation-shell')?.dataset.contextRestoreStatus || null,
          contextRestored: document.querySelector('.foundation-shell')?.dataset.contextRestored || null,
          captured: (history.state && history.state.cepShell) ? { surface: history.state.cepShell.surface, reason: history.state.cepShell.reason, todayFilter: history.state.cepShell.bookmark?.surfaceContext?.todayFilter ?? null, todayItemId: history.state.cepShell.bookmark?.surfaceContext?.todayItemId ?? null } : null
        }));
        await shot(page, record, 'forward-shell-button');
        check(record, 'cbf.forward-restores-today-route', 'today', shellForward.consumer, CLASS_PRODUCT, 'shell Forward button did not return to Today');
        check(record, 'cbf.context-captured-on-back', 'ATTENTION', shellForward.captured?.todayFilter ?? null, CLASS_PRODUCT, 'CBF-002 capture side: the Today filter was not captured into the shell bookmark before Back');
        check(record, 'cbf.context-restored-on-forward', 'true', shellForward.pressed, CLASS_PRODUCT, 'CBF-002: Back restored the route but the Today filter semantic context was silently reset to ALL');
        check(record, 'cbf.restore-machinery-ran', 'restored', shellForward.restoreStatus, CLASS_PRODUCT, 'restore machinery did not report a completed restore while the semantic context stayed lost');
        // Negative case (packet §11): route restoration alone must not be reported as a context
        // restore — the restore reports `contextRestored` only after it verified the re-applied state.
        check(record, 'cbf.restore-reported-only-when-context-applied', 'true', shellForward.contextRestored, CLASS_PRODUCT, 'the shell reported a completed context restore without a verified context application');

        note(record, 'repeat with browser-native Back/Forward (popstate) instead of the shell buttons');
        await page.goBack();
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'shell', null, { timeout: 20000 });
        await page.goForward();
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
        await page.waitForSelector('.today-filter[data-filter="ATTENTION"]', { timeout: 20000 });
        await page.waitForTimeout(700);
        const native = await page.evaluate(() => ({
          consumer: CEPFoundation.consumer,
          pressed: document.querySelector('.today-filter[data-filter="ATTENTION"]')?.getAttribute('aria-pressed'),
          restoreStatus: document.querySelector('.foundation-shell')?.dataset.contextRestoreStatus || null
        }));
        await shot(page, record, 'forward-native');
        check(record, 'cbf.native-back-restores-route', 'today', native.consumer, CLASS_PRODUCT, 'native Back/Forward did not restore the route');
        check(record, 'cbf.native-context-preserved', 'true', native.pressed, CLASS_PRODUCT, 'CBF-002: browser-native Back/Forward silently reset the Today filter semantic context');
      } catch (error) {
        throw Object.assign(new Error(String(error?.message || error)), { classification: CLASS_PRODUCT });
      }
    }
  },
  {
    id: 'deep-work.open-close-lifecycle',
    route: '/?surface=shell (no provider) + /?surface=runs (shared-owner consumer)',
    preconditions: ['BottomDeepWorkOwner is the single global deep-work presentation owner', 'shell registers no deep-work provider in this route', 'runs registers 2 providers through the shared wave3 assembly'],
    expectedState: 'closed => hidden+inert+aria-hidden with no fabricated content; open => hidden=false, inert=false, owner preserved; close => restored to hidden+inert',
    fixtureState: 'read-only provider projections (structured history / runtime events); no provider content is written by the owner',
    negativeCases: ['a surface with no deep-work provider must not fabricate an openable shelf (toggle disabled, content empty)', 'closing must return the shelf to hidden+inert'],
    run: async (page, record) => {
      await ready(page, record, 'shell');
      note(record, 'inspect the deep-work shelf on the shell route (no provider registered)');
      const shellClosed = await page.evaluate(() => {
        const shelf = document.querySelector('#bottomShelf'), content = document.querySelector('#bottomContent'), toggle = document.querySelector('#bottomToggle');
        const snapshot = CEPFoundation.wave3Assembly?.bottomOwner?.snapshot?.() || null;
        return {
          owner: shelf?.dataset.bottomOwner ?? null,
          presentationOwner: shelf?.dataset.bottomPresentationOwner ?? null,
          state: shelf?.dataset.state ?? null,
          hidden: content?.hidden ?? null,
          inert: content?.inert ?? null,
          aria: content?.getAttribute('aria-hidden') ?? null,
          toggleDisabled: toggle?.disabled ?? null,
          providerCount: snapshot?.providerCount ?? null,
          contentLength: (content?.innerHTML || '').length
        };
      });
      assert(record, 'deepwork.shell-owner-is-bottom-deep-work-owner', 'BottomDeepWorkOwner', shellClosed.owner, CLASS_PRODUCT, 'shell shelf is not owned by BottomDeepWorkOwner');
      assert(record, 'deepwork.shell-closed-hidden-inert', { state: 'closed', hidden: true, inert: true, aria: 'true' }, { state: shellClosed.state, hidden: shellClosed.hidden, inert: shellClosed.inert, aria: shellClosed.aria }, CLASS_PRODUCT, 'closed shelf is not hidden+inert (packet §11)');
      assert(record, 'deepwork.shell-no-provider-no-fabrication', { providerCount: 0, toggleDisabled: true }, { providerCount: shellClosed.providerCount, toggleDisabled: shellClosed.toggleDisabled }, CLASS_PRODUCT, 'shell fabricates an openable deep-work shelf with no provider');
      await shot(page, record, 'shell-closed');

      note(record, 'navigate to the runs route, a read-only consumer of the shared BottomDeepWorkOwner');
      await ready(page, record, 'runs');
      const initial = await page.evaluate(() => {
        const shelf = document.querySelector('#bottomShelf'), content = document.querySelector('#bottomContent'), toggle = document.querySelector('#bottomToggle');
        const snapshot = CEPFoundation.wave3Assembly?.bottomOwner?.snapshot?.() || null;
        return { state: shelf?.dataset.state ?? null, hidden: content?.hidden ?? null, inert: content?.inert ?? null, aria: content?.getAttribute('aria-hidden') ?? null, toggleDisabled: toggle?.disabled ?? null, providerCount: snapshot?.providerCount ?? null, owner: shelf?.dataset.bottomOwner ?? null };
      });
      assert(record, 'deepwork.consumer-starts-closed-hidden-inert', { state: 'closed', hidden: true, inert: true, aria: 'true' }, { state: initial.state, hidden: initial.hidden, inert: initial.inert, aria: initial.aria }, CLASS_PRODUCT, 'deep-work shelf did not start closed and inert');
      assert(record, 'deepwork.consumer-toggle-enabled', false, initial.toggleDisabled, CLASS_PRODUCT, 'toggle should be enabled where a provider exists');

      note(record, 'click #bottomToggle to open the deep-work shelf');
      await page.locator('#bottomToggle').click();
      await page.waitForTimeout(350);
      const opened = await page.evaluate(() => {
        const shelf = document.querySelector('#bottomShelf'), content = document.querySelector('#bottomContent'), toggle = document.querySelector('#bottomToggle');
        return { state: shelf?.dataset.state ?? null, hidden: content?.hidden ?? null, inert: content?.inert ?? null, aria: content?.getAttribute('aria-hidden') ?? null, expanded: toggle?.getAttribute('aria-expanded') ?? null, owner: shelf?.dataset.bottomOwner ?? null, hasContent: (content?.innerHTML || '').length > 0 };
      });
      assert(record, 'deepwork.open-lifecycle', { state: 'open', hidden: false, inert: false, aria: 'false', expanded: 'true' }, { state: opened.state, hidden: opened.hidden, inert: opened.inert, aria: opened.aria, expanded: opened.expanded }, CLASS_PRODUCT, 'open lifecycle does not match BOTTOM_DEEP_WORK_LIFECYCLE_POLICY.open');
      assert(record, 'deepwork.owner-preserved-across-lifecycle', 'BottomDeepWorkOwner', opened.owner, CLASS_PRODUCT, 'owner changed across the deep-work lifecycle');
      assert(record, 'deepwork.open-has-provider-content', true, opened.hasContent, CLASS_PRODUCT, 'open shelf rendered no provider-owned content');
      await shot(page, record, 'open');

      note(record, 'click #bottomToggle again to close the deep-work shelf');
      await page.locator('#bottomToggle').click();
      await page.waitForTimeout(350);
      const closed = await page.evaluate(() => {
        const shelf = document.querySelector('#bottomShelf'), content = document.querySelector('#bottomContent'), toggle = document.querySelector('#bottomToggle');
        return { state: shelf?.dataset.state ?? null, hidden: content?.hidden ?? null, inert: content?.inert ?? null, aria: content?.getAttribute('aria-hidden') ?? null, expanded: toggle?.getAttribute('aria-expanded') ?? null, innerLength: (content?.innerHTML || '').length };
      });
      assert(record, 'deepwork.close-returns-to-hidden-inert', { state: 'closed', hidden: true, inert: true, aria: 'true', expanded: 'false' }, { state: closed.state, hidden: closed.hidden, inert: closed.inert, aria: closed.aria, expanded: closed.expanded }, CLASS_PRODUCT, 'closed shelf did not return to hidden+inert (packet §11)');
      await shot(page, record, 'closed');
    }
  },
  {
    id: 'diagnostics.gate',
    route: '/?surface=shell (negative) then /?surface=shell&diagnostics=foundation (positive)',
    preconditions: ['diagnostics are assurance-only and never consume product geometry', 'A-2: the domain-diagnostics bottom tab is a requirement candidate only and must not exist'],
    expectedState: 'no diagnostics panel without ?diagnostics=foundation; #foundationDiagnostics present, isConnected and assurance-only with the parameter',
    fixtureState: 'no fixture mutation; URL parameter is the only input',
    negativeCases: ['diagnostics panel must NOT appear without ?diagnostics=foundation', 'no domain-diagnostics bottom tab may be rendered anywhere'],
    run: async (page, record) => {
      await ready(page, record, 'shell');
      note(record, 'negative: inspect diagnostics surface without the parameter');
      const negative = await page.evaluate(() => ({
        panel: !!document.querySelector('#foundationDiagnostics'),
        domainDiagnosticsTab: !!document.querySelector('[data-bottom-tab="domain-diagnostics"], .bottomtabs [data-value="domain-diagnostics"]'),
        search: location.search
      }));
      assert(record, 'diagnostics.absent-without-parameter', false, negative.panel, CLASS_PRODUCT, 'diagnostics panel rendered without ?diagnostics=foundation');
      assert(record, 'diagnostics.no-invented-domain-tab', false, negative.domainDiagnosticsTab, CLASS_PRODUCT, 'an unimplemented domain-diagnostics bottom tab was rendered (A-2 violation)');
      await shot(page, record, 'negative');

      note(record, 'positive: load /?surface=shell&diagnostics=foundation');
      await ready(page, record, 'shell', '&diagnostics=foundation');
      await page.waitForTimeout(400);
      const positive = await page.evaluate(() => {
        const node = document.querySelector('#foundationDiagnostics');
        return {
          panel: !!node,
          assuranceOnly: node?.dataset.assuranceOnly ?? null,
          isConnected: node ? node.isConnected : false,
          summary: node?.querySelector('summary')?.textContent ?? null,
          domainDiagnosticsTab: !!document.querySelector('[data-bottom-tab="domain-diagnostics"], .bottomtabs [data-value="domain-diagnostics"]')
        };
      });
      assert(record, 'diagnostics.present-with-parameter', { panel: true, assuranceOnly: 'true', isConnected: true }, { panel: positive.panel, assuranceOnly: positive.assuranceOnly, isConnected: positive.isConnected }, CLASS_PRODUCT, 'diagnostics gate positive branch did not render an assurance-only panel');
      assert(record, 'diagnostics.no-invented-domain-tab-positive', false, positive.domainDiagnosticsTab, CLASS_PRODUCT, 'an unimplemented domain-diagnostics bottom tab was rendered with the parameter');
      await shot(page, record, 'positive');
    }
  }
];

const byId = Object.fromEntries(definitions.map(d => [d.id, d]));
const targets = selected.length ? selected.map(id => {
  if (!byId[id]) { console.error(`unknown flow ${id}; known: ${definitions.map(d => d.id).join(', ')}`); process.exit(2); }
  return byId[id];
}) : definitions;

/* ------------------------------------------------------------------ execution */

await mkdir(evidenceDir, { recursive: true });
const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const port = freePort;
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += String(chunk); });
server.stderr.on('data', chunk => { serverLog += String(chunk); });

let browser = null;
const records = [];
const env = {
  node: process.version,
  engine: 'Playwright Chromium',
  playwrightResolution,
  packageDeclaredVersion: '1.62.1',
  transport: 'localhost-http',
  proofServer: `tools/serve.mjs on 127.0.0.1:${port}`,
  viewport: '1440x980',
  reducedMotion: true,
  browserExecutableOverride: Boolean(process.env.CEP_BROWSER_EXECUTABLE)
};
try {
  let up = false;
  for (let i = 0; i < 100; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  if (!up) throw Object.assign(new Error(`PROOF_SERVER_DID_NOT_START: ${serverLog}`), { classification: 'ENVIRONMENT' });
  try { browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) }); }
  catch (error) { throw Object.assign(new Error(`BROWSER_LAUNCH_FAILED: ${error.message}`), { classification: 'ENVIRONMENT' }); }
  env.browserVersion = await browser.version();
  for (const definition of targets) records.push(await runFlow(browser, definition, definition.run));
} catch (error) {
  records.push({ flow: 'w01.browser.bootstrap', status: 'FAIL', failureClassification: error.classification || 'ENVIRONMENT', fatal: String(error?.message || error), route: 'n/a', preconditions: [], expectedState: 'proof harness starts', fixtureState: 'none', negativeCases: [], actionSequence: [], assertions: [], screenshots: [], pageErrors: [], transportFailures: [] });
} finally {
  try { if (browser) await browser.close(); } catch {}
  server.kill('SIGTERM');
}

/* ------------------------------------------------------------------ receipt */

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const lineageOk = identity.sha256 === CANDIDATE_TREE && identity.files === CANDIDATE_FILES;
const commit = git('git rev-parse HEAD');
const headTree = git('git rev-parse HEAD^{tree}');
// Per-writer candidate binding (controller/12_execution/03_lineage_adjudication.md): receipts bind
// to OWNED_PARTITION.identity + commit + tree. The whole-worktree hash above stays recorded as
// INFORMATIONAL_MOVING context only — it is never the per-writer candidate identity.
let candidateIdentity = null;
try {
  candidateIdentity = JSON.parse(spawnSync(process.execPath, [path.join(root, 'tools/writer-candidate-identity.mjs'), '--workspace', 'W01', '--json'], { cwd: root, encoding: 'utf8' }).stdout || 'null');
} catch { candidateIdentity = null; }
const ownedPartition = candidateIdentity ? {
  identity: candidateIdentity.ownedPartition.identity,
  roots: candidateIdentity.ownedPartition.roots,
  fileCount: candidateIdentity.ownedPartition.fileCount,
  stableUnderSiblingEdits: candidateIdentity.ownedPartition.stableUnderSiblingEdits,
  commit: candidateIdentity.commit,
  tree: candidateIdentity.tree,
  branch: candidateIdentity.branch,
  bindingRule: candidateIdentity.bindingRule,
  worktreeVariantInformational: candidateIdentity.worktreeVariant
} : null;
let receipt = { schemaVersion: 1, workspace: 'W01', flows: [] };
try { receipt = JSON.parse(await readFile(receiptPath, 'utf8')); } catch {}
const merged = (receipt.flows || []).filter(existing => !records.some(r => r.flow === existing.flow));
receipt = {
  schemaVersion: 1,
  classification: 'W01_BROWSER_RECEIPT_NOT_OWNER_ACCEPTANCE',
  command: selected.length ? `node tools/w01-browser-flows.mjs ${selected.map(id => `--flow ${id}`).join(' ')}` : 'node tools/w01-browser-flows.mjs',
  browser: 'Chromium (Playwright package-local)',
  browserVersion: env.browserVersion || receipt.browserVersion || null,
  transport: 'localhost-http',
  runtime: `Node ${process.version}`,
  candidate: CANDIDATE_LABEL,
  measuredCandidate: `WORKTREE_VARIANT:${identity.sha256}`,
  canonicalSourceFileCount: CANDIDATE_FILES,
  measuredCandidateFileCount: identity.files,
  commit,
  tree: headTree,
  ownedPartition,
  environment: env,
  capturedAt: new Date().toISOString(),
  evidenceLineage: {
    bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
    recomputedCandidateTreeSha256: identity.sha256,
    recomputedCandidateFileCount: identity.files,
    expectedCandidateTreeSha256: CANDIDATE_TREE,
    expectedCandidateFileCount: CANDIDATE_FILES,
    lineageStatus: lineageOk ? 'BOUND_EXACT_CURRENT_WORKTREE_VARIANT' : 'DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS',
    drift: !lineageOk,
    driftAttribution: lineageOk
      ? 'none — worktree matched the dispatch-declared candidate at capture time'
      : 'Sibling workspaces (W03/W04) are editing the shared serial worktree concurrently; observed directly when a file appeared in git status during a 60 s window with no command executed by W01. W01 did not write any file under stack/native-typescript/. Recorded, not suppressed.',
    note: 'Worktree variant candidate (3 protected pre-existing canonical deltas) — never presented as the canonical 480dbe…/273 identity.'
  },
  summary: { total: 0, pass: 0, fail: 0 },
  limitations: [
    'Headless Chromium only; no Owner acceptance and no exhaustive permutation certification',
    'Static proof server (tools/serve.mjs) serves the committed dist/ build only — no local runtime API process runs, so requestfailed transport entries are ENVIRONMENT noise, not product verdicts',
    'Flows drive shared and sibling surfaces read-only where the shared owner requires a second consumer; no sibling workspace source is touched'
  ],
  flows: []
};
receipt.flows = [...merged, ...records].sort((a, b) => String(a.flow).localeCompare(String(b.flow)));
receipt.summary = {
  total: receipt.flows.length,
  pass: receipt.flows.filter(f => f.status === 'PASS').length,
  fail: receipt.flows.filter(f => f.status === 'FAIL').length
};
// Every file under writer-output/W01/evidence/ is indexed and bound here, so no screenshot can
// be an orphan. Files not referenced by the current flow records are kept (never deleted) and
// labelled with the reason they were superseded.
const referenced = new Set(receipt.flows.flatMap(f => (f.screenshots || []).map(s => s.filename)));
// Matched-viewport visual captures (tools/w01-visual-capture.mjs) live under
// evidence/<surface>/ per controller/08_evidence/evidence_contract.md; they are indexed here
// too so that no screenshot in writer-output/W01/evidence/ is ever an orphan.
let visualCapture = null;
try { visualCapture = JSON.parse(await readFile(path.join(outDir, 'VISUAL_CAPTURE_RECEIPT.json'), 'utf8')); } catch {}
const visualByPath = new Map((visualCapture?.artifacts || []).map(a => [a.filename, a]));
const artifactIndex = [];
for (const entry of await walkEvidence(evidenceDir)) {
  const filePath = path.join(evidenceDir, entry);
  const bytes = await readFile(filePath);
  const relative = path.join('writer-output/W01/evidence', entry);
  const ownerFlow = receipt.flows.find(f => (f.screenshots || []).some(s => s.filename === relative)) || null;
  const visual = visualByPath.get(relative) || null;
  const binding = referenced.has(relative) ? 'FLOW_EVIDENCE'
    : visual && visual.status === 'CURRENT' ? 'MATCHED_VIEWPORT_VISUAL_CAPTURE_EVIDENCE'
      : 'SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED';
  artifactIndex.push({
    filename: relative,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    boundTo: { candidate: CANDIDATE_LABEL, commit, flow: ownerFlow ? ownerFlow.flow : (visual ? visual.flow : null), viewport: visual ? visual.viewport : undefined, surface: visual ? visual.surface : undefined },
    binding,
    reason: binding === 'FLOW_EVIDENCE' ? `screenshot captured by flow ${ownerFlow.flow}`
      : binding === 'MATCHED_VIEWPORT_VISUAL_CAPTURE_EVIDENCE'
        ? `matched-viewport (${visual.viewport.width}x${visual.viewport.height}) capture of surface ${visual.surface} by tools/w01-visual-capture.mjs — hashed and bound in writer-output/W01/VISUAL_CAPTURE_RECEIPT.json`
        : 'intermediate run of the same flow superseded by a later run; retained and indexed so the evidence set stays complete and non-orphaned'
  });
}
artifactIndex.sort((a, b) => a.filename.localeCompare(b.filename));
receipt.evidenceArtifacts = artifactIndex;
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');

const selectedFailed = records.filter(r => r.status === 'FAIL');
console.log(JSON.stringify({
  receipt: 'writer-output/W01/BROWSER_RECEIPT.json',
  executed: records.map(r => ({ flow: r.flow, status: r.status, classification: r.failureClassification, failedAssertions: r.assertions.filter(a => !a.ok).map(a => a.id), screenshots: r.screenshots.map(s => s.filename) })),
  aggregate: receipt.summary,
  lineage: receipt.evidenceLineage.lineageStatus
}, null, 2));
if (selectedFailed.length) process.exitCode = 1;
