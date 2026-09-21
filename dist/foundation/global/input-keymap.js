import { INPUT_INTENT, classifyInputIntent, isCompositionEvent, resolveInputOwnership } from './input-ownership-contract.js';
import { WorkspaceRegionCycle } from './region-cycle.js';

export const GLOBAL_INPUT_KEYMAP_OWNER = 'GlobalInputKeymapOwner';
export const GLOBAL_INPUT_KEYMAP_CONTRACT = Object.freeze({
  id: GLOBAL_INPUT_KEYMAP_OWNER,
  version: '1.0.0',
  owner: GLOBAL_INPUT_KEYMAP_OWNER,
  route: 'keyboard',
  listenerOwnership: 'ControllerIntegrationHost',
  policyTag: 'global-input-keymap-v1'
});

export const GLOBAL_INPUT_KEYMAP_POLICY = Object.freeze({
  requireExplicitShortcutAllow: true,
  allowGlobalShortcutsInOwnedInput: false,
  transientEscapeFirst: true,
  interceptComposition: false
});

const MODIFIER_ORDER = Object.freeze(['Ctrl', 'Meta', 'Alt', 'Shift']);
const modifierState = event => ({ Ctrl: !!event.ctrlKey, Meta: !!event.metaKey, Alt: !!event.altKey, Shift: !!event.shiftKey });
const keyToken = event => String(event.code || event.key || '').trim();

export function normalizeShortcutChord(event = {}) {
  const state = modifierState(event), base = keyToken(event);
  return [...MODIFIER_ORDER.filter(name => state[name]), base].filter(Boolean).join('+');
}

const allowed = (rule, context, binding) => rule === true || (typeof rule === 'function' && rule(context, binding) === true);

function normalizeBinding(binding, source) {
  if (!binding?.chord || !binding?.commandId) throw Error('INVALID_GLOBAL_KEY_BINDING');
  return Object.freeze({
    id: String(binding.id || `${source}:${binding.commandId}:${binding.chord}`),
    chord: String(binding.chord),
    commandId: String(binding.commandId),
    priority: Number.isFinite(Number(binding.priority)) ? Number(binding.priority) : 0,
    allow: binding.allow,
    allowInOwnedInput: binding.allowInOwnedInput === true,
    when: typeof binding.when === 'function' ? binding.when : () => true,
    source
  });
}

export function createFamilyKeymapDescriptor(options = {}) {
  if (!options.id || !options.family) throw Error('FAMILY_KEYMAP_DESCRIPTOR_INVALID');
  const source = `family:${String(options.family)}:${String(options.id)}`;
  const bindings = Object.freeze((options.bindings || []).map(binding => normalizeBinding(binding, source)));
  return Object.freeze({
    id: String(options.id),
    family: String(options.family),
    semanticOwner: options.semanticOwner ? String(options.semanticOwner) : null,
    bindings
  });
}

const prevent = event => { event.preventDefault?.(); event.stopPropagation?.(); };

