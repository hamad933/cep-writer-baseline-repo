/* CONFIGURATION SURFACE PRESENTATION — surface-specific composition + surface-specific
 * presentation on top of SHARED MECHANICS (workspace regions, toolbar, semantic command bus).
 *
 * Construction authority: cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/
 * CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png (OWNER_CONFIRMED_FINAL_REFERENCE).
 * Borrowed from it: the revision-control composition — action strip, revision identity facts,
 * domains/keys table with filters, tabbed diff workspace with a change-summary rail, and a
 * right-hand revision inspector (impact · dependencies · validation · publish readiness).
 * NOT borrowed: any other surface's composition, and not the reference's language (the reference
 * establishes visual intent only — this surface renders in the ACTIVE product language).
 */

import {
  CONFIGURATION_DOMAINS,CONFIGURATION_REVISION_BASIS,REVISION_PROFILES,REVISION_LINEAGE,
  CONFIGURATION_AUTHORITIES,AFFECTED_SURFACES,REVISION_TABS,
  domainById,type DraftChange,type DraftSummary,type RevisionTab
} from './revision-model.js';

export const CONFIGURATION_SURFACE_OWNER='W05-CONFIGURATION';
export const BASE_REVISION='CFG-REV-0042';
export const DRAFT_REVISION='CFG-REV-0043-DRAFT';
export const NEXT_REVISION='CFG-REV-0043';
export const REVISION_PROFILE=REVISION_PROFILES[0];

const ICON=`i-`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=id=>`<svg class="icon sm cfg-icon" aria-hidden="true"><use href="#${ICON}${esc(id.replace(/^i-/,''))}"></use></svg>`;

type Locale='ar'|'en';
const T={
  eyebrow:{ar:'مساحة العمل · الإعداد',en:'Workspace · Configuration'},
  title:{ar:'تحرير ومراجعة إعدادات المنصة',en:'Edit and review platform configuration'},
  subtitle:{ar:'إعداد ثم مراجعة ثم نشر — التفضيلات تُنشر فورًا، والإعداد التشغيلي يبقى خلف سلطة تطبيق صريحة.',en:'Configure, then review, then publish — preferences publish immediately, operational configuration stays behind an explicit apply authority.'},
  draftChip:{ar:'مسودة',en:'Draft'},
  lastSaved:{ar:'آخر حفظ',en:'Last saved'},
  lastSavedValue:{ar:'قبل 4 دقائق',en:'4 minutes ago'},
  factBase:{ar:'المستند إليه',en:'Based on'},
  factDraft:{ar:'مسودة الإصدار',en:'Draft revision'},
  factProfile:{ar:'ملف الإعداد',en:'Configuration profile'},
  domainsTitle:{ar:'المجالات والمفاتيح',en:'Domains & keys'},
  domainsNote:{ar:'اختر مجالًا لتحريره ومقارنة فروقه. القيم المعروضة للتفضيلات حيّة، والمفاتيح التشغيلية مُصَرَّفة بوصفها سجلًا تمثيليًا.',en:'Pick a domain to edit and diff. Preference values shown are live; operational keys are redacted representative records.'},
  filterAll:{ar:'كل الأقسام',en:'All sections'},
  filterPreference:{ar:'تفضيلات',en:'Preferences'},
  filterOperational:{ar:'تشغيلي',en:'Operational'},
  searchPlaceholder:{ar:'ابحث في الإعدادات…',en:'Search configuration…'},
  colDomain:{ar:'المجال',en:'Domain'},
  colModified:{ar:'آخر تعديل',en:'Last modified'},
  colChanges:{ar:'التغير',en:'Changes'},
  colStatus:{ar:'الحالة',en:'Status'},
  statusModified:{ar:'مسودة تغيير',en:'Draft change'},
  statusClean:{ar:'بلا تغيير',en:'No change'},
  statusPendingAuthority:{ar:'بانتظار السلطة',en:'Authority pending'},
  tabDiff:{ar:'الفروق',en:'Diff'},
  tabLog:{ar:'سجل المراجعة',en:'Revision log'},
  tabObservations:{ar:'المفاتيح المُصَرَّفة',en:'Observed keys'},
  diffBaseHeader:{ar:'السابق',en:'Base'},
  diffDraftHeader:{ar:'المسودة',en:'Draft'},
  diffEmpty:{ar:'لا توجد فروق في هذا المجال بين المصدرين.',en:'No differences in this domain between the two revisions.'},
  diffEmptyHint:{ar:'الصِق تغييرًا من المجالات الأخرى أو عدّل التفضيلات من مركز الإعدادات.',en:'Draft a change from another domain, or adjust preferences in the Settings center.'},
  summaryTitle:{ar:'ملخص التغييرات',en:'Change summary'},
  summaryTotal:{ar:'إجمالي التغييرات',en:'Total changes'},
  summaryAdd:{ar:'إضافات',en:'Additions'},
  summaryModify:{ar:'تغييرات',en:'Modifications'},
  summaryDelete:{ar:'حذوفات',en:'Deletions'},
  pointsTitle:{ar:'نقاط التغيير',en:'Change points'},
  pointsNote:{ar:'مجالات مضبوطة في هذه المسودة',en:'Domains touched in this draft'},
  logTitle:{ar:'سجل المراجعة',en:'Revision log'},
  logNote:{ar:'الوقائع المسجّلة لهذه المسودة — لا يُستنتج منها تطبيق.',en:'Recorded events for this draft — no application is inferred from them.'},
  obsTitle:{ar:'المفاتيح التشغيلية المُصَرَّفة',en:'Observed operational keys'},
  obsNote:{ar:'قيم مُصَرَّفة من سجل ممثيلي؛ الحاضر ليس المعتمد، والقراءة لا تُعدّ تطبيقًا.',en:'Redacted values from a representative record; present is not approved, and reading is not applying.'},
  colKey:{ar:'المفتاح',en:'Key'},
  colValue:{ar:'القيمة الحاضرة',en:'Present value'},
  colSource:{ar:'المصدر',en:'Source'},
  colObserved:{ar:'رُصد',en:'Observed'},
  colState:{ar:'الحالة',en:'State'},
  restart:{ar:'يتطلب إعادة تشغيل',en:'Restart required'},
  yes:{ar:'نعم',en:'Yes'},
  no:{ar:'لا',en:'No'},
  basisTitle:{ar:'أساس السجل',en:'Record basis'},
  leftTitle:{ar:'إدارة الإعدادات',en:'Configuration control'},
  leftNote:{ar:'التحكم في المجالات ونقاط المراجعة والسلطات',en:'Control domains, revision points and authorities'},
  leftDomains:{ar:'المجالات',en:'Domains'},
  leftLineage:{ar:'نقاط المراجعة',en:'Revision points'},
  leftAuthorities:{ar:'السلطات',en:'Authorities'},
  rightTitle:{ar:'مسودة الإصدار الحالية',en:'Current revision draft'},
  rightRevisionLabel:{ar:'مسودة مفتوحة',en:'Open draft'},
  rightImpact:{ar:'تأثير التغييرات الحالية',en:'Impact of current changes'},
  rightImpactLevel:{ar:'مستوى التأثير',en:'Impact level'},
  rightAlerts:{ar:'تنبيهات الاعتماد',en:'Dependency alerts'},
  rightAffected:{ar:'الأسطح المتأثرة',en:'Affected surfaces'},
  rightAffectedComponents:{ar:'المكوّنات المتأثرة',en:'Affected components'},
  rightRequirements:{ar:'متطلبات التطبيق',en:'Application requirements'},
  rightValidation:{ar:'تأكيد التحقق',en:'Validation confirmation'},
  rightReadiness:{ar:'جاهزية النشر',en:'Publish readiness'},
  rightPublishNotes:{ar:'ملاحظات النشر',en:'Publish notes'},
  rightAuthor:{ar:'مالك السطح',en:'Surface owner'},
  viewFullReport:{ar:'عرض السجل الكامل',en:'Open full log'},
  openAll:{ar:'عرض الكل',en:'Show all'},
  noAlerts:{ar:'لا توجد تنبيهات اعتماد مفتوحة.',en:'No open dependency alerts.'},
  validationPending:{ar:'لم يُتحقق بعد',en:'Not validated yet'},
  validationOk:{ar:'تم التحقق من التغييرات المنشورة',en:'Publishable changes validated'},
  readinessNote:{ar:'يُنشر بعد مطابقة التفضيلات المؤكدة',en:'Publishes once confirmed preference changes match'},
  publishNote:{ar:'بعد النشر يُصدر',en:'Publishes as'},
  impactHigh:{ar:'مرتفع',en:'High'},
  impactMedium:{ar:'متوسط',en:'Medium'},
  impactLow:{ar:'منخفض',en:'Low'},
  scopePreference:{ar:'تفضيل',en:'Preference'},
  scopeOperational:{ar:'تشغيلي',en:'Operational'},
  cmdSave:{ar:'حفظ المسودة',en:'Save draft'},
  cmdValidate:{ar:'تحقق',en:'Validate'},
  cmdCompare:{ar:'مقارنة الإصدارات',en:'Compare revisions'},
  cmdPublish:{ar:'نشر الإصدار',en:'Publish revision'},
  cmdDiscard:{ar:'إلغاء التغييرات',en:'Discard changes'},
  cmdSettings:{ar:'الإعدادات',en:'Settings'},
  bannerTitle:{ar:'الإعداد · مراجعة الإصدار',en:'Configuration · Revision review'},
  bannerDetail:{ar:'مراجعة وتтиров التفضيلات والإعداد التشغيلي',en:'Review and revise preferences and operational configuration'},
  publishReceipt:{ar:'تم نشر التفضيلات عبر ScopedPreferencesOwner',en:'Preferences published through ScopedPreferencesOwner'},
  publishBlocked:{ar:'يتطلب تحققًا أولًا',en:'Validation required first'},
  validateReceipt:{ar:'تم التحقق',en:'Validated'},
  discardReceipt:{ar:'أُلغيت تغييرات المسودة',en:'Draft changes discarded'},
  savedReceipt:{ar:'حُفظت المسودة محليًا',en:'Draft saved locally'},
  none:{ar:'لا يوجد',en:'None'}
} as const;
const t=(key:keyof typeof T,locale:Locale)=>T[key][locale];

