# SH-2 SERIALIZED HOTSPOT REQUEST — out-of-root seams needed by the sealed chrome/geometry lane

**Lane:** `SH-2` · **Unit:** `W01-SHELL` · **Branch:** `writer/mi-serial-lane/SH-2`
**Base (EXACT_PARENT verified at lane start):** `9f1dc785c2cc71bc6540f435efe6821b83cd2205`
**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__STOP_ON_OUT_OF_ROOT_NEED`
**Authority for this file:** `controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0
— *"any other shared file (incl. the 16 serialize-only paths) = STOP + `writer-output/<LANE>/SERIALIZED_HOTSPOT_REQUEST.md`"*.

Sealed writable roots for this lane were **not** widened. Every item below was diagnosed, measured and
left unedited; no file outside those roots was mutated (temporary in-root experiments were reverted —
see `evidence/sh2/ad01-pane-layout-EXPERIMENT-AB.diff`).

---

## H-SH2-01 · AD-01 pane proportions (≈16/65/17) — **cannot close inside the lane roots**

**Target (measured, this lane):** at `1440×1000` the reference proportion requires
`--left ≈ 230px`, `--right ≈ 245px` → `15.97 / 65.49 / 17.01 %` of the `.cols` track width.
**Current, all 23 routes, both directions:** `--left 304px`, `--right 420px` → `21.11 / 48.19 / 29.17 %`.

### Why `foundation/global/pane-layout.ts` alone cannot do it (falsified, not assumed)

| Experiment | Edit | `npm test` | Geometry at 1440 |
|---|---|---|---|
| **A** (the edit the packet prescribes: pane-layout fallbacks `304/420 → 230/245`, lines 62–63 + 202) | in-root | **210 / 0 PASS** | **unchanged `304px / 420px`, 21.11/48.19/29.17** — inert |
| **B** (non-inert: `effectiveWidths()` clamped to the reference width) | in-root | **208 / 2 FAIL** | **`230px / 245px`, 15.97/65.49/17.01** — target achieved |

Experiment B's exact failures (the STOP trigger — "consumer regression FAIL after AD-01 → STOP AD-01 sub-scope"):

- `w3e.ui-scale-pane-responsive-separation`
- `w3e.ui-scale-style-projection`

Both assertions live in **`stack/native-typescript/model-tests.ts`** (lines 276 and 278) and freeze
`baseEffectiveWidth === 304` → `scaledEffectiveWidth === 243.2` (@0.8) / `608` (@2.0) and
`--cep-ui-left-pane-width === '243.2px'`. **That file is outside every SH-2 writable root.**
Evidence: `evidence/sh2/ad01-experimentA-npmtest-210of0-inert.txt`,
`evidence/sh2/ad01-experimentB-npmtest-208of2-regression.txt`,
`evidence/sh2/ad01-pane-layout-EXPERIMENT-AB.diff`.

### Why the fallback is inert (code path, verified against the running product)

`main.ts:47` creates `preferences = new ScopedPreferencesOwner(...)`;
`main.ts:113 → mountWorkspaceHost → WorkspaceHostKernel → new WorkspacePaneLayoutOwner(preferences)`
and `WorkspacePaneLayoutOwner.preferredWidth()` reads
`preferences.resolve(widthKey).preferredValue`, which `ScopedPreferencesOwner.resolve()` always fills
from `PREFERENCE_DEFINITIONS` — i.e. from **`preferences/schema.ts`**, never from pane-layout's
literal fallback. The second writer, `accepted-runtime.ts syncPaneCSS()`, reads
`state.preferences.leftWidth/rightWidth` (its own literal). Probe confirms: after Experiment A the
live `--left`/`--right` stayed `304px/420px`.

### Files that must change (all outside SH-2 roots)

