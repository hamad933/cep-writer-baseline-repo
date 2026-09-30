/**
 * W03-LABS · surface style system.
 *
 * One scoped stylesheet for the Labs workbench: a 6-step type scale, a 4/8/12/16/24 spacing
 * scale, a 7/10/12 radius set and one accent mapping (accent = authoring focus, ok = published/
 * ready, warn = draft attention, bad = blocked). Every rule uses logical properties so RTL and
 * LTR mirror from a single markup path.
 *
 * Nothing here touches a shared stylesheet: shared components keep governing mechanics, this
 * file governs local presentation inside them.
 */
                                         

const STYLE=`
/* The shared structured-spatial host normally draws its own card. Labs neutralises that shell
   locally (surface-owned inline presentation inside a shared host — no shared file edited) so
   the workbench sits on the workspace surface exactly as the reference does. */
#m0StructuredSpatial.m0-structured-spatial{display:flex;flex-direction:column;padding:12px;border:0;border-radius:0;background:transparent;min-width:0;min-height:0}
.w03l{position:relative;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;flex:1 1 auto;min-block-size:0;box-sizing:border-box;color:var(--text);font:400 12.5px/1.45 var(--ui,system-ui,sans-serif)}
.w03l *{box-sizing:border-box}
.w03l :is(button,a,select,input):focus-visible{outline:2px solid var(--focus,var(--accent));outline-offset:1px}

/* ---------------------------------------------------------------- action row (palette + lifecycle) */
.w03l-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;background:var(--bg1,#141a20);border:1px solid var(--line,#2a333b);border-radius:10px}
.w03l-group{display:flex;align-items:center;gap:6px;min-width:0}
.w03l-group-end{margin-inline-start:auto}
.w03l-sep{inline-size:1px;block-size:18px;background:var(--line,#2a333b);flex:none}
.w03l-btn{display:inline-flex;align-items:center;gap:6px;min-block-size:30px;padding:0 10px;border:1px solid var(--line2,#3a464f);border-radius:7px;background:var(--bg2,#1b2228);color:var(--text2,#c3ccd2);font:600 12px/1 var(--ui,system-ui,sans-serif);cursor:pointer;white-space:nowrap;transition:border-color .12s ease,color .12s ease,background-color .12s ease}
.w03l-btn:hover:not(:disabled){border-color:color-mix(in srgb,var(--accent,#4cc2ff) 55%,var(--line2,#3a464f));color:var(--text,#eef2f4)}
.w03l-btn:disabled{opacity:.42;cursor:not-allowed}
.w03l-btn[aria-pressed=true]{border-color:color-mix(in srgb,var(--accent,#4cc2ff) 62%,transparent);background:color-mix(in srgb,var(--accent,#4cc2ff) 14%,var(--bg2,#1b2228));color:var(--accent2,#8fd8ff)}
.w03l-btn[data-primary=true]{border-color:color-mix(in srgb,var(--accent,#4cc2ff) 62%,var(--line2,#3a464f));background:color-mix(in srgb,var(--accent,#4cc2ff) 16%,var(--bg2,#1b2228));color:var(--accent2,#8fd8ff)}
.w03l-btn .ico{flex:none;opacity:.9}
.w03l-menuwrap{position:relative}
.w03l-menu{position:absolute;inset-inline-end:0;top:calc(100% + 5px);z-index:40;min-inline-size:210px;padding:5px;background:var(--elev,#1e262d);border:1px solid var(--line2,#3a464f);border-radius:9px;box-shadow:0 12px 30px rgba(0,0,0,.36);display:grid;gap:2px}
.w03l-menu[hidden]{display:none}
.w03l-menu button{display:flex;align-items:center;gap:8px;inline-size:100%;min-block-size:30px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--text2,#c3ccd2);font:500 12px/1 var(--ui);text-align:start;cursor:pointer}
.w03l-menu button:hover{background:color-mix(in srgb,var(--accent,#4cc2ff) 10%,transparent);color:var(--text,#eef2f4)}

/* ---------------------------------------------------------------- board */
.w03l-board{display:grid;grid-template-rows:auto auto minmax(260px,1fr) auto;min-block-size:0;background:var(--bg1,#141a20);border:1px solid var(--line,#2a333b);border-radius:12px;overflow:hidden}
.w03l-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:15px 16px 6px}
.w03l-head h2{margin:0;font:650 19px/1.25 var(--ui);letter-spacing:-.01em;color:var(--text,#eef2f4)}
.w03l-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border:1px solid var(--line2,#3a464f);border-radius:999px;background:color-mix(in srgb,var(--bg2,#1b2228) 70%,transparent);color:var(--text2,#c3ccd2);font:600 11px/1.3 var(--ui)}
.w03l-pill[data-tone=ok]{border-color:color-mix(in srgb,var(--ok,#34d399) 48%,var(--line2));color:var(--ok,#34d399);background:color-mix(in srgb,var(--ok,#34d399) 10%,transparent)}
.w03l-pill[data-tone=accent]{border-color:color-mix(in srgb,var(--accent,#4cc2ff) 50%,var(--line2));color:var(--accent2,#8fd8ff);background:color-mix(in srgb,var(--accent,#4cc2ff) 11%,transparent)}
.w03l-pill[data-tone=warn]{border-color:color-mix(in srgb,var(--warn,#fbbf24) 48%,var(--line2));color:var(--warn,#fbbf24);background:color-mix(in srgb,var(--warn,#fbbf24) 10%,transparent)}
.w03l-headmeta{margin-inline-start:auto;font:600 11px/1.3 var(--mono,ui-monospace,monospace);color:var(--text3,#8b979e);white-space:nowrap}
.w03l-purpose{margin:0;padding:0 16px 13px;font:400 12.5px/1.55 var(--ui);color:var(--text2,#c3ccd2);max-inline-size:96ch}
.w03l-purpose b{color:var(--text3,#8b979e);font-weight:600}

/* ---------------------------------------------------------------- graph canvas */
.w03l-canvas{position:relative;min-block-size:260px;border-block-start:1px solid var(--line,#2a333b);background-color:var(--bg0,#0e1317);background-image:radial-gradient(circle,color-mix(in srgb,var(--accent,#4cc2ff) 30%,transparent) 1px,transparent 1.4px);background-size:24px 24px;overflow:hidden}
.w03l-canvas .spatial-shell{position:absolute;inset:0}
.w03l-canvas .spatial-canvas{background:radial-gradient(circle at 80% 8%,color-mix(in srgb,var(--accent,#4cc2ff) 10%,transparent),transparent 46%)}
.w03l-canvas .spatial-legend{display:none}
.w03l-canvas .minimap{opacity:.72;inline-size:118px;block-size:74px;bottom:34px}
.w03l-canvas .spatial-readout{font:600 10.5px/1 var(--mono);letter-spacing:.02em}
.w03l-canvas .spatial-node-card .node-surface{fill:color-mix(in srgb,var(--bg2,#1b2228) 92%,var(--bg0,#0e1317));transition:stroke-width .12s ease,filter .12s ease}
/* Labs node card geometry (surface-owned inline presentation inside the shared Spatial owner):
   176×104 is the reference's card proportion — a title line (or two), a description line (or
   two) and a chip row all inside the card. The shared 132×62 default forced authored task titles
   to overflow onto the neighbour and the connector labels. */
.w03l-canvas .spatial-node-card .node-surface{width:156px;height:104px;rx:12}
.w03l-canvas .spatial-node-card .node-tags{transform:translateY(30px)}
.w03l-canvas .spatial-node-card .node-title{font-size:11.5px;font-weight:650}
.w03l-canvas .spatial-node-card .node-secondary-line{font-size:8.5px;fill:var(--text3,#8b979e)}
.w03l-canvas .spatial-node-card .node-id-chip{font-weight:700;letter-spacing:.04em}
.w03l-canvas .spatial-node-card:hover .node-surface{filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))}
.w03l-canvas .spatial-node-card .node-icon-tile rect{rx:6}
.w03l-canvas .spatial-node-card .node-icon-tile text{font-weight:800;font-size:10px}
.w03l-canvas .spatial-node-card[data-node-kind=objective] .node-surface{stroke:#10b981}
.w03l-canvas .spatial-node-card[data-node-kind=objective] .node-icon-tile rect{fill:color-mix(in srgb,#10b981 20%,var(--bg0));stroke:color-mix(in srgb,#10b981 62%,var(--line2))}
.w03l-canvas .spatial-node-card[data-node-kind=objective] .node-icon-tile text{fill:#34d399}
.w03l-canvas .spatial-node-card[data-node-kind=action] .node-surface{stroke:#3b82f6}
.w03l-canvas .spatial-node-card[data-node-kind=action] .node-icon-tile rect{fill:color-mix(in srgb,#3b82f6 20%,var(--bg0));stroke:color-mix(in srgb,#3b82f6 62%,var(--line2))}
.w03l-canvas .spatial-node-card[data-node-kind=action] .node-icon-tile text{fill:#60a5fa}
.w03l-canvas .spatial-node-card[data-node-kind=check] .node-surface{stroke:#a78bfa}
.w03l-canvas .spatial-node-card[data-node-kind=check] .node-icon-tile rect{fill:color-mix(in srgb,#a78bfa 20%,var(--bg0));stroke:color-mix(in srgb,#a78bfa 62%,var(--line2))}
.w03l-canvas .spatial-node-card[data-node-kind=check] .node-icon-tile text{fill:#c4b5fd}
.w03l-canvas .spatial-node-card[data-node-kind=interpret] .node-surface{stroke:#14b8a6}
.w03l-canvas .spatial-node-card[data-node-kind=interpret] .node-icon-tile rect{fill:color-mix(in srgb,#14b8a6 20%,var(--bg0));stroke:color-mix(in srgb,#14b8a6 62%,var(--line2))}
.w03l-canvas .spatial-node-card[data-node-kind=interpret] .node-icon-tile text{fill:#5eead4}
.w03l-canvas .spatial-node-card[data-node-kind=evidence] .node-surface{stroke:#f59e0b}
.w03l-canvas .spatial-node-card[data-node-kind=evidence] .node-icon-tile rect{fill:color-mix(in srgb,#f59e0b 20%,var(--bg0));stroke:color-mix(in srgb,#f59e0b 62%,var(--line2))}
.w03l-canvas .spatial-node-card[data-node-kind=evidence] .node-icon-tile text{fill:#fbbf24}
.w03l-canvas .spatial-node-card[aria-pressed=true] .node-surface{stroke:var(--accent);stroke-width:3;filter:drop-shadow(0 0 0 3px color-mix(in srgb,var(--accent) 26%,transparent))}

/* ---------------------------------------------------------------- board footer: legend + state */
.w03l-foot{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:11px 14px;border-block-start:1px solid var(--line,#2a333b);background:var(--bg2,#1b2228)}
.w03l-legend{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.w03l-legend-title{font:700 11px/1 var(--ui);letter-spacing:.05em;color:var(--text,#eef2f4)}
.w03l-key{display:inline-flex;align-items:center;gap:7px;font:500 11.5px/1 var(--ui);color:var(--text2,#c3ccd2);white-space:nowrap}
.w03l-key i{position:relative;display:block;inline-size:26px;block-size:0;border-block-start:2px solid color-mix(in srgb,var(--accent,#4cc2ff) 70%,var(--text3,#8b979e))}
.w03l-key i.dash{border-block-start-style:dashed}
.w03l-key i.dot::after{content:"";position:absolute;inset-inline-end:-3px;top:-4px;inline-size:7px;block-size:7px;border:2px solid color-mix(in srgb,var(--accent,#4cc2ff) 70%,var(--text3,#8b979e));border-radius:50%;background:var(--bg2,#1b2228)}
.w03l-status{margin-inline-start:auto;display:inline-flex;align-items:center;gap:7px;font:600 11.5px/1.3 var(--ui);color:var(--text2,#c3ccd2)}
.w03l-status::before{content:"";inline-size:7px;block-size:7px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 22%,transparent)}
.w03l-status[data-tone=ok]{color:var(--ok,#34d399)}
.w03l-status[data-tone=warn]{color:var(--warn,#fbbf24)}
.w03l-status[data-tone=error]{color:var(--bad,#f87171)}
.w03l-status[data-tone=accent]{color:var(--accent2,#8fd8ff)}

/* ---------------------------------------------------------------- LEFT: Lab Structure */
.w03l-struct{padding-block-end:12px}
.w03l-struct-head{display:flex;align-items:center;gap:8px;padding:13px 12px 9px}
.w03l-struct-head h3{margin:0;font:700 13px/1.2 var(--ui);color:var(--text,#eef2f4)}
.w03l-count{margin-inline-start:auto;min-inline-size:20px;padding:2px 6px;border-radius:999px;background:color-mix(in srgb,var(--accent,#4cc2ff) 16%,transparent);color:var(--accent2,#8fd8ff);font:700 10.5px/1.3 var(--mono)}
.w03l-nav{display:grid;gap:2px;padding-inline:8px}
.w03l-navitem{inline-size:100%;display:grid;grid-template-columns:17px minmax(0,1fr) auto;align-items:center;gap:9px;padding:7px 9px;border:0;border-radius:7px;background:transparent;color:var(--text2,#c3ccd2);font:500 12.5px/1.3 var(--ui);text-align:start;cursor:pointer}
.w03l-navitem .ico{color:var(--text3,#8b979e)}
.w03l-navitem:hover{background:color-mix(in srgb,var(--accent,#4cc2ff) 8%,transparent);color:var(--text,#eef2f4)}
.w03l-navitem:hover .ico{color:var(--accent2,#8fd8ff)}
.w03l-navitem[aria-current=true]{background:color-mix(in srgb,var(--accent,#4cc2ff) 13%,transparent);color:var(--text,#eef2f4);font-weight:650;box-shadow:inset 2px 0 0 var(--accent,#4cc2ff)}
[dir=rtl] .w03l-navitem[aria-current=true]{box-shadow:inset -2px 0 0 var(--accent,#4cc2ff)}
.w03l-navitem[aria-current=true] .ico{color:var(--accent2,#8fd8ff)}
.w03l-navitem small{font:600 10.5px/1 var(--mono);color:var(--text3,#8b979e)}
.w03l-rule{block-size:1px;background:var(--line,#2a333b);margin:11px 8px 9px}
.w03l-group{display:flex;align-items:center;gap:7px;padding:0 9px 6px;font:700 10.5px/1.2 var(--ui);letter-spacing:.05em;color:var(--text3,#8b979e)}
.w03l-group .n{color:var(--accent2,#8fd8ff);font-family:var(--mono,ui-monospace,monospace)}
.w03l-steps{display:grid;gap:2px;padding-inline:8px}
.w03l-step{inline-size:100%;display:grid;grid-template-columns:19px minmax(0,1fr);align-items:center;gap:9px;padding:6px 9px;border:0;border-radius:7px;background:transparent;color:var(--text2,#c3ccd2);font:500 12px/1.3 var(--ui);text-align:start;cursor:pointer}
.w03l-step .num{display:grid;place-items:center;inline-size:19px;block-size:19px;border-radius:50%;border:1px solid color-mix(in srgb,var(--accent,#4cc2ff) 34%,var(--line2,#3a464f));background:color-mix(in srgb,var(--accent,#4cc2ff) 12%,transparent);color:var(--accent2,#8fd8ff);font:700 10px/1 var(--mono)}
.w03l-step .lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.w03l-step:hover{background:color-mix(in srgb,var(--accent,#4cc2ff) 8%,transparent);color:var(--text,#eef2f4)}
.w03l-step[data-selected=true]{background:color-mix(in srgb,var(--accent,#4cc2ff) 14%,transparent);color:var(--text,#eef2f4);font-weight:650}
.w03l-step[data-selected=true] .num{background:var(--accent,#4cc2ff);border-color:var(--accent,#4cc2ff);color:var(--bg0,#0e1317)}
.w03l-step .opt{font:700 9.5px/1 var(--mono);color:var(--warn,#fbbf24);border:1px solid color-mix(in srgb,var(--warn,#fbbf24) 42%,transparent);border-radius:4px;padding:2px 4px}
.w03l-empty{margin:2px 9px 0;padding:7px 9px;border:1px dashed var(--line2,#3a464f);border-radius:7px;font:500 11px/1.45 var(--ui);color:var(--text3,#8b979e)}

/* ---------------------------------------------------------------- RIGHT: Context */
.w03l-ctx{padding-block-end:14px}
.w03l-ctx-head{display:flex;align-items:center;gap:9px;padding:13px 12px 9px}
.w03l-ctx-head .ico{color:var(--accent2,#8fd8ff)}
.w03l-ctx-head h3{margin:0;font:700 13px/1.2 var(--ui);color:var(--text,#eef2f4)}
.w03l-ctx-head .sub{margin:2px 0 0;font:500 11px/1.35 var(--ui);color:var(--text3,#8b979e);overflow-wrap:anywhere}
.w03l-close{margin-inline-start:auto;inline-size:26px;block-size:26px;display:grid;place-items:center;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text3,#8b979e);cursor:pointer}
.w03l-close:hover{border-color:var(--line2,#3a464f);background:var(--bg2,#1b2228);color:var(--text,#eef2f4)}
.w03l-rows{display:grid;padding-inline:12px}
.w03l-row{display:grid;grid-template-columns:31px minmax(0,1fr);gap:11px;padding:12px 0;border-block-start:1px solid var(--line,#2a333b)}
.w03l-row:first-child{border-block-start:0}
.w03l-rowicon{inline-size:31px;block-size:31px;display:grid;place-items:center;border-radius:9px;border:1px solid color-mix(in srgb,var(--accent,#4cc2ff) 26%,var(--line,#2a333b));background:color-mix(in srgb,var(--accent,#4cc2ff) 10%,var(--bg1,#141a20));color:var(--accent2,#8fd8ff)}
.w03l-rowlabel{font:500 11.5px/1.3 var(--ui);color:var(--text3,#8b979e)}
.w03l-rowvalue{margin-block-start:3px;font:600 13px/1.4 var(--ui);color:var(--text,#eef2f4);overflow-wrap:anywhere}
.w03l-rowvalue.plain{font-weight:500;color:var(--text2,#c3ccd2);font-size:12.5px}
.w03l-chips{display:flex;flex-wrap:wrap;gap:6px;margin-block-start:6px}
.w03l-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border:1px solid var(--line2,#3a464f);border-radius:6px;background:var(--bg2,#1b2228);color:var(--text2,#c3ccd2);font:600 11px/1.3 var(--mono,ui-monospace,monospace);max-inline-size:100%;overflow-wrap:anywhere}
.w03l-facts{margin:12px 12px 0;border:1px solid var(--line,#2a333b);border-radius:9px;background:color-mix(in srgb,var(--bg0,#0e1317) 60%,var(--bg1,#141a20));overflow:hidden}
.w03l-facts h4{margin:0;padding:8px 10px 7px;border-block-end:1px solid var(--line,#2a333b);font:700 10.5px/1.2 var(--ui);letter-spacing:.05em;color:var(--text3,#8b979e);background:color-mix(in srgb,var(--bg2,#1b2228) 55%,transparent)}
.w03l-kv{display:flex;align-items:center;gap:8px;padding:7px 10px;font:500 11.5px/1.35 var(--ui);color:var(--text2,#c3ccd2);border-block-start:1px solid color-mix(in srgb,var(--line,#2a333b) 70%,transparent)}
.w03l-kv:first-of-type{border-block-start:0}
.w03l-kv span:first-child{color:var(--text3,#8b979e)}
.w03l-kv b{margin-inline-start:auto;font:700 11.5px/1.3 var(--mono,ui-monospace,monospace)}
.w03l-kv b[data-tone=ok]{color:var(--ok,#34d399)}
.w03l-kv b[data-tone=warn]{color:var(--warn,#fbbf24)}
.w03l-kv b[data-tone=error]{color:var(--bad,#f87171)}
.w03l-hint{margin:11px 12px 0;padding:9px 10px;border:1px dashed var(--line2,#3a464f);border-radius:8px;font:500 11.5px/1.5 var(--ui);color:var(--text3,#8b979e)}

/* ---------------------------------------------------------------- responsive composition */
@media (max-width:1320px){.w03l-head h2{font-size:17px}.w03l-purpose{font-size:12px}}
@media (max-width:1100px){#m0StructuredSpatial.m0-structured-spatial{padding:10px}.w03l{gap:8px}.w03l-actions{padding:7px 8px}.w03l-head{padding:13px 13px 6px}.w03l-purpose{padding:0 13px 11px}}
@media (max-width:860px){.w03l-group-end{margin-inline-start:0}.w03l-headmeta{margin-inline-start:0;inline-size:100%}.w03l-legend{gap:12px}.w03l-status{margin-inline-start:0}}
@media (max-width:640px){.w03l-btn{min-block-size:32px;font-size:11.5px}.w03l-canvas{min-block-size:230px}.w03l-foot{gap:10px}}
@media (prefers-reduced-motion:reduce){.w03l *,.w03l *::before,.w03l *::after{transition:none!important;animation:none!important}}
`;

/** Inject once per host; re-invoked on every render so the sheet follows a rebuilt subtree. */
export function ensureLabStyle(root           ){
  if(!root)return;
  const host=root           ;
  if(host.querySelector?.(':scope > style[data-w03-labs-style]'))return;
  host.insertAdjacentHTML?.('afterbegin',`<style data-w03-labs-style>${STYLE}</style>`);
}

/** Panel titles follow the active language; the label is direction-safe via `dir=auto`. */
export const panelLabel=(t                      ,key       )=>t[key]||key;

                        
