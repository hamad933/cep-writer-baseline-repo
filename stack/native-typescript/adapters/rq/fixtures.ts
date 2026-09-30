/**
 * RQ presentation fixtures — Research & Quality workspace content model.
 *
 * TRUTH BOUNDARY (read before changing anything here):
 *   These fixtures are PRESENTATION FIXTURES for the rq workspace composition. They are NOT
 *   admitted Product SourceRevision truth, NOT a provider corpus, and NOT promoted into
 *   `RQDomainAdapter` records. The provider truth stays exactly what
 *   `adapters/rq/domain.ts` reports (`providerAdmitted:false`,
 *   `providerTruth:'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER'`, no durable analysis-session
 *   persistence, no formal review authority).
 *
 *   Everything below is therefore labelled in the UI as WORKING / REPRESENTED scope, never as
 *   approved Product truth and never as a formal Review decision.
 *
 * Every user-facing string is `{ar,en}` — Arabic and English are both first-class; there is no
 * permanent Arabic-first or English-first product authority. No direction is baked into any
 * structure here: callers render with logical properties and `<bdi>` for technical tokens.
 */

export interface RqText { ar: string; en: string }
export type RqLocale = 'ar' | 'en';

export const rqText = (value: RqText, locale: RqLocale): string => (locale === 'ar' ? value.ar : value.en);

export const RQ_SURFACE_OWNER = 'W02-RESEARCH-QUALITY';
export const RQ_WORKSPACE_ID = 'rq.source-claim-reconciliation';

export const RQ_LABELS = {
  surface: { ar: 'البحث والجودة', en: 'Research & Quality' },
  area: { ar: 'المعرفة والتعلّم', en: 'Knowledge & Learning' },
  workingAnalysis: { ar: 'تحليل عمل', en: 'Working analysis' },
  workingAnalysisHint: {
    ar: 'نطاق تمثيلي للعمل المحلي — لا يُعد قرار مراجعة رسميًا ولا يُحفظ حفظًا دائمًا.',
    en: 'Represented working scope — not a formal Review decision and not durably saved.'
  },
  notFormalReview: { ar: 'بلا صلاحية مراجعة رسمية', en: 'No formal review authority' },
  saveUnavailable: { ar: 'الحفظ الدائم غير متاح', en: 'Durable save unavailable' },
  providerUnavailable: { ar: 'مزود المصادر المعتمد غير متاح', en: 'Admitted source provider unavailable' },
  activeReview: { ar: 'المراجعة الجارية', en: 'Active review' },
  investigations: { ar: 'التحقيقات الجارية', en: 'Active investigations' },
  reviewQueue: { ar: 'قائمة المراجعة', en: 'Review queue' },
  claimMatching: { ar: 'مطابقة الادعاءات', en: 'Claim matching' },
  claimRegister: { ar: 'سجلّ الادعاءات', en: 'Claim register' },
  provenance: { ar: 'سلسلة التوثيق', en: 'Provenance chain' },
  revisions: { ar: 'إصدارات المراجعة', en: 'Review revisions' },
  activity: { ar: 'سجلّ النشاط', en: 'Activity log' },
  reviewResult: { ar: 'نتيجة المراجعة', en: 'Review result' },
  context: { ar: 'السياق', en: 'Context' },
  sourcePair: { ar: 'زوج المصدر قيد المطابقة', en: 'Source pair under reconciliation' },
  queueFocus: { ar: 'مرشّح القائمة', en: 'Queue filter' },
  clear: { ar: 'مسح', en: 'Clear' }
};

/** Workspace truth banner — must stay consistent with adapters/rq/domain.ts. */
export const RQ_TRUTH = Object.freeze({
  workingAnalysisOnly: true,
  formalReviewAuthority: false,
  analysisSessionPersistence: 'UNAVAILABLE',
  providerAdmitted: false,
  providerTruth: 'UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER',
  fixtureScope: 'PRESENTATION_FIXTURE_NOT_PRODUCT_SOURCE_REVISION_CORPUS'
});

export interface RqProject {
  id: string;
  name: RqText;
  meta: RqText;
  state: 'active' | 'attention' | 'clean' | 'waiting';
  active?: boolean;
}

