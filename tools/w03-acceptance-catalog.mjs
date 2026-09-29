/**
 * W03 acceptance catalog generator + zero-loss validator.
 *
 * Emits writer-output/W03/PROOF_CATALOG.json as a DISJOINT, TOTAL partition of all
 * 2,183 rows in controller/09_writer_forge/W03_REQUIREMENTS.csv, then re-implements
 * tools/writer-acceptance-matrix.py's row_matches() semantics locally and fails loudly
 * when a row matches 0 rules (zero-loss violation) or >1 rule (ambiguous ownership).
 *
 * Status law (writer-output/ACCEPTANCE_MATRIX_SPEC.md):
 *   PASS/FAIL  -> derived from MEASURED proof results (proof_logic "all")
 *   BLOCKED    -> literal + justification naming the missing authority
 *   NOT_APPLICABLE_WITH_PROOF -> literal + justification citing a binding rule
 *
 * Q-4 (TimelineReplayOwner retain-vs-retire) is STOP/REPORT for this workspace:
 * those rows are BLOCKED with Q-4 named, never silently dispositioned.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const csvPath = path.join(new URL('.', root).pathname, 'controller/09_writer_forge/W03_REQUIREMENTS.csv');

/* ---------------------------------------------------------------- parsing */
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (ch === '\r') continue;
    field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().filter(cell => cell !== '');
  return rows.filter(r => r.some(cell => cell !== '')).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const rows = parseCsv(await readFile(csvPath, 'utf8'));

