import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {W03ScenarioDomain} from '../../adapters/scenarios/domain.js';
export const SCENARIOS_SURFACE_CONTRACT=Object.freeze({id:'scenarios',workspace:'W03',owner:'W03ScenarioDomain',archetype:'ScenarioAuthoringWorkbench',families:['UnifiedEditor','SpatialInteraction'],interaction:'WORKSPACE_FIRST',centralWiring:'CONTROLLER_CONVERGENCE_REQUIRED'});
export function composeScenariosSurface({domain=new W03ScenarioDomain(),bus=new SemanticCommandBus(),shared={}}={}){
  if(!shared.structuredHost||!shared.spatialRelation)throw Error('SCENARIOS_SHARED_STRUCTURED_AND_SPATIAL_REQUIRED');
  const r=(id,label,run,available=()=>true)=>bus.registerCommand(id,domain.owner,label,run,available);
  r('scenarios.author','Author Scenario',p=>domain.author(p),()=>domain.snapshot().lifecycle==='PUBLISHED'?{enabled:false,code:'PUBLISHED_REVISION_IMMUTABLE',reason:'Published Scenario revisions require scenarios.revise before mutation.',availabilityOwner:domain.owner}:true);
  r('scenarios.validate','Validate Scenario',p=>domain.recordValidation(p));
  r('scenarios.publish','Publish validated Scenario revision',p=>domain.publish(p),p=>{
    if(domain.snapshot().lifecycle==='PUBLISHED')return true;
    const context=p?.validationContext||p||{};
    const validation=domain.validate(context);
    if(!validation.ok)return {enabled:false,code:'SCENARIO_VALIDATION_REQUIRED_BEFORE_PUBLISH',reason:'Scenario validation and required Lab/provider bindings are required before publish.',errors:validation.errors,availabilityOwner:domain.owner};
    return true;
  });
  r('scenarios.revise','Revise Scenario',p=>domain.revise(p));
  r('scenarios.prepare','Prepare Scenario',p=>domain.prepare(p),p=>{if(domain.snapshot().lifecycle!=='PUBLISHED')return {enabled:false,code:'SCENARIO_REVISION_NOT_PUBLISHED',reason:'Run preparation requires an exact published Scenario revision.',availabilityOwner:domain.owner};return domain.validate(p).ok?true:{enabled:false,code:'SCENARIO_VALIDATION_FAILED',reason:'Scenario validation must pass with exact Lab/provider bindings before preparation.',availabilityOwner:domain.owner}});
  return Object.freeze({contract:SCENARIOS_SURFACE_CONTRACT,domain,bus,shared,slots:Object.freeze({TOP:'Scenario revision identity + lifecycle',LEFT:'orchestration facets and typed structure',CENTER:'ScenarioAuthoringWorkbench using shared Structured/Spatial owners',RIGHT:'selected phase/event/inject/decision/module/task context',BOTTOM:'validation + environment requirement/binding detail',TOOLBAR:'author/validate/revise/prepare plus typed creation commands',TRANSIENT:'shared transient owner'}),ownerBindings:Object.freeze(['WorkspaceFoundation','StructuredSurfaceHost','StructuredNavigationDescriptorOwner','SpatialInteractionKernel','RelationInteractionOwner','SemanticCommandBus','ContextInspectorHost']),truth:Object.freeze({portableScenario:true,labRefsExactRevision:true,environmentRequirementsDistinctFromBinding:true,publishedRevisionImmutable:true}),platformTruth:Object.freeze({activeKeyboardSource:'UNAVAILABLE_FALLBACK',nativeWindow:'UNAVAILABLE',osAlwaysOnTop:'UNAVAILABLE'})});
}