export const RQ_PROJECTS: RqProject[] = [
  {
    id: 'PROJ-SQLI',
    name: { ar: 'حقن SQL', en: 'SQL injection' },
    meta: { ar: '14 مصدرًا · 3 تعارضات مفتوحة', en: '14 sources · 3 open conflicts' },
    state: 'attention',
    active: true
  },
  {
    id: 'PROJ-XSS',
    name: { ar: 'XSS عبر العناصر', en: 'DOM-based XSS' },
    meta: { ar: '9 مصادر · تعارض واحد', en: '9 sources · 1 conflict' },
    state: 'attention'
  },
  {
    id: 'PROJ-AUTHZ',
    name: { ar: 'التفويض على مستوى الكائن', en: 'Object-level authorization' },
    meta: { ar: '11 مصدرًا · لا تعارضات', en: '11 sources · no conflicts' },
    state: 'clean'
  },
  {
    id: 'PROJ-KEYS',
    name: { ar: 'إدارة المفاتيح', en: 'Key management' },
    meta: { ar: '6 مصادر · بانتظار التوثيق', en: '6 sources · awaiting provenance' },
    state: 'waiting'
  }
];

export interface RqQueueItem {
  id: string;
  label: RqText;
  hint: RqText;
  count: number;
  tone: 'bad' | 'warn' | 'accent' | 'violet';
}

export const RQ_QUEUE: RqQueueItem[] = [
  {
    id: 'claim-conflicts',
    label: { ar: 'تعارضات الادعاءات', en: 'Claim conflicts' },
    hint: { ar: 'مصدران يتناقضان حول الادعاء نفسه', en: 'Two sources contradict the same claim' },
    count: 3,
    tone: 'bad'
  },
  {
    id: 'missing-provenance',
    label: { ar: 'توثيق ناقص', en: 'Missing provenance' },
    hint: { ar: 'ادعاء بلا مرحلة توثيق موثّقة', en: 'A claim without a recorded locator' },
    count: 5,
    tone: 'warn'
  },
  {
    id: 'coverage-gaps',
    label: { ar: 'فجوات التغطية', en: 'Coverage gaps' },
    hint: { ar: 'ادعاء مدعوم بمصدر واحد فقط', en: 'A claim supported by a single source' },
    count: 2,
    tone: 'accent'
  },
  {
    id: 'revision-reviews',
    label: { ar: 'مراجعات الإصدارات', en: 'Revision reviews' },
    hint: { ar: 'مسودّة إصدار بانتظار قرار', en: 'A revision draft awaiting a decision' },
    count: 1,
    tone: 'violet'
  }
];

export interface RqSource {
  slot: 'A' | 'B';
  id: string;
  title: string;
  publisher: string;
  kind: RqText;
  updated: string;
  digest: string;
  anchors: { claimed: number; verified: number };
  excerpt: RqText;
}

export const RQ_SOURCES: RqSource[] = [
  {
    slot: 'A',
    id: 'A-021',
    title: 'OWASP SQL Injection Prevention Cheat Sheet',
    publisher: 'OWASP.org',
    kind: { ar: 'ورقة دفاع', en: 'Defence cheat sheet' },
    updated: '2025-03-11',
    digest: '9f2c4a7e1b6d0385',
    anchors: { claimed: 3, verified: 3 },
    excerpt: {
      ar: 'استخدم الاستعلامات المعاملة (Parameterized Queries) عند التفاعل مع قاعدة البيانات لمنع حقن SQL؛ إذ لن يقبل المفسّر بيانات المستخدم كتعليمات تنفيذية.',
      en: 'Use parameterized queries when interacting with the database to prevent SQL injection; the interpreter will never accept user data as executable instructions.'
    }
  },
  {
    slot: 'B',
    id: 'A-088',
    title: 'PortSwigger SQL Injection',
    publisher: 'PortSwigger Academy',
    kind: { ar: 'أكاديمية هجومية', en: 'Attack academy' },
    updated: '2025-02-27',
    digest: '3c81de54a90fb267',
    anchors: { claimed: 3, verified: 2 },
    excerpt: {
      ar: 'تُعدّ الاستعلامات المعاملة أفضل وسيلة ضد حقن SQL لأنها تفصل بيانات المستخدم ولا تسمح للمهاجمين بتغيير سياق الاستعلام.',
      en: 'Parameterized queries are the best defence against SQL injection because they keep user data separate and never let an attacker change the query context.'
    }
  }
];

export type RqClaimStatus = 'SUPPORTED' | 'QUALIFIED' | 'NEEDS_REVIEW' | 'CONFLICT';

