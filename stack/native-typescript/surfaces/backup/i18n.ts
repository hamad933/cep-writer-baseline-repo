/* W05-BACKUP · bilingual text catalog (Arabic + English are BOTH first-class).
 *
 * No permanent product-language authority (VISUAL_EXECUTION_STANDARD §7): the active locale is
 * read from the document shell, which the shared Settings preference writes. Nothing here bakes
 * a direction into structure — every layout uses logical properties, and technical tokens stay
 * isolated in <bdi dir="ltr"> by the presentation layer.
 *
 * Status vocabulary (PASS / VERIFIED / PENDING / NOT_RUN / FAILED / UNAVAILABLE / AUTHORITY_PENDING …)
 * is provider-owned technical vocabulary and stays a mono LTR token in BOTH languages, exactly as
 * the reference shows inside an Arabic UI.
 */

export type BackupLocale = 'ar' | 'en';

export const activeLocale = () => {
  if (typeof document === 'undefined') return 'en';
  const lang = String(document.documentElement.lang || document.body?.getAttribute('lang') || 'en').toLowerCase();
  return lang.startsWith('ar') ? 'ar' : 'en';
};

const TEXT = {
  en: {
    /* identity */
    eyebrow: 'W05 · BACKUP & RESTORE',
    title: 'Backup & Restore',
    subtitle: 'Recovery Safety',
    lead: 'Manage verified backup packages and isolated restore runs, and execute restore drills whose evidence is reported from an environment outside production.',
    /* actions (compact strip labels) */
    actPackage: 'New package',
    actPlan: 'Plan',
    actPreview: 'Preview',
    actStage: 'Stage',
    actDrill: 'Run drill',
    actActivation: 'Activation',
    /* safety banner */
    banner: 'No command on this surface owns a production restore point. Staged and verified is not a live restore — activation stays pending until authority is granted.',
    /* drill report */
    drillSection: 'Restore Drill Report',
    drillTitle: 'Restore Drill',
    pillVerified: 'COMPLETED / VERIFIED',
    pillNotRun: 'NOT RUN',
    pillFailed: 'FAILED',
    notRunTitle: 'No isolated restore drill has run in this environment',
    notRunBody: 'Nothing is inferred from a drill that has not run: no restore is reported until a provider receipt says so. Create a package, then walk the pipeline below.',
    metaSource: 'Source backup',
    metaStarted: 'Started',
    metaCompleted: 'Completed',
    metaDuration: 'Duration',
    metaEnvironment: 'Environment',
    /* pipeline */
    pipelineTitle: 'Restore drill pipeline',
    pipelineSub: 'Every stage is bound to a provider receipt',
    stages: [
      'Package identity',
      'Preflight integrity',
      'Isolated staging',
      'Restore copy',
      'Post-restore readback',
      'Clean-environment run',
      'Expected vs actual',
      'Drill verdict'
    ],
    /* verification grid */
    checksTitle: 'Actual verification results',
    checksSub: 'Assertions read from the drill receipt',
    checks: [
      'Manifest checksum',
      'Schema artifact',
      'Integrity check',
      'Foreign keys',
      'Migrations',
      'Isolated empty target',
      'Production untouched',
      'No live restore',
      'Final verdict'
    ],
    /* metrics */
    metricsTitle: 'Expected state vs actual state',
    legendMatched: 'Matched',
    legendDiff: 'Difference',
    legendUnavailable: 'Unavailable',
    metricDocs: 'Documents',
    metricRevisions: 'Revisions',
    metricRecovery: 'Recovery points',
    metricMigrations: 'Migrations',
    metricSchema: 'Schema signature',
    metricDiff: 'Differences',
    matchedCaption: 'matched',
    noDifferences: 'No differences present',
    metricsNotRun: 'Compare runs after a drill produces a receipt.',
    /* left pane */
    leftHeading: 'System operations',
    grpRestorePoints: 'Restore points',
    grpDrills: 'Restore drills',
    grpJournal: 'Attempt journal',
    grpAuthority: 'Activation authority',
    searchPlaceholder: 'Search restore points…',
    noPackages: 'No verified BackupPackage exists yet',
    noPackagesHint: 'Create one to start the pipeline.',
    noDrills: 'No drill recorded',
    noJournal: 'No durable attempt yet',
    newPackage: 'New package',
    viewAll: 'View all restore points',
    filterVerified: 'Verified only',
    capturedAt: 'captured',
    /* right pane */
    rightHeading: 'Package context',
    scopeTitle: 'Package scope',
    scopeDocuments: 'Documents',
    scopeRevisions: 'Revisions',
    scopeRecovery: 'Recovery points',
    scopeMigrations: 'Migrations',
    scopeDriver: 'Driver',
    lastVerifyTitle: 'Last package verification',
    lastVerifyNever: 'Not verified yet',
    signatureTitle: 'Manifest & signatures',
    sigManifest: 'Manifest',
    sigSnapshot: 'Snapshot',
    sigSchema: 'Schema artifact',
    readinessTitle: 'Command readiness',
    ready: 'Ready',
    blocked: 'Blocked',
    targetTitle: 'Isolated target',
    targetKind: 'Kind',
    targetLive: 'Live',
    targetEmpty: 'True-empty required',
    targetNotStaged: 'Not staged',
    rtorpoTitle: 'RTO / RPO',
    rtoLabel: 'RTO target ≤ 30 min',
    rtoAchieved: 'Achieved',
    rpoLabel: 'RPO target ≤ 15 min',
    rpoAchieved: 'Window since capture',
    riskTitle: 'Risk notice',
    riskDirect: 'Direct execution against production is prohibited.',
    riskStaged: 'Staged and verified is not a live restore.',
    riskAuthority: 'Activation remains pending explicit authority.',
    stateTitle: 'State interpretation',
    stateVerified: 'A durable provider receipt exists for this value.',
    statePending: 'Not produced yet — never inferred as success.',
    stateUnavailable: 'The provider seam does not expose this value.',
    /* bottom shelf */
    bottomLabel: 'Evidence ledger',
    bottomSummary: 'Durable attempt receipts from the provider journal. Staging, activation and a live restore are separate facts.',
    colAttempt: 'Attempt',
    colOperation: 'Operation',
    colPhase: 'Phase',
    colStatus: 'Status',
    colPackage: 'Package',
    colAt: 'When',
    rawReceipt: 'Raw last receipt',
    noAttempts: 'No durable attempt recorded in the provider journal.',
    provenance: 'Provenance',
    /* readiness reasons (surface-localised precondition text) */
    rPackage: 'Create a verified BackupPackage first.',
    rPlan: 'Select a verified package to plan its restore.',
    rPreview: 'Create the RestorePlan first.',
    rStage: 'Preview the exact package first.',
    rDrill: 'Stage the isolated drill intent first.',
    rActivation: 'Requires a verified isolated drill that was not live-restored.',
    /* status line */
    stOk: '{cmd} completed — receipt recorded.',
    stFail: '{cmd} unavailable or failed — {code}',
    /* misc */
    notAvailable: 'Not available yet',
    count: 'count',
    lock: 'Signed manifest',
    truthTitle: 'Provider truth',
    provTitle: 'Journal provenance',
    failureJournal: 'Failure & compensation',
    authorityRequest: 'Activation request',
    noAuthority: 'NOT_REQUESTED',
    clearFilters: 'Clear search & filter'
  },
  ar: {
    eyebrow: 'W05 · BACKUP & RESTORE',
    title: 'النسخ الاحتياطي والاستعادة',
    subtitle: 'سلامة التعافي',
    lead: 'إدارة النسخ الاحتياطية المُتحقق منها والاستعادة المعزولة، وتنفيذ اختبارات الاستعادة وتقاريرها من بيئة خارج الإنتاج.',
    actPackage: 'نسخة جديدة',
    actPlan: 'تخطيط',
    actPreview: 'معاينة',
    actStage: 'تجهيز',
    actDrill: 'اختبار الاستعادة',
    actActivation: 'طلب التفعيل',
    banner: 'لا يمتلك أي أمر على هذا السطح نقطة استعادة في الإنتاج. التجهيز المُتحقق ليس استعادة فعلية — والتفعيل يبقى في انتظار السلطة.',
    drillSection: 'تقرير اختبار الاستعادة',
    drillTitle: 'اختبار الاستعادة',
    pillVerified: 'مكتمل · مُتحقق',
    pillNotRun: 'لم يُنفَّذ',
    pillFailed: 'فشل',
    notRunTitle: 'لم يُنفَّذ اختبار استعادة معزول في هذه البيئة',
    notRunBody: 'لا يُستنتج شيء من اختبار لم يُنفَّذ: لا تُبلَّغ استعادة حتى يثبتها إيصال من المزوّد. أنشئ حزمة أولًا ثم اتبع خطوط الأنابيب أدناه.',
    metaSource: 'النسخة المصدر',
    metaStarted: 'بدأ الاختبار',
    metaCompleted: 'اكتمل في',
    metaDuration: 'المدة الإجمالية',
    metaEnvironment: 'البيئة',
    pipelineTitle: 'سير اختبار الاستعادة',
    pipelineSub: 'كل مرحلة مربوطة بإيصال من المزوّد',
    stages: [
      'تحديد الحزمة',
      'الفحص المسبق للسلامة',
      'تجهيز بيئة معزولة',
      'نسخة الاستعادة',
      'تحقق القراءة بعد الاستعادة',
      'التشغيل في بيئة نظيفة',
      'المتوقع مقابل الفعلي',
      'حكم الاختبار'
    ],
    checksTitle: 'نتائج التحقق الفعلية',
    checksSub: 'قيود مقروءة من إيصال الاختبار',
    checks: [
      'بصمة بيان الحزمة',
      'بصمة أصل المخطط',
      'فحص السلامة',
      'القيود الخارجية',
      'الترحيلات',
      'هدف معزول فارغ',
      'عدم تغيير قاعدة الإنتاج',
      'غياب الاستعادة المباشرة',
      'الحكم النهائي'
    ],
    metricsTitle: 'الحالة المتوقعة مقابل الحالة الفعلية',
    legendMatched: 'مطابقة',
    legendDiff: 'اختلاف',
    legendUnavailable: 'غير متاح',
    metricDocs: 'المستندات',
    metricRevisions: 'المراجعات',
    metricRecovery: 'نقاط التعافي',
    metricMigrations: 'الترحيلات',
    metricSchema: 'توقيع المخطط',
    metricDiff: 'الاختلافات',
    matchedCaption: 'مطابق',
    noDifferences: 'لا توجد اختلافات',
    metricsNotRun: 'تُجرى المقارنة بعد أن ينتج الاختبار إيصالًا.',
    leftHeading: 'عمليات النظام',
    grpRestorePoints: 'نقاط الاستعادة',
    grpDrills: 'اختبارات الاستعادة',
    grpJournal: 'سجل المحاولات',
    grpAuthority: 'سلطة التفعيل',
    searchPlaceholder: 'ابحث في نقاط الاستعادة…',
    noPackages: 'لا توجد حزمة مُتحقق منها بعد',
    noPackagesHint: 'أنشئ حزمة لبدء خط الأنابيب.',
    noDrills: 'لا اختبار مسجّل',
    noJournal: 'لا محاولة دائمة بعد',
    newPackage: 'حزمة جديدة',
    viewAll: 'عرض جميع نقاط الاستعادة',
    filterVerified: 'المُتحقق فقط',
    capturedAt: 'الالتقاط',
    rightHeading: 'سياق النسخة',
    scopeTitle: 'نطاق الحزمة',
    scopeDocuments: 'المستندات',
    scopeRevisions: 'المراجعات',
    scopeRecovery: 'نقاط التعافي',
    scopeMigrations: 'الترحيلات',
    scopeDriver: 'البنية',
    lastVerifyTitle: 'آخر تحقق من الحزمة',
    lastVerifyNever: 'لم يُتحقَّق بعد',
    signatureTitle: 'التوقيع والبصمات',
    sigManifest: 'البيان',
    sigSnapshot: 'اللقطة',
    sigSchema: 'أصل المخطط',
    readinessTitle: 'جاهزية الأوامر',
    ready: 'متاح',
    blocked: 'محجوب',
    targetTitle: 'البيئة المعزولة',
    targetKind: 'النوع',
    targetLive: 'حية',
    targetEmpty: 'تتطلّب فراغًا حقيقيًا',
    targetNotStaged: 'غير مُجهَّز',
    rtorpoTitle: 'RTO / RPO',
    rtoLabel: 'هدف RTO ≤ ٣٠ دقيقة',
    rtoAchieved: 'المحقق',
    rpoLabel: 'هدف RPO ≤ ١٥ دقيقة',
    rpoAchieved: 'النافذة منذ الالتقاط',
    riskTitle: 'تحذير الخطر',
    riskDirect: 'ممنوع التنفيذ المباشر على الإنتاج.',
    riskStaged: 'التجهيز المُتحقق ليس استعادة فعلية.',
    riskAuthority: 'التفعيل في انتظار سلطة صريحة.',
    stateTitle: 'تفسير الحالة',
    stateVerified: 'يوجد إيصال دائم من المزوّد لهذا القيّم.',
    statePending: 'لم يُنتَج بعد — لا يُستنتج منه نجاح.',
    stateUnavailable: 'لا يكشف خيط المزوّد هذا القيّم.',
    bottomLabel: 'سجل الأدلة',
    bottomSummary: 'إيصالات المحاولات الدائمة من سجل المزوّد. التجهيز والتفعيل والاستعادة الفعلية حقائق منفصلة.',
    colAttempt: 'المحاولة',
    colOperation: 'العملية',
    colPhase: 'المرحلة',
    colStatus: 'الحالة',
    colPackage: 'الحزمة',
    colAt: 'الوقت',
    rawReceipt: 'الإيصال الخام الأخير',
    noAttempts: 'لا محاولة دائمة مسجّلة في سجل المزوّد.',
    provenance: 'المصدر',
    rPackage: 'أنشئ حزمة مُتحقق منها أولًا.',
    rPlan: 'حدّد حزمة مُتحقق منها لتخطيط استعادتها.',
    rPreview: 'أنشئ خطة الاستعادة أولًا.',
    rStage: 'عاين الحزمة المحددة أولًا.',
    rDrill: 'جهّز نية الاختبار المعزولة أولًا.',
    rActivation: 'يشترط اختبارًا معزولًا مُتحققًا لم يُستعد مباشرة.',
    stOk: '{cmd} · تمت العملية وسُجّل الإيصال.',
    stFail: '{cmd} · غير متاح أو متعذّر — {code}',
    notAvailable: 'غير مُتاح بعد',
    count: 'العدد',
    lock: 'بيان موقّع',
    truthTitle: 'حقائق المزوّد',
    provTitle: 'مصدر السجل',
    failureJournal: 'الفشل والتعويض',
    authorityRequest: 'طلب التفعيل',
    noAuthority: 'NOT_REQUESTED',
    clearFilters: 'مسح البحث والترشيح'
  }
} as const;

