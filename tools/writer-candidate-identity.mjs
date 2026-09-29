#!/usr/bin/env node
/**
 * writer-candidate-identity — stable per-workspace candidate identity under parallel execution.
 *
 * Problem (raised by W01, 2026-09-29): the whole-worktree identity `c82cec63…/287` is a MOVING
 * target while five Writers edit disjoint source trees concurrently. A receipt that binds to it
 * stops recomputing the moment a sibling workspace saves a file — which is a LINEAGE failure that
 * has nothing to do with the work under test.
 *
 * Solution: bind each Writer's proof to
 *   1. the immutable CANONICAL product-source identity (unchanged, still the packet binding),
 *   2. the exact `commit` + `HEAD^{tree}` at capture time (evidence contract §Lineage model),
 *   3. an OWNED_PARTITION digest — sha256 over exactly the files that Writer is allowed to write.
 *      Sibling edits cannot move it.
 *
 * The whole-worktree digest is still reported, but explicitly labelled INFORMATIONAL_MOVING.
 *
 *   node tools/writer-candidate-identity.mjs --workspace W01
 *   node tools/writer-candidate-identity.mjs --workspace W01 --json
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Single executable source of truth for the parallel ownership partition
 *  (mirrors controller/12_execution/02_parallel_dispatch.md §4). */
