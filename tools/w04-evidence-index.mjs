/**
 * W04 evidence index generator — hashes EVERY artifact under writer-output/W04/ and binds each
 * one to candidate / commit / tree / flow (controller/08_evidence/evidence_contract.md §1).
 *
 * Orphan rule: every file is indexed here, so nothing in writer-output/W04/ can be an orphan.
 * EVIDENCE_INDEX.json cannot hash itself and is therefore listed with `self: true` and no sha256.
 *
 * Usage: node tools/w04-evidence-index.mjs
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W04');
const indexPath = path.join(outDir, 'EVIDENCE_INDEX.json');
const git = command => { try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };

const DECLARED_TREE = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const DECLARED_CANDIDATE = `WORKTREE_VARIANT:${DECLARED_TREE}`;

const walk = async dir => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
};

/* ------------------------------------------------------------- flow binding map */

let flowByFilename = {};
let receiptIndexed = new Set();
let browserReceipt = null;
try {
  browserReceipt = JSON.parse(await readFile(path.join(outDir, 'BROWSER_RECEIPT.json'), 'utf8'));
  for (const flow of browserReceipt.flows || []) {
    for (const shot of flow.screenshots || []) flowByFilename[shot.filename] = flow.flow;
  }
  for (const artifact of browserReceipt.evidenceArtifacts || []) {
    receiptIndexed.add(artifact.filename);
    if (artifact.boundTo?.flow) flowByFilename[artifact.filename] = artifact.boundTo.flow;
  }
} catch {}

// Retained superseded attempts keep their originating flow id in the filename
// (`<flow-with-dashes>-<timestamp>-<candidate8>.png`), so every screenshot stays flow-bound.
const flowIds = [...new Set((browserReceipt?.flows || []).map(f => f.flow))];
const flowFromFilename = relative => {
  const base = path.posix.basename(relative);
  const match = flowIds.find(id => base.startsWith(`${id.replace(/\./g, '-')}-`));
  return match || null;
};

const KIND_BY_NAME = {
  'PROOF_CATALOG.json': 'PROOF_CATALOG',
  'PROOF_RESULTS.json': 'PROOF_RESULTS',
  'ACCEPTANCE_MATRIX.csv': 'ACCEPTANCE_MATRIX',
  'ACCEPTANCE_SUMMARY.json': 'ACCEPTANCE_SUMMARY',
  'BROWSER_RECEIPT.json': 'BROWSER_RECEIPT',
  'F051_COUNTING_PROOF.json': 'F051_COUNTING_PROOF',
  'SEAM_OWNERSHIP_PROOF.json': 'SEAM_OWNERSHIP_PROOF',
  'BASELINE_PROOF_RESULTS.json': 'CKPT_A_BASELINE',
  'CHECKPOINTS.md': 'CHECKPOINT_LEDGER',
  'W04_HANDOFF.md': 'WRITER_HANDOFF',
  'PROPOSALS.md': 'WRITER_PROPOSAL',
  'SERIALIZED_HOTSPOT_REQUEST.md': 'SERIALIZED_HOTSPOT_REQUEST'
};

const files = (await walk(outDir)).sort();
const commit = git('git rev-parse HEAD');
const headTree = git('git rev-parse HEAD^{tree}');
const artifacts = [];

for (const filePath of files) {
  const relative = path.relative(root, filePath).split(path.sep).join('/');
  if (relative === 'writer-output/W04/EVIDENCE_INDEX.json') {
    artifacts.push({
      path: relative,
      self: true,
      sha256: null,
      bytes: null,
      binding: { candidate: DECLARED_CANDIDATE, commit, tree: headTree, flow: null },
      note: 'index cannot hash itself; its integrity is the git blob identity at handoff'
    });
    continue;
  }
  const bytes = await readFile(filePath);
  const stats = await stat(filePath);
  const name = path.basename(filePath);
  const flow = flowByFilename[relative] || (relative.includes('/evidence/') ? flowFromFilename(relative) : null);
  const flowBinding = !relative.includes('/evidence/')
    ? 'BOUND_TO_WORKSPACE_ARTIFACT'
    : flowByFilename[relative] ? 'BOUND_TO_BROWSER_FLOW'
      : flow ? 'BOUND_TO_BROWSER_FLOW_FROM_FILENAME__RETAINED_SUPERSEDED_ATTEMPT'
        : 'UNINDEXED_SCREENSHOT';
  artifacts.push({
    path: relative,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    modifiedAt: stats.mtime.toISOString(),
    kind: KIND_BY_NAME[name] || (relative.includes('/evidence/') ? 'SCREENSHOT' : 'OTHER'),
    binding: {
      candidate: DECLARED_CANDIDATE,
      commit,
      tree: headTree,
      flow,
      flowBinding
    }
  });
}

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const index = {
  schemaVersion: 1,
  workspace: 'W04',
  generatedAt: new Date().toISOString(),
  command: 'node tools/w04-evidence-index.mjs',
  candidate: DECLARED_CANDIDATE,
  commit,
  tree: headTree,
  canonicalSourceFileCount: 287,
  executedSource: {
    bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
    treeSha256: identity.sha256,
    fileCount: identity.files,
    matchesDispatchBaseline: identity.sha256 === DECLARED_TREE,
    note: 'recomputed at index time; differs from the dispatch baseline because this index includes W04 candidate deltas (packet §14)'
  },
  browserReceiptBinding: browserReceipt ? {
    path: 'writer-output/W04/BROWSER_RECEIPT.json',
    summary: browserReceipt.summary,
    lineageStatus: browserReceipt.evidenceLineage?.lineageStatus || null
  } : null,
  artifactCount: artifacts.length,
  screenshotCount: artifacts.filter(a => a.kind === 'SCREENSHOT').length,
  orphanScreenshots: artifacts.filter(a => a.kind === 'SCREENSHOT' && a.binding.flowBinding === 'UNINDEXED_SCREENSHOT').map(a => a.path),
  supersededScreenshotsRetained: artifacts.filter(a => a.kind === 'SCREENSHOT' && a.binding.flowBinding === 'BOUND_TO_BROWSER_FLOW_FROM_FILENAME__RETAINED_SUPERSEDED_ATTEMPT').length,
  artifacts
};

await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(JSON.stringify({
  index: 'writer-output/W04/EVIDENCE_INDEX.json',
  artifacts: index.artifactCount,
  screenshots: index.screenshotCount,
  orphanScreenshots: index.orphanScreenshots,
  executedSourceTree: identity.sha256.slice(0, 12),
  matchesDispatchBaseline: index.executedSource.matchesDispatchBaseline
}, null, 2));
if (index.orphanScreenshots.length) process.exitCode = 1;
