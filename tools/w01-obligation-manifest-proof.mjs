/**
 * W01 obligation-manifest proof — subject-matched discharge for `R-OBLIGATION-MANIFEST`.
 *
 * `P-MATRIX-ZEROLOSS` runs the matrix generator itself, and a generator cannot be its own
 * proof (`SELF_REFERENTIAL_PROOF`, tools/writer-acceptance-matrix.py P6 proof hygiene). This
 * proof takes the obligation-level manifest AS ITS SUBJECT: it re-reads
 * `controller/09_writer_forge/W01_REQUIREMENTS.csv` and `writer-output/W01/ACCEPTANCE_MATRIX.csv`
 * independently and verifies the manifest law without running the generator:
 *
 *   1. every requirement obligation_id appears exactly once in the manifest (zero loss);
 *   2. no manifest row exists that is not a requirement row (nothing invented);
 *   3. every status is one of PASS | FAIL | BLOCKED | NOT_APPLICABLE_WITH_PROOF;
 *   4. a `PASS` row carries a measured `proof_ref`; a `BLOCKED` / `NOT_APPLICABLE_WITH_PROOF`
 *      row carries a non-empty `justification` (dispositions by law require proof);
 *   5. every row carries `rule_id` + `dispositioned_at`, and all rows share ONE uniform
 *      candidate/commit/tree triple (no mixed binding);
 *   6. ACCEPTANCE_SUMMARY counts agree with the manifest row-by-row and `zero_loss` is true.
 *
 * Exit 0 only if all six hold. Nothing here is written except stdout.
 *
 * Usage: node tools/w01-obligation-manifest-proof.mjs
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const requirementsPath = path.join(root, 'controller/09_writer_forge/W01_REQUIREMENTS.csv');
const matrixPath = path.join(root, 'writer-output/W01/ACCEPTANCE_MATRIX.csv');
const summaryPath = path.join(root, 'writer-output/W01/ACCEPTANCE_SUMMARY.json');

const VALID = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT_APPLICABLE_WITH_PROOF']);

/** Minimal RFC4180 parser (quoted fields contain commas and newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false; }
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter(r => r.some(v => v !== '')).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const requirements = parseCsv(await readFile(requirementsPath, 'utf8'));
const manifest = parseCsv(await readFile(matrixPath, 'utf8'));
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));

const errors = [];
const reqIds = requirements.map(r => r.obligation_id);
const reqSet = new Set(reqIds);
const manIds = manifest.map(r => r.obligation_id);
const manCounts = new Map();
for (const id of manIds) manCounts.set(id, (manCounts.get(id) || 0) + 1);

// 1. every requirement row dispositioned exactly once
const missing = reqIds.filter(id => !manCounts.has(id));
const duplicated = [...manCounts.entries()].filter(([, n]) => n > 1).map(([id]) => id);
if (missing.length) errors.push(`${missing.length} requirement obligation_id(s) missing from the manifest: ${missing.slice(0, 5).join(', ')}`);
if (duplicated.length) errors.push(`${duplicated.length} obligation_id(s) dispositioned more than once: ${duplicated.slice(0, 5).join(', ')}`);

// 2. nothing invented
const invented = manIds.filter(id => !reqSet.has(id));
if (invented.length) errors.push(`${invented.length} manifest row(s) are not requirement rows: ${invented.slice(0, 5).join(', ')}`);

// 3. status vocabulary
const badStatus = manifest.filter(r => !VALID.has(r.status)).map(r => `${r.obligation_id}=${r.status}`);
if (badStatus.length) errors.push(`invalid status value(s): ${badStatus.slice(0, 5).join(', ')}`);

// 4. proof law: PASS needs a measured proof_ref, BLOCKED/NA need a justification
const passNoProof = manifest.filter(r => r.status === 'PASS' && !(r.proof_ref || '').trim()).map(r => r.obligation_id);
const blockedNoReason = manifest.filter(r => (r.status === 'BLOCKED' || r.status === 'NOT_APPLICABLE_WITH_PROOF') && !(r.justification || '').trim()).map(r => r.obligation_id);
if (passNoProof.length) errors.push(`${passNoProof.length} PASS row(s) carry no measured proof_ref: ${passNoProof.slice(0, 5).join(', ')}`);
if (blockedNoReason.length) errors.push(`${blockedNoReason.length} BLOCKED/NA row(s) carry no justification: ${blockedNoReason.slice(0, 5).join(', ')}`);

// 5. disposition law on every row: a rule + a timestamp, and ONE uniform identity binding.
//    The binding triple is written by whichever generator run produced this manifest — the
//    authoritative run binds candidate/commit/tree, the zero-loss replay run binds none — so the
//    invariant is uniformity, not presence (presence is asserted on the authoritative summary).
const unbound = manifest.filter(r => !(r.rule_id || '').trim() || !(r.dispositioned_at || '').trim()).map(r => r.obligation_id);
if (unbound.length) errors.push(`${unbound.length} row(s) carry no rule_id / dispositioned_at: ${unbound.slice(0, 5).join(', ')}`);
const triples = new Set(manifest.map(r => `${r.candidate} ${r.commit} ${r.tree}`));
if (triples.size > 1) errors.push(`manifest rows are not uniformly bound to one candidate/commit/tree (${triples.size} distinct triples)`);

// 6. summary agreement
const counts = {};
for (const r of manifest) counts[r.status] = (counts[r.status] || 0) + 1;
const summaryCounts = Object.fromEntries(Object.entries(summary.counts || {}));
if (JSON.stringify(counts) !== JSON.stringify(summaryCounts)) errors.push(`summary counts disagree with manifest: summary=${JSON.stringify(summaryCounts)} manifest=${JSON.stringify(counts)}`);
if (summary.zero_loss !== true) errors.push(`summary.zero_loss is ${JSON.stringify(summary.zero_loss)}, expected true`);
if (summary.rows_dispositioned !== manifest.length || summary.requirements_rows !== requirements.length) errors.push(`summary row totals disagree: requirements=${requirements.length} manifest=${manifest.length} summary=${JSON.stringify([summary.requirements_rows, summary.rows_dispositioned])}`);

const matrixSha256 = createHash('sha256').update(await readFile(matrixPath)).digest('hex');
const report = {
  proof: 'P-OBLIGATION-MANIFEST',
  subject: 'writer-output/W01/ACCEPTANCE_MATRIX.csv (the obligation-level manifest itself, read independently of its generator)',
  requirementsRows: requirements.length,
  manifestRows: manifest.length,
  uniqueObligationIds: manCounts.size,
  counts,
  zeroLoss: summary.zero_loss === true,
  matrixSha256,
  status: errors.length ? 'FAIL' : 'PASS',
  errors
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
