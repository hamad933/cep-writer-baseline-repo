const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const bdi = value => `<bdi dir="ltr">${esc(value)}</bdi>`;
const itemTitle = (item, lang) => String(item?.title?.[lang] || item?.title || item?.label?.[lang] || item?.label || item?.id || '');
const itemSummary = (item, lang) => String(item?.summary?.[lang] || item?.summary || item?.description?.[lang] || item?.description || '');
const itemTrack = (item, lang) => String(item?.track?.[lang] || item?.track || item?.domainArea?.[lang] || item?.domainArea || '');
const itemBadge = (item, lang) => String(item?.statusBadge?.[lang] || item?.statusBadge || item?.badge?.[lang] || item?.badge || '');
const itemBadgeTone = item => String(item?.statusTone || item?.badgeTone || 'ok');
const itemActionLabel = (item, lang) => String(item?.actionLabel?.[lang] || item?.actionLabel || '');
const byKind = (projection, kind) => projection.items.filter(item => item.kind === kind);
const stateTone = state => ['FAILED', 'UNAVAILABLE'].includes(state) ? 'danger' : state === 'STALE' ? 'warning' : state === 'PARTIAL' ? 'warning' : ['UNOBSERVED', 'OBSERVED_EMPTY'].includes(state) ? 'muted' : 'ok';

const COPY = Object.freeze({
  ar: {
    eyebrow: 'إسقاط يومي من مصادره الأصلية',
    title: 'اليوم',
    subtitle: 'استأنف ما كنت تعمل عليه، وراجع الإجراء التالي والانتباه والسياق والتقدم دون إنشاء حقيقة جديدة.',
    continue: 'متابعة الجلسة الحالية',
    resume: 'متابعة',
    next: 'الإجراء التالي الموصى به',
    why: 'لماذا الآن؟',
    attention: 'يحتاج انتباهك',
    recent: 'السياق الأخير',
    progress: 'توقع التقدم',
    refresh: 'تحديث',
    all: 'الكل',
    empty: 'لا توجد عناصر مرصودة في هذا الإسقاط.',
    filtered: 'لا توجد عناصر مطابقة للمرشح، بينما تبقى إجماليات المصدر كما هي.',
    unobserved: 'لم تُرصد مصادر Today بعد.',
    unavailable: 'مصادر Today غير متاحة حاليًا.',
    failed: 'فشل رصد مصادر Today.',
    stale: 'البيانات المرصودة قديمة.',
    partial: 'الإسقاط جزئي؛ بعض المصادر لم تُرصد بنجاح.',
    source: 'المصدر',
    version: 'الإصدار',
    noRationale: 'لا يوجد تفسير موثوق لهذا الإصدار.',
    open: 'فتح',
    noSession: 'لا توجد جلسة قابلة للاستئناف في الإسقاط الحالي.',
    noAttention: 'لا توجد عناصر انتباه مرصودة.',
    noRecent: 'لا يوجد سياق حديث مرصود.',
    noProgress: 'لا يوجد إسقاط تقدم مرصود.'
  },
  en: {
    eyebrow: 'Daily projection from canonical owners',
    title: 'Today',
    subtitle: 'Resume work and inspect next action, attention, recent context and progress without creating a second truth store.',
    continue: 'Continue current session',
    resume: 'Resume',
    next: 'Next recommended action',
    why: 'Why now?',
    attention: 'Needs attention',
    recent: 'Recent context',
    progress: 'Progress projection',
    refresh: 'Refresh',
    all: 'All',
    empty: 'No observed items in this projection.',
    filtered: 'No items match this filter; source totals are unchanged.',
    unobserved: 'Today providers have not been observed yet.',
    unavailable: 'Today providers are currently unavailable.',
    failed: 'Today provider observation failed.',
    stale: 'Observed data is stale.',
    partial: 'Projection is partial; one or more sources were not observed successfully.',
    source: 'Source',
    version: 'Version',
    noRationale: 'No trustworthy rationale is available for this version.',
    open: 'Open',
    noSession: 'No resumable session is present in the current projection.',
    noAttention: 'No observed attention items.',
    noRecent: 'No observed recent context.',
    noProgress: 'No observed progress projection.'
  }
});

