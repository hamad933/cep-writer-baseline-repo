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
  claim: '<path d="M4 5h20v11H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  warn: '<path d="M12 3.5L21 20H3z"/><path d="M12 10v4.5"/><path d="M12 17.4h.01"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M18 14.5V20H4V6h5.5"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
  note: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  domain: '<path d="M4 20V7l7-3.5"/><path d="M11 20V9l8 3.5V20"/><path d="M3 20h18"/><path d="M14.5 15.5h1.5"/><path d="M7 10.5h1"/>',
  file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h5M10 16.5h5"/>',
  stack: '<path d="M12 4l8 3.8-8 3.8-8-3.8z"/><path d="M4 12l8 3.8 8-3.8"/><path d="M4 16.2l8 3.8 8-3.8"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.4 12.4l2.6 2.6 4.6-5.2"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.4 15.4L20 20"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.2v4.6"/><path d="M12 8.2h.01"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.4v2.4M12 18.2v2.4M20.6 12h-2.4M5.8 12H3.4M18.1 5.9l-1.7 1.7M7.6 16.4l-1.7 1.7M18.1 18.1l-1.7-1.7M7.6 7.6L5.9 5.9"/>'
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
    const icon = row.icon ? `<span class="w04-row-ico" aria-hidden="true">${w04Icon(row.icon)}</span>` : '';
    const wide = row.wide ? ' data-w04-wide="true"' : '';
    return `<div data-w04-row="${esc(row.label)}"${wide}><dt>${icon}<span class="w04-row-label">${esc(row.label)}</span></dt><dd${attrs.join('')}>${esc(row.value)}</dd></div>`;
  }).join('')}</dl>`;
}

function w04RenderTrack(block) {
  const steps = (block.steps || []).map((step, index) =>
    `<li class="w04-track-step" data-w04-step data-w04-step-number="${index + 1}" data-w04-step-state="${esc(step.state || 'future')}"><span class="w04-track-num">${index + 1}</span><span class="w04-track-label">${esc(step.label)}</span></li>`).join('');
  const next = (block.next || []).map(item =>
    `<li class="w04-next-item${toneClass(item.tone)}" dir="auto">${esc(item.text)}</li>`).join('');
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
  });
  const [primary, ...rest] = pills;
  const dir = header.titleDir ? ` dir="${esc(header.titleDir)}"` : '';
  return `<header class="w04-rec-head" data-w04-record-head><span class="w04-rec-icon">${w04Icon(header.icon)}</span>`
    + `<div class="w04-rec-titles">`
    + `<div class="w04-rec-titlerow"><h2 class="w04-rec-title"${dir}>${esc(header.title)}</h2>${primary || ''}</div>`
    + (header.sub ? `<p class="w04-rec-sub" dir="auto">${esc(header.sub)}</p>` : '')
    + (rest.length ? `<div class="w04-rec-meta">${rest.join('')}</div>` : '')
    + `</div></header>`;
}

/* Consumer-scoped prefix: every rule that touches SHARED region chrome (studio head, left
 * region, context pane, toolbar, workbench empty state) is bound to a W04 consumer so the
 * surface-local presentation never leaks into other surfaces' chrome. */
const W04_SCOPE = 'body:is([data-consumer=evidence],[data-consumer=reviews],[data-consumer=mastery],[data-consumer=portfolio])';

const W04_PRESENTATION_CSS = `
/* ════════════════════════════════════════════════════════════════════
 * W04 SURFACE PRESENTATION SYSTEM
 * Shared mechanics own structure (collection matrix, context inspector,
 * toolbar, shelf). This stylesheet owns the W04 *presentation*: one record
 * panel per selected record, teal section headings, gated check cards in the
 * RIGHT context lens, an intake queue in LEFT, and a hierarchical action row.
 * Geometry is logical (inline/block) so RTL and LTR mirror without layout code.
 * ════════════════════════════════════════════════════════════════════ */

/* ── direction follows the ACTIVE preference (language policy / PARALLEL_EXECUTION_PLAN §3).
 * The shared controller bakes direction:rtl into .m0-collection-panel/.m0-workbench/.m0-truth,
 * which overrides the preference and breaks LTR composition. Surface-family-scoped correction:
 * inherit the pane direction (RTL stays RTL; LTR now actually is LTR). The same root cause is
 * reported to the Controller for a shared-level fix across every m0 consumer. ── */
${W04_SCOPE} :is(.m0-collection-panel,.m0-workbench,.m0-truth){direction:inherit}

