/* W05-BACKUP · surface-owned stylesheet.
 *
 * Composition authority: CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png (restore drill is
 * the focal work). Craft: professional-ui-ux-composition — one focal panel per region, spacing
 * scale 4/8/12/16/20/24, 3-step radius set, no emoji, no per-group boxing beyond what carries
 * meaning. Only tokens that actually exist in the shipped CSS are referenced; every product token
 * the surface needs is additionally pinned here with a fallback so an undefined shared token can
 * never silently drop a background (baseline defect D-14).
 *
 * Direction is never baked: every property is logical (inline-start/end, block, inset-inline).
 * Container queries compose each block for the width it actually has, so collapsing a shared pane
 * re-composes the surface instead of squeezing it.
 */

export const STYLE = `
.bk-root{
  --bk-panel:var(--bg2,#0a1a29);
  --bk-sunken:var(--bg1,#081522);
  --bk-raised:var(--elev,#10263a);
  --bk-line:var(--line,#17354d);
  --bk-line-strong:var(--line2,#285774);
  --bk-text:var(--text,#edf6fc);
  --bk-text2:var(--text2,#b9c9d6);
  --bk-text3:var(--text3,#8298aa);
  --bk-ok:var(--ok,#53d694);
  --bk-warn:var(--warn,#f4bd65);
  --bk-bad:var(--bad,#ff6d78);
  --bk-accent:var(--accent,#5b9cf5);
  --bk-r-sm:6px;--bk-r-md:10px;--bk-r-lg:14px;
  display:grid;gap:16px;min-width:0;padding:2px 2px 10px;
  container-type:inline-size;
  color:var(--bk-text);
}
.bk-root *,.bk-root *::before,.bk-root *::after{box-sizing:border-box}
.bk-root [data-tone=ok],.bkl [data-tone=ok],.bkr [data-tone=ok],.bkb [data-tone=ok]{color:var(--bk-ok)}
.bk-root [data-tone=warn],.bkl [data-tone=warn],.bkr [data-tone=warn],.bkb [data-tone=warn]{color:var(--bk-warn)}
.bk-root [data-tone=bad],.bkl [data-tone=bad],.bkr [data-tone=bad],.bkb [data-tone=bad]{color:var(--bk-bad)}
.bk-root [data-tone=muted],.bkl [data-tone=muted],.bkr [data-tone=muted],.bkb [data-tone=muted]{color:var(--bk-text3)}
.bk-root [data-tone=info],.bkl [data-tone=info],.bkr [data-tone=info],.bkb [data-tone=info]{color:var(--bk-accent)}
.bk-root bdi,.bk-root .bk-mono{font-family:var(--mono);font-variant-ligatures:none}
.bk-root bdi,.bkl bdi,.bkr bdi,.bkb bdi{unicode-bidi:isolate;overflow-wrap:break-word;word-break:normal}

/* ── identity ─────────────────────────────────────────────── */
.bk-head{display:flex;flex-wrap:wrap;gap:14px 18px;align-items:flex-end;justify-content:space-between}
.bk-id{min-width:0;display:grid;gap:5px}
.bk-eyebrow{font:700 10.5px/1 var(--mono);letter-spacing:.14em;color:var(--bk-accent);text-transform:uppercase}
.bk-title{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0}
.bk-title h1{margin:0;font-size:clamp(21px,2.1vw,27px);font-weight:800;line-height:1.15;letter-spacing:-.01em}
.bk-title .bk-sub{font-size:12.5px;font-weight:600;color:var(--bk-text3);padding-inline-start:10px;border-inline-start:1px solid var(--bk-line)}
.bk-lead{margin:0;font-size:13px;line-height:1.6;color:var(--bk-text2);max-width:74ch}
.bk-act{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.bk-act .btn{padding:7px 11px;font-size:12px;white-space:nowrap;border-color:var(--bk-line-strong)}
.bk-act .btn[data-bk-variant=primary]{
  background:color-mix(in srgb,var(--bk-accent) 22%,transparent);
  border-color:color-mix(in srgb,var(--bk-accent) 70%,transparent);
  color:var(--bk-text);font-weight:700;
}
.bk-act .btn[data-bk-variant=primary]:hover{background:color-mix(in srgb,var(--bk-accent) 32%,transparent)}

/* ── safety banner ────────────────────────────────────────── */
.bk-banner{
  display:flex;gap:9px;align-items:flex-start;
  border:1px solid color-mix(in srgb,var(--bk-warn) 45%,transparent);
  background:color-mix(in srgb,var(--bk-warn) 9%,transparent);
  border-radius:var(--bk-r-md);padding:9px 12px;font-size:12px;line-height:1.6;color:var(--bk-text2);
}
.bk-banner .bk-i{flex:none;margin-top:2px;color:var(--bk-warn)}
.bk-banner bdi{color:var(--bk-text)}

/* ── panels ───────────────────────────────────────────────── */
.bk-panel{
  min-width:0;border:1px solid var(--bk-line);border-radius:var(--bk-r-lg);
  background:linear-gradient(180deg,color-mix(in srgb,var(--bk-raised) 55%,transparent),transparent 120px),var(--bk-panel);
  padding:14px 16px 16px;display:grid;gap:12px;
}
.bk-panel.is-focal{border-color:var(--bk-line-strong);box-shadow:0 1px 0 rgba(255,255,255,.03) inset,0 8px 24px -18px rgba(0,0,0,.9)}
.bk-sec-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
.bk-sec-head h2{margin:0;font-size:15px;font-weight:750;letter-spacing:-.005em}
.bk-sec-head .bk-note{font-size:11px;color:var(--bk-text3)}

/* ── drill report head + meta ─────────────────────────────── */
.bk-report{display:grid;gap:12px}
.bk-report-head{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.bk-report-id{display:flex;gap:9px;align-items:baseline;min-width:0;flex-wrap:wrap}
.bk-report-id h3{margin:0;font-size:17px;font-weight:800;letter-spacing:-.01em}
.bk-report-id h3 bdi{font-size:15px}
.bk-pill{
  display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 11px;
  font:700 11px/1.2 var(--mono);border:1px solid currentColor;white-space:nowrap;
}
.bk-pill .bk-i{color:inherit}
.bk-pill[data-tone=ok]{background:color-mix(in srgb,var(--bk-ok) 14%,transparent)}
.bk-pill[data-tone=bad]{background:color-mix(in srgb,var(--bk-bad) 14%,transparent)}
.bk-pill[data-tone=muted]{background:color-mix(in srgb,var(--bk-text3) 12%,transparent)}
.bk-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:0;border-block:1px solid var(--bk-line)}
.bk-meta div{display:flex;flex-direction:column;gap:3px;min-width:0;padding-block:9px;padding-inline-end:12px;border-inline-end:1px solid var(--bk-line)}
.bk-meta div:last-child{border-inline-end:0}
.bk-meta div:not(:first-child){padding-inline-start:12px}
.bk-meta dt,.bk-meta .bk-k{font-size:10.5px;color:var(--bk-text3);letter-spacing:.02em}
.bk-meta .bk-v{font-size:12.5px;font-weight:650;overflow-wrap:anywhere}
.bk-meta .bk-v bdi{font-size:12px}

/* ── 8-stage pipeline ─────────────────────────────────────── */
.bk-pipe{position:relative;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;padding-block:2px}
.bk-pipe::before{
  content:"";position:absolute;inset-block-start:17px;inset-inline:5.5%;height:1px;
  background:linear-gradient(90deg,transparent,var(--bk-line-strong) 8%,var(--bk-line-strong) 92%,transparent);
}
.bk-step{position:relative;z-index:1;display:grid;justify-items:center;gap:5px;text-align:center;min-width:0}
.bk-dot{
  width:34px;height:34px;border-radius:50%;display:grid;place-items:center;
  border:1.5px solid var(--bk-line-strong);background:var(--bk-sunken);
  font:700 12px/1 var(--mono);color:var(--bk-text3);
}
.bk-step[data-tone=ok] .bk-dot{border-color:color-mix(in srgb,var(--bk-ok) 75%,transparent);color:var(--bk-ok);background:color-mix(in srgb,var(--bk-ok) 12%,var(--bk-sunken))}
.bk-step[data-tone=warn] .bk-dot{border-color:color-mix(in srgb,var(--bk-warn) 70%,transparent);color:var(--bk-warn);background:color-mix(in srgb,var(--bk-warn) 10%,var(--bk-sunken))}
.bk-step[data-tone=bad] .bk-dot{border-color:color-mix(in srgb,var(--bk-bad) 75%,transparent);color:var(--bk-bad);background:color-mix(in srgb,var(--bk-bad) 12%,var(--bk-sunken))}
.bk-step .bk-step-name{font-size:11px;line-height:1.35;color:var(--bk-text2);overflow-wrap:anywhere}
.bk-step .bk-step-state{font:700 9.5px/1 var(--mono);letter-spacing:.06em}

/* ── verification grid ────────────────────────────────────── */
.bk-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.bk-check{
  display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 9px;align-items:center;
  border:1px solid var(--bk-line);border-radius:var(--bk-r-md);background:var(--bk-sunken);padding:9px 10px;min-width:0;
}
.bk-check .bk-ico{
  grid-row:span 2;width:26px;height:26px;border-radius:var(--bk-r-sm);display:grid;place-items:center;
  background:color-mix(in srgb,var(--bk-accent) 14%,transparent);color:var(--bk-accent);
}
.bk-check[data-tone=ok] .bk-ico{background:color-mix(in srgb,var(--bk-ok) 14%,transparent);color:var(--bk-ok)}
.bk-check[data-tone=warn] .bk-ico{background:color-mix(in srgb,var(--bk-warn) 14%,transparent);color:var(--bk-warn)}
.bk-check[data-tone=bad] .bk-ico{background:color-mix(in srgb,var(--bk-bad) 14%,transparent);color:var(--bk-bad)}
.bk-check .bk-name{font-size:12px;font-weight:650;line-height:1.3;min-width:0;overflow-wrap:anywhere}
.bk-check .bk-state{font:700 9.5px/1 var(--mono);letter-spacing:.06em;justify-self:end}
.bk-check .bk-val{grid-column:2/-1;font-size:11px;color:var(--bk-text3);overflow-wrap:anywhere;min-width:0}
.bk-check .bk-val bdi{font-size:10.5px}

/* ── expected vs actual metrics ───────────────────────────── */
.bk-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--bk-text3)}
.bk-legend span{display:inline-flex;gap:6px;align-items:center}
.bk-legend i{width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block}
.bk-legend [data-tone=ok] i{background:var(--bk-ok)}
.bk-legend [data-tone=warn] i{background:var(--bk-warn)}
.bk-legend [data-tone=bad] i{background:var(--bk-bad)}
.bk-metrics{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.bk-metric{
  border:1px solid var(--bk-line);border-radius:var(--bk-r-md);background:var(--bk-sunken);
  padding:10px 10px 9px;display:grid;gap:3px;min-width:0;text-align:center;align-content:center;
}
.bk-metric .bk-k{font-size:10.5px;color:var(--bk-text3)}
.bk-metric .bk-v{font:800 18px/1.15 var(--mono);letter-spacing:-.02em;overflow-wrap:anywhere}
.bk-metric.is-text .bk-v{font-size:12px;font-weight:700;letter-spacing:0;overflow-wrap:break-word}
.bk-metric .bk-c{font-size:10px;font-weight:650}
.bk-metric[data-tone=ok]{border-color:color-mix(in srgb,var(--bk-ok) 34%,var(--bk-line))}
.bk-metric[data-tone=bad]{border-color:color-mix(in srgb,var(--bk-bad) 46%,var(--bk-line))}
.bk-metric[data-tone=muted]{border-style:dashed}
.bk-empty-note{margin:0;font-size:12px;color:var(--bk-text3)}
.bk-truth{display:flex;gap:7px 16px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--bk-line);padding-top:10px;font-size:11px;color:var(--bk-text3)}
.bk-truth>span:first-child{font-weight:700;letter-spacing:.02em}
.bk-truth bdi{font:700 11px var(--mono);color:var(--bk-text2)}

/* ── not-run state ────────────────────────────────────────── */
.bk-nostrun{display:grid;gap:6px;border:1px dashed var(--bk-line-strong);border-radius:var(--bk-r-md);padding:11px 13px;background:color-mix(in srgb,var(--bk-sunken) 70%,transparent)}
.bk-nostrun strong{font-size:13px}
.bk-nostrun p{margin:0;font-size:12px;line-height:1.6;color:var(--bk-text2)}

/* ── LEFT pane ────────────────────────────────────────────── */
.bkl{display:grid;gap:12px;min-width:0}
.bkl-search{position:relative;display:flex;gap:6px}
.bkl-search .bk-i{position:absolute;inset-inline-start:9px;inset-block-start:9px;color:var(--bk-text3);pointer-events:none}
.bkl-search input{
  flex:1;min-width:0;background:var(--bk-sunken);border:1px solid var(--bk-line);border-radius:var(--bk-r-sm);
  color:var(--bk-text);padding-block:7px;padding-inline:28px 9px;font:12px var(--ui);
}
.bkl-search input::placeholder{color:var(--bk-text3)}
.bkl-search input:focus-visible{outline:2px solid var(--bk-accent);outline-offset:1px}
.bkl-grp{display:grid;gap:7px;min-width:0}
.bkl-grp>summary{
  display:flex;align-items:center;gap:7px;cursor:pointer;list-style:none;
  font-size:11.5px;font-weight:700;color:var(--bk-text2);letter-spacing:.01em;padding:2px 0;
}
.bkl-grp>summary::-webkit-details-marker{display:none}
.bkl-grp>summary .bk-i{color:var(--bk-text3)}
.bkl-grp>summary .bk-cue{display:inline-flex;margin-inline-start:2px;color:var(--bk-text3);transition:transform .15s ease;transform:rotate(90deg)}
.bkl-grp[open]>summary .bk-cue{transform:rotate(-90deg)}
.bkl-count{margin-inline-start:auto;font:700 10.5px/1 var(--mono);color:var(--bk-text3);background:var(--bk-sunken);border:1px solid var(--bk-line);border-radius:999px;padding:3px 7px}
.bkl-list{list-style:none;margin:0;padding:0;display:grid;gap:5px}
.bkl-row{
  width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;
  text-align:start;background:var(--bk-sunken);border:1px solid var(--bk-line);border-radius:var(--bk-r-sm);
  padding:7px 9px;cursor:pointer;color:inherit;min-width:0;
}
.bkl-row:hover{border-color:var(--bk-line-strong)}
.bkl-row:focus-visible{outline:2px solid var(--bk-accent);outline-offset:1px}
.bkl-row[aria-pressed=true]{border-color:var(--bk-accent);background:color-mix(in srgb,var(--bk-accent) 10%,var(--bk-sunken))}
.bkl-row .bk-id-main{grid-column:1;font:600 11.5px/1.35 var(--mono);overflow-wrap:break-word}
.bkl-row .bk-id-meta{grid-column:1;font-size:10.5px;color:var(--bk-text3);display:flex;gap:7px;flex-wrap:wrap}
.bkl-row .bk-tag{grid-column:2;grid-row:1/span 2;font:700 9.5px/1 var(--mono);border:1px solid currentColor;border-radius:999px;padding:4px 6px;align-self:center}
.bkl-facts{display:grid;gap:4px;font-size:11px;color:var(--bk-text3)}
.bkl-facts div{display:flex;justify-content:space-between;gap:8px}
.bkl-facts bdi{font-size:10.5px;color:var(--bk-text2)}
.bkl-empty{margin:0;font-size:11.5px;line-height:1.55;color:var(--bk-text3);border:1px dashed var(--bk-line);border-radius:var(--bk-r-sm);padding:8px 9px}
.bkl-empty b{display:block;color:var(--bk-text2);font-size:12px}
.bkl-act{display:flex;gap:7px;flex-wrap:wrap}
.bkl-act .btn{padding:6px 10px;font-size:11.5px;border-color:var(--bk-line-strong)}
.bkl-act .btn:hover,.bkb .btn:hover,.bkr .btn:hover{border-color:color-mix(in srgb,var(--bk-accent) 60%,var(--bk-line-strong))}
.bkl-act .btn[aria-pressed=true]{
  border-color:var(--bk-accent);color:var(--bk-text);font-weight:700;
  background:color-mix(in srgb,var(--bk-accent) 16%,transparent);
}
.bkl-empty .btn{border-color:var(--bk-line-strong);padding:5px 9px;font-size:11px}

/* ── RIGHT pane ───────────────────────────────────────────── */
.bkr{display:grid;gap:9px;min-width:0}
.bkr-blk{border:1px solid var(--bk-line);border-radius:var(--bk-r-md);background:var(--bk-sunken);padding:10px 11px;min-width:0;display:grid;gap:7px}
.bkr-blk h3{margin:0;display:flex;align-items:center;gap:7px;font-size:12px;font-weight:750}
.bkr-blk h3 .bk-i{color:var(--bk-accent);flex:none}
.bkr-blk dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:5px 10px;font-size:11.5px;align-items:baseline}
.bkr-blk dt{color:var(--bk-text3);white-space:nowrap}
.bkr-blk dd{margin:0;text-align:end;overflow-wrap:anywhere;font-weight:600}
.bkr-blk dd bdi{font-size:10.5px;font-weight:500}
.bkr-blk ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:11.5px;color:var(--bk-text2);line-height:1.5}
.bkr-blk p{margin:0;font-size:11.5px;line-height:1.55;color:var(--bk-text2)}
.bkr-line{display:flex;justify-content:space-between;gap:9px;align-items:baseline;font-size:11.5px}
.bkr-line .bk-n{color:var(--bk-text3);min-width:0}
.bkr-line .bk-x{font-weight:650;text-align:end;overflow-wrap:anywhere}
.bkr-blk.is-risk{border-color:color-mix(in srgb,var(--bk-bad) 50%,var(--bk-line));background:color-mix(in srgb,var(--bk-bad) 7%,var(--bk-sunken))}
.bkr-blk.is-risk h3 .bk-i{color:var(--bk-bad)}
.bkr-blk.is-metric{gap:4px}
.bkr-blk.is-metric .bkr-big{font:800 17px/1.1 var(--mono)}
.bkr-blk.is-metric .bkr-target{font-size:10.5px;color:var(--bk-text3)}
.bkr-metric-pair{display:grid;gap:9px}
.bkr-metric-pair>div{display:grid;gap:2px;min-width:0}
.bkr-ready{display:grid;gap:6px}
.bkr-ready .bkr-line .bk-x bdi{font-size:10.5px}

/* ── BOTTOM shelf ────────────────────────────────────────── */
.bkb{display:grid;gap:8px;min-width:0}
.bkb-scroll{overflow:auto;max-height:230px;border:1px solid var(--bk-line);border-radius:var(--bk-r-sm)}
.bkb-table{width:100%;border-collapse:collapse;font-size:11.5px}
.bkb-table th,.bkb-table td{padding:6px 9px;text-align:start;border-bottom:1px solid var(--bk-line);white-space:nowrap}
.bkb-table thead th{position:sticky;top:0;background:var(--bk-raised);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--bk-text3);font-weight:700}
.bkb-table tbody tr:last-child td{border-bottom:0}
.bkb-table tbody tr:hover td{background:color-mix(in srgb,var(--bk-accent) 7%,transparent)}
.bkb-table td bdi{font-size:10.5px}
.bkb-prov{display:flex;gap:8px 16px;flex-wrap:wrap;font-size:11px;color:var(--bk-text3)}
.bkb-prov bdi{font-size:10.5px;color:var(--bk-text2)}
.bkb details{display:grid;gap:5px}
.bkb summary{cursor:pointer;font-size:11px;color:var(--bk-text3);list-style:none}
.bkb summary::-webkit-details-marker{display:none}
.bkb summary:hover{color:var(--bk-text2)}
.bkb pre{
  margin:0;max-height:200px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;
  font:11px/1.55 var(--mono);background:var(--bk-sunken);border:1px solid var(--bk-line);
  border-radius:var(--bk-r-sm);padding:9px 10px;color:var(--bk-text2);
}
.bkb-empty{margin:0;font-size:11.5px;color:var(--bk-text3)}

/* ── responsive composition (container-aware) ─────────────── */
@container (max-width:700px){
  .bk-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@container (max-width:660px){
  .bk-pipe{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px 6px}
  .bk-pipe::before{display:none}
}
@container (max-width:560px){
  .bk-checks{grid-template-columns:repeat(2,minmax(0,1fr))}
  .bk-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@container (max-width:430px){
  .bk-pipe{grid-template-columns:repeat(2,minmax(0,1fr))}
  .bk-checks{grid-template-columns:minmax(0,1fr)}
  .bk-metrics{grid-template-columns:minmax(0,1fr)}
  .bk-panel{padding:12px}
  .bk-act{width:100%}
}
@media (max-width:760px){
  .bk-panel{padding:12px}
  .bk-meta div{border-inline-end:0;padding-inline-start:0}
}
.bk-root .btn:focus-visible{outline:2px solid var(--bk-accent);outline-offset:2px}
`;
