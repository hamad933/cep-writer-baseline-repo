# SERIALIZED HOTSPOT REQUEST — W05-RELEASES (lane REL-1)

**Class:** `SHARED_SEAM_REQUEST__CANDIDATE_ONLY__NO_SELF_PROMOTION__RECORD_ONLY_NO_SHARED_WRITE`
**Lane:** `REL-1` (smallest-salvage lane, matrix row 20) · **Unit:** `W05-RELEASES` · **Surface:** `releases`
**Branch:** `writer/mi-serial-lane/REL-1` · **Exact parent (verified):** `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc`
**Authority:** `WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 ("any other shared file = STOP + `writer-output/<LANE>/SERIALIZED_HOTSPOT_REQUEST.md`"); `OD-20261002-087` (one mutating Writer per bounded lane, shared hotspots serialize); `W05-RELEASES_SURFACE_PACKET.md` §2 (owns no shared seam).
**Status of this file:** REQUEST ONLY. **No file outside the lane's writable roots was opened for writing, at any time, by this lane.**

---

## 1. STOP declaration (why this request exists)

Sealed objective for REL-1 included "the 2 bottom-shelf issues from review (1 shared-owned → request)".
The bottom shelf on the Releases route is composed by **shared** code:

- `stack/native-typescript/foundation/global/bottom-shelf.ts` (`BottomDeepWorkOwner`, `structuredPresentation`, `tabLabel`)
- `stack/native-typescript/foundation/accepted-runtime.ts` (donor-native `renderBottom` path)

Both paths are **outside** the lane's writable roots (`stack/native-typescript/surfaces/releases/`,
`stack/native-typescript/adapters/releases/`, `writer-output/W05-RELEASES/`) and are W01-SHELL /
foundation-owned seams that this lane does not own (`matrix row 20` → "bottom-shelf shared item → owner request").
Therefore the shared-owned sub-scope was **stopped** and recorded here instead of patched.

The **surface-owned** half of the bottom-shelf work *was* completed inside the lane's roots
(`surfaces/releases/composition.ts` → `releasesDeepProjection()`), see §4.

---

## 2. Requested change (for the seam steward — NOT applied here)

### HS-REL-1-01 — hardcoded Arabic shelf summary in an English/LTR session (defect `D-17`, severity V1)

| Field | Value |
|---|---|
| File (shared) | `stack/native-typescript/foundation/global/bottom-shelf.ts` |
| Line | `178` (`renderPresentation`, closed branch): `…if(summary)summary.textContent='مغلق — افتحه للسجل أو المقارنة أو الاسترداد';…` |
| Same string, second site | `stack/native-typescript/foundation/accepted-runtime.ts:537` (`renderBottom`, closed branch) and `accepted-runtime.ts:728` (`init()`) |
| Observed | EN/LTR session, `?surface=releases`, shelf **closed**: `#bottomSummary` = `مغلق — افتحه للسجل أو المقارنة أو الاسترداد` → **35 Arabic characters in an English session**. Reproduced in every EN capture of this lane. |
| Why out-of-lane | `foundation/**` is read-only for W05-RELEASES (packet §2; DAG §0 writable roots). |
| Requested fix (bounded) | Resolve the summary string from the active locale (`document.documentElement.lang`, same pattern the shell already uses for pane toggles): e.g. `en: 'Closed — opens for History, Compare or Recovery'` · `ar: 'مغلق — افتحه للسجل أو المقارنة أو الاسترداد'`. Keep it presentation-only; no state, no provider, no ownership change. |
| Verification expected by this lane | After the steward's fix: EN session shows **0** Arabic characters in `#bottomSummary`; AR session keeps the Arabic string; `w3d.*` bottom-shelf tests stay green. |

### HS-REL-1-02 — donor-derived shelf chrome is hardcoded Arabic (open-summary + history/compare/recovery panel labels)

| Field | Value |
|---|---|
| File (shared) | `stack/native-typescript/foundation/global/bottom-shelf.ts` |
| Lines | `27` (`tabLabel` → `السجل` / `المقارنة` / `الاسترداد`), `38` (history panel: `المراجعة الحالية`, `المسودة المحلية`, `أقدم snapshot محفوظ`, `الاستعادة غير مربوطة في هذا المستهلك`, `تفاصيل السجل`, footer sentence), `40` (compare panel), `41`–`42` (recovery panel) |
| Observed | EN/LTR session, shelf **open** on Releases: `#bottomSummary` = `السجل · REL-2026.08.31-RC2` and the whole panel chrome is Arabic while the surface session is English → **160 Arabic characters inside `#bottomContent` that are not surface-owned** (measured by `evidence/cycle2/falsification.json` → `shelfEN.mineArabic = 0` for surface-owned text; residual = shared chrome only). |
| Why out-of-lane | Same as HS-REL-1-01 (foundation seam). |
| Requested fix (bounded) | Localise `tabLabel` + the structured/operational presentation chrome through the active locale, or expose a locale argument from the shelf owner. Do **not** change provider semantics, lifecycle, focus behaviour or the read-only contract. |
| Note | This is the accepted Library donor's presentation grammar (mechanics level). Localising its labels is a **language** correction, not a composition change; the donor's structural value stays untouched (OWNER-20260910-009 / OD-20260914-002). |

