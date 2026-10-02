# POR-1 · W04-PORTFOLIO — HANDOFF

**Class:** `CANDIDATE_ONLY · NO_SELF_PROMOTION · SOLE_CONTROLLER_REVIEW_REQUIRED`
**Lane:** `POR-1` (portfolio) · **Unit:** `W04-PORTFOLIO` · **Mission:** deep audit + close `NOT_YET_TESTED` responsive/RTL with REAL captures
**Branch:** `writer/mi-serial-lane/POR-1` · **Parent (verified before any mutation):** `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` (RECOVERY_GATE_PASS) — `git status --porcelain` was empty at start.

---

## 1. Identity (candidate)

| Field | Value |
|---|---|
| Parent commit | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` |
| Canonical source tree at parent (recomputed from `git archive HEAD`, 338 files) | `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` — **equals** the recorded claim in `assurance/BROWSER_CONFORMANCE_RECEIPT.json` |
| Canonical source tree with this lane's delta | `b61cf2bb3e9d55941ef969f6b7e11f859a89d52cd09d3277bcc0030a2f14b8fa` (338 files; identical to parent except the 5 portfolio source files below) |
| Environment | node `v22.16.0`, deps installed, Playwright `1.62.1` package-local, Chromium `151.0.7922.34` |
| Candidate commit sha | **content commit:** `27b68b961a9adc616747151c02c7682d618bebaa` (parent `fe1bb98…`); this identity row was written back in the follow-up bookkeeping commit that only updates `HANDOFF.md` |

## 2. Changed paths (own scope only)

**Source (writable root `stack/native-typescript/surfaces/portfolio/`):**
- `presentation-style.ts` — left-index column sizing, centre technical-token wrapping, RTL Arabic typography block
- `presentation.ts` — integrity envelope cell `dir: ltr → auto` (long sha256 must keep wrap-anywhere)
- `left-views.ts` — `syncHeaders()`: active-language re-projection of the two index column headers
- `i18n.ts` — `domainCopy` presentation localization of the exact domain export strings (EN = identity map, AR translations)
- `composition.ts` — `fromDomain()` applied to the export `limitations` / `note` lens fields

**Adapter root `stack/native-typescript/adapters/portfolio/`:** *unmodified* (audited, no change required).

**Unit output `writer-output/W04-PORTFOLIO/`:** `VISUAL_EXECUTION_REPORT.json`, `HANDOFF.md`, `SERIALIZED_HOTSPOT_REQUEST.md`, `harness/` (5 lane-local scripts), `evidence/` (8 rounds/dirs).

**Not written:** `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, other lanes, `main`, `writer/mi-serial`, shared W04 seams. `dist/` + `assurance/` were touched only by the build/test commands and are restored (`git checkout -- dist assurance stack/MEASURED_COMPARISON.json`) before commit. **Shared `writer-output/W04/` is byte-identical to parent** (receipt sha `3917a9cc77123735ee4994db9dd79ee48a6b3cbdaad0d7b640a439258dd1e931`, 167 pre-existing PNGs, git-clean) — see §5.3.

## 3. Salvage (preserved, never restarted)

1. **Existing source build** — the 5-file portfolio surface + adapter were audited and continued; no from-zero relaunch, no revert/reset (H02 law held).
2. **W04 workspace flow shots** — all 167 pre-existing PNGs in `writer-output/W04/evidence/` untouched (count and receipt hash unchanged).
3. **PLAN_COMPLETE lineage** — the pre-existing `VISUAL_EXECUTION_REPORT.json` PLAN block (surface identity, region plan, Q-5 binding constraints) is carried forward in the new report.
4. **Superseded evidence retained and labelled:** `evidence/SUPERSEDED-baseline-attempt1-locale-not-applied/` (my first capture attempt was invalid — the locale flip did not apply, so the "AR" files were byte-identical to EN; retained, never passed off as proof), plus `baseline/`, `pre-fix/`, `after-fix1/`, `after-fix2/`.

## 4. Tests

