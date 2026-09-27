# Audit — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `AUDIT`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/audit.json`  
Profile Git blob SHA: `945a7a8b82f650751184cc5d0ab21de2168a5bdf`  
Canonical visual reference: `1YEnx_rg8o9qfNxEG5gcEVY33HAn2em-m` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `AuditTraceWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `audit.search`, `audit.verify`, `audit.annotate`.
- Domain objects: `AuditEvent`, `IntegrityResult`, `AuditInspection`.

## Non-negotiable truth contract
- AuditEvent identity/provenance is durable and append-only at application boundary
- Hash chain is integrity evidence, not encryption
- Application append-only claim is not DB-enforced immutability proof
- Annotations are separate from AuditEvent
- Canonical Audit/Provenance core remains sole provenance authority; no fake reviewer or mutation authority.

## State contract
`NOT_CHECKED`, `VALID_CHAIN`, `INVALID_CHAIN`, `VERIFICATION_ERROR`, `COMPLETE_OBSERVED`, `PARTIAL_OBSERVED`, `UNKNOWN`, `EMPTY`, `STALE`, `UNAVAILABLE`, `ERROR`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.