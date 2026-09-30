const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const bdi = value => `<bdi dir="ltr">${esc(value)}</bdi>`;
const itemTitle = (item, lang) => String(item?.title?.[lang] || item?.title || item?.label?.[lang] || item?.label || item?.id || '');
const itemSummary = (item, lang) => String(item?.summary?.[lang] || item?.summary || item?.description?.[lang] || item?.description || '');
const itemTrack = (item, lang) => String(item?.track?.[lang] || item?.track || item?.domainArea?.[lang] || item?.domainArea || '');
const itemBadge = (item, lang) => String(item?.statusBadge?.[lang] || item?.statusBadge || item?.badge?.[lang] || item?.badge || '');
const itemBadgeTone = item => String(item?.statusTone || item?.badgeTone || 'ok');
const itemActionLabel = (item, lang) => String(item?.actionLabel?.[lang] || item?.actionLabel || '');
const byKind = (projection, kind) => projection.items.filter(item => item.kind === kind);
const stateTone = state => ['ERROR','UNAVAILABLE'].includes(state) ? 'danger' : ['STALE','PARTIAL'].includes(state) ? 'warning' : ['FETCHING','AVAILABLE_EMPTY'].includes(state) ? 'muted' : 'ok';

const COPY = Object.freeze({
  ar: {
    eyebrow: 'إسقاط يومي من مصادره الأصلية',
    title: 'اليوم',
    greeting: 'مرحبًا، إليك سياق يومك',
    observed: 'آخر رصد موثوق',
    noObservation: 'لا يوجد رصد مزوّد حالي',
    subtitle: 'استأنف ما كنت تعمل عليه، وراجع الإجراء التالي والانتباه والسياق والتقدم دون إنشاء حقيقة جديدة.',
    continue: 'متابعة الجلسة الحالية',
    resume: 'متابعة',
    next: 'الإجراء التالي الموصى به',
    why: 'لماذا الآن؟',
    whyThis: 'لماذا هذا؟',
    unlockNext: 'يفتح بعد ذلك:',
    showWhy: 'عرض السبب',
    startPractice: 'ابدأ الممارسة',
    viewAll: 'عرض',
    attention: 'يحتاج انتباهك',
    recent: 'السياق الأخير',
    progress: 'توقع التقدم',
    refresh: 'تحديث',
    all: 'الكل',
    empty: 'لا توجد عناصر مرصودة في هذا الإسقاط.',
    filtered: 'لا توجد عناصر مطابقة للمرشح، بينما تبقى إجماليات المصدر كما هي.',
    unavailable: 'مصادر Today غير متاحة حاليًا.',
    failed: 'فشل رصد مصادر Today؛ تم الاحتفاظ بآخر إسقاط ناجح عندما يكون متاحًا.',
    stale: 'البيانات المرصودة قديمة.',
    partial: 'الإسقاط جزئي؛ بعض المصادر لم تُرصد بنجاح.',
    source: 'المصدر',
    version: 'الإصدار',
    noRationale: 'لا يوجد تفسير موثوق لهذا الإصدار.',
    open: 'فتح',
    noSession: 'لا توجد جلسة قابلة للاستئناف في الإسقاط الحالي.',
    noAttention: 'لا توجد عناصر انتباه مرصودة.',
    noRecent: 'لا يوجد سياق حديث مرصود.',
    noProgress: 'لا يوجد إسقاط تقدم مرصود.',
    fetching: 'جارٍ رصد مصادر Today الحالية.',
    retained: 'سياق محتفظ به من آخر رصد ناجح',
    explore: 'استكشاف المحتوى'
  },
  en: {
    eyebrow: 'Daily projection from canonical owners',
    title: 'Today',
    greeting: 'Welcome — here is your day in context',
    observed: 'Last trusted observation',
    noObservation: 'No current provider observation',
    subtitle: 'Resume work and inspect next action, attention, recent context and progress without creating a second truth store.',
    continue: 'Continue current session',
    resume: 'Resume',
    next: 'Next recommended action',
    why: 'Why now?',
    whyThis: 'Why this?',
    unlockNext: 'Unlocks next:',
    showWhy: 'Show why',
    startPractice: 'Start practice',
    viewAll: 'View',
    attention: 'Needs attention',
    recent: 'Recent context',
    progress: 'Progress projection',
    refresh: 'Refresh',
    all: 'All',
    empty: 'No observed items in this projection.',
    filtered: 'No items match this filter; source totals are unchanged.',
    unavailable: 'Today providers are currently unavailable.',
    failed: 'Today provider observation failed; the last successful projection is retained when available.',
    stale: 'Observed data is stale.',
    partial: 'Projection is partial; one or more sources were not observed successfully.',
    source: 'Source',
    version: 'Version',
    noRationale: 'No trustworthy rationale is available for this version.',
    open: 'Open',
    noSession: 'No resumable session is present in the current projection.',
    noAttention: 'No observed attention items.',
    noRecent: 'No observed recent context.',
    noProgress: 'No observed progress projection.',
    fetching: 'Observing current Today providers.',
    retained: 'Retained context from the last successful observation',
    explore: 'Explore content'
  }
});

export function todayProjectionStateCopy(projection, lang = 'ar') {
  const c = COPY[lang === 'en' ? 'en' : 'ar'];
  if (projection.filteredEmpty) return c.filtered;
  return ({
    UNAVAILABLE: c.unavailable,
    ERROR: c.failed,
    STALE: c.stale,
    PARTIAL: c.partial,
    AVAILABLE_EMPTY: c.empty,
    FETCHING: c.fetching
  }[projection.state] || '');
}

