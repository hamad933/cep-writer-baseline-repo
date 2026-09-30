/**
 * W04-MASTERY · bilingual chrome labels (Arabic + English, both first-class).
 *
 * VISUAL_EXECUTION_STANDARD §7: the active language is user-configurable through Settings and
 * there is NO permanent Arabic-first or English-first product authority. Nothing here bakes a
 * direction or a language into structure — every render pass calls `activeLocale()` and picks
 * the label set that matches the running preference, and every layout the surface emits uses
 * logical/`dir="auto"` presentation so RTL and LTR mirror without a second markup path.
 *
 * SCOPE — CHROME only: pane titles, status-pill labels, section titles, row and field labels,
 * lens names, guidance. RECORD CONTENT and governed vocabulary tokens (NOT_EVALUATED,
 * MASTERED, REVALIDATION_REQUIRED, SYNTHETIC_DEMO_SEED, basis refs, digests, refusal codes)
 * are technical/domain values and are never translated — they render verbatim, isolated, so
 * they stay readable in both directions.
 *
 * `activeLocale()` falls back to `en` when there is no document (unit tests, Node projection),
 * so the descriptor vocabulary pinned by the W04 tests keeps resolving in English.
 */
export type MasteryLocale = 'ar' | 'en';

export const TEXT = {
  en: {
    /* ── record / empty header ── */
    pillJudgment: 'Mastery Judgment',
    pillFreshness: 'Freshness Status',
    noteNoEvaluation: 'no evaluation exists',
    emptyTitle: 'Mastery',
    emptySub: 'Cybersecurity curriculum · no governed Mastery State is bound',
    subjectPrefix: 'Subject: {name}',
    /* ── entry state ── */
    noticeEmptyTitle: 'NOT_EVALUATED — the authoritative epistemic state',
    noticeEmptyBody: 'No authorized Mastery provider/evaluator is bound, so no Mastery State exists. NOT_EVALUATED is displayed instead of a generic EMPTY token because the state itself is informative: it states that evaluation has not happened, not that the projection failed.',
    judgmentTitle: 'Mastery judgment dimension',
    judgmentCurrent: 'Current state',
    judgmentNotReached: 'Not reached',
    pipelineTitle: 'How a Mastery State is produced',
    stepDecisions: 'Decisions',
    stepEvidence: 'Evidence',
    stepPolicy: 'Policy',
    stepEvaluator: 'Evaluator',
    stepMastery: 'Mastery',
    nextEvaluator: 'Authorized Mastery evaluator/provider is unbound — re-evaluation is refused with AUTHORIZED_EVALUATOR_UNBOUND and no local Mastery write exists.',
    nextCompletion: 'Completion or activity never creates Mastery.',
    nextFreshness: 'Freshness may change only through a new governed Mastery State.',
    basisTitle: 'Evaluation basis',
    bindingTitle: 'Binding truth',
    /* ── evaluation basis rows ── */
    rowPolicyRevision: 'Policy revision',
    rowDecisions: 'Effective Decisions',
    rowEvidence: 'Supporting Evidence',
    rowDigest: 'Basis digest',
    valueNoPolicy: 'Not bound — no Mastery State pins a policy',
    valueNoneBound: 'Not bound to any evaluation',
    valueNotComputed: 'Not computed — no evaluation exists',
    /* ── binding truth rows ── */
    rowAuthority: 'Authority ref',
    rowEvaluator: 'Authorized evaluator',
    rowWriter: 'Canonical Mastery writer',
    rowPersistence: 'Persistence',
    valueUnbound: 'Unbound — re-evaluation is refused',
    valueWriterUnbound: 'Unbound — no local Mastery write exists',
    /* ── record state ── */
    fixtureTitle: 'FIXTURE · SYNTHETIC_DEMO_SEED',
    fixtureBody: 'This Mastery State was seeded by the reviewer harness. L07 consumer taxonomy: fixture. It is not a real consumer achievement, and it must never be read, exported or accepted as one.',
    bannerTitle: 'Causal law',
    bannerBody: 'Effective Decisions, Supporting Evidence and a versioned policy are the only inputs to this evaluation. Completion and activity are never inputs, and no institutional authority is inferred from a personal evaluation.',
    explainabilityTitle: 'Explainability structure',
    basisText: 'Basis digest {digest} · {decisions} effective Decision reference(s) · {evidence} Evidence reference(s) · policy {policy}. The evaluation is produced only from those inputs: completionOrActivityUsed = {completion} · institutionalAuthorityInferred = {authority}.',
    /* ── the five explainability steps ── */
    step1Title: 'Mastery Policy Revision',
    step2Title: 'Effective Review Decisions',
    step3Title: 'Supporting Evidence',
    step4Title: 'Basis integrity and conflict status',
    step5Title: 'Evaluation Basis',
    colRef: 'Reference',
    colResolution: 'Resolution',
    colDecisionRef: 'Review / Decision ref',
    colEvidenceRef: 'Evidence ref',
    rowPolicy: 'Policy revision',
    rowPolicyResolution: 'Policy resolution',
    rowPolicySet: 'Policy set',
    rowUnresolved: 'Unresolved references',
    rowConflict: 'Conflict status',
    rowRecorded: 'Recorded evaluations',
    rowTruthClass: 'Truth class',
    noDecisions: 'No Decision reference is bound to this evaluation basis',
    noEvidence: 'No Evidence reference is bound to this evaluation basis',
    noneResolved: 'None — every basis reference resolved',
    noConflict: 'No conflicting effective Decisions observed',
    conflictObserved: 'CONFLICTING EFFECTIVE DECISIONS',
    truthClassFixture: 'SYNTHETIC_DEMO_SEED',
    truthClassProvider: 'PROVIDER_BOUND',
    /* ── LEFT collection ── */
    colTarget: 'Mastery target',
    colJudgment: 'Judgment',
    /* ── RIGHT context lenses ── */
    ctxEyebrow: 'Mastery',
    ctxSubjectNone: 'No Mastery State selected',
    ctxSummaryNone: 'No governed competency projection is available.',
    lensProvenance: 'Evaluation provenance',
    lensCause: 'State-change cause',
    lensRequest: 'Re-evaluation request',
    tabAuthority: 'Authority and truth ceilings',
    tabCause: 'Last state-change cause',
    tabRequest: 'What a request carries',
    tabIdentity: 'Evaluation identity',
    tabFreshness: 'Revalidation trigger',
    tabAvailability: 'Request availability',
    fRecordRef: 'Record identity',
    fEvaluatedAt: 'Evaluated at',
    fFreshness: 'Freshness',
    fBasisState: 'Evaluation basis',
    fAuthorityRef: 'Authority ref',
    fCausalLaw: 'Causal law',
    fEvaluator: 'Authorized evaluator',
    fWriter: 'Canonical Mastery writer',
    fPersistence: 'Persistence',
    fEvaluationId: 'Evaluation id',
    fJudgmentRecorded: 'Judgment recorded',
    fFreshnessRecorded: 'Freshness recorded',
    fPolicyApplied: 'Policy applied',
    fRecordedCount: 'Recorded evaluations',
    fNoHistory: 'EMPTY — no evaluation has been recorded for this target',
    fTrigger: 'Trigger',
    fRequestedJudgment: 'Requested judgment',
    fCompletion: 'Completion / activity input',
    fLocalWrite: 'Local Mastery write',
    fReceipts: 'Provider receipts',
    onlyEvaluatorDecides: 'null — only the authorized evaluator decides',
    neverInput: 'false — never an input to Mastery',
    requestDelegated: 'false — the request is delegated',
    freshnessTrigger: 'A new governed Mastery State with a fresher basis — never a local edit.',
    conflictNone: 'INFO · No conflicting effective Decisions observed',
    conflictBlocked: 'HOLD · Conflicting effective Decisions require governed evaluation'
  },
  ar: {
    /* ── record / empty header ── */
    pillJudgment: 'حكم الإتقان',
    pillFreshness: 'حالة الحداثة',
    noteNoEvaluation: 'لا يوجد تقييم',
    emptyTitle: 'الإتقان',
    emptySub: 'منهج الأمن السيبراني · لا توجد حالة إتقان مُحكَمة مرتبطة',
    subjectPrefix: 'الموضوع: {name}',
    /* ── entry state ── */
    noticeEmptyTitle: 'NOT_EVALUATED — الحالة المعرفية المرجعية',
    noticeEmptyBody: 'لا يوجد مزوّد/مقيّم إتقان معتمد مرتبط، لذلك لا توجد حالة إتقان. يُعرض NOT_EVALUATED بدل رمز EMPTY العام لأن الحالة نفسها مُعبِّرة: تُصرّح بأن التقييم لم يحدث، لا أن الإسقاط فشل.',
    judgmentTitle: 'بُعد حكم الإتقان',
    judgmentCurrent: 'الحالة الحالية',
    judgmentNotReached: 'لم تُبلغ',
    pipelineTitle: 'كيف تُنتَج حالة الإتقان',
    stepDecisions: 'القرارات',
    stepEvidence: 'الأدلة',
    stepPolicy: 'السياسة',
    stepEvaluator: 'المقيّم',
    stepMastery: 'الإتقان',
    nextEvaluator: 'مزوّد/مقيّم الإتقان المعتمد غير مرتبط — يُرفض إعادة التقييم بالرمز AUTHORIZED_EVALUATOR_UNBOUND ولا يوجد كتابة إتقان محلية.',
    nextCompletion: 'الإتمام أو النشاط لا يُنتج الإتقان أبداً.',
    nextFreshness: 'الحداثة لا تتغير إلا عبر حالة إتقان مُحكَمة جديدة.',
    basisTitle: 'أساس التقييم',
    bindingTitle: 'حقيقة الارتباط',
    /* ── evaluation basis rows ── */
    rowPolicyRevision: 'مراجعة السياسة',
    rowDecisions: 'القرارات السارية',
    rowEvidence: 'الأدلة الداعمة',
    rowDigest: 'ملخّص الأساس',
    valueNoPolicy: 'غير مرتبط — لا توجد حالة إتقان تثبّت سياسة',
    valueNoneBound: 'غير مرتبط بأي تقييم',
    valueNotComputed: 'غير محسوب — لا يوجد تقييم',
    /* ── binding truth rows ── */
    rowAuthority: 'مرجع السلطة',
    rowEvaluator: 'المقيّم المعتمد',
    rowWriter: 'كاتب الإتقان المُهيمن',
    rowPersistence: 'الحفظ',
    valueUnbound: 'غير مرتبط — يُرفض إعادة التقييم',
    valueWriterUnbound: 'غير مرتبط — لا توجد كتابة إتقان محلية',
    /* ── record state ── */
    fixtureTitle: 'FIXTURE · SYNTHETIC_DEMO_SEED',
    fixtureBody: 'زُرعت حالة الإتقان هذه بواسطة منظومة المراجعة. التصنيف L07: fixture. ليست إنجازاً حقيقياً لأي مستهلك، ولا يجوز قراءتها أو تصديرها أو قبولها كذا أبداً.',
    bannerTitle: 'القانون السببي',
    bannerBody: 'القرارات السارية والأدلة الداعمة والسياسة المُصدَّرة هي المدخلات الوحيدة لهذا التقييم. الإتمام والنشاط ليسا مدخلات أبداً، ولا تُستنتج سلطة مؤسسية من تقييم شخصي.',
    explainabilityTitle: 'بنية قابلية التفسير',
    basisText: 'ملخّص الأساس {digest} · {decisions} مرجع/مراجع قرار سارٍ · {evidence} مرجع/مراجع دليل داعم · سياسة {policy}. أُنتج التقييم من هذه المدخلات فقط: completionOrActivityUsed = {completion} · institutionalAuthorityInferred = {authority}.',
    /* ── the five explainability steps ── */
    step1Title: 'مراجعة سياسة الإتقان',
    step2Title: 'قرارات المراجعة السارية',
    step3Title: 'الأدلة الداعمة',
    step4Title: 'سلامة الأساس وحالة التعارض',
    step5Title: 'أساس التقييم',
    colRef: 'المرجع',
    colResolution: 'حالة الحل',
    colDecisionRef: 'مرجع المراجعة/القرار',
    colEvidenceRef: 'مرجع الدليل',
    rowPolicy: 'مراجعة السياسة',
    rowPolicyResolution: 'حالة حل السياسة',
    rowPolicySet: 'مجموعة السياسات',
    rowUnresolved: 'المراجعات غير المحلولة',
    rowConflict: 'حالة التعارض',
    rowRecorded: 'التقييمات المسجّلة',
    rowTruthClass: 'الصنف الحقيقي',
    noDecisions: 'لا يوجد مرجع قرار مرتبط بهذا الأساس',
    noEvidence: 'لا يوجد مرجع دليل مرتبط بهذا الأساس',
    noneResolved: 'لا شيء — حُلّ كل مراجعات الأساس',
    noConflict: 'لا تعارض بين القرارات السارية',
    conflictObserved: 'تعارض بين القرارات السارية',
    truthClassFixture: 'SYNTHETIC_DEMO_SEED',
    truthClassProvider: 'PROVIDER_BOUND',
    /* ── LEFT collection ── */
    colTarget: 'هدف الإتقان',
    colJudgment: 'الحكم',
    /* ── RIGHT context lenses ── */
    ctxEyebrow: 'الإتقان',
    ctxSubjectNone: 'لا توجد حالة إتقان محددة',
    ctxSummaryNone: 'لا يوجد إسقاط كفاءة مُحكَم متاح.',
    lensProvenance: 'أصالة التقييم',
    lensCause: 'سبب تغيّر الحالة',
    lensRequest: 'طلب إعادة التقييم',
    tabAuthority: 'السلطة وسقوف الحقيقة',
    tabCause: 'سبب آخر تغيّر للحالة',
    tabRequest: 'ما يحمله الطلب',
    tabIdentity: 'هوية التقييم',
    tabFreshness: 'مُطلِق إعادة التحقق',
    tabAvailability: 'توفر الطلب',
    fRecordRef: 'هوية السجل',
    fEvaluatedAt: 'تاريخ التقييم',
    fFreshness: 'الحداثة',
    fBasisState: 'أساس التقييم',
    fAuthorityRef: 'مرجع السلطة',
    fCausalLaw: 'القانون السببي',
    fEvaluator: 'المقيّم المعتمد',
    fWriter: 'كاتب الإتقان المُهيمن',
    fPersistence: 'الحفظ',
    fEvaluationId: 'معرّف التقييم',
    fJudgmentRecorded: 'الحكم المسجّل',
    fFreshnessRecorded: 'الحداثة المسجّلة',
    fPolicyApplied: 'السياسة المطبَّقة',
    fRecordedCount: 'التقييمات المسجّلة',
    fNoHistory: 'EMPTY — لم يُسجَّل أي تقييم لهذا الهدف',
    fTrigger: 'المُطلِق',
    fRequestedJudgment: 'الحكم المطلوب',
    fCompletion: 'مدخل الإتمام/النشاط',
    fLocalWrite: 'كتابة الإتقان المحلية',
    fReceipts: 'إيصالات المزوّد',
    onlyEvaluatorDecides: 'null — المقيّم المعتمد وحده يقرر',
    neverInput: 'false — مدخل أبداً للإتقان',
    requestDelegated: 'false — الطلب مُحوَّل',
    freshnessTrigger: 'حالة إتقان مُحكَمة جديدة بأساس أحدث — لا تعديل محلي أبداً.',
    conflictNone: 'INFO · لا تعارض بين القرارات السارية',
    conflictBlocked: 'HOLD · التعارض بين القرارات السارية يتطلب تقييماً مُحكَماً'
  }
} as const;

export const pickText = (locale: MasteryLocale = 'en') => TEXT[locale] as Record<string, string>;

/** Active product language, read fresh on every render pass. Never cached. */
export const activeLocale = (): MasteryLocale => {
  try {
    const lang = String((globalThis as any)?.document?.documentElement?.lang || '').toLowerCase();
    return lang.startsWith('ar') ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

/** `{token}` interpolation — never concatenation, so Arabic word order survives. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  String(template ?? '').replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));

export default TEXT;
