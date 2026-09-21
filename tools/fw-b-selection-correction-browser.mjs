import {writeFile} from 'node:fs/promises';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {launch,withPage,assert,playwrightResolution,browserExecutable} from './fw-b-browser-support.mjs';
const root=new URL('../',import.meta.url);
const browser=await launch();
const consumers={};
try{
  for(const surface of ['library','learn']){
    consumers[surface]=await withPage(browser,surface,async page=>page.evaluate(async surface=>{
      const a=CEPFoundation.structured;
      const roots=a.snapshot().blocks.slice(0,3).map(block=>block.id);
      if(roots.length!==3)throw Error(`${surface}:THREE_ROOT_BLOCKS_REQUIRED`);
      const [first,second,third]=roots;
      const initial=a.selectBlockRange(first,third);
      const staleBookmark=a.selectionBookmark();
      a.removeBlock(first);
      const afterDelete=a.selectedFragmentIdentity();
      const repairedBookmark=a.selectionBookmark();
      a.clearSelection();
      const staleProjected=a.projectSelectionBookmark(staleBookmark);
      a.projectSelectionBookmark(repairedBookmark);
      a.undo();
      const afterUndo=a.selectedFragmentIdentity();
      a.redo();
      const afterRedo=a.selectedFragmentIdentity();
      const recovery=a.captureRecovery('fw-b-stale-range-correction');
      a.undo();
      a.recoverAsNew(recovery.id);
      const afterRecovery=a.projectSelectionBookmark(repairedBookmark);
      return {surface,roots,initial,staleBookmark,afterDelete,repairedBookmark,staleProjected,afterUndo,afterRedo,recovery,afterRecovery,selectionReceipts:a.selectionReceipts().slice(-16),transaction:a.transactionDescriptor()};
    },surface));
  }
}finally{await browser.close()}
const valid=d=>d.blockIds.length===2&&d.blockIds[0]!==null&&d.range&&d.anchorBlockId===d.range.anchorBlockId&&d.focusBlockId===d.range.focusBlockId&&d.range.rawBlockIds.join()===d.blockIds.join()&&d.range.direction==='forward';
for(const [surface,e] of Object.entries(consumers)){
  const expected=e.roots.slice(1).join();
  for(const key of ['afterDelete','repairedBookmark','staleProjected','afterUndo','afterRedo','afterRecovery']){
    const d=e[key];
    if(key==='repairedBookmark'){
      assert(d.blockIds.join()===expected&&d.anchorBlockId===d.range.anchorBlockId&&d.focusBlockId===d.range.focusBlockId&&d.range.rawBlockIds.join()===expected,`${surface}:${key}:bookmark mismatch`);
    }else assert(valid(d)&&d.blockIds.join()===expected,`${surface}:${key}:repaired selection mismatch`);
  }
}
const sourceIdentity=await canonicalSourceIdentity(root);
const out={schemaVersion:1,kind:'FW_B_BOUNDED_CORRECTION_LIBRARY_LEARN_BROWSER_PROOF',status:'PASS',generatedAt:new Date().toISOString(),playwrightResolution,browserExecutable:browserExecutable||'playwright-managed',transport:'in-memory-current-built-esm-graph',sourceIdentity,defect:'stale top-level range repair previously left nested range endpoints stale and bookmark projection could clear surviving selection',consumers};
await writeFile(new URL('assurance/FW_B_CORRECTION_LIBRARY_LEARN_PROOF.json',root),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:out.status,sourceIdentity:sourceIdentity.sha256,consumers:Object.fromEntries(Object.entries(consumers).map(([k,v])=>[k,{roots:v.roots,afterDelete:v.afterDelete.blockIds,staleProjected:v.staleProjected.blockIds,afterUndo:v.afterUndo.blockIds,afterRedo:v.afterRedo.blockIds,afterRecovery:v.afterRecovery.blockIds}]))},null,2));
