export const TOOLBAR_TEMPLATE_OWNER = 'ReusableToolbarTemplateOwner';

export const TOOLBAR_TEMPLATE_CONTRACT = Object.freeze({
  id: TOOLBAR_TEMPLATE_OWNER,
  version: '1.0.0',
  layer: 'GLOBAL FOUNDATION',
  donorComponent: 'EditorToolbar',
  selector: '[data-component="EditorToolbar"]',
  semantics: Object.freeze({
    domainCommands: 'DESCRIPTORS_ONLY',
    saveTruth: 'CALLER_SUPPLIED_NO_PERSISTENCE_CLAIM',
    historyTruth: 'CALLER_SUPPLIED_AVAILABILITY',
    layout: 'DONOR_GRADE_STABLE_SLOT_GRAMMAR'
  })
});

export function saveStatusPresentation(input = {}) {
  return Object.freeze({
    state: String(input.state || 'clean'),
    label: String(input.label || input.state || '')
  });
}

export function historyActionPresentation(input = {}) {
  const enabled = Boolean(input.enabled);
  const fallback = String(input.fallbackLabel || '');
  const shortcut = String(input.shortcut || '');
  const reason = String(input.reason || '');
  const disabledFallback = String(input.disabledFallback || fallback);
  return Object.freeze({
    enabled,
    disabled: !enabled,
    availabilityCode: String(input.code || ''),
    title: enabled && shortcut ? `${fallback} — ${shortcut}` : (reason || disabledFallback)
  });
}

export function projectToolbarModeState(root, input = {}) {
  const mode = String(input.mode || 'read');
  if (!['read', 'edit'].includes(mode)) throw Error('INVALID_TOOLBAR_MODE_PROJECTION');
  let projected = false;
  root?.querySelectorAll?.('[data-action="set-mode"]').forEach(button => {
    const active = button.dataset.value === mode;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
    button.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
    projected = true;
  });
  const toolbar = root?.querySelector?.('[data-component="EditorToolbar"]');
  if (toolbar) toolbar.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
  return Object.freeze({ owner: TOOLBAR_TEMPLATE_OWNER, projected, mode });
}

export function projectSaveStatus(root, input = {}) {
  const presentation = saveStatusPresentation(input);
  const status = root?.querySelector?.('#saveStatus');
  if (!status) return Object.freeze({ owner: TOOLBAR_TEMPLATE_OWNER, projected: false, ...presentation });
  status.dataset.state = presentation.state;
  status.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
  const label = status.querySelector('.label');
  if (label) label.textContent = presentation.label;
  const toolbar = status.closest('[data-component="EditorToolbar"]');
  if (toolbar) toolbar.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
  return Object.freeze({ owner: TOOLBAR_TEMPLATE_OWNER, projected: true, ...presentation });
}

function projectHistoryButton(button, input) {
  if (!button) return false;
  const presentation = historyActionPresentation(input);
  button.disabled = presentation.disabled;
  button.dataset.availabilityCode = presentation.availabilityCode;
  button.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
  button.title = presentation.title;
  return true;
}

export function projectToolbarHistoryState(root, input = {}) {
  const undo = projectHistoryButton(root?.querySelector?.('[data-action="undo"]'), {
    enabled: input.undo?.enabled,
    code: input.undo?.code,
    reason: input.undo?.reason,
    fallbackLabel: 'تراجع',
    disabledFallback: 'تراجع غير متاح',
    shortcut: 'Ctrl+Z'
  });
  const redo = projectHistoryButton(root?.querySelector?.('[data-action="redo"]'), {
    enabled: input.redo?.enabled,
    code: input.redo?.code,
    reason: input.redo?.reason,
    fallbackLabel: 'إعادة',
    disabledFallback: 'إعادة غير متاحة',
    shortcut: 'Ctrl+Shift+Z / Ctrl+Y'
  });
  const toolbar = root?.querySelector?.('[data-component="EditorToolbar"]');
  if (toolbar) toolbar.dataset.presentationOwner = TOOLBAR_TEMPLATE_OWNER;
  return Object.freeze({ owner: TOOLBAR_TEMPLATE_OWNER, projected: undo || redo, undo, redo });
}

export function composeToolbarSlots(root,{globalHTML='',domainId='domainToolbar'}={}){
  const toolbar=root?.querySelector?.('.toolbar')||root?.querySelector?.('[data-component="EditorToolbar"]');
  if(!toolbar)return Object.freeze({owner:TOOLBAR_TEMPLATE_OWNER,composed:false});
  toolbar.dataset.slot='TOOLBAR';toolbar.dataset.presentationOwner=TOOLBAR_TEMPLATE_OWNER;
  let global=toolbar.querySelector(':scope > .foundation-global');if(!global){global=root.createElement?root.createElement('div'):globalThis.document.createElement('div');global.className='tg foundation-global';toolbar.insertBefore(global,toolbar.firstChild)}
  global.innerHTML=String(globalHTML);global.dataset.toolbarSlotOwner=TOOLBAR_TEMPLATE_OWNER;
  let domain=toolbar.querySelector(':scope > .foundation-domain');if(!domain){domain=(root.createElement?root:globalThis.document).createElement('div');domain.className='tg foundation-domain';toolbar.append(domain)}
  domain.id=domainId;domain.dataset.toolbarSlotOwner=TOOLBAR_TEMPLATE_OWNER;
  return Object.freeze({owner:TOOLBAR_TEMPLATE_OWNER,composed:true,slots:['foundation-global','foundation-domain']});
}
