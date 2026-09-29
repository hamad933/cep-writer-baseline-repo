/**
 * W04 Evidence — surface-specific CENTER record composition (defects D9 / D10 / D12).
 *
 * The shared `semanticProjection` primitive owns generic object→rows rendering; this module
 * declares the *reference-shaped* composition that the Evidence reference
 * (`01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png`, CURRENT_FINAL_REFERENCE
 * `789deee0`) actually shows: status pill · labelled claim/subject/purpose rows ·
 * `Source Handoff` section · `Selected Supporting References` cards — plus the lifecycle
 * affordance D9 requires (where you are, what can happen next).
 *
 * The descriptor is DATA ONLY. `surfaces/composition/w04-rescue.ts` owns the HTML projection so
 * the four W04 surfaces share one renderer and one visual grammar. Every value below is read
 * from the live `W04EvidenceDomain` record — nothing is invented, and a missing value renders an
 * informative EMPTY token rather than a fabricated fact (governance §6 / §7).
 */

const EMPTY_VALUE = 'EMPTY';

const show = (value, fallback = EMPTY_VALUE) => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const shortDigest = digest => {
  const text = String(digest || '');
  if (!text) return EMPTY_VALUE;
  return text.length > 26 ? `${text.slice(0, 22)}…${text.slice(-4)}` : text;
};

/** Candidate lifecycle → position in the governed intake track. */
const CANDIDATE_TRACK = Object.freeze([
  { id: 'RECEIVED', label: 'Handoff received' },
  { id: 'PREPARED', label: 'Candidate prepared' },
  { id: 'SUBMITTED_FOR_INTAKE', label: 'Submitted for intake' },
  { id: 'ADMITTED', label: 'Admitted as immutable Evidence' }
]);
const TRACK_POSITION = Object.freeze({
  RECEIVED: 0, DRAFT: 0, PREPARED: 1, SUBMITTED_FOR_INTAKE: 2, ADMITTED: 3,
  RETURNED_FOR_CONTEXT: 1, DECLINED: 2, WITHDRAWN: 3
});

function gate(value, okLabel, failLabel) {
  return value === true ? okLabel : value === false ? failLabel : EMPTY_VALUE;
}

/**
 * "What can happen next" is derived from the same predicates the semantic commands use, so the
 * affordance can never promise an action the domain will refuse.
 */
function nextActions(row) {
  const actions = [];
  const state = row.candidateState;
  if (row.status === 'ADMITTED') {
    actions.push({ text: 'Inspect the exact immutable revision (evidence.inspect) — always available.', tone: 'info' });
    actions.push({
      text: row.lineage?.lifecycle === 'WITHDRAWN'
        ? 'This revision is WITHDRAWN; no amendment or re-admission applies.'
        : 'Amend against the exact current revision (evidence.amend) when the source changes.',
      tone: row.lineage?.lifecycle === 'WITHDRAWN' ? 'warning' : 'info'
    });
  } else if (state === 'SUBMITTED_FOR_INTAKE') {
    if (row.verification?.status !== 'VERIFIED') {
      actions.push({ text: 'Source verification is outstanding — admission is refused with SOURCE_VERIFICATION_REQUIRED.', tone: 'danger' });
    } else if (row.intakeValidation?.status !== 'VALIDATED') {
      actions.push({ text: 'Intake validation is outstanding — admission is refused with CANDIDATE_NOT_VALIDATED.', tone: 'danger' });
    } else if (row.admissionAuthority?.available !== true) {
      actions.push({ text: 'Admission authority is not bound — admission is refused with ADMISSION_AUTHORITY_UNAVAILABLE.', tone: 'danger' });
    } else {
      actions.push({ text: 'All admission gates hold — Admit submitted Candidate (evidence.admit) can create the immutable revision.', tone: 'success' });
    }
  } else if (state === 'RETURNED_FOR_CONTEXT') {
    actions.push({ text: 'Returned for context: supply the requested context, then re-submit the Candidate.', tone: 'warning' });
  } else if (state === 'DECLINED') {
    actions.push({ text: 'Candidate was declined — no Admission path remains for this Candidate.', tone: 'danger' });
  } else if (state === 'WITHDRAWN') {
    actions.push({ text: 'Candidate was withdrawn — the record is retained for lineage only.', tone: 'warning' });
  } else {
    actions.push({ text: 'Prepare and submit the Candidate for intake (candidate preparation → submission).', tone: 'info' });
  }
  if (row.sourceStatus === 'SUPERSEDED') {
    actions.push({ text: 'Source is SUPERSEDED — choose update / retain / withdraw (evidence.sourceChoice).', tone: 'warning' });
  }
  actions.push({
    text: 'Import never implies Admission, Review, Decision or Mastery — those stay separate governed steps.',
    tone: 'neutral'
  });
  return actions;
}

