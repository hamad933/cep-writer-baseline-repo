export const STRUCTURED_SELECTION_CONTRACT = Object.freeze({
  id:'StructuredSelectionKernel',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-selection-wave01-b-r1'
});

export const STRUCTURED_SELECTION_POLICY = Object.freeze({
  traversal:'tree-preorder',
  rangeEndpoint:'inclusive',
  ancestorRule:'ancestor-dominates-descendants-with-explicit-coverage',
  collapsedToggleRule:'descendants-remain-addressable-in-canonical-order',
  staleIdentity:'prune-and-receipt',
  unknownIdentity:'reject',
  domAuthority:'projection-only'
});
