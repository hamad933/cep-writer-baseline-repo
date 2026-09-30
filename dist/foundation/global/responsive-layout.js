export const NARROW_WORKSPACE_BREAKPOINT = 760;
export const RIGHT_PANE_RESPONSIVE_BREAKPOINT = 1180;
export const WORKSPACE_CENTER_FLOOR = 610;
export const WORKSPACE_RESPONSIVE_GUTTER = 22;

export const RESPONSIVE_LAYOUT_POLICY = Object.freeze({
  id: 'WorkspaceResponsiveLayoutPolicy',
  version: '1.1.0',
  narrowMaxInclusive: NARROW_WORKSPACE_BREAKPOINT,
  mediumMaxInclusive: RIGHT_PANE_RESPONSIVE_BREAKPOINT,
  projectedCenterFloor: WORKSPACE_CENTER_FLOOR,
  projectedCenterGutter: WORKSPACE_RESPONSIVE_GUTTER
});

function finite(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function resolveWorkspaceResponsiveBand(viewportWidth, options = {}) {
  const width = finite(viewportWidth, 1440);
  const leftPreferredState = options.leftPreferredState === 'collapsed' ? 'collapsed' : 'open';
  const leftPreferredWidth = finite(options.leftPreferredWidth, 304);
  const leftDocked = leftPreferredState === 'open' ? Math.max(0, leftPreferredWidth) : 0;
  const projectedCenter = width - leftDocked - WORKSPACE_RESPONSIVE_GUTTER;
  if (width <= NARROW_WORKSPACE_BREAKPOINT || projectedCenter < WORKSPACE_CENTER_FLOOR) return 'narrow';
  if (width <= RIGHT_PANE_RESPONSIVE_BREAKPOINT) return 'medium';
  return 'wide';
}

export function isPaneResponsiveSuppressed(side, viewportWidth, options = {}) {
  const band = resolveWorkspaceResponsiveBand(viewportWidth, options);
  if (band === 'narrow') return side === 'left' || side === 'right';
  if (band === 'medium') return side === 'right';
  return false;
}
