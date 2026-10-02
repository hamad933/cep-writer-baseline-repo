/**
 * W04-MASTERY lane falsification battery — MAS-1.
 *
 * Every probe is a real assertion against the BUILT bytes (dist/) served to a real Chromium
 * page or imported in Node. Nothing here writes product source. Output:
 * `writer-output/W04-MASTERY/FALSIFICATION-<run>.json` (one file per run so N5 can compare runs).
 *
 *   N1 non-owned-route mutation attempt -> must refuse (no Mastery mutation from a Learn route,
 *      and no canonical Mastery write from the surface itself)
 *   N2 boundary / invalid input         -> refusal, snapshot never corrupted, no false receipt
 *   N3 act without prerequisite/provider-> unavailable, never fabricated
 *   N4 duplicate mechanics              -> delegated to tools/check-duplicate-mechanics.mjs
 *   N5 determinism                      -> run twice, byte-identical probe results (see --run)
 *   LANE seed local Learn-only completion -> Mastery must NOT infer / advance mastery
 *
 * Usage: node writer-output/W04-MASTERY/falsification.mjs --run a
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const runLabel = (args[args.indexOf('--run') + 1]) || 'a';
const outFile = path.join(root, 'writer-output/W04-MASTERY', `FALSIFICATION-${runLabel}.json`);

const results = [];
const record = (id, status, expected, observed, detail = null) =>
  results.push({ id, status, expected, observed, ...(detail === null ? {} : { detail }) });

const freePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});

const snapshotDomain = domain => JSON.stringify({
  records: domain.records, history: domain.history, receipts: domain.receipts,
  persistence: domain.persistence, seq: domain.seq
});

/* ---------------------------------------------------------------- node-level probes */
const nodeProbes = async () => {
  const { W04MasteryDomain, MASTERY_JUDGMENTS, MASTERY_FRESHNESS } =
    await import(pathToFileURL(path.join(root, 'dist/adapters/mastery/domain.js')).href);
  const { LearnAdapter } = await import(pathToFileURL(path.join(root, 'dist/adapters/learn.js')).href);

  /* --- N2 boundary / invalid input ------------------------------------- */
  {
    const { createW04MasteryDemoRecords } = await import(pathToFileURL(path.join(root, 'dist/adapters/mastery/domain.js')).href);
    const domain = new W04MasteryDomain(createW04MasteryDemoRecords());
    const before = snapshotDomain(domain);
    const probes = [];
    try { domain.get('does-not-exist'); probes.push({ input: 'get(unknown)', result: 'NO_REFUSAL' }); }
    catch (error) { probes.push({ input: 'get(unknown)', result: String(error.message) }); }
    probes.push({ input: 'setFreshness(id,"BOGUS")', result: JSON.stringify(domain.setFreshness('mastery-crypto', 'BOGUS')) });
    probes.push({ input: 'setFreshness(id,"CURRENT") [canonical write]', result: JSON.stringify(domain.setFreshness('mastery-crypto', 'CURRENT')) });
    try { domain.reevaluate(null, { completionPercent: 100 }); probes.push({ input: 'reevaluate(null)', result: 'NO_REFUSAL' }); }
    catch (error) { probes.push({ input: 'reevaluate(null)', result: String(error.message) }); }
    try { new W04MasteryDomain([{ id: 'x', judgment: 'MASTERED_BY_COMPLETION', freshness: 'CURRENT', basis: { evidenceRefs: [], decisionRefs: [], digest: '' } }]); probes.push({ input: 'constructor(invalid judgment)', result: 'NO_REFUSAL' }); }
    catch (error) { probes.push({ input: 'constructor(invalid judgment)', result: String(error.message) }); }
    const after = snapshotDomain(domain);
    const corrupted = before !== after;
    const codes = probes.map(p => p.result).join(' | ');
    const allRefused = probes.every(p => !p.result.includes('NO_REFUSAL'))
      && codes.includes('MASTERY_FRESHNESS_INVALID')
      && codes.includes('CANONICAL_MASTERY_WRITE_FORBIDDEN')
      && codes.includes('MASTERY_UNKNOWN')
      && codes.includes('MASTERY_JUDGMENT_INVALID');
    record('N2-boundary-invalid-input', allRefused && !corrupted ? 'PASS' : 'FAIL',
      'every boundary/invalid input refused with a typed code; domain snapshot byte-identical before/after; no receipt fabricated',
      { allRefused, snapshotUnchanged: !corrupted, probes });
  }

  /* --- N3 prerequisite / provider absent -> unavailable, never fabricated -- */
  {
    const masteryRecord = { id: 'm-crypto', revisionId: 'mr-1', subject: 'user:self', capability: 'Applied Cryptography',
      judgment: 'INSUFFICIENT_EVIDENCE', freshness: 'CURRENT', policyRef: 'policy:v3',
      basis: { evidenceRefs: ['ev-1@r1'], decisionRefs: ['decision-1'], digest: 'basis:x' } };
    const resolver = { readEvidence: () => ({ state: 'RESOLVED' }), readDecision: () => ({ state: 'RESOLVED' }), readPolicy: () => ({ state: 'RESOLVED' }) };
    const domain = new W04MasteryDomain([masteryRecord], { basisResolver: resolver, evaluator: null });
    const before = snapshotDomain(domain);
    const unbound = domain.reevaluate('m-crypto', { completionPercent: 100, activityCount: 999, nextJudgment: 'MASTERED' });
    const unresolvedDomain = new W04MasteryDomain([masteryRecord], { basisResolver: null, evaluator: null });
    const unresolvedBefore = snapshotDomain(unresolvedDomain);
    const basis = unresolvedDomain.reevaluate('m-crypto', { basisAvailable: false });
    const explanation = domain.explain('m-crypto');
    const after = snapshotDomain(domain);
    const ok = unbound.code === 'AUTHORIZED_EVALUATOR_UNBOUND' && unbound.mutated === false
      && basis.code === 'BASIS_UNAVAILABLE' && basis.mutated === false && unresolvedBefore === snapshotDomain(unresolvedDomain)
      && explanation.completionOrActivityUsed === false
      && explanation.institutionalAuthorityInferred === false
      && explanation.judgment === 'INSUFFICIENT_EVIDENCE'
      && before === after && domain.history.length === 1;
    record('N3-no-provider-no-fabrication', ok ? 'PASS' : 'FAIL',
      'without evaluator/basis the domain reports unavailable refusal codes, never a fabricated judgment; no state change, no history entry',
      { unbound: { code: unbound.code, mutated: unbound.mutated },
        basis: { code: basis.code, mutated: basis.mutated },
        completionOrActivityUsed: explanation.completionOrActivityUsed,
        institutionalAuthorityInferred: explanation.institutionalAuthorityInferred,
        judgmentAfterAttempt: explanation.judgment,
        snapshotUnchanged: before === after,
        unresolvedDomainSnapshotUnchanged: unresolvedBefore === snapshotDomain(unresolvedDomain),
        historyLength: domain.history.length });
  }

  /* --- N1 (node half): non-owned route cannot write Mastery -------------- */
  {
    const domain = new W04MasteryDomain();
    const before = snapshotDomain(domain);
    const learn = new LearnAdapter({
      source: { id: 'act-1', revision: 1, title: 'Crypto basics', kind: 'LearningActivity', editable: true,
        truth: 'BOUND_CANONICAL_LEARNING_SOURCE', classification: 'PRODUCT_RUNTIME_BOUND_SOURCE',
        activity: { id: 'act-1', revision: 1, title: 'Crypto basics', kind: 'LearningActivity', editable: true },
        document: { id: 'doc-1', revision: 1, blocks: [{ id: 'b1', type: 'paragraph', html: 'x' }] } }
    });
    learn.start();
    learn.submit('answer');
    const progress = learn.learningProgress();
    const after = snapshotDomain(domain);
    const ok = progress.state === 'COMPLETE' && progress.mastery === 'NOT_INFERRED'
      && learn.attempt.score === 'NOT_INFERRED' && before === after;
    record('N1-node-learn-completion-cannot-write-mastery', ok ? 'PASS' : 'FAIL',
      'a completed Learn attempt never mutates the Mastery domain and never yields a mastery claim',
      { learnProgress: progress.state, learnMastery: progress.mastery, attemptScore: learn.attempt.score,
        masterySnapshotUnchanged: before === after });
  }
};

