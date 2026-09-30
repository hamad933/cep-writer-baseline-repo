/**
 * W03-SCENARIOS · surface stylesheet.
 *
 * Composition authority: `Cybersecurity Scenario Timeline Dashboard(1).png`
 * (CURRENT_FINAL_REFERENCE). Region grammar taken from the reference: workbench tab row →
 * authoring palette → bordered time-ordered board (identity head · phase rows · legend) with a
 * structure pane on the reading-start side and a sectioned inspector on the reading-end side.
 *
 * Rules honoured here:
 *  - logical properties only, so RTL/LTR mirror from one stylesheet (no direction baked in);
 *  - product design tokens only (`--bg* --line* --text* --accent --violet --warn --ok --mono`),
 *    so every theme (dark-blue / notion-dark / light) keeps working;
 *  - spacing scale 4/8/12/16/24, one type scale, no all-caps hierarchy device (broken in Arabic);
 *  - over-boxing avoided: grouping comes from spacing, hairlines and background tiers first.
 */
export const SCENARIO_STYLE_CSS=`
#m0StructuredSpatial.m0-structured-spatial{padding:0;border:0;border-radius:0;background:transparent;margin:0;min-width:0}
.w03-scen{display:grid;gap:8px;min-width:0;color:var(--text);font-family:var(--ui);padding-block-start:40px}
.w03-scen button{font-family:inherit}
.w03-scen :focus-visible{outline:2px solid var(--focus);outline-offset:2px}

/* ---------------------------------------------------------------- workbench tab row */
.w03-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:38px}
.w03-tabs{display:flex;align-items:stretch;gap:0;min-width:0;overflow-x:auto;scrollbar-width:none}
.w03-tabs::-webkit-scrollbar{display:none}
.w03-tab{height:32px;padding:0 12px;border:0;background:transparent;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;border-radius:8px 8px 0 0}
.w03-tab:hover{color:var(--text);background:color-mix(in srgb,var(--line) 55%,transparent)}
.w03-tab[aria-selected=true]{color:var(--accent);box-shadow:inset 0 -2px 0 var(--accent);background:transparent}
.w03-bar-actions{margin-inline-start:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}

/* ---------------------------------------------------------------- shared control */
.w03-btn{height:32px;padding:0 8px;border:1px solid color-mix(in srgb,var(--line2) 62%,var(--text3));background:var(--bg1);color:var(--text);border-radius:8px;font-size:12.5px;font-weight:500;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:border-color .12s,background .12s}
.w03-btn:hover{background:var(--bg2);border-color:color-mix(in srgb,var(--accent) 50%,var(--line2))}
.w03-btn:disabled{opacity:.42;cursor:not-allowed;border-color:var(--line);background:var(--bg1)}
.w03-btn[data-tone=accent]{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 55%,var(--line2))}
.w03-btn[aria-pressed=true]{background:color-mix(in srgb,var(--accent) 15%,var(--bg1));border-color:var(--accent);color:var(--accent)}
.w03-btn[data-shape=icon]{padding:0 9px}
.w03-sep{width:1px;height:22px;background:var(--line);flex:none}

/* ---------------------------------------------------------------- authoring palette */
.w03-palette{display:flex;gap:8px;align-items:center;flex-wrap:wrap}

/* ---------------------------------------------------------------- the board */
.w03-board{border:1px solid var(--line);border-radius:12px;overflow:hidden;background-color:var(--bg0);background-image:radial-gradient(circle at 1px 1px,color-mix(in srgb,var(--line2) 28%,transparent) 1px,transparent 0);background-size:22px 22px}
.w03-board-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 16px;background:color-mix(in srgb,var(--bg1) 88%,transparent);border-bottom:1px solid var(--line)}
.w03-board-head h2{margin:0;font-size:18px;font-weight:650;line-height:1.3;letter-spacing:.005em;min-width:0;overflow-wrap:anywhere}
.w03-pill{display:inline-flex;align-items:center;gap:8px;padding:2px 12px;border-radius:999px;border:1px solid var(--line2);background:var(--bg0);font-size:11px;color:var(--text2);white-space:nowrap}
.w03-pill[data-tone=ok]{border-color:color-mix(in srgb,var(--ok) 60%,transparent);background:color-mix(in srgb,var(--ok) 12%,var(--bg0));color:var(--ok)}
.w03-pill[data-tone=accent]{border-color:color-mix(in srgb,var(--accent) 60%,transparent);background:color-mix(in srgb,var(--accent) 12%,var(--bg0));color:var(--accent)}
.w03-pill[data-tone=warn]{border-color:color-mix(in srgb,var(--warn) 60%,transparent);background:color-mix(in srgb,var(--warn) 12%,var(--bg0));color:var(--warn)}
.w03-board-meta{margin-inline-start:auto;display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--text3)}
.w03-board-meta b{font-weight:600;color:var(--text2)}

/* ---------------------------------------------------------------- timeline rows */
.w03-lanes{display:grid}
.w03-row{display:grid;grid-template-columns:64px minmax(0,1fr);border-bottom:1px solid color-mix(in srgb,var(--line) 78%,transparent)}
.w03-row:last-child{border-bottom:0}
.w03-row[data-selected=true]{background:color-mix(in srgb,var(--accent) 5%,transparent)}
.w03-rail{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:16px}
.w03-num{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:2px solid var(--accent);background:var(--bg0);font-family:var(--mono);font-size:12px;font-weight:600;color:var(--accent);flex:none;position:relative;z-index:1}
.w03-conn{flex:1;min-height:22px;width:2px;background:var(--line2);position:relative;margin-block-end:8px}
.w03-conn::after{content:'';position:absolute;inset-block-end:-1px;inset-inline-start:50%;transform:translateX(-50%);border-inline:4px solid transparent;border-block-start:7px solid var(--line2)}
.w03-row:last-child .w03-conn{visibility:hidden}
.w03-lane{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;padding:8px 12px;min-width:0}
.w03-chain{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-width:0}
.w03-lane-head{grid-column:1/-1;display:flex;gap:8px;align-items:baseline;padding:0;min-width:0}
.w03-lane-head strong{font-size:12px;font-weight:600;color:var(--text2);line-height:1.3}
.w03-lane-head span{font-size:11px;color:var(--text3)}

.w03-node{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:center;min-width:164px;max-width:252px;padding:8px 12px;border:1px solid color-mix(in srgb,var(--kn,var(--accent)) 52%,var(--line));background:color-mix(in srgb,var(--kn,var(--accent)) 8%,var(--bg1));border-radius:8px;text-align:start;color:inherit;cursor:pointer;transition:border-color .12s,transform .12s}
.w03-node:hover{border-color:color-mix(in srgb,var(--kn,var(--accent)) 85%,var(--line))}
.w03-node .ic{width:26px;height:26px;display:grid;place-items:center;color:var(--kn,var(--accent))}
.w03-node .tt{font-size:12.5px;font-weight:600;line-height:1.3;color:var(--text);overflow-wrap:anywhere}
.w03-node .sb{margin-top:3px;font-size:11px;line-height:1.35;color:var(--text3);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.w03-node[aria-pressed=true]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--bg1));box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 26%,transparent)}
.w03-arrow{width:34px;height:12px;flex:none;position:relative;color:var(--text3)}
.w03-arrow::before{content:'';position:absolute;inset-block-start:5px;inset-inline:0;border-top:2px solid currentColor}
.w03-arrow::after{content:'';position:absolute;inset-block-start:1px;inset-inline-end:0;border-block:5px solid transparent;border-inline-start:7px solid currentColor}
html[dir=rtl] .w03-arrow{transform:scaleX(-1)}
.w03-add{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;align-self:center;border:1px dashed color-mix(in srgb,var(--line2) 62%,var(--text3));border-radius:8px;background:transparent;color:var(--text2);font-size:12.5px;font-weight:500;cursor:pointer}
.w03-add:hover{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)}
.w03-add:disabled{opacity:.45;cursor:not-allowed}

/* ---------------------------------------------------------------- flow view */
.w03-flow{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;padding:16px}
.w03-gate{display:grid;gap:4px;min-width:134px;padding:8px 12px;border:1px solid var(--line2);border-radius:8px;background:color-mix(in srgb,var(--bg2) 92%,transparent)}
.w03-gate b{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--accent)}
.w03-gate span{font-size:12px;color:var(--text);overflow-wrap:anywhere}
.w03-gate small{font-size:10.5px;color:var(--text3)}
.w03-chain{display:flex;flex-wrap:wrap;gap:8px;align-items:center;flex:1 1 320px;min-width:0;padding-block:2px}
.w03-chain .w03-node{min-width:150px;max-width:230px}
.w03-cond{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--warn);width:100%}
.w03-cond i{width:34px;height:0;border-top:2px dashed currentColor;font-style:normal;flex:none}

/* ---------------------------------------------------------------- canvas board view */
.w03-columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(236px,1fr));gap:12px;padding:16px}
.w03-col{display:flex;flex-direction:column;min-width:0;border:1px solid var(--line);border-radius:8px;background:color-mix(in srgb,var(--bg1) 90%,transparent)}
.w03-col-head{display:flex;gap:8px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 75%,transparent);border-radius:8px 8px 0 0}
.w03-col-head b{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--accent)}
.w03-col-head span{font-size:12.5px;font-weight:600;min-width:0;overflow-wrap:anywhere}
.w03-col-head small{margin-inline-start:auto;font-size:10.5px;color:var(--text3);white-space:nowrap}
.w03-col-body{display:grid;gap:8px;padding:12px}
.w03-card{display:grid;gap:4px;padding:8px 12px;border:1px solid color-mix(in srgb,var(--kn,var(--accent)) 46%,var(--line));border-radius:8px;background:color-mix(in srgb,var(--kn,var(--accent)) 7%,var(--bg0));text-align:start;color:inherit;cursor:pointer}
.w03-card:hover{border-color:color-mix(in srgb,var(--kn,var(--accent)) 85%,var(--line))}
.w03-card[aria-pressed=true]{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 26%,transparent)}
.w03-card .kk{display:flex;gap:8px;align-items:center;font-size:10.5px;font-weight:600;color:var(--kn,var(--accent))}
.w03-card .tt{font-size:12.5px;font-weight:600;line-height:1.3;color:var(--text);overflow-wrap:anywhere}
.w03-card dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 8px;margin:0;font-size:11px}
.w03-card dt{color:var(--text3)}
.w03-card dd{margin:0;color:var(--text2);overflow-wrap:anywhere}
.w03-col-foot{margin-top:auto;padding:8px 12px;border-top:1px solid var(--line)}

/* ---------------------------------------------------------------- topology view */
.w03-topo{min-height:400px;padding:6px}
.w03-topo>div,.w03-topo .spatial-shell{min-height:392px}

/* ---------------------------------------------------------------- legend + status */
.w03-legend{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:8px 16px;border-top:1px solid var(--line);background:color-mix(in srgb,var(--bg1) 88%,transparent)}
.w03-legend strong{font-size:12.5px;font-weight:600;color:var(--text2);white-space:nowrap}
.w03-key{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);white-space:nowrap}
.w03-key .line{width:32px;height:0;border-top:2px solid currentColor}
.w03-key .line.dash{border-top-style:dashed;color:var(--warn)}
.w03-status{margin-inline-start:auto;display:inline-flex;gap:8px;align-items:center;font-size:11px;color:var(--text3);min-width:0;overflow-wrap:anywhere}
.w03-status[data-tone=ok]{color:var(--ok)}
.w03-status[data-tone=error]{color:var(--bad)}
.w03-status[data-tone=accent]{color:var(--accent)}
.w03-empty{display:grid;gap:8px;justify-items:start;padding:24px 16px;color:var(--text2)}
.w03-empty strong{font-size:13px;color:var(--text)}
.w03-empty span{font-size:12px;color:var(--text3)}

/* ---------------------------------------------------------------- structure pane (left) */
.w03-struct{display:flex;flex-direction:column;gap:0;padding:8px 8px 24px;height:100%;min-height:0;overflow:auto;scrollbar-width:thin}
.w03-srow{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;min-height:33px;padding:4px 8px;border:0;border-inline-start:2px solid transparent;border-radius:0 8px 8px 0;background:transparent;color:var(--text2);font-size:13px;font-weight:500;text-align:start;cursor:pointer}
html[dir=rtl] .w03-srow{border-radius:8px 0 0 8px}
.w03-srow:hover{background:var(--bg2);color:var(--text)}
.w03-srow .ic{display:grid;place-items:center;color:var(--text3)}
.w03-srow:hover .ic{color:var(--text2)}
.w03-srow .ct{font-family:var(--mono);font-size:10.5px;font-weight:600;color:var(--text3);border:1px solid var(--line);background:var(--bg2);border-radius:6px;padding:0 5px;min-width:20px;text-align:center}
.w03-srow[aria-current=true]{background:color-mix(in srgb,var(--accent) 12%,var(--bg1));border-inline-start-color:var(--accent);color:var(--text)}
.w03-srow[aria-current=true] .ic{color:var(--accent)}
.w03-srow .chev{transition:transform .12s}
.w03-srow[aria-expanded=true] .chev{transform:rotate(180deg)}
.w03-sgroup{display:grid;gap:0;margin-inline-start:16px;padding-inline-start:8px;border-inline-start:1px solid var(--line)}
.w03-sgroup .w03-srow{grid-template-columns:16px auto minmax(0,1fr);min-height:31px;font-size:12.5px}
.w03-snum{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--accent)}
.w03-ssection{margin:16px 8px 4px;padding-top:12px;border-top:1px solid var(--line);font-size:12.5px;font-weight:600;color:var(--text)}
.w03-snote{padding:8px 8px;font-size:11px;line-height:1.5;color:var(--text3)}

/* ---------------------------------------------------------------- inspector (right) */
.w03-insp{display:flex;flex-direction:column;padding:0 16px 22px;height:100%;min-height:0;overflow:auto;scrollbar-width:thin}
.w03-isub{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px 0 4px;font-size:11px;color:var(--text3)}
.w03-isub b{font-weight:600;color:var(--text2)}
.w03-isec{padding:12px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 82%,transparent)}
.w03-isec:last-child{border-bottom:0}
.w03-isec>h4{margin:0 0 9px;font-size:12.5px;font-weight:600;color:var(--accent);display:flex;gap:8px;align-items:center}
.w03-ifield{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px;align-items:start;margin-bottom:8px}
.w03-ifield:last-child{margin-bottom:0}
.w03-ifield .ic{color:var(--text3);margin-top:1px}
.w03-ifield .v{display:block;font-size:12.5px;line-height:1.45;color:var(--text);overflow-wrap:anywhere}
.w03-ifield .s{display:block;font-size:11px;line-height:1.45;color:var(--text3);overflow-wrap:anywhere;margin-top:2px}
.w03-ikv{display:flex;gap:8px;align-items:baseline;justify-content:space-between;padding:4px 0;border-bottom:1px dashed color-mix(in srgb,var(--line) 70%,transparent);font-size:12px}
.w03-ikv:last-child{border-bottom:0}
.w03-ikv span{color:var(--text3);min-width:0}
.w03-ikv b{font-weight:600;color:var(--text2);text-align:end;overflow-wrap:anywhere}
.w03-ichips{display:flex;gap:8px;flex-wrap:wrap}
.w03-ilist{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.w03-ilist li{display:grid;gap:4px;padding:8px 8px;border:1px solid var(--line);border-radius:8px;background:color-mix(in srgb,var(--bg1) 82%,transparent);font-size:12px}
.w03-ilist li strong{font-weight:600;color:var(--text);overflow-wrap:anywhere}
.w03-ilist li span{font-size:11px;color:var(--text3)}

/* ---------------------------------------------------------------- palette overflow menus */
.w03-menuwrap{position:relative;display:inline-flex}
.w03-menu{position:absolute;inset-block-start:calc(100% + 8px);inset-inline-end:0;z-index:40;min-width:226px;display:grid;gap:4px;padding:4px;border:1px solid color-mix(in srgb,var(--line2) 62%,var(--text3));border-radius:8px;background:var(--bg2);box-shadow:var(--shadow)}
.w03-menu[hidden]{display:none}
.w03-menu button{display:flex;gap:8px;align-items:center;width:100%;min-height:32px;padding:4px 8px;border:0;border-radius:8px;background:transparent;color:var(--text2);font-size:12.5px;text-align:start;cursor:pointer}
.w03-menu button:hover{background:var(--bg1);color:var(--text)}

/* ---------------------------------------------------------------- a11y affordances */
.w03-viewpanel{min-width:0}
.w03-viewpanel:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
#domainLeftRegion :focus-visible,#domainContext :focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.w03-tab[aria-selected=true]{font-weight:700}

/* ---------------------------------------------------------------- local layout fixes */
.w03-node>span:last-child{min-width:0}
.w03-node .tt,.w03-node .sb{display:block}

/* ---------------------------------------------------------------- responsive */
@media(max-width:1180px){
  .w03-row{grid-template-columns:52px minmax(0,1fr)}
  .w03-num{width:30px;height:30px;font-size:11px}
  .w03-lane{padding:8px;gap:8px}
  .w03-node{min-width:154px;max-width:100%;flex:1 1 190px}
  .w03-board-head h2{font-size:17px}
  .w03-columns{grid-template-columns:repeat(auto-fit,minmax(210px,1fr));padding:12px}
}
@media(max-width:820px){
  .w03-bar{gap:8px}
  .w03-bar-actions{margin-inline-start:0;width:100%}
  .w03-board-head{padding:8px 12px}
  .w03-board-head h2{font-size:16px}
  .w03-board-meta{margin-inline-start:0;gap:8px}
  .w03-lane{padding:8px}
  .w03-arrow{width:24px}
  .w03-legend{gap:12px;padding:8px 12px}
  .w03-status{margin-inline-start:0;width:100%}
  .w03-flow{padding:12px}
}
@media(prefers-reduced-motion:reduce){.w03-scen *,.w03-struct *,.w03-insp *{transition:none!important;animation:none!important}}
`;

export const ensureScenarioStyle=(root:ParentNode)=>{
  const scope=root as Element;
  if(scope.querySelector(':scope > style[data-w03-scen-style]'))return;
  scope.insertAdjacentHTML('afterbegin',`<style data-w03-scen-style>${SCENARIO_STYLE_CSS}</style>`);
};
