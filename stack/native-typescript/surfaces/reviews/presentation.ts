/**
 * W04 Reviews — surface-specific CENTER record composition (defects D9 / D10 / R1-adjacent).
 *
 * Reference: `02_REVIEWS/Cybersecurity Evidence Review Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `f1b915d5`). It shows, in order: document title + purple
 * `Review Workflow: IN_REVIEW` pill · a colour-coded metadata grid · `Evidence Claim` ·
 * side-by-side `Criterion References` + `Criterion Findings` table · `Reviewer Rationale` ·
 * `Decision Preparation` with a dashed "not yet issued" box · and a RIGHT column of context cards.
 *
 * This module declares that composition as DATA read from the live `W04ReviewDomain`.
 * `surfaces/composition/w04-rescue.ts` owns the HTML projection. Nothing is invented: finding
 * outcomes come from `REVIEW_FINDING_OUTCOMES`, decision outcomes from `REVIEW_DECISION_OUTCOMES`,
 * and every absent value renders an informative EMPTY token (governance §6/§7, default-EMPTY law).
 */

const show = (value, fallback = 'EMPTY') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

export const REVIEW_WORKFLOW_TRACK = Object.freeze([
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'ASSIGNED', label: 'Assigned' },
  { id: 'IN_REVIEW', label: 'In review' },
  { id: 'READY_FOR_DECISION', label: 'Ready for decision' },
  { id: 'CLOSED', label: 'Closed' }
]);
const TRACK_POSITION = Object.freeze({
  REQUESTED: 0, ASSIGNED: 1, IN_REVIEW: 2, READY_FOR_DECISION: 3, CLOSED: 4, CANCELLED: -1
});

const FINDING_TONE = Object.freeze({
  SATISFIED: 'success', PARTIALLY_SATISFIED: 'warning',
  NOT_SATISFIED: 'danger', NOT_ASSESSABLE: 'muted'
});
const DECISION_TONE = Object.freeze({
  ACCEPT: 'success', ACCEPT_WITH_LIMITATIONS: 'warning',
  MORE_EVIDENCE_REQUIRED: 'warning', REJECT: 'danger'
});
const STATE_TONE = Object.freeze({
  REQUESTED: 'neutral', ASSIGNED: 'info', IN_REVIEW: 'info',
  READY_FOR_DECISION: 'warning', CLOSED: 'success', CANCELLED: 'danger'
});

/** Next-step text mirrors the domain's own transition rules, so the affordance cannot lie. */
function nextActions(row) {
  const hasAuthority = row.reviewer?.authorityAvailable === true;
  const actions = [];
  if (row.state === 'REQUESTED') {
    actions.push({ text: hasAuthority ? 'Assign the formal Review (reviews.assign) to move it to ASSIGNED.' : 'Reviewer authority is unavailable — assignment and every mutation stay refused.', tone: hasAuthority ? 'info' : 'danger' });
  } else if (row.state === 'ASSIGNED') {
    actions.push({ text: 'Start the formal Review (reviews.start) to move it to IN_REVIEW.', tone: 'info' });
  } else if (row.state === 'IN_REVIEW') {
    actions.push(row.findings.length
      ? { text: `Recorded findings: ${row.findings.length}. Mark the Review ready for Decision (reviews.ready) when the review work is complete.`, tone: 'info' }
      : { text: 'No finding is recorded yet — reviews.ready is refused with REVIEW_FINDINGS_REQUIRED.', tone: 'warning' });
    actions.push({ text: 'Add a scoped finding (reviews.finding) against a pinned criterion; a Finding is never a Decision.', tone: 'neutral' });
  } else if (row.state === 'READY_FOR_DECISION') {
    actions.push({ text: 'Issue the superseding Decision (reviews.supersede) with an explicit Decision ID, allowed outcome and basis.', tone: 'success' });
  } else if (row.state === 'CLOSED') {
    actions.push({ text: row.effectiveDecisionId
      ? `Closed on Decision ${row.effectiveDecisionId}; a re-review (reviews.rereview) opens a new Review without erasing it.`
      : 'Closed without an effective Decision.', tone: row.effectiveDecisionId ? 'success' : 'warning' });
  } else if (row.state === 'CANCELLED') {
    actions.push({ text: 'Review was cancelled — findings and Decisions from other Reviews remain untouched.', tone: 'danger' });
  }
  actions.push({ text: 'The Review family never approves its own authority: ReviewAuthorityRegistry gates every mutation.', tone: 'neutral' });
  return actions;
}