| Check | Command / artifact | Result |
|---|---|---|
| Build | `npm run build:runtime` | PASS (every iteration; one intermediate failure was my own CSS comment containing backticks inside a template literal — fixed, not hidden) |
| Model suite | `npm test` | **210/0** (and see N5) |
| Packet tests | `dist/tests/surfaces/portfolio/domain.test.js`, `dist/tests/rescue/S15_W04_MASTERY_PORTFOLIO/…`, `dist/tests/rescue/CG5_W04_COVERAGE/…`, `dist/tests/rescue/CG5_CONTROLLER_CORR01_A03_DOMAIN_INTEGRITY/…` | **4/4 PASS** after every build |
| Mandated flow | `node tools/w04-browser-flows.mjs --flow portfolio.assembly-and-export` | **PASS** at parent (pre-delta) and **PASS** after the delta (all assertions green, 3 hash-bound PNGs). 5 attempts were blocked by an environment stall (§5.3) and 1 isolation attempt failed its own bootstrap — all attempts retained truthfully. |
| `npm run check` | full chain | exit 1 with exactly the documented known reds — see §8 GUARD-1 (2 FAIL ids: `browser.lineage_receipt_truthful` (the two global Enterprise flow FAILs — **not mine**) and `browser.current_candidate_claim_truthful` (exact-tree receipt claim owned by the Controller)) |

## 5. Falsification battery

| Id | What was attempted | Result |
|---|---|---|
| **N1** | `harness/por1-write-guard.mjs --self-test` — 23 write targets (4 in-root must-accept + 19 out-of-root must-refuse: controller/cep-writer/contracts/profiles/authority/dist-ts/other surfaces/foundation/main.ts/shared W04 seam/tools/dist/git paths) | **23/23** — every out-of-root attempt refused with `OUT_OF_ROOT_WRITE_REFUSED` *before* any filesystem call; `git status` at run time listed only writable/restorable roots (`mutatedPathsWithinWritableOrRestorableRoots: true`) |
| **N2** | boundary/invalid input against the live domain: bad refType, missing `@` in sourceRef, null member, duplicate id, unsupported action, unknown member, missing/stale revision envelope, invalid source state, filter with a non-taxonomy query | **all refused** (`ok:false`, exact codes, `mutated:false`), domain snapshot hash unchanged, receipts count unchanged → **no corruption, no false receipt** |
| **N3** | act without prerequisite data/provider: no source resolver → `UNVERIFIED_PROVIDER_UNBOUND`; resolver returns null → `UNAVAILABLE`; empty export → `members: []`, `canonicalPublication: false`; presentation with no resolver → `UNAVAILABLE` + "No source resolver…" and **no fabricated digest** | **PASS** — unavailable, never fabricated |
| **N4** | `node tools/check-duplicate-mechanics.mjs` | **PASS** (`status: PASS`, 322 files scanned) — no duplicate owner introduced |
| **N5** | `npm test` twice, compare id/status sequence + full JSON (minus date) + `git status` before/after | **PASS** — 210/0 both runs, identical sequence, `git status` byte-identical → no leakage |
| **L1 (lane-specific)** | exported portfolio payload must hash-match canonical sources (no synthetic content): export members vs canonical domain projection (domain + live page), export twice, RESOLVABLE envelope digest vs the canonical Evidence source digest, unbound member must not be RESOLVABLE, truth ceilings | **PASS** — exportMembers hash == projection hash (`6da3b2d9…` domain / `976fb12a…` live), twice-identical, envelope digest == canonical `sha256:c3c3…`, unbound member `UNAVAILABLE`, `canonicalSourceCopies:0`, `canonicalSourceDeleteAuthority:false` |
| **Q-5** | `portfolio.group(…, 'grp-project-example', {expectedRevisionId})` in Node and in the live page | **refused**: `AUTHORITY_DECISION_REQUIRED`, `mutated:false`, `groupingRef` stays `null`, snapshot unchanged — the Owner question was **not decided** |

Evidence: `evidence/falsification/` (`FALSIFICATION.json` 32/32, `N1_WRITE_GUARD.json`, `N4_DUPLICATE_MECHANICS.json`, `N5_TWICE_IDENTICAL.json`, `npm-run-check.log`, each with `SHA256SUMS.txt`).

## 6. FOUR TRUTHS (each stated separately)

