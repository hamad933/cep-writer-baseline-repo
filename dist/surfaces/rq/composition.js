/**
 * RQ — Research & Quality workspace composition.
 *
 * WHAT THIS WORKSPACE IS FOR:
 *   Reconcile claims against sources. The analyst pins a source pair, reads both excerpts with
 *   their anchors, sees how each claim is supported by each source (supported / qualified /
 *   needs review / conflict), inspects provenance and revision history, and records WORKING
 *   review state — never a formal Review decision and never a durable save.
 *
 * OWNERSHIP / ARCHITECTURE:
 *   SHARED MECHANICS (consumed, never re-implemented): CommandRegistry, WorkspaceFoundation
 *   region()/toolbar()/menu()/status(), the pane host, the ReusableToolbarTemplate slots.
 *   SURFACE-SPECIFIC COMPOSITION + PRESENTATION (owned here): every region's information
 *   hierarchy, grouping, density, emphasis and inline styling inside the shared toolbar slot.
 *
 * MOUNT PATH:
 *   `surfaces/m0-controller-composition.ts` is writer-forbidden (hotspot register), so this
 *   module is entered from `bindRqSurface()` in this folder via a guarded deferred mount and the
 *   canonical direct hook is filed in
 *   `writer-output/W02-RESEARCH-QUALITY/SERIALIZED_HOTSPOT_REQUEST.md`.
 *
 * LANGUAGE / DIRECTION: every label is `{ar,en}`; all layout uses logical properties; technical
 * tokens are isolated with `<bdi dir="ltr">`; no direction is baked into structure.
 */
import {
  RQ_ACTION_HINT, RQ_ACTION_LABEL, RQ_ACTIONS, RQ_ACTIVITY, RQ_ACTIVE_REVIEW,
  RQ_CLAIM_LINKAGE, RQ_CLAIMS, RQ_CONTEXT_TABS, RQ_CONTEXT_TAB_LABEL, RQ_LABELS,
  RQ_ORDER, RQ_PROVENANCE, RQ_PROJECTS, RQ_QUEUE, RQ_QUEUE_DETAIL, RQ_REFERENCES,
  RQ_RELATIONS, RQ_REVIEW_NOTE, RQ_REVIEW_RESULT, RQ_REVISIONS, RQ_SOURCES, RQ_STATUS_LABEL,
  RQ_STATUS_TONE, RQ_TAGS, RQ_TRUTH, RQ_VIEW_IDS, RQ_VIEW_LABEL, RQ_VIEW_SUMMARY,
  rqText,                                                                                     
                            
} from '../../adapters/rq/fixtures.js';

const esc = (value         )         => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]          ));
const L = (value        , locale          )         => esc(rqText(value, locale));
const pct = (value        )         => `${Math.round(value * 100)}%`;
const icon = (id        , cls = 'icon sm')         => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"></use></svg>`;
const token = (value        )         => `<bdi class="rq-token" dir="ltr">${esc(value)}</bdi>`;

/** Shared toolbar slot: the workspace view switcher only — claim actions live in the work area. */
export const RQ_TOOLBAR_ORDER           = RQ_VIEW_IDS.map(id => `rq.view.${id}`);

                                   
                 
                  
                  
                           
                    
                               
                  
                     
                      
                      
 

export function createRqWorkspaceState()                   {
  return {
    view: 'compare',
    claimId: 'C-014',
    queueId: 'claim-conflicts',
    contextTab: 'overview',
    claims: RQ_CLAIMS.map(claim => ({ ...claim, support: { ...claim.support } })),
    activity: RQ_ACTIVITY.map(entry => ({ ...entry })),
    notes: [],
    requests: [],
    conflicts: [],
    confirmed: []
  };
}

const STATUS_VALUE                                                                                 = {
  SUPPORTED: 'SUPPORTED', QUALIFIED: 'QUALIFIED', NEEDS_REVIEW: 'NEEDS_REVIEW', CONFLICT: 'CONFLICT'
};

/* ------------------------------------------------------------------ style */

const RQ_STYLE_ID = 'rqSurfaceStyle';

