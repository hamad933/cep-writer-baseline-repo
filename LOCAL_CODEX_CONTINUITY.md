# CEP — Local/Cloud Serial Writer Continuity (Owner-Gated)

Status: INITIAL BRANCH PREPARATION — not yet B53 source-admitted, not Product acceptance.
Branch: `writer/codex-serial`. Keep the historical `writer/cep-serial` and `main` unchanged.

## Exact initial admission inputs
- Source: Library B53 generation-53, slot B, `libfile_6144b3e1721c81918bbfd5cd37ec7212`, archive SHA-256 `ae44f0146114975debb98128c1181f8be033dbcbd49bf0878f191dff6ce8c4b6`, 2,795 files. This is **PARTIAL**.
- Original-data recovery candidate: Library A48 `libfile_bfdb63b91eec81919f4c652cb94936b0`, inner `DATA/cep.sqlite` SHA-256 `e3935acafcf24ed5e5861f661414a011c42ef6e6d52026cf28ef6cd8651c2bb4`. This is not guaranteed to be the latest local live data.
- Separately preserved B53 evidence delta: `libfile_4882ef91802881918d7b37d561c99460`. Do not assume evidence archives are present merely from Source.
- Original B53 local `MANIFEST.json` and local-source `controller/state/continuity/*` are source/proof lineage. Do not rewrite them to assert independent approval.

## Portable local layout (suggestion, not an imposed installation location)
```
<CEP_HOME>/
  repo/                      # git checkout, Codex opens here
  data/original-archives/     # immutable sqlite backup/snapshot
  data/operational/          # one current writable CEP SQLite, provider-bound
  data/backups/              # SQLite-supported consistent backups
  cache/toolchains/          # existing Node/Python/compilers
  cache/npm/                 # dependencies and package tarballs, reused
  cache/browsers/            # Playwright/Chromium if already present
  cache/runtime/             # admitted runtime assets, only when needed
  cache/inputs/              # source/checkpoint archives and manifests
  cache/evidence/            # matched-state visual/DOM/provider receipts
  checkpoints/local/         # unpublished checkpoints; never auto-upload
  handoffs/local/            # exact manifests/pending owner decisions
```

Use a user-selected CEP_HOME; do not infer an existing Windows path. Prefer a read-only index of SHA-256, local path, origin, epoch, version, and reuse validity over copying large datasets. Keep one private operational SQLite. Ignore WAL/SHM in Git; database backups must be transactionally consistent.

## One-time B53 import into branch

1. On the Owner's Windows PC clone this branch to a **fresh and clean** directory. The initial Git branch may still contain old tracked files from `main`; it must not be treated as B53.
2. Obtain/download the one-time offline bootstrap package (B53 full SOURCE + A48 SQLite + exact source manifest + import/verification script) supplied as a separate local file. Verify SHA-256 and review its file list.
3. Run the local import script while no other Writer has the same operational SQLite lease; it must verify B53/A48 bytes, preserve current data, remove only explicitly obsolete Git tracked files from a CLEAN checkout, import B53 source at repository root, and stage for review. No automatic commit/push/network or runtime installation.
4. User reviews the staged changes, then optionally commits locally. Only Owner explicitly orders remote push to publish the initialized B53 branch. This authorization is not implied by merely running the import.
5. Codex inventories installed tools/caches before proposing a minimal missing-only setup. Do not run generic `npm ci` unless local dependencies are actually absent or incompatible. Read package.json and current runtime profile.

## Each future Windows ⇄ Cloud handoff

1. Finish an actual local checkpoint/SQLite online backup as needed; record Git HEAD, source SHA/member count, data SHA/epoch/schema/integrity/FK and previous parent, evidence inventory/receipts, acknowledged vs unapproved artifacts, and exact next action.
2. Default all files LOCAL_ONLY. Present a *publish plan* with targets (GitHub, Library or Drive), file/byte deltas, privacy classification, hashes, and any cross-environment conflicts. Wait for explicit Owner approval before any upload.
3. On approval, publish the approved Source commit(s)/delta only to GitHub, optional private data checkpoint to the approved destination, and only new/invalidated evidence. Keep large cached unchanged proofs locally and reference previous custody.
4. Cloud resumes from the highest authorized verified source+data epoch and required proof custody; reconcile SQLite branches by record versions/keys/FKs, not by copying a stale whole database over a newer one. Cloud and local may work on isolated branches but cannot both be sole mutating owners of the same canonical data epoch.
5. Returning to Windows, fetch only the Owner-approved new source/data/evidence lineage, preserve uncommitted work and any newer operational database, reuse hashes/cache, and resume selectively.

## Important separation
The Git branch carries Source code and its authorized seed/checkpoint reference, not necessarily all evidence or the latest operational SQLite. Local backups may be newer than Git; Git HEAD alone is never a source of truth for data. Local git commits do not upload anything. A Git push sends new Git objects/commits instead of the entire repository each time, but re-committing a binary SQLite may transfer a large new object. No automatic snapshot commits and no automatic checkpoint upload.
