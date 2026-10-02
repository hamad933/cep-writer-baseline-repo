# SERIALIZED_HOTSPOT_REQUEST — RES-1 (W03-RESULTS)

**Class:** `CANDIDATE_ONLY__NO_DIRECT_SHARED_SEAM_WRITE__REQUEST_ONLY`
**Lane:** `RES-1` · branch `writer/mi-serial-lane/RES-1` · parent `ed6e19a3f49e12e7c8faa71c608b9d227b3d3b5d`
**Rule:** `WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 — any shared file not listed in the lane's
writable roots = STOP + this request. **None of the items below were applied.**

---

## SH-R1 — `foundation/timeline/replay-host.ts` is EN-only (shared presentation host)

- **Seam:** `stack/native-typescript/foundation/timeline/replay-host.ts` (shared `TimelineReplayPresentationHost`).
- **Observed:** the host renders every label in English only (`Previous`, `Next`,
  `No timeline events`, `Open event details`, …) and takes no locale. Results binds this host for its
  Replay view (primary consumer), so an AR/RTL Results workspace shows an English-only timeline body
  while all Results-owned chrome is localized (packet §8: Arabic and English are both first-class).
- **Evidence:** `writer-output/W03-RESULTS/CAPTURE_RECEIPT.json` → `probes.studio['replay-ar-1440x1000'].centerText`
  (English host labels inside an otherwise Arabic view) + `evidence/studio-replay-ar-rtl-1440x1000.png`
  (sha256 `6d70b1c7…` before this round's re-capture; final hashes in `CAPTURE_RECEIPT.json`).
- **Request:** give the host an optional `locale`/string-provider parameter following the existing
  `surfaces/{runs,labs,scenarios}/i18n.ts` pattern, defaulting to the document language. Direction is
  already inherited (not baked), so only strings are missing.
- **Why not done here:** `foundation/**` is read-only for this lane.

## SH-R2 — `foundation/analytical/compare-host.ts` bakes `dir="rtl"` + Arabic-only chrome

- **Seam:** `stack/native-typescript/foundation/analytical/compare-host.ts` (shared `AnalyticalCompareHost`).
- **Observed:** `render()` sets `root.setAttribute('dir','rtl')` unconditionally and emits
  Arabic-only headings/table headers regardless of the active locale, which violates
  VISUAL_EXECUTION_STANDARD §7 ("do not bake direction into structure") for any LTR/EN consumer.
- **Impact on this lane:** Results deliberately keeps its Compare presentation surface-local
  (`surfaces/results/presentation.ts`) instead of mounting the shared host, so that the EN/LTR and
  AR/RTL Results views both stay direction-correct. The compare **owner** is still the injected shared
  `AnalyticalCompareOwner` (falsification `L4`), so no ownership is duplicated — only the host chrome.
- **Request:** make host direction/locale follow the consumer (parameter or document language) and
  localize its strings, after which Results may mount the shared host directly.
- **Why not done here:** `foundation/**` is read-only for this lane.

## SH-R3 — live Results centre (`surfaces/m0-controller-composition.ts#mountResultsStudio`) — already filed

- **Already filed by the W03 family writer:** `writer-output/W03/SERIALIZED_HOTSPOT_REQUEST.md` →
  **H4** (Results identity / mode distinctness / visible unavailable status). Not duplicated here.
- **RES-1 status of the Results-owned half of H4:** closed inside my roots — the visible
  *Capability state* read-out now also records **refused** capability requests
  (`surfaces/results/index.ts#noteCapabilityState`), proven by
  `evidence/live-results-en-ltr-1440x1440…` OCR (`Capability state` + `RESULTS_PROVIDER_UNAVAILABLE`)
  and by the live probes in `CAPTURE_RECEIPT.json`.
- **Still shared (untouched):** the m0 centre never mounts `renderResultsSurface`, so on the live route
  the Replay/AAR/Compare *views* only appear once a sealed-Results provider exists (DEF-RES-1, blocked
  on W05 — no Result is fabricated by this lane). Surfacing the Results studio on the live route needs
  the m0 composition seam → Controller decision.

---

## Owner/Controller questions recorded, not decided (record-only)

- **Q-4 / A01-PF-007 — `TimelineReplayOwner` retain-vs-retire** remains an open Controller question
  (`writer-output/W03/PROOF_CATALOG.json` rule `R-Q4-TIMELINE-REPLAY-OWNER-BLOCKED`). This lane did
  **not** adjudicate it; it only measured the single-instance invariant (exactly one production
  instantiation, `main.ts`), falsification row `L2`.
- Owner-only items from packet §0 remain untouched: shell redesign (OWNER-20260910-010), RQ reference
  promotion, Visualize F-048, destination-count freeze (C03-GATE-023).
- Reference-registry observation (record-only, `cep-writer/**` is read-only): the two supporting
  references' file names appear swapped relative to their content —
  `CEP_RESULTS_AAR_SUPPORTING_MAJOR_STATE_REFERENCE.png` renders the **Compare** state and
  `CEP_RESULTS_COMPARE_SUPPORTING_MAJOR_STATE_REFERENCE.png` renders the **AAR** state. Both hashes match
  the packet table (`c9b57a30023f8330`, `f5a720f303d16f75`), so no integrity problem; classification and
  coverage are unaffected.
