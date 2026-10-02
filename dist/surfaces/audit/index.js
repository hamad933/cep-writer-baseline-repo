import {AuditProvenanceHost} from '../../foundation/audit/provenance-host.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {createAuditConsumerAdapter,AUDIT_COMMANDS} from '../../adapters/audit.js';
import {resolveSystemLocale} from '../../foundation/global/preferences/language-policy.js';
import {CEP_GLOBAL_AREA_BASELINE} from '../../foundation/global/shell/destination-registry.js';

/* AUDIT — traceability workbench.
   Composition authority: cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png
   Reference structure (RTL): scope desk (LEFT) · dense event ledger + trace chain + evidence deck (CENTER) ·
   selected-event inspector (RIGHT) · deep raw/register ledger (BOTTOM).
   Language: Arabic and English are BOTH first-class; the active language comes from the document
   preference (Settings), never from this file. Direction is inherited — no `dir` is baked into structure;
   technical tokens stay isolated with <bdi dir="ltr">. */

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

/* ---------------------------------------------------------------- localization */
const COPY={
  ar:{
    title:'السجل التدقيقي',otherTitle:'Audit & Traceability',
    lead:'تاريخ الأحداث ونشاط المستخدمين عبر النظام والعمليات — سلسلة التجزئة قابلة للفحص للتحقق، لا للتشفير؛ والالتزامات تُخزَّن كتعديلات منفصلة لا تُغيّر السجل أبدًا.',
    eyebrow:'W05 · DURABLE EVENT TRACE',
    searchPh:'ابحث في الفاعل / الإجراء / الهدف / التجزئة',
    actor:'الفاعل',action:'الإجراء',outcome:'النتيجة',allActors:'كل الفاعلين',allActions:'كل الإجراءات',allOutcomes:'كل النتائج',
    reset:'إعادة ضبط',verify:'فحص السلسلة',exportLabel:'تصدير السجل',more:'المزيد من الأوامر',
    live:'آخر فحص',events:'حدث',durable:'مزوّد دائم',session:'جلسة محلية',
    colTime:'الوقت',colActor:'الفاعل',colActorType:'نوع الفاعل',colResult:'النتيجة',colWorkspace:'مساحة العمل',
    colEntity:'معرّف الكيان',colAction:'الإجراء',colType:'نوع الحدث',colSource:'المصدر',colTrace:'معرّف التتبّع',
    showing:'عرض',of:'من',
    emptyTable:'لا توجد أحداث مطابقة',emptyTableHint:'عدّل عوامل التصفية؛ الغياب ليس دليلًا على غياب التغطية.',
    chainTitle:'سلسلة التتبّع',chainCount:'حدثًا في السلسلة',chainFull:'عرض السلسلة الكاملة',chainNone:'لا توجد سلسلة تتبّع لهذا الحدث.',
    tabRaw:'الحمولة الخام',tabKey:'مفتاح البيانات',tabTrace:'سلسلة التتبّع',tabDiff:'الفرق (قبل / بعد)',tabLog:'تدقيق مُخالف المستوى',
    keyTitle:'مفتاح البيانات',logTitle:'سجل التحقق من التجزئة',rawTitle:'الحمولة الخام',
    diffTitle:'قبل / بعد',diffNone:'لا يوجد فرق (قبل / بعد) مسجّل لهذا الحدث.',
    logNone:'لا توجد سجلات تحقق بعد — نفّذ فحص السلسلة.',
    annotTitle:'التزام منفصل',annotLead:'يُخزَّن التعليق كمراجعة مستقلة؛ لا يُعيد كتابة أي حدث.',
    annotEvent:'معرّف الحدث (eventId)',annotNote:'التعليق — يُخزَّن منفصلًا عن الحدث',annotSubmit:'تعليق منفصل',
    annotPending:'قيد الانتظار…',annotOk:'سُجّل التعليق كمراجعة منفصلة',annotFail:'تعذّر التعليق',
    annotNone:'لا توجد التزامات مسجلة بعد؛ أبدًا لا يتغيّر السجل.',
    leftTitle:'مكتب السجل التدقيقي',leftScopes:'نطاقات السجل',leftViews:'موضوعات محفوظة',leftSource:'مصدر السجل',
    planeAll:'كل المصادر',planeDurable:'مزوّد دائم (JSONL)',planeSession:'سجل الجلسة (SESSION_LOCAL)',
    rightTitle:'تفصيل الحدث المحدد',rActor:'الفاعل',rContext:'سياق الجهاز والمصدر',rAction:'تفاصيل الإجراء',
    rDesc:'السبب / الوصف',rDiff:'قبل (رُفض) / بعد',rRefs:'مراجع مرتبطة',rPolicy:'سياق السياسة وحدود الحقيقة',
    rWarn:'تنبيه تغطية',rVerifyNow:'فحص ضوابط السجل',rNone:'اختر حدثًا من الجدول لعرض تفاصيله.',
    rIp:'العنوان',rSession:'الجلسة',rClient:'العميل',rNode:'العقدة',rTimezone:'المنطقة الزمنية',rLocalTime:'الوقت المحلي',
    rRole:'الدور',rGroup:'المجموعة',rEmail:'الحساب',rType:'النوع',
    rActionF:'الإجراء',rResult:'النتيجة',rTarget:'الهدف',rEntity:'معرّف الحدث',rWorkspace:'مساحة العمل',rSeq:'التسلسل',
    bottomRaw:'السجل الخام',bottomReg:'سجل الالتزامات',bottomScope:'نطاق التحقق وحدود الحقيقة',
    provTitle:'سلسلة الفحص والبروفنانس',
    statusChain:'حالة السلسلة',firstInvalid:'أول تسلسل غير صالح',watermark:'علامة المائية',
    persistence:'الحفظ',coverage:'التغطية',hashNote:'SHA-256 للتحقق لا للتخزين',
    ok:'تم',fail:'فشل مُغلق',pending:'قيد الانتظار',
    notice:'ملاحظة السجل',related:'مرتبط',annotations:'التزامات',noChange:'لا تغيير مسجّل',
    eventSingular:'حدث',
    subLead:'الأحداث ونشاط المستخدمين عبر النظام والعمليات — سلسلة تجزئة قابلة للفحص، لا للتشفير.',
    lockTitle:'السجل مقفل — للإضافة فقط',lockSub:'الملاحظات تُخزَّن منفصلة',
    lockFull:'لا يمكن تعديل حدث مسجّل؛ الملاحظات تُخزَّن منفصلة عن السجل · databaseImmutabilityClaim=false',
    mutableTitle:'الملاحظات قابلة للتعديل',newNote:'ملاحظة جديدة',
    actionBarLabel:'شريط حالة السجل والإجراءات'
  },
  en:{
    title:'Audit Register',otherTitle:'السجل التدقيقي',
    lead:'History of events and user activity across System & Operations — an inspectable hash chain for verification, never encryption; annotations are stored as separate revisions that never rewrite the record.',
    eyebrow:'W05 · DURABLE EVENT TRACE',
    searchPh:'Search actor / action / target / hash',
    actor:'Actor',action:'Action',outcome:'Result',allActors:'All actors',allActions:'All actions',allOutcomes:'All results',
    reset:'Reset',verify:'Verify chain',exportLabel:'Export record',more:'More commands',
    live:'Last verified',events:'events',durable:'Durable provider',session:'Session ledger',
    colTime:'Time',colActor:'Actor',colActorType:'Actor type',colResult:'Result',colWorkspace:'Workspace',
    colEntity:'Entity id',colAction:'Action',colType:'Event type',colSource:'Source',colTrace:'Trace id',
    showing:'Showing',of:'of',
    emptyTable:'No matching AuditEvent',emptyTableHint:'Adjust the filters — a missing row is not a coverage claim.',
    chainTitle:'Trace chain',chainCount:'events in this chain',chainFull:'View full chain',chainNone:'No trace chain is bound to this event.',
    tabRaw:'Raw payload',tabKey:'Data key',tabTrace:'Trace chain',tabDiff:'Diff (before / after)',tabLog:'Low-level verification',
    keyTitle:'Data key',logTitle:'Hash verification log',rawTitle:'Raw payload',
    diffTitle:'Before / after',diffNone:'No before/after diff is recorded for this event.',
    logNone:'No verification entries yet — run Verify chain.',
    annotTitle:'Separate annotation',annotLead:'The note is stored as an independent revision; it never rewrites an AuditEvent.',
    annotEvent:'AuditEvent id (eventId)',annotNote:'Annotation — stored separately from the AuditEvent',annotSubmit:'Annotate',
    annotPending:'Pending…',annotOk:'Annotation recorded as a separate revision',annotFail:'Annotation failed closed',
    annotNone:'No annotations recorded yet; the record is never rewritten.',
    leftTitle:'Audit record desk',leftScopes:'Record scopes',leftViews:'Saved views',leftSource:'Record source',
    planeAll:'All sources',planeDurable:'Durable provider (JSONL)',planeSession:'Session ledger (SESSION_LOCAL)',
    rightTitle:'Selected event detail',rActor:'Actor',rContext:'Device & source context',rAction:'Action details',
    rDesc:'Reason / description',rDiff:'Before (rejected) / after',rRefs:'Linked references',rPolicy:'Policy context & truth ceiling',
    rWarn:'Coverage notice',rVerifyNow:'Verify record controls',rNone:'Select an event row to inspect it.',
    rIp:'Address',rSession:'Session',rClient:'Client',rNode:'Node',rTimezone:'Timezone',rLocalTime:'Local time',
    rRole:'Role',rGroup:'Group',rEmail:'Account',rType:'Type',
    rActionF:'Action',rResult:'Result',rTarget:'Target',rEntity:'Event id',rWorkspace:'Workspace',rSeq:'Sequence',
    bottomRaw:'Raw record',bottomReg:'Annotation register',bottomScope:'Verification scope & truth ceiling',
    provTitle:'Inspection chain / provenance',
    statusChain:'Chain status',firstInvalid:'First invalid sequence',watermark:'Watermark',
    persistence:'Persistence',coverage:'Coverage',hashNote:'SHA-256 for verification, not encryption',
    ok:'Done',fail:'Failed closed',pending:'Pending',
    notice:'Record notice',related:'Related',annotations:'Annotations',noChange:'No change recorded',
    eventSingular:'event',
    subLead:'Events and user activity across System & Operations — an inspectable hash chain, never encryption.',
    lockTitle:'Record locked — append-only',lockSub:'Notes are stored separately',
    lockFull:'A recorded event cannot be edited; notes are stored separately from the record · databaseImmutabilityClaim=false',
    mutableTitle:'Annotations mutable',newNote:'New note',
    actionBarLabel:'Record status & actions'
  }
};
const locale=()=>{const lang=document.documentElement.lang;return lang==='ar'||lang==='en'?lang:resolveSystemLocale();};
const T=()=>COPY[locale()];

