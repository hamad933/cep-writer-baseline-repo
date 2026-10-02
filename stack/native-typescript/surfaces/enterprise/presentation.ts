import {SpatialView} from '../../foundation/spatial.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bdi=v=>`<bdi dir="ltr">${esc(v??'—')}</bdi>`;
const icon=id=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${id}"></use></svg>`;
const stateTone=s=>s==='PUBLISHED'||s==='BOUND'||s==='AVAILABLE'?'success':s==='BASELINE_STALE'||s==='STALE'?'stale':s==='DETACHED'||s==='UNAVAILABLE'?'error':'neutral';
const commandButton=(id,label,composition,payload={},variant='')=>{const a=composition.bus.availability(id,payload);return `<button class="btn ent-btn" type="button" data-command="${id}"${variant?` data-variant="${variant}"`:''} aria-disabled="${!a.enabled}" ${a.enabled?'':`disabled title="${esc(a.reason)}"`}>${esc(label)}</button>`};

/* Focus survives re-render: remember the surface-owned control that had focus, put it back. */
const FOCUS_KEYS=[['object','object'],['facet','facet'],['mode','mode'],['modeTarget','mode-target'],['zoom','zoom'],['command','command']];
const captureFocus=()=>{
  const el=typeof document!=='undefined'?document.activeElement:null;
  if(!el||!el.dataset)return null;
  for(const [key,attr] of FOCUS_KEYS){const value=el.dataset[key];if(value)return `[data-${attr}="${String(value).replace(/"/g,'')}"]`}
  return null;
};
const restoreFocus=selector=>{
  try{
    const el=document.querySelector(`.enterprise-studio ${selector}`)||document.querySelector(`#domainLeftRegion ${selector}`)||document.querySelector(`#domainContext ${selector}`);
    el?.focus?.({preventScroll:true});
  }catch{}
};

/* ---------------------------------------------------------------- language (G-20)
   Arabic and English are BOTH first-class; the active language is the user's Settings
   preference. Nothing here pins a product language — text is resolved on every render. */
const foundation=()=>typeof globalThis!=='undefined'?globalThis.CEPFoundation||null:null;
const activeLocale=()=>{
  const configured=foundation()?.preferences?.resolve?.('locale')?.preferredValue;
  const lang=String(configured|| (typeof document!=='undefined'?document.documentElement.lang:'')||'en');
  return lang.toLowerCase().startsWith('ar')?'ar':'en';
};
const TEXT={
  en:{
    eyebrow:'Enterprise digital twin workspace',structurePane:'Enterprise structure',contextPane:'Selection context',
    tabTopology:'Topology',tabTwins:'Digital Twins',tabRevisions:'Revisions',tabBaselines:'Baselines',tabState:'State / Validation',
    cmdCreate:'Create workspace',cmdBaseline:'Pin exact Baseline',cmdValidate:'Validate',cmdPublish:'Publish revision',
    cmdInspect:'Inspect selection',cmdEdit:'Connect / edit relation',cmdRevise:'New revision',cmdTwin:'Twin / rebase',cmdHandoff:'Prepare run',
    secFacets:'Enterprise Model',secObjects:'Model objects',secTwins:'Digital Twins',secBaselines:'Baselines',secTemplates:'Device Templates',secRevisions:'Revisions',
    fSystems:'Systems',fApplications:'Applications',fServices:'Services',fNetworks:'Networks',fDevices:'Devices',fIdentities:'Identities',fData:'Data',fControls:'Security Controls',
    noSelection:'No selection',
    noSelectionHint:'Select a topology object to inspect its capabilities, behavior, telemetry and validation state. Previous selection context is cleared.',
    secCapabilities:'Capabilities',secBehavior:'Behavior',secTelemetry:'Telemetry generation',secValidation:'Validation',secRelations:'Typed relationships',
    lblId:'ID',lblType:'Type',lblSource:'Source',lblRevision:'Revision',lblLifecycle:'Lifecycle',
    sourceTruth:'Source truth',lblClassification:'Classification',lblCanonical:'Canonical product truth',lblPersistence:'Persistence',
    enabled:'Enabled',synthetic:'Synthetic',compatible:'Compatible',allowed:'Allowed with local scope',
    objects:'objects',legend:'Legend',legendTyped:'Typed relationship',legendDerived:'Derived / optional relationship',
    legendNote:'Solid = authored typed relation · dashed = derived overlay',
    zoomIn:'Zoom in',zoomOut:'Zoom out',fit:'Fit topology',
    topologyTitle:'Enterprise topology',twinTitle:'Training Twin — Application Security',
    draftRevision:'Draft Revision',publishedRevision:'Published Revision',
    deepLabel:'Temporary deep work',deepSummary:'validation · history · provenance',
    secValidationRules:'Validation rules',secLineage:'Revision lineage',secProvenance:'Provenance',
    workingRoot:'Current working root — no successor revision has been created yet.',
    cardTwin:'Digital Twin',cardEnterprise:'Enterprise',cardOverlay:'Overlay classification',cardBacked:'Enterprise-backed objects',cardLocal:'Simulation-local objects',
    cardIdentity:'Revision identity',cardRevisions:'Revisions',cardBaselines:'Baselines',cardBaselineDetail:'Pinned Baseline',cardState:'Authoring state',
    cardRelations:'Relation policy',cardTruth:'Truth boundaries',
    noteDistinct:'Enterprise and Twin remain distinct identities; rebinding selects another exact Baseline and never mutates a published one.',
    noteImmutable:'Baselines are immutable references. Rebinding a Twin selects another exact Baseline; it does not mutate a published Baseline in place.',
    noteLocal:'Rebase cannot promote Simulation-local objects into Enterprise inventory.',
    noteGeometry:'Geometry changes are representation-only; typed relation writes are validated by the shared RelationDomainAdapter before commit.',
    validated:'Validated',validationFailed:'Validation failed',validatedNone:'Validation passed',
    noBaselines:'No Baseline is pinned yet.',stateLabel:'State',baselineLabel:'Baseline',lineageLabel:'Lineage',digestLabel:'Digest',statusLabel:'Status',
    deepValidation:'Validation result',deepHistory:'History',deepProv:'Provenance boundary',
    facetCount:'objects',template:'template',none:'None',
    hintStatus:'Select a topology object to inspect it.',
    tabsLabel:'Enterprise workbench views',lblTarget:'Target',cancel:'Cancel',done:'completed',
    stalePreview:'Twin marked BASELINE_STALE for an explicit rebase preview.',
    immutableNotice:'Published revision is immutable. Selection and analysis remain interactive; create a successor revision to write.',
    staleNotice:'Twin baseline is stale. Modelling remains interactive; Run preparation is blocked until explicit rebase.',
    facetEmpty:'no Enterprise object in this facet yet.',
    baselinePinned:'Exact Baseline identity pinned.',applyRelation:'Validate and apply relation',
    relationCommitted:'Typed relation committed; geometry was not used as semantic truth.',
    cardComposition:'Model composition',cardBinding:'Binding & validation',relationsLabel:'Typed relations',objectsBacked:'Enterprise-backed',objectsLocal:'Simulation-local'
  },
  ar:{
    eyebrow:'مساحة عمل التوأم الرقمي لمؤسسة المؤسسة',structurePane:'بنية المؤسسة',contextPane:'سياق التحديد',
    tabTopology:'طوبولوجيا',tabTwins:'التوائم الرقمية',tabRevisions:'الإصدارات',tabBaselines:'Baselines',tabState:'الحالة والتحقق',
    cmdCreate:'إنشاء مساحة عمل',cmdBaseline:'تثبيت Baseline دقيق',cmdValidate:'تحقق',cmdPublish:'نشر الإصدار',
    cmdInspect:'فحص التحديد',cmdEdit:'ربط / تحرير علاقة',cmdRevise:'إصدار جديد',cmdTwin:'التوأم / إعادة الارتكاز',cmdHandoff:'تحضير تشغيل',
    secFacets:'نموذج المؤسسة',secObjects:'كائنات النموذج',secTwins:'التوائم الرقمية',secBaselines:'Baselines',secTemplates:'قوالب الأجهزة',secRevisions:'الإصدارات',
    fSystems:'الأنظمة',fApplications:'التطبيقات',fServices:'الخدمات',fNetworks:'الشبكات',fDevices:'الأجهزة',fIdentities:'الهويات',fData:'البيانات',fControls:'ضوابط الأمان',
    noSelection:'لا يوجد تحديد',
    noSelectionHint:'حدّد كائنًا في الطوبولوجيا لفحص قدراته وسلوكه وقياساته وحالة التحقق. يُمسح سياق التحديد السابق.',
    secCapabilities:'القدرات',secBehavior:'السلوك',secTelemetry:'توليد القياسات',secValidation:'التحقق',secRelations:' العلاقات المحددة النوع',
    lblId:'المعرّف',lblType:'النوع',lblSource:'المصدر',lblRevision:'الإصدار',lblLifecycle:'دورة الحياة',
    sourceTruth:'حقيقة المصدر',lblClassification:'التصنيف',lblCanonical:'حقيقة المنتج المرجعية',lblPersistence:'الحفظ',
    enabled:'مفعّل',synthetic:'اصطناعي',compatible:'متوافق',allowed:'مسموح ضمن النطاق المحلي',
    objects:'كائنًا',legend:'المفتاح',legendTyped:'علاقة محددة النوع',legendDerived:'علاقة مشتقة / اختيارية',
    legendNote:'الخط المتصل = علاقة مؤلَّفة · المتقطع = طبقة مشتقة',
    zoomIn:'تكبير',zoomOut:'تصغير',fit:'ملاءمة الطوبولوجيا',
    topologyTitle:'طوبولوجيا المؤسسة',twinTitle:'توأم التدريب — أمن التطبيقات',
    draftRevision:'مسودة إصدار',publishedRevision:'إصدار منشور',
    deepLabel:'مساحة عمل مؤقتة',deepSummary:'التحقق · السجل · الإثبات',
    secValidationRules:'قواعد التحقق',secLineage:'سلالة الإصدار',secProvenance:'حدود الإثبات',
    workingRoot:'جذر العمل الحالي — لم يُنشأ إصدار خليّد بعد.',
    cardTwin:'التوأم الرقمي',cardEnterprise:'المؤسسة',cardOverlay:'تصنيف الطبقات',cardBacked:'كائنات المؤسسة',cardLocal:'كائنات المحاكاة المحلية',
    cardIdentity:'هوية الإصدار',cardRevisions:'الإصدارات',cardBaselines:'Baselines',cardBaselineDetail:'الـ Baseline المثبّت',cardState:'حالة التحرير',
    cardRelations:'سياسة العلاقات',cardTruth:'حدود الحقيقة',
    noteDistinct:'المؤسسة والتوأم هويتان منفصلتان؛ إعادة الارتكاز تختار Baseline دقيقًا آخر ولا تُعدّل إصدارًا منشورًا.',
    noteImmutable:'خطوط الأساس مراجع غير قابلة للتعديل. إعادة ارتكاز التوأم تختار Baseline دقيقًا آخر ولا تُعدّل Baseline منشورًا في مكانه.',
    noteLocal:'لا يمكن لإعادة الارتكاز رفع كائنات المحاكاة المحلية إلى جرد المؤسسة.',
    noteGeometry:'تغييرات الهندسة تمثيلية فقط؛ تُتحقق كتابات العلاقات المحددة النوع عبر RelationDomainAdapter المشترك قبل الالتزام.',
    validated:'تم التحقق',validationFailed:'فشل التحقق',validatedNone:'اجتياز التحقق',
    noBaselines:'لم يُثبّت أي Baseline بعد.',stateLabel:'الحالة',baselineLabel:'Baseline',lineageLabel:'السلالة',digestLabel:'البصمة',statusLabel:'الوضع',
    deepValidation:'نتيجة التحقق',deepHistory:'السجل',deepProv:'حدود الإثبات',
    facetCount:'كائنًا',template:'قالب',none:'لا شيء',
    hintStatus:'حدّد كائنًا في الطوبولوجيا لفحصه.',
    tabsLabel:'عروض مساحة عمل المؤسسة',lblTarget:'الهدف',cancel:'إلغاء',done:'اكتمل',
    stalePreview:'وُعلّم التوأم BASELINE_STALE كمعاينة إعادة ارتكاز صريحة.',
    immutableNotice:'الإصدار المنشور غير قابل للتعديل. يبقى التحديد والتحليل تفاعليين؛ أنشئ إصدارًا خليّدًا للكتابة.',
    staleNotice:'خط أساس التوأم قديم. تبقى النمذجة تفاعلية؛ تحضير التشغيل متوقف حتى إعادة الارتكاز.',
    facetEmpty:'لا يوجد كائن مؤسسة في هذا المحور بعد.',
    baselinePinned:'تم تثبيت هوية Baseline الدقيقة.',applyRelation:'تحقق من العلاقة وطبّقها',
    relationCommitted:'تم الالتزام بالعلاقة المحددة النوع؛ لم تُستخدم الهندسة كحقيقة دلالية.',
    cardComposition:'تركيب النموذج',cardBinding:'الارتكاز والتحقق',relationsLabel:'العلاقات المحددة النوع',objectsBacked:'كائنات المؤسسة',objectsLocal:'كائنات المحاكاة المحلية'
  }
};
const T=()=>TEXT[activeLocale()]||TEXT.en;
const FACETS=()=>[['fSystems','system'],['fApplications','application'],['fServices','service'],['fNetworks','network'],['fDevices','device'],['fIdentities','identity'],['fData','data'],['fControls','control']];

