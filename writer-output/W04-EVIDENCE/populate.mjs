#!/usr/bin/env node
/**
 * W04-EVIDENCE — fixture population + lineage-bound capture.
 *
 * The product evidence domain MUST boot empty (tools/c2-w04-truth "normal-defaults-empty",
 * tools/w04-browser-flows "evidence.domain-empty-at-start"). This harness therefore imports a
 * realistic intake batch through the LIVE domain API (evidence.import / verifySource /
 * submitCandidate / markCandidateValidated / admit) exactly as the sanctioned reviewer harness
 * does. Every fixture is labelled FIXTURE in the capture lineage.
 *
 * usage: node writer-output/W04-EVIDENCE/populate.mjs <name> <width> <height> [lang] [selectId]
 *   lang: ar|en   (seeded via the shared preference store before boot)
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(import.meta.dirname, 'captures');
mkdirSync(OUT, { recursive: true });

const [name = 'populated', wArg = '1505', hArg = '1045', lang = 'ar', selectId = '', collapse = '', segment = ''] = process.argv.slice(2);
const width = Number(wArg), height = Number(hArg);
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
// Seed the ACTIVE LANGUAGE through the product's own preference store (Settings-owned seam).
await ctx.addInitScript(({ lang }) => {
  try {
    localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({
      schemaVersion: 1, kind: 'cep-foundation-preferences',
      overrides: { global: { locale: lang, chromeDirection: lang === 'ar' ? 'rtl' : 'ltr' } }
    }));
  } catch { /* storage unavailable — boot default applies */ }
}, { lang });

const page = await ctx.newPage();
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(String(e?.message || e)));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(400);

