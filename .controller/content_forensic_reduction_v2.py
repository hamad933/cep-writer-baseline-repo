#!/usr/bin/env python3
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(".")
BASE_COMMIT = "16aafaec71706ebbb13b002395f72383b2e77a81"
BASE_TREE = "c4d18db3b7e086bee92de188df1320d631fca7c2"
PRODUCT_SHA = "480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641"
PRODUCT_FILES = 273
OUT = ROOT / "controller-candidate-v2"
CROSS = ROOT / "docs/history/CONTENT_FORENSIC_DISPOSITION_V2.json"

ACTIVE_ASSURANCE = {
    "assurance/AUTHORITY_BEFORE_AFTER_REGISTER.json",
    "assurance/BROWSER_CONFORMANCE_RECEIPT.json",
    "assurance/CONTRACT_TEST_RESULTS.json",
    "assurance/CURRENT_AUTHORITY_ISOLATION_RECEIPT.json",
    "assurance/DEFERRED_BOUNDARY_GUARD.json",
    "assurance/DEFERRED_WORK_LEDGER.json",
    "assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json",
    "assurance/DUPLICATE_MECHANIC_SCAN.json",
    "assurance/E18_ANALYTICAL_COMPARE_CONTROLLER_ACCEPTANCE.json",
    "assurance/HIGH_VALUE_DEFERRED_LEDGER.json",
    "assurance/MODEL_TEST_RESULTS.json",
    "assurance/SCREENSHOT_MANIFEST.json",
    "assurance/VS05_READ_MODE_COMMAND_MATRIX.json",
    "assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json",
    "assurance/W03_SEMANTIC_OWNER_VALIDATION.json",
    "assurance/W6_CONTROLLER_FINAL_ACCEPTANCE.json",
    "assurance/WORK_RESUME_TASK_CLASSIFICATION.json",
    "assurance/WRITER_SCAFFOLD_TEST_RESULTS.json",
}

ACTIVE_AUTHORITY = {
    "authority/CURRENT_AUTHORITY_REGISTRY.json",
    "authority/CURRENT_FOUNDATION_AUTHORITY_INTAKE_POLICY.json",
    "authority/FINAL_GATE_PARENT_AUTHORITY.json",
    "authority/W03_69_318_REQUIREMENT_REUSE_DISPOSITION.json",
    "authority/W03_V34_TARGETED_INTAKE.json",
    "authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json",
    "authority/controller/07_W03_69_REQUIREMENT_REUSE_MAP.csv",
    "authority/controller/08_DONOR_330_FOUNDATION_EXTRACTION_MAP.csv",
    "authority/controller/10_NEW_ABSTRACTION_ADMISSION_REGISTER.csv",
    "authority/controller/12_ADMITTED_HIGH_VALUE_WORK_TASKS.csv",
    "authority/controller/13_HIGH_VALUE_DEFERRED_WORK.csv",
    "authority/controller/14_DROPPED_SUPERSEDED_LOW_VALUE_ITEMS.csv",
    "authority/controller/15_TEST_AND_VISUAL_EVIDENCE_MATRIX.csv",
    "authority/controller/16_WORK_CHECKPOINT_DELTA_MAP.csv",
    "authority/controller/17_MASTER_WORK_RESUME_DELTA.md",
    "authority/controller/CONTROLLER_INPUT_IDENTITY.json",
    "authority/controller/CONTROLLER_PACKAGE_ORIGINAL_INPUT_IDENTITY.json",
}

def sh(*args):
    return subprocess.check_output(args, text=True).strip()

def sha256_size(path):
    data = pathlib.Path(path).read_bytes()
    return hashlib.sha256(data).hexdigest(), len(data)

def git_blob_map():
    out = {}
    for line in sh("git", "ls-files", "-s").splitlines():
        mode, sha, stage, path = line.split(None, 3)
        out[path] = {"gitBlobSha": sha, "gitMode": mode}
    return out

OUT.mkdir(parents=True, exist_ok=True)
blobs = git_blob_map()
tracked = sh("git", "ls-files").splitlines()
target = [p for p in tracked if p.startswith(("assurance/", "writer-output/", "authority/", "archaeology/"))]
items = []
to_remove = []

