# PREPARATION GAP REGISTER

**Controller:** MiMo-V2.6-Pro · **Writer model:** MiMo-V2.6-Flash (`xiaomi-token-plan-sgp/mimo-v2.6-flash`)
**Branch:** `writer/mi-serial` · **Workspace:** `/workspaces/cep-writer-baseline-repo`
**Authority:** CURRENT_OWNER_DIRECTIVE (Master Controller Contract) — this register is the audit of repository truth against that contract.

**Scope note:** This is NOT a product reset. Valid current implementation, architecture, contracts, and evidence lineage are preserved. This register records only gaps between the Master Controller Contract and repository state.

**Status vocabulary:** `OPEN` · `IN_REPAIR` · `CLOSED` · `NOT_APPLICABLE` · `ACCEPTED_LIMITATION`

---

## A. EXECUTION / GOVERNANCE GAPS

| ID | Gap | Contract § | Current state (evidence) | Severity | Root cause | Required repair | Status |
|---|---|---|---|---|---|---|---|
| G-01 | No persistent OpenCode skills existed | §12 | Zero `.opencode/`, zero `SKILL.md` anywhere (glob + grep) | V3 | ARCHITECTURE | Create exactly 4 skills with required sections | **CLOSED** — `.opencode/skills/{visual-surface-composition,visual-fidelity-review,shared-component-governance,professional-ui-ux-composition}/SKILL.md` |
| G-02 | Writer packets demote visual references to "presentation only" | §3/§13 | `cep-writer/WRITER_AUTHORITY_BASELINE.md:25`; `controller/09_writer_forge/W01_writer_packet.md:71`; `W02_writer_packet.md:62` | V4 | STALE_DECISION | Replace with construction-authority language | IN_REPAIR |
| G-03 | Visual lifecycle not inherited by Writers | §8/§13 | Lifecycle exists only in ephemeral Coordinator prompts; packets carry 26 mission items but no visual lifecycle | V4 | ARCHITECTURE | Durable standard + mandatory packet inheritance | IN_REPAIR |
| G-04 | Writer output schema absent from packets | §31 | Packets require obligation rows but not the SURFACE…BLOCKERS machine-readable visual record | V2 | ARCHITECTURE | Add mandatory output schema to standard + packets | IN_REPAIR |
| G-05 | Language requirements absent from packets | §1/§13 | No AR/EN/RTL/LTR/BIDI requirement in any Writer packet | V3 | STALE_DECISION | Add binding language policy to standard + packets | IN_REPAIR |
| G-06 | No prohibited-conceptual-cloning clause | §5/§26/§27/§34 | Historical failure (Library/Learn cloned into Scenarios/Labs) not encoded as a rule | V4 | STALE_DECISION | Hard anti-cloning rule in standard + packets | IN_REPAIR |
| G-07 | Acceptance + escalation rules not packet-inherited | §28/§29/§13 | Packets state "sole Controller review" but not acceptance dimensions or escalation gate | V2 | ARCHITECTURE | Add acceptance + escalation to standard + packets | IN_REPAIR |
| G-08 | Dispatch unit is 5 broad workspace packets, not 1 Writer = 1 Surface | §7/§23 | `controller/09_writer_forge/W01…W05_writer_packet.md`; `packet_status.md` "5/5 READY" | V4 | ARCHITECTURE | Rebuild to per-surface writer units from the 23-surface census | IN_REPAIR |
| G-09 | Writer model binding not recorded in packets | §7/§30/§33 | `mimo-v2.6-flash` referenced only in `controller/12_execution/02_parallel_dispatch.md:69-73` | V1 | ARCHITECTURE | Bind model in every packet + dispatch matrix | IN_REPAIR |
| G-10 | Controller registers not durable repo truth | §14/§15/§32 | No visual defect register, acceptance register, or evidence/lineage map as maintained artifacts | V2 | ARCHITECTURE | Create register set under `controller/13_visual_control/` | IN_REPAIR |
| G-11 | Protected historical files absent | §19 | All 3 protected paths missing from repo (they live in Google Drive per `authority/sources/control/00_CURRENT_CONTROL/CEP_CURRENT_CONTROLLER_STATE_v1.6.md:22`) | V0 | UNKNOWN | Map to nearest in-repo equivalents; do not recreate | **NOT_APPLICABLE** — nearest equivalents `authority/README.md`, `authority/CURRENT_AUTHORITY_REGISTRY.{json,csv}`, `authority/sources/mission/01_AUTHORITY/SOURCE_READ_ORDER_AND_PATHS_v1.0.csv` |

