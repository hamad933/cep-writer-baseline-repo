/**
 * W03-RESULTS surface strings — Arabic and English are BOTH first-class.
 * There is no permanent Arabic-first or English-first product authority: the active locale is
 * read from the document language (set from the user's Settings preference) at render time, or
 * from the explicit `locale` option. Technical tokens (result ids, revisions, digests, owner
 * names, codes) stay LTR-isolated via <bdi dir="ltr"> and are never translated.
 */
const AR={
  aria:{studio:'مساحة تحليل النتائج التاريخية',modes:'أوضاع النتائج',structure:'بنية النتيجة',context:'فاحص السياق'},
  top:{title:'النتائج · تحليل تاريخي',sub:'حقائق مختومة + إعادة تشغيل / مراجعة بعد المهمة / مقارنة تفاعلية',handoff:'تسليم مرشّح الأدلة'},
  modes:{result:'النتيجة',replay:'إعادة التشغيل',aar:'مراجعة ما بعد المهمة',compare:'المقارنة'},
  identity:{none:'لا توجد نتيجة محددة',sealed:'مختومة',events:n=>`${n} حدث(أحداث) مسجّل`},
  structure:{title:'بنية النتيجة',facets:['نظرة عامة','نواتج المهام','نواتج المراحل','القرارات','الملاحظات','مواد التشغيل','الإثبات']},
  bottom:{title:'مساحة عمل مؤقتة',note:'السجلات والأحداث للعرض فقط؛ لا تنفيذ لأي إعادة تشغيل.',ready:'جاهز.'},
  empty:{UNAVAILABLE:'مزوّد النتائج غير متاح. لا تُستنتج أي حقيقة عن نتيجة مختومة.',EMPTY:'مزوّد النتائج متاح وأرجع مجموعة فارغة.',fallback:'لا توجد نتائج مختومة متاحة.',select:'حدّد مراجعة نتيجة مختومة بالضبط.'},
  ownership:{title:'حل الملكية',replay:'ملكية إعادة التشغيل',compare:'ملكية المقارنة',review:'سلطة المراجعة',reviewNone:'لا سلطة — لا تصدر نتائج مراجعة أبدًا',inert:'إعادة التشغيل تنفّذ التشغيل',inertNo:'false — تاريخية/غير نشطة',instances:'مرات امتلاك TimelineReplayOwner'},
  context:{
    replay:{title:'سياق إعادة التشغيل',owner:'مالك إعادة التشغيل',event:'الحدث المحدد',state:'الحالة',runtime:'تنفيذ التشغيل'},
    aar:{title:'سياق المراجعة',analysis:'معرّف التحليل',none:'لم يُنشأ',revision:'المراجعة',state:'الحالة',facts:'تغيير الحقائق'},
    compare:{title:'سياق المقارنة',owner:'المالك',state:'الحالة',diffs:'الاختلافات',comparator:'المقارن'},
    result:{title:'النتيجة المحددة',result:'النتيجة',revision:'المراجعة',digest:'بصمة البيان',sealed:'مختومة',yes:'نعم',boundary:'حدّ السلطة',boundaryText:'إعادة التشغيل والمقارنة وراجعات ما بعد المهمة تفاعلية؛ حقائق النتيجة والأحداث المختومة تبقى ثابتة.'},
    empty:'حدّد مراجعة نتيجة مختومة.'
  },
  resultMode:{lede:'مساحة النتائج تفاعلية للتحليل التاريخي بينما تبقى حقائقها المختومة ثابتة.',id:'معرّف النتيجة',status:'الحالة',schema:'المخطط',comparator:'المقارن'},
  aar:{
    title:'مراجعة ما بعد المهمة (AAR) · مراجعة تحليلية منفصلة',
    lede:'التحليل مرتبط بهذه المراجعة المختومة بالضبط. الحفظ ينشئ مراجعة تحليلية جديدة ولا يعيد كتابة الحقائق المسجّلة أبدًا.',
    save:'حفظ مراجعة التحليل',current:'المراجعة الحالية',digestRemains:'بصمة النتيجة تبقى',
    history:'سجل المراجعات',none:'لا توجد مراجعة تحليلية بعد.',analysis:'تحليل ما بعد المهمة',
    sequence:'تسلسل الأحداث المسجّلة',sequenceNone:'لا أحداث مسجّلة في هذه النتيجة المختومة.',
    sequenceNote:'مشتق من بيانات النتيجة المختومة نفسها؛ لا يُختلق أي حدث.',
    sources:'المصادر والإثبات',sourcesNone:'لا توجد مراجع إثبات مسجّلة.',run:'مصدر التشغيل',
    anchored:'مرتكزات الأحداث',anchoredNone:'لا أحداث محددة للربط.'
  },
  compare:{
    run:'قارن المراجعات المختومة بالضبط',left:'النتيجة المختومة اليسرى',right:'النتيجة المختومة اليمنى',
    heading:'مقارنة النتائج المختومة بالضبط',failTitle:'المقارنة غير ممكنة',
    failFallback:'لا يمكن مقارنة هذا الزوج تحت المقارن المسجّل.',none:'لا اختلافات في الحقول القابلة للمقارنة.',
    absent:'غائب',pair:'زوج مثبّت',pinnedNote:'زوج مثبّت عبر AnalyticalCompareOwner المحقون — لا Review ولا Audit ولا Mastery.',
    unavailable:'حدّد نتيجتين مختومتين بالضبط للمقارنة.'},
  status:{
    handoff:(id,rev)=>`أُعدّ ظرف مرشّح الأدلة لـ ${id}@${rev}؛ لا إدخال في W04.`,
    compare:(s,n)=>`AnalyticalCompareOwner · ${s} · ${n} اختلاف(ات)`,
    aarSaved:n=>`حُفظت مراجعة التحليل ${n}؛ الحقائق المختومة دون تغيير.`,
    aarConflict:'تعارض في المراجعة: حدّث قبل الحفظ.',
    replay:(owner,action)=>`${owner}: ${action}`
  },
  capability:{title:'حالة القدرة',lede:'النتائج المسجّلة تبقى مختومة. طلب القدرة لا ينشئ نتيجة ولا مؤشر إعادة تشغيل ولا مقارنة.',requested:'مطلوبة',unavailable:'غير متاحة',last:'آخر طلب',fabricated:'لا توجد بيانات مُختلقة'}
};
const EN={
  aria:{studio:'Results historical analysis workspace',modes:'Results modes',structure:'Result Structure',context:'Context inspector'},
  top:{title:'Results · Historical analysis',sub:'Sealed facts + interactive Replay / AAR / Compare',handoff:'Candidate Evidence Handoff'},
  modes:{result:'Result',replay:'Replay',aar:'AAR',compare:'Compare'},
  identity:{none:'No Result selected',sealed:'Sealed',events:n=>`${n} recorded event(s)`},
  structure:{title:'Result Structure',facets:['Overview','Task Outcomes','Phase Outcomes','Decisions','Observations','Runtime Artifacts','Provenance']},
  bottom:{title:'Temporary deep work',note:'Recorded bytes and event details are inspection-only; no replay execution.',ready:'Ready.'},
  empty:{UNAVAILABLE:'Results provider is unavailable. No sealed Result truth is being inferred.',EMPTY:'The Results provider is available and returned an empty collection.',fallback:'No sealed Results are available.',select:'Select an exact sealed Result revision.'},
  ownership:{title:'Ownership loop',replay:'Replay owner',compare:'Compare owner',review:'Review authority',reviewNone:'none — Results never issues review decisions',inert:'Replay executes runtime',inertNo:'false — HISTORICAL / INERT',instances:'TimelineReplayOwner instances'},
  context:{
    replay:{title:'Replay context',owner:'Replay owner',event:'Selected event',state:'State',runtime:'Runtime execution'},
    aar:{title:'AAR context',analysis:'Analysis ID',none:'Not created',revision:'Revision',state:'State',facts:'Fact mutation'},
    compare:{title:'Compare context',owner:'Owner',state:'State',diffs:'Differences',comparator:'Comparator'},
    result:{title:'Selected Result',result:'Result',revision:'Revision',digest:'Manifest digest',sealed:'Sealed',yes:'Yes',boundary:'Authority boundary',boundaryText:'Replay, AAR and Compare are interactive analytical modes. Sealed Result/Event facts remain immutable.'},
    empty:'Select a sealed Result revision.'
  },
  resultMode:{lede:'This Results workspace is interactive for historical analysis while its sealed facts remain immutable.',id:'Result ID',status:'Status',schema:'Schema',comparator:'Comparator'},
  aar:{
    title:'After Action Review · separate analysis revision',
    lede:'Analysis is anchored to this exact sealed Result revision. Saving creates a new AAR analysis revision and never rewrites recorded facts.',
    save:'Save AAR revision',current:'Current revision',digestRemains:'Result digest remains',
    history:'Revision history',none:'No AAR analysis revision yet.',analysis:'AAR analysis',
    sequence:'Recorded event sequence',sequenceNone:'This sealed Result contains no recorded events.',
    sequenceNote:'Derived from the sealed Result’s own recorded data; no event is reconstructed.',
    sources:'Sources and provenance',sourcesNone:'No provenance references are recorded.',run:'Source run',
    anchored:'Anchored events',anchoredNone:'No event is selected for anchoring.'
  },
  compare:{
    run:'Compare exact revisions',left:'Left sealed Result',right:'Right sealed Result',
    heading:'Exact sealed Result comparison',failTitle:'Comparison blocked',
    failFallback:'The exact pair cannot be compared under the registered comparator.',none:'No comparable-field differences.',
    absent:'Absent',pair:'Pinned pair',pinnedNote:'Pinned pair through the injected AnalyticalCompareOwner — no Review, Audit or Mastery authority.',
    unavailable:'Select two exact sealed Result revisions for comparison.'
  },
  status:{
    handoff:(id,rev)=>`Candidate Evidence envelope prepared for ${id}@${rev}; no W04 admission performed.`,
    compare:(s,n)=>`AnalyticalCompareOwner · ${s} · ${n} difference(s)`,
    aarSaved:n=>`Saved AAR revision ${n}; sealed facts unchanged.`,
    aarConflict:'AAR conflict: refresh before saving.',
    replay:(owner,action)=>`${owner}: ${action}`
  },
  capability:{title:'Capability state',lede:'Recorded Results stay sealed. Requesting a capability never creates a Result, replay cursor or comparison.',requested:'REQUESTED',unavailable:'UNAVAILABLE',last:'last request',fabricated:'no data was fabricated'}
};
export const RESULTS_STRINGS=Object.freeze({en:EN,ar:AR});
/** Active locale follows the document language set from Settings; there is no permanent product-language authority. */
export const resultsLocale=doc=>{const lang=String(doc?.documentElement?.lang||doc?.body?.getAttribute?.('lang')||'').toLowerCase();return lang.startsWith('ar')?'ar':'en'};
export const resultsT=locale=>RESULTS_STRINGS[locale==='ar'?'ar':'en'];
