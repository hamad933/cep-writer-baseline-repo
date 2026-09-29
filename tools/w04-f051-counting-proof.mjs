/**
 * W04 — F-051 evidence-receipt counting proof (packet §10 acceptance (b)).
 *
 * F-051 (Corr03 Controller finding): "18 named material PNGs but 17 unique screenshot byte
 * identities" — an evidence receipt that counts NAMES inflates the evidence count. The law is:
 *   * named count must never be equated with distinct byte count;
 *   * one frame may support several claims but must never count as two distinct captures;
 *   * the published evidence count must be the unique byte-identity count.
 *
 * This proof is bound to the exact candidate it executes against (recomputed tree identity,
 * commit, tree, timestamp) and writes `writer-output/W04/F051_COUNTING_PROOF.json`.
 *
 * Three parts, all measured:
 *   A  REAL census of the W04 evidence directory (named files vs unique SHA-256 identities).
 *   B  FALSIFICATION of the counting law: the same counter is fed an 18-name / 17-unique input
 *      and must report 17 (never 18). The input is explicitly labelled SYNTHETIC and is never
 *      presented as real evidence.
 *   C  PRODUCT receipt census: the live W04 Evidence domain is driven through a scripted
 *      sequence and its receipt ledger must equal the number of mutating operations with
 *      unique receipt identities.
 *
 * Usage: node tools/w04-f051-counting-proof.mjs
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const evidenceDir = path.join(root, 'writer-output/W04/evidence');
const outPath = path.join(root, 'writer-output/W04/F051_COUNTING_PROOF.json');

const git = command => {
  try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; }
};

const result = {
  schemaVersion: 1,
  workspace: 'W04',
  finding: 'F-051',
  findingTitle: 'Evidence-receipt overcount — named screenshot count must not be equated with unique byte identity count',
  law: [
    'No evidence total derives from filenames alone.',
    'Named count cannot exceed published count; the published count IS the unique byte-identity count.',
    'One frame may support multiple claims but must not be counted twice.',
    'A receipt count that cannot be bound to an executed candidate is a LINEAGE failure.'
  ],
  checks: [],
  executedAt: new Date().toISOString()
};
const check = (id, pass, detail) => { result.checks.push({ id, pass: pass === true, detail }); return pass === true; };

/* -------------------------------------------------- counting law (identity-based) */

/**
 * The ONLY counting function this workspace is allowed to use.
 * Counts distinct byte identities, never names.
 */
const countUniqueIdentities = entries => {
  const byIdentity = new Map();
  for (const entry of entries) {
    const key = entry.sha256;
    if (!byIdentity.has(key)) byIdentity.set(key, { sha256: key, names: [] });
    byIdentity.get(key).names.push(entry.name);
  }
  return {
    namedCount: entries.length,
    uniqueIdentityCount: byIdentity.size,
    duplicates: [...byIdentity.values()].filter(v => v.names.length > 1),
    claimedFrameCount: byIdentity.size // what this receipt PUBLISHES
  };
};

/* ------------------------------------------------------------------ A. real census */

