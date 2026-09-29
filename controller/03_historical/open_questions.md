# 03_historical / EXPLICIT_OPEN_QUESTIONS (carried forward — no silent decisions)

Source: Mimo archive deep-mine (stream A) + `cep_building_mgm` mining (stream B). These questions are
**not decided** by the Controller. Each maps to exactly one Writer packet; the packet's conflict rule
(§17: old-source conflict → STOP → REPORT) covers them at execution time.

| ID | Open question | Workspace | Current state | Smallest closure step |
|---|---|---|---|---|
| Q-1 | Shell destination count (final count) | W01 | `destinationCountFrozen=false`; five-destination functional baseline preserved | Owner decision (C03-GATE-023 is Owner-authority-only) |
| Q-2 | Today provider owner | W01 | not adjudicated in any current registry | Owner/Controller ownership decision + registry row |
| Q-3 | RQ visual ceiling (`REVIEWED_FINAL_CANDIDATE`) | W02 | ceiling claim unresolved | Owner decision on visual reference authority |
| Q-4 | TimelineReplayOwner retain-vs-retire | W03 | owner exists in code (1 instance), absent from registries | Owner/registry decision |
| Q-5 | Portfolio grouping authority | W04 | grouping authority unresolved | Owner decision |
| Q-6 | Manual-AI provenance mechanism | W05 | AI Bridge ceilings enforced (`hiddenProviderCalls:0`), provenance mechanism unspecified | Owner decision on provenance recording |

Standing rule (adopted in all five packets): a Writer encountering any of these questions **stops and
reports**; it does not pick an answer. Historical answers, where they exist, are provenance only.
