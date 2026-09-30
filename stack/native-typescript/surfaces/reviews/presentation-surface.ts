/**
 * W04-REVIEWS · surface-specific PRESENTATION layer.
 *
 * SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION.
 * `surfaces/composition/w04-rescue.ts` (W04-EVIDENCE's seam) owns the shared block renderer,
 * the shared W04 stylesheet and the collection/context mechanics. This module owns ONLY what
 * the Reviews surface's own reference demands, and it is bound to `body[data-consumer=reviews]`
 * so it can never leak into Evidence, Mastery or Portfolio.
 *
 * WHAT IT DOES
 *  1. `REVIEWS_PRESENTATION_CSS` — the craft layer: one hairline metadata grid instead of six
 *     boxed cards, reference-weight section headings, the criterion chip / findings table split,
 *     status markers in the findings table, toolbar action hierarchy, and mid-token wrapping
 *     fixes for pinned identifiers.
 *  2. `installReviewsPresentation()` — idempotent DOM projection for two things the shared
 *     renderer cannot know: the REVIEW QUEUE sections (the shared constant carries Evidence
 *     intake vocabulary — `Submitted / Returned / Prepared / Admitted` — which is wrong on a
 *     Review surface) and the per-row state/decision attributes the scoped CSS colours. It also
 *     keeps the pane label and the surface-owned command labels on the active language.
 *
 * SPECIFICITY CONTRACT — every selector is prefixed `html body[data-consumer=reviews]`.
 * The shared W04 scope `body:is([data-consumer=evidence],…)` resolves to (0,1,1); the extra
 * `html` element takes each of these rules to (0,1,2), and the extra `html` in front of a shared
 * `#id` rule takes them to (1,1,2). Surface presentation therefore wins on specificity alone —
 * it never fights for <head> position with the shared style, so no re-append ping-pong exists.
 *
 * IDEMPOTENCE — every DOM write is keyed. The shared presenter rebuilds the record panel only
 * when its composition key changes and rebuilds the queue head only when its head key changes;
 * this module preserves both keys and re-applies only what those rebuilds removed.
 */
import {activeLocale, pickText, fill} from './i18n.js';
import {REVIEW_STATE_TONE, reviewStateLabel, reviewDecisionLabel} from './index.js';

const S = 'html body[data-consumer=reviews]';

/** Queue sections = the reference's left-pane navigation (Review Queue · Assigned · In Review ·
 *  Closed) plus the two governed workflow states the reference's track also carries. Each token
 *  is a real substring filter over the collection adapter's `searchableText`, so a section click
 *  filters the shared collection matrix — nothing here is decorative. */
const SEGMENTS = Object.freeze([
  Object.freeze({ token: '', key: 'segAll' }),
  Object.freeze({ token: 'REQUESTED', key: 'segRequested' }),
  Object.freeze({ token: 'ASSIGNED', key: 'segAssigned' }),
  Object.freeze({ token: 'IN_REVIEW', key: 'segInReview' }),
  Object.freeze({ token: 'READY_FOR_DECISION', key: 'segReady' }),
  Object.freeze({ token: 'CLOSED', key: 'segClosed' })
]);
/** `READY_FOR_DECISION` also contains no other token, but `ASSIGNED` must not be able to match
 *  a state that merely contains it — exact-state counting keeps the badge counts truthful. */
const STATE_OF = Object.freeze({
  REQUESTED: 'REQUESTED', ASSIGNED: 'ASSIGNED', IN_REVIEW: 'IN_REVIEW',
  READY_FOR_DECISION: 'READY_FOR_DECISION', CLOSED: 'CLOSED', CANCELLED: 'CANCELLED'
});

const REVIEW_COMMAND_LABELS = Object.freeze({
  'reviews.review': 'cmdReview',
  'reviews.finding': 'cmdFinding',
  'reviews.compare': 'cmdCompare',
  'reviews.supersede': 'cmdSupersede'
});