const domains=(()=>CONFIGURATION_DOMAINS)();

export interface ConfigurationViewState{
  selectedDomain:string;
  tab:RevisionTab;
  filter:'all'|'preference'|'operational';
  query:string;
  log:Array<{at:string;kind:string;text:{ar:string;en:string}}>;
  receipts:Array<{code:string;ok:boolean}>;
}

export function initialViewState():ConfigurationViewState{
  return {
    selectedDomain:'security',tab:'diff',filter:'all',query:'',log:[
      {at:'10:42',kind:'DRAFT_OPENED',text:{ar:`فُتحت المسودة ${DRAFT_REVISION} على أساس ${BASE_REVISION}`,en:`Draft ${DRAFT_REVISION} opened on base ${BASE_REVISION}`}},
      {at:'10:42',kind:'PREFERENCE_PROPOSAL',text:{ar:'رُفعت 7 مقترحات تفضيل للمسودة',en:'7 preference proposals drafted into the revision'}},
      {at:'10:43',kind:'OPERATIONAL_PROPOSAL',text:{ar:'رُفعت 4 مقترحات إعداد تشغيلي (قيم مُصَرَّفة)',en:'4 operational configuration proposals raised (redacted values)'}},
      {at:'10:44',kind:'BOUNDARY',text:{ar:'التحقق لا يطابق، والحذف لا يعيد الضبط_factory',en:'Validate never applies; discard is never a factory reset'}}
    ],receipts:[]
  };
}

/* ────────────────────────────── shared styles ────────────────────────────── */

