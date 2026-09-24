import { UNIVERSAL_WORKSPACE_REGIONS } from './region-contract.js';

export const REGION_CYCLE_CONTRACT = Object.freeze({
  id: 'WorkspaceRegionCycle',
  version: '1.0.0',
  owner: 'GlobalInputKeymapOwner',
  policyTag: 'declared-available-region-cycle-v1'
});

const asResolver = value => typeof value === 'function' ? value : () => value;

export function createRegionCycleDescriptor(options = {}) {
  if (!options.id) throw Error('REGION_ID_REQUIRED');
  const id = String(options.id);
  if (!UNIVERSAL_WORKSPACE_REGIONS.includes(id) && options.allowCustomRegion !== true) throw Error(`UNKNOWN_WORKSPACE_REGION:${id}`);
  return Object.freeze({
    id,
    available: asResolver(options.available ?? true),
    hidden: asResolver(options.hidden ?? false),
    focus: typeof options.focus === 'function' ? options.focus : () => false,
    containsFocus: typeof options.containsFocus === 'function' ? options.containsFocus : () => false
  });
}

export class WorkspaceRegionCycle {
  constructor(regions = []) {
    this.contract = REGION_CYCLE_CONTRACT;
    this.setRegions(regions);
    this.sequence = 0;
    this.lastReceipt = null;
  }
  setRegions(regions = []) {
    const normalized = regions.map(region => region?.id && typeof region.focus === 'function' ? region : createRegionCycleDescriptor(region));
    const ids = normalized.map(region => region.id);
    if (new Set(ids).size !== ids.length) throw Error('DUPLICATE_REGION_CYCLE_ID');
    this.regions = Object.freeze([...normalized]);
    return this;
  }
  evaluate(context = {}) {
    return this.regions.map(region => {
      const available = region.available(context) !== false;
      const hidden = region.hidden(context) === true;
      return { region, id: region.id, available, hidden, eligible: available && !hidden };
    });
  }
  eligible(context = {}) {
    return this.evaluate(context).filter(entry => entry.eligible).map(entry => entry.region);
  }
  source(context = {}) {
    const declared = context.currentRegionId == null ? null : String(context.currentRegionId);
    if (declared && this.regions.some(region => region.id === declared)) return declared;
    return this.regions.find(region => region.containsFocus(context) === true)?.id || null;
  }
  current(context = {}, eligible = this.eligible(context)) {
    const sourceId = this.source(context);
    return sourceId && eligible.some(region => region.id === sourceId) ? sourceId : null;
  }
  next(context = {}, reverse = false) {
    const eligible = this.eligible(context);
    if (!eligible.length) return null;
    const currentId = this.current(context, eligible);
    const index = eligible.findIndex(region => region.id === currentId);
    const delta = reverse ? -1 : 1;
    const nextIndex = index < 0 ? (reverse ? eligible.length - 1 : 0) : (index + delta + eligible.length) % eligible.length;
    return eligible[nextIndex];
  }
  skippedBetween(context = {}, sourceId, destinationId, reverse = false, evaluated = this.evaluate(context)) {
    if (!this.regions.length || !destinationId) return [];
    const sourceEligible = evaluated.some(entry => entry.id === sourceId && entry.eligible);
    const delta = reverse ? -1 : 1;
    let index;
    if (sourceEligible) index = evaluated.findIndex(entry => entry.id === sourceId);
    else index = reverse ? 0 : -1;
    const skipped = [];
    for (let step = 0; step < evaluated.length; step += 1) {
      index = (index + delta + evaluated.length) % evaluated.length;
      const entry = evaluated[index];
      if (entry.id === destinationId && entry.eligible) break;
      if (!entry.eligible) {
        const reasons = [];
        if (entry.hidden) reasons.push('hidden');
        if (!entry.available) reasons.push('unavailable');
        skipped.push({ id: entry.id, reasons });
      }
    }
    return skipped;
  }
  cycle(context = {}, reverse = false) {
    const sourceId = this.source(context);
    const evaluated = this.evaluate(context);
    const eligible = evaluated.filter(entry => entry.eligible).map(entry => entry.region);
    if (!eligible.length) return { handled: false, code: 'NO_AVAILABLE_REGION', owner: REGION_CYCLE_CONTRACT.owner, contract: REGION_CYCLE_CONTRACT };
    const currentId = sourceId && eligible.some(region => region.id === sourceId) ? sourceId : null;
    const index = eligible.findIndex(region => region.id === currentId);
    const delta = reverse ? -1 : 1;
    const nextIndex = index < 0 ? (reverse ? eligible.length - 1 : 0) : (index + delta + eligible.length) % eligible.length;
    const destination = eligible[nextIndex];
    const skipped = this.skippedBetween(context, sourceId, destination.id, reverse, evaluated);
    const focused = destination.focus(context) !== false;
    const receipt = {
      sequence: ++this.sequence,
      owner: REGION_CYCLE_CONTRACT.owner,
      policyTag: REGION_CYCLE_CONTRACT.policyTag,
      from: sourceId,
      to: destination.id,
      direction: reverse ? 'reverse' : 'forward',
      reverse: !!reverse,
      skipped,
      skippedHidden: skipped.filter(entry => entry.reasons.includes('hidden')).map(entry => entry.id),
      skippedUnavailable: skipped.filter(entry => entry.reasons.includes('unavailable')).map(entry => entry.id),
      focused,
      moved: focused && sourceId !== destination.id,
      noLegalMovement: sourceId === destination.id && eligible.length === 1
    };
    this.lastReceipt = receipt;
    return { handled: focused, code: focused ? 'REGION_CYCLED' : 'REGION_FOCUS_REJECTED', regionId: destination.id, receipt };
  }
}
