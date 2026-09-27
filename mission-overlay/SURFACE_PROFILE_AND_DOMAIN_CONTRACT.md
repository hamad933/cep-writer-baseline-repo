# Releases — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `RELEASES`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/releases.json`  
Profile Git blob SHA: `38a3fffa0dc9881087fbd8e3c088d81c9ed2b7d3`  
Canonical visual reference: `1vk_AGnCeOFk1TrmyoeNkxXsWk1vOloV1` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `ReleaseGovernanceWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `releases.inspect`, `releases.compare`, `releases.plan`, `releases.requestAuthorization`.
- Domain objects: `ReleaseCandidate`, `Readiness`, `ReleaseAuthorization`, `DeploymentObservation`.

## Non-negotiable truth contract
- Exact candidate identity gates all evidence
- Technical readiness != Owner authorization
- Owner authorization != deployment execution
- Deployment observation != deployment execution
- No local AnalyticalCompare fallback
- Canonical AnalyticalCompare injection only; five release truth planes remain separate.

## State contract
`ASSEMBLED`, `TECHNICALLY_READY`, `NOT_READY`, `NONE`, `REQUESTED`, `GRANTED`, `REVOKED`, `NOT_DEPLOYED`, `IN_PROGRESS`, `DEPLOYED`, `FAILED`, `UNKNOWN`, `STALE`, `UNAVAILABLE`, `ERROR`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.