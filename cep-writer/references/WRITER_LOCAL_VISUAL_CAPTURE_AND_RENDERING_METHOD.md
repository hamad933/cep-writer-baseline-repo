# CEP — WRITER LOCAL VISUAL CAPTURE AND RENDERING METHOD

**Role:** reusable execution method for all CEP Writers and Controller audits  
**Authority class:** operational method; it does not create Product/domain/acceptance authority  
**Applies to:** `CHATGPT_WRITER`, `GOOGLE_AI_STUDIO_WRITER`, Controller review, and any later Writer class with equivalent local execution capability.

## 1. Core law

Never collapse distinct execution capabilities into one binary "browser works / browser blocked" judgment. Test and record separately:

1. shell / Python / Node execution;
2. local-process access to application/backend;
3. browser process availability and launch;
4. browser URL navigation;
5. browser rendering independent of navigation;
6. JavaScript/DOM execution;
7. pointer/keyboard/focus interaction;
8. fresh screenshot creation;
9. actual screenshot/pixel inspection;
10. fresh video capture;
11. actual video validity/inspection;
12. genuine route/history/network/platform proof.

Failure of one capability never proves failure of another. In particular:

`NAVIGATION_FAILURE != RENDERING_FAILURE != SCREENSHOT_FAILURE != VIDEO_FAILURE != APPLICATION_FAILURE`.

A localhost/file/network navigation restriction is an evidence-scope limitation, not by itself a stop condition for Presentation work when truthful navigation-independent rendering remains available.

## 2. Non-negotiable integrity rules

- Do the capture work in the Writer/Controller execution environment; do not ask the Owner to produce screenshots merely because the first browser path failed.
- Do not mutate Router/routes, `package.json`, lockfiles, Product architecture, production configuration, public deployments, reverse proxies or tunnels solely to obtain visual evidence.
- Do not add Product dependencies merely to obtain screenshots/video.
- Historical screenshots never become fresh evidence. Byte identity/equivalence proof remains a separate evidence class.
- A PNG/WebM existing on disk is not visual acceptance. Material screenshots must be opened and inspected; material videos must at least be structurally validated and representative frames/state transitions inspected when video evidence matters.
- Genuine localhost/Back-Forward/network/platform claims remain OPEN when the environment blocks those exact capabilities. Navigation-independent rendering may prove Presentation/interaction only within its truthful scope.
- Fixture/demo/synthetic data used for rendering never becomes canonical Product/provider truth.

## 3. Bounded preflight

Discover, without uncontrolled filesystem crawling:

**Automation:** Playwright, Puppeteer, Selenium.  
**Engines:** Chromium/Chrome/Chrome for Testing/Headless Shell/Edge/Firefox/WebKit/Electron.  
**Execution:** exact Node, npm, Python, shell, curl/wget.  
**Evidence:** PNG/image-open capability, FFmpeg/ffprobe or equivalent video tooling.  
**Locations:** `/usr/bin`, `/usr/local/bin`, `/opt`, package-reported executable paths, Playwright/Puppeteer caches, mounted/shared tool directories, mission-provided offline tool artifacts.

Record exact executable path and version before claiming a rendering engine.

## 4. Recovery ladder

Use the narrowest successful path and stop escalating once truthful required evidence is obtained:

### L1 — Normal real route
`Playwright/browser -> page.goto(real local route) -> stable render -> interact -> screenshot/video -> inspect`.

Where available, first establish whether non-browser Node/Python/curl can reach the local application/backend. Browser navigation and local-process reachability are separate tests.

### L2 — Existing browser by explicit executable path
If Playwright's downloaded browser is absent, locate an already installed compatible browser and launch it explicitly. First prove:
`executable --version -> launch -> page.set_content(minimal HTML) -> PNG -> open/inspect`.

### L3 — Navigation-independent real browser rendering
When URL navigation is blocked by policy (`ERR_BLOCKED_BY_ADMINISTRATOR`, `ERR_BLOCKED_BY_CLIENT`, URLBlocklist, managed policy, equivalent), do not declare visual capture blocked.

Use:
`exact project source/build + CSS + JS + assets + required truthful state -> self-contained/in-memory page -> Playwright page.set_content / equivalent -> real browser render -> interactions -> fresh PNG/video -> inspect`.

