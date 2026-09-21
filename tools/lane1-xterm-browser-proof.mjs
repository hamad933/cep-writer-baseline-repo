import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require=createRequire(import.meta.url);
const modulePath=process.env.CEP_PLAYWRIGHT_MODULE_PATH;
if(!modulePath) throw Error('CEP_PLAYWRIGHT_MODULE_PATH_REQUIRED');
const {chromium}=require(path.resolve(modulePath));
const root=new URL('../',import.meta.url);
const memo=new Map();
let xtermMemo=null;
const relativeSpecifiers=source=>[...new Set([
  ...[...source.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}\/[^'\"]+)['\"]/g)].map(m=>m[1]),
  ...[...source.matchAll(/import\(\s*['\"](\.{1,2}\/[^'\"]+)['\"]\s*\)/g)].map(m=>m[1])
])];
async function xtermUrl(){if(xtermMemo)return xtermMemo;const source=await readFile(new URL('dist/vendor/xterm/xterm.mjs',root),'utf8');xtermMemo=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;return xtermMemo;}
async function rewriteSource(relativePath){let source=await readFile(new URL(`dist/${relativePath}`,root),'utf8');if(source.includes('/vendor/xterm/xterm.mjs'))source=source.split('/vendor/xterm/xterm.mjs').join(await xtermUrl());for(const spec of relativeSpecifiers(source)){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(relativePath),spec));source=source.split(spec).join(await rewrite(resolved));}return source;}
async function rewrite(relativePath){if(memo.has(relativePath))return memo.get(relativePath);const source=await rewriteSource(relativePath);const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;memo.set(relativePath,url);return url;}
async function load(page){let html=await readFile(new URL('dist/index.html',root),'utf8');const donor=await readFile(new URL('dist/foundation/donor.css',root),'utf8');const ext=await readFile(new URL('dist/foundation/extensions.css',root),'utf8');const xcss=await readFile(new URL('dist/vendor/xterm/xterm.css',root),'utf8');html=html.replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i,`<style>${donor}</style>`).replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i,`<style>${ext}</style>`).replace(/<script type="module" src="main\.js"><\/script>/i,'').replace('</head>',`<style data-lane1-xterm>${xcss}</style></head>`);await page.setContent(html,{waitUntil:'domcontentloaded'});await page.evaluate(()=>history.replaceState({},'',`about:blank?surface=runs`));const main=await rewriteSource('main.js');await page.addScriptTag({type:'module',content:`${main}\n// lane1-targeted-xterm-proof`});await page.waitForFunction(()=>globalThis.CEPFoundation?.consumer==='runs');}

const outDir=new URL('assurance/lane1-windows-native-terminal/',root);await mkdir(outDir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CEP_BROWSER_EXECUTABLE||undefined});
let result;
try{
 const page=await browser.newPage({viewport:{width:1440,height:980}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await load(page);
 const open=page.locator('button[data-foundation-command="OPEN_TERMINAL"]').filter({visible:true}).first();await open.click();
 const host=page.locator('#operationalHost [data-xterm-presentation]').first();await host.waitFor({state:'visible'});
 const input=page.locator('#operationalHost .xterm-helper-textarea').first();await input.waitFor({state:'attached'});await input.focus();await page.keyboard.type('shutdown');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>CEPFoundation.simulation.devices.find(x=>x.id==='DEV-WEB-01')?.up===false);
 await page.waitForFunction(()=>document.querySelector('#operationalHost .xterm-rows')?.textContent?.includes('DOWN')===true,null,{timeout:10000});
 const evidence=await page.evaluate(()=>{const active=CEPFoundation.wave4Assembly?.operationalSession?.activeTab?.();const event=CEPFoundation.simulation.events.at(-1);const dev=CEPFoundation.simulation.devices.find(x=>x.id==='DEV-WEB-01');const node=CEPFoundation.spatial.model.nodes.find(x=>x.id==='DEV-WEB-01');return {consumer:CEPFoundation.consumer,renderer:document.querySelector('#operationalHost [data-xterm-presentation]')?.getAttribute('data-renderer')||document.querySelector('#operationalHost')?.dataset?.renderer||null,providerId:active?.providerId||null,presentationId:active?.presentationId||null,runtimeSessionId:active?.runtimeSessionId||active?.sessionId||null,deviceUp:dev?.up,nodeStatus:node?.status,semanticCommand:event?.semanticCommand,eventOutput:event?.output,terminalText:document.querySelector('#operationalHost .xterm-rows')?.textContent||'',pageErrors:[]};});
 evidence.pageErrors=errors;
 const pass=evidence.consumer==='runs'&&/xterm/i.test(String(evidence.renderer))&&evidence.providerId==='InternalSimulationAdapter'&&evidence.deviceUp===false&&evidence.nodeStatus==='DOWN'&&evidence.semanticCommand==='device.shutdown'&&String(evidence.eventOutput).includes('DOWN')&&evidence.terminalText.includes('DOWN')&&errors.length===0;
 const screenshot=new URL('browser-xterm-simulation.png',outDir);await page.screenshot({path:screenshot.pathname,fullPage:false});const image=await readFile(screenshot);const identity=await canonicalSourceIdentity(root);result={mission:'MISSION_WINDOWS_NATIVE_PLATFORM_TERMINAL_CONVERGENCE',classification:'TARGETED_BROWSER_REAL_CONSUMER_EVIDENCE',status:pass?'PASS':'FAIL',transport:'IN_MEMORY_SAME_BUILT_ESM_GRAPH__LOCAL_NAVIGATION_ADMIN_BLOCKED',viewport:{width:1440,height:980},canonicalSourceIdentity:identity,evidence,screenshot:{path:'assurance/lane1-windows-native-terminal/browser-xterm-simulation.png',bytes:image.length,sha256:createHash('sha256').update(image).digest('hex')}};await writeFile(new URL('browser-xterm-simulation.json',outDir),JSON.stringify(result,null,2));if(!pass)process.exitCode=1;
} finally {await browser.close();}
console.log(JSON.stringify(result,null,2));
