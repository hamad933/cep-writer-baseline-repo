import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {CollectionTableMatrixPresentationCore} from '../../foundation/collection/table-matrix.js';
import {W04EvidenceDomain} from '../../adapters/evidence/domain.js';
import {W04ReviewDomain} from '../../adapters/reviews/domain.js';
import {W04MasteryDomain} from '../../adapters/mastery/domain.js';
import {W04PortfolioDomain,PORTFOLIO_DOMAIN_OWNER} from '../../adapters/portfolio/domain.js';
import {composeEvidenceSurface} from '../evidence/index.js';
import {composeReviewsSurface} from '../reviews/index.js';
import {createMasterySurfaceComposition} from '../mastery/composition.js';
import {createPortfolioSurfaceComposition} from '../portfolio/composition.js';
import {describeEvidenceRecord,describeEvidenceEmpty} from '../evidence/presentation.js';
import {describeReviewsRecord,describeReviewsEmpty} from '../reviews/presentation.js';
import {describeMasteryRecord,describeMasteryEmpty} from '../mastery/presentation.js';
import {describePortfolioRecord,describePortfolioEmpty} from '../portfolio/presentation.js';

export const W04_RESCUE_AUTHORITY='ORACLE-011/A03';
export const W04_CAUSAL_CHAIN=Object.freeze(['Candidate Evidence','Evidence','Review','Decision','Mastery State']);
export const W04_ROUTE_BINDINGS=Object.freeze({
  evidence:Object.freeze({route:'/progress/evidence',centralWiring:'R6_REQUIRED'}),
  reviews:Object.freeze({route:'/progress/reviews',centralWiring:'R6_REQUIRED'}),
  mastery:Object.freeze({route:'/progress/mastery',centralWiring:'R6_REQUIRED'}),
  portfolio:Object.freeze({route:'/progress/portfolio',centralWiring:'R6_REQUIRED'})
});

function evidenceProvenanceProvider(domain){
  return Object.freeze({
    descriptor:()=>({providerId:'w04.evidence.provenance',domainKind:'Evidence',schemaVersion:'1.0.0',authorityRef:W04_RESCUE_AUTHORITY,label:'Evidence provenance'}),
    read:({id}={})=>{
      const target=id||domain.records[0]?.id;if(!target)return {state:'EMPTY',identity:{id:'evidence:none',label:'No Evidence selected',revision:null,provenanceRefs:[]},entries:[],message:'No governed Evidence record is selected.'};
      const row=domain.inspect(target),revision=row?.currentRevision;
      if(!row)return {state:'EMPTY',identity:{id:'evidence:none',label:'No Evidence selected',revision:null,provenanceRefs:[]},entries:[],message:'No governed Evidence record is selected.'};
      const sourceRef=revision?`${revision.source.sourceId}@${revision.source.sourceRevision}`:`${row.sourceId||row.id}@${row.sourceRevision||row.revisionId}`;
      const entries=[{id:`source:${sourceRef}`,label:'Pinned source revision',kind:'SOURCE_REVISION',summary:`Source status: ${row.sourceStatus}`,provenanceRefs:[sourceRef],attributes:{digest:revision?.source.digest||row.digest,sourceStatus:row.sourceStatus}}];
      if(revision?.previousRevisionRef)entries.push({id:`previous:${revision.previousRevisionRef}`,label:'Previous immutable Evidence revision',kind:'EVIDENCE_REVISION',summary:'Superseding lineage is preserved; prior revision remains immutable.',provenanceRefs:[revision.previousRevisionRef],attributes:{immutable:true}});
      return {state:'READY',identity:{id:row.evidenceId||row.id,label:row.title||row.id,revision:revision?.revisionId||row.revisionId,provenanceRefs:[sourceRef]},entries,message:'Evidence provenance is projected read-only from the W04 domain; presentation owns no Evidence mutation authority.'};
    }
  });
}

function reviewsProvenanceProvider(domain){
  return Object.freeze({
    descriptor:()=>({providerId:'w04.reviews.provenance',domainKind:'FormalReview',schemaVersion:'1.0.0',authorityRef:W04_RESCUE_AUTHORITY,label:'Formal Review provenance'}),
    read:({id}={})=>{
      const target=id||domain.records[0]?.id;if(!target)return {state:'EMPTY',identity:{id:'review:none',label:'No Review selected',revision:null,provenanceRefs:[]},entries:[],message:'No formal Review is selected.'};
      const row=domain.inspect(target);
      if(!row)return {state:'EMPTY',identity:{id:'review:none',label:'No Review selected',revision:null,provenanceRefs:[]},entries:[],message:'No formal Review is selected.'};
      const entries=[...row.evidenceRefs.map(ref=>({id:`evidence:${ref}`,label:'Pinned Evidence revision',kind:'EVIDENCE_REVISION_REF',summary:'Exact Evidence revision pinned to this Review.',provenanceRefs:[ref]})),...row.decisionHistory.map(decision=>({id:`decision:${decision.decisionId}`,label:`Decision ${decision.decisionId}`,kind:'REVIEW_DECISION',summary:`${decision.outcome}${decision.supersedesDecisionRef?` · supersedes ${decision.supersedesDecisionRef}`:''}`,provenanceRefs:[decision.decisionId,...(decision.supersedesDecisionRef?[decision.supersedesDecisionRef]:[])],attributes:{immutable:true,outcome:decision.outcome}}))];
      return {state:entries.length?'READY':'EMPTY',identity:{id:row.id,label:`Review ${row.id}`,revision:row.revisionId,provenanceRefs:[...row.evidenceRefs,...row.criteriaRefs]},entries,message:'Issued Decisions are read-only provenance records here; correction uses superseding Decision lineage.'};
    }
  });
}

