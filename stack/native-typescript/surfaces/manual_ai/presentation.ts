/* MANUAL AI BRIDGE — SURFACE-SPECIFIC PRESENTATION (W05-MANUAL-AI)
 *
 * What this workspace is for: a governed, human-in-the-loop bridge to external AI. A reviewer
 * prepares an explicit packet from a declared source revision, carries it out of CEP by hand,
 * imports the result back, proves provenance equality, and only then decides. CEP never calls a
 * provider and never publishes canonically. The composition therefore puts *human authority over
 * AI output* at the centre: every stage of the exchange, every provenance check and every
 * disposition is visible, labelled and inspectable.
 *
 * Architecture: SHARED MECHANICS (SemanticCommandBus, WorkspaceFoundation regions/toolbar,
 * BottomDeepWorkOwner) + SURFACE-SPECIFIC COMPOSITION (composition.ts) + SURFACE-SPECIFIC
 * PRESENTATION (this file + workbench.ts + runtime.ts). The shared W05 mount renders a generic
 * typed-collection stage; the governor in runtime.ts re-asserts this composition whenever shared
 * code rewrites a host, so the surface never degrades into the generic workbench.
 *
 * Reference: cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/
 * CEP_SYSTEM_AI_BRIDGE_REFERENCE.png (OWNER_CONFIRMED_FINAL_REFERENCE, 1525x1031, ae1d8df7…).
 * Authority is composition/IA/hierarchy/rhythm — not a pixel copy, and never a language default.
 */
import type {ManualProposal} from '../../adapters/manual_ai/domain-adapter.js';

export type ManualAiLocale='ar'|'en';
export type Tone='ok'|'warn'|'bad'|'info'|'muted'|'violet';

export const RECORD_BASIS='W05_SURFACE_REPRESENTATIVE_RECORD · records model the Owner-confirmed AI-Bridge reference structure; no external AI exchange was performed by CEP and no value here is a live provider result.';

export const esc=(value:any):string=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] as string));
/** Technical tokens are always isolated and forced LTR so digests/IDs stay readable both ways. */
export const B=(value:any):string=>`<bdi dir="ltr">${esc(value)}</bdi>`;
export const localeNow=():ManualAiLocale=>(typeof document!=='undefined'&&document.documentElement.lang==='ar')?'ar':'en';
export const L=(value:any,locale:ManualAiLocale):string=>!value?'':String(value[locale]??value.en??value.ar??'');
export const dirNow=():'rtl'|'ltr'=>((typeof document!=='undefined'&&document.documentElement.dir==='rtl')?'rtl':'ltr');

/* ── state model ─────────────────────────────────────────────────────────────────────────── */
export const STATE_META:Record<string,{ar:string;en:string;tone:Tone}>={
  PREPARED:{ar:'معدّ · بانتظار التصدير',en:'Prepared · awaiting export',tone:'info'},
  EXPORTED:{ar:'مُصدَّر · بانتظار استجابة خارجية',en:'Exported · awaiting external response',tone:'warn'},
  IMPORTED:{ar:'استُلمت الاستجابة · بانتظار القرار',en:'Response received · awaiting reviewer',tone:'violet'},
  DEFERRED:{ar:'مؤجَّل من المراجع',en:'Deferred by the reviewer',tone:'warn'},
  PROVENANCE_INVALID:{ar:'مسجون · تساوية المصدر مخالفة',en:'Quarantined · provenance mismatch',tone:'bad'},
  REJECTED:{ar:'مرفوض بقرار بشري',en:'Rejected by human decision',tone:'bad'},
  ACCEPTED_AS_DRAFT:{ar:'مقبول كمسودة عمل فقط',en:'Accepted as a working draft only',tone:'ok'}
};
export const stateTone=(state:string):Tone=>(STATE_META[state]?.tone)||'muted';