const STYLE=`
.enterprise-studio{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--bg0);color:var(--text);direction:inherit;overflow:hidden}
.enterprise-studio *,.enterprise-studio *::before,.enterprise-studio *::after{box-sizing:border-box}
/* ---- identity + lifecycle header ---- */
.enterprise-top{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--bg1)}
.ent-id{display:flex;flex-direction:column;gap:7px;min-width:0;flex:1 1 300px}
.ent-eyebrow{font-size:11px;letter-spacing:.05em;color:var(--text3)}
.ent-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.ent-title strong{font-size:16px;font-weight:650;letter-spacing:-.01em;min-width:0;overflow-wrap:anywhere}
.ent-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ent-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end;margin-inline-start:auto;padding-top:2px}
.ent-sep{width:1px;min-height:24px;background:var(--line);margin:0 3px;align-self:stretch}
.ent-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;font-size:12.5px;font-weight:500;line-height:1;border:1px solid var(--line2);border-radius:7px;background:var(--bg2);color:var(--text);white-space:nowrap;cursor:pointer}
.ent-btn:hover:not(:disabled):not([aria-disabled=true]){border-color:var(--accent);background:var(--bg3)}
.ent-btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.ent-btn:disabled,.ent-btn[aria-disabled=true]{opacity:.55;cursor:not-allowed}
.ent-btn[data-variant=primary]{background:var(--accent);border-color:var(--accent);color:var(--bg0);font-weight:650}
.ent-btn[data-variant=primary]:hover:not(:disabled):not([aria-disabled=true]){background:var(--accent2);border-color:var(--accent2)}
.ent-btn[data-variant=primary]:disabled,.ent-btn[data-variant=primary][aria-disabled=true]{background:var(--bg2);border-color:var(--line);color:var(--text3);opacity:1}
.ent-meta .state-token{margin:0;padding:2px 9px;border:1px solid var(--line2);border-radius:999px;background:var(--bg2);font-size:11px;font-weight:650;line-height:1.6;letter-spacing:.02em}
.ent-meta .state-token[data-state=success]{border-color:var(--ok);color:var(--ok);background:var(--oks)}
.ent-meta .state-token[data-state=stale]{border-color:var(--warn);color:var(--warn);background:var(--warns)}
.ent-meta .state-token[data-state=error]{border-color:var(--bad);color:var(--bad);background:var(--bads)}
.ent-meta .state-token[data-state=neutral]{color:var(--text2)}
/* ---- view tabs + contextual tools ---- */
.enterprise-modebar{display:flex;align-items:center;gap:2px 2px;padding:0 10px 6px;border-bottom:1px solid var(--line);background:var(--bg1);overflow-x:auto;overflow-y:hidden;flex:none;flex-wrap:wrap}
.enterprise-modebar .ent-tab{appearance:none;border:0;background:transparent;color:var(--text2);font:inherit;font-size:13px;font-weight:500;padding:12px 12px 10px;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;align-items:center;gap:7px}
.enterprise-modebar .ent-tab:hover{color:var(--text);background:var(--as)}
.enterprise-modebar .ent-tab:focus-visible{outline:2px solid var(--focus);outline-offset:-3px}
.enterprise-modebar .ent-tab[aria-pressed=true]{color:var(--text);border-bottom-color:var(--accent);font-weight:650}
.ent-tools{margin-inline-start:auto;display:flex;align-items:center;gap:4px;padding-inline-start:12px;padding-inline-end:6px;flex:none;position:relative;z-index:2;background:var(--bg1)}
.ent-tools .ent-btn{height:28px;padding:0 9px}
.ent-tools .ent-hint{font-size:11px;color:var(--text3);padding-inline-end:4px;white-space:nowrap}
/* ---- status + canvas ---- */
.ent-body{position:relative;min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden}
.ent-canvas-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 16px;border-bottom:1px solid var(--line);background:var(--bg0)}
.ent-canvas-head h2{margin:0;font-size:15px;font-weight:650;letter-spacing:-.01em;min-width:0;overflow-wrap:anywhere}
.ent-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.ent-status{margin-inline-start:auto;font-size:11.5px;color:var(--text2);max-width:48%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:end}
.ent-status[data-tone=error]{color:var(--bad)}
.ent-status[data-tone=success]{color:var(--ok)}
.ent-status[data-tone=hint]{color:var(--text3)}
.ent-canvas{position:relative;flex:1;min-height:200px;overflow:hidden;background:var(--bg0)}
.ent-canvas .spatial-host{height:100%;min-height:0;flex:none}
.ent-canvas .spatial-readout{left:auto;right:14px;inset-block-end:12px}
/* The shared readout declares direction:ltr for itself, so logical end would not mirror it;
   pin it explicitly opposite the mirrored legend to keep the two from colliding in RTL. */
[dir=rtl] .ent-canvas .spatial-readout{left:14px;right:auto}
.ent-canvas .minimap{left:auto;right:auto;inset-inline-end:12px;inset-block-end:34px}
.ent-legend{position:absolute;inset-block-end:12px;inset-inline-start:14px;z-index:3;width:206px;max-width:calc(100% - 28px);padding:9px 11px;border:1px solid var(--line2);border-radius:9px;background:color-mix(in srgb,var(--bg1) 95%,transparent);font-size:10.5px}
.ent-legend h4{margin:0 0 7px;font-size:10.5px;font-weight:650;letter-spacing:.06em;color:var(--text2)}
.ent-legend ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.ent-legend li{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px;align-items:center;color:var(--text2)}
.ent-legend .key{height:0;border-top:2px solid var(--text2)}
.ent-legend .key.derived{border-top-style:dashed}
.ent-legend p{margin:7px 0 0;line-height:1.4;color:var(--text3)}
/* ---- structure (shell LEFT / collapsed fallback) ---- */
.ent-fallback{display:none;background:var(--bg1);min-width:0;overflow:auto}
.enterprise-studio[data-left=collapsed] .ent-fallback-left{display:block;border-bottom:1px solid var(--line);max-height:34vh;padding:4px 8px 8px}
.enterprise-studio[data-right=collapsed] .ent-fallback-right{display:block;border-top:1px solid var(--line);max-height:40vh;padding:12px 14px}
.ent-structure{display:block;padding:4px 6px 10px}
.ent-sec{padding:10px 4px 8px;border-bottom:1px solid var(--line)}
.ent-sec:last-child{border-bottom:0}
.ent-sec>h3{display:flex;align-items:center;gap:7px;margin:0 0 6px;padding:0 6px;font-size:11.5px;font-weight:650;letter-spacing:.03em;color:var(--text3)}
.ent-sec>h3 .ent-count{margin-inline-start:auto;font:10.5px var(--mono);color:var(--text3);letter-spacing:0}
.ent-row{display:flex;width:100%;align-items:center;gap:9px;min-height:31px;padding:5px 8px;margin:1px 0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text2);font:inherit;font-size:12.5px;text-align:start;cursor:pointer}
.ent-row .icon{flex:none;opacity:.85}
.ent-row .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ent-row .cnt{flex:none;font:10.5px var(--mono);color:var(--text3)}
.ent-row:hover{background:var(--bg2);border-color:var(--line2);color:var(--text)}
.ent-row:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
.ent-row[aria-current=true]{background:var(--as);border-color:var(--accent);color:var(--text);font-weight:600}
.ent-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--accent)}
.ent-dot[data-class=SIMULATION_LOCAL]{background:var(--bad)}
.ent-dot[data-tone=success]{background:var(--ok)}
.ent-dot[data-tone=warn]{background:var(--warn)}
/* ---- selection context (shell RIGHT / collapsed fallback) ---- */
.ent-context{display:grid;gap:0}
.ent-ctx-head{display:grid;gap:8px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.ent-ctx-head strong{font-size:14.5px;font-weight:650;overflow-wrap:anywhere}
.ent-ctx-sec{display:grid;gap:8px;padding:12px 0;border-bottom:1px solid var(--line)}
.ent-ctx-sec:last-child{border-bottom:0}
.ent-ctx-sec>h3{display:flex;align-items:center;gap:7px;margin:0;font-size:12.5px;font-weight:650;color:var(--text)}
.ent-ctx-sec>h3 .ent-chip{margin-inline-start:auto}
.ent-ctx-sec>p{margin:0;font-size:12.5px;line-height:1.55;color:var(--text2)}
.ent-bullets{margin:0;padding-inline-start:17px;display:grid;gap:5px;font-size:12.5px;line-height:1.5;color:var(--text2)}
.ent-dl{display:grid;grid-template-columns:minmax(0,max-content) minmax(0,1fr);gap:8px 12px;margin:0;font-size:12.5px}
.ent-dl dt{color:var(--text3);min-width:0}
.ent-dl dd{margin:0;min-width:0;overflow-wrap:anywhere;color:var(--text)}
.ent-empty{display:grid;gap:9px}
.ent-empty strong{font-size:14px}
.ent-empty p{margin:0;font-size:12.5px;line-height:1.6;color:var(--text2)}
/* ---- chips ---- */
.ent-chip{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border:1px solid var(--line2);border-radius:999px;background:var(--bg2);color:var(--text2);font-size:10.5px;font-weight:650;line-height:1.6;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.ent-chip[data-tone=success]{border-color:var(--ok);color:var(--ok);background:var(--oks)}
.ent-chip[data-tone=warn]{border-color:var(--warn);color:var(--warn);background:var(--warns)}
.ent-chip[data-tone=error]{border-color:var(--bad);color:var(--bad);background:var(--bads)}
.ent-chip[data-tone=accent]{border-color:var(--accent);color:var(--accent2);background:var(--as)}
.ent-chip[data-tone=violet]{border-color:var(--violet);color:var(--violet);background:color-mix(in srgb,var(--violet) 14%,transparent)}
/* ---- work panels (Digital Twins / Revisions / Baselines / State) ---- */
.ent-panel{min-height:0;flex:1;overflow:auto;padding:16px 18px 22px;display:grid;gap:14px;align-content:start}
.ent-split{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}
.ent-card{border:1px solid var(--line);border-radius:10px;background:var(--bg1);padding:13px 15px;min-width:0}
.ent-card>h3{display:flex;align-items:center;gap:8px;margin:0 0 11px;font-size:13px;font-weight:650;color:var(--text)}
.ent-card>h3 .ent-chip{margin-inline-start:auto}
.ent-card>p{margin:0 0 8px;font-size:12.5px;line-height:1.55;color:var(--text2)}
.ent-card>p:last-child{margin-bottom:0}
.ent-kv{display:grid;grid-template-columns:minmax(0,max-content) minmax(0,1fr);gap:8px 14px;margin:0;font-size:12.5px}
.ent-kv dt{color:var(--text3);min-width:0}
.ent-kv dd{margin:0;min-width:0;overflow-wrap:anywhere}
.ent-list{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.ent-list li{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--line);border-radius:7px;background:var(--bg2);font-size:12.5px;min-width:0}
.ent-list li .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ent-list li .meta{flex:none;font-size:11px;color:var(--text3)}
.ent-note{border:1px solid var(--line2);border-inline-start:3px solid var(--accent);border-radius:8px;padding:10px 12px;font-size:12.5px;line-height:1.55;color:var(--text2);background:var(--bg1)}
.ent-note[data-tone=warn]{border-inline-start-color:var(--warn);background:color-mix(in srgb,var(--warns) 45%,var(--bg1))}
.ent-note[data-tone=ok]{border-inline-start-color:var(--ok);background:color-mix(in srgb,var(--oks) 45%,var(--bg1))}
.ent-table{width:100%;border-collapse:collapse;font-size:12.5px}
.ent-table th{text-align:start;font-size:11px;font-weight:650;color:var(--text3);padding:0 10px 7px;border-bottom:1px solid var(--line);white-space:nowrap}
.ent-table td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}
.ent-table tbody tr:last-child td{border-bottom:0}
.ent-table tr[data-active=true] td{background:var(--as)}
.ent-table-wrap{overflow-x:auto;min-width:0}
/* ---- temporary deep work (shell BOTTOM / collapsed fallback) ---- */
.ent-deep{background:var(--bg1);border-top:1px solid var(--line)}
.ent-deep>summary{cursor:pointer;padding:9px 16px;font-size:12.5px;font-weight:650;display:flex;align-items:center;gap:8px;list-style:none}
.ent-deep>summary::-webkit-details-marker{display:none}
.ent-deep>summary::before{content:"▸";color:var(--text3)}
.ent-deep[open]>summary::before{content:"▾"}
.ent-deep-body{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;padding:0 16px 14px;max-height:210px;overflow:auto}
.ent-deep-host{padding:2px 4px 4px}
.ent-deep-host .ent-deep-body{padding:0;max-height:none}
/* ---- responsive composition ---- */
@media(max-width:1180px){.enterprise-top{gap:12px;padding:10px 14px}.ent-panel{padding:14px}.ent-actions{justify-content:flex-start}}
@media(max-width:900px){.enterprise-top .ent-actions{margin-inline-start:0;width:100%}.ent-status{max-width:100%}.ent-legend{width:196px}}
@media(max-width:640px){.ent-title strong{font-size:15px}.ent-canvas-head{padding:9px 12px}.ent-legend{inset-block-end:10px;inset-inline-start:10px;padding:8px 10px}}
@media(prefers-reduced-motion:reduce){.enterprise-studio *{scroll-behavior:auto!important;transition:none!important}}
`;

