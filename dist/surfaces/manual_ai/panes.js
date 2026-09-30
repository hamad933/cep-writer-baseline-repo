/* MANUAL AI BRIDGE — PANE + SHELF PRESENTATION (W05-MANUAL-AI)
 * LEFT carries the bridge record list with real facet counts; RIGHT carries the governance context
 * that keeps a human in control of AI output; the bottom projection carries the temporary workspace
 * (packet body, imported response, digests) that the reference shows as a collapsible strip. */
                                                                               
import {FACETS,LEFT_LABEL,RECORD_BASIS,RIGHT_LABEL,STATE_META,esc,icon,L,pill,shortDigest,copyOf,stateTone} from './presentation.js';
                                                      

                                                                                                                           
const stateOf=(row               )=>row.state;
const matchText=(row               ,query       )        =>{if(!query)return true;const hay=`${row.proposalId} ${row.state} ${row.provenance.sourceId} ${row.provenance.sourceRevisionId} ${row.content} ${copyOf(row).title.en} ${copyOf(row).title.ar}`.toLowerCase();return hay.includes(query.toLowerCase())};

export function facetCounts(rows                 )                      {
  const out                      ={ALL:rows.length};
  for(const facet of FACETS){if(facet.state==='ALL')continue;out[facet.state]=rows.filter(row=>facet.states.includes(stateOf(row))).length}
  return out;
}
export function filteredRows(rows                 ,facet       ,query       )                 {
  const definition=FACETS.find(item=>item.state===facet);
  const allowed=definition?definition.states:null;
  return rows.filter(row=>(!allowed||allowed.includes(stateOf(row)))&&matchText(row,query));
}

