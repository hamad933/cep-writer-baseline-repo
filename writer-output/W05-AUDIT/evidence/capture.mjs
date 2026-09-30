/**
 * W05-AUDIT visual capture — evidence for VISUAL_EXECUTION_REPORT.json.
 * Binds every shot to candidate+commit+viewport+timestamp+image identity (path+sha256+dims).
 * Usage: node writer-output/W05-AUDIT/evidence/capture.mjs
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../../../', import.meta.url));
const outDir = path.join(root, 'writer-output/W05-AUDIT/evidence');
const runtimeRoot = path.join(root, 'writer-output/W05-AUDIT/.runtime');
await mkdir(outDir, { recursive: true });

const commit = (() => { try { return execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch { return 'UNKNOWN'; } })();
const dirty = (() => { try { return execSync('git status --porcelain -- stack/native-typescript/surfaces/audit stack/native-typescript/adapters/audit.ts', { cwd: root }).toString().trim().length > 0; } catch { return true; } })();
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const webPort = await freePort(), runtimePort = await freePort();

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(webPort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(runtimeRoot, 'p.sqlite'), CEP_STAGING_ROOT: path.join(runtimeRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(runtimeRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise(r => setTimeout(r, 100)); } return false; };
const up1 = await waitUp(`http://127.0.0.1:${webPort}/`), up2 = await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
if (!up1 || !up2) { console.error(JSON.stringify({ SERVER_START_FAILED: { web: up1, runtime: up2 } })); process.exit(2); }

/* Seed realistic durable AuditEvents through the provider's own append API (same technique as
   tools/w05-browser-flows.mjs audit.trail-recording). Every seeded row is genuinely hash-chained
   server-side by AuditEventProvider — this is fixture state, never claimed as Owner data. */
