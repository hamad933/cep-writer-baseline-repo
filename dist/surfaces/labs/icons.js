/**
 * W03-LABS · local icon set (surface-specific presentation).
 *
 * Stroke icons on a 16×16 grid so optical weight is identical across the structure pane,
 * the palette, the board and the context rows. Icons are never used as the only carrier of
 * meaning — every icon sits next to a localized label or an accessible name.
 */
import {esc} from './i18n.js';

const P                      ={
  overview:'<path d="M3.2 2.4h6.1l3.5 3.4v7.8H3.2z"/><path d="M9.2 2.4v3.5h3.5"/>',
  knowledge:'<path d="M6.6 9.4 9.4 6.6"/><path d="M7.4 4.7 9 3.1a2.6 2.6 0 0 1 3.7 3.7L11 8.4"/><path d="M8.6 11.3 7 12.9a2.6 2.6 0 0 1-3.7-3.7L5 7.6"/>',
  environment:'<rect x="2.4" y="3" width="11.2" height="4.2" rx="1.2"/><rect x="2.4" y="8.8" width="11.2" height="4.2" rx="1.2"/><path d="M4.8 5.1h.01M4.8 10.9h.01"/>',
  initial:'<path d="M8 2.6a5.4 5.4 0 1 1-5.4 5.4"/><path d="M2.6 5.6V8h2.4"/><path d="M8 5.4V8l1.9 1.4"/>',
  graph:'<circle cx="4" cy="4.4" r="1.8"/><circle cx="12" cy="4.4" r="1.8"/><circle cx="8" cy="11.6" r="1.8"/><path d="M5.5 5.7 7 10M10.5 5.7 9 10M5.8 4.4h4.4"/>',
  tools:'<path d="M10.4 2.6a3.3 3.3 0 0 0 3 4.6l-6.7 6.7a1.6 1.6 0 0 1-2.3-2.3l6.7-6.7a3.3 3.3 0 0 0-.7-2.3z"/>',
  signals:'<path d="M1.8 8.2h2.6l1.7-4.6 2.4 9 1.7-5.3 1.1 2.4h2.9"/>',
  validation:'<circle cx="8" cy="8" r="5.6"/><path d="m5.5 8.2 1.8 1.8 3.3-3.7"/>',
  safety:'<path d="M8 2.3 13 4.3v3.4c0 3.1-2.1 5.4-5 6.3-2.9-.9-5-3.2-5-6.3V4.3z"/><path d="m6 8 1.5 1.5L10.3 6.7"/>',
  result:'<ellipse cx="8" cy="4.2" rx="4.8" ry="2"/><path d="M3.2 4.2v7.6c0 1.1 2.1 2 4.8 2s4.8-.9 4.8-2V4.2"/><path d="M3.2 8c0 1.1 2.1 2 4.8 2s4.8-.9 4.8-2"/>',
  completion:'<rect x="3.4" y="3" width="9.2" height="10.6" rx="1.6"/><path d="M6 3.2V2.4h4v.8"/><path d="m6.1 8.6 1.4 1.4 2.6-3"/>',
  select:'<path d="M4 2.6 12.4 7.9l-3.6.7-1.4 3.4z"/>',
  plus:'<rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.4"/><path d="M8 5.6v4.8M5.6 8h4.8"/>',
  connect:'<circle cx="4" cy="12" r="1.9"/><circle cx="12" cy="4" r="1.9"/><path d="M5.4 10.6 10.6 5.4"/>',
  branch:'<circle cx="4.4" cy="3.8" r="1.8"/><circle cx="4.4" cy="12.2" r="1.8"/><circle cx="11.6" cy="6.4" r="1.8"/><path d="M4.4 5.6v4.8M4.4 8.4h4a3.2 3.2 0 0 0 3.2-0.2"/>',
  save:'<path d="M3.2 3.2h7.4l2.2 2.2v7.4H3.2z"/><path d="M5.6 3.2v3.4h4.8V3.2M5.6 12.8V9.4h4.8v3.4"/>',
  shieldCheck:'<path d="M8 2.3 13 4.3v3.4c0 3.1-2.1 5.4-5 6.3-2.9-.9-5-3.2-5-6.3V4.3z"/><path d="m6 8 1.5 1.5L10.3 6.7"/>',
  publish:'<path d="M8 11.6V3.2"/><path d="m4.8 6.2 3.2-3 3.2 3"/><path d="M2.8 12.4v1.2h10.4v-1.2"/>',
  run:'<rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.4"/><path d="m6.6 5.6 4 2.4-4 2.4z"/>',
  more:'<circle cx="3.6" cy="8" r="1.05"/><circle cx="8" cy="8" r="1.05"/><circle cx="12.4" cy="8" r="1.05"/>',
  target:'<circle cx="8" cy="8" r="5.6"/><circle cx="8" cy="8" r="2.3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6"/>',
  capability:'<rect x="4.4" y="4.4" width="7.2" height="7.2" rx="1.6"/><path d="M6.4 1.8v2.6M9.6 1.8v2.6M6.4 11.6v2.6M9.6 11.6v2.6M1.8 6.4h2.6M1.8 9.6h2.6M11.6 6.4h2.6M11.6 9.6h2.6"/>',
  link:'<path d="M6.6 9.4 9.4 6.6"/><path d="M7.4 4.7 9 3.1a2.6 2.6 0 0 1 3.7 3.7L11 8.4"/><path d="M8.6 11.3 7 12.9a2.6 2.6 0 0 1-3.7-3.7L5 7.6"/>',
  check:'<path d="m3.4 8.4 3 3 6.2-6.8"/>',
  info:'<circle cx="8" cy="8" r="5.6"/><path d="M8 7.4v3.4M8 5.2h.01"/>',
  chevron:'<path d="m4.6 6.2 3.4 3.4 3.4-3.4"/>',
  close:'<path d="m4.4 4.4 7.2 7.2M11.6 4.4l-7.2 7.2"/>',
  cursor:'<path d="M4 2.6 12.4 7.9l-3.6.7-1.4 3.4z"/>'
};

export const icon=(name       ,size=16,extraClass='')=>{
  const d=P[name]||P.info;
  return `<svg class="ico${extraClass?' '+extraClass:''}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
};

/** Directional/bracketed technical tokens are isolated so BIDI never reorders identifiers. */
export const bdi=(value    ,dir            ='ltr')=>`<bdi dir="${dir}">${esc(value)}</bdi>`;
