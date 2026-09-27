# BACKUP — Closed Read Set and Discovery Contract

## READ FIRST / authority projection
Read `MISSION.md`, `CAPSULE_BINDING.json`, `LIVE_AUTHORITY_SNAPSHOT.md`, `SURFACE_PROFILE_AND_DOMAIN_CONTRACT.md`, `ZERO_LOSS_OBLIGATION_MATRIX.csv`, `SOURCE_VALUE_CROSSWALK.csv`, `APPLICABLE_OWNER_DECISIONS.csv`, `SHARED_OWNER_DEPENDENCY_AND_COLLISION_MAP.csv`, `VISUAL_REFERENCE_AND_MAJOR_STATE_MATRIX.csv`, `CURRENT_RESULT_RETAIN_REJECT_MAP.csv`, and `ACCEPTANCE_AND_FALSIFICATION_MATRIX.csv` from this packet.

## Exact writable Product scope
- `stack/native-typescript/adapters/backup-runtime.ts`
- `stack/native-typescript/surfaces/backup/index.ts`
- `stack/native-typescript/tests/surface-restoration/backup/**`

## Exact read-only Product/reference scope
- `cep-writer/references/surface-profiles/backup.json`
- `stack/native-typescript/main.ts`
- `stack/native-typescript/foundation/workspace-host.ts`
- `stack/native-typescript/foundation/global/**`
- `stack/native-typescript/foundation/collection/**`
- `stack/native-typescript/foundation/audit/provenance.ts`
- `stack/native-typescript/foundation/analytical/compare.ts`
- `package.json`
- `tools/serve.mjs`
- `tools/check-duplicate-mechanics.mjs`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`

## Salvage input
- `NONE` is read-only lineage/evidence. It is not accepted Product and must not be merged wholesale.

## DO NOT READ / NO DISCOVERY BY DEFAULT
- No repo-wide recursive archaeology, broad `grep/rg/find`, Drive-wide search, historical packet harvesting, unrelated Surface source, sibling Writer workspaces, or hidden WIP.
- Do not read `COMMON_AND_DAG` as mutable authority; Helper D did not write it.
- Do not infer missing authority from chat memory.

## BOUNDED_DISCOVERY_ESCAPE
Allowed only for a named missing/contradictory symbol, test, import, or direct dependency inside the smallest relevant source family. Record the reason, exact paths inspected, result, and stop immediately when resolved. Discovery may not widen write scope. If a material authority/shared-owner contradiction appears, stop with `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST`.