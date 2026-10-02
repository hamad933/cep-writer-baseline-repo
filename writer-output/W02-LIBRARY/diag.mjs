/**
 * W02-LIBRARY defect-set diagnostic (unit-local evidence tool; writer-output/ is this unit's root).
 * Usage: node writer-output/W02-LIBRARY/diag.mjs [--locale=en|ar] [--w=1440] [--h=1000] [--out=name]
 * Reports WM-001 defect state at the exact current build:
 *   DEF-01 tree rows/expansion · DEF-02 badge counts · DEF-03 masthead hierarchy
 *   DEF-04 raw-markdown paragraphs · DEF-05 bottom shelf payload · DEF-06 Arabic-only chrome under EN
 *   DEF-07 zero stat tiles · DEF-08 clipped labels · DEF-09 left pane identity
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const h = args.find(a => a.startsWith(`--${n}=`)); return h ? h.slice(n.length + 3) : d; };
const locale = opt('locale', 'en');
const width = Number(opt('w', 1440));
const height = Number(opt('h', 1000));
const label = opt('out', `diag-${locale}`);
const persist = opt('persist', 'on');
const persistPort = persist === 'off' ? opt('port', '41999') : null;

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = async u => { for (let i = 0; i < 150; i += 1) { try { if ((await fetch(u)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const errors = [];
let payload;
try {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await ctx.addInitScript(([loc]) => {
    try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: loc, chromeDirection: 'auto', contentDirection: 'auto' } } })); } catch (e) { }
  }, [locale]);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console:${m.text()}`); });
  await page.goto(`http://127.0.0.1:${port}/?surface=library${persistPort ? `&persistencePort=${persistPort}` : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
  await page.waitForTimeout(2500);

  const pre = await page.evaluate(() => {
    const AR = /[؀-ۿ]/;
    const chromeish = el => {
      const s = el.tagName.toLowerCase();
      return !['script', 'style', 'code', 'pre'].includes(s);
    };
    const arabicLeaves = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const value = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!value || !AR.test(value)) continue;
      const el = node.parentElement;
      if (!el || !chromeish(el)) continue;
      const owner = el.closest('[data-presentation-owner],[data-component]');
      let path = '';
      let cur = el;
      for (let i = 0; cur && i < 4; i += 1, cur = cur.parentElement) {
        path = `${cur.tagName.toLowerCase()}${cur.id ? `#${cur.id}` : ''}${cur.className && typeof cur.className === 'string' ? `.${cur.className.trim().split(/\s+/).slice(0, 2).join('.')}` : ''}>${path}`;
      }
      arabicLeaves.push({
        text: value.slice(0, 80),
        path: path.slice(0, 160),
        owner: owner ? (owner.getAttribute('data-presentation-owner') || owner.getAttribute('data-component')) : null,
        consumer: document.body.dataset.consumer || document.documentElement.dataset.consumer || null
      });
    }
    const rows = [...document.querySelectorAll('#structureTree .treeitem')];
    const badges = rows.map(r => ({ label: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60), count: (r.querySelector('.treecount, .count, [class*=count]')?.textContent || '').trim() }));
    const stats = [...document.querySelectorAll('#inspectorContent .stat, #inspectorContent [class*=stat]')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40));
    /* raw-markdown detector: only the FIRST LINE of a block decides, so a code block whose
       body legitimately IS markdown source ("# heading", …) is never flagged, and a toggle
       parent is never flagged just because its children contain markup. */
    const rawMarkdown = [...document.querySelectorAll('#blockList .block')]
      .map(b => {
        const full = String(b.innerText || b.textContent || '');
        const firstLine = (full.split('\n')[0] || '').trim();
        const isCode = b.dataset.type === 'code';
        const flagged = !isCode && (/^[-|]\s/.test(firstLine) || /^\*\*[^*]+:\*\*/.test(firstLine));
        return { id: b.dataset.blockId || '', type: b.dataset.type || '', firstLine: firstLine.slice(0, 160), flagged, isCode };
      })
      .filter(b => b.flagged);
    const clipped = [];
    for (const e of document.querySelectorAll('button, .tab, .treeitem, .active-path, h2, h3, .tag, [role=tab]')) {
      if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) clipped.push({ text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50), cls: String(e.className).slice(0, 60), sw: e.scrollWidth, cw: e.clientWidth });
    }
    const bottom = document.getElementById('bottomContent');
    return {
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      consumer: window.CEPFoundation?.consumer,
      tree: { rows: rows.length, selected: rows.filter(r => r.getAttribute('aria-selected') === 'true').length, expanded: rows.filter(r => r.getAttribute('aria-expanded') === 'true').length, badges },
      masthead: Boolean(document.getElementById('libraryDocumentMasthead')) && document.getElementById('libraryDocumentMasthead').children.length > 0,
      mastheadHTML: (document.getElementById('libraryDocumentMasthead')?.innerHTML || '').slice(0, 400),
      centerOrder: [...document.querySelectorAll('#editorDocument > *, #contentGroups, #blockList')].slice(0, 8).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className ? '.' + String(e.className).split(/\s+/)[0] : ''}`),
      contentGroupIndex: (() => { const cg = document.getElementById('contentGroups'); const bl = document.getElementById('blockList'); const mh = document.getElementById('libraryDocumentMasthead'); return { masthead: mh ? 1 : 0, contentGroups: cg ? 1 : 0, blockList: bl ? 1 : 0 }; })(),
      rawMarkdown,
      bottom: { present: Boolean(bottom), htmlLength: (bottom?.innerHTML || '').length, text: (bottom?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), state: document.getElementById('bottomShelf')?.dataset.state || null },
      stats,
      statGrid: (() => {
        const g = document.querySelector('#inspectorContent .context-mini-grid');
        if (!g) return null;
        return { cls: g.className, cells: [...g.querySelectorAll(':scope > span')].map(c => (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)) };
      })(),
      clipped: clipped.slice(0, 25),
      blockKinds: [...document.querySelectorAll('#blockList .block')].map(b => ({ id: b.dataset.blockId || '', cls: String(b.className).slice(0, 50) })).slice(0, 30),
      leftHeading: (document.querySelector('#leftPane .phead h2')?.textContent || '').trim(),
      docChrome: {
        docmeta: (document.querySelector('#centerPane .docmeta')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
        docintro: (document.querySelector('#centerPane .docintro')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
        firstBlockId: document.querySelector('#blockList .block')?.getAttribute('data-block-id') || null
      },
      arabicLeafCount: arabicLeaves.length,
      arabicLeaves: arabicLeaves.slice(0, 60)
    };
  });

  // DEF-05: open the deep-work shelf and re-read it
  const afterToggle = await page.evaluate(() => {
    document.getElementById('bottomToggle')?.click();
    return new Promise(resolve => setTimeout(() => {
      const b = document.getElementById('bottomContent');
      resolve({ state: document.getElementById('bottomShelf')?.dataset.state || null, htmlLength: (b?.innerHTML || '').length, text: (b?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160), hidden: b?.hidden ?? null });
    }, 900));
  });

  // DEF-04b: expand every document section (twice, so a mix of open/closed sections is fully
  // revealed in one probe), then re-scan for raw markdown in the newly revealed content
  const expandedScan = await page.evaluate(() => {
    const click = () => {
      const rows = [...document.querySelectorAll('#blockList .block.toggle-block .toggle-trigger')];
      rows.forEach(r => { try { r.click(); } catch (e) { } });
      return rows.length;
    };
    const scan = () => [...document.querySelectorAll('#blockList .block')].map(b => {
      const firstLine = (String(b.innerText || b.textContent || '').split('\n')[0] || '').trim();
      const isCode = b.dataset.type === 'code';
      return { id: b.dataset.blockId || '', type: b.dataset.type || '', firstLine: firstLine.slice(0, 120), flagged: !isCode && (/^[-|]\s/.test(firstLine) || /^\*\*[^*]+:\*\*/.test(firstLine)) };
    }).filter(x => x.flagged);
    const first = click();
    return new Promise(resolve => setTimeout(() => {
      const pass1 = scan();
      const openAfterPass1 = [...document.querySelectorAll('#blockList .block.toggle-block')].filter(t => t.getAttribute('data-open') === 'true').length;
      const blocksPass1 = document.querySelectorAll('#blockList .block').length;
      const second = click();
      setTimeout(() => {
        const pass2 = scan();
        const seen = new Map();
        for (const row of [...pass1, ...pass2]) if (!seen.has(row.id)) seen.set(row.id, row);
        const revealed = [...document.querySelectorAll('#blockList .block')].map(b => ({ id: b.dataset.blockId || '', type: b.dataset.type || '', firstLine: (String(b.innerText || '').split('\n')[0] || '').trim().slice(0, 90) }));
        resolve({ clicked: first + second, blocksPass1, openAfterPass1, blocksFinal: document.querySelectorAll('#blockList .block').length, revealedTable: revealed.filter(r => r.id.includes('-06-p')), rawAfterExpand: [...seen.values()] });
      }, 900);
    }, 900));
  });

  payload = { label, locale, viewport: `${width}x${height}`, capturedAt: new Date().toISOString(), persistence: persistPort ? `UNAVAILABLE_BY_CAPTURE_FLAG__port=${persistPort}` : 'DEFAULT_LOCAL_RUNTIME__4174', errors, pre, afterBottomToggle: afterToggle, expandedScan };
  await ctx.close();
} finally {
  await browser.close(); server.kill('SIGTERM');
}

const dir = path.join(root, 'writer-output/W02-LIBRARY/evidence');
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, `${label}.json`), JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
