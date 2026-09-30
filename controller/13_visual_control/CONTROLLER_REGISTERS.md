# CONTROLLER REGISTERS

**Controller:** MiMo-V2.6-Pro · **Branch:** `writer/mi-serial`
**Authority:** Master Controller Contract §14/§15/§32 — the repository is the durable truth; chat memory is not.
**Companion:** `PREPARATION_GAP_REGISTER.md` (preparation gaps) · `../10_dispatch/SURFACE_DISPATCH_MATRIX.json` (ownership/dependency/reference map)

**Status vocabulary:** `PASS` · `PASS_WITH_LIMITATION` · `BLOCKED` · `UNKNOWN` · `NOT_STARTED` · `REOPENED`
**Acceptance authority:** Controller is final acceptance authority unless a genuine Owner decision is required. **Writers cannot accept their own work** — status stays `NOT_OWNER_ACCEPTED` until Controller review.

---

## 1. VISUAL DEFECT REGISTER

Severity `V0` cosmetic · `V1` minor inconsistency · `V2` meaningful mismatch · `V3` major mismatch · `V4` material surface failure.
Root cause: `SURFACE_COMPOSITION` · `SHARED_COMPONENT` · `CONTENT_MODEL` · `FIXTURE_DATA` · `RESPONSIVE_RULE` · `ARCHITECTURE` · `OWNER_CONSTRAINT` · `STALE_DECISION` · `IMPLEMENTATION` · `EVIDENCE/ORACLE` · `UNKNOWN`.

Repair loop contract: **DEFECT → SEVERITY → ROOT CAUSE HYPOTHESIS → CHANGE → EVIDENCE → RE-COMPARISON → ACCEPT / REOPEN**.

| Defect | Surface/Scope | Sev | Root cause hypothesis | Change | Evidence | Re-comparison | State |
|---|---|---|---|---|---|---|---|
| VD-001 | All 23 surfaces | V4 | SURFACE_COMPOSITION — surfaces render as interchangeable card grids with weak identity, mixed-language labels, dead lower regions | Per-surface rewrite in composition (23 surface units) | Owner visual rejection (contract §0) + `assurance/browser-workspace-pane-context.png` (sha256 `e307352f…`, 900×980) | pending | OPEN |
| VD-002 | Scenarios, Labs (and other operational surfaces) | V4 | STALE_DECISION — Library/Learn composition conceptually cloned into unrelated surfaces | Anti-cloning rule encoded in standard + packets; W03-SCENARIOS packet flags this as the historical failure site | contract §5/§34 | pending | OPEN |
| VD-003 | Global language/direction | V3 | STALE_DECISION — Arabic baked in as product-language authority (`locale:{safeDefault:'ar'}`, `<html dir="rtl" lang="ar">`) | Dispatched to `W05-CONFIGURATION` (owns preferences/settings seams) | `foundation/global/preferences/schema.ts`, `dist/index.html` | pending | OPEN |
| VD-004 | RQ surface | V2 | STALE_DECISION — reference authority unresolved (`REVIEWED_FINAL_CANDIDATE`, never promoted) | Bound as `CANDIDATE__AUTHORITY_UNRESOLVED`; Writer must report the gap, must not promote | `FINAL_VISUAL_REFERENCE_REGISTER.md` | pending | OPEN |
| VD-005 | Writer execution system (W01-TODAY, W05-AUDIT both affected) | V3 | ARCHITECTURE — Flash Writers attempt wholesale rewrites of 20–75 KB surface files (`today/presentation.ts` 39,723 B, `audit/index.ts` 27,876 B) and exhaust output budget mid-build. Sessions terminate with a work-in-progress fragment and **no report**. Capability is fine (W01-TODAY correctly decomposed the reference into regions and captured AR/RTL + EN/LTR baselines at 480/768/1024/1280); **completion** is the failure. | Added §17 BUDGET DISCIPLINE & COMPLETION GUARANTEE to `VISUAL_EXECUTION_STANDARD.md`: surgical edits over full rewrites, vertical slices, report written incrementally and prioritised above all else | 2 premature-termination sessions; `surfaces/today/presentation.ts` and `surfaces/audit/index.ts` both unchanged (mtimes predate writer runs) | re-launch as continuation | ACCEPTED FIX — monitoring |
| VD-006 | Global shell chrome (top bar) | V1 | SURFACE_COMPOSITION / RESPONSIVE_RULE — top chrome truncates at 1505px: search field clips to "Search or com…", and the W01 area label clips to a stray "ay W01" fragment alongside unexplained ← → glyphs. Visible in BOTH directions. Routed to the shell owner, not to individual surface writers. | pending | Controller vision on `writer-output/W02-RESEARCH-QUALITY/evidence/final/1505x1045-ltr.png` (sha256 `ea8d707f…`) and `-rtl.png` (sha256 `fec380c7…`) | pending | OPEN — assigned W01-SHELL |
| VD-007 | RQ surface | V3 | EVIDENCE/ORACLE — Writer session image-return channel served stale bytes (a fresh canary PNG rendered back as an older screenshot), so the Writer could not satisfy `visual-fidelity-review` R3 and correctly refused to claim vision. | Writer mitigated with hash-bound pixel metrics + DOM/contrast probes + tesseract OCR of both images; Controller performed the vision confirmation | canary `evidence/look/canary_7391.png` sha256 `6d663a1f…` | Controller read of final captures confirms surface as reported | **ACCEPTED — closed by Controller vision**. Harness defect worth noting for future sessions. |
| VD-008 | **Controller image-read channel (affects all vision verification)** | V3 | EVIDENCE/ORACLE — the image-read channel returns **intermittently stale frames**. Confirmed by controlled test: reading `writer-output/W03-SCENARIOS/evidence/evidence/scenarios-en-1505x1045-20260930T024435Z.png` (sha256 `1ff05c8b…`) returned an RQ screenshot, while OCR of the same file proves it contains the Scenarios surface. A `/tmp` canary (magenta/yellow/blue, sha256 `30dea5c7…`) rendered correctly, and OCR of `W02-RESEARCH-QUALITY/evidence/final/1505x1045-rtl.png` confirms my earlier RQ read was accurate — so the channel is **unreliable per-read, not uniformly broken**. | **Rule added: never issue a visual verdict without a ground-truth cross-check (sha256 + tesseract OCR of the same bytes).** Pixel-diff ground truth used to prove the two files differ 54.58%. | canary `30dea5c7…` PASS; `scenarios-en` read WRONG; `rq-rtl` read CORRECT | n/a | **OPEN — mitigation in force.** All vision verdicts now carry an OCR/hash cross-check. |

