# 00_bootstrap / credentials_status

Timestamp: 2026-09-29T01:20-01:22Z · Status: **PASS** (all four GDRIVE secrets + MiMo key present; no value ever printed)

## Presence / structure only (values never read into output)

| Variable | Present | Non-empty | Length (chars) | Structure validation |
|---|---|---|---|---|
| `GDRIVE_SA_JSON_B64` | yes | yes | 3180 | base64 decodes to valid JSON; keys: auth_provider_x509_cert_url, auth_uri, client_email, client_id, client_x509_cert_url, private_key, private_key_id, project_id, token_uri, type, universe_domain; `type=service_account`; `private_key` present; client_email domain `cep-project-506915.iam.gserviceaccount.com` (non-sensitive identity hint) |
| `GDRIVE_USER_CLIENT_ID` | yes | yes | 72 | shape consistent with an OAuth client id |
| `GDRIVE_USER_CLIENT_SECRET` | yes | yes | 35 | shape consistent with an OAuth client secret |
| `GDRIVE_USER_REFRESH_TOKEN` | yes | yes | 103 | shape consistent with a Google refresh token |
| `MIMO_API_KEY` | yes | yes | 51 | bearer credential; used only in Authorization header, never printed |

## Secret-handling controls observed

- No `env` / `process.env` dump performed. Only named `test -n` / length probes.
- Probe scripts live in `/tmp/opencode/` (outside the repository) and print sanitized fields only;
  token strings are redacted in any error body.
- No credential value is present in this control tree, in the repository, or in any artifact.
- Rule applied: STOP the mission before any step that would require exposing a credential
  (mission section 35, hard stop #1). No such step was executed.

## Classification vocabulary used below (mission section 15)

Credential facts are `CURRENT_VALIDATED`. The Route B defect (see `drive_status.md`) is
`CURRENT_VALIDATED` as a defect and `HISTORICALLY_USEFUL` because the successor archive's
conflict C-5 recorded the same defect before this Controller existed.