/* event-type vocabulary — bilingual labels derived from the recorded action (no invented content) */
const EVENT_TYPE={
  PLATFORM_STARTUP:{ar:'بدء تشغيل المنصة',en:'Platform startup'},
  SESSION_TOKEN_ROTATED:{ar:'تدوير رمز الجلسة',en:'Session token rotation'},
  EDIT_CONFIGURATION_OBJECT:{ar:'تعديل كائن تكويني',en:'Configuration object edit'},
  VALIDATE_CONFIGURATION_REVISION:{ar:'تحقّق من مراجعة تكوينية',en:'Configuration revision validation'},
  VALIDATE_BACKUP:{ar:'تحقّق من نسخة احتياطية',en:'Backup validation'},
  RESTORE_REHEARSAL:{ar:'إعادة تشغيل استعادة',en:'Restore rehearsal'},
  PUBLISH_CONFIGURATION_REVISION:{ar:'نشر مراجعة تكوينية',en:'Configuration revision publish'},
  PROMOTE_RELEASE:{ar:'ترقية إصدار',en:'Release promotion'},
  APPROVE_RELEASE_CANDIDATE:{ar:'اعتماد مرشّح إصدار',en:'Release candidate approval'},
  UPDATE_SIMULATION_PARAMETERS:{ar:'تحديث معاملات المحاكاة',en:'Simulation parameter update'},
  POLICY_EVALUATION:{ar:'تقييم سياسة',en:'Policy evaluation'},
  ACCESS_DENIED:{ar:'رُفض وصول',en:'Access denied'},
  PROCESSING_JOB_CREATED:{ar:'إنشاء مهمة معالجة',en:'Processing job created'},
  ATTEMPT_SUCCEEDED:{ar:'نجاح محاولة',en:'Attempt succeeded'},
  START_SIMULATION_RUN:{ar:'بدء تشغيل محاكاة',en:'Simulation run start'},
  SIMULATION_RUN_COMPLETED:{ar:'اكتمال تشغيل المحاكاة',en:'Simulation run completed'},
  CREATE_CANDIDATE_RESULT:{ar:'إنشاء نتيجة مرشّحة',en:'Candidate result created'},
  SECURITY_REVIEW_OPENED:{ar:'فتح مراجعة أمنية',en:'Security review opened'},
  AUDIT_EXPORT_PREPARED:{ar:'تجهيز تصدير التدقيق',en:'Audit export prepared'},
  RESULT_PUBLISHED:{ar:'نتيجة منشورة',en:'Result published'},
  EVIDENCE_FILE_STORED:{ar:'تخزين ملف دليل',en:'Evidence file stored'},
  EVIDENCE_METADATA_INDEXED:{ar:'فهرسة بيانات الدليل',en:'Evidence metadata indexed'},
  CREATE_CANDIDATE_EVIDENCE_HANDOFF:{ar:'تسليم دليل مرشّح',en:'Candidate evidence handoff'},
  INTEGRITY_WATERMARK_RECORDED:{ar:'تسجيل علامة سلامة السلسلة',en:'Integrity watermark recorded'},
  AUDIT_DOMAIN_INITIALIZED:{ar:'تهيئة نطاق التدقيق',en:'Audit domain initialised'}
};
const OUTCOME_LABEL={
  SUCCESS:{ar:'نجاح',en:'Success'},DENIED:{ar:'مرفوض',en:'Denied'},PARTIAL_SUCCESS:{ar:'نجاح جزئي',en:'Partial success'},
  QUEUED:{ar:'في الانتظار',en:'Queued'},FAILURE:{ar:'فشل',en:'Failure'},READY:{ar:'جاهز',en:'Ready'},
  OBSERVED:{ar:'مُراقَب',en:'Observed'},VALID_CHAIN:{ar:'سلسلة صالحة',en:'Valid chain'}
};
const ACTOR_TYPE={user:{ar:'مستخدم',en:'User'},system:{ar:'النظام',en:'System'},controller:{ar:'متحكّم',en:'Controller'}};
const toneFor=outcome=>/FAIL|ERROR|DENY|REFUSE/i.test(String(outcome||''))?'bad':/PARTIAL|WARN|QUEUED/i.test(String(outcome||''))?'warn':'ok';
const label=(dict,key,lang)=>dict[key]?dict[key][lang]||dict[key].en:esc(key);

/* record scopes (LEFT desk) — categories are a real facet of the recorded actions */
const SCOPES=[
  {id:'all',icon:'i-list',ar:'كل الأحداث',en:'All events'},
  {id:'auth',icon:'i-shield',ar:'المصادقة والوصول',en:'Authentication & access',actions:['SESSION_TOKEN_ROTATED']},
  {id:'config',icon:'i-code',ar:'التغييرات المخوّلة',en:'Authorized configuration changes',actions:['EDIT_CONFIGURATION_OBJECT','VALIDATE_CONFIGURATION_REVISION','PUBLISH_CONFIGURATION_REVISION']},
  {id:'backup',icon:'i-lock',ar:'عمليات النسخ الاحتياطي',en:'Backup & restore operations',actions:['VALIDATE_BACKUP','RESTORE_REHEARSAL']},
  {id:'release',icon:'i-check',ar:'عمليات الإصدارات',en:'Release operations',actions:['PROMOTE_RELEASE','APPROVE_RELEASE_CANDIDATE']},
  {id:'sim',icon:'i-lab',ar:'عمليات المحاكاة والنتائج',en:'Simulation & results',actions:['UPDATE_SIMULATION_PARAMETERS','START_SIMULATION_RUN','SIMULATION_RUN_COMPLETED','CREATE_CANDIDATE_RESULT','RESULT_PUBLISHED']},
  {id:'evidence',icon:'i-ref',ar:'عمليات الأدلة',en:'Evidence operations',actions:['EVIDENCE_FILE_STORED','EVIDENCE_METADATA_INDEXED','CREATE_CANDIDATE_EVIDENCE_HANDOFF']},
  {id:'security',icon:'i-warn',ar:'إجراءات حساسة أمنياً',en:'Security-sensitive actions',actions:['POLICY_EVALUATION','ACCESS_DENIED','SECURITY_REVIEW_OPENED']},
  {id:'platform',icon:'i-info',ar:'المنصة والمعالجة',en:'Platform & processing',actions:['PLATFORM_STARTUP','AUDIT_DOMAIN_INITIALIZED','PROCESSING_JOB_CREATED','ATTEMPT_SUCCEEDED','AUDIT_EXPORT_PREPARED','INTEGRITY_WATERMARK_RECORDED']}
];
const scopeOf=row=>(SCOPES.find(scope=>scope.id!=='all'&&scope.actions?.includes(row.action))||SCOPES[0]).id;
const VIEWS=[
  {id:'denied',ar:'نتائج مرفوضة أو فاشلة',en:'Denied or failed outcomes',match:row=>/DENIED|FAILURE|PARTIAL/i.test(String(row.outcome||''))},
  {id:'recent',ar:'آخر ٢٤ ساعة',en:'Last 24 hours',match:row=>Date.now()-Date.parse(row.occurredAt)<24*3600*1000},
  {id:'exports',ar:'عمليات التصدير',en:'Export operations',match:row=>/EXPORT/.test(String(row.action||''))},
  /* second argument = annotation count for this row (supplied by the mount, which owns the annotation store) */
  {id:'annotated',ar:'أحداث ذو التزامات',en:'Events with annotations',match:(row,annotationCount)=>Number(annotationCount)>0}
];
const ICONS={
  clock:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2"/>',
  upload:'<path d="M12 16V4m0 0 4 4m-4-4L8 8M4 20h16"/>'
};
const svgIcon=(paths,cls='icon sm')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const icon=(id)=>`<svg class="icon sm" aria-hidden="true"><use href="#${id}"></use></svg>`;

