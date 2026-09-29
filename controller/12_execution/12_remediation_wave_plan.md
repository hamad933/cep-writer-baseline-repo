# 12_execution / 12_remediation_wave_plan — routing after the 23-surface visual re-audit

Timestamp: 2026-09-29T07:10Z · Author: Writer Coordinator · All 23 surfaces audited; remediation waves dispatched.

## 1. Register state at dispatch (23/23 audited)

| visual_status | n | surfaces |
|---|---|---|
| `VISUAL_FAIL` | 20 | today, library, learn, visualize, enterprise, scenarios, labs, runs, evidence, reviews, mastery, portfolio, health, processing, validation, manual_ai, backup, audit, releases, configuration |
| `BLOCKED` | 2 | **results** (provider unavailable — W05 dependency) · **rq** (Q-3 non-final reference) |
| `ACCEPTANCE_REQUIRES_REVIEW` | 1 | shell (Owner-reopened visual, OWNER-20260910-010) |

Severity: **16 V4**, 7 V3. Root cause: 8 `SHARED_COMPONENT` · 8 `CONTENT_MODEL` · 5 `SURFACE_COMPOSITION` · 1 `OWNER_CONSTRAINT` · 1 `EVIDENCE/ORACLE`.

## 2. Live remediation wave (5 concurrent, disjoint file sets)

| Agent | Scope | Session |
|---|---|---|
| **Shared component follow-ups** | F1 `adapters/structured-documents.ts` scaffold · F2 `.phead h2` LTR clipping · F3 `SpatialPresentationOwner` node-card/edge primitives · F4 Visualize tree-view → shared outline host · F5 bottom-shelf seam | `ses_f11d20979ffegB5K3m57c6aZDs` |
| **W03 surface remediation** | DEF-SCN-1/DEF-LAB-1 (V4 identity absent) · DEF-ENT-1..5 · DEF-RUN-1..3 · DEF-RES-2 | `ses_f11d20969ffeNc4SG84mMbbKaS` |
| **W04 surface remediation** | D9/D10/D11 · M1/M2 · R1 · P2/P3 | `ses_f11d15b57ffe1uiaDR7dTpBMQA` |
| **W05 surface remediation** | H-1/H-2 · P-1..P-5 · V-1/V-2 · MA-1/MA-2 · B-1/B-4 · A-1/A-2 · R-1/R-2 · C-1/C-2 | `ses_f11d2096fffeFP0R02D12ePjh6` |
| **Acceptance-matrix policy correction** | P1-P6 regeneration across all 5 matrices → `cross_matrix_consistency.conflicts = 0` | `ses_f11fd04bbffekh23GQvanLfgJX` |

## 3. Deliberately deferred (dependency-ordered, not idle)

| Surface | Why deferred | Unblocked by |
|---|---|---|
| **visualize** (partly) | F3/F4 are shared primitives being fixed *now*; surface Writers must not work around a shared defect (directive §5) | shared follow-ups agent |
| **learn** | `normalizeSource` fails closed with **no canonical learning source bound** — filling it would be inventing product facts (§6/§7) | **Owner STOP/REPORT** (source binding) |
| **today** (partly) | provider composition unbound = **Q-2**; the LEFT `Filter` defect needs the filed serialized-hotspot hunk | Owner Q-2 + Coordinator PW-C slot 2 |
| **shell** | identity chrome is **Owner-reopened** (OWNER-20260910-010); the `W0x` token leak is shared chrome | Owner + shared chrome fix |
| **library** | independent — queued behind W02's shared primitives to avoid churn in the same files | next wave |
| **rq** | **Q-3** non-final reference | Owner Q-3 |
| **results** | provider unavailable — W05 CBF-001/SC-011 dependency | W05 persistence integration |

## 4. Serialization points (unchanged)

`main.ts` and `surfaces/m0-controller-composition.ts` → Coordinator PW-C slot only, order
`W05 persistence → W01 shell → W02 kernels → W03 → W04`. `dist/**` and `assurance/**` writes →
`tools/writer-serial.sh`. Git history → Coordinator only. Source-correspondence rule for `dist/`
(IN-3 refined) applies to every commit.

## 5. Acceptance gate that will be applied at the end

The 18-box gate in `07_visual_fidelity_governance.md` §10, plus the evidence contract's lineage
binding, plus `cross_matrix_consistency.conflicts == 0`. **No surface reaches `VISUAL_PASS` on
functional evidence alone.** Every remaining difference must be explicitly justified as
architecture, Owner decision, responsive/contextual, accessibility or functional.

## 6. Owner decisions still required

1. **Product language** — `CEP-VIS-001-FINAL` is Arabic-first; every current centre is English
   (`OWNER_CONSTRAINT`, affects health/evidence/mastery and the shell identity chrome).
2. **Q-1** shell destination count · **Q-2** Today provider owner · **Q-3** RQ visual ceiling ·
   **Q-4** TimelineReplayOwner retain-vs-retire · **Q-5** Portfolio grouping authority ·
   **Q-6** Manual-AI provenance mechanism.
3. **C03-GATE-020** Owner matched-viewport image inspection — present self-identifying composites
   + a hash manifest, **not** raw files through the quarantined image channel
   (`11_evidence_channel_integrity.md`).