export function renderLeft({locale,rows,facet,query,selectedId}                                                                                               )       {
  const counts=facetCounts(rows),visible=filteredRows(rows,facet,query);
  const total=rows.length;
  return `<div class="ma-pane-head"><h3>${esc(L(LEFT_LABEL,locale))}</h3><span class="ma-sub" dir="ltr">${total} REC</span></div>
    <ul class="ma-facets">${FACETS.map(item=>{
      const count=counts[item.state]??0;
      return `<li data-zero="${count===0?'true':'false'}"><button type="button" data-ma-facet="${esc(item.state)}" aria-pressed="${facet===item.state}"><span><span class="ma-fdot" style="color:${count===0?'var(--text3)':`var(--ma-${stateTone(item.state==='ALL'?'':item.state)})`}"></span>${esc(L(item,locale))}</span><span class="ma-fcount" dir="ltr">${count}</span></button></li>`;
    }).join('')}</ul>
    <div class="ma-pane-head"><span class="ma-sub" dir="ltr">RECORDS</span>
      <input type="search" data-ma-search value="${esc(query)}" placeholder="${esc(locale==='ar'?'بحث…':'Search…')}" aria-label="${esc(locale==='ar'?'بحث في سجلات الجسر':'Search bridge records')}" style="width:124px;font:600 11px var(--mono);background:var(--bg1);border:1px solid var(--line2);border-radius:7px;padding:5px 7px;color:var(--text)"/></div>
    ${visible.length?`<ul class="ma-records">${visible.map(row=>{
      const copy=copyOf(row),meta=STATE_META[row.state];
      return `<li class="ma-record"><button type="button" data-ma-record="${esc(row.proposalId)}" aria-pressed="${row.proposalId===selectedId}">
        <span class="ma-rid"><bdi dir="ltr">${esc(row.proposalId)}</bdi><span class="ma-rtime">${esc(String(row.provenance.obtainedAt).replace('T',' ').replace(/:00Z$/,'Z'))}</span></span>
        <span class="ma-rtitle" dir="auto">${esc(L(copy.title,locale))}</span>
        <span class="ma-rmeta">${pill(row.state,stateTone(row.state))}<span class="ma-rsrc">${esc(row.provenance.sourceRevisionId)}</span></span>
      </button></li>`}).join('')}</ul>`
    :`<p class="ma-empty">${esc(locale==='ar'?'لا سجلات تطابق التصفية الحالية.':'No records match the current filter.')}</p>`}`;
}

                                                                                                                                               
export function renderRight({locale,row,adapter}                                                                   )       {
  const inspected=row?adapter.inspect(row.proposalId):null;
  const availability                      =inspected?.commandAvailability||{};
  const nextKey=['draft','export','import','review'].find(key=>availability[key]==='AVAILABLE');
  const blocked=(Object.entries(availability).find(([,value])=>value!=='AVAILABLE'))||null;
  const p=row?.provenance;
  const cards       =[
    {tone:'ok',iconName:'shield',title:{ar:'تحليل مساعد فقط',en:'Assisted analysis only'},body:{ar:'الإخراج الخارجي مدخل للمراجعة فقط، ولا يُعتمد تلقائيًا أبدًا.',en:'External output is review input only; it is never accepted automatically.'},meta:'MANUAL_ONLY_PROVIDER_NEUTRAL'},
    {tone:'info',iconName:'plug',title:{ar:'لا استدعاء مزوّد مخفي',en:'No hidden provider call'},body:{ar:'CEP لا ينفّذ أي استدعاء لنموذج خارجي أثناء التبادل.',en:'CEP executes no external model call during the exchange.'},meta:'hiddenProviderCalls = 0 · automaticCanonicalPublication = false'},
    {tone:'violet',iconName:'bank',title:{ar:'تذكير بسلطة المصادر',en:'Source authority reminder'},body:{ar:'كل حزمة مرتبطة بمصدر ومراجعة وبصمة مُصرَّحة؛ لا يُشتق أي جديد.',en:'Every packet binds a declared source, revision and digest; nothing is derived.'},meta:p?`${p.sourceId} · ${p.sourceRevisionId} · ${shortDigest(p.sourceDigest,20)}`:'NO_SOURCE_BOUND'},
    {tone:'ok',iconName:'check',title:{ar:'شروط تحقّق الحملة',en:'Payload acceptance conditions'},body:{ar:'يُشترط تطابق معرّف المصدر ومراجعته وبصمتَي المصدر وحزمة التصدير قبل أي قرار.',en:'Source id, source revision, source digest and export package digest must all match before any decision.'},meta:'importRequiresDeclaredExport = true'},
    {tone:'warn',iconName:'lock',title:{ar:'معالجة البيانات الحساسة',en:'Sensitive data handling'},body:{ar:'لا تُدرج بيانات حساسة في الحمولة قبل التصدير؛ التجهيز مسؤولية المشغّل.',en:'No sensitive data is embedded before export; clearance is the operator’s responsibility.'},meta:'operator-declared clearance'},
    {tone:'info',iconName:'clock',title:{ar:'الاستجابة ليست قرارًا',en:'A response is not a decision'},body:{ar:'الاستجابة المستوردة تبقى مدخلًا غير مُتحقق منه حتى يُسجَّل قرار بشري.',en:'An imported response stays unverified input until a human disposition is recorded.'},meta:row?`state = ${row.state}`:'NO_RECORD'},
    {tone:'violet',iconName:'person',title:{ar:'قرار بشري مطلوب',en:'Human decision required'},body:{ar:'خمسة تصرفات مسرَّبة لدى المراجع؛ القبول يُنشئ مسودة عمل فقط.',en:'Five reviewer dispositions; accept creates a working draft only.'},meta:'ACCEPT · EDIT · REJECT · DEFER · REQUEST_EVIDENCE'},
    {tone:nextKey?'ok':'muted',iconName:'arrow',title:{ar:'الإجراء التالي المناسب',en:'Next appropriate action'},body:nextKey
      ?{ar:'الإجراء المسرَّح التالي جاهز في شريط الأدوات.',en:'The next admitted action is ready in the action strip.'}
      :{ar:'لا إجراء مسرَّح للطلب المحدد حاليًا.',en:'No action is admitted for the current request.'},
      meta:nextKey?nextKey:String(blocked?`${blocked[0]} → ${blocked[1]}`:'UNAVAILABLE')},
    {tone:'muted',iconName:'doc',title:{ar:'أساس السجل',en:'Record basis'},body:{ar:'سجلات تمثيلية لبنية مرجع جسر الذكاء المعتمد؛ لا توجد مقايضة خارجية حقيقية.',en:'Representative records modelled on the confirmed AI-Bridge reference; no real external exchange took place.'},meta:'W05_SURFACE_REPRESENTATIVE_RECORD'}
  ];
  const subject=row?`${row.proposalId} · ${row.state}`:(locale==='ar'?'لا طلب محدد':'No request selected');
  const summary=row
    ?(locale==='ar'?'سياق حوكمة ثابت لكل طلب: السلطة، الشروط، والإجراء التالي.':'Governance context held for every request: authority, conditions and the next action.')
    :(locale==='ar'?'الحوكمة تُعرض حتى دون طلب محدد.':'Governance is shown even with no request selected.');
  return `<div class="ma-ctx-head"><span class="ma-eyebrow"><bdi dir="ltr">GOVERNANCE CONTEXT · ${esc(L(RIGHT_LABEL,locale))}</bdi></span>
      <strong dir="auto">${esc(subject)}</strong><span dir="auto">${esc(summary)}</span></div>
    ${cards.map(card=>`<section class="ma-card" data-tone="${card.tone==='muted'?'':card.tone}">
      <h4>${icon(card.iconName,card.tone)}<span dir="auto">${esc(L(card.title,locale))}</span></h4>
      <p dir="auto">${esc(L(card.body,locale))}</p>
      ${card.meta?`<span class="ma-cmeta" dir="ltr">${esc(card.meta)}</span>`:''}
    </section>`).join('')}`;
}

