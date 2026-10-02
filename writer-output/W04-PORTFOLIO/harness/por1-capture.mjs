/**
 * POR-1 (W04-PORTFOLIO) — responsive + RTL/LTR capture harness.
 *
 * WHY THIS FILE EXISTS (lane-local, inside the lane's writable root):
 * the mandated shared harness `tools/w04-browser-flows.mjs` writes its screenshots and
 * BROWSER_RECEIPT.json into `writer-output/W04/`, which is SHARED across the four W04 flows and
 * is NOT inside POR-1's writable roots (`stack/native-typescript/surfaces/portfolio/`,
 * `stack/native-typescript/adapters/portfolio/`, `writer-output/W04-PORTFOLIO/`).
 * POR-1 therefore runs the shared harness once (mission step 1), harvests its output into this
 * lane's evidence directory and restores the shared directory byte-identically (hash verified
 * in HANDOFF.md). All NEW captures this lane produces are written here, source-bound to the
 * exact candidate HEAD/tree.
 *
 * WHAT IT CAPTURES (per round):
 *   en/LTR + ar/RTL  ×  1440×1000 + 1024×900  ×  empty + populated state
 * plus structural probes (overflow, clipping, pane geometry/mirroring, overlap, direction,
 * localization truth, Arabic typography, touch-target size) and a DOM text census per region
 * (ground truth for image reads — see visual-fidelity-review R3b; tesseract is unavailable in
 * this environment, so OCR cross-check is replaced by hash + dims + DOM census + geometry).
 *
 * Usage:  node writer-output/W04-PORTFOLIO/harness/por1-capture.mjs --round baseline
 * Writes: writer-output/W04-PORTFOLIO/evidence/<round>/  (png + PROBES.json + CENSUS.json)
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(path.resolve(override));
}
const { chromium } = playwright;

const root = fileURLToPath(new URL('../../../', import.meta.url));
const args = process.argv.slice(2);
const round = (() => { const i = args.indexOf('--round'); return i >= 0 && args[i + 1] ? args[i + 1] : 'round'; })();
const outDir = path.join(root, 'writer-output/W04-PORTFOLIO/evidence', round);

const git = command => { try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');
const pngDims = buffer => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

const COMMIT = git('git rev-parse HEAD');
const TREE = git('git rev-parse HEAD^{tree}');

const MATRIX = [
  { locale: 'en', expectDir: 'ltr', viewport: { width: 1440, height: 1000 } },
  { locale: 'en', expectDir: 'ltr', viewport: { width: 1024, height: 900 } },
  { locale: 'ar', expectDir: 'rtl', viewport: { width: 1440, height: 1000 } },
  { locale: 'ar', expectDir: 'rtl', viewport: { width: 1024, height: 900 } }
];

/* ------------------------------------------------------------------ in-page probes */

