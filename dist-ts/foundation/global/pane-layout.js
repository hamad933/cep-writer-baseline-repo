import {
  isPaneResponsiveSuppressed,
  resolveWorkspaceResponsiveBand
} from './responsive-layout.js';

export const WORKSPACE_PANE_LAYOUT_OWNER = 'WorkspacePaneLayoutOwner';
export const WORKSPACE_PANE_BRIDGE_SYMBOL = 'cep.foundation.WorkspacePaneLayoutOwner';

export const WORKSPACE_PANE_STATE_CONTRACT = Object.freeze({
  id: 'WorkspacePaneStateContract',
  version: '1.2.0',
  owner: WORKSPACE_PANE_LAYOUT_OWNER,
  persisted: Object.freeze(['preferredState', 'preferredWidth']),
  projectedOnly: Object.freeze(['effectiveState', 'effectiveWidth', 'mode', 'responsiveBand', 'resizeAvailability', 'focusMode', 'responsiveOverride', 'resizeLimits'])
});

export const WORKSPACE_PANE_WIDTH_LIMITS = Object.freeze({
  left: Object.freeze({ min: 1, max: 420, step: 12, collapseThreshold: 24 }),
  right: Object.freeze({ min: 1, max: 520, step: 12, collapseThreshold: 24 })
});

const RUNTIME_LIMITS = Object.freeze({
  left: Object.freeze({ min: 0, max: 420, collapseThreshold: 24 }),
  right: Object.freeze({ min: 0, max: 520, collapseThreshold: 24 })
});

function assertPaneSide(side, errorCode = 'INVALID_PANE_SIDE') {
  if (side !== 'left' && side !== 'right') throw new Error(errorCode);
  return side;
}

function assertPaneState(state) {
  if (state !== 'open' && state !== 'collapsed') throw new Error('INVALID_PANE_STATE');
  return state;
}

function widthKey(side) {
  return assertPaneSide(side) === 'left' ? 'leftWidth' : 'rightWidth';
}

