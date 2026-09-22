import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const out=new URL('../controller-targeted-output/',import.meta.url);
await mkdir(out,{recursive:true});
await mkdir(new URL('screenshots/',out),{recursive:true});
const checkpoint='da007840363d92cdadd9f7c5180449a49e6f1d19';
const port=43181,base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,[new URL('../tools/serve.mjs',import.meta.url).pathname,'--port',String(port)],{cwd:new URL('../',import.meta.url),stdio:['ignore','pipe','pipe']});
let serverErr='';server.stderr.on('data',d=>serverErr+=d);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let reachable=false;
for(let i=0;i<100;i++){try{if((await fetch(base)).ok){reachable=true;break}}catch{}await sleep(100)}
if(!reachable)throw Error('GENUINE_LOCALHOST_ROUTE_UNAVAILABLE:'+serverErr);

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
async function ready(surface,width=1024,height=900){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/?surface='+encodeURIComponent(surface),{waitUntil:'networkidle',timeout:20000});
 await page.waitForFunction(s=>globalThis.CEPFoundation?.consumer===s,surface,{timeout:15000});
 return {context,page,errors};
}
const visible=async loc=>{try{return await loc.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0})}catch{return false}};
const profileNeeds=v=>{if(v==null)return false;const s=String(v).trim().toLowerCase();return !!s&&!['n/a','na','none','not applicable','not_applicable'].some(x=>s===x||s.includes(x))};
const surfaces=['shell','today','library','learn','rq','visualize','enterprise','scenarios','labs','runs','results','evidence','reviews','mastery','portfolio','health','processing','validation','manual_ai','backup','audit','releases','configuration'];

const responsive=[];
for(const surface of surfaces){
 let profile={};try{profile=JSON.parse(await readFile(new URL('../cep-writer/references/surface-profiles/'+surface+'.json',import.meta.url),'utf8'))}catch{}
 if(!profileNeeds(profile.slots?.RIGHT))continue;
 const {context,page,errors}=await ready(surface);
 const right=page.locator('#rightPane');
 const before=await page.evaluate(()=>({state:document.querySelector('#rightPane')?.getAttribute('data-state')||null,hidden:document.querySelector('#rightPane')?.hidden||false,bodyOverlay:document.body?.dataset?.overlayPane||null,text:(document.querySelector('#rightPane')?.innerText||'').replace(/\s+/g,' ').slice(0,300)}));
 const opener=page.locator('button[data-pane-toggle="right"]:visible').filter({hasNot:page.locator('#rightPane button[data-pane-toggle="right"]')}).first();
 let openerCount=await opener.count(),clicked=false,clickError=null;
 if(openerCount){try{await opener.click();clicked=true;await page.waitForTimeout(120)}catch(e){clickError=String(e?.message||e)}}
 const after=await page.evaluate(()=>{const el=document.querySelector('#rightPane');const s=el?getComputedStyle(el):null,r=el?.getBoundingClientRect();return {state:el?.getAttribute('data-state')||null,visible:!!el&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0,bodyOverlay:document.body?.dataset?.overlayPane||null,text:(el?.innerText||'').replace(/\s+/g,' ').slice(0,300)}});
 const pass=before.state!=='collapsed'||(clicked&&after.visible);
 if(!pass||['today','rq','evidence','processing','library','visualize'].includes(surface)){
   const p=new URL('screenshots/right-'+surface+'-1024x900.png',out);await page.screenshot({path:p.pathname,fullPage:false});
 }
 responsive.push({surface,before,openerCount,clicked,clickError,after,pageErrors:errors,pass});
 await context.close();
}