/** Bottom deep-work projection: the reference's collapsible "temporary workspace". */
export function bottomProjectionFor({row,locale,adapter}                                                                   ){
  if(!row)return {recordBasis:RECORD_BASIS,selectedId:'NONE',temporaryWorkspace:locale==='ar'?'لا طلب محدد — لا حمولة ولا استجابة معروضة.':'No request selected — no payload or response is shown.',providerMode:'MANUAL_ONLY_PROVIDER_NEUTRAL',hiddenProviderCalls:0,sections:[]};
  const p=row.provenance,copy=copyOf(row),inspected=adapter.inspect(row.proposalId);
  const sections=[
    {id:'payload',label:locale==='ar'?'الحمولة المُصرَّحة للتصدير':'Cleared export payload',value:`${row.proposalId} · ${p.sourceId}@${p.sourceRevisionId} · ${copy.files.join(' + ')}`},
    {id:'response',label:locale==='ar'?'الاستجابة المستوردة':'Imported response',value:p.obtainedBy==='MANUAL_IMPORT'?String(row.content||'—'):(locale==='ar'?'لا استجابة مستوردة لهذا الطلب بعد.':'No response has been imported for this request yet.')},
    {id:'digests',label:locale==='ar'?'البصمات المُصرَّحة':'Declared digests',value:`sourceDigest=${shortDigest(p.sourceDigest,24)} · packageDigest=${shortDigest(p.exportedPackageDigest||'NOT_EXPORTED',24)}`},
    {id:'equality',label:locale==='ar'?'تسوية المصدر':'Provenance equality',value:row.state==='PROVENANCE_INVALID'?'MISMATCH — quarantined':(inspected?.provenanceMatch?'EQUAL — all four declared values matched':'PENDING — no response imported')}
  ];
  return {
    recordBasis:RECORD_BASIS,selectedId:row.proposalId,state:row.state,draftState:row.draftState,
    providerMode:'MANUAL_ONLY_PROVIDER_NEUTRAL',hiddenProviderCalls:0,automaticCanonicalPublication:false,
    sourceRevisionDigestEqualityRequired:true,acceptCreatesDraftOnly:true,
    temporaryWorkspace:locale==='ar'?'مساحة عمل مؤقتة — تحمل نص الحمولة الكامل، الاستجابة الخفية، الملفات، والبصمات.':'Temporary workspace — holds the full payload text, the hidden response, the files and the digests.',
    sections
  };
}
