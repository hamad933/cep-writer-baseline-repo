# 00_bootstrap / runtime_status

Timestamp: 2026-09-29T01:20-01:30Z · Method: direct execution in the live Codespace · Status: **PASS**

| Check | Directive claim | Live measurement | Verdict |
|---|---|---|---|
| Codespace identity | `refactored-space-umbrella-gx9xwww664297rw` | `CODESPACE_NAME=refactored-space-umbrella-gx9xwww664297rw` | MATCH |
| OS | (unspecified) | Ubuntu 24.04.5 LTS, Linux 6.8.0-1064-azure x86_64 | RECORDED |
| Node | 22.16.0 | `node --version` = v22.16.0 (`engines` pin in package.json = 22.16.0) | MATCH |
| npm | (unspecified) | 10.9.2 | RECORDED |
| Python | required for build tooling | 3.14.2 at `/home/codespace/.python/current/bin/python3` | PRESENT |
| Playwright | 1.62.1 | `npx playwright --version` = 1.62.1; package-local `playwright` + `playwright-core` in node_modules | MATCH |
| @xterm/xterm | 6.0.0 | dependency in package.json = 6.0.0 | MATCH |
| OpenCode | v2.0.18 | `opencode --version` = v2.0.18 (`/home/codespace/nvm/current/bin/opencode`) | MATCH |
| SQLite | `node:sqlite` | declared by mission; runtime persistence layer present under `stack/local-runtime/persistence/` (implementation confirmed present, behaviour not re-executed this pass) | PASS_WITH_LIMITATION |
| Docker/devcontainer | not required | no Docker dependency in package.json; not used | MATCH |
| PHP/Laravel/PostgreSQL | must NOT be assumed | not present in package.json; not used by current executable repo | MATCH |

Notes:
- Directive section 4 said to trust live evidence over the written baseline. Every baseline claim
  that could be measured was confirmed; none was contradicted.
- `dist-ts/` is gitignored build output and `node_modules/` is installed; both are consistent with
  the "committed dist / build:runtime" model in README.md.
