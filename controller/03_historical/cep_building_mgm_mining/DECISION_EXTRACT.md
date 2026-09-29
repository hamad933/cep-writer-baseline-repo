# DECISION_EXTRACT.md — recovered decisions from `cep_building_mgm`

**Companion machine-readable file:** `DECISION_EXTRACT.csv` — **118 rows**, columns `id,date,source_file,source_id,decision,status,current_implication`. The CSV is the authoritative full extract (verbatim decision text incl. register ID, family, scope, supersessions, notes). This file is the structured human summary and index.

**Status vocabulary:** CURRENT_OWNER_DIRECTIVE | CURRENT_VALIDATED | HISTORICAL_VALID | HISTORICALLY_USEFUL_BUT_SUPERSEDED | CONDITIONAL | CONFLICTED | REJECTED | UNKNOWN
**Item class:** all rows here are `decision`.

## Source provenance

| Source | Drive ID | Rows recovered |
|---|---|---|
| OWNER_DECISION_LIVE_REGISTER.csv (111 rows, 2026-09-10 → 2026-09-28) | 1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh | CBM-D-001 … CBM-D-111 |
| CEP_PRD_001_A01 (CEP-DEC-023, approved 2026-08-13) | 1bTmKuLGWJ9JnLmEkP0a5E1_M2p1cGaoV | CBM-D-112 |
| CEP_PRD_001_A02 (CEP-DEC-025, approved 2026-08-14) | 1Ic0PJR88E7154PFAZcN4p8KIi_e6ayi7 | CBM-D-113 |
| CEP_PRD_001_A03 (CEP-DEC-026, approved 2026-08-14) | 1Nx4EiArDnO6D6Fx-SoDxbw6OwWUvBuyn | CBM-D-114 |
| CEP_VIS_001_FINAL (CEP-DEC-027, approved 2026-08-14) | 1hhnXSpT3usVGjiR9OtkxtMxWFxy41CE_ | CBM-D-115 |
| CURRENT_STATE.md Owner clarifications (2026-09-27/28) | 164CDevKZ48ZAXke44oL3jXIVpYQJBmRu | CBM-D-116 … CBM-D-118 |

Register ID ranges: `OWNER-20260910-001..020` (CBM-D-001..020) · `OE-001..005` (021..025) · `OD-20260914-001..037` (026..062) · `OD-20260915-038/039/041` (063..065) · `OD-20260916-042..045` (066..069) · `OD-20260917-046..053` (070..077) · `OD-20260918-054..057` (078..081) · `OD-20260920-058..060` (082..084) · `OD-20260921-061..071` (085..095) · `OD-20260922-072..079` (096..103) · `OD-20260924-080..082` (104..106) · `OD-20260925-083/084` (107..108) · `OD-20260928-085` (111 region; see CSV).

> Index note: register row `index=66` is present in the CSV (OD-20260915-040 gap in numbering belongs to the source; no row was dropped — 111 data rows recovered from 112 physical lines incl. header).

## A. Portfolio-wide product & design decisions (CBM-D-001…020, 112…115) — CURRENT_VALIDATED / CURRENT_OWNER_DIRECTIVE