function decisionPreparation(row) {
  if (row.decision) {
    return {
      tone: 'success',
      title: `Decision issued · ${row.decision.outcome}`,
      body: `${row.decision.decisionId}${row.decision.issuedAt ? ` · issued ${row.decision.issuedAt}` : ''}${row.decision.supersedesDecisionRef ? ` · supersedes ${row.decision.supersedesDecisionRef}` : ''}. ${show(row.decision.correctionReason, 'No correction reason recorded')}`,
      dashed: false
    };
  }
  const texts = {
    REQUESTED: { title: 'Decision not yet issued', body: 'The Review is REQUESTED. Assign it, start it and record findings before Decision preparation opens.' },
    ASSIGNED: { title: 'Decision not yet issued', body: 'The Review is ASSIGNED. Start the review work; a Decision requires READY_FOR_DECISION with findings.' },
    IN_REVIEW: {
      title: 'Decision not yet issued',
      body: row.findings.length
        ? `${row.findings.length} finding(s) recorded. Mark the Review ready for Decision (reviews.ready) to open Decision issuance.`
        : 'No finding is recorded. A Decision requires at least one scoped finding and an authorized reviewer.'
    },
    READY_FOR_DECISION: { title: 'Decision not yet issued', body: 'Ready for decision after remaining review work. Issue the Decision (reviews.supersede) with an explicit basis.' },
    CLOSED: { title: 'Decision not issued', body: 'The Review closed without an effective Decision.' },
    CANCELLED: { title: 'Decision not issued', body: 'The Review was cancelled before a Decision was issued.' }
  };
  const copy = texts[row.state] || { title: 'Decision not yet issued', body: 'No Decision is recorded for this Review.' };
  return { tone: 'warning', title: copy.title, body: copy.body, dashed: true };
}

function rationale(row) {
  const recorded = row.findings.map(f => f.text).filter(Boolean);
  if (row.decision?.correctionReason) {
    return `Decision basis: ${row.decision.correctionReason}`;
  }
  if (recorded.length) {
    return recorded.join(' ');
  }
  return null;
}

export function describeReviewsEmpty() {
  return {
    key: 'reviews:EMPTY',
    empty: true,
    header: {
      icon: 'reviews',
      title: 'Formal Review workbench',
      titleDir: 'auto',
      pills: [{ label: 'Review workflow', value: 'NONE BOUND', tone: 'neutral' }]
    },
    blocks: [
      {
        kind: 'track',
        id: 'workflow',
        title: 'Formal Review workflow',
        steps: REVIEW_WORKFLOW_TRACK.map(step => ({ label: step.label, state: 'future' })),
        next: [
          { text: 'No formal Evidence Review is bound, so the Review has no workflow position.', tone: 'neutral' },
          { text: 'A Review can only be requested against admitted immutable Evidence with pinned criteria and an authorized reviewer (reviews.request).', tone: 'info' }
        ]
      }
    ]
  };
}

