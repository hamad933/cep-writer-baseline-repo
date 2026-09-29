# 10_dispatch / WORKSTREAM_GRAPH · DEPENDENCY_GRAPH · PARALLEL_WAVE_PLAN · MERGE_RISK_MAP · INTEGRATION_ORDER (FINAL)

Timestamp: 2026-09-29T02:45Z · Posture: MAXIMUM SAFE PARALLELISM (mission §31)

## Workstream graph (ownership isolation verified — 23 surfaces, 0 overlaps)

```
W01 {shell, today}                       711 obligations
W02 {library, learn, rq, visualize}     1485 obligations
W03 {enterprise, scenarios, labs, runs, results}  2183
W04 {evidence, reviews, mastery, portfolio}       1445
W05 {health, processing, validation, manual_ai, backup, audit, releases, configuration} 2827
```

## Dependency graph (verified edges only)

| Edge | Type | Evidence |
|---|---|---|
| ALL → W01 (shell nav, region grammar, deep-work shelf) | consume-only | shared ownership map |
| ALL → W02 (accessibility/keyboard/RTL-BIDI/responsive/customization **policy**) | consume-only | two-field model (A-4) |
| ALL → W05 (persistence kernel + seed CBF-001; SC-011 preferences) | consume-only | CBF-001/MFC-PF-003 |
| W04 → ALL (evidence receipt contract) | contract | F-051 class |
| W02 ⇄ W03 (spatial engine; compare engine rq/results providers) | shared kernel, 2 consumers | code chain |
| W03 → W05 (run state persistence) | data | persistence kernel |
| ALL → serialized `main.ts` + `m0-controller-composition.ts` | hotspot | K-03 locks |

## Parallel wave plan

| Wave | Group | Contents | Preconditions |
|---|---|---|---|
| PW-A | **P1 = {W01, W02, W04} ∥ P2 = {W05 first-phase: persistence/CBF-001 + SC-011}** | W05's persistence work is a dependency of seeded surfaces → run W05's CBF-001/MFC-PF-003 phase FIRST inside the same wave | packets issued; branch `writer/mi-serial` created from `writer/cep-serial` |
| PW-B | W03 full + W05 remaining | W03 seeded-surface work after persistence truth lands | PW-A persistence phase checkpointed |
| PW-C | Serialized integration slot | `main.ts` + `m0-controller-composition.ts` deltas from all workspaces, one writer slot at a time, Controller-assigned order | PW-A/PW-B checkpoints green |
| PW-D | Independent proof (D14-class) | frozen row-addressable obligation manifest replay + genuine-browser receipt on exact successor | PW-C complete |

Internal parallelism: W05A/W05B sub-lanes may run parallel under single W05 ownership (RC-WS-1).

## Merge-risk map (final)

| Risk | Hotspot | Rule |
|---|---|---|
| HIGH | `main.ts`, `surfaces/m0-controller-composition.ts` | serialized slot only (PW-C) |
| HIGH | shared kernels (shell nav, structured bridge, spatial, replay, deep-work, preferences, command bus) | exactly one writer per mechanic; consumers read-only |
| MEDIUM | `dist/` regeneration (committed build output) | build + commit within own workspace checkpoint only; never commit another workspace's regenerated dist |
| MEDIUM | `assurance/**` receipts | workspace-scoped evidence dirs (`evidence/<workspace>/…`) |
| MEDIUM | health/processing duplicate-module risk (OC-C-06) | duplication ban in W05 packet |
| LOW | profiles/contracts registries | Controller-owned; Writers propose, Controller integrates |

## Integration order

1. Per-surface completion proofs inside each workspace (packets' §19).
2. Workspace-level integration checkpoint (one commit per workspace, serial branch).
3. PW-C serialized hotspot integration (Controller slot order: W05 persistence → W01 shell → W02 kernels → W03 → W04).
4. PW-D independent proof: obligation-manifest replay + genuine-browser receipt bound to exact successor identity.
5. Controller adjudication → Product acceptance remains Owner-only.

## Checkpoint order

C-BOOT → C-SOURCE → C-TRUTH → C-HISTORY → C-FOUNDATION → C-BROWSER → C-PACKET → C-DISPATCH → (post-dispatch) per-workspace checkpoints → serialized integration → independent proof.
