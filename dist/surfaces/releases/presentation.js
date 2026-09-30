/* RELEASES SURFACE PRESENTATION — W05-RELEASES.
 *
 * Architecture: SHARED MECHANICS (SemanticCommandBus, WorkspaceFoundation regions/toolbar) +
 * SURFACE-SPECIFIC COMPOSITION (this file) + SURFACE-SPECIFIC PRESENTATION (runtime governor).
 * The reference CEP_SYSTEM_RELEASES_REFERENCE.png is CONSTRUCTION AUTHORITY for the region
 * model below: header identity -> four-fact strip -> two-column candidate workbench ->
 * verification-records drawer; structure pane on the leading side; release-context pane on the
 * trailing side. REFERENCE != BLIND PIXEL COPY — the shell supplies its own pane widths and
 * every direction is expressed with logical properties so RTL/LTR both compose correctly.
 *
 * Truth laws carried by this presentation: technical readiness, Owner authorization and
 * deployment observation are shown as three separate axes; compare/empty states are shown
 * honestly; no success, approval, publish or deployment is ever fabricated here.
 */
                                                                                                 
import {RECORD_BASIS} from './records.js';

export const RELEASES_SURFACE_OWNER='W05-RELEASES';
                      

const esc=(value    )=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]          ));
const icon=(id       )=>`<svg class="icon sm rel-icon" aria-hidden="true"><use href="#i-${esc(id)}"></use></svg>`;

