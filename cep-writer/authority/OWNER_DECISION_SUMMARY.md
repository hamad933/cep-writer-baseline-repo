# CEP Writer Owner-Decision Projection

Classification: `CURRENT_WRITER_RELEVANT_OWNER_DECISION_SUPERSET__NOT_LIVE_REGISTER__NOT_CONTROLLER_AUTHORITY`

Canonical live register remains Google Drive ID `1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh`.

At generation:
- live register rows: 105
- current rows: 98 = 96 ACTIVE + 2 ACTIVE_PLATFORM_GATED
- Writer/Product/Surface projection rows: 89
- Controller-only rows intentionally omitted: 9

This file is a self-contained Writer execution projection, not a second control plane. A mission overlay must identify the exact subset applicable to that mission. If the Controller declares this projection stale, Writer execution stops until refreshed.

Important current laws include:
- OD-20260921-062 lean self-contained Writer repository
- OD-20260921-066 mission-bound candidate branch workflow
- OD-20260921-067 Writer-complete main + mission overlay
- OD-20260922-072 visual capture separation/recovery method
- OD-20260922-073 local-first evidence throughput
- OD-20260922-074/075 capsule initialization/fallback method
- OD-20260922-076 verified incremental continuation

OD-20260922-079 is intentionally not copied as a Writer-applicable decision row because its `applies_to` is Controller-only. Its consequence is enforced here structurally: GitHub projections never become independent Controller authority.