for path in target:
    digest, size = sha256_size(path)
    if path.startswith("assurance/"):
        if path in ACTIVE_ASSURANCE:
            disposition = "KEEP_TEST_RUNTIME_DEPENDENCY"
            reason = "Direct active package build/test/check/scaffold/browser validation dependency."
        else:
            disposition = "ARCHIVE_GIT_HISTORY"
            reason = "Historical/generated assurance output with no direct active package-command dependency; not Product authority and not a governed current Writer Presentation reference."
            to_remove.append(path)
    elif path.startswith("writer-output/"):
        disposition = "ARCHIVE_GIT_HISTORY"
        reason = "Mission-bounded historical candidate/checkpoint handoff; actual content is CANDIDATE_ONLY, NOT_ACCEPTED, or CHECKPOINT_ONLY and has no active package dependency."
        to_remove.append(path)
    elif path.startswith("archaeology/"):
        disposition = "KEEP_REUSABLE_DONOR_EVIDENCE"
        reason = "Accepted Library donor/reuse census or extraction custody; current contract validation consumes the donor census."
    else:
        if path in ACTIVE_AUTHORITY:
            disposition = "KEEP_TEST_RUNTIME_DEPENDENCY"
            reason = "Direct or dynamically verified current authority input to active package checks."
        else:
            disposition = "KEEP_CURRENT"
            reason = "Retained authority/intake/traceability source corpus until a separate source-to-registry zero-loss compaction proof establishes a safe smaller representation."
    items.append({
        "path": path,
        "bytes": size,
        "sha256": digest,
        "disposition": disposition,
        "reason": reason,
        **blobs.get(path, {}),
    })

stale_writer_manifest = "cep-writer/controller-input/SCREENSHOT_MANIFEST.json"
if pathlib.Path(stale_writer_manifest).is_file():
    digest, size = sha256_size(stale_writer_manifest)
    items.append({
        "path": stale_writer_manifest,
        "bytes": size,
        "sha256": digest,
        "disposition": "ARCHIVE_GIT_HISTORY",
        "reason": "Stale in-memory R6 evidence projection bound to old candidate 5205d2.../272; governed Presentation inputs are under cep-writer/references/visual and current open findings/gates are projected separately.",
        **blobs.get(stale_writer_manifest, {}),
    })
    to_remove.append(stale_writer_manifest)

for path in sorted(set(to_remove)):
    pathlib.Path(path).unlink()

screenshot_manifest = {
    "schemaVersion": 3,
    "classification": "HISTORICAL_VISUAL_PRESENTATION_EVIDENCE_ARCHIVED__CURRENT_GENUINE_ROUTE_OPEN",
    "sourceArchiveCommit": BASE_COMMIT,
    "sourceArchiveTree": BASE_TREE,
    "archiveDispositionIndex": "docs/history/CONTENT_FORENSIC_DISPOSITION_V2.json",
    "count": 0,
    "screenshots": [],
    "currentGate": "C03-GATE-022 GENUINE_BROWSER_SOURCE_RECEIPT OPEN",
    "truthCeiling": "Archived historical/in-memory screenshots are provenance only and MUST NOT satisfy current genuine-route visual/browser proof.",
}
(ROOT / "assurance/SCREENSHOT_MANIFEST.json").write_text(
    json.dumps(screenshot_manifest, indent=2) + "\n", encoding="utf-8"
)

summary = {}
for row in items:
    group = summary.setdefault(row["disposition"], {"files": 0, "bytes": 0})
    group["files"] += 1
    group["bytes"] += row["bytes"]

report = {
    "schemaVersion": 1,
    "classification": "CONTENT_FORENSIC_DISPOSITION_V2__CANDIDATE_ONLY__NO_PRODUCT_ACCEPTANCE",
    "repository": "hamad933/cep-writer-baseline-repo",
    "sourceCommit": BASE_COMMIT,
    "sourceTree": BASE_TREE,
    "productSourceRequired": {"sha256": PRODUCT_SHA, "files": PRODUCT_FILES},
    "custodyLaw": "ARCHIVE_GIT_HISTORY removes bytes from current tip only. No history rewrite, purge, or force-push. Exact source Git blob SHA, SHA-256 and byte count are retained here.",
    "scope": {
        "primary": ["assurance/**", "writer-output/**", "authority/**", "archaeology/**"],
        "additional": [stale_writer_manifest],
    },
    "summary": summary,
    "items": items,
}
CROSS.parent.mkdir(parents=True, exist_ok=True)
CROSS.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