| # | File | Owner / why it is out of root | Exact change |
|---|---|---|---|
| 1 | `stack/native-typescript/foundation/global/preferences/schema.ts:18` | SC-02 `W05-CONFIGURATION` (single-writer preference seam) | `leftWidth.safeDefault 304 → 230`, `rightWidth.safeDefault 420 → 245` — **this is the live default** |
| 2 | `stack/native-typescript/model-tests.ts:98, 276, 278` | not in any SH-2 root; AD-01 constraint 1 explicitly requires "update the frozen `rightWidth` preference fixture accordingly" | re-freeze `420 / 243.2 / 608` against the new defaults |
| 3 | `stack/native-typescript/foundation/accepted-runtime.ts:38` | **HS-REL-1 family — explicitly "NOT yours"** in the SH-2 mission | initial `preferences.leftWidth:304, rightWidth:420` |
| 4 | `stack/native-typescript/foundation/global/responsive-layout.ts:22` | `foundation/global/**` is not a SH-2 root (only `foundation/global/shell/**` + `pane-layout.ts` are) | `leftPreferredWidth` fallback `304 → 230` (band projection `projectedCenter`) |
| 5 | generated `dist/foundation/donor.css` `:root{--left:304px;--right:420px}` | produced by `tools/extract_donor.py` under a ZERO_DELTA hash guard — **`tools/**` is prohibited** | regenerate with the new defaults |

**Recommended serialization:** one slot covering #1 + #2 together (they must land atomically or
`npm test` goes red), then #3/#4, then the donor regeneration. Re-run this lane's probe
(`probes/sh2-geometry-route-probe.mjs`) for the 23-route / 3-viewport / 2-locale consumer regression.

---

## H-SH2-02 · AD-02 / DEF-06 remainder — Arabic-only chrome in the **generated document shell**

**In-root status: CLEAN.** `foundation/extensions.css` and `foundation/global/pane-layout.ts` contain
**0** Arabic code points; `foundation/global/shell/*` and `surfaces/shell/surface.ts` are paired
`{ar,en}` data or `lang==='ar' ? … : …` guarded strings. Runtime census: the
`.foundation-shell` scope (the seam `GlobalShellNavigationOwner` renders) shows **0 Arabic entries
under EN on all 23 routes** (`evidence/sh2-probe-AFTER.json`, `chromeArabic[].scope`).

**Out of root (the DEF-06 "40 Arabic-only chrome strings"):**

| Where | Count (measured) | Root |
|---|---|---|
| `dist/index.html` static chrome markup (`aria-label`/`title`/text on `#centerPane`, `#leftPane .phead`, `#rightPane .phead`, `.centerrail`, `#leftLocalReveal`/`#rightLocalReveal`, `#leftResizer`/`#rightResizer`, `.toolbar`, `#topBanner`) | 138 unique Arabic strings in the document shell; **28–42 Arabic chrome entries per route under EN** (832 recorded entries over 23 routes) | generated by `tools/extract_donor.py` — **prohibited harness** |
| `stack/native-typescript/foundation/accepted-runtime.ts` (`syncPaneCSS()` rewrites `[data-pane-toggle-label]` to `إخفاء البنية`/`فتح البنية`, `aria-label`s on `[data-pane-toggle]`, `announce(...)`, `renderContextLenses` meta, `init()` labels) | dynamic, re-applied on every preference sync | **HS-REL-1 family — explicitly "NOT yours"** |

