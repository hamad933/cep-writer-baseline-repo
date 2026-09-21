import { WorkspacePaneLayoutOwner, WORKSPACE_PANE_LAYOUT_OWNER } from './pane-layout.js';
import { TRANSIENT_FOCUS_OWNER } from './transient-focus.js';
import {
  WORKSPACE_REGION_CONTRACT,
  assertWorkspaceFamilyBinding,
  inspectWorkspaceRegions
} from './region-contract.js';

export const WORKSPACE_HOST_CONTRACT = Object.freeze({
  id: 'WorkspaceFoundationHost',
  version: '1.0.0',
  owner: 'WorkspaceHostKernel',
  familyNeutral: true,
  regionContract: WORKSPACE_REGION_CONTRACT,
  stateOwners: Object.freeze({
    panes: WORKSPACE_PANE_LAYOUT_OWNER,
    transients: TRANSIENT_FOCUS_OWNER,
    context: 'ContextDescriptorProvider'
  })
});

export class WorkspaceHostKernel {
  constructor({ commands, preferences, binding, extension = {}, viewportWidth = 1440 }) {
    this.commands = commands;
    this.preferences = preferences;
    this.binding = assertWorkspaceFamilyBinding(binding);
    this.extension = extension;
    this.panes = new WorkspacePaneLayoutOwner(preferences, { viewportWidth });
    const familyState = this.binding.createState({ extension }) || {};
    this.state = {
      surface: { mode: 'read', preferredDensity: 'comfortable', zoom: 1, focusMode: false, bottomOpen: false },
      notes: { floating: true, docked: false },
      transient: { open: false, kind: null, returnFocus: null },
      domain: {
        family: this.binding.family,
        kind: this.binding.domainKind,
        bindingId: this.binding.id,
        activeTarget: null
      },
      ...familyState
    };
  }

  commandContext(payload = {}) {
    return this.binding.commandContext({ state: this.state, payload, extension: this.extension }) || {};
  }

  inspect(root = document) {
    return {
      contract: WORKSPACE_HOST_CONTRACT,
      binding: this.binding.descriptor({ state: this.state }),
      domain: { ...this.state.domain },
      slots: inspectWorkspaceRegions(root),
      panes: this.panes.snapshot(typeof window !== 'undefined' ? window.innerWidth : 1440)
    };
  }
}
