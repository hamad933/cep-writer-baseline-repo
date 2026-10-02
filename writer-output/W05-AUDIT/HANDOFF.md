# HANDOFF — W05-AUDIT · Lane AUD-1

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Branch:** `writer/mi-serial-lane/AUD-1` · **Parent (bound):** `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc`
**Source commit (evidence anchor):** `e201dbaba5cb6cf9e6ee2eb1dfd35742d3876904` · **tree:** `fd187d4137ae0ba12207705d052fa8aa4bb475ee`
**Candidate HEAD:** the tip commit of this branch that carries this handoff (verify with `git rev-parse origin/writer/mi-serial-lane/AUD-1`); lineage = parent `fe1bb98` → source `e201dba` (all lane source) → tip (this evidence/handoff commit). Every sealed capture binds to `e201dba` with `dirtyAuditFiles=false`.
**Mission:** close AUD-V1 / AUD-V2 / AUD-V3 (visual composition) with source-bound visual correction only; no domain-logic restructure.
**Environment:** node v22.16.0, deps preinstalled, isolated worktree, HEAD verified = bound parent before any mutation, `git status --porcelain` empty at start.

---

## 1. Salvage (continued, never restarted)

Inspected first, then continued:

- `writer-output/W05-AUDIT/VISUAL_EXECUTION_REPORT.json` — Controller-reconstructed report (CP-2026-10-01-005), verdict **HOLD**, defects AUD-V1/V2/V3 with severity/root-cause detail. Its full content is preserved verbatim at `git fe1bb98:writer-output/W05-AUDIT/VISUAL_EXECUTION_REPORT.json` and its FUNCTIONAL/STRUCTURAL verdicts + defect list are carried forward in the new report (`SUPERSEDES.carryForward`).
- `writer-output/W05-AUDIT/evidence/capture-lineage.json` + 2 capture rounds (33 pngs) — untouched.
- `writer-output/W05-AUDIT/evidence/capture.mjs` — reused as the base for `capture-v2.mjs` (phase-tagged, fresh runtime root, geometry probe, no overwrite of salvage files).
- `writer-output/W05-AUDIT/.runtime/` tracked salvage runtime state — untouched (new rounds used `.runtime/v2-<phase>/` scratch roots, removed after use).
- No reset / revert / restart / delete of any evidence at any point.

## 2. Changed paths (this lane's delta)

| Path | Change |
|---|---|
| `stack/native-typescript/surfaces/audit/index.ts` | ONLY tracked source change — compact single-tier header, vh-capped ledger, two-pane lower band (trace \| evidence deck), sticky action/status bar, chain-node ellipsis micro-fix, bilingual copy for the bar |
| `writer-output/W05-AUDIT/VISUAL_EXECUTION_REPORT.json` | rewritten (§12 fields, supersedes + carries forward the reconstructed report) |
| `writer-output/W05-AUDIT/HANDOFF.md` | this file |
| `writer-output/W05-AUDIT/SERIALIZED_HOTSPOT_REQUEST.md` | shared shell-header remainder routed (no shared write) |
| `writer-output/W05-AUDIT/evidence/capture-v2.mjs`, `falsify-v2.mjs` | re-executable capture + falsification harnesses |
| `writer-output/W05-AUDIT/evidence/capture-lineage-v2-before.json`, `capture-lineage-v2-after.json` | hash-bound lineage for the two sealed rounds |
| `writer-output/W05-AUDIT/evidence/v2-before-*.png` (8), `v2-after-*.png` (8) | sealed before/after captures (1440×1000 + 1024×900, AR/RTL + EN/LTR, full + scrolled) |
| `writer-output/W05-AUDIT/evidence/falsification-v2.json` | 21/21 falsification battery |

**Not changed:** `stack/native-typescript/adapters/audit.ts` (no edit needed), `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json`, `writer-output/W05/` — all tool byproducts reverted per mission step 6 (`git checkout -- dist assurance stack/MEASURED_COMPARISON.json` + the W05 flow receipt/runtime-proof dirt); tracked scope after cleanup = the single source file above.

## 3. Tests + falsification (per truth category)

