import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {launch,withPage,assert,playwrightResolution,browserExecutable} from './fw-b-browser-support.mjs';
const root=new URL('../',import.meta.url);
const scenarios=[];const screenshots=[];
const scenario=async(id,name,run)=>{try{const evidence=await run();scenarios.push({id,name,status:'PASS',evidence})}catch(error){scenarios.push({id,name,status:'FAIL',error:String(error.message||error)})}};
const snap=async(page,name)=>{const u=new URL(`assurance/${name}`,root);await page.screenshot({path:u.pathname,fullPage:false});const b=await readFile(u);const x={filename:name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),viewport:await page.viewportSize()};screenshots.push(x);return x};
const edit=async page=>{await page.locator('[data-action="set-mode"][data-value="edit"]').first().click();await page.waitForFunction(()=>CEPBlueprint.state.surface.mode==='edit')};
const openMenu=async(page,id)=>{const h=page.locator(`[data-block-id="${id}"] [data-block-handle]`).first();await h.click();await page.waitForFunction(()=>!document.querySelector('#blockMenu')?.hidden)};
const undo=async page=>{await page.waitForFunction(()=>!document.querySelector('[data-action="undo"]')?.disabled);await page.locator('[data-action="undo"]').first().click()};
const browser=await launch();
let libraryRealCallPath=null,learnSecondConsumer=null;
try{
 await withPage(browser,'library',async page=>{
   page.setDefaultTimeout(8000);await edit(page);
   await scenario('G02','single block selection drives canonical context',async()=>{
     await page.locator('[data-block-id="blk-d05-p1"] .blockbody').first().click();
     const e=await page.evaluate(()=>({selected:CEPBlueprint.state.editor.selectedBlock,contextScope:CEPBlueprint.state.surface.contextScope,descriptor:CEPFoundation.structured.selectedFragmentIdentity(),contextBlock:CEPBlueprint.contextBlockId?.()}));
     assert(e.selected==='blk-d05-p1'&&e.descriptor.owner==='StructuredSelectionKernel'&&e.descriptor.blockIds[0]==='blk-d05-p1'&&e.contextScope==='block','G02 canonical single selection/context failed');
     return e;
   });
   await scenario('G05','insertion selects canonical new identity and undo repairs selection',async()=>{
     const before=await page.evaluate(()=>CEPFoundation.structured.snapshot().blocks.map(b=>b.id));
     await page.locator('#blockList .gap').first().locator('[data-insert-gap]').click({force:true});
     await page.locator('#insertSearch').fill('paragraph');await page.locator('#insertGrid [data-insert-type="paragraph"]').click();
     const inserted=await page.evaluate(old=>{const now=CEPFoundation.structured.snapshot().blocks.map(b=>b.id);const id=now.find(x=>!old.includes(x));return {id,selection:CEPFoundation.structured.selectedFragmentIdentity(),history:CEPFoundation.structured.transactionDescriptor()}},before);
     assert(inserted.id&&inserted.selection.blockIds.includes(inserted.id),'G05 inserted block did not become canonical selection');
     await undo(page);
     const afterUndo=await page.evaluate(id=>({exists:!!CEPFoundation.structured.findBlockRef(id),selection:CEPFoundation.structured.selectedFragmentIdentity(),receipts:CEPFoundation.structured.selectionReceipts().slice(-4)}),inserted.id);
     assert(!afterUndo.exists&&!afterUndo.selection.blockIds.includes(inserted.id),'G05 stale selection survived undo/removal');
     return {inserted,afterUndo};
   });
   await scenario('G06','subtree delete preserves one selection owner and stale-safe repair',async()=>{
     await page.evaluate(()=>CEPFoundation.structured.selectBlocks(['blk-d05-t1'],{mode:'multi',anchor:'blk-d05-t1',focus:'blk-d05-t1'}));
     const before=await page.evaluate(()=>({selection:CEPFoundation.structured.selectedFragmentIdentity(),history:CEPFoundation.structured.transactionDescriptor()}));
     await openMenu(page,'blk-d05-t1');const del=page.locator('#blockMenu [data-menu-cmd="delete"]').first();await del.evaluate(e=>{for(let x=e.parentElement;x;x=x.parentElement)if(x.tagName==='DETAILS')x.open=true});await del.click();
     const confirmation=await page.locator('[data-delete-confirm="confirm"]').isVisible();assert(confirmation,'G06 structural confirmation absent');await page.locator('[data-delete-confirm="confirm"]').click();
     const deleted=await page.evaluate(()=>({exists:!!CEPFoundation.structured.findBlockRef('blk-d05-t1'),selection:CEPFoundation.structured.selectedFragmentIdentity(),history:CEPFoundation.structured.transactionDescriptor()}));
     assert(!deleted.exists&&!deleted.selection.blockIds.includes('blk-d05-t1'),'G06 stale deleted subtree selection remained');
     await undo(page);const restored=await page.evaluate(()=>({exists:!!CEPFoundation.structured.findBlockRef('blk-d05-t1'),selection:CEPFoundation.structured.selectedFragmentIdentity()}));
     assert(restored.exists,'G06 undo failed to restore subtree');return {before,confirmation,deleted,restored};
   });
   await scenario('G09','DOM text selection projects logical inline descriptor only',async()=>{
     const result=await page.evaluate(()=>{
       const body=document.querySelector('[data-block-id="blk-d05-p1"] .blockbody[data-editable-block]');
       const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);let node=walker.nextNode();while(node&&node.textContent.length<6)node=walker.nextNode();
       if(!node)throw Error('NO_TEXT_NODE');const range=document.createRange();range.setStart(node,1);range.setEnd(node,6);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);CEPBlueprint.updateSelectionToolbar();
       const d=CEPFoundation.structured.selectedFragmentIdentity();return {text:sel.toString(),descriptor:d,canonicalOwnsDom:('rangeNode' in d)||('domRange' in d)||('node' in d)};
     });
     assert(result.text.length>0&&result.descriptor.inlineRange?.blockId==='blk-d05-p1'&&!result.canonicalOwnsDom,'G09 inline projection failed or DOM leaked into authority');return result;
   });
   await scenario('G12','command palette overlay does not replace canonical selection identity',async()=>{
     await page.evaluate(()=>{getSelection()?.removeAllRanges();CEPFoundation.structured.clearSelection();CEPBlueprint.setMode('read')});await page.waitForFunction(()=>CEPBlueprint.state.surface.mode==='read');
     const before=await page.evaluate(()=>CEPFoundation.structured.selectedFragmentIdentity());await page.keyboard.press('Control+K');await page.waitForFunction(()=>!document.querySelector('#commandBackdrop').hidden);await page.keyboard.press('Escape');
     const after=await page.evaluate(()=>CEPFoundation.structured.selectedFragmentIdentity());assert(after.owner==='StructuredSelectionKernel'&&after.documentId===before.documentId&&JSON.stringify(after.blockIds)===JSON.stringify(before.blockIds),'G12 palette changed canonical selection');return {before,after,paletteClosed:await page.locator('#commandBackdrop').evaluate(n=>n.hidden)};
   });
   await scenario('G13','keyboard navigation preserves selection authority',async()=>{
     if((await page.evaluate(()=>CEPBlueprint.state.surface.mode))!=='read'){await page.evaluate(()=>CEPBlueprint.setMode('read'));await page.waitForFunction(()=>CEPBlueprint.state.surface.mode==='read')}
     const before=await page.evaluate(()=>CEPFoundation.structured.selectedFragmentIdentity());await page.locator('#editorDocument').focus();await page.keyboard.press('/');await page.waitForFunction(()=>document.activeElement?.id==='kuSearch');const searchFocused=true;await page.keyboard.press('Escape');await page.keyboard.press('F6');
     const after=await page.evaluate(()=>CEPFoundation.structured.selectedFragmentIdentity());assert(searchFocused&&after.owner==='StructuredSelectionKernel'&&JSON.stringify(after.blockIds)===JSON.stringify(before.blockIds),'G13 navigation disturbed selection or search focus failed');return {searchFocused,before,after,activeElement:await page.evaluate(()=>document.activeElement?.id||document.activeElement?.tagName)};
   });
   await page.evaluate(()=>{while(CEPBlueprint.topEscape?.()){};CEPBlueprint.setMode('edit')});await page.waitForFunction(()=>CEPBlueprint.state.surface.mode==='edit');
   await scenario('G17','Library center/context/bottom remain synchronized to kernel selection',async()=>{
     await page.locator('[data-block-id="blk-d05-p1"] .blockbody').first().click();await page.locator('[data-block-id="blk-d05-p-auto-ltr"] .blockbody').first().click();
     const before=await page.evaluate(()=>({selected:CEPBlueprint.state.editor.selectedBlock,descriptor:CEPFoundation.structured.selectedFragmentIdentity(),contextScope:CEPBlueprint.state.surface.contextScope,ku:CEPBlueprint.state.route.activeKu}));
     await page.locator('[data-action="toggle-bottom"]').first().click();const after=await page.evaluate(()=>({selected:CEPBlueprint.state.editor.selectedBlock,descriptor:CEPFoundation.structured.selectedFragmentIdentity(),contextScope:CEPBlueprint.state.surface.contextScope,ku:CEPBlueprint.state.route.activeKu,bottomOpen:CEPBlueprint.state.surface.bottomOpen}));
     assert(before.selected==='blk-d05-p-auto-ltr'&&after.selected===before.selected&&after.descriptor.blockIds[0]===before.selected&&after.ku===before.ku&&after.bottomOpen,'G17 synchronization/selection persistence failed');await snap(page,'FW_B_G17_LIBRARY_SELECTION.png');return {before,after};
   });
   await scenario('G23','clipboard failure remains atomic and does not corrupt selection',async()=>{
     if((await page.evaluate(()=>CEPBlueprint.state.surface.mode))!=='edit'){await page.evaluate(()=>CEPBlueprint.setMode('edit'));await page.waitForFunction(()=>CEPBlueprint.state.surface.mode==='edit')}
     await page.locator('[data-block-id="blk-d05-p1"] .blockbody').first().click();
     const result=await page.evaluate(async()=>{const svc=CEPBlueprint.ClipboardService,original=svc.writePayload;svc.writePayload=async()=>{throw Error('FW_B_CLIPBOARD_UNAVAILABLE_PROBE')};try{const before={exists:!!CEPFoundation.structured.findBlockRef('blk-d05-p1'),selection:CEPFoundation.structured.selectedFragmentIdentity(),count:CEPFoundation.structured.snapshot().blocks.length};const ok=await CEPBlueprint.cutBlock('main','blk-d05-p1');const after={exists:!!CEPFoundation.structured.findBlockRef('blk-d05-p1'),selection:CEPFoundation.structured.selectedFragmentIdentity(),count:CEPFoundation.structured.snapshot().blocks.length};return {ok,before,after}}finally{svc.writePayload=original}});
     assert(result.ok===false&&result.before.exists&&result.after.exists&&result.after.count===result.before.count&&result.after.selection.blockIds.includes('blk-d05-p1'),'G23 atomic cut failure or selection integrity regressed');return result;
   });
   libraryRealCallPath=await page.evaluate(()=>({consumer:CEPFoundation.consumer,host:'accepted Library donor compatibility runtime',domainKind:CEPFoundation.structured.domainKind,selection:CEPFoundation.structured.selectedFragmentIdentity(),selectionOwner:CEPFoundation.structured.selection.owner,selectionPolicyRevision:CEPFoundation.structured.selection.contract.policyRevision,treeOwner:CEPFoundation.structured.treeKernel.owner,transactionOwner:CEPFoundation.structured.transactionOwner.owner,availabilityOwner:CEPFoundation.structured.commandAvailabilityOwner.owner,adapterOwner:CEPFoundation.structured.owner}));
 });
 await withPage(browser,'learn',async page=>{
   page.setDefaultTimeout(8000);
   learnSecondConsumer=await page.evaluate(()=>{
     const s=CEPFoundation.structured,snap=s.snapshot(),ids=snap.blocks.map(b=>b.id),before=s.selectedFragmentIdentity();const selected=s.selectBlockRange(ids[0],ids.at(-1));const hostInspect=CEPFoundation.api.inspect();return {consumer:CEPFoundation.consumer,hostKind:CEPFoundation.api.hostKind,domainKind:s.domainKind,adapterOwner:s.owner,selectionOwner:s.selection.owner,selectionPolicyRevision:s.selection.contract.policyRevision,before,selected,hostStructuredDescriptor:hostInspect.structured,renderedIds:[...document.querySelectorAll('#blockList [data-block-id]')].map(n=>n.dataset.blockId)};
   });
   assert(learnSecondConsumer.hostKind==='DONOR_FREE_WORKSPACE_HOST'&&learnSecondConsumer.selectionOwner==='StructuredSelectionKernel'&&learnSecondConsumer.selected.count===3&&learnSecondConsumer.renderedIds.length===3,'Learn real consumer did not expose/use canonical selection kernel');await snap(page,'FW_B_LEARN_SELECTION_CONSUMER.png');
 });
}finally{await browser.close()}
const sourceIdentity=await canonicalSourceIdentity(root);const required=['G02','G05','G06','G09','G12','G13','G17','G23'];const out={schemaVersion:1,kind:'FW_B_TARGETED_R3_SELECTION_BROWSER_REPLAY',status:required.every(id=>scenarios.find(s=>s.id===id)?.status==='PASS')?'PASS':'FAIL',executedAt:new Date().toISOString(),playwrightResolution,browserExecutable:browserExecutable||'playwright-managed',transport:'in-memory-current-built-esm-graph',sourceIdentity,requiredGoldenIds:required,scenarios,libraryRealCallPath,learnSecondConsumer,screenshots};
await writeFile(new URL('assurance/FW_B_R3_TARGETED_BROWSER_REPLAY.json',root),JSON.stringify(out,null,2)+'\n');
await writeFile(new URL('assurance/FW_B_REAL_CONSUMER_PROOF.json',root),JSON.stringify({schemaVersion:1,kind:'FW_B_LIBRARY_LEARN_REAL_CONSUMER_PROOF',status:out.status==='PASS'?'PASS':'FAIL',sourceIdentity,library:libraryRealCallPath,learn:learnSecondConsumer},null,2)+'\n');
console.log(JSON.stringify({status:out.status,scenarios:scenarios.map(s=>[s.id,s.status]),libraryOwner:libraryRealCallPath?.selectionOwner,learnOwner:learnSecondConsumer?.selectionOwner},null,2));if(out.status!=='PASS')process.exitCode=1;
