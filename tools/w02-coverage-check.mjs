#!/usr/bin/env node
/* W02 coverage check — subject-matched proof for the ZL01_ZL02_RECONCILIATION rows whose
   proof_requirement is "D12/D13/D14 equivalent obligation-level manifest":
   "final convergence/audit must consume a FROZEN row-addressable obligation manifest and return
   obligation -> status".

   This checker consumes the Controller's frozen manifest (W02_REQUIREMENTS.csv) and the Writer's
   rules (PROOF_CATALOG.json) directly. It deliberately does NOT invoke tools/writer-acceptance-matrix.py
   (the generator may not prove itself) and it does not write any artifact. Exit 0 iff every one of the
   1,485 obligations maps to exactly one rule and every produced status is in the permitted vocabulary.
*/
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const VALID = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT_APPLICABLE_WITH_PROOF']);

const csvText = await readFile(new URL('controller/09_writer_forge/W02_REQUIREMENTS.csv', root), 'utf8');

const parseCsv = text => {
  const records = []; let record = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { record.push(field); field = ''; }
    else if (ch === '\n') { record.push(field); field = ''; records.push(record); record = []; }
    else if (ch === '\r') { /* skip */ }
    else field += ch;
  }
  if (field.length || record.length) { record.push(field); records.push(record); }
  return records.filter(row => row.length > 1 || (row[0] || '').length > 0);
};

const table = parseCsv(csvText);
const header = table[0];
const rows = table.slice(1).map(cells => Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])));
const catalog = JSON.parse(await readFile(new URL('writer-output/W02/PROOF_CATALOG.json', root), 'utf8'));

const rowMatches = (match, row) => {
  for (const [key, expectedRaw] of Object.entries(match)) {
    const expected = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw];
    if (key.endsWith('__not_contains') || key.endsWith('__contains')) {
      const negate = key.endsWith('__not_contains');
      const base = key.slice(0, key.length - (negate ? '__not_contains'.length : '__contains'.length));
      if (!(base in row)) return false;
      const haystack = row[base] || '';
      const hit = expected.some(needle => haystack.includes(needle));
      if (hit === negate) return false;
      continue;
    }
    if (key.endsWith('__not')) {
      const base = key.slice(0, key.length - '__not'.length);
      if (!(base in row)) return false;
      if (expected.includes(row[base] || '')) return false;
      continue;
    }
    if (!(key in row)) return false;
    if (!expected.includes(row[key] || '')) return false;
  }
  return true;
};

const unmatched = [], ambiguous = [], obligationToRule = [];
const ruleHitCounts = new Map(catalog.rules.map(rule => [rule.id, 0]));
for (const row of rows) {
  const hits = catalog.rules.filter(rule => rowMatches(rule.match || {}, row));
  if (hits.length === 0) unmatched.push(row.obligation_id);
  else if (hits.length > 1) ambiguous.push({ obligation: row.obligation_id, rules: hits.map(hit => hit.id) });
  else {
    const rule = hits[0];
    ruleHitCounts.set(rule.id, ruleHitCounts.get(rule.id) + 1);
    const status = rule.status_mode === 'literal' ? rule.status : 'DERIVED_FROM_MEASURED_PROOF';
    if (rule.status_mode === 'literal' && !VALID.has(rule.status)) unmatched.push(`${row.obligation_id}:INVALID_STATUS`);
    obligationToRule.push({ obligation: row.obligation_id, rule: rule.id, status });
  }
}
const proofIds = new Set(catalog.proofs.map(proof => proof.id));
const dangling = catalog.rules.flatMap(rule => (rule.proofs || []).filter(id => !proofIds.has(id)).map(id => `${rule.id}:${id}`));
const sha = createHash('sha256').update(csvText).digest('hex');

const ok = rows.length === 1485 && unmatched.length === 0 && ambiguous.length === 0 && dangling.length === 0;
const report = {
  schemaVersion: 1,
  kind: 'W02_OBLIGATION_MANIFEST_COVERAGE_CHECK',
  manifest: 'controller/09_writer_forge/W02_REQUIREMENTS.csv',
  manifestSha256: sha,
  obligations: rows.length,
  addressable: obligationToRule.length,
  unmatched: unmatched.slice(0, 20),
  ambiguous: ambiguous.slice(0, 20),
  danglingProofRefs: dangling,
  rules: catalog.rules.length,
  proofs: catalog.proofs.length,
  perRule: Object.fromEntries([...ruleHitCounts].filter(([, count]) => count > 0)),
  status: ok ? 'PASS' : 'FAIL'
};
console.log(JSON.stringify(report, null, 2));
if (!ok) process.exitCode = 1;
