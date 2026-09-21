import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const nativeRoot=path.resolve(here,'../../..');
const runtimePath=path.join(nativeRoot,'foundation','accepted-runtime.ts');
const source=fs.readFileSync(runtimePath,'utf8');
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const cases=[];
const run=(id,fn)=>{try{cases.push({id,status:'PASS',evidence:fn()})}catch(error){cases.push({id,status:'FAIL',error:String(error?.stack||error)})}};

run('authorized-source-only-secondary-route',()=>{
  assert(source.includes("function routeAcceptedRuntimeSecondaryParagraph(target)"),'bounded route binder missing');
  assert(source.includes("extension.noteRuntime.surfaceHost(noteId),result=host.routeInsertionGapDirectParagraph(target)"),'Sticky route does not consume canonical Structured direct-Paragraph host seam');
  assert(source.includes("result=extension.execute('block.insert',structuredCommandContext('main'"),'main route does not invoke canonical block.insert command seam');
  assert(source.includes("gap?.dataset.interactive==='true'"),'accepted-runtime gap availability is not honored');
  return {main:'extension.execute(block.insert) → StructuredDocumentDomainAdapter transaction owner',sticky:'existing StructuredSurfaceHost.routeInsertionGapDirectParagraph',availability:'rendered canonical gap state'};
});

run('left-and-keyboard-remain-chooser-only',()=>{
  assert(source.includes("const gap=e.target.closest('[data-insert-gap]');if(gap){const g=gap.closest('.gap');openInsertion(deriveGapTarget(g),gap);return}"),'left-click chooser route drifted');
  assert(source.includes("if(gap&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openInsertion(deriveGapTarget(gap.closest('.gap')),gap);return}"),'keyboard chooser route drifted');
  return {primary:'chooser',keyboard:'chooser'};
});

run('right-click-no-chooser-no-direct-array-bypass',()=>{
  const handler=source.match(/document\.addEventListener\('contextmenu',[\s\S]*?\);\n\s*document\.addEventListener\('pointerdown'/)?.[0]||source.match(/document\.addEventListener\('contextmenu',[\s\S]*?\);\n\s*window\.addEventListener\('resize'/)?.[0]||'';
  assert(handler.includes('routeAcceptedRuntimeSecondaryParagraph(target)'),'contextmenu does not route through bounded canonical binder');
  assert(!handler.includes('openInsertion(target,plus)'),'right-click still opens chooser');
  assert(!/\.splice\(|\.push\(|blocks\s*=/.test(handler),'contextmenu contains direct array mutation');
  return {chooserCall:false,directArrayMutation:false};
});

run('no-second-owner-or-final-route-mutation',()=>{
  assert(!/class\s+.*Insertion|new\s+StructuredSurfaceHost/.test(source),'accepted-runtime introduced a second insertion/StructuredSurfaceHost owner');
  assert(!source.includes('R6_FINAL')&&!source.includes('whole-surface-final-cutover'),'R6 final routing marker introduced');
  return {duplicateOwner:false,r6FinalWiring:false};
});

const failed=cases.filter(c=>c.status!=='PASS');
console.log(JSON.stringify({suite:'CG1_CORR01_OD054_SOURCE_CONTRACT',summary:{total:cases.length,pass:cases.length-failed.length,fail:failed.length},cases},null,2));
if(failed.length)process.exit(1);
