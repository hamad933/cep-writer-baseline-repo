import {W03RunDomain} from '../../adapters/runs/domain.js';
import {W03ResultsDomain} from '../../adapters/results/domain.js';
import {composeEnterpriseSurface} from '../enterprise/index.js';
import {composeScenariosSurface} from '../scenarios/index.js';
import {composeLabsSurface} from '../labs/index.js';
import {composeRunsSurface} from '../runs/index.js';
import {composeResultsSurface} from '../results/index.js';

const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};
const SURFACE_IDS=Object.freeze(['enterprise','scenarios','labs','runs','results']);
const REGION_KEYS=Object.freeze(['TOP','TOOLBAR','LEFT','CENTER','RIGHT','BOTTOM','TRANSIENT']);

export const W03_RESCUE_GROUP_CONTRACT=Object.freeze({
  id:'CG4_W03_STUDIO_COVERAGE',
  workspace:'W03',
  interaction:'WORKSPACE_FIRST',
  globalReadEditMode:false,
  primarySurfaces:SURFACE_IDS,
  causalChain:Object.freeze(['Enterprise Definition','Digital Twin Revision','Baseline','Scenario/Lab Definition','immutable Run Manifest','deterministic runtime','sealed Result revision','Replay/AAR/Compare','Candidate Evidence handoff']),
  sharedOwnerLaw:'GLOBAL FOUNDATION -> FAMILY ENGINE -> REUSABLE HOST -> THIN DOMAIN ADAPTER -> SURFACE COMPOSITION',
  timelineReplayOwnerCount:1,
  centralWiring:'R6_GLOBAL_CONVERGENCE_REQUIRED',
  prohibitedCentralMutation:Object.freeze(['main.ts','surfaces/m0-controller-composition.ts'])
});

function requireShared(shared){
  if(!shared||typeof shared!=='object')throw Error('W03_SHARED_BINDINGS_REQUIRED');
  if(!shared.structuredHost)throw Error('W03_STRUCTURED_HOST_BINDING_REQUIRED');
  if(!shared.spatialRelation)throw Error('W03_SPATIAL_RELATION_BINDING_REQUIRED');
  const replay=shared.timelineReplayOwner;
  const compare=shared.analyticalCompareOwner;
  const operational=shared.operationalSessionOwner;
  if(!replay||!compare||!operational)throw Error('W03_CONTROLLER_SHARED_OWNER_BINDINGS_REQUIRED');
  if(replay?.owner!=='TimelineReplayOwner')throw Error('W03_TIMELINE_REPLAY_OWNER_REQUIRED');
  if(compare?.owner!=='AnalyticalCompareOwner')throw Error('W03_ANALYTICAL_COMPARE_OWNER_REQUIRED');
  if(operational?.owner!=='OperationalSessionOwner')throw Error('W03_OPERATIONAL_SESSION_OWNER_REQUIRED');
  return Object.freeze({...shared,timelineReplayOwner:replay,analyticalCompareOwner:compare,operationalSessionOwner:operational});
}

function regionContract(surface){
  const slots=surface?.slots||{};
  for(const key of REGION_KEYS)if(typeof slots[key]!=='string'||!slots[key].trim())throw Error(`W03_TYPED_REGION_MISSING:${surface?.contract?.id||'unknown'}:${key}`);
  return Object.freeze(Object.fromEntries(REGION_KEYS.map(key=>[key,slots[key]])));
}

function selectedObject(surfaceId,surface){
  const domain=surface.domain;
  if(surfaceId==='enterprise')return domain.snapshot().selection;
  if(surfaceId==='scenarios')return domain.selectionContext();
  if(surfaceId==='labs')return domain.selectionContext();
  if(surfaceId==='runs'){
    const workspace=domain.workspace();
    return freeze({kind:'run',id:workspace.identity.runId,lifecycle:workspace.run.lifecycle,provider:workspace.provider.id||workspace.provider.providerId||'InternalSimulationAdapter',runtimeTruth:workspace.provider.runtimeTruth||'INTERNAL_SIMULATION'});
  }
  if(surfaceId==='results'){
    const replay=domain.replayState();
    return freeze(replay.ref?{kind:'result',id:replay.ref.resultId,revisionId:replay.ref.revisionId,manifestDigest:replay.ref.manifestDigest,replayState:replay.state}:{kind:'result',id:null,replayState:'IDLE'});
  }
  return null;
}