/* ---------------------------------------------------------------- presentation tokens */
const STYLE=`
.s18-audit{display:grid;gap:8px;min-width:0}
.s18-audit *{box-sizing:border-box}
/* compact single-tier surface header: identity + status row and command controls inside ONE tier
   (AUD-V3 — replaces the former heavy identity tier + separate command tier) */
.a-head{display:grid;gap:8px;padding:8px 0 10px;border-block-end:1px solid var(--line);min-width:0}
.a-head-top{display:flex;gap:8px 16px;align-items:center;flex-wrap:wrap;min-width:0}
.a-head-id{display:flex;align-items:baseline;gap:9px;flex-wrap:nowrap;min-width:0}
.a-head h1{margin:0;font-size:clamp(16px,1.5vw,19px);line-height:1.3;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-width:0}
.a-head h1 small{font-size:11.5px;font-weight:600;color:var(--text3);white-space:nowrap}
.a-lead{margin:0;color:var(--text3);flex:1 1 120px;line-height:1.4;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.a-head-side{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-inline-start:auto}
.a-live{display:inline-flex;align-items:center;gap:6px;font:600 10.5px var(--mono);color:var(--text2);border:1px solid var(--line);border-radius:999px;padding:3px 9px;background:color-mix(in srgb,var(--elev) 70%,transparent);white-space:nowrap}
.a-live .dot{inline-size:6px;block-size:6px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 22%,transparent)}
.a-chips{display:flex;gap:5px;flex-wrap:wrap;justify-content:end}
.a-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font:600 10px var(--mono);color:var(--text2);background:color-mix(in srgb,var(--bg2) 80%,transparent);white-space:nowrap}
.a-chip[data-tone="ok"]{border-color:color-mix(in srgb,var(--ok) 55%,var(--line));color:var(--ok)}
.a-chip[data-tone="bad"]{border-color:color-mix(in srgb,var(--bad) 55%,var(--line));color:var(--bad)}
.a-chip[data-tone="warn"]{border-color:color-mix(in srgb,var(--warn) 55%,var(--line));color:var(--warn)}
.a-cmdbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.a-search{position:relative;flex:1 1 240px;min-width:180px;display:flex;align-items:center}
.a-search .icon{position:absolute;inset-inline-start:10px;color:var(--text3);pointer-events:none}
.a-search input{inline-size:100%;min-inline-size:0;height:30px;padding:0 10px 0 30px;border:1px solid var(--line);border-radius:9px;background:var(--bg2);color:var(--text);font-size:12.5px}
[dir="rtl"] .a-search input{padding:0 30px 0 10px}
.a-search input:focus-visible{outline:2px solid var(--focus);outline-offset:1px;border-color:var(--focus)}
.a-sel{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 6px 0 10px;border:1px solid var(--line);border-radius:9px;background:var(--bg2);font-size:12px;color:var(--text2)}
[dir="rtl"] .a-sel{padding:0 10px 0 6px}
.a-sel select{border:0;background:transparent;color:var(--text);font-size:12px;max-inline-size:132px;padding:4px 2px}
.a-sel select:focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:5px}
.a-cmdbar .a-gap{flex:1 1 auto}
.a-btn-verify{background:color-mix(in srgb,var(--accent) 18%,var(--bg2));border:1px solid color-mix(in srgb,var(--accent) 55%,var(--line));color:var(--accent2);font-weight:700}
.a-btn-verify:hover{background:color-mix(in srgb,var(--accent) 28%,var(--bg2));color:var(--text)}
.a-panel{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--bg1) 88%,transparent);min-width:0;overflow:hidden}
/* lower band: trace timeline + evidence/JSON deck side by side below the ledger (AUD-V1 split)
   — the center pane is ~650px wide beside the context panes, so the reference's two lower bands
   are composed as one band of two panes instead of being clipped by the vertical budget. */
.a-lower{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,1fr);gap:10px;min-width:0;align-items:start}
.a-lower .a-chain{padding:8px}
.a-lower .a-chain-head{padding:5px 10px;gap:6px}
.a-lower .a-chain-head .btn{padding:4px 9px;font-size:11px;min-height:24px}
.a-lower .a-node{flex:1 1 108px;padding:8px 9px 7px}
.a-lower .a-node-row{flex-direction:column;align-items:flex-start;gap:1px}
.a-lower .a-arrow{padding-inline:4px}
/* the deck cannot keep the reference's 3-band width in a half-width pane: panels stack and
   each scrolls under its own cap, so the raw payload still leads the band. */
.a-lower .a-deep{grid-template-columns:1fr}
.a-lower .a-deep>section{border-inline-end:0;border-block-end:1px solid var(--line);padding:7px 10px}
.a-lower .a-tabs{flex-wrap:nowrap;overflow-x:auto}
.a-lower .a-tab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-inline-size:100%}
.a-lower .a-node{gap:2px}
.a-lower .a-node-actor{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px}
.a-lower .a-node-foot{font-size:10px}
.a-lower .a-node-time{font-size:10px}
.a-lower .a-deep>section:last-child{border-block-end:0}
.a-panel-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:7px 12px;border-block-end:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 70%,transparent)}
.a-panel-head h2{margin:0;font-size:13px}
.a-panel-head .a-sub{font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3)}
.a-panel-head .a-grow{flex:1 1 auto}
.a-tablewrap{overflow:auto;max-block-size:clamp(140px,17vh,240px)}
.a-table{inline-size:100%;border-collapse:separate;border-spacing:0;min-inline-size:700px;table-layout:fixed}
.a-table th,.a-table td{padding:5px 7px;text-align:start;vertical-align:middle;border-block-end:1px solid color-mix(in srgb,var(--line) 70%,transparent);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.a-table th{position:sticky;inset-block-start:0;z-index:1;background:var(--bg2);color:var(--text3);font-size:10.5px;font-weight:700;letter-spacing:.02em;box-shadow:inset 0 -1px 0 var(--line)}
.a-table tbody tr{cursor:pointer}
.a-table tbody tr:hover{background:rgba(255,255,255,.04)}
.a-table tbody tr[data-selected="true"]{background:var(--as);outline:1px solid var(--accent);outline-offset:-1px}
.a-table tbody tr:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.a-table td.mono,.a-table td bdi{font-family:var(--mono)}
.a-plane{display:inline-block;inline-size:7px;block-size:7px;border-radius:50%;margin-inline-end:6px;vertical-align:middle}
.a-plane[data-plane="PROVIDER_DURABLE_JSONL"]{background:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 25%,transparent)}
.a-plane[data-plane="SESSION_LOCAL"]{background:var(--violet);box-shadow:0 0 0 2px color-mix(in srgb,var(--violet) 25%,transparent)}
.a-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:10.5px;color:var(--text3);align-items:center}
.a-legend .a-plane{margin-inline-end:4px}
.a-empty{margin:0;padding:18px 14px;color:var(--text3);font-size:12.5px;text-align:center}
.a-chain-head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:7px 12px;border-block-end:1px solid var(--line)}
.a-trace{font:700 13px var(--mono);letter-spacing:.02em}
.a-chain-count{font-size:11.5px;color:var(--text3)}
.a-chain{display:flex;gap:0;align-items:stretch;padding:10px;overflow-x:auto;direction:ltr}
.a-node{position:relative;border:1px solid var(--line);border-radius:11px;background:color-mix(in srgb,var(--bg2) 85%,transparent);padding:9px 10px 8px;min-inline-size:0;flex:1 1 200px;display:grid;gap:3px;align-content:start;direction:inherit}
.a-node[data-anchor="true"]{border-color:color-mix(in srgb,var(--accent) 65%,var(--line));box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
.a-node .a-badge{position:absolute;inset-block-start:-9px;inset-inline-end:10px;inline-size:20px;block-size:20px;border-radius:50%;border:1px solid var(--accent);background:var(--bg1);display:grid;place-items:center;font:700 10px var(--mono);color:var(--accent)}
.a-node .a-node-time{font:600 11px var(--mono);color:var(--text3)}
.a-node .a-node-actor{font-size:13px;font-weight:700}
.a-node .a-node-row{display:flex;gap:8px;justify-content:space-between;align-items:baseline;padding-block:4px;border-block:1px solid color-mix(in srgb,var(--line) 65%,transparent);min-width:0}
.a-node .a-node-action{font:600 10.5px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.a-node .a-node-target{font:600 10.5px var(--mono);color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.a-node .a-node-foot{display:flex;gap:8px;justify-content:space-between;align-items:baseline}
.a-node .a-node-src{font-size:11px;color:var(--text3)}
.a-arrow{align-self:center;display:grid;place-items:center;padding-inline:8px;color:var(--text3);flex:0 0 auto}
.a-arrow .icon{inline-size:16px;block-size:16px}
.a-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:6px 10px;border-block-end:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 55%,transparent)}
.a-tab{border:1px solid transparent;border-radius:8px;background:transparent;color:var(--text2);font-size:12px;padding:5px 10px;cursor:pointer;display:inline-flex;gap:6px;align-items:center;min-height:27px}
.a-tab:hover{background:rgba(255,255,255,.05);color:var(--text)}
.a-tab[aria-selected="true"]{background:var(--as);border-color:color-mix(in srgb,var(--accent) 45%,var(--line));color:var(--accent2);font-weight:700}
.a-tab .a-tab-n{font:600 10px var(--mono);opacity:.85}
.a-deep{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);gap:0}
.a-deep>section{padding:9px 11px;min-width:0;border-inline-end:1px solid var(--line)}
.a-deep>section:last-child{border-inline-end:0}
.a-deep h3{margin:0 0 7px;font-size:12px;display:flex;gap:8px;align-items:center;color:var(--text2)}
.a-deep h3 .a-sub{font:600 9.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--text3)}
.a-json{margin:0;max-block-size:clamp(105px,14vh,170px);overflow:auto;background:var(--bg0);border:1px solid var(--line);border-radius:9px;padding:9px 10px;direction:ltr;text-align:left;unicode-bidi:isolate;font:11px/1.55 var(--mono);counter-reset:ln}
.a-json .ln{display:block;white-space:pre-wrap;overflow-wrap:anywhere;padding-inline-start:34px;position:relative}
.a-json .ln::before{content:counter(ln);counter-increment:ln;position:absolute;inset-inline-start:0;inline-size:26px;text-align:end;color:var(--text3);opacity:.6}
.j-k{color:var(--accent2)}.j-s{color:var(--ok)}.j-n{color:var(--warn)}.j-b{color:var(--violet)}
.a-kv{margin:0;display:grid;gap:0;max-block-size:clamp(105px,14vh,170px);overflow:auto}
.a-kv .a-kv-row{display:grid;grid-template-columns:minmax(84px,.5fr) minmax(0,1fr);gap:10px;padding:6px 0;border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent);font-size:11.5px}
.a-kv .a-kv-row:last-child{border-block-end:0}
.a-kv dt{color:var(--text3)}
.a-kv dd{margin:0;overflow-wrap:anywhere;text-align:end}
.a-log{margin:0;padding:0;list-style:none;display:grid;gap:5px;max-block-size:clamp(105px,14vh,170px);overflow:auto}
.a-log li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;font-size:11px;padding:5px 7px;border:1px solid color-mix(in srgb,var(--line) 65%,transparent);border-radius:7px;background:color-mix(in srgb,var(--bg2) 60%,transparent)}
.a-log .a-log-t{font:600 10px var(--mono);color:var(--text3)}
.a-log .a-log-m{font:600 10px var(--mono);overflow-wrap:anywhere}
.a-log .a-log-s{display:grid;place-items:center;inline-size:16px;block-size:16px;border-radius:50%}
.a-log [data-state="ok"] .a-log-s{background:color-mix(in srgb,var(--ok) 25%,transparent);color:var(--ok)}
.a-log [data-state="bad"] .a-log-s{background:color-mix(in srgb,var(--bad) 25%,transparent);color:var(--bad)}
.a-log [data-state="warn"] .a-log-s{background:color-mix(in srgb,var(--warn) 25%,transparent);color:var(--warn)}
.a-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.a-diff h4{margin:0 0 5px;font-size:11px;color:var(--text3)}
.a-diff pre{margin:0;background:var(--bg0);border:1px solid var(--line);border-radius:8px;padding:8px;max-block-size:220px;overflow:auto;font:11px/1.5 var(--mono);direction:ltr;text-align:left;unicode-bidi:isolate;overflow-wrap:anywhere;white-space:pre-wrap}
.a-diff .a-before{border-color:color-mix(in srgb,var(--bad) 40%,var(--line))}
.a-diff .a-after{border-color:color-mix(in srgb,var(--ok) 40%,var(--line))}
.a-annot{display:grid;gap:6px;padding:8px 11px;border-block-start:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 45%,transparent)}
.a-annot-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.a-annot-head h3{margin:0;font-size:12.5px}
.a-annot-head p{margin:0;font-size:11.5px;color:var(--text3)}
.a-form{display:grid;grid-template-columns:minmax(150px,.45fr) minmax(0,1fr) auto;gap:8px}
.a-form input{min-width:0;border:1px solid var(--line);border-radius:9px;background:var(--bg1);color:inherit;padding:7px 10px;font-size:12.5px}
.a-form input:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.a-form .btn{padding:9px 14px}
.a-settle{display:grid;gap:3px;border:1px dashed var(--line);border-radius:10px;padding:9px 12px;font-size:12px;background:color-mix(in srgb,var(--bg1) 70%,transparent)}
.a-settle[data-state="SUCCESS"]{border-color:color-mix(in srgb,var(--ok) 65%,var(--line));border-style:solid}
.a-settle[data-state="FAILURE"]{border-color:color-mix(in srgb,var(--bad) 65%,var(--line));border-style:solid}
.a-settle bdi{font-family:var(--mono)}
.a-settle .a-settle-idle{color:var(--text3)}
/* BOTTOM ACTION / STATUS BAR (AUD-V2) — sticky surface action bar: locked/mutable record
   indicator at the start, create-note action at the end (reference bottom bar composition). */
.a-actionbar{position:sticky;inset-block-end:0;z-index:5;display:flex;gap:4px 12px;align-items:center;flex-wrap:wrap;padding:5px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg2);box-shadow:0 -8px 20px rgba(0,0,0,.35);font-size:12px}
.a-lock{display:inline-flex;gap:7px;align-items:center;font-size:12px;min-width:0}
.a-lock strong{font-weight:700;white-space:nowrap}
.a-lock .a-sub{color:var(--text3);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.a-lock .icon{inline-size:15px;block-size:15px;color:var(--warn)}
.a-mutable{display:inline-flex;gap:6px;align-items:center;font:600 10.5px var(--mono);color:var(--text2);border:1px solid var(--line);border-radius:999px;padding:3px 9px;white-space:nowrap}
.a-mutable .dot{inline-size:6px;block-size:6px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 22%,transparent)}
.a-actionbar .a-grow{flex:1 1 auto}
.a-btn-note{display:inline-flex;gap:6px;align-items:center;font-weight:700;white-space:nowrap;padding:6px 11px}
.a-btn-note .icon{inline-size:15px;block-size:15px}
/* LEFT — audit record desk */
.a-desk{display:grid;gap:14px;min-width:0}
.a-desk h3{margin:0 0 6px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)}
.a-scope{display:grid;gap:3px;list-style:none;margin:0;padding:0}
.a-scope button{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center;width:100%;text-align:start;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--text2);padding:8px 9px;cursor:pointer;font-size:12.5px;min-height:36px}
.a-scope button:hover{background:rgba(255,255,255,.05);color:var(--text)}
.a-scope button[aria-pressed="true"]{background:var(--as);border-color:color-mix(in srgb,var(--accent) 42%,var(--line));color:var(--accent2);font-weight:700}
.a-scope .a-count{font:600 11px var(--mono);color:var(--text3)}
.a-scope button[aria-pressed="true"] .a-count{color:var(--accent2)}
.a-views{display:grid;gap:6px;list-style:none;margin:0;padding:0}
.a-views button{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center;width:100%;text-align:start;border:1px solid var(--line);border-radius:9px;background:color-mix(in srgb,var(--bg2) 70%,transparent);color:var(--text2);padding:8px 9px;cursor:pointer;font-size:12.5px;min-height:36px}
.a-views button:hover{border-color:color-mix(in srgb,var(--accent) 40%,var(--line));color:var(--text)}
.a-views button[aria-pressed="true"]{background:var(--as);border-color:color-mix(in srgb,var(--accent) 55%,var(--line));color:var(--accent2);font-weight:700}
.a-views .a-vhint{color:var(--text3);font:600 10px var(--mono)}
.a-planes{display:grid;gap:5px;list-style:none;margin:0;padding:0}
.a-planes button{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;text-align:start;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--text2);padding:7px 9px;cursor:pointer;font-size:12px;min-height:34px}
.a-planes button[aria-pressed="true"]{background:rgba(255,255,255,.06);border-color:var(--line);color:var(--text)}
.a-desk-note{font-size:11px;color:var(--text3);line-height:1.5;border-block-start:1px solid var(--line);padding-block-start:9px}
/* RIGHT — selected event inspector */
.a-ctx{display:grid;gap:0;min-width:0}
.a-ctx-block{padding:12px 2px;border-block-end:1px solid var(--line);min-width:0;display:grid;gap:7px}
.a-ctx-block:last-child{border-block-end:0}
.a-ctx-block h3{margin:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text3)}
.a-actor{display:grid;grid-template-columns:auto minmax(0,1fr);gap:11px;align-items:center}
.a-avatar{inline-size:42px;block-size:42px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:16px;background:var(--as);color:var(--accent2);border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line))}
.a-actor-name{display:flex;gap:7px;align-items:baseline;flex-wrap:wrap;min-width:0}
.a-actor-name strong{font-size:15px}
.a-badge{display:inline-flex;align-items:center;gap:4px;border:1px solid color-mix(in srgb,var(--ok) 55%,var(--line));color:var(--ok);border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700}
.a-actor-mail{font:11px var(--mono);color:var(--text3);overflow-wrap:anywhere}
.a-ctx dl.a-kv .a-kv-row{grid-template-columns:minmax(78px,.5fr) minmax(0,1fr)}
.a-notice{border-inline-start:3px solid var(--warn);background:color-mix(in srgb,var(--warn) 9%,transparent);border-radius:8px;padding:9px 11px;font-size:12px;line-height:1.55;display:grid;gap:7px}
.a-notice strong{color:var(--warn)}
.a-truth{display:grid;gap:5px;font-size:11.5px;color:var(--text2)}
.a-truth code{font-family:var(--mono);font-size:10.5px;color:var(--text3)}
.a-refs{display:grid;gap:6px;list-style:none;margin:0;padding:0}
.a-refs li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;font-size:11.5px;min-width:0}
.a-refs bdi{font-family:var(--mono);font-size:11px;overflow-wrap:anywhere}
.a-refs .ok{color:var(--ok)}
/* BOTTOM — deep ledger */
.a-bottom{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;min-width:0}
.a-bottom section{min-width:0;display:grid;gap:7px;align-content:start}
.a-bottom h3{margin:0;font-size:12.5px}
.a-bottom pre{margin:0;max-block-size:320px;overflow:auto;background:var(--bg0);border:1px solid var(--line);border-radius:9px;padding:10px;direction:ltr;text-align:left;unicode-bidi:isolate;font:11px/1.55 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere}
.a-reg{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.a-reg li{border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:11.5px;display:grid;gap:3px;background:color-mix(in srgb,var(--bg2) 55%,transparent)}
.a-reg bdi{font-family:var(--mono);font-size:10.5px}
.s18-audit [data-tone="ok"]{color:var(--ok)}
.s18-audit [data-tone="warn"]{color:var(--warn)}
.s18-audit [data-tone="bad"]{color:var(--bad)}
.s18-audit [data-tone="info"]{color:var(--accent2)}
@media(max-width:1240px){.a-deep{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}.a-deep>section:nth-child(3){border-inline-end:0;border-block-start:1px solid var(--line);grid-column:1/-1}}
@media(max-width:1060px){
  .a-lead{display:none}
  .a-head-side{margin-inline-start:0}
  .a-chips{justify-content:start}
  .a-deep{grid-template-columns:1fr}
  .a-deep>section{border-inline-end:0;border-block-end:1px solid var(--line)}
  .a-deep>section:last-child{border-block-end:0}
  .a-form{grid-template-columns:1fr}
  .a-diff{grid-template-columns:1fr}
}
@media(max-width:760px){
  .a-cmdbar .a-sel{inline-size:100%}
  .a-cmdbar .a-sel select{flex:1 1 auto;max-inline-size:none}
  .a-lower{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){.s18-audit *{transition:none!important;animation:none!important}}
`;

