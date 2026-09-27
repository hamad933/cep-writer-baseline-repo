# Backup & Restore — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `BACKUP`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/backup.json`  
Profile Git blob SHA: `dde69eba37cbada12bbcfa4ad10af2b599acedec`  
Canonical visual reference: `1X2OS6L_4A46qL6tQ2WvKWOMbLpPtSa6z` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `RecoverySafetyWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `backup.plan`, `backup.preview`, `backup.stage`, `backup.drill`, `backup.activationRequest`.
- Domain objects: `BackupPackage`, `RestorePlan`, `RestoreDrill`, `ActivationRequest`.

## Non-negotiable truth contract
- Package/plan/preview/stage/drill/provider receipt remain distinct
- Drill targets true-empty isolated environment
- Verify/stage/drill never mean live restored
- Integrity protection is not encryption
- AUTOSAVE != EXPLICIT SAVE != RECOVERY
- No fake restore success; activation remains separate authority; provider receipt cannot be synthesized.

## State contract
`CREATING`, `CREATED`, `VERIFIED`, `INVALID`, `PLANNED`, `PREFLIGHT_BLOCKED`, `STAGED`, `SCHEMA_BLOCKED`, `DRILLING`, `FAILED`, `NOT_REQUESTED`, `AUTHORITY_PENDING`, `ABANDONED`, `UNAVAILABLE`, `ERROR`, `STALE`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.