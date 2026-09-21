import { readFile, writeFile, readdir } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildRuntime } from './build-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'stack', 'native-typescript');
const dist = path.join(root, 'dist');
const distTs = path.join(root, 'dist-ts');

async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, relative));
    else files.push(relative);
  }
  return files;
}

const buildA = buildRuntime({ sourceRoot: source, destinationRoot: dist });
const buildB = buildRuntime({ sourceRoot: source, destinationRoot: distTs });
const inventory = [];
let buildMs = 0;

for (const relative of (await walk(source)).filter((file) => file.endsWith('.ts')).sort()) {
  const code = await readFile(path.join(source, relative), 'utf8');
  const before = performance.now();
  const emitted = stripTypeScriptTypes(code, { mode: 'strip' });
  buildMs += performance.now() - before;
  inventory.push({
    file: relative.replace(/\.ts$/, '.js'),
    source_ts_bytes: Buffer.byteLength(code),
    source_ts_lines: code.split('\n').length,
    emitted_bytes: Buffer.byteLength(emitted)
  });
}

const stamp = Date.now();
const A = await import(`${pathToFileURL(path.join(dist, 'model-tests.js')).href}?proof=${stamp}-a`);
const B = await import(`${pathToFileURL(path.join(distTs, 'model-tests.js')).href}?proof=${stamp}-b`);
const a = A.runModelTests();
const b = B.runModelTests();
const parity = JSON.stringify(a) === JSON.stringify(b);
const timings = [];
for (let i = 0; i < 31; i += 1) {
  const started = performance.now();
  A.runModelTests();
  timings.push(performance.now() - started);
}
timings.sort((x, y) => x - y);

const report = {
  runtime: process.version,
  measured_at: new Date().toISOString(),
  scope: 'Canonical stack/native-typescript source independently generates dist and dist-ts JavaScript; no generated tree writes back to canonical source.',
  buildDirection: 'stack/native-typescript -> dist + dist-ts',
  reverseGeneratedToSourceWrites: false,
  A: {
    generatedTree: 'dist',
    runtime_dependencies: 0,
    build_steps: 1,
    model_pass: a.filter((test) => test.status === 'PASS').length,
    model_fail: a.filter((test) => test.status === 'FAIL').length,
    build: buildA
  },
  B: {
    generatedTree: 'dist-ts',
    runtime_dependencies: 0,
    development_tool: 'Node built-in stripTypeScriptTypes',
    build_steps: 1,
    type_checking: 'NOT_AVAILABLE_NOT_CLAIMED',
    static_types: 'Canonical TypeScript source; proof measures erasable-syntax generation parity only.',
    model_pass: b.filter((test) => test.status === 'PASS').length,
    model_fail: b.filter((test) => test.status === 'FAIL').length,
    emit_ms: buildMs,
    build: buildB
  },
  identical_model_results: parity,
  A_model_suite_median_ms: timings[15],
  A_model_suite_p95_ms: timings[29],
  performance_limit: 'One host, warm model workload only; not cold browser startup or representative full product workload.',
  inventory,
  recommendation: 'Keep stack/native-typescript as the only writable logical runtime source; treat dist and dist-ts as disposable generated JavaScript trees.',
  not_admitted: ['Vue/TypeScript/Vite final product stack', 'Vue Flow', 'xterm.js', 'SQLite', 'Python OS bridge', 'Electron', 'Tauri'],
  conditional_C: 'No framework trial performed; complexity savings not yet evidenced.'
};
await writeFile(path.join(root, 'stack', 'MEASURED_COMPARISON.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ parity, source: 'stack/native-typescript', generated: ['dist', 'dist-ts'], reverseGeneratedToSourceWrites: false, js_tests: report.A, ts_tests: report.B, files: inventory.length }));
if (!parity || report.A.model_fail || report.B.model_fail) process.exitCode = 1;