/* ---------------------------------------------------------------- intake fixture batch */
const FIXTURE = await page.evaluate(({ selectId }) => {
  const M = window.CEPFoundation.m0Composition;
  const d = M.group.evidence.domain;
  const log = { imports: [], verifications: [], admissions: [], receiptsBefore: d.receipts.length, label: 'FIXTURE_INTAKE_BATCH__W04_EVIDENCE_VISUAL_HARNESS' };

  const batch = [
    {
      id: 'ce-0142', revisionId: 'ce-0142-r1', title: 'Candidate Evidence CE-0142',
      subject: 'Ahmed', sourceType: 'Simulation & Enterprise',
      sourceId: 'RUN-0042', sourceRevision: 'Result Revision 1',
      evidenceClaim: 'Demonstrated ability to investigate suspicious SQL activity and interpret correlated detection signals.',
      criterionRefs: ['criteria:v4#application-security-investigation'],
      governedPurpose: 'Demonstrate applied investigation skills and interpretation of detection context in a simulated scenario.',
      notes: 'Includes alert event, timeline context, and analyst observation.',
      handoffReceiptRef: 'handoff:source-transfer:2025-05-14T10:45:12Z',
      sourceTimestamp: '2025-05-14T10:45:12.000Z',
      producerIdentity: 'producer:simulation-enterprise',
      selectedMaterialRefs: ['RUN-0042@Result Revision 1', 'soc-alert:payload:88213@v1', 'timeline:10:24:28-10:27:10@v1'],
      candidateState: 'SUBMITTED_FOR_INTAKE', verified: true, validated: true, bindAuthority: true,
      digest: 'sha256:7f3c9d1a5b8e42f0c6d9a1b7e5f3c9d1a5b8e42f0c6d9a1b7e5f3c9d1a5b8e42'
    },
    {
      id: 'ce-0141', revisionId: 'ce-0141-r1', title: 'Candidate Evidence CE-0141',
      subject: 'Mariam', sourceType: 'SOC Operations',
      sourceId: 'RUN-0039', sourceRevision: 'Result Revision 2',
      evidenceClaim: 'Triaged a ransomware detection campaign and documented containment steps against a controlled target.',
      criterionRefs: ['criteria:v4#incident-response'],
      governedPurpose: 'Evidence the containment workflow from alert triage to isolation under supervision.',
      notes: 'Containment transcript retained with the run manifest.',
      handoffReceiptRef: 'handoff:source-transfer:2025-05-12T08:20:44Z',
      sourceTimestamp: '2025-05-12T08:20:44.000Z',
      producerIdentity: 'producer:soc-operations',
      selectedMaterialRefs: ['RUN-0039@Result Revision 2', 'containment:transcript:2291@v1'],
      candidateState: 'SUBMITTED_FOR_INTAKE', verified: true, validated: false,
      digest: 'sha256:1c4f8e2d6a9b03f7e5c1d8a4b6f2e9c0d7a3b5e1f8c4d6a2b9e0f7c3d5a1b8e6'
    },
    {
      id: 'ce-0138', revisionId: 'ce-0138-r1', title: 'Candidate Evidence CE-0138',
      subject: 'Omar', sourceType: 'Capture-the-flag Lab',
      sourceId: 'LAB-0117', sourceRevision: 'Attempt Revision 3',
      evidenceClaim: 'Recovered a forensic image and derived a defensible timeline of attacker persistence.',
      criterionRefs: ['criteria:v4#digital-forensics'],
      governedPurpose: 'Show repeatable forensic acquisition and timeline reconstruction on lab media.',
      notes: 'Returned once for a missing hash manifest; resubmitted with the manifest.',
      handoffReceiptRef: 'handoff:source-transfer:2025-05-09T13:02:10Z',
      sourceTimestamp: '2025-05-09T13:02:10.000Z',
      producerIdentity: 'producer:ctf-lab',
      selectedMaterialRefs: ['LAB-0117@Attempt Revision 3', 'timeline:persistence-map@v1'],
      candidateState: 'RETURNED_FOR_CONTEXT', returnReason: 'Hash manifest for the acquired image is missing; supply the manifest and resubmit.',
      verified: false, validated: false
    },
    {
      id: 'ce-0135', revisionId: 'ce-0135-r1', title: 'Candidate Evidence CE-0135',
      subject: 'Layla', sourceType: 'Enterprise Project',
      sourceId: 'PRJ-0026', sourceRevision: 'Report Revision 1',
      evidenceClaim: 'Produced a hardening report that reduced exposed services on the assessed subnet.',
      criterionRefs: ['criteria:v4#security-posture'],
      governedPurpose: 'Bind an assessed hardening outcome to the capability it demonstrates.',
      notes: 'Source report withdrawn by the producer after scope change.',
      handoffReceiptRef: 'handoff:source-transfer:2025-05-06T16:41:55Z',
      sourceTimestamp: '2025-05-06T16:41:55.000Z',
      producerIdentity: 'producer:enterprise-project',
      selectedMaterialRefs: ['PRJ-0026@Report Revision 1'],
      candidateState: 'PREPARED', verified: false, validated: false
    },
    {
      id: 'ev-0097', revisionId: 'ev-0097-r1', title: 'Admitted Evidence EV-0097',
      subject: 'Ahmed', sourceType: 'Simulation & Enterprise',
      sourceId: 'RUN-0031', sourceRevision: 'Result Revision 4',
      evidenceClaim: 'Correlated IDS alerts with proxy logs to reconstruct a staged command-and-control beacon.',
      criterionRefs: ['criteria:v4#detection-engineering'],
      governedPurpose: 'Admitted evidence that anchors the detection-engineering capability claim.',
      notes: 'Admitted after verified source bytes, validated intake and explicit admission authority.',
      handoffReceiptRef: 'handoff:source-transfer:2025-04-28T09:12:03Z',
      sourceTimestamp: '2025-04-28T09:12:03.000Z',
      producerIdentity: 'producer:simulation-enterprise',
      selectedMaterialRefs: ['RUN-0031@Result Revision 4', 'beacon:correlation:4412@v1'],
      candidateState: 'SUBMITTED_FOR_INTAKE', verified: true, validated: true, admitted: true,
      digest: 'sha256:9b2e7d4c1a8f53e0b6c9d2a7f4e1b8c5d3a6f9e2b7c0d4a1f8e5b2c9d6a3f0e7'
    }
  ];

  for (const item of batch) {
    const result = d.importEvidence({ ...item, verification: { status: 'UNVERIFIED' } });
    log.imports.push({ id: item.id, ok: result.ok, code: result.code || null });
    if (!result.ok) continue;
    if (item.verified) {
      const v = d.verifySource(item.id, {
        status: 'VERIFIED', providerId: 'provider:fixture-verifier', providerRevision: '1.0.0',
        proofId: `proof:fixture:${item.id}`, digest: item.digest, schemaValid: true, sourceBytesAvailable: true,
        producerIdentity: item.producerIdentity, handoffReceiptRef: item.handoffReceiptRef
      });
      log.verifications.push({ id: item.id, ok: v.ok, code: v.code || null });
    }
    if (item.validated) d.markCandidateValidated(item.id, { validator: 'evidence-intake', validationProofRef: `proof:intake:${item.id}` });
    if (item.candidateState === 'SUBMITTED_FOR_INTAKE' && !item.admitted) d.submitCandidate(item.id);
    if (item.bindAuthority) {
      // Admission authority is a BOUND, explicitly labelled fixture authority (this static route
      // ships no admission-authority registry) — it demonstrates the "all gates hold" state and
      // the green primary action without ever performing the admission itself.
      d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
      d.setAdmissionAuthority(item.id, true, `authority:evidence-admission:fixture:${item.id}`, { testOnly: false });
      log.authorities = log.authorities || [];
      log.authorities.push({ id: item.id, bound: true, label: 'FIXTURE_ADMISSION_AUTHORITY__EXPLICITLY_INJECTED_BY_VISUAL_HARNESS' });
    }
    if (item.candidateState === 'RETURNED_FOR_CONTEXT') { d.submitCandidate(item.id); d.returnForContext(item.id, { reason: item.returnReason }); }
    if (item.admitted) {
      d.submitCandidate(item.id);
      d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
      d.setAdmissionAuthority(item.id, true, `authority:evidence-admission:fixture:${item.id}`, { testOnly: false });
      const a = d.admit(item.id);
      log.admissions.push({ id: item.id, ok: a.ok, code: a.code || null });
    }
  }
  if (selectId) d.get(selectId); // throws before render if the requested record is absent
  try { window.CEPFoundation.m0Composition.mounted?.render?.(); } catch {}
  return log;
}, { selectId });