/* ---------------------------------------------------------------- browser probes */
const seedScript = rows => `(() => {
  const d = window.CEPFoundation.m0Composition.group.mastery.domain;
  const rows = ${JSON.stringify(rows)};
  for (const row of rows) if (!d.records.some(r => r.id === row.id)) d.records.push(row);
  try { window.CEPFoundation.m0Composition.mounted?.render?.(); } catch {}
  try { window.CEPFoundation.workspace?.render?.(); } catch {}
  return d.records.map(r => r.id);
})()`;

const learnSeedScript = `(async () => {
  const mod = await import('/adapters/learn.js');
  const domain = window.CEPFoundation.m0Composition.group.mastery.domain;
  const snap = () => JSON.stringify({records: domain.records, history: domain.history, receipts: domain.receipts});
  const before = snap();
  const masteredBefore = domain.records.filter(r => r.judgment === 'MASTERED').map(r => r.id);
  const historyBefore = domain.history.length;
  const receiptsBefore = domain.receipts.length;
  const uiBefore = (document.querySelector('#foundationStage .m0-workbench')?.innerText || '').replace(/[\\t ]+/g,' ').trim();
  const pillsBefore = [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim());
  const learn = new mod.LearnAdapter({source:{
    id:'act-crypto-1', revision:1, title:'Applied Cryptography — core primitives', kind:'LearningActivity', editable:true,
    truth:'BOUND_CANONICAL_LEARNING_SOURCE', classification:'PRODUCT_RUNTIME_BOUND_SOURCE',
    activity:{id:'act-crypto-1', revision:1, title:'Applied Cryptography — core primitives', kind:'LearningActivity', editable:true},
    document:{id:'doc-crypto-1', revision:1, blocks:[{id:'p1', type:'paragraph', html:'Learner completed the activity.'}]}
  }});
  learn.start();
  const attempt = learn.submit('Completed the local practice attempt.');
  const progress = learn.learningProgress();
  const review = learn.review();
  try { window.CEPFoundation.m0Composition.mounted?.render?.(); } catch {}
  try { window.CEPFoundation.workspace?.render?.(); } catch {}
  await new Promise(r => setTimeout(r, 300));
  const after = snap();
  const uiAfter = (document.querySelector('#foundationStage .m0-workbench')?.innerText || '').replace(/[\\t ]+/g,' ').trim();
  const pillsAfter = [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim());
  const masteredAfter = domain.records.filter(r => r.judgment === 'MASTERED').map(r => r.id);
  return {
    learnProgress: progress.state, learnMastery: progress.mastery, attemptScore: attempt.score,
    reviewMastery: review.mastery, reviewMasteryWrite: review.masteryWrite, w04DecisionCreated: review.w04DecisionCreated,
    masterySnapshotUnchanged: before === after,
    masteredSetUnchanged: JSON.stringify(masteredBefore) === JSON.stringify(masteredAfter),
    masteredBefore, masteredAfter,
    historyUnchanged: historyBefore === domain.history.length,
    receiptsUnchanged: receiptsBefore === domain.receipts.length,
    uiUnchanged: uiBefore === uiAfter,
    pillsBefore, pillsAfter,
    historyLengthAfter: domain.history.length,
    receiptsLengthAfter: domain.receipts.length
  };
})()`;