/* ── bilingual dictionary (labels are keys; record data carries keys, not sentences) ── */
export const T                                     ={
  eyebrow:{ar:'إدارة الإصدارات',en:'Release management'},
  purpose:{ar:'التحكم الكامل في قواعد الإصدارات ومزامنتها تلقائيًا — والحقائق الثلاث منفصلة دائمًا.',en:'Full control of release candidates and their synchronisation — the three truths always stay separate.'},
  paneTitle:{ar:'الإصدارات',en:'Releases'},
  paneHint:{ar:'اختر مرشحًا لعرض حقيقته الكاملة.',en:'Select a candidate to see its full truth.'},
  statesTitle:{ar:'الحالات',en:'States'},
  channelsTitle:{ar:'القنوات',en:'Channels'},
  environmentsTitle:{ar:'البيئات',en:'Environments'},
  candidatesTitle:{ar:'مرشحو الإصدار',en:'Release candidates'},
  searchPlaceholder:{ar:'بحث في الإصدارات…',en:'Search releases…'},
  sortNewest:{ar:'الأحدث أولًا',en:'Newest first'},
  sortOldest:{ar:'الأقدم أولًا',en:'Oldest first'},
  sortState:{ar:'حسب الحالة',en:'By state'},
  clearFilters:{ar:'مسح عوامل التصفية',en:'Clear filters'},
  noMatches:{ar:'لا يوجد مرشح مطابق',en:'No candidate matches'},
  noMatchesHint:{ar:'التصفية الحالية تُرجع نتيجة فارغة — الفراغ ليس جاهزية خضراء.',en:'The active filter returns an empty set — an empty view is not green readiness.'},
  emptySelection:{ar:'لا يوجد مرشح محدد',en:'No candidate selected'},
  emptySelectionHint:{ar:'اختر مرشحًا من القائمة لعرض جاهزيته التقنية وتخويل المالك ومراقبة النشر.',en:'Select a candidate to see technical readiness, Owner authorization and deployment observation.'},
  identity:{ar:'هوية الإصدار',en:'Release identity'},
  source:{ar:'المصدر / البيان',en:'Source / statement'},
  scope:{ar:'نطاق الإصدار',en:'Release scope'},
  stages:{ar:'مراحل النشر',en:'Deployment stages'},
  notes:{ar:'ملخص ملاحظات الإصدار',en:'Release notes summary'},
  gates:{ar:'البثات المطلوبة',en:'Required gates'},
  results:{ar:'نتائج التحقق',en:'Verification results'},
  rollback:{ar:'جاهزية الرجوع',en:'Rollback readiness'},
  approvers:{ar:'الاعتمادات / المصادقات',en:'Approvals / approvers'},
  records:{ar:'سجلات التحقق',en:'Verification records'},
  tabFiles:{ar:'سجل التنفيذ',en:'Execution records'},
  tabEvents:{ar:'آخر أحداث التحقق',en:'Recent verification events'},
  tabPackage:{ar:'حالة الحزمة',en:'Package state'},
  onlyProblems:{ar:'المشكلات فقط',en:'Problems only'},
  context:{ar:'سياق الإصدار الحالي',en:'Current release context'},
  blocker:{ar:'عائق حالي',en:'Current blocker'},
  verificationsOk:{ar:'تحقق جاهز',en:'Verifications ready'},
  approvalsOpen:{ar:'اعتمادات مطلوبة',en:'Required approvals'},
  expectedScope:{ar:'النطاق المتوقع',en:'Expected scope'},
  rollbackNote:{ar:'ملاحظة الرجوع',en:'Rollback note'},
  risks:{ar:'المخاطر / التبعات',en:'Risks / dependencies'},
  interpretation:{ar:'تفسير حالة الإصدار',en:'Release state interpretation'},
  nextAction:{ar:'الإجراء التالي',en:'Next action'},
  compareTruth:{ar:'حقيقة المقارنة',en:'Comparison truth'},
  compareReady:{ar:'جاهزة',en:'READY'},
  compareBlocked:{ar:'محجوبة',en:'BLOCKED'},
  candidateEyebrow:{ar:'مرشحو الإصدار',en:'Release candidate'},
  recordBasis:{ar:'أساس السجل',en:'Record basis'},
  /* display states */
  s_draft:{ar:'مسودة',en:'DRAFT'},
  s_readyWarning:{ar:'جاهز مع تحذير',en:'READY WITH WARNING'},
  s_ready:{ar:'جاهز',en:'READY'},
  s_held:{ar:'معلّق',en:'HELD'},
  s_released:{ar:'منشور',en:'RELEASED'},
  s_rolledBack:{ar:'مُرتجع',en:'ROLLED BACK'},
  /* channels / environments / targets */
  ch_internal:{ar:'داخلي',en:'Internal'},ch_beta:{ar:'بيتا',en:'Beta'},ch_production:{ar:'إنتاج',en:'Production'},
  env_staging:{ar:'التجهيز',en:'Staging'},env_preProd:{ar:'ما قبل الإنتاج',en:'Pre-Production'},env_production:{ar:'الإنتاج',en:'Production'},
  tgt_productionCandidate:{ar:'مرشح للإنتاج',en:'Production Candidate'},
  tgt_preProduction:{ar:'ما قبل الإنتاج',en:'Pre-Production'},
  /* domain axes */
  ax_state:{ar:'الجاهزية التقنية',en:'Technical readiness'},
  ax_authorization:{ar:'تخويل المالك',en:'Owner authorization'},
  ax_deployment:{ar:'مراقبة النشر',en:'Deployment observation'},
  dv_ASSEMBLED:{ar:'مُجمّع',en:'ASSEMBLED'},
  dv_TECHNICALLY_READY:{ar:'جاهز تقنيًا',en:'TECHNICALLY_READY'},
  dv_NOT_READY:{ar:'غير جاهز',en:'NOT_READY'},
  dv_NONE:{ar:'لا تخويل',en:'NONE'},
  dv_REQUESTED:{ar:'الطلب مُرسل',en:'REQUESTED'},
  dv_GRANTED:{ar:'مُصرَّح',en:'GRANTED'},
  dv_REVOKED:{ar:'مُلغى',en:'REVOKED'},
  dv_NOT_DEPLOYED:{ar:'لم يُنشر',en:'NOT_DEPLOYED'},
  dv_IN_PROGRESS:{ar:'جارٍ النشر',en:'IN_PROGRESS'},
  dv_DEPLOYED:{ar:'مُنشر ومُرصد',en:'DEPLOYED'},
  dv_FAILED:{ar:'فشل النشر',en:'FAILED'},
  dv_UNKNOWN:{ar:'غير معلوم',en:'UNKNOWN'},
  dv_UNOBSERVED:{ar:'غير مرصود',en:'UNOBSERVED'},
  /* facts */
  f_candidate:{ar:'معرّف الإصدار',en:'Release ID'},
  f_created:{ar:'تاريخ الإنشاء',en:'Created'},
  f_author:{ar:'أنشأها',en:'Created by'},
  f_edited:{ar:'آخر تعديل',en:'Last edit'},
  f_version:{ar:'الإصدار',en:'Version'},
  f_channel:{ar:'القناة',en:'Channel'},
  f_target:{ar:'الهدف',en:'Target'},
  f_authorization:{ar:'التخويل',en:'Authorization'},
  f_build:{ar:'المعرّف الظاهر',en:'Build ID'},
  f_branch:{ar:'الفرع',en:'Branch'},
  f_commit:{ar:'الالتزام',en:'Commit'},
  f_ci:{ar:'نتيجة CI',en:'CI result'},
  f_verified:{ar:'تم التحقق',en:'Verified'},
  f_irreversible:{ar:'ترقية غير قابلة للإرجاع',en:'Irreversible promotion'},
  f_components:{ar:'المكوّنات',en:'Components'},
  f_services:{ar:'الخدمات',en:'Services'},
  f_artifacts:{ar:'المخرجات',en:'Artifacts'},
  f_checks:{ar:'الفحوصات',en:'Checks'},
  f_previous:{ar:'الإصدار السابق',en:'Previous release'},
  f_plan:{ar:'خطة الرجوع',en:'Rollback plan'},
  f_estimate:{ar:'وقت الرجوع المتقدر',en:'Estimated rollback time'},
  f_role:{ar:'الدور',en:'Role'},
  f_person:{ar:'الشخص',en:'Person'},
  f_target_col:{ar:'الهدف',en:'Target'},
  f_result:{ar:'النتيجة',en:'Result'},
  f_detail:{ar:'التفصيل',en:'Detail'},
  f_path:{ar:'المسار',en:'Path'},
  f_kind:{ar:'النوع',en:'Kind'},
  f_now:{ar:'الحجم الحالي',en:'Size now'},
  f_before:{ar:'الحجم السابق',en:'Size before'},
  f_delta:{ar:'التغيّر',en:'Delta'},
  f_at:{ar:'التوقيت',en:'Time'},
  f_event:{ar:'الحدث',en:'Event'},
  /* gates */
  'gate.security':{ar:'أمان الحزمة',en:'Package security'},
  'gate.operations':{ar:'العمليات',en:'Operations'},
  'gate.notifications':{ar:'الإشعارات',en:'Notifications'},
  'gate.audit':{ar:'التدقيق',en:'Audit'},
  'gate.encryption':{ar:'التعمية',en:'Encryption'},
  'gate.observability':{ar:'المراقبة',en:'Observability'},
  /* results */
  'res.signatures':{ar:'توقيعات الحزم',en:'Package signatures'},
  'res.migrations':{ar:'ترحيل قاعدة البيانات',en:'Database migrations'},
  'res.broadcast':{ar:'جدولة البث',en:'Broadcast schedule'},
  'res.observability':{ar:'المؤشرات والتنبيهات',en:'Metrics and alerts'},
  'res.rollback':{ar:'فحص خطة الرجوع',en:'Rollback plan check'},
  /* approvers */
  'approver.releaseManager':{ar:'مالك الإصدار',en:'Release Manager'},
  'approver.securityOwner':{ar:'مالك الأمان',en:'Security Owner'},
  'approver.operationsLead':{ar:'مسؤول العمليات',en:'Operations Lead'},
  'approver.productOwner':{ar:'مالك المنتج',en:'Product Owner'},
  st_granted:{ar:'مُعتمد',en:'Granted'},
  st_pending:{ar:'بالانتظار',en:'Pending'},
  st_missing:{ar:'مفقود',en:'Missing'},
  st_pass:{ar:'نجاح',en:'Pass'},
  st_fail:{ar:'فشل',en:'Fail'},
  st_warn:{ar:'تحذير',en:'Warning'},
  st_pendingG:{ar:'قيد الانتظار',en:'Pending'},
  /* risks */
  'risk.upgradeWindow':{ar:'نافذة الترقية',en:'Upgrade window'},
  'risk.dependencies':{ar:'التبعات',en:'Dependencies'},
  'risk.approvals':{ar:'الاعتمادات المفتوحة',en:'Open approvals'},
  'risk.signature':{ar:'التوقيع',en:'Signature'},
  'risk.migration':{ar:'الترحيل',en:'Migration'},
  'risk.observability':{ar:'الرصد',en:'Observability'},
  'risk.rollback':{ar:'الرجوع',en:'Rollback'},
  'risk.verifications':{ar:'التحقق',en:'Verifications'},
  'risk.rollout':{ar:'جدولة النشر',en:'Rollout'},
  /* plans */
  'plan.compatible':{ar:'متوافقة ومُختبرة',en:'Compatible and tested'},
  'plan.unverified':{ar:'غير مُتحقق منها',en:'Not verified'},
  'plan.draft':{ar:'مسودة',en:'Draft'},
  'plan.executed':{ar:'نُفّذت فعليًا',en:'Executed'},
  /* events */
  'event.signatureCheck':{ar:'فحص توقيع الحزمة',en:'Package signature check'},
  'event.broadcastSync':{ar:'مزامنة سجل البث',en:'Broadcast log sync'},
  'event.approvalReceipt':{ar:'إيصال اعتماد المالك',en:'Owner approval receipt'},
  'event.artifactScan':{ar:'فحص المخرجات',en:'Artifact scan'},
  'event.deploymentObserved':{ar:'رصد النشر',en:'Deployment observed'},
  'event.migrationDryRun':{ar:'تجربة الترحيل',en:'Migration dry-run'},
  'event.assembled':{ar:'تجميع المرشح',en:'Candidate assembled'},
  'event.rollbackObserved':{ar:'رصد الرجوع',en:'Rollback observed'},
  'event.observabilityFail':{ar:'فشل الرصد',en:'Observability failure'},
  /* package */
  'package.needsApproval':{ar:'الحزمة سليمة — بانتظار اعتماد المالك',en:'Package intact — awaiting Owner authorization'},
  'package.verified':{ar:'حزمة مُتحقّقة وموقّعة',en:'Verified and signed package'},
  'package.signatureFailed':{ar:'توقيع الحزمة فاشل — إعادة بناء مطلوبة',en:'Package signature failed — rebuild required'},
  'package.checksPending':{ar:'فحوصات معلّقة على التحقق',en:'Checks pending on verification'},
  'package.rolledBack':{ar:'حزمة مُرتجعة إلى الإصدار السابق',en:'Package rolled back to the previous release'},
  'package.unavailable':{ar:'حالة الحزمة غير متاحة لهذا المرشح',en:'Package state unavailable for this candidate'},
  kind_source:{ar:'مصدر',en:'Source'},kind_binary:{ar:'ملف تنفيذي',en:'Binary'},kind_doc:{ar:'توثيق',en:'Doc'},
  unknownDetail:{ar:'تفصيل العرض غير متاح — لا تُخترع بيانات',en:'Presentation detail unavailable — nothing is invented'},
  scopeNote:{ar:'نطاق مرتبط بالمُرشَّح · مُسجَّل في أساس السجل',en:'Candidate-bound scope · recorded in the record basis'},
  stage_draft:{ar:'مسودة',en:'DRAFT'},stage_validating:{ar:'جارٍ التحقق',en:'VALIDATING'},
  stage_ready:{ar:'جاهز',en:'READY'},stage_promoted:{ar:'مُرقّى',en:'PROMOTED'},stage_released:{ar:'منشور',en:'RELEASED'},
  branch_hold:{ar:'معلّق — موقوت',en:'HOLD — held'},branch_rollback:{ar:'رجوع مُرتجَع',en:'ROLLED BACK'},
  minutes:{ar:'دقيقة',en:'min'},noEstimate:{ar:'غير متاح',en:'Unavailable'},
  axisNote:{ar:'المالك',en:'Owner'},
  showAll:{ar:'عرض كل الملاحظات',en:'Show all notes'}
};

export const t=(key       ,locale       )=>T[key]?T[key][locale]:key;
const localeNow=()       =>(typeof document!=='undefined'&&document.documentElement.lang==='en')?'en':'ar';

const STATE_LABEL                            ={draft:'s_draft',readyWarning:'s_readyWarning',ready:'s_ready',held:'s_held',released:'s_released',rolledBack:'s_rolledBack'};
const STATE_TONE                            ={draft:'muted',readyWarning:'warn',ready:'ok',held:'bad',released:'ok',rolledBack:'bad'};
const GATE_LABEL                         ={pass:'st_pass',fail:'st_fail',warn:'st_warn',pending:'st_pendingG'};
const GATE_TONE                         ={pass:'ok',fail:'bad',warn:'warn',pending:'muted'};
const GATE_ICON                         ={pass:'check',fail:'close',warn:'warn',pending:'history'};
const GATE_MARK                         ={pass:'✓',fail:'✕',warn:'!',pending:'…'};
const STATE_ICON                            ={draft:'history',readyWarning:'warn',ready:'check',held:'lock',released:'check',rolledBack:'return'};
const CHANNEL_LABEL                          ={internal:'ch_internal',beta:'ch_beta',production:'ch_production'};
const ENV_LABEL                              ={staging:'env_staging',preProd:'env_preProd',production:'env_production'};
const STAGE_KEYS=['stage_draft','stage_validating','stage_ready','stage_promoted','stage_released'];

