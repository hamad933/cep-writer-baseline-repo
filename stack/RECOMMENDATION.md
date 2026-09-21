# Stack proof and recommendation

Recommendation: retain native HTML/CSS/JavaScript ES modules as the next bounded Foundation baseline. This is an evidenced engineering recommendation, not Owner acceptance and not a frozen final-product stack.

`MEASURED_COMPARISON.json` records the actual proof tree, file sizes, physical lines, one-host emit timing and repeated model-suite timing. Candidate A requires no build step and no third-party runtime dependency. Candidate B emits the same 17-module tree from `.ts` sources with Node's built-in type stripping in about 66 ms on the recorded host; both execute the same 37 model assertions. Strict type checking was unavailable and is not claimed. This proves parse/emit and model-result parity only, not that TypeScript has earned its whole-project cost.

Node explicitly distinguishes type stripping from type checking and notes that this mechanism ignores `tsconfig.json`. [Node TypeScript documentation](https://nodejs.org/api/typescript.html). JavaScript may also be checked using TypeScript/JSDoc, so JS is not inherently equivalent to unchecked code. [TypeScript JavaScript checking documentation](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html).

| Candidate | Current evidence | Recommendation |
|---|---|---|
| Native HTML/CSS/JS modules | Golden plus Library, Learn, Visualize, W03 Enterprise and W03 Runs compositions; 37 model tests; fresh browser receipts | Retain as the bounded baseline; not frozen |
| HTML/CSS/TypeScript | Same 17-module tree emitted; same 37 model results; zero runtime dependencies; measured emit cost | Revisit only with strict-checking and a concrete maintainability bottleneck |
| Vue 3 + TS + Vite | No measured complexity reduction against this Foundation | Do not admit by popularity or historical filename |
| Native SVG + Pointer Events | Selection, marquee, drag, pan, pointer-centered zoom, Fit and canonical relation author/edit routes proven | Retain for current graph scale; benchmark before replacing |
| Vue Flow | No measured comparison and no unmet current spatial capability | Candidate only if larger-graph or accessibility evidence justifies it |
| DOM terminal renderer | Stable tabs/presentation and truthful bounded simulation command flow proven | Sufficient for this mission's vocabulary |
| xterm.js | No renderer bottleneck measured | Renderer-only candidate; never runtime/simulation truth owner |
| SQLite / Python bridge | No current durability or host-integration requirement | Defer to a concrete persistence/backend mission |
| Electron / Tauri | Browser/local proof is sufficient for the bounded Foundation | Defer; neither selected |

Use `npm run dev`, `npm test`, `npm run check`, and `node tools/stack-proof.mjs`. No package installation is required. The visual evidence belongs to Candidate A; emitted TS assets are not presented as an independent UI implementation. No cold-start benchmark, large-graph benchmark, external runtime, or strict TypeScript gate is claimed.

Technology admission remains governed by: measured complexity removed must exceed dependency, integration and lock-in introduced.