export interface RqClaim {
  id: string;
  text: RqText;
  support: { a: string | null; b: string | null };
  status: RqClaimStatus;
  confidence: number;
  scope: RqText;
  owner: string;
  inPair: boolean;
}

export const RQ_CLAIMS: RqClaim[] = [
  {
    id: 'C-014',
    text: {
      ar: 'تُقلّل الاستعلامات المعاملة من خطر حقن SQL بشكل موثّق.',
      en: 'Parameterized queries measurably reduce the SQL injection risk.'
    },
    support: { a: 'A-021', b: 'A-088' },
    status: 'SUPPORTED',
    confidence: 0.92,
    scope: { ar: 'الاستعلام · الطبقة الوصلية', en: 'Query layer · data access' },
    owner: 'AH',
    inPair: true
  },
  {
    id: 'C-021',
    text: {
      ar: 'تجنّب رسائل الخطأ التفصيلية التي تكشف معلومات المخطط الحساسة.',
      en: 'Avoid verbose error messages that expose sensitive schema information.'
    },
    support: { a: 'A-035', b: 'A-091' },
    status: 'QUALIFIED',
    confidence: 0.74,
    scope: { ar: 'معالجة الأخطاء · الإخراج', en: 'Error handling · output' },
    owner: 'MR',
    inPair: true
  },
  {
    id: 'C-033',
    text: {
      ar: 'التحقق من المدخلات وحده لا يكفي لمنع حقن SQL عند غياب ترميز المخرجات.',
      en: 'Input validation alone does not prevent SQL injection when output encoding is missing.'
    },
    support: { a: 'A-120', b: null },
    status: 'NEEDS_REVIEW',
    confidence: 0.41,
    scope: { ar: 'التحقق من المدخلات', en: 'Input validation' },
    owner: 'AH',
    inPair: true
  },
  {
    id: 'C-041',
    text: {
      ar: 'يجب تقييد صلاحيات حساب قاعدة البيانات بما لا يتجاوز اللازم للتطبيق.',
      en: 'The database account must be restricted to the least privilege the application needs.'
    },
    support: { a: 'A-014', b: 'A-096' },
    status: 'SUPPORTED',
    confidence: 0.88,
    scope: { ar: 'الصلاحيات · قاعدة البيانات', en: 'Privileges · database' },
    owner: 'MR',
    inPair: false
  },
  {
    id: 'C-047',
    text: {
      ar: 'القوالب المُهيّأة المدمجة لا تُغني عن المعاملة في كل الاستعلامات.',
      en: 'Prepared ORM statements do not replace parameterization in every query path.'
    },
    support: { a: 'A-052', b: null },
    status: 'NEEDS_REVIEW',
    confidence: 0.38,
    scope: { ar: 'إطار العمل · ORM', en: 'Framework · ORM' },
    owner: 'SK',
    inPair: false
  },
  {
    id: 'C-052',
    text: {
      ar: 'ترتبط تقنية WAF كخط دفاع ثانٍ فقط ولا تُعدّ بديلًا عن المعاملة.',
      en: 'A WAF is a secondary control only and is not a substitute for parameterization.'
    },
    support: { a: 'A-077', b: 'A-103' },
    status: 'CONFLICT',
    confidence: 0.52,
    scope: { ar: 'الدفاع المحيطي', en: 'Perimeter defence' },
    owner: 'SK',
    inPair: false
  },
  {
    id: 'C-058',
    text: {
      ar: 'يكشف اختبار الوحدة التكميلية عن حقن SQL قبل الإنتاج عند تغطية المسارات الحرجة.',
      en: 'Fuzz testing surfaces SQL injection before production when critical paths are covered.'
    },
    support: { a: 'A-064', b: 'A-110' },
    status: 'SUPPORTED',
    confidence: 0.81,
    scope: { ar: 'الاختبار · التغطية', en: 'Testing · coverage' },
    owner: 'MR',
    inPair: false
  },
  {
    id: 'C-063',
    text: {
      ar: 'يجب عزل مخططات الأخطاء عن رسائل المستخدم النهائي في بيئة الإنتاج.',
      en: 'Schema detail must be isolated from end-user messages in production.'
    },
    support: { a: 'A-035', b: 'A-119' },
    status: 'QUALIFIED',
    confidence: 0.69,
    scope: { ar: 'التصحيح · الإنتاج', en: 'Debugging · production' },
    owner: 'AH',
    inPair: false
  },
  {
    id: 'C-071',
    text: {
      ar: 'تُوثّق كل مطابقة مصدر قبل إدراجها في دليل الضوابط المُعتمد.',
      en: 'Every source reconciliation is documented before it enters the approved control guide.'
    },
    support: { a: 'A-131', b: 'A-134' },
    status: 'SUPPORTED',
    confidence: 0.95,
    scope: { ar: 'الحوكمة · التوثيق', en: 'Governance · documentation' },
    owner: 'SK',
    inPair: false
  }
];

