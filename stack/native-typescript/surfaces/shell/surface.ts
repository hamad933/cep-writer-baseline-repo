import {CEP_GLOBAL_AREA_BASELINE,DEFAULT_SHELL_DESTINATION_DESCRIPTORS,createShellDestinationRegistry} from '../../foundation/global/shell/destination-registry.js';

export const STRONG_WAVE_W01_DESTINATION_DESCRIPTORS=Object.freeze([
  Object.freeze({id:'today',area:'W01',labels:Object.freeze({ar:'اليوم',en:'Today'}),description:Object.freeze({ar:'استئناف العمل والإسقاطات',en:'Resume work and projections'})}),
  Object.freeze({id:'rq',area:'W02',labels:Object.freeze({ar:'البحث',en:'RQ'}),description:Object.freeze({ar:'تحليل ومقارنة المراجع',en:'Research analysis and comparison'})})
]);

/** Compatibility helper for bounded specialist tests only. Final product registry remains centrally composed. */
export function createStrongWaveShellDestinationRegistry(){return createShellDestinationRegistry([...DEFAULT_SHELL_DESTINATION_DESCRIPTORS,...STRONG_WAVE_W01_DESTINATION_DESCRIPTORS],{defaultId:'library'});}

const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const targetFor=(navigation,payload={})=>{
  const destination=String(payload.destination||'');
  if(destination&&navigation.destinationRegistry?.has?.(destination))return destination;
  const area=String(payload.area||'');
  if(CEP_GLOBAL_AREA_BASELINE.some(item=>item.id===area))return navigation.areaDestination(area);
  return '';
};
const searchItems=(navigation,query='')=>{const q=String(query||'').trim().toLocaleLowerCase('en-US');return navigation.destinations().filter(item=>!q||[item.id,item.area,item.labels.ar,item.labels.en,item.description.ar,item.description.en].some(value=>String(value).toLocaleLowerCase('en-US').includes(q)));};

export function createShellRouteContextProjection(navigation){
  if(!navigation)throw Error('SHELL_NAVIGATION_REQUIRED');
  const descriptor=navigation.descriptor(),active=navigation.destination(navigation.surface),areas=navigation.globalAreas();
  return Object.freeze({
    owner:'GlobalShellNavigationOwner',projection:'RouteContext',surface:navigation.surface,activeArea:active.area,
    activeSurface:Object.freeze({id:active.id,labels:active.labels,description:active.description}),
    globalDestinations:Object.freeze(areas.map(item=>Object.freeze({area:item.id,labels:item.labels,description:item.description,target:navigation.areaDestination(item.id)}))),
    areaSurfaces:Object.freeze(navigation.destinations().filter(item=>item.area===active.area&&item.id!=='shell').map(item=>Object.freeze({id:item.id,labels:item.labels,description:item.description}))),
    history:Object.freeze({owner:'window.history',back:true,forward:true,restoreContext:true}),
    routeStateIsDomainState:false,routeStateIsPreference:false,destinationCountFrozen:false,registeredSurfaceCount:descriptor.registeredSurfaceCount,
    canonicalDomainWrites:false
  });
}

export function bindShellSurfaceCommands({commands,navigation}={}){
  if(!commands||!navigation)throw Error('SHELL_SURFACE_BINDING_REQUIRED');
  const owner='GlobalShellNavigationOwner',register=(id,label,run,available=()=>true)=>{if(!hasCommand(commands,id))commands.register(id,owner,label,run,available);return id;};
  const ids=[
    register('shell.navigate','Navigate to product destination',payload=>{const target=targetFor(navigation,payload);return target?navigation.navigate(target,payload.invoker||null):{ok:false,status:'DESTINATION_REQUIRED'};},payload=>!!targetFor(navigation,payload)||'Choose a current global destination or registered product surface'),
    register('shell.recover','Restore Shell bookmark',async payload=>{
      if(payload.bookmark){const restored=await navigation.restoreBookmark(payload.bookmark);return restored?{ok:true,status:'BOOKMARK_RESTORED'}:{ok:false,status:'BOOKMARK_RESTORE_UNRESOLVED'};}
      return navigation.focusDestinationHeading();
    }),
    register('shell.search','Open or query Shell command navigation',payload=>{
      if(payload.route==='palette'||payload.queryOnly===true)return {ok:true,status:'DESTINATION_SEARCH',items:searchItems(navigation,payload.query)};
      const opened=navigation.workspace?.openCommandPalette?.()===true;
      const input=document.querySelector?.('#commandSearch');
      if(opened&&input&&payload.query!==undefined){input.value=String(payload.query||'');input.dispatchEvent(new Event('input',{bubbles:true}));}
      return {ok:opened,status:opened?'COMMAND_PALETTE_OPEN':'COMMAND_PALETTE_UNAVAILABLE',items:searchItems(navigation,payload.query)};
    },payload=>payload?.isComposing===true?'Finish the active IME composition first':true),
    register('shell.leaveDirty','Resolve guarded dirty departure',payload=>{
      const target=targetFor(navigation,payload);if(!target)return {ok:false,status:'DESTINATION_REQUIRED'};
      if(!navigation.isDirty())return navigation.navigate(target,payload.invoker||null);
      const choice=String(payload.choice||'').toLowerCase();
      if(choice==='cancel'||!choice)return {ok:false,status:choice==='cancel'?'DIRTY_DEPARTURE_CANCELLED':'DIRTY_DEPARTURE_CHOICE_REQUIRED',surface:navigation.surface,destination:target,mutated:false};
      if(choice==='save'){
        const save=navigation.api?.Commands?.execute?.('document.commit',{route:'shell-leave-dirty',reason:'save-and-leave'});
        if(save?.persisted!==true)return {ok:false,status:'SAVE_ACK_REQUIRED',surface:navigation.surface,destination:target,saveReceipt:save||null};
        if(navigation.isDirty())return {ok:false,status:'SAVE_ACK_DIRTY_STATE_UNRESOLVED',surface:navigation.surface,destination:target,saveReceipt:save};
        return navigation.navigate(target,payload.invoker||null);
      }
      if(choice==='preserve')return navigation.navigateWithPreservedRecovery(target,payload.recoveryReceipt,payload.invoker||null);
      return {ok:false,status:'DIRTY_DEPARTURE_CHOICE_INVALID',allowed:['cancel','save','preserve']};
    },payload=>!!targetFor(navigation,payload)||'Choose a current global destination or registered product surface')
  ];
  return {
    surface:'shell',owner,commands:ids,destinationRegistryOwner:navigation.destinationRegistry.owner,
    routeContext:createShellRouteContextProjection(navigation),
    globalDestinationBaseline:navigation.globalAreas().map(item=>item.id),destinationCountFrozen:false,
    shellVisualComposition:'REOPENED__NO_OBSOLETE_CHROME_AUTHORITY',finalDefaultRegistryWiring:'CONTROLLER_REPLAY_REQUIRED'
  };
}
