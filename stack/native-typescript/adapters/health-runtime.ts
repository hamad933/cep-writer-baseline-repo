import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';
import {CollectionTableMatrixPresentationCore} from '../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider,describeContextProvider} from '../foundation/global/context-descriptor-contract.js';
import {CONTEXT_INSPECTOR_PRESENTATION} from '../foundation/global/context-inspector.js';

export const HEALTH_COMMANDS=Object.freeze(['health.refresh','health.inspect','health.diagnose']);
const clone=value=>structuredClone(value);
const observationState=value=>['AVAILABLE_DATA','AVAILABLE_EMPTY','UNAVAILABLE','ERROR','STALE'].includes(value)?value:'UNAVAILABLE';
const truthTone=state=>state==='AVAILABLE_DATA'?'success':state==='AVAILABLE_EMPTY'?'muted':state==='STALE'?'warning':'danger';
const observedAtFor=row=>row?.observedAt||null;
const displayTime=value=>value||'NOT_OBSERVED';

export function normalizeHealthObservation(raw={}){
  const kind=String(raw.kind||'Observation'),providerStatus=String(raw.status||'UNAVAILABLE');
  let state=providerStatus;
  if(providerStatus==='AVAILABLE'){
    const emptyQueue=kind==='QueueMetric'&&Number(raw?.value?.depth)===0;
    state=emptyQueue?'AVAILABLE_EMPTY':'AVAILABLE_DATA';
  }
  state=observationState(state);
  const workerState=kind==='WorkerLiveness'?(raw?.value?.state==='ALIVE'?'ALIVE':raw?.value?.state==='EXPIRED'?'EXPIRED':'UNKNOWN'):null;
  return Object.freeze({
    observationId:String(raw.observationId||`unobserved:${raw.sourceId||'unknown'}`),
    sourceId:String(raw.sourceId||'unknown'),
    sourceIdentity:String(raw.sourceIdentity||raw.sourceId||'unknown'),
    kind,
    state,
    providerStatus,
    observedAt:raw.observedAt?String(raw.observedAt):null,
    freshUntil:raw.observedAt&&Number.isFinite(Number(raw.freshnessMs))?new Date(Date.parse(raw.observedAt)+Number(raw.freshnessMs)).toISOString():null,
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
    this.state={observations:[],selectedSourceId:null,currentProviderState:'UNAVAILABLE',refreshPhase:'IDLE',lastRefresh:null,lastDiagnostic:null,lastError:null,activeLens:'identity'};
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
      describe:()=>{const row=this.selected(),rows=this.rows(),counts={AVAILABLE_DATA:0,AVAILABLE_EMPTY:0,UNAVAILABLE:0,ERROR:0,STALE:0};for(const item of rows)counts[item.state]=(counts[item.state]||0)+1;const transport=this.transport?.descriptor?.()||{};const latest=rows.map(item=>item.observedAt).filter(Boolean).sort().at(-1)||null;return {id:`health:${row?.sourceId||'empty'}`,providerId:'health.context',family:'health',subject:row?.sourceId||'No observation selected',eyebrow:'Health observation',summary:row?`${row.state} · ${row.kind}`:'Refresh observed state to inspect an exact source.',domainOwner:this.owner,revisionToken:row?.observationId||null,lenses:[
        {id:'identity',label:'Observation truth',tabs:[{id:'current',label:'Current',fields:row?[{id:'state',label:'Epistemic state',value:row.state},{id:'kind',label:'Kind',value:row.kind},{id:'observedAt',label:'Observed at',value:displayTime(row.observedAt),technical:true},{id:'freshUntil',label:'Fresh until',value:row.freshUntil||'NOT_ESTABLISHED',technical:true},{id:'sourceIdentity',label:'Source identity',value:row.sourceIdentity,technical:true},{id:'worker',label:'Worker liveness',value:row.workerState||'NOT_APPLICABLE',technical:true},{id:'error',label:'Provider error',value:row.error||'NONE',technical:true}]:[]}]},
        {id:'domain-context',label:'Domain context',tabs:[
          {id:'sources',label:'المصادر والاعتماديات · Sources',fields:[{id:'transport',label:'Observation transport',value:`${transport.id||'BoundedLocalRuntimeTransport'} @ ${transport.host||'127.0.0.1'}:${transport.port??'DEFAULT'}`,technical:true},{id:'loopback',label:'Loopback only',value:String(transport.loopbackOnly===true),technical:true},{id:'providerState',label:'Provider state',value:String(this.state.currentProviderState),technical:true},{id:'observationCount',label:'Observed sources',value:String(rows.length),technical:true},{id:'stateCounts',label:'State counts',value:`AVAILABLE_DATA=${counts.AVAILABLE_DATA} · AVAILABLE_EMPTY=${counts.AVAILABLE_EMPTY} · UNAVAILABLE=${counts.UNAVAILABLE} · ERROR=${counts.ERROR} · STALE=${counts.STALE}`,technical:true},{id:'latestObservedAt',label:'Latest observed at',value:latest||'NOT_OBSERVED',technical:true},{id:'lastDiagnosticAt',label:'Last durable diagnostic',value:this.state.lastDiagnostic?.observedAt||this.state.lastDiagnostic?.diagnostic?.observedAt||'NOT_RUN',technical:true},{id:'selectedFreshUntil',label:'Selected freshness budget',value:row?.freshUntil||'NOT_ESTABLISHED',technical:true},{id:'dependencies',label:'Dependencies',value:rows.length?rows.map(item=>`${item.kind} ← ${item.sourceIdentity||item.sourceId}`).join(' · '):'NO_OBSERVED_SOURCE'},{id:'owner',label:'Domain owner',value:this.owner,technical:true}]},
          {id:'policy',label:'State policy',fields:[{id:'epistemicStates',label:'Declared states',value:'AVAILABLE_DATA · AVAILABLE_EMPTY · UNAVAILABLE · ERROR · STALE',technical:true},{id:'emptyMeaning',label:'AVAILABLE_EMPTY',value:'رصد فارغ صالح ولا يعني انقطاع المصدر — Valid empty observation; the source is not disconnected.'},{id:'neverGreen',label:'UNAVAILABLE / STALE / ERROR',value:'لا تتحول إلى أخضر أبدًا — never rendered green.'},{id:'persistenceAlias',label:'persistenceHealthAlias',value:'false',technical:true},{id:'queueNotLiveness',label:'queueDepthIsWorkerLiveness',value:'false',technical:true},{id:'refreshNotDiagnostic',label:'refreshCreatesDiagnostic',value:'false',technical:true},{id:'unknownNotGreen',label:'Unknown source renders green',value:'false',technical:true}]}
        ]},
        {id:'notes',label:'Notes',tabs:[{id:'notes',label:'Notes',fields:[{id:'notesOwner',label:'Notes owner',value:'NotesAnnotationCore (shared foundation owner; SC-038)'},{id:'notesRoute',label:'Note commands',value:'Shared Note/Notes commands in the toolbar action set; capability is resolved by the shared owner'},{id:'notesEngine',label:'Health local notes engine',value:'NONE — Health never owns a second notes engine'},{id:'notesScope',label:'Notes scope',value:'Notes attach through the shared owner against the current Health context; no canonical Health observation is mutated'}]}]}
      ]};}
    });
  }
  descriptor(){return {owner:this.owner,semanticOwner:'W05HealthDomain',capabilityOwner:'HealthCapability',collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',transport:this.transport.descriptor(),persistenceHealthAlias:false,observationStates:['AVAILABLE_DATA','AVAILABLE_EMPTY','UNAVAILABLE','ERROR','STALE']};}
  snapshot(){return clone(this.state);}
  rows(){const current=this.state.currentProviderState;return this.state.observations.map(row=>{const expired=row.freshUntil&&this.clock()>Date.parse(row.freshUntil);if(current==='AVAILABLE'&&!expired)return clone({...row,current:true,lastKnownState:row.state,lastKnownWorkerState:row.workerState});const state=current==='ERROR'?'ERROR':current==='UNAVAILABLE'?'UNAVAILABLE':'STALE';return clone({...row,state,workerState:row.kind==='WorkerLiveness'?'UNKNOWN':row.workerState,current:false,lastKnownState:row.state,lastKnownWorkerState:row.workerState,currentProviderState:current});});}
  selected(){const rows=this.rows();return rows.find(row=>row.sourceId===this.state.selectedSourceId)||rows[0]||null;}
  select(sourceId){if(sourceId!=null&&!this.rows().some(row=>row.sourceId===sourceId))throw Error('HEALTH_OBSERVATION_UNKNOWN');this.state.selectedSourceId=sourceId;return this.selected();}
  #ingest(result,{diagnostic=false}={}){
    if(!result?.ok)return result;
    const rows=(result.observations||[]).map(normalizeHealthObservation);
    this.state.observations=rows;
    this.state.currentProviderState='AVAILABLE';
    if(!this.state.selectedSourceId||!rows.some(row=>row.sourceId===this.state.selectedSourceId))this.state.selectedSourceId=rows[0]?.sourceId||null;
    if(diagnostic)this.state.lastDiagnostic=clone(result);else this.state.lastRefresh=clone(result);
    this.state.lastError=null;
    return result;
  }
  async refresh(){
    this.state.refreshPhase='FETCHING';
    const r=await this.transport.request('POST','/v1/health/refresh',{});
    this.state.refreshPhase='IDLE';
    if(!r.ok){this.state.lastError=clone(r);this.state.currentProviderState=/ERROR|FAILED/.test(String(r.code||r.reason||''))?'ERROR':'UNAVAILABLE';return r;}
    return this.#ingest(r,{diagnostic:false});
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
    const r=await this.transport.request('POST','/v1/health/diagnostic',{requestedBy:'health-surface'});
    if(!r.ok){this.state.lastError=clone(r);return r;}
    return this.#ingest(r,{diagnostic:true});
  }
  availability(id,payload={}){
    if(id==='health.refresh')return true;
    if(id==='health.inspect'){
      const requested=payload?.sourceId;
      if(requested&&!this.rows().some(row=>row.sourceId===requested))return 'Observation source is not in the current observation set';
      return Boolean(requested||this.selected())||'Select an observed source';
    }
    if(id==='health.diagnose')return true;
    return 'Unknown Health command';
  }
  mount({stage,registry,workspace,button,esc}){
    /* Arabic-first surface language (CEP-VIS-001-FINAL §2.2/§12). Identifiers, timestamps and
       digests stay in isolated LTR <bdi> spans; product copy is Arabic with an English secondary
       line so the reference structure is legible while the Owner product-language decision is
       still pending. No product fact is asserted that the adapter did not observe. */
    const E=value=>typeof esc==='function'?esc(value):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const B=value=>`<bdi dir="ltr">${E(value)}</bdi>`;
    const STATE={
      AVAILABLE_DATA:{tone:'ok',icon:'✓',ar:'متاح ببيانات',en:'Available with data',noteAr:'رصد حالي متاح، ولا يوجب أي إجراء.',noteEn:'Current observation available; no action required.'},
      AVAILABLE_EMPTY:{tone:'muted',icon:'○',ar:'متاح · دون سجلات',en:'Available · no records',noteAr:'رصد فارغ صالح، ولا يعني انقطاع المصدر.',noteEn:'Valid empty observation; the source is not disconnected.'},
      STALE:{tone:'warn',icon:'⚠',ar:'تجاوز حدّ الحداثة',en:'Past freshness budget',noteAr:'تجاوز الرصد حدّ حداثته المسموح.',noteEn:'Observation is past its declared freshness budget.'},
      UNAVAILABLE:{tone:'bad',icon:'✕',ar:'غير متاح',en:'Unavailable',noteAr:'تعذّر الوصول إلى المصدر وقت الرصد.',noteEn:'Source unreachable at observation time.'},
      ERROR:{tone:'bad',icon:'✕',ar:'خطأ في الرصد',en:'Observation error',noteAr:'فشل جلب الرصد أو تحليله، مع الاحتفاظ بآخر رصد معروف.',noteEn:'Fetch or parse failed; the last known observation is retained.'}
    };
    const NEXT={
      AVAILABLE_DATA:['health.inspect','عرض التفاصيل','View details'],
      AVAILABLE_EMPTY:['health.inspect','عرض التفاصيل','View details'],
      STALE:['health.refresh','إعادة المحاولة','Retry observation'],
      UNAVAILABLE:['health.diagnose','تشغيل تشخيص','Run durable diagnostic'],
      ERROR:['health.diagnose','تشغيل تشخيص','Run durable diagnostic']
    };
    const meta=state=>STATE[state]||STATE.UNAVAILABLE;
    const blocking=state=>state==='UNAVAILABLE'||state==='ERROR';
    const ageOf=iso=>{if(!iso)return 'غير مرصود';const base=Date.parse(iso);if(!Number.isFinite(base))return 'غير مرصود';const s=Math.max(0,Math.round((Date.now()-base)/1000));if(s<60)return `منذ ${s} ثانية`;const m=Math.round(s/60);if(m<60)return `منذ ${m} دقيقة`;const h=Math.round(m/60);if(h<24)return `منذ ${h} ساعة`;return `منذ ${Math.round(h/24)} يوم`};
    const render=()=>{
      const state=this.snapshot(),rows=this.collection.snapshot().visibleRows,selected=this.selected();
      const summary={AVAILABLE_DATA:0,AVAILABLE_EMPTY:0,UNAVAILABLE:0,ERROR:0,STALE:0};
      for(const row of rows)summary[row.state]=(summary[row.state]||0)+1;
      const ok=summary.AVAILABLE_DATA+summary.AVAILABLE_EMPTY,warn=summary.STALE,bad=summary.UNAVAILABLE+summary.ERROR;
      const diagnostic=state.lastDiagnostic?.diagnostic||null;
      const latest=rows.map(row=>row.observedAt).filter(Boolean).sort().at(-1)||null;
      const sel=selected||rows[0]||null,selMeta=meta(sel?.state);
      const next= NEXT[sel?.state]||NEXT.UNAVAILABLE;

      /* ---- CENTER: reference architecture = component status table + selected-component detail ---- */
      stage.innerHTML=`<style>
      [data-w05-surface="health"]{display:grid;gap:14px;min-width:0}
      .h-head{display:grid;gap:4px};margin-block-start:26px.h-head h1{margin:0;font-size:clamp(20px,2vw,27px);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.h-head h1 small{font-size:13px;font-weight:600;color:var(--text3)}
      .h-lead{margin:0;color:var(--text2);max-width:78ch;line-height:1.6}
      .h-sec{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}
      .h-sec>h2{margin:0 0 3px;font-size:15px}.h-sub{display:block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px}
      .h-table-wrap{overflow-x:auto;max-width:100%;border:1px solid var(--line);border-radius:10px}
      table.h-table{width:100%;border-collapse:collapse;table-layout:fixed}
      .h-table th,.h-table td{padding:8px 7px;border-bottom:1px solid var(--line);text-align:start;vertical-align:middle;overflow-wrap:anywhere;word-break:normal}
      .h-table th{font-size:11px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent);line-height:1.35}
      .h-table th strong{display:block;color:var(--text2);font-size:12px}
      .h-table th em{font-style:normal;font:600 9.5px var(--mono);opacity:.75}
      .h-table td small{display:block;color:var(--text3);font-size:10.5px;margin-top:2px}
      .h-table tr[data-selected="true"]{background:rgba(255,255,255,.05);outline:2px solid var(--accent);outline-offset:-2px}
      .h-state{display:flex;align-items:center;gap:6px;font-weight:650;font-size:12px;line-height:1.3}
      .h-state bdi{font:600 10px var(--mono);opacity:.8;font-weight:600}
      .h-badge{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;font-size:11px;border:1.5px solid currentColor;flex:none}
      [data-tone="ok"]{color:#37d67a}[data-tone="warn"]{color:#f0b429}[data-tone="bad"]{color:#ff6b6b}[data-tone="muted"]{color:#9fb0c6}
      .h-time{display:grid;gap:1px}
      .h-time .h-age{font-size:11px;color:var(--text2);white-space:nowrap}
      .h-time bdi{font-family:var(--mono);font-size:10.5px;white-space:nowrap}
      .h-rowbtn{border:1px solid var(--line);border-radius:8px;background:#152438;color:inherit;padding:6px 10px;cursor:pointer;white-space:nowrap;font-size:12px}
      .h-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
      .h-card{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;min-width:0;display:grid;gap:7px;align-content:start}
      .h-card>h3{margin:0;font-size:13px;display:flex;align-items:center;gap:7px}
      .h-card dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 10px;font-size:12px}
      .h-card dt{color:var(--text3);white-space:nowrap}.h-card dd{margin:0;overflow-wrap:anywhere;text-align:end}
      .h-card p{margin:0;font-size:12px;line-height:1.55;color:var(--text2)}
      .h-card p.en{color:var(--text3);font-size:11px}
      .h-count{display:flex;gap:9px;flex-wrap:wrap;font:600 12px var(--mono)}
      .h-lead2{margin:0 0 8px;color:var(--text2);font-size:12px}
      .h-diag{display:grid;gap:8px}
      .h-diag dl{margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}
      .h-diag dl>div{border:1px solid var(--line);border-radius:9px;padding:8px 10px;background:#0d1622}
      .h-diag dt{font-size:11px;color:var(--text3)}.h-diag dd{margin:3px 0 0;font-size:13px;font-weight:650;overflow-wrap:anywhere}
      @media(max-width:760px){.h-table th,.h-table td{padding:7px 8px}}
      </style>
      <div data-w05-surface="health" data-health-refresh-phase="${E(state.refreshPhase)}">
        <header class="h-head"><div class="m0-eyebrow"><bdi dir="ltr">W05 · OPERATIONAL OBSERVATION</bdi></div><h1>الصحة التشغيلية <small>Operational Health</small></h1><p class="h-lead">مراقبة لحالة مكوّنات النظام وعملياتها وضمان استمراريتها وسلامة بياناتها. تحديث الرصد يرصد فقط ولا يستعيد المزود ولا ينشئ تشخيصًا دائمًا.</p></header>
        <section class="h-sec"><h2>حالة المكوّنات</h2><span class="h-sub">Component status</span>
          ${rows.length?`<div class="h-table-wrap"><table class="h-table"><thead><tr><th scope="col" style="width:23%"><strong>المكوّن</strong><em>COMPONENT</em></th><th scope="col" style="width:19%"><strong>الحالة التشغيلية</strong><em>STATE</em></th><th scope="col" style="width:18%"><strong>آخر فحص</strong><em>LAST CHECK</em></th><th scope="col" style="width:25%"><strong>الملاحظة المختصرة</strong><em>RECORDED NOTE</em></th><th scope="col" style="width:15%"><strong>الإجراء التالي</strong><em>NEXT ACTION</em></th></tr></thead><tbody>${rows.map(row=>{const m=meta(row.state),n=NEXT[row.state]||NEXT.UNAVAILABLE;return `<tr data-health-row="${E(row.sourceId)}" data-selected="${row.sourceId===sel?.sourceId}"><td><strong dir="auto">${E(row.sourceId)}</strong><small>${E(row.kind)}${row.workerState?` · ${B(row.workerState)}`:''}</small></td><td><span class="h-state" data-tone="${m.tone}" data-health-state="${E(row.state)}"><span class="h-badge" aria-hidden="true">${m.icon}</span><span dir="auto">${E(m.ar)}</span></span><small><bdi dir="ltr">${E(row.state)}</bdi></small></td><td><span class="h-time"><span class="h-age">${E(ageOf(row.observedAt))}</span><bdi dir="ltr">${E((row.observedAt||'NOT_OBSERVED').slice(11)||'NOT_OBSERVED')}</bdi><small><bdi dir="ltr">${row.freshUntil?E(row.freshUntil.slice(11)):'no freshness claim'}</bdi></small></span></td><td dir="auto">${E(m.noteAr)}</td><td><button type="button" class="h-rowbtn" data-health-next="${E(row.sourceId)}" data-health-next-command="${E(n[0])}">${E(n[1])}</button></td></tr>`}).join('')}</tbody></table></div>`:`<p class="state-token" data-state="empty"><strong>لا توجد رصود بعد</strong> · No observation has been recorded yet. This is an explicit empty state, not a healthy-state claim.</p>`}
        </section>
        <section class="h-sec"><h2>تفاصيل المكوّن المحدد</h2><span class="h-sub">Selected component details</span>
          <p class="h-lead2">عرض تفصيل حالة التحقق الحالي للمكوّن المحدد، ثم طلب إجراء واحد ملائم له.</p>
          ${sel?`<div class="h-cards">
            <article class="h-card"><h3 data-tone="${summary[sel.state]!==undefined?'muted':'muted'}">ملخص آخر فحص <small class="h-sub" style="margin:0">Last check</small></h3><dl><dt>تاريخ آخر رصد</dt><dd>${B(displayTime(sel.observedAt))}</dd><dt>النتيجة</dt><dd>${E(`${ok} متاح · ${warn} تنبيه · ${bad} حجب`)}</dd><dt>حد الصلاحية</dt><dd>${B(sel.freshUntil||'NOT_ESTABLISHED')}</dd></dl><div class="h-count"><span data-tone="ok">✓ ${ok}</span><span data-tone="warn">⚠ ${warn}</span><span data-tone="bad">✕ ${bad}</span></div></article>
            <article class="h-card"><h3>حالة الحجب <small class="h-sub" style="margin:0">Blocking state</small></h3><p class="h-state" data-tone="${blocking(sel.state)?'bad':'ok'}"><span class="h-badge" aria-hidden="true">${blocking(sel.state)?'✕':'✓'}</span>${blocking(sel.state)?'نشطة':'غير نشطة'}<small>${blocking(sel.state)?'ACTIVE':'INACTIVE'}</small></p><dl><dt>نوع الحجب</dt><dd>${B(blocking(sel.state)?sel.state:'NONE')}</dd><dt>المصدر</dt><dd>${B(sel.sourceId)}</dd><dt>تاريخ البداية</dt><dd>${B(displayTime(sel.observedAt))}</dd></dl></article>
            <article class="h-card"><h3>تفاصيل مختصرة <small class="h-sub" style="margin:0">Brief detail</small></h3><p dir="auto">${E(selMeta.noteAr)}</p><p class="en">${E(selMeta.noteEn)}</p><dl><dt>النوع</dt><dd>${B(sel.kind)}</dd><dt>حالة الرصد</dt><dd data-health-selected-state="${E(sel.state)}">${B(sel.state)}</dd><dt>الخطأ</dt><dd>${B(sel.error||'NONE')}</dd></dl></article>
            <article class="h-card"><h3>الإجراء التالي المقترح <small class="h-sub" style="margin:0">Suggested next action</small></h3><p class="h-state" data-tone="ok"><span class="h-badge" aria-hidden="true">⚙</span>${E(next[1])}<small>${B(next[0])}</small></p><p dir="auto">إجراء واحد مناسب لحالة المكوّن الحالية؛ لا يؤدي هذا الإجراء إلى إصلاح المزود أو استعادته.</p><p><button type="button" class="h-rowbtn" data-health-next="${E(sel.sourceId)}" data-health-next-command="${E(next[0])}">${E(next[1])}</button></p></article>
          </div>`:`<p class="state-token" data-state="empty"><strong>لا يوجد مكوّن محدد</strong> · Refresh observed state to select an exact component.</p>`}
        </section>
        <section class="h-sec h-diag"><h2>آخر تشخيص دائم</h2><span class="h-sub">Last durable diagnostic</span>
          <p class="h-lead2">هذا ملخّص مختصر لآخر تشخيص دائم. الإيصال الكامل يظهر في مساحة العمل المؤقتة أسفل الشاشة. إجراء <bdi dir="ltr">health.diagnose</bdi> فقط هو ما ينشئ سجل تشخيص؛ عمليتا <bdi dir="ltr">refresh</bdi> لا تزيدان العدّاد.</p>
          ${diagnostic?`<dl><div><dt>الحالة</dt><dd>${B(diagnostic.status||'UNKNOWN')}</dd></div><div><dt>دائم</dt><dd>${B(String(diagnostic.durable===true))}</dd></div><div><dt>طُلب بواسطة</dt><dd>${B(diagnostic.requestedBy||'health-surface')}</dd></div><div><dt>عدد الرصود</dt><dd>${B(String(diagnostic.observationCount??diagnostic.observations?.length??rows.length))}</dd></div><div><dt>وقت آخر رصد</dt><dd>${B(latest||'NOT_OBSERVED')}</dd></div><div><dt>مزوّد الرصد</dt><dd>${B(state.currentProviderState)}</dd></div></dl>`:`<p class="state-token" data-state="unavailable"><strong>لم يُنفَّذ تشخيص بعد</strong> · No durable diagnostic has been run in this session. <bdi dir="ltr">refresh</bdi> never creates one.</p>`}
        </section>
      </div>`;

      /* ---- LEFT: structure/navigation only (contract §3.2) ---- */
      const left=document.createElement('section');left.className='h-nav';
      left.innerHTML=`<style>.h-nav{display:grid;gap:10px;min-width:0}.h-nav-sum{display:flex;flex-wrap:wrap;gap:6px}.h-nav-chip{border:1px solid var(--line);border-radius:999px;padding:4px 8px;font:600 10.5px var(--mono);white-space:nowrap}.h-nav-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}.h-nav-list li{min-width:0}.h-nav-item{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;align-items:center;width:100%;text-align:start;border:1px solid var(--line);border-radius:9px;background:transparent;color:inherit;padding:9px;cursor:pointer}.h-nav-item[aria-pressed="true"]{border-color:var(--accent);background:rgba(255,255,255,.05)}.h-nav-item .h-badge{width:22px;height:22px}.h-nav-item strong{display:block;overflow-wrap:anywhere;font-size:12.5px}.h-nav-item small{display:block;color:var(--text3);font-size:11px;overflow-wrap:anywhere}</style>
      <div class="h-nav-sum" dir="ltr">${Object.entries(summary).map(([key,value])=>`<span class="h-nav-chip" data-tone="${meta(key).tone}" data-health-summary="${E(key)}">${E(key)} · ${value}</span>`).join('')}</div>
      <ul class="h-nav-list">${rows.length?rows.map(row=>{const m=meta(row.state);return `<li><button type="button" class="h-nav-item" data-health-source="${E(row.sourceId)}" aria-pressed="${row.sourceId===sel?.sourceId}"><span class="h-badge" data-tone="${m.tone}" aria-hidden="true">${m.icon}</span><span><strong dir="auto">${E(row.sourceId)}</strong><small>${E(row.kind)} · ${E(m.ar)}</small><small>${B(displayTime(row.observedAt))}</small></span></button></li>`}).join(''):`<li><p class="state-token" data-state="empty"><strong>لا توجد مصادر مرصودة</strong> · No observed source yet; this is not a healthy-state claim.</p></li>`}</ul>`;
      const leftHost=workspace.region('LEFT',{node:left,label:'المكوّنات المراقبة'});

      /* ---- RIGHT: profile lenses (identity · domain-context · notes) through the shared ContextInspector presentation ---- */
      const right=document.createElement('aside');right.className='h-ctx';
      const described=describeContextProvider(this.contextProvider,{});
      const descriptor=described.ok?described.descriptor:null;
      const lenses=descriptor?.lenses||[];
      const activeLens=lenses.find(item=>item.id===this.state.activeLens)||lenses[0]||null;
      const fieldRows=lens=>lens?lens.tabs.map(tab=>`<section class="h-ctx-block"><div><h3 dir="auto">${E(tab.label)}</h3>${tab.fields.length?`<dl class="h-ctx-fields">${tab.fields.map(field=>`<div class="h-ctx-field"><dt>${E(field.label)}</dt><dd dir="${E(field.direction||'auto')}"${field.technical?' class="h-technical"':''}>${field.value==null||field.value===''?'—':E(field.value)}</dd></div>`).join('')}</dl>`:`<p class="state-token" data-state="empty">${E(tab.emptyMessage||'لا توجد حقول متاحة بعد · No field is available for this lens yet.')}</p>`}</div></section>`).join(''):'';
      right.innerHTML=`<style>.h-ctx{display:grid;gap:10px;min-width:0}.h-ctx-lenses{font-size:10.5px;padding-bottom:7px;border-bottom:1px solid var(--line);flex-wrap:wrap!important;row-gap:4px!important;align-items:center!important}.h-ctx-lenses .lensbtn{height:26px!important;min-width:0!important;padding:4px 9px!important;font-size:10.5px!important;font-weight:600;flex-direction:row!important;align-items:center!important;gap:5px!important;border-radius:7px!important}.h-ctx-lenses .lensbtn .lenslabel{font-size:10.5px!important;font-weight:600;letter-spacing:0}.h-ctx-block{display:grid;gap:7px;border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;min-width:0}.h-ctx-block h3{margin:0;font-size:13px}.h-ctx-fields{margin:0;display:grid;gap:6px}.h-ctx-field{display:grid;grid-template-columns:minmax(84px,38%) minmax(0,1fr);gap:8px;align-items:baseline;font-size:11.5px}.h-ctx-field dt{color:var(--text3)}.h-ctx-field dd{margin:0;overflow-wrap:anywhere;text-align:end}.h-ctx-field dd.h-technical{font:600 10.5px var(--mono);direction:ltr;unicode-bidi:isolate}</style>
      ${descriptor?`<nav class="context-lenses h-ctx-lenses" role="tablist" aria-label="عدسات سياق الصحة · Health context lenses">${CONTEXT_INSPECTOR_PRESENTATION.renderLensTabs(descriptor.lenses,activeLens?.id,{controlsId:'health-context-panel'})}</nav>`:''}
      <section id="health-context-panel" role="tabpanel" aria-label="${E(activeLens?.label||'Context')}">${fieldRows(activeLens)}</section>`;
      right.querySelectorAll('[data-context-lens]').forEach(button=>button.addEventListener('click',()=>{this.state.activeLens=button.dataset.contextLens||'identity';render();}));
      workspace.region('RIGHT',{node:right,label:'السياق'});

      /* ---- BOTTOM: temporary deep workspace (full durable receipt) ---- */
      const bottom=document.createElement('section');bottom.className='h-bottom';
      bottom.innerHTML=`<style>.h-bottom pre{max-height:260px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;background:#070d16;border:1px solid var(--line);border-radius:9px;padding:10px}</style>
      <p class="h-lead2">التشخيص الدائم الكامل — <bdi dir="ltr">health.diagnose</bdi> فقط ينشئ هذا الإيصال؛ التحديث لا يغيّره.</p>
      ${diagnostic||state.lastDiagnostic?`<pre dir="ltr" data-w05-receipt>${E(JSON.stringify(state.lastDiagnostic,null,2))}</pre>`:`<p class="state-token" data-state="unavailable"><strong>لا يوجد تشخيص دائم بعد</strong> · No durable diagnostic receipt exists. A refresh never creates one; run the durable diagnostic to record it.</p>`}`;
      workspace.region('BOTTOM',{node:bottom,label:'التشخيص الدائم',summary:'الإيصال الكامل لآخر تشخيص دائم؛ التحديث لا ينشئ سجل تشخيص.'});
      (leftHost||stage).querySelectorAll?.('[data-health-source]').forEach(element=>element.addEventListener('click',()=>{this.inspect({sourceId:element.dataset.healthSource});render();}));
      stage.querySelectorAll('tr[data-health-row]').forEach(element=>element.addEventListener('click',()=>{this.inspect({sourceId:element.dataset.healthRow});render();}));
      stage.querySelectorAll('[data-health-next]').forEach(element=>element.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const command=element.dataset.healthNextCommand;const sourceId=element.dataset.healthNext;if(command==='health.inspect'){this.inspect({sourceId});render();return;}if(command==='health.refresh'||command==='health.diagnose'){execute(command,{});return;}}));
      workspace.refreshToolbar?.();
      return state;
    };
    const receiptFor=(command,result)=>{
      if(!result?.ok)return `Health action failed · ${result?.code||result?.reason||'UNKNOWN'}`;
      if(command==='health.diagnose')return `Durable diagnostic receipt recorded · ${result.diagnostic?.diagnosticId||'RECORDED'} · refresh never creates one`;
      if(command==='health.inspect')return `Observation inspected · selection bound to ${result.observation?.sourceId||'unknown'} · inspect records no receipt`;
      return 'Observation refresh receipt recorded · session-local observation, not a durable diagnostic';
    };
    const execute=async(command,payload={})=>{
      const r=command==='health.refresh'?await this.refresh():command==='health.diagnose'?await this.diagnose():this.inspect(payload);
      workspace.status(receiptFor(command,r),r.ok?'info':'error');
      render();
      return r;
    };
    registry.register('health.refresh',this.owner,'Refresh observed state',payload=>execute('health.refresh',payload),()=>this.availability('health.refresh'));
    registry.register('health.inspect',this.owner,'Inspect observation',payload=>execute('health.inspect',payload),payload=>this.availability('health.inspect',payload));
    registry.register('health.diagnose',this.owner,'Run durable diagnostic',payload=>execute('health.diagnose',payload),()=>this.availability('health.diagnose'));
    render();
    queueMicrotask(async()=>{await this.refresh();render();});
    return {owner:this.owner,collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',render};
  }
}
export function createHealthRuntimeAdapter(options={}){return new HealthRuntimeAdapter(options)}
