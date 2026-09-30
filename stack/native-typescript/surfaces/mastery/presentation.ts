/**
 * W04 Mastery — surface-specific CENTER record composition (defects D9 / D10 / M1 / M2).
 *
 * Reference: `03_MASTERY/Arabic Cybersecurity Mastery Dashboard.png`
 * (CURRENT_FINAL_REFERENCE `7784568e`). Read from the pixels, its CENTER is four moves and
 * nothing else:
 *   1. target title + two status cards (`Mastery Judgment` green / `Freshness Status` amber);
 *   2. `Subject:` line;
 *   3. one explanatory banner stating the rule the evaluation obeys;
 *   4. a **numbered 5-step explainability ladder** — policy → decisions → evidence →
 *      integrity/conflict → prose basis — with tables in the middle steps and connector
 *      arrows between them.
 *
 * This file composes exactly that ladder and nothing else in CENTER when a Mastery State is
 * bound: the header pills carry judgment + freshness, the info banner carries the causal law,
 * and the ladder carries the basis. Identity, authority and the shape of a re-evaluation
 * request are CONTEXT and live in the RIGHT lens (see `composition.ts`), never a second copy
 * of the record (CEP-VIS-001-FINAL: ONE INFORMATION ITEM -> ONE AUTHORITATIVE DISPLAY
 * LOCATION).
 *
 * M1: while no governed Mastery State exists, `NOT_EVALUATED` is the authoritative epistemic
 *     state and is rendered as the judgment pill — never as a bare `EMPTY` token. The entry
 *     state has no `steps` ladder (there is nothing to explain yet) but is still fully
 *     composed: epistemic-state notice → judgment dimension → how a Mastery State is produced
 *     → evaluation basis + binding truth side by side.
 * M2: a row whose `truthClass` is `SYNTHETIC_DEMO_SEED` carries a visible FIXTURE badge and an
 *     explicit fixture notice, so a fixture result can never read as real consumer mastery.
 *
 * Nothing here is invented: judgment/freshness come from the `MASTERY_JUDGMENTS` /
 * `MASTERY_FRESHNESS` vocabularies, resolution states from `W04MasteryDomain.explain()`, and
 * absent values render informative unavailable tokens (governance §6/§7). Chrome labels are
 * bilingual (./i18n.ts); governed vocabulary and technical tokens are never translated.
 */

import {activeLocale, pickText, fill} from './i18n.js';
import {MASTERY_AUTHORITY_REF, MASTERY_CAUSAL_LAW} from '../../adapters/mastery/domain.js';

const CAUSAL_LAW = MASTERY_CAUSAL_LAW;

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

function fixtureNotice(t) {
  return {
    kind: 'notice',
    id: 'fixture-notice',
    tone: 'warning',
    title: t.fixtureTitle,
    body: t.fixtureBody
  };
}

/**
 * ENTRY STATE — no governed Mastery State exists.
 *
 * The reference's CENTER is a record ladder; with no record there is nothing to explain yet
 * (M1: no `steps` ladder without a Mastery State), but the pane must still be COMPOSED and
 * intentionally dense rather than a lone notice over blank space. Order follows the
 * reference's hierarchy: epistemic status → where the judgment sits → how a Mastery State is
 * produced → the two truth lists side by side.
 */
export function describeMasteryEmpty() {
  const t = pickText(activeLocale());
  return {
    key: `mastery:EMPTY:${t.emptyTitle}`,
    empty: true,
    header: {
      icon: 'mastery',
      title: t.emptyTitle,
      titleDir: 'auto',
      sub: t.emptySub,
      pills: [
        { label: t.pillJudgment, value: 'NOT_EVALUATED', tone: 'muted', badge: null },
        { label: t.pillFreshness, value: 'UNAVAILABLE', tone: 'muted', note: t.noteNoEvaluation }
      ]
    },
    blocks: [
      {
        kind: 'notice',
        id: 'm1-empty',
        tone: 'info',
        title: t.noticeEmptyTitle,
        body: t.noticeEmptyBody
      },
      {
        kind: 'grid',
        id: 'judgment',
        title: t.judgmentTitle,
        cells: JUDGMENT_VOCABULARY.map(value => ({
          label: value,
          value: value === 'NOT_EVALUATED' ? t.judgmentCurrent : t.judgmentNotReached,
          tone: value === 'NOT_EVALUATED' ? 'warning' : 'muted'
        }))
      },
      {
        kind: 'track',
        id: 'pipeline',
        title: t.pipelineTitle,
        steps: [
          { label: t.stepDecisions, state: 'future' },
          { label: t.stepEvidence, state: 'future' },
          { label: t.stepPolicy, state: 'future' },
          { label: t.stepEvaluator, state: 'future' },
          { label: t.stepMastery, state: 'future' }
        ],
        next: [
          { text: t.nextEvaluator, tone: 'danger' },
          { text: t.nextFreshness, tone: 'warning' },
          { text: t.nextCompletion, tone: 'neutral' }
        ]
      },
      {
        kind: 'split',
        id: 'truth',
        left: {
          kind: 'rows',
          id: 'basis',
          title: t.basisTitle,
          rows: [
            { label: t.rowPolicyRevision, value: t.valueNoPolicy, dir: 'auto', tone: 'muted' },
            { label: t.rowDecisions, value: t.valueNoneBound, dir: 'auto', tone: 'muted' },
            { label: t.rowEvidence, value: t.valueNoneBound, dir: 'auto', tone: 'muted' },
            { label: t.rowDigest, value: t.valueNotComputed, dir: 'auto', tone: 'muted' }
          ]
        },
        right: {
          kind: 'rows',
          id: 'binding',
          title: t.bindingTitle,
          rows: [
            { label: t.rowAuthority, value: MASTERY_AUTHORITY_REF, dir: 'ltr', mono: true },
            { label: t.fCausalLaw, value: CAUSAL_LAW, dir: 'ltr', mono: true, tone: 'muted' },
            { label: t.rowEvaluator, value: t.valueUnbound, dir: 'auto', tone: 'warning' },
            { label: t.rowWriter, value: t.valueWriterUnbound, dir: 'auto', tone: 'muted' }
          ]
        }
      }
    ]
  };
}

