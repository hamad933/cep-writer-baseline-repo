/**
 * W04 Reviews — surface-specific CENTER record composition.
 *
 * Reference: `02_REVIEWS/Cybersecurity Evidence Review Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `f1b915d5`, 1505×1045). Read as CONSTRUCTION AUTHORITY. The
 * reference's vertical order, and this module's block order (identical by design):
 *
 *   identity header + `Review Workflow` pill → metadata grid → Evidence Claim →
 *   Criterion References | Criterion Findings (side by side) → Reviewer Rationale →
 *   Decision Preparation (dashed "not yet issued" box) → workflow position + next steps.
 *
 * The workflow rail closes the record instead of opening it: the reference puts workflow
 * position in the header pill, and the adjudication itself (findings → rationale → decision)
 * is the work this workspace exists to do. It must own the fold, not a status stepper.
 *
 * This module declares the composition as DATA read from the live `W04ReviewDomain`.
 * `surfaces/composition/w04-rescue.ts` owns the shared HTML projection (one renderer, four W04
 * surfaces). Nothing is invented: finding outcomes come from `REVIEW_FINDING_OUTCOMES`,
 * decision outcomes from `REVIEW_DECISION_OUTCOMES`, and every absent value renders an
 * informative EMPTY token (governance §6/§7). Chrome labels are bilingual (./i18n.ts); record
 * content — claim, finding text, rationale — is authored data and is never translated.
 */
import {activeLocale, pickText, fill} from './i18n.js';

const show = (value, fallback = 'EMPTY') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

/** `id@revision` → `id / revision`: a real break opportunity, so a pinned reference never
 *  splits mid-token inside the metadata grid. */
