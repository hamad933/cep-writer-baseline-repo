import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {StickyNoteWindowOwner,stickyNoteWindowOwnerForHost} from '../dist/foundation/notes/sticky-note-window.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const assurance=path.join(root,'assurance');
const assert=(value,message='assertion failed')=>{if(!value)throw Error(message)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const throws=(fn,token)=>{let message='';try{fn()}catch(error){message=String(error?.message||error)}assert(message.includes(token),`expected ${token}, got ${message}`);return message};
const cases=[];
const test=(id,run)=>{try{cases.push({id,status:'PASS',detail:run()??null})}catch(error){cases.push({id,status:'FAIL',error:String(error?.message||error)})}};

// 1 + 2: constructor publication is fail-atomic and same-host retry succeeds.
test('w6a.correction.constructor-capability-throw-no-phantom-owner',()=>{
  const hostGraph={};
  const throwingBridge={id:'throwing-capability-discovery',capabilities(){throw Error('CAPABILITY_DISCOVERY_BOOM')}};
  const message=throws(()=>new StickyNoteWindowOwner({hostGraph,capabilityBridge:throwingBridge}),'CAPABILITY_DISCOVERY_BOOM');
  assert(stickyNoteWindowOwnerForHost(hostGraph)===null,'failed constructor published phantom owner');
  const retry=new StickyNoteWindowOwner({hostGraph});
  assert(stickyNoteWindowOwnerForHost(hostGraph)===retry,'clean retry did not attach owner');
  return {constructorFailure:message,phantomOwner:false,retryOwner:retry.owner};
});

// 3: successful owner registration still enforces one owner per host graph.
test('w6a.correction.duplicate-valid-owner-still-rejects',()=>{
  const hostGraph={},first=new StickyNoteWindowOwner({hostGraph});
  const message=throws(()=>new StickyNoteWindowOwner({hostGraph}),'DUPLICATE_STICKY_NOTE_WINDOW_OWNER');
  assert(stickyNoteWindowOwnerForHost(hostGraph)===first,'duplicate attempt displaced canonical owner');
  return {message,canonicalOwnerPreserved:true};
});

// 4 + 6 + 7 + 8: throwing always-on-top request produces deterministic failure and owner recovers.
test('w6a.correction.throwing-always-on-top-truthful-failure-and-recovery',()=>{
  let calls=0;
  const bridge={
    id:'flaky-always-on-top-bridge',
    capabilities:()=>({alwaysOnTop:true,separateWindow:true}),
    requestAlwaysOnTop:req=>{calls++;if(calls===1)throw Error('PLATFORM_ALWAYS_ON_TOP_BOOM');return {ok:true,active:req.requested}},
    requestSeparateWindow:()=>({ok:true,active:true})
  };
  const fixture={content:{blocks:[{id:'b1',text:'unchanged'}]},binding:{documentId:'doc-1'},source:{id:'source-1'},persistence:{revision:7}},before=JSON.stringify(fixture);
  const owner=new StickyNoteWindowOwner({hostGraph:{},capabilityBridge:bridge});owner.register('always-error');
  const failed=owner.requestAlwaysOnTop('always-error',true);
  assert(failed.ok===false&&failed.code==='BRIDGE_ERROR','throw did not become BRIDGE_ERROR result');
  assert(failed.projection.capabilityAdvertised===true&&failed.projection.availability==='AVAILABLE','advertised capability truth lost');
  assert(failed.projection.requested===true&&failed.projection.requestStatus==='ERROR'&&failed.projection.active===false,'request error projection ambiguous');
  assert(failed.receipt.action==='platform.always-on-top.request'&&failed.receipt.ok===false&&failed.receipt.code==='BRIDGE_ERROR'&&failed.receipt.requestStatus==='ERROR'&&failed.receipt.active===false&&failed.receipt.attempted===true,'failure receipt incomplete');
  assert(JSON.stringify(fixture)===before,'platform failure mutated domain fixture');
  const recovered=owner.requestAlwaysOnTop('always-error',true);
  assert(recovered.ok===true&&recovered.code==='BRIDGE_CONFIRMED'&&recovered.projection.active===true&&recovered.projection.requestStatus==='SUCCEEDED','owner not usable after always-on-top failure');
  return {failed:{ok:failed.ok,code:failed.code,projection:failed.projection,receipt:failed.receipt},recovered:{ok:recovered.ok,code:recovered.code,projection:recovered.projection},domainFixtureUnchanged:true};
});

// 5 + 6 + 7 + 8: throwing separate-window request is also deterministic and recoverable.
test('w6a.correction.throwing-separate-window-truthful-failure-and-recovery',()=>{
  let calls=0;
  const bridge={
    id:'flaky-separate-window-bridge',
    capabilities:()=>({alwaysOnTop:true,separateWindow:true}),
    requestAlwaysOnTop:req=>({ok:true,active:req.requested}),
    requestSeparateWindow:()=>{calls++;if(calls===1)throw Error('PLATFORM_SEPARATE_WINDOW_BOOM');return {ok:true,active:true}}
  };
  const fixture={content:{title:'unchanged'},binding:{documentId:'doc-2'},source:{id:'source-2'},persistence:{revision:11}},before=JSON.stringify(fixture);
  const owner=new StickyNoteWindowOwner({hostGraph:{},capabilityBridge:bridge});owner.register('separate-error');
  const failed=owner.requestSeparateWindow('separate-error');
  assert(failed.ok===false&&failed.code==='BRIDGE_ERROR','throw did not become BRIDGE_ERROR result');
  assert(failed.projection.capabilityAdvertised===true&&failed.projection.availability==='AVAILABLE','advertised capability truth lost');
  assert(failed.projection.requested===true&&failed.projection.requestStatus==='ERROR'&&failed.projection.active===false,'request error projection ambiguous');
  assert(failed.receipt.action==='platform.separate-window.request'&&failed.receipt.ok===false&&failed.receipt.code==='BRIDGE_ERROR'&&failed.receipt.requestStatus==='ERROR'&&failed.receipt.active===false&&failed.receipt.attempted===true,'failure receipt incomplete');
  assert(JSON.stringify(fixture)===before,'platform failure mutated domain fixture');
  const recovered=owner.requestSeparateWindow('separate-error');
  assert(recovered.ok===true&&recovered.code==='BRIDGE_CONFIRMED'&&recovered.projection.active===true&&recovered.projection.requestStatus==='SUCCEEDED','owner not usable after separate-window failure');
  return {failed:{ok:failed.ok,code:failed.code,projection:failed.projection,receipt:failed.receipt},recovered:{ok:recovered.ok,code:recovered.code,projection:recovered.projection},domainFixtureUnchanged:true};
});

// Both request failures must remain presentation-only and may not poison normal owner lifecycle.
test('w6a.correction.failure-path-never-active-and-owner-lifecycle-remains-usable',()=>{
  const bridge={id:'always-throw-platform-bridge',capabilities:()=>({alwaysOnTop:true,separateWindow:true}),requestAlwaysOnTop(){throw Error('AOT_FAIL')},requestSeparateWindow(){throw Error('SEP_FAIL')}};
  const owner=new StickyNoteWindowOwner({hostGraph:{},capabilityBridge:bridge});const registered=owner.register('lifecycle',{invokerId:'button-1'}),identity=registered.presentationId;
  const a=owner.requestAlwaysOnTop('lifecycle',true),s=owner.requestSeparateWindow('lifecycle');
  assert(a.projection.active===false&&s.projection.active===false,'failure path claimed active platform state');
  const hidden=owner.hide('lifecycle'),reopened=owner.open('lifecycle');
  assert(hidden.window.lifecycle==='hidden'&&reopened.lifecycle==='open'&&reopened.presentationId===identity,'platform failure poisoned window lifecycle');
  const errorReceipts=owner.receipts.filter(r=>r.code==='BRIDGE_ERROR');assert(errorReceipts.length===2&&errorReceipts.every(r=>r.ok===false&&r.active===false),'missing deterministic bridge-error receipts');
  return {alwaysOnTopActive:a.projection.active,separateWindowActive:s.projection.active,errorReceiptCount:errorReceipts.length,reopenedIdentityPreserved:true};
});

const source=await canonicalSourceIdentity(new URL('../',import.meta.url));
const failures=cases.filter(item=>item.status!=='PASS');
const report={schemaVersion:1,kind:'W6_A_STICKY_NOTE_WINDOW_OWNER_BOUNDED_CORRECTION_PROOF',classification:'LANE_A_BOUNDED_CORRECTION_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:failures.length?'FAIL':'PASS',sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,caseCount:cases.length,passCount:cases.length-failures.length,failCount:failures.length,cases};
await fs.writeFile(path.join(assurance,'W6_A_CORRECTION_PROOF.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,sourceCanonicalTreeSha256:report.sourceCanonicalTreeSha256,canonicalSourceFileCount:report.canonicalSourceFileCount,pass:report.passCount,fail:report.failCount},null,2));
if(failures.length)process.exitCode=1;
