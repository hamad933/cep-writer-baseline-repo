/**
 * W01 matched-viewport visual capture — C03-GATE-020 W01-side evidence (residual round).
 *
 * Captures the W01 surfaces (shell, today) at BOTH declared viewports — 1440×1000 and
 * 1024×900 — in two states: plain baseline and real keyboard focus, with a
 * `document.activeElement` proof recorded for every keyboard frame.
 *
 * Naming (controller/08_evidence/evidence_contract.md):
 *   writer-output/W01/evidence/<surface>/<flow>-<YYYYMMDDTHHMMSSZ>-<candidate8>.png
 *   `<candidate8>` = first 8 hex chars of OWNED_PARTITION_SHA256 (the per-writer candidate).
 *   The whole-worktree variant hash is INFORMATIONAL_MOVING under parallel sibling edits, so it
 *   is recorded in the receipt as context only and never binds a W01 claim.
 * Binding: `ownedPartition.identity` + `commit` + `tree` from
 *   `tools/writer-candidate-identity.mjs --workspace W01 --json`.
 *
 * Receipt: writer-output/W01/VISUAL_CAPTURE_RECEIPT.json (every artifact sha256-bound; previous
 * artifacts are retained and labelled SUPERSEDED, never deleted).
 *
 * Scope law: this tool only READS product state and writes W01-owned evidence. It does not
 * decide C03-GATE-020 (Owner matched-state image inspection stays BLOCKED) and never invents a
 * `domain-diagnostics` bottom tab.
 *
 * Usage: node tools/w01-visual-capture.mjs
 * Exit 1 if any measured assertion fails (classify, preserve evidence, report — no repair loop).
 */
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W01');
const evidenceDir = path.join(outDir, 'evidence');
const receiptPath = path.join(outDir, 'VISUAL_CAPTURE_RECEIPT.json');

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const candidateIdentity = (() => {
  const proc = spawnSync(process.execPath, [path.join(root, 'tools/writer-candidate-identity.mjs'), '--workspace', 'W01', '--json'], { cwd: root, encoding: 'utf8' });
  if (proc.status !== 0) throw Error(`CANDIDATE_IDENTITY_FAILED: ${proc.stderr || proc.stdout}`);
  return JSON.parse(proc.stdout);
})();
const PARTITION = candidateIdentity.ownedPartition.identity;
const PARTITION8 = PARTITION.replace(/^OWNED_PARTITION_SHA256:/, '').slice(0, 8);
const COMMIT = candidateIdentity.commit;
const TREE = candidateIdentity.tree;
const BRANCH = candidateIdentity.branch;
/** INFORMATIONAL_MOVING — recorded as context, never used to bind a per-writer claim. */
const WORKTREE_VARIANT = candidateIdentity.worktreeVariant;

const VIEWPORTS = [
  { name: '1440x1000', width: 1440, height: 1000, label: 'declared desktop capture' },
  { name: '1024x900', width: 1024, height: 900, label: 'matched ~1024 capture' }
];

const SURFACES = [
  {
    id: 'shell',
    route: '/?surface=shell',
    focusSelector: '.global-shell-destinations [data-shell-destination]',
    keyboard: 'ArrowRight',
    expectedOwner: 'GlobalShellNavigationOwner',
    expected: 'global shell renders five unfrozen destinations at both viewports; keyboard focus lands in the destination navigation and arrow keys move it'
  },
  {
    id: 'today',
    route: '/?surface=today',
    focusSelector: '#todayFilterBar .today-filter',
    keyboard: 'ArrowRight',
    expectedOwner: 'TodayOrchestrationPresentation',
    expected: 'Today projection renders with the complete six-filter toolbar at both viewports; keyboard focus lands in the filter toolbar and stays there'
  }
];

/* ------------------------------------------------------------------ in-page probes */

const activeElementProbe = () => {
  const el = document.activeElement;
  const chain = [];
  let node = el;
  while (node && node !== document.body && chain.length < 6) {
    chain.push(node.tagName.toLowerCase() + (node.id ? `#${node.id}` : '') + (typeof node.className === 'string' && node.className.trim() ? `.${node.className.trim().split(/\s+/).join('.')}` : ''));
    node = node.parentElement;
  }
  return {
    isBody: el === document.body,
    tag: el ? el.tagName.toLowerCase() : null,
    id: el && el.id ? el.id : null,
    className: el && typeof el.className === 'string' ? el.className : null,
    text: el ? String(el.textContent || '').trim().slice(0, 60) : null,
    ariaPressed: el ? el.getAttribute('aria-pressed') : null,
    tabIndex: el ? el.tabIndex : null,
    dataShellDestination: el ? el.getAttribute('data-shell-destination') : null,
    dataShellArea: el ? el.getAttribute('data-shell-area') : null,
    dataFilter: el ? el.getAttribute('data-filter') : null,
    focusVisible: el ? el.matches(':focus-visible') : false,
    inDocument: el ? el.isConnected : false,
    shellHostOwner: el && el.closest ? (el.closest('.foundation-shell')?.dataset.owner || null) : null,
    workbenchOwner: el && el.closest ? (el.closest('[data-owner]')?.dataset.owner || null) : null,
    ancestorChain: chain
  };
};

