# CEP — Codex Serial Writer (Local-First)

## Authority and delivery boundary

This branch is an **isolated Windows Codex Serial Writer development lane**. The Owner explicitly selected the existing public GitHub repository and may authorize tracked SQLite content. The branch and initial seed are not Product acceptance, a release, or authority to publish further changes.

**MANDATORY LOCAL RULE:** Default to local execution and local storage. Never invoke git push, PR creation, GitHub API writes, Drive/Library uploads, release/deploy/publication, cloud synchronization, or transmit Source/Data/Evidence/results to a remote service unless the Owner explicitly approves the exact destination and scope at that time. This includes checkpoint publication and automatic uploads. Local git commits and local checkpoint archives are allowed. No scheduled/background upload. Never construe a previous approval to create or initially prepare the branch as indefinite authorization to push.

**Network economy:** Reuse the local dependency/toolchain/browser/runtime/cache/evidence copies and their hashes before considering any download. Do not install or update Node, Python, Playwright, runtimes, packages, or tools just because a generic setup instruction says so. Inventory the actual Windows host first; propose only truly missing items and their exact downloads to the Owner. Model-service connectivity is understood and separate from tool/data transfers.

## First admission

1. Read `00_READ_FIRST.md`, `controller/state/continuity/READ_FIRST.md`, and the locally supplied `LOCAL_CODEX_CONTINUITY.md` / cache manifest. The current **admitted Git source** must come from the verified B53 snapshot, **not** the older inherited Git branch baseline. If B53 has not yet been imported, STOP Product mutation; the remote branch is only a prepared shell.
2. Reuse local B53 source, its SHA-256/Manifest, current committed source-state journal, and exact local DATA custody. Independently select the newest legitimate operational SQLite. A48's embedded SQLite SHA-256 `e3935acafcf24ed5e5861f661414a011c42ef6e6d52026cf28ef6cd8651c2bb4` is the initial verified recovery candidate, not permission to overwrite newer live data.
3. Preserve all current Source and admitted Skills/references. An actual current local original may evolve through the canonical CEP providers; safe user-authorized persistence and migrations are permitted. Preserve transactional backups/revisions and data provenance. Destructive/fault-injection diagnostics run only on isolated copies.
4. Use `controller/state/continuity/events.jsonl` plus derived projections rather than creating new competing ledgers. Keep Source, Data, Evidence identities separate, Four Truths separate, and accurate evidence tiers. Reuse valid proof; no fake browser/provider/Windows PASS or self-accepted Gate A/B.

## Local work loop

- Choose a bounded high-impact root from verified current source/requirements/owner/provider context; reproduce; implement; test positive and negative outcomes on proper data modes; record one causal progress transition. Applicable Skills are selected by scope, not loaded in bulk.
- Keep heavy evidence (screenshots, DOM traces, logs, archives), caches, working/backup SQLite and credentials **outside the Git worktree** under the configured local CEP home. Include only the Owner-authorized seed snapshot and small metadata/references in Git. Never commit live WAL/SHM files, caches, tokens, or credentials.
- Local commits may include changed Source, tests, local knowledge/projections, and intentionally authorized source-aligned seed data. Do not publish or sync the branch unless specifically approved.
- A local checkpoint may be created and verified without external storage. Every cross-environment handoff must identify the exact git HEAD, Source SHA, latest committed operational SQLite hash/epoch, required proof refs/hashes, pending branch conflicts, and next action. When resuming Cloud, send only the explicitly Owner-approved delta/data/evidence/checkpoint and reconcile identities; no blind DB replacement.

## Approvals / gates

- `git status`, local branches, `git add`, `git commit`: permitted within Owner-authorized local work.
- `git fetch`, dependency installs or additional remote downloads: avoid by default; obtain specific Owner approval when needed.
- `git push`, API mutation of remote GitHub, Drive/Library uploads, artifact sharing or publication: **explicit Owner approval per upload boundary**, default DENY.
- No independent Product Gate or release self-acceptance. Record verified versus inferred versus NOT_RUN.

See `LOCAL_CODEX_CONTINUITY.md` for the host-neutral Windows/cloud handoff method and reusable cache layout.