/* ── center stage: reclaim vertical space from the shared studio head ── */
#foundationStage[data-m0-composition=evidence],#foundationStage[data-m0-composition=reviews],#foundationStage[data-m0-composition=mastery],#foundationStage[data-m0-composition=portfolio]{padding:14px 16px}
${W04_SCOPE} .m0-studio-head{display:block;padding:9px 14px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel,#0d1424) 92%,#ffffff 8%);margin:0 0 12px}
${W04_SCOPE} .m0-studio-head>div{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}
${W04_SCOPE} .m0-studio-head h1{font-size:15px;line-height:1.3;margin:0;font-weight:700;color:var(--text)}
${W04_SCOPE} .m0-studio-head .m0-eyebrow{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--text3,#7d879b)}
${W04_SCOPE} .m0-studio-head p{margin:0;font-size:12px;color:var(--text3,#7d879b);line-height:1.45;flex:1 1 260px;min-width:0}

/* ── record panel: header card + content card read as ONE panel ── */
.w04-record{display:grid;gap:0;text-align:start;margin:0}
.m0-workbench>.w04-record.w04-record-head{position:relative;z-index:1}
.w04-record-head{border:1px solid var(--line);border-start-start-radius:14px;border-start-end-radius:14px;background:linear-gradient(180deg,color-mix(in srgb,var(--accent,#38bdf8) 10%,transparent),transparent 78%),color-mix(in srgb,var(--panel,#0d1424) 94%,#ffffff 6%)}
.w04-record-body{border:1px solid var(--line);border-block-start:0;border-end-start-radius:14px;border-end-end-radius:14px;background:color-mix(in srgb,var(--panel,#0d1424) 96%,#ffffff 4%);padding:0 16px}
.w04-rec-head{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border:0;background:transparent}
.w04-rec-icon{display:grid;place-items:center;width:38px;height:38px;flex:0 0 auto;border-radius:11px;border:1px solid color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent);color:var(--accent,#38bdf8);background:color-mix(in srgb,var(--accent,#38bdf8) 13%,transparent)}
.w04-rec-icon .w04-icon{width:21px;height:21px}
.w04-rec-titles{flex:1 1 auto;min-width:0;display:grid;gap:5px}
.w04-rec-titlerow{display:flex;flex-wrap:wrap;align-items:center;gap:5px 9px;min-width:0}
.w04-rec-title{margin:0;flex:0 1 auto;font-size:clamp(17px,1.35vw,19px);line-height:1.25;font-weight:700;letter-spacing:-.01em;overflow-wrap:anywhere;color:var(--text)}
.w04-rec-sub{margin:0;font-family:var(--mono,ui-monospace,monospace);font-size:11.5px;color:var(--text3,#7d879b);overflow-wrap:anywhere;letter-spacing:.01em}
.w04-rec-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}
.w04-rec-meta .w04-pill{padding:4px 9px;font-size:10.5px}
.w04-rec-meta .w04-pill .w04-pill-label{font-size:9px;letter-spacing:.06em}
.w04-rec-meta .w04-pill strong{font-size:11px}
.w04-rec-pills{display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end;align-content:flex-start;max-width:52%}
.w04-icon{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}

/* ── status pills ── */
.w04-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;border:1px solid currentColor;background:rgba(255,255,255,.035);font:600 11px/1.25 var(--mono,ui-monospace,monospace);letter-spacing:.02em;white-space:nowrap}
.w04-pill .w04-pill-label{opacity:.72;font-weight:600;text-transform:uppercase;font-size:9.5px;letter-spacing:.07em}
.w04-pill strong{font-size:12px;overflow-wrap:anywhere;font-weight:700}
.w04-rec-titlerow>.w04-pill{padding:5px 10px;font-size:10.5px;box-shadow:0 0 0 3px color-mix(in srgb,var(--w04-tone,var(--accent)) 12%,transparent)}
.w04-rec-titlerow>.w04-pill .w04-pill-label{font-size:8.5px;letter-spacing:.05em}
.w04-rec-titlerow>.w04-pill strong{font-size:11px}
.w04-pill-note{font-size:10px;opacity:.7;font-style:italic}
.w04-pill-badge{padding:2px 6px;border-radius:5px;background:currentColor;color:var(--panel,#0b1020);font-size:9.5px;letter-spacing:.08em}
.w04-tone-success{--w04-tone:#4ade80}
.w04-tone-warning{--w04-tone:#fbbf24}
.w04-tone-danger{--w04-tone:#f87171}
.w04-tone-info{--w04-tone:#818cf8}
.w04-tone-link{--w04-tone:#2dd4bf}
.w04-tone-neutral{--w04-tone:var(--text2,#9ca3af)}
.w04-tone-muted{--w04-tone:var(--text3,#7d879b)}
.w04-pill.w04-tone-success,.w04-pill.w04-tone-warning,.w04-pill.w04-tone-danger,.w04-pill.w04-tone-info,.w04-pill.w04-tone-neutral,.w04-pill.w04-tone-muted,.w04-pill.w04-tone-link{color:var(--w04-tone)}
.w04-text-success{color:#4ade80}.w04-text-warning{color:#fbbf24}.w04-text-danger{color:#f87171}
.w04-text-info{color:#818cf8}.w04-text-link{color:#2dd4bf;text-decoration:none}
.w04-text-muted{color:var(--text3,#7d879b)}.w04-text-neutral{color:var(--text2,#9ca3af)}
.w04-mono,.w04-mono strong{font-family:var(--mono,ui-monospace,monospace);font-size:12px;overflow-wrap:anywhere}

/* ── panel sections: ONE panel, hairline-separated, teal headings ── */
.w04-record-body>.w04-block{border:0;border-block-start:1px solid color-mix(in srgb,var(--line) 62%,transparent);border-radius:0;background:transparent;margin:0;padding:13px 0 15px}
.w04-record-body>.w04-block:first-child{border-block-start:0}
.w04-record-body>.w04-block[data-w04-block=intake]{margin-inline:-16px;padding:12px 16px;border-block-start:0;background:color-mix(in srgb,var(--accent,#38bdf8) 7%,transparent);border-block-end:1px solid color-mix(in srgb,var(--line) 62%,transparent)}
.w04-block h3{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;text-transform:none;letter-spacing:.01em;color:#2dd4bf;margin:0 0 9px}
.w04-split .w04-block h3{color:var(--text)}
.w04-block h3>span[dir]{flex:1 1 auto;min-width:0}
.w04-block h3 .w04-block-icon{display:inline-grid;place-items:center;color:#2dd4bf}
.w04-block h3 .w04-block-icon .w04-icon{width:15px;height:15px}

/* ── labelled record rows (per-row icon, label, value) ── */
.w04-rows{gap:0}
.w04-rows>div{display:grid;grid-template-columns:minmax(148px,.42fr) minmax(0,1fr);gap:14px;align-items:start;padding:8px 0;border-block-end:1px solid color-mix(in srgb,var(--line) 52%,transparent)}
.w04-rows>div:last-child{border-block-end:0}
.w04-rows>div>dt{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--text);line-height:1.4;min-width:0}
.w04-row-label{min-width:0;overflow-wrap:anywhere}
.w04-row-ico{display:inline-grid;place-items:center;width:17px;height:17px;flex:0 0 auto;color:color-mix(in srgb,#2dd4bf 62%,var(--text3,#7d879b))}
.w04-row-ico .w04-icon{width:15px;height:15px;stroke-width:1.6}
.w04-rows>div>dd{margin:0;font-size:13px;line-height:1.5;color:var(--text2);overflow-wrap:anywhere;word-break:normal;min-width:0}
.w04-rows>div>dd.w04-text-link{font-weight:600}
.w04-rows>div>dd[dir=ltr]{unicode-bidi:isolate}

/* ── lifecycle track + what-happens-next (D9 affordance) ── */
.w04-track{list-style:none;display:flex;flex-wrap:wrap;gap:4px 14px;margin:0 0 10px;padding:0}
.w04-track-step{display:flex;align-items:center;gap:6px;flex:1 1 116px;min-width:0;padding:4px 9px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.03);color:var(--text3);font-size:11px;position:relative;line-height:1.35}
.w04-track-step .w04-track-label{min-width:0;overflow-wrap:anywhere}
.w04-track-step+.w04-track-step::before{content:'\\2192';position:absolute;inset-inline-start:-11px;top:50%;transform:translateY(-50%);color:var(--text3);opacity:.6}
body[data-foundation-direction=rtl] .w04-track-step+.w04-track-step::before{content:'\\2190'}
.w04-track-num{display:grid;place-items:center;width:16px;height:16px;border-radius:5px;background:rgba(255,255,255,.08);font:600 10px/1 var(--mono,ui-monospace,monospace);flex:0 0 auto}
.w04-track-step[data-w04-step-state=done]{border-color:color-mix(in srgb,#4ade80 55%,transparent);color:#4ade80;background:rgba(74,222,128,.09)}
.w04-track-step[data-w04-step-state=done] .w04-track-num{background:rgba(74,222,128,.22)}
.w04-track-step[data-w04-step-state=current]{border-color:color-mix(in srgb,var(--accent,#38bdf8) 75%,transparent);color:var(--accent,#38bdf8);background:color-mix(in srgb,var(--accent,#38bdf8) 15%,transparent);font-weight:700}
.w04-track-step[data-w04-step-state=current] .w04-track-num{background:color-mix(in srgb,var(--accent,#38bdf8) 32%,transparent);color:var(--text)}
.w04-track-step[data-w04-step-state=blocked]{border-color:color-mix(in srgb,#f87171 55%,transparent);color:#f87171;background:rgba(248,113,113,.08)}
.w04-next{list-style:none;display:grid;gap:5px;margin:0;padding:0}
.w04-next-item{position:relative;padding:6px 10px 6px 24px;border-inline-start:3px solid var(--w04-tone,var(--line));background:rgba(255,255,255,.03);color:var(--text2);font-size:12px;line-height:1.45;border-radius:0 7px 7px 0}
body[data-foundation-direction=rtl] .w04-next-item{border-radius:7px 0 0 7px}
.w04-next-item::before{content:'\\25B8';position:absolute;inset-inline-start:8px;top:6px;color:var(--w04-tone,var(--text3))}
.w04-next-item.w04-tone-neutral{border-inline-start-color:color-mix(in srgb,var(--line) 80%,transparent);color:var(--text3);font-size:11.5px;background:rgba(255,255,255,.018)}
.w04-next-item.w04-tone-neutral::before{content:'\\00B7'}

/* ── supporting reference rows ── */
.w04-cards{list-style:none;display:grid;gap:7px;margin:0;padding:0}
.w04-card{display:flex;align-items:center;gap:11px;padding:9px 11px;border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:10px;background:color-mix(in srgb,var(--panel,#0d1424) 88%,#ffffff 12%);transition:border-color .12s ease}
.w04-card:hover{border-color:color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent)}
.w04-card-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;color:var(--w04-tone,var(--accent));background:color-mix(in srgb,var(--w04-tone,var(--accent)) 15%,transparent);flex:0 0 auto}
.w04-card-icon .w04-icon{width:16px;height:16px}
.w04-card-body{display:grid;gap:2px;min-width:0;flex:1 1 auto}
.w04-card-body strong{overflow-wrap:anywhere;font-size:13px;font-weight:600;color:var(--text)}
.w04-card-body small{color:var(--text3);font-size:11px;overflow-wrap:anywhere;letter-spacing:.04em;text-transform:uppercase}
.w04-card-body p{margin:3px 0 0;color:var(--text2);font-size:12px}
.w04-card-action{color:var(--text3);display:grid;place-items:center;padding-top:2px}
.w04-card:hover .w04-card-action{color:var(--accent)}

/* ── grid / table / prose / notice / steps / split (kept as inner cards) ── */
.w04-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:0}
.w04-grid-cell{display:grid;gap:3px;padding:9px 10px;border:1px solid color-mix(in srgb,var(--line) 75%,transparent);border-radius:9px;background:rgba(255,255,255,.025)}
.w04-grid-cell dt{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)}
.w04-grid-cell dd{margin:0;font-weight:650;font-size:13px;overflow-wrap:anywhere}
.w04-table-wrap.w04-record-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px}
table.w04-record-table{width:100%;border-collapse:collapse;min-width:340px}
table.w04-record-table th{font-size:11px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent);position:sticky;top:0}
table.w04-record-table td{vertical-align:top}
table.w04-record-table td small{display:block;color:var(--text3);margin-top:3px;overflow-wrap:anywhere}
.w04-split{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;align-items:start}
.w04-split-col{display:grid;gap:8px;min-width:0}
.w04-split .w04-block,.m0-workbench .w04-record-body .w04-split .w04-block{border:1px solid color-mix(in srgb,var(--line) 80%,transparent);border-radius:11px;background:rgba(255,255,255,.025);padding:11px 12px;margin:0}
.w04-prose{padding:11px 12px;border:1px solid color-mix(in srgb,var(--line) 80%,transparent);border-radius:9px;background:rgba(255,255,255,.025);display:grid;gap:6px}
.w04-prose strong{font-size:13px}
.w04-prose p{margin:0;color:var(--text2);font-size:12.5px;line-height:1.6}
.w04-prose.w04-dashed{border-style:dashed;border-color:color-mix(in srgb,var(--w04-tone,var(--accent)) 60%,transparent);background:color-mix(in srgb,var(--w04-tone,var(--accent)) 7%,transparent)}
.w04-prose.w04-dashed strong{color:var(--w04-tone,var(--accent))}
.w04-notice{display:flex;gap:11px;padding:12px 13px;border:1px solid color-mix(in srgb,var(--w04-tone,var(--accent)) 55%,transparent);border-left-width:4px;border-radius:10px;background:color-mix(in srgb,var(--w04-tone,var(--accent)) 10%,transparent)}
body[data-foundation-direction=rtl] .w04-notice{border-left-width:1px;border-inline-start-width:4px}
.w04-notice-icon{color:var(--w04-tone,var(--accent));display:grid;place-items:center;padding-top:2px}
.w04-notice-icon .w04-icon{width:19px;height:19px}
.w04-notice strong{display:block;color:var(--w04-tone,var(--accent));font-size:13px;letter-spacing:.01em;overflow-wrap:anywhere}
.w04-notice p{margin:5px 0 0;color:var(--text2);font-size:12.5px;line-height:1.55}
.w04-steps{list-style:none;display:grid;gap:9px;margin:0;padding:0;counter-reset:w04step}
.w04-step{display:grid;grid-template-columns:auto minmax(0,1fr);gap:11px;padding:11px 12px;border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:10px;background:rgba(255,255,255,.02);position:relative}
.w04-step+.w04-step::before{content:'\\2193';position:absolute;top:-13px;left:17px;color:var(--text3);opacity:.75}
.w04-step-num{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:color-mix(in srgb,var(--accent,#38bdf8) 25%,transparent);border:1px solid color-mix(in srgb,var(--accent,#38bdf8) 55%,transparent);color:var(--accent,#38bdf8);font:700 13px/1 var(--mono,ui-monospace,monospace)}
.w04-step-body{display:grid;gap:8px;min-width:0}
.w04-step-body h4{margin:0;font-size:13.5px}

/* ── LEFT: intake queue ── */
${W04_SCOPE} #domainLeftRegion{display:flex;flex-direction:column;height:100%;min-height:0}
.w04-queue-head{flex:0 0 auto;margin:0 0 6px;padding:0 0 7px;border-block-end:1px solid var(--line)}
.w04-segments{display:grid;gap:2px}
.w04-segment{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:7px 9px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--text2);font:600 12px/1.3 var(--ui,system-ui),system-ui;cursor:pointer;text-align:start;transition:background .1s ease,border-color .1s ease,color .1s ease}
.w04-segment>span{min-width:0;overflow-wrap:anywhere}
.w04-seg-count{font:600 10.5px/1 var(--mono,ui-monospace,monospace);color:var(--text3);background:rgba(255,255,255,.06);border-radius:999px;padding:3px 7px;flex:0 0 auto}
.w04-segment:hover{background:rgba(255,255,255,.045);border-color:var(--line);color:var(--text)}
.w04-segment[aria-pressed=true]{background:color-mix(in srgb,var(--accent,#38bdf8) 13%,transparent);border-color:color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent);color:var(--accent,#38bdf8)}
.w04-segment[aria-pressed=true] .w04-seg-count{background:color-mix(in srgb,var(--accent,#38bdf8) 25%,transparent);color:var(--text)}
.w04-segment:focus-visible{outline:2px solid var(--focus,#38bdf8);outline-offset:1px}
${W04_SCOPE} #domainLeftRegion .m0-collection-panel{border:0;background:transparent;padding:0;flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain}
${W04_SCOPE} #domainLeftRegion .m0-table-wrap{border:0;overflow-x:hidden;border-radius:0}
${W04_SCOPE} #domainLeftRegion .m0-table{table-layout:fixed}
${W04_SCOPE} #domainLeftRegion .m0-table th{font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--text3);background:transparent;position:static;padding:3px 8px 6px;border-block-end:1px solid var(--line);text-align:start}
${W04_SCOPE} #domainLeftRegion .m0-table th:first-child{width:auto}
${W04_SCOPE} #domainLeftRegion .m0-table th:last-child{width:86px;text-align:end}
${W04_SCOPE} #domainLeftRegion .m0-table td:last-child strong{font-size:11.5px;overflow-wrap:normal;word-break:normal;white-space:nowrap}
${W04_SCOPE} #domainLeftRegion .m0-table td{padding:8px;border-block-end:1px solid color-mix(in srgb,var(--line) 50%,transparent);text-align:start;vertical-align:top}
${W04_SCOPE} #domainLeftRegion .m0-table td:last-child{text-align:end}
${W04_SCOPE} #domainLeftRegion .m0-table tr{cursor:pointer;transition:background .1s ease}
${W04_SCOPE} #domainLeftRegion .m0-table tbody tr:hover td{background:rgba(255,255,255,.035)}
${W04_SCOPE} #domainLeftRegion .m0-table td strong{display:block;font-size:12.5px;font-weight:600;color:var(--text);line-height:1.35;overflow-wrap:anywhere}
${W04_SCOPE} #domainLeftRegion .m0-table td small{display:block;font-size:10.5px;color:var(--text3);margin-top:3px;overflow-wrap:anywhere;letter-spacing:.02em}
${W04_SCOPE} #domainLeftRegion .m0-table tr[aria-selected=true] td{background:color-mix(in srgb,var(--accent,#38bdf8) 13%,transparent)}
${W04_SCOPE} #domainLeftRegion .m0-table tr[aria-selected=true] td:first-child{box-shadow:inset 3px 0 0 var(--accent,#38bdf8)}
${W04_SCOPE} body[data-foundation-direction=rtl] #domainLeftRegion .m0-table tr[aria-selected=true] td:first-child{box-shadow:inset -3px 0 0 var(--accent,#38bdf8)}
${W04_SCOPE} #domainLeftRegion .m0-table tr[aria-selected=true] td strong{color:var(--accent,#38bdf8)}
${W04_SCOPE} #domainLeftRegion .m0-table tr[data-w04-tone=success] td:last-child strong{color:#4ade80}
${W04_SCOPE} #domainLeftRegion .m0-table tr[data-w04-tone=info] td:last-child strong{color:#818cf8}
${W04_SCOPE} #domainLeftRegion .m0-table tr[data-w04-tone=warning] td:last-child strong{color:#fbbf24}
${W04_SCOPE} #domainLeftRegion .m0-table tr[data-w04-tone=danger] td:last-child strong{color:#f87171}
${W04_SCOPE} #domainLeftRegion .m0-table tr[data-w04-tone=neutral] td:last-child strong{color:var(--text3)}
${W04_SCOPE} #domainLeftRegion .m0-collection .state-token{margin:0;border-style:dashed;background:rgba(255,255,255,.02);font-size:12px;color:var(--text2)}
.w04-queue-foot{flex:0 0 auto;margin:10px 0 0;padding:10px 0 0;border-block-start:1px solid var(--line);display:grid;gap:7px}
.w04-queue-note{margin:0;font-size:11px;line-height:1.45;color:var(--text3)}
.w04-queue-note bdi{font-family:var(--mono,ui-monospace,monospace)}
.w04-settings-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:rgba(255,255,255,.03);color:var(--text2);font:600 12px/1.2 var(--ui,var(--font-sans,system-ui)),system-ui;cursor:pointer;text-align:start;transition:border-color .12s ease,color .12s ease}
.w04-settings-btn .w04-icon{width:15px;height:15px;color:var(--text3)}
.w04-settings-btn:hover{border-color:color-mix(in srgb,var(--accent,#38bdf8) 55%,transparent);color:var(--text)}
.w04-settings-btn:hover .w04-icon{color:var(--accent)}
.w04-settings-btn:focus-visible{outline:2px solid var(--focus,#38bdf8);outline-offset:1px}

/* ── RIGHT: gated context check cards ──
 * The shared .pbody clips at pane height with overflow:hidden; the authored lens content is
 * taller than the pane, so the region itself owns the scroll (footer cards + truth notice stay
 * reachable instead of being cut off). */
${W04_SCOPE} #domainContext{font-size:13px;max-height:100%;overflow:auto;overscroll-behavior:contain}
${W04_SCOPE} #domainContext .m0-context-panel{display:grid;gap:0}
${W04_SCOPE} #domainContext .m0-context-panel>.m0-eyebrow{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--text3);margin:0 0 4px}
${W04_SCOPE} #domainContext .m0-context-panel>h3{margin:0 0 9px;font-size:15.5px;line-height:1.3;font-weight:700;color:var(--text);overflow-wrap:anywhere}
${W04_SCOPE} #domainContext .m0-context-panel>.m0-semantic-group{border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:12px;background:color-mix(in srgb,var(--panel,#0d1424) 94%,#ffffff 6%);padding:11px 12px;margin:0 0 9px}
${W04_SCOPE} #domainContext .m0-context-panel>.m0-semantic-group:last-of-type{margin-block-end:0}
${W04_SCOPE} #domainContext .m0-semantic-group>h3{display:flex;align-items:center;gap:7px;margin:0 0 7px;font-size:13px;font-weight:700;color:var(--text);letter-spacing:.01em;text-transform:none}
${W04_SCOPE} #domainContext .m0-semantic-group>h3 .w04-ctx-ico{display:inline-grid;place-items:center;color:#2dd4bf}
${W04_SCOPE} #domainContext .m0-semantic-group>h3 .w04-ctx-ico .w04-icon{width:15px;height:15px}
${W04_SCOPE} #domainContext .m0-semantic-group>h4{margin:9px 0 3px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);font-weight:700}
${W04_SCOPE} #domainContext .m0-semantic-group>h4:first-of-type{margin-block-start:2px}
.w04-ctx-status{margin-inline-start:auto;display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:700;letter-spacing:.05em;padding:2px 7px;border-radius:999px;border:1px solid color-mix(in srgb,var(--w04-ctx-tone) 45%,transparent);color:var(--w04-ctx-tone);background:color-mix(in srgb,var(--w04-ctx-tone) 11%,transparent);white-space:nowrap}
.w04-ctx-status[data-w04-status=pass]{--w04-ctx-tone:#4ade80}
.w04-ctx-status[data-w04-status=hold]{--w04-ctx-tone:#f87171}
.w04-ctx-status[data-w04-status=open]{--w04-ctx-tone:#fbbf24}
.w04-ctx-status .w04-icon{width:11px;height:11px;stroke-width:2.2}
${W04_SCOPE} #domainContext .m0-semantic-list{gap:0}
${W04_SCOPE} #domainContext .m0-semantic-list>div{grid-template-columns:minmax(96px,.44fr) minmax(0,1fr);gap:9px;padding:6px 0;border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
${W04_SCOPE} #domainContext .m0-semantic-list>div:last-child{border-block-end:0}
${W04_SCOPE} #domainContext .m0-semantic-list dt{font-size:11.5px;font-weight:600;color:var(--text3);line-height:1.4}
${W04_SCOPE} #domainContext .m0-semantic-list dd{font-size:12.5px;line-height:1.5;color:var(--text2)}
${W04_SCOPE} #domainContext .m0-technical-token{white-space:normal;overflow:hidden;text-overflow:clip;overflow-wrap:anywhere;max-width:100%;font-family:var(--mono,ui-monospace,monospace);font-size:11.5px;color:var(--text2)}
.w04-gate-mark{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.07em;padding:1px 6px;border-radius:5px;margin-inline-end:6px;vertical-align:1px;color:var(--w04-gate-tone);background:color-mix(in srgb,var(--w04-gate-tone) 14%,transparent);border:1px solid color-mix(in srgb,var(--w04-gate-tone) 40%,transparent);font-family:var(--mono,ui-monospace,monospace)}
.w04-gate-mark[data-w04-gate=pass]{--w04-gate-tone:#4ade80}
.w04-gate-mark[data-w04-gate=hold]{--w04-gate-tone:#f87171}
.w04-gate-mark[data-w04-gate=open]{--w04-gate-tone:#fbbf24}
.w04-gate-mark[data-w04-gate=info]{--w04-gate-tone:var(--text3)}
.w04-gate-rest{overflow-wrap:anywhere}
${W04_SCOPE} #domainContext .m0-context-summary.w04-ctx-notice{display:flex;gap:9px;align-items:flex-start;margin:11px 0 0;padding:11px 12px;border:1px solid color-mix(in srgb,var(--accent,#38bdf8) 45%,transparent);border-radius:11px;background:color-mix(in srgb,var(--accent,#38bdf8) 9%,transparent);font-size:12.5px;line-height:1.55;color:var(--text2)}
${W04_SCOPE} #domainContext .m0-context-summary.w04-ctx-notice .w04-notice-ico{flex:0 0 auto;display:grid;place-items:center;color:var(--accent);margin-block-start:1px}
${W04_SCOPE} #domainContext .m0-context-summary.w04-ctx-notice .w04-notice-ico .w04-icon{width:16px;height:16px}

/* ── empty state composition (inside the record panel) ── */
.w04-record-body>.m0-empty-state{margin:0;padding:13px 0 2px;border:0;display:block}
.w04-record-body>.m0-empty-state .state-token{margin:0;border:0;padding:0;background:transparent;color:var(--text2);font-size:13px;line-height:1.55}
.w04-record-body>.m0-empty-state .state-token strong{color:var(--text3);font-size:11px;letter-spacing:.08em;font-family:var(--mono,ui-monospace,monospace);margin-inline-end:4px}
.w04-record-body>.m0-empty-guidance{margin:0;padding:13px 0 15px;border:0;border-block-start:1px solid color-mix(in srgb,var(--line) 62%,transparent);border-radius:0;background:transparent}
.m0-empty-guidance h3{margin:0 0 7px;font-size:13px;color:#2dd4bf;font-weight:700}
.m0-empty-guidance ul{margin:0;padding-inline-start:18px;display:grid;gap:5px}
.m0-empty-guidance li{font-size:12.5px;line-height:1.5;color:var(--text2)}
${W04_SCOPE} #foundationStage .m0-domain-nav{margin:12px 0 0;border:1px solid color-mix(in srgb,var(--accent,#38bdf8) 40%,transparent);border-radius:12px;background:color-mix(in srgb,var(--accent,#38bdf8) 5%,transparent);padding:9px 14px}
${W04_SCOPE} #foundationStage .m0-domain-nav>summary{cursor:pointer;font-size:12.5px;font-weight:700;color:var(--accent);list-style:none;display:flex;align-items:center;gap:7px}
${W04_SCOPE} #foundationStage .m0-domain-nav>summary::-webkit-details-marker{display:none}
${W04_SCOPE} #foundationStage .m0-domain-nav>summary::before{content:'\\25B8';display:inline-block;transition:transform .12s ease}
${W04_SCOPE} #foundationStage .m0-domain-nav[open]>summary::before{transform:rotate(90deg)}
${W04_SCOPE} body[data-foundation-direction=rtl] #foundationStage .m0-domain-nav[open]>summary::before{transform:rotate(-90deg)}
${W04_SCOPE} body[data-foundation-direction=rtl] #foundationStage .m0-domain-nav>summary::before{content:'\\25BE'}

/* Donor scope tabs carry data-donor-semantic="suppressed" — they must never surface as W04 UI. */
${W04_SCOPE} #rightPane .contextscope{display:none!important}

/* ── toolbar: primary / secondary / tertiary command hierarchy ── */
${W04_SCOPE} #domainToolbar{gap:6px;flex-wrap:wrap;align-items:center}
${W04_SCOPE} #domainToolbar .btn{font-size:12px;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--text2);white-space:nowrap;transition:border-color .12s ease,color .12s ease,background .12s ease}
${W04_SCOPE} #domainToolbar .btn:hover:not(:disabled){border-color:color-mix(in srgb,var(--accent,#38bdf8) 55%,transparent);color:var(--text);background:rgba(255,255,255,.06)}
${W04_SCOPE} #domainToolbar .btn:focus-visible{outline:2px solid var(--focus,#38bdf8);outline-offset:2px}
${W04_SCOPE} #domainToolbar .btn:disabled{opacity:.55;cursor:not-allowed;background:rgba(255,255,255,.015)}
${W04_SCOPE} #domainToolbar [data-foundation-command="evidence.admit"]:not(:disabled){background:color-mix(in srgb,#22c55e 42%,transparent);border-color:#34d399;color:#eafff4;font-weight:700;box-shadow:0 2px 10px rgba(52,211,153,.18)}
${W04_SCOPE} #domainToolbar [data-foundation-command="evidence.admit"]:not(:disabled):hover{background:color-mix(in srgb,#22c55e 58%,transparent);border-color:#4ade80;color:#ffffff}
${W04_SCOPE} #domainToolbar [data-foundation-command="evidence.import"]:not(:disabled){border-color:color-mix(in srgb,var(--accent,#38bdf8) 65%,transparent);color:var(--accent);font-weight:600}
${W04_SCOPE} #domainToolbar [data-foundation-command="evidence.amend"]:not(:disabled),#domainToolbar [data-foundation-command="evidence.sourceChoice"]:not(:disabled){color:var(--text3)}
${W04_SCOPE} #domainToolbar [data-foundation-command="evidence.inspect"]{font-weight:600}

/* ── overflow menu (reviews) ── */
.w04-overflow{position:relative;display:inline-flex;margin-inline-start:6px}
.w04-overflow-toggle::after{content:'';display:inline-block;margin-inline-start:6px;border:4px solid transparent;border-top-color:currentColor;transform:translateY(3px)}
.w04-overflow-menu{position:absolute;top:calc(100% + 6px);inset-inline-end:0;z-index:40;min-width:290px;padding:6px;border:1px solid var(--line);border-radius:10px;background:var(--panel,#111827);box-shadow:0 14px 34px rgba(0,0,0,.5);display:grid;gap:3px}
.w04-overflow-menu[hidden]{display:none}
.w04-overflow-item{display:grid;gap:2px;width:100%;text-align:start;padding:8px 10px;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer}
.w04-overflow-item:hover:not(:disabled){border-color:var(--line);background:rgba(255,255,255,.05)}
.w04-overflow-item:disabled{opacity:.6;cursor:not-allowed}
.w04-overflow-label{font-size:12.5px}
.w04-overflow-reason{font-size:11px;color:var(--text3);line-height:1.35}

/* ── shared empty-context block (RIGHT, no selection): role rows + lens skeletons ── */
.w04-context-empty{margin:0;padding:0;border:0;background:transparent}
.w04-context-empty>h3{margin:2px 0 8px;font-size:13px;font-weight:700;color:#2dd4bf}
.w04-context-empty .m0-semantic-list>div{grid-template-columns:minmax(96px,.44fr) minmax(0,1fr)}
.w04-ctx-skeleton{border:1px solid color-mix(in srgb,var(--line) 85%,transparent);border-radius:12px;background:color-mix(in srgb,var(--panel,#0d1424) 94%,#ffffff 6%);padding:11px 12px;margin:0 0 9px}
.w04-ctx-skeleton h3{display:flex;align-items:center;gap:7px;margin:0 0 5px;font-size:13px;font-weight:700;color:var(--text);text-transform:none;letter-spacing:.01em}
.w04-ctx-skeleton h3 .w04-ctx-ico{display:inline-grid;place-items:center;color:#2dd4bf}
.w04-ctx-skeleton h3 .w04-ctx-ico .w04-icon{width:15px;height:15px}
.w04-ctx-skeleton .m0-semantic-list{gap:0}
.w04-ctx-skeleton .m0-semantic-list>div{grid-template-columns:minmax(96px,.44fr) minmax(0,1fr);gap:9px;padding:6px 0;border-block-end:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
.w04-ctx-skeleton .m0-semantic-list>div:last-child{border-block-end:0}
.w04-ctx-skeleton dt{font-size:11.5px;font-weight:600;color:var(--text3)}
.w04-ctx-skeleton dd{font-size:13px;color:var(--text3);opacity:.7}

/* ── responsive composition: wide / standard / narrow / compact ── */
@media (max-width:1320px){
  .w04-rows>div{grid-template-columns:minmax(126px,.38fr) minmax(0,1fr);gap:11px}
}
@media (max-width:1080px){
  .w04-rec-head{flex-wrap:wrap}
  .w04-rec-title{font-size:18px}
}
@media (max-width:920px){
  #foundationStage[data-m0-composition=evidence],#foundationStage[data-m0-composition=reviews],#foundationStage[data-m0-composition=mastery],#foundationStage[data-m0-composition=portfolio]{padding:12px}
  .w04-track-step{flex:1 1 calc(50% - 14px)}
  .w04-record-body{padding:0 12px}
  .w04-record-body>.w04-block[data-w04-block=intake]{margin-inline:-12px;padding:11px 12px}
  .w04-rows>div{grid-template-columns:1fr;gap:2px;padding:7px 0}
  .w04-rows>div>dt{font-size:11.5px;color:var(--text3)}
  .w04-rows>div>dd{font-size:13px}
  ${W04_SCOPE} #domainContext .m0-semantic-list>div{grid-template-columns:1fr;gap:2px}
  .w04-track{gap:5px}
  .w04-track-step{font-size:11px;padding:4px 8px}
}
@media (max-width:640px){
  .w04-rec-head{padding:11px 12px;gap:10px}
  .w04-track-step{flex:1 1 100%}
  .w04-rec-icon{width:32px;height:32px;border-radius:9px}
  .w04-rec-icon .w04-icon{width:18px;height:18px}
  .w04-rec-title{font-size:16.5px}
  .w04-card{flex-wrap:wrap}
  ${W04_SCOPE} #domainToolbar .btn{font-size:11.5px;padding:5px 10px}
}
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
  if (typeof document === 'undefined') return;
  let style = document.querySelector('#w04SurfacePresentationStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'w04SurfacePresentationStyle';
    style.textContent = W04_PRESENTATION_CSS;
    document.head.append(style);
  }
  // The shared m0 controller style is injected AFTER this one (first render follows install),
  // and several shared rules (`.m0-semantic-group h3`, `.m0-studio-head h1`) have EQUAL
  // specificity to the surface-local presentation rules. Keep the W04 style at the end of
  // <head> so surface-local presentation wins the tie instead of shared chrome.
  if (document.head.lastElementChild !== style) document.head.append(style);
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
  const body = document.createElement('div');
  body.className = 'w04-record w04-record-body';
  body.setAttribute('data-w04-record-body', surface);
  // Empty state and guidance live INSIDE the record panel, so the empty composition still
  // reads as one deliberate panel instead of loose boxes under a header.
  if (emptyState) body.append(emptyState);
  body.insertAdjacentHTML('beforeend', (spec.blocks || []).map(w04RenderBlock).join(''));
  if (guidance) body.append(guidance);
  workbench.append(body);
  const hasSelection = !!w04SelectedId();
  preserved.forEach(node => {
    workbench.append(node);
    if (node.tagName === 'DETAILS' && !hasSelection) node.open = true;
  });
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
  evidence: ['Source integrity (intake gates)', 'Lineage completeness', 'Duplicate search'],
  reviews: ['Review scope', 'Reviewer authority', 'Prior Review context'],
  mastery: ['Evaluation provenance', 'Re-evaluation request'],
  portfolio: ['Curation authority', 'Curation receipts']
});

/** Structural preview of each lens card (label vocabulary mirrors `createEvidenceContextProvider`
 *  / the surface's authored lenses). Values are shown as an em dash — a skeleton states the
 *  shape of the pane, never a record value. */
const W04_EMPTY_LENSES = Object.freeze({
  evidence: Object.freeze([
    Object.freeze({ icon: 'check', title: 'Source integrity', fields: ['Source bytes', 'Schema validity', 'Digest', 'Source verification', 'Intake validation', 'Admission authority'] }),
    Object.freeze({ icon: 'stack', title: 'Lineage completeness', fields: ['Current revision', 'Revisions retained', 'Previous revision', 'Immutable', 'Lifecycle'] }),
    Object.freeze({ icon: 'search', title: 'Duplicate search', fields: ['Duplicate Candidate scan', 'Method'] })
  ])
});

function w04EnhanceEmptyContext(surface) {
  const host = document.querySelector('#domainContext');
  if (!host || !surface || !W04_CONTEXT_ROLE[surface]) return;
  const key = `w04-context-empty:${surface}`;
  const existing = host.querySelector(':scope > [data-w04-context-empty]');
  if (existing && existing.getAttribute('data-w04-key') === key) return;
  const owner = w04Group?.[surface]?.domain?.owner || 'W04 domain';
  const skeletons = (W04_EMPTY_LENSES[surface] || []).map(lens =>
    `<section class="w04-ctx-skeleton"><h3><span class="w04-ctx-ico" aria-hidden="true">${w04Icon(lens.icon)}</span><span dir="auto">${esc(lens.title)}</span></h3>`
    + `<dl class="m0-semantic-list">${lens.fields.map(field =>
      `<div><dt>${esc(field)}</dt><dd aria-label="appears on selection">—</dd></div>`).join('')}</dl></section>`).join('');
  const block = document.createElement('section');
  block.className = 'm0-semantic-group w04-block w04-context-empty';
  block.setAttribute('data-w04-context-empty', '');
  block.setAttribute('data-w04-key', key);
  block.innerHTML = `<h3><span dir="auto">Context that appears on selection</span></h3>${w04RenderRows([
    { label: 'Region role', value: W04_CONTEXT_ROLE[surface], dir: 'auto' },
    { label: 'Domain owner', value: owner, dir: 'ltr', mono: true },
    { label: 'Selection', value: 'None — the context inspector is selection-scoped; no record context is inferred.', dir: 'auto', tone: 'muted' }
  ])}${skeletons}`;
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

/* ------------------------------------------------------------------ LEFT · intake queue
 * The shared collection matrix renders the rows; this block supplies the SURFACE-specific
 * composition around them: queue identity, live state chips derived from the domain (no
 * invented counts), per-row state tone, and a footer that states the session-local record
 * truth plus the settings entry point (reference: the surface's settings card).
 */
const W04_QUEUE = Object.freeze({
  evidence: Object.freeze({ title: 'Evidence intake queue', pane: 'Evidence intake', ctxPane: 'Evidence context', icon: 'evidence', note: n => `${n} record${n === 1 ? '' : 's'} held for this session · import creates Candidate Evidence only` }),
  reviews: Object.freeze({ title: 'Review queue', pane: 'Review queue', ctxPane: 'Review context', icon: 'reviews', note: n => `${n} Review${n === 1 ? '' : 's'} in this session · Decisions stay immutable` }),
  mastery: Object.freeze({ title: 'Mastery evaluations', pane: 'Mastery evaluations', ctxPane: 'Mastery context', icon: 'mastery', note: n => `${n} evaluation${n === 1 ? '' : 's'} in this session · completion never creates Mastery` }),
  portfolio: Object.freeze({ title: 'Portfolio references', pane: 'Portfolio references', ctxPane: 'Portfolio context', icon: 'portfolio', note: n => `${n} reference${n === 1 ? '' : 's'} in this session · references are never copied` })
});

/** Shared pane header label: the generic `${workbench} · Collection` template overflows the
 *  278 px structure pane and start-clips. Surface-owned inline presentation replaces it with a
 *  short, surface-specific label (write-once per render; never fights the shared owner). */
function w04SetPaneLabel(selector, label) {
  const node = document.querySelector(selector);
  if (node && label && node.textContent !== label) node.textContent = label;
}
const w04ToneFor = row => {
  const state = row.status === 'ADMITTED' ? 'ADMITTED' : String(row.candidateState || '');
  if (state === 'WITHDRAWN' || state === 'DECLINED') return 'danger';
  if (state === 'RETURNED_FOR_CONTEXT') return 'warning';
  if (state === 'ADMITTED') return 'success';
  if (state === 'SUBMITTED_FOR_INTAKE') return 'info';
  return 'neutral';
};
/** Queue segments are the LEFT pane's navigation sections (reference: the pane nav rows).
 *  Counts are derived from the live domain, and a segment doubles as a real filter over the
 *  shared collection matrix (setFilter on the surface collection core) — nothing decorative. */
const W04_QUEUE_SEGMENTS = Object.freeze([
  Object.freeze({ token: '', label: 'All records' }),
  Object.freeze({ token: 'SUBMITTED_FOR_INTAKE', label: 'Submitted' }),
  Object.freeze({ token: 'RETURNED_FOR_CONTEXT', label: 'Returned' }),
  Object.freeze({ token: 'PREPARED', label: 'Prepared' }),
  Object.freeze({ token: 'ADMITTED', label: 'Admitted' })
]);
let w04QueueFilter = '';
const w04StateFor = row => (row && row.status === 'ADMITTED') ? 'ADMITTED' : String(row?.candidateState || 'RECEIVED');

function w04EnhanceLeft(surface) {
  const host = document.querySelector('#domainLeftRegion');
  const spec = W04_QUEUE[surface];
  if (!host || !spec || !w04Group?.[surface]) return;
  const domain = w04Group[surface].domain;
  const records = domain.records || [];
  // per-row state tone — guarded so repeated runs do not re-write attributes (observer loop)
  host.querySelectorAll('[data-r6-row]').forEach(node => {
    const id = node.getAttribute('data-r6-row');
    let row = null;
    try { row = records.some(item => item.id === id) ? domain.inspect(id) : null; } catch { row = null; }
    if (!row) return;
    const tone = w04ToneFor(row);
    if (node.dataset.w04Tone !== tone) node.dataset.w04Tone = tone;
    const title = `${row.title || row.id} · ${row.status === 'ADMITTED' ? 'ADMITTED' : (row.candidateState || '')}`;
    if (node.getAttribute('title') !== title) node.setAttribute('title', title);
  });
  const counts = Object.create(null);
  counts[''] = records.length;
  W04_QUEUE_SEGMENTS.forEach(seg => { if (seg.token) counts[seg.token] = records.filter(row => w04StateFor(row) === seg.token).length; });
  const key = `${surface}:${records.length}:${JSON.stringify(counts)}:${w04QueueFilter}`;
  let head = host.querySelector(':scope > [data-w04-queue-head]');
  if (!head || head.getAttribute('data-w04-key') !== key) {
    const html = `<div class="w04-segments" role="group" aria-label="${esc(spec.title)} sections">${W04_QUEUE_SEGMENTS.map(seg =>
      `<button type="button" class="w04-segment" data-w04-segment="${esc(seg.token)}" aria-pressed="${w04QueueFilter === seg.token}"><span dir="auto">${esc(seg.label)}</span><bdi class="w04-seg-count">${counts[seg.token] ?? 0}</bdi></button>`).join('')}</div>`;
    if (head) { head.setAttribute('data-w04-key', key); head.innerHTML = html; }
    else {
      head = document.createElement('div');
      head.className = 'w04-queue-head';
      head.setAttribute('data-w04-queue-head', '');
      head.setAttribute('data-w04-key', key);
      head.innerHTML = html;
      host.prepend(head);
    }
    head.querySelectorAll('[data-w04-segment]').forEach(btn => btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-w04-segment') || '';
      if (token === w04QueueFilter) return;
      w04QueueFilter = token;
      try { w04Group[surface].collectionCore.setFilter(token); } catch { return; }
      try { w04Foundation()?.m0Composition?.mounted?.render?.(); } catch { /* presentation refresh only */ }
    }));
  }
  w04SetPaneLabel('#leftPane .phead h2', spec.pane);
  let foot = host.querySelector(':scope > [data-w04-queue-foot]');
  if (!foot || foot.getAttribute('data-w04-key') !== key) {
    const html = `<p class="w04-queue-note" dir="auto">${esc(spec.note(records.length))}</p><button type="button" class="w04-settings-btn" data-w04-settings>${w04Icon('settings')}<span>Settings · language &amp; direction</span></button>`;
    if (foot) { foot.setAttribute('data-w04-key', key); foot.innerHTML = html; }
    else {
      foot = document.createElement('div');
      foot.className = 'w04-queue-foot';
      foot.setAttribute('data-w04-queue-foot', '');
      foot.setAttribute('data-w04-key', key);
      foot.innerHTML = html;
      host.append(foot);
    }
    foot.querySelector('[data-w04-settings]')?.addEventListener('click', event => {
      event.preventDefault();
      try { w04Foundation()?.registry?.execute?.('foundation.settings', { invoker: event.currentTarget, route: `r6-${surface}` }); }
      catch { /* settings centre unavailable — button stays inert rather than faking a result */ }
    });
  }
}

/* ------------------------------------------------------------------ RIGHT · check cards
 * The shared ContextInspectorHost renders the authored lens descriptor; this block adds the
 * SURFACE presentation the reference shows: a lens icon, a computed HOLDS/BLOCKED/PENDING
 * status chip (derived only from the gate vocabulary the descriptor actually emitted), gate
 * chips inside rows, and the truth notice promoted to the bottom of the pane.
 */
const W04_LENS_ICON = label => {
  const text = String(label || '').toLowerCase();
  if (text.includes('integrity') || text.includes('gate')) return 'check';
  if (text.includes('duplicate') || text.includes('scan')) return 'search';
  if (text.includes('lineage') || text.includes('revision') || text.includes('provenance') || text.includes('evaluation')) return 'stack';
  if (text.includes('criterion') || text.includes('scope')) return 'criterion';
  if (text.includes('authority')) return 'decision';
  if (text.includes('reviewer') || text.includes('prior')) return 'reviews';
  if (text.includes('curation')) return 'portfolio';
  if (text.includes('receipt') || text.includes('re-evaluation')) return 'note';
  return 'info';
};

function w04EnhanceContext(surface) {
  const host = document.querySelector('#domainContext');
  if (!host || !surface || !w04Group?.[surface]) return;
  w04SetPaneLabel('#rightPane .phead h2', W04_QUEUE[surface]?.ctxPane || null);
  const panel = host.querySelector(':scope > .m0-context-panel');
  if (!panel) return;
  panel.querySelectorAll('section.m0-semantic-group').forEach(group => {
    const h3 = group.querySelector(':scope > h3');
    if (h3 && !h3.querySelector('.w04-ctx-ico')) {
      h3.insertAdjacentHTML('afterbegin', `<span class="w04-ctx-ico" aria-hidden="true">${w04Icon(W04_LENS_ICON(h3.textContent))}</span>`);
    }
    let pass = 0, hold = 0, open = 0;
    group.querySelectorAll('dl.m0-semantic-list dd').forEach(dd => {
      if (dd.dataset.w04Gate) return;
      const text = dd.textContent || '';
      const match = /^(PASS|HOLD|OPEN|INFO) · /.exec(text);
      if (!match) return;
      const gate = match[1].toLowerCase();
      dd.textContent = '';
      const mark = document.createElement('span');
      mark.className = 'w04-gate-mark';
      mark.dataset.w04Gate = gate;
      mark.textContent = match[1];
      const rest = document.createElement('bdi');
      rest.className = 'w04-gate-rest';
      rest.textContent = text.slice(match[0].length);
      dd.append(mark, rest);
      dd.dataset.w04Gate = gate;
      if (gate === 'pass') pass++; else if (gate === 'hold') hold++; else if (gate === 'open') open++;
    });
    if (h3 && (pass || hold || open) && !h3.querySelector('.w04-ctx-status')) {
      const status = hold ? 'hold' : open ? 'open' : 'pass';
      const label = status === 'pass' ? 'HOLDS' : status === 'hold' ? 'BLOCKED' : 'PENDING';
      const icon = status === 'pass' ? 'check' : status === 'hold' ? 'warn' : 'info';
      h3.insertAdjacentHTML('beforeend', `<span class="w04-ctx-status" data-w04-status="${status}">${w04Icon(icon)}<span>${label}</span></span>`);
    }
  });
  const summary = panel.querySelector(':scope > .m0-context-summary');
  if (summary && summary.dataset.w04Notice !== '1') {
    summary.classList.add('w04-ctx-notice');
    summary.insertAdjacentHTML('afterbegin', `<span class="w04-notice-ico" aria-hidden="true">${w04Icon('info')}</span>`);
    panel.append(summary);
    summary.dataset.w04Notice = '1';
  }
}

/* ------------------------------------------------------------------ BIDI hygiene
 * English state tokens inside an RTL pane resolve their trailing punctuation against the
 * wrong direction (a known CEP D5-class defect). Resolve each token from its own first
 * strong character, once per node.
 */
function w04FixStateTokens() {
  document.querySelectorAll('.state-token, #foundationStage .m0-domain-nav > p').forEach(node => {
    if (node.getAttribute('dir')) return;
    node.setAttribute('dir', 'auto');
  });
}

function w04Run() {
  if (typeof document === 'undefined') return;
  try {
    w04EnsureStyle();
    const surface = w04EnhanceCenter();
    w04EnhanceToolbar(surface);
    if (surface && w04Group?.[surface]) {
      w04EnhanceLeft(surface);
      w04EnhanceContext(surface);
      if (!w04SelectedId()) w04EnhanceEmptyContext(surface);
      w04FixStateTokens();
    }
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