const STYLE_ID='w05-configuration-style';
export const CONFIGURATION_STYLE=`
#w05-configuration-style{}
[data-w05-configuration-host]{--cfg-bg:#0a1120;--cfg-panel:#0e1729;--cfg-panel-2:#111d33;--cfg-sunken:#0b1424;--cfg-line:#1d2b45;--cfg-line-soft:#16233a;--cfg-text:#e7edf9;--cfg-muted:#8fa3c2;--cfg-dim:#7f93b5;--cfg-accent:#7c5cf5;--cfg-accent-2:#5b46c9;--cfg-green:#2fc38a;--cfg-amber:#f0a63a;--cfg-red:#f0555f;--cfg-blue:#4b93f5;--cfg-radius:10px;--cfg-gap:14px;color:var(--cfg-text);}
[data-w05-configuration-host] .cfg-icon{inline-size:16px;block-size:16px;opacity:.9}
.cfg-root{display:flex;flex-direction:column;gap:var(--cfg-gap);padding:18px 20px 26px;background:linear-gradient(180deg,#0a1120 0%,#0a101d 100%);min-block-size:100%;}
.cfg-strip{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;justify-content:space-between;padding-block-end:14px;border-block-end:1px solid var(--cfg-line-soft);}
.cfg-eyebrow{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--cfg-accent);font-weight:700;}
[dir=rtl] .cfg-eyebrow{letter-spacing:0;text-transform:none;font-size:12px;}
.cfg-strip h1{margin:6px 0 6px;font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-.01em;}
.cfg-strip .cfg-sub{margin:0;max-inline-size:78ch;color:var(--cfg-muted);font-size:13.5px;line-height:1.55;}
.cfg-strip-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-block-start:6px;}
.cfg-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:700;border:1px solid transparent;white-space:nowrap;}
.cfg-chip::before{content:'';inline-size:6px;block-size:6px;border-radius:50%;background:currentColor;}
.cfg-chip-warn{color:var(--cfg-amber);background:rgba(240,166,58,.12);border-color:rgba(240,166,58,.35);}
.cfg-chip-ok{color:var(--cfg-green);background:rgba(47,195,138,.12);border-color:rgba(47,195,138,.32);}
.cfg-chip-info{color:var(--cfg-blue);background:rgba(75,147,245,.12);border-color:rgba(75,147,245,.32);}
.cfg-chip-danger{color:var(--cfg-red);background:rgba(240,85,95,.12);border-color:rgba(240,85,95,.32);}
.cfg-chip-quiet{color:var(--cfg-muted);background:rgba(143,163,194,.09);border-color:rgba(143,163,194,.22);}
.cfg-chip-plain::before{display:none}
.cfg-meta{font-size:12px;color:var(--cfg-dim);}
.cfg-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;}
.cfg-fact{display:flex;flex-direction:column;gap:5px;padding:11px 14px;background:var(--cfg-panel);border:1px solid var(--cfg-line);border-radius:var(--cfg-radius);}
.cfg-fact>span{font-size:11.5px;color:var(--cfg-muted);}
.cfg-fact>strong,.cfg-fact>bdi{font-size:15px;font-weight:700;letter-spacing:.02em;}
.cfg-fact .cfg-fact-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.cfg-fact .cfg-link{color:var(--cfg-blue);}
.cfg-block{background:var(--cfg-panel);border:1px solid var(--cfg-line);border-radius:12px;overflow:hidden;}
.cfg-block-head{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;padding:15px 18px 13px;border-block-end:1px solid var(--cfg-line-soft);}
.cfg-block-head h2{margin:0;font-size:16.5px;font-weight:750;}
.cfg-block-head p{margin:5px 0 0;font-size:12.5px;color:var(--cfg-muted);max-inline-size:74ch;line-height:1.5;}
.cfg-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.cfg-select,.cfg-searchbox{display:flex;align-items:center;gap:7px;background:var(--cfg-sunken);border:1px solid var(--cfg-line);border-radius:8px;padding:6px 10px;font-size:12.5px;color:var(--cfg-text);}
.cfg-select select{background:transparent;border:0;color:inherit;font:inherit;outline:none;cursor:pointer;}
.cfg-select select option{background:#0e1729;color:#e7edf9;}
.cfg-searchbox input{background:transparent;border:0;color:inherit;font:inherit;outline:none;inline-size:190px;}
.cfg-searchbox input::placeholder{color:var(--cfg-dim);}
.cfg-table{display:flex;flex-direction:column;}
.cfg-thead,.cfg-row{display:grid;grid-template-columns:minmax(0,1fr) 118px 84px 132px 20px;gap:10px;align-items:center;padding:11px 16px;}
.cfg-thead{background:var(--cfg-sunken);border-block-end:1px solid var(--cfg-line);font-size:11.5px;letter-spacing:.06em;color:var(--cfg-dim);text-transform:uppercase;}
[dir=rtl] .cfg-thead{letter-spacing:0;}
.cfg-row{min-block-size:64px;width:100%;text-align:start;background:transparent;border:0;border-block-end:1px solid var(--cfg-line-soft);color:inherit;font:inherit;cursor:pointer;position:relative;transition:background .14s ease;}
.cfg-row:last-child{border-block-end:0;}
.cfg-row:hover{background:rgba(124,92,245,.07);}
.cfg-row:focus-visible,.cfg-tab:focus-visible,.cfg-nav button:focus-visible,.cfg-linkbtn:focus-visible,.cfg-select:focus-within,.cfg-searchbox:focus-within{outline:2px solid var(--cfg-accent);outline-offset:2px;}
.cfg-row[aria-current=true]{background:rgba(124,92,245,.14);}
.cfg-row[aria-current=true]::before{content:'';position:absolute;inset-block:0;inset-inline-start:0;inline-size:3px;background:var(--cfg-accent);}
.cfg-domain{display:flex;gap:11px;align-items:flex-start;min-inline-size:0;}
.cfg-domain .cfg-icon{margin-block-start:2px;color:var(--cfg-accent);flex:none;}
.cfg-domain strong{display:block;font-size:14.5px;font-weight:700;}
.cfg-domain small{display:block;margin-block-start:3px;font-size:12px;color:var(--cfg-muted);line-height:1.45;}
.cfg-cell{font-size:13px;color:var(--cfg-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cfg-domain small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cfg-cell.muted{color:var(--cfg-muted);}
.cfg-count{display:inline-flex;align-items:center;justify-content:center;min-inline-size:24px;padding:2px 7px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(124,92,245,.18);color:#c3b4ff;border:1px solid rgba(124,92,245,.4);}
.cfg-count[data-zero=true]{background:rgba(143,163,194,.1);color:var(--cfg-dim);border-color:rgba(143,163,194,.2);}
.cfg-chev{color:var(--cfg-dim);display:flex;justify-content:flex-end;}
[dir=rtl] .cfg-chev svg{transform:scaleX(-1);}
.cfg-tabs{display:flex;gap:4px;padding:10px 14px 0;border-block-end:1px solid var(--cfg-line-soft);background:var(--cfg-sunken);}
.cfg-tab{appearance:none;background:transparent;border:0;border-block-end:2px solid transparent;padding:9px 14px;font:inherit;font-size:13.5px;color:var(--cfg-muted);cursor:pointer;border-radius:6px 6px 0 0;}
.cfg-tab:hover{color:var(--cfg-text);}
.cfg-tab[aria-selected=true]{color:var(--cfg-text);border-block-end-color:var(--cfg-accent);font-weight:700;background:rgba(124,92,245,.1);}
.cfg-tabpanel{padding:16px 18px 18px;}
.cfg-diff{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:stretch;container-type:inline-size;}
@container (min-width:900px){.cfg-diff{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 232px;}.cfg-diff-side{grid-column:auto;display:flex;flex-direction:column;gap:12px;}}
.cfg-side-col{min-inline-size:0;}
.cfg-diff-pane{background:var(--cfg-sunken);border:1px solid var(--cfg-line);border-radius:9px;overflow:hidden;}
.cfg-diff-pane>header{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:9px 13px;background:var(--cfg-panel-2);border-block-end:1px solid var(--cfg-line);font-size:12.5px;color:var(--cfg-muted);}
.cfg-diff-pane>header bdi{font-weight:700;color:var(--cfg-text);letter-spacing:.03em;}
.cfg-diff-pane.is-draft>header bdi{color:#b9a8ff;}
.cfg-code{list-style:none;margin:0;padding:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.4px;line-height:1.75;}
.cfg-code li{display:grid;grid-template-columns:34px 18px minmax(0,1fr);gap:8px;padding:1px 12px;white-space:pre-wrap;word-break:break-word;}
.cfg-code li .ln{color:#5d7096;text-align:end;user-select:none;}
.cfg-code li .mk{color:var(--cfg-dim);font-weight:700;}
.cfg-code li[data-change=add]{background:rgba(47,195,138,.11);}
.cfg-code li[data-change=add] .mk{color:var(--cfg-green);}
.cfg-code li[data-change=del]{background:rgba(240,85,95,.11);}
.cfg-code li[data-change=del] .mk{color:var(--cfg-red);}
.cfg-code li[data-change=same] .val{color:#9fb1cd;}
.cfg-code .val{color:#dbe4f4;}
.cfg-empty{margin:0;padding:22px 16px;text-align:center;color:var(--cfg-muted);font-size:13px;line-height:1.6;}
.cfg-diff-notice{margin:0 0 12px;padding:9px 12px;border:1px dashed var(--cfg-line);border-radius:8px;background:rgba(143,163,194,.06);color:var(--cfg-muted);font-size:12.6px;line-height:1.55;}
.cfg-diff-side{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;background:var(--cfg-panel-2);border:1px solid var(--cfg-line);border-radius:9px;padding:13px 14px;}
.cfg-diff-side h3{margin:0 0 8px;font-size:13px;letter-spacing:.03em;color:var(--cfg-muted);text-transform:uppercase;font-weight:700;}
[dir=rtl] .cfg-diff-side h3{text-transform:none;letter-spacing:0;font-size:13.5px;}
.cfg-stat{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-block-end:1px dashed var(--cfg-line-soft);font-size:13px;}
.cfg-stat:last-of-type{border-block-end:0;}
.cfg-stat span{color:var(--cfg-muted);}
.cfg-stat b{font-variant-numeric:tabular-nums;font-size:14px;}
.cfg-stat[data-tone=add] b{color:var(--cfg-blue);}
.cfg-stat[data-tone=mod] b{color:var(--cfg-amber);}
.cfg-stat[data-tone=del] b{color:var(--cfg-red);}
.cfg-points{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;}
.cfg-points li{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12.5px;color:var(--cfg-muted);}
.cfg-points li strong{color:var(--cfg-text);font-weight:650;}
.cfg-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
.cfg-log li{display:grid;grid-template-columns:56px 148px minmax(0,1fr);gap:12px;padding:9px 4px;border-block-end:1px solid var(--cfg-line-soft);font-size:13px;align-items:baseline;}
.cfg-log li:last-child{border-block-end:0;}
.cfg-log time{color:var(--cfg-dim);font-variant-numeric:tabular-nums;font-size:12px;}
.cfg-log .kind{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:#b9a8ff;letter-spacing:.02em;}
.cfg-obs{width:100%;border-collapse:collapse;font-size:13px;}
.cfg-obs th,.cfg-obs td{text-align:start;padding:9px 10px;border-block-end:1px solid var(--cfg-line-soft);}
.cfg-obs th{font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--cfg-dim);background:var(--cfg-sunken);}
[dir=rtl] .cfg-obs th{text-transform:none;letter-spacing:0;}
.cfg-obs td bdi{font-family:ui-monospace,Menlo,monospace;font-size:12.2px;}
.cfg-state{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;}
.cfg-state::before{content:'';inline-size:7px;block-size:7px;border-radius:50%;background:currentColor;}
.cfg-state[data-state=AVAILABLE]{color:var(--cfg-green);}
.cfg-state[data-state=STALE]{color:var(--cfg-amber);}
.cfg-state[data-state=UNAVAILABLE]{color:var(--cfg-dim);}
.cfg-state[data-state=ERROR]{color:var(--cfg-red);}
.cfg-footnote{margin:14px 0 0;padding:10px 12px;border-inline-start:3px solid var(--cfg-accent);background:rgba(124,92,245,.08);border-radius:0 8px 8px 0;font-size:12.3px;color:var(--cfg-muted);line-height:1.6;}
[dir=rtl] .cfg-footnote{border-inline-start:3px solid var(--cfg-accent);border-radius:0 8px 8px 0;}

/* Shared pane siblings are hidden by workspace.region(); donor CSS display rules can defeat
   the [hidden] attribute, so honour the shared intent inside these two panes only. */
#leftPane .pbody > [hidden],#rightPane .pbody > [hidden]{display:none !important;}

/* left / right region presentation */
.cfg-pane{display:flex;flex-direction:column;gap:16px;padding:14px 14px 22px;}
/* The shared .foundation-stage is a fixed-height flex column; surface content must opt into
   scrolling instead of being silently clipped by flex-shrink. */
.foundation-stage.cfg-stage{overflow-y:auto;overflow-x:hidden;}
.cfg-root{flex:1 0 auto;}
.cfg-root>*{flex:0 0 auto;}
#domainContext .cfg-inspector{padding:2px 0 10px;}
#leftPane .pbody .cfg-pane{padding:14px 14px 22px;}
.cfg-pane-head h2{margin:0;font-size:15.5px;font-weight:760;}
.cfg-pane-head p{margin:5px 0 0;font-size:12.3px;color:var(--cfg-muted);line-height:1.5;}
.cfg-pane-section>h3{margin:0 0 8px;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--cfg-dim);font-weight:700;display:flex;justify-content:space-between;gap:8px;align-items:center;}
[dir=rtl] .cfg-pane-section>h3{text-transform:none;letter-spacing:0;font-size:12.5px;color:var(--cfg-muted);}
.cfg-nav{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;}
.cfg-nav button{appearance:none;width:100%;display:flex;gap:10px;align-items:flex-start;text-align:start;background:transparent;border:1px solid transparent;border-radius:8px;padding:8px 10px;color:inherit;font:inherit;cursor:pointer;transition:background .14s ease;}
.cfg-nav button:hover{background:rgba(124,92,245,.09);}
.cfg-nav button[aria-current=true]{background:rgba(124,92,245,.16);border-color:rgba(124,92,245,.42);}
.cfg-nav .cfg-icon{color:var(--cfg-accent);margin-block-start:2px;flex:none;}
.cfg-nav .cfg-nav-copy{min-inline-size:0;flex:1;}
.cfg-nav strong{display:block;font-size:13.4px;font-weight:660;}
.cfg-nav small{display:block;margin-block-start:2px;font-size:11.4px;color:var(--cfg-muted);line-height:1.4;}
.cfg-nav .cfg-count{flex:none;align-self:center;}
.cfg-revision{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;}
.cfg-revision li{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken);}
.cfg-revision li.is-current{border-color:rgba(124,92,245,.5);background:rgba(124,92,245,.1);}
.cfg-revision .cfg-rev-id{font-family:ui-monospace,Menlo,monospace;font-size:12.2px;letter-spacing:.02em;}
.cfg-revision .cfg-rev-meta{display:flex;flex-direction:column;align-items:flex-end;gap:3px;}
[dir=rtl] .cfg-revision .cfg-rev-meta{align-items:flex-start;}
.cfg-authority{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.cfg-authority li{display:flex;flex-direction:column;gap:2px;padding-inline-start:10px;border-inline-start:2px solid var(--cfg-line);}
.cfg-authority bdi{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#b9a8ff;}
.cfg-authority small{font-size:11.6px;color:var(--cfg-muted);line-height:1.45;}
.cfg-inspector{display:flex;flex-direction:column;gap:14px;padding:14px 14px 22px;}
.cfg-insp-card{background:var(--cfg-panel);border:1px solid var(--cfg-line);border-radius:10px;padding:12px 13px;}
.cfg-insp-card.is-accent{border-color:rgba(124,92,245,.45);background:rgba(124,92,245,.09);}
.cfg-insp-card>h3{margin:0 0 8px;font-size:13.4px;font-weight:720;display:flex;justify-content:space-between;gap:8px;align-items:center;}
.cfg-insp-card>h3 .cfg-count{font-size:11.5px;}
.cfg-insp-row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:12.6px;border-block-end:1px dashed var(--cfg-line-soft);}
.cfg-insp-row:last-child{border-block-end:0;}
.cfg-insp-row span{color:var(--cfg-muted);}
.cfg-insp-row b{font-weight:700;font-variant-numeric:tabular-nums;}
.cfg-insp-lead{font-size:13.4px;font-weight:740;margin:0 0 6px;}
.cfg-insp-text{margin:0;font-size:12.4px;color:var(--cfg-muted);line-height:1.6;}
.cfg-insp-list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:5px;font-size:12.4px;color:var(--cfg-muted);}
.cfg-insp-list li{display:flex;gap:7px;align-items:baseline;}
.cfg-insp-list li::before{content:'';inline-size:5px;block-size:5px;border-radius:50%;background:var(--cfg-accent);flex:none;transform:translateY(-2px);}
.cfg-linkbtn{appearance:none;background:transparent;border:0;padding:6px 0 0;color:var(--cfg-blue);font:inherit;font-size:12.4px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.cfg-meter{display:block;block-size:7px;border-radius:999px;background:rgba(143,163,194,.16);overflow:hidden;margin:8px 0 6px;}
.cfg-meter i{display:block;block-size:100%;background:linear-gradient(90deg,var(--cfg-accent),#37d0a0);border-radius:999px;transition:inline-size .3s ease;}
.cfg-bars{display:flex;flex-direction:column;gap:6px;margin-block-start:9px;}
.cfg-bar{display:grid;grid-template-columns:minmax(0,84px) minmax(0,1fr) 24px;gap:8px;align-items:center;font-size:11.8px;color:var(--cfg-muted);}
.cfg-bar .track{block-size:8px;border-radius:999px;background:rgba(143,163,194,.14);overflow:hidden;}
.cfg-bar .track i{display:block;block-size:100%;background:var(--cfg-accent);border-radius:999px;}
.cfg-bar b{text-align:end;font-variant-numeric:tabular-nums;color:var(--cfg-text);}
.cfg-avatar{display:inline-flex;align-items:center;justify-content:center;inline-size:34px;block-size:34px;border-radius:50%;background:linear-gradient(135deg,var(--cfg-accent),#37d0a0);color:#08101f;font-weight:800;font-size:12.5px;}
.cfg-author{display:flex;gap:10px;align-items:center;}
.cfg-author strong{display:block;font-size:13px;}
.cfg-author small{display:block;font-size:11.6px;color:var(--cfg-muted);}

/* toolbar presentation (surface-local emphasis inside the shared toolbar) */
#domainToolbar [data-foundation-command=configuration.publish]{background:var(--cfg-accent-2,#5b46c9);border-color:#7c5cf5;color:#fff;font-weight:700;}
#domainToolbar [data-foundation-command=configuration.publish]:hover{background:#6b53e6;}
#domainToolbar [data-foundation-command=configuration.discardRevision]{color:#ff9aa2;border-color:rgba(240,85,95,.5);}
#domainToolbar [data-foundation-command=configuration.discardRevision]:hover{background:rgba(240,85,95,.14);}
#domainToolbar [data-foundation-command=configuration.saveDraft]{border-color:rgba(75,147,245,.5);}
@media (max-width:1180px){.cfg-diff{grid-template-columns:minmax(0,1fr);}.cfg-thead,.cfg-row{grid-template-columns:minmax(0,1fr) 110px 92px 132px 22px;}}
@media (max-width:900px){.cfg-thead{display:none;}.cfg-row{grid-template-columns:minmax(0,1fr) auto;grid-auto-rows:auto;row-gap:6px;}.cfg-row>.cfg-cell:nth-of-type(1){grid-column:1;}.cfg-row>.cfg-cell{font-size:12.2px;color:var(--cfg-muted);}.cfg-chev{display:none;}.cfg-strip h1{font-size:21px;}.cfg-searchbox input{inline-size:130px;}}
`;