const visualize={};
{
 const {context,page,errors}=await ready('visualize',1440,1000);
 visualize.pageErrors=errors;
 visualize.provider=await page.evaluate(()=>({
   m0Provider:CEPFoundation.m0Composition?.adapter?.provider?.descriptor?.()||null,
   relationsOwner:CEPFoundation.relations?.owner||null,
   relationRecords:structuredClone(CEPFoundation.relations?.records||[]),
   nodes:structuredClone(CEPFoundation.spatial?.model?.nodes||[]),
   edges:structuredClone(CEPFoundation.spatial?.model?.edges||[]),
   rightText:(document.querySelector('#rightPane')?.innerText||'').replace(/\s+/g,' ').slice(0,1000),
   bottomText:(document.querySelector('#bottomShelf')?.innerText||'').replace(/\s+/g,' ').slice(0,1000)
 }));
 visualize.pairs=await page.evaluate(()=>{
   const nodes=CEPFoundation.spatial?.model?.nodes||[],out=[];
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
     let r;try{r=CEPFoundation.relations.connectionAvailability([nodes[i].id,nodes[j].id])}catch(e){r={enabled:false,error:String(e?.message||e)}}
     out.push({a:nodes[i].id,b:nodes[j].id,result:r});
   }
   return out;
 });
 visualize.eligiblePairs=visualize.pairs.filter(x=>x.result?.enabled).length;
 visualize.edgeDom=await page.evaluate(()=>[...document.querySelectorAll('.spatial-canvas [data-edge]')].map(edge=>({
   edge:edge.getAttribute('data-edge'),
   html:edge.outerHTML.slice(0,1800),
   labels:[...edge.querySelectorAll('[data-relation-label]')].map(x=>x.outerHTML.slice(0,500))
 })).slice(0,5));
 const edge=page.locator('.spatial-canvas [data-edge]').first(),label=edge.locator('[data-relation-label]').first(),composer=page.locator('.relation-composer');
 visualize.edgeCount=await page.locator('.spatial-canvas [data-edge]').count();
 visualize.labelCount=await label.count();
 visualize.composerBefore=await composer.count()?await composer.evaluate(el=>({hidden:el.hidden,text:(el.innerText||'').slice(0,200)})):null;
 if(visualize.labelCount){try{await label.dblclick({force:true});await page.waitForTimeout(100)}catch(e){visualize.dblclickError=String(e?.message||e)}}
 visualize.composerAfter=await composer.count()?await composer.evaluate(el=>({hidden:el.hidden,text:(el.innerText||'').slice(0,400)})):null;
 visualize.receipts=await page.evaluate(()=>CEPFoundation.registry?.receipts?.filter?.(x=>x.id==='relation.edit')||[]);
 await page.screenshot({path:new URL('screenshots/visualize-targeted-1440x1000.png',out).pathname,fullPage:false});
 await context.close();
}

const runs={};
{
 const {context,page,errors}=await ready('runs',1440,1000);runs.pageErrors=errors;
 runs.before=await page.evaluate(()=>({
   simDescriptor:CEPFoundation.simulation?.descriptor?.()||null,
   providerDescriptors:CEPFoundation.wave4Assembly?.operationalSession?.providerDescriptors?.()||[],
   operationalKeys:Object.keys(CEPFoundation.operational||{}),
   activeTab:CEPFoundation.wave4Assembly?.operationalSession?.activeTab?.()||null
 }));
 const open=page.locator('button[data-foundation-command="OPEN_TERMINAL"]:visible').first();
 runs.openCount=await open.count();if(runs.openCount)await open.click();await page.waitForTimeout(200);
 const xinput=page.locator('#operationalHost .xterm-helper-textarea').first();
 const formInput=page.locator('#operationalHost form[data-terminal-form] input').first();
 runs.xtermInput=await xinput.count();runs.formInput=await formInput.count();
 try{
   if(runs.xtermInput){await xinput.focus();await page.keyboard.type('shutdown');await page.keyboard.press('Enter')}
   else if(runs.formInput){await formInput.fill('shutdown');await formInput.press('Enter')}
   else throw Error('NO_TERMINAL_INPUT');
   await page.waitForTimeout(250);
 }catch(e){runs.inputError=String(e?.message||e)}
 runs.after=await page.evaluate(()=>{
   const device=CEPFoundation.simulation?.devices?.find?.(x=>x.id==='DEV-WEB-01')||null;
   const node=CEPFoundation.spatial?.model?.nodes?.find?.(x=>x.id==='DEV-WEB-01')||null;
   const event=CEPFoundation.simulation?.events?.at?.(-1)||null;
   const recorded=CEPFoundation.simulation?.recorded?.()?.devices?.find?.(x=>x.id==='DEV-WEB-01')||null;
   return {
     device,node,event,recorded,
     providerDescriptors:CEPFoundation.wave4Assembly?.operationalSession?.providerDescriptors?.()||[],
     activeTab:CEPFoundation.wave4Assembly?.operationalSession?.activeTab?.()||null,
     terminalText:(document.querySelector('#operationalHost')?.innerText||'').replace(/\s+/g,' ').slice(0,2200),
     rightText:(document.querySelector('#rightPane')?.innerText||'').replace(/\s+/g,' ').slice(0,1500)
   };
 });
 await page.screenshot({path:new URL('screenshots/runs-shutdown-targeted-1440x1000.png',out).pathname,fullPage:false});
 await context.close();
}