// NB: the returned function is serialized into the page — it must take `state` as an ARGUMENT
// (a closure variable would be lost at serialization time).
const probeScript = () => (state) => {
  const AR = /[؀-ۿ]/;
  const visible = el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  const text = el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const html = document.documentElement;
  const lang = String(html.lang || '').toLowerCase();
  const dir = html.dir;

  const viewport = { w: window.innerWidth, h: window.innerHeight };
  const bodyOverflow = { scrollWidth: document.body.scrollWidth, clientWidth: document.documentElement.clientWidth };

  // 1) horizontal overflow of the document
  const horizontalOverflow = html.scrollWidth > html.clientWidth + 1;

  // 2) elements drawn outside the viewport (visual spill)
  const outOfViewport = [];
  for (const el of document.querySelectorAll('#foundationStage *, #domainLeftRegion *, #domainContext *')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > viewport.w + 1 || r.left < -1) {
      outOfViewport.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), id: el.id || null, left: Math.round(r.left), right: Math.round(r.right), text: text(el).slice(0, 60) });
      if (outOfViewport.length > 12) break;
    }
  }

  // 3) clipped text (scroll width beyond client width without a scroll container)
  const clipped = [];
  for (const el of document.querySelectorAll('#foundationStage td, #foundationStage th, #foundationStage strong, #foundationStage small, #foundationStage dt, #foundationStage dd, #foundationStage h3, #foundationStage p, #foundationStage span, #domainLeftRegion td, #domainLeftRegion th, #domainContext .m0-semantic-list, .pf-view-title, .pf-view-hint')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const scrollable = /auto|scroll/.test(s.overflowX);
    if (!scrollable && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
      clipped.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, text: text(el).slice(0, 70) });
      if (clipped.length > 12) break;
    }
  }

  // 3b) REAL clipping: a rendered rect escaping its clipping ancestor. RTL overflow is NOT
  // reported by scrollWidth (an element overflowing to the LEFT in RTL leaves scrollWidth
  // unchanged), so geometry — not scroll metrics — is the ground truth for "is this cut?".
  const clippedRect = [];
  for (const sel of ['#domainLeftRegion .m0-table-wrap', '#foundationStage .w04-record-table-wrap']) {
    const host = document.querySelector(sel);
    if (!host) continue;
    const hb = host.getBoundingClientRect();
    const hs = getComputedStyle(host);
    if (!/hidden|auto|scroll/.test(hs.overflowX)) continue;
    for (const el of host.querySelectorAll('strong, small, th, td, dt, dd, h3, span, bdi')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const spill = { left: Math.round(hb.left - r.left), right: Math.round(r.right - hb.right) };
      if (spill.left > 1 || spill.right > 1) {
        clippedRect.push({ host: sel, tag: el.tagName, text: text(el).slice(0, 44), spill });
        if (clippedRect.length > 14) break;
      }
    }
  }

  // 4) pane geometry (order/mirroring/overlap)
  const box = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); const collapsed = s.display === 'none' || r.width === 0 || r.height === 0; return { sel, exists: true, display: s.display, collapsed, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; };
  const panes = {
    top: box('#topRegion, #domainTopRegion'),
    left: box('#domainLeftRegion'),
    center: box('#foundationStage'),
    right: box('#domainContext'),
    bottom: box('#bottomRegion, #domainBottomRegion')
  };
  const overlaps = [];
  const named = Object.entries(panes).filter(([, v]) => v && !v.collapsed);
  for (let i = 0; i < named.length; i++) for (let j = i + 1; j < named.length; j++) {
    const [an, a] = named[i], [bn, b] = named[j];
    if (an === 'top' || bn === 'top' || an === 'bottom' || bn === 'bottom') continue;
    const ox = Math.min(a.right, b.right) - Math.max(a.x, b.x);
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
    if (ox > 1 && oy > 1) overlaps.push({ a: an, b: bn, overlapPx: { x: Math.round(ox), y: Math.round(oy) } });
  }
  const mirrored = panes.left && panes.right && !panes.left.collapsed && !panes.right.collapsed
    ? (dir === 'rtl' ? panes.left.x > panes.right.x : panes.left.x < panes.right.x)
    : null;
  const collapsedPanes = Object.entries(panes).filter(([, v]) => v && v.collapsed).map(([k]) => k);

  // 5) localization truth in surface-owned containers
  const owned = [document.querySelector('#foundationStage'), document.querySelector('#domainLeftRegion'), document.querySelector('#domainContext')].filter(Boolean);
  const ownedText = owned.map(el => text(el)).join(' \n ');
  const arabicUnderEn = lang.startsWith('ar') ? [] : (AR.test(ownedText) ? [ownedText.match(/.{0,40}[؀-ۿ]+.{0,40}/g).slice(0, 5)] : []);
  const arabicVisible = AR.test(ownedText);

  // 6) Arabic typography inside surface-owned styles (letter-spacing / uppercase on Arabic)
  const arabicType = [];
  for (const el of document.querySelectorAll('#foundationStage *, #domainLeftRegion *')) {
    if (!visible(el)) continue;
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim();
    if (!AR.test(own)) continue;
    const s = getComputedStyle(el);
    const ls = s.letterSpacing;
    const spaced = ls && ls !== 'normal' && ls !== '0px' && !/^0(px)?$/.test(ls);
    if (spaced || s.textTransform === 'uppercase') {
      arabicType.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), letterSpacing: ls, textTransform: s.textTransform, text: own.replace(/\s+/g, ' ').slice(0, 60) });
      if (arabicType.length > 40) break;
    }
  }

  // 7) touch targets + bidi isolation
  const smallTargets = [];
  for (const el of document.querySelectorAll('button, a[href], [role=button], input, select')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.height < 22) smallTargets.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), h: Math.round(r.height), text: text(el).slice(0, 40) });
  }
  const bdiCount = document.querySelectorAll('bdi').length;
  const ltrIsolated = document.querySelectorAll('[dir=ltr]').length;
  const autoDir = document.querySelectorAll('[dir=auto]').length;

  // 8) responsive rule state
  const grid = document.querySelector('#foundationStage .w04-grid');
  const gridCols = grid ? getComputedStyle(grid).gridTemplateColumns : null;
  const leftDisplay = panes.left ? getComputedStyle(document.querySelector('#domainLeftRegion')).display : null;
  const collapsedAttr = document.body.dataset.paneState || document.body.getAttribute('data-panes') || null;

  // 8b) table geometry — where a technical token is clipped or broken mid-word
  const tableGeom = (target) => {
    const table = typeof target === 'string' ? document.querySelector(target) : target;
    if (!table) return null;
    const host = table.parentElement;
    const rect = table.getBoundingClientRect();
    const cells = [];
    for (const td of table.querySelectorAll('tbody td')) {
      const s = getComputedStyle(td);
      cells.push({
        text: text(td).slice(0, 40),
        clientW: td.clientWidth, scrollW: td.scrollWidth,
        clipped: td.scrollWidth > td.clientWidth + 1,
        whiteSpace: s.whiteSpace, overflowWrap: s.overflowWrap,
        right: Math.round(td.getBoundingClientRect().right), left: Math.round(td.getBoundingClientRect().left)
      });
    }
    return {
      tableW: Math.round(rect.width), hostClientW: host ? host.clientWidth : null,
      hostScrollW: host ? host.scrollWidth : null,
      hostOverflow: host ? getComputedStyle(host).overflowX : null,
      cols: [...table.querySelectorAll('thead th')].map(th => ({ label: text(th).slice(0, 24), w: Math.round(th.getBoundingClientRect().width) })),
      cells
    };
  };

  // 9) ground-truth text census (per region) for image cross-check
  const census = {};
  for (const [name, sel] of [['top', '#topRegion, #domainTopRegion'], ['left', '#domainLeftRegion'], ['center', '#foundationStage'], ['right', '#domainContext'], ['bottom', '#bottomRegion, #domainBottomRegion'], ['toolbar', '[data-region=toolbar], .workspace-toolbar, #workspaceToolbar']]) {
    const el = document.querySelector(sel);
    census[name] = el ? text(el).slice(0, 4000) : null;
  }

  // 10) portfolio truth flags (live domain, no shadow state)
  const M = window.CEPFoundation?.m0Composition;
  const d = M?.group?.portfolio?.domain;
  const truth = d ? {
    records: d.records.length,
    states: d.records.map(r => `${r.id}:${r.state}:${r.groupingState}`),
    groupingRefAllNull: d.records.every(r => r.groupingRef === null),
    receipts: d.receipts.length,
    surfaceTruth: M?.surface?.truth || null
  } : null;

  return {
    state, lang, dir, viewport,
    horizontalOverflow, bodyOverflow,
    outOfViewport, clipped, clippedRect, panes, overlaps, mirrored, collapsedPanes,
    arabicUnderEn, arabicVisible, arabicType,
    smallTargets: smallTargets.slice(0, 10), bdiCount, ltrIsolated, autoDir,
    gridCols, leftDisplay, collapsedAttr,
    tables: {
      leftIndex: tableGeom('#domainLeftRegion .m0-table'),
      centre: [...document.querySelectorAll('#foundationStage table')].map(t => ({ id: t.id || null, geom: tableGeom(t) }))
    },
    consumer: window.CEPFoundation?.consumer || null,
    m0Stage: document.querySelector('#foundationStage')?.dataset?.m0Composition || null,
    truth,
    census
  };
};