const evidenceBasis = refs => (refs && refs.length ? refs.map(ref => String(ref).replace('@', ' / ')).join(', ') : '');

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
const STEP_KEY = Object.freeze({
  REQUESTED: 'stepRequested', ASSIGNED: 'stepAssigned', IN_REVIEW: 'stepInReview',
  READY_FOR_DECISION: 'stepReady', CLOSED: 'stepClosed'
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

/** Next-step text mirrors the domain's own transition rules, so the affordance cannot lie.
 *  Exactly two lines are projected: the primary reachable step and the authority law — the
 *  rest of the guidance lives in the RIGHT lens "Decision issuance" gate (ONE LOCATION). */
function nextActions(row, t) {
  const hasAuthority = row.reviewer?.authorityAvailable === true;
  let primary;
  if (row.state === 'REQUESTED') {
    primary = hasAuthority
      ? { text: t.nextRequested, tone: 'info' }
      : { text: t.nextRequestedBlocked, tone: 'danger' };
  } else if (row.state === 'ASSIGNED') {
    primary = { text: t.nextAssigned, tone: 'info' };
  } else if (row.state === 'IN_REVIEW') {
    primary = row.findings.length
      ? { text: fill(t.nextFindings, { n: row.findings.length }), tone: 'info' }
      : { text: t.nextNoFindings, tone: 'warning' };
  } else if (row.state === 'READY_FOR_DECISION') {
    primary = { text: t.nextReady, tone: 'success' };
  } else if (row.state === 'CLOSED') {
    primary = row.effectiveDecisionId
      ? { text: fill(t.nextClosed, { id: row.effectiveDecisionId }), tone: 'success' }
      : { text: t.nextClosedNoDecision, tone: 'warning' };
  } else {
    primary = { text: t.nextCancelled, tone: 'danger' };
  }
  return [primary, { text: t.nextAuthority, tone: 'neutral' }];
}

function decisionPreparation(row, t) {
  if (row.decision) {
    return {
      tone: 'success',
      title: fill(t.decisionIssued, { outcome: row.decision.outcome }),
      body: `${row.decision.decisionId}${row.decision.issuedAt ? ` · ${row.decision.issuedAt}` : ''}${row.decision.supersedesDecisionRef ? ` · ${row.decision.supersedesDecisionRef}` : ''}. ${show(row.decision.correctionReason, t.decisionNoReason)}`,
      dashed: false
    };
  }
  const texts = {
    REQUESTED: t.prepRequested,
    ASSIGNED: t.prepAssigned,
    IN_REVIEW: row.findings.length ? fill(t.prepInReviewWithFindings, { n: row.findings.length }) : t.prepInReviewNoFindings,
    READY_FOR_DECISION: t.prepReady,
    CLOSED: t.prepClosed,
    CANCELLED: t.prepCancelled
  };
  return { tone: 'warning', title: t.decisionNotIssued, body: texts[row.state] || t.prepDefault, dashed: true };
}

/** Reviewer-authored content: projected verbatim in whichever language it was written. */
function rationale(row) {
  const recorded = row.findings.map(f => f.text).filter(Boolean);
  if (row.decision?.correctionReason) return `Decision basis: ${row.decision.correctionReason}`;
  if (recorded.length) return recorded.join(' ');
  return null;
}

export function describeReviewsEmpty() {
  const t = pickText(activeLocale());
  return {
    key: `reviews:EMPTY:${activeLocale()}`,
    empty: true,
    header: {
      icon: 'reviews',
      title: t.emptyTitle,
      titleDir: 'auto',
      pills: [{ label: t.emptyPill, value: t.emptyPillValue.toUpperCase(), tone: 'neutral' }]
    },
    blocks: [
      {
        kind: 'track',
        id: 'workflow',
        title: t.trackTitle,
        steps: REVIEW_WORKFLOW_TRACK.map(step => ({ label: t[STEP_KEY[step.id]] || step.label, state: 'future' })),
        next: [
          { text: t.emptyNext1, tone: 'neutral' },
          { text: t.emptyNext2, tone: 'info' }
        ]
      }
    ]
  };
}

export function describeReviewsRecord(domain, selectedId, { claimResolver = null } = {}) {
  const locale = activeLocale();
  const t = pickText(locale);
  const row = domain.inspect(selectedId);
  const position = TRACK_POSITION[row.state] ?? 0;
  const decision = row.decision || null;
  const claim = typeof claimResolver === 'function' ? claimResolver(row) : null;
  const criterionRefs = [...row.criteriaRefs];
  const findingTone = state => FINDING_TONE[state] || 'muted';

  /* ── Criterion References (left) ───────────────────────────────────────────────────────
   * `C1 · <ref>` with the recorded-finding count as the second line. The criterion chip is a
   * surface-local inline presentation (see presentation-surface.ts), not a second data source. */
  const criteriaCards = criterionRefs.map((ref, index) => {
    const recorded = row.findings.filter(f => f.criterionRef === ref).length;
    return {
      title: `C${index + 1}`,
      subtitle: ref,
      lines: [recorded ? fill(t.criterionFound, { n: recorded }) : t.criterionNone],
      tone: recorded ? 'info' : 'muted'
    };
  });

  /* ── Criterion Findings (right) ────────────────────────────────────────────────────────
   * One row per pinned criterion per recorded finding — an unassessed criterion is a visible
   * row, never a silent gap. The reference table has exactly three columns (test-pinned). */
  const findingRows = criterionRefs.length
    ? criterionRefs.map((ref, index) => {
      const matched = row.findings.filter(f => f.criterionRef === ref);
      if (!matched.length) {
        return {
          cells: [
            { text: `C${index + 1}`, sub: ref, dir: 'ltr', mono: true },
            { text: t.noFindingRecorded, dir: 'auto', tone: 'muted' },
            { text: evidenceBasis(row.evidenceRefs) || 'EMPTY', dir: 'ltr', sub: t.pinnedBasis, tone: 'muted' }
          ]
        };
      }
      return matched.map(f => ({
        cells: [
          { text: `C${index + 1}`, sub: ref, dir: 'ltr', mono: true },
          {
            text: f.state, dir: 'ltr', tone: findingTone(f.state),
            sub: f.scopeDisposition === 'OUT_OF_SCOPE'
              ? `${t.outOfScope} · ${f.outOfScopeReason || t.noReason}`
              : f.id
          },
          { text: evidenceBasis(row.evidenceRefs) || 'EMPTY', dir: 'ltr', sub: fill(t.recordedAt, { rev: f.reviewRevisionRef || row.revisionId }), tone: 'muted' }
        ]
      }));
    }).flat()
    : [{
      cells: [
        { text: 'EMPTY', dir: 'ltr', tone: 'muted' },
        { text: t.noCriterionPinned, dir: 'auto', tone: 'muted' },
        { text: evidenceBasis(row.evidenceRefs) || 'EMPTY', dir: 'ltr', tone: 'muted' }
      ]
    }];

  const rationaleText = rationale(row);
  const prep = decisionPreparation(row, t);

  const pills = [
    { label: t.pillWorkflow, value: show(row.state), tone: STATE_TONE[row.state] || 'neutral', badge: null },
    {
      label: t.pillDecision,
      value: show(decision?.outcome || 'NONE'),
      tone: decision ? DECISION_TONE[decision.outcome] || 'info' : 'warning'
    }
  ];
  if (row.rereview === 'OPEN') pills.push({ label: t.pillRereview, value: 'OPEN', tone: 'warning' });
  if (row.reviewer?.authorityAvailable !== true) pills.push({ label: t.pillAuthority, value: 'UNAVAILABLE', tone: 'danger' });

  const blocks = [
    /* 1 · metadata grid — the reference's colour-coded fact block (single hairline grid) */
    {
      kind: 'grid',
      id: 'metadata',
      title: t.factsTitle,
      cells: [
        { label: t.factLifecycle, value: show(row.lifecycleSnapshot || row.evidenceLifecycle, t.lifecycleFallback), dir: 'auto', tone: 'muted' },
        { label: t.factEvidence, value: evidenceBasis(row.evidenceRefs) || 'EMPTY', dir: 'ltr', tone: 'link' },
        { label: t.factDecision, value: show(decision?.outcome || 'NONE'), dir: 'ltr', tone: decision ? DECISION_TONE[decision.outcome] || 'info' : 'warning' },
        { label: t.factStatus, value: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'info' },
        { label: t.factSubject, value: show(claim?.subject, t.claimUnresolved), dir: 'auto' },
        { label: t.factRereview, value: show(row.rereview, 'NONE'), dir: 'ltr', tone: row.rereview === 'OPEN' ? 'warning' : 'muted' }
      ]
    },
    /* 2 · the claim, one sentence — subject and criterion scope already have their own home */
    {
      kind: 'prose',
      id: 'claim',
      icon: 'claim',
      title: t.claimTitle,
      text: claim ? show(claim.claim) : null,
      emptyMessage: t.claimUnresolved
    },
    /* 3 · the adjudication itself — criterion references beside recorded findings */
    {
      kind: 'split',
      id: 'criteria',
      left: {
        kind: 'cards', title: t.criteriaTitle, icon: 'criterion',
        emptyMessage: t.noCriterionPinned,
        cards: criteriaCards
      },
      right: {
        kind: 'table', title: t.findingsTitle, icon: 'finding',
        columns: [t.colCriterion, t.colFinding, t.colEvidence],
        rows: findingRows,
        emptyMessage: t.noFindingRecorded
      }
    },
    /* 4 · reviewer-authored reasoning, verbatim */
    {
      kind: 'prose',
      id: 'rationale',
      icon: 'rationale',
      title: t.rationaleTitle,
      text: rationaleText,
      emptyMessage: t.rationaleEmpty
    },
    /* 5 · the ruling — issued, or a dashed "not yet issued" box exactly as the reference */
    {
      kind: 'prose',
      id: 'decision-preparation',
      icon: 'decision',
      title: t.decisionTitle,
      text: prep.body,
      boxTitle: prep.title,
      tone: prep.tone,
      dashed: prep.dashed
    },
    /* 6 · workflow position + the two-line affordance rail closing the record */
    {
      kind: 'track',
      id: 'workflow',
      title: t.trackTitle,
      steps: REVIEW_WORKFLOW_TRACK.map((step, index) => ({
        label: t[STEP_KEY[step.id]] || step.label,
        state: position < 0 ? 'blocked' : index < position ? 'done' : index === position ? 'current' : 'future'
      })),
      next: nextActions(row, t)
    }
  ];

  return {
    key: `reviews:${row.id}:${row.revisionId}:${row.state}:${row.findings.length}:${row.effectiveDecisionId || 'none'}:${row.rereview}:${locale}`,
    empty: false,
    header: {
      icon: 'reviews',
      title: `${t.reviewTitle} ${row.id}`,
      titleDir: 'auto',
      sub: `${row.revisionId}${row.purpose ? ` · ${row.purpose}` : ''}`,
      pills
    },
    blocks
  };
}

export default describeReviewsRecord;
