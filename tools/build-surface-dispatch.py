#!/usr/bin/env python3
"""Build the CEP per-surface Writer dispatch matrix and per-surface Writer packets.

Deterministic generator (Phase 4 of the Master Controller Contract):
  - 1 WRITER -> 1 SURFACE -> 1 VISUAL OWNERSHIP LOOP
  - binds each surface to its visual reference with real sha256 + dimensions
  - emits machine-readable dispatch matrix + one packet per surface unit

Outputs:
  controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json
  controller/09_writer_forge/surface_units/<UNIT>_SURFACE_PACKET.md
"""

from __future__ import annotations

import hashlib
import json
import pathlib
import re
import struct
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
VISUAL = ROOT / "cep-writer" / "references" / "visual"
UNITS_DIR = ROOT / "controller" / "09_writer_forge" / "surface_units"
MATRIX_PATH = ROOT / "controller" / "10_dispatch" / "SURFACE_DISPATCH_MATRIX.json"
STANDARD = "controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md"

WRITER_MODEL = "xiaomi-token-plan-sgp/mimo-v2.6-flash"
CONTROLLER_MODEL = "xiaomi-token-plan-sgp/mimo-v2.6-pro"

# Shared seams. Every one has exactly ONE owning unit; other units request changes
# through tools/writer-serial.sh. This is what makes 23-way parallelism safe.
SHARED_SEAMS = {
    "stack/native-typescript/main.ts": "W01-SHELL",
    "stack/native-typescript/surfaces/m0-controller-composition.ts": "W01-SHELL",
    "stack/native-typescript/foundation/global/shell/navigation.ts": "W01-SHELL",
    "stack/native-typescript/foundation/global/shell/cep-destinations.ts": "W01-SHELL",
    "stack/native-typescript/foundation/global/preferences/schema.ts": "W05-CONFIGURATION",
    "stack/native-typescript/foundation/global/settings/center.ts": "W05-CONFIGURATION",
    "stack/native-typescript/foundation/extensions.css": "W01-SHELL",
    "stack/native-typescript/foundation/workspace.ts": "W01-SHELL",
    "stack/native-typescript/foundation/workspace-host.ts": "W01-SHELL",
    "stack/native-typescript/foundation/global/pane-layout.ts": "W01-SHELL",
    "stack/native-typescript/foundation/global/region-contract.ts": "W01-SHELL",
    "stack/native-typescript/surfaces/composition/w01-w02-rescue.ts": "W01-SHELL",
    "stack/native-typescript/surfaces/composition/w03-rescue.ts": "W03-SCENARIOS",
    "stack/native-typescript/surfaces/composition/w04-rescue.ts": "W04-EVIDENCE",
    "stack/native-typescript/surfaces/composition/w05-rescue.ts": "W05-VALIDATION",
    "dist/index.html": "W01-SHELL",
}

