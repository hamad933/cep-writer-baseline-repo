# CLOSURE-T3 EVIDENCE INDEX

Generated for the T3 checkpoint (R-02 + R-04 + R-05). All files in this directory unless noted.
Receipts are `CANDIDATE_ONLY__NOT_OWNER_ACCEPTANCE`.

## Censuses (R-02)
| File | What |
|---|---|
| `EN_CENSUS_BEFORE.json` | 23-route EN live census pre-fix (807 visible Arabic entries; durable BEFORE mutation) |
| `EN_CENSUS_AFTER.json` | intermediate post-fix census (superseded by FINAL; kept for lineage) |
| `EN_CENSUS_FINAL.json` | final 23-route EN census on the checkpoint tree (713 visible; 0 in-scope) |
| `AR_CENSUS_SANITY.json` | 6-route AR census via the product Settings path (682 visible, lang=ar — AR intact) |
| `IN_SCOPE_FIXLIST.json` | before-census → writable-file fix list (44 texts / 16+ lines) |
| `CENSUS_CLASSIFICATION_RECEIPT.json` | final classification: 0 in-scope, 522 static→R-03/T6, 8 proven cross-file collisions w/ cited emitters, 183 other-ts/composed origins (file-pinned) |
| `INJECTION_CENSUS.json` | falsification: injected raw Arabic token detected by the census (method proof; injection reverted) |
| `en-ar-census.mjs` | the census harness (env: CENSUS_OUT, CENSUS_SURFACES, CENSUS_LOCALE=ar) |

## Probes (R-02 behavior + R-05)
| File | What |
|---|---|
| `T3_PROBE_RECEIPT.json` | 11/11: HS-REL-1-03 live flip (no reload), D-04 unit+DOM, D-06 unit+DOM, D-08 unit+DOM, F-SH1-02 real dblclick@1024, B-4 out-of-root trace, spatial diff no-baked-direction |
| `t3-probes.mjs` | probe harness |
| `flip-after.png` | shelf/pane state after locale flip |
| `d08-ar.png` | readout mirrored under AR |
| `fsh102-composer.png` | relation composer opened by real pointer dblclick at 1024×900 |

## R-04 / R-05 harness re-runs (copied from lane harnesses with path fixes; originals untouched)
| File | What |
|---|---|
| `res1-falsification.mjs` + stdout in session | 7/7 — N1-N3 refusals, L1 replay canonical-hash, L2 owner single-instance, L3 no review authority, L4 injected compare owner |
| `vis1-falsify.mjs` → `FALSIFICATION_RECEIPT.json` | 16/16 — canonical store sha256 identical across canvas ops (`db2be05e…`) |
| `res1-capture.mjs` → `evidence/*.png` + `CAPTURE_RECEIPT.json` | 20 hash-bound captures: studio result/replay/aar/compare + live results × {ar,en} × {1440×1000,1024×900} |
| `w03-browser-flows.mjs` → `BROWSER_RECEIPT.json` | 7/7 flows incl. results-aar-compare + replay-causality-timeline-scrub (hermetic: screenshots redirected here) |
| `sh2-smoke.json` | sh2 geometry smoke 23 routes × bands × locales (99 boots; console=/v1 responder absent = identical to SH-1 sealed BEFORE/AFTER) |

## Static proofs
| File | What |
|---|---|
| `STATIC_GREP_PROOFS.txt` | no baked dir in hosts; zero added observers; only direction:inherit added in spatial (token-level ltr carries explained); diff scope; CRLF integrity; touched-line language rule |

## Narrative
| File | What |
|---|---|
| `HANDOFF.md` | four truths + defect-by-defect closure + out-of-origin routing + unresolved items |

## Baselines referenced (other lanes' sealed evidence — not modified)
- D-04/D-08 before: `writer-output/W03-ENTERPRISE/evidence/shared-hotspot-probes.json` (commit `766ab95`)
- D-06 before: `writer-output/W02-VISUALIZE/HANDOFF.md` (fitSpatialLabels interim + shared-request note)
- F-SH1-02 before: `writer-output/W01-SHELL/evidence/after/manifest.json` (dispatched-dblclick route + interception record)
- SH-R1/SH-R2 scope: `writer-output/W03-RESULTS/SERIALIZED_HOTSPOT_REQUEST.md`
- HS-REL-1 scope: `writer-output/W05-RELEASES/SERIALIZED_HOTSPOT_REQUEST.md`
