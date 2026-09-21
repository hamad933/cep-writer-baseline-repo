import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const require=createRequire(import.meta.url);
let playwright,resolution='package-local';
try{playwright=require('playwright')}catch(error){
  const override=process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if(!override)throw Error('PLAYWRIGHT_PACKAGE_UNAVAILABLE:'+error.message);
  playwright=require(path.resolve(override));resolution='explicit-environment-override';
}
const root=new URL('../',import.meta.url),{chromium}=playwright,moduleMemo=new Map(),flows=[],screenshots=[];
const relSpecs=source=>[...new Set([
  ...[...source.matchAll(/(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}\/[^'\"]+)['\"]/g)].map(m=>m[1]),
  ...[...source.matchAll(/import\(\s*['\"](\.{1,2}\/[^'\"]+)['\"]\s*\)/g)].map(m=>m[1])
])];
const rewriteModule=async relative=>{
  if(moduleMemo.has(relative))return moduleMemo.get(relative);
  let source=await readFile(new URL(`dist/${relative}`,root),'utf8');
  for(const spec of relSpecs(source)){
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(relative),spec)),url=await rewriteModule(resolved);
    source=source.split(spec).join(url);
  }
  const url=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  moduleMemo.set(relative,url);return url;
};
let cachedMain=null,cachedHtml=null;
const mainSource=async()=>{
  if(cachedMain)return cachedMain;
  let source=await readFile(new URL('dist/main.js',root),'utf8');
  for(const spec of relSpecs(source)){
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname('main.js'),spec)),url=await rewriteModule(resolved);
    source=source.split(spec).join(url);
  }
  cachedMain=source;return source;
};
const htmlSource=async()=>{
  if(cachedHtml)return cachedHtml;
  let html=await readFile(new URL('dist/index.html',root),'utf8');
  for(const css of ['donor.css','extensions.css']){
    const value=await readFile(new URL(`dist/foundation/${css}`,root),'utf8');
    html=html.replace(new RegExp(`<link rel="stylesheet" href="foundation/${css.replace('.','\\.')}">`,'i'),`<style>${value}</style>`);
  }
  cachedHtml=html.replace(/<script type="module" src="main\.js"><\/script>/i,'');return cachedHtml;
};
const newPage=async(surface,viewport={width:1280,height:900})=>{
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});page.setDefaultTimeout(8000);
  await page.setContent(await htmlSource(),{waitUntil:'domcontentloaded'});
  await page.evaluate(value=>history.replaceState({},'',`about:blank?surface=${encodeURIComponent(value)}`),surface);
  await page.addScriptTag({type:'module',content:`${await mainSource()}\n// w2a-browser:${surface}:${Date.now()}`});
  await page.waitForFunction(expected=>window.CEPFoundation?.consumer===expected,surface,{timeout:15000});
  return page;
};
const assert=(value,message)=>{if(!value)throw Error(message)};
const run=async(id,before,action,owner,oracle,fn)=>{try{const evidence=await fn();flows.push({id,before,action,owner,oracle,status:'PASS',evidence})}catch(error){flows.push({id,before,action,owner,oracle,status:'FAIL',error:error.stack||error.message})}};
const capture=async(page,name,flowId)=>{const u=new URL(`assurance/${name}`,root);await page.screenshot({path:u.pathname,fullPage:false});const bytes=await readFile(u);screenshots.push({filename:name,flowId,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})};

const browser=await chromium.launch({headless:true,...(process.env.CEP_BROWSER_EXECUTABLE?{executablePath:process.env.CEP_BROWSER_EXECUTABLE}:{})});
try{
  await run(
    'w2a.browser.command-real-route-convergence',
    'RUN-0042 real consumer with OPEN_TERMINAL exposed through toolbar, inspector context, object double-click, canvas menu and command palette',
    'activate five existing route classes through visible UI and inspect the real menu transient before execution',
    'SemanticCommandBus + W03V34RunsAdapter + TransientFocusOwner',
    'five accepted actions retain one semantic ID/owner and exactly one receipt per route; family availability remains delegated; menu lifecycle is canonical',
    async()=>{
      const page=await newPage('runs',{width:1440,height:980});
      try{
        const runtimeAvailability=await page.evaluate(()=>window.CEPFoundation.commandBus.availability('OPEN_TERMINAL',{deviceId:'DEV-WEB-01'}));
        assert(runtimeAvailability.enabled&&runtimeAvailability.commandOwner==='InternalSimulationAdapter','runtime family availability/owner not preserved');
        await page.locator('#domainToolbar [data-foundation-command="OPEN_TERMINAL"]').click();
        await page.locator('#domainContext [data-foundation-command="OPEN_TERMINAL"]').click();
        await page.locator('.object-entry[data-object="DEV-WEB-01"]').dblclick();
        await page.locator('[data-node="DEV-WEB-01"]').click({button:'right'});
        const menuTransient=await page.evaluate(()=>window.CEPFoundation.transientOwner.snapshot());
        assert(menuTransient.top==='foundationMenu','real Runs menu is not owned by TransientFocusOwner');
        await page.locator('#foundationMenu [data-foundation-command="OPEN_TERMINAL"]').click();
        await page.locator('.foundation-global [data-foundation-command="foundation.palette"]').click();
        await page.locator('#commandSearch').fill('OPEN_TERMINAL');
        await page.locator('#commandResults [data-foundation-command="OPEN_TERMINAL"]').click();
        const receipts=await page.evaluate(()=>window.CEPFoundation.registry.receipts.filter(x=>x.id==='OPEN_TERMINAL'));
        assert(receipts.length===5,`expected five OPEN_TERMINAL receipts, got ${receipts.length}`);
        const routes=receipts.map(x=>x.route),expected=['toolbar','context','object-doubleclick','menu','palette'];
        for(const route of expected)assert(routes.includes(route),`missing route ${route}`);
        assert(new Set(receipts.map(x=>x.owner)).size===1,'command owner diverged across routes');
        assert(receipts.every(x=>x.policyTag==='semantic-command-v1'),'central receipt policy tag missing');
        await capture(page,'w2a-command-route-convergence.png','w2a.browser.command-real-route-convergence');
        return {runtimeAvailability,menuTransient,receipts,routes};
      }finally{await page.close()}
    }
  );

  await run(
    'w2a.browser.transient-real-consumers',
    'Library donor-compatible and Learn donor-free Structured consumers',
    'open Settings and Command Palette through existing global controls; dismiss by Escape; compare pane state and focus return',
    'TransientFocusOwner',
    'both consumers share the canonical owner, modal/palette stack is truthful, Escape closes topmost, exact invoker focus returns, and persistent panes never enter transient ownership',
    async()=>{
      const evidence=[];
      for(const surface of ['library','learn']){
        const page=await newPage(surface);
        try{
          const baseline=await page.evaluate(()=>({shared:window.CEPFoundation.workspace.transients===window.CEPFoundation.transientOwner,left:document.body.dataset.left,right:document.body.dataset.right,records:[...window.CEPFoundation.transientOwner.records.keys()]}));
          assert(baseline.shared,`${surface}: workspace does not share TransientFocusOwner`);
          assert(!baseline.records.includes('leftPane')&&!baseline.records.includes('rightPane'),`${surface}: pane entered transient records`);
          const settings=page.locator('.foundation-global [data-foundation-command="foundation.settings"]');
          await settings.click();
          let snap=await page.evaluate(()=>window.CEPFoundation.transientOwner.snapshot());
          assert(snap.top==='foundationDialog'&&snap.modal,`${surface}: Settings not owned as modal top transient`);
          await page.keyboard.press('Escape');
          snap=await page.evaluate(()=>window.CEPFoundation.transientOwner.snapshot());
          const focusAfterSettings=await page.evaluate(()=>document.activeElement?.getAttribute?.('data-foundation-command')||document.activeElement?.id||'');
          assert(snap.active.length===0&&snap.lastDismissal?.reason==='escape'&&snap.lastDismissal?.focusTargetKind==='invoker',`${surface}: Settings Escape/focus receipt invalid`);
          assert(focusAfterSettings==='foundation.settings',`${surface}: Settings did not return exact invoker focus`);
          const palette=page.locator('.foundation-global [data-foundation-command="foundation.palette"]');
          await palette.click();
          snap=await page.evaluate(()=>window.CEPFoundation.transientOwner.snapshot());
          assert(snap.top==='commandBackdrop'&&snap.modal,`${surface}: palette not owned as modal top transient`);
          await page.keyboard.press('Escape');
          snap=await page.evaluate(()=>window.CEPFoundation.transientOwner.snapshot());
          const focusAfterPalette=await page.evaluate(()=>document.activeElement?.getAttribute?.('data-foundation-command')||document.activeElement?.id||'');
          assert(snap.active.length===0&&snap.lastDismissal?.id==='commandBackdrop'&&snap.lastDismissal?.reason==='escape',`${surface}: palette Escape receipt invalid`);
          assert(focusAfterPalette==='foundation.palette',`${surface}: palette did not return exact invoker focus`);
          const after=await page.evaluate(()=>({left:document.body.dataset.left,right:document.body.dataset.right,records:[...window.CEPFoundation.transientOwner.records.keys()]}));
          assert(after.left===baseline.left&&after.right===baseline.right,`${surface}: transient lifecycle changed persistent pane state`);
          assert(!after.records.includes('leftPane')&&!after.records.includes('rightPane'),`${surface}: persistent pane became transient`);
          const availability=surface==='learn'?await page.evaluate(()=>{const f=window.CEPFoundation,blockId=f.structured.snapshot().blocks[0].id;return f.commandBus.availability('block.moveDown',{mode:'read',blockId})}):null;
          if(availability)assert(!availability.enabled&&availability.owner==='StructuredCommandAvailabilityOwner'&&availability.commandOwner==='StructuredDocumentDomainAdapter',`${surface}: Structured family availability owner was replaced`);
          if(surface==='library')await capture(page,'w2a-library-transient-owner.png','w2a.browser.transient-real-consumers');
          evidence.push({surface,baseline,settingsDismissal:snap,focusAfterSettings,focusAfterPalette,after,structuredAvailability:availability});
        }finally{await page.close()}
      }
      return evidence;
    }
  );

  await run(
    'w2a.browser.preferences-real-families',
    'real Visualize Spatial consumer plus the exact current ScopedPreferencesOwner constructor used by Structured, Spatial and Operational bootstrap contexts',
    'inspect real family identity and execute injected truthful persistence/applicability round-trip across three representative family contexts',
    'ScopedPreferencesOwner',
    'one canonical owner enforces family applicability, incompatible persisted values do not leak, shared global preferences still resolve, and storage success/failure is explicit',
    async()=>{
      const page=await newPage('visualize');
      try{
        const evidence=await page.evaluate(()=>{
          const live=window.CEPFoundation.preferences,C=live.constructor;
          const storage={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
          const spatial=new C(storage,{workspace:'W02',surface:'visualize',view:'main',component:'workspace',family:'spatial'});
          const save=spatial.set('grid',false,'global');
          const structured=new C(storage,{workspace:'W02',surface:'learn',view:'main',component:'workspace',family:'structured'});
          const operational=new C(storage,{workspace:'W03',surface:'runs',view:'main',component:'workspace',family:'operational'});
          const unavailable=new C(null,{workspace:'W02',surface:'learn',view:'main',component:'workspace',family:'structured'});
          return {
            live:{consumer:window.CEPFoundation.consumer,family:window.CEPFoundation.family,grid:live.applicability('grid'),documentWidth:live.applicability('documentWidth'),theme:live.applicability('theme'),storage:live.storageStatus()},
            save,
            spatial:{grid:spatial.resolve('grid'),documentWidth:spatial.resolve('documentWidth'),theme:spatial.resolve('theme')},
            structured:{grid:structured.resolve('grid'),documentWidth:structured.resolve('documentWidth'),theme:structured.resolve('theme')},
            operational:{grid:operational.resolve('grid'),documentWidth:operational.resolve('documentWidth'),theme:operational.resolve('theme')},
            unavailable:unavailable.storageStatus(),stored:storage.value
          };
        });
        assert(evidence.live.family==='spatial'&&evidence.live.grid.applicable&&!evidence.live.documentWidth.applicable,'real Visualize family applicability incorrect');
        assert(evidence.save.ok&&evidence.save.durable,'truthful injected persistence did not report durable success');
        assert(evidence.spatial.grid.preferredValue===false&&evidence.spatial.grid.applicable,'Spatial persisted grid preference not recovered');
        assert(evidence.structured.grid.preferredValue===true&&!evidence.structured.grid.applicable,'Spatial grid leaked into Structured context');
        assert(!evidence.operational.grid.applicable&&!evidence.operational.documentWidth.applicable&&evidence.operational.theme.applicable,'Operational applicability leaked domain preferences');
        assert(evidence.unavailable.available===false&&evidence.unavailable.error==='STORAGE_UNAVAILABLE','storage fallback failure not surfaced truthfully');
        await capture(page,'w2a-preferences-family-applicability.png','w2a.browser.preferences-real-families');
        return evidence;
      }finally{await page.close()}
    }
  );
} finally {await browser.close()}

const source=await canonicalSourceIdentity(root),pass=flows.filter(x=>x.status==='PASS').length,fail=flows.length-pass;
const receipt={schemaVersion:1,classification:'WAVE2_LANE_A_EXECUTABLE_BROWSER_PROOF_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:source.sha256,sourceFiles:source.files,environment:{node:process.version,playwrightResolution:resolution,browserExecutableOverride:!!process.env.CEP_BROWSER_EXECUTABLE,transport:'in-memory-current-built-graph',localhostNote:'localhost transport is administratively blocked in this environment; the controlling prompt explicitly permits an equivalent in-memory transport bound to the current built graph'},summary:{total:flows.length,pass,fail},flows,screenshots};
await writeFile(new URL('assurance/W2A_BROWSER_PROOF.json',root),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({summary:receipt.summary,sourceCanonicalTreeSha256:source.sha256,screenshots},null,2));
if(fail)process.exitCode=1;