export function displayState(record              ,domain    )             {
  if(record?.stages?.rolledBack||domain?.deployment==='FAILED')return 'rolledBack';
  if(domain?.deployment==='DEPLOYED')return 'released';
  if(domain?.state==='NOT_READY'||domain?.authorization==='REVOKED')return 'held';
  if(domain?.state==='ASSEMBLED')return 'draft';
  if(domain?.state==='TECHNICALLY_READY')return domain?.authorization==='GRANTED'?'ready':'readyWarning';
  return 'draft';
}

export function relativeAge(minutes       ,locale       ){
  if(!Number.isFinite(minutes)||minutes<=0)return locale==='ar'?'الآن':'just now';
  const days=Math.floor(minutes/1440),hours=Math.floor(minutes/60)%24,mins=Math.round(minutes%60);
  const ar=(n       ,s       ,p       )=>locale==='ar'?`${n} ${n===1?s:n===2?p:(n<11?s:p)}`:`${n} ${n===1?`${s}`:n===2?`${s}s`:`${s}s`}`;
  if(days>0)return locale==='ar'?`منذ ${ar(days,'يوم','أيام')}`:`${ar(days,'day')} ago`;
  if(hours>0)return locale==='ar'?`منذ ${ar(hours,'ساعة','ساعات')}`:`${ar(hours,'hour')} ago`;
  return locale==='ar'?`منذ ${ar(mins,'دقيقة','دقائق')}`:`${ar(mins,'minute')} ago`;
}

