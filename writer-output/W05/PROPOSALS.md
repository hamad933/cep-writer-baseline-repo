# W05 PROPOSALS — Controller / Owner side only

W05 does **not** edit `controller/**`, `contracts/**`, `profiles/**`, `authority/**` or any registry. Everything below is a *proposal* for the Coordinator/Controller/Owner, with the code evidence that motivated it.

---

## P-W05-01 — Registry revision for the health/processing duplication ban (resolves OC-C-06 / A-1)

**Target artifact:** `SURFACE_READINESS_REGISTRY.json` (Controller/Owner scope)
**Rows to revise: 2**

| Stale planning row | Current code truth |
|---|---|
| planned path `adapters/surfaces/health-domain.ts` | **does not exist and must not exist**; HEALTH is implemented in `stack/native-typescript/adapters/health-runtime.ts` (`HealthRuntimeAdapter`, `W05HealthDomain`, commands `health.refresh/inspect/diagnose`), composed by `surfaces/composition/w05-rescue.ts` → `m0-controller-composition.ts` → `main.ts` |
| planned path `adapters/surfaces/processing-domain.ts` | **does not exist and must not exist**; PROCESSING is implemented in `stack/native-typescript/adapters/processing-runtime.ts` (`ProcessingRuntimeAdapter`, `W05ProcessingDomain`, commands `processing.inspect/retry/requestCancel/validationHandoff`) |
| writable scope `surfaces/{health,processing}/**` | **no such trees exist**; writable W05 scope is `surfaces/{validation,manual_ai,backup,audit,releases,configuration}/**` |

**Proposal:** mark both planning rows `SUPERSEDED_BY_CURRENT_SOURCE_LOCATION` with the verified paths above, and narrow the writable scope accordingly.
**Evidence:** `writer-output/W05/EVIDENCE_INDEX.json#duplicationBanHeld` (`adapters/surfaces/*: false`, `surfaces/{health,processing}/**: false`); packet §3 "location resolutions are binding".
**Note:** W05 held the ban — it created neither module nor tree. Registry revision is explicitly "a Controller/Owner follow-up, not Writer scope" (packet §3).

---

## P-W05-02 — Register the physical SC-011 implementation (resolves C-02 / MFC-PF-003 registry drift)

**Target artifacts:** `CORE_OWNER_REGISTRY.json` SC-011 row; the 23 `profiles/*.json` rows that list SC-011 `owner: "PreferenceExportImportResetModel"` with `MANDATORY_INHERIT`.

**Current state:** registry says `implementation: null`, `implementation_status: CONCEPT_CONTRACT_ONLY`. Code implements SC-011 as a **split**:
- `foundation/global/settings/center.ts` — `SETTINGS_CENTER_CONTRACT.sc011PreferenceTransferActionHome = 'settings.transfer'`, `transferSections()` exposing `settings.preferences.export|import|reset` with `delegatesTo:'ScopedPreferencesOwner'`, receipts carrying `valueOwner`/`persistenceOwner = 'ScopedPreferencesOwner'`
- `foundation/global/preferences/store.ts` — `export()` / `import()` / `reset()` own the values and the persistence

**Proposal:** set `implementation` to that split (SettingsCenterOwner action home + ScopedPreferencesOwner values/persistence), `implementation_status: EXECUTABLE_BOUNDED`, keep `PreferenceExportImportResetModel` as the SC id label — exactly the disposition already adjudicated in `controller/05_foundation/shared_ownership_map.md` row 9 and `mechanic_owner_conflicts.md` C-02.

**Evidence:** `P-W4E` 36/36 (5 SC-011 tests), `P-SC011` PASS, `P-BROWSER` flow `configuration.sc011-transfer` PASS.

---

## P-W05-03 — Record the W05 `settings.transfer` unscoped-state rule in the SC-011 contract text

**Target artifact:** SC-011 contract wording (Controller) / `foundation/global/settings/center.ts` documentation only.

`ScopedPreferencesOwner.import()` now preserves the context-free `session` scope that `export()` structurally excludes: **a transfer payload may replace exactly the scopes it carries and may not clobber state it does not carry.**
**Proposal:** state this as part of the SC-011 transfer contract so future writers do not "fix" it back to a wholesale `overrides = payload` replacement.
**Evidence:** `P-W4E` `w4e.sc011-import-does-not-clobber-unscoped-state`; `P-BROWSER` `sc011.import-does-not-clobber-unscoped-state`; `npm test` 210/0 (incl. `preference.session`, `preference.atomic`, `w2a.preference-import-atomic-validation`).

---

## P-W05-04 — Q-6 Owner decision required (STOP/REPORT, no W05 answer given)

**Target:** `controller/03_historical/open_questions.md` Q-6 (Owner decision on provenance recording).

W05 proved only what the code already enforces (`hiddenProviderCalls:0`, `automaticCanonicalPublication:false`, declared export → provenance-equal import, quarantine + fail-closed review). It did **not** decide how provenance should be durably recorded. The 2 A16-PF-006 rows are `BLOCKED` with **Q-6** named.
**Proposal:** Owner decision on (a) where provenance is durably recorded, (b) reviewer-identity binding source, (c) whether `EDIT` produces a new human-edited draft lineage.

---

## P-W05-05 — Fix the shared `runtime-causal-consequence` probe (outside W05 ownership)

**Target:** `tools/browser-conformance.mjs` (flow `runtime-causal-consequence`).
Adjudicated **HARNESS** in `controller/07_browser/failure_taxonomy.md`: `page.evaluate: TypeError … reading 'id'` is thrown *inside the harness eval*, not in product code.
W05 did not edit this file (outside its ownership list) and drew **no product conclusion** from the flow, per packet §9. **Proposal:** the file's owner adds a null-guard to the probe's state read, then re-runs `tools/writer-serial.sh npm run browser:test` so `browser.lineage_receipt_truthful` can clear.

---

## P-W05-06 — Do not promote `LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE`

Historical `W5_A` results remain provenance only. W05's own receipt is classified `W05_BROWSER_RECEIPT_NOT_OWNER_ACCEPTANCE` and the matrix is `W05_EVIDENCE_INDEX__CANDIDATE_ONLY__NOT_OWNER_ACCEPTANCE`.
**Proposal:** the final execution matrix must not carry any W05 row as Controller/Owner-accepted.
