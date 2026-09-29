/**
 * Spatial presentation slot probe — proves the enriched shared primitives
 * (F3) expose the reference vocabulary to all consumers without each
 * inventing it: node-card slots (id chip · icon tile · title · secondary ·
 * status chip · progress · tags) and edge label + styleClass
 * (canonical | related | currentPath | canvasOnly).
 *
 * Renders the shared primitives directly from dist and records byte evidence.
 */
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSpatialNode,renderSpatialRelation} from '../dist/foundation/spatial/presentation.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const outDir=path.join(root,'writer-output/_coordinator/shared-component-fix2/evidence');

const richNode={id:'b6-rep-ku-d05-0021',label:'KU-D05-0021 — API Object-Level Authorization',x:0,y:0,kind:'ku',canonicalRef:{objectId:'KU-D05-0021'},subtitle:'مصادر سجلات ومراقبة',status:'مكتمل جزئيا',tags:['SIEM','SOC']};
const progressNode={id:'b6-rep-ku-d03-0004',label:'Browser Session Secrets and Cookie Lifecycle',x:0,y:0,kind:'ku',canonicalRef:{objectId:'KU-D03-0004'},progress:{value:2,max:3},progressText:'2/3'};
const plainNode={id:'device-1',label:'Web Application',x:0,y:0,status:'UP'};
const dupNode={id:'b6-rep-ku-d05-0021--canvas-rep-2',label:'KU-D05-0021 — API Object-Level Authorization',x:0,y:0,presentationState:{duplicateOf:'b6-rep-ku-d05-0021'}};
const edges=[
  {edge:{id:'e-canonical',type:'depends',label:'Linear Dependency',direction:'directed'},styleClass:'canonical'},
  {edge:{id:'e-related',type:'optional',label:'Optional Branch',direction:'directed'},styleClass:'related'},
  {edge:{id:'e-current',type:'currentPath',label:'المسار الحالي',direction:'directed'},styleClass:'currentPath'},
  {edge:{id:'e-canvas',type:'canvas-only',kind:'canvas-presentation',label:'Canvas-only',presentationOnly:true,direction:'directed'},styleClass:'canvasOnly'}
];

const results={schemaVersion:1,proof:'shared-component-spatial-slot-probe2',nodeRenders:{},edgeRenders:{}};
const rich=renderSpatialNode({node:richNode,selected:true});
const progress=renderSpatialNode({node:progressNode});
const plain=renderSpatialNode({node:plainNode});
const dup=renderSpatialNode({node:dupNode});
results.nodeRenders.rich={sha256:createHash('sha256').update(rich).digest('hex'),slots:{idChip:rich.includes('node-id-chip'),iconTile:rich.includes('node-icon-tile'),title:rich.includes('node-title'),secondaryLine:rich.includes('node-secondary-line'),statusChip:rich.includes('node-status-chip'),tags:rich.includes('node-tags')},footprint:{width:132,height:62}};
results.nodeRenders.progress={sha256:createHash('sha256').update(progress).digest('hex'),slots:{progress:progress.includes('node-progress'),idChip:progress.includes('node-id-chip')},footprint:{width:132,height:62}};
results.nodeRenders.plain={sha256:createHash('sha256').update(plain).digest('hex'),slots:{idChip:plain.includes('node-id-chip'),iconTile:plain.includes('node-icon-tile'),title:plain.includes('node-title'),statusChip:plain.includes('node-status-chip')},footprint:{width:132,height:62}};
results.nodeRenders.duplicate={sha256:createHash('sha256').update(dup).digest('hex'),duplicateClass:dup.includes('spatial-node-duplicate')};
for(const item of edges){
  const html=renderSpatialRelation({edge:item.edge,source:{id:'a',label:'A',x:0,y:0},target:{id:'b',label:'B',x:300,y:0},markerId:'probe-marker'});
  const token=item.styleClass==='currentPath'?'current-path':item.styleClass==='canvasOnly'?'canvas-only':item.styleClass.toLowerCase();
  results.edgeRenders[item.styleClass]={sha256:createHash('sha256').update(html).digest('hex'),classPresent:html.includes(`spatial-relation-${token}`),labelled:html.includes('data-relation-label'),labelText:item.styleClass==='canvasOnly'?'[Canvas] Canvas-only':item.edge.label,edgeClassAttr:html.includes(`data-edge-class="${item.styleClass}"`)};
}
await mkdir(outDir,{recursive:true});
await writeFile(path.join(outDir,'spatial-slot-probe.json'),JSON.stringify(results,null,2));
await writeFile(path.join(outDir,'spatial-slot-probe.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><g>${plain}${rich}</g></svg>`);
console.log(JSON.stringify(results.nodeRenders.rich.slots),JSON.stringify(Object.fromEntries(Object.entries(results.edgeRenders).map(([k,v])=>[k,v.classPresent]))));
