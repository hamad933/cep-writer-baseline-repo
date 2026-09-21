import {launch,withPage,assert} from './fw-b-browser-support.mjs';
const browser=await launch();const result={};
try{
 result.library=await withPage(browser,'library',async page=>page.evaluate(()=>{const s=CEPFoundation.structured;const d=s.selectBlockRange('blk-d05-p1','blk-d05-p-auto-ltr');return {consumer:CEPFoundation.consumer,owner:d.owner,policyRevision:d.policyRevision,rangeEndpoint:d.policy.rangeEndpoint,blockIds:d.blockIds,coveredBlockIds:d.coveredBlockIds,count:d.count,coveredCount:d.coveredCount,actionAvailability:{copy:s.availability('document.copy').enabled,cut:s.availability('document.cut').enabled}}}));
 result.learn=await withPage(browser,'learn',async page=>page.evaluate(()=>{const s=CEPFoundation.structured,ids=s.snapshot().blocks.map(b=>b.id),d=s.selectBlockRange(ids[0],ids.at(-1));return {consumer:CEPFoundation.consumer,hostKind:CEPFoundation.api.hostKind,owner:d.owner,policyRevision:d.policyRevision,rangeEndpoint:d.policy.rangeEndpoint,range:[ids[0],ids.at(-1)],blockIds:d.blockIds,coveredBlockIds:d.coveredBlockIds,count:d.count,coveredCount:d.coveredCount,actionAvailability:{copy:s.availability('document.copy').enabled,cut:s.availability('document.cut').enabled}}}));
 assert(result.library.owner==='StructuredSelectionKernel'&&result.learn.owner==='StructuredSelectionKernel','OWNER_DIVERGENCE');
}finally{await browser.close()}
console.log(JSON.stringify(result));
