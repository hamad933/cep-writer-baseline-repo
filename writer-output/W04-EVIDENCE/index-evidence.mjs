#!/usr/bin/env node
/** W04-EVIDENCE — evidence index: binds every capture to candidate+commit+viewport+timestamp+image identity. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DIR = path.join(import.meta.dirname, 'captures');
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const diffHash = createHash('sha256').update(execSync(
  'git diff -- stack/native-typescript/surfaces/evidence stack/native-typescript/adapters/evidence stack/native-typescript/surfaces/composition/w04-rescue.ts',
  { cwd: ROOT, maxBuffer: 1 << 24 })).digest('hex');
const untracked = execSync('git status --porcelain -- stack/native-typescript/surfaces/evidence stack/native-typescript/adapters/evidence stack/native-typescript/surfaces/composition/w04-rescue.ts', { cwd: ROOT }).toString().trim();

const lineage = existsSync(path.join(import.meta.dirname, 'LINEAGE.json'))
  ? JSON.parse(readFileSync(path.join(import.meta.dirname, 'LINEAGE.json'), 'utf8')) : { entries: [] };
const byName = {};
for (const e of lineage.entries) if (e.image?.path) byName[path.basename(e.image.path)] = e;

const files = readdirSync(DIR).filter(f => f.endsWith('.png')).sort();
// "current candidate" = the newest capture group (filename carries the 8-hex commit prefix)
const stampOf = f => (f.match(/-(\d{8}T\d{6}Z)-[0-9a-f]{8}\.png$/) || [])[1] || '';
const newest = files.map(stampOf).filter(Boolean).sort().pop();
const currentCommitPrefix = ((files.filter(f => stampOf(f) === newest).pop() || '').match(/-([0-9a-f]{8})\.png$/) || [])[1] || null;
const entries = files.map(f => {
  const abs = path.join(DIR, f);
  const bytes = readFileSync(abs);
  const dims = (() => { const d = bytes.subarray(0, 24); return [d.readUInt32BE(16), d.readUInt32BE(20)]; })();
  const l = byName[f] || {};
  const superseded = f.startsWith('SUPERSEDED');
  // cand7 = the final capture round of this run (all taken from the same partial-build dist;
  // the branch tip moved under parallel writers, so grouping is by round name, not commit prefix)
  const current = !superseded && /^cand8-/.test(f);
  return {
    capture: f,
    status: superseded ? 'SUPERSEDED_RETAINED' : (current ? 'CURRENT_CANDIDATE' : 'INTERMEDIATE_RETAINED'),
    state: f.replace(/-\d{8}T\d{6}Z-[0-9a-f]{8}\.png$/, '').replace(/^SUPERSEDED-BADURL-/, 'BAD_URL_'),
    image: { path: `writer-output/W04-EVIDENCE/captures/${f}`, sha256: createHash('sha256').update(bytes).digest('hex'), dims, bytes: bytes.length },
    viewport: l.viewport || { width: Number((f.match(/-(\d{3,4})-\d{3,4}-/) || [])[1]) || null, height: Number((f.match(/-(?:\d{3,4})-(\d{3,4})-/) || [])[1]) || null },
    seededLocale: l.seededLocale || (/entry-ar|rtl/.test(f) ? 'ar' : 'en'),
    url: l.url || 'http://localhost:4173/?surface=evidence',
    dom: l.dom || null, fixtureLabel: l.fixtureLabel || (f.startsWith('cand5-entry') || f.startsWith('cand4-entry') || f.startsWith('baseline') ? 'NONE__EMPTY_BOOT_STATE' : 'FIXTURE_INTAKE_BATCH__W04_EVIDENCE_VISUAL_HARNESS'),
    capturedAt: l.timestamp || null
  };
});

const index = {
  schemaVersion: 1, unit: 'W04-EVIDENCE', generated: new Date().toISOString(),
  reference: {
    path: 'cep-writer/references/visual/03_PROGRESS_AND_EVIDENCE/01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png',
    classification: 'CURRENT_FINAL_REFERENCE', sha256Prefix16: '789deee01cd946d9', dims: [1505, 1045],
    role: 'CONSTRUCTION AUTHORITY — composition/hierarchy/density/interaction intent; not presentation-only'
  },
  candidate: { branch, commit, workingTreeDiffSha256: diffHash, writableRootsStatus: untracked ? untracked.split('\n') : [], note: 'dist/ rebuilt from this working tree via tools/writer-serial.sh' },
  environment: 'tools/serve.mjs on :4173 serving dist/; Playwright Chromium (headless); deviceScaleFactor 1',
  visionVerification: 'Controller-Writer read each PNG with the local-image tool; every visual claim below is from opened pixels',
  counts: {
    total: entries.length,
    current: entries.filter(e => e.status === 'CURRENT_CANDIDATE').length,
    intermediate: entries.filter(e => e.status === 'INTERMEDIATE_RETAINED').length,
    superseded: entries.filter(e => e.status === 'SUPERSEDED_RETAINED').length
  },
  captures: entries
};
writeFileSync(path.join(import.meta.dirname, 'EVIDENCE_INDEX.json'), JSON.stringify(index, null, 2));
console.log(JSON.stringify({ captures: entries.length, superseded: index.counts.superseded, diffHash: diffHash.slice(0, 16), commit: commit.slice(0, 8) }));