export const REVIEWS_PRESENTATION_CSS = `
/* ══════════════════════════════════════════════════════════════════════
 * REVIEWS · surface presentation (bound to body[data-consumer=reviews])
 * ══════════════════════════════════════════════════════════════════════ */

/* ── center studio strip: reclaim vertical space for the adjudication ── */
${S} #foundationStage[data-m0-composition=reviews]{padding:12px 16px 14px}
${S} .m0-studio-head{display:block;padding:7px 14px;border:1px solid var(--line);border-radius:11px;background:color-mix(in srgb,var(--panel,#0d1424) 92%,#ffffff 8%);margin:0 0 10px}
${S} .m0-studio-head>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px}
${S} .m0-studio-head h1{font-size:14px;line-height:1.3;margin:0;font-weight:700;color:var(--text)}
${S} .m0-studio-head .m0-eyebrow{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3,#7d879b);order:2}
${S} .m0-studio-head p{margin:0;font-size:11.5px;color:var(--text3,#7d879b);line-height:1.4;flex:1 1 320px;min-width:0}

/* ── record panel: header + body read as ONE panel, tighter to the fold ── */
${S} .w04-record-head{border:1px solid var(--line);border-start-start-radius:13px;border-start-end-radius:13px;background:linear-gradient(180deg,color-mix(in srgb,var(--accent,#38bdf8) 9%,transparent),transparent 72%),color-mix(in srgb,var(--panel,#0d1424) 94%,#ffffff 6%)}
${S} .w04-record-body{border:1px solid var(--line);border-block-start:0;border-end-start-radius:13px;border-end-end-radius:13px;padding:0 16px}
${S} .w04-rec-head{padding:11px 16px;gap:11px;align-items:center}
${S} .w04-rec-icon{width:34px;height:34px;border-radius:10px}
${S} .w04-rec-icon .w04-icon{width:19px;height:19px}
${S} .w04-rec-title{font-size:clamp(16px,1.25vw,18px)}
${S} .w04-rec-sub{font-size:11px}

/* ── section rhythm: hairline separation, ONE dominant heading weight ──
 * The shared layer paints every section heading teal, so six headings competed at one level.
 * Heading text takes the reading colour; the icon keeps the accent — hierarchy reads first. */
${S} .w04-record-body>.w04-block{padding:11px 0 13px;border-block-start:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
${S} .w04-record-body>.w04-block:first-child{border-block-start:0;padding-block-start:4px}
${S} .w04-record-body .w04-block h3{font-size:12.5px;font-weight:700;letter-spacing:.015em;color:var(--text);margin:0 0 8px;gap:8px}
${S} .w04-record-body .w04-block h3 .w04-block-icon{color:var(--accent,#38bdf8)}
${S} .w04-record-body .w04-block h3 .w04-block-icon .w04-icon{width:16px;height:16px}
${S} .w04-split .w04-block h3{color:var(--text)}

/* ── metadata grid: ONE hairline-divided fact block (reference), not six boxed cards ── */
${S} .w04-record-body .w04-grid{gap:1px;padding:0;grid-template-columns:repeat(3,minmax(0,1fr));
  border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:10px;overflow:hidden;
  background:color-mix(in srgb,var(--line) 78%,transparent)}
${S} .w04-record-body .w04-grid-cell{border:0;border-radius:0;padding:8px 12px;gap:2px;
  background:color-mix(in srgb,var(--panel,#0d1424) 96%,#ffffff 4%);min-width:0}
${S} .w04-grid-cell dt{font-size:10px;letter-spacing:.055em;text-transform:uppercase;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${S} .w04-grid-cell dd{margin:0;font-size:13.5px;font-weight:650;line-height:1.35;color:var(--text);
  overflow-wrap:normal;word-break:normal;unicode-bidi:isolate}
${S} .w04-grid-cell dd[dir=ltr]{font-family:var(--mono,ui-monospace,monospace);font-size:12.5px;letter-spacing:-.01em}

/* ── evidence claim: one sentence under its own heading, no nested box ── */
${S} .w04-record-body [data-w04-block=claim] .w04-prose,
${S} .w04-record-body [data-w04-block=rationale] .w04-prose{border:0;background:transparent;padding:0;margin:0}
${S} .w04-record-body [data-w04-block=claim] .w04-prose p{font-size:13.5px;line-height:1.55;color:var(--text);font-weight:500}
${S} .w04-record-body [data-w04-block=rationale] .w04-prose p{font-size:12.5px;line-height:1.62;color:var(--text2)}
${S} .w04-record-body [data-w04-block=claim] .state-token{border:0;background:transparent;padding:0;margin:0;color:var(--text3);font-size:12.5px}

/* ── criterion split: references 40 / findings 60, matching the reference's balance ── */
${S} .w04-split{grid-template-columns:minmax(232px,.78fr) minmax(0,1.22fr);gap:11px}
${S} .w04-split .w04-block{padding:11px 12px}
${S} .w04-cards{gap:7px}
${S} .w04-card{align-items:flex-start;padding:8px 10px;gap:10px}
${S} .w04-card-body{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 10px;align-items:center}
${S} .w04-card-body>strong{grid-column:1;grid-row:1;display:inline-flex;align-items:center;justify-content:center;
  min-width:30px;height:23px;padding:0 6px;border-radius:6px;font:700 11.5px/1 var(--mono,ui-monospace,monospace);
  color:var(--accent,#38bdf8);border:1px solid color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent);
  background:color-mix(in srgb,var(--accent,#38bdf8) 12%,transparent)}
${S} .w04-card-body>small{grid-column:2;grid-row:1;text-transform:none;letter-spacing:0;font-size:12.5px;
  font-weight:600;color:var(--text);font-family:var(--mono,ui-monospace,monospace)}
${S} .w04-card-body>p{grid-column:2;grid-row:2;margin:0;font-size:11.5px;color:var(--text3)}
${S} .w04-card.w04-tone-info>p{color:#7dd3fc}
${S} .w04-card-icon{width:26px;height:26px;order:2;align-self:center}

/* ── findings table: compact rows + a CSS-drawn outcome marker ── */
${S} .w04-record-body .w04-table-wrap{border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:10px}
${S} table.w04-record-table{min-width:0}
${S} table.w04-record-table th{font-size:10px;letter-spacing:.055em;text-transform:uppercase;padding:7px 10px;
  background:color-mix(in srgb,var(--panel,#0d1424) 92%,#ffffff 8%)}
${S} table.w04-record-table td{position:relative;padding:9px 34px 9px 10px;border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent);vertical-align:middle}
${S} table.w04-record-table td:last-child{padding-inline-end:10px;padding-inline-start:34px}
${S} table.w04-record-table tbody tr:last-child td{border-block-end:0}
${S} table.w04-record-table td strong{font-size:12.5px;font-weight:700;letter-spacing:-.005em}
${S} table.w04-record-table td:first-child strong{font-family:var(--mono,ui-monospace,monospace);font-size:12px}
${S} table.w04-record-table td small{font-size:10.5px;letter-spacing:.02em;margin-top:3px;overflow-wrap:anywhere}
${S} table.w04-record-table td.w04-text-success strong{color:#4ade80}
${S} table.w04-record-table td.w04-text-warning strong{color:#fbbf24}
${S} table.w04-record-table td.w04-text-danger strong{color:#f87171}
${S} table.w04-record-table td.w04-text-muted strong{color:var(--text3)}
${S} table.w04-record-table td[class^=w04-text-]::after{content:'';position:absolute;inset-inline-end:11px;top:50%;
  width:15px;height:15px;margin-top:-7.5px;border-radius:50%;
  border:1.5px solid color-mix(in srgb,currentColor 55%,transparent);background:color-mix(in srgb,currentColor 12%,transparent)}
${S} table.w04-record-table td.w04-text-success::before{content:'';position:absolute;inset-inline-end:15.5px;top:50%;
  width:4px;height:8px;margin-top:-6px;border:solid #4ade80;border-width:0 1.8px 1.8px 0;transform:rotate(42deg)}
${S} table.w04-record-table td.w04-text-warning::before{content:'';position:absolute;inset-inline-end:14.5px;top:50%;
  width:7px;height:1.8px;margin-top:-1px;border-radius:2px;background:#fbbf24}
${S} table.w04-record-table td.w04-text-danger::before{content:'';position:absolute;inset-inline-end:14.5px;top:50%;
  width:7px;height:1.8px;margin-top:-1px;border-radius:2px;background:#f87171;transform:rotate(-45deg);
  box-shadow:0 0 0 0 transparent}

/* ── decision preparation: the reference's dashed "not yet issued" callout ── */
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose.w04-dashed{
  border-width:1.5px;padding:12px 14px;gap:5px}
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose.w04-dashed>strong{
  display:flex;align-items:center;gap:9px;font-size:13.5px;letter-spacing:.005em}
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose.w04-dashed>strong::before{
  content:'';flex:0 0 auto;width:22px;height:22px;border-radius:50%;
  border:1.6px solid var(--w04-tone,var(--accent));
  background-color:color-mix(in srgb,var(--w04-tone,var(--accent)) 14%,transparent);
  background-image:linear-gradient(var(--w04-tone,var(--accent)),var(--w04-tone,var(--accent))),
                   linear-gradient(var(--w04-tone,var(--accent)),var(--w04-tone,var(--accent)));
  background-size:1.6px 6px,5px 1.6px;
  background-position:50% 26%,50% 50%;
  background-repeat:no-repeat}
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose>p{font-size:12.5px;line-height:1.55}
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose:not(.w04-dashed){gap:3px}
${S} .w04-record-body [data-w04-block=decision-preparation] .w04-prose:not(.w04-dashed)>strong{font-size:12.5px;color:#4ade80}

/* ── workflow rail closing the record: one line per step, two guidance lines ── */
${S} .w04-record-body .w04-track{gap:4px 8px;margin:0 0 9px}
${S} .w04-record-body .w04-track-step{flex:1 1 108px;padding:4px 8px;font-size:10.5px;gap:5px;border-radius:7px}
${S} .w04-record-body .w04-track-step+.w04-track-step::before{inset-inline-start:-8px}
${S} .w04-record-body .w04-next{gap:4px}
${S} .w04-record-body .w04-next-item{font-size:11.5px;line-height:1.45;padding:5px 9px 5px 22px}
${S} .w04-record-body .w04-next-item::before{top:5px}
${S} .w04-record-body .w04-next-item.w04-tone-neutral{font-size:11px}

/* ── LEFT · review queue: pane identity, section list, readable row states ── */
${S} #domainLeftRegion .w04-queue-head{margin:0 0 8px;padding:0 0 8px;border-block-end:1px solid var(--line)}
${S} .w04-segments{gap:3px}
${S} .w04-segment{padding:7px 10px;font-size:12.5px;gap:10px;border-radius:9px;border:1px solid transparent}
${S} .w04-segment>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${S} .w04-seg-count{min-width:22px;text-align:center;font-size:10.5px}
${S} .w04-segment[aria-pressed=true]{border-color:color-mix(in srgb,var(--accent,#38bdf8) 50%,transparent);
  background:color-mix(in srgb,var(--accent,#38bdf8) 14%,transparent);font-weight:700}
${S} #domainLeftRegion .m0-table th:first-child{width:auto}
${S} #domainLeftRegion .m0-table th:last-child{width:92px}
${S} #domainLeftRegion .m0-table td:last-child strong{white-space:normal;overflow-wrap:anywhere;font-size:11.5px;font-weight:650}
${S} #domainLeftRegion .m0-table td:last-child{padding-inline-start:6px}
${S} #domainLeftRegion .m0-table td:last-child small{font-family:var(--mono,ui-monospace,monospace);font-size:9.5px;
  letter-spacing:-.01em;opacity:.85}
${S} #domainLeftRegion .m0-table tr[data-reviews-state] td:last-child strong{color:var(--reviews-state-tone,var(--text))}
${S} #domainLeftRegion .m0-table tr[data-reviews-state=REQUESTED]{--reviews-state-tone:var(--text2)}
${S} #domainLeftRegion .m0-table tr[data-reviews-state=ASSIGNED],${S} #domainLeftRegion .m0-table tr[data-reviews-state=IN_REVIEW]{--reviews-state-tone:#7dd3fc}
${S} #domainLeftRegion .m0-table tr[data-reviews-state=READY_FOR_DECISION]{--reviews-state-tone:#fbbf24}
${S} #domainLeftRegion .m0-table tr[data-reviews-state=CLOSED]{--reviews-state-tone:#4ade80}
${S} #domainLeftRegion .m0-table tr[data-reviews-state=CANCELLED]{--reviews-state-tone:#f87171}
${S} #domainLeftRegion .m0-table tr[data-reviews-decision=issued] td:last-child small{color:#4ade80;opacity:1}
${S} #domainLeftRegion .m0-table td small bdi{unicode-bidi:isolate}
${S} .w04-queue-foot{margin-top:8px;padding-top:9px;gap:6px}
${S} .w04-queue-note{font-size:11px;line-height:1.4}
${S} .w04-settings-btn{padding:7px 10px;font-size:11.5px;border-radius:9px}

/* ── toolbar: primary · secondary · tertiary hierarchy (all-equal buttons read as a list) ── */
${S} #domainToolbar{gap:7px;flex-wrap:wrap;align-items:center}
${S} #domainToolbar .btn{font-size:12px;padding:6px 13px;border-radius:9px;border:1px solid var(--line);
  background:rgba(255,255,255,.035);color:var(--text2);white-space:nowrap;font-weight:600;
  transition:border-color .12s ease,color .12s ease,background .12s ease}
${S} #domainToolbar .btn:hover:not(:disabled){border-color:color-mix(in srgb,var(--accent,#38bdf8) 60%,transparent);color:var(--text);background:rgba(255,255,255,.07)}
${S} #domainToolbar .btn:focus-visible{outline:2px solid var(--focus,#38bdf8);outline-offset:2px}
${S} #domainToolbar .btn:disabled{opacity:.5;cursor:not-allowed;background:rgba(255,255,255,.015)}
${S} #domainToolbar [data-foundation-command="reviews.supersede"]:not(:disabled){
  background:color-mix(in srgb,var(--accent,#38bdf8) 26%,transparent);
  border-color:color-mix(in srgb,var(--accent,#38bdf8) 75%,transparent);
  color:var(--text);font-weight:700;box-shadow:0 2px 10px color-mix(in srgb,var(--accent,#38bdf8) 22%,transparent)}
${S} #domainToolbar [data-foundation-command="reviews.supersede"]:not(:disabled):hover{
  background:color-mix(in srgb,var(--accent,#38bdf8) 42%,transparent);border-color:var(--accent,#38bdf8)}
${S} #domainToolbar [data-foundation-command="reviews.review"]:not(:disabled){color:var(--accent,#38bdf8);
  border-color:color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent);font-weight:650}
${S} #domainToolbar [data-foundation-command="reviews.finding"]:not(:disabled),
${S} #domainToolbar [data-foundation-command="reviews.compare"]:not(:disabled){color:var(--text2)}
${S} .w04-overflow{margin-inline-start:4px}
${S} .w04-overflow-toggle::after{border-width:4px 4px 0}

/* ── RIGHT · context lens: reference card rhythm, gate chips read at a glance ── */
${S} #domainContext .m0-context-panel>.m0-eyebrow{font-size:9.5px;letter-spacing:.1em}
${S} #domainContext .m0-context-panel>h3{font-size:14.5px}
${S} #domainContext .m0-context-panel>.m0-context-summary{order:9}
${S} #domainContext .m0-semantic-group>h3{font-size:12.5px;color:var(--text);gap:8px}
${S} #domainContext .m0-semantic-group>h3 .w04-ctx-ico{color:var(--accent,#38bdf8)}
${S} #domainContext .m0-semantic-group>h4{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--text3);font-weight:700;margin:11px 0 3px;padding-block-end:4px;
  border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
${S} #domainContext .m0-semantic-group>h4:first-of-type{margin-block-start:6px}
${S} #domainContext .m0-semantic-list>div{gap:9px;padding:6px 0}
${S} #domainContext .m0-semantic-list dt{font-size:11px;font-weight:600;color:var(--text3)}
${S} #domainContext .m0-semantic-list dd{font-size:12px;line-height:1.45;color:var(--text2);overflow-wrap:anywhere}
${S} #domainContext .m0-semantic-list dd .w04-gate-mark{font-size:9px;padding:1px 5px;margin-inline-end:5px}
${S} #domainContext .m0-semantic-group:has(.w04-gate-mark){border-color:color-mix(in srgb,var(--accent,#38bdf8) 30%,var(--line))}

/* ── responsive composition: wide · standard · narrow · compact ── */
@media (max-width:1320px){
  ${S} .w04-record-body{padding:0 14px}
  ${S} .w04-grid-cell dt{font-size:9.5px}
}
@media (max-width:1140px){
  ${S} .w04-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${S} .w04-split{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:940px){
  ${S} #foundationStage[data-m0-composition=reviews]{padding:10px 12px 12px}
  ${S} .w04-record-body{padding:0 12px}
  ${S} .w04-record-body>.w04-block{padding:9px 0 11px}
  ${S} .w04-track-step{flex:1 1 calc(50% - 12px)}
}
@media (max-width:680px){
  ${S} .w04-grid{grid-template-columns:minmax(0,1fr)}
  ${S} .w04-card-body{grid-template-columns:auto minmax(0,1fr)}
  ${S} .w04-rec-title{font-size:16px}
  ${S} #domainToolbar .btn{font-size:11.5px;padding:5px 10px}
}
`;