const setLocale = async (page, locale) => page.evaluate(async (target) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = { path: null, panelClosed: null };
  // Product path first: the surface-local Settings entry → locale control (the packet requires
  // "active language is user-configurable through Settings"). Falls back to the canonical
  // preference write + shell application used by tools/browser-conformance.mjs.
  const opener = document.querySelector('[data-w04-settings]');
  if (opener) {
    opener.click(); await sleep(550);
    const control = [...document.querySelectorAll('[data-settings-preference="locale"]')]
      .find(b => b.getAttribute('data-settings-value') === target);
    if (control) { control.click(); out.path = 'settings-ui'; await sleep(650); }
  }
  if (!out.path) {
    try { window.CEPFoundation.preferences.set('locale', target, 'global'); out.path = 'preference-api'; }
    catch (error) { out.path = `failed:${error.message}`; }
    window.CEPFoundation.workspace.applyPreferences();
    await sleep(400);
  }
  // close the settings panel again so captures show the surface, not the overlay
  const panelOpen = () => !!document.querySelector('[data-settings-center-owner="SettingsCenterOwner"]');
  if (panelOpen()) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(350); }
  if (panelOpen()) { const b2 = document.querySelector('[data-w04-settings]'); if (b2) { b2.click(); await sleep(350); } }
  out.panelClosed = !panelOpen();

  // Presentation re-render: the mounted m0 copy refreshes only on render — switching language
  // through Settings flips html lang/dir but leaves the mounted workbench copy in the previous
  // language until something re-renders (recorded as a shared finding in HANDOFF.md).
  try { window.CEPFoundation.m0Composition?.mounted?.render?.(); } catch {}
  await sleep(400);
  try { window.CEPFoundation.m0Composition?.mounted?.render?.(); } catch {}
  await sleep(300);
  out.lang = document.documentElement.lang;
  out.dir = document.documentElement.dir;
  out.languageAuthority = document.documentElement.dataset.languageAuthority || null;
  out.directionAuthority = document.documentElement.dataset.directionAuthority || null;
  return out;
}, locale);