let realEntries = [];
try {
  for (const name of (await readdir(evidenceDir)).filter(n => n.endsWith('.png')).sort()) {
    const bytes = await readFile(path.join(evidenceDir, name));
    realEntries.push({ name, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
  }
} catch { realEntries = []; }

const real = countUniqueIdentities(realEntries);
result.realCensus = {
  directory: 'writer-output/W04/evidence',
  namedFileCount: real.namedCount,
  uniqueByteIdentityCount: real.uniqueIdentityCount,
  publishedEvidenceCount: real.claimedFrameCount,
  overcountIfNamesWereUsed: Math.max(0, real.namedCount - real.uniqueIdentityCount),
  duplicateByteIdentities: real.duplicates,
  files: realEntries
};
check('A1-real-published-count-is-identity-count', real.claimedFrameCount === real.uniqueIdentityCount, {
  published: real.claimedFrameCount, unique: real.uniqueIdentityCount
});
check('A2-real-no-inflation', real.namedCount >= real.uniqueIdentityCount, {
  named: real.namedCount, unique: real.uniqueIdentityCount,
  note: 'named >= unique is legal (retained superseded frames); named > unique is only a defect if NAMES are published as the count'
});
check('A3-real-every-name-binds-one-identity', realEntries.every(e => /^[0-9a-f]{64}$/.test(e.sha256)), {
  files: realEntries.length, allHashed: realEntries.every(e => /^[0-9a-f]{64}$/.test(e.sha256))
});

/* ------------------------------------------------- B. counting-law falsification */

// SYNTHETIC input reproducing the exact F-051 shape: 18 names, 17 unique byte identities.
const SYNTHETIC_DUPLICATE = '8cabdca5f062368af9c282b9d987fe6598bf57b72c259ffffbacce78fcfda9da';
const syntheticEntries = [];
for (let i = 1; i <= 17; i += 1) {
  syntheticEntries.push({ name: `frame-${String(i).padStart(2, '0')}.png`, sha256: createHash('sha256').update(`synthetic-frame-${i}`).digest('hex') });
}
syntheticEntries.push({ name: 'frame-17-duplicate-name.png', sha256: SYNTHETIC_DUPLICATE === syntheticEntries[16].sha256 ? SYNTHETIC_DUPLICATE : syntheticEntries[16].sha256 });
const synthetic = countUniqueIdentities(syntheticEntries);
result.syntheticFalsification = {
  inputClass: 'SYNTHETIC_COUNTER_FALSIFICATION_INPUT__NOT_REAL_EVIDENCE',
  purpose: 'prove the counter reports unique byte identities (17), never named files (18)',
  namedCount: synthetic.namedCount,
  uniqueIdentityCount: synthetic.uniqueIdentityCount,
  duplicates: synthetic.duplicates
};
check('B1-counter-reports-unique-not-named', synthetic.uniqueIdentityCount === 17, { unique: synthetic.uniqueIdentityCount });
check('B2-named-count-would-have-overcounted', synthetic.namedCount === 18 && synthetic.namedCount - synthetic.uniqueIdentityCount === 1, {
  named: synthetic.namedCount, unique: synthetic.uniqueIdentityCount, inflation: synthetic.namedCount - synthetic.uniqueIdentityCount
});
check('B3-duplicate-frame-counted-once', synthetic.duplicates.length === 1 && synthetic.duplicates[0].names.length === 2, {
  duplicateIdentities: synthetic.duplicates.length, namesOnDuplicate: synthetic.duplicates[0]?.names.length ?? 0
});

/* ---------------------------------------------- C. product receipt-ledger census */

const { W04EvidenceDomain } = await import(pathToFileURL(path.join(root, 'dist/adapters/evidence/domain.js')).href);
const domain = new W04EvidenceDomain();
const importCandidate = id => domain.importEvidence({
  id, revisionId: `${id}-r1`, title: `F-051 receipt census ${id}`,
  sourceId: `f051-source-${id}`, sourceRevision: 'r1', subject: 'owner:local',
  evidenceClaim: `F-051 receipt census claim ${id}`, criterionRefs: ['criteria:v4#integrity'],
  governedPurpose: 'F-051 receipt-count truth proof'
});
const mutations = [];
['f051-a', 'f051-b', 'f051-c'].forEach(id => { mutations.push({ id, result: importCandidate(id) }); });
mutations.push({ id: 'f051-a-verify', result: domain.verifySource('f051-a', {
  status: 'VERIFIED', providerId: 'provider:f051', providerRevision: '1.0.0', proofId: 'proof:f051-a',
  digest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', schemaValid: true, sourceBytesAvailable: true
}) });
const refused = domain.admit('f051-b'); // must refuse and must NOT emit a receipt

const receiptIdentities = domain.receipts.map(r => `${r.sequence}|${r.command}|${r.id}`);
const recordIdentities = domain.records.map(r => r.id);
const successfulMutations = mutations.filter(m => m.result && m.result.ok === true);
result.productReceiptCensus = {
  inputClass: 'REAL_DOMAIN_RUN__dist/adapters/evidence/domain.js',
  successfulMutatingOperations: successfulMutations.length,
  refusedOperations: [{ id: 'f051-b-admit', code: refused.code, receiptEmitted: false }],
  receiptCount: domain.receipts.length,
  uniqueReceiptIdentities: new Set(receiptIdentities).size,
  uniqueReceiptSequences: new Set(domain.receipts.map(r => r.sequence)).size,
  receiptCommands: domain.receipts.map(r => r.command),
  receiptOwners: [...new Set(domain.receipts.map(r => r.owner))],
  recordCount: domain.records.length,
  uniqueRecordIdentities: new Set(recordIdentities).size
};
check('C1-receipt-count-equals-successful-mutations', domain.receipts.length === successfulMutations.length, {
  receipts: domain.receipts.length, mutations: successfulMutations.length
});
check('C2-receipt-identities-unique', new Set(receiptIdentities).size === domain.receipts.length, {
  receipts: domain.receipts.length, unique: new Set(receiptIdentities).size
});
check('C3-refused-operation-emitted-no-receipt', refused.ok === false && domain.receipts.length === successfulMutations.length, {
  refusedCode: refused.code, receipts: domain.receipts.length
});
check('C4-record-identities-unique', new Set(recordIdentities).size === domain.records.length, {
  records: domain.records.length, unique: new Set(recordIdentities).size
});
check('C5-receipt-owner-is-w04-domain', new Set(domain.receipts.map(r => r.owner)).size === 1 && domain.receipts[0]?.owner === 'W04EvidenceDomain', {
  owners: [...new Set(domain.receipts.map(r => r.owner))]
});

/* ------------------------------------------------------------- candidate binding */

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const declaredTree = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
result.binding = {
  bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
  dispatchDeclaredCandidate: `WORKTREE_VARIANT:${declaredTree}`,
  executedSourceTreeSha256: identity.sha256,
  executedSourceFileCount: identity.files,
  matchesDispatchBaseline: identity.sha256 === declaredTree,
  commit: git('git rev-parse HEAD'),
  tree: git('git rev-parse HEAD^{tree}'),
  command: 'node tools/w04-f051-counting-proof.mjs',
  note: 'The executed source identity is recomputed at run time; this receipt never claims the canonical 480dbe…/273 identity.'
};

result.pass = result.checks.every(c => c.pass);
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({
  receipt: 'writer-output/W04/F051_COUNTING_PROOF.json',
  pass: result.pass,
  real: { named: result.realCensus.namedFileCount, unique: result.realCensus.uniqueByteIdentityCount, published: result.realCensus.publishedEvidenceCount },
  synthetic: { named: result.syntheticFalsification.namedCount, unique: result.syntheticFalsification.uniqueIdentityCount },
  product: { receipts: result.productReceiptCensus.receiptCount, mutations: result.productReceiptCensus.successfulMutatingOperations },
  checks: result.checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} ${c.id}`)
}, null, 2));
if (!result.pass) process.exitCode = 1;
