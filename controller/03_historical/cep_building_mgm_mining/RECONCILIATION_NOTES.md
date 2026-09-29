# RECONCILIATION_NOTES.md — historical corpus vs current truth

**Current truth (given by the Controller and re-verified locally on 2026-09-29):**
- Current repo: `hamad933/cep-writer-baseline-repo`, branch `writer/cep-serial`, HEAD `48fec27608859d3a8e991b18b9f35f6e1dac1d19` (local `git rev-parse` confirms exactly).
- Canonical product source: sha256 `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641` / **273 files**.
- Stack: **Node 22.16.0 native TypeScript**.
- Historical repo `hamad933/Cybersecurity-Education-Platform` is **provenance-only**.

Everything in `cep_building_mgm` is **EVIDENCE, never current authority**. The items below are the explicit conflict/anti-promotion findings.

---

## 1. Repository identity & product-source hash conflicts

| Historical statement | Source | Conflict with current truth | Disposition |
|---|---|---|---|
| Accepted DS01 branch `writer/ds01-global-data-sufficiency-seed` @ `25a5f13c55096b7c4c8ef51100256a856cff75f5`, tree `dd031592…`, **Product source `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a` / 289 files** | READ_FIRST.md (1r6XU0zhlAjdrK3OrzkXzHLA2WknWip6h); CURRENT_STATE.md (164CDevKZ48ZAXke44oL3jXIVpYQJBmRu); POST_DS01…RESULT_AUDIT (1gfruqczPBYWBinAmtMcQXAukfMkKOgb5arUmVRETRTs) | Current canonical product source is `480dbe9d…` / **273 files** — a different identity and file count (−16 files) | Historical hashes are lineage evidence for the 2026-09-26/27 wave only. **MUST NOT** be used as current canonical identity or as a current verification baseline. |
| `main @ 37c4d765e1db854505c81cbd15b90d4715f6690e`; "Exact parent `48fec27608859d3a8e991b18b9f35f6e1dac1d19` / tree `fbe50585…`" | CONTROLLER_SUCCESSION_HANDOFF.md (1xoKHKftEkB5HIYK0vh2xtSojeA5axAme) §2 + addendum | Current branch tip **is** `48fec276…` on `writer/cep-serial` | **Notable convergence:** the current serial-writer branch sits exactly on the commit the historical corpus called the "exact parent" of the DS01 wave. Treat as provenance anchor, not as proof that current = historical accepted state. The 273-file / `480dbe9d…` canonical source is the current identity and diverges from both `25a5f13c` and the 289-file historical product source. |
| Per-Surface candidate branch names `writer/surface-w01-today` … `writer/surface-w05-configuration` (23 branches) | POST_DS01_23_SURFACE_EXECUTION_MATRIX.csv (1GLSPxS0HxqihBlQNBx1JNgORPjJsB5LR) | Current topology is one persistent serial branch `writer/cep-serial` (OD-20260924-080 / OD-20260928-085) | Branch map is **HISTORICAL_VALID** execution-design evidence; **MUST NOT** be relaunched or recreated under the serial-writer regime. |
| `hamad933/Cybersecurity-Education-Platform` / content-campaign repos (`hamad933/universal-execution-system` for GAP-0720) | 2026-09-25…GAP0720… (1RGc_DT_-Dg2PPjFGusXQdAvExbtSeU9xswsZ1cWKztk) and PRE_D8 control events | Different project/fact domain (cyber-security **content/curriculum** acquisition), not the CEP product codebase | Provenance-only. **MUST NOT** be mixed into product engineering truth (see §5). |

## 2. Governance-custody model conflicts (old Drive regime vs new repo regime)

- `OD-20260914-030/031` (CBM-D-055/056): "the sole live CEP governance root is `/Google Drive/cep_building_mgm`… all live CURRENT_STATE, governance, Writer inputs/outputs must use the Google Drive root and be maintained there in place." `OD-20260914-015` (CBM-D-040): single live `CURRENT_STATE.md` updated in place on Drive.
- **Conflict:** the NEW CEP Controller keeps live state in the repo (`controller/**` in `cep-writer-baseline-repo`), and this mining output is itself repo-resident.
- **Disposition:** the Drive-custody laws are `HISTORICAL_VALID` governance patterns (they encode valuable duties: in-place update, zero-loss, single primary custody, readback verification). The *location* claim conflicts with current authority and **MUST NOT** be promoted. If the duties are wanted, re-decide them explicitly for the repo-based controller model (candidate — not decided here).
- Corollary anti-promotion: the corpus's own law `OD-20260914-034` (CBM-D-059) says supporting registries/censuses (GOVERNANCE_CONTENT_CENSUS.csv 1NrB8IAtY6IgOy2JdcgOS9kpUxWUtaPed; CEP_STALE_STATE_SUPERSESSION_REGISTER.csv 1m6NNVG7jWxrfPJ5r2wmye8xWgcveOSfC; manifests, inventories) **never** create authority. Do not promote these either.

