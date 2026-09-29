#!/usr/bin/env node
/**
 * writer-regression-sweep — Coordinator-owned cross-workspace regression control.
 *
 * Runs the full verification selection used after EVERY workspace checkpoint commit
 * (mission §29) and attributes results per owning workspace.
 *
 *   node tools/writer-regression-sweep.mjs --label W01-C
 *   node tools/writer-regression-sweep.mjs --label post-W01 --baseline writer-output/_coordinator/REGRESSION_baseline.json
 *
 * The baseline diff is what distinguishes PRE-EXISTING failures from REGRESSIONS
 * introduced by the workspace under review. Only new failures count against a writer.
 */
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const label = getArg('--label', 'adhoc');
const baselinePath = getArg('--baseline', null);
const outDir = path.join(root, 'writer-output', '_coordinator');
fs.mkdirSync(outDir, {recursive: true});

const CHECK_SUBCOMMANDS = [
  'node tools/check-build-authority.mjs',
  'node tools/check-duplicate-mechanics.mjs',
  'node tools/test-writer-scaffold.mjs',
  'python3 tools/check-w03-semantic-ownership.py',
  'node tools/check-authority-intake.mjs',
  'node tools/check-deferred-boundary.mjs',
  'node tools/check-contracts.mjs',
  'node tools/vs05-read-mode-matrix.mjs',
  'node tools/check-vs05-command-ownership.mjs',
];

/** owning workspace for a test path — used to route a regression to the right owner */
const OWNERSHIP = [
  [/tests\/surfaces\/(shell|today)\//, 'W01'],
  [/tests\/surfaces\/(library|learn|rq|visualize)\//, 'W02'],
  [/tests\/surfaces\/(enterprise|scenarios|labs|runs|results)\//, 'W03'],
  [/tests\/surfaces\/(evidence|reviews|mastery|portfolio)\//, 'W04'],
  [/tests\/surfaces\/(validation|manual_ai|backup|audit|releases|configuration|health|processing)\//, 'W05'],
  [/S0[1-9]_/, 'W01/W02'],
  [/S10_|S11_|S12_|S13_/, 'W03'],
  [/S14_|S15_/, 'W04'],
  [/S1[6-9]_/, 'W05'],
  [/\/D0[7-9]\/|\/D03[AB]\//, 'W01/W02'],
  [/\/D10\//, 'W04'],
  [/\/D11\//, 'W05'],
  [/\/D09\//, 'W03'],
  [/(w01|w02|library|learn|rq|visualize|structured)/i, 'W02(shared)'],
  [/(w03|runs|results|labs|scenario|enterprise|spatial|replay|compare)/i, 'W03(shared)'],
  [/(w04|evidence|review|mastery|portfolio)/i, 'W04(shared)'],
  [/(w05|health|processing|validation|manual_ai|backup|audit|release|configuration)/i, 'W05(shared)'],
  [/shell|today/, 'W01(shared)'],
];

function ownerOf(id) {
  for (const [re, owner] of OWNERSHIP) if (re.test(id)) return owner;
  return 'SHARED/UNKNOWN';
}

function run(cmd, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(cmd, {shell: true, cwd: root});
    let out = '', err = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({exitCode: code, stdout: out, stderr: err, timedOut: code === null});
    });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({exitCode: -1, stdout: out, stderr: String(e), timedOut: false});
    });
  });
}

function listFiles(dir, pred) {
  const found = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (pred(p)) found.push(p);
    }
  };
  walk(dir);
  return found.sort();
}

const results = [];
async function add(id, command, timeoutMs = 300000) {
  const r = await run(command, timeoutMs);
  const rec = {
    id,
    command,
    status: r.exitCode === 0 && !r.timedOut ? 'PASS' : 'FAIL',
    exitCode: r.exitCode,
    timedOut: r.timedOut,
    owner: ownerOf(id),
    stderrTail: r.stderr.slice(-600),
    stdoutTail: r.stdout.slice(-600),
  };
  results.push(rec);
  process.stdout.write(`  ${rec.status.padEnd(4)} [${rec.owner}] ${id}\n`);
}

const t0 = Date.now();
console.log(`writer-regression-sweep :: label=${label}`);

console.log('- model tests');
await add('npm.test', 'npm test');

console.log('- contract / authority checks (one record per sub-command)');
for (const c of CHECK_SUBCOMMANDS) await add(`check::${c}`, c);

console.log('- surface route tests');
for (const f of listFiles(path.join(root, 'tests', 'surfaces'), (p) => p.endsWith('surface.test.mjs'))) {
  const rel = path.relative(root, f).replaceAll(path.sep, '/');
  await add(rel, `node ${rel}`);
}

console.log('- compiled test corpus (dist/**)');
for (const f of listFiles(path.join(root, 'dist'), (p) => p.endsWith('.js') && /test/.test(path.basename(p)))) {
  const rel = path.relative(root, f).replaceAll(path.sep, '/');
  await add(rel, `node ${rel}`);
}

const pass = results.filter((r) => r.status === 'PASS').length;
const fail = results.filter((r) => r.status === 'FAIL').length;

let baseline = null;
let regressions = [];
let fixedSinceBaseline = [];
if (baselinePath) {
  baseline = JSON.parse(fs.readFileSync(path.join(root, baselinePath), 'utf8'));
  const baseFails = new Set(baseline.results.filter((r) => r.status === 'FAIL').map((r) => r.id));
  const nowFails = new Set(results.filter((r) => r.status === 'FAIL').map((r) => r.id));
  regressions = [...nowFails].filter((id) => !baseFails.has(id));
  fixedSinceBaseline = [...baseFails].filter((id) => !nowFails.has(id));
}

const byOwner = {};
for (const r of results) {
  const o = (byOwner[r.owner] ||= {PASS: 0, FAIL: 0});
  o[r.status] += 1;
}

const report = {
  schemaVersion: 1,
  label,
  generatedAt: new Date().toISOString(),
  branch: (await run('git rev-parse --abbrev-ref HEAD', 10000)).stdout.trim(),
  commit: (await run('git rev-parse HEAD', 10000)).stdout.trim(),
  tree: (await run('git rev-parse HEAD^{tree}', 10000)).stdout.trim(),
  durationMs: Date.now() - t0,
  summary: {total: results.length, pass, fail},
  byOwner,
  baselineFile: baselinePath,
  regressions,
  fixedSinceBaseline,
  results,
};
const outPath = path.join(outDir, `REGRESSION_${label}.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');

console.log(`\n${pass}/${results.length} PASS, ${fail} FAIL`);
console.log('per-owner:', JSON.stringify(byOwner));
if (baselinePath) {
  console.log(`regressions vs ${baselinePath}: ${regressions.length}`);
  for (const id of regressions) console.log(`  REGRESSION [${ownerOf(id)}] ${id}`);
  console.log(`fixed since baseline: ${fixedSinceBaseline.length}`);
  for (const id of fixedSinceBaseline) console.log(`  FIXED [${ownerOf(id)}] ${id}`);
}
console.log(`\nwrote ${path.relative(root, outPath)}`);
process.exitCode = regressions.length > 0 ? 1 : 0;