/* ---------------------------------------------------------------- proofs  */
const node = command => ({ command, timeout: 600 });
const PROOFS = [
  { id: 'P-W03-ENTERPRISE-SURFACE', artifact: 'dist/tests/surfaces/enterprise/domain.test.js', kind: 'surface_route_test', ...node('node dist/tests/surfaces/enterprise/domain.test.js') },
  { id: 'P-W03-SCENARIOS-SURFACE', artifact: 'dist/tests/surfaces/scenarios/domain.test.js', kind: 'surface_route_test', ...node('node dist/tests/surfaces/scenarios/domain.test.js') },
  { id: 'P-W03-LABS-SURFACE', artifact: 'dist/tests/surfaces/labs/domain.test.js', kind: 'surface_route_test', ...node('node dist/tests/surfaces/labs/domain.test.js') },
  { id: 'P-W03-RUNS-SURFACE', artifact: 'dist/tests/surfaces/runs/domain.test.js', kind: 'surface_route_test', ...node('node dist/tests/surfaces/runs/domain.test.js') },
  { id: 'P-W03-RUNS-GROUP', artifact: 'dist/tests/surfaces/runs/group-regression.test.js', kind: 'contract', ...node('node dist/tests/surfaces/runs/group-regression.test.js') },
  { id: 'P-W03-RESULTS-SURFACE', artifact: 'dist/tests/surfaces/results/domain.test.js', kind: 'surface_route_test', ...node('node dist/tests/surfaces/results/domain.test.js') },
  { id: 'P-W03-S10-LIFECYCLE', artifact: 'dist/tests/rescue/S10_W03_ENTERPRISE/domain-and-lifecycle.test.js', kind: 'contract', ...node('node dist/tests/rescue/S10_W03_ENTERPRISE/domain-and-lifecycle.test.js') },
  { id: 'P-W03-S10-DUPLICATE', artifact: 'dist/tests/rescue/S10_W03_ENTERPRISE/source-duplicate-owner.test.js', kind: 'contract', ...node('node dist/tests/rescue/S10_W03_ENTERPRISE/source-duplicate-owner.test.js') },
  { id: 'P-W03-S11-LAB', artifact: 'dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js', kind: 'contract', ...node('node dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js') },
  { id: 'P-W03-S11-SCENARIO', artifact: 'dist/tests/rescue/S11_W03_SCENARIOS_LABS/scenario-studio.test.js', kind: 'contract', ...node('node dist/tests/rescue/S11_W03_SCENARIOS_LABS/scenario-studio.test.js') },
  { id: 'P-W03-S12', artifact: 'dist/tests/rescue/S12_W03_RUNS/runs-operational-workspace.test.js', kind: 'contract', ...node('node dist/tests/rescue/S12_W03_RUNS/runs-operational-workspace.test.js') },
  { id: 'P-W03-S13', artifact: 'dist/tests/rescue/S13_W03_RESULTS/results-rescue.test.js', kind: 'contract', ...node('node dist/tests/rescue/S13_W03_RESULTS/results-rescue.test.js') },
  { id: 'P-W03-CG4-LIFECYCLE', artifact: 'dist/tests/rescue/CG4_W03_COVERAGE/controller-corr01-w03-lifecycle-truth.test.js', kind: 'contract', ...node('node dist/tests/rescue/CG4_W03_COVERAGE/controller-corr01-w03-lifecycle-truth.test.js') },
  { id: 'P-W03-CG4-COMPOSITION', artifact: 'dist/tests/rescue/CG4_W03_COVERAGE/group-composition.test.js', kind: 'contract', ...node('node dist/tests/rescue/CG4_W03_COVERAGE/group-composition.test.js') },
  { id: 'P-W03-CG4-FALSIFICATION', artifact: 'dist/tests/rescue/CG4_W03_COVERAGE/group-falsification.test.js', kind: 'contract', ...node('node dist/tests/rescue/CG4_W03_COVERAGE/group-falsification.test.js') },
  { id: 'P-W03-D09', artifact: 'dist/tests/post-c03/D09/d09-w03-studios-replay-tests.js', kind: 'contract', ...node('node dist/tests/post-c03/D09/d09-w03-studios-replay-tests.js') },
  { id: 'P-W03-LCORR03', artifact: 'dist/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.js', kind: 'contract', ...node('node dist/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.js') },
  { id: 'P-W03-LCORR01', artifact: 'dist/tests/post-c03/LCORR01/lcorr01-parent-candidate-falsification-tests.js', kind: 'contract', ...node('node dist/tests/post-c03/LCORR01/lcorr01-parent-candidate-falsification-tests.js') },
  { id: 'P-W03-COMPARE', artifact: 'dist/analytical-compare-tests.js', kind: 'contract', ...node('node dist/analytical-compare-tests.js') },
  { id: 'P-W03-COMPARE-CORRECTION', artifact: 'dist/analytical-compare-correction-tests.js', kind: 'contract', ...node('node dist/analytical-compare-correction-tests.js') },
  { id: 'P-W03-SPATIAL-ATOMICITY', artifact: 'dist/ps02-spatial-finite-atomicity-tests.js', kind: 'contract', ...node('node dist/ps02-spatial-finite-atomicity-tests.js') },
  { id: 'P-W03-BOTTOM-DEEP', artifact: 'dist/w3-d-bottom-deep-work-tests.js', kind: 'contract', ...node('node dist/w3-d-bottom-deep-work-tests.js') },
  { id: 'P-W03-OPERATIONAL-SESSION', artifact: 'dist/w4-f-operational-session-tests.js', kind: 'contract', ...node('node dist/w4-f-operational-session-tests.js') },
  { id: 'P-W03-PROFILE-COVERAGE', artifact: 'tools/w03-profile-coverage.mjs', kind: 'checker', ...node('node tools/w03-profile-coverage.mjs') },
  { id: 'P-W03-BROWSER-FLOWS', artifact: 'tools/w03-browser-flows.mjs', kind: 'browser', timeout: 900, ...node('node tools/w03-browser-flows.mjs') },
  { id: 'P-W03-SEMANTIC-OWNERSHIP', artifact: 'tools/check-w03-semantic-ownership.py', kind: 'checker', ...node('tools/writer-serial.sh python3 tools/check-w03-semantic-ownership.py') },
  { id: 'P-W03-MODEL', artifact: 'tools/test-models.mjs', kind: 'unit', ...node('tools/writer-serial.sh npm test') }
].map(proof => ({ ...proof, workspaceScope: 'W03' }));

const byId = Object.fromEntries(PROOFS.map(proof => [proof.id, proof]));

/* --------------------------------------------------------------- rules   */
const SURFACES = ['enterprise', 'scenarios', 'labs', 'runs', 'results'];
const Q4_IDS = ['OBL-003188', 'OBL-003189', 'OBL-003190', 'OBL-003191', 'OBL-003192', 'OBL-008618', 'OBL-005504', 'OBL-005505', 'OBL-005506', 'OBL-005507', 'OBL-005508'];