const http = async (method, p, body) => {
  const r = await fetch(`http://127.0.0.1:${runtimePort}${p}`, { method, headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined: JSON.stringify(body) });
  let json = {}; try { json = await r.json(); } catch {}
  return { status: r.status, json };
};
const base = Date.now();
const seeded = [
  [58, 'Sara', 'CREATE_CANDIDATE_EVIDENCE_HANDOFF', 'RESULT-0042-R1', 'SUCCESS', 'TRACE-5B9C-22A1', { workspace: 'Simulation', source: 'Web UI', client: 'Web UI', account: 'sara@cep.local', actorType: 'user', ip: '10.10.30.55', session: 'sess-8f3a93c2d6b1e', timezone: 'Asia/Riyadh', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'مشغّلة محاكاة', en: 'Simulation Operator' }, group: { ar: 'فريق المحاكاة', en: 'Simulation Team' }, related: ['EVD-FILE-7781', 'SIM-0098'] }],
  [55, 'Evidence Service', 'EVIDENCE_FILE_STORED', 'EVD-FILE-7781', 'SUCCESS', 'TRACE-5B9C-22A1', { workspace: 'Evidence', source: 'Evidence Service', client: 'Evidence Service', account: 'evidence-svc@cep.local', actorType: 'system', node: 'runner-01', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'خدمة الأدلة', en: 'Evidence Service' }, group: { ar: 'النظام الأساسي', en: 'Core Platform' }, related: ['RESULT-0042-R1'] }],
  [52, 'Evidence Service', 'EVIDENCE_METADATA_INDEXED', 'EVD-FILE-7781', 'SUCCESS', 'TRACE-5B9C-22A1', { workspace: 'Evidence', source: 'Evidence Service', client: 'Evidence Service', account: 'evidence-svc@cep.local', actorType: 'system', node: 'runner-01', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'خدمة الأدلة', en: 'Evidence Service' }, group: { ar: 'النظام الأساسي', en: 'Core Platform' } }],
  [50, 'Omar', 'ACCESS_DENIED', 'CFG-OBJ-1127', 'DENIED', 'TRACE-6D4E-9F01', { workspace: 'System & Operations', source: 'Web UI', client: 'Web UI', account: 'omar@cep.local', actorType: 'user', ip: '10.10.30.61', session: 'sess-41c07ae5b9d2f', timezone: 'Asia/Riyadh', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'مهندس التكوين', en: 'Configuration Engineer' }, group: { ar: 'فريق التشغيل', en: 'Operations Team' }, notice: { ar: 'رُفض التعديل خارج نافذة التدقيق المعتمدة؛ السجل يبقى مفتوحًا ولا تُطبَّق أي كتابة.', en: 'The edit was rejected outside the approved audit window; the record stays open and no write is applied.' } }],
  [47, 'Fadi', 'UPDATE_SIMULATION_PARAMETERS', 'SIM-0098', 'SUCCESS', 'TRACE-7E9D-0F34', { workspace: 'Simulation', source: 'Web UI', client: 'Web UI', account: 'fadi@cep.local', actorType: 'user', ip: '10.10.30.47', session: 'sess-b72d1f0c48a63', timezone: 'Asia/Riyadh', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'محلّل النتائج', en: 'Results Analyst' }, group: { ar: 'فريق المحاكاة', en: 'Simulation Team' }, before: '{"seed":1042,"steps":500}', after: '{"seed":1042,"steps":1200}' }],
  [44, 'Ahmed', 'APPROVE_RELEASE_CANDIDATE', 'REL-2026.08.30-RC1', 'SUCCESS', 'TRACE-1A2B-4D8E', { workspace: 'System & Operations', source: 'Web UI', client: 'Web UI', account: 'ahmed@cep.local', actorType: 'user', ip: '10.10.30.29', session: 'sess-2e59ba7f1c084', timezone: 'Asia/Riyadh', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'مدير الإصدارات', en: 'Release Manager' }, group: { ar: 'فريق الإصدارات', en: 'Release Engineering' }, related: ['REL-2026.08.30-RC1'] }],
  [41, 'Scheduler', 'VALIDATE_BACKUP', 'BKP-2026-08-30-001', 'SUCCESS', 'TRACE-3C6D-7781', { workspace: 'System & Operations', source: 'Scheduler', client: 'Scheduler', account: 'scheduler@cep.local', actorType: 'system', node: 'runner-02', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'مُجدوِل المهام', en: 'Job Scheduler' }, group: { ar: 'النظام الأساسي', en: 'Core Platform' }, related: ['POL-BKP-0004'] }],
  [38, 'System', 'RESTORE_REHEARSAL', 'BKP-2026-08-30-001', 'PARTIAL_SUCCESS', 'TRACE-3C6D-7781', { workspace: 'System & Operations', source: 'Scheduler', client: 'Scheduler', account: 'platform@cep.local', actorType: 'system', node: 'runner-01', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'منصة النظام', en: 'Platform System' }, group: { ar: 'النظام الأساسي', en: 'Core Platform' }, notice: { ar: 'اكتملت إعادة التشغيل التجريبي مع فرع واحد لم يُتحقّق منه بعد. أوقات التدقيق المعتمدة 08:00 – 18:00.', en: 'The rehearsal completed with one branch still unverified. Approved audit window is 08:00 – 18:00.' } }],
  [35, 'Controller', 'PROMOTE_RELEASE', 'REL-2026.08.30-RC1', 'SUCCESS', 'TRACE-1A2B-4D8E', { workspace: 'System & Operations', source: 'Release Bot', client: 'Release Bot', account: 'controller@cep.local', actorType: 'controller', node: 'runner-01', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'مراقب الامتثال', en: 'Compliance Controller' }, group: { ar: 'الحوكمة', en: 'Governance' }, related: ['SIM-0098'] }],
  [32, 'Policy Engine', 'POLICY_EVALUATION', 'POL-SEC-0021', 'SUCCESS', 'TRACE-9C1E-44D2', { workspace: 'System & Operations', source: 'Policy Engine', client: 'Policy Engine', account: 'policy-eng@cep.local', actorType: 'system', node: 'runner-02', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'محرّك السياسات', en: 'Policy Engine' }, group: { ar: 'الحوكمة', en: 'Governance' }, related: ['POL-BKP-0004'] }],
  [28, 'Fadi', 'RESULT_PUBLISHED', 'RESULT-0042-R1', 'SUCCESS', 'TRACE-C4F1-2E77', { workspace: 'Simulation', source: 'Web UI', client: 'Web UI', account: 'fadi@cep.local', actorType: 'user', ip: '10.10.30.47', session: 'sess-b72d1f0c48a63', timezone: 'Asia/Riyadh', environment: 'prod', region: 'ME-01', service: 'audit-service', role: { ar: 'محلّل النتائج', en: 'Results Analyst' }, group: { ar: 'فريق المحاكاة', en: 'Simulation Team' }, related: ['RUN-0042'] }]
];
let seededOk = 0;
for (const [ago, actor, action, target, outcome, trace, details] of seeded) {
  const res = await http('POST', '/v1/audit/events', { eventId: `EVT-${trace.slice(6)}-P${String(seededOk + 1).padStart(3, '0')}`, occurredAt: new Date(base - ago * 60000).toISOString(), actor, action, target, outcome, correlationId: trace, details: { ...details, environment: details.environment || 'prod', seededFixture: true } });
  if (res.status === 201) seededOk++;
}
const verify0 = await http('GET', '/v1/audit/verify');
console.log(JSON.stringify({ seededOk, providerVerify: verify0.json }));

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const captures = [];
const errors = [];

