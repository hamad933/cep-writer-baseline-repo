/**
 * W05-AUDIT visual capture v2 — BEFORE/AFTER defect-closure evidence for AUD-V1/V2/V3.
 * Extends the salvage harness (capture.mjs) with: phase tagging, matched mission viewports
 * (1440x1000 + 1024x900), AR/RTL + EN/LTR, a DOM geometry probe (ground truth for vision
 * cross-check) and a fresh runtime root per phase so fixture counts are identical before/after.
 * Never overwrites salvage evidence: new files are prefixed `v2-<phase>-` and lineage goes to
 * capture-lineage-v2-<phase>.json.
 * Usage: node writer-output/W05-AUDIT/evidence/capture-v2.mjs --phase before|after
 */
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const args = process.argv.slice(2);
const phase = (() => { const i = args.indexOf('--phase'); return i >= 0 && args[i + 1] ? args[i + 1] : 'before'; })();
if (!['before', 'after'].includes(phase)) { console.error(JSON.stringify({ BAD_PHASE: phase })); process.exit(2); }

const root = fileURLToPath(new URL('../../../', import.meta.url));
const outDir = path.join(root, 'writer-output/W05-AUDIT/evidence');
const runtimeRoot = path.join(root, `writer-output/W05-AUDIT/.runtime/v2-${phase}`);
await mkdir(outDir, { recursive: true });
await mkdir(runtimeRoot, { recursive: true });