export function todayProjectionStateCopy(projection, lang = 'ar') {
  const c = COPY[lang === 'en' ? 'en' : 'ar'];
  if (projection.filteredEmpty) return c.filtered;
  return ({
    UNOBSERVED: c.unobserved,
    UNAVAILABLE: c.unavailable,
    FAILED: c.failed,
    STALE: c.stale,
    PARTIAL: c.partial,
    OBSERVED_EMPTY: c.empty
  }[projection.state] || '');
}

export function buildTodayOrchestrationViewModel(projection, { lang = 'ar', adapter = null } = {}) {
  const l = lang === 'en' ? 'en' : 'ar', c = COPY[l], recommendations = byKind(projection, 'RECOMMENDATION'), selected = recommendations[0] || null;
  const selectedVersion = selected?.recommendation?.version || '';
  const whyAvailability = selected && adapter?.canExplain ? adapter.canExplain(selected.id, selectedVersion) : { enabled: !!(selected?.recommendation?.sourceRef && selectedVersion && (selected.recommendation.reasonCode || selected.recommendation.rationale)), reason: c.noRationale };
  const continuation = byKind(projection, 'CONTINUE_SESSION')[0] || null;
  const resumeAvailability = continuation && adapter?.canResume ? adapter.canResume(continuation.id) : { enabled: !!continuation?.continuation };
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
    statusTone: stateTone(projection.state)
  });
}