/* ─────────────────────────── style ─────────────────────────── */
const STYLE_ID='w05-releases-style';
export const RELEASES_STYLE=`
.foundation-stage.rel-stage{overflow-y:auto;overflow-x:hidden;padding:0;background:var(--bg1,#081522)}
.rel-root{container-type:inline-size;display:flex;flex-direction:column;gap:14px;padding:16px 18px 26px;min-height:100%;color:var(--text,#edf6fc);font-size:14px}
.rel-eyebrow{font-size:11.4px;font-weight:700;letter-spacing:.06em;color:var(--accent,#38c7ff);text-transform:uppercase}
html[lang="ar"] .rel-eyebrow{letter-spacing:0;text-transform:none;font-size:12px}
.rel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap}
.rel-head-main{display:flex;flex-direction:column;gap:6px;min-width:0}
.rel-title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rel-title-row h1{font-size:26px;line-height:1.15;font-weight:800;letter-spacing:-.01em;margin:0;min-width:0}
.rel-sub{font-size:13px;color:var(--text2,#b9c9d6);margin:0;max-width:74ch;line-height:1.5}
.rel-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:11.6px;font-weight:800;letter-spacing:.03em;border:1px solid;white-space:nowrap}
html[lang="ar"] .rel-badge{letter-spacing:0;font-size:12.2px}
.rel-badge[data-tone=ok]{color:#04140d;background:rgba(83,214,148,.92);border-color:rgba(83,214,148,.9)}
.rel-badge[data-tone=warn]{color:#1a1204;background:rgba(244,189,101,.94);border-color:rgba(244,189,101,.9)}
.rel-badge[data-tone=bad]{color:#1a0508;background:rgba(255,109,120,.92);border-color:rgba(255,109,120,.9)}
.rel-badge[data-tone=muted]{color:var(--text,#edf6fc);background:var(--bg3,#0d2031);border-color:var(--line,#17354d)}
.rel-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:7px;font-size:11.4px;font-weight:650;border:1px solid var(--line,#17354d);background:var(--bg2,#0a1a29);color:var(--text2,#b9c9d6)}
.rel-chip[data-tone=ok]{border-color:rgba(83,214,148,.5);color:#8fe9c0}
.rel-chip[data-tone=bad]{border-color:rgba(255,109,120,.5);color:#ff9ba4}
.rel-chip[data-tone=warn]{border-color:rgba(244,189,101,.5);color:#f7d39a}
.rel-head-side{display:flex;flex-direction:column;align-items:flex-end;gap:8px;text-align:end;max-width:34ch}
.rel-basis{display:inline-flex;gap:6px;align-items:flex-start;font-size:11.2px;line-height:1.45;color:var(--text3,#8298aa);border:1px dashed var(--line,#17354d);border-radius:8px;padding:7px 9px;background:var(--bg0,#06101a)}
.rel-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;background:var(--bg0,#06101a);border:1px solid var(--line,#17354d);border-radius:12px;padding:12px 14px}
.rel-f{display:flex;flex-direction:column;gap:3px;min-width:0}
.rel-f>span{font-size:11.3px;color:var(--text3,#8298aa);font-weight:600}
.rel-f>strong{font-size:14px;font-weight:700;white-space:normal;overflow-wrap:anywhere;line-height:1.3}
.rel-f>small{font-size:11.4px;color:var(--text3,#8298aa)}
.rel-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
.rel-col{display:flex;flex-direction:column;gap:12px;min-width:0}
.rel-block{background:var(--bg2,#0a1a29);border:1px solid var(--line,#17354d);border-radius:12px;padding:12px 14px 14px;min-width:0}
.rel-block-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding-bottom:9px;margin-bottom:11px;border-bottom:1px solid var(--line,#17354d)}
.rel-block-h h2{margin:0;font-size:15px;font-weight:750;letter-spacing:-.005em}
.rel-block-h .rel-meta{font-size:11.3px;color:var(--text3,#8298aa);white-space:nowrap}
.rel-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}
.rel-facts .rel-span{grid-column:1/-1}
.rel-note{margin:10px 0 0;font-size:12px;line-height:1.5;color:var(--text2,#b9c9d6);display:flex;gap:7px;align-items:flex-start}
.rel-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.rel-metric{display:flex;flex-direction:column;gap:2px;background:var(--bg1,#081522);border:1px solid var(--line,#17354d);border-radius:9px;padding:9px 8px;min-width:0;overflow:hidden}
.rel-metric b{font-size:21px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}
.rel-metric span{font-size:11px;line-height:1.25;color:var(--text3,#8298aa);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.rel-pipe{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.rel-step{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--line,#17354d);background:var(--bg1,#081522);font-size:12.2px;font-weight:700;color:var(--text3,#8298aa)}
.rel-step[data-done=true]{color:var(--text,#edf6fc);border-color:rgba(83,214,148,.45)}
.rel-step[data-current=true]{background:rgba(56,199,255,.14);border-color:rgba(56,199,255,.65);color:var(--accent2,#77dcff)}
.rel-step[data-fail=true]{background:rgba(255,109,120,.12);border-color:rgba(255,109,120,.55);color:#ff9ba4}
.rel-conn{width:16px;height:1px;background:var(--line2,#285774);flex:none}
.rel-branches{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px dashed var(--line,#17354d)}
.rel-branch{display:inline-flex;gap:6px;align-items:center;font-size:11.6px;font-weight:700;padding:5px 9px;border-radius:7px;border:1px solid var(--line,#17354d);color:var(--text2,#b9c9d6);background:var(--bg1,#081522)}
.rel-branch[data-tone=bad]{border-color:rgba(255,109,120,.5);color:#ff9ba4}
.rel-branch[data-tone=warn]{border-color:rgba(244,189,101,.5);color:#f7d39a}
.rel-gates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.rel-gate{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;border:1px solid var(--line,#17354d);background:var(--bg1,#081522);font-size:12.3px;min-width:0}
.rel-gate span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-mark{font-size:11.5px;font-weight:800;line-height:1;width:15px;height:15px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;flex:none}
.rel-mark[data-tone=ok]{background:rgba(83,214,148,.18);color:#7ee2b4}
.rel-mark[data-tone=bad]{background:rgba(255,109,120,.18);color:#ff9ba4}
.rel-mark[data-tone=warn]{background:rgba(244,189,101,.18);color:#f7d39a}
.rel-mark[data-tone=muted]{background:var(--bg3,#0d2031);color:var(--text3,#8298aa)}
.rel-rows{display:flex;flex-direction:column}
.rel-r{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line,#17354d);font-size:12.8px}
.rel-r:last-child{border-bottom:0;padding-bottom:0}
.rel-r .rel-rmain{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-r .rel-rsub{font-size:11.3px;color:var(--text3,#8298aa);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-r .rel-rstate{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:750;white-space:nowrap}
.rel-r[data-tone=ok] .rel-rstate{color:#7ee2b4}
.rel-r[data-tone=bad] .rel-rstate{color:#ff9ba4}
.rel-r[data-tone=warn] .rel-rstate{color:#f7d39a}
.rel-r[data-tone=muted] .rel-rstate{color:var(--text3,#8298aa)}
.rel-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.rel-toggle{font-size:11.6px;font-weight:700;color:var(--text2,#b9c9d6);background:var(--bg1,#081522);border:1px solid var(--line,#17354d);border-radius:7px;padding:5px 10px;cursor:pointer}
.rel-toggle[aria-pressed=true]{background:rgba(244,189,101,.14);border-color:rgba(244,189,101,.6);color:#f7d39a}
.rel-toggle:hover{border-color:var(--line2,#285774)}
.rel-notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.rel-notes li{display:flex;gap:9px;font-size:12.8px;line-height:1.55;color:var(--text2,#b9c9d6)}
.rel-notes li::before{content:'';flex:none;width:5px;height:5px;border-radius:50%;background:var(--accent,#38c7ff);margin-top:8px}
.rel-tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line,#17354d);padding-bottom:9px;margin-bottom:10px}
.rel-tab{font-size:12.2px;font-weight:700;color:var(--text3,#8298aa);background:transparent;border:1px solid transparent;border-radius:7px;padding:5px 10px;cursor:pointer}
.rel-tab[aria-selected=true]{color:var(--text,#edf6fc);background:var(--bg1,#081522);border-color:var(--line,#17354d)}
.rel-tab:hover{color:var(--text2,#b9c9d6)}
.rel-tab:focus-visible,.rel-toggle:focus-visible,.rel-cand:focus-visible,.rel-state:focus-visible,.rel-chan:focus-visible,.rel-search input:focus-visible,.rel-sort:focus-visible{outline:2px solid var(--focus,#91e6ff);outline-offset:2px}
.rel-empty{display:flex;flex-direction:column;gap:8px;align-items:flex-start;padding:26px 20px;border:1px dashed var(--line2,#285774);border-radius:12px;background:var(--bg0,#06101a)}
.rel-empty strong{font-size:15px}
.rel-empty p{margin:0;font-size:12.8px;color:var(--text2,#b9c9d6);max-width:60ch;line-height:1.55}
.rel-empty .rel-toggle{margin-top:4px}
.rel-foot{display:flex;gap:8px;align-items:center;font-size:11.3px;color:var(--text3,#8298aa);border-top:1px solid var(--line,#17354d);padding-top:10px}
/* structure pane */
.rel-pane{display:flex;flex-direction:column;gap:13px;font-size:13px;color:var(--text,#edf6fc)}
.rel-pane-h{display:flex;flex-direction:column;gap:4px}
.rel-pane-h p{margin:0}
.rel-pane-h h2{margin:0;font-size:17px;font-weight:800}
.rel-pane-h p{margin:0;font-size:11.8px;line-height:1.5;color:var(--text3,#8298aa)}
.rel-tools{display:flex;gap:7px}
.rel-search{position:relative;flex:1 1 auto;min-width:0;display:flex;align-items:center}
.rel-search svg{position:absolute;inset-inline-start:8px;color:var(--text3,#8298aa)}
.rel-search input{width:100%;min-width:0;padding:7px 9px;padding-inline-start:28px;font-size:12.5px;color:var(--text,#edf6fc);background:var(--bg0,#06101a);border:1px solid var(--line,#17354d);border-radius:8px}
.rel-sort{flex:0 0 auto;max-width:132px;padding:7px 6px;font-size:12.2px;color:var(--text2,#b9c9d6);background:var(--bg0,#06101a);border:1px solid var(--line,#17354d);border-radius:8px}
.rel-sec{display:flex;flex-direction:column;gap:6px}
.rel-sec-h{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.rel-sec-h h3{margin:0;font-size:11.6px;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:var(--text3,#8298aa)}
html[lang="ar"] .rel-sec-h h3{letter-spacing:0;text-transform:none;font-size:12.2px}
.rel-sec-h span{font-size:11.4px;color:var(--text3,#8298aa);font-variant-numeric:tabular-nums}
.rel-states{display:flex;flex-direction:column;gap:3px;margin:0;padding:0;list-style:none}
.rel-state{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--text2,#b9c9d6);font-size:12.7px;cursor:pointer;text-align:start}
.rel-state:hover{background:var(--bg2,#0a1a29);border-color:var(--line,#17354d)}
.rel-state[aria-pressed=true]{background:rgba(56,199,255,.12);border-color:rgba(56,199,255,.5);color:var(--accent2,#77dcff)}
.rel-state .dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--text3,#8298aa)}
.rel-state .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-state .cnt{font-size:11.6px;font-weight:750;font-variant-numeric:tabular-nums;color:var(--text3,#8298aa);background:var(--bg0,#06101a);border:1px solid var(--line,#17354d);border-radius:6px;padding:1px 7px}
.rel-state[aria-pressed=true] .cnt{color:var(--accent2,#77dcff);border-color:rgba(56,199,255,.45)}
.rel-chans{display:flex;gap:6px;flex-wrap:wrap}
.rel-chan{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;border:1px solid var(--line,#17354d);background:var(--bg1,#081522);color:var(--text2,#b9c9d6);font-size:11.8px;cursor:pointer}
.rel-chan[aria-pressed=true]{background:rgba(56,199,255,.12);border-color:rgba(56,199,255,.5);color:var(--accent2,#77dcff)}
.rel-envs{display:flex;flex-direction:column;gap:3px}
.rel-env{display:flex;align-items:center;gap:7px;padding:4px 8px;font-size:12.2px;color:var(--text3,#8298aa)}
.rel-env .cnt{margin-inline-start:auto;font-variant-numeric:tabular-nums;color:var(--text2,#b9c9d6)}
.rel-list{display:flex;flex-direction:column;gap:7px}
.rel-cands{display:flex;flex-direction:column;gap:7px;margin:0;padding:0;list-style:none}
.rel-cand{display:flex;flex-direction:column;gap:5px;width:100%;text-align:start;padding:9px 10px;border-radius:10px;border:1px solid var(--line,#17354d);background:var(--bg2,#0a1a29);color:var(--text,#edf6fc);cursor:pointer}
.rel-cand:hover{border-color:var(--line2,#285774)}
.rel-cand[aria-current=true]{border-color:rgba(56,199,255,.65);background:rgba(56,199,255,.09)}
.rel-cand .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rel-cand .cid{font-size:12.9px;font-weight:750;letter-spacing:.01em}
.rel-cand .meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:11.4px;color:var(--text3,#8298aa)}
.rel-cand .age{margin-inline-start:auto;white-space:nowrap;flex:none;font-size:11.2px;color:var(--text3,#8298aa)}
.rel-cand .foot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rel-cand .top>.icon{color:var(--text3,#8298aa)}
.rel-cand[aria-current=true] .top>.icon{color:var(--accent,#38c7ff)}
.rel-cand .mini{font-size:10.6px;font-weight:800;letter-spacing:.02em;padding:2px 7px;border-radius:5px;border:1px solid var(--line,#17354d);color:var(--text2,#b9c9d6);white-space:nowrap}
html[lang="ar"] .rel-cand .mini{letter-spacing:0}
.rel-cand .mini[data-tone=ok]{color:#7ee2b4;border-color:rgba(83,214,148,.5)}
.rel-cand .mini[data-tone=warn]{color:#f7d39a;border-color:rgba(244,189,101,.5)}
.rel-cand .mini[data-tone=bad]{color:#ff9ba4;border-color:rgba(255,109,120,.5)}
.rel-cand .mini[data-tone=muted]{color:var(--text3,#8298aa)}
/* context pane */
.rel-ctx{display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text,#edf6fc)}
.rel-ctx-h{display:flex;flex-direction:column;gap:5px;padding-bottom:10px;border-bottom:1px solid var(--line,#17354d)}
.rel-ctx-h h2{margin:0;font-size:15.5px;font-weight:800}
.rel-ctx-item{display:flex;gap:9px;align-items:flex-start;padding:9px 11px;border-radius:10px;border:1px solid var(--line,#17354d);background:var(--bg2,#0a1a29)}
.rel-ctx-item .body{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto}
.rel-ctx-item .body strong{font-size:12.9px;font-weight:750}
.rel-ctx-item .body span{font-size:11.7px;line-height:1.5;color:var(--text2,#b9c9d6)}
.rel-ctx-item .cnt{font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:6px;border:1px solid var(--line,#17354d);background:var(--bg0,#06101a);color:var(--text2,#b9c9d6);white-space:nowrap}
.rel-ctx-item[data-tone=bad]{border-color:rgba(255,109,120,.45);background:rgba(255,109,120,.08)}
.rel-ctx-item[data-tone=bad] .body strong{color:#ff9ba4}
.rel-ctx-item[data-tone=ok]{border-color:rgba(83,214,148,.4);background:rgba(83,214,148,.07)}
.rel-ctx-item[data-tone=ok] .body strong{color:#7ee2b4}
.rel-ctx-item[data-tone=warn]{border-color:rgba(244,189,101,.42);background:rgba(244,189,101,.07)}
.rel-ctx-item[data-tone=warn] .body strong{color:#f7d39a}
.rel-ctx-kv{display:flex;flex-direction:column;gap:6px;padding:9px 11px;border-radius:10px;border:1px solid var(--line,#17354d);background:var(--bg2,#0a1a29)}
.rel-ctx-kv .row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.2px}
.rel-ctx-kv .row span{color:var(--text3,#8298aa)}
.rel-ctx-kv .row b{font-weight:750;font-variant-numeric:tabular-nums}
.rel-ctx-flow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12.4px;font-weight:700}
.rel-ctx-flow .arrow{color:var(--accent,#38c7ff)}
.rel-ctx-next{display:flex;flex-direction:column;gap:7px;padding:11px 12px;border-radius:10px;border:1px solid rgba(83,214,148,.45);background:linear-gradient(0deg,rgba(83,214,148,.08),rgba(83,214,148,.08))}
.rel-ctx-next strong{font-size:12.9px;color:#7ee2b4}
.rel-ctx-next p{margin:0;font-size:11.8px;line-height:1.55;color:var(--text2,#b9c9d6)}
.rel-chips{display:flex;gap:6px;flex-wrap:wrap}
.rel-smallchip{font-size:11.3px;padding:3px 8px;border-radius:6px;border:1px solid var(--line,#17354d);background:var(--bg0,#06101a);color:var(--text2,#b9c9d6)}
.rel-smallchip[data-tone=bad]{color:#ff9ba4;border-color:rgba(255,109,120,.45)}
.rel-smallchip[data-tone=warn]{color:#f7d39a;border-color:rgba(244,189,101,.45)}
.rel-smallchip[data-tone=ok]{color:#7ee2b4;border-color:rgba(83,214,148,.45)}
.rel-empty-compact{padding:16px 14px;border:1px dashed var(--line2,#285774);border-radius:10px;background:var(--bg0,#06101a);display:flex;flex-direction:column;gap:6px}
.rel-empty-compact strong{font-size:13px}
.rel-empty-compact p{margin:0;font-size:11.8px;line-height:1.55;color:var(--text2,#b9c9d6)}
.rel-icon{flex:none;vertical-align:-2px}
.rel-truths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.rel-truth{display:flex;flex-direction:column;gap:3px;padding:9px 12px;border-radius:10px;border:1px solid var(--line,#17354d);background:var(--bg2,#0a1a29);min-width:0}
.rel-truth-l{font-size:11.3px;font-weight:650;color:var(--text3,#8298aa)}
.rel-truth-v{font-size:14.5px;font-weight:750;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-truth-o{font-size:10.9px;color:var(--text3,#8298aa);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rel-truth[data-tone=ok] .rel-truth-v{color:#7ee2b4}
.rel-truth[data-tone=warn] .rel-truth-v{color:#f7d39a}
.rel-truth[data-tone=bad] .rel-truth-v{color:#ff9ba4}
.rel-truth[data-tone=muted] .rel-truth-v{color:var(--text2,#b9c9d6)}
.rel-chan b{font-variant-numeric:tabular-nums;font-weight:750}
.rel-empty-compact .rel-toggle{align-self:flex-start}
@container (max-width:700px){.rel-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:620px){.rel-grid{grid-template-columns:minmax(0,1fr)}.rel-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.rel-truths{grid-template-columns:minmax(0,1fr)}.rel-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.rel-head-side{align-items:flex-start;text-align:start}}
@media (max-width:1180px){.rel-title-row h1{font-size:22px}.rel-gates{grid-template-columns:minmax(0,1fr)}}
@media (max-width:900px){.rel-root{padding:12px 12px 22px}.rel-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.rel-facts{grid-template-columns:minmax(0,1fr)}.rel-r{grid-template-columns:minmax(0,1fr) auto;row-gap:2px}.rel-r .rel-rsub{grid-column:1/-1}}
`;