export function createEnterprisePresentationBinding(composition){
  if(!composition?.domain||!composition?.bus)throw Error('ENTERPRISE_PRESENTATION_COMPOSITION_REQUIRED');
  return Object.freeze({
    owner:'EnterpriseSurfacePresentation',
    workspaceInteraction:'WORKSPACE_FIRST',
    globalReadEditMode:false,
    domainOwner:composition.domain.owner,
    sharedOwners:composition.ownerBindings,
    regionContract:Object.freeze({TOP:'command binding only',LEFT:'typed structure content',CENTER:'shared Spatial presentation + typed state views',RIGHT:'selection context only',BOTTOM:'temporary deep work content only'})
  });
}

export function renderEnterpriseSurface(root,composition,{dir='ltr',spatialView=null}={}){
  if(!root||!composition)throw Error('ENTERPRISE_PRESENTATION_INPUT_REQUIRED');
  createEnterprisePresentationBinding(composition);
  if(typeof document!=='undefined')root.removeAttribute('dir');else root.dir=dir;
  root.dataset.surface='enterprise';root.dataset.workspaceInteraction='WORKSPACE_FIRST';delete root.dataset.readonly;
  let spatial=spatialView,mode='topology',status='',statusTone='neutral';
  const regionState={shell:false,observers:[],reprojects:0,shellPending:false};

  const nodeOptions=()=>(composition.domain.relations.nodes||[]).map(node=>({...node,status:'',subtitle:node.type?`Type: ${node.type}`:''}));
  const relationPayloadFromForm=form=>{const source=form.elements.source.value,target=form.elements.target.value,type=form.elements.type.value;const payload={source,target,type,direction:'directed',expectedVersion:composition.domain.relations.version};if(type==='CONNECTS_TO'){payload.sourcePin=`${source}:eth0`;payload.targetPin=`${target}:eth0`;}return payload};
  const setStatus=(message,tone='neutral')=>{status=String(message||'');statusTone=tone;const node=root.querySelector('[data-enterprise-status]');if(node){node.textContent=status||T().hintStatus;node.dataset.tone=tone}};
  const execute=(id,payload={})=>{const result=composition.bus.execute(id,{...payload,route:'enterprise-presentation'});if(result?.ok===false){setStatus(`${result.code}: ${result.reason}`,'error');return result}setStatus(`${id} · ${T().done}`,'success');draw({preserveSpatial:true});return result};

  const revisionToken=s=>String(s.revisionId||'').replace(/^ENT-REV-[^0-9]*/i,'').replace(/-DRAFT$/i,'').replace(/^0+(?=\d)/,'')||'—';
  const chip=(label,tone)=>`<span class="ent-chip"${tone?` data-tone="${tone}"`:''}>${esc(label)}</span>`;
  const stateChip=value=>chip(value,stateTone(value));
  const objectList=rows=>rows.length?`<ul class="ent-list">${rows.join('')}</ul>`:`<p>${esc(T().none)}</p>`;

  /* ---------------------------------------------------------- center identity head */
  const identityHead=s=>`<div class="ent-canvas-head"><h2>${esc(s.twinId?T().twinTitle:T().topologyTitle)}</h2><div class="ent-chips">${chip(`${s.authoring==='PUBLISHED'?T().publishedRevision:T().draftRevision} ${revisionToken(s)}`,stateTone(s.authoring))}${stateChip(s.twinBinding)}${chip(`${s.objects.length} ${T().objects}`)}</div><p class="ent-status" tabindex="-1" role="status" aria-live="polite" data-enterprise-status data-tone="${esc(status?statusTone:'hint')}" title="${esc(status)}">${esc(status||T().hintStatus)}</p></div>`;

  const validationRows=s=>{
    const checks=[[!!s.enterpriseId,T().lblId,s.enterpriseId],[!!s.revisionId,T().lblRevision,s.revisionId],[s.baseline.status==='AVAILABLE'&&!!s.baseline.id&&!!s.baseline.revision&&!!s.baseline.digest,T().baselineLabel,s.baseline.id||T().noBaselines]];
    return `<ul class="ent-list">${checks.map(([ok,label,value])=>`<li><span class="ent-dot" data-tone="${ok?'success':'error'}"></span><span class="lbl">${esc(label)}</span><span class="meta">${ok?esc(T().validated):esc(String(value))}</span></li>`).join('')}</ul>`;
  };

  /* ---------------------------------------------------------- work panels */
  const twinsPanel=s=>{
    const t=T();
    const backed=s.objects.filter(o=>o.classification==='ENTERPRISE_BACKED'),local=s.objects.filter(o=>o.classification==='SIMULATION_LOCAL');
    const row=o=>`<li><span class="ent-dot" data-class="${esc(o.classification)}"></span><span class="lbl">${esc(o.name||o.id)}</span><span class="meta">${esc(o.type||o.id)}</span></li>`;
    return `<div class="ent-panel"><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardTwin)}${stateChip(s.twinBinding)}</h3><dl class="ent-kv"><dt>${esc(t.lblId)}</dt><dd>${bdi(s.twinId||t.none)}</dd><dt>${esc(t.cardEnterprise)}</dt><dd>${bdi(s.enterpriseId||t.none)}</dd><dt>${esc(t.baselineLabel)}</dt><dd>${bdi(s.baseline.id||t.none)}</dd><dt>${esc(t.stateLabel)}</dt><dd>${esc(s.twinBinding)}</dd></dl><p>${esc(t.noteDistinct)}</p></section>
      <section class="ent-card"><h3>${esc(t.cardBacked)}${chip(`${backed.length} ${t.objects}`,'success')}</h3>${objectList(backed.map(row))}<p>${esc(t.noteLocal)}</p></section>
      </div><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardLocal)}${chip(`${local.length} ${t.objects}`,'warn')}</h3>${objectList(local.map(row))}</section>
      <section class="ent-card"><h3>${esc(t.cardOverlay)}</h3><dl class="ent-kv"><dt>${esc(t.cardBacked)}</dt><dd>${bdi(String(backed.length))}</dd><dt>${esc(t.cardLocal)}</dt><dd>${bdi(String(local.length))}</dd><dt>${esc(t.lblClassification)}</dt><dd>${bdi(s.sourceTruth.classification)}</dd></dl><p>${esc(t.noteGeometry)}</p></section>
    </div></div>`;
  };

  const revisionsPanel=s=>{
    const t=T();
    const lineage=s.lineage.at(-1);
    const published=s.publishedRevisions.filter(r=>r.revisionId!==s.revisionId);
    const backed=s.objects.filter(o=>o.classification==='ENTERPRISE_BACKED').length,local=s.objects.length-backed;
    const relationTypes=[...new Set(s.relations.map(r=>r.type))];
    return `<div class="ent-panel">
      <section class="ent-card"><h3>${esc(t.cardIdentity)}${stateChip(s.authoring)}</h3><dl class="ent-kv"><dt>${esc(t.cardEnterprise)}</dt><dd>${bdi(s.enterpriseId||t.none)}</dd><dt>${esc(t.lblRevision)}</dt><dd>${bdi(s.revisionId)}</dd><dt>${esc(t.stateLabel)}</dt><dd>${esc(s.authoring)}</dd><dt>${esc(t.baselineLabel)}</dt><dd>${bdi(s.baseline.id||t.none)}</dd><dt>${esc(t.secRelations)}</dt><dd>${bdi(`${s.relations.length} · v${s.relationVersion}`)}</dd></dl></section>
      <p class="ent-note" data-tone="${lineage?'':'warn'}">${esc(lineage?`${t.lineageLabel}: ${lineage.sourceRevisionId} → ${lineage.successorRevisionId} · ${lineage.reason}`:t.workingRoot)}</p>
      <div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardRevisions)}${chip(`${s.publishedRevisions.length} ${t.tabRevisions}`)}</h3>
        <div class="ent-table-wrap"><table class="ent-table"><thead><tr><th>${esc(t.lblRevision)}</th><th>${esc(t.stateLabel)}</th><th>${esc(t.lineageLabel)}</th><th>${esc(t.relationsLabel)}</th><th>${esc(t.digestLabel)}</th></tr></thead><tbody>
        <tr data-active="true"><td><bdi dir="ltr">${esc(s.revisionId)}</bdi></td><td>${esc(s.authoring)}</td><td>${esc(lineage?lineage.sourceRevisionId:t.workingRoot)}</td><td>${bdi(String(s.relations.length))}</td><td><bdi dir="ltr">${esc(s.baseline.digest||t.none)}</bdi></td></tr>
        ${published.map(r=>`<tr><td><bdi dir="ltr">${esc(r.revisionId)}</bdi></td><td>${esc(r.authoring)}</td><td>${esc(r.reason||'—')}</td><td>${bdi(String(r.relationCount??0))}</td><td><bdi dir="ltr">${esc(r.baselineDigest||t.none)}</bdi></td></tr>`).join('')}
        </tbody></table></div></section>
      <section class="ent-card"><h3>${esc(t.cardComposition)}${chip(`${s.objects.length} ${t.objects}`)}</h3><dl class="ent-kv"><dt>${esc(t.objectsBacked)}</dt><dd>${bdi(String(backed))}</dd><dt>${esc(t.objectsLocal)}</dt><dd>${bdi(String(local))}</dd><dt>${esc(t.relationsLabel)}</dt><dd>${bdi(String(s.relations.length))}</dd>${relationTypes.map(type=>`<dt><bdi dir="ltr">${esc(type)}</bdi></dt><dd>${bdi(String(s.relations.filter(r=>r.type===type).length))}</dd>`).join('')}</dl></section>
      </div></div>`;
  };

  const baselinesPanel=s=>{
    const t=T();
    const rows=s.baselines.map(b=>`<li><span class="ent-dot" data-tone="${b.status==='AVAILABLE'?'success':'warn'}"></span><span class="lbl"><bdi dir="ltr">${esc(b.id||t.none)}</bdi></span><span class="meta">${esc(`r${b.revision||'—'} · ${b.status||'UNAVAILABLE'}`)}</span></li>`);
    const valid=composition.domain.validate();
    return `<div class="ent-panel"><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardBaselines)}${chip(`${s.baselines.length} ${t.tabBaselines}`)}</h3>${objectList(rows)}</section>
      <section class="ent-card"><h3>${esc(t.cardBaselineDetail)}${stateChip(s.baseline.status)}</h3><dl class="ent-kv"><dt>${esc(t.lblId)}</dt><dd>${bdi(s.baseline.id||t.none)}</dd><dt>${esc(t.lblRevision)}</dt><dd>${bdi(s.baseline.revision||t.none)}</dd><dt>${esc(t.digestLabel)}</dt><dd>${bdi(s.baseline.digest||t.none)}</dd><dt>${esc(t.cardTwin)}</dt><dd>${esc(s.twinBinding)}</dd></dl></section>
      </div><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardBinding)}${chip(valid.ok?t.validated:t.validationFailed,valid.ok?'success':'error')}</h3><dl class="ent-kv"><dt>${esc(t.cardTwin)}</dt><dd>${esc(s.twinBinding)}</dd><dt>${esc(t.objectsBacked)}</dt><dd>${bdi(String(s.objects.filter(o=>o.classification==='ENTERPRISE_BACKED').length))}</dd><dt>${esc(t.relationsLabel)}</dt><dd>${bdi(String(s.relations.length))}</dd><dt>${esc(t.cardRevisions)}</dt><dd>${bdi(String(s.publishedRevisions.length))}</dd></dl></section>
      <section class="ent-card"><h3>${esc(t.secValidationRules)}${chip(valid.ok?t.validated:t.validationFailed,valid.ok?'success':'error')}</h3>${validationRows(s)}</section>
      </div><p class="ent-note" data-tone="warn">${esc(t.noteImmutable)}</p></div>`;
  };

  const statePanel=s=>{
    const t=T();
    const relationTypes=[...new Set(s.relations.map(r=>r.type))];
    return `<div class="ent-panel"><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.secValidationRules)}${chip(s.authoring==='PUBLISHED'?t.validated:t.tabState,s.authoring==='PUBLISHED'?'success':'accent')}</h3>${validationRows(s)}</section>
      <section class="ent-card"><h3>${esc(t.cardState)}${stateChip(s.authoring)}</h3><dl class="ent-kv"><dt>${esc(t.lblRevision)}</dt><dd>${bdi(s.revisionId)}</dd><dt>${esc(t.stateLabel)}</dt><dd>${esc(s.authoring)}</dd><dt>${esc(t.cardTwin)}</dt><dd>${esc(s.twinBinding)}</dd><dt>${esc(t.secRelations)}</dt><dd>${bdi(`v${s.relationVersion} · ${s.relations.length}`)}</dd></dl></section>
      </div><div class="ent-split">
      <section class="ent-card"><h3>${esc(t.cardRelations)}</h3><p>${esc(t.noteGeometry)}</p><dl class="ent-kv">${relationTypes.map(type=>`<dt><bdi dir="ltr">${esc(type)}</bdi></dt><dd>${bdi(String(s.relations.filter(r=>r.type===type).length))}</dd>`).join('')}</dl></section>
      <section class="ent-card"><h3>${esc(t.cardTruth)}</h3><dl class="ent-kv"><dt>${esc(t.lblClassification)}</dt><dd>${bdi(s.sourceTruth.classification)}</dd><dt>${esc(t.lblCanonical)}</dt><dd>${bdi(String(s.sourceTruth.canonicalProductTruth))}</dd><dt>${esc(t.lblPersistence)}</dt><dd>${bdi(s.persistence.status)}</dd></dl><p>${esc(t.noteLocal)}</p></section>
    </div></div>`;
  };

  const topologyCanvas=()=>`<div class="ent-canvas"><div id="spatialHost" data-enterprise-spatial class="spatial-host" aria-label="${esc(T().topologyTitle)}"></div><aside class="ent-legend" aria-label="${esc(T().legend)}"><h4>${esc(T().legend)}</h4><ul><li><span class="key" aria-hidden="true"></span><span>${esc(T().legendTyped)}</span></li><li><span class="key derived" aria-hidden="true"></span><span>${esc(T().legendDerived)}</span></li></ul></aside></div>`;

  const centerPanel=s=>{
    const body=mode==='twins'?twinsPanel(s):mode==='revisions'?revisionsPanel(s):mode==='baselines'?baselinesPanel(s):mode==='state'?statePanel(s):topologyCanvas();
    return identityHead(s)+body+(mode==='topology'?'':'<div id="spatialHost" hidden></div>');
  };

  /* ---------------------------------------------------------- selection context */
  const rightContext=s=>{
    const t=T(),sel=s.selection;
    if(!sel?.id)return `<div class="ent-context"><div class="ent-empty"><strong>${esc(t.noSelection)}</strong><p>${esc(t.noSelectionHint)}</p></div><div class="ent-ctx-sec"><h3>${icon('info')}${esc(t.sourceTruth)}</h3><dl class="ent-dl"><dt>${esc(t.lblClassification)}</dt><dd>${bdi(s.sourceTruth.classification)}</dd><dt>${esc(t.lblCanonical)}</dt><dd>${bdi(String(s.sourceTruth.canonicalProductTruth))}</dd><dt>${esc(t.lblPersistence)}</dt><dd>${bdi(s.persistence.status)}</dd></dl></div></div>`;
    const node=sel.object,links=s.relations.filter(r=>r.source===sel.id||r.target===sel.id);
    const caps=node?.capabilities||[];
    return `<div class="ent-context">
      <div class="ent-ctx-head"><strong>${esc(node?.name||sel.id)}</strong><div class="ent-chips">${chip(sel.classification||sel.kind,sel.classification==='SIMULATION_LOCAL'?'error':'accent')}${chip(node?.type||sel.kind)}</div></div>
      <div class="ent-ctx-sec"><dl class="ent-dl"><dt>${esc(t.lblId)}</dt><dd>${bdi(sel.id)}</dd><dt>${esc(t.lblType)}</dt><dd>${esc(node?.type||sel.kind)}</dd><dt>${esc(t.lblSource)}</dt><dd>${esc(node?.source||'Canonical relation projection')}</dd><dt>${esc(t.lblRevision)}</dt><dd>${bdi(s.revisionId)}</dd><dt>${esc(t.lblLifecycle)}</dt><dd>${esc(node?.lifecycle||'—')}</dd></dl></div>
      ${caps.length?`<div class="ent-ctx-sec"><h3>${icon('list')}${esc(t.secCapabilities)}</h3><ul class="ent-bullets">${caps.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>`:''}
      ${node?.behavior?`<div class="ent-ctx-sec"><h3>${icon('command')}${esc(t.secBehavior)}</h3><p>${esc(node.behavior)}</p></div>`:''}
      ${node?.telemetry?`<div class="ent-ctx-sec"><h3>${icon('history')}${esc(t.secTelemetry)}${chip(node.telemetry,node.telemetry==='Enabled'?'success':'warn')}</h3><p>${esc(node.telemetry==='Enabled'?'Generates application and access logs.':'Synthetic training telemetry; never canonical Enterprise inventory.')}</p></div>`:''}
      ${node?.validation?`<div class="ent-ctx-sec"><h3>${icon('shield')}${esc(t.secValidation)}${chip(node.validation,node.validation==='Compatible'?'success':'warn')}</h3><p>${esc(node.validation)}</p></div>`:''}
      ${links.length?`<div class="ent-ctx-sec"><h3>${icon('link')}${esc(t.secRelations)}${chip(String(links.length))}</h3><ul class="ent-bullets">${links.map(r=>`<li><bdi dir="ltr">${esc(r.type)} · ${esc(r.source===sel.id?r.target:r.source)}</bdi></li>`).join('')}</ul></div>`:''}
    </div>`;
  };

  /* ---------------------------------------------------------- structure pane */
  const structureHtml=s=>{
    const t=T();
    const facetCount=kw=>s.objects.filter(o=>`${o.type||''} ${o.name||''}`.toLowerCase().includes(kw)).length;
    const objectRow=o=>`<button type="button" class="ent-row" data-object="${esc(o.id)}" aria-current="${s.selection.id===o.id}" title="${esc(`${o.name||o.id} · ${o.type||''}`)}">${icon('ref')}<span class="lbl">${esc(o.name||o.id)}</span><span class="ent-dot" data-class="${esc(o.classification||'')}" aria-hidden="true"></span></button>`;
    const facetRow=([key,kw])=>{const count=facetCount(kw);return `<button type="button" class="ent-row" data-facet="${esc(kw)}">${icon('chev')}<span class="lbl">${esc(t[key])}</span><span class="cnt">${count||''}</span></button>`};
    const backed=s.objects.filter(o=>o.classification==='ENTERPRISE_BACKED'),local=s.objects.filter(o=>o.classification==='SIMULATION_LOCAL');
    const sec=(glyph,title,count,rows)=>`<section class="ent-sec"><h3>${icon(glyph)}<span>${esc(title)}</span>${count===null?'':`<span class="ent-count">${esc(String(count))}</span>`}</h3>${rows}</section>`;
    const twinRow=`<button type="button" class="ent-row" data-mode-target="twins" aria-current="${mode==='twins'}">${icon('layout')}<span class="lbl">${esc(s.twinId||'Training Twin')}</span><span class="cnt">${esc(s.twinBinding)}</span></button>`;
    const baselineRows=s.baselines.length?s.baselines.map(b=>`<button type="button" class="ent-row" data-mode-target="baselines" aria-current="${mode==='baselines'}">${icon('save')}<span class="lbl"><bdi dir="ltr">${esc(b.id||t.none)}</bdi></span><span class="cnt">${esc(b.status||'UNAVAILABLE')}</span></button>`).join(''):`<button type="button" class="ent-row" data-mode-target="baselines">${icon('save')}<span class="lbl">${esc(t.noBaselines)}</span></button>`;
    const templateRows=['Windows Server','Web Application','Database'].map(name=>`<button type="button" class="ent-row" data-facet="${esc(name.toLowerCase())}">${icon('type')}<span class="lbl">${esc(name)}</span><span class="cnt">${esc(t.template)}</span></button>`).join('');
    const revisionRows=`<button type="button" class="ent-row" data-mode-target="revisions" aria-current="${mode==='revisions'}">${icon('history')}<span class="lbl"><bdi dir="ltr">${esc(s.revisionId)}</bdi></span><span class="cnt">${esc(s.authoring)}</span></button>`+(s.publishedRevisions.length?`<button type="button" class="ent-row" data-mode-target="revisions">${icon('lock')}<span class="lbl">${esc(t.cardRevisions)}</span><span class="cnt">${s.publishedRevisions.length}</span></button>`:'');
    return `<div class="ent-structure">
      ${sec('shield',t.secFacets,FACETS().length,FACETS().map(facetRow).join(''))}
      ${sec('list',t.secObjects,backed.length,backed.map(objectRow).join(''))}
      ${sec('panel',t.secTwins,null,twinRow+local.map(objectRow).join(''))}
      ${sec('lock',t.secBaselines,s.baselines.length,baselineRows)}
      ${sec('folder',t.secTemplates,3,templateRows)}
      ${sec('history',t.secRevisions,null,revisionRows)}
    </div>`;
  };

  /* ---------------------------------------------------------- temporary deep work */
  const deepHtml=s=>{
    const t=T(),lineage=s.lineage.at(-1);
    return `<div class="ent-deep-body">
      <section class="ent-card"><h3>${esc(t.deepValidation)}${chip(s.authoring==='PUBLISHED'?t.validated:t.tabState,s.authoring==='PUBLISHED'?'success':'accent')}</h3>${validationRows(s)}</section>
      <section class="ent-card"><h3>${esc(t.deepHistory)}</h3><dl class="ent-kv"><dt>${esc(t.lineageLabel)}</dt><dd>${bdi(lineage?`${lineage.sourceRevisionId} → ${lineage.successorRevisionId}`:s.revisionId)}</dd><dt>${esc(t.cardRevisions)}</dt><dd>${bdi(String(s.publishedRevisions.length))}</dd><dt>${esc(t.secRelations)}</dt><dd>${bdi(`v${s.relationVersion}`)}</dd></dl></section>
      <section class="ent-card"><h3>${esc(t.deepProv)}</h3><dl class="ent-kv"><dt>${esc(t.lblClassification)}</dt><dd>${bdi(s.sourceTruth.classification)}</dd><dt>${esc(t.lblCanonical)}</dt><dd>${bdi(String(s.sourceTruth.canonicalProductTruth))}</dd><dt>${esc(t.lblPersistence)}</dt><dd>${bdi(s.persistence.status)}</dd></dl></section>
    </div>`;
  };

  /* SINGLE SHARED SPATIAL INSTANCE (SH-1 wiring correction).
     `spatialView` is the instance main.ts constructed and bound to RelationInteractionOwner.
     Every draw replaces root.innerHTML (single-container replacement render), which detaches
     that instance's host node. Instead of constructing a second/third SpatialView for the
     visible Enterprise canvas, the SAME host node is re-hosted into the freshly rendered
     canvas slot, so the central relation owner stays bound to the canvas the user can see
     and select in. */
  const inspectFromCanvas=(ids,route,redraw)=>{
    const id=Array.isArray(ids)?ids.at(-1)||null:(ids||null);
    composition.bus.execute('enterprise.inspect',{id,route});
    setStatus(id?`${T().cmdInspect}: ${id}`:T().noSelection,id?'success':'neutral');
    if(redraw)draw();else refreshRegions();
  };
  const wireSharedSpatial=view=>{
    const callbacks=view&&view.callbacks;if(!callbacks)return;
    if(!callbacks.__enterpriseBase)callbacks.__enterpriseBase={select:callbacks.select,open:callbacks.open};
    const base=callbacks.__enterpriseBase;
    callbacks.select=ids=>{base.select?.(ids);inspectFromCanvas(ids,'shared-spatial-selection',false)};
    callbacks.open=id=>{base.open?.(id);inspectFromCanvas([id],'shared-spatial-open',true)};
  };
  const ensureSpatial=host=>{
    const shared=spatialView||spatial;
    if(!shared){
      spatial=new SpatialView(host,nodeOptions(),composition.domain.relations.project(),{
        select:ids=>inspectFromCanvas(ids,'shared-spatial-selection',false),
        open:id=>inspectFromCanvas([id],'shared-spatial-open',true),
        change:()=>{}
      });
      spatial.setActiveMode('author');
      requestAnimationFrame?.(()=>spatial.fit?.());
      return spatial;
    }
    if(shared.host!==host){
      try{
        for(const attribute of Array.from(host.attributes||[]))shared.host.setAttribute(attribute.name??attribute[0],attribute.value??attribute[1]);
        if(typeof host.replaceWith==='function')host.replaceWith(shared.host);
      }catch(error){if(typeof console!=='undefined')console.warn('[W03-ENTERPRISE] shared spatial re-host skipped',error)}
    }
    spatial=shared;
    wireSharedSpatial(shared);
    spatial.model.nodes=nodeOptions();
    spatial.model.edges=composition.domain.relations.project();
    spatial.setActiveMode('author');
    spatial.render();
    requestAnimationFrame?.(()=>spatial.fit?.());
    return spatial;
  };
  const draw=({preserveSpatial=false}={})=>{
    const s=composition.domain.snapshot(),editAvailability=composition.bus.availability('enterprise.edit'),handoffAvailability=composition.bus.availability('enterprise.handoff');
    const t=T(),ws=foundation()?.workspace,useShell=typeof ws?.region==='function';
    if(!useShell)scheduleShellProjection();
    const pendingFocus=captureFocus();
    regionState.reprojects=0;

    const tabs=[['topology',t.tabTopology],['twins',t.tabTwins],['revisions',t.tabRevisions],['baselines',t.tabBaselines],['state',t.tabState]];
    const tools=mode==='topology'
      ? `<div class="ent-tools">${commandButton('enterprise.edit',t.cmdEdit,composition)}<button class="btn ent-btn" type="button" data-zoom="out" aria-label="${esc(t.zoomOut)}" title="${esc(t.zoomOut)}">−</button><button class="btn ent-btn" type="button" data-zoom="in" aria-label="${esc(t.zoomIn)}" title="${esc(t.zoomIn)}">+</button><button class="btn ent-btn" type="button" data-zoom="fit" title="${esc(t.fit)}">${icon('focus')}${esc(t.fit)}</button></div>`
      : `<div class="ent-tools"><span class="ent-hint">${esc(mode==='twins'?s.twinBinding:mode==='revisions'?`${s.authoring} · ${s.publishedRevisions.length} ${t.tabRevisions}`:mode==='baselines'?`${s.baselines.length} ${t.tabBaselines}`:`v${s.relationVersion} · ${s.relations.length}`)}</span></div>`;

    const header=`<header class="enterprise-top" data-region="TOP">
      <div class="ent-id">
        <span class="ent-eyebrow">${esc(t.eyebrow)}</span>
        <div class="ent-title"><strong>${esc(s.enterpriseId||'Enterprise')}</strong><span class="ent-eyebrow" aria-hidden="true">/</span><strong>${bdi(s.revisionId)}</strong></div>
        <div class="ent-meta"><span class="state-token" data-state="${stateTone(s.authoring)}">${esc(s.authoring)}</span><span class="state-token" data-state="${stateTone(s.twinBinding)}">${esc(s.twinBinding)}</span>${chip(`${s.objects.length} ${t.objects}`)}${chip(`${s.baselines.length} ${t.tabBaselines}`)}</div>
      </div>
      <div class="ent-actions">
        ${commandButton('enterprise.create',t.cmdCreate,composition)}
        ${commandButton('enterprise.baseline',t.cmdBaseline,composition)}
        <span class="ent-sep" aria-hidden="true"></span>
        ${commandButton('enterprise.validate',t.cmdValidate,composition,{},'primary')}
        ${commandButton('enterprise.publish',t.cmdPublish,composition)}
      </div>
    </header>`;

    const nav=`<nav class="enterprise-modebar" aria-label="${esc(t.tabsLabel)}">${tabs.map(([id,label])=>`<button class="ent-tab" type="button" data-mode="${id}" aria-pressed="${mode===id}">${esc(label)}</button>`).join('')}${tools}</nav>`;

    const body=`<main class="ent-body" data-region="CENTER">
        <div class="ent-fallback ent-fallback-left" data-region="LEFT" aria-label="${esc(t.structurePane)}">${structureHtml(s)}</div>
        ${centerPanel(s)}
        <div class="ent-fallback ent-fallback-right" data-region="RIGHT" aria-label="${esc(t.contextPane)}">${rightContext(s)}</div>
      </main>`;

    root.innerHTML=`<style data-enterprise-presentation-style>${STYLE}</style><section class="enterprise-studio" aria-label="${esc(t.eyebrow)}">${header}${nav}${body}</section>`;

    projectRegions(s,useShell,ws);
    observePanes();
    syncPaneState();

    bindControls(root);
    bindControls(document.querySelector('#domainLeftRegion'));
    bindControls(document.querySelector('#domainContext'));

    root.querySelector('[data-command="enterprise.create"]')?.addEventListener('click',()=>execute('enterprise.create',{enterpriseId:s.enterpriseId,twinId:s.twinId,revisionId:s.revisionId}));
    root.querySelector('[data-command="enterprise.validate"]')?.addEventListener('click',()=>execute('enterprise.validate'));
    root.querySelector('[data-command="enterprise.publish"]')?.addEventListener('click',()=>execute('enterprise.publish'));
    root.querySelector('[data-command="enterprise.revise"]')?.addEventListener('click',()=>execute('enterprise.revise',{expectedVersion:composition.domain.version,reason:'explicit Enterprise successor revision'}));
    root.querySelector('[data-command="enterprise.handoff"]')?.addEventListener('click',()=>execute('enterprise.handoff'));
    root.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{if(!spatial)return;const kind=button.dataset.zoom;if(kind==='in')spatial.zoom(1.25);else if(kind==='out')spatial.zoom(.8);else spatial.fit?.()}));
    root.querySelector('[data-command="enterprise.baseline"]')?.addEventListener('click',()=>openBaselineComposer(s));
    root.querySelector('[data-command="enterprise.twin"]')?.addEventListener('click',()=>{const current=composition.domain.snapshot();if(current.twinBinding==='BASELINE_STALE'){const overlays=current.objects.map(o=>({id:o.id,classification:o.classification}));execute('enterprise.twin',{action:'rebaseTwin',overlayRefs:overlays,conflictsResolved:true,targetBaseline:{id:`${current.baseline.id}-SUCCESSOR`,revision:String(Number(current.baseline.revision||0)+1),digest:`${current.baseline.digest}:successor`}})}else{composition.domain.setTwinBinding({baselineStatus:'STALE'});setStatus(T().stalePreview,'neutral');draw()}});
    root.querySelector('[data-command="enterprise.edit"]')?.addEventListener('click',()=>openRelationComposer());
    root.querySelector('[data-command="enterprise.inspect"]')?.addEventListener('click',()=>{const selected=composition.domain.snapshot().selection.id;composition.bus.execute('enterprise.inspect',{id:selected,route:'enterprise-header'});setStatus(selected?`${T().cmdInspect}: ${selected}`:T().noSelection,'success');draw()});

    if(mode==='topology'){
      const host=root.querySelector('[data-enterprise-spatial]');
      if(host)ensureSpatial(host);
    }
    if(!editAvailability.enabled&&s.authoring==='PUBLISHED')setStatus(T().immutableNotice,'neutral');
    else if(!handoffAvailability.enabled&&handoffAvailability.code==='BASELINE_STALE')setStatus(T().staleNotice,'neutral');
    if(pendingFocus)restoreFocus(pendingFocus);
  };

  /* ---------------------------------------------------------- pane projection */
  const projectRegions=(s,useShell,foundationWorkspace)=>{
    const ws=foundationWorkspace||foundation()?.workspace;
    if(typeof ws?.region!=='function')return;
    const t=T();
    try{
      ws.region('LEFT',{html:structureHtml(s),label:t.structurePane});
      ws.region('RIGHT',{html:rightContext(s),label:t.contextPane});
      ws.region('BOTTOM',{html:`<div class="ent-deep-host" data-ent-region="BOTTOM">${deepHtml(s)}</div>`,label:t.deepLabel,summary:t.deepSummary,open:false});
      regionState.shell=true;
      suppressPaneSiblings();
    }catch(error){if(typeof console!=='undefined')console.warn('[W03-ENTERPRISE] region projection failed',error)}
  };

  const refreshRegions=()=>{if(!regionState.shell)return;const s=composition.domain.snapshot(),ws=foundation()?.workspace;if(typeof ws?.region!=='function')return;try{
    ws.region('RIGHT',{html:rightContext(s),label:T().contextPane});
    ws.region('LEFT',{html:structureHtml(s),label:T().structurePane});
    suppressPaneSiblings();
  }catch(error){if(typeof console!=='undefined')console.warn('[W03-ENTERPRISE] region refresh failed',error)}};

  const suppressPaneSiblings=()=>{
    if(!regionState.shell||typeof document==='undefined')return;
    document.querySelectorAll('#leftPane .pbody > :not(#domainLeftRegion),#rightPane .pbody > :not(#domainContext)').forEach(node=>{
      if(node.hidden&&node.getAttribute('aria-hidden')==='true')return;
      node.hidden=true;node.inert=true;node.setAttribute('aria-hidden','true');node.dataset.donorSemantic='suppressed';
    });
  };

  /* The shell publishes CEPFoundation after the surface mounts, so the first draw can happen
     before workspace.region() exists. Retry a bounded number of times, then keep the in-stage
     fallback composition (never block mount, never loop). */
  const scheduleShellProjection=()=>{
    if(regionState.shellPending)return;
    regionState.shellPending=true;
    let attempts=0;
    const tick=()=>{
      attempts++;
      const ready=typeof foundation()?.workspace?.region==='function';
      if(ready){regionState.shellPending=false;draw();return}
      if(attempts<20)setTimeout(tick,50);else regionState.shellPending=false;
    };
    setTimeout(tick,0);
  };

  const syncPaneState=()=>{
    const studio=root.querySelector('.enterprise-studio');if(!studio)return;
    const left=regionState.shell?(document.querySelector('#leftPane')?.dataset.state||'open'):'collapsed';
    const right=regionState.shell?(document.querySelector('#rightPane')?.dataset.state||'open'):'collapsed';
    if(studio.dataset.left!==left)studio.dataset.left=left;
    if(studio.dataset.right!==right)studio.dataset.right=right;
  };

  const observePanes=()=>{
    if(typeof MutationObserver==='undefined')return;
    if(regionState.observers.length)return;
    ['#leftPane .pbody','#rightPane .pbody'].forEach(selector=>{
      const host=document.querySelector(selector);if(!host)return;
      const observer=new MutationObserver(()=>onPaneMutation());
      observer.observe(host,{subtree:true,attributes:true,attributeFilter:['hidden','aria-hidden','inert','style','class']});
      regionState.observers.push(observer);
    });
    ['#leftPane','#rightPane'].forEach(selector=>{
      const pane=document.querySelector(selector);if(!pane)return;
      const observer=new MutationObserver(()=>syncPaneState());
      observer.observe(pane,{attributes:true,attributeFilter:['data-state']});
      regionState.observers.push(observer);
    });
  };

  let projecting=false;
  const onPaneMutation=()=>{
    if(projecting)return;
    suppressPaneSiblings();
    syncPaneState();
    if(!regionState.shell)return;
    const leftOk=document.querySelector('#domainLeftRegion .ent-structure'),rightOk=document.querySelector('#domainContext .ent-context');
    if(leftOk&&rightOk)return;
    if(regionState.reprojects>6)return;   /* bounded self-heal: never loop */
    regionState.reprojects++;
    projecting=true;
    try{projectRegions(composition.domain.snapshot())}finally{projecting=false}
  };

  /* ---------------------------------------------------------- controls (stage + shell panes) */
  const bindControls=scope=>{
    if(!scope)return;
    scope.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;draw()}));
    scope.querySelectorAll('[data-mode-target]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.modeTarget;draw()}));
    scope.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('click',()=>{composition.bus.execute('enterprise.inspect',{id:button.dataset.object,route:'enterprise-structure'});setStatus(`${T().cmdInspect}: ${button.dataset.object}`,'success');draw()}));
    scope.querySelectorAll('[data-facet]').forEach(button=>button.addEventListener('click',()=>{
      const keyword=button.dataset.facet,label=(button.querySelector('.lbl')?.textContent||keyword).trim(),objects=composition.domain.snapshot().objects,match=objects.find(o=>`${o.type||''} ${o.name||''}`.toLowerCase().includes(keyword));
      if(match){composition.bus.execute('enterprise.inspect',{id:match.id,route:'enterprise-structure-facet'});setStatus(`${label}: ${match.name||match.id}`,'success');draw()}
      else setStatus(`${label}: ${T().facetEmpty}`,'neutral');
    }));
  };

  const openBaselineComposer=s=>{
    mode='baselines';draw();
    const host=root.querySelector('.ent-body');if(!host)return;
    const t=T(),form=document.createElement('form');
    form.className='ent-card ent-edit-form';form.dataset.baselineComposer='';
    form.innerHTML=`<h3>${esc(t.cmdBaseline)}</h3><label>${esc(t.lblId)}<input name="id" required placeholder="APPSEC-R3-BASELINE-02"></label><label>${esc(t.lblRevision)}<input name="revision" required placeholder="3"></label><label class="full">${esc(t.digestLabel)}<input name="digest" required placeholder="sha256:9f2c1a7d…"></label><div class="ent-form-actions"><button class="btn ent-btn" type="submit" data-variant="primary">${esc(t.cmdBaseline)}</button><button class="btn ent-btn" type="button" data-cancel-baseline>${esc(t.cancel)}</button></div>`;
    host.prepend(form);
    form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form),result=composition.bus.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:String(data.get('id')||''),revision:String(data.get('revision')||''),digest:String(data.get('digest')||'')}});if(result?.ok===false)setStatus(`${result.code}: ${result.reason||''}`,'error');else{setStatus(T().baselinePinned,'success');draw()}});
    form.querySelector('[data-cancel-baseline]')?.addEventListener('click',()=>{form.remove();setStatus('','neutral')});
    form.querySelector('input')?.focus();
  };

  const openRelationComposer=()=>{
    mode='topology';draw();
    const host=root.querySelector('.ent-body');if(!host)return;
    const t=T(),nodes=nodeOptions(),form=document.createElement('form');
    form.className='ent-card ent-edit-form';form.dataset.relationComposer='';
    form.innerHTML=`<h3>${esc(t.cmdEdit)}</h3><label>${esc(t.lblSource)}<select name="source">${nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.name||n.label||n.id)}</option>`).join('')}</select></label><label>${esc(t.lblTarget)}<select name="target">${nodes.map((n,i)=>`<option value="${esc(n.id)}" ${i===1?'selected':''}>${esc(n.name||n.label||n.id)}</option>`).join('')}</select></label><label class="full">${esc(t.secRelations)}<select name="type">${composition.domain.relations.types.map(type=>`<option value="${esc(type)}">${esc(type)}</option>`).join('')}</select></label><div class="ent-form-actions"><button class="btn ent-btn" type="submit" data-variant="primary">${esc(t.applyRelation)}</button><button class="btn ent-btn" type="button" data-cancel-relation>${esc(t.cancel)}</button></div>`;
    host.prepend(form);
    form.addEventListener('submit',event=>{event.preventDefault();const result=composition.bus.execute('enterprise.edit',{...relationPayloadFromForm(form),route:'enterprise-relation-composer'});if(result?.ok===false)setStatus(`${result.code}: ${result.reason}`,'error');else{setStatus(T().relationCommitted,'success');spatial=null;draw()}});
    form.querySelector('[data-cancel-relation]')?.addEventListener('click',()=>{form.remove();setStatus('','neutral')});
    form.querySelector('select')?.focus();
  };

  draw();
  return Object.freeze({
    owner:'EnterpriseSurfacePresentation',
    binding:createEnterprisePresentationBinding(composition),
    refresh:()=>draw(),
    focus:()=>root.querySelector('[data-region="CENTER"] .spatial-canvas, [data-region="CENTER"] button')?.focus(),
    spatial:()=>spatial,
    setMode:value=>{mode=value;draw();return mode;},
    destroy:()=>{
      regionState.observers.forEach(observer=>{try{observer.disconnect()}catch{}});regionState.observers=[];
      if(regionState.shell){const ws=foundation()?.workspace;['LEFT','RIGHT','BOTTOM'].forEach(key=>{const host=document.querySelector(key==='LEFT'?'#domainLeftRegion':key==='RIGHT'?'#domainContext':'#domainBottomRegion');if(host&&host.dataset?.regionBindingOwner)host.replaceChildren()})}
      regionState.shell=false;
      root.replaceChildren();spatial=null;
    }
  });
}
