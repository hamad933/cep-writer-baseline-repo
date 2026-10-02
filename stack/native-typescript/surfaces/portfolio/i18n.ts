/**
 * W04 Portfolio — surface copy localization (Arabic · English).
 *
 * Both languages are first-class; the active language is the user's Settings choice and is
 * read from `document.documentElement.lang`, which the shared preference layer keeps equal to
 * the chosen locale. There is no permanent Arabic-first or English-first authority here.
 *
 * Technical tokens — state names (`RESOLVABLE`, `UNAVAILABLE`), authority codes
 * (`AUTHORITY_DECISION_REQUIRED`), exact refs (`ev-x@ev-x-r1`), ids and digests — are NOT
 * translated: they are isolated with `dir="ltr"` at the point of display so they stay readable
 * in both directions (BIDI rule). Only human copy is localized.
 *
 * Geometry/direction is never baked in: this module returns text only.
 */

export type PortfolioLocale = 'en' | 'ar';

const COPY = {
  en: {
    /* ── centre header ── */
    emptyTitle: 'Portfolio assembly',
    emptySub: 'No canonical Portfolio membership is bound · ordered by curation sequence',
    recordSub: (id: string, type: string) => `${id} · ${type} reference · ordered by curation sequence`,
    pillMembership: 'Membership',
    pillNoneBound: 'NONE BOUND',
    pillReferences: 'References',
    pillSourceState: 'Source state',
    pillReferenceType: 'Reference type',
    pillGrouping: 'Grouping',
    pillGroupingRequired: 'AUTHORITY DECISION REQUIRED',
    pillRefsInView: 'References in view',
    pillTruthClass: 'Truth class',
    q5Open: 'Q-5 open',

    /* ── pending grouping authority (Q-5) ── */
    authorityTitle: 'Grouping authority: AUTHORITY_DECISION_REQUIRED — Q-5 open',
    authorityBody: 'Project / Learning Objective grouping authority is an unresolved Owner question (Q-5). This Portfolio therefore renders no grouping structure: memberships stay UNGROUPED, group refs stay null, portfolio.group refuses with AUTHORITY_DECISION_REQUIRED, and no example Project or Learning Objective identifier is treated as canonical. Only an Owner decision closes this — the refusal is shown here as a fact, not hidden as an absent value.',

    /* ── assembly metrics ── */
    metricsTitle: 'Assembly at a glance',
    mReferences: 'References in view',
    mEvidence: 'Evidence references',
    mMastery: 'Mastery references',
    mProject: 'Project references',
    mResolvable: 'Source resolvable',
    mAttention: 'Needs source attention',

    /* ── catalogue ── */
    catalogueTitle: 'Curated evidence references',
    colReference: 'Reference',
    colReferenceType: 'Reference type',
    colSourceState: 'Source state',
    colCurationNote: 'Curation note',
    noAnnotation: 'No curation annotation recorded',

    /* ── dossier ── */
    identityTitle: 'Curated reference',
    dispositionTitle: 'Curation disposition',
    rTitle: 'Title',
    rReferenceType: 'Reference type',
    rSourceRef: 'Canonical source ref',
    rMembershipIdentity: 'Membership identity',
    rAnnotation: 'Annotation',
    rSourceState: 'Source state',
    rStateTrack: 'Membership state track',
    rStateUnclassifiable: 'EMPTY — state not classifiable',
    rGrouping: 'Grouping',
    rGroupingNone: '— none (UNGROUPED)',
    rGroupingAuthority: 'Grouping authority',
    rGroupingAuthorityPending: 'AUTHORITY_DECISION_REQUIRED (Q-5 open)',
    rReceipts: 'Curation receipts',

    /* ── integrity ── */
    integrityTitle: 'Canonical source integrity',
    colCheck: 'Integrity check',
    colResult: 'Result',
    colDetail: 'Detail',
    cSourceResolution: 'Source resolution',
    cSourceAsked: 'The canonical source is asked for this exact ref.',
    cEnvelope: 'Integrity envelope',
    cEnvelopeFromSource: 'Digest and row count come from the canonical source itself.',
    cCanonicalCopy: 'Canonical copy',
    cCanonicalCopyNote: 'Portfolio stores the reference, never a canonical copy.',
    cDeleteAuthority: 'Canonical delete authority',
    cDeleteNote: 'Removing a membership never deletes Evidence or Mastery.',
    cSelectedMembership: 'Selected membership',
    cNoGroupingRef: 'No grouping ref is bound (Q-5 open)',
    integNoResolver: 'No source resolver is bound to this Portfolio.',
    integUnresolved: 'The canonical source did not resolve this exact ref in this workspace.',
    integNoEnvelope: 'The canonical source did not return an integrity envelope.',
    integFromSource: 'Digest and row count come from the canonical source itself.',

    /* ── track ── */
    trackTitle: 'Membership source state',
    nextCurate: 'Curate adds or removes a reference-only membership; removing never deletes canonical Evidence/Mastery truth (canonicalSourceWrite = false).',
    nextGroupingRefused: 'Grouping is refused with AUTHORITY_DECISION_REQUIRED while Q-5 is open — no example Project / Learning Objective ID is treated as canonical.',
    nextGroupingBound: 'A bound grouping registry may resolve this membership (portfolio.group).',
    nextSuperseded: 'The canonical source revision moved on — display the pinned historical member and an explicit update choice (profile epistemic.stale).',
    nextUnresolvable: 'The canonical source is not resolvable in this workspace — the member is retained with its original ref and is never presented as RESOLVABLE.',
    nextExport: 'Export binds exact refs, curation metadata and source disposition only; it never duplicates canonical authority.',

    /* ── empty state ── */
    ceilingsTitle: 'What this Portfolio is allowed to claim',
    cardCurationTitle: 'Reference-only curation',
    cardCurationSub: 'canonicalSourceCopies = 0',
    cardCurationLine: 'Members point at canonical Evidence / Mastery / Project records by exact ref; the source is never copied here.',
    cardDeleteTitle: 'No delete authority',
    cardDeleteSub: 'canonicalSourceDeleteAuthority = false',
    cardDeleteLine: 'Removing a membership leaves the canonical record and every receipt intact.',
    cardExportTitle: 'Reproducible export',
    cardExportSub: 'canonicalPublication = false',
    cardExportLine: 'An export is a projection of exact refs, curation metadata and source disposition — never a publication.',
    cardSessionTitle: 'Session-local projection',
    cardSessionSub: 'durable = false',
    cardSessionLine: 'Curation lives in this session until a shared durable binding is authorised.',
    nextEmptyValid: 'An empty Portfolio is a valid state: adding an authorized reference requires no invented achievement (profile epistemic.empty).',
    nextEmptyReferences: 'Curation references canonical Evidence / Mastery / project records; it never copies or deletes them.',
    nextEmptyAdd: 'Add a reference with an exact canonical source ref (id@revision) through Curate Portfolio reference.',
    eSourceResolution: 'Source resolution',
    eNoMembership: 'EMPTY — no membership is bound, so no source is queried',
    eCanonicalCopy: 'Canonical copy',
    eCanonicalCopyNote: 'false — Portfolio stores the reference, never a canonical copy',
    eDeleteAuthority: 'Canonical delete authority',
    eDeleteNote: 'false — removing a membership never deletes Evidence/Mastery',
    eGroupingAuthority: 'Grouping authority',

    /* ── RIGHT context cards ── */
    lensScope: 'View scope',
    lensScopeTab: 'Scope',
    fView: 'View',
    fSelected: 'Selected reference',
    fRefsInView: 'References in view',
    fOwner: 'Domain owner',
    fAuthorityRef: 'Authority ref',
    lensOrganization: 'View organization',
    lensOrganizationTab: 'Ordering & grouping',
    fOrdering: 'Ordering',
    fOrderingValue: 'CURATION_SEQUENCE — curation sequence owned by this view',
    fGroupingAuthority: 'Grouping authority',
    fGroupingRegistry: 'Grouping registry',
    fRegistryEmpty: 'EMPTY — no approved grouping registry is bound',
    fSelectedGrouping: 'Selected grouping',
    fGroupingNoneSelected: 'EMPTY — no reference is selected',
    fGroupingUngrouped: 'EMPTY — UNGROUPED',
    fGroupingSubject: 'Grouping subject',
    fGroupingSubjectValue: 'Project / Learning Objective — Owner decision Q-5',
    lensFilters: 'Active filters',
    lensFiltersTab: 'Filter state',
    fActiveFilter: 'Active view filter',
    fFilterNone: 'none — the whole Portfolio is in view',
    fAdmitted: 'References admitted',
    fOutside: 'References outside view',
    fSearchable: 'Searchable fields',
    fSearchableValue: 'title · refType · sourceRef · state · grouping',
    fLastReceipt: 'Last curation receipt',
    fLastReceiptNone: 'EMPTY — none recorded',
    lensExport: 'Customization & export',
    lensExportTab: 'Export context',
    fExportMembers: 'Export members',
    fCanonicalPublication: 'Canonical publication',
    fLimitations: 'Limitations',
    fPersistence: 'Persistence',
    fExportNote: 'Export note',
    fExportNoteNone: 'EMPTY — no export projection is bound',
    lensReceipts: 'Curation receipts',
    lensReceiptsTab: 'Recorded mutations',
    fRecordedMutations: 'Recorded mutations',
    fReceiptsNone: 'EMPTY — no curation mutation has been executed in this workspace',
    subjectNone: 'No Portfolio member selected',
    summaryEmpty: 'Curated projection over canonical references.',
    eyebrow: 'Portfolio',

    /* ── LEFT navigation ── */
    savedViews: 'Saved views',
    curatedViews: 'Curated views',
    curatedHint: 'Curated views filter the index; they never bind grouping authority (Q-5 open).',
    vAll: 'All references',
    vEvidence: 'Evidence references',
    vMastery: 'Mastery references',
    vProject: 'Project references',
    vUnresolved: 'Source unresolved',
    vAuthorityPending: 'Grouping authority pending',
    navLabel: 'Portfolio saved views',
    colIndexReference: 'Reference',
    colIndexState: 'Source state',
    /* Projection text that the DOMAIN supplies (export limitations + export note). The domain
     * stays English-only truth; this map is the presentation-layer localization of those exact
     * strings (identity map in EN — a string not listed here is shown verbatim, never invented). */
    domainCopy: {}
  },
  ar: {
    /* ── centre header ── */
    emptyTitle: 'تجميع المحفظة',
    emptySub: 'لا توجد عضوية محفوظة مرتبطّة · مرتّبة حسب تسلسل التنقيح',
    recordSub: (id: string, type: string) => `${id} · مرجع ${type} · مرتّب حسب تسلسل التنقيح`,
    pillMembership: 'العضوية',
    pillNoneBound: 'غير مرتبط',
    pillReferences: 'المراجع',
    pillSourceState: 'حالة المصدر',
    pillReferenceType: 'نوع المرجع',
    pillGrouping: 'التجميع',
    pillGroupingRequired: 'AUTHORITY DECISION REQUIRED',
    pillRefsInView: 'المراجع في العرض',
    pillTruthClass: 'فئة الحقيقة',
    q5Open: 'Q-5 مفتوح',

    /* ── pending grouping authority (Q-5) ── */
    authorityTitle: 'سلطة التجميع: AUTHORITY_DECISION_REQUIRED — السؤال Q-5 مفتوح',
    authorityBody: 'سلطة تجميع المشاريع والأهداف التعليمية سؤال مفتوح لم يُحسم من المالك (Q-5). لذلك لا تعرض هذه المحفظة أي بنية تجميع: تبقى العضويات غير مجمّعة (UNGROUPED)، وتبقى مراجع التجميع فارغة، ويرفض portfolio.group برمز AUTHORITY_DECISION_REQUIRED، ولا يُعتبر أي معرّف مشروع أو هدف تعليمي مرجعيًا. لا يُغلق هذا إلا بقرار المالك — والرفض معروض هنا كحقيقة، لا مخفيًا كقيمة غائبة.',

    /* ── assembly metrics ── */
    metricsTitle: 'لمحة عن التجميع',
    mReferences: 'المراجع في العرض',
    mEvidence: 'مراجع الأدلة',
    mMastery: 'مراجع الإتقان',
    mProject: 'مراجع المشاريع',
    mResolvable: 'المصدر متاح',
    mAttention: 'بحاجة لمتابعة المصدر',

    /* ── catalogue ── */
    catalogueTitle: 'مراجع الأدلة المُنتقاة',
    colReference: 'المرجع',
    colReferenceType: 'نوع المرجع',
    colSourceState: 'حالة المصدر',
    colCurationNote: 'ملاحظة التنقيح',
    noAnnotation: 'لا توجد ملاحظة تنقيح مسجّلة',

    /* ── dossier ── */
    identityTitle: 'المرجع المُنتقى',
    dispositionTitle: 'حالة التدبير',
    rTitle: 'العنوان',
    rReferenceType: 'نوع المرجع',
    rSourceRef: 'مرجع المصدر المرجعي',
    rMembershipIdentity: 'هوية العضوية',
    rAnnotation: 'التعليق',
    rSourceState: 'حالة المصدر',
    rStateTrack: 'حالة العضوية',
    rStateUnclassifiable: 'فارغ — لا يمكن تصنيف الحالة',
    rGrouping: 'التجميع',
    rGroupingNone: '— لا يوجد (غير مجمّع)',
    rGroupingAuthority: 'سلطة التجميع',
    rGroupingAuthorityPending: 'AUTHORITY_DECISION_REQUIRED (Q-5 مفتوح)',
    rReceipts: 'إيصالات التنقيح',

    /* ── integrity ── */
    integrityTitle: 'سلامة المصدر المرجعي',
    colCheck: 'فحص السلامة',
    colResult: 'النتيجة',
    colDetail: 'التفاصيل',
    cSourceResolution: 'استدعاء المصدر',
    cSourceAsked: 'يُطلب من المصدر المرجعي هذا المرجع بالضبط.',
    cEnvelope: 'غلاف السلامة',
    cEnvelopeFromSource: 'بصمة الملف وعدد الصفوف من المصدر المرجعي نفسه.',
    cCanonicalCopy: 'نسخة مرجعية',
    cCanonicalCopyNote: 'المحفظة تخزّن المرجع فقط، ولا تنسخ أبدًا الأصل المرجعي.',
    cDeleteAuthority: 'صلاحية الحذف المرجعي',
    cDeleteNote: 'إزالة العضوية لا تحذف أبدًا الدليل أو الإتقان.',
    cSelectedMembership: 'العضوية المحددة',
    cNoGroupingRef: 'لا يوجد مرجع تجميع مرتبط (Q-5 مفتوح)',
    integNoResolver: 'لا يوجد محلّل مصدر مرتبط بهذه المحفظة.',
    integUnresolved: 'لم يستدعِ المصدر المرجعي هذا المرجع بالضبط في مساحة العمل هذه.',
    integNoEnvelope: 'لم يُعِد المصدر المرجعي غلاف سلامة.',
    integFromSource: 'بصمة الملف وعدد الصفوف من المصدر المرجعي نفسه.',

    /* ── track ── */
    trackTitle: 'حالة مصدر العضوية',
    nextCurate: 'التنقيح يضيف أو يزيل عضوية إشارة فقط؛ والإزالة لا تحذف أبدًا حقيقة الدليل أو الإتقان المرجعية (canonicalSourceWrite = false).',
    nextGroupingRefused: 'يُرفض التجميع برمز مطلوب قرار السلطة ما دام Q-5 مفتوحًا — ولا يُعتبر أي معرّف مشروع أو هدف تعليمي مرجعيًا.',
    nextGroupingBound: 'قد يحل سجل التجميع المرتبط هذه العضوية (portfolio.group).',
    nextSuperseded: 'تقدّم مراجعة المصدر المرجعي — اعرض العضوية المثبّتة تاريخيًا مع خيار تحديث صريح.',
    nextUnresolvable: 'لا يمكن استدعاء المصدر المرجعي في مساحة العمل هذه — تُحتفظ بالعضوية بمرجعها الأصلي ولا تُعرض أبدًا كـ قابلة للتحليل.',
    nextExport: 'التصدير يربط المراجع الدقيقة وبيانات التنقيح ووضع المصدر فقط؛ ولا يكرّر أبدًا السلطة المرجعية.',

    /* ── empty state ── */
    ceilingsTitle: 'ما يحق لهذه المحفظة أن تدّعيه',
    cardCurationTitle: 'تنقيح بالإشارة فقط',
    cardCurationSub: 'canonicalSourceCopies = 0',
    cardCurationLine: 'تشير العضويات إلى سجلات الدليل أو الإتقان أو المشروع المرجعية بمرجع دقيق؛ ولا يُنسخ المصدر هنا أبدًا.',
    cardDeleteTitle: 'لا صلاحية للحذف',
    cardDeleteSub: 'canonicalSourceDeleteAuthority = false',
    cardDeleteLine: 'إزالة العضوية تُبقي السجل المرجعي وكل الإيصالات كما هي.',
    cardExportTitle: 'تصدير قابل للتكرار',
    cardExportSub: 'canonicalPublication = false',
    cardExportLine: 'التصدير عرض للمراجع الدقيقة وبيانات التنقيح ووضع المصدر — وليس نشرًا أبدًا.',
    cardSessionTitle: 'عرض محلي للجلسة',
    cardSessionSub: 'durable = false',
    cardSessionLine: 'يبقى التنقيح داخل هذه الجلسة حتى يُصرّح بربط دائم مشترك.',
    nextEmptyValid: 'المحفظة الفارغة حالة صحيحة: إضافة مرجع مصرّح بها لا تتطلب إنجازًا مُختلَقًا.',
    nextEmptyReferences: 'التنقيح يشير إلى سجلات الدليل أو الإتقان أو المشروع المرجعية؛ ولا ينسخها ولا يحذفها.',
    nextEmptyAdd: 'أضف مرجعًا بمرجع مصدر مرجعي دقيق (معرّف@مراجعة) عبر أمر تنقيح المحفظة.',
    eSourceResolution: 'استدعاء المصدر',
    eNoMembership: 'فارغ — لا توجد عضوية مرتبطّة، لذلك لا يُطلب أي مصدر',
    eCanonicalCopy: 'نسخة مرجعية',
    eCanonicalCopyNote: 'false — المحفظة تخزّن المرجع فقط، ولا تنسخ الأصل المرجعي',
    eDeleteAuthority: 'صلاحية الحذف المرجعي',
    eDeleteNote: 'false — إزالة العضوية لا تحذف الدليل أو الإتقان',
    eGroupingAuthority: 'سلطة التجميع',

    /* ── RIGHT context cards ── */
    lensScope: 'نطاق العرض',
    lensScopeTab: 'النطاق',
    fView: 'العرض',
    fSelected: 'المرجع المحدد',
    fRefsInView: 'المراجع في العرض',
    fOwner: 'مالك المجال',
    fAuthorityRef: 'مرجع السلطة',
    lensOrganization: 'تنظيم العرض',
    lensOrganizationTab: 'الترتيب والتجميع',
    fOrdering: 'الترتيب',
    fOrderingValue: 'CURATION_SEQUENCE — تسلسل التنقيح الذي يملكه هذا العرض',
    fGroupingAuthority: 'سلطة التجميع',
    fGroupingRegistry: 'سجل التجميع',
    fRegistryEmpty: 'فارغ — لا يوجد سجل تجميع معتمد مرتبط',
    fSelectedGrouping: 'تجميع المحدد',
    fGroupingNoneSelected: 'فارغ — لا يوجد مرجع محدد',
    fGroupingUngrouped: 'فارغ — غير مجمّع',
    fGroupingSubject: 'موضوع التجميع',
    fGroupingSubjectValue: 'مشروع / هدف تعليمي — قرار المالك Q-5',
    lensFilters: 'الفلاتر النشطة',
    lensFiltersTab: 'حالة الترشيح',
    fActiveFilter: 'مرشّح العرض النشط',
    fFilterNone: 'لا شيء — المحفظة كاملة في العرض',
    fAdmitted: 'المراجع المقبولة',
    fOutside: 'المراجع خارج العرض',
    fSearchable: 'الحقول القابلة للبحث',
    fSearchableValue: 'title · refType · sourceRef · state · grouping',
    fLastReceipt: 'آخر إيصال تنقيح',
    fLastReceiptNone: 'فارغ — لا يوجد إيصال مسجّل',
    lensExport: 'التخصيص والتصدير',
    lensExportTab: 'سياق التصدير',
    fExportMembers: 'أعضاء التصدير',
    fCanonicalPublication: 'النشر المرجعي',
    fLimitations: 'القيود',
    fPersistence: 'الحفظ',
    fExportNote: 'ملاحظة التصدير',
    fExportNoteNone: 'فارغ — لا يوجد عرض تصدير مرتبط',
    lensReceipts: 'إيصالات التنقيح',
    lensReceiptsTab: 'التحولات المسجّلة',
    fRecordedMutations: 'التحولات المسجّلة',
    fReceiptsNone: 'فارغ — لم يُنفَّذ أي تحوّل تنقيح في مساحة العمل هذه',
    subjectNone: 'لا يوجد مرجع محفظة محدد',
    summaryEmpty: 'عرض منقّح فوق المصادر المرجعية.',
    eyebrow: 'المحفظة',

    /* ── LEFT navigation ── */
    savedViews: 'العروض المحفوظة',
    curatedViews: 'العروض المُنتقاة',
    curatedHint: 'العروض المُنتقاة ترشّح الفهرس فقط؛ ولا تربط أبدًا سلطة التجميع (Q-5 مفتوح).',
    vAll: 'كل المراجع',
    vEvidence: 'مراجع الأدلة',
    vMastery: 'مراجع الإتقان',
    vProject: 'مراجع المشاريع',
    vUnresolved: 'المصدر غير مستدعى',
    vAuthorityPending: 'سلطة التجميع معلّقة',
    navLabel: 'عروض المحفظة المحفوظة',
    colIndexReference: 'المرجع',
    colIndexState: 'حالة المصدر',
    /* presentation localization of the exact domain projection strings (see EN domainCopy) */
    domainCopy: {
      'Projection only': 'عرض فقط',
      'Canonical Evidence/Mastery/project truth remains with source owner': 'حقيقة الدليل والإتقان والمشروع المرجعية تبقى لدى مالك المصدر',
      'Unavailable/superseded/withdrawn state is retained': 'يُحتفظ بحالة غير المتاح أو المتجاوز أو المسحوب',
      'Export carries exact refs, curation metadata and source disposition only; it does not duplicate canonical Evidence/Mastery truth.': 'التصدير يحمل المراجع الدقيقة وبيانات التنقيح ووضع المصدر فقط؛ ولا يكرّر حقيقة الدليل أو الإتقان المرجعية.'
    }
  }
} as const;

/** Active product language — read from the shared preference layer, never hard-coded. */
export function portfolioLocale(): PortfolioLocale {
  if (typeof document === 'undefined') return 'en';
  const lang = String(document.documentElement.lang || '').toLowerCase();
  return lang.startsWith('ar') ? 'ar' : 'en';
}

/** Returns the localized copy table for the active language. */
export function portfolioCopy(): (typeof COPY)['en'] {
  return (COPY as any)[portfolioLocale()] as (typeof COPY)['en'];
}

export default portfolioCopy;