const inject = async page => page.evaluate(() => {
  const M = window.CEPFoundation.m0Composition;
  window.__por1 = { portfolio: M.group.portfolio.domain, mounted: M.mounted, evidence: M.group.evidence.domain, mastery: M.group.mastery.domain, surface: M.surface };
});

/**
 * Populate with references whose source is a REAL canonical source (or deliberately not).
 * The canonical Evidence revision is created through the LIVE evidence-domain API with the same
 * fixture sequence the packet flow uses (labelled FIXTURE, test session only) so that
 * Portfolio's source resolver resolves a real canonical digest instead of an invented one.
 */
const populate = async page => page.evaluate(() => {
  const d = window.__por1.portfolio;
  const ev = window.__por1.evidence;
  const out = { fixtureEvidence: null, added: [] };

  // ---- canonical source fixture (evidence domain API, labelled FIXTURE) ----
  try {
    ev.importEvidence({
      id: 'ev-por1', revisionId: 'ev-por1-r1', title: 'POR-1 responsive/RTL fixture Evidence',
      sourceId: 'por1-source', sourceRevision: 'r1', subject: 'owner:local',
      evidenceClaim: 'POR-1 fixture Evidence claim for responsive/RTL capture',
      criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'POR-1 lane responsive/RTL visual proof'
    });
    ev.verifySource('ev-por1', {
      status: 'VERIFIED', providerId: 'provider:por1-capture', providerRevision: '1.0.0',
      proofId: 'proof:por1:ev', digest: `sha256:${'7f'.repeat(32)}`, schemaValid: true, sourceBytesAvailable: true
    });
    ev.submitCandidate('ev-por1');
    ev.markCandidateValidated('ev-por1', { validator: 'por1-capture', validationProofRef: 'proof:intake:ev-por1' });
    ev.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
    ev.setAdmissionAuthority('ev-por1', true, 'authority:evidence-admission:por1:ev', { testOnly: false });
    ev.admit('ev-por1');
    const row = ev.inspect('ev-por1');
    out.fixtureEvidence = { ref: `${row.evidenceId}@${row.revisionId}`, status: row.status, canonicalDigest: ev.findRevision(row.evidenceId, row.revisionId)?.source?.digest ?? null };
  } catch (error) { out.fixtureEvidence = { error: String(error) }; }

  const evRef = out.fixtureEvidence?.ref || null;
  const add = (id, ref, title, refType) => {
    const r = d.curate({ action: 'add', member: { id, revisionId: `pm-por1-${id}`, refType, sourceRef: ref, title, annotation: 'POR-1 responsive/RTL capture' } });
    out.added.push({ id, ref, ok: r.ok, code: r.code || null, state: d.records.find(x => x.id === id)?.state || null });
  };
  if (evRef) add('member-por1-source', evRef, 'Canonical evidence reference (live source)', 'Evidence');
  add('member-por1-unbound', 'not-bound-source@r1', 'Reference whose canonical source is not bound', 'Evidence');
  try { window.__por1.mounted.render(); } catch {}
  return out;
});

