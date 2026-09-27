# Configuration — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `CONFIGURATION`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/configuration.json`  
Profile Git blob SHA: `9b0c616a15b210ed8bc1010fcd3333c07a2b61b8`  
Canonical visual reference: `14j2lNC_rDe9m3zHrHH5JYPB9mN4uI5CX` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `OperationalConfigInspectionWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `configuration.edit`, `configuration.diff`, `configuration.validate`, `configuration.reset`, `configuration.requestApply`.
- Domain objects: `ConfigObservation`, `ConfigProposal`, `ConfigAuthority`.

## Non-negotiable truth contract
- Operational Configuration != Global Settings
- UI preferences never modify operational configuration
- Present value is not approved value
- Validate does not apply
- Reset discards proposal/reveals present value; never factory-reset production
- No fake provider persistence
- Operational provider/config truth with truthful lifecycle; Configuration owns W05 presentation seam but not sibling domain semantics.

## State contract
`AVAILABLE`, `STALE`, `UNAVAILABLE`, `ERROR`, `DRAFT`, `VALIDATED`, `INVALID`, `AUTHORITY_PENDING`, `NOT_APPLIED`, `APPLY_REQUESTED`, `APPLIED`, `RESTART_REQUIRED`, `PROCESSING`, `SUCCESS`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.