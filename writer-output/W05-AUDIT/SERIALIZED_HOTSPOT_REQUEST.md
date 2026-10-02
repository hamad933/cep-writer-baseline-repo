# SERIALIZED HOTSPOT REQUEST — AUD-1 (W05-AUDIT)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__REQUEST_NOT_A_CHANGE`
**Lane:** `AUD-1` · **Owner:** `W05-AUDIT` · **Raised:** 2026-10-02 · **Source commit:** `e201dbaba5cb6cf9e6ee2eb1dfd35742d3876904`

## Why this request exists

AUD-V3 states: *"candidate uses the double-tier global+area header where the reference uses a compact single-tier top bar; vertical budget is consumed by chrome instead of data."*

The **surface-owned half** of that defect was closed inside this lane's roots (`stack/native-typescript/surfaces/audit/index.ts`):

- surface header collapsed from a 437px two-tier stack (identity tier 319px + command tier 118px at AR 1440×1000) to **one 153px compact tier**;
- duplicated eyebrow/long lead removed (full text retained on `title`);
- duplicate counts/title folded into the ledger head;
- measured effect: ledger starts `y=692 → y=388`, stage `scrollHeight 2449 → 1189`.

The **shell-owned remainder** cannot be touched from this lane. Measured chrome above the surface (probe, unchanged before/after — proof that no shared chrome was mutated):

| Row | Selector | Height @1440×1000 | Height @1024×900 | Owner |
|---|---|---|---|---|
| 1. Global nav (brand + area destinations + tools) | `.global-shell-primary` | 46px | 44px | W01-SHELL / `foundation/global/shell/navigation.ts` |
| 2. Area context bar (current area + area nav + history) | `.global-shell-contextbar` | 36px | 34px | W01-SHELL / `navigation.ts` |
| 3. Area banner (`Audit · Durable Event Trace`) | `#topBanner` | 56px | 56px | `surfaces/m0-controller-composition.ts` (`setBanner`) |
| 4. Shared domain toolbar | `#domainToolbar` | 32px | 67px (wraps) | shared toolbar host + `workspace.toolbar(...)` |
| **Total** | | **170px** | **201px** | read-only for AUD-1 |

The reference has **one** compact top bar (~44px) before the workspace content. Rows 1–4 are `SHARED_COMPONENT` code, and this lane's writable roots are exactly `stack/native-typescript/surfaces/audit/`, `stack/native-typescript/adapters/audit.ts`, `writer-output/W05-AUDIT/`. Per the packet contract (§0 shared seams) the Writer must not edit them directly — request instead.

## Requested change (for the W01-SHELL / SH-1 serialized slot, not for this lane)

1. Collapse rows 1–2 into one compact top bar (the area context bar already carries `Current area · W05 · Audit`; the second nav line can collapse to a menu/overflow at ≤1500px width).
2. Decide whether row 3 (`#topBanner`) duplicates surface identity once surfaces render their own title (the audit surface does). If kept, it should replace — not stack with — the surface title tier.
3. Row 4 (`#domainToolbar`) shows the same `audit.search / audit.verify / audit.annotate / audit.export / foundation.settings` commands as the surface's own command row; de-duplicate per `OD-20260917-053` (no duplicate presentation owner for the same command).

## Constraints honored by this request

- No shared file was modified by AUD-1 (`git status` tracked scope = `stack/native-typescript/surfaces/audit/index.ts` only).
- Owner-facing item `OWNER-20260910-010` (shell redesign) stays isolated and record-only — this request does not decide it.
- Serialized per DAG §0 (`writer-output/<unit>/SERIALIZED_HOTSPOT_REQUEST.md`) inside this lane's writable output root `writer-output/W05-AUDIT/`; no shared file was touched to raise it.
