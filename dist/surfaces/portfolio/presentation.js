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
 *
 * Copy is localized through `./i18n.ts`; technical tokens (state names, authority codes, exact
 * refs, ids) are never translated and are isolated with `dir="ltr"` at the point of display.
 * No direction is baked into any structure.
 */

import { portfolioCopy } from './i18n.js';

const show = (value     , fallback = 'EMPTY') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const MEMBER_STATES = Object.freeze(['RESOLVABLE', 'SOURCE_SUPERSEDED', 'SOURCE_WITHDRAWN', 'UNAVAILABLE']);
const STATE_TONE                         = Object.freeze({
  RESOLVABLE: 'success', SOURCE_SUPERSEDED: 'warning',
  SOURCE_WITHDRAWN: 'danger', UNAVAILABLE: 'danger',
  UNVERIFIED_PROVIDER_UNBOUND: 'muted'
});

function authorityNotice(T     ) {
  return { id: 'q5', kind: 'notice', tone: 'warning', title: T.authorityTitle, body: T.authorityBody };
}

function nextActions(T     , domain     , row     ) {
  const actions        = [{ text: T.nextCurate, tone: 'neutral' }];
  actions.push(domain.groupingAuthorityDescriptor
    ? { text: T.nextGroupingBound, tone: 'info' }
    : { text: T.nextGroupingRefused, tone: 'warning' });
  if (row.state === 'SOURCE_SUPERSEDED') actions.push({ text: T.nextSuperseded, tone: 'warning' });
  if (row.state === 'SOURCE_WITHDRAWN' || row.state === 'UNAVAILABLE' || row.state === 'UNVERIFIED_PROVIDER_UNBOUND') {
    actions.push({ text: T.nextUnresolvable, tone: 'danger' });
  }
  actions.push({ text: T.nextExport, tone: 'neutral' });
  return actions;
}

/** Assembly metric strip — the reference's `N Evidence References · ordered by …` line, as facts. */
function assemblyGrid(T     , view     ) {
  const c = view.counts;
  return {
    kind: 'grid',
    id: 'assembly',
    title: T.metricsTitle,
    cells: [
      { label: T.mReferences, value: String(c.references ?? 0), tone: (c.references ?? 0) ? 'info' : 'muted' },
      { label: T.mEvidence, value: String(c.evidence ?? 0), tone: 'neutral' },
      { label: T.mMastery, value: String(c.mastery ?? 0), tone: 'neutral' },
      { label: T.mProject, value: String(c.project ?? 0), tone: 'neutral' },
      { label: T.mResolvable, value: String(c.resolvable ?? 0), tone: (c.resolvable ?? 0) ? 'success' : 'muted' },
      { label: T.mAttention, value: String(c.attention ?? 0), tone: (c.attention ?? 0) ? 'warning' : 'muted' }
    ]
  };
}

/** The curated catalogue — every reference this view admits, with its source disposition. */
function catalogueTable(T     , view     ) {
  if (!view.records.length) return null;
  return {
    kind: 'table',
    id: 'catalogue',
    title: T.catalogueTitle,
    icon: 'reference',
    columns: [T.colReference, T.colReferenceType, T.colSourceState, T.colCurationNote],
    rows: view.records.map((row     ) => ({
      cells: [
        { text: show(row.title), sub: show(row.sourceRef), dir: 'auto' },
        { text: show(row.refType), dir: 'ltr', tone: 'neutral' },
        { text: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'muted' },
        { text: show(row.annotation, T.noAnnotation), dir: 'auto', tone: 'muted' }
      ]
    }))
  };
}