If a backend is reachable from Node/Python/curl while Chromium itself cannot navigate to it, fetch the exact allowed JSON/state/assets through the non-browser local process and inject/bind them into the in-memory render. Preserve provenance and never reinterpret synthetic values as canonical data.

This evidence class is normally:
`FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`.

### L4 — Bounded browser/cache discovery
Search only known tool/cache locations and package-reported paths. Missing Playwright-downloaded Chromium does not prove no browser exists.

### L5 — Validated offline browser package
If downloads fail and a mission-approved offline browser archive exists in Drive/mounted storage:
- retrieve original exact bytes;
- verify SHA-256/size when governed;
- extract in a temporary tool workspace;
- validate architecture and executable with `file`, `--version`, and `ldd`/equivalent;
- launch explicitly through Playwright;
- run the minimal render/PNG/inspection probe before Product capture.

Never alter Product dependencies for this.

### L6 — Standalone Chrome Headless Shell
A full Chrome ProcessSingleton/seccomp/socket/container failure does not prove Headless Shell failure. After a bounded flag test, independently validate a discovered `chrome-headless-shell` / `chromium_headless_shell` / `headless_shell` binary and run the minimal render test.

### L7 — Other already available engines
Where appropriate, test Playwright Firefox/WebKit, Electron embedded Chromium, Puppeteer-compatible or Selenium-compatible engines already present. Minimal render proof precedes Product evidence.

### L8 — Environment blocker
Only after all applicable local/offline paths above fail may the task be classified `VISUAL_CAPTURE_INFRASTRUCTURE_BLOCKER`. Record the exact capabilities that passed/failed, executables/versions, stderr, exit code/signal, missing libraries, policy/seccomp/socket error, local-process reachability, and why every remaining path is unavailable.

## 5. Framework/runtime materialization

Adapt L3 to the actual project rather than inventing architecture:

- Build TypeScript/JS with the governed exact Node/npm target when bytes and dependencies are present.
- Preserve existing Vite/React/Vue/Svelte/plain HTML/SSR semantics where applicable.
- Prefer existing project build outputs or bounded generated in-memory documents.
- Do not create Product routes, servers or deployments merely to make browser navigation convenient.
- If ESM/assets require rewriting for in-memory rendering, perform it in a temporary evidence harness only and record the transformation. Never commit the harness as Product architecture unless separately authorized.

## 6. Screenshots

For every material state/viewport required by the mission:
- wait for DOM/hydration/fonts/images/assets and relevant async state;
- ensure the page is not blank, loading, fallback or partially rendered;
- capture exact viewport identity and state;
- open the resulting PNG and inspect it.

Inspection includes at minimum: layout, clipping/overflow, asset/font failures, RTL/LTR/Bidi, typography, hierarchy, spacing/density, alignment, contrast, icons, z-index/overlays, responsive geometry, viewport correctness, wrong/stale/loading state, and the exact component states applicable to the mission.

When a defect is found: diagnose -> correct only the authorized cause -> rerender -> recapture -> reopen -> reinspect.

## 7. Video capture

Treat video as a separate capability from screenshots.

Preferred path:
`validated browser + Playwright record_video (or equivalent) -> interaction/state sequence -> close context cleanly -> WebM/MP4 -> ffprobe/equivalent -> inspect representative frames/transitions`.

If Playwright video fails only because its bundled FFmpeg cache executable is absent:
- check for an already installed system FFmpeg;
- verify `ffmpeg -version`, executable validity and required libraries;
- where the tool requires a fixed cache path, a temporary execution-environment-only link/copy to the expected Playwright FFmpeg path is permitted after validation;
- do not modify Product dependencies, manifests or architecture;
- rerun minimal video capture first.

A video file must not be accepted merely because it exists. Verify codec/container, dimensions, duration/size, and when material to the mission inspect the relevant frames/state transitions.

## 8. Interaction and accessibility evidence

Where applicable, exercise the same rendered candidate with:
- pointer activation;
- keyboard Enter/Space/navigation;
- focus entry/return/fallback;
- Escape/outside dismissal;
- selected/active/expanded/collapsed/disabled/unavailable states;
- responsive viewport changes;
- RTL/LTR and technical-token isolation;
- reduced motion/forced-colors when required.

DOM assertions alone do not replace visual inspection, and screenshots alone do not replace interaction behavior proof.