export function injectConfigurationStyle(){
  if(typeof document==='undefined'||document.getElementById(STYLE_ID))return false;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=CONFIGURATION_STYLE;
  document.head.append(style);
  return true;
}

/* ────────────────────────────── helpers ────────────────────────────── */

export const localized=(pair:{ar:string;en:string}|undefined,locale:Locale)=>pair?pair[locale]:'';

const stateTone=(state:string)=>state==='AVAILABLE'?'ok':state==='STALE'?'warn':state==='ERROR'?'danger':'quiet';
const relativeAge=(index:number,locale:Locale)=>locale==='ar'
  ?['قبل 6 دقائق','قبل 10 دقائق','قبل 15 دقيقة','قبل 9 دقائق','قبل ساعة','أمس'][index]||'قبل يومين'
  :['6 minutes ago','10 minutes ago','15 minutes ago','9 minutes ago','1 hour ago','yesterday'][index]||'2 days ago';

export function domainChangeCount(domainId:string,changes:DraftChange[]){
  return changes.filter(change=>change.domainId===domainId&&change.kind!=='NO_OP').length;
}
export function domainStatus(domainId:string,changes:DraftChange[]):{label:string;chip:string}{
  const own=changes.filter(change=>change.domainId===domainId&&change.kind!=='NO_OP');
  if(!own.length)return {label:'clean',chip:'cfg-chip-quiet'};
  if(own.every(change=>change.scope==='operational'))return {label:'authority',chip:'cfg-chip-info'};
  if(own.some(change=>change.state==='PENDING'))return {label:'draft',chip:'cfg-chip-warn'};
  return {label:'validated',chip:'cfg-chip-ok'};
}