### FUNCTIONAL truth
- `npm run build:runtime` → PASS (source→dist authoritative,323 files).
- `npm test` → **210/0** (three runs; two back-to-back identical).
- Flow `node tools/w05-browser-flows.mjs --flow audit.trail-recording` → **PASS**, `failedAssertions: []`, receipt aggregate 8/8.
- Packet tests → `dist/tests/rescue/S18_W05_BACKUP_AUDIT/{domain,source-boundary}`, `S06…/audit-provenance-core`, `CG6…/{cg6-w05-coverage,controller-corr01-w05-truth}` → **6/6 PASS** (0 fail).

### STRUCTURAL truth
- DOM hooks required by flows/tools preserved (verified by grep + live run): `tr[data-a-row]`, `[data-a-scope]`, `[data-a-tab]`, `[data-integrity]`, `[data-a-title]`, `.a-node`, `.a-ctx-block`, `.a-live`, `.a-settle`, `[data-annotation-form]`, `[data-event-id]`, `[data-note]`.
- 8/8 after-captures with `pageErrors=[]`; no horizontal overflow at either sealed viewport; region roles unchanged (`LEFT/CENTER/RIGHT/BOTTOM/TOOLBAR`).
- `git status` tracked scope = 1 file → no out-of-root write occurred (N1 at repo scope).

### VISUAL truth
- See §4 (captures, geometry deltas, level-by-level comparison).

### FALSIFICATION truth (`evidence/falsification-v2.json`, **21/21 PASS**)
- **N1 non-owned-route mutation must refuse:** `PATCH` / `DELETE` / `PUT` on `/v1/audit/events/:id` → HTTP ≥400 (no mutation route exists); plus repo-scope: only lane roots written.
- **N2 boundary/invalid input:** POST without required fields → `422 AUDIT_EVENT_FIELDS_REQUIRED` (not partially written); annotation with empty actor/note → `422` fail-closed.
- **N3 no prerequisite provider → unavailable, never fabricated:** control port verified closed → boot with that `persistencePort` → `PROVIDER: UNVERIFIED` (no provider chain claim), combined verdict downgraded to `VALID_CHAIN_SESSION_ONLY`, `UNVERIFIED` visible on the first screen, `pageErrors=0`, `hashIsEncryption=false` still holds.
- **N4 duplicate mechanics:** `node tools/check-duplicate-mechanics.mjs` → `PASS`, `filesScanned=322` (identical to baseline; no duplicate owner introduced).
- **N5 suite twice identical:** two back-to-back `tools/test-models.mjs` runs → `210/0` both, test id+status list **identical**.
- **LANE: audit-hash-is-encryption ceiling stays false:** `truth.hashIsEncryption=false`, `databaseImmutabilityClaim=false`, `commandReceiptsAreAuditTruth=false`, UI states "verification, not encryption" — PASS (with and without provider).
- **LANE: trail entries immutable after write (tamper probe):** `PATCH/DELETE/PUT` refused; re-append same `eventId` with different content → `422 AUDIT_EVENT_ID_CONFLICT`; record hash byte-identical after all attempts; provider verify still `valid=true, firstInvalid=null`; annotation recorded separately leaves event bytes unchanged — **PASS**.
- **Global known red (NOT ours):** `npm run check` exit 1 with `browser.lineage_receipt_truthful` (6/6-truth-guard, `summary: total 6 / pass 4 / fail 2` = the two pre-existing Enterprise flow failures). Do NOT fake green — unchanged from baseline.

## 4. FOUR TRUTHS (separately)

| Truth | Status | Basis |
|---|---|---|
| **1. FUNCTIONAL** | **PASS at candidate** | build PASS; `npm test` 210/0 ×3 (N5 identical); `audit.trail-recording` PASS (0 failed assertions); packet S18/S06/CG6 6/6; annotate/verify/search/annotate-fail paths unchanged (settlement contract untouched). |
| **2. STRUCTURAL** | **PASS at candidate** | regions/roles unchanged; all tool DOM hooks preserved; 8/8 captures `pageErrors=[]`; no overflow at 1440×1000 / 1024×900; tracked write scope = 1 file inside lane roots. |
| **3. VISUAL** | **AUD-V1 CLOSED · AUD-V2 CLOSED · AUD-V3 CLOSED at surface scope, shared-shell remainder OPEN** | before/after matched captures (4 cells) + DOM geometry probe: ledger+trace+JSON+action bar all `visibleAtFirstScreen=true` in 4/4 cells after (false for chain/json/actionBar before); surface header+toolbar 437px→153px (AR 1440) / 273px→149px (AR 1024); action bar present both viewports both locales; shell chromeTotal unchanged (170/201px) proving the shared half was not mutated (routed instead). |
| **4. EVIDENCE / LINEAGE** | **PASS with one recorded receipt gap** | both rounds hash-bound to exact commit/tree with `dirtyAuditFiles=false`; every image re-hashed + dimension-checked against its lineage entry (bytes/dims/sha256 all match); OCR + DOM probe used as vision ground truth (R3b); fixture 11 durable events + `verify valid=true firstInvalid=null` in both rounds; **gap:** `assurance/BROWSER_CONFORMANCE_RECEIPT.json` is stale vs the candidate tree (assurance is read-only here; truthful regeneration verified transiently, reverted per step 6) → Controller action, see unresolved U2. |

