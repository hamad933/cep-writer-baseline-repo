import {
  REVIEW_DECISION_PRESENTATION_OWNER,
  isReviewDecisionPresentationSnapshot
} from './decision.js';

export const REVIEW_DECISION_PRESENTATION_HOST=Object.freeze({
  id:'ReviewDecisionPresentationHost',
  owner:REVIEW_DECISION_PRESENTATION_OWNER,
  scope:'READ_ONLY_INSPECTION_PRESENTATION',
  ownsGlobalTransientMechanics:false,
  ownsDecisionMutation:false,
  ownsProviderContract:false,
  ownsDomainVocabulary:false,
  ownsExternalWorkingReviewDomainSemantics:false
});

const STYLE=`
[data-review-decision-host]{--rd-bg:#0b1220;--rd-panel:#101a2d;--rd-panel-2:#14223a;--rd-line:#2b3d59;--rd-text:#edf4ff;--rd-muted:#9eb0c9;--rd-accent:#5eead4;--rd-focus:#7dd3fc;--rd-attn:#fbbf24;--rd-critical:#fda4af;--rd-quiet:#8796ab;display:block;color:var(--rd-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.45;color-scheme:dark}
[data-review-decision-host] *{box-sizing:border-box}
[data-review-decision-host] .rd-shell{max-inline-size:1180px;margin-inline:auto;padding:28px;background:linear-gradient(180deg,#0b1220 0%,#0d1627 100%);border:1px solid #22324c;border-radius:22px;box-shadow:0 22px 60px rgba(0,0,0,.24)}
[data-review-decision-host] .rd-kicker{margin:0 0 7px;color:var(--rd-accent);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
[data-review-decision-host] .rd-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding-block-end:22px;border-block-end:1px solid var(--rd-line)}
[data-review-decision-host] .rd-title-wrap{min-inline-size:0;max-inline-size:790px}
[data-review-decision-host] .rd-title{margin:0;font-size:clamp(26px,3vw,38px);line-height:1.12;letter-spacing:-.025em}
[data-review-decision-host] .rd-summary{margin:10px 0 0;color:var(--rd-muted);font-size:15px;max-inline-size:72ch}
[data-review-decision-host] .rd-state{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;min-block-size:34px;padding:7px 12px;border:1px solid var(--rd-line);border-radius:999px;background:#0f1b30;font-size:12px;font-weight:800;white-space:nowrap}
[data-review-decision-host] .rd-state::before{content:"";inline-size:8px;block-size:8px;border-radius:50%;background:var(--rd-accent);box-shadow:0 0 0 4px rgba(94,234,212,.09)}
[data-review-decision-host][data-state="CONFLICT"] .rd-state::before{background:var(--rd-attn);box-shadow:0 0 0 4px rgba(251,191,36,.09)}
[data-review-decision-host][data-state="SUPERSEDED"] .rd-state::before{background:var(--rd-quiet);box-shadow:0 0 0 4px rgba(135,150,171,.09)}
[data-review-decision-host][data-state="UNAVAILABLE"] .rd-state::before{background:var(--rd-critical);box-shadow:0 0 0 4px rgba(253,164,175,.09)}
[data-review-decision-host] .rd-message{margin:18px 0 0;padding:13px 15px;border-inline-start:3px solid var(--rd-focus);border-radius:10px;background:#0d1a2c;color:#c9d9ee;font-size:13px}
[data-review-decision-host][data-state="CONFLICT"] .rd-message{border-inline-start-color:var(--rd-attn)}
[data-review-decision-host][data-state="SUPERSEDED"] .rd-message{border-inline-start-color:var(--rd-quiet)}
[data-review-decision-host][data-state="UNAVAILABLE"] .rd-message{border-inline-start-color:var(--rd-critical)}
[data-review-decision-host] .rd-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin-block-start:20px}
[data-review-decision-host] .rd-section{min-inline-size:0;padding:18px;border:1px solid var(--rd-line);border-radius:16px;background:rgba(16,26,45,.9)}
[data-review-decision-host] .rd-section h2{margin:0 0 13px;font-size:14px;letter-spacing:.01em}
[data-review-decision-host] .rd-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}
[data-review-decision-host] .rd-item{min-inline-size:0;border:1px solid #263956;border-radius:12px;background:#0c1729;overflow:hidden}
[data-review-decision-host] .rd-item[data-tone="attention"]{border-color:#5f4c20}
[data-review-decision-host] .rd-item[data-tone="critical"]{border-color:#66313d}
[data-review-decision-host] .rd-item[data-tone="quiet"]{opacity:.82}
[data-review-decision-host] .rd-inspect{inline-size:100%;min-block-size:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border:0;background:transparent;color:inherit;text-align:start;font:inherit;cursor:pointer}
[data-review-decision-host] .rd-inspect:hover{background:#14233a}
[data-review-decision-host] .rd-inspect:focus-visible{outline:3px solid var(--rd-focus);outline-offset:-3px;border-radius:9px}
[data-review-decision-host] .rd-label{min-inline-size:0;font-size:13px;font-weight:700}
[data-review-decision-host] .rd-meta{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;color:var(--rd-muted);font-size:11px}
[data-review-decision-host] .rd-chevron{font-size:16px;line-height:1;transition:transform .14s ease}
[data-review-decision-host] .rd-inspect[aria-expanded="true"] .rd-chevron{transform:rotate(180deg)}
[data-review-decision-host] .rd-detail{padding:0 13px 13px;border-block-start:1px solid #223650;color:#bdcce0;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere}
[data-review-decision-host] .rd-detail p{margin:11px 0 0}
[data-review-decision-host] .rd-static{padding:12px 13px;color:var(--rd-text);font-size:13px;font-weight:700}
[data-review-decision-host] .rd-empty{margin:0;color:var(--rd-muted);font-size:13px}
[data-review-decision-host] .rd-outcomes{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin-block-start:18px}
[data-review-decision-host] .rd-outcome{padding:18px;border:1px solid var(--rd-line);border-radius:16px;background:var(--rd-panel-2)}
[data-review-decision-host] .rd-outcome h2{margin:0 0 12px;font-size:14px}
[data-review-decision-host] .rd-source{margin:18px 0 0;padding-block-start:16px;border-block-start:1px dashed #30445f;color:var(--rd-muted);font-size:12px}
[data-review-decision-host] .rd-unavailable{margin-block-start:20px;padding:24px;border:1px dashed #4b5b72;border-radius:16px;background:#0c1728;color:#c6d4e7}
[data-review-decision-host] .rd-unavailable strong{display:block;margin-block-end:5px;color:var(--rd-text)}
@media (max-width:860px){[data-review-decision-host] .rd-shell{padding:20px;border-radius:16px}[data-review-decision-host] .rd-header{display:grid}[data-review-decision-host] .rd-state{justify-self:start}[data-review-decision-host] .rd-grid,[data-review-decision-host] .rd-outcomes{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){[data-review-decision-host] .rd-chevron{transition:none}}
`;

