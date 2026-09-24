export const UNIVERSAL_WORKSPACE_REGIONS = Object.freeze([
  'TOP',
  'TOOLBAR',
  'LEFT',
  'CENTER',
  'RIGHT',
  'BOTTOM',
  'TRANSIENT'
]);

export const WORKSPACE_REGION_CONTRACT = Object.freeze({
  id: 'UniversalWorkspaceRegionContract',
  version: '1.0.0',
  slots: UNIVERSAL_WORKSPACE_REGIONS,
  selectors: Object.freeze({
    TOP: '#topBanner',
    TOOLBAR: '.toolbar',
    LEFT: '#leftPane',
    CENTER: '#centerPane',
    RIGHT: '#rightPane',
    BOTTOM: '#bottomShelf',
    TRANSIENT: '.backdrop,.popover,#notesLayer'
  })
});

export function assertWorkspaceFamilyBinding(binding) {
  if (!binding || typeof binding !== 'object') {
    throw new Error('WORKSPACE_FAMILY_BINDING_REQUIRED');
  }
  if (!binding.id || !binding.family || !binding.domainKind) {
    throw new Error('WORKSPACE_FAMILY_BINDING_INVALID');
  }
  return binding;
}

export function createWorkspaceFamilyBinding(options = {}) {
  const binding = {
    id: options.id,
    family: options.family,
    domainKind: options.domainKind,
    label: options.label || options.family || 'workspace',
    createState: typeof options.createState === 'function' ? options.createState : () => ({}),
    descriptor: typeof options.descriptor === 'function' ? options.descriptor : () => ({
      id: options.id,
      family: options.family,
      domainKind: options.domainKind
    }),
    commandContext: typeof options.commandContext === 'function' ? options.commandContext : ({ state }) => ({
      selection: [],
      activeTarget: state?.domain?.activeTarget || null,
      transientOpen: Boolean(state?.transient?.open)
    }),
    render: typeof options.render === 'function' ? options.render : null,
    setMode: typeof options.setMode === 'function' ? options.setMode : null,
    adapter: options.adapter || null
  };
  return assertWorkspaceFamilyBinding(binding);
}

export function inspectWorkspaceRegions(root = document) {
  const slots = {};
  for (const region of UNIVERSAL_WORKSPACE_REGIONS) {
    const selector = WORKSPACE_REGION_CONTRACT.selectors[region];
    slots[region] = Boolean(root.querySelector(selector));
  }
  return slots;
}
