/**
 * W04 Portfolio — LEFT pane composition (saved views + reference index tone).
 *
 * The reference's structure pane is a *navigation* pane: a `Saved Views` group, a
 * `Curated Views` group and the active curated view — not an evidence-intake queue.
 * The shared W04 left enhancer emits ONE segment set for all four W04 surfaces and it carries
 * Evidence vocabulary (`Submitted / Returned / Prepared / Admitted`) with zero counts and a
 * filter token this domain can never match, which would leave dead controls on Portfolio.
 *
 * Rather than editing the shared enhancer (owned by W04-EVIDENCE; governance R6 — request, do
 * not stomp), Portfolio owns its own inline presentation inside the shared pane:
 *   · a real saved-view navigation, each entry a LIVE filter over the collection
 *     (label + count derived from the domain — nothing decorative, nothing invented);
 *   · a per-row source-state tone derived from the domain, so `RESOLVABLE / SUPERSEDED /
 *     UNAVAILABLE` are distinguishable at a glance (defect D9 treatment).
 *
 * Both are idempotent and key-guarded: a full left-region re-render (which happens on every
 * m0 render) simply re-installs them. The observer is childList-only — the same observation
 * type the shared enhancer uses — so attribute writes can never ping-pong.
 *
 * Copy is localized through `./i18n.ts`; counts and state tokens are language-independent.
 */

import { portfolioCopy } from './i18n.js';

type LeftDomain = {
  records: any[];
  filterText?: string;
  matches?: (row: any, query: string) => boolean;
};

type LeftCollection = { setFilter: (query: string) => void };

type CopyKey = 'vAll' | 'vEvidence' | 'vMastery' | 'vProject' | 'vUnresolved' | 'vAuthorityPending';

const SAVED_VIEWS = Object.freeze([
  Object.freeze({ query: '', key: 'vAll' as CopyKey }),
  Object.freeze({ query: 'Evidence', key: 'vEvidence' as CopyKey }),
  Object.freeze({ query: 'Mastery', key: 'vMastery' as CopyKey }),
  Object.freeze({ query: 'Project', key: 'vProject' as CopyKey })
]);

const CURATED_VIEWS = Object.freeze([
  Object.freeze({ query: 'UNAVAILABLE', key: 'vUnresolved' as CopyKey }),
  Object.freeze({ query: 'AUTHORITY_PENDING', key: 'vAuthorityPending' as CopyKey })
]);

const STATE_TONE: Record<string, string> = Object.freeze({
  RESOLVABLE: 'success',
  SOURCE_SUPERSEDED: 'warning',
  SOURCE_WITHDRAWN: 'danger',
  UNAVAILABLE: 'danger',
  UNVERIFIED_PROVIDER_UNBOUND: 'neutral'
});

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] as string);

function matches(domain: LeftDomain, row: any, query: string) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  if (typeof domain.matches === 'function') return domain.matches(row, query) === true;
  return `${row.title} ${row.refType} ${row.sourceRef} ${row.state} ${row.groupingRef || ''} ${row.groupingState}`
    .toLowerCase().includes(q);
}

function viewGroup(title: string, views: readonly { query: string; key: CopyKey }[], domain: LeftDomain, active: string, T: any, hint?: string) {
  const buttons = views.map(view => {
    const count = domain.records.filter(row => matches(domain, row, view.query)).length;
    const pressed = active === view.query ? 'true' : 'false';
    return `<button type="button" class="w04-segment" data-portfolio-view="${escapeHtml(view.query)}" aria-pressed="${pressed}">`
      + `<span dir="auto">${escapeHtml(T[view.key])}</span>`
      + `<bdi class="w04-seg-count">${count}</bdi></button>`;
  }).join('');
  return `<div class="pf-view-group"><p class="pf-view-title" dir="auto">${escapeHtml(title)}</p>`
    + `<div class="w04-segments" role="group" aria-label="${escapeHtml(title)}">${buttons}</div>`
    + (hint ? `<p class="pf-view-hint" dir="auto">${escapeHtml(hint)}</p>` : '')
    + `</div>`;
}

function syncViews(host: Element, domain: LeftDomain, collection: LeftCollection, render: () => void) {
  const T = portfolioCopy();
  const active = String(domain.filterText || '');
  const key = `${active}::${domain.records.length}::${T.savedViews}::`
    + [...SAVED_VIEWS, ...CURATED_VIEWS].map(v => `${v.key}=${domain.records.filter(r => matches(domain, r, v.query)).length}`).join('|');

  let node = host.querySelector(':scope > [data-portfolio-views]');
  if (!node || node.getAttribute('data-portfolio-views-key') !== key) {
    const html = viewGroup(T.savedViews, SAVED_VIEWS, domain, active, T)
      + viewGroup(T.curatedViews, CURATED_VIEWS, domain, active, T, T.curatedHint);
    if (node) {
      node.setAttribute('data-portfolio-views-key', key);
      node.innerHTML = html;
    } else {
      node = document.createElement('nav');
      node.className = 'pf-views';
      node.setAttribute('data-portfolio-views', '');
      node.setAttribute('data-portfolio-views-key', key);
      node.setAttribute('aria-label', T.navLabel);
      node.innerHTML = html;
      host.prepend(node);
    }
    node.querySelectorAll<HTMLButtonElement>('[data-portfolio-view]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const query = button.getAttribute('data-portfolio-view') || '';
        if (String(domain.filterText || '') === query) return;
        try { domain.filter(query); } catch { /* view is presentation-only if the domain refuses */ }
        try { collection.setFilter(query); } catch { /* collection stays authoritative for rows */ }
        render();
      });
    });
  }
}

function syncRowTone(host: Element, domain: LeftDomain) {
  host.querySelectorAll<HTMLElement>('[data-r6-row]').forEach(node => {
    const id = node.getAttribute('data-r6-row');
    const row = domain.records.find(item => item && item.id === id);
    if (!row) return;
    const tone = STATE_TONE[String(row.state)] || 'neutral';
    if (node.dataset.w04Tone !== tone) node.dataset.w04Tone = tone;
    const title = `${row.title || row.id} · ${row.state} · ${row.refType}`;
    if (node.getAttribute('title') !== title) node.setAttribute('title', title);
  });
}

function render(): void {
  try {
    (globalThis as any).CEPFoundation?.m0Composition?.mounted?.render?.();
  } catch { /* presentation refresh only — never fabricate a result */ }
}

/**
 * Install the Portfolio LEFT composition. Safe to call from Node (no DOM → no-op).
 * Returns void; the observer keeps the pane alive across m0 re-renders.
 */
export function installPortfolioLeftComposition(domain: LeftDomain, collection: LeftCollection): void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

  const sync = () => {
    if (document.body?.dataset?.consumer !== 'portfolio') return;
    const host = document.querySelector('#domainLeftRegion');
    if (!host) return;
    try { syncRowTone(host, domain); } catch { /* tone is presentation-only */ }
    try { syncViews(host, domain, collection, render); } catch { /* views are presentation-only */ }
  };

  sync();
  const observer = new MutationObserver(() => sync());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export default installPortfolioLeftComposition;