## 3. Execution-carrier / branch-topology conflict chain (internal to the corpus)

Four successive topologies exist in the corpus; only the newest is even candidate-current:
1. `OD-20260921-066` mission-bound candidate branches per mission (CBM-D-092);
2. `OD-20260924-080` one persistent serial Writer on `writer/cep-serial`, LOCAL-only, scoped by `OD-20260924-081` (CBM-D-104/105);
3. `OD-20260925-083` default-deny push for ROUTE-LOCAL (CBM-D-107);
4. `OD-20260928-085` ROUTE-MIMO-AGENT carrier (agent-chat Controller + exactly one Writer chat), serial + inline Controller audit (CBM-D-111) + CURRENT_STATE "EXECUTION CARRIER REBIND — ROUTE-MIMO-AGENT + SERIAL 5-MILESTONE PLAN" (CBM-D-118).

**Disposition:** rule (1) and the 23-branch plan are superseded for execution but retain design value. Rule (2)'s `writer/cep-serial` matches the current branch name — but its "LOCAL-only, no-push" scoping must **NOT** be silently imported into the new agent-chat regime (the corpus itself forbids this: "Never copy `writer/cep-serial`, Kimi/local Windows details or task-specific no-push rules into another carrier without an explicit rebind" — CEP_LESSONS…LEDGER §K). Whether push is currently allowed is **UNKNOWN** from the corpus and must come from current Owner direction.

## 4. Stack conflicts and confirmations

- **Confirming:** `OD-20260920-060` stack-expansion lock baseline (Node.js/TS, browser-native UI, local node:http, node:sqlite behind persistence boundary, xterm renderer, narrow C++17 Win32/ConPTY sidecar) is **consistent** with the current "Node 22.16.0 native TypeScript stack". PS05/PSC Windows proofs ran on Node 22.16.0 (CBM-F-017).
- **Conflicts/limits to preserve:**
  - `STACK_NOT_FROZEN` — the corpus never froze the stack; **MUST NOT** be promoted to "stack decided/frozen". Pre-freeze obligations remained open: real Windows PTY/ConPTY provider proof (raw I/O, resize, exit/restart, session identity), HWND/always-on-top/input-direction Windows target proof (OE-001/OE-004), TERM-RAW-IO-RESTART (CBM-F-004).
  - `OD-20260917-049/050` (xterm canonical renderer; security non-blocking) are newer than, and partially supersede, the older "no real-PTY requirement / deferral" wording in the lessons ledger and in `OWNER-20260910-017` (CBM-D-017). Reading only the older rows yields contradictory terminal policy — flag as `CONFLICTED` unless read with the supersession note at the top of CEP_LESSONS…LEDGER.
  - `A02` "Internal High-Fidelity Simulation only in V1" (CBM-R-021) vs the terminal provider requirement is reconcilable (real terminal = provider over simulation semantics) but the two must be read together; a naive merge could wrongly import container/VM/cloud execution or wrongly forbid the real-terminal provider.

## 5. Fact-domain separation: product engineering vs cybersecurity-content research

- The dated `2026-09-xx_CEP_*` control events (PRE_D8, W1/W2/W5, GAP-0720, Final-28, CSE-006/014, Chat A/B ND lanes) document a **content/research acquisition campaign** (forensics/EDR/blockchain curriculum material, KU-Dxx knowledge units, PCRS records) running under a different governance chain (`00_CURRENT_CONTROL_STATE.md` Drive `1TyNrR29bK9RUKj4EH86dcN9wqDFiWYSX`, campaign `cep-fp-98e82185ca8841a18f3a655e51d9cd34`).
- **Conflict risk:** both are called "CEP", both live on the same Drive. Their states (e.g. "C0 FROZEN / NO D8", "152/152 terminal") have **NO bearing** on product acceptance, and product gates have no bearing on the campaign's stop gates.
- **Disposition:** classify all campaign material `HISTORICAL_VALID` in the content domain; **MUST NOT** be promoted into product authority, and product docs must not be read as campaign decisions. Security-research-derived hardening ideas remain subject to `OD-20260917-050` (security non-blocking).

## 6. Rejected / never-accept material — explicit MUST-NOT-PROMOTE list

