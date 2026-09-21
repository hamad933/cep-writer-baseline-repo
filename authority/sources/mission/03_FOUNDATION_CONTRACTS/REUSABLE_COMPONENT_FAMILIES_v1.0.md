# REUSABLE EXECUTABLE COMPONENT / ENGINE FAMILIES

## Global shared
WorkspaceFrame; Global/Shell primitives; TopRegion; WorkspaceToolbar; PaneShell; PaneEdgeRevealControl; PaneInternalControl; PaneResizer; BottomShelf; ContextInspector; ContextLensHost; CommandPalette; ContextActionMenu; SelectionActionSurface; InsertionPalette; SettingsCenter; PreferenceStore/ScopeResolver; FocusController; TransientManager; DismissalPolicy; Keymap/InputProfile; Status/Toast/EpistemicState; Search/Discovery; Notes/Sticky presentation; responsive preferred/effective state; locale/direction/Bidi/typography/theme/density/scale presentation.

## Structured family
UnifiedEditor; document/block tree; toggle/container; insertion/gap insertion; split/merge; indent/outdent; reorder/move; block/inline selection; formatting; links/references; code blocks; clipboard; history/undo/redo/recovery; block context actions; selection toolbar; direction/alignment/Bidi; notes anchors.

## Spatial family
Viewport/camera; pan/zoom/Fit; pointer-centered zoom; object drag; marquee; multi-select; keyboard spatial navigator; grid/snap; alignment/distribution/layout; minimap; relation composer; edge editing; representation-vs-canonical boundary; spatial context/selection action surfaces.

## Operational family
OperationalSurfaceManager; floating/docked/tabbed/split presentation; resize/move; session identity; visible tab groups; session shelf; capability-driven OPEN_TERMINAL/open-tool entry; live-vs-recorded distinction; runtime-provider adapter boundary; optional terminal renderer adapter.

## Analytical / review / audit families
Compare/diff/provenance/timeline/table/filter/history mechanics; formal review interaction shell; audit/provenance inspection. Domain semantics remain adapter-owned.
