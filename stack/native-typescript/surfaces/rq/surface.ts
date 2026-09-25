import {RQ_DOMAIN_OWNER} from '../../adapters/rq/domain.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,RQ_DOMAIN_OWNER,label,run,available);return id;};
export function bindRqSurface({commands,adapter,workspace=null}={}){
  if(!commands||!adapter)throw Error('RQ_SURFACE_BINDING_REQUIRED');
  const ids=[
    register(commands,'rq.search','Search RQ sources',payload=>adapter.search(payload.query,payload),()=>adapter.providerAvailability()),
    register(commands,'rq.compare','Compare exact RQ revisions',payload=>adapter.compare(payload),payload=>adapter.compareAvailability(payload)),
    register(commands,'rq.review','Review working analysis',payload=>adapter.review(payload.sessionId||payload.workingAnalysisId,payload),payload=>adapter.sessions.has(payload.sessionId||payload.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'}),
    register(commands,'rq.provenance','Inspect RQ provenance',payload=>adapter.provenance(payload.sessionId||payload.workingAnalysisId,payload),payload=>adapter.sessions.has(payload.sessionId||payload.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'})
  ];
  const provider=adapter.descriptor();
  workspace?.status?.(provider.providerAdmitted?'RQ · WORKING analysis · exact SourceRevision context required · durable Save unavailable':'RQ · current provider unavailable · no Product SourceRevision corpus admitted · durable Save unavailable');
  return {surface:'rq',owner:adapter.owner,commands:ids,sharedFamilyOwner:adapter.compareOwner.owner,providerId:provider.providerId,providerAdmitted:provider.providerAdmitted,providerClassification:provider.providerClassification,providerTruth:provider.providerTruth,epistemicState:provider.epistemicState||(provider.providerAdmitted?'AVAILABLE':'UNAVAILABLE'),analysisSessionPersistence:'UNAVAILABLE',formalReviewAuthority:false,visualReferenceCeiling:'REVIEWED_FINAL_CANDIDATE',compareContext:'EXACT_SOURCE_REVISION_PAIR_PLUS_SCOPE'};
}
