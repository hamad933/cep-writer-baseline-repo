import {CommandRegistry} from '../../foundation/models.js';
import {GLOBAL_SHELL_OWNER} from '../../foundation/global/shell/navigation.js';
import {bindShellSurfaceCommands,createShellRouteContextProjection} from '../shell/surface.js';
import {TodayProjectionDomainAdapter} from '../../adapters/today/domain.js';
import {bindTodaySurface} from '../today/surface.js';
import {createLibraryRuntimeComposition} from '../library/runtime-composition.js';
import {bindLibrarySurface} from '../library/surface.js';
import {createLearnRuntimeComposition} from '../../adapters/learn.js';
import {bindLearnSurface} from '../learn/surface.js';
import {RQDomainAdapter} from '../../adapters/rq/domain.js';
import {bindRqSurface} from '../rq/surface.js';
import {VisualizeDomainAdapter} from '../../adapters/visualize/domain.js';
import {bindVisualizeSurface} from '../visualize/surface.js';

export const W01_W02_RESCUE_COMPOSITION_CONTRACT=Object.freeze({
  id:'W01W02RescueComposition',version:'1.0.0',owner:'CG3_W01_W02_COVERAGE',
  surfaces:Object.freeze(['shell','today','library','learn','rq','visualize']),
  role:'THIN_GROUP_COMPOSITION__NO_SHARED_SEMANTIC_OWNER'
});

const requireShellNavigation=navigation=>{
  if(!navigation||navigation.owner!==GLOBAL_SHELL_OWNER)throw Error('CG3_SHARED_GLOBAL_SHELL_OWNER_REQUIRED');
  return navigation;
};
const requireSpatialCommands=commands=>{
  const required=['spatial.connect','spatial.relation.commit','relation.edit','relation.undo','relation.redo','spatial.fit','spatial.align','spatial.distribute'];
  const missing=required.filter(id=>!commands?.commands?.has(id));
  if(missing.length)throw Error('CG3_SHARED_SPATIAL_COMMAND_OWNER_REQUIRED:'+missing.join(','));
  return Object.fromEntries(required.map(id=>[id,commands.commands.get(id).owner]));
};

/**
 * CG3-owned thin composition. Shared Foundation/family owners are injected/consumed,
 * never recreated here. Final physical route cutover remains R6-owned.
 */
export function composeW01W02Rescue({
  commands=new CommandRegistry(),shellNavigation,todayProviders=[],librarySource,learnSource=null,
  rqRecords=[],visualizeProvider=null,visualizeRepresentations=[],workspace=null,analyticalCompareOwner=null
}={}){
  const navigation=requireShellNavigation(shellNavigation);
  const sharedSpatialOwners=requireSpatialCommands(commands);
  const shell=bindShellSurfaceCommands({commands,navigation});
  const shellContext=createShellRouteContextProjection(navigation);

  const todayAdapter=new TodayProjectionDomainAdapter({providers:todayProviders});
  const today=bindTodaySurface({commands,adapter:todayAdapter,workspace});

  const libraryRuntime=createLibraryRuntimeComposition({source:librarySource});
  const library=bindLibrarySurface({commands,structured:libraryRuntime.structured,libraryRuntime,workspace});

  const learnRuntime=createLearnRuntimeComposition({source:learnSource});
  const learn=bindLearnSurface({commands,learn:learnRuntime.learn,structured:learnRuntime.structured,workspace});

  const rqAdapter=new RQDomainAdapter(rqRecords,{analyticalCompareOwner});
  const rq=bindRqSurface({commands,adapter:rqAdapter,workspace});

  const visualizeAdapter=new VisualizeDomainAdapter({provider:visualizeProvider,representations:visualizeRepresentations});
  const visualize=bindVisualizeSurface({commands,adapter:visualizeAdapter,workspace});
  if(visualize.missingSharedCommands.length)throw Error('CG3_SHARED_SPATIAL_REPLAY_DRIFT:'+visualize.missingSharedCommands.join(','));

  return Object.freeze({
    contract:W01_W02_RESCUE_COMPOSITION_CONTRACT,commands,
    shell:Object.freeze({binding:shell,context:shellContext,owner:navigation.owner}),
    today:Object.freeze({adapter:todayAdapter,binding:today}),
    library:Object.freeze({runtime:libraryRuntime,binding:library}),
    learn:Object.freeze({runtime:learnRuntime,binding:learn}),
    rq:Object.freeze({adapter:rqAdapter,binding:rq}),
    visualize:Object.freeze({adapter:visualizeAdapter,binding:visualize}),
    shared:Object.freeze({shellOwner:navigation.owner,structuredOwner:libraryRuntime.structured.transactionOwner.owner,spatialCommandOwners:Object.freeze(sharedSpatialOwners)}),
    truth:Object.freeze({
      shellCanonicalDomainWrites:false,todayCanonicalWrites:false,
      rqFormalReviewAuthority:false,rqAnalysisPersistence:'UNAVAILABLE',
      visualizeCanonicalProvider:visualize.canonicalDataProvider,
      visualizeLocalGraphTruth:visualize.localGraphTruth,
      representationStateIsCanonicalRelationTruth:false,
      finalPhysicalLibraryRouteCutover:'R6_OWNED_NOT_PERFORMED'
    })
  });
}
