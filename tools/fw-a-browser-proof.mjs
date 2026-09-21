import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(path.resolve(override));
}
const { chromium } = playwright;
const root = path.resolve(new URL('../', import.meta.url).pathname);
const dist = path.join(root, 'dist');
const outputDir = path.join(root, 'assurance', 'FW_A_BROWSER');
const projectionOnly = process.env.FW_A_PROJECTION_ONLY === '1';
const projectionWidth = Number(process.env.FW_A_PROJECTION_WIDTH || 1040);
const noWrite = process.env.FW_A_NO_WRITE === '1';
const browserExecutable = process.env.CEP_BROWSER_EXECUTABLE || '/usr/bin/chromium';
const moduleUrlMemo = new Map();

const assert = (condition, message) => { if (!condition) throw Error(message); };
const relativeSpecifiers = source => [...new Set([
  ...[...source.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}\/[^'\"]+)['\"]/g)].map(match => match[1]),
  ...[...source.matchAll(/import\(\s*['\"](\.{1,2}\/[^'\"]+)['\"]\s*\)/g)].map(match => match[1])
])];
const rewriteModuleSource = async relativePath => {
  let source = await readFile(path.join(dist, relativePath), 'utf8');
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
const load = async (page, surface) => {
  let html = await readFile(path.join(dist, 'index.html'), 'utf8');
  const donorCss = await readFile(path.join(dist, 'foundation', 'donor.css'), 'utf8');
  const extensionCss = await readFile(path.join(dist, 'foundation', 'extensions.css'), 'utf8');
  html = html
    .replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i, `<style data-fw-a-inline="donor">${donorCss}</style>`)
    .replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i, `<style data-fw-a-inline="extensions">${extensionCss}</style>`)
    .replace(/<script type="module" src="main\.js"><\/script>/i, '');
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(value => { try { delete globalThis.CEPFoundation; } catch {} history.replaceState({}, '', `about:blank?surface=${encodeURIComponent(value)}`); }, surface);
  const mainSource = await rewriteModuleSource('main.js');
  await page.addScriptTag({ type: 'module', content: `${mainSource}\n// fw-a-browser-proof:${surface}:${Date.now()}` });
  await page.waitForFunction(expected => globalThis.CEPFoundation?.consumer === expected, surface);
};
const capture = async (page, filename) => {
  if (noWrite || projectionOnly) return null;
  await mkdir(outputDir, { recursive: true });
  const target = path.join(outputDir, filename);
  await page.screenshot({ path: target, fullPage: false });
  const bytes = await readFile(target);
  return { filename, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), viewport: await page.viewportSize() };
};

const expected = {
  learn: { family: 'structured', structured: true },
  visualize: { family: 'spatial', structured: false },
  runs: { family: 'operational', structured: false }
};
const results = [];
const screenshots = [];
const browser = await chromium.launch({ headless: true, executablePath: browserExecutable, args: ['--no-sandbox'] });
try {
  for (const surface of Object.keys(expected)) {
    const viewport = projectionOnly ? { width: projectionWidth, height: 900 } : { width: 1440, height: 1000 };
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(`page:${error}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console:${message.text()}`); });
    try {
      await load(page, surface);
      const initial = await page.evaluate(() => ({
        consumer: CEPFoundation.consumer,
        structuredPresent: Boolean(CEPFoundation.structured),
        host: CEPFoundation.api.inspect(),
        hostJson: JSON.stringify(CEPFoundation.api.inspect()),
        searchCount: document.querySelectorAll('.library-search').length,
        bodyBand: document.body.dataset.responsiveBand
      }));
      assert(initial.host.hostKind === 'DONOR_FREE_WORKSPACE_HOST', `${surface}: donor-free host missing`);
      assert(initial.host.hostContract.stateOwners.panes === 'WorkspacePaneLayoutOwner', `${surface}: host contract pane owner is not canonical`);
      assert(initial.host.panes.contract.owner === 'WorkspacePaneLayoutOwner', `${surface}: pane state contract owner is not canonical`);
      assert(initial.host.family === expected[surface].family, `${surface}: family mismatch ${initial.host.family}`);
      assert(initial.structuredPresent === expected[surface].structured, `${surface}: Structured adapter presence mismatch`);
      assert(Object.values(initial.host.slots).every(Boolean), `${surface}: universal slots incomplete ${JSON.stringify(initial.host.slots)}`);
      assert(initial.searchCount === 0, `${surface}: Library search leaked into donor-free host`);
      if (surface !== 'learn') {
        assert(!initial.hostJson.includes('KU-'), `${surface}: KU state leaked into host inspection`);
        assert(!initial.hostJson.toLowerCase().includes('library'), `${surface}: Library state leaked into host inspection`);
      }

      const invalidPaneInput = await page.evaluate(() => {
        const before = CEPFoundation.api.panes.snapshot();
        const failures = [];
        for (const [label, side, state] of [
          ['invalid-side', 'bogus', 'collapsed'],
          ['invalid-state', 'left', 'bogus']
        ]) {
          let code = null;
          try { CEPFoundation.api.panes.setPreferredState(side, state); } catch (error) { code = error.message; }
          failures.push({ label, code });
        }
        const after = CEPFoundation.api.panes.snapshot();
        return { failures, before: { left: before.left.preferredState, right: before.right.preferredState }, after: { left: after.left.preferredState, right: after.right.preferredState } };
      });
      assert(invalidPaneInput.failures.every(item => item.code === 'INVALID_PANE_STATE'), `${surface}: invalid pane mutation did not fail with INVALID_PANE_STATE`);
      assert(JSON.stringify(invalidPaneInput.before) === JSON.stringify(invalidPaneInput.after), `${surface}: invalid pane input mutated preferred state`);

      if (projectionOnly) {
        results.push({ surface, status: 'PASS', structuredPresent: initial.structuredPresent, family: initial.host.family, responsiveBand: initial.host.panes.responsiveBand, right: initial.host.panes.right, left: initial.host.panes.left, invalidPaneInput, errors });
        assert(errors.length === 0, `${surface}: browser errors ${errors.join(' | ')}`);
        await context.close();
        continue;
      }

      assert(initial.host.panes.responsiveBand === 'wide', `${surface}: 1440 is not wide`);
      assert(initial.host.panes.left.effectiveState === 'open' && initial.host.panes.right.effectiveState === 'open', `${surface}: wide panes not open`);
      const wideCapture = await capture(page, `FW_A_${surface.toUpperCase()}_1440x1000.png`);
      if (wideCapture) screenshots.push({ surface, kind: 'wide', ...wideCapture });

      const keyboardResize = await page.evaluate(async () => {
        const resizer = document.querySelector('#leftResizer');
        const before = CEPFoundation.api.panes.snapshot().left.preferredWidth;
        resizer.focus();
        return { before, focused: document.activeElement === resizer, pointer: resizer.dataset.pointerResize, keyboard: resizer.dataset.keyboardResize };
      });
      await page.locator('#leftResizer').press('ArrowRight');
      const afterKeyboard = await page.evaluate(() => CEPFoundation.api.panes.snapshot().left.preferredWidth);
      assert(keyboardResize.focused && keyboardResize.pointer === 'true' && keyboardResize.keyboard === 'true', `${surface}: separator availability/focus mismatch`);
      assert(afterKeyboard > keyboardResize.before, `${surface}: keyboard separator resize did not change width`);
      await page.evaluate(width => { CEPFoundation.api.panes.setPreferredWidth('left', width); CEPFoundation.api.applyPreferenceSnapshot(); }, keyboardResize.before);

      const focusReturn = await page.evaluate(() => {
        const pane = document.querySelector('#rightPane');
        pane.tabIndex = -1;
        pane.focus();
        const focusedBefore = document.activeElement === pane;
        CEPFoundation.api.togglePane('right');
        const active = document.activeElement;
        const returned = active?.dataset?.paneToggle === 'right';
        const collapsed = CEPFoundation.api.panes.snapshot().right;
        CEPFoundation.api.togglePane('right');
        return { focusedBefore, returned, collapsed, activeTag: active?.tagName || null };
      });
      assert(focusReturn.focusedBefore && focusReturn.returned && focusReturn.collapsed.effectiveState === 'collapsed', `${surface}: pane focus return failed ${JSON.stringify(focusReturn)}`);

      const focusRoundtrip = await page.evaluate(() => {
        const before = CEPFoundation.api.panes.snapshot();
        CEPFoundation.api.toggleFocus();
        const focused = CEPFoundation.api.panes.snapshot();
        CEPFoundation.api.toggleFocus();
        const restored = CEPFoundation.api.panes.snapshot();
        return { before, focused, restored };
      });
      assert(focusRoundtrip.focused.left.effectiveState === 'collapsed' && focusRoundtrip.focused.right.effectiveState === 'collapsed', `${surface}: focus mode projection failed`);
      assert(focusRoundtrip.focused.left.preferredState === focusRoundtrip.before.left.preferredState && focusRoundtrip.focused.right.preferredState === focusRoundtrip.before.right.preferredState, `${surface}: focus mode overwrote preference`);
      assert(focusRoundtrip.restored.left.effectiveState === focusRoundtrip.before.left.effectiveState && focusRoundtrip.restored.right.effectiveState === focusRoundtrip.before.right.effectiveState, `${surface}: focus mode did not round-trip`);

      await page.setViewportSize({ width: 900, height: 900 });
      await page.waitForTimeout(40);
      const medium = await page.evaluate(() => CEPFoundation.api.inspect().panes);
      assert(medium.responsiveBand === 'medium' && medium.left.effectiveState === 'open' && medium.right.effectiveState === 'collapsed', `${surface}: medium projection mismatch`);
      assert(medium.right.preferredState === 'open', `${surface}: medium projection overwrote right preference`);

      await page.setViewportSize({ width: 720, height: 900 });
      await page.waitForTimeout(40);
      const narrowBefore = await page.evaluate(() => CEPFoundation.api.inspect().panes);
      assert(narrowBefore.responsiveBand === 'narrow' && narrowBefore.left.effectiveState === 'collapsed' && narrowBefore.right.effectiveState === 'collapsed', `${surface}: narrow projection mismatch`);
      assert(narrowBefore.left.preferredState === 'open' && narrowBefore.right.preferredState === 'open', `${surface}: narrow projection overwrote preference`);
      const revealVisible = await page.locator('[data-pane-toggle="left"]:visible').count();
      assert(revealVisible > 0, `${surface}: no visible narrow reopen affordance`);
      const narrowReopened = await page.evaluate(() => { CEPFoundation.api.togglePane('left'); return CEPFoundation.api.inspect().panes; });
      assert(narrowReopened.left.effectiveState === 'open' && narrowReopened.left.mode === 'overlay' && narrowReopened.left.preferredState === 'open', `${surface}: narrow reopen is not a non-persistent overlay`);
      const narrowCapture = await capture(page, `FW_A_${surface.toUpperCase()}_NARROW_720x900.png`);
      if (narrowCapture) screenshots.push({ surface, kind: 'narrow-reopened', ...narrowCapture });
      await page.evaluate(() => CEPFoundation.api.togglePane('left'));

      assert(errors.length === 0, `${surface}: browser errors ${errors.join(' | ')}`);
      results.push({ surface, status: 'PASS', initial, invalidPaneInput, keyboardResize: { ...keyboardResize, after: afterKeyboard }, focusReturn, focusRoundtrip, medium, narrowBefore, narrowReopened, errors });
    } catch (error) {
      results.push({ surface, status: 'FAIL', error: String(error.message || error), errors });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const receipt = {
  schemaVersion: 1,
  mission: 'FW-A-FAMILY-NEUTRAL-WORKSPACE-PANES',
  classification: projectionOnly ? 'LANE_A_CENTRAL_POLICY_PROJECTION_PROBE_NOT_CONTROLLER_ACCEPTANCE' : 'LANE_A_REAL_BROWSER_STATE_AND_VISUAL_PROOF_NOT_CONTROLLER_ACCEPTANCE',
  environment: { browser: 'Chromium via Playwright', executable: browserExecutable, transport: 'in-memory exact built ESM graph' },
  projectionOnly,
  projectionWidth: projectionOnly ? projectionWidth : null,
  summary: { total: results.length, pass: results.filter(item => item.status === 'PASS').length, fail: results.filter(item => item.status === 'FAIL').length },
  results,
  screenshots
};
if (!noWrite && !projectionOnly) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'FW_A_BROWSER_PROOF.json'), JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify(receipt, null, 2));
if (receipt.summary.fail) process.exitCode = 1;
