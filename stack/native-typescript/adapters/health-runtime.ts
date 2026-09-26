import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';
import {CollectionTableMatrixPresentationCore} from '../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';

export const HEALTH_COMMANDS=Object.freeze(['health.refresh','health.inspect','health.diagnose']);
const clone=value=>structuredClone(value);
const observationState=value=>['AVAILABLE_DATA','AVAILABLE_EMPTY','UNAVAILABLE','ERROR','STALE'].includes(value)?value:'UNAVAILABLE';
const truthTone=state=>state==='AVAILABLE_DATA'?'success':state==='AVAILABLE_EMPTY'?'muted':state==='STALE'?'warning':'danger';
const observedAtFor=row=>row?.observedAt||null;
const displayTime=value=>value||'NOT_OBSERVED';
const failureToken=value=>String(value?.code||value?.reason||value?.error||'').toUpperCase();
const failureState=value=>/UNAVAILABLE|OFFLINE|UNREACHABLE|TIMEOUT|NETWORK|CONNECTION|TRANSPORT/.test(failureToken(value))?'UNAVAILABLE':'ERROR';
const failureReceipt=(error,code='HEALTH_TRANSPORT_ERROR')=>({ok:false,code,reason:String(error?.message||error||code)});

export function normalizeHealthObservation(raw={}){
  const kind=String(raw.kind||'Observation'),providerStatus=String(raw.status||'UNAVAILABLE');
  let state=providerStatus;
  if(providerStatus==='AVAILABLE'){
    const emptyQueue=kind==='QueueMetric'&&Number(raw?.value?.depth)===0;
    state=emptyQueue?'AVAILABLE_EMPTY':'AVAILABLE_DATA';
  }
  state=observationState(state);
  const workerState=kind==='WorkerLiveness'?(raw?.value?.state==='ALIVE'?'ALIVE':raw?.value?.state==='EXPIRED'?'EXPIRED':'UNKNOWN'):null;
  const observedAt=raw.observedAt?String(raw.observedAt):null;
  const observedMs=observedAt?Date.parse(observedAt):NaN;
  const freshnessMs=Number(raw.freshnessMs);
  return Object.freeze({
    observationId:String(raw.observationId||`unobserved:${raw.sourceId||'unknown'}`),
    sourceId:String(raw.sourceId||'unknown'),
    sourceIdentity:String(raw.sourceIdentity||raw.sourceId||'unknown'),
    kind,
    state,
    providerStatus,
    observedAt,
    freshUntil:Number.isFinite(observedMs)&&Number.isFinite(freshnessMs)?new Date(observedMs+freshnessMs).toISOString():null,
    ageMs:Number.isFinite(Number(raw.ageMs))?Number(raw.ageMs):null,
    workerState,
    value:clone(raw.value??null),
    error:raw.error==null?null:String(raw.error),
    providerEvidence:clone(raw.providerEvidence??null)
  });
}

