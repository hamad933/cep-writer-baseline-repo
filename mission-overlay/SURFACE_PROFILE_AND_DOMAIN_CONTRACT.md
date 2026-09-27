# Validation — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `VALIDATION`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/validation.json`  
Profile Git blob SHA: `f831e7bc9f475cddc1b693d43fccb896f8a1aeaa`  
Canonical visual reference: `1WNirNMPW0tyoRk9IcJSjTYNlN_hhrGcb` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `TechnicalValidationWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `validation.validate`, `validation.inspect`, `validation.findings`.
- Domain objects: `ValidationRequest`, `ValidationResult`, `TechnicalFinding`.

## Non-negotiable truth contract
- Technical validity is not admission/review/mastery
- Validation findings are not formal Review Findings
- Missing validator is UNAVAILABLE, never PASS
- Immutable ValidationResult provenance; TechnicalFinding never becomes Review/Mastery/Evidence acceptance.

## State contract
`NOT_RUN`, `QUEUED`, `RUNNING`, `TECHNICALLY_VALID`, `TECHNICALLY_INVALID`, `ERROR`, `UNAVAILABLE`, `STALE`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.