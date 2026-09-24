import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../foundation/models.js';
import {CEP_PRODUCT_DESTINATION_REGISTRY} from '../../../foundation/global/shell/cep-destinations.js';
import {CEP_GLOBAL_AREA_BASELINE} from '../../../foundation/global/shell/destination-registry.js';
import {bindShellSurfaceCommands,createShellRouteContextProjection} from '../../../surfaces/shell/surface.js';
import {TodayProjectionDomainAdapter} from '../../../adapters/today/domain.js';
import {bindTodaySurface} from '../../../surfaces/today/surface.js';
import {buildTodayOrchestrationViewModel,todayProjectionStateCopy} from '../../../surfaces/today/presentation.js';

const observed=(id,items,extra={})=>({id,read:()=>({providerId:id,state:'OBSERVED_DATA',observedAt:'2026-09-18T00:00:00Z',items,...extra})});
const failed={id:'queue',read:()=>{throw Error('QUEUE_PROVIDER_FAILED')}};

// Today: an unbound provider is UNOBSERVED, never AVAILABLE_EMPTY/OBSERVED_EMPTY.
{
  const adapter=new TodayProjectionDomainAdapter(),projection=adapter.project();
  assert.equal(projection.state,'UNOBSERVED');
  assert.equal(projection.sourceTotalCount,0);assert.equal(projection.visibleCount,0);
  assert.equal(projection.canonicalWrites,false);assert.equal(projection.mastery,'NOT_INFERRED__W04_OWNED');
  assert.match(todayProjectionStateCopy(projection,'en'),/not been observed/i);
}

// Today: one successful source + one failed source is PARTIAL, not empty/failure collapse.
{
  const recent=observed('recent',[{id:'ctx-1',kind:'RECENT_CONTEXT',title:'Viewed map'}]);
  const adapter=new TodayProjectionDomainAdapter({providers:[failed,recent]}),projection=adapter.project();
  assert.equal(projection.state,'PARTIAL');assert.equal(projection.sourceTotalCount,1);assert.equal(projection.items[0].providerId,'recent');
  assert.equal(projection.sources.find(s=>s.providerId==='queue').state,'FAILED');
}

// Today: filter is presentation-side, source totals remain stable and filtered-empty is explicit.
{
  const provider=observed('recommendation',[{id:'rec-1',kind:'RECOMMENDATION',title:'Practice',recommendation:{sourceRef:'learn:lesson-2',version:'r7',reasonCode:'NEXT_ACTIVITY'}}]);
  const adapter=new TodayProjectionDomainAdapter({providers:[provider]});
  const all=adapter.project();assert.equal(all.sourceTotalCount,1);assert.equal(all.visibleCount,1);
  adapter.setFilter('ATTENTION');const filtered=adapter.project();
  assert.equal(filtered.sourceTotalCount,1);assert.equal(filtered.visibleCount,0);assert.equal(filtered.filteredEmpty,true);assert.equal(filtered.viewState,'FILTERED_EMPTY');
  assert.throws(()=>adapter.setFilter('UNRECOGNIZED'),/TODAY_FILTER_KIND_UNRECOGNIZED/);
}

// Today: rationale requires exact selected recommendation version and never fabricates unlock/access logic.
{
  const provider=observed('recs',[{id:'rec-2',kind:'RECOMMENDATION',title:'Basic Lab',recommendation:{sourceRef:'learn:lesson-2',version:'r8',rationale:'Lesson complete; next practice is available'}}]);
  const adapter=new TodayProjectionDomainAdapter({providers:[provider]});adapter.project();
  assert.equal(adapter.canExplain('rec-2','r8').enabled,false);
  assert.equal(adapter.selectRecommendation('rec-2','r8').ok,true);
  assert.equal(adapter.canExplain('rec-2','r7').enabled,false);
  const why=adapter.why('rec-2','r8');assert.equal(why.ok,true);assert.equal(why.unlockLogicFabricated,false);assert.equal(why.accessDecisionMade,false);
  const vm=buildTodayOrchestrationViewModel(adapter.lastProjection,{lang:'en',adapter});assert.equal(vm.whyAvailability.enabled,true);
}

// Today: continuation guard uses target existence/readability only, never learner progress.
{
  const provider=observed('resume',[{id:'resume-1',kind:'CONTINUE_SESSION',title:'Lesson 02',progress:0.42,continuation:{destination:'learn',objectId:'lesson-02',exists:true,readable:true}}]);
  const adapter=new TodayProjectionDomainAdapter({providers:[provider]});adapter.project();
  const result=adapter.resume('resume-1');assert.equal(result.ok,true);assert.equal(result.progressMutation,false);assert.equal(result.accessDecisionMade,false);assert.equal(result.returnBookmark.surface,'today');
  const blockedProvider=observed('blocked',[{id:'resume-2',kind:'CONTINUE_SESSION',continuation:{destination:'learn',objectId:'lesson-03',exists:true,readable:false}}]);
  const blocked=new TodayProjectionDomainAdapter({providers:[blockedProvider]});blocked.project();assert.equal(blocked.resume('resume-2').status,'CONTINUATION_TARGET_UNRESOLVED');
}