await page.waitForTimeout(600);

// optional collapsed-state capture: collapse panes through the shared pane controls
const collapsed = [];
const flags = collapse.split(',').map(t => t.trim()).filter(Boolean);
if (flags.includes('left')) { const b = await page.$("[data-pane-toggle=\"left\"]"); if (b) { await b.click(); collapsed.push("left"); } }
if (flags.includes('right')) { const b = await page.$("[data-pane-toggle=\"right\"]"); if (b) { await b.click(); collapsed.push("right"); } }
if (collapsed.length) await page.waitForTimeout(400);

if (flags.includes('scrollright')) {
  await page.evaluate(() => { const n = document.querySelector('#domainContext'); if (n) n.scrollTop = n.scrollHeight; });
  await page.waitForTimeout(250);
}

let segmentActive = null;
if (segment) {
  const btn = await page.$(`[data-w04-segment="${segment}"]`);
  if (btn) { await btn.click(); await page.waitForTimeout(350); segmentActive = segment; }
}

const meta = await page.evaluate(() => ({
  dir: document.documentElement.getAttribute('dir') || '',
  lang: document.documentElement.getAttribute('lang') || '',
  surface: document.querySelector('#foundationStage')?.dataset?.m0Composition || null,
  rows: (window.CEPFoundation.m0Composition.surface.collectionCore || window.CEPFoundation.m0Composition.surface.collection).snapshot().visibleRows.map(r => r.id),
  selected: document.querySelector('#domainLeftRegion tr[aria-selected="true"]')?.getAttribute('data-r6-row') || null,
  centerTitle: document.querySelector('.w04-rec-title')?.textContent || null,
  bottom: document.querySelector('#bottomShelf')?.getAttribute('data-bottom-availability') ?? null
}));

const rel = path.join('captures', `${name}-${stamp}-${commit.slice(0, 8)}.png`);
const abs = path.join(import.meta.dirname, rel);
await page.screenshot({ path: abs, fullPage: false });
await browser.close();

const bytes = readFileSync(abs);
const sha = createHash('sha256').update(bytes).digest('hex');
const dims = execSync(`python3 -c "import struct;d=open('${abs}','rb').read(33);print(struct.unpack('>II',d[16:24]))"`, { cwd: ROOT }).toString().trim();

const entry = {
  name, timestamp: new Date().toISOString(), url: `http://localhost:4173/?surface=evidence`,
  viewport: { width, height, deviceScaleFactor: 1 }, candidate: `${branch}@${commit}`, commit, branch,
  environment: 'local dist served by tools/serve.mjs on :4173',
  state: 'POPULATED_FIXTURE_BATCH', fixtureLabel: FIXTURE.label, fixture: FIXTURE,
  image: { path: `writer-output/W04-EVIDENCE/${rel}`, sha256: sha, bytes: bytes.length, dims: JSON.parse(dims.replace(/\(/g, '[').replace(/\)/g, ']')) },
  dom: meta, collapsed, segmentActive, consoleErrors
};
const lineagePath = path.join(import.meta.dirname, 'LINEAGE.json');
const lineage = existsSync(lineagePath) ? JSON.parse(readFileSync(lineagePath, 'utf8')) : { entries: [] };
lineage.entries.push(entry);
writeFileSync(lineagePath, JSON.stringify(lineage, null, 2));
writeFileSync(path.join(import.meta.dirname, `${name}.receipt.json`), JSON.stringify(entry, null, 2));
console.log(JSON.stringify(entry, null, 2));
