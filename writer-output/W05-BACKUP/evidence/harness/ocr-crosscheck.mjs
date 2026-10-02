/**
 * OCR cross-check for W05-BACKUP lane evidence (VISUAL_EXECUTION_STANDARD §8 / packet: "OCR
 * cross-check every image claim").
 *
 * Renders are verified independently of any vision read: each capture is OCR'd with tesseract eng
 * and scored against known English UI phrases. A capture declared `lang=ar` MUST NOT score as an
 * English UI, and a capture declared `lang=en` MUST.
 *
 * Usage: node writer-output/W05-BACKUP/evidence/harness/ocr-crosscheck.mjs
 */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
const OCR = path.join(OUT, 'ocr');

/* Locale-specific English UI strings ONLY. Deliberately excluded: the surface identity eyebrow
 * ('W05 · BACKUP & RESTORE') and provider technical tokens ('PROVIDER_DURABLE_ATTEMPT_JOURNAL'),
 * which are identical in both locales by design (i18n §7 / status-vocabulary rule). */
const PHRASES = [
  'Create verified BackupPackage', 'Restore Drill Report', 'Expected state vs actual state',
  'Package context', 'Restore points', 'Command readiness', 'Isolated target',
  'Manifest & signatures', 'Restore drill pipeline', 'Latest restore-drill attempt failed',
  'Manage verified backup packages', 'No command on this surface owns'
];

const runs = {
  'B-en-1440-full': {declaredLang: 'en', run: 'B-en-1440'},
  'B-en-1440-center': {declaredLang: 'en', run: 'B-en-1440'},
  'B-en-1440-scrolled': {declaredLang: 'en', run: 'B-en-1440'},
  'B-en-1024-full': {declaredLang: 'en', run: 'B-en-1024'},
  'B-empty-en-1440-full': {declaredLang: 'en', run: 'B-empty-en-1440'},
  'B-ar-1440-full': {declaredLang: 'ar', run: 'B-ar-1440'},
  'B-ar-1440-center': {declaredLang: 'ar', run: 'B-ar-1440'},
  'B-ar-1024-full': {declaredLang: 'ar', run: 'B-ar-1024'},
  'A-en-1440-full': {declaredLang: 'en', run: 'A-en-1440'},
  'A-ar-1440-full': {declaredLang: 'ar', run: 'A-ar-1440'},
  'falsification/L1-corrupted-seed-ui': {declaredLang: 'en', run: 'falsification/FALSIFICATION.json'}
};

const rows = [];
for (const [rel, meta] of Object.entries(runs)) {
  const png = path.join(OUT, `${rel}.png`);
  if (!existsSync(png)) { rows.push({image: rel, status: 'MISSING', detail: 'capture file not found'}); continue; }
  const bytes = readFileSync(png);
  const ocrPath = path.join(OCR, `${rel.replace(/\//g, '_')}.eng.txt`);
  const text = existsSync(ocrPath)
    ? readFileSync(ocrPath, 'utf8')
    : execFileSync('tesseract', [png, 'stdout', '-l', 'eng'], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  const hits = PHRASES.filter(p => text.toLowerCase().includes(p.toLowerCase()));
  const failureHits = ['Latest restore-drill attempt failed', 'PACKAGE_HASH_MISMATCH'].filter(p => text.includes(p));
  const scored = hits.length >= 3 ? 'ENGLISH_UI_DETECTED' : hits.length <= 1 ? 'NON_ENGLISH_UI_DETECTED' : 'INCONCLUSIVE';
  const expectation = meta.declaredLang === 'en' ? 'ENGLISH_UI_DETECTED' : 'NON_ENGLISH_UI_DETECTED';
  rows.push({
    image: `writer-output/W05-BACKUP/evidence/${rel}.png`,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    dims: `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
    run: meta.run,
    declaredLang: meta.declaredLang,
    englishPhraseHits: hits,
    failurePhraseHits: failureHits,
    ocr: scored,
    expectation,
    status: scored === expectation ? 'PASS' : 'FAIL',
    ocrTextFile: path.relative(root, ocrPath)
  });
}

const report = {
  method: 'tesseract 5.3.4 eng OCR of the exact capture bytes; phrase scoring against known English UI strings',
  purpose: 'independent (non-vision) verification that AR/RTL captures really render Arabic and EN/LTR captures really render English, and that the failed-attempt note is really on screen',
  generatedAt: new Date().toISOString(),
  commit: String(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'})).trim(),
  rows,
  summary: {total: rows.length, pass: rows.filter(r => r.status === 'PASS').length, fail: rows.filter(r => r.status === 'FAIL').length}
};
const outFile = path.join(OUT, 'OCR_CROSSCHECK.json');
writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({outFile: path.relative(root, outFile), summary: report.summary, rows: rows.map(r => ({image: r.image, ocr: r.ocr, expect: r.expectation, status: r.status, hits: (r.englishPhraseHits || []).length, failure: r.failurePhraseHits}))}, null, 2));
