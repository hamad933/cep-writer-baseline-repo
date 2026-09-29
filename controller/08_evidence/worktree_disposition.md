# 08_evidence / worktree_disposition (B-5 RESOLVED — classification, preservation, isolation)

Timestamp: 2026-09-29T02:05Z · Rule applied: preserve everything; revert nothing; no reset/stash/checkout-over/rewrite (mission §35 hard stop).

## Categories (measured from `git status`, 2026-09-29T01:50-02:00Z)

| Category | Count | Classification | Disposition |
|---|---|---|---|
| **CANONICAL_SOURCE_DRIFT** (pre-existing, unattributed) | 3 | `CANDIDATE` (uncommitted candidate corrections) | **PRESERVED untouched**; adjudication required before Writer dispatch binds a baseline (see below) |
| GENERATED_ARTIFACT (build output) | 174 `dist/**` | `CURRENT_EVIDENCE` (regenerated) | preserved; regeneration reproducible via `npm run build:runtime` |
| EVIDENCE_REGENERATED | 5 `assurance/**` | `HISTORICAL_VALID`+current mix | originals preserved in `controller/08_evidence/legacy_evidence/` before B-4 re-run |
| WRITER_INPUT_CHAIN | 2 (`cep-writer/WRITER_INPUT_MANIFEST.json`, `cep-writer/tools/verify_repo.py`) | `CANDIDATE` tooling evolution (implements canonical-identity law; +179 lines of git-bound verification) | preserved; the worktree version is what enforces `480dbe…/273` and is load-bearing for gate checks |
| CONTROLLER_TOOLING | 1 (`tools/browser-conformance.mjs`) | `CANDIDATE` (pre-existing harness edits) | preserved; executed as-is for B-4 |
| GENERATED_MEASUREMENT | 1 (`stack/MEASURED_COMPARISON.json`) | `CURRENT_EVIDENCE` | preserved |
| UNATTRIBUTED | 2 (`assurance/browser-workspace-pane-context.png`, `session-63ad5b92-….md`) | `UNKNOWN` attribution | preserved, quarantined from authority; not referenced by any ledger |
| CONTROLLER_FOOTPRINT (this mission) | `controller/**` only | `CURRENT_VALIDATED` (mine) | fully isolated and auditable |

## The 3 canonical-source deltas (exact content — evidence for adjudication)

1. `stack/native-typescript/main.ts` — 578-line raw churn = whitespace/rewrap; **semantic delta ignoring whitespace: 1 insertion / 3 deletions**:
   - `#topBanner .lock span` write made null-safe: `.textContent=…` → `?.replaceChildren(document.createTextNode(…))`
   - removal of the `if(consumer!=='enterprise'){ … }` gate around spatial stage setup (behavioral for `enterprise` consumer)
2. `stack/native-typescript/foundation/extensions.css` — minified-line churn + **layout delta**: `.foundation-stage` `min-height:0`→`320px`, `.spatial-host` `min-height:180px`→`320px`
3. `stack/native-typescript/foundation/operational/xterm-renderer.ts` — asset URLs `/vendor/xterm/*` → `import.meta.url`-relative (file/in-memory transport compatibility fix)

## Identity impact (fully quantified)

| Candidate | Identity | Files | Bound to |
|---|---|---|---|
| CANONICAL | `480dbe9d…cc9641` | 273 | parent commit `293dd1e` / tree `3101c069` |
| CLEAN HEAD | `3f3ad1e0…24e20` | 287 | `48fec276` / tree `fbe50585` |
| WORKTREE VARIANT | `c82cec63…cb5f` | 287 | live tree incl. the 3 deltas above (B-4 receipt binds here) |

(Retracted: `2ebcbf89…` = wrong field order, never a real identity.)

## B-5 resolution statement

- Pre-existing Owner/predecessor work: **preserved byte-for-byte** (nothing deleted, reset, stashed,
  checked out over, or rewritten).
- Controller-generated changes: only `controller/**`; every other category predates this mission.
- The `verify_repo.py REQUIRED_INPUT_MISMATCH` is explained end-to-end: the manifest binds the
  pre-drift evidence/dist state; the worktree carries regenerated evidence/dist + 3 source deltas.
- **Remaining decision (Owner-authority class, does not block packet generation):** accept the
  3-file delta as a candidate baseline (rebind `WRITER_INPUT_MANIFEST.json`) **or** restore the 3
  files to `48fec276`. Both are one-command reversible once decided. The Controller makes no
  product mutation either way (mission §38). Writer packets bind to **CANONICAL `480dbe…/273`** and
  explicitly enumerate this delta as `PRE_EXISTING_CANDIDATE_DELTA__OWNER_ADJUDICATION_REQUIRED`.
