# 12_execution / 06_unified_disposition_policy — P1…P6 (BINDING on all Writers)

Timestamp: 2026-09-29T05:30Z · Authority: Pro critical review (mission §27 escalation) · Enforced by
`tools/writer-acceptance-matrix.py` (hard guards) and `--aggregate` (cross-matrix consistency).

## 0. Why this exists

W01, W03 and W04 dispositioned the *same classes* of rows with **opposite outcomes** from real
measured proofs. Measured before correction: `--aggregate` reported **111 conflicts across 180
replicated subjects** (e.g. `C09` = BLOCKED in W01, PASS in W02; `A3-GUI-001` swept to PASS by a
surface route test that never touches WorkspaceHost pane collapse).

Pro verdict: **neither treatment was correct.**

- W04/W03's per-surface sweep is a **manufactured PASS** — a suite that does not address a row's
  `proof_requirement` cannot discharge it. The row text itself forbids it: *"do not inherit
  historical PASS"*.
- W01's blanket `BLOCKED` ("Controller/Owner-plane evidence not held") rests on a **false
  custodianship claim** — `CONTROLLER_ZERO_LOSS_EVIDENCE` is an evidence-*grade* classification,
  not a custody claim. The decision register shows these decisions are **already ratified**
  (`status=ACTIVE`, `current_implication=BINDS_WRITER_PACKETS`).
- W01's 28 `PASS` rows were **circular**: `P-MATRIX-ZEROLOSS` = the matrix generator proving the
  matrix.

## 1. Disposition rules (apply in precedence order)

| # | Row class | Disposition |
|---|---|---|
| **P1** | Open-question rows | `literal BLOCKED`. Match the Q-subject (Q-1 `destinationCountFrozen`, Q-2 Today provider owner, Q-3 `REVIEWED_FINAL_CANDIDATE`, Q-4 TimelineReplayOwner, Q-5 grouping authority, Q-6 Manual-AI provenance). Justification names the **Q-id** + cites `controller/03_historical/open_questions.md`. *This is the only class blocked for "pending Owner".* |
| **P2** | Non-law rows | `literal NOT_APPLICABLE_WITH_PROOF`: `VISUAL_REFERENCE` (cite K-05), `AUTHORITY_RECOVERY_ARCHAEOLOGY` (cite packet §17-class), `temporal_disposition=HISTORICAL_DURABLE_GUARDRAIL` (cite `controller_conflict_flag`), `proof_requirement` = "Future D0x Mission material" (cite the row's own binding). |
| **P3** | `OWNER_DECISION` — **one rule per `component` (decision id)** | discharged by **(a)** the ratified-decision binding proof **and** **(b)** a subject-matched measured implementation proof named by the row's `proof_requirement`. `notes__contains: ACTIVE_PLATFORM_GATED` → `literal BLOCKED` citing the platform gate. `OWNER_ACCEPTANCE_PENDING` norms → `literal BLOCKED` citing `authority/OPEN_OWNER_DECISIONS.md`. No producible proof → `literal BLOCKED` naming the **exact missing artifact** ("no `<X>` closure proof exists for decision `<id>`"), never "evidence held elsewhere". |
| **P4** | `OWNER_QA_DEEP_AUDIT` — **one rule per finding id (`component`)** | `derived_from_proof` = the closure suite **with per-finding named subtests**. No such suite → `literal BLOCKED` per finding naming the missing matched-executable-consumer proof. `directive=PRESERVE` rows use the same shape (proof of preservation). **Closure is a global fact**: the same finding id must resolve to the same status in every workspace (see `writer-output/_coordinator/OWNER_QA_CLOSURE_REGISTER.csv`). |
| **P5** | ZL01 rows | Lane/durable grouping allowed **only within one `proof_requirement` value and one lane proof** (`ZL01_DURABLE_ANCILLARY` "Same affected Surface/component lane" is genuinely lane-shaped). Root findings with `OPEN|BLOCKING|CURRENT_BLOCKER|…` tokens → `literal BLOCKED` **pinned per finding id** for cross-workspace consistency. |
| **P6** | Proof hygiene (**hard-enforced**) | (i) a rule covering `OWNER_DECISION`/`OWNER_QA_DEEP_AUDIT` rows must key on the row **subject** (`component`/`obligation_id`/`source_key`); (ii) no rule may match on `surface` or `source_layer` alone; (iii) **no self-referential proof** — `writer-acceptance-matrix.py` may never appear in a discharge list; (iv) build steps (`build-runtime`) and `npm test`/model suites are **preconditions only**, never the sole basis for PASS. |

## 2. Granularity test (the crisp rule)

A rule may cover a set of rows **iff**:
- **(a)** the rows have the **identical `proof_requirement`** value, **and**
- **(b)** every row's specific subject (finding id / decision id / lane) is genuinely discharged by
  the named proof artifact.

## 3. Shared proof artifacts (use these; do not re-implement)

| Artifact | Command | Proves |
|---|---|---|
| decision binding | `python3 tools/owner-decision-binding-check.py --decision <id> --cite "<id> @ cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv"` | P3(a): decision is `ACTIVE`/`ACTIVE_PLATFORM_GATED` and cited |
| decision table | `python3 tools/owner-decision-binding-check.py --list` | authoring reference |
| QA closure register | `writer-output/_coordinator/OWNER_QA_CLOSURE_REGISTER.csv` (regen: `python3 tools/owner-qa-closure-register.py`) | P4: 98 finding ids, 54 replicated across >1 workspace |
| candidate identity | `node tools/writer-candidate-identity.mjs --workspace <WS> --json` | `OWNED_PARTITION_SHA256` binding (see `03_lineage_adjudication.md`) |

## 4. Enforcement

- `tools/writer-acceptance-matrix.py` **hard-fails** on any P6 violation, naming the rule and the row.
- `python3 tools/writer-acceptance-matrix.py --workspace W01 --aggregate` now reports
  `cross_matrix_consistency.conflicts` and **exits 1** while any conflict remains. It also prints the
  corpus total: 8,651 obligations across 5 workspaces.

## 5. Correction set

| Workspace | Committed | Action |
|---|---|---|
| W01 | `61ee12d` (+ residual round) | **forward correcting commit** — replace `R-OD-OWNER-EVIDENCE-BLOCKED` (116 rows) and `R-OD-ZEROLOSS` (28) with per-decision P3 rules; replace `R-QA-DEEP-AUDIT-BLOCKED` with per-finding P4 rules; drop `P-MATRIX-ZEROLOSS` from every discharge list |
| W02 | not yet committed | adopt P1–P6 before generation; **remove the banned self-reference `P-ZEROLOSS`** from all discharge lists |
| W03 | `f9d5a4d` | **forward correcting commit** — same sweep defect (`R-OWNERDECISION-*`, `R-OWNERQADEEPAUDIT-*`) |
| W04 | `81a2732` | **forward correcting commit** — split the 4 surface sweeps into P3/P4 rules; restate handoff claims ("291/291 PASS", "216/216 PASS") |
| W05 | not yet committed | adopt P1–P6 before generation |

**History is never rewritten** — corrections are forward commits. The pre-correction matrices are
evidence of the dispute and are preserved.

## 6. Expected corrected landscape

The corrected matrices will show **large legitimate BLOCKED sets in the OWNER layers**. That is the
truthful state. A high PASS count is not a success metric; a defensible disposition is.
