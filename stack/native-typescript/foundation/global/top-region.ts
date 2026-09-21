export const TOP_REGION_PRESENTATION_OWNER = 'TopRegionPresentationOwner';

export const TOP_REGION_PRESENTATION_CONTRACT = Object.freeze({
  id: TOP_REGION_PRESENTATION_OWNER,
  version: '1.0.0',
  layer: 'GLOBAL FOUNDATION',
  slots: Object.freeze(['TOOLBAR_QUICK_JUMP', 'TOOLBAR_REFERENCE_RETURN']),
  semantics: Object.freeze({
    structureOwnership: 'DESCRIPTOR_CONSUMER_ONLY',
    referenceOwnership: 'ROUTE_STATE_CONSUMER_ONLY',
    navigationExecution: 'CALLER_OWNED',
    responsiveVisibility: 'SHARED_PRESENTATION_POLICY'
  })
});

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function quickJumpVisibilityPolicy(input = {}) {
  const leftPaneOpen = Boolean(input.leftPaneOpen);
  const band = String(input.responsiveBand || 'wide');
  return Object.freeze({ hidden: leftPaneOpen && band === 'wide', band, leftPaneOpen });
}

export function projectQuickJumpVisibility(button, input = {}) {
  const policy = quickJumpVisibilityPolicy(input);
  if (!button) return Object.freeze({ owner: TOP_REGION_PRESENTATION_OWNER, projected: false, ...policy });
  button.hidden = policy.hidden;
  button.dataset.presentationOwner = TOP_REGION_PRESENTATION_OWNER;
  button.dataset.visibilityPolicy = policy.hidden ? 'LEFT_OPEN_WIDE_HIDDEN' : 'AVAILABLE';
  return Object.freeze({ owner: TOP_REGION_PRESENTATION_OWNER, projected: true, ...policy });
}

export function referenceReturnPresentation(input = {}) {
  const active = Boolean(input.active);
  const targetLabel = String(input.targetLabel || '');
  const shortLabel = 'العودة إلى المرجع';
  const fullLabel = active
    ? `العودة إلى ${targetLabel}`
    : 'العودة إلى موضع الإحالة — لا يوجد موضع سابق بعد';
  return Object.freeze({ active, disabled: !active, shortLabel, fullLabel });
}

export function projectReferenceReturnControls(controls = [], input = {}) {
  const presentation = referenceReturnPresentation(input);
  let projected = 0;
  for (const button of controls) {
    if (!button) continue;
    button.hidden = false;
    button.disabled = presentation.disabled;
    button.setAttribute('aria-disabled', String(presentation.disabled));
    button.dataset.referenceReady = presentation.active ? 'true' : 'false';
    button.dataset.presentationOwner = TOP_REGION_PRESENTATION_OWNER;
    button.setAttribute('aria-label', presentation.fullLabel);
    button.setAttribute('title', presentation.fullLabel);
    button.dataset.cepTooltip = presentation.fullLabel;
    const label = button.querySelector?.('[data-ref-return-label]');
    if (label) label.textContent = presentation.shortLabel;
    projected += 1;
  }
  return Object.freeze({ owner: TOP_REGION_PRESENTATION_OWNER, projected, ...presentation });
}

export function quickJumpPresentationModel(input = {}) {
  const units = Array.isArray(input.units) ? input.units.map(unit => Object.freeze({
    id: String(unit.id || ''),
    label: String(unit.label || '')
  })) : [];
  const headings = Array.isArray(input.headings) ? input.headings.slice(0, 18).map(heading => Object.freeze({
    id: String(heading.id || ''),
    label: String(heading.label || ''),
    typeLabel: String(heading.typeLabel || '')
  })) : [];
  return Object.freeze({ units: Object.freeze(units), headings: Object.freeze(headings) });
}

export function renderQuickJumpPresentation(host, input = {}) {
  if (!host) return Object.freeze({ owner: TOP_REGION_PRESENTATION_OWNER, projected: false, unitCount: 0, headingCount: 0 });
  const model = quickJumpPresentationModel(input);
  const closeIconHTML = String(input.closeIconHTML || '');
  host.dataset.presentationOwner = TOP_REGION_PRESENTATION_OWNER;
  host.innerHTML = `<div class="quickjump-head transient-panel-head"><span><strong>انتقال سريع</strong><small>لا ينشئ مالك Structure ثانٍ</small></span><button class="btn iconbtn" data-action="close-quick-jump" aria-label="إغلاق">${closeIconHTML}</button></div><div class="quickjump-list"><div class="quickjump-group">وحدات المعرفة</div>${model.units.map(unit => `<button class="quickjump-item" data-quick-ku="${escapeHTML(unit.id)}"><bdi dir="ltr">${escapeHTML(unit.id)}</bdi><span>${escapeHTML(unit.label)}</span></button>`).join('')}<div class="quickjump-group">داخل المستند</div>${model.headings.map(heading => `<button class="quickjump-item" data-quick-block="${escapeHTML(heading.id)}"><span>${escapeHTML(heading.label)}</span><small>${escapeHTML(heading.typeLabel)}</small></button>`).join('')}</div>`;
  return Object.freeze({ owner: TOP_REGION_PRESENTATION_OWNER, projected: true, unitCount: model.units.length, headingCount: model.headings.length });
}
