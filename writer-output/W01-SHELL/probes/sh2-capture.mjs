import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'writer-output/W01-SHELL/evidence/sh2-capture';
const TAG = process.argv[3] || 'after';
const SURFACES = (process.env.SH2_SURFACES || 'evidence,shell').split(',');
const PORT = Number(process.env.SH2_CAP_PORT || 43177);
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWS = [{ id: '1440x1000', width: 1440, height: 1000 }, { id: '1024x900', width: 1024, height: 900 }];
const LOCALES = ['ar', 'en'];

const srv = spawn(process.execPath, ['tools/serve.mjs', '--port', String(PORT)], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((res) => srv.stdout.on('data', (b) => String(b).includes('ready') && res()));
const browser = await chromium.launch();
const images = [];
try {
  for (const locale of LOCALES) {
    for (const vp of VIEWS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      await ctx.addInitScript(`try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'${locale}'}}}))}catch(e){}`);
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(String(e && e.message || e)));
      for (const surface of SURFACES) {
        await page.goto(`${BASE}/index.html?surface=${surface}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForFunction(() => Boolean(window.CEPFoundation) && Boolean(document.getElementById('foundationStage')), { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(700);
        const file = `${surface}-${vp.id}-${locale}-${TAG}.png`;
        const bytes = await page.screenshot({ type: 'png' });
        const dims = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, dir: document.documentElement.dir, lang: document.documentElement.lang }));
        await mkdir(path.join(OUT), { recursive: true });
        await writeFile(path.join(OUT, file), bytes);
        images.push({
          file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
          viewport: vp.id, locale, dir: dims.dir, lang: dims.lang, surface, pageErrors: [...pageErrors]
        });
      }
      await ctx.close();
    }
  }
} finally { await browser.close(); srv.kill('SIGTERM'); }
const manifest = { tag: TAG, node: process.version, transport: 'localhost-http', port: PORT, images };
await writeFile(path.join(OUT, `manifest-${TAG}.json`), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 1));
