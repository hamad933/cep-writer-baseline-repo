# 00_bootstrap / drive_status

Timestamp: 2026-09-29T01:20-01:23Z · Mode: **READ-ONLY** · Status: **PASS_WITH_LIMITATION**

## Authentication routes tested (mission section 8)

| Route | Structure | Token exchange | Authenticated read | Result |
|---|---|---|---|---|
| A. Service account (`GDRIVE_SA_JSON_B64`) | ok | HTTP 200 | `drive/v3/about` 200; `files.list` 200; exact `files.get` 200 | **SUCCESS** |
| B. User OAuth refresh (`GDRIVE_USER_CLIENT_*` + refresh token) | ok | HTTP 400 `invalid_grant` | not reached | **FAIL** |

- Route A non-sensitive identity: `j***@cep-project-506915.iam.gserviceaccount.com`.
- Route A scope used: `drive.readonly` (smallest practical read scope).
- Route B error classification: `CREDENTIAL_REVOKED_OR_EXPIRED` (`invalid_grant`).
- Historical cross-check: the successor archive's conflict register records the identical defect
  as open item **C-5** ("Google Drive user-OAuth refresh defect vs working session OAuth",
  non-blocking). Independent live reproduction ⇒ `CURRENT_VALIDATED`, confidence HIGH.
- Limitation accepted: single usable auth route (A). No redundancy if the service account is
  rotated or disabled.

## Real Drive reads performed (mission wave 0.15)

- `files.list` root-level enumeration: **100 items visible** in the first page (full corpus is larger).
- Exact metadata lookup of the legacy archive id `1B6idqykGzjHLwhQ_cOd6_Lhp3aeUCCdp`:
  `mimoclaw_workspace.tar.gz`, `application/gzip`, **607,540,790 bytes**, modified
  2026-09-27T21:14:28Z, `md5Checksum` present.
- Folder discovery: `cep_building_mgm` = folder `1mt_0MSzAiy81czOEcM2xsVr1suiRsibv` (11 direct
  children indexed); `00_CONTROLLER` = folder `17ZPHL_sc0cqTcHA92hNQyL-Tqy1UPOdL` (57 direct
  children indexed); `mimo_folder` = `1NRb_ICY5u3uCFl89bxmoBLd6j8jhk4kH`.
- Text retrieval: `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` (12,563 bytes) read and
  cached at `/tmp/opencode/cache/drive/` (Controller cache; no secrets).

## Cache policy applied (mission section 10)

The 607 MB legacy archive was **not** downloaded in this pass: metadata-first policy, and its
content is already summarized by the successor archive's forensic indexes. Deterministic cache
root for this Controller: `/tmp/opencode/cache/drive/` (relocatable to
`<controller-root>/cache/drive/` once a persistent Controller root is chosen). No credentials are
stored in the cache.

## Sanitization

All output passes through a redactor (`ya29.*`, `Bearer *`, `1//*` → `[REDACTED]`). No token,
secret, or Authorization value appears in this tree or in any report.