/** Facet groups for the record list — one real count per group, computed from live rows. */
export const FACETS:readonly{state:string;ar:string;en:string;states:readonly string[]}[]=Object.freeze([
  {state:'ALL',ar:'كل السجلات',en:'All records',states:Object.keys(STATE_META)},
  {state:'PREPARED',ar:'مفتوح · مُعدّ',en:'Open · prepared',states:['PREPARED']},
  {state:'EXPORTED',ar:'بانتظار الذكاء الخارجي',en:'Awaiting external AI',states:['EXPORTED']},
  {state:'IMPORTED',ar:'استجابة مستلمة',en:'Response received',states:['IMPORTED']},
  {state:'DEFERRED',ar:'مؤجَّل للمراجعة',en:'Deferred for review',states:['DEFERRED']},
  {state:'PROVENANCE_INVALID',ar:'فاشل / يحتاج انتباه',en:'Failed / needs attention',states:['PROVENANCE_INVALID']},
  {state:'ACCEPTED_AS_DRAFT',ar:'مقبول كمسودة',en:'Accepted as draft',states:['ACCEPTED_AS_DRAFT']},
  {state:'REJECTED',ar:'مرفوض',en:'Rejected',states:['REJECTED']}
]);

/** The linear exchange the reference draws — derived from domain truth, never invented. */
export const STEPS:readonly{ar:string;en:string}[]=Object.freeze([
  {ar:'مسودة الطلب',en:'DRAFT'},
  {ar:'تجهيز الحمولة',en:'CLEARED'},
  {ar:'تصدير خارج CEP',en:'EXPORTED'},
  {ar:'انتظار الاستجابة',en:'AWAITING_RESPONSE'},
  {ar:'استيراد الاستجابة',en:'RESPONSE_IMPORTED'},
  {ar:'تسوية المصدر',en:'PROVENANCE_EQUALITY'},
  {ar:'قرار بشري',en:'HUMAN_DISPOSITION'}
]);

export function stepStatuses(row:ManualProposal):('done'|'pending'|'blocked')[]{
  const exported=Boolean(row.provenance?.exportedArtifactId);
  const imported=row.provenance?.obtainedBy==='MANUAL_IMPORT';
  const terminal=row.state==='REJECTED'||row.state==='ACCEPTED_AS_DRAFT';
  const s:['done'|'pending'|'blocked','done'|'pending'|'blocked','done'|'pending'|'blocked','done'|'pending'|'blocked','done'|'pending'|'blocked','done'|'pending'|'blocked','done'|'pending'|'blocked']=[
    'done',
    row.state==='PROVENANCE_INVALID'&&!exported?'blocked':'done',
    exported?'done':'pending',
    exported?(row.state==='EXPORTED'?'pending':'done'):'pending',
    imported?'done':'pending',
    row.state==='PROVENANCE_INVALID'?'blocked':(imported?'done':'pending'),
    terminal||row.state==='DEFERRED'?'done':'pending'
  ];
  return s;
}

