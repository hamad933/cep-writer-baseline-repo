import {readFile} from 'node:fs/promises';
import {CommandRegistry} from '../dist/foundation/models.js';
import {createStructuredConsumerAdapter} from '../dist/adapters/structured-documents.js';
import {STRUCTURE_TREE,FIXTURES,NOTE_FIXTURES} from '../dist/adapters/library-fixtures.js';
import {STRUCTURED_SHARED_COMMAND_IDS,STRUCTURED_COMMAND_AVAILABILITY_CONTRACT,STRUCTURED_COMMAND_MUTABILITY_POLICY,STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS} from '../dist/foundation/structured.js';

const root=new URL('../',import.meta.url);
const runtime=await readFile(new URL('stack/native-typescript/foundation/accepted-runtime.ts',root),'utf8');
const main=await readFile(new URL('stack/native-typescript/main.ts',root),'utf8');
const structured=await readFile(new URL('stack/native-typescript/foundation/structured.ts',root),'utf8');
const checks=[];
const add=(id,ok,detail)=>checks.push({id,status:ok?'PASS':'FAIL',detail});
const library=createStructuredConsumerAdapter('library',{initialDocumentId:'KU-D05-0021',STRUCTURE_TREE,FIXTURES,NOTE_FIXTURES});
const learn=createStructuredConsumerAdapter('learn');
const lr=new CommandRegistry(),nr=new CommandRegistry(),lb=library.bindSharedCommands(lr),nb=learn.bindSharedCommands(nr);
add('catalog.unique',STRUCTURED_SHARED_COMMAND_IDS.length===24&&new Set(STRUCTURED_SHARED_COMMAND_IDS).size===24,{count:STRUCTURED_SHARED_COMMAND_IDS.length});
add('owner.one-registration',STRUCTURED_SHARED_COMMAND_IDS.every(id=>lr.commands.get(id)?.owner==='StructuredDocumentDomainAdapter'&&nr.commands.get(id)?.owner==='StructuredDocumentDomainAdapter'),'Library and Learn bind identical canonical owner');
add('availability.one-owner',lb.availabilityOwner===STRUCTURED_COMMAND_AVAILABILITY_CONTRACT.id&&nb.availabilityOwner===STRUCTURED_COMMAND_AVAILABILITY_CONTRACT.id&&lb.policyRevision===nb.policyRevision,{owner:lb.availabilityOwner,policyRevision:lb.policyRevision});
const readModeMatrix=provider=>STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS.every(id=>{const a=provider(id);return a?.enabled===false&&a?.code==='EDIT_MODE_REQUIRED'&&a?.owner===STRUCTURED_COMMAND_AVAILABILITY_CONTRACT.id});
const readContextFor=id=>{const blocks=learn.snapshot().blocks,first=blocks[0]?.id,second=blocks[1]?.id;return {mode:'read',blockId:id==='block.moveUp'?second:first,value:id==='block.align'?'center':id==='block.direction'?'rtl':id==='block.background'?'soft':undefined,to:id==='block.convert'?'paragraph':undefined,sourceHtml:'x',sourceText:'x',target:id==='block.moveToGap'?{kind:'gap',parentId:null,index:0,depth:0}:id==='block.insert'?{kind:'gap',parentId:null,index:1,depth:0}:undefined,block:id==='block.insert'?{id:'__gate_insert__',type:'paragraph',html:'x'}:undefined,newBlock:id==='block.split'?{id:'__gate_split__',type:'paragraph',html:'x'}:undefined,before:id==='block.split'?'x':undefined};};
add('read-mode.policy-catalog',STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS.length===23&&STRUCTURED_COMMAND_MUTABILITY_POLICY['document.commit']?.readModeAllowed===true&&STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS.every(id=>STRUCTURED_COMMAND_MUTABILITY_POLICY[id]?.persistentDocumentMutation&&STRUCTURED_COMMAND_MUTABILITY_POLICY[id]?.readModeAllowed===false),{persistentMutators:STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS.length,checkpointReadAllowed:STRUCTURED_COMMAND_MUTABILITY_POLICY['document.commit']?.readModeAllowed});
add('read-mode.all-persistent-disabled',readModeMatrix(id=>nr.availability(id,readContextFor(id))),{count:STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS.length,expected:'EDIT_MODE_REQUIRED'});
const readBlock=learn.snapshot().blocks[0].id,readBefore={document:JSON.stringify(learn.snapshot()),transaction:JSON.stringify(learn.transactionDescriptor()),adapterReceipts:learn.receipts.length,registryReceipts:nr.receipts.length},readAvailability=nr.availability('block.align',{mode:'read',blockId:readBlock,value:'center'}),readAttempt=nr.execute('block.align',{mode:'read',blockId:readBlock,value:'center',route:'ownership-read-negative'}),readAfter={document:JSON.stringify(learn.snapshot()),transaction:JSON.stringify(learn.transactionDescriptor()),adapterReceipts:learn.receipts.length,registryReceipts:nr.receipts.length};
add('read-mode.direct-registry-no-mutation',!readAvailability.enabled&&!readAttempt.ok&&readAttempt.code==='EDIT_MODE_REQUIRED'&&JSON.stringify(readBefore)===JSON.stringify(readAfter),{code:readAttempt.code,receiptDelta:readAfter.registryReceipts-readBefore.registryReceipts});
const negativeReadProvider=id=>id==='block.align'?{enabled:true,code:'AVAILABLE',owner:STRUCTURED_COMMAND_AVAILABILITY_CONTRACT.id}:nr.availability(id,readContextFor(id));
add('read-mode.negative-fixture',!readModeMatrix(negativeReadProvider),'deliberate block.align READ re-enable is detected by the durable matrix verifier');
add('read-mode.no-legacy-format-allowlist',!structured.includes('STRUCTURED_READ_MODE_FORMAT_COMMANDS')&&!structured.includes('وضع القراءة يسمح بالتنسيق والتحويل فقط'),'legacy READ formatting/conversion exception removed from canonical owner');
const first=learn.snapshot().blocks[0].id,disabled=nr.availability('block.moveUp',{mode:'edit',blockId:first}),before=JSON.stringify(learn.snapshot()),receiptCount=nr.receipts.length,attempt=nr.execute('block.moveUp',{mode:'edit',blockId:first,route:'negative-alternate'});
add('preflight.cannot-bypass-disabled',!disabled.enabled&&!attempt.ok&&attempt.code===disabled.code&&JSON.stringify(learn.snapshot())===before&&nr.receipts.length===receiptCount,{code:disabled.code,reason:disabled.reason});
let duplicateDetected=false;try{nr.register('block.moveDown','DonorLocalCommands','duplicate',()=>true)}catch(error){duplicateDetected=String(error.message).includes('DUPLICATE_COMMAND_OWNER:block.moveDown')}
add('duplicate-owner.negative-fixture',duplicateDetected,'deliberate duplicate canonical command registration rejected');
add('runtime.no-direct-main-save-bypass',!runtime.includes('structuredAdapter?.commit('),'Save/autosave use document.commit registry route');
add('runtime.history-registry-route',runtime.includes("extension.execute('history.undo'")&&runtime.includes("extension.execute('history.redo'"),'Library history presentation delegates to canonical registry');
add('runtime.recovery-registry-route',runtime.includes("extension.execute('document.recoverAsNew'"),'Library recovery presentation delegates to canonical registry');
add('runtime.palette-canonical-ids',runtime.includes("project('block.duplicate'")&&runtime.includes("project('block.moveUp'")&&runtime.includes("project('block.delete'")&&!runtime.includes("{id:'duplicate',group:'العنصر المحدد'")&&!runtime.includes("{id:'up',group:'العنصر المحدد'")&&!runtime.includes("{id:'delete',group:'العنصر المحدد'"),'donor palette projects canonical command IDs');
add('runtime.main-multi-delete-canonical',(runtime.match(/applyStructuredMutation\('main'/g)||[]).length===0&&runtime.includes("extension.execute('block.deleteMany'"),'multi-delete is bound through the canonical Structured command owner with no direct main mutation bypass');
add('main.bind-before-runtime',main.indexOf('structured.bindSharedCommands(registry)')>=0&&main.indexOf('structured.bindSharedCommands(registry)')<main.indexOf('mountAcceptedRuntime'),'canonical command registrations exist before Library runtime mount');
add('structured.execution-preflight',structured.includes('const availability=this.availability(command,context);if(!availability.enabled)return'),'execution rechecks the same Structured availability source');

const negativeRuntime=runtime.replace("const receipt=extension.execute('document.commit',structuredCommandContext('main',{reason:'autosave',route:'library-autosave'}));","const receipt=extension.structuredAdapter?.commit({reason:'autosave'});")
 .replace("project('block.moveUp'","{id:'up',group:'العنصر المحدد',label:'تحريك لأعلى',meta:'local',enabled:true},project('block.moveUp'");
const negativeObserved={directSaveBypass:negativeRuntime.includes('structuredAdapter?.commit('),localAlias:negativeRuntime.includes("{id:'up',group:'العنصر المحدد'")};
add('source-negative-fixture',negativeObserved.directSaveBypass&&negativeObserved.localAlias,negativeObserved);
const deferred=[{mechanic:'keyboard-mapping',targetSlice:'VS-09',status:'MAPPING_UNCHANGED_SEMANTIC_ROUTES_CONVERGED'}];
const out={schemaVersion:1,kind:'VS05_STRUCTURED_COMMAND_AVAILABILITY_OWNERSHIP_GATE',status:checks.every(x=>x.status==='PASS')?'PASS':'FAIL',commandCount:STRUCTURED_SHARED_COMMAND_IDS.length,checks,deferred};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
