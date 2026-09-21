import {readFile,writeFile,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const selectionFiles=['stack/native-typescript/foundation/spatial/selection-kernel.ts','stack/native-typescript/foundation/spatial/accessible-navigator.ts','stack/native-typescript/foundation/spatial/focus-contract.ts'];
const texts=Object.fromEntries(await Promise.all(selectionFiles.map(async path=>[path,await readFile(new URL(path,root),'utf8')])));
const all=Object.values(texts).join('\n');
const canonical=await (async()=>{const dir=new URL('stack/native-typescript/',root),rows=[];const walk=async(url,prefix='')=>{for(const e of await readdir(url,{withFileTypes:true})){const rel=prefix+e.name,u=new URL(e.name+(e.isDirectory()?'/':''),url);if(e.isDirectory())await walk(u,rel+'/');else rows.push([rel,await readFile(u,'utf8')])}};await walk(dir);return rows})();
const sourceAll=canonical.map(([,text])=>text).join('\n');
const checks={
 noDomOrSvgCanonicalState:!/(?:\bdocument\b|\bwindow\b|\bHTMLElement\b|\bSVGElement\b|\bElement\b)/.test(all),
 noGhostSemanticSpatialNavigator:!sourceAll.includes('SemanticSpatialNavigator'),
 noW03DonorUiCopy:!/(?:w03-v3\.4.*css|donor\.css|VisualizationSurface\.vue|resources\/js\/pages)/i.test(all),
 canonicalSelectionReceiptIdsOnly:/selectedIds/.test(texts['stack/native-typescript/foundation/spatial/selection-kernel.ts'])&&!/selectedNodes|selectedElements|selectedSvg/i.test(all),
 explicitUnknownEndpointRejection:sourceAll.includes('UNKNOWN_SPATIAL_ENDPOINT'),
 explicitSpatialOwner:sourceAll.includes("SPATIAL_SELECTION_OWNER_ID='SpatialSelectionNavigationKernel'"),
 recordedModeFeedsSelectionReceipt:sourceAll.includes("spatial.setActiveMode(view==='recorded'?'recorded':consumer==='runs'?'live':'author')"),
 geometryMutationCentralGuard:sourceAll.includes('geometryMutationAvailability')&&sourceAll.includes("code:'MODE_FORBIDS_ACTION'"),
 alignDistributeRegistryUseGuard:sourceAll.includes("minimumSelection:2,action:'spatial.align'")&&sourceAll.includes("minimumSelection:3,action:'spatial.distribute'"),
 historyCommandsUseGuard:sourceAll.includes("action:'spatial.undo'")&&sourceAll.includes("action:'spatial.redo'"),
 directGeometryMethodsGuarded:/move\(ids,dx,dy\)\{if\(!this\.canMutateGeometry\(\)\)return false/.test(sourceAll)&&/align\(axis\)\{if\(!this\.canMutateGeometry\(\)\)return false/.test(sourceAll)&&/distribute\(axis\)\{if\(!this\.canMutateGeometry\(\)\)return false/.test(sourceAll)
};
const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k),proof={status:failed.length?'FAIL':'PASS',mission:'FW-C-SPATIAL-SELECTION-NAVIGATION',checks,failed,scannedSelectionFiles:selectionFiles,scope:'static negative scan; parent-byte preservation is proved separately by exact changed-path receipt'};
await writeFile(new URL('assurance/FW_C_NEGATIVE_SCAN_PROOF.json',root),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof,null,2));if(failed.length)process.exitCode=1;
