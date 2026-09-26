import {RQ_DOMAIN_OWNER,RQ_PROVIDER_TRUTH} from '../../adapters/rq/domain.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,RQ_DOMAIN_OWNER,label,run,available);return id;};
const MODES=Object.freeze(['CLAIMS','COMPARE','CONFLICTS','PROVENANCE','REVISION','HISTORY']);
const exactIdentity=ref=>ref&&typeof ref==='object'&&['sourceId','revision','digest','locator'].every(key=>typeof ref[key]==='string'&&ref[key].trim());
const normalizeMode=value=>MODES.includes(String(value||'').toUpperCase())?String(value).toUpperCase():'CLAIMS';

export function projectRqWorkbench({adapter,mode='CLAIMS',selection=null,compareContext={},bottomOpen=false}={}){
  if(!adapter||adapter.owner!==RQ_DOMAIN_OWNER)throw Error('RQ_DOMAIN_REQUIRED_FOR_PRESENTATION');
  const descriptor=adapter.descriptor(),availability=adapter.providerAvailability(),activeMode=normalizeMode(mode),selected=exactIdentity(selection)?structuredClone(selection):null;
  const compareAvailability=activeMode==='COMPARE'?adapter.compareAvailability(compareContext):null;
  const productUnavailable=descriptor.providerTruth===RQ_PROVIDER_TRUTH.UNAVAILABLE;
  const testOnly=descriptor.providerTruth===RQ_PROVIDER_TRUTH.DS01_TEST_ONLY;
  const epistemicState=productUnavailable?'UNAVAILABLE':testOnly?'TEST_ONLY_AVAILABLE':availability.epistemicState;
  return Object.freeze({
    identity:Object.freeze({surface:'rq',title:'Research & Quality',workspace:'W02',centerOwner:'AnalyticalResearchWorkbench',formalEvidenceReview:false,masteryAuthority:false,canonicalMutation:false}),
    visualAuthority:Object.freeze({classification:'REVIEWED_FINAL_CANDIDATE',final:false,promotionAllowed:false}),
    truth:Object.freeze({providerTruth:descriptor.providerTruth,providerClassification:descriptor.providerClassification,providerAdmitted:descriptor.providerAdmitted,providerTestOnly:descriptor.providerTestOnly,canonicalProductTruth:descriptor.canonicalProductTruth,epistemicState,analysisSessionPersistence:'UNAVAILABLE'}),
    top:Object.freeze({owner:'RQ_WORKFLOW_ACTION_HOME',modes:MODES,activeMode,commands:Object.freeze(['rq.search','rq.compare','rq.review','rq.provenance']),formalDecisionActions:Object.freeze([]),masteryActions:Object.freeze([])}),
    left:Object.freeze({owner:'SourceRevisionCollection',purpose:'sources/filters only',state:epistemicState,itemsAvailable:availability.enabled,emptyReason:productUnavailable?'No admitted Product SourceRevision provider is bound. Change scope or bind an admitted provider; DS01 data must not fill Product truth.':testOnly?'Non-production DS01 SourceRevision data is visible only inside bounded test evidence.':null}),
    center:Object.freeze({owner:'AnalyticalResearchWorkbench',dominant:true,mode:activeMode,state:epistemicState,selectionRequired:activeMode!=='CLAIMS'&&activeMode!=='HISTORY',compare:compareAvailability?Object.freeze({enabled:compareAvailability.enabled,code:compareAvailability.code,exactPairRequired:true,workingAnalysisContextRequired:true,scopeRequired:true}):null,emptyReason:productUnavailable?'Research & Quality is scoped correctly, but the current Product SourceRevision provider is unavailable. No fixture data has been substituted.':null}),
    right:Object.freeze({owner:'RQContextProjection',sameOwnerResponsive:true,selectedSourceRevision:selected,uniqueContextOnly:true,duplicatesCenterFacts:false,authorityFactsReadOnly:true}),
    bottom:Object.freeze({owner:'BottomDeepWorkCore',localReplacement:false,requestedOpen:bottomOpen===true,tabs:Object.freeze(['history','domain-diagnostics']),defaultOpen:false,sharedOwnerDependency:'CBF-003'}),
    boundaries:Object.freeze({researchQualityReview:'WORKING_ANALYSIS_ONLY',formalEvidenceReview:'PROHIBITED',masteryJudgment:'PROHIBITED',analyticalCompareOwner:'AnalyticalCompare',canonicalMutation:'OWNING_DOMAIN_HANDOFF_ONLY'})
  });
}

export function bindRqSurface({commands,adapter,workspace=null,presentation={}}={}){
  if(!commands||!adapter)throw Error('RQ_SURFACE_BINDING_REQUIRED');
  const ids=[
    register(commands,'rq.search','Search RQ sources',payload=>adapter.search(payload?.query,payload||{}),()=>adapter.providerAvailability()),
    register(commands,'rq.compare','Compare exact RQ revisions',payload=>adapter.compare(payload||{}),payload=>adapter.compareAvailability(payload||{})),
    register(commands,'rq.review','Review working RQ analysis',payload=>adapter.review(payload?.sessionId||payload?.workingAnalysisId,payload||{}),payload=>adapter.sessions.has(payload?.sessionId||payload?.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'}),
    register(commands,'rq.provenance','Inspect RQ provenance',payload=>adapter.provenance(payload?.sessionId||payload?.workingAnalysisId,payload||{}),payload=>adapter.sessions.has(payload?.sessionId||payload?.workingAnalysisId)||{enabled:false,code:'RQ_ANALYSIS_SESSION_REQUIRED',reason:'Open an exact RQ compare session first.'})
  ];
  const provider=adapter.descriptor(),workbench=projectRqWorkbench({adapter,...presentation});
  workspace?.status?.(provider.providerAdmitted?'RQ · WORKING analysis · exact SourceRevision context required · durable Save unavailable':provider.providerTestOnly?'RQ · DS01 TEST-ONLY SourceRevision truth · non-canonical · durable Save unavailable':'RQ · current provider unavailable · no Product SourceRevision corpus admitted · durable Save unavailable');
  return {surface:'rq',owner:adapter.owner,commands:ids,sharedFamilyOwner:adapter.compareOwner.owner,providerId:provider.providerId,providerAdmitted:provider.providerAdmitted,providerTestOnly:provider.providerTestOnly,providerClassification:provider.providerClassification,providerTruth:provider.providerTruth,canonicalProductTruth:provider.canonicalProductTruth,epistemicState:provider.epistemicState,analysisSessionPersistence:'UNAVAILABLE',formalReviewAuthority:false,visualReferenceCeiling:'REVIEWED_FINAL_CANDIDATE',compareContext:'EXACT_SOURCE_REVISION_PAIR_PLUS_SCOPE',workbench};
}