export function createW04RescueComposition({
  evidenceDomain=new W04EvidenceDomain(),
  reviewsDomain=null,
  masteryDomain=new W04MasteryDomain(),
  portfolioDomain=null,
  analyticalCompareOwner=undefined,
  commands=null
}={}){
  const compareOwner=analyticalCompareOwner??null;
  if(!compareOwner)return Object.freeze({authority:W04_RESCUE_AUTHORITY,candidateOnly:true,selfPromotion:false,integration:Object.freeze({state:'INTEGRATION_REQUIRED',code:'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED',reason:'W04 requires the controller-injected AnalyticalCompareOwner.'}),shared:Object.freeze({analyticalCompareOwner:null,analyticalProviderIds:Object.freeze([])}),commands:null});
  if(!compareOwner||compareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
  const boundReviews=reviewsDomain||new W04ReviewDomain(undefined,{evidenceResolver:ref=>evidenceDomain.resolveReviewableEvidenceRef(ref)});
  if(!boundReviews.evidenceResolver)boundReviews.evidenceResolver=ref=>evidenceDomain.resolveReviewableEvidenceRef(ref);
  evidenceDomain.setReviewProjectionResolver(input=>boundReviews.projectionForEvidence(input));
  const boundPortfolio=portfolioDomain||new W04PortfolioDomain(undefined,{sourceResolver:{inspect:ref=>{
    const [id,revisionId,...rest]=String(ref||'').split('@');if(!id||!revisionId||rest.length)return null;
    const evidence=evidenceDomain.findRevision(id,revisionId);if(evidence)return {digest:evidence.source.digest,rowCount:1};
    const mastery=masteryDomain.records.find(row=>row.id===id&&row.revisionId===revisionId);if(mastery)return {digest:mastery.basis.digest,rowCount:1};
    return null;
  }}});
  const evidence=composeEvidenceSurface({domain:evidenceDomain,analyticalCompareOwner:compareOwner});
  const reviews=composeReviewsSurface({domain:boundReviews,analyticalCompareOwner:compareOwner,commands});
  const mastery=createMasterySurfaceComposition({domain:masteryDomain,analyticalCompareOwner:compareOwner});
  const portfolio=createPortfolioSurfaceComposition({domain:boundPortfolio,analyticalCompareOwner:compareOwner});

  // P3 — `portfolio.curate` must not be labelled as a removal-only action on a curation surface.
  // Registered here, on the canonical bus, BEFORE the controller's `registerW04SurfaceCommands`
  // runs: the controller's `reg()` sees an already-owned command with the same domain owner and
  // yields, so the surface-owned label/semantics win without editing `m0-controller-composition.ts`.
  // Behaviour is unchanged for the existing payload shape (id → remove); `action:'add'|'member'`
  // routes to the domain's reference-only `add`.
  if(commands&&!(commands.commands instanceof Map&&commands.commands.has('portfolio.curate'))){
    const curateAction=payload=>payload?.action?String(payload.action):(payload?.member?'add':(payload?.id?'remove':null));
    commands.registerCommand('portfolio.curate',PORTFOLIO_DOMAIN_OWNER,'Curate Portfolio reference',payload=>{
      const action=curateAction(payload);
      if(action==='add')return boundPortfolio.curate({action:'add',member:payload.member});
      if(action==='remove'){
        const row=boundPortfolio.get(payload.id);
        return boundPortfolio.curate({action:'remove',id:payload.id,expectedRevisionId:payload.expectedRevisionId??row.revisionId});
      }
      return Object.freeze({ok:false,code:'CURATION_ACTION_REQUIRED',mutated:false,reason:'Explicit curation action is required: action "add" with a member payload, or action "remove" with a membership id.'});
    },payload=>{
      const action=curateAction(payload);
      if(action==='add')return (payload?.member&&payload.member.id&&payload.member.sourceRef&&payload.member.refType)
        ? true
        : Object.freeze({enabled:false,code:'EXACT_SOURCE_REF_REQUIRED',reason:'Adding a reference requires an exact canonical source ref (id@revision), a reference type and a membership id.',availabilityOwner:PORTFOLIO_DOMAIN_OWNER});
      if(action==='remove')return payload?.id
        ? true
        : Object.freeze({enabled:false,code:'MEMBER_REQUIRED',reason:'Select Portfolio member',availabilityOwner:PORTFOLIO_DOMAIN_OWNER});
      return Object.freeze({enabled:false,code:'CURATION_ACTION_REQUIRED',reason:'Choose the curation action: add a reference (member payload) or remove the selected membership.',availabilityOwner:PORTFOLIO_DOMAIN_OWNER});
    });
  }

  const evidenceCollection=new CollectionTableMatrixPresentationCore(evidence.collection);
  const reviewsCollection=new CollectionTableMatrixPresentationCore(reviews.collection);
  const evidenceAudit=new AuditProvenanceInteractionCore(evidenceProvenanceProvider(evidenceDomain));
  const reviewsAudit=new AuditProvenanceInteractionCore(reviewsProvenanceProvider(boundReviews));
  if(evidenceDomain.records[0])evidenceAudit.refresh({id:evidenceDomain.records[0].id});
  if(boundReviews.records[0])reviewsAudit.refresh({id:boundReviews.records[0].id});

  const group=Object.freeze({
    authority:W04_RESCUE_AUTHORITY,
    integration:Object.freeze({state:'READY',code:'CENTRAL_OWNERS_BOUND'}),
    candidateOnly:true,
    selfPromotion:false,
    causalChain:W04_CAUSAL_CHAIN,
    routeBindings:W04_ROUTE_BINDINGS,
    shared:Object.freeze({
      analyticalCompareOwner: compareOwner,
      analyticalProviderIds: compareOwner.providerIds(),
      collectionOwner:'CollectionTableMatrixPresentationCore',
      auditOwner:'AuditProvenanceInteractionCore',
      reviewDecisionOwner:'ReviewDecisionPresentationOwner'
    }),
    evidence:Object.freeze({...evidence,collectionCore:evidenceCollection,auditProvenance:evidenceAudit}),
    reviews:Object.freeze({...reviews,collectionCore:reviewsCollection,auditProvenance:reviewsAudit}),
    mastery,
    portfolio,
    invariants:Object.freeze({
      evidenceRevisionMutation:'IMMUTABLE_SUPERSEDING_ONLY',
      issuedDecisionMutation:'IMMUTABLE_SUPERSEDING_ONLY',
      masteryReevaluate:'ZERO_LOCAL_WRITE_WITHOUT_AUTHORIZED_EVALUATOR',
      portfolioCanonicalTruth:'REFERENCE_ONLY_NO_COPY_NO_DELETE',
      groupingAuthority:boundPortfolio.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED',
      finalRouteWiring:'R6_REQUIRED'
    })
  });
  installW04SurfacePresentation(group,{reviewsClaimResolver:row=>{
    const ref=row&&Array.isArray(row.evidenceRefs)?row.evidenceRefs[0]:null;
    if(!ref)return null;
    const [evidenceId,revisionId,...rest]=String(ref).split('@');
    if(!evidenceId||!revisionId||rest.length)return null;
    const revision=evidenceDomain.findRevision(evidenceId,revisionId);
    if(revision)return {claim:revision.evidenceClaim,subject:revision.subject,criterionRefs:(revision.criterionRefs||[]).join(', ')||null};
    const record=evidenceDomain.records.find(item=>item.id===evidenceId||item.evidenceId===evidenceId);
    if(record)return {claim:record.evidenceClaim,subject:record.subject,criterionRefs:(record.criterionRefs||[]).join(', ')||null};
    return null;
  }});
  return group;
}

/* ============================================================================
 * W04 surface record presentation — defects D9 (state affordances), D10 (record
 * composition), M1 / M2 (mastery epistemic state + fixture labelling),
 * P2 (legible pending grouping authority) and R1 (reachable Review commands).
 *
 * Ownership: this file is W04-owned (`surfaces/composition/w04-rescue.ts`). The shared
 * `m0-controller-composition.ts` primitive stays untouched — it renders the typed collection
 * matrix, the context lens and the bottom projection; this module adds ONLY the
 * surface-specific CENTER composition, declared as data by
 * `surfaces/{evidence,reviews,mastery,portfolio}/presentation.ts` and projected here with the
 * shared W04 visual grammar (one renderer, four surfaces — no per-consumer duplication).
 *
 * The shared projection primitives are reused where they fit: section headings keep the
 * `m0-semantic-group` contract and label/value rows keep `m0-semantic-list`, so the shared
 * structural metrics continue to describe this surface. Pills, tracks, numbered steps,
 * split cards and the findings table are the surface-specific components the reference
 * actually shows and the shared primitive deliberately does not own (governance §6).
 * ========================================================================== */

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toneClass = tone => (tone ? ` w04-tone-${tone}` : '');

const W04_ICONS = Object.freeze({
  evidence: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h4"/>',
  reviews: '<path d="M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  mastery: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  portfolio: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  handoff: '<path d="M3 8h13l-3.5-3.5"/><path d="M21 16H8l3.5 3.5"/>',
  reference: '<path d="M20 11l-8.5 8.5a4 4 0 0 1-5.7-5.7L14 5.6a2.7 2.7 0 0 1 3.8 3.8l-8.2 8.2a1.3 1.3 0 0 1-1.9-1.9L15 8.4"/>',
  criterion: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  finding: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4"/><path d="M9 10h6M9 14h4"/>',
  rationale: '<path d="M5 4h14v12H9l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  decision: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.3l3.4 2"/>',
  claim: '<path d="M4 5h16v11H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  warn: '<path d="M12 3.5L21 20H3z"/><path d="M12 10v4.5"/><path d="M12 17.4h.01"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M18 14.5V20H4V6h5.5"/>'
});
const w04Icon = name => {
  const body = W04_ICONS[name];
  if (!body) return '';
  return `<svg class="w04-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
};
const w04EmptyToken = message => `<p class="state-token" data-state="empty"><strong>EMPTY</strong> · ${esc(message || 'No value is bound to this projection; nothing is inferred.')}</p>`;

function w04RenderRows(rows = []) {
  return `<dl class="m0-semantic-list w04-rows">${rows.map(row => {
    const attrs = [];
    if (row.dir) attrs.push(` dir="${esc(row.dir)}"`);
    const cls = [];
    if (row.mono) cls.push('w04-mono');
    if (row.tone) cls.push(`w04-text-${row.tone}`);
    if (cls.length) attrs.push(` class="${cls.join(' ')}"`);
    return `<div><dt>${esc(row.label)}</dt><dd${attrs.join('')}>${esc(row.value)}</dd></div>`;
  }).join('')}</dl>`;
}

function w04RenderTrack(block) {
  const steps = (block.steps || []).map((step, index) =>
    `<li class="w04-track-step" data-w04-step data-w04-step-number="${index + 1}" data-w04-step-state="${esc(step.state || 'future')}"><span class="w04-track-num">${index + 1}</span><span class="w04-track-label">${esc(step.label)}</span></li>`).join('');
  const next = (block.next || []).map(item =>
    `<li class="w04-next-item${toneClass(item.tone)}">${esc(item.text)}</li>`).join('');
  return `<ol class="w04-track" data-w04-track>${steps}</ol>${next ? `<ul class="w04-next">${next}</ul>` : ''}`;
}

function w04RenderGrid(block) {
  return `<dl class="w04-grid">${(block.cells || []).map(cell => {
    const dir = cell.dir ? ` dir="${esc(cell.dir)}"` : '';
    const cls = cell.tone ? ` class="w04-text-${cell.tone}"` : '';
    return `<div class="w04-grid-cell"><dt>${esc(cell.label)}</dt><dd${cls}${dir}>${esc(cell.value)}</dd></div>`;
  }).join('')}</dl>`;
}

function w04RenderCards(block) {
  const cards = block.cards || [];
  if (!cards.length) return w04EmptyToken(block.emptyMessage);
  return `<ul class="w04-cards">${cards.map(card => {
    const lines = (card.lines || []).map(line => `<p>${esc(line)}</p>`).join('');
    return `<li class="w04-card${toneClass(card.tone)}"><span class="w04-card-icon">${w04Icon(block.icon || 'reference')}</span><div class="w04-card-body"><strong dir="auto">${esc(card.title)}</strong>${card.subtitle ? `<small dir="auto">${esc(card.subtitle)}</small>` : ''}${lines}</div>${card.external ? `<span class="w04-card-action" aria-hidden="true">${w04Icon('external')}</span>` : ''}</li>`;
  }).join('')}</ul>`;
}

function w04RenderTable(block) {
  const rows = block.rows || [];
  if (!rows.length) return w04EmptyToken(block.emptyMessage || 'No row is bound to this table.');
  return `<div class="w04-table-wrap w04-record-table-wrap"><table class="w04-table w04-record-table"><thead><tr>${(block.columns || []).map(column => `<th scope="col">${esc(column)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${(row.cells || []).map(cell => {
    const cls = [];
    if (cell.tone) cls.push(`w04-text-${cell.tone}`);
    if (cell.mono) cls.push('w04-mono');
    const dir = cell.dir ? ` dir="${esc(cell.dir)}"` : '';
    return `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}><strong${dir}>${esc(cell.text)}</strong>${cell.sub ? `<small${dir}>${esc(cell.sub)}</small>` : ''}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function w04RenderProse(block) {
  const cls = ['w04-prose'];
  if (block.dashed) cls.push('w04-dashed');
  if (block.tone) cls.push(`w04-tone-${block.tone}`);
  if (!block.text) {
    const head = block.boxTitle ? `<strong>${esc(block.boxTitle)}</strong>` : '';
    return `${head ? `<div class="${cls.join(' ')}">${head}</div>` : ''}${w04EmptyToken(block.emptyMessage)}`;
  }
  return `<div class="${cls.join(' ')}">${block.boxTitle ? `<strong>${esc(block.boxTitle)}</strong>` : ''}<p dir="auto">${esc(block.text)}</p></div>`;
}

function w04RenderNotice(block) {
  return `<aside class="w04-notice w04-tone-${esc(block.tone || 'info')}" data-w04-notice><span class="w04-notice-icon">${w04Icon(block.tone === 'warning' ? 'warn' : 'claim')}</span><div><strong dir="auto">${esc(block.title)}</strong><p dir="auto">${esc(block.body)}</p></div></aside>`;
}

function w04RenderSteps(block) {
  return `<ol class="w04-steps">${(block.items || []).map(item => `<li class="w04-step" data-w04-step data-w04-step-number="${esc(item.number)}"><span class="w04-step-num">${esc(item.number)}</span><div class="w04-step-body"><h4 dir="auto">${esc(item.title)}</h4>${w04RenderBlock(item.body)}</div></li>`).join('')}</ol>`;
}

function w04RenderSplit(block) {
  const left = block.left ? `<div class="w04-split-col">${w04RenderBlock(block.left)}</div>` : '';
  const right = block.right ? `<div class="w04-split-col">${w04RenderBlock(block.right)}</div>` : '';
  return `<div class="w04-split">${left}${right}</div>`;
}

function w04RenderBlock(block) {
  if (!block) return '';
  if (block.kind === 'notice') return w04RenderNotice(block);
  let inner = '';
  if (block.kind === 'track') inner = w04RenderTrack(block);
  else if (block.kind === 'rows') inner = w04RenderRows(block.rows);
  else if (block.kind === 'grid') inner = w04RenderGrid(block);
  else if (block.kind === 'cards') inner = w04RenderCards(block);
  else if (block.kind === 'table') inner = w04RenderTable(block);
  else if (block.kind === 'prose') inner = w04RenderProse(block);
  else if (block.kind === 'steps') inner = w04RenderSteps(block);
  else if (block.kind === 'split') inner = w04RenderSplit(block);
  if (!block.title) return inner;
  const head = block.icon ? `<span class="w04-block-icon">${w04Icon(block.icon)}</span>` : '';
  return `<section class="m0-semantic-group w04-block" data-w04-block="${esc(block.id || block.kind)}"><h3>${head}<span dir="auto">${esc(block.title)}</span></h3>${inner}</section>`;
}

function w04RenderHeader(header = {}) {
  const pills = (header.pills || []).map(pill => {
    const badge = pill.badge ? `<span class="w04-pill-badge">${esc(pill.badge)}</span>` : '';
    const note = pill.note ? `<span class="w04-pill-note">${esc(pill.note)}</span>` : '';
    return `<span class="w04-pill w04-tone-${esc(pill.tone || 'neutral')}" data-w04-pill><span class="w04-pill-label">${esc(pill.label)}</span><strong dir="ltr">${esc(pill.value)}</strong>${note}${badge}</span>`;
  }).join('');
  const dir = header.titleDir ? ` dir="${esc(header.titleDir)}"` : '';
  return `<header class="w04-rec-head" data-w04-record-head><span class="w04-rec-icon">${w04Icon(header.icon)}</span><div class="w04-rec-titles"><h2 class="w04-rec-title"${dir}>${esc(header.title)}</h2>${header.sub ? `<p class="w04-rec-sub" dir="auto">${esc(header.sub)}</p>` : ''}</div><div class="w04-rec-pills">${pills}</div></header>`;
}

const W04_PRESENTATION_CSS = `
.w04-rec-head{display:flex;align-items:flex-start;gap:12px;padding:14px 14px 12px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012))}
.w04-rec-icon{display:grid;place-items:center;width:38px;height:38px;flex:0 0 auto;border-radius:10px;border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.w04-rec-icon .w04-icon{width:22px;height:22px}
.w04-rec-titles{flex:1 1 auto;min-width:0}
.w04-rec-title{margin:0;font-size:clamp(17px,1.55vw,24px);line-height:1.25;overflow-wrap:anywhere}
.w04-rec-sub{margin:3px 0 0;color:var(--text3);font-size:12.5px;overflow-wrap:anywhere}
.w04-rec-pills{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;max-width:52%}
.w04-icon{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}
.w04-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;border:1px solid currentColor;background:rgba(255,255,255,.03);font:600 11.5px/1.2 var(--mono,ui-monospace,monospace);letter-spacing:.02em;white-space:nowrap}
.w04-pill .w04-pill-label{opacity:.75;font-weight:500;text-transform:uppercase;font-size:10px;letter-spacing:.06em}
.w04-pill strong{font-size:12.5px;overflow-wrap:anywhere}
.w04-pill-note{font-size:10px;opacity:.7;font-style:italic}
.w04-pill-badge{padding:2px 6px;border-radius:5px;background:currentColor;color:var(--panel,#0b1020);font-size:9.5px;letter-spacing:.08em}
.w04-tone-success{--w04-tone:#34d399}
.w04-tone-warning{--w04-tone:#fbbf24}
.w04-tone-danger{--w04-tone:#f87171}
.w04-tone-info{--w04-tone:#38bdf8}
.w04-tone-link{--w04-tone:#5eead4}
.w04-tone-neutral{--w04-tone:var(--text2,#9ca3af)}
.w04-tone-muted{--w04-tone:var(--text3,#7d879b)}
.w04-pill.w04-tone-success,.w04-pill.w04-tone-warning,.w04-pill.w04-tone-danger,.w04-pill.w04-tone-info,.w04-pill.w04-tone-neutral,.w04-pill.w04-tone-muted,.w04-pill.w04-tone-link{color:var(--w04-tone)}
.w04-text-success{color:#34d399}.w04-text-warning{color:#fbbf24}.w04-text-danger{color:#f87171}
.w04-text-info{color:#38bdf8}.w04-text-link{color:#5eead4;text-decoration:none}
.w04-text-muted{color:var(--text3,#7d879b)}.w04-text-neutral{color:var(--text2,#9ca3af)}
.w04-mono,.w04-mono strong{font-family:var(--mono,ui-monospace,monospace);font-size:12px;overflow-wrap:anywhere}
.w04-record{display:grid;gap:12px;direction:ltr;text-align:start}
.w04-block h3{display:flex;align-items:center;gap:7px;font-size:13.5px;font-weight:650;text-transform:none;letter-spacing:0;color:var(--accent);margin-bottom:9px}
.w04-split .w04-block h3{color:var(--text)}
.w04-block h3>span[dir]{flex:1 1 auto}
.w04-block h3 .w04-block-icon{display:inline-grid;place-items:center;color:var(--accent)}
.w04-block h3 span[dir]{min-width:0}
.w04-rows>div>dd{overflow-wrap:anywhere;word-break:normal}
.w04-track{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 10px;padding:0;counter-reset:w04track}
.w04-track-step{display:flex;align-items:center;gap:7px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.025);color:var(--text3);font-size:11.5px;position:relative}
.w04-track-step+.w04-track-step::before{content:'\\2192';position:absolute;left:-11px;color:var(--text3);opacity:.6}
.w04-track-num{display:grid;place-items:center;width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.07);font:600 10.5px/1 var(--mono,ui-monospace,monospace)}
.w04-track-step[data-w04-step-state=done]{border-color:color-mix(in srgb,#34d399 55%,transparent);color:#34d399;background:rgba(52,211,153,.09)}
.w04-track-step[data-w04-step-state=done] .w04-track-num{background:rgba(52,211,153,.22)}
.w04-track-step[data-w04-step-state=current]{border-color:color-mix(in srgb,var(--accent) 70%,transparent);color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);font-weight:700}
.w04-track-step[data-w04-step-state=current] .w04-track-num{background:color-mix(in srgb,var(--accent) 30%,transparent)}
.w04-track-step[data-w04-step-state=blocked]{border-color:color-mix(in srgb,#f87171 55%,transparent);color:#f87171;background:rgba(248,113,113,.08)}
.w04-next{list-style:none;display:grid;gap:6px;margin:0;padding:0}
.w04-next-item{position:relative;padding:7px 10px 7px 26px;border-left:3px solid var(--w04-tone,var(--line));border-radius:0 8px 8px 0;background:rgba(255,255,255,.03);color:var(--text2);font-size:12.5px;line-height:1.5}
.w04-next-item::before{content:'\\25B8';position:absolute;left:9px;top:7px;color:var(--w04-tone,var(--text3))}
.w04-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:0}
.w04-grid-cell{display:grid;gap:3px;padding:9px 10px;border:1px solid color-mix(in srgb,var(--line) 75%,transparent);border-radius:9px;background:rgba(255,255,255,.025)}
.w04-grid-cell dt{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)}
.w04-grid-cell dd{margin:0;font-weight:650;font-size:13px;overflow-wrap:anywhere}
.w04-cards{list-style:none;display:grid;gap:8px;margin:0;padding:0}
.w04-card{display:flex;align-items:flex-start;gap:10px;padding:9px 11px;border:1px solid color-mix(in srgb,var(--line) 80%,transparent);border-left:3px solid var(--w04-tone,var(--accent));border-radius:9px;background:rgba(255,255,255,.025)}
.w04-card-icon{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;color:var(--w04-tone,var(--accent));background:color-mix(in srgb,var(--w04-tone,var(--accent)) 15%,transparent);flex:0 0 auto}
.w04-card-body{display:grid;gap:2px;min-width:0;flex:1 1 auto}
.w04-card-body strong{overflow-wrap:anywhere;font-size:13px}
.w04-card-body small{color:var(--text3);font-size:11.5px;overflow-wrap:anywhere}
.w04-card-body p{margin:3px 0 0;color:var(--text2);font-size:12px}
.w04-card-action{color:var(--text3);display:grid;place-items:center;padding-top:4px}
.w04-table-wrap.w04-record-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px}
table.w04-record-table{width:100%;border-collapse:collapse;min-width:340px}
table.w04-record-table th{font-size:11px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent);position:sticky;top:0}
table.w04-record-table td{vertical-align:top}
table.w04-record-table td small{display:block;color:var(--text3);margin-top:3px;overflow-wrap:anywhere}
.w04-split{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;align-items:start}
.w04-split-col{display:grid;gap:8px;min-width:0}
.w04-prose{padding:11px 12px;border:1px solid color-mix(in srgb,var(--line) 80%,transparent);border-radius:9px;background:rgba(255,255,255,.025);display:grid;gap:6px}
.w04-prose strong{font-size:13px}
.w04-prose p{margin:0;color:var(--text2);font-size:12.5px;line-height:1.6}
.w04-prose.w04-dashed{border-style:dashed;border-color:color-mix(in srgb,var(--w04-tone,var(--accent)) 60%,transparent);background:color-mix(in srgb,var(--w04-tone,var(--accent)) 7%,transparent)}
.w04-prose.w04-dashed strong{color:var(--w04-tone,var(--accent))}
.w04-notice{display:flex;gap:11px;padding:12px 13px;border:1px solid color-mix(in srgb,var(--w04-tone,var(--accent)) 55%,transparent);border-left-width:4px;border-radius:10px;background:color-mix(in srgb,var(--w04-tone,var(--accent)) 10%,transparent)}
.w04-notice-icon{color:var(--w04-tone,var(--accent));display:grid;place-items:center;padding-top:2px}
.w04-notice-icon .w04-icon{width:19px;height:19px}
.w04-notice strong{display:block;color:var(--w04-tone,var(--accent));font-size:13px;letter-spacing:.01em;overflow-wrap:anywhere}
.w04-notice p{margin:5px 0 0;color:var(--text2);font-size:12.5px;line-height:1.55}
.w04-steps{list-style:none;display:grid;gap:9px;margin:0;padding:0;counter-reset:w04step}
.w04-step{display:grid;grid-template-columns:auto minmax(0,1fr);gap:11px;padding:11px 12px;border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:10px;background:rgba(255,255,255,.02);position:relative}
.w04-step+.w04-step::before{content:'\\2193';position:absolute;top:-13px;left:17px;color:var(--text3);opacity:.75}
.w04-step-num{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:color-mix(in srgb,var(--accent) 25%,transparent);border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);color:var(--accent);font:700 13px/1 var(--mono,ui-monospace,monospace)}
.w04-step-body{display:grid;gap:8px;min-width:0}
.w04-step-body h4{margin:0;font-size:13.5px}
.w04-overflow{position:relative;display:inline-flex;margin-inline-start:6px}
.w04-overflow-toggle::after{content:'';display:inline-block;margin-inline-start:6px;border:4px solid transparent;border-top-color:currentColor;transform:translateY(3px)}
.w04-overflow-menu{position:absolute;top:calc(100% + 6px);inset-inline-end:0;z-index:40;min-width:290px;padding:6px;border:1px solid var(--line);border-radius:10px;background:var(--panel,#111827);box-shadow:0 14px 34px rgba(0,0,0,.5);display:grid;gap:3px}
.w04-overflow-menu[hidden]{display:none}
.w04-overflow-item{display:grid;gap:2px;width:100%;text-align:start;padding:8px 10px;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer}
.w04-overflow-item:hover:not(:disabled){border-color:var(--line);background:rgba(255,255,255,.05)}
.w04-overflow-item:disabled{opacity:.6;cursor:not-allowed}
.w04-overflow-label{font-size:12.5px}
.w04-overflow-reason{font-size:11px;color:var(--text3);line-height:1.35}
@media(max-width:820px){.w04-rec-pills{max-width:100%;justify-content:flex-start}.w04-rec-head{flex-wrap:wrap}}
`;

/* ------------------------------------------------------------------ presentation engine */

const W04_OVERFLOW_COMMANDS = Object.freeze({
  reviews: Object.freeze(['reviews.request', 'reviews.assign', 'reviews.start', 'reviews.ready', 'reviews.continue', 'reviews.cancel', 'reviews.rereview'])
});

let w04StyleBound = false;
let w04DocumentBound = false;
let w04Observer = null;
let w04Scheduled = false;
let w04Group = null;
let w04Options = {};
const w04PreservedNodes = new Map();

function w04EnsureStyle() {
  if (w04StyleBound || typeof document === 'undefined') return;
  if (document.querySelector(`#${'w04SurfacePresentationStyle'}`)) { w04StyleBound = true; return; }
  const style = document.createElement('style');
  style.id = 'w04SurfacePresentationStyle';
  style.textContent = W04_PRESENTATION_CSS;
  document.head.append(style);
  w04StyleBound = true;
}

function w04Foundation() {
  return (globalThis).CEPFoundation || null;
}

function w04SelectedId() {
  const row = document.querySelector('#domainLeftRegion tr[aria-selected="true"]')
    || document.querySelector('#domainLeftRegion [data-r6-row][aria-pressed="true"]');
  return row ? row.getAttribute('data-r6-row') : null;
}

function w04Describe(surface, id) {
  const group = w04Group;
  if (!group || !group[surface]) return null;
  const domain = group[surface].domain;
  try {
    if (surface === 'evidence') return id ? describeEvidenceRecord(domain, id) : describeEvidenceEmpty();
    if (surface === 'reviews') return id ? describeReviewsRecord(domain, id, { claimResolver: w04Options.reviewsClaimResolver || null }) : describeReviewsEmpty();
    if (surface === 'mastery') return id ? describeMasteryRecord(domain, id) : describeMasteryEmpty();
    if (surface === 'portfolio') return id ? describePortfolioRecord(domain, id) : describePortfolioEmpty();
  } catch (error) {
    document.body.dataset.w04PresentationError = String(error?.message || error);
    return null;
  }
  return null;
}

function w04EnhanceCenter() {
  const stage = document.querySelector('#foundationStage');
  if (!stage) return null;
  const surface = stage.dataset.m0Composition;
  if (!surface || !w04Group || !w04Group[surface]) return surface;
  const workbench = stage.querySelector('.m0-workbench');
  if (!workbench) return surface;
  const spec = w04Describe(surface, w04SelectedId());
  if (!spec) return surface;
  const marker = workbench.querySelector(':scope > [data-w04-record-composition]');
  if (marker && marker.getAttribute('data-w04-key') === spec.key) return surface;

  const emptyState = workbench.querySelector(':scope > .m0-empty-state');
  const guidance = workbench.querySelector(':scope > .m0-empty-guidance');
  // D5-class mitigation, surface-local and non-destructive: the shared empty-state copy is
  // English inside an RTL workbench, which displaces sentence-final punctuation. `dir="auto"`
  // lets the copy choose its own direction without touching the shared component.
  if (emptyState && !emptyState.hasAttribute('dir')) emptyState.setAttribute('dir', 'auto');
  if (guidance && !guidance.hasAttribute('dir')) guidance.setAttribute('dir', 'auto');
  const studioCopy = stage.querySelector('.m0-studio-head > div > p');
  if (studioCopy && !studioCopy.hasAttribute('dir')) studioCopy.setAttribute('dir', 'auto');
  const boxes = [...workbench.querySelectorAll(':scope > details.m0-domain-nav')];
  if (boxes.length) w04PreservedNodes.set(surface, boxes);
  const preserved = w04PreservedNodes.get(surface) || [];

  workbench.replaceChildren();
  const header = document.createElement('div');
  header.className = 'w04-record w04-record-head';
  header.setAttribute('data-w04-record-composition', surface);
  header.setAttribute('data-w04-key', spec.key);
  header.innerHTML = w04RenderHeader(spec.header);
  workbench.append(header);
  if (emptyState) workbench.append(emptyState);
  const body = document.createElement('div');
  body.className = 'w04-record w04-record-body';
  body.setAttribute('data-w04-record-body', surface);
  body.innerHTML = (spec.blocks || []).map(w04RenderBlock).join('');
  workbench.append(body);
  if (guidance) workbench.append(guidance);
  preserved.forEach(node => workbench.append(node));
  return surface;
}

function w04FillOverflowMenu(menu, ids) {
  const foundation = w04Foundation();
  const registry = foundation?.registry;
  const workspace = foundation?.workspace;
  let payload = {};
  try { payload = workspace?.toolbarContext?.() || {}; } catch { payload = {}; }
  menu.innerHTML = ids.map(id => {
    const command = registry?.commands?.get?.(id);
    const label = command?.label || id;
    let availability = { enabled: false, reason: 'Semantic command registry is not bound.', code: 'UNAVAILABLE' };
    try { availability = registry?.availability?.(id, payload) || availability; } catch { /* keep truthful default */ }
    const state = availability.enabled ? '' : ` disabled aria-disabled="true"`;
    const reason = availability.enabled ? 'Available in this context' : (availability.reason || availability.code || 'Unavailable');
    return `<button type="button" role="menuitem" class="w04-overflow-item" data-foundation-command="${esc(id)}"${state} title="${esc(reason)}"><span class="w04-overflow-label">${esc(label)}</span><span class="w04-overflow-reason">${esc(reason)}</span></button>`;
  }).join('');
}

/**
 * Empty-state RIGHT region. `region('RIGHT')` is selection-scoped by contract, so with no record
 * selected the shared controller can only render a state token. Governance §7 names an "empty
 * right/context area" a defect, so this block states what the context inspector WILL project for
 * the selected record — the surface's own lens titles and region role, never invented record data.
 */
const W04_CONTEXT_ROLE = Object.freeze({
  evidence: 'Unique provenance / criterion / source / revision context for the selected record',
  reviews: 'Reviewer scope, reviewer authority, prior Review context and provenance conflict context',
  mastery: 'Evaluation provenance, last state-change cause and the shape of a re-evaluation request',
  portfolio: 'Curation truth ceilings, grouping authority state and the curation receipt ledger'
});
const W04_CONTEXT_LENSES = Object.freeze({
  evidence: ['Source integrity and provenance', 'Lineage completeness', 'Duplicate search'],
  reviews: ['Review scope', 'Reviewer authority', 'Prior Review context'],
  mastery: ['Evaluation provenance', 'Re-evaluation request'],
  portfolio: ['Curation authority', 'Curation receipts']
});

function w04EnhanceEmptyContext(surface) {
  const host = document.querySelector('#domainContext');
  if (!host || !surface || !W04_CONTEXT_ROLE[surface]) return;
  const key = `w04-context-empty:${surface}`;
  const existing = host.querySelector(':scope > [data-w04-context-empty]');
  if (existing && existing.getAttribute('data-w04-key') === key) return;
  const owner = w04Group?.[surface]?.domain?.owner || 'W04 domain';
  const block = document.createElement('section');
  block.className = 'm0-semantic-group w04-block w04-context-empty';
  block.setAttribute('data-w04-context-empty', '');
  block.setAttribute('data-w04-key', key);
  block.innerHTML = `<h3><span dir="auto">Context that appears on selection</span></h3>${w04RenderRows([
    { label: 'Region role', value: W04_CONTEXT_ROLE[surface], dir: 'auto' },
    { label: 'Available lenses', value: W04_CONTEXT_LENSES[surface].join(' · '), dir: 'auto' },
    { label: 'Domain owner', value: owner, dir: 'ltr', mono: true },
    { label: 'Selection', value: 'None — the context inspector is selection-scoped; no record context is inferred.', dir: 'auto', tone: 'muted' }
  ])}`;
  host.append(block);
}

function w04EnhanceToolbar(surface) {
  const host = document.querySelector('#domainToolbar');
  if (!host || !surface) return;
  const ids = W04_OVERFLOW_COMMANDS[surface];
  if (!ids || !ids.length) return;
  if (host.querySelector(':scope > [data-w04-overflow]')) return;
  const wrap = document.createElement('div');
  wrap.className = 'w04-overflow';
  wrap.setAttribute('data-w04-overflow', surface);
  wrap.innerHTML = `<button type="button" class="btn w04-overflow-toggle" data-w04-overflow-toggle aria-haspopup="menu" aria-expanded="false">More</button><div class="w04-overflow-menu" role="menu" aria-label="More Review commands" hidden></div>`;
  host.append(wrap);
  const toggle = wrap.querySelector('[data-w04-overflow-toggle]');
  const menu = wrap.querySelector('.w04-overflow-menu');
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const willOpen = menu.hidden;
    if (willOpen) w04FillOverflowMenu(menu, ids);
    menu.hidden = !willOpen;
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) menu.querySelector('button:not(:disabled)')?.focus();
  });
}

