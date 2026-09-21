# CEP FOUNDATION — EXECUTABLE STRUCTURE CONTRACT v1.0

**Classification:** `LOGICAL_EXECUTABLE_ARCHITECTURE / STACK_NEUTRAL / NOT_PHYSICAL_FILE_EXTENSION_FREEZE / FUTURE_WORK_INPUT`

The goal is not a reference-only design system. Every reusable family must have executable behavior, explicit state/command ownership, adapters, fixtures and tests. Physical language/framework/file extensions remain unresolved until Proof-of-Fit.

## Logical package tree
```text
foundation/
  shell/                  # global destinations, route context, orientation
  workspace/              # TOP/LEFT/CENTER/RIGHT/BOTTOM, pane/layout engine
  preferences/            # one semantic preference registry + scope resolver
  presentation/           # theme, density, scale, locale, direction, Bidi, typography, responsive effective state
  commands/               # typed semantic command registry + availability
  actions/                # toolbar/context/selection/overflow action surfaces
  context/                # Context Inspector + lenses + pin/close/reopen
  transients/             # menu/palette/dialog/popover/focus-return lifecycle
  input/                  # keymap/pointer profiles; no second spatial input engine
  a11y/                   # focus, keyboard parity, announcements, reduced-motion
  feedback/               # status/toast/epistemic empty-stale-unavailable-error grammar
  discovery/              # search/filter/quick-access primitives
  history/                # transaction history/bookmarks/recovery where admitted
  clipboard/              # portable/trust-aware copy/cut/paste contracts
  notes/                  # freeform note/annotation mechanic only; formal domain artifacts excluded
  structured/             # reusable editor/document/block/selection/insertion engine
  spatial/                # viewport/pan/zoom/select/marquee/move/layout/minimap/grid/snap engine
  analytical/             # compare/diff/provenance/table/timeline analytical mechanics
  operational/            # session/tool-window/dock/split/tab/shelf mechanics; provider I/O separate
  review/                 # review/decision interaction mechanics; W04 semantics adapter-owned
  audit/                  # provenance/audit inspection mechanics; domain integrity semantics adapter-owned
  testing/                # fixture state lab, contract harnesses, visual/reference parity harness

adapters/
  W01/{today,shell}/
  W02/{library,learn,visualize,rq}/
  W03/{enterprise,scenarios,labs,runs,results}/
  W04/{evidence,reviews,mastery,portfolio}/
  W05/{health,processing,validation,audit,manual_ai,backup,releases,configuration}/

surfaces/                 # thin compositions only; no duplicate generic engines
contracts/                # typed state/command/domain-boundary contracts
fixtures/                 # deterministic demo/test data, never fake provider truth
styles-or-tokens/         # implementation-specific realization chosen after stack Proof-of-Fit
tests/{unit,interaction,a11y,bidi,responsive,visual,runtime}/
```

## Reuse law
- A surface imports generic mechanics from `foundation/*` and supplies only domain adapters/composition.
- A surface-family engine may be shared by several surfaces without becoming a universal business model.
- Domain adapters own canonical entities, domain lifecycle, persistence/API/provider semantics and forbidden transitions.
- Shared cores may be implemented as very small modules/functions/styles/custom elements/classes/etc.; the conceptual name does not mandate a heavyweight subsystem.

## Customization law
Every safe presentation/workspace value has `safeDefault`, `preferredValue`, `effectiveValue`, `sourceScope`, `isOverridden`, `applicability`, `persistenceOwner`, and `resetTarget` where meaningful. Responsive effective state never overwrites preferred Owner state.

## Accepted donor transplant law
For Library-compatible mechanics: direct accepted HTML/CSS/JS behavior is the baseline oracle. Extraction is allowed only if DOM/interaction/visual/reference parity is preserved, except for explicit newer Owner supersessions. No abstraction is accepted merely because code looks cleaner.

## Family minimums
- `structured/`: stable IDs, split/merge, indent/outdent, reorder/move-to-gap, selection/multi-select, insertion, context actions, clipboard, history, mixed RTL/LTR/Bidi, focus, notes adapters.
- `spatial/`: viewport, pan/zoom/fit, pointer-centered zoom, marquee, move, multi-select, context, keyboard navigator, layout/alignment/distribution, grid/snap/minimap, representation-vs-canonical boundary.
- `operational/`: real session identity, visible tabs/groups, dock/undock/float/split/resize/minimize/restore/shelf, reconnect/history, capability-driven entry, provider boundary, recorded-vs-live distinction.
- `analytical/`: compare/diff, provenance, filters, dense tables, timelines/history, selection/context/deep diagnostics without importing formal Review semantics.
- `review/`: formal evidence/review/decision mechanics without collapsing Evidence, Review, Decision, Mastery, Freshness or Portfolio.

**Control token:** `EXECUTABLE_REUSE_STRUCTURE_DEFINED / PHYSICAL_STACK_UNRESOLVED / THIN_SURFACE_COMPOSITION_REQUIRED`.
