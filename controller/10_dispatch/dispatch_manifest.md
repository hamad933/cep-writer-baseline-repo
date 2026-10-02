# 10_dispatch / dispatch_manifest (READY)

> **CURRENT CONTROLLER CEILING — 2026-10-02 (reconciled)**
> This manifest is **HISTORICAL DISPATCH-ERA EVIDENCE (2026-09-29)** — not current launch authority and not current topology.
> Its serial-order body (`OD-20260928-085` … "exactly one persistent sequential Writer") is superseded: the seriality reading was already superseded within the dispatch era by `controller/12_execution/02_parallel_dispatch.md` (Owner-directed parallel execution, 2026-09-29T03:45Z) and now by `OD-20261002-087` (parallel disjoint lanes, one Writer per bounded Surface/lane).
> Its durable value = dispatch-package composition, packet/CSV bindings, baseline identities and PW-A…PW-D integration order as historical lineage. Preserve the body as lineage; no dispatch may launch from this file alone.

Timestamp: 2026-09-29T03:00Z · Gate: `../11_gates/PRE_WRITER_DISPATCH_GATE.md` = PASS_WITH_LIMITATION (dispatch authorized)

## Dispatch package per Writer (exactly five; whole-workspace ownership)

| Order | Writer | Packet | Requirements input | Branch slot | Group |
|---|---|---|---|---|---|
| 1 | W01 | `../09_writer_forge/W01_writer_packet.md` | `W01_REQUIREMENTS.csv` (711) | `writer/mi-serial` (serial, from `writer/cep-serial@48fec276`) | P1 |
| 2 | W02 | `W02_writer_packet.md` | `W02_REQUIREMENTS.csv` (1,485) | same serial branch, sequential phases | P1 |
| 3 | W04 | `W04_writer_packet.md` | `W04_REQUIREMENTS.csv` (1,445) | same | P1 |
| 4 | W05 | `W05_writer_packet.md` | `W05_REQUIREMENTS.csv` (2,827) | same (W05A/W05B internal phases) | P2-first |
| 5 | W03 | `W03_writer_packet.md` | `W03_REQUIREMENTS.csv` (2,183) | same (after W05 persistence phase) | P2 |

Per OD-20260928-085 carrier law (ROUTE-MIMO-AGENT): **exactly one persistent sequential Writer**;
per-milestone checkpoint commits across M1–M5 surface families. The table's "Order" is the sequential
execution order of workspace packets for that single Writer (maximum safe parallelism applies to
*workstream independence analysis* in `parallel_plan.md`; the carrier seriality law governs execution).

## Included in every dispatch

- Packet (26 contract items) + row-level requirements CSV (zero-loss coverage)
- Baseline bindings: CANONICAL `480dbe…/273` @ `293dd1e0`/`3101c069`; HEAD `48fec276`; worktree variant `c82cec63…` (3 deltas enumerated in `../08_evidence/worktree_disposition.md`)
- Shared-owner map + duplication bans (`../05_foundation/ownership_adjudication.md`)
- RCF taxonomy + proof templates (`../04_rcf/rcf_recovery.md`)
- Evidence/checkpoint contract (`../08_evidence/evidence_contract.md`)
- Browser contract + failure taxonomy (`../07_browser/`)
- Open questions Q-1…Q-6 with STOP/REPORT rules (`../03_historical/open_questions.md`)
- Must-never-promote list (`../03_historical/conflict_register.md`)

## Pre-dispatch mechanical actions

1. `git branch writer/mi-serial writer/cep-serial` (verify exact base `48fec276`, record binding).
2. Verify clean-enough baseline per W01 packet §2 (worktree delta acknowledged, not silently mixed).
3. Issue packet 1; checkpoint after each surface/finding closure; Controller adjudicates each handoff.

## Post-dispatch integration (from `parallel_plan.md`)

PW-A parallel wave → PW-B (W03 + W05 remainder) → PW-C serialized hotspot slot (order: W05 persistence → W01 shell → W02 kernels → W03 → W04) → PW-D independent proof (obligation-manifest replay + genuine-browser receipt on exact successor) → Controller adjudication → Owner acceptance only.
