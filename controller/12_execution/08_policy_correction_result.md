# 12_execution / 08_policy_correction_result — acceptance-matrix policy correction (P1–P6)

Timestamp: 2026-09-29T17:30Z · Agent: ACCEPTANCE-MATRIX POLICY CORRECTION · Branch `writer/mi-serial`
· Bound commit/tree at final runs: `eb23ede6` (per-workspace `--commit/--tree` recorded row-wise).

## 1. Result

All five acceptance matrices were regenerated under `06_unified_disposition_policy.md` (P1–P6) from
`tools/writer-disposition-scaffold.py` output + a per-subject upgrade pass. **`--aggregate` reports
`cross_matrix_consistency.conflicts = 0` (180 replicated subjects), exit 0.** All five workspaces are
`COMPLETE` with `zero_loss: true` (8,651/8,651 obligations dispositioned).

| WS | rows | PASS | FAIL | BLOCKED | NOT_APPLICABLE_WITH_PROOF | zero_loss | matrix sha256 |
|----|------|------|------|---------|---------------------------|-----------|---------------|
| W01 | 711 | 6 | 0 | 435 | 270 | true | `f19ae88a51a6d882f11ff1a75d46882c1f93adb18a8b92794032f21257af98f9` |
| W02 | 1485 | 13 | 0 | 906 | 566 | true | `4bc2196eadfebd30426df51e428aaa6a1996d533261e46e0e1804830c01be275` |
| W03 | 2183 | 20 | 0 | 1336 | 827 | true | `f5f39c712567189c3d5b6d13871e297226dd27d5d13ee39ee2e1fef58be2b7ac` |
| W04 | 1445 | 12 | 0 | 924 | 509 | true | `5dfa32b6ff537c3833aa29111f0eb03fbe6f2bbfa367c44eb63c8e96bcab52b0` |
| W05 | 2827 | 24 | 0 | 1755 | 1048 | true | `24d6e351d84197c3a7e71e16c02abeac99070d8c0f420771144dcabc3ef8705c` |
| **total** | **8651** | **75** | **0** | **5356** | **3220** | | |

Pre-correction state (Pro review measurement): **111 conflicts across 180 subjects**. After: **0/180**.

## 2. Upgrades to `derived_from_proof` (17 rules; named-subtest, subject-matched, measured)

**P3 — one rule per decision id, (a) binding proof + (b) subject-matched implementation proof:**

| decision | proof shape (row `proof_requirement`) | measured discharge |
|---|---|---|
| `OD-20260918-054` STRUCTURED_INSERTION_GAP_DONOR_INTERACTION_RESTORATION | ACCEPTED_DONOR_EVENT_ROUTE_MATCH / LEFT_CLICK_CHOOSER / RIGHT_CLICK_DIRECT_PARAGRAPH / KEYBOARD_CHOOSER / EXACT_GAP_TARGET / CENTRAL_PROPAGATION_AND_REVERT / NO_SURFACE_LOCAL_FORK | `owner-decision-binding-check` exit 0 + `s01-structured-editor-core-tests.js` (`s01.od054.*`, 8 named subtests) + `s08-falsification.js` (`S08.od054.shared-owner-correction-survives-replay`) |
| `OE-003` GROUPED_SETTINGS | Single-open/search/keyboard/applicability/focus return | binding check exit 0 + `w4-e-settings-center-tests.js` (`w4e.one-open-accordion`, `w4e.deterministic-search`, `w4e.search-arabic-normalization`, `w4e.arrow-navigation-wraps`, `w4e.home-end-navigation`, `w4e.keyboard-disclosure-enter-space`, `w4e.profile-applicability-refuses-hidden-section`, `w4e.focus-return-delegates-transient-owner`) + `s03-shared-settings-transient-tests.js` (`s03.settings.*`) |
| `OD-20260920-060` STACK_EXPANSION_LOCK_WITH_SEPARATE_FINAL_FREEZE_GATE | PACKAGE_AND_LOCKFILE_DIFF_SCAN / DEPENDENCY_ADMISSION_LEDGER / NO_NEW_PRODUCT_DEPENDENCY_WITHOUT_PROVEN_GAP / WINDOWS_XTERM_CONPTY_PLATFORM_GATES_BEFORE_STACK_FROZEN | binding check exit 0 + `tools/w05-stack-admission-proof.mjs` (all four shape tokens; purpose-built for this row) |

