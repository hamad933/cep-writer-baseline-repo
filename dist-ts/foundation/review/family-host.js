import {AuditProvenanceHost} from '../audit/provenance-host.js';
import {ReviewDecisionPresentationHost} from './decision-host.js';
import {assertCandidateReviewAuditConsumer,REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER,REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION} from './family-admission.js';

const STYLE=`
[data-review-audit-family]{--raf-line:#26364c;--raf-panel:#0c1523;--raf-panel2:#101d2f;--raf-text:#e8f0fb;--raf-muted:#97a8bf;color:var(--raf-text);display:grid;gap:16px;padding:18px;min-height:100%;background:linear-gradient(180deg,#0a1320,#0a111b)}
[data-review-audit-family] .raf-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px;border:1px solid var(--raf-line);border-radius:16px;background:var(--raf-panel)}
[data-review-audit-family] .raf-title{margin:0;font-size:20px}[data-review-audit-family] .raf-copy{margin:6px 0 0;color:var(--raf-muted);font-size:13px;line-height:1.55;max-width:76ch}
[data-review-audit-family] .raf-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}[data-review-audit-family] .raf-refresh{border:1px solid #365276;background:#12253f;color:inherit;border-radius:10px;padding:9px 12px;cursor:pointer}
[data-review-audit-family] .raf-refresh:focus-visible{outline:3px solid #79b8ff;outline-offset:2px}[data-review-audit-family] .raf-grid{display:grid;grid-template-columns:1fr;gap:16px;min-width:0}
[data-review-audit-family] .raf-panel{min-width:0;border:1px solid var(--raf-line);border-radius:16px;background:var(--raf-panel);overflow:hidden}[data-review-audit-family] .raf-panel-title{margin:0;padding:14px 16px;border-block-end:1px solid var(--raf-line);font-size:13px;color:#cfe2fa}
[data-review-audit-family] [data-review-decision-host] .rd-title{font-size:clamp(22px,2vw,30px)}
[data-review-audit-family] .raf-boundary{padding:12px 16px;border:1px dashed #3b526f;border-radius:12px;background:var(--raf-panel2);color:var(--raf-muted);font-size:12px;line-height:1.55}
@media (max-width:1050px){[data-review-audit-family]{padding:12px}.raf-head{display:grid!important}.raf-grid{grid-template-columns:1fr!important}}
`;

export class ReviewAuditFamilyHost{
  constructor({document:doc=globalThis.document,consumer,onRefresh=null}={}){
    if(!doc?.createElement)throw Error('REVIEW_AUDIT_DOCUMENT_REQUIRED');
    this.document=doc;this.consumer=assertCandidateReviewAuditConsumer(consumer);this.onRefresh=onRefresh;this.root=null;this.provenanceHost=null;this.decisionHost=new ReviewDecisionPresentationHost({document:doc});this.boundClick=event=>this.click(event);
  }
  mount(root,{provenanceCore,reviewSnapshot,title,summary,provenancePanelTitle,statePanelTitle,boundaryNote}={}){
    if(!root?.append)throw Error('REVIEW_AUDIT_ROOT_REQUIRED');
    this.destroy();this.root=root;this.root.setAttribute('data-review-audit-family',REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER);this.root.setAttribute('data-review-audit-family-revision',REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION);this.root.setAttribute('data-review-audit-surface',this.consumer.surface);this.root.setAttribute('data-candidate-product-consumer','true');this.root.setAttribute('data-real-consumer-accepted','false');
    const style=this.document.createElement('style');style.textContent=STYLE;
    const head=this.document.createElement('header');head.className='raf-head';head.innerHTML=`<div><h1 class="raf-title"></h1><p class="raf-copy"></p></div><div class="raf-actions"><button type="button" class="raf-refresh" data-review-audit-refresh>Refresh</button></div>`;head.querySelector('.raf-title').textContent=title||'Shared inspection';head.querySelector('.raf-copy').textContent=summary||'Read-only reusable inspection mechanics. Domain meaning, lifecycle, mutation, and authority remain adapter-owned.';
    const grid=this.document.createElement('div');grid.className='raf-grid';grid.innerHTML='<section class="raf-panel"><h2 class="raf-panel-title" data-raf-provenance-title></h2><div data-raf-provenance></div></section><section class="raf-panel"><h2 class="raf-panel-title" data-raf-state-title></h2><div data-raf-decision></div></section>';grid.querySelector('[data-raf-provenance-title]').textContent=provenancePanelTitle||'Trace inspection';grid.querySelector('[data-raf-state-title]').textContent=statePanelTitle||'State projection';
    const boundary=this.document.createElement('div');boundary.className='raf-boundary';boundary.dataset.authorityBoundary='domain-authority-separate';boundary.textContent=boundaryNote||'Shared presentation only. Domain records, vocabulary, lifecycle, mutations, provider truth, and authority remain outside this family.';
    this.root.replaceChildren(style,head,grid,boundary);this.root.addEventListener('click',this.boundClick);
    this.provenanceHost=new AuditProvenanceHost(grid.querySelector('[data-raf-provenance]'),provenanceCore);this.provenanceHost.render();this.decisionHost.mount(grid.querySelector('[data-raf-decision]'),reviewSnapshot);
    return this.descriptor();
  }
  update({provenanceCore,reviewSnapshot}={}){if(!this.root)throw Error('REVIEW_AUDIT_HOST_NOT_MOUNTED');if(provenanceCore)this.provenanceHost.core=provenanceCore;this.provenanceHost?.render();if(reviewSnapshot)this.decisionHost.render(reviewSnapshot);return this.descriptor()}
  async click(event){const button=event.target?.closest?.('[data-review-audit-refresh]');if(!button||!this.root?.contains(button)||!this.onRefresh)return;button.disabled=true;try{await this.onRefresh({route:'review-audit-family-refresh',invoker:button})}finally{button.disabled=false}}
  descriptor(){return Object.freeze({owner:REVIEW_AUDIT_FAMILY_COMPOSITION_OWNER,surface:this.consumer.surface,candidateConsumer:true,realProductConsumerAccepted:false,controllerAdmissionRequired:true,presentationRevision:REVIEW_AUDIT_FAMILY_PRESENTATION_REVISION,domainVocabularyAuthority:false,formalReviewAuthority:false,auditEventAuthority:false,technicalFindingConversion:false})}
  destroy(){if(this.root)this.root.removeEventListener('click',this.boundClick);this.provenanceHost?.destroy?.();this.provenanceHost=null;this.decisionHost.destroy?.();this.root=null}
}
