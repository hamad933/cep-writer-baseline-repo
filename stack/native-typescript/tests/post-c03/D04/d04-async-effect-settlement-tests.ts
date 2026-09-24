import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CommandRegistry} from '../../../foundation/models.js';
import {bindShellSurfaceCommands} from '../../../surfaces/shell/surface.js';
import {LocalPersistenceClient} from '../../../adapters/persistence/local-persistence-client.js';
import {settleAuditAnnotation} from '../../../surfaces/audit/index.js';
import {CepSqlitePersistenceProvider} from '../../../../stack/local-runtime/persistence/sqlite-persistence-provider.mjs';

const rows=[];
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
const test=async(id,run)=>{try{rows.push({id,status:'PASS',detail:await run()})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}};
const response=(payload,status=200)=>({ok:status>=200&&status<300,status,json:async()=>structuredClone(payload)});
const documentFixture=()=>({id:'D04-DOC-1',revision:'base-r1',title:'D04 settlement',blocks:[{id:'b1',type:'paragraph',html:'baseline',children:[]}]});

function shellFixture({commit,dirty=true}={}){
  const commands=new CommandRegistry(),navigations=[];
  const destinations=[{id:'library',area:'W02',labels:{ar:'Library',en:'Library'},description:{ar:'Library',en:'Library'}},{id:'rq',area:'W02',labels:{ar:'RQ',en:'RQ'},description:{ar:'RQ',en:'RQ'}}];
  const navigation={surface:'library',destinationRegistry:{owner:'ShellDestinationRegistry',has:id=>destinations.some(item=>item.id===id)},destinations:()=>destinations,globalAreas:()=>[{id:'W02',labels:{ar:'W02',en:'W02'},description:{ar:'W02',en:'W02'},defaultSurfaceId:'rq'}],areaDestination:()=> 'rq',destination:id=>destinations.find(item=>item.id===id),descriptor:()=>({registeredSurfaceCount:23}),isDirty:()=>dirty,navigate:destination=>{navigations.push(destination);return {ok:true,status:'NAVIGATING',destination}},navigateWithPreservedRecovery:()=>({ok:false,status:'PRESERVE_RECOVERY_RECEIPT_REQUIRED'}),focusDestinationHeading:()=>true,api:{Commands:{execute:commit}},workspace:{openCommandPalette:()=>true}};
  const binding=bindShellSurfaceCommands({commands,navigation});
  return {commands,navigation,binding,navigations,setDirty:value=>{dirty=value}};
}

await test('d04.shell-waits-for-client-save-settlement-before-one-navigation',async()=>{
  const gate=deferred(),client=new LocalPersistenceClient({fetchImpl:()=>gate.promise}),doc=documentFixture();
  let fixture;
  fixture=shellFixture({
    commit:()=>client.explicitSave(
      {...doc,title:'saved'},
      {documentId:doc.id,expectedRevision:doc.revision,workingRevision:1}
    ).then(receipt=>{
      if(receipt.ok)fixture.setDirty(false);
      return {...receipt,persisted:receipt.ok===true,status:receipt.ok?'PERSISTED':receipt.code};
    })
  });
  const pending=fixture.commands.execute('shell.leaveDirty',{destination:'rq',choice:'save'});
  assert(typeof pending?.then==='function'&&fixture.navigations.length===0&&fixture.navigation.isDirty(),'navigation occurred before Save settled');
  gate.resolve(response({ok:true,committed:true,revision:'p00000002-proof',committedRevision:'p00000002-proof'}));
  const settled=await pending;assert(settled.status==='NAVIGATING'&&fixture.navigations.length===1&&!fixture.navigation.isDirty());
  return {pendingNavigationCount:0,settledNavigationCount:fixture.navigations.length,status:settled.status,requestId:client.lastReceipt&&client.logicalSaveRequestIds.get(`${doc.id}:1`)};
});

await test('d04.shell-save-failure-blocks-navigation',async()=>{
  const fixture=shellFixture({commit:async()=>({ok:false,persisted:false,status:'SAVE_FAILED',code:'WRITE_FAILED'})});
  const settled=await fixture.commands.execute('shell.leaveDirty',{destination:'rq',choice:'save'});assert(settled.status==='SAVE_FAILED'&&fixture.navigations.length===0&&fixture.navigation.isDirty());return {status:settled.status,navigationCount:0};
});

await test('d04.shell-provider-unavailable-blocks-navigation',async()=>{
  const fixture=shellFixture({commit:async()=>({ok:false,persisted:false,status:'SAVE_BOUNDARY_UNAVAILABLE'})});
  const settled=await fixture.commands.execute('shell.leaveDirty',{destination:'rq',choice:'save'});assert(settled.status==='SAVE_BOUNDARY_UNAVAILABLE'&&fixture.navigations.length===0);return {status:settled.status,navigationCount:0};
});

await test('d04.shell-persisted-receipt-with-dirty-state-blocks-navigation',async()=>{
  const fixture=shellFixture({commit:async()=>({ok:true,persisted:true,status:'PERSISTED'})});
  const settled=await fixture.commands.execute('shell.leaveDirty',{destination:'rq',choice:'save'});assert(settled.status==='SAVE_ACK_DIRTY_STATE_UNRESOLVED'&&fixture.navigations.length===0);return {status:settled.status,navigationCount:0};
});

