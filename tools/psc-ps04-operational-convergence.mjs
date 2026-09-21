import assert from 'node:assert/strict';
import {OperationalSessionOwner} from '../dist/foundation/operational/session-owner.js';
import {DomOperationalTerminalRenderer,TERMINAL_RENDERER_PORT_CONTRACT} from '../dist/foundation/operational/terminal-host.js';
import {InternalSimulationAdapter} from '../dist/adapters/simulation.js';
import {WindowMotion,WINDOW_RESIZE_EDGES} from '../dist/foundation/window-motion.js';

const checks=[];
const check=(id,fn)=>{try{const detail=fn();checks.push({id,status:'PASS',detail:detail??null});}catch(error){checks.push({id,status:'FAIL',detail:String(error?.stack||error)});}};
const provider=new InternalSimulationAdapter();
provider.runId='RUN-PS04-MODEL';
const owner=new OperationalSessionOwner();
const first=provider.open('device-a');
const firstTab=owner.attachProviderSession(provider,first.id);

check('canonical.runtime-identity-reference',()=>{
  const id=owner.runtimeIdentity(firstTab.presentationId);
  assert.equal(id.source,'RuntimeAdapterReference');
  assert.equal(id.sessionId,first.id);
  assert.equal(id.runId,'RUN-PS04-MODEL');
  assert.equal(id.deviceId,'device-a');
  assert.equal(id.epoch,1);
  return id;
});

check('canonical.provider-output-reread-after-command',()=>{
  const receipt=provider.input(first.id,'shutdown','ps04-model-shutdown');
  const reread=owner.readRuntimeSession(firstTab.presentationId);
  assert.equal(receipt.semanticCommand,'device.shutdown');
  assert.equal(provider.engine.device('device-a').up,false);
  assert.equal(reread.lines.at(-1).output,'Router A: interface DOWN (simulation)');
  assert.equal(owner.tabPresentationState(firstTab.presentationId).state,'completed');
  return {receipt,lastLine:reread.lines.at(-1)};
});

check('negative.unsupported-command-is-provider-bounded',()=>{
  const before=structuredClone(provider.engine.device('device-a'));
  const receipt=provider.input(first.id,'powershell','ps04-model-unsupported');
  const after=provider.engine.device('device-a');
  assert.equal(receipt.semanticCommand,'runtime.unsupported');
  assert.equal(receipt.changed,false);
  assert.deepEqual(after,before);
  assert.match(receipt.output,/Unsupported simulation command/);
  assert.equal(owner.tabPresentationState(firstTab.presentationId).state,'error');
  return {semanticCommand:receipt.semanticCommand,changed:receipt.changed,state:owner.tabPresentationState(firstTab.presentationId).state};
});

check('canonical.runtime-identity-epoch-refresh',()=>{
  provider.disconnect();
  const disconnected=owner.runtimeIdentity(firstTab.presentationId);
  assert.equal(disconnected.epoch,1); // session ref remains stale while provider epoch advances.
  assert.equal(owner.tabPresentationState(firstTab.presentationId).state,'unavailable');
  provider.reconnect(first.id);
  const reconnected=owner.runtimeIdentity(firstTab.presentationId);
  assert.equal(reconnected.epoch,2);
  assert.equal(reconnected.sessionId,first.id);
  assert.equal(owner.tabPresentationState(firstTab.presentationId).state,'idle');
  return {disconnected,reconnected};
});

const second=provider.open('device-b');
const secondTab=owner.attachProviderSession(provider,second.id);
check('presentation.split-preserved',()=>{
  owner.setPlacement('bottom');owner.setLayout('split');
  const snapshot=owner.snapshot();
  assert.equal(snapshot.chrome.layout,'split');
  assert.equal(snapshot.tabs.length,2);
  return {layout:snapshot.chrome.layout,tabs:snapshot.tabs.map(x=>x.runtimeIdentity.deviceId)};
});