/* ------------------------------------------------------------------ assertions */

const assertions = [];
const assert = (id, expected, actual, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  assertions.push({ id, expected, actual, ok, class: ok ? null : 'PRODUCT', message: ok ? '' : message });
  if (!ok) console.error(`FAIL ${id}: ${message} — expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`);
  return ok;
};

/* ------------------------------------------------------------------ capture */

const artifacts = [];
const artifactPaths = new Set();
const capture = async (page, surface, flow, viewport) => {
  const dir = path.join(evidenceDir, surface);
  await mkdir(dir, { recursive: true });
  const filename = `${flow}-${stamp()}-${PARTITION8}.png`;
  const relative = path.join('writer-output/W01/evidence', surface, filename);
  await page.screenshot({ path: path.join(dir, filename), fullPage: false });
  const bytes = await readFile(path.join(dir, filename));
  artifactPaths.add(relative);
  const record = {
    filename: relative,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    surface,
    flow,
    viewport,
    capturedAt: new Date().toISOString(),
    status: 'CURRENT',
    binding: 'OWNED_PARTITION',
    boundTo: { ownedPartition: PARTITION, commit: COMMIT, tree: TREE, branch: BRANCH }
  };
  artifacts.push(record);
  return record;
};

const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const port = freePort;
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', c => { serverLog += String(c); });
server.stderr.on('data', c => { serverLog += String(c); });