export const RQ_STATUS_LABEL: Record<RqClaimStatus, RqText> = {
  SUPPORTED: { ar: 'مدعوم', en: 'Supported' },
  QUALIFIED: { ar: 'مُقيَّد', en: 'Qualified' },
  NEEDS_REVIEW: { ar: 'يحتاج مراجعة', en: 'Needs review' },
  CONFLICT: { ar: 'تعارض', en: 'Conflict' }
};

export const RQ_STATUS_TONE: Record<RqClaimStatus, 'ok' | 'warn' | 'violet' | 'bad'> = {
  SUPPORTED: 'ok',
  QUALIFIED: 'warn',
  NEEDS_REVIEW: 'violet',
  CONFLICT: 'bad'
};

export interface RqRevision {
  id: string;
  date: string;
  state: 'APPROVED' | 'DRAFT' | 'SUPERSEDED';
  author: RqText;
  note: RqText;
}

export const RQ_REVISIONS: RqRevision[] = [
  {
    id: 'v3.3-draft',
    date: '2025-05-18',
    state: 'DRAFT',
    author: { ar: 'أحمد سعيد', en: 'Ahmed Al-Said' },
    note: { ar: 'إضافة تغطية رسائل الخطأ وإعادة ربط C-033 بمصدر ثانٍ.', en: 'Adds error-message coverage and re-links C-033 to a second source.' }
  },
  {
    id: 'v3.2',
    date: '2025-04-10',
    state: 'APPROVED',
    author: { ar: 'أحمد سعيد', en: 'Ahmed Al-Said' },
    note: { ar: 'اعتماد دفاع الاستعلامات المعاملة كضابط أساسي.', en: 'Approves the parameterized-query control as a primary safeguard.' }
  },
  {
    id: 'v3.1',
    date: '2025-02-24',
    state: 'SUPERSEDED',
    author: { ar: 'مريم رشيد', en: 'Mariam Rashid' },
    note: { ar: 'إعادة صياغة ادعاءات تقييد صلاحيات قاعدة البيانات.', en: 'Rewrites the database-privilege claims.' }
  },
  {
    id: 'v3.0',
    date: '2024-12-09',
    state: 'SUPERSEDED',
    author: { ar: 'سامي خالد', en: 'Sami Khalid' },
    note: { ar: 'الإصدار الأول من دليل ضوابط حقن SQL.', en: 'First issue of the SQL injection control guide.' }
  }
];

export interface RqProvenanceRow {
  anchor: string;
  source: string;
  locator: string;
  digest: string;
  retrieved: string;
  state: 'VERIFIED' | 'PARTIAL' | 'MISSING';
}

export const RQ_PROVENANCE: RqProvenanceRow[] = [
  { anchor: 'A-021', source: 'OWASP.org', locator: 'cheatsheets/SQL-Injection-Prevention.md#parameterized', digest: '9f2c4a7e1b6d0385', retrieved: '2025-04-02', state: 'VERIFIED' },
  { anchor: 'A-035', source: 'OWASP.org', locator: 'cheatsheets/Error_Handling_Cheat_Sheet.md#avoid-leaking', digest: '4ba7710c9e2d51f0', retrieved: '2025-04-02', state: 'VERIFIED' },
  { anchor: 'A-088', source: 'PortSwigger Academy', locator: 'web-security/sql-injection/preventing#parameterized', digest: '3c81de54a90fb267', retrieved: '2025-03-28', state: 'VERIFIED' },
  { anchor: 'A-091', source: 'PortSwigger Academy', locator: 'web-security/sql-injection/error-based', digest: '77e0c1d3f4a8620b', retrieved: '2025-03-28', state: 'PARTIAL' },
  { anchor: 'A-096', source: 'MITRE CWE', locator: 'definitions/entries/CWE-89.json#observed', digest: '1d5e93aa70c4be12', retrieved: '2025-03-19', state: 'VERIFIED' },
  { anchor: 'A-120', source: 'Internal working note', locator: 'unmapped', digest: '—', retrieved: '2025-05-14', state: 'MISSING' }
];

