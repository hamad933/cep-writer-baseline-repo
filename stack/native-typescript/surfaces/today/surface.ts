import {TODAY_PROJECTION_OWNER,TODAY_PROJECTION_KINDS} from '../../adapters/today/domain.js';
import {renderTodayOrchestrationProjection} from './presentation.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,TODAY_PROJECTION_OWNER,label,run,available);return id;};

/** Thin semantic-command binding over read-side Today projection truth. */
export function bindTodaySurface({commands,adapter,workspace=null}={}){
  if(!commands||!adapter)throw Error('TODAY_SURFACE_BINDING_REQUIRED');
  const ids=[
    register(commands,'today.resume','Resume projected work',payload=>adapter.resume(payload.itemId),payload=>adapter.canResume(payload.itemId)),
    register(commands,'today.refresh','Refresh Today projection',()=>adapter.refresh()),
    register(commands,'today.filter','Filter Today projection',payload=>{
      try{return {ok:true,filter:adapter.setFilter(payload.value),projection:adapter.project(),mutated:false};}
      catch(error){return {ok:false,status:String(error?.message||error),mutated:false};}
    },payload=>{const value=String(payload?.value||'ALL').toUpperCase();return value==='ALL'||TODAY_PROJECTION_KINDS.includes(value)||'Choose a recognized Today projection kind';}),
    register(commands,'today.why','Explain recommendation source',payload=>adapter.why(payload.itemId,payload.version),payload=>adapter.canExplain(payload.itemId,payload.version))
  ];
  const projection=adapter.project();
  workspace?.status?.(`Today · ${projection.state}`);
  return {
    surface:'today',owner:adapter.owner,commands:ids,projection,
    presentationOwner:'TodayOrchestrationPresentation',sharedWorkspaceOwner:'WorkspaceFoundation',canonicalWrites:false,
    providerBoundary:'CENTRAL_REAL_PROVIDER_COMPOSITION_REQUIRED',masteryAuthority:'W04_OWNED',recommendationAuthority:'SOURCE_BACKED_ONLY'
  };
}

/**
 * Candidate presentation composer. Central route wiring is intentionally not owned by Stage-A S07;
 * Coverage/Global Convergence may call this function after binding the real provider composition.
 */
export function composeTodayOrchestrationPresentation({host,commands,adapter,workspace=null,lang=null}={}){
  if(!host||!commands||!adapter)throw Error('TODAY_COMPOSITION_BINDING_REQUIRED');
  const binding=bindTodaySurface({commands,adapter,workspace});
  const focusKey=invoker=>invoker?{id:invoker.id||'',action:invoker.dataset?.todayAction||'',filter:invoker.dataset?.filter||'',itemId:invoker.dataset?.itemId||''}:null;
  const restoreFocus=key=>{
    if(!key)return;
    const candidates=[...host.querySelectorAll('[data-today-action]')];
    const target=(key.id&&host.querySelector(`#${key.id}`))||candidates.find(node=>node.dataset.todayAction===key.action&&(node.dataset.filter||'')===key.filter&&(node.dataset.itemId||'')===key.itemId);
    target?.focus?.({preventScroll:true});
  };
  const render=(restore=null)=>{
    const presentation=renderTodayOrchestrationProjection({
      host,projection:adapter.lastProjection||adapter.project(),adapter,lang,
      onAction:({action,itemId,version,filter,invoker})=>{
        let result=null;
        if(action==='resume')result=commands.execute('today.resume',{itemId,route:'today-orchestration',invoker});
        else if(action==='refresh')result=commands.execute('today.refresh',{route:'today-orchestration',invoker});
        else if(action==='filter')result=commands.execute('today.filter',{value:filter,route:'today-orchestration',invoker});
        else if(action==='why')result=commands.execute('today.why',{itemId,version,route:'today-orchestration',invoker});
        if(action==='filter'||action==='refresh')render(focusKey(invoker));
        return result;
      }
    });
    restoreFocus(restore);
    return presentation;
  };
  const presentation=render();
  return {binding,presentation,render,owner:'TodayOrchestrationPresentation',canonicalWrites:false};
}