function sourceIntegrityTable(T     , row     , integrity     ) {
  return {
    kind: 'table',
    id: 'source-integrity',
    title: T.integrityTitle,
    icon: 'check',
    columns: [T.colCheck, T.colResult, T.colDetail],
    rows: [
      { cells: [
        { text: T.cSourceResolution, dir: 'auto' },
        { text: integrity.state, dir: 'ltr', tone: integrity.state === 'RESOLVED' ? 'success' : 'danger' },
        { text: T.cSourceAsked, dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: T.cEnvelope, dir: 'auto' },
        { text: integrity.envelope, dir: 'ltr', mono: true, tone: integrity.state === 'RESOLVED' ? 'success' : 'muted' },
        { text: integrity.detail, dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: T.cCanonicalCopy, dir: 'auto' },
        { text: 'false', dir: 'ltr', tone: 'success' },
        { text: T.cCanonicalCopyNote, dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: T.cDeleteAuthority, dir: 'auto' },
        { text: 'false', dir: 'ltr', tone: 'success' },
        { text: T.cDeleteNote, dir: 'auto', tone: 'muted' }
      ] },
      { cells: [
        { text: T.cSelectedMembership, dir: 'auto' },
        { text: show(row.groupingState), dir: 'ltr', tone: 'warning' },
        { text: show(row.groupingRef, T.cNoGroupingRef), dir: 'auto', tone: 'muted' }
      ] }
    ]
  };
}

function readSourceIntegrity(T     , domain     , row     ) {
  const integrity = { state: 'UNAVAILABLE', envelope: 'EMPTY', detail: T.integNoResolver };
  if (!domain.sourceResolver || typeof domain.sourceResolver.inspect !== 'function') return integrity;
  let observed      = null;
  try {
    observed = domain.sourceResolver.inspect(row.sourceRef) || null;
  } catch (error     ) {
    return { ...integrity, detail: String(error?.message || error) };
  }
  if (!observed) return { ...integrity, detail: T.integUnresolved };
  const resolved = observed.state === 'RESOLVED'
    || ((typeof observed.digest === 'string' && observed.digest && Number.isInteger(observed.rowCount)));
  if (!resolved) return { ...integrity, detail: String(observed.reason || T.integNoEnvelope) };
  return {
    state: 'RESOLVED',
    envelope: `${observed.digest} · ${observed.rowCount} row(s)`,
    detail: T.integFromSource
  };
}

const EMPTY_VIEW = Object.freeze({
  query: '',
  ordering: 'CURATION_SEQUENCE',
  records: Object.freeze([])       ,
  counts: Object.freeze({ references: 0, evidence: 0, mastery: 0, project: 0, resolvable: 0, attention: 0, exportMembers: 0 })       
});

export function describePortfolioEmpty() {
  const T      = portfolioCopy();
  return {
    key: 'portfolio:EMPTY',
    empty: true,
    header: {
      icon: 'portfolio',
      title: T.emptyTitle,
      titleDir: 'auto',
      sub: T.emptySub,
      pills: [
        { label: T.pillMembership, value: T.pillNoneBound, tone: 'neutral' },
        { label: T.pillReferences, value: '0', tone: 'muted' },
        { label: T.pillGrouping, value: T.pillGroupingRequired, tone: 'warning' }
      ]
    },
    blocks: [
      authorityNotice(T),
      assemblyGrid(T, EMPTY_VIEW),
      {
        kind: 'cards',
        id: 'ceilings',
        title: T.ceilingsTitle,
        icon: 'claim',
        cards: [
          { title: T.cardCurationTitle, subtitle: T.cardCurationSub, lines: [T.cardCurationLine] },
          { title: T.cardDeleteTitle, subtitle: T.cardDeleteSub, lines: [T.cardDeleteLine] },
          { title: T.cardExportTitle, subtitle: T.cardExportSub, lines: [T.cardExportLine] },
          { title: T.cardSessionTitle, subtitle: T.cardSessionSub, lines: [T.cardSessionLine] }
        ]
      },
      {
        kind: 'track',
        id: 'membership',
        title: T.trackTitle,
        steps: MEMBER_STATES.map(value => ({ label: value, state: 'future' })),
        next: [
          { text: T.nextEmptyValid, tone: 'info' },
          { text: T.nextEmptyReferences, tone: 'neutral' },
          { text: T.nextEmptyAdd, tone: 'info' }
        ]
      },
      {
        kind: 'rows',
        id: 'source-integrity',
        title: T.integrityTitle,
        rows: [
          { label: T.eSourceResolution, value: T.eNoMembership, dir: 'auto', tone: 'muted' },
          { label: T.eCanonicalCopy, value: T.eCanonicalCopyNote, dir: 'auto' },
          { label: T.eDeleteAuthority, value: T.eDeleteNote, dir: 'auto' },
          { label: T.eGroupingAuthority, value: `AUTHORITY_DECISION_REQUIRED — ${T.q5Open}`, dir: 'ltr', tone: 'warning' }
        ]
      }
    ]
  };
}

