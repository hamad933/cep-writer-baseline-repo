# 05_foundation / capability_matrix + shared_mechanics + ownership

Timestamp: 2026-09-29T01:30Z · Status: **NOT_STARTED** (inputs inventoried; reconciliation pending corpus ingest)

## Inputs located for the capability rebuild (mission §20)

| Input | Location | State |
|---|---|---|
| `CEP_REUSABLE_FOUNDATION_CAPABILITY_MATRIX_v1.0.csv` (61,621 B, 2026-09-20) | Drive | located, not ingested |
| `07_CAPABILITY_AND_MECHANIC_LINEAGE.csv` (multiple historical versions 281 B→11,557 B) | Drive | located — multiple versions require supersession resolution |
| `MECHANIC_OWNERSHIP_REGISTRY.json` (27,886 B) | repo `contracts/` | enumerated |
| `CORE_OWNER_REGISTRY.json` (121,685 B), `STATE_OWNERSHIP_REGISTRY.csv`, `COMPONENT_REGISTRY.{csv,json}`, `SURFACE_READINESS_REGISTRY.json`, `23_SURFACE_INHERITANCE_MATRIX.{csv,json}` | repo `contracts/` | enumerated |
| `UNIVERSAL_LAYOUT_SLOT_CONTRACT.json`, `COMMAND_REGISTRY.seed.json`, `PREFERENCE_REGISTRY.seed.json`, `FOUNDATION_RUNTIME_REGISTRY.json` | repo `contracts/` | enumerated |
| `D4_CAPABILITY_KNOWLEDGE_BASELINE.csv` (521,860 B), `CEP_W02_UNIVERSAL_INTERFACE_CUSTOMIZATION_ACTION_ACCESSIBILITY_CAPABILITY_MATRIX_v1.0.csv`, `CEP_VISUALIZE_V20_UNIVERSAL_CAPABILITY_DISPOSITION.csv`, `CEP_LEARN_V14_CAPABILITY_BANK_DISPOSITION.csv`, `CEP_RQ_V13_SOURCE_DERIVED_CAPABILITY_DISPOSITION.csv` | Drive | located, not ingested |
| Shared-hotspot collision locks (K-03 in knowledge ledger) | zero-loss index §4.7 | recovered |

## Shared-mechanics ownership seed (recovered locks — to be re-verified before adoption)

| Shared mechanic / hotspot | Locked owner | Known consumers |
|---|---|---|
| Global shell navigation | GlobalShellNavigationOwner | SHELL + all destinations (destinationCountFrozen=false — Owner authority gate C03-GATE-023) |
| Structured presentation bridge | StructuredPresentationBridge | LEARN + structured hosts |
| Bottom deep-work | BottomDeepWorkOwner | RQ + zero-provider surfaces (see `CBF-003`) |
| Spatial presentation | SpatialPresentationOwner | SCENARIOS + spatial surfaces |
| Timeline replay | TimelineReplayOwner | RESULTS + Replay/AAR/Compare |
| Final integration hotspots | **held / serialized** | `stack/native-typescript/main.ts`, `surfaces/m0-controller-composition.ts` |
| Rescue seams | surface-owned | `surfaces/composition/w05-rescue.ts` (CONFIGURATION seam), `w04-rescue` (REVIEWS seam) |
| Preference export/import/reset (SC-011) | CONFIGURATION (candidate) | Settings consumers (`MFC-PF-003` exposure finding) |
| Persistence seed/kernel (Balanced6) | cross-surface persistence | all seeded surfaces (`CBF-001` P0) |

## Explicit non-claims

- Old ownership (from any historical matrix) is NOT inherited; each row must be re-verified against
  current source (`contracts/MECHANIC_OWNERSHIP_REGISTRY.json` + live `foundation/` + `surfaces/`).
- Capability matrix rows, donor/crosswalk map, and shared-contract map are **not yet produced**.
  They are Wave 5 deliverables and prerequisites for final Writer packets.