**P — Product / visual truth:** *Unproven before this lane; now evidenced, not accepted.* Matrix row 13 said `P: unproven` (report-only evidence). This lane produced 5 capture rounds plus 2 flow runs — **68 hash-bound PNGs** total (incl. the retained superseded attempt) at 1440×1000 and 1024×900 in AR/RTL and EN/LTR, compared at L1–L4, and closed 5 surface-owned defects (2×V2, 3×V1 — full list in `VISUAL_EXECUTION_REPORT.json`). Status stays `NOT_OWNER_ACCEPTED`: four shared defects remain visible in the surface (§8), so visual truth is *evidenced-but-not-clean*, never "accepted".

**B — Behaviour / build truth:** *PASS, epoch now.* `npm run build:runtime` PASS; `npm test` **210/0 twice, identical, no leakage**; 4 packet tests PASS; mandated flow `portfolio.assembly-and-export` PASS at parent and PASS after the delta (empty → reference added → Q-5 grouping refused → stale envelope refused → remove preserves source → export reproducible/non-canonical); `check-duplicate-mechanics` PASS. The two global Enterprise browser FAILs and the two `npm run check` reds are recorded as not-mine (§8 GUARD-1).

**C — Contract / bilingual truth:** *Both languages first-class and tested in both directions.* Language is switched through the product's **Settings control** in every capture cell (`path: settings-ui`, panel closed after), verified `lang`/`dir` per probe: EN/LTR and AR/RTL, 14/14 final probes. Surface-owned copy is fully localized in AR (left/centre/right censuses show zero English prose outside technical tokens), Arabic shows **zero** surface-owned typography violations (was 13), EN shows **zero** Arabic inside surface-owned regions, technical tokens stay isolated (`bdi` 54, `[dir=ltr]` 73, `[dir=auto]` 100). Remaining bilingual gaps are all in shared code (§8 SHARED-1..5) — recorded, routed, not silently fixed.

**DP — Domain-provider / export truth:** *Held.* Export is a projection only: members hash-identical to the canonical domain records, twice reproducible, `canonicalPublication:false`, no `canonicalEvidence`/digest copy in the payload; a RESOLVABLE state appears only when the canonical source registry resolves the exact ref (digest matched), otherwise `UNAVAILABLE`/`UNVERIFIED_PROVIDER_UNBOUND`; removing a membership never writes the canonical source (`canonicalSourceWrite:false`, source digest verified unchanged); persistence stays `SESSION_LOCAL_CURATED_PROJECTION · durable:false`; Q-5 grouping stays refused.

## 7. Evidence