## 5. Evidence locations

- Lineage: `writer-output/W05-AUDIT/evidence/capture-lineage-v2-before.json`, `capture-lineage-v2-after.json`
- Sealed captures (16): `evidence/v2-before-*.png`, `evidence/v2-after-*.png` (hashes listed in the lineage files and in `VISUAL_EXECUTION_REPORT.json.EVIDENCE`)
- Falsification: `evidence/falsification-v2.json` (21/21) + harnesses `evidence/capture-v2.mjs`, `evidence/falsify-v2.mjs`
- Superseded intermediate rounds retained locally and labelled: `capture-lineage-v2-after-iter1/2/3/3b/4.json` + their timestamped pngs (never used as current proof; left uncommitted per OD-20260922-073)
- Flow-run scratch from the mandated `w05-browser-flows` runs stays local/untracked under `writer-output/W05/evidence/` (OD-20260922-073); tracked `writer-output/W05/**` and `assurance/**` byproducts were reverted per mission step 6.
- Salvage evidence (previous rounds): unchanged `evidence/*.png`, `evidence/capture-lineage.json`, `evidence/capture.mjs`

## 6. Unresolved findings

1. **U1 (V2, SHARED_COMPONENT):** shell global-nav + area-nav + area-banner + domain-toolbar rows remain stacked above the surface (170px @1440 / 201px @1024) vs the reference's single top bar → `writer-output/W05-AUDIT/SERIALIZED_HOTSPOT_REQUEST.md` for the W01-SHELL/SH-1 slot. Cannot be closed from `surfaces/audit/`.
2. **U2 (V3, EVIDENCE/ORACLE):** stale `assurance/BROWSER_CONFORMANCE_RECEIPT.json` makes `npm run check` show 2 fails at candidate head (known red + `browser.current_candidate_claim_truthful`). Verified: truthful regeneration via `npm run browser:test` at the candidate restores `pass 167 / fail 1` (baseline single known red); receipt reverted per mission step 6 → Controller regenerates after admission. Never hand-edited.
3. **U3 (V2, OWNER_CONSTRAINT):** shared side-pane geometry (left ~335 / right ~451 at 1440) narrows the center to ~654px, which forced the two-pane lower band instead of the reference's full-width stacking. Pane system is `OWNER-20260910-012` shared territory — record-only.
4. **U4 (V1, RESPONSIVE_RULE):** chain-node action/target ellipsize in the half-width band (full values via `title` + raw-payload JSON). Accepted trade-off; Controller may reopen if it prefers vertical stacking with a taller fold.
5. **U5:** compact breakpoint (820×1180) not re-captured in this lane (rules implemented, not part of the sealed 1440/1024 matrix).

## 7. Owner / STOP notes (record-only, no decisions taken)

- `OWNER-20260910-010` (shell redesign) — Owner-isolated; the AUD-1 shell remainder is routed to the serialized slot, not decided.
- Two global Enterprise flow failures inside `browser.lineage_receipt_truthful` — explicitly NOT this lane's; expected red preserved, not faked.
- H03 PROP/FALSIFY remain `NOT_PROVEN` (nothing in this lane upgrades them).
- No STOP condition was hit: no out-of-root write, no authority conflict edited, no false receipt, scope never exceeded the sealed row, no Owner question invented.
- Status: **`NOT_OWNER_ACCEPTED`** — sole Controller review required. This Writer does not accept its own work.
