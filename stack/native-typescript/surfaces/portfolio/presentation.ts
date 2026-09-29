/**
 * W04 Portfolio — surface-specific CENTER record composition (defects D10 / P2 / P3-adjacent).
 *
 * Reference: `04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `3651bff6`) shows numbered capability groups with per-group
 * completeness badges. **The grouping structure is deliberately NOT reconstructed**: portfolio
 * grouping authority is unresolved Owner question **Q-5** and is STOP/REPORT — this surface must
 * never render grouping structure (P1, preserved).
 *
 * What P2 requires — and what this module declares — is that the *pending authority state* becomes
 * a first-class, legible fact instead of a `—` inside a generic row: an explicit
 * `AUTHORITY_DECISION_REQUIRED (Q-5 open)` notice, a member-state track, source-integrity truth and
 * export preparation, all read from the live `W04PortfolioDomain`.
 *
 * Every value comes from the domain; absent values render informative EMPTY tokens
 * (governance §6/§7, default-EMPTY law).
 */

const show = (value, fallback = 'EMPTY') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const MEMBER_STATES = Object.freeze(['RESOLVABLE', 'SOURCE_SUPERSEDED', 'SOURCE_WITHDRAWN', 'UNAVAILABLE']);
const STATE_TONE = Object.freeze({
  RESOLVABLE: 'success', SOURCE_SUPERSEDED: 'warning',
  SOURCE_WITHDRAWN: 'danger', UNAVAILABLE: 'danger',
  UNVERIFIED_PROVIDER_UNBOUND: 'muted'
});

function nextActions(domain, row) {
  const actions = [];
  actions.push({ text: 'Curate adds or removes a reference-only membership; removing never deletes canonical Evidence/Mastery truth (canonicalSourceWrite = false).', tone: 'neutral' });
  if (row.groupingState === 'AUTHORITY_PENDING' || !domain.groupingAuthorityDescriptor) {
    actions.push({ text: 'Grouping is refused with AUTHORITY_DECISION_REQUIRED while Q-5 is open — no example Project / Learning Objective ID is treated as canonical.', tone: 'warning' });
  } else {
    actions.push({ text: 'A bound grouping registry may resolve this membership (portfolio.group).', tone: 'info' });
  }
  if (row.state === 'SOURCE_SUPERSEDED') {
    actions.push({ text: 'The canonical source revision moved on — display the pinned historical member and an explicit update choice (profile epistemic.stale).', tone: 'warning' });
  }
  if (row.state === 'UNAVAILABLE' || row.state === 'UNVERIFIED_PROVIDER_UNBOUND') {
    actions.push({ text: 'The canonical source is not resolvable in this workspace — the member is retained with its original ref and is never presented as RESOLVABLE.', tone: 'danger' });
  }
  actions.push({ text: 'Export binds exact refs, curation metadata and source disposition only; it never duplicates canonical authority.', tone: 'neutral' });
  return actions;
}

export function describePortfolioEmpty() {
  return {
    key: 'portfolio:EMPTY',
    empty: true,
    header: {
      icon: 'portfolio',
      title: 'Curation workbench',
      titleDir: 'auto',
      sub: 'No canonical Portfolio membership is bound',
      pills: [{ label: 'Membership', value: 'NONE BOUND', tone: 'neutral' }]
    },
    blocks: [
      {
        kind: 'notice',
        id: 'q5',
        tone: 'warning',
        title: 'Grouping authority: AUTHORITY_DECISION_REQUIRED — Q-5 open',
        body: 'Project / Learning Objective grouping authority is an unresolved Owner question (Q-5). The Portfolio therefore renders no grouping structure at all: memberships stay UNGROUPED, portfolio.group stays refused, and the pending authority is displayed here as an explicit fact rather than as an absent value.'
      },
      {
        kind: 'track',
        id: 'membership',
        title: 'Membership source state',
        steps: MEMBER_STATES.map(value => ({ label: value, state: 'future' })),
        next: [
          { text: 'An empty Portfolio is a valid state: adding an authorized reference requires no invented achievement (profile epistemic.empty).', tone: 'info' },
          { text: 'Curation references canonical Evidence / Mastery / project records; it never copies or deletes them.', tone: 'neutral' }
        ]
      },
      {
        kind: 'rows',
        id: 'export',
        title: 'Export preparation',
        rows: [
          { label: 'Members', value: '0 — nothing to export', dir: 'auto', tone: 'muted' },
          { label: 'Canonical publication', value: 'false — projection only', dir: 'ltr' },
          { label: 'Grouping authority', value: 'AUTHORITY_DECISION_REQUIRED', dir: 'ltr', tone: 'warning' }
        ]
      }
    ]
  };
}

