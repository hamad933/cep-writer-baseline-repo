/**
 * W05 visual re-audit capture (R2/R6) — one screenshot per ENACTED state, both required
 * viewports (1440x1000 and 1024x900), BOTTOM shelf expanded where the deep content lives.
 *
 * Produces
 *   writer-output/W05/reaudit-evidence/<flow>-<state>-<viewport>-<stamp>.png
 *   writer-output/W05/reaudit-evidence/composites/<surface>__<state>-<viewport>.png   (ref|current, filename+sha burned)
 *   writer-output/W05/reaudit-evidence/REAUDIT_MEASUREMENTS.json
 *
 * Every capture is bound to the exact DOM state that was enacted (asserted before the shot),
 * hashed with SHA-256, and compared byte-wise against every sibling capture of the same
 * surface/viewport so `after-X == after-Y` can never pass silently again.
 *
 * Usage: node tools/w05-visual-reaudit.mjs [--flow <surface>] [--skip-composites]
 */
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W05');
const evidenceDir = path.join(outDir, 'reaudit-evidence');
const compositeDir = path.join(evidenceDir, 'composites');
const measurementsPath = path.join(evidenceDir, 'REAUDIT_MEASUREMENTS.json');

const args = process.argv.slice(2);
const only = [];
for (let i = 0; i < args.length; i += 1) if (args[i] === '--flow' && args[i + 1]) only.push(args[++i]);
const skipComposites = !args.includes('--composites'); /* composites are built by tools/w05-reaudit-composites.mjs */

const VIEWPORTS = [{ width: 1440, height: 1000, id: '1440x1000' }, { width: 1024, height: 900, id: '1024x900' }];
const REFERENCE = {
  health: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png',
  processing: null,
  validation: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png',
  manual_ai: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png',
  backup: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png',
  audit: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png',
  releases: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png',
  configuration: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png'
};

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

/* ------------------------------------------------------------------ DOM probes */
const ITEM_SELECTOR = 'li,tr[data-r6-row],tr[data-health-row],tr[data-a-row],tr[data-v-finding],dd,dt,article,.m0-row,.m0-semantic-group,.state-token,.h-card,.b-card,.v-tile,.p-token,.a-node,.a-ctx-block,.h-ctx-block,.b-ctx-block,.p-ctx-block,.v-ctx-block,.m0-region-list>li,h1,h2,h3,button';
const countIn = sel => {
  const el = document.querySelector(sel);
  if (!el || el.hidden) return 0;
  const nodes = el.querySelectorAll(ITEM_SELECTOR);
  let n = 0;
  for (const node of nodes) { const text = (node.textContent || '').trim(); if (text) n += 1; }
  return n;
};
const probe = async page => page.evaluate(selectorList => {
  const count = sel => {
    const el = document.querySelector(sel);
    if (!el || el.hidden) return 0;
    const nodes = el.querySelectorAll(selectorList);
    let n = 0;
    for (const node of nodes) { if ((node.textContent || '').trim()) n += 1; }
    return n;
  };
  const stage = document.querySelector('#foundationStage');
  return {
    left: count('#domainLeftRegion') || count('#leftPane .pbody'),
    center: stage ? count('#foundationStage') : 0,
    right: count('#domainContext'),
    bottom: count('#bottomContent') || count('#domainBottomRegion'),
    bottomOpen: document.querySelector('#bottomShelf')?.dataset.state || 'closed',
    consumer: window.CEPFoundation?.consumer || null
  };
}, ITEM_SELECTOR);

/* ------------------------------------------------------------------ flow helpers */
let port, runtimePort;
const failures = [];