/* SETTLEMENT CONTRACT — behavior is fixed by tests/post-c03/D04. Do not change states/codes. */
export async function settleAuditAnnotation(effect,project=()=>{}){
  if(typeof effect!=='function')throw Error('AUDIT_ANNOTATION_EFFECT_REQUIRED');
  project(Object.freeze({state:'PENDING',code:'AUDIT_ANNOTATION_PENDING',settled:false}));
  try{
    const result=await effect(),success=result?.ok===true,state=success?'SUCCESS':'FAILURE',code=success?(result.status||result.code||'AUDIT_ANNOTATION_RECORDED'):(result?.code||result?.status||'AUDIT_ANNOTATION_FAILED');
    const settlement=Object.freeze({state,code:String(code),settled:true,result:result||null});project(settlement);return settlement;
  }catch(error){const settlement=Object.freeze({state:'FAILURE',code:String(error?.code||error?.message||'AUDIT_ANNOTATION_REJECTED'),settled:true,error:String(error?.message||error)});project(settlement);return settlement;}
}

/* Active mount handle — command registrations delegate here so a remount never leaves stale closures. */
let ACTIVE=null;

export function mountAuditSurface({stage,registry,workspace,runtimeAdapter=null}={}){
  if(!stage||!registry)throw Error('AUDIT_PRODUCT_COMPOSITION_REQUIRED');

  /* ---------------------------------------------------------- two observed record planes
     PROVIDER_DURABLE_JSONL — AuditEventProvider via the bounded local runtime (durable, server recompute).
     SESSION_LOCAL          — W05 AuditEventDomain session ledger (fixture history, client recompute).
     Both are real hash-chained records; every row, count and verdict is labelled by its plane. */
  const session=createAuditConsumerAdapter();

  const durableRow=row=>({
    key:`d:${row.sequence}`,plane:'PROVIDER_DURABLE_JSONL',sequence:Number(row.sequence)||0,
    eventId:String(row.eventId||`audit-${row.sequence}`),occurredAt:String(row.occurredAt||row.time||''),
    actor:String(row.actor||''),action:String(row.action||''),target:String(row.target||''),
    outcome:String(row.outcome||'OBSERVED'),correlationId:row.correlationId==null?'':String(row.correlationId),
    recordHash:String(row.hash||row.recordHash||''),previousHash:String(row.previousHash||'GENESIS'),
    details:row.details&&typeof row.details==='object'?row.details:{},schema:String(row.schema||'CEP_AUDIT_EVENT_V1')
  });
  const sessionRow=row=>({
    key:`s:${row.sequence}`,plane:'SESSION_LOCAL',sequence:Number(row.sequence)||0,
    eventId:String(row.eventId||`audit-${row.sequence}`),occurredAt:String(row.occurredAt||row.time||''),
    actor:String(row.actor||''),action:String(row.action||''),target:String(row.target||''),
    outcome:String(row.outcome||'OBSERVED'),correlationId:String(row.correlationId||''),
    recordHash:String(row.recordHash||''),previousHash:String(row.previousHash||'GENESIS'),
    details:row.details&&typeof row.details==='object'?row.details:{},schema:'AUDIT_EVENT_V1'
  });
  const durableRows=()=>runtimeAdapter?runtimeAdapter.snapshot().events.map(durableRow):[];
  const sessionRows=()=>session.domain.rows().map(sessionRow);
  const allRows=()=>[...durableRows(),...sessionRows()].sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt)));

  const sessionAnnotations=()=>session.annotations().map(note=>({...note,plane:'SESSION_LOCAL'}));
  const durableAnnotations=()=>(runtimeAdapter?runtimeAdapter.snapshot().annotations:[]).map(note=>({...note,plane:'PROVIDER_DURABLE_JSONL'}));
  const allAnnotations=()=>[...durableAnnotations(),...sessionAnnotations()];
  const annotationCount=row=>allAnnotations().filter(note=>String(note.eventId)===String(row.eventId)).length;

  /* ---------------------------------------------------------- surface-local state */
  const state={
    filter:{query:'',actor:'',action:'',outcome:'',scope:'all',view:null,plane:'all'},
    selectedKey:null,tab:'raw',settlement:null,
    lastObservedAt:new Date().toISOString(),lastVerifyAt:null,annotateTouched:false
  };

  const matchesExceptScope=row=>{
    const f=state.filter;
    if(f.plane!=='all'&&row.plane!==f.plane)return false;
    if(f.view){const view=VIEWS.find(v=>v.id===f.view);if(view&&!view.match(row,annotationCount(row)))return false;}
    if(f.actor&&row.actor!==f.actor)return false;
    if(f.action&&row.action!==f.action)return false;
    if(f.outcome&&row.outcome!==f.outcome)return false;
    if(f.query){
      const hay=`${row.actor} ${row.action} ${row.target} ${row.outcome} ${row.correlationId} ${row.eventId} ${row.recordHash} ${row.previousHash} ${JSON.stringify(row.details)}`.toLowerCase();
      if(!hay.includes(f.query.toLowerCase()))return false;
    }
    return true;
  };
  const matches=row=>matchesExceptScope(row)&&(state.filter.scope==='all'||scopeOf(row)===state.filter.scope);
  const visible=()=>allRows().filter(matches);
  const selectedRow=()=>{
    const rows=visible();
    if(state.selectedKey){const hit=rows.find(row=>row.key===state.selectedKey);if(hit)return hit;}
    /* first paint mirrors the reference's selected event: a record with a multi-event trace and
       a fully populated inspector, instead of whatever row happens to sort first */
    const handoff=rows.find(row=>row.action==='CREATE_CANDIDATE_EVIDENCE_HANDOFF');
    if(handoff)return handoff;
    const grouped=rows.find(row=>row.correlationId&&allRows().filter(item=>item.correlationId===row.correlationId&&item.plane===row.plane).length>1);
    return grouped||rows[0]||allRows()[0]||null;
  };
  const annotationFormEventId=()=>{
    const input=stage.querySelector('[data-event-id]');
    return input?input.value:'';
  };

  /* trace chain — events sharing the selected row's correlation id, anchor first, then newest→oldest */
  const traceOf=row=>{
    if(!row||!row.correlationId)return[];
    const group=allRows().filter(item=>item.correlationId===row.correlationId&&item.plane===row.plane)
      .sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt)));
    if(!group.length)return[];
    const anchor=group.find(item=>item.key===row.key)||group[0];
    return [anchor,...group.filter(item=>item.key!==anchor.key)];
  };

  /* integrity — per plane, never a single unlabelled claim */
  const sessionIntegrity=()=>session.verify();
  const durableIntegrity=()=>runtimeAdapter?runtimeAdapter.snapshot().integrity:{status:'UNAVAILABLE',firstInvalidSequence:null,scope:null};
  const integrity=()=>{
    const s=sessionIntegrity(),d=durableIntegrity();
    const status=(s.status==='INVALID_CHAIN'||d.status==='INVALID_CHAIN')?'INVALID_CHAIN':
      (runtimeAdapter&&d.status!=='VALID_CHAIN')?'VALID_CHAIN_SESSION_ONLY':'VALID_CHAIN';
    return {status,firstInvalidSequence:s.firstInvalidSequence??d.firstInvalidSequence??null,
      session:s,durable:d,hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};
  };

  /* merged ledger adapter — the mounted surface's public seam (owner, search, verify, annotate, truth) */
  const adapter={
    owner:'W05AuditDomain',
    session, runtimeAdapter,
    rows:allRows, visible,
    async search(filters={}){
      const f=typeof filters==='string'?{query:filters}:filters||{};
      if(f.query!==undefined)state.filter.query=String(f.query||'');
      if(f.actor!==undefined)state.filter.actor=String(f.actor||'');
      if(f.action!==undefined)state.filter.action=String(f.action||'');
      if(f.outcome!==undefined)state.filter.outcome=String(f.outcome||'');
      let durableResult=null;
      if(runtimeAdapter){
        const push={};
        for(const key of ['actor','action','target','outcome','correlationId','from','to','limit','cursor'])
          if(f[key]!=null&&f[key]!=='')push[key]=f[key];
        durableResult=await runtimeAdapter.search(push);
      }
      state.lastObservedAt=new Date().toISOString();
      const rows=visible();
      render();
      return {ok:true,rows,events:rows,totalObserved:allRows().length,returned:rows.length,
        planes:{durable:durableRows().length,session:sessionRows().length},durable:durableResult};
    },
    async verify(){
      let durableResult=null;
      if(runtimeAdapter)durableResult=await runtimeAdapter.verify();
      const result=integrity();
      state.lastVerifyAt=new Date().toISOString();
      render();
      return {ok:true,status:result.status,session:result.session,durable:result.durable,
        firstInvalidSequence:result.firstInvalidSequence,hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false};
    },
    annotate(payload={}){
      const id=String(payload.eventId??''),note=String(payload.note??'').trim();
      if(!id||!note)return {ok:false,code:'AUDIT_EVENT_REQUIRED'};
      const own=sessionRows().find(row=>String(row.sequence)===id||row.eventId===id||row.recordHash===id);
      if(own){
        const result=session.annotate({eventId:own.eventId,note,actor:String(payload.actor||'Local product user')});
        render();
        return result;
      }
      if(runtimeAdapter){
        const owned=durableRows().find(row=>String(row.sequence)===id||row.eventId===id||row.recordHash===id);
        if(!owned)return {ok:false,code:'AUDIT_EVENT_NOT_FOUND'};
        return runtimeAdapter.annotate({eventId:owned.eventId,note,actor:String(payload.actor||'Local product user')});
      }
      return {ok:false,code:'AUDIT_EVENT_NOT_FOUND'};
    },
    refresh(){session.refresh();},
    integrity,
    checks:()=>session.checks(),
    annotations:allAnnotations,
    truth:()=>({
      owner:'W05AuditDomain',surface:'audit',realProductConsumer:true,
      eventCount:allRows().length,durableEventCount:durableRows().length,sessionEventCount:sessionRows().length,
      annotationCount:allAnnotations().length,
      persistence:runtimeAdapter?'PROVIDER_DURABLE_JSONL+SESSION_LOCAL':'SESSION_LOCAL',
      durablePersistence:runtimeAdapter?'PROVIDER_DURABLE_JSONL':'UNAVAILABLE',
      sessionPersistence:'SESSION_LOCAL',
      coverage:'PARTIAL_OBSERVED',appendOnlyApplicationContract:true,databaseImmutabilityClaim:false,
      hashChain:'SHA-256',hashIsEncryption:false,commandReceiptsAreAuditTruth:false,annotationsSeparate:true,
      planes:{durable:runtimeAdapter?runtimeAdapter.truth():{status:'UNAVAILABLE'},session:session.truth()},
      formalReviewAuthority:false,semanticCommandReceiptsAreAuditEvents:false
    })
  };

  /* provenance core — one inspection chain over both planes (shared presentation, local provider) */
  const provider={
    descriptor:()=>({providerId:'W05AuditEventProvider',domainKind:'cep-audit-events',schemaVersion:'1.0.0',authorityRef:'W05AuditDomain.events',label:'Observed AuditEvent ledger (durable provider + session domain)'}),
    read:()=>{
      const rows=allRows(),observedAt=new Date().toISOString(),error=runtimeAdapter?runtimeAdapter.snapshot().lastError:null;
      const byHash=new Map(rows.map(row=>[`${row.plane}:${row.recordHash}`,row.eventId]));
      const entries=rows.map(row=>({
        id:`${row.plane}:${row.eventId}`,
        label:`#${row.sequence} · ${row.action}`,
        kind:'AUDIT_EVENT',timestamp:row.occurredAt,actorLabel:row.actor,
        summary:`${row.outcome} · ${row.target} · ${row.plane}`,
        parentIds:row.previousHash==='GENESIS'?[]:[byHash.get(`${row.plane}:${row.previousHash}`)].filter(Boolean),
        correlationIds:row.correlationId?[row.correlationId]:[],
        provenanceRefs:row.recordHash?[row.recordHash]:[],
        attributes:{plane:row.plane,sequence:row.sequence,eventId:row.eventId,recordHash:row.recordHash,previousHash:row.previousHash,outcome:row.outcome,annotationRevisions:annotationCount(row),hashAlgorithm:'SHA-256',hashIsEncryption:false,databaseImmutabilityClaim:false}
      }));
      return {
        state:error?'ERROR':entries.length?'READY':'EMPTY',
        identity:{id:'w05-audit-observed-ledger',label:'Observed AuditEvent ledger',revision:String(rows.length),correlationIds:[],provenanceRefs:[]},
        entries,
        message:error?`AuditEventProvider unavailable: ${error.code||error.error||'ERROR'}`:entries.length?'Hash-chained AuditEvents across the durable provider and the W05 session domain. Hashing verifies integrity; it is not encryption.':'No AuditEvent observed from either plane. Zero observations is not a coverage claim.',
        observedAt,freshness:{source:'AUDIT_LEDGER_DURABLE_AND_SESSION',observedAt,stale:false},
        truth:{domainSource:'W05AuditDomain',providerSource:'AuditEventProvider',commandReceiptSource:false,databaseImmutabilityClaim:false}
      };
    }
  };
  const provenance=new AuditProvenanceInteractionCore(provider);provenance.refresh();

  /* ---------------------------------------------------------- stage skeleton (built once) */
  stage.innerHTML=`<style>${STYLE}</style>
    <section class="s18-audit" data-w05-surface="audit" data-domain-owner="W05AuditDomain">
      <header class="a-head">
        <div class="a-head-top">
          <div class="a-head-id">
            <h1 data-a-title></h1>
            <p class="a-lead" data-a-lead></p>
          </div>
          <div class="a-head-side">
            <span class="a-live"><span class="dot"></span><span data-a-live></span></span>
            <div class="a-chips" data-integrity role="status" aria-live="polite"></div>
          </div>
        </div>

        <div class="a-cmdbar">
          <label class="a-search">${icon('i-search')}<input data-a-search type="search" dir="auto" autocomplete="off" aria-label="Search AuditEvents"></label>
          <span class="a-sel"><span data-l="actor"></span><select data-a-actor aria-label="Actor filter"></select></span>
          <span class="a-sel"><span data-l="action"></span><select data-a-action aria-label="Action filter"></select></span>
          <span class="a-sel"><span data-l="outcome"></span><select data-a-outcome aria-label="Result filter"></select></span>
          <button type="button" class="btn" data-a-reset></button>
          <span class="a-gap"></span>
          <button type="button" class="btn a-btn-verify" data-foundation-command="audit.verify" data-a-verify></button>
          <button type="button" class="btn" data-foundation-command="audit.export" data-a-export></button>
          <button type="button" class="btn iconbtn" data-a-more aria-haspopup="menu"></button>
        </div>
      </header>

      <section class="a-panel" aria-label="Audit event ledger">
        <div class="a-panel-head">
          <span class="a-sub" data-a-tablesub></span>
          <span class="a-grow"></span>
          <span class="a-legend" data-a-legend></span>
        </div>
        <div data-a-table></div>
      </section>

      <div class="a-lower">
        <section class="a-panel" data-a-chainpanel aria-label="Trace chain"></section>

        <section class="a-panel" aria-label="Evidence deck">
          <div class="a-tabs" role="tablist" data-a-tabs></div>
          <div class="a-deep" data-a-deep></div>
          <div class="a-annot">
            <div class="a-annot-head"><h3 data-a-annottitle></h3><p data-a-annotlead></p></div>
            <form class="a-form" data-annotation-form>
              <input data-event-id inputmode="text" dir="ltr" autocomplete="off" aria-label="AuditEvent id">
              <input data-note dir="auto" autocomplete="off" aria-label="Audit annotation">
              <button type="submit" class="btn"></button>
            </form>
            <div data-a-settle-host></div>
          </div>
        </section>
      </div>

      <div class="a-actionbar" data-a-actionbar role="status">
        <span class="a-lock">${icon('i-lock')}<strong data-a-locktitle></strong><span class="a-sub" data-a-locksub></span></span>
        <span class="a-mutable"><span class="dot"></span><span data-a-mutable></span></span>
        <span class="a-grow"></span>
        <button type="button" class="btn a-btn-note" data-foundation-command="foundation.note" data-a-newnote-host>${icon('i-plus')}<span data-a-newnote></span></button>
      </div>
    </section>`;

  const q=selector=>stage.querySelector(selector);
  const provenanceRoot=document.createElement('section');
  const bottomNode=document.createElement('div');
  bottomNode.className='a-bottom';
  bottomNode.innerHTML=`<section><h3 data-b-raw></h3><pre data-b-rawbody></pre></section>
    <section><h3 data-b-reg></h3><ul class="a-reg" data-b-regbody></ul></section>
    <section><h3 data-b-scope></h3><div data-b-scopebody></div></section>
    <section><h3 data-b-prov></h3><div data-a-provenance></div></section>`;
  const host=new AuditProvenanceHost(bottomNode.querySelector('[data-a-provenance]'),provenance);

  /* ---------------------------------------------------------- renderers */
  const fmtTime=iso=>{const s=String(iso||'');return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)?s.slice(11,19):'—';};
  const outcomeLabel=outcome=>{const lang=locale();return label(OUTCOME_LABEL,outcome,lang)||esc(outcome);};
  const typeLabel=action=>{const lang=locale();return EVENT_TYPE[action]?EVENT_TYPE[action][lang]:esc(String(action||'').replace(/_/g,' ').toLowerCase());};

  const renderHead=()=>{
    const lang=locale(),T0=T(),row=selectedRow(),integ=integrity();
    const title=q('[data-a-title]');
    title.innerHTML=`${esc(T0.title)}<small dir="${lang==='ar'?'ltr':'rtl'}">${esc(T0.otherTitle)}</small>`;
    const lead=q('[data-a-lead]');
    lead.textContent=T0.subLead;
    lead.title=T0.lead; /* full lead stays reachable on hover — one-line subtitle keeps the tier compact */
    const live=q('[data-a-live]');
    const stamp=String(state.lastVerifyAt||state.lastObservedAt||'').slice(11,19);
    live.textContent=`${T0.live} ${stamp||'—'}`;
    const chips=q('[data-integrity]');
    const dStatus=runtimeAdapter?integ.durable.status:'UNAVAILABLE';
    const dTone=integ.durable.status==='VALID_CHAIN'?'ok':integ.durable.status==='INVALID_CHAIN'?'bad':'warn';
    chips.innerHTML=`
      <span class="a-chip" data-tone="${integ.status==='VALID_CHAIN'?'ok':integ.status==='INVALID_CHAIN'?'bad':'warn'}">${esc(T0.statusChain)}: <bdi dir="ltr">${esc(integ.status)}</bdi></span>
      <span class="a-chip" data-tone="${dTone}">PROVIDER: <bdi dir="ltr">${esc(dStatus)}</bdi></span>
      <span class="a-chip" data-tone="${integ.session.status==='VALID_CHAIN'?'ok':'bad'}">SESSION: <bdi dir="ltr">${esc(integ.session.status)}</bdi></span>`;
    void row;
  };

  const fillSelect=(element,values,current,allLabel)=>{
    const key=values.join('|')+'|'+current+'|'+allLabel;
    if(element.dataset.key===key)return;
    element.dataset.key=key;
    element.innerHTML=[`<option value="">${esc(allLabel)}</option>`,...values.map(value=>`<option value="${esc(value)}"${value===current?' selected':''}>${esc(value)}</option>`)].join('');
  };

  const renderCommandBar=()=>{
    const T0=T(),rows=allRows();
    q('[data-a-search]').placeholder=T0.searchPh;
    q('[data-a-search]').value=state.filter.query;
    stage.querySelectorAll('[data-l]').forEach(node=>{node.textContent=T0[node.dataset.l]||'';});
    fillSelect(q('[data-a-actor]'),[...new Set(rows.map(r=>r.actor))].sort(),state.filter.actor,T0.allActors);
    fillSelect(q('[data-a-action]'),[...new Set(rows.map(r=>r.action))].sort(),state.filter.action,T0.allActions);
    fillSelect(q('[data-a-outcome]'),[...new Set(rows.map(r=>r.outcome))].sort(),state.filter.outcome,T0.allOutcomes);
    q('[data-a-reset]').textContent=T0.reset;
    q('[data-a-verify]').textContent=T0.verify;
    q('[data-a-export]').textContent=T0.exportLabel;
    q('[data-a-more]').innerHTML=`${icon('i-more')}<span class="sr">${esc(T0.more)}</span>`;
    q('[data-a-more]').setAttribute('aria-label',T0.more);
  };

  const renderTable=()=>{
    const T0=T(),rows=visible(),total=allRows(),sel=selectedRow();
    q('[data-a-tablesub]').textContent=`${T0.showing} ${rows.length} ${T0.of} ${total.length}`;
    q('[data-a-legend]').innerHTML=`
      <span><span class="a-plane" data-plane="PROVIDER_DURABLE_JSONL"></span>${esc(T0.planeDurable)} · <bdi dir="ltr">${durableRows().length}</bdi></span>
      <span><span class="a-plane" data-plane="SESSION_LOCAL"></span>${esc(T0.planeSession)} · <bdi dir="ltr">${sessionRows().length}</bdi></span>`;
    const wrap=q('[data-a-table]');
    if(!rows.length){
      wrap.innerHTML=`<p class="a-empty" data-state="empty"><strong>${esc(T0.emptyTable)}</strong> · ${esc(T0.emptyTableHint)}</p>`;
      return;
    }
    /* fixed layout: every column stays visible in the default pane widths; long technical
       values ellipsize with a hover title instead of pushing columns out of the viewport. */
    const cols=[9,9,6,7,10,13,21,8,6,11];
    wrap.innerHTML=`<div class="a-tablewrap"><table class="a-table">
      <colgroup>${cols.map(w=>`<col style="width:${w}%">`).join('')}</colgroup>
      <thead><tr>
        <th scope="col">${esc(T0.colTime)}</th><th scope="col">${esc(T0.colActor)}</th><th scope="col">${esc(T0.colActorType)}</th>
        <th scope="col">${esc(T0.colResult)}</th><th scope="col">${esc(T0.colWorkspace)}</th><th scope="col">${esc(T0.colEntity)}</th>
        <th scope="col">${esc(T0.colAction)}</th><th scope="col">${esc(T0.colType)}</th><th scope="col">${esc(T0.colSource)}</th>
        <th scope="col">${esc(T0.colTrace)}</th>
      </tr></thead>
      <tbody>${rows.slice(0,80).map(row=>{
        const d=row.details||{},lang=locale(),type=ACTOR_TYPE[d.actorType];
        return `<tr data-a-row="${esc(row.key)}" tabindex="0" data-selected="${row.key===sel?.key}" aria-selected="${row.key===sel?.key}">
          <td class="mono"><span class="a-plane" data-plane="${esc(row.plane)}" title="${esc(row.plane)}"></span><bdi dir="ltr">${esc(fmtTime(row.occurredAt))}</bdi></td>
          <td dir="auto" title="${esc(row.actor)}">${esc(row.actor)}</td>
          <td>${type?esc(type[lang]||type.en):esc(d.actorType||'—')}</td>
          <td><span data-tone="${toneFor(row.outcome)}">${esc(outcomeLabel(row.outcome))}</span></td>
          <td dir="auto" title="${esc(d.workspace||'')}">${esc(d.workspace||'—')}</td>
          <td class="mono" title="${esc(row.target||'')}"><bdi dir="ltr">${esc(row.target||'—')}</bdi></td>
          <td class="mono" title="${esc(row.action)}"><bdi dir="ltr">${esc(row.action)}</bdi></td>
          <td dir="auto" title="${esc(row.action)}">${typeLabel(row.action)}</td>
          <td dir="auto" title="${esc(d.source||d.client||'')}">${esc(d.source||d.client||'—')}</td>
          <td class="mono" title="${esc(row.correlationId||'')}"><bdi dir="ltr">${esc(row.correlationId||'—')}</bdi></td>
        </tr>`;}).join('')}
      </tbody></table></div>`;
    wrap.querySelectorAll('tr[data-a-row]').forEach(node=>{
      const pick=()=>{state.selectedKey=node.dataset.aRow;render();};
      node.addEventListener('click',pick);
      node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();pick();}});
    });
  };

  const renderChain=()=>{
    const T0=T(),row=selectedRow(),links=traceOf(row),panel=q('[data-a-chainpanel]');
    const trace=row&&row.correlationId?row.correlationId:'—';
    panel.innerHTML=`<div class="a-chain-head">
        <span class="a-trace"><bdi dir="ltr">${esc(trace)}</bdi></span>
        ${icon('i-link')}
        <span class="a-chain-count"><bdi dir="ltr">${links.length}</bdi> ${esc(T0.chainCount)}</span>
        <span class="a-grow" style="flex:1 1 auto"></span>
        <button type="button" class="btn" data-a-chainfull>${esc(T0.chainFull)}</button>
      </div>
      <div data-a-chain></div>`;
    const host2=panel.querySelector('[data-a-chain]');
    if(!links.length){host2.innerHTML=`<p class="a-empty">${esc(T0.chainNone)}</p>`;}
    else{
      host2.innerHTML=`<div class="a-chain">${links.map((item,index)=>`${index?`<span class="a-arrow" aria-hidden="true">${svgIcon('<path d="M5 12h14m0 0-5-5m5 5-5 5"/>','icon')}</span>`:''}
        <article class="a-node" data-anchor="${index===0}">
          <span class="a-badge">${index+1}</span>
          <span class="a-node-time"><bdi dir="ltr">${esc(fmtTime(item.occurredAt))}</bdi></span>
          <strong class="a-node-actor" dir="auto">${esc(item.actor)}</strong>
          <span class="a-node-row"><span class="a-node-action" title="${esc(item.action)}"><bdi dir="ltr">${esc(item.action)}</bdi></span><span class="a-node-target" title="${esc(item.target||'')}"><bdi dir="ltr">${esc(item.target||'—')}</bdi></span></span>
          <span class="a-node-foot"><span data-tone="${toneFor(item.outcome)}" dir="auto">${esc(outcomeLabel(item.outcome))}</span><span class="a-node-src" dir="auto">${esc((item.details||{}).source||(item.details||{}).client||item.plane)}</span></span>
        </article>`).join('')}</div>`;
    }
    panel.querySelector('[data-a-chainfull]')?.addEventListener('click',()=>{
      if(row&&row.correlationId){state.filter.query=row.correlationId;state.filter.scope='all';state.filter.view=null;render();
        workspace.status?.(`Trace ${row.correlationId} · ${links.length} events`,'info');}
    });
  };

  const jsonLines=value=>{
    const raw=JSON.stringify(value,null,2);
    return raw.split('\n').map(line=>{
      let out='',rest=line,re=/("(?:[^"\\]|\\.)*")(\s*:)?|-?\b\d+(?:\.\d+)?\b|\b(?:true|false|null)\b/g,last=0,m;
      while((m=re.exec(rest))){
        out+=esc(rest.slice(last,m.index));
        if(m[1]!==undefined&&m[2]!==undefined)out+=`<span class="j-k">${esc(m[1])}</span>${esc(m[2])}`;
        else if(m[1]!==undefined)out+=`<span class="j-s">${esc(m[1])}</span>`;
        else if(/^"/.test(m[0]))out+=`<span class="j-n">${esc(m[0])}</span>`;
        else out+=`<span class="j-b">${esc(m[0])}</span>`;
        last=re.lastIndex;
      }
      out+=esc(rest.slice(last));
      return `<span class="ln">${out||' '}</span>`;
    }).join('');
  };

  const verificationEntries=()=>{
    const T0=T(),entries=[],row=selectedRow(),now=new Date().toISOString();
    if(runtimeAdapter){
      const d=durableIntegrity(),ok=d.status==='VALID_CHAIN',bad=d.status==='INVALID_CHAIN';
      entries.push({t:String(state.lastVerifyAt||now).slice(11,23),m:`provider verify · ${d.status} · scope ${d.scope?.count??0} · ${T0.hashNote}`,state:ok?'ok':bad?'bad':'warn'});
      entries.push({t:'—',m:`recompute owner: AuditEventProvider (server-side) · firstInvalid=${d.firstInvalidSequence??'none'}`,state:ok?'ok':'warn'});
    }else{
      entries.push({t:'—',m:'provider unavailable · durable plane not observed in this session',state:'warn'});
    }
    const checks=session.checks()||[];
    const relevant=row?checks.filter(c=>c.eventId===row.eventId):checks;
    const sample=(relevant.length?relevant:checks).slice(-6).reverse();
    for(const c of sample){
      entries.push({t:String(c.occurredAt||'').slice(11,23)||'—',m:`#${c.sequence} ${c.action} · hash=${c.hashOk?'OK':'FAIL'} link=${c.linkOk?'OK':'FAIL'} seq=${c.sequenceOk?'OK':'FAIL'}`,state:c.ok?'ok':'bad'});
    }
    if(row)entries.push({t:fmtTime(row.occurredAt),m:`recordHash ${String(row.recordHash||'').slice(0,24)}… · plane ${row.plane}`,state:row.recordHash?'ok':'warn'});
    return entries;
  };

  const renderDeep=()=>{
    const T0=T(),row=selectedRow(),lang=locale();
    const tabs=[
      {id:'raw',label:T0.tabRaw},{id:'key',label:T0.tabKey},{id:'trace',label:T0.tabTrace,n:traceOf(row).length||''},
      {id:'diff',label:T0.tabDiff},{id:'log',label:T0.tabLog}
    ];
    const tabsHost=q('[data-a-tabs]');
    tabsHost.innerHTML=tabs.map(tab=>`<button type="button" class="a-tab" role="tab" id="a-tab-${tab.id}" aria-selected="${state.tab===tab.id}" aria-controls="a-deep-panel" data-a-tab="${tab.id}">${esc(tab.label)}${tab.n!==undefined&&tab.n!==''?` <span class="a-tab-n">${esc(String(tab.n))}</span>`:''}</button>`).join('');
    tabsHost.querySelectorAll('[data-a-tab]').forEach(btn=>btn.addEventListener('click',()=>{state.tab=btn.dataset.aTab;renderDeep();}));

    const deep=q('[data-a-deep]');
    const rowJson=row?{plane:row.plane,schema:row.schema,sequence:row.sequence,eventId:row.eventId,occurredAt:row.occurredAt,
      actor:row.actor,action:row.action,target:row.target,outcome:row.outcome,correlationId:row.correlationId,
      previousHash:row.previousHash,recordHash:row.recordHash,details:row.details}:{state:'NO_EVENT'};

    const kvRows=[
      ['schema',row?.schema||'—',true],['plane',row?.plane||'—',true],['eventId',row?.eventId||'—',true],
      ['occurredAt',row?.occurredAt||'—',true],['sequence',row?String(row.sequence):'—',true],
      ['actor',row?.actor||'—',false],['account',(row?.details||{}).account||'—',true],
      ['role',((row?.details||{}).role||{})[lang]||((row?.details||{}).role||{}).en||'—',false],
      ['group',((row?.details||{}).group||{})[lang]||((row?.details||{}).group||{}).en||'—',false],
      ['client',(row?.details||{}).client||'—',true],['node',(row?.details||{}).node||(row?.details||{}).ip||'—',true],
      ['environment',(row?.details||{}).environment||'—',true],['region',(row?.details||{}).region||'—',true],
      ['workspace',(row?.details||{}).workspace||'—',false],
      ['correlationId',row?.correlationId||'—',true],
      ['previousHash',row?String(row.previousHash).slice(0,28)+(String(row.previousHash).length>28?'…':''):'—',true],
      ['recordHash',row?String(row.recordHash).slice(0,28)+(String(row.recordHash).length>28?'…':''):'—',true],
      ['hashAlgorithm','SHA-256 · verification not encryption',true],
      ['annotations',row?String(annotationCount(row)):'0',true],
      ['persistence',row?.plane||'—',true]
    ];
    const keyPanel=`<h3>${esc(T0.keyTitle)} <span class="a-sub">data key</span></h3><dl class="a-kv">${kvRows.map(([k,v,mono])=>`<div class="a-kv-row"><dt>${esc(k)}</dt><dd>${mono?`<bdi dir="ltr">${esc(String(v))}</bdi>`:`<span dir="auto">${esc(String(v))}</span>`}</dd></div>`).join('')}</dl>`;
    const logPanel=`<h3>${esc(T0.logTitle)} <span class="a-sub">verification</span></h3>`+(state.lastVerifyAt||session.checks()?.length?
      `<ul class="a-log">${verificationEntries().map(e=>`<li data-state="${e.state}"><span class="a-log-t"><bdi dir="ltr">${esc(e.t)}</bdi></span><span class="a-log-m"><bdi dir="ltr">${esc(e.m)}</bdi></span><span class="a-log-s">${icon(e.state==='ok'?'i-check':e.state==='bad'?'i-warn':'i-info')}</span></li>`).join('')}</ul>`
      :`<p class="a-empty">${esc(T0.logNone)}</p>`);
    const rawPanel=`<h3>${esc(T0.rawTitle)} <span class="a-sub">canonical record</span></h3><pre class="a-json">${jsonLines(rowJson)}</pre>`;
    const trace=traceOf(row);
    const tracePanel=`<h3>${esc(T0.tabTrace)} <span class="a-sub">${trace.length} ${esc(T0.eventSingular)}</span></h3>`+(trace.length?
      `<ul class="a-log">${trace.map((item,index)=>`<li data-state="${item.recordHash?'ok':'warn'}"><span class="a-log-t">#${index+1}</span><span class="a-log-m"><bdi dir="ltr">${esc(fmtTime(item.occurredAt))} · ${esc(item.actor)} · ${esc(item.action)}</bdi></span><span class="a-log-s">${icon('i-link')}</span></li>`).join('')}</ul>`
      :`<p class="a-empty">${esc(T0.chainNone)}</p>`);
    const before=(row?.details||{}).before,after=(row?.details||{}).after;
    const diffPanel=`<h3>${esc(T0.diffTitle)} <span class="a-sub">before / after</span></h3>`+(before!==undefined||after!==undefined?
      `<div class="a-diff"><div><h4>${lang==='ar'?'قبل':'Before'}</h4><pre class="a-before">${esc(before===undefined?'—':typeof before==='string'?before:JSON.stringify(before,null,2))}</pre></div><div><h4>${lang==='ar'?'بعد':'After'}</h4><pre class="a-after">${esc(after===undefined?'—':typeof after==='string'?after:JSON.stringify(after,null,2))}</pre></div></div>`
      :`<p class="a-empty">${esc(T0.diffNone)}</p>`);

    const order=state.tab==='raw'?['raw','key','log']:[state.tab,'raw','log'];
    const panels={raw:rawPanel,key:keyPanel,log:logPanel,trace:tracePanel,diff:diffPanel};
    deep.innerHTML=order.map(id=>`<section id="a-deep-panel" role="tabpanel" aria-labelledby="a-tab-${state.tab}">${panels[id]}</section>`).join('');
  };

  const renderSettle=()=>{
    const T0=T(),host2=q('[data-a-settle-host]'),settlement=state.settlement;
    if(!settlement){host2.innerHTML='';return;}
    const failed=settlement.state==='FAILURE',pending=settlement.state==='PENDING';
    host2.innerHTML=`<div class="a-settle" data-state="${esc(settlement.state)}" role="status" aria-live="polite">
      <strong data-tone="${failed?'bad':pending?'warn':'ok'}">${esc(pending?T0.annotPending:failed?T0.annotFail:T0.annotOk)} · ${esc(settlement.state)}</strong>
      <bdi dir="ltr">${esc(settlement.code)}</bdi>
      ${settlement.error?`<span>${esc(settlement.error)}</span>`:''}
      ${settlement.result?.reason?`<span>${esc(settlement.result.reason)}</span>`:''}
    </div>`;
  };

  const renderAnnotHead=()=>{
    const T0=T();
    q('[data-a-annottitle]').textContent=T0.annotTitle;
    q('[data-a-annotlead]').textContent=T0.annotLead;
    const form=stage.querySelector('[data-annotation-form]');
    const eventInput=form.querySelector('[data-event-id]'),noteInput=form.querySelector('[data-note]'),submit=form.querySelector('button[type=submit]');
    eventInput.placeholder=T0.annotEvent;noteInput.placeholder=T0.annotNote;submit.textContent=T0.annotSubmit;
    const row=selectedRow();
    if(row&&!state.annotateTouched&&document.activeElement!==eventInput)eventInput.value=row.eventId;
    if(document.activeElement!==noteInput&&state.settlement?.state==='SUCCESS'&&state.clearNote){noteInput.value='';state.clearNote=false;}
  };

  /* ---------------------------------------------------------- BOTTOM ACTION / STATUS BAR (AUD-V2) */
  const renderActionBar=()=>{
    const T0=T(),notes=allAnnotations().length;
    const bar=q('[data-a-actionbar]');
    if(!bar)return;
    bar.setAttribute('aria-label',T0.actionBarLabel);
    bar.title=T0.lockFull;
    q('[data-a-locktitle]').textContent=T0.lockTitle;
    q('[data-a-locksub]').textContent=T0.lockSub;
    q('[data-a-locksub]').title=T0.lockFull;
    q('[data-a-mutable]').textContent=`${T0.mutableTitle} · ${notes}`;
    q('[data-a-newnote]').textContent=T0.newNote;
    q('[data-a-newnote-host]').setAttribute('aria-label',T0.newNote);
  };

  /* ---------------------------------------------------------- LEFT — audit record desk */
  const renderLeft=()=>{
    const T0=T(),rows=allRows(),lang=locale();
    const base=rows.filter(row=>state.filter.plane==='all'||row.plane===state.filter.plane);
    const scopeCount=scope=>scope.id==='all'?base.length:base.filter(row=>scope.actions?.includes(row.action)).length;
    const node=document.createElement('div');
    node.className='a-desk';
    node.innerHTML=`
      <section>
        <h3>${esc(T0.leftScopes)}</h3>
        <ul class="a-scope">${SCOPES.map(scope=>`<li><button type="button" data-a-scope="${scope.id}" aria-pressed="${state.filter.scope===scope.id}">${icon(scope.icon)}<span dir="auto">${esc(lang==='ar'?scope.ar:scope.en)}</span><span class="a-count">${scopeCount(scope)}</span></button></li>`).join('')}</ul>
      </section>
      <section>
        <h3>${esc(T0.leftViews)}</h3>
        <ul class="a-views">${VIEWS.map(view=>`<li><button type="button" data-a-view="${view.id}" aria-pressed="${state.filter.view===view.id}">${view.id==='denied'?icon('i-warn'):view.id==='exports'?svgIcon(ICONS.upload):view.id==='recent'?svgIcon(ICONS.clock):icon('i-note')}<span dir="auto">${esc(lang==='ar'?view.ar:view.en)}</span><span class="a-vhint">${base.filter(row=>view.match(row,annotationCount(row))).length}</span></button></li>`).join('')}</ul>
      </section>
      <section>
        <h3>${esc(T0.leftSource)}</h3>
        <ul class="a-planes">
          <li><button type="button" data-a-plane="all" aria-pressed="${state.filter.plane==='all'}"><span class="a-plane" data-plane="SESSION_LOCAL" style="background:var(--text3)"></span><span>${esc(T0.planeAll)}</span><span class="a-count">${rows.length}</span></button></li>
          <li><button type="button" data-a-plane="PROVIDER_DURABLE_JSONL" aria-pressed="${state.filter.plane==='PROVIDER_DURABLE_JSONL'}"><span class="a-plane" data-plane="PROVIDER_DURABLE_JSONL"></span><span>${esc(T0.planeDurable)}</span><span class="a-count">${durableRows().length}</span></button></li>
          <li><button type="button" data-a-plane="SESSION_LOCAL" aria-pressed="${state.filter.plane==='SESSION_LOCAL'}"><span class="a-plane" data-plane="SESSION_LOCAL"></span><span>${esc(T0.planeSession)}</span><span class="a-count">${sessionRows().length}</span></button></li>
        </ul>
      </section>
      <p class="a-desk-note">${esc(T0.coverage)}: <bdi dir="ltr">PARTIAL_OBSERVED</bdi> · ${esc(T0.hashNote)} · <bdi dir="ltr">${esc(T0.leftTitle)}</bdi></p>`;
    const host2=workspace.region('LEFT',{node,label:T0.leftTitle});
    host2?.querySelectorAll?.('[data-a-scope]').forEach(btn=>btn.addEventListener('click',()=>{
      state.filter.scope=btn.dataset.aScope;
      registry.execute('audit.search',{filters:{...state.filter},route:'audit.scope-filter'});
      render();
    }));
    host2?.querySelectorAll?.('[data-a-view]').forEach(btn=>btn.addEventListener('click',()=>{
      state.filter.view=state.filter.view===btn.dataset.aView?null:btn.dataset.aView;render();
    }));
    host2?.querySelectorAll?.('[data-a-plane]').forEach(btn=>btn.addEventListener('click',()=>{
      state.filter.plane=btn.dataset.aPlane;
      registry.execute('audit.search',{filters:{action:state.filter.action},route:'audit.plane-filter'});
      render();
    }));
  };

  /* ---------------------------------------------------------- RIGHT — selected event inspector */
  const renderRight=()=>{
    const T0=T(),lang=locale(),row=selectedRow(),node=document.createElement('aside');
    node.className='a-ctx';
    const detail=row?row.details||{}:{};
    const role=detail.role?.[lang]||detail.role?.en||'—',group=detail.group?.[lang]||detail.group?.en||'—';
    const type=ACTOR_TYPE[detail.actorType];
    const notice=detail.notice?.[lang]||detail.notice?.en||null;
    const integ=integrity();
    const notes=row?allAnnotations().filter(note=>String(note.eventId)===String(row.eventId)):[];
    const refs=row?[
      {label:T0.chainTitle,value:row.correlationId||'—',ok:Boolean(row.correlationId)},
      ...((detail.related||[]).map(item=>({label:T0.related,value:item,ok:true}))),
      {label:T0.annotations,value:String(notes.length),ok:notes.length>0},
      {label:T0.statusChain,value:row.plane==='SESSION_LOCAL'?integ.session.status:integ.durable.status,ok:true}
    ]:[];
    const warnTone=row&&(/DENIED|PARTIAL|FAILURE/.test(row.outcome)||notice);
    node.innerHTML=`
      ${row?`
      <section class="a-ctx-block">
        <h3>${esc(T0.rActor)}</h3>
        <div class="a-actor">
          <span class="a-avatar" aria-hidden="true">${esc(String(row.actor||'?').trim().charAt(0).toUpperCase())}</span>
          <div style="min-width:0">
            <div class="a-actor-name"><strong dir="auto">${esc(row.actor)}</strong>${type?`<span class="a-badge">${esc(type[lang]||type.en)}</span>`:''}</div>
            <span class="a-actor-mail"><bdi dir="ltr">${esc(detail.account||'—')}</bdi></span>
            <div style="font-size:11.5px;color:var(--text2)">${esc(T0.rRole)}: <span dir="auto">${esc(role)}</span> · ${esc(T0.rGroup)}: <span dir="auto">${esc(group)}</span></div>
          </div>
        </div>
      </section>
      <section class="a-ctx-block">
        <h3>${esc(T0.rContext)}</h3>
        <dl class="a-kv">
          ${[[T0.rIp,detail.ip,true],[T0.rSession,detail.session,true],[T0.rClient,detail.client,true],[T0.rNode,detail.node||detail.source,true],[T0.rLocalTime,row.occurredAt,true],[T0.rTimezone,detail.timezone,true]].map(([k,v,mono])=>`<div class="a-kv-row"><dt>${esc(k)}</dt><dd>${v==null||v===''?'—':mono?`<bdi dir="ltr">${esc(String(v))}</bdi>`:`<span dir="auto">${esc(String(v))}</span>`}</dd></div>`).join('')}
        </dl>
      </section>
      <section class="a-ctx-block">
        <h3>${esc(T0.rAction)}</h3>
        <dl class="a-kv">
          <div class="a-kv-row"><dt>${esc(T0.rActionF)}</dt><dd><bdi dir="ltr">${esc(row.action)}</bdi></dd></div>
          <div class="a-kv-row"><dt>${esc(T0.rResult)}</dt><dd><span data-tone="${toneFor(row.outcome)}">${esc(outcomeLabel(row.outcome))}</span></dd></div>
          <div class="a-kv-row"><dt>${esc(T0.rTarget)}</dt><dd><bdi dir="ltr">${esc(row.target||'—')}</bdi></dd></div>
          <div class="a-kv-row"><dt>${esc(T0.rEntity)}</dt><dd><bdi dir="ltr">${esc(row.eventId)}</bdi></dd></div>
          <div class="a-kv-row"><dt>${esc(T0.rWorkspace)}</dt><dd><span dir="auto">${esc(detail.workspace||'—')}</span></dd></div>
          <div class="a-kv-row"><dt>${esc(T0.rSeq)}</dt><dd><bdi dir="ltr">#${esc(String(row.sequence))}</bdi></dd></div>
        </dl>
      </section>
      <section class="a-ctx-block">
        <h3>${esc(T0.rDesc)}</h3>
        <p style="margin:0;font-size:12px;line-height:1.6;color:var(--text2)" dir="auto">${notice?esc(notice):`${esc(row.actor)} → <bdi dir="ltr">${esc(row.action)}</bdi> → <bdi dir="ltr">${esc(row.target||'—')}</bdi>`}</p>
      </section>
      <section class="a-ctx-block">
        <h3>${esc(T0.rDiff)}</h3>
        <dl class="a-kv">
          <div class="a-kv-row"><dt>${lang==='ar'?'قبل':'Before'}</dt><dd>${detail.before!==undefined?`<bdi dir="ltr">${esc(typeof detail.before==='string'?detail.before:JSON.stringify(detail.before))}</bdi>`:`<span style="color:var(--text3)">${lang==='ar'?'لا وجود (إنشاء جديد)':'Not present (new creation)'}</span>`}</dd></div>
          <div class="a-kv-row"><dt>${lang==='ar'?'بعد':'After'}</dt><dd>${detail.after!==undefined?`<bdi dir="ltr">${esc(typeof detail.after==='string'?detail.after:JSON.stringify(detail.after))}</bdi>`:`<bdi dir="ltr">${esc(row.target||'—')}</bdi>`}</dd></div>
        </dl>
      </section>
      <section class="a-ctx-block">
        <h3>${esc(T0.rRefs)}</h3>
        <ul class="a-refs">${refs.map(ref=>`<li><span style="min-width:0"><span style="color:var(--text3)">${esc(ref.label)}: </span><bdi dir="ltr">${esc(ref.value)}</bdi></span><span class="${ref.ok?'ok':''}">${icon(ref.ok?'i-check':'i-info')}</span></li>`).join('')}</ul>
      </section>
      ${warnTone?`<section class="a-ctx-block"><div class="a-notice"><strong>${icon('i-warn')} ${esc(T0.rWarn)}</strong><span dir="auto">${esc(notice||(lang==='ar'?'نتيجة غير كاملة أو مرفوضة — راجع نطاق التحقق قبل الاعتماد.':'Non-success outcome — check the verification scope before relying on this record.'))}</span><span style="font-size:11px;color:var(--text3)">${lang==='ar'?'الأوقات المعتمدة: 08:00 – 18:00':'Approved window: 08:00 – 18:00'}</span><button type="button" class="btn" data-foundation-command="audit.verify">${esc(T0.rVerifyNow)}</button></div></section>`:''}
      <section class="a-ctx-block">
        <h3>${esc(T0.rPolicy)}</h3>
        <div class="a-truth">
          <span><bdi dir="ltr">AuditEvent ≠ SemanticCommandBus receipt</bdi></span>
          <span><bdi dir="ltr">hashIsEncryption = false</bdi> · <bdi dir="ltr">SHA-256</bdi> ${esc(lang==='ar'?'للتحقق لا للتخزين':'for verification, not encryption')}</span>
          <span><bdi dir="ltr">databaseImmutabilityClaim = false</bdi></span>
          <span><bdi dir="ltr">annotationsSeparate = true</bdi> · ${allAnnotations().length} ${esc(T0.annotations)}</span>
          <span>${esc(T0.persistence)}: <bdi dir="ltr">${esc(row.plane)}</bdi></span>
          <span>${esc(T0.coverage)}: <bdi dir="ltr">PARTIAL_OBSERVED</bdi></span>
        </div>
      </section>`:`<section class="a-ctx-block"><p class="a-empty" style="margin:0">${esc(T0.rNone)}</p></section>`}`;
    workspace.region('RIGHT',{node,label:T0.rightTitle});
  };

  /* ---------------------------------------------------------- BOTTOM — deep ledger */
  const renderBottom=()=>{
    const T0=T(),row=selectedRow(),integ=integrity(),notes=allAnnotations();
    bottomNode.querySelector('[data-b-raw]').textContent=T0.bottomRaw;
    bottomNode.querySelector('[data-b-rawbody]').textContent=JSON.stringify(row||{state:'NO_EVENT'},null,2);
    bottomNode.querySelector('[data-b-reg]').textContent=`${T0.bottomReg} (${notes.length})`;
    bottomNode.querySelector('[data-b-regbody]').innerHTML=notes.length?notes.slice(0,20).map(note=>`<li><span><bdi dir="ltr">${esc(note.eventId)}</bdi> · rev <bdi dir="ltr">${esc(String(note.revision))}</bdi> · ${esc(note.plane)}</span><span dir="auto">${esc(note.note)}</span></li>`).join(''):`<li><span style="color:var(--text3)">${esc(T0.annotNone)}</span></li>`;
    bottomNode.querySelector('[data-b-scope]').textContent=T0.bottomScope;
    bottomNode.querySelector('[data-b-scopebody]').innerHTML=`<dl class="a-kv">
      <div class="a-kv-row"><dt>${esc(T0.statusChain)}</dt><dd><bdi dir="ltr">${esc(integ.status)}</bdi></dd></div>
      <div class="a-kv-row"><dt>PROVIDER</dt><dd><bdi dir="ltr">${esc(runtimeAdapter?integ.durable.status:'UNAVAILABLE')} · firstInvalid ${esc(String(integ.durable.firstInvalidSequence??'none'))}</bdi></dd></div>
      <div class="a-kv-row"><dt>SESSION</dt><dd><bdi dir="ltr">${esc(integ.session.status)} · firstInvalid ${esc(String(integ.session.firstInvalidSequence??'none'))}</bdi></dd></div>
      <div class="a-kv-row"><dt>${esc(T0.watermark)}</dt><dd><bdi dir="ltr">${esc(String(integ.durable.scope?.watermarkHash||integ.durable.scope?.watermark||integ.session.scope?.watermark||'GENESIS').slice(0,32))}</bdi></dd></div>
      <div class="a-kv-row"><dt>${esc(T0.persistence)}</dt><dd><bdi dir="ltr">${esc(adapter.truth().persistence)}</bdi></dd></div>
      <div class="a-kv-row"><dt>${esc(T0.hashNote)}</dt><dd><bdi dir="ltr">hashIsEncryption=false · databaseImmutabilityClaim=false</bdi></dd></div>
    </dl>`;
    bottomNode.querySelector('[data-b-prov]').textContent=T0.provTitle;
    workspace.region('BOTTOM',{node:bottomNode,label:T0.bottomRaw,summary:`${T0.bottomReg} · ${T0.bottomScope} · AuditEvent receipts are not AuditEvents.`});
    host.render();
  };

  /* ---------------------------------------------------------- full render */
  function render(){
    try{adapter.refresh();}catch{/* provenance refresh is best-effort */}
    renderHead();renderCommandBar();renderTable();renderChain();renderDeep();renderSettle();renderAnnotHead();renderActionBar();
    renderLeft();renderRight();renderBottom();
    return adapter.truth();
  }
  ACTIVE={adapter,render,state};

  /* ---------------------------------------------------------- events (bound once) */
  const searchInput=q('[data-a-search]');
  searchInput.addEventListener('input',()=>{state.filter.query=searchInput.value;renderTable();renderLeft();});
  searchInput.addEventListener('change',()=>{registry.execute('audit.search',{filters:{query:state.filter.query},route:'audit.search-input'});});
  [['[data-a-actor]','actor'],['[data-a-action]','action'],['[data-a-outcome]','outcome']].forEach(([sel,key])=>
    q(sel)?.addEventListener('change',event=>{state.filter[key]=event.target.value;
      registry.execute('audit.search',{filters:{[key]:state.filter[key]},route:`audit.filter-${key}`});}));
  q('[data-a-reset]').addEventListener('click',()=>{
    state.filter={query:'',actor:'',action:'',outcome:'',scope:'all',view:null,plane:'all'};
    registry.execute('audit.search',{filters:{},route:'audit.reset'});render();
  });
  q('[data-a-more]').addEventListener('click',event=>{
    const rect=event.currentTarget.getBoundingClientRect();
    workspace.menu?.([...AUDIT_COMMANDS,'foundation.settings'],rect.left,rect.bottom+4);
  });
  stage.querySelector('[data-annotation-form]').addEventListener('submit',async event=>{
    event.preventDefault();
    const form=event.currentTarget,eventId=form.querySelector('[data-event-id]').value,noteField=form.querySelector('[data-note]'),note=noteField.value,buttonEl=form.querySelector('button[type=submit]');
    buttonEl.disabled=true;
    const result=await settleAuditAnnotation(()=>registry.execute('audit.annotate',{eventId,note,route:'audit.annotation-form'}),state2=>{state.settlement=state2;renderSettle();});
    state.settlement=result;state.clearNote=result.state==='SUCCESS';
    buttonEl.disabled=false;
    if(result.state==='SUCCESS')noteField.value='';
    render();
  });
  stage.querySelector('[data-event-id]').addEventListener('input',()=>{state.annotateTouched=true;});

  /* language/direction follow the active preference (Settings) — never baked here */
  const langObserver=new MutationObserver(()=>render());
  langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});

  stage.dataset.surfaceComposition='audit-trace-workbench';

  /* ---------------------------------------------------------- commands (registered once, delegated to ACTIVE) */
  const register=(id,labelText,run,available=()=>true)=>{
    if(registry.commands?.has?.(id))return;
    registry.register(id,'W05AuditDomain',labelText,payload=>ACTIVE?run(payload):{ok:false,code:'AUDIT_SURFACE_NOT_MOUNTED'},available);
  };
  register('audit.search','Search AuditEvents / بحث الأحداث',payload=>ACTIVE.adapter.search(payload?.filters||payload?.query||{}));
  register('audit.verify','Verify AuditEvent hash chain / فحص سلسلة التجزئة',()=>ACTIVE.adapter.verify());
  register('audit.annotate','Annotate AuditEvent / تعليق منفصل',payload=>ACTIVE.adapter.annotate(payload||{}),
    payload=>payload?.eventId&&String(payload?.note||'').trim()?true:'AuditEvent sequence and annotation text required');
  register('audit.export','Export audit record / تصدير السجل',payload=>exportRecord(payload||{}));

  function exportRecord(payload){
    try{
      const rows=visible(),integ=integrity(),truth=adapter.truth();
      const doc={schema:'CEP_AUDIT_EXPORT_V1',exportedAt:new Date().toISOString(),surface:'audit',
        filters:{...state.filter},planes:{durable:durableRows().length,session:sessionRows().length},
        integrity:{status:integ.status,durable:integ.durable,session:integ.session,hashAlgorithm:'SHA-256',encryptionClaim:false,databaseImmutabilityClaim:false},
        truth,records:rows};
      const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),anchor=document.createElement('a');
      anchor.href=url;anchor.download=`cep-audit-export-${Date.now()}.json`;
      document.body.append(anchor);anchor.click();anchor.remove();
      setTimeout(()=>URL.revokeObjectURL(url),4000);
      workspace.status?.(`Audit export · ${rows.length} records · plane ${truth.persistence}`,'info');
      return {ok:true,code:'AUDIT_EXPORT_READY',records:rows.length,persistence:truth.persistence};
    }catch(error){
      const receipt={ok:false,code:'AUDIT_EXPORT_UNAVAILABLE',reason:String(error?.message||error)};
      workspace.status?.(`Audit export unavailable · ${receipt.reason}`,'error');
      return receipt;
    }
  }

  /* ---------------------------------------------------------- mount */
  workspace.toolbar([...AUDIT_COMMANDS,'foundation.settings']);
  render();
  const boot=Promise.allSettled([
    runtimeAdapter?runtimeAdapter.search({limit:200}):Promise.resolve(),
    runtimeAdapter?runtimeAdapter.verify():Promise.resolve()
  ]).then(()=>{state.lastObservedAt=new Date().toISOString();render();});
  return Object.freeze({owner:'AuditTraceWorkbench',adapter,host,render,realProductConsumer:true,boot,
    slots:{CENTER:'AuditTraceWorkbench',BOTTOM:'shared-bottom-shell/domain-projection'}});
}
