# ARCHIVE_INVENTORY — Legacy Mimo Claw archive (mimoclaw_workspace.tar.gz)

**Class:** `FORENSIC_EVIDENCE__HISTORICAL_ARCHIVE__NOT_AUTHORITY`
**Produced:** 2026-09-29 by MIMO forensic research worker (NEW CEP Controller lane `controller/03_historical/mimo_archive/`)
**Scope:** download receipt, integrity, extraction stats, tree layout, material classes. Knowledge register lives in `KNOWLEDGE_EXTRACT.md`.
**Provenance convention:** all paths below are **inside the archive** (as stored in the tar). Nothing in this document was taken from any source outside the archive except the explicitly labelled "current-truth" comparisons in `KNOWLEDGE_EXTRACT.md` §CONFLICTS.

---

## 1. Download receipt (sanitized)

Captured from helper `node /tmp/opencode/drive_get.mjs 1B6idqykGzjHLwhQ_cOd6_Lhp3aeUCCdp <outPath>` (the helper prints metadata + digest only; no credential material is reproduced here).

```json
{"ok":true,"id":"1B6idqykGzjHLwhQ_cOd6_Lhp3aeUCCdp","name":"mimoclaw_workspace.tar.gz","mimeType":"application/gzip","driveSize":"607540790","modifiedTime":"2026-09-27T21:14:28.322Z","localPath":"/tmp/opencode/cache/drive/mimoclaw_workspace.tar.gz","localBytes":607540790,"sha256":"e2fefac2fb0d968319cf4a78a0ccb4d386ff8c29b0298fc96285847bd13ecbbb"}
```

| Field | Value |
|---|---|
| Drive file ID | `1B6idqykGzjHLwhQ_cOd6_Lhp3aeUCCdp` |
| Name | `mimoclaw_workspace.tar.gz` |
| Drive size | 607,540,790 bytes |
| Local size (stat + helper) | 607,540,790 bytes — **exact match to the expected size** |
| SHA-256 (helper + independent `sha256sum`) | `e2fefac2fb0d968319cf4a78a0ccb4d386ff8c29b0298fc96285847bd13ecbbb` (both runs agree) |
| Drive modifiedTime | 2026-09-27T21:14:28.322Z |
| Download outcome | `ok:true`, exit 0, stderr empty |

Extraction target: `/tmp/opencode/cache/mimo_archive/` (read-only use). `tar -xzf` exit 0, stderr empty. `tar -tzf` listed **exactly 8,407 entries** (matches the expected entry count).

## 2. Extraction statistics

| Metric | Value |
|---|---|
| Tar entries | 8,407 (6,911 files + 1,496 directories) |
| Total extracted bytes (files) | 1,198,628,859 |
| On-disk du after extraction | ~1.2 GB |

### File-type counts (top of 60 tracked extensions)

| Ext | Files | Ext | Files | Ext | Files |
|---|---|---|---|---|---|
| `.h` | 2,365 | `.json` | 512 | `.py` | 116 |
| `.js` | 1,488 | `.pak` | 446 | `.csv` | 107 |
| `.md` | 339 | `.1` (man) | 299 | `.mjs` | 106 |
| `.ts` | 334 | `(noext)` | 241 | `.hyb` | 104 |
| `.map` | 156 | `.html` | 102 | `.png` | 34 |
| `.txt` | 23 | `.ps1`/`.cmd` | 18/19 | `.sample` | 14 |

Note: the `.h/.js/.pak/.map/.so/.dat` mass and the ~241 extension-less files are **toolchain payloads** (Chromium + headless shell + Node + gh + gog), not CEP knowledge. CEP knowledge lives in `.md/.txt/.csv/.json` under `.openclaw/tmp/cep_mirror/`, `.openclaw/tmp/req/`, `.openclaw/tmp/cep_repo/` and the workspace root files.

## 3. Tree layout

