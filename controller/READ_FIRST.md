# CEP — READ FIRST

**Role:** transition-aware Controller bootstrap index  
**Current classification:** `PRE_CUTOVER_MIRROR__NON_AUTHORITATIVE_GITHUB_CONTROLLER_PLANE`

## 0. First read
Read `controller/authority/AUTHORITY_STATUS.json` before treating any repository control file as authority.

### While status is `PRE_CUTOVER_MIRROR`
Google Drive remains the live Controller authority. GitHub `controller/**` is a candidate mirror/control-plane convergence target only.

Mandatory live reads:
1. Drive READ_FIRST `1r6XU0zhlAjdrK3OrzkXzHLA2WknWip6h`
2. Drive CURRENT_STATE `164CDevKZ48ZAXke44oL3jXIVpYQJBmRu`
3. Drive CONTROLLER_GOVERNANCE `1xZSIBmNWcc6DtWuQ30R_5uHLg7AT9hB_`
4. Drive OWNER_DECISION_LIVE_REGISTER `1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh`
5. exact mission/profile/intake/owner-lock/oracle/evidence required by the task.

### Only after an explicit recorded cutover changes status to `GITHUB_CANONICAL`
The canonical mutable Controller plane becomes:
- `controller/READ_FIRST.md`
- `controller/state/CURRENT_STATE.md`
- `controller/CONTROLLER_GOVERNANCE.md`
- `controller/authority/OWNER_DECISION_LIVE_REGISTER.csv`
- `controller/authority/EXECUTION_CARRIER_ROUTE_AUTHORITY.md`

After that event Google Drive is a compatibility/bootstrap pointer plus history/evidence custody, not a second mutable authority, per `OD-20261002-086`.

## Recovery invariant
Always fetch the real remote branch first. Never infer current truth from a checkpoint filename, stored SHA, timestamp, Writer PASS, screenshot, handoff, or chat memory.

Current convergence basis before this control-plane commit:
- repository: `hamad933/cep-writer-baseline-repo`
- branch: `writer/mi-serial`
- observed HEAD: `d5d7588fbd6445a66cdb7d57e0cc48e619591361`
- observed tree: `faa2c73c42e4acb015449fae4cc9987c6ee9402a`

## Current execution topology
`OD-20260928-085` is ACTIVE for `ROUTE-MIMO-AGENT`: exactly one persistent sequential Writer on `writer/mi-serial`, milestones W01→W05, Controller inline audit. Historical per-Surface parallel-wave and Writer Priority Matrix material is dependency/seam/history evidence only.

## Authority and truth ceilings
`latest explicit Owner decision → CURRENT_STATE → exact Controller-accepted source/evidence → live Owner decisions/locks → mission/profile/intake → governed oracle/donor → classified history → chat memory`.

Keep CONTENT, PRESENTATION, BEHAVIOR/INTERACTION/FUNCTIONALITY, and DOMAIN/DATA/PROVIDER truth separate. Writer PASS, green tests and screenshots never create acceptance.

## Control-plane boundary
- `controller/**`: future canonical Controller plane under convergence.
- `cep-writer/**`: derived Writer execution-input plane only.
- Product source remains separate from governance/control convergence.
- H03 route-level propagation remains `NOT_PROVEN` unless separately proven.
- Stack remains `STACK_NOT_FROZEN`.

## Current phase
`CONTROLLER_ZERO_LOSS_CONVERGENCE`
