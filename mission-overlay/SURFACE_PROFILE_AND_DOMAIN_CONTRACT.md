# Manual AI Bridge — Stage-3 Surface Profile and Domain Contract

Classification: `CANDIDATE_ONLY__HARDENED_WRITER_INPUT__NOT_PRODUCT_ACCEPTANCE`

Surface: `MANUAL_AI`  
Workspace: `W05`  
Current profile: `cep-writer/references/surface-profiles/manual_ai.json`  
Profile Git blob SHA: `5e759cef962d75534b3052ac995f71931ad23230`  
Canonical visual reference: `1kfJayw9NGZvSeHLHwwRKppKnzTZid9yQ` — `OWNER_CONFIRMED_FINAL_REFERENCE`

## Identity and layout
- CENTER: `ManualProposalAdjudicationWorkbench`.
- TOP/LEFT/RIGHT/BOTTOM/TOOLBAR/TRANSIENT remain governed by the current profile and shared family owners.
- Domain commands: `manual_ai.draft`, `manual_ai.export`, `manual_ai.import`, `manual_ai.review`.
- Domain objects: `ManualProposal`, `HumanDisposition`, `DraftLink`.

## Non-negotiable truth contract
- MANUAL_ONLY / PROVIDER_NEUTRAL
- No hidden provider keys/API/polling/embeddings
- Accept creates working draft only
- Invalid provenance fails closed
- Explicit source/proposal/revision/digest and helper/sink availability; manual DraftSink boundary; accepted output remains working draft.

## State contract
`PREPARED`, `EXPORTED`, `IMPORTED`, `PROVENANCE_INVALID`, `DEFERRED`, `REJECTED`, `ACCEPTED_AS_DRAFT`, `ABSENT`, `CREATED`, `CONFLICT`, `STALE`, `UNAVAILABLE`, `ERROR`.

## Presentation contract
The Writer must implement the full Surface-specific Presentation, interaction and major-state truth in this mission. Serious design work may not be knowingly deferred to a future generic Coverage Writer. Shared owners are consumed; domain semantics stay local to this Surface.

## Authority ceiling
This contract authorizes no Product acceptance, merge, release, deployment, stack freeze, governance mutation, or self-promotion. Any exact new shared defect must emit `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` instead of creating a local fork.