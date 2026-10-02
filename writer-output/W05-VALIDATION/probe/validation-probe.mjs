/**
 * VAL-1 lane probe — Validation surface truth + presentation evidence.
 * Runs entirely from this lane's writable root (writer-output/W05-VALIDATION/probe/).
 * Never writes outside writer-output/W05-VALIDATION/.
 *
 * Usage: node writer-output/W05-VALIDATION/probe/validation-probe.mjs
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../../', import.meta.url));
const here = fileURLToPath(new URL('./', import.meta.url));
const shotsDir = path.join(here, 'captures');
const workRoot = path.join(here, '.runtime-proof');
await mkdir(shotsDir, { recursive: true });
await mkdir(workRoot, { recursive: true });

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const wait = async url => { for (let i = 0; i < 150; i += 1) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(workRoot, 'probe.sqlite'), CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = ''; server.stdout.on('data', c => { serverLog += String(c); }); server.stderr.on('data', c => { serverLog += String(c); });
let runtimeLog = ''; runtime.stdout.on('data', c => { runtimeLog += String(c); }); runtime.stderr.on('data', c => { runtimeLog += String(c); });

const assertions = [];
const assert = (id, expected, actual, detail = '') => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  assertions.push({ id, expected, actual, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${id} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
  return ok;
};

const up1 = await wait(`http://127.0.0.1:${port}/`);
const up2 = await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
if (!up1 || !up2) { console.error('SERVER_START_FAILED', serverLog, runtimeLog); process.exit(1); }

const identity = {
  artifactRef: 'artifact-local-001',
  artifactDigest: 'a'.repeat(64),
  ruleset: { id: 'CEP_VALIDATION_RULESET_JSON_ARTIFACT', revision: '1', digest: '914d16ced1e6bd4be1c4904fd9442696b6e8da854840bf9a6bccd918a8e69cd3' },
  validator: { id: 'CEP_BOUNDED_JSON_VALIDATOR', version: '1', digest: '3241a6e0e1eefb290cd07467a844baaed229511365afc5f617c13563e77d4d54' },
  payload: { note: 'probe' }
};
const foreign = JSON.stringify({ ...identity, validator: { id: 'CEP_BOUNDED_JSON_VALIDATOR', version: '9', digest: 'b'.repeat(64) } });
const staleInput = JSON.stringify({ ...identity, artifactDigest: 'c'.repeat(64) });

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const captures = [];
const pageErrors = [];

    const resetScroll = page => page.evaluate(() => {
  for (const sel of ['#foundationStage', '#centerPane .docscroll', '#centerPane', '.v-table-wrap']) {
    const d = document.querySelector(sel);
    if (d && d.scrollTop) d.scrollTop = 0;
  }
});

const shoot = async (page, name, viewport, locale, dir) => {
  await resetScroll(page);
  await page.waitForTimeout(250);
  const file = `${name}-${viewport.id}-${locale}.png`;
  const filePath = path.join(shotsDir, file);
  await page.screenshot({ path: filePath, fullPage: false });
  const bytes = await readFile(filePath);
  const entry = { filename: `writer-output/W05-VALIDATION/probe/captures/${file}`, viewport: viewport.id, locale, dir, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
  captures.push(entry);
  return entry;
};

const crop = async (page, name, selector, viewport, locale, dir) => {
  const file = `crop-${name}-${viewport.id}-${locale}.png`;
  const filePath = path.join(shotsDir, file);
  try {
    const handle = await page.$(selector);
    if (!handle) throw new Error('element-not-found');
    await handle.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await handle.screenshot({ path: filePath, timeout: 8000 });
    const bytes = await readFile(filePath);
    const entry = { filename: `writer-output/W05-VALIDATION/probe/captures/${file}`, viewport: viewport.id, locale, dir, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, elementCrop: selector };
    captures.push(entry);
    return entry;
  } catch (error) {
    assertions.push({ id: `crop.${name}.${viewport.id}`, expected: 'captured', actual: `failed:${String(error?.message || error).slice(0, 80)}`, ok: false, detail: selector });
    return null;
  }
};

const setLocale = (page, locale) => page.evaluate(loc => {
  const f = window.CEPFoundation;
  f.preferences.set('locale', loc, f.workspace.scope);
  f.workspace.applyPreferences();
  return { lang: document.documentElement.lang, dir: document.documentElement.dir };
}, locale);

const setInput = (page, raw) => page.evaluate(value => { const el = document.querySelector('#validationInput'); el.value = value; return el.value.length; }, raw);
const click = async (page, selector) => { await page.evaluate(sel => { document.querySelector(sel).click(); }, selector); await page.waitForTimeout(700); };
const readState = page => page.evaluate(() => {
  const rows = [...document.querySelectorAll('.v-table tbody tr')].map(tr => ({
    rule: tr.children[1]?.textContent?.trim() || '',
    status: tr.querySelector('td span')?.textContent?.trim() || ''
  }));
  const tiles = [...document.querySelectorAll('.v-tile')].map(t => ({ label: t.querySelector('b')?.textContent?.trim(), value: t.querySelector('strong')?.textContent?.trim(), meta: t.querySelector('small')?.textContent?.trim() }));
  const feedback = document.querySelector('.v-feedback');
  return {
    status: document.querySelector('[data-validation-status]')?.getAttribute('data-validation-status') || null,
    staleBanner: /STALE_FOR_CURRENT_ARTIFACT/.test(document.querySelector('[data-v-session]')?.innerText || ''),
    unresolvedBanner: /UNRESOLVED_RUN_IDENTITY/.test(document.querySelector('[data-v-session]')?.innerText || ''),
    rows, tiles,
    feedbackOk: feedback ? feedback.getAttribute('data-ok') : null,
    feedbackText: feedback ? feedback.innerText.replace(/\s+/g, ' ').slice(0, 400) : null,
    lang: document.documentElement.lang, dir: document.documentElement.dir
  };
});

try {
  const viewports = [{ width: 1440, height: 1000, id: '1440x1000' }, { width: 1024, height: 900, id: '1024x900' }];
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(`http://127.0.0.1:${port}/?surface=validation&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'validation', null, { timeout: 30000 });
    await page.waitForTimeout(1200);

    /* ---- rendering identity: direction must follow the resolved locale, never be baked in ---- */
    let s = await readState(page);
    const defaultLocale = s.lang;
    assert(`${viewport.id}.default-direction-follows-locale`, defaultLocale === 'ar' ? 'rtl' : 'ltr', s.dir, `resolved default locale ${defaultLocale}`);

    /* ---- A. exact identities -> TECHNICALLY_VALID, every rule evaluated ---- */
    await setInput(page, JSON.stringify(identity));
    await click(page, '[data-validation-run]');
    s = await readState(page);
    assert(`${viewport.id}.A-status-technically-valid`, 'TECHNICALLY_VALID', s.status);
    assert(`${viewport.id}.A-no-unevaluated-rule-fabricated-as-pass`, [], s.rows.filter(r => r.status.includes('NOT EVALUATED')).map(r => r.rule));

    /* ---- B. broken JSON -> INVALID_JSON FAIL, identity rules NOT EVALUATED (never PASS) ---- */
    await setInput(page, '{');
    await click(page, '[data-validation-run]');
    s = await readState(page);
    assert(`${viewport.id}.B-status-invalid`, 'TECHNICALLY_INVALID', s.status);
    assert(`${viewport.id}.B-json-parse-fails`, '✕ FAIL', (s.rows.find(r => r.rule.includes('JSON_PARSE')) || {}).status);
    const bUnevaluated = s.rows.filter(r => r.status.includes('NOT EVALUATED')).map(r => r.rule);
    assert(`${viewport.id}.B-unchecked-rules-not-claimed-pass`, true, bUnevaluated.length >= 5, JSON.stringify(bUnevaluated));

    /* ---- C. JSON `null` root -> ROOT_NOT_OBJECT finding (never an invalid run with zero findings) ---- */
    await setInput(page, 'null');
    await click(page, '[data-validation-run]');
    s = await readState(page);
    assert(`${viewport.id}.C-null-root-invalid`, 'TECHNICALLY_INVALID', s.status);
    assert(`${viewport.id}.C-null-root-has-root-not-object-finding`, '✕ FAIL', (s.rows.find(r => r.rule.includes('ROOT_OBJECT')) || {}).status);

    /* ---- D. no provider -> UNAVAILABLE + explicit finding, never TECHNICALLY_VALID ---- */
    await setInput(page, foreign);
    await click(page, '[data-validation-run]');
    s = await readState(page);
    assert(`${viewport.id}.D-no-provider-unavailable`, 'UNAVAILABLE', s.status);
    assert(`${viewport.id}.D-validator-unavailable-finding`, '✕ FAIL', (s.rows.find(r => r.rule.includes('VALIDATOR_UNAVAILABLE')) || {}).status);
    assert(`${viewport.id}.D-never-technically-valid-without-provider`, 'UNAVAILABLE', s.status);

    /* ---- E. stale binding: change the current artifact, inspect -> persistent stale banner ---- */
    await setInput(page, JSON.stringify(identity));
    await click(page, '[data-validation-run]');
    await setInput(page, staleInput);
    await click(page, '[data-validation-inspect]');
    s = await readState(page);
    assert(`${viewport.id}.E-stale-banner-shown`, true, s.staleBanner);
    assert(`${viewport.id}.E-stale-feedback-declared`, true, /STALE_FOR_CURRENT_ARTIFACT/.test(s.feedbackText || ''));
    await shoot(page, 'validation-stale', viewport, s.lang, s.dir);

    /* banner must survive a re-render that does not inspect again */
    await page.evaluate(() => document.querySelector('[data-validation-findings]').click());
    await page.waitForTimeout(500);
    s = await readState(page);
    assert(`${viewport.id}.E-stale-banner-survives-render`, true, s.staleBanner);

    /* ---- F. unresolved run identity -> comparable=false, never a fabricated STALE ---- */
    await setInput(page, '{');
    await click(page, '[data-validation-run]');
    await setInput(page, JSON.stringify(identity));
    await click(page, '[data-validation-inspect]');
    s = await readState(page);
    assert(`${viewport.id}.F-unresolved-identity-not-labelled-stale`, false, s.staleBanner);
    assert(`${viewport.id}.F-unresolved-identity-declared`, true, s.unresolvedBanner || /UNRESOLVED_RUN_IDENTITY/.test(s.feedbackText || ''));

    /* ---- G. representative session capture in the default locale, AR/RTL and EN/LTR ---- */
    await setInput(page, JSON.stringify(identity));
    await click(page, '[data-validation-run]');
    s = await readState(page);
    await shoot(page, 'validation-session-default', viewport, s.lang, s.dir);
    await crop(page, 'rule-outcomes', '.v-table-wrap', viewport, s.lang, s.dir);
    await crop(page, 'session-tiles', '.v-tiles', viewport, s.lang, s.dir);
    await crop(page, 'left-structure', '.v-nav', viewport, s.lang, s.dir);
    const rightHandle = await page.$('.v-ctx');
    const rightVisible = rightHandle ? await rightHandle.isVisible() : false;
    if (rightVisible) await crop(page, 'right-context', '.v-ctx', viewport, s.lang, s.dir);
    else assertions.push({ id: `${viewport.id}.right-context-collapse`, expected: 'recorded', actual: 'RIGHT context pane collapsed at this viewport (shared responsive rule)', ok: true, detail: 'collapsed-state observation' });

    /* ---- L4 layout truth: no clipped identity values, no all-rows-selected artefact ---- */
    const layout = await page.evaluate(() => {
      const clipped = [];
      for (const el of document.querySelectorAll('.v-nav dd, .v-tile, .v-tile small, .v-head h1, .v-session h3, .v-meta span')) {
        if (el.scrollWidth > el.clientWidth + 1) clipped.push({ text: (el.textContent || '').replace(/\s+/g, ' ').slice(0, 48), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
      }
      return { clipped, selectedRows: document.querySelectorAll('.v-table tbody tr[data-selected="true"]').length, totalRows: document.querySelectorAll('.v-table tbody tr').length };
    });
    assert(`${viewport.id}.L4-no-clipped-identity-values`, [], layout.clipped);
    assert(`${viewport.id}.L4-no-false-row-selection`, 0, layout.selectedRows, `rows=${layout.totalRows}`);

    const arabic = await setLocale(page, 'ar');
    await page.waitForTimeout(700);
    assert(`${viewport.id}.G-ar-switch-applies`, { lang: 'ar', dir: 'rtl' }, { lang: arabic.lang, dir: arabic.dir });
    s = await readState(page);
    assert(`${viewport.id}.G-ar-still-technically-valid`, 'TECHNICALLY_VALID', s.status);
    await shoot(page, 'validation-session', viewport, 'ar', 'rtl');

    const english = await setLocale(page, 'en');
    await page.waitForTimeout(700);
    assert(`${viewport.id}.G-en-switch-applies`, { lang: 'en', dir: 'ltr' }, { lang: english.lang, dir: english.dir });
    s = await readState(page);
    assert(`${viewport.id}.G-en-still-technically-valid`, 'TECHNICALLY_VALID', s.status);
    await shoot(page, 'validation-session', viewport, 'en', 'ltr');
    await setLocale(page, defaultLocale);
    await page.waitForTimeout(400);

    await context.close();
  }
} finally {
  try { await browser.close(); } catch { /* bounded */ }
  runtime.kill('SIGTERM'); server.kill('SIGTERM');
}

const receipt = {
  schemaVersion: 1,
  lane: 'VAL-1',
  classification: 'CANDIDATE_ONLY_NOT_OWNER_ACCEPTANCE',
  purpose: 'Validation surface truth falsification (N2/N3 + stale binding) and AR-RTL/EN-LTR presentation capture',
  generatedAt: new Date().toISOString(),
  node: process.version,
  assertions,
  summary: { total: assertions.length, pass: assertions.filter(a => a.ok).length, fail: assertions.filter(a => !a.ok).length },
  pageErrors,
  captures
};
await writeFile(path.join(here, 'PROBE_RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ summary: receipt.summary, failed: assertions.filter(a => !a.ok).map(a => a.id), captures: captures.length }, null, 2));
if (receipt.summary.fail) process.exitCode = 1;