const SHARED = ['P-W03-SEMANTIC-OWNERSHIP', 'P-W03-MODEL'];
const BASE = {
  enterprise: ['P-W03-ENTERPRISE-SURFACE', 'P-W03-S10-LIFECYCLE', 'P-W03-S10-DUPLICATE', 'P-W03-BROWSER-FLOWS'],
  scenarios: ['P-W03-SCENARIOS-SURFACE', 'P-W03-S11-SCENARIO', 'P-W03-LCORR01'],
  labs: ['P-W03-LABS-SURFACE', 'P-W03-S11-LAB', 'P-W03-LCORR01'],
  runs: ['P-W03-RUNS-SURFACE', 'P-W03-RUNS-GROUP', 'P-W03-S12', 'P-W03-OPERATIONAL-SESSION', 'P-W03-BROWSER-FLOWS'],
  results: ['P-W03-RESULTS-SURFACE', 'P-W03-S13', 'P-W03-COMPARE', 'P-W03-COMPARE-CORRECTION', 'P-W03-BROWSER-FLOWS']
};
const LAYER_EXTRA = {
  OWNER_DECISION: ['P-W03-PROFILE-COVERAGE', 'P-W03-LCORR03'],
  OWNER_QA_DEEP_AUDIT: ['P-W03-LCORR03', 'P-W03-CG4-LIFECYCLE', 'P-W03-CG4-COMPOSITION', 'P-W03-CG4-FALSIFICATION'],
  ZL01_ROOT_FINDING: ['P-W03-LCORR03', 'P-W03-D09'],
  ZL01_DURABLE_ANCILLARY: ['P-W03-SPATIAL-ATOMICITY', 'P-W03-BOTTOM-DEEP'],
  ZL01_ZL02_RECONCILIATION: ['P-W03-LCORR03', 'P-W03-LCORR01', 'P-W03-D09'],
  ZL01_FORWARD_GAP: ['P-W03-D09', 'P-W03-LCORR03']
};
const LAYERS = ['OWNER_DECISION', 'OWNER_QA_DEEP_AUDIT', 'ZL01_ROOT_FINDING', 'ZL01_DURABLE_ANCILLARY', 'ZL01_FORWARD_GAP'];

const uniq = list => [...new Set(list)];
const derived = (id, match, proofs, evidence_ref) => ({
  id,
  match,
  status_mode: 'derived_from_proof',
  proof_logic: 'all',
  proofs: uniq(proofs),
  evidence_ref
});
const literal = (id, match, status, justification, proof_ref, evidence_ref = '') => ({
  id, match, status_mode: 'literal', status, justification, proof_ref, evidence_ref
});

const rules = [];

/* Q-4: STOP/REPORT — TimelineReplayOwner retain-vs-retire is not adjudicated. */
rules.push(literal(
  'R-Q4-TIMELINE-REPLAY-OWNER-BLOCKED',
  { obligation_id: Q4_IDS },
  'BLOCKED',
  'STOP/REPORT open question Q-4 (controller/03_historical/open_questions.md): TimelineReplayOwner retain-vs-retire is not adjudicated — the owner exists in code as exactly one instance but is absent from registries, and A01-PF-007 (DUPLICATE_OWNER_RISK / AUTHORITY_COLLISION) plus OBL-008618 require the Controller/Owner to select one generic replay owner before broad W03 mutation. This workspace may not decide it silently (packet §6). Missing authority: Owner/registry decision on Q-4. Rows held: OBL-003188, OBL-003189, OBL-003190, OBL-003191, OBL-003192, OBL-008618, OBL-005504, OBL-005505, OBL-005506, OBL-005507, OBL-005508. The single-instance invariant itself is measured and holds (see TimelineReplayOwner proof in W03_HANDOFF.md).',
  'controller/03_historical/open_questions.md#Q-4',
  'writer-output/W03/W03_HANDOFF.md#timeline-replayowner-single-instance'
));

/* Foreign "Future Dx Mission material" rows: proof material is not W03's deliverable. */
rules.push(literal(
  'R-FUTURE-FOREIGN-MISSION-BLOCKED',
  { proof_requirement__contains: ['Future D05', 'Future D06', 'Future D08', 'Future D10', 'Future D11'] },
  'BLOCKED',
  'proof_requirement names mission material owned by another lane: D05 (structured sticky/persistence), D06 (operational detach/sticky handoff), D08 (W02 Visualize representation parity), D10 (W04 authority lifecycle), D11 (W05 provider integration). W03 produces none of that material, and the packet forbids claiming another workspace\'s proof (§16 integration boundaries). Missing dependency: the named Controller mission receipt (D05/D06/D08/D10/D11) bound to this candidate; re-run the matrix after those receipts land.',
  'controller/09_writer_forge/W03_writer_packet.md#16',
  ''
));