---

## 2. SHARED-COMPONENT RISK REGISTER

Protocol (contract §25): owner → contract → consumers → current behavior → reference expectations → historical assumptions → root cause → shared-vs-local → smallest correct change → regression every material consumer.

| ID | Shared component / seam | Owner | Consumers | Risk | Mitigation | State |
|---|---|---|---|---|---|---|
| SC-01 | `foundation/global/shell/navigation.ts` + `cep-destinations.ts` | W01-SHELL | all 23 surfaces | Global chrome change ripples everywhere | Single owner; everyone else requests via `tools/writer-serial.sh` | MONITORED |
| SC-02 | `foundation/global/preferences/` + `settings/` | W05-CONFIGURATION | all surfaces (language/direction) | Language policy is cross-cutting | Single owner; G-20 fixed at shared level, not per-consumer | ACTIVE (VD-003) |
| SC-03 | `foundation/extensions.css`, `workspace*.ts`, `pane-layout.ts`, `region-contract.ts` | W01-SHELL | all surfaces | Shared visual tokens could flatten surface identity | Shared governs MECHANICS only; composition stays local | MONITORED |
| SC-04 | `surfaces/m0-controller-composition.ts`, `main.ts` | W01-SHELL | all surfaces | Composition root collision | Controller-owned integration; serialized | MONITORED |
| SC-05 | `surfaces/composition/w0*-rescue.ts` | per-wave owner | cross-surface rescue | Multi-surface mount points | One owner each (see PARALLEL_EXECUTION_PLAN §1) | MONITORED |
| SC-06 | `dist/**` (generated) | **Controller** | everyone | **Global collision** — every `npm run build:runtime` rewrites the tree | Serialized via `tools/writer-serial.sh`; writers never commit `dist/` concurrently | ACTIVE |
| SC-07 | Library tree/panel mechanics (donor) | W02-LIBRARY | LEARN, VISUALIZE TREE-VIEW | Donor thrash, or composition leakage into donees | WAVE-2 serialization; donor is MECHANICS-only, never composition | ACTIVE |