export function injectReleasesStyle(){
  if(typeof document==='undefined')return false;
  if(document.getElementById(STYLE_ID))return true;
  const style=document.createElement('style');
  style.id=STYLE_ID;style.textContent=RELEASES_STYLE;
  document.head.append(style);return true;
}

/* ─────────────────────────── view model ─────────────────────────── */
                                   
                                                                                               
                                                                                    
 
export function initialViewState()                  {
  return {query:'',stateFilter:null,channels:new Set(),sort:'newest',selectedId:null,recordsTab:'files',problemsOnly:false};
}

                                                                                             
                                 
                                                                                                                
                                                                                                                                                                    
                                                                                            
                       
 

export function stateKeyOf(view              ){return view.state}

const STATE_FILTERS=[
  {key:'all',label:'paneTitle'},
  {key:'draft',label:'s_draft'},
  {key:'candidate',label:'candidatesTitle'},
  {key:'ready',label:'s_ready'},
  {key:'held',label:'s_held'},
  {key:'released',label:'s_released'},
  {key:'rolledBack',label:'s_rolledBack'}
];

export function matchesState(state             ,filter            ){
  if(!filter||filter==='all')return true;
  if(filter==='candidate')return state==='draft'||state==='ready'||state==='readyWarning'||state==='held';
  if(filter==='ready')return state==='ready'||state==='readyWarning';
  return state===filter;
}

/* ─────────────────────────── render helpers ─────────────────────────── */
const fmtTs=(iso    )=>{if(!iso||iso==='—')return '—';const s=String(iso).replace('T',' ');return s.slice(0,16)};
const fact=(locale       ,label       ,value    ,opts                                                      ={})=>{
  const shown=value===null||value===undefined||value===''?'—':String(value);
  const body=opts.raw?shown:opts.bdi?`<bdi dir="ltr">${esc(shown)}</bdi>`:esc(shown);
  return `<div class="rel-f${opts.span?' rel-span':''}"><span>${esc(t(label,locale))}</span><strong title="${esc(shown)}">${body}</strong>${opts.sub?`<small>${esc(opts.sub)}</small>`:''}</div>`;
};
const block=(title       ,meta       ,body       )=>`<section class="rel-block"><header class="rel-block-h"><h2>${esc(title)}</h2>${meta?`<span class="rel-meta">${esc(meta)}</span>`:''}</header>${body}</section>`;
const mark=(state          ,locale       )=>`<span class="rel-mark" data-tone="${GATE_TONE[state]}" role="img" aria-label="${esc(t(GATE_LABEL[state],locale))}">${GATE_MARK[state]}</span>`;
const toneOf=(state          )=>GATE_TONE[state];

/* ─────────────────────────── center: candidate workbench ─────────────────────────── */
function renderEmptySelection(ctx                ){
  const L=ctx.locale,none=ctx.filtered.length===0&&ctx.counts.total>0;
  return `<div class="rel-root">
    <header class="rel-head"><div class="rel-head-main">
      <span class="rel-eyebrow">${esc(t('eyebrow',L))}</span>
      <div class="rel-title-row"><h1>${esc(none?t('noMatches',L):t('emptySelection',L))}</h1><span class="rel-badge" data-tone="muted">${esc(none?t('noMatches',L):t('emptySelection',L))}</span></div>
      <p class="rel-sub">${esc(t('purpose',L))}</p>
    </div></header>
    <section class="rel-empty">
      <strong>${esc(none?t('noMatches',L):t('emptySelection',L))}</strong>
      <p>${esc(none?t('noMatchesHint',L):t('emptySelectionHint',L))}</p>
      ${none?`<button type="button" class="rel-toggle" data-rel-clear>${esc(t('clearFilters',L))}</button>`:''}
    </section>
    <p class="rel-foot">${icon('info')}<span>${esc(RECORD_BASIS)}</span></p>
  </div>`;
}

function renderTruthBar(ctx                ){
  const L=ctx.locale,sel=ctx.selected ,d=sel.domain||{};
  const items=[
    {key:'ax_state',value:t(`dv_${d.state||'UNKNOWN'}`,L),owner:'candidate-bound evidence',tone:sel.state==='held'?'bad':sel.state==='draft'?'muted':'ok'},
    {key:'ax_authorization',value:t(`dv_${d.authorization||'NONE'}`,L),owner:'explicit authority record',tone:d.authorization==='GRANTED'?'ok':d.authorization==='REVOKED'?'bad':'warn'},
    {key:'ax_deployment',value:t(`dv_${d.deployment||'UNKNOWN'}`,L),owner:'separate deployment provider',tone:d.deployment==='DEPLOYED'?'ok':d.deployment==='FAILED'?'bad':'muted'}
  ];
  return `<section class="rel-truths" aria-label="${esc(t('ax_state',L))} · ${esc(t('ax_authorization',L))} · ${esc(t('ax_deployment',L))}">
    ${items.map(item=>`<div class="rel-truth" data-tone="${item.tone}">
      <span class="rel-truth-l">${esc(t(item.key,L))}</span>
      <strong class="rel-truth-v">${esc(item.value)}</strong>
      <small class="rel-truth-o">${esc(item.owner)} · ${esc(t('axisNote',L))}</small>
    </div>`).join('')}
  </section>`;
}