export class GlobalInputKeymapOwner {
  constructor({ commands, transientFocus = null, regions = [], globalBindings = [], policy = GLOBAL_INPUT_KEYMAP_POLICY } = {}) {
    if (!commands || typeof commands.execute !== 'function' || typeof commands.availability !== 'function') throw Error('SEMANTIC_COMMAND_BUS_REQUIRED');
    this.owner = GLOBAL_INPUT_KEYMAP_OWNER;
    this.contract = GLOBAL_INPUT_KEYMAP_CONTRACT;
    this.commands = commands;
    this.transientFocus = transientFocus;
    this.regionCycle = regions instanceof WorkspaceRegionCycle ? regions : new WorkspaceRegionCycle(regions);
    this.globalBindings = Object.freeze(globalBindings.map(binding => normalizeBinding(binding, 'global')));
    this.policy = Object.freeze({ ...GLOBAL_INPUT_KEYMAP_POLICY, ...policy });
    this.sequence = 0;
    this.receipts = [];
  }
  bindings(context = {}) {
    const family = context.familyKeymap;
    if (family && (!family.id || !family.family || !Array.isArray(family.bindings))) throw Error('FAMILY_KEYMAP_DESCRIPTOR_INVALID');
    return family ? [...this.globalBindings, ...family.bindings] : [...this.globalBindings];
  }
  resolveShortcut(event, context = {}) {
    const chord = normalizeShortcutChord(event);
    const matches = this.bindings(context).filter(binding => binding.chord === chord && binding.when(context, binding) === true).sort((a,b) => b.priority - a.priority || a.id.localeCompare(b.id));
    if (!matches.length) return { code: 'NO_MATCH', chord, binding: null, candidates: [] };
    const topPriority = matches[0].priority, top = matches.filter(binding => binding.priority === topPriority);
    const commands = new Set(top.map(binding => binding.commandId));
    if (commands.size > 1) return { code: 'AMBIGUOUS_SHORTCUT', chord, binding: null, candidates: top.map(binding => binding.id) };
    return { code: 'RESOLVED', chord, binding: top[0], candidates: matches.map(binding => binding.id) };
  }
  record(detail) {
    const receipt = { sequence: ++this.sequence, owner: this.owner, policyTag: this.contract.policyTag, ...detail };
    this.receipts.push(receipt);
    return receipt;
  }
  handleKeydown(event = {}, context = {}) {
    if (isCompositionEvent(event)) return { handled: false, suppressed: true, code: 'IME_COMPOSITION_PASSTHROUGH', owner: this.owner, intent: INPUT_INTENT.COMPOSITION };
    const intent = classifyInputIntent(event);

    if (intent === INPUT_INTENT.REGION_CYCLE) {
      const result = this.regionCycle.cycle(context.regionContext || context, event.shiftKey === true);
      if (result.handled) prevent(event);
      return { ...result, owner: this.owner, intent };
    }

    if (intent === INPUT_INTENT.ESCAPE && this.policy.transientEscapeFirst) {
      const dismissed = this.transientFocus?.dismiss?.('escape', { restore: true }) === true;
      if (dismissed) {
        prevent(event);
        return { handled: true, suppressed: false, code: 'TRANSIENT_ESCAPE_DELEGATED', owner: this.owner, intent, receipt: this.record({ kind: 'escape', delegatedOwner: 'TransientFocusOwner' }) };
      }
      return { handled: false, suppressed: false, code: 'ESCAPE_DELEGATED_NO_TRANSIENT', owner: this.owner, intent };
    }

    const ownership = resolveInputOwnership(event, context);
    if (ownership.active && ownership.claimsIntent) {
      return { handled: false, suppressed: true, code: 'INPUT_OWNER_CLAIMS_INTENT', owner: this.owner, inputOwner: ownership.owner, intent };
    }

    if (intent !== INPUT_INTENT.SHORTCUT) return { handled: false, suppressed: false, code: 'NO_GLOBAL_ROUTE', owner: this.owner, intent };
    const resolution = this.resolveShortcut(event, context);
    if (!resolution.binding) return { handled: false, suppressed: resolution.code === 'AMBIGUOUS_SHORTCUT', owner: this.owner, intent, ...resolution };
    const binding = resolution.binding;
    if (this.policy.requireExplicitShortcutAllow && !allowed(binding.allow, context, binding)) {
      return { handled: false, suppressed: true, code: 'EXPLICIT_SHORTCUT_ALLOW_REQUIRED', owner: this.owner, intent, chord: resolution.chord, commandId: binding.commandId };
    }
    if (ownership.active) {
      const ownerAllows = ownership.allowedGlobalCommands.includes(binding.commandId);
      const centralAllows = this.policy.allowGlobalShortcutsInOwnedInput === true;
      if (!(binding.allowInOwnedInput && ownerAllows && centralAllows)) {
        return { handled: false, suppressed: true, code: 'OWNED_INPUT_SHORTCUT_SUPPRESSED', owner: this.owner, inputOwner: ownership.owner, intent, commandId: binding.commandId };
      }
    }
    const payload = { ...(context.commandPayload || {}), route: 'keyboard', chord: resolution.chord, family: context.familyKeymap?.family || context.family || null, inputOwner: ownership.owner };
    const availability = this.commands.availability(binding.commandId, payload);
    if (!availability.enabled) return { handled: false, suppressed: true, code: availability.code || 'COMMAND_UNAVAILABLE', owner: this.owner, intent, commandId: binding.commandId, availability };
    const result = this.commands.execute(binding.commandId, payload);
    prevent(event);
    return { handled: true, suppressed: false, code: 'SHORTCUT_DISPATCHED', owner: this.owner, intent, commandId: binding.commandId, result, receipt: this.record({ kind: 'shortcut', commandId: binding.commandId, chord: resolution.chord, family: payload.family }) };
  }
  descriptor() {
    return { contract: this.contract, owner: this.owner, listenerOwnership: this.contract.listenerOwnership, globalBindings: this.globalBindings.map(binding => ({ id: binding.id, chord: binding.chord, commandId: binding.commandId, priority: binding.priority })), regionContract: this.regionCycle.contract, policy: { ...this.policy } };
  }
}
