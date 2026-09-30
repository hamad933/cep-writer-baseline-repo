import {RQ_DOMAIN_OWNER} from '../../adapters/rq/domain.js';
import {mountRqWorkspace,refreshRqWorkspace,RQ_COMPOSITION_OWNER} from './composition.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,RQ_DOMAIN_OWNER,label,run,available);return id;};

/**
 * MOUNT NOTE (authority gap, filed not applied).
 * `surfaces/m0-controller-composition.ts` and `main.ts` are writer-forbidden hotspots
 * (`controller/12_execution/04_hotspot_register.md`), so the rq route still calls the generic
 * `renderTypedCollectionStage` after this binding returns. The surface therefore composes itself
 * through a guarded deferred mount: the callback only runs when the shared controller has already
 * marked `#foundationStage[data-m0-composition="rq"]` for this route, so it can never hijack
 * another surface's stage, and it never writes outside `surfaces/rq/`.
 * The canonical direct hook (m0 imports `mountRqWorkspace` and calls it instead of
 * `renderTypedCollectionStage`) is filed in
 * `writer-output/W02-RESEARCH-QUALITY/SERIALIZED_HOTSPOT_REQUEST.md` for the Coordinator slot.
 */
const scheduleWorkspaceMount=(commands,adapter,workspace)=>{
  if(!workspace||typeof document==='undefined'||typeof requestAnimationFrame!=='function')return;
  const run=()=>{
    try{
      const params=new URLSearchParams(location.search);
      if(params.get('surface')!=='rq')return;
      const stage=document.querySelector('#foundationStage');
      if(!stage||stage.dataset.m0Composition!=='rq'||!document.contains(stage))return;
      if(stage.dataset.rqSurface==='rq.source-claim-reconciliation'){refreshRqWorkspace();return;}
      mountRqWorkspace({stage,workspace,registry:commands,adapter});
    }catch(error){
      // A surface must fail visibly rather than silently; the generic stage stays as fallback.
      console.error('[rq] workspace composition did not mount',error);
    }
  };
  // Double rAF: the shared controller finishes its synchronous mount (stage + regions + toolbar)
  // in the current task; the next frame is the first safe point to replace it.
  requestAnimationFrame(()=>requestAnimationFrame(run));
};

export function bindRqSurface({commands,adapter,workspace=null}={}){
  if(!commands||!adapter)throw Error('RQ_SURFACE_BINDING_REQUIRED');
  const ids=[
    register(commands,'rq.search','Search RQ sources',payload=>adapter.search(payload.query,payload),()=>adapter.providerAvailability()),
    register(commands,'rq.compare','Compare exact RQ revisions',payload=>adapter.compare(payload),payload=>adapter.compareAvailability(payload)),
    register(commands,'rq.review','Review working analysis',payload=>adapter.review(payload.sessionId||payload.workingAnalysisId,payload),payload=>adapter.sessions.has(payload.sessionId||payload.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'}),
    register(commands,'rq.provenance','Inspect RQ provenance',payload=>adapter.provenance(payload.sessionId||payload.workingAnalysisId,payload),payload=>adapter.sessions.has(payload.sessionId||payload.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'})
  ];
  const provider=adapter.descriptor();
  workspace?.status?.(provider.providerAdmitted?'RQ · WORKING analysis · exact SourceRevision context required · durable Save unavailable':'RQ · current provider unavailable · presentation fixtures are labelled working scope · durable Save unavailable');
  const binding={surface:'rq',owner:adapter.owner,commands:ids,sharedFamilyOwner:adapter.compareOwner.owner,providerId:provider.providerId,providerAdmitted:provider.providerAdmitted,providerClassification:provider.providerClassification,providerTruth:provider.providerTruth,epistemicState:provider.epistemicState||(provider.providerAdmitted?'AVAILABLE':'UNAVAILABLE'),analysisSessionPersistence:'UNAVAILABLE',formalReviewAuthority:false,visualReferenceCeiling:'REVIEWED_FINAL_CANDIDATE',compareContext:'EXACT_SOURCE_REVISION_PAIR_PLUS_SCOPE',compositionOwner:RQ_COMPOSITION_OWNER};
  scheduleWorkspaceMount(commands,adapter,workspace);
  return binding;
}