### G-02 repair sites (exact)

| File | Line | Poison text | Replacement intent |
|---|---|---|---|
| `cep-writer/WRITER_AUTHORITY_BASELINE.md` | 25 | `visual references govern Presentation only;` | References are CONSTRUCTION AUTHORITY for visual intent/composition/hierarchy/density/interaction |
| `controller/09_writer_forge/W01_writer_packet.md` | 71 | `visual references (presentation only)` | `visual references (CONSTRUCTION AUTHORITY — see VISUAL_EXECUTION_STANDARD.md §2)` |
| `controller/09_writer_forge/W02_writer_packet.md` | 62 | `visual references (presentation only)` | same |

**Out of scope (correct as-is — do NOT "fix"):**
- `tools/d07-visual-capture.mjs:2` "Screenshots prove Presentation only" — this is an *evidence* semantic (a screenshot evidences presentation state, not domain/canonical truth). Correct. Not reference-demotion.
- `controller/03_historical/**` and `controller/05_foundation/mechanic_owner_conflicts.md:255` — historical/control artifacts and a truth-ceiling statement about window state. Protected/historical. Do not rewrite.

---

## B. PRODUCT / VISUAL GAPS

| ID | Gap | Contract § | Current state (evidence) | Severity | Root cause | Required repair | Status |
|---|---|---|---|---|---|---|---|
| G-20 | Arabic hardcoded as product-language authority | §1 | `stack/native-typescript/foundation/global/preferences/schema.ts:2` `locale:{safeDefault:'ar',…}`; `dist/index.html:3` `<html dir="rtl" lang="ar">` | V3 | STALE_DECISION | Language must be user-configurable with **no** privileged product-language authority; document shell direction must follow the active preference, not a baked default | DISPATCHED (SHELL=W01 · CONFIGURATION=W05) |
| G-21 | Current rendered surfaces rejected by Owner | §0/§5/§35 | Owner reviewed prior outputs: rejected for presentation, UI/UX quality, composition, hierarchy, pane organization, density/balance, polish, identity, elegance | V4 | SURFACE_COMPOSITION | Substantial visual + structural improvement per surface; not cosmetic | DISPATCHED (23 surface writers) |
| G-22 | RQ reference authority unresolved | §4 | `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png` classified **`REVIEWED_FINAL_CANDIDATE`** in `FINAL_VISUAL_REFERENCE_REGISTER.md` — the ONLY reference not promoted past candidate | V2 | STALE_DECISION | Bind as CANDIDATE; do **not** silently promote to canonical; build to intent and flag authority gap | OPEN — bound as `CANDIDATE__AUTHORITY_UNRESOLVED` |
| G-23 | Reference-demotion language in repository README/manifests | §3/§13 | Generated manifests describe references as "Presentation authority inputs only" | V2 | STALE_DECISION | Correct classification: A. VISUAL REFERENCE AUTHORITY vs B. CURRENT RESULT vs C. EVIDENCE SCREENSHOT | IN_REPAIR |
| G-24 | Browser conformance receipt lineage-orphaned | §21/§28 | `assurance/BROWSER_CONFORMANCE_RECEIPT.json` — 6 total / 1 pass / 5 fail, orphaned lineage | V2 | EVIDENCE/ORACLE | Re-bind evidence to candidate+commit+viewport+image identity | OPEN |
| G-25 | Surface identity weak — surfaces read as generic/interchangeable | §5/§26/§35 | Verified visually: `assurance/browser-workspace-pane-context.png` (sha256 `e307352f…`, 900×980) shows six interchangeable rounded cards, mixed-language labels, dead lower third | V4 | SURFACE_COMPOSITION | Per-surface composition driven by purpose + reference; eliminate generic card grids | DISPATCHED (23 surface writers) |