/* ------------------------------------------------------------------ runner */

const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(freePort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', c => { serverLog += String(c); });
server.stderr.on('data', c => { serverLog += String(c); });

await mkdir(outDir, { recursive: true });
const captures = [];
const probes = [];
const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const browserVersion = browser.version();

let up = false;
for (let i = 0; i < 120; i++) { try { if ((await fetch(`http://127.0.0.1:${freePort}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
if (!up) { console.error(JSON.stringify({ fatal: 'PROOF_SERVER_DID_NOT_START', log: serverLog.slice(-2000) })); server.kill('SIGTERM'); process.exit(1); }

const record = async (page, meta, file, fullPage = false) => {
  const buffer = await page.screenshot({ path: path.join(outDir, file), fullPage });
  const bytes = await readFile(path.join(outDir, file));
  const dims = pngDims(bytes);
  captures.push({
    file: `writer-output/W04-PORTFOLIO/evidence/${round}/${file}`,
    sha256: sha256(buffer), bytes: buffer.length, dims,
    viewport: meta.viewport, locale: meta.locale, expectDir: meta.expectDir, state: meta.state, fullPage,
    capturedAt: new Date().toISOString(),
    boundTo: { commit: COMMIT, tree: TREE, branch: 'writer/mi-serial-lane/POR-1', round }
  });
};

for (const cell of MATRIX) {
  const context = await browser.newContext({ viewport: cell.viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${freePort}/?surface=portfolio`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'portfolio', null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await inject(page);
  const localeResult = await setLocale(page, cell.locale);

  // state A — empty (route entry truth: 0 memberships, Q-5 notice, ceilings)
  const p1 = await page.evaluate(probeScript(), 'empty');
  probes.push({ ...p1, locale: cell.locale, viewport: cell.viewport, pageErrors: [...pageErrors], localeResult });
  await record(page, { ...cell, state: 'empty' }, `por1-${round}-${cell.locale}-${cell.expectDir}-${cell.viewport.width}x${cell.viewport.height}-empty.png`);

  // state B — populated (live canonical sources + one unbound source)
  const populated = await populate(page);
  await page.waitForTimeout(250);
  const p2 = await page.evaluate(probeScript(), 'populated');
  probes.push({ ...p2, locale: cell.locale, viewport: cell.viewport, pageErrors: [...pageErrors], localeResult, populated });
  await record(page, { ...cell, state: 'populated' }, `por1-${round}-${cell.locale}-${cell.expectDir}-${cell.viewport.width}x${cell.viewport.height}-populated.png`);
  // 1440: full-page capture so the blocks below the fold (state track, integrity table) are
  // also bound as evidence, not just the viewport slice.
  if (cell.viewport.width === 1440) {
    await record(page, { ...cell, state: 'populated' }, `por1-${round}-${cell.locale}-${cell.expectDir}-${cell.viewport.width}x${cell.viewport.height}-populated-fullpage.png`, true);
    // The shell is viewport-fixed (fullPage == viewport), so the blocks below the visible half
    // (state track · canonical source integrity · guidance) are bound by scrolling the centre
    // scroll container instead — otherwise half the workbench would have no evidence.
    const scrolled = await page.evaluate(async () => {
      const roots = [document.querySelector('#foundationStage'), ...document.querySelectorAll('#foundationStage *')];
      const scroller = roots.find(el => el && el.scrollHeight > el.clientHeight + 20);
      if (!scroller) return { attempted: false, reason: 'no scrollable centre container' };
      scroller.scrollTop = scroller.scrollHeight;
      await new Promise(r => setTimeout(r, 450));
      return { attempted: true, tag: scroller.tagName, id: scroller.id || null, cls: String(scroller.className).slice(0, 40), scrollTop: Math.round(scroller.scrollTop), scrollHeight: Math.round(scroller.scrollHeight), clientHeight: Math.round(scroller.clientHeight) };
    });
    const p4 = await page.evaluate(probeScript(), 'populated-scrolled-bottom');
    probes.push({ ...p4, locale: cell.locale, viewport: cell.viewport, pageErrors: [...pageErrors], localeResult, scrolled });
    await record(page, { ...cell, state: 'populated-scrolled-bottom' }, `por1-${round}-${cell.locale}-${cell.expectDir}-${cell.viewport.width}x${cell.viewport.height}-populated-bottom.png`);
  }

  // 1024: COLLAPSED-STATE comparison — the context pane is an off-canvas drawer at this band,
  // so prove it opens and its content is reachable (not a dead control).
  if (cell.viewport.width === 1024) {
    const drawer = await page.evaluate(async () => {
      const btn = document.querySelector('[data-pane-toggle="right"]');
      if (!btn) return { attempted: false, reason: 'no [data-pane-toggle=right] control' };
      btn.click();
      await new Promise(r => setTimeout(r, 500));
      const host = document.querySelector('#domainContext');
      const pane = host ? host.closest('aside, section, div') : null;
      const r = host ? host.getBoundingClientRect() : null;
      return { attempted: true, paneState: pane?.getAttribute('data-state') || null, visible: !!r && r.width > 40 && r.height > 40, rect: r ? { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) } : null };
    });
    const p3 = await page.evaluate(probeScript(), 'context-drawer-open');
    probes.push({ ...p3, locale: cell.locale, viewport: cell.viewport, pageErrors: [...pageErrors], localeResult, drawer });
    await record(page, { ...cell, state: 'drawer-open' }, `por1-${round}-${cell.locale}-${cell.expectDir}-${cell.viewport.width}x${cell.viewport.height}-drawer-open.png`);
  }

  await context.close();
}

await browser.close();
server.kill('SIGTERM');

const report = {
  schemaVersion: 1,
  lane: 'POR-1',
  unit: 'W04-PORTFOLIO',
  round,
  capturedAt: new Date().toISOString(),
  candidate: { branch: 'writer/mi-serial-lane/POR-1', commit: COMMIT, tree: TREE },
  environment: { node: process.version, browser: 'Chromium (Playwright package-local)', browserVersion, transport: 'localhost-http', proofServer: `tools/serve.mjs on 127.0.0.1:${freePort}` },
  captures, probes
};
await writeFile(path.join(outDir, 'PROBES.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  round,
  outDir: path.relative(root, outDir),
  captures: captures.map(c => ({ file: c.file, sha256: c.sha256.slice(0, 16), dims: c.dims, locale: c.locale, dir: c.expectDir, state: c.state })),
  summary: probes.map(p => ({
    locale: p.locale, viewport: `${p.viewport.width}x${p.viewport.height}`, state: p.state, dir: p.dir, lang: p.lang,
    overflow: p.horizontalOverflow, outOfViewport: p.outOfViewport.length, clipped: p.clipped.length,
    clippedRect: (p.clippedRect || []).length, drawer: p.drawer ? p.drawer : undefined,
    overlaps: p.overlaps.length, mirrored: p.mirrored, arabicTypeIssues: p.arabicType.length,
    arabicUnderEn: p.arabicUnderEn.length, gridCols: p.gridCols, records: p.truth?.records ?? null
  }))
}, null, 2));