const toolbarContext={};
{
 const {context,page,errors}=await ready('rq',1440,1000);
 toolbarContext.pageErrors=errors;
 toolbarContext.beforeContext=await page.evaluate(()=>CEPFoundation.workspace?.toolbarContext?.()||null);
 toolbarContext.rowCount=await page.locator('#leftPane [data-r6-row]').count();
 await page.evaluate(()=>{
   const initial=CEPFoundation.workspace?.toolbarContext?.()?.id||null;
   if(!CEPFoundation.registry.commands.has('c1.context-probe')){
     CEPFoundation.registry.register('c1.context-probe','C1Harness','C1 contextual toolbar probe',payload=>{
       globalThis.__C1_TOOLBAR_CAPTURED_PAYLOAD={id:payload?.id||null,route:payload?.route||null,hasInvoker:Boolean(payload?.invoker)};
       return {ok:true,status:'C1_CONTEXT_PROBE_EXECUTED',id:payload?.id||null};
     },payload=>payload?.id&&payload.id!==initial?true:{enabled:false,code:'C1_PROBE_REQUIRES_SELECTION_CHANGE',reason:'Select a different real row.',availabilityOwner:'C1Harness'});
   }
   CEPFoundation.workspace.toolbar(['c1.context-probe'],{contextProvider:CEPFoundation.workspace.toolbarContextProvider});
 });
 const probe=page.locator('#domainToolbar [data-foundation-command="c1.context-probe"]').first();
 toolbarContext.beforeDisabled=await probe.isDisabled();
 if(toolbarContext.rowCount>1){await page.locator('#leftPane [data-r6-row]').nth(1).click();await page.waitForTimeout(120)}
 toolbarContext.afterContext=await page.evaluate(()=>CEPFoundation.workspace?.toolbarContext?.()||null);
 toolbarContext.afterDisabled=await probe.isDisabled();
 toolbarContext.contextBound=await page.locator('#domainToolbar').getAttribute('data-context-bound');
 if(!(await probe.isDisabled()))await probe.click();
 toolbarContext.capturedPayload=await page.evaluate(()=>globalThis.__C1_TOOLBAR_CAPTURED_PAYLOAD||null);
 toolbarContext.pass=toolbarContext.rowCount>1&&toolbarContext.beforeDisabled===true&&toolbarContext.afterDisabled===false&&toolbarContext.contextBound==='true'&&toolbarContext.beforeContext?.id!==toolbarContext.afterContext?.id&&toolbarContext.capturedPayload?.id===toolbarContext.afterContext?.id&&toolbarContext.capturedPayload?.route==='toolbar';
 await page.screenshot({path:new URL('screenshots/rq-contextual-toolbar-1440x1000.png',out).pathname,fullPage:false});
 await context.close();
}