export function describeMasteryRecord(domain, selectedId) {
  const locale = activeLocale();
  const t = pickText(locale);
  const row = domain.inspect(selectedId);
  const explanation = domain.explain(selectedId);
  const fixture = row.truthClass === 'SYNTHETIC_DEMO_SEED';
  const judgmentTone = JUDGMENT_TONE[row.judgment] || 'muted';
  const freshnessTone = FRESHNESS_TONE[row.freshness] || 'muted';
  const decisions = explanation.decisions || [];
  const evidence = explanation.evidence || [];

  const pills = [
    { label: t.pillJudgment, value: show(row.judgment), tone: judgmentTone, badge: fixture ? 'FIXTURE' : null },
    { label: t.pillFreshness, value: show(row.freshness), tone: freshnessTone, badge: null }
  ];

  const blocks = [];
  if (fixture) blocks.push(fixtureNotice(t));

  /* Reference banner (move 3): the single rule the evaluation obeys, stated once. */
  blocks.push({ kind: 'notice', id: 'causal-law', tone: 'info', title: t.bannerTitle, body: t.bannerBody });

  /* Reference ladder (move 4): exactly five numbered steps, tables in the middle two. */
  const resolutionRows = (list, emptyText) => list.length
    ? list.map(item => ({
      cells: [
        { text: item.ref, dir: 'ltr', mono: true, tone: item.state === 'RESOLVED' ? 'link' : 'muted' },
        { text: item.state, dir: 'ltr', tone: item.state === 'RESOLVED' ? 'success' : 'warning', sub: item.reason || null }
      ]
    }))
    : [{ cells: [{ text: 'EMPTY', dir: 'ltr', tone: 'muted' }, { text: emptyText, dir: 'auto', tone: 'muted' }] }];

  blocks.push({
    kind: 'steps',
    id: 'explainability',
    title: t.explainabilityTitle,
    items: [
      {
        number: 1,
        title: t.step1Title,
        body: {
          kind: 'rows',
          rows: [
            { label: t.rowPolicy, value: show(row.policyRef), dir: 'ltr', mono: true, tone: 'link' },
            { label: t.rowPolicyResolution, value: show(explanation.policy?.state, 'EMPTY'), dir: 'ltr', tone: explanation.policy?.state === 'RESOLVED' ? 'success' : 'warning' },
            { label: t.rowPolicySet, value: show(row.capability), dir: 'ltr' }
          ]
        }
      },
      {
        number: 2,
        title: t.step2Title,
        body: { kind: 'table', columns: [t.colDecisionRef, t.colResolution], rows: resolutionRows(decisions, t.noDecisions) }
      },
      {
        number: 3,
        title: t.step3Title,
        body: { kind: 'table', columns: [t.colEvidenceRef, t.colResolution], rows: resolutionRows(evidence, t.noEvidence) }
      },
      {
        number: 4,
        title: t.step4Title,
        body: {
          kind: 'rows',
          rows: [
            { label: t.rowDigest, value: show(row.basis?.digest), dir: 'ltr', mono: true },
            { label: t.rowUnresolved, value: explanation.missingRefs.length ? explanation.missingRefs.join(', ') : t.noneResolved, dir: 'ltr', tone: explanation.missingRefs.length ? 'warning' : 'success' },
            { label: t.rowConflict, value: explanation.conflict ? t.conflictObserved : t.noConflict, dir: 'auto', tone: explanation.conflict ? 'danger' : 'success' },
            { label: t.rowRecorded, value: String(domain.history.filter(item => item.recordId === row.id).length), dir: 'ltr' },
            { label: t.rowTruthClass, value: show(row.truthClass, t.truthClassProvider), dir: 'ltr', tone: row.truthClass === 'SYNTHETIC_DEMO_SEED' ? 'warning' : 'muted' }
          ]
        }
      },
      {
        number: 5,
        title: t.step5Title,
        body: {
          kind: 'prose',
          text: fill(t.basisText, {
            digest: show(row.basis?.digest),
            decisions: String(decisions.length),
            evidence: String(evidence.length),
            policy: show(row.policyRef),
            completion: String(explanation.completionOrActivityUsed),
            authority: String(explanation.institutionalAuthorityInferred)
          })
        }
      }
    ]
  });

  return {
    key: `mastery:${row.id}:${row.revisionId}:${row.judgment}:${row.freshness}:${row.truthClass || 'none'}:${explanation.missingRefs.length}:${explanation.conflict}:${locale}`,
    empty: false,
    header: {
      icon: 'mastery',
      title: show(row.capability),
      titleDir: 'ltr',
      sub: fill(t.subjectPrefix, { name: show(row.subject) }),
      pills
    },
    blocks
  };
}

export default describeMasteryRecord;
