import {VISUALIZE_DOMAIN_OWNER} from '../../adapters/visualize/domain.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,VISUALIZE_DOMAIN_OWNER,label,run,available);return id;};
const SHARED_SPATIAL_COMMANDS=Object.freeze(['spatial.connect','spatial.relation.commit','relation.edit','relation.undo','relation.redo','spatial.fit','spatial.align','spatial.distribute']);
export function bindVisualizeSurface({commands,adapter,workspace=null}={}){
  if(!commands||!adapter)throw Error('VISUALIZE_SURFACE_BINDING_REQUIRED');
  const canonical=adapter.canonicalProjection(),sharedCommandOwners=Object.fromEntries(SHARED_SPATIAL_COMMANDS.filter(id=>hasCommand(commands,id)).map(id=>[id,commands.commands.get(id).owner])),missingSharedCommands=SHARED_SPATIAL_COMMANDS.filter(id=>!hasCommand(commands,id));
  const ids=[
    register(commands,'visualize.select','Select representation',payload=>adapter.select(payload),payload=>adapter.selectionAvailability(payload)),
    register(commands,'visualize.link','Link canonical objects',payload=>adapter.link(payload),payload=>adapter.linkAvailability(payload)),
    register(commands,'visualize.move','Move representations',payload=>adapter.view(payload.mode).move(payload),payload=>adapter.selectionAvailability(payload)),
    register(commands,'visualize.edit','Edit canonical object',payload=>adapter.edit(payload),payload=>adapter.editAvailability(payload)),
    register(commands,'visualize.viewport','Adjust spatial viewport',payload=>adapter.view(payload.mode).viewport(payload),payload=>['TREE','PATH','GRAPH','CANVAS'].includes(String(payload.mode||'').toUpperCase())||{enabled:false,code:'VISUALIZE_VIEW_MODE_REQUIRED',reason:'Tree/Path/Graph/Canvas view context is required.'})
  ];
  workspace?.status?.(canonical.ok?(canonical.canonical===true?'Visualize · canonical provider bound · one shared Spatial engine':'Visualize · source-grounded local acceptance projection · canonical provider unavailable'):'Visualize · canonical data unavailable · local graph is SYNTHETIC representation only');
  return {surface:'visualize',owner:adapter.owner,registeredCommands:ids,requiredSharedCommands:[...SHARED_SPATIAL_COMMANDS],sharedCommandOwners,missingSharedCommands,spatialOwner:adapter.model.interactionKernel.ownerId,viewAdapters:adapter.viewDescriptors(),canonicalDataProvider:canonical.ok?(canonical.canonical===true?'BOUND_CANONICAL':'BOUND_LOCAL_ACCEPTANCE_PROJECTION'):'UNAVAILABLE',canonicalTruth:canonical.ok?(canonical.canonical===true?'PROVIDER_BOUND_CANONICAL':'LOCAL_ACCEPTANCE_PROJECTION_ONLY'):'UNAVAILABLE',localGraphTruth:canonical.ok?(canonical.canonical===true?'REPRESENTATION_ONLY':'LOCAL_ACCEPTANCE_REPRESENTATION_ONLY'):'SYNTHETIC_REPRESENTATION_ONLY',fixtureIsCanonical:false,universalVirtualizationOwner:false};
}
