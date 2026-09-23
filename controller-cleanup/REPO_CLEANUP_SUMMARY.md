# CEP Zero-Loss Repository Cleanup Census

- Baseline: `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a`
- Tracked files inventoried: **1541**
- Total bytes: **80,934,808**
- Duplicate SHA groups: **252**
- Stale Writer-packet files requiring replacement before pruning: **26**
- Archive candidates (NOT deletion-authorized): **19**

## Classification totals

| Classification | Files | Bytes |
|---|---:|---:|
| ARCHIVE_CANDIDATE_HISTORICAL_ASSURANCE | 9 | 95,890 |
| ARCHIVE_CANDIDATE_WRITER_OUTPUT | 10 | 34,918 |
| KEEP_ACTIVE_REFERENCED_ASSURANCE | 360 | 13,139,743 |
| KEEP_CORE_BUILD_TEST | 497 | 8,936,524 |
| KEEP_OR_REVIEW_AUTOMATION | 2 | 13,234 |
| KEEP_OR_REVIEW_WRITER_PACKET | 16 | 268,665 |
| KEEP_PENDING_AUTHORITY_CURRENTITY_AUDIT | 242 | 8,466,525 |
| KEEP_PENDING_AUTHORITY_REFRESH | 5 | 113,084 |
| KEEP_PENDING_REBUILD_PROOF__GENERATED_RUNTIME | 277 | 6,589,508 |
| KEEP_REFERENCED_ARCHAEOLOGY | 6 | 1,400,775 |
| KEEP_REFERENCED_WRITER_OUTPUT | 2 | 8,292 |
| KEEP_WRITER_DOMAIN_PROFILE_REFERENCE | 29 | 577,973 |
| KEEP_WRITER_REFERENCE | 5 | 88,940 |
| KEEP_WRITER_VISUAL_REFERENCE | 28 | 40,438,816 |
| REPLACE_STALE_WRITER_PACKET__NO_DELETE_YET | 26 | 270,051 |
| REVIEW_CHECKPOINT | 9 | 9,092 |
| REVIEW_ROOT_DOCUMENT | 9 | 21,359 |
| REVIEW_ROOT_FILE | 5 | 453,967 |
| REVIEW_UNCLASSIFIED | 4 | 7,452 |

## Hard safety rules

- No file in this census is deletion-authorized by classification alone.
- Product/source/build/test/tooling and Writer reference inputs are KEEP by default.
- Historical assurance/archaeology/writer-output are ARCHIVE_CANDIDATE only until content/custody/reference review.
- Stale current Writer packet files must be replaced with exact post-C03/current-mission material before retirement.
- Generated `dist/` remains KEEP_PENDING_REBUILD_PROOF because current test tooling imports it.

## Stale Writer packet candidates

- `cep-writer/B3R_CORRECTION02_MISSION.md`
- `cep-writer/B3R_MISSION.md`
- `cep-writer/C2_MISSION.md`
- `cep-writer/C3_MISSION.md`
- `cep-writer/CANONICAL_MISSION_SOURCE.md`
- `cep-writer/CAPSULE_BINDING.json`
- `cep-writer/CAPSULE_READY.json`
- `cep-writer/CAPSULE_VISUAL_BOOTSTRAP.json`
- `cep-writer/CURRENT_MISSION.md`
- `cep-writer/EXTERNAL_OUTPUT_CUSTODY.json`
- `cep-writer/GIT_WORKFLOW.md`
- `cep-writer/GOOGLE_AI_STUDIO_ENTRY_PROMPT.md`
- `cep-writer/KNOWN_OPEN_GATES.md`
- `cep-writer/PARENT_IDENTITY.json`
- `cep-writer/PROTECTED_TRUTHS.md`
- `cep-writer/REPOSITORY_MANIFEST.json`
- `cep-writer/START_HERE.md`
- `cep-writer/TASK_BINDING.json`
- `cep-writer/TASK_PACKET_OVERLAY.md`
- `cep-writer/WRITER_AUTHORITY_BASELINE.md`
- `cep-writer/WRITER_INPUT_MANIFEST.json`
- `cep-writer/controller-input/B3R_CONTROLLER_CORR01_AND_CORRECTION02_BINDING.md`
- `cep-writer/controller-input/C1_CONTROLLER_ACCEPTANCE.md`
- `cep-writer/controller-input/C2_CONTROLLER_ACCEPTANCE.md`
- `cep-writer/controller-input/C3_CONTROLLER_ACCEPTANCE.md`
- `cep-writer/controller-input/CORR02_PRE_WRITER_DEEP_DEFECT_AUDIT.md`