---

## 3. ACCEPTANCE REGISTER

Dimensions required (all relevant): FUNCTION · STRUCTURE · VISUAL FIDELITY · DENSITY · CONTENT COMPLETENESS · RESPONSIVE BEHAVIOR · RTL/LTR/BIDI · REFERENCE CONSISTENCY · ARCHITECTURAL CONSISTENCY · SHARED-COMPONENT APPROPRIATENESS · EVIDENCE LINEAGE.

| Unit | Surface | Writer report | Controller re-verification | Acceptance | Notes |
|---|---|---|---|---|---|
| W01-TODAY | today | **DELIVERED** (report + HANDOFF, 23 §12 fields) | D07 suite re-run by Controller: 15/15 PASS, harness correctly flagged `TEST_ONLY_PRESENTATION_HARNESS__NOT_PRODUCT_PROVIDER_TRUTH`, `leaksIntoProduct:false`. Writable-root discipline verified (only `surfaces/today/presentation.ts` + `adapters/today/acceptance-data.ts`). §17 budget discipline worked — 14 bounded region edits, no wholesale rewrite. | **VISUAL_PASS_PENDING_OWNER** | b1: product route cannot show populated Today content (needs W01-SHELL provider wiring via serialized slot). b3/D-11: vertical rhythm still looser than reference. EN/LTR frame requires vision re-check (see VD-008). |
| W03-SCENARIOS | scenarios | **DELIVERED** (report + HANDOFF + 7 receipts + 8 hash-bound frames) | Committed candidate `4053087` == captured candidate (DIST_SYNC proves byte-identity). **Anti-cloning verified**: carrier.mjs 38/38 proves donor Library nodes / `m0-domain-nav` / `#editorDocument` absent. OCR ground truth of `scenarios-en-1505x1045` confirms a genuine scenario authoring workbench (Phases 01–04, Events, Injects, Decision Points, Lab Modules, Timeline/Flow/Topology/Canvas, Validate/Publish/Prepare Run) — NOT a Library/Learn clone. npm test 210/0. | **PASS_WITH_LIMITATION** | Model-vision re-verification open (VD-008). Declared deviation: center ink 1.98× reference, structural cause (shell pane widths 304/420) — routed to W05-CONFIGURATION/W01-SHELL, not hidden. |
| W02-RESEARCH-QUALITY | rq | **DELIVERED** (complete machine-readable report + HANDOFF + 26 evidence entries) | **CONTROLLER REVIEWED — vision-verified both directions** (RTL `fec380c7…`, LTR `ea8d707f…`, both 1505×1045, hashes match report). Confirmed: purpose-built reconciliation workspace, not a Library/Learn clone; bilingual parity real; intentional density, no dead zones; honest truth-state disclosure. D-08 resolved by Controller-side vision. b4 build break resolved (build authority now PASS, 290 files, 210/0). | **VISUAL_PASS_PENDING_OWNER** — Writer status correctly held at `NOT_OWNER_ACCEPTED` | b2 mount hunk still filed-not-applied (Controller owns `m0-controller-composition.ts`). Independent V1 defect VD-006 (shell chrome truncation). |
| W03-SCENARIOS | scenarios | pending | pending | NOT_STARTED | Wave-1 · anti-cloning failure site |
| W04-EVIDENCE | evidence | pending | pending | NOT_STARTED | Wave-1 · Arabic reference must not set product default |
| W05-AUDIT | audit | pending | pending | NOT_STARTED | Wave-1 |
| W05-CONFIGURATION | configuration | **DELIVERED** (report + HANDOFF + 23/23 hash-verified captures) | **G-20 VERIFIED FIXED AT ROOT** by Controller: `dist/index.html` now bare `<html>` (0 baked dir/lang); `language-policy.ts` single resolver with `productLanguageAuthority:null` and `privilegedProductLanguage:null`; order = user preference → browsing-context language → schema placeholder (unreachable in a browsing context); direction derived from active locale unless user-pinned. Root cause correctly identified: `dist/index.html` is *generated* by `tools/extract_donor.py` under a ZERO_DELTA hash guard, so direct edits are silently reverted — generator patched through the serialized slot and hash re-frozen. Verified 4/4 G-20 shell cases incl. main.js blocked and JS disabled. 16 defects fixed (2 V4, 3 V3, 6 V2, 5 V1). | **VISUAL_PASS_PENDING_OWNER** | O-01 donor chrome hardcodes Arabic → W01-SHELL. O-02 pane proportions → **adjudicated below**. O-04 manifest entry fixed by Controller. |
| W02-LIBRARY | library | pending | pending | NOT_STARTED | Wave-2 (donor-coupled) |
| W02-LEARN | learn | pending | pending | NOT_STARTED | Wave-2 |
| W02-VISUALIZE | visualize | pending | pending | NOT_STARTED | Wave-2 · **VISUALIZE TREE-VIEW** (not "Visualize Review") |
| W03-ENTERPRISE | enterprise | pending | pending | NOT_STARTED | Wave-3 |
| W03-LABS | labs | pending | pending | NOT_STARTED | Wave-3 · anti-cloning failure site |
| W03-RUNS | runs | pending | pending | NOT_STARTED | Wave-3 |
| W03-RESULTS | results | pending | pending | NOT_STARTED | Wave-3 · depends on W03-RUNS |
| W04-REVIEWS | reviews | pending | pending | NOT_STARTED | Wave-3 · depends on W04-EVIDENCE |
| W04-MASTERY | mastery | pending | pending | NOT_STARTED | Wave-3 |
| W04-PORTFOLIO | portfolio | pending | pending | NOT_STARTED | Wave-3 |
| W05-HEALTH | health | pending | pending | NOT_STARTED | Wave-3 |
| W05-PROCESSING | processing | pending | pending | NOT_STARTED | Wave-3 · reference `INTENTIONALLY_NOT_GENERATED` (contract-derivable) |
| W05-VALIDATION | validation | pending | pending | NOT_STARTED | Wave-3 · owns `w05-rescue` seam |
| W05-MANUAL-AI | manual_ai | pending | pending | NOT_STARTED | Wave-3 |
| W05-BACKUP | backup | pending | pending | NOT_STARTED | Wave-3 |
| W05-RELEASES | releases | pending | pending | NOT_STARTED | Wave-3 |
| W01-SHELL | shell | pending | pending | NOT_STARTED | Wave-4 · global chrome seams |