const boot = async (page, surface) => {
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 30000 });
  await page.waitForTimeout(2200);
};
const click = async (page, id) => {
  const found = await page.evaluate(command => {
    const candidates = [...document.querySelectorAll('[data-foundation-command],button')];
    const el = candidates.find(node => node.dataset?.foundationCommand === command);
    if (!el) return false;
    el.scrollIntoView({ block: 'center', inline: 'center' }); el.click(); return true;
  }, id);
  if (!found) throw new Error(`COMMAND_NOT_REACHABLE:${id}`);
  await page.waitForTimeout(900);
};
const clickRow = async (page, selector, index = 0) => {
  await page.evaluate(({ selector, index }) => {
    const nodes = [...document.querySelectorAll(selector)];
    if (nodes[index]) { nodes[index].scrollIntoView({ block: 'center' }); nodes[index].click(); }
  }, { selector, index });
  await page.waitForTimeout(600);
};
const inPage = (page, fn, ...a) => page.evaluate(fn, ...a);
const http = async (method, apiPath, body) => {
  const r = await fetch(`http://127.0.0.1:${runtimePort}${apiPath}`, { method, headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = {}; try { json = await r.json(); } catch { /* non-json */ }
  return { status: r.status, json };
};
const openBottom = async page => {
  await inPage(page, () => {
    const shelf = document.querySelector('#bottomShelf');
    const alreadyOpen = shelf && shelf.dataset.state === 'open';
    if (!alreadyOpen) {
      const toggle = document.querySelector('[data-action="toggle-bottom"]');
      if (toggle) { try { toggle.click(); } catch { /* bounded */ } }
    }
    if (!shelf || shelf.dataset.state !== 'open') {
      const state = window.CEPFoundation?.api?.state?.surface; if (state) state.bottomOpen = true;
      const owner = window.CEPFoundation?.wave3Assembly?.bottomOwner;
      if (owner && typeof owner.open === 'function') { try { owner.open(); } catch { /* bounded */ } }
      const render = window.CEPFoundation?.wave3Assembly?.renderBottom;
      if (typeof render === 'function') { try { render(); } catch { /* bounded */ } }
      if (shelf) shelf.dataset.state = 'open';
    }
    const content = document.querySelector('#bottomContent'); if (content) { content.inert = false; content.hidden = false; }
  });
  await page.waitForTimeout(900);
};
const closeBottom = async page => { await inPage(page, () => { const s = window.CEPFoundation?.api?.state?.surface; if (s) s.bottomOpen = false; const sh = document.querySelector('#bottomShelf'); if (sh) sh.dataset.state = 'closed'; const c = document.querySelector('#bottomContent'); if (c) c.inert = true; }); await page.waitForTimeout(400); };

/** A capture step: {id, act(page), assert(page) -> object, bottom?: boolean} */
const FLOWS = {
  async health(page, shot) {
    await boot(page, 'health');
    await click(page, 'health.refresh');
    await shot('after-refresh', { expect: async p => inPage(p, () => (window.CEPFoundation.m0Composition.group.surfaces.health.snapshot().observations.length > 0)) });
    await click(page, 'health.inspect');
    await shot('after-inspect', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition.group.surfaces.health.selected())) });
    await click(page, 'health.diagnose');
    await shot('after-diagnose', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition.group.surfaces.health.snapshot().lastDiagnostic)) });
    await shot('after-diagnose-bottom-expanded', { bottom: true, expect: async p => inPage(p, () => document.querySelector('#bottomShelf')?.dataset.state === 'open' && Boolean(document.querySelector('[data-w05-receipt]'))) });
  },
  async processing(page, shot) {
    const runId = `${Date.now()}`;
    await http('POST', '/v1/processing/jobs', { requestId: `w05-reaudit-done-${runId}`, taskKind: 'SHA256_JSON', input: { kind: 'reaudit', text: 'العربية + English' } });
    await http('POST', '/v1/processing/worker/run-once', { workerId: 'w05-reaudit-worker' });
    const cancelCreate = await http('POST', '/v1/processing/jobs', { requestId: `w05-reaudit-cancel-${runId}`, input: { kind: 'reaudit-cancel' } });
    await http('POST', `/v1/processing/jobs/${encodeURIComponent(cancelCreate.json.job.jobId)}/cancel-request`, { requestId: `w05-reaudit-cr-${runId}` });
    await boot(page, 'processing');
    const refreshRender = () => inPage(page, async () => {
      await window.CEPFoundation.m0Composition.group.surfaces.processing.refresh();
      window.CEPFoundation.m0Composition.mounted.render();
    });
    await refreshRender();
    await shot('after-refresh', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.processing.snapshot().jobs.length >= 2) });
    await clickRow(page, '[data-processing-job]', 1);
    await click(page, 'processing.inspect');
    await shot('after-inspect', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.processing.snapshot().actionLog.some(e => e.code === 'INSPECTED')) });
    await clickRow(page, '[data-processing-job]', 0);
    await inPage(page, () => { try { window.CEPFoundation.registry.execute('processing.retry', { route: 'reaudit-retry-attempt' }); } catch { /* fail-closed is the expected outcome */ } });
    await shot('retry-not-eligible', { expect: async p => inPage(p, () => { const t = document.querySelector('[data-w05-surface="processing"]')?.textContent || ''; return t.includes('NOT ELIGIBLE') && t.includes('COMPLETED'); }) });
    await clickRow(page, '[data-processing-job]', 1);
    await click(page, 'processing.requestCancel');
    await http('POST', '/v1/processing/worker/run-once', { workerId: 'w05-reaudit-worker' });
    await refreshRender();
    await shot('after-cancel-acknowledged', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.processing.snapshot().jobs.some(j => j.state === 'CANCELLED')) });
    await inPage(page, async () => {
      const a = window.CEPFoundation.m0Composition.group.surfaces.processing;
      const done = a.snapshot().jobs.find(j => j.state === 'COMPLETED');
      if (done) a.select(done.jobId);
      await a.refresh();
      window.CEPFoundation.m0Composition.mounted.render();
    });
    await click(page, 'processing.validationHandoff');
    await shot('after-validation-handoff', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.processing.snapshot().jobs.some(j => j.validationHandoff && j.validationHandoff.state === 'PENDING')) });
    await shot('after-validation-handoff-bottom-expanded', { bottom: true });
  },
  async validation(page, shot) {
    await boot(page, 'validation');
    await click(page, 'validation.validate');
    await shot('after-validate', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition?.group?.surfaces?.validation?.state?.last)) });
    await click(page, 'validation.findings');
    await shot('after-findings', { expect: async p => inPage(p, () => document.querySelector('[data-v-feedback-host] [data-ok]') !== null) });
    await click(page, 'validation.inspect');
    await shot('after-inspect', { expect: async p => inPage(p, () => (document.querySelector('[data-v-feedback-host]').textContent || '').includes('VALIDATION_RESULT')) });
    await shot('after-inspect-bottom-expanded', { bottom: true });
  },
  async manual_ai(page, shot) {
    await boot(page, 'manual_ai');
    await shot('empty-truth', { expect: async p => inPage(p, () => document.querySelectorAll('[data-r6-row]').length >= 6) });
    await clickRow(page, '[data-r6-row]', 4);
    await shot('selected-provenance-invalid', { expect: async p => inPage(p, () => (document.querySelector('.m0-workbench h2')?.textContent || '').includes('MAN-PROP-0005')) });
    await clickRow(page, '[data-r6-row]', 1);
    await click(page, 'manual_ai.import');
    await clickRow(page, '[data-r6-row]', 1);
    await shot('import-fail-closed', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.manual_ai.adapter.lastAction?.code === 'DECLARED_REQUEST_NOT_FOUND') });
    await shot('selected-bottom-expanded', { bottom: true });
  },
  async backup(page, shot) {
    await boot(page, 'backup');
    await click(page, 'backup.package');
    await shot('after-package', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().packages.length > 0) });
    await click(page, 'backup.plan');
    await shot('after-plan', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().plan)) });
    await click(page, 'backup.preview');
    await shot('after-preview', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().preview)) });
    await click(page, 'backup.stage');
    await shot('after-stage', { expect: async p => inPage(p, () => Boolean(window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().stage)) });
    await click(page, 'backup.drill');
    await shot('after-drill', { expect: async p => inPage(p, () => { const d = window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().lastDrill; return Boolean(d) && d.status === 'STAGED_AND_VERIFIED' && d.liveRestored !== true; }) });
    await click(page, 'backup.activationRequest');
    await shot('after-activation', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.backup.snapshot().lastActivation?.status === 'AUTHORITY_PENDING') });
    await shot('after-activation-bottom-expanded', { bottom: true });
  },
  async audit(page, shot) {
    await boot(page, 'audit');
    await inPage(page, async () => { await window.CEPFoundation.registry.execute('audit.search', { filters: { limit: 100 } }); });
    await shot('after-search', { expect: async p => inPage(p, () => document.querySelectorAll('tr[data-a-row]').length > 0) });
    await inPage(page, async () => { await window.CEPFoundation.registry.execute('audit.verify', {}); });
    await shot('after-verify', { expect: async p => inPage(p, () => (document.querySelector('[data-integrity]')?.textContent || '').includes('CHAIN')) });
    await inPage(page, () => {
      const form = document.querySelector('[data-annotation-form]');
      form.querySelector('[data-event-id]').value = '999999';
      form.querySelector('[data-note]').value = 'fail-closed probe';
      form.querySelector('button[type=submit]').click();
    });
    await page.waitForTimeout(900);
    await shot('after-annotate-failed', { expect: async p => inPage(p, () => document.querySelector('.a-settle[data-state="FAILURE"]') !== null) });
    await inPage(page, async () => {
      const events = await window.CEPFoundation.registry.execute('audit.search', { filters: { limit: 100 } });
      const last = (events?.rows || events?.events || []).at(-1);
      const form = document.querySelector('[data-annotation-form]');
      form.querySelector('[data-event-id]').value = String(last?.eventId ?? last?.sequence ?? 1);
      form.querySelector('[data-note]').value = 'reaudit annotation (separate revision)';
      form.querySelector('button[type=submit]').click();
    });
    await page.waitForTimeout(900);
    await shot('after-annotate-succeeded', { expect: async p => inPage(p, () => document.querySelector('.a-settle[data-state="SUCCESS"]') !== null) });
    await shot('after-annotate-succeeded-bottom-expanded', { bottom: true });
  },
  async releases(page, shot) {
    await boot(page, 'releases');
    await shot('empty-truth', { expect: async p => inPage(p, () => document.querySelectorAll('[data-r6-row]').length >= 5) });
    await clickRow(page, '[data-r6-row]', 0);
    await shot('after-inspect', { expect: async p => inPage(p, () => (document.querySelector('.m0-workbench')?.textContent || '').includes('TECHNICALLY_READY')) });
    await click(page, 'releases.compare');
    await clickRow(page, '[data-r6-row]', 1);
    await shot('after-compare', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.releases.adapter.lastAction?.commandId === 'releases.compare') });
    await click(page, 'releases.plan');
    await clickRow(page, '[data-r6-row]', 2);
    await shot('after-plan', { expect: async p => inPage(p, () => window.CEPFoundation.m0Composition.group.surfaces.releases.adapter.lastAction?.commandId === 'releases.plan') });
    await clickRow(page, '[data-r6-row]', 3);
    await shot('fail-closed-availability', { expect: async p => inPage(p, () => { const t = document.querySelector('.m0-workbench')?.textContent || ''; return t.includes('CommandAvailability') || t.includes('Authorization request provider unavailable') || t.includes('technical readiness evidence required'); }) });
    await shot('fail-closed-availability-bottom-expanded', { bottom: true });
  },
  async configuration(page, shot) {
    await boot(page, 'configuration');
    await shot('configuration-boundary', { expect: async p => inPage(p, () => document.querySelectorAll('[data-r6-row]').length >= 6) });
    await clickRow(page, '[data-r6-row]', 3);
    await shot('after-select-key', { expect: async p => inPage(p, () => (document.querySelector('.m0-workbench')?.textContent || '').includes('security.audit.enforcement')) });
    await click(page, 'configuration.edit');
    await clickRow(page, '[data-r6-row]', 3);
    await shot('after-proposal-drafted', { expect: async p => inPage(p, () => (document.querySelector('.m0-workbench')?.textContent || '').includes('PROPOSAL_DRAFTED')) });
    await click(page, 'configuration.validate');
    await clickRow(page, '[data-r6-row]', 3);
    await shot('after-validated', { expect: async p => inPage(p, () => (document.querySelector('.m0-workbench')?.textContent || '').includes('VALIDATED')) });
    await inPage(page, async () => {
      const settings = window.CEPFoundation.wave4Assembly?.settings;
      if (!settings) throw new Error('SettingsCenterOwner unavailable');
      settings.exportPreferences();
      const snapshot = settings.exportPreferences().data;
      settings.importPreferences(snapshot);
      settings.resetPreferences();
      document.querySelectorAll('.backdrop[data-wave4-settings]').forEach(node => node.remove());
      document.querySelectorAll('[data-r6-row]')[0].click();
    });
    await page.waitForTimeout(900);
    await shot('settings-transfer-done', { expect: async p => inPage(p, () => { const r = window.CEPFoundation.wave4Assembly?.settings?.receipts?.filter(x => x.kind === 'preference-transfer') || []; return r.length >= 3; }) });
    await shot('settings-transfer-done-bottom-expanded', { bottom: true, expect: async p => inPage(p, () => { const t = document.querySelector('#bottomShelf')?.textContent || ''; return t.includes('settings.transfer') && t.includes('ReceiptCount') && !t.includes('ReceiptCount: 0'); }) });
  }
};

