/**
 * W05-BACKUP lane falsification battery (BKP-1).
 *
 * N1  non-owned-route write attempt refuses (surface cannot be driven to a route it does not own)
 * N2  boundary/invalid input → no corruption, no false receipt
 * N3  without prerequisite data → truthful unavailable (never fabricated)
 * L1  corrupted-seed restore → truthful failure (never a false success receipt)
 * L2  backup-verify ≠ live-restore ceiling stays false
 *
 * N4 (check-duplicate-mechanics) and N5 (suite twice) are run by the shell and recorded in HANDOFF.
 *
 * Usage: node writer-output/W05-BACKUP/evidence/falsification/lane-falsify.mjs
 */
import {spawn, execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, existsSync, readdirSync, statSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const {chromium} = require('playwright');
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence/falsification');
await mkdir(OUT, {recursive: true});

const git = cmd => { try { return String(execSync(cmd, {cwd: root, encoding: 'utf8'})).trim(); } catch { return ''; } };
const sha = buf => createHash('sha256').update(buf).digest('hex');
const surfaceSha = (() => { const h = createHash('sha256'); for (const f of ['index.ts', 'style.ts', 'i18n.ts', 'icons.ts']) h.update(readFileSync(path.join(root, 'stack/native-typescript/surfaces/backup', f))); h.update(readFileSync(path.join(root, 'stack/native-typescript/adapters/backup-runtime.ts'))); return h.digest('hex'); })();

const RUNTIME_ROOT = path.join(root, 'writer-output/W05-BACKUP/.runtime/falsify-attempt3');
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(RUNTIME_ROOT, 'cep.sqlite'), CEP_STAGING_ROOT: path.join(RUNTIME_ROOT, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(RUNTIME_ROOT, 'root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeLog = ''; runtime.stderr.on('data', d => { runtimeLog += String(d); });
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };
const serveOk = await waitUp(`http://127.0.0.1:${port}/`);
const runtimeOk = await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const api = async (method, p, body) => {
  const res = await fetch(`http://127.0.0.1:${runtimePort}${p}`, {
    method, headers: {'content-type': 'application/json'},
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let json = null; try { json = await res.json(); } catch { /* non-json */ }
  return {status: res.status, json};
};

const cases = [];
const run = async (id, truthCategory, fn) => {
  try { const evidence = await fn(); cases.push({id, truthCategory, status: 'PASS', evidence}); }
  catch (error) { cases.push({id, truthCategory, status: 'FAIL', error: String(error?.stack || error).slice(0, 1200) }); }
};
const assert = (cond, message) => { if (!cond) throw new Error(message); };
const snapshot = () => api('GET', '/v1/backup/attempts');

const report = {
  suite: 'W05-BACKUP_LANE_FALSIFICATION',
  lane: 'BKP-1',
  branch: git('git branch --show-current'),
  commit: git('git rev-parse HEAD'),
  headTree: git('git rev-parse HEAD^{tree}'),
  surfaceSourceSha256: surfaceSha,
  writableSourceCleanVsHead: git('git status --porcelain -- stack/native-typescript/surfaces/backup stack/native-typescript/adapters/backup-runtime.ts') === '',
  startedAt: new Date().toISOString(),
  environment: {node: process.version, proofServer: `tools/serve.mjs on 127.0.0.1:${port}`, runtimeServer: `stack/local-runtime/server.mjs on 127.0.0.1:${runtimePort} (lane-owned throwaway root writer-output/W05-BACKUP/.runtime/falsify)`, serveOk, runtimeOk},
  cases
};

const browser = await chromium.launch({headless: true});
let context = null;
try {
  context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce', locale: 'en'});
  await context.addInitScript(() => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: 'en'}}})); } catch {} });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  const runtimeRequests = [];
  page.on('request', r => { const u = r.url(); if (u.includes(`127.0.0.1:${runtimePort}`)) runtimeRequests.push({method: r.method(), path: new URL(u).pathname}); });

  await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
  await page.waitForTimeout(1500);

  const inPage = fn => page.evaluate(fn);

  /* ------------------------------------------------------------------ N3 */
  await run('N3.prerequisite-absent-is-unavailable', 'Domain-Data-Provider', async () => {
    const before = await inPage(async () => {
      const a = window.CEPFoundation.m0Composition.adapter;
      const codes = {
        plan: a.plan(),
        preview: await a.preview(),
        stage: await a.stage(),
        drill: await a.drill(),
        activation: await a.requestActivation(),
        selectUnknown: a.selectPackage('pkg-does-not-exist')
      };
      const rendered = {
        drillStatus: document.querySelector('[data-bk-drill-status]')?.getAttribute('data-bk-drill-status'),
        notRunBlock: Boolean(document.querySelector('.bk-nostrun')),
        readiness: [...document.querySelectorAll('.bkr-ready .bkr-line')].map(n => n.textContent.trim()).slice(0, 8),
        truth: a.truth()
      };
      return {codes, rendered};
    });
    assert(before.codes.plan?.ok === false && before.codes.plan?.code === 'VERIFIED_PACKAGE_REQUIRED', `plan without package must be VERIFIED_PACKAGE_REQUIRED, got ${JSON.stringify(before.codes.plan)}`);
    assert(before.codes.preview?.ok === false && before.codes.preview?.code === 'RESTORE_PLAN_REQUIRED', `preview without plan must be RESTORE_PLAN_REQUIRED, got ${JSON.stringify(before.codes.preview)}`);
    assert(before.codes.stage?.ok === false && before.codes.stage?.code === 'PROVIDER_PREVIEW_REQUIRED', `stage without preview must refuse (provider-aware PREVIEW_REQUIRED), got ${JSON.stringify(before.codes.stage)}`);
    assert(before.codes.drill?.ok === false && before.codes.drill?.code === 'PROVIDER_STAGE_REQUIRED', `drill without stage must refuse (provider-aware STAGE_REQUIRED), got ${JSON.stringify(before.codes.drill)}`);
    assert(before.codes.activation?.ok === false && before.codes.activation?.code === 'VERIFIED_ISOLATED_DRILL_REQUIRED', `activation without drill must be VERIFIED_ISOLATED_DRILL_REQUIRED, got ${JSON.stringify(before.codes.activation)}`);
    assert(before.codes.selectUnknown?.ok === false && before.codes.selectUnknown?.code === 'PACKAGE_UNKNOWN', 'selecting an unknown package must refuse');
    assert(before.rendered.drillStatus === 'NOT_RUN', `rendered drill status must stay NOT_RUN, got ${before.rendered.drillStatus}`);
    assert(before.rendered.notRunBlock === true, 'the designed not-run statement must be present when no drill exists');
    assert(before.rendered.truth.activationAuthority === 'NOT_REQUESTED', 'activation authority must read NOT_REQUESTED with no data');
    assert(before.rendered.truth.productionDatabaseMutated === false && before.rendered.truth.drillLiveRestored === false, 'no fabricated mutation/restore truth');
    const attempts = await snapshot();
    assert(attempts.json?.ok === true && attempts.json.attempts.length === 0, 'the durable attempt journal must be empty before any command');
    return before;
  });

  /* ------------------------------------------------------------------ N2 */
  await run('N2.boundary-and-invalid-input-no-corruption', 'Behavior', async () => {
    const stateHash = async () => sha(JSON.stringify((await inPage(() => {
      const s = window.CEPFoundation.m0Composition.adapter.snapshot();
      return {packages: s.packages, selectedPackageId: s.selectedPackageId, plan: s.plan, preview: s.preview, stage: s.stage, lastDrill: s.lastDrill, lastActivation: s.lastActivation};
    }))));
    const before = await stateHash();
    const http = {
      drillUnknown: await api('POST', '/v1/backup/drill', {packageId: 'no-such-package'}),
      previewUnknown: await api('POST', '/v1/backup/preview', {packageId: ''}),
      stageUnknown: await api('POST', '/v1/backup/stage', {packageId: 'no-such-package'}),
      activationUnknown: await api('POST', '/v1/backup/activation-request', {drillId: 'no-such-drill'}),
      packageHostileLabel: await api('POST', '/v1/backup/package', {label: '<script>window.__pwned=1</script>'})
    };
    const rehydrateBoundary = await inPage(() => {
      const a = window.CEPFoundation.m0Composition.adapter;
      const out = {};
      for (const [k, v] of Object.entries({nullPayload: null, arrayPayload: [], objectWithoutPackages: {}, missingIdentity: {packages: [{label: 'x'}]}})) {
        try { a.rehydrate(v); out[k] = 'ACCEPTED_UNEXPECTEDLY'; } catch (error) { out[k] = String(error.message); }
      }
      return out;
    });
    const after = await stateHash();
    assert(http.drillUnknown.json?.ok === false, `unknown package drill must fail, got ${JSON.stringify(http.drillUnknown.json)}`);
    assert(http.previewUnknown.json?.ok === false && http.stageUnknown.json?.ok === false && http.activationUnknown.json?.ok === false, 'unknown package/drill preview/stage/activation must fail');
    assert(!JSON.stringify(http.drillUnknown.json).match(/"status"\s*:\s*"STAGED_AND_VERIFIED"/), 'failed drill must never carry a verified success status');
    assert(rehydrateBoundary.nullPayload === 'BACKUP_SNAPSHOT_REQUIRED' && rehydrateBoundary.arrayPayload === 'BACKUP_SNAPSHOT_REQUIRED' && rehydrateBoundary.objectWithoutPackages === 'BACKUP_PACKAGES_ARRAY_REQUIRED' && rehydrateBoundary.missingIdentity === 'BACKUP_PACKAGE_IDENTITY_REQUIRED', `rehydrate boundary must refuse malformed snapshots, got ${JSON.stringify(rehydrateBoundary)}`);
    assert(before === after, 'adapter session state must be unchanged after invalid/boundary input');
    const hostile = String(http.packageHostileLabel.json?.label || '');
    assert(http.packageHostileLabel.json?.ok === true && !hostile.includes('<script>'), `hostile label must be stored safely, got ${hostile}`);
    return {before, after, rehydrateBoundary, responses: Object.fromEntries(Object.entries(http).map(([k, v]) => [k, {status: v.status, json: v.json}]))};
  });

  /* ------------------------------------------------------------------ L2 + lifecycle */
  const clickWhenReady = async (id, timeoutMs = 20000) => {
    const startedAt = Date.now();
    let outcome = 'absent';
    while (Date.now() - startedAt < timeoutMs) {
      outcome = await page.evaluate(cmd => {
        const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === cmd);
        if (!el) return 'absent';
        if (el.disabled) return 'disabled';
        el.click();
        return 'clicked';
      }, id);
      if (outcome === 'clicked') return outcome;
      await page.waitForTimeout(250);
    }
    return outcome;
  };

  await run('L2.backup-verify-is-not-live-restore', 'Domain-Data-Provider', async () => {
    const commands = ['backup.package', 'backup.plan', 'backup.preview', 'backup.stage', 'backup.drill', 'backup.activationRequest'];
    const executed = [];
    for (const id of commands) {
      const outcome = await clickWhenReady(id);
      assert(outcome === 'clicked', `${id} button outcome=${outcome} during lifecycle`);
      await page.waitForTimeout(1200);
      executed.push(id);
    }
    await page.waitForTimeout(800);
    const state = await inPage(() => {
      const a = window.CEPFoundation.m0Composition.adapter;
      return {snapshot: a.snapshot(), truth: a.truth(), descriptor: a.descriptor()};
    });
    const banner = await inPage(() => (document.querySelector('.bk-banner')?.textContent || ''));
    const liveRestoreRoutes = ['/v1/backup/restore', '/v1/backup/activate-live', '/v1/backup/apply', '/v1/backup/live-restore'];
    const routeProbes = {};
    for (const p of liveRestoreRoutes) routeProbes[p] = (await api('POST', p, {packageId: 'x'})).status;
    const surfaceOwnedRequests = runtimeRequests.filter(r => !r.path.startsWith('/v1/platform/') && r.path !== '/v1/capabilities');

    assert(state.truth.stagedVerifiedIsLiveRestored === false, 'stagedVerifiedIsLiveRestored must stay false');
    assert(state.truth.drillLiveRestored === false && state.truth.liveRestored === false, 'drillLiveRestored/liveRestored must stay false');
    assert(state.truth.productionDatabaseMutated === false, 'productionDatabaseMutated must stay false');
    assert(state.truth.activationAuthority === 'AUTHORITY_PENDING', `activation must stay AUTHORITY_PENDING, got ${state.truth.activationAuthority}`);
    assert(state.descriptor.liveRestoreOwned === false && state.descriptor.activationAuthority === false && state.descriptor.persistenceOwnerMutation === false, `descriptor must keep the ceilings, got ${JSON.stringify(state.descriptor)}`);
    assert(state.snapshot.lastDrill?.status === 'STAGED_AND_VERIFIED' && state.snapshot.lastDrill?.liveRestored !== true, 'verified isolated drill must never claim a live restore');
    assert(state.snapshot.lastActivation?.productionDatabaseMutated !== true, 'activation request must not mutate the production database');
    assert(/STAGED_AND_VERIFIED/.test(banner) && /LIVE_RESTORED/.test(banner), 'the surface must keep the STAGED_AND_VERIFIED ≠ LIVE_RESTORED statement visible');
    assert(Object.values(routeProbes).every(s => s === 404), `no live-restore route may exist, got ${JSON.stringify(routeProbes)}`);
    return {executed, truth: state.truth, descriptor: state.descriptor, drillStatus: state.snapshot.lastDrill?.status, activation: state.snapshot.lastActivation, routeProbes, bannerText: banner.trim().slice(0, 200)};
  });

  /* ------------------------------------------------------------------ N1 */
  await run('N1.non-owned-route-write-attempt-refuses', 'Behavior', async () => {
    const owned = new Set(['backup.package', 'backup.plan', 'backup.preview', 'backup.stage', 'backup.drill', 'backup.activationRequest']);
    const domCommands = await inPage(() => [...document.querySelectorAll('[data-w05-surface] [data-foundation-command], .bkl [data-foundation-command], .bkr [data-foundation-command], .bkb [data-foundation-command]')].map(b => b.dataset.foundationCommand));
    const foreignSurfaceCommands = domCommands.filter(id => !owned.has(id));
    const surfaceRequests = runtimeRequests.filter(r => !r.path.startsWith('/v1/platform/') && r.path !== '/v1/capabilities');
    const nonBackupPaths = [...new Set(surfaceRequests.filter(r => !r.path.startsWith('/v1/backup/')).map(r => `${r.method} ${r.path}`))];
    const source = {
      adapter: readFileSync(path.join(root, 'stack/native-typescript/adapters/backup-runtime.ts'), 'utf8'),
      surface: readFileSync(path.join(root, 'stack/native-typescript/surfaces/backup/index.ts'), 'utf8')
    };
    const adapterRoutes = [...new Set([...source.adapter.matchAll(/transport\.request\(\s*'(GET|POST)'\s*,\s*(['"`])([^'"`]+)\2/g)].map(m => m[3]))];
    const unknownRoute = await api('POST', '/v1/backup/definitely-not-a-route', {anything: 1});
    const foreignWriteAttempt = await api('POST', '/v1/backup/../../v1/persistence/save', {operation: 'EXPLICIT_SAVE'});

    assert(foreignSurfaceCommands.length === 0, `the backup surface must not expose foreign commands, found ${JSON.stringify(foreignSurfaceCommands)}`);
    assert(nonBackupPaths.length === 0, `the surface drove non-backup runtime routes during the lifecycle: ${JSON.stringify(nonBackupPaths)}`);
    assert(adapterRoutes.every(p => p.startsWith('/v1/backup/')), `adapter transport must only touch /v1/backup/*, found ${JSON.stringify(adapterRoutes)}`);
    assert(unknownRoute.status === 404, `unknown backup route must 404, got ${unknownRoute.status}`);
    assert(foreignWriteAttempt.status >= 400 && foreignWriteAttempt.json?.ok === false, `path-traversal write attempt must be refused, got ${foreignWriteAttempt.status} ${JSON.stringify(foreignWriteAttempt.json)}`);
    return {surfaceOwnedCommands: domCommands, adapterTransportPaths: adapterRoutes, runtimeRequestsObserved: surfaceRequests, unknownRouteStatus: unknownRoute.status, traversalAttempt: {status: foreignWriteAttempt.status, json: foreignWriteAttempt.json}};
  });

  /* ------------------------------------------------------------------ L1 corrupted seed (driven through the surface) */
  await run('L1.corrupted-seed-restore-truthful-failure', 'Domain-Data-Provider', async () => {
    const selected = await inPage(() => {
      const s = window.CEPFoundation.m0Composition.adapter.snapshot();
      return {packageId: s.packages.find(p => p.packageId === s.selectedPackageId)?.packageId || s.packages.at(-1)?.packageId || null, drillBefore: s.lastDrill || null, attemptCountBefore: (s.attemptHistory || []).length};
    });
    assert(selected.packageId, 'the lifecycle must have produced a package before corrupting its seed');
    const drillsRoot = path.join(RUNTIME_ROOT, 'root', 'backup-restore', 'restore-drills');
    const drillsBefore = existsSync(drillsRoot) ? readdirSync(drillsRoot).sort() : [];

    const pkgDir = path.join(RUNTIME_ROOT, 'root', 'backup-restore', 'packages', selected.packageId);
    const snapshotPath = path.join(pkgDir, 'snapshot.sqlite');
    assert(existsSync(snapshotPath), `package snapshot not found at ${snapshotPath}`);
    const sizeBefore = statSync(snapshotPath).size;
    const originalSha = sha(readFileSync(snapshotPath));
    writeFileSync(snapshotPath, Buffer.alloc(4096, 0x5a)); /* corrupt the seed: no longer a sqlite file */
    for (const suffix of ['-wal', '-shm']) { const p = snapshotPath + suffix; if (existsSync(p)) writeFileSync(p, Buffer.alloc(64, 0x5a)); }
    const corruptedSha = sha(readFileSync(snapshotPath));

    const outcome = await clickWhenReady('backup.drill');
    assert(outcome === 'clicked', `drill button outcome=${outcome} after corruption`);

    let attempts = null;
    for (let i = 0; i < 40; i++) {
      attempts = await snapshot();
      const rows = attempts.json.attempts || [];
      const lastDrillRow = [...rows].reverse().find(r => /DRILL/i.test(String(r.operation || '')));
      if (lastDrillRow && lastDrillRow.status && /FAIL/.test(String(lastDrillRow.status))) break;
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(600);

    const session = await inPage(() => {
      const a = window.CEPFoundation.m0Composition.adapter;
      const s = a.snapshot();
      const rows = [...(s.attemptHistory || [])].reverse();
      return {
        lastDrill: s.lastDrill, lastError: s.lastError, truth: a.truth(),
        lastDrillAttempt: rows.find(r => /DRILL/i.test(String(r.operation || ''))) || null,
        renderedStatus: document.querySelector('[data-bk-drill-status]')?.getAttribute('data-bk-drill-status'),
        renderedPillText: document.querySelector('[data-bk-drill-status]')?.textContent?.trim() || null,
        failureSignals: [...document.querySelectorAll('[data-tone="bad"], .bkb-table [data-tone]')].map(n => n.textContent.trim()).filter(t => /FAIL/i.test(t)).slice(0, 10),
        statusToast: document.querySelector('#foundationStatus')?.textContent?.trim() || null
      };
    });
    const shot = path.join(OUT, 'L1-corrupted-seed-ui.png');
    await page.screenshot({path: shot, fullPage: false});

    const drillsAfter = existsSync(drillsRoot) ? readdirSync(drillsRoot).sort() : [];
    const newDrills = drillsAfter.filter(name => !drillsBefore.includes(name));
    const newReceipts = newDrills.map(name => {
      const receiptPath = path.join(drillsRoot, name, 'receipt.json');
      if (!existsSync(receiptPath)) return {name, receiptFound: false};
      const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
      return {name, receiptFound: true, ok: receipt.ok, status: receipt.status, liveRestored: receipt.liveRestored ?? null};
    });
    const falseSuccess = newReceipts.filter(r => r.receiptFound && r.status === 'STAGED_AND_VERIFIED' && r.liveRestored !== true);
    const rows = attempts?.json?.attempts || [];
    const failedDrillRows = rows.filter(r => /DRILL/i.test(String(r.operation || '')) && /FAIL/i.test(String(r.status || '')));

    assert(outcome === 'clicked', 'drill command must remain clickable (it is a real command, not gated on a healthy seed)');
    assert(failedDrillRows.length >= 1, `the durable journal must record a FAILED drill attempt, got ${JSON.stringify(rows.slice(-4))}`);
    assert(falseSuccess.length === 0, `no new drill receipt may claim success for a corrupted seed: ${JSON.stringify(falseSuccess)}`);
    assert(session.failureSignals.length >= 1 || /FAIL/i.test(String(session.statusToast || '')), `the surface must surface the failure, got signals=${JSON.stringify(session.failureSignals)} toast=${JSON.stringify(session.statusToast)}`);
    assert(session.truth.stagedVerifiedIsLiveRestored === false && session.truth.productionDatabaseMutated === false && session.truth.drillLiveRestored === false, 'ceilings must stay false after the failed drill');
    const failureNote = await inPage(() => {
      const note = document.querySelector('.bk-attempt-fail');
      const pill = document.querySelector('[data-bk-drill-status]');
      return note
        ? {present: true, status: note.getAttribute('data-bk-attempt-failure'), text: note.textContent.trim().slice(0, 260), pillStatus: pill?.getAttribute('data-bk-drill-status') || null, pillText: pill?.textContent?.trim() || null}
        : {present: false, pillStatus: pill?.getAttribute('data-bk-drill-status') || null, pillText: pill?.textContent?.trim() || null};
    });
    assert(failureNote.present && /FAIL/.test(String(failureNote.status || '')), `the focal report must carry the latest-attempt failure, got ${JSON.stringify(failureNote)}`);
    assert(/FAIL/.test(String(failureNote.pillStatus || '')), `the focal verdict chip must not headline a success after a failed attempt, got ${JSON.stringify(failureNote)}`);
    return {
      packageId: selected.packageId,
      snapshot: {sizeBefore, originalSha, corruptedSha},
      drillOutcome: outcome,
      newDrillDirs: newDrills,
      newReceipts,
      failedDrillAttemptCount: failedDrillRows.length,
      lastDrillRow: [...rows].reverse().find(r => /DRILL/i.test(String(r.operation || ''))) || null,
      surface: {renderedStatus: session.renderedStatus, renderedPillText: session.renderedPillText, failureNote, failureSignals: session.failureSignals, statusToast: session.statusToast, lastDrillBeforeCorruption: selected.drillBefore?.drillId || null, lastDrillAfter: session.lastDrill?.drillId || null, lastError: session.lastError},
      truth: session.truth,
      screenshot: path.relative(root, shot),
      screenshotSha256: sha(readFileSync(shot))
    };
  });

  report.pageErrors = pageErrors;
  report.summary = {total: cases.length, pass: cases.filter(c => c.status === 'PASS').length, fail: cases.filter(c => c.status === 'FAIL').length};
} catch (error) {
  report.fatal = String(error?.stack || error);
} finally {
  try { if (browser) await browser.close(); } catch { /* bounded */ }
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

report.finishedAt = new Date().toISOString();
const outFile = path.join(OUT, 'FALSIFICATION.json');
await writeFile(outFile, JSON.stringify(report, null, 2));
console.log(JSON.stringify({outFile: path.relative(root, outFile), summary: report.summary, fatal: report.fatal || null, cases: cases.map(c => ({id: c.id, status: c.status, error: c.error || null}))}, null, 2));
if (report.summary?.fail || report.fatal) process.exitCode = 1;