### G-22 reference binding (do not promote)

- **Path:** `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png`
- **sha256:** `312bf193216402f8c16fb8c2bca424fa453d961e31f818ac0183cdf8e7b380c8` · **bytes:** 1,440,822
- **Register classification:** `REVIEWED_FINAL_CANDIDATE` · **Drive:** `16INkI_mgjhbCNig2PUqSvbzOdLEKJ1mQ`
- **Supersession lineage:** predecessor `image-gen-1(20260813-181407).png` superseded 2026-08-31 (moved to `SUPERSESSION_AND_EXCLUSIONS/…`, Drive-side, not in repo).
- **Bound authority status:** `CANDIDATE__AUTHORITY_UNRESOLVED`. Usable as CONSTRUCTION AUTHORITY for RQ visual intent. Its status must be reported as unresolved in every RQ evidence record until the Owner promotes it.

---

## C. CAPABILITY / ENVIRONMENT GAPS

| ID | Gate | Contract § | Result | Status |
|---|---|---|---|---|
| G-30 | Image/vision capability verified by real local-image test | §20 | **PASS (empirical).** Read `assurance/browser-workspace-pane-context.png` (sha256 `e307352f562e472de5f0351671ffdaf129bbe08c38a6c4853188b104ae10993a`, 900×980, 87,369 B) and derived actual rendered content from the bytes. Layers confirmed: OpenCode image delivery → Controller vision → provider image input | **CLOSED** |
| G-31 | Model bindings available | §30/§33 | `xiaomi-token-plan-sgp/mimo-v2.6-flash` **active** (Writers); `xiaomi-token-plan-sgp/mimo-v2.6-pro` **active** (Controller) | **CLOSED** |
| G-32 | Live preview / browser review | §21 | `npm run dev` → `http://localhost:4173` (`tools/serve.mjs`, `cache-control: no-store`); `npm run build:runtime` regenerates `dist/` from `stack/native-typescript/`; Playwright 1.62.1 capture harnesses in `tools/` | **CLOSED** (no HMR — the loop is rebuild → dev → render → capture → compare; server never caches, so no stale-preview risk) |
| G-33 | Repo/evidence hygiene classification | §18 | ~674 MB; 1000 PNGs; `writer-output/**` dominates | OPEN — classification pass required, protected historical preserved |

---

## D. REPOSITORY HYGIENE — INITIAL CLASSIFICATION (§18)

| Class | Location | Disposition |
|---|---|---|
| CURRENT | `stack/native-typescript/**` (canonical source), `contracts/**`, `profiles/**`, `cep-writer/**`, `controller/**` | RETAIN |
| REQUIRED | `tools/**`, `package.json`, `tests/**`, `stack/local-runtime/**`, `stack/windows-platform/**` | RETAIN |
| DERIVED | `dist/**`, `dist-ts/**` (gitignored, regenerable via `npm run build:runtime`) | RETAIN (generated, not authoritative) |
| REUSABLE | `.opencode/skills/**`, `cep-writer/references/**`, `controller/03_historical/mimo_archive/**` knowledge extracts | RETAIN |
| HISTORICAL | `authority/sources/control/**`, `archaeology/**`, `docs/history/**`, `controller/03_historical/**` | RETAIN — **protected, do not delete** |
| EVIDENCE | `writer-output/**`, `assurance/**` | RETAIN lineage-carrying receipts + representative captures; quarantine duplicates |
| DUPLICATE / OBSOLETE | `writer-output/**` repeated same-state captures; `dist-ts/**` | SAFE_TO_REMOVE after lineage extraction (never delete protected historical) |