# unit, surface_id, label, workspace, source roots, references, purpose, deps
SURFACES = [
    ("W01-SHELL", "shell", "SHELL", "W01",
     ["stack/native-typescript/surfaces/shell/", "stack/native-typescript/foundation/global/shell/"],
     [], "Global application chrome: navigation, workspace slots, panes, and product identity for every surface.",
     []),
    ("W01-TODAY", "today", "TODAY", "W01",
     ["stack/native-typescript/surfaces/today/", "stack/native-typescript/adapters/today/"],
     ["00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png"],
     "Daily orchestration surface: what needs attention now, and the fastest path into real work.",
     ["W01-SHELL"]),

    ("W02-LIBRARY", "library", "LIBRARY", "W02",
     ["stack/native-typescript/surfaces/library/", "stack/native-typescript/adapters/library-chrome.ts",
      "stack/native-typescript/adapters/library-fixtures.ts"],
     ["01_KNOWLEDGE_AND_LEARNING/01_LIBRARY/CEP_VIS_001_LIBRARY_FINAL_OWNER_CONFIRMED_REFERENCE.png"],
     "Knowledge library: browse, organize, and author the corpus of notes, outlines, and bound domains.",
     ["W01-SHELL"]),
    ("W02-LEARN", "learn", "LEARN", "W02",
     ["stack/native-typescript/surfaces/learn/", "stack/native-typescript/adapters/learn.ts",
      "stack/native-typescript/adapters/context-learn-structured.ts"],
     ["01_KNOWLEDGE_AND_LEARNING/02_LEARN/CEP_VIS_001_LEARN_FINAL_OWNER_CONFIRMED_REFERENCE.png"],
     "Guided learning: progress through structured learning material against the library corpus.",
     ["W01-SHELL", "W02-LIBRARY"]),
    ("W02-VISUALIZE", "visualize", "VISUALIZE", "W02",
     ["stack/native-typescript/surfaces/visualize/", "stack/native-typescript/adapters/visualize/"],
     ["01_KNOWLEDGE_AND_LEARNING/03_VISUALIZE/CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png",
      "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png",
      "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_FOCUSED_GRAPH_RELATIONSHIP_COMPONENT_REFERENCE.png",
      "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_PATH_VIEW_COMPONENT_REFERENCE.png"],
     "VISUALIZE TREE-VIEW: inspect the knowledge graph across tree, canvas, path, and focused-relationship views.",
     ["W01-SHELL", "W02-LIBRARY"]),
    ("W02-RESEARCH-QUALITY", "rq", "RESEARCH-QUALITY", "W02",
     ["stack/native-typescript/surfaces/rq/", "stack/native-typescript/adapters/rq/"],
     ["01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png"],
     "Research and quality: assess research sources, quality signals, and analytical comparison.",
     ["W01-SHELL", "W02-LIBRARY"]),

    ("W03-ENTERPRISE", "enterprise", "ENTERPRISE", "W03",
     ["stack/native-typescript/surfaces/enterprise/", "stack/native-typescript/adapters/enterprise/"],
     ["02_SIMULATION_AND_ENTERPRISE/01_ENTERPRISE_DIGITAL_TWIN/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png",
      "02_SIMULATION_AND_ENTERPRISE/01_ENTERPRISE_DIGITAL_TWIN/Enterprise Cybersecurity Topology Dashboard.png"],
     "Enterprise digital twin: model the organization's topology, assets, and defensive posture.",
     ["W01-SHELL"]),
    ("W03-SCENARIOS", "scenarios", "SCENARIOS", "W03",
     ["stack/native-typescript/surfaces/scenarios/", "stack/native-typescript/adapters/scenarios/"],
     ["02_SIMULATION_AND_ENTERPRISE/02_SCENARIOS/Cybersecurity Scenario Timeline Dashboard(1).png"],
     "Scenario authoring and timeline: compose attack/defense scenarios as time-ordered events.",
     ["W01-SHELL", "W03-ENTERPRISE"]),
    ("W03-LABS", "labs", "LABS", "W03",
     ["stack/native-typescript/surfaces/labs/", "stack/native-typescript/adapters/labs/"],
     ["02_SIMULATION_AND_ENTERPRISE/03_LABS/Cybersecurity Lab Task Graph Dashboard(2).png"],
     "Labs: hands-on task graphs where a learner executes discrete technical tasks in sequence.",
     ["W01-SHELL", "W03-SCENARIOS"]),
    ("W03-RUNS", "runs", "RUNS", "W03",
     ["stack/native-typescript/surfaces/runs/", "stack/native-typescript/adapters/runs/"],
     ["02_SIMULATION_AND_ENTERPRISE/04_RUNS_OPERATIONS/CEP_RUN_PREPARATION_PREFLIGHT_REFERENCE.png",
      "02_SIMULATION_AND_ENTERPRISE/04_RUNS_OPERATIONS/image-gen-1(20260813-230627).png"],
     "Run operations: prepare, preflight, and operate live simulation runs with a terminal and live state.",
     ["W01-SHELL", "W03-SCENARIOS"]),
    ("W03-RESULTS", "results", "RESULTS", "W03",
     ["stack/native-typescript/surfaces/results/", "stack/native-typescript/adapters/results/"],
     ["02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/CEP_RESULTS_AAR_SUPPORTING_MAJOR_STATE_REFERENCE.png",
      "02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/CEP_RESULTS_COMPARE_SUPPORTING_MAJOR_STATE_REFERENCE.png",
      "02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/Cybersecurity Replay Dashboard Timeline.png"],
     "Results, replay, and comparison: review what happened, replay it, and compare runs.",
     ["W01-SHELL", "W03-RUNS"]),

    ("W04-EVIDENCE", "evidence", "EVIDENCE", "W04",
     ["stack/native-typescript/surfaces/evidence/", "stack/native-typescript/adapters/evidence/"],
     ["03_PROGRESS_AND_EVIDENCE/01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png"],
     "Evidence intake: collect, triage, and bind evidence artifacts to their claims.",
     ["W01-SHELL"]),
    ("W04-REVIEWS", "reviews", "REVIEWS", "W04",
     ["stack/native-typescript/surfaces/reviews/", "stack/native-typescript/adapters/reviews/"],
     ["03_PROGRESS_AND_EVIDENCE/02_REVIEWS/Cybersecurity Evidence Review Dashboard.png"],
     "Evidence review: adjudicate submitted evidence and record review decisions.",
     ["W01-SHELL", "W04-EVIDENCE"]),
    ("W04-MASTERY", "mastery", "MASTERY", "W04",
     ["stack/native-typescript/surfaces/mastery/", "stack/native-typescript/adapters/mastery/"],
     ["03_PROGRESS_AND_EVIDENCE/03_MASTERY/Arabic Cybersecurity Mastery Dashboard.png"],
     "Mastery: track demonstrated competency growth across the cybersecurity curriculum.",
     ["W01-SHELL", "W02-LEARN"]),
    ("W04-PORTFOLIO", "portfolio", "PORTFOLIO", "W04",
     ["stack/native-typescript/surfaces/portfolio/", "stack/native-typescript/adapters/portfolio/"],
     ["03_PROGRESS_AND_EVIDENCE/04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png"],
     "Portfolio: assemble a defensible record of demonstrated capability and evidence.",
     ["W01-SHELL", "W04-EVIDENCE"]),

    ("W05-HEALTH", "health", "HEALTH", "W05",
     ["stack/native-typescript/adapters/health-runtime.ts", "stack/native-typescript/surfaces/composition/w05-rescue.ts"],
     ["04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png"],
     "Operational health: diagnose system health and act on inspection/diagnose results.",
     ["W01-SHELL"]),
    ("W05-PROCESSING", "processing", "PROCESSING", "W05",
     ["stack/native-typescript/adapters/processing-runtime.ts", "stack/native-typescript/surfaces/composition/w05-rescue.ts"],
     [],
     "Processing: monitor and control long-running processing work, with retry/cancel and validation handoff.",
     ["W01-SHELL"]),
    ("W05-VALIDATION", "validation", "VALIDATION", "W05",
     ["stack/native-typescript/surfaces/validation/", "stack/native-typescript/adapters/validation.ts"],
     ["04_SYSTEM_AND_OPERATIONS/03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png"],
     "System validation: run validation flows and record validation state truthfully.",
     ["W01-SHELL"]),
    ("W05-MANUAL-AI", "manual_ai", "MANUAL_AI", "W05",
     ["stack/native-typescript/surfaces/manual_ai/", "stack/native-typescript/adapters/manual_ai/"],
     ["04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png"],
     "Manual AI bridge: controlled human-in-the-loop interaction with AI assistance.",
     ["W01-SHELL"]),
    ("W05-BACKUP", "backup", "BACKUP", "W05",
     ["stack/native-typescript/surfaces/backup/", "stack/native-typescript/adapters/backup-runtime.ts"],
     ["04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png"],
     "Backup and restore: protect state and prove restore with restore drills.",
     ["W01-SHELL"]),
    ("W05-AUDIT", "audit", "AUDIT", "W05",
     ["stack/native-typescript/surfaces/audit/", "stack/native-typescript/adapters/audit.ts"],
     ["04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png"],
     "Audit and traceability: immutable record of what happened, by whom, and with what evidence.",
     ["W01-SHELL"]),
    ("W05-RELEASES", "releases", "RELEASES", "W05",
     ["stack/native-typescript/surfaces/releases/", "stack/native-typescript/adapters/releases/"],
     ["04_SYSTEM_AND_OPERATIONS/07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png"],
     "Releases: manage release candidates and their comparison/compare-blocked truth states.",
     ["W01-SHELL"]),
    ("W05-CONFIGURATION", "configuration", "CONFIGURATION", "W05",
     ["stack/native-typescript/surfaces/configuration/", "stack/native-typescript/adapters/configuration/",
      "stack/native-typescript/foundation/global/preferences/", "stack/native-typescript/foundation/global/settings/"],
     ["04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png"],
     "Configuration and settings: user-configurable preferences, including product language and direction.",
     ["W01-SHELL"]),
]

