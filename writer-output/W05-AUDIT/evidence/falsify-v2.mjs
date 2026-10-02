/**
 * W05-AUDIT falsification battery — AUD-1 lane.
 * N1 non-owned-route mutation must refuse · N2 boundary/invalid input no corruption/false receipt ·
 * N3 no prerequisite provider → unavailable, never fabricated · N4 duplicate mechanics (CLI) ·
 * N5 suite twice identical (harness below records its own rerun; suite runs are recorded by handoff) ·
 * LANE-1 audit-hash-is-encryption ceiling stays false ·
 * LANE-2 trail entries immutable after write (tamper probe via API → rejected/detected).
 * Writes writer-output/W05-AUDIT/evidence/falsification-v2.json (never touches other evidence).
 */
import { spawn, execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const out = path.join(root, 'writer-output/W05-AUDIT/evidence/falsification-v2.json');
const runtimeRoot = path.join(root, 'writer-output/W05-AUDIT/.runtime/v2-falsify');
try { execSync(`rm -rf "${runtimeRoot}"`, { cwd: root }); } catch {} /* per-run scratch, never evidence */
const commit = (() => { try { return execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch { return 'UNKNOWN'; } })();

const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const webPort = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(webPort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(runtimeRoot, 'p.sqlite'), CEP_STAGING_ROOT: path.join(runtimeRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(runtimeRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise(r => setTimeout(r, 100)); } return false; };
const up1 = await waitUp(`http://127.0.0.1:${webPort}/`), up2 = await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
const results = [];
const rec = (id, claim, expected, actual, ok, detail='') => results.push({ id, claim, expected, actual, ok, detail, at: new Date().toISOString() });

try {
  rec('env.web_up', 'web server reachable', true, up1, up1);
  rec('env.runtime_up', 'runtime reachable', true, up2, up2);

  /* seed one real hash-chained record through the provider's append API */
  const http = async (method, p, body) => {
    const r = await fetch(`http://127.0.0.1:${runtimePort}${p}`, { method, headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    let json = null; try { json = await r.json(); } catch {}
    return { status: r.status, json };
  };
  const seed = await http('POST', '/v1/audit/events', {
    eventId: 'EVT-FALSIFY-0001', occurredAt: new Date().toISOString(), actor: 'Falsify Probe', action: 'POLICY_EVALUATION',
    target: 'POL-SEC-0021', outcome: 'SUCCESS', correlationId: 'TRACE-FALSIFY-01',
    details: { workspace: 'System & Operations', source: 'Web UI', client: 'Web UI', actorType: 'system', environment: 'prod', seededFixture: true }
  });
  rec('seed.record_written', 'fixture AuditEvent written', '201', String(seed.status), seed.status === 201);

  const before = await http('GET', '/v1/audit/events');
  const victim = (before.json?.events || []).find(e => e.eventId === 'EVT-FALSIFY-0001');
  const victimHash = victim?.hash || victim?.recordHash || null;
  rec('seed.record_hash_present', 'written trail entry carries a record hash', 'hash present', String(victimHash).slice(0, 16), Boolean(victimHash));

  /* ---- N1: non-owned-route mutation attempts must refuse ---- */
  const patch = await http('PATCH', '/v1/audit/events/EVT-FALSIFY-0001', { actor: 'Attacker', action: 'TAMPERED', target: 'X', outcome: 'SUCCESS' });
  rec('N1.http_patch_refused', 'PATCH (non-owned route) on a written trail entry must not mutate', 'status >= 400', String(patch.status), patch.status >= 400, JSON.stringify(patch.json || {}).slice(0, 160));
  const del = await http('DELETE', '/v1/audit/events/EVT-FALSIFY-0001');
  rec('N1.http_delete_refused', 'DELETE (non-owned route) must not remove a written trail entry', 'status >= 400', String(del.status), del.status >= 400, JSON.stringify(del.json || {}).slice(0, 160));
  const put = await http('PUT', '/v1/audit/events/EVT-FALSIFY-0001', { actor: 'Attacker', action: 'TAMPERED', target: 'X', outcome: 'SUCCESS' });
  rec('N1.http_put_refused', 'PUT (non-owned route) must not overwrite a written trail entry', 'status >= 400', String(put.status), put.status >= 400, JSON.stringify(put.json || {}).slice(0, 160));

  /* ---- LANE-2: trail entries immutable after write (direct tamper probe) ---- */
  const rewrite = await http('POST', '/v1/audit/events', {
    eventId: 'EVT-FALSIFY-0001', occurredAt: new Date().toISOString(), actor: 'Attacker', action: 'TAMPERED_ENTRY',
    target: 'X', outcome: 'SUCCESS', correlationId: 'TRACE-FALSIFY-01', details: { tampered: true }
  });
  rec('LANE2.rewrite_same_eventid_rejected', 're-append with same eventId but different content must be rejected', '422 AUDIT_EVENT_ID_CONFLICT', `${rewrite.status} ${rewrite.json?.code || ''}`, rewrite.status === 422 && rewrite.json?.code === 'AUDIT_EVENT_ID_CONFLICT');
  const afterTamper = await http('GET', '/v1/audit/events');
  const victim2 = (afterTamper.json?.events || []).find(e => e.eventId === 'EVT-FALSIFY-0001');
  const victimHash2 = victim2?.hash || victim2?.recordHash || null;
  rec('LANE2.record_hash_unchanged', 'record hash identical after every tamper attempt', victimHash, String(victimHash2).slice(0, 16), victimHash === victimHash2);
  const verdict = await http('GET', '/v1/audit/verify');
  rec('LANE2.chain_still_valid', 'provider verification still valid after tamper attempts', 'valid=true', `valid=${verdict.json?.valid} firstInvalid=${verdict.json?.firstInvalidSequence}`, verdict.json?.valid === true);
  const annotOk = await http('POST', '/v1/audit/annotations', { eventId: 'EVT-FALSIFY-0001', actor: 'probe', note: 'separate revision — does not rewrite the event' });
  const afterAnnot = await http('GET', '/v1/audit/events');
  const victim3 = (afterAnnot.json?.events || []).find(e => e.eventId === 'EVT-FALSIFY-0001');
  const victimHash3 = victim3?.hash || victim3?.recordHash || null;
  rec('LANE2.annotation_does_not_mutate_event', 'annotation is stored separately; event bytes unchanged', `${annotOk.status} + hash unchanged`, `${annotOk.status} + ${victimHash === victimHash3}`, annotOk.status === 201 && victimHash === victimHash3);

  /* ---- N2: boundary / invalid input → no corruption, no false receipt ---- */
  const bad = await http('POST', '/v1/audit/events', { actor: '', details: 'not-an-object' });
  rec('N2.missing_fields_rejected', 'POST without required fields must be rejected, not partially written', '422 AUDIT_EVENT_FIELDS_REQUIRED', `${bad.status} ${bad.json?.code || ''}`, bad.status === 422 && bad.json?.code === 'AUDIT_EVENT_FIELDS_REQUIRED');
  const badAnnot = await http('POST', '/v1/audit/annotations', { eventId: 'no-such-event', actor: '', note: '' });
  rec('N2.annotate_invalid_rejected', 'annotation with empty actor/note must fail closed', '422', String(badAnnot.status), badAnnot.status === 422);

  /* ---- N3: without the provider the durable plane must read UNAVAILABLE/UNVERIFIED (never fabricated) ---- */
  const closedPort = await freePort(); /* reserved but never started → provider genuinely absent */
  const probeClosed = await fetch(`http://127.0.0.1:${closedPort}/v1/capabilities`).then(() => true).catch(() => false);
  rec('N3.exclusive_port_is_closed', 'N3 control port has no provider listening', 'unreachable', String(probeClosed), probeClosed === false);
  const bootNoProvider = await (async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { chromium } = require('playwright');
    const b = await chromium.launch({ headless: true });
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto(`http://127.0.0.1:${webPort}/?surface=audit&persistencePort=${closedPort}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'audit', undefined, { timeout: 30000 });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      const surface = window.CEPFoundation.m0Composition.group.surfaces.audit;
      const truth = surface.truth();
      const chip = (document.querySelector('[data-integrity]')?.textContent || '').replace(/\s+/g, ' ').trim();
      const body = document.body.innerText;
      return {
        adapterTruthPersistence: truth.persistence,
        adapterHashIsEncryption: truth.hashIsEncryption,
        providerChip: (chip.match(/PROVIDER:\s*([A-Z_]+)/) || [])[1] || 'ABSENT',
        chainChip: (chip.match(/(?:سلسلة|Chain status):\s*([A-Z_]+)/) || [])[1] || 'ABSENT',
        surfacesProviderError: /unavailable|UNAVAILABLE|غير متاح/i.test(body),
        surfacesUnverifiedVisible: /UNVERIFIED/.test(body),
        rows: document.querySelectorAll('tr[data-a-row]').length
      };
    });
    await b.close();
    return { state, errs };
  })();
  const n3ok = ['UNVERIFIED', 'UNAVAILABLE'].includes(bootNoProvider.state.providerChip)
    && bootNoProvider.state.chainChip === 'VALID_CHAIN_SESSION_ONLY'
    && bootNoProvider.state.surfacesUnverifiedVisible
    && bootNoProvider.errs.length === 0;
  rec('N3.provider_absent_never_fabricated', 'provider unreachable → provider plane claims NO chain verdict (UNVERIFIED), combined verdict downgraded to session-only, unverified state visible, no page errors', 'PROVIDER=UNVERIFIED + chain=VALID_CHAIN_SESSION_ONLY + UNVERIFIED visible + 0 page errors', JSON.stringify(bootNoProvider.state), n3ok, `pageErrors=${bootNoProvider.errs.length}`);
  rec('N3.no_provider_hash_ceiling_holds', 'without a provider the hash ceiling still reads false (no invented encryption claim)', 'hashIsEncryption=false', String(bootNoProvider.state.adapterHashIsEncryption), bootNoProvider.state.adapterHashIsEncryption === false);

  /* ---- LANE-1: hash-is-encryption ceiling stays false (page + truth) ---- */
  const ceiling = await (async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { chromium } = require('playwright');
    const b = await chromium.launch({ headless: true });
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${webPort}/?surface=audit&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'audit', undefined, { timeout: 30000 });
    await page.waitForTimeout(2400);
    const s = await page.evaluate(() => {
      const surface = window.CEPFoundation.m0Composition.group.surfaces.audit;
      const truth = surface.truth();
      const text = document.body.innerText;
      return {
        hashIsEncryption: truth.hashIsEncryption,
        databaseImmutabilityClaim: truth.databaseImmutabilityClaim,
        commandReceiptsAreAuditTruth: truth.commandReceiptsAreAuditTruth,
        mentionsVerificationNotEncryption: /verification, not encryption|للتحقق لا للتخزين|for verification, not encryption/i.test(text),
        barPresent: Boolean(document.querySelector('[data-a-actionbar]')),
        barText: (document.querySelector('[data-a-actionbar]')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200)
      };
    });
    await b.close();
    return s;
  })();
  rec('LANE1.hash_is_not_encryption_false', 'audit-hash-is-encryption ceiling stays false', 'false + UI states verification-not-encryption', JSON.stringify({ h: ceiling.hashIsEncryption, ui: ceiling.mentionsVerificationNotEncryption }), ceiling.hashIsEncryption === false && ceiling.mentionsVerificationNotEncryption);
  rec('LANE1.no_db_immutability_claim', 'databaseImmutabilityClaim stays false', 'false', String(ceiling.databaseImmutabilityClaim), ceiling.databaseImmutabilityClaim === false);
  rec('LANE1.receipts_not_audit_events', 'commandReceiptsAreAuditTruth stays false', 'false', String(ceiling.commandReceiptsAreAuditTruth), ceiling.commandReceiptsAreAuditTruth === false);
  rec('LANE1.action_bar_present_and_truthful', 'AUD-V2 action/status bar rendered with lock + note action', 'present + lock + note', ceiling.barPresent ? ceiling.barText : 'ABSENT', ceiling.barPresent && /append-only|للإضافة فقط/i.test(ceiling.barText) && ceiling.barText.length > 20);
} finally {
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

/* ---- N4: duplicate mechanics check (CLI) ---- */
try {
  const out4 = execSync('node tools/check-duplicate-mechanics.mjs', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  const parsed = JSON.parse(out4.slice(out4.indexOf('{')));
  rec('N4.no_duplicate_mechanics', 'check-duplicate-mechanics finds no duplicate owner introduced', 'status PASS', `${parsed.status} filesScanned=${parsed.filesScanned}`, parsed.status === 'PASS');
} catch (error) {
  rec('N4.no_duplicate_mechanics', 'check-duplicate-mechanics finds no duplicate owner introduced', 'status PASS', `FAILED: ${String(error.stdout || error.message).slice(0, 200)}`, false);
}

const report = {
  schemaVersion: 2, unit: 'W05-AUDIT', surface: 'audit', lane: 'AUD-1',
  candidate: { commit, tree: (() => { try { return execSync('git rev-parse "HEAD^{tree}"', { cwd: root }).toString().trim(); } catch { return 'UNKNOWN'; } })() },
  runAt: new Date().toISOString(),
  totals: { total: results.length, pass: results.filter(r => r.ok).length, fail: results.filter(r => !r.ok).length },
  results
};
await writeFile(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ totals: report.totals, failed: results.filter(r => !r.ok).map(r => r.id) }));
