import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {AnalyticalCompareHost} from '../../../foundation/analytical/compare-host.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {TimelineReplayHost} from '../../../foundation/timeline/replay-host.js';
import {CollectionTableMatrixHost} from '../../../foundation/collection/table-matrix-host.js';
import {ContextInspectorHost} from '../../../foundation/global/context-inspector.js';
import {BottomDeepWorkOwner} from '../../../foundation/global/bottom-shelf.js';
import {DomTerminalRendererAdapter,OperationalView} from '../../../foundation/operational.js';
import {OperationalTerminalHost} from '../../../foundation/operational/terminal-host.js';
import {W03ResultsDomain,bindResultsReusableHosts} from '../../../adapters/results/domain.js';
import {RQDomainAdapter,bindRqReusableHosts} from '../../../adapters/rq/domain.js';

const rows=[];
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
const throws=(fn,code)=>{let observed='';try{fn()}catch(error){observed=String(error?.message||error)}assert(observed.includes(code),`${code} not observed; got ${observed||'NO_ERROR'}`);return observed};
const test=(id,run)=>{try{const detail=run();rows.push({id,status:'PASS',detail})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};
const fakeRoot=()=>({});
const transientHost={owner:'TransientHostOwner'};
const resultRecords=[{resultId:'RESULT-1',revisionId:'rev-1',manifestDigest:'sha256:result-1',sealed:true,label:'Result one',status:'SEALED',schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/1.0.0',recordedEvents:[{eventId:'event-1',label:'Started',timestampLabel:'T+0'}],comparable:{status:{label:'Status',type:'text',value:'SEALED'}}}];
const rqRecords=[{sourceId:'SRC-1',revision:'rev-1',digest:'sha256:rq-1',locator:'rq://SRC-1/rev-1',schemaVersion:'rq-source-revision/1',title:'Source one',comparable:{title:{label:'Title',type:'text',value:'One'}}}];

test('d03c.production-domains-fail-closed-without-shared-owners',()=>{
  const a=throws(()=>new W03ResultsDomain({records:resultRecords}),'RESULTS_SHARED_TIMELINE_REPLAY_OWNER_REQUIRED');
  const b=throws(()=>new W03ResultsDomain({records:resultRecords,timelineReplayOwner:new TimelineReplayOwner()}),'RESULTS_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED');
  const c=throws(()=>new RQDomainAdapter(rqRecords),'RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED');
  return {resultsTimeline:a,resultsAnalytical:b,rqAnalytical:c};
});

test('d03c.results-real-consumer-reuses-exact-host-owners',()=>{
  const timelineReplayOwner=new TimelineReplayOwner(),analyticalCompareOwner=new AnalyticalCompareOwner();
  const domain=new W03ResultsDomain({records:resultRecords,timelineReplayOwner,analyticalCompareOwner});
  const binding=bindResultsReusableHosts({domain,roots:{collection:fakeRoot(),timeline:fakeRoot()},transientHost});
  assert(binding.collection instanceof CollectionTableMatrixHost);
  assert(binding.timeline instanceof TimelineReplayHost&&binding.timeline.owner===timelineReplayOwner);
  assert(binding.analytical instanceof AnalyticalCompareHost&&binding.analytical.owner===analyticalCompareOwner);
  assert(binding.collection.snapshot().totalRows===1&&binding.finalRouteMounted===false&&binding.aarMounted===false);
  return {binding:binding.owner,rows:binding.collection.snapshot().totalRows,ownerIdentity:binding.ownerIdentity,downstream:binding.downstreamOwner};
});

test('d03c.rq-real-consumer-reuses-exact-host-owner',()=>{
  const analyticalCompareOwner=new AnalyticalCompareOwner();
  const domain=new RQDomainAdapter(rqRecords,{analyticalCompareOwner});
  const binding=bindRqReusableHosts({domain,roots:{collection:fakeRoot()},transientHost});
  assert(binding.collection instanceof CollectionTableMatrixHost&&binding.collection.snapshot().totalRows===1);
  assert(binding.analytical instanceof AnalyticalCompareHost&&binding.analytical.owner===analyticalCompareOwner);
  assert(binding.finalRouteMounted===false&&binding.reviewMounted===false);
  return {binding:binding.owner,rows:binding.collection.snapshot().totalRows,ownerIdentity:binding.ownerIdentity,downstream:binding.downstreamOwner};
});

test('d03c.shared-host-constructors-reject-missing-canonical-dependencies',()=>{
  const collection=throws(()=>new CollectionTableMatrixHost({root:fakeRoot(),adapter:{adapterId:'x',rows:()=>[],rowId:()=>'',rowLabel:()=>'',searchableText:()=>'',columns:[{id:'x',label:'x',cell:()=>''}]}}),'COLLECTION_SHARED_TRANSIENT_HOST_REQUIRED');
  const timeline=throws(()=>new TimelineReplayHost(fakeRoot(),null),'TIMELINE_REPLAY_HOST_OWNER_REQUIRED');
  const analytical=throws(()=>new AnalyticalCompareHost(null),'ANALYTICAL_COMPARE_OWNER_REQUIRED');
  const context=throws(()=>new ContextInspectorHost(),'TRANSIENT_FOCUS_OWNER_REQUIRED');
  return {collection,timeline,analytical,context};
});

test('d03c.bottom-zero-provider-is-truthful-unavailable',()=>{
  const owner=new BottomDeepWorkOwner(),shelf={dataset:{}},content={hidden:false,inert:false,innerHTML:'stale',setAttribute(){}},toggle={disabled:false,setAttribute(){}},summary={textContent:''};
  const root={querySelector(selector){return {'#bottomShelf':shelf,'#bottomContent':content,'#bottomToggle':toggle,'#bottomSummary':summary}[selector]||null},querySelectorAll(){return []}};
  const before=owner.snapshot(),rendered=owner.renderPresentation({root});
  assert(before.availability.status==='UNAVAILABLE'&&before.providerCount===0&&before.open===false);
  assert(rendered.model.status==='UNAVAILABLE'&&rendered.model.code==='BOTTOM_PROVIDER_UNAVAILABLE');
  assert(toggle.disabled===true&&shelf.dataset.bottomAvailability==='UNAVAILABLE'&&summary.textContent==='Deep work unavailable');
  throws(()=>owner.open(),'UNKNOWN_BOTTOM_PROVIDER');
  return {availability:before.availability,toggleDisabled:toggle.disabled,modelStatus:rendered.model.status};
});

test('d03c.xterm-remains-product-canonical-and-dom-is-retired',()=>{
  const dom=new DomTerminalRendererAdapter();
  assert(dom.kind==='TEST_ONLY_DOM'&&dom.productReachable===false);
  const retired=throws(()=>new OperationalView(null,null,null,null),'OPERATIONAL_VIEW_RETIRED_USE_OPERATIONAL_TERMINAL_HOST_XTERM');
  const owner={owner:'OperationalSessionOwner'};
  const host=new OperationalTerminalHost(fakeRoot(),owner);
  assert(host.rendererDescriptor().kind==='XTERM_JS');
  const blocked=throws(()=>new OperationalTerminalHost(fakeRoot(),owner,{renderer:{kind:'DOM_PRODUCT',render(){return ''}}}),'TERMINAL_PRODUCT_RENDERER_MUST_BE_XTERM');
  const fixture=new OperationalTerminalHost(fakeRoot(),owner,{renderer:{id:'FixtureRenderer',kind:'TEST_RENDERER',render(){return ''}}});
  assert(fixture.rendererDescriptor().kind==='TEST_RENDERER');
  return {canonical:host.rendererDescriptor(),dom:{kind:dom.kind,productReachable:dom.productReachable},retired,blocked,testOnlyAccepted:true};
});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'D03C_SHARED_HOST_REACHABILITY',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