---

## 4. EVIDENCE / LINEAGE MAP

Binding required on every artifact: candidate · commit/tree · environment · test · viewport · timestamp · **image identity** (path + sha256 + dims).

| Evidence | Bound candidate | Image identity | Class | State |
|---|---|---|---|---|
| `assurance/browser-workspace-pane-context.png` | worktree `c82cec63…` | sha256 `e307352f562e472de5f0351671ffdaf129bbe08c38a6c4853188b104ae10993a`, 900×980, 87,369 B | CURRENT_RESULT (pre-remediation baseline) | RETAINED — used for VD-001 |
| `assurance/BROWSER_CONFORMANCE_RECEIPT.json` | source tree `64d103fa…` vs current `7b01a08d…` | n/a | stale | **ORPHANED LINEAGE (G-24/G-36)** — 6 flows / 1 pass / 5 fail. Requires re-bind. |
| Vision capability test | live | sha256 `e307352f…` (same bytes read and interpreted) | CAPABILITY_PROOF | **PASS** (contract §20) — OpenCode image delivery + Controller vision + provider image input all confirmed |

**Image-identity discipline:** before any visual claim, confirm the analysed bytes are the claimed bytes (path + sha256 + dims). A moving-worktree capture is not canonical without lineage labelling. Superseded captures are retained and labelled, never reused as current proof.

---

## 5. EXECUTION CHECKPOINTS