export function describePortfolioRecord(domain     , selectedId     ) {
  const T      = portfolioCopy();
  const row = domain.get(selectedId);
  const view = typeof domain.view === 'function'
    ? domain.view()
    : { records: domain.records, query: '', ordering: 'CURATION_SEQUENCE', counts: {}        };
  const stateIndex = MEMBER_STATES.indexOf(row.state);
  const authorityBound = Boolean(domain.groupingAuthorityDescriptor);
  const integrity = readSourceIntegrity(T, domain, row);

  const header = {
    icon: 'portfolio',
    title: show(row.title),
    titleDir: 'auto',
    sub: T.recordSub(row.id, show(row.refType)),
    pills: [
      { label: T.pillSourceState, value: show(row.state), tone: STATE_TONE[row.state] || 'muted' },
      { label: T.pillReferenceType, value: show(row.refType), tone: 'neutral' },
      { label: T.pillGrouping, value: authorityBound ? show(row.groupingState) : T.pillGroupingRequired, tone: 'warning' },
      { label: T.pillRefsInView, value: String(view.counts?.references ?? view.records.length ?? 0), tone: 'muted' },
      { label: T.pillTruthClass, value: show(row.truthClass, 'CURATION_REFERENCE'), tone: row.truthClass === 'SYNTHETIC_DEMO_SEED' ? 'warning' : 'muted' }
    ]
  };

  const blocks = [
    authorityNotice(T),
    assemblyGrid(T, view),
    catalogueTable(T, view),
    {
      kind: 'split',
      id: 'dossier',
      left: {
        kind: 'rows',
        id: 'identity',
        title: T.identityTitle,
        rows: [
          { label: T.rTitle, value: show(row.title), dir: 'auto', wide: true },
          { label: T.rReferenceType, value: show(row.refType), dir: 'ltr' },
          { label: T.rSourceRef, value: show(row.sourceRef), dir: 'ltr', mono: true },
          { label: T.rMembershipIdentity, value: `${row.id} @ ${row.revisionId}`, dir: 'ltr', mono: true },
          { label: T.rAnnotation, value: show(row.annotation, T.noAnnotation), dir: 'auto', wide: true }
        ]
      },
      right: {
        kind: 'rows',
        id: 'disposition',
        title: T.dispositionTitle,
        rows: [
          { label: T.rSourceState, value: show(row.state), dir: 'ltr', tone: STATE_TONE[row.state] || 'muted' },
          { label: T.rStateTrack, value: stateIndex < 0 ? T.rStateUnclassifiable : MEMBER_STATES[stateIndex], dir: 'ltr', tone: stateIndex < 0 ? 'muted' : 'info' },
          { label: T.rGrouping, value: show(row.groupingRef, T.rGroupingNone), dir: 'ltr', mono: true, tone: 'muted' },
          { label: T.rGroupingAuthority, value: authorityBound ? show(row.groupingState) : T.rGroupingAuthorityPending, dir: 'ltr', tone: 'warning' },
          { label: T.rReceipts, value: String(domain.receipts?.length ?? 0), dir: 'ltr' }
        ]
      }
    },
    sourceIntegrityTable(T, row, integrity),
    {
      kind: 'track',
      id: 'membership',
      title: T.trackTitle,
      steps: MEMBER_STATES.map((value, index) => ({
        label: value,
        state: stateIndex < 0 ? 'future' : index < stateIndex ? 'done' : index === stateIndex ? 'current' : 'future'
      })),
      next: nextActions(T, domain, row)
    }
  ].filter(Boolean);

  return {
    key: `portfolio:${row.id}:${row.revisionId}:${row.state}:${row.groupingState}:${domain.records.length}:${view.counts?.references ?? view.records.length}:${view.query}:${T.pillMembership}`,
    empty: false,
    header,
    blocks
  };
}

export default describePortfolioRecord;