Because the static half is written by `tools/extract_donor.py` (harness, prohibited), this sub-scope
is **STOPPED per the G-20 rule in the mission** ("if the fix requires editing `tools/**` → STOP that
sub-scope + hotspot"). Scope attribution per route is in the probe JSON (`chromeArabic[].scope`).

---

## H-SH2-03 · D-08 `donor.css #rightPane .contextscope{display:grid!important}`

Confirmed present at **`dist/foundation/donor.css:734`**:
`#rightPane .contextscope{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;…}`
(17 `.contextscope` rules total in that file).

`donor.css` exists **only** as `dist/foundation/donor.css`; there is no authored CSS source for it in
`stack/**` — it is emitted by `tools/extract_donor.py`. **Outside roots + harness-prohibited →
hotspot, not edited.** (`foundation/extensions.css` already carries the *consumer-scoped* counter-rules
`body[data-consumer=runs|visualize] #rightPane .contextscope{display:none!important}` — that is the
pattern a fix would follow, but the `!important` winner itself is donor-generated.)

---

## H-SH2-04 · MAS1-003 pane order never mirrors in AR

Confirmed on **all 23 routes under `dir=rtl`**: `#leftPane.x = 0`, `#rightPane.x = 1020`
(`evidence/sh2-probe-BEFORE.json`, `seeded.leftPaneX`).

Root is **`dist/foundation/donor.css:9` → `.cols{direction:ltr;…grid-template-areas:"left lr center rr right"}`**
(generated, harness-prohibited). `foundation/global/pane-layout.ts` — the other candidate root named in
the mission — has **no ordering responsibility at all**: it returns only `side / preferredState /
effectiveState / mode / widths / resizeAvailability`; DOM order and physical placement are decided by
the `.cols` grid. **There is no "pane-layout share" of this defect to fix.**

*Do-not-fix note for the Controller:* the accepted donor reference
(`foundation/presentation-carrier/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html:18`)
carries the same `.cols{direction:ltr}` in an RTL document, i.e. **the accepted reference does not
mirror the panes either**. Mirroring would therefore contradict reference authority for pane
organization — this needs an adjudication, not a unilateral CSS flip.

---

## H-SH2-05 · BKP U-01 `.centerrail` overlays centre-pane content

Root is **`dist/foundation/donor.css`** → `.centerrail{position:absolute;top:8px;left:8px;right:8px;
…;z-index:214}` (generated, harness-prohibited). Not present in `foundation/extensions.css`.

**Mitigated in-root** (this is HLTH-F6, same geometry): `foundation/extensions.css` now carries one
shared clearance `.foundation-stage{padding-top:40px}` so the bar (top 8 → 38) can no longer cover a
surface's first line; the four consumers that previously carried an ad-hoc `36px` now share that one
value. Residual: surfaces whose centre content is `#centerPane > .docscroll` (structured editor routes)
are not `.foundation-stage` children — no *text* occlusion was measured there, but the bar does float
over that region; recorded as an observation under H-SH2-06.

---

## H-SH2-06 · HLTH-F7 right-pane chrome gap — **not reproducible at this base**

Measured on `shell`, `library`, `evidence`, `health` at `1440×1000` in EN (and the 23-route census in
AR): `#rightPane` contains exactly two children — `.phead` (`h=45`) and `.pbody` (`y` directly after) —
and **`pheadGap = 0`** on every route. `#contextLenses` does **not exist in `dist/index.html`** at all
(`accepted-runtime.ts renderContextLenses()` early-returns on `if(!host) return`), and `.contextscope`
is `display:grid` (**visible**) on the health route, not hidden.

The described state (`#contextLenses` present + `.contextscope` hidden + ~27px gap) therefore does not
occur at `9f1dc785`. Requesting the original finding's capture (surface + viewport + lens state) before
any change is made; no speculative edit was applied.

---

## Summary

| ID | Objective | Disposition |
|---|---|---|
| H-SH2-01 | AD-01 ≈16/65/17 | **STOP — out-of-root** (schema + frozen fixture + accepted-runtime + responsive-layout + generated donor.css); both experiments measured |
| H-SH2-02 | AD-02 / DEF-06 remainder | **STOP — out-of-root/harness**; in-root seam proven 0 Arabic under EN |
| H-SH2-03 | D-08 `!important` collision | **STOP — generated (`tools/extract_donor.py`)** |
| H-SH2-04 | MAS1-003 pane mirror | **STOP — generated `donor.css`; + reference-authority adjudication needed** |
| H-SH2-05 | BKP U-01 centerrail | **STOP — generated; mitigated in-root** (HLTH-F6 clearance) |
| H-SH2-06 | HLTH-F7 gap | **Not reproducible — capture state requested** |

No Owner decision was made, no Owner record was edited, and no file outside the sealed roots was
mutated.