const canonicalWriteScript = `(() => {
  const domain = window.CEPFoundation.m0Composition.group.mastery.domain;
  const before = JSON.stringify({records: domain.records, history: domain.history, receipts: domain.receipts});
  const attempts = [];
  if (domain.records[0]) {
    attempts.push({ op: 'setFreshness', result: JSON.stringify(domain.setFreshness(domain.records[0].id, 'CURRENT')) });
    attempts.push({ op: 'reevaluate-with-completion', result: JSON.stringify(domain.reevaluate(domain.records[0].id, { completionPercent: 100, nextJudgment: 'MASTERED' })) });
  } else {
    attempts.push({ op: 'setFreshness', result: 'NO_RECORD' });
  }
  const after = JSON.stringify({records: domain.records, history: domain.history, receipts: domain.receipts});
  return { attempts, snapshotUnchanged: before === after, recordCount: domain.records.length };
})()`;

const uiTruthScript = `(() => {
  const text = (document.querySelector('#foundationStage .m0-workbench')?.innerText || '').replace(/[\\t ]+/g,' ').trim();
  const pills = [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim());
  const arabic = (text.match(/[\\u0600-\\u06FF]/g) || []).length;
  return {
    pills,
    hasNotEvaluated: pills.some(p => p.includes('NOT_EVALUATED')),
    hasUnavailable: pills.some(p => p.includes('UNAVAILABLE')),
    claimsMastered: /\\bMASTERED\\b/.test(text) && !/NOT_MASTERED|Not reached|لم تُبلغ|NOT_EVALUATED/.test(text),
    completionNeverMastery: /never creates Mastery|لا يُنتج الإتقان/.test(text),
    arabicChars: arabic,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir
  };
})()`;

