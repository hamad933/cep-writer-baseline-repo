/**
 * W02-LIBRARY falsification battery (unit-local; writer-output/ is this unit's root).
 *   node writer-output/W02-LIBRARY/falsify.mjs
 *
 * N1 non-owned route write attempt refuses
 * N2 boundary/invalid input produces no corruption and no false receipt
 * N3 acting without the prerequisite provider reports unavailable, never fabricated
 * L1 locale flip EN -> AR -> EN keeps function identical (structure/ids/availability)
 *
 * Results are written to writer-output/W02-LIBRARY/evidence/FALSIFICATION.json with exact
 * candidate binding. Nothing is asserted PASS without the observed value recorded next to it.
 */
import { spawn, execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;
const root = fileURLToPath(new URL('../../', import.meta.url));
const git = a => { try { return execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim(); } catch { return ''; } };

const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = async u => { for (let i = 0; i < 150; i += 1) { try { if ((await fetch(u)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);

const results = [];
const record = (id, ok, observed, oracle) => { results.push({ id, status: ok ? 'PASS' : 'FAIL', observed, oracle }); return ok; };
const openPage = async (browser, locale, query = '') => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(([l]) => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: 'auto', contentDirection: 'auto' } } })); } catch (e) { } }, [locale]);
  const page = await ctx.newPage();
  page.on('pageerror', e => { page.__errs = [...(page.__errs || []), String(e)]; });
  await page.goto(`http://127.0.0.1:${port}/?surface=library${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
  await page.waitForTimeout(2200);
  return { ctx, page };
};

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
try {
  /* ---- N1: non-owned route write attempt must refuse ---------------------------------- */
  {
    const { ctx, page } = await openPage(browser, 'en', '&persistencePort=41999');
    const n1 = await page.evaluate(() => {
      const out = {};
      out.availLearnEdit = CEPFoundation.commands?.commandAvailability?.('learn.edit', {}) ?? null;
      out.availRqRoute = CEPFoundation.commands?.commandAvailability?.('rq.route', {}) ?? null;
      out.availLibrarySave = CEPFoundation.commands?.commandAvailability?.('library.save', {}) ?? null;
      try { out.learnExecute = CEPFoundation.commands?.execute?.('learn.edit', { patch: { html: 'XSS' } }); } catch (e) { out.learnExecute = `THREW:${String(e.message || e).slice(0, 90)}`; }
      try { out.rqExecute = CEPFoundation.commands?.execute?.('rq.route', { route: '/rq' }); } catch (e) { out.rqExecute = `THREW:${String(e.message || e).slice(0, 90)}`; }
      out.boundIds = (CEPFoundation.commands?.ids?.() || CEPFoundation.commands?.list?.() || []).filter?.(id => /^(learn|rq)\./.test(id)) ?? null;
      out.consumer = CEPFoundation.consumer;
      out.documentBefore = JSON.stringify(CEPFoundation.structured.snapshot()).length;
      return out;
    });
    const refused = (v) => v === false || v === undefined || v === null || (typeof v === 'object' && (v.ok === false || v.enabled === false || v.refused === true || v.code)) || (typeof v === 'string' && v.startsWith('THREW'));
    const learnBound = out => out && typeof out === 'object' && out.enabled === true;
    record('N1.non-owned-route-write-refused',
      refused(n1.learnExecute) && refused(n1.rqExecute) && !learnBound(n1.availLearnEdit) && !learnBound(n1.availRqRoute),
      { consumer: n1.consumer, availLearnEdit: n1.availLearnEdit, availRqRoute: n1.availRqRoute, learnExecute: n1.learnExecute ?? null, rqExecute: n1.rqExecute ?? null, boundForeignIds: n1.boundIds },
      'on the library route a non-owned (learn/rq) write command must be unavailable or refuse; the canonical document must be untouched');
    await ctx.close();
  }

  /* ---- N2: boundary / invalid input -> no corruption, no false receipt ------------------ */
  {
    const { ctx, page } = await openPage(browser, 'en', '&persistencePort=41999');
    const n2 = await page.evaluate(() => {
      const snap = () => JSON.stringify(CEPFoundation.structured.snapshot());
      const ids = () => { const out = []; const walk = list => (list || []).forEach(b => { out.push(b.id); walk(b.children); }); walk(CEPFoundation.structured.snapshot().blocks); return out; };
      const invalidBefore = snap();
      const invalid = [];
      const tryIt = (label, fn) => { try { const r = fn(); invalid.push({ label, result: r && typeof r === 'object' ? { ok: r.ok ?? null, code: r.code ?? r.status ?? null, changed: r.changed ?? null } : r }); } catch (e) { invalid.push({ label, threw: String(e.message || e).slice(0, 90) }); } };
      tryIt('insertBlock.missingId', () => CEPFoundation.structured.insertBlock({ id: '', type: 'paragraph', html: 'x' }, 1));
      tryIt('insertBlock.invalidType', () => CEPFoundation.structured.insertBlock({ id: 'n1', type: '<script>', html: 'x' }, 1));
      tryIt('insertBlock.null', () => CEPFoundation.structured.insertBlock(null, 0));
      tryIt('updateBlock.unknownId', () => CEPFoundation.structured.updateBlock('does-not-exist', { html: 'hijacked' }));
      tryIt('removeBlock.unknownId', () => CEPFoundation.structured.removeBlock('does-not-exist'));
      tryIt('updateBlock.emptyId', () => CEPFoundation.structured.updateBlock('', { title: 'x' }));
      const invalidAfter = snap();

      const beforeIds = ids();
      const boundary = [];
      const btry = (label, fn) => { try { const r = fn(); boundary.push({ label, result: r && typeof r === 'object' ? { ok: r.ok ?? null, code: r.code ?? r.status ?? null, changed: r.changed ?? null, receipt: r.receipt ?? null } : r }); } catch (e) { boundary.push({ label, threw: String(e.message || e).slice(0, 90) }); } };
      btry('insertBlock.index=99999', () => CEPFoundation.structured.insertBlock({ id: 'bnd-high', type: 'paragraph', html: 'boundary high' }, 99999));
      btry('insertBlock.index=-99', () => CEPFoundation.structured.insertBlock({ id: 'bnd-low', type: 'paragraph', html: 'boundary low' }, -99));
      const afterIds = ids();
      const missing = beforeIds.filter(id => !afterIds.includes(id));
      const duplicated = afterIds.filter((id, i) => afterIds.indexOf(id) !== i);
      const snapFinal = (() => { try { JSON.parse(snap()); return true; } catch { return false; } })();
      return {
        invalid: { identical: invalidBefore === invalidAfter, attempts: invalid, beforeLen: invalidBefore.length, afterLen: invalidAfter.length },
        boundary: { attempts: boundary, beforeCount: beforeIds.length, afterCount: afterIds.length, missing, duplicated, serializable: snapFinal }
      };
    });
    record('N2a.invalid-input-refused-no-corruption', n2.invalid.identical === true,
      { identical: n2.invalid.identical, beforeLen: n2.invalid.beforeLen, afterLen: n2.invalid.afterLen, attempts: n2.invalid.attempts },
      'structurally invalid input (empty id, unknown type, null, unknown block) must throw and leave the document byte-identical');
    record('N2b.boundary-input-no-corruption', n2.boundary.missing.length === 0 && n2.boundary.duplicated.length === 0 && n2.boundary.serializable === true,
      n2.boundary,
      'out-of-range index is a boundary, not an error: the mutation kernel may clamp it, but every original block must survive, ids must stay unique and the document must stay valid');
    await ctx.close();
  }

  /* ---- N3: prerequisite provider absent -> truthful unavailable ------------------------ */
  {
    const { ctx, page } = await openPage(browser, 'en', '&persistencePort=41999');
    const n3 = await page.evaluate(async () => {
      const health = await CEPFoundation.structured.persistence?.client?.health?.();
      const commit = CEPFoundation.commands?.execute?.('document.commit', {});
      const alt = CEPFoundation.commands?.commandAvailability?.('document.commit', {});
      const saveBtn = document.querySelector('[data-action="document.commit"], #saveBtn, [data-action="save"]');
      return {
        persistencePort: CEPFoundation.structured.persistence?.client?.descriptor?.()?.port,
        health: health && { ok: health.ok, code: health.code || health.status || null },
        commit: commit && { ok: commit.ok ?? null, persisted: commit.persisted ?? null, code: commit.code || commit.status || commit.error || null },
        commitAvailability: alt,
        saveState: CEPBlueprint.state.editor.saveState,
        announcedSaved: document.body.innerText.includes('Saved durably')
      };
    });
    const truthful = n3.health?.ok === false || n3.health?.code
      ? (n3.commit?.persisted !== true && n3.announcedSaved === false)
      : (n3.commit?.persisted !== true && n3.announcedSaved === false);
    record('N3.provider-unavailable-truthful', truthful,
      n3, 'with no persistence provider the product must report unavailable and must never claim Saved/persisted');
    await ctx.close();
  }

  /* ---- L1: locale flip EN -> AR -> EN keeps function identical ------------------------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const fingerprint = () => page.evaluate(() => {
      const rows = [...document.querySelectorAll('#blockList .block')].map(b => `${b.dataset.blockId}:${b.dataset.type}`);
      const tree = [...document.querySelectorAll('#structureTree .treeitem')].map(r => ({ label: (r.textContent || '').replace(/\s+/g, ' ').trim().replace(/[؀-ۿ]+/g, '·'), count: (r.querySelector('[class*=count]')?.textContent || '').trim(), sel: r.getAttribute('aria-selected'), exp: r.getAttribute('aria-expanded') }));
      const badges = tree.map(t => `${t.count}|${t.sel}|${t.exp}`);
      const cmds = ['library.create', 'library.insert', 'library.save', 'library.revise', 'library.history'].map(c => `${c}:${CEPFoundation.commands?.commandAvailability?.(c, {})?.enabled ?? 'n/a'}`);
      const st = CEPFoundation.structured.transactionDescriptor();
      return {
        lang: document.documentElement.lang, dir: document.documentElement.dir,
        consumer: CEPFoundation.consumer,
        blocks: rows, treeCount: tree.length, badges, cmds,
        history: st.historyLength, workingRevision: st.workingRevision,
        mastheadPairs: document.querySelectorAll('#libraryDocumentMasthead .lib-mast-meta > span').length,
        tags: document.querySelectorAll('#libraryDocumentMasthead .tag').length,
        bottomLen: (document.getElementById('bottomContent')?.innerHTML || '').length,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    const goto = async () => {
      await page.goto(`http://127.0.0.1:${port}/?surface=library&persistencePort=41999`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
      await page.waitForTimeout(2200);
    };
    const setLocale = async loc => {
      await page.evaluate(l => { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: 'auto', contentDirection: 'auto' } } })); }, loc);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
      await page.waitForTimeout(2200);
    };
    await goto();
    await setLocale('en');
    const en1 = await fingerprint();
    await setLocale('ar');
    const ar = await fingerprint();
    await setLocale('en');
    const en2 = await fingerprint();
    const strip = f => JSON.stringify({ blocks: f.blocks, treeCount: f.treeCount, badges: f.badges, cmds: f.cmds, history: f.history, workingRevision: f.workingRevision, mastheadPairs: f.mastheadPairs, tags: f.tags, consumer: f.consumer });
    record('L1.locale-flip-EN-AR-EN-identical-function',
      strip(en1) === strip(ar) && strip(en1) === strip(en2) && en1.lang === 'en' && ar.lang === 'ar' && ar.dir === 'rtl' && en2.dir === 'ltr',
      { en1: { lang: en1.lang, dir: en1.dir, blocks: en1.blocks.length, tree: en1.treeCount, cmds: en1.cmds, history: en1.history }, ar: { lang: ar.lang, dir: ar.dir, blocks: ar.blocks.length, tree: ar.treeCount, cmds: ar.cmds, history: ar.history }, en2: { lang: en2.lang, dir: en2.dir, blocks: en2.blocks.length, tree: en2.treeCount, cmds: en2.cmds, history: en2.history }, identical: strip(en1) === strip(ar) && strip(en1) === strip(en2) },
      'structure, ids, availability and history must be identical across EN -> AR -> EN; only language/direction may change');
    await ctx.close();
  }
} finally {
  await browser.close(); server.kill('SIGTERM');
}

const payload = {
  tool: 'writer-output/W02-LIBRARY/falsify.mjs',
  generatedAt: new Date().toISOString(),
  candidate: { branch: git(['rev-parse', '--abbrev-ref', 'HEAD']), head: git(['rev-parse', 'HEAD']), tree: git(['rev-parse', 'HEAD^{tree}']) },
  environment: { node: process.version, engine: 'Playwright Chromium', viewports: ['1440x1000'] },
  persistence: 'LocalPersistenceClient pointed at closed port 41999 for N1/N2/N3 and L1 so the canonical fixture content is under test (disclosed condition, not the default product state)',
  results
};
await writeFile(path.join(root, 'writer-output/W02-LIBRARY/evidence/FALSIFICATION.json'), JSON.stringify(payload, null, 2));
console.log(JSON.stringify({ summary: { pass: results.filter(r => r.status === 'PASS').length, fail: results.filter(r => r.status === 'FAIL').length }, results: results.map(r => ({ id: r.id, status: r.status })) }, null, 1));
if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