const eventTarget={};
{
 const {context,page,errors}=await ready('rq',1440,1000);
 eventTarget.pageErrors=errors;
 eventTarget.prototypeState=await page.evaluate(()=>({
   nodeOwnClosest:Object.prototype.hasOwnProperty.call(Node.prototype,'closest'),
   windowOwnClosest:Object.prototype.hasOwnProperty.call(Window.prototype,'closest'),
   elementOwnClosest:Object.prototype.hasOwnProperty.call(Element.prototype,'closest')
 }));
 eventTarget.execution=await page.evaluate(()=>{
   globalThis.__C1_EVENTTARGET_CAPTURE=null;
   if(!CEPFoundation.registry.commands.has('c1.eventtarget-probe')){
     CEPFoundation.registry.register('c1.eventtarget-probe','C1Harness','C1 EventTarget probe',payload=>{
       globalThis.__C1_EVENTTARGET_CAPTURE={id:payload?.id||null,route:payload?.route||null,hasInvoker:Boolean(payload?.invoker)};
       return {ok:true,status:'C1_EVENTTARGET_PROBE_EXECUTED'};
     },()=>true);
   }
   CEPFoundation.workspace.toolbar(['c1.eventtarget-probe'],{contextProvider:()=>({id:'eventtarget-text-node'})});
   const button=document.querySelector('#domainToolbar [data-foundation-command="c1.eventtarget-probe"]');
   if(!button)return {dispatched:false,reason:'PROBE_BUTTON_MISSING'};
   const textNode=button.firstChild;
   if(!(textNode instanceof Text))return {dispatched:false,reason:'TEXT_NODE_MISSING',nodeType:textNode?.nodeType||null};
   let dispatchError=null;
   try{textNode.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,composed:true}))}catch(error){dispatchError=String(error?.message||error)}
   let neutralError=null;
   try{const neutral=document.createTextNode('neutral');document.querySelector('#centerPane')?.append(neutral);neutral.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,composed:true}));neutral.remove()}catch(error){neutralError=String(error?.message||error)}
   return {dispatched:true,dispatchError,neutralError,capture:globalThis.__C1_EVENTTARGET_CAPTURE};
 });
 eventTarget.pass=eventTarget.prototypeState.nodeOwnClosest===false&&eventTarget.prototypeState.windowOwnClosest===false&&eventTarget.prototypeState.elementOwnClosest===true&&eventTarget.execution?.dispatched===true&&!eventTarget.execution?.dispatchError&&!eventTarget.execution?.neutralError&&eventTarget.execution?.capture?.id==='eventtarget-text-node'&&eventTarget.execution?.capture?.route==='toolbar'&&eventTarget.execution?.capture?.hasInvoker===true&&eventTarget.pageErrors.length===0;
 await context.close();
}

const result={
 generatedAt:new Date().toISOString(),checkpoint,
 classification:'CONTROLLER_TARGETED_FALSIFICATION__GENUINE_LOCALHOST_ROUTE__NO_PRODUCT_MUTATION',
 responsive:{tested:responsive.length,pass:responsive.filter(x=>x.pass).length,fail:responsive.filter(x=>!x.pass).length,rows:responsive},
 toolbarContext,eventTarget,visualize,runs
};
await writeFile(new URL('targeted-falsification.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({responsive:{tested:result.responsive.tested,pass:result.responsive.pass,fail:result.responsive.fail},toolbarContext:{pass:toolbarContext.pass,beforeDisabled:toolbarContext.beforeDisabled,afterDisabled:toolbarContext.afterDisabled,contextBound:toolbarContext.contextBound,capturedId:toolbarContext.capturedPayload?.id||null},eventTarget:{pass:eventTarget.pass,prototypeState:eventTarget.prototypeState,execution:eventTarget.execution},visualize:{eligiblePairs:visualize.eligiblePairs,edgeCount:visualize.edgeCount,labelCount:visualize.labelCount,composerBefore:visualize.composerBefore,composerAfter:visualize.composerAfter},runs:{openCount:runs.openCount,xtermInput:runs.xtermInput,formInput:runs.formInput,inputError:runs.inputError||null,deviceUp:runs.after?.device?.up,nodeStatus:runs.after?.node?.status,event:runs.after?.event?.semanticCommand,recordedUp:runs.after?.recorded?.up}},null,2));
await browser.close();server.kill('SIGTERM');
if(result.responsive.fail||!toolbarContext.pass||!eventTarget.pass)process.exitCode=1;
