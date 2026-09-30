/**
 * W03-SCENARIOS · bilingual label set.
 *
 * Arabic and English are BOTH first-class product languages (VISUAL_EXECUTION_STANDARD §7).
 * No direction and no language is baked into structure: every render pass picks the active
 * locale from the document, and every layout uses logical CSS properties so RTL/LTR mirror
 * without a second markup path.
 */
                                     

export const TEXT={
  en:{
    /* left structure pane */
    structure:'Scenario Structure',overview:'Overview',environment:'Environment',roles:'Roles',phases:'Phases',
    events:'Events',injects:'Injects',decisions:'Decision Points',modules:'Lab Modules',tasks:'Tasks',rules:'Rules',
    observability:'Observability',completion:'Completion Criteria',references:'References',knowledgeUnits:'Knowledge Units',
    labLibrary:'Lab Library',
    /* workbench chrome */
    timeline:'Timeline',flow:'Flow',topology:'Topology',canvas:'Canvas',
    select:'Select',addPhase:'Add Phase',addEvent:'Add Event',addInject:'Add Inject',addDecision:'Add Decision',
    addLab:'Add Lab Module',connect:'Connect',more:'More actions',
    validate:'Validate',publish:'Publish Revision',prepare:'Prepare Run',revise:'New Revision',
    cmdAuthor:'Author Scenario',cmdRevise:'Revise Scenario',cmdValidate:'Validate Scenario',cmdPublish:'Publish validated Scenario revision',cmdPrepare:'Prepare Scenario',
    exportSummary:'Export summary',clearSelection:'Clear selection',addTask:'Add Task',addRule:'Add Rule',addObservability:'Add Observability',addCompletion:'Add Completion Criterion',available:'Available',unavailable:'Unavailable',
    /* board */
    draftRevision:'Draft Revision',revision:'Revision',alreadyPublished:'Already published · use New Revision to author a successor',lifecycle:'Lifecycle',phaseCount:'phases',elementCount:'elements',
    addElement:'Add Element',legend:'Legend (Relationships)',sequence:'Sequence / Flow',conditional:'Conditional Flow',
    authoredEdge:'Authored link',notStarted:'Validation has not been run yet.',
    /* right inspector */
    inspector:'Scenario Inspector',type:'Type',position:'Position',recipient:'Recipient',role:'Role',trigger:'Trigger',
    source:'Source',delivery:'Delivery',payloadType:'Payload type',channel:'Channel',branchImpact:'Branch impact',
    condition:'Condition',validation:'Validation',environment:'Environment',identity:'Identity',structureFacet:'Structure',elements:'Elements',links:'links',
    lifecycleLabel:'Lifecycle',phase:'Phase',order:'Order',contents:'Contents',gates:'Gates',scenario:'Scenario',
    requiredCaps:'Required capabilities',boundCaps:'Bound capabilities',binding:'Environment binding',
    fixtureBinding:'Local training environment · fixture binding, no provider claim',
    requirements:'Requirements',state:'State',passed:'passed',blocked:'blocked',noSelection:'No selection',
    noSelectionHint:'Select a phase or an element in the timeline to inspect its authoring detail.',
    empty:'Nothing authored yet',emptyHint:'Use the authoring palette to add the first phase or element.',
    emptyFacet:'No entries are authored in this facet yet.',
    knowledgeEmpty:'No knowledge unit is linked to this scenario yet.',
    labEmpty:'No lab module is pinned to this scenario yet.',
    /* kinds */
    kindEvent:'Event',kindInject:'Inject',kindDecision:'Decision point',kindLab:'Lab module',kindTask:'Task',
    kindRule:'Rule',kindObservability:'Observability',kindCompletion:'Completion criterion',
    /* status */
    stValidated:'Validation complete · {n} checks passed',stValidationFailed:'Validation blocked · {n} findings',
    stPublished:'Revision published · run preparation is now available',stPrepared:'Run input manifest frozen · no run started',
    stRevised:'Successor revision created · source preserved',stPhaseAdded:'Phase added to the timeline',
    stElementAdded:'{kind} added to {phase}',stSelected:'Selected {title}',
    stConnectArmed:'Connect armed · select the source element, then the target element',
    stConnectSource:'Source selected · select the target element',stConnected:'Connected {a} → {b}',
    stConnectBlocked:'Connection blocked · {reason}',stTool:'{tool} tool active',
    stCleared:'Selection cleared',stExported:'Scenario summary copied to the clipboard',
    stExportBlocked:'Clipboard unavailable · summary shown in the status line',
    /* announcements */
    banner:'Scenarios · Scenario authoring workspace',bannerBadge:'Scenarios',
    bannerLock:'Scenario definition authoring · phases, injects, decisions and preparation truth',
    hideStructure:'Structure',showContext:'Context',bottomTitle:'Scenario workbench',
    bottomSummary:'Local authoring state · durable save boundary is not bound for this surface',
    ariaBoard:'Scenario timeline workbench',ariaStructure:'Scenario structure navigation',
    ariaInspector:'Selected scenario element inspector',ariaToolbar:'Scenario view switcher',
    ariaPalette:'Scenario authoring palette',ariaLanes:'Time-ordered scenario phases'
  },
  ar:{
    structure:'بنية السيناريو',overview:'نظرة عامة',environment:'البيئة',roles:'الأدوار',phases:'المراحل',
    events:'الأحداث',injects:'الحقن',decisions:'نقاط القرار',modules:'وحدات المختبر',tasks:'المهام',rules:'القواعد',
    observability:'الرصد',completion:'معايير الإكمال',references:'المراجع',knowledgeUnits:'وحدات المعرفة',
    labLibrary:'مكتبة المختبرات',
    timeline:'الخط الزمني',flow:'التدفق',topology:'الطوبولوجيا',canvas:'اللوحة',
    select:'تحديد',addPhase:'إضافة مرحلة',addEvent:'إضافة حدث',addInject:'إضافة حقن',addDecision:'إضافة نقطة قرار',
    addLab:'إضافة وحدة مختبر',connect:'ربط',more:'إجراءات أخرى',
    validate:'تحقق',publish:'نشر المراجعة',prepare:'تحضير التشغيل',revise:'مراجعة جديدة',
    cmdAuthor:'تأليف السيناريو',cmdRevise:'مراجعة السيناريو',cmdValidate:'تحقق من السيناريو',cmdPublish:'نشر المراجعة المُتحقَّق منها',cmdPrepare:'تحضير تشغيل السيناريو',
    exportSummary:'تصدير الملخص',clearSelection:'مسح التحديد',addTask:'إضافة مهمة',addRule:'إضافة قاعدة',addObservability:'إضافة بند رصد',addCompletion:'إضافة معيار إكمال',available:'متاح',unavailable:'غير متاح',
    draftRevision:'مسودة مراجعة',revision:'مراجعة',alreadyPublished:'نُشرت هذه المراجعة · استعمل «مراجعة جديدة» للتأليف تاليًا',lifecycle:'دورة الحياة',phaseCount:'مراحل',elementCount:'عناصر',
    addElement:'إضافة عنصر',legend:'مفتاح (العلاقات)',sequence:'التسلسل / التدفق',conditional:'التدفق الشرطي',
    authoredEdge:'رابط مُؤلَّف',notStarted:'لم يُنفَّذ التحقق بعد.',
    inspector:'مفتش السيناريو',type:'النوع',position:'الموضع',recipient:'المستلم',role:'الدور',trigger:'المُشغِّل',
    source:'المصدر',delivery:'التسليم',payloadType:'نوع الحمولة',channel:'القناة',branchImpact:'تأثير الفرع',
    condition:'الشرط',validation:'التحقق',environment:'البيئة',identity:'الهوية',structureFacet:'البنية',elements:'العناصر',links:'روابط',
    lifecycleLabel:'دورة الحياة',phase:'المرحلة',order:'الترتيب',contents:'المحتويات',gates:'بوابات القرار',scenario:'السيناريو',
    requiredCaps:'القدرات المطلوبة',boundCaps:'القدرات المرتبطة',binding:'ربط البيئة',
    fixtureBinding:'بيئة تدريب محلية · ربط ضمن بيانات تجريبية دون ادعاء مزوّد',
    requirements:'المتطلبات',state:'الحالة',passed:'ناجح',blocked:'محجوب',noSelection:'لا يوجد تحديد',
    noSelectionHint:'حدّد مرحلة أو عنصرًا في الخط الزمني لعرض تفاصيل تأليفه.',
    empty:'لا يوجد تأليف بعد',emptyHint:'استخدم لوحة التأليف لإضافة أول مرحلة أو عنصر.',
    emptyFacet:'لا توجد عناصر مُؤلَّفة في هذا المحور بعد.',
    knowledgeEmpty:'لا توجد وحدة معرفة مرتبطة بهذا السيناريو بعد.',
    labEmpty:'لا توجد وحدة مختبر مثبَّتة في هذا السيناريو بعد.',
    kindEvent:'حدث',kindInject:'حقن',kindDecision:'نقطة قرار',kindLab:'وحدة مختبر',kindTask:'مهمة',
    kindRule:'قاعدة',kindObservability:'رصد',kindCompletion:'معيار إكمال',
    stValidated:'اكتمل التحقق · {n} فحصًا ناجحًا',stValidationFailed:'التحقق محجوب · {n} ملاحظة',
    stPublished:'نُشرت المراجعة · تحضير التشغيل متاح الآن',stPrepared:'تجمّد بيان إدخال التشغيل · لم يبدأ التشغيل',
    stRevised:'أُنشئت مراجعة تالية · حُفظ المصدر',stPhaseAdded:'أُضيفت مرحلة إلى الخط الزمني',
    stElementAdded:'أُضيف {kind} إلى {phase}',stSelected:'حُدّد {title}',
    stConnectArmed:'الربط مفعّل · حدّد عنصر المصدر ثم عنصر الهدف',
    stConnectSource:'حُدّد المصدر · حدّد الآن عنصر الهدف',stConnected:'رُبط {a} ← {b}',
    stConnectBlocked:'الربط محجوب · {reason}',stTool:'أداة {tool} مفعّلة',
    stCleared:'مُسح التحديد',stExported:'نُسخ ملخص السيناريو إلى الحافظة',
    stExportBlocked:'الحافظة غير متاحة · عُرض الملخص في سطر الحالة',
    banner:'السيناريوهات · مساحة تأليف السيناريوهات',bannerBadge:'السيناريوهات',
    bannerLock:'تأليف تعريف السيناريو · المراحل والحقن ونقاط القرار وحقائق الإعداد',
    hideStructure:'البنية',showContext:'السياق',bottomTitle:'منضدة عمل السيناريو',
    bottomSummary:'حالة تأليف محلية · حدود الحفظ الدائم غير مرتبطة بهذه المساحة',
    ariaBoard:'منضدة الخط الزمني للسيناريو',ariaStructure:'تنقل بنية السيناريو',
    ariaInspector:'مفتش العنصر المحدد في السيناريو',ariaToolbar:'مبدّل عروض السيناريو',
    ariaPalette:'لوحة تأليف السيناريو',ariaLanes:'مراحل السيناريو المرتبة زمنيًا'
  }
}         ;

export const pickText=(locale               )=>TEXT[locale==='ar'?'ar':'en']                         ;
export const activeLocale=()               =>{
  if(typeof document==='undefined')return 'en';
  return String(document.documentElement.lang||document.body?.getAttribute('lang')||'en').toLowerCase().startsWith('ar')?'ar':'en';
};
