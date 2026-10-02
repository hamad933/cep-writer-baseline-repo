import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const PORT = 43175, BASE = `http://127.0.0.1:${PORT}`;
const srv = spawn(process.execPath, ['tools/serve.mjs', '--port', String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((res) => srv.stdout.on('data', (b) => String(b).includes('ready') && res()));
const b = await chromium.launch();
try {
  for (const surface of ['evidence', 'shell', 'library', 'runs']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(`try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'en'}}}))}catch(e){}`);
    const p = await ctx.newPage();
    await p.goto(`${BASE}/index.html?surface=${surface}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => Boolean(window.CEPFoundation) && Boolean(document.getElementById('foundationStage')), { timeout: 15000 });
    await p.waitForTimeout(600);
    const out = await p.evaluate(() => {
      const stage = document.getElementById('foundationStage');
      const heads = [...document.querySelectorAll('.foundation-stage h1,.foundation-stage h2,#centerPane h1,#centerPane h2')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const h = heads[0] || null;
      const chain = [];
      let e = h;
      while (e && e !== document.body) {
        const cs = getComputedStyle(e);
        chain.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ').slice(0, 3).join('.')}[pos=${cs.position},padTop=${cs.paddingTop},top=${Math.round(e.getBoundingClientRect().y)}]`);
        e = e.parentElement;
      }
      const st = stage ? getComputedStyle(stage) : null;
      const centre = document.getElementById('centerPane');
      return {
        stage: st ? { padTop: st.paddingTop, pos: st.position, box: st.boxSizing, h: Math.round(stage.getBoundingClientRect().y) } : null,
        centreChildren: centre ? [...centre.children].map((c) => `${c.tagName.toLowerCase()}${c.id ? '#' + c.id : ''}.${String(c.className).split(' ').slice(0, 2).join('.')}[pos=${getComputedStyle(c).position},y=${Math.round(c.getBoundingClientRect().y)},h=${Math.round(c.getBoundingClientRect().height)}]`) : [],
        headingChain: chain
      };
    });
    console.log('===', surface, JSON.stringify(out, null, 1));
    await ctx.close();
  }
} finally { await b.close(); srv.kill('SIGTERM'); }
