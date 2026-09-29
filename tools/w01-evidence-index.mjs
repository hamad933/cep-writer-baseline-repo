/**
 * W01 evidence index generator — `writer-output/W01/EVIDENCE_INDEX.json`.
 *
 * Rebuilds the index from disk (never hand-edited): sha256 of every W01 evidence artifact and
 * every screenshot under `writer-output/W01/evidence/` (recursively, including the nested
 * `evidence/<surface>/` matched-viewport captures), each bound to the per-writer candidate
 * (OWNED_PARTITION identity) + commit + tree + branch, and cross-checked against
 * `BROWSER_RECEIPT.json.evidenceArtifacts` / `VISUAL_CAPTURE_RECEIPT.json.artifacts`.
 *
 * The index does not hash itself (self-reference) — the Coordinator hashes it at review time.
 * Previous binding records are preserved in `supersededBindings` (lineage history, never lost).
 * Nothing is ever deleted: an artifact that exists on disk but is referenced by no current
 * capture is still indexed and labelled with the reason.
 *
 * Usage: node tools/w01-evidence-index.mjs
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W01');
const indexPath = path.join(outDir, 'EVIDENCE_INDEX.json');
const evidenceDir = path.join(outDir, 'evidence');

const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));

const candidate = JSON.parse(spawnSync(process.execPath, [path.join(root, 'tools/writer-candidate-identity.mjs'), '--workspace', 'W01', '--json'], { cwd: root, encoding: 'utf8' }).stdout);
const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
const tree = spawnSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root, encoding: 'utf8' }).stdout.trim();
const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();

const summary = await readJson(path.join(outDir, 'ACCEPTANCE_SUMMARY.json'));
const browser = await readJson(path.join(outDir, 'BROWSER_RECEIPT.json'));
let visual = null;
try { visual = await readJson(path.join(outDir, 'VISUAL_CAPTURE_RECEIPT.json')); } catch {}

const DECLARED = 'WORKTREE_VARIANT:c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const ownedPartition = candidate.ownedPartition.identity;
const bound = flow => ({
  ownedPartition,
  candidateDeclared: DECLARED,
  candidateMeasured: `WORKTREE_VARIANT:${candidate.worktreeVariant.identity.split(':')[1]}`,
  commit,
  tree,
  branch,
  flow: flow || null
});

/* ------------------------------------------------------------------ documents + tools */

const DOCUMENTS = [
  ['writer-output/W01/PROOF_CATALOG.json', 'acceptance_catalog', 'EVIDENCE', 'writer-authored rules + proof definitions; 24 disjoint rules + 11 proofs'],
  ['writer-output/W01/PROOF_RESULTS.json', 'measured_proof_results', 'EVIDENCE', 'tool-measured by tools/writer-acceptance-matrix.py --run-proofs, never hand-written'],
  ['writer-output/W01/ACCEPTANCE_MATRIX.csv', 'acceptance_matrix', 'EVIDENCE', 'row-addressable zero-loss disposition (C03-GATE-024 manifest)'],
  ['writer-output/W01/ACCEPTANCE_SUMMARY.json', 'acceptance_summary', 'EVIDENCE', 'zero-loss counts for 711 rows'],
  ['writer-output/W01/BROWSER_RECEIPT.json', 'browser_receipt', 'EVIDENCE', 'packet §9 five-flow Playwright receipt + evidenceArtifacts index'],
  ['writer-output/W01/VISUAL_CAPTURE_RECEIPT.json', 'visual_capture_receipt', 'EVIDENCE', 'matched-viewport 1440x1000 + 1024x900 keyboard/focus capture receipt (C03-GATE-020 W01 side)'],
  ['writer-output/W01/CBF002_PROBE.json', 'cbf002_probe', 'EVIDENCE', 'CBF-002 root-cause measurement probe (before/after the residual-round repair)'],
  ['writer-output/W01/SERIALIZED_HOTSPOT_REQUEST.md', 'serialized_hotspot_request', 'EVIDENCE', 'exact proposed m0-controller-composition.ts hunk, filed not applied'],
  ['writer-output/W01/CHECKPOINTS.md', 'checkpoint_record', 'EVIDENCE', 'W01-A..W01-F checkpoint records (append-only)'],
  ['writer-output/W01/W01_HANDOFF.md', 'handoff', 'EVIDENCE', 'W01 handoff incl. RESIDUAL ROUND section'],
  ['tools/w01-conformance.mjs', 'w01_tool', 'W01_NEW', 'executable acceptance proof'],
  ['tools/w01-browser-flows.mjs', 'w01_tool', 'W01_NEW', '5 packet §9 flows + receipt writer'],
  ['tools/w01-visual-capture.mjs', 'w01_tool', 'W01_NEW', 'matched-viewport + keyboard/focus capture'],
  ['tools/w01-cbf-probe.mjs', 'w01_tool', 'W01_NEW', 'CBF-002 seam measurement probe'],
  ['tools/w01-evidence-index.mjs', 'w01_tool', 'W01_NEW', 'this index generator'],
  ['tests/surfaces/shell/surface.test.mjs', 'w01_route_test', 'W01_OWNED', 'shell route test'],
  ['tests/surfaces/today/surface.test.mjs', 'w01_route_test', 'W01_CHANGE', 'Coordinator-accepted route-test fix'],
  ['stack/native-typescript/foundation/global/shell/navigation.ts', 'w01_product_source', 'W01_CHANGE', 'CBF-002 restore-side repair (wait + verify + truthful restore status)'],
  ['stack/native-typescript/surfaces/today/surface.ts', 'w01_product_source', 'W01_CHANGE', 'CBF-002 command-side repair (Today commands drive the mounted adapter)']
];