const browserProbes = async () => {
  const domainMod = await import(pathToFileURL(path.join(root, 'dist/adapters/mastery/domain.js')).href);
  const seedRows = [...domainMod.createW04MasteryDemoRecords()];
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: 'ignore' });
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e?.message || e)));
    await page.goto(`http://127.0.0.1:${port}/?surface=mastery`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'mastery', null, { timeout: 20000 });
    await page.waitForTimeout(400);

    /* entry-state truth (boot default: no Mastery provider bound) */
    const entry = await page.evaluate(uiTruthScript);
    record('N3-ui-entry-state-not-evaluated', entry.hasNotEvaluated && entry.hasUnavailable && entry.completionNeverMastery ? 'PASS' : 'FAIL',
      'with no bound evaluator the UI projects NOT_EVALUATED / UNAVAILABLE and states completion never creates Mastery — never a fabricated judgment',
      entry);

    /* seed the live product domain with the product's own labelled fixtures */
    const seeded = await page.evaluate(seedScript(seedRows));
    await page.waitForTimeout(300);

    /* LANE: local Learn-only completion must NOT infer / advance Mastery */
    const learn = await page.evaluate(learnSeedScript);
    record('LANE-learn-completion-not-inferred-as-mastery', learn.masterySnapshotUnchanged && learn.uiUnchanged
      && learn.learnMastery === 'NOT_INFERRED' && learn.attemptScore === 'NOT_INFERRED'
      && learn.reviewMasteryWrite === false && learn.w04DecisionCreated === false
      && learn.masteredSetUnchanged && learn.historyUnchanged && learn.receiptsUnchanged
      ? 'PASS' : 'FAIL',
      'a locally COMPLETED Learn attempt leaves Mastery records, history, receipts and the rendered Mastery UI byte-identical (no new/advanced MASTERED judgment); Learn reports NOT_INFERRED and creates no W04 decision',
      { ...learn, seededRecords: seeded.length });

    /* N1 browser half: no canonical Mastery write from the surface / non-owned route */
    const write = await page.evaluate(canonicalWriteScript);
    const refused = write.attempts.every(a => a.result.includes('CANONICAL_MASTERY_WRITE_FORBIDDEN')
      || a.result.includes('AUTHORIZED_EVALUATOR_UNBOUND') || a.result.includes('BASIS_UNAVAILABLE')
      || a.result.includes('CONFLICT_REQUIRES_GOVERNED_EVALUATION') || a.result === 'NO_RECORD');
    record('N1-browser-canonical-mastery-write-refused', refused && write.snapshotUnchanged ? 'PASS' : 'FAIL',
      'surface-initiated canonical Mastery writes are refused with typed codes and leave the domain untouched',
      write);

    /* N2 browser half: boundary input through the live page */
    const boundary = await page.evaluate(`(() => {
      const domain = window.CEPFoundation.m0Composition.group.mastery.domain;
      const before = JSON.stringify({records: domain.records, history: domain.history, receipts: domain.receipts});
      const out = [];
      try { domain.inspect('no-such-record'); out.push('NO_REFUSAL'); } catch (e) { out.push(String(e.message)); }
      try { out.push(JSON.stringify(domain.setFreshness('no-such-record', 'CURRENT'))); } catch (e) { out.push(String(e.message)); }
      const after = JSON.stringify({records: domain.records, history: domain.history, receipts: domain.receipts});
      return { probes: out, snapshotUnchanged: before === after };
    })()`);
    const boundaryOk = !boundary.probes.some(p => p.includes('NO_REFUSAL'))
      && boundary.probes[0].includes('MASTERY_UNKNOWN')
      && boundary.probes[1].includes('MASTERY_UNKNOWN') && boundary.snapshotUnchanged;
    record('N2-browser-boundary-input', boundaryOk ? 'PASS' : 'FAIL',
      'unknown-record boundary input from the live page refuses with MASTERY_UNKNOWN and never corrupts the projection',
      boundary);

    record('BROWSER-NO-PAGE-ERRORS', pageErrors.length === 0 ? 'PASS' : 'FAIL',
      'no uncaught page errors during the falsification pass', { pageErrors });
    await context.close();
  } finally {
    await browser.close();
    server.kill();
  }
};

const main = async () => {
  await nodeProbes();
  await browserProbes();
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const payload = {
    schemaVersion: 1, proof: 'w04-mastery-lane-falsification', run: runLabel,
    executedAt: new Date().toISOString(),
    node: process.version,
    probes: results, pass: passed, fail: failed
  };
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ receipt: path.relative(root, outFile), run: runLabel, pass: passed, fail: failed, results: results.map(r => `${r.status} ${r.id}`) }, null, 2));
  if (failed) process.exitCode = 1;
};

main().catch(error => { console.error(error); process.exit(1); });