### HS-REL-1-03 (optional, related) — shelf does not re-read its provider when only the language changed

| Field | Value |
|---|---|
| Observed | Before this lane's mitigation: flipping EN→AR with the shelf open left the previous session's projection on screen (shared owner renders only on open/close/provider/tab change). |
| Mitigation applied **in-lane** (no shared write) | `surfaces/releases/runtime.ts` (writable root) now invokes the shared owner's own `CEPFoundation.wave3Assembly.renderBottom()` after a locale/dir change while the shelf is open — consumer-side invocation of shared mechanics only; this unit writes no `#bottomContent` and no shared file. |
| Requested fix (optional) | The shelf owner may re-render itself on `lang`/`dir` change so every surface benefits without a per-surface call. |

---

## 3. Explicitly NOT requested / NOT done (guard rails)

- **No** claim of `#bottomContent` or `#bottomSummary` by the surface: writing them directly would fight
  `BottomDeepWorkOwner.renderPresentation` (the cycle-1 report already recorded this risk; it stays respected).
- **No** shared file edited, staged, stashed or reverted by this lane.
- **No** `tools/writer-serial.sh` misuse: that script serialises *derived-output commands* (build/test/check),
  it is not a mutation channel; this request is the DAG §0 file-based channel.
- **No** scope creep: `stack/native-typescript/foundation/**`, `surfaces/m0-controller-composition.ts`,
  `surfaces/composition/w05-rescue.ts`, `dist/**`, `assurance/**`, `controller/**`, `cep-writer/**`,
  `contracts/**`, `profiles/**`, `authority/**` all remain byte-identical to the parent commit except the
  mission-mandated `dist`/`assurance` rebuild artefacts, which are restored before the commit.

---

## 4. What this lane DID close (surface-owned, inside its roots)

| Item | Root cause | Fix | Evidence |
|---|---|---|---|
| `D-06` (the 1 open defect of "17 found / 16 fixed", severity V2, `SURFACE_COMPOSITION`) — bottom deep projection repeated a raw diagnostics/`lastAction · ok=… · differences=…` string with no release meaning | `surfaces/releases/composition.ts` `bottomProjection()` returned adapter diagnostics | Replaced by `releasesDeepProjection(adapter, candidateId)`: exactly four release-meaningful, locale-live sections (selected candidate identity · three separated truths with ceilings · gates/verification/rollback/approvers · recorded verification events), candidate-bound `currentRevisionId`, `recordBasis` retained | `evidence/cycle2/before-en-bottom-shelf.png` (sha256 `289b522f…`) vs `evidence/cycle2/after2-en-bottom-shelf.png` (sha256 `7167684e…`); `evidence/cycle2/falsification.json` → `D06.*` 5/5 |
| Bottom-shelf issue #2 (surface-owned half): projection language must follow the active session | projection was built once at mount time | `sections` / `currentRevisionId` are live getters read on every shared shelf render; plus the locale/dir refresh call in `runtime.ts` | `after2-ar-bottom-shelf.png` (sha256 `fe4db562…`); checks `LANE.shelf-en-*`, `LANE.shelf-ar-*` |
| Bottom-shelf issue #1 (shared-owned half) → **this file** | foundation strings | none applied (STOP) | §2 |

---

## 5. Falsification this lane holds for its own scope

- `evidence/cycle2/falsification.json` — **39/39 PASS** (N1 ×4, N2 ×5, N3 ×7, lane ceilings ×7, D-06 ×5, shelf/empty/compare ×10, page errors 0).
- `npm test` **210/0 twice, identical** (N5) · `node tools/check-duplicate-mechanics.mjs` **PASS** (N4).
- Ceilings remain false: `release-readiness-is-authorization = false`, `release-authorization-is-deployment = false`
  (composition + live DOM + CG6 `cg6.truth-ceilings-four-planes-separated` 6/6).

## 6. STOP / Owner notes

- This file is a **record**, not a decision: applying it touches a W01-SHELL/foundation seam and must be
  scheduled by the Controller through the serialized shared-hotspot slot (or assigned to the shell lane).
- Nothing here asks for an Owner product decision; both items are mechanical language/localisation defects
  against an already-active Owner policy (`VISUAL_EXECUTION_STANDARD` §7: Arabic and English are both first-class,
  active language user-configurable, no permanent Arabic-first authority).
- Status stays `NOT_OWNER_ACCEPTED`; sole Controller review required.
