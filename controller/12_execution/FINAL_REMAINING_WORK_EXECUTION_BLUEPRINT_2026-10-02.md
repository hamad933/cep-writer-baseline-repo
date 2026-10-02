# FINAL REMAINING WORK EXECUTION BLUEPRINT — 2026-10-02

**Class:** `CONTINUATION_BLUEPRINT__IMPLEMENTATION_GRADE__NOT_LAUNCH_AUTHORITY__READ_WITH_CANONICAL_BOOTSTRAP`
**Author:** PRIMARY_RECOVERY_CONTROLLER (final state-capture mission; Owner mode `CONTROLLER_ONLY__DOCUMENT_AND_PERSIST_ONLY`).
**Purpose:** a fresh Controller/Writer continues from GitHub alone — this file + canonical bootstrap = zero chat history required. Launch still requires a fresh Primary rebind/adjudication; `CANDIDATE_DAG__NOT_LAUNCH_AUTHORITY` below is planning only.

---

## A. Exact current identities

| Field | Value |
|---|---|
| Final remote HEAD (at record time) | `563afc13e0857e396e9fb138905566f8f4b7e9cf` (verify with `git fetch` + `rev-parse` — if advanced, later commits are bookkeeping unless they touch `stack/**`) |
| Final remote tree | `6a37f09032a747622474b37c904ad82ffe49c404` |
| Integrated Product candidate (accepted as evidence; NOT Owner-accepted) | `writer/mi-serial@0102a35d4850ab1a3b14436bcc6abe0868ee6a7f` / tree `396010acdf3e0f049fee4962bd18245d20a94fa4` |
| Last convergence identity | branch `recovery/convergence-w1` (merged content identical to `0102a35` + receipts) |
| Branch / authority mode | `writer/mi-serial` · `GITHUB_CANONICAL` (cutover `CEP-GITHUB-CUTOVER-2026-10-02-001`, OD-20261002-086) |
| Execution carrier | `ROUTE-MIMO-AGENT`; topology `OD-20261002-087` (parallel disjoint lanes, one Writer per bounded lane); Writer model config `xiaomi-token-plan-sgp/mimo-v2.6-flash` |
| Lifecycle status | `EXECUTION_PAUSED_BY_OWNER` after `CORE_WRITER_LIFECYCLE_CONVERGED__READY_FOR_OWNER_FINAL_ACCEPTANCE`; zero-gap closure interrupted at safe-stop |

## B. Completed work — DO NOT REDO

1. **Recovery/cutover**: `RECOVERY_GATE_PASS` (`controller/11_gates/RECOVERY_GATE_PASS_2026-10-02.md`); GitHub canonical; Drive = historical/evidence only; fresh-clone successor battery 54/54 effective (ledger §14).
2. **19/19 core lanes adjudicated `RETAIN`, 0 correction cycles** (registry: `EXECUTION_LIFECYCLE_STATE.md`; candidates `writer/mi-serial-lane/{LIB,LRN,VIS,LAB,RUN,REV,MAS,POR,BKP,AUD,REL,MAI,VAL,HLTH,PRC,RES,SH-1,SH-2,ENT-1}` all pushed).
3. **Convergence**: 18 merges, 0 conflicts; integrated battery green — build PASS, `npm test` 210/0 ×2, duplicate-mechanics PASS, **browser conformance 6/6 `EXECUTED_PASS`** (receipt `assurance/BROWSER_CONFORMANCE_RECEIPT.json`, sourceCanonicalTree `107c6a23cce9642d…`), **`npm run check` EXIT 0**, route smoke **46/46, 0 pageErrors** (23 routes × 1440+1024).
4. **Enterprise shared-relation integration root CLOSED** by SH-1 (instance census 3→1, selection 0→2, `central-change-reuse` PASS) + OD-044 bounded harness-oracle correction for the SVG zero-area first assertion (`tools/browser-conformance.mjs`, fixture untouched) → relation flow PASS.
5. **Canonical reconciliation** (`58932fc`): AUTHORITY_STATUS/CURRENT_STATE/READ_FIRST carry the 6/6 + Enterprise-closed epoch; older 4/2, 3/3, 2/4, 1/6, 1/5 epochs preserved as historical.
6. **OFFLOAD-01/02/03 `CONSUMED`** (queue INDEX) with spot-checked receipts in ledger §9; 23-Surface matrix **23/23 `SEALED`** (`EXISTING_EVIDENCE_REUSE_MATRIX_23_SURFACES.md`); recovery ledger complete through §15.
7. **Residual register SEALED**: `FINAL_RESIDUAL_REGISTER_2026-10-02.md` (31 rows + Owner resolution table).
8. **S02 environment gap CLOSED**: python-playwright installed; `CEP_BROWSER_EXECUTABLE=/home/codespace/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`; S02 = **3/3 PASS**.
9. **Disk incident recovered** (lanes stripped to recoverable scratch; 11–13G free; candidate branches pushed intact).
10. **Closure items closed with proof before stop**: R-11 (centerrail clearance 23→0), R-12/R-13 (not-reproduced), R-14 (H-RUN-1), R-15 (RQ b2 mount via SH-1), R-16 (F01/F02 fail-closed), R-17 (H-FAM-01/02), R-18 (F-SH1-01), R-20 (dist parity + receipt), R-23 (S02), plus R-19 root partially via recorded bridge analysis.
11. **Owner items resolved from existing authority: 5** (see §8).

## C. Current truth ceilings (exact remaining; nothing stale)

| Ceiling | Status |
|---|---|
| `H03-R2-PROP-001` / `H03-R2-FALSIFY-001` | `NOT_PROVEN` — dedicated governed proof cycle not executed (lane safe-stopped pre-mutation) |
| Enterprise relation flows | **CLOSED** (6/6) — do NOT list as open |
| Product acceptance / main merge / release / deploy / stack freeze | `NOT_AUTHORIZED` (unchanged) |
| Owner-only | 2 genuine choices (§8) + deferred shell redesign |
| Open technical/shared residuals | R-01 … R-09, R-10 (classified), R-22/R-24/R-25/R-26 (non-Product), R-31 (proof) — specified in §4 |

---

## §4 EXECUTION-READY SPECS (every still-open residual)