function w04Run() {
  if (typeof document === 'undefined') return;
  try {
    const surface = w04EnhanceCenter();
    w04EnhanceToolbar(surface);
    if (surface && !w04SelectedId()) w04EnhanceEmptyContext(surface);
    delete document.body.dataset.w04PresentationError;
  } catch (error) {
    document.body.dataset.w04PresentationError = String(error?.message || error);
  }
}

function w04Schedule() {
  if (w04Scheduled) return;
  w04Scheduled = true;
  queueMicrotask(() => { w04Scheduled = false; w04Run(); });
}

function w04BindDocument() {
  if (w04DocumentBound || typeof document === 'undefined') return;
  w04DocumentBound = true;
  const closeMenus = () => {
    document.querySelectorAll('.w04-overflow-menu:not([hidden])').forEach(menu => {
      menu.hidden = true;
      menu.parentElement?.querySelector('[data-w04-overflow-toggle]')?.setAttribute('aria-expanded', 'false');
    });
  };
  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.w04-overflow-menu')) closeMenus();
  }, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenus(); }, true);
  // A command executed from #domainToolbar mutates the domain but the shared controller does
  // not re-render the stage; refresh the projection so the enacted state is actually visible.
  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const command = target.closest('[data-foundation-command]');
    if (!command) return;
    if (!command.closest('#domainToolbar') && !command.closest('[data-w04-overflow]')) return;
    queueMicrotask(() => {
      try { w04Foundation()?.m0Composition?.mounted?.render?.(); } catch { /* presentation only */ }
    });
  });
}

/**
 * Install the W04 surface record presentation for one mounted W04 group composition.
 * Safe to call from Node (tests) — it is a no-op without a DOM.
 */
export function installW04SurfacePresentation(group, options = {}) {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return null;
  w04Group = group;
  w04Options = options || {};
  w04EnsureStyle();
  w04BindDocument();
  if (w04Observer) { w04Observer.disconnect(); w04Observer = null; }
  w04Observer = new MutationObserver(() => w04Schedule());
  w04Observer.observe(document.documentElement, { childList: true, subtree: true });
  w04Schedule();
  return group;
}
