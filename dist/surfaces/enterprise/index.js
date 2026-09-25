import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {W03EnterpriseDomain} from '../../adapters/enterprise/domain.js';

export const ENTERPRISE_SURFACE_CONTRACT=Object.freeze({
  id:'enterprise',
  workspace:'W03',
  archetype:'DomainModelingSpatialWorkbench',
  owner:'W03EnterpriseDomain',
  interaction:'WORKSPACE_FIRST',
  globalReadEditMode:false,
  families:['SpatialInteraction','RelationInteraction'],
  centralWiring:'CONTROLLER_CONVERGENCE_REQUIRED'
});

export function composeEnterpriseSurface({relationAdapter,domain=new W03EnterpriseDomain({relationAdapter}),bus=new SemanticCommandBus()}={}){
  const register=(id,label,run)=>bus.registerCommand(id,domain.owner,label,run,payload=>domain.commandAvailability(id,payload));
  register('enterprise.create','Create Enterprise working revision',payload=>domain.create(payload));
  register('enterprise.baseline','Pin exact Enterprise Baseline',payload=>domain.pinBaseline(payload));
  register('enterprise.validate','Validate Enterprise revision',()=>domain.validate());
  register('enterprise.publish','Publish Enterprise revision',()=>domain.publish());
  register('enterprise.inspect','Inspect Enterprise selection',payload=>domain.inspect(payload));
  register('enterprise.edit','Edit typed Enterprise relation',payload=>domain.edit(payload));
  register('enterprise.revise','Create successor Enterprise revision',payload=>domain.revise(payload));
  register('enterprise.twin','Create or rebase Digital Twin',payload=>domain.setTwinBinding(payload));
  register('enterprise.handoff','Prepare Run handoff',()=>domain.handoff());
  return Object.freeze({
    contract:ENTERPRISE_SURFACE_CONTRACT,
    domain,bus,
    slots:Object.freeze({
      TOP:'Enterprise identity + lifecycle-aware command routes',
      LEFT:'Enterprise / Digital Twin / Revision / Baseline structure',
      CENTER:'DomainModelingSpatialWorkbench using shared Spatial/Relation owners',
      RIGHT:'Unique selected entity/relation/Twin context and provenance',
      BOTTOM:'Temporary validation/history/dependency deep work; closed by default',
      TOOLBAR:'shared toolbar slots with Enterprise command binding',
      TRANSIENT:'shared transient/focus/action owners'
    }),
    ownerBindings:Object.freeze(['WorkspaceFoundation','WorkspacePaneLayoutOwner','ReusableToolbarTemplateOwner','ContextInspectorHost','SemanticCommandBus','InputDirectionResolver','EpistemicStateContract','SpatialInteractionKernel','SpatialPresentationOwner','SpatialSelectionNavigationKernel','RelationInteractionOwner','RelationDomainAdapter']),
    truthCeiling:Object.freeze({fixtureIsCanonicalProductTruth:false,persistence:!!domain.persistence,globalReadEditMode:false}),
    platformTruth:Object.freeze({activeKeyboardSource:'UNAVAILABLE_FALLBACK',nativeWindow:'UNAVAILABLE',osAlwaysOnTop:'UNAVAILABLE'})
  });
}