# Classification of record, from cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md
CLASSIFICATION = {
    "00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "01_KNOWLEDGE_AND_LEARNING/01_LIBRARY/CEP_VIS_001_LIBRARY_FINAL_OWNER_CONFIRMED_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "01_KNOWLEDGE_AND_LEARNING/02_LEARN/CEP_VIS_001_LEARN_FINAL_OWNER_CONFIRMED_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "01_KNOWLEDGE_AND_LEARNING/03_VISUALIZE/CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png": "CANDIDATE__AUTHORITY_UNRESOLVED",
    "02_SIMULATION_AND_ENTERPRISE/01_ENTERPRISE_DIGITAL_TWIN/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/01_ENTERPRISE_DIGITAL_TWIN/Enterprise Cybersecurity Topology Dashboard.png": "CURRENT_FINAL_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/02_SCENARIOS/Cybersecurity Scenario Timeline Dashboard(1).png": "CURRENT_FINAL_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/03_LABS/Cybersecurity Lab Task Graph Dashboard(2).png": "CURRENT_FINAL_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/04_RUNS_OPERATIONS/CEP_RUN_PREPARATION_PREFLIGHT_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/04_RUNS_OPERATIONS/image-gen-1(20260813-230627).png": "CURRENT_FINAL_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/CEP_RESULTS_AAR_SUPPORTING_MAJOR_STATE_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/CEP_RESULTS_COMPARE_SUPPORTING_MAJOR_STATE_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE",
    "02_SIMULATION_AND_ENTERPRISE/05_RESULTS_REPLAY/Cybersecurity Replay Dashboard Timeline.png": "CURRENT_FINAL_REFERENCE",
    "03_PROGRESS_AND_EVIDENCE/01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png": "CURRENT_FINAL_REFERENCE",
    "03_PROGRESS_AND_EVIDENCE/02_REVIEWS/Cybersecurity Evidence Review Dashboard.png": "CURRENT_FINAL_REFERENCE",
    "03_PROGRESS_AND_EVIDENCE/03_MASTERY/Arabic Cybersecurity Mastery Dashboard.png": "CURRENT_FINAL_REFERENCE",
    "03_PROGRESS_AND_EVIDENCE/04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png": "CURRENT_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png": "CURRENT_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png": "OWNER_CONFIRMED_FINAL_REFERENCE",
    "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE",
    "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_FOCUSED_GRAPH_RELATIONSHIP_COMPONENT_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE",
    "90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_PATH_VIEW_COMPONENT_REFERENCE.png": "OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE",
}


