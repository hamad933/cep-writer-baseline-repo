export const BALANCED6_TODAY_ITEMS = Object.freeze([
  {
    id: 'session-sql-02',
    kind: 'CONTINUE_SESSION',
    title: { ar: 'SQL Injection — Lesson 02', en: 'SQL Injection — Lesson 02' },
    track: { ar: 'المعرفة والتعلم • Learn', en: 'Knowledge & Learning • Learn' },
    status: { ar: 'قيد التنفيذ', en: 'In progress' },
    codeSnippet: "SELECT * FROM users\nWHERE username = 'admin' ...",
    lastActivity: { ar: 'منذ 18 دقيقة', en: '18 minutes ago' },
    lastPosition: { ar: '03 السيناريو — مثال إدخال غير موثوق', en: '03 Scenario — Untrusted input example' },
    summary: {
      ar: 'تم إكمال النظرة العامة والمفهوم الرئيسي، وتوقفت عند المثال التطبيقي.',
      en: 'Overview and core concept completed; paused at applied example.'
    },
    pathTags: [
      { ar: 'المسار: حقن SQL', en: 'Track: SQL Injection' },
      { ar: 'المرحلة: الدرس', en: 'Stage: Lesson' }
    ],
    continuation: {
      destination: 'learn',
      objectId: 'lesson-sql-injection-02',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'rec-practice-vuln-query',
    kind: 'RECOMMENDATION',
    title: { ar: 'Practice: Identify vulnerable query', en: 'Practice: Identify vulnerable query' },
    metaTags: [
      { ar: 'Lesson 02', en: 'Lesson 02' },
      { ar: 'SQL Injection', en: 'SQL Injection' },
      { ar: 'منخفض - متوسط', en: 'Low - Medium' }
    ],
    summary: {
      ar: 'تم إكمال الدرس، وهذه الممارسة هي التبعية التالية غير المحسومة قبل Basic Lab',
      en: 'Lesson completed; this practice is the next unresolved dependency before Basic Lab'
    },
    nextUnlock: {
      ar: 'يفتح بعد ذلك: SQL Injection — Basic Lab',
      en: 'Unlocks next: SQL Injection — Basic Lab'
    },
    rationaleCheck: {
      ar: 'المتطلب السابق مستوفى: Lesson 02',
      en: 'Prerequisite satisfied: Lesson 02'
    },
    rationaleNext: {
      ar: 'الاعتماد التالي غير المكتمل: Basic Lab',
      en: 'Next incomplete dependency: Basic Lab'
    },
    actionLabel: {
      ar: 'إتمام الممارسة قبل Basic Lab >',
      en: 'Complete practice before Basic Lab >'
    },
    recommendation: {
      sourceRef: 'learn:practice-sql-injection-01',
      version: 'v1.0',
      reasonCode: 'NEXT_UNRESOLVED_DEPENDENCY',
      rationale: 'المتطلب السابق مستوفى: Lesson 02 • الاعتماد التالي غير المكتمل: Basic Lab'
    },
    continuation: {
      destination: 'learn',
      objectId: 'practice-sql-injection-01',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'attn-evd-0042',
    kind: 'ATTENTION',
    domainArea: { ar: 'التقدم والأدلة', en: 'Progress & Evidence' },
    badge: { ar: 'مراجعة مستحقة', en: 'Review due' },
    badgeTone: 'warning',
    title: { ar: 'Evidence EVD-0042', en: 'Evidence EVD-0042' },
    summary: { ar: 'بانتظار الاعتماد قبل الإغلاق', en: 'Awaiting approval before closure' },
    actionLabel: { ar: 'مراجعة', en: 'Review' },
    continuation: {
      destination: 'evidence',
      objectId: 'EVD-0042',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'attn-run-0048',
    kind: 'ATTENTION',
    domainArea: { ar: 'المحاكاة والمؤسسات', en: 'Simulation & Enterprise' },
    badge: { ar: 'محظور', en: 'Blocked' },
    badgeTone: 'danger',
    title: { ar: 'RUN-0048', en: 'RUN-0048' },
    summary: { ar: 'تعارض في المنفذ 15432 يمنع التشغيل', en: 'Port 15432 conflict prevents execution' },
    actionLabel: { ar: 'فحص المشكلة', en: 'Inspect issue' },
    continuation: {
      destination: 'runs',
      objectId: 'RUN-0048',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'attn-restore-verif',
    kind: 'ATTENTION',
    domainArea: { ar: 'النظام والعمليات', en: 'System & Operations' },
    badge: { ar: 'تحذير', en: 'Warning' },
    badgeTone: 'warning',
    title: { ar: 'Restore verification', en: 'Restore verification' },
    summary: { ar: 'موعد التحقق الدوري مستحق اليوم', en: 'Periodic verification drill due today' },
    actionLabel: { ar: 'فتح', en: 'Open' },
    continuation: {
      destination: 'backup',
      objectId: 'restore-drill',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'attn-rq-018',
    kind: 'ATTENTION',
    domainArea: { ar: 'المعرفة والتعلم / البحث والجودة', en: 'Knowledge & Learning / Research & Quality' },
    badge: { ar: 'تعارض مصدر', en: 'Source conflict' },
    badgeTone: 'info',
    title: { ar: 'RQ-SRC-018', en: 'RQ-SRC-018' },
    summary: { ar: 'تعارض في ادعاء النطاق بين مراجعين', en: 'Scope claim conflict between reviewers' },
    actionLabel: { ar: 'مراجعة التعارض', en: 'Review conflict' },
    continuation: {
      destination: 'rq',
      objectId: 'RQ-SRC-018',
      exists: true,
      readable: true,
      targetState: 'RESOLVABLE'
    }
  },
  {
    id: 'rec-ctx-1',
    kind: 'RECENT_CONTEXT',
    domainArea: { ar: 'المعرفة والتعلم', en: 'Knowledge & Learning' },
    timeLabel: { ar: 'منذ 24 دقيقة', en: '24 min ago' },
    title: { ar: 'Completed Lesson 02', en: 'Completed Lesson 02' }
  },
  {
    id: 'rec-ctx-2',
    kind: 'RECENT_CONTEXT',
    domainArea: { ar: 'المعرفة والتعلم', en: 'Knowledge & Learning' },
    timeLabel: { ar: 'منذ 26 دقيقة', en: '26 min ago' },
    title: { ar: 'Viewed SQL Injection map', en: 'Viewed SQL Injection map' }
  },
  {
    id: 'rec-ctx-3',
    kind: 'RECENT_CONTEXT',
    domainArea: { ar: 'المحاكاة والمؤسسات', en: 'Simulation & Enterprise' },
    timeLabel: { ar: 'منذ 1 ساعة', en: '1 hour ago' },
    title: { ar: 'Sealed RUN-0042 result', en: 'Sealed RUN-0042 result' }
  },
  {
    id: 'rec-ctx-4',
    kind: 'RECENT_CONTEXT',
    domainArea: { ar: 'التقدم والأدلة', en: 'Progress & Evidence' },
    timeLabel: { ar: 'منذ 2 ساعة', en: '2 hours ago' },
    title: { ar: 'Submitted Candidate Evidence', en: 'Submitted Candidate Evidence' }
  },
  {
    id: 'rec-ctx-5',
    kind: 'RECENT_CONTEXT',
    domainArea: { ar: 'النظام والعمليات', en: 'System & Operations' },
    timeLabel: { ar: 'منذ 3 ساعات', en: '3 hours ago' },
    title: { ar: 'Validation session completed with warnings', en: 'Validation session completed with warnings' }
  },
  {
    id: 'prog-1',
    kind: 'PROGRESS',
    title: { ar: 'SQL Injection 7/10', en: 'SQL Injection 7/10' },
    value: '7/10',
    progressPercent: 70,
    icon: 'check'
  },
  {
    id: 'prog-2',
    kind: 'PROGRESS',
    title: { ar: '2 مراجعتان معلقتان', en: '2 pending reviews' },
    value: '2',
    icon: 'file'
  },
  {
    id: 'prog-3',
    kind: 'PROGRESS',
    title: { ar: '1 تحضير نشط في المحاكاة', en: '1 active simulation prep' },
    value: '1',
    icon: 'play'
  },
  {
    id: 'prog-4',
    kind: 'PROGRESS',
    title: { ar: '3 شواهد مكتملة قيد التدقيق', en: '3 completed evidence under review' },
    value: '3',
    icon: 'shield'
  },
  {
    id: 'prog-5',
    kind: 'PROGRESS',
    title: { ar: '1 تحذير تشغيلي واحد', en: '1 operational warning' },
    value: '1',
    icon: 'alert'
  }
]);

export function createBalanced6TodayProviders() {
  return [
    Object.freeze({
      id: 'balanced6.today.orchestration-provider',
      read: () => ({
        providerId: 'balanced6.today.orchestration-provider',
        state: 'OBSERVED_DATA',
        observedAt: '2025-05-18T10:40:00Z',
        reason: 'GOVERNED_BASELINE_PROJECTION',
        items: structuredClone(BALANCED6_TODAY_ITEMS)
      }),
      descriptor: () => ({
        providerId: 'balanced6.today.orchestration-provider',
        authority: 'LOCAL_ACCEPTANCE_PROJECTION_ONLY'
      })
    })
  ];
}