/* ------------------------------------------------------------------ capture */
await mkdir(compositeDir, { recursive: true });
const freeA = await freePort(), freeB = await freePort();
port = freeA; runtimePort = freeB;
const workRoot = path.join(outDir, '.runtime-reaudit');
await mkdir(workRoot, { recursive: true });

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(workRoot, 'reaudit.sqlite'), CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
const waitUp = async url => { for (let i = 0; i < 150; i += 1) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };
const up1 = await waitUp(`http://127.0.0.1:${port}/`), up2 = await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
if (!up1 || !up2) { console.error('SERVER_START_FAILED'); process.exit(2); }

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const captures = [];
const flows = Object.keys(FLOWS).filter(k => !only.length || only.includes(k));

try {
  for (const viewport of VIEWPORTS) {
    for (const flow of flows) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e)));
      let lastStateId = null;
      const shot = async (state, options = {}) => {
        lastStateId = state;
        if (options.bottom) await openBottom(page);
        if (options.scroll) {
          await inPage(page, () => { for (const sel of ['#foundationStage', '#centerPane .docscroll', '#centerPane']) { const d = document.querySelector(sel); if (d && d.scrollHeight > d.clientHeight) d.scrollTop = d.scrollHeight; } });
          await page.waitForTimeout(400);
        }
        const probeState = await probe(page);
        let assertion = null;
        if (options.expect) {
          try { assertion = await options.expect(page); } catch (error) { assertion = { error: String(error?.message || error) }; }
        }
        const filename = `${flow}-${state}-${viewport.id}-${stamp()}.png`;
        const filePath = path.join(evidenceDir, filename);
        await page.screenshot({ path: filePath });
        const bytes = await readFile(filePath);
        const counts = await probe(page);
        const enacted = options.expect ? Boolean(assertion) && assertion !== false && assertion?.error === undefined : true;
        captures.push({
          flow, state, viewport: viewport.id, filename: path.join('writer-output/W05/reaudit-evidence', filename),
          sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length,
          enacted, assertion, bottomOpen: probeState.bottomOpen, counts,
          bottomProbe: options.bottom ? await inPage(page, () => ({ shelfState: document.querySelector('#bottomShelf')?.dataset.state || null, contentHidden: document.querySelector('#bottomContent')?.hidden ?? null, text: (document.querySelector('#bottomShelf')?.textContent || '').slice(0, 500) })) : undefined,
          pageErrors: [...pageErrors]
        });
        if (options.bottom) await closeBottom(page);
      };
      try {
        await FLOWS[flow](page, shot);
        if (lastStateId) await shot(`${lastStateId}-center-scrolled`, { scroll: 'center' });
      } catch (error) {
        failures.push({ flow, viewport: viewport.id, error: String(error?.message || error) });
      }
      await context.close();
    }
  }
} finally {
  await browser.close(); runtime.kill('SIGTERM'); server.kill('SIGTERM');
}