**Resulting policy:** no deletion in this phase. Extraction/quarantine of proven duplicates happens after evidence lineage is recorded (G-24), so no acceptance evidence is destroyed. Reported size and removals will follow in the hygiene checkpoint.

---

## F. GOVERNANCE CORRECTIONS LOG

| ID | Correction | Evidence | Status |
|---|---|---|---|
| G-34 | Repaired `cep-writer/WRITER_AUTHORITY_BASELINE.md` §core-laws: "visual references govern Presentation only" → CONSTRUCTION AUTHORITY language. This changed the file's size+sha256, so the matching entry in `cep-writer/WRITER_INPUT_MANIFEST.json` was updated (2478/f3d5c479… → 3096/7ec744e2…) to keep the integrity chain truthful. | `python3 cep-writer/tools/verify_repo.py` | **CLOSED** |
| G-35 | `cep-writer/WRITER_INPUT_MANIFEST.json` carries **pre-existing** stale entries (`.gitignore`, `assurance/*` ×6, `dist/adapters/analytical/*` …) where the working tree drifted from the recorded snapshot. | `verify_repo.py` REQUIRED_INPUT_MISMATCH | **OPEN — deliberately not absorbed.** Re-syncing the whole manifest would silently destroy evidence of unadjudicated drift (cf. `controller/08_evidence/worktree_disposition.md`). Per-entry adjudication required. |
| G-36 | `npm run check` reports 3 FAILs: `browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence`. Root cause = stale `assurance/BROWSER_CONFORMANCE_RECEIPT.json` (source tree `64d103fa…` vs current `7b01a08d…`, 6 flows/1 pass/5 fail). Same root as G-24. All other FAILs in the suite are **negative-test fixtures** and are expected to fail (`ALL_THREE_BYPASSES_DETECTED`, `ALL_HISTORY_RECOVERY_OWNERSHIP_GUARDS_FAIL`). | `/tmp/opencode/check.log`, 386 checks | **OPEN** — EVIDENCE/ORACLE, pre-existing, not caused by governance repair |

---

## E. LAUNCH-GATE DECISION


Gates required before Writer launch (§30 items 1–20):

| # | Gate | State |
|---|---|---|
| 1 | Repository truth audited | PASS |
| 2 | Authority + reference lineage audited | PASS |
| 3 | Historical inputs audited for stale decisions | PASS (G-02/G-05/G-06/G-09/G-20/G-23 = stale-decision class) |
| 4 | Repo/evidence clutter audited | PASS (classified; removal deferred to preserve lineage) |
| 5 | Writer governance repaired | IN_REPAIR → G-02…G-09 |
| 6 | 4 skills created | **PASS** |
| 7 | Writer packets repaired | IN_REPAIR |
| 8 | Visual lifecycle mandatory | IN_REPAIR |
| 9 | Reference authority binding | PASS (incl. G-22 candidate handling) |
| 10 | Surface-specific composition rules | PASS (skill + standard) |
| 11 | Shared-component governance | PASS (skill + standard) |
| 12 | Visual acceptance gates | IN_REPAIR |
| 13 | Image/vision readiness | **PASS** (G-30) |
| 14 | Live preview / browser review flow | **PASS** (G-32) |
| 15 | Surface ownership/dispatch matrix rebuilt | IN_REPAIR |
| 16 | Parallelism + exact shared conflicts confirmed | IN_REPAIR |
| 17 | Writer model = MiMo-V2.6-Flash | **PASS** (G-31) |
| 18 | Controller model = MiMo-V2.6-Pro | **PASS** (G-31) |
| 19 | Pre-launch validation run | PENDING |
| 20 | Launch | PENDING |