/* D09 IS W03's own convergence mission. */
rules.push(derived(
  'R-FUTURE-D09-W03-MISSION',
  { proof_requirement: 'Future D09 Mission material' },
  [...new Set([...SHARED, ...BASE.enterprise, ...BASE.scenarios, ...BASE.labs, ...BASE.runs, ...BASE.results, 'P-W03-D09', 'P-W03-LCORR03', 'P-W03-PROFILE-COVERAGE'])],
  'writer-output/W03/EVIDENCE_INDEX.json#d09-w03-studios'
));

/* D12/D13/D14 obligation-manifest law: the consuming audit is not this workspace's. */
rules.push(literal(
  'R-ZL02-D13-D14-OBLIGATION-MANIFEST-BLOCKED',
  { proof_requirement__contains: 'D12/D13/D14 equivalent obligation-level' },
  'BLOCKED',
  'OBL requires the FINAL convergence/audit to consume a frozen row-addressable obligation manifest and return obligation -> seam -> integrated source -> positive proof. That consumption happens at D12/D13/D14 (C03-GATE-024 / D14 obligation-manifest law), not inside a Writer workspace; W03 can only author the frozen manifest (ACCEPTANCE_MATRIX.csv). Missing dependency: D13 serialized final integration + D14 independent proof run by the Coordinator against this candidate.',
  'controller/09_writer_forge/W03_writer_packet.md#16',
  'writer-output/W03/ACCEPTANCE_MATRIX.csv'
));

/* Visual references: Owner matched-state inspection is not a Writer deliverable (K-05). */
rules.push(literal(
  'R-VISUAL-REFERENCE-OWNER-INSPECTION-BLOCKED',
  { source_layer: 'VISUAL_REFERENCE' },
  'BLOCKED',
  'Rows demand actual image inspection at matched state/viewport (1440 and ~1024) with RTL/LTR/Bidi + focus/keyboard/accessibility verdicts. W03 captured hash-bound matched-viewport screenshots at 1440x1000 and 1024x900 (writer-output/W03/BROWSER_RECEIPT.json), but browser_contract §4 (K-05) keeps visual references Presentation-input-only and Owner matched-state acceptance is Owner authority, not a Writer proof. Missing authority: Owner visual acceptance + C03-GATE-020 visual region/state proof.',
  'controller/07_browser/browser_contract.md#4',
  'writer-output/W03/BROWSER_RECEIPT.json'
));

/* Archaeology: consumed through the current profile/domain crosswalk, never re-implemented. */
for (const surface of SURFACES) {
  rules.push(derived(
    `R-ARCH-${surface.toUpperCase()}`,
    { source_layer: 'AUTHORITY_RECOVERY_ARCHAEOLOGY', surface },
    uniq([...SHARED, ...BASE[surface], 'P-W03-PROFILE-COVERAGE']),
    'writer-output/W03/EVIDENCE_INDEX.json#ar2-recovered-durable-value-crosswalk'
  ));
  rules.push(derived(
    `R-IDENTITY-${surface.toUpperCase()}`,
    { source_layer: 'CURRENT_IDENTITY', surface },
    uniq([...SHARED, ...BASE[surface], 'P-W03-PROFILE-COVERAGE']),
    'writer-output/W03/EVIDENCE_INDEX.json#surface-identity'
  ));
  rules.push(derived(
    `R-PROFILE-${surface.toUpperCase()}`,
    { source_layer: 'CURRENT_PROFILE', surface },
    ['P-W03-PROFILE-COVERAGE', 'P-W03-SEMANTIC-OWNERSHIP'],
    'writer-output/W03/PROFILE_COVERAGE.json'
  ));
  rules.push(derived(
    `R-RESULT-AUDIT-${surface.toUpperCase()}`,
    { source_layer: 'CURRENT_RESULT_AUDIT', surface },
    uniq([...SHARED, ...BASE[surface], 'P-W03-D09']),
    'writer-output/W03/ACCEPTANCE_SUMMARY.json'
  ));
}