export type BackupTextKey = keyof typeof TEXT['en'];

/** Localised string for the active locale (never falls back to a privileged language). */
export const tx = (key: BackupTextKey, locale: BackupLocale = activeLocale()): string => {
  const table: any = TEXT;
  const value = table[locale]?.[key] ?? table.en[key];
  if (Array.isArray(value)) return '';
  return String(value ?? '');
};

/** Localised list entry (stages / checks). */
export const txList = (key: BackupTextKey, index: number, locale: BackupLocale = activeLocale()): string => {
  const table: any = TEXT;
  const value = table[locale]?.[key] ?? table.en[key];
  return Array.isArray(value) ? String(value[index] ?? value[0] ?? '') : '';
};

export const LOCALIZED_COMMAND_LABELS: Record<string, { en: string; ar: string }> = {
  'backup.package': { en: 'Create verified BackupPackage', ar: 'إنشاء حزمة مُتحقق منها' },
  'backup.plan': { en: 'Plan restore drill', ar: 'تخطيط اختبار الاستعادة' },
  'backup.preview': { en: 'Preview exact package/plan', ar: 'معاينة الحزمة والخطة' },
  'backup.stage': { en: 'Stage isolated drill intent', ar: 'تجهيز نية الاختبار المعزولة' },
  'backup.drill': { en: 'Run isolated restore drill', ar: 'تنفيذ اختبار استعادة معزول' },
  'backup.activationRequest': { en: 'Request activation authority', ar: 'طلب سلطة التفعيل' },
  'foundation.settings': { en: 'Settings', ar: 'التفضيلات' }
};

export const COMMAND_REASON_KEYS: Record<string, BackupTextKey> = {
  'backup.package': 'rPackage',
  'backup.plan': 'rPlan',
  'backup.preview': 'rPreview',
  'backup.stage': 'rStage',
  'backup.drill': 'rDrill',
  'backup.activationRequest': 'rActivation'
};
