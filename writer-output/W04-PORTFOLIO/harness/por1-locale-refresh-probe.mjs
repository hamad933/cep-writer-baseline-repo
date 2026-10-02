import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
const require = createRequire('/workspaces/cep-lanes/POR-1/package.json');
const { chromium } = require('playwright');
const root = '/workspaces/cep-lanes/POR-1/';
const freePort = await new Promise(r => { const s = net.createServer(); s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));}); });
const server = spawn(process.execPath, [path.join(root,'tools/serve.mjs'),'--port',String(freePort)], { cwd: root, stdio:['ignore','pipe','pipe'] });
for (let i=0;i<120;i++){try{if((await fetch(`http://127.0.0.1:${freePort}/`)).ok)break}catch{};await new Promise(r=>setTimeout(r,100));}
const b = await chromium.launch({headless:true});
const page = await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await page.goto(`http://127.0.0.1:${freePort}/?surface=portfolio`,{waitUntil:'load'});
await page.waitForFunction(()=>window.CEPFoundation?.consumer==='portfolio',null,{timeout:20000});
await page.waitForTimeout(600);
const read = () => page.evaluate(() => ({lang:document.documentElement.lang, title:(document.querySelector('#foundationStage .w04-rec-title')||{}).textContent||null, panel:!!document.querySelector('[data-settings-center-owner="SettingsCenterOwner"]')}));
const before = await read();
await page.evaluate(()=>{document.querySelector('[data-w04-settings]').click();});
await page.waitForTimeout(600);
await page.evaluate(()=>{[...document.querySelectorAll('[data-settings-preference="locale"]')].find(b=>b.getAttribute('data-settings-value')==='ar').click();});
await page.waitForTimeout(700);
const afterClick = await read();
// close the panel the way the product does (Escape) WITHOUT any explicit surface render
await page.keyboard.press('Escape');
await page.waitForTimeout(900);
const afterClose = await read();
// then a navigation-free wait longer
await page.waitForTimeout(1500);
const afterWait = await read();
console.log(JSON.stringify({before, afterClick, afterClose, afterWait}, null, 1));
await b.close(); server.kill('SIGTERM');