function finite(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizedSnapshot(input = {}) {
  const preferred = input.preferred || {};
  const widths = input.widths || {};
  const overrides = input.overrides || {};
  return {
    viewportWidth: finite(input.viewportWidth, 1440),
    focusMode: Boolean(input.focusMode),
    preferred: {
      left: preferred.left === 'collapsed' ? 'collapsed' : 'open',
      right: preferred.right === 'collapsed' ? 'collapsed' : 'open'
    },
    widths: {
      left: Math.max(1, finite(widths.left, 304)),
      right: Math.max(1, finite(widths.right, 420))
    },
    overrides: {
      medium: {
        left: overrides.medium?.left === 'open' || overrides.medium?.left === 'collapsed' ? overrides.medium.left : null,
        right: overrides.medium?.right === 'open' || overrides.medium?.right === 'collapsed' ? overrides.medium.right : null
      },
      narrow: {
        left: overrides.narrow?.left === 'open' || overrides.narrow?.left === 'collapsed' ? overrides.narrow.left : null,
        right: overrides.narrow?.right === 'open' || overrides.narrow?.right === 'collapsed' ? overrides.narrow.right : null
      }
    }
  };
}

function resolveBand(snapshot) {
  const s = normalizedSnapshot(snapshot);
  return resolveWorkspaceResponsiveBand(s.viewportWidth, {
    leftPreferredState: s.preferred.left,
    leftPreferredWidth: s.widths.left
  });
}

function effectiveState(snapshot, side) {
  const key = assertPaneSide(side);
  const s = normalizedSnapshot(snapshot);
  if (s.focusMode) return 'collapsed';
  const band = resolveBand(s);
  if (band === 'wide') return s.preferred[key];
  const override = s.overrides[band]?.[key];
  if (override) return override;
  if (band === 'medium') return key === 'left' ? s.preferred.left : 'collapsed';
  return 'collapsed';
}

function paneLimits(snapshot, side) {
  const key = assertPaneSide(side);
  const s = normalizedSnapshot(snapshot);
  const base = RUNTIME_LIMITS[key];
  const band = resolveBand(s);
  if (band !== 'wide') return { ...base, max: Math.max(base.min, Math.min(base.max, s.viewportWidth - 48)) };
  const other = key === 'left' ? 'right' : 'left';
  const otherOpen = effectiveState(s, other) === 'open';
  const otherWidth = otherOpen ? s.widths[other] : 42;
  const dynamicMax = Math.max(base.min, s.viewportWidth - otherWidth - 520 - 22);
  return { ...base, max: Math.min(base.max, dynamicMax) };
}

function effectiveWidths(snapshot) {
  const s = normalizedSnapshot(snapshot);
  return Object.fromEntries(['left', 'right'].map((side) => {
    const limits = paneLimits(s, side);
    return [side, clamp(s.widths[side], 1, limits.max)];
  }));
}

function paneMode(snapshot, side) {
  const key = assertPaneSide(side);
  const s = normalizedSnapshot(snapshot);
  const effective = effectiveState(s, key);
  if (effective !== 'open') return 'collapsed';
  const band = resolveBand(s);
  if (band === 'narrow' || (band === 'medium' && key === 'right')) return 'overlay';
  return 'docked';
}

function overlayPane(snapshot) {
  const s = normalizedSnapshot(snapshot);
  const band = resolveBand(s);
  if (s.focusMode) return '';
  if (band === 'medium' && effectiveState(s, 'right') === 'open') return 'right';
  if (band === 'narrow') {
    if (effectiveState(s, 'right') === 'open') return 'right';
    if (effectiveState(s, 'left') === 'open') return 'left';
  }
  return '';
}

function resizeAvailable(snapshot, side) {
  const key = assertPaneSide(side);
  const s = normalizedSnapshot(snapshot);
  return !s.focusMode && effectiveState(s, key) === 'open';
}

function transition(snapshot, side, next, { preferred = null } = {}) {
  const key = assertPaneSide(side);
  const value = assertPaneState(next);
  const s = normalizedSnapshot(snapshot);
  const band = resolveBand(s);
  const result = { band, preferredPatch: null, overrides: structuredClone(s.overrides) };
  if (preferred === true || band === 'wide') {
    result.preferredPatch = { side: key, value };
  } else {
    result.overrides[band][key] = value;
    if (band === 'narrow' && value === 'open') {
      const other = key === 'left' ? 'right' : 'left';
      result.overrides[band][other] = 'collapsed';
    }
  }
  return result;
}

export const WORKSPACE_PANE_RUNTIME_BRIDGE = Object.freeze({
  owner: WORKSPACE_PANE_LAYOUT_OWNER,
  contract: WORKSPACE_PANE_STATE_CONTRACT,
  resolveBand,
  effectiveState,
  paneLimits,
  effectiveWidths,
  paneMode,
  overlayPane,
  resizeAvailable,
  transition
});

const bridgeKey = Symbol.for(WORKSPACE_PANE_BRIDGE_SYMBOL);
const existingBridge = globalThis[bridgeKey];
if (existingBridge && existingBridge.owner !== WORKSPACE_PANE_LAYOUT_OWNER) throw new Error('DUPLICATE_WORKSPACE_PANE_LAYOUT_OWNER');
globalThis[bridgeKey] = WORKSPACE_PANE_RUNTIME_BRIDGE;

export class WorkspacePaneLayoutOwner {
  constructor(preferences, options = {}) {
    if (!preferences || typeof preferences.resolve !== 'function' || typeof preferences.set !== 'function') {
      throw new Error('WORKSPACE_PANE_PREFERENCES_REQUIRED');
    }
    this.preferences = preferences;
    this.focusMode = false;
    this.viewportWidth = finite(options.viewportWidth, 1440);
    this.overrides = { medium: { left: null, right: null }, narrow: { left: null, right: null } };
    this.lastBand = this.responsiveBand(this.viewportWidth);
  }

  preferredState(side) {
    return assertPaneState(this.preferences.resolve(assertPaneSide(side)).preferredValue);
  }

  preferredWidth(side) {
    const key = assertPaneSide(side);
    const limits = WORKSPACE_PANE_WIDTH_LIMITS[key];
    return clamp(finite(this.preferences.resolve(widthKey(key)).preferredValue, key === 'left' ? 304 : 420), limits.min, limits.max);
  }

  runtimeSnapshot(viewportWidth = this.viewportWidth) {
    return normalizedSnapshot({
      viewportWidth,
      focusMode: this.focusMode,
      preferred: { left: this.preferredState('left'), right: this.preferredState('right') },
      widths: { left: this.preferredWidth('left'), right: this.preferredWidth('right') },
      overrides: this.overrides
    });
  }

  responsiveBand(viewportWidth = this.viewportWidth) {
    return resolveBand(this.runtimeSnapshot(viewportWidth));
  }

  setViewportWidth(viewportWidth) {
    this.viewportWidth = finite(viewportWidth, this.viewportWidth);
    const band = this.responsiveBand(this.viewportWidth);
    if (band !== this.lastBand && this.overrides[band]) {
      this.overrides[band] = { left: null, right: null };
    }
    this.lastBand = band;
    return this.snapshot(this.viewportWidth);
  }

  setFocusMode(enabled) {
    this.focusMode = Boolean(enabled);
    return this.snapshot(this.viewportWidth);
  }

  setPreferredState(side, state, scope = 'global') {
    const key = assertPaneSide(side, 'INVALID_PANE_STATE');
    this.preferences.set(key, assertPaneState(state), scope);
    this.overrides.medium[key] = null;
    this.overrides.narrow[key] = null;
    return this.snapshot(this.viewportWidth);
  }

  clampWidth(side, value, viewportWidth = this.viewportWidth) {
    const key = assertPaneSide(side);
    const limits = paneLimits(this.runtimeSnapshot(viewportWidth), key);
    const floor = WORKSPACE_PANE_WIDTH_LIMITS[key].min;
    return clamp(Math.round(finite(value, floor)), floor, Math.max(floor, limits.max));
  }

  setPreferredWidth(side, width, scope = 'global') {
    const key = assertPaneSide(side);
    const next = this.clampWidth(key, width);
    this.preferences.set(widthKey(key), next, scope);
    return this.snapshot(this.viewportWidth);
  }

  resizeBy(side, delta, scope = 'global') {
    const key = assertPaneSide(side);
    const limits = paneLimits(this.runtimeSnapshot(this.viewportWidth), key);
    const next = clamp(this.preferredWidth(key) + finite(delta, 0), 0, limits.max);
    if (next <= limits.collapseThreshold) return this.setEffectiveState(key, 'collapsed', { preferred: this.responsiveBand() === 'wide', scope });
    return this.setPreferredWidth(key, next, scope);
  }

  responsiveSuppressed(side, viewportWidth = this.viewportWidth) {
    const key = assertPaneSide(side);
    const s = this.runtimeSnapshot(viewportWidth);
    return isPaneResponsiveSuppressed(key, viewportWidth, {
      leftPreferredState: s.preferred.left,
      leftPreferredWidth: s.widths.left
    });
  }

  setEffectiveState(side, state, { preferred = null, scope = 'global' } = {}) {
    const key = assertPaneSide(side);
    const result = transition(this.runtimeSnapshot(this.viewportWidth), key, state, { preferred });
    if (result.preferredPatch) this.preferences.set(result.preferredPatch.side, result.preferredPatch.value, scope);
    this.overrides = result.overrides;
    return this.snapshot(this.viewportWidth);
  }

  toggle(side, viewportWidth = this.viewportWidth, scope = 'global') {
    const key = assertPaneSide(side);
    this.viewportWidth = finite(viewportWidth, this.viewportWidth);
    if (this.focusMode) return this.snapshot(this.viewportWidth);
    const next = this.effective(key, this.viewportWidth) === 'open' ? 'collapsed' : 'open';
    return this.setEffectiveState(key, next, { preferred: this.responsiveBand() === 'wide', scope });
  }

  reveal(side, viewportWidth = this.viewportWidth) {
    const key = assertPaneSide(side);
    this.viewportWidth = finite(viewportWidth, this.viewportWidth);
    if (!this.focusMode && this.responsiveSuppressed(key, this.viewportWidth)) return this.setEffectiveState(key, 'open', { preferred: false });
    return this.snapshot(this.viewportWidth);
  }

  dismissResponsiveReveal(side) {
    const key = assertPaneSide(side);
    const band = this.responsiveBand();
    if (band !== 'wide') this.overrides[band][key] = 'collapsed';
    return this.snapshot(this.viewportWidth);
  }

  projection(side, viewportWidth = globalThis.innerWidth || this.viewportWidth) {
    const key = assertPaneSide(side);
    const s = this.runtimeSnapshot(viewportWidth);
    const preferredState = s.preferred[key];
    const preferredWidth = s.widths[key];
    const effectiveStateValue = effectiveState(s, key);
    const mode = paneMode(s, key);
    const widths = effectiveWidths(s);
    const resize = resizeAvailable(s, key);
    const runtimeLimits = paneLimits(s, key);
    const configuredLimits = WORKSPACE_PANE_WIDTH_LIMITS[key];
    const resizeLimits = Object.freeze({
      min: configuredLimits.min,
      max: Math.max(configuredLimits.min, runtimeLimits.max),
      step: configuredLimits.step,
      collapseThreshold: configuredLimits.collapseThreshold
    });
    return {
      side: key,
      preferredState,
      effectiveState: effectiveStateValue,
      preferred: preferredState,
      effective: effectiveStateValue,
      mode,
      preferredWidth,
      effectiveWidth: widths[key],
      responsiveSuppressed: this.responsiveSuppressed(key, viewportWidth),
      responsiveOverride: this.overrides[resolveBand(s)]?.[key] || null,
      resizeLimits,
      resizeAvailability: { pointer: resize, keyboard: resize }
    };
  }

  effective(side, viewportWidth = globalThis.innerWidth || this.viewportWidth) {
    return this.projection(side, viewportWidth).effectiveState;
  }

  snapshot(viewportWidth = globalThis.innerWidth || this.viewportWidth) {
    this.viewportWidth = finite(viewportWidth, this.viewportWidth);
    const s = this.runtimeSnapshot(this.viewportWidth);
    return {
      contract: WORKSPACE_PANE_STATE_CONTRACT,
      responsiveBand: resolveBand(s),
      viewportWidth: this.viewportWidth,
      focusMode: this.focusMode,
      overlayPane: overlayPane(s),
      left: this.projection('left', this.viewportWidth),
      right: this.projection('right', this.viewportWidth)
    };
  }
}
