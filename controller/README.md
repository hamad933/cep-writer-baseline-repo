# NEW CEP CONTROLLER — CONTROL AREA (v1, 2026-09-29)

**Class:** `CONTROLLER_FOUNDATION__NEW_CONTROLLER_BOOTSTRAP`
**Operator:** NEW CEP Controller (OpenCode / MiMo runtime, Codespace `refactored-space-umbrella-gx9xwww664297rw`)
**Final stop gate:** `11_gates/PRE_WRITER_DISPATCH_GATE.md` — currently **BLOCKED**, Writer dispatch forbidden.

## Why this directory exists

Mission section 33 requires a dedicated Controller control area that does not corrupt Product
structure. No top-level `controller/` existed in this repository; the old control corpus lives in
`authority/` (protected historical material — mission section 12: evidence only, never adopted as
current operating authority). This tree is therefore the NEW Controller's own foundation.

**Mutations:** this tree is the only thing created by the bootstrap mission. No Product source,
contract, evidence receipt, or historical file was modified. Nothing is committed or pushed.

## Authority model (domain-aware, mission section 2)

| Level | Class | Applied to |
|---|---|---|
| A | CURRENT_OWNER_DIRECTIVE | This mission's directives; Owner hard rules recovered in `03_historical/` |
| B | CURRENT_VALIDATED_EXECUTABLE_STATE | `hamad933/cep-writer-baseline-repo`, branch `writer/cep-serial` @ `48fec276` |
| C | CURRENT_VERIFIED_EVIDENCE | Live verification results in `00_bootstrap/`, `02_current_truth/` |
| D | RECONCILED_DRIVE_MATERIAL | Drive `cep_building_mgm` + zero-loss index (cached, provenance retained) |
| E | HISTORICAL_PROJECT_CORPORA | Legacy MiMo archive, successor archive, historical repo line |
| F | CANDIDATE / UNVERIFIED | Anything not yet re-verified in this environment |

A lower level never overrides a higher level. Historical material is preserved as evidence, never
silently promoted (mission sections 36-37).

## Layout

```
controller/
  00_bootstrap/     runtime, credentials, github, drive status (secret-safe)
  01_sources/       source inventory, classification, retrieval manifest
  02_current_truth/ codebase map, route/test/runtime census, truth reconstruction
  03_historical/    corpus indexes, knowledge/decision ledgers, conflict + supersession registers
  04_rcf/           Real Consumer vs Fixture recovery register + coverage state
  05_foundation/    capability matrix + shared mechanics ownership state
  06_workspaces/    W01-W05 reconstruction packages
  07_browser/       browser review contract, failure taxonomy, oracle model
  08_evidence/      evidence contract, lineage, checkpoint model
  09_writer_forge/  Writer packets (NOT_CREATED — gate blocked)
  10_dispatch/      dependency / parallelism / merge-risk plan
  11_gates/         bootstrap, reconstruction, browser, PRE_WRITER_DISPATCH_GATE
```

## Status vocabulary (mission section 40)

`PASS` · `PASS_WITH_LIMITATION` · `BLOCKED` · `UNKNOWN` · `NOT_STARTED`

Every claim in this tree is bound to the evidence stream named in its file. Nothing here creates
Product acceptance, release, or Writer dispatch authority.
