import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const PORT = 43176, BASE = `http://127.0.0.1:${PORT}`;
const srv = spawn(process.execPath, ['tools/serve.mjs', '--port', String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((res) => srv.stdout.on('data', (b) => String(b).includes('ready') && res()));
const b = await chromium.launch();
try {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(`try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'en'}}}))}catch(e){}`);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/index.html?surface=evidence`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => Boolean(window.CEPFoundation) && Boolean(document.getElementById('foundationStage')), { timeout: 20000 });
  await p.waitForTimeout(600);
  const out = await p.evaluate(() => {
    const stage = document.getElementById('foundationStage');
    const matches = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules) {
        if (!r.selectorText) continue;
        try {
          if (stage.matches(r.selectorText) && /padding/.test(r.cssText)) {
            matches.push({ sel: r.selectorText.slice(0, 140), css: r.style.cssText.slice(0, 140), href: ((sheet.href || 'inline') + '').split('/').pop() });
          }
        } catch {}
      }
    }
    return {
      stageStyleAttr: stage.getAttribute('style'),
      computedPadTop: getComputedStyle(stage).paddingTop,
      parent: `${stage.parentElement.tagName}#${stage.parentElement.id}.${stage.parentElement.className}`,
      sheets: [...document.styleSheets].map((s) => (s.href || ('inline:' + (s.ownerNode && s.ownerNode.id))) + ''),
      matchingRules: matches
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await ctx.close();
} finally { await b.close(); srv.kill('SIGTERM'); }