export const PARTITIONS = {
  W01: [
    'stack/native-typescript/surfaces/shell',
    'stack/native-typescript/surfaces/today',
    'stack/native-typescript/foundation/global/shell',
    'stack/native-typescript/foundation/global/bottom-shelf.ts',
    'stack/native-typescript/foundation/workspace.ts',
    'stack/native-typescript/adapters/today',
    'tests/surfaces/shell',
    'tests/surfaces/today',
    'stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY',
    'stack/native-typescript/tests/rescue/CG3_W01_W02_COVERAGE',
    'stack/native-typescript/tests/post-c03/D07',
    'tools/c3-today-truth',
  ],
  W02: [
    'stack/native-typescript/surfaces/library',
    'stack/native-typescript/surfaces/learn',
    'stack/native-typescript/surfaces/rq',
    'stack/native-typescript/surfaces/visualize',
    'stack/native-typescript/adapters/library',
    'stack/native-typescript/adapters/learn',
    'stack/native-typescript/adapters/rq',
    'stack/native-typescript/adapters/visualize',
    'stack/native-typescript/adapters/learn.ts',
    'stack/native-typescript/adapters/library-chrome.ts',
    'stack/native-typescript/adapters/library-fixtures.ts',
    'stack/native-typescript/adapters/library-outline-descriptor.ts',
    'stack/native-typescript/adapters/library-note-runtime-composition.ts',
    'stack/native-typescript/adapters/context-learn-structured.ts',
    'stack/native-typescript/adapters/context-library-structured.ts',
    'stack/native-typescript/adapters/context-spatial.ts',
    'stack/native-typescript/adapters/structured-documents.ts',
    'stack/native-typescript/adapters/structured-note-content.ts',
    'stack/native-typescript/adapters/structured-note-content-compatibility.ts',
    'stack/native-typescript/adapters/note-binding-domains.ts',
    'stack/native-typescript/adapters/note-content-direction-fixture.ts',
    'stack/native-typescript/adapters/structured-bottom-provider.ts',
    'stack/native-typescript/foundation/structured',
    'stack/native-typescript/foundation/structured.ts',
    'stack/native-typescript/foundation/spatial',
    'stack/native-typescript/foundation/spatial.ts',
    'stack/native-typescript/foundation/relations.ts',
    'stack/native-typescript/foundation/window-motion.ts',
    'stack/native-typescript/foundation/contracts/platform-input-direction-bridge.ts',
    'tests/surfaces/library',
    'tests/surfaces/learn',
    'tests/surfaces/rq',
    'tests/surfaces/visualize',
    'stack/native-typescript/tests/rescue/S01_SHARED_STRUCTURED_EDITOR',
    'stack/native-typescript/tests/rescue/S04_SHARED_NOTES_OPERATIONAL',
    'stack/native-typescript/tests/rescue/S08_W01_W02_LIBRARY_LEARN',
    'stack/native-typescript/tests/rescue/S09_W01_W02_RQ_VISUALIZE',
    'stack/native-typescript/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH',
    'stack/native-typescript/tests/post-c03/D08',
    'tools/b3r-rq-visualize',
  ],
  W03: [
    'stack/native-typescript/surfaces/enterprise',
    'stack/native-typescript/surfaces/scenarios',
    'stack/native-typescript/surfaces/labs',
    'stack/native-typescript/surfaces/runs',
    'stack/native-typescript/surfaces/results',
    'stack/native-typescript/surfaces/composition/w03-rescue.ts',
    'stack/native-typescript/adapters/w03-enterprise.ts',
    'stack/native-typescript/adapters/w03-runs.ts',
    'stack/native-typescript/adapters/simulation.ts',
    'stack/native-typescript/adapters/enterprise',
    'stack/native-typescript/adapters/labs',
    'stack/native-typescript/adapters/runs',
    'stack/native-typescript/adapters/results',
    'stack/native-typescript/adapters/scenarios',
    'stack/native-typescript/adapters/w03-v34',
    'stack/native-typescript/adapters/analytical/results-compare-provider.ts',
    'stack/native-typescript/foundation/analytical',
    'stack/native-typescript/foundation/timeline',
    'stack/native-typescript/analytical-compare-browser.ts',
    'stack/native-typescript/analytical-compare-tests.ts',
    'stack/native-typescript/analytical-compare-correction-tests.ts',
    'stack/native-typescript/w4-f-operational-session-tests.ts',
    'tests/surfaces/enterprise',
    'tests/surfaces/scenarios',
    'tests/surfaces/labs',
    'tests/surfaces/runs',
    'tests/surfaces/results',
    'stack/native-typescript/tests/rescue/S10_W03_ENTERPRISE',
    'stack/native-typescript/tests/rescue/S11_W03_SCENARIOS_LABS',
    'stack/native-typescript/tests/rescue/S12_W03_RUNS',
    'stack/native-typescript/tests/rescue/S13_W03_RESULTS',
    'stack/native-typescript/tests/rescue/CG4_W03_COVERAGE',
    'stack/native-typescript/tests/post-c03/D09',
    'stack/native-typescript/tests/post-c03/LCORR03',
  ],
  W04: [
    'stack/native-typescript/surfaces/evidence',
    'stack/native-typescript/surfaces/reviews',
    'stack/native-typescript/surfaces/mastery',
    'stack/native-typescript/surfaces/portfolio',
    'stack/native-typescript/surfaces/composition/w04-rescue.ts',
    'stack/native-typescript/adapters/evidence',
    'stack/native-typescript/adapters/reviews',
    'stack/native-typescript/adapters/mastery',
    'stack/native-typescript/adapters/portfolio',
    'stack/native-typescript/w4-g-epistemic-confirmation-tests.ts',
    'tests/surfaces/evidence',
    'tests/surfaces/reviews',
    'tests/surfaces/mastery',
    'tests/surfaces/portfolio',
    'stack/native-typescript/tests/rescue/CG5_W04_COVERAGE',
    'stack/native-typescript/tests/rescue/S14_W04_EVIDENCE_REVIEWS',
    'stack/native-typescript/tests/rescue/S15_W04_MASTERY_PORTFOLIO',
    'stack/native-typescript/tests/post-c03/D10',
    'tools/c2-w04-truth',
  ],
  W05: [
    'stack/native-typescript/adapters/health-runtime.ts',
    'stack/native-typescript/adapters/processing-runtime.ts',
    'stack/native-typescript/adapters/validation.ts',
    'stack/native-typescript/adapters/backup-runtime.ts',
    'stack/native-typescript/adapters/audit.ts',
    'stack/native-typescript/adapters/manual_ai',
    'stack/native-typescript/adapters/audit',
    'stack/native-typescript/adapters/backup',
    'stack/native-typescript/adapters/configuration',
    'stack/native-typescript/adapters/releases',
    'stack/native-typescript/adapters/persistence',
    'stack/native-typescript/surfaces/validation',
    'stack/native-typescript/surfaces/manual_ai',
    'stack/native-typescript/surfaces/backup',
    'stack/native-typescript/surfaces/audit',
    'stack/native-typescript/surfaces/releases',
    'stack/native-typescript/surfaces/configuration',
    'stack/native-typescript/surfaces/composition/w05-rescue.ts',
    'stack/native-typescript/foundation/global/settings',
    'stack/native-typescript/foundation/global/preferences',
    'stack/native-typescript/w4-e-settings-center-tests.ts',
    'stack/local-runtime/persistence',
    'tests/surfaces/validation',
    'tests/surfaces/manual_ai',
    'tests/surfaces/backup',
    'tests/surfaces/audit',
    'tests/surfaces/releases',
    'tests/surfaces/configuration',
    'stack/native-typescript/tests/rescue/S16_W05_HEALTH_PROCESSING',
    'stack/native-typescript/tests/rescue/S17_W05_VALIDATION_MANUAL_AI',
    'stack/native-typescript/tests/rescue/S18_W05_BACKUP_AUDIT',
    'stack/native-typescript/tests/rescue/S19_W05_RELEASES_CONFIGURATION',
    'stack/native-typescript/tests/rescue/PC1_W05_PROVIDER_PERSISTENCE',
    'stack/native-typescript/tests/post-c03/D11',
  ],
};