function renderIdentity(ctx                ){
  const L=ctx.locale,r=ctx.selected .record;
  const body=`<div class="rel-facts">
    ${fact(L,'f_candidate',r.candidateId,{bdi:true})}
    ${fact(L,'f_created',fmtTs(r.createdAt),{bdi:true})}
    ${fact(L,'f_author',r.createdBy,{bdi:true})}
    ${fact(L,'f_edited',fmtTs(r.editedAt),{bdi:true})}
  </div>`;
  return block(t('identity',L),r.domainVersion?t('unknownDetail',L):'CANDIDATE-BOUND',body);
}

function renderSource(ctx                ){
  const L=ctx.locale,b=ctx.selected .record.build;
  const ci=`<span class="rel-rstate" style="color:${b.ci==='ok'?'#7ee2b4':'#ff9ba4'}">${b.ci==='ok'?'✓':'✕'} ${esc(b.ci==='ok'?t('st_pass',L):t('st_fail',L))}</span>`;
  const body=`<div class="rel-facts">
      ${fact(L,'f_build',b.id,{bdi:true})}
      ${fact(L,'f_branch',b.branch,{bdi:true})}
      ${fact(L,'f_commit',b.commit,{bdi:true})}
      ${fact(L,'f_verified',b.verifiedAt,{bdi:true})}
      <div class="rel-f"><span>${esc(t('f_ci',L))}</span><strong>${ci}</strong></div>
    </div>
    ${b.irreversible?`<p class="rel-note">${icon('warn')}<span>${esc(t('f_irreversible',L))}</span></p>`:''}`;
  return block(t('source',L),b.ci==='ok'?t('st_pass',L):t('st_fail',L),body);
}

function renderScope(ctx                ){
  const L=ctx.locale,s=ctx.selected .record.scope;
  const metric=(value       ,label       )=>`<div class="rel-metric"><b>${value}</b><span>${esc(t(label,L))}</span></div>`;
  const body=`<div class="rel-metrics">
      ${metric(s.components,'f_components')}${metric(s.services,'f_services')}${metric(s.artifacts,'f_artifacts')}${metric(s.checks,'f_checks')}
    </div><p class="rel-note">${icon('list')}<span>${esc(t('scopeNote',L))}</span></p>`;
  return block(t('scope',L),`CANDIDATE ${ctx.selected .record.version}`,body);
}

function renderStages(ctx                ){
  const L=ctx.locale,st=ctx.selected .record.stages;
  const order=['draft','validating','ready','promoted','released']         ;
  const currentIndex=order.indexOf(st.current);
  const pipe=order.map((key,index)=>{
    const done=index<currentIndex||st.current==='released'&&index<=currentIndex;
    const current=index===currentIndex&&!st.rolledBack;
    const fail=st.rolledBack&&index===currentIndex;
    return `${index?'<span class="rel-conn" aria-hidden="true"></span>':''}<span class="rel-step" data-done="${done||current}" data-current="${current}" data-fail="${fail}">${fail?'✕':done?'✓':'○'} ${esc(t(STAGE_KEYS[index],L))}</span>`;
  }).join('');
  const branches=`<div class="rel-branches">
    ${st.held?`<span class="rel-branch" data-tone="warn">${icon('lock')} ${esc(t('branch_hold',L))}</span>`:''}
    ${st.rolledBack?`<span class="rel-branch" data-tone="bad">${icon('return')} ${esc(t('branch_rollback',L))}</span>`:''}
    <span class="rel-branch">${icon('shield')} ${esc(t('ax_deployment',L))}: ${esc(t(`dv_${ctx.selected .domain?.deployment||'UNKNOWN'}`,L))}</span>
  </div>`;
  return block(t('stages',L),`${currentIndex+1}/5`,`<div class="rel-pipe">${pipe}</div>${branches}`);
}

function renderNotes(ctx                ){
  const L=ctx.locale,notes=ctx.selected .record.notes;
  if(!notes.length)return block(t('notes',L),t('unknownDetail',L),`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`);
  const body=`<ul class="rel-notes">${notes.map(note=>`<li><span>${esc(note[L])}</span></li>`).join('')}</ul>`;
  return block(t('notes',L),`${notes.length}`,body);
}

function renderGates(ctx                ){
  const L=ctx.locale,gates=ctx.selected .record.gates;
  if(!gates.length)return block(t('gates',L),t('unknownDetail',L),`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`);
  const pass=gates.filter(g=>g.state==='pass').length;
  const body=`<div class="rel-gates">${gates.map(g=>`<div class="rel-gate" data-tone="${toneOf(g.state)}">${mark(g.state,L)}<span>${esc(t(g.key,L))}</span></div>`).join('')}</div>`;
  return block(t('gates',L),`${pass}/${gates.length} ${t('st_pass',L)}`,body);
}

function renderResults(ctx                ){
  const L=ctx.locale,view=ctx.view,results=ctx.selected .record.results;
  if(!results.length)return block(t('results',L),t('unknownDetail',L),`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`);
  const problems=results.filter(r=>r.state==='fail'||r.state==='warn');
  const shown=view.problemsOnly?problems:results;
  const rows=shown.map(item=>`<div class="rel-r" data-tone="${toneOf(item.state)}">
      <span class="rel-rmain">${esc(t(item.key,L))}</span>
      <span class="rel-rsub"><bdi dir="ltr">${esc(item.detail)}</bdi></span>
      <span class="rel-rstate">${mark(item.state,L)} ${esc(t(GATE_LABEL[item.state],L))}</span>
    </div>`).join('');
  const body=`<div class="rel-toolbar-row">
      <span class="rel-meta">${results.filter(r=>r.state==='pass').length}/${results.length} ${esc(t('st_pass',L))}</span>
      <button type="button" class="rel-toggle" data-rel-problems aria-pressed="${view.problemsOnly}" ${problems.length?'':'disabled'}>${esc(t('onlyProblems',L))}</button>
    </div>
    <div class="rel-rows">${rows||`<p class="rel-note">${icon('check')}<span>${esc(t('st_pass',L))} · 0</span></p>`}</div>`;
  return block(t('results',L),`${results.length}`,body);
}

function renderRollback(ctx                ){
  const L=ctx.locale,rb=ctx.selected .record.rollback;
  const tone=rb.state==='ready'?'ok':rb.state==='partial'?'warn':'bad';
  const label=rb.state==='ready'?t('st_pass',L):rb.state==='partial'?t('st_warn',L):t('st_fail',L);
  const body=`<div class="rel-facts">
      <div class="rel-f"><span>${esc(t('rollback',L))}</span><strong><span class="rel-mark" data-tone="${tone}" aria-hidden="true">${tone==='ok'?'✓':'!'}</span> ${esc(label)}</strong></div>
      ${fact(L,'f_previous',rb.previous,{bdi:true})}
      ${fact(L,'f_plan',t(rb.plan,L))}
      ${fact(L,'f_estimate',rb.minutes===null?t('noEstimate',L):`${rb.minutes} ${t('minutes',L)}`)}
    </div>`;
  return block(t('rollback',L),label.toUpperCase(),body);
}

function renderApprovers(ctx                ){
  const L=ctx.locale,approvers=ctx.selected .record.approvers;
  if(!approvers.length)return block(t('approvers',L),t('unknownDetail',L),`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`);
  const granted=approvers.filter(a=>a.state==='granted').length;
  const rows=approvers.map(a=>{
    const tone=a.state==='granted'?'ok':a.state==='missing'?'bad':'warn';
    const iconId=a.state==='granted'?'shield':a.state==='missing'?'close':'history';
    return `<div class="rel-r" data-tone="${tone}">
      <span class="rel-rmain">${esc(t(a.role,L))}</span>
      <span class="rel-rsub"><bdi dir="ltr">${esc(a.person)}</bdi></span>
      <span class="rel-rstate">${icon(iconId)} ${esc(t(`st_${a.state}`,L))}</span>
    </div>`}).join('');
  return block(t('approvers',L),`${granted}/${approvers.length} ${t('st_granted',L)}`,`<div class="rel-rows">${rows}</div>`);
}