| ID | Date | Source ID | Decision (condensed) | Status | Current implication |
|---|---|---|---|---|---|
| CBM-D-001 | 2026-09-10 | 1GF70xX… | Customization is a general CEP principle; safe presentation/workspace settings customizable | CURRENT_OWNER_DIRECTIVE | Design-for-configurability; not a language-only exception |
| CBM-D-002 | 2026-09-10 | 1GF70xX… | Defaults are starting values, not immutable law (safety/domain exceptions) | CURRENT_OWNER_DIRECTIVE | Do not hard-code defaults as product law |
| CBM-D-003 | 2026-09-10 | 1GF70xX… | Library Editor v1.2.17 = accepted executable design donor; mine compatible mechanics directly | CURRENT_OWNER_DIRECTIVE | Donor-mining source of truth for editor mechanics |
| CBM-D-004 | 2026-09-10 | 1GF70xX… | Non-Library blueprints are requirement/value/evidence inputs only until explicit design acceptance | CURRENT_OWNER_DIRECTIVE | Visualize/W03 blueprints ≠ accepted design |
| CBM-D-005 | 2026-09-10 | 1GF70xX… | Foundation reuse-first across all 23 surfaces (global foundation + family engines + thin adapters) | CURRENT_OWNER_DIRECTIVE | Core architecture law |
| CBM-D-006/007 | 2026-09-10 | 1GF70xX… | Editor mechanics → reusable primitives (Learn + compatible authoring); spatial mechanics → one engine + adapters | CURRENT_OWNER_DIRECTIVE | No per-surface editor/spatial forks |
| CBM-D-008 | 2026-09-10 | 1GF70xX… | Authority intake hardening: read canonical authority/supersession before raw candidates | CURRENT_OWNER_DIRECTIVE | Intake discipline for all future work |
| CBM-D-009 | 2026-09-10 | 1GF70xX… | Micro-supersession allowed: preserve donor value, apply exact newer corrections only to affected mechanics | CURRENT_OWNER_DIRECTIVE | No whole-donor rejection for one fix |
| CBM-D-010 | 2026-09-10 | 1GF70xX… | Shell/navigation visual composition REOPENED; not accepted as final | CURRENT_OWNER_DIRECTIVE | Shell visuals may be redesigned; do not freeze |
| CBM-D-011…014 | 2026-09-10 | 1GF70xX… | Universal layout/slot constitution; pane-system unification; toolbar template unification; action-surface reuse | CURRENT_OWNER_DIRECTIVE | Shared layout grammar; domain actions bind into slots |
| CBM-D-015 | 2026-09-10 | 1GF70xX… | Multi-route reversibility; persistent panes must not vanish on focus loss | CURRENT_OWNER_DIRECTIVE | UX dismissal/exit rules |
| CBM-D-016 | 2026-09-10 | 1GF70xX… | Learn = Library-grade workbench + learning additions; old no-authoring CENTER restriction forbidden | CURRENT_OWNER_DIRECTIVE | Learn authoring capability is required |
| CBM-D-017 | 2026-09-10 | 1GF70xX… | W03 default runtime = InternalSimulationAdapter; real shells/PTY not default W03 requirements | CURRENT_OWNER_DIRECTIVE | Simulation-first (cf. CBM-D-074 terminal law) |
| CBM-D-018 | 2026-09-10 | 1GF70xX… | Technology must earn admission (Vue/TS/Vite/Flow/Electron/Tauri/Python/SQLite/xterm are candidates only) | CURRENT_OWNER_DIRECTIVE | No stack freeze by inertia |
| CBM-D-019/020 | 2026-09-10 | 1GF70xX… | Foundation outputs must be executable + machine-readable contracts/tests; minimize Writer discretion | CURRENT_OWNER_DIRECTIVE | Contracts constrain future writers |
| CBM-D-112 | 2026-08-13 | 1bTmKuLGWJ9J… | A01: five global destinations; Library\|Learn\|Visualize\|RQ; canonical-object/projection law; unified editor; Result≠Evidence, Completion≠Mastery | CURRENT_VALIDATED | Approved IA baseline (oracle input) |
| CBM-D-113 | 2026-08-14 | 1Ic0PJR88E71… | A02: exactly 5 S&E areas; Operations = Run mode; Internal High-Fidelity Simulation only in V1; Twin→Baseline→Run→Snapshot; sealed Run Results | CURRENT_VALIDATED | Approved W03 domain law |
| CBM-D-114 | 2026-08-14 | 1Nx4EiArDnO6… | A03: P&E = Evidence/Reviews/Mastery/Portfolio; Candidate lifecycle; 3-dimension evidence state; Mastery≠Freshness | CURRENT_VALIDATED | Approved W04 domain law |
| CBM-D-115 | 2026-08-14 | 1hhnXSpT3usV… | CEP-VIS-001-FINAL: one information item→one display location; TOP/LEFT/CENTER/RIGHT/BOTTOM role contract; Arabic-first dark shell | CURRENT_VALIDATED | Durable UX/IA oracle |

