/**
 * W04 Mastery — surface-specific CENTER record composition (defects D9 / D10 / M1 / M2).
 *
 * Reference: `03_MASTERY/Arabic Cybersecurity Mastery Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `7784568e`). It shows: target title + two status pills
 * (`Mastery Judgment: MASTERED` green, `Freshness Status: REVALIDATION_REQUIRED` amber) ·
 * `Subject:` · an explanatory line · a **numbered 5-step explainability structure** with
 * tables in the middle steps and a prose basis at the end.
 *
 * M1: while no governed Mastery State exists, `NOT_EVALUATED` is the authoritative epistemic
 *     state and is rendered as the judgment pill — never as a bare `EMPTY` token.
 * M2: a row whose `truthClass` is `SYNTHETIC_DEMO_SEED` carries a visible FIXTURE badge and an
 *     explicit fixture notice, so a fixture result can never read as real consumer mastery.
 *
 * Nothing here is invented: judgment/freshness come from the `MASTERY_JUDGMENTS` /
 * `MASTERY_FRESHNESS` vocabularies, resolution states from `W04MasteryDomain.explain()`, and
 * absent values render informative EMPTY tokens (governance §6/§7).
 */

const show = (value, fallback = 'EMPTY') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const JUDGMENT_TONE = Object.freeze({
  NOT_EVALUATED: 'muted', INSUFFICIENT_EVIDENCE: 'warning', INCONCLUSIVE: 'warning',
  NOT_MASTERED: 'danger', MASTERED: 'success'
});
const FRESHNESS_TONE = Object.freeze({ CURRENT: 'success', REVALIDATION_REQUIRED: 'warning' });

/** The governed judgment dimension (surface-profiles/mastery.json#state_dimensions). */
const JUDGMENT_VOCABULARY = Object.freeze([
  'NOT_EVALUATED', 'INSUFFICIENT_EVIDENCE', 'INCONCLUSIVE', 'NOT_MASTERED', 'MASTERED'
]);

function nextActions(domain, row, explanation) {
  const actions = [];
  if (!domain.evaluatorDescriptor) {
    actions.push({ text: 'Authorized Mastery evaluator/provider is unbound — re-evaluation is refused with AUTHORIZED_EVALUATOR_UNBOUND and no local Mastery write exists.', tone: 'danger' });
  }
  if (explanation.missingRefs.length) {
    actions.push({ text: `Evaluation basis is incomplete (${explanation.missingRefs.length} unresolved reference(s): ${explanation.missingRefs.join(', ')}) — re-evaluation is refused with BASIS_UNAVAILABLE.`, tone: 'warning' });
  }
  if (explanation.conflict) {
    actions.push({ text: 'Conflicting effective Decisions route to governed evaluation (CONFLICT_REQUIRES_GOVERNED_EVALUATION); presentation never resolves them locally.', tone: 'danger' });
  }
  if (domain.evaluatorDescriptor && !explanation.missingRefs.length && !explanation.conflict) {
    actions.push({ text: 'Basis and evaluator hold — request governed re-evaluation (mastery.reevaluate); the request is delegated and never writes Mastery locally.', tone: 'success' });
  }
  actions.push({ text: 'Freshness may change only through a new governed Mastery State — setFreshness is refused with CANONICAL_MASTERY_WRITE_FORBIDDEN.', tone: 'neutral' });
  actions.push({ text: 'Completion or activity never creates Mastery.', tone: 'neutral' });
  return actions;
}

function fixtureNotice(row) {
  if (row.truthClass !== 'SYNTHETIC_DEMO_SEED') return null;
  return {
    kind: 'notice',
    id: 'fixture-notice',
    tone: 'warning',
    title: 'FIXTURE · SYNTHETIC_DEMO_SEED',
    body: 'This Mastery State was seeded by the reviewer harness. L07 consumer taxonomy: fixture. It is not a real consumer achievement, and it must never be read, exported or accepted as one.'
  };
}

