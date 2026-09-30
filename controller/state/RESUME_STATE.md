# RESUME STATE — CEP Controller execution

**Machine-readable twin:** `RESUME_STATE.json` · **Protocol:** `CHECKPOINT_PROTOCOL.md` · **Operator resume:** `RESUME.md`

> **GitHub is the durable memory. The Codespace is a worker.**
> Do not assume Codespace, OpenCode session, or chat state.

---

## 1. Project identity

| Field | Value |
|---|---|
| Project | CEP — Cybersecurity Education Platform |
| Repository | `hamad933/cep-writer-baseline-repo` |
| Durable checkpoint branch | `writer/mi-serial` |
| Governance version | `GOV-2026-09-30-v1` |
| Dispatch version | `DISPATCH-2026-09-30-v2` (wave-2 over-serialization revoked) |
| Controller model | `xiaomi-token-plan-sgp/mimo-v2.6-pro` |
| Writer model | `xiaomi-token-plan-sgp/mimo-v2.6-flash` |
| Binding standard | `controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md` |

## 2. Where execution is

**Controller phase:** PHASE 7 — continuous visual ownership loop.

**Current durable head:** `c36279910b82a0bd2c715f4dd5c00bcf7eb574e2`

| Category | Surfaces |
|---|---|
| **Reviewed** | today, rq, scenarios, evidence, configuration |
| **In progress / review queue** | audit, backup, enterprise, labs, runs, releases, manual_ai, library, learn, visualize, reviews, mastery, portfolio |
| **Durably rescued** | W02-LIBRARY, W02-LEARN, W02-VISUALIZE, W03-LABS, W03-RUNS, W04-REVIEWS, W04-MASTERY, W04-PORTFOLIO, W05-AUDIT, W05-BACKUP, W05-RELEASES, W03-ENTERPRISE |
| **Not dispatched** | health, processing, validation, results, shell |
| Blocked / failed | — none recorded at state level — |

The rescued Writer work is durable in GitHub but remains **NOT_OWNER_ACCEPTED**.

## 3. Surface ownership and dispatch

Authoritative: `controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json` (23 units, computed reference sha256 + dims) and `controller/10_dispatch/PARALLEL_EXECUTION_PLAN.md` §4 **Dispatch Coverage Matrix**.

Execution unit: **1 Writer → 1 Surface → 1 visual ownership loop.**

## 4. Shared-component changes

| Path | Change | State | Owner |
|---|---|---|---|
| `surfaces/m0-controller-composition.ts` | `direction:rtl` → `direction:inherit` (VD-009, Owner language policy) | applied + committed | W01-SHELL / Controller slot |
| `foundation/global/preferences/language-policy.ts` | single language/direction resolver (G-20) | applied + committed | W05-CONFIGURATION |
| `tools/extract_donor.py` | generator emits neutral `<html>`; ZERO_DELTA hash re-frozen | applied + committed | W05-CONFIGURATION via `writer-serial.sh` |

## 5. Pending integration seams

1. **AD-01** pane proportions (`pane-layout.ts` 304/420 → reference ~16/65/17) — WAVE-4, shared-level, full consumer regression required.
2. **AD-02** donor/shared chrome hardcodes Arabic — W01-SHELL.
3. **D-08** `donor.css #rightPane .contextscope{display:grid!important}` collision — needs shared ruling.
4. **`w05-rescue.ts` write-ownership split** — W05-VALIDATION owns; HEALTH/PROCESSING must request.
5. **b2** RQ `m0` mount hunk filed-not-applied (`writer-output/W02-RESEARCH-QUALITY/SERIALIZED_HOTSPOT_REQUEST.md`).

## 6. Last validation

| Check | Result |
|---|---|
| Model tests | **210/0 PASS** |
| Build authority | **pass=true**, `CANONICAL_SOURCE_TO_GENERATED_ONLY`, 290 written, parity true |
| `npm run check` | 3 known failures: `browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence` |

Root cause of those 3: **EVIDENCE/ORACLE** — stale `assurance/BROWSER_CONFORMANCE_RECEIPT.json` lineage (gaps G-24/G-36). Pre-existing, not caused by current work.

## 7. Known blockers

| ID | Sev | Statement | Owner |
|---|---|---|---|
| G-24 / G-36 | V2 | stale browser conformance receipt lineage keeps `npm run check` red on 3 checks | Controller |
| G-35 | V1 | pre-existing `WRITER_INPUT_MANIFEST.json` drift entries, deliberately not absorbed (absorbing them would destroy drift evidence) | Controller |
| VD-008 | V3 | image-read channel returns **intermittently stale frames**; mitigation = ground-truth cross-check (sha256 + OCR) on every visual verdict | Controller/tooling |
| VD-005 / VD-011 | V3 | Flash Writers exhaust output budget mid-build on 20–75 KB files; §17 mitigation working but not sufficient alone | Controller |

## 8. Owner decisions already established (do not re-ask)

- **Language policy is FINAL.** Arabic + English both first-class; active language user-configurable in Settings; **no** permanent Arabic-first/English-first product authority; RTL + LTR + BIDI required.
- Previously reviewed surfaces were **REJECTED** for presentation, UI/UX, composition, hierarchy, pane organization, density/balance, polish, identity, elegance. Target is **substantial** improvement, not cosmetic.
- Writer model MiMo-V2.6-Flash; Controller model MiMo-V2.6-Pro; 1 Writer = 1 Surface.
- **Visual references are CONSTRUCTION AUTHORITY**, never "presentation only". `REFERENCE != BLIND PIXEL COPY`.
- **DONOR != DESTINATION TEMPLATE.** Conceptual cloning forbidden (the Library/Learn → Scenarios/Labs failure must not recur).
- Protected historical files are read-only evidence.

## 9. Next actions (resume here)

1. Dispatch the **W05 trio** (health / processing / validation) with `w05-rescue.ts` write-ownership held **solely** by `W05-VALIDATION`; the other two request via `tools/writer-serial.sh`.
2. Dispatch **W03-RESULTS** when `W03-RUNS` completes.
3. Review the 13 in-flight Writer results as they land — Controller independent review; **never** accept "Writer PASS".
4. **WAVE-4**: AD-01 pane proportions + AD-02 donor chrome Arabic + D-08 `!important` collision.
5. Regenerate assurance receipts (G-24) at wave end.

## 10. Skills (persistent, versioned in git)

`.opencode/skills/<skill-id>/SKILL.md` — all four are binding on every Writer:

1. `visual-surface-composition`
2. `visual-fidelity-review`
3. `shared-component-governance`
4. `professional-ui-ux-composition`
