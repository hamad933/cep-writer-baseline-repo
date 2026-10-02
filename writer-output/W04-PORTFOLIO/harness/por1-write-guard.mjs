/**
 * POR-1 (W04-PORTFOLIO) — N1 write-boundary guard + self-test.
 *
 * N1 (DAG §0): "non-owned-route mutation attempt → must refuse".
 * The lane's write discipline is enforced mechanically by this guard: every file this lane
 * writes must resolve under one of the three writable roots of the POR-1 sealed row. The
 * self-test ATTEMPTS writes against each prohibited root and asserts each attempt is refused
 * with OUT_OF_ROOT_WRITE_REFUSED (no prohibited path is ever touched — the refusal happens
 * before any filesystem call).
 *
 * Usage: node writer-output/W04-PORTFOLIO/harness/por1-write-guard.mjs --self-test
 * Writes: writer-output/W04-PORTFOLIO/evidence/falsification/N1_WRITE_GUARD.json
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));

/** POR-1 writable roots (sealed row: surfaces/portfolio, adapters/portfolio, unit writer-output). */
export const WRITABLE_ROOTS = Object.freeze([
  'stack/native-typescript/surfaces/portfolio/',
  'stack/native-typescript/adapters/portfolio/',
  'writer-output/W04-PORTFOLIO/'
]);

/** Resolve a write target inside the lane roots or REFUSE before touching the filesystem. */
export function resolveLanePath(target) {
  const rel = path.relative(root, path.resolve(root, String(target)));
  const normalized = rel.split(path.sep).join('/');
  const inRoot = WRITABLE_ROOTS.some(prefix => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix));
  if (!inRoot || normalized.startsWith('..')) {
    const error = new Error(`OUT_OF_ROOT_WRITE_REFUSED:${normalized}`);
    error.code = 'OUT_OF_ROOT_WRITE_REFUSED';
    throw error;
  }
  return path.resolve(root, normalized);
}

const selfTest = process.argv.includes('--self-test');
if (selfTest) {
  const mustAccept = [
    'stack/native-typescript/surfaces/portfolio/presentation-style.ts',
    'stack/native-typescript/adapters/portfolio/domain.ts',
    'writer-output/W04-PORTFOLIO/HANDOFF.md',
    'writer-output/W04-PORTFOLIO/evidence/final/x.png'
  ];
  const mustRefuse = [
    'controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md',
    'controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json',
    'cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv',
    'cep-writer/references/visual/03_PROGRESS_AND_EVIDENCE/04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png',
    'contracts/anything.ts',
    'profiles/portfolio.json',
    'authority/anything.json',
    'dist-ts/anything.js',
    'stack/native-typescript/surfaces/learn/composition.ts',
    'stack/native-typescript/surfaces/m0-controller-composition.ts',
    'stack/native-typescript/surfaces/composition/w04-rescue.ts',
    'stack/native-typescript/foundation/extensions.css',
    'stack/native-typescript/main.ts',
    'writer-output/W04/BROWSER_RECEIPT.json',
    'writer-output/W04-EVIDENCE/report.json',
    'tools/w04-browser-flows.mjs',
    'dist/index.html',
    'main.ts',
    'git-index'
  ];

  const results = [];
  for (const target of mustAccept) {
    try { resolveLanePath(target); results.push({ target, outcome: 'ACCEPTED', expected: 'ACCEPTED', ok: true }); }
    catch (error) { results.push({ target, outcome: error.code || String(error.message), expected: 'ACCEPTED', ok: false }); }
  }
  for (const target of mustRefuse) {
    try { resolveLanePath(target); results.push({ target, outcome: 'ACCEPTED', expected: 'REFUSED', ok: false }); }
    catch (error) { results.push({ target, outcome: error.code || String(error.message), expected: 'REFUSED', ok: error.code === 'OUT_OF_ROOT_WRITE_REFUSED' }); }
  }

  const git = c => { try { return String(execSync(c, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };
  const status = git('git status --porcelain');
  // porcelain prefix is 1-2 status chars + a space (e.g. " M ", "?? ", "M  ") — parse it robustly
  const dirty = status.split('\n').filter(Boolean).map(line => line.replace(/^[ MADRC?!]{1,2}\s/, ''));
  const dirtyWithinRoots = dirty.every(p =>
    WRITABLE_ROOTS.some(prefix => p.startsWith(prefix)) ||
    p.startsWith('dist/') || p.startsWith('assurance/') || p.startsWith('stack/MEASURED_COMPARISON.json'));

  const report = {
    schemaVersion: 1,
    lane: 'POR-1',
    ranAt: new Date().toISOString(),
    candidate: { branch: 'writer/mi-serial-lane/POR-1', commit: git('git rev-parse HEAD'), tree: git('git rev-parse HEAD^{tree}') },
    writableRoots: WRITABLE_ROOTS,
    summary: { total: results.length, pass: results.filter(r => r.ok).length, fail: results.filter(r => !r.ok).length },
    mutatedPathsAtRunTime: dirty,
    mutatedPathsWithinWritableOrRestorableRoots: dirtyWithinRoots,
    results
  };
  const outDir = path.join(root, 'writer-output/W04-PORTFOLIO/evidence/falsification');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'N1_WRITE_GUARD.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ summary: report.summary, mutatedPathsAtRunTime: dirty, mutatedPathsWithinWritableOrRestorableRoots: dirtyWithinRoots, refusals: results.filter(r => r.expected === 'REFUSED').length }, null, 2));
  if (report.summary.fail) process.exitCode = 1;
}