export interface RqActivityEntry {
  at: string;
  actor: RqText;
  text: RqText;
  tone: 'neutral' | 'ok' | 'warn' | 'bad';
}

export const RQ_ACTIVITY: RqActivityEntry[] = [
  {
    at: '2025-05-18 14:22',
    actor: { ar: 'أحمد سعيد', en: 'Ahmed Al-Said' },
    text: { ar: 'فتح مطابقة المصدر للادعاء C-014 على زوج A-021 / A-088.', en: 'Opened source reconciliation for claim C-014 on pair A-021 / A-088.' },
    tone: 'neutral'
  },
  {
    at: '2025-05-18 14:09',
    actor: { ar: 'النظام', en: 'System' },
    text: { ar: 'رُفض دعم A-120: لا يوجد توثيق مسجّل لهذا الادعاء.', en: 'Support A-120 rejected: no recorded provenance for this claim.' },
    tone: 'warn'
  },
  {
    at: '2025-05-18 13:47',
    actor: { ar: 'مريم رشيد', en: 'Mariam Rashid' },
    text: { ar: 'صُنّف C-052 تعارضًا: المصدران يتعارضان حول نطاق WAF.', en: 'C-052 classified as a conflict: the two sources disagree on WAF scope.' },
    tone: 'bad'
  },
  {
    at: '2025-05-17 17:31',
    actor: { ar: 'سامي خالد', en: 'Sami Khalid' },
    text: { ar: 'تم تأكيد 3 مراسات مرساة في مصدر OWASP.', en: 'Three anchors verified in the OWASP source.' },
    tone: 'ok'
  },
  {
    at: '2025-05-17 16:02',
    actor: { ar: 'أحمد سعيد', en: 'Ahmed Al-Said' },
    text: { ar: 'أُنشئت مسودّة المراجعة v3.3 وأُحيلت إلى قرار حديث.', en: 'Review draft v3.3 created and referred for a fresh decision.' },
    tone: 'neutral'
  }
];

export interface RqRelation {
  id: string;
  label: RqText;
  action: RqText;
  count: number;
}

export const RQ_RELATIONS: RqRelation[] = [
  {
    id: 'rel-statements',
    label: { ar: 'مرتبط بـ 2 عبارات أخرى', en: 'Linked to 2 further statements' },
    action: { ar: 'عرض العلاقات', en: 'Show relations' },
    count: 2
  },
  {
    id: 'rel-dependency',
    label: { ar: 'يعتمد عليه إعداد واحد', en: 'Relied on by 1 setting' },
    action: { ar: 'عرض الاعتماد', en: 'Show dependency' },
    count: 1
  }
];