// Today semantic commands inherit adapter availability; why is disabled without exact selected version.
{
  const provider=observed('commands',[{id:'rec-3',kind:'RECOMMENDATION',recommendation:{sourceRef:'rq:source-1',version:'v3',reasonCode:'RECONCILE'}}]);
  const adapter=new TodayProjectionDomainAdapter({providers:[provider]}),commands=new CommandRegistry();
  bindTodaySurface({commands,adapter});
  assert.equal(commands.availability('today.why',{itemId:'rec-3',version:'v3'}).enabled,false);
  adapter.selectRecommendation('rec-3','v3');assert.equal(commands.availability('today.why',{itemId:'rec-3',version:'v3'}).enabled,true);
  assert.equal(commands.availability('today.filter',{value:'NOPE'}).enabled,false);
}

// Shell: five semantic global destinations are a current baseline while all product routes remain registered.
{
  const areas=CEP_PRODUCT_DESTINATION_REGISTRY.globalAreas();
  assert.equal(CEP_GLOBAL_AREA_BASELINE.length,5);assert.deepEqual(areas.map(a=>a.id),['W01','W02','W03','W04','W05']);
  assert.equal(CEP_PRODUCT_DESTINATION_REGISTRY.has('shell'),true);assert.equal(CEP_PRODUCT_DESTINATION_REGISTRY.has('validation'),true);
  const descriptor=CEP_PRODUCT_DESTINATION_REGISTRY.descriptor();assert.equal(descriptor.destinationCountFrozen,false);assert.equal(descriptor.globalAreaBaselineCount,5);assert.ok(descriptor.count>5);
}

// Shell command semantics: registered once, route search stays in canonical command bus, recover falls back to heading.
{
  const calls=[];let dirty=false;
  const navigation={
    surface:'today',destinationRegistry:CEP_PRODUCT_DESTINATION_REGISTRY,
    destinations:()=>CEP_PRODUCT_DESTINATION_REGISTRY.list(),globalAreas:()=>CEP_PRODUCT_DESTINATION_REGISTRY.globalAreas(),
    areaDestination:area=>CEP_PRODUCT_DESTINATION_REGISTRY.globalAreas().find(x=>x.id===area).defaultSurfaceId,
    destination:id=>CEP_PRODUCT_DESTINATION_REGISTRY.get(id),
    descriptor:()=>({registeredSurfaceCount:CEP_PRODUCT_DESTINATION_REGISTRY.list().length}),
    navigate:(target)=>{calls.push(['navigate',target]);return {ok:true,status:'NAVIGATING',destination:target}},
    restoreBookmark:async()=>true,focusDestinationHeading:()=>({ok:true,status:'DESTINATION_HEADING_FOCUSED'}),
    isDirty:()=>dirty,navigateWithPreservedRecovery:(target,receipt)=>receipt?.preserved?{ok:true,status:'NAVIGATING_WITH_VERIFIED_RECOVERY',destination:target}:{ok:false,status:'PRESERVE_RECOVERY_RECEIPT_REQUIRED'},
    api:{Commands:{execute:()=>({persisted:false})}},workspace:{openCommandPalette:()=>true}
  };
  const commands=new CommandRegistry();const binding=bindShellSurfaceCommands({commands,navigation});bindShellSurfaceCommands({commands,navigation});
  assert.equal(commands.commands.get('shell.search').owner,'GlobalShellNavigationOwner');
  const search=commands.execute('shell.search',{route:'palette',query:'audit'});assert.equal(search.ok,true);assert.ok(search.items.some(x=>x.id==='audit'));
  const recover=await commands.execute('shell.recover',{});assert.equal(recover.status,'DESTINATION_HEADING_FOCUSED');
  assert.equal(commands.execute('shell.navigate',{area:'W04'}).destination,'evidence');
  const ctx=createShellRouteContextProjection(navigation);assert.equal(ctx.canonicalDomainWrites,false);assert.equal(ctx.destinationCountFrozen,false);assert.equal(ctx.globalDestinations.length,5);
  dirty=true;assert.equal(commands.execute('shell.leaveDirty',{area:'W02'}).status,'DIRTY_DEPARTURE_CHOICE_REQUIRED');
  assert.equal(commands.execute('shell.leaveDirty',{area:'W02',choice:'cancel'}).status,'DIRTY_DEPARTURE_CANCELLED');
  assert.equal(commands.execute('shell.leaveDirty',{area:'W02',choice:'preserve'}).status,'PRESERVE_RECOVERY_RECEIPT_REQUIRED');
  assert.equal(commands.execute('shell.leaveDirty',{area:'W02',choice:'preserve',recoveryReceipt:{preserved:true,owner:'RecoveryOwner'}}).status,'NAVIGATING_WITH_VERIFIED_RECOVERY');
  assert.equal(binding.shellVisualComposition,'REOPENED__NO_OBSOLETE_CHROME_AUTHORITY');
}

console.log('S07 W01/W02 Shell + Today contracts: PASS');