export function describeMasteryEmpty() {
  return {
    key: 'mastery:EMPTY',
    empty: true,
    header: {
      icon: 'mastery',
      title: 'Mastery workbench',
      titleDir: 'auto',
      sub: 'No governed Mastery State is bound',
      pills: [
        { label: 'Mastery Judgment', value: 'NOT_EVALUATED', tone: 'muted', badge: null },
        { label: 'Freshness Status', value: 'UNAVAILABLE', tone: 'muted', note: 'no evaluation exists' }
      ]
    },
    blocks: [
      {
        kind: 'notice',
        id: 'm1-empty',
        tone: 'info',
        title: 'NOT_EVALUATED — the authoritative epistemic state',
        body: 'No authorized Mastery provider/evaluator is bound, so no Mastery State exists. NOT_EVALUATED is displayed instead of a generic EMPTY token because the state itself is informative: it states that evaluation has not happened, not that the projection failed.'
      },
      {
        kind: 'track',
        id: 'judgment',
        title: 'Mastery judgment dimension',
        steps: JUDGMENT_VOCABULARY.map((value, index) => ({ label: value, state: index === 0 ? 'current' : 'future' })),
        next: [
          { text: 'Nothing selects a judgment today: an evaluation is produced only by an authorized evaluator from effective Decisions, Evidence and a versioned policy.', tone: 'info' },
          { text: 'Completion or activity never creates Mastery.', tone: 'neutral' }
        ]
      },
      {
        kind: 'rows',
        id: 'basis',
        title: 'Evaluation basis',
        rows: [
          { label: 'Policy revision', value: 'EMPTY — no Mastery State pins a policy', dir: 'ltr', tone: 'muted' },
          { label: 'Effective Decisions', value: 'EMPTY — none bound to an evaluation', dir: 'ltr', tone: 'muted' },
          { label: 'Supporting Evidence', value: 'EMPTY — none bound to an evaluation', dir: 'ltr', tone: 'muted' },
          { label: 'Basis digest', value: 'EMPTY — no evaluation was computed', dir: 'ltr', tone: 'muted' }
        ]
      }
    ]
  };
}