| # | Checkpoint | Result |
|---|---|---|
| CP-1 | Truth reconstruction (repo, references, requirements, decisions, historical, evidence) | PASS — 2 recon passes, 23-surface census confirmed, reference register located |
| CP-2 | Governance repair (§3/§8/§13) | PASS — reference-demotion removed; standard + packet inheritance in place |
| CP-3 | Skills created (§12) | PASS — 4/4 persisted and discoverable |
| CP-4 | Dispatch rebuilt (§7/§23) | PASS — 23 units, computed reference identity, collision seams declared |
| CP-5 | Capability gates (§20/§21/§30) | PASS — vision empirical, models live, preview/capture flow confirmed |
| CP-6 | Governance durable in repo | PASS — commit `7c9c153` |
| CP-7 | Wave-1 launch | **IN PROGRESS** — 6 Writers live on `mimo-v2.6-flash` |
| CP-8 | Controller review of Wave-1 | NOT_STARTED |
| CP-9 | Wave-2/3/4 launch | NOT_STARTED |
| CP-10 | Final integration + candidate identity + lineage verification | NOT_STARTED |

---

## 6. CONTROLLER ARCHITECTURAL DECISIONS

Decisions the Controller is authorised to make under the Owner escalation gate (B: implementation detail; C: UI/UX detail with a clearly superior professional solution). Recorded so they are durable and not re-litigated.

### AD-01 — Pane proportions are a SHARED defect, fix at shared level (adjudicates O-02)

**Finding:** `foundation/global/pane-layout.ts` hardcodes defaults `left: 304`, `right: 420` (lines 62–63, 202); `dist/model-tests.js` freezes `rightWidth` `preferredValue===420`. Measured proportions are **19.8% / 51.4% / 27.3%** against the reference's **~16% / ~65% / ~17%**.

**Root cause class:** `SHARED_COMPONENT` — not a per-surface defect. The center work area is ~13.6 points too narrow on **every** surface.

**Why this matters beyond cosmetics:** the Owner rejected "pane organization", "density/balance", and "the center doesn't feel like actual work". A center capped at ~51% of width is a *systemic* cause of exactly that complaint across all 23 surfaces. Per `shared-component-governance` R4, patching this in 23 consumers would be wrong; the shared default is the defect.

**Decision: AUTHORIZED as a shared-level change.** The visual reference is construction authority for pane organization and spatial relationships (standard §2), so the target is reference-derived rather than a matter of taste. This is escalation-gate B/C — an implementation and layout detail with a clearly superior, reference-driven solution. **Not an Owner escalation.**

**Constraints (§25 protocol):**
1. Smallest correct change: adjust shared defaults toward the reference proportion; update the frozen `rightWidth` preference fixture accordingly.
2. **Sequenced as WAVE-4** (shell/shared slot) — after surface waves land, so concurrent writers' captures are not invalidated mid-flight.
3. Regression-check **every material consumer** (all 23 surfaces) at L1–L3 after the change.
4. Existing captures are evidence, retained and labelled superseded — not sacred. Re-capture after the change.
5. Owner: `W01-SHELL`, executed through `tools/writer-serial.sh`.

**State:** AUTHORIZED · NOT_STARTED · sequenced WAVE-4

### AD-02 — Donor/shared chrome Arabic hardcoding (adjudicates O-01)

**Finding:** shared/donor chrome hardcodes Arabic strings (pane-toggle labels, bottom shelf, skip link, donor banner badge, context lens tabs), producing mixed-language chrome around fully localized surfaces.

**Root cause class:** `STALE_DECISION` — same class as G-20/VD-003. Now that no language is privileged, hardcoded Arabic in *shared* chrome is inconsistent with the Owner's policy.

**Decision: fix at shared level**, owned by `W01-SHELL` (donor chrome). Do not localize per surface. Routed, not escalated.

**State:** ROUTED · OPEN

---

## 7. REMEDIATION STATUS

| Item | Owner | State |
|---|---|---|
| G-24/G-36 stale browser conformance receipt lineage | Controller | OPEN — re-bind to current candidate before final integration |
| G-35 pre-existing manifest drift (10+ entries) | Controller | OPEN — per-entry adjudication; deliberately not auto-absorbed |
| G-33 repository/evidence hygiene (674 MB, 1000 PNGs) | Controller | OPEN — classification done in gap register §D; removal deferred until lineage extracted |
| G-20 language/direction authority defect | W05-CONFIGURATION | DISPATCHED |
| G-21/G-25 visual + structural surface rejection | 23 surface units | DISPATCHED (Wave-1 live) |