async function shot(page, name) {
  const file = path.join(outDir, `${name}-${stamp()}.png`);
  await page.screenshot({ path: file });
  const bytes = await readFile(file);
  const dims = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, lang: document.documentElement.lang, dir: document.documentElement.dir, consumer: window.CEPFoundation?.consumer }));
  const sha = createHash('sha256').update(bytes).digest('hex');
  captures.push({ name, path: path.relative(root, file), sha256: sha, bytes: bytes.length, viewport: `${dims.w}x${dims.h}`, lang: dims.lang, dir: dims.dir, consumer: dims.consumer, capturedAt: new Date().toISOString() });
  return file;
}

async function boot(page, { locale = null } = {}) {
  const url = `http://127.0.0.1:${webPort}/?surface=audit&persistencePort=${runtimePort}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === 'audit', undefined, { timeout: 30000 });
  await page.waitForTimeout(2600);
  if (locale) {
    await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, locale);
    await page.waitForTimeout(1200);
  }
}

const VIEWPORTS = [{ width: 1536, height: 1024, id: '1536x1024' }, { width: 1440, height: 1000, id: '1440x1000' }, { width: 1024, height: 900, id: '1024x900' }, { width: 820, height: 1180, id: '820x1180' }];

try {
  /* 1. Reference-matched viewport — default active language (AR/RTL per product state) */
  {
    const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`ar:${String(e)}`));
    await boot(page, { locale: 'ar' });
    const state = await page.evaluate(() => ({
      rows: document.querySelectorAll('tr[data-a-row]').length,
      integrity: document.querySelector('[data-integrity]')?.textContent || '',
      chain: document.querySelectorAll('.a-node').length,
      ctxBlocks: document.querySelectorAll('.a-ctx-block').length,
      tabs: document.querySelectorAll('[data-a-tab]').length,
      scopes: document.querySelectorAll('[data-a-scope]').length,
      title: document.querySelector('[data-a-title]')?.textContent || ''
    }));
    console.log(JSON.stringify({ arState: state }));
    await shot(page, 'ar-rtl-full-1536');
    // select the evidence-handoff row (reference selected row) → chain + inspector update
    await page.evaluate(() => { const r = [...document.querySelectorAll('tr[data-a-row]')].find(x => (x.textContent || '').includes('CREATE_CANDIDATE_EVIDENCE_HANDOFF')); if (r) r.click(); });
    await page.waitForTimeout(700);
    await shot(page, 'ar-rtl-selected-1536');
    // verify chain command
    await page.evaluate(() => window.CEPFoundation.registry.execute('audit.verify', { route: 'capture.verify' }));
    await page.waitForTimeout(900);
    await shot(page, 'ar-rtl-verified-1536');
    // tab states: verification log + trace
    await page.evaluate(() => document.querySelector('[data-a-tab="log"]')?.click());
    await page.waitForTimeout(500);
    await shot(page, 'ar-rtl-tab-log-1536');
    await page.evaluate(() => document.querySelector('[data-a-tab="diff"]')?.click());
    await page.waitForTimeout(500);
    await shot(page, 'ar-rtl-tab-diff-1536');
    // scrolled center: deck visible
    await page.evaluate(() => { const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = s.scrollHeight; });
    await page.waitForTimeout(500);
    await shot(page, 'ar-rtl-center-scrolled-1536');
    // annotation fail-closed (settlement receipt)
    await page.evaluate(() => {
      const form = document.querySelector('[data-annotation-form]');
      form.querySelector('[data-event-id]').value = '999999';
      form.querySelector('[data-note]').value = 'fail-closed capture probe';
      form.querySelector('button[type=submit]').click();
    });
    await page.waitForTimeout(1200);
    await shot(page, 'ar-rtl-annotate-failed-1536');
    await ctx.close();
  }

  /* 2. EN / LTR — language policy proof (same candidate) */
  {
    const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`en:${String(e)}`));
    await boot(page, { locale: 'en' });
    const state = await page.evaluate(() => ({ rows: document.querySelectorAll('tr[data-a-row]').length, lang: document.documentElement.lang, dir: document.documentElement.dir, title: document.querySelector('[data-a-title]')?.textContent || '' }));
    console.log(JSON.stringify({ enState: state }));
    await shot(page, 'en-ltr-full-1536');
    await ctx.close();
  }

  /* 3. Responsive viewports (default language) */
  for (const vp of VIEWPORTS.slice(1)) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`${vp.id}:${String(e)}`));
    await boot(page);
    await shot(page, `responsive-${vp.id}`);
    await page.evaluate(() => { const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = s.scrollHeight; });
    await page.waitForTimeout(400);
    await shot(page, `responsive-${vp.id}-scrolled`);
    await ctx.close();
  }

  /* 4. Bottom shelf expanded (deep ledger) */
  {
    const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await boot(page);
    await page.evaluate(() => {
      const state = CEPFoundation?.api?.state?.surface; if (state) state.bottomOpen = true;
      const shelf = document.querySelector('#bottomShelf'); if (shelf) shelf.dataset.state = 'open';
      const content = document.querySelector('#bottomContent'); if (content) { content.inert = false; content.hidden = false; content.removeAttribute('aria-hidden'); }
      CEPFoundation?.registry?.execute?.('audit.search', { filters: {}, route: 'capture.bottom' });
    });
    await page.waitForTimeout(1200);
    await shot(page, 'bottom-expanded-1536');
    await ctx.close();
  }

  /* 5. Left/right pane collapsed (center-only composition) */
  {
    const ctx = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await boot(page);
    await page.evaluate(() => { CEPFoundation.preferences.set('left', 'collapsed', 'global'); CEPFoundation.preferences.set('right', 'collapsed', 'global'); CEPFoundation.workspace.applyPreferences(); });
    await page.waitForTimeout(900);
    await shot(page, 'panes-collapsed-1536');
    await ctx.close();
  }
} finally {
  await browser.close();
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

const lineage = {
  schemaVersion: 1, unit: 'W05-AUDIT', surface: 'audit',
  candidate: { commit, dirtyAuditFiles: dirty, files: ['stack/native-typescript/surfaces/audit/index.ts', 'stack/native-typescript/adapters/audit.ts'] },
  environment: { node: process.version, web: `http://127.0.0.1:${webPort}/`, runtime: `http://127.0.0.1:${runtimePort}`, runtimeRoot: path.relative(root, runtimeRoot) },
  reference: { path: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png', sha256: '7cb34c8357dfad0914e4eeaf732c97efbe376e957fe508137c4f730edaeb1e88', classification: 'OWNER_CONFIRMED_FINAL_REFERENCE' },
  fixtureState: { providerSeededEvents: seededOk, providerVerify: verify0.json, sessionDomain: 'AuditEventDomain SESSION_HISTORY fixtures (SESSION_LOCAL)' },
  captures, errors
};
await writeFile(path.join(outDir, 'capture-lineage.json'), JSON.stringify(lineage, null, 2));
console.log(JSON.stringify({ captures: captures.length, errors: errors.length, lineage: path.join(outDir, 'capture-lineage.json') }));
