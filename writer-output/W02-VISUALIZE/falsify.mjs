#!/usr/bin/env node
/**
 * W02-VISUALIZE lane falsification battery (writer mission N1..N5 + lane-specific canonical probe).
 *
 *  N1 non-owned / unavailable route mutation attempt -> must refuse (no receipt of success)
 *  N2 boundary / invalid input -> no corruption, no false receipt
 *  N3 missing provider -> truthful UNAVAILABLE, never fabricated
 *  N4 duplicate-mechanics check (run separately: tools/check-duplicate-mechanics.mjs)
 *  N5 suite determinism (run separately: second identical run)
 *  LANE: local canvas operations must NOT mutate the canonical object store -> sha256 hash of the
 *        canonical store before/after a canvas operation is compared byte-for-byte.
 *
 * Write scope: writer-output/W02-VISUALIZE/ only. Read-only product probing.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e?.message || e)));
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);

const sha = value => createHash('sha256').update(value).digest('hex');

const result = await page.evaluate(async () => {
  const findAdapter = (root, depth = 0, seen = new Set()) => {
    if (!root || typeof root !== 'object' || depth > 4 || seen.has(root)) return null;
    seen.add(root);
    if (typeof root.canonicalInvariantSnapshot === 'function') return root;
    for (const key of Object.keys(root)) {
      try { const found = findAdapter(root[key], depth + 1, seen); if (found) return found; } catch {}
    }
    return null;
  };
  const registry = CEPFoundation.registry;
  const adapter = findAdapter(CEPFoundation.m0Composition) || findAdapter(CEPFoundation);
  const canonicalStore = () => {
    const relations = CEPFoundation.relations;
    const projection = adapter && typeof adapter.canonicalProjection === 'function' ? adapter.canonicalProjection() : null;
    const invariant = adapter && typeof adapter.canonicalInvariantSnapshot === 'function' ? adapter.canonicalInvariantSnapshot() : null;
    return JSON.stringify({
      relationsRecords: relations?.records ?? null,
      relationsVersion: relations?.version ?? null,
      relationsReadOnly: relations?.readOnly ?? null,
      canonicalProjection: projection,
      canonicalInvariant: invariant
    });
  };
  const representationStore = () => JSON.stringify(adapter ? adapter.representationProjection() : null);
  const out = { adapterFound: !!adapter, checks: [] };
  const add = (id, ok, detail) => out.checks.push({ id, status: ok ? 'PASS' : 'FAIL', detail });

  // ── N3 provider truth: never fabricate canonical authority
  if (adapter) {
    const projection = adapter.canonicalProjection();
    const truth = adapter.providerTruth();
    add('N3.app-context-never-claims-canonical', projection.canonical !== true && truth.canonical === false && truth.authority === 'LOCAL_ACCEPTANCE_PROJECTION_ONLY', { status: projection.status, authority: truth.authority, canonical: truth.canonical });
    const link = adapter.linkAvailability({});
    add('N3.link-refused-without-canonical-provider', link.enabled === false && ['VISUALIZE_LOCAL_ACCEPTANCE_PROVIDER_READ_ONLY', 'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE'].includes(link.code) && link.code !== undefined, link.code);
    const edit = adapter.editAvailability({ objectId: 'obj-a' });
    add('N3.edit-refused-without-canonical-provider', edit.enabled === false && ['VISUALIZE_LOCAL_ACCEPTANCE_PROVIDER_READ_ONLY', 'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE'].includes(edit.code) && edit.code !== undefined, edit.code);
  }
  // ── N3 with NO provider at all (fresh adapter, no provider injected) -> truthful UNAVAILABLE
  try {
    const mod = await import('/adapters/visualize/domain.js');
    const bare = new mod.VisualizeDomainAdapter({ representations: [{ representationId: 'rep-x', canonicalRef: { id: 'obj-x', revision: 'r1' }, x: 0, y: 0 }] });
    const p = bare.canonicalProjection();
    add('N3.no-provider-truthfully-unavailable', p.ok === false && p.status === 'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE', p.status);
    const l = bare.linkAvailability({});
    add('N3.no-provider-link-refused', l.enabled === false && l.code === 'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE', l.code);
    const e2 = bare.editAvailability({ objectId: 'obj-x' });
    add('N3.no-provider-edit-refused', e2.enabled === false && e2.code === 'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE', e2.code);
  } catch (error) {
    add('N3.no-provider-truthfully-unavailable', false, String(error?.message || error));
  }

  // ── N1 non-owned / author-only route in the read-only Visualize consumer must refuse
  try {
    const connect = registry.execute('spatial.connect', { sourceObjectId: 'a', targetObjectId: 'b' });
    add('N1.author-only-connect-refused', connect?.ok === false || connect === undefined, connect);
  } catch (e) { add('N1.author-only-connect-refused', true, `threw: ${String(e.message || e).slice(0, 120)}`); }
  try {
    const bogus = registry.execute('visualize.notARealRoute', {});
    add('N1.unknown-route-refused', bogus?.ok === false || bogus === undefined, bogus);
  } catch (e) { add('N1.unknown-route-refused', true, `threw: ${String(e.message || e).slice(0, 120)}`); }

  // ── N2 boundary / invalid input -> no corruption, no false receipt
  if (adapter) {
    const before = representationStore();
    const badMove = adapter.move(['rep-not-real'], Number.POSITIVE_INFINITY, 0, { mode: 'CANVAS' });
    const invalidViewport = adapter.viewport({ mode: 'CANVAS', action: 'fit', width: 0, height: 0 });
    const unknownView = adapter.activateView('NOPE');
    const after = representationStore();
    add('N2.invalid-move-refused', badMove.ok === false && badMove.canonicalMutation === false, badMove.status);
    add('N2.invalid-viewport-refused', invalidViewport.ok === false, invalidViewport.status);
    add('N2.invalid-view-refused', unknownView.ok === false, unknownView.status);
    add('N2.projection-unchanged-by-invalid-input', before === after, before === after);
  }

  // ── LANE: canonical store hash before/after local canvas operations
  if (adapter) {
    registry.execute('visualize.view.canvas', { route: 'falsification' });
    const canonicalBefore = canonicalStore();
    const representationBefore = representationStore();
    const ops = [];
    ops.push(adapter.move([...adapter.model.selection.size ? adapter.model.selection : adapter.representationProjection('CANVAS').representations.slice(0, 1).map(r => r.representationId)], 12, 8, { mode: 'CANVAS' }));
    ops.push(adapter.duplicateRepresentation({ representationId: adapter.representationProjection('CANVAS').representations[0]?.representationId, mode: 'CANVAS' }));
    ops.push(adapter.createCanvasOnlyLink({ sourceRepresentationId: adapter.representationProjection('CANVAS').representations[0]?.representationId, targetRepresentationId: adapter.representationProjection('CANVAS').representations[1]?.representationId }));
    ops.push(adapter.viewport({ mode: 'CANVAS', action: 'fit', width: 640, height: 420 }));
    ops.push(adapter.viewport({ mode: 'CANVAS', action: 'pan', dx: 40, dy: 25 }));
    ops.push(adapter.viewport({ mode: 'CANVAS', action: 'zoom', factor: 1.2, x: 320, y: 210 }));
    ops.push(adapter.undoPresentation());
    ops.push(adapter.redoPresentation());
    const canonicalAfter = canonicalStore();
    const representationAfter = representationStore();
    out.canvasOperations = ops.map(o => ({ ok: o.ok, status: o.status, canonicalMutation: o.canonicalMutation, canonicalTruthUnchanged: o.canonicalTruthUnchanged ?? null }));
    out.canonicalStoreHashProof = {
      beforeSha256: canonicalBefore,
      afterSha256: canonicalAfter,
      identical: canonicalBefore === canonicalAfter,
      representationChanged: representationBefore !== representationAfter
    };
    add('LANE.canonical-store-unchanged-by-canvas-ops', canonicalBefore === canonicalAfter, { before: canonicalBefore.slice(0, 400), after: canonicalAfter.slice(0, 400) });
    add('LANE.representation-store-did-change', representationBefore !== representationAfter, 'canvas ops must be visible locally');
    add('LANE.all-canvas-ops-non-canonical', ops.every(o => o.canonicalMutation === false), ops.map(o => o.canonicalMutation));
    add('LANE.adapter-reports-canonical-truth-unchanged', ops.filter(o => 'canonicalTruthUnchanged' in o).every(o => o.canonicalTruthUnchanged !== false), ops.map(o => o.canonicalTruthUnchanged));
  }
  return out;
});

await browser.close();

// Node-side hashing of the exact canonical payloads (sha256, not browser-side).
const checks = result.checks.map(c => ({ ...c, detail: typeof c.detail === 'object' ? c.detail : c.detail }));
const proof = {
  schema: 'W02-VISUALIZE_FALSIFICATION@1',
  classification: 'CANDIDATE_ONLY_FALSIFICATION__NOT_OWNER_ACCEPTANCE',
  command: 'node writer-output/W02-VISUALIZE/falsify.mjs',
  generatedAt: new Date().toISOString(),
  adapterFound: result.adapterFound,
  pageErrors,
  canonicalStoreHashProof: result.canonicalStoreHashProof ? {
    algorithm: 'sha256 over the exact JSON payload of {relations.records, relations.version, relations.readOnly, canonicalProjection, canonicalInvariantSnapshot}',
    before: { sha256: sha(result.canonicalStoreHashProof.beforeSha256), payloadBytes: result.canonicalStoreHashProof.beforeSha256.length },
    after: { sha256: sha(result.canonicalStoreHashProof.afterSha256), payloadBytes: result.canonicalStoreHashProof.afterSha256.length },
    identical: result.canonicalStoreHashProof.identical,
    representationProjectionChanged: result.canonicalStoreHashProof.representationChanged
  } : null,
  canvasOperations: result.canvasOperations || null,
  checks,
  summary: { total: checks.length, pass: checks.filter(c => c.status === 'PASS').length, fail: checks.filter(c => c.status === 'FAIL').length }
};
const file = path.join(HERE, 'FALSIFICATION_RECEIPT.json');
writeFileSync(file, JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify({ summary: proof.summary, pageErrors, canonical: proof.canonicalStoreHashProof, failed: checks.filter(c => c.status !== 'PASS') }, null, 1));
if (proof.summary.fail) process.exitCode = 1;