function renderRecords(ctx                ){
  const L=ctx.locale,view=ctx.view,record=ctx.selected .record;
  const tabs=[['files','tabFiles'],['events','tabEvents'],['package','tabPackage']]         ;
  const tabBar=tabs.map(([key,label])=>`<button type="button" class="rel-tab" role="tab" data-rel-tab="${key}" aria-selected="${view.recordsTab===key}">${esc(t(label,L))}</button>`).join('');
  let body='';
  if(view.recordsTab==='files'){
    body=record.files.length?`<div class="rel-rows">
      <div class="rel-r" data-tone="muted"><span class="rel-rmain">${esc(t('f_path',L))}</span><span class="rel-rsub">${esc(t('f_kind',L))} · ${esc(t('f_now',L))} · ${esc(t('f_before',L))}</span><span class="rel-rstate">${esc(t('f_delta',L))}</span></div>
      ${record.files.map(file=>`<div class="rel-r" data-tone="${file.tone}">
        <span class="rel-rmain"><bdi dir="ltr">${esc(file.path)}</bdi></span>
        <span class="rel-rsub">${esc(t(`kind_${file.kind}`,L))} · <bdi dir="ltr">${esc(file.now)} · ${esc(file.before)}</bdi></span>
        <span class="rel-rstate"><bdi dir="ltr">${esc(file.delta)}</bdi></span>
      </div>`).join('')}</div>`:`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`;
  }else if(view.recordsTab==='events'){
    body=record.events.length?`<div class="rel-rows">${record.events.map(event=>`<div class="rel-r" data-tone="${event.ok?'ok':'bad'}">
      <span class="rel-rmain"><bdi dir="ltr">${esc(event.at)}</bdi></span>
      <span class="rel-rsub">${esc(t(event.key,L))}</span>
      <span class="rel-rstate">${event.ok?'✓':'✕'} ${esc(event.ok?t('st_pass',L):t('st_fail',L))}</span>
    </div>`).join('')}</div>`:`<p class="rel-note">${icon('info')}<span>${esc(t('unknownDetail',L))}</span></p>`;
  }else{
    const ps=record.packageState;
    body=`<div class="rel-facts">
      <div class="rel-f rel-span"><span>${esc(t('tabPackage',L))}</span><strong><span class="rel-mark" data-tone="${ps.state==='ok'?'ok':ps.state==='bad'?'bad':'warn'}" aria-hidden="true">${ps.state==='ok'?'✓':ps.state==='bad'?'✕':'!'}</span> ${esc(t(ps.key,L))}</strong></div>
      ${fact(L,'f_build',record.build.id,{bdi:true})}
      ${fact(L,'f_verified',fmtTs(record.build.verifiedAt),{bdi:true})}
      ${fact(L,'f_ci',record.build.ci==='ok'?t('st_pass',L):t('st_fail',L))}
      ${fact(L,'f_commit',record.build.commit,{bdi:true})}
    </div>`;
  }
  return block(t('records',L),t(['tabFiles','tabEvents','tabPackage'][tabs.findIndex(x=>x[0]===view.recordsTab)],L),`<div class="rel-tabs" role="tablist">${tabBar}</div>${body}`);
}

export function renderCenter(ctx                ){
  const L=ctx.locale;
  if(!ctx.selected)return renderEmptySelection(ctx);
  const r=ctx.selected.record;
  const compareChip=`<span class="rel-chip" data-tone="${ctx.compare.available?'ok':'bad'}" title="${esc(ctx.compare.reason)}">${icon(ctx.compare.available?'ref':'lock')} ${esc(t('compareTruth',L))}: ${esc(ctx.compare.available?t('compareReady',L):t('compareBlocked',L))}</span>`;
  return `<div class="rel-root">
    <header class="rel-head">
      <div class="rel-head-main">
        <span class="rel-eyebrow">${esc(t('candidateEyebrow',L))} · <bdi dir="ltr">${esc(r.version)}</bdi></span>
        <div class="rel-title-row">
          <h1><bdi dir="ltr">${esc(r.candidateId)}</bdi></h1>
          <span class="rel-badge" data-tone="${STATE_TONE[ctx.selected.state]}">${esc(t(STATE_LABEL[ctx.selected.state],L))}</span>
          ${compareChip}
        </div>
        <p class="rel-sub">${esc(t('purpose',L))}</p>
      </div>
    </header>
    <section class="rel-strip">
      ${fact(L,'f_version',r.version,{bdi:true})}
      ${fact(L,'f_channel',t(CHANNEL_LABEL[r.channel],L))}
      ${fact(L,'f_target',t(`tgt_${r.target}`,L))}
      ${fact(L,'f_authorization',t(`dv_${(ctx.selected.domain||{}).authorization||'NONE'}`,L))}
    </section>
    ${renderTruthBar(ctx)}
    <section class="rel-grid">
      <div class="rel-col">
        ${renderIdentity(ctx)}
        ${renderSource(ctx)}
        ${renderScope(ctx)}
        ${renderStages(ctx)}
        ${renderNotes(ctx)}
      </div>
      <div class="rel-col">
        ${renderGates(ctx)}
        ${renderResults(ctx)}
        ${renderRollback(ctx)}
        ${renderApprovers(ctx)}
      </div>
    </section>
    ${renderRecords(ctx)}
    <p class="rel-foot">${icon('info')}<span>${esc(RECORD_BASIS)}</span></p>
  </div>`;
}

/* ─────────────────────────── left: structure + candidate list ─────────────────────────── */
export function renderLeft(ctx                ){
  const L=ctx.locale,view=ctx.view;
  const stateRows=STATE_FILTERS.filter(f=>f.key!=='all').map(f=>{
    const entry=ctx.counts.states.find(s=>s.key===f.key);
    const active=view.stateFilter===f.key;
    const tone=f.key==='released'||f.key==='ready'?'ok':f.key==='held'||f.key==='rolledBack'?'bad':f.key==='candidate'?'warn':'muted';
    return `<li><button type="button" class="rel-state" data-rel-state="${esc(f.key)}" aria-pressed="${active}">
      <span class="dot" data-tone="${tone}" style="background:${tone==='ok'?'#53d694':tone==='bad'?'#ff6d78':tone==='warn'?'#f4bd65':'#8298aa'}"></span>
      <span class="lbl">${esc(t(f.label,L))}</span>
      <span class="cnt">${entry?entry.count:0}</span>
    </button></li>`}).join('');
  const channels=ctx.counts.channels.map(c=>`<button type="button" class="rel-chan" data-rel-chan="${c.key}" aria-pressed="${view.channels.has(c.key)}">${esc(t(CHANNEL_LABEL[c.key],L))} <b>${c.count}</b></button>`).join('');
  const environments=ctx.counts.environments.map(e=>`<span class="rel-env">${icon('folder')} ${esc(t(ENV_LABEL[e.key],L))}<span class="cnt">${e.count}</span></span>`).join('');
  const cards=ctx.filtered.map(item=>`<li><button type="button" class="rel-cand" data-rel-cand="${esc(item.record.candidateId)}" aria-current="${item.record.candidateId===view.selectedId}">
      <span class="top"><bdi class="cid" dir="ltr">${esc(item.record.candidateId)}</bdi>${icon(STATE_ICON[item.state])}</span>
      <span class="meta"><bdi dir="ltr">${esc(item.record.version)}</bdi><span aria-hidden="true">·</span>${esc(t(CHANNEL_LABEL[item.record.channel],L))}<span aria-hidden="true">·</span>${esc(t(ENV_LABEL[item.record.environment],L))}</span>
      <span class="foot"><span class="mini" data-tone="${STATE_TONE[item.state]}">${esc(t(STATE_LABEL[item.state],L))}</span><span class="age">${esc(item.age)}</span></span>
    </button></li>`).join('');
  const empty=`<div class="rel-empty-compact"><strong>${esc(t('noMatches',L))}</strong><p>${esc(t('noMatchesHint',L))}</p><button type="button" class="rel-toggle" data-rel-clear>${esc(t('clearFilters',L))}</button></div>`;
  const activeFilters=Boolean(view.query||view.stateFilter||view.channels.size);
  return `<section class="rel-pane" data-w05-owned="releases">
    <header class="rel-pane-h">
      <p>${esc(t('purpose',L))}</p>
    </header>
    <div class="rel-tools">
      <label class="rel-search">${icon('search')}<input type="search" data-rel-search value="${esc(view.query)}" placeholder="${esc(t('searchPlaceholder',L))}" aria-label="${esc(t('searchPlaceholder',L))}"></label>
      <select class="rel-sort" data-rel-sort aria-label="${esc(t('sortNewest',L))}">
        <option value="newest"${view.sort==='newest'?' selected':''}>${esc(t('sortNewest',L))}</option>
        <option value="oldest"${view.sort==='oldest'?' selected':''}>${esc(t('sortOldest',L))}</option>
        <option value="state"${view.sort==='state'?' selected':''}>${esc(t('sortState',L))}</option>
      </select>
    </div>
    <nav class="rel-sec" aria-label="${esc(t('statesTitle',L))}">
      <div class="rel-sec-h"><h3>${esc(t('statesTitle',L))}</h3>${activeFilters?`<button type="button" class="rel-toggle" data-rel-clear>${esc(t('clearFilters',L))}</button>`:`<span>${ctx.counts.total}</span>`}</div>
      <ul class="rel-states">${stateRows}</ul>
    </nav>
    <section class="rel-sec" aria-label="${esc(t('channelsTitle',L))}">
      <div class="rel-sec-h"><h3>${esc(t('channelsTitle',L))}</h3></div>
      <div class="rel-chans">${channels}</div>
    </section>
    <section class="rel-sec" aria-label="${esc(t('environmentsTitle',L))}">
      <div class="rel-sec-h"><h3>${esc(t('environmentsTitle',L))}</h3></div>
      <div class="rel-envs">${environments}</div>
    </section>
    <section class="rel-list rel-sec" aria-label="${esc(t('candidatesTitle',L))}">
      <div class="rel-sec-h"><h3>${esc(t('candidatesTitle',L))}</h3><span>${ctx.filtered.length}/${ctx.counts.total}</span></div>
      <ul class="rel-cands">${cards}</ul>
      ${ctx.filtered.length?'':empty}
    </section>
  </section>`;
}

