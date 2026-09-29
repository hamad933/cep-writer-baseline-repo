/**
 * W05 stack-admission proof — "Protect the current simple CEP stack from unproven expansion".
 *
 * Discharges the OWNER_DECISION rows whose proof_requirement is
 *   PACKAGE_AND_LOCKFILE_DIFF_SCAN__DEPENDENCY_ADMISSION_LEDGER__NO_NEW_PRODUCT_DEPENDENCY_WITHOUT_PROVEN_GAP__WINDOWS_XTERM_CONPTY_PLATFORM_GATES_BEFORE_STACK_FROZEN
 * with an AUTOMATED managed-runner check (runner type = automated; this row does NOT require the
 * Owner device — C03-GATE-021 Owner-device applies only to real HWND/topmost/input-layout proof).
 *
 * Negative (must fail if applied): UNBOUNDED_WRITER_SELECTED_STACK_EXPANSION / PREMATURE_STACK_FROZEN
 *   — the stack is NOT frozen (packet §6), so the proof asserts "no dependency was added without an
 *     admission disposition", never "the dependency list may never change".
 *
 * Output: JSON receipt on stdout, exit 0 on PASS / 1 on FAIL.
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [];
const record = (id, ok, detail) => { checks.push({ id, status: ok ? 'PASS' : 'FAIL', detail: detail ?? null }); return ok; };

const git = command => { try { return execSync(command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (error) { return { failed: true, message: String(error?.message || error) }; } };

const currentPkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const headPkgRaw = git('git show HEAD:package.json');
const headPkg = typeof headPkgRaw === 'string' ? JSON.parse(headPkgRaw) : null;

const dependencies = pkg => JSON.stringify({ dependencies: pkg.dependencies || {}, devDependencies: pkg.devDependencies || {}, optionalDependencies: pkg.optionalDependencies || {}, peerDependencies: pkg.peerDependencies || {} }, null, 2);

if (headPkg) {
  record('stack.package-manifest-unchanged-vs-head', dependencies(currentPkg) === dependencies(headPkg), {
    current: dependencies(currentPkg), head: dependencies(headPkg)
  });
} else {
  record('stack.package-manifest-unchanged-vs-head', false, headPkgRaw);
}

const headLock = git('git show HEAD:package-lock.json');
const currentLock = (() => { try { return readFileSync(path.join(root, 'package-lock.json'), 'utf8'); } catch { return null; } })();
record('stack.lockfile-unchanged-vs-head', typeof headLock === 'string' && currentLock === headLock, {
  headBytes: typeof headLock === 'string' ? headLock.length : String(headLock),
  currentBytes: currentLock === null ? null : currentLock.length
});

/* admitted third-party bare specifiers — anything else in product source is a stack admission gap */
const ADMITTED = new Set(['@xterm/xterm', 'playwright']);
const BARE_IMPORT = /(?:^|[\s;}])(?:import|export)\s[^;'"]*?from\s*['"]([^'".][^'"]*)['"]|require\(\s*['"]([^'".][^'"]*)['"]\s*\)|import\(\s*['"]([^'".][^'"]*)['"]\s*\)/g;
const stackRoot = path.join(root, 'stack/native-typescript');
const walk = directory => readdirSync(directory).flatMap(entry => {
  const full = path.join(directory, entry);
  if (statSync(full).isDirectory()) return walk(full);
  return /\.(ts|js|mjs)$/.test(entry) ? [full] : [];
});
const unadmitted = [];
let scanned = 0;
for (const file of walk(stackRoot)) {
  const relative = path.relative(root, file);
  if (relative.includes(`${path.sep}tests${path.sep}`)) continue;
  scanned += 1;
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(BARE_IMPORT)) {
    const specifier = match[1] || match[2] || match[3];
    if (!specifier) continue;
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (packageName.startsWith('node:')) continue;
    if (!ADMITTED.has(packageName)) unadmitted.push({ file: relative, specifier, packageName });
  }
}
record('stack.no-unadmitted-third-party-import-in-product-source', unadmitted.length === 0, { scannedFiles: scanned, unadmitted });
const declared = [...new Set([...Object.keys(currentPkg.dependencies || {}), ...Object.keys(currentPkg.devDependencies || {})])].sort();
const undeclaredAdmission = declared.filter(name => !ADMITTED.has(name));
record('stack.dependency-ledger-covers-every-declared-package', undeclaredAdmission.length === 0, { declared, admitted: [...ADMITTED].sort(), missingAdmission: undeclaredAdmission });

/* The stack must NOT be declared frozen: platform gates must still be open (Windows ConPTY/HWND). */
const frozenMarkers = [];
for (const file of walk(stackRoot)) {
  const relative = path.relative(root, file);
  if (relative.includes(`${path.sep}tests${path.sep}`)) continue;
  const source = readFileSync(file, 'utf8');
  for (const marker of ['STACK_FROZEN', 'stackFrozen:true', 'stackFrozen = true', 'STACK_FROZEN_AT']) if (source.includes(marker)) frozenMarkers.push({ file: relative, marker });
}
record('stack.not-declared-frozen', frozenMarkers.length === 0, { markers: frozenMarkers, note: 'STACK_NOT_FROZEN (packet §6); C03-GATE-021 platform gates remain open' });

const fail = checks.filter(c => c.status === 'FAIL');
const receipt = {
  schemaVersion: 1,
  kind: 'W05_STACK_ADMISSION_PROOF',
  runnerType: 'AUTOMATED_MANAGED_LINUX_RUNNER',
  status: fail.length ? 'FAIL' : 'PASS',
  notARunningHeadline: 'Owner-device Windows native-target proof (C03-GATE-021) is out of scope for this row and stays BLOCKED elsewhere.',
  commit: String(git('git rev-parse HEAD') || '').trim(),
  checks
};
process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
if (fail.length) process.exitCode = 1;