## 9. Evidence record

For each capture set record, as applicable:
- exact Product/candidate source identity and commit/hash;
- build identity;
- browser executable and version;
- automation framework/version;
- FFmpeg/video tool version when used;
- viewport and direction/theme/state;
- render method (`GENUINE_ROUTE` vs `NAVIGATION_INDEPENDENT`);
- screenshot/video path, bytes and hash where custody requires it;
- capture command/result;
- actual visual inspection result;
- unresolved route/platform/data/provider limitations.

Evidence classes must remain explicit:
- `FRESH_CURRENT_CANDIDATE_SCREENSHOT`;
- `FRESH_CURRENT_CANDIDATE_VIDEO`;
- `NAVIGATION_INDEPENDENT_BROWSER_RENDER`;
- `GENUINE_ROUTE_BROWSER_EVIDENCE`;
- `HISTORICAL_SCREENSHOT`;
- `BYTE_IDENTITY_EQUIVALENCE`.

No class silently substitutes for another.

## 10. CEP Writer mission binding

Any CEP Writer mission that materially depends on Browser/Presentation/visual proof must bind this method or an exact successor and must include positive + negative/falsification tests. Full-carrier Surface evidence must verify both:
- required Surface semantics/regions/actions are present and correct; and
- donor/debug/foreign Surface semantics that are not authorized are absent.

When a shared carrier/foundation defect can affect multiple consumers, do not accept consumer-local CSS hiding or one-surface screenshot repair as proof of shared-owner correctness. Prove the central owner and propagation to genuine consumers, then exact-revert the bounded propagation proof when required by CEP reuse law.

## 11. Current-environment verified example — non-authoritative capability proof

On 2026-09-22 the active ChatGPT Controller environment independently proved:
- Node `v22.16.0`, npm `10.9.2`, Python `3.13.5`;
- Chromium `/usr/bin/chromium`, `144.0.7559.96`;
- Python Playwright browser launch + `page.set_content()` + JavaScript + pointer/keyboard interaction;
- fresh PNG at `1440x1000` and `1024x900` and actual image opening/inspection;
- URL/file navigation policy blocked independently of rendering;
- system FFmpeg `/usr/bin/ffmpeg` `7.1.5`; after a temporary tool-only link to the Playwright expected FFmpeg cache path, Playwright produced a valid `WebM/VP8` video at `1024x900`, `25fps`, verified with `ffprobe`.

This example proves the separation model; future Writers must still run their own bounded preflight and must not assume identical environment state.

## 12. Local-first iterative improvement and evidence custody — OD-20260922-073

The Writer's main objective is Product improvement throughput, not evidence transport. Use screenshots, crops, pixel/region comparisons, interaction captures and logs first as **local working instruments** inside the correction loop.

Preferred loop:
`governed reference -> decompose into material regions/components/states -> capture exact current candidate -> compare region/state-by-region/state -> diagnose weakest mismatch -> correct narrow owner -> rebuild/rerender -> recapture -> reopen/reinspect -> repeat`.

Rules:
- Intermediate PNG/WebM/crops/diffs/logs/build outputs stay local/ephemeral by default. Do not upload them merely because they exist.
- Reference cropping/decomposition is encouraged when it materially improves comparison precision. Preserve reference identity and never mistake a crop for a new authority source.
- The final representative captures that demonstrate the corrected material states may be promoted to durable evidence; earlier iterations normally remain scratch.
- `CHATGPT_WRITER`: do not use the GitHub connector for bulk screenshots/videos, large evidence trees, generated build output, or per-file blob assembly. GitHub is for source/delta, mission authority inputs and small handoff/receipt material. Heavy final candidate/evidence custody, when actually needed, goes to Google Drive in a bounded final transfer.
- `GOOGLE_AI_STUDIO_WRITER`: because governed Drive output is unavailable, the existing bounded candidate-branch evidence exception may carry final representative evidence only; intermediate capture churn should still remain local to the Studio worktree.
- Connector limits/failures must not dominate the Writer's time. Do not redesign Product code or spend the main execution budget on packaging/transport workarounds. Defer nonessential custody until the correction loop is materially complete.
- A final audit still requires source-bound evidence, but documentation is downstream of improvement; evidence production is not a substitute for diagnose/fix/retest.