let browser = null;
let browserVersion = null;
try {
  let up = false;
  for (let i = 0; i < 100; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  if (!up) throw Error(`PROOF_SERVER_DID_NOT_START: ${serverLog}`);
  browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
  browserVersion = await browser.version();

  for (const viewport of VIEWPORTS) {
    for (const surface of SURFACES) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(String(error)));
      const tag = `${surface.id}@${viewport.name}`;

      await page.goto(`http://127.0.0.1:${port}${surface.route}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(id => window.CEPFoundation?.consumer === id, surface.id, { timeout: 20000 });
      await page.waitForTimeout(300);

      const geometry = await page.evaluate(() => ({
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }));
      assert(`${tag}.viewport-applied`, { w: viewport.width, h: viewport.height }, { w: geometry.viewportWidth, h: geometry.viewportHeight }, 'the declared capture viewport was not applied');
      assert(`${tag}.no-horizontal-overflow`, true, geometry.docScrollWidth <= geometry.viewportWidth, `the surface overflows horizontally at the matched viewport (scrollWidth ${geometry.docScrollWidth} > ${geometry.viewportWidth})`);

      if (surface.id === 'shell') {
        const nav = await page.evaluate(() => {
          const node = document.querySelector('.global-shell-destinations');
          return node ? { count: node.getAttribute('data-shell-destination-count'), frozen: node.getAttribute('data-shell-destination-count-frozen'), routeCount: node.getAttribute('data-shell-route-count'), links: node.querySelectorAll('a[data-shell-destination]').length } : null;
        });
        assert(`${tag}.shell-destination-baseline`, { count: '5', frozen: 'false' }, { count: nav?.count ?? null, frozen: nav?.frozen ?? null }, 'the five-destination unfrozen baseline is missing at this viewport (Q-1 law: never frozen, never invented)');
        assert(`${tag}.shell-destination-links-rendered`, true, (nav?.links ?? 0) > 0, 'no destination links rendered at this viewport');
      } else {
        const filters = await page.evaluate(() => [...document.querySelectorAll('.today-filter[data-today-action="filter"]')].map(b => b.dataset.filter));
        assert(`${tag}.today-filter-set-complete`, ['ALL', 'CONTINUE_SESSION', 'RECOMMENDATION', 'ATTENTION', 'RECENT_CONTEXT', 'PROGRESS'], filters, 'the Today filter command set is incomplete at this viewport');
      }

      const baseline = await capture(page, surface.id, 'matched-viewport-baseline', viewport.name);
      baseline.activeElement = await page.evaluate(activeElementProbe);
      baseline.expectedState = surface.expected;
      baseline.actualState = `baseline rendered at ${viewport.name}; activeElement ${baseline.activeElement.isBody ? 'is <body> (no keyboard focus yet)' : `<${baseline.activeElement.tag}>`}`;
      baseline.pageErrors = pageErrors.slice();

      let focus = null, tabsUsed = -1;
      for (let i = 0; i < 40; i += 1) {
        await page.keyboard.press('Tab');
        focus = await page.evaluate(activeElementProbe);
        if (await page.evaluate(sel => !!document.activeElement && document.activeElement.matches(sel), surface.focusSelector)) { tabsUsed = i + 1; break; }
      }
      assert(`${tag}.keyboard-focus-reaches-owned-region`, true, tabsUsed > 0, 'keyboard traversal never reached the W01-owned focus region within 40 Tab presses');

      const before = focus;
      await page.keyboard.press(surface.keyboard);
      await page.waitForTimeout(120);
      const after = await page.evaluate(activeElementProbe);
      const stillInRegion = await page.evaluate(sel => !!document.activeElement && document.activeElement.matches(sel), surface.focusSelector);

      if (surface.id === 'shell') {
        assert(`${tag}.keyboard-arrow-moves-focus-within-nav`, true, before?.dataShellDestination !== after?.dataShellDestination, 'Arrow keys did not move keyboard focus inside the shell destination navigation');
      }
      assert(`${tag}.keyboard-focus-stays-in-owned-region`, true, stillInRegion, 'keyboard focus left the W01-owned focus region after the arrow key');
      assert(`${tag}.focus-proof-connected`, true, after.inDocument === true && after.isBody === false, 'the captured activeElement is not a connected, non-body element');
      assert(`${tag}.focus-owned-by-expected-owner`, surface.expectedOwner, after.shellHostOwner ?? after.workbenchOwner, `activeElement is not owned by ${surface.expectedOwner}`);

      const focused = await capture(page, surface.id, 'matched-viewport-keyboard-focus', viewport.name);
      focused.activeElement = after;
      focused.keyboard = { tabsToRegion: tabsUsed, key: surface.keyboard, before, after, staysInRegion: stillInRegion };
      focused.expectedState = surface.expected;
      focused.actualState = `keyboard focus on <${after.tag}> ${after.id ? `#${after.id}` : ''} [${after.className || ''}] data-shell-destination=${after.dataShellDestination} data-filter=${after.dataFilter} focusVisible=${after.focusVisible}`;
      focused.pageErrors = pageErrors.slice();

      await context.close();
    }
  }
} catch (error) {
  assertions.push({ id: 'w01-visual-capture.bootstrap', expected: 'capture harness starts', actual: String(error?.message || error), ok: false, class: 'ENVIRONMENT', message: String(error?.message || error) });
} finally {
  try { if (browser) await browser.close(); } catch {}
  server.kill('SIGTERM');
}

// Retain every previously captured artifact (immutable evidence): previous artifacts that were not
// re-captured in this run are kept on disk and relabelled SUPERSEDED, never deleted.
let previous = null;
try { previous = JSON.parse(await readFile(receiptPath, 'utf8')); } catch {}
const previousKept = (previous?.artifacts || [])
  .filter(a => !artifactPaths.has(a.filename))
  .map(a => ({ ...a, status: 'SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED' }));

const all = [...artifacts, ...previousKept].sort((a, b) => a.filename.localeCompare(b.filename));
const failed = assertions.filter(a => !a.ok);
const receipt = {
  schemaVersion: 1,
  workspace: 'W01',
  classification: 'W01_MATCHED_VIEWPORT_CAPTURE_NOT_OWNER_ACCEPTANCE',
  command: 'node tools/w01-visual-capture.mjs',
  gate: {
    id: 'C03-GATE-020',
    status: 'BLOCKED',
    reason: 'W01-side matched-viewport 1440×1000 + 1024×900 keyboard/focus capture is produced here; the gate itself requires Owner matched-state image inspection, which W01 may neither perform nor decide.',
    rowsCarryingTheGate: ['OBL-003674', 'OBL-003675', 'OBL-008651']
  },
  browser: 'Chromium (Playwright package-local)',
  browserVersion,
  transport: 'localhost-http',
  runtime: `Node ${process.version}`,
  viewports: VIEWPORTS,
  surfaces: SURFACES.map(s => ({ id: s.id, route: s.route, expected: s.expected, focusSelector: s.focusSelector })),
  binding: {
    ownedPartition: PARTITION,
    ownedPartitionRoots: candidateIdentity.ownedPartition.roots,
    ownedPartitionFileCount: candidateIdentity.ownedPartition.fileCount,
    ownedPartitionStableUnderSiblingEdits: candidateIdentity.ownedPartition.stableUnderSiblingEdits,
    commit: COMMIT,
    tree: TREE,
    branch: BRANCH,
    bindingRule: candidateIdentity.bindingRule,
    candidate8InFilenames: PARTITION8,
    worktreeVariantInformational: WORKTREE_VARIANT
  },
  capturedAt: new Date().toISOString(),
  assertions,
  artifacts: all,
  summary: {
    artifactsCapturedThisRun: artifacts.length,
    artifactsRetainedFromPreviousRuns: previousKept.length,
    artifactsTotal: all.length,
    assertions: assertions.length,
    passed: assertions.length - failed.length,
    failed: failed.length,
    status: failed.length ? 'FAIL' : 'PASS'
  },
  limitations: [
    'Headless Chromium only; no Owner acceptance and no exhaustive permutation certification',
    'Static proof server serves dist/ only — no local runtime API process runs during the capture',
    'Capture proves W01-side geometry + keyboard/focus state; C03-GATE-020 stays BLOCKED pending Owner matched-state image inspection'
  ]
};
await mkdir(outDir, { recursive: true });
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');

console.log(JSON.stringify({
  receipt: 'writer-output/W01/VISUAL_CAPTURE_RECEIPT.json',
  summary: receipt.summary,
  failedAssertions: failed.map(a => a.id),
  artifactsThisRun: artifacts.map(a => a.filename),
  binding: receipt.binding
}, null, 2));
if (failed.length) process.exitCode = 1;