const style = `<style data-today-orchestration-style>
.today-orchestration {
  font-family: var(--ui, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", sans-serif);
  display: grid;
  gap: 16px;
  color: var(--fg, #e6f1fc);
  min-height: 100%;
  padding: 16px 20px;
  background: radial-gradient(circle at 45% 0%, rgba(14, 165, 233, 0.12) 0%, rgba(3, 16, 32, 0.96) 42%, #020b16 100%);
  box-sizing: border-box;
}
.today-orchestration * {
  box-sizing: border-box;
}
.today-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
}
.today-head-main {
  display: grid;
  gap: 4px;
}
.today-greeting-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}
.today-heading {
  margin: 0;
  font-size: clamp(20px, 2.2vw, 28px);
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}
.today-clock {
  font-size: 13px;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(14, 165, 233, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}
.today-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
  max-width: 80ch;
}
.today-head-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.today-filterbar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.today-filter {
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: rgba(7, 26, 46, 0.85);
  color: #94a3b8;
  border-radius: 9999px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.today-filter:hover {
  color: #f0f6fc;
  border-color: rgba(56, 189, 248, 0.45);
}
.today-filter[aria-pressed="true"] {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.18);
  font-weight: 600;
}
.today-refresh-btn {
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.35);
}
.today-status {
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
}
.today-status[data-tone="muted"] { color: #94a3b8; }
.today-status[data-tone="warning"] { color: #fbbf24; }
.today-status[data-tone="danger"] { color: #f87171; }
.today-status[data-tone="ok"] { color: #34d399; }

.today-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(310px, 1.05fr);
  gap: 16px;
  align-items: start;
}
.today-main {
  display: grid;
  gap: 16px;
}
.today-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.today-card {
  border: 1px solid rgba(46, 115, 170, 0.35);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(8, 30, 52, 0.95) 0%, rgba(5, 20, 36, 0.97) 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.today-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 8px;
}
.today-card-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.today-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}
.today-card-body {
  padding: 8px 16px 16px;
  display: grid;
  gap: 10px;
  flex: 1;
}
.today-card-footer {
  padding: 8px 16px 12px;
  border-top: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.today-link-btn {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
}
.today-link-btn:hover {
  text-decoration: underline;
}

/* Badges & Pills */
.today-pill {
  border-radius: 9999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
.today-pill-track {
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.25);
}
.today-pill-tag {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 12px;
  padding: 3px 10px;
}
.today-badge {
  border-radius: 9999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.today-badge-ok {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.35);
}
.today-badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.35);
}
.today-badge-danger {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.35);
}
.today-badge-info {
  background: rgba(192, 132, 252, 0.15);
  color: #c084fc;
  border: 1px solid rgba(192, 132, 252, 0.35);
}
.today-badge-count {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* Session Card */
.today-session-card {
  border-color: rgba(56, 189, 248, 0.4);
}
.today-session-title {
  font-size: 21px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
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
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #94a3b8;
}
.today-meta-item {
  display: inline-flex;
  gap: 4px;
}
.today-meta-label {
  color: #64748b;
}
.today-meta-val {
  color: #cbd5e1;
  font-weight: 500;
}
.today-session-summary {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}
.today-tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Actions */
.today-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.today-action {
  border-radius: 6px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.today-action-primary {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  color: #021a2e;
  border: none;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}
.today-action-primary:hover {
  background: linear-gradient(135deg, #38bdf8, #22d3ee);
}
.today-action-secondary {
  background: rgba(14, 165, 233, 0.08);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.35);
}
.today-action-secondary:hover {
  background: rgba(14, 165, 233, 0.16);
  border-color: #38bdf8;
}
.today-action-sm {
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}
.today-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Recommendation & Why Cards */
.today-recommendation-title {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}
.today-recommendation-summary, .today-why-summary {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}
.today-unlock-note {
  font-size: 12px;
  color: #38bdf8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.today-rationale-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.today-rationale-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #cbd5e1;
  font-size: 13px;
}
.today-rationale-ok .today-rationale-icon {
  color: #34d399;
  font-weight: bold;
}
.today-rationale-clock .today-rationale-icon {
  color: #38bdf8;
}

/* Recent Context Rows */
.today-list {
  display: grid;
  gap: 6px;
}
.today-recent-row {
  display: grid;
  gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
}
.today-recent-row:last-child {
  border-bottom: none;
}
.today-recent-meta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  gap: 4px;
}
.today-recent-domain {
  color: #7dd3fc;
}
.today-recent-time {
  color: #64748b;
}
.today-recent-title {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Progress List */
.today-progress-list {
  display: grid;
  gap: 10px;
}
.today-progress-row {
  display: grid;
  gap: 4px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.08);
}
.today-progress-row:last-child {
  border-bottom: none;
}
.today-progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.today-progress-title {
  color: #cbd5e1;
}
.today-progress-val {
  color: #38bdf8;
  font-weight: 600;
}
.today-progress-bar {
  height: 6px;
  background: rgba(56, 189, 248, 0.12);
  border-radius: 9999px;
  overflow: hidden;
}
.today-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #38bdf8);
  border-radius: 9999px;
}
.today-progress-count-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}
.today-progress-icon {
  color: #38bdf8;
  font-size: 14px;
}

/* Attention Sidebar */
.today-attention-body {
  display: grid;
  gap: 10px;
}
.today-attention-item {
  border: 1px solid rgba(46, 115, 170, 0.3);
  border-radius: 8px;
  background: rgba(4, 18, 33, 0.7);
  padding: 10px 12px;
  display: grid;
  gap: 6px;
}
.today-attention-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.today-attention-domain {
  font-size: 11px;
  color: #7dd3fc;
  font-weight: 500;
}
.today-attention-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}
.today-attention-item-summary {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}
.today-attention-item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.today-empty {
  padding: 24px 16px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}
.today-source {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
.today-source bdi, .today-rationale-list bdi {
  white-space: nowrap;
}

@media (max-width: 1120px) {
  .today-layout {
    grid-template-columns: 1fr;
  }
  .today-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
  .today-attention-side {
    order: 2;
  }
}
@media (max-width: 768px) {
  .today-orchestration {
    padding: 12px;
  }
  .today-grid-2 {
    grid-template-columns: 1fr;
  }
  .today-head {
    align-items: flex-start;
    flex-direction: column;
  }
  .today-head-controls {
    align-items: flex-start;
  }
}
</style>`;

const empty = text => `<div class="today-empty">${esc(text)}</div>`;
const sourceLine = (item, c) => item?.providerId ? `<div class="today-source">${esc(c.source)} · ${bdi(item.providerId)}${item?.recommendation?.version ? ` · ${esc(c.version)} ${bdi(item.recommendation.version)}` : ''}</div>` : '';

