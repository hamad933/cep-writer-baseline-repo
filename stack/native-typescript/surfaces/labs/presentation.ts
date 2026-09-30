/**
 * W03-LABS · presentation entry point.
 *
 * The lab workbench is composed in `./board.ts` (center + LEFT/RIGHT regions), with the
 * bilingual label set in `./i18n.ts`, the local style system in `./styles.ts` and the two
 * region projections in `./structure.ts` / `./context.ts`.
 *
 * This module stays as the stable import path for the surface (`surfaces/labs/index.ts`).
 * The previous `renderLabsSurface` generic three-column composition was retired: it was an
 * unmounted second composition for this surface and duplicated exactly the surface-level
 * decisions this unit is responsible for.
 */
export {mountLabTaskGraphIdentity,LAB_ENVIRONMENT_BINDING,LAB_TOOL_CONTEXT} from './board.js';
