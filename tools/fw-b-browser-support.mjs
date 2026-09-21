import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const require=createRequire(import.meta.url);
let playwright,playwrightResolution='package-local';
try{playwright=require('playwright')}catch(primaryError){
  const override=process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if(!override)throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE:${primaryError.message}`);
  playwright=require(path.resolve(override));playwrightResolution='explicit-environment-override';
}
export const chromium=playwright.chromium;
export const browserExecutable=process.env.CEP_BROWSER_EXECUTABLE||null;
export {playwrightResolution};
const root=new URL('../',import.meta.url);

const relativeSpecifiers=source=>[...new Set([
 ...[...source.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}\/[^'\"]+)['\"]/g)].map(m=>m[1]),
 ...[...source.matchAll(/import\(\s*['\"](\.{1,2}\/[^'\"]+)['\"]\s*\)/g)].map(m=>m[1])
])];

export const createInMemoryLoader=()=>{
 const memo=new Map();
 const rewriteModule=async rel=>{
   if(memo.has(rel))return memo.get(rel);
   const source=await rewriteSource(rel);
   const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
   memo.set(rel,url);return url;
 };
 const rewriteSource=async rel=>{
   let source=await readFile(new URL(`dist/${rel}`,root),'utf8');
   for(const specifier of relativeSpecifiers(source)){
     const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(rel),specifier));
     const dep=await rewriteModule(resolved);source=source.split(specifier).join(dep);
   }
   return source;
 };
 return async(page,surface)=>{
   let html=await readFile(new URL('dist/index.html',root),'utf8');
   const donorCss=await readFile(new URL('dist/foundation/donor.css',root),'utf8');
   const extensionCss=await readFile(new URL('dist/foundation/extensions.css',root),'utf8');
   html=html
     .replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i,`<style data-browser-inline="donor">${donorCss}</style>`)
     .replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i,`<style data-browser-inline="extensions">${extensionCss}</style>`)
     .replace(/<script type="module" src="main\.js"><\/script>/i,'');
   await page.setContent(html,{waitUntil:'domcontentloaded'});
   await page.evaluate(value=>{try{delete globalThis.CEPFoundation}catch{};try{delete globalThis.CEPBlueprint}catch{};history.replaceState({},'',`about:blank?surface=${encodeURIComponent(value)}`)},surface);
   const mainSource=await rewriteSource('main.js');
   await page.addScriptTag({type:'module',content:`${mainSource}\n// fw-b:${surface}:${Date.now()}`});
   await page.waitForFunction(expected=>window.CEPFoundation?.consumer===expected,surface);
 };
};

export const launch=()=>chromium.launch({headless:true,...(browserExecutable?{executablePath:browserExecutable}:{})});
export const withPage=async(browser,surface,fn,{viewport={width:1440,height:1000}}={})=>{
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{const load=createInMemoryLoader();await load(page,surface);const value=await fn(page);if(errors.length)throw Error(`PAGE_ERRORS:${errors.join(' | ')}`);return value}
 finally{await context.close()}
};
export const assert=(condition,message)=>{if(!condition)throw Error(message)};