/* ── record presentation copy (surface-owned; domain records stay language-neutral) ───────── */
export type RecordCopy={title:{ar:string;en:string};project:{ar:string;en:string};scope:{ar:string;en:string};files:readonly string[];verdict:{ar:string;en:string};verdictTone:Tone};
export const RECORD_COPY:Record<string,RecordCopy>={
  'AIB-REQ-0048':{title:{ar:'مساعد المراجعة المعمارية',en:'Architecture Review Assistance'},project:{ar:'فريق المعمارية',en:'Core architecture team'},scope:{ar:'تحليلات مراجعة محددة بالنقاط فقط',en:'Pointed review analyses only'},files:['ARCH_REVIEW_SCOPE.md','CURRENT_STATE_NOTES.json'],verdict:{ar:'نافع — لا توجد بيانات حساسة مضمّنة',en:'Useful — no sensitive data embedded'},verdictTone:'ok'},
  'AIB-REQ-0044':{title:{ar:'دعم تحقّق نموذج التهديدات',en:'Threat Model Validation Support'},project:{ar:'أمن التطوير',en:'Product security'},scope:{ar:'مطابقة ثوابت نموذج التهديدات مع خارطة الضوابط',en:'Threat-model assertions checked against the control map'},files:['THREAT_MODEL_v4.json','CONTROL_MAP_r2.md'],verdict:{ar:'نافع مع ملاحظتين تحتاج تحقّقًا بشريًا',en:'Useful with two notes that need human verification'},verdictTone:'ok'},
  'AIB-REQ-0045':{title:{ar:'صقل لغة السياسات',en:'Policy Language Refinement'},project:{ar:'حوكمة البيانات',en:'Data governance'},scope:{ar:'صياغة بديلة لفقرات الاحتفاظ دون تغيير المعنى',en:'Alternative phrasing of retention clauses without meaning change'},files:['POLICY_RETENTION_CLAUSE.md'],verdict:{ar:'يحتاج مراجعة قانونية قبل أي استخدام',en:'Needs legal review before any use'},verdictTone:'warn'},
  'AIB-REQ-0046':{title:{ar:'إرشاد ضبط الخريطة',en:'Control Mapping Guidance'},project:{ar:'الامتثال',en:'Compliance'},scope:{ar:'اقتراح ربط ضوابط ISO 27001 بسجلات التدقيق',en:'Proposed ISO 27001 control-to-audit-log bindings'},files:['CONTROL_BINDINGS_draft.csv'],verdict:{ar:'مقبول — أُعيدت صياغة المراجعة البشرية',en:'Acceptable after human-review rewriting'},verdictTone:'ok'},
  'AIB-REQ-0047':{title:{ar:'مراجعة استراتيجية التسجيل',en:'Logging Strategy Review'},project:{ar:'التشغيل',en:'Platform operations'},scope:{ar:'توصيات احتفاظ بسجلات التشغيل',en:'Operational log retention recommendations'},files:['LOGGING_STRATEGY.md'],verdict:{ar:'مخالفة تساوية المصدر — حُجرت الاستجابة',en:'Provenance mismatch — response quarantined'},verdictTone:'bad'},
  'AIB-REQ-0049':{title:{ar:'تقييم مخاطر تدفّق البيانات',en:'Data Flow Risk Assessment'},project:{ar:'الخصوصية',en:'Privacy engineering'},scope:{ar:'حصر مسارات نقل البيانات الشخصية',en:'Enumeration of personal-data transit paths'},files:['DATAFLOW_MAP_r1.json'],verdict:{ar:'لم يُجهَّز بعد — الحمولة غير مُصرَّحة للتصدير',en:'Not cleared yet — payload is not exportable'},verdictTone:'muted'},
  'AIB-REQ-0050':{title:{ar:'توصية التشفير أثناء التخزين',en:'Encryption-at-Rest Recommendation'},project:{ar:'أمن المنصة',en:'Platform security'},scope:{ar:'مقارنة خيارات تشفيع مفاتيح',en:'Key-escrow option comparison'},files:['CRYPTO_BASELINE.md'],verdict:{ar:'مرفوض — توصية غير قابلة للتحقّق',en:'Rejected — recommendation was not verifiable'},verdictTone:'bad'},
  'AIB-REQ-0051':{title:{ar:'مسوّدة سياسة الاحتفاظ',en:'Retention Policy Drafting'},project:{ar:'حوكمة البيانات',en:'Data governance'},scope:{ar:'مسوّدة أولية لجدول الاحتفاظ',en:'First draft of the retention schedule'},files:['RETENTION_SCHEDULE_v0.md'],verdict:{ar:'نافع — خالٍ من معرّفات العملاء',en:'Useful — free of customer identifiers'},verdictTone:'ok'}
};
export const copyOf=(row:ManualProposal|null|undefined):RecordCopy=>(row&&RECORD_COPY[row.proposalId])||{title:{ar:'طلب يدوي',en:'Manual request'},project:{ar:'غير مُصرَّح',en:'Unassigned'},scope:{ar:'غير مُصرَّح — لم تُحدَّد النطاق',en:'Not cleared — scope not declared'},files:[],verdict:{ar:'لا توجد تصريح حمولة مسجّل',en:'No payload clearance recorded'},verdictTone:'muted'};
export const shortDigest=(value:any,len=16):string=>{const s=String(value??'');return s.length>len+3?`${s.slice(0,len)}…`:s};