function surfaceProjection(surfaceId,surface){
  return freeze({
    id:surfaceId,
    archetype:surface.contract.archetype||surface.contract.interactionModel||surface.contract.families?.join('+')||'W03Studio',
    interaction:surface.contract.interaction||surface.contract.interactionModel||'WORKSPACE_FIRST',
    globalReadEditMode:false,
    slots:regionContract(surface),
    selectedObject:selectedObject(surfaceId,surface),
    commands:surface.bus.items().map(item=>({id:item.id,label:item.label,owner:item.owner,enabled:item.enabled,code:item.code,availabilityOwner:item.availabilityOwner})),
    ownerBindings:[...(surface.ownerBindings||[])],
    truthCeiling:surface.truthCeiling||surface.truth||surface.platformTruth||null
  });
}

/**
 * CG4 owns only W03 cross-surface composition. It reuses canonical family owners and leaf domains;
 * no central route wiring, generic replay engine, persistence owner, Windows provider, or shared host is defined here.
 */
export function composeW03RescueGroup({shared:inputShared={},enterprise={},scenarios={},labs={},runs={},results={}}={}){
  const shared=requireShared(inputShared);
  const enterpriseSurface=composeEnterpriseSurface(enterprise);
  const scenariosSurface=composeScenariosSurface({...scenarios,shared});
  const labsSurface=composeLabsSurface({...labs,shared});

  const runsDomain=runs.domain||new W03RunDomain({...runs.domainOptions,sessionOwner:shared.operationalSessionOwner});
  if(runs.domain&&runs.domain.sessionOwner!==shared.operationalSessionOwner)throw Error('W03_RUNS_OPERATIONAL_SESSION_OWNER_SPLIT');
  const runsSurface=composeRunsSurface({...runs,domain:runsDomain,shared});

  const resultsDomain=results.domain||new W03ResultsDomain({...results.domainOptions,timelineReplayOwner:shared.timelineReplayOwner,analyticalCompareOwner:shared.analyticalCompareOwner});
  if(resultsDomain.replayOwner!==shared.timelineReplayOwner)throw Error('W03_RESULTS_TIMELINE_REPLAY_OWNER_SPLIT');
  if(resultsDomain.compareOwner!==shared.analyticalCompareOwner)throw Error('W03_RESULTS_ANALYTICAL_COMPARE_OWNER_SPLIT');
  const resultsSurface=composeResultsSurface({...results,domain:resultsDomain,shared});

  const surfaces=Object.freeze({enterprise:enterpriseSurface,scenarios:scenariosSurface,labs:labsSurface,runs:runsSurface,results:resultsSurface});
  for(const id of SURFACE_IDS){
    const contract=surfaces[id].contract;
    const interaction=String(contract.interaction||contract.interactionModel||'');
    if(!interaction.includes('WORKSPACE_FIRST'))throw Error(`W03_WORKSPACE_FIRST_REQUIRED:${id}`);
    if(contract.globalReadEditMode===true)throw Error(`W03_GLOBAL_READ_EDIT_FORBIDDEN:${id}`);
    regionContract(surfaces[id]);
  }
  if(resultsSurface.domain.replayOwner!==shared.timelineReplayOwner)throw Error('W03_TIMELINE_REPLAY_OWNER_COUNT_INVALID');

  return Object.freeze({
    contract:W03_RESCUE_GROUP_CONTRACT,
    shared,
    surfaces,
    surfaceIds:SURFACE_IDS,
    regionKeys:REGION_KEYS,
    surface(id){if(!SURFACE_IDS.includes(id))throw Error(`W03_UNKNOWN_SURFACE:${id}`);return surfaces[id]},
    project(id){const surface=this.surface(id);return surfaceProjection(id,surface)},
    commandState(id,commandId,payload={}){return this.surface(id).bus.availability(commandId,payload)},
    execute(id,commandId,payload={}){return this.surface(id).bus.execute(commandId,payload)},
    truth:freeze({
      workspaceFirst:true,
      globalReadEditMode:false,
      objectImmutabilityDoesNotMakeSurfaceReadOnly:true,
      timelineReplayOwner:shared.timelineReplayOwner.owner,
      timelineReplayOwnerInstancesInGroup:1,
      analyticalCompareOwner:shared.analyticalCompareOwner.owner,
      runsRuntimeTruth:'INTERNAL_SIMULATION',
      windowsConptyPass:false,
      windowsInputPass:false,
      nativeWindowPass:false,
      realTerminalPass:false,
      centralWiringPerformed:false
    })
  });
}
