import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url),rootPath=fileURLToPath(root),src=path.join(rootPath,'stack','native-typescript');
const walk=async (directory=src)=>{const out=[];for(const entry of await readdir(directory,{withFileTypes:true})){const p=path.join(directory,entry.name);if(entry.isDirectory())out.push(...await walk(p));else if(entry.name.endsWith('.ts'))out.push(p)}return out};
const files=await walk(),texts=new Map(await Promise.all(files.map(async file=>[path.relative(src,file).replaceAll(path.sep,'/'),await readFile(file,'utf8')])));
const occurrences=pattern=>[...texts].flatMap(([file,text])=>[...text.matchAll(pattern)].map(match=>({file,index:match.index,match:match[0]})));
const checks=[];const check=(id,pass,detail)=>checks.push({id,status:pass?'PASS':'FAIL',detail});

const semanticClasses=occurrences(/class\s+SemanticCommandBus\b/g),commandFacades=occurrences(/class\s+CommandRegistry\b/g),transientOwners=occurrences(/class\s+TransientFocusOwner\b/g),transientFacades=occurrences(/class\s+TransientFocusController\s+extends\s+TransientFocusOwner\b/g),preferenceOwners=occurrences(/class\s+ScopedPreferencesOwner\b/g),preferenceFacades=occurrences(/class\s+ScopedPreferences\s+extends\s+ScopedPreferencesOwner\b/g),commandRunSites=occurrences(/command\.run\(payload\)/g);
check('owner.command.single-canonical-class',semanticClasses.length===1,semanticClasses);
check('owner.command.compatibility-facade-single',commandFacades.length===1,commandFacades);
check('owner.command.single-execution-sink',commandRunSites.length===1&&commandRunSites[0].file==='foundation/global/commands.ts',commandRunSites);
check('owner.transient.single-canonical-class',transientOwners.length===1,transientOwners);
check('owner.transient.compatibility-facade-delegates',transientFacades.length===1,transientFacades);
check('owner.preferences.single-canonical-class',preferenceOwners.length===1,preferenceOwners);
check('owner.preferences.compatibility-facade-delegates',preferenceFacades.length===1,preferenceFacades);

const {SemanticCommandBus}=await import(pathToFileURL(path.join(rootPath,'dist','foundation','global','commands.js')).href+'?scan='+Date.now());
const {TransientFocusOwner}=await import(pathToFileURL(path.join(rootPath,'dist','foundation','global','transient-focus.js')).href+'?scan='+Date.now());
const {ScopedPreferencesOwner}=await import(pathToFileURL(path.join(rootPath,'dist','foundation','global','preferences','store.js')).href+'?scan='+Date.now());
const bus=new SemanticCommandBus();let effects=0;
bus.register('allowed','FamilyOwner','Allowed',()=>++effects,()=>true);
bus.register('denied','FamilyOwner','Denied',()=>++effects,()=>({enabled:false,code:'POLICY_DENIED',reason:'denied',availabilityOwner:'FamilyAvailabilityOwner'}));
let duplicateRejected=false;try{bus.register('allowed','GhostOwner','Duplicate',()=>{},()=>true)}catch(error){duplicateRejected=String(error).includes('DUPLICATE_COMMAND_OWNER')}
const unknown=bus.execute('ghost',{route:'direct'}),afterUnknown={effects,receipts:bus.receipts.length};
const denied=bus.execute('denied',{route:'direct'}),afterDenied={effects,receipts:bus.receipts.length};
const allowed=bus.execute('allowed',{route:'toolbar'}),afterAllowed={effects,receipts:bus.receipts.length,last:bus.lastReceipt()};
check('command.duplicate-identity-rejected',duplicateRejected,{duplicateRejected});
check('command.unknown-truth-no-effect-no-receipt',unknown.ok===false&&unknown.code==='UNKNOWN_COMMAND'&&afterUnknown.effects===0&&afterUnknown.receipts===0,{unknown,afterUnknown});
check('command.denied-direct-cannot-bypass',denied.ok===false&&denied.code==='POLICY_DENIED'&&afterDenied.effects===0&&afterDenied.receipts===0,{denied,afterDenied});
check('command.accepted-exactly-one-receipt',effects===1&&afterAllowed.receipts===1&&afterAllowed.last?.id==='allowed'&&afterAllowed.last?.route==='toolbar',{allowed,afterAllowed});

const transient=new TransientFocusOwner();const invoker={isConnected:true,disabled:false,focus(){this.focused=true},getAttribute(){return null}},fallback={isConnected:true,disabled:false,focus(){this.focused=true},getAttribute(){return null}};
transient.open('bottom',{invoker,outsideDismiss:true});transient.open('top',{invoker:null,modal:true,outsideDismiss:false,fallbackFocus:()=>fallback});const blockedBottom=transient.close('bottom',{reason:'escape'}),blockedOutside=transient.close('top',{reason:'outside'}),closedTop=transient.close('top',{reason:'escape'}),closedBottom=transient.close('bottom',{reason:'escape'});
check('transient.topmost-precedence',blockedBottom===false&&closedTop===true&&closedBottom===true,{blockedBottom,closedTop,closedBottom});
check('transient.outside-policy-cannot-bypass',blockedOutside===false,{blockedOutside});
check('transient.invalid-invoker-fallback-deterministic',fallback.focused===true,{fallbackFocused:!!fallback.focused,lastDismissal:transient.lastDismissal});

const pref=new ScopedPreferencesOwner(null,{workspace:'W02',surface:'learn',view:'main',component:'workspace',family:'structured'});let inapplicableRejected=false;try{pref.set('grid',false,'global')}catch(error){inapplicableRejected=String(error).includes('PREFERENCE_NOT_APPLICABLE')};
const storageTruth=pref.storageStatus();
check('preferences.inapplicable-write-rejected',inapplicableRejected,{inapplicableRejected});
check('preferences.storage-unavailable-truthful',storageTruth.available===false&&storageTruth.durable===false&&storageTruth.error==='STORAGE_UNAVAILABLE',storageTruth);

const source=await canonicalSourceIdentity(root),fail=checks.filter(x=>x.status==='FAIL').length,receipt={schemaVersion:1,classification:'WAVE2_LANE_A_NEGATIVE_GHOST_OWNER_SCAN_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:source.sha256,sourceFiles:source.files,summary:{total:checks.length,pass:checks.length-fail,fail},checks,verdict:fail?'FAIL':'PASS'};
await writeFile(new URL('assurance/W2A_NEGATIVE_SCAN.json',root),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({summary:receipt.summary,verdict:receipt.verdict},null,2));if(fail)process.exitCode=1;
