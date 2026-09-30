/**
 * W02-LEARN · local presentation system.
 *
 * Surface-specific styles only: type scale, spacing scale, radius set, states.
 * Uses Foundation colour tokens so Learn reads as the same product; all layout
 * uses logical properties so RTL/LTR mirror without any baked direction.
 */
const CSS=`
.lsr{--lsr-gap:12px;--lsr-pad:12px;--lsr-r:10px;--lsr-rs:7px;--lsr-accent:var(--accent,#38c7ff);--lsr-ok:var(--oks,#3ddc97);--lsr-warn:var(--warns,#ffcc66);--lsr-idle:var(--text3,#6b8496);
  display:grid;gap:var(--lsr-gap);min-width:0;direction:inherit;font-family:var(--ui);color:var(--text)}
.lsr-eyebrow{font:650 9.5px/1.3 var(--mono);letter-spacing:.11em;text-transform:uppercase;color:var(--lsr-accent);margin:0}
.lsr h2.lsr-title{margin:2px 0 0;font-size:17px;line-height:1.25;font-weight:760;color:var(--text);letter-spacing:-.005em}
.lsr h3{margin:0;font-size:11.5px;font-weight:750;letter-spacing:.02em;color:var(--text2)}
.lsr p{margin:0;line-height:1.55;color:var(--text2);font-size:11.5px}
.lsr .lsr-meta{font-size:10px;color:var(--text3);line-height:1.45}
.lsr .lsr-meta bdi{font-family:var(--mono);font-size:9.5px}

/* ── shared atoms ─────────────────────────────────────────── */
.lsr-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border:1px solid var(--line);
  border-radius:999px;background:color-mix(in srgb,var(--bg2,#0a1c2b) 88%,transparent);
  font-size:9.5px;font-weight:680;color:var(--text2);line-height:1.35;max-width:100%}
.lsr-chip bdi{font-family:var(--mono);font-size:9px}
.lsr-chip[data-tone=accent]{border-color:color-mix(in srgb,var(--lsr-accent) 45%,transparent);
  background:color-mix(in srgb,var(--lsr-accent) 13%,transparent);color:color-mix(in srgb,var(--lsr-accent) 78%,var(--text))}
.lsr-chip[data-tone=ok]{border-color:color-mix(in srgb,var(--lsr-ok) 40%,transparent);
  background:color-mix(in srgb,var(--lsr-ok) 12%,transparent);color:color-mix(in srgb,var(--lsr-ok) 72%,var(--text))}
.lsr-chip[data-tone=warn]{border-color:color-mix(in srgb,var(--lsr-warn) 38%,transparent);
  background:color-mix(in srgb,var(--lsr-warn) 11%,transparent);color:color-mix(in srgb,var(--lsr-warn) 74%,var(--text))}
.lsr-chip[data-tone=mute]{opacity:.92}
.lsr-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.lsr-bar{height:6px;border-radius:999px;background:color-mix(in srgb,var(--line) 70%,transparent);overflow:hidden}
.lsr-bar>i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--lsr-accent),color-mix(in srgb,var(--lsr-ok) 70%,var(--lsr-accent)))}
.lsr-actions{display:flex;flex-wrap:wrap;gap:7px}
.lsr-actions .btn{font-size:11px}
.lsr-sep{height:1px;background:color-mix(in srgb,var(--line) 72%,transparent);border:0;margin:0}

/* ── LEFT: learning path ──────────────────────────────────── */
#domainLeftRegion .lsr,#domainLeftRegion.lsr{gap:14px}
.lsr-pathhead{display:grid;gap:7px;padding:11px 11px 12px;border:1px solid color-mix(in srgb,var(--lsr-accent) 26%,var(--line));
  border-radius:var(--lsr-r);background:
    radial-gradient(120% 120% at 8% 0%,color-mix(in srgb,var(--lsr-accent) 15%,transparent),transparent 62%),
    color-mix(in srgb,var(--panel,#0a1c2b) 92%,transparent)}
.lsr-pathhead .lsr-pct{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.lsr-pathhead .lsr-pct strong{font:760 26px/1 var(--ui);letter-spacing:-.02em;color:var(--text)}
.lsr-pathhead .lsr-pct span{font-size:10px;color:var(--text3);font-weight:650}
.lsr-pathhead .lsr-sub{display:flex;flex-wrap:wrap;gap:6px}

.lsr-group{display:grid;gap:6px}
.lsr-group>.lsr-grouphd{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:0 2px 2px;border-bottom:1px solid color-mix(in srgb,var(--line) 65%,transparent)}
.lsr-group>.lsr-grouphd span{font:650 9.5px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}

.lsr-stage{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:9px;align-items:start;
  width:100%;text-align:start;padding:9px 9px;border:1px solid transparent;border-radius:var(--lsr-rs);
  background:transparent;color:inherit;cursor:pointer;position:relative;min-width:0}
.lsr-stage:hover{background:color-mix(in srgb,var(--text) 5%,transparent)}
.lsr-stage[aria-current=true]{border-color:color-mix(in srgb,var(--lsr-accent) 40%,transparent);
  background:linear-gradient(90deg,color-mix(in srgb,var(--lsr-accent) 15%,transparent),color-mix(in srgb,var(--lsr-accent) 5%,transparent))}
.lsr-stage[aria-disabled=true]{cursor:default;opacity:.86}
.lsr-rail{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;
  border:1.5px solid color-mix(in srgb,var(--text3) 70%,transparent);color:var(--text3);
  font:700 9.5px/1 var(--mono);background:color-mix(in srgb,var(--bg1,#081826) 90%,transparent);position:relative;z-index:1}
.lsr-stage[aria-current=true] .lsr-rail{border-color:var(--lsr-accent);color:var(--lsr-accent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--lsr-accent) 18%,transparent)}
.lsr-stage[data-state=done] .lsr-rail{border-color:color-mix(in srgb,var(--lsr-ok) 70%,transparent);color:var(--lsr-ok)}
.lsr-stage[data-state=idle] .lsr-rail{border-style:dashed}
.lsr-stagelist{display:grid;gap:2px;position:relative}
.lsr-stagelist>.lsr-stage:not(:last-child)::after{content:"";position:absolute;top:27px;bottom:-9px;
  inset-inline-start:10px;width:1.5px;background:color-mix(in srgb,var(--line) 85%,transparent)}
.lsr-stage .lsr-stx{display:grid;gap:2px;min-width:0}
.lsr-stage .lsr-nm{font-size:11.5px;font-weight:700;color:var(--text);line-height:1.3}
.lsr-stage .lsr-sb{font-size:10px;color:var(--text3);line-height:1.45;margin-top:2px;overflow-wrap:anywhere}
.lsr-stage .lsr-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}

.lsr-source{display:grid;gap:6px;padding:10px;border:1px dashed color-mix(in srgb,var(--lsr-warn) 34%,var(--line));
  border-radius:var(--lsr-r);background:color-mix(in srgb,var(--lsr-warn) 6%,transparent)}
.lsr-source .lsr-srcrow{display:flex;align-items:center;justify-content:space-between;gap:8px}
.lsr-source .lsr-srcrow strong{font-size:11px;font-weight:700}
.lsr-source p{font-size:10px;line-height:1.5;color:var(--text3)}
.lsr-source dl{display:grid;gap:3px;margin:0}
.lsr-source dl>div{display:flex;justify-content:space-between;gap:8px;font-size:9.5px}
.lsr-source dt{color:var(--text3)}
.lsr-source dd{margin:0;font-family:var(--mono);font-size:9px;color:var(--text2);text-align:end;min-width:0;overflow-wrap:anywhere}

.lsr-outline{display:grid;gap:6px}
.lsr-outline .treesearch{margin-bottom:0}
.lsr-empty{padding:9px;border:1px dashed color-mix(in srgb,var(--line) 80%,transparent);border-radius:var(--lsr-rs);
  font-size:10px;line-height:1.5;color:var(--text3)}

/* ── CENTER: activity workbench ───────────────────────────── */
.lsr-work{display:grid;gap:12px;padding:16px 18px 4px;direction:inherit;min-width:0}
.lsr-workhd{display:grid;gap:8px;padding-bottom:13px;border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent)}
.lsr-workhd .lsr-idrow{display:flex;flex-wrap:wrap;align-items:center;gap:7px}
.lsr-workhd .lsr-idrow .lsr-chip{font-size:10px}

.lsr-progress{display:grid;gap:7px;padding:11px 12px;border:1px solid color-mix(in srgb,var(--line) 85%,transparent);
  border-radius:var(--lsr-r);background:color-mix(in srgb,var(--panel,#0a1c2b) 88%,transparent)}
.lsr-progress .lsr-prow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.lsr-progress .lsr-prow strong{font-size:11.5px;font-weight:720}
.lsr-progress .lsr-legend{display:flex;gap:6px;flex-wrap:wrap}

.lsr-objective{display:grid;grid-template-columns:26px minmax(0,1fr);gap:11px;align-items:start;
  padding:12px 13px;border-radius:var(--lsr-r);border:1px solid color-mix(in srgb,var(--lsr-accent) 32%,transparent);
  background:linear-gradient(135deg,color-mix(in srgb,var(--lsr-accent) 13%,transparent),color-mix(in srgb,var(--lsr-accent) 4%,transparent))}
.lsr-objective .lsr-oicon{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;
  background:color-mix(in srgb,var(--lsr-accent) 22%,transparent);color:var(--lsr-accent);flex:none}
.lsr-objective .lsr-obody{display:grid;gap:5px;min-width:0}
.lsr-objective .lsr-obody .lsr-otext{font-size:12.5px;line-height:1.5;color:var(--text);font-weight:620}
.lsr-objective .lsr-ometa{display:flex;gap:6px;flex-wrap:wrap}

.lsr-panel{border:1px solid color-mix(in srgb,var(--line) 88%,transparent);border-radius:var(--lsr-r);
  background:color-mix(in srgb,var(--panel,#0a1c2b) 90%,transparent);overflow:hidden}
.lsr-panel .lsr-phead2{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
  padding:11px 13px;border-bottom:1px solid color-mix(in srgb,var(--line) 72%,transparent)}
.lsr-panel .lsr-phead2 .lsr-hdtx{display:grid;gap:3px;min-width:0}
.lsr-panel .lsr-pbody2{display:grid;gap:11px;padding:13px}
.lsr-panel .lsr-pfoot{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;
  padding:10px 13px;border-top:1px solid color-mix(in srgb,var(--line) 72%,transparent);
  background:color-mix(in srgb,var(--text) 3%,transparent)}

.lsr-steps{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.lsr-steps .lsr-step{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;
  border:1px solid var(--line);font-size:10px;font-weight:660;color:var(--text3);background:color-mix(in srgb,var(--bg2,#0a1c2b) 70%,transparent)}
.lsr-steps .lsr-step[data-on=true]{border-color:color-mix(in srgb,var(--lsr-accent) 45%,transparent);
  color:color-mix(in srgb,var(--lsr-accent) 80%,var(--text));background:color-mix(in srgb,var(--lsr-accent) 12%,transparent)}
.lsr-steps .lsr-step[data-on=done]{border-color:color-mix(in srgb,var(--lsr-ok) 42%,transparent);
  color:color-mix(in srgb,var(--lsr-ok) 78%,var(--text));background:color-mix(in srgb,var(--lsr-ok) 11%,transparent)}
.lsr-steps .lsr-arrow{color:var(--text3);font-size:11px;line-height:1}
.lsr-field{display:grid;gap:5px;min-width:0}
.lsr-field label{font-size:10px;font-weight:660;color:var(--text2);letter-spacing:.01em}
.lsr-field textarea{width:100%;min-height:70px;resize:vertical;padding:9px 10px;font:inherit;font-size:11.5px;
  line-height:1.55;color:var(--text);background:color-mix(in srgb,var(--bg1,#081826) 92%,transparent);
  border:1px solid color-mix(in srgb,var(--line) 92%,transparent);border-radius:var(--lsr-rs);outline:0}
.lsr-field textarea:focus-visible{border-color:color-mix(in srgb,var(--lsr-accent) 55%,transparent);
  box-shadow:0 0 0 2px color-mix(in srgb,var(--lsr-accent) 22%,transparent)}
.lsr-field textarea:disabled{opacity:.7;cursor:not-allowed;background:color-mix(in srgb,var(--text) 4%,transparent)}
.lsr-blockreason{display:flex;gap:7px;align-items:flex-start;padding:8px 10px;border-radius:var(--lsr-rs);
  border:1px solid color-mix(in srgb,var(--lsr-warn) 30%,transparent);
  background:color-mix(in srgb,var(--lsr-warn) 7%,transparent);font-size:10.5px;line-height:1.5;color:var(--text2)}
.lsr-blockreason .icon{color:var(--lsr-warn);flex:none;margin-top:1px}

.lsr-after{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
  padding:9px 12px;border:1px solid color-mix(in srgb,var(--line) 82%,transparent);
  border-radius:var(--lsr-r);background:color-mix(in srgb,var(--text) 3%,transparent)}
.lsr-after .lsr-actions .btn{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;padding:5px 10px}
.lsr-after .lsr-actions .icon{width:13px;height:13px;color:var(--lsr-accent);flex:none}
.lsr-facts{display:grid;gap:4px;margin:0}
.lsr-facts>div{display:flex;justify-content:space-between;gap:10px;font-size:10.5px;padding:3px 0;
  border-bottom:1px solid color-mix(in srgb,var(--line) 45%,transparent)}
.lsr-facts>div:last-child{border-bottom:0}
.lsr-facts dt{color:var(--text3)}
.lsr-facts dd{margin:0;color:var(--text2);text-align:end;min-width:0;overflow-wrap:anywhere}

/* document region alignment */
#editorDocument{direction:inherit}
.lsr-work+.docmeta{padding-inline-start:18px;padding-inline-end:18px}
@media (max-width:1100px){.lsr-work{padding:14px 14px 4px}.lsr-work h2.lsr-title{font-size:16px}}
@media (max-width:760px){
  .lsr-work{padding:12px 11px 4px;gap:12px}
  .lsr-pathhead .lsr-pct strong{font-size:22px}
  .lsr-objective{grid-template-columns:1fr}
  .lsr-facts>div{flex-direction:column;gap:1px}
  .lsr-facts dd{text-align:start}
}
@media (prefers-reduced-motion:reduce){.lsr *{transition:none!important;animation:none!important}}
`;

/** Idempotently inject the Learn presentation system. */
export function ensureLearnStyles(doc:Document=document){
  if(doc.querySelector('#learnSurfaceStyle'))return false;
  const style=doc.createElement('style');
  style.id='learnSurfaceStyle';
  style.dataset.surface='learn';
  style.textContent=CSS;
  doc.head.append(style);
  return true;
}