const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'dist-ts', '.opencode']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const st = fs.statSync(dir);
  if (st.isFile()) return out.push(dir), out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function digest(files) {
  const h = crypto.createHash('sha256');
  for (const f of [...files].sort()) {
    h.update(path.relative(root, f).replaceAll(path.sep, '/'));
    h.update('\0');
    h.update(fs.readFileSync(f));
    h.update('\0');
  }
  return h.digest('hex');
}

function git(args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

const args = process.argv.slice(2);
const getArg = (n, d = null) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const ws = (getArg('--workspace') || '').toUpperCase();
if (!PARTITIONS[ws]) {
  console.error(`usage: writer-candidate-identity.mjs --workspace <${Object.keys(PARTITIONS).join('|')}> [--json]`);
  process.exit(2);
}

const roots = PARTITIONS[ws];
const files = [];
const missing = [];
for (const r of roots) {
  const abs = path.join(root, r);
  if (!fs.existsSync(abs)) {
    missing.push(r);
    continue;
  }
  walk(abs, files);
}
const ownedDigest = digest(files);

const allFiles = walk(root, []).filter((f) => {
  const rel = path.relative(root, f).replaceAll(path.sep, '/');
  return rel.startsWith('stack/') || rel.startsWith('tests/') || rel.startsWith('profiles/');
});
const worktreeDigest = digest(allFiles);

const identity = {
  schemaVersion: 1,
  workspace: ws,
  generatedAt: new Date().toISOString(),
  bindingRule:
    'Use OWNED_PARTITION for per-writer proof binding. WORKTREE_VARIANT is INFORMATIONAL_MOVING only ' +
    'under concurrent sibling workspace edits and must never be used as a per-writer candidate identity.',
  canonicalProductSource: {
    identity: 'CANONICAL_SOURCE_TREE_SHA256:480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641',
    files: 273,
    boundTo: 'parent commit 293dd1e0 / tree 3101c069',
  },
  commit: git(['rev-parse', 'HEAD']),
  tree: git(['rev-parse', 'HEAD^{tree}']),
  branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
  ownedPartition: {
    identity: `OWNED_PARTITION_SHA256:${ownedDigest}`,
    roots,
    fileCount: files.length,
    missingRoots: missing,
    stableUnderSiblingEdits: true,
  },
  worktreeVariant: {
    identity: `WORKTREE_VARIANT:${worktreeDigest.slice(0, 16)}`,
    fileCount: allFiles.length,
    stableUnderSiblingEdits: false,
    classification: 'INFORMATIONAL_MOVING',
  },
  protectedCanonicalDeltas: [
    'stack/native-typescript/main.ts',
    'stack/native-typescript/foundation/extensions.css',
    'stack/native-typescript/foundation/operational/xterm-renderer.ts',
  ],
};

if (args.includes('--json')) {
  console.log(JSON.stringify(identity, null, 2));
} else {
  console.log(`${ws} candidate identity`);
  console.log(`  commit            ${identity.commit}`);
  console.log(`  tree              ${identity.tree}`);
  console.log(`  owned partition   ${identity.ownedPartition.identity}  (${identity.ownedPartition.fileCount} files)`);
  console.log(`  worktree variant  ${identity.worktreeVariant.identity}  (${identity.worktreeVariant.fileCount} files, ${identity.worktreeVariant.classification})`);
  if (missing.length) console.log(`  missing roots     ${missing.join(', ')}`);
}