/* ------------------------------------------------------------------ DOM projection */

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let installed = false;
let commandBus = null;
let lastLocale = null;

function ensureStyle() {
  if (typeof document === 'undefined') return;
  let style = document.getElementById('reviewsSurfacePresentationStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'reviewsSurfacePresentationStyle';
    style.textContent = REVIEWS_PRESENTATION_CSS;
    document.head.append(style);
  }
}

/** Sections are re-derived from the live domain on every pass: counts stay truthful and the
 *  labels follow the active language. `data-w04-key` on the shared head is left untouched so the
 *  shared presenter keeps treating its own render as current (no rebuild ping-pong). */
function projectQueue(surface) {
  const head = document.querySelector('#domainLeftRegion [data-w04-queue-head]');
  if (!head) return;
  const host = head.querySelector(':scope > .w04-segments');
  if (!host) return;
  const group = globalThis?.CEPFoundation?.m0Composition?.group;
  const domain = group?.[surface]?.domain;
  if (!domain) return;
  const t = pickText(activeLocale());
  const records = domain.records || [];
  const counts = { '': records.length };
  for (const seg of SEGMENTS) {
    if (!seg.token) continue;
    counts[seg.token] = records.filter(row => String(row?.state || '') === STATE_OF[seg.token]).length;
  }
  const key = `reviews-segments:${activeLocale()}:${records.length}:${JSON.stringify(counts)}`;
  if (host.getAttribute('data-reviews-segments') === key) return;
  host.setAttribute('data-reviews-segments', key);
  host.setAttribute('aria-label', t.queueAria);
  host.innerHTML = SEGMENTS.map(seg => {
    const pressed = (host.dataset.activeToken ?? '') === seg.token;
    return `<button type="button" class="w04-segment" data-reviews-segment="${esc(seg.token)}" aria-pressed="${pressed}">`
      + `<span dir="auto">${esc(t[seg.key])}</span>`
      + `<bdi class="w04-seg-count">${counts[seg.token] ?? 0}</bdi></button>`;
  }).join('');
  host.querySelectorAll('[data-reviews-segment]').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-reviews-segment') || '';
      if ((host.dataset.activeToken ?? '') === token) return;
      host.dataset.activeToken = token;
      const core = globalThis?.CEPFoundation?.m0Composition?.group?.[surface]?.collectionCore;
      try { core?.setFilter(token); } catch { return; }
      projectQueue(surface);
      try { globalThis?.CEPFoundation?.m0Composition?.mounted?.render?.(); } catch { /* presentation only */ }
    });
  });
}

