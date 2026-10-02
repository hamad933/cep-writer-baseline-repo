/**
 * W02-LIBRARY fixture-state evidence (unit-local tool).
 * Emits the exact normalisation state of a Library fixture module so DEF-04 / DEF-07 can be
 * compared BEFORE (HEAD blob) and AFTER (current dist) without touching product source.
 *
 *   node --experimental-strip-types writer-output/W02-LIBRARY/fixture-state.mjs <module> <label>
 *
 * <module> may be a .ts file (HEAD extraction) or a .js file (current dist build).
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [, , moduleArg, label = 'fixture-state'] = process.argv;
if (!moduleArg) throw Error('usage: fixture-state.mjs <module> <label>');
const abs = path.resolve(root, moduleArg);
const { FIXTURES } = await import(pathToFileURL(abs).href);

const LIST_LINE = /^-\s+\S/;
const TABLE_ROW = /^\s*\|/;
const TABLE_SEP = /\|\s*-{2,}/;
const hasBoldStar = text => /\*\*[^*]+:?\*\*/.test(text);

const docs = [];
for (const [id, doc] of Object.entries(FIXTURES)) {
  const rawList = [];
  const rawTable = [];
  const boldText = [];
  const walk = block => {
    if (block?.type === 'paragraph' && typeof block.html === 'string' && String(block.id || '').startsWith('src-')) {
      const lines = block.html.split(/<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);
      if (lines.length && lines.every(l => LIST_LINE.test(l))) rawList.push(block.id);
      if (lines.length >= 2 && lines.every(l => TABLE_ROW.test(l)) && lines.some(l => TABLE_SEP.test(l))) rawTable.push(block.id);
      if (hasBoldStar(block.html)) boldText.push(block.id);
    }
    if (block?.type === 'bullet' && hasBoldStar(String(block.html || ''))) boldText.push(block.id);
    (block?.children || []).forEach(walk);
  };
  (doc.blocks || []).forEach(walk);
  docs.push({
    id,
    relations: (doc.relations || []).map(r => `${r.kind || 'UNSPECIFIED'}|${r.target || ''}`),
    rawListParagraphs: rawList,
    rawTableParagraphs: rawTable,
    boldMarkupBlocks: boldText,
    labs: Array.isArray(doc.labs) ? doc.labs.length : null,
    projects: Array.isArray(doc.projects) ? doc.projects.length : null,
    evidence: Array.isArray(doc.evidence) ? doc.evidence.length : null,
    sources: Array.isArray(doc.sources) ? doc.sources.length : null
  });
}

const git = args => { try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); } catch { return ''; } };
const bytes = readFileSync(abs);
const summary = {
  label,
  module: moduleArg,
  moduleSha256: createHash('sha256').update(bytes).digest('hex'),
  moduleBytes: bytes.length,
  head: git(['rev-parse', 'HEAD']),
  headTree: git(['rev-parse', 'HEAD^{tree}']),
  headFixtureBlob: git(['rev-parse', 'HEAD:stack/native-typescript/adapters/library-fixtures.ts']),
  generatedAt: new Date().toISOString(),
  totals: {
    docs: docs.length,
    rawListParagraphs: docs.reduce((n, d) => n + d.rawListParagraphs.length, 0),
    rawTableParagraphs: docs.reduce((n, d) => n + d.rawTableParagraphs.length, 0),
    boldMarkupBlocks: docs.reduce((n, d) => n + d.boldMarkupBlocks.length, 0),
    relations: docs.reduce((n, d) => n + d.relations.length, 0),
    relationsDocs: docs.filter(d => d.relations.length > 0).length
  },
  docs
};
const out = path.join(root, 'writer-output/W02-LIBRARY/evidence', `${label}.json`);
await writeFile(out, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ out, totals: summary.totals }, null, 1));