/* Residual ZL02 rows on runs (GATE-021 harness directory + D03B durable guardrails). */
rules.push(derived(
  'R-ZL02-RUNS-RESIDUAL',
  { source_layer: 'ZL01_ZL02_RECONCILIATION', surface: 'runs', proof_requirement__not_contains: ['D12/D13/D14', 'Future D'], obligation_id__not: Q4_IDS },
  uniq([...SHARED, ...BASE.runs, 'P-W03-BROWSER-FLOWS']),
  'writer-output/W03/BROWSER_RECEIPT.json'
));

/* Bulk: source_layer x surface, disjoint from every literal rule above. */
for (const layer of LAYERS) {
  for (const surface of SURFACES) {
    rules.push(derived(
      `R-${layer.replace(/[^A-Z0-9]+/g, '')}-${surface.toUpperCase()}`,
      {
        source_layer: layer,
        surface,
        proof_requirement__not_contains: 'Future D',
        obligation_id__not: Q4_IDS
      },
      uniq([...SHARED, ...BASE[surface], ...(LAYER_EXTRA[layer] || [])]),
      `writer-output/W03/EVIDENCE_INDEX.json#${layer.toLowerCase()}`
    ));
  }
}

/* ---------------------------------------------------------------- validate (mirror of writer-acceptance-matrix.row_matches) */
function rowMatches(ruleMatch, row) {
  for (const [key, expectedRaw] of Object.entries(ruleMatch)) {
    let negate = false;
    let base = key;
    let mode = 'exact';
    if (key.endsWith('__not_contains')) { negate = true; base = key.slice(0, -'__not_contains'.length); mode = 'contains'; }
    else if (key.endsWith('__contains')) { base = key.slice(0, -'__contains'.length); mode = 'contains'; }
    else if (key.endsWith('__not')) { negate = true; base = key.slice(0, -'__not'.length); mode = 'exact'; }
    if (!(base in row)) return false;
    const haystack = row[base] || '';
    if (mode === 'contains') {
      const needles = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw];
      const hit = needles.some(needle => haystack.includes(needle));
      if (hit === negate) return false;
    } else {
      const accepted = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw];
      const same = accepted.includes(haystack);
      if (same === negate) return false;
    }
  }
  return true;
}

const unmatched = [];
const multi = [];
const hitsByRule = Object.fromEntries(rules.map(rule => [rule.id, 0]));
for (const row of rows) {
  const hits = rules.filter(rule => rowMatches(rule.match, row));
  if (hits.length === 0) unmatched.push(row.obligation_id);
  else if (hits.length > 1) multi.push([row.obligation_id, hits.map(hit => hit.id)]);
  else hitsByRule[hits[0].id] += 1;
}

if (unmatched.length || multi.length) {
  console.error(`w03-acceptance-catalog: ZERO_LOSS_VIOLATION unmatched=${unmatched.length} (${unmatched.slice(0, 20).join(',')}) multi=${multi.length} ${JSON.stringify(multi.slice(0, 10))}`);
  process.exit(1);
}

const proofIds = new Set(PROOFS.map(proof => proof.id));
const unknownProofs = rules.flatMap(rule => (rule.proofs || []).filter(id => !proofIds.has(id)));
if (unknownProofs.length) {
  console.error(`w03-acceptance-catalog: UNKNOWN_PROOF_REFERENCE ${JSON.stringify([...new Set(unknownProofs)])}`);
  process.exit(1);
}
const unusedProofs = PROOFS.filter(proof => !rules.some(rule => (rule.proofs || []).includes(proof.id))).map(proof => proof.id);
if (unusedProofs.length) {
  console.error(`w03-acceptance-catalog: PROOF_DECLARED_BUT_UNBOUND ${JSON.stringify(unusedProofs)}`);
  process.exit(1);
}

const catalog = { schemaVersion: 1, workspace: 'W03', proofs: PROOFS, rules };
await mkdir(new URL('writer-output/W03/', root), { recursive: true });
await writeFile(new URL('writer-output/W03/PROOF_CATALOG.json', root), JSON.stringify(catalog, null, 2) + '\n');

const literalCount = rules.filter(rule => rule.status_mode === 'literal').length;
console.log(`w03-acceptance-catalog: OK rows=${rows.length} rules=${rules.length} (literal=${literalCount}, derived=${rules.length - literalCount}) proofs=${PROOFS.length}`);
for (const rule of rules) console.log(`   ${String(hitsByRule[rule.id]).padStart(4)}  ${rule.id}  [${rule.status_mode === 'literal' ? rule.status : 'derived'}]`);