## B. Governance & custody decisions (CBM-D-026…045, 053…062 region) — mostly HISTORICAL_VALID under the new regime

| ID | Register ID | Decision (condensed) | Status | Current implication |
|---|---|---|---|---|
| CBM-D-031 | OD-20260914-006 | Mandatory review chain: Writer→Independent Audit→source/scope→Browser/Runtime→Owner-Decisions→Reuse→Data/Provider→Regression→Acceptance | CURRENT_OWNER_DIRECTIVE | Portable acceptance logic — adopt in new controller review flow |
| CBM-D-032 | OD-20260914-007 | Owner-decision zero loss: every decision gets explicit disposition; chats may never erase decisions | CURRENT_OWNER_DIRECTIVE | Basis of this mining effort |
| CBM-D-034/035 | OD-20260914-009/010 | Per-response live refresh; content-aware governance census (never infer value from filenames) | CURRENT_OWNER_DIRECTIVE | Operating discipline |
| CBM-D-036 | OD-20260914-011 | Durable value from historical state must be distilled without becoming current authority | CURRENT_OWNER_DIRECTIVE | Justifies this extract's classification scheme |
| CBM-D-039 | OD-20260914-014 | `/Google Drive/cep_building_mgm` is the durable governance workspace | HISTORICAL_VALID | Superseded by repo-based controller (see RECONCILIATION_NOTES §2) |
| CBM-D-040 | OD-20260914-015 | Single live `CURRENT_STATE.md` updated in place; versioned CURRENT_CONTROL files = historical lineage | HISTORICAL_VALID | Old live-state model |
| CBM-D-055/056 | OD-20260914-030/031 | Drive is sole live governance root; File Library CEP paths retired | HISTORICAL_VALID | Conflicts with current repo authority — provenance only |
| CBM-D-057 | OD-20260914-032 | Library-era absolute paths in immutable evidence are provenance only; never rewritten, never launch authority | CURRENT_OWNER_DIRECTIVE | Path-provenance law — directly applicable |
| CBM-D-059 | OD-20260914-034 | Supporting registries/censuses/manifests never create authority | CURRENT_OWNER_DIRECTIVE | Applies to GOVERNANCE_CONTENT_CENSUS etc. |
| CBM-D-061 | OD-20260914-036 | Explicit launch admission only: no historical packet is launchable because it exists or self-authorizes | CURRENT_OWNER_DIRECTIVE | Applies to all archive contents |
| CBM-D-062 | OD-20260914-037 | Isolated Writer candidates; sequential acceptance of overlapping/shared-hotspot work via rebase/replay | CURRENT_OWNER_DIRECTIVE | Execution-safety law |
| CBM-D-066 | OD-20260916-042 | Heavy-chat resumable checkpoint on Owner request (source-bound continuity package) | CURRENT_OWNER_DIRECTIVE | Checkpoint protocol = continuity transport only |
| CBM-D-070 | OD-20260916-044 | Bounded Controller correction authority (exact reproduced defect, minimal fix, existing owner) | CURRENT_OWNER_DIRECTIVE | Throughput tool, not feature authority |
| CBM-D-071 | OD-20260916-045 | Technical source-resolution zero-loss: resolve current authority → durable technical reference → lessons ledger → accepted source | CURRENT_OWNER_DIRECTIVE | Governs runtime/persistence questions |
| CBM-D-103 | OD-20260922-079 | Owner-input classification + decision-register anti-inflation (DURABILITY/ROUTING/EXISTING_AUTHORITY tests) | CURRENT_OWNER_DIRECTIVE | Explains why Owner clarifications CBM-D-116..118 are NOT new OD rows |

## C. Presentation / acceptance decisions (CBM-D-043…052, 078…081)