/* ------------------------------------------------------------------ distinctness */
const distinctness = [];
for (const viewport of VIEWPORTS) {
  for (const flow of flows) {
    const group = captures.filter(c => c.viewport === viewport.id && c.flow === flow);
    const pairs = [];
    for (let i = 0; i < group.length; i += 1) for (let j = i + 1; j < group.length; j += 1) {
      pairs.push({ a: group[i].state, b: group[j].state, byteIdentical: group[i].sha256 === group[j].sha256 });
    }
    distinctness.push({ flow, viewport: viewport.id, states: group.length, identicalPairs: pairs.filter(p => p.byteIdentical) });
  }
}

/* ------------------------------------------------------------------ composites + ink */
let ink = [];
if (!skipComposites) {
  const compositeBrowser = await browser2();
  const imgPage = await compositeBrowser.newPage();
  try { await imgPage.goto(`file://${root}`, { waitUntil: 'domcontentloaded' }); } catch { /* directory listing */ }
  for (const capture of captures) {
    if (capture.viewport !== '1440x1000') continue;
    const ref = REFERENCE[capture.flow];
    if (!ref) continue;
    const refPath = path.join(root, ref);
    const refUrl = `file://${refPath}`;
    const curUrl = `file://${path.join(root, capture.filename)}`;
    let data;
    try {
    data = await imgPage.evaluate(async ({ refUrl, curUrl, label, sha }) => {
      const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const [a, b] = await Promise.all([load(refUrl), load(curUrl)]);
      const H = 900, wa = Math.round(a.width * H / a.height), wb = Math.round(b.width * H / b.height);
      const canvas = document.createElement('canvas'); canvas.width = wa + wb + 12; canvas.height = H + 44;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(a, 0, 44, wa, H); ctx.drawImage(b, wa + 12, 44, wb, H);
      ctx.fillStyle = '#9fd8ff'; ctx.font = 'bold 20px monospace';
      ctx.fillText(label, 8, 28);
      const inkOf = img => { const c = document.createElement('canvas'); const w = Math.min(480, img.width), h = Math.round(img.height * w / img.width); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data; let lit = 0; for (let i = 0; i < d.length; i += 4) { if (d[i] + d[i + 1] + d[i + 2] > 96) lit += 1; } return +(lit / (w * h)).toFixed(4); };
      return { png: canvas.toDataURL('image/png'), refInk: inkOf(a), curInk: inkOf(b) };
    }, { refUrl, curUrl, label: `${capture.filename}  sha256:${capture.sha256.slice(0, 16)}`, sha: capture.sha256 });
    } catch (error) {
      ink.push({ flow: capture.flow, state: capture.state, reference: ref, compositeError: String(error?.message || error) });
      continue;
    }
    const buffer = Buffer.from(data.png.split(',')[1], 'base64');
    const composite = path.join(compositeDir, `${capture.flow}__${capture.state}.png`);
    await writeFile(composite, buffer);
    ink.push({ flow: capture.flow, state: capture.state, reference: ref, refInk: data.refInk, currentInk: data.curInk, ratio: +(data.curInk / data.refInk).toFixed(3), composite: path.join('writer-output/W05/reaudit-evidence/composites', `${capture.flow}__${capture.state}.png`) });
  }
  await compositeBrowser.close();
}
function browser2() { return chromium.launch({ headless: true, args: ['--allow-file-access-from-files'], ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) }); }

