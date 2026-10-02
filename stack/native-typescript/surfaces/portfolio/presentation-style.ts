/**
 * W04 Portfolio — surface-specific PRESENTATION stylesheet.
 *
 * Shared components own mechanics (collection matrix, context inspector, record renderer,
 * toolbar, shelf). This module owns the Portfolio's *inline presentation inside those shared
 * components* — governance §4.2 / shared-component-governance R1: composition, information
 * hierarchy, density, grouping, emphasis and visual language stay surface-local.
 *
 * Everything is scoped to this consumer ONLY (`body[data-consumer=portfolio]` for the panes,
 * `#foundationStage[data-m0-composition=portfolio]` for the centre) so no rule can leak into
 * evidence / reviews / mastery or any other surface, and every selector carries enough
 * specificity to win regardless of <head> order (the shared W04 style re-appends itself to the
 * end of <head> on every presentation run, so ORDER is not a reliable tie-break — specificity is).
 *
 * Geometry is logical (inline/block) — RTL and LTR mirror without any directional code.
 */

export const PORTFOLIO_PRESENTATION_CSS = `
/* ════════════════════════════════════════════════════════════════════
 * W04 PORTFOLIO PRESENTATION — reference 04_PORTFOLIO/Cybersecurity
 * Portfolio Evidence Dashboard.png. Composition authority: assembly
 * metrics, catalogue table, dossier split, integrity table, source-state
 * track, saved-view navigation. NO grouping structure (Q-5 open).
 * ════════════════════════════════════════════════════════════════════ */

/* ── CENTER · assembly metric strip: one dominant number per cell ── */
#foundationStage[data-m0-composition=portfolio] .w04-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#foundationStage[data-m0-composition=portfolio] .w04-grid-cell{padding:11px 12px 10px;border-radius:10px;background:color-mix(in srgb,var(--panel,#0d1424) 90%,#ffffff 10%)}
#foundationStage[data-m0-composition=portfolio] .w04-grid-cell dt{font-size:9.5px;font-weight:700;letter-spacing:.08em}
#foundationStage[data-m0-composition=portfolio] .w04-grid-cell dd{font-size:21px;font-weight:700;line-height:1.05;letter-spacing:-.02em;font-family:var(--mono,ui-monospace,monospace)}

/* ── CENTER · pending-authority bar: tight, high-contrast, never shrunk to a whisper ── */
#foundationStage[data-m0-composition=portfolio] .w04-notice{margin:0;padding:11px 13px}
#foundationStage[data-m0-composition=portfolio] .w04-notice strong{font-size:12.5px;letter-spacing:.015em}
#foundationStage[data-m0-composition=portfolio] .w04-notice p{font-size:12.5px;line-height:1.55;margin-top:4px}

/* ── CENTER · catalogue + integrity tables: readable rows, BIDI-correct column order ── */
#foundationStage[data-m0-composition=portfolio] .w04-table-wrap.w04-record-table-wrap{border-radius:11px}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table{direction:inherit;min-width:0;table-layout:auto}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table th{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:none;padding:10px 12px;border-block-end:1px solid var(--line);background:color-mix(in srgb,var(--panel,#0d1424) 94%,#ffffff 6%)}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td{padding:11px 12px;border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table tbody tr:last-child td{border-block-end:0}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table tbody tr{transition:background .1s ease}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table tbody tr:hover td{background:rgba(255,255,255,.03)}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td strong{display:block;font-size:13px;font-weight:600;line-height:1.4;color:var(--text);overflow-wrap:anywhere}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td small{display:block;margin-top:3px;font-size:11px;line-height:1.4;color:var(--text3);overflow-wrap:anywhere}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td:first-child small{font-family:var(--mono,ui-monospace,monospace);letter-spacing:.01em}
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td[dir=ltr] strong{unicode-bidi:isolate}
/* Technical tokens (RESOLVABLE, Evidence, UNGROUPED, false …) must never break mid-word:
 * "overflow-wrap:normal" makes the auto table layout grow the column to the token instead of
 * splitting it ("RESOLVA / BLE"). Long technical strings (the sha256 integrity envelope) are
 * declared "dir:auto" in presentation.ts and keep the wrap-anywhere behaviour above. */
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td strong[dir=ltr],
#foundationStage[data-m0-composition=portfolio] table.w04-record-table td small[dir=ltr]{overflow-wrap:normal}

/* ── CENTER · dossier split: label/value rows must breathe in a half-width column ── */
#foundationStage[data-m0-composition=portfolio] .w04-split{grid-template-columns:repeat(auto-fit,minmax(292px,1fr));gap:11px;align-items:stretch}
#foundationStage[data-m0-composition=portfolio] .w04-split .w04-rows>div{grid-template-columns:minmax(112px,.44fr) minmax(0,1fr);gap:10px;padding:7px 0}
#foundationStage[data-m0-composition=portfolio] .w04-split .w04-rows>div>dt{font-size:11.5px}
#foundationStage[data-m0-composition=portfolio] .w04-split .w04-rows>div>dd{font-size:12.5px}
#foundationStage[data-m0-composition=portfolio] .w04-split .w04-block h3{font-size:12.5px}

/* ── CENTER · claim cards (empty state): four ceilings read as one band ── */
#foundationStage[data-m0-composition=portfolio] .w04-cards{grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:9px}
#foundationStage[data-m0-composition=portfolio] .w04-card{align-items:flex-start;padding:10px 12px}
#foundationStage[data-m0-composition=portfolio] .w04-card-body strong{font-size:12.5px}

/* ── LEFT · the shared intake segments carry EVIDENCE vocabulary (Submitted / Returned /
 * Prepared / Admitted) with zero counts on Portfolio, and a filter token this domain never
 * matches. Surface-local presentation replaces them with real saved views (left-views.ts);
 * this rule hides the donor vocabulary instead of leaving dead controls on screen. ── */
body[data-consumer=portfolio] #domainLeftRegion [data-w04-queue-head]{display:none}

/* ── LEFT · saved / curated view navigation (reference: bookmark list) ── */
body[data-consumer=portfolio] #domainLeftRegion .pf-views{display:grid;gap:11px;margin:0 0 11px;padding:0 0 11px;border-block-end:1px solid var(--line)}
body[data-consumer=portfolio] #domainLeftRegion .pf-view-group{display:grid;gap:2px}
body[data-consumer=portfolio] #domainLeftRegion .pf-view-title{margin:0 0 3px;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}
body[data-consumer=portfolio] #domainLeftRegion .pf-view-hint{margin:2px 0 0;font-size:10.5px;line-height:1.4;color:var(--text3)}

/* ── LEFT · reference index: two columns, RTL-correct column order ──
 * Column sizing is left to AUTO layout so the state column always grows to its technical
 * token (RESOLVABLE / UNAVAILABLE / SOURCE_SUPERSEDED …). The shared W04 rule pins this column
 * to 86px with "white-space:nowrap", which CLIPS a Portfolio state token (11px bold needs
 * 92–133px) — the tokens are canonical, so the column follows the token, never the reverse.
 * "html" + "body[...]" prefixes raise specificity above the shared W04 consumer rule, which
 * otherwise ties and wins on <head> order. ── */
html body[data-consumer=portfolio] #domainLeftRegion .m0-table{direction:inherit;table-layout:auto}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table th:first-child{width:auto}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table th:last-child{width:auto}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table td:last-child{text-align:start;font-size:11px}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table td:last-child strong{font-size:11px;font-weight:700;letter-spacing:.02em;overflow-wrap:normal}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table td{padding:9px 8px}
html body[data-consumer=portfolio] #domainLeftRegion .m0-table th{padding:4px 8px 6px}

/* ── RIGHT · five context cards, matched to the reference's right pane ── */
body[data-consumer=portfolio] #domainContext .m0-context-panel>.m0-semantic-group{padding:11px 12px}
body[data-consumer=portfolio] #domainContext .m0-semantic-list>div{grid-template-columns:minmax(104px,.46fr) minmax(0,1fr)}

/* ── RTL/AR typography: Arabic never inherits Latin tracking or a case transform ──
 * VISUAL_EXECUTION_STANDARD §7 forbids all-caps as a hierarchy device in Arabic, and
 * letter-spacing inserts visible gaps between joined Arabic glyphs. Applied only when
 * html[dir=rtl] AND only inside this surface's three regions, so no other W04 surface's
 * presentation changes (shared mechanics keep governing; this is surface-local presentation). */
html[dir=rtl] body[data-consumer=portfolio] #domainLeftRegion :is(p,span,strong,dt,dd,th,h2,h3,h4,small,li),
html[dir=rtl] body[data-consumer=portfolio] #domainContext :is(p,span,strong,dt,dd,th,h2,h3,h4,small,li),
html[dir=rtl] #foundationStage[data-m0-composition=portfolio] :is(p,span,strong,dt,dd,th,h2,h3,h4,small,li){
  letter-spacing:normal;
  text-transform:none;
}

/* ── responsive: wide / standard / narrow / compact ── */
@media (max-width:1320px){
  #foundationStage[data-m0-composition=portfolio] .w04-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:1080px){
  #foundationStage[data-m0-composition=portfolio] .w04-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:920px){
  #foundationStage[data-m0-composition=portfolio] .w04-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  #foundationStage[data-m0-composition=portfolio] .w04-grid-cell dd{font-size:18px}
  body[data-consumer=portfolio] #domainLeftRegion .m0-table th:last-child{width:92px}
}
@media (max-width:640px){
  #foundationStage[data-m0-composition=portfolio] .w04-grid{grid-template-columns:minmax(0,1fr)}
}
`;

let bound = false;

/** Inject the Portfolio presentation stylesheet once and keep it after the shared W04 style.
 *  Specificity — not head order — is what makes these rules win, so re-appending is cosmetic. */
export function installPortfolioPresentationStyle() {
  if (bound || typeof document === 'undefined') return;
  bound = true;
  let style = document.querySelector('#portfolioSurfacePresentationStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'portfolioSurfacePresentationStyle';
    style.textContent = PORTFOLIO_PRESENTATION_CSS;
    document.head.append(style);
  }
}

export default PORTFOLIO_PRESENTATION_CSS;
