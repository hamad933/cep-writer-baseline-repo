/**
 * W04 Portfolio — CENTER assembly dossier (surface-specific presentation data).
 *
 * Reference: `04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `3651bff6`) — CONSTRUCTION AUTHORITY for the centre's information
 * architecture: a view identity line with counts and an explicit ordering, a catalogue of the
 * curated evidence references with source disposition, a per-reference dossier, an integrity
 * statement and a source-state track. REFERENCE != BLIND PIXEL COPY.
 *
 * WHAT IS DELIBERATELY NOT RECONSTRUCTED: the reference's numbered capability sections.
 * Portfolio *grouping authority* is unresolved Owner question **Q-5** (STOP/REPORT —
 * `controller/03_historical/open_questions.md`), so no grouping structure is rendered:
 * memberships stay `UNGROUPED`, `groupingRef` stays null, `portfolio.group` keeps refusing with
 * `AUTHORITY_DECISION_REQUIRED`, and no example Project / Learning Objective identifier is
 * treated as canonical. The pending authority is a first-class, legible fact (blocks[0]).
 *
 * The centre is ordered by the curation sequence this surface owns — a view ordering, not a
 * grouping-authority binding. Everything below is read from the live `W04PortfolioDomain`;
 * absent values render informative EMPTY tokens (governance §6/§7, default-EMPTY law).
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

const AUTHORITY_NOTICE = Object.freeze({
  id: 'q5',
  kind: 'notice',
  tone: 'warning',
  title: 'Grouping authority: AUTHORITY_DECISION_REQUIRED — Q-5 open',
  body: 'Project / Learning Objective grouping authority is an unresolved Owner question (Q-5). This Portfolio therefore renders no grouping structure: memberships stay UNGROUPED, group refs stay null, portfolio.group refuses with AUTHORITY_DECISION_REQUIRED, and no example Project or Learning Objective identifier is treated as canonical. Only an Owner decision closes this — the refusal is shown here as a fact, not hidden as an absent value.'
});

function nextActions(domain, row) {
  const actions = [];
  actions.push({ text: 'Curate adds or removes a reference-only membership; removing never deletes canonical Evidence/Mastery truth (canonicalSourceWrite = false).', tone: 'neutral' });
  if (!domain.groupingAuthorityDescriptor) {
    actions.push({ text: 'Grouping is refused with AUTHORITY_DECISION_REQUIRED while Q-5 is open — no example Project / Learning Objective ID is treated as canonical.', tone: 'warning' });
  } else {
    actions.push({ text: 'A bound grouping registry may resolve this membership (portfolio.group).', tone: 'info' });
  }
  if (row.state === 'SOURCE_SUPERSEDED') {
    actions.push({ text: 'The canonical source revision moved on — display the pinned historical member and an explicit update choice (profile epistemic.stale).', tone: 'warning' });
  }
  if (row.state === 'SOURCE_WITHDRAWN' || row.state === 'UNAVAILABLE' || row.state === 'UNVERIFIED_PROVIDER_UNBOUND') {
    actions.push({ text: 'The canonical source is not resolvable in this workspace — the member is retained with its original ref and is never presented as RESOLVABLE.', tone: 'danger' });
  }
  actions.push({ text: 'Export binds exact refs, curation metadata and source disposition only; it never duplicates canonical authority.', tone: 'neutral' });
  return actions;
}

/** Assembly metric strip — the reference's `N Evidence References · ordered by …` line, as facts. */
function assemblyGrid(view) {
  const c = view.counts;
  return {
    kind: 'grid',
    id: 'assembly',
    title: 'Assembly at a glance',
    cells: [
      { label: 'References in view', value: String(c.references), tone: c.references ? 'info' : 'muted' },
      { label: 'Evidence references', value: String(c.evidence), tone: 'neutral' },
      { label: 'Mastery references', value: String(c.mastery), tone: 'neutral' },
      { label: 'Source resolvable', value: String(c.resolvable), tone: c.resolvable ? 'success' : 'muted' },
      { label: 'Needs source attention', value: String(c.attention), tone: c.attention ? 'warning' : 'muted' },
      { label: 'Export members', value: `${c.exportMembers} · canonical publication false`, tone: 'muted', dir: 'auto' }
    ]
  };
}

/** The curated catalogue — every reference this view admits, with its source disposition. */
function catalogueTable(view) {
  if (!view.records.length) return null;
  return {
    kind: 'table',
    id: 'catalogue',
    title: 'Curated evidence references',
    icon: 'reference',
    columns: ['Reference', 'Reference type', 'Source state', 'Curation note'],
    rows: view.records.map(row => ({
      cells: [
        { text: show(row.title), sub: show(row.sourceRef), dir: 'auto', mono: true },
        { text: show(row.refType), dir: 'ltr', tone: 'neutral' },
        { text: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'muted' },
        { text: show(row.annotation, 'No curation annotation recorded'), dir: 'auto', tone: 'muted' }
      ]
    }))
  };
}

