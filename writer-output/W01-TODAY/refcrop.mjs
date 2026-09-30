import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SRC = process.argv[2];
const OUT = process.argv[3];
const regions = JSON.parse(process.argv[4]);
const data = (await readFile(resolve(SRC))).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 3400, height: 2400 } });
await page.setContent(`<!doctype html><html><body style="margin:0"><img id="i" src="data:image/png;base64,${data}" style="display:block;transform-origin:top left"></body></html>`);
await page.waitForSelector('#i');
await page.evaluate(() => document.querySelector('#i').decode());
for (const r of regions) {
  const s = r.scale || 1;
  await page.evaluate(scale => { const i = document.querySelector('#i'); i.style.transform = `scale(${scale})`; }, s);
  await page.screenshot({ path: `${OUT}/${r.name}.png`, clip: { x: r.x * s, y: r.y * s, width: r.w * s, height: r.h * s } });
}
await browser.close();
console.log('ok');