const commit = (() => { try { return execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch { return 'UNKNOWN'; } })();
const tree = (() => { try { return execSync('git rev-parse "HEAD^{tree}"', { cwd: root }).toString().trim(); } catch { return 'UNKNOWN'; } })();
const dirtyAuditFiles = (() => { try { return execSync('git status --porcelain -- stack/native-typescript/surfaces/audit stack/native-typescript/adapters/audit.ts', { cwd: root }).toString().trim(); } catch { return 'STATUS_UNKNOWN'; } })();
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

/* Same provider-side fixture seeding as the salvage harness (real hash-chained records). */
const http = async (method, p, body) => {
  const r = await fetch(`http://127.0.0.1:${runtimePort}${p}`, { method, headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
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

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const captures = [];
const probes = [];
const errors = [];

async function shot(page, name, vpId, lang, dir) {
  const file = path.join(outDir, `v2-${phase}-${name}-${vpId}-${stamp()}.png`);
  await page.screenshot({ path: file });
  const bytes = await readFile(file);
  const sha = createHash('sha256').update(bytes).digest('hex');
  captures.push({ name, path: path.relative(root, file), sha256: sha, bytes: bytes.length, viewport: vpId, lang, dir, capturedAt: new Date().toISOString() });
  return file;
}

/* Ground-truth geometry/text probe — used to cross-check vision reads (skill R3b). */
const probe = page => page.evaluate(() => {
  const rect = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 }; };
  const inViewport = sel => { const el = document.querySelector(sel); if (!el) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  const text = sel => (document.querySelector(sel)?.textContent || '').trim().slice(0, 160);
  const stage = document.querySelector('#foundationStage');
  const shell = {
    globalPrimary: rect('.global-shell-primary'),
    contextBar: rect('.global-shell-contextbar'),
    topBanner: rect('#topBanner'),
    domainToolbar: rect('#domainToolbar'),
    bottomShelf: rect('#bottomShelf')
  };
  const surface = {
    root: rect('.s18-audit'),
    head: rect('.a-head'),
    cmdbar: rect('.a-cmdbar'),
    actionBar: rect('[data-a-actionbar]'),
    tablePanel: rect('[aria-label="Audit event ledger"]'),
    tableWrap: rect('.a-tablewrap'),
    chainPanel: rect('[data-a-chainpanel]'),
    deck: rect('[aria-label="Evidence deck"]'),
    json: rect('.a-json')
  };
  return {
    viewport: { w: innerWidth, h: innerHeight },
    lang: document.documentElement.lang, dir: document.documentElement.dir,
    title: text('[data-a-title]'),
    headText: text('.a-head'),
    rows: document.querySelectorAll('tr[data-a-row]').length,
    chainNodes: document.querySelectorAll('.a-node').length,
    tabs: document.querySelectorAll('[data-a-tab]').length,
    scopes: document.querySelectorAll('[data-a-scope]').length,
    ctxBlocks: document.querySelectorAll('.a-ctx-block').length,
    integrity: text('[data-integrity]'),
    actionBarPresent: Boolean(document.querySelector('[data-a-actionbar]')),
    actionBarText: text('[data-a-actionbar]'),
    shell, surface,
    stageScroll: stage ? { clientH: stage.clientHeight, scrollH: stage.scrollHeight, scrollTop: Math.round(stage.scrollTop) } : null,
    chromeTotal: shell.globalPrimary && shell.contextBar && shell.topBanner ? (shell.globalPrimary.h + shell.contextBar.h + shell.topBanner.h + (shell.domainToolbar?.h || 0)) : null,
    visibleAtFirstScreen: {
      table: inViewport('[aria-label="Audit event ledger"]'),
      chain: inViewport('[data-a-chainpanel]'),
      json: inViewport('.a-json'),
      actionBar: inViewport('[data-a-actionbar]'),
      bottomShelf: inViewport('#bottomShelf')
    }
  };
});

async function boot(page, locale) {
  const url = `http://127.0.0.1:${webPort}/?surface=audit&persistencePort=${runtimePort}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === 'audit', undefined, { timeout: 30000 });
  await page.waitForTimeout(2600);
  await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, locale);
  await page.waitForTimeout(1200);
}

const MATRIX = [
  { vp: { width: 1440, height: 1000 }, id: '1440x1000', locale: 'ar', dir: 'rtl' },
  { vp: { width: 1440, height: 1000 }, id: '1440x1000', locale: 'en', dir: 'ltr' },
  { vp: { width: 1024, height: 900 }, id: '1024x900', locale: 'ar', dir: 'rtl' },
  { vp: { width: 1024, height: 900 }, id: '1024x900', locale: 'en', dir: 'ltr' }
];

try {
  for (const cell of MATRIX) {
    const ctx = await browser.newContext({ viewport: cell.vp, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`${cell.locale}:${cell.id}:${String(e)}`));
    await boot(page, cell.locale);
    const state = await probe(page);
    probes.push({ phase, locale: cell.locale, dirExpected: cell.dir, ...state });
    await shot(page, `${cell.locale}-${cell.dir}-full`, cell.id, state.lang, state.dir);
    await page.evaluate(() => { const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = s.scrollHeight; });
    await page.waitForTimeout(500);
    await shot(page, `${cell.locale}-${cell.dir}-scrolled`, cell.id, state.lang, state.dir);
    await ctx.close();
  }
} finally {
  await browser.close();
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

const lineage = {
  schemaVersion: 2, unit: 'W05-AUDIT', surface: 'audit', phase,
  candidate: { commit, tree, dirtyAuditFiles: dirtyAuditFiles === '' ? false : dirtyAuditFiles, files: ['stack/native-typescript/surfaces/audit/index.ts', 'stack/native-typescript/adapters/audit.ts'] },
  environment: { node: process.version, web: `http://127.0.0.1:${webPort}/`, runtime: `http://127.0.0.1:${runtimePort}`, runtimeRoot: path.relative(root, runtimeRoot), freshRuntimeRoot: true },
  reference: { path: 'cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png', sha256: '7cb34c8357dfad0914e4eeaf732c97efbe376e957fe508137c4f730edaeb1e88', classification: 'OWNER_CONFIRMED_FINAL_REFERENCE' },
  fixtureState: { providerSeededEvents: seededOk, providerVerify: verify0.json },
  probes, captures, errors
};
const lineagePath = path.join(outDir, `capture-lineage-v2-${phase}.json`);
await writeFile(lineagePath, JSON.stringify(lineage, null, 2));
console.log(JSON.stringify({ phase, seededOk, captures: captures.length, errors: errors.length, lineage: path.relative(root, lineagePath) }));