```
mimoclaw_workspace.tar.gz
├── AGENTS.md, SOUL.md, USER.md, IDENTITY.md, TOOLS.md, HEARTBEAT.md,
│   MEMORY.md, CEP_CONTROLLER_BOOT.md        (Mimo Claw agent workspace root, 8 files)
├── memory/2026-09-28.md                     (agent daily note)
└── .openclaw/
    ├── workspace-state.json                 (bootstrap timestamps only)
    └── tmp/
        ├── node2216/            (5,930 entries — Node v22.16.0 linux-x64 toolchain + node.tar.xz)
        ├── cep_repo/            (1,527 entries — full git clone of hamad933/cep-writer-baseline-repo)
        ├── pwbrowser-chrome/    (315 entries — Playwright Chromium)
        ├── pwbrowser-headless/  (290 entries — Chrome Headless Shell)
        ├── gh_2.101.0_linux_amd64/ (236 entries — GitHub CLI)
        ├── cep_mirror/          (64 entries — **Drive governance corpus mirror: THE knowledge core**)
        ├── req/                 (23 entries — Stage-3 hardened Writer mission packets for SHELL + TODAY)
        ├── gog, gog.tar.gz      (Google Drive CLI 0.42.0)
        ├── gh.tar.gz
        ├── surfaces.txt         (23 surface → Drive CSV id map)
        ├── baseline-check.log / baseline-model-tests.log  (repo check/model-test receipts)
        ├── pw-smoke.mjs, proof_home.png
```

Largest files (evidence of what the archive physically is):

| Bytes | Path |
|---|---|
| 278,568,152 | `.openclaw/tmp/pwbrowser-chrome/chrome` |
| 189,181,152 | `.openclaw/tmp/pwbrowser-headless/chrome-headless-shell` |
| 121,509,208 | `.openclaw/tmp/node2216/node-v22.16.0-linux-x64/bin/node` |
| 90,871,373 | `.openclaw/tmp/cep_repo/.git/objects/pack/pack-12fc258e….pack` |
| 44,585,120 / 41,971,872 | `.openclaw/tmp/gog`, `.openclaw/tmp/gh_2.101.0_linux_amd64/bin/gh` |
| 12,946,310 | `.openclaw/tmp/cep_mirror/corpus/STAGE2_OBLIGATIONS_MASTER.csv` |
| 2,316,044 | `.openclaw/tmp/cep_mirror/corpus/STAGE2_SOURCE_VALUE_CROSSWALK.csv` |

## 4. Classes of material present

1. **Agent operating memory (root files)** — `AGENTS.md`, `SOUL.md`, `MEMORY.md`, `TOOLS.md`, `CEP_CONTROLLER_BOOT.md`, `memory/2026-09-28.md`: the legacy Controller's own standing instructions, long-term memory, environment facts and setup history.
2. **Live governance mirror** — `.openclaw/tmp/cep_mirror/{READ_FIRST.md, CURRENT_STATE.md (867 KB), CONTROLLER_GOVERNANCE.md (185 KB), OWNER_DECISION_LIVE_REGISTER.csv (111 rows), CONTROLLER_SUCCESSION_HANDOFF.md, LIVE_AUTHORITY_SNAPSHOT.md, EXECUTION_CARRIER_ROUTE_AUTHORITY.txt, MATERIALIZATION_AND_VERIFIER_PAYLOAD.json, HELPER_*_HANDOFF.md, HELPER_*_MANIFEST.csv, CURRENT_RESULT_RETAIN_REJECT_MAP.csv, REGISTER_REREAD.csv, CURRENT_STATE_REREAD*.md}`. This is the deepest governance/Owner-decision/rationale corpus in the archive.
3. **Zero-loss requirement corpus** — `.openclaw/tmp/cep_mirror/corpus/`: `STAGE2_OBLIGATIONS_MASTER.csv` (8,651 rows), `STAGE2_SOURCE_VALUE_CROSSWALK.csv` (3,497 rows), `STAGE2_OWNER_APPLICABILITY.csv` (102 rows), `STAGE2_MANIFEST.json` (sha256 per file), 23 × `SURFACE_<S>__ZERO_LOSS_OBLIGATIONS.csv`, `OWNER_ENHANCEMENT_QA_BACKLOG.md`, `ZL01_LOST_UNDERREPRESENTED_VALUE.csv` (69 rows), `DURABLE_MICRO_VALUE_LEDGER.csv` (735 rows), `ZL02_CONTROLLER_RECONCILIATION.txt`, `ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt`, `A01/A02/A03` product models, `23_SURFACE_IDENTITY_MATRIX.md`, `FINAL_VISUAL_REFERENCE_REGISTER.md`, `CEP_VIS_001.md`, `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md`, `CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md`, `CURRENT_RESULT_AUDIT.txt`, `CEP_LIVE_GOVERNANCE_MANIFEST.json`, `CONTROLLER_LIVE_READ_SET.json`.
4. **Stage-3 Writer mission packets (M1-ready)** — `.openclaw/tmp/req/{global,shell,today,stage2}/`: `MISSION.md`, `ZERO_LOSS_OBLIGATION_MATRIX.csv`, `ACCEPTANCE_AND_FALSIFICATION_MATRIX.csv`, `APPLICABLE_OWNER_DECISIONS.csv`, `CURRENT_RESULT_RETAIN_REJECT_MAP.csv`, `SURFACE_PROFILE_AND_DOMAIN_CONTRACT.json`, `VISUAL_REFERENCE_AND_MAJOR_STATE_MATRIX.csv`, plus global `CEP-VIS-001` and `VISUAL_REFERENCE_REGISTER`.
5. **Historical product repository clone** — `.openclaw/tmp/cep_repo/` (git clone incl. `.git` pack of 90 MB): `cep-writer/*` Writer authority docs, `writer/*` templates, `authority/*`, `assurance/*` receipts, `stack/native-typescript/*` product source + rescue tests, `tools/*` (40+ proof/check scripts), `M0_A1_A5_FINDING_DISPOSITION.csv` (116 rows), `TASK_A_*_LEDGER.json`, `docs/history/*`.
6. **Execution receipts** — `baseline-check.log`, `baseline-model-tests.log` (PASS tails incl. `w03.semantic_review_318` and `w3e.ui-scale-*` model tests), `proof_home.png`.
7. **Toolchain/browser payloads** — Node 22.16.0, Chromium, Chrome Headless Shell, gh 2.101.0, gog 0.42.0 (byte payload only; no knowledge; not mined).