export function describeEvidenceEmpty() {
  return {
    key: 'evidence:EMPTY',
    empty: true,
    header: {
      icon: 'evidence',
      title: 'Evidence workbench',
      titleDir: 'auto',
      pills: [
        { label: 'Evidence record', value: 'NONE BOUND', tone: 'neutral' }
      ]
    },
    blocks: [
      {
        kind: 'track',
        id: 'intake',
        title: 'Intake → Admission lifecycle',
        steps: CANDIDATE_TRACK.map((step, index) => ({ label: step.label, state: index === 0 ? 'future' : 'future' })),
        next: [
          { text: 'No Candidate or admitted Evidence is selected, so no lifecycle position exists yet.', tone: 'neutral' },
          { text: 'Importing a Candidate starts this track at “Handoff received”; Admission only becomes reachable after verification, intake validation and admission authority all hold.', tone: 'info' }
        ]
      }
    ]
  };
}

export function describeEvidenceRecord(domain, selectedId) {
  const row = domain.inspect(selectedId);
  const revision = row.currentRevision;
  const admitted = row.status === 'ADMITTED';
  const lifecycle = row.lineage?.lifecycle || (row.status === 'WITHDRAWN' ? 'WITHDRAWN' : admitted ? 'ACTIVE' : null);
  const stateValue = admitted ? lifecycle : row.candidateState;
  const position = TRACK_POSITION[admitted ? 'ADMITTED' : (row.candidateState || 'RECEIVED')] ?? 0;
  const fixtureLabel = row.verification?.testOnly === true || row.admissionAuthority?.testOnly === true
    ? 'FIXTURE AUTHORITY' : null;

  const pills = [
    {
      label: admitted ? 'Evidence lifecycle' : 'Candidate state',
      value: show(stateValue),
      tone: stateValue === 'WITHDRAWN' || stateValue === 'DECLINED' ? 'danger'
        : stateValue === 'RETURNED_FOR_CONTEXT' ? 'warning'
          : admitted ? 'success' : 'info',
      badge: fixtureLabel
    },
    {
      label: 'Source status',
      value: show(row.sourceStatus),
      tone: row.sourceStatus === 'SUPERSEDED' ? 'warning' : 'success'
    },
    {
      label: 'Review status',
      value: show(row.reviewStatus || 'UNREVIEWED'),
      tone: 'neutral'
    }
  ];

  const criterionRefs = [...(row.criterionRefs || [])];

  const blocks = [
    {
      kind: 'track',
      id: 'intake',
      title: 'Intake → Admission lifecycle',
      steps: CANDIDATE_TRACK.map((step, index) => ({
        label: step.label,
        state: index < position ? 'done' : index === position ? 'current' : 'future'
      })),
      next: nextActions(row)
    },
    {
      kind: 'rows',
      id: 'record',
      title: 'Candidate record',
      rows: [
        { label: 'Evidence Claim', value: show(revision?.evidenceClaim || row.evidenceClaim, EMPTY_VALUE), dir: 'auto', wide: true },
        { label: 'Subject', value: show(row.subject), dir: 'auto' },
        { label: 'Governed purpose', value: show(row.governedPurpose), dir: 'auto', wide: true },
        {
          label: 'Proposed Capability / Criterion Scope',
          value: criterionRefs.length ? criterionRefs.join(' · ') : 'None pinned',
          dir: 'ltr', tone: criterionRefs.length ? 'link' : 'muted'
        },
        { label: 'Record identity', value: `${row.evidenceId || row.id} @ ${revision?.revisionId || row.revisionId}`, dir: 'ltr', mono: true },
        { label: 'Effective Review Decision', value: show(row.effectiveDecision || 'NONE'), dir: 'ltr', tone: row.effectiveDecision ? 'info' : 'warning' }
      ]
    },
    {
      kind: 'rows',
      id: 'source-handoff',
      icon: 'handoff',
      title: 'Source Handoff',
      rows: [
        { label: 'Source Domain', value: show(row.sourceType), dir: 'ltr' },
        { label: 'Source Type', value: admitted ? 'Admitted Evidence revision' : 'Candidate handoff', dir: 'auto' },
        { label: 'Source', value: `${show(row.sourceId)} @ ${show(row.sourceRevision)}`, dir: 'ltr', mono: true },
        { label: 'Handoff', value: show(row.handoffReceiptRef, 'No handoff receipt recorded'), dir: 'ltr' },
        { label: 'Handoff Received', value: show(row.sourceTimestamp, 'No source timestamp recorded'), dir: 'ltr' },
        { label: 'Submitted By', value: show(row.producerIdentity, 'No producer identity recorded'), dir: 'ltr' },
        { label: 'Submission Note', value: show(row.notes || row.governedPurpose), dir: 'auto', wide: true }
      ]
    },
    {
      kind: 'cards',
      id: 'supporting-references',
      icon: 'reference',
      title: 'Selected Supporting References',
      emptyMessage: 'No supporting material reference is pinned to this Candidate; references appear here when the handoff selects them.',
      cards: (row.selectedMaterialRefs || []).map(ref => ({
        title: ref,
        subtitle: 'Reference',
        external: true,
        tone: 'link'
      }))
    },
    {
      kind: 'rows',
      id: 'admission-gates',
      title: 'Verification and admission gates',
      rows: [
        { label: 'Source bytes', value: gate(row.sourceBytesAvailable, 'AVAILABLE', 'UNAVAILABLE'), dir: 'ltr', tone: row.sourceBytesAvailable === true ? 'success' : 'danger' },
        { label: 'Schema', value: gate(row.schemaValid, 'VALID', 'REJECTED / NOT CHECKED'), dir: 'ltr', tone: row.schemaValid === true ? 'success' : 'danger' },
        {
          label: 'Source verification',
          value: row.verification?.status === 'VERIFIED'
            ? `VERIFIED · ${row.verification.providerId} · ${row.verification.proofRef}`
            : show(row.verification?.status, 'UNVERIFIED'),
          dir: 'ltr',
          tone: row.verification?.status === 'VERIFIED' ? 'success' : 'danger',
          mono: row.verification?.status === 'VERIFIED'
        },
        {
          label: 'Intake validation',
          value: row.intakeValidation?.status === 'VALIDATED'
            ? `VALIDATED · ${row.intakeValidation.validator} · ${row.intakeValidation.proofRef}`
            : show(row.intakeValidation?.status, 'NOT_VALIDATED'),
          dir: 'ltr',
          tone: row.intakeValidation?.status === 'VALIDATED' ? 'success' : 'danger'
        },
        {
          label: 'Admission authority',
          value: row.admissionAuthority?.available === true
            ? `AUTHORIZED · ${row.admissionAuthority.proofRef}`
            : 'UNAVAILABLE — Admission refuses without a bound authority',
          dir: 'ltr',
          tone: row.admissionAuthority?.available === true ? 'success' : 'danger'
        }
      ]
    }
  ];

  return {
    key: `evidence:${row.id}:${row.revisionId}:${row.candidateState}:${row.sourceStatus}:${row.status}:${row.verification?.status}:${row.intakeValidation?.status}:${row.admissionAuthority?.available}`,
    empty: false,
    header: {
      icon: 'evidence',
      title: admitted ? `${row.title} · ${row.evidenceId}` : `${row.title} · ${row.evidenceId}`,
      titleDir: 'auto',
      sub: `${admitted ? 'Admitted Evidence' : 'Candidate Evidence'} · ${revision?.revisionId || row.revisionId}`,
      pills
    },
    blocks
  };
}

export default describeEvidenceRecord;