export const RQ_REFERENCES: Array<{ id: string; label: RqText }> = [
  { id: 'OWASP ASVS: V5.3.2', label: { ar: 'معيار الضوابط التطبيقي — التحقق والمعاملة', en: 'Application security standard — validation and parameterization' } },
  { id: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command', label: { ar: 'تصنيف الضعف — عناصر خاصة في أمر SQL', en: 'Weakness classification — special elements in an SQL command' } }
];

export const RQ_TAGS: Array<{ id: string; tone: 'accent' | 'violet' | 'warn' }> = [
  { id: 'Injection', tone: 'accent' },
  { id: 'SQL', tone: 'violet' },
  { id: 'Input Validation', tone: 'warn' }
];

export interface RqOrderStep {
  id: string;
  label: RqText;
  state: 'done' | 'active' | 'pending';
}

export const RQ_ORDER: RqOrderStep[] = [
  { id: 'ORD-1', label: { ar: 'تثبيت زوج المصدر والمراسات', en: 'Pin the source pair and anchors' }, state: 'done' },
  { id: 'ORD-2', label: { ar: 'مطابقة كل ادعاء بمراساته', en: 'Reconcile every claim with its anchors' }, state: 'done' },
  { id: 'ORD-3', label: { ar: 'تصنيف التعارضات وفجوات التوثيق', en: 'Classify conflicts and provenance gaps' }, state: 'active' },
  { id: 'ORD-4', label: { ar: 'صياغة مسودّة الإصدار', en: 'Draft the proposed revision' }, state: 'pending' },
  { id: 'ORD-5', label: { ar: 'إحالة القرار إلى مراجعة رسمية', en: 'Refer the decision to a formal review' }, state: 'pending' }
];

export const RQ_REVIEW_RESULT = Object.freeze({
  approved: {
    label: { ar: 'الإصدار المعتمد الحالي', en: 'Currently approved revision' },
    version: 'v3.2',
    state: { ar: 'معتمد', en: 'Approved' },
    dateLabel: { ar: 'تاريخ الاعتماد', en: 'Approved on' },
    date: '2025-04-10',
    byLabel: { ar: 'مراجعة بواسطة', en: 'Reviewed by' },
    by: { ar: 'أحمد سعيد', en: 'Ahmed Al-Said' }
  },
  draft: {
    label: { ar: 'نتيجة المراجعة (مُقترحة)', en: 'Review result (proposed)' },
    version: { ar: 'مسودّة', en: 'Draft' },
    state: { ar: 'غير معتمد', en: 'Not approved' },
    dateLabel: { ar: 'تاريخ الإنشاء', en: 'Created on' },
    date: '2025-05-18',
    byLabel: { ar: 'الحالة', en: 'Disposition' },
    by: { ar: 'أُحيلت إلى مراجعة حديثة', en: 'Referred to a fresh review' }
  }
});

export const RQ_ACTIVE_REVIEW = Object.freeze({
  id: 'REV-SQLI-014',
  project: 'PROJ-SQLI',
  title: {
    ar: 'حقن SQL — مطابقة المصادر والادعاءات',
    en: 'SQL Injection — Source / Claim Reconciliation'
  },
  scope: {
    ar: '14 مصدرًا · 9 ادعاءات · 3 تعارضات مفتوحة',
    en: '14 sources · 9 claims · 3 open conflicts'
  },
  lastLabel: { ar: 'آخر مراجعة', en: 'Last reviewed' },
  lastDate: '2025-05-18'
});

export interface RqClaimNote {
  id: string;
  text: RqText;
}

export const RQ_CLAIM_LINKAGE = Object.freeze({
  state: 'COMPLETE' as const,
  label: { ar: 'ارتباط الادعاء', en: 'Claim linkage' },
  headline: { ar: 'كامل', en: 'Complete' },
  detail: {
    ar: 'تم ارتباط هذا الادعاء من مصدرَين موثوقين ومصدرين معتمدين بشكل كافٍ.',
    en: 'This claim is linked from two trusted sources and is sufficiently corroborated.'
  }
});

export const RQ_REVIEW_NOTE = Object.freeze({
  label: { ar: 'ملاحظة المراجعة', en: 'Review note' },
  text: {
    ar: 'يوفر الادعاء دعمًا قويًا لاستخدام الاستعلامات المعاملة (Parameterized Queries) كخط دفاع أساسي ضد حقن SQL. تستمر المراجعة في هذا المسار كمسودّة غير معتمدة حتى تُحسم التعارضات الثلاثة.',
    en: 'The claim gives strong support to using parameterized queries as the primary defence against SQL injection. The review continues in this track as an unapproved draft until the three conflicts are settled.'
  },
  lastLabel: { ar: 'آخر مراجعة', en: 'Last reviewed' },
  lastDate: '2025-05-18'
});

export const RQ_VIEW_IDS = ['compare', 'claims', 'provenance', 'revision', 'history'] as const;
export type RqViewId = (typeof RQ_VIEW_IDS)[number];

export const RQ_VIEW_LABEL: Record<RqViewId, RqText> = {
  compare: { ar: 'مقارنة', en: 'Compare' },
  claims: { ar: 'الادعاءات', en: 'Claims' },
  provenance: { ar: 'التوثيق', en: 'Provenance' },
  revision: { ar: 'الإصدار', en: 'Revision' },
  history: { ar: 'السجل', en: 'History' }
};

export const RQ_VIEW_SUMMARY: Record<RqViewId, RqText> = {
  compare: {
    ar: 'زوج المصدر المثبّت مع ادعاءات المراجعة الثلاثة ونتيجة الإصدار.',
    en: 'The pinned source pair, its three review claims and the revision outcome.'
  },
  claims: {
    ar: 'كل ادعاءات المشروع مع دعمه ومراساته ودرجة ثقته.',
    en: 'Every claim in the project with its support, anchors and confidence.'
  },
  provenance: {
    ar: 'مراسات المصادر ومؤشراتها ومحلّلاتها وتاريخ اقتباسها.',
    en: 'Source anchors, locators, digests and the date each was quoted.'
  },
  revision: {
    ar: 'إصدارات المسودّة من المعتمد إلى المُقترحة مع أصحابها.',
    en: 'Draft revisions from approved to proposed, with their authors.'
  },
  history: {
    ar: 'سجلّ أحداث تحليل العمل — محايد، ومحذوف، وغير قرار رسمي.',
    en: 'Working-analysis events — neutral, warn and bad, never a formal decision.'
  }
};

export const RQ_ACTIONS = [
  'accept', 'confirm', 'conflict', 'requestSource', 'embedReview'
] as const;
export type RqActionId = (typeof RQ_ACTIONS)[number];

export const RQ_ACTION_LABEL: Record<RqActionId, RqText> = {
  accept: { ar: 'قبول الدعم', en: 'Accept support' },
  confirm: { ar: 'تأكيد الادعاء', en: 'Confirm claim' },
  conflict: { ar: 'رفع تعارض', en: 'Raise conflict' },
  requestSource: { ar: 'طلب مصدر', en: 'Request source' },
  embedReview: { ar: 'تضمين مراجعة', en: 'Embed review' }
};

export const RQ_ACTION_HINT: Record<RqActionId, RqText> = {
  accept: { ar: 'قبول مراسات المصدر المحددة للادعاء المختار', en: 'Accept the selected source anchors for the selected claim' },
  confirm: { ar: 'تأكيد صياغة الادعاء دون تغيير دعمه', en: 'Confirm the claim wording without changing its support' },
  conflict: { ar: 'تسجيل تعارض محلي بين المصادر المطابَقة', en: 'Record a local conflict between the reconciled sources' },
  requestSource: { ar: 'طلب مصدر ثانٍ لادعاء بدعم واحد', en: 'Request a second source for a single-support claim' },
  embedReview: { ar: 'إدراج ملاحظة مراجعة في السياق', en: 'Embed a review note into the context' }
};

export const RQ_CONTEXT_TABS = ['overview', 'attributes', 'marks', 'order', 'history'] as const;
export type RqContextTab = (typeof RQ_CONTEXT_TABS)[number];

export const RQ_CONTEXT_TAB_LABEL: Record<RqContextTab, RqText> = {
  overview: { ar: 'نظرة عامة', en: 'Overview' },
  attributes: { ar: 'السمات', en: 'Attributes' },
  marks: { ar: 'العلامات', en: 'Marks' },
  order: { ar: 'الترتيب', en: 'Order' },
  history: { ar: 'التاريخ', en: 'History' }
};

export const RQ_QUEUE_DETAIL: Record<string, { label: RqText; advice: RqText }> = {
  'claim-conflicts': {
    label: { ar: 'تعارضات الادعاءات', en: 'Claim conflicts' },
    advice: {
      ar: 'ثلاثة ادعاءات يتعارض حولها مصدران موثوقان. صنّف التعارض أو اطلب مصدرًا حاسمًا قبل التصويت.',
      en: 'Three claims are contradicted by two trusted sources. Classify the conflict or request a decisive source before voting.'
    }
  },
  'missing-provenance': {
    label: { ar: 'توثيق ناقص', en: 'Missing provenance' },
    advice: {
      ar: 'خمسة ادعاءات بلا مرحلة توثيق مسجّلة. افتح سلسلة التوثيق وحدّد المرساة قبل القبول.',
      en: 'Five claims have no recorded locator. Open the provenance chain and pin the anchor before accepting.'
    }
  },
  'coverage-gaps': {
    label: { ar: 'فجوات التغطية', en: 'Coverage gaps' },
    advice: {
      ar: 'ادعاءان مدعومان بمصدر واحد فقط. اطلب مصدرًا ثانًٍا لرفعهما إلى مدعوم.',
      en: 'Two claims rest on a single source. Request a second source to promote them to supported.'
    }
  },
  'revision-reviews': {
    label: { ar: 'مراجعات الإصدارات', en: 'Revision reviews' },
    advice: {
      ar: 'مسودّة v3.3 بانتظار قرار. الإصدار المعتمد يبقى v3.2 حتى تُحسم المطابقة.',
      en: 'Draft v3.3 awaits a decision. v3.2 stays approved until the reconciliation settles.'
    }
  }
};
