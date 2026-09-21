# Browser conformance bootstrap

The delivered default path is package-local. No Work/Codex-internal module path is required.

## 1. Install JavaScript dependencies

Use the committed lockfile:

```sh
npm ci
```

For restricted/offline environments, provide an npm registry mirror or a pre-populated npm cache. The lockfile is deterministic, but a lockfile does not itself contain package tarballs.

## 2. Provide a Chromium binary

Normal Playwright-managed bootstrap:

```sh
npx playwright install chromium
```

Alternatively, provision a compatible local Chromium and set `CEP_BROWSER_EXECUTABLE` to its executable path. Browser installation and JavaScript dependency installation are intentionally separate steps.

## 3. Run the bounded suite

```sh
npm run browser:test
```

The default transport is `localhost-http`. Environments that administratively block all browser URL navigation may set `CEP_BROWSER_TRANSPORT=in-memory`; this test-only transport loads the same built `dist/index.html` and ESM graph without modifying application source.

`CEP_PLAYWRIGHT_MODULE_PATH` is an optional explicit module-resolution override for managed/offline test infrastructure. It is not required by the delivered source and there is no mandatory `/opt/codex/...` fallback.

## Reproducibility boundary

- `playwright` is pinned exactly to `1.62.1` in `package.json` and `package-lock.json`.
- `npm ci --package-lock-only --offline` passes in the correction environment, proving package/lock consistency without network access.
- A full `npm ci --offline` requires the actual Playwright package tarballs to be present in the local cache; they were not present in the correction environment, so the executed browser proof used the explicit module-path override plus a compatible local Chromium.
- The six-flow browser result is a bounded conformance proof, not an exhaustive browser/device matrix and not Owner acceptance.
