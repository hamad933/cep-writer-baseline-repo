import {TIMELINE_REPLAY_OWNER} from './replay.js';

const html=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attr=value=>html(value).replace(/`/g,'&#96;');
const percent=value=>`${Math.round(Math.max(0,Math.min(1,Number(value)||0))*100)}%`;

export const TIMELINE_REPLAY_HOST_CONTRACT=Object.freeze({
  id:'TimelineReplayPresentationHost',version:'1.0.0',compatibility:'SEMVER',
  scope:'PRESENTATION_AND_GENERIC_INTERACTION_ONLY',
  historyTruth:'DOMAIN_OWNED',eventMeaning:'DOMAIN_OWNED',canonicalHistoryClaim:false,replayExecution:false
});

const stateCopy=Object.freeze({
  EMPTY:{title:'No timeline events',fallback:'The domain provider returned an empty timeline.'},
  LOADING:{title:'Timeline loading',fallback:'The domain provider is preparing timeline data.'},
  ERROR:{title:'Timeline unavailable',fallback:'The domain provider reported an error.'},
  UNAVAILABLE:{title:'Timeline unavailable',fallback:'No compatible timeline provider is available.'}
});

function detailRows(event){
  const rows=Array.isArray(event?.detailRows)?event.detailRows:[];
  if(!rows.length)return '<p class="timeline-detail-empty">No provider-supplied detail rows.</p>';
  return `<dl class="timeline-detail-list">${rows.map(row=>`<div><dt dir="auto">${html(row.label)}</dt><dd dir="auto">${html(row.value)}</dd></div>`).join('')}</dl>`;
}

export class TimelineReplayHost{
  constructor(root,owner,{onReceipt=null}={}){
    if(!root||typeof root!=='object')throw Error('TIMELINE_REPLAY_HOST_ROOT_REQUIRED');
    if(!owner||owner.owner!==TIMELINE_REPLAY_OWNER.id)throw Error('TIMELINE_REPLAY_HOST_OWNER_REQUIRED');
    this.root=root;this.owner=owner;this.onReceipt=typeof onReceipt==='function'?onReceipt:()=>{};this.returnFocusEventId=null;
  }
  _style(){return `<style>
    [data-timeline-replay-host]{--tl-border:color-mix(in srgb,currentColor 18%,transparent);--tl-soft:color-mix(in srgb,currentColor 7%,transparent);--tl-strong:color-mix(in srgb,currentColor 14%,transparent);display:block;min-width:0;color:inherit;font:inherit}
    [data-timeline-replay-host] *{box-sizing:border-box}
    [data-timeline-replay-host] .timeline-shell{display:grid;grid-template-rows:auto auto minmax(0,1fr);min-height:460px;border:1px solid var(--tl-border);border-radius:14px;background:Canvas;box-shadow:0 18px 48px color-mix(in srgb,CanvasText 9%,transparent);overflow:hidden}
    [data-timeline-replay-host] .timeline-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid var(--tl-border)}
    [data-timeline-replay-host] .timeline-title{display:grid;gap:4px;min-width:0}[data-timeline-replay-host] h2{font-size:1rem;margin:0}[data-timeline-replay-host] .timeline-sub{font-size:.78rem;opacity:.72;overflow-wrap:anywhere}
    [data-timeline-replay-host] .timeline-badges{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}[data-timeline-replay-host] .timeline-badge{border:1px solid var(--tl-border);border-radius:999px;padding:4px 8px;font-size:.68rem;font-weight:700;letter-spacing:.02em;background:var(--tl-soft);white-space:nowrap}
    [data-timeline-replay-host] .timeline-controls{display:grid;grid-template-columns:auto minmax(140px,1fr) auto auto;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid var(--tl-border);background:var(--tl-soft)}
    [data-timeline-replay-host] button,[data-timeline-replay-host] input{font:inherit}[data-timeline-replay-host] button{min-height:36px;border:1px solid var(--tl-border);border-radius:9px;background:Canvas;color:CanvasText;padding:7px 11px;cursor:pointer}[data-timeline-replay-host] button:hover{background:var(--tl-strong)}[data-timeline-replay-host] button:disabled{opacity:.45;cursor:not-allowed}
    [data-timeline-replay-host] button:focus-visible,[data-timeline-replay-host] input:focus-visible{outline:3px solid Highlight;outline-offset:2px}
    [data-timeline-replay-host] input[type=range]{width:100%;accent-color:Highlight}
    [data-timeline-replay-host] .timeline-main{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(320px,1.2fr);min-height:0}
    [data-timeline-replay-host] .timeline-list{margin:0;padding:12px;list-style:none;border-inline-end:1px solid var(--tl-border);overflow:auto;max-height:560px}
    [data-timeline-replay-host] .timeline-event{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px;width:100%;text-align:start;border-color:transparent;background:transparent;padding:10px;margin:0 0 4px}
    [data-timeline-replay-host] .timeline-event[aria-current=true]{border-color:var(--tl-border);background:var(--tl-strong)}[data-timeline-replay-host] .timeline-dot{width:10px;height:10px;border-radius:50%;border:2px solid currentColor;margin-top:4px;opacity:.78}[data-timeline-replay-host] .timeline-event[aria-current=true] .timeline-dot{background:currentColor}
    [data-timeline-replay-host] .timeline-event-copy{display:grid;gap:3px;min-width:0}[data-timeline-replay-host] .timeline-event-label{font-weight:700;overflow-wrap:anywhere}[data-timeline-replay-host] .timeline-event-meta{font-size:.72rem;opacity:.68;display:flex;gap:8px;flex-wrap:wrap}
    [data-timeline-replay-host] .timeline-detail{padding:20px;overflow:auto;min-width:0}[data-timeline-replay-host] .timeline-detail-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}[data-timeline-replay-host] .timeline-detail h3{margin:0 0 6px;font-size:1rem}[data-timeline-replay-host] .timeline-summary{margin:0 0 18px;line-height:1.55;opacity:.86}
    [data-timeline-replay-host] .timeline-detail-list{display:grid;gap:1px;margin:0;border:1px solid var(--tl-border);border-radius:10px;overflow:hidden}[data-timeline-replay-host] .timeline-detail-list>div{display:grid;grid-template-columns:minmax(110px,.38fr) minmax(0,1fr);gap:12px;padding:10px 12px;background:var(--tl-soft)}[data-timeline-replay-host] dt{font-weight:700}[data-timeline-replay-host] dd{margin:0;overflow-wrap:anywhere}
    [data-timeline-replay-host] .timeline-placeholder{display:grid;place-items:center;min-height:300px;padding:24px;text-align:center}[data-timeline-replay-host] .timeline-placeholder>div{max-width:520px}[data-timeline-replay-host] .timeline-placeholder h3{margin:0 0 8px}[data-timeline-replay-host] .timeline-placeholder p{margin:0;opacity:.72;line-height:1.55}
    [data-timeline-replay-host] .timeline-progress{font-variant-numeric:tabular-nums;min-width:56px;text-align:end;font-size:.78rem}
    @media(max-width:1100px){[data-timeline-replay-host] .timeline-head{padding:14px 16px}[data-timeline-replay-host] .timeline-controls{padding:10px 16px}[data-timeline-replay-host] .timeline-main{grid-template-columns:1fr}[data-timeline-replay-host] .timeline-list{border-inline-end:0;border-bottom:1px solid var(--tl-border);max-height:260px}[data-timeline-replay-host] .timeline-detail{padding:16px}}
    @media(max-width:640px){[data-timeline-replay-host] .timeline-head{display:grid}[data-timeline-replay-host] .timeline-badges{justify-content:flex-start}[data-timeline-replay-host] .timeline-controls{grid-template-columns:auto auto}[data-timeline-replay-host] .timeline-controls input{grid-column:1/-1;grid-row:1}[data-timeline-replay-host] .timeline-progress{display:none}[data-timeline-replay-host] .timeline-detail-list>div{grid-template-columns:1fr;gap:4px}}
    @media(prefers-reduced-motion:reduce){[data-timeline-replay-host] *,[data-timeline-replay-host] *::before,[data-timeline-replay-host] *::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
  </style>`}
  _status(projected){
    const status=projected.timeline.status,copy=stateCopy[status]||stateCopy.UNAVAILABLE,message=projected.timeline.stateMessage||copy.fallback;
    return `<div class="timeline-placeholder" role="status" data-timeline-state="${attr(status)}"><div><h3 dir="auto">${html(copy.title)}</h3><p dir="auto">${html(message)}</p></div></div>`;
  }
  _ready(projected){
    const selected=projected.selection.selectedEvent;
    const events=projected.events.map((event,index)=>`<li><button type="button" class="timeline-event" data-event-id="${attr(event.eventId)}" aria-current="${event.eventId===projected.selection.selectedEventId}" tabindex="${event.eventId===projected.selection.focusedEventId?'0':'-1'}"><span class="timeline-dot" aria-hidden="true"></span><span class="timeline-event-copy"><span class="timeline-event-label" dir="auto">${html(event.label)}</span><span class="timeline-event-meta"><span dir="auto">${html(event.timestampLabel||`Step ${index+1}`)}</span>${event.kindLabel?`<span dir="auto">${html(event.kindLabel)}</span>`:''}<span dir="ltr">${html(event.eventId)}</span></span></span></button></li>`).join('');
    const detail=selected?`<article class="timeline-detail" data-detail-event="${attr(selected.eventId)}"><div class="timeline-detail-head"><div><h3 dir="auto">${html(selected.label)}</h3><div class="timeline-event-meta"><span dir="auto">${html(selected.timestampLabel)}</span>${selected.kindLabel?`<span dir="auto">${html(selected.kindLabel)}</span>`:''}<span dir="ltr">${html(selected.eventId)}</span></div></div>${projected.selection.detailOpen?'<button type="button" data-close-detail aria-label="Close event details">Close</button>':''}</div><p class="timeline-summary" dir="auto">${html(selected.summary||'No provider-supplied summary.')}</p>${projected.selection.detailOpen?detailRows(selected):'<button type="button" data-open-detail>Open event details</button>'}</article>`:'<div class="timeline-placeholder"><div><h3 dir="auto">No event selected</h3><p dir="auto">Select an event supplied by the domain provider.</p></div></div>';
    return `<div class="timeline-controls"><button type="button" data-step="-1" ${projected.timeline.index<=0?'disabled':''} aria-label="Previous event">Previous</button><input type="range" min="0" max="1000" step="1" value="${Math.round(projected.timeline.progress*1000)}" data-scrub aria-label="Timeline position"><button type="button" data-step="1" ${projected.timeline.index>=projected.timeline.total-1?'disabled':''} aria-label="Next event">Next</button><span class="timeline-progress" aria-live="polite">${projected.timeline.index+1} / ${projected.timeline.total}</span></div><div class="timeline-main"><ol class="timeline-list" aria-label="Ordered timeline events">${events}</ol>${detail}</div>`;
  }
  _focusSelected(){
    const id=this.owner.project().selection.focusedEventId;if(!id)return;
    const escaped=globalThis.CSS?.escape?CSS.escape(id):String(id).replace(/["\\]/g,'\\$&');
    this.root.querySelector(`[data-event-id="${escaped}"]`)?.focus();
  }
  _bind(){
    this.root.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{const receipt=this.owner.step(Number(button.dataset.step));this.onReceipt(receipt);this.render();this._focusSelected()}));
    const scrub=this.root.querySelector('[data-scrub]');if(scrub)scrub.addEventListener('input',()=>{const receipt=this.owner.scrubToFraction(Number(scrub.value)/1000);this.onReceipt(receipt);this.render();this._focusSelected()});
    this.root.querySelectorAll('[data-event-id]').forEach(button=>{
      button.addEventListener('focus',()=>{this.owner.focusEvent(button.dataset.eventId)});
      button.addEventListener('click',()=>{this.returnFocusEventId=button.dataset.eventId;const receipt=this.owner.selectEvent(button.dataset.eventId,{focus:true,openDetail:false});this.onReceipt(receipt);this.render();this._focusSelected()});
      button.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End','Enter',' ','Escape'].includes(event.key))return;event.preventDefault();this.returnFocusEventId=button.dataset.eventId;const receipt=this.owner.handleKey(event.key,{eventId:button.dataset.eventId});this.onReceipt(receipt);this.render();if(receipt.action==='OPEN_DETAIL')this.root.querySelector('[data-close-detail]')?.focus();else this._focusSelected()});
    });
    this.root.querySelector('[data-open-detail]')?.addEventListener('click',()=>{this.returnFocusEventId=this.owner.project().selection.selectedEventId;const receipt=this.owner.openDetail();this.onReceipt(receipt);this.render();this.root.querySelector('[data-close-detail]')?.focus()});
    const closeDetail=this.root.querySelector('[data-close-detail]');if(closeDetail){const dismiss=()=>{const target=this.returnFocusEventId||this.owner.project().selection.selectedEventId,receipt=this.owner.closeDetail();this.onReceipt(receipt);this.render();if(target){this.owner.focusEvent(target);this.render();this._focusSelected()}};closeDetail.addEventListener('click',dismiss);closeDetail.addEventListener('keydown',event=>{if(event.key!=='Escape')return;event.preventDefault();event.stopPropagation();dismiss()})}
  }
  render(){
    const projected=this.owner.project(),provider=projected.provider;
    this.root.dataset.timelineReplayHost=TIMELINE_REPLAY_HOST_CONTRACT.version;
    this.root.dataset.timelineStatus=projected.timeline.status;
    this.root.dataset.truthClass=provider.truthClass;
    this.root.innerHTML=`${this._style()}<section class="timeline-shell" aria-label="${attr(projected.timeline.label)}"><header class="timeline-head"><div class="timeline-title"><h2 dir="auto">${html(projected.timeline.label)}</h2><span class="timeline-sub"><span dir="ltr">${html(provider.providerId||'NO_PROVIDER')}</span> · <span dir="ltr">${html(projected.timeline.streamId||'NO_STREAM')}</span></span></div><div class="timeline-badges"><span class="timeline-badge">PRESENTATION ONLY</span><span class="timeline-badge" data-truth-badge>${html(provider.truthClass)}</span><span class="timeline-badge">CANONICAL CLAIM: NO</span></div></header>${projected.timeline.status==='READY'?this._ready(projected):this._status(projected)}</section>`;
    this._bind();return projected;
  }
}
