/**
 * W03-LABS · bilingual label set.
 *
 * Arabic and English are BOTH first-class product languages (VISUAL_EXECUTION_STANDARD §7).
 * No direction and no language is baked into structure: every render pass picks the active
 * locale from the running preferences, and every layout uses logical CSS properties so
 * RTL/LTR mirror without a second markup path.
 */
export type LabLocale='ar'|'en';

export const TEXT={
  en:{
    /* left structure pane */
    structure:'Lab Structure',structureAria:'Lab structure navigation',
    overview:'Overview',knowledge:'Knowledge Links',environment:'Environment',initial:'Initial State',
    taskGraph:'Task Graph',tools:'Tools & Actions',signals:'Expected Signals',validation:'Validation',
    safety:'Safety & Reset',result:'Result Schema',completion:'Completion Criteria',
    branches:'Branches',definition:'Definition',noBranches:'No branch authored yet.',
    facets:'Facets',edgeType:'Edge',source:'From',target:'To',condition:'Condition',
    noKnowledge:'No knowledge unit is linked to this lab definition yet.',
    /* authoring palette */
    select:'Select',addTask:'Add Task',connect:'Connect',addBranch:'Add Branch',
    connectArmed:'Connect armed · select the source task, then the target task',
    connectSource:'Source task selected · select the target task',
    connectBlocked:'Connection blocked · {reason}',connected:'Connected {a} → {b}',
    toolActive:'{tool} tool active',sourceSelected:'Source selected',
    /* lifecycle action row */
    validate:'Validate',publish:'Publish Revision',prepare:'Prepare Run',more:'More actions',
    newRevision:'New Revision',exportSummary:'Export summary',clearSelection:'Clear selection',
    alreadyPublished:'Already published · use New Revision to author a successor',
    cmdAuthor:'Author Lab',cmdRevise:'Revise Lab',cmdPreflight:'Preflight Lab',
    cmdHandoff:'Prepare Lab handoff',
    /* board */
    draftRevision:'Draft Revision',revision:'Revision',lifecycle:'Lifecycle',
    purpose:'Purpose',taskCount:'tasks',edgeCount:'edges',nonLinear:'non-linear',
    nonLinearTrue:'graph is non-linear',nonLinearFalse:'graph is linear',
    legend:'Relationship Legend',linear:'Linear Dependency',conditional:'Conditional Unlock',
    optional:'Optional Branch',selected:'Selected',noSelection:'No task selected',
    required:'Required',optionalCompletion:'Optional',graphAria:'Lab task graph — the lab authoring work surface',
    boardAria:'Lab authoring workbench',
    /* right context pane */
    context:'Context',contextAria:'Selected lab context',
    objectiveType:'Objective type',requiredCapability:'Required capability',
    permittedTools:'Permitted tools',expectedSignal:'Expected signal',
    validationLink:'Validation link',completionContribution:'Completion contribution',
    labContext:'Lab context',labPurpose:'Purpose',requiredTools:'Required tools',
    boundEnvironment:'Bound environment',preflightResult:'Preflight',validationResult:'Validation',
    state:'State',identity:'Identity',taskId:'Task id',nodeType:'Node type',
    noTools:'No permitted tool bound to this task.',
    noSelectionHint:'Select a task node in the graph to inspect its authoring context.',
    blocked:'Blocked',ready:'Ready',checks:'checks',failed:'failed',passed:'passed',
    /* status line */
    stReady:'Preflight ready · run handoff is reachable from a published revision',
    stDraft:'Draft revision · validate, then publish to enable run preparation',
    stBlocked:'Preflight blocked · {n} unresolved check(s)',
    stValidated:'Validation complete · {n} checks passed',stValidationFailed:'Validation blocked · {n} findings',
    stPublished:'Revision published · run preparation is now available',
    stPrepared:'Run input manifest frozen · no run started',
    stRevised:'Successor revision created · source preserved',
    stTaskAdded:'Task added to the graph',stSelected:'Selected {title}',
    stCleared:'Selection cleared',
    stExported:'Lab summary copied to the clipboard',
    stExportBlocked:'Clipboard unavailable · summary shown in the status line',
    /* shell chrome */
    banner:'Labs · Lab authoring workspace',bannerBadge:'Labs',
    bannerLock:'Lab definition authoring · tasks, dependencies, validation, capability preflight and handoff truth',
    bottomTitle:'Lab task graph workbench',
    bottomSummary:'Definition authoring state · published revisions are immutable until a successor revision is created',
    hideStructure:'Structure',showContext:'Context',
    emptyGraph:'No task authored yet',emptyGraphHint:'Use Add Task to author the first node of the graph.'
  },
  ar:{
    /* left structure pane */
    structure:'بنية المختبر',structureAria:'التنقل في بنية المختبر',
    overview:'نظرة عامة',knowledge:'روابط المعرفة',environment:'البيئة',initial:'الحالة الأولية',
    taskGraph:'مخطط المهام',tools:'الأدوات والإجراءات',signals:'الإشارات المتوقعة',validation:'التحقق',
    safety:'السلامة وإعادة الضبط',result:'مخطط النتيجة',completion:'معايير الإكمال',
    branches:'الفروع',definition:'التعريف',noBranches:'لم يُؤلَّف أي فرع بعد.',
    facets:'الجوانب',edgeType:'الحافة',source:'من',target:'إلى',condition:'الشرط',
    noKnowledge:'لا توجد وحدة معرفية مرتبطة بتعريف المختبر بعد.',
    /* authoring palette */
    select:'تحديد',addTask:'إضافة مهمة',connect:'ربط',addBranch:'إضافة فرع',
    connectArmed:'تم تفعيل الربط · حدّد مهمة المصدر ثم مهمة الهدف',
    connectSource:'تم تحديد مهمة المصدر · حدّد مهمة الهدف',
    connectBlocked:'تعذّر الربط · {reason}',connected:'تم ربط {a} ← {b}',
    toolActive:'أداة {tool} فعّالة',sourceSelected:'تم تحديد المصدر',
    /* lifecycle action row */
    validate:'تحقق',publish:'نشر المراجعة',prepare:'تجهيز التشغيل',more:'إجراءات إضافية',
    newRevision:'مراجعة جديدة',exportSummary:'تصدير الملخص',clearSelection:'مسح التحديد',
    alreadyPublished:'منشورة بالفعل · استخدم «مراجعة جديدة» لتأليف مراجعة تالية',
    cmdAuthor:'تأليف المختبر',cmdRevise:'مراجعة المختبر',cmdPreflight:'فحص مختبر مسبق',
    cmdHandoff:'تحضير تسليم المختبر',
    /* board */
    draftRevision:'مسودة مراجعة',revision:'مراجعة',lifecycle:'دورة الحياة',
    purpose:'الغرض',taskCount:'مهام',edgeCount:'حواف',nonLinear:'غير خطي',
    nonLinearTrue:'المخطط غير خطي',nonLinearFalse:'المخطط خطي',
    legend:'دليل العلاقات',linear:'تبعية خطية',conditional:'فتح مشروط',
    optional:'فرع اختياري',selected:'المحدد',noSelection:'لا توجد مهمة محددة',
    required:'مطلوب',optionalCompletion:'اختياري',graphAria:'مخطط مهام المختبر — ساحة عمل التأليف',
    boardAria:'منضدة تأليف المختبر',
    /* right context pane */
    context:'السياق',contextAria:'سياق المختبر المحدد',
    objectiveType:'نوع الهدف',requiredCapability:'القدرة المطلوبة',
    permittedTools:'الأدوات المسموحة',expectedSignal:'الإشارة المتوقعة',
    validationLink:'ربط التحقق',completionContribution:'مساهمة الإكمال',
    labContext:'سياق المختبر',labPurpose:'الغرض',requiredTools:'الأدوات المطلوبة',
    boundEnvironment:'البيئة المرتبطة',preflightResult:'الفحص المسبق',validationResult:'التحقق',
    state:'الحالة',identity:'الهوية',taskId:'معرّف المهمة',nodeType:'نوع العقدة',
    noTools:'لا توجد أداة مسموحة مرتبطة بهذه المهمة.',
    noSelectionHint:'حدّد عقدة مهمة في المخطط لعرض سياق تأليفها.',
    blocked:'محجوب',ready:'جاهز',checks:'فحوصات',failed:'متعثرة',passed:'ناجحة',
    /* status line */
    stReady:'الفحص المسبق جاهز · تسليم التشغيل متاح من مراجعة منشورة',
    stDraft:'مسودة مراجعة · تحقّق ثم انشر لتفعيل تجهيز التشغيل',
    stBlocked:'الفحص المسبق محجوب · {n} فحص غير محسوم',
    stValidated:'اكتمل التحقق · {n} فحوصات ناجحة',stValidationFailed:'تعثّر التحقق · {n} ملاحظات',
    stPublished:'نُشرت المراجعة · تجهيز التشغيل متاح الآن',
    stPrepared:'تجمّد مُدخل التشغيل · لم يبدأ أي تشغيل',
    stRevised:'أُنشئت مراجعة تالية مع حفظ المصدر',
    stTaskAdded:'أُضيفت مهمة إلى المخطط',stSelected:'تم تحديد {title}',
    stCleared:'مُسح التحديد',
    stExported:'نُسخ ملخص المختبر إلى الحافظة',
    stExportBlocked:'الحافظة غير متاحة · يظهر الملخص في سطر الحالة',
    /* shell chrome */
    banner:'المختبرات · مساحة تأليف المختبر',bannerBadge:'المختبرات',
    bannerLock:'تأليف تعريف المختبر · المهام والتبعيات والتحقق والفحص المسبق وحقيقة التسليم',
    bottomTitle:'مساحة عمل مخطط مهام المختبر',
    bottomSummary:'حالة تأليف التعريف · المراجع المنشورة غير قابلة للتعديل حتى إنشاء مراجعة تالية',
    hideStructure:'البنية',showContext:'السياق',
    emptyGraph:'لم تُؤلَّف أي مهمة',emptyGraphHint:'استخدم «إضافة مهمة» لأول عقدة في المخطط.'
  }
} as const;

