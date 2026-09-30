import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium}=require('playwright');
const root='/workspaces/cep-writer-baseline-repo/';
const OUT='/tmp/opencode/w05-config/g20';
await mkdir(OUT,{recursive:true});
const freePort=()=>new Promise(res=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})});
const port=await freePort();
const server=spawn(process.execPath,[path.join(root,'tools/serve.mjs'),'--port',String(port)],{cwd:root,stdio:['ignore','pipe','pipe']});
const wait=async url=>{for(let i=0;i<150;i++){try{if((await fetch(url)).ok)return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
await wait(`http://127.0.0.1:${port}/`);
const browser=await chromium.launch({headless:true});
const out={capturedAt:new Date().toISOString(),cases:[]};
try{
  for(const testCase of [
    {id:'no-user-preference',seed:null,expectAuthority:'browsing-context-language-environment'},
    {id:'user-preference-ar',seed:{locale:'ar'},expectAuthority:'user-preference'},
    {id:'user-preference-en-with-pin-rtl',seed:{locale:'en',chromeDirection:'rtl'},expectAuthority:'user-preference'}
  ]){
    const context=await browser.newContext({viewport:{width:1536,height:1024}});
    if(testCase.seed){
      await context.addInitScript(seed=>{
        try{localStorage.setItem('cep-foundation.preferences.v1',JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:seed}}))}catch(e){}
      },testCase.seed);
    }
    const page=await context.newPage();
    // Block main.js so ONLY the inline G-20 bootstrap can have written lang/dir.
    await page.route('**/main.js',route=>route.abort());
    await page.goto(`http://127.0.0.1:${port}/?surface=configuration`,{waitUntil:'load'});
    await page.waitForTimeout(400);
    const shell=await page.evaluate(()=>({
      lang:document.documentElement.lang,
      dir:document.documentElement.dir,
      languageAuthority:document.documentElement.getAttribute('data-language-authority'),
      directionAuthority:document.documentElement.getAttribute('data-direction-authority'),
      bakedPresent:/dir="rtl" lang="ar"/.test(document.documentElement.outerHTML.slice(0,200))
    }));
    const file=path.join(OUT,`shell-${testCase.id}.png`);
    await page.screenshot({path:file});
    const b=await readFile(file);
    out.cases.push({id:testCase.id,seed:testCase.seed,shell,expectedAuthority:testCase.expectAuthority,
      pass:shell.languageAuthority===testCase.expectAuthority&&!!shell.lang&&!!shell.dir,
      capture:{file,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length,dims:`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`}});
    await context.close();
  }
  // with JS disabled: shell must carry NO baked language/direction
  const noJs=await browser.newContext({viewport:{width:1536,height:1024},javaScriptEnabled:false});
  const p2=await noJs.newPage();
  await p2.goto(`http://127.0.0.1:${port}/?surface=configuration`,{waitUntil:'load'});
  const raw=await p2.evaluate(()=>({lang:document.documentElement.getAttribute('lang'),dir:document.documentElement.getAttribute('dir')})).catch(()=>({error:'evaluate-unavailable'}));
  const html=await p2.content();
  out.cases.push({id:'js-disabled-shell-has-no-baked-language-or-direction',raw,
    pass:!/<html[^>]*(lang=|dir=)/i.test(html.slice(0,400)),
    htmlHead:html.slice(0,220).replace(/\n\s*\n/g,'\n')});
  await noJs.close();
}finally{await browser.close();server.kill('SIGTERM')}
await writeFile(path.join(OUT,'g20-shell.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify(out.cases.map(c=>({id:c.id,pass:c.pass,shell:c.shell||c.raw})),null,2));
