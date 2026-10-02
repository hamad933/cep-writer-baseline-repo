# WRITER OWNER-DECISION APPLICABILITY — CURRENT GAP RECONCILIATION

**Basis:** canonical GitHub register 113 rows = 102 ACTIVE + 2 ACTIVE_PLATFORM_GATED + 5 COMPLETED_TASK_SPECIFIC_NON_DURABLE + 4 SUPERSEDED_DUPLICATE.  
**Writer projection:** 91 active/platform rows (all ACTIVE/PLATFORM; every non-ACTIVE row excluded).  
**Rule:** Writer projection contains only decisions materially applicable to Writer execution; Controller-only and route-local decisions remain in the canonical Controller register and are not duplicated merely to close a numeric gap.

| decision | disposition for Writer plane | reason |
|---|---|---|
| OD-20260914-015 | EXCLUDE_CONTROLLER_ONLY | single live CURRENT_STATE custody law |
| OD-20260914-016 | EXCLUDE_CONTROLLER_ONLY | Controller live-state maintenance duty |
| OD-20260914-018 | EXCLUDE_CONTROLLER_ONLY | static Controller instruction continuity |
| OD-20260914-025 | EXCLUDE_CONTROLLER_AUDIT_ONLY | audit/Controller worst-finding hard stop |
| OD-20260915-041 | EXCLUDE_CONTROLLER_INTAKE_ONLY | temporary Owner exception classification |
| OD-20260916-044 | EXCLUDE_CONTROLLER_CORRECTION_ONLY | Controller bounded-correction authority |
| OD-20260921-071 | EXCLUDE_CONTROLLER_AUTHORIZATION_ROUTING | Owner authorization handling by Controller |
| OD-20260922-077 | EXCLUDE_CONTROLLER_SUCCESSION_ONLY | Controller chat succession |
| OD-20260922-079 | EXCLUDE_CONTROLLER_RECORD_CLASSIFICATION | Owner-input/canonical-custody rule |
| OD-20260924-080 | EXCLUDE_ROUTE_LOCAL_ONLY | local persistent Writer topology only |
| OD-20260924-081 | INCLUDE_WRITER_GLOBAL | carrier isolation/rebind law affects all Writer execution |
| OD-20260924-082 | EXCLUDE_ROUTE_LOCAL_ONLY | local grouping/audit boundaries |
| OD-20260925-083 | EXCLUDE_ROUTE_LOCAL_ONLY | local push default-deny |
| OD-20260928-085 | EXCLUDE_NON_DURABLE_LINEAGE | reclassified `COMPLETED_TASK_SPECIFIC_NON_DURABLE` under OD-20261002-087; historical serial-topology lineage, not current Writer topology |
| OD-20261002-086 | EXCLUDE_CONTROLLER_CUTOVER_ONLY | future Controller authority/Drive compatibility cutover |
| OD-20261002-087 | INCLUDE_WRITER_TOPOLOGY_GLOBAL | current parallel one-Writer-per-lane topology + value-weighted rules bind every Writer lane |

**Result:** relative to the original 89-row projection, the Writer plane gained `OD-20260924-081` + `OD-20261002-087` and lost the `OD-20260928-085` row (non-durable lineage). This is a semantic applicability correction, not a full live-register copy.