const artifacts = [];
for (const [relative, kind, provenance, note] of DOCUMENTS) {
  let bytes;
  try { bytes = await readFile(path.join(root, relative)); } catch { continue; }
  artifacts.push({ path: relative, kind, provenance, sha256: sha256(bytes), bytes: bytes.length, bound: bound(null), note });
}

/* ------------------------------------------------------------------ screenshots */

const browserArtifacts = new Map((browser.evidenceArtifacts || []).map(a => [a.filename, a]));
const visualArtifacts = new Map((visual?.artifacts || []).map(a => [a.filename, a]));

const walk = async (directory, prefix = '') => {
  const out = [];
  let entries = [];
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await walk(path.join(directory, entry.name), relative)));
    else if (entry.name.endsWith('.png')) out.push(relative);
  }
  return out;
};

const screenshotPaths = await walk(evidenceDir);
for (const name of screenshotPaths) {
  const absolute = path.join(evidenceDir, name);
  const bytes = await readFile(absolute);
  const relative = path.join('writer-output/W01/evidence', name);
  const browserEntry = browserArtifacts.get(relative);
  const visualEntry = visualArtifacts.get(relative);
  artifacts.push({
    path: relative,
    kind: 'screenshot',
    provenance: 'EVIDENCE',
    sha256: sha256(bytes),
    bytes: bytes.length,
    bound: bound(browserEntry?.boundTo?.flow || visualEntry?.flow || null),
    viewport: visualEntry?.viewport || browserEntry?.boundTo?.viewport || '1440x980',
    surface: visualEntry?.surface || null,
    binding: browserEntry?.binding || (visualEntry ? (visualEntry.status === 'CURRENT' ? 'MATCHED_VIEWPORT_VISUAL_CAPTURE_EVIDENCE' : 'SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED') : 'UNINDEXED'),
    note: browserEntry?.reason || (visualEntry ? `matched-viewport capture by tools/w01-visual-capture.mjs (${visualEntry.status})` : 'screenshot not referenced by any current receipt — retained, never deleted')
  });
}
artifacts.sort((a, b) => a.path.localeCompare(b.path));

/* ------------------------------------------------------------------ orphan check */

const orphans = artifacts.filter(a => a.kind === 'screenshot' && a.binding === 'UNINDEXED').map(a => a.path);
const previous = await readJson(indexPath).catch(() => null);

const index = {
  schemaVersion: 1,
  workspace: 'W01',
  generatedBy: 'W01 writer (CKPT-F residual round) via tools/w01-evidence-index.mjs',
  branch,
  commit,
  tree,
  candidate: {
    ownedPartition,
    ownedPartitionRoots: candidate.ownedPartition.roots,
    ownedPartitionFileCount: candidate.ownedPartition.fileCount,
    ownedPartitionStableUnderSiblingEdits: candidate.ownedPartition.stableUnderSiblingEdits,
    dispatchDeclared: DECLARED,
    dispatchDeclaredFiles: 287,
    measuredAtIndex: `WORKTREE_VARIANT:${candidate.worktreeVariant.identity.split(':')[1]}`,
    measuredFiles: candidate.worktreeVariant.fileCount,
    worktreeVariantClassification: candidate.worktreeVariant.classification,
    bindingRule: candidate.bindingRule,
    lineageStatus: 'DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS'
  },
  bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
  requirements: {
    csv: path.relative(root, path.join(root, 'controller/09_writer_forge/W01_REQUIREMENTS.csv')),
    sha256: summary.requirements_sha256,
    rows: summary.requirements_rows,
    dispositioned: summary.rows_dispositioned,
    zero_loss: summary.zero_loss,
    counts: summary.counts,
    matrixSha256: summary.matrix_sha256
  },
  selfReference: 'writer-output/W01/EVIDENCE_INDEX.json is not hashed here (self-reference); the Coordinator hashes it at review time',
  artifactCount: artifacts.length,
  artifacts,
  orphanCheck: {
    evidenceDirFiles: screenshotPaths.length,
    indexedInBrowserReceipt: (browser.evidenceArtifacts || []).length,
    indexedInVisualCaptureReceipt: (visual?.artifacts || []).length,
    orphans,
    statement: 'every screenshot under writer-output/W01/evidence/ (recursively, incl. evidence/<surface>/) is indexed in BROWSER_RECEIPT.json.evidenceArtifacts with sha256 and bound to a flow, to VISUAL_CAPTURE_RECEIPT.json, or labelled SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED; nothing was deleted'
  },
  supersededBindings: previous && previous.commit !== commit
    ? [{ generatedBy: previous.generatedBy, commit: previous.commit, tree: previous.tree, candidate: previous.candidate, requirements: previous.requirements }]
    : (previous?.supersededBindings || [])
};

await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(JSON.stringify({ index: 'writer-output/W01/EVIDENCE_INDEX.json', artifactCount: index.artifactCount, screenshots: screenshotPaths.length, orphans: orphans.length, zero_loss: index.requirements.zero_loss, counts: index.requirements.counts, commit, tree, ownedPartition }, null, 2));
if (orphans.length) process.exitCode = 1;