await test('d04.client-lost-ack-reuses-request-id-and-provider-replays-one-revision',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'cep-d04-lost-ack-')),provider=new CepSqlitePersistenceProvider({databasePath:join(dir,'proof.sqlite')}),doc=documentFixture();
  try{
    provider.bootstrap(doc);const requestIds=[];let loseAck=true;
    const client=new LocalPersistenceClient({fetchImpl:async(_url,options)=>{const body=JSON.parse(options.body);requestIds.push(body.requestId);const result=provider.saveStructuredDocument(body.document,{...body.context,requestId:body.requestId});if(loseAck){loseAck=false;throw Object.assign(Error('ACK_LOST_AFTER_COMMIT'),{name:'TypeError'})}return response(result)}});
    const context={documentId:doc.id,expectedRevision:doc.revision,workingRevision:1,committedDocument:doc},changed={...doc,title:'durably committed once'};
    const lost=await client.explicitSave(changed,context),countAfterLost=provider.revisionCount(doc.id),replayed=await client.explicitSave(changed,context),countAfterReplay=provider.revisionCount(doc.id);
    assert(!lost.ok&&lost.code==='RUNTIME_UNAVAILABLE'&&replayed.ok&&replayed.duplicateReplay===true);assert(requestIds.length===2&&requestIds[0]===requestIds[1]&&lost.requestId===replayed.requestId);assert(countAfterLost===2&&countAfterReplay===2);
    return {lostCode:lost.code,requestIdStable:true,duplicateReplay:replayed.duplicateReplay,revisionCountAfterLost:countAfterLost,revisionCountAfterReplay:countAfterReplay};
  }finally{provider.close();rmSync(dir,{recursive:true,force:true})}
});

await test('d04.real-stale-base-remains-failure-without-extra-revision',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'cep-d04-stale-')),provider=new CepSqlitePersistenceProvider({databasePath:join(dir,'proof.sqlite')}),doc=documentFixture();
  try{
    provider.bootstrap(doc);const committed=provider.saveStructuredDocument({...doc,title:'first'},{documentId:doc.id,expectedRevision:doc.revision,workingRevision:1,requestId:'first-save',committedDocument:doc}),before=provider.revisionCount(doc.id);
    const stale=provider.saveStructuredDocument({...doc,title:'competing stale'},{documentId:doc.id,expectedRevision:doc.revision,workingRevision:2,requestId:'competing-stale',committedDocument:doc}),after=provider.revisionCount(doc.id);
    assert(committed.ok&&!stale.ok&&stale.code==='STALE_BASE'&&before===after);return {staleCode:stale.code,currentRevision:stale.currentRevision,revisionCountBefore:before,revisionCountAfter:after};
  }finally{provider.close();rmSync(dir,{recursive:true,force:true})}
});

await test('d04.audit-async-success-stays-pending-until-settlement',async()=>{
  const gate=deferred(),states=[],events=[{sequence:1,recordHash:'immutable-hash'}],before=JSON.stringify(events),pending=settleAuditAnnotation(()=>gate.promise,state=>states.push(state));
  assert(states.length===1&&states[0].state==='PENDING'&&states[0].settled===false);gate.resolve({ok:true,status:'ANNOTATION_RECORDED',annotation:{eventId:1,revision:1}});const settled=await pending;
  assert(settled.state==='SUCCESS'&&states.map(item=>item.state).join(',')==='PENDING,SUCCESS'&&JSON.stringify(events)===before);return {states:states.map(item=>item.state),successCode:settled.code,auditEventBytesUnchanged:true};
});

await test('d04.audit-async-failure-renders-exact-settled-code',async()=>{
  const gate=deferred(),states=[],pending=settleAuditAnnotation(()=>gate.promise,state=>states.push(state));assert(states[0].state==='PENDING');gate.resolve({ok:false,code:'AUDIT_EVENT_NOT_FOUND'});const settled=await pending;assert(settled.state==='FAILURE'&&settled.code==='AUDIT_EVENT_NOT_FOUND'&&states.length===2);return {states:states.map(item=>item.state),failureCode:settled.code};
});

await test('d04.audit-rejection-renders-exact-rejection-code',async()=>{
  const states=[],error=Object.assign(Error('annotation provider offline'),{code:'AUDIT_PROVIDER_UNAVAILABLE'}),settled=await settleAuditAnnotation(()=>Promise.reject(error),state=>states.push(state));assert(settled.state==='FAILURE'&&settled.code==='AUDIT_PROVIDER_UNAVAILABLE');return {states:states.map(item=>item.state),failureCode:settled.code};
});

await test('d04.shell-descriptor-removes-stale-replay-wording-with-count-unfrozen',async()=>{
  const fixture=shellFixture({commit:()=>({persisted:false})}),serialized=JSON.stringify(fixture.binding);assert(!serialized.includes('CONTROLLER_REPLAY_REQUIRED')&&fixture.binding.destinationCountFrozen===false&&fixture.binding.routeContext.destinationCountFrozen===false);return {finalDefaultRegistryWiring:fixture.binding.finalDefaultRegistryWiring,destinationCountFrozen:fixture.binding.destinationCountFrozen};
});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'D04_ASYNC_EFFECT_SETTLEMENT',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
