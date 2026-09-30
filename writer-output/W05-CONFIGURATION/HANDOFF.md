# HANDOFF — W05-CONFIGURATION (surface `configuration`)

**Unit:** `W05-CONFIGURATION` · **Branch:** `writer/mi-serial` · **Base commit:** `fa0d309` (+ uncommitted delta)
**Reference:** `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png` — `OWNER_CONFIRMED_FINAL_REFERENCE` (`bb32df27c015b018`, 1536×1024)
**Acceptance:** `NOT_OWNER_ACCEPTED` — sole Controller review required. Machine-readable report: [`VISUAL_EXECUTION_REPORT.json`](./VISUAL_EXECUTION_REPORT.json).

---

## 1. What this workspace is for

**Configuration & revision control.** Read what the platform has configured, prepare a **draft revision**, **validate** it, then **publish** it — including the durable *user* preferences (product language, direction, appearance, layout, editing, guidance) that belong to the user and never to operational configuration.

That identity drives the composition, which follows the reference: action strip → revision identity strip → Domains & keys table → tabbed revision workspace (diff / revision log / observed keys) → record-basis footnote, with a structure pane on the start side and a revision inspector on the end side.

## 2. Gap G-20 / VD-003 — language policy seam (the named defect)

Owner policy applied in full: **Arabic and English are both first-class, the active language is user-configurable through Settings, and there is no privileged product-language authority.** The reference being Arabic did **not** make Arabic the default.

| Seam | Before | After |
|---|---|---|
| `foundation/global/preferences/schema.ts` | `locale:{safeDefault:'ar'}` | `locale:{safeDefault:LOCALE_SAFE_DEFAULT}` where `LOCALE_SAFE_DEFAULT = resolveSystemLocale()`; `PRODUCT_LANGUAGE_AUTHORITY = null` |
| `foundation/global/preferences/language-policy.ts` | — | **NEW** single resolver used by schema, `SettingsCenterOwner.direction()` and `applyDocumentShellLanguage()` |
| `dist/index.html` | `<html dir="rtl" lang="ar">` baked | `<html>` with **no** language/direction; a resolver runs before first paint |

Resolution order (identical in TS and in the shell bootstrap): **stored user preference → browsing-context language environment (`navigator.languages`, matched by locale *and* by direction so RTL environments get the RTL language) → schema placeholder** (reachable only outside a browsing context, i.e. never in the product). Direction: explicit `chromeDirection` pin → else derived from the active locale.

`dist/index.html` is **generated** by `tools/extract_donor.py` under a `ZERO_DELTA` sha256 guard — a direct edit is silently reverted by the next build. The generator was patched **through `tools/writer-serial.sh`** and the expected hash re-frozen to `d60ad0f3…`. `cep-writer/WRITER_INPUT_MANIFEST.json` entry 300 is now stale (read-only → reported as O-04).

**Proof (4/4, with `main.js` blocked so only the inline bootstrap can have written the shell):**

| case | result |
|---|---|
| no stored preference | `lang=en dir=ltr`, authority `browsing-context-language-environment` |
| stored `locale:ar` | `lang=ar dir=rtl`, authority `user-preference` |
| stored `locale:en` + `chromeDirection:rtl` | `lang=en dir=rtl`, direction authority `user-preference` |
| JavaScript disabled | **no `lang`/`dir` attribute at all** — nothing baked |

Evidence: `evidence/g20-shell.json` + 3 shell captures.

## 3. Settings — purpose, not a generic list

`foundation/global/settings/` now renders a panel that says what it is and what it governs:

- Header: **"Settings & Preferences / الإعدادات والتفضيلات"** + *"Configure, then revise, your preferences — language and direction stay changeable at any time."*
- **Always-visible Language & direction block** with *exactly one* control per preference (`locale` and `chromeDirection` are suppressed inside their sections so there is no second action home), option labels in both languages, and a state chip: `en English · LTR · Your device language — no product-language authority · scope default`.
- Localized group and section labels, a **current-value summary on every collapsed section** (e.g. `Theme: Dark blue · Density: Comfortable · Interface scale: 1 · +3 more`), so the panel carries information before you open anything.
- **Authority footer:** value owner `ScopedPreferencesOwner` · persistence `PERSISTED` · language authority · preference-transfer receipts.
- **Bilingual search:** queries match Arabic *and* English labels and value tokens.

Model contracts were kept byte-stable (group labels, section ids/orders, `chromeDirection` in `settings.layout`, `locale` reachable at `preferences.appearance`) — all **36/36** `w4-e-settings-center-tests` still pass.

## 4. Configuration surface