export function buildTodayOrchestrationViewModel(projection, { lang = 'ar', adapter = null } = {}) {
  const l = lang === 'en' ? 'en' : 'ar', c = COPY[l], recommendations = byKind(projection, 'RECOMMENDATION'), selected = recommendations[0] || null;
  const observedAt = (projection.sources || []).map(source => source.observedAt).find(Boolean) || null;
  const observedDate = observedAt ? new Date(observedAt) : null;
  const dayContext = observedDate && !Number.isNaN(observedDate.valueOf()) ? new Intl.DateTimeFormat(l === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(observedDate) : c.noObservation;
  const selectedVersion = selected?.recommendation?.version || '';
  const whyAvailability = selected && adapter?.canExplain ? adapter.canExplain(selected.id, selectedVersion) : { enabled: false, reason: c.noRationale, code: 'RECOMMENDATION_SELECTION_BOUNDARY_UNAVAILABLE' };
  const continuation = byKind(projection, 'CONTINUE_SESSION')[0] || null;
  const resumeAvailability = continuation && adapter?.canResume ? adapter.canResume(continuation.id) : { enabled: false, reason: c.unavailable, code: 'CONTINUATION_RESOLVER_UNBOUND' };
  return Object.freeze({
    owner: 'TodayOrchestrationPresentation',
    lang: l,
    dir: l === 'ar' ? 'rtl' : 'ltr',
    copy: c,
    projection,
    continuation,
    resumeAvailability,
    recommendation: selected,
    whyAvailability,
    attention: byKind(projection, 'ATTENTION'),
    recent: byKind(projection, 'RECENT_CONTEXT'),
    progress: byKind(projection, 'PROGRESS'),
    statusMessage: todayProjectionStateCopy(projection, l),
    statusTone: stateTone(projection.state),
    observedAt,
    dayContext
  });
}

const style = `<style data-today-orchestration-style>
.today-orchestration {
  font-family: var(--ui, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", sans-serif);
  display: grid;
  gap: 14px;
  color: var(--fg, #e6f1fc);
  min-height: 100%;
  padding: 16px 20px 26px;
  background:
    radial-gradient(1100px 460px at 90% -10%, rgba(14, 165, 233, 0.10) 0%, transparent 68%),
    radial-gradient(760px 380px at 4% 104%, rgba(8, 145, 178, 0.08) 0%, transparent 70%),
    linear-gradient(180deg, #050e1c 0%, #030a15 100%);
  box-sizing: border-box;
  /* Physical grid order is fixed (work column left, attention rail right) exactly as
     .today-layout is; TEXT direction stays logical and is restored per block below. */
  direction: ltr;
}
.today-orchestration * {
  box-sizing: border-box;
}
.today-orchestration button { font-family: inherit; }
/* Direction model
   ------------------------------------------------------------------
   Spatial order is PHYSICAL (greeting left, card titles at the start edge,
   hero visual first, next-action before why-now, recent before progress) — the
   same fixed workbench geometry the reference shows in Arabic and the same
   direction:ltr rule .today-layout already uses for the main/rail split.
   TEXT order inside content blocks stays LOGICAL and follows the active language. */
.today-orchestration:where([dir="rtl"]) :where(.today-list, .today-filterbar, .today-action-sm, .today-link-btn) { direction: rtl; }
.today-orchestration:where([dir="ltr"]) :where(.today-list, .today-filterbar, .today-action-sm, .today-link-btn) { direction: ltr; }

/* ---- Greeting band: one dominant focal point, date + scope at the end ---- */
.today-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px 28px;
  flex-wrap: wrap;
  padding: 4px 2px 2px;
  /* The band belongs to the work column (matches the reference): it stops where the
     attention rail begins instead of running under it. */
  width: calc((100% - 14px) * 1.85 / 2.8);
  max-width: 100%;
}
.today-head-main {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}
.today-glyph {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, rgba(14, 165, 233, 0.18), rgba(14, 165, 233, 0.05));
  border: 1px solid rgba(56, 189, 248, 0.30);
  box-shadow: 0 6px 18px rgba(2, 12, 24, 0.5);
  color: #fbbf24;
  font-size: 22px;
  line-height: 1;
}
.today-head-stack { display: grid; gap: 3px; min-width: 0; }
.today-eyebrow {
  color: #4bb8ea;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.today-greeting-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.today-heading {
  margin: 0;
  font-size: clamp(21px, 2.2vw, 29px);
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.today-subtitle {
  margin: 0;
  color: #8ba3bd;
  font-size: 13.5px;
  line-height: 1.5;
  max-width: 76ch;
}
.today-head-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 9px;
}
/* Scope toolbar sits BELOW the band so the greeting keeps the only focal point. */
.today-scopebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  flex-wrap: wrap;
  width: calc((100% - 14px) * 1.85 / 2.8);
  max-width: 100%;
  padding: 0 2px;
}
.today-scope-readouts {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  flex-wrap: wrap;
}
.today-day-context {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #c9d8e8;
  font-size: 12.5px;
  line-height: 1.35;
  background: rgba(7, 26, 46, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: 10px;
  padding: 8px 13px;
  max-width: 44ch;
}
.today-day-lines { display: grid; gap: 1px; min-width: 0; }
.today-day-label { font-size: 10.5px; font-weight: 700; color: #7dd3fc; letter-spacing: .04em; }
.today-day-value { font-size: 13px; color: #eaf2fb; font-weight: 600; }
.today-day-context strong { color: #7dd3fc; font-weight: 600; }
.today-clock {
  font-size: 11.5px;
  color: #7dd3fc;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(14, 165, 233, 0.10);
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.24);
  letter-spacing: 0.02em;
}
/* Segmented scope toolbar — quiet, secondary to the greeting */
.today-filterbar {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  align-items: center;
  padding: 3px;
  border: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: 9px;
  background: rgba(5, 17, 31, 0.72);
}
.today-filter {
  border: 1px solid transparent;
  background: transparent;
  color: #8ba3bd;
  border-radius: 6px;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}
.today-filter:hover {
  color: #eaf3fb;
  background: rgba(56, 189, 248, 0.10);
}
.today-filter:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 1px;
}
.today-filter[aria-pressed="true"] {
  border-color: rgba(56, 189, 248, 0.45);
  color: #a9e4ff;
  background: rgba(14, 165, 233, 0.20);
  font-weight: 600;
}
.today-refresh-btn {
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.30);
  margin-inline-start: 4px;
}
.today-status {
  border: 1px solid color-mix(in srgb, currentColor 32%, transparent);
  background: color-mix(in srgb, currentColor 9%, transparent);
  border-radius: 9999px;
  padding: 4px 11px;
  font-size: 11.5px;
  font-weight: 600;
}
.today-status[data-tone="muted"] { color: #8ba3bd; }
.today-status[data-tone="warning"] { color: #fbbf24; }
.today-status[data-tone="danger"] { color: #f87171; }
.today-status[data-tone="ok"] { color: #34d399; }

/* ---- Orchestration frame: work column + attention rail ---- */
.today-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(290px, .95fr);
  grid-template-areas: "main attention";
  direction: ltr;
  gap: 14px;
  align-items: start;
}
.today-main {
  display: grid;
  grid-area: main;
  min-width: 0;
  gap: 14px;
}
.today-attention-side { grid-area:attention; min-width:0; }
.today-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  min-width: 0;
}
.today-grid-2[data-split="wide-first"] { grid-template-columns: minmax(0, 2.1fr) minmax(0, 1fr); }

/* ---- Card system: one calm surface tier, no per-card shadow stack ---- */
.today-card {
  border: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: 13px;
  background: linear-gradient(180deg, rgba(9, 26, 45, 0.94) 0%, rgba(6, 18, 33, 0.96) 100%);
  box-shadow: 0 10px 26px rgba(1, 8, 17, 0.42);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.today-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px 9px;
}
.today-card-title-group {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  min-width: 0;
}
.today-card-glyph {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 7px;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.22);
}
.today-card-title {
  font-size: 15.5px;
  font-weight: 700;
  color: #eaf2fb;
  margin: 0;
  letter-spacing: -0.005em;
}
.today-card-body {
  padding: 2px 16px 14px;
  display: grid;
  gap: 10px;
  flex: 1;
  align-content: start;
}
.today-card-footer {
  padding: 9px 16px 12px;
  border-top: 1px solid rgba(56, 189, 248, 0.10);
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.today-link-btn {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.today-link-btn:hover {
  color: #a9e4ff;
  text-decoration: underline;
}
.today-link-btn:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
.today-card-menu {
  background: none;
  border: 1px solid transparent;
  color: #64748b;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  border-radius: 7px;
  padding: 3px 7px;
}
.today-card-menu:hover { color: #cbd5e1; background: rgba(56, 189, 248, 0.10); }
.today-card-menu:focus-visible { outline: 2px solid #38bdf8; outline-offset: 1px; }
.today-ico { flex: 0 0 auto; display: inline-block; vertical-align: -0.14em; }
.today-card-title-group .today-ico,
.today-rec-meta .today-ico { color: #5cc8f0; }

/* Badges & Pills */
.today-pill {
  border-radius: 9999px;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.today-pill-track {
  background: rgba(56, 189, 248, 0.08);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.22);
}
.today-pill-tag {
  background: rgba(7, 26, 46, 0.9);
  color: #b6c8dc;
  border: 1px solid rgba(96, 141, 178, 0.34);
  font-size: 12px;
  font-weight: 500;
  padding: 6px 13px;
  border-radius: 9px;
  gap: 8px;
}
.today-pill-tag .today-pill-glyph { color: #7dd3fc; font-size: 12px; }
.today-badge {
  border-radius: 8px;
  padding: 4px 11px;
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.today-badge-ok {
  background: rgba(52, 211, 153, 0.14);
  color: #4ade9d;
  border: 1px solid rgba(52, 211, 153, 0.34);
}
.today-badge-warning {
  background: rgba(251, 191, 36, 0.14);
  color: #fbc64a;
  border: 1px solid rgba(251, 191, 36, 0.36);
}
.today-badge-danger {
  background: rgba(248, 113, 113, 0.16);
  color: #fb8b8b;
  border: 1px solid rgba(248, 113, 113, 0.38);
}
.today-badge-info {
  background: rgba(192, 132, 252, 0.15);
  color: #cfa6fd;
  border: 1px solid rgba(192, 132, 252, 0.34);
}
.today-badge-count {
  background: #ef4444;
  color: #fff;
  border: 1px solid #f87171;
  font-size: 11px;
  min-width: 22px;
  justify-content: center;
  padding: 2px 7px;
}

/* Session hero */
.today-session-card {
  border-color: rgba(56, 189, 248, 0.34);
  background: linear-gradient(180deg, rgba(11, 32, 56, 0.95) 0%, rgba(6, 19, 34, 0.97) 100%);
}
.today-session-grid {
  display: grid;
  /* Hero panes keep physical order — the visual panel sits at the start edge exactly
     as the reference places it, in both languages. */
  direction: ltr;
  grid-template-columns: minmax(232px, .76fr) minmax(0, 1.32fr);
  grid-template-areas: "visual content";
  gap: 18px;
  min-width: 0;
  padding-top: 4px;
}
.today-session-content {
  grid-area: content;
  display: grid;
  /* text column + anchored action column, as the reference composes the hero */
  grid-template-columns: minmax(0, 1fr) auto;
  align-content: start;
  align-items: start;
  gap: 10px 18px;
  min-width: 0;
}
.today-session-text { display: grid; gap: 8px; align-content: start; min-width: 0; }
.today-session-actions { align-self: center; margin-top: 0; }
.today-crumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #5cc8f0;
  font-weight: 600;
}
.today-crumbs .today-crumb-sep { color: #3f7fa3; font-weight: 400; }
.today-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.today-session-visual { grid-area:visual; position:relative; min-height:196px; border:1px solid rgba(56,189,248,.26); border-radius:12px; overflow:hidden; background:radial-gradient(circle at 82% 18%,rgba(34,211,238,.16),transparent 30%),linear-gradient(145deg,#082238,#04121f); direction:ltr; }
.today-session-visual-window { position:absolute; inset:26px 30px 46px 22px; border:1px solid rgba(125,211,252,.34); border-radius:9px; background:#04131f; box-shadow:16px 16px 0 -9px rgba(14,165,233,.12); }
.today-session-visual-window::before { content:"●  ●  ●"; display:block; height:24px; padding:6px 10px; color:#5f7691; border-bottom:1px solid rgba(125,211,252,.16); font-size:8px; letter-spacing:4px; }
.today-session-visual-code { margin:0; padding:16px 14px; color:#a5f3fc; font:11.5px/1.75 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre-wrap; }
.today-session-visual-db { position:absolute; left:20px; bottom:26px; width:52px; height:30px; border:1px solid #38bdf8; border-radius:50%; background:#0a2a42; box-shadow:0 7px 0 #071f33,0 8px 0 #38bdf8,0 14px 0 #071b2c,0 15px 0 rgba(56,189,248,.75); }
.today-session-visual-progress { position:absolute; left:88px; right:24px; bottom:18px; height:6px; border-radius:99px; background:#0e3049; overflow:hidden; }
.today-session-visual-progress::after { content:""; display:block; width:58%; height:100%; background:linear-gradient(90deg,#0ea5e9,#22d3ee); }
.today-session-title {
  font-size: clamp(18px, 1.6vw, 22px);
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.today-position-line {
  font-size: 14.5px;
  font-weight: 700;
  color: #4fc3f0;
  line-height: 1.45;
}
.today-code-box {
  margin: 4px 0;
  background: #010c18;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
  color: #38bdf8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.45;
  white-space: pre;
  overflow-x: auto;
}
.today-session-meta-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #9db2c9;
  background: rgba(7, 26, 46, 0.66);
  border: 1px solid rgba(56, 189, 248, 0.14);
  border-radius: 8px;
  padding: 5px 11px;
  width: fit-content;
  max-width: 100%;
}
.today-meta-item { display: inline-flex; gap: 5px; align-items: baseline; }
.today-meta-label { color: #7f96ae; }
.today-meta-val { color: #dbe7f4; font-weight: 600; }
.today-session-summary {
  margin: 0;
  color: #93a9c1;
  font-size: 13.5px;
  line-height: 1.6;
}
.today-tags-row {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

/* Actions */
.today-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
  align-items: center;
  justify-content: flex-end;
}
.today-actions[data-stack="column"] {
  flex-direction: column;
  align-items: flex-end;
  margin-top: 2px;
}
.today-actions[data-stack="column"] .today-action { white-space: nowrap; }
.today-action {
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  line-height: 1.3;
}
.today-action:active { transform: translateY(1px); }
.today-action:focus-visible { outline: 2px solid #7dd3fc; outline-offset: 2px; }
.today-action-primary {
  background: linear-gradient(135deg, #16b4ec 0%, #0cc0e4 100%);
  color: #03243a;
  border: 1px solid rgba(125, 211, 252, 0.55);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.28);
}
.today-action-primary:hover {
  background: linear-gradient(135deg, #3cc8f5 0%, #2ad4ee 100%);
}
.today-action-secondary {
  background: rgba(9, 30, 51, 0.72);
  color: #a7d8f0;
  border: 1px solid rgba(56, 189, 248, 0.34);
}
.today-action-secondary:hover {
  background: rgba(14, 165, 233, 0.16);
  border-color: #38bdf8;
  color: #d8f2ff;
}
.today-action-sm {
  padding: 6px 14px;
  font-size: 12.5px;
  background: rgba(14, 165, 233, 0.12);
  color: #a9e4ff;
  border: 1px solid rgba(56, 189, 248, 0.38);
}
.today-action-sm:hover { background: rgba(14, 165, 233, 0.22); }
.today-action:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  box-shadow: none;
}
.today-action:disabled:hover { background: linear-gradient(135deg, #16b4ec 0%, #0cc0e4 100%); }
.today-action-secondary:disabled:hover { background: rgba(9, 30, 51, 0.72); }

/* Next action & Why now */
.today-recommendation-card .today-card-body { gap: 12px; padding-top: 4px; }
.today-recommendation-card .today-actions { justify-content: flex-start; }
.today-recommendation-title {
  font-size: clamp(17px, 1.5vw, 21px);
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.today-rec-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #a8bdd4;
  padding-bottom: 2px;
}
.today-rec-meta-item { display: inline-flex; align-items: center; gap: 6px; }
.today-rec-meta-item .today-rec-meta-glyph { color: #5cc8f0; font-size: 13px; line-height: 1; }
.today-recommendation-summary, .today-why-summary {
  margin: 0;
  color: #93a9c1;
  font-size: 13.5px;
  line-height: 1.6;
}
.today-unlock-note {
  font-size: 12.5px;
  color: #8fd9f7;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border: 1px solid rgba(56, 189, 248, 0.28);
  background: rgba(11, 44, 71, 0.55);
  border-radius: 10px;
  padding: 9px 13px;
}
.today-unlock-note .today-unlock-label { font-weight: 700; color: #4fc3f0; font-size: 12px; }
.today-unlock-note .today-unlock-value { display: inline-flex; align-items: center; gap: 8px; color: #dbeaf6; font-size: 13.5px; }
.today-rationale-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.today-rationale-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: #cbd5e1;
  font-size: 13.5px;
  line-height: 1.5;
}
.today-rationale-icon {
  flex: 0 0 auto;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  margin-top: 1px;
}
.today-rationale-ok .today-rationale-icon {
  color: #052e22;
  background: #34d399;
}
.today-rationale-clock .today-rationale-icon {
  color: #05243a;
  background: #38bdf8;
}
.today-rationale-note { color: #93a9c1; font-size: 12.5px; }
.today-rationale-note .today-rationale-icon {
  color: #0b1725;
  background: #7f96ae;
  font-style: italic;
  font-size: 11px;
}
.today-why-connector {
  display: none;
}

/* Recent Context Rows — single-line rhythm, three aligned columns */
.today-list { display: grid; gap: 0; }
.today-recent-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1.34fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 2px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.09);
}
.today-recent-status {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: #5cc8f0;
}
.today-recent-status[data-tone="ok"] { color: #4ade9d; }
.today-recent-status[data-tone="warning"] { color: #fbc64a; }
.today-recent-status[data-tone="muted"] { color: #b6c8dc; }
.today-recent-row:first-child { padding-top: 4px; }
.today-recent-row:last-child { border-bottom: none; padding-bottom: 4px; }
.today-recent-meta {
  font-size: 12.5px;
  color: #7f96ae;
  display: contents;
}
.today-recent-domain {
  color: #9fb6cd;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.today-recent-domain .today-recent-glyph {
  color: #5cc8f0;
  font-size: 13px;
  line-height: 1;
  flex: 0 0 auto;
}
.today-recent-time {
  color: #7f96ae;
  font-size: 12.5px;
  white-space: nowrap;
  text-align: end;
}
.today-recent-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #e6eef7;
  min-width: 0;
  overflow-wrap: anywhere;
}

/* Progress — bordered chip rows, glyph at the start edge, value anchored at the end */
.today-progress-list { display: grid; gap: 8px; direction: ltr; }
.today-progress-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border: 1px solid rgba(96, 141, 178, 0.30);
  border-radius: 10px;
  background: rgba(6, 20, 36, 0.66);
}
.today-progress-glyph {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  font-size: 13px;
  line-height: 1;
  border-radius: 6px;
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.12);
}
.today-progress-glyph[data-tone="ok"] { color: #4ade9d; background: rgba(52, 211, 153, 0.14); }
.today-progress-glyph[data-tone="warning"] { color: #fbc64a; background: rgba(251, 191, 36, 0.14); }
.today-progress-glyph[data-tone="info"] { color: #cfa6fd; background: rgba(192, 132, 252, 0.14); }
.today-progress-title { color: #cbd5e1; font-size: 13.5px; min-width: 0; overflow-wrap: anywhere; }
.today-progress-val {
  color: #f8fafc;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}
.today-progress-info { display: contents; }
.today-progress-bar, .today-progress-fill { display: none; }
.today-progress-count-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border: 1px solid rgba(96, 141, 178, 0.30);
  border-radius: 10px;
  background: rgba(6, 20, 36, 0.66);
}
.today-progress-icon { color: #7dd3fc; font-size: 13px; }

/* Attention rail — the surface's second focal point */
.today-attention-side .today-card-head {
  background: rgba(9, 30, 52, 0.72);
  border-bottom: 1px solid rgba(56, 189, 248, 0.14);
  padding: 12px 15px;
}
.today-attention-body { display: grid; gap: 10px; padding-top: 11px; }
.today-attention-item {
  border: 1px solid rgba(96, 141, 178, 0.34);
  border-radius: 12px;
  background: rgba(7, 22, 39, 0.78);
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "icon head"
    "icon title"
    "icon foot";
  gap: 4px 12px;
  align-items: start;
}
.today-attention-item:hover { border-color: rgba(56, 189, 248, 0.38); }
.today-attention-item-head {
  grid-area: head;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.today-attention-domain {
  font-size: 11.5px;
  color: #8fd9f7;
  font-weight: 500;
  text-align: start;
  min-width: 0;
}
.today-attention-item-title {
  grid-area: title;
  display: grid;
  gap: 2px;
  min-width: 0;
}
.today-attention-status {
  font-size: 13px;
  font-weight: 700;
  color: #dbe7f4;
  overflow-wrap: anywhere;
}
.today-attention-id {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.today-attention-item-foot {
  grid-area: foot;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.today-attention-item-summary {
  margin: 0;
  font-size: 12.5px;
  color: #93a9c1;
  line-height: 1.5;
  min-width: 0;
}
.today-attention-item-actions {
  display: flex;
  flex: 0 0 auto;
}
.today-attention-icon {
  grid-area: icon;
  align-self: start;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
  border: 1px solid rgba(251, 191, 36, 0.34);
  background: rgba(251, 191, 36, 0.12);
  color: #fbc64a;
}
.today-attention-icon[data-tone="danger"] { border-color: rgba(248, 113, 113, 0.38); background: rgba(248, 113, 113, 0.13); color: #fb8b8b; }
.today-attention-icon[data-tone="info"] { border-color: rgba(192, 132, 252, 0.36); background: rgba(192, 132, 252, 0.13); color: #cfa6fd; }
.today-attention-icon[data-tone="ok"] { border-color: rgba(52, 211, 153, 0.36); background: rgba(52, 211, 153, 0.13); color: #4ade9d; }
.today-attention-icon[data-tone="muted"] { border-color: rgba(148, 163, 184, 0.30); background: rgba(148, 163, 184, 0.10); color: #a9bcd1; }

.today-empty {
  padding: 22px 14px;
  color: #7f96ae;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  border: 1px dashed rgba(96, 141, 178, 0.34);
  border-radius: 10px;
  background: rgba(6, 20, 36, 0.5);
}
.today-source {
  font-size: 11px;
  color: #6d84a0;
  margin-top: 2px;
  padding-top: 7px;
  border-top: 1px dashed rgba(96, 141, 178, 0.24);
}
.today-source, .today-provider-row { min-width:0; overflow-wrap:anywhere; }
.today-source bdi, .today-rationale-list bdi {
  white-space: normal;
}

.today-provider-truth { display:flex; flex-wrap:wrap; gap:6px 14px; border:1px solid rgba(96,141,178,.26); border-radius:10px; padding:8px 12px; background:rgba(3,12,24,.6); width: calc((100% - 14px) * 1.85 / 2.8); max-width:100%; }
.today-provider-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:11px; color:#8ba3bd; }
.today-provider-row strong { color:#c9d8e8; font-weight:600; }
.today-provider-row[data-state="UNAVAILABLE"], .today-provider-row[data-state="ERROR"] { color:#fca5a5; }
.today-provider-row[data-state="STALE"] { color:#fcd34d; }
.today-provider-row[data-state="AVAILABLE_DATA"] { color:#6ee7b7; }
.today-provider-retained { color:#fbbf24; font-size:11px; }

/* Linked next-action → why-now connector (wide layouts only) */
.today-grid-2[data-linked] { gap: 26px; }
.today-why-card { position: relative; overflow: visible; }
.today-why-connector { display: none; }
@media (min-width: 901px) {
  .today-why-connector {
    display: block;
    position: absolute;
    inset-inline-start: -25px;
    top: 44%;
    width: 24px;
    height: 22px;
    margin-top: -11px;
    pointer-events: none;
    color: #4aa8cc;
    font-size: 15px;
    line-height: 22px;
    text-align: center;
    z-index: 2;
  }
  .today-why-connector::after { content: "→"; }
}
@media (max-width: 900px) {
  .today-layout {
    grid-template-columns: 1fr;
    grid-template-areas:"main" "attention";
  }
  .today-head,
  .today-scopebar,
  .today-provider-truth { width: 100%; }
  .today-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
  .today-attention-side {
    order: 2;
  }
}
@media (max-width: 1080px) {
  .today-session-grid { grid-template-columns:minmax(190px,.68fr) minmax(0,1.35fr); }
  .today-session-visual { min-height:182px; }
}
@media (max-width: 860px) {
  .today-grid-2,
  .today-grid-2[data-split="wide-first"] { grid-template-columns: 1fr; }
  .today-session-content { grid-template-columns: minmax(0, 1fr); }
  .today-session-actions { align-self: start; }
  .today-why-connector { display: none !important; }
  .today-grid-2[data-linked] { gap: 14px; }
}
@media (max-width: 768px) {
  .today-orchestration {
    padding: 12px;
    gap: 12px;
  }
  .today-grid-2 {
    grid-template-columns: 1fr;
  }
  .today-session-grid { grid-template-columns:1fr; grid-template-areas:"visual" "content"; }
  .today-session-visual { min-height:165px; }
  .today-head {
    align-items: flex-start;
    flex-direction: column;
  }
  .today-head-controls {
    align-items: flex-start;
    justify-content: flex-start;
  }
  .today-recent-row {
    grid-template-columns: auto minmax(0, 1.34fr) minmax(0, 1fr) auto;
    gap: 8px;
    padding: 8px 0;
  }
  .today-recent-title,
  .today-recent-domain { font-size: 12.5px; }
}
@media (max-width: 520px) {
  .today-attention-item {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "head" "title" "foot";
  }
  .today-attention-icon { display: none; }
  .today-actions[data-stack="column"] { flex-direction: column; }
  .today-day-context { max-width: 100%; }
}
</style>`;

const empty = text => `<div class="today-empty">${esc(text)}</div>`;
/* Line-icon kit — one stroke weight, one optical size. Direction-safe (no directional glyphs). */
const ICONS = Object.freeze({
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/>',
  history: '<path d="M3.2 12a8.8 8.8 0 1 0 2.7-6.3L3 8.4"/><path d="M3 3.4v5h5"/><path d="M12 7.6V12l3.6 2.1"/>',
  link: '<path d="M10.2 13.4a4.6 4.6 0 0 0 6.9.5l2.8-2.8a4.6 4.6 0 0 0-6.5-6.5l-1.6 1.6"/><path d="M13.8 10.6a4.6 4.6 0 0 0-6.9-.5l-2.8 2.8a4.6 4.6 0 0 0 6.5 6.5l1.6-1.6"/>',
  target: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
  bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 6.4-2.6 7.6-2.6 7.6h17.2S18 15 18 8.6"/><path d="M13.7 19.6a2 2 0 0 1-3.4 0"/>',
  star: '<path d="M12 3.4l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.3l-5.4 2.9 1-6.1L3.2 9.8l6.1-.9z"/>',
  trend: '<path d="M3 17.2l6-6 4 4 7.4-7.4"/><path d="M14.6 7.8H21v6.4"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  flask: '<path d="M9.2 3h5.6"/><path d="M10.4 3v6L5.2 17.9A2 2 0 0 0 6.9 21h10.2a2 2 0 0 0 1.7-3.1L13.6 9V3"/><path d="M7.8 15h8.4"/>',
  shield: '<path d="M12 3.2l7.6 2.9v5.6c0 4.7-3.2 8-7.6 8.6-4.4-.6-7.6-3.9-7.6-8.6V6.1z"/><path d="M9.2 12.2l2 2 3.8-4"/>',
  alert: '<path d="M10.3 4.4 2.7 17.8A2 2 0 0 0 4.4 21h15.2a2 2 0 0 0 1.7-3.2L13.7 4.4a2 2 0 0 0-3.4 0z"/><path d="M12 9.6v4"/><path d="M12 17.2h.01"/>',
  play: '<circle cx="12" cy="12" r="8.6"/><path d="M10.2 8.6l5.4 3.4-5.4 3.4z"/>',
  eye: '<path d="M2.4 12S6 5.8 12 5.8 21.6 12 21.6 12 18 18.2 12 18.2 2.4 12 2.4 12z"/><circle cx="12" cy="12" r="2.6"/>',
  check: '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 12.4l2.5 2.5 4.7-5.2"/>',
  ban: '<circle cx="12" cy="12" r="8.6"/><path d="M5.9 5.9l12.2 12.2"/>',
  grid: '<rect x="7.4" y="7.4" width="9.2" height="9.2" rx="2"/><path d="M12 3.2v4.2M12 16.6v4.2M3.2 12h4.2M16.6 12h4.2"/>',
  branch: '<circle cx="6.6" cy="5.4" r="2.2"/><circle cx="6.6" cy="18.6" r="2.2"/><circle cx="17.4" cy="8.4" r="2.2"/><path d="M6.6 7.6v8.8"/><path d="M17.4 10.6c0 3.4-4.4 2.8-7 5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M4.5 4.5l1.9 1.9M17.6 17.6l1.9 1.9M2.8 12h2.6M18.6 12h2.6M4.5 19.5l1.9-1.9M17.6 6.4l1.9-1.9"/>',
  database: '<ellipse cx="12" cy="6.2" rx="7.6" ry="2.9"/><path d="M4.4 6.2v11.6c0 1.6 3.4 2.9 7.6 2.9s7.6-1.3 7.6-2.9V6.2"/><path d="M4.4 12c0 1.6 3.4 2.9 7.6 2.9s7.6-1.3 7.6-2.9"/>',
  calendar: '<rect x="3.4" y="5.4" width="17.2" height="15.2" rx="2.2"/><path d="M3.4 10.2h17.2M8.4 3.4v4M15.6 3.4v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20.4 20.4l-4.3-4.3"/>',
  upload: '<path d="M12 16.4V4.2"/><path d="M7.6 8.6 12 4.2l4.4 4.4"/><path d="M4.2 15.8v3.2a2 2 0 0 0 2 2h11.6a2 2 0 0 0 2-2v-3.2"/>',
  refresh: '<path d="M20.6 12a8.6 8.6 0 1 1-2.5-6.1"/><path d="M20.6 3.4v5.4h-5.4"/>',
  session: '<path d="M20.4 12a8.4 8.4 0 1 1-2.5-6"/><path d="M17.4 2.6v4h-4"/><circle cx="12" cy="12" r="2.4"/>',
  practice: '<path d="M6.6 3.6h10.8a2 2 0 0 1 2 2v14.8a2 2 0 0 1-2 2H6.6a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2z"/><path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4"/>',
  dot: '<circle cx="12" cy="12" r="3.2"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.4M12 19.2v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.4 12h2.4M19.2 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>'
});
const icon = (name, size = 14, cls = '') => `<svg class="today-ico${cls ? ` ${cls}` : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.dot}</svg>`;
const domainGlyph = name => ({book:'book',enterprise:'database',simulation:'flask',evidence:'file',identity:'upload',operations:'gear',system:'gear',quality:'search',research:'search',blocked:'ban',drill:'refresh',conflict:'branch',track:'trend',done:'check',seen:'eye',sealed:'shield',submitted:'upload',warned:'alert',file:'file',play:'play',alert:'alert',threat:'eye'}[name] || 'dot');
const sourceLine = (item, c) => {if(!item?.providerId)return '';const rec=item?.recommendation;const parts=[`${esc(c.source)} · ${bdi(item.providerId)}`];if(rec?.sourceRef)parts.push(bdi(rec.sourceRef));if(rec?.version)parts.push(`${esc(c.version)} ${bdi(rec.version)}`);if(item?.sourceObservedAt)parts.push(bdi(item.sourceObservedAt));if(item?.retainedStale)parts.push(esc(c.retained));return `<div class="today-source">${parts.join(' · ')}</div>`;};

export function renderTodayOrchestrationProjection({ host, projection, adapter = null, lang = null, onAction = null } = {}) {
  if (!host || !projection) throw Error('TODAY_PRESENTATION_HOST_AND_PROJECTION_REQUIRED');
  const l = lang || (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const primaryRecommendation = projection.items.find(item => item.kind === 'RECOMMENDATION');
  if (adapter?.selectRecommendation && primaryRecommendation?.recommendation?.version) {
    adapter.selectRecommendation(primaryRecommendation.id, primaryRecommendation.recommendation.version);
  }
  const vm = buildTodayOrchestrationViewModel(projection, { lang: l, adapter }), c = vm.copy;
  const resumeFor = item => item && adapter?.canResume ? adapter.canResume(item.id) : {enabled:false,reason:'Continuation resolver unavailable',code:'CONTINUATION_RESOLVER_UNBOUND'};
  const providerTruthHtml = (projection.sources||[]).map(source => `<div class="today-provider-row" data-state="${esc(source.state)}"><strong>${bdi(source.providerId)}</strong><span>${bdi(source.state)}</span>${source.observedAt?`<span>${bdi(source.observedAt)}</span>`:''}${source.reason?`<span>${esc(source.reason)}</span>`:''}${source.errorRef?`<span>${bdi(source.errorRef)}</span>`:''}</div>`).join('');
  const stateAbsence = projection.state === 'UNAVAILABLE' ? c.unavailable : projection.state === 'ERROR' ? c.failed : projection.state === 'FETCHING' ? c.fetching : c.empty;

  // Session continuation
  let sessionHtml = '';
  if (vm.continuation) {
    const cont = vm.continuation;
    const trackBadge = itemTrack(cont, l);
    const statusBadge = itemBadge(cont, l);
    const statusTone = itemBadgeTone(cont);
    const codeSnippet = cont.codeSnippet || '';
    const lastActivity = cont.lastActivity?.[l] || cont.lastActivity || '';
    const lastPosition = cont.lastPosition?.[l] || cont.lastPosition || '';
    const tags = Array.isArray(cont.pathTags) ? cont.pathTags : Array.isArray(cont.tags) ? cont.tags : [];
    const tagGlyphs = ['book', 'trend'];
    const tagsHtml = tags.map((t, index) => `<span class="today-pill today-pill-tag">${icon(tagGlyphs[index] || 'dot', 14, 'today-pill-glyph')}${esc(t?.[l] || t?.label?.[l] || t?.label || t)}</span>`).join('');
    const crumbParts = itemTrack(cont, l).split('•').map(part => part.trim()).filter(Boolean);
    const crumbHtml = crumbParts.map((part, index) => `${index ? `<span class="today-crumb-sep" aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>` : ''}<span>${esc(part)}</span>`).join('');

    sessionHtml = `
      <div class="today-card-body today-session-grid">
        <div class="today-session-content">
          <div class="today-session-text">
            ${crumbHtml ? `<div class="today-crumbs">${crumbHtml}</div>` : ''}
            <div class="today-title-row">
              <h3 class="today-session-title">${esc(itemTitle(cont, l))}</h3>
              ${statusBadge ? `<span class="today-badge today-badge-${statusTone}">${esc(statusBadge)}</span>` : ''}
            </div>
            ${lastActivity ? `<div class="today-session-meta-row"><span class="today-meta-item"><span class="today-meta-label">${l === 'ar' ? 'آخر نشاط:' : 'Last activity:'}</span> <span class="today-meta-val">${esc(lastActivity)}</span></span></div>` : ''}
            ${lastPosition ? `<div class="today-position-line">${esc(lastPosition)}</div>` : ''}
            <p class="today-session-summary">${esc(itemSummary(cont, l))}</p>
            ${tagsHtml ? `<div class="today-tags-row">${tagsHtml}</div>` : ''}
            ${sourceLine(cont, c)}
          </div>
          <div class="today-session-actions today-actions" data-stack="column">
            <button class="today-action today-action-primary" data-primary="true" data-today-action="resume" data-item-id="${esc(cont.id)}" ${vm.resumeAvailability.enabled ? '' : `disabled aria-disabled="true" title="${esc(vm.resumeAvailability.reason||vm.resumeAvailability.code||'Unavailable')}"`}>
              ${esc(c.resume)} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>
            </button>
            <button class="today-action today-action-secondary" data-today-action="resume" data-item-id="${esc(cont.id)}" ${vm.resumeAvailability.enabled ? '' : `disabled aria-disabled="true" title="${esc(vm.resumeAvailability.reason||vm.resumeAvailability.code||'Unavailable')}"`}>
              ${l === 'ar' ? 'عرض السياق' : 'View context'} ${icon('eye', 15)}
            </button>
          </div>
        </div>
        <div class="today-session-visual" aria-hidden="true">
          <div class="today-session-visual-window">${codeSnippet ? `<pre class="today-session-visual-code"><code>${esc(codeSnippet)}</code></pre>` : ''}</div>
          <span class="today-session-visual-db"></span><span class="today-session-visual-progress"></span>
        </div>
      </div>
    `;
  } else {
    sessionHtml = empty(projection.sourceTotalCount === 0 ? stateAbsence : c.noSession);
  }

  // Next recommendation
  let recommendationHtml = '';
  if (vm.recommendation) {
    const rec = vm.recommendation;
    const metaTags = Array.isArray(rec.metaTags) ? rec.metaTags : [];
    const recGlyphs = ['target', 'clock', 'link'];
    const metaTagsHtml = metaTags.map((tag, index) => `<span class="today-rec-meta-item">${icon(recGlyphs[index] || 'dot', 14, 'today-rec-meta-glyph')}<bdi dir="ltr">${esc(tag?.[l] || tag)}</bdi></span>`).join('');
    const recResume=resumeFor(rec);
    recommendationHtml = `
      <div class="today-card-body">
        ${metaTagsHtml ? `<div class="today-rec-meta">${metaTagsHtml}</div>` : ''}
        <h3 class="today-recommendation-title">${esc(itemTitle(rec, l))}</h3>
        <p class="today-recommendation-summary">${esc(itemSummary(rec, l))}</p>
        ${sourceLine(rec, c)}
        <div class="today-actions">
          <button class="today-action today-action-primary" data-primary="true" data-today-action="resume" data-item-id="${esc(rec.id)}" ${recResume.enabled ? '' : `disabled aria-disabled="true" title="${esc(recResume.reason||recResume.code||'Unavailable')}"`}>
            ${esc(itemActionLabel(rec, l) || c.startPractice)} ${icon('play', 15)}
          </button>
          <button class="today-action today-action-secondary" data-today-action="why" data-item-id="${esc(rec.id)}" data-recommendation-version="${esc(rec.recommendation?.version || '')}">
            ${esc(c.whyThis)} ${icon('target', 15)}
          </button>
        </div>
      </div>
    `;
  } else {
    recommendationHtml = empty(projection.sourceTotalCount === 0 ? stateAbsence : c.empty);
  }

  // Why now? rationale
  let whyHtml = '';
  if (vm.recommendation) {
    const rec = vm.recommendation;
    const checkItem = rec.rationaleCheck?.[l] || rec.rationaleCheck || '';
    const nextItem = rec.rationaleNext?.[l] || rec.rationaleNext || '';
    const unlockValue = rec.nextUnlock?.[l] || rec.nextUnlock || '';
    const whyEnabled = vm.whyAvailability.enabled;
    whyHtml = `
      <div class="today-card-body">
        <ul class="today-rationale-list">
          ${checkItem ? `<li class="today-rationale-item today-rationale-ok"><span class="today-rationale-icon" aria-hidden="true">${icon('check', 13)}</span><span>${esc(checkItem)}</span></li>` : ''}
          ${nextItem ? `<li class="today-rationale-item today-rationale-clock"><span class="today-rationale-icon" aria-hidden="true">${icon('clock', 13)}</span><span>${esc(nextItem)}</span></li>` : ''}
          ${!whyEnabled ? `<li class="today-rationale-item today-rationale-note"><span class="today-rationale-icon" aria-hidden="true">i</span><span>${esc(vm.whyAvailability.reason || c.noRationale)}</span></li>` : ''}
        </ul>
        ${unlockValue ? `<div class="today-unlock-note"><span class="today-unlock-label">${esc(c.unlockNext)}</span><span class="today-unlock-value">${icon('flask', 16)} ${esc(unlockValue)}</span></div>` : ''}
        ${whyEnabled ? `<div class="today-source">${esc(c.source)}: ${bdi(rec.recommendation?.sourceRef || '')} · ${esc(c.version)} ${bdi(rec.recommendation?.version || '')} · ${bdi(rec.recommendation?.observedAt || rec.sourceObservedAt || '')}</div>` : ''}
        <div class="today-actions">
          <button class="today-action today-action-secondary" data-today-action="why" data-item-id="${esc(rec.id)}" data-recommendation-version="${esc(rec.recommendation?.version || '')}" ${whyEnabled ? '' : `disabled aria-disabled="true" title="${esc(vm.whyAvailability.reason || vm.whyAvailability.code || 'Unavailable')}"`}>
            ${esc(c.showWhy)} ${icon('branch', 15)}
          </button>
        </div>
      </div>
    `;
  } else {
    whyHtml = empty(c.noRationale);
  }

  // Attention rail items — icon tile, priority, domain, title, summary, action
  const attention = vm.attention.length ? vm.attention.map(item => { const itemResume=resumeFor(item); const tone=itemBadgeTone(item); const priority=item?.priority?.[l] || item?.priority || ''; return `
    <article class="today-attention-item" data-attention-id="${esc(item.id)}">
      <div class="today-attention-item-head">
        <span class="today-attention-domain">${esc(itemTrack(item, l))}</span>
        ${priority ? `<span class="today-badge today-badge-${item?.priorityTone || tone}">${esc(priority)}</span>` : ''}
      </div>
      <div class="today-attention-item-title">
        ${itemBadge(item, l) ? `<span class="today-attention-status">${esc(itemBadge(item, l))}</span>` : ''}
        <h4 class="today-attention-id">${esc(itemTitle(item, l))}</h4>
      </div>
      <div class="today-attention-item-foot">
        <p class="today-attention-item-summary">${esc(itemSummary(item, l))}</p>
        <div class="today-attention-item-actions">
          <button class="today-action today-action-sm" data-today-action="resume" data-item-id="${esc(item.id)}" ${itemResume.enabled ? '' : `disabled aria-disabled="true" title="${esc(itemResume.reason||itemResume.code||'Unavailable')}"`}>
            ${esc(itemActionLabel(item, l) || c.open)} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>
          </button>
        </div>
      </div>
      <span class="today-attention-icon" data-tone="${esc(tone)}" aria-hidden="true">${icon(domainGlyph(item?.icon), 20)}</span>
    </article>
  `;}).join('') : empty(projection.sourceTotalCount === 0 ? stateAbsence : c.noAttention);

  // Recent context items — title · domain · time on one aligned line
  const recent = vm.recent.length ? vm.recent.map(item => `
    <div class="today-recent-row">
      <span class="today-recent-status" data-tone="${esc(item.statusIcon === 'done' || item.statusIcon === 'sealed' ? 'ok' : item.statusIcon === 'warned' ? 'warning' : 'muted')}" aria-hidden="true">${icon(domainGlyph(item.statusIcon), 15)}</span>
      <div class="today-recent-title">${esc(itemTitle(item, l))}</div>
      <div class="today-recent-meta">
        ${item.domainArea ? `<span class="today-recent-domain">${icon(domainGlyph(item.domainIcon), 14, 'today-recent-glyph')}<span>${esc(item.domainArea?.[l] || item.domainArea)}</span></span>` : '<span class="today-recent-domain"></span>'}
        <small class="today-recent-time">${esc(item.timeLabel?.[l] || item.timeLabel || item.sourceObservedAt || '')}</small>
      </div>
    </div>
  `).join('') : empty(projection.sourceTotalCount === 0 ? stateAbsence : c.noRecent);

  // Progress items — bordered chip rows with the value anchored at the end
  const progress = vm.progress.length ? vm.progress.map(item => {
    const value = item.value === undefined || item.value === null ? '' : String(item.value);
    const ratio = value.includes('/') ? value.split('/').map(part => part.trim()) : null;
    const glyphTone = item.icon === 'alert' ? 'warning' : item.icon === 'shield' ? 'ok' : item.icon === 'file' ? 'info' : '';
    const valueHtml = ratio
      ? `<span class="today-progress-val">${bdi(ratio[0])} <span style="opacity:.55;font-weight:600">/ ${bdi(ratio[1])}</span></span>`
      : (value ? `<span class="today-progress-val">${bdi(value)}</span>` : '');
    return `
      <div class="today-progress-row">
        <span class="today-progress-glyph" data-tone="${esc(glyphTone)}" aria-hidden="true">${icon(domainGlyph(item.icon), 14)}</span>
        <span class="today-progress-title">${esc(itemTitle(item, l))}</span>
        ${valueHtml}
      </div>
    `;
  }).join('') : empty(projection.sourceTotalCount === 0 ? stateAbsence : c.noProgress);

  const filterLabels = l === 'ar' ? {
    ALL: c.all,
    CONTINUE_SESSION: 'الجلسة',
    RECOMMENDATION: 'الموصى به',
    ATTENTION: 'الانتباه',
    RECENT_CONTEXT: 'السياق الأخير',
    PROGRESS: 'التقدم'
  } : {
    ALL: c.all,
    CONTINUE_SESSION: 'Session',
    RECOMMENDATION: 'Recommendation',
    ATTENTION: 'Attention',
    RECENT_CONTEXT: 'Recent context',
    PROGRESS: 'Progress'
  };

  const filters = ['ALL', 'CONTINUE_SESSION', 'RECOMMENDATION', 'ATTENTION', 'RECENT_CONTEXT', 'PROGRESS'].map(kind => `
    <button class="today-filter" data-today-action="filter" data-filter="${kind}" aria-pressed="${projection.filter === kind}">
      ${esc(filterLabels[kind])}
    </button>
  `).join('');

  const sessionCardHead = `
    <header class="today-card-head">
      <div class="today-card-title-group">
        <span class="today-card-glyph" aria-hidden="true">${icon('session', 14)}</span>
        <h2 class="today-card-title">${esc(c.continue)}</h2>
      </div>
      <button class="today-card-menu" type="button" data-today-action="refresh" title="${esc(c.refresh)}" aria-label="${esc(c.refresh)}">${icon('refresh', 15)}</button>
    </header>
  `;

  const cardHead = (glyphId, label) => `
    <header class="today-card-head">
      <div class="today-card-title-group">
        <span class="today-card-glyph" aria-hidden="true">${icon(glyphId, 14)}</span>
        <h2 class="today-card-title">${esc(label)}</h2>
      </div>
    </header>
  `;

  host.innerHTML = `
    ${style}
    <section class="today-orchestration m0-workbench" data-r6-workbench="" id="todayWorkbench" dir="${vm.dir}" data-owner="${vm.owner}" data-projection-state="${esc(projection.state)}" data-provider-truth="read-side" tabindex="0">
      <header class="today-head" id="todayHeader">
        <div class="today-head-main">
          <span class="today-glyph" aria-hidden="true">${icon('sun', 24)}</span>
          <div class="today-head-stack">
            <div class="today-eyebrow">${esc(c.title)} · ${esc(c.eyebrow)}</div>
            <div class="today-greeting-row">
              <h1 class="today-heading" id="todayHeading" tabindex="-1">
                ${esc(c.greeting)}
              </h1>
            </div>
            <p class="today-subtitle" id="todaySubtitle">
              ${esc(c.subtitle)}
            </p>
          </div>
        </div>
        <div class="today-head-controls">
          <div class="today-day-context" id="todayClock">${icon('calendar', 16)}<span class="today-day-lines"><span class="today-day-label">${esc(c.observed)}</span><span class="today-day-value">${esc(vm.dayContext)}</span></span></div>
        </div>
      </header>
      <div class="today-scopebar">
        <div class="today-filterbar" id="todayFilterBar" role="toolbar" aria-label="Today filters">
          ${filters}
          <button class="today-filter today-refresh-btn" id="todayRefreshBtn" data-today-action="refresh" title="${esc(c.refresh)}">
            ${icon('refresh', 12)} ${esc(c.refresh)}
          </button>
        </div>
        <div class="today-scope-readouts">
          <div class="today-clock" aria-label="Projection state">${icon('refresh', 12)} ${bdi(projection.state)}</div>
          ${vm.statusMessage ? `<div class="today-status" id="todayStatus" data-tone="${vm.statusTone}" role="status">${esc(vm.statusMessage)}</div>` : ''}
        </div>
      </div>
      <section class="today-provider-truth" id="todayProviderTruth" aria-label="Today provider truth">${providerTruthHtml || empty(c.unavailable)}${projection.retainedFromLastSuccess?`<div class="today-provider-retained">${l==='ar'?'تم الاحتفاظ بآخر إسقاط ناجح كسياق قديم بعد فشل التحديث.':'Last successful projection retained as stale context after refresh failure.'}</div>`:''}</section>

      <div class="today-layout">
        <div class="today-main">
          <article class="today-card today-session-card" id="todaySessionCard">
            ${sessionCardHead}
            ${sessionHtml}
          </article>

          <div class="today-grid-2" data-split="wide-first" data-linked>
            <article class="today-card today-recommendation-card" id="todayRecommendationCard">
              ${cardHead('star', c.next)}
              ${recommendationHtml}
            </article>

            <article class="today-card today-why-card" id="todayWhyCard">
              <span class="today-why-connector" aria-hidden="true"></span>
              ${cardHead('target', c.why)}
              ${whyHtml}
            </article>
          </div>

          <div class="today-grid-2" data-split="wide-first">
            <article class="today-card today-recent-card" id="todayRecentCard">
              ${cardHead('history', c.recent)}
              <div class="today-card-body today-list">
                ${recent}
              </div>
              <footer class="today-card-footer">
                <button class="today-link-btn" data-today-action="filter" data-filter="RECENT_CONTEXT">
                  ${esc(c.viewAll)} ${l === 'ar' ? 'كل السياق الأخير' : 'all recent context'} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>
                </button>
              </footer>
            </article>

            <article class="today-card today-progress-card" id="todayProgressCard">
              ${cardHead('trend', c.progress)}
              <div class="today-card-body today-progress-list">
                ${progress}
              </div>
              <footer class="today-card-footer">
                <button class="today-link-btn" data-today-action="filter" data-filter="PROGRESS">
                  ${esc(c.viewAll)} ${l === 'ar' ? 'توقع التقدم التفصيلي' : 'detailed progress projection'} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>
                </button>
              </footer>
            </article>
          </div>
        </div>

        <aside class="today-card today-attention-side" id="todayAttentionSidebar">
          <header class="today-card-head">
            <div class="today-card-title-group">
              <span class="today-card-glyph" aria-hidden="true">${icon('bell', 14)}</span>
              <h2 class="today-card-title">${esc(c.attention)}</h2>
              <span class="today-badge today-badge-count">${bdi(vm.attention.length)}</span>
            </div>
          </header>
          <div class="today-card-body today-attention-body">
            ${attention}
          </div>
          <footer class="today-card-footer">
            <button class="today-link-btn" data-today-action="filter" data-filter="ATTENTION">
              ${esc(c.viewAll)} ${l === 'ar' ? 'عناصر الانتباه' : 'attention items'} <span aria-hidden="true">${l === 'ar' ? '←' : '→'}</span>
            </button>
          </footer>
        </aside>
      </div>
    </section>
  `;

  host.querySelectorAll('[data-today-action]').forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return;
    const action = button.dataset.todayAction, itemId = button.dataset.itemId || '', version = button.dataset.recommendationVersion || '';
    if (action === 'why' && adapter?.selectRecommendation) adapter.selectRecommendation(itemId, version);
    onAction?.({ action, itemId, version, filter: button.dataset.filter || null, invoker: button });
  }));

  return Object.freeze({
    owner: vm.owner,
    state: projection.state,
    viewState: projection.viewState,
    sourceTotalCount: projection.sourceTotalCount,
    visibleCount: projection.visibleCount,
    canonicalWrites: false
  });
}
