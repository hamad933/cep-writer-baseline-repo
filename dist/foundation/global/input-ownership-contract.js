export const GLOBAL_INPUT_OWNERSHIP_CONTRACT = Object.freeze({
  id: 'GlobalInputOwnershipContract',
  version: '1.0.0',
  owner: 'GlobalInputKeymapOwner',
  policyTag: 'global-input-ownership-v1'
});

export const INPUT_INTENT = Object.freeze({
  COMPOSITION: 'composition',
  ESCAPE: 'escape',
  REGION_CYCLE: 'region-cycle',
  SHORTCUT: 'shortcut',
  PRINTABLE: 'printable',
  EDITING: 'editing',
  NAVIGATION: 'navigation',
  OTHER: 'other'
});

const EDITING_KEYS = new Set(['Backspace', 'Delete', 'Enter', 'Tab']);
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);
const NATIVE_EDITABLE_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number', 'date', 'datetime-local', 'month', 'time', 'week']);

const truthyContentEditable = target => {
  if (!target || typeof target !== 'object') return false;
  if (target.isContentEditable === true) return true;
  const attr = target.getAttribute?.('contenteditable');
  return attr === '' || attr === 'true' || attr === 'plaintext-only';
};

export function eventTargetElement(target) {
  if (!target || typeof target !== 'object') return null;
  if (typeof Element !== 'undefined' && target instanceof Element) return target;
  if (typeof Node !== 'undefined' && target instanceof Node) return target.parentElement || null;
  if (target.nodeType === 1 && typeof target.closest === 'function') return target;
  const parent = target.parentElement;
  return parent && typeof parent.closest === 'function' ? parent : null;
}

export function closestFromEventTarget(target, selector) {
  return eventTargetElement(target)?.closest?.(selector) || null;
}

export function isCompositionEvent(event = {}) {
  return event.isComposing === true || event.key === 'Process' || event.keyCode === 229 || event.which === 229;
}

export function classifyInputIntent(event = {}) {
  if (isCompositionEvent(event)) return INPUT_INTENT.COMPOSITION;
  if (event.key === 'Escape') return INPUT_INTENT.ESCAPE;
  if (event.key === 'F6' && !event.ctrlKey && !event.metaKey && !event.altKey) return INPUT_INTENT.REGION_CYCLE;
  if (event.ctrlKey || event.metaKey || event.altKey) return INPUT_INTENT.SHORTCUT;
  if (typeof event.key === 'string' && event.key.length === 1) return INPUT_INTENT.PRINTABLE;
  if (EDITING_KEYS.has(event.key)) return INPUT_INTENT.EDITING;
  if (NAVIGATION_KEYS.has(event.key)) return INPUT_INTENT.NAVIGATION;
  return INPUT_INTENT.OTHER;
}

export function isNativeEditableTarget(target) {
  if (!target || typeof target !== 'object') return false;
  if (truthyContentEditable(target)) return true;
  const tag = String(target.tagName || target.nodeName || '').toLowerCase();
  if (tag === 'textarea') return target.disabled !== true && target.readOnly !== true;
  if (tag !== 'input') return false;
  if (target.disabled === true || target.readOnly === true) return false;
  const type = String(target.type || target.getAttribute?.('type') || 'text').toLowerCase();
  return NATIVE_EDITABLE_TYPES.has(type);
}

export function createInputOwnershipDescriptor(options = {}) {
  if (!options.owner) throw Error('INPUT_OWNER_REQUIRED');
  const claimedIntents = [...new Set(options.claimedIntents || [INPUT_INTENT.PRINTABLE, INPUT_INTENT.EDITING, INPUT_INTENT.NAVIGATION])];
  const allowedGlobalCommands = [...new Set(options.allowedGlobalCommands || [])];
  return Object.freeze({
    contract: GLOBAL_INPUT_OWNERSHIP_CONTRACT,
    owner: String(options.owner),
    family: options.family ? String(options.family) : null,
    kind: options.kind || 'editor',
    active: options.active !== false,
    claimedIntents: Object.freeze(claimedIntents),
    allowedGlobalCommands: Object.freeze(allowedGlobalCommands)
  });
}

export function nativeEditableOwnership(target) {
  if (!isNativeEditableTarget(target)) return null;
  return createInputOwnershipDescriptor({ owner: 'NativeEditableControl', kind: 'native-editable' });
}

export function resolveInputOwnership(event = {}, context = {}) {
  const intent = classifyInputIntent(event);
  if (intent === INPUT_INTENT.COMPOSITION) {
    return { contract: GLOBAL_INPUT_OWNERSHIP_CONTRACT, intent, active: true, owner: 'IMEComposition', kind: 'composition', claimsIntent: true, allowedGlobalCommands: [] };
  }
  const supplied = typeof context.inputOwnership === 'function' ? context.inputOwnership(event, context) : context.inputOwnership;
  const descriptor = supplied || nativeEditableOwnership(context.target || event.target);
  if (!descriptor || descriptor.active === false) {
    return { contract: GLOBAL_INPUT_OWNERSHIP_CONTRACT, intent, active: false, owner: null, kind: 'none', claimsIntent: false, allowedGlobalCommands: [] };
  }
  const claimsIntent = Array.isArray(descriptor.claimedIntents) && descriptor.claimedIntents.includes(intent);
  return {
    contract: GLOBAL_INPUT_OWNERSHIP_CONTRACT,
    intent,
    active: true,
    owner: descriptor.owner || 'UnknownInputOwner',
    family: descriptor.family || null,
    kind: descriptor.kind || 'editor',
    claimsIntent,
    allowedGlobalCommands: [...(descriptor.allowedGlobalCommands || [])]
  };
}
