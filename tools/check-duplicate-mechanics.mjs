import {readFile,readdir,writeFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url),sourceRoot=new URL('dist/',root);
async function walk(dir,prefix=''){let files=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.name==='reference')continue;const path=prefix+entry.name;if(entry.isDirectory())files.push(...await walk(new URL(entry.name+'/',dir),path+'/'));else if(entry.name.endsWith('.js'))files.push(path)}return files}
const files=(await walk(sourceRoot)).filter(file=>file!=='model-tests.js'),content=new Map(await Promise.all(files.map(async file=>[file,await readFile(new URL(file,sourceRoot),'utf8')])));
function extractMethodBody(source,className,methodName){
 const classIndex=source.indexOf(`class ${className}`);if(classIndex<0)return '';
 const signature=new RegExp(`\\b${methodName}\\s*\\(`,'g');signature.lastIndex=classIndex;const match=signature.exec(source);if(!match)return '';
 let paren=source.indexOf('(',match.index),parenDepth=0,quote=null,escape=false,closeParen=-1;
 for(let i=paren;i<source.length;i++){const ch=source[i];if(escape){escape=false;continue}if(quote){if(ch==='\\'){escape=true;continue}if(ch===quote)quote=null;continue}if(ch==="'"||ch==='"'||ch==='`'){quote=ch;continue}if(ch==='(')parenDepth++;else if(ch===')'&&--parenDepth===0){closeParen=i;break}}
 if(closeParen<0)return '';const brace=source.indexOf('{',closeParen+1);if(brace<0)return '';
 let depth=0;quote=null;escape=false;
 for(let i=brace;i<source.length;i++){const ch=source[i];if(escape){escape=false;continue}if(quote){if(ch==='\\'){escape=true;continue}if(ch===quote)quote=null;continue}if(ch==="'"||ch==='"'||ch==='`'){quote=ch;continue}if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return source.slice(brace+1,i)}
 return '';
}
function structuredCompatibilityOwnership(source){
 const insert=extractMethodBody(source,'StructuredDocumentDomainAdapter','insertBlock'),remove=extractMethodBody(source,'StructuredDocumentDomainAdapter','removeBlock'),update=extractMethodBody(source,'StructuredDocumentDomainAdapter','updateBlock');
 const directStructural=/\.blocks\s*\.splice\s*\(|doc\.blocks\s*=|\.blocks\s*\.filter\s*\(/;
 return [
  {id:'structured.compat.insert-canonical',status:/this\.mutateStructure\s*\(\s*\{\s*type\s*:\s*['"]insert['"]/.test(insert)&&!directStructural.test(insert)?'PASS':'FAIL',method:'insertBlock'},
  {id:'structured.compat.remove-canonical',status:/this\.mutateStructure\s*\(\s*\{\s*type\s*:\s*['"]remove['"]/.test(remove)&&!directStructural.test(remove)?'PASS':'FAIL',method:'removeBlock'},
  {id:'structured.compat.update-nonstructural-only',status:/STRUCTURED_NON_STRUCTURAL_PATCH_FIELDS/.test(update)&&/STRUCTURAL_UPDATE_REQUIRES_MUTATION_KERNEL/.test(update)&&!/(?:\.type|\.children|\.id|\.indent)\s*=|Object\.assign\s*\(\s*[^,]+\s*,\s*clone\s*\(\s*patch\s*\)/.test(update)?'PASS':'FAIL',method:'updateBlock'}
 ];
}
const rules=[
 {mechanicId:'relation.edit',pattern:/class\s+(?:RelationInteraction|(?:Visualize|Enterprise|Scenario|Lab)RelationManager)\b|className\s*=\s*['"]relation-composer['"]|register\(['"]spatial\.relation\.commit['"]/g,owners:['foundation/relations.js']},
 {mechanicId:'action.availability',pattern:/class\s+ActionAvailabilityCore\b/g,owners:['foundation/models.js']},
 {mechanicId:'spatial.context-suppression',pattern:/class\s+ContextSuppressionGate\b/g,owners:['foundation/spatial.js']},
 {mechanicId:'workspace.panes',pattern:/class\s+(?:PaneLayoutController|(?:Visualize|Library|Scenario|Lab)PaneManager)\b/g,owners:['foundation/workspace-host.js']},
 {mechanicId:'workspace.context-inspector',pattern:/class\s+(?:ContextInspectorHost|(?:Visualize|Library|Scenario|Lab)ContextInspector)\b/g,owners:['foundation/global/context-inspector.js']},
 {mechanicId:'global.input-keymap',pattern:/class\s+GlobalInputKeymapOwner\b/g,owners:['foundation/global/input-keymap.js']},
 {mechanicId:'global.accessibility-feedback',pattern:/class\s+AccessibilityFeedbackOwner\b/g,owners:['foundation/global/feedback.js']},
 {mechanicId:'workspace.bottom-deep-work',pattern:/class\s+BottomDeepWorkOwner\b/g,owners:['foundation/global/bottom-shelf.js']},
 {mechanicId:'global.ui-scale',pattern:/class\s+UIScalePolicyOwner\b/g,owners:['foundation/global/preferences/ui-scale.js']},
 {mechanicId:'operational.sessions',pattern:/class\s+(?:OperationalView|SessionPresentation|(?:Runs|Lab|Scenario)SessionManager)\b|new\s+SessionPresentation\b|register\(['"]runtime\.input['"]/g,owners:['foundation/operational.js','foundation/models.js']},
 {mechanicId:'structured.document',pattern:/class\s+StructuredDocumentDomainAdapter\b/g,owners:['foundation/structured.js']},
 {mechanicId:'structured.mutation',pattern:/class\s+StructuredMutationKernel\b|const\s+STRUCTURED_MUTATION_KERNEL\s*=/g,owners:['foundation/structured.js']},
 {mechanicId:'structured.selection-clipboard',pattern:/class\s+StructuredSelectionModel\b|STRUCTURED_CLIPBOARD_CONTRACT/g,owners:['foundation/structured.js']},
 {mechanicId:'structured.transaction-history-recovery',pattern:/class\s+(?:StructuredTransactionHistoryRecoveryOwner|(?:Library|Learn|Donor)HistoryRecoveryEngine)\b/g,owners:['foundation/structured.js']},
];
const findings=[];
for(const rule of rules){for(const [file,text] of content){const matches=[...text.matchAll(rule.pattern)].map(match=>({index:match.index,text:match[0]}));if(matches.length&&!rule.owners.includes(file))findings.push({mechanicId:rule.mechanicId,status:'POSSIBLE_DUPLICATE_SHARED_MECHANIC',file,matches})}}
const duplicateFixtures=[
 {id:'duplicate.relation',file:'fixture/visualize.js',source:'class VisualizeRelationManager {}',mechanicId:'relation.edit'},
 {id:'duplicate.pane',file:'fixture/library.js',source:'class LibraryPaneManager {}',mechanicId:'workspace.panes'},
 {id:'duplicate.context',file:'fixture/scenario.js',source:'class ScenarioContextInspector {}',mechanicId:'workspace.context-inspector'},
 {id:'duplicate.session',file:'fixture/runs.js',source:'class RunsSessionManager {}',mechanicId:'operational.sessions'},
 {id:'duplicate.structured-mutation',file:'fixture/library.js',source:'class StructuredMutationKernel {}',mechanicId:'structured.mutation'},
 {id:'duplicate.structured-history',file:'fixture/library.js',source:'class LibraryHistoryRecoveryEngine {}',mechanicId:'structured.transaction-history-recovery'}
];
const fixtureTests=duplicateFixtures.filter(fixture=>fixture.id!=='duplicate.structured-history').map(fixture=>{const rule=rules.find(item=>item.mechanicId===fixture.mechanicId),flagged=!!rule&&[...fixture.source.matchAll(new RegExp(rule.pattern.source,rule.pattern.flags))].length>0&&!rule.owners.includes(fixture.file);return {id:fixture.id,status:flagged?'PASS':'FAIL',expected:'POSSIBLE_DUPLICATE_SHARED_MECHANIC',mechanicId:fixture.mechanicId}});
const fixtureFail=fixtureTests.filter(test=>test.status==='FAIL').length;
const ownershipGuards=structuredCompatibilityOwnership(content.get('foundation/structured.js')||'');
const bypassFixture=`class StructuredDocumentDomainAdapter { insertBlock(block,index){return this.transact('x',doc=>doc.blocks.splice(index,0,block))} removeBlock(id){return this.transact('x',doc=>doc.blocks.splice(0,1))} updateBlock(id,patch){return this.transact('x',doc=>Object.assign(doc.blocks[0],clone(patch)))} }`;
const bypassFixtureResult=structuredCompatibilityOwnership(bypassFixture),ownershipFixture={id:'structured.compatibility-bypass-fixture',status:bypassFixtureResult.every(item=>item.status==='FAIL')?'PASS':'FAIL',expected:'ALL_THREE_BYPASSES_DETECTED',observed:bypassFixtureResult};
const ownershipFail=ownershipGuards.some(item=>item.status==='FAIL')||ownershipFixture.status==='FAIL';
function structuredHistoryRecoveryOwnership(structuredSource,runtimeSource){
 const adapterCommit=extractMethodBody(structuredSource,'StructuredDocumentDomainAdapter','commit');
 const ownerCommit=extractMethodBody(structuredSource,'StructuredTransactionHistoryRecoveryOwner','commit');
 const ownerRecord=extractMethodBody(structuredSource,'StructuredTransactionHistoryRecoveryOwner','record');
 const checks=[
  {id:'structured.history.canonical-owner',status:/class\s+StructuredTransactionHistoryRecoveryOwner\b/.test(structuredSource)&&/transactionOwner=new StructuredTransactionHistoryRecoveryOwner/.test(structuredSource)?'PASS':'FAIL'},
  {id:'structured.history.adapter-delegates',status:/commit\(options=\{\}\)\{[^\n]*this\.transactionOwner\.commit\(options\)/.test(structuredSource)&&/undo\(\)\{const result=this\.transactionOwner\.undo\s*\(/.test(structuredSource)&&/redo\(\)\{const result=this\.transactionOwner\.redo\s*\(/.test(structuredSource)?'PASS':'FAIL'},
  {id:'structured.history.no-fake-save',status:/SAVE_BOUNDARY_UNAVAILABLE/.test(ownerCommit)&&/persisted:false/.test(ownerCommit)&&!/\|\|\s*\{\s*ok\s*:\s*true/.test(ownerCommit)?'PASS':'FAIL'},
  {id:'structured.history.one-frame-owner',status:/s\.history\.push\s*\(frame\)/.test(ownerRecord)&&/s\.history=s\.history\.slice/.test(ownerRecord)?'PASS':'FAIL'},
  {id:'library.history.projects-canonical',status:/acceptExternalTransaction/.test(runtimeSource)&&/extension\.execute\(['"]history\.undo['"]/.test(runtimeSource)&&/extension\.execute\(['"]history\.redo['"]/.test(runtimeSource)&&/applyStructuredProjection/.test(runtimeSource)?'PASS':'FAIL'},
  {id:'library.recovery-delegates-canonical',status:/structuredAdapter\?\.captureRecovery/.test(runtimeSource)&&/structuredAdapter\?\.listRecovery/.test(runtimeSource)&&/extension\.execute\(['"]document\.recoverAsNew['"]/.test(runtimeSource)&&!/state\.recovery\b/.test(runtimeSource)?'PASS':'FAIL'},
  {id:'library.no-direct-working-bump',status:!/markWorkingChange\s*\(/.test(runtimeSource)?'PASS':'FAIL'},
  {id:'library.save-truth',status:/SAVE_BOUNDARY_UNAVAILABLE/.test(runtimeSource)&&/receipt\?\.persisted/.test(runtimeSource)&&!/state\.editor\.dirty\s*=\s*false/.test(runtimeSource)?'PASS':'FAIL'}
 ];return checks;
}
const historyRecoveryGuards=structuredHistoryRecoveryOwnership(content.get('foundation/structured.js')||'',content.get('foundation/accepted-runtime.js')||'');
const historyRecoveryNegativeStructured=`class StructuredTransactionHistoryRecoveryOwner { record(){this.history.push({})} commit(){return this.saveBoundary?.()||{ok:true,revision:'fake'}} } class StructuredDocumentDomainAdapter { commit(){return {ok:true}} undo(){return true} redo(){return true} }`;
const historyRecoveryNegativeRuntime=`const state={recovery:{byKu:{}}}; function pushHistory(){state.editor.history.push({}); markWorkingChange('x')} function undo(){state.editor.historyIndex--} function redo(){state.editor.historyIndex++} const RecoveryService={capture(){state.recovery.byKu.x=[]},list(){return []},restoreAsNew(){}}; function explicitSaveSimulation(){state.editor.dirty=false; setSaveState('saved','saved')}`;
const historyRecoveryNegativeObserved=structuredHistoryRecoveryOwnership(historyRecoveryNegativeStructured,historyRecoveryNegativeRuntime),historyRecoveryNegativeFixture={id:'structured.history-recovery-negative-fixture',status:historyRecoveryNegativeObserved.every(x=>x.status==='FAIL')?'PASS':'FAIL',expected:'ALL_HISTORY_RECOVERY_OWNERSHIP_GUARDS_FAIL',observed:historyRecoveryNegativeObserved};
const historyRecoveryFail=historyRecoveryGuards.some(x=>x.status==='FAIL')||historyRecoveryNegativeFixture.status==='FAIL';

const CANONICAL_OWNER_NAMES=Object.freeze(['AnalyticalCompareOwner','TimelineReplayOwner','ContextInspectorHost','BottomDeepWorkOwner','OperationalSessionOwner']);
const silentOwnerFallbackPattern=new RegExp(`(?:\\|\\||\\?\\?)\\s*new\\s+(?:${CANONICAL_OWNER_NAMES.join('|')})\\s*\\(`,'g');
const domProductFallbackPatterns=Object.freeze([
  /renderer\s*=\s*new\s+DomTerminalRendererAdapter\s*\(/g,
  /renderer\s*\|\|\s*new\s+DomTerminalRendererAdapter\s*\(/g
]);
function sharedHostConstructionDefects(source,{requiredHosts=[]}={}){
  const duplicateCanonicalInstances=[...source.matchAll(silentOwnerFallbackPattern)].map(match=>match[0]);
  const forbiddenProductFallbacks=domProductFallbackPatterns.flatMap(pattern=>[...source.matchAll(new RegExp(pattern.source,pattern.flags))].map(match=>match[0]));
  const deadRequiredHosts=requiredHosts.filter(host=>!new RegExp(`new\\s+${host}\\s*\\(`).test(source));
  const consumerPropagationFailures=[];
  if(/new\s+TimelineReplayHost\s*\([^,]+,\s*new\s+TimelineReplayOwner\s*\(/.test(source))consumerPropagationFailures.push('TimelineReplayHost');
  if(/new\s+AnalyticalCompareHost\s*\(\s*new\s+AnalyticalCompareOwner\s*\(/.test(source))consumerPropagationFailures.push('AnalyticalCompareHost');
  return {duplicateCanonicalInstances,deadRequiredHosts,forbiddenProductFallbacks,consumerPropagationFailures};
}
const d03cBindings=Object.freeze([
  {id:'results.reusable-host-binding',file:'adapters/results/domain.js',requiredHosts:['CollectionTableMatrixHost','TimelineReplayHost','AnalyticalCompareHost'],requiredTokens:['RESULTS_SHARED_TIMELINE_REPLAY_OWNER_REQUIRED','RESULTS_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED','domain.replayOwner','domain.compareOwner','finalRouteMounted:false']},
  {id:'rq.reusable-host-binding',file:'adapters/rq/domain.js',requiredHosts:['CollectionTableMatrixHost','AnalyticalCompareHost'],requiredTokens:['RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED','domain.compareOwner','finalRouteMounted:false']}
]);
const d03cBindingGuards=d03cBindings.map(binding=>{
  const source=content.get(binding.file)||'',defects=sharedHostConstructionDefects(source,binding),missingTokens=binding.requiredTokens.filter(token=>!source.includes(token));
  return {id:binding.id,status:source&&Object.values(defects).every(items=>items.length===0)&&missingTokens.length===0?'PASS':'FAIL',file:binding.file,requiredHosts:binding.requiredHosts,missingTokens,defects};
});
const operationalSource=content.get('foundation/operational.js')||'',terminalHostSource=content.get('foundation/operational/terminal-host.js')||'',bottomSource=content.get('foundation/global/bottom-shelf.js')||'',wave3Source=content.get('foundation/wave3-assembly.js')||'';
const d03cRuntimeGuards=[
  {id:'terminal.dom-fallback-product-unreachable',status:/OPERATIONAL_VIEW_RETIRED_USE_OPERATIONAL_TERMINAL_HOST_XTERM/.test(operationalSource)&&/productReachable\s*=\s*false/.test(operationalSource)&&sharedHostConstructionDefects(operationalSource).forbiddenProductFallbacks.length===0?'PASS':'FAIL'},
  {id:'terminal.xterm-canonical-product-renderer',status:/new\s+XtermOperationalTerminalRenderer\s*\(/.test(terminalHostSource)&&/TERMINAL_PRODUCT_RENDERER_MUST_BE_XTERM/.test(terminalHostSource)?'PASS':'FAIL'},
  {id:'bottom.zero-provider-truthful-unavailable',status:/BOTTOM_PROVIDER_UNAVAILABLE/.test(bottomSource)&&/status:\s*['"]UNAVAILABLE['"]/.test(bottomSource)&&/toggle\.disabled\s*=\s*!snapshot\.providerCount/.test(bottomSource)?'PASS':'FAIL'},
  {id:'bottom.provider-propagation-reachable',status:/bottomProviders\s*=\s*\[\]/.test(wave3Source)&&/registerBottomProvider\s*\(/.test(wave3Source)&&/providers=\[\.\.\.this\.bottomProviders\]/.test(wave3Source)?'PASS':'FAIL'}
];
const d03cNegativeSources=Object.freeze([
  {id:'duplicate-canonical-instance',source:'class Consumer { constructor(owner){ this.owner=owner||new AnalyticalCompareOwner(); } }',options:{},field:'duplicateCanonicalInstances'},
  {id:'dead-required-host',source:'export function bind(){ return {reachable:true}; }',options:{requiredHosts:['AnalyticalCompareHost']},field:'deadRequiredHosts'},
  {id:'forbidden-production-fallback',source:'class ProductTerminal { constructor(renderer=new DomTerminalRendererAdapter()){} }',options:{},field:'forbiddenProductFallbacks'},
  {id:'consumer-propagation-failure',source:'const host=new AnalyticalCompareHost(new AnalyticalCompareOwner());',options:{},field:'consumerPropagationFailures'}
]);
const d03cNegativeProbes=d03cNegativeSources.map(probe=>{const observed=sharedHostConstructionDefects(probe.source,probe.options)[probe.field];return {id:probe.id,status:observed.length?'PASS':'FAIL',expected:`${probe.field}:NON_EMPTY`,observed};});
const d03cFail=d03cBindingGuards.some(item=>item.status==='FAIL')||d03cRuntimeGuards.some(item=>item.status==='FAIL')||d03cNegativeProbes.some(item=>item.status==='FAIL');

const result={schemaVersion:5,status:findings.length||fixtureFail||ownershipFail||historyRecoveryFail||d03cFail?'FAIL':'PASS',filesScanned:files.length,rules:rules.map(rule=>({mechanicId:rule.mechanicId,approvedOwners:rule.owners})),findings,fixtureTests,ownershipGuards,ownershipFixture,historyRecoveryGuards,historyRecoveryNegativeFixture,d03cBindingGuards,d03cRuntimeGuards,d03cNegativeProbes,deferredExceptions:[],limits:'Deterministic symbol/registration heuristic plus executable Structured mutation, transaction/history/recovery, and reusable-host construction gates with deliberate negative probes; novel naming still requires semantic review.'};
await writeFile(new URL('assurance/DUPLICATE_MECHANIC_SCAN.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(findings.length||fixtureFail||ownershipFail||historyRecoveryFail||d03cFail)process.exitCode=1;
