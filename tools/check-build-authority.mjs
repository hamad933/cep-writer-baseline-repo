import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonical = path.join(root, 'stack', 'native-typescript');
const canonicalToken = 'stack/native-typescript';

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function treeHash(directory) {
  const rows = walk(directory).filter((file) => fs.statSync(file).isFile()).sort().map((file) => {
    const relative = path.relative(directory, file).replaceAll(path.sep, '/');
    const bytes = fs.readFileSync(file);
    return `${relative}\0${crypto.createHash('sha256').update(bytes).digest('hex')}\0${bytes.length}\n`;
  });
  return { sha256: crypto.createHash('sha256').update(rows.join('')).digest('hex'), files: rows.length };
}

function run(script) {
  const result = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw Error(`${script} failed: ${result.stderr || result.stdout}`);
  return (result.stdout || '').trim();
}

function jsInventory(directory) {
  return new Set(walk(directory).filter((file) => file.endsWith('.js')).map((file) => path.relative(directory, file).replaceAll(path.sep, '/')));
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const inspectedPackageCommands = ['build:runtime', 'test', 'check', 'browser:test'];
const referencedTools = new Set();
for (const key of inspectedPackageCommands) {
  const value = packageJson.scripts?.[key] || '';
  for (const match of value.matchAll(/(?:node|python3?)\s+(tools\/[\w./-]+)/g)) referencedTools.add(match[1]);
}
referencedTools.add('tools/stack-proof.mjs');
referencedTools.add('tools/check-build-authority.mjs');

const suspiciousCanonicalWriters = [];
for (const tool of [...referencedTools].sort()) {
  const absolute = path.join(root, tool);
  if (!fs.existsSync(absolute)) continue;
  const text = fs.readFileSync(absolute, 'utf8');
  if (!text.includes(canonicalToken)) continue;
  const hasWritePrimitive = /\b(writeFile|writeFileSync|copyFile|cp|rename|rm|unlink|mkdir)(Sync)?\b/.test(text);
  const isApprovedGenerator = tool === 'tools/build-runtime.mjs' || tool === 'tools/stack-proof.mjs' || tool === 'tools/check-build-authority.mjs';
  const isApprovedCanonicalReaderWithOtherEvidenceWrites = tool === 'tools/check-deferred-boundary.mjs' || tool === 'tools/test-writer-scaffold.mjs';
  if (hasWritePrimitive && !isApprovedGenerator && !isApprovedCanonicalReaderWithOtherEvidenceWrites) suspiciousCanonicalWriters.push(tool);
}
if (suspiciousCanonicalWriters.length) throw Error(`UNAPPROVED_CANONICAL_SOURCE_WRITER_REFERENCE:${suspiciousCanonicalWriters.join(',')}`);

const before = treeHash(canonical);
const buildRuntimeOutput = run('tools/build-runtime.mjs');
const afterRuntimeBuild = treeHash(canonical);
if (afterRuntimeBuild.sha256 !== before.sha256) throw Error('CANONICAL_SOURCE_CHANGED_BY_BUILD_RUNTIME');
const stackProofOutput = run('tools/stack-proof.mjs');
const afterStackProof = treeHash(canonical);
if (afterStackProof.sha256 !== before.sha256) throw Error('CANONICAL_SOURCE_CHANGED_BY_STACK_PROOF');

const expected = new Set(walk(canonical).filter((file) => file.endsWith('.ts')).map((file) => path.relative(canonical, file).replace(/\.ts$/, '.js').replaceAll(path.sep, '/')));
const dist = jsInventory(path.join(root, 'dist'));
const distTs = jsInventory(path.join(root, 'dist-ts'));
const difference = (a, b) => [...a].filter((item) => !b.has(item)).sort();
const inventory = {
  expected: expected.size,
  dist: dist.size,
  distTs: distTs.size,
  missingFromDist: difference(expected, dist),
  extraInDist: difference(dist, expected),
  missingFromDistTs: difference(expected, distTs),
  extraInDistTs: difference(distTs, expected)
};
if (inventory.missingFromDist.length || inventory.extraInDist.length || inventory.missingFromDistTs.length || inventory.extraInDistTs.length) {
  throw Error(`GENERATED_JS_INVENTORY_MISMATCH:${JSON.stringify(inventory)}`);
}

const result = {
  pass: true,
  authority: 'stack/native-typescript -> dist + dist-ts',
  canonicalSourceHashBefore: before.sha256,
  canonicalSourceHashAfterBuildRuntime: afterRuntimeBuild.sha256,
  canonicalSourceHashAfterStackProof: afterStackProof.sha256,
  canonicalSourceFiles: before.files,
  generatedJsInventory: inventory,
  inspectedPackageCommands,
  referencedTools: [...referencedTools].sort(),
  suspiciousCanonicalWriters: [],
  buildRuntimeOutput,
  stackProofOutput
};
console.log(JSON.stringify(result, null, 2));
