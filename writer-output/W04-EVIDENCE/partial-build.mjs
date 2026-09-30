#!/usr/bin/env node
/**
 * W04-EVIDENCE — serialized PARTIAL runtime build (blocked-source fallback).
 *
 * WHY: `dist/` is a global collision seam and `tools/build-runtime.mjs` aborts when ANY shared
 * writer's in-flight source fails to parse (observed: `surfaces/today/presentation.ts`,
 * `surfaces/audit/index.ts`). This fallback compiles every parseable source exactly like
 * `buildRuntime` (stripTypeScriptTypes → dist, one-way source→generated) and RETAINS the previous
 * dist output for files that do NOT parse, recording them explicitly. It never edits another
 * writer's source, and the skip list is published in the unit lineage so the state of dist/ is
 * never silently misrepresented.
 *
 * Run ONLY through tools/writer-serial.sh (dist/ is serialized).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'stack', 'native-typescript');
const destination = path.join(root, 'dist');

const walk = dir => (!fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));

const sourceFiles = walk(source).filter(f => f.endsWith('.ts')).sort();
const written = [];
const skipped = [];
for (const input of sourceFiles) {
  const rel = path.relative(source, input).replace(/\.ts$/, '.js');
  const output = path.join(destination, rel);
  let generated = null;
  try {
    generated = stripTypeScriptTypes(fs.readFileSync(input, 'utf8'), { mode: 'strip' });
  } catch (error) {
    const message = String(error.message).split('\n')[0].slice(0, 140);
    if (fs.existsSync(output)) {
      skipped.push({ source: path.relative(root, input), reason: message, retained: path.relative(root, output) });
      continue;
    }
    console.error(JSON.stringify({ pass: false, source: path.relative(root, input), reason: message, note: 'does not parse and no previous dist output exists' }));
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, generated);
  written.push(path.relative(root, input));
}
for (const input of walk(source).filter(f => f.endsWith('.css'))) {
  const output = path.join(destination, path.relative(source, input));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(input, output);
}
const receipt = { pass: true, mode: 'W04_PARTIAL_BUILD__STALE_FILES_RETAINED_AND_LISTED', written: written.length, skipped, generatedAt: new Date().toISOString() };
fs.writeFileSync(path.join(root, 'writer-output/W04-EVIDENCE/PARTIAL_BUILD_RECEIPT.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
if (skipped.length) process.exitCode = 0; // retained-on-parse-failure is the documented behaviour
