/**
 * W03-RUNS surface strings — Arabic and English are BOTH first-class.
 * There is no permanent product-language authority: the active locale is read from the
 * document language (set from the user's Settings preference) at render time.
 * Technical tokens (ids, digests, ports, protocols) stay LTR-isolated via <bdi dir="ltr">.
 */
const AR={
  workspace:'مساحة تشغيل المحاكاة',
  tabs:{operations:'العمليات',preflight:'ما قبل التشغيل',timeline:'الخط الزمني',topology:'الطوبولوجيا'},
  actions:{pause:'إيقاف مؤقت',resume:'استئناف',stop:'إنهاء التشغيل',snapshot:'التقاط لقطة',more:'المزيد',prepare:'تجهيز الإعداد',start:'بدء التشغيل',preflight:'فحص ما قبل التشغيل'},
  identity:{phase:'المرحلة الحالية',role:'الدور التشغيلي',task:'المهمة الحالية',run:'التشغيل',health:'الحالة'},
  structure:{title:'هيكل التشغيل',overview:'نظرة عامة',timeline:'الخط الزمني للسيناريو',tasks:'المهام',devices:'الأجهزة',events:'الأحداث والحقن',telemetry:'القياس عن بُعد',observations:'الملاحظات',artifacts:'المواد'},
  sourceTabs:{all:'SIEM / المراقبة'},
  alerts:{title:'التنبيهات',time:'الوقت (UTC)',alert:'التنبيه',severity:'الشدة',status:'الحالة',filters:'عوامل التصفية',refresh:'تحديث',window:'نطاق ملاحظة',none:'لا توجد تنبيهات تطابق التصفية الحالية.',range:s=>`مدى ${s}`},
  detail:{title:'تفاصيل التنبيه',source:'المصدر',ip:'عنوان المصدر',uri:'مسار الطلب',method:'طريقة HTTP',id:'معرّف التنبيه',rule:'قاعدة الكشف',technique:'التقنية',first:'أول رصد',severity:'الشدة',run:'التشغيل',tabs:{timeline:'الخط الزمني للأحداث',rule:'القاعدة المطابقة',attributes:'السمات',artifacts:'المواد المرتبطة'},cols:{t:'الوقت (UTC)',s:'المصدر',e:'الحدث',d:'التفاصيل'},filter:'تصفية الأحداث…',highlight:'تمييز',export:'تصدير',exported:n=>`تم تصدير ${n} حدثًا مرصودًا محليًا.`,exportFail:'تعذر التصدير في هذا السياق؛ تبقى الأحداث معروضة كما هي.',matches:n=>`${n} مطابقة`},
  panels:{
    overview:{title:'ملخص التشغيل',manifest:'البيان المجمّد',digest:'بصمة المدخلات',seed:'البذرة',engine:'المحرّك',isolation:'نطاق العزل',createdAt:'تاريخ الإنشاء',provenance:'الإثبات',receipts:'إيصالات دورة الحياة',lifecycle:'دورة الحياة'},
    tasks:{title:'مهام التشغيل',id:'المعرّف',label:'المهمة',state:'الحالة',progress:'التقدّم'},
    devices:{title:'الأجهزة والأدوات المحاكية',id:'المعرّف',name:'الاسم',type:'النوع',state:'الحالة',terminal:'الطرفية',action:'إجراء',open:'فتح الطرفية',session:'جلسة مفتوحة',none:'لا جلسة',capable:'قابلة للتشغيل',notCapable:'غير متاحة',up:'تعمل',down:'متوقفة'},
    events:{title:'الأحداث المرصودة',seq:'التسلسل',type:'النوع',actor:'الفاعل',source:'المصدر',detail:'التفاصيل',ordering:'الترتيب مرصود لا مُعاد بناؤه.',gaps:n=>`${n} فجوة سلسلة مسجّلة`},
    observations:{title:'سجل التشغيل الملاحظ',note:'سطور مسجّلة من المحاكاة الداخلية؛ لا يُعاد ترتيبها.'},
    artifacts:{title:'المواد الممسوحة',id:'المعرّف',kind:'النوع',seq:'التسلسل',time:'الوقت',digest:'البصمة'},
    timeline:{title:'الخط الزمني · الترتيب المرصود'},
    topology:{title:'كائنات التشغيل والأدوات'},
    preflight:{source:'تعريف المصدر',revision:'الإصدار',manifest:'بيان التشغيل المجمّد',checks:'فحوصات الجاهزية',immutability:'التجزئة محجوزة على مستوى الكائن؛ تبقى مساحة العمل تفاعلية.'}
  },
  right:{
    rationale:'منطق الكشف',scope:'نطاق الارتباط',implication:'الأثر التشغيلي',observation:'ملاحظة',recommendation:'الخطوة التالية',
    preflightTruth:'الحقائق الأساسية',preflightSource:'مصدر الإعداد',preflightWhy:'لماذا يهم هذا',preflightAdvice:'توصية الإعداد',
    provider:'المزوّد',runtimeTruth:'حقيقة التشغيل',connection:'الاتصال',epoch:'الحقبة',provenance:'الإثبات',
    noSelection:'لا تنبيه محدد. اختر تنبيهًا من قائمة العمليات لعرض سياقه.',
    platformNote:'بوابات ConPTY ونافذة Windows وقوة العرض بقيمة OS تبقى غير موثّقة هنا؛ هذا المرشّح لا يغيّر ولا يشهد على مزوّذ Windows.'
  },
  status:{connected:'متصل',disconnected:'منقطع',unverified:'بوابة منصة غير موثّقة',truth:'حقيقة المحاكاة الداخلية',terminal:'مساحة عمل مؤقتة',terminalIdle:'لا جلسة طرفية مفتوحة بعد — افتح طرفية من جهاز مهيّأ.',terminalBound:'العرض مملوك لـ OperationalSessionOwner و OperationalTerminalHost'},
  banner:{blocked:'تعذر بدء التشغيل',ready:'التشغيل جاهز للبدء',blockedWhy:'استمرار التشغيل غير متاح حتى تجتاز الفحوصات الإلزامية.',readyWhy:'اكتملت الفحوصات وتجمّد البيان؛ يمكن بدء التشغيل.',summary:(p,b,a)=>`${p} ناجح، ${b} موقوف، ${a} استشاري.`},
  readiness:{title:'فحص ما قبل التشغيل',noWrite:'المشروع بلا كتابة (projection) · لا يغيّر حالة التشغيل.',status:'الحالة',check:'الفحص',detail:'التفاصيل'},
  nav:{label:'تنقل بنية التشغيل'}
};
const EN={
  workspace:'Run operations workspace',
  tabs:{operations:'Operations',preflight:'Preflight',timeline:'Timeline',topology:'Topology'},
  actions:{pause:'Pause',resume:'Resume',stop:'End Run',snapshot:'Capture Snapshot',more:'More',prepare:'Prepare Run',start:'Start Run',preflight:'Preflight'},
  identity:{phase:'Current Phase',role:'Operational Role',task:'Current Task',run:'Run',health:'Health'},
  structure:{title:'Run Structure',overview:'Overview',timeline:'Scenario Timeline',tasks:'Tasks',devices:'Devices',events:'Events & Injects',telemetry:'Telemetry',observations:'Observations',artifacts:'Artifacts'},
  sourceTabs:{all:'SIEM / Monitoring'},
  alerts:{title:'Alerts',time:'Time (UTC)',alert:'Alert Title',severity:'Severity',status:'Status',filters:'Filters',refresh:'Refresh',window:'Observation window',none:'No alert matches the current filters.',range:s=>`Window ${s}`},
  detail:{title:'Alert Details',source:'Source',ip:'Source IP',uri:'Request URI',method:'HTTP Method',id:'Alert ID',rule:'Detection Rule',technique:'Technique',first:'First observed',severity:'Severity',run:'Run',tabs:{timeline:'Event Timeline',rule:'Matched Rule',attributes:'Attributes',artifacts:'Related Artifacts'},cols:{t:'Time (UTC)',s:'Source',e:'Event',d:'Details'},filter:'Filter events…',highlight:'Highlight',export:'Export',exported:n=>`Exported ${n} observed event(s) as a local download.`,exportFail:'Export is unavailable in this context; the observed events remain displayed as recorded.',matches:n=>`${n} match(es)`},
  panels:{
    overview:{title:'Run summary',manifest:'Frozen manifest',digest:'Input digest',seed:'Seed',engine:'Engine',isolation:'Isolation scope',createdAt:'Created at',provenance:'Provenance',receipts:'Lifecycle receipts',lifecycle:'Lifecycle'},
    tasks:{title:'Run tasks',id:'ID',label:'Task',state:'State',progress:'Progress'},
    devices:{title:'Runtime objects & tools',id:'ID',name:'Name',type:'Type',state:'State',terminal:'Terminal',action:'Action',open:'Open terminal',session:'Open session',none:'No session',capable:'Available',notCapable:'Unavailable',up:'UP',down:'DOWN'},
    events:{title:'Observed runtime events',seq:'Seq',type:'Event type',actor:'Actor',source:'Source',detail:'Details',ordering:'Observed order is preserved, never reconstructed.',gaps:n=>`${n} recorded sequence gap(s)`},
    observations:{title:'Simulation observation log',note:'Lines recorded by the internal simulation; order is preserved as observed.'},
    artifacts:{title:'Captured artifacts',id:'ID',kind:'Kind',seq:'Seq',time:'Time',digest:'Digest'},
    timeline:{title:'Run Timeline · observed order'},
    topology:{title:'Runtime Objects & Tools'},
    preflight:{source:'Source Definition',revision:'Revision',manifest:'Frozen Run Manifest',checks:'Readiness Checks',immutability:'Immutability is object-scoped; the workspace remains interactive.'}
  },
  right:{
    rationale:'Detection rationale',scope:'Correlation scope',implication:'Operational implication',observation:'Observation',recommendation:'Recommended next step',
    preflightTruth:'Runtime truth',preflightSource:'Preparation source',preflightWhy:'Why this matters',preflightAdvice:'Preparation advice',
    provider:'Provider',runtimeTruth:'Runtime truth',connection:'Connection',epoch:'Provider epoch',provenance:'Provenance',
    noSelection:'No alert selected. Pick an alert in the Operations list to read its context.',
    platformNote:'ConPTY, Windows topmost and native-window claims remain unverified here. This candidate neither alters nor certifies the Windows platform provider.'
  },
  status:{connected:'CONNECTED',disconnected:'DISCONNECTED',unverified:'UNVERIFIED_PLATFORM_GATE',truth:'INTERNAL_SIMULATION',terminal:'Temporary work area',terminalIdle:'No terminal session open yet — open one from a capable device.',terminalBound:'Presentation owned by OperationalSessionOwner + OperationalTerminalHost'},
  banner:{blocked:'Run start unavailable',ready:'Run is ready to start',blockedWhy:'Run start remains unavailable until the mandatory checks pass.',readyWhy:'Checks passed and the manifest is frozen; start is permitted.',summary:(p,b,a)=>`${p} passed, ${b} blocked, ${a} advisory.`},
  readiness:{title:'Readiness preflight',noWrite:'No-write projection · this view never mutates run state.',status:'Status',check:'Check',detail:'Details'},
  nav:{label:'Run structure navigation'}
};
export const RUNS_STRINGS=Object.freeze({en:EN,ar:AR});
export const runsLocale=doc=>{const lang=String(doc?.documentElement?.lang||'').toLowerCase();return lang.startsWith('ar')?'ar':'en'};
export const runsT=locale=>RUNS_STRINGS[locale==='ar'?'ar':'en'];
