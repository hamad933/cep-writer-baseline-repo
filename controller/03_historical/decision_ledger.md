# 03_historical / decision_ledger (B-1 COMPLETE)

Source: `STAGE2_OWNER_APPLICABILITY.csv` (102 rows; Drive id in `corpus/manifest.json`) + the 1,700
`OWNER_DECISION`-layer obligation rows in `requirement_ledger.csv`. Row level preserved in
`decision_ledger.csv`. The Drive `OWNER_DECISION_LIVE_REGISTER.csv` (111 rows) is the authority
source; the 102-row applicability set is its Stage-2 projection (count drift = historical conflict C-4,
now explained: register includes non-applicable/retired rows; projection filters to applicable).

## Classification summary
{'CURRENT_OWNER_DIRECTIVE': 102}

## Reading rules (adopted)
- `CURRENT_OWNER_DIRECTIVE` rows bind Writer packets: their obligations must appear in the packet's
  acceptance matrix or carry `NOT_APPLICABLE_JUSTIFIED`.
- Rows carrying `supersedes` content remain valuable history: rationale preserved, law superseded.
- `applies_to` is the applicability authority; never drop an ACTIVE row silently.

## Per-workspace decision obligation load
- **W01**: 147 decision-derived obligations of 711 total
- **W02**: 296 decision-derived obligations of 1485 total
- **W03**: 385 decision-derived obligations of 2183 total
- **W04**: 291 decision-derived obligations of 1445 total
- **W05**: 581 decision-derived obligations of 2827 total