- **Primary:** `evidence/final/` — 14 captures + `PROBES.json` + `SHA256SUMS.txt`. Each capture records path, sha256, dims, viewport, locale, direction, state, commit/tree, timestamp.
- **Before/after:** `evidence/baseline/` + `evidence/pre-fix/` (defects present, measured) → `evidence/after-fix1/`, `evidence/after-fix2/`, `evidence/final/` (fixed, re-measured).
- **Flow:** `evidence/flow-portfolio-20261002T044839Z/` (parent run) and `evidence/flow-portfolio-postfix/` (post-delta PASS + every failed attempt's receipt).
- **Direction root cause:** `evidence/direction-diag.json` (portfolio *and* evidence surface, both locales).
- **Lane harness** (all writes land inside `writer-output/W04-PORTFOLIO/`): `harness/por1-capture.mjs` (captures + structural probes + DOM census), `por1-falsify.mjs`, `por1-write-guard.mjs`, `por1-direction-diag.mjs`, `por1-locale-refresh-probe.mjs`.
- **Vision verification (R3b):** every image read cross-checked against sha256+dims, the same-frame DOM census, and pixel MAE. **One conflict recorded:** two reads of `final/por1-final-en-ltr-1440x1000-populated-bottom.png` (sha `4249d7c1…`) returned a stale AR-looking frame; ground truth proves the file is EN (census `lang=en dir=ltr`, `arabicVisible:false`; pixel MAE = **0.0** vs the EN populated capture in shell/right/left regions, 8.89–11.42 vs the AR capture). The stale reads were discarded; no verdict rests on them. `tesseract` is unavailable in this environment, so OCR cross-check was replaced by hash+dims+DOM census+pixel MAE.

## 8. Unresolved findings (routed, not fixed — outside POR-1 roots)

Full detail + evidence pointers in `SERIALIZED_HOTSPOT_REQUEST.md`:

- **SHARED-1 (V2)** pane order never mirrors in RTL — donor blueprint `.cols{direction:ltr}` → `dist/foundation/donor.css`; no `body[data-foundation-direction=rtl] .cols` override in shared `foundation/extensions.css`. Reproduced on the evidence surface → app-wide.
- **SHARED-2 (V2)** shared W04 pane chrome English-only under AR — `surfaces/composition/w04-rescue.ts:849` (`pane: 'Portfolio references'`, `spec.note(…)`) and `:925` (`Settings · language & direction`).
- **SHARED-3 (V2)** toolbar command labels English-only under AR — `w04-rescue.ts:86` and `surfaces/m0-controller-composition.ts:223-226`.
- **SHARED-4 (V2)** shared bottom shelf hardcodes Arabic under EN — `foundation/global/bottom-shelf.ts:178`, `foundation/accepted-runtime.ts:537`.
- **SHARED-5 (V2)** choosing a language in Settings flips `html lang/dir` but does **not** re-render the mounted surface copy (measured: still previous language after panel close + 1.5 s) — shared preference→render wiring.
- **GUARD-1** `npm run check` reds: `browser.lineage_receipt_truthful` (documented known red; its 6-flow receipt is 4/6 with the two global Enterprise flow FAILs — explicitly not this lane's) and `browser.current_candidate_claim_truthful` (receipt binds tree `0c43d7f1`; parent-without-delta equals it exactly — proven — so the red is the structural consequence of any lane's source delta and is re-bound by the Controller's exact-HEAD browser receipt at convergence; the receipt file is not in my roots and was not touched).
- **Environment note (not a product defect):** the shared flow harness waits for `networkidle`, which stalls whenever a page issues `GET http://127.0.0.1:4174/v1/platform/input-direction` while lane **BKP-1**'s `npm run runtime:local` server holds that port (its keep-alive response never finishes for Playwright). BKP-1's process was **not** killed or modified. The passing post-delta run used an isolated network namespace (loopback up, external runtime unreachable), which is exactly the "static proof server only, no local runtime API" limitation the receipt already documents.

## 9. Owner / STOP notes

- **Q-5 (Portfolio grouping authority) — encountered, NOT decided.** No grouping structure, no capability-group sections; `groupingRef` stays `null`; `portfolio.group` refuses `AUTHORITY_DECISION_REQUIRED`; the pending authority is shown as a first-class fact (blocks[0]). The falsification battery asserts this in Node and in the live page. Any sub-scope that would have required deciding Q-5 was **not started** and is recorded here rather than resolved (STOP per mission).
- **Owner-only items untouched:** shell redesign (`OWNER-20260910-010`), RQ reference promotion, Visualize F-048, destination-count freeze `C03-GATE-023`.
- **No authority conflict found**; no Controller/Owner record was edited; no self-acceptance claimed — `ACCEPTANCE_STATUS: NOT_OWNER_ACCEPTED`.
- **No out-of-root write was attempted** (N1 guard proves refusal), so no `SERIALIZED_HOTSPOT_REQUEST` was needed for a POR-1 write; the file with that name carries the routed shared findings for the seam stewards.

## 10. Verification to re-run

```bash
npm run build:runtime && npm test                 # 210/0
node dist/tests/surfaces/portfolio/domain.test.js
node dist/tests/rescue/S15_W04_MASTERY_PORTFOLIO/domain-authority.test.js
node dist/tests/rescue/CG5_W04_COVERAGE/w04-convergence.test.js
node dist/tests/rescue/CG5_CONTROLLER_CORR01_A03_DOMAIN_INTEGRITY/controller-corr01.test.js
node writer-output/W04-PORTFOLIO/harness/por1-write-guard.mjs --self-test   # N1 23/23
node writer-output/W04-PORTFOLIO/harness/por1-falsify.mjs                   # 32/32
node tools/check-duplicate-mechanics.mjs                                    # N4 PASS
node writer-output/W04-PORTFOLIO/harness/por1-capture.mjs --round recheck   # 14 captures, probes clean
```
