/* MANUAL AI BRIDGE — SURFACE STYLE SHEET (W05-MANUAL-AI)
 * Scoped to surface-owned hosts only (`[data-ma-owned="manual_ai"]`), so this surface's
 * presentation can be strong without touching any other consumer. Tokens come from the product
 * donor sheet (bg0-3 / surface / elev / line / line2 / text / text2 / text3 / accent / ok / warn
 * / bad / violet / mono / r) — no colour is invented here. */
export const MANUAL_AI_STYLE_ID='w05ManualAiStyle';

export function injectManualAiStyle(doc              =null)     {
  const target=doc||(typeof document!=='undefined'?document:null);
  if(!target||target.getElementById(MANUAL_AI_STYLE_ID))return;
  const style=target.createElement('style');
  style.id=MANUAL_AI_STYLE_ID;
  style.textContent=`
/* ── tokens ───────────────────────────────────────────────────────────────────────────── */
:is(#foundationStage,#domainLeftRegion,#domainContext,#domainToolbar,#domainBottomRegion)[data-ma-owned="manual_ai"]{
  --ma-gap:14px;--ma-pad:15px;--ma-r:12px;--ma-rs:9px;
  --ma-ok:var(--ok);--ma-warn:var(--warn);--ma-bad:var(--bad);--ma-info:var(--accent);--ma-violet:var(--violet);--ma-muted:var(--text3);
}
[data-ma-owned="manual_ai"] .ma-ico{width:15px;height:15px;flex:none;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=ok]{color:var(--ma-ok)}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=warn]{color:var(--ma-warn)}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=bad]{color:var(--ma-bad)}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=info]{color:var(--ma-info)}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=violet]{color:var(--ma-violet)}
[data-ma-owned="manual_ai"] .ma-ico[data-tone=muted]{color:var(--ma-muted)}
[data-ma-owned="manual_ai"] bdi{unicode-bidi:isolate;font-family:var(--mono);font-size:.95em;letter-spacing:.01em}
[data-ma-owned="manual_ai"] .ma-pill{display:inline-flex;align-items:center;gap:5px;border:1px solid currentColor;border-radius:999px;padding:2px 9px;font:700 10px/1.5 var(--mono);white-space:nowrap;background:color-mix(in srgb,currentColor 11%,transparent)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=ok]{color:var(--ma-ok)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=warn]{color:var(--ma-warn)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=bad]{color:var(--ma-bad)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=info]{color:var(--ma-info)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=violet]{color:var(--ma-violet)}
[data-ma-owned="manual_ai"] .ma-pill[data-tone=muted]{color:var(--ma-muted)}

/* ── CENTER · workbench root ──────────────────────────────────────────────────────────── */
#foundationStage[data-ma-owned="manual_ai"]{padding:clamp(12px,1.4vw,20px)}
.ma-root{display:grid;gap:var(--ma-gap);min-width:0;direction:inherit}
.ma-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--line)}
.ma-head-main{min-width:0;flex:1 1 420px}
.ma-eyebrow{font:700 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--accent);display:block}
.ma-head h1{margin:7px 0 0;font-size:clamp(21px,1.9vw,28px);line-height:1.16;display:flex;align-items:baseline;gap:11px;flex-wrap:wrap}
.ma-head h1 .ma-alt{font-size:14px;font-weight:650;color:var(--text3);letter-spacing:.01em}
.ma-lead{margin:8px 0 0;font-size:13px;line-height:1.6;color:var(--text2);max-width:76ch}
.ma-head-facts{list-style:none;margin:2px 0 0;padding:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.ma-head-facts li{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:4px 11px;background:var(--bg1);font:600 10.5px/1.5 var(--mono);color:var(--text2);white-space:nowrap}
.ma-head-facts li[data-tone=ok]{border-color:color-mix(in srgb,var(--ma-ok) 42%,var(--line));color:var(--ma-ok);background:color-mix(in srgb,var(--ma-ok) 7%,var(--bg1))}
.ma-head-facts li[data-tone=warn]{border-color:color-mix(in srgb,var(--ma-warn) 42%,var(--line));color:var(--ma-warn);background:color-mix(in srgb,var(--ma-warn) 7%,var(--bg1))}
[data-ma-owned] .ma-head-facts bdi{font-size:10.5px}

/* sections — lettered, in reference order A…E */
.ma-sec{border:1px solid var(--line);border-radius:var(--ma-r);background:color-mix(in srgb,var(--surface) 92%,transparent);padding:13px var(--ma-pad) 14px;min-width:0}
.ma-sec[data-lead="true"]{border-color:color-mix(in srgb,var(--accent) 24%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 5%,var(--surface)),color-mix(in srgb,var(--surface) 94%,transparent))}
.ma-sec>h2{margin:0 0 12px;display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;font-size:15.5px;font-weight:700;line-height:1.3}
.ma-sec-key{font:700 11px/1.6 var(--mono);color:var(--accent);background:color-mix(in srgb,var(--accent) 13%,transparent);border:1px solid color-mix(in srgb,var(--accent) 34%,var(--line));border-radius:6px;padding:0 7px;letter-spacing:.04em}
.ma-sec>h2 em{font-style:normal;font-size:11.5px;font-weight:600;color:var(--text3)}
.ma-sec-note{margin:10px 0 0;font-size:11.5px;line-height:1.55;color:var(--text3);border-top:1px dashed var(--line);padding-top:9px}

/* A/E · definition grid */
.ma-defs{margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 26px}
.ma-defs>div{min-width:0;display:grid;gap:3px;padding-block:5px;border-bottom:1px solid color-mix(in srgb,var(--line) 62%,transparent)}
.ma-defs dt{font:600 10px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--text3);order:1}
.ma-defs dd{margin:0;order:2;font-size:13.5px;line-height:1.45;color:var(--text);overflow-wrap:anywhere;min-width:0}
.ma-defs dd[data-strong="true"]{font-weight:700}
.ma-defs .ma-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* B · cleared payload rows */
.ma-rows{display:grid;gap:0}
.ma-row{display:grid;grid-template-columns:22px minmax(130px,.42fr) minmax(0,1fr);gap:12px;align-items:baseline;padding:9px 2px;border-bottom:1px solid color-mix(in srgb,var(--line) 62%,transparent)}
.ma-row:last-child{border-bottom:0}
.ma-row>span.ma-lab{font-size:12.5px;color:var(--text2);font-weight:650}
.ma-row>span.ma-val{font-size:13px;color:var(--text);overflow-wrap:anywhere;min-width:0;display:flex;gap:7px;flex-wrap:wrap;align-items:baseline}
.ma-row>span.ma-val[data-tone=ok]{color:var(--ma-ok)}
.ma-row>span.ma-val[data-tone=warn]{color:var(--ma-warn)}
.ma-row>span.ma-val[data-tone=bad]{color:var(--ma-bad)}
.ma-row>span.ma-val[data-tone=muted]{color:var(--text3)}
.ma-row .ma-ico{align-self:center}

/* C · exchange stepper */
.ma-steps{list-style:none;margin:0 0 12px;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0}
.ma-steps li{position:relative;min-width:0;padding:0 6px 0 0;display:grid;justify-items:center;gap:7px;text-align:center}
.ma-step-dot{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--line2);background:var(--bg1);color:var(--text3);font:700 11px var(--mono);position:relative;z-index:1}
.ma-steps li::before{content:"";position:absolute;top:12px;inset-inline-start:-50%;width:100%;height:2px;background:var(--line2);z-index:0}
.ma-steps li:first-child::before{display:none}
.ma-steps li[data-s=done] .ma-step-dot{border-color:var(--ma-ok);background:color-mix(in srgb,var(--ma-ok) 16%,var(--bg1));color:var(--ma-ok)}
.ma-steps li[data-s=done]::before{background:var(--ma-ok)}
.ma-steps li[data-s=current] .ma-step-dot{border-color:var(--ma-warn);background:color-mix(in srgb,var(--ma-warn) 20%,var(--bg1));color:var(--ma-warn);box-shadow:0 0 0 4px color-mix(in srgb,var(--ma-warn) 16%,transparent)}
.ma-steps li[data-s=current]::before{background:var(--ma-ok)}
.ma-steps li[data-s=blocked] .ma-step-dot{border-color:var(--ma-bad);background:color-mix(in srgb,var(--ma-bad) 18%,var(--bg1));color:var(--ma-bad)}
.ma-steps li[data-s=blocked]::before{background:repeating-linear-gradient(90deg,var(--line2) 0 5px,transparent 5px 10px)}
.ma-steps li[data-s=pending]::before{background:repeating-linear-gradient(90deg,var(--line2) 0 5px,transparent 5px 10px)}
.ma-steps .ma-step-lab{font:600 9.5px/1.35 var(--mono);color:var(--text3);letter-spacing:.02em;overflow-wrap:anywhere}
.ma-steps li[data-s=current] .ma-step-lab{color:var(--ma-warn)}
.ma-steps li[data-s=blocked] .ma-step-lab{color:var(--ma-bad)}
.ma-steps li[data-s=done] .ma-step-lab{color:var(--text2)}
.ma-statebar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:11px}
.ma-statebar .ma-now{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:12.5px;color:var(--text2)}
.ma-statebar .ma-upd{font:600 11px var(--mono);color:var(--text3)}

/* D/E duo */
.ma-duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--ma-gap)}
.ma-duo .ma-sec{margin:0}
.ma-facts{margin:0;display:grid;gap:0}
.ma-facts>div{display:grid;grid-template-columns:minmax(120px,.45fr) minmax(0,1fr);gap:12px;padding:8px 2px;border-bottom:1px solid color-mix(in srgb,var(--line) 62%,transparent);align-items:baseline}
.ma-facts>div:last-child{border-bottom:0}
.ma-facts dt{font-size:12px;color:var(--text3);font-weight:650}
.ma-facts dd{margin:0;font-size:13px;min-width:0;overflow-wrap:anywhere;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.ma-check{display:flex;align-items:flex-start;gap:10px;padding:9px 2px;border-bottom:1px solid color-mix(in srgb,var(--line) 62%,transparent)}
.ma-check:last-child{border-bottom:0}
.ma-check .ma-ico{margin-top:1px}
.ma-check div{min-width:0;display:grid;gap:3px}
.ma-check strong{font-size:13px;font-weight:650;line-height:1.45;color:var(--text);overflow-wrap:anywhere}
.ma-check small{font-size:11px;color:var(--text3);font-family:var(--mono);letter-spacing:.02em;overflow-wrap:anywhere}
.ma-eq{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.ma-gate{margin-top:11px;border:1px dashed color-mix(in srgb,var(--accent) 34%,var(--line));border-radius:var(--ma-rs);background:color-mix(in srgb,var(--accent) 6%,transparent);padding:9px 11px;font-size:12px;line-height:1.55;color:var(--text2);display:grid;gap:5px}
.ma-gate b{color:var(--text);font-weight:700}
.ma-intake{display:grid;gap:6px;margin-top:10px}
.ma-intake label{font:600 10px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--text3)}
.ma-intake textarea{width:100%;min-height:80px;box-sizing:border-box;resize:vertical;background:var(--bg1);border:1px solid var(--line2);border-radius:9px;color:var(--text);padding:9px 10px;font:12.5px/1.55 var(--ui)}
.ma-intake textarea::placeholder{color:var(--text3)}
.ma-intake textarea:focus-visible{outline:2px solid var(--focus);outline-offset:1px;border-color:var(--accent)}
.ma-intake small{font-size:11px;line-height:1.55;color:var(--text3)}
.ma-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}
.ma-actions .btn{font-size:12px;padding:6px 11px;border-radius:8px}
.ma-actions .btn:disabled{opacity:.42;cursor:not-allowed;text-decoration:none}
.ma-actions .btn[data-ma-disposition="ACCEPT"]:not([disabled]){border-color:color-mix(in srgb,var(--ma-ok) 55%,var(--line2));color:var(--ma-ok);font-weight:700}
.ma-actions .btn[data-ma-disposition="REJECT"]:not([disabled]){border-color:color-mix(in srgb,var(--ma-bad) 55%,var(--line2));color:var(--ma-bad)}
.ma-foot{border:1px solid var(--line);border-inline-start:3px solid color-mix(in srgb,var(--accent) 60%,var(--line));border-radius:var(--ma-rs);background:var(--bg1);padding:10px 13px;font-size:11.5px;line-height:1.6;color:var(--text3);overflow-wrap:anywhere}
.ma-foot b{color:var(--text2)}

/* ── LEFT · bridge records ────────────────────────────────────────────────────────────── */
#domainLeftRegion[data-ma-owned="manual_ai"]{display:grid;gap:12px;min-width:0}
.ma-pane-head{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}
.ma-pane-head h3{margin:0;font-size:13.5px;letter-spacing:.01em}
.ma-pane-head .ma-sub{font:600 9.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}
.ma-facets{list-style:none;margin:0;padding:0;display:grid;gap:3px}
.ma-facets button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;text-align:start;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;padding:6px 9px;cursor:pointer;font-size:12.2px;line-height:1.35}
.ma-facets button:hover{background:rgba(255,255,255,.04);border-color:var(--line)}
.ma-facets button[aria-pressed=true]{border-color:color-mix(in srgb,var(--accent) 46%,var(--line));background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--text);font-weight:650}
.ma-facets .ma-fcount{font:700 11px var(--mono);color:var(--text3);min-width:22px;text-align:end}
.ma-facets button[aria-pressed=true] .ma-fcount{color:var(--accent)}
.ma-facets li[data-zero=true] .ma-fcount{opacity:.5}
.ma-facets .ma-fdot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-inline-end:7px;background:currentColor;vertical-align:middle}
.ma-records{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.ma-record{position:relative}
.ma-record button{display:grid;gap:4px;width:100%;text-align:start;border:1px solid var(--line);border-radius:10px;background:var(--bg1);color:inherit;padding:9px 10px 9px 12px;cursor:pointer;font-size:12.5px;min-width:0}
.ma-record button::before{content:"";position:absolute;inset-inline-start:0;top:8px;bottom:8px;width:3px;border-radius:3px;background:transparent}
.ma-record button:hover{border-color:var(--line2);background:var(--bg2)}
.ma-record button[aria-pressed=true]{border-color:color-mix(in srgb,var(--accent) 55%,var(--line));background:color-mix(in srgb,var(--accent) 9%,var(--bg1))}
.ma-record button[aria-pressed=true]::before{background:var(--accent)}
.ma-record .ma-rid{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ma-record .ma-rid bdi{font-size:11.5px;font-weight:700;color:var(--text)}
.ma-record .ma-rtime{font:600 10px var(--mono);color:var(--text3);flex:none}
.ma-record .ma-rtitle{font-size:12.5px;line-height:1.4;color:var(--text2);overflow-wrap:anywhere}
.ma-record button[aria-pressed=true] .ma-rtitle{color:var(--text)}
.ma-record .ma-rmeta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:1px}
.ma-record .ma-rsrc{font:600 10px var(--mono);color:var(--text3);overflow-wrap:anywhere}
.ma-empty{border:1px dashed var(--line2);border-radius:9px;padding:10px;font-size:12px;line-height:1.55;color:var(--text3)}

/* ── RIGHT · governance context ───────────────────────────────────────────────────────── */
#domainContext[data-ma-owned="manual_ai"]{display:grid;gap:9px;min-width:0}
.ma-ctx-head{display:grid;gap:3px;padding-bottom:4px;border-bottom:1px solid var(--line)}
.ma-ctx-head .ma-eyebrow{font-size:9.5px}
.ma-ctx-head strong{font-size:14px}
.ma-ctx-head span{font-size:11.5px;color:var(--text3);line-height:1.5}
.ma-card{border:1px solid var(--line);border-radius:11px;background:color-mix(in srgb,var(--surface) 90%,transparent);padding:10px 11px;display:grid;gap:5px;min-width:0}
.ma-card[data-tone=warn]{border-color:color-mix(in srgb,var(--ma-warn) 34%,var(--line));background:color-mix(in srgb,var(--ma-warn) 6%,var(--surface))}
.ma-card[data-tone=bad]{border-color:color-mix(in srgb,var(--ma-bad) 36%,var(--line));background:color-mix(in srgb,var(--ma-bad) 6%,var(--surface))}
.ma-card[data-tone=ok]{border-color:color-mix(in srgb,var(--ma-ok) 30%,var(--line))}
.ma-card h4{margin:0;display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;line-height:1.4}
.ma-card p{margin:0;font-size:11.8px;line-height:1.6;color:var(--text2);overflow-wrap:anywhere}
.ma-card .ma-cmeta{font:600 10px var(--mono);color:var(--text3);overflow-wrap:anywhere}

/* ── TOOLBAR · single action home, emphasised ─────────────────────────────────────────── */
#domainToolbar[data-ma-owned="manual_ai"]{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
#domainToolbar[data-ma-owned="manual_ai"] .btn{font-size:12.5px;padding:7px 13px;border-radius:8px;white-space:nowrap}
#domainToolbar[data-ma-owned="manual_ai"] .btn[data-ma-primary=true]{
  background:color-mix(in srgb,var(--accent) 22%,var(--bg2));border-color:color-mix(in srgb,var(--accent) 62%,var(--line2));
  color:var(--text);font-weight:700;box-shadow:0 1px 0 color-mix(in srgb,var(--accent) 30%,transparent)}
#domainToolbar[data-ma-owned="manual_ai"] .btn[data-ma-danger=true]{border-color:color-mix(in srgb,var(--ma-bad) 52%,var(--line2));color:var(--ma-bad)}
#domainToolbar[data-ma-owned="manual_ai"] .btn[disabled]{opacity:.42;cursor:not-allowed;text-decoration:none}

/* ── BOTTOM shelf text ────────────────────────────────────────────────────────────────── */
#bottomShelf .ma-bottom-hint{color:var(--text3)}

/* ── responsive ───────────────────────────────────────────────────────────────────────── */
@media(max-width:1240px){
  .ma-steps{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 0;row-gap:16px}
  .ma-steps li:nth-child(4n+1)::before{display:none}
}
@media(max-width:980px){
  .ma-head{flex-direction:column}
  .ma-head-facts{align-items:flex-start;flex-direction:row;flex-wrap:wrap}
  .ma-row{grid-template-columns:22px minmax(0,1fr);row-gap:2px}
  .ma-row>span.ma-val{grid-column:2}
}
@media(max-width:760px){
  #foundationStage[data-ma-owned="manual_ai"]{padding:10px}
  .ma-root{gap:11px}
  .ma-steps{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:16px}
  .ma-steps li:nth-child(2n+1)::before{display:none}
  .ma-defs{grid-template-columns:1fr;gap:0}
  .ma-facts>div{grid-template-columns:1fr;gap:3px}
}
@media(prefers-reduced-motion:reduce){[data-ma-owned="manual_ai"] *{transition:none!important;animation:none!important}}
`;
  target.head.append(style);
}