export class HealthRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport(),clock=()=>Date.now()}={}){
    this.owner='W05HealthDomainAdapter';
    this.transport=transport;
    this.clock=clock;
    this.state={observations:[],selectedSourceId:null,currentProviderState:'UNAVAILABLE',refreshPhase:'IDLE',lastRefresh:null,lastRefreshAttempt:null,lastDiagnostic:null,lastDiagnosticError:null,lastError:null};
    this.tableAdapter={
      adapterId:'health.observations',
      rows:()=>this.rows(),
      rowId:row=>row.sourceId,
      rowLabel:row=>row.sourceId,
      searchableText:row=>`${row.sourceId} ${row.kind} ${row.state} ${row.workerState||''}`,
      columns:[
        {id:'source',label:'Source',cell:row=>({text:row.sourceId,secondary:row.kind,direction:'ltr'})},
        {id:'state',label:'Observation',cell:row=>({text:row.state,tone:truthTone(row.state)})},
        {id:'freshness',label:'Observed',cell:row=>({text:displayTime(row.observedAt),secondary:row.freshUntil?`fresh until ${row.freshUntil}`:'no freshness claim',direction:'ltr'})}
      ],
      actions:row=>[{id:'health.inspect',label:'Inspect',enabled:Boolean(row.sourceId)},{id:'health.diagnose',label:'Diagnose',enabled:true}]
    };
    this.collection=new CollectionTableMatrixPresentationCore(this.tableAdapter);
    this.contextProvider=defineContextDescriptorProvider({
      id:'health.context',family:'health',owner:this.owner,
      describe:()=>{const row=this.selected();return {id:`health:${row?.sourceId||'empty'}`,providerId:'health.context',family:'health',subject:row?.sourceId||'No observation selected',eyebrow:'Health observation',summary:row?`${row.state} · ${row.kind}`:'Refresh observed state to inspect an exact source.',domainOwner:this.owner,revisionToken:row?.observationId||null,lenses:[{id:'identity',label:'Observation truth',tabs:[{id:'current',label:'Current',fields:row?[{id:'state',label:'Epistemic state',value:row.state},{id:'projection',label:'Projection',value:row.current?'CURRENT_OBSERVATION':'RETAINED_LAST_KNOWN'},{id:'lastKnown',label:'Last known state',value:row.lastKnownState||row.state},{id:'kind',label:'Kind',value:row.kind},{id:'observedAt',label:'Observed at',value:displayTime(row.observedAt),technical:true},{id:'freshUntil',label:'Fresh until',value:row.freshUntil||'NOT_ESTABLISHED',technical:true},{id:'sourceIdentity',label:'Source identity',value:row.sourceIdentity,technical:true},{id:'worker',label:'Worker liveness',value:row.workerState||'NOT_APPLICABLE'},{id:'failure',label:'Latest provider failure',value:row.currentFailureCode||'NONE',technical:true}]:[]}]}]};}
    });
  }
  descriptor(){return {owner:this.owner,semanticOwner:'W05HealthDomain',capabilityOwner:'HealthCapability',collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',transport:this.transport.descriptor(),persistenceHealthAlias:false,observationStates:['AVAILABLE_DATA','AVAILABLE_EMPTY','UNAVAILABLE','ERROR','STALE']};}
  snapshot(){return clone(this.state);}
  rows(){
    const current=this.state.currentProviderState,lastFailure=this.state.lastError;
    return this.state.observations.map(row=>{
      const expiresAt=row.freshUntil?Date.parse(row.freshUntil):NaN;
      const expired=Number.isFinite(expiresAt)&&this.clock()>expiresAt;
      if(current==='AVAILABLE'&&!expired)return clone({...row,current:true,retained:false,lastKnownState:row.state,lastKnownWorkerState:row.workerState,currentProviderState:current,currentFailureCode:null});
      const state=current==='ERROR'?'ERROR':current==='UNAVAILABLE'?'UNAVAILABLE':'STALE';
      return clone({...row,state,workerState:row.kind==='WorkerLiveness'?'UNKNOWN':row.workerState,current:false,retained:true,lastKnownState:row.state,lastKnownWorkerState:row.workerState,currentProviderState:current,currentFailureCode:current==='AVAILABLE'?'FRESHNESS_EXPIRED':String(lastFailure?.code||lastFailure?.reason||'PROVIDER_UNAVAILABLE')});
    });
  }
  selected(){const rows=this.rows();return rows.find(row=>row.sourceId===this.state.selectedSourceId)||rows[0]||null;}
  select(sourceId){if(sourceId!=null&&!this.rows().some(row=>row.sourceId===sourceId))throw Error('HEALTH_OBSERVATION_UNKNOWN');this.state.selectedSourceId=sourceId;return this.selected();}
  #recordFailure(result,{kind='refresh',affectsProvider=true}={}){
    const receipt=result&&typeof result==='object'?clone(result):{ok:false,code:'HEALTH_PROVIDER_FAILURE',reason:'Health provider request failed without a structured receipt.'};
    this.state.lastError=receipt;
    if(kind==='refresh')this.state.lastRefreshAttempt=receipt;
    if(kind==='diagnostic')this.state.lastDiagnosticError=receipt;
    if(affectsProvider)this.state.currentProviderState=failureState(receipt);
    return receipt;
  }
  #ingest(result,{diagnostic=false}={}){
    if(!result?.ok)return result;
    if(!Array.isArray(result.observations))return this.#recordFailure({ok:false,code:'HEALTH_OBSERVATIONS_MISSING',reason:'Health provider success receipt omitted observations.'},{kind:diagnostic?'diagnostic':'refresh',affectsProvider:true});
    let rows;
    try{rows=result.observations.map(normalizeHealthObservation)}catch(error){return this.#recordFailure(failureReceipt(error,'HEALTH_OBSERVATION_PARSE_ERROR'),{kind:diagnostic?'diagnostic':'refresh',affectsProvider:true})}
    this.state.observations=rows;
    this.state.currentProviderState='AVAILABLE';
    if(!this.state.selectedSourceId||!rows.some(row=>row.sourceId===this.state.selectedSourceId))this.state.selectedSourceId=rows[0]?.sourceId||null;
    if(diagnostic){this.state.lastDiagnostic=clone(result);this.state.lastDiagnosticError=null}else{this.state.lastRefresh=clone(result);this.state.lastRefreshAttempt=clone(result)}
    this.state.lastError=null;
    return result;
  }
  async refresh(){
    this.state.refreshPhase='FETCHING';
    try{
      const r=await this.transport.request('POST','/v1/health/refresh',{});
      if(!r?.ok)return this.#recordFailure(r,{kind:'refresh',affectsProvider:true});
      return this.#ingest(r,{diagnostic:false});
    }catch(error){return this.#recordFailure(failureReceipt(error),{kind:'refresh',affectsProvider:true})}
    finally{this.state.refreshPhase='IDLE'}
  }
  inspect({sourceId}={}){
    const id=sourceId??this.state.selectedSourceId??this.state.observations[0]?.sourceId;
    if(!id)return {ok:false,code:'HEALTH_OBSERVATION_REQUIRED'};
    const row=this.rows().find(item=>item.sourceId===id);
    if(!row)return {ok:false,code:'HEALTH_OBSERVATION_UNKNOWN'};
    this.state.selectedSourceId=id;
    this.collection.selectOnly(id);
    return {ok:true,observation:clone(row),observedAt:observedAtFor(row)};
  }
  async diagnose(){
    try{
      const r=await this.transport.request('POST','/v1/health/diagnostic',{requestedBy:'health-surface'});
      if(!r?.ok){const token=failureToken(r),affectsProvider=/UNAVAILABLE|OFFLINE|UNREACHABLE|TIMEOUT|NETWORK|CONNECTION|TRANSPORT|ERROR|FAILED/.test(token);return this.#recordFailure(r,{kind:'diagnostic',affectsProvider})}
      return this.#ingest(r,{diagnostic:true});
    }catch(error){return this.#recordFailure(failureReceipt(error,'HEALTH_DIAGNOSTIC_TRANSPORT_ERROR'),{kind:'diagnostic',affectsProvider:true})}
  }
  availability(id,payload={}){
    if(id==='health.refresh')return this.state.refreshPhase==='FETCHING'?'Refresh already in progress':true;
    if(id==='health.inspect')return Boolean(payload.sourceId||this.selected())||'Select an observed source';
    if(id==='health.diagnose')return this.state.refreshPhase==='FETCHING'?'Wait for the current observation refresh':true;
    return 'Unknown Health command';
  }
  mount({stage,registry,workspace,button,esc}){
    const restoreFocus=identity=>queueMicrotask(()=>{
      if(!identity)return;
      let target=null;
      if(identity.kind==='source')target=document.querySelector(`[data-health-source="${CSS.escape(String(identity.value))}"]`);
      if(identity.kind==='command')target=document.querySelector(`[data-foundation-command="${CSS.escape(String(identity.value))}"]`);
      if(target?.disabled)target=null;
      target=target||document.querySelector('[data-health-source][aria-pressed="true"]')||document.querySelector('[data-w05-surface="health"]');
      target?.focus?.();
    });
    const render=({focusIdentity=null}={})=>{
      const state=this.snapshot(),rows=this.collection.snapshot().visibleRows,selected=this.selected();
      const summary={AVAILABLE_DATA:0,AVAILABLE_EMPTY:0,UNAVAILABLE:0,ERROR:0,STALE:0};
      for(const row of rows)summary[row.state]=(summary[row.state]||0)+1;
      const refreshDisabled=state.refreshPhase==='FETCHING';
      stage.innerHTML=`<style>
      [data-w05-surface="health"]{display:grid;gap:14px;min-width:0}.w05-health-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.w05-health-head h1{margin:0}.w05-provider-truth,.w05-truth-strip{display:flex;flex-wrap:wrap;gap:7px}.w05-truth-chip{border:1px solid var(--line);border-radius:999px;padding:5px 9px;font:600 11px var(--mono)}.w05-health-grid{display:grid;grid-template-columns:minmax(260px,.95fr) minmax(320px,1.25fr);gap:12px}.w05-health-panel{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}.w05-health-list{display:grid;gap:7px}.w05-health-row{display:grid;grid-template-columns:1fr;gap:5px;text-align:start;border:1px solid var(--line);border-radius:9px;background:transparent;color:inherit;padding:10px;cursor:pointer}.w05-health-row[aria-pressed="true"]{outline:2px solid var(--accent);outline-offset:1px}.w05-health-row>span{display:grid;gap:3px;min-width:0}.w05-health-row strong,.w05-health-row small{overflow-wrap:anywhere}.w05-health-row small{color:var(--text3)}.w05-health-detail dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:7px 10px;margin:0}.w05-health-detail dt{color:var(--text3)}.w05-health-detail dd{margin:0;overflow-wrap:anywhere}.w05-health-diagnostic{grid-column:1/-1}.w05-health-diagnostic pre{max-height:220px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}.w05-current-truth{margin:8px 0 0}.w05-current-truth[data-health-current="false"]{border-inline-start:3px solid var(--warning);padding-inline-start:8px}@media(max-width:1100px){.w05-health-grid{grid-template-columns:1fr}.w05-health-diagnostic{grid-column:auto}}</style>
      <div data-w05-surface="health" data-health-refresh-phase="${esc(state.refreshPhase)}" data-health-provider-state="${esc(state.currentProviderState)}" tabindex="-1">
        <header class="w05-health-head" dir="ltr"><div><div class="m0-eyebrow">W05 · Operational observation</div><h1>Health</h1><p>Provider, freshness, liveness, queue and diagnostic truth remain distinct. Refresh observes; it does not recover or create a diagnostic run.</p><div class="w05-provider-truth" aria-live="polite"><span class="w05-truth-chip" data-health-provider-chip="${esc(state.currentProviderState)}">PROVIDER · ${esc(state.currentProviderState)}</span><span class="w05-truth-chip" data-health-refresh-chip="${esc(state.refreshPhase)}">REFRESH · ${esc(state.refreshPhase)}</span>${state.lastError?`<span class="w05-truth-chip" data-health-failure-code="${esc(state.lastError.code||state.lastError.reason||'PROVIDER_FAILURE')}">FAILURE · ${esc(state.lastError.code||state.lastError.reason||'PROVIDER_FAILURE')}</span>`:''}</div></div><div class="m0-command-strip">${button('health.refresh',refreshDisabled?'Refreshing…':'Refresh observed state',refreshDisabled?'disabled aria-disabled="true"':'')}${button('health.diagnose','Run durable diagnostic',refreshDisabled?'disabled aria-disabled="true"':'')}</div></header>
        <div class="w05-truth-strip" dir="ltr">${Object.entries(summary).map(([key,value])=>`<span class="w05-truth-chip" data-health-summary="${esc(key)}">${esc(key)} · ${value}</span>`).join('')}</div>
        <div class="w05-health-grid">
          <section class="w05-health-panel" dir="ltr"><h2>Observed sources</h2><div class="w05-health-list">${rows.length?rows.map(row=>`<button class="w05-health-row" type="button" data-health-source="${esc(row.sourceId)}" data-health-state="${esc(row.state)}" aria-pressed="${row.sourceId===selected?.sourceId}"><span><strong><bdi dir="ltr">${esc(row.sourceId)}</bdi></strong><small>${esc(row.kind)} · ${esc(row.state)}${row.workerState?` · ${esc(row.workerState)}`:''}</small></span><small><bdi dir="ltr">${esc(displayTime(row.observedAt))}</bdi></small></button>`).join(''):'<p class="state-token" data-state="empty">No observations yet. This is not a healthy-state claim.</p>'}</div></section>
          <section class="w05-health-panel w05-health-detail" dir="ltr"><h2>Selected observation</h2>${selected?`<dl><dt>Source</dt><dd><bdi dir="ltr">${esc(selected.sourceId)}</bdi></dd><dt>State</dt><dd data-health-selected-state="${esc(selected.state)}">${esc(selected.state)}</dd><dt>Projection</dt><dd data-health-current="${selected.current}">${selected.current?'CURRENT_OBSERVATION':'RETAINED_LAST_KNOWN'}</dd><dt>Last known</dt><dd>${esc(selected.lastKnownState||selected.state)}</dd><dt>Observed</dt><dd><bdi dir="ltr">${esc(displayTime(selected.observedAt))}</bdi></dd><dt>Fresh until</dt><dd><bdi dir="ltr">${esc(selected.freshUntil||'NOT_ESTABLISHED')}</bdi></dd><dt>Liveness</dt><dd>${esc(selected.workerState||'NOT_APPLICABLE')}</dd><dt>Latest provider failure</dt><dd><bdi dir="ltr">${esc(selected.currentFailureCode||'NONE')}</bdi></dd><dt>Source error</dt><dd>${esc(selected.error||'NONE')}</dd></dl><p class="w05-current-truth" data-health-current="${selected.current}">${selected.current?'This row is from the current provider observation.':'The value is retained for context only; the current epistemic state is shown above and must not be read as healthy.'}</p>${button('health.inspect','Inspect exact observation')}`:'<p>Select an observed source after refresh.</p>'}</section>
          <section class="w05-health-panel w05-health-diagnostic" dir="ltr"><h2>Durable diagnostic</h2><p>Only <bdi dir="ltr">health.diagnose</bdi> creates diagnostic history. A refresh never increments it.</p><pre data-w05-receipt>${esc(JSON.stringify(state.lastDiagnostic?.diagnostic||{status:'NOT_RUN'},null,2))}</pre></section>
        </div>
        <section class="w05-health-panel"><h2>Status meaning</h2><p dir="ltr"><bdi dir="ltr">AVAILABLE_EMPTY</bdi> means a successful empty observation. <bdi dir="ltr">UNAVAILABLE</bdi>, <bdi dir="ltr">STALE</bdi>, and <bdi dir="ltr">ERROR</bdi> never become green by fallback.</p><p dir="rtl">تحديث الصحة عملية رصد فقط، ولا يعني إصلاح المزود أو استعادته.</p></section>
      </div>`;
      stage.querySelectorAll('[data-health-source]').forEach(element=>element.addEventListener('click',()=>{const identity={kind:'source',value:element.dataset.healthSource};this.inspect({sourceId:element.dataset.healthSource});workspace.inspectorDescriptor(this.contextProvider);render({focusIdentity:identity});}));
      workspace.inspectorDescriptor(this.contextProvider);
      const sourcePanel=stage.querySelector('.w05-health-grid > .w05-health-panel:first-child'),diagnosticPanel=stage.querySelector('.w05-health-diagnostic');
      if(sourcePanel)workspace.region('LEFT',{node:sourcePanel,label:'Observed sources'});
      if(diagnosticPanel)workspace.region('BOTTOM',{node:diagnosticPanel,label:'Health diagnostics',summary:'Durable diagnostic projection; refresh alone does not create a diagnostic run.'});
      workspace.refreshToolbar?.();
      restoreFocus(focusIdentity);
      return state;
    };
    const run=(commandId,fn,{renderPending=false}={})=>async payload=>{
      const identity={kind:'command',value:commandId};
      try{
        const pending=Promise.resolve(fn(payload||{}));
        if(renderPending)render({focusIdentity:identity});
        const r=await pending;
        workspace.status(r.ok?'Health observation receipt recorded':`Health action failed · ${r.code||r.reason}`,r.ok?'info':'error');
        render({focusIdentity:identity});
        return r;
      }catch(error){workspace.status(`Health action failed · ${String(error?.message||error)}`,'error');render({focusIdentity:identity});throw error}
    };
    registry.register('health.refresh',this.owner,'Refresh observed state',run('health.refresh',()=>this.refresh(),{renderPending:true}),()=>this.availability('health.refresh'));
    registry.register('health.inspect',this.owner,'Inspect observation',run('health.inspect',payload=>Promise.resolve(this.inspect(payload))),payload=>this.availability('health.inspect',payload));
    registry.register('health.diagnose',this.owner,'Run durable diagnostic',run('health.diagnose',()=>this.diagnose()),()=>this.availability('health.diagnose'));
    render();
    queueMicrotask(async()=>{await this.refresh();render()});
    return {owner:this.owner,collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',render};
  }
}
export function createHealthRuntimeAdapter(options={}){return new HealthRuntimeAdapter(options)}
