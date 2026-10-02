# HANDOFF — CLOSURE TASK R-07 (503 body-drain / bridge deterministic release)

**Class:** `CONTROLLER_BOUNDED_CLOSURE__CANDIDATE_ONLY` · Serial closure mode · Parent `7024222` (task start after T0 checkpoint)

## Root cause (structural, proven)
`stack/native-typescript/foundation/contracts/platform-input-direction-bridge.ts` non-OK branch: `if (!res.ok) return null;` released the unread response body only implicitly (browser GC/abort timing) → settlement timing was load/GC-dependent. Under multi-lane runtime load the in-flight request outlived flow timeouts (recorded evidence: RUN-1 B1 minimal repro, curl 49ms vs Chromium pending; REV-1 §2 flow timeouts passed when lane freed).

## Implementation
Explicit best-effort `res.body.cancel()` with swallowed cancellation errors on the non-OK path only. Success path byte-identical (`res.json()`). Consumer semantics unchanged: non-OK → `null` → cached hint untouched → truthful degradation.

## Reproduction matrix (serial environment, 4 responder shapes — BEFORE behavior)
| Shape | Result BEFORE |
|---|---|
| completing 503 (CORS) | settled 1.7–2.7s; `!ok` path executes; implicit release |
| completing 503 (no CORS) | fetch rejects pre-`ok` (TypeError) — branch not reached (probe artifact) |
| stalled chunked 503 | settled ~1.3s (incomplete-encoding reject path) |
| truncated Content-Length 503 | settled ~1.3s (net-error reject path) |
Multi-lane "never settles" hang NOT reproducible serially → exact mechanism remains `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` beyond the implicit-release timing class; recorded as environment-dependent with RUN-1/REV-1 in-branch evidence.

## A/B proof (CORS completing 503, instrumented Response.body.cancel counter)
- BEFORE (stash → rebuild): `cancelCount=1` = probe's direct cancel ONLY; **bridge itself never canceled**. settle 1301ms, `hint:null / recognized:false / PLATFORM_DIRECTION_HINT_UNKNOWN`, 0 pageErrors.
- AFTER (fix → rebuild): `cancelCount=2` = direct + **bridge's own explicit cancel**. settle 1341ms (unchanged class), identical truthful bridge read, 0 pageErrors.
- Files: `BEFORE_probe.json`, `AFTER_probe.json`, `R07_SOURCE.diff`.

## Tests / falsification
`npm test` **210/0**; `browser-conformance` **6/6** (input-direction consumers incl. bidi/locale flows) with receipt regenerated source-bound; OK-path untouched (diff restricted to non-OK branch); no false success/provider state (bridge read proves unknown→null, never fabricated).

## Four truths
CONTENT: n/a (state). PRESENTATION: n/a (state). BEHAVIOR: settle + truthful unknown proven (above). DOMAIN/DATA/PROVIDER: degraded-mode hint truth held (`hint:null`, `recognized:false`).

## Unresolved
Exact multi-lane hang mechanism (`UNRESOLVED_FROM_AVAILABLE_EVIDENCE`); sibling-runtime server-response shape not re-creatable serially.
