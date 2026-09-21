# UNIVERSAL LAYOUT + SLOT CONSTITUTION v1.0

This is a logical/executable contract, not a framework choice.

## Workspace frame
```text
GLOBAL SHELL / DESTINATION CONTEXT
┌───────────────────────────────────────────────────────────┐
│ TOP REGION                                                │
├───────────────────────────────────────────────────────────┤
│ WORKSPACE TOOLBAR                                         │
├───────────────┬──────────────────────┬────────────────────┤
│ LEFT          │ CENTER               │ RIGHT              │
│ STRUCTURE     │ PRIMARY WORK         │ CONTEXT            │
│ PANE          │ STAGE                │ PANE               │
├───────────────┴──────────────────────┴────────────────────┤
│ BOTTOM SHELF / TEMPORARY DEEP WORK                        │
└───────────────────────────────────────────────────────────┘
TRANSIENT LAYER: command palette / context menu / selection surface /
sticky note / popover / dialog / drag preview / toast
```

## Semantic slot ownership
- TOP: identity, high-level context, modes/status that genuinely sit above the active work.
- TOOLBAR: current-work commands/modes; never drift into middle of CENTER as a floating pseudo-title bar unless the component class explicitly requires it.
- LEFT: structure/navigation/hierarchy/object palette where applicable.
- CENTER: dominant work and workspace/view-mode transitions.
- RIGHT: unique selected-object/context support; not duplicate primary work.
- BOTTOM: temporary/deep work, history, diagnostics, terminal/timeline/etc. when that family applies; closed/collapsed by default where appropriate.
- TRANSIENT: temporary overlays with class-specific dismissal/focus return.

## Side panes
Shared contract includes:
- internal header close/collapse control;
- external edge reveal/toggle control when hidden/collapsed;
- resizer;
- preferred width/state;
- effective responsive representation;
- keyboard resize where meaningful;
- overlay/drawer conversion at narrower widths without overwriting preferred Owner state;
- stable content/state identity across open/close/reflow.

Internal close and external reveal are distinct controls/roles.

## Toolbar
Use stable semantic groups/slots. Suggested grammar:
`VIEW/MODE | PRIMARY DOMAIN | CONTEXTUAL/SELECTION | FLEX | FOCUS | COMMAND | LAYOUT/SETTINGS | MORE`.

Exact surface actions vary; shared actions keep consistent meaning/placement grammar and remain customizable.

## Transient/action surfaces
Use one executable shell per family:
- CommandPaletteTemplate
- ContextActionTemplate
- SelectionActionTemplate
- InsertionPaletteTemplate
- QuickAction/Flyout template

Surfaces bind commands and capability groups; they do not redesign geometry/focus/dismissal per surface.