/* ── icons (16px line set; tone carried by color, never by shape alone) ───────────────────── */
const ICON_PATHS:Record<string,string>={
  shield:'M8 1.7l5.1 1.9v4c0 3.1-2.1 5.9-5.1 6.8-3-.9-5.1-3.7-5.1-6.8v-4L8 1.7z',
  ban:'M8 2a6 6 0 100 12A6 6 0 008 2zM3.6 3.6l8.8 8.8',
  bank:'M2 6.2 8 2.6l6 3.6M3.3 7h9.4M4.5 7v4.6M8 7v4.6M11.5 7v4.6M2.6 13.4h10.8',
  check:'M3.4 8.4l3 3 6.2-6.6',
  lock:'M4.6 7.2V5.5a3.4 3.4 0 016.8 0v1.7M3.6 7.2h8.8v6H3.6z',
  person:'M8 8.3a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM2.9 13.5c.6-2.4 2.7-3.8 5.1-3.8s4.5 1.4 5.1 3.8',
  arrow:'M2.8 8h8.6M8.8 5.2 12 8l-3.2 2.8',
  clock:'M8 4.4V8l2.3 1.5M8 2a6 6 0 100 12A6 6 0 008 2z',
  info:'M8 7.3v4.2M8 4.5v.1M8 2a6 6 0 100 12A6 6 0 008 2z',
  warn:'M8 2.4l5.9 10.2H2.1L8 2.4zM8 6.4v3M8 11h.01',
  link:'M6.5 9.5a2.5 2.5 0 003.6 0l1.9-1.9a2.5 2.5 0 10-3.5-3.5l-.8.8M9.5 6.5a2.5 2.5 0 00-3.6 0L4 8.4a2.5 2.5 0 103.5 3.5l.8-.8',
  doc:'M4 2.4h5l3 3v8.2H4zM9 2.4V5.4h3M5.8 8.4h4.4M5.8 10.6h3',
  plug:'M6 2.6v3.2M10 2.6v3.2M4.4 5.8h7.2v2.4a3.6 3.6 0 01-7.2 0zM8 11.8v1.8',
  seal:'M8 2.2l1.9 1.3 2.3-.3.7 2.2 1.9 1.3-1 2.1 1 2.1-1.9 1.3-.7 2.2-2.3-.3L8 15.4l-1.9-1.3-2.3.3-.7-2.2L1.2 11l1-2.1-1-2.1 1.9-1.3.7-2.2 2.3.3z'
};
export const icon=(name:string,tone:Tone='muted'):string=>`<svg class="ma-ico" data-tone="${tone}" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${ICON_PATHS[name]||ICON_PATHS.info}"/></svg>`;
export const pill=(text:string,tone:Tone,mono=true):string=>`<span class="ma-pill" data-tone="${tone}"${mono?' dir="ltr"':''}>${esc(text)}</span>`;

/* ── region copy ─────────────────────────────────────────────────────────────────────────── */
export const LEFT_LABEL={ar:'سجلات الجسر',en:'Bridge records'};
export const RIGHT_LABEL={ar:'سياق الحوكمة',en:'Governance context'};
export const BANNER={title:{ar:'جسر الذكاء الاصطناعي',en:'Manual AI Bridge'},badge:'W05',detail:{ar:'تبادل يدوي محوّم — لا استدعاء مزوّد، لا نشر قانوني',en:'Governed manual exchange — no provider call, no canonical publication'}};
export const TOOLBAR_LABELS:Record<string,{ar:string;en:string}>={
  'manual_ai.draft':{ar:'تجهيز حزمة يدوية',en:'Prepare manual packet'},
  'manual_ai.export':{ar:'تصدير الحزمة للتنفيذ الخارجي',en:'Export packet for external AI'},
  'manual_ai.import':{ar:'تسجيل استجابة خارجية',en:'Import external result'},
  'manual_ai.review':{ar:'تسجيل قرار بشري',en:'Record human disposition'},
  'foundation.settings':{ar:'الإعدادات',en:'Settings'},
  'foundation.note':{ar:'ملاحظة',en:'Note'},
  'foundation.notes':{ar:'الملاحظات',en:'Notes'}
};
export const DISPOSITION_COPY:Record<string,{ar:string;en:string}>={
  ACCEPT:{ar:'قبول كمسودة',en:'Accept as draft'},
  EDIT:{ar:'تحرير المخرجات',en:'Edit output'},
  REJECT:{ar:'رفض',en:'Reject'},
  DEFER:{ar:'تأجيل',en:'Defer'},
  REQUEST_EVIDENCE:{ar:'طلب دليل',en:'Request evidence'}
};
