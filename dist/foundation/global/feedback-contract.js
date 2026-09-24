export const ACCESSIBILITY_FEEDBACK_OWNER = 'AccessibilityFeedbackOwner';

export const ACCESSIBILITY_FEEDBACK_CHANNELS = Object.freeze([
  'announcement',
  'status',
  'toast',
  'tooltip'
]);

export const ACCESSIBILITY_FEEDBACK_OUTCOMES = Object.freeze([
  'info',
  'success',
  'warning',
  'unavailable',
  'failure',
  'error'
]);

export const ACCESSIBILITY_FEEDBACK_POLICY = Object.freeze({
  id: 'AccessibilityFeedbackPolicy',
  owner: ACCESSIBILITY_FEEDBACK_OWNER,
  revision: 'w3b-accessibility-feedback-v1',
  dedupeWindowMs: 1200,
  maxActive: 8,
  lifetimeMs: Object.freeze({
    announcement: 1800,
    status: 3200,
    toast: 4200,
    tooltip: 2600
  }),
  politeness: Object.freeze({
    info: 'polite',
    success: 'polite',
    warning: 'polite',
    unavailable: 'polite',
    failure: 'assertive',
    error: 'assertive'
  }),
  liveRegions: Object.freeze({
    polite: Object.freeze({ role: 'status', ariaLive: 'polite', ariaAtomic: 'true' }),
    assertive: Object.freeze({ role: 'alert', ariaLive: 'assertive', ariaAtomic: 'true' })
  }),
  tooltip: Object.freeze({ role: 'tooltip', live: false })
});

export const ACCESSIBILITY_FEEDBACK_CONTRACT = Object.freeze({
  id: ACCESSIBILITY_FEEDBACK_OWNER,
  version: '1.0.1',
  owner: ACCESSIBILITY_FEEDBACK_OWNER,
  kind: 'presentation-projection-only',
  canonicalTruth: false,
  focusOwnership: false,
  transientStackOwnership: false,
  channels: ACCESSIBILITY_FEEDBACK_CHANNELS,
  outcomes: ACCESSIBILITY_FEEDBACK_OUTCOMES,
  policyRevision: ACCESSIBILITY_FEEDBACK_POLICY.revision,
  sourceTruthValidation: 'explicit-contradiction-refusal'
});

const successStatuses = new Set(['PASS', 'SUCCESS', 'SUCCEEDED', 'APPLIED', 'SAVED', 'PERSISTED', 'COMMITTED']);
const failureStatuses = new Set(['FAIL', 'FAILED', 'ERROR', 'REJECTED']);

export function normalizeFeedbackText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) throw new Error('FEEDBACK_ACCESSIBLE_TEXT_REQUIRED');
  return text;
}

const truthSignal = (sourceTruth) => {
  const status = String(sourceTruth.status ?? '').trim().toUpperCase();
  const positive = [];
  const negative = [];
  if (sourceTruth.ok === true) positive.push('ok:true');
  if (sourceTruth.ok === false) negative.push('ok:false');
  if (successStatuses.has(status)) positive.push(`status:${status}`);
  if (failureStatuses.has(status)) negative.push(`status:${status}`);
  if (sourceTruth.error) negative.push('error:present');
  return Object.freeze({ status, positive: Object.freeze(positive), negative: Object.freeze(negative) });
};

export function assertFeedbackSourceTruth(outcome, sourceTruth) {
  if (!sourceTruth || typeof sourceTruth !== 'object' || Array.isArray(sourceTruth)) {
    throw new Error('FEEDBACK_SOURCE_TRUTH_REQUIRED');
  }
  const signal = truthSignal(sourceTruth);
  if (signal.positive.length && signal.negative.length) {
    throw new Error(`FEEDBACK_SOURCE_TRUTH_CONTRADICTION:${signal.positive.join('+')}|${signal.negative.join('+')}`);
  }
  if (outcome === 'success' && !signal.positive.length) {
    throw new Error('FEEDBACK_TRUTH_CONFLICT:SUCCESS_NOT_PROVEN');
  }
  if ((outcome === 'failure' || outcome === 'error') && !signal.negative.length) {
    throw new Error('FEEDBACK_TRUTH_CONFLICT:FAILURE_NOT_PROVEN');
  }
  if (outcome === 'unavailable' && sourceTruth.enabled !== false) {
    throw new Error('FEEDBACK_TRUTH_CONFLICT:UNAVAILABLE_NOT_PROVEN');
  }
  return sourceTruth;
}

export function resolveFeedbackSemantics({ channel, outcome }, policy = ACCESSIBILITY_FEEDBACK_POLICY) {
  if (!ACCESSIBILITY_FEEDBACK_CHANNELS.includes(channel)) throw new Error(`INVALID_FEEDBACK_CHANNEL:${channel}`);
  if (!ACCESSIBILITY_FEEDBACK_OUTCOMES.includes(outcome)) throw new Error(`INVALID_FEEDBACK_OUTCOME:${outcome}`);
  const lifetimeMs = Number(policy.lifetimeMs?.[channel]);
  const politeness = channel === 'tooltip' ? 'off' : policy.politeness?.[outcome];
  if (!Number.isFinite(lifetimeMs) || lifetimeMs < 0) throw new Error(`INVALID_FEEDBACK_LIFETIME:${channel}`);
  if (!['polite', 'assertive', 'off'].includes(politeness)) throw new Error(`INVALID_FEEDBACK_POLITENESS:${outcome}`);
  return Object.freeze({ channel, outcome, lifetimeMs, politeness, announce: politeness !== 'off' });
}

export function feedbackFingerprint({ channel, outcome, message, sourceFamily, dedupeKey }) {
  return String(dedupeKey || `${channel}|${outcome}|${sourceFamily}|${message}`);
}