const RQ_CSS = `
[data-rq-region],.rq-stage{--rq-gap:14px;--rq-pad:16px;--rq-r:11px;--rq-r-sm:8px;--rq-s1:4px;--rq-s2:8px;--rq-s3:12px;--rq-s4:16px;--rq-s5:24px;--rq-t-title:clamp(18px,1.6vw,23px);--rq-t-h2:13px;--rq-t-h3:12px;--rq-t-body:12.5px;--rq-t-meta:11px;--rq-t-micro:10px;min-width:0}
.rq-stage{padding:16px 20px 24px}
.rq-stage>.rq{display:grid;gap:var(--rq-gap);align-content:start;min-width:0;flex:0 0 auto}
.rq-eyebrow{margin:0;font:600 var(--rq-t-micro)/1.4 var(--mono);letter-spacing:.06em;color:var(--accent);text-transform:uppercase}
.rq-title{margin:4px 0 0;font-size:var(--rq-t-title);line-height:1.24;font-weight:800;letter-spacing:-.01em;color:var(--text)}
.rq-sub{margin:6px 0 0;font-size:var(--rq-t-body);line-height:1.55;color:var(--text2);max-width:88ch}
.rq-meta{margin:6px 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--rq-s2);font-size:var(--rq-t-meta);color:var(--text3)}
.rq-meta .rq-dot{width:3px;height:3px;border-radius:50%;background:var(--line2);flex:none}
.rq-controlrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--rq-s3);min-width:0}
.rq-headline{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--rq-s3);min-width:0}
.rq-headline .rq-meta{margin:0}
.rq-actions{display:flex;flex-wrap:wrap;gap:6px;min-width:0}
.rq-chip{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1px solid rgba(56,199,255,.3);border-radius:999px;background:rgba(56,199,255,.08);color:#c5f3ff;font-size:var(--rq-t-meta);font-weight:650;cursor:pointer;white-space:nowrap;transition:background .14s,border-color .14s,color .14s}
.rq-chip:hover:not(:disabled){background:rgba(56,199,255,.2);color:#e6faff;border-color:rgba(56,199,255,.5)}
.rq-chip:active:not(:disabled){transform:translateY(1px)}
.rq-chip[data-tone=bad]{border-color:rgba(255,109,120,.34);background:var(--bads);color:#ffd5d8}
.rq-chip[data-tone=bad]:hover:not(:disabled){background:rgba(255,109,120,.22);border-color:rgba(255,109,120,.55)}
.rq-chip:disabled{opacity:.45;cursor:not-allowed}
.rq-head{display:grid;gap:0;padding-bottom:var(--rq-s3);border-bottom:1px solid var(--line);min-width:0}
.rq-truth{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;min-width:0}
.rq-truth-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.025);color:var(--text3);font-size:var(--rq-t-micro);white-space:nowrap}
.rq-truth-chip[data-tone=working]{color:#c5f3ff;border-color:rgba(56,199,255,.3);background:var(--as)}
.rq-truth-chip[data-tone=warn]{color:#ffe3b6;border-color:rgba(244,189,101,.3);background:var(--warns)}
.rq-truth-chip .rq-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}

.rq-block{display:grid;gap:var(--rq-s3);min-width:0}
.rq-block-head{display:flex;align-items:center;gap:var(--rq-s2);flex-wrap:wrap;min-width:0}
.rq-block-head h2{margin:0;font-size:var(--rq-t-h2);font-weight:750;color:var(--text);display:flex;align-items:center;gap:6px}
.rq-block-head h2 .rq-idx{font:600 10px var(--mono);color:var(--accent);letter-spacing:.05em}
.rq-block-note{font-size:var(--rq-t-meta);color:var(--text3);margin-inline-start:auto;display:flex;align-items:center;gap:6px;min-width:0}
.rq-block-note .rq-token{font-size:10px}

.rq-sources{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--rq-gap)}
.rq-source{display:grid;gap:var(--rq-s3);min-width:0;padding:var(--rq-pad);border:1px solid var(--line);border-radius:var(--rq-r);background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.008))}
.rq-source-head{display:grid;grid-template-columns:34px 34px minmax(0,1fr) auto;gap:var(--rq-s3);align-items:center;min-width:0}
.rq-slot{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;border:1px solid rgba(56,199,255,.34);background:var(--as);color:#c5f3ff;font:800 14px var(--ui)}
.rq-source[data-slot=B] .rq-slot{border-color:rgba(174,145,255,.36);background:rgba(174,145,255,.14);color:#d9ceff}
.rq-source-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;border:1px solid var(--line);background:#0b2235;color:var(--accent2)}
.rq-source[data-slot=B] .rq-source-icon{background:#1a1730;color:#c3b2ff}
.rq-source-id{min-width:0}
.rq-source-id h3{margin:0;font-size:var(--rq-t-h3);line-height:1.35;font-weight:700;color:var(--text);overflow-wrap:anywhere}
.rq-source-id p{margin:2px 0 0;font-size:var(--rq-t-meta);color:var(--text3)}
.rq-source-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--rq-s2);font-size:var(--rq-t-meta);color:var(--text3);padding-block-end:var(--rq-s3);border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
.rq-source-meta .rq-key{color:var(--text2);font-weight:650}
.rq-token{font:600 10.5px var(--mono);direction:ltr;unicode-bidi:isolate;color:var(--text2);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:5px;padding:1px 5px;white-space:nowrap}
.rq-linkbtn{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 7px;border:1px solid rgba(56,199,255,.26);border-radius:6px;background:rgba(56,199,255,.08);color:var(--accent2);font-size:var(--rq-t-micro);cursor:pointer}
.rq-linkbtn:hover{background:rgba(56,199,255,.16);color:#d7f6ff}
.rq-quote{position:relative;margin:0;padding:12px 34px 12px 12px;border:1px dashed color-mix(in srgb,var(--line2) 78%,transparent);border-radius:var(--rq-r-sm);background:rgba(255,255,255,.02);min-width:0}
.rq-quote p{margin:0;font-size:var(--rq-t-body);line-height:1.75;color:#d7e6f1}
.rq-quote footer{margin-top:8px;font-size:var(--rq-t-micro);color:var(--text3);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.rq-quote-glyph{position:absolute;inset-inline-start:10px;top:6px;font-size:22px;line-height:1;color:color-mix(in srgb,var(--accent) 55%,transparent);pointer-events:none}
.rq-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border:1px solid var(--line);border-radius:999px;font-size:var(--rq-t-micro);color:var(--text3)}
.rq-badge[data-tone=ok]{color:#c1f8db;border-color:rgba(83,214,148,.28);background:var(--oks)}
.rq-badge[data-tone=warn]{color:#ffe3b6;border-color:rgba(244,189,101,.3);background:var(--warns)}
.rq-badge[data-tone=bad]{color:#ffd5d8;border-color:rgba(255,109,120,.3);background:var(--bads)}

.rq-panel{border:1px solid var(--line);border-radius:var(--rq-r);background:color-mix(in srgb,var(--surface) 92%,transparent);overflow:hidden;min-width:0}
.rq-table-wrap{overflow-x:auto;scrollbar-width:thin}
.rq-table{width:100%;border-collapse:collapse;min-width:640px}
.rq-table th,.rq-table td{text-align:start;padding:9px 12px;border-bottom:1px solid color-mix(in srgb,var(--line) 78%,transparent);vertical-align:top}
.rq-table thead th{font-size:var(--rq-t-micro);font-weight:700;color:var(--text3);background:rgba(255,255,255,.03);white-space:nowrap;position:sticky;top:0;z-index:1}
.rq-table tbody tr:last-child th,.rq-table tbody tr:last-child td{border-bottom:0}
.rq-table tbody tr[aria-selected=true]{background:rgba(56,199,255,.07);box-shadow:inset 2px 0 0 0 var(--accent)}
.rq-table tbody tr:hover{background:rgba(255,255,255,.028)}
.rq-table tbody tr[aria-selected=true]:hover{background:rgba(56,199,255,.09)}
.rq-c-select{width:34px}
.rq-radio{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;cursor:pointer;display:grid;place-items:center;padding:0}
.rq-radio:hover{border-color:var(--accent)}
.rq-radio[aria-pressed=true]{border-color:var(--accent);background:var(--accent)}
.rq-radio[aria-pressed=true]::after{content:"";width:6px;height:6px;border-radius:50%;background:#04202e}
.rq-c-claim{min-width:230px;max-width:44ch}
.rq-claim-id{display:inline-block;font:700 11px var(--mono);direction:ltr;unicode-bidi:isolate;color:var(--accent2);margin-inline-end:7px}
.rq-claim-text{font-size:var(--rq-t-body);line-height:1.6;color:var(--text)}
.rq-claim-scope{display:block;margin-top:4px;font-size:var(--rq-t-micro);color:var(--text3)}
.rq-anchor-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border:1px solid var(--line);border-radius:7px;background:rgba(255,255,255,.03);cursor:pointer;color:var(--text2);font-size:var(--rq-t-meta)}
.rq-anchor-chip:hover{border-color:var(--line2);background:rgba(255,255,255,.06);color:var(--text)}
.rq-anchor-chip .rq-slotdot{width:16px;height:16px;border-radius:4px;display:grid;place-items:center;font:700 9px var(--ui);font-style:normal;background:var(--as);color:#c5f3ff;flex:none}
.rq-anchor-chip[data-slot=B] .rq-slotdot{background:rgba(174,145,255,.16);color:#d9ceff}
.rq-none{color:var(--text3);font-weight:700}
.rq-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border:1px solid;border-radius:999px;font-size:var(--rq-t-meta);font-weight:650;white-space:nowrap}
.rq-pill[data-tone=ok]{color:#c1f8db;border-color:rgba(83,214,148,.3);background:var(--oks)}
.rq-pill[data-tone=warn]{color:#ffe3b6;border-color:rgba(244,189,101,.32);background:var(--warns)}
.rq-pill[data-tone=bad]{color:#ffd5d8;border-color:rgba(255,109,120,.32);background:var(--bads)}
.rq-pill[data-tone=violet]{color:#ded3ff;border-color:rgba(174,145,255,.32);background:rgba(174,145,255,.13)}
.rq-conf{display:block;margin-top:5px;font-size:var(--rq-t-micro);color:var(--text3)}
.rq-conf i{display:block;height:3px;border-radius:2px;background:var(--line);margin-top:4px;overflow:hidden;position:relative;width:56px}
.rq-conf i::after{content:"";position:absolute;inset-block:0;inset-inline-start:0;width:var(--rq-conf,50%);background:var(--accent)}
.rq-menu{width:28px;height:28px;padding:0}

.rq-result-grid{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:var(--rq-gap);align-items:stretch}
.rq-result-card{display:grid;gap:var(--rq-s2);align-content:start;padding:var(--rq-pad);border:1px solid var(--line);border-radius:var(--rq-r);background:color-mix(in srgb,var(--elev) 76%,transparent);min-width:0}
.rq-result-card[data-tone=warn]{border-color:rgba(244,189,101,.24)}
.rq-result-main{display:flex;align-items:center;gap:var(--rq-s3);flex-wrap:wrap}
.rq-version{font-size:26px;font-weight:800;letter-spacing:-.01em;color:var(--text);line-height:1}
.rq-version[data-draft=true]{color:var(--warn)}
.rq-kv{margin:0;display:grid;gap:6px}
.rq-kv>div{display:flex;align-items:baseline;gap:8px;font-size:var(--rq-t-meta)}
.rq-kv dt{color:var(--text3);flex:none}
.rq-kv dd{margin:0;color:var(--text2);min-width:0;overflow-wrap:anywhere}
.rq-result-arrow{display:grid;place-items:center;color:var(--text3);padding-inline:2px}
.rq-result-arrow .icon{width:30px;height:30px;stroke-width:1.4;opacity:.7}
[dir=rtl] .rq-result-arrow .icon{transform:scaleX(-1)}

.rq-steps{list-style:none;margin:0;padding:0;display:grid;gap:0}
.rq-timeline{list-style:none;margin:0;padding:0;display:grid}
.rq-event{display:grid;grid-template-columns:130px minmax(0,1fr);gap:var(--rq-s3);padding:10px 13px;border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent);align-items:start}
.rq-event:last-child{border-bottom:0}
.rq-event time{font:600 10.5px/1.6 var(--mono);direction:ltr;unicode-bidi:isolate;color:var(--text3);white-space:nowrap}
.rq-event p{margin:0;font-size:var(--rq-t-body);line-height:1.6;color:var(--text2)}
.rq-event b{color:var(--text);font-weight:650;display:block;font-size:var(--rq-t-micro);margin-bottom:2px}
.rq-event[data-tone=ok]{box-shadow:inset 2px 0 0 0 rgba(83,214,148,.55)}
.rq-event[data-tone=warn]{box-shadow:inset 2px 0 0 0 rgba(244,189,101,.6)}
.rq-event[data-tone=bad]{box-shadow:inset 2px 0 0 0 rgba(255,109,120,.6)}
[dir=rtl] .rq-event[data-tone=ok]{box-shadow:inset -2px 0 0 0 rgba(83,214,148,.55)}
[dir=rtl] .rq-event[data-tone=warn]{box-shadow:inset -2px 0 0 0 rgba(244,189,101,.6)}
[dir=rtl] .rq-event[data-tone=bad]{box-shadow:inset -2px 0 0 0 rgba(255,109,120,.6)}

.rq-plainlist{list-style:none;margin:0;padding:0;display:grid}
.rq-plainlist li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--rq-s3);align-items:center;padding:11px 13px;border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
.rq-plainlist li:last-child{border-bottom:0}
.rq-plainlist h4{margin:0;font-size:var(--rq-t-body);font-weight:650;color:var(--text);display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.rq-plainlist p{margin:3px 0 0;font-size:var(--rq-t-meta);color:var(--text3);line-height:1.55;overflow-wrap:anywhere}

.rq-side{display:grid;gap:var(--rq-s5);align-content:start;min-width:0}
.rq-scope{padding:12px;border:1px solid color-mix(in srgb,var(--line) 80%,transparent);border-radius:10px;background:linear-gradient(180deg,rgba(56,199,255,.07),rgba(56,199,255,.015))}
.rq-scope .rq-eyebrow{color:var(--accent2)}
.rq-scope-title{margin:6px 0 0;font-size:13px;font-weight:700;line-height:1.45;color:var(--text)}
.rq-scope-meta{margin:7px 0 0;font-size:var(--rq-t-micro);color:var(--text3);line-height:1.6}
.rq-scope-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
.rq-group{display:grid;gap:6px;min-width:0}
.rq-group-head{display:flex;align-items:center;gap:7px;margin:0;font-size:var(--rq-t-micro);font-weight:750;color:var(--text3);letter-spacing:.04em;text-transform:none}
.rq-group-head .rq-group-count{margin-inline-start:auto;min-width:20px;height:18px;display:grid;place-items:center;padding:0 5px;border:1px solid var(--line);border-radius:5px;background:rgba(255,255,255,.03);font:600 10px var(--mono);color:var(--text3)}
.rq-list{list-style:none;margin:0;padding:0;display:grid;gap:3px}
.rq-item{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center;padding:8px 9px;border:1px solid transparent;border-radius:9px;background:transparent;color:inherit;text-align:start;cursor:pointer;font:inherit}
.rq-item:hover{background:rgba(255,255,255,.04);border-color:var(--line)}
.rq-item[aria-current=true]{background:linear-gradient(90deg,rgba(56,199,255,.16),rgba(56,199,255,.05));border-color:rgba(56,199,255,.34)}
[dir=rtl] .rq-item[aria-current=true]{background:linear-gradient(270deg,rgba(56,199,255,.16),rgba(56,199,255,.05))}
.rq-item-dot{width:8px;height:8px;border-radius:50%;background:var(--line2);flex:none}
.rq-item[data-state=attention] .rq-item-dot{background:var(--bad)}
.rq-item[data-state=clean] .rq-item-dot{background:var(--ok)}
.rq-item[data-state=waiting] .rq-item-dot{background:var(--warn)}
.rq-item-body{min-width:0}
.rq-item-title{display:block;font-size:var(--rq-t-body);font-weight:650;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-item[aria-current=true] .rq-item-title{color:var(--text)}
.rq-item-meta{display:block;margin-top:2px;font-size:var(--rq-t-micro);color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-count{min-width:24px;height:22px;display:grid;place-items:center;padding:0 6px;border:1px solid var(--line);border-radius:6px;background:rgba(255,255,255,.03);font:700 10.5px var(--mono);color:var(--text2)}
.rq-count[data-tone=bad]{color:#ffd5d8;border-color:rgba(255,109,120,.32);background:var(--bads)}
.rq-count[data-tone=warn]{color:#ffe3b6;border-color:rgba(244,189,101,.3);background:var(--warns)}
.rq-count[data-tone=violet]{color:#ded3ff;border-color:rgba(174,145,255,.3);background:rgba(174,145,255,.13)}
.rq-count[data-tone=accent]{color:#c5f3ff;border-color:rgba(56,199,255,.3);background:var(--as)}
.rq-item .icon{color:var(--text3);flex:none}
.rq-footnote{margin:0;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--line) 70%,transparent);font-size:var(--rq-t-micro);line-height:1.6;color:var(--text3);display:flex;gap:6px;align-items:flex-start}
.rq-footnote .icon{flex:none;margin-top:1px;color:var(--warn)}

.rq-tabs{display:flex;gap:3px;padding:3px;border:1px solid var(--line);border-radius:9px;background:#071520;overflow-x:auto;scrollbar-width:none}
.rq-tabs::-webkit-scrollbar{display:none}
.rq-tab{flex:1 1 auto;height:28px;padding:0 6px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--text3);font-size:var(--rq-t-micro);font-weight:650;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-tab:hover{background:rgba(255,255,255,.05);color:var(--text2)}
.rq-tab[aria-selected=true]{background:var(--as);border-color:rgba(56,199,255,.28);color:var(--accent2)}
.rq-ctx{display:grid;gap:0}
.rq-ctx-section{padding:13px 2px;border-bottom:1px solid color-mix(in srgb,var(--line) 72%,transparent)}
.rq-ctx-section:last-child{border-bottom:0}
.rq-ctx-section h3{margin:0 0 9px;font-size:var(--rq-t-micro);font-weight:750;color:var(--text3);display:flex;align-items:center;gap:6px;letter-spacing:.03em}
.rq-ctx-section h3 .icon{color:var(--text3)}
.rq-ctx-headline{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.rq-ctx-headline strong{font-size:14px;font-weight:750;color:var(--ok)}
.rq-ctx-text{margin:0;font-size:var(--rq-t-body);line-height:1.7;color:var(--text2)}
.rq-relation{display:grid;gap:5px;padding:9px 10px;border:1px solid var(--line);border-radius:9px;background:rgba(255,255,255,.022);margin-bottom:7px}
.rq-relation:last-child{margin-bottom:0}
.rq-relation p{margin:0;font-size:var(--rq-t-body);color:var(--text2);display:flex;gap:7px;align-items:center}
.rq-ref{display:grid;gap:4px;margin-bottom:9px}
.rq-ref:last-of-type{margin-bottom:0}
.rq-ref .rq-token{justify-self:start;white-space:normal;overflow-wrap:anywhere;line-height:1.6}
.rq-ref span{font-size:var(--rq-t-micro);color:var(--text3);line-height:1.55}
.rq-chip-row{display:flex;flex-wrap:wrap;gap:6px}
.rq-tag{padding:4px 10px;border:1px solid var(--line);border-radius:999px;font-size:var(--rq-t-meta);background:rgba(255,255,255,.03);color:var(--text2);cursor:pointer}
.rq-tag:hover{border-color:var(--line2);color:var(--text)}
.rq-tag[data-tone=accent]{color:#c5f3ff;border-color:rgba(56,199,255,.28);background:var(--as)}
.rq-tag[data-tone=violet]{color:#ded3ff;border-color:rgba(174,145,255,.28);background:rgba(174,145,255,.12)}
.rq-tag[data-tone=warn]{color:#ffe3b6;border-color:rgba(244,189,101,.3);background:var(--warns)}
.rq-step{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
.rq-step:last-child{border-bottom:0}
.rq-step-num{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--line);background:rgba(255,255,255,.03);font:600 10px var(--mono);color:var(--text3)}
.rq-step[data-state=done] .rq-step-num{border-color:rgba(83,214,148,.4);background:var(--oks);color:#c1f8db}
.rq-step[data-state=active] .rq-step-num{border-color:rgba(56,199,255,.45);background:var(--as);color:#c5f3ff}
.rq-step-label{font-size:var(--rq-t-body);color:var(--text2);min-width:0}
.rq-step[data-state=done] .rq-step-label{color:var(--text3);text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--text3) 55%,transparent)}
.rq-empty{margin:0;padding:14px;border:1px dashed var(--line2);border-radius:var(--rq-r-sm);color:var(--text3);font-size:var(--rq-t-meta);line-height:1.65}
.rq-bottom-body{display:grid;gap:8px;min-width:0}
.rq-bottom-body .rq-event{padding:8px 11px;grid-template-columns:120px minmax(0,1fr)}

/* --- inline presentation inside the shared ReusableToolbarTemplate slot --- */
#domainToolbar [data-foundation-command^="rq.view."]{border-radius:0;border-inline-end-width:0}
#domainToolbar [data-foundation-command^="rq.view."]:first-of-type{border-start-start-radius:8px;border-end-start-radius:8px}
#domainToolbar [data-foundation-command^="rq.view."]:last-of-type{border-inline-end-width:1px;border-start-end-radius:8px;border-end-end-radius:8px}
#domainToolbar [data-foundation-command^="rq.view."][aria-pressed=true]{background:var(--as);border-color:rgba(56,199,255,.34);color:#c5f3ff;box-shadow:inset 0 -2px 0 0 var(--accent)}
#domainToolbar [data-foundation-command^="rq.action."]{height:28px;font-size:11px;border-color:rgba(56,199,255,.3);background:rgba(56,199,255,.08);color:#c5f3ff}
#domainToolbar [data-foundation-command^="rq.action."]:hover:not(:disabled){background:rgba(56,199,255,.18);color:#e4faff}
#domainToolbar [data-foundation-command="rq.action.conflict"]{border-color:rgba(255,109,120,.34);background:var(--bads);color:#ffd5d8}
#domainToolbar [data-foundation-command="rq.action.conflict"]:hover:not(:disabled){background:rgba(255,109,120,.2)}
#domainToolbar [data-foundation-command^="rq.action."]:disabled{opacity:.42}
#domainToolbar [data-foundation-command^="rq.view."]{font-weight:650}
#domainToolbar [data-foundation-command^="rq."]:focus-visible{outline:2px solid var(--focus);outline-offset:2px}

@media(max-width:1180px){
  .rq-stage{padding:14px 16px 22px}
  .rq-head{grid-template-columns:minmax(0,1fr)}
  .rq-truth{justify-content:flex-start;max-width:none}
  .rq-result-grid{grid-template-columns:minmax(0,1fr)}
  .rq-result-arrow .icon{transform:rotate(90deg)}
}
@media(max-width:760px){
  .rq-stage{padding:12px 12px 20px}
  .rq-sources{grid-template-columns:minmax(0,1fr)}
  .rq-source-head{grid-template-columns:30px 30px minmax(0,1fr) auto}
  .rq-slot,.rq-source-icon{width:30px;height:30px}
  .rq-event{grid-template-columns:minmax(0,1fr);gap:4px}
  .rq-title{font-size:19px}
}
@media(prefers-reduced-motion:reduce){[data-rq-region] *,.rq-stage *{transition:none!important;animation:none!important}}
`;

