import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {W03ResultsDomain} from '../../adapters/results/domain.js';
import {resultsLocale,resultsT} from './i18n.js';
export const RESULTS_SURFACE_CONTRACT=Object.freeze({id:'results',workspace:'W03',owner:'W03ResultsDomain',families:['TimelineReplay','AnalyticalCompare','AuditProvenance','SpatialInteraction'],interactionModel:'WORKSPACE_FIRST_HISTORICAL_ANALYSIS',centralWiring:'CONTROLLER_CONVERGENCE_REQUIRED'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CAP_HISTORY=[];
function noteCapabilityState(id,label,receipt){
  if(typeof document==='undefined')return;
  const t=resultsT(resultsLocale(document));
  const ok=receipt?.ok!==false&&receipt?.enabled!==false;
  const code=String(receipt?.code||receipt?.status||(ok?'ACCEPTED':'UNAVAILABLE'));
  const reason=String(receipt?.reason||receipt?.message||'');
  const pane=document.querySelector('#leftPane .pbody');if(!pane)return;
  let block=pane.querySelector('[data-results-cap-state]');
  const last=CAP_HISTORY[CAP_HISTORY.length-1];
  const duplicate=!!last&&last.id===id&&last.code===code&&last.ok===ok&&last.reason===reason;
  if(!duplicate){ // one history row per distinct capability state; no render churn
    CAP_HISTORY.push({id,label,code,ok,reason});
    if(CAP_HISTORY.length>4)CAP_HISTORY.shift();
  }
  if(duplicate&&block)return;
  if(!block){block=document.createElement('section');block.className='m0-domain-nav';block.dataset.resultsCapState='';pane.append(block)}
  block.innerHTML=`<h2>${esc(t.capability.title)}</h2><p>${esc(t.capability.lede)}</p>
    <dl class="m0-semantic-list">${CAP_HISTORY.slice().reverse().map(item=>`<div><dt>${esc(item.label)}</dt><dd dir="ltr"><bdi class="m0-technical-token" dir="ltr" title="${esc(item.code)}">${esc(item.code)}</bdi>${item.ok?'':` · ${esc(t.capability.fabricated)}`}</dd></div>`).join('')}</dl>
    <p class="state-token" data-state="${ok?'available':'unavailable'}"><strong>${ok?esc(t.capability.requested):esc(t.capability.unavailable)}</strong> · ${esc(t.capability.last)}: ${esc(label)} → ${esc(code)}${reason?` · ${esc(reason)}`:''}</p>`;
}
export function composeResultsSurface({domain=new W03ResultsDomain(),bus=new SemanticCommandBus(),shared={}}={}){
  if(!shared.spatialRelation)throw Error('RESULTS_SHARED_SPATIAL_REQUIRED');
  // Ownership loop: when the Controller injects the shared owners, they MUST be the exact
  // instances the domain replays/compares through. A split instance would let the surface
  // claim TimelineReplayOwner/AnalyticalCompareOwner while a different owner acted.
  if(shared.timelineReplayOwner&&shared.timelineReplayOwner!==domain.replayOwner)throw Error('RESULTS_TIMELINE_REPLAY_OWNER_SPLIT');
  if(shared.analyticalCompareOwner&&shared.analyticalCompareOwner!==domain.compareOwner)throw Error('RESULTS_ANALYTICAL_COMPARE_OWNER_SPLIT');
  const exactRef=ref=>!!(ref?.resultId&&ref?.revisionId&&ref?.manifestDigest);
  const providerReady=()=>{const state=domain.providerAvailability();return state.state==='AVAILABLE'?true:{enabled:false,code:state.code,reason:state.reason,availabilityOwner:domain.owner};};
  const selected=ref=>providerReady()===true?(exactRef(ref)?true:{enabled:false,code:'RESULT_SELECTION_REQUIRED',reason:'Select an exact sealed Result revision.',availabilityOwner:domain.owner}):providerReady();
  const r=(id,label,run,available=()=>true)=>bus.registerCommand(id,domain.owner,label,p=>{
    // VISUAL_REAUDIT DEF-RES-3: the live Results route has no sealed Result provider, so a
    // capability request must still leave a *visible, truthful* trace. The surface's own LEFT
    // navigation region carries the capability state (one information item -> one authoritative
    // display location); no Result, replay cursor or comparison is ever fabricated.
    let receipt;try{receipt=run(p)}catch(error){noteCapabilityState(id,label,{ok:false,code:error?.code||'RESULTS_COMMAND_FAILED',reason:String(error?.message||error)});throw error}
    noteCapabilityState(id,label,receipt);
    return receipt;
  },p=>{
    // Availability refusals are part of the ownership loop: a refused capability request is
    // recorded as UNAVAILABLE in the same visible read-out (H4/DEF-RES-3), never silently dropped.
    const verdict=available(p);
    if(verdict!==true){
      const refusal=typeof verdict==='string'?{enabled:false,code:'UNAVAILABLE',reason:verdict,availabilityOwner:domain.owner}:{enabled:false,code:'UNAVAILABLE',reason:'',availabilityOwner:domain.owner,...verdict};
      noteCapabilityState(id,label,refusal);
    }
    return verdict;
  });
  r('results.replay','Replay recorded Result',p=>domain.replayResult(p?.ref||p),p=>selected(p?.ref||p));
  r('results.step','Step recorded Result',p=>domain.step(p?.delta),()=>domain.hasReplaySelection()?true:{enabled:false,code:'RESULT_REPLAY_NOT_SELECTED',reason:'Start a recorded replay before stepping.',availabilityOwner:domain.owner});
  r('results.compare','Compare sealed Results',p=>domain.compare(p),p=>providerReady()===true&&exactRef(p?.left)&&exactRef(p?.right)?true:providerReady()===true?{enabled:false,code:'RESULT_PAIR_REQUIRED',reason:'Select two exact sealed Result revisions for comparison.',availabilityOwner:domain.owner}:providerReady());
  r('results.annotate','Revise AAR analysis',p=>domain.annotate(p),p=>selected(p?.ref));
  r('results.handoff','Prepare candidate Evidence handoff',p=>domain.handoff(p),p=>selected(p?.ref));
  r('results.verifyDeterminism','Verify determinism',p=>domain.verifyDeterminism(p),()=>domain.determinismVerifier?true:{enabled:false,code:'DETERMINISM_PROVIDER_UNAVAILABLE',reason:'No admitted execution provider is bound for determinism verification.',availabilityOwner:domain.owner});
  return Object.freeze({contract:RESULTS_SURFACE_CONTRACT,domain,bus,shared,slots:Object.freeze({TOP:'Exact Result identity + Result/Replay/AAR/Compare modes + source-side handoff',LEFT:'typed sealed Result collection/navigation',CENTER:'HistoricalAnalysisWorkbench: TimelineReplayHost / AAR / AnalyticalCompare',RIGHT:'selected Result/Event/analysis/compare context',BOTTOM:'temporary recorded-event/AAR source inspection',TOOLBAR:'shared toolbar + domain command bindings',TRANSIENT:'shared transient/focus owner'}),ownerBindings:Object.freeze(['WorkspaceFoundation','SpatialInteractionKernel','RelationInteractionOwner','TimelineReplayOwner','TimelineReplayPresentationHost','AnalyticalCompareOwner','AnalyticalCompareHost','AuditProvenanceInteractionCore','SemanticCommandBus','ContextInspectorHost']),truthCeiling:Object.freeze({workspaceReadOnly:false,sealedFactsMutable:false,replayExecutesRuntime:false,replayCanonicalHistoryClaimByGenericOwner:false,evidenceAdmission:false,reviewDecision:false,masteryMutation:false,portfolioMutation:false,auditAuthority:false})})
}