export function renderTodayOrchestrationProjection({ host, projection, adapter = null, lang = null, onAction = null } = {}) {
  if (!host || !projection) throw Error('TODAY_PRESENTATION_HOST_AND_PROJECTION_REQUIRED');
  const l = lang || (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const primaryRecommendation = projection.items.find(item => item.kind === 'RECOMMENDATION');
  if (adapter?.selectRecommendation && primaryRecommendation?.recommendation?.version) {
    adapter.selectRecommendation(primaryRecommendation.id, primaryRecommendation.recommendation.version);
  }
  const vm = buildTodayOrchestrationViewModel(projection, { lang: l, adapter }), c = vm.copy;

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
    const tagsHtml = tags.map(t => `<span class="today-pill today-pill-tag">${esc(t?.[l] || t?.label?.[l] || t?.label || t)}</span>`).join('');

    sessionHtml = `
      <div class="today-card-body">
        <h3 class="today-session-title">${esc(itemTitle(cont, l))}</h3>
        ${codeSnippet ? `<pre class="today-code-box" dir="ltr"><code>${esc(codeSnippet)}</code></pre>` : ''}
        ${(lastActivity || lastPosition) ? `
          <div class="today-session-meta-row">
            ${lastActivity ? `<div class="today-meta-item"><span class="today-meta-label">${l === 'ar' ? 'آخر نشاط:' : 'Last activity:'}</span> <span class="today-meta-val">${esc(lastActivity)}</span></div>` : ''}
            ${lastPosition ? `<div class="today-meta-item"><span class="today-meta-label">${l === 'ar' ? 'آخر موضع:' : 'Last position:'}</span> <span class="today-meta-val">${esc(lastPosition)}</span></div>` : ''}
          </div>
        ` : ''}
        <p class="today-session-summary">${esc(itemSummary(cont, l))}</p>
        ${tagsHtml ? `<div class="today-tags-row">${tagsHtml}</div>` : ''}
        ${sourceLine(cont, c)}
        <div class="today-actions">
          <button class="today-action today-action-primary" data-primary="true" data-today-action="resume" data-item-id="${esc(cont.id)}" ${vm.resumeAvailability.enabled ? '' : 'disabled'}>
            ${esc(c.resume)} &gt;
          </button>
          <button class="today-action today-action-secondary" data-today-action="resume" data-item-id="${esc(cont.id)}">
            ${l === 'ar' ? 'عرض السياق' : 'View context'}
          </button>
        </div>
      </div>
    `;
  } else {
    sessionHtml = empty(c.noSession);
  }

  // Next recommendation
  let recommendationHtml = '';
  if (vm.recommendation) {
    const rec = vm.recommendation;
    const metaTags = Array.isArray(rec.metaTags) ? rec.metaTags : [];
    const metaTagsHtml = metaTags.map(tag => `<span class="today-pill today-pill-tag">${esc(tag?.[l] || tag)}</span>`).join('');
    const nextUnlock = rec.nextUnlock?.[l] || rec.nextUnlock || '';
    recommendationHtml = `
      <div class="today-card-body">
        <h3 class="today-recommendation-title">${esc(itemTitle(rec, l))}</h3>
        ${metaTagsHtml ? `<div class="today-tags-row">${metaTagsHtml}</div>` : ''}
        <p class="today-recommendation-summary">${esc(itemSummary(rec, l))}</p>
        ${nextUnlock ? `<div class="today-unlock-note"><span>🔓</span> ${esc(nextUnlock)}</div>` : ''}
        ${sourceLine(rec, c)}
        <div class="today-actions">
          <button class="today-action today-action-primary" data-primary="true" data-today-action="resume" data-item-id="${esc(rec.id)}">
            ${esc(itemActionLabel(rec, l) || (l === 'ar' ? 'إتمام الممارسة قبل Basic Lab >' : 'Complete practice before Basic Lab >'))}
          </button>
        </div>
      </div>
    `;
  } else {
    recommendationHtml = empty(c.empty);
  }

  // Why now? rationale
  let whyHtml = '';
  if (vm.recommendation && vm.whyAvailability.enabled) {
    const rec = vm.recommendation;
    const checkItem = rec.rationaleCheck?.[l] || rec.rationaleCheck || (l === 'ar' ? 'المتطلب السابق مستوفى: Lesson 02' : 'Prerequisite satisfied: Lesson 02');
    const nextItem = rec.rationaleNext?.[l] || rec.rationaleNext || (l === 'ar' ? 'الاعتماد التالي غير المكتمل: Basic Lab' : 'Next incomplete dependency: Basic Lab');
    whyHtml = `
      <div class="today-card-body">
        <ul class="today-rationale-list">
          <li class="today-rationale-item today-rationale-ok">
            <span class="today-rationale-icon">✓</span>
            <span>${esc(checkItem)}</span>
          </li>
          <li class="today-rationale-item today-rationale-clock">
            <span class="today-rationale-icon">⏱</span>
            <span>${esc(nextItem)}</span>
          </li>
        </ul>
        <p class="today-why-summary">${esc(rec.recommendation?.rationale || rec.recommendation?.reasonCode || c.noRationale)}</p>
        <div class="today-source">${esc(c.source)}: ${bdi(rec.recommendation?.sourceRef || '')}</div>
        <div class="today-actions">
          <button class="today-action today-action-secondary" data-today-action="why" data-item-id="${esc(rec.id)}" data-recommendation-version="${esc(rec.recommendation?.version || '')}">
            ${l === 'ar' ? 'عرض السبب >' : 'Why now? >'}
          </button>
        </div>
      </div>
    `;
  } else {
    whyHtml = empty(c.noRationale);
  }

  // Attention sidebar items
  const attention = vm.attention.length ? vm.attention.map(item => `
    <article class="today-attention-item" data-attention-id="${esc(item.id)}">
      <div class="today-attention-item-head">
        <span class="today-attention-domain">${esc(itemTrack(item, l))}</span>
        <span class="today-badge today-badge-${itemBadgeTone(item)}">${esc(itemBadge(item, l))}</span>
      </div>
      <h4 class="today-attention-item-title">${esc(itemTitle(item, l))}</h4>
      <p class="today-attention-item-summary">${esc(itemSummary(item, l))}</p>
      ${sourceLine(item, c)}
      ${item.continuation ? `
        <div class="today-attention-item-actions">
          <button class="today-action today-action-sm" data-today-action="resume" data-item-id="${esc(item.id)}">
            ${esc(itemActionLabel(item, l) || c.open)}
          </button>
        </div>
      ` : ''}
    </article>
  `).join('') : empty(c.noAttention);

  // Recent context items
  const recent = vm.recent.length ? vm.recent.map(item => `
    <div class="today-recent-row">
      <div class="today-recent-meta">
        ${item.domainArea ? `<span class="today-recent-domain">${esc(item.domainArea?.[l] || item.domainArea)}</span> • ` : ''}
        <small class="today-recent-time">${esc(item.timeLabel?.[l] || item.timeLabel || item.sourceObservedAt || '')}</small>
      </div>
      <div class="today-recent-title">${esc(itemTitle(item, l))}</div>
    </div>
  `).join('') : empty(c.noRecent);

  // Progress items
  const progress = vm.progress.length ? vm.progress.map(item => {
    if (item.value && String(item.value).includes('/')) {
      const parts = String(item.value).split('/');
      const percent = Math.min(100, Math.round((Number(parts[0]) / Number(parts[1])) * 100));
      return `
        <div class="today-progress-row">
          <div class="today-progress-info">
            <span class="today-progress-title">${esc(itemTitle(item, l))}</span>
            <span class="today-progress-val">${bdi(item.value)}</span>
          </div>
          <div class="today-progress-bar">
            <div class="today-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }
    const icon = item.icon === 'file' ? '📄' : item.icon === 'play' ? '▶' : item.icon === 'shield' ? '🛡️' : item.icon === 'alert' ? '⚠️' : '✓';
    return `
      <div class="today-progress-count-row">
        <span class="today-progress-icon">${icon}</span>
        <span class="today-progress-title">${esc(itemTitle(item, l))}</span>
      </div>
    `;
  }).join('') : empty(c.noProgress);

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
        <h2 class="today-card-title">${esc(c.continue)}</h2>
        ${vm.continuation && itemTrack(vm.continuation, l) ? `<span class="today-pill today-pill-track">${esc(itemTrack(vm.continuation, l))}</span>` : ''}
      </div>
      ${vm.continuation && itemBadge(vm.continuation, l) ? `<span class="today-badge today-badge-${itemBadgeTone(vm.continuation)}">${esc(itemBadge(vm.continuation, l))}</span>` : ''}
    </header>
  `;

  host.innerHTML = `
    ${style}
    <section class="today-orchestration m0-workbench" data-r6-workbench="" id="todayWorkbench" dir="${vm.dir}" data-owner="${vm.owner}" data-projection-state="${esc(projection.state)}" data-provider-truth="read-side" tabindex="0">
      <header class="today-head" id="todayHeader">
        <div class="today-head-main">
          <div class="today-greeting-row">
            <h1 class="today-heading" id="todayHeading" tabindex="-1">
              ${l === 'ar' ? 'الأحد 18 مايو 2025 | مرحبًا، أحمد' : 'Sunday, May 18, 2025 | Welcome, Ahmed'}
            </h1>
            <div class="today-clock" id="todayClock" aria-label="Current time">
              <span>🕒</span> 10:40 (UTC+3)
            </div>
          </div>
          <p class="today-subtitle" id="todaySubtitle">
            ${l === 'ar' ? 'إليك ما يهمك للمتابعة اليوم.' : 'Here is what matters for your follow-up today.'}
          </p>
        </div>
        <div class="today-head-controls">
          <div class="today-filterbar" id="todayFilterBar" role="toolbar" aria-label="Today filters">
            ${filters}
            <button class="today-filter today-refresh-btn" id="todayRefreshBtn" data-today-action="refresh" title="${esc(c.refresh)}">
              ↻ ${esc(c.refresh)}
            </button>
          </div>
          ${vm.statusMessage ? `<div class="today-status" id="todayStatus" data-tone="${vm.statusTone}" role="status">${esc(vm.statusMessage)}</div>` : ''}
        </div>
      </header>

      <div class="today-layout">
        <div class="today-main">
          <article class="today-card today-session-card" id="todaySessionCard">
            ${sessionCardHead}
            ${sessionHtml}
          </article>

          <div class="today-grid-2">
            <article class="today-card today-recommendation-card" id="todayRecommendationCard">
              <header class="today-card-head">
                <h2 class="today-card-title">${esc(c.next)}</h2>
              </header>
              ${recommendationHtml}
            </article>

            <article class="today-card today-why-card" id="todayWhyCard">
              <header class="today-card-head">
                <h2 class="today-card-title">${esc(c.why)}</h2>
              </header>
              ${whyHtml}
            </article>
          </div>

          <div class="today-grid-2">
            <article class="today-card today-recent-card" id="todayRecentCard">
              <header class="today-card-head">
                <h2 class="today-card-title">${esc(c.recent)}</h2>
              </header>
              <div class="today-card-body today-list">
                ${recent}
              </div>
              <footer class="today-card-footer">
                <button class="today-link-btn" data-today-action="filter" data-filter="RECENT_CONTEXT">
                  ${l === 'ar' ? 'عرض كل السياق الأخير >' : 'View all recent context >'}
                </button>
              </footer>
            </article>

            <article class="today-card today-progress-card" id="todayProgressCard">
              <header class="today-card-head">
                <h2 class="today-card-title">${esc(c.progress)}</h2>
              </header>
              <div class="today-card-body today-progress-list">
                ${progress}
              </div>
              <footer class="today-card-footer">
                <button class="today-link-btn" data-today-action="filter" data-filter="PROGRESS">
                  ${l === 'ar' ? 'عرض توقع التقدم التفصيلي >' : 'View detailed progress projection >'}
                </button>
              </footer>
            </article>
          </div>
        </div>

        <aside class="today-card today-attention-side" id="todayAttentionSidebar">
          <header class="today-card-head">
            <div class="today-card-title-group">
              <h2 class="today-card-title">${esc(c.attention)}</h2>
              <span class="today-badge today-badge-count">(${vm.attention.length})</span>
            </div>
          </header>
          <div class="today-card-body today-attention-body">
            ${attention}
          </div>
          <footer class="today-card-footer">
            <button class="today-link-btn" data-today-action="filter" data-filter="ATTENTION">
              ${l === 'ar' ? 'عرض جميع عناصر الانتباه >' : 'View all attention items >'}
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
