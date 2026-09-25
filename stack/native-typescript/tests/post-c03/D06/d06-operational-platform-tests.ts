import {OperationalSessionOwner} from '../../../foundation/operational/session-owner.js';
import {WindowMotion,WINDOW_RESIZE_EDGES} from '../../../foundation/window-motion.js';
import {XtermOperationalTerminalRenderer} from '../../../foundation/operational/xterm-renderer.js';
import {WindowsTerminalRuntimeAdapter} from '../../../adapters/windows-terminal-runtime.js';
import {RUNTIME_ADAPTER_CONTRACT} from '../../../foundation/operational.js';
import {
  stageGovernedDetachedContext,
  validateAndConsumeGovernedDetachedContext
} from '../../../foundation/contracts/platform-window-capability.js';

const rows=[];
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
const equal=(actual,expected,message='values differ')=>assert(actual===expected,`${message}: ${actual} !== ${expected}`);
const test=async(id,run)=>{try{rows.push({id,status:'PASS',detail:await run()})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};

const fakeRuntime=(id='runtime-01')=>({
  descriptor(){return {contract:RUNTIME_ADAPTER_CONTRACT,id:'FakeOperationalRuntime',label:'Fake Runtime',sessionOwner:'FakeOwner',capabilities:['runtime.reattach'],rawTerminal:true,pty:true,conpty:true,runtimeTruth:'WINDOWS_CONPTY'};},
  session(sessionId){return {id:sessionId,deviceId:'dev-1',runId:'run-1',epoch:'e1',lines:[],rawOutputBase64:'',presentation:{state:'running',detail:'',sequence:1,transitions:[]}};},
  prompt(){return 'fake>';}
});

// 1. A07-PF-001 / A07-PF-002: Operational Detach Provider Session Preservation & Availability Truth
await test('d06.operational.detach-preserves-provider-session-and-identities',()=>{
  let detachRequest=null;
  const bridge={
    requestSeparateWindow:(req)=>{detachRequest=structuredClone(req);return {ok:true,active:true,contextHandoffValid:true,code:'OPEN'};}
  };
  const runtime=fakeRuntime(),owner=new OperationalSessionOwner({platformWindowBridge:bridge});
  const tab=owner.attachProviderSession(runtime,'sess-100',{classification:'REAL_RUNTIME_PROVIDER'});
  owner.setPlacement('floating');
  const result=owner.detachWindow();
  equal(result.ok,true);
  equal(result.providerSessionPreserved,true);
  equal(result.detachScope,'OWNING_SURFACE');
  equal(detachRequest.runtimeSessionId,'sess-100');
  equal(detachRequest.providerId,'FakeOperationalRuntime');
  equal(detachRequest.presentationId,tab.presentationId);

  // Negative: unavailable bridge fails closed and does NOT fake detached state
  const unavailOwner=new OperationalSessionOwner();
  unavailOwner.attachProviderSession(runtime,'sess-200');
  const unavailResult=unavailOwner.detachWindow();
  equal(unavailResult.ok,false);
  equal(unavailResult.code,'PLATFORM_WINDOW_UNAVAILABLE');
  equal(unavailOwner.snapshot().chrome.detached,false);
  return {detachScope:result.detachScope,providerSessionPreserved:true,failsClosedOnUnavailable:true};
});

// 2. A07-PF-004 / A09-PF-001: Operational Reattachment Rebinds Existing Runtime Identity
await test('d06.operational.reattach-rebinds-existing-runtime-session-without-mutation',()=>{
  const runtime=fakeRuntime();
  const owner=new OperationalSessionOwner();
  const firstAttach=owner.attachProviderSession(runtime,'sess-existing');
  const firstId=owner.runtimeIdentity(firstAttach.presentationId);
  equal(firstId.sessionId,'sess-existing');

  // Reattaching the exact same session reuses the tab without duplicate or mutation
  const reattach=owner.attachProviderSession(runtime,'sess-existing');
  equal(reattach.presentationId,firstAttach.presentationId);
  equal(owner.tabsSnapshot().length,1);
  equal(owner.lastTransition.reused,true);
  return {reused:true,sessionId:firstId.sessionId,tabCount:owner.tabsSnapshot().length};
});

// 3. A07-PF-005 / A09-PF-002: WindowMotion Cancel Emits Cancellation Rather Than Resize Success
await test('d06.operational.window-motion-cancel-emits-cancellation',()=>{
  const runtime=fakeRuntime(),owner=new OperationalSessionOwner();
  const tab=owner.attachProviderSession(runtime,'sess-motion');
  owner.setPlacement('floating');
  owner.setGeometry({x:200,y:160,width:520,height:360});
  const before=structuredClone(owner.snapshot().chrome.geometry);

  const fakeNode={style:{},setPointerCapture(){},releasePointerCapture(){}};
  const motion=new WindowMotion(()=>owner.motionBinding(tab.presentationId,fakeNode,{resizeEdge:'bottom-right'}));
  const down={button:0,target:{closest:()=>null},clientX:300,clientY:300,pointerId:1,preventDefault(){}};
  assert(motion.down(down),'motion.down failed');
  motion.move({...down,clientX:450,clientY:420});
  assert(owner.snapshot().chrome.geometry.width!==before.width,'geometry should have updated during drag');

  // Cancel motion (e.g. Escape key)
  assert(motion.cancel('Escape'),'motion.cancel failed');
  const after=owner.snapshot().chrome.geometry;
  equal(after.width,before.width,'geometry not rolled back');
  equal(after.height,before.height,'geometry not rolled back');

  // Verify transition action is session.geometry.cancel, NOT session.geometry.resize
  equal(owner.lastTransition.action,'session.geometry.cancel');
  equal(owner.lastTransition.reason,'Escape');
  assert(owner.lastTransition.action!=='session.geometry.resize','must not emit session.geometry.resize on cancellation');
  return {before,after,recordedAction:owner.lastTransition.action,reason:owner.lastTransition.reason};
});

// 4. A09-PF-003 / A09-PF-004: Governed Detached Context Continuity & Fail-Closed Validation
await test('d06.platform.sticky-detach-governed-continuity-and-fail-closed',()=>{
  const memoryStore=new Map();
  const fakeStorage={
    getItem:(k)=>memoryStore.get(k)||null,
    setItem:(k,v)=>memoryStore.set(k,String(v)),
    removeItem:(k)=>memoryStore.delete(k)
  };

  const payload={note:{id:'note-42',title:'Critical note'},route:{activeKu:'KU-01'}};
  const token=stageGovernedDetachedContext(payload,{storage:fakeStorage,ttlMs:5000});
  assert(token&&token.startsWith('ctx-'),'invalid token generated');

  // Valid consumption
  const validated=validateAndConsumeGovernedDetachedContext(token,{storage:fakeStorage,expectedKind:'STICKY_WHOLE_SURFACE_CONTEXT'});
  equal(validated.ok,true);
  equal(validated.code,'DETACH_CONTEXT_VALIDATED');
  equal(validated.payload.note.id,'note-42');

  // Single-use: consuming again must fail closed with NOT_FOUND
  const consumedAgain=validateAndConsumeGovernedDetachedContext(token,{storage:fakeStorage});
  equal(consumedAgain.ok,false);
  equal(consumedAgain.code,'DETACH_CONTEXT_NOT_FOUND');

  // Expired token fails closed
  const expiredToken=stageGovernedDetachedContext(payload,{storage:fakeStorage,ttlMs:-1000});
  const expiredResult=validateAndConsumeGovernedDetachedContext(expiredToken,{storage:fakeStorage});
  equal(expiredResult.ok,false);
  equal(expiredResult.code,'DETACH_CONTEXT_EXPIRED');

  // Missing or corrupted token fails closed
  const missingResult=validateAndConsumeGovernedDetachedContext(null,{storage:fakeStorage});
  equal(missingResult.ok,false);
  equal(missingResult.code,'TOKEN_REQUIRED');

  return {tokenValidated:true,singleUseEnforced:true,expiredRejected:true,missingRejected:true};
});

// 5. A09-PF-005 / A09-PF-006: xterm First-Mount Subscription Replay Race Protection
await test('d06.xterm.first-mount-atomic-subscription-and-replay-no-duplicates',async()=>{
  const renderer=new XtermOperationalTerminalRenderer();
  const streamListeners=new Set();
  const providerRuntime={
    subscribe:(id,handler)=>{
      streamListeners.add(handler);
      return {dispose:()=>streamListeners.delete(handler)};
    }
  };

  const initialBuffer='Line 1\r\nLine 2\r\n';
  const rawBase64=btoa(initialBuffer);
  const session={
    id:'sess-stream',
    outputGeneration:1,
    rawOutputBase64:rawBase64
  };
  const provider={id:'WindowsConptyRuntimeAdapter',rawTerminal:true,pty:true,conpty:true};

  // Mock DOM root
  const writtenChunks=[];
  const mockTerm={
    element:{isConnected:true},
    open(){},
    dispose(){},
    onData:()=>({dispose(){}}),
    onResize:()=>({dispose(){}}),
    write(chunk){writtenChunks.push(typeof chunk==='string'?chunk:new TextDecoder().decode(chunk));},
    writeln(line){writtenChunks.push(line+'\n');},
    reset(){writtenChunks.length=0;},
    focus(){},
    options:{disableStdin:false}
  };

  const root={
    querySelector:()=>({setAttribute(){}})
  };

  // Mount renderer with mock terminal
  renderer.instances.set('p-stream',{
    term:mockTerm,
    disposables:[],
    lastOutputBytes:0,
    lastLineCount:0,
    generation:1,
    readOnly:false,
    provider,
    routeInput:null,
    routeResize:null
  });

  // Call mount
  await renderer.mount({
    root,
    session,
    provider,
    providerRuntime,
    presentationId:'p-stream',
    readOnly:false
  });

  // Initial replay written once
  equal(writtenChunks.join(''),initialBuffer);
  const bytesAfterInitial=renderer.instances.get('p-stream').lastOutputBytes;
  equal(bytesAfterInitial,initialBuffer.length);

  // Subsequent stream event arrives via subscription
  const streamData=new TextEncoder().encode('Line 3\r\n');
  for(const listener of streamListeners){
    listener({type:'output',data:streamData});
  }

  equal(writtenChunks.join(''),initialBuffer+'Line 3\r\n');
  equal(renderer.instances.get('p-stream').lastOutputBytes,initialBuffer.length+streamData.length);

  // Subsequent mount call with same rawOutputBase64 must NOT duplicate already consumed bytes
  await renderer.mount({
    root,
    session,
    provider,
    providerRuntime,
    presentationId:'p-stream',
    readOnly:false
  });

  equal(writtenChunks.join(''),initialBuffer+'Line 3\r\n','mount must not duplicate already written bytes');
  renderer.dispose('p-stream');
  return {initialReplayExact:true,streamingDelivered:true,duplicatePrevented:true};
});

// 6. A09-PF-007 / A09-PF-008: Profile Availability Reflects Real Platform Capability
await test('d06.platform.profile-availability-reflects-real-platform-truth',()=>{
  const disabled=new WindowsTerminalRuntimeAdapter({
    connected:true,
    platformCapabilities:{powershell:false,ssh:false}
  });
  const disabledDesc=disabled.descriptor();
  equal(disabledDesc.powershell,false);
  equal(disabledDesc.ssh,false);

  const enabled=new WindowsTerminalRuntimeAdapter({
    connected:true,
    platformCapabilities:{powershell:true,ssh:true}
  });
  const enabledDesc=enabled.descriptor();
  equal(enabledDesc.powershell,true);
  equal(enabledDesc.ssh,true);

  const disconnected=new WindowsTerminalRuntimeAdapter({connected:false});
  const discDesc=disconnected.descriptor();
  equal(discDesc.powershell,false);
  equal(discDesc.ssh,false);
  equal(discDesc.connected,false);

  return {disabledVerified:true,enabledVerified:true,disconnectedFailsClosed:true};
});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'D06_OPERATIONAL_PLATFORM_TESTS',classification:'D06_CONVERGED__OPERATIONAL_PLATFORM_VERIFIED',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