/* ─────────────────────────── right: current release context ─────────────────────────── */
export function renderRight(ctx                ){
  const L=ctx.locale;
  if(!ctx.selected){
    return `<section class="rel-ctx" data-w05-owned="releases">
      <header class="rel-ctx-h"><span class="rel-eyebrow">${esc(t('context',L))}</span></header>
      <div class="rel-empty-compact"><strong>${esc(t('emptySelection',L))}</strong><p>${esc(t('emptySelectionHint',L))}</p></div>
    </section>`;
  }
  const record=ctx.selected.record,d=ctx.selected.domain||{},state=ctx.selected.state;
  const missing=record.approvers.filter(a=>a.state==='missing');
  const pending=record.approvers.filter(a=>a.state==='pending');
  const results=record.results,passed=results.filter(r=>r.state==='pass').length;
  const blocked=d.authorization!=='GRANTED';
  const blockerTone=missing.length||d.authorization==='REVOKED'?'bad':blocked?'warn':'ok';
  const blockerTitle=missing.length?t(missing[0].role,L)+' · '+t('st_missing',L):blocked?t('ax_authorization',L)+' · '+t(`dv_${d.authorization}`,L):t('st_pass',L)+' · '+t('blocker',L);
  const blockerNote=missing.length?`${missing.map(a=>t(a.role,L)).join(' · ')}`:record.interpretation.note[L];
  const nextLabel=state==='rolledBack'?t('branch_rollback',L):state==='released'?t('s_released',L):d.authorization==='NONE'?t('dv_REQUESTED',L):t(`dv_${d.authorization}`,L);
  return `<section class="rel-ctx" data-w05-owned="releases">
    <header class="rel-ctx-h">
      <div class="rel-chips"><bdi class="rel-smallchip" dir="ltr">${esc(record.candidateId)}</bdi><span class="rel-smallchip" data-tone="${STATE_TONE[state]==='ok'?'ok':STATE_TONE[state]==='warn'?'warn':'bad'}">${esc(t(STATE_LABEL[state],L))}</span></div>
    </header>
    <div class="rel-ctx-item" data-tone="${blockerTone}">
      ${icon(blockerTone==='ok'?'check':'warn')}
      <span class="body"><strong>${esc(blockerTitle)}</strong><span>${esc(blockerNote)}</span></span>
      <span class="cnt">${missing.length||d.authorization!=='GRANTED'?1:0}</span>
    </div>
    <div class="rel-ctx-item" data-tone="${results.length&&passed===results.length?'ok':passed?'warn':'bad'}">
      ${icon('check')}
      <span class="body"><strong>${esc(t('verificationsOk',L))}</strong><span>${esc(t('results',L))}</span></span>
      <span class="cnt">${passed}/${results.length}</span>
    </div>
    <div class="rel-ctx-item" data-tone="${missing.length+pending.length?'warn':'ok'}">
      ${icon('shield')}
      <span class="body"><strong>${esc(t('approvalsOpen',L))}</strong><span>${esc(t('approvers',L))}</span></span>
      <span class="cnt">${missing.length+pending.length}</span>
    </div>
    <div class="rel-ctx-kv">
      <div class="rel-sec-h"><h3>${esc(t('expectedScope',L))}</h3></div>
      <div class="row"><span>${esc(t('f_components',L))}</span><b>${record.scope.components}</b></div>
      <div class="row"><span>${esc(t('f_services',L))}</span><b>${record.scope.services}</b></div>
      <div class="row"><span>${esc(t('f_checks',L))}</span><b>${record.scope.checks}</b></div>
    </div>
    <div class="rel-ctx-item" data-tone="${record.rollback.state==='ready'?'ok':record.rollback.state==='partial'?'warn':'bad'}">
      ${icon('return')}
      <span class="body"><strong>${esc(t('rollbackNote',L))}</strong><span><bdi dir="ltr">${esc(record.rollback.previous)}</bdi> · ${esc(t(record.rollback.plan,L))} · ${record.rollback.minutes===null?esc(t('noEstimate',L)):`<bdi dir="ltr">${record.rollback.minutes} ${esc(t('minutes',L))}</bdi>`}</span></span>
    </div>
    <div class="rel-ctx-kv">
      <div class="rel-sec-h"><h3>${esc(t('risks',L))}</h3></div>
      <div class="rel-chips">${record.risks.map(risk=>`<span class="rel-smallchip" data-tone="${risk.tone}">${esc(t(risk.key,L))}: <bdi dir="ltr">${esc(risk.value)}</bdi></span>`).join('')||`<span class="rel-smallchip">${esc(t('unknownDetail',L))}</span>`}</div>
    </div>
    <div class="rel-ctx-kv">
      <div class="rel-sec-h"><h3>${esc(t('interpretation',L))}</h3></div>
      <div class="rel-ctx-flow"><span>${esc(t(ENV_LABEL[record.interpretation.from],L))}</span><span class="arrow" aria-hidden="true">→</span><span>${esc(t(ENV_LABEL[record.interpretation.to],L))}</span></div>
      <p class="rel-note" style="margin-top:2px">${icon('info')}<span>${esc(record.interpretation.note[L])}</span></p>
    </div>
    <div class="rel-ctx-next">
      <strong>${esc(t('nextAction',L))}: ${esc(nextLabel)}</strong>
      <p>${esc(record.interpretation.note[L])}</p>
      <span class="rel-chips"><span class="rel-smallchip" data-tone="${ctx.compare.available?'ok':'bad'}">${esc(t('compareTruth',L))}: ${esc(ctx.compare.available?t('compareReady',L):t('compareBlocked',L))}</span><span class="rel-smallchip" data-tone="${d.deployment==='DEPLOYED'?'ok':'warn'}">${esc(t('ax_deployment',L))}: ${esc(t(`dv_${d.deployment||'UNKNOWN'}`,L))}</span></span>
    </div>
  </section>`;
}

/* ─────────────────────────── toolbar + banner ─────────────────────────── */
export const TOOLBAR_COMMANDS=Object.freeze(['releases.inspect','releases.compare','releases.plan','releases.requestAuthorization','foundation.settings']);
const TOOLBAR_LABELS                                     ={
  'releases.inspect':{ar:'فحص المرشح',en:'Inspect candidate'},
  'releases.compare':{ar:'مقارنة زوج مطابق',en:'Compare exact pair'},
  'releases.plan':{ar:'خطة الإصدار',en:'Release plan'},
  'releases.requestAuthorization':{ar:'طلب تخويل المالك',en:'Request Owner authorization'},
  'foundation.settings':{ar:'الإعدادات',en:'Settings'}
};
export function toolbarLabelFor(id       ,locale       ){return TOOLBAR_LABELS[id]?TOOLBAR_LABELS[id][locale]:null}
export function localizeToolbar(host                ,locale       ){
  if(!host)return false;
  let changed=false;
  host.querySelectorAll('[data-foundation-command]').forEach(node=>{
    const label=toolbarLabelFor((node               ).dataset.foundationCommand||'',locale);
    if(label&&node.textContent!==label){node.textContent=label;changed=true}
  });
  return changed;
}
export function bannerCopy(locale       ){
  return {title:locale==='ar'?'إدارة الإصدارات':'Release management',
    detail:locale==='ar'?'الجاهزية التقنية والتخويل ومراقبة النشر — ثلاث حقائق منفصلة':'Technical readiness, Owner authorization and deployment observation — three separate truths',
    badge:locale==='ar'?'الإصدارات':'Releases'};
}