**P5 — lane upgrades (2 rules):**
- W02 `RQ_PROVIDER_EMPTY` (ZL01_ZL02_RECONCILIATION, pr "Provider truth") ←
  `tools/b3r-rq-visualize/falsify-b3r-corr03.mjs` named checks
  `F027.normal-rq-provider-unavailable`, `F027.composition-does-not-bind-balanced6-rq-records`,
  `F027.search-command-disabled-without-admitted-provider`, `F027.compare-disabled-without-admitted-provider`.
- W03 `CURRENT_PROFILE` (5 rows) ← `tools/w03-profile-coverage.mjs` (its own header: "Discharges
  controller/09_writer_forge/W03_REQUIREMENTS.csv CURRENT_PROFILE rows"; per-profile slots /
  domain_commands / family_engines / host_contract / state_dimensions / objects / invariants).

**P4 — 0 upgrades.** No executable suite in the repo (dist/, tests/, tools/, stack/) carries a named
subtest for any of the 98 A2/A3/A4/C finding ids. All 98 findings are `BLOCKED` per finding id in
every workspace — status-agreement across workspaces is machine-verified (conflicts = 0).

## 3. BLOCKED discipline

Every unprovable row is `BLOCKED` with a justification naming the **exact missing artifact**
(per decision id / per finding id / per seam row), never "evidence held elsewhere". P3 specials cite
the concrete gate (OE-001/OE-004 `ACTIVE_PLATFORM_GATED` + `PROVE_OR_REMAIN_UNAVAILABLE`; A4-018
TRUE_BLOCKER for the Windows-target shapes OD-047/048/049/046; A2-X-005/C23 for reuse provenance;
MACHINE_CHECK_WORST_FINDING_TO_TOP_VERDICT absent for OD-028; etc.). P1 Q-subjects (Q-1/Q-4/Q-5)
are pinned to `controller/03_historical/open_questions.md` on the seam rows
SHELL_DESTINATION_COUNT / TIMELINE_OWNER / GROUPING_AUTHORITY.

## 4. Measured advisories (recorded in PROOF_RESULTS.json, never used as a discharge)

1. **`P-CG1-OD054`** (`cg1-corr01-od054-source-contract.test.mjs`) measures **FAIL (2/4 exact-string
   pins)** in every workspace: `accepted-runtime.ts` spelling was converged in checkpoint D05 while
   the source-contract pins were not re-pinned (the chooser/direct-paragraph/bounded-binder seams
   are still present in source; the behavioral proof `s01.od054.*` measures PASS). Per the rows' own
   `negative_falsification_test` ("do not treat evidence/harness limitations as Product defects")
   this is disclosed, not inflated into a FAIL product verdict. Needs a re-pin by the owning lane.
2. **`P-W01-CONFORMANCE`** measures **FAIL (20/21)**: `w01.writable-partition-only-expected-changes`
   pins a point-in-time uncommitted-worktree snapshot (`changedPaths=[]` vs a pinned
   `expectedChanged`) that the Coordinator's checkpoints have since committed. Its product-facing
   checks pass, but a partially-FAIL proof cannot discharge rows, so W01 `CURRENT_PROFILE` /
   `CURRENT_IDENTITY` stay `BLOCKED` (the pin needs rebasing to the committed candidate).

## 5. Closure register

`writer-output/_coordinator/OWNER_QA_CLOSURE_REGISTER.csv` regenerated (98 findings, 54 replicated
across >1 workspace); `--check` OK. **0 findings carry a real closure proof** (`closure_proof` empty,
`measured_status=BLOCKED`, `verified_by_workspace` empty for all 98); `notes` per finding names the
exact missing artifact (matched-executable-consumer closure suite with a named `<finding id>`
subtest).

## 6. Non-upgrades worth noting

`FinalObligationManifest` (all 5 WS) stays BLOCKED: the row demands the D13/D14 convergence return
(obligation → seam → integrated source → positive proof → negative/falsification disposition) and
explicitly says generic regression PASS is insufficient; the available manifest-mapping checkers
prove only the obligation→rule half. `Future D0x Mission material` rows are `NOT_APPLICABLE_WITH_PROOF`
per policy P2 (row's own binding routes them to a future Stage3 mission). ZL01_DURABLE_ANCILLARY
preservation rows are `NOT_APPLICABLE_WITH_PROOF` citing their own binding ("acceptance criteria /
negative tests / provider ceilings / guardrails … not autonomous obligations").

No product source, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `assurance/**`,
`main.ts`, `m0-controller-composition.ts`, VISUAL_REAUDIT.md or `shared-component-fix/` was touched.
Pre-correction catalogs/matrices remain in git history (forward correction only).