export function describeMasteryRecord(domain, selectedId) {
  const row = domain.inspect(selectedId);
  const explanation = domain.explain(selectedId);
  const fixture = fixtureNotice(row);
  const judgmentTone = JUDGMENT_TONE[row.judgment] || 'muted';
  const freshnessTone = FRESHNESS_TONE[row.freshness] || 'muted';
  const judgmentIndex = JUDGMENT_VOCABULARY.indexOf(row.judgment);

  const pills = [
    { label: 'Mastery Judgment', value: show(row.judgment), tone: judgmentTone, badge: fixture ? 'FIXTURE' : null },
    { label: 'Freshness Status', value: show(row.freshness), tone: freshnessTone, badge: null }
  ];

  const blocks = [];
  if (fixture) blocks.push(fixture);

  blocks.push({
    kind: 'track',
    id: 'judgment',
    title: 'Mastery judgment dimension',
    steps: JUDGMENT_VOCABULARY.map((value, index) => ({
      label: value,
      state: judgmentIndex < 0 ? 'future' : index < judgmentIndex ? 'done' : index === judgmentIndex ? 'current' : 'future'
    })),
    next: nextActions(domain, row, explanation)
  });

  blocks.push({
    kind: 'rows',
    id: 'identity',
    rows: [
      { label: 'Subject', value: show(row.subject), dir: 'ltr' },
      { label: 'Mastery target', value: show(row.capability), dir: 'ltr', tone: 'link' },
      { label: 'Judgment', value: show(row.judgment), dir: 'ltr', tone: judgmentTone },
      { label: 'Freshness', value: show(row.freshness), dir: 'ltr', tone: freshnessTone },
      { label: 'Revision', value: `${row.id} @ ${row.revisionId}`, dir: 'ltr', mono: true }
    ]
  });

  blocks.push({
    kind: 'steps',
    id: 'explainability',
    title: 'Explainability structure',
    items: [
      {
        number: 1,
        title: 'Mastery Policy Revision',
        body: {
          kind: 'rows',
          rows: [
            { label: 'Policy Revision', value: show(row.policyRef), dir: 'ltr', mono: true, tone: 'link' },
            { label: 'Policy resolution', value: show(explanation.policy?.state, 'EMPTY'), dir: 'ltr', tone: explanation.policy?.state === 'RESOLVED' ? 'success' : 'warning' },
            { label: 'Policy set', value: show(row.capability), dir: 'ltr' }
          ]
        }
      },
      {
        number: 2,
        title: 'Effective Review Decisions',
        body: {
          kind: 'table',
          columns: ['Review / Decision ref', 'Resolution'],
          rows: explanation.decisions.length
            ? explanation.decisions.map(item => ({
              cells: [
                { text: item.ref, dir: 'ltr', mono: true, tone: item.state === 'RESOLVED' ? 'link' : 'muted' },
                { text: item.state, dir: 'ltr', tone: item.state === 'RESOLVED' ? 'success' : 'warning', sub: item.reason || null }
              ]
            }))
            : [{ cells: [{ text: 'EMPTY', dir: 'ltr', tone: 'muted' }, { text: 'No Decision reference is bound to this evaluation basis', dir: 'auto', tone: 'muted' }] }]
        }
      },
      {
        number: 3,
        title: 'Supporting Evidence',
        body: {
          kind: 'table',
          columns: ['Evidence ref', 'Resolution'],
          rows: explanation.evidence.length
            ? explanation.evidence.map(item => ({
              cells: [
                { text: item.ref, dir: 'ltr', mono: true, tone: item.state === 'RESOLVED' ? 'link' : 'muted' },
                { text: item.state, dir: 'ltr', tone: item.state === 'RESOLVED' ? 'success' : 'warning', sub: item.reason || null }
              ]
            }))
            : [{ cells: [{ text: 'EMPTY', dir: 'ltr', tone: 'muted' }, { text: 'No Evidence reference is bound to this evaluation basis', dir: 'auto', tone: 'muted' }] }]
        }
      },
      {
        number: 4,
        title: 'Basis integrity and conflict status',
        body: {
          kind: 'rows',
          rows: [
            { label: 'Basis digest', value: show(row.basis?.digest), dir: 'ltr', mono: true },
            { label: 'Unresolved references', value: explanation.missingRefs.length ? explanation.missingRefs.join(', ') : 'None — every basis reference resolved', dir: 'ltr', tone: explanation.missingRefs.length ? 'warning' : 'success' },
            { label: 'Conflict status', value: explanation.conflict ? 'CONFLICTING EFFECTING DECISIONS' : 'No conflicting effective Decisions observed', dir: 'auto', tone: explanation.conflict ? 'danger' : 'success' },
            { label: 'Recorded evaluations', value: String(domain.history.filter(item => item.recordId === row.id).length), dir: 'ltr' },
            { label: 'Truth class', value: show(row.truthClass, 'PROVIDER_BOUND'), dir: 'ltr', tone: row.truthClass === 'SYNTHETIC_DEMO_SEED' ? 'warning' : 'muted' }
          ]
        }
      },
      {
        number: 5,
        title: 'Evaluation Basis',
        body: {
          kind: 'prose',
          text: `${explanation.causalLaw}. Effective Decisions, Evidence and a versioned policy are the only inputs. Completion or activity is never used (completionOrActivityUsed = ${String(explanation.completionOrActivityUsed)}), and no institutional authority is inferred from a personal evaluation (institutionalAuthorityInferred = ${String(explanation.institutionalAuthorityInferred)}).`
        }
      }
    ]
  });

  return {
    key: `mastery:${row.id}:${row.revisionId}:${row.judgment}:${row.freshness}:${row.truthClass || 'none'}:${explanation.missingRefs.length}:${explanation.conflict}`,
    empty: false,
    header: {
      icon: 'mastery',
      title: show(row.capability),
      titleDir: 'ltr',
      sub: `Subject: ${show(row.subject)}`,
      pills
    },
    blocks
  };
}

export default describeMasteryRecord;