## 5. Integrity / custody notes

- The helper and an independent `sha256sum` agree on the digest; size equals the Drive-reported size byte-for-byte.
- The archive is a workspace snapshot dated **2026-09-27 21:14Z** (Drive modifiedTime), containing mirrors written 2026-09-27 19:36–21:08 and agent notes up to 2026-09-28. It therefore captures the legacy controller's state **immediately before the ROUTE-MIMO-AGENT rebind** (the rebind entry `EXECUTION CARRIER REBIND — ROUTE-MIMO-AGENT` is the last-but-one entry inside `CURRENT_STATE.md`).
- No file in `/workspaces/cep-writer-baseline-repo` was modified except files created under `controller/03_historical/mimo_archive/`.
- No secret/token/credential value is printed anywhere in these deliverables. The archive contains a note that a service-account key once transited chat and that a keyring env file exists (`memory/2026-09-28.md`); those facts are recorded as operational lessons only, with **no values reproduced**.

## 6. What was NOT readable / only partially read (honesty record)

| Source | Status | Reason |
|---|---|---|
| `.openclaw/tmp/cep_mirror/corpus/STAGE2_OBLIGATIONS_MASTER.csv` (8,651 rows, 12.9 MB) | schema + counts sampled, NOT row-ingested | size; per-surface CSVs + ZL02 give the same schema and representative rows |
| 23 × `SURFACE_*__ZERO_LOSS_OBLIGATIONS.csv` | row counts + schema verified per surface; rows not read individually | 13 MB total; contents are structured per the recorded schema |
| `DURABLE_MICRO_VALUE_LEDGER.csv` (735 rows) | header + sample rows only | size |
| `ZL01_LOST_UNDERREPRESENTED_VALUE.csv` (69 rows) | header + sample only | not fully row-read |
| `CURRENT_STATE.md` (867,161 B / 27,063 lines) | structure + ~120 representative entries read (incl. all 2026-09-26→09-28 tail entries in full) | single-line mega-entries; sampled, not line-by-line |
| `CONTROLLER_GOVERNANCE.md` (185,036 B) | all 670 non-blank lines mapped; §§7–8.2, 9–17.3, 19–22 read in full; §§0–6, 18 read via headings + referenced hard stops | sparse file (long blank runs); partial by design |
| `A02_SIMULATION_ENTERPRISE_PRODUCT_MODEL.md` (67 KB) / `A03_…` (58 KB) | headers + architecture summaries read | body depth beyond W03/W04 model summary not fully read |
| `ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt` (37 KB) | purpose/source/adjudication head read | full donor-rule body partially read |
| `CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` (24 KB) | section map + xterm/OD-049 supersession read | §§9–13 (SQLite schema/backup/AI-bridge) skimmed only |
| `HELPER_B_MANIFEST.csv` / `HELPER_D_MANIFEST.csv` | referenced via handoffs; not parsed row-by-row | moderate value vs. handoff summaries |
| `.openclaw/tmp/cep_repo/**` (1,527 entries) | docs + targeted greps + selected source files read | full product source not audited (out of scope: this is product code, not archive knowledge) |
| `baseline-check.log` / `baseline-model-tests.log` (63/81 KB) | tails + representative PASS records read | full logs not read |
| `STAGE2_OWNER_APPLICABILITY.csv` (102 rows) | schema + count read | rows not fully read (subset of the 111-row register, already read in full) |