check('presentation.tab-reorder-select-close',()=>{
  owner.selectTab(secondTab.presentationId);
  owner.reorderTab(secondTab.presentationId,-1);
  assert.equal(owner.tabsSnapshot()[0].presentationId,secondTab.presentationId);
  owner.closeTab(secondTab.presentationId);
  const snapshot=owner.snapshot();
  assert.equal(snapshot.tabs.length,1);
  assert.equal(snapshot.chrome.layout,'single');
  assert.equal(snapshot.tabs[0].presentationId,firstTab.presentationId);
  return {tabCount:snapshot.tabs.length,layout:snapshot.chrome.layout,active:snapshot.activePresentationId};
});

// Restore second tab for split/motion coverage.
owner.attachProviderSession(provider,second.id);
owner.setPlacement('floating');owner.setLayout('single');

check('presentation.window-motion-eight-edges',()=>{
  globalThis.innerWidth=1440;globalThis.innerHeight=1000;
  const results=[];
  for(const edge of WINDOW_RESIZE_EDGES){
    owner.setGeometry({x:220,y:180,width:720,height:420});
    const element={style:{},setPointerCapture(){},releasePointerCapture(){}};
    const motion=new WindowMotion(()=>owner.motionBinding(owner.activePresentationId,element,{resizeEdge:edge}));
    const target={closest(){return null}};
    assert.equal(motion.down({button:0,target,clientX:700,clientY:500,pointerId:7,preventDefault(){}}),true);
    assert.equal(motion.move({clientX:edge.includes('left')?670:edge.includes('right')?740:700,clientY:edge.includes('top')?470:edge.includes('bottom')?540:500}),true);
    assert.equal(motion.up(),true);
    const receipt=motion.receipts.at(-1),transition=owner.lastTransition;
    assert.equal(receipt.action,'resize');assert.equal(receipt.edge,edge);
    assert.equal(transition.action,'session.geometry.resize');assert.equal(transition.edge,edge);
    assert.ok(Number.isFinite(owner.snapshot().chrome.geometry.width));
    assert.ok(Number.isFinite(owner.snapshot().chrome.geometry.height));
    results.push({edge,geometry:owner.snapshot().chrome.geometry});
  }
  assert.equal(results.length,8);
  return results;
});

check('presentation.window-motion-move',()=>{
  owner.setGeometry({x:220,y:180,width:720,height:420});
  const element={style:{},setPointerCapture(){},releasePointerCapture(){}};
  const motion=new WindowMotion(()=>owner.motionBinding(owner.activePresentationId,element));
  const target={closest(){return null}};
  motion.down({button:0,target,clientX:300,clientY:200,pointerId:8,preventDefault(){}});
  motion.move({clientX:360,clientY:240});motion.up();
  assert.equal(motion.receipts.at(-1).action,'move');
  assert.equal(owner.lastTransition.action,'session.geometry.move');
  return owner.snapshot().chrome.geometry;
});

check('truth-ceiling.renderer-port-only',()=>{
  const renderer=new DomOperationalTerminalRenderer(),d=renderer.descriptor();
  assert.equal(d.kind,'DOM_FALLBACK');
  assert.deepEqual(d.contract,TERMINAL_RENDERER_PORT_CONTRACT);
  assert.equal(d.contract.semanticCommandOwnership,false);
  assert.equal(d.contract.canonicalStateOwnership,false);
  assert.equal(d.contract.processLifecycleOwnership,false);
  return d;
});

check('negative.presentation-route-cannot-own-runtime-command',()=>{
  assert.throws(()=>owner.route('runtime.input',{command:'shutdown'}),/OPERATIONAL_PRESENTATION_ROUTE_OUT_OF_SCOPE/);
  return 'runtime.input rejected by OperationalSessionOwner.route';
});

check('negative.split-requires-second-tab',()=>{
  const isolated=new OperationalSessionOwner();
  const p=new InternalSimulationAdapter();const s=p.open('device-a');isolated.attachProviderSession(p,s.id);
  assert.throws(()=>isolated.setLayout('split'),/OPERATIONAL_SPLIT_REQUIRES_SECOND_TAB/);
  return 'split rejected with one tab';
});

const failed=checks.filter(x=>x.status!=='PASS');
const report={schemaVersion:1,mission:'PS04_OPERATIONAL_REAL_CONSUMER_XTERM_CONVERGENCE',status:failed.length?'FAIL':'PASS',pass:checks.length-failed.length,fail:failed.length,checks};
console.log(JSON.stringify(report,null,2));
if(failed.length)process.exitCode=1;
