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

const result={schemaVersion:4,status:findings.length||fixtureFail||ownershipFail||historyRecoveryFail?'FAIL':'PASS',filesScanned:files.length,rules:rules.map(rule=>({mechanicId:rule.mechanicId,approvedOwners:rule.owners})),findings,fixtureTests,ownershipGuards,ownershipFixture,historyRecoveryGuards,historyRecoveryNegativeFixture,deferredExceptions:[],limits:'Deterministic symbol/registration heuristic plus executable Structured mutation and transaction/history/recovery semantic ownership gates with deliberate negative fixtures; novel naming still requires semantic review.'};
await writeFile(new URL('assurance/DUPLICATE_MECHANIC_SCAN.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(findings.length||fixtureFail||ownershipFail||historyRecoveryFail)process.exitCode=1;