const create=(doc,tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined&&text!==null)node.textContent=String(text);return node;};
const safeId=value=>String(value).replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'item';

export class ReviewDecisionPresentationHost{
  constructor({document:doc=globalThis.document}={}){
    if(!doc?.createElement)throw Error('REVIEW_DECISION_DOCUMENT_REQUIRED');
    this.document=doc;
    this.root=null;
    this.snapshot=null;
    this.boundClick=event=>this.onClick(event);
    this.boundKeydown=event=>this.onKeydown(event);
  }
  mount(root,snapshot){
    if(!root?.append||!root?.setAttribute)throw Error('REVIEW_DECISION_ROOT_REQUIRED');
    this.destroy();
    this.root=root;
    this.root.addEventListener('click',this.boundClick);
    this.root.addEventListener('keydown',this.boundKeydown);
    return this.render(snapshot);
  }
  render(snapshot){
    if(!this.root)throw Error('REVIEW_DECISION_HOST_NOT_MOUNTED');
    if(!isReviewDecisionPresentationSnapshot(snapshot))throw Error('REVIEW_DECISION_PRESENTATION_SNAPSHOT_REQUIRED');
    this.snapshot=snapshot;
    this.root.replaceChildren();
    this.root.setAttribute('data-review-decision-host',REVIEW_DECISION_PRESENTATION_OWNER);
    this.root.setAttribute('data-state',snapshot.state);
    this.root.setAttribute('dir',snapshot.direction);
    this.root.setAttribute('lang',snapshot.locale);
    const style=create(this.document,'style');style.textContent=STYLE;this.root.append(style);
    const shell=create(this.document,'article','rd-shell');
    shell.setAttribute('aria-labelledby',`${safeId(snapshot.id)}-title`);
    const header=create(this.document,'header','rd-header');
    const titleWrap=create(this.document,'div','rd-title-wrap');
    titleWrap.append(create(this.document,'p','rd-kicker',snapshot.labels.family));
    const title=create(this.document,'h1','rd-title',snapshot.title);title.id=`${safeId(snapshot.id)}-title`;titleWrap.append(title);
    if(snapshot.summary)titleWrap.append(create(this.document,'p','rd-summary',snapshot.summary));
    const state=create(this.document,'div','rd-state',snapshot.stateLabel);state.setAttribute('role','status');state.setAttribute('aria-live','polite');
    header.append(titleWrap,state);shell.append(header);
    if(snapshot.stateMessage)shell.append(create(this.document,'p','rd-message',snapshot.stateMessage));
    if(snapshot.state==='UNAVAILABLE'){
      const unavailable=create(this.document,'section','rd-unavailable');
      unavailable.append(create(this.document,'strong','',snapshot.labels.unavailable));
      unavailable.append(create(this.document,'div','',snapshot.stateMessage));
      shell.append(unavailable);
    }else{
      const grid=create(this.document,'div','rd-grid');
      snapshot.sections.forEach(section=>grid.append(this.renderCollection(section.label,section.entries,`section-${section.id}`)));
      shell.append(grid);
      if(snapshot.outcomes.length){
        const outcomes=create(this.document,'div','rd-outcomes');
        snapshot.outcomes.forEach(outcome=>outcomes.append(this.renderSingleton(outcome.label,outcome.entry,`outcome-${outcome.id}`)));
        shell.append(outcomes);
      }
    }
    if(snapshot.sourceNote)shell.append(create(this.document,'p','rd-source',snapshot.sourceNote));
    this.root.append(shell);
    return Object.freeze({owner:REVIEW_DECISION_PRESENTATION_OWNER,rendered:true,state:snapshot.state,presentationOnly:true,mutatedDomain:false});
  }
  renderCollection(label,entries,sectionKey){
    const section=create(this.document,'section','rd-section');
    const heading=create(this.document,'h2','',label);heading.id=`rd-${sectionKey}-heading`;section.setAttribute('aria-labelledby',heading.id);section.append(heading);
    if(!entries.length){section.append(create(this.document,'p','rd-empty','—'));return section;}
    const list=create(this.document,'ul','rd-list');
    entries.forEach((entry,index)=>list.append(this.renderEntry(entry,`${sectionKey}-${index}`)));
    section.append(list);return section;
  }
  renderSingleton(label,entry,sectionKey){
    const section=create(this.document,'section','rd-outcome');
    const heading=create(this.document,'h2','',label);heading.id=`rd-${sectionKey}-heading`;section.setAttribute('aria-labelledby',heading.id);section.append(heading);
    if(!entry){section.append(create(this.document,'p','rd-empty','—'));return section;}
    const list=create(this.document,'div','rd-list');list.append(this.renderEntry(entry,sectionKey));section.append(list);return section;
  }
  renderEntry(entry,namespace){
    const wrapper=create(this.document,'div','rd-item');wrapper.dataset.tone=entry.tone;
    if(!entry.detail){
      const row=create(this.document,'div','rd-static');row.append(create(this.document,'span','rd-label',entry.label));
      if(entry.badge)row.append(create(this.document,'span','rd-meta',entry.badge));wrapper.append(row);return wrapper;
    }
    const button=create(this.document,'button','rd-inspect');button.type='button';button.dataset.rdInspect='true';button.dataset.entryId=entry.id;
    const controlId=`rd-${safeId(namespace)}-${safeId(entry.id)}-detail`;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',controlId);
    button.append(create(this.document,'span','rd-label',entry.label));
    const meta=create(this.document,'span','rd-meta');if(entry.badge)meta.append(create(this.document,'span','',entry.badge));meta.append(create(this.document,'span','rd-chevron','⌄'));button.append(meta);
    const detail=create(this.document,'div','rd-detail');detail.id=controlId;detail.hidden=true;detail.setAttribute('role','region');detail.setAttribute('aria-label',entry.label);detail.append(create(this.document,'p','',entry.detail));
    wrapper.append(button,detail);return wrapper;
  }
  onClick(event){const button=event.target?.closest?.('[data-rd-inspect="true"]');if(button&&this.root?.contains(button))this.toggle(button);}
  onKeydown(event){
    const button=event.target?.closest?.('[data-rd-inspect="true"]');
    if(event.key==='Escape'){
      const expanded=this.root?.querySelector?.('[data-rd-inspect="true"][aria-expanded="true"]');
      if(expanded){event.preventDefault();this.collapse(expanded,true);}return;
    }
    if(!button||!this.root?.contains(button))return;
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      const buttons=[...button.closest('.rd-list')?.querySelectorAll?.('[data-rd-inspect="true"]')||[]];if(!buttons.length)return;
      event.preventDefault();const index=buttons.indexOf(button);let next=index;
      if(event.key==='ArrowDown')next=Math.min(buttons.length-1,index+1);
      if(event.key==='ArrowUp')next=Math.max(0,index-1);
      if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;buttons[next]?.focus?.();
    }
  }
  toggle(button){button.getAttribute('aria-expanded')==='true'?this.collapse(button,false):this.expand(button);}
  expand(button){const panel=this.root?.querySelector?.(`#${button.getAttribute('aria-controls')}`);if(!panel)return;button.setAttribute('aria-expanded','true');panel.hidden=false;}
  collapse(button,focus){const panel=this.root?.querySelector?.(`#${button.getAttribute('aria-controls')}`);button.setAttribute('aria-expanded','false');if(panel)panel.hidden=true;if(focus)button.focus?.();}
  destroy(){
    if(this.root){this.root.removeEventListener('click',this.boundClick);this.root.removeEventListener('keydown',this.boundKeydown);this.root.removeAttribute('data-review-decision-host');this.root.removeAttribute('data-state');}
    this.root=null;this.snapshot=null;
  }
}