Common to all lane specs unless overridden: parent rule = **rebind to the exact then-current remote tip at launch and record it** (content must equal the `0102a35` product baseline + control-bookkeeping; verify `git status` clean; `npm ci` if fresh worktree; `dist/` is a parent build → `npm run build:runtime` BEFORE any browser work). Common read set: this blueprint + `FINAL_RESIDUAL_REGISTER_2026-10-02.md` row + `controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md` §0 + `cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv`. Common prohibitions: `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, `tools/**`, other lanes, `main`, `writer/mi-serial` (Controller-only), secrets. Common STOP: out-of-root need, authority conflict, Owner items (shell redesign / RQ reference promotion / F-048 / destination-count) record-only, any regression of the three baseline greens (210/0, conformance 6/6, smoke clean), false receipt. Common environment: port-4174 pre-check via `curl --max-time 2` (busy/503 → wait/retry once, record); image claims verified by sha256+DOM/OCR (VD-008 channel is unreliable for pixels). Common evidence: sha256+commit/tree-bound artifacts under the lane's `writer-output/<LANE>/` + `HANDOFF.md` with FOUR TRUTHS stated separately (Content / Presentation / Behavior / Domain-Data-Provider). Common push: `git push -u origin writer/mi-serial-lane/<LANE>`, `CANDIDATE_ONLY / NO_SELF_PROMOTION`.

### R-01 — AD-01 pane proportions ≈16/65/17
- `CURRENT_STATUS`: OPEN; lane `AD01-1` stopped with NO durable result (worktree clean, no commit, remote branch absent).
- `PROVEN_PROBLEM`: live pane proportions ≈21.11/48.19/29.17 (304/420px preferred defaults) vs reference ≈16/65/17; consumer of record = AD-01/CONTROLLER_REGISTERS.
- `CURRENT_EVIDENCE`: SH-2's H-SH2-01 in `writer-output/W01-SHELL/SERIALIZED_HOTSPOT_REQUEST.md` (Exp-A inert, Exp-B hits 15.97/65.49/17.01 but regresses frozen pair) + `writer-output/W01-SHELL/evidence/sh2/*` (probe JSONs); `controller/13_visual_control/CONTROLLER_REGISTERS.md` AD-01 row.
- `ROOT_CAUSE`: LIVE default path = `foundation/global/preferences/schema.ts` preferred widths (`pane-layout.ts` alone is inert — proven); atomic set additionally includes `stack/native-typescript/model-tests.ts` (frozen expectations, e.g. `preferred width 420` near line 98 and `w3e.ui-scale-*` pair near 276/278) and `foundation/global/responsive-layout.ts` in the application chain.
- `CANONICAL_OWNER`: W01-SHELL/shared pane mechanics (OD-20260910-012).
- `DEPENDENCIES`: none (independent lane). `COLLISIONS`: none among future lanes (nobody else writes schema/model-tests/responsive-layout); serialize vs any future chrome lane touching `foundation/extensions.css`.
- `SALVAGE_TO_PRESERVE`: SH-2 probe scripts + Exp-A/Exp-B records (read-only inputs), `writer-output/W01-SHELL/probes/sh2-geometry-route-probe.mjs` (reusable 23-route×band probe).
- `CLOSED_READ_SET`: this spec; H-SH2-01 request; CONTROLLER_REGISTERS AD-01; `stack/native-typescript/foundation/global/preferences/schema.ts`; `stack/native-typescript/foundation/global/responsive-layout.ts`; `stack/native-typescript/model-tests.ts` (pane/width expectation blocks); `foundation/global/pane-layout.ts` (context only).
- `WRITABLE_PATHS`: those three files + `dist/**` ONLY via `npm run build:runtime` + `writer-output/AD01-1/`. `READ_ONLY_PATHS`: everything else. `PROHIBITED_PATHS`: common.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) baseline: build; run SH-2 geometry probe → record live `--left/--right`/ratios on all 23 routes at 1440/1024/768; (2) in `schema.ts` change the preferred right/left widths to the values SH-2's Exp-B proved live-effective for 16/65/17 (re-derive from Exp-B records: ratios ≈15.97/65.49/17.01 — document chosen px + derivation: target fraction × usable width per band, clamped by responsive bands); (3) re-run probe → confirm live ratios; if band application needs `responsive-layout.ts`, adjust the band clamp there (smallest seam); (4) `npm test` → the frozen pair now fails: open `model-tests.ts`, update ONLY those expectation values to the new contract with an inline comment `AD-01 contract update (CONTROLLER_REGISTERS AD-01: 16/65/17 reference); old values encoded the defective geometry` — record the old value in HANDOFF as evidence the old assertion encoded the defect; do not touch other assertions; (5) `npm run build:runtime`; commit regenerated `dist/**` parity files WITH the source change; (6) run proof battery (below).
- `EXPECTED_RESULT`: live proportions ≈16/65/17 ±1.5 at 1440 (band-corrected at 1024/768), 0 pane overlap, all suites green.
- `POSITIVE_TESTS`: `npm test` ×2 identical (210/0 incl. updated pair); `node tools/browser-conformance.mjs` 6/6; 23-route probe proportions+overlap; responsive band assertions (1440 wide/1024 medium/768 narrow).
- `NEGATIVE/FALSIFICATION`: revert schema values in a scratch copy → probe shows old 21/48/29 (proves schema is the live seam); assert `pane-layout.ts` diff EMPTY (inert-path guard).
- `PRESENTATION/VISUAL_PROOF`: sha-bound captures of 3 representative routes × 3 bands showing pane split (before/after).
- `BEHAVIOR/INTERACTION_PROOF`: pane reveal/collapse still functional at each band (probe events). `DOMAIN/DATA/PROVIDER_PROOF`: none affected (layout only) — state explicitly.
- `REGRESSION_SCOPE`: full suite + conformance + smoke (pane change is global).
- `CLOSURE_CRITERIA`: ratios in tolerance all routes/bands; 0 overlap; 3 greens; contract-update justification in HANDOFF; dist parity.
- `STOP_CONDITIONS`: any needed file outside the three (donor.css :root, accepted-runtime, live pane-layout path) → STOP with exact chain evidence (Controller extends scope); semantic (not value) test conflict → STOP.
- `OUTPUT_REQUIRED`: probe JSONs before/after, derivation note, justification, receipts, captures, HANDOFF. `CANDIDATE_SIZE`: S. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (bounded lane).

### R-02 — shared chrome Arabic-under-EN (accepted-runtime + bottom-shelf + HS-REL-1-03)
- `CURRENT_STATUS`: OPEN; lane `SHFP-1` stopped after baseline test run only (no evidence dir, no commit).
- `PROVEN_PROBLEM`: visible Arabic strings under EN locale from shared renderers; shared shelf does not re-read provider on locale change.
- `CURRENT_EVIDENCE`: SH-2 H-SH2-02 census (138 unique, 28–42/route under EN, origins `foundation/accepted-runtime.ts:508` + `dist/index.html`); RUN-1 B2 (78 nodes, `accepted-runtime.ts:508`); REL-1 D-17 + `writer-output/W05-RELEASES/SERIALIZED_HOTSPOT_REQUEST.md` (HS-REL-1-01/02/03, `bottom-shelf.ts:178`, `accepted-runtime.ts:537/728`); POR-1 SHARED-4 (same lines); BKP-1 U-02.
- `ROOT_CAUSE`: hardcoded Arabic literals + baked locale in shared foundation render templates (accepted donor is Arabic-first); shelf lacks locale-change refresh. (`dist/index.html` static-origin part is separate → R-03.)
- `CANONICAL_OWNER`: W01/shared foundation chrome (language policy FINAL: OWNER-20260910-001/002, AR+EN first-class).
- `DEPENDENCIES`: none. `COLLISIONS`: `bottom-shelf.ts` shared with future SH-CP-2 (health bottom) → serialize SH-CP-2 after this lane; `w04-rescue.ts` is NOT in this lane (it is R-06/SC-1's, with REV-1 starvation constraint).
- `SALVAGE_TO_PRESERVE`: lane requests (HS-REL-1/SHARED-4 exact line refs), SH-2 census method, releases' own consumer-side refresh precedent (`surfaces/releases/runtime.ts` lang/dir refresh — pattern to replicate at shared level).
- `CLOSED_READ_SET`: this spec; the four hotspot requests named above; `foundation/accepted-runtime.ts`; `foundation/global/bottom-shelf.ts`; VISUAL_EXECUTION_STANDARD §0; profile identity blocks (`profiles/*.json` slots); applicable language-policy rows.
- `WRITABLE_PATHS`: `stack/native-typescript/foundation/accepted-runtime.ts`, `stack/native-typescript/foundation/global/bottom-shelf.ts`, `writer-output/SHFP-1/`. `READ_ONLY/PROHIBITED`: common + `dist/**` via build only.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) build; run a precise live EN census (Playwright; routes: shell, one W03, one W05, health, releases; 1440×1000): classify EVERY Arabic string VISIBLE-in-EN vs HIDDEN/attribute, with file:line origin — write `EN_CENSUS.json` (this census is also R-03's input); (2) replace each VISIBLE Arabic in the two writable files with the existing `{ar,en}`/`locale` pattern already used in those files (no new i18n mechanism; no observers — single-pass render); (3) HS-REL-1-03: in `bottom-shelf.ts`, re-read the provider descriptor on `lang/dir` change (replicate the releases runtime's refresh pattern at shared level); (4) `git diff` review: only strings/refresh logic changed, no layout/ceiling edits; (5) run proof battery.
- `EXPECTED_RESULT`: EN routes show 0 visible Arabic in shared chrome/shelf scopes; shelf content language follows locale switch live; AR output unchanged in meaning.
- `POSITIVE_TESTS`: EN census 0 visible (post); AR census sanity; locale flip AR→EN→AR live-updates shelf; suite ×2; conformance 6/6; smoke clean.
- `NEGATIVE/FALSIFICATION`: inject a test Arabic literal in a writable file → census catches it; assert no `MutationObserver` added (grep diff — REV-1 starvation guard); AR `load` <4s.
- `PRESENTATION/VISUAL_PROOF`: before/after sha captures per route × EN/AR. `BEHAVIOR/INTERACTION_PROOF`: locale switch updates mounted shelf without reload. `DOMAIN/DATA/PROVIDER_PROOF`: shelf truths (read-only projection, ceilings false) unchanged — diff-review evidence.
- `REGRESSION_SCOPE`: suite + conformance + smoke + W05/releases flows.
- `CLOSURE_CRITERIA`: census 0 visible Arabic in scope; live shelf locale refresh works; all greens; out-of-origin report filed (feeds R-03).
- `STOP_CONDITIONS`: fix requires `dist/index.html`/extractor/other files → STOP that sub-scope + exact origin list (feeds R-03); observer-loop temptation; baseline regression.
- `OUTPUT_REQUIRED`: `EN_CENSUS.json`, before/after captures, receipts, HANDOFF (four truths), out-of-origin list. `CANDIDATE_SIZE`: M. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer.

### R-03 — `dist/index.html` static Arabic origin (generator side)
- `CURRENT_STATUS`: OPEN, blocked on R-02 census (its `EN_CENSUS.json` is the input). Controller work first.
- `PROVEN_PROBLEM`: up to 462 static Arabic tokens in generated `dist/index.html`; some portion visible under EN post-boot (exact subset = census).
- `CURRENT_EVIDENCE`: SH-2 H-SH2-02; `tools/extract_donor.py` (index-generation section; line ~157 strips `<html>` attrs).
- `ROOT_CAUSE`: `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` at template level — pin the exact emitting code path (blueprint HTML vs extractor constant) by reading the index-generation section + its input. Smallest diagnostic before mutation: cite emitting line(s).
- `CANONICAL_OWNER`: Controller (harness/generator) — `dist/index.html` is generated; never hand-edit.
- `DEPENDENCIES`: R-02 census. `COLLISIONS`: any other `tools/**` work (R-25) → sequence Controller batches serially.
- `SALVAGE_TO_PRESERVE`: G-20 bootstrap mechanism (bare `<html>` + preference bootstrap) — do not reintroduce baked `dir/lang`.
- `CLOSED_READ_SET`: `tools/extract_donor.py` (index-generation section), `dist/index.html`, R-02 census, CONTROLLER_REGISTERS G-20 row.
- `WRITABLE_PATHS`: `tools/extract_donor.py` (Controller bounded correction) + regenerated `dist/index.html` via build. `PROHIBITED`: hand-forged dist; donor source edits.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) pin emitting lines; (2) make emitted static shell text locale-neutral (EN default) preserving G-20 bootstrap order (preference→browsing-context→placeholder); (3) rebuild; (4) EN static census of `dist/index.html` = 0 visible Arabic; AR route renders Arabic correctly post-bootstrap; (5) suite+conformance+smoke.
- `EXPECTED_RESULT`: generated shell neutral at rest; runtime locale governs display. `POSITIVE_TESTS`: static census 0; no `<html dir=… lang=…>` reintroduced; build parity; 3 greens. `NEGATIVE/FALSIFICATION`: AR boot capture (no wrong-language flash at 1s); locale switch unaffected.
- `PRESENTATION/VISUAL_PROOF`: AR/EN boot captures. `BEHAVIOR/INTERACTION_PROOF`: locale switch unaffected. `DOMAIN/DATA/PROVIDER_PROOF`: n/a — state explicitly.
- `REGRESSION_SCOPE`: build parity + suite + conformance + smoke. `CLOSURE_CRITERIA`: static census 0 + greens + emitting-lines cited in HANDOFF. `STOP_CONDITIONS`: emitting path = donor source content (donor immutable) → STOP + report alternative (runtime-hide = foundation → new lane decision).
- `OUTPUT_REQUIRED`: before/after static census + extractor diff + receipts. `CANDIDATE_SIZE`: S. `RECOMMENDED_EXECUTION_ROUTE`: **Controller bounded correction** (tools = harness; Writer prohibited).

### R-04 — SH-R1/R2 shared hosts (replay EN-only, compare baked `dir=rtl`)
- `CURRENT_STATUS`: OPEN; lane `SHFP-1` stopped pre-work (no commit).
- `PROVEN_PROBLEM`: `foundation/timeline/replay-host.ts` English-only chrome under AR; `foundation/analytical/compare-host.ts` bakes `dir="rtl"` + Arabic-only chrome.
- `CURRENT_EVIDENCE`: `writer-output/W03-RESULTS/SERIALIZED_HOTSPOT_REQUEST.md` (SH-R1/SH-R2 exact lines; RES-1 measured).
- `ROOT_CAUSE`: host templates lack locale pairs + hardcode direction (direction must follow container/preference — G-20/AD-02 law).
- `CANONICAL_OWNER`: shared foundation hosts (Results/compare consumers read-only). `DEPENDENCIES`: none. `COLLISIONS`: none among future lanes.
- `SALVAGE_TO_PRESERVE`: RES-1's truthful-unavailable + injected-owner patterns; replay inertness law.
- `CLOSED_READ_SET`: request file; the two hosts; VISUAL_EXECUTION_STANDARD §0; language rows.
- `WRITABLE_PATHS`: the two host files + `writer-output/<lane>/`. `PROHIBITED`: common.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) inventory literals → build `{ar,en}` pairs (reuse existing tx/ternary pattern from `bottom-shelf.ts`/`accepted-runtime.ts` post-R-02 — coordinate pattern); (2) remove baked direction attrs → inherit from container; (3) rebuild; (4) AR/EN captures both hosts (Results timeline + Compare views); (5) battery.
- `EXPECTED_RESULT`: hosts correct locale + direction in both locales. `POSITIVE_TESTS`: AR/EN captures; locale flip; `results-aar-compare` + `replay-causality` flows PASS; suite ×2; conformance 6/6; smoke. `NEGATIVE/FALSIFICATION`: grep no `dir="rtl"` literal remains in the two files; replay canonical-hash invariant re-run (RES-1 L1).
- `PRESENTATION/VISUAL_PROOF`: sha captures ×2 locales. `BEHAVIOR/INTERACTION_PROOF`: scrub + compare interactions work. `DOMAIN/DATA/PROVIDER_PROOF`: replay historical/inert; injected compare owner; ceilings.
- `REGRESSION_SCOPE`: Results flows + suite + conformance + smoke. `CLOSURE_CRITERIA`: no baked dir; locale correct; invariants held; greens. `STOP_CONDITIONS`: host needs structural redesign (not i18n/dir) → STOP+report.
- `OUTPUT_REQUIRED`: captures + grep-proof + invariant receipts + HANDOFF. `CANDIDATE_SIZE`: S. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (may merge with R-02/R-05 into one SHFP-style lane — see §6).

### R-05 — shared spatial presentation defects (D-04 chip overlap, D-08 readout, VIS D-06 wrap, F-SH1-02 label hit-target, ENT B-4 selection sync)
- `CURRENT_STATUS`: OPEN; `SHFP-1` stopped pre-work.
- `PROVEN_PROBLEM`: (a) status chip overlaps id chip same baseline; (b) `.spatial-readout{left:14px}` + `direction:ltr` wrong in RTL; (c) node title wrap/ellipsis defect; (d) relation label hit-target interception at 1024×900; (e) structure-row click updates context but canvas readout stays 0-selected while canvas click gives selectionCount=1.
- `CURRENT_EVIDENCE`: ENT-1 D-04/D-08 probes (`writer-output/W03-ENTERPRISE/evidence/shared-hotspot-probes.json`, d-ledger probe); VIS-1 D-06 note; SH-1 F-SH1-02; ENT-1 B-4 record.
- `ROOT_CAUSE`: (a)(b)(c) proven at `foundation/spatial/presentation.ts` (shared node/readout rendering); (d)(e) `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` at file level — locate exact hit-target/selection-descriptor code in `foundation/spatial/**`; if (e) lives in `surfaces/enterprise/**` → STOP+report exact line (not this lane's root).
- `CANONICAL_OWNER`: shared spatial family (S-04). `DEPENDENCIES`: none. `COLLISIONS`: none among future lanes.
- `SALVAGE_TO_PRESERVE`: canonical-store read-only invariants (VIS-1 sha-identical pattern); SH-1 relation wiring (do not touch RelationInteractionOwner wiring).
- `CLOSED_READ_SET`: the named probe JSONs; `foundation/spatial/**`; profiles spatial slots; standard §0.
- `WRITABLE_PATHS`: `stack/native-typescript/foundation/spatial/**` + lane output dir. `PROHIBITED`: common + `surfaces/**` (report out-of-root roots).
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) reproduce each defect with the existing probes (D-04 layout measure, readout computed style, wrap measure, label dblclick hit test @1024, dual-route selection probe); (2) D-04: status chip own baseline row/flow matching reference (capture reference crop); (3) D-08: logical properties (`inset-inline-start`), remove baked direction; (4) D-06: single-line ellipsis + full-value tooltip (pattern used by other nodes); (5) F-SH1-02: label hit-target z-order/pointer-events so label receives dblclick @1024 (probe: opens composer); (6) B-4: trace structure-row → selection descriptor; if in spatial hosts, sync so both routes produce identical `selectionCount`; (7) battery.
- `EXPECTED_RESULT`: no overlap ×4 matrix; RTL readout mirrors; titles ellipsized; label actionable @1024; identical selection truth both routes.
- `POSITIVE_TESTS`: probes ×2 locales ×2 viewports; suite ×2; conformance 6/6; smoke; selection flows PASS. `NEGATIVE/FALSIFICATION`: canonical-store sha unchanged after all interactions; no new observers; grep no baked direction in spatial files.
- `PRESENTATION/VISUAL_PROOF`: before/after sha captures. `BEHAVIOR/INTERACTION_PROOF`: label dblclick + both selection routes + focus retention. `DOMAIN/DATA/PROVIDER_PROOF`: selection descriptor truth identical (JSON probe).
- `REGRESSION_SCOPE`: spatial/relation flows + suite + conformance + smoke. `CLOSURE_CRITERIA`: every sub-item probe green ×4; invariant held; greens; out-of-root reported. `STOP_CONDITIONS`: B-4 enterprise-side → STOP+report; canonical-mutation suspicion → STOP.
- `OUTPUT_REQUIRED`: probe JSONs, captures, grep proofs, HANDOFF (four truths). `CANDIDATE_SIZE`: M. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (merge with R-02/R-04 into one SHFP grouping).

### R-06 — composition & shell presentation residuals (SC-1 items A–H)
- `CURRENT_STATUS`: OPEN; lane `SC-1` stopped after baseline-test run only (`evidence/baseline-test-run1.log`); no commit.
- `PROVEN_PROBLEM` (per sub-item): (A) Today LEFT `Filter · …` never re-renders after `today.filter` (LEFT written once at mount by m0); (B) m0 runs toolbar omits `runs.preflight/prepare/start/stop/seal` though `composeRunsSurface` registers them; (C) Runs toolbar labels English under AR (H-RUN-2); (D) generic TOP banners instead of profile identity; (E) m0/w04-rescue chrome English under AR (MAS1-001/002); (F) shell 4-row header vs compact reference (AUD-U1); (G) document title duplicated first paint (OWNED-ITEM-01); (H) w04-rescue localization must avoid observers (REV-1 starvation: two childList observers ping-pong, `load` never fired <4s).
- `CURRENT_EVIDENCE`: `writer-output/W01/SERIALIZED_HOTSPOT_REQUEST.md` (W01-F measured rows 03/05/06/07 LEFT stale); `writer-output/W03/SERIALIZED_HOTSPOT_REQUEST.md` (R5-H1..H5 exact proposed hunks + `main.ts` isSpatial render-path analysis); RUN-1 B3; PRC-1 TOP note; MAS-1 findings; REV-1 starvation record; AUD-1 U1.
- `ROOT_CAUSE`: (A)(B)(D)(E) proven at `m0-controller-composition.ts` (mount-once LEFT; toolbar array at runs branch ~line 311; hardcoded banner strings; hardcoded chrome labels); (C) toolbar label literals; (F)(G) `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` until measured in-shell (F may be workspace-host/foundation → out-of-root STOP); (H) constraint proven (REV-1's failed approach recorded).
- `CANONICAL_OWNER`: W01-SHELL (composition root).
- `DEPENDENCIES`: none. `COLLISIONS`: m0/main shared with future SH-CP-2 → SH-CP-2 AFTER this lane; `w04-rescue.ts` reserved here (not SHFP).
- `SALVAGE_TO_PRESERVE`: R5-H1..H5 proposed hunks (2026-09-29 text — RE-DERIVE, do not blind-apply: RUN-1/RES-1 moved ground); W01-F exact hunk; `writer-output/W01/CBF002_PROBE.json` probe pattern; profile `slots.TOP` texts.
- `CLOSED_READ_SET`: both historical hotspot requests (full); current `m0-controller-composition.ts` (today/runs/health branches), `main.ts` (isSpatial block), `surfaces/shell/**`, `surfaces/composition/w04-rescue.ts` (~86/~849/~925); profiles `{today,runs,health,manual_ai,shell}.json`; standard §0; language rows.
- `WRITABLE_PATHS`: `stack/native-typescript/surfaces/m0-controller-composition.ts`, `stack/native-typescript/main.ts`, `stack/native-typescript/surfaces/shell/**`, `stack/native-typescript/surfaces/composition/w04-rescue.ts`, `dist/**` via build, `writer-output/SC-1/`. `PROHIBITED`: common + `foundation/**` + other `surfaces/**` (report needs).
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) build + baseline (suite/conformance/smoke + Today probe + Runs toolbar DOM list); (2) A: in m0 today branch, after `today.filter` dispatch re-render the LEFT region via the same `adapter.project()/lastProjection` write the mount uses (do not move LEFT ownership); falsify with CBF002-style probe; (3) B: extend the runs-branch `workspace.toolbar([...])` (~m0:311) with `runs.preflight/prepare/start/stop/seal` (keep existing six; order per R5-H1); click-probe receipts; assess R5-H2/H3 vs current `main.ts` (apply only what still holds; do NOT clobber RUN-1's surface internals); assess R5-H4 (RES-1 may have closed) → CLOSED/OPEN with evidence; assess R5-H5 same; (4) C/E/H: localize toolbar/banner/chrome strings in m0 + w04-rescue render-time `{locale}` pattern; w04 single-pass ONLY (no MutationObserver — grep-proof); banner from profile `slots.TOP`; (5) F: measure shell header rows in `surfaces/shell/**` → compact to reference if shell-owned, else STOP sub-scope with exact file; (6) G: probe duplicate title origin → fix if in roots else report; (7) battery.
- `EXPECTED_RESULT`: Today LEFT truthful+fresh; full Runs command set reachable; AR toolbar/banner/chrome correct; single title; profile-identity banners; no observer loops.
- `POSITIVE_TESTS`: Today filter probe; toolbar receipts; AR `load` <4s; m0/w04 EN census 0 visible Arabic; suite ×2; conformance 6/6; smoke 46/46; REV-1's exact failing scenario re-run.
- `NEGATIVE/FALSIFICATION`: no new `MutationObserver` in diffs; WAVE-1 code untouched (`git diff` limited to four roots; RUN-1 runs-surface internals byte-unchanged); N1 out-of-root refusal; R5 re-derivation record where text differs.
- `PRESENTATION/VISUAL_PROOF`: before/after captures sha-bound. `BEHAVIOR/INTERACTION_PROOF`: filter→LEFT, command receipts, locale switch. `DOMAIN/DATA/PROVIDER_PROOF`: banner/command identity truthful vs profile.
- `REGRESSION_SCOPE`: suite + conformance + smoke + w01/w03/w04 family flows.
- `CLOSURE_CRITERIA`: A–H status table all CLOSED or exact OUT-OF-ROOT report; 3 greens; diff-scope proof. `STOP_CONDITIONS`: common + WAVE-1 clobber risk + F/G out-of-root.
- `OUTPUT_REQUIRED`: per-item table, probes, captures, diff-scope proof, HANDOFF. `CANDIDATE_SIZE`: M (borderline L if H2–H5 all apply — re-assess). `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer.

### R-07 — 503 body drain (BRIDGE-1)
- `CURRENT_STATUS`: OPEN; lane stopped with NO durable result (clean worktree, no commit).
- `PROVEN_PROBLEM`: `platform-input-direction-bridge` non-OK path never drains the response body → in-page request never settles → `networkidle` hangs and awaiting consumers stall in degraded runtime (503 listener) — root of the cross-lane hang family.
- `CURRENT_EVIDENCE`: RUN-1 B1 (minimal repro; `if (!res.ok) return null` pattern; curl 49ms vs Chromium pending); REV-1 §2 (503 non-drain); RES-1 (bridge never drains non-OK bodies); SH-2/ENT-1 env notes.
- `ROOT_CAUSE`: proven — early-return on `!res.ok` without body read/cancel.
- `CANONICAL_OWNER`: shared foundation contract (`foundation/contracts/platform-input-direction-bridge.ts`). `DEPENDENCIES`: none. `COLLISIONS`: none (unique file in future plan).
- `SALVAGE_TO_PRESERVE`: consumer contract shapes (identical success-path behavior); PR01 expectations (read-only).
- `CLOSED_READ_SET`: the bridge file + importers (`foundation/global/input-direction.ts`, `main.ts` call sites); RUN-1/REV-1/RES-1 HANDOFF sections; PR01 tests (read-only).
- `WRITABLE_PATHS`: the bridge file only + lane output dir. `PROHIBITED`: common + `tests/**`.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) locate `!res.ok` early return(s); (2) non-OK: `await res.body?.cancel()` (or read+discard) THEN resolve the waiter with truthful non-OK + status/reason (keep public return shape; add fields only if callers tolerate); (3) OK path byte-identical; (4) build; (5) probe: local 503 responder on a free port (curl pre-check 4174; if transport hard-codes 4174 → wait/retry once + record env): fetch settles <2s (before = 30s hang), `networkidle` completes, 0 pageErrors, consumer gets truthful non-OK; (6) battery.
- `EXPECTED_RESULT`: degraded runtime never hangs the page; truthful non-OK propagation; success path unchanged.
- `POSITIVE_TESTS`: 503-settle probe; suite ×2; conformance 6/6; input-direction/locale flows PASS; PR01 (read-only run) unchanged. `NEGATIVE/FALSIFICATION`: diff hunk restricted to non-OK branch; network-error (not just 503) also settles; no unhandled rejection.
- `PRESENTATION/VISUAL_PROOF`: none required (state explicitly) + page-continues screenshot as behavior evidence. `BEHAVIOR/INTERACTION_PROOF`: probe. `DOMAIN/DATA/PROVIDER_PROOF`: degraded-mode = truthful unavailable (assert downstream state; no fabricated availability).
- `REGRESSION_SCOPE`: suite + conformance + w05 direction flows + PR01. `CLOSURE_CRITERIA`: settle proof + 3 greens + contract-shape diff proof. `STOP_CONDITIONS`: public contract shape must change → STOP with exact needed change; port blocked → record env.
- `OUTPUT_REQUIRED`: PROBE_503 before/after, diff-scope proof, receipts, HANDOFF. `CANDIDATE_SIZE`: S. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (preferred, for probe evidence) or Controller bounded.

### R-08 — Health BOTTOM reachability (SH-CP-2)
- `CURRENT_STATUS`: QUEUED_NOT_LAUNCHED (was queued after SC-1; never launched).
- `PROVEN_PROBLEM`: profile declares `slots.BOTTOM="Deep Health diagnostics/history"` + `bottom_tabs=['history','domain-diagnostics']`, but no registered `BottomDeepWorkProvider` → `providerCount=0`, toggle no-op, adapter BOTTOM content unreachable; shared contract tab vocabulary (`history|compare|recovery`, families `structured|operational`) lacks `domain-diagnostics`.
- `CURRENT_EVIDENCE`: HLTH-1 escalation #5 + HANDOFF (providerCount=0/UNAVAILABLE measurements); `profiles/health.json`; SH-2 contract observation (tabs mismatch).
- `ROOT_CAUSE`: proven — missing composition registration + contract tab-vocabulary mismatch with an ACCEPTED profile.
- `CANONICAL_OWNER`: shared bottom-deep-work contract + m0 composition (W01) + `adapters/health-runtime.ts` (W05-HEALTH).
- `DEPENDENCIES`: **R-06/SC-1 first** (m0 serialization) **and R-02 first** (`bottom-shelf.ts`/accepted-runtime shared shelf files).
- `COLLISIONS`: m0/main ↔ R-06; `bottom-shelf.ts` ↔ R-02.
- `SALVAGE_TO_PRESERVE`: HLTH-1's already-written-but-unreachable BOTTOM content in `health-runtime.ts`; exact profile tab ids; second-notes-engine prohibition; ceilings (queue≠liveness, refresh≠diagnose, unknown-never-green).
- `CLOSED_READ_SET`: HLTH-1 HANDOFF §escalation; `profiles/health.json`; bottom contract source (`grep -rn "BottomDeepWork\|bottom_tabs" stack/native-typescript/foundation`); `adapters/health-runtime.ts` bottom section; m0 health branch; standard §0; shared-owner law.
- `WRITABLE_PATHS`: the bottom contract file(s), `surfaces/m0-controller-composition.ts` (registration only), `adapters/health-runtime.ts`, `dist/**` via build, `writer-output/SH-CP-2/`. `PROHIBITED`: common + `surfaces/health/**` — **no new surface directory; no new architecture** (profile satisfied through existing BOTTOM mechanism).
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) read contract + profile → minimal additive contract extension: add `domain-diagnostics` tab id under `operational` family (keep existing ids; justify as shared-mechanic under OD-20260910-012/005 — NOT a new Owner decision); (2) m0 health branch: register Health `BottomDeepWorkProvider` (same composition-injection pattern as runs' `sharedSession` injection at m0:311; provider = adapter's existing bottom content; tabs mapped 1:1); (3) `health-runtime.ts`: expose bottom content per contract shape (content already written — do not rewrite); (4) build; (5) battery.
- `EXPECTED_RESULT`: Health BOTTOM toggles open with real content; tabs exactly match profile; ceilings preserved; no `surfaces/health/**` created; no second notes engine.
- `POSITIVE_TESTS`: toggle probe (providerCount≥1, both tabs switch); profile-vs-runtime tab-set equality; suite ×2; conformance 6/6; smoke; health flow PASS ×2. `NEGATIVE/FALSIFICATION`: assert no `surfaces/health/**` created (git status); ceilings still false in DOM; provider-absent test → truthful UNAVAILABLE; S16/CG6/D11 green.
- `PRESENTATION/VISUAL_PROOF`: before/after bottom open/closed ×2 locales ×1440/1024 (EN no Arabic). `BEHAVIOR/INTERACTION_PROOF`: toggle/tab switching. `DOMAIN/DATA/PROVIDER_PROOF`: ceilings + no fabricated diagnostics.
- `REGRESSION_SCOPE`: suite + conformance + smoke + health flow + releases shelf flow (shared contract touched). `CLOSURE_CRITERIA`: profile tabs reachable; greens; no architecture; four truths. `STOP_CONDITIONS`: contract change beyond additive tab id needed → STOP + record as genuine-Owner-choice candidate; any `surfaces/health/**` need.
- `OUTPUT_REQUIRED`: registration diff evidence, tab-equality receipt, captures, HANDOFF. `CANDIDATE_SIZE`: M. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (serialized after R-02 + R-06).

### R-09 — D-08 donor.css `!important` scoping
- `CURRENT_STATUS`: OPEN (Controller-batch queued; never executed).
- `PROVEN_PROBLEM`: generated `dist/foundation/donor.css:734` carries `#rightPane .contextscope{display:grid!important}` defeating consumer suppression (LRN-1 needed inline overrides).
- `CURRENT_EVIDENCE`: SH-2 H-SH2-03 (confirmed generated line); LRN-1 DEF-L04 workaround; historical D-08 record.
- `ROOT_CAUSE`: proven — extractor emits donor rule unscoped for app use.
- `CANONICAL_OWNER`: Controller (harness `tools/extract_donor.py`).
- `DEPENDENCIES`: none strictly; sequence with R-03 (ONE Controller pass on same file). `COLLISIONS`: `tools/**` shared with R-25 → serialize Controller tool batches.
- `SALVAGE_TO_PRESERVE`: accepted donor bytes (NEVER edit donor source — OD-20260914-022 donor floor); LRN's local workaround (may remain; optional later cleanup, out of scope).
- `CLOSED_READ_SET`: `tools/extract_donor.py` donor-CSS emission section; SH-2 H-SH2-03; LRN-1 composition hunk.
- `WRITABLE_PATHS`: `tools/extract_donor.py` + regenerated `dist/foundation/donor.css` via build. `PROHIBITED`: donor source, hand-forged dist.
- `PRACTICAL_IMPLEMENTATION_STEPS`: (1) locate emitted rule; (2) scope it to the donor container (prefix the donor-root class the extractor already uses) so app-level `#rightPane .contextscope` suppression wins; (3) rebuild; (4) grep generated css for the scoped form; (5) learn suppression probe unchanged; suite+conformance+smoke.
- `EXPECTED_RESULT`: consumer suppression works without `!important` arms race; donor visuals unchanged inside donor scope. `POSITIVE_TESTS`: generated-line grep; learn probe; greens. `NEGATIVE/FALSIFICATION`: donor-region render byte-compare unchanged; no donor-source diff.
- `PRESENTATION/VISUAL_PROOF`: donor-region before/after captures. `BEHAVIOR/INTERACTION_PROOF`: suppression toggle works. `DOMAIN`: n/a.
- `REGRESSION_SCOPE`: build parity + suite + conformance + smoke + learn flow. `CLOSURE_CRITERIA`: scoped rule + no donor-visual change + greens. `STOP_CONDITIONS`: scoping changes donor rendering → revert + report alternative.
- `OUTPUT_REQUIRED`: extractor diff + generated-line proof + captures. `CANDIDATE_SIZE`: S. `RECOMMENDED_EXECUTION_ROUTE`: **Controller bounded correction** (same pass as R-03).

### R-10 — pane-order mirror vs accepted reference
- `CURRENT_STATUS`: CLASSIFIED — non-blocking; NO Product mutation authorized.
- `PROVEN_PROBLEM`: pane order does not mirror under RTL (`#leftPane x=0` under `dir=rtl`, 23/23; root = generated `donor.css .cols{direction:ltr}`) — BUT the accepted donor reference itself does not mirror.
- `CURRENT_EVIDENCE`: SH-2 H-SH2-04 (23-route proof + reference observation); POR-1 SHARED-1; MAS-1 MAS1-003.
- `ROOT_CAUSE`: proven at generated-rule level; desirability = reference-authority question (§8 Choice 2).
- `CANONICAL_OWNER`: Owner (reference/RTL preference) — decision first. `DEPENDENCIES`: Owner answer. `COLLISIONS`: would touch R-09's extractor surface if approved.
- `SALVAGE_TO_PRESERVE`: SH-2 probe + reference observation records.
- `CLOSED_READ_SET`/`WRITABLE_PATHS`: n/a until decided.
- `PRACTICAL_IMPLEMENTATION_STEPS`: none (decision gate). If mirror approved: Controller extractor `.cols` fix in the R-03/R-09 pass + 23-route RTL capture proof + explicit acceptance of divergence from accepted reference. If keep: record in acceptance package; close CLASSIFIED.
- `EXPECTED_RESULT`: matches Owner choice. `POSITIVE/NEGATIVE`: n/a now. `PRESENTATION/VISUAL_PROOF`: required at decision. `BEHAVIOR`: n/a. `DOMAIN`: n/a.
- `REGRESSION_SCOPE`: 23-route RTL captures if changed. `CLOSURE_CRITERIA`: Owner choice recorded + executed/classified. `STOP_CONDITIONS`: never implement without the choice.
- `OUTPUT_REQUIRED`: future decision record. `CANDIDATE_SIZE`: S (if approved). `RECOMMENDED_EXECUTION_ROUTE`: Owner decision → Controller correction.

### R-22 — VD-008 image channel (ENVIRONMENT)
- `NOT Product`: image-read channel returns stale/misrouted frames (6+ sha-proven occurrences).
- `MITIGATED`: canonical mitigation = sha256 + DOM/OCR/pixel cross-check before any visual verdict (used successfully by REL/MAS/POR/ENT/SH-2 and Primary).
- `FUTURE ACTION`: pixel-level human sign-off at acceptance via a working viewer (Owner-side or verified channel retest: dual-read of a known sha-labeled file + comparison). Closing evidence: one successful dual-read sha-consistency record. `BLOCKS ACCEPTANCE`: pixel sign-off only — all machine-checkable visual proofs use non-pixel ground truth; NON-BLOCKING for candidate. `ROUTE`: evidence-only/environment; never Product.

### R-24 — mandated-tool writes in lane worktrees (EVIDENCE/SCRATCH)
- `NOT Product`: unstaged shared-workspace outputs in the19 finished lane worktrees were removed with `writer-output` during disk reclamation (transient side effects gone; durable bytes remain in pushed branches; integration tree clean). Closure-lane worktrees retain trivial `assurance/MODEL_TEST_RESULTS.json` local mods (SC-1, SHFP-1).
- `FUTURE ACTION`: on any lane re-open, `git checkout -- writer-output assurance` to restore clean state. `CLOSURE_CRITERIA`: integration tree `git status` empty (TRUE now) + no unexplained dirt on any future candidate. `BLOCKS ACCEPTANCE`: no.

### R-25 — harness batch (HARNESS, not Product)
- `NOT Product`: (i) flow tools hard-code candidate tag `c82cec63` in receipt filenames → `DRIFT_RECORDED` (BKP U-06, PRC, HLTH); (ii) `tools/w03-browser-flows.mjs` deletes prior W03 evidence PNGs (F-SH1-05 — restored by ENT-1); (iii) CG2 `count('VirtualizationOwner')=2` baseline-fail vs `universalVirtualizationOwner:false` contract (LIB PRE-EXISTING-01).
- `FUTURE ACTION`: Controller batch in `tools/**`: dynamic candidate tag (env/arg-derived), archive-before-write for evidence dirs, CG2 expectation → contract-correct value (2) with justification comment. Closing evidence: rerun shows true tree in filenames; prior evidence survives; CG2 green at baseline. `BLOCKS ACCEPTANCE`: no (receipts already source-bound; tags cosmetic; CG2 outside check-chain).

### R-26 — runtime re-seed before final battery (EVIDENCE)
- `NOT Product`: local persisted runtime baseline (pre-fix) masks first paint (LIB DP-01).
- `FUTURE ACTION`: before the future final battery: stop runtime, clear gitignored local runtime DB/state (locate under `stack/local-runtime/` config / `.runtime/`), restart `npm run runtime:local`, re-seed if seed scripts apply, recapture fresh first-paint. Closing evidence: fresh capture without stale masking + note in battery receipt. `BLOCKS ACCEPTANCE`: first-paint evidence only — NON-BLOCKING.

### R-31 — H03R2 governed proof cycle (PROOF)
- `CURRENT_STATUS`: PARTIAL_PRESERVED (see §5).
- `PROVEN_PROBLEM`: `H03-R2-PROP-001=NOT_PROVEN`, `H03-R2-FALSIFY-001=NOT_PROVEN` — static evidence insufficient by law; requires the governed cycle on real rendered consumers.
- `CURRENT_EVIDENCE`: AUTHORITY_STATUS ceilings; H03-R2 manifest (Drive `H03_R2_PROPAGATION_AND_FALSIFICATION_MATRIX`); OFFLOAD-03 §1.5/1.6 cycle spec.
- `ROOT_CAUSE`: n/a — proof gap, not defect. `UNRESOLVED`: whether central descriptor mutations reach BOTH consumers at runtime — exactly what the cycle determines.
- `CANONICAL_OWNER`: structured family (S-03): central `foundation/structured/outline-descriptor.ts`; Library-local `adapters/library-outline-descriptor.ts`; Learn `adapters/learn.ts` + `adapters/context-learn-structured.ts`.
- `DEPENDENCIES`: none (parallel-safe; never push Product delta). `COLLISIONS`: no other planned lane writes these files; serialize vs any future structured-family lane.
- `SALVAGE_TO_PRESERVE`: **H03R2-1's partial harness** — `/workports/cep-lanes/H03R2-1/...` → actual path `/workspaces/cep-lanes/H03R2-1/writer-output/H03R2-1/`: `capture.mjs`, `probe-learn.mjs`, `debug-route.mjs`, `server.log`, `captures/baseline/outline_library.txt` + `.textlist.json` + `capture_baseline.json` (step-0 Library baseline captured; Learn baseline NOT yet captured). Untracked/uncommitted — copy into the fresh lane's output dir; verify baseline still matches current source before trusting.
- `CLOSED_READ_SET`: this spec; AUTHORITY_STATUS ceilings; central owner + two consumer adapters; standard §0; profiles library/learn.
- `WRITABLE_PATHS` (temporary, must end reverted): central file (PROOF A) + Library-local adapter (PROOF B), each mutated then `git checkout --` reverted; output `writer-output/H03R2-1/`. `PROHIBITED`: any committed Product delta (final `git diff -- stack/` MUST be empty); other sources; controller/cep-writer.
- `PRACTICAL_IMPLEMENTATION_STEPS` (governed cycle — exact): (0) build; serve `dist/` on a NON-4174 port; render real `?surface=library` and `?surface=learn`; capture outline-region outerHTML sha256 + text list for both (salvaged Library baseline may match — verify); (1) record both consumers' import/derivation chain to the central descriptor; (2) PROOF A: ONE minimal semantic mutation to `foundation/structured/outline-descriptor.ts` with the expected observable effect written down FIRST; rebuild; Library outline changes as expected (assert); Learn outline changes as expected (assert — BOTH = PROP); (3) `git checkout --` central; rebuild; both sha+text identical to step-0 (restoration); (4) PROOF B: mutate `adapters/library-outline-descriptor.ts`; rebuild; Library changes (assert); **Learn byte-identical to baseline (assert — no leak)**; (5) revert; restoration asserts; (6) final: `git diff -- stack/` empty + `npm test` 210/0; commit EVIDENCE ONLY; push.
- `EXPECTED_RESULT`: PROP-001 PROVEN (both real consumers change under central mutation + restoration proven); FALSIFY-001 PROVEN (local mutation does not leak). If EITHER fails: capture exact truth (failure IS the finding), revert, report — do NOT massage the mutation to pass; Primary opens the smallest correction lane.
- `POSITIVE_TESTS`: cycle asserts; 0 pageErrors per render; suite 210/0 final. `NEGATIVE/FALSIFICATION`: restoration equality ×2 cycles; no-leak equality; empty-diff proof; NO static-only substitutes (runtime render required).
- `PRESENTATION/VISUAL_PROOF`: outline DOM sha+text = primary; screenshots optional sha-bound (pixel channel unreliable). `BEHAVIOR/INTERACTION_PROOF`: outlines render on real routes. `DOMAIN/DATA/PROVIDER_PROOF`: descriptor change is domain-semantic (record exactly); no provider involved (state).
- `REGRESSION_SCOPE`: suite final only. `CLOSURE_CRITERIA`: both ceilings PROVEN with hash-identical restoration + empty diff, OR exact defect report with evidence. `STOP_CONDITIONS`: no honest observable effect in both consumers → report PROP failure; Learn reacts to Library-local → report leak; any committed Product delta → STOP.
- `OUTPUT_REQUIRED`: `PROOF_A_PROP.json`, `PROOF_B_FALSIFY.json`, DOM captures, restoration hashes, HANDOFF. `CANDIDATE_SIZE`: M. `RECOMMENDED_EXECUTION_ROUTE`: MiMo Writer (evidence-only result; Owner previously granted H03R2-1 — re-confirm at launch).

---

## §5 The five stopped closure lanes — exact safe-stop records

| Lane | H03R2-1 | SC-1 | SHFP-1 | AD01-1 | BRIDGE-1 |
|---|---|---|---|---|---|
| Objective (residuals) | R-31 governed proof cycle | R-06 items A–H | R-02 + R-04 + R-05 | R-01 | R-07 |
| Launch parent | `58932fcda6903f748bde34f663246f78add1dbfc` | `af2f64f` | `af2f64f` | `af2f64f` | `af2f64f` |
| Branch / worktree | `writer/mi-serial-lane/H03R2-1` / `/workspaces/cep-lanes/H03R2-1` | `writer/mi-serial-lane/SC-1` / `…/SC-1` | `writer/mi-serial-lane/SHFP-1` / `…/SHFP-1` | `writer/mi-serial-lane/AD01-1` / `…/AD01-1` | `writer/mi-serial-lane/BRIDGE-1` / `…/BRIDGE-1` |
| Session (reference) | `ses_f0329d2b2ffeLVli0FhhU6POfE` | `ses_f031ce049ffeuy7lzKpZAylrY5` | `ses_f031ce031ffedWqv4jO5eLsShM` | `ses_f031c6174ffeawhNuLh77FnYHM` | `ses_f031c616effemI88lVSVgx83Gc` |
| Latest commit/tree | none beyond parent (local branch = parent; **remote branch does NOT exist**) | same | same | same | same |
| Files changed | **zero tracked changes** (stack/tools clean — no unreverted proof mutation) | zero (only local `assurance/MODEL_TEST_RESULTS.json` run artifact) | zero (same) | zero — never started | zero — never started |
| Evidence produced | `writer-output/H03R2-1/` (untracked): capture harness (`capture.mjs`, `probe-learn.mjs`, `debug-route.mjs`), `server.log`, **step-0 Library baseline** (`captures/baseline/outline_library.txt`, `.textlist.json`, `capture_baseline.json`). No Learn baseline; no mutation step reached (or fully reverted). | `writer-output/SC-1/evidence/baseline-test-run1.log` only | none (baseline test → local assurance mod) | none | none |
| Proven | harness valid; Library baseline captured | baseline suite runnable at parent | baseline suite runnable | n/a | n/a |
| What remains | entire governed cycle (R-31 steps 0–6) | everything (A–H) | everything (R-02/04/05) | everything (R-01) | everything (R-07) |
| Salvage reusable? | **YES** — copy `writer-output/H03R2-1/` into fresh lane; verify baseline vs current source first | marginal (log) | no | no | no |
| Resume vs replay | **Fresh bounded replay preferred** (killed sessions cannot resume; rebind parent at launch; copy salvage) | fresh replay | fresh replay | fresh replay | fresh replay |
| Minimum next action | new bounded lane per R-31 spec; re-confirm Owner's H03R2-1 grant | new bounded lane per R-06 | new bounded lane per R-02/04/05 (may merge into one SHFP grouping) | new bounded lane per R-01 | new bounded lane per R-07 |

**Stop event:** all five background sessions were cancelled by the harness (no lane had pushed; no commits; no source mutation anywhere). Owner directive then superseded execution with this state-capture mission. Branches exist locally only (at parents) — harmless placeholders; a future Primary may reuse them or delete/recreate (no commits lost).

---

## §6 FUTURE CANDIDATE DAG — `CANDIDATE_DAG__NOT_LAUNCH_AUTHORITY`

Parent rule for every lane: `git fetch` → rebind to the exact then-current remote tip → record HEAD/tree → verify clean → `npm ci` (fresh worktree) → `npm run build:runtime` before browser work. Baseline greens to preserve: `npm test` 210/0 ×2, `browser-conformance` 6/6, route smoke 46/46 (or better).

```
WAVE-F (parallel — file-disjoint, no prerequisites):
  F1 = AD01-1 replay      [R-01]   writable: preferences/schema.ts, responsive-layout.ts, model-tests.ts, dist(build)
  F2 = SHFP-1 replay      [R-02,R-04,R-05] writable: foundation/accepted-runtime.ts + foundation/global/bottom-shelf.ts,
                                    foundation/timeline/replay-host.ts, foundation/analytical/compare-host.ts, foundation/spatial/**
  F3 = SC-1 replay        [R-06]   writable: m0-controller-composition.ts, main.ts, surfaces/shell/**, surfaces/composition/w04-rescue.ts
  F4 = BRIDGE-1 replay    [R-07]   writable: foundation/contracts/platform-input-direction-bridge.ts
  F5 = H03R2-1 replay     [R-31]   temporary central+Library-local mutations (exact revert); salvage from stopped worktree
  C2 = Controller batch R-25 (tools/** harness batch)                [any time; serial with C1]
  R-24 restore            [Controller, trivial]
SERIAL EDGES:
  F6 = SH-CP-2   [R-08]  AFTER F2 (`foundation/accepted-runtime.ts` + `foundation/global/bottom-shelf.ts`) AND F3 (m0) — locks: bottom-shelf.ts, m0
  C1 = Controller R-03 + R-09 in ONE pass (extractor: index statics + donor.css scoping) AFTER F2's EN_CENSUS.json
                                     [+ serial vs C2 on tools/**]
  C3 = Controller R-26 runtime re-seed + first-paint recapture BEFORE final battery
  R-10 = Owner choice (mirror) → if approved, fold into C1's extractor pass (same file)
BEFORE BATTERY: consume OFFLOAD-04 + OFFLOAD-05 (ChatGPT) → spot-check → reclassify rows if contradicted
FINAL BATTERY (re-run only materially-affected pieces + full green set):
  build · npm test ×2 · duplicate-mechanics · browser-conformance (target 6/6) · 23-route smoke ×2 vp ·
  S02 (CEP_BROWSER_EXECUTABLE set) · H03R2 proof results · shared-owner/collision diff audit ·
  dist parity (git status clean incl. regenerated dist) · receipt source-binding (regen via npm run browser:test
  ONLY if a source change occurred; 6/6 EXECUTED_PASS keeps check green)
→ canonical state update (CURRENT_STATE/AUTHORITY_STATUS final epoch) → acceptance package → OWNER
```

Per-lane fields (objective, read set, writable, locks, salvage, recipe, tests, falsification, evidence, closure, STOP) = the §4 spec for its residual IDs + §0 common contract.

Grouping rationale: F1–F5 file-disjoint (parallel; F5 never commits Product); F6 serialized on two owners (m0 + bottom-shelf); C1 serialized on `tools/**` vs C2 and on F2's census; no fragmentation beyond owner boundaries (OD-20260916-043).

---

## §7 ChatGPT OFFLOAD-04 / OFFLOAD-05 (preserved pending)

| Packet | Path | Status | Purpose / expected output | Rows it may challenge | Consumption law |
|---|---|---|---|---|---|
| `CEP-REC-OFFLOAD-04` | `controller/12_execution/chatgpt_offload_queue/OFFLOAD-04_AUDIT_ONLY_REVERIFICATION_5_SURFACES.md` | `READY_FOR_CHATGPT` (not launched by this session) | READ_ONLY re-verification of the 5 `NOWR` surfaces (today, rq, scenarios, evidence, configuration): per-surface verdict table (clean vs exact bounded findings file:line) + evidence-sufficiency gaps + cross-surface findings | matrix rows 2–6 dispositions; hidden mutating-work findings | `RESULT_RETURNED → VERIFY SOURCE BINDING → SPOT-CHECK → CHECK INVALIDATION → GAP-FILL ONLY → PRIMARY ADJUDICATION` |
| `CEP-REC-OFFLOAD-05` | `controller/12_execution/chatgpt_offload_queue/OFFLOAD-05_RESIDUAL_CROSSWALK_19_CANDIDATES.md` | `READY_FOR_CHATGPT` (not launched) | Independent dedup/completeness of residuals across the 19 pushed candidate branches' HANDOFFs/hotspot files: deduplicated table + `MISSING-FROM-REGISTER` list + stale/closed detection + Owner-item sweep + evidence-integrity contradictions | any row of `FINAL_RESIDUAL_REGISTER_2026-10-02.md` (missing/stale reclassification) | same law |

Both are ChatGPT work; no internal agent substitutes (Owner law). Results return in the ChatGPT conversation; future Primary persists them to evidence custody, spot-checks quotes/locations against the branches, then adjudicates.

---

## §8 Owner-facing items

### `RESOLVED_BY_EXISTING_OWNER_AUTHORITY` (5 — execute, do NOT re-ask)
1. **Shell redesign** — `OWNER-20260910-010` defers redesign until shared workbench foundation is stable; current shell = accepted mined mechanics; deferral = the existing decision.
2. **F-048 hierarchy projection** — ZL02 §7/L-31: stays EXCLUDED until re-falsified with genuine-route evidence; current honest `UNAVAILABLE_NOT_OBSERVED` truth is correct.
3. **Destination-count freeze `C03-GATE-023` (five destinations, `destinationCountFrozen=false`)** — existing law; final count rides with shell redesign.
4. **Health BOTTOM** — accepted `profiles/health.json` declares slot+tabs → implementing it executes existing authority (R-08; contract tab extension = additive shared mechanic).
5. **Q-4 TimelineReplayOwner retain** — accepted architecture answers RETAIN (single-instance enforced; Results primary consumer; flows green; replay inert by law).

### `GENUINE_OWNER_CHOICE_REMAINING` (2 — documentation only; NOT solicited now)
**Choice 1 — RQ reference promotion.**
- Current behavior: reference held as `REVIEWED_FINAL_CANDIDATE`/`CANDIDATE__AUTHORITY_UNRESOLVED`; RQ works truthfully with the candidate label (VD-004: no promotion without Owner visual review).
- Alternatives: (a) promote to final reference authority; (b) keep candidate (status quo); (c) retire/replace.
- Consequences: (a) donor-grade presentation authority for RQ — requires Owner actually viewing it; (b) reference gap stays open but non-blocking (current); (c) RQ loses its reference binding → packet gap widens.
- Blocking? **Non-blocking.** Needed when: RQ visual acceptance review (acceptance-time).
**Choice 2 — pane-order mirror under RTL (R-10).**
- Current behavior: panes do NOT mirror under RTL on all 23 routes; matches the accepted donor reference (which itself does not mirror).
- Alternatives: (a) mirror under RTL (diverges from accepted reference); (b) keep as-is (status quo = matches reference); (c) re-capture/audit reference to confirm it encodes non-mirroring before deciding.
- Consequences: (a) RTL native-feeling layout but visible divergence from accepted reference (reference-law tension OD-20260914-022); (b) current behavior stands; (c) informed choice with one evidence pass.
- Blocking? **Non-blocking.** Needed when: RTL presentation sign-off (acceptance-time) — or earlier if (a) is preferred (so it folds into C1's extractor pass).

---

## §9 Four-truth closure matrix (fresh proof required AFTER each mutation)

| Residual | CONTENT | PRESENTATION | BEHAVIOR/INTERACTION | DOMAIN/DATA/PROVIDER |
|---|---|---|---|---|
| R-01 pane geometry | — (state n/a explicitly) | **REQUIRED** (captures ×3 bands) | **REQUIRED** (reveal/collapse) | — |
| R-02 chrome language | **REQUIRED** (EN census 0/AR intact) | **REQUIRED** (captures ×2 loc) | **REQUIRED** (live locale switch) | — |
| R-03 index statics | **REQUIRED** (static census) | **REQUIRED** (boot captures, no flash) | **REQUIRED** (locale switch unaffected) | — |
| R-04 shared hosts | **REQUIRED** (locale pairs) | **REQUIRED** (captures ×2 loc) | **REQUIRED** (scrub/compare) | **REQUIRED** (replay inert-hash; injected owner) |
| R-05 spatial | — | **REQUIRED** (chip/readout/title ×4) | **REQUIRED** (label dblclick; dual selection routes) | **REQUIRED** (selection-descriptor truth; canonical-hash invariant) |
| R-006 composition | **REQUIRED** (localized strings) | **REQUIRED** (toolbar/banner/header/title) | **REQUIRED** (filter→LEFT; command receipts; AR load<4s) | **REQUIRED** (banner/command identity vs profile) |
| R-07 bridge | — | — (state explicitly) | **REQUIRED** (503-settle; networkidle completes) | **REQUIRED** (degraded truthful unavailable) |
| R-08 health bottom | **REQUIRED** (tab set = profile) | **REQUIRED** (bottom captures ×2 loc) | **REQUIRED** (toggle/tab) | **REQUIRED** (ceilings false; truthful empty) |
| R-09 donor scoping | — | **REQUIRED** (donor region unchanged) | **REQUIRED** (suppression works) | — |
| R-10 mirror | decision-gated (if approved: full RTL matrix ×23) | (same) | — | — |
| R-31 H03R2 | **REQUIRED** (descriptor semantic defined) | **REQUIRED** (outline DOM) | **REQUIRED** (real-route both consumers) | **REQUIRED** (PROP/FALSIFY + restoration ×2) |

*(typo note: "R-006" = R-06.)*

## §10 Environment/evidence/harness isolation (never Product work)

| Item | Non-Product reason | Mitigated? | Future action | Closing evidence | Blocks acceptance? |
|---|---|---|---|---|---|---|
| R-22 (VD-008) | external channel defect; sha-proven | YES — sha+DOM/OCR/pixel mitigation canonical | pixel sign-off via verified viewer at acceptance | one dual-read sha-consistency record | Pixel sign-off only — NON-BLOCKING |
| R-24 | execution scratch, removed in disk reclamation | YES — integration tree clean | `git checkout -- writer-output assurance` on lane re-open | `git status` clean on candidate | NO |
| R-25 harness batch | tool/test cosmetics + stale contract-expectation | partial (receipts source-bound already) | Controller `tools/**` batch (dynamic tag, archive-before-write, CG2 expectation) | rerun shows true tree; evidence survives; CG2 green | NO |
| R-26 runtime re-seed | local persisted state, gitignored | NO (first-paint evidence gap) | clear+reseed before final battery; recapture | fresh first-paint capture | First-paint evidence only — NON-BLOCKING |
| H-FAM-03 ports/503 | environment + product half (R-07) | product half fixed when R-07 lands; discipline documented | serialize runtime-dependent proofs | battery green under discipline | NO |
| gpgsign 403 | no signing service in env | n/a | disclose; identities hash-based | — | NO |
| LCORR C3-002 | pre-existing baseline assertion, outside check-chain | n/a (check EXIT 0) | classify only | — | NO |
| R-30 acceptance-time visual observations (MAS1-006 reference judgment-ladder deviation; LAB toolbar-ink/density vs reference; AUD header remainder noted under shell redesign) | reference-parity observations, not defects proven against current authority | n/a | record in Owner acceptance package for visual review | Owner/Controller four-truth visual review at acceptance | NO (non-blocking) |

## §11 Reconciliation note (register vs post-seal work)

`FINAL_RESIDUAL_REGISTER_2026-10-02.md` was sealed before the five lanes launched. Post-seal deltas: canonical reconciliation `58932fc` (epoch only — no row changed), OFFLOAD-05 packet `af2f64f`, disk-reclamation strip (R-24 → "transient side effects removed"), five lane safe-stops (rows R-01/R-02/R-04/R-05/R-06/R-07/R-31 → `LANE_STOPPED_BY_OWNER`, captured in §5). No register row silently dropped: every open row appears in §4; every closed row listed in §B; this blueprint supersedes the register's "LAUNCHED" statuses.

## §12 Smallest next legal action for a future Primary

1. `git fetch` → record HEAD/tree → read `controller/READ_FIRST.md` → then this blueprint.
2. Consume OFFLOAD-04 + OFFLOAD-05 if returned (`CONSUME → VERIFY SOURCE BINDING → SPOT-CHECK → CHECK INVALIDATION → GAP-FILL → ADJUDICATE`) → amend §4 rows if contradicted.
3. Fresh Primary adjudication / Owner-brief check for launch authority (this session ended `EXECUTION_PAUSED_BY_OWNER`).
4. Launch WAVE-F per §6 (parent rebind at launch; lane prompts = §4 specs); re-confirm the H03R2-1 grant before F5.
5. Serialize F6/C1; run C3 before battery; execute the §6 battery; update canonical state; assemble the acceptance package.

*End of blueprint. Chat history not required.*