nm_path = ROOT / "cep-writer/NORMALIZATION_MANIFEST.json"
nm = json.loads(nm_path.read_text(encoding="utf-8"))
nm["schemaVersion"] = 3
nm["classification"] = "WRITER_COMPLETE_MAIN_NORMALIZATION__STAGE2_CONTENT_FORENSIC_REDUCTION_CANDIDATE"
nm["stage2ContentForensicReduction"] = {
    "sourceCommit": BASE_COMMIT,
    "sourceTree": BASE_TREE,
    "crosswalk": "docs/history/CONTENT_FORENSIC_DISPOSITION_V2.json",
    "historicalGeneratedEvidencePolicy": "ARCHIVE_GIT_HISTORY",
    "writerOutputPolicy": "ARCHIVE_GIT_HISTORY",
    "authorityPolicy": "KEEP_CURRENT_UNTIL_SOURCE_TO_REGISTRY_COMPACTION_PROVEN",
    "archaeologyPolicy": "KEEP_REUSABLE_DONOR_EVIDENCE",
    "r6EvidenceCorrection": "Old 5205d2/272 in-memory screenshot binaries are archived; C03-GATE-022 remains OPEN and is not converted to PASS.",
    "productMutation": False,
}
nm_path.write_text(json.dumps(nm, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

history_path = ROOT / "docs/history/HISTORICAL_LINEAGE_INDEX.md"
history = history_path.read_text(encoding="utf-8")
if "## Stage-2 content-forensic reduction" not in history:
    history += (
        "\n## Stage-2 content-forensic reduction\n\n"
        "Source current-tip before reduction: " + BASE_COMMIT + " / tree " + BASE_TREE + ".\n\n"
        "- Historical/generated assurance artifacts without active package-command dependency are archived from current tip and remain recoverable from Git history.\n"
        "- writer-output candidate/checkpoint handoffs are archived to Git history.\n"
        "- The stale cep-writer/controller-input screenshot evidence projection is archived; governed Presentation inputs under cep-writer/references/visual remain untouched.\n"
        "- archaeology remains reusable accepted-donor evidence.\n"
        "- authority remains retained until source-to-registry zero-loss compaction is independently proven.\n"
        "- C03-GATE-022 remains OPEN; historical screenshots never become current genuine-route proof.\n"
        "- Machine-readable disposition/custody: docs/history/CONTENT_FORENSIC_DISPOSITION_V2.json.\n"
    )
    history_path.write_text(history, encoding="utf-8")

readme_path = ROOT / "README.md"
readme = readme_path.read_text(encoding="utf-8")
readme = readme.replace(
    "\`writer-output/\` — historical / mission-bounded Writer handoffs pending zero-loss archival review.\n",
    "",
)
readme = readme.replace(
    "\`assurance/\` — verification receipts. Presence of a receipt does not create Product acceptance.",
    "\`assurance/\` — current validation/check inputs retained after Stage-2 content-forensic reduction; historical/generated evidence remains recoverable from Git history and never creates Product acceptance.",
)
readme_path.write_text(readme, encoding="utf-8")

writer_manifest_path = ROOT / "cep-writer/WRITER_INPUT_MANIFEST.json"
writer_manifest = json.loads(writer_manifest_path.read_text(encoding="utf-8"))
new_entries = []
for entry in writer_manifest["entries"]:
    path = entry["path"]
    file_path = ROOT / path
    if not file_path.is_file():
        continue
    digest, size = sha256_size(file_path)
    new_entries.append({"path": path, "size": size, "sha256": digest})
writer_manifest["schemaVersion"] = 13
writer_manifest["classification"] = "CURRENT_WORKING_BASELINE_REQUIRED_INPUT_MANIFEST__STAGE2_CONTENT_FORENSIC_REDUCTION_CANDIDATE__NOT_LIVE_AUTHORITY"
writer_manifest["assurancePolicy"] = "STAGE2_KEEP_ACTIVE_PACKAGE_CHECK_RUNTIME_INPUTS__ARCHIVE_HISTORICAL_GENERATED_EVIDENCE_IN_GIT_HISTORY"
writer_manifest["entries"] = new_entries
writer_manifest_path.write_text(json.dumps(writer_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

removed = [p for p in tracked if not pathlib.Path(p).exists()]
(OUT / "DELETION_ALLOWLIST.txt").write_text("\n".join(sorted(removed)) + "\n", encoding="utf-8")
(OUT / "DISPOSITION_SUMMARY.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
(OUT / "SOURCE_PARENT.json").write_text(json.dumps({"commit": BASE_COMMIT, "tree": BASE_TREE}, indent=2) + "\n", encoding="utf-8")