function sourceIntegrityTable(row, integrity) {
  return {
    kind: 'table',
    id: 'source-integrity',
    title: 'Canonical source integrity',
    icon: 'check',
    columns: ['Integrity check', 'Result', 'Detail'],
    rows: [
      { cells: [
        { text: 'Source resolution', dir: 'ltr' },
        { text: integrity.state, dir: 'ltr', tone: integrity.state === 'RESOLVED' ? 'success' : 'danger' },
        { text: 'The canonical source is asked for this exact ref.', dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: 'Integrity envelope', dir: 'ltr' },
        { text: integrity.envelope, dir: 'ltr', mono: true, tone: integrity.state === 'RESOLVED' ? 'success' : 'muted' },
        { text: integrity.detail, dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: 'Canonical copy', dir: 'ltr' },
        { text: 'false', dir: 'ltr', tone: 'success' },
        { text: 'Portfolio stores the reference, never a canonical copy.', dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: 'Canonical delete authority', dir: 'ltr' },
        { text: 'false', dir: 'ltr', tone: 'success' },
        { text: 'Removing a membership never deletes Evidence or Mastery.', dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: 'Selected membership', dir: 'ltr' },
        { text: show(row.groupingState), dir: 'ltr', tone: 'warning' },
        { text: show(row.groupingRef, 'No grouping ref is bound (Q-5 open)'), dir: 'auto', tone: 'muted' }
      ] }
    ]
  };
}

function readSourceIntegrity(domain, row) {
  const integrity = { state: 'UNAVAILABLE', envelope: 'EMPTY', detail: 'No source resolver is bound to this Portfolio.' };
  if (!domain.sourceResolver || typeof domain.sourceResolver.inspect !== 'function') return integrity;
  let observed = null;
  try {
    observed = domain.sourceResolver.inspect(row.sourceRef) || null;
  } catch (error) {
    return { ...integrity, detail: String(error?.message || error) };
  }
  if (!observed) return { ...integrity, detail: 'The canonical source did not resolve this exact ref in this workspace.' };
  const resolved = observed.state === 'RESOLVED'
    || ((typeof observed.digest === 'string' && observed.digest && Number.isInteger(observed.rowCount)));
  if (!resolved) return { ...integrity, detail: String(observed.reason || 'The canonical source did not return an integrity envelope.') };
  return {
    state: 'RESOLVED',
    envelope: `${observed.digest} · ${observed.rowCount} row(s)`,
    detail: 'Digest and row count come from the canonical source itself.'
  };
}

const EMPTY_VIEW = Object.freeze({
  query: '',
  ordering: 'CURATION_SEQUENCE',
  records: Object.freeze([]),
  counts: Object.freeze({ references: 0, evidence: 0, mastery: 0, project: 0, resolvable: 0, attention: 0, exportMembers: 0 })
});

export function describePortfolioEmpty() {
  const view = EMPTY_VIEW;
  return {
    key: 'portfolio:EMPTY',
    empty: true,
    header: {
      icon: 'portfolio',
      title: 'Portfolio assembly',
      titleDir: 'auto',
      sub: 'No canonical Portfolio membership is bound · ordered by curation sequence',
      pills: [
        { label: 'Membership', value: 'NONE BOUND', tone: 'neutral' },
        { label: 'References', value: '0', tone: 'muted' },
        { label: 'Grouping', value: 'AUTHORITY DECISION REQUIRED', tone: 'warning' }
      ]
    },
    blocks: [
      { ...AUTHORITY_NOTICE },
      assemblyGrid(view),
      {
        kind: 'cards',
        id: 'ceilings',
        title: 'What this Portfolio is allowed to claim',
        icon: 'claim',
        cards: [
          { title: 'Reference-only curation', subtitle: 'canonicalSourceCopies = 0', lines: ['Members point at canonical Evidence / Mastery / Project records by exact ref; the source is never copied here.'] },
          { title: 'No delete authority', subtitle: 'canonicalSourceDeleteAuthority = false', lines: ['Removing a membership leaves the canonical record and every receipt intact.'] },
          { title: 'Reproducible export', subtitle: 'canonicalPublication = false', lines: ['An export is a projection of exact refs, curation metadata and source disposition — never a publication.'] },
          { title: 'Session-local projection', subtitle: 'durable = false', lines: ['Curation lives in this session until a shared durable binding is authorised.']
        }
        ]
      },
      {
        kind: 'track',
        id: 'membership',
        title: 'Membership source state',
        steps: MEMBER_STATES.map(value => ({ label: value, state: 'future' })),
        next: [
          { text: 'An empty Portfolio is a valid state: adding an authorized reference requires no invented achievement (profile epistemic.empty).', tone: 'info' },
          { text: 'Curation references canonical Evidence / Mastery / project records; it never copies or deletes them.', tone: 'neutral' },
          { text: 'Add a reference with an exact canonical source ref (id@revision) through Curate Portfolio reference.', tone: 'info' }
        ]
      },
      {
        kind: 'rows',
        id: 'source-integrity',
        title: 'Canonical source integrity',
        rows: [
          { label: 'Source resolution', value: 'EMPTY — no membership is bound, so no source is queried', dir: 'auto', tone: 'muted' },
          { label: 'Canonical copy', value: 'false — Portfolio stores the reference, never a canonical copy', dir: 'auto' },
          { label: 'Canonical delete authority', value: 'false — removing a membership never deletes Evidence/Mastery', dir: 'auto' },
          { label: 'Grouping authority', value: 'AUTHORITY_DECISION_REQUIRED — Q-5 open', dir: 'ltr', tone: 'warning' }
        ]
      }
    ].filter(Boolean)
  };
}

