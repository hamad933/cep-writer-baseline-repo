import {TODAY_PROJECTION_OWNER,TODAY_PROJECTION_KINDS} from '../../adapters/today/domain.js';
import {renderTodayOrchestrationProjection} from './presentation.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,TODAY_PROJECTION_OWNER,label,run,available);return id;};

/**
 * The Today adapter whose presentation is currently mounted (CBF-002 repair).
 *
 * The semantic bus registers each `today.*` command exactly once —
 * `SemanticCommandBus.registerCommand` rejects `DUPLICATE_COMMAND_OWNER` — so the registered
 * closure is created by the FIRST Today composition and permanently captures that composition's
 * adapter. The shared shell re-mounts Today with a fresh adapter on every Back/Forward restore
 * (`main.ts#handleShellNavigate` -> `mountM0ControllerComposition({consumer:'today'})`), and that
 * mount re-renders the stage from the NEW adapter. With a captured (first-mount) closure,
 * `today.filter` kept mutating the orphaned adapter while the rendered projection never moved:
 * the route came back, the semantic context silently did not — the measured CBF-002 defect
 * (`tools/w01-cbf-probe.mjs`, observation 05-07: `today.filter` receipts are emitted, the DOM
 * pressed state never moves).
 *
 * Resolving the target at call time keeps ONE command owner and ONE registration (no competing
 * bus, no duplicate mechanics) while guaranteeing a command always drives the adapter the stage
 * is actually rendering.
 */
let mountedAdapter    =null;
/** Current Today adapter — the one the mounted presentation renders. Test/proof seam. */
export function currentTodayAdapter(){return mountedAdapter}

/** Thin semantic-command binding over read-side Today projection truth. */
export function bindTodaySurface({commands,adapter,workspace=null}={}){
  if(!commands||!adapter)throw Error('TODAY_SURFACE_BINDING_REQUIRED');
  mountedAdapter=adapter;
  const active=()=>mountedAdapter||adapter;
  const ids=[
    register(commands,'today.resume','Resume projected work',payload=>active().resume(payload.itemId),payload=>active().canResume(payload.itemId)),
    register(commands,'today.refresh','Refresh Today projection',()=>active().refresh()),
    register(commands,'today.filter','Filter Today projection',payload=>{
      try{return {ok:true,filter:active().setFilter(payload.value),projection:active().project(),mutated:false};}
      catch(error){return {ok:false,status:String(error?.message||error),mutated:false};}
    },payload=>{const value=String(payload?.value||'ALL').toUpperCase();return value==='ALL'||TODAY_PROJECTION_KINDS.includes(value)||'Choose a recognized Today projection kind';}),
    register(commands,'today.why','Explain recommendation source',payload=>active().why(payload.itemId,payload.version),payload=>active().canExplain(payload.itemId,payload.version))
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