- **Centre** — revision identity strip, 3-fact metadata row (`Based on` / `Draft revision` / `Configuration profile`), Domains & keys table (8 domains, kind filter + search, 5 columns, uniform 66px rows, status chips), tabbed workspace with a real two-pane diff (draft leads, base follows — the reference's reading order), change-summary + change-points rail, record-basis footnote.
- **Left** — configuration control: 8 domain nav items (selection synchronised with the table), 4 revision points (`CFG-REV-0043-DRAFT` … `-0040`), 4 authorities.
- **Right** — revision inspector in the reference's order: current draft, impact level + bars, dependency alerts, affected surfaces/components, application requirements, validation confirmation, publish readiness, publish notes, surface owner.
- **Interaction is real, not decorative:** domain selection, tab switching, filter, search (focus retained), **Validate** (readiness 36→100, enables Publish), **Publish** (writes preference overrides durably through `ScopedPreferencesOwner` and applies them to the shell; operational scope is only ever `AUTHORITY_PENDING`), **Discard** (shared-dialog confirmed; `liveConfigMutation=false`, `factoryReset=false`), **Save draft**, and **Settings** delegation.

Architecture: **SHARED MECHANICS** (SemanticCommandBus, `WorkspaceFoundation` regions/toolbar/dialog, shared focus/keyboard) **+ SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION**, kept in place by a presentation governor with a burst guard so a shared re-render can never starve the event loop.

## 5. Verification

| Gate | Result |
|---|---|
| `audit.mjs` (runtime) | **23 / 23 PASS** — function, responsive ×3, RTL ×2, G-20 shell |
| `audit2.mjs` (settings + collapsed) | **10 / 10 PASS** |
| `g20.mjs` (document shell) | **4 / 4 PASS** |
| Unit suites on the final build | `w4e 36/0` · `configuration 12/0` · `S19 17/0` · `S03 10/0` · `D03A 11/0` · `D11` exit 0 · `CG6` exit 0 — **0 failures** |
| `npm test` (model tests) | **PASS** |
| `npm run check` | 8/9 sub-checks PASS individually; composite stops at `check-build-authority` because it shells out to `build-runtime.mjs`, which fails on **another unit's** uncompilable file (O-03). `check-contracts` 165/3 — the same 3 pre-existing browser-receipt failures. |
| Evidence integrity | **23 / 23** captures: recorded sha256 == file sha256, 0 mismatches |

**RTL/LTR:** EN surface = **0 Arabic glyphs in 4 224 characters**; AR surface = 2 112 Arabic glyphs in 3 804 characters (remainder are correctly isolated Latin tokens). Geometry mirrors (domain cell x=766/372, diff panes `[717,374]`/`[374,717]`, status column to the reading-end side), no horizontal overflow in RTL, EN→AR→EN round-trip restores identical surface text.

## 6. Defects

**16 found, 16 fixed** (2×V4, 3×V3, 6×V2, 5×V1) — full list with root cause in the report. The three that mattered most:

1. **V4** Arabic hardcoded as product-language authority → fixed in schema + shell generator (§2).
2. **V4** surface rendered as the generic typed-collection workbench → rebuilt as a revision workspace.
3. **V3** two runtime loops found and root-caused (a TDZ `ReferenceError` in `renderRight` and an un-localising toolbar refresh) that together hung the page — both fixed, plus a **burst guard** so a governor loop can never starve the event loop again.

**6 open defects reported with owner and routing** (see `BLOCKERS`/`ROOT_CAUSE.OPEN_DEFECTS` in the report): O-01 shared/donor chrome hardcodes Arabic; O-02 pane proportions vs the reference are frozen cross-surface; O-03 another unit's file blocks the build; O-04 stale read-only manifest entry; O-05 image-`read` channel returns stale bitmaps; O-06 3 pre-existing `check-contracts` failures.

## 7. Method note (important for review)

The image-`read` channel returned **stale/cached bitmaps** for every capture after the baseline — proved by requesting an AR/RTL capture (sha256 `f84c7560…`, tesseract OSD `Script: Arabic`) and receiving an LTR/English bitmap. **No visual claim in this handoff rests on that channel.** All verification used byte-level oracles instead: tesseract OSD/OCR on the actual files, PIL geometry, sha256 byte identity, and live DOM `getBoundingClientRect`/`getComputedStyle` measurement. Please re-verify the PNGs with a working image channel before acceptance.

## 8. Reproducing

```bash
tools/writer-serial.sh npm run build:runtime      # once surfaces/audit/index.ts compiles again
tools/writer-serial.sh npm run check
node writer-output/W05-CONFIGURATION/evidence/harness/audit.mjs     # 23 checks + captures
node writer-output/W05-CONFIGURATION/evidence/harness/audit2.mjs    # 10 checks + captures
node writer-output/W05-CONFIGURATION/evidence/harness/g20.mjs       # 4 shell checks
```
Serve: `npm run dev` → `http://localhost:4173/?surface=configuration`.