export function describePortfolioRecord(domain, selectedId) {
  const row = domain.get(selectedId);
  const stateIndex = MEMBER_STATES.indexOf(row.state);
  const authorityBound = Boolean(domain.groupingAuthorityDescriptor);
  let sourceIntegrity = { state: 'UNAVAILABLE', detail: 'No source resolver is bound to this Portfolio.' };
  if (domain.sourceResolver && typeof domain.sourceResolver.inspect === 'function') {
    try {
      const observed = domain.sourceResolver.inspect(row.sourceRef) || null;
      if (!observed) {
        sourceIntegrity = { state: 'UNAVAILABLE', detail: 'The canonical source did not resolve this exact ref in this workspace.' };
      } else {
        const state = observed.state
          || ((typeof observed.digest === 'string' && observed.digest && Number.isInteger(observed.rowCount)) ? 'RESOLVED' : 'UNAVAILABLE');
        sourceIntegrity = state === 'RESOLVED'
          ? { state, detail: `digest ${observed.digest} · ${observed.rowCount} row(s)` }
          : { state, detail: String(observed.reason || 'The canonical source did not return an integrity envelope.') };
      }
    } catch (error) {
      sourceIntegrity = { state: 'UNAVAILABLE', detail: String(error?.message || error) };
    }
  }
  let exportFacts = { members: 0, limitations: [], canonicalPublication: false };
  try {
    const projection = domain.export();
    exportFacts = { members: projection.members.length, limitations: [...projection.limitations], canonicalPublication: projection.canonicalPublication === true };
  } catch { /* export truth stays at its safe defaults */ }

  const pills = [
    { label: 'Source state', value: show(row.state), tone: STATE_TONE[row.state] || 'muted', badge: null },
    { label: 'Reference type', value: show(row.refType), tone: 'neutral' },
    { label: 'Grouping', value: authorityBound ? show(row.groupingState) : 'AUTHORITY DECISION REQUIRED', tone: 'warning' }
  ];

  const blocks = [
    {
      kind: 'notice',
      id: 'q5',
      tone: 'warning',
      title: 'Grouping authority: AUTHORITY_DECISION_REQUIRED — Q-5 open',
      body: authorityBound
        ? `A grouping registry is bound (${domain.groupingAuthorityDescriptor.providerId}), yet this membership is ${show(row.groupingState)}.`
        : 'Project / Learning Objective grouping authority is an unresolved Owner question (Q-5). No grouping structure is rendered, membership stays UNGROUPED, and portfolio.group is refused with AUTHORITY_DECISION_REQUIRED. Only an Owner decision closes this.'
    },
    {
      kind: 'track',
      id: 'membership',
      title: 'Membership source state',
      steps: MEMBER_STATES.map((value, index) => ({
        label: value,
        state: stateIndex < 0 ? 'future' : index < stateIndex ? 'done' : index === stateIndex ? 'current' : 'future'
      })),
      next: nextActions(domain, row)
    },
    {
      kind: 'rows',
      id: 'identity',
      title: 'Portfolio reference',
      rows: [
        { label: 'Title', value: show(row.title), dir: 'auto', wide: true },
        { label: 'Reference type', value: show(row.refType), dir: 'ltr' },
        { label: 'Canonical source ref', value: show(row.sourceRef), dir: 'ltr', mono: true },
        { label: 'Source state', value: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'muted' },
        { label: 'Membership identity', value: `${row.id} @ ${row.revisionId}`, dir: 'ltr', mono: true },
        { label: 'Grouping ref', value: show(row.groupingRef, '— none (UNGROUPED)'), dir: 'ltr', mono: true, tone: 'muted' },
        { label: 'Grouping authority state', value: show(row.groupingState), dir: 'ltr', tone: 'warning' },
        { label: 'Annotation', value: show(row.annotation, 'No curation annotation recorded'), dir: 'auto', wide: true },
        { label: 'Truth class', value: show(row.truthClass, 'CURATION_REFERENCE'), dir: 'ltr', tone: row.truthClass === 'SYNTHETIC_DEMO_SEED' ? 'warning' : 'muted' }
      ]
    },
    {
      kind: 'rows',
      id: 'source-integrity',
      title: 'Canonical source integrity',
      rows: [
        { label: 'Source resolution', value: sourceIntegrity.state, dir: 'ltr', tone: sourceIntegrity.state === 'RESOLVED' ? 'success' : 'danger' },
        { label: 'Envelope', value: sourceIntegrity.detail, dir: 'auto', wide: true },
        { label: 'Canonical copy', value: 'false — Portfolio stores the reference, never a canonical copy', dir: 'auto' },
        { label: 'Canonical delete authority', value: 'false — removing a membership never deletes Evidence/Mastery', dir: 'auto' }
      ]
    },
    {
      kind: 'rows',
      id: 'export',
      title: 'Export preparation',
      rows: [
        { label: 'Members in export', value: String(exportFacts.members), dir: 'ltr' },
        { label: 'Canonical publication', value: String(exportFacts.canonicalPublication), dir: 'ltr', tone: 'success' },
        { label: 'Limitations', value: exportFacts.limitations.join(' · ') || 'EMPTY', dir: 'auto', wide: true }
      ]
    }
  ];

  return {
    key: `portfolio:${row.id}:${row.revisionId}:${row.state}:${row.groupingState}:${exportFacts.members}`,
    empty: false,
    header: {
      icon: 'portfolio',
      title: show(row.title),
      titleDir: 'auto',
      sub: `${row.id} · reference-only curation`,
      pills
    },
    blocks
  };
}

export default describePortfolioRecord;
