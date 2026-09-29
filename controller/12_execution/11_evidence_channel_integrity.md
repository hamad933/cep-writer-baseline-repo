# 12_execution / 11_evidence_channel_integrity — EVIDENCE/ORACLE quarantine advisory

Timestamp: 2026-09-29T06:55Z · Class: **EVIDENCE / ORACLE** · Raised by: three independent visual auditors (W01, W03, W04/W05)

## 1. What was observed

The agent image-render channel (`read` on a PNG) is **not reliable** for acceptance evidence.

| # | Observation | Source |
|---|---|---|
| E1 | The two surfaces' pictures were served **swapped against their filenames** — OCR of the file *bytes* disagreed with the rendered view | W01 auditor |
| E2 | Two reads of the **same composite** returned a **stale, different image** | W01, W04 auditors |
| E3 | Reading the same PNG twice returned **different pictures** (1–3 call lag) | W03, W04 auditors |
| E4 | The harness **misattached a few images** mid-audit | W05 auditor |

## 2. Why this matters

`cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` §2 states: *"A PNG/WebM
existing on disk is not visual acceptance. Material screenshots must be **opened and inspected**."*
If the inspection channel can swap or desynchronise an image, a visual acceptance built on it is
**not reproducible** — a LINEAGE-class failure in the evidence chain, not a product defect.

This directly threatens **C03-GATE-020** (Owner matched-viewport image inspection), which is the
remaining blocker on three W01 rows. Presenting Owner inspection through a channel that can swap
images would make the inspection worthless.

## 3. Mitigation already applied (and why the collected findings remain usable)

Every auditor independently converged on the same defence, so the findings stand:

- **Ground truth = file bytes.** OCR, SHA-256, image dimensions and perceptual hashing read directly
  from the file, never from the render channel.
- **Self-identifying composites.** Filenames burned into each composite so an image proves its own
  identity (W04's method).
- **Render channel used only where it agreed** with byte-level evidence (W03's method).
- **Triple-checked** visual claims against hashes and pixel fingerprints (W05's method).

Therefore: findings labelled as anchored on OCR/hash/dimensions are **trustworthy**. Any finding that
would rest on the render channel alone was logged as `EVIDENCE/ORACLE` rather than asserted.

## 4. Advisory

1. **Quarantine the render channel as an acceptance oracle** until it is deterministic. It may still be
   used for orientation, never as sole proof.
2. For **C03-GATE-020 Owner image inspection**, present **self-identifying composites** (filename +
  surface + viewport + candidate burned in) plus a hash manifest, not raw files through the channel.
3. Keep the byte-level method as the standing rule for all remaining comparison loops (R2/R6 captures
   and R3/R7 recomparisons).
4. Route a harness fix to the **Coordinator/harness owner** — this is `EVIDENCE/ORACLE`, not a product
   defect, and must not be "repaired" in product code.

## 5. Affected evidence

None invalidated. All collected visual evidence was produced with the byte-level method. Four
`revalidation_status` entries are marked `DEFECTS_ROUTED_AWAITING_FIX`; none is marked
`VISUAL_PASS` on render-channel evidence alone.
