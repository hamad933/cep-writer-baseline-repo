# 05_foundation / donor_crosswalk_map

Timestamp: 2026-09-29T02:15Z · Sources: `donor_crosswalk.csv` (3,497 rows, preserved), `archaeology/*` donor census, capability matrix.

## What the crosswalk is

`STAGE2_SOURCE_VALUE_CROSSWALK.csv` maps **raw source value → current surface/component state**:
`raw_id, raw_class, source_lane, source_file_id, source_file_name, source_row_or_finding,
target_surfaces, component, state, truth_dimension, exact_value, positive_test, negative_test,
currentness, disposition, current_route, notes`. Every row is a preserved source→target binding
(exact_value retained — zero-loss law).

## Source lanes (provenance families)

| Lane | Rows | Origin file family | Meaning |
|---|---|---|---|
| C03 | 718 | `C03_SURFACE_COMPONENT_READINESS.csv` | post-C03 component readiness |
| A03 | 368 | `A03_COMPONENT_STATE_CENSUS.csv` | component-state census |
| A16 | 252 | A16 census | late census wave |
| A01 | 238 | `A01_SOURCE_AUTHORITY_INVENTORY.csv` + census | source authority inventory |
| A14 | 201 | A14 census + `A14_EVIDENCE_AND_FALSIFICATION_MATRIX.csv` | evidence/falsification |
| A06/A04/A13/A12/A15/A11/A05 | 1,081 | component-state censuses | per-wave census |
| (ZL01 value rows) | 69 | `04_LOST_OR_UNDERREPRESENTED_VALUE.csv` | lost/underrepresented value recovery |

Raw classes: `ZL01_ATOMIC` 1,975 · `ZL01_DURABLE_ANCILLARY` 735 · `C03_COMPONENT_READINESS` 718 ·
`ZL01_FORWARD_GAP` 69.

## Disposition state (what still needs work)

`CURRENTLY_EXPLICIT_AND_COMPLETE` 1,001 · `CLEAN_OR_BOUNDED…NO_FINDING_REQUIRED` 350 ·
`CURRENTLY_ROUTED_BUT_MISSION_UNDERSPECIFIED` **303 (gap: mission specification debt)** ·
`CURRENTLY_ROUTED_AND_SUFFICIENT` 292 · `LINKED_COMPONENT_STATE__EXACT_FINDING_RELATION` 173 ·
`CURRENTLY_PRESENT_BUT_UNDERREPRESENTED` **171 (value debt)** · `EVIDENCE_ONLY_NOT_PRODUCT_DEFECT` 126 ·
`EXPLICIT_OPEN_COMPONENT_STATE` 122 · `HISTORICAL_ONLY_NOT_CURRENT` 33 · misc 116.

## Target distribution → workspace routing

- **992 rows target ALL 23 surfaces** (global foundation value) → owner: foundation/shared (single owner required — see `shared_ownership_map.md`).
- Largest single-surface concentrations: runs 223, evidence 160, processing 121, today 113, manual_ai 97, visualize 94, results 93, validation 84, library 79, health 76.
- Multi-surface clusters: `results;runs` 104 (W03), `evidence;mastery;portfolio;reviews` 91 (W04), `enterprise;labs;results;runs;scenarios;visualize` 85 (W03+W02 spatial), `audit;backup;configuration;releases` 42 (W05B lane), `labs;learn;library;scenarios` 76 (W03+W02).

## Primary donors / accepted references (provenance preserved)

| Donor | Evidence | Use |
|---|---|---|
| **Library Editor v1.2.17** | Owner decision `OWNER-20260910-003` ("currently accepted executable design donor"); `ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt` (226 KB); `archaeology/ACCEPTED_LIBRARY_330_FUNCTION_COVERAGE.csv` (330 functions) + `ACCEPTED_LIBRARY_DOM_CSS_EVENT_COVERAGE.csv` + `ACCEPTED_LIBRARY_FULL_MECHANIC_CENSUS.{csv,json}` | reusable structured/editor primitives (Owner-006) |
| Spatial engine + domain adapters | Owner-007 ("one reusable engine with domain adapters for Visualize/W03/eligible") | W02/W03 spatial mechanics |
| Blueprint material (Visualize/W03/other) | Owner-004: **requirement/value/evidence inputs only** until explicitly admitted | never direct implementation |
| `archaeology/DONOR_PRESERVE_IMPROVE_REJECT_REGISTER.csv` | donor disposition register | donor admission control |
| `EXTRACTION_RECEIPT.json` (archaeology) | extraction provenance | audit trail |

## Crosswalk rules adopted for Writer packets

1. A crosswalk row routed to a workspace is a **requirement candidate**, not a defect mandate
   (`EVIDENCE_ONLY_NOT_PRODUCT_DEFECT` rows must stay evidence-only).
2. `CURRENTLY_ROUTED_BUT_MISSION_UNDERSPECIFIED` (303) and `CURRENTLY_PRESENT_BUT_UNDERREPRESENTED`
   (171) are the known value-debt classes — each must land in exactly one packet's scope or carry an
   explicit deferral disposition (zero-loss law).
3. Donor reuse is governed by Owner-003/005/006/007: maximize executable reuse via foundation +
   family engines; donor code never overrides current contracts.