export function describePortfolioRecord(domain, selectedId) {
  const row = domain.get(selectedId);
  const view = typeof domain.view === 'function' ? domain.view() : { records: domain.records, counts: {}, ordering: 'CURATION_SEQUENCE', query: '' };
  const stateIndex = MEMBER_STATES.indexOf(row.state);
  const authorityBound = Boolean(domain.groupingAuthorityDescriptor);
  const integrity = readSourceIntegrity(domain, row);

  let exportFacts = { members: 0, limitations: [], canonicalPublication: false };
  try {
    const projection = domain.export();
    exportFacts = { members: projection.members.length, limitations: [...projection.limitations], canonicalPublication: projection.canonicalPublication === true };
  } catch { /* export truth stays at its safe defaults */ }

  const header = {
    icon: 'portfolio',
    title: show(row.title),
    titleDir: 'auto',
    sub: `${row.id} · ${show(row.refType)} reference · ordered by curation sequence`,
    pills: [
      { label: 'Source state', value: show(row.state), tone: STATE_TONE[row.state] || 'muted' },
      { label: 'Reference type', value: show(row.refType), tone: 'neutral' },
      { label: 'Grouping', value: authorityBound ? show(row.groupingState) : 'AUTHORITY DECISION REQUIRED', tone: 'warning' },
      { label: 'References in view', value: String(view.counts?.references ?? view.records.length ?? 0), tone: 'muted' },
      { label: 'Truth class', value: show(row.truthClass, 'CURATION_REFERENCE'), tone: row.truthClass === 'SYNTHETIC_DEMO_SEED' ? 'warning' : 'muted' }
    ]
  };

  const catalogue = catalogueTable(view);
  const blocks = [
    { ...AUTHORITY_NOTICE },
    assemblyGrid(view),
    catalogue,
    {
      kind: 'split',
      id: 'dossier',
      left: {
        kind: 'rows',
        id: 'identity',
        title: 'Curated reference',
        rows: [
          { label: 'Title', value: show(row.title), dir: 'auto', wide: true },
          { label: 'Reference type', value: show(row.refType), dir: 'ltr' },
          { label: 'Canonical source ref', value: show(row.sourceRef), dir: 'ltr', mono: true },
          { label: 'Membership identity', value: `${row.id} @ ${row.revisionId}`, dir: 'ltr', mono: true },
          { label: 'Annotation', value: show(row.annotation, 'No curation annotation recorded'), dir: 'auto', wide: true }
        ]
      },
      right: {
        kind: 'rows',
        id: 'disposition',
        title: 'Curation disposition',
        rows: [
          { label: 'Source state', value: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'muted' },
          { label: 'Membership state track', value: stateIndex < 0 ? 'EMPTY — state not classifiable' : MEMBER_STATES[stateIndex], dir: 'ltr', tone: stateIndex < 0 ? 'muted' : 'info' },
          { label: 'Grouping', value: show(row.groupingRef, '— none (UNGROUPED)'), dir: 'ltr', mono: true, tone: 'muted' },
          { label: 'Grouping authority', value: authorityBound ? show(row.groupingState) : 'AUTHORITY_DECISION_REQUIRED (Q-5 open)', dir: 'ltr', tone: 'warning' },
          { label: 'Curation receipts', value: String(domain.receipts?.length ?? 0), dir: 'ltr' }
        ]
      }
    },
    sourceIntegrityTable(row, integrity),
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
      id: 'export',
      title: 'Export preparation',
      rows: [
        { label: 'Members in export', value: String(exportFacts.members), dir: 'ltr' },
        { label: 'Canonical publication', value: String(exportFacts.canonicalPublication), dir: 'ltr', tone: exportFacts.canonicalPublication ? 'warning' : 'success' },
        { label: 'Active view filter', value: view.query ? view.query : 'none — the whole Portfolio is in view', dir: 'auto' },
        { label: 'Limitations', value: exportFacts.limitations.join(' · ') || 'EMPTY', dir: 'auto', wide: true }
      ]
    }
  ].filter(Boolean);

  return {
    key: `portfolio:${row.id}:${row.revisionId}:${row.state}:${row.groupingState}:${exportFacts.members}:${view.counts.references}:${view.query}`,
    empty: false,
    header,
    blocks
  };
}

export default describePortfolioRecord;