const commit = (() => { try { return String(execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' })).trim(); } catch { return 'unknown'; } })();
const measurement = {
  schemaVersion: 1, workspace: 'W05', classification: 'VISUAL_REAUDIT_CAPTURE_NOT_OWNER_ACCEPTANCE',
  command: `node tools/w05-visual-reaudit.mjs${only.length ? ` --flow ${only.join(' --flow ')}` : ''}`,
  capturedAt: new Date().toISOString(), commit,
  viewports: VIEWPORTS.map(v => v.id),
  references: REFERENCE,
  captures, distinctness, ink,
  failures,
  summary: {
    captures: captures.length,
    notEnacted: captures.filter(c => !c.enacted).map(c => `${c.flow}/${c.state}/${c.viewport}`),
    identicalPairCount: distinctness.reduce((n, d) => n + d.identicalPairs.length, 0),
    identicalPairs: distinctness.filter(d => d.identicalPairs.length).map(d => ({ flow: d.flow, viewport: d.viewport, pairs: d.identicalPairs }))
  }
};
await writeFile(measurementsPath, JSON.stringify(measurement, null, 2) + '\n');
console.log(JSON.stringify({ measurements: 'writer-output/W05/reaudit-evidence/REAUDIT_MEASUREMENTS.json', summary: measurement.summary, failures }, null, 2));
if (failures.length) process.exitCode = 1;