function ensureStyle()       {
  if (document.getElementById(RQ_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = RQ_STYLE_ID;
  style.textContent = RQ_CSS;
  document.head.append(style);
}

/* ----------------------------------------------------------------- pieces */

function truthChips(descriptor                                 = {})         {
  const locale = currentLocale();
  const chips                                         = [
    { tone: 'working', label: RQ_LABELS.workingAnalysis },
    { tone: 'muted', label: RQ_LABELS.notFormalReview },
    { tone: 'warn', label: RQ_LABELS.saveUnavailable }
  ];
  if (descriptor.providerAdmitted === false) chips.push({ tone: 'muted', label: RQ_LABELS.providerUnavailable });
  return `<ul class="rq-truth">${chips.map(chip =>
    `<li class="rq-truth-chip" data-tone="${chip.tone}"><span class="rq-dot" aria-hidden="true"></span>${L(chip.label, locale)}</li>`).join('')}</ul>`;
}

const RQ_CENTER_ACTION_ORDER               = [...RQ_ACTIONS];

/** Action chips live in the work area (where the task happens), not in the shared toolbar slot. */
function actionsHtml()         {
  const locale = currentLocale();
  const chips = RQ_CENTER_ACTION_ORDER.map(action => {
    const availability = commandAvailability(action);
    const state = availability === true ? { enabled: true, reason: '' } : availability;
    const tone = action === 'conflict' ? ' data-tone="bad"' : '';
    return `<button type="button" class="rq-chip" data-rq-command="rq.action.${action}"${tone}
      ${state.enabled ? '' : 'disabled aria-disabled="true"'}
      title="${esc(state.reason || rqText(RQ_ACTION_HINT[action], locale))}">${icon(action === 'conflict' ? 'warn' : action === 'requestSource' ? 'plus' : action === 'embedReview' ? 'history' : 'check')}${L(RQ_ACTION_LABEL[action], locale)}</button>`;
  }).join('');
  return `<div class="rq-controlrow">
    <div class="rq-actions" role="group" aria-label="${esc(rqText({ ar: 'إجراءات المطابقة', en: 'Reconciliation actions' }, locale))}">${chips}</div>
    ${truthChips(rqRuntime?.descriptor?.() || {})}
  </div>`;
}

function headHtml(view          )         {
  const locale = currentLocale();
  const facts = `<p class="rq-meta"><span>${L(RQ_ACTIVE_REVIEW.scope, locale)}</span><span class="rq-dot" aria-hidden="true"></span><span>${L(RQ_ACTIVE_REVIEW.lastLabel, locale)} ${token(RQ_ACTIVE_REVIEW.lastDate)}</span></p>`;
  return `${actionsHtml()}
  <header class="rq-head">
    <div class="rq-headline">
      <p class="rq-eyebrow">${L(RQ_LABELS.activeReview, locale)} · ${token(RQ_ACTIVE_REVIEW.id)}</p>
      ${facts}
    </div>
    <h1 class="rq-title">${L(RQ_ACTIVE_REVIEW.title, locale)}</h1>
    <p class="rq-sub">${L(RQ_VIEW_SUMMARY[view], locale)}</p>
  </header>`;
}

function sourceCardHtml(slot           )         {
  const locale = currentLocale();
  const source = RQ_SOURCES.find(item => item.slot === slot);
  if (!source) return '';
  const verified = source.anchors.verified === source.anchors.claimed;
  return `<article class="rq-source" data-slot="${slot}">
    <header class="rq-source-head">
      <span class="rq-slot" aria-hidden="true">${slot}</span>
      <span class="rq-source-icon" aria-hidden="true">${icon('book')}</span>
      <div class="rq-source-id">
        <h3>${esc(source.title)}</h3>
        <p>${esc(source.publisher)} · ${L(source.kind, locale)} · ${token(source.updated)}</p>
      </div>
      <button type="button" class="btn iconbtn rq-menu" data-rq-action="source-menu" data-slot="${slot}" aria-label="${esc(rqText({ ar: `إجراءات مصدر ${slot}`, en: `Actions for source ${slot}` }, locale))}" aria-haspopup="menu">${icon('more')}</button>
    </header>
    <div class="rq-source-meta">
      <span class="rq-key">${esc(rqText({ ar: 'المرساة', en: 'Anchor' }, locale))}</span>
      ${token(source.id)}
      <button type="button" class="rq-linkbtn" data-rq-action="open-anchor" data-anchor="${esc(source.id)}">${icon('link')}${esc(rqText({ ar: 'فتح', en: 'Open' }, locale))}</button>
      <span class="rq-dot" aria-hidden="true"></span>
      <span class="rq-badge" data-tone="${verified ? 'ok' : 'warn'}">${icon(verified ? 'check' : 'warn')}${source.anchors.verified}/${source.anchors.claimed} ${esc(rqText({ ar: 'مُتحقَّق', en: 'verified' }, locale))}</span>
      <span class="rq-dot" aria-hidden="true"></span>
      ${token(source.digest)}
    </div>
    <blockquote class="rq-quote">
      <span class="rq-quote-glyph" aria-hidden="true">&#8221;</span>
      <p dir="auto">${L(source.excerpt, locale)}</p>
      <footer>${esc(source.publisher)} · ${token(source.id)} · ${esc(rqText({ ar: 'مقتطف موثّق', en: 'quoted excerpt' }, locale))} · ${token(source.updated)}</footer>
    </blockquote>
  </article>`;
}

function anchorCell(anchor               , slot           )         {
  if (!anchor) return `<span class="rq-none" title="${esc(currentLocale() === 'ar' ? 'لا يوجد دعم في هذا المصدر' : 'No support in this source')}">&#8212;</span>`;
  return `<button type="button" class="rq-anchor-chip" data-slot="${slot}" data-rq-action="open-anchor" data-anchor="${esc(anchor)}"><span class="rq-slotdot" aria-hidden="true">${slot}</span>${token(anchor)}${icon('link')}</button>`;
}

function statusCell(claim         )         {
  const locale = currentLocale();
  const status = claim.status;
  return `<span class="rq-pill" data-tone="${RQ_STATUS_TONE[status]}">${esc(rqText(RQ_STATUS_LABEL[status], locale))}</span>
    <small class="rq-conf">${esc(rqText({ ar: 'درجة الثقة', en: 'confidence' }, locale))} ${pct(claim.confidence)}<i style="--rq-conf:${pct(claim.confidence)}" aria-hidden="true"></i></small>`;
}

function pairClaims(state                  )            {
  return state.claims.filter(claim => claim.inPair);
}

function compareBody(state                  )         {
  const locale = currentLocale();
  const claims = pairClaims(state);
  const queueLabel = rqText(RQ_QUEUE_DETAIL[state.queueId]?.label || RQ_QUEUE[0].label, locale);
  return `
  <section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">01</span>${L(RQ_LABELS.sourcePair, locale)}</h2>
      <span class="rq-block-note">2 / 14 ${esc(rqText({ ar: 'مصدر مثبّت', en: 'sources pinned' }, locale))}</span>
    </div>
    <div class="rq-sources">${sourceCardHtml('A')}${sourceCardHtml('B')}</div>
  </section>

  <section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">02</span>${L(RQ_LABELS.claimMatching, locale)}</h2>
      <span class="rq-block-note">${esc(queueLabel)} · ${claims.length} / ${state.claims.length} ${esc(rqText({ ar: 'ادعاء', en: 'claims' }, locale))}</span>
    </div>
    <div class="rq-panel"><div class="rq-table-wrap">
      <table class="rq-table">
        <caption class="sr">${L(RQ_LABELS.claimMatching, locale)}</caption>
        <thead><tr>
          <th scope="col" class="rq-c-select"><span class="sr">${esc(rqText({ ar: 'تحديد', en: 'Select' }, locale))}</span></th>
          <th scope="col">${esc(rqText({ ar: 'الادعاء', en: 'Claim' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'دعم المصدر A', en: 'Source A support' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'دعم المصدر B', en: 'Source B support' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'الحالة', en: 'Status' }, locale))}</th>
          <th scope="col" class="rq-c-select"><span class="sr">${esc(rqText({ ar: 'إجراءات', en: 'Actions' }, locale))}</span></th>
        </tr></thead>
        <tbody>${claims.map(claim => `
          <tr data-rq-claim="${esc(claim.id)}" aria-selected="${claim.id === state.claimId}">
            <td class="rq-c-select"><button type="button" class="rq-radio" data-rq-action="select-claim" data-claim="${esc(claim.id)}" aria-pressed="${claim.id === state.claimId}" aria-label="${esc(rqText({ ar: `تحديد الادعاء ${claim.id}`, en: `Select claim ${claim.id}` }, locale))}"></button></td>
            <td class="rq-c-claim"><span class="rq-claim-id">${token(claim.id)}</span><span class="rq-claim-text" dir="auto">${L(claim.text, locale)}</span></td>
            <td>${anchorCell(claim.support.a, 'A')}</td>
            <td>${anchorCell(claim.support.b, 'B')}</td>
            <td>${statusCell(claim)}</td>
            <td class="rq-c-select"><button type="button" class="btn iconbtn rq-menu" data-rq-action="claim-menu" data-claim="${esc(claim.id)}" aria-label="${esc(rqText({ ar: `إجراءات ${claim.id}`, en: `Actions for ${claim.id}` }, locale))}" aria-haspopup="menu">${icon('more')}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div></div>
  </section>

  <section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">03</span>${L(RQ_LABELS.reviewResult, locale)}</h2>
      <span class="rq-block-note">${esc(rqText({ ar: 'المسودّة لا تُطبّق حتى يُحسم التعارض', en: 'The draft is not applied until conflicts settle' }, locale))}</span>
    </div>
    <div class="rq-result-grid">
      <article class="rq-result-card" data-tone="ok">
        <p class="rq-eyebrow">${L(RQ_REVIEW_RESULT.approved.label, locale)}</p>
        <div class="rq-result-main"><strong class="rq-version">${token(RQ_REVIEW_RESULT.approved.version)}</strong><span class="rq-pill" data-tone="ok">${L(RQ_REVIEW_RESULT.approved.state, locale)}</span></div>
        <dl class="rq-kv">
          <div><dt>${L(RQ_REVIEW_RESULT.approved.dateLabel, locale)}</dt><dd>${token(RQ_REVIEW_RESULT.approved.date)}</dd></div>
          <div><dt>${L(RQ_REVIEW_RESULT.approved.byLabel, locale)}</dt><dd>${L(RQ_REVIEW_RESULT.approved.by, locale)}</dd></div>
        </dl>
      </article>
      <div class="rq-result-arrow" aria-hidden="true">${icon('chev', 'icon')}</div>
      <article class="rq-result-card" data-tone="warn">
        <p class="rq-eyebrow">${L(RQ_REVIEW_RESULT.draft.label, locale)}</p>
        <div class="rq-result-main"><strong class="rq-version" data-draft="true">${L(RQ_REVIEW_RESULT.draft.version, locale)}</strong><span class="rq-pill" data-tone="warn">${L(RQ_REVIEW_RESULT.draft.state, locale)}</span></div>
        <dl class="rq-kv">
          <div><dt>${L(RQ_REVIEW_RESULT.draft.dateLabel, locale)}</dt><dd>${token(RQ_REVIEW_RESULT.draft.date)}</dd></div>
          <div><dt>${L(RQ_REVIEW_RESULT.draft.byLabel, locale)}</dt><dd>${L(RQ_REVIEW_RESULT.draft.by, locale)}</dd></div>
        </dl>
      </article>
    </div>
  </section>`;
}

function claimsBody(state                  )         {
  const locale = currentLocale();
  return `<section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">01</span>${L(RQ_LABELS.claimRegister, locale)}</h2>
      <span class="rq-block-note">${state.claims.length} ${esc(rqText({ ar: 'ادعاء في المشروع', en: 'claims in the project' }, locale))}</span>
    </div>
    <div class="rq-panel"><div class="rq-table-wrap">
      <table class="rq-table">
        <caption class="sr">${L(RQ_LABELS.claimRegister, locale)}</caption>
        <thead><tr>
          <th scope="col" class="rq-c-select"><span class="sr">${esc(rqText({ ar: 'تحديد', en: 'Select' }, locale))}</span></th>
          <th scope="col">${esc(rqText({ ar: 'الادعاء', en: 'Claim' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'النطاق', en: 'Scope' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'الدعم', en: 'Support' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'الحالة', en: 'Status' }, locale))}</th>
          <th scope="col" class="rq-c-select"><span class="sr">${esc(rqText({ ar: 'إجراءات', en: 'Actions' }, locale))}</span></th>
        </tr></thead>
        <tbody>${state.claims.map(claim => `
          <tr data-rq-claim="${esc(claim.id)}" aria-selected="${claim.id === state.claimId}">
            <td class="rq-c-select"><button type="button" class="rq-radio" data-rq-action="select-claim" data-claim="${esc(claim.id)}" aria-pressed="${claim.id === state.claimId}" aria-label="${esc(rqText({ ar: `تحديد الادعاء ${claim.id}`, en: `Select claim ${claim.id}` }, locale))}"></button></td>
            <td class="rq-c-claim"><span class="rq-claim-id">${token(claim.id)}</span><span class="rq-claim-text" dir="auto">${L(claim.text, locale)}</span></td>
            <td>${L(claim.scope, locale)}<small class="rq-claim-scope">${esc(claim.owner)}${claim.inPair ? ` · ${esc(rqText({ ar: 'في زوج المطابقة', en: 'in the reconciled pair' }, locale))}` : ''}</small></td>
            <td>${anchorCell(claim.support.a, 'A')} ${claim.support.b ? anchorCell(claim.support.b, 'B') : ''}</td>
            <td>${statusCell(claim)}</td>
            <td class="rq-c-select"><button type="button" class="btn iconbtn rq-menu" data-rq-action="claim-menu" data-claim="${esc(claim.id)}" aria-label="${esc(rqText({ ar: `إجراءات ${claim.id}`, en: `Actions for ${claim.id}` }, locale))}" aria-haspopup="menu">${icon('more')}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div></div>
  </section>`;
}

function provenanceBody()         {
  const locale = currentLocale();
  const tone = (state        ) => (state === 'VERIFIED' ? 'ok' : state === 'PARTIAL' ? 'warn' : 'bad');
  const label = (state        ) => (state === 'VERIFIED'
    ? { ar: 'مُتحقَّق', en: 'Verified' }
    : state === 'PARTIAL'
      ? { ar: 'جزئي', en: 'Partial' }
      : { ar: 'ناقص', en: 'Missing' });
  return `<section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">01</span>${L(RQ_LABELS.provenance, locale)}</h2>
      <span class="rq-block-note">${RQ_PROVENANCE.length} ${esc(rqText({ ar: 'مرساة موثّقة', en: 'recorded anchors' }, locale))}</span>
    </div>
    <div class="rq-panel"><div class="rq-table-wrap">
      <table class="rq-table">
        <caption class="sr">${L(RQ_LABELS.provenance, locale)}</caption>
        <thead><tr>
          <th scope="col">${esc(rqText({ ar: 'المرساة', en: 'Anchor' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'المصدر', en: 'Source' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'المؤشر', en: 'Locator' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'البصمة', en: 'Digest' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'التاريخ', en: 'Quoted' }, locale))}</th>
          <th scope="col">${esc(rqText({ ar: 'الحالة', en: 'State' }, locale))}</th>
        </tr></thead>
        <tbody>${RQ_PROVENANCE.map(row => `
          <tr>
            <td>${token(row.anchor)}</td>
            <td dir="auto">${esc(row.source)}</td>
            <td>${token(row.locator)}</td>
            <td>${row.digest === '—' ? `<span class="rq-none">&#8212;</span>` : token(row.digest)}</td>
            <td>${token(row.retrieved)}</td>
            <td><span class="rq-pill" data-tone="${tone(row.state)}">${esc(rqText(label(row.state), locale))}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div></div>
    <p class="rq-empty">${esc(rqText({ ar: 'سلسلة التوثيق تمثل نطاق عمل تحليلي؛ لا تُعدّ إقرارًا بأن المصدر المقصود قد استُلم كما هو.', en: 'The provenance chain represents analytical working scope; it is never a claim that the intended source bytes were received unchanged.' }, locale))}</p>
  </section>`;
}

function revisionBody()         {
  const locale = currentLocale();
  const tone = (state        ) => (state === 'APPROVED' ? 'ok' : state === 'DRAFT' ? 'warn' : 'violet');
  const stateLabel = (state        ) => (state === 'APPROVED'
    ? { ar: 'معتمد', en: 'Approved' }
    : state === 'DRAFT'
      ? { ar: 'مسودّة', en: 'Draft' }
      : { ar: 'مستبدل', en: 'Superseded' });
  return `<section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">01</span>${L(RQ_LABELS.revisions, locale)}</h2>
      <span class="rq-block-note">${RQ_REVISIONS.length} ${esc(rqText({ ar: 'إصدارات مسجّلة', en: 'recorded revisions' }, locale))}</span>
    </div>
    <div class="rq-panel">
      <ul class="rq-plainlist">${RQ_REVISIONS.map(rev => `
        <li>
          <div>
            <h4>${token(rev.id)}<span class="rq-pill" data-tone="${tone(rev.state)}">${esc(rqText(stateLabel(rev.state), locale))}</span></h4>
            <p dir="auto">${L(rev.note, locale)}</p>
          </div>
          <div class="rq-kv">
            <div><dt>${esc(rqText({ ar: 'التاريخ', en: 'Date' }, locale))}</dt><dd>${token(rev.date)}</dd></div>
            <div><dt>${esc(rqText({ ar: 'الكاتب', en: 'Author' }, locale))}</dt><dd>${L(rev.author, locale)}</dd></div>
          </div>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function historyBody(state                  )         {
  const locale = currentLocale();
  return `<section class="rq-block">
    <div class="rq-block-head">
      <h2><span class="rq-idx">01</span>${L(RQ_LABELS.activity, locale)}</h2>
      <span class="rq-block-note">${state.activity.length} ${esc(rqText({ ar: 'حدث — تحليل عمل فقط', en: 'events — working analysis only' }, locale))}</span>
    </div>
    <div class="rq-panel">
      <ul class="rq-timeline">${state.activity.map(entry => `
        <li class="rq-event" data-tone="${entry.tone}">
          <time datetime="${esc(entry.at.replace(' ', 'T'))}">${token(entry.at)}</time>
          <p><b>${L(entry.actor, locale)}</b><span dir="auto">${L(entry.text, locale)}</span></p>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function centerHtml(state                  )         {
  const body = state.view === 'compare' ? compareBody(state)
    : state.view === 'claims' ? claimsBody(state)
      : state.view === 'provenance' ? provenanceBody()
        : state.view === 'revision' ? revisionBody()
          : historyBody(state);
  return `<div class="rq">${headHtml(state.view)}${body}</div>`;
}

/* --------------------------------------------------------------- left pane */

function leftHtml(state                  )         {
  const locale = currentLocale();
  return `<div class="rq rq-side" data-rq-region="LEFT">
    <section class="rq-scope">
      <p class="rq-eyebrow">${L(RQ_LABELS.activeReview, locale)}</p>
      <p class="rq-scope-title" dir="auto">${L(RQ_ACTIVE_REVIEW.title, locale)}</p>
      <p class="rq-scope-meta">${token(RQ_ACTIVE_REVIEW.id)} · ${L(RQ_ACTIVE_REVIEW.scope, locale)}</p>
      <div class="rq-scope-chips">
        <span class="rq-truth-chip" data-tone="working"><span class="rq-dot" aria-hidden="true"></span>${L(RQ_LABELS.workingAnalysis, locale)}</span>
        <span class="rq-truth-chip" data-tone="warn"><span class="rq-dot" aria-hidden="true"></span>${L(RQ_LABELS.saveUnavailable, locale)}</span>
      </div>
    </section>

    <nav class="rq-group" aria-label="${L(RQ_LABELS.investigations, locale)}">
      <h2 class="rq-group-head">${L(RQ_LABELS.investigations, locale)}<span class="rq-group-count">${RQ_PROJECTS.length}</span></h2>
      <ul class="rq-list">${RQ_PROJECTS.map(project => `
        <li><button type="button" class="rq-item" data-rq-action="select-project" data-project="${esc(project.id)}" data-state="${esc(project.state)}" aria-current="${project.active === true}">
          <span class="rq-item-dot" aria-hidden="true"></span>
          <span class="rq-item-body"><span class="rq-item-title" dir="auto">${L(project.name, locale)}</span><span class="rq-item-meta">${L(project.meta, locale)}</span></span>
          ${icon('chev')}
        </button></li>`).join('')}
      </ul>
    </nav>

    <nav class="rq-group" aria-label="${L(RQ_LABELS.reviewQueue, locale)}">
      <h2 class="rq-group-head">${L(RQ_LABELS.reviewQueue, locale)}<span class="rq-group-count">${RQ_QUEUE.reduce((sum, item) => sum + item.count, 0)}</span></h2>
      <ul class="rq-list">${RQ_QUEUE.map(item => `
        <li><button type="button" class="rq-item" data-rq-action="select-queue" data-queue="${esc(item.id)}" aria-current="${item.id === state.queueId}">
          <span class="rq-count" data-tone="${esc(item.tone)}">${item.count}</span>
          <span class="rq-item-body"><span class="rq-item-title" dir="auto">${L(item.label, locale)}</span><span class="rq-item-meta" dir="auto">${L(item.hint, locale)}</span></span>
          ${icon('chev')}
        </button></li>`).join('')}
      </ul>
    </nav>

    <p class="rq-footnote">${icon('lock')}<span>${L(RQ_LABELS.workingAnalysisHint, locale)}</span></p>
  </div>`;
}

/* -------------------------------------------------------------- right pane */

function contextTabPanel(state                  )         {
  const locale = currentLocale();
  const claim = state.claims.find(item => item.id === state.claimId) || state.claims[0];

  if (state.contextTab === 'attributes') {
    const rows                                   = [
      [rqText({ ar: 'معرّف الادعاء', en: 'Claim id' }, locale), claim.id, true],
      [rqText({ ar: 'الحالة', en: 'Status' }, locale), rqText(RQ_STATUS_LABEL[claim.status], locale), false],
      [rqText({ ar: 'درجة الثقة', en: 'Confidence' }, locale), pct(claim.confidence), false],
      [rqText({ ar: 'النطاق', en: 'Scope' }, locale), rqText(claim.scope, locale), false],
      [rqText({ ar: 'المرساة A', en: 'Anchor A' }, locale), claim.support.a || '—', true],
      [rqText({ ar: 'المرساة B', en: 'Anchor B' }, locale), claim.support.b || '—', true],
      [rqText({ ar: 'المسؤول', en: 'Owner' }, locale), claim.owner, true],
      [rqText({ ar: 'التعارضات', en: 'Recorded conflicts' }, locale), String(state.conflicts.length), true],
      [rqText({ ar: 'طلبات المصدر', en: 'Source requests' }, locale), String(state.requests.length), true]
    ];
    return `<div class="rq-ctx">${rows.map(([key, value, technical]) => `
      <div class="rq-ctx-section"><dl class="rq-kv"><div><dt>${esc(key)}</dt><dd>${technical ? token(value) : `<span dir="auto">${esc(value)}</span>`}</dd></div></dl></div>`).join('')}</div>`;
  }

  if (state.contextTab === 'marks') {
    return `<div class="rq-ctx">
      <section class="rq-ctx-section"><h3>${icon('list')}${esc(rqText({ ar: 'علامات التصنيف', en: 'Classification marks' }, locale))}</h3>
        <div class="rq-chip-row">${RQ_TAGS.map(tag => `<button type="button" class="rq-tag" data-tone="${esc(tag.tone)}" data-rq-action="filter-tag" data-tag="${esc(tag.id)}">${esc(tag.id)}</button>`).join('')}</div>
      </section>
      <section class="rq-ctx-section"><h3>${icon('warn')}${esc(rqText({ ar: 'علامات الحالة', en: 'Status marks' }, locale))}</h3>
        <div class="rq-chip-row">${(['SUPPORTED', 'QUALIFIED', 'NEEDS_REVIEW', 'CONFLICT']                   ).map(status => {
          const count = state.claims.filter(claim => claim.status === status).length;
          return `<span class="rq-pill" data-tone="${RQ_STATUS_TONE[status]}">${esc(rqText(RQ_STATUS_LABEL[status], locale))} · ${count}</span>`;
        }).join('')}</div>
      </section>
      <section class="rq-ctx-section"><h3>${icon('lock')}${esc(rqText({ ar: 'نطاق الحقيقة', en: 'Truth scope' }, locale))}</h3>
        <p class="rq-ctx-text">${L(RQ_LABELS.workingAnalysisHint, locale)}</p>
      </section>
    </div>`;
  }

  if (state.contextTab === 'order') {
    return `<div class="rq-ctx"><section class="rq-ctx-section"><h3>${icon('list')}${esc(rqText({ ar: 'خطوات المطابقة', en: 'Reconciliation steps' }, locale))}</h3>
      <ol class="rq-steps">${RQ_ORDER.map((step, index) => `
        <li class="rq-step" data-state="${esc(step.state)}">
          <span class="rq-step-num" aria-hidden="true">${step.state === 'done' ? icon('check') : index + 1}</span>
          <span class="rq-step-label" dir="auto">${L(step.label, locale)}</span>
          <span class="rq-pill" data-tone="${step.state === 'done' ? 'ok' : step.state === 'active' ? 'violet' : 'warn'}">${esc(step.state === 'done' ? rqText({ ar: 'منجز', en: 'Done' }, locale) : step.state === 'active' ? rqText({ ar: 'جارٍ', en: 'Active' }, locale) : rqText({ ar: 'لاحقًا', en: 'Pending' }, locale))}</span>
        </li>`).join('')}
      </ol>
    </section></div>`;
  }

  if (state.contextTab === 'history') {
    return `<div class="rq-ctx"><section class="rq-ctx-section"><h3>${icon('history')}${esc(rqText({ ar: 'أحدث الأحداث', en: 'Recent events' }, locale))}</h3>
      <ul class="rq-timeline">${state.activity.slice(0, 4).map(entry => `
        <li class="rq-event" data-tone="${entry.tone}"><time datetime="${esc(entry.at.replace(' ', 'T'))}">${token(entry.at)}</time><p><b>${L(entry.actor, locale)}</b><span dir="auto">${L(entry.text, locale)}</span></p></li>`).join('')}
      </ul>
    </section></div>`;
  }

  const relations = RQ_RELATIONS.map(relation => `
    <div class="rq-relation">
      <p>${icon('link')}<span dir="auto">${L(relation.label, locale)}</span></p>
      <button type="button" class="rq-linkbtn" data-rq-action="show-relation" data-relation="${esc(relation.id)}">${L(relation.action, locale)}</button>
    </div>`).join('');

  const notes = state.notes.length
    ? state.notes.map(note => `<p class="rq-ctx-text" style="margin-top:8px" dir="auto">${L(note, locale)}</p>`).join('')
    : '';

  return `<div class="rq-ctx">
    <section class="rq-ctx-section">
      <h3>${icon('check')}${L(RQ_CLAIM_LINKAGE.label, locale)}</h3>
      <div class="rq-ctx-headline">${icon('shield')}<strong>${L(RQ_CLAIM_LINKAGE.headline, locale)}</strong><span class="rq-token">${token(RQ_CLAIM_LINKAGE.state)}</span></div>
      <p class="rq-ctx-text">${L(RQ_CLAIM_LINKAGE.detail, locale)}</p>
    </section>
    <section class="rq-ctx-section">
      <h3>${icon('link')}${esc(rqText({ ar: 'العلاقات المرتبطة', en: 'Related relations' }, locale))}</h3>
      ${relations}
    </section>
    <section class="rq-ctx-section">
      <h3>${icon('history')}${L(RQ_REVIEW_NOTE.label, locale)}</h3>
      <p class="rq-ctx-text">${L(RQ_REVIEW_NOTE.text, locale)}</p>${notes}
      <p class="rq-ctx-text" style="color:var(--text3);font-size:var(--rq-t-micro);margin-top:8px">${L(RQ_REVIEW_NOTE.lastLabel, locale)} ${token(RQ_REVIEW_NOTE.lastDate)}</p>
    </section>
    <section class="rq-ctx-section">
      <h3>${icon('code')}${esc(rqText({ ar: 'التوثيق والمراجع', en: 'Documentation & references' }, locale))}</h3>
      ${RQ_REFERENCES.map(ref => `<div class="rq-ref"><span class="rq-token" dir="ltr">${esc(ref.id)}</span><span>${L(ref.label, locale)}</span></div>`).join('')}
      <button type="button" class="rq-linkbtn" data-rq-action="open-knowledge">${icon('link')}${esc(rqText({ ar: 'فتح المعرفة الشاملة', en: 'Open knowledge base' }, locale))}</button>
    </section>
    <section class="rq-ctx-section">
      <h3>${icon('list')}${esc(rqText({ ar: 'الأدوات', en: 'Tools' }, locale))}</h3>
      <div class="rq-chip-row">${RQ_TAGS.map(tag => `<button type="button" class="rq-tag" data-tone="${esc(tag.tone)}" data-rq-action="filter-tag" data-tag="${esc(tag.id)}">${esc(tag.id)}</button>`).join('')}</div>
    </section>
  </div>`;
}

function rightHtml(state                  )         {
  const locale = currentLocale();
  return `<div class="rq" data-rq-region="RIGHT">
    <div class="rq-tabs" role="tablist" aria-label="${L(RQ_LABELS.context, locale)}">
      ${RQ_CONTEXT_TABS.map(tab => `<button type="button" class="rq-tab" role="tab" id="rq-tab-${tab}" aria-selected="${tab === state.contextTab}" aria-controls="rq-tabpanel" data-rq-action="context-tab" data-tab="${tab}">${L(RQ_CONTEXT_TAB_LABEL[tab], locale)}</button>`).join('')}
    </div>
    <div class="rq-tabpanel" role="tabpanel" id="rq-tabpanel" aria-labelledby="rq-tab-${state.contextTab}">${contextTabPanel(state)}</div>
  </div>`;
}

/* ------------------------------------------------------------------ bottom */

function bottomHtml(state                  )         {
  const locale = currentLocale();
  return `<div class="rq rq-bottom-body" data-rq-region="BOTTOM">
    <ul class="rq-timeline">${state.activity.slice(0, 6).map(entry => `
      <li class="rq-event" data-tone="${entry.tone}"><time datetime="${esc(entry.at.replace(' ', 'T'))}">${token(entry.at)}</time><p><b>${L(entry.actor, locale)}</b><span dir="auto">${L(entry.text, locale)}</span></p></li>`).join('')}
    </ul>
    <p class="rq-empty">${esc(rqText({ ar: 'السجل محلّي داخل جلسة المتصفح فقط؛ لا يُكتب في تتبّع تطبيقي ولا يُعدّ قرار مراجعة.', en: 'The trace is local to this browser session only; it is not written to the application trace and is not a review decision.' }, locale))}</p>
  </div>`;
}

/* -------------------------------------------------------------- controller */

let rqState                   = createRqWorkspaceState();
let rqRuntime                                                              = null;
let rqLocale           = 'ar';
let rqStage                     = null;
let rqWorkspace      = null;
let rqRegistry      = null;
let rqListenerBound = false;

export function currentLocale()           {
  return rqLocale;
}

function readLocale()           {
  try {
    const lang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('ar')) return 'ar';
  } catch { /* keep last known locale */ }
  return rqLocale;
}

const RQ_COMMAND_IDS           = [
  ...RQ_VIEW_IDS.map(id => `rq.view.${id}`),
  ...RQ_ACTIONS.map(id => `rq.action.${id}`)
];

/** Command labels are single strings in the registry — re-sync them on every locale change. */
function syncCommandLabels(locale          )       {
  const map = rqRegistry?.commands;
  if (!(map instanceof Map)) return;
  RQ_VIEW_IDS.forEach(view => {
    const command = map.get(`rq.view.${view}`);
    if (command && command.owner === 'W02RqWorkspaceComposer') command.label = rqText(RQ_VIEW_LABEL[view], locale);
  });
  RQ_ACTIONS.forEach(action => {
    const command = map.get(`rq.action.${action}`);
    if (command && command.owner === 'W02RqWorkspaceComposer') command.label = rqText(RQ_ACTION_LABEL[action], locale);
  });
  const domainLabels                         = {
    'rq.search': { ar: 'بحث مصادر البحث والجودة', en: 'Search RQ sources' },
    'rq.compare': { ar: 'مقارنة إصدارات المصدر الدقيقة', en: 'Compare exact RQ revisions' },
    'rq.review': { ar: 'مراجعة التحليل الجاري', en: 'Review working analysis' },
    'rq.provenance': { ar: 'فحص سلسلة التوثيق', en: 'Inspect RQ provenance' }
  };
  Object.entries(domainLabels).forEach(([id, label]) => {
    const command = map.get(id);
    if (command) command.label = rqText(label, locale);
  });
}

function captureFocus()                {
  const element = document.activeElement                      ;
  if (!element?.dataset) return null;
  if (element.dataset.foundationCommand) return `[data-foundation-command="${CSS.escape(element.dataset.foundationCommand)}"]`;
  if (element.dataset.rqCommand) return `[data-rq-command="${CSS.escape(element.dataset.rqCommand)}"]`;
  if (element.dataset.rqAction) {
    const parts = [`[data-rq-action="${CSS.escape(element.dataset.rqAction)}"]`];
    ['claim', 'queue', 'tab', 'project', 'tag', 'relation', 'slot', 'anchor'].forEach(key => {
      const value = (element.dataset                                      )[key];
      if (value) parts.push(`[data-${key}="${CSS.escape(value)}"]`);
    });
    return parts.join('');
  }
  return null;
}

function restoreFocus(selector               )       {
  if (!selector) return;
  try {
    const requested = document.querySelector             (selector);
    if (!requested) return;
    // An action can disable the control the user just activated; keep the keyboard user in the
    // same control group instead of dropping focus to <body>.
    let target = requested;
    if (target.disabled && target.parentElement) {
      const siblings = [...target.parentElement.querySelectorAll('button')]                 ;
      const index = siblings.indexOf(target);
      const enabled = siblings.filter(button => !button.disabled);
      const after = siblings.slice(index + 1).find(button => !button.disabled);
      const before = siblings.slice(0, index).reverse().find(button => !button.disabled);
      target = after || before || enabled[0] || target;
      if (target.disabled) return;
    }
    target.focus({ preventScroll: true });
  } catch { /* selector was best effort */ }
}

function syncToolbar()       {
  if (!rqWorkspace?.refreshToolbar) return;
  rqWorkspace.refreshToolbar();
  const host = document.querySelector('#domainToolbar');
  if (!host) return;
  RQ_VIEW_IDS.forEach(view => {
    const button = host.querySelector             (`[data-foundation-command="rq.view.${view}"]`);
    if (button) button.setAttribute('aria-pressed', String(view === rqState.view));
  });
}

function renderCenter()       {
  if (!rqStage) return;
  rqStage.innerHTML = centerHtml(rqState);
}

function renderRegions()       {
  if (!rqWorkspace?.region) return;
  const locale = rqLocale;
  rqWorkspace.region('LEFT', { html: leftHtml(rqState), label: rqText(RQ_LABELS.surface, locale) });
  rqWorkspace.region('RIGHT', { html: rightHtml(rqState), label: rqText(RQ_LABELS.context, locale) });
  rqWorkspace.region('BOTTOM', {
    html: bottomHtml(rqState),
    label: rqText({ ar: 'أثر المطابقة', en: 'Reconciliation trace' }, locale),
    summary: rqText({
      ar: `${rqState.activity.length} حدثًا في تحليل العمل · القرارات غير المحسومة: ${rqState.conflicts.length}`,
      en: `${rqState.activity.length} working-analysis events · unsettled decisions: ${rqState.conflicts.length}`
    }, locale)
  });
}

function renderAll(focusHint         )       {
  const focus = focusHint?.startsWith('rq.view.')
    ? `[data-foundation-command="${CSS.escape(focusHint)}"]`
    : focusHint?.startsWith('rq.action.')
      ? `[data-rq-command="${CSS.escape(focusHint)}"]`
      : (focusHint ?? captureFocus());
  renderCenter();
  renderRegions();
  syncToolbar();
  restoreFocus(focus);
}

function logActivity(text        , tone                                   )       {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  rqState.activity = [{ at: stamp, actor: { ar: 'أنت', en: 'You' }, text, tone }, ...rqState.activity];
}

function applyAction(action            )       {
  const locale = rqLocale;
  const claim = rqState.claims.find(item => item.id === rqState.claimId);
  if (action === 'requestSource') {
    rqState.requests = [...rqState.requests, rqState.claimId];
    logActivity({ ar: `طُلب مصدر ثانٍ للادعاء ${rqState.claimId}.`, en: `A second source was requested for claim ${rqState.claimId}.` }, 'neutral');
    rqWorkspace?.status?.(rqText({ ar: 'طلب المصدر مسجّل في تحليل العمل — غير مُلزم ولا محفوظ.', en: 'Source request recorded as working analysis — non-binding and not persisted.' }, locale), 'info');
  } else if (action === 'embedReview') {
    rqState.notes = [...rqState.notes, {
      ar: `ملاحظة مراجعة ${rqState.claimId}: الدعم مقبول ضمن نطاق المطابقة الحالية.`,
      en: `Review note ${rqState.claimId}: support accepted within the current reconciliation scope.`
    }];
    logActivity({ ar: `أُدرجت ملاحظة مراجعة في ${rqState.claimId}.`, en: `A review note was embedded into ${rqState.claimId}.` }, 'neutral');
    rqWorkspace?.status?.(rqText({ ar: 'أُدرجت الملاحظة في السياق — مسودّة عمل فقط.', en: 'Note embedded into the context — working draft only.' }, locale), 'info');
  } else if (claim) {
    if (action === 'accept') {
      claim.status = 'SUPPORTED';
      claim.confidence = Math.max(claim.confidence, 0.9);
      logActivity({ ar: `قُبل دعم ${claim.id} ضمن المطابقة الحالية.`, en: `Support for ${claim.id} accepted within this reconciliation.` }, 'ok');
      rqWorkspace?.status?.(rqText({ ar: `قُبل دعم ${claim.id} في تحليل العمل — لا يُعدّ قرارًا رسميًا.`, en: `${claim.id} support accepted as working analysis — not a formal decision.` }, locale), 'info');
    } else if (action === 'confirm') {
      rqState.confirmed = [...new Set([...rqState.confirmed, claim.id])];
      logActivity({ ar: `صُدّقت صياغة الادعاء ${claim.id}.`, en: `Claim ${claim.id} wording confirmed.` }, 'ok');
      rqWorkspace?.status?.(rqText({ ar: `صُدّقت صياغة ${claim.id} — التصويت غير مُطبَّق.`, en: `${claim.id} wording confirmed — the vote is not applied.` }, locale), 'info');
    } else if (action === 'conflict') {
      claim.status = 'CONFLICT';
      claim.confidence = Math.min(claim.confidence, 0.55);
      rqState.conflicts = [...new Set([...rqState.conflicts, claim.id])];
      logActivity({ ar: `رُفِع تعارض في ${claim.id} بين ${claim.support.a || '—'} و${claim.support.b || '—'}.`, en: `Conflict raised on ${claim.id} between ${claim.support.a || '—'} and ${claim.support.b || '—'}.` }, 'bad');
      rqWorkspace?.status?.(rqText({ ar: `تعارض مسجّل في ${claim.id} — يبقى الإصدار المعتمد ${RQ_REVIEW_RESULT.approved.version}.`, en: `Conflict recorded on ${claim.id} — ${RQ_REVIEW_RESULT.approved.version} stays approved.` }, locale), 'info');
    }
  }
}

function commandAvailability(action            )                                                               {
  const claim = rqState.claims.find(item => item.id === rqState.claimId);
  const base = { enabled: true, code: 'AVAILABLE', reason: '' };
  if (action === 'accept') {
    if (!claim) return { enabled: false, code: 'RQ_NO_CLAIM_SELECTED', reason: 'Select a claim first.' };
    if (claim.support.a && claim.support.b && claim.status === 'SUPPORTED') return { enabled: false, code: 'RQ_CLAIM_ALREADY_SUPPORTED', reason: `${claim.id} is already supported by both sources.` };
    if (!claim.support.b) return { enabled: false, code: 'RQ_SECONDARY_SUPPORT_MISSING', reason: `${claim.id} has no source B anchor; request a source first.` };
    return base;
  }
  if (action === 'confirm') {
    if (!claim) return { enabled: false, code: 'RQ_NO_CLAIM_SELECTED', reason: 'Select a claim first.' };
    if (rqState.confirmed.includes(claim.id)) return { enabled: false, code: 'RQ_CLAIM_ALREADY_CONFIRMED', reason: `${claim.id} is already confirmed in this working session.` };
    return base;
  }
  if (action === 'conflict') {
    if (!claim) return { enabled: false, code: 'RQ_NO_CLAIM_SELECTED', reason: 'Select a claim first.' };
    if (rqState.conflicts.includes(claim.id)) return { enabled: false, code: 'RQ_CLAIM_ALREADY_CONFLICTING', reason: `${claim.id} already carries a recorded conflict.` };
    return base;
  }
  if (action === 'requestSource') {
    if (!claim) return { enabled: false, code: 'RQ_NO_CLAIM_SELECTED', reason: 'Select a claim first.' };
    if (claim.support.a && claim.support.b) return { enabled: false, code: 'RQ_CLAIM_ALREADY_TWO_SOURCED', reason: `${claim.id} already rests on two pinned sources.` };
    return base;
  }
  return base;
}

function bindDocumentListener()       {
  if (rqListenerBound) return;
  rqListenerBound = true;
  document.addEventListener('click', event => {
    if (!rqStage) return;
    const target = event.target                  ;
    const control = target?.closest             ('[data-rq-action],[data-rq-command]');
    if (!control) return;
    if (!document.contains(rqStage)) return;
    event.preventDefault();
    if (control.dataset.rqCommand) {
      const id = control.dataset.rqCommand;
      try {
        const result = rqRegistry?.execute?.(id, { route: 'rq-work-area', invoker: control, claimId: rqState.claimId });
        if (result?.ok === false) rqWorkspace?.status?.(String(result.reason || result.code || 'Action unavailable'), 'error');
      } catch (error) { rqWorkspace?.status?.(String((error         )?.message || error), 'error'); }
      return;
    }
    const action = control.dataset.rqAction;
    const locale = rqLocale;
    if (action === 'select-claim') {
      rqState.claimId = control.dataset.claim || rqState.claimId;
      renderAll();
    } else if (action === 'select-queue') {
      rqState.queueId = control.dataset.queue || rqState.queueId;
      rqState.contextTab = 'overview';
      renderAll();
      const detail = RQ_QUEUE_DETAIL[rqState.queueId];
      if (detail) rqWorkspace?.status?.(rqText(detail.advice, locale), 'info');
    } else if (action === 'select-project') {
      rqWorkspace?.status?.(rqText({
        ar: 'التحويل بين التحقيقات محلّي في هذه الجلسة؛ المراجعة الجارية تبقى REV-SQLI-014.',
        en: 'Switching investigations is local to this session; REV-SQLI-014 stays the active review.'
      }, locale), 'info');
    } else if (action === 'context-tab') {
      rqState.contextTab = (control.dataset.tab                ) || rqState.contextTab;
      renderAll();
    } else if (action === 'open-anchor') {
      rqWorkspace?.status?.(rqText({
        ar: `المرساة ${control.dataset.anchor} — المؤشر يعمل ضمن نطاق التحليل المحلي ولا ينقل خارج التطبيق.`,
        en: `Anchor ${control.dataset.anchor} — the locator resolves inside local analysis scope only.`
      }, locale), 'info');
    } else if (action === 'source-menu') {
      const rect = control.getBoundingClientRect();
      rqWorkspace?.menu?.(RQ_TOOLBAR_ORDER.concat(['rq.provenance']), rect.left, rect.bottom + 4);
    } else if (action === 'claim-menu') {
      const rect = control.getBoundingClientRect();
      const claimId = control.dataset.claim || rqState.claimId;
      rqState.claimId = claimId;
      rqWorkspace?.menu?.(['rq.action.accept', 'rq.action.confirm', 'rq.action.conflict', 'rq.action.requestSource', 'rq.action.embedReview'], rect.left, rect.bottom + 4);
      renderAll();
    } else if (action === 'show-relation') {
      rqWorkspace?.status?.(rqText({
        ar: 'العلاقات المرتبطة تُعرض من مالك العلاقات المشترك؛ لا تُستنسخ هنا.',
        en: 'Related relations are shown by the shared relation owner; they are not duplicated here.'
      }, locale), 'info');
    } else if (action === 'filter-tag') {
      rqState.view = 'claims';
      renderAll('rq.view.claims');
      rqWorkspace?.status?.(rqText({ ar: `فُتح سجل الادعاءات لعلامة ${control.dataset.tag}.`, en: `Claim register opened for the ${control.dataset.tag} mark.` }, locale), 'info');
    } else if (action === 'open-knowledge') {
      rqWorkspace?.status?.(rqText({ ar: 'المعرفة الشاملة تُفتح من المكتبة؛ الانتقال مملوك للواجهة العامة.', en: 'The knowledge base opens from Library; the transition is owned by the global shell.' }, locale), 'info');
    }
  }, true);
}

/** Register the surface-owned commands into the shared CommandRegistry. */
export function registerRqWorkspaceCommands(registry     )           {
  if (!registry?.register) return [];
  const has = (id        ) => registry.commands instanceof Map && registry.commands.has(id);
  const ids           = [];
  const add = (id        , owner        , label        , run                           , available                             ) => {
    if (has(id)) { ids.push(id); return; }
    registry.register(id, owner, label, run, available);
    ids.push(id);
  };

  RQ_VIEW_IDS.forEach(view => {
    add(`rq.view.${view}`, 'W02RqWorkspaceComposer', rqText(RQ_VIEW_LABEL[view], rqLocale), () => {
      rqState.view = view;
      renderAll(`rq.view.${view}`);
      return { ok: true, status: 'RQ_VIEW', view, persisted: false, formalReview: false };
    });
  });

  RQ_ACTIONS.forEach(action => {
    add(`rq.action.${action}`, 'W02RqWorkspaceComposer', rqText(RQ_ACTION_LABEL[action], rqLocale), () => {
      applyAction(action);
      renderAll(`rq.action.${action}`);
      return { ok: true, status: 'RQ_WORKING_ACTION', action, persisted: false, formalReview: false, canonicalMutation: false };
    }, () => {
      const availability = commandAvailability(action);
      if (availability === true) return true;
      return availability;
    });
  });

  return ids;
}

function mountCrumbs()       {
  const crumbs = document.querySelector('#topBanner .crumbs');
  if (!crumbs) return;
  const locale = rqLocale;
  const leaf = locale === 'ar' ? 'مراجعة المصادر والادعاءات' : 'Source & claim reconciliation';
  const area = locale === 'ar' ? RQ_LABELS.area.ar : RQ_LABELS.area.en;
  const surface = locale === 'ar' ? RQ_LABELS.surface.ar : RQ_LABELS.surface.en;
  crumbs.innerHTML = `<span>${esc(area)}</span><span aria-hidden="true">›</span><span>${esc(surface)}</span><span aria-hidden="true">›</span><bdi dir="ltr">${esc(RQ_ACTIVE_REVIEW.id)}</bdi><span class="sr">${esc(leaf)}</span>`;
}

/**
 * Compose the RQ workspace into the shared pane hosts.
 * Idempotent: safe to call again after a state or locale change.
 */
export function mountRqWorkspace(options                                                                       )       {
  const { stage, workspace, registry, adapter } = options;
  if (!stage || !workspace) return;
  ensureStyle();
  rqStage = stage;
  rqWorkspace = workspace;
  rqRegistry = registry;
  rqRuntime = adapter && typeof adapter.descriptor === 'function' ? adapter : null;
  rqLocale = readLocale();
  stage.classList.add('rq-stage');
  stage.dataset.rqSurface = 'rq.source-claim-reconciliation';
  if (registry) {
    registerRqWorkspaceCommands(registry);
    syncCommandLabels(rqLocale);
  }
  bindDocumentListener();
  // Language + direction are user-configurable in Settings; follow the preference seam.
  if (typeof workspace.onPreferences !== 'function' || !workspace.onPreferences.__rqWrapped) {
    const previous = typeof workspace.onPreferences === 'function' ? workspace.onPreferences : null;
    const wrapped = function (preferences     ) {
      try { previous?.(preferences); } catch { /* prior hook must not block rq refresh */ }
      refreshRqWorkspace();
    };
    wrapped.__rqWrapped = true;
    workspace.onPreferences = wrapped;
  }
  mountCrumbs();
  renderAll();
  workspace.toolbar?.(RQ_TOOLBAR_ORDER, { contextProvider: () => ({ route: 'rq-reconciliation', surface: 'rq', claimId: rqState.claimId, view: rqState.view, workingAnalysisId: RQ_ACTIVE_REVIEW.id }) });
  syncToolbar();
  workspace.status?.(
    rqText({
      ar: `تحليل عمل · ${RQ_ACTIVE_REVIEW.id} · بلا صلاحية مراجعة رسمية · الحفظ الدائم غير متاح`,
      en: `Working analysis · ${RQ_ACTIVE_REVIEW.id} · no formal review authority · durable save unavailable`
    }, rqLocale),
    'info'
  );
}

/** Re-render after the active language/direction preference changed. */
export function refreshRqWorkspace()       {
  if (!rqStage || !document.contains(rqStage)) return;
  const next = readLocale();
  if (next !== rqLocale) {
    rqLocale = next;
    if (rqRegistry) syncCommandLabels(rqLocale);
  }
  mountCrumbs();
  renderAll();
  if (rqWorkspace?.refreshToolbar) rqWorkspace.refreshToolbar();
}

export function rqWorkspaceState()                   { return rqState; }
export function rqRegistryOwner()         { return 'W02RqWorkspaceComposer'; }
export const RQ_COMPOSITION_OWNER = 'W02RqWorkspaceComposer';
export { rqRegistry as rqCommandRegistry };