export function describeReviewsRecord(domain, selectedId, { claimResolver = null } = {}) {
  const row = domain.inspect(selectedId);
  const position = TRACK_POSITION[row.state] ?? 0;
  const decision = row.decision || null;
  const claim = typeof claimResolver === 'function' ? claimResolver(row) : null;
  const criterionRefs = [...row.criteriaRefs];
  const findingTone = state => FINDING_TONE[state] || 'muted';

  const criteriaCards = criterionRefs.map((ref, index) => ({
    title: `C${index + 1}`,
    subtitle: ref,
    lines: [
      row.findings.filter(f => f.criterionRef === ref).length
        ? `${row.findings.filter(f => f.criterionRef === ref).length} recorded finding(s)`
        : 'No finding recorded against this criterion'
    ],
    tone: row.findings.some(f => f.criterionRef === ref) ? 'info' : 'muted'
  }));

  const findingRows = criterionRefs.length
    ? criterionRefs.map((ref, index) => {
      const matched = row.findings.filter(f => f.criterionRef === ref);
      if (!matched.length) {
        return {
          cells: [
            { text: `C${index + 1}`, sub: ref, dir: 'ltr', mono: true },
            { text: 'NO FINDING RECORDED', dir: 'ltr', tone: 'muted' },
            { text: row.evidenceRefs.join(', ') || 'EMPTY', dir: 'ltr', sub: 'pinned Review evidence basis', tone: 'muted' }
          ]
        };
      }
      return matched.map(f => ({
        cells: [
          { text: `C${index + 1}`, sub: ref, dir: 'ltr', mono: true },
          { text: f.state, dir: 'ltr', tone: findingTone(f.state), sub: f.scopeDisposition === 'OUT_OF_SCOPE' ? `OUT OF SCOPE · ${f.outOfScopeReason || 'no reason recorded'}` : f.id },
          { text: row.evidenceRefs.join(', ') || 'EMPTY', dir: 'ltr', sub: `recorded at ${f.reviewRevisionRef || row.revisionId}`, tone: 'muted' }
        ]
      }));
    }).flat()
    : [{ cells: [{ text: 'EMPTY', dir: 'ltr', tone: 'muted' }, { text: 'No criterion is pinned to this Review', dir: 'auto', tone: 'muted' }, { text: row.evidenceRefs.join(', ') || 'EMPTY', dir: 'ltr', tone: 'muted' }] }];

  const rationaleText = rationale(row);
  const prep = decisionPreparation(row);

  const pills = [
    { label: 'Review workflow', value: show(row.state), tone: STATE_TONE[row.state] || 'neutral', badge: null },
    {
      label: 'Effective Review Decision',
      value: show(decision?.outcome || 'NONE'),
      tone: decision ? DECISION_TONE[decision.outcome] || 'info' : 'warning'
    }
  ];
  if (row.rereview === 'OPEN') pills.push({ label: 'Re-review', value: 'OPEN', tone: 'warning' });
  if (row.reviewer?.authorityAvailable !== true) pills.push({ label: 'Reviewer authority', value: 'UNAVAILABLE', tone: 'danger' });

  const blocks = [
    {
      kind: 'track',
      id: 'workflow',
      title: 'Formal Review workflow',
      steps: REVIEW_WORKFLOW_TRACK.map((step, index) => ({
        label: step.label,
        state: position < 0 ? 'blocked' : index < position ? 'done' : index === position ? 'current' : 'future'
      })),
      next: nextActions(row)
    },
    {
      kind: 'grid',
      id: 'metadata',
      title: 'Review facts',
      cells: [
        { label: 'Evidence Lifecycle', value: show(row.lifecycleSnapshot || row.evidenceLifecycle || 'UNRESOLVED_IN_THIS_WORKSPACE'), dir: 'ltr', tone: 'muted' },
        { label: 'Evidence Under Review', value: row.evidenceRefs.join(', ') || 'EMPTY', dir: 'ltr', tone: 'link' },
        { label: 'Effective Review Decision', value: show(decision?.outcome || 'NONE'), dir: 'ltr', tone: decision ? DECISION_TONE[decision.outcome] || 'info' : 'warning' },
        { label: 'Evidence Review Status', value: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'info' },
        { label: 'Subject', value: show(claim?.subject, 'EMPTY — the pinned Evidence revision is not resolvable here'), dir: 'auto' },
        { label: 'Re-review', value: show(row.rereview, 'NONE'), dir: 'ltr', tone: row.rereview === 'OPEN' ? 'warning' : 'muted' }
      ]
    },
    {
      kind: 'rows',
      id: 'claim',
      icon: 'claim',
      title: 'Evidence Claim',
      rows: claim
        ? [{ label: 'Claim', value: show(claim.claim), dir: 'auto', wide: true },
        { label: 'Claim subject', value: show(claim.subject), dir: 'auto' },
        { label: 'Criterion scope', value: show(claim.criterionRefs, 'None pinned'), dir: 'ltr', tone: 'link' }]
        : [{ label: 'Claim', value: 'The pinned Evidence revision is not resolvable in this workspace, so no claim text is projected.', dir: 'auto', wide: true, tone: 'muted' }]
    },
    {
      kind: 'split',
      id: 'criteria',
      left: {
        kind: 'cards', title: 'Criterion References', icon: 'criterion',
        emptyMessage: 'No criterion is pinned to this Review.',
        cards: criteriaCards
      },
      right: {
        kind: 'table', title: 'Criterion Findings', icon: 'finding',
        columns: ['المعيار / Criterion', 'Finding', 'Supporting Evidence'],
        rows: findingRows
      }
    },
    {
      kind: 'prose',
      id: 'rationale',
      icon: 'rationale',
      title: 'Reviewer Rationale',
      text: rationaleText,
      emptyMessage: 'No reviewer rationale exists yet. Findings and Decision reasoning are reviewer-authored content and are never generated by presentation.'
    },
    {
      kind: 'prose',
      id: 'decision-preparation',
      icon: 'decision',
      title: 'Decision Preparation',
      text: prep.body,
      boxTitle: prep.title,
      tone: prep.tone,
      dashed: prep.dashed
    },
  ];

  return {
    key: `reviews:${row.id}:${row.revisionId}:${row.state}:${row.findings.length}:${row.effectiveDecisionId || 'none'}:${row.rereview}`,
    empty: false,
    header: {
      icon: 'reviews',
      title: `Evidence Review ${row.id}`,
      titleDir: 'ltr',
      sub: `${row.revisionId}${row.purpose ? ` · ${row.purpose}` : ''}`,
      pills
    },
    blocks
  };
}

export default describeReviewsRecord;