def png_dims(path: pathlib.Path) -> tuple[int, int]:
    data = path.read_bytes()[:33]
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return (0, 0)
    return struct.unpack(">II", data[16:24])


def ref_record(rel: str) -> dict:
    p = VISUAL / rel
    if not p.exists():
        return {"path": f"cep-writer/references/visual/{rel}", "exists": False}
    b = p.read_bytes()
    w, h = png_dims(p)
    return {
        "path": f"cep-writer/references/visual/{rel}",
        "exists": True,
        "bytes": len(b),
        "sha256": hashlib.sha256(b).hexdigest(),
        "width": w,
        "height": h,
        "classification": CLASSIFICATION.get(rel, "UNCLASSIFIED"),
    }


def main() -> None:
    UNITS_DIR.mkdir(parents=True, exist_ok=True)
    MATRIX_PATH.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    units = []
    for unit, sid, label, ws, roots, refs, purpose, deps in SURFACES:
        owned_seams = sorted(p for p, o in SHARED_SEAMS.items() if o == unit)
        units.append({
            "unit": unit,
            "surface": sid,
            "label": label,
            "workspace": ws,
            "writerModel": WRITER_MODEL,
            "surfacePurpose": purpose,
            "writableRoots": roots,
            "readOnlyRoots": ["controller/", "cep-writer/", "contracts/", "profiles/", "authority/"],
            "references": [ref_record(r) for r in refs],
            "dependencies": deps,
            "ownedSharedSeams": owned_seams,
            "sharedSeamRequests": "tools/writer-serial.sh (serialized slot) for any shared seam not owned here",
        })

    matrix = {
        "schemaVersion": 1,
        "generated": now,
        "generatedBy": "tools/build-surface-dispatch.py",
        "authority": "CURRENT_OWNER_DIRECTIVE (Master Controller Contract)",
        "executionModel": "1 WRITER -> 1 SURFACE -> 1 VISUAL OWNERSHIP LOOP",
        "writerModel": WRITER_MODEL,
        "controllerModel": CONTROLLER_MODEL,
        "inheritedStandard": STANDARD,
        "requiredSkills": [
            "visual-surface-composition",
            "visual-fidelity-review",
            "shared-component-governance",
            "professional-ui-ux-composition",
        ],
        "languagePolicy": {
            "status": "FINAL",
            "languages": ["ar", "en"],
            "activeLanguage": "user-configurable through Settings",
            "permanentProductLanguageAuthority": "NONE",
            "direction": ["rtl", "ltr"],
            "bidi": "required",
        },
        "sharedSeams": [{"path": p, "owner": o} for p, o in sorted(SHARED_SEAMS.items())],
        "parallelism": {
            "strategy": "All 23 surface units run in parallel; shared seams have exactly one owner each and are written through tools/writer-serial.sh.",
            "serializeOnly": sorted(SHARED_SEAMS),
            "waves": {
                "WAVE-1-PARALLEL": [u["unit"] for u in units],
            },
        },
        "units": units,
        "counts": {"units": len(units), "surfaces": len({u['surface'] for u in units})},
    }
    MATRIX_PATH.write_text(json.dumps(matrix, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {MATRIX_PATH.relative_to(ROOT)} ({len(units)} units)")

    for u in units:
        refs_md = "\n".join(
            f"| `{r['path']}` | `{r.get('sha256','—')[:16]}` | {r.get('width','—')}×{r.get('height','—')} | `{r['classification']}` |"
            for r in u["references"]
        ) or "| _(none — reference intentionally not generated; derive from product model + shared mechanics)_ | — | — | `INTENTIONALLY_NOT_GENERATED` |"

        seams_md = "\n".join(f"- `{p}`" for p in u["ownedSharedSeams"]) or "- _(owns no shared seam)_"

        if u["surface"] == "visualize":
            donor_note = (
                "LIBRARY is a permitted structural donor for this surface at the **mechanics** level only "
                "(tree behavior, panel behavior, proven primitives). The correct concept is **VISUALIZE TREE-VIEW** "
                "— never invent \"Visualize Review\". Composition must be adapted to VISUALIZE's actual purpose."
            )
        elif u["surface"] == "learn":
            donor_note = (
                "LIBRARY is a permitted structural donor for this surface at the **mechanics** level only. "
                "Do not import Library's composition."
            )
        else:
            donor_note = (
                "No surface composition may be inherited from another surface. "
                "Compose locally from this surface's purpose and its reference."
            )

        body = f"""# SURFACE WRITER PACKET — {u['label']}

**Unit:** `{u['unit']}` · **Surface:** `{u['surface']}` · **Workspace:** {u['workspace']}
**Class:** `SURFACE_UNIT__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Writer model:** `{WRITER_MODEL}` · **Controller model:** `{CONTROLLER_MODEL}`
**Generated:** {now} · **Inherits:** [`../../09_writer_forge/VISUAL_EXECUTION_STANDARD.md`](../VISUAL_EXECUTION_STANDARD.md)

> **MANDATORY INHERITED STANDARD.** [`VISUAL_EXECUTION_STANDARD.md`](../VISUAL_EXECUTION_STANDARD.md) is binding and overrides any stale wording.
> A visual reference is **CONSTRUCTION AUTHORITY** — never "presentation only". `REFERENCE != BLIND PIXEL COPY`.
> Load the project skills `visual-surface-composition`, `visual-fidelity-review`, `shared-component-governance`, `professional-ui-ux-composition` before working.

---

## 1. SURFACE IDENTITY

| Field | Value |
|---|---|
| SURFACE | `{u['surface']}` |
| OWNER | `{u['unit']}` |
| SURFACE PURPOSE | {u['surfacePurpose']} |

**Answer in your own words before building: "What is this workspace for?"** Then compose around that purpose — its users, tasks, content model, information hierarchy, operational context, local visual identity.

## 2. SURFACE OWNERSHIP

**Writable roots (you may write ONLY these):**
{chr(10).join('- `' + r + '`' for r in u['writableRoots'])}

**Read-only (never write):** `controller/`, `cep-writer/`, `contracts/`, `profiles/`, `authority/`

**Shared seams you own (single-writer; everyone else requests changes):**
{seams_md}

**Any other shared file:** request via `tools/writer-serial.sh` serialized slot. Do not edit directly.

## 3. REFERENCE AUTHORITY + CURRENT AUTHORITY STATUS

| Reference | sha256 (16) | Dims | Classification |
|---|---|---|---|
{refs_md}

Classification of record: `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md`.
Integrity manifest: `cep-writer/REFERENCE_MANIFEST.json`.

{"**AUTHORITY GAP:** this surface's reference is `CANDIDATE__AUTHORITY_UNRESOLVED`. Build to its visual intent, but report the unresolved authority status in every evidence record. Do NOT silently promote it to canonical." if any(r['classification'] == 'CANDIDATE__AUTHORITY_UNRESOLVED' for r in u['references']) else ""}

**Reference-before-code is mandatory.** Identify before building: what the reference is, why it is authoritative, surface identity, major regions, hierarchy, key interactions, intended density, responsive behavior, important visual relationships, what is shared, what is local, what must NOT be copied from another surface.

## 4. PROHIBITED CONCEPTUAL CLONING

**DONOR != DESTINATION TEMPLATE.** Never build "Library renamed for X", "Learn renamed for X", or any conceptual clone.

{donor_note}

## 5. LOCAL COMPOSITION RESPONSIBILITY

Use: **SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION**.

You own: local composition · local information hierarchy · final density · local grouping · local emphasis · inline presentation inside shared components.

The **center is this surface's actual work area**. It must never be generic education content, generic dashboard cards, generic documentation, copied Library structure, copied Learn structure, or a component showcase. Left/right panes carry context meaningful to **this** surface.

## 6. MANDATORY VISUAL LIFECYCLE

REFERENCE → UNDERSTAND → PLAN → BUILD/MODIFY → FUNCTIONAL CHECK → STRUCTURAL CHECK → MATCHED-VIEWPORT RENDER → SCREENSHOT → WHOLE-SCREEN COMPARISON → REGION COMPARISON → PANE COMPARISON → COMPONENT COMPARISON → MICRO-DETAIL INSPECTION → CONTENT/DENSITY COMPARISON → RESPONSIVE COMPARISON → COLLAPSED-STATE COMPARISON (where applicable) → RTL/LTR/BIDI COMPARISON (where applicable) → ARCHITECTURE/SHARED-COMPONENT REVIEW → DEFECT IDENTIFICATION → ROOT-CAUSE ANALYSIS → TARGETED FIX → RE-CAPTURE → RE-COMPARE → REGRESSION CHECK → ACCEPTANCE → EVIDENCE + LINEAGE → CLOSE

Compare at **L1** whole surface · **L2** region/pane · **L3** component · **L4** micro detail. Report `VISUAL_COMPARISON_LEVELS_COMPLETED`. Do not rely on density ratios alone.

## 7. CONTENT / DENSITY

No fake product content to fill space. No meaningful structure left empty. Use realistic structured fixture/state data. Banned: lorem ipsum, filler, repeated fake cards, placeholder text, unexplained empty zones, dead visual regions. **The goal is intentional density.**

## 8. LANGUAGE REQUIREMENTS (FINAL)

Arabic and English are **both first-class**. Active language is **user-configurable through Settings**. There is **no permanent Arabic-first or English-first product authority**. A reference being Arabic/English does **not** make it the product default.

Required: Arabic · English · RTL · LTR · BIDI-safe · localized hierarchy and spacing. Do not bake direction into structure. Isolate technical tokens (`<bdi>`). Report `RTL_LTR_STATUS` after testing both directions.

## 9. RESPONSIVE REQUIREMENTS

Compose deliberately for wide / standard / narrow / compact. Panes collapse deliberately; content reflows rather than truncating unreadably; nothing overlaps; touch targets stay usable. Report `RESPONSIVE_STATUS`; do COLLAPSED-STATE COMPARISON where applicable.

## 10. REQUIRED EVIDENCE + LINEAGE

Bind every capture to candidate · commit/tree · environment · test · viewport · timestamp · **image identity** (path + sha256 + dims). Verify the bytes you analyse are the bytes you claim. Retain and label superseded captures; never reuse stale proof.

## 11. DEFECT GOVERNANCE

Severity `V0`–`V4`. Root cause: `SURFACE_COMPOSITION` · `SHARED_COMPONENT` · `CONTENT_MODEL` · `FIXTURE_DATA` · `RESPONSIVE_RULE` · `ARCHITECTURE` · `OWNER_CONSTRAINT` · `STALE_DECISION` · `IMPLEMENTATION` · `EVIDENCE/ORACLE` · `UNKNOWN`.

Record every loop: **DEFECT → SEVERITY → ROOT CAUSE HYPOTHESIS → CHANGE → EVIDENCE → RE-COMPARISON → ACCEPT / REOPEN**. No blind repair loops. No endless cycles.

## 12. ACCEPTANCE CONDITIONS

Requires ALL: FUNCTION · STRUCTURE · VISUAL FIDELITY · DENSITY · CONTENT COMPLETENESS · RESPONSIVE BEHAVIOR · RTL/LTR/BIDI · REFERENCE CONSISTENCY · ARCHITECTURAL CONSISTENCY · SHARED-COMPONENT APPROPRIATENESS · EVIDENCE LINEAGE.

**You cannot accept your own work.** Status stays `NOT_OWNER_ACCEPTED`. Sole Controller review required.

## 13. ESCALATION

Controller decides anything resolvable from current truth + code + references + requirements + evidence + architecture + UX/UI principles + engineering judgment. Owner escalation ONLY for genuine product intent, policy, authority, irreversible product choice, security/privacy boundary, meaningful unresolved contradiction, or required human visual acceptance.

## 14. DEPENDENCIES

{chr(10).join('- `' + d + '`' for d in u['dependencies']) or '- _(none beyond global shell)_'}

## 15. MANDATORY OUTPUT

Write `writer-output/{u['unit']}/VISUAL_EXECUTION_REPORT.json` with every field of `VISUAL_EXECUTION_STANDARD.md` §12, plus `writer-output/{u['unit']}/HANDOFF.md`.

Vague verdicts are rejected. "Looks good." / "Done." / "Passed." are **not** valid output.
"""
        out = UNITS_DIR / f"{u['unit']}_SURFACE_PACKET.md"
        out.write_text(body, encoding="utf-8")

    print(f"wrote {len(units)} surface packets -> {UNITS_DIR.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
