/* W05-BACKUP · surface-owned icon set.
 *
 * Inline SVG (16×16, stroke-based) instead of emoji: emoji render differently per platform and
 * read as decoration in an operations surface (professional-ui-ux R7/R13). Icons are decorative
 * (aria-hidden) and always accompany a text label — they never carry meaning alone.
 */

const P                         = {
  shield: '<path d="M8 1.6l5.4 2v4.1c0 3.2-2.2 5.7-5.4 6.7-3.2-1-5.4-3.5-5.4-6.7V3.6z"/>',
  shieldCheck: '<path d="M8 1.6l5.4 2v4.1c0 3.2-2.2 5.7-5.4 6.7-3.2-1-5.4-3.5-5.4-6.7V3.6z"/><path d="M5.6 8l1.8 1.8L10.6 6.6"/>',
  database: '<ellipse cx="8" cy="4" rx="5" ry="2.2"/><path d="M3 4v8c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V4"/><path d="M3 8c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2"/>',
  layers: '<path d="M8 1.8l6 2.9-6 2.9-6-2.9z"/><path d="M2 8.2l6 2.9 6-2.9"/><path d="M2 11.4l6 2.9 6-2.9"/>',
  key: '<circle cx="5.4" cy="10.6" r="3.1"/><path d="M7.7 8.3L13.2 2.8"/><path d="M11.4 4.6l1.7 1.7"/><path d="M13.1 2.9l1.5 1.5"/>',
  box: '<path d="M8 1.8l5.6 3v6.4L8 14.2 2.4 11.2V4.8z"/><path d="M2.4 4.8L8 7.8l5.6-3"/><path d="M8 7.8v6.4"/>',
  lock: '<rect x="3.4" y="7" width="9.2" height="7.2" rx="1.6"/><path d="M5.6 7V5.1a2.4 2.4 0 0 1 4.8 0V7"/>',
  ban: '<circle cx="8" cy="8" r="5.6"/><path d="M4.1 11.9l7.8-7.8"/>',
  checkCircle: '<circle cx="8" cy="8" r="6"/><path d="M5.3 8.2l1.9 1.9 3.6-4"/>',
  clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.4V8l2.6 1.6"/>',
  target: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.6" fill="currentColor"/>',
  alert: '<path d="M8 2.2l6.2 11.2H1.8z"/><path d="M8 6.4v3.2"/><circle cx="8" cy="11.6" r="0.7" fill="currentColor" stroke="none"/>',
  info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.4v4"/><circle cx="8" cy="5" r="0.7" fill="currentColor" stroke="none"/>',
  calendar: '<rect x="2.4" y="3.4" width="11.2" height="10.2" rx="1.6"/><path d="M2.4 6.6h11.2"/><path d="M5.4 1.9v3"/><path d="M10.6 1.9v3"/>',
  search: '<circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3L14 14"/>',
  activity: '<path d="M1.6 8.4h2.8l1.9-4.8 3 9.4 1.9-4.6h3.2"/>',
  signature: '<path d="M2.6 11.4c1.6-3.4 2.6-1.2 4.2-2.4 1.6-1.2 2.4.9 4-.4"/><path d="M2.6 13.6h10.8"/><path d="M4.6 8.2c1.4-3.2 2.4-5.4 3.4-5.4 1.4 0 .6 4.4 2 4.4 1 0 1.4-1.4 1.4-1.4"/>',
  file: '<path d="M4 1.9h5l3.2 3.2v9H4z"/><path d="M9 1.9v3.3h3.2"/><path d="M6 8.6h4"/><path d="M6 11h4"/>',
  chevron: '<path d="M6 3.4L10.6 8L6 12.6"/>',
  server: '<rect x="2.2" y="2.6" width="11.6" height="4.6" rx="1.4"/><rect x="2.2" y="8.8" width="11.6" height="4.6" rx="1.4"/><circle cx="5" cy="4.9" r="0.7" fill="currentColor" stroke="none"/><circle cx="5" cy="11.1" r="0.7" fill="currentColor" stroke="none"/>',
  route: '<circle cx="4" cy="4" r="2.2"/><circle cx="12" cy="12" r="2.2"/><path d="M4 6.2v3.4a2.4 2.4 0 0 0 2.4 2.4h3.3"/>',
  gauge: '<path d="M2.4 11.8a6.2 6.2 0 1 1 11.2 0"/><path d="M8 11.6L10.9 7"/>',
  dot: '<circle cx="8" cy="8" r="3" fill="currentColor" stroke="none"/>'
};

export const icon = (name        , size = 15)         => {
  const path = P[name] || P.dot;
  return `<svg class="bk-i" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
};

/** Nine verification-check icons (one per check, in pipeline order). */
export const CHECK_ICONS = ['shieldCheck', 'file', 'database', 'key', 'layers', 'box', 'lock', 'ban', 'checkCircle'];
/** Eight pipeline-stage markers. */
export const STAGE_ICONS = ['box', 'shieldCheck', 'server', 'database', 'activity', 'target', 'layers', 'checkCircle'];