/* ────────────────────────────── render context ────────────────────────────── */

export interface ObservationView{key:string;presentVersion:string;redactedValue:string;source:string;observedAt:string;restartRequired:boolean;state:string}
export interface RenderContext{
  locale:Locale;
  changes:DraftChange[];
  summary:DraftSummary;
  view:ConfigurationViewState;
  values:Record<string,string>;
  observations:ObservationView[];
  readiness:number;
  validatedCount:number;
  lastReceipt:string|null;
}

const keyTail=(domainId:string,key:string)=>key.startsWith(`${domainId}.`)?key.slice(domainId.length+1):key;
const indentFor=(key:string)=>/^[a-z]+(\.[a-z_]+)+$/i.test(key)&&key.includes('.')?'    ':'  ';

/* ────────────────────────────── CENTER ────────────────────────────── */

function renderFacts(locale:Locale,summary:DraftSummary){
  return `<div class="cfg-facts">
<div class="cfg-fact"><span>${esc(t('factBase',locale))}</span><bdi dir="ltr">${esc(BASE_REVISION)}</bdi></div>
<div class="cfg-fact"><span>${esc(t('factDraft',locale))}</span><div class="cfg-fact-inline"><bdi dir="ltr" class="cfg-link">${esc(DRAFT_REVISION)}</bdi><span class="cfg-chip cfg-chip-warn">${esc(t('draftChip',locale))}</span></div></div>
<div class="cfg-fact"><span>${esc(t('factProfile',locale))}</span><div class="cfg-fact-inline"><strong>${esc(localized(REVISION_PROFILE.label,locale))}</strong><span class="cfg-chip cfg-chip-quiet cfg-chip-plain"><bdi dir="ltr">PROD</bdi></span></div></div>
</div>`;
}

