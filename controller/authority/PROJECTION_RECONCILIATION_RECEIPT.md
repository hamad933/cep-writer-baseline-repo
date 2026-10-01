# PROJECTION RECONCILIATION RECEIPT

**Projection payload commit:** `4c9f41b5df3c7536f38e258f0b7085b3fb731028`  
**Tree:** `011660a0fa218f55acf15f53217f85d6977e8ec3`

## SurfaceProfiles
- 23/23 root→Writer profile blob equality: **PASS**.
- Evidence writer blob: `c96b2aea408016116887a34b376cc5d1d093de70` = root `c96b2aea408016116887a34b376cc5d1d093de70`.
- Reviews writer blob: `aea63f4a8885476336ae74da649553b6c8d55002` = root `aea63f4a8885476336ae74da649553b6c8d55002`.

## Writer Owner-decision projection
- projected rows: **91**.
- `OD-20260924-081`: PRESENT.
- `OD-20260928-085`: PRESENT.
- Controller-only / ROUTE-LOCAL-only missing live rows remain deliberately excluded per `controller/authority/WRITER_OWNER_DECISION_APPLICABILITY.md`.
- Full canonical register remains Controller-plane material; Writer projection is derived input only.

No Product source changed. This receipt verifies the payload commit; the later verification-record commit may advance branch HEAD without invalidating the payload identity.