| Item | Evidence | Rule |
|---|---|---|
| E19 Presentation candidates + "E19_PARALLEL_LANES_READY_FOR_CONTROLLER_CONVERGENCE" | OD-20260914-026 (CBM-D-050); 90_ARCHIVE/E19_… (1lLmm41ciutQVtYQpcBGp3fEi-NrMBV_D) | REJECTED by Owner visual review. Salvage only independently adjudicated subordinate value; never execute Lane F convergence. |
| M0 candidate as delivered | CURRENT_STATE.md §1 | `M0_PRODUCT_SOURCE_PRECHECK_SALVAGEABLE__DELIVERED_HANDOFF_REJECTED…`; corrected CORR01 identity verified but **not Product-accepted**. |
| All 17 POST-DS01 Surface writer results | POST_DS01_23_SURFACE_CONTROLLER_RESULT_AUDIT (1gfruqczPBYWBinAmtMcQXAukfMkKOgb5arUmVRETRTs) | `RECOVERABLE_VERIFIED_SUCCESSOR = 0`; salvageable deltas only; Presentation below reference floor on many surfaces; Health +3 TS diagnostics blocker. **MUST NOT** be treated as partially accepted baseline (Owner sequencing law, CBM-D-117). |
| Old Phase-2/recovery Writer prompts | CURRENT_STATE.md 2026-09-27 sections | `SUPERSEDED_FOR_ZERO_LOSS_PACKET_COMPLETENESS` — must not be dispatched unchanged. |
| Old `POST_DS01_23_SURFACE_CAPSULES` packets | CURRENT_STATE.md Stage-2/3 sections | Transport/template lineage only; authority payload/parent/scope/read-set/mission text must not be relaunched unchanged. |
| `CURRENT_POST_C03_FINDINGS.json` as sole mission input | ZL01_ZL02_CONTROLLER_RECONCILIATION (1D6X7bs_EWPQrvy7zu4qqr2udO6DVALGcD4o5EGOBA7o) §8 | Contains F-049/F-050 routing metadata drift and is non-exhaustive; repo projection must be corrected at a controlled packet refresh before self-contained reliance. |
| Historical launch packets (`READY`, `AUTHORIZED`, `CURRENT_AUTHORITY`, `START_HERE`, writer packets) anywhere in the corpus | OD-20260914-036 (CBM-D-061); CEP_BUILDING_MGM_CURRENT_CONTROL.txt | Non-launchable by existence or self-authorizing text. |
| Versioned `CEP_BUILDING_CURRENT_CONTROL_v1.0–v3.18` | 90_ARCHIVE/…_CONTROL_LINEAGE (1HYtSErDXYvIJ6WQdiXpRGXK-VmU3KtVh) | Historical lineage only (OD-20260914-015). |
| Superseded duplicate decision rows (OD-20260915-001/002, OD-20260920-058, OD-20260925-084) | OWNER_DECISION_LIVE_REGISTER.csv | `HISTORICALLY_USEFUL_BUT_SUPERSEDED` — read the surviving successor rows (038, 039/072, 072) instead. |
| UPDOS stack choices (React/Vite/MDXEditor/Milkdown/FastAPI/SQLAlchemy/Alembic…) | CEP_LESSONS…LEDGER §D | `CROSS_PROJECT_REFERENCE_NOT_CEP_AUTHORITY`. |
| Unavailable-provider "populated" RQ reference content; old non-genuine-route screenshots as functional proof; five Shell destinations as frozen authority; historical PREPARED/HOLD states | ZL01_ZL02_CONTROLLER_RECONCILIATION §7 (historical exclusions) | Do not reimport without exact-current re-falsification. |

## 7. Unresolved conflicts carried forward (must be decided, not inherited)

1. **TimelineReplayOwner** retain+rebind vs retirement (Results local replay duplicate) — `AUTHORITY_DECISION_REQUIRED` (23-surface matrix adjudication 8; A01-PF-007). Status: **CONFLICTED**.
2. **Portfolio Project/Learning-Objective grouping authority** — `AUTHORITY_DECISION_REQUIRED` (A01-PF-006). Status: **CONDITIONAL**.
3. **RQ final visual authority** — `REVIEWED_FINAL_CANDIDATE` only; no Owner-confirmed final. Status: **CONDITIONAL**.
4. **Shell destination count** — five = baseline, `destinationCountFrozen=false`. Status: **CONDITIONAL**.
5. **Windows platform proof cluster** (PTY/ConPTY raw I/O+restart, HWND/topmost/focus/bounds, input-layout direction, TERM-RAW-IO-RESTART) — open `TRUE_BLOCKER` target-environment rows at corpus cutoff. Status: **CONDITIONAL**.
6. **Push policy for the current carrier** — corpus gives LOCAL no-push (OD-20260925-083) and forbids copying it across carriers; current regime needs its own explicit push gate. Status: **UNKNOWN**.

## 8. Promotion-safe subset (what MAY inform current work, subject to re-validation)

- Product-identity requirements CBM-R-013…060 (A01/A02/A03 + CEP-VIS-001 + 23-surface identity matrix) — these are the durable "what the product is" corpus; consistent with, and clarifying of, current work; still re-validate against current source before binding.
- Truth-separation and acceptance laws (CBM-K-036…042, CBM-R-062…070, 079/080) — portable methodology.
- Implementation/operational lessons (CBM-K-023…035) — portable engineering judgment.
- Stack baseline (CBM-K-004…007) — consistent with current Node/TS stack; treat freeze status as `STACK_NOT_FROZEN`.
- Owner anti-inflation law (OD-20260922-079) and obligations-first sequencing (CBM-D-117) — directly usable operating discipline for the NEW CEP Controller.