function filteredDomains(view:ConfigurationViewState){
  const query=view.query.trim().toLowerCase();
  return domains.filter(domain=>{
    if(view.filter!=='all'&&domain.kind!==view.filter)return false;
    if(!query)return true;
    const haystack=[domain.id,localized(domain.label,'ar'),localized(domain.label,'en'),localized(domain.description,'ar'),localized(domain.description,'en'),...domain.keys].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function renderDomainTable(ctx:RenderContext){
  const {locale,view,changes}=ctx,rows=filteredDomains(view);
  const body=rows.length?rows.map((domain,index)=>{
    const count=domainChangeCount(domain.id,changes),status=domainStatus(domain.id,changes);
    const statusLabel=status.label==='clean'?t('statusClean',locale):status.label==='authority'?t('statusPendingAuthority',locale):t('statusModified',locale);
    return `<button type="button" class="cfg-row" data-cfg-domain="${esc(domain.id)}" aria-current="${view.selectedDomain===domain.id}" aria-label="${esc(`${localized(domain.label,locale)} · ${count} ${locale==='ar'?'تغيير':'changes'} · ${statusLabel}`)}">
<span class="cfg-domain">${icon(domain.icon)}<span><strong>${esc(localized(domain.label,locale))}</strong><small>${esc(localized(domain.description,locale))}</small></span></span>
<span class="cfg-cell muted">${esc(relativeAge(index,locale))}</span>
<span class="cfg-cell"><span class="cfg-count" data-zero="${count===0}">${esc(String(count))}</span></span>
<span class="cfg-cell"><span class="cfg-chip ${status.chip}">${esc(statusLabel)}</span></span>
<span class="cfg-chev"><svg class="icon sm" aria-hidden="true"><use href="#i-chev"></use></svg></span>
</button>`;
  }).join(''):`<p class="cfg-empty">${esc(locale==='ar'?'لا توجد مجالات مطابقة للفلتر.':'No domains match the current filter.')}</p>`;

  return `<section class="cfg-block" data-cfg-block="domains">
<header class="cfg-block-head"><div><h2>${esc(t('domainsTitle',locale))}</h2><p>${esc(t('domainsNote',locale))}</p></div>
<div class="cfg-controls">
<label class="cfg-select"><svg class="icon sm" aria-hidden="true"><use href="#i-list"></use></svg><select data-cfg-filter aria-label="${esc(t('filterAll',locale))}">
<option value="all"${view.filter==='all'?' selected':''}>${esc(t('filterAll',locale))}</option>
<option value="preference"${view.filter==='preference'?' selected':''}>${esc(t('filterPreference',locale))}</option>
<option value="operational"${view.filter==='operational'?' selected':''}>${esc(t('filterOperational',locale))}</option>
</select></label>
<label class="cfg-searchbox"><svg class="icon sm" aria-hidden="true"><use href="#i-search"></use></svg><input type="search" data-cfg-search value="${esc(view.query)}" placeholder="${esc(t('searchPlaceholder',locale))}" aria-label="${esc(t('searchPlaceholder',locale))}"></label>
</div></header>
<div class="cfg-table" role="group" aria-label="${esc(t('domainsTitle',locale))}">
<div class="cfg-thead" aria-hidden="true"><span>${esc(t('colDomain',locale))}</span><span>${esc(t('colModified',locale))}</span><span>${esc(t('colChanges',locale))}</span><span>${esc(t('colStatus',locale))}</span><span></span></div>
${body}</div></section>`;
}

function renderDiff(ctx:RenderContext){
  const {locale,view,changes,summary,values}=ctx,domain=domainById(view.selectedDomain);
  const own=domain.keys.map(key=>({key,change:changes.find(entry=>entry.key===key)||null,value:values[key]??'—'}));
  if(!own.length||own.every(row=>row.value==='—'&&!row.change)){
    return `<p class="cfg-empty">${esc(t('diffEmpty',locale))}</p>`;
  }
  const lines=own.map((row,index)=>{
    const number=index+1;
    const tail=keyTail(domain.id,row.key);
    const indent=indentFor(row.key);
    const base=row.change?row.change.from:row.value;
    const draft=row.change?row.change.to:row.value;
    const changed=row.change!==null&&row.change.kind!=='NO_OP';
    return {number,indent,tail,base,draft,changed,technical:row.change?.technicalToken!==false};
  });
  const pane=(which:'base'|'draft')=>`<div class="cfg-diff-pane${which==='draft'?' is-draft':''}"><header><span>${esc(which==='base'?t('diffBaseHeader',locale):t('diffDraftHeader',locale))}</span><bdi dir="ltr">${esc(which==='base'?BASE_REVISION:DRAFT_REVISION)}</bdi></header><ol class="cfg-code">
<li data-change="same"><span class="ln">1</span><span class="mk"></span><span class="val">${esc(domain.id)}:</span></li>
${lines.map((line,index)=>{const value=which==='base'?line.base:line.draft;const marker=line.changed?(which==='base'?'-':'+'):' ';const change=line.changed?(which==='base'?'del':'add'):'same';return `<li data-change="${change}"><span class="ln">${esc(String(index+2))}</span><span class="mk">${esc(marker)}</span><span class="val">${esc(line.tail)}: ${line.changed?`<bdi dir="ltr">"${esc(value)}"</bdi>`:`<bdi dir="ltr">"${esc(value)}"</bdi>`}</span></li>`}).join('')}
</ol></div>`;

  const touched=domains.filter(domain=>domainChangeCount(domain.id,changes)>0);
  const domainChanges=domainChangeCount(domain.id,changes);
  const notice=domainChanges===0?{ar:summary.total>0?`لا توجد فروق في هذا المجال بين المصدرين — ${summary.total} تغييرًا آخر في مجالات أخرى.`:'لا توجد فروق في هذا المجال بين المصدرين.',en:summary.total>0?`No differences in this domain between the two revisions — ${summary.total} change(s) live in other domains.`:'No differences in this domain between the two revisions.'}:null;
  const max=Math.max(1,...touched.map(domain=>domainChangeCount(domain.id,changes)));
  const stat=(label:string,value:number,tone?:string)=>`<div class="cfg-stat"${tone?` data-tone="${tone}"`:''}><span>${esc(label)}</span><b>${esc(String(value))}</b></div>`;
  const side=`<aside class="cfg-diff-side" aria-label="${esc(t('summaryTitle',locale))}">
<div class="cfg-side-col"><h3>${esc(t('summaryTitle',locale))}</h3>
${stat(t('summaryTotal',locale),summary.total)}
${stat(t('summaryAdd',locale),summary.additions,'add')}
${stat(t('summaryModify',locale),summary.modifications,'mod')}
${stat(t('summaryDelete',locale),summary.deletions,'del')}</div>
<div class="cfg-side-col"><h3>${esc(t('pointsTitle',locale))}</h3><p class="cfg-insp-text" style="margin:0 0 8px">${esc(t('pointsNote',locale))}</p>
<ul class="cfg-points">${touched.map(entry=>`<li><strong>${esc(localized(entry.label,locale))}</strong><span class="cfg-count">${esc(String(domainChangeCount(entry.id,changes)))}</span></li>`).join('')||`<li><span>${esc(t('none',locale))}</span></li>`}</ul></div></aside>`;

  return `${notice?`<p class="cfg-diff-notice" role="status">${esc(notice[locale])}</p>`:''}<div class="cfg-diff"><div class="cfg-diff-panes" style="display:contents">${pane('draft')}${pane('base')}</div>${side}</div>`;
}

function renderLog(ctx:RenderContext){
  const {locale,view}=ctx;
  const entries=[...view.log];
  return `<h3 class="cfg-insp-lead" style="margin:0 0 4px">${esc(t('logTitle',locale))}</h3><p class="cfg-insp-text" style="margin:0 0 10px">${esc(t('logNote',locale))}</p>
<ul class="cfg-log">${entries.map(entry=>`<li><time dir="ltr">${esc(entry.at)}</time><span class="kind" dir="ltr">${esc(entry.kind)}</span><span>${esc(localized(entry.text,locale))}</span></li>`).join('')}</ul>`;
}

function renderObservations(ctx:RenderContext){
  const {locale,observations}=ctx;
  return `<h3 class="cfg-insp-lead" style="margin:0 0 4px">${esc(t('obsTitle',locale))}</h3><p class="cfg-insp-text" style="margin:0 0 10px">${esc(t('obsNote',locale))}</p>
<table class="cfg-obs"><thead><tr><th>${esc(t('colKey',locale))}</th><th>${esc(t('colValue',locale))}</th><th>${esc(t('colSource',locale))}</th><th>${esc(t('colObserved',locale))}</th><th>${esc(t('restart',locale))}</th><th>${esc(t('colState',locale))}</th></tr></thead><tbody>
${observations.map(row=>`<tr><td><bdi dir="ltr">${esc(row.key)}</bdi></td><td><bdi dir="ltr">${esc(row.redactedValue)}</bdi></td><td><bdi dir="ltr">${esc(row.source)}</bdi></td><td><bdi dir="ltr">${esc(row.observedAt)}</bdi></td><td>${esc(row.restartRequired?t('yes',locale):t('no',locale))}</td><td><span class="cfg-state" data-state="${esc(row.state)}"><bdi dir="ltr">${esc(row.state)}</bdi></span></td></tr>`).join('')}
</tbody></table>`;
}

export function renderCenter(ctx:RenderContext){
  const {locale,view,summary}=ctx;
  const panel=view.tab==='log'?renderLog(ctx):view.tab==='observations'?renderObservations(ctx):renderDiff(ctx);
  const tab=(id:RevisionTab,label:string)=>`<button type="button" class="cfg-tab" id="cfg-tab-${id}" role="tab" aria-controls="cfg-tabpanel" aria-selected="${view.tab===id}" data-cfg-tab="${id}">${esc(label)}</button>`;
  return `<div class="cfg-root" data-w05-configuration-host data-selected-domain="${esc(view.selectedDomain)}" data-revision-tab="${esc(view.tab)}" data-revision="${esc(DRAFT_REVISION)}">
<div class="cfg-strip"><div class="cfg-strip-main"><span class="cfg-eyebrow">${esc(t('eyebrow',locale))}</span><h1>${esc(t('title',locale))}</h1><p class="cfg-sub">${esc(t('subtitle',locale))}</p></div>
<div class="cfg-strip-meta"><span class="cfg-chip cfg-chip-warn">${esc(t('draftChip',locale))}</span><span class="cfg-chip cfg-chip-info"><bdi dir="ltr">${esc(String(summary.total))}</bdi> ${esc(locale==='ar'?'تغيير':'changes')} · <bdi dir="ltr">${esc(String(summary.additions)+'+'+String(summary.modifications)+'~')}</bdi></span><span class="cfg-meta">${esc(t('lastSaved',locale))}: ${esc(t('lastSavedValue',locale))}</span>${ctx.lastReceipt?`<span class="cfg-chip cfg-chip-ok">${esc(ctx.lastReceipt)}</span>`:''}</div></div>
${renderFacts(locale,summary)}
${renderDomainTable(ctx)}
<section class="cfg-block" data-cfg-block="revision">
<div class="cfg-tabs" role="tablist" aria-label="${esc(t('tabDiff',locale))}">${tab('log',t('tabLog',locale))}${tab('observations',t('tabObservations',locale))}${tab('diff',t('tabDiff',locale))}</div>
<div class="cfg-tabpanel" id="cfg-tabpanel" role="tabpanel" aria-labelledby="cfg-tab-${esc(view.tab)}">${panel}</div>
</section>
<p class="cfg-footnote">${esc(t('basisTitle',locale))} — <bdi dir="ltr">${esc(CONFIGURATION_REVISION_BASIS)}</bdi></p>
</div>`;
}

/* ────────────────────────────── LEFT ────────────────────────────── */

export function renderLeft(ctx:RenderContext){
  const {locale,view,changes}=ctx;
  return `<div class="cfg-pane" data-w05-configuration-host aria-label="${esc(t('leftTitle',locale))}">
<div class="cfg-pane-head"><h2>${esc(t('leftTitle',locale))}</h2><p>${esc(t('leftNote',locale))}</p></div>
<section class="cfg-pane-section"><h3>${esc(t('leftDomains',locale))}<span class="cfg-count">${esc(String(domains.length))}</span></h3>
<ul class="cfg-nav">${domains.map(domain=>{const count=domainChangeCount(domain.id,changes);return `<li><button type="button" data-cfg-domain="${esc(domain.id)}" aria-current="${view.selectedDomain===domain.id}">${icon(domain.icon)}<span class="cfg-nav-copy"><strong>${esc(localized(domain.label,locale))}</strong><small><bdi dir="ltr">${esc(domain.valueOwner)}</bdi></small></span>${count?`<span class="cfg-count">${esc(String(count))}</span>`:''}</button></li>`}).join('')}</ul></section>
<section class="cfg-pane-section"><h3>${esc(t('leftLineage',locale))}</h3>
<ul class="cfg-revision">${REVISION_LINEAGE.map((entry,index)=>`<li class="${index===0?'is-current':''}"><bdi class="cfg-rev-id" dir="ltr">${esc(entry.id)}</bdi><span class="cfg-rev-meta"><span class="cfg-chip ${entry.state==='DRAFT'?'cfg-chip-warn':entry.state==='ACTIVE'?'cfg-chip-ok':'cfg-chip-quiet'}">${esc(entry.state==='DRAFT'?t('draftChip',locale):entry.state==='ACTIVE'?(locale==='ar'?'نشط':'Active'):entry.state==='SUPERSEDED'?(locale=='ar'?'مُستبدل':'Superseded'):(locale==='ar'?'مؤرشف':'Archived'))}</span><small class="cfg-meta">${esc(localized(entry.age,locale))}</small></span></li>`).join('')}</ul></section>
<section class="cfg-pane-section"><h3>${esc(t('leftAuthorities',locale))}</h3>
<ul class="cfg-authority">${CONFIGURATION_AUTHORITIES.map(entry=>`<li><bdi dir="ltr">${esc(entry.id)}</bdi><small>${esc(localized(entry.role,locale))}</small></li>`).join('')}</ul></section>
</div>`;
}

/* ────────────────────────────── RIGHT ────────────────────────────── */

const plural=(n,one,many)=>n===1?one:many;
function alertSentence(operational,locale){
  const restarts=operational.filter(change=>change.restartRequired).length;
  if(locale==='ar')return `${operational.length} ${operational.length===1?'تغيير تشغيلي يُنشر فقط':'تغييرات تشغيلية تُنشر فقط'} عبر سلطة تطبيق صريحة · ${restarts} ${restarts===1?'يتطلب':'تتطلب'} إعادة تشغيل.`;
  return `${operational.length} ${plural(operational.length,'operational change publishes','operational changes publish')} only through an explicit apply authority · ${restarts} ${plural(restarts,'requires','require')} a restart.`;
}

export function renderRight(ctx:RenderContext){
  const {locale,changes,summary,readiness,validatedCount}=ctx;
  const impact=summary.total>=10?'high':summary.total>=5?'medium':'low';
  const impactLabel=impact==='high'?t('impactHigh',locale):impact==='medium'?t('impactMedium',locale):t('impactLow',locale);
  const operational=changes.filter(change=>change.kind!=='NO_OP'&&change.scope==='operational');
  const preference=changes.filter(change=>change.kind!=='NO_OP'&&change.scope==='preference');
  const affectedCount=preference.length?23:operational.length;
  const max=Math.max(1,...domains.map(domain=>domainChangeCount(domain.id,changes)));
  const bars=domains.filter(domain=>domainChangeCount(domain.id,changes)>0).slice(0,6);
  const validated=validatedCount>0;
  return `<div class="cfg-inspector" data-w05-configuration-host aria-label="${esc(t('rightTitle',locale))}">
<div class="cfg-insp-card is-accent"><h3>${esc(t('rightTitle',locale))}</h3><p class="cfg-insp-lead"><bdi dir="ltr">${esc(DRAFT_REVISION)}</bdi></p><div class="cfg-insp-row"><span>${esc(t('rightRevisionLabel',locale))}</span><span class="cfg-chip cfg-chip-warn">${esc(t('draftChip',locale))}</span></div><div class="cfg-insp-row"><span>${esc(t('factBase',locale))}</span><bdi dir="ltr">${esc(BASE_REVISION)}</bdi></div><div class="cfg-insp-row"><span>${esc(locale==='ar'?'مفتوحة منذ':'Open for')}</span><b>${esc(locale==='ar'?'3 أيام':'3 days')}</b></div></div>

<div class="cfg-insp-card"><h3>${esc(t('rightImpact',locale))}<span class="cfg-chip ${impact==='high'?'cfg-chip-danger':impact==='medium'?'cfg-chip-warn':'cfg-chip-ok'}">${esc(impactLabel)}</span></h3>
<p class="cfg-insp-text">${esc(t('rightImpactLevel',locale))} · ${esc(String(summary.domainsTouched))} / ${esc(String(domains.length))} ${esc(locale==='ar'?'مجالات':'domains')}</p>
<div class="cfg-bars">${bars.map(domain=>`<div class="cfg-bar"><span>${esc(localized(domain.label,locale))}</span><span class="track"><i style="inline-size:${Math.round(domainChangeCount(domain.id,changes)/max*100)}%"></i></span><b>${esc(String(domainChangeCount(domain.id,changes)))}</b></div>`).join('')}</div></div>

<div class="cfg-insp-card"><h3>${esc(t('rightAlerts',locale))}<span class="cfg-count">${esc(String(operational.length))}</span></h3>
${operational.length?`<p class="cfg-insp-text">${esc(alertSentence(operational,locale))}</p><ul class="cfg-insp-list">${operational.slice(0,4).map(change=>`<li><bdi dir="ltr">${esc(change.key)}</bdi></li>`).join('')}</ul>`:`<p class="cfg-insp-text">${esc(t('noAlerts',locale))}</p>`}</div>

<div class="cfg-insp-card"><h3>${esc(preference.length?t('rightAffected',locale):t('rightAffectedComponents',locale))}<span class="cfg-chip ${affectedCount?'cfg-chip-info':'cfg-chip-quiet'} cfg-chip-plain"><bdi dir="ltr">${esc(String(affectedCount))}</bdi></span></h3>
<p class="cfg-insp-text">${esc(preference.length? (locale==='ar'?`${preference.length} تفضيل عام يُطبق على كل سطح (${AFFECTED_SURFACES.length} من 23 وجهة معروضة).`:`${preference.length} global preference(s) apply to every surface (${AFFECTED_SURFACES.length} of 23 destinations shown).`) : (locale==='ar'?'لا تفضيلات عامة في هذه المسودة.':'No global preferences in this draft.'))}</p>
<ul class="cfg-insp-list">${(preference.length?AFFECTED_SURFACES.map(entry=>({text:`${localized(entry.label,locale)} (${entry.id})`})):operational.map(change=>({text:change.key}))).map(entry=>`<li><bdi dir="ltr">${esc(entry.text)}</bdi></li>`).join('')}</ul></div>

<div class="cfg-insp-card"><h3>${esc(t('rightRequirements',locale))}</h3>
<ul class="cfg-insp-list">
<li>${esc(locale==='ar'?`التفضيلات (${preference.length}): تُحفظ فورًا عبر ScopedPreferencesOwner — لا إعادة تشغيل.`:`Preferences (${preference.length}): persisted immediately through ScopedPreferencesOwner — no restart.`)}</li>
<li>${esc(locale==='ar'?`التشغيلي (${operational.length}): يبقى AUTHORITY_PENDING حتى تصدر سلطة تطبيق صريحة.`:`Operational (${operational.length}): stays AUTHORITY_PENDING until an explicit apply authority issues it.`)}</li>
<li>${esc(locale==='ar'?'لا يملك مركز الإعدادات تطبيق الإعداد التشغيلي.':'The Settings center cannot dispatch operational configuration apply.')}</li>
</ul></div>

<div class="cfg-insp-card"><h3>${esc(t('rightValidation',locale))}<span class="cfg-chip ${validated?'cfg-chip-ok':'cfg-chip-quiet'}">${esc(validated?`${validatedCount}/${summary.publishable}`:t('validationPending',locale))}</span></h3>
<p class="cfg-insp-text">${esc(validated?t('validationOk',locale):t('validationPending',locale))}</p>
<button type="button" class="cfg-linkbtn" data-cfg-goto="log">${esc(t('viewFullReport',locale))}</button></div>

<div class="cfg-insp-card"><h3>${esc(t('rightReadiness',locale))}<bdi dir="ltr">${esc(String(readiness))}%</bdi></h3>
<span class="cfg-meter" role="progressbar" aria-valuenow="${esc(String(readiness))}" aria-valuemin="0" aria-valuemax="100"><i style="inline-size:${esc(String(readiness))}%"></i></span>
<p class="cfg-insp-text">${esc(t('readinessNote',locale))} · ${esc(String(summary.publishable))}/${esc(String(summary.total))}</p></div>

<div class="cfg-insp-card"><h3>${esc(t('rightPublishNotes',locale))}</h3>
<p class="cfg-insp-text">${esc(t('publishNote',locale))} <bdi dir="ltr">${esc(NEXT_REVISION)}</bdi>. ${esc(locale==='ar'?`التشغيلي (${operational.length}) لا يُنشر ضمن هذا الإصدار.`:`Operational (${operational.length}) is not published by this revision.`)}</p></div>

<div class="cfg-insp-card"><h3>${esc(t('rightAuthor',locale))}</h3><div class="cfg-author"><span class="cfg-avatar" aria-hidden="true">W5</span><span><strong><bdi dir="ltr">${esc(CONFIGURATION_SURFACE_OWNER)}</bdi></strong><small>${esc(locale==='ar'?'مالك مساحة الإعداد · مسودة غير منشورة':'Configuration surface owner · draft unpublished')}</small></span></div></div>
</div>`;
}

/* ────────────────────────────── toolbar ────────────────────────────── */

export const TOOLBAR_COMMANDS=Object.freeze(['configuration.saveDraft','configuration.validateRevision','configuration.compare','configuration.publish','configuration.discardRevision','foundation.settings']);
const TOOLBAR_LABELS:Record<string,{ar:string;en:string}>={
  'configuration.saveDraft':T.cmdSave,'configuration.validateRevision':T.cmdValidate,'configuration.compare':T.cmdCompare,
  'configuration.publish':T.cmdPublish,'configuration.discardRevision':T.cmdDiscard,'foundation.settings':T.cmdSettings
};
export function localizeToolbar(host:ParentNode|null,locale:Locale){  if(!host)return false;
  let changed=false;
  host.querySelectorAll('[data-foundation-command]').forEach(node=>{
    const label=TOOLBAR_LABELS[(node as HTMLElement).dataset.foundationCommand||''];
    if(!label)return;
    const text=label[locale];
    if(node.textContent!==text){node.textContent=text;changed=true}
    (node as HTMLElement).setAttribute('aria-label',text);
    (node as HTMLElement).title=text;
  });
  return changed;
}
export function toolbarLabelFor(id:string,locale:Locale){return TOOLBAR_LABELS[id]?TOOLBAR_LABELS[id][locale]:null}

/** Localized identity projected into the shared top banner (presentation only). */
export function bannerCopy(locale:Locale){
  return {title:t('bannerTitle',locale),detail:t('bannerDetail',locale),badge:locale==='ar'?'الإعداد التشغيلي':'Configuration'};
}
