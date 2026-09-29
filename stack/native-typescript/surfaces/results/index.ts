import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {W03ResultsDomain} from '../../adapters/results/domain.js';
export const RESULTS_SURFACE_CONTRACT=Object.freeze({id:'results',workspace:'W03',owner:'W03ResultsDomain',families:['TimelineReplay','AnalyticalCompare','AuditProvenance','SpatialInteraction'],interactionModel:'WORKSPACE_FIRST_HISTORICAL_ANALYSIS',centralWiring:'CONTROLLER_CONVERGENCE_REQUIRED'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CAP_HISTORY=[];
function noteCapabilityState(id,label,receipt){
  if(typeof document==='undefined')return;
  const ok=receipt?.ok!==false&&receipt?.enabled!==false;
  const code=String(receipt?.code||receipt?.status||(ok?'ACCEPTED':'UNAVAILABLE'));
  const reason=String(receipt?.reason||receipt?.message||'');
  CAP_HISTORY.push({id,label,code,ok});
  if(CAP_HISTORY.length>4)CAP_HISTORY.shift();
  const pane=document.querySelector('#leftPane .pbody');if(!pane)return;
  let block=pane.querySelector('[data-results-cap-state]');
  if(!block){block=document.createElement('section');block.className='m0-domain-nav';block.dataset.resultsCapState='';pane.append(block)}
  block.innerHTML=`<h2>Capability state</h2><p>Recorded Results stay sealed. Requesting a capability never creates a Result, replay cursor or comparison.</p>
    <dl class="m0-semantic-list">${CAP_HISTORY.slice().reverse().map(item=>`<div><dt>${esc(item.label)}</dt><dd dir="ltr"><bdi class="m0-technical-token" dir="ltr" title="${esc(item.code)}">${esc(item.code)}</bdi>${item.ok?'':' · no data was fabricated'}</dd></div>`).join('')}</dl>
    <p class="state-token" data-state="${ok?'available':'unavailable'}"><strong>${ok?'REQUESTED':'UNAVAILABLE'}</strong> · last request: ${esc(label)} → ${esc(code)}${reason?` · ${esc(reason)}`:''}</p>`;
}
export function composeResultsSurface({domain=new W03ResultsDomain(),bus=new SemanticCommandBus(),shared={}}={}){
  if(!shared.spatialRelation)throw Error('RESULTS_SHARED_SPATIAL_REQUIRED');
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
  },available);
  r('results.replay','Replay recorded Result',p=>domain.replayResult(p?.ref||p),p=>selected(p?.ref||p));
  r('results.step','Step recorded Result',p=>domain.step(p?.delta),()=>domain.hasReplaySelection()?true:{enabled:false,code:'RESULT_REPLAY_NOT_SELECTED',reason:'Start a recorded replay before stepping.',availabilityOwner:domain.owner});
  r('results.compare','Compare sealed Results',p=>domain.compare(p),p=>providerReady()===true&&exactRef(p?.left)&&exactRef(p?.right)?true:providerReady()===true?{enabled:false,code:'RESULT_PAIR_REQUIRED',reason:'Select two exact sealed Result revisions for comparison.',availabilityOwner:domain.owner}:providerReady());
  r('results.annotate','Revise AAR analysis',p=>domain.annotate(p),p=>selected(p?.ref));
  r('results.handoff','Prepare candidate Evidence handoff',p=>domain.handoff(p),p=>selected(p?.ref));
  r('results.verifyDeterminism','Verify determinism',p=>domain.verifyDeterminism(p),()=>domain.determinismVerifier?true:{enabled:false,code:'DETERMINISM_PROVIDER_UNAVAILABLE',reason:'No admitted execution provider is bound for determinism verification.',availabilityOwner:domain.owner});
  return Object.freeze({contract:RESULTS_SURFACE_CONTRACT,domain,bus,shared,slots:Object.freeze({TOP:'Exact Result identity + Result/Replay/AAR/Compare modes + source-side handoff',LEFT:'typed sealed Result collection/navigation',CENTER:'HistoricalAnalysisWorkbench: TimelineReplayHost / AAR / AnalyticalCompare',RIGHT:'selected Result/Event/analysis/compare context',BOTTOM:'temporary recorded-event/AAR source inspection',TOOLBAR:'shared toolbar + domain command bindings',TRANSIENT:'shared transient/focus owner'}),ownerBindings:Object.freeze(['WorkspaceFoundation','SpatialInteractionKernel','RelationInteractionOwner','TimelineReplayOwner','TimelineReplayPresentationHost','AnalyticalCompareOwner','AnalyticalCompareHost','AuditProvenanceInteractionCore','SemanticCommandBus','ContextInspectorHost']),truthCeiling:Object.freeze({workspaceReadOnly:false,sealedFactsMutable:false,replayExecutesRuntime:false,replayCanonicalHistoryClaimByGenericOwner:false,evidenceAdmission:false,reviewDecision:false,masteryMutation:false,portfolioMutation:false,auditAuthority:false})})
}