export const pickText=(locale:LabLocale)=>TEXT[locale]||TEXT.en;

/** Active locale is read from the running preference snapshot — never baked into markup. */
export const activeLocale=(fallback:'ar'|'en'='en'):'ar'|'en'=>{
  try{
    const doc=document as any;
    const lang=String(doc.documentElement?.lang||'').toLowerCase();
    if(lang.startsWith('ar'))return 'ar';
    if(lang.startsWith('en'))return 'en';
    const prefs=(globalThis as any).CEPFoundation?.workspace?.preferences?.values?.();
    const locale=String(prefs?.locale||fallback).toLowerCase();
    return locale.startsWith('ar')?'ar':'en';
  }catch{return fallback}
};

export const activeDirection=():'rtl'|'ltr'=>{
  try{
    const dir=String((document as any).documentElement?.dir||'').toLowerCase();
    if(dir==='rtl')return 'rtl';
    if(dir==='ltr')return 'ltr';
    return activeLocale()==='ar'?'rtl':'ltr';
  }catch{return 'ltr'}
};

export const esc=(value:any)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
export const fill=(template:string,values:Record<string,string|number>)=>String(template).replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''));

/** Locale-aware count with a unit; Arabic uses the plural-correct form for 3–10. */
export const countText=(n:number,kind:'tasks'|'edges',locale:LabLocale)=>locale==='ar'
  ? (kind==='tasks'?`${n} مهمة`:`${n} حافة`)
  : `${n} ${kind==='tasks'?'task':'edge'}${n===1?'':'s'}`;