| ID | Register ID | Decision (condensed) | Status | Current implication |
|---|---|---|---|---|
| CBM-D-043 | OD-20260914-019 | Owner visual rejection voids lower Writer/Auditor Presentation PASS | CURRENT_OWNER_DIRECTIVE | Owner verdict outranks worker tokens |
| CBM-D-044 | OD-20260914-020 | Fixtures never satisfy real-consumer reuse/parity proof | CURRENT_OWNER_DIRECTIVE | Real-consumer gate |
| CBM-D-045 | OD-20260914-021 | Extraction ≠ parallel reimplementation | CURRENT_OWNER_DIRECTIVE | Donor work = extract/refactor/rebind |
| CBM-D-046 | OD-20260914-022 | Donor quality floor hard-fail: materially weaker presentation blocks acceptance | CURRENT_OWNER_DIRECTIVE | Quality floor law |
| CBM-D-048 | OD-20260914-024 | State/viewport-matched component proof (1440 & ~1024) | CURRENT_OWNER_DIRECTIVE | Visual acceptance method |
| CBM-D-049 | OD-20260914-025 | Any unresolved BLOCKING/weaker/thin/unproven finding forbids PASS | CURRENT_OWNER_DIRECTIVE | No PASS-with-blockers |
| CBM-D-050 | OD-20260914-026 | E19 Presentation candidates REJECTED by Owner visual review; no Lane F convergence | REJECTED | E19 must never be promoted (salvage subordinate value only) |
| CBM-D-051 | OD-20260914-027 | Owner-visible evidence sheet required before Presentation acceptance | CURRENT_OWNER_DIRECTIVE | No hidden-ZIP-only evidence |
| CBM-D-052 | OD-20260914-028 | Worst unresolved finding controls the verdict | CURRENT_OWNER_DIRECTIVE | Aggregation law |
| CBM-D-078…081 | OD-20260918-054…057 | Insertion-gap donor interaction restored (OD-054); Surface identity/functionality completeness rescue gate (OD-055); W03 workspace-first no-universal-Read/Edit (OD-056); balanced specialist + coverage execution (OD-057) | CURRENT_OWNER_DIRECTIVE | OD-055/056 are the surface-identity constitution |

## D. Stack / runtime / platform decisions (CBM-D-070…077, 082…084)

| ID | Register ID | Decision (condensed) | Status | Current implication |
|---|---|---|---|---|
| CBM-D-072 | OD-20260917-047 | Narrow Win32 sidecar behind PlatformWindowCapability / PlatformInputDirectionCapability; no Electron/Tauri/second runtime | CURRENT_OWNER_DIRECTIVE | Platform implementation target |
| CBM-D-074 | OD-20260917-049 | xterm.js = canonical terminal renderer for simulation + real PTY/ConPTY + playback; no CEP command allowlist; one Windows PTY/ConPTY provider required pre-stack-freeze | CURRENT_OWNER_DIRECTIVE | Terminal architecture |
| CBM-D-075 | OD-20260917-050 | Security hardening is non-blocking for this personal/local product | CURRENT_OWNER_DIRECTIVE | Security research must not gate features |
| CBM-D-084 | OD-20260920-060 | Stack expansion lock: Node.js/TS + browser-native UI + node:http + node:sqlite + xterm + narrow C++17 Win32 sidecar baseline; STACK_NOT_FROZEN | CURRENT_OWNER_DIRECTIVE | Matches current repo stack |
| CBM-D-082 | OD-20260920-058 | Available-toolchain visual capture + bounded Controller correction (superseded duplicate) | HISTORICALLY_USEFUL_BUT_SUPERSEDED | Read successor OD-20260922-072 |

## E. Writer execution / repository / carrier decisions (CBM-D-085…111)