/** Row state/decision attributes the scoped CSS colours. The shared presenter derives its own
 *  `data-w04-tone` from the EVIDENCE vocabulary, which is always `neutral` on a Review row —
 *  this is the surface's own attribute, written only when it actually differs. */
function projectRows(surface) {
  const group = globalThis?.CEPFoundation?.m0Composition?.group;
  const domain = group?.[surface]?.domain;
  if (!domain) return;
  document.querySelectorAll('#domainLeftRegion [data-r6-row]').forEach(node => {
    const id = node.getAttribute('data-r6-row');
    let row = null;
    try { row = domain.records.some(item => item.id === id) ? domain.inspect(id) : null; } catch { row = null; }
    if (!row) return;
    const state = String(row.state || '');
    if (node.dataset.reviewsState !== state) node.dataset.reviewsState = state;
    const issued = row.decision ? 'issued' : 'none';
    if (node.dataset.reviewsDecision !== issued) node.dataset.reviewsDecision = issued;
    const title = `${reviewStateLabel(row)} · ${reviewDecisionLabel(row)} · ${row.revisionId}`;
    if (node.getAttribute('title') !== title) node.setAttribute('title', title);
    if (REVIEW_STATE_TONE[state]) node.dataset.w04Tone = REVIEW_STATE_TONE[state];
  });
}

