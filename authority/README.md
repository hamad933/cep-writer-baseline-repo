# Root authority/ directory - classification and Writer use

This directory is a mixed CEP authority/traceability corpus retained because current build/test contracts and exact historical/current lookups still consume parts of it.

It is NOT the default Writer authority packet and must never be blanket-read as if every file were equally current or normative.

## Default Writer authority

Start from `cep-writer/START_HERE.md` and the curated Writer-facing files under `cep-writer/`.

For Owner decisions, use the Writer snapshot named by the current mission, normally `cep-writer/authority/WRITER_OWNER_DECISIONS.csv` on `main` or the mission-specific decision snapshot on a mission branch.

For Surface work, read the exact local SurfaceProfile, applicable domain/oracle documents, the 23-Surface identity/reference matrix, the visual-reference register, and the actual governed reference image binaries.

## When to read files in root authority/

Read an exact file here only when at least one of these is true:
- the current mission names it;
- the curated Writer packet points to it;
- an applicable contract/profile requires it;
- an existing build/test/verifier consumes it;
- exact provenance or supersession must be inspected.

Do not infer authority from filename, folder placement, recency, or the word CURRENT alone.

## Precedence

Latest explicit Owner decision and live Controller state are resolved by the Controller before Writer launch. The repository contains a bounded Writer execution snapshot, not live Controller governance.

Historical/current-governance sources may provide durable knowledge, exact facts, methods or scoped rules, but they do not auto-promote old Product architecture, stack paths, or candidate status into current implementation authority.

Writers must not edit this directory unless the exact mission explicitly authorizes a bounded path.