| ID | Register ID | Decision (condensed) | Status | Current implication |
|---|---|---|---|---|
| CBM-D-088 | OD-20260921-062 | Lean self-contained Writer repository: exact Product parent + distilled task packet; NOT live Controller state | CURRENT_OWNER_DIRECTIVE | Repo-content law |
| CBM-D-089 | OD-20260921-063 | Use existing `hamad933/cep-writer-baseline-repo` (branch main then) for Presentation CORR02 bootstrap | HISTORICAL_VALID | Provenance of the current repo |
| CBM-D-091 | OD-20260921-065 | Repository stays PUBLIC intentionally | CURRENT_OWNER_DIRECTIVE | No secret material in repo |
| CBM-D-092 | OD-20260921-066 | `main` = Controller-bound baseline; mission-bound candidate branches per mission | CURRENT_OWNER_DIRECTIVE | Branch workflow law |
| CBM-D-093 | OD-20260921-067 | Writer-complete main + mission overlay with Controller-pre-resolved exact read set | CURRENT_OWNER_DIRECTIVE | Packet design law |
| CBM-D-097 | OD-20260921-071 | Owner authorization exclusivity: an Owner instruction to prepare named work authorizes launch once prerequisites hold | CURRENT_OWNER_DIRECTIVE | No second invented permission gate |
| CBM-D-098/099 | OD-20260922-072/073 | Visual capability separation + local-render recovery; local-first iterative improvement over connector transport | CURRENT_OWNER_DIRECTIVE | Visual evidence + workflow law |
| CBM-D-100/101 | OD-20260922-074/075 | Self-contained Writer Workspace Capsule v1 default inbound path; capsule preparation is Controller's job | CURRENT_OWNER_DIRECTIVE | Capsule method |
| CBM-D-102 | OD-20260922-076 | Verified incremental continuation after salvageable correction base (don't repackage the world) | CURRENT_OWNER_DIRECTIVE | Continuation path A/B/C |
| CBM-D-103 | OD-20260922-077 | Zero-loss direct-successor Controller handoff; handoff never outranks live authority | CURRENT_OWNER_DIRECTIVE | Succession law |
| CBM-D-104 | OD-20260924-080 | Single persistent Writer serial branch `writer/cep-serial` from exact main | CURRENT_OWNER_DIRECTIVE | **Exact branch the current repo sits on** |
| CBM-D-105 | OD-20260924-081 | Execution-carrier route isolation: mission scope ⊥ carrier topology | CURRENT_OWNER_DIRECTIVE | Carrier separation law |
| CBM-D-107 | OD-20260925-083 | ROUTE-LOCAL remote push default-deny; local commits/checkpoints allowed | CURRENT_OWNER_DIRECTIVE | Explains no-push expectation |
| CBM-D-111 | OD-20260928-085 | ROUTE-MIMO-AGENT admitted: agentic agent-chat carrier (Controller chat + exactly one Writer chat), single serial Writer + inline Controller audit | CURRENT_OWNER_DIRECTIVE | **Current operating topology of the NEW CEP Controller** |
| CBM-D-116 | 2026-09-27 | Owner: all Writer results already uploaded; six surfaces = NO_DURABLE_RESULT; recovery wait closed | HISTORICAL_VALID | Status truth of the 2026-09-27 wave |
| CBM-D-117 | 2026-09-27 | Owner: next wave must be obligations-first (full ZERO_LOSS_OBLIGATION_MATRIX), not defect-list-driven | CURRENT_OWNER_DIRECTIVE | Directly shapes future writer missions |
| CBM-D-118 | 2026-09-28 | Execution carrier rebind to ROUTE-MIMO-AGENT + serial 5-milestone plan | CURRENT_OWNER_DIRECTIVE | Current carrier context |

## Status counts (all 118 rows)

| Status | Count |
|---|---|
| CURRENT_OWNER_DIRECTIVE | 96 |
| CURRENT_VALIDATED | 4 |
| HISTORICAL_VALID | 8 |
| HISTORICALLY_USEFUL_BUT_SUPERSEDED | 4 |
| CONDITIONAL | 5 |
| REJECTED | 1 |
| CONFLICTED / UNKNOWN | 0 |

(Register rows marked `SUPERSEDED_DUPLICATE`: OD-20260915-001, OD-20260915-002, OD-20260920-058, OD-20260925-084. Register rows marked `COMPLETED_TASK_SPECIFIC_NON_DURABLE`: OD-20260921-061, -063, -064, OD-20260922-078. Rows `ACTIVE_PLATFORM_GATED`: OWNER-20260910 equivalents OE-001, OE-004 + platform-gated sub-laws.)