/** Pane identity + the surface-owned command labels follow the active language. */
function projectChrome(surface) {
  const t = pickText(activeLocale());
  const paneTitle = document.querySelector('#leftPane .phead h2');
  if (paneTitle && paneTitle.textContent !== t.queuePane) paneTitle.textContent = t.queuePane;
  const ctxTitle = document.querySelector('#rightPane .phead h2');
  if (ctxTitle && ctxTitle.textContent !== t.queueContextPane) ctxTitle.textContent = t.queueContextPane;

  const locale = activeLocale();
  if (commandBus && lastLocale !== locale) {
    lastLocale = locale;
    const write = map => {
      if (!map || typeof map.get !== 'function') return;
      for (const [id, key] of Object.entries(REVIEW_COMMAND_LABELS)) {
        const command = map.get(id);
        if (command && command.owner === globalThis?.CEPFoundation?.m0Composition?.group?.[surface]?.domain?.owner) {
          command.label = t[key];
        }
      }
    };
    try {
      write(commandBus.commands);
      write(globalThis?.CEPFoundation?.registry?.commands);
      globalThis?.CEPFoundation?.workspace?.refreshToolbar?.();
    } catch { /* registry unavailable — chrome stays on its registered label rather than lying */ }
  }
}

function run(surface = 'reviews') {
  if (typeof document === 'undefined') return;
  try {
    ensureStyle();
    projectChrome(surface);
    projectQueue(surface);
    projectRows(surface);
    delete document.body.dataset.reviewsPresentationError;
  } catch (error) {
    document.body.dataset.reviewsPresentationError = String(error?.message || error);
  }
}

let scheduled = false;
function schedule(surface) {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => { scheduled = false; run(surface); });
}

/**
 * Called once from `composeReviewsSurface`. Safe from Node: without a document it is a no-op,
 * so unit tests and descriptor projections keep running unchanged.
 */
export function installReviewsPresentation({ commandBus: bus = null } = {}) {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return null;
  if (bus) commandBus = bus;
  if (installed) { schedule('reviews'); return true; }
  installed = true;
  ensureStyle();
  const observer = new MutationObserver(() => schedule('reviews'));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  schedule('reviews');
  return true;
}

export default installReviewsPresentation;
