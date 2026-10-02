/**
 * W03-RUNS local presentation tokens + styles.
 * Shared shell tokens are consumed (one product); the composition, hierarchy, density and
 * emphasis are surface-specific. Spacing scale: 4/8/12/16/24. Radius set: 10/8/6/999.
 * Type scale (px): 18 / 15 / 13 / 12 / 11 / 10 / 9. Weights: 700 / 650 / 600 / 400.
 */
export const RUNS_STYLE=`<style data-runs-local-style>
.runs-workspace{
  --runs-bg:var(--bg0,#05101c);--runs-panel:var(--bg1,#071523);--runs-raise:var(--bg2,#0a1a2b);
  --runs-line:var(--line,#14263a);--runs-line2:var(--line2,#1d3448);
  --runs-t1:var(--text,#e8f0f8);--runs-t2:var(--text2,#a8bcd2);--runs-t3:var(--text3,#7b93ad);
  --runs-accent:var(--accent2,#3fc9c0);--runs-info:var(--info,#4aa8ff);
  --runs-ok:#43d79a;--runs-bad:#ff7a7a;--runs-warn:#f7b955;
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;
  display:flex;flex-direction:column;min-height:0;height:100%;flex:1;
  background:var(--runs-bg);color:var(--runs-t1);
  font:13px/1.5 var(--ui,system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif);
}
.runs-workspace *{box-sizing:border-box}
.runs-workspace bdi{font:inherit}
.runs-workspace :is(h1,h2,h3,h4,p,dl,dd,dt,table){margin:0}
.runs-workspace button,input{font:inherit;color:inherit}
.runs-mono{font-family:var(--mono,ui-monospace,Consolas,monospace);font-size:11px;letter-spacing:.01em}

/* ---------- top bar : mode tabs + lifecycle actions ---------- */
.runs-bar{display:flex;flex-wrap:wrap;align-items:stretch;gap:var(--s4);min-height:46px;padding-inline:var(--s4);
  border-block-end:1px solid var(--runs-line);background:linear-gradient(180deg,color-mix(in srgb,var(--runs-raise) 70%,transparent),transparent)}
.runs-tabs{display:flex;gap:2px;align-items:stretch;min-width:0;overflow-x:auto;scrollbar-width:none}
.runs-tab{position:relative;border:0;background:transparent;color:var(--runs-t2);padding:0 10px;
  min-height:44px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;letter-spacing:.005em}
.runs-tab:hover{color:var(--runs-t1);background:color-mix(in srgb,var(--runs-accent) 6%,transparent)}
.runs-tab[aria-selected=true]{color:var(--runs-t1)}
.runs-tab[aria-selected=true]::after{content:"";position:absolute;inset-inline:9px;bottom:0;height:2px;border-radius:2px;background:var(--runs-accent)}
.runs-tab:focus-visible{outline:2px solid var(--focus,#6cc5ff);outline-offset:-3px;border-radius:6px}
.runs-actions{margin-inline-start:auto;position:relative;display:flex;align-items:center;gap:var(--s2);padding-block:6px;flex-wrap:wrap;justify-content:flex-end}
.runs-btn{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:0 11px;border-radius:7px;
  border:1px solid var(--runs-line2);background:color-mix(in srgb,var(--runs-raise) 85%,transparent);
  color:var(--runs-t1);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;
  transition:background .12s ease,border-color .12s ease,color .12s ease}
.runs-btn:hover:not(:disabled){border-color:color-mix(in srgb,var(--runs-accent) 45%,var(--runs-line2));background:color-mix(in srgb,var(--runs-accent) 10%,var(--runs-raise))}
.runs-btn:focus-visible{outline:2px solid var(--focus,#6cc5ff);outline-offset:2px}
.runs-btn:disabled{opacity:.44;cursor:not-allowed}
.runs-btn[data-kind=primary]{background:color-mix(in srgb,var(--runs-accent) 20%,var(--runs-raise));border-color:color-mix(in srgb,var(--runs-accent) 55%,var(--runs-line2));color:#eafcff}
.runs-btn[data-kind=danger]{border-color:color-mix(in srgb,var(--runs-bad) 45%,var(--runs-line2));color:#ffd9d9}
.runs-btn[data-kind=danger]:hover:not(:disabled){background:color-mix(in srgb,var(--runs-bad) 16%,var(--runs-raise));border-color:var(--runs-bad)}
.runs-btn[data-icon]{padding-inline:9px}
.runs-ico{display:grid;place-items:center;width:13px;height:13px;flex:none;opacity:.9}

/* ---------- identity strip ---------- */
.runs-identity{display:flex;align-items:center;gap:var(--s4);padding:10px var(--s4);
  border-block-end:1px solid var(--runs-line);background:color-mix(in srgb,var(--runs-panel) 78%,transparent);flex-wrap:wrap}
.runs-idmark{display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:9px;
  border:1px solid color-mix(in srgb,var(--runs-accent) 40%,var(--runs-line2));
  background:color-mix(in srgb,var(--runs-accent) 12%,var(--runs-bg));color:var(--runs-accent)}
.runs-idmain{display:grid;gap:2px;min-width:190px;max-width:340px}
.runs-idmain h1{font-size:16px;font-weight:700;line-height:1.25;letter-spacing:-.01em}
.runs-idsub{display:flex;align-items:center;gap:var(--s2);color:var(--runs-t3);font-size:11px}
.runs-facts{display:flex;gap:var(--s5);flex-wrap:wrap;margin-inline-start:auto}
.runs-fact{display:grid;gap:1px;min-width:0;max-width:270px}
.runs-fact dt{font-size:10px;color:var(--runs-t3);letter-spacing:.045em;text-transform:uppercase}
.runs-fact dd{font-size:12.5px;font-weight:600;color:var(--runs-t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.runs-fact[data-emphasis=on] dd{color:var(--runs-accent)}

/* ---------- pills ---------- */
.runs-pill{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;
  font-size:10.5px;font-weight:700;letter-spacing:.04em;border:1px solid transparent;white-space:nowrap}
.runs-pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.runs-pill[data-tone=success]{color:#7ff0c4;background:color-mix(in srgb,var(--runs-ok) 16%,transparent);border-color:color-mix(in srgb,var(--runs-ok) 45%,transparent)}
.runs-pill[data-tone=danger]{color:#ffc0c0;background:color-mix(in srgb,var(--runs-bad) 16%,transparent);border-color:color-mix(in srgb,var(--runs-bad) 45%,transparent)}
.runs-pill[data-tone=warning]{color:#ffdf9e;background:color-mix(in srgb,var(--runs-warn) 15%,transparent);border-color:color-mix(in srgb,var(--runs-warn) 42%,transparent)}
.runs-pill[data-tone=info]{color:#bfe0ff;background:color-mix(in srgb,var(--runs-info) 15%,transparent);border-color:color-mix(in srgb,var(--runs-info) 42%,transparent)}
.runs-pill[data-tone=neutral]{color:var(--runs-t2);background:color-mix(in srgb,var(--runs-t3) 14%,transparent);border-color:color-mix(in srgb,var(--runs-t3) 34%,transparent)}
.runs-pill[data-flat]::before{display:none}
.runs-tag{display:inline-flex;align-items:center;padding:1px 6px;border-radius:5px;font-size:10px;font-weight:700;
  border:1px solid var(--runs-line2);color:var(--runs-t2);background:color-mix(in srgb,var(--runs-raise) 70%,transparent);white-space:nowrap}
.runs-tag[data-tone=success]{color:#8ff3cd;border-color:color-mix(in srgb,var(--runs-ok) 42%,transparent);background:color-mix(in srgb,var(--runs-ok) 12%,transparent)}
.runs-tag[data-tone=danger]{color:#ffbcbc;border-color:color-mix(in srgb,var(--runs-bad) 42%,transparent);background:color-mix(in srgb,var(--runs-bad) 12%,transparent)}
.runs-tag[data-tone=warning]{color:#ffdd9b;border-color:color-mix(in srgb,var(--runs-warn) 40%,transparent);background:color-mix(in srgb,var(--runs-warn) 11%,transparent)}

/* ---------- body shells ---------- */
.runs-body{display:flex;flex-direction:row;flex:1;min-height:0;min-width:0}
.runs-body>.runs-pane{flex:1;min-width:0}
.runs-rail{display:flex;flex-direction:column;min-height:0;padding:var(--s3);gap:var(--s3);overflow:auto;flex:none;width:236px;
  background:color-mix(in srgb,var(--runs-panel) 60%,transparent)}
.runs-rail[data-side=start]{border-inline-end:1px solid var(--runs-line)}
.runs-rail[data-side=end]{border-inline-start:1px solid var(--runs-line);width:290px}
.runs-railhead{display:flex;align-items:center;justify-content:space-between;gap:var(--s2);
  font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--runs-t3)}
.runs-split{display:grid;grid-template-columns:minmax(320px,46%) minmax(0,1fr);flex:1;min-height:0}
.runs-split>*+*{border-inline-start:1px solid var(--runs-line)}
.runs-pane{display:flex;flex-direction:column;min-height:0;min-width:0;overflow:auto}
.runs-panehead{display:flex;align-items:center;gap:var(--s2);padding:9px var(--s3);
  border-block-end:1px solid var(--runs-line);background:color-mix(in srgb,var(--runs-raise) 55%,transparent);
  position:sticky;top:0;z-index:2;flex-wrap:wrap}
.runs-panehead h2,.runs-panehead h3{font-size:13px;font-weight:700;letter-spacing:-.005em}
.runs-chipbtn{display:inline-flex;align-items:center;gap:6px;min-height:24px;padding:0 8px;border-radius:6px;
  border:1px solid var(--runs-line2);background:transparent;color:var(--runs-t2);font-size:11px;cursor:pointer}
.runs-chipbtn:hover{color:var(--runs-t1);border-color:color-mix(in srgb,var(--runs-accent) 40%,var(--runs-line2))}
.runs-chipbtn[aria-pressed=true]{background:color-mix(in srgb,var(--runs-accent) 15%,transparent);
  border-color:color-mix(in srgb,var(--runs-accent) 55%,transparent);color:#d9fbf7}
.runs-chipbtn:focus-visible{outline:2px solid var(--focus,#6cc5ff);outline-offset:2px}
.runs-count{display:inline-grid;place-items:center;min-width:19px;height:17px;padding-inline:5px;border-radius:5px;
  background:color-mix(in srgb,var(--runs-bad) 25%,transparent);border:1px solid color-mix(in srgb,var(--runs-bad) 50%,transparent);
  color:#ffd3d3;font:700 10px/1 var(--mono,monospace)}
.runs-scope{margin-inline-start:auto;font:10.5px var(--mono,monospace);color:var(--runs-t3);white-space:nowrap}

/* ---------- structure nav (embedded rail or shell LEFT) ---------- */
.runs-structure{display:grid;gap:2px}
.runs-navitem{display:flex;align-items:center;gap:9px;width:100%;min-height:34px;padding:0 9px;border-radius:7px;
  border:1px solid transparent;background:transparent;color:var(--runs-t2);cursor:pointer;text-align:start;font-size:12.5px;font-weight:600}
.runs-navitem:hover{background:color-mix(in srgb,var(--runs-accent) 7%,transparent);color:var(--runs-t1)}
.runs-navitem[aria-current=true]{background:color-mix(in srgb,var(--runs-accent) 13%,transparent);
  border-color:color-mix(in srgb,var(--runs-accent) 34%,transparent);color:#e7fffd;box-shadow:inset 3px 0 0 var(--runs-accent)}
[dir=rtl] .runs-navitem[aria-current=true]{box-shadow:inset -3px 0 0 var(--runs-accent)}
.runs-navitem:focus-visible{outline:2px solid var(--focus,#6cc5ff);outline-offset:-2px}
.runs-navico{width:15px;height:15px;flex:none;opacity:.75;display:grid;place-items:center}
.runs-navitem[aria-current=true] .runs-navico{opacity:1;color:var(--runs-accent)}
.runs-navlabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.runs-navcount{font:10.5px var(--mono,monospace);color:var(--runs-t3);background:color-mix(in srgb,var(--runs-raise) 85%,transparent);
  border:1px solid var(--runs-line);border-radius:5px;padding:1px 5px}

/* ---------- context readout (embedded rail or shell RIGHT) ---------- */
.runs-context{display:grid;gap:var(--s3)}
.runs-ctxitem{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;align-items:start}
.runs-ctxico{display:grid;place-items:center;width:22px;height:22px;border-radius:6px;color:var(--runs-accent);
  background:color-mix(in srgb,var(--runs-accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--runs-accent) 30%,transparent)}
.runs-ctxitem h4{font-size:12.5px;font-weight:700;color:var(--runs-accent);letter-spacing:-.005em}
.runs-ctxitem p{font-size:12px;color:var(--runs-t2);line-height:1.55;margin-top:2px}
.runs-ctxitem code{font:11px var(--mono,monospace);color:var(--runs-t1)}
.runs-note{border:1px solid var(--runs-line2);border-inline-start:3px solid var(--runs-warn);border-radius:7px;
  padding:9px 11px;background:color-mix(in srgb,var(--runs-warn) 8%,transparent);font-size:11.5px;line-height:1.55;color:var(--runs-t2)}
.runs-note[data-tone=info]{border-inline-start-color:var(--runs-info);background:color-mix(in srgb,var(--runs-info) 8%,transparent)}
.runs-note[data-tone=ok]{border-inline-start-color:var(--runs-ok);background:color-mix(in srgb,var(--runs-ok) 8%,transparent)}
.runs-kv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;font-size:12px;align-items:baseline}
.runs-kv dt{color:var(--runs-t3);white-space:nowrap}
.runs-kv dd{color:var(--runs-t1);font-weight:600;min-width:0;overflow-wrap:break-word}

/* ---------- tables ---------- */
.runs-tablewrap{overflow:auto;min-height:0;flex:1}
.runs-table{width:100%;border-collapse:collapse;font-size:12.2px}
.runs-table th{position:sticky;top:0;z-index:1;text-align:start;font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--runs-t3);background:color-mix(in srgb,var(--runs-raise) 92%,transparent);
  padding:7px var(--s3);border-block-end:1px solid var(--runs-line);white-space:nowrap}
.runs-table td{padding:8px var(--s3);border-block-end:1px solid color-mix(in srgb,var(--runs-line) 70%,transparent);vertical-align:top}
.runs-table tbody tr{cursor:pointer;transition:background .1s ease}
.runs-table tbody tr:hover{background:color-mix(in srgb,var(--runs-accent) 6%,transparent)}
.runs-table tbody tr[aria-selected=true]{background:color-mix(in srgb,var(--runs-accent) 14%,transparent);box-shadow:inset 3px 0 0 var(--runs-accent)}
[dir=rtl] .runs-table tbody tr[aria-selected=true]{box-shadow:inset -3px 0 0 var(--runs-accent)}
.runs-table tbody tr:last-child td{border-block-end:0}
.runs-table td strong{font-weight:650}
.runs-sub{display:block;font-size:11px;color:var(--runs-t3);margin-top:1px}
.runs-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-inline-end:7px;vertical-align:middle;background:var(--runs-t3)}
.runs-dot[data-sev=High]{background:var(--runs-bad);box-shadow:0 0 0 3px color-mix(in srgb,var(--runs-bad) 22%,transparent)}
.runs-dot[data-sev=Medium]{background:var(--runs-warn);box-shadow:0 0 0 3px color-mix(in srgb,var(--runs-warn) 20%,transparent)}
.runs-dot[data-sev=Low]{background:var(--runs-ok);box-shadow:0 0 0 3px color-mix(in srgb,var(--runs-ok) 20%,transparent)}
.runs-pager{display:flex;align-items:center;justify-content:center;gap:var(--s2);padding:8px var(--s3);flex:none;
  border-block-start:1px solid var(--runs-line);font-size:11px;color:var(--runs-t3);
  background:color-mix(in srgb,var(--runs-panel) 94%,transparent)}
.runs-pagebtn{min-width:24px;min-height:24px;border-radius:6px;border:1px solid var(--runs-line2);background:transparent;color:var(--runs-t2);cursor:pointer}
.runs-pagebtn:disabled{opacity:.4;cursor:not-allowed}
.runs-pagebtn[aria-current=true]{background:color-mix(in srgb,var(--runs-accent) 20%,transparent);border-color:var(--runs-accent);color:#e7fffd}

/* ---------- detail ---------- */
.runs-detailgrid{display:grid;grid-template-columns:auto minmax(0,1fr) auto minmax(0,1fr);gap:5px var(--s4);
  padding:var(--s3) var(--s3) var(--s2);border-block-end:1px solid var(--runs-line);align-items:baseline}
.runs-detailgrid dt{font-size:11px;color:var(--runs-t3);white-space:nowrap}
.runs-detailgrid dd{font-size:12.3px;font-weight:650;min-width:0;overflow-wrap:break-word}
.runs-subtabs{display:flex;gap:2px;padding-inline:var(--s3);border-block-end:1px solid var(--runs-line);
  overflow-x:auto;scrollbar-width:none;background:color-mix(in srgb,var(--runs-panel) 55%,transparent)}
.runs-subtab{position:relative;border:0;background:transparent;color:var(--runs-t3);padding:9px 10px;font-size:12px;
  font-weight:650;cursor:pointer;white-space:nowrap}
.runs-subtab:hover{color:var(--runs-t1)}
.runs-subtab[aria-selected=true]{color:var(--runs-accent)}
.runs-subtab[aria-selected=true]::after{content:"";position:absolute;inset-inline:8px;bottom:0;height:2px;background:var(--runs-accent);border-radius:2px}
.runs-subtab:focus-visible{outline:2px solid var(--focus,#6cc5ff);outline-offset:-3px}
.runs-detailfoot{display:flex;align-items:center;gap:var(--s3);padding:9px var(--s3);margin-top:auto;
  border-block-start:1px solid var(--runs-line);background:color-mix(in srgb,var(--runs-raise) 45%,transparent);flex-wrap:wrap}
.runs-search{flex:1;min-width:150px;display:flex;align-items:center;gap:7px;height:29px;padding:0 9px;border-radius:7px;
  border:1px solid var(--runs-line2);background:color-mix(in srgb,var(--runs-bg) 70%,transparent)}
.runs-search input{flex:1;min-width:0;border:0;background:transparent;outline:none;font-size:12px}
.runs-search:focus-within{border-color:var(--runs-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--runs-accent) 25%,transparent)}
.runs-search input::placeholder{color:var(--runs-t3)}
.runs-toggle{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--runs-t2);cursor:pointer;user-select:none}
.runs-switch{width:30px;height:17px;border-radius:999px;border:1px solid var(--runs-line2);background:color-mix(in srgb,var(--runs-bg) 80%,transparent);position:relative;flex:none;transition:background .14s ease}
.runs-switch::after{content:"";position:absolute;top:2px;inset-inline-start:2px;width:11px;height:11px;border-radius:50%;background:var(--runs-t3);transition:transform .14s ease,background .14s ease}
.runs-toggle[aria-pressed=true] .runs-switch{background:color-mix(in srgb,var(--runs-accent) 45%,transparent);border-color:var(--runs-accent)}
.runs-toggle[aria-pressed=true] .runs-switch::after{transform:translateX(13px);background:#032021}
[dir=rtl] .runs-toggle[aria-pressed=true] .runs-switch::after{transform:translateX(-13px)}
.runs-hl{background:color-mix(in srgb,var(--runs-warn) 30%,transparent);border-radius:3px;padding:0 3px}

/* ---------- preflight (numbered readiness composition) ---------- */
.runs-preflight{display:grid;gap:var(--s3);padding:var(--s4);overflow:auto;min-height:0;
  grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-content:start}
.runs-card{border:1px solid var(--runs-line);border-radius:10px;background:color-mix(in srgb,var(--runs-panel) 92%,transparent);
  padding:var(--s3) var(--s4) var(--s4);display:flex;flex-direction:column;gap:var(--s3);min-width:0}
.runs-cardhead{display:flex;align-items:center;gap:9px;min-width:0}
.runs-step{display:grid;place-items:center;width:20px;height:20px;flex:none;border-radius:6px;font:700 11px/1 var(--mono,monospace);
  color:#03211f;background:var(--runs-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--runs-accent) 16%,transparent)}
.runs-cardhead h3{font-size:13.5px;font-weight:700;letter-spacing:-.005em;min-width:0;overflow-wrap:anywhere}
.runs-cardhead .runs-pill{margin-inline-start:auto}
.runs-card--wide{grid-column:1/-1}
.runs-modules{display:grid;gap:5px}
.runs-module{display:flex;align-items:center;gap:9px;padding:6px 9px;border-radius:7px;font-size:12px;
  border:1px solid var(--runs-line);background:color-mix(in srgb,var(--runs-raise) 60%,transparent)}
.runs-module span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.runs-module .runs-ico{color:var(--runs-accent)}
.runs-check{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:10px;align-items:start;padding:7px 0;
  border-block-end:1px solid color-mix(in srgb,var(--runs-line) 65%,transparent)}
.runs-check:last-child{border-block-end:0}
.runs-checkico{width:16px;height:16px;display:grid;place-items:center;margin-top:2px}
.runs-check strong{font-size:12.4px;font-weight:650;display:block}
.runs-check small{display:block;font-size:11.3px;color:var(--runs-t3);margin-top:1px;overflow-wrap:anywhere}
.runs-verdict{grid-column:1/-1;display:flex;align-items:center;gap:var(--s4);padding:var(--s4);
  border-radius:10px;border:1px solid var(--runs-line2);background:color-mix(in srgb,var(--runs-raise) 55%,transparent);flex-wrap:wrap}
.runs-verdict[data-state=BLOCKED]{border-color:color-mix(in srgb,var(--runs-bad) 50%,transparent);background:color-mix(in srgb,var(--runs-bad) 9%,var(--runs-panel))}
.runs-verdict[data-state=READY]{border-color:color-mix(in srgb,var(--runs-ok) 48%,transparent);background:color-mix(in srgb,var(--runs-ok) 9%,var(--runs-panel))}
.runs-verdict[data-state=ACTIVE]{border-color:color-mix(in srgb,var(--runs-info) 48%,transparent);background:color-mix(in srgb,var(--runs-info) 9%,var(--runs-panel))}
.runs-verdict[data-state=CLOSED]{border-color:color-mix(in srgb,var(--runs-t3) 45%,transparent);background:color-mix(in srgb,var(--runs-t3) 8%,var(--runs-panel))}
.runs-verdict[data-state=ACTIVE] .runs-verdictico{color:var(--runs-info)}
.runs-verdict[data-state=CLOSED] .runs-verdictico{color:var(--runs-t2)}
.runs-verdictico{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;
  border:2px solid currentColor}
.runs-verdict[data-state=BLOCKED] .runs-verdictico{color:var(--runs-bad)}
.runs-verdict[data-state=READY] .runs-verdictico{color:var(--runs-ok)}
.runs-verdictcopy{min-width:220px;flex:1}
.runs-verdictcopy h3{font-size:16px;font-weight:700;letter-spacing:-.01em}
.runs-verdict[data-state=BLOCKED] .runs-verdictcopy h3{color:#ffb3b3}
.runs-verdict[data-state=READY] .runs-verdictcopy h3{color:#9df3d1}
.runs-verdict[data-state=ACTIVE] .runs-verdictcopy h3{color:#cfe6ff}
.runs-verdict[data-state=CLOSED] .runs-verdictcopy h3{color:var(--runs-t1)}
.runs-verdictcopy p{font-size:12.4px;color:var(--runs-t2);margin-top:3px}
.runs-verdictcopy .runs-summary{margin-top:5px;font-size:12.4px;font-weight:650}
.runs-verdictact{display:grid;gap:6px;justify-items:center;padding:10px 16px;border-radius:9px;
  border:1px dashed var(--runs-line2);background:color-mix(in srgb,var(--runs-bg) 65%,transparent);min-width:190px;text-align:center}
.runs-verdictact small{font-size:10.5px;color:var(--runs-t3);line-height:1.4}

/* ---------- ledgers (timeline / observations / events / artifacts) ---------- */
.runs-ledger{padding:var(--s3) var(--s4) var(--s4);overflow:auto;min-height:0;display:grid;gap:var(--s3);align-content:start}
.runs-ledgerhead{display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap}
.runs-ledgerhead h2{font-size:14.5px;font-weight:700;letter-spacing:-.01em}
.runs-ledgerhead p{font-size:11.5px;color:var(--runs-t3)}
.runs-flow{display:grid;gap:0;border:1px solid var(--runs-line);border-radius:10px;overflow:hidden;
  background:color-mix(in srgb,var(--runs-panel) 92%,transparent)}
.runs-flowrow{display:grid;grid-template-columns:64px 92px minmax(0,1fr) auto;gap:var(--s3);align-items:start;
  padding:9px var(--s3);border-block-end:1px solid color-mix(in srgb,var(--runs-line) 70%,transparent);font-size:12.2px}
.runs-flowrow:last-child{border-block-end:0}
.runs-flowrow:hover{background:color-mix(in srgb,var(--runs-accent) 5%,transparent)}
.runs-flowrow .runs-seq{font:11px var(--mono,monospace);color:var(--runs-accent)}
.runs-flowrow .runs-when{font:11px var(--mono,monospace);color:var(--runs-t3);white-space:nowrap}
.runs-flowrow strong{font-weight:650;display:block}
.runs-flowrow small{display:block;color:var(--runs-t3);font-size:11.3px;margin-top:1px}
.runs-flowrow .runs-who{font:10.5px var(--mono,monospace);color:var(--runs-t3);white-space:nowrap}
.runs-gap{display:flex;align-items:center;gap:8px;padding:6px var(--s3);font-size:11.3px;color:#ffd9a6;
  background:color-mix(in srgb,var(--runs-warn) 10%,transparent);border-block-end:1px solid color-mix(in srgb,var(--runs-line) 70%,transparent)}
.runs-terminal{display:flex;flex-direction:column;gap:0;padding:0;flex:none;
  border-block-start:1px solid var(--runs-line2);background:color-mix(in srgb,var(--runs-panel) 85%,transparent)}
.runs-terminalbar{display:flex;align-items:center;gap:var(--s3);padding:8px var(--s4);flex-wrap:wrap}
.runs-terminallabel{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--runs-t1);white-space:nowrap}
.runs-terminalhint{font-size:11.4px;color:var(--runs-t3);min-width:0;overflow-wrap:anywhere}
.runs-terminal>.operational-host{border-block-start:1px solid var(--runs-line);max-height:340px}
/* overflow menu */
.runs-menu{position:absolute;top:calc(100% + 6px);inset-inline-end:0;z-index:40;min-width:238px;display:grid;gap:2px;
  padding:6px;border:1px solid var(--runs-line2);border-radius:9px;background:var(--elev,var(--bg2,#0a1a2b));
  box-shadow:0 14px 34px rgba(0,0,0,.45)}
.runs-menuitem{display:flex;align-items:center;gap:9px;width:100%;min-height:32px;padding:0 9px;border-radius:6px;
  border:0;background:transparent;color:var(--runs-t1);font-size:12.3px;text-align:start;cursor:pointer}
.runs-menuitem:hover:not(:disabled){background:color-mix(in srgb,var(--runs-accent) 12%,transparent)}
.runs-menuitem:disabled{opacity:.45;cursor:not-allowed}
.runs-menuhint{padding:6px 9px 2px;font-size:10.5px;line-height:1.45;color:var(--runs-t3);border-block-start:1px solid var(--runs-line);margin-top:4px}
/* shell region roots (LEFT / RIGHT panes) */
.runs-shell-left,.runs-shell-right{display:flex;flex-direction:column;gap:var(--s3);min-height:100%}
.runs-shell-left .runs-navitem{min-height:33px}
.runs-status{display:flex;align-items:center;gap:var(--s3);padding:6px var(--s4);flex-wrap:wrap;
  border-block-start:1px solid var(--runs-line);background:color-mix(in srgb,var(--runs-bg) 70%,transparent);
  font-size:11.2px;color:var(--runs-t3);flex:none}
.runs-status .runs-statusmsg{color:var(--runs-t2);min-width:0;overflow-wrap:anywhere}
.runs-status .runs-statusmsg[data-tone=error]{color:#ffb3b3}
.runs-status .runs-statusmsg[data-tone=ok]{color:#9df3d1}
.runs-status .runs-spacer{margin-inline-start:auto}
.runs-empty{display:grid;gap:6px;justify-items:center;padding:34px var(--s4);text-align:center;color:var(--runs-t3);font-size:12.4px}
.runs-empty strong{color:var(--runs-t2);font-size:13px}
.runs-bar-progress{height:5px;border-radius:999px;background:color-mix(in srgb,var(--runs-bg) 80%,transparent);
  border:1px solid var(--runs-line);overflow:hidden}
.runs-bar-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--runs-accent),color-mix(in srgb,var(--runs-info) 70%,var(--runs-accent)))}

/* ---------- responsive ---------- */
@media (max-width:1180px){
  .runs-split{grid-template-columns:minmax(0,1fr)}
  .runs-split>*+*{border-inline-start:0;border-block-start:1px solid var(--runs-line)}
  .runs-facts{gap:var(--s4);margin-inline-start:0;width:100%;order:3}
  .runs-identity{gap:var(--s3)}
  .runs-rail{width:200px}
}
@media (max-width:980px){
  .runs-body{flex-direction:column}
  .runs-rail,.runs-rail[data-side=end]{width:100%;border-inline:0;border-block-end:1px solid var(--runs-line)}
  .runs-rail[data-side=start] .runs-structure{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));display:grid}
}
@media (max-width:1240px){
  .runs-detailgrid{grid-template-columns:auto minmax(0,1fr)}
}
@media (max-width:820px){
  .runs-bar{gap:var(--s2);flex-wrap:wrap;padding-inline:var(--s3)}
  .runs-actions{width:100%;justify-content:flex-start;margin-inline-start:0;padding-block:0 8px}
  .runs-fact dd{white-space:normal}
  .runs-rail[data-side=end]{width:100%;border-inline-start:0;border-block-start:1px solid var(--runs-line)}
  .runs-flowrow{grid-template-columns:56px minmax(0,1fr);}
  .runs-flowrow .runs-who{grid-column:2}
  .runs-verdict{gap:var(--s3)}
}
@media (prefers-reduced-motion:reduce){.runs-workspace *{transition:none!important}}
</style>`;
